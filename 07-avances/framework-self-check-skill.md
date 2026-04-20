# Skill Ejecutable: Framework Self-Check

> *"Los LLMs no tenemos introspección confiable. Pero sí podemos seguir checklists si están externalizados al flujo observable."*

---

## Contexto

Este documento presenta la **implementación ejecutable de referencia** del patrón [C-3 Bidireccional y Meta-Validación del Agente](../03-patrones/c3-bidireccional-y-meta-validacion.md), validado empíricamente en el [caso documentado](../05-evidencia/validacion-meta-framework.md).

La skill aquí descrita es un **meta-skill invocable por el propio agente IA** antes de presentar propuestas arquitectónicas a su Arquitecto humano. No es invocada por el humano — es autonomía disciplinada del agente.

---

## Diferencia con skills operativas

En un proyecto maduro bajo Ingeniería No Lineal típicamente existen dos tipos de skills:

**Skills operativas** — invocadas por el humano para resolver problemas del backlog:
- `/resolve-issue <N>` — resolver issue del backlog
- `/new-report` — generar reporte técnico estandarizado
- `/publish-report` — publicar reporte via PR

**Skills meta** — invocadas por el agente sobre sí mismo:
- `/framework-self-check` — auto-validación de propuesta arquitectónica

La diferencia estructural es **quién dispara la invocación**. En skills operativas el humano decide. En skills meta, el agente decide (obligado por triggers explícitos en sus instrucciones globales).

---

## Estructura de la skill

### Metadata de la skill

```yaml
---
description: |
  Meta-skill invocable POR EL AGENTE (no por el humano) antes de presentar
  cualquier propuesta arquitectónica al operador. Aplica las 5 preguntas del
  framework a la propuesta del propio agente, produciendo Plan v1 (pragmático)
  + Plan v2 (no-lineal) + recomendación.

argument-hint: "<descripción-breve-de-la-propuesta>"
allowed-tools: Read, Grep
---
```

Nótese: las únicas herramientas permitidas son **lectura** (`Read`, `Grep`). La skill no modifica nada — es puramente evaluativa.

### Los 5 pasos obligatorios

**Paso 0 — Identificar la propuesta en 1 línea**

Si el agente no puede formular su propuesta arquitectónica en 1 línea, la propuesta es demasiado vaga o múltiple. Primero formular, después auto-evaluar.

**Paso 1 — Aplicar las 5 preguntas del framework**

Las preguntas son aplicación directa de los patrones del framework al ámbito de la propia propuesta del agente:

1. **A-1 (Adaptador Universal) — ¿Esta propuesta se replicará en N casos futuros similares?**
   - Señales SÍ: cadenas IF/switch sobre valores discretos, hermanos en backlog con estructura similar, lógica "para cada X hacer Y"
   - Si SÍ → reformular como tabla declarativa / biblioteca compartida / config externa

2. **V-EXT (Validación de APIs externas) — ¿Toca API externa cuya spec no verificé oficialmente?**
   - Señales SÍ: diseño de payload para servicio externo, asunción de formato de endpoint sin leer docs oficiales
   - Si SÍ → validar spec oficial ANTES de presentar

3. **Manifiesto Muerte al Hardcoding — ¿Introduce hardcoding de valores, IDs o umbrales?**
   - Señales SÍ: URLs/tokens/IDs hardcodeados, timeouts constantes, lógica específica por caso
   - Si SÍ → externalizar a configuración

4. **V-INT (Validación de arquitectura interna) — ¿Asumo arquitectura que existe sin verificar?**
   - Señales SÍ: propuesta menciona primitivas runtime sin explorar el código, depende de componentes cuya existencia no verifiqué
   - Si SÍ → explorar el código ANTES de proponer

5. **V-RES (Validación de recursos externos) — ¿Depende de IDs/recursos cuya fuente de verdad es infraestructura live?**
   - Señales SÍ: hardcodea workflow ID / credential ID / endpoint / tabla, extrae IDs de snapshots locales
   - Si SÍ → validar contra fuente live antes de hardcodear

**Paso 2 — Diagnóstico y bifurcación**

- **Si las 5 respuestas son NO** → proceder a presentar la propuesta directamente, reportando "framework-self-check: 5 × NO, propuesta pragmática aprobada"
- **Si 1+ respuestas son SÍ** → formular Plan v1 + Plan v2 + recomendación antes de presentar

**Paso 3 — Formular Plan v1 y Plan v2**

- **Plan v1 (pragmático):** la propuesta original, la que habría formulado sin self-check. Declarar por qué es lineal.
- **Plan v2 (no-lineal):** reformulación aplicando el patrón que correspondió (el que respondió SÍ)
- **Recomendación:** cuál de los dos y por qué, honesto sobre trade-offs

**Paso 4 — Presentar al operador con formato estándar**

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

**Paso 5 — Registrar para métrica empírica**

Al finalizar, registrar en memoria de tracking:
- Hit si el self-check fue auto-invocado sin petición explícita del humano
- Miss si el humano tuvo que forzar la re-evaluación

---

## Triggers de invocación (obligatorios)

La skill debe invocarse **siempre** que el agente esté a punto de:

1. **Crear o modificar un ADR**
2. **Crear o modificar un skill o protocolo reutilizable**
3. **Agregar función a biblioteca compartida**
4. **Proponer decisión arquitectónica en respuesta conversacional** — frases-trigger:
   - "recomiendo opción X"
   - "propongo Y"
   - "el fix es Z"
   - "mi propuesta es..."
   - listados "Opción A / B / C" arquitectónicos
   - "vamos a agregar...", "vamos a refactorizar..."
5. **Proponer fix paramétrico o puntual sobre infraestructura del sistema**

### Cuándo NO invocar

- Cambios triviales (rename, typo fix, formato)
- Resolución de issues del backlog (eso usa su propio skill `/resolve-issue` con Paso 4.5)
- Respuestas conversacionales no arquitectónicas (explicar, resumir, analizar)
- Commits de docs puros sin decisión estructural

---

## Reglas estrictas del skill

1. **NUNCA saltar `/framework-self-check` cuando aplica un trigger.** Es disciplina estructural.
2. **NUNCA transformar el self-check en formalidad vacía.** Si todas las 5 preguntas responden NO mecánicamente sin análisis real, el patrón está muerto.
3. **NUNCA aplicar self-check a decisiones triviales.** Desperdicia tokens y desprestigia la skill.
4. **NUNCA ocultar el resultado al operador.** Incluso con 5 × NO, reportar para trazabilidad.
5. **NUNCA usar self-check como post-justificación.** El orden es: self-check → formular propuesta. Invertido es teatro.

---

## Anti-patrones observados en diseño de la skill

### Anti-patrón 1 — Confundir dominio con la skill operativa principal

La tentación es meter las 5 preguntas **dentro** de la skill operativa (ej. `/resolve-issue`). Esto las vuelve invisibles cuando el agente opera conversacionalmente fuera de esa skill.

**Solución:** skill separada, invocable autónomamente por el agente en cualquier momento que detecte un trigger conversacional arquitectónico.

### Anti-patrón 2 — Triggers demasiado amplios

Si cualquier pregunta del humano activa el self-check, el agente genera ruido y lentitud. Los triggers deben ser explícitos y acotados.

**Solución:** lista finita de triggers en las instrucciones globales del agente. Cuando duda, no invocar.

### Anti-patrón 3 — Triggers demasiado estrechos

Si los triggers son tan específicos que casi nunca se activan, el patrón no opera.

**Solución:** incluir frases conversacionales comunes ("recomiendo X", "propongo Y") además de triggers técnicos (crear ADR, crear skill).

### Anti-patrón 4 — Skill sin métrica

Sin tracking empírico de hit/miss, no hay forma de saber si el patrón funciona en la vida real. Sesiones sin registro son invisibles para la iteración.

**Solución:** memoria de tracking como tercer componente obligatorio del patrón C-3 Bidireccional.

---

## Adopción en otros proyectos

### Prerequisitos

Antes de adoptar esta skill en un proyecto, verificar:

- **Existe al menos un framework arquitectónico documentado** (constitución técnica + 3-5 ADRs)
- **El agente IA tiene acceso a instrucciones globales persistentes** (equivalente a `CLAUDE.md`, `.cursorrules`, system prompt)
- **Hay evidencia empírica de ratio <50% de auto-aplicación del framework** — registrar al menos 2 casos donde el humano forzó reconducción

Si las tres precondiciones se cumplen, el patrón es aplicable.

### Pasos de adopción

**Paso 1 — Registrar evidencia baseline**

Durante 3-5 sesiones intensivas, documentar todas las propuestas arquitectónicas y contar:
- Cuántas el agente auto-validó contra el framework
- Cuántas requirieron reconducción humana

Sin baseline, no hay forma de medir mejora.

**Paso 2 — Adaptar los 5 criterios al framework propio del proyecto**

Las 5 preguntas de este documento son los patrones del framework Ingeniería No Lineal. En un proyecto con framework propio, las preguntas deben reflejar los patrones de ese framework específico — no copiar ciegamente.

Ejemplos de adaptación:
- Proyecto con fuerte énfasis en Domain-Driven Design: pregunta equivalente sobre "¿respetás el bounded context?"
- Proyecto con Zero-Trust como pilar: pregunta sobre "¿hay validación de permisos en cada capa afectada?"
- Proyecto con Event Sourcing: pregunta sobre "¿la propuesta preserva la inmutabilidad del event log?"

**Paso 3 — Instalar los 3 componentes**

- Regla en `CLAUDE.md` user-level (o equivalente)
- Skill ejecutable como archivo en `~/.claude/commands/` (o equivalente en el agente usado)
- Memoria de tracking como archivo `.md` persistente

**Paso 4 — Evaluar en 2-4 semanas**

Medir ratio hit/miss. Iterar triggers si el ratio es <40%.

---

## Relación con el resto del framework

- **C-1 (Pre-Computación):** el self-check es pre-computación aplicada al propio agente antes de actuar arquitectónicamente
- **C-2 (CPU/GPU):** el self-check preserva roles — el agente procesa, el humano decide, pero el agente presenta Plan v1+v2+recomendación en lugar de solo v1
- **C-3 (Exocórtex):** el self-check es la manifestación bidireccional de C-3 — consulta al framework antes de actuar, no solo registra decisiones después
- **G-1 (Debugging de generadores):** el self-check es fix paramétrico del generador "agente propone lineal por default"
- **G-2 (Gobernanza desde Día 0):** el self-check es gobernanza institucional de la disciplina del propio agente

---

## Implementación de referencia disponible

Para ver el código completo del skill, el contenido de la regla `CLAUDE.md §11`, el template de la memoria de tracking, y el ADR que documenta la decisión arquitectónica, consultar el proyecto de referencia donde el patrón fue validado empíricamente.

Los archivos clave de referencia:

| Archivo | Propósito | Ubicación típica |
|---|---|---|
| `framework-self-check.md` | Skill ejecutable | `~/.claude/commands/` o equivalente |
| `CLAUDE.md` §11 | Regla textual persistente con triggers | User-level global |
| `feedback_meta_validacion_agente.md` | Memoria de tracking empírico | Memoria persistente del proyecto |
| `ADR-006.md` | Decisión arquitectónica documentada | `docs/ADRs/` del proyecto |

---

## Conclusión

Esta skill es la primera implementación ejecutable del patrón C-3 Bidireccional. Su valor no es técnico — es operacional: **convierte un framework de papel en infraestructura cognitiva viva**.

Un agente que aplica la skill consistentemente opera dentro del framework por diseño, no por memoria. Es la diferencia entre un paramédico con protocolos pegados en la pared (que los sigue automáticamente) y un cirujano que recuerda a veces aplicar buenas prácticas.

La elegancia del patrón está en su simplicidad: **antes de proponer arquitectura, consultar el framework propio**. No hay magia — hay disciplina externalizada.

---

*Para el patrón teórico formalizado, ver [`03-patrones/c3-bidireccional-y-meta-validacion.md`](../03-patrones/c3-bidireccional-y-meta-validacion.md).*
*Para la validación empírica del patrón, ver [`05-evidencia/validacion-meta-framework.md`](../05-evidencia/validacion-meta-framework.md).*
