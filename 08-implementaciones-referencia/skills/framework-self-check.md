---
description: |
  Meta-skill invocable POR EL AGENTE (no por el humano) antes de presentar cualquier
  propuesta arquitectónica al operador. Aplica las preguntas del framework Ingeniería
  No Lineal a la propuesta del propio agente, produciendo Plan v1 (pragmático) +
  Plan v2 (no-lineal) + recomendación.

argument-hint: "<descripción-breve-de-la-propuesta>"
allowed-tools: Read, Grep
---

# /framework-self-check — Meta-validación del agente

> **Plantilla adaptable.** Copiar a `~/.claude/commands/framework-self-check.md`
> (o ubicación equivalente del agente) y ajustar las 5 preguntas al framework
> específico del proyecto.

---

## Precondiciones de adopción

Esta skill NO aplica a todo proyecto. Verificar antes de adoptar:

- [ ] Existe un framework arquitectónico documentado (Constitución Técnica + ≥3 ADRs)
- [ ] El agente IA tiene acceso a instrucciones globales persistentes (equivalente a `CLAUDE.md`)
- [ ] Hay evidencia empírica de ratio <50% de auto-aplicación del framework (registrar ≥2 casos de intervención humana forzada)
- [ ] El agente opera en dominio conversacional-estratégico (no puramente táctico)

Si las cuatro condiciones se cumplen, la skill es aplicable. Para mayor detalle, ver [`03-patrones/c3-bidireccional-y-meta-validacion.md`](../../03-patrones/c3-bidireccional-y-meta-validacion.md).

---

## Cuándo invocar (triggers obligatorios)

El agente debe invocar esta skill antes de:

1. Crear o modificar un ADR del proyecto
2. Crear o modificar un skill reutilizable (`.claude/commands/*.md`)
3. Agregar función a biblioteca compartida (`lib/` o equivalente)
4. Proponer decisión arquitectónica en respuesta conversacional:
   - "recomiendo opción X", "propongo Y", "el fix es Z", "mi propuesta es..."
   - Listados "Opción A / B / C" estructurales
   - "vamos a agregar...", "vamos a refactorizar..."
5. Proponer fix paramétrico sobre infraestructura del sistema

### NO invocar cuando

- Cambios triviales (rename, typo fix, formato)
- Resolución de issues del backlog (eso usa su propia skill operativa)
- Respuestas conversacionales no arquitectónicas (explicar, resumir, analizar)

---

## Los 5 pasos obligatorios

### Paso 0 — Identificar la propuesta en 1 línea

Si no podés formular la propuesta en 1 línea, es demasiado vaga o múltiple. Primero formulá, después evaluá.

### Paso 1 — Aplicar las preguntas del framework

Aplicar las 5 preguntas del framework específico del proyecto. La plantilla base del framework Ingeniería No Lineal propone estas 5 — **adaptar a los patrones del framework propio si difieren**:

**Pregunta 1 (A-1) — ¿Esta propuesta se replicará en N casos futuros similares?**

Señales SÍ:
- Plan usa cadenas IF/switch sobre valores específicos
- Hay hermanos en backlog con misma estructura
- Lógica "para cada X hacer Y"

Si SÍ → reformular como tabla declarativa / biblioteca compartida.

**Pregunta 2 (V-EXT) — ¿Toca API externa cuya spec no verifiqué oficialmente?**

Señales SÍ:
- Diseñás payload para servicio externo sin leer docs
- Asumís formato de endpoint

Si SÍ → validar spec oficial ANTES de presentar.

**Pregunta 3 (Manifiesto Muerte al Hardcoding) — ¿Introduce hardcoding?**

Señales SÍ:
- URLs/tokens/IDs hardcodeados
- Valores constantes que pueden cambiar

Si SÍ → externalizar a configuración.

**Pregunta 4 (V-INT) — ¿Asumo arquitectura que existe sin verificar?**

Señales SÍ:
- Menciono primitivas runtime sin inspeccionar código
- Dependo de componentes cuya existencia no verifiqué

Si SÍ → explorar código ANTES de proponer.

**Pregunta 5 (V-RES) — ¿Depende de IDs/recursos externos?**

Señales SÍ:
- Hardcodeo workflow ID / credential ID / endpoint
- Asumo que tabla/columna existe con nombre específico
- Extraigo IDs de snapshots locales

Si SÍ → validar contra fuente live antes de hardcodear.

### Paso 2 — Diagnóstico

- **5 × NO** → proceder a presentar directamente al operador, reportando *"framework-self-check: 5 × NO, propuesta pragmática aprobada"*
- **1+ SÍ** → formular Plan v1 + Plan v2 + recomendación antes de presentar

### Paso 3 — Formular Plan v1 y Plan v2

**Plan v1 (pragmático):** la propuesta original que habrías formulado sin self-check. Declarar explícitamente por qué es lineal.

**Plan v2 (no-lineal):** reformulación aplicando el patrón que correspondió.

**Recomendación:** cuál de los dos y por qué, honesto sobre trade-offs.

### Paso 4 — Presentar al operador (formato estándar)

```markdown
🔬 Framework self-check activado — [propuesta en 1 línea]

Preguntas del framework aplicadas a mi propuesta:
- A-1 (replicable): [SÍ/NO] — [razón breve]
- V-EXT (API externa): [SÍ/NO] — [razón breve]
- Hardcoding: [SÍ/NO] — [razón breve]
- V-INT (arquitectura asumida): [SÍ/NO] — [razón breve]
- V-RES (recursos externos): [SÍ/NO] — [razón breve]

Plan v1 (pragmático):
[propuesta original]

Plan v2 (no-lineal):
[propuesta reformulada aplicando el patrón X]

Trade-off:
- v1: [pro] / [contra]
- v2: [pro] / [contra]

Mi recomendación: Plan v[X] porque [razón estructural desde framework].

¿Qué preferís?
```

### Paso 5 — Registrar para métrica empírica

Al cerrar la conversación o en un punto de chequeo natural:

- Si fue auto-invocado sin petición explícita del humano → registrar como **hit**
- Si el humano tuvo que pedir re-evaluación antes de invocarla → registrar como **miss**

Ver template de memoria en [`../memory-templates/feedback-tracking-template.md`](../memory-templates/feedback-tracking-template.md).

---

## Reglas estrictas

1. **NUNCA saltar la skill cuando aplica un trigger.** Es disciplina estructural.
2. **NUNCA transformar en formalidad vacía.** Si todas las 5 preguntas responden NO mecánicamente sin análisis real, el patrón está muerto.
3. **NUNCA aplicar a decisiones triviales.** Desperdicia tokens y desprestigia la skill.
4. **NUNCA ocultar el resultado al operador.** Incluso con 5 × NO, reportar para trazabilidad.
5. **NUNCA usar como post-justificación.** El orden es: self-check → formular propuesta. Invertido es teatro.

---

## Cómo adaptar esta plantilla a tu proyecto

### Paso 1 — Identificar los patrones de tu framework

Si tu proyecto usa los 7 patrones canónicos del framework Ingeniería No Lineal, las 5 preguntas de arriba funcionan tal cual.

Si tu proyecto tiene framework propio (DDD + Event Sourcing, Clean Architecture, etc.), adaptar las 5 preguntas a los patrones de tu framework:

- ¿La propuesta respeta bounded contexts? (DDD)
- ¿Preserva la inmutabilidad del event log? (Event Sourcing)
- ¿Mantiene la inversión de dependencias? (Clean Architecture)

### Paso 2 — Ajustar los triggers a tu ecosistema

Los triggers de invocación dependen de cómo está estructurado tu proyecto:

- Si no usás ADRs, remové ese trigger
- Si tu biblioteca compartida vive en otra ruta, ajustar
- Si tu frontend tiene un vocabulario específico ("propongo X"), usar ese vocabulario

### Paso 3 — Instalar la regla en tu CLAUDE.md

Ver plantilla en [`../claude-md-template/CLAUDE-md-user-level-template.md`](../claude-md-template/CLAUDE-md-user-level-template.md).

### Paso 4 — Configurar memoria de tracking

Ver template en [`../memory-templates/feedback-tracking-template.md`](../memory-templates/feedback-tracking-template.md).

Sin tracking, no hay iteración. La métrica empírica es el tercer componente obligatorio del patrón C-3 Bidireccional.

---

## Diferencia con skills operativas

Esta skill es **meta** — invocada por el agente sobre sí mismo. Las skills operativas (tipo `/resolve-issue`, `/new-report`) son invocadas por el humano para resolver problemas del backlog.

Ambos tipos pueden coexistir en el mismo proyecto. La clave es no confundir dominios:

- Un fix de issue del backlog → `/resolve-issue` (skill operativa)
- Una propuesta arquitectónica conversacional → `/framework-self-check` (skill meta)

---

## Referencias cruzadas

- Patrón teórico: [`03-patrones/c3-bidireccional-y-meta-validacion.md`](../../03-patrones/c3-bidireccional-y-meta-validacion.md)
- Validación empírica: [`05-evidencia/validacion-meta-framework.md`](../../05-evidencia/validacion-meta-framework.md)
- Regla en instrucciones globales: [`../claude-md-template/CLAUDE-md-user-level-template.md`](../claude-md-template/CLAUDE-md-user-level-template.md)
- Memoria de tracking: [`../memory-templates/feedback-tracking-template.md`](../memory-templates/feedback-tracking-template.md)
