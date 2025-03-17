FROM postgis/postgis:latest

# Instala herramientas necesarias
RUN apt-get update && apt-get install -y postgis postgresql-client

# Crea la carpeta donde se almacenarán los archivos SHP
RUN mkdir -p /shapefiles

# Copia el script de inicialización
COPY initdb.sh /docker-entrypoint-initdb.d/initdb.sh

# Da permisos al script
RUN chmod +x /docker-entrypoint-initdb.d/initdb.sh

# Exponer el puerto de PostgreSQL
EXPOSE 5432
