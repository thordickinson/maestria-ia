import json
import math
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from collections import defaultdict

import polars as pl


def load_mongo_json_to_polars(
    file_path: str,
    column_types: Dict[str, type[pl.DataType]]
) -> pl.DataFrame:
    """
    Loads a MongoDB-exported JSON file into a Polars DataFrame using a strict schema.
    Separates BSON parsing from type enforcement.

    Parameters:
    - file_path: Path to the JSON file (array of Mongo-style documents)
    - column_types: Dict[column_name, pl.DataType]

    Returns:
    - pl.DataFrame
    """

    def parse_mongo_bson(val):
        """Parses a raw MongoDB BSON value into a native Python type."""
        if isinstance(val, dict):
            if '$oid' in val:
                return val['$oid']
            elif '$date' in val:
                try:
                    return datetime.fromisoformat(val['$date'].replace('Z', '+00:00'))
                except:
                    return None
            elif '$numberDouble' in val:
                try:
                    return float(val['$numberDouble'])
                except:
                    return float('nan')
        return val

    def get_missing_value(dtype: type[pl.DataType]):
        if dtype in (pl.Float32, pl.Float64):
            return float('nan')
        return None

    def coerce_to_type(value, expected_type: type[pl.DataType]):
        """Casts value to the type specified in the schema."""
        if value is None:
            return get_missing_value(expected_type)

        try:
            if expected_type == pl.String:
                return str(value)
            elif expected_type in (pl.Int8, pl.Int16, pl.Int32, pl.Int64):
                return int(value)
            elif expected_type in (pl.Float32, pl.Float64):
                return float(value)
            elif expected_type == pl.Boolean:
                return bool(value)
            elif expected_type == pl.Datetime:
                if isinstance(value, datetime):
                    return value
                else:
                    return None
        except:
            return get_missing_value(expected_type)

        return value

    def normalize_obj(obj):
        result = {}
        for key, expected_type in column_types.items():
            raw_val = obj.get(key, None)
            parsed_val = parse_mongo_bson(raw_val)
            coerced_val = coerce_to_type(parsed_val, expected_type)
            result[key] = coerced_val
        return result

    path = Path(file_path)
    with open(path, encoding='utf-8') as f:
        raw_data = json.load(f)

    normalized_data = [normalize_obj(item) for item in raw_data]

    # Convert to columnar format
    columns = defaultdict(list)
    for row in normalized_data:
        for key, value in row.items():
            columns[key].append(value)

    filtered_schema = {k: v for k, v in column_types.items() if k in columns}
    df = pl.DataFrame(columns, schema=filtered_schema)

    return df
