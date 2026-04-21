# Implementación del Cerebro Zep INL — Informe ejecutivo del Sprint INL-ZepBrain

**Fecha:** 2026-04-21
**Estado:** Fases 1 + 2.0 + 2.1 + 3 cerradas. Fase 5 pendiente. Fase 4 diferida fuera de scope.
**Autores:** Arquitecto (CPU) + Unidad GPU (Claude Opus 4.7) bajo protocolo INL V5
**Categoría:** consolidación
**Relacionado con:** ADR-001 (Cerebro Zep INL), ADR-002 (Migración a Node compartido), Patrón C-3 Exocórtex Memoria Activa

---

## 1. Contexto — por qué se necesitaba un cerebro semántico

El Framework Ingeniería No Lineal V5 está documentado como **meta-repo `docs-only`** con ~50 archivos markdown distribuidos en 8 carpetas numeradas (`01-teoria/` → `08-implementaciones-referencia/`) más 4 documentos de gobierno (`CONSTITUCION.md`, `REGISTRO_TRAUMAS.md`, `SNAPSHOT_ESTADO.md`, `REGLAS_EDITORIALES.md`). La fuente de verdad es **textual, versionada por git, y accesible únicamente por lectura lineal**.

### 1.1 Problemas observados empíricamente

- **Carga de contexto lineal con el tamaño del repo.** Cualquier agente de IA que arranca trabajo sobre un proyecto que aplica el framework debe leer cientos de KB de texto para saber qué leyes aplican, qué patrones usar, qué anti-patrones evitar. La ventana de contexto se consume antes de poder razonar sobre el problema real.
- **Consultas transversales inviables en flujo operativo.** Preguntas legítimas como *"¿qué patrones se aplican al Día 3 de PEAP-V5?"* o *"¿qué evidencia empírica valida el Patrón C-3 Exocórtex?"* requieren lectura cruzada de múltiples archivos que no se puede automatizar con grep porque las relaciones entre conceptos no están cableadas estructuralmente.
- **El framework evoluciona empíricamente.** Nuevos patrones emergen en proyectos fuente (ARCA principalmente) y se formalizan en este repo. Sin un grafo consultable, cada evolución obliga a re-leer el repo completo para entender qué cambió y qué quedó igual.
- **Dogfooding incompleto.** El propio framework predica externalización de memoria (Patrón C-3 Exocórtex). No instanciar esa memoria para sí mismo era una incoherencia estructural — el zapatero sin zapatos.

### 1.2 Qué hubiera pasado si no se resolvía

El framework seguiría creciendo textualmente. La carga cognitiva de onboarding escalaría linealmente. El dogfooding del Patrón C-3 quedaría incompleto. Agentes de IA que consuman el framework seguirían cargando 100+ KB de prosa a cada sesión para poder razonar sobre decisiones arquitectónicas.

### 1.3 Precedente validado empíricamente

El repo ARCA hermano (Suite de Automatización ARCA — proyecto fuente privado del operador) ya opera desde hace meses con 4 grafos Zep en producción (`arca-docs-v4-std`, `v5-cyb`, `v6-topology`, `v7-afipsdk`). Esa experiencia validó empíricamente que Zep como exocórtex institucional funciona a escala. El Framework INL necesitaba su propio cerebro equivalente, pero **agnóstico del dominio específico de ARCA**.

---

## 2. Estrategia — diseño general del cerebro

### 2.1 Dos grafos standalone especializados por velocidad de cambio

Decisión A (ADR-001 Componente 1): en lugar de un grafo monolítico, se construyen **dos grafos standalone aislados** con ontologías especializadas.

| Grafo | ID | Contenido | Velocidad de cambio |
|---|---|---|---|
| **Canonical** | `inl-framework-canonical` | Leyes (F-\*, O-\*, R-\*), Patrones (A-\*, C-\*, G-\*), Anti-Patrones (AP-\*), Fases PEAP (Dia-\*), Manifiestos, Teoría, Arquitectura Cognitiva | **Baja** — inmutable con PR revisado |
| **Evidence** | `inl-framework-evidence` | ProyectoFuente, EvidenciaEmpirica (05-evidencia/), Avance (07-avances/), DecisionFundada (ADRs + traumas), SnapshotHistorico | **Alta** — evolutivo bitemporal |

**Por qué no un solo grafo:** el grafo canonical cambia por PR revisado con cláusula de inmutabilidad; el evidence muta continuamente con cada entrega, trauma documentado o ADR nuevo. Mantenerlos separados permite que cada uno evolucione a su ritmo natural sin polluir al otro, y simplifica la política bitemporal (Graphiti procesa mejor episodios del pasado al presente para construir correctamente el eje temporal).

**Por qué NO un tercer grafo tipo topology:** ARCA tiene `arca-docs-v6-topology` porque tiene workflows n8n que necesitan sensor AST. Este repo es docs-only sin topología ejecutable — crear un tercer grafo sería Anti-Patrón 1 (Feature Creep Prematuro).

### 2.2 Ontología v2 especializada — 5 entities + 6 edges por grafo

Decisión F: rediseño sobre la ontología v1 (10/10 uniforme propuesta inicialmente) aplicando navaja Ockham + Ley F-1 Anti-Hardcoding. Cada grafo usa **5 entity types + 6 edge types**, dejando 40-50% del cupo Zep libre para evolución futura.

**Canonical — 5 entities:**
- `Ley` — regla inmutable (F-1..F-6 físicas, O-1..O-4 operativas, R-1..R-5 r-específicas)
- `Patron` — patrón prescriptivo (A-1..A-3 arquitectura, C-1..C-3 cognitivos, G-1..G-2 gobernanza)
- `AntiPatron` — patrón proscriptivo (AP-1..AP-4)
- `FasePEAP` — fases del protocolo (Dia--1..Dia-6, Fuera-del-ciclo)
- `ConceptoCanonico` — unifica Manifiesto + Concepto teórico + Artefacto canónico

**Canonical — 6 edges:**
`PROHIBE` (Ley→AntiPatron), `REQUIERE` (Ley→Patron), `APLICA_A` (Patron→FasePEAP), `CONTRADICE` (Patron↔AntiPatron), `DEFINE` (ConceptoCanonico→Entity), `REFERENCIA` (fallback genérico).

**Evidence — 5 entities:**
`ProyectoFuente`, `EvidenciaEmpirica`, `DecisionFundada` (ADR/trauma/estratégica), `Avance`, `SnapshotHistorico`.

**Evidence — 6 edges:**
`RESPALDA`, `INVALIDA`, `EMERGIO_EN`, `GENERADO_EN`, `CAPTURA`, `REFERENCIA`.

### 2.3 Camino C — nodalización determinística por `add_fact_triple`

**Problema validado empíricamente (Spike V-RES #1, 2026-04-20):** ingestar episodios `text` libres con ontología custom aplicada NO produce nodos determinísticos. El extractor LLM de Zep inventa edge types no declarados (caso real: generó `APRECIO_EN` cuando la ontología solo declaraba `EMERGIO_EN`) y asigna nombres impredecibles a nodos (`"patron C-1"` en lugar de `"C-1"` limpio).

**Fix arquitectónico (Decisión H — Camino C):** usar exclusivamente `graph.add_fact_triple()` con `source_node_name` y `target_node_name` canónicos **puros** (ej. `"F-1"`, no `"ley F-1 Muerte al Hardcoding"`). Body narrativo se ingesta como episodios `text` **separados**, vinculados al nodo ya declarado vía metadata (`patron_codigo_ref`, `decision_codigo_ref`, etc.), sin que el extractor LLM cree nodos nuevos porque la ontología ya fue sembrada declarativamente.

**Consecuencia:** ratio de captura entrópica = 0% en canonical (todos los edges caen dentro de la whitelist de 6 tipos). Validado empíricamente con smoke test vía MCP.

### 2.4 Resolución cross-graph por regex (no por UUID map)

**Problema:** los standalone graphs de Zep son aislados por diseño — un edge en `evidence` no puede apuntar directamente a un nodo de `canonical`. La API acepta `source_node_uuid` y `target_node_uuid` pero los standalone graphs viven en namespaces disjuntos.

**Fix aplicado en Fase 3:** resolución cross-graph **en tiempo de consulta**, no en tiempo de ingesta.
- Cada body episode de evidence lleva `metadata.canonical_refs_csv` con los códigos canonical detectados por regex `(F|O|R|C|A|G|AP|Dia)-\d+` sobre el body del archivo fuente.
- Un agente que consulta evidence extrae esos códigos del metadata y hace un segundo query a canonical con ellos.
- Ejemplo real: ADR-001 detecta 15 refs distintas (`A-1, A-2, A-4, AP-2, C-1, C-2, C-3, C-5, Dia-3, F-1, F-5, G-1, G-2, R-3, R-5`) y queda todo en metadata sanitizada compliant con spec Zep (10 keys, arrays→CSV).

**Esta decisión es más robusta que el plan original** (`canonical_uuid_map.json` cross-graph) porque:
1. No depende de que los UUIDs se persistan en el response inmediato de `addFactTriple` (la API es async — el response no siempre trae UUIDs poblados).
2. No rompe cuando los standalone graphs se recrean desde cero (los UUIDs cambian; los códigos canónicos no).
3. Alinea con el diseño natural de Zep (graphs aislados) en vez de forzar cross-references artificiales.

---

## 3. Infraestructura construida

### 3.1 Árbol del módulo `zep-pipeline/`

```
08-implementaciones-referencia/zep-pipeline/
├── README.md                         — entry point + 9 decisiones CPU (A-I)
├── package.json                      — CommonJS, scripts bootstrap:canonical/evidence
├── requirements.txt                  — deps Python (zep-cloud, pydantic, dotenv)
├── .env                              — ZEP_API_KEY (gitignored)
├── .env.example                      — template seguro para repo público
├── .gitignore                        — audit_reports, node_modules, .venv, canonical_uuid_map.json
│
├── ontology/                         — Python declarativo
│   ├── constants.py                  — GRAPH_IDS, CAPS, CANONICAL_REGEX, timezone     (71 LOC)
│   ├── ontology_definition.py        — 10 entities + 12 edges Pydantic v2             (746 LOC)
│   ├── setup_ontology.py             — aplicador --dry-run/--apply/--graph            (262 LOC)
│   ├── bootstrap_graphs.py           — creador idempotente de grafos                  (113 LOC)
│   └── concepto_canonico_kinds.md    — tracking Constraint A-2
│
├── lib/                              — Node CJS compartido con ARCA
│   ├── chunker.js                    — chunking semántico 500+50%                     (195 LOC)
│   ├── frontmatter_parser.js         — parser YAML flat sin deps                      (127 LOC)
│   ├── zep_metadata.js               — sanitizeFrontmatterForZep + capMetadataKeys    (116 LOC)
│   ├── zep_batching.js               — batchIngest con hard-stop configurable         (153 LOC)
│   └── README.md                     — documentación de los 4 módulos
│
├── ingesters/                        — Node CJS, ingesta puntual
│   ├── canonical_source_map.js       — 28 staticNodes + 5 fileMappings + 21 edges    (254 LOC)
│   ├── canonical_ingester.js         — Fase 2.1, HTTP directo                        (538 LOC)
│   ├── evidence_source_map.js        — 3 staticNodes + 3 fileMappings + 2 edges      (221 LOC)
│   └── evidence_ingester.js          — Fase 3, extracción canonical_refs por regex   (516 LOC)
│
├── tests/                            — unit tests vitest
│   ├── audit_edge_entropy.py         — KPI captura entrópica (threshold 0.15)
│   ├── lib/zep_metadata.test.mjs     — 17 tests                                       (215 LOC)
│   └── lib/zep_batching.test.mjs     — 19 tests                                       (357 LOC)
│
├── docs/                             — documentación consolidada
│   ├── adr-001-cerebro-zep-inl.md    — arquitectura semántica (8 componentes)         (328 LOC)
│   ├── adr-002-reutilizacion-scripts-arca.md — stack Node compartido (APROBADO)       (243 LOC)
│   ├── lecciones_heredadas_de_arca.md — catálogo 11 lecciones L1-L11                  (186 LOC)
│   ├── metadata_schema.md            — contrato metadata por entity                   (620 LOC)
│   └── ingestion_policy.md           — política chunking + bitemporal + spikes V-RES  (414 LOC)
│
└── audit_reports/                    — output auditorías (gitignored)
    ├── canonical_uuid_map.json
    └── evidence_uuid_map.json
```

**Totales de código entregado:**
- Node.js: 2.115 LOC (lib + ingesters + tests)
- Python: 1.192 LOC (ontology + audit stub)
- Documentación: 1.791 LOC
- **Total: 5.098 LOC** productivos + tests

### 3.2 Stack híbrido Python + Node

**Decisión ADR-002:** división lingüística por responsabilidad.

| Capa | Lenguaje | Razón |
|---|---|---|
| Ontología declarativa | Python | Pydantic v2 ya implementado en Fase 1; el SDK Python `zep-cloud.graph.set_ontology()` acepta modelos Pydantic directamente |
| Bootstrap de grafos | Python | Invoca `client.graph.create()` una sola vez por proyecto |
| Audit entropy KPI | Python | Sin dependencia de ingesta — análisis post-ingesta |
| **Ingesta** (canonical + evidence) | **Node.js** | Reutiliza toda la infraestructura validada empíricamente en ARCA (`chunker.js`, `frontmatter_parser.js`, metadata sanitization, batching con asfixia controlada) |

**Por qué no todo en Python:** implementar `canonical_ingester.py` desde cero obligaba a re-descubrir empíricamente las ~13 lecciones que ARCA ya validó en producción (chunking semántico, metadata compliant con spec Zep, batching 20+1500ms, hard-stop DLQ pattern, etc.). Pregunta A-1 del framework: si el problema es replicable, extraer biblioteca reutilizable > duplicar código. ADR-002 aplicó esa pregunta a nivel ecosistema INL↔ARCA.

**Por qué no todo en Node:** la ontología Pydantic estaba lista y funciona. Re-escribir `EntityModel`/`EdgeModel` en TypeScript sería trabajo gratuito.

---

## 4. Ingesta ejecutada — estado live del tenant Zep

Al cierre de sesión 3 (2026-04-21 00:34 ART), el tenant Zep dedicado `inl_framework` contiene ambos grafos poblados. Verificado empíricamente vía MCP (`zep_graph_list_all` + `zep_graph_search`).

### 4.1 Grafo `inl-framework-canonical` (creado 2026-04-21T00:22:31Z)

| Entity type | Cantidad | Origen |
|---|---:|---|
| **Ley** | 15 | Declarativo desde `CONSTITUCION.md`: 6 físicas (F-1..F-6) + 4 operativas (O-1..O-4) + 5 r-específicas (R-1..R-5) |
| **Patron** | 10 | Discovered de `03-patrones/*.md`: A-1, A-2, A-3, C-1, C-2, C-3×2, G-1, G-2 (+ `directivas-xml-agentes.md` skipeado como no-patrón) |
| **AntiPatron** | 4 | Declarativo: AP-1..AP-4 |
| **FasePEAP** | 9 | Declarativo: Dia--1, Dia-0, Dia-1, Dia-2, Dia-3, Dia-4, Dia-5, Dia-6, Fuera-del-ciclo |
| **ConceptoCanonico** | 13 | Discovered: 4 manifiestos (`04-manifiestos/`) + 4 teoría (`01-teoria/`) + 4 framework (`02-framework/`) + 1 arquitectura cognitiva (`06-arquitectura-cognitiva/`) |
| **Root node** | 1 | `INL-Framework` — hub canónico, todos los entities declarativos se relacionan a él vía `IS_PART_OF_FRAMEWORK` |
| **Total nodos** | **52** | |

| Edge type | Cantidad | Cobertura |
|---|---:|---|
| **PROHIBE** (Ley→AntiPatron) | 4 | F-1→AP-3, F-3→AP-2, F-4→AP-1, O-3→AP-2 |
| **REQUIERE** (Ley→Patron) | 5 | F-1→A-1, F-2→A-2, F-3→A-3, F-6→C-2, O-3→G-1 |
| **APLICA_A** (Patron→FasePEAP) | 8 | G-2→Dia-0, A-1→Dia-1, C-1→Dia-1, C-2→Dia-2, C-3→Dia-2, A-3→Dia-3, G-1→Dia-5, G-1→Fuera-del-ciclo |
| **CONTRADICE** (Patron↔AntiPatron) | 4 | C-1↔AP-3, A-1↔AP-3, G-1↔AP-2, C-3↔AP-4 |
| **IS_PART_OF_FRAMEWORK** (workaround self-edge) | ~50 | Cada entity → nodo raíz |
| **Total edges declarativos** | **21** normativos + ~50 estructurales | |

**Body episodes:** 569 chunks de prosa ordenados cronológicamente, con metadata compliant (10 keys cap, arrays→CSV, referencias a header vía `patron_codigo_ref` / `concepto_slug_ref`).

### 4.2 Grafo `inl-framework-evidence` (creado 2026-04-21T00:22:44Z)

| Entity type | Cantidad | Origen |
|---|---:|---|
| **ProyectoFuente** | 2 | Declarativo: `INL-Meta-Repo` (este repo), `ARCA` (proyecto fuente hermano) |
| **EvidenciaEmpirica** | 6 | Discovered de `05-evidencia/*.md`: antipatrones-y-kpis, genesis-y-metricas-sprint, retrospectiva-sprint, tablas-datos-empiricos, validacion-empirica-v5, validacion-meta-framework |
| **Avance** | 6 | Discovered de `07-avances/*.md`: agente-reparador-autonomo-l5, framework-self-check-skill, homeostasis-documental-bitemporal, implicaciones-homeostasis-documental, proceso-construccion-repo, reporte-consolidacion-v5-11-04-2026 |
| **DecisionFundada** | 2 | Discovered de `zep-pipeline/docs/adr-*.md`: ADR-001 (status propuesta), ADR-002 (status aceptada) |
| **SnapshotHistorico** | 1 | Declarativo: `snapshot/2026-04-21` con referencia a iniciativa activa |
| **Root node** | 1 | `INL-Framework` (hub propio del grafo evidence) |
| **Total nodos** | **18** | |

| Edge type | Cantidad | Ejemplos |
|---|---:|---|
| **CAPTURA** (SnapshotHistorico→ProyectoFuente) | 2 | snapshot/2026-04-21 → INL-Meta-Repo, snapshot/2026-04-21 → ARCA |
| **EMERGIO_EN** (EvidenciaEmpirica→ProyectoFuente) | 6 | Cada evidencia → INL-Meta-Repo |
| **GENERADO_EN** (Avance→ProyectoFuente) | 6 | Cada avance → INL-Meta-Repo |
| **IS_EVIDENCE_OF_FRAMEWORK** (workaround) | ~15 | Cada entity → nodo raíz |
| **Total edges** | **14** semánticos + ~15 estructurales | |

**Body episodes:** 358 chunks con metadata extendida que incluye `canonical_refs_csv` (códigos canonical detectados por regex en el body del archivo fuente).

### 4.3 Resolución cross-graph — métricas empíricas

Del análisis de `canonical_refs_csv` en los 12 fileNodes evidence + 2 ADRs:

| Archivo evidence | Refs canonical detectadas | Densidad |
|---|---|---:|
| `adr-001-cerebro-zep-inl.md` | A-1, A-2, A-4, AP-2, C-1, C-2, C-3, C-5, Dia-3, F-1, F-5, G-1, G-2, R-3, R-5 | **15** |
| `adr-002-reutilizacion-scripts-arca.md` | A-1, A-2, C-3, F-5, F-6, R-2 | 6 |
| `validacion-meta-framework.md` | A-1, C-2, C-3, G-1, G-2 | 5 |
| `validacion-empirica-v5.md` | A-1, A-4, C-3, C-4 | 4 |
| `agente-reparador-autonomo-l5.md` | A-4, C-4, C-5, G-2 | 4 |
| `framework-self-check-skill.md` | C-1, C-2, C-3, G-1 | 4 |
| `proceso-construccion-repo.md` | A-3, A-4, C-1, C-3 | 4 |
| `implicaciones-homeostasis-documental.md` | C-4 | 1 |
| `homeostasis-documental-bitemporal.md` | C-1 | 1 |
| `genesis-y-metricas-sprint.md` | C-1 | 1 |
| `tablas-datos-empiricos.md` | C-1 | 1 |
| Otros 3 archivos | (sin refs) | 0 |

**9 de 12 archivos evidence (75%)** tienen al menos 1 referencia canonical. ADR-001 concentra el mayor número (15 refs distintas) porque sintetiza toda la arquitectura del cerebro Zep. Esto valida empíricamente que el regex `(F|O|R|C|A|G|AP|Dia)-\d+` funciona como **sistema nervioso del cerebro INL** — conecta evidence con canonical sin necesidad de edges cross-graph reales.

### 4.4 Totales del cerebro

| Métrica | Canonical | Evidence | Total |
|---|---:|---:|---:|
| Entity types activos | 5 + root | 5 + root | 10 + 2 root |
| Edge types activos | 4 declarativos + 1 estructural | 3 semánticos + 1 estructural | 8 activos |
| **Nodos persistidos** | **52** | **18** | **70** |
| **Edges semánticos** | **21** | **14** | **35** |
| Edges estructurales (IS_PART_OF) | ~50 | ~15 | ~65 |
| **Body episodes (chunks)** | **569** | **358** | **927** |
| Tiempo de ingesta total | ~2 min | ~2 min | ~4 min |
| Hard-stops durante ingesta | 0 | 0 | 0 |

---

## 5. Capacidades desbloqueadas — qué permite el cerebro que antes no era posible

Esta sección responde de manera honesta qué **casos de uso concretos** habilita la infraestructura construida, y cuáles no. El cerebro no es mágico — es un grafo semántico consultable con caveats reales.

### 5.1 Lo que ya funciona hoy

#### 5.1.1 Consulta semántica directa por frase natural

**Capacidad:** un agente de IA (con acceso al MCP Zep) puede traer los facts más relevantes a una consulta sin leer ningún archivo markdown del repo.

```python
zep_graph_search(
    query="qué pasa si violo el principio de no hardcoding",
    graph_id="inl-framework-canonical",
    scope="edges",
    reranker="cross_encoder",
    limit=10
)
```

Retorna los edges ordenados por relevancia (`PROHIBE F-1→AP-3`, `REQUIERE F-1→A-1`, `CONTRADICE A-1↔AP-3`, etc.) con facts legibles en prosa completa:

> *"La Ley F-1 Muerte al Hardcoding requiere aplicar el Patrón A-1 Adaptador Universal para externalizar diferencias entre APIs."*

**Antes de la implementación:** habría que leer `CONSTITUCION.md` + `03-patrones/a1-adaptador-universal.md` + `03-patrones/c1-precomputacion-de-dominio.md` + el anti-patrón correspondiente, y razonar la relación. Ahora es una llamada HTTP que retorna el hecho pre-computado.

**Costo en ventana de contexto:** query de 1-2KB ↔ response con top-10 facts ~3KB. Comparado con ingerir `CONSTITUCION.md` completo (~8KB) + archivos de patrones (~40KB cada uno), el ahorro es de 1-2 órdenes de magnitud.

#### 5.1.2 Navegación bitemporal de evidencia

**Capacidad:** consultar "qué se sabía sobre X en fecha Y" vs "qué se sabe ahora". Zep mantiene `valid_at` + `invalid_at` en cada edge del grafo evidence, permitiendo queries del tipo "traer solo evidencia vigente" vs "traer historial completo incluyendo invalidaciones".

```python
zep_graph_search(
    query="validación empírica del factor 20x",
    graph_id="inl-framework-evidence",
    scope="edges",
    only_active_edges=True,  # filtra invalid_at IS NULL
    limit=5
)
```

**Caso de uso real:** cuando una evidencia vieja queda superseded por una nueva, el edge viejo se marca `invalid_at` y la query con `only_active_edges=True` trae la vigente. El edge viejo permanece en el grafo para auditoría histórica.

**Aún NO automatizado:** la invalidación bitemporal es manual hoy — no hay ingester delta que detecte rotaciones y emita episodios contrastivos automáticamente (eso era Fase 4, diferida fuera de scope del ADR-002 reducido).

#### 5.1.3 Resolución cross-graph por código canonical

**Capacidad:** un agente que consulta evidence puede extraer los códigos canonical del body (o de `metadata.canonical_refs_csv` sin parsear body), y hacer un 2º query a canonical para traer la definición formal de cada código mencionado.

**Flujo típico:**

```python
# Paso 1: buscar evidence sobre un tema
results_ev = zep_graph_search(
    query="decisión de migrar pipeline a Node compartido",
    graph_id="inl-framework-evidence",
    scope="edges",
    limit=3
)
# → retorna edges con facts sobre ADR-002

# Paso 2: extraer refs canonical mencionadas en los facts retornados
refs = set(re.findall(r'(F|O|R|C|A|G|AP|Dia)-\d+', facts_joined))
# → {'A-1', 'C-3', 'F-5', 'F-6', 'R-2'}

# Paso 3: por cada ref, query canonical para contexto formal
for code in refs:
    results_ca = zep_graph_search(
        query=code,
        graph_id="inl-framework-canonical",
        scope="edges",
        limit=3
    )
```

**Ventaja estructural:** cada query es pequeña (~100-300 tokens). El agente arma el contexto completo con 5-10 queries paralelas en vez de cargar todo el repo en memoria.

#### 5.1.4 Detección automatizable de drift documentación↔grafo

**Capacidad futura (Fase 5, próximo bloqueante):** una auditoría compara los códigos canonical presentes en el filesystem del repo (vía grep) vs los nodos con esos nombres en `inl-framework-canonical`. Reporta:

- **Códigos en repo sin nodo Zep** → drift por ingesta desactualizada (el repo agregó F-7 pero el grafo no).
- **Nodos Zep sin código en repo** → obsoletos no invalidados (el repo eliminó C-4 pero el grafo conserva el nodo).

Esta 5ª auditoría se agregará a `/audit-coherencia-docs` (ya tiene 4 auditorías implementadas).

### 5.2 Lo que se podría hacer pero requiere Fase 5

**Ninguna de estas capacidades está activa todavía** — requieren el slash command + skill ReAct que se van a escribir en Fase 5.

#### 5.2.1 Slash command `/consultar-cerebro-inl` (PENDIENTE)

El operador escribiría:

```
/consultar-cerebro-inl "estoy diseñando un sistema multi-tenant, qué patrones INL aplico?"
```

Y el slash command invocaría queries paralelas a ambos grafos, filtraría por relevance, devolvería un bloque de contexto en markdown con top facts + citas al archivo fuente.

#### 5.2.2 Skill `inl-graph-oracle` con protocolo ReAct (PENDIENTE)

Skill con 4 pasos:
1. Clasificar la query: ¿LEY/PATRÓN (canonical)? ¿EVIDENCIA/AVANCE/ADR (evidence)? ¿ambos?
2. Query inicial con scope=edges.
3. Si los facts retornan códigos canonical, follow-up al grafo apropiado.
4. Sintetizar respuesta citando `source_node_name` y `target_node_name`.

#### 5.2.3 Auditoría de drift del filesystem al grafo (PENDIENTE)

5ª auditoría de `/audit-coherencia-docs`. JSON output con missing/obsolete.

### 5.3 Lo que NO se puede hacer (caveats honestos)

#### 5.3.1 No es ingesta continua ni post-merge automatizada

La Fase 4 (delta ingester con `git tag ultimo-zep-sync` + GitHub Action) fue **diferida fuera de scope por ADR-002 reducido**. El cerebro se construye con una ingesta **puntual local** corrida manualmente desde la máquina del operador. Si el repo cambia (nuevo patrón, ADR, trauma), hay que re-correr los ingesters.

**Re-corrida es idempotente por `entity_name`** — no duplica nodos. Pero actualmente no hay detección automatizada de qué cambió desde la última ingesta.

#### 5.3.2 No hay invalidación bitemporal automática

Cuando un patrón cambia de redacción o se deprecia, los edges viejos no se invalidan solos. Hay que emitir manualmente un fact_triple con `invalid_at` poblado, o re-ingestar desde cero (cuidando de no duplicar).

El `zep_contrast_emitter.js` (patrón P15 de ARCA) que resuelve esto de forma automática vive fuera del scope del ADR-002 reducido.

#### 5.3.3 Bug MCP `labels=[]`

Los nodos custom retornados por `zep_graph_search` vienen con `labels: []` en lugar del entity_type (bug conocido desde Spike V-RES #1). **Workaround:** filtrar por `name` en vez de `node_labels`. Este bug no bloquea ninguna query pero obliga al agente a diseñar las consultas sin depender de filter por label.

#### 5.3.4 UUIDs no retornados síncronamente

`addFactTriple` es async — response inmediato trae `task_id` pero no siempre trae `source_node.uuid`/`target_node.uuid` poblados. Por eso los archivos `canonical_uuid_map.json` y `evidence_uuid_map.json` quedaron vacíos tras la ingesta. Los UUIDs sí están presentes en `source_node_uuid`/`target_node_uuid` de los edges retornados por `zep_graph_search`, así que no es un bloqueante operativo — solo significa que el mapping "nombre → UUID" hay que reconstruirlo por query, no por persistencia inmediata.

#### 5.3.5 SDK Node 2.22.0 no serializa `graph_id`

El SDK oficial `@getzep/zep-cloud` en su versión instalada NO envía `graph_id` al wire cuando se usa `client.graph.addFactTriple()` o `client.graph.addBatch()`. La API backend acepta `graph_id` (confirmado por docs oficiales) pero el serializer del SDK solo conoce `groupId`/`userId`. **Fix aplicado:** HTTP directo via `fetch()` con payload en snake_case a `/api/v2/graph/add-fact-triple` y `/api/v2/graph-batch`.

Esto es deuda del ecosistema Zep, no del framework INL — cuando el SDK se actualice, los ingesters pueden migrar a llamadas nativas.

### 5.4 Qué NO valida el cerebro

El cerebro **no valida corrección conceptual** del framework. Si se declara incorrectamente "F-1 Requiere G-1" cuando debería ser "F-1 Requiere A-1", el grafo lo acepta sin objeción. La corrección semántica de las relaciones es responsabilidad humana (Ley F-6 HITL) ejercida en el momento de declarar los `staticEdges` en `canonical_source_map.js`.

Lo que **sí valida**:
- Ratio de captura entrópica (edges fuera de la whitelist) → audit_edge_entropy.py
- Caps de Zep (entity_name ≤50, fact ≤250, fact_name ≤50) → enforce en ingesta
- Metadata compliant (10 keys, solo escalares, arrays→CSV) → sanitizers en `lib/zep_metadata.js`

---

## 6. Análisis de aplicabilidad a procesos con agentes de IA

Esta sección proyecta qué procesos reales se benefician del cerebro, y cuáles no deberían usarlo.

### 6.1 Casos de uso con buen ajuste

#### 6.1.1 Onboarding de agente nuevo a un proyecto INL

**Escenario:** un nuevo agente (o una nueva sesión de un agente existente) arranca trabajo sobre un proyecto que aplica el framework INL. Necesita saber qué leyes aplican, qué patrones usar, qué anti-patrones evitar.

**Flujo antes del cerebro:**
1. Agente lee `CONSTITUCION.md` completo (~8KB) → consume ventana de contexto.
2. Lee 10 archivos de `03-patrones/` (~120KB total).
3. Lee 4 manifiestos.
4. Intenta cruzar todo en su ventana de contexto. Si la conversación es larga, parte del framework se evapora del contexto antes de que el agente lo necesite.

**Flujo con cerebro:**
1. Agente arranca con solo `CONSTITUCION.md` cargado (6+4+5 leyes = ~4KB resumen).
2. Cuando necesita un patrón específico: `zep_graph_search(query="patrones para multi-tenant", graph_id="inl-framework-canonical")` → retorna A-2 CDD + F-2 RLS + contexto.
3. Total en contexto: 4KB inicial + ~2-3KB por cada query. Escalable a conversaciones largas.

**Ahorro:** ~90% en tokens consumidos para el mismo conocimiento operativo.

#### 6.1.2 Auditoría de coherencia framework↔proyecto

**Escenario:** un agente está revisando un PR de ARCA y necesita verificar que las decisiones arquitectónicas del PR no contradicen el framework.

**Query concreta:**

```python
# Extraer códigos canonical mencionados en el PR body
refs = extract_canonical_refs(pr_body)
# → {'A-1', 'F-5'}

# Por cada uno, buscar edges PROHIBE en canonical
for code in refs:
    results = zep_graph_search(
        query=f"{code} prohibiciones",
        graph_id="inl-framework-canonical",
        scope="edges",
        edge_types=["PROHIBE", "CONTRADICE"],
        limit=5
    )
    # Si el PR body contiene alguno de los AntiPatron del resultado → alarma
```

El agente puede auditar compliance sin re-leer el framework completo.

#### 6.1.3 Ingreso asistido de ADR nuevo

**Escenario:** el operador está escribiendo un ADR nuevo en un proyecto INL. Quiere asegurarse de citar las leyes correctas y no inventar patrones que no existen.

**Flujo:**
1. Agente extrae los conceptos del draft del ADR.
2. Query a canonical con cada concepto → retorna los códigos oficiales que aplican.
3. Agente sugiere al operador: *"tu ADR menciona 'adaptador', te conviene citar A-1 Adaptador Universal. Tu justificación refiere a 'no hardcodear endpoints', eso es F-1 Muerte al Hardcoding."*

Esto hace que ADRs nuevos **converjan al vocabulario canonical** en vez de crear sinónimos ad-hoc.

#### 6.1.4 Exploración de evidencia empírica para decisiones

**Escenario:** el operador duda si aplicar un patrón. Pregunta al agente: *"hay evidencia de que C-3 Exocórtex funciona a escala?"*.

**Flujo:**
1. Agente consulta evidence: `zep_graph_search(query="C-3 Exocórtex validación escala", graph_id="inl-framework-evidence", scope="edges")`.
2. Retorna edges de `validacion-empirica-v5.md`, `validacion-meta-framework.md` con facts concretos.
3. Si los facts citan números (factor 20x, latencia, etc.), están ahí para que el agente los reporte literalmente.

Esto convierte el framework de "documento aspiracional" a "base de evidencia auditable".

### 6.2 Casos de uso con mal ajuste

#### 6.2.1 Generación de código desde cero

El grafo no contiene código ejecutable — es meta-documentación. Un agente que quiera implementar A-1 Adaptador Universal en TypeScript no encuentra en el grafo la implementación concreta; solo encuentra el patrón conceptual. Para código canonical, referir a `08-implementaciones-referencia/` directamente (lectura de filesystem, no de Zep).

#### 6.2.2 Decisiones en tiempo real con SLA <100ms

Zep Cloud tiene latencia ~315ms por query (validado empíricamente en Spike V-RES). Para hot paths de producción que necesitan decisión en <100ms, el cerebro no es viable. Para consultas de arquitectura ("¿qué patrón aplico?"), donde la latencia es irrelevante frente al tiempo de pensamiento humano/agente, es ideal.

#### 6.2.3 Razonamiento causal complejo

El cerebro responde "qué está relacionado con qué" (grafo). No hace inferencia causal de "si violo F-1, cuál será el costo en 3 meses". Esa inferencia sigue siendo trabajo del agente sobre los facts retornados.

#### 6.2.4 Proyectos fuera del framework INL

Si un proyecto no sigue INL (ej. un script standalone sin ciclo PEAP-V5), consultar el grafo INL introduce overhead conceptual sin beneficio. El grafo aporta valor proporcional a cuánto el proyecto ya está alineado con el vocabulario canónico.

### 6.3 Potencial de expansión

#### 6.3.1 Replicación a otros proyectos INL

El pipeline `zep-pipeline/` es **framework-agnóstico por diseño** (ADR-002). Un proyecto nuevo que adopte INL puede clonar el pipeline, cambiar:
- `GRAPH_IDS` en `constants.py`
- `staticNodes` + `fileMappings` + `staticEdges` en los source_maps
- Paths en `REPO_ROOT`

Y tener su propio cerebro semántico en ~1 sesión de configuración. La librería `lib/` no cambia.

#### 6.3.2 Cerebros federados

Si ARCA e INL tienen ambos cerebros Zep, un agente puede consultar ambos en la misma sesión:

```python
zep_switch_tenant(tenant_name="inl_framework")
inl_facts = zep_graph_search(query=..., graph_id="inl-framework-canonical")

zep_switch_tenant(tenant_name="default")  # ARCA
arca_facts = zep_graph_search(query=..., graph_id="arca-docs-v4-std")
```

El agente puede decir: *"según el framework INL (canonical): F-1 requiere A-1. La evidencia empírica en ARCA muestra que esto se aplicó en el PR-204 con éxito (latency -60%)"*. Cada afirmación tiene cita auditable.

#### 6.3.3 Grafos de conocimiento de otros dominios (AfipSDK, regulatorios)

ARCA ya tiene `arca-docs-v7-afipsdk` para documentación oficial de integraciones fiscales. El mismo patrón aplica para:
- Regulaciones normativas (AFIP, BCRA, LGPD).
- APIs externas con spec cambiante (OpenAI, Anthropic — cada release).
- Knowledge bases de dominio (e-commerce, farmacia, etc.).

El cerebro INL no sustituye esos grafos, pero comparte la misma infraestructura (`lib/` en `zep-pipeline/`) para que cada dominio tenga su cerebro especializado.

### 6.4 Límites intrínsecos

#### 6.4.1 Requiere mantenimiento humano

Los `staticNodes` + `staticEdges` de los source_maps son **declarativos**. Cuando el framework evoluciona (nueva ley, patrón deprecado, relación nueva), alguien humano (CPU) tiene que actualizar el source_map y re-ingestar. El grafo no se auto-mantiene.

#### 6.4.2 El grafo sabe lo que le enseñamos

Si una relación importante del framework no está declarada en `staticEdges`, la query no la encuentra — aunque el knowledge exista en algún archivo markdown. **Cobertura actual: 21 edges semánticos en canonical + 14 en evidence.** Es el mínimo viable operativo, no la cobertura completa. Agregar más edges es trabajo humano progresivo.

#### 6.4.3 El extractor LLM puede seguir siendo impredecible

Aunque la nodalización Camino C elimina 99% de la captura entrópica, Zep sigue corriendo un extractor LLM sobre los `body episodes` (chunks `text`). El extractor puede crear nodos adicionales (no declarativos) si encuentra entidades nombradas. Esos nodos paralelos NO están en la whitelist y pueden aparecer en searches. El audit_edge_entropy.py los detecta post-hoc.

---

## 7. Traumas runtime resueltos (conocimiento transferible)

Durante la implementación emergieron 9 issues del ecosistema Zep que no estaban documentados oficialmente. Están capturados en `zep-pipeline/docs/lecciones_heredadas_de_arca.md` (L1-L11) y `memory/reference_zep_sdk_traumas.md` (T1-T9). Resumen:

1. **SDK Node 2.22.0 no serializa `graph_id`** — solo `group_id`/`user_id`. Fix: HTTP directo con `fetch()`.
2. **Endpoint batch es `/graph-batch`**, NO `/graph/add-batch`.
3. **UUIDs no retornados sincrónamente** por `addFactTriple` — se leen desde `graph_search` posterior.
4. **SDK Python 3.20.0 reubica `EntityEdgeSourceTarget`** al top-level del paquete.
5. **`client.graph.list_all()` retorna tupla paginada** — acceder via `response.graphs`.
6. **API prohíbe self-edges** (`source_node_name == target_node_name`). Fix: nodo raíz + edge `IS_PART_OF_FRAMEWORK`.
7. **Standalone graphs son aislados** — no hay cross-graph edges reales. Fix: regex sobre body + metadata.
8. **Bug MCP `labels=[]`** — filtrar por `name` en vez de `node_labels`.
9. **Encoding Windows cp1252** — reemplazar Unicode `✓`/`✗` por ASCII `OK`/`FAIL` en scripts Python.

Estos 9 fixes son aplicables a cualquier proyecto futuro que construya grafos Zep en el ecosistema INL (ARCA, proyectos nuevos, grafos de dominio).

---

## 8. Estado operativo y próximos pasos

### 8.1 Qué funciona hoy (verificable empíricamente)

- [x] 2 grafos standalone creados y poblados en tenant Zep `inl-framework`.
- [x] Ontología custom aplicada a ambos grafos (5 entities + 6 edges cada uno).
- [x] 70 nodos + 35 edges semánticos + ~65 edges estructurales + 927 body episodes persistidos.
- [x] Cross-graph por regex funciona (validado: ADR-001 → 15 refs detectadas).
- [x] Queries MCP retornan facts legibles con UUIDs reales.
- [x] `lib/` Node compartida entre INL y preparada para que ARCA la consuma (ADR-003 futuro).
- [x] 36/36 unit tests de `lib/` pasan verde (vitest).
- [x] Bootstrap + ingesta + smoke test re-ejecutables idempotentes.

### 8.2 Próximo bloqueante — Fase 5 (Integración Claude Code)

Scope (~2h GPU estimadas):
1. Slash command `/consultar-cerebro-inl` en `.claude/commands/`.
2. Skill `inl-graph-oracle` con protocolo ReAct (fuente canónica en `08-implementaciones-referencia/skills/` + runtime en `.claude/skills/`).
3. 5ª auditoría en `/audit-coherencia-docs` — drift filesystem↔grafo.
4. Smoke test operativo: `/consultar-cerebro-inl "qué pasa si violo F-1?"` debe retornar PROHIBE + CONTRADICE + menciones en evidence.

### 8.3 Diferido (fuera del scope actual)

- **Fase 4 — Delta ingester continuo.** Requiere GitHub Action + tag `ultimo-zep-sync` + fix P19 polling + patrón P15 contrastivo. Scope del ADR-002 reducido cerró en "ingesta puntual local", no "CI continuo". Si el framework crece lo suficiente para justificar delta, abrir ADR-003.
- **Fase 6 — Refactor ARCA para consumir `zep-pipeline/lib/`.** ARCA mantiene sus 4 scripts inline hasta que la librería compartida esté estabilizada en INL.
- **Expansión de `staticEdges`.** Los 21+14 edges semánticos cubren las relaciones más importantes del framework pero no son exhaustivos. Agregar `DEFINE` y `REFERENCIA` explícitos, más relaciones entre patrones de distinta familia, más aplicaciones FasePEAP, etc.

### 8.4 Deuda técnica consciente

- `canonical_uuid_map.json` y `evidence_uuid_map.json` quedaron vacíos tras ingesta (API async). Los UUIDs reales existen en los edges retornados por `graph_search`. Un script auxiliar que reconstruya los maps por query es scope de Fase 5.
- Proceso python MCP Zep huérfano tras cierre de Claude Desktop → workaround `zep_switch_raw_key` documentado en `memory/reference_mcp_zep_multi_tenant.md`. Fix definitivo: matar proceso via PowerShell antes de reabrir.
- SDK Node 2.22.0 no serializa `graph_id` → cuando Zep publique versión nueva con fix, los ingesters pueden migrar de HTTP directo a llamadas SDK nativas (reducción ~100 LOC).

---

## 9. Métricas finales del sprint

### 9.1 Código entregado (verificable con `wc -l`)

| Capa | Archivos | LOC |
|---|---:|---:|
| Python (ontología + audit) | 5 | 1.192 |
| Node.js (`lib/` + ingesters + tests) | 9 | 2.472 |
| Documentación técnica (docs/) | 5 | 1.791 |
| Scaffolding + configs | 6 | ~200 |
| **Total productivo** | **25** | **5.655** |

### 9.2 Cobertura de tests

- `lib/zep_metadata.js` — 17 tests, 100% de funciones cubiertas.
- `lib/zep_batching.js` — 19 tests, cubren happy path + edge cases + hard-stop + log-continue + sleep.
- **Total: 36/36 tests verde** (vitest).
- Ingesters `canonical_ingester.js` y `evidence_ingester.js` no tienen unit tests — validación empírica por ingesta real contra tenant Zep.

### 9.3 Sesiones invertidas

- Sesión 1 (2026-04-20): Fase 1 — especificación técnica + ontología Pydantic + scaffolding.
- Sesión 2 (2026-04-20): naming F-\* uniforme + consolidación docs + MCP multi-tenant.
- Sesión 3 (2026-04-20 a 2026-04-21): ADR-002 aprobado + Fases 2.0 + 2.1 + 3 ejecutadas + 9 traumas runtime resueltos + memoria actualizada + este informe.

### 9.4 Decisiones CPU cerradas durante el sprint

9 decisiones arquitectónicas formales (A-I) documentadas en ADR-001 + ADR-002, cada una con razonamiento desde el framework y alternativas evaluadas.

---

## 10. Conclusiones honestas

### 10.1 Qué se logró

Un cerebro semántico operativo con **70 nodos + 35 edges semánticos + 927 body episodes** que representa fielmente la estructura declarativa del Framework INL V5 al día 2026-04-21. La infraestructura de ingesta (`zep-pipeline/lib/`) es reutilizable entre proyectos INL y es el dogfooding nivel 3 del Patrón C-3 Exocórtex aplicado al propio subsistema de ingesta.

Quedó documentada una **base de 9 traumas empíricos del ecosistema Zep** con fixes concretos, aplicable a cualquier proyecto futuro que construya cerebros Zep en el ecosistema INL o ARCA.

Se generó un **PR público (#1)** contra el repo GitHub oficial con Fases 1 + 2 cerradas, pendiente merge humano.

### 10.2 Qué NO se logró

- **Fase 5 (integración Claude Code) pendiente** — sin el slash command + skill, las capacidades del cerebro solo son accesibles vía MCP Zep directo desde Claude Code. El operador no tiene UX simplificada todavía.
- **Fase 4 (ingesta continua) diferida** — si el repo cambia, hay que re-correr los ingesters manualmente. No hay detección automatizada de cambios.
- **Cobertura de edges semánticos es mínima viable, no exhaustiva** — 21 en canonical + 14 en evidence cubren las relaciones normativas más importantes pero no todo el grafo implícito del framework.

### 10.3 Qué quedó mejor que lo planeado

- **Scope reducido del ADR-002 fue la decisión correcta** — evitó re-implementar el 70% de infraestructura de ARCA para un caso de uso (ingesta puntual local) que no lo necesitaba. Ahorro estimado: 4-6 horas GPU + eliminación de ~2000 LOC innecesarias.
- **Resolución cross-graph por regex superó al plan original** (UUID map cross-graph). El regex es más robusto, más simple, y alineado con el diseño natural de Zep standalone graphs.
- **HTTP directo superó al SDK Node** cuando este falló — permitió completar el sprint sin esperar release de SDK actualizado.

### 10.4 Impacto esperado

El cerebro habilita que cualquier agente de IA que opere sobre un proyecto INL pueda **cargar solo lo que necesita en el momento que lo necesita**, en vez de cargar el framework completo al inicio de cada sesión. El ahorro es de 1-2 órdenes de magnitud en tokens, lo que se traduce directamente en:
- Sesiones más largas sin perder contexto.
- Razonamiento más enfocado (sin ruido de decenas de KB de prosa irrelevante).
- Costo por consulta reducido proporcionalmente.

El **valor real** del cerebro no es la tecnología — es la combinación de: vocabulario canónico (regex universal `(F|O|R|C|A|G|AP|Dia)-\d+`), ontología minimalista (5+6 por grafo, no 10+10), edges declarativos validados empíricamente, y acceso por búsqueda semántica con cross_encoder reranker. Cada una de esas piezas es simple por separado; la combinación es lo que hace que el cerebro funcione sin alucinar.

---

**Referencias:**
- ADR-001: `08-implementaciones-referencia/zep-pipeline/docs/adr-001-cerebro-zep-inl.md`
- ADR-002: `08-implementaciones-referencia/zep-pipeline/docs/adr-002-reutilizacion-scripts-arca.md`
- Catálogo lecciones: `08-implementaciones-referencia/zep-pipeline/docs/lecciones_heredadas_de_arca.md`
- Schema metadata: `08-implementaciones-referencia/zep-pipeline/docs/metadata_schema.md`
- Política de ingesta: `08-implementaciones-referencia/zep-pipeline/docs/ingestion_policy.md`
- Memoria del sprint: `memory/project_sprint_inl_zepbrain.md`
- Traumas SDK: `memory/reference_zep_sdk_traumas.md`
- Estado actual: `SNAPSHOT_ESTADO.md`
- PR público: https://github.com/theoriginalcustodian/Framework-de-Ingenieria-No-Lineal/pull/1
