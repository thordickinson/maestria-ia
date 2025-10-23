# documento/main.tex

## Propósito
Archivo maestro LaTeX que configura la clase del documento (`MIA-USA.cls`), paquetes, metadatos y ensambla todas las secciones (`FrontMatter/`, `MainMatter/`, `BackMatter/`).

## Contenido y flujo
- Define metadatos (`\title`, `\author`, `\documenttype`, `\advisor`) y `hyperref`.
- Genera tablas automáticas: `\tableofcontents`, `\listoffigures`, `\listoftables`.
- Incluye capítulos en orden:
  - Glosario → `FrontMatter/F01-Glossary`
  - Resumen → `FrontMatter/F02-Abstract`
  - Introducción → `MainMatter/M01-Introduction`
  - Estado del Arte → `MainMatter/M02-PreviousWork`
  - Problema de investigación → `MainMatter/M03-ResearchProblem`
  - Justificación → `MainMatter/M04-Justification`
  - Objetivos → `MainMatter/M05-Objectives`
  - Metodología → `MainMatter/M06-Methodology`
  - Resultados y Análisis → `MainMatter/M07-Results`
  - Discusión → `MainMatter/M08-Discussion`
  - Conclusiones y Trabajo Futuro → `MainMatter/M09-Conclusions`
  - Anexos → `BackMatter/B01-Anexos`
- Bibliografía: estilo `apalike` con `Bibliography/referencias.bib`.

## Puntos de atención
- Evitar editar archivos generados (`.aux`, `.log`, `.toc`, `.lof`, `.lot`).
- Mantener coherencia de capítulos con los `\chapter{}` definidos.
