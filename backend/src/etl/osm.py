from src.etl.data_types import Place
from src.etl.connection import DatabaseClient
from src.etl.util import parse_point

__place_type_names = {
    "education": [
        "school", "kindergarten", "college", "university", "library"
    ],
    "healthcare": [
        "hospital", "clinic", "doctors", "dentist", "pharmacy", "chemist", "veterinary", "nursing_home"
    ],
    "retail_access": [
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
    "cultural_amenities": [
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

db = DatabaseClient.instance()

def __reverse_place_type(place_type: str) -> str:
    place_type = place_type.lower()
    for key, values in __place_type_names.items():
        if place_type in values:
            return key
    raise Exception(f"Place type not found {place_type}")

def __build_query(lat: float, lng: float, radius: int, place_types: list[str]) -> str:
    place_types_list = [__place_type_names[pt] for pt in place_types]
    names = [item for sublist in place_types_list for item in sublist]
    names_str = ", ".join([f"'{n}'" for n in names])
    return f"""
    SELECT *
    FROM (
        SELECT osm_id as id, name, fclass as place_type, ST_AsText(ST_Transform(geom, 4326)) AS location
        FROM gis_osm_pois_free_1
        WHERE fclass IN ({names_str})
        AND ST_DWithin(
            geography(geom),
            geography(ST_SetSRID(ST_Point({lng}, {lat}), 4326)),
            {radius}
        )
        UNION ALL
        SELECT osm_id as id, name, fclass as place_type, ST_AsText(ST_Transform(ST_Centroid(geom), 4326)) AS location
        FROM gis_osm_pois_a_free_1
        WHERE fclass IN ({names_str})
        AND ST_DWithin(
            geography(ST_Centroid(geom)),
            geography(ST_SetSRID(ST_Point({lng}, {lat}), 4326)),
            {radius}
        )
    ) AS combined WHERE name IS NOT NULL;
    """

async def get_osm_nearby_places(lat: float, lng: float, radius_meters: int, place_types: list[str]) -> list[Place]:
    sql = __build_query(lat, lng, radius_meters, place_types)
    result = await db.execute_async_select("POSTGIS", sql)

    def parse_result(row: dict) -> Place:
        lat, lng = parse_point(row['location'])
        return Place(
            id=str(row["id"]),
            name=row['name'],
            lat=lat,
            lng=lng,
            type=__reverse_place_type(row['place_type'])
        )

    return [parse_result(row) for row in result]
