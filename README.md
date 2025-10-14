# maestria-ia
Repositorio de código con los datos de la maestría


## Pasos para preparar los datos
* Ejecutar los notebooks hasta obtener `aptos_bogota_enriched.csv`.
* Cargar datos abiertos en postgis.
* Ejecutar el script de enriquecimiento `python enrich_properties.py`.
  * Crea la tabla `property_data`.
  * Calcula estadísticas por barrio, localidad, upz.
* Ejecutar hasta la creacion de los modelos `./indexador-py/notebooks/3.2.1_modelo_aumentado_v1.ipynb`.

## Ejecutar el servidor

Antes se deben haber preparado los datos

Iniciar el backend

```bash
cd indexador-py
uv venv
source .venv/Scripts/activate
uv pip install -r requirements.txt
python server.py
```

Iniciar el front end

```bash
cd estimador-react
pnpm install
pnpm run dev
```

