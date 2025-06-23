import polars as pl
from src.etl.util import bounding_box
from src.etl.property_loader import load_mongo_json_to_polars
from src.etl.geohash_stats import GeohashStats, get_point_stats, OSM_PLACE_TYPES, PLACE_SEARCH_RADIUS_METERS
from datetime import datetime

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

properties_target_columns = [
    "estrato", "area", "habitaciones", "banos", "parqueaderos", "antiguedad", "tipo_propiedad",
    "localidad", "barrio", "precio_venta", "administracion", "closets", "gimnasio", "ascensor",
    "piscina", "conjunto_cerrado", "salon_comunal", "terraza", "vigilancia"
]


def __extract_additional_columns(stats: GeohashStats) -> list:
    nearby_places = stats.nearby_places
    row: list = []
    for distance in nearby_places:
        places = nearby_places[distance]
        for place_type in OSM_PLACE_TYPES:
            if place_type not in places:
                row.append(0)
                continue
            row.append(len(places[place_type]))
    row.append(stats.region_info.get("upz", {}).get("nombre", None))
    row.append(stats.valuation.get("catastral", None))
    row.append(stats.valuation.get("comercial", None))
    return row

def __additional_columns_headers() -> list[str]:
    headers = []
    for distance in PLACE_SEARCH_RADIUS_METERS:
        for place_type in OSM_PLACE_TYPES:
            headers.append(f"{distance}_{place_type}")
    headers.append("upz")
    headers.append("catastral")
    headers.append("comercial")
    return headers



def enrich_properties(geohash_filter: str | None = None) -> None:
    global column_types
    properties = load_mongo_json_to_polars(
        file_path="data/processed_v2.0.0_august_2_2024.json",
        column_types=column_types
    )
    properties = properties.filter(
        (pl.col("precio_venta").is_not_null()) &
        (~pl.col("precio_venta").is_nan()) &
        (pl.col("precio_venta") > 20_000_000)
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
    additional_headers = __additional_columns_headers()
    additional_data = []

    for property in properties.iter_rows():
        lat = property[lat_idx]
        lng = property[lng_idx]
        stats = get_point_stats(lat, lng)
        additional_cols = __extract_additional_columns(stats)
        additional_data.append(additional_cols)
    additional_df = pl.DataFrame(additional_data, schema=additional_headers)
    properties = properties.hstack(additional_df)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    properties.write_csv(f"data/properties_{timestamp}.csv")
    print(len(properties))
    print(properties.head())
