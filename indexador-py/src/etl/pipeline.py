import polars as pl
from src.etl.util import bounding_box
from src.etl.property_loader import load_mongo_json_to_polars
from src.etl.geohash_stats import get_stats

column_types = {
        "estrato": pl.Int16,
        "area": pl.Int32,
        "habitaciones": pl.Int16,
        "banos": pl.Int16,
        "parqueaderos": pl.Int16,
        "antiguedad": pl.String,
        "tipo_propiedad": pl.String,
        "tipo_operacion": pl.String,
        "latitud": pl.Float64,
        "longitud": pl.Float64,
        "localidad": pl.String,
        "barrio": pl.String,
        "precio_venta": pl.Float64,
        "precio_arriendo": pl.Float64,
        "administracion": pl.Float64,

        "closets": pl.Int8,
        "gimnasio": pl.Int8,
        "ascensor": pl.Int8,
        "piscina": pl.Int8,
        "conjunto_cerrado": pl.Int8,
        "salon_comunal": pl.Int8,
        "terraza": pl.Int8,
        "vigilancia": pl.Int8,
    }


def enrich_properties(geohash_filter: str | None = None) -> None:
    global column_types
    properties = load_mongo_json_to_polars(
        file_path="data/processed_v2.0.0_august_2_2024.json",
        column_types=column_types
    )
    if geohash_filter:
        lat_min, lat_max, lon_min, lon_max = bounding_box(geohash_filter)
        properties = properties.filter(
            (pl.col("latitud") >= lat_min) & (pl.col("latitud") <= lat_max) &
            (pl.col("longitud") >= lon_min) & (pl.col("longitud") <= lon_max)
        )
    # Further processing of properties can be done here
    lat_idx = properties.columns.index("latitud")
    lng_idx = properties.columns.index("longitud")
    for property in properties.iter_rows():
        lat = property[lat_idx]
        lng = property[lng_idx]
        stats = get_stats(lat, lng)
        print(stats)
    print(len(properties))
    print(properties.head())
