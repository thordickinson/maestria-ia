import os
from typing import Optional, Any
from psycopg2 import pool

def __get_config(prefix: str) -> dict:
    config = {
        "host": os.getenv(f"{prefix}_DB_HOST"),
        "port": os.getenv(f"{prefix}_DB_PORT"),
        "user": os.getenv(f"{prefix}_DB_USER"),
        "password": os.getenv(f"{prefix}_DB_PASSWORD"),
        "dbname": os.getenv(f"{prefix}_DB_NAME"),
    }
    return config

__pool_cache: dict[str, pool.SimpleConnectionPool] = {}

def get_pool(name: str) -> pool.SimpleConnectionPool:
    global __pool_cache
    name = name.upper()
    if name not in __pool_cache:
        config = __get_config(name)
        minconn = int(os.getenv(f"{name}_DB_POOL_MIN", 1))
        maxconn = int(os.getenv(f"{name}_DB_POOL_MAX", 5))
        __pool_cache[name] = pool.SimpleConnectionPool(minconn, maxconn, **config)
    return __pool_cache[name]

def execute_select_one(connection_name: str, query: str) -> Optional[dict[str, Any]]:
    result = execute_select(connection_name, query)
    return None if len(result) == 0 else result[0]

def execute_select(connection_name: str, query: str) -> list[dict[str, Any]]:
    """
    Executes a SELECT query and returns a list of model_cls instances.
    model_cls should be a subclass of pydantic.BaseModel.
    """
    conn_pool = get_pool(connection_name)
    conn = None
    try:
        conn = conn_pool.getconn()
        with conn.cursor() as cur:
            cur.execute(query)
            if not cur.description:
                return []
            columns = [desc[0] for desc in cur.description]
            rows = cur.fetchall()
            return [dict(zip(columns, row)) for row in rows]
    except Exception as e:
        raise e
    finally:
        if conn:
            conn_pool.putconn(conn)

def execute_select_model(connection_name: str, query: str, model_cls):
    rows = execute_select(connection_name, query)
    return [model_cls(**row) for row in rows]


def execute_insert(connection_name: str, query: str, values=None):
    """
    Executes an INSERT (or other data-modifying) query and commits the transaction.
    Optionally accepts values for parameterized queries.
    Returns the number of affected rows.
    """
    conn_pool = get_pool(connection_name)
    conn = None
    try:
        conn = conn_pool.getconn()
        with conn.cursor() as cur:
            if values:
                cur.execute(query, values)
            else:
                cur.execute(query)
            affected = cur.rowcount
            conn.commit()
            return affected
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn_pool.putconn(conn)