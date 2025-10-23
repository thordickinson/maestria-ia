# Índice de Agentes (AGENTS/index)

Este índice define el estándar para documentar e indexar el repositorio dentro de la carpeta `AGENTS/`, de forma que un agente pueda comprender rápidamente el propósito y uso de cada carpeta y archivo relevante.

## Objetivos

- **Trazabilidad**: Mantener descriptores por carpeta/archivo que expliquen objetivo, entradas, salidas y dependencias.
- **Estructura espejo**: Replicar la estructura del repo dentro de `AGENTS/` con `index.md` por carpeta y `.md` por archivo relevante.
- **Navegación**: Enlaces cruzados entre descriptores para contextualizar módulos y flujos.

## Alcance

- Se documentan carpetas y archivos de código, datos de ejemplo, notebooks, configuraciones y artefactos operativos relevantes.
- Se excluyen binarios, artefactos generados, `build/`, dependencias externas, archivos enormes no versionados o imágenes no críticas.

## Estructura

- `AGENTS/` replica el árbol relevante del repo.
- Por cada carpeta `path/to/dir/` habrá `AGENTS/path/to/dir/index.md`.
- Por cada archivo relevante `path/to/file.ext` habrá `AGENTS/path/to/file.ext.md`.

Ejemplo:
```
AGENTS/
  index.md
  analisis/
    index.md
    notebooks/
      index.md
      1.2.analisis_limpieza_imputacion.ipynb.md
  estimador-react/
    index.md
    src/
      index.md
      App.tsx.md
```

## Plantillas

### 1) Carpeta: `index.md`

```
# [Ruta de carpeta]

## Propósito
Breve descripción del objetivo de la carpeta y su rol en el proyecto.

## Contenido relevante
- **Subcarpetas**: [lista breve con propósito]
- **Archivos clave**: [lista con 1 línea por archivo]

## Flujo y dependencias
- **Entradas**: [datos/config previos]
- **Salidas**: [artefactos generados]
- **Dependencias internas**: [enlaces a otros descriptores]

## Puntos de atención
- **Convenciones**: [nombres, formatos]
- **Riesgos**: [datos sensibles, tamaño, performance]

## Navegación
- [../index.md](../index.md) | [↑ raíz AGENTS](../../index.md)
```

### 2) Archivo: `file.ext.md`

```
# [Ruta de archivo]

## Propósito
Qué hace este archivo, por qué existe.

## Interfaz
- **Entradas**: [parámetros, archivos, variables de entorno]
- **Salidas**: [retornos, artefactos]

## Uso
- **Cómo se ejecuta/usa**: [comando, import]
- **Ejemplo mínimo**: [snippet breve si aplica]

## Dependencias
- **Internas**: [enlaces a módulos internos]
- **Externas**: [paquetes, servicios, APIs]

## Notas operativas
- **Rendimiento**: [tamaño/tiempo]
- **Datos**: [formatos, esquemas]
- **Seguridad**: [credenciales, PII]

## Navegación
- [./index.md](./index.md) (si existe) | [carpeta](../index.md)
```

## Metadatos recomendados

- **owner**: responsable
- **status**: draft/active/deprecated
- **last_review**: YYYY-MM-DD
- **tags**: lista de etiquetas

Se colocan al inicio del descriptor como una lista simple:
```
- owner: equipo-ml
- status: active
- last_review: 2025-10-23
- tags: [etl, notebook, modelo]
```

## Reglas de exclusión (por defecto)

- `build/`, `dist/`, `.venv/`, `node_modules/`
- Archivos binarios grandes, imágenes no críticas, caches, lockfiles generados
- `.DS_Store`, temporales, descargas

Estas reglas pueden ajustarse en `AGENTS/.agentsignore` (opcional), una por línea con globs.

## Proceso de mantenimiento

1. **Descubrir**: listar árbol del repo aplicando exclusiones.
2. **Seleccionar**: marcar lo relevante (código, datos ejemplo, notebooks, infra).
3. **Espejar**: crear estructura y `index.md` por carpeta.
4. **Describir**: crear `.md` por archivo relevante con la plantilla.
5. **Enlazar**: referencias entre descriptores.
6. **Revisar**: validar enlaces y cobertura.

## Convenciones

- Idioma: español (breve y accionable).
- Formato: Markdown simple, sin comentarios innecesarios.
- Enlaces relativos dentro de `AGENTS/`.
- No duplicar contenido; enlazar cuando corresponda.

## Carpetas documentadas

- **bibliografia/**: Documentos científicos y resúmenes. Cada PDF tiene descriptor espejo en `AGENTS/bibliografia/`.
  - [AGENTS/bibliografia/index.md](./bibliografia/index.md)

- **__notas__/**: Notas del autor para trabajo en curso. Se usan como insumos para actualizar y refinar el contenido de `documento/` (no forman parte del índice público del documento).

## Navegación

- Raíz del índice: `AGENTS/index.md` (este archivo).
- Desde aquí partimos a cada carpeta espejo cuando se creen sus `index.md`.
