# Metadata Schema por tipo de episodio — Cerebro Zep INL

**Versión:** v1 (Fase 1 Sprint INL-ZepBrain)
**Fecha:** 2026-04-20
**Relacionado con:** ADR-001 Cerebro Zep INL
**Basado en:** ADR-002 ARCA (hallazgo empírico cap 10 keys)

---

## Reglas estructurales (aplican a TODOS los episodios)

Estas reglas son contratos duros del pipeline, no sugerencias. Violarlas hace que Zep descarte silenciosamente o corrompa el grafo.

### R1 — Cap 10 keys por episodio
Cada objeto de metadata tiene **máximo 10 keys**. Zep descarta silenciosamente las que excedan. Si un tipo necesita más de 10, priorizar las más discriminantes y mover el resto al body del episodio.

### R2 — Solo tipos scalares (`Text | Int | Float | Boolean`)
Arrays y nested objects se descartan. **Arrays se transforman a cadena CSV** con sufijo `_csv`. Ejemplo: `["R-1", "R-5"]` → `leyes_impactadas_csv: "R-1,R-5"`.

### R3 — Naming convention
- Nombres de keys en `snake_case`
- Arrays siempre con sufijo `_csv`
- Fechas siempre en ISO 8601 con timezone: `"2026-04-20T14:30:00-03:00"` (América/Argentina/Buenos_Aires)
- Paths relativos al root del repo: `"03-patrones/c1-precomputacion-de-dominio.md"` (NO absolutos)
- Códigos canónicos en UPPERCASE: `"C-1"`, `"R-5"`, `"AP-2"`

### R4 — Keys obligatorias globales (presentes en todos los episodios)
Estas cuentan dentro del cap 10:

| Key | Tipo | Descripción |
|---|---|---|
| `source_path` | Text | Path relativo al archivo origen en el repo |
| `ingested_at` | Text | ISO 8601 del momento de ingesta (no del archivo) |

**Solo 2 obligatorias globales** — dejan **8 slots libres** para metadata específica del tipo.

### R5 — `entity_type` NO va en metadata
El tipo de entity se declara vía `entity_types` del ontology set, no en metadata. Zep lo infiere por el schema del episodio `json` o por clasificación NLP del episodio `text`.

### R6 — Episodios `text` vs `json`
- **`json`** → metadata estructurada pre-parseada (ideal para Ley, Patron, AntiPatron, DecisionFundada, SnapshotHistorico — entidades unitarias semánticas)
- **`text`** → chunking con metadata contextual (Manifiesto, Teoría, Avance narrativo, EvidenciaEmpirica descriptiva)

### R7 — `created_at` del episodio = fecha semántica del evento

El parámetro `created_at` es el **anchor bitemporal** de Zep/Graphiti. Refleja *cuándo pasó el evento del mundo real*, NO cuándo el ingester corrió.

**Regla explícita de prioridad:**

1. **Si el entity tiene una fecha semántica tipada en su metadata** (ej. `EvidenciaEmpirica.fecha_observacion`, `DecisionFundada.fecha`, `Avance.fecha`, `SnapshotHistorico.fecha_snapshot`, `ProyectoFuente.fecha_alta`): usar esa.
2. **Si no hay fecha semántica pero el archivo tiene fecha parseable en el body** (ej. entradas de `REGISTRO_TRAUMAS.md` con `## 2026-04-20 — Título`): parsear con regex `\d{4}-\d{2}-\d{2}` y usar esa.
3. **Si ninguna de las anteriores aplica** (entities estables sin fecha semántica — `Ley`, `Patron`, `AntiPatron`, `ConceptoCanonico`, `FasePEAP`): usar **mtime** del archivo como fallback.

**Nunca** usar `ingested_at` (wall-clock del proceso de ingesta) como `created_at`. `ingested_at` es trazabilidad operativa del pipeline, sin valor semántico bitemporal.

**Regla de oro:** si hay discrepancia entre fechas (ej. ADR con `fecha: 2026-04-20` cuyo archivo fue modificado `mtime: 2026-04-22` por fix de typo), la fecha semántica gana. Zep registra `valid_at` = fecha del evento, no del edit.

### R8 — Archivos eliminados NO se ingestan
Incidente P09/P15 de ARCA. El delta ingester filtra archivos borrados — nunca se envían como "invalidación temporal" (envenena el grafo).

---

## 🔷 Grafo `inl-framework-canonical` — schemas por entity

### E1 — `Ley`

**Episodio type:** `json` (entidad unitaria, NO chunkear)
**Fuente:** `CONSTITUCION.md` (parseo por sección: Físicas, Operativas, R-Específicas)
**1 episodio por Ley** (15 leyes totales actualmente: 6 + 4 + 5)

```json
{
  "entity_name": "R-5",
  "codigo": "R-5",
  "categoria": "r_especifica",
  "titulo": "Idempotencia",
  "seccion_origen": "CONSTITUCION.md#r-especificas",
  "inmutable": true,
  "source_path": "CONSTITUCION.md",
  "ingested_at": "2026-04-20T15:00:00-03:00"
}
```

**Metadata keys (8/10):** `codigo`, `categoria`, `titulo`, `seccion_origen`, `inmutable`, `source_path`, `ingested_at` + `entity_name`. **`texto_canonico` NO va en metadata** — vive en el body del episodio (puede exceder 10k chars). 2 slots libres.

**Body del episodio:** el `texto_canonico` completo de la ley (puede superar 500 chars, aquí no se chunkea).

**Valores permitidos:**
- `categoria`: `"fisica"` | `"operativa"` | `"r_especifica"`
- `inmutable`: siempre `true` para leyes (cláusula de inmutabilidad constitucional)

**Convención naming:** `entity_name` = código canónico puro (ej. `"F-1"` para físicas, `"O-3"` para operativas, `"R-5"` para r-específicas). Sin prefijo "Ley " — el `entity_type=Ley` ya provee el tipo.

---

### E2 — `Patron`

**Episodio type:** `json` para header + `text` chunked para body detallado
**Fuente:** `03-patrones/*.md` (10 archivos actualmente: A-1..A-3, C-1..C-3bi, G-1, G-2, directivas-xml)
**1 episodio json por Patrón** (header) + N episodios text chunked (body largo)

```json
{
  "entity_name": "C-1",
  "codigo": "C-1",
  "familia": "C",
  "nombre": "Pre-Computación de Dominio",
  "estado": "activo",
  "fase_peap_aplicable_csv": "Dia-2,Dia-3,Dia-4",
  "leyes_asociadas_csv": "R-3,F-1",
  "anti_patrones_contrarios_csv": "AP-3",
  "source_path": "03-patrones/c1-precomputacion-de-dominio.md",
  "ingested_at": "2026-04-20T15:00:00-03:00"
}
```

**Metadata keys (10/10 — en el tope, justificado):** `codigo`, `familia`, `nombre`, `estado`, `fase_peap_aplicable_csv`, `leyes_asociadas_csv`, `anti_patrones_contrarios_csv`, `source_path`, `ingested_at` + `entity_name`

**Valores permitidos:**
- `familia`: `"A"` (Arquitectura: A-1, A-2, A-3, A-4) | `"C"` (Cognitivo: C-1..C-5) | `"G"` (Gobernanza: G-1, G-2)
- `estado`: `"activo"` | `"deprecated"`

**Convención naming:** `entity_name` = código canónico puro (ej. `"C-1"`, `"A-2"`, `"G-1"`). Sin prefijo "Patron " — el `entity_type=Patron` ya provee el tipo.

**⚠️ Nota cap:** Patron usa los 10 slots. Si aparece necesidad de un 11º, priorizar mover `leyes_asociadas_csv` al body como sección "Leyes asociadas: R-3, F-1".

---

### E3 — `AntiPatron`

**Episodio type:** `json` (unitaria)
**Fuente:** `05-evidencia/antipatrones-y-kpis.md` (parseo por sección: 4 anti-patrones documentados)
**1 episodio por AntiPatron** (4 actuales: AP-1..AP-4)

```json
{
  "entity_name": "AP-2",
  "codigo": "AP-2",
  "nombre": "Debuggear sintomas en lugar de auditar generadores",
  "fase_riesgo_csv": "Dia-3,Dia-4,Dia-5",
  "senal_deteccion": "mismo tipo de error aparece en >=3 lugares",
  "intervencion": "detener correccion manual, escribir prompt de auditoria, aplicar parche sistemico",
  "patron_contrario_csv": "G-1",
  "source_path": "05-evidencia/antipatrones-y-kpis.md",
  "ingested_at": "2026-04-20T15:00:00-03:00"
}
```

**Metadata keys (9/10):** `codigo`, `nombre`, `fase_riesgo_csv`, `senal_deteccion`, `intervencion`, `patron_contrario_csv`, `source_path`, `ingested_at` + `entity_name`. 1 slot libre.

**Convención naming:** `entity_name` = código canónico puro (`"AP-1"`..`"AP-4"`). Sin prefijo "AntiPatron ".

**Nota fix:** `fase_riesgo` renombrado a `fase_riesgo_csv` porque el valor es CSV (`"Dia-3,Dia-4,Dia-5"`) — respeta R2 naming convention.

---

### E4 — `FasePEAP`

**Episodio type:** `json` (unitaria)
**Fuente:** `02-framework/protocolo-peap-v5-144h.md` + `references/protocolo.md` del skill
**1 episodio por Fase** (9 fases: Día -1, 1, 2, 3, 4, 5, 6, + "Fuera del ciclo" + "Sprint 360h")

```json
{
  "entity_name": "Dia-3",
  "dia": "Dia-3",
  "nombre": "Consolidación estructural",
  "horas_desde_inicio": 48,
  "condicion_salida": "schema DB blindado con RLS + 70% infraestructura estable",
  "entregables_csv": "schema-rls,migraciones-base,tests-integracion-smoke",
  "senales_alarma_csv": "conexion-prematura-apis-externas,feature-creep",
  "patrones_activos_csv": "A-2,C-1,R-3",
  "source_path": "02-framework/protocolo-peap-v5-144h.md",
  "ingested_at": "2026-04-20T15:00:00-03:00"
}
```

**Metadata keys (10/10):** `dia`, `nombre`, `horas_desde_inicio`, `condicion_salida`, `entregables_csv`, `senales_alarma_csv`, `patrones_activos_csv`, `source_path`, `ingested_at` + `entity_name`

**Valores permitidos:**
- `dia`: `"Dia--1"` | `"Dia-1"` | `"Dia-2"` | `"Dia-3"` | `"Dia-4"` | `"Dia-5"` | `"Dia-6"` | `"Fuera-del-ciclo"` | `"Sprint-360h"`

**Convención naming:** `entity_name` = valor del `dia` (ej. `"Dia-3"`). Sin prefijo "FasePEAP ". Coincide con el formato usado en `leyes_asociadas_csv`/`patrones_activos_csv` cross-entity para matching regex.

---

### E5 — `ConceptoCanonico`

**Episodio:** mixto — `json` header por sección `##` principal (crea el nodo) + `text` chunked posterior del body de esa sección (asociados via `concepto_slug_ref`).
**Fuente:**
- `kind=manifiesto` → `04-manifiestos/*.md` (4 archivos)
- `kind=concepto` → `01-teoria/*.md` + `06-arquitectura-cognitiva/*.md` + `02-framework/*.md` + `REGLAS_EDITORIALES.md` (9+ archivos)
- `kind=artefacto` → `08-implementaciones-referencia/adrs-template/`, `memory-templates/`, `claude-md-template/`, `system-prompts/`, `skills/` + `03-patrones/directivas-xml-agentes.md`

**Granularidad:** 1 nodo por sección `##` principal (decisión Q2=b), no 1 por archivo. Ej: `muerte-al-hardcoding.md` produce 4 nodos (principios I..IV).

**Ejemplo header (`json`, crea el nodo):**

```json
{
  "entity_name": "muerte-al-hardcoding/principio-iv",
  "nombre": "Principio IV — Parametrizar la realidad",
  "kind": "manifiesto",
  "seccion_origen": "04-manifiestos/muerte-al-hardcoding.md#principio-iv",
  "conceptos_relacionados_csv": "A-1,A-2,R-5",
  "source_path": "04-manifiestos/muerte-al-hardcoding.md",
  "ingested_at": "2026-04-20T15:00:00-03:00"
}
```

**Metadata keys header (7/10):** `nombre`, `kind`, `seccion_origen`, `conceptos_relacionados_csv`, `source_path`, `ingested_at` + `entity_name`. 3 slots libres.

**Ejemplo chunk de body (`text` chunked, referencia al header):**

```json
{
  "concepto_slug_ref": "muerte-al-hardcoding/principio-iv",
  "seccion_origen": "04-manifiestos/muerte-al-hardcoding.md#principio-iv",
  "chunk_index": 2,
  "chunk_total": 5,
  "arranca_con": "parrafo",
  "termina_con": "parrafo_completo",
  "source_path": "04-manifiestos/muerte-al-hardcoding.md",
  "ingested_at": "2026-04-20T15:00:00-03:00"
}
```

**Metadata keys chunk (8/10):** `concepto_slug_ref`, `seccion_origen`, `chunk_index`, `chunk_total`, `arranca_con`, `termina_con`, `source_path`, `ingested_at`. 2 slots libres. **El chunk NO crea nodo nuevo** — se asocia al header via `concepto_slug_ref` (Q1=a).

**Valores permitidos:**
- `kind`: `"manifiesto"` | `"concepto"` | `"artefacto"`

**Convención naming:** `entity_name` del header = slug del archivo + `/` + slug de la sección `##` (kebab-case). Ej: `"muerte-al-hardcoding/principio-iv"`, `"teoria-cibernetica-v5/homeostasis"`.

**Referencia chunking:** spec completa en `ingestion_policy.md` (500 chars, cap 750, overlap contextual, P4).

---

## 🔶 Grafo `inl-framework-evidence` — schemas por entity

### E6 — `ProyectoFuente`

**Episodio type:** `json` (unitaria)
**Fuente:** declarativa (registrado manualmente como primer bootstrap del grafo evidence, luego actualizado via delta cuando cambia `fase_peap_actual`)
**N episodios:** 1 por proyecto (hoy solo ARCA; futuros se agregan)

```json
{
  "entity_name": "ARCA",
  "nombre_completo": "Suite de Automatización ARCA",
  "repo_url": "<repo privado del operador>",
  "stack_csv": "n8n,supabase,nextjs-14,typescript",
  "fase_peap_actual": "Sprint-360h",
  "activo": true,
  "fecha_alta": "2026-04-10",
  "source_path": "MANIFIESTO_ARCA.md",
  "ingested_at": "2026-04-20T15:00:00-03:00"
}
```

**Metadata keys (9/10):** `nombre_completo`, `repo_url`, `stack_csv`, `fase_peap_actual`, `activo`, `fecha_alta`, `source_path`, `ingested_at` + `entity_name`. 1 slot libre. **`nombre` eliminado** — duplica `entity_name`.

**Valores permitidos:**
- `activo`: `true` | `false`
- `fase_peap_actual`: mismos valores que `FasePEAP.dia`

**Convención naming:** `entity_name` = nombre corto del proyecto sin prefijo (ej. `"ARCA"`, `"MAPRAX"`). Coincide con cómo otros episodios (Evidencia, Avance) lo citan en `proyecto_ref`/`proyecto_origen`.

**Actualización bitemporal:** cuando ARCA cambia de fase, se ingesta un episodio narrativo contrastivo tipo `"ARCA has rotated from Dia-6 to Sprint-360h"` para disparar invalidación bitemporal nativa de Graphiti (hallazgo ARCA #6).

---

### E7 — `EvidenciaEmpirica`

**Episodio type:** `text` para descripcion narrativa + `json` para metadata estructurada (uso mixto según contenido). Preferir `json` si es observación puntual medible, `text` si es validación narrativa con chunking.
**Fuente:** `05-evidencia/*.md` (6 archivos) + ingesta on-going cuando aparecen nuevas evidencias
**N episodios:** múltiples por archivo fuente (cada observación/métrica/retrospectiva es una evidencia)

```json
{
  "entity_name": "ARCA/PR-204/c-1-validacion",
  "tipo": "validacion",
  "fecha_observacion": "2026-03-15",
  "proyecto_ref": "ARCA",
  "descripcion_corta": "Pre-computacion de dominio redujo 80% latencia de query en pagos",
  "metricas_csv": "latencia_pre_ms=1200,latencia_post_ms=240,reduccion_pct=80",
  "pr_incidente_ref": "PR-204",
  "source_path": "05-evidencia/validacion-empirica-v5.md",
  "ingested_at": "2026-04-20T15:00:00-03:00"
}
```

**Metadata keys (9/10):** `tipo`, `fecha_observacion`, `proyecto_ref`, `descripcion_corta`, `metricas_csv`, `pr_incidente_ref`, `source_path`, `ingested_at` + `entity_name`. 1 slot libre.

**Valores permitidos:**
- `tipo`: `"validacion"` | `"invalidacion"` | `"metrica"`

**⚠️ Fix importante (HA-3):** `patron_validado` eliminado de metadata. La mención al patrón/ley/antipatrón validado vive en el body del episodio (`descripcion_corta` + body narrativo extenso si aplica). El ingester cliente-side escanea el body con regex `(F|O|R|C|A|G|AP|Dia)-\d+` y emite un `fact_triple RESPALDA` explícito hacia el UUID canonical correspondiente (ver `ingestion_policy.md §5`). Esto libera 1 slot metadata + hace consistente el mecanismo cross-graph (ADR-001 Componente 8).

**Convención naming:** `entity_name` = slug compuesto `<proyecto>/<PR-o-incidente>/<descripcion-corta-kebab>`. Si no hay PR/incidente específico, usar `<proyecto>/<fecha>/<descripcion-corta-kebab>`. Formato estable para queries.

**Nota:** `metricas_csv` es formato `clave=valor,clave=valor` para queries tipo CONTAINS.

---

### E8 — `DecisionFundada`

**Episodio type:** `json` para metadata + `text` chunked del razonamiento si supera 500 chars
**Fuente:** `REGISTRO_TRAUMAS.md` (entradas por fecha) + futuros ADRs instanciados en `08-implementaciones-referencia/adrs-template/ADR-*.md`
**N episodios:** 1 por decisión (header json) + N chunks del razonamiento extenso

```json
{
  "entity_name": "ADR-001",
  "tipo": "adr",
  "fecha": "2026-04-20",
  "titulo": "Cerebro Zep INL con ontologia v2 especializada",
  "autor": "Arquitecto (CPU) + Unidad GPU",
  "leyes_impactadas_csv": "R-3,F-1,F-5",
  "patrones_invocados_csv": "C-3,C-2,A-1,G-2",
  "status": "PROPUESTA",
  "source_path": "08-implementaciones-referencia/adrs-template/ADR-001-cerebro-zep-inl.md",
  "ingested_at": "2026-04-20T15:00:00-03:00"
}
```

**Metadata keys (9/10):** `tipo`, `fecha`, `titulo`, `autor`, `leyes_impactadas_csv`, `patrones_invocados_csv`, `status`, `source_path`, `ingested_at` + `entity_name`. 1 slot libre. **`codigo` eliminado** — duplica `entity_name`.

**Para entradas de REGISTRO_TRAUMAS.md** (no son ADRs formales sino decisiones con razonamiento): `entity_name` = slug compuesto `trauma/<YYYY-MM-DD>/<titulo-corto-kebab>`. Ejemplo: `"trauma/2026-04-20/naming-uniforme-leyes-fisicas"`.

**Valores permitidos:**
- `tipo`: `"adr"` | `"trauma"` | `"estrategica"`
- `status`: `"PROPUESTA"` | `"ACEPTADA"` | `"SUPERSEDED"` | `"RECHAZADA"`

**Convención naming:**
- ADR formal: `entity_name` = `"ADR-NNN"` (código canónico puro, sin prefijo).
- Entrada de REGISTRO_TRAUMAS: `entity_name` = `"trauma/<YYYY-MM-DD>/<titulo-slug>"` (slug compuesto, único).

**⚠️ Campo omitido del cap:** `razonamiento` completo va al body del episodio (chunks con `decision_codigo_ref` apuntando al header). Para queries por razonamiento se usa búsqueda semántica sobre los chunks, no filtro de metadata.

---

### E9 — `Avance`

**Episodio type:** `text` chunked (son archivos narrativos largos)
**Fuente:** `07-avances/*.md` (6 archivos actualmente) + `02-framework/*.md` cuando es consolidación teórica
**N episodios:** múltiples chunks por archivo

**Ejemplo header (`json`, crea el nodo):**

```json
{
  "entity_name": "homeostasis-documental-bitemporal",
  "titulo": "Homeostasis Documental Bitemporal",
  "categoria": "ideacion",
  "fecha": "2026-03-28",
  "proyecto_origen": "marco-inl",
  "patrones_emergentes_csv": "C-3,G-2",
  "source_path": "07-avances/homeostasis-documental-bitemporal.md",
  "ingested_at": "2026-04-20T15:00:00-03:00"
}
```

**Metadata keys header (8/10):** `titulo`, `categoria`, `fecha`, `proyecto_origen`, `patrones_emergentes_csv`, `source_path`, `ingested_at` + `entity_name`. 2 slots libres.

**Ejemplo chunk de body (`text` chunked, referencia al header):**

```json
{
  "avance_slug_ref": "homeostasis-documental-bitemporal",
  "seccion_origen": "## Invalidación bitemporal",
  "chunk_index": 2,
  "chunk_total": 5,
  "arranca_con": "encabezado",
  "termina_con": "parrafo_completo",
  "source_path": "07-avances/homeostasis-documental-bitemporal.md",
  "ingested_at": "2026-04-20T15:00:00-03:00"
}
```

**Metadata keys chunk (8/10):** `avance_slug_ref`, `seccion_origen`, `chunk_index`, `chunk_total`, `arranca_con`, `termina_con`, `source_path`, `ingested_at`. 2 slots libres.

**Valores permitidos:**
- `categoria`: `"sprint"` | `"ideacion"` | `"consolidacion"`
- `proyecto_origen`: nombre de ProyectoFuente o `"marco-inl"` (cuando es avance propio del framework, no derivado de un proyecto)

**Convención naming:** `entity_name` del header = slug del archivo (kebab-case, sin extensión). Ej: `"homeostasis-documental-bitemporal"`, `"reporte-consolidacion-v5-11-04-2026"`.

---

### E10 — `SnapshotHistorico`

**Episodio type:** `json` para metadata + `text` del body resumen
**Fuente:** `SNAPSHOT_ESTADO.md` (versiones históricas preservadas cuando se promociona a commit) + `07-avances/reporte-consolidacion-v5-*.md` + `07-avances/retrospectiva-sprint.md`
**N episodios:** 1 por snapshot versionado

```json
{
  "entity_name": "snapshot/2026-04-20",
  "fecha_snapshot": "2026-04-20",
  "fase_framework": "Fuera del ciclo - meta-documentacion viva",
  "iniciativa_activa": "Sprint INL-ZepBrain - Fase 1",
  "version_framework": "V5",
  "proyectos_activos_csv": "ARCA",
  "pendiente_principal": "fixear ejemplos JSON schema + spike add_fact_triple + ontology Pydantic",
  "ramas_csv": "master",
  "source_path": "SNAPSHOT_ESTADO.md",
  "ingested_at": "2026-04-20T15:00:00-03:00"
}
```

**Metadata keys (10/10 — tope):** `fecha_snapshot`, `fase_framework`, `iniciativa_activa`, `version_framework`, `proyectos_activos_csv`, `pendiente_principal`, `ramas_csv`, `source_path`, `ingested_at` + `entity_name`

**Convención naming:** `entity_name` = `"snapshot/<YYYY-MM-DD>"`. Formato estable, único por fecha, ordenable lexicográficamente.

**Nota (HB-2):** este ejemplo es ilustrativo del formato, no un snapshot real — el `pendiente_principal` puede variar entre instancias reales del SnapshotHistorico.

**Nota:** cuando se toma un snapshot nuevo, el anterior NO se borra — se mantiene como historia preservada. Delta ingester detecta mutación de `SNAPSHOT_ESTADO.md` y crea un episodio nuevo con `fecha_snapshot` del momento. El grafo queda con serie temporal de snapshots.

---

## Custom fields por edge type

Los edges también admiten propiedades custom (mismo cap 10, mismos tipos scalares). Estas se usan para enriquecer el fact triple sin requerir nodos intermedios.

### Edges del grafo CANONICAL

#### EC1 — `PROHIBE` (`Ley` → `AntiPatron`)
```json
{
  "severidad": "bloqueante",
  "ambito": "universal"
}
```
- `severidad`: `"bloqueante"` | `"fuerte"` | `"advertencia"`
- `ambito`: `"universal"` | `"fase_especifica"` | `"proyecto_especifico"`

#### EC2 — `REQUIERE` (`Ley` → `Patron`)
```json
{
  "obligatoriedad": "mandatoria",
  "condicion_aplicacion": "cuando DB multi-tenant"
}
```
- `obligatoriedad`: `"mandatoria"` | `"recomendada"` | `"contextual"`

#### EC3 — `APLICA_A` (`Patron` → `FasePEAP`)
```json
{
  "momento": "inicio_fase",
  "criticidad": "alta"
}
```
- `momento`: `"inicio_fase"` | `"durante_fase"` | `"cierre_fase"` | `"transicion"`
- `criticidad`: `"alta"` | `"media"` | `"baja"`

#### EC4 — `CONTRADICE` (`Patron` ↔ `AntiPatron`)
```json
{
  "relacion_tipo": "preventivo"
}
```
- `relacion_tipo`: `"preventivo"` (el patrón previene el antipatrón) | `"correctivo"` (el patrón corrige ya manifestado) | `"paralelo"` (misma fase riesgo opuesta)

#### EC5 — `DEFINE` (`ConceptoCanonico` → Entity)
```json
{
  "grado_definicion": "formal"
}
```
- `grado_definicion`: `"formal"` (definición explícita) | `"parcial"` (menciona/referencia) | `"implicita"` (se infiere del contexto)

#### EC6 — `REFERENCIA` (Entity → Entity)
```json
{
  "tipo_referencia": "dependencia"
}
```
- `tipo_referencia`: `"dependencia"` | `"similitud"` | `"ejemplo"` | `"contraste"` | `"supersede"`

### Edges del grafo EVIDENCE

#### EE1 — `RESPALDA` (`EvidenciaEmpirica` | `DecisionFundada` → Entity)
```json
{
  "fuerza": "fuerte",
  "fecha_respaldo": "2026-03-15"
}
```
- `fuerza`: `"fuerte"` (medición cuantitativa o PR mergeado) | `"moderada"` (observación cualitativa documentada) | `"anecdotica"` (mencionado sin datos)

#### EE2 — `INVALIDA` (`EvidenciaEmpirica` → Entity)
```json
{
  "fuerza": "fuerte",
  "fecha_invalidacion": "2026-04-05",
  "superseded_by": "C-3-bi"
}
```
- `superseded_by`: código del elemento que reemplaza al invalidado (opcional)

#### EE3 — `EMERGIO_EN` (Entity → `ProyectoFuente`)
```json
{
  "fecha_emergencia": "2026-02-10",
  "grado_emergencia": "empirico_validado"
}
```
- `grado_emergencia`: `"empirico_validado"` (patrón emergió y fue validado en PR) | `"observacional"` (se observó pero no se formalizó) | `"teorico_prospectivo"` (se hipotetiza, no aplicado aún)

#### EE4 — `GENERADO_EN` (`Avance` → `ProyectoFuente`)
```json
{
  "rol_proyecto": "origen"
}
```
- `rol_proyecto`: `"origen"` (el avance nace del proyecto) | `"beneficiario"` (el proyecto aprovecha el avance generado elsewhere)

#### EE5 — `CAPTURA` (`SnapshotHistorico` → Entity)
```json
{
  "estado_en_snapshot": "activo"
}
```
- `estado_en_snapshot`: `"activo"` | `"deprecated"` | `"propuesta"` | `"en_evaluacion"`

#### EE6 — `REFERENCIA` (Entity → Entity)
Mismo schema que EC6.

---

## Resumen de cobertura

| Grafo | Entity | Fuente principal | Episodio type | Estrategia nodalización | Cap keys |
|---|---|---|---|---|---|
| Canonical | Ley | CONSTITUCION.md | json | Explícita + fact_triple | 9/10 |
| Canonical | Patron | 03-patrones/ | json + text chunked | Explícita header + chunks ref | 10/10 |
| Canonical | AntiPatron | 05-evidencia/antipatrones-y-kpis.md | json | Explícita + fact_triple | 9/10 |
| Canonical | FasePEAP | 02-framework/protocolo-peap-v5-144h.md | json | Explícita + fact_triple | 10/10 |
| Canonical | ConceptoCanonico | 04-manifiestos/, 01-teoria/, 06-, 08-templates, REGLAS_EDITORIALES, 02-framework | json header por `##` + text chunked | Explícita (1 por sección `##`) | 9/10 |
| Evidence | ProyectoFuente | declarativo | json | Explícita + fact_triple | 10/10 |
| Evidence | EvidenciaEmpirica | 05-evidencia/ | json + text mixto | Mixta (tablas json por fila + prosa chunked) | 10/10 |
| Evidence | DecisionFundada | REGISTRO_TRAUMAS.md + ADR-*.md | json header + text chunked razonamiento | Mixta (header explícito + chunks ref) | 10/10 |
| Evidence | Avance | 07-avances/ | json header + text chunked | Mixta | 9/10 |
| Evidence | SnapshotHistorico | SNAPSHOT_ESTADO.md versionado | json + text body | Explícita | 10/10 |

**Observación crítica:** 6 de las 10 entities usan el cap completo (10/10 metadata keys). Si aparece necesidad de una key 11, **NO agregar** — priorizar mover la menos discriminante al body del episodio como campo textual indexable por búsqueda semántica. Esto preserva Ley F-1 Anti-Hardcoding: no hardcodear el tope estructural.

**Referencia operativa:** la política completa de ingesta (qué archivo va como qué tipo, cómo chunkear, cómo resolver menciones cross-graph) vive en documento dedicado `ingestion_policy.md` — contrato único para todos los ingesters del pipeline. Este `metadata_schema.md` complementa definiendo el detalle de campos por entity; `ingestion_policy.md` define el cuándo y el cómo.

---

## Política de chunking (resumen — spec completa en `ingestion_policy.md`)

### Parámetros base (decisión CPU 2026-04-20)

| Parámetro | Valor | Origen |
|---|---|---|
| Tamaño objetivo | **500 chars** | Recomendación oficial Zep + validación empírica ARCA |
| Tolerancia superior | **+50% → cap práctico 750 chars** (Q3=b) | Evita cortes estructurales innecesarios |
| Overlap | **Contextual, no literal** — re-anclaje por encabezado + última oración completa (P4) | |
| Granularidad ConceptoCanonico | **1 nodo por sección `##` principal** (Q2=b) | Match preciso en queries; permite edges `CONTRADICE`/`DEFINE` apuntar a principio específico |
| Filas de tablas empíricas | **1 `EvidenciaEmpirica` por fila** (Q5=a) | Cada caso observable = unidad consultable |

### Cortes permitidos vs prohibidos (resumen)

**Permitidos (en orden de preferencia):** fin de sección `##`/`---` → fin de `###` → fin de párrafo → fin de bullet → fin de oración

**Prohibidos:** dentro de code block, fila de tabla, referencia a path, código canónico (`C-1`, `R-5`), fórmula matemática, link markdown, inmediatamente post-encabezado

**Code blocks** (Q4=a) se preservan completos en chunk propio aunque superen 750 chars. Si superan 2000 chars, señal de auditoría del archivo fuente.

### Metadata de chunking (extensión del schema — 5 keys adicionales)

Todo chunk agrega estas 5 keys (cuentan dentro del cap 10 del episodio — priorizar sobre keys opcionales del entity):

| Key | Tipo | Descripción |
|---|---|---|
| `chunk_index` | Int | Posición 1-based dentro del archivo (1, 2, 3...) |
| `chunk_total` | Int | Total de chunks del archivo fuente |
| `seccion_origen` | Text | Path de sección markdown (ej. `"## Introducción > ### Contexto"`) |
| `arranca_con` | Text | `"encabezado" | "parrafo" | "bullet" | "continuacion"` |
| `termina_con` | Text | `"seccion_completa" | "parrafo_completo" | "bullet_completo" | "oracion_completa" | "forzado"` |

`termina_con="forzado"` es señal de auditoría: el chunker no encontró corte permitido dentro de `[500, 750]` — archivo fuente con párrafo excesivamente largo.

### Referencia header ↔ chunks (decisión Q1=a)

Cuando un archivo se ingesta como `json` header + `text` chunked body (Patron, ConceptoCanonico, ADR futuros, Avance, DecisionFundada):
- El episodio `json` header crea el nodo con `entity_name=<codigo>` explícito
- Cada chunk `text` del body lleva metadata de referencia al header:
  - `patron_codigo_ref` para chunks de Patron
  - `concepto_nombre_ref` para chunks de ConceptoCanonico
  - `adr_codigo_ref` para chunks de ADR
  - `avance_titulo_ref` para chunks de Avance
  - `decision_codigo_ref` para chunks de DecisionFundada

Esto habilita queries tipo *"dame todo el texto del Patrón C-1"* usando `property_filters: [{propertyName: "patron_codigo_ref", value: "C-1"}]`.

### Casos especiales

- **ADRs y templates pre-estructurados:** chunkear por sección predefinida (`## Contexto`, `## Decisión`, etc.), NO por cap de chars. Cada `##` = 1 chunk aunque supere 750.
- **Tablas markdown > 750 chars:** chunkear entre filas, **replicar header de tabla en cada chunk derivado**.
- **Listas anidadas:** preservar jerarquía completa (item padre + sub-bullets) en un solo chunk.
- **Prosa densa sin puntos lógicos:** aceptar chunks de hasta 750 chars antes que cortar a mitad de razonamiento.

### Spec completa

Detalles operativos completos (overlap estructura exacta, checklist pre-ingesta del ingester, reglas sobre ambigüedad, cross-graph resolution por UUID, política bitemporal) en:

**`08-implementaciones-referencia/zep-pipeline/docs/ingestion_policy.md`** — contrato único para todos los ingesters.

---

## Referencias

- **ADR-001** (este sprint) — Cerebro Zep INL, Componente 5
- **ADR-002 ARCA** — hallazgo cap 10 keys en metadata Zep
- **Zep Custom Graph Schema:** https://help.getzep.com/customizing-graph-structure
- **Hallazgos ARCA aplicables** — 13 lecciones documentadas en `memory/project_sprint_inl_zepbrain.md`
