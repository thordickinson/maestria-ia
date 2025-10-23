# indexador-py/schema.sql

## Propósito
Definir objetos y tablas base necesarias para el ecosistema PostGIS usado por el indexador: capas de barrios/UPZ/localidades, tablas de apoyo y extensiones.

## Contenido esperado
- Creación de esquemas/tablas geoespaciales requeridas por los `JOIN` de `region_stats`.
- Índices espaciales (`GIST`) sobre `geom`.
- Referencias a SRID 4326 y avaluós por manzana (`avaluo_catastral_manzana`).

## Relación con el pipeline
- Usado implícitamente por `enrich_properties.py` en consultas de `ST_Contains` contra `barrios_bogota`, `upz_bogota`, `localidades_bogota` y `avaluo_catastral_manzana`.
