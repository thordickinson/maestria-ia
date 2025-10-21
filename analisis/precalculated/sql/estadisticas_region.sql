CREATE TABLE IF NOT EXISTS region_stats (
    tipo_region VARCHAR(20) NOT NULL,         -- 'barrio', 'upz', 'localidad'
    codigo VARCHAR(50) NOT NULL,             -- gid o código
    nombre VARCHAR(255) NOT NULL,           -- nombre de la región
    estadisticas_propiedades JSONB NOT NULL,
    PRIMARY KEY (tipo_region, codigo)
);


-- Limpiar tabla antes
TRUNCATE region_stats;

-- 📄 Estadísticas por barrios
INSERT INTO region_stats (tipo_region, codigo, nombre, estadisticas_propiedades)
SELECT
  'barrio',
  b.gid::text,
  b.localidad,
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
FROM barrios b
LEFT JOIN property_data p
  ON ST_Contains(b.geom, p.geom)
LEFT JOIN avaluo_catastral_manzana m
  ON ST_Contains(b.geom, m.geom)
WHERE b.gid IS NOT NULL AND b.localidad IS NOT NULL
GROUP BY b.gid, b.localidad
ON CONFLICT (tipo_region, codigo)
DO UPDATE SET
  nombre = EXCLUDED.nombre,
  estadisticas_propiedades = EXCLUDED.estadisticas_propiedades;

-- 📄 Estadísticas por UPZ
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
  ON ST_Contains(u.geom, p.geom)
LEFT JOIN avaluo_catastral_manzana m
  ON ST_Contains(u.geom, m.geom)
WHERE u.gid IS NOT NULL AND u.nombre IS NOT NULL
GROUP BY u.gid, u.nombre
ON CONFLICT (tipo_region, codigo)
DO UPDATE SET
  nombre = EXCLUDED.nombre,
  estadisticas_propiedades = EXCLUDED.estadisticas_propiedades;

-- 📄 Estadísticas por localidad
INSERT INTO region_stats (tipo_region, codigo, nombre, estadisticas_propiedades)
SELECT
  'localidad',
  b.localidad,
  b.localidad,
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
FROM barrios b
LEFT JOIN property_data p
  ON ST_Contains(b.geom, p.geom)
LEFT JOIN avaluo_catastral_manzana m
  ON ST_Contains(b.geom, m.geom)
WHERE b.localidad IS NOT NULL
GROUP BY b.localidad
ON CONFLICT (tipo_region, codigo)
DO UPDATE SET
  nombre = EXCLUDED.nombre,
  estadisticas_propiedades = EXCLUDED.estadisticas_propiedades;
