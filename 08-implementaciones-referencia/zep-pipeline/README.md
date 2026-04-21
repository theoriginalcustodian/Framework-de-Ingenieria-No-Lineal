# zep-pipeline — Cerebro Zep del Framework INL

Pipeline híbrido **Python (ontología) + Node.js (ingesta)** que instancia el Framework Ingeniería No Lineal como **2 grafos Zep standalone consultables** desde Claude Code. La infraestructura de ingesta vive como **librería Node compartida** entre ARCA e INL (ADR-002).

> **Estado:** Fase 1 cerrada (ontología v2 + especificación). ADR-002 aprobado — próximo bloqueante: Fase 2.0 (extracción de `lib/` Node desde scripts ARCA).
> **Referencia de diseño:** `docs/adr-001-cerebro-zep-inl.md` (arquitectura semántica) + `docs/adr-002-reutilizacion-scripts-arca.md` (decisión de stack Node compartido) + `docs/metadata_schema.md` + `docs/ingestion_policy.md`.

---

## 🎯 Qué es esto

Dogfooding nivel 2 del **Patrón C-3 Exocórtex**. El framework que predica externalizar la memoria cognitiva instancia su propia memoria externalizada como cerebro consultable.

**Dos grafos especializados por velocidad de cambio:**

| Grafo | Contenido | Cambio |
|---|---|---|
| `inl-framework-canonical` | Leyes, Patrones, Manifiestos, Teoría, Arquitectura Cognitiva, Fases PEAP, Conceptos, Artefactos | Baja — inmutable con PR |
| `inl-framework-evidence` | Evidencia empírica, Avances, Traumas, Snapshots, ADRs instanciados, Proyectos fuente | Alta — evolutivo bitemporal |

**Cross-graph resolution** por UUID mapeado (`canonical_uuid_map.json`) + regex `(F|O|R|C|A|G|AP|Dia)-\d+` sobre el body de episodios evidence.

---

## 🗂️ Estructura

```
zep-pipeline/
├── ontology/                              # Definición declarativa (Python — Pydantic v2)
│   ├── constants.py                       # Graph IDs, caps, regex, timezone (Ley F-1)
│   ├── ontology_definition.py             # 10 entities + 12 edges Pydantic v2
│   ├── setup_ontology.py                  # Aplica ontología con --dry-run / --apply
│   ├── bootstrap_graphs.py                # Crea los 2 grafos (stub Fase 2.1)
│   └── concepto_canonico_kinds.md         # Tracking Constraint A-2 (ADR-001 HM-1)
├── lib/                                   # Librería Node compartida — extracción Fase 2.0 (ADR-002)
│   ├── chunker.js                         # Copiado desde ARCA (Decisión B ADR-001)
│   ├── frontmatter_parser.js              # Copiado desde ARCA (Decisión B ADR-001)
│   ├── zep_metadata.js                    # [Fase 2.0] sanitizeFrontmatterForZep + capMetadataKeys
│   ├── zep_batching.js                    # [Fase 2.0] batching resiliente con hard-stop
│   ├── zep_bitemporal.js                  # [Fase 2.0] ruteo histórico/vivo + ordenamiento cronológico
│   ├── zep_delta_engine.js                # [Fase 2.0] git diff A/M/D + hunks + FORCE_FILES + tag
│   ├── zep_contrast_emitter.js            # [Fase 2.0] patrón P15 invalidación bitemporal
│   └── zep_polling.js                     # [Fase 2.0] L3 polling no-bloqueante (fix P19)
├── ingesters/                             # Thin wrappers Node consumidores de lib/ (Fase 2.1-4)
│   ├── canonical_ingester.js              # Fase 2.1: bootstrap canonical (reemplaza .py deprecado)
│   ├── evidence_ingester.js               # Fase 3: bootstrap evidence (reemplaza .py deprecado)
│   └── delta_ingester.js                  # Fase 4: delta post-merge con git tag ultimo-zep-sync
├── queries/                               # Queries de validación (Fase 2.1+)
│   └── smoke_test.js                      # Sanity check post-ingesta (Node)
├── tests/                                 # Auditorías y validaciones
│   ├── audit_edge_entropy.py              # KPI captura entrópica (Python — ADR-001 HM-2)
│   └── lib/                               # Unit tests vitest sobre módulos de lib/ (Fase 2.0)
├── docs/                                  # Documentación consolidada
│   ├── adr-001-cerebro-zep-inl.md         # Arquitectura semántica (2 grafos, ontología v2, UUID map)
│   ├── adr-002-reutilizacion-scripts-arca.md  # Stack Node compartido con ARCA (aprobado 2026-04-20)
│   ├── lecciones_heredadas_de_arca.md     # [Fase 2.0] Catálogo 13+ lecciones empíricas ARCA→INL
│   ├── metadata_schema.md                 # Contrato metadata por entity
│   └── ingestion_policy.md                # Chunking + bitemporalidad + cross-graph UUID
├── audit_reports/                         # Output de audit_edge_entropy.py (gitignored)
├── requirements.txt                       # Deps Python (ontología + audit)
├── package.json                           # Deps Node.js (ingesta — dominante)
├── .env.example                           # Template de config
└── .gitignore                             # node_modules, __pycache__, .env, audit_reports/
```

**División lingüística (ADR-002):**
- **Python** → ontología (Pydantic v2 declarativa) + audit entropy.
- **Node.js** → toda la ingesta vía librería compartida `lib/`.

---

## 🚀 Quick start (Fase 2.1 en adelante — no ejecutar aún)

```bash
# 1. Clonar repo + entrar a la carpeta
cd 08-implementaciones-referencia/zep-pipeline

# 2. Setup Node.js (stack dominante — ingesta)
npm install

# 3. Setup Python (solo para ontología + audit)
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 4. Cargar API key del proyecto Zep INL
cp .env.example .env
# Editar .env con ZEP_API_KEY del proyecto inl-framework

# 5. Bootstrap de grafos — Python (una sola vez)
python ontology/bootstrap_graphs.py --dry-run   # validar
python ontology/bootstrap_graphs.py --apply

# 6. Aplicar ontología — Python
python ontology/setup_ontology.py --dry-run     # inspeccionar payload
python ontology/setup_ontology.py --apply

# 7. Ingesta canonical — Node (Fase 2.1)
node ingesters/canonical_ingester.js --dry-run
node ingesters/canonical_ingester.js

# 8. Ingesta evidence — Node (Fase 3)
node ingesters/evidence_ingester.js --dry-run
node ingesters/evidence_ingester.js

# 9. Delta incremental — Node (Fase 4, ejecutado por CI post-merge)
node ingesters/delta_ingester.js
```

---

## 🔑 Decisiones arquitectónicas (cerradas en Fase 1 + ADR-002)

| # | Decisión | Razonamiento |
|---|---|---|
| **A** | 2 grafos standalone especializados | Ley F-4 Isomorfismo + F-5 Adaptadores |
| **B** | Copiar libs ARCA (`chunker.js`, `frontmatter_parser.js`) | Ley F-5 Aislamiento + emergencia empírica |
| **C** | Schema-first (contrato metadata antes de ingesta) | Patrón C-1 Pre-Computación |
| **D** | ADR formal completo | Patrón C-3 Exocórtex (decisión transversal) |
| **E** | Interfaz dual: slash command + skill ReAct | Patrón C-2 CPU/GPU + C-5 ReAct |
| **F** | Ontología v2 especializada (5+6 c/u, 40-50% margen) | Ley F-1 + F-5 + navaja Ockham |
| **G** | Proyecto Zep dedicado `inl-framework` | Aislamiento de dominio |
| **H** | Camino C: json + fact_triple determinístico, cross-graph UUID | Validado empíricamente Spike V-RES #1 |
| **I** (ADR-002) | Librería Node compartida `lib/` + ingesters Node consumidores | Pregunta A-1 + Ley F-5 + dogfooding nivel 3 de C-3 Exocórtex |

---

## ⚠️ Gotchas conocidos (validados empíricamente)

1. **Bug MCP Zep:** `zep_set_ontology` expone `custom_fields` pero la API real espera `properties`. Este pipeline usa `properties` vía modelos Pydantic. Ver Spike V-RES #1 en `docs/ingestion_policy.md §8`.
2. **Caps Zep:** `entity_name` ≤50, `fact` ≤250, `fact_name` ≤50 chars. Validado en Spike V-RES #2.
3. **Extractor LLM inventa edge types:** por eso usamos `add_fact_triple` declarativo en canonical, NO ingesta `text` libre.
4. **Labels `[]` en search:** bug conocido del MCP. El workaround es resolver por `entity_name` exacto.
5. **Cap metadata:** 10 keys máximo por episodio. Arrays → CSV. Nested objects descartados silenciosamente.

---

## 🔗 Referencias cruzadas

- **ADR-001 (arquitectura semántica):** `docs/adr-001-cerebro-zep-inl.md`
- **ADR-002 (stack Node compartido):** `docs/adr-002-reutilizacion-scripts-arca.md`
- **Schema de metadata:** `docs/metadata_schema.md`
- **Política de ingesta:** `docs/ingestion_policy.md`
- **Catálogo de lecciones heredadas:** `docs/lecciones_heredadas_de_arca.md` (a crear en Fase 2.0)
- **Scripts fuente ARCA (referencia solo, repo privado del operador):** carpeta `_scripts_v5_cibernetica/` — `zep_sensor_emitter.js`, `zep_pr_ingest.js`, `zep_daily_emitter.js`, `zep_narrative_emitter.js`
- **Decisión H (cross-graph UUID):** `REGISTRO_TRAUMAS.md 2026-04-20 Naming canónico uniforme`
- **Decisión I (stack Node compartido):** `REGISTRO_TRAUMAS.md 2026-04-20 Migración del pipeline INL-ZepBrain a Node compartido con ARCA`
- **Memoria auto-managed del sprint:** archivo privado del operador (`project_sprint_inl_zepbrain.md` en la memoria local del agente) — no commiteada al repo
- **Framework canónico:** `01-teoria/` → `08-implementaciones-referencia/`
