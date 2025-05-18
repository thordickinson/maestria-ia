import geohash
import logging
from src.etl.region_service import get_region_info

logger = logging.getLogger(__name__)

# Geohash base32 character set (defines possible children)
GEOHASH_CHARS = "0123456789bcdefghjkmnpqrstuvwxyz"
SERVICE_TYPES: list[str] = ["education", "healthcare", "retail_access", 
                            "dining_and_entertainment", "accommodation", 
                            "parks_and_recreation", "infrastructure_services", 
                            "cultural_amenities"]


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


def __process_geohash(geohash: str):
    logger.info(f"Processing geohash {geohash}")
    lat, lng = __geohash_center(geohash)
    region_info = get_region_info(lat, lng)
    pass

def process_geohashes(geohashes: list[str], level: int):
    __iterate_geohashes(geohashes, level, __process_geohash)
    pass
