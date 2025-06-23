from dotenv import load_dotenv
load_dotenv()

import polars as pl
from src.etl.property_loader import load_mongo_json_to_polars
from src.etl.open_data import get_cadastral_and_commercial_values_by_geohash
from src.etl.osm import get_osm_nearby_places
from src.etl.pipeline import enrich_properties
import numpy as np
import math
from pathlib import Path
import logging
import asyncio


Path("data/logs").mkdir(parents=True, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler("data/logs/run.log"),
        logging.StreamHandler()
    ]
)


def __test_nearby_places():
    lat = 4.657157641803628
    lng = -74.05602215637784
    places = get_osm_nearby_places(lat, lng, 500, ["education", "healthcare"])
    print(places)


async def test_geohash_processing():
    # Use Geohash Explorer https://geohash.softeng.co/
    from src.etl.geohash_stats import process_geohashes
    await process_geohashes(["d2g6dud"], 7)


def test_property_loader():
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

    df = load_mongo_json_to_polars(
        file_path="data/processed_v2.0.0_august_2_2024.json",
        column_types=column_types
    )

    print(df.schema)
    print(df.head())


async def test_enrich_properties():
    # Test the function with a specific geohash
    geohash_filter = "d2g6d"
    await enrich_properties()


# asyncio.run(test_enrich_properties())

# test_property_loader()
# get_cadastral_and_commercial_values_by_geohash("d2g6dud")
# test_geohash_processing()
