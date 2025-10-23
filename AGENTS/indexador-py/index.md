# indexador-py/

## Propósito
Herramientas de ETL, enriquecimiento geoespacial y persistencia para el dataset de propiedades. Orquesta lectura de datos limpios, cálculo de variables contextuales (OSM/geoespaciales), almacenamiento en PostgreSQL/PostGIS y generación de estadísticas por región.

## Contenido relevante
- enrich_properties.py — Pipeline de enriquecimiento y persistencia (prioritario).
- schema.sql — Esquema base de BD y objetos de apoyo (tablas/capas).
- src/ — Módulos internos (conexión DB, geohash/OSM, ETL).
- main.py — Entradas CLI/utilidades.
- server.py — Utilidades de servidor (APIs simples / pruebas locales).
- data/ — Artefactos intermedios (CSV limpios/enriquecidos, muestras).
- assets/, images/ — Recursos estáticos.
- requirements.txt — Dependencias de ejecución.

## Flujo general (alto nivel)
1. Lectura de `data/aptos_bogota_cleaned.csv` (datos limpios).
2. Enriquecimiento por coordenada: métricas OSM por radios, valuaciones y metadatos de región (UPZ, barrio, localidad).
3. Exportación a CSV (`aptos_bogota_enriched.csv` y muestra).
4. Persistencia en PostgreSQL: creación dinámica de `property_data` y carga por lotes.
5. Cálculo de estadísticas por región en `region_stats` para barrio, UPZ y localidad.

## Requisitos y dependencias
- PostgreSQL/PostGIS operativo (conexión mediante variables `.env`).
- Datos limpios disponibles en `data/`.
- Módulos `src.etl.*` para geocálculo y DB (`DatabaseClient`).

## Puntos de atención
- Volumen de inserciones: lotes de 500 filas; considerar `COPY` si crece el dataset.
- Tipado dinámico de columnas en BD: revisar longitudes de `VARCHAR` si aparecen cortes.
- Integridad geoespacial: SRID 4326 y `ST_Contains` sobre capas de barrios/UPZ/localidades.
