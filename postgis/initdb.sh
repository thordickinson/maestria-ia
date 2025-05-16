#!/bin/bash
set -e

# Función para imprimir con timestamp
log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') $*"
}

# Configuración de PostgreSQL
DB_NAME="gisdb"
DB_USER="postgres"
DB_PASS="postgres"
DATA_DIR="/shapefiles"

log "🟢 Verificando si la base de datos ya existe..."

# Verifica si la base de datos ya fue inicializada
if psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  log "✅ La base de datos $DB_NAME ya existe. Verificando tablas..."
else
  log "🚀 Creando la base de datos y habilitando PostGIS..."
  psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"
  psql -U "$DB_USER" -d "$DB_NAME" -c "CREATE EXTENSION postgis;"
fi

log "📂 Buscando archivos SHP en $DATA_DIR..."

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
      log "✅ La tabla $TABLE_NAME ya existe. Saltando importación."
    else
      log "🔄 Importando: $TABLE_NAME desde $(dirname "$SHP_FILE")"
      shp2pgsql -I -s 4326 "$SHP_FILE" public."$TABLE_NAME" | \
      psql -q -U "$DB_USER" -d "$DB_NAME" | \
      grep -v '^INSERT 0 1$'
      log "✅ Importado: $TABLE_NAME"
    fi
  done

done

log "🚀 Proceso de importación completado."
