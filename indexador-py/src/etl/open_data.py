import logging
import geohash
from src.etl.connection import execute_select_one, execute_select
from src.etl.data_types import Place
from itertools import chain

logger = logging.getLogger(__name__)

def __get_estaciones_transmilenio(lat: float, lng: float, radius: int) -> list[Place]:
    sql = f"""SELECT numero_est as id, nombre_est as name, latitud_es as lat, longitud_e as lng
    FROM estaciones_transmilenio
    WHERE ST_DWithin(
        ST_Transform(ST_SetSRID(ST_MakePoint(longitud_e, latitud_es), 4326), 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint({lng}, {lat}), 4326), 3857),
        {radius}
    )"""
    rows = execute_select("POSTGIS", sql)
    return [Place(id=r["id"], name=r["name"], type="estacion_transmilenio", lat=r["lat"], lng=r["lng"]) for r in rows]

def __get_estaciones_sitp(lat: float, lng: float, radius: int) -> list[Place]:
    sql = f"""SELECT cenefa as id, nombre_par as name, latitud as lat, longitud as lng
    FROM paraderos_sitp
    WHERE ST_DWithin(
        ST_Transform(ST_SetSRID(ST_MakePoint(longitud, latitud), 4326), 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint({lng}, {lat}), 4326), 3857),
        {radius}
    )"""
    rows = execute_select("POSTGIS", sql)
    return [Place(id=r["id"], name=r["name"], type="estacion_sitp", lat=r["lat"], lng=r["lng"]) for r in rows]


def get_transport_places(lat: float, lng: float, radius: int) -> list[Place]:
    transmilenio = __get_estaciones_transmilenio(lat, lng, radius)
    sitp = __get_estaciones_sitp(lat, lng, radius)
    return list(chain(transmilenio, sitp))


def __get_barrio_localidad(lat: float, lng: float) -> dict:
    sql = f"""SELECT cod_loc, localidad, barriocomu, estado, cod_polbar
        FROM barrios
        WHERE ST_Contains(
            geom,
            ST_SetSRID(ST_Point({lng}, {lat}), 4326)
        )
        """
    result = execute_select_one("POSTGIS", sql)
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

def get_region_info(lat: float, lng: float) -> dict:
    logger.debug(f"Getting region info for ({lat}, {lng})")
    barrio_localidad = __get_barrio_localidad(lat, lng)
    return barrio_localidad

def get_cadastral_and_commercial_values_by_geohash(geo_hash: str) -> dict:
    bbox = geohash.bbox(geo_hash)
    lat_min = bbox['s']
    lat_max = bbox['n']
    lon_min = bbox['w']
    lon_max = bbox['e']
    polygon_wkt = f"POLYGON(({lon_min} {lat_min}, {lon_max} {lat_min}, {lon_max} {lat_max}, {lon_min} {lat_max}, {lon_min} {lat_min}))"
    sql = f"""SELECT AVG(avaluo_com) as comercial, AVG(avaluo_cat) as catastral FROM avaluo_catastral_manzana
            WHERE ST_Intersects(geom, ST_SetSRID(ST_GeomFromText('{polygon_wkt}'), 4326))
        """
    result = execute_select_one("POSTGIS", sql)
    if result is None:
        raise Exception("Unable to get an estimated value?")
    return result

