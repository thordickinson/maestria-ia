import geohash
import time
import logging
import itertools
from src.etl.data_types import Place
from src.etl.open_data import get_region_info, get_transport_places, get_cadastral_and_commercial_values_by_geohash
from src.etl.osm import get_osm_nearby_places
from src.etl.connection import execute_select_one, execute_update
from pydantic import BaseModel
from functools import lru_cache
from json import dumps
import math
import numpy as np

logger = logging.getLogger(__name__)

# Geohash base32 character set (defines possible children)
GEOHASH_CHARS = "0123456789bcdefghjkmnpqrstuvwxyz"
OSM_PLACE_TYPES: list[str] = ["education", "healthcare", "retail_access", 
                            "dining_and_entertainment", "accommodation", 
                            "parks_and_recreation", "infrastructure_services", 
                            "cultural_amenities"]
PLACE_SEARCH_RADIUS_METERS = [100, 300, 500, 1000, 2000]
__schema_initialized = False


def pydantic_encoder(obj):
    if isinstance(obj, BaseModel):
        return obj.dict()  # o .model_dump()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

class Point(BaseModel):
    lat: float
    lng: float

class GeohashStats(BaseModel):
    geohash: str
    center: Point
    region_info: dict
    nearby_places: dict[str, dict[str, list[Place]]]
    valuation: dict[str, float]
    calculation_time_seconds: float


def __geohash_center(geo_hash: str) -> tuple[float, float]:
    decoded = geohash.decode(geo_hash)
    return (decoded[0], decoded[1])

def __iterate_geohashes(base_geohashes, target_level, process_callback):
    """
    Recursively expand geohashes to a desired precision level and apply a callback.

    Parameters:
    - base_geohashes (list[str]): Initial geohashes (e.g., ["abc", "def"]).
    - target_level (int): Desired geohash length (e.g., 7).
    - process_callback (Callable[[str], None]): Function to process each full-resolution geohash.
    """
    def recurse(current_hash):
        if len(current_hash) == target_level:
            process_callback(current_hash)
        else:
            for c in GEOHASH_CHARS:
                recurse(current_hash + c)

    for g in base_geohashes:
        if len(g) > target_level:
            raise ValueError(f"Geohash '{g}' is already longer than target level {target_level}")
        recurse(g)

# Simple in-memory cache with LRU eviction
@lru_cache(maxsize=1024)
def _memory_cache(geo_hash: str) -> GeohashStats | None:
    # This function is just a placeholder for the LRU cache mechanism.
    # The actual logic is handled in get_geohash_stats.
    return None

def _fetch_from_db(geo_hash: str) -> GeohashStats | None:
    sql = f"SELECT * FROM geohash_stats WHERE geohash = '{geo_hash}'"
    result = execute_select_one("POSTGIS", sql)
    if result is None:
        return None
    center = Point(lat=result["lat"], lng=result["lng"])
    return GeohashStats(geohash=result["geohash"], 
                        center=center, 
                        region_info=result["region_info"],
                        nearby_places=result["nearby_places"],
                        valuation=result["valuation"],
                        calculation_time_seconds=result["calculation_time_seconds"])

def __create_table():
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
    execute_update("POSTGIS", create_table_sql)

def __initialize_schema():
    global __schema_initialized
    if __schema_initialized:
        return
    __create_table()
    __schema_initialized = True


def drop_nans(target: dict) -> dict:
    """
    Remove NaN values from a dictionary.
    """
    return {k: v for k, v in target.items() if v is not None and v != {} and not math.isnan(v) and not np.isnan(v)}

def _save_to_db(geo_hash: str, stats: GeohashStats):
    insert_sql = f"""
    INSERT INTO geohash_stats (
        geohash, lat, lng, region_info, nearby_places, valuation, calculation_time_seconds
    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT (geohash) DO UPDATE SET
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        region_info = EXCLUDED.region_info,
        nearby_places = EXCLUDED.nearby_places,
        valuation = EXCLUDED.valuation,
        calculation_time_seconds = EXCLUDED.calculation_time_seconds;
    """
    execute_update("POSTGIS", insert_sql ,(geo_hash, stats.center.lat, stats.center.lng,
        dumps(stats.region_info, default=pydantic_encoder, allow_nan=True),
        dumps(stats.nearby_places, default=pydantic_encoder, allow_nan=True),
        dumps(drop_nans(stats.valuation), default=pydantic_encoder, allow_nan=True),
        stats.calculation_time_seconds
    ))

def get_stats(lat: float, lng: float) -> GeohashStats:
    geo_hash = geohash.encode(lat, lng, precision=7)
    return __get_geohash_stats(geo_hash)

def __get_geohash_stats(geo_hash: str) -> GeohashStats:
    __initialize_schema()
    # 1. Check in-memory cache
    cached = _memory_cache(geo_hash)
    if cached:
        return cached

    # 2. Check in Postgres
    stats = _fetch_from_db(geo_hash)
    if stats:
        _memory_cache.cache_clear()  # Optionally clear cache to avoid staleness
        _memory_cache(geo_hash)  # Populate cache
        return stats

    # 3. Compute and persist
    stats = __process_geohash(geo_hash)
    _save_to_db(geo_hash, stats)
    _memory_cache.cache_clear()
    _memory_cache(geo_hash)
    return stats

def __process_geohash(geo_hash: str) -> GeohashStats:
    logger.info(f"Processing geohash {geo_hash}")
    start = time.perf_counter()
    lat, lng = __geohash_center(geo_hash)
    region_info = get_region_info(lat, lng)
    valuation = get_cadastral_and_commercial_values_by_geohash(geo_hash)
    nearby_places: dict[str, dict[str, list[Place]]] = {}
    for radius in PLACE_SEARCH_RADIUS_METERS:
        transport = get_transport_places(lat, lng, radius)
        places = get_osm_nearby_places(lat, lng, radius, OSM_PLACE_TYPES)
        all_places = itertools.chain(transport, places)
        grouped_places: dict[str, list[Place]] = {}
        for place in all_places:
            place_type = place.type
            if place_type not in grouped_places:
                grouped_places[place_type] = []
            grouped_places[place_type].append(place)
        nearby_places[f"{radius}m"] = grouped_places
    end = time.perf_counter()
    calculation_time = end - start
    logger.info(f"Tiempo de ejecución: {calculation_time:.4f} segundos")
    return GeohashStats(geohash=geo_hash, 
                        center=Point(lat=lat, lng=lng), 
                        region_info=region_info, 
                        nearby_places=nearby_places,
                        valuation=valuation,
                        calculation_time_seconds=calculation_time
                        )




def process_geohashes(geohashes: list[str], level: int):
    __iterate_geohashes(geohashes, level, __get_geohash_stats)
    pass
