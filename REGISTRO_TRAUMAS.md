# 📚 REGISTRO DE TRAUMAS — Historia del Repositorio INL

> **HISTORIA** del Handshake V5. Acá vive el razonamiento explícito detrás de cada decisión crítica del repo. Si alguien (humano o agente) pregunta "¿por qué se decidió X?", la respuesta está acá.
>
> **Regla de ingreso:** una entrada nueva se registra solo cuando una decisión cumple alguno de estos criterios:
> 1. Cambió una ley en `CONSTITUCION.md`
> 2. Descartamos una opción con razonamiento que no es obvio en la ley
> 3. Detectamos un anti-patrón y lo resolvimos con un parche sistémico
>
> Una sesión sin delta en ninguna categoría no genera entrada. No se documenta rutina.

---

## 📐 Formato de entrada

```
## [YYYY-MM-DD] Título corto

**Tipo:** [Ley nueva | Decisión fundada | Anti-patrón resuelto]
**Ley/Anti-patrón afectado:** [Ley R-X | Anti-patrón N | Ninguna]
**Contexto:** Qué estaba pasando.
**Opciones evaluadas:** Lista con pros/contras desde el framework.
**Decisión:** Qué se eligió.
**Razonamiento:** Por qué, citando ley o principio INL.
**Consecuencia:** Qué cambió en el repo / qué quedó pendiente.
```

---

## 🗓️ Entradas

> **Orden:** más reciente primero (reverso cronológico). Así el hook `SessionStart` toma la última decisión como la entrada de cabecera del archivo.

---

## 2026-04-20 — Migración del pipeline INL-ZepBrain a Node compartido con ARCA (ADR-002)

**Tipo:** Decisión fundada
**Ley/Anti-patrón afectado:** Pregunta A-1 del framework (replicabilidad), Ley F-5 (Adaptadores Universales), Patrón C-3 Exocórtex (dogfooding nivel 3 aplicado a infraestructura de ingesta)

**Contexto:** Al abrir Fase 2 del Sprint INL-ZepBrain (sesión 3 del 2026-04-20), GPU iba a implementar `canonical_ingester.py` en Python desde cero, siguiendo el README original del `zep-pipeline/`. Antes de arrancar, el Arquitecto pidió revisar los 4 scripts hermanos de ARCA (`zep_sensor_emitter.js`, `zep_pr_ingest.js`, `zep_daily_emitter.js`, `zep_narrative_emitter.js` en `_scripts_v5_cibernetica/`). La revisión reveló que el ~70% del trabajo que INL iba a re-implementar ya está resuelto empíricamente en ARCA: chunking semántico, metadata compliant con cap 10 + arrays→CSV + sin nulls, batching resiliente con asfixia controlada, polling L3 no-bloqueante (fix P19), patrón contrastivo P15 para invalidación bitemporal, skip gates anti-bot, detección ADRs como unidad, `FORCE_FILES` como escape hatch, etc. Implementar Python desde cero obligaba a re-descubrir empíricamente los mismos incidentes que ARCA ya sufrió (contaminación V4/V5 de 41 episodios "[Archivo Eliminado]", duplicados por timeout, edges stale por rotación de ID).

**Opciones evaluadas:**
- **(α) Librería Node compartida `zep-pipeline/lib/` + ingesters INL Node consumidores + ARCA migra después vía ADR-003 futuro** → **elegida**.
  - Pro: aplica Pregunta A-1 del framework sobre infraestructura real (una lib, N consumidores).
  - Pro: INL hereda 13+ lecciones empíricas de ARCA sin re-descubrirlas.
  - Pro: dogfooding nivel 3 del Patrón C-3 — la infraestructura de ingesta es artefacto compartido entre proyectos INL.
  - Pro: fixes cross-proyecto (bug en INL → beneficia ARCA y viceversa).
  - Contra: rompe la coherencia "dual Python/Node" del README original.
  - Contra: requiere trabajo upfront de extracción (estimado 1-2 sesiones) antes de empezar Fase 2.1.
  - Contra: acoplamiento temporal ARCA↔INL hasta que ARCA refactorice (ventana 1-2 sprints).
- (β) Python puro desde cero (plan original ADR-001) → descartada: reinventa infraestructura validada en producción, viola Pregunta A-1, costo alto sin beneficio técnico.
- (γ) Portar los 4 scripts ARCA a Python en bloque → descartada: traducción gratuita con riesgo de bugs de porting; ARCA sigue en Node sin beneficio; duplicación perpetua.
- (δ) Desacoplamiento total sin librería compartida → descartada: viola Ley F-5; fixes no se propagan entre proyectos; espíritu C-3 (exocórtex compartido) incumplido.

**Decisión:** (α). División lingüística clara: Python solo para ontología (`bootstrap_graphs.py`, `setup_ontology.py`, `ontology_definition.py`, `constants.py`) y audit (`audit_edge_entropy.py`). Node.js para toda la ingesta. Se crean 6 módulos en `zep-pipeline/lib/`: `zep_metadata.js`, `zep_batching.js`, `zep_bitemporal.js`, `zep_delta_engine.js`, `zep_contrast_emitter.js`, `zep_polling.js`. Los 3 ingesters del plan original cambian extensión: `canonical_ingester.py` → `.js`, `evidence_ingester.py` → `.js`, `delta_ingester.js` se mantiene. ARCA no se toca en este sprint — refactor futuro vía ADR-003.

**Razonamiento:**
1. **Pregunta A-1 (replicabilidad):** el problema "ingestar docs a Zep con chunking + metadata compliant + batching + polling + bitemporalidad" no es único de ARCA ni de INL. Es el adaptador universal del Patrón C-3 Exocórtex aplicado a cualquier repo documental. Una librería, N consumidores.
2. **Ley F-5 Adaptadores Universales:** el framework predica "un solo adaptador para todos los casos del dominio". Duplicar ARCA-inline + INL-Python-from-scratch sería exactamente el anti-patrón que F-5 prohíbe.
3. **Patrón C-3 Exocórtex — dogfooding nivel 3:** el sprint ya hace dogfooding nivel 2 (framework como grafo consultable). Agregar nivel 3 (infraestructura de ingesta como artefacto compartido) es consistencia recursiva con el propio framework.
4. **Ley F-1 Anti-Hardcoding:** los scripts ARCA tienen hardcoding (`TARGET_GRAPHS`, `BASE_DIR`, `DOCS_DIR`, paths ARCA-específicos). La extracción parametriza cada uno — aplica F-1 al propio subsistema de ingesta.
5. **Validación empírica preexistente:** los scripts ARCA están en producción desde múltiples ciclos (fechas 17-04, 19-04, 20-04-2026 en comentarios del código). El SDK Node `@getzep/zep-cloud` heredó esa validación. El SDK Python `zep-cloud` tenía TODO explícito de V-EXT pendiente (`bootstrap_graphs.py:49`).
6. **Precedente existente en el propio ADR-001:** Decisión B ya aprobó copiar `chunker.js` y `frontmatter_parser.js` desde ARCA (duplicación consciente). El ADR-002 extiende esa decisión a librería compartida completa, reduciendo duplicación en lugar de multiplicarla.

**Consecuencia:**
- `zep-pipeline/docs/adr-002-reutilizacion-scripts-arca.md`: **creado** con status APROBADO, 7 componentes decisionales, 4 alternativas documentadas, 4 riesgos con mitigaciones, plan de implementación en fases 2.0 → 2.1 → 3 → 4 → 5.
- `SNAPSHOT_ESTADO.md`: Fase 2 dividida en 2.0 (extracción lib) + 2.1 (bootstrap canonical en Node). Próximo bloqueante actualizado.
- `08-implementaciones-referencia/zep-pipeline/README.md`: pendiente actualizar para reflejar stack híbrido Python+Node con Node dominante.
- `memory/project_sprint_inl_zepbrain.md`: pendiente actualizar con el giro estratégico y el nuevo orden de fases.
- **Scripts Python deprecados del plan original:** `canonical_ingester.py` y `evidence_ingester.py` no se implementarán. Los stubs Python que pudieran existir quedan obsoletos.
- **ARCA intacto en este sprint.** El refactor ARCA se difiere a ADR-003 futuro cuando la librería esté madura y validada en INL.
- **ADR-001 se mantiene válido.** Los 8 componentes decisionales (2 grafos, ontología v2, cross-graph UUID, proyecto dedicado, etc.) no cambian. ADR-002 solo modifica el lenguaje de los ingesters, no la arquitectura semántica.

---

## 2026-04-20 — Naming canónico uniforme de Leyes Físicas (F-1..F-6)

**Tipo:** Ley nueva (cambio cosmético de nomenclatura, sin cambio normativo)
**Ley/Anti-patrón afectado:** Leyes F-1..F-6 (renombradas desde "Ley 1..Ley 6"), Ley F-4 (Isomorfismo), Ley F-5 (Adaptadores Universales)
**Contexto:** Durante la Fase 1 del Sprint INL-ZepBrain (diseño de ontología para el cerebro Zep del framework), se detectó que el regex de resolución cross-graph `(C|A|G|R|AP|Dia)-\d+` no matchea las 6 Leyes Físicas — estaban nombradas sin prefijo (`Ley 1..Ley 6`) mientras Operativas (`O-1..O-4`), R-Específicas (`R-1..R-5`), Patrones (`C-1`, `A-2`, `G-1`), Anti-Patrones (`AP-2`) y Fases (`Dia-3`) sí tenían prefijo. Asimetría heredada del draft inicial — nunca se formalizó convención uniforme.

**Opciones evaluadas:**
- **(α) Prefijo letra uniforme** `F-1..F-6` para físicas → **elegida**.
  - Pro: regex unificada `(F|O|R|C|A|G|AP|Dia)-\d+` cubre todos los códigos del framework.
  - Pro: simetría total con Operativas y R-Específicas (Ley F-5 Adaptadores — una sola convención en lugar de dos).
  - Contra: cambio cosmético que propaga 35 referencias en 11 archivos del repo.
- (β) Dejar físicas sin prefijo + discriminador por `categoria` en metadata Zep → descartada: rompe regex cross-graph (imposible distinguir `"1"` de otras entidades no-Ley); colisión potencial entre nodos físicos y operativos con mismo número.
- (γ) Path-style `ley/fisica/1`, `ley/operativa/2` → descartada: verboso; requiere que cualquier prosa del repo cite leyes con path completo; complica regex.

**Decisión:** (α). Las 6 Leyes Físicas pasan de `Ley 1..Ley 6` a `Ley F-1..Ley F-6`. Contenido normativo de cada ley queda **idéntico** — solo cambia la etiqueta de referencia.

**Razonamiento:**
1. **Ley F-5 Adaptadores Universales:** convención uniforme = un solo adaptador semántico para todos los códigos del framework. La asimetría previa requería dos reglas mentales distintas para citar leyes.
2. **Ley F-1 Anti-Hardcoding:** el regex asimétrico sería hardcoding estructural — una sola regex uniforme parametriza el dominio completo.
3. **Ley F-4 Isomorfismo Estructural:** el repo que define el framework debe ser el primero en cumplir su propia convención. Asimetría de naming era ad-hoc — exactamente lo que la ley prohíbe.
4. **Decisión Camino C del Sprint INL-ZepBrain** (spike V-RES 2026-04-20, ADR-001 Componente 8): la resolución cross-graph de menciones canonical en episodios de evidence depende de regex determinista. Sin uniformidad de naming, las Leyes Físicas serían invisibles al mecanismo.

**Consecuencia:**
- `CONSTITUCION.md`: 7 edits (6 encabezados + 1 cita en Mapa). **Ejecutado.**
- Referencias en otros archivos de gobierno (REGISTRO_TRAUMAS.md, SNAPSHOT_ESTADO.md, AGENTS.md, CLAUDE.md): ~11 edits. Requieren checkpoint HITL individual por cada archivo.
- Referencias en archivos canónicos (REGLAS_EDITORIALES.md, constitucion-agente-inl.md): ~7 edits.
- Referencias en harness (`.claude/commands/*.md`, `.claude/hooks/*.js`): ~9 edits.
- 3 borradores del Sprint INL-ZepBrain en `Nuevos archivos - no commit/` (ADR-001, metadata_schema, ingestion_policy): actualización de ejemplos JSON + regex documentada.
- Commit final debe hacerse vía PR (cláusula de inmutabilidad de CONSTITUCION.md § punto 3) — queda pendiente del Arquitecto.

---

## 2026-04-20 — Promoción del skill `nonlinear-engineering` (opción γ")

**Tipo:** Decisión fundada
**Ley/Anti-patrón afectado:** Ley F-1 (Anti-Hardcoding, violación consciente y registrada), Ley F-4 (Isomorfismo), Ley F-5 (Adaptadores Universales)
**Contexto:** La carpeta `nonlinear-engineering/` en raíz contenía SKILL.md + references/ pero NO estaba registrada como skill activa de Claude Code (vivía como carpeta suelta). Se buscó promoverla a skill activo preservando también su rol de contenido teórico del framework (es una implementación de referencia, no solo infra del harness).

**Opciones evaluadas:**
- (α) Symlink `.claude/skills/nonlinear-engineering` → `../../nonlinear-engineering/` → descartado: en Windows requiere Developer Mode o permisos elevados; frágil en clones.
- (β) Copia física en `.claude/skills/` dejando original en raíz → descartado: deja el contenido teórico en raíz suelto sin contexto del framework (viola Ley F-4 Isomorfismo — el contenido es una *implementación de referencia* y pertenece a `08-implementaciones-referencia/skills/`).
- (γ) Mover `nonlinear-engineering/` → `08-implementaciones-referencia/skills/nonlinear-engineering/` y crear stub en `.claude/skills/` → descartado por investigación empírica: Claude Code carga skills desde su directorio propio; refs externas no funcionan (patrón canónico verificado en `superpowers/using-superpowers`).
- (γ") **Elegido**: mover la fuente canónica a `08-implementaciones-referencia/skills/nonlinear-engineering/` + copiar el contenido a `.claude/skills/nonlinear-engineering/` para runtime + documentar el tradeoff de duplicación acá.

**Decisión:** opción γ" — duplicación consciente y registrada.

**Razonamiento:**
1. **Ley F-4 Isomorfismo** exige que el skill, siendo una implementación adoptable del framework, viva en `08-implementaciones-referencia/skills/` (donde ya vive `framework-self-check.md`).
2. **Limitación técnica de Claude Code** obliga a tener el SKILL.md + references/ dentro de `.claude/skills/<nombre>/` para activación. No hay mecanismo oficial de redirección.
3. **Ley F-1 Anti-Hardcoding** se viola conscientemente: hay 2 copias del skill. El tradeoff se prefiere a las alternativas (symlink frágil, stub que no funciona, ocultar el contenido teórico bajo `.claude/`).
4. Esta duplicación es **estructuralmente distinta** de la de `GEMINI.md` (tradeoff de compatibilidad entre runtimes) — acá es duplicación por carencia del runtime de Claude Code, no por diseño.

**Consecuencia:**
- Fuente canónica: `08-implementaciones-referencia/skills/nonlinear-engineering/` (lectura humana, estudio del framework).
- Copia runtime: `.claude/skills/nonlinear-engineering/` (activación por Claude Code).
- Referencias actualizadas en: `CONSTITUCION.md § Mapa`, `CLAUDE.md §3` y `§8`.
- **Protocolo de sincronización:** si se modifica la fuente canónica, copiar manualmente al runtime. `/audit-coherencia-docs` podría agregar una 5ª auditoría futura que detecte divergencia entre ambas copias (deuda diferida).
- Considerar futuro `Ley R-6 Duplicación Justificada por Runtime` en `CONSTITUCION.md` si aparecen más casos de este tipo. No crear la ley hoy (Anti-Patrón 1: ley nueva sin ≥3 casos empíricos).

---

## 2026-04-20 — Evaluación de deuda: archivos del Exocórtex prescritos por skill INL

**Tipo:** Decisión fundada
**Ley/Anti-patrón afectado:** Ley R-1 (Docs-Only), Ley R-5 (Idempotencia), Anti-Patrón 1 (Feature creep)
**Contexto:** El skill `nonlinear-engineering/SKILL.md` (patrón C-3 Exocórtex) prescribe 5 archivos: `CONSTITUCION.md`, `REGLAS_NEGOCIO.md`, `SNAPSHOT_ESTADO.md`, `REGISTRO_TRAUMAS.md`, `INDICE_MAESTRO.md`. Este repo tenía 3 al inicio de la sesión, 4 tras Fase 0. Quedaban pendientes `REGLAS_NEGOCIO.md` e `INDICE_MAESTRO.md` como deuda reconocida. Se evaluó si aplicaban al dominio específico de este repo (docs-only, meta-documentación del framework).

**Opciones evaluadas para `REGLAS_NEGOCIO.md`:**
- (a) Crear el archivo literal → descartado: no hay dominio de negocio (APIs, DB, servicios externos). Anti-Patrón 1 feature creep.
- (b) Crear variante `REGLAS_EDITORIALES.md` → **elegido**: el dominio de negocio de un repo de docs son las reglas de composición (templates, criterios de aceptación, convenciones). Formaliza conocimiento implícito — evita violación Ley F-1 (hardcoding semántico).
- (c) Declarar N/A y no crear nada → descartado: pierde oportunidad de formalizar convenciones que hoy viven en la cabeza del Arquitecto.

**Opciones evaluadas para `INDICE_MAESTRO.md`:**
- (a) Crear el archivo → descartado: `CONSTITUCION.md § Mapa Canónico del Exocórtex` ya cumple esa función, y `AGENTS.md §4` duplica el mapa como conveniencia. Crear un tercer archivo con la misma tabla viola Ley R-5 Idempotencia Documental directamente.
- (b) Declarar N/A con razonamiento → **elegido**: el rol de "enrutador" lo cumple el mapa canónico en `CONSTITUCION.md`. Crear otro archivo sería duplicación.

**Decisión:**
1. Crear `REGLAS_EDITORIALES.md` con 10 secciones (templates, criterios, convenciones, estilo, refs).
2. NO crear `INDICE_MAESTRO.md`. Razón formalizada acá.

**Razonamiento:** Ley R-1 (Docs-Only) impone que toda prescripción genérica del skill se adapte al dominio específico. El skill INL se escribió para proyectos en construcción; este repo es el meta-repo del framework. Adaptar, no copiar — aplica el propio framework al framework.

**Consecuencia:**
- Se agregó `REGLAS_EDITORIALES.md` al árbol canónico (raíz).
- `CONSTITUCION.md § Mapa Canónico` debe actualizarse para incluir `REGLAS_EDITORIALES.md`.
- `INDICE_MAESTRO.md` queda formalmente descartado. Cualquier agente futuro que pregunte por él encuentra esta entrada.
- Pendiente: actualizar `SNAPSHOT_ESTADO.md` para quitar esa deuda.

---

## 2026-04-20 — Dogfooding del framework en el meta-repo

**Tipo:** Decisión fundada
**Ley/Anti-patrón afectado:** Todas las leyes R-1 a R-5 (creadas como consecuencia)
**Contexto:** Se detectó que este repo contiene la skill `nonlinear-engineering/` que exige un Handshake V5 (LEYES/HISTORIA/ESTADO) sobre los proyectos que la invocan. Pero el propio meta-repo no tenía esos 3 documentos. Surgió la pregunta: ¿debe el meta-repo cumplir el framework que documenta?

**Opciones evaluadas:**
- **(a) Dogfooding:** el repo crea `CONSTITUCION.md` / `REGISTRO_TRAUMAS.md` / `SNAPSHOT_ESTADO.md` y opera bajo el mismo Handshake que impone.
  - Pro: consistencia total, el repo *es* lo que predica.
  - Pro: sirve como ejemplo canónico para otros proyectos.
  - Contra: overhead de mantenimiento.
- **(b) Exención:** el repo es meta-documentación, está exento del protocolo.
  - Pro: menos burocracia.
  - Contra: viola Ley F-4 Isomorfismo — el repo que define el framework no puede ser la excepción del framework.

**Decisión:** (a) Dogfooding.

**Razonamiento:** La Ley F-4 Isomorfismo Estructural es explícita: "Absolutamente nada se nombra ad-hoc". Exentar este repo sería la primera excepción ad-hoc del ecosistema. Además, la Ley O-4 Rigor Constitucional obliga a hacer cumplir las leyes como físicas — no se puede hacer cumplir lo que no se practica.

**Consecuencia:**
- Se crean `CONSTITUCION.md`, `REGISTRO_TRAUMAS.md` (este archivo), `SNAPSHOT_ESTADO.md`.
- Se declara este repo "Fuera del ciclo PEAP-V5" — no tiene ciclo de 144/360h porque es meta-documentación viva, no un sistema productivo.
- Se planifica Fase 1 (AGENTS.md + CLAUDE.md delgado) y Fase 2 (.claude/settings.json + hooks del Handshake).

---

<!-- Plantilla lista para próximas entradas. Eliminar el comentario cuando se agregue una nueva entrada arriba. Se insertan ARRIBA (orden reverso cronológico).

## YYYY-MM-DD — Título

**Tipo:**
**Ley/Anti-patrón afectado:**
**Contexto:**
**Opciones evaluadas:**
**Decisión:**
**Razonamiento:**
**Consecuencia:**

-->
