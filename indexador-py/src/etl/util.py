from src.etl.data_types import Place
import geohash

def parse_point(point: str) -> tuple[float, float]:
    # Parse this kind of text to lat, lng POINT(-74.0575685 4.6573304)
    point = point.strip()
    if point.startswith("POINT(") and point.endswith(")"):
        coords = point[6:-1].split()
        lng, lat = map(float, coords)
        return lat, lng
    raise ValueError(f"Invalid point format: {point}")


def bounding_box(geo_hash: str) -> tuple[float, float, float, float]:
    bbox = geohash.bbox(geo_hash)
    lat_min = bbox['s']
    lat_max = bbox['n']
    lon_min = bbox['w']
    lon_max = bbox['e']
    return lat_min, lat_max, lon_min, lon_max

