* Busqueda de fuentes de datos
    * Datos de inmuebles: JSON único de agosto 2024 desde `builker-col/bogota-apartments` (GitHub Releases).
    * Datos abiertos del distrito consultados en agosto 2025 (para PostGIS): barrios, UPZ, localidades, estratos por manzana, avalúos catastrales/comerciales, POIs OSM (capas importadas).
    * Información adicional de sitios cercanos (OSM) por categorías agregadas.

* Selección de fuentes de datos
    * Complejidad de webscraping en portales (protecciones activas) → no usado en esta iteración.
    * Selección del dataset GitHub (agosto 2024) como base única.

* Exploración de datos
    * Como se exploro
    * Graficas que se obtuvieron

* Limpieza de datos
    * Umbrales outliers: `area ≤ p99 = 464 m²`, `precio_venta ≤ p99 = 5.4e9 COP`.
    * Precio mínimo válido: `precio_venta ≥ 50,000,000` COP.
    * Área 0: imputación por mediana de comparables (mismo `estrato`, `habitaciones`, `banos`, `sector`); si no hay comparables, mediana por `estrato`.
    * Parqueaderos negativos: reemplazo por moda en el mismo `estrato` (o moda global).
    * Coordenadas: corrección de out-of-bounds imputando mediana por `sector`, o mediana global; bounding box final Bogotá: `lat ∈ [4.4, 4.9]`, `lon ∈ [-74.3, -73.9]` (684 registros fuera, removidos tras imputación).
    * Estrato fuera de [1–6]: imputación por modo del `sector` (si no hay, modo global). Casos residuales pueden persistir para tratamiento posterior.

* Creación de modelo base
    * Features base (≤5% NaNs): `area`, `habitaciones`, `banos`, `administracion`, `parqueaderos`, `sector`, `estrato`, `antiguedad`, `latitud`, `longitud`, amenidades (`alarma`, `ascensor`, `conjunto_cerrado`, `gimnasio`, `piscina`, `zona_de_bbq`), y derivadas (`administracion_imputada`, `estrato_imputado`).
    * Preproceso: `SimpleImputer(mean/most_frequent)` + `StandardScaler` + `OneHotEncoder`.
    * Validación: `KFold(n_splits=5, shuffle=True, random_state=42)`, métrica `RMSE` (neg_root_mean_squared_error).
    * Resultados CV (aprox): RF ≈ 245M, XGB ≈ 245M, LGBM ≈ 246M; lineales ≈ 348M; SVR ≈ 913M.
    * Versión con `log(precio_venta)` y `log(area)` mejora métricas; hold-out 20% RF: RMSE ≈ 250.6M, MAE ≈ 129.9M, R² ≈ 0.915.

* Aumentación de datos
    * Script: `indexador-py/enrich_properties.py` (asíncrono, semáforo de concurrencia).
    * Variables contextuales: conteos por radios `100, 300, 500, 1000, 2000` metros en categorías OSM: `education`, `healthcare`, `retail_access`, `dining_and_entertainment`, `accommodation`, `parks_and_recreation`, `infrastructure_services`, `cultural_amenities`.
    * Metadatos añadidos: `upz_calculada`, `barrio_calculado`, `localidad_calculada`; avalúos medios por geohash (`catastral`, `comercial`).
    * Persistencia: tabla dinámica `property_data`; estadísticas por región en `region_stats` (barrio, UPZ, localidad) via `ST_Contains` y agregados (n, medias, std, cuartiles).

* Creación del modelo de datos aumentados
    * v0: XGB con log(area) y one-hot; variables estructurales dominan; enriquecidas con aporte marginal.
    * v1 (reducido + `barrio_top`): Hold-out RMSE ≈ 254.66M, MAE ≈ 136.54M, R² ≈ 0.9139. Exporta `xgboost_model_2.1.pkl`.
    * v2 (RandomizedSearchCV, CV=3, n_iter=30): mejores params `n_estimators=500`, `max_depth=9`, `learning_rate=0.05`, `subsample=0.8`, `colsample_bytree=0.8`, `reg_alpha=0`, `reg_lambda=1`. Hold-out RMSE ≈ 233.49M, MAE ≈ 121.96M, R² ≈ 0.9276. Exporta `xgboost_model_2.2.pkl`.

* Capas PostGIS utilizadas
    * `barrios_bogota`, `upz_bogota`, `localidades_bogota`, `avaluo_catastral_manzana`, `estratos_manzana`, `gis_osm_pois_free_1`, `gis_osm_pois_a_free_1`. SRID esperado: 4326.

* Backend / API
    * `indexador-py/server.py` expone `GET /api/estimate`: combina `get_point_stats`, `get_region_stats` y `estimate(...)`. `model_version` por defecto "2.1" (considerar migración a 2.2).
    * Cáculo de metricas

* Desarrollo de utilidad para visualizar
    * Desarrollo del backend
        * Selección de python principalmente porque es mas compatible al momento de cargar y ejecutar modelos.
    * Desarrollo del frontend
        * Selección react por familiaridad
    * Despliegue
        * AWS



