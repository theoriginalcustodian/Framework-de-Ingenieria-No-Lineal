# 📍 SNAPSHOT DE ESTADO — Repositorio INL

> **ESTADO** del Handshake V5. Qué está pasando *ahora mismo* en el repo. Si un agente retoma una sesión mañana, este archivo le permite reconstruir el contexto en <15 minutos (Anti-patrón 4 — cierre térmico).
>
> **Se actualiza:** al cierre de toda sesión que modifique la estructura o agregue contenido consolidado al árbol canónico.

---

## 🔖 Metadatos

- **Última actualización:** 2026-04-20 (tercera sesión — ADR-002 aprobado, giro a Node)
- **Actualizado por:** Arquitecto (CPU) + Agente Claude (GPU)
- **Fase PEAP-V5:** Fuera del ciclo — meta-documentación viva
- **Rama activa:** `master`
- **Estado del árbol:** modificaciones sin commit (naming F-* sesión previa + Fase 1 del Sprint INL-ZepBrain sesión 2 + ADR-002 + docs actualizados sesión 3). Último commit: `fbc2ce6`.

---

## 🧭 Posición actual

Este repo **no** está en un ciclo fundacional PEAP-V5. Es el Exocórtex canónico del framework y se rige por:
- **Ritmo de evolución:** reactivo a cambios teóricos del framework, no por ciclos de 144/360h
- **Criterio de cierre térmico:** cada sesión significativa debe dejar `SNAPSHOT_ESTADO.md` actualizado
- **Criterio de avance:** una sección se considera "madura" cuando supera el Delta Cognitivo y se muda de `Nuevos archivos - no commit/` al árbol canónico

---

## 🔥 Iniciativa en curso

**Nombre:** Sprint INL-ZepBrain — cerebro semántico del framework en Zep Cloud
**Objetivo:** construir el Framework INL como 2 grafos Zep consultables (canonical + evidence), alimentados por pipeline híbrido (Python para ontología + Node.js para ingesta con librería compartida ARCA↔INL), consultables desde Claude Code vía slash command + skill. Dogfooding nivel 2 de Patrón C-3 Exocórtex.
**Plan maestro:** 5 fases + Fase 2.0 insertada por ADR-002.

| Fase | Entregable | Estado |
|---|---|---|
| **Fase 1 — Especificación técnica** | ADR-001 + schema metadata + ingestion policy + ontology Pydantic + scaffolding | ✅ **Cerrada** (3 docs consolidados en `zep-pipeline/docs/` + ontology/ Pydantic completo + scaffolding completo) |
| **Fase 2.0 — Extracción de `lib/` Node compartida** | ADR-002 aprobado + 6 módulos Node puros parametrizados (`zep_metadata.js`, `zep_batching.js`, `zep_bitemporal.js`, `zep_delta_engine.js`, `zep_contrast_emitter.js`, `zep_polling.js`) + catálogo `lecciones_heredadas_de_arca.md` + unit tests vitest | 🟡 **Próximo bloqueante** — ADR-002 aprobado, extracción por empezar |
| **Fase 2.1 — Pipeline canonical (Node)** | `bootstrap_graphs.py --apply` + `setup_ontology.py --apply` + `canonical_ingester.js` consumiendo `lib/` + queries de validación | ⚪ Pendiente Fase 2.0 |
| **Fase 3 — Pipeline evidence (Node)** | `evidence_ingester.js` consumiendo `lib/` + detección bitemporal + cross-graph UUID | ⚪ Pendiente |
| **Fase 4 — Delta ingester Node** | `delta_ingester.js` consumiendo `lib/zep_delta_engine.js` + `git tag ultimo-zep-sync` + hard-stop on batch failure + GitHub Action | ⚪ Pendiente |
| **Fase 5 — Integración Claude Code** | Slash command `/consultar-cerebro-inl` + skill `inl-graph-oracle` + 5ª auditoría en `/audit-coherencia-docs` | ⚪ Pendiente |
| **Fase 6 (futura, out-of-scope)** | Refactor ARCA para consumir `zep-pipeline/lib/` (ADR-003 cuando corresponda) | ⚪ Fuera del sprint actual |

**Iniciativa previa (cerrada):** Personalización de Claude Code para el repo INL — 4 fases completadas + tests T1-T6 PASS. Documentada en `REGISTRO_TRAUMAS.md 2026-04-20` (3 entradas).

---

## ✅ Decisiones cerradas esta sesión (2026-04-20 — Sprint INL-ZepBrain Fase 1)

**Decisiones CPU del sprint (8 totales, todas aprobadas):**

- **A** — 2 grafos standalone especializados por volatilidad (`inl-framework-canonical` + `inl-framework-evidence`)
- **B** — Copiar libs ARCA al pipeline (`chunker.js`, `frontmatter_parser.js`) — duplicación consciente
- **C** — Schema-first (contrato metadata explícito antes de ingesta)
- **D** — ADR formal completo (vs ADR mínimo) por impacto transversal
- **E** — Interfaz dual: slash command + skill `inl-graph-oracle`
- **F** — Ontología v2 especializada por grafo: 5 entities + 6 edges por grafo (40-50% margen evolutivo). Rediseñada sobre v1 (10/10 uniforme) aplicando navaja Ockham + Ley F-1 Anti-Hardcoding + Ley F-5 Adaptadores
- **G** — Proyecto Zep dedicado `inl-framework` (aislado de proyectos Zep existentes del operador)
- **H** — Nodalización Camino C: `json` + `fact_triple` declarativo para canonical (determinístico), mixto controlado para evidence, cross-graph por UUID vía regex `(F|O|R|C|A|G|AP|Dia)-\d+`

**Validaciones empíricas ejecutadas (2 spikes V-RES):**

- Spike #1 (grafo `inl-test-ontology`, borrado) — confirmó que extractor LLM de Zep en ingesta `text` inventa edge types (`APRECIO_EN` no declarado) y produce naming impredecible → motivó pivot a Camino C
- Spike #2 (grafo `inl-test-fact-triple`, borrado) — confirmó que `add_fact_triple` con `entity_name` canónico funciona determinístico + dedupe por name + edge type estricto. Caps documentados: `name` ≤50 chars, `fact` ≤250 chars, `fact_name` SCREAMING_SNAKE_CASE ≤50 chars

**Meta-decisión estructural:** naming canónico uniforme de Leyes Físicas `F-1..F-6` (antes `Ley 1..Ley 6`). 43 edits ejecutados en 13 archivos del repo + 3 borradores del sprint. Ver `REGISTRO_TRAUMAS.md` primera entrada para razonamiento completo.

---

## 📋 Pendientes activos (ordenados por prioridad)

### Fase 1 del Sprint INL-ZepBrain — ✅ CERRADA

1. ✅ **Task #3 — ontología Pydantic v2** — `zep-pipeline/ontology/ontology_definition.py` (10 entities + 12 edges con `EntityEdgeSourceTarget` + `properties`, no `custom_fields`) + `setup_ontology.py` (`--dry-run` / `--apply` / `--graph`) + `bootstrap_graphs.py` + `constants.py` (graph IDs + caps + regex cross-graph).
2. ✅ **Task #4 — Scaffolding `zep-pipeline/`** — tree completo: `lib/`, `ingesters/`, `ontology/`, `queries/`, `tests/`, `docs/`, `audit_reports/` + `README.md` + `package.json` + `requirements.txt` + `.env.example` + `.gitignore` + stubs `tests/audit_edge_entropy.py` + `ontology/concepto_canonico_kinds.md`.
3. ✅ **Task #5 — Memoria del sprint actualizada** — `memory/project_sprint_inl_zepbrain.md` refleja cierre Fase 1 al 100%.
4. ✅ **Consolidación de los 3 borradores** — movidos a `08-implementaciones-referencia/zep-pipeline/docs/` (ADR-001, metadata_schema, ingestion_policy). Carpeta `Nuevos archivos - no commit/` limpia.

### Para ejecutar Fases 2-5

5. 🟡 **Fase 2.0 — Extracción de `lib/` Node compartida** — próximo bloqueante (ADR-002 aprobado 2026-04-20). Requiere: leer los 4 scripts ARCA (`zep_sensor_emitter.js`, `zep_pr_ingest.js`, `zep_daily_emitter.js`, `zep_narrative_emitter.js`) → extraer funciones puras parametrizables a 6 módulos `lib/` → unit tests vitest → catálogo `docs/lecciones_heredadas_de_arca.md` con 13+ lecciones empíricas.
6. ⚪ **Fase 2.1 — Ingesta bootstrap canonical (Node)** — requiere Fase 2.0. Cargar `ZEP_API_KEY` del proyecto INL en `.env` → `bootstrap_graphs.py --apply` (Python) → `setup_ontology.py --apply` (Python) → `canonical_ingester.js` consumiendo `lib/` → smoke test + `audit_edge_entropy.py` pasa.
7. ⚪ Fase 3 — `evidence_ingester.js` con detección bitemporal + cross-graph UUID
8. ⚪ Fase 4 — `delta_ingester.js` post-merge con GitHub Action
9. ⚪ Fase 5 — Integración Claude Code (slash + skill)

### Meta / gobernanza

10. ⚪ **Commit pendiente** — Ley F-6 HITL. Cambios sin commit: (a) 13 archivos del naming F-* uniforme (sesión 1), (b) `zep-pipeline/` completo de Fase 1 (sesión 2) — 13 archivos nuevos en `ontology/`, `lib/`, `ingesters/`, `queries/`, `tests/`, `docs/`, `audit_reports/` + configs raíz, (c) ADR-002 aprobado (sesión 3) + SNAPSHOT + REGISTRO_TRAUMAS + README zep-pipeline actualizados + memoria sprint sincronizada. Commit vía rama + PR (cláusula de inmutabilidad de `CONSTITUCION.md § punto 3`). Decisión del Arquitecto cuándo.

---

## 🚧 Deuda conocida

- `GEMINI.md` **NO se modificó** por decisión CPU — se mantiene como adaptador para el agente Antigravity. Contiene Leyes Físicas y Handshake que ahora también viven en `AGENTS.md`/`CONSTITUCION.md`. Duplicación conceptual aceptada (excepción explícita a Ley F-1 anti-hardcoding — registrada como tradeoff por compatibilidad con otro runtime).
- Skill `nonlinear-engineering` duplicado intencionalmente en 2 ubicaciones (fuente canónica en `08-implementaciones-referencia/skills/` + copia runtime en `.claude/skills/`). Tradeoff registrado en REGISTRO_TRAUMAS 2026-04-20 (γ"). Sincronización manual al modificar la fuente.
- `~/.claude/CLAUDE.md` global contiene instrucciones ARCA-específicas que contaminan este repo (resolución fuera de scope — el humano lo corrige por su lado).
- Carpeta `05-evidencia/` mencionada en el mapa del Exocórtex pero contenido no auditado en esta sesión (sigue pendiente).
- **`constitucion-agente-inl.md` excluido del plan α-full de naming** — es template externo con numeración propia de 8 leyes (no son las 6+4+5 del CONSTITUCION.md de este repo). Documentado como falso positivo.
- **Cap de keys en tope:** 4 de las 10 entities (Patron, FasePEAP, ProyectoFuente, SnapshotHistorico) usan 10/10 metadata keys. Si aparece necesidad de una key 11, priorizar mover al body (R1 del schema). Preserva Ley F-1.
- **GEMINI.md sin renaming `F-*`:** mantiene `Ley 1..Ley 6` por consistencia con su rol de adaptador Antigravity intocado. Es excepción adicional al plan α-full.

---

## 🧱 Próximo paso bloqueante

**Fase 2.0 — Extracción de librería Node compartida** (ADR-002 aprobado 2026-04-20 sesión 3). Arranque requiere, en orden:

1. Crear `zep-pipeline/docs/lecciones_heredadas_de_arca.md` — catálogo con 13+ lecciones empíricas de ARCA (origen en PR/commit ARCA + función en `lib/` que la encapsula + test de validación).
2. Extraer `zep-pipeline/lib/zep_metadata.js` — `sanitizeFrontmatterForZep()` + `capMetadataKeys()` desde `zep_daily_emitter.js`.
3. Extraer `zep-pipeline/lib/zep_batching.js` — batching resiliente con hard-stop + sleep configurables.
4. Extraer `zep-pipeline/lib/zep_bitemporal.js` — ruteo histórico/vivo (`birthtime` vs `mtime` vs fecha-body) + ordenamiento cronológico.
5. Extraer `zep-pipeline/lib/zep_delta_engine.js` — core de detección A/M/D via `git diff --name-status` + hunks + `FORCE_FILES` + tag `ultimo-zep-sync`.
6. Extraer `zep-pipeline/lib/zep_contrast_emitter.js` — patrón P15 para invalidación bitemporal en rotaciones workflow-level.
7. Extraer `zep-pipeline/lib/zep_polling.js` — L3 polling con timeout no-bloqueante (fix P19).
8. Unit tests vitest en `zep-pipeline/tests/` cubriendo cada módulo sobre datasets sintéticos.
9. Checkpoint CPU antes de avanzar a Fase 2.1.

Estimación: ~2 sesiones GPU + checkpoints CPU por módulo extraído.

**Después de Fase 2.0:** Fase 2.1 — bootstrap canonical con `canonical_ingester.js` consumiendo `lib/`, precedido por `bootstrap_graphs.py --apply` + `setup_ontology.py --apply` (ambos Python sin cambios, validados por ADR-001).

**Commit pendiente:** Ley F-6 HITL — lo ejecuta el Arquitecto cuando decida. Los cambios actuales están en disco sin commitear (preferencia `feedback_modo_trabajo` + cláusula de inmutabilidad de `CONSTITUCION.md`).
