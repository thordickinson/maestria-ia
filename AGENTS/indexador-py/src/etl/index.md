# indexador-py/src/etl/

## Propósito
Módulos de extracción y enriquecimiento geoespacial: conexión a PostGIS, consultas OSM/datos abiertos, cálculo por geohash y utilidades.

## Contenido relevante
- connection.py — Cliente asíncrono a PostgreSQL/PostGIS con pools (`asyncpg`).
- geohash_stats.py — Cálculo y caché de métricas por geohash/punto; persistencia `geohash_stats`.
- open_data.py — Consultas a capas públicas (TransMilenio, SITP, barrios/UPZ/localidades, avalúos, estratos).
- osm.py — Búsqueda de POIs OSM por radio y tipología; normaliza clases a categorías.
- property_loader.py — Carga/validación de CSV de propiedades (si se usa en otros flujos).
- util.py — Utilidades (parseo de geometrías, serialización, limpieza de NaNs).
- data_types.py — Tipos (`Place`) para entidades geográficas/POIs.
- estadisticas.md — Notas sobre métricas/estadísticos usados.
