# lib/ — Utilidades compartidas

> **Estado:** stub Fase 1. Archivos llegan en Fase 2.

Destino de las libs copiadas desde ARCA (Decisión B del sprint — duplicación consciente registrada en ADR-001-cerebro-zep-inl.md).

## Archivos previstos para Fase 2

| Archivo | Origen | Propósito |
|---|---|---|
| `chunker.js` | ARCA `_scripts_v5_cibernetica/lib/chunker.js` | Chunking 500+50% con cortes permitidos/prohibidos |
| `frontmatter_parser.js` | ARCA `_scripts_v5_cibernetica/lib/frontmatter_parser.js` | Parser YAML frontmatter + validación de schema |

## Razonamiento

**Decisión B:** copiar en lugar de importar. Razón desde framework:
- **Ley F-5 Aislamiento:** el pipeline INL no debe depender de código ARCA en runtime.
- **Regla de Oro editorial:** emergencia empírica en ARCA primero → consolidación teórica en INL después.
- Si en el futuro aparece una 3ª instancia con necesidad similar, promover a paquete npm compartido (Anti-Patrón 1 regla de las 3 instancias).
