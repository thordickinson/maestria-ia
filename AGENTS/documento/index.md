# documento/

## Propósito
Fuente LaTeX del documento principal (tesis/informe). Contiene el archivo maestro y secciones en `FrontMatter/`, `MainMatter/`, `BackMatter/`, así como bibliografía, imágenes y tablas.

## Contenido relevante (.tex)
- main.tex — Archivo maestro que incluye preámbulo, paquetes, y ensambla todas las secciones.
- FrontMatter/ — Portada, resumen, glosario y elementos iniciales.
- MainMatter/ — Capítulos del cuerpo principal (introducción, estado del arte, problema, metodología, resultados, discusión, conclusiones).
- BackMatter/ — Anexos e índice.

## Flujo
- Compilación: `main.tex` incluye secciones por orden lógico y genera artefactos (`.aux`, `.log`, `.toc`, `.lof`, `.lot`).
- Estilo: clase `MIA-USA.cls` y recursos en `Images/`, `Tables/`, `Bibliography/`.

## Puntos de atención
- Mantener coherencia de nomenclatura por prefijo: `Fxx-`, `Mxx-`, `Bxx-`.
- Evitar ediciones directas en archivos generados (*.aux, *.log, *.toc, *.lof, *.lot).

## Navegación
- FrontMatter/
- MainMatter/
- BackMatter/
