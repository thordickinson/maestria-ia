# Preguntas pendientes para completar metodología

- **Volumen y cobertura temporal**
  - ¿Cantidad final de propiedades tras limpieza (n filas)?
  - ¿Período temporal cubierto por el JSON de agosto 2024 y si hubo filtros por fecha?

- **Definiciones de limpieza (además de lo documentado en 1.2)**
  - Umbrales exactos aplicados para outliers en `area` y `precio_venta` (percentiles/valores resultantes) y reglas de truncamiento.
  - Criterios/umbral para descartar/ajustar `parqueaderos` negativos.
  - Bounding box y reglas exactas para validar/imputar coordenadas; tratamiento de `estrato` fuera de [1–6].

- **Features del modelo base**
  - Lista final de variables usadas en `2.0.evaluacion_modelos_base.ipynb` (numéricas/categóricas) y variables descartadas.
  - Esquema de validación: `KFold` (n_splits), `random_state`, tamaño del hold-out y si hubo estratificación.

- **Aumentación geoespacial**
  - `OSM_PLACE_TYPES` definitivos usados en modelado y radios incluidos (`PLACE_SEARCH_RADIUS_METERS`).
  - Uso de `avaluo_catastral_manzana` y `avaluo_com`: ¿directo como features, por m², o solo para estadísticas regionales?

- **Resultados de modelado**
  - Métricas finales (RMSE/MAE/R²/MAPE) por modelo base y modelos aumentados (v0/v1/v2) en hold-out.
  - Mejores hiperparámetros de `XGBRegressor` (v2): `n_estimators`, `max_depth`, `learning_rate`, `subsample`, `colsample_bytree`, `reg_alpha`, `reg_lambda`.
  - Transformaciones aplicadas: `log(precio_venta)`, `log(area)`, normalizaciones, etc.

- **Infraestructura y BD**
  - Confirmar capas PostGIS disponibles: `barrios_bogota`, `upz_bogota`, `localidades_bogota`, `avaluo_catastral_manzana`, `estratos_manzana`, `gis_osm_pois_free_1`, `gis_osm_pois_a_free_1`.
  - SRID de todas las capas (¿4326?) y necesidades de reproyección.
  - Variables `.env` efectivas del alias `POSTGIS` y existencia de ambientes dev/prod.

- **Backend/Frontend**
  - Endpoints disponibles en `indexador-py/server.py` y relación con `property_data`/`region_stats`/modelos.
  - Vistas/inputs requeridos por `estimador-react/` para el estimador (formulario, mapa, filtros).

- **Criterios y riesgos**
  - Criterios de éxito (umbral de RMSE, cobertura geográfica mínima) y riesgos: sesgos, desbalance, scraping, ruido OSM.

- **Despliegue y operación**
  - Dónde corre PostGIS (local/Docker/Cloud) y plan de despliegue de frontend/backend.
  - Frecuencia de actualización de `property_data` y `region_stats` (batch/cron).
