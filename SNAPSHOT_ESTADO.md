# 📍 SNAPSHOT DE ESTADO — Repositorio INL

> **ESTADO** del Handshake V5. Qué está pasando *ahora mismo* en el repo. Si un agente retoma una sesión mañana, este archivo le permite reconstruir el contexto en <15 minutos (Anti-patrón 4 — cierre térmico).
>
> **Se actualiza:** al cierre de toda sesión que modifique la estructura o agregue contenido consolidado al árbol canónico.

---

## 🔖 Metadatos

- **Última actualización:** 2026-04-21 (tercera sesión — Fase 3 cerrada, canonical + evidence ingestados)
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
| **Fase 2.0 — Extracción de `lib/` Node compartida** | Scope **reducido** a ingesta puntual (no CI): 2 copias literales (`chunker.js`, `frontmatter_parser.js`) + 2 extracciones parametrizadas (`zep_metadata.js`, `zep_batching.js`) + catálogo `lecciones_heredadas_de_arca.md` (11 lecciones) + unit tests vitest | ✅ **Cerrada** (sesión 3) |
| **Fase 2.1 — Pipeline canonical (Node)** | 2 grafos creados + ontología aplicada (5E+6Ed canonical, 5E+6Ed evidence) + `canonical_ingester.js` ejecutado: 50 nodos + 21 edges + 569 body episodes ingestados. Smoke test positivo vía MCP. | ✅ **Cerrada** (sesión 3, 2026-04-21 00:26 ART) |
| **Fase 3 — Pipeline evidence (Node)** | `evidence_ingester.js` + `evidence_source_map.js`: **17 nodos + 14 edges + 358 body episodes** en `inl-framework-evidence`. Cross-graph resolution por regex `(F\|O\|R\|C\|A\|G\|AP\|Dia)-\d+` sobre body → refs en metadata `canonical_refs_csv` (no edges cross-graph — grafos standalone aislados por diseño). ADR-001 detecta 15 refs canonical. | ✅ **Cerrada** (sesión 3, 2026-04-21 00:34 ART) |
| **Fase 4 — Delta ingester Node** | FUERA DEL SCOPE "ingesta puntual" del ADR-002 reducido. Si en el futuro se necesita ingesta continua post-merge vía GitHub Actions, se abre ADR nuevo + se extraen los 4 módulos adicionales (zep_delta_engine, zep_contrast_emitter, zep_polling, etc.) de ARCA. | ⚪ **Diferida** (out-of-scope sprint actual) |
| **Fase 5 — Integración Claude Code** | Slash command `/consultar-cerebro-inl` + skill `inl-graph-oracle` + 5ª auditoría en `/audit-coherencia-docs`. Consume los 2 grafos via MCP Zep para retorno semántico al operador. | 🟡 **Próximo bloqueante** |
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

5. ✅ **Fase 2.0 — Extracción de `lib/` Node compartida** — cerrada en sesión 3 con scope reducido. Entregables: `zep-pipeline/lib/{chunker.js, frontmatter_parser.js, zep_metadata.js, zep_batching.js}` + `zep-pipeline/tests/lib/{zep_metadata.test.js, zep_batching.test.js}` + `zep-pipeline/docs/lecciones_heredadas_de_arca.md` con 11 lecciones + `package.json` actualizado a CommonJS + `lib/README.md` documentado.
6. ✅ **Fase 2.1 — Ingesta bootstrap canonical (Node)** — cerrada en sesión 3. Entregables: `zep-pipeline/ingesters/canonical_source_map.js` (mapa declarativo: 28 staticNodes + 5 fileMappings + 21 staticEdges) + `zep-pipeline/ingesters/canonical_ingester.js` (ingester Node con fallback HTTP directo al wire format snake_case porque el SDK 2.22 no serializa `graph_id`) + ontología Pydantic corregida (`EntityEdgeSourceTarget` import top-level) + ingesta ejecutada contra tenant `inl_framework`: **50 nodos + 21 edges + 569 body episodes** en `inl-framework-canonical`.
7. ✅ **Fase 3 — Evidence ingester** — cerrada en sesión 3. Entregables: `zep-pipeline/ingesters/evidence_source_map.js` (mapa: 3 staticNodes + 3 fileMappings + 2 staticEdges) + `zep-pipeline/ingesters/evidence_ingester.js` (mismo patrón HTTP directo que canonical, con extracción de canonical_refs por regex y edges EMERGIO_EN/GENERADO_EN dinámicos). Ingesta ejecutada: 17 nodos + 14 edges + 358 body episodes en `inl-framework-evidence`. Smoke test positivo.
8. ⚪ **Fase 4 — Delta ingester** — diferida fuera de scope (ADR-002 reducido era ingesta puntual local, no continuous CI).
9. 🟡 **Fase 5 — Integración Claude Code** — próximo bloqueante. Consumir los 2 grafos Zep via MCP desde skills/slash commands para retorno semántico al operador. Componentes: (a) slash command `/consultar-cerebro-inl` que hace `zep_graph_search` scope=edges con cross_encoder sobre los 2 grafos; (b) skill `inl-graph-oracle` en `.claude/skills/` con protocolo ReAct para consulta orientada; (c) 5ª auditoría en `/audit-coherencia-docs` que compara los códigos canonical del repo filesystem vs los nodos canonical ingestados en Zep (detecta drift).

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

**Fase 5 — Integración Claude Code** (Fases 2.0 + 2.1 + 3 cerradas; Fase 4 diferida). Arranque:

1. **Slash command `/consultar-cerebro-inl`** en `.claude/commands/consultar-cerebro-inl.md`. Toma argumento con query del operador, invoca `mcp__zep__zep_graph_search` con `graph_id` rotando entre `inl-framework-canonical` y `inl-framework-evidence`, combina resultados, devuelve bloque de contexto semántico. Reranker `cross_encoder` default.
2. **Skill `inl-graph-oracle`** en `.claude/skills/inl-graph-oracle/SKILL.md` con protocolo ReAct:
   - Paso 1: identificar si la query es sobre LEY/PATRÓN (→ canonical) o EVIDENCIA/AVANCE/ADR (→ evidence) o ambos.
   - Paso 2: query inicial con scope=edges (facts legibles).
   - Paso 3: si retorna códigos `(F|O|R|C|A|G|AP|Dia)-\d+` en los facts, consulta follow-up al grafo apropiado para expandir contexto.
   - Paso 4: sintetiza respuesta con los facts + citas (source_node_name + target_node_name).
3. **5ª auditoría en `/audit-coherencia-docs`** — compara códigos canonical del filesystem vs nodos ingestados en Zep. Detecta: (a) códigos en repo sin nodo Zep (drift por falta de ingesta), (b) nodos Zep sin código en repo (obsoletos no invalidados). Reporta JSON en `audit_reports/`.
4. Verificación empírica: lanzar `/consultar-cerebro-inl "qué pasa si violo F-1?"` → debe retornar los edges PROHIBE + CONTRADICE + menciones en evidence.

Estimación: ~2h GPU para Fase 5 completa.

## 📌 Traumas de runtime resueltos en Fase 2.1 (documentados para futura referencia)

- **SDK Zep Cloud Node 2.22.0 no serializa `graph_id`** — solo `group_id`/`user_id` via Fern-generated serializer. La API backend SÍ acepta `graph_id` para standalone graphs. Fix: llamada HTTP directa via `fetch()` a `/api/v2/graph/add-fact-triple` y `/api/v2/graph-batch` (endpoint correcto, NO `/graph/add-batch`) con payload en snake_case.
- **SDK Zep Cloud Python 3.20.0 reubica `EntityEdgeSourceTarget`** — vive en top-level `from zep_cloud import EntityEdgeSourceTarget`, NO en `zep_cloud.external_clients.ontology`. La ontología de Fase 1 asumía el path viejo.
- **API prohíbe source_node_name == target_node_name** — `addFactTriple` rechaza self-referential triples con 400. Fix: crear nodo raíz `INL-Framework` y que cada entity canonical se relacione a él via `IS_PART_OF_FRAMEWORK` en vez de self-edges.
- **`client.graph.list_all()` retorna tupla paginada** — no iterable directo de objetos. Acceder via `response.graphs`.
- **Encoding Windows cp1252** — `print("✓")` rompe en `cmd.exe`. Reemplazar caracteres Unicode (✓/✗) por ASCII (OK/FAIL) en scripts Python que corran bajo consola Windows por default.

**Commit pendiente:** Ley F-6 HITL — lo ejecuta el Arquitecto cuando decida. Los cambios actuales están en disco sin commitear (preferencia `feedback_modo_trabajo` + cláusula de inmutabilidad de `CONSTITUCION.md`).
