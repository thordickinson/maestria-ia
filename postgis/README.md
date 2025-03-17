# 🗺️ SHP to PostGIS: Importador Automático de Shapefiles

Este proyecto proporciona un **contenedor Docker de PostGIS** que **importa automáticamente archivos Shapefile (`.shp`) en su primer arranque**.  
Está diseñado para **persistir los datos en PostgreSQL** y solo importar los archivos la primera vez que se ejecuta el contenedor.

## 🚀 Características
✔ **PostGIS listo para usar**  
✔ **Importación automática de `.shp`**  
✔ **Soporte recursivo**: busca archivos en todos los subdirectorios  
✔ **SRID 4326 (WGS 84)** por defecto  
✔ **Datos persistentes** mediante volúmenes de Docker  
✔ **Se puede volver a importar nuevos archivos manualmente**  

---

## 📌 Requisitos
- **Docker** (para contenedores)
- **Docker Compose** (para gestionar el stack)

---

## 🏗 Instalación y Uso

### 🔹 1️⃣ **Clonar el repositorio**
```sh
git clone https://github.com/tu-repositorio/shp-to-postgis.git
cd postgis
```

### 🔹 2️⃣ **Colocar archivos `.shp` en la carpeta `data/`**
Estructura de ejemplo:
```
data/
├── ciudades/
│   ├── bogota.shp
│   ├── bogota.dbf
│   ├── bogota.shx
│   ├── bogota.prj
├── rios/
│   ├── magdalena.shp
│   ├── magdalena.dbf
│   ├── magdalena.shx
│   ├── magdalena.prj
└── departamentos.shp
```

### 🔹 3️⃣ **Levantar el contenedor**
Ejecuta:
```sh
docker-compose up --build
```
✅ PostgreSQL se inicia, **se crea la base de datos** y **se importan automáticamente los archivos `.shp`**.

---

## 🎯 ¿Qué pasa después?
1. **Si el contenedor ya ha sido iniciado antes**, NO volverá a importar los `.shp`.  
2. **Si agregas nuevos `.shp` y quieres importarlos**, sigue estas opciones:  

### 🔹 **Opción 1: Importar manualmente nuevos `.shp`**
Si quieres importar nuevos archivos sin eliminar la base de datos:
```sh
docker exec -it postgis bash
```
Dentro del contenedor, usa:
```sh
shp2pgsql -I -s 4326 /shapefiles/nuevo_archivo.shp public.nueva_tabla | psql -U postgres -d gisdb
```

### 🔹 **Opción 2: Reiniciar y forzar importación desde cero**
Si quieres eliminar todo y volver a importar desde cero:
```sh
docker-compose down -v
docker-compose up --build
```
⚠ Esto **eliminará todos los datos existentes**.

---

## 🛠 Configuración de Base de Datos
Por defecto, usa estas variables:
```env
POSTGRES_DB=gisdb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```
Puedes modificarlas en el archivo `.env` o en `docker-compose.yml`.

---

## 📜 Licencia
MIT License.

---

## 🔗 Recursos
- [PostGIS Documentation](https://postgis.net/documentation/)
- [shp2pgsql Command Guide](https://postgis.net/docs/using_postgis_dbmanagement.html#shp2pgsql_usage)

---

