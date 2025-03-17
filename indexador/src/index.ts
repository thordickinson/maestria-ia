import { loadPlaceQueries, PlaceQuery } from "./stats";
import * as log4js from 'log4js'
import * as fs from 'fs/promises';
import { decodeBase32 } from 'geohashing';
import { config } from 'dotenv'
import { GeohashInfo, NearbyPlaceCounters, NearbyPlaces, Place, Point, TaskConfiguration, TaskContext, Ubicacion } from "./types";
import { configureLogging, getChildrenGeohashes, parsePoint } from "./util";
import { query, saveGeohashInfo } from "./database";

config();
const logger = log4js.getLogger("geohash_processor")


async function getLocation(point: Point): Promise<Ubicacion|undefined>{
  const sql = "SELECT localidad, barriocomu as barrio FROM barrios WHERE ST_Contains(geom, ST_SetSRID(ST_Point(:lng, :lat), 4326))"
  const response = await query(sql, point)
  return response.length > 0? response[0] : undefined
}


async function calculatePlaces(lat: number, lng: number, radius: number, placeQuery: PlaceQuery): Promise<Place[]> {
  const places = await query(placeQuery.query, {lat, lng, radius});
  const resolveLocation = (place: any): Place => {
    const {id, name, location} = place
    const {lat, lng} = parsePoint(location)
    return { id, name, location: {lat, lng }}
  }
  return places.map(resolveLocation)
}

async function processIndividualGeohash(geohash: string, context: TaskContext): Promise<GeohashInfo>{
  const {lat, lng} = decodeBase32(geohash)
  const location =  await getLocation({lat, lng})
  const {localidad, barrio} = location?? {}

  const counters: NearbyPlaceCounters[] = []
  const nearbyPlaces: NearbyPlaces[] = []
  for(const radius of context.configuration.radius){
      const places: Record<string, Place[]> = {} 
      const placeCounters: Record<string, number> = {}
      for(const placeQuery  of context.queries){
      const nearby = await calculatePlaces(lat, lng, radius, placeQuery);
        places[placeQuery.name] = nearby
        placeCounters[placeQuery.name] = nearby.length
      }
      nearbyPlaces.push({distance: radius, places})
      counters.push({distance: radius, places: placeCounters})
  }
  return {
    geohash, 
    center: {lat, lng}, 
    localidad, 
    barrio,
    places: nearbyPlaces,
    counters
  }
}

async function saveCalculatedValue(info: GeohashInfo){
  await saveGeohashInfo(info);
}

async function processGeohash(geohash: string, context: TaskContext){
  if(geohash.length === context.configuration.geohashLevel){
    logger.debug(`Processing geohash ${geohash}`)
    const info = await processIndividualGeohash(geohash, context);
    await saveCalculatedValue(info);
    return;
  }
  const children = getChildrenGeohashes(geohash);
  for(const child of children){
    await processGeohash(child, context);
  }
}

async function processGeohashes(context: TaskContext) {
  for (const parent of context.configuration.geohashes) {
    await processGeohash(parent, context);
  }
}

async function loadConfiguration(): Promise<TaskConfiguration> {
  const configPath = 'config.json';
  const data = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(data) as TaskConfiguration;
}

async function start(){
  configureLogging();
  const configuration = await loadConfiguration();
  const queries = await loadPlaceQueries();
  const context: TaskContext = {
    configuration,
    queries
  }
  await processGeohashes(context)
}

start().then(() => {
  console.log("done")
  process.exit(0)
}).catch(e => {
  console.error(e)
  process.exit(1)
})