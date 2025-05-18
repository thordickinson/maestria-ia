from pydantic import BaseModel
from typing import Optional
import itertools

from src.etl.connection import execute_select

__place_type_names = {
    "education": [
        "school", "kindergarten", "college", "university", "library"
    ],
    "healthcare": [
        "hospital", "clinic", "doctors", "dentist", "pharmacy", "chemist", "veterinary", "nursing_home"
    ],
    "retail_access": [  # incluye esenciales y no esenciales
        "supermarket", "convenience", "bakery", "butcher", "greengrocer", "department_store",
        "clothes", "shoe_shop", "beauty_shop", "florist", "hairdresser", "bookshop", "optician",
        "general", "kiosk", "newsagent", "pharmacy", "mall", "market_place",
        "toy_shop", "jeweller", "furniture_shop", "garden_centre", "bicycle_shop", "sports_shop",
        "mobile_phone_shop", "computer_shop", "car_dealership", "outdoor_shop", "doityourself"
    ],
    "dining_and_entertainment": [
        "restaurant", "fast_food", "cafe", "food_court", "bar", "pub", "biergarten", 
        "cinema", "theatre", "nightclub"
    ],
    "accommodation": [
        "hotel", "motel", "hostel", "guesthouse", "chalet", "alpine_hut", "camp_site", "caravan_site"
    ],
    "parks_and_recreation": [
        "park", "playground", "dog_park", "picnic_site", "pitch", "track", "golf_course",
        "sports_centre", "swimming_pool", "ice_rink"
    ],
    "infrastructure_services": [
        "community_centre", "public_building", "town_hall", "courthouse", "embassy", "police", 
        "fire_station", "post_office", "post_box", "atm", "bank", "car_rental", "car_sharing", 
        "bicycle_rental", "travel_agent", "tourist_info", "laundry", "toilet", 
        "telephone", "drinking_water", "fountain", "bench"
    ],
    "cultural_amenities": [  # opcional, según contexto
        "museum", "arts_centre", "zoo", "attraction", "theme_park", "castle", "fort", 
        "archaeological", "memorial", "monument", "viewpoint"
    ],
    "irrelevant": [
        "windmill", "water_well", "comms_tower", "wastewater_plant", "recycling", 
        "recycling_paper", "recycling_glass", "recycling_clothes", "recycling_metal", 
        "lighthouse", "observation_tower", "tower", "battlefield", "camera_surveillance", 
        "vending_machine", "vending_any", "vending_parking", "shelter", "hunting_stand", 
        "ruins", "wayside_shrine", "wayside_cross", "graveyard", "artwork"
    ]
}



class Place(BaseModel):
    name: str
    type: str
    lat: float
    lng: float


def __reverse_place_type(place_type: str) -> str:
    global __place_type_names
    place_type = place_type.lower()
    for key in __place_type_names:
        if place_type in __place_type_names[key]:
            return key
    raise Exception(f"Place type not found {place_type}")

def __build_query(lat: float, lng: float, radius: int, place_types: list[str]) -> str:
    global __place_type_names
    place_types_list = [__place_type_names[place_type] for place_type in place_types]
    names = [item for sublist in place_types_list for item in sublist]
    names_str = ", ".join(list(map(lambda n: f"'{n}'", names)))
    query = f"""
    SELECT *
    FROM (
    SELECT code, name, fclass as place_type, ST_AsText(ST_Transform(geom, 4326)) AS location
    FROM gis_osm_pois_free_1
    WHERE fclass IN ({names_str})
      AND ST_DWithin(
          geography(geom),
          geography(ST_SetSRID(ST_Point({lng}, {lat}), 4326)),
          {radius}
      )
    UNION ALL
    SELECT code, name, fclass as place_type, ST_AsText(ST_Transform(ST_Centroid(geom), 4326)) AS location
    FROM gis_osm_pois_a_free_1
    WHERE fclass IN ({names_str})
      AND ST_DWithin(
          geography(ST_Centroid(geom)),
          geography(ST_SetSRID(ST_Point({lng}, {lat}), 4326)),
          {radius}
      )) AS combined WHERE name IS NOT NULL;"""
    return query


def __parse_point(point: str) -> tuple[float, float]:
    # Parse this kind of text to lat, lng POINT(-74.0575685 4.6573304)
    point = point.strip()
    if point.startswith("POINT(") and point.endswith(")"):
        coords = point[6:-1].split()
        lng, lat = map(float, coords)
        return lat, lng
    raise ValueError(f"Invalid point format: {point}")

def get_nearby_places(lat: float, lng: float, radius_meters: int, place_types: list[str]) -> list[Place]:
    sql = __build_query(lat, lng, radius_meters, place_types)
    result = execute_select("POSTGIS", sql)
    def parse_result(row: dict):
        lat, lng = __parse_point(row['location'])
        return Place(name=row['name'], lat=lat, lng=lng, type=__reverse_place_type(row['place_type']))
    return [parse_result(row) for row in result]
