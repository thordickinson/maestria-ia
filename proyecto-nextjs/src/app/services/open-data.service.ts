import { doQuery, doQueryOne, sql } from "./database.service";
import { Place } from "./types";
import ngeohash from "ngeohash";

async function getEstacionesTransmilenio(lat: number, lng: number, radius: number): Promise<Place[]> {
  const query = sql`
        SELECT numero_est as id, nombre_est as name, latitud_es as lat, longitud_e as lng
        FROM estaciones_transmilenio
        WHERE ST_DWithin(
            ST_Transform(ST_SetSRID(ST_MakePoint(longitud_e, latitud_es), 4326), 3857),
            ST_Transform(ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326), 3857),
            ${radius}
        )
    `;
  const rows = await doQuery(query);
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    type: "estacion_transmilenio",
    lat: r.lat,
    lng: r.lng,
  }));
}

async function getEstacionesSitp(lat: number, lng: number, radius: number): Promise<Place[]> {
  const query = sql`
        SELECT cenefa as id, nombre_par as name, latitud as lat, longitud as lng
        FROM paraderos_sitp
        WHERE ST_DWithin(
            ST_Transform(ST_SetSRID(ST_MakePoint(longitud, latitud), 4326), 3857),
            ST_Transform(ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326), 3857),
            ${radius}
        )
    `;
  const rows = await doQuery(query);
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    type: "estacion_sitp",
    lat: r.lat,
    lng: r.lng,
  }));
}

export async function getTransportPlaces(lat: number, lng: number, radius: number): Promise<Place[]> {
  const [transmilenio, sitp] = await Promise.all([getEstacionesTransmilenio(lat, lng, radius), getEstacionesSitp(lat, lng, radius)]);
  return [...transmilenio, ...sitp];
}

async function getBarrioLocalidad(lat: number, lng: number): Promise<Record<string, any> | undefined> {
  const query = sql`
        SELECT cod_loc, localidad, barriocomu, estado, cod_polbar
        FROM barrios
        WHERE ST_Contains(
            geom,
            ST_SetSRID(ST_Point(${lng}, ${lat}), 4326)
        )
    `;
  const result = await doQueryOne(query);
  if (!result) return undefined;
  return {
    localidad: {
      codigo: result.cod_loc,
      nombre: result.localidad,
    },
    barrio: {
      codigo: result.cod_polbar,
      nombre: result.barriocomu,
    },
  };
}

async function getUpz(lat: number, lng: number): Promise<Record<string, any> | undefined> {
   const query = sql`
        SELECT codigo_upz, nombre
        FROM upz_bogota
        WHERE ST_Contains(geom, ST_SetSRID(ST_Point(${lng}, ${lat}), 4326))
    `;
  const result = await doQueryOne(query);
  if (!result) return undefined;
  return {
    codigo: result.codigo_upz,
    nombre: result.nombre,
  };
}

export async function getRegionInfo(lat: number, lng: number): Promise<Record<string, any>> {
  const [barrioLocalidad, upz] = await Promise.all([getBarrioLocalidad(lat, lng), getUpz(lat, lng)]);
  return { ...barrioLocalidad, upz };
}

export async function getCadastralAndCommercialValuesByGeohash(geoHash: string): Promise<Record<string, any>> {
  const bbox = ngeohash.decode_bbox(geoHash);
  const [lat_min, lon_min, lat_max, lon_max] = [bbox[0], bbox[1], bbox[2], bbox[3]];
  const polygonWkt = `POLYGON((${lon_min} ${lat_min}, ${lon_max} ${lat_min}, ${lon_max} ${lat_max}, ${lon_min} ${lat_max}, ${lon_min} ${lat_min}))`;
  const query = sql`
        SELECT AVG(avaluo_com) as comercial, AVG(avaluo_cat) as catastral
        FROM avaluo_catastral_manzana
        WHERE ST_Intersects(geom, ST_SetSRID(ST_GeomFromText('${polygonWkt}'), 4326))
    `;
  const result = await doQueryOne(query);
  if (!result) throw new Error("Unable to get an estimated value?");
  return {
    catastral: result.catastral ?? NaN,
    comercial: result.comercial ?? NaN,
  };
}
