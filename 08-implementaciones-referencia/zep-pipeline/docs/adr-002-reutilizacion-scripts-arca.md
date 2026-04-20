# ADR-002 — Reutilización de scripts ARCA como base del pipeline INL-ZepBrain (migración parcial a Node)

**Fecha:** 2026-04-20
**Status:** APROBADO (CPU 2026-04-20, sesión 3)
**Sesión origen:** Sprint INL-ZepBrain — Fase 2 (Bootstrap canonical), sesión 3
**Relacionado con:** ADR-001 (Cerebro Zep INL), Ley F-5 (Adaptadores Universales), Pregunta A-1 (replicabilidad), Ley R-2 (no inventar lo que ya existe validado)
**Autor:** Arquitecto (CPU) + Unidad GPU bajo protocolo INL V5

---

## Contexto

El ADR-001 cerró Fase 1 prescribiendo un **pipeline dual Python/Node.js** para el sub-proyecto INL-ZepBrain:

- **Python:** `bootstrap_graphs.py`, `setup_ontology.py`, `canonical_ingester.py`, `evidence_ingester.py`
- **Node.js:** `delta_ingester.js` (Fase 4)

Al abrir Fase 2 en sesión 2, GPU realizó V-INT sobre el repo ARCA hermano (`C:\Proyectos\Claude\Claude code\Agencia_IA_HyC\Aplicacion Arca\aplicacion-arca-fe\_scripts_v5_cibernetica\`) y encontró **4 scripts Node.js productivos** que ya resuelven empíricamente el problema que INL se disponía a re-implementar en Python:

| Script ARCA | Función | Lecciones empíricas acumuladas |
|---|---|---|
| `zep_sensor_emitter.js` | Sensor constitucional de workflows n8n + topology emitter V6 con diff delta | Patrón contrastivo P15 (episodio "rotated from X to Y" antes de hechos nuevos para disparar invalidación bitemporal en Graphiti) |
| `zep_pr_ingest.js` | Ingesta 1 episodio estructurado por PR mergeado (ciclo autopoiético) | Metadata compliant (10 keys, arrays→CSV, sin nulls, sin objetos anidados), skip gates (bots), routing heurístico multi-grafo |
| `zep_daily_emitter.js` | Motor delta bitemporal con tag `ultimo-zep-sync` | Chunking semántico por párrafos, detección ADRs como unidad, hunks de diff para modificados, batching 20+sleep 1500ms, polling L3 con timeout no-bloqueante, `FORCE_FILES` escape hatch, patrón `sanitizeFrontmatterForZep` + `capMetadataKeys` |
| `zep_narrative_emitter.js` | Bootstrap narrativo masivo inicial | Walk recursivo, ruteo bitemporal (histórico usa `birthtime`/fecha-body, canónico vivo usa `mtime`), ordenamiento cronológico pre-ingesta |

**Problema real observado:**

El plan original de Fase 2 (`canonical_ingester.py` desde cero en Python) obligaría a GPU a **re-descubrir empíricamente** en el dominio INL las 13+ lecciones ya validadas en producción ARCA:

- Chunking contextualizado que preserva coherencia semántica (Graphiti extrae entidades mal con chunks fijos de 500 chars).
- Metadata sanitization compliant con spec oficial Zep (cap 10 keys, sin nulls, sin objetos anidados, arrays→CSV).
- Batching resiliente con hard-stop por lote (DLQ pattern) y sleep anti-rate-limit.
- Polling L3 que **no bloquea el avance del tag git** en timeout (fix P19 — un `exit(1)` acá provocaba re-ingesta completa y duplicados acumulados).
- Patrón contrastivo P15 para invalidar edges stale cuando un workflow rota su ID sin cambios estructurales.
- Skip gates anti-bot (dependabot, renovate, github-actions).
- Ruteo heurístico multi-grafo según categoría de cambio.
- FORCE_FILES como escape hatch para re-ingestar archivos que git diff no detecta.

**Qué pasaría si no tomamos decisión:** INL-ZepBrain se construye en Python desde cero, duplicando esfuerzo y exponiéndose a re-descubrir los mismos incidentes que ARCA ya sufrió (contaminación V4/V5 de 41 episodios "[Archivo Eliminado]", duplicados por timeout de polling, edges stale por rotación de ID sin cambio estructural, etc.).

**Evidencia de validación técnica** (sesión 2026-04-20, V-INT sobre repo ARCA):
- Los 4 scripts ARCA son funcionales en producción desde múltiples ciclos del sprint ARCA (referenciados en sus propios comments con fechas 17-04-2026, 19-04-2026, 20-04-2026).
- `lib/chunker.js` y `lib/frontmatter_parser.js` ya están **copiados** en `zep-pipeline/lib/` (Decisión B del ADR-001) — el precedente de reutilización existe y está aprobado.
- El SDK Node `@getzep/zep-cloud` está validado empíricamente en ARCA. El SDK Python `zep-cloud` tenía TODO explícito de V-EXT pendiente en `bootstrap_graphs.py:49` (`TODO(Fase 2): confirmar signature exacta de client.graph.create`).

---

## Decisión

**Migrar el pipeline INL-ZepBrain a arquitectura híbrida Python+Node con biblioteca Node compartida entre ARCA e INL.** Específicamente:

### Componente 1 — División de responsabilidades por lenguaje

| Capa | Lenguaje | Scripts | Razón |
|---|---|---|---|
| **Definición de ontología** | Python | `bootstrap_graphs.py`, `setup_ontology.py`, `ontology_definition.py`, `constants.py` | Pydantic v2 ya implementado en Fase 1 con 10 entities + 12 edges + EntityEdgeSourceTarget. Re-escribir en TypeScript sería gratuito. El SDK Python `zep-cloud.client.Zep().graph.set_ontology()` acepta modelos Pydantic directamente. |
| **Ingesta de contenido** (bootstrap + delta + PR) | **Node.js** | `canonical_ingester.js`, `evidence_ingester.js`, `delta_ingester.js`, `pr_ingester.js` | Toda la infraestructura de ingesta empírica validada está en Node. Extraemos librería compartida y la consumimos desde ARCA e INL. |

### Componente 2 — Biblioteca Node compartida `zep-pipeline/lib/` (INL-agnostic)

Se extrae y parametriza el núcleo no-ARCA-específico de los scripts ARCA a módulos reutilizables:

```
zep-pipeline/lib/
├── chunker.js                      # Ya existe (Decisión B ADR-001)
├── frontmatter_parser.js           # Ya existe (Decisión B ADR-001)
├── zep_metadata.js                 # NUEVO: sanitizeFrontmatterForZep, capMetadataKeys
├── zep_batching.js                 # NUEVO: batching resiliente + sleep + hard-stop
├── zep_bitemporal.js               # NUEVO: ruteo histórico/vivo, ordenamiento cronológico
├── zep_delta_engine.js             # NUEVO: core de detección A/M/D via git diff + hunks + FORCE_FILES
├── zep_contrast_emitter.js         # NUEVO: patrón P15 para invalidación bitemporal
└── zep_polling.js                  # NUEVO: L3 polling con timeout no-bloqueante
```

Cada módulo exporta funciones puras parametrizables (grafos objetivo, rutas de repo, detectores `isADR`/`isReporteCanonico` como predicados inyectados). Sin hardcoding de ARCA ni de INL.

### Componente 3 — Ingesters INL como consumidores finos de la librería

```
zep-pipeline/ingesters/
├── canonical_ingester.js           # Bootstrap grafo canonical (Fase 2) — usa zep_bitemporal + chunker
├── evidence_ingester.js            # Bootstrap grafo evidence (Fase 3) — usa zep_bitemporal + chunker
└── delta_ingester.js               # Delta incremental post-merge (Fase 4) — usa zep_delta_engine + zep_metadata
```

Cada ingester es thin wrapper que configura: `graphs`, `repoRoot`, detectores, rutas a procesar, ontología esperada.

### Componente 4 — Plan de refactor ARCA para consumir la librería compartida

Fase post-Fase 2 INL (out-of-scope de este ADR, documentar en ADR-003 futuro):
- ARCA refactoriza `zep_daily_emitter.js`, `zep_pr_ingest.js`, `zep_narrative_emitter.js`, `zep_sensor_emitter.js` para consumir `zep-pipeline/lib/` vía paquete npm local o symlink.
- Beneficio cross-proyecto: fixes empíricos de ARCA benefician INL y viceversa (Patrón A-1 aplicado a nivel ecosistema).

**Hasta que ese refactor ocurra, ARCA sigue con sus scripts actuales sin tocar.** El ADR-002 NO bloquea ARCA. Solo abre la biblioteca compartida para que INL la consuma primero.

### Componente 5 — Scripts Python deprecados del plan original

Los siguientes scripts mencionados en `zep-pipeline/README.md` **NO se implementarán**:

- `ingesters/canonical_ingester.py` → reemplazado por `canonical_ingester.js`
- `ingesters/evidence_ingester.py` → reemplazado por `evidence_ingester.js`

Los siguientes **permanecen en Python**:
- `ontology/bootstrap_graphs.py` (requiere SDK Python porque ejecuta ontología Pydantic)
- `ontology/setup_ontology.py` (idem)
- `tests/audit_edge_entropy.py` (KPI auditoría, sin dependencia de ingesta)

### Componente 6 — Validaciones empíricas heredadas (catálogo explícito)

Se documenta en `docs/lecciones_heredadas_de_arca.md` (artefacto nuevo a crear tras aprobación) el catálogo de las 13+ lecciones empíricas que viajan de ARCA a INL vía librería compartida, cada una con:
- Descripción del problema original en ARCA
- Commit/PR ARCA que introdujo el fix
- Función en `zep-pipeline/lib/` que lo encapsula
- Test que valida la lección

### Componente 7 — Actualización del README de zep-pipeline

Tras aprobación del ADR y ejecución del refactor, el README de `zep-pipeline/` se actualiza para reflejar:
- Stack dominante Node.js (con Python solo para ontología y audit)
- Quick start revisado con `npm install` en vez de `pip install -r requirements.txt` (Python opcional)
- Estructura real de `lib/` + `ingesters/`
- Referencia cruzada a este ADR

---

## Alternativas consideradas

**Alternativa A — Seguir plan original Python puro (Plan v1 del self-check):**
Implementar `canonical_ingester.py` + `evidence_ingester.py` + `delta_ingester.py` desde cero en Python.
- ✅ Coherencia con README actual de zep-pipeline.
- ❌ Reinventa infraestructura validada en producción (Anti-Patrón 5 del framework INL: "Re-implementar lo que ya existe validado").
- ❌ Re-descubre empíricamente incidentes ya resueltos en ARCA.
- ❌ Viola Pregunta A-1 del framework (replicabilidad).
- ❌ No hay beneficio técnico — el SDK Python no ofrece capacidades que el Node no tenga.

**Alternativa B — Portar scripts ARCA a Python en bloque:**
Traducir los 4 scripts ARCA a Python para mantener stack coherente del zep-pipeline.
- ✅ Coherencia interna zep-pipeline.
- ❌ Traducción gratuita con riesgo de introducir bugs de porting.
- ❌ ARCA sigue en Node sin beneficio, duplicación perpetua.
- ❌ Mismo problema que Alternativa A: reinventa lo validado.

**Alternativa C — Dejar ingesta ARCA y INL completamente separadas sin biblioteca compartida:**
INL implementa su propio pipeline en el lenguaje que sea, ARCA mantiene el suyo.
- ✅ Desacoplamiento total, cada repo evoluciona independiente.
- ❌ Fixes empíricos no se propagan (ARCA descubre bug P19 → INL lo re-descubre meses después).
- ❌ Viola Ley F-5 Adaptadores Universales del framework.
- ❌ Viola espíritu C-3 Exocórtex (el framework predica externalización compartida de aprendizajes).

**Alternativa D (elegida) — Librería Node compartida + ingesters INL consumidores:**
Descrita en "Decisión". Ver componentes 1-7.

---

## Consecuencias

### Positivas

1. **Aplicación explícita de A-1 Adaptadores Universales** sobre infraestructura de ingesta Zep (una librería, N consumidores).
2. **Herencia inmediata de 13+ lecciones empíricas** de ARCA sin re-descubrimiento.
3. **Reducción de código a escribir en Fase 2-4**: estimación GPU inicial de ~2000 LOC Python → ~400 LOC Node thin wrappers + ~600 LOC extracción de `lib/` (reutilización 70%).
4. **Sprint INL-ZepBrain acelerado**: Fases 2-4 reducen tiempo estimado al aprovechar base validada.
5. **Dogfooding nivel 3 del Patrón C-3**: no solo el framework INL se auto-consulta vía Zep, sino que la propia infraestructura de ingesta es un artefacto compartido entre proyectos INL.
6. **Fixes cross-proyecto**: cualquier bug descubierto en INL o ARCA se fixea una sola vez.

### Negativas

1. **Rompe la coherencia "dual Python/Node" del README original de zep-pipeline**: ahora es "Python para ontología, Node para todo lo demás". Requiere actualizar documentación (Componente 7).
2. **Acoplamiento ARCA↔INL vía librería compartida**: si mañana ARCA cambia de stack, la librería queda huérfana o INL hereda la migración. Mitigación: la librería vive en `zep-pipeline/lib/` (repo INL), ARCA es consumidor — no al revés.
3. **Refactor ARCA pendiente** (Componente 4): hasta que ARCA migre a consumir `zep-pipeline/lib/`, hay duplicación temporal en ARCA (scripts inline + librería compartida). Ventana esperada: 1-2 sprints.
4. **Requiere Node/npm como dependencia dura del zep-pipeline**: el plan original permitía operar solo con Python. Ahora Node es requerido para ingesta.
5. **Trabajo de extracción upfront**: antes de empezar Fase 2 real (bootstrap canonical), GPU debe extraer `lib/` parametrizada. Estimación: 1-2 sesiones de trabajo adicional sobre lo planeado.

### Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| La extracción de `lib/` introduce bugs en scripts ARCA-derivados | Media | Alto | Test de paridad pre/post extracción sobre dataset sintético controlado |
| El patrón P15 contrastivo no aplica igual a INL (dominio docs vs dominio workflows) | Media | Medio | Documentar en `lecciones_heredadas_de_arca.md` qué aplica universalmente vs qué es ARCA-específico |
| Divergencia silenciosa entre ARCA inline y librería compartida hasta refactor ARCA | Alta | Medio | ADR-003 futuro con fecha de migración ARCA explícita + Constraint A-2 (fecha de cleanup) |
| npm install local falla en CI de INL | Baja | Medio | `package-lock.json` commiteado, validado en GitHub Action antes de aprobar el ADR |

---

## Validación pre-implementación (Paso 4.5)

Aplicado en sesión 2026-04-20 sobre este ADR:

- **A-1 (replicabilidad):** SÍ fuerte — la propuesta ES el A-1 aplicado (librería compartida vs duplicar código)
- **V-EXT:** NO — no diseña payload nuevo para Zep, reutiliza estructura validada en producción
- **Hardcoding:** NO — el diseño explícitamente parametriza grafos, rutas, detectores
- **V-INT:** SÍ cumplido — GPU leyó los 4 scripts ARCA completos antes de proponer
- **V-RES:** SÍ cumplido — GPU validó estado del tenant INL vía MCP (`zep_graph_list_all` → 0) antes de proponer

---

## Plan de implementación (post-aprobación)

**Fase 2.0 — Extracción de librería** (1-2 sesiones):
1. Crear módulos `zep-pipeline/lib/zep_metadata.js`, `zep_batching.js`, `zep_bitemporal.js`, `zep_delta_engine.js`, `zep_contrast_emitter.js`, `zep_polling.js`
2. Extraer funciones puras desde scripts ARCA parametrizando hardcoding
3. Unit tests sobre cada módulo (vitest)
4. Crear `docs/lecciones_heredadas_de_arca.md` con catálogo completo

**Fase 2.1 — Bootstrap canonical** (1 sesión):
1. Implementar `ingesters/canonical_ingester.js` usando `lib/`
2. Ejecutar `bootstrap_graphs.py --apply` (Python, sin cambios)
3. Ejecutar `setup_ontology.py --apply` (Python, sin cambios)
4. Ejecutar `canonical_ingester.js --dry-run` → inspeccionar → `--apply`
5. Validar vía MCP Zep (`zep_graph_search` sobre entities sembradas)

**Fase 3 — Bootstrap evidence** (1 sesión):
1. Implementar `evidence_ingester.js` usando `lib/`
2. Ejecutar con mismo patrón dry-run → apply → validar

**Fase 4 — Delta incremental** (1 sesión):
1. Implementar `delta_ingester.js` usando `lib/zep_delta_engine.js`
2. Configurar GitHub Action que lo dispara post-merge
3. Validar con PR sintético

**Fase 5 — Refactor ARCA** (ADR-003 futuro, out-of-scope):
1. ARCA migra scripts a consumir `zep-pipeline/lib/`
2. Deprecación formal de inlining en ARCA

---

## Aprobación

- [x] CPU aprueba la decisión (Ley F-6 HITL sobre docs de gobierno) — **aprobado 2026-04-20, sesión 3**
- [x] Se actualiza `SNAPSHOT_ESTADO.md` con "Próximo pendiente: Fase 2.0 — Extracción de librería compartida Node"
- [x] Se agrega entrada en `REGISTRO_TRAUMAS.md` con fecha y decisión
- [x] Se actualiza `README.md` de zep-pipeline para reflejar stack híbrido con Node dominante
- [x] Se actualiza memoria auto-managed (`project_sprint_inl_zepbrain.md`) con el giro estratégico
- [ ] Commit final (Ley F-6 HITL) — pendiente de decisión CPU cuándo

---

**Notas finales:**

Este ADR aplica **Pregunta A-1 del framework INL** al propio sub-proyecto INL-ZepBrain. Es meta-dogfooding: el sprint de dogfooding nivel 2 (framework como grafo consultable) usa dogfooding nivel 3 (infraestructura de ingesta como biblioteca compartida entre proyectos INL).

El ADR-001 se mantiene válido en sus 8 componentes decisionales. Este ADR-002 solo modifica el **lenguaje** de los ingesters (Python→Node), no la **arquitectura semántica** del cerebro (2 grafos, ontología v2, cross-graph UUID, etc.).
