import { PendingQuery, Row } from "postgres";
import { doQuery, sql } from "./database.service";
import { Place } from "./types";
import { parsePoint } from "./util"; 

const placeTypeNames: Record<string, string[]> = {
    education: [
        "school", "kindergarten", "college", "university", "library"
    ],
    healthcare: [
        "hospital", "clinic", "doctors", "dentist", "pharmacy", "chemist", "veterinary", "nursing_home"
    ],
    retail_access: [
        "supermarket", "convenience", "bakery", "butcher", "greengrocer", "department_store",
        "clothes", "shoe_shop", "beauty_shop", "florist", "hairdresser", "bookshop", "optician",
        "general", "kiosk", "newsagent", "pharmacy", "mall", "market_place",
        "toy_shop", "jeweller", "furniture_shop", "garden_centre", "bicycle_shop", "sports_shop",
        "mobile_phone_shop", "computer_shop", "car_dealership", "outdoor_shop", "doityourself"
    ],
    dining_and_entertainment: [
        "restaurant", "fast_food", "cafe", "food_court", "bar", "pub", "biergarten", 
        "cinema", "theatre", "nightclub"
    ],
    accommodation: [
        "hotel", "motel", "hostel", "guesthouse", "chalet", "alpine_hut", "camp_site", "caravan_site"
    ],
    parks_and_recreation: [
        "park", "playground", "dog_park", "picnic_site", "pitch", "track", "golf_course",
        "sports_centre", "swimming_pool", "ice_rink"
    ],
    infrastructure_services: [
        "community_centre", "public_building", "town_hall", "courthouse", "embassy", "police", 
        "fire_station", "post_office", "post_box", "atm", "bank", "car_rental", "car_sharing", 
        "bicycle_rental", "travel_agent", "tourist_info", "laundry", "toilet", 
        "telephone", "drinking_water", "fountain", "bench"
    ],
    cultural_amenities: [
        "museum", "arts_centre", "zoo", "attraction", "theme_park", "castle", "fort", 
        "archaeological", "memorial", "monument", "viewpoint"
    ],
    irrelevant: [
        "windmill", "water_well", "comms_tower", "wastewater_plant", "recycling", 
        "recycling_paper", "recycling_glass", "recycling_clothes", "recycling_metal", 
        "lighthouse", "observation_tower", "tower", "battlefield", "camera_surveillance", 
        "vending_machine", "vending_any", "vending_parking", "shelter", "hunting_stand", 
        "ruins", "wayside_shrine", "wayside_cross", "graveyard", "artwork"
    ]
};

export const DEFAULT_PLACE_TYPES = ["education", "healthcare", "retail_access", 
                            "dining_and_entertainment", "accommodation", 
                            "parks_and_recreation", "infrastructure_services", 
                            "cultural_amenities"];

function reversePlaceType(placeType: string): string {
    const type = placeType.toLowerCase();
    for (const key of Object.keys(placeTypeNames)) {
        if (placeTypeNames[key].includes(type)) {
            return key;
        }
    }
    throw new Error(`Place type not found ${placeType}`);
}

function buildQuery(
    lat: number,
    lng: number,
    radius: number,
    placeTypes: string[]
): PendingQuery<Row[]> {
    const names = placeTypes.flatMap(type => placeTypeNames[type]);
    const namesStr = names.map(n => `'${n}'`).join(", ");
    return sql`
        SELECT *
        FROM (
            SELECT osm_id as id, name, fclass as place_type, ST_AsText(ST_Transform(geom, 4326)) AS location
            FROM gis_osm_pois_free_1
            WHERE fclass IN ${sql(names)}
              AND ST_DWithin(
                  geography(geom),
                  geography(ST_SetSRID(ST_Point(${lng}, ${lat}), 4326)),
                  ${radius}
              )
            UNION ALL
            SELECT osm_id as id, name, fclass as place_type, ST_AsText(ST_Transform(ST_Centroid(geom), 4326)) AS location
            FROM gis_osm_pois_a_free_1
            WHERE fclass IN (${names})
              AND ST_DWithin(
                  geography(ST_Centroid(geom)),
                  geography(ST_SetSRID(ST_Point(${lng}, ${lat}), 4326)),
                  ${radius}
              )
        ) AS combined WHERE name IS NOT NULL;
    `;
}

export async function getOsmNearbyPlaces(
    lat: number,
    lng: number,
    radiusMeters: number,
    placeTypes: string[] = DEFAULT_PLACE_TYPES
): Promise<Place[]> {
    const sqlQuery = buildQuery(lat, lng, radiusMeters, placeTypes);
    const result = await doQuery(sqlQuery);
    return result.map((row: any) => {
        const [lat, lng] = parsePoint(row.location);
        return {
            id: String(row.id),
            name: row.name,
            lat,
            lng,
            type: reversePlaceType(row.place_type)
        } as Place;
    });
}
