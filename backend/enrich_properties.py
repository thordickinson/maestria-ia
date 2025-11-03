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
    
    # 1. Eliminar tabla si existe
    drop_table_sql = "DROP TABLE IF EXISTS property_data CASCADE;"
    await db.execute_async_update("POSTGIS", drop_table_sql)
    print("✓ Tabla property_data eliminada (si existía)")
    
    # 2. Generar estructura de tabla dinámicamente basada en el DataFrame
    def get_postgres_type(dtype, column_name: str) -> str:
        """Mapea tipos de pandas a tipos de PostgreSQL"""
        dtype_str = str(dtype)
        
        # Tipos específicos por nombre de columna
        if column_name in ['latitud', 'longitud']:
            return 'DOUBLE PRECISION'
        elif column_name in ['antiguedad', 'tipo_propiedad', 'tipo_operacion']:
            return 'VARCHAR(50)'
        elif column_name in ['localidad', 'barrio', 'upz', 'upz_calculada', 'barrio_calculado', 'localidad_calculada']:
            return 'VARCHAR(100)'
        
        # Tipos por dtype de pandas
        if 'int' in dtype_str:
            return 'INTEGER'
        elif 'float' in dtype_str:
            return 'FLOAT'
        elif 'object' in dtype_str:
            return 'VARCHAR(255)'
        elif 'bool' in dtype_str:
            return 'BOOLEAN'
        else:
            return 'TEXT'
    
    # Construir columnas dinámicamente
    columns_def = ['id SERIAL PRIMARY KEY']
    for col in df_enriched.columns:
        pg_type = get_postgres_type(df_enriched[col].dtype, col)
        columns_def.append(f"{col} {pg_type}")
    
    # Unir columnas con saltos de línea
    columns_str = ',\n        '.join(columns_def)
    
    create_table_sql = f"""
    CREATE TABLE property_data (
        {columns_str}
    );
    """
    
    await db.execute_async_update("POSTGIS", create_table_sql)
    print(f"✓ Tabla property_data creada con {len(df_enriched.columns)} columnas")
    
    # Mostrar algunas columnas creadas (para debug)
    sample_cols = list(df_enriched.columns)[:5] + ['...'] + list(df_enriched.columns)[-3:]
    print(f"   Columnas: {', '.join(sample_cols)}")
    
    # Preparar DataFrame para inserción (sin renombrar, la tabla se adapta al DF)
    df_to_save = df_enriched.copy()
    
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


async def calculate_region_statistics() -> None:
    """Calcula estadísticas agregadas por región (barrio, UPZ, localidad)"""
    db = DatabaseClient.instance()
    
    print("\n" + "="*60)
    print("CALCULANDO ESTADÍSTICAS POR REGIÓN")
    print("="*60)
    
    # 1. Crear tabla de estadísticas si no existe
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS region_stats (
        tipo_region VARCHAR(20) NOT NULL,
        codigo VARCHAR(50) NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        estadisticas_propiedades JSONB NOT NULL,
        PRIMARY KEY (tipo_region, codigo)
    );
    """
    await db.execute_async_update("POSTGIS", create_table_sql)
    print("✓ Tabla region_stats creada/verificada")
    
    # 2. Limpiar tabla antes de recalcular
    truncate_sql = "TRUNCATE region_stats;"
    await db.execute_async_update("POSTGIS", truncate_sql)
    print("✓ Tabla region_stats limpiada")
    
    # 3. Calcular estadísticas por BARRIO
    print("\nCalculando estadísticas por barrio...")
    barrio_stats_sql = """
    INSERT INTO region_stats (tipo_region, codigo, nombre, estadisticas_propiedades)
    SELECT
      'barrio',
      b.gid::text,
      b.barrio,
      jsonb_build_object(
        'n', COUNT(p.*),
        'habitaciones_promedio', AVG(p.habitaciones),
        'habitaciones_stddev', STDDEV_POP(p.habitaciones),
        'area_promedio', AVG(p.area),
        'area_q1', PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY p.area),
        'area_q3', PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY p.area),
        'banos_promedio', AVG(p.banos),
        'avaluo_cat_promedio', AVG(m.avaluo_cat),
        'avaluo_cat_q1', PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY m.avaluo_cat),
        'avaluo_cat_q3', PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY m.avaluo_cat),
        'avaluo_com_promedio', AVG(m.avaluo_com),
        'avaluo_com_q1', PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY m.avaluo_com),
        'avaluo_com_q3', PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY m.avaluo_com)
      )
    FROM barrios_bogota b
    LEFT JOIN property_data p
      ON ST_Contains(b.geom, ST_SetSRID(ST_MakePoint(p.longitud, p.latitud), 4326))
    LEFT JOIN avaluo_catastral_manzana m
      ON ST_Contains(b.geom, m.geom)
    WHERE b.gid IS NOT NULL AND b.barrio IS NOT NULL
    GROUP BY b.gid, b.barrio
    ON CONFLICT (tipo_region, codigo)
    DO UPDATE SET
      nombre = EXCLUDED.nombre,
      estadisticas_propiedades = EXCLUDED.estadisticas_propiedades;
    """
    await db.execute_async_update("POSTGIS", barrio_stats_sql)
    
    # Contar barrios procesados
    count_sql = "SELECT COUNT(*) as count FROM region_stats WHERE tipo_region = 'barrio';"
    result = await db.execute_async_select_one("POSTGIS", count_sql)
    print(f"   ✓ {result['count']} barrios procesados")
    
    # 4. Calcular estadísticas por UPZ
    print("\nCalculando estadísticas por UPZ...")
    upz_stats_sql = """
    INSERT INTO region_stats (tipo_region, codigo, nombre, estadisticas_propiedades)
    SELECT
      'upz',
      u.gid::text,
      u.nombre,
      jsonb_build_object(
        'n', COUNT(p.*),
        'habitaciones_promedio', AVG(p.habitaciones),
        'habitaciones_stddev', STDDEV_POP(p.habitaciones),
        'area_promedio', AVG(p.area),
        'area_q1', PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY p.area),
        'area_q3', PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY p.area),
        'banos_promedio', AVG(p.banos),
        'avaluo_cat_promedio', AVG(m.avaluo_cat),
        'avaluo_cat_q1', PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY m.avaluo_cat),
        'avaluo_cat_q3', PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY m.avaluo_cat),
        'avaluo_com_promedio', AVG(m.avaluo_com),
        'avaluo_com_q1', PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY m.avaluo_com),
        'avaluo_com_q3', PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY m.avaluo_com)
      )
    FROM upz_bogota u
    LEFT JOIN property_data p
      ON ST_Contains(u.geom, ST_SetSRID(ST_MakePoint(p.longitud, p.latitud), 4326))
    LEFT JOIN avaluo_catastral_manzana m
      ON ST_Contains(u.geom, m.geom)
    WHERE u.gid IS NOT NULL AND u.nombre IS NOT NULL
    GROUP BY u.gid, u.nombre
    ON CONFLICT (tipo_region, codigo)
    DO UPDATE SET
      nombre = EXCLUDED.nombre,
      estadisticas_propiedades = EXCLUDED.estadisticas_propiedades;
    """
    await db.execute_async_update("POSTGIS", upz_stats_sql)
    
    count_sql = "SELECT COUNT(*) as count FROM region_stats WHERE tipo_region = 'upz';"
    result = await db.execute_async_select_one("POSTGIS", count_sql)
    print(f"   ✓ {result['count']} UPZs procesadas")
    
    # 5. Calcular estadísticas por LOCALIDAD
    print("\nCalculando estadísticas por localidad...")
    localidad_stats_sql = """
    INSERT INTO region_stats (tipo_region, codigo, nombre, estadisticas_propiedades)
    SELECT
      'localidad',
      b.loccodigo,
      b.locnombre,
      jsonb_build_object(
        'n', COUNT(p.*),
        'habitaciones_promedio', AVG(p.habitaciones),
        'habitaciones_stddev', STDDEV_POP(p.habitaciones),
        'area_promedio', AVG(p.area),
        'area_q1', PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY p.area),
        'area_q3', PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY p.area),
        'banos_promedio', AVG(p.banos),
        'avaluo_cat_promedio', AVG(m.avaluo_cat),
        'avaluo_cat_q1', PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY m.avaluo_cat),
        'avaluo_cat_q3', PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY m.avaluo_cat),
        'avaluo_com_promedio', AVG(m.avaluo_com),
        'avaluo_com_q1', PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY m.avaluo_com),
        'avaluo_com_q3', PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY m.avaluo_com)
      )
    FROM localidades_bogota b
    LEFT JOIN property_data p
      ON ST_Contains(b.geom, ST_SetSRID(ST_MakePoint(p.longitud, p.latitud), 4326))
    LEFT JOIN avaluo_catastral_manzana m
      ON ST_Contains(b.geom, m.geom)
    WHERE b.loccodigo IS NOT NULL
    GROUP BY b.loccodigo, b.locnombre
    ON CONFLICT (tipo_region, codigo)
    DO UPDATE SET
      nombre = EXCLUDED.nombre,
      estadisticas_propiedades = EXCLUDED.estadisticas_propiedades;
    """
    await db.execute_async_update("POSTGIS", localidad_stats_sql)
    
    count_sql = "SELECT COUNT(*) as count FROM region_stats WHERE tipo_region = 'localidad';"
    result = await db.execute_async_select_one("POSTGIS", count_sql)
    print(f"   ✓ {result['count']} localidades procesadas")
    
    # 6. Resumen final
    total_sql = "SELECT COUNT(*) as count FROM region_stats;"
    result = await db.execute_async_select_one("POSTGIS", total_sql)
    print(f"\n✓ Total de regiones con estadísticas: {result['count']}")
    print("✓ Estadísticas regionales calculadas exitosamente")


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
    
    # Calcular estadísticas por región
    await calculate_region_statistics()
    
    print("\n" + "="*60)
    print("RESUMEN DEL ENRIQUECIMIENTO")
    print("="*60)
    print(f"Total de propiedades procesadas: {len(df_enriched)}")
    print(f"Columnas totales: {len(df_enriched.columns)}")
    print(f"\nPrimeras filas:")
    print(df_enriched.head())
    print("\n✅ Proceso completado exitosamente")


if __name__ == "__main__":
    asyncio.run(enrich_properties())
