# Lecciones heredadas de ARCA — scope reducido para ingesta puntual INL

> **Scope de este documento:** las lecciones empíricas validadas en ARCA que aplican al **caso de uso INL-ZepBrain Fase 2.0/2.1**: bootstrap **puntual** de los 2 grafos Zep (`inl-framework-canonical` + `inl-framework-evidence`) corriendo **una sola vez** desde la máquina del operador. Sin GitHub Actions, sin delta incremental, sin tag `ultimo-zep-sync`, sin polling post-deploy.
>
> **Lecciones ARCA excluidas explícitamente** (no aplican a ingesta puntual): patrón P15 contrastivo de invalidación bitemporal, `FORCE_FILES` override, polling L3 con timeout no-bloqueante (fix P19), skip gates anti-bot, routing heurístico V4/V5 según categoría de PR, fix P09 de hunks de diff, `git diff --name-status` para delta A/M/D. Se retoman si en el futuro INL arma ingesta continua (Fase 4 equivalente, ADR futuro).

---

## Metadata de episodios — cumplir spec oficial Zep

### L1 — Cap de 10 keys por episodio (hard limit oficial)

**Origen ARCA:** `zep_daily_emitter.js::capMetadataKeys()` + ADR-002 ARCA.
**Validación:** spec oficial Zep (`help.getzep.com/adding-business-data#episode-metadata`).

**Regla:** cada episodio no puede llevar más de 10 keys de metadata. El caller construye el objeto en **orden de importancia**; el cap silencioso descarta las últimas con warning.

**Función que lo encapsula en INL:** `zep-pipeline/lib/zep_metadata.js::capMetadataKeys(metadata, maxKeys=10)`.

**Aplicación INL:** al construir metadata por entity (Ley, Patron, AntiPatron, FasePEAP, ConceptoCanonico, etc.), priorizar claves core del schema (`codigo`, `categoria`, `source_path`, `ingested_at`) antes de keys opcionales o derivadas del frontmatter.

### L2 — Solo escalares en metadata (string | number | boolean)

**Origen ARCA:** `zep_daily_emitter.js::sanitizeFrontmatterForZep()` + incidente empírico previo donde Zep descartó silenciosamente nested objects.

**Reglas:**
- **Nunca** `null` → descartado (usar string vacío `""` si hace falta marcar ausencia).
- **Nunca** `undefined` → descartado.
- **Nunca** objetos anidados → descartados silenciosamente por Zep (validado empíricamente en ARCA).
- **Arrays** → convertir a string CSV con sufijo `_csv` (ej: `alcance: [WS-00, WS-01]` → `alcance_csv: "WS-00,WS-01"`).

**Función que lo encapsula:** `zep-pipeline/lib/zep_metadata.js::sanitizeFrontmatterForZep(frontmatter)`.

**Aplicación INL:** el schema `metadata_schema.md` ya declara qué claves terminan en `_csv`. La función sanitiza el frontmatter de los `.md` del repo antes de enviarlo a Zep, dejando los arrays convertidos y los nulls descartados.

---

## Batching — asfixia controlada y hard-stop

### L3 — Batch size 20 + sleep 1500ms

**Origen ARCA:** `zep_daily_emitter.js::BATCH_SIZE=20, SLEEP_MS=1500` + `zep_narrative_emitter.js` idem.
**Validación:** Zep Cloud impone rate limit ~600 RPM. Lotes de 20 con 1.5s de pausa entre lotes mantiene margen seguro sin serializar uno por uno.

**Regla:** ingestar episodios en lotes de 20 con `sleep 1500ms` entre lotes. Calibrado como **valor default**; caller puede overridear.

**Función que lo encapsula:** `zep-pipeline/lib/zep_batching.js::batchIngest({client, graphId, episodes, batchSize=20, sleepMs=1500})`.

**Aplicación INL:** el bootstrap canonical va a generar decenas a cientos de episodios (Leyes, Patrones, Manifiestos, etc.). El batching evita 429 Too Many Requests. El bootstrap evidence (mayor volumen — avances, traumas, snapshots) depende críticamente de este batching.

### L4 — Hard-stop on batch failure (NO auto-healing)

**Origen ARCA:** `zep_daily_emitter.js::catch (e) { return collectedUuids; }` — corta el flujo al primer lote fallido, no reintenta en caliente.
**Validación:** el patrón DLQ (Dead Letter Queue) del framework INL — fallos no se mutan en caliente; se investigan y re-corren.

**Regla:** si un lote falla (ej. 503 de Zep Cloud), el ingester aborta inmediatamente. No hay retry loop. El operador investiga, corrige, y re-corre desde el lote fallido (o desde cero si el grafo está vacío).

**Función que lo encapsula:** `zep_batching.js` implementa hard-stop por default; el caller decide si abortar o loggear y seguir (config `onError: "hard-stop" | "log-continue"`, default `"hard-stop"`).

**Aplicación INL:** en ingesta puntual, hard-stop es más seguro que en CI — el operador está mirando la consola en tiempo real. Si falla un lote, para, diagnostica, arregla.

---

## Chunking semántico — coherencia para extracción por Graphiti

### L5 — Chunks por párrafos (no por chars fijos)

**Origen ARCA:** `lib/chunker.js::chunkDocument()` — divide por `\n\n`, agrupa hasta `chunkSize`, sub-chunkea por líneas si un párrafo excede.
**Validación:** reemplazo del `slice(0, 500)` fijo previo, que cortaba oraciones a la mitad y degradaba extracción de entidades Graphiti.

**Regla:** chunks respetan límites de párrafo. Overlap entre chunks se calcula en **límite de oración → línea → palabra** (nunca mid-word).

**Función que lo encapsula:** `zep-pipeline/lib/chunker.js::chunkDocument(text, chunkSize=500, overlap=50)` — **copia literal desde ARCA**, sin modificaciones.

**Aplicación INL:** todos los ingesters (canonical y evidence) usan `chunkDocument()` para el body de los `.md` con contenido narrativo largo.

### L6 — Bug-fix overlap semántico (2026-04-19)

**Origen ARCA:** `lib/chunker.js::computeSemanticOverlap()` — reemplazo del `slice(-N)` raw que cortaba palabras (caso real: chunk empezó con `"rante Paso 3 Zep..."`, corte en "du_rante").

**Regla:** overlap busca por orden de preferencia: fin de oración (`.!?:`) → último `\n` → último espacio → si nada, prefiere 0 overlap antes que romper palabra.

**Herencia INL:** función viene incluida en la copia literal de `chunker.js`. El bug-fix es parte del archivo original.

### L7 — ADRs como unidad semántica completa (no chunkear el header)

**Origen ARCA:** `zep_daily_emitter.js::isADR()` + lógica "ADRs unitarios".
**Validación:** Graphiti extrae mejor entidades y relaciones cuando el header completo del ADR (frontmatter + "## Contexto" + "## Decisión") va en el mismo episodio. Chunkear el header fragmenta la decisión.

**Regla:**
- Header del ADR (primeras 1-2 secciones `##`) → **1 solo episodio**, sin chunking.
- Body largo del ADR (resto de las secciones) → chunked normal con ref al header via `adr_codigo_ref` en metadata.

**Aplicación INL:** el canonical_ingester detectará ADRs del repo (`docs/adr-*.md`, `adrs-template/`, etc.) y aplicará esta lógica. Similar trato para Patrones (03-patrones/) y Manifiestos (04-manifiestos/).

---

## Frontmatter → metadata

### L8 — Parser YAML flat sin dependencies

**Origen ARCA:** `lib/frontmatter_parser.js` — parser minimalista de 128 LOC.
**Validación:** los `.md` del framework (ADRs, reportes, avances) usan YAML flat simple. Cargar `js-yaml` o `gray-matter` sería over-engineering y añadiría dependency transitiva.

**Regla:** parser soporta `key: value`, arrays inline `[a, b, c]`, booleanos, números, comentarios `#`. NO soporta nesting ni multi-line strings (`>`, `|`).

**Función que lo encapsula:** `zep-pipeline/lib/frontmatter_parser.js::parseFrontmatter(content)` — **copia literal desde ARCA**.

**Aplicación INL:** todo `.md` del repo que tenga frontmatter pasa por este parser. El resultado (objeto flat) entra a `sanitizeFrontmatterForZep()` antes de enviarse como metadata.

---

## Bitemporalidad — `createdAt` correcto

### L9 — Ruteo histórico vs vivo

**Origen ARCA:** `zep_narrative_emitter.js::resolvedDate` — distingue archivos históricos (reportes con fecha en el nombre o body) de archivos vivos (canónicos con `mtime`).

**Regla priorizada (heredada + ajustada para INL):**
1. Si el frontmatter tiene `fecha:` o `fecha_observacion:` parseable → usar esa.
2. Si no pero el body tiene `Fecha: YYYY-MM-DD` → extraer con regex.
3. Si no pero el nombre del archivo tiene fecha (`YYYY-MM-DD_...`) → extraer de ahí.
4. Fallback: `fs.statSync(path).mtime`.

**Timezone:** siempre `America/Argentina/Buenos_Aires` (constante `TIMEZONE` en `ontology/constants.py`; el ingester Node usa ese offset para emitir ISO 8601).

**Aplicación INL:**
- Canonical (`01-teoria/`, `03-patrones/`, etc.): archivos sin fecha semántica típicamente → caen en fallback `mtime`.
- Evidence (`05-evidencia/`, `07-avances/`, `REGISTRO_TRAUMAS.md`): archivos con fecha semántica explícita → usar regla 1/2/3 antes del fallback.

**Ubicación de la función:** NO se extrae como módulo propio. Las 2-3 funciones de ruteo viven dentro de cada `ingesters/*.js` según el dominio que ingesten (mantener scope mínimo de `lib/`).

### L10 — Ordenamiento cronológico pre-ingesta

**Origen ARCA:** `zep_narrative_emitter.js::episodes.sort()` antes del batching.
**Validación:** Graphiti procesa episodios del pasado al presente para construir correctamente el eje bitemporal. Sin ordenamiento, la invalidación de hechos viejos falla.

**Regla:** antes de mandar batches a Zep, ordenar el array `episodes` por `createdAt` ascendente (del más viejo al más reciente).

**Aplicación INL:** los ingesters aplican este sort inmediatamente antes del `batchIngest()`. Especialmente crítico en evidence (donde hay fechas reales dispersas); en canonical (donde la mayoría es `mtime`) es menos relevante pero no cuesta.

---

## Naming — `entity_name` canónico puro

### L11 — Sin prefijos descriptivos en `entity_name`

**Origen:** Spike V-RES #1 del sprint INL (sesión 2) — el extractor LLM de Zep con ingesta `text` libre genera nombres como `"patron C-1"`, `"ley F-5 Adaptadores"`, contaminando el grafo con aliases.
**Solución:** Camino C (Decisión H del ADR-001) — usar `add_fact_triple` con `entity_name` canónico puro (`"C-1"`, `"F-5"`) + cap de 50 chars.

**Regla:**
- `entity_name` = código puro del framework, sin prefijo descriptivo, sin espacios.
- Caps Zep (validados Spike V-RES #2): `entity_name ≤50`, `fact ≤250`, `fact_name ≤50` (SCREAMING_SNAKE_CASE).
- Nunca subir el cap desde el cliente — si un fact excede 250, recortar en el ingester.

**Aplicación INL:** esta es una lección del **propio sprint INL**, no de ARCA, pero se documenta acá porque los ingesters Node deben respetarla igual que los Python originales. El caller construye los `entity_name` siguiendo el regex universal `(F|O|R|C|A|G|AP|Dia)-\d+`.

---

## Resumen — qué se implementa en Fase 2.0 (4 archivos)

| # | Archivo `zep-pipeline/lib/` | Lecciones encapsuladas |
|---|---|---|
| 1 | `chunker.js` (copia literal) | L5, L6 |
| 2 | `frontmatter_parser.js` (copia literal) | L8 |
| 3 | `zep_metadata.js` (extracción parametrizada) | L1, L2 |
| 4 | `zep_batching.js` (extracción parametrizada) | L3, L4 |

**Lecciones L7, L9, L10, L11** se materializan dentro de los ingesters (`canonical_ingester.js`, `evidence_ingester.js`) en Fase 2.1, no en `lib/` — son lógica específica de cada dominio, no abstracciones reutilizables.

---

## Archivos ARCA NO copiados a INL (scope cerrado)

- `_scripts_v5_cibernetica/lib/guardrails_shared.js` — 100% ARCA-específico (invoca `audit_workflow_ids_drift.js` de ARCA). El patrón P15 contrastivo (`buildContrastiveEpisode`) que vive ahí tampoco entra porque no aplica a ingesta puntual.
- `_scripts_v5_cibernetica/lib/pr_metadata_extractors.js` — 95% ARCA-específico (capas 0-4, patrones WF ID, routing V4/V5, grafos ARCA). Si en el futuro INL necesita ingesta de PRs, tendrá su propio `inl_pr_metadata_extractors.js` separado.
- `_scripts_v5_cibernetica/zep_sensor_emitter.js` — sensor AST de workflows n8n ARCA. INL no tiene workflows n8n que auditar.
- `_scripts_v5_cibernetica/zep_pr_ingest.js` — ingesta post-merge via GitHub Action. Fuera de scope de ingesta puntual.
- `_scripts_v5_cibernetica/zep_daily_emitter.js` — motor delta con tag git + polling L3. Fuera de scope.
- `_scripts_v5_cibernetica/zep_narrative_emitter.js` — bootstrap narrativo ARCA. Sirve como referencia de arquitectura para `canonical_ingester.js` y `evidence_ingester.js` INL, pero no se copia (sus paths `docs/10_Reportes_Avances_Mejoras/` son ARCA-específicos).

---

**Autor:** GPU bajo protocolo INL V5 + Arquitecto (CPU) — Sesión 2026-04-20 #3 (post-ADR-002)
**Status:** APROBADO (implícito al arrancar Fase 2.0 con este catálogo como contrato de diseño)
**Relacionado con:** ADR-001 (Cerebro Zep INL), ADR-002 (Migración a Node compartido), `metadata_schema.md`, `ingestion_policy.md`
