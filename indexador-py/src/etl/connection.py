import os
import logging
from typing import Optional, Any
import asyncpg

logger = logging.getLogger(__name__)

class DatabaseClient:
    _instance: Optional["DatabaseClient"] = None

    def __init__(self):
        self._async_pools: dict[str, asyncpg.Pool] = {}

    @classmethod
    def instance(cls) -> "DatabaseClient":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _get_config(self, name: str) -> dict:
        prefix = name.upper()
        return {
            "host": os.getenv(f"{prefix}_DB_HOST"),
            "port": os.getenv(f"{prefix}_DB_PORT"),
            "user": os.getenv(f"{prefix}_DB_USER"),
            "password": os.getenv(f"{prefix}_DB_PASSWORD"),
            "database": os.getenv(f"{prefix}_DB_NAME"),
        }

    async def _get_async_pool(self, name: str) -> asyncpg.Pool:
        if name not in self._async_pools:
            config = self._get_config(name)
            min_size = int(os.getenv(f"{name}_DB_POOL_MIN", 1))
            max_size = int(os.getenv(f"{name}_DB_POOL_MAX", 5))
            self._async_pools[name] = await asyncpg.create_pool(min_size=min_size, max_size=max_size, **config)
        return self._async_pools[name]

    async def execute_async_select(self, name: str, query: str) -> list[dict[str, Any]]:
        pool = await self._get_async_pool(name)
        async with pool.acquire() as conn:
            try:
                rows = await conn.fetch(query)
                return [{k: row[k] for k in row.keys()} for row in rows]
            except Exception as e:
                logger.exception(f"Async SELECT failed: {query}")
                raise e

    async def execute_async_select_one(self, name: str, query: str) -> Optional[dict[str, Any]]:
        rows = await self.execute_async_select(name, query)
        return rows[0] if rows else None

    async def execute_async_insert(self, name: str, query: str, values=None) -> str:
        pool = await self._get_async_pool(name)
        async with pool.acquire() as conn:
            try:
                if values:
                    result = await conn.execute(query, *values)
                else:
                    result = await conn.execute(query)
                return result
            except Exception as e:
                logger.exception(f"Async INSERT failed: {query}")
                raise e

    async def execute_async_update(self, name: str, query: str, values=None) -> str:
        return await self.execute_async_insert(name, query, values)

    async def close_all_pools(self):
        for name, pool in self._async_pools.items():
            await pool.close()
        self._async_pools.clear()
