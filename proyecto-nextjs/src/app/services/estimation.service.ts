import { Dictionary, groupBy } from 'lodash';
import { doQuery, doQueryOne, sql } from './database.service';
import  { getGeohashStats } from './geohash.service';

interface RegionInfo {
    upz: string;
    barrio: string;
    localidad: string;
}

type StatsVariable = {
    variable: string;
    count: number;
    max: number;
    min: number;
    mean: number;
    median: number;
    q20: number;
    q40: number;
    q60: number;
    q80: number;
    std: number;
}

type GroupedStats = {
    nombre: string;
    nivel: string;
    variables: StatsVariable[]
}

type LevelStats = {
    nombre: string;
    nivel: string;
} & StatsVariable;


async function getRegionInfo(lat: number, lng: number) : Promise<RegionInfo | undefined> {
    const upz = await doQueryOne(sql`SELECT UPPER(nombre) as upz FROM upz_bogota WHERE ST_Contains(geom, ST_SetSRID(ST_Point(${lng}, ${lat}), 4326))`);
    if (!upz) {
        console.error('No UPZ found for coordinates:', lat, lng);
        return undefined;
    }
    const barrio = await doQueryOne(sql`SELECT UPPER(barriocomu) as barrio, UPPER(localidad) as localidad FROM barrios WHERE ST_Contains(geom, ST_SetSRID(ST_Point(${lng}, ${lat}), 4326))`);
    if (!barrio) {
        console.error('No barrio found for coordinates:', lat, lng);
        return undefined;
    }
    return {...upz, ...barrio};
}

async function getRegionStats(regionInfo: RegionInfo): Promise<Record<string, GroupedStats> | undefined>{
    const stats: LevelStats[] = await doQuery(sql`SELECT * from estadisticas_sector WHERE (nombre = ${regionInfo.upz} and nivel='upz') OR (nombre = ${regionInfo.barrio} and nivel='barrio') OR (nombre = ${regionInfo.localidad} and nivel='localidad')`);
    const statsDictionary: Dictionary<LevelStats[]>  = groupBy(stats, 'nivel');
    const groupedStats: Record<string, GroupedStats> = Object.entries(statsDictionary).reduce((acc, [nivel, items]) => {
        if (items.length > 0) {
            acc[nivel] = {
                nombre: items[0].nombre,
                nivel,
                variables: items.map(({ nombre, nivel, ...vars }) => ({ ...vars }))
            };
        }
        return acc;
    }, {} as Record<string, GroupedStats>);
    return groupedStats;
}

async function predictPrice(): Promise<number> {
    // Placeholder for price prediction logic
    return 100000000; // Example price in COP
}


export async function estimate(lat: number, lng: number) {
    const info = await getRegionInfo(lat, lng);
    if (!info) {
        throw new Error('Region information could not be retrieved');
    }
    const regionStats = await getRegionStats(info);
    const geohashInfo = await getGeohashStats(lat, lng);
    console.log('Region Info (2):', [regionStats, geohashInfo]);
    return {}
}
