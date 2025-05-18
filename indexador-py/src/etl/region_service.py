from src.etl.connection import execute_select_one
import logging

logger = logging.getLogger(__name__)

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

