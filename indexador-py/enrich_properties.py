import pandas as pd
from datetime import datetime
import asyncio
from src.etl.geohash_stats import get_point_stats, OSM_PLACE_TYPES, PLACE_SEARCH_RADIUS_METERS
from tqdm import tqdm
import dotenv

dotenv.load_dotenv()

async def get_property_enrichment(lat: float, lng: float) -> dict:
    stats = await get_point_stats(lat, lng)
    columns: dict[str, int|float] = {}
    valuation = stats.valuation
    region = stats.region_info
    # valuation["estrato_calculado"] = int(valuation.pop("estrato"))

    def count_places(radius: int, place_type: str) -> int:
        places = stats.nearby_places[f"{radius}m"]
        if place_type not in places:
            return 0
        return len(places[place_type])

    for radius in PLACE_SEARCH_RADIUS_METERS:
        for place_type in OSM_PLACE_TYPES:
            key = f"{place_type}_{radius}"
            columns[key] = count_places(radius, place_type)
    columns.update(valuation)
    upz = region.get("upz", {}).get("nombre", "")
    barrio = region.get("barrio", {}).get("nombre", "")
    localidad = region.get("localidad", {}).get("nombre", "")
    columns.update({
        "upz_calculada": upz.upper(),
        "barrio_calculado": barrio.upper(),
        "localidad_calculada": localidad.upper()
    })
    # Convertir las coordenadas a geohash
    return columns


async def enrich_properties(max_concurrent=10) -> None:
    data_dir = "data/"
    df = pd.read_csv(f"{data_dir}/aptos_bogota_cleaned.csv")

    cols_to_drop = ["area_terraza", "numero_piso", "numero_closets"]
    df = df.drop(columns=cols_to_drop)

    semaphore = asyncio.Semaphore(max_concurrent)

    async def sem_task(lat, lng):
        async with semaphore:
            return await get_property_enrichment(lat, lng)

    tasks = [
        sem_task(row.latitud, row.longitud)
        for _, row in df.iterrows()
    ]

    print("Enriqueciendo propiedades...")

    enriched_data = []
    for coro in tqdm(asyncio.as_completed(tasks), total=len(tasks)):
        result = await coro
        enriched_data.append(result)

    enrichment_df = pd.DataFrame(enriched_data)
    df_enriched = pd.concat([df.reset_index(drop=True), enrichment_df.reset_index(drop=True)], axis=1)
    output_file = f"data/aptos_bogota_enriched.csv"
    df_enriched.to_csv(output_file, index=False)

    sample_file = "data/aptos_bogota_enriched_sample.csv"
    df_enriched.sample(n=50, random_state=42).to_csv(sample_file, index=False)
    print(f"Muestra de 50 elementos guardada en: {sample_file}")

    print(f"Datos enriquecidos guardados en: {output_file}")
    print(df_enriched.head())


if __name__ == "__main__":
    asyncio.run(enrich_properties())
