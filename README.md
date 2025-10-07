# maestria-ia
Repositorio de código con los datos de la maestría


## Estadisticas a mostrar

Tomar geohash (nivel?): -> tablas `geohash_cercanias`
    Calcular Localidad, Barrio (Tablas de regiones)
    Calcular:
        * Centros comerciales, hospitales, Colegios, comercio? (Desde OSM)
        * Paraderos de SITP
        * { lat, lng, name, type }
        * Estaciones de Transmilenio
            * Puntos de interés en radio de 50 metros
            * Puntos de interés en radio de 100 metros
            * Puntos de interés en radio de 300 metros
            * Puntos de interés en radio de 500 metros
            * Puntos de interés en radio de 1000 metros
    Tabla: geohash, localidad, barrio, upz, cercanias_50, cercanias_100, cercanias_300, cercanias_500, cercanias_1000

Agrupar por Barrio, Localidad (Buscar por shape del barrio o localidad) -> barrios (necesario?)
    * Cantidad de hospitales
    * Cantidad de Paraderos
    * Cantidad de estaciones de TM

Tomar cada uno de los inmuebles
* Calcular el geohash
* Enriquecer con datos de localidad, barrio, UPZ, cercanias...
* Enriquecer con datos de proximidades al geohash de geohash_info
    * propiedad (area, habitaciones, banos, localidad, barrio, cantidad_cc_50, cantidad_hospitales_50)

Agrupar tabla `propiedad` por `barrio`, `localidad`, `upz`.

```sql
SELECT * FROM propiedades WHERE barrio = ?
```
* Calcular quintiles para habitaciones, banos, area, por barrio, localidad, upz, precio??
* Calcular cantidad de comercios?, cantidad de paraderos de SITP por barrio, localidad, upz??
* Promedio de precios en el barrio comparado con barrios cercanos?
* Revisar si las variables numéricas están dentro de la moda para el barrio/localidad/upz.


* Calcular promedio de:
    * Habitaciones en el barrio?
    * Baños en el barrio
    * Tamaño de Apartamento


## Pasos para preparar los datos
* Ejecutar los notebooks hasta obtener `aptos_bogota_enriched.csv`.
* Cargar datos abiertos en postgis.
* Ejecutar el script de enriquecimiento `python enrich_properties.py`.
* Cargar datos de propiedades `./indexador-py/precalculated/load_property_data.ipynb`.
* Ejecutar script para crear stats `estadisticas_region.sql`.


