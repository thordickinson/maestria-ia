import json
from typing import Any, Awaitable
import geohash
import time
import logging
import itertools
from src.etl.util import serialize_pydantic
from src.etl.data_types import Place
from src.etl.open_data import get_region_info, get_transport_places, get_cadastral_and_commercial_values_by_geohash
from src.etl.osm import get_osm_nearby_places
from src.etl.connection import DatabaseClient
from pydantic import BaseModel
from functools import lru_cache
import math
import numpy as np

logger = logging.getLogger(__name__)
db = DatabaseClient.instance()

GEOHASH_CHARS = "0123456789bcdefghjkmnpqrstuvwxyz"
OSM_PLACE_TYPES: list[str] = [
    "education", "healthcare", "retail_access", 
    "dining_and_entertainment", "accommodation", 
    "parks_and_recreation", "infrastructure_services", 
    "cultural_amenities"
]
PLACE_SEARCH_RADIUS_METERS = [100, 300, 500, 1000, 2000]
__schema_initialized = False

class Point(BaseModel):
    lat: float
    lng: float

class GeohashStats(BaseModel):
    geohash: str
    center: Point
    region_info: dict
    nearby_places: dict
    valuation: dict[str, float]
    calculation_time_seconds: float

def pydantic_encoder(obj):
    if isinstance(obj, BaseModel):
        return obj.model_dump_json()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

def __geohash_center(geo_hash: str) -> tuple[float, float]:
    [lat, lng] = geohash.decode(geo_hash)
    return lat, lng

async def __iterate_geohashes(base_geohashes, target_level, process_callback):
    async def recurse(current_hash):
        if len(current_hash) == target_level:
            await process_callback(current_hash)
        else:
            for c in GEOHASH_CHARS:
                await recurse(current_hash + c)

    for g in base_geohashes:
        if len(g) > target_level:
            raise ValueError(f"Geohash '{g}' is already longer than target level {target_level}")
        await recurse(g)

@lru_cache(maxsize=1024)
def _memory_cache(geo_hash: str) -> GeohashStats | None:
    return None

def ensure_dict(val: Any) -> dict:
    if isinstance(val, str):
        return json.loads(val)
    return val

async def _fetch_from_db(geo_hash: str) -> GeohashStats | None:
    sql = f"SELECT * FROM geohash_stats WHERE geohash = '{geo_hash}'"
    result = await db.execute_async_select_one("POSTGIS", sql)
    if result is None:
        return None
    center = Point(lat=result["lat"], lng=result["lng"])
    return GeohashStats(
        geohash=result["geohash"],
        center=center,
        region_info=ensure_dict(result["region_info"]),
        nearby_places=ensure_dict(result["nearby_places"]),
        valuation=ensure_dict(result["valuation"]),
        calculation_time_seconds=result["calculation_time_seconds"]
    )

async def __create_table():
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS geohash_stats (
        geohash VARCHAR(16) PRIMARY KEY,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        region_info JSONB,
        nearby_places JSONB,
        valuation JSONB,
        calculation_time_seconds DOUBLE PRECISION
    );
    """
    await db.execute_async_update("POSTGIS", create_table_sql)

async def __initialize_schema():
    global __schema_initialized
    if __schema_initialized:
        return
    await __create_table()
    __schema_initialized = True

def drop_nans(target: dict) -> dict:
    return {
        k: v for k, v in target.items()
        if v is not None and v != {} and not math.isnan(v) and not np.isnan(v)
    }

async def _save_to_db(geo_hash: str, stats: GeohashStats):
    insert_sql = """
    INSERT INTO geohash_stats (
        geohash, lat, lng, region_info, nearby_places, valuation, calculation_time_seconds
    ) VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7)
    ON CONFLICT (geohash) DO UPDATE SET
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        region_info = EXCLUDED.region_info,
        nearby_places = EXCLUDED.nearby_places,
        valuation = EXCLUDED.valuation,
        calculation_time_seconds = EXCLUDED.calculation_time_seconds;
    """
    await db.execute_async_update("POSTGIS", insert_sql, (
        geo_hash,
        stats.center.lat,
        stats.center.lng,
        json.dumps(serialize_pydantic(stats.region_info), ensure_ascii=False),
        json.dumps(serialize_pydantic(stats.nearby_places), ensure_ascii=False),
        json.dumps(serialize_pydantic(drop_nans(stats.valuation)), ensure_ascii=False),
        stats.calculation_time_seconds
    ))

async def get_point_stats(lat: float, lng: float) -> GeohashStats:
    geo_hash = geohash.encode(lat, lng, precision=7)
    result = await __get_geohash_stats(geo_hash)
    return  result

async def __get_geohash_stats(geo_hash: str) -> GeohashStats:
    await __initialize_schema()

    cached = _memory_cache(geo_hash)
    if cached:
        return cached

    stats = await _fetch_from_db(geo_hash)
    if stats:
        _memory_cache.cache_clear()
        _memory_cache(geo_hash)
        return stats

    stats = await __process_geohash(geo_hash)
    await _save_to_db(geo_hash, stats)
    _memory_cache.cache_clear()
    _memory_cache(geo_hash)
    return stats

async def __process_geohash(geo_hash: str) -> GeohashStats:
    logger.info(f"Processing geohash {geo_hash}")
    start = time.perf_counter()
    lat, lng = __geohash_center(geo_hash)
    region_info = await get_region_info(lat, lng)
    valuation = await get_cadastral_and_commercial_values_by_geohash(geo_hash)
    nearby_places: dict[str, dict[str, list[Place]]] = {}

    for radius in PLACE_SEARCH_RADIUS_METERS:
        transport = await get_transport_places(lat, lng, radius)
        places = await get_osm_nearby_places(lat, lng, radius, OSM_PLACE_TYPES)
        all_places = itertools.chain(transport, places)
        grouped_places: dict[str, list[Place]] = {}
        for place in all_places:
            grouped_places.setdefault(place.type, []).append(place)
        nearby_places[f"{radius}m"] = grouped_places

    calculation_time = time.perf_counter() - start
    logger.info(f"Tiempo de ejecuci\u00f3n: {calculation_time:.4f} segundos")
    return GeohashStats(
        geohash=geo_hash,
        center=Point(lat=lat, lng=lng),
        region_info=region_info,
        nearby_places=nearby_places,
        valuation=valuation,
        calculation_time_seconds=calculation_time
    )

async def process_geohashes(geohashes: list[str], level: int):
    await __iterate_geohashes(geohashes, level, __get_geohash_stats)
