from src.etl.data_types import Place

def parse_point(point: str) -> tuple[float, float]:
    # Parse this kind of text to lat, lng POINT(-74.0575685 4.6573304)
    point = point.strip()
    if point.startswith("POINT(") and point.endswith(")"):
        coords = point[6:-1].split()
        lng, lat = map(float, coords)
        return lat, lng
    raise ValueError(f"Invalid point format: {point}")

def parse_place(row: dict, place_type: str):
    lat, lng = parse_point(row['location'])
    return Place(name=row['name'], lat=lat, lng=lng, type=place_type)
