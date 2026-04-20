# Template CLAUDE.md user-level para Ingeniería No Lineal

> **Plantilla adaptable.** Copiar secciones relevantes a `~/.claude/CLAUDE.md` (o equivalente del agente).
> Reemplazar todos los placeholders `{{...}}` con valores de tu proyecto antes de usar.

---

## Contexto de esta plantilla

El archivo `CLAUDE.md` (user-level global) es el mecanismo persistente por el cual Claude Code (u otros agentes con memoria instruccional) reciben contexto invariante entre sesiones. Este template contiene las secciones que un proyecto bajo Ingeniería No Lineal típicamente necesita:

- **Arquitectura del proyecto** — para que el agente opere con contexto de alto nivel sin re-explicación
- **Leyes inmutables** — las restricciones físicas que ningún agente puede violar
- **Meta-validación del agente** (§11) — disciplina recursiva para propuestas arquitectónicas
- **Flujo de trabajo** — convenciones operativas

Las secciones se pueden adoptar selectivamente. La §11 es la **sección clave** para habilitar el patrón C-3 Bidireccional.

---

## Plantilla completa

```markdown
# {{PROYECTO_NOMBRE}} — Constitución Operativa del Agente IA

Eres un desarrollador experto en {{STACK_PRINCIPAL}}, especializado en {{DOMINIO_DEL_PROYECTO}}. Tu objetivo es seguir estrictamente la Constitución Técnica establecida en `{{CONSTITUTION_PATH}}` y aplicar los patrones del framework Ingeniería No Lineal.

## 🏗️ 1. Arquitectura del Proyecto

{{DESCRIPCIÓN DEL LAYERING / DOMAIN MODEL / COMPONENTES PRINCIPALES}}

Ejemplo para un proyecto multi-capa:
- **Capa 0 (Infraestructura):** componentes sin triggers, invocados por otros
- **Capa 1 (Monitoreo):** bots programados que observan y alimentan datos
- **Capa 2 (Transaccional):** motores que procesan operaciones críticas
- **Capa 3 (Utilities):** servicios auxiliares de onboarding, mantenimiento

## 🔐 2. Seguridad y Multi-tenencia (si aplica)

{{REGLAS DE AISLAMIENTO, CDD, RLS}}

Ejemplo:
- Todas las queries filtran por `{{TENANT_FIELD}}`
- RLS obligatorio en todas las tablas del esquema público
- Secretos gestionados vía {{SECRET_MANAGEMENT}} — nunca hardcodeados
- Credenciales encriptadas con {{ENCRYPTION_MECHANISM}}

## 📚 3. Documentación Canónica

Antes de proponer cambios estructurales, consultar obligatoriamente:
- [{{INDEX_MAESTRO_PATH}}]({{INDEX_MAESTRO_PATH}})
- [{{CONSTITUTION_PATH}}]({{CONSTITUTION_PATH}})
- Patrones activos en [{{PATTERNS_PATH}}]({{PATTERNS_PATH}})

## 🤖 4. Estándares Técnicos

{{VERSIONES DE NODOS / DEPENDENCIAS CRÍTICAS / CONVENCIONES}}

## 🐙 5. Gobernanza y Flujo de Trabajo (GitHub)

- **Branch Protection:** prohibido `git push` directo a `main`. Usa ramas aisladas y Pull Requests.
- **Ramas y Tareas:** sigue la convención `{{BRANCH_CONVENTION}}`. Ejemplo: `sprint-[X]/TAREA-[ID]-descripcion`.
- **Commits:** usa Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).
- **Kanban (si aplica):** antes de un PR, actualizá tu progreso en `{{KANBAN_PATH}}`.

## 🧠 6. Framework Ingeniería No Lineal

Este proyecto opera bajo los patrones canónicos del framework. Consultar antes de proponer cambios:

- **C-1 Pre-Computación del Dominio** — no codificar sin comprimir el dominio primero
- **C-2 CPU/GPU** — humano decide intención, IA ejecuta volumen
- **C-3 Exocórtex Documental** — persistir decisiones inmediatamente
- **A-1 Adaptador Universal** — encapsular servicios externos en un único componente
- **A-2 CDD** — seguridad en la capa física
- **A-3 Event-Driven** — desacoplar Intención de Resultado
- **A-4 Trauma Empaquetado** — el fallo nunca es terminal
- **G-1 Debugging de Generadores** — 3+ instancias del mismo error → corregir el generador
- **G-2 Gobernanza Día 0** — institucionalización prematura

Detalle completo en [{{PATTERNS_PATH}}]({{PATTERNS_PATH}}).

---

## 🔬 11. Meta-Validación del Agente (C-3 Bidireccional — obligatorio)

**Esta es la sección clave del template.** Activa el patrón de auto-consulta del framework antes de propuestas arquitectónicas.

Antes de presentar al operador cualquiera de:

- **Crear o modificar un ADR** (`{{ADRS_PATH}}/*.md`)
- **Crear o modificar un skill** (`.claude/commands/*.md` o equivalente)
- **Agregar función a biblioteca compartida** (`{{SHARED_LIB_PATH}}/*.js` o equivalente)
- **Proponer decisión arquitectónica en respuesta conversacional** — frases-trigger:
  - *"recomiendo opción X"*, *"propongo Y"*, *"el fix es Z"*, *"mi propuesta es..."*
  - Listados tipo *"Opción A / B / C"* estructurales
  - *"vamos a agregar..."*, *"vamos a refactorizar..."*
- **Proponer fix paramétrico o puntual sobre infraestructura del sistema**

**DEBO invocar `/framework-self-check`** para validar MI propia propuesta contra el framework Ingeniería No Lineal ANTES de escribir la respuesta al operador.

El skill aplica las preguntas del framework a mi propuesta arquitectónica, produciendo:

- Plan v1 (lineal/pragmático)
- Plan v2 (no-lineal/paramétrico) — si alguna pregunta respondió SÍ
- Recomendación explícita con justificación desde framework

**Ref canónica:** `{{FRAMEWORK_REPO}}/08-implementaciones-referencia/skills/framework-self-check.md`

**Racionalidad:** esta regla implementa C-3 Exocórtex aplicado recursivamente al agente. Reduce la dependencia de intervención humana para detectar anti-patrones ("codificar la esperanza" + "proponer lineal por default"). El humano sigue decidiendo arquitectura (C-2), pero recibe ya Plan v1 + Plan v2 + recomendación — no tiene que detectar el anti-patrón manualmente.

**NO aplicar a:** cambios triviales (rename/typo/formato), resolución de issues del backlog (usa su propio skill), respuestas conversacionales no arquitectónicas.

---

**Idioma:** {{IDIOMA_INSTRUCCIONES}} para instrucciones, {{IDIOMA_CÓDIGO}} para código.
**Idempotencia:** siempre verificar si el recurso ya existe antes de crearlo.
```

---

## Cómo adaptar esta plantilla

### Paso 1 — Reemplazar placeholders

Identificar y reemplazar todos los `{{...}}`:

| Placeholder | Ejemplo de reemplazo |
|---|---|
| `{{PROYECTO_NOMBRE}}` | "SaaS Fiscal XYZ" |
| `{{STACK_PRINCIPAL}}` | "Next.js + Supabase + n8n" |
| `{{DOMINIO_DEL_PROYECTO}}` | "automatización contable para pymes" |
| `{{CONSTITUTION_PATH}}` | `docs/CONSTITUCION_TECNICA.md` |
| `{{INDEX_MAESTRO_PATH}}` | `docs/INDICE_MAESTRO.md` |
| `{{PATTERNS_PATH}}` | `docs/patrones/` |
| `{{ADRS_PATH}}` | `docs/ADRs/` |
| `{{SHARED_LIB_PATH}}` | `_scripts/lib/` |
| `{{TENANT_FIELD}}` | `tenant_id` o `organization_id` |
| `{{BRANCH_CONVENTION}}` | Tu convención específica |
| `{{KANBAN_PATH}}` | Ruta a tu kanban o `N/A` |
| `{{FRAMEWORK_REPO}}` | URL del repo Ingeniería No Lineal si es público, o path local |
| `{{IDIOMA_INSTRUCCIONES}}` | "Español" o "English" |
| `{{IDIOMA_CÓDIGO}}` | "English" (estándar de la industria) |

### Paso 2 — Remover secciones no aplicables

Si tu proyecto no tiene multi-tenencia, remover §2. Si no usa GitHub, ajustar §5. Mantener las secciones que apliquen realmente — no dejar placeholders vacíos.

### Paso 3 — Ajustar §11 al framework específico

Si tu proyecto tiene framework propio (no los 7 patrones canónicos del INL), adaptar:

- Lista de triggers de invocación del self-check
- Referencia a la ubicación de tu skill adaptada
- Ejemplos de frases arquitectónicas típicas en tu vocabulario

### Paso 4 — Ubicar el archivo

- **User-level global:** `~/.claude/CLAUDE.md` (Windows: `C:\Users\<usuario>\.claude\CLAUDE.md`)
- **Project-level:** `<repo>/CLAUDE.md` (se combina con el user-level)

Para Ingeniería No Lineal, ambos niveles son útiles:
- User-level: §11 Meta-validación + patrones generales del framework
- Project-level: §1-5 específicos del proyecto (arquitectura, seguridad, convenciones)

---

## Precondiciones de adopción

Antes de copiar este template, verificá:

- [ ] Tu proyecto tiene Constitución Técnica o equivalente (al menos un documento de reglas arquitectónicas inmutables)
- [ ] Usás agente IA con memoria persistente vía archivo de instrucciones (Claude Code, Cursor, similares)
- [ ] Tenés ≥3 ADRs o documentos de decisión arquitectónica (sin esto, §11 no tiene qué consultar)
- [ ] Querés adoptar el patrón C-3 Bidireccional (no es obligatorio — solo si observás el anti-patrón empíricamente)

Si las cuatro se cumplen, el template es útil tal cual. Si alguna falla, primero construí el pre-requisito antes de adoptar la sección correspondiente.

---

## Ejemplo de §11 ya adaptado (referencia)

Un proyecto real aplicando esta plantilla tiene §11 adaptado así:

```markdown
## 🔬 11. Meta-Validación del Agente (ADR-006 — obligatorio)

Antes de presentar al operador cualquiera de:

- Crear o modificar un ADR (`docs/15_Estandares_Documentacion/ADRs/*.md`)
- Crear o modificar un skill (`.claude/commands/*.md`)
- Agregar función a biblioteca compartida (`_scripts_v5_cibernetica/lib/*.js`)
- Proponer decisión arquitectónica en respuesta conversacional
- Proponer fix paramétrico sobre infraestructura

DEBO invocar `/framework-self-check` para validar MI propia propuesta contra el
framework Ingeniería No Lineal ANTES de escribir la respuesta al operador.

[...]
```

Nótese cómo los paths genéricos del template (`{{ADRS_PATH}}`) se convierten en paths específicos del proyecto al adoptar. Los placeholders existen para forzar adaptación consciente.

---

## Relación con otros componentes

- Esta plantilla es la **regla textual persistente** del patrón C-3 Bidireccional
- La **skill ejecutable** es [`../skills/framework-self-check.md`](../skills/framework-self-check.md)
- La **métrica empírica** vive en [`../memory-templates/feedback-tracking-template.md`](../memory-templates/feedback-tracking-template.md)

Los tres componentes son complementarios. Adoptar solo uno produce resultados marginales. Los tres juntos implementan completamente el patrón.

---

*Para el patrón teórico, ver [`03-patrones/c3-bidireccional-y-meta-validacion.md`](../../03-patrones/c3-bidireccional-y-meta-validacion.md).*
