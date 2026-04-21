# lib/ — Utilidades compartidas

> **Estado:** 4 módulos (copias literales + extracción Fase 2.0 completa).

## Archivos

| Archivo | Origen | Propósito | Lecciones encapsuladas |
|---|---|---|---|
| `chunker.js` | Copia literal desde ARCA `lib/chunker.js` | Chunking semántico 500+50% con overlap por límite de oración/línea | L5 (chunks por párrafos), L6 (bug-fix overlap 2026-04-19) |
| `frontmatter_parser.js` | Copia literal desde ARCA `lib/frontmatter_parser.js` | Parser YAML flat minimalista, cero dependencies | L8 (parser flat) |
| `zep_metadata.js` | Extraído + parametrizado desde ARCA `zep_daily_emitter.js` | Sanitización + cap de metadata compliant con spec oficial Zep | L1 (cap 10 keys), L2 (solo escalares + arrays→CSV) |
| `zep_batching.js` | Extraído + parametrizado desde ARCA `zep_daily_emitter.js` + `zep_narrative_emitter.js` | Batching asfixia controlada + hard-stop on failure | L3 (batch 20 + sleep 1500ms), L4 (hard-stop DLQ pattern) |

## Razonamiento (Decisión B + ADR-002)

**Copias literales** (`chunker.js`, `frontmatter_parser.js`):
- **Ley F-5 Aislamiento:** el pipeline INL no debe depender de código ARCA en runtime (no `require('../../Aplicacion Arca/...')`).
- **Regla de Oro editorial:** emergencia empírica en ARCA primero → consolidación teórica en INL después.
- Ambos archivos son **funciones puras sin hardcoding de dominio** — se copiaron tal cual, diff zero validado.

**Extracciones parametrizadas** (`zep_metadata.js`, `zep_batching.js`):
- Aplicación explícita de **Pregunta A-1 del framework** al propio subsistema de ingesta (ADR-002).
- Ambos módulos extraen funciones puras desde scripts ARCA productivos, parametrizando los valores que eran hardcoded en ARCA (graph IDs, paths, etc.).

## Referencias

- `docs/lecciones_heredadas_de_arca.md` — catálogo completo de las 11 lecciones con origen, regla, y función que las encapsula.
- `docs/adr-001-cerebro-zep-inl.md` (Decisión B) — permiso original de copiar libs ARCA con duplicación consciente.
- `docs/adr-002-reutilizacion-scripts-arca.md` — decisión de stack Node compartido + librería común.
