# Estadísticas

A partir de la información de las áreas de las regiones almacenadas en base de datos, se debería cargar la información de las 
propiedades en otra tabla georeferenciada. 

Luego se iteran las regiones (UPZ, Barrio, Localidad), para así obtener la información estadística de las propiedades.

La idea es mostrarle al usuario datos de la zona comparadas contra el promedio, quintiles y devstandar del sector.

Por ejemplo, debería retornar un objeto de este estilo, el cual contiene las estádisticas agrupadas por región, tipo de región en la cual
se encuentra el apartamento.

```json
{
    "property": {
        "age": 4,
        "bathrooms": 2,
        "rooms": 3,
        "area": 64
    },
    "stats": {
        "upz": {
            "bathroom": {
                "max": 5,
                "min": 1,
                "average": 3,
                "stdev": 1
            },
            "rooms": {  "...": "same as bathroom" },
            "area": {  "...": "same as bathroom" },
            "age": { "...": "same as bathroom" }
        },
        "barrio": {
            "...": "same as upz"
        }
    }
}
```

El esquema de base de datos debería contener los siguientes campos:

region_type,region_code,region_name,region_geometry,region_stats


* region_type: debe ser una de las siguientes: upz, barrio, localidad
* region_code: el identificador interno de la región
* region_name: el nombre a mostrar de la region
* region_geometry: es la geometría que se usará para consultar las estadísticas del punto que el usuario envía
* region_stats debe contener las estadísticas precalculadas de cada una de las variables de la propiedad.



Para calcular estos valores usar el script que está en `precalculated/sql/estadisticas_region.sql`




