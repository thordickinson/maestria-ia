# indexador-py/enrich_properties.py

## Propósito
Pipeline asíncrono para enriquecer propiedades con variables geoespaciales/contextuales, persistir el resultado en PostgreSQL/PostGIS y calcular estadísticas agregadas por región (barrio, UPZ, localidad).

## Procedimiento principal (paso a paso)

1. **Lectura de datos base**
   - Fuente: `data/aptos_bogota_cleaned.csv`.
   - Limpieza previa: elimina si existen `area_terraza`, `numero_piso`, `numero_closets`.

2. **Enriquecimiento por coordenada** (`get_property_enrichment(lat, lng)`)  
   Para cada propiedad (latitud/longitud):
   - Llama `src.etl.geohash_stats.get_point_stats()` → obtiene:
     - `valuation` (e.g., avalúos/estrato calculado u otros derivados).
     - `region_info` (UPZ, barrio, localidad).
     - `nearby_places` por radio en `PLACE_SEARCH_RADIUS_METERS` y tipos en `OSM_PLACE_TYPES`.
   - Agrega conteos por tipo y radio: claves `{place_type}_{radius}`.
   - Anexa metadatos regionales en mayúsculas: `upz_calculada`, `barrio_calculado`, `localidad_calculada`.
   - Devuelve un `dict` con columnas enriquecidas.

3. **Concurrencia controlada**  
   - Usa `asyncio.Semaphore(max_concurrent)` para limitar llamadas concurrentes a OSM/cálculos.
   - Programa tareas con `asyncio.as_completed()` y acumula resultados.

4. **Fusión y exportación a CSV**  
   - Construye `enrichment_df` (filas enriquecidas) y concatena con el DF base.
   - Exporta:
     - Completo: `data/aptos_bogota_enriched.csv`.
     - Muestra: `data/aptos_bogota_enriched_sample.csv` (n=50 o tamaño <=50).

5. **Persistencia en PostgreSQL** (`save_to_database(df_enriched)`)  
   - Elimina `property_data` si existe (CASCADE).
   - Construye `CREATE TABLE property_data` dinámico a partir de `df_enriched`:
     - Mapeo tipos (heurístico):
       - `latitud/longitud`: `DOUBLE PRECISION`.
       - `antiguedad/tipo_propiedad/tipo_operacion`: `VARCHAR(50)`.
       - `localidad/barrio/upz/_calculada`: `VARCHAR(100)`.
       - `int`→`INTEGER`, `float`→`FLOAT`, `object`→`VARCHAR(255)`, `bool`→`BOOLEAN`.
     - Inserción por lotes de 500 filas; placeholders posicionales `$1..$n`.

6. **Estadísticas regionales** (`calculate_region_statistics()`)  
   - Crea/verifica `region_stats (tipo_region, codigo, nombre, estadisticas_propiedades JSONB)`.
   - Trunca tabla antes de recalcular.
   - Inserta/actualiza para cada capa:
     - **Barrio** (`barrios_bogota`): `n`, promedio/std de `habitaciones`, cuartiles de `area`, cuartiles y medios de avalúos `m.avaluo_cat`/`m.avaluo_com` (join espacial por `ST_Contains` a `property_data` y `avaluo_catastral_manzana`).
     - **UPZ** (`upz_bogota`): mismos agregados.
     - **Localidad** (`localidades_bogota`): mismos agregados.
   - Reporta conteos por tipo y total.

7. **Ejecución**  
   - `if __name__ == "__main__": asyncio.run(enrich_properties())`.

## Entradas y salidas
- **Entrada**: `data/aptos_bogota_cleaned.csv` (coordenadas y variables base).
- **Salidas CSV**: `data/aptos_bogota_enriched.csv`, `data/aptos_bogota_enriched_sample.csv`.
- **Tablas BD**: `property_data`, `region_stats`.

## Dependencias clave
- `src.etl.geohash_stats` (OSM y cálculo geoespacial per punto).
- `src.etl.connection.DatabaseClient` (cliente async a Postgres/PostGIS; alias de conexión: `"POSTGIS"`).
- `tqdm` (progreso), `dotenv` (variables de entorno), `asyncio`, `pandas`.

## Consideraciones operativas
- **Rendimiento**: ajustar `max_concurrent` según límites de APIs/IO.
- **Tipos dinámicos**: verificar longitudes `VARCHAR` si aparecen truncamientos; considerar `NUMERIC` para monetarios.
- **Geoespacial**: SRID 4326 consistente; `ST_Contains` sobre geometrías válidas.
- **Carga**: para grandes volúmenes, considerar `COPY FROM STDIN` o `execute_values` en lugar de inserciones fila a fila.

## Variables de entorno
- Conexión BD (`DatabaseClient` lee de `.env`): host, puerto, db, usuario, password.

## Uso rápido
```bash
python -m indexador-py.enrich_properties
```
(Previa configuración de `.env` y disponibilidad de `data/aptos_bogota_cleaned.csv` y capas PostGIS requeridas.)
