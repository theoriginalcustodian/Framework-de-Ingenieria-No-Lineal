# ingesters/ — Scripts de ingesta

> **Estado:** stubs Fase 1. Implementación arranca en Fase 2.

## Ingesters previstos

| Archivo | Fase | Lenguaje | Propósito |
|---|---|---|---|
| `canonical_ingester.py` | Fase 2 | Python | Bootstrap del grafo canonical — Leyes, Patrones, Manifiestos, Teoría, Fases, Conceptos. Idempotente. Emite `canonical_uuid_map.json` |
| `evidence_ingester.py` | Fase 3 | Python | Bootstrap del grafo evidence — Evidencia, Avances, Traumas, Snapshots, ADRs. Chunking + bitemporal + cross-graph UUID |
| `delta_ingester.js` | Fase 4 | Node.js | Incremental — usa `git tag ultimo-zep-sync` como anchor. Hard-stop on batch failure. Invocable desde CI post-merge |

## Orden de ejecución

```
1. bootstrap_graphs.py --apply        (crea los 2 grafos)
2. setup_ontology.py --apply          (aplica ontología v2)
3. canonical_ingester.py              (bootstrap canonical, emite UUID map)
4. evidence_ingester.py               (bootstrap evidence, usa UUID map)
5. delta_ingester.js (CI)             (incremental en cada merge a master)
```

## Gotchas heredados de ARCA (aplicables aquí)

1. **Batching con asfixia controlada:** `BATCH_SIZE=20`, `SLEEP_MS=1500` (lección ARCA 7).
2. **Hard-stop on failure:** el tag git NO avanza, próximo run reintenta (lección ARCA 8).
3. **Archivos eliminados NO se ingestan:** filtrar en `git diff --name-only` con flag `--diff-filter=ACMR` (lección ARCA 5).
4. **Episodios contrastivos narrativos** para invalidación bitemporal (lección ARCA 6).
5. **`FORCE_FILES` env var** para re-ingesta manual de archivos específicos (lección ARCA 13).
