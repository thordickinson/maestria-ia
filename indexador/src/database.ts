import { Client } from "pg";
import { GeohashInfo } from "./types";
const named = require('yesql').pg

let client: Client | undefined = undefined;

async function getClient(): Promise<Client> {
  if (!client) {
    const host = process.env["PG_HOST"];
    const port = parseInt(process.env["PG_PORT"] || "5432");
    const user = process.env["PG_USER"];
    const password = process.env["PG_PASSWORD"];
    const database = process.env["PG_DATABASE"]
    client = new Client({ host, port, user, password, database });
    await client.connect();
    await initialize();
  }
  return client;
}

export async function query(query: string, params: Record<string,string|number> = {}){
  const client = await getClient();
  const sql = named(query)(params)
  const result = await client.query(sql);
  return result.rows;
}


async function initialize(){
    await createGeohashTable();
}

async function createGeohashTable(){
    const client = await getClient();
    await client.query(`
        CREATE TABLE IF NOT EXISTS geohash_info (
            geohash VARCHAR(12) PRIMARY KEY,
            center JSONB NOT NULL,
            barrio VARCHAR(255),
            localidad VARCHAR(255),
            places JSONB NOT NULL,
            counters JSONB NOT NULL
        )
    `);
}


export async function saveGeohashInfo(geohash: GeohashInfo): Promise<void> {
    const client = await getClient();
    await client.query(
        `
            INSERT INTO geohash_info (geohash, center, barrio, localidad, places, counters)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (geohash) DO UPDATE
            SET center = EXCLUDED.center,
                    barrio = EXCLUDED.barrio,
                    localidad = EXCLUDED.localidad,
                    places = EXCLUDED.places,
                    counters = EXCLUDED.counters
        `,
        [
            geohash.geohash,
            JSON.stringify(geohash.center),
            geohash.barrio,
            geohash.localidad,
            JSON.stringify(geohash.places),
            JSON.stringify(geohash.counters)
        ]
    );
}