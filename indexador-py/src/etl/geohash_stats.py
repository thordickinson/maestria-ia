import geohash
import time
import logging
import itertools
from src.etl.data_types import Place
from src.etl.open_data import get_region_info, get_transport_places, get_cadastral_and_commercial_values_by_geohash
from src.etl.osm import get_osm_nearby_places

logger = logging.getLogger(__name__)

# Geohash base32 character set (defines possible children)
GEOHASH_CHARS = "0123456789bcdefghjkmnpqrstuvwxyz"
OSM_PLACE_TYPES: list[str] = ["education", "healthcare", "retail_access", 
                            "dining_and_entertainment", "accommodation", 
                            "parks_and_recreation", "infrastructure_services", 
                            "cultural_amenities"]
PLACE_SEARCH_RADIUS_METERS = [100, 300, 500, 1000, 2000]


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


def __process_geohash(geo_hash: str):
    logger.info(f"Processing geohash {geo_hash}")
    start = time.perf_counter()
    lat, lng = __geohash_center(geo_hash)
    region_info = get_region_info(lat, lng)
    valuation = get_cadastral_and_commercial_values_by_geohash(geo_hash)
    nearby_places = {}
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
        nearby_places[f"radius"] = grouped_places
    end = time.perf_counter()
    logger.info(f"Tiempo de ejecución: {end - start:.4f} segundos")
    return {"geohash": geo_hash, "region_info": region_info, "valuation": valuation, "nearby_places": nearby_places }

def process_geohashes(geohashes: list[str], level: int):
    __iterate_geohashes(geohashes, level, __process_geohash)
    pass
