# ADR-001 — Cerebro semántico del Framework INL como grafo Zep consultable

**Fecha:** 2026-04-20
**Status:** PROPUESTA
**Sesión origen:** Sprint INL-ZepBrain — Fase 1 (Especificación técnica)
**Relacionado con:** ADR-006 (Meta-validación del agente), C-3 Exocórtex Memoria Activa, Patrón C-2 CPU/GPU, Ley R-3 Mutación de documentación antes que práctica
**Autor:** Arquitecto (CPU) + Unidad GPU bajo protocolo INL V5

---

## Contexto

El Framework Ingeniería No Lineal V5 está documentado como meta-repo `docs-only` con ~50 archivos distribuidos en 8 carpetas semánticas (`01-teoria/` → `08-implementaciones-referencia/`) + 4 documentos de gobierno (`CONSTITUCION.md`, `REGISTRO_TRAUMAS.md`, `SNAPSHOT_ESTADO.md`, `REGLAS_EDITORIALES.md`). La fuente de verdad es textual, versionada, y accesible solo por lectura lineal.

**Problema real observado:**

- Cualquier agente IA que arranque trabajo sobre un proyecto INL (ARCA y futuros) debe cargar cientos de KB de contexto textual para entender qué leyes aplican, qué patrones usar, qué anti-patrones evitar. Esto consume ventana de contexto y no escala con el tamaño del framework.
- Las consultas semánticas tipo *"¿qué patrones se aplican al Día 3 de PEAP-V5?"* o *"¿qué evidencia empírica valida el Patrón C-3?"* requieren lectura cruzada de múltiples archivos, inviable en el flujo operativo.
- El framework evoluciona — nuevos patrones emergen empíricamente en proyectos fuente (ARCA) y se formalizan acá. Sin grafo consultable, cada evolución obliga a re-leer el repo completo.
- Ya existe precedente operativo en ARCA (grafos `arca-docs-v4-std`, `v5-cyb`, `v6-topology`, `v7-afipsdk`) que validan empíricamente que Zep como exocórtex institucional funciona. El framework INL debe tener su propio cerebro equivalente, pero agnóstico del dominio de ARCA.

**Qué pasaría si no tomamos decisión:** el framework sigue creciendo textualmente; la carga cognitiva para nuevos agentes escala linealmente con el tamaño del repo; el dogfooding del Patrón C-3 Exocórtex queda incompleto (el framework predica externalización de memoria pero no la instancia para sí mismo).

**Evidencia de validación técnica previa** (sesión 2026-04-20, V-EXT + V-RES):
- Zep Cloud API key válida, latencia 315ms sobre proyecto dedicado INL
- Proyecto Zep nuevo `inl-framework` creado prístino (0 grafos, 0 ontología project-wide, 0 templates residuales)
- Spec oficial Zep confirma: `set_ontology()` admite `graph_ids` para scoping por grafo standalone, permitiendo ontologías especializadas distintas por grafo
- 13 hallazgos empíricos de ARCA (metadata cap 10, chunking contextualizado, batching con asfixia controlada, hard-stop on failure, etc.) aplicables como lecciones transferibles

---

## Decisión

Construir el **cerebro semántico del framework INL como 2 grafos Zep standalone especializados** con ontologías propias por grafo, consultables semánticamente desde Claude Code vía slash command + skill, alimentados por pipeline dual Python (one-shot) + Node.js (delta). El grafo actúa como externalización del Patrón C-3 Exocórtex aplicado al propio framework (dogfooding nivel 2).

La decisión se compone de 8 componentes coordinados, cada uno con estado CPU aprobado al cierre de sesión 2026-04-20:

### Componente 1 — Dos grafos standalone especializados por volatilidad

| Grafo | `graph_id` | Contenido | Velocidad de cambio |
|---|---|---|---|
| **Canonical** | `inl-framework-canonical` | Leyes (CONSTITUCION.md), Patrones (03-patrones/), Manifiestos (04-manifiestos/), Teoría (01-teoria/), Arquitectura Cognitiva (06-), Reglas Editoriales, Fases PEAP | Baja (inmutable con PR revisado) |
| **Evidence** | `inl-framework-evidence` | Evidencia empírica (05-evidencia/), Avances (07-avances/), REGISTRO_TRAUMAS.md, Snapshots históricos, Decisiones fundadas (ADRs instanciados) | Alta (evolutiva, bitemporal) |

**NO se crea un 3er grafo tipo topology** (ARCA tiene `arca-docs-v6-topology` porque tiene workflows N8N; este repo `docs-only` no tiene topología ejecutable — crearlo sería Anti-Patrón 1 Feature Creep).

### Componente 2 — Proyecto Zep dedicado al framework INL

Los 2 grafos viven en **proyecto Zep nuevo dedicado** (`inl-framework`), aislado de:
- Proyecto ARCA (donde viven los 4 grafos ARCA)
- Proyecto `david_brain` (exocórtex personal del operador + grafo experimental `master-v5-methodology` descartable + grafo operativo `arca-suite-knowledge` intocable)

Esto garantiza separación de dominios, evita herencia de ontología project-wide ajena (ARCA inyecta 7 tipos específicos; david_brain inyecta 8 tipos de modelado cognitivo), y simplifica permisos/credenciales.

### Componente 3 — Ontología v2 especializada por grafo

Rediseño sobre propuesta inicial (10/10 uniforme) → **5 entities + 6 edges por grafo**, dejando 40-50% del cupo Zep libre para evolución futura del framework.

**Grafo `inl-framework-canonical` (normativo, inmutable):**

Entities (5 de 10, 50% margen libre). **Convención de naming:** el `name` del nodo es SIEMPRE el código canónico puro (`"C-1"`, `"R-5"`, `"AP-2"`, `"Dia-3"`), no descripción + código. Esto habilita matching determinístico cross-graph (hallazgo empírico V-RES — spike 2026-04-20 confirmó que el extractor LLM produce naming impredecible; ingestar con `name` canónico vía `fact_triple` garantiza identidad estable).

1. `Ley` — regla inmutable del framework. `name="R-5"` | `"1"` (físicas) | etc. Propiedades: `codigo`, `categoria` (`fisica|operativa|r_especifica`), `texto_canonico`
2. `Patron` — patrón prescriptivo. `name="C-1"`. Propiedades: `codigo`, `familia` (`A|C|G`), `estado` (`activo|deprecated`)
3. `AntiPatron` — patrón proscriptivo. `name="AP-2"`. Propiedades: `codigo`, `fase_riesgo`, `intervencion`
4. `FasePEAP` — fase del protocolo V5. `name="Dia-3"`. Propiedades: `dia`, `nombre`, `condicion_salida`
5. `ConceptoCanonico` — unifica Manifiesto + Concepto teórico + Artefacto canónico. `name="<slug-corto>"` (ej. `"muerte-al-hardcoding/principio-IV"`). Propiedades: `nombre`, `kind` (`manifiesto|concepto|artefacto`), `seccion_origen`

**Granularidad de ConceptoCanonico:** 1 nodo por sección `##` principal del archivo fuente, no 1 por archivo (decisión Q2). Ejemplo: `muerte-al-hardcoding.md` produce 4 nodos `ConceptoCanonico` (uno por principio I/II/III/IV), no 1 solo manifiesto global. Esto habilita que edges `CONTRADICE` / `DEFINE` apunten a principios específicos.

**Constraint A-2 para ConceptoCanonico:** si algún `kind` (manifiesto | concepto | artefacto) acumula ≥3 propiedades exclusivas no-null (es decir, que solo aplican a ese kind y serían null en los demás), promover a entity dedicada. Hay 5 slots libres en canonical — es viable sin rediseño estructural. Esta cláusula previene el anti-patrón "tabla polimórfica con campos sparse" a mediano plazo.

Edges (6 de 10, 40% margen libre):
1. `PROHIBE` — (`Ley` → `AntiPatron`) una ley proscribe un anti-patrón
2. `REQUIERE` — (`Ley` → `Patron`) una ley exige aplicar un patrón
3. `APLICA_A` — (`Patron` → `FasePEAP`) patrón aplicable en cierta fase
4. `CONTRADICE` — (`Patron` ↔ `AntiPatron`) oposición prescriptiva explícita
5. `DEFINE` — (`ConceptoCanonico` → Entity canonical) concepto/manifiesto define elemento
6. `REFERENCIA` — (Entity → Entity) fallback genérico `("Entity", "Entity")`

**Grafo `inl-framework-evidence` (episódico, evolutivo):**

Entities (5 de 10, 50% margen libre):
1. `ProyectoFuente` — proyecto externo que aplica INL. Propiedades: `nombre`, `repo_url`, `fase_peap_actual`, `activo`
2. `EvidenciaEmpirica` — dato/observación empírica. Propiedades: `fecha`, `proyecto_ref`, `tipo` (`validacion|invalidacion|metrica`), `descripcion`
3. `DecisionFundada` — decisión con razonamiento (ADR, trauma). Propiedades: `fecha`, `tipo` (`adr|trauma|estrategica`), `razonamiento_csv`, `autor`
4. `Avance` — entregable de progreso o ideación emergente. Propiedades: `fecha`, `categoria` (`sprint|ideacion|consolidacion`), `titulo`
5. `SnapshotHistorico` — estado del repo en un momento. Propiedades: `fecha_snapshot`, `fase`, `iniciativa_activa`

Edges (6 de 10, 40% margen libre):
1. `RESPALDA` — (`EvidenciaEmpirica` | `DecisionFundada` → Entity) respaldo positivo (valida o fundamenta)
2. `INVALIDA` — (`EvidenciaEmpirica` → Entity) invalidación bitemporal (patrón deprecado por evidencia contraria)
3. `EMERGIO_EN` — (Entity → `ProyectoFuente`) patrón o ley emergió empíricamente en proyecto
4. `GENERADO_EN` — (`Avance` → `ProyectoFuente`) avance producido por proyecto
5. `CAPTURA` — (`SnapshotHistorico` → Entity) snapshot captura estado de elementos en un momento
6. `REFERENCIA` — (Entity → Entity) fallback

**Consolidaciones Ockham aplicadas vs propuesta inicial (10/10):**
- `Manifiesto` + `Concepto` + `ArtefactoCanonico` → `ConceptoCanonico` con property `kind`
- `VALIDA` + `FUNDAMENTA` + `CONSOLIDA` → `RESPALDA` con source polymórfico
- Eliminado `CONSOLIDA` del grafo canonical (absorbido por `RESPALDA` en evidence como meta-historia)

**Edges cross-graph:** nodos canonical mencionados en episodios evidence (ej. "Patrón C-1") son extraídos por NLP de Zep como `Entity` genérica con `name` preservado. La semántica queda en la combinación *edge tipado + nombre del nodo*, siguiendo patrón oficial Zep `("Entity", "Entity")` como source-target fallback. Esto evita duplicar entities canonical en evidence gastando slots.

### Componente 4 — `disable_default_ontology` con mitigación de riesgo

La ontología v2 se aplica vía `zep_set_ontology(graph_ids=["<id>"])`. La spec Zep documenta `disable_default_ontology` solo para user graphs; para standalone graphs no hay confirmación explícita. Asumir bajo impacto (sin User/Assistant/Messages, los defaults conversacionales no aplican en la extracción), monitorear en Fase 2 durante primer ingest.

**Plan B si aparece ruido de defaults:** filtrar tipos no-custom al consultar, o scope estricto por `entity_type` en `zep_graph_search`.

### Componente 5 — Schema metadata por tipo de episodio (cap 10 keys + solo scalares)

Alineado con ADR-002 de ARCA (hallazgo empírico P15/P09: Zep descarta silenciosamente metadata que excede 10 keys o contiene nested objects). Arrays se transforman a `*_csv`. Schema detallado en entregable separado `metadata_schema.md` del pipeline.

### Componente 6 — Runtime dual Python + Node.js

- **Python** — ingesta one-shot: setup de ontología + primer bulk ingest bootstrap de los 2 grafos
- **Node.js** — delta ingester (patrón ARCA `zep_daily_emitter.js`) con `git tag ultimo-zep-sync` + adaptador de consulta invocable desde slash command Claude Code
- **Ambos comparten:** libs copiadas de ARCA (`chunker.js`, `frontmatter_parser.js`) — duplicación consciente con tradeoff registrado

### Componente 7 — Interfaz de consulta dual desde Claude Code

- **Slash command** `/consultar-cerebro-inl $ARGUMENTS` — query directa one-shot
- **Skill `inl-graph-oracle`** con Patrón C-5 ReAct — query estructurada con razonamiento iterativo
- Adaptador Node `queries/adapter.js` wrappea `zep_graph_search` con preset de rerankers por tipo de consulta

### Componente 8 — Estrategia de nodalización Camino C (híbrido json + text chunked + fact_triple declarativo)

Hallazgo empírico del spike V-RES (2026-04-20, grafo throwaway `inl-test-ontology`): el extractor LLM de Zep en ingesta `text` **no respeta estrictamente la ontología custom** — inventa edge types nuevos (caso observado: `APRECIO_EN` creado sin autorización a pesar de ontología limitada a `EMERGIO_EN`) y produce naming de nodos impredecible (prefijos descriptivos como "patron C-1" en lugar de "C-1" limpio). Labels de custom types tampoco se asignan automáticamente en ingesta `text`.

Consecuencia: **la ingesta 100% `text` con extracción LLM no provee garantías de tipado estricto** requeridas para un grafo enterprise. La estrategia de nodalización se especializa por grafo:

**Grafo canonical — 100% determinístico:**
- Entidades atómicas (Ley, Patron, AntiPatron, FasePEAP) se ingestan como episodios `type="json"` con `entity_name=<codigo_canonico>` explícito en metadata
- Edges (`PROHIBE`, `REQUIERE`, `APLICA_A`, `CONTRADICE`, `DEFINE`, `REFERENCIA`) se declaran como `fact_triple` con UUIDs de nodos conocidos — NO se infieren del texto
- Entidades narrativas (ConceptoCanonico con prosa) usan mixto: `json` header crea el nodo con identidad explícita + chunks `text` posteriores se asocian al header vía metadata `concepto_nombre_ref`
- Cero dependencia del extractor LLM para definir estructura del grafo

**Grafo evidence — mixto controlado:**
- Estructurados (ProyectoFuente, DecisionFundada header, SnapshotHistorico): ingesta `json` con fact triples declarativos
- Narrativos (Avance, EvidenciaEmpirica descriptiva, razonamiento extenso de ADR): ingesta `text` chunked — se acepta que el extractor cree edges inferidos, pero se monitorea el ratio (ver seguimiento)
- **Menciones cruzadas a canonical** (ej. "el Patrón C-1 se aplicó en PR-204") se resuelven **cliente-side con regex** `(F|O|R|C|A|G|AP|Dia)-\d+` en el ingester Python/Node. Cada match produce un `fact_triple` explícito hacia el UUID del nodo canonical correspondiente, consultando un mapa local `canonical_uuid_map.json` construido al bootstrap del grafo canonical

**Cross-graph resolution:** por UUID, no por nombre. Los UUIDs de los nodos canonical se persisten en `canonical_uuid_map.json` al primer bootstrap y se usan para todo fact_triple cruzado emitido desde evidence.

**Política de ingesta y chunking detallada:** documentada en `08-implementaciones-referencia/zep-pipeline/docs/ingestion_policy.md` (contrato único para todos los ingesters). Incluye:
- 4 principios rectores (fidelidad estructural, nodalización explícita, chunking solo donde la prosa ES el contenido, overlap contextual)
- Tabla archivo-por-archivo de estrategia (22 filas cubriendo todo el repo)
- Política de chunking: 500 chars con tolerancia +50% (cap ~750) para respetar boundaries estructurales; cortes permitidos/prohibidos; overlap contextual vs literal
- Casos especiales: ADRs y templates chunkean por sección predefinida, tablas preservan header en cada chunk, code blocks en chunk propio

---

## Alternativas consideradas

### Alt 1 — Ontología única project-wide (10/10 uniforme)

**Qué proponía:** mantener las 10 entities + 10 edges originales aplicados project-wide, sin especialización por grafo. Cubre todos los conceptos en una ontología.

**Por qué se rechazó:**
- 0% margen evolutivo — cada nuevo concepto del framework rompe el tope 10/10 de Zep (límite HARD validado en docs)
- Mezcla canonical (normativo) y evidence (episódico) en el mismo espacio semántico, diluyendo la separación por volatilidad
- Desperdicia slots: el grafo canonical no usa `ProyectoFuente` ni `Avance`; el grafo evidence no usa `FasePEAP` ni `ConceptoCanonico`

### Alt 2 — Ontología core mínima project-wide + extensiones targeted por grafo

**Qué proponía:** setear 3-4 entities/edges universales como project-wide y agregar extensiones específicas por grafo con `graph_ids`.

**Por qué se rechazó:** Zep NO soporta herencia de ontología. Según la spec, setear ontología project-wide y después para un grafo específico REEMPLAZA la project-wide para ese grafo, no extiende. El modelo "core + extensiones" no es nativo y requeriría redundancia manual.

### Alt 3 — Un solo grafo unificado con property `layer` (canonical|evidence)

**Qué proponía:** un único grafo `inl-framework` con todas las entities, discriminadas por property `layer`. Simplifica ingesta y consultas.

**Por qué se rechazó:**
- La recomendación oficial Zep es *"optimized for evolving data, not static RAG"* — mezclar contenido estable (leyes inmutables) con evolutivo (traumas) en un grafo hace que la invalidación bitemporal dispare sobre contenido que no debería poder invalidarse.
- Pierde la capacidad de aplicar políticas distintas por tipo de grafo (ej. canonical con disable_default_ontology estricto + evidence con default ontology como fallback).
- Más costoso de consultar: cada query tendría que filtrar por `layer` siempre.

### Alt 4 — Tres grafos (canonical + evidence + topology)

**Qué proponía:** replicar el modelo ARCA de 3 grafos agregando un tercer grafo `inl-framework-topology` para dependencias estructurales entre patrones/leyes.

**Por qué se rechazó:** este repo es `docs-only` — no tiene workflows N8N, módulos ejecutables, ni AST/dependencias de código. La "topología" del framework es conceptual (ley → patrón → fase), y eso ya se resuelve con edges `APLICA_A`, `REQUIERE`, `PROHIBE` dentro de canonical. Anti-Patrón 1 Feature Creep: copiar patrón ARCA sin evidencia de necesidad.

### Alt 5 (elegida) — Dos grafos especializados + ontología v2 Ockham + proyecto Zep dedicado + nodalización Camino C

**Aceptada porque:**

- (a) **Separación por volatilidad** respeta la advertencia oficial Zep ("evolving, not static RAG") aplicando evolución solo donde corresponde (evidence)
- (b) **Ontologías especializadas** maximizan margen evolutivo (40-50% libre por grafo) y coherencia semántica (cada entity vive donde aplica)
- (c) **Proyecto Zep dedicado** aísla dominios, evita contaminación por ontología project-wide heredada, y simplifica credenciales/permisos
- (d) **Navaja de Ockham viable** — consolidación `ConceptoCanonico` y `RESPALDA` reduce sin perder expresividad (validado por V-INT: todas las entities tienen anclaje real en carpetas del repo)
- (e) **13 lecciones ARCA** (metadata cap 10, chunking contextualizado, batching asfixia controlada, hard-stop on failure, timezone explícito, tag git) aplicables como contratos técnicos, reduciendo riesgo de re-descubrir problemas ya resueltos
- (f) **Nodalización Camino C validada empíricamente** — spike V-RES 2026-04-20 demostró que ingesta `text` + extractor LLM NO provee garantías de tipado (edges spurious, labels vacíos). Camino C (json + fact_triple declarativo para canonical, mixto controlado para evidence, cross-graph por UUID) elimina esa clase de fallos estructurales

---

## Consecuencias

### Positivas

- **Consultabilidad semántica del framework** — queries tipo *"patrones aplicables al Día 3"* o *"evidencia que valida C-3"* se resuelven en <1s vs lectura lineal de repo completo
- **Dogfooding C-3 completo** — el framework que predica externalización de memoria instancia su propia memoria externalizada
- **Carga cognitiva constante** para agentes nuevos — leen `CONSTITUCION.md` + `SNAPSHOT_ESTADO.md` + consultan grafo por demanda, en lugar de cargar el repo entero en contexto
- **Evolución sin migración destructiva** — agregar un nuevo patrón, ley o proyecto fuente usa slots libres sin romper la ontología existente
- **Invalidación bitemporal nativa** en evidence — `INVALIDA` permite registrar que un patrón quedó deprecado sin borrar la versión anterior (historia preservada)
- **Aislamiento de dominio** — proyecto Zep dedicado impide que ingesta de otro proyecto contamine el cerebro INL

### Negativas / trade-offs

- **Sincronización manual inicial** — primera carga de los 2 grafos requiere ingest bootstrap Python one-shot. No hay magia; si el repo crece entre bootstrap y delta-ingester funcional, hay ventana de drift
- **Duplicación consciente de libs** (`chunker.js`, `frontmatter_parser.js` copiadas desde ARCA) — tradeoff aceptado bajo Ley F-5 Adaptadores para evitar acoplamiento entre repos. Registrado como deuda para futuro extract a paquete npm compartido
- **Credencial fuera del repo** — API key del proyecto INL Zep no se versiona. Depende de `.env` local. Si el operador rota key o cambia de máquina, re-configurar
- **Riesgo `disable_default_ontology` incierto para standalone graphs** — parcialmente validado en spike V-RES 2026-04-20. El flag es parámetro de user graphs, no de standalone. En standalone graphs con ontología custom aplicada por `graph_ids`, la extracción LLM puede aún clasificar con labels vacíos o inventar edge types on-the-fly. Mitigación activa: ingesta canonical 100% determinística (Componente 8), monitoreo KPI de captura entrópica en evidence

- **Captura entrópica del extractor LLM en grafo evidence** — confirmado empíricamente (spike 2026-04-20): Zep creó edge `APRECIO_EN` no declarado en ontología cuando ingesta `text` incluyó verbo "apareció" en lugar de "emergió". En evidence aceptamos este riesgo por la naturaleza narrativa del contenido; mitigación = monitoreo proactivo (ver seguimiento) + umbral de auditoría G-1 si ratio supera 15%
- **Edges cross-graph vía Entity genérica** — los nodos canonical que aparecen como target en edges evidence no son typed. Pierden parte de validación estructural; se compensa con disciplina de naming (nombres canónicos consistentes: "Patron C-1", "Ley R-5") y con `REFERENCIA` como edge semánticamente neutro para casos no tipados
- **No hay CLI Zep para crear proyectos** — creación del proyecto `inl-framework` fue manual vía dashboard. Si se reseteara el proyecto por accidente, recreación es manual (documentar procedimiento en `zep-pipeline/README.md`)

### Consecuencias sistémicas

- **Archivos a crear/modificar en este repo:**
  - `08-implementaciones-referencia/adrs-template/ADR-001-cerebro-zep-inl.md` — instancia formal (al promover este borrador)
  - `08-implementaciones-referencia/zep-pipeline/` — scaffolding completo del pipeline
  - `.claude/commands/consultar-cerebro-inl.md` — slash command (Fase 5)
  - `.claude/skills/inl-graph-oracle/` — skill C-5 ReAct (Fase 5)
  - `.claude/commands/audit-coherencia-docs.md` — extender con 5ª auditoría: sincronía grafo vs repo (Fase 5)
  - `SNAPSHOT_ESTADO.md` — actualizar iniciativa activa y Fase del sprint
  - `REGISTRO_TRAUMAS.md` — registrar decisión fundada de esta ADR
  - `memory/project_sprint_inl_zepbrain.md` — actualizar con ontología v2

- **Procesos afectados:**
  - Ingesta de nuevos archivos al repo dispara (Fase 4+) ingest delta automático al grafo correspondiente según clasificación
  - Cada nuevo ADR instanciado en el repo se ingesta como `DecisionFundada` en evidence
  - Cada nuevo patrón formalizado en `03-patrones/` se ingesta como `Patron` en canonical

- **Sin impacto sobre:**
  - Proyecto ARCA y sus 4 grafos (proyecto Zep distinto)
  - Proyecto `david_brain` y sus 2 grafos (proyecto Zep distinto)
  - GEMINI.md y flujos Antigravity (memory feedback `feedback_gemini_intacto`)

---

## Patrones del framework aplicados

- **C-3 Exocórtex Memoria Activa:** el cerebro INL *es* la instanciación del patrón C-3 aplicado al propio framework — externalización consultable de conocimiento normativo y episódico
- **C-2 CPU/GPU:** humano arquitecta ontología y aprueba decisiones (CPU); agente ejecuta análisis masivos, ingesta, queries estructurados (GPU). Roles no intercambiables
- **A-1 Adaptador Universal:** `adapter.js` (Fase 5) wrappea la interfaz Zep con preset de rerankers y scoping por grafo — un solo punto de contacto para todas las queries desde Claude Code
- **C-1 Pre-Computación de Dominio:** el grafo canonical se pre-computa once (schema-first), queries operan sobre dominio ya estructurado vs parseo on-demand de Markdown
- **A-4 Trauma Empaquetado:** fallos de ingest serializan con fingerprint y hard-stop, tag git no avanza hasta resolución — aplicado al delta ingester (Fase 4)
- **G-2 Gobernanza Día Cero:** este ADR se redacta ANTES de escribir código del pipeline — documentación precede a práctica (Ley R-3)
- **Ley F-1 Anti-Hardcoding:** tope 10/10 sin margen es hardcoding estructural; ontología v2 parametriza crecimiento con 40-50% slots libres
- **Ley F-5 Adaptadores Universales:** cada grafo es un adaptador semántico distinto (normativo vs episódico); una ontología por grafo respeta la diferencia
- **Manifiesto Muerte al Hardcoding:** aplicado por recursividad — el propio ADR honra el manifiesto que documenta
- **Regla de Oro editorial:** todas las entities tienen anclaje empírico verificado en carpetas reales del repo (`01-teoria/`, `03-patrones/`, etc.) — V-INT cerrada

---

## Referencias

- **Casos empíricos origen:**
  - ARCA `arca-docs-v5-cyb` — prueba empírica que Zep como exocórtex institucional funciona en producción
  - ADR-002 de ARCA — hallazgo de cap 10 keys en metadata
  - Incidentes P09/P15 de ARCA — archivos eliminados envenenan grafo como "invalidación temporal" → lección: archivos borrados NO se ingestan
  - ADR-006 (framework-self-check) — precedente de exocórtex recursivo aplicado al agente

- **ADRs relacionados:**
  - ADR-006 — meta-validación del agente (patrón C-3 recursivo)
  - (Futuro) ADR-002 — setup de credenciales y `.env` del pipeline
  - (Futuro) ADR-003 — política de chunking por tipo de archivo
  - (Futuro) ADR-004 — delta ingester con git tag

- **Artefactos afectados (creación/modificación):**
  - `08-implementaciones-referencia/zep-pipeline/` — scaffolding completo (Fase 1, tarea #4)
  - `08-implementaciones-referencia/zep-pipeline/docs/metadata_schema.md` — schema detallado por entity (Fase 1, tarea #2)
  - `08-implementaciones-referencia/zep-pipeline/ontology/ontology_definition.py` — Pydantic classes (Fase 1, tarea #3)
  - `08-implementaciones-referencia/zep-pipeline/ontology/setup_ontology.py` — invoca `zep_set_ontology` con `graph_ids`
  - `REGISTRO_TRAUMAS.md` — registrar decisión fundada al consolidar este ADR
  - `SNAPSHOT_ESTADO.md` — actualizar iniciativa activa

- **Framework de referencia:**
  - Patrón C-3 Exocórtex Memoria Activa — `03-patrones/c3-exocortex-memoria-activa.md`
  - Patrón C-2 Offloading Cognitivo — `03-patrones/c2-offloading-cognitivo.md`
  - CONSTITUCION.md — 6 Leyes Físicas + 4 Operativas + 5 R-Específicas

- **Documentación externa:**
  - Zep Cloud — Custom Graph Schema: https://help.getzep.com/customizing-graph-structure
  - Zep Cloud — Creating Standalone Graphs: https://help.getzep.com/create-graph
  - Graphiti — Custom Entity and Edge Types: https://help.getzep.com/graphiti/core-concepts/custom-entity-and-edge-types

---

## Seguimiento

- [ ] **Fase 1 cerrada** (horizonte: misma sesión o próxima) — ADR consolidado en `adrs-template/`, schema metadata escrito, `ingestion_policy.md` promovido al pipeline, `ontology_definition.py` validado con `--dry-run`, scaffolding de `zep-pipeline/` creado
- [ ] **Fase 2 cerrada** (horizonte: 1 sesión) — grafo `inl-framework-canonical` ingestado con leyes + patrones + manifiestos + teoría + conceptos; query de prueba devuelve ≥1 resultado relevante para cada entity type
- [ ] **Monitoreo ruido default ontology** (durante Fase 2) — si extracción clasifica nodos como `Topic`, `Object`, `Document` u otros tipos conversacionales, documentar y aplicar Plan B (filtrado client-side)
- [ ] **KPI captura entrópica — edges spurious** (durante Fase 3-4, evaluación continua) — medir periódicamente `edges_con_fact_name_no_declarado / total_edges` por grafo. Umbral alerta: >15% en 30 días post-ingesta inicial evidence. Si se supera, invocar auditoría G-1 del pipeline de ingesta (evaluar: ¿falta un edge type en la ontología? ¿prompts de extracción son ambiguos? ¿el texto fuente tiene patrones lingüísticos que el extractor interpreta mal?). Este KPI va más allá del ratio `REFERENCIA/total_edges` — incluye TODO edge type inventado por el extractor.

  **Mecanismo ejecutable** (stub a crear en Fase 4 como parte del scaffolding): `zep-pipeline/tests/audit_edge_entropy.py` — script que:
  1. Para cada grafo (`inl-framework-canonical`, `inl-framework-evidence`), trae todos los edges vía SDK nativo (no MCP — el MCP no expone paginación completa de edges).
  2. Cuenta por `fact_name` observado vs whitelist declarada en `ontology_definition.py` (12 edges totales).
  3. Calcula ratio `edges_no_whitelisted / total_edges` por grafo.
  4. Emite reporte JSON `audit_reports/edge_entropy_<YYYY-MM-DD>.json` con: ratio, top 5 `fact_name` spurious por frecuencia, lista de UUIDs de ejemplos.
  5. Exit code ≠ 0 si supera el 15% (integración CI futura).
  Correr manualmente en Fase 3-4 para línea base; automatizar via hook o cron en Fase 5+ si aplica.

- [ ] **Constraint A-2 ejecutable para ConceptoCanonico — contador de propiedades exclusivas por `kind`** (evaluación cada vez que se modifique `ontology_definition.py`) — mecanismo: mantener en `zep-pipeline/ontology/concepto_canonico_kinds.md` un archivo de tracking con formato:

  ```
  | kind | propiedades exclusivas | count |
  |---|---|---|
  | manifiesto | (ninguna hoy) | 0 |
  | concepto | (ninguna hoy) | 0 |
  | artefacto | (ninguna hoy) | 0 |
  ```

  Cada vez que un ADR sucesor agregue una propiedad al schema de `ConceptoCanonico` que **solo aplique a un `kind` específico** (es decir, sería null para los demás kinds), sumar al contador del kind correspondiente. Si `count ≥ 3` para algún kind, disparar ADR sucesor de promoción a entity dedicada (hay 5 slots libres en canonical).

  Esto convierte el constraint A-2 declarativo en un trigger ejecutable auditable por el propio operador o por `/audit-coherencia-docs` (5ª auditoría futura).
- [ ] **Fase 3 cerrada** (horizonte: 1 sesión) — grafo `inl-framework-evidence` ingestado con evidencia + avances + traumas + snapshots; `INVALIDA` probada con caso real (ej. anti-patrón deprecado en V4→V5)
- [ ] **Fase 4 cerrada** (horizonte: 1 sesión) — delta ingester Node funcionando con `git tag ultimo-zep-sync`; hard-stop on failure validado
- [ ] **Fase 5 cerrada** (horizonte: 1 sesión) — slash command + skill operativos desde Claude Code; adaptador `queries/adapter.js` con preset de rerankers
- [ ] **Evaluación a 1 mes post-Fase-5** — medir reducción de carga cognitiva: tiempo promedio de "agente entiende contexto del framework" antes vs después del grafo. Objetivo: >50% reducción
- [ ] **Criterio de SUPERSEDED** — si emergen ≥3 casos de consulta que la ontología v2 no cubre y requieren nuevos entity/edge types, replantear con ADR sucesor antes de agotar slots libres (preservar Ley F-1 Anti-Hardcoding)
- [ ] **Criterio de reversión** — si la consulta vía grafo es más lenta o menos precisa que grep textual sobre el repo en ≥30% de queries probadas, marcar este ADR como RECHAZADA POR INACCIÓN EMPÍRICA y volver a solo-textual

---

*ADR-001 materializa C-3 Exocórtex en su forma más completa: el framework que predica externalización de memoria instancia su propia memoria externalizada. Dogfooding nivel 2 — no solo el repo cumple el framework, sino que además se vuelve memoria activa operable por cualquier agente que lo consulte.*
