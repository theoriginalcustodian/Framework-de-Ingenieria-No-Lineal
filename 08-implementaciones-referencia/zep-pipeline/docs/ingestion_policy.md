# Política de Ingesta y Chunking — Cerebro Zep INL

**Versión:** v1 (Fase 1 Sprint INL-ZepBrain)
**Fecha:** 2026-04-20
**Status:** CONTRATO ÚNICO DE REFERENCIA
**Relacionado con:** ADR-001 Cerebro Zep INL (Componente 8), `metadata_schema.md`
**Autoridad:** cualquier ingester del pipeline (Python one-shot, Node.js delta, hipotéticos futuros) DEBE implementar esta política — no es opcional

---

## Propósito

Este documento es el contrato único de ingesta del cerebro Zep INL. Responde tres preguntas:

1. **¿Qué entra como qué?** — política de nodalización por archivo fuente
2. **¿Cuándo chunkear y cómo?** — política de chunking para contenido narrativo
3. **¿Cómo se resuelven menciones cruzadas?** — estrategia cross-graph por UUID

Cualquier divergencia entre un ingester y esta política se considera bug del ingester.

---

## 1. Cuatro principios rectores

Toda decisión de ingesta deriva de estos 4 principios. Si aparece un caso ambiguo no cubierto por la tabla, resolverlo aplicando los principios en orden de prioridad.

### P1 — Fidelidad estructural sobre fidelidad semántica

Si el archivo fuente tiene **estructura canónica** (frontmatter YAML, secciones con encabezados fijos, tablas numeradas, leyes con código estable), esa estructura es más valiosa que cualquier extracción LLM. No se disuelve con chunking automático. Va **`json`** con metadata explícita.

**Corolario:** nunca chunkear sobre estructura ya tipada. Un bloque de 15 leyes con códigos R-1..R-15 no se chunkea "cada 500 chars" — se ingesta como 15 episodios json independientes.

### P2 — Nodalización explícita > extracción automática

El spike V-RES del 2026-04-20 demostró empíricamente que el extractor LLM de Zep en ingesta `text`:
- Inventa edge types no declarados en la ontología (caso: `APRECIO_EN` creado sin autorización)
- Produce naming impredecible (prefija "patron C-1" en lugar de "C-1" limpio)
- Deja labels vacíos `[]` en nodos que claramente encajan en el custom type

**Regla:** para toda entity canonical (Ley, Patron, AntiPatron, FasePEAP, header de ConceptoCanonico), el nodo se crea explícitamente con:
- `entity_name` = código canónico puro (`"C-1"`, `"R-5"`, `"AP-2"`, `"Dia-3"`, slug-corto para ConceptoCanonico)
- Episodio `type="json"` con metadata tipada
- Edges declarados como `fact_triple` hacia UUIDs conocidos (NO inferidos del texto)

**Esto es no negociable para canonical.** Cero dependencia del extractor LLM.

### P3 — Chunking solo donde la prosa ES el contenido

Chunking aplica únicamente a **prosa narrativa extensa** donde el valor está en la narrativa misma:
- Manifiestos (`04-manifiestos/*.md`) — argumentación desarrollada
- Teoría (`01-teoria/*.md`) — razonamiento conceptual denso
- Arquitectura cognitiva (`06-arquitectura-cognitiva/*.md`) — diseño narrado
- Avances (`07-avances/*.md`) — ideación emergente
- Razonamiento extenso de ADRs (body post-header)
- Retrospectivas y validaciones narradas (`05-evidencia/retrospectiva-*.md`, etc.)

Para **entidades atómicas** (Ley, AntiPatron, fila de tabla empírica, snapshot, fase PEAP), chunking destruye la unidad semántica y no aporta valor.

### P4 — Overlap contextual, no literal

Overlap NO es "los últimos 50 caracteres del chunk anterior copiados literal". Es **re-anclaje contextual**:
- Si el chunk anterior terminó dentro de una sección `## Foo > ### Bar`, el nuevo chunk arranca con una línea `[Contexto: ## Foo > ### Bar]`
- Luego la última oración completa del chunk anterior (si el corte fue a mitad de secuencia lógica)
- Luego el contenido nuevo

Cada chunk debe leerse solo sin perder referencia estructural, aunque cueste ~50-100 chars extra.

---

## 2. Tabla archivo-por-archivo

Cobertura: 100% del repo actual (carpetas `01-teoria/` a `08-implementaciones-referencia/` + docs de gobierno en raíz). 22 filas.

### 🔷 Grafo `inl-framework-canonical`

| Archivo / familia | Estrategia | Entity resultante | Nota operativa |
|---|---|---|---|
| `CONSTITUCION.md` § Leyes (6+4+5) | `json` por ley + `fact_triple` PROHIBE/REQUIERE | `Ley` (15 nodos) | `name` = código puro (`"R-5"`, `"1"`, etc.); `texto_canonico` completo al body |
| `03-patrones/a1-..g2-*.md` (9 patrones) | Mixto: `json` header → nodo `Patron` + `text` chunked body con `patron_codigo_ref` | `Patron` (9 nodos + N chunks) | Body chunks NO crean nodos nuevos — se linkean al header via metadata |
| `03-patrones/directivas-xml-agentes.md` | `text` chunked + `json` cabecera | `ConceptoCanonico(kind=artefacto)` | No es un patrón formal — es documentación técnica complementaria |
| `05-evidencia/antipatrones-y-kpis.md` | `json` por anti-patrón + `fact_triple` CONTRADICE | `AntiPatron` (4 nodos) | KPIs de medición van al body como tabla markdown preservada. Aunque el archivo esté físicamente en `05-evidencia/`, semánticamente es canonical (definición normativa) |
| `02-framework/protocolo-peap-v5-144h.md` | `json` por fase + `fact_triple` APLICA_A | `FasePEAP` (9 nodos) | Si el archivo tiene prosa extensa de la fase, mixto: json header + text chunked con `fase_dia_ref` |
| `02-framework/framework-vision-general.md` | `text` chunked por `##` + `json` header por sección | `ConceptoCanonico(kind=concepto)` | 1 ConceptoCanonico por sección `##` principal (Q2 = b) |
| `02-framework/patrones-auto-healing.md` | `text` chunked por `##` + `json` header por sección | `ConceptoCanonico(kind=concepto)` | Idem |
| `02-framework/SOFTWARE_AUTOCONSCIENTE_Concepto_Tecnico.md` | `text` chunked por `##` + `json` header por sección | `ConceptoCanonico(kind=concepto)` | Idem |
| `04-manifiestos/*.md` (4 archivos) | `text` chunked por `##` + `json` header por principio | `ConceptoCanonico(kind=manifiesto)` | 1 ConceptoCanonico por principio (ej. "muerte-al-hardcoding" → 4 nodos: Principio I, II, III, IV) |
| `01-teoria/*.md` (4 archivos) | `text` chunked por `##` + `json` header | `ConceptoCanonico(kind=concepto)` | Teoría Cibernética V5, Ecuación del Outlier, Abandono Preparado, Paper |
| `06-arquitectura-cognitiva/diseno-master-brain.md` | `text` chunked por `##` + `json` header | `ConceptoCanonico(kind=concepto)` | |
| `08-implementaciones-referencia/adrs-template/*.md` (templates) | `text` chunked por sección predefinida + `json` header | `ConceptoCanonico(kind=artefacto)` | Chunks respetan secciones estructurales (`## Contexto`, `## Decisión`, etc.) — NO cortar a mitad de sección aunque supere 500 chars |
| `08-implementaciones-referencia/memory-templates/` | `text` chunked + `json` header | `ConceptoCanonico(kind=artefacto)` | |
| `08-implementaciones-referencia/claude-md-template/` | `text` chunked + `json` header | `ConceptoCanonico(kind=artefacto)` | |
| `08-implementaciones-referencia/system-prompts/` | `text` chunked + `json` header | `ConceptoCanonico(kind=artefacto)` | |
| `08-implementaciones-referencia/skills/` | `text` chunked + `json` header | `ConceptoCanonico(kind=artefacto)` | Skills (SKILL.md + references/) |
| `REGLAS_EDITORIALES.md` | `text` chunked por `##` + `json` header | `ConceptoCanonico(kind=concepto)` | Normativo editorial — usa `kind=concepto` porque es definicional, no template reusable |

### 🔶 Grafo `inl-framework-evidence`

| Archivo / familia | Estrategia | Entity resultante | Nota operativa |
|---|---|---|---|
| Declarativo — ARCA y futuros | `json` puro | `ProyectoFuente` | Sin archivo específico; ingesta programática con `fact_triple EMERGIO_EN`, `GENERADO_EN` |
| `REGISTRO_TRAUMAS.md` | `json` por entrada + `text` chunked del razonamiento si >500 chars | `DecisionFundada(tipo=trauma)` | Fecha parseada del body (regex `\d{4}-\d{2}-\d{2}`) con override de `created_at`; no mtime |
| `SNAPSHOT_ESTADO.md` (versiones) | `json` por snapshot + `text` del body resumen | `SnapshotHistorico` | Delta ingester detecta mutación y crea nuevo episodio — el anterior NO se borra |
| `ADR-XXX-*.md` futuros (instanciados en `adrs-template/`) | `json` header + `text` chunked por sección | `DecisionFundada(tipo=adr)` | Header lleva `codigo="ADR-001"`, `status`, `autor`; chunks del razonamiento mantienen `adr_codigo_ref` |
| `05-evidencia/validacion-empirica-v5.md` | `text` chunked por caso + `json` headers por caso identificable | `EvidenciaEmpirica` por caso | Cada caso narrado es una evidencia separada |
| `05-evidencia/tablas-datos-empiricos.md` | `json` por fila (Q5 = a) | `EvidenciaEmpirica` (1 por fila) | Parseo de markdown tables → filas → episodios json. Header de tabla se replica en cada metadata |
| `05-evidencia/retrospectiva-sprint.md` | `text` chunked por `##` + `json` header | `EvidenciaEmpirica(tipo=validacion)` | |
| `05-evidencia/genesis-y-metricas-sprint.md` | Mixto: `json` por métrica cuantificable + `text` chunked de narrativa | `EvidenciaEmpirica(tipo=metrica)` | Métricas numéricas aisladas como json; contexto narrativo como chunks |
| `05-evidencia/validacion-meta-framework.md` | `text` chunked por `##` | `EvidenciaEmpirica(tipo=validacion)` | |
| `07-avances/*.md` (6 archivos) | `text` chunked por `##` + `json` header por avance | `Avance` (1 por archivo) + chunks del body | `categoria` se infiere del contenido (sprint/ideacion/consolidacion) |

### Reglas sobre ambigüedad

Si un archivo nuevo no encaja claramente:
1. ¿Tiene estructura canónica (códigos, frontmatter, leyes/patrones numerados)? → P1: `json` structured
2. ¿Es prosa narrativa con argumentación desarrollada? → P3: `text` chunked por `##`
3. ¿Es tabla de datos? → Q5: `json` por fila
4. ¿Es mixto (ej. archivo con tabla + prosa + ejemplos)? → Dividir: json para estructurado, text chunked para narrativo, linkear via metadata ref

Si aún queda ambiguo, **consultar al operador CPU antes de ingestar** — nunca ingestar por default asumiendo.

---

## 3. Política de chunking

Aplica solo a archivos marcados como `text chunked` en la tabla. Archivos marcados como `json` NO se chunkean.

### Parámetros base

| Parámetro | Valor | Origen |
|---|---|---|
| Tamaño objetivo | **500 chars** | Recomendación oficial Zep, validada empíricamente en ARCA |
| Tolerancia superior | **+50% → cap práctico 750 chars** (Q3 = b) | Evita cortes estructurales innecesarios |
| Overlap contextual | **~50-100 chars efectivos** (re-anclaje, no literal — P4) | |
| Chunk mínimo viable | **~150 chars** (si queda fragmento <150 al final, absorber en chunk anterior) | Evita micro-chunks sin contexto |

### Cortes PERMITIDOS (preferenciales, en este orden de prioridad)

1. **Fin de sección principal** — línea con `---` o whitespace después de `## Foo`
2. **Fin de subsección** — whitespace después de `### Bar`
3. **Fin de párrafo** — `\n\n` consecutivos
4. **Fin de bullet en lista** — `\n-` o `\n*` o `\n1.` al inicio de línea
5. **Fin de oración** — `.\s+` donde la siguiente palabra arranca con mayúscula o encabezado

El chunker debe buscar el primer corte permitido dentro de la ventana `[500, 750]` chars. Si no encuentra ninguno, cortar en la frontera más cercana al objetivo que no viole un corte prohibido.

### Cortes PROHIBIDOS

1. **Dentro de un code block** ``` ``` — preservar completo aunque supere 750 chars (Q4 = a)
2. **Dentro de una fila de tabla markdown** `|...|` — nunca cortar a mitad de fila
3. **Dentro de una referencia a archivo/path** — `03-patrones/c1-precomputacion.md` es atómico
4. **Dentro de un código canónico** — nunca partir `C-1`, `R-5`, `AP-2` en chunks distintos
5. **Dentro de una fórmula matemática** `$...$` o bloque math ``` $$...$$ ```
6. **Inmediatamente después de un encabezado** — dejar al menos 1 párrafo de contexto antes del corte
7. **Dentro de link markdown** — `[texto](url)` atómico
8. **Dentro de referencia a patrón/ley/fase** — "El Patrón C-1 aplica" debe quedar junto

### Overlap contextual — estructura

Cada chunk (excepto el primero del archivo) arranca con un **bloque de re-anclaje** de 2-4 líneas:

```
[Contexto: ## <sección principal> > ### <subsección si aplica>]

<última oración completa del chunk anterior — solo si el corte fue a mitad de secuencia lógica>

<contenido nuevo del chunk>
```

Si el chunk arranca con un encabezado nuevo (`##` o `###`), el overlap se omite — el encabezado mismo provee anclaje.

### Metadata de chunking (extensión al schema de `metadata_schema.md`)

Todo chunk agrega estas 5 keys (cuentan dentro del cap 10 del episodio):

| Key | Tipo | Descripción |
|---|---|---|
| `chunk_index` | Int | Posición 1-based dentro del archivo (1, 2, 3...) |
| `chunk_total` | Int | Total de chunks del archivo fuente |
| `seccion_origen` | Text | Path de sección markdown (ej. `"## Introducción > ### Contexto histórico"`) |
| `arranca_con` | Text | `"encabezado" | "parrafo" | "bullet" | "continuacion"` |
| `termina_con` | Text | `"seccion_completa" | "parrafo_completo" | "bullet_completo" | "oracion_completa" | "forzado"` |

`termina_con="forzado"` se usa solo si no se encontró corte permitido dentro de `[500, 750]` — es señal de auditoría (archivo fuente con párrafo excesivamente largo, considerar reestructurar).

### Chunk numbering — header vs body (HM-5)

Cuando un archivo se ingesta como `json` header + `text` chunked body (Patron, ConceptoCanonico, ADR futuros, Avance, DecisionFundada):

- **El header NO lleva `chunk_index` ni `chunk_total`.** El header no es un chunk — es una unidad semántica independiente que crea el nodo canónico con `entity_name`. Agregar numeración de chunks al header lo mezcla conceptualmente con los chunks del body (son cosas distintas).
- **Los chunks del body numeran 1..N**, independientes del header. `chunk_index: 1` es el primer chunk del cuerpo textual, `chunk_total: N` es el total de chunks del body (no incluye el header).
- **Los chunks del body referencian al header** via metadata `<entity>_slug_ref` (ej. `patron_codigo_ref: "C-1"`, `concepto_slug_ref: "muerte-al-hardcoding/principio-iv"`, `avance_slug_ref: "homeostasis-documental-bitemporal"`, `decision_codigo_ref: "ADR-001"`), no via `chunk_index`.

**Consecuencia operativa:** para reconstruir el contenido completo de un nodo header, el ingester/query hace 2 pasos:
1. Trae el header por `entity_name` (episodio `json`).
2. Trae todos los chunks con `<entity>_slug_ref == <entity_name del header>`, ordenados por `chunk_index`.

Esto habilita también queries parciales tipo *"dame solo la sección `## Consecuencias` del ADR-001"* filtrando por `seccion_origen`.

---

## 4. Casos especiales

### ADRs y templates pre-estructurados

Archivos en `08-implementaciones-referencia/adrs-template/` y similares tienen estructura predefinida (`## Contexto`, `## Decisión`, `## Alternativas`, etc.). **NO chunkear libremente** — chunkear **por sección predefinida**: cada `##` = 1 chunk independiente aunque supere 750 chars. La pre-estructura es más valiosa que el límite.

**Excepción:** si una sección supera 2000 chars, permitir subchunks internos respetando `###` subsecciones.

### Tablas markdown

**Tabla completa ≤ 750 chars:** preservar en 1 chunk.

**Tabla completa > 750 chars:** chunkear **entre filas**, nunca a mitad de fila. Cada chunk derivado **repite el header** de la tabla (línea con columnas + línea separadora `|---|`). Esto permite que chunks de tabla se lean solos sin perder el nombre de las columnas.

Ejemplo:
```
Chunk 1:
| Patron | Proyecto | Fecha |
|---|---|---|
| C-1 | ARCA | 2026-02-10 |
| A-2 | ARCA | 2026-03-01 |
...

Chunk 2 (continuación):
| Patron | Proyecto | Fecha |
|---|---|---|
| G-1 | ARCA | 2026-04-05 |
...
```

### Code blocks

**Todo code block ``` ``` se preserva como unidad** en un chunk propio (Q4 = a). Si supera 2000 chars, es señal de auditoría del archivo fuente — probablemente debería extraerse a archivo `.py/.js/.md` separado.

Code blocks se ingestan como chunks normales con metadata `arranca_con="encabezado"` o `"parrafo"` según el contexto + una key adicional `contiene_code_block=true` (si el cap de 10 lo permite) o prefijo visible en el body del episode.

### Prosa densa (teoría Cibernética V5, Ecuación del Outlier, Paper)

Archivos con párrafos muy largos (>500 chars) donde no hay puntos lógicos internos naturales. **Aceptar chunks de hasta 750 chars antes que cortar a mitad de razonamiento.** Si un párrafo supera 750, buscar:
1. Punto y coma con siguiente frase capitalizable
2. Conjunción que abra sub-argumento (`Sin embargo,`, `Por tanto,`, `Esto implica que`)
3. Fin de oración con verbo principal terminado

Solo si ninguno aparece, aceptar `termina_con="forzado"` con auditoría manual posterior.

### Listas anidadas

Nunca cortar entre `- item padre` y sus sub-bullets `  - item hijo`. La jerarquía visual se preserva completa en un solo chunk, aunque supere 750 chars.

### Referencias cruzadas a otros archivos

Frases tipo `"ver 03-patrones/c3-exocortex.md"` son atómicas. El chunker detecta la referencia antes de cortar y la mantiene entera. Además, el body del chunk preserva el link markdown si existía.

---

## 5. Cross-graph resolution — menciones de canonical en evidence

### Problema

Los episodios del grafo evidence frecuentemente mencionan entidades del grafo canonical:
- "El Patrón C-1 se aplicó en PR-204 de ARCA" → mención a `Patron C-1` desde una `EvidenciaEmpirica`
- "Esta decisión invalida la Ley R-2" → mención a `Ley R-2` desde una `DecisionFundada`
- "Anti-Patrón AP-3 se manifestó en sprint de marzo" → mención a `AntiPatron AP-3` desde `Avance`

Estas menciones DEBEN resolverse en edges `RESPALDA`, `INVALIDA`, `EMERGIO_EN`, etc., apuntando al nodo canonical correcto. Pero canonical y evidence son **grafos físicamente distintos** en Zep — el extractor LLM del grafo evidence no tiene visibilidad del canonical.

### Solución — resolución cliente-side por UUID

**Fase bootstrap (Fase 2 del sprint):**
1. Canonical se ingesta primero con todos sus nodos (Ley, Patron, AntiPatron, FasePEAP, ConceptoCanonico)
2. Al crear cada nodo canonical, el ingester persiste su UUID en `canonical_uuid_map.json`:

```json
{
  "Ley": {
    "R-1": "uuid-xxx-xxx",
    "R-5": "uuid-yyy-yyy",
    "1": "uuid-zzz-zzz"
  },
  "Patron": {
    "C-1": "uuid-aaa-aaa",
    "A-2": "uuid-bbb-bbb"
  },
  "AntiPatron": {
    "AP-2": "uuid-ccc-ccc"
  },
  "FasePEAP": {
    "Dia-3": "uuid-ddd-ddd"
  }
}
```

**Fase ingesta evidence (Fases 3-4):**
1. Antes de ingestar un episodio `text` al grafo evidence, el ingester escanea el body con regex: `(F|O|R|C|A|G|AP|Dia)-\d+`
2. Cada match se valida contra `canonical_uuid_map.json`
3. Por cada match válido, se emite un `fact_triple` explícito **antes o después** del episodio (decisión: emitir después, cuando el episodio ya tiene UUID de source)
4. El fact_triple lleva:
   - `source`: UUID del nodo source en evidence (ej. la `EvidenciaEmpirica` recién creada)
   - `target`: UUID del nodo canonical resuelto vía el mapa
   - `edge_type`: inferido del contexto (ver tabla abajo)
   - `fact`: frase textual que contiene la mención (para trazabilidad)

### Inferencia de edge_type desde el texto

Reglas simples (deterministas, sin LLM):

| Patrón del texto | Edge emitido |
|---|---|
| `"se aplicó"`, `"se validó"`, `"funcionó"`, `"aplica"` | `RESPALDA` |
| `"se invalidó"`, `"invalida"`, `"deprecó"`, `"ya no aplica"`, `"rotated from X to Y"` | `INVALIDA` |
| `"emergió en"`, `"apareció en"`, `"se observó por primera vez en"` | `EMERGIO_EN` |
| Ambiguo (mención sin verbo de relación claro) | `REFERENCIA` (fallback) |

Esta heurística es deliberadamente conservadora. Prefiere `REFERENCIA` antes que inventar un edge type fuerte (`RESPALDA`/`INVALIDA`) sin confianza. El monitoreo KPI mide después si muchos `REFERENCIA` podrían ser upgradeados.

### Falta de match — código mencionado que no existe en canonical

Si regex encuentra un código (`C-42`) que no está en `canonical_uuid_map.json`:
- **NO emitir fact_triple** (el target no existe)
- **Loggear como warning** en el ingester: `"Mención a C-42 no resuelve en canonical. Posible typo o referencia a elemento no ingestado."`
- El episodio se ingesta igual — el LLM puede crear un nodo orphan en evidence, pero queda sin cross-graph edge
- Reporte periódico de orphans → auditoría manual

---

## 6. Política de actualización bitemporal

Aplica principalmente al grafo evidence (canonical es inmutable salvo PR formal).

### Cuándo un episodio invalida a otro

Zep soporta invalidación bitemporal vía **episodios contrastivos narrativos** (hallazgo ARCA #6). El formato es prosa literal:

- `"ARCA has rotated from Dia-6 to Sprint-360h"` → invalida fact previo sobre fase de ARCA
- `"Patron C-2 has been superseded by Patron C-3-bi"` → invalida fact sobre vigencia de C-2

El delta ingester detecta cambios en campos bitemporales (ej. `fase_peap_actual` de `ProyectoFuente`, `status` de `DecisionFundada`) y emite el episodio contrastivo automáticamente ANTES del episodio con el valor nuevo.

### Cuándo NO se invalida — archivos simplemente borrados del repo

Hallazgo ARCA P09/P15: archivos borrados físicamente del repo **NO se ingestan como invalidación** — envenena el grafo con facts tipo `"file X has been removed"` que son ruido. El delta ingester filtra archivos borrados antes de procesarlos.

Si un archivo se borra por decisión editorial consciente (ej. patrón deprecado), emitir episodio contrastivo manual con prosa explícita en lugar de depender del ingester detectando el delete.

---

## 7. Validación pre-ingesta (checklist del ingester)

Antes de llamar `zep_graph_add_episode`, el ingester DEBE verificar:

- [ ] **Archivo NO borrado** — existe físicamente en el repo al momento de ingesta
- [ ] **Metadata ≤ 10 keys** — cap duro de Zep
- [ ] **Metadata solo scalares** — arrays transformados a `*_csv`, nested objects descartados
- [ ] **Fechas con timezone explícito** — ISO 8601 con `-03:00`, no naive
- [ ] **`source_path` relativo** al root del repo, no absoluto Windows
- [ ] **Grafo destino correcto** — `graph_id` coincide con la clasificación canonical/evidence del archivo
- [ ] **`entity_name` canónico** si es canonical — código puro sin prefijos descriptivos
- [ ] **Chunk respeta cortes prohibidos** si es `type="text"`
- [ ] **UUID map actualizado** si se está ingestando canonical por primera vez
- [ ] **Mapa UUID consultado** si se está ingestando evidence con menciones cruzadas

Cualquier check que falle → hard-stop del ingester. NO avanzar git tag. El fallo se empaqueta como `Trauma` con fingerprint (Patrón A-4).

---

## 8. Hallazgos empíricos incorporados

Esta política incorpora lecciones específicas de:

### Del spike V-RES INL #1 (2026-04-20, grafo `inl-test-ontology` throwaway)
- Extractor LLM de Zep inventa edge types no declarados → canonical 100% determinístico (P2, Componente 8)
- Naming impredecible de nodos en ingesta `text` → `entity_name` explícito canónico
- Labels `[]` en nodos custom-compatibles → no depender del classifier automático
- MCP Zep espera `properties` (no `custom_fields`) para campos custom de ontology (bug de documentación)
- MCP Zep `graph_search` no soporta `node_labels` filter ni `edge_types` filter → consultas tipadas vía SDK nativo

### Del spike V-RES INL #2 (2026-04-20, grafo `inl-test-fact-triple` throwaway — validación HM-3)
- `add_fact_triple` funciona como mecanismo determinístico canonical: crea 2 nodos (source + target) con `entity_name` exacto + 1 edge tipado con `fact_name` exacto. Cero captura entrópica observada.
- `source_node_name` y `target_node_name` caps en **50 chars** — más que suficiente para códigos canónicos (`F-1`, `C-1`, `AP-2`, `Dia-3`) y slugs compuestos (`homeostasis-documental-bitemporal`, `muerte-al-hardcoding/principio-iv`).
- `fact` caps en **250 chars** — suficiente para frase descriptiva del hecho.
- `fact_name` caps en **50 chars** + debe ser SCREAMING_SNAKE_CASE — match con convención de edges INL (`PROHIBE`, `REQUIERE`, `APLICA_A`, `CONTRADICE`, `DEFINE`, `REFERENCIA`, `RESPALDA`, `INVALIDA`, `EMERGIO_EN`, `GENERADO_EN`, `CAPTURA`).
- `valid_at` (RFC3339) se respeta como anchor bitemporal del fact — usar fecha semántica del evento (R7).
- **Dedupe por `name`:** si se llama `add_fact_triple` múltiples veces con mismo `source_node_name`, Zep reusa el UUID del nodo existente. No duplica.
- **⚠️ Múltiples edges entre mismo par (source, target):** Zep puede **mergear/ocultar** edges del mismo par vía cross_encoder ranking, retornando solo el más relevante en search. Para canonical no es crítico (Ley → Patron típicamente 1 edge). Workaround si emerge la necesidad: usar `fact` único discriminante o `valid_at` distintos.
- **⚠️ Sin `labels` legibles:** igual que spike #1, el search retorna `labels: []` aunque los nodos tengan `entity_type` custom. Confirmar etiquetado real requiere SDK nativo o query Neo4j directa (post-ingesta).

### De incidentes ARCA previos (hallazgos 1-13 del sprint memory)
- #2: metadata cap 10 keys, solo scalares, arrays como `*_csv`
- #3: `json` para eventos estructurados, `text` para prosa
- #4: Zero-Waste Delta via `git tag ultimo-zep-sync`
- #5: archivos borrados NO se ingestan
- #6: invalidación bitemporal vía episodios contrastivos narrativos
- #7: batching con asfixia controlada (BATCH_SIZE=20, SLEEP_MS=1500)
- #8: hard-stop on failure, tag git NO avanza
- #9: timezone explícito `America/Argentina/Buenos_Aires`
- #10: ADRs y patrones son unidad semántica COMPLETA — NO chunkear
- #11: hunks de diff líneas `-` se omiten
- #12: polling bitemporal con timeout 3 min
- #13: `FORCE_FILES` env var para re-ingesta manual

---

## 9. Referencias

- **ADR-001** (este sprint) — Cerebro Zep INL, Componente 8
- **`metadata_schema.md`** — schema metadata por entity (capítulos complementarios)
- **ADR-002 de ARCA** — hallazgo cap 10 keys metadata Zep
- **Spike V-RES** — `inl-test-ontology` (grafo throwaway borrado 2026-04-20; resultados documentados en esta política)
- **Zep Cloud — Custom Graph Schema:** https://help.getzep.com/customizing-graph-structure
- **Memoria de sprint:** `memory/project_sprint_inl_zepbrain.md`

---

*Esta política es el contrato único de ingesta del cerebro Zep INL. Modificarla requiere ADR sucesor que documente la razón del cambio y aplique meta-validación de las 5 preguntas del Paso 4.5 del framework.*
