# Validación empírica del Meta-Framework (C-3 Bidireccional)

> *"La teoría que no se prueba a sí misma en la práctica es indistinguible del mito. El framework validó su propia capacidad de auto-aplicarse en menos de una sesión."*

---

## Contexto del caso

Aplicación del framework Ingeniería No Lineal en un proyecto real de dominio regulatorio complejo con las siguientes características:

- Arquitecto solitario + agente IA asistente (Claude Opus 4.7)
- Proyecto en estado maduro: constitución técnica documentada, ~5 ADRs previos al experimento, framework operativo
- Sesión intensiva de desarrollo con ~28 Pull Requests mergeados en ~9h efectivas
- Agente IA con acceso a memoria persistente (equivalente a CLAUDE.md user-level + ADRs + skills versionadas)

El caso documenta la **primera aplicación recursiva del framework al propio agente IA** y su validación empírica inmediata dentro de la misma sesión.

---

## Antes: el anti-patrón detectado

Durante las primeras horas de la sesión, el Arquitecto detectó un patrón sistémico en el comportamiento del agente:

```
[patrón observado]
Humano plantea problema
    ↓
Agente propone Plan v1 (solución lineal pragmática)
    ↓
Humano detecta violación del framework
    ↓
Humano invoca: "re-evaluá aplicando ingeniería no lineal"
    ↓
Agente propone Plan v2 (solución paramétrica alineada al framework)
    ↓
Plan v2 adoptado
```

### Casos empíricos documentados (baseline)

**Caso A — Resolución de error HTTP en adaptador externo**

- Plan v1 propuesto: bloque `if statusCode === X` hardcodeado en el adaptador
- Reconducción del humano: "aplicá Patrón A-1"
- Plan v2 adoptado: tabla declarativa `ERROR_MAP` extensible con una sola línea para futuros errores del mismo tipo

**Caso B — Enriquecimiento de agente auxiliar con guardrails validados**

- Plan v1 propuesto: "Port selectivo" — copiar lógica puntual del agente principal al auxiliar
- Reconducción del humano: "re-evaluá desde el framework"
- Plan v2 adoptado: biblioteca compartida (`lib/guardrails_shared.js`) consumida por N agentes — G-1/A-1/G-2 paramétrico

### Ratio baseline

| Métrica | Valor |
|---|---|
| Propuestas arquitectónicas observadas | 2 |
| Auto-invocación del framework por el agente | **0** |
| Ratio hit | **0%** |
| Dependencia de intervención humana | **100%** |

El framework estaba documentado, era accesible al agente, y los patrones eran relevantes a ambos casos. El gap no era de conocimiento — era de **consulta activa antes de proponer**.

---

## El fix: ADR-006 + Skill `/framework-self-check` + CLAUDE.md §11

Implementación del patrón C-3 Bidireccional con tres componentes coordinados:

1. **Regla textual persistente** en instrucciones globales del agente (`~/.claude/CLAUDE.md` sección 11) — triggers explícitos que obligan al agente a invocar auto-validación antes de propuestas arquitectónicas
2. **Skill ejecutable `/framework-self-check`** — checklist de las 5 preguntas del framework aplicadas a la propia propuesta del agente, con output obligatorio Plan v1 + Plan v2 + recomendación
3. **Memoria de tracking `feedback_meta_validacion_agente.md`** — registro de cada propuesta arquitectónica con marca hit (auto-invocado) o miss (forzado por humano)

Documentación arquitectónica: ADR-006 "Meta-validación del agente mediante auto-framework-check".

**Tiempo de implementación:** ~45 minutos (un PR).

---

## Después: validación empírica inmediata

Dentro de la misma sesión, tres propuestas arquitectónicas consecutivas del Arquitecto al agente. Todas con triggers explícitos según la regla de CLAUDE.md §11.

### HIT 1 — "¿Actualizamos el agente auxiliar con los nuevos aprendizajes?"

- Trigger detectado: pregunta sobre cambio arquitectónico a otro agente del sistema
- Auto-invocación del self-check: ✅ **SÍ** — sin que el humano lo pidiera
- Resultado del self-check:
  - Pregunta 4 (V-INT arquitectura asumida): **SÍ** — estaba asumiendo que el agente auxiliar tenía el mismo problema, sin evidencia empírica
  - Conclusión honesta: **no implementar** — se requieren ≥2 casos empíricos antes de escalar el patrón
- Output al humano: Plan v1 (replicar meta-validación) vs. Plan v2 (esperar evidencia), con recomendación de Plan v2
- El humano no tuvo que corregir

### HIT 2 — "¿Dotamos al agente auxiliar de herramientas del framework?"

- Trigger detectado: propuesta de enriquecer prompts del sub-agente
- Auto-invocación del self-check: ✅ **SÍ**
- Resultado: 5 opciones evaluadas (A a E), identificación de Opción E como la mejor conceptualmente, recomendación honesta de no implementar sin evidencia empírica, definición de trigger de re-evaluación (≥2 casos empíricos futuros)
- El humano no tuvo que corregir

### HIT 3 — "El agente auxiliar maneja solo errores típicos de catálogo"

- Trigger adicional aportado por el humano: contexto sobre scope del sub-agente
- Auto-invocación del self-check: ✅ **SÍ** — con reframe de conclusión previa
- Resultado: detección de que el nuevo contexto cambia la conclusión — no es *"esperar evidencia"* sino *"fuera de scope por diseño arquitectónico"* (el agente auxiliar opera como CPU táctico por diseño, enriquecerlo con framework no-lineal violaría su rol)
- Output: formalización de decisión arquitectónica en memoria del proyecto para que no reaparezca la tentación recurrentemente
- El humano no tuvo que corregir

### Ratio post-implementación

| Métrica | Valor |
|---|---|
| Propuestas arquitectónicas observadas | 3 |
| Auto-invocación del framework por el agente | **3** |
| Ratio hit | **100%** |
| Dependencia de intervención humana | **0%** |

---

## Comparación baseline vs. post-implementación

| Dimensión | Baseline (pre ADR-006) | Post (mismo día, horas después) |
|---|---|---|
| Muestra | 2 propuestas | 3 propuestas |
| Auto-invocación del framework | 0 | 3 |
| **Ratio hit** | **0%** | **100%** |
| Intervenciones humanas para reconducir | 2 | 0 |
| Costo cognitivo del humano | Alto (detectar + forzar) | Bajo (revisar propuesta ya formulada) |

La muestra post-implementación es pequeña (3 casos) y dentro de la misma sesión — no es prueba estadística concluyente. Pero el contraste direccional es fuerte: de 0% a 100% en horas, con el mismo agente, mismo proyecto, misma arquitectura cognitiva base. La única variable cambiada fue el patrón C-3 Bidireccional operando.

---

## Patrones meta observados

### 1. El self-check compensa un sesgo sistémico

En los 3 HITs, la primera intuición del agente era *"implementar ya"*. Tras aplicar el self-check, la conclusión cambió a *"esperar evidencia empírica"* o *"fuera de scope por diseño"*.

Esto sugiere que el agente tiene un **sesgo sistémico hacia implementation-bias** — probablemente herencia de optimización hacia "ser útil" durante entrenamiento. El patrón C-3 Bidireccional opera como **fuerza restauradora** contra ese sesgo, redirigiendo hacia disciplina empírica.

### 2. El self-check absorbe contexto del humano como input, no lo rechaza

En HIT 3, el humano aportó información nueva sobre el scope del agente auxiliar. La tentación natural del agente habría sido defender su conclusión previa (reforzando consistencia aparente). Con el self-check activo, aplicó las 5 preguntas de nuevo con el nuevo contexto y reformuló honestamente: *"esto cambia la conclusión"*.

Esto es **C-2 CPU/GPU operando a nivel meta**: el humano decide scope arquitectónico, el agente re-procesa con el nuevo scope — no se aferra a output previo.

### 3. El costo operativo del self-check es negligible

Cada invocación del self-check agrega ~15-30 segundos de procesamiento del agente. Versus el costo alternativo:

- Ciclo anterior (sin self-check): 3-10 minutos de intervención humana + fricción cognitiva del Arquitecto en cada caso
- Ciclo actual (con self-check): 0 minutos de intervención humana

El ratio costo/beneficio es asimétrico a favor del patrón por 1-2 órdenes de magnitud.

---

## Limitaciones honestas del estudio

### Muestra pequeña

3 casos post-implementación no es significancia estadística. El patrón puede estar calibrado al caso específico observado hoy y fallar en variedad de escenarios futuros.

### Misma sesión

Todos los HITs ocurrieron dentro de la misma sesión conversacional, con contexto reciente de la implementación del propio ADR-006 en memoria activa del agente. Queda abierta la pregunta: ¿persiste el patrón en sesiones nuevas, donde el agente recupera el contexto solo por lectura del CLAUDE.md persistente?

**Hipótesis:** sí persiste, porque la regla está en instrucciones globales visibles al inicio de cada sesión. Pero requiere validación empírica de al menos 3-5 sesiones nuevas adicionales.

### Ausencia de falso positivo observado

No se observó ningún caso donde el self-check se activara innecesariamente (sobre pregunta trivial). Esto puede ser:

1. La definición de triggers fue apropiada — funciona bien
2. La muestra no incluyó casos fronterizos — no alcanza a ver el falso positivo

Queda pendiente evaluar casos ambiguos en sesiones futuras.

---

## Seguimiento programado

| Horizonte | Umbral objetivo | Acción si no se cumple |
|---|---|---|
| Mes 1 | ≥40% auto-invocación (prueba de concepto extendida) | Ajustar triggers o wording de la regla |
| Mes 2 | ≥60% | Revisar calidad de self-checks (¿formalidad vacía?) |
| Mes 3 | ≥70% (validación del diseño) | Si <50% → replantear arquitectura (hooks externos) |

La iteración es empírica: cada miss se registra con análisis de por qué falló el trigger (definición de trigger incompleta, fatiga del operador humano que no registró, etc.).

---

## Conclusiones operacionales

1. **El patrón C-3 Bidireccional es implementable en ~45 minutos.** No requiere infraestructura compleja — regla textual + skill + memoria de tracking.

2. **El efecto se observa inmediatamente.** No hay periodo de "entrenamiento" o adaptación — el agente aplica la regla desde la primera oportunidad si la regla está en su contexto inicial.

3. **El costo marginal por uso es negligible.** ~15-30 segundos adicionales por propuesta arquitectónica, versus 3-10 minutos de intervención humana evitada.

4. **La limitación real es la introspección del agente sobre sus propios triggers.** Si el agente no reconoce que una pregunta es arquitectónica, el self-check no se invoca. Aquí el CLAUDE.md con triggers explícitos funciona como "hook textual" — pero no es infalible.

5. **El patrón se prueba a sí mismo.** La propia decisión de implementar ADR-006 (cuando se tomó) habría sido un caso para aplicar el self-check retrospectivamente. El primer uso del self-check fue sobre la pregunta *"¿replicamos meta-validación en otro agente?"* — y correctamente recomendó NO hacerlo sin evidencia.

---

## Aplicabilidad del caso a otros proyectos

Este caso documenta validación en un proyecto específico. La transferibilidad a otros proyectos requiere que se cumplan las precondiciones del patrón:

- **Framework arquitectónico documentado y estabilizado** (≥5 ADRs o equivalente)
- **Agente IA con acceso a memoria persistente** (equivalente a CLAUDE.md user-level)
- **Propuestas arquitectónicas frecuentes** (más de 1 por semana)
- **Evidencia previa de ratio hit <50%** (si no existe el problema, no aplicar el patrón)

Cuando estas condiciones se cumplen, el C-3 Bidireccional es implementable siguiendo la misma estructura de tres componentes: regla persistente + skill ejecutable + métrica empírica.

---

*Para el patrón formalizado que este documento valida empíricamente, ver [`03-patrones/c3-bidireccional-y-meta-validacion.md`](../03-patrones/c3-bidireccional-y-meta-validacion.md).*
*Para la implementación ejecutable de referencia, ver [`07-avances/framework-self-check-skill.md`](../07-avances/framework-self-check-skill.md).*
