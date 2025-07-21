import logging
import geohash
import numpy as np
from itertools import chain
from src.etl.data_types import Place
from src.etl.connection import DatabaseClient

logger = logging.getLogger(__name__)
db = DatabaseClient.instance()

async def __get_estaciones_transmilenio(lat: float, lng: float, radius: int) -> list[Place]:
    sql = f"""SELECT numero_est as id, nombre_est as name, latitud_es as lat, longitud_e as lng
    FROM estaciones_transmilenio
    WHERE ST_DWithin(
        ST_Transform(ST_SetSRID(ST_MakePoint(longitud_e, latitud_es), 4326), 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint({lng}, {lat}), 4326), 3857),
        {radius}
    )"""
    rows = await db.execute_async_select("POSTGIS", sql)
    return [Place(id=r["id"], name=r["name"], type="estacion_transmilenio", lat=r["lat"], lng=r["lng"]) for r in rows]

async def __get_estaciones_sitp(lat: float, lng: float, radius: int) -> list[Place]:
    sql = f"""SELECT cenefa as id, nombre_par as name, latitud as lat, longitud as lng
    FROM paraderos_sitp
    WHERE ST_DWithin(
        ST_Transform(ST_SetSRID(ST_MakePoint(longitud, latitud), 4326), 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint({lng}, {lat}), 4326), 3857),
        {radius}
    )"""
    rows = await db.execute_async_select("POSTGIS", sql)
    return [Place(id=r["id"], name=r["name"], type="estacion_sitp", lat=r["lat"], lng=r["lng"]) for r in rows]

async def get_transport_places(lat: float, lng: float, radius: int) -> list[Place]:
    transmilenio = await __get_estaciones_transmilenio(lat, lng, radius)
    sitp = await __get_estaciones_sitp(lat, lng, radius)
    return list(chain(transmilenio, sitp))

async def __get_barrio_localidad(lat: float, lng: float) -> dict:
    sql = f"""SELECT cod_loc, localidad, barriocomu, estado, cod_polbar
        FROM barrios
        WHERE ST_Contains(
            geom,
            ST_SetSRID(ST_Point({lng}, {lat}), 4326)
        )
        """
    result = await db.execute_async_select_one("POSTGIS", sql)
    if result is None:
        return {}
    return {
        "localidad": {
            "codigo": result["cod_loc"],
            "nombre": result["localidad"]
        }, 
        "barrio": {
            "codigo": result["cod_polbar"],
            "nombre": result["barriocomu"]
        }
    }

async def __get_upz(lat: float, lng: float) -> dict:
    sql = f"SELECT codigo_upz, nombre FROM upz_bogota WHERE ST_Contains(geom, ST_SetSRID(ST_Point({lng}, {lat}), 4326))"
    result = await db.execute_async_select_one("POSTGIS", sql)
    if result is None:
        return {}
    return { "codigo": result["codigo_upz"], "nombre": result["nombre"] }

async def get_region_info(lat: float, lng: float) -> dict:
    logger.debug(f"Getting region info for ({lat}, {lng})")
    barrio_localidad = await __get_barrio_localidad(lat, lng)
    upz = await __get_upz(lat, lng)
    barrio_localidad["upz"] = upz
    return barrio_localidad

async def get_cadastral_and_commercial_values_by_geohash(geo_hash: str) -> dict:
    bbox = geohash.bbox(geo_hash)
    lat_min = bbox['s']
    lat_max = bbox['n']
    lon_min = bbox['w']
    lon_max = bbox['e']
    polygon_wkt = f"POLYGON(({lon_min} {lat_min}, {lon_max} {lat_min}, {lon_max} {lat_max}, {lon_min} {lat_max}, {lon_min} {lat_min}))"
    sql = f"""SELECT AVG(avaluo_com) as comercial, AVG(avaluo_cat) as catastral FROM avaluo_catastral_manzana
            WHERE ST_Intersects(geom, ST_SetSRID(ST_GeomFromText('{polygon_wkt}'), 4326))
        """
    result = await db.execute_async_select_one("POSTGIS", sql)
    if result is None:
        raise Exception("Unable to get an estimated value?")
    cadastral = result["catastral"] if result["catastral"] is not None else np.nan
    comercial = result["comercial"] if result["comercial"] is not None else np.nan
    return { "catastral": cadastral, "comercial": comercial }


async def get_median_estrato_by_geohash(geo_hash: str) -> int:
    bbox = geohash.bbox(geo_hash)
    lat_min = bbox['s']
    lat_max = bbox['n']
    lon_min = bbox['w']
    lon_max = bbox['e']
    polygon_wkt = (
        f"POLYGON(({lon_min} {lat_min}, {lon_max} {lat_min}, "
        f"{lon_max} {lat_max}, {lon_min} {lat_max}, {lon_min} {lat_min}))"
    )

    sql = f"""
    WITH geohash_geom AS (
        SELECT ST_SetSRID(
            ST_GeomFromText('{polygon_wkt}'), 4326) AS geom
    )
    SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY estrato) AS mediana
    FROM avaluo_catastral_manzana, geohash_geom
    WHERE ST_Intersects(geom, geohash_geom.geom);
    """

    result = await db.execute_async_select_one("POSTGIS", sql)
    if result is None or result.get("mediana") is None:
        raise Exception("Unable to determine median estrato in geohash")
    return int(result["mediana"])

async def get_estrato(lat: float, lng: float) -> int:
    """
    Obtiene el estrato socioeconómico de una ubicación dada por latitud y longitud.
    """
    sql = f"""
    WITH punto AS (SELECT ST_SetSRID(ST_MakePoint(:lon, :lat), 4326) AS geom)
        SELECT t.estrato
        FROM estratos_manzana t, punto p
        ORDER BY
            CASE
                WHEN ST_Contains(t.geom, p.geom) THEN 0
                ELSE 1
            END,
            ST_Distance(t.geom, p.geom)          
        LIMIT 1;
    """
    result = await db.execute_async_select_one("POSTGIS", sql)
    if result is None or result.get("estrato") is None:
        raise Exception("Unable to determine estrato for the given coordinates")
    return int(result["estrato"])
