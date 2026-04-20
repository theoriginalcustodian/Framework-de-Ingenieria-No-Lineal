# queries/ — Queries de validación y uso

> **Estado:** stubs Fase 1. Implementación arranca en Fase 2.

## Queries previstas

| Archivo | Fase | Propósito |
|---|---|---|
| `smoke_test.py` | Fase 2 | Sanity check post-ingesta canonical — confirma nodos por entity_type + dedupe |
| `cross_graph_validation.py` | Fase 3 | Valida que edges cross-graph del evidence apuntan a UUIDs canonical válidos |
| `sample_queries.py` | Fase 5 | Queries de ejemplo que el skill `inl-graph-oracle` invoca |

## Ejemplos de query target (Fase 5)

- "¿Qué leyes físicas prohíben Anti-Patrón 1?"
- "¿Qué patrones aplican en Fase Día-3 del PEAP?"
- "Dame todas las evidencias empíricas de ARCA que respaldan C-1"
- "¿Cuándo emergió el patrón Exocórtex (C-3) y en qué proyecto?"
- "¿Qué decisiones fundadas tienen a F-1 como ley impactada?"
- "Snapshot histórico del framework al 2026-04-20: estado de todas las entities."

## Patrón de consulta (Patrón C-5 ReAct desde Claude Code)

```
Claude Code (skill inl-graph-oracle)
  → decide si consultar canonical, evidence, o ambos
  → emite graph_search(graph_id=..., query=..., scope='nodes'|'edges')
  → compone respuesta citando sources (source_path de cada entity)
```
