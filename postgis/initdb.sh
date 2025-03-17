#!/bin/bash
set -e

# Configuración de PostgreSQL
DB_NAME="gisdb"
DB_USER="postgres"
DB_PASS="postgres"
DATA_DIR="/shapefiles"

echo "🟢 Verificando si la base de datos ya existe..."

# Verifica si la base de datos ya fue inicializada
if psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo "✅ La base de datos $DB_NAME ya existe. Verificando tablas..."
else
  echo "🚀 Creando la base de datos y habilitando PostGIS..."
  psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"
  psql -U "$DB_USER" -d "$DB_NAME" -c "CREATE EXTENSION postgis;"
fi

echo "📂 Buscando archivos SHP en $DATA_DIR..."

# Procesar cada carpeta individualmente
find "$DATA_DIR" -type d | while read DIR; do
  SHP_FILES=($(find "$DIR" -maxdepth 1 -type f -name "*.shp"))
  FILE_COUNT=${#SHP_FILES[@]}
  
  for SHP_FILE in "${SHP_FILES[@]}"; do
    FILE_NAME=$(basename "$SHP_FILE" .shp)
    DIR_NAME=$(basename "$DIR")
    
    if [ "$FILE_COUNT" -gt 1 ]; then
      TABLE_NAME="$FILE_NAME"
    else
      TABLE_NAME="$DIR_NAME"
    fi
    
    # Verifica si la tabla ya existe en la base de datos
    TABLE_EXISTS=$(psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT to_regclass('public.$TABLE_NAME') IS NOT NULL")
    
    if [ "$TABLE_EXISTS" == "t" ]; then
      echo "✅ La tabla $TABLE_NAME ya existe. Saltando importación."
    else
      echo "🔄 Importando: $TABLE_NAME desde $(dirname "$SHP_FILE")"
      shp2pgsql -I -s 4326 "$SHP_FILE" public."$TABLE_NAME" | psql -U "$DB_USER" -d "$DB_NAME"
      echo "✅ Importado: $TABLE_NAME"
    fi
  done

done

echo "🚀 Proceso de importación completado."
