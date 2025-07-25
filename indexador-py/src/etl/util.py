import json
from pydantic import BaseModel
from src.etl.data_types import Place
import geohash
from typing import Any
import math
import numpy as np

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


def serialize_pydantic(obj):
    if isinstance(obj, BaseModel):
        return obj.model_dump()
    elif isinstance(obj, dict):
        return {k: serialize_pydantic(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_pydantic(item) for item in obj]
    else:
        return obj



def ensure_dict(val: Any) -> dict:
    if isinstance(val, str):
        return json.loads(val)
    return val

def drop_nans(target: dict) -> dict:
    return {
        k: v for k, v in target.items()
        if v is not None and v != {} and not math.isnan(v) and not np.isnan(v)
    }
