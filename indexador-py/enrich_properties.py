import pandas as pd
from datetime import datetime
import asyncio
from src.etl.geohash_stats import get_point_stats, OSM_PLACE_TYPES, PLACE_SEARCH_RADIUS_METERS
from src.etl.connection import DatabaseClient
from tqdm import tqdm
import dotenv
import os

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


async def save_to_database(df_enriched: pd.DataFrame) -> None:
    """Guarda los datos enriquecidos en la tabla property_data de PostgreSQL"""
    db = DatabaseClient.instance()
    
    # Crear tabla si no existe
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS property_data (
        id SERIAL PRIMARY KEY,
        estrato FLOAT,
        area INTEGER,
        habitaciones FLOAT,
        banos FLOAT,
        parqueaderos FLOAT,
        antiguedad VARCHAR(50),
        tipo_propiedad VARCHAR(50),
        tipo_operacion VARCHAR(50),
        latitud DOUBLE PRECISION,
        longitud DOUBLE PRECISION,
        localidad VARCHAR(100),
        barrio VARCHAR(100),
        precio_venta FLOAT,
        administracion FLOAT,
        gimnasio FLOAT,
        ascensor FLOAT,
        piscina FLOAT,
        conjunto_cerrado FLOAT,
        salon_comunal FLOAT,
        terraza FLOAT,
        vigilancia FLOAT,
        education_100 INTEGER,
        healthcare_100 INTEGER,
        retail_access_100 INTEGER,
        dining_and_entertainment_100 INTEGER,
        accommodation_100 INTEGER,
        parks_and_recreation_100 INTEGER,
        infrastructure_services_100 INTEGER,
        cultural_amenities_100 INTEGER,
        education_300 INTEGER,
        healthcare_300 INTEGER,
        retail_access_300 INTEGER,
        dining_and_entertainment_300 INTEGER,
        accommodation_300 INTEGER,
        parks_and_recreation_300 INTEGER,
        infrastructure_services_300 INTEGER,
        cultural_amenities_300 INTEGER,
        education_500 INTEGER,
        healthcare_500 INTEGER,
        retail_access_500 INTEGER,
        dining_and_entertainment_500 INTEGER,
        accommodation_500 INTEGER,
        parks_and_recreation_500 INTEGER,
        infrastructure_services_500 INTEGER,
        cultural_amenities_500 INTEGER,
        education_1000 INTEGER,
        healthcare_1000 INTEGER,
        retail_access_1000 INTEGER,
        dining_and_entertainment_1000 INTEGER,
        accommodation_1000 INTEGER,
        parks_and_recreation_1000 INTEGER,
        infrastructure_services_1000 INTEGER,
        cultural_amenities_1000 INTEGER,
        education_2000 INTEGER,
        healthcare_2000 INTEGER,
        retail_access_2000 INTEGER,
        dining_and_entertainment_2000 INTEGER,
        accommodation_2000 INTEGER,
        parks_and_recreation_2000 INTEGER,
        infrastructure_services_2000 INTEGER,
        cultural_amenities_2000 INTEGER,
        upz_calculada VARCHAR(100),
        barrio_calculado VARCHAR(100),
        localidad_calculada VARCHAR(100),
        catastral FLOAT,
        comercial FLOAT
    );
    """
    await db.execute_async_update("POSTGIS", create_table_sql)
    print("✓ Tabla property_data creada/verificada")
    
    # Verificar si la tabla tiene datos
    count_sql = "SELECT COUNT(*) as count FROM property_data;"
    result = await db.execute_async_select_one("POSTGIS", count_sql)
    existing_count = result['count'] if result else 0
    
    if existing_count > 0:
        print(f"⚠️  La tabla property_data contiene {existing_count} registros existentes")
        print("   Limpiando tabla antes de insertar nuevos datos...")
    
    # Limpiar tabla existente para evitar duplicados
    truncate_sql = "TRUNCATE TABLE property_data RESTART IDENTITY CASCADE;"
    await db.execute_async_update("POSTGIS", truncate_sql)
    print("✓ Tabla property_data limpiada")
    
    # Renombrar columnas para que coincidan con la estructura de la BD
    df_to_save = df_enriched.copy()
    
    # Mapear nombres de columnas de formato "100_education" a "education_100"
    column_mapping = {}
    for radius in PLACE_SEARCH_RADIUS_METERS:
        for place_type in OSM_PLACE_TYPES:
            old_name = f"{place_type}_{radius}"
            new_name = f"{place_type}_{radius}"
            if old_name in df_to_save.columns:
                column_mapping[old_name] = new_name.replace(f"{radius}_", "") + f"_{radius}"
    
    df_to_save = df_to_save.rename(columns=column_mapping)
    
    # Insertar datos en lotes
    batch_size = 500
    total_rows = len(df_to_save)
    
    print(f"Insertando {total_rows} registros en la base de datos...")
    
    for i in range(0, total_rows, batch_size):
        batch = df_to_save.iloc[i:i+batch_size]
        
        # Construir query de inserción
        columns = list(batch.columns)
        placeholders = ", ".join([f"${j+1}" for j in range(len(columns))])
        insert_sql = f"""
        INSERT INTO property_data ({", ".join(columns)})
        VALUES ({placeholders})
        """
        
        # Preparar valores
        for _, row in batch.iterrows():
            values = tuple(row[col] if pd.notna(row[col]) else None for col in columns)
            await db.execute_async_update("POSTGIS", insert_sql, values)
        
        print(f"  Insertados {min(i+batch_size, total_rows)}/{total_rows} registros...")
    
    print("✓ Datos guardados exitosamente en property_data")


async def enrich_properties(max_concurrent=10) -> None:
    data_dir = "data/"
    df = pd.read_csv(f"{data_dir}/aptos_bogota_cleaned.csv")

    cols_to_drop = ["area_terraza", "numero_piso", "numero_closets"]
    # Eliminar columnas solo si existen
    cols_to_drop = [col for col in cols_to_drop if col in df.columns]
    if cols_to_drop:
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
    
    # Guardar en CSV (backup)
    output_file = f"data/aptos_bogota_enriched.csv"
    df_enriched.to_csv(output_file, index=False)
    print(f"✓ Datos guardados en CSV: {output_file}")

    sample_file = "data/aptos_bogota_enriched_sample.csv"
    df_enriched.sample(n=min(50, len(df_enriched)), random_state=42).to_csv(sample_file, index=False)
    print(f"✓ Muestra guardada en: {sample_file}")

    # Guardar en base de datos PostgreSQL
    await save_to_database(df_enriched)
    
    print("\n" + "="*60)
    print("RESUMEN DEL ENRIQUECIMIENTO")
    print("="*60)
    print(f"Total de propiedades procesadas: {len(df_enriched)}")
    print(f"Columnas totales: {len(df_enriched.columns)}")
    print(f"\nPrimeras filas:")
    print(df_enriched.head())


if __name__ == "__main__":
    asyncio.run(enrich_properties())
