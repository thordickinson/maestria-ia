import {encode, decode} from 'ngeohash'
import { sql, doQuery, doQueryOne, doUpdate } from './database.service';
import { getRegionInfo, getTransportPlaces } from './open-data.service';
import { getOsmNearbyPlaces } from './osm.service';
import { groupBy } from 'lodash';

const PLACE_SEARCH_RADIUS_METERS = [100, 300, 500, 1000, 2000]

export type Region = {
    codigo: string;
    nombre: string;
}

export type RegionInfo = {
    upz: Region
    barrio: Region
    localidad: Region
}

export type NearbyPlace = {
    id: string;
    lat: number;
    lng: number;
    name: string;
    type: string;
}

export type GeohashStats = {
    geohash: string;
    lat: number;
    lng: number;
    region_info: RegionInfo;
    nearby_places: Record<string, NearbyPlace[]>;
    valuation: Record<string, number>;
    calculation_time_seconds: number;
}

async function saveStats(stats: GeohashStats): Promise<void> {
    const { geohash, lat, lng, region_info, nearby_places, valuation, calculation_time_seconds } = stats;
    await doUpdate(sql`
        INSERT INTO geohash_stats (geohash, lat, lng, region_info, nearby_places, valuation, calculation_time_seconds)
        VALUES (${geohash}, ${lat}, ${lng}, ${JSON.stringify(region_info)}, ${JSON.stringify(nearby_places)}, ${JSON.stringify(valuation)}, ${calculation_time_seconds})
        ON CONFLICT (geohash) DO UPDATE SET
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        region_info = EXCLUDED.region_info,
        nearby_places = EXCLUDED.nearby_places,
        valuation = EXCLUDED.valuation,
        calculation_time_seconds = EXCLUDED.calculation_time_seconds
    `);
}

async function getValuation(lat: number, lng: number): Promise<Record<string, number>> {
    return {}; // Placeholder for actual implementation
}

async function getNearbyPlaces(lat: number, lng: number): Promise<Record<string, Record<string, NearbyPlace[]>>> {
    const nearby_places: Record<string, Record<string, NearbyPlace[]>> = {};
    for (const radius of PLACE_SEARCH_RADIUS_METERS) {
        const transport = await getTransportPlaces(lat, lng, radius);
        const places = await getOsmNearbyPlaces(lat, lng, radius);
        const all_places = [...transport, ...places];
        const grouped_places: Record<string, NearbyPlace[]> = groupBy(all_places, 'type');
        nearby_places[`${radius}m`] = grouped_places;
    }
    return nearby_places;
}

async function calculateGeohashStats(geohash: string): Promise<GeohashStats | undefined> {
    const start = Date.now();
    const calculation_time_seconds = (Date.now() - start) / 1000;
    const {latitude: lat, longitude: lng} = decode(geohash);
    const region_info = await getRegionInfo(lat, lng);
    const nearby_places = await getNearbyPlaces(lat, lng);
    const valuation = await getValuation(lat, lng);
    const stats: GeohashStats = {geohash, lat, lng, region_info, nearby_places, valuation, calculation_time_seconds} as any;
    return stats;
}


export async function getGeohashStats(lat: number, lng: number): Promise<Record<string, any> | undefined> {
    const geohash = encode(lat, lng, 7);
    const info = await doQueryOne(sql`SELECT * FROM geohash_stats WHERE geohash = ${geohash}`);
    if (info) {
        console.log('Geohash stats found:', info);
        return info;
    }
    console.error('No geohash stats found for coordinates:', lat, lng);
    const calculated = await calculateGeohashStats(geohash);
    // await saveStats(stats);
    return calculated;
    
}

// d2g6dfu