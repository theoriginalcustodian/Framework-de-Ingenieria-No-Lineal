# Patrón G-1: Debugging de Generadores Sistémicos

> *"Si encontraste el mismo error en tres archivos, no encontraste tres bugs — encontraste uno. Repetido tres veces por un generador que nadie está mirando."*

---

## La tesis

Los errores en software se manifiestan en instancias — un archivo, un módulo, una línea específica. La Ingeniería Lineal trata cada instancia como un evento independiente: encuentra el bug, parchéa el bug, cierra el ticket, espera al próximo.

La Ingeniería No Lineal reconoce que **los errores no ocurren en el vacío**. Son producidos por un generador: una plantilla de código, una convención mal formulada, una instrucción imprecisa a la IA, un patrón arquitectónico defectuoso. Corregir las instancias es trabajo lineal y finito. Corregir el generador es exponencial.

> Si un error aparece en 3 o más lugares, no es un bug. Es una falla en el generador.

---

## El problema que resuelve

### El anti-patrón: parches distribuidos

En arquitecturas lineales, cuando un mismo síntoma aparece en múltiples lugares, la respuesta típica es escribir parches individuales. Cada parche funciona, cada instancia queda corregida, y el desarrollador experimenta la sensación de progreso.

Pero el generador sigue vivo. Producirá nuevas instancias del mismo error cada vez que se escriba código similar. El ciclo se repite:

```
Error aparece en A → parche en A
Error aparece en B → parche en B
Error aparece en C → parche en C
Error aparece en D → parche en D (el siguiente sprint)
Error aparece en E → parche en E (el sprint después)
...
```

El desarrollador trabaja más y más, y el sistema acumula parches similares que no reducen la probabilidad de futuros errores — solo limpian los actuales.

### El costo real

El costo no son las horas dedicadas a cada parche individual. Son dos costos más profundos:

1. **El error que no se parchó.** Cuando aparece la instancia #7, y alguien no se da cuenta porque el código creció. Esa instancia entra a producción.
2. **La ceguera arquitectónica.** El equipo pierde la capacidad de ver que los errores distribuidos son síntomas de una causa común. Se convierte en cultura: *"así es este código"*.

---

## La regla operativa

**Umbral de detección:** 3 instancias del mismo síntoma.

Antes de escribir el tercer parche, pausar. No corregir. Preguntar: ¿qué tienen en común las tres instancias?

Las respuestas posibles forman un árbol de diagnóstico:

1. **Misma plantilla de código** — alguien escribió una función que otros copiaron. El generador es humano (copy-paste).
2. **Misma instrucción a la IA** — un prompt mal formulado produce el mismo defecto. El generador es el prompt.
3. **Misma convención documental** — una regla ambigua en la constitución técnica produce interpretaciones defectuosas. El generador es el texto de la regla.
4. **Mismo patrón arquitectónico** — un patrón adoptado tiene una falla latente. El generador es el patrón mismo.

Identificado el generador, se corrige una sola vez. Las instancias futuras dejan de producirse.

---

## El flujo operativo

### Paso 1 — Reconocer la repetición

Requiere disciplina de observación. El síntoma en archivo A podría parecer diferente al síntoma en archivo B si uno solo mira la implementación. Hay que mirar el **patrón del error**, no sus detalles.

Señales típicas:
- "Este bug se parece al que corregí la semana pasada"
- "¿No tuvimos este mismo problema en el módulo X?"
- "Parece que todos los nodos de tipo Y tienen este defecto"

### Paso 2 — Mapear las instancias

Antes de hipotetizar un generador, inventariar las instancias conocidas. Grep recursivo, auditoría del LLM, revisión del historial de bugs. Al menos 3 instancias del mismo síntoma activan el protocolo.

### Paso 3 — Identificar el generador común

Preguntar sucesivamente:
- ¿Están en archivos generados por la misma plantilla?
- ¿Fueron escritos en sesiones de trabajo con el mismo prompt?
- ¿Surgieron de seguir la misma regla documental?
- ¿Implementan el mismo patrón arquitectónico?

La respuesta apunta al generador. A veces el generador es obvio (todos los archivos usan la misma plantilla Cookiecutter). A veces es sutil (todos los módulos interpretaron ambiguamente una sección del CONSTITUCION.md).

### Paso 4 — Corregir el generador, no las instancias

Una vez identificado el generador:
- Si es una plantilla de código → corregir la plantilla. Re-generar los archivos afectados.
- Si es un prompt → corregir el prompt. Re-ejecutar la operación afectada.
- Si es una convención documental → corregir el texto. Re-auditar el código para alinear con la nueva interpretación.
- Si es un patrón arquitectónico → reescribir el patrón. Impacto más amplio, beneficio más duradero.

### Paso 5 — Corregir las instancias existentes en bloque

Ahora sí, parchar las instancias — pero en **una sola operación sistémica**, no una por una. El Arquitecto delega este trabajo al agente IA (paradigma CPU/GPU) con una instrucción única:

> *"Auditá el repositorio y aplicá la corrección a todas las instancias del patrón X."*

El output es un PR masivo con 50+ archivos corregidos en una sola operación. La IA opera como procesador paralelo masivo aplicando el fix sistémico.

---

## Validación empírica del patrón

En proyectos con uso intensivo de IA para generación de código, la aplicación del G-1 muestra resultados consistentes:

- **Reducción del tiempo de debug:** corregir una plantilla toma ~15 minutos. Corregir 50 instancias una por una toma ~12 horas.
- **Menor regresión:** el generador corregido no produce nuevas instancias. Los parches distribuidos no previenen nada.
- **Claridad arquitectónica:** identificar generadores revela dependencias ocultas en el sistema.

Ejemplo concreto documentado: en un proyecto con múltiples workflows de automatización, se detectó que **215+ defectos sistémicos** compartían un mismo generador (una convención ambigua en la constitución técnica). Se corrigió la convención y se aplicó la auditoría masiva. Tiempo total: una sola jornada. Estimado lineal: semanas.

---

## Cuándo aplicar este patrón

**Aplicar siempre que:**

- Aparezcan ≥3 instancias del mismo síntoma en el sistema
- El síntoma persiste después de múltiples parches individuales
- Hay sospecha razonable de generador común (plantilla, prompt, convención)

**Aplicar con cuidado cuando:**

- Las instancias parecen similares pero tienen causas diferentes (falso positivo de G-1)
- Corregir el generador rompe compatibilidad con código externo no controlado

**No aplicar cuando:**

- Solo hay 1-2 instancias del síntoma (esperar a la tercera antes de invertir en diagnóstico sistémico)
- El "generador" identificado es especulativo sin evidencia concreta

---

## Anti-patrones a evitar

### Anti-patrón 1 — Síndrome del parche heroico

El desarrollador se enorgullece de la velocidad con que corrige cada instancia. Confunde actividad con productividad. Las 15 horas de parches individuales se sienten como progreso; las 2 horas de corregir el generador se sienten como "poco trabajo".

**Solución:** métrica inversa. Valorar el **número de parches evitados** por corrección de generador, no el número de parches escritos.

### Anti-patrón 2 — Falso generador común

El desarrollador identifica prematuramente un generador común basado en dos instancias superficialmente similares. Corrige el "generador" y rompe otros casos donde la similitud era accidental.

**Solución:** umbral estricto de 3 instancias + análisis serio del mecanismo común. Si el mecanismo común no es evidente tras 15 minutos de inspección, esperar más evidencia.

### Anti-patrón 3 — Generador corregido sin re-auditoría

Se corrige el generador pero no se audita el código existente que fue producido por el generador defectuoso. Las instancias viejas persisten. El equipo cree que el problema está resuelto y no lo está.

**Solución:** flujo completo obligatorio — corregir generador + auditoría masiva + aplicación sistémica del fix. Las tres fases, nunca solo la primera.

### Anti-patrón 4 — Micro-optimización del generador

Se invierte tiempo desproporcionado en perfeccionar el generador después del fix inicial. Refactoring infinito sin valor marginal. El generador corregido ya previene las instancias futuras; lo demás es ego.

**Solución:** regla de salida clara. Generador se considera "suficientemente corregido" cuando las N instancias conocidas se corrigen correctamente y no se introducen regresiones nuevas.

---

## G-1 aplicado al propio proceso

El patrón G-1 es autorecursivo: también se aplica a los sesgos del propio Arquitecto y sus agentes IA.

Si el Arquitecto observa que él mismo comete repetidamente el mismo tipo de decisión subóptima en diferentes proyectos, el generador no es del código — es del propio Arquitecto (o de su agente IA asistente). El fix paramétrico opera a nivel meta: crear una regla, una skill, una memoria persistente que intercepte ese sesgo antes de que produzca nuevas instancias.

Este es el puente conceptual entre G-1 clásico y el patrón [C-3 Bidireccional](c3-bidireccional-y-meta-validacion.md) — la meta-validación del agente es G-1 paramétrico aplicado al sesgo *"propongo lineal por default"*.

---

## Relación con otros patrones

### Con C-2 (CPU/GPU)

La corrección del generador es típicamente trabajo CPU (análisis estructural, decisión arquitectónica). La aplicación masiva del fix a las instancias es trabajo GPU (auditoría paralela, patches sistémicos). G-1 requiere explícitamente esta separación de roles para ser eficiente.

### Con G-2 (Gobernanza desde Día 0)

G-2 establece desde el inicio del proyecto las convenciones y plantillas que actúan como generadores. Si G-2 se implementa con rigor, hay menos generadores defectuosos que debuggear luego. G-2 es prevención; G-1 es cura.

### Con C-3 (Exocórtex)

Cada generador identificado y corregido merece una entrada en el exocórtex como trauma catalogado con su cura. Esto evita que el mismo generador reaparezca en el futuro bajo otra forma. Es memoria institucional del sistema.

### Con el Manifiesto Muerte al Hardcoding

El hardcoding es, en última instancia, un generador defectuoso: la suposición de que el futuro será idéntico al presente. G-1 aplicado al hardcoding produce: "si encuentro el mismo valor hardcodeado en 3 lugares, no debo parchar los 3 — debo externalizarlo a configuración (corregir el generador)".

---

## Señales de que G-1 está operando bien en un proyecto

- El equipo habla naturalmente de "generadores" cuando discute bugs recurrentes
- Los sprints incluyen tareas explícitas de auditoría de generadores
- El backlog distingue entre "parche individual" y "fix de generador"
- Las métricas del proyecto muestran decreciente ratio de bugs recurrentes

### Señales de que G-1 no está operando

- El equipo celebra "mucho trabajo hecho" en términos de cantidad de parches
- Los mismos tipos de bug aparecen sprint tras sprint
- No existe concepto de "generador" en el vocabulario del equipo
- Las auditorías sistémicas se consideran "overhead"

---

## Conclusión

G-1 no es técnica de debugging — es filosofía operativa. La disciplina de no parchar la tercera instancia antes de entender el mecanismo común que las produce.

Es la diferencia entre tratar síntomas y tratar causas. Entre trabajo lineal y trabajo exponencial. Entre un sistema que acumula deuda y un sistema que aprende de sus propias fallas.

Cuando un equipo internaliza G-1, el tiempo de debugging colapsa. No porque los bugs desaparezcan — sino porque cada bug enseña algo estructural que previene docenas de bugs futuros.

---

*Para el patrón que gestiona el exocórtex donde se catalogan los generadores identificados y sus curas, ver [`02-framework/framework-vision-general.md`](../02-framework/framework-vision-general.md) (C-3 Exocórtex).*
*Para la aplicación de G-1 al propio agente IA, ver [`03-patrones/c3-bidireccional-y-meta-validacion.md`](c3-bidireccional-y-meta-validacion.md).*
