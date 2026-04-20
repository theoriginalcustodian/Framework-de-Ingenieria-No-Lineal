# Hito: primera implementación ejecutable de meta-validación del agente

> *"Los LLMs no tenemos introspección confiable. Pero sí podemos seguir checklists si están externalizados al flujo observable."*

---

## Qué es este documento

El registro de un hito del framework: la **primera implementación ejecutable del patrón C-3 Bidireccional** bajo la forma de una skill meta del agente IA. Documento histórico, no guía de adopción.

Para adoptar el patrón en tu proyecto, no leer este archivo — ir directamente a la plantilla canónica en [`08-implementaciones-referencia/skills/framework-self-check.md`](../08-implementaciones-referencia/skills/framework-self-check.md), que contiene:

- Precondiciones de adopción
- Los 5 pasos del skill adaptables
- Triggers obligatorios
- Reglas estrictas
- Anti-patrones observados
- Pasos de adopción con placeholders

---

## Contexto del hito

Este avance emergió de una sesión intensiva donde se detectó un patrón recurrente en el comportamiento del agente IA: proponer soluciones lineales (IF hardcodeado, parches puntuales) cuando existían alternativas paramétricas alineadas al framework. El humano tenía que detectar el anti-patrón y forzar la re-evaluación.

Baseline observado: **0 de 2 propuestas arquitectónicas** autoidentificaron el anti-patrón. El 100% requirió intervención humana.

La solución emergió como aplicación recursiva del framework al propio agente:

1. **Regla textual persistente** en instrucciones globales (CLAUDE.md §11)
2. **Skill ejecutable `/framework-self-check`** que aplica las preguntas del framework a la propia propuesta del agente
3. **Memoria de tracking** para medir hit ratio empírico

La skill no la invoca el humano — la invoca el propio agente antes de presentar su propuesta. Es autonomía disciplinada, no teatro.

---

## Resultado empírico inmediato

Tras implementar los 3 componentes, en la misma sesión:

| Métrica | Baseline (pre) | Post (horas después) |
|---|---|---|
| Propuestas arquitectónicas observadas | 2 | 3 |
| Auto-invocación del framework | 0 | 3 |
| **Ratio hit** | **0%** | **100%** |
| Intervenciones humanas forzadas | 2 | 0 |

Muestra pequeña, dentro de la misma sesión — no es prueba estadística, pero el contraste direccional es fuerte. Ver limitaciones honestas en [`05-evidencia/validacion-meta-framework.md`](../05-evidencia/validacion-meta-framework.md).

---

## Por qué este hito importa

Este avance cierra una recursión del framework:

- El framework exige diseño no-lineal
- El agente IA que construye bajo el framework tiene sesgo implícito hacia lineal
- Un framework maduro debe poder **aplicarse a sí mismo** — incluyendo al agente que lo usa
- La skill meta materializa esa auto-aplicación

Es la diferencia entre un framework documentado (los patrones están escritos) y un framework operante (los patrones se consultan antes de decidir).

En lenguaje del propio framework:

- **C-1 (Pre-Computación):** el self-check es pre-computación aplicada al propio agente antes de actuar arquitectónicamente
- **C-2 (CPU/GPU):** preserva roles — el humano decide, el agente procesa, pero el agente ahora presenta Plan v1+v2+recomendación en lugar de solo v1
- **C-3 Bidireccional:** consulta al framework antes de actuar, no solo registra decisiones después
- **G-1 (Debugging de generadores):** fix paramétrico del generador "agente propone lineal por default"

---

## Estado del hito

- ✅ Patrón formalizado en [`03-patrones/c3-bidireccional-y-meta-validacion.md`](../03-patrones/c3-bidireccional-y-meta-validacion.md)
- ✅ Validación empírica documentada en [`05-evidencia/validacion-meta-framework.md`](../05-evidencia/validacion-meta-framework.md)
- ✅ Plantilla adoptable disponible en [`08-implementaciones-referencia/skills/framework-self-check.md`](../08-implementaciones-referencia/skills/framework-self-check.md)
- 🔲 Validación en sesiones nuevas (no misma sesión) — pendiente para confirmar persistencia del patrón

---

## Para adoptantes

Si querés aplicar este patrón en tu proyecto, no uses este documento — usá la plantilla canónica en [`08-implementaciones-referencia/skills/framework-self-check.md`](../08-implementaciones-referencia/skills/framework-self-check.md). Ahí están las precondiciones, la skill adaptable, el CLAUDE.md template, el tracking de memoria y los ADR templates necesarios para implementar los 3 componentes del patrón.

Este archivo existe para registrar el momento en que el hito ocurrió — no para operar.

---

*Para el patrón teórico formalizado, ver [`03-patrones/c3-bidireccional-y-meta-validacion.md`](../03-patrones/c3-bidireccional-y-meta-validacion.md).*
*Para la validación empírica del patrón, ver [`05-evidencia/validacion-meta-framework.md`](../05-evidencia/validacion-meta-framework.md).*
*Para adoptar el patrón en tu proyecto, ver [`08-implementaciones-referencia/`](../08-implementaciones-referencia/).*
