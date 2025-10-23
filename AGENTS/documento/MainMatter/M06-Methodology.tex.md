# documento/MainMatter/M06-Methodology.tex

## Propósito
Describir la metodología completa: fuentes y preparación de datos, aumentación, modelado, validación y criterios de evaluación.

## Contenido esperado
- Datos: origen (scraping/portales), variables, limpieza e imputación.
- Aumentación: variables espaciales/contextuales (OSM, capas urbanas), derivadas y agregaciones.
- Modelado: selección de algoritmos (RF, XGBoost/LightGBM), transformación de variables (log), pipelines.
- Validación: CV/hold-out, métricas (RMSE, MAE, R², MAPE), tratamiento de outliers.
- Infraestructura: organización de notebooks (`analisis/notebooks/`), artefactos y reproducibilidad.
