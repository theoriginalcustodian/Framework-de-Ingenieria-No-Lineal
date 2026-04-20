# Template Memoria de Tracking — Métrica Empírica del Framework

> **Plantilla adaptable.** Copiar a la memoria persistente del proyecto como
> archivo `feedback_meta_validacion_agente.md` o equivalente. Es el tercer
> componente obligatorio del patrón C-3 Bidireccional.

---

## Propósito

Esta memoria **mide empíricamente** si el patrón C-3 Bidireccional está funcionando en el proyecto. Sin tracking, no hay forma de saber si:

- El agente invoca el self-check cuando corresponde (hit)
- El humano sigue teniendo que forzar la re-evaluación (miss)
- El ratio de adopción mejora con el tiempo o se degrada

Las sesiones sin registro son invisibles para la iteración. Si no se mide, no se puede ajustar el diseño.

---

## Plantilla completa

```markdown
---
name: Meta-validación del agente — tracking empírico
description: Registro empírico de invocaciones de /framework-self-check — hits (auto-invocado por el agente) vs misses (humano tuvo que forzar). Métrica base para validar C-3 Bidireccional en este proyecto.
type: feedback
---

## Regla operativa

**Antes de proponer arquitectura, invoco `/framework-self-check` yo mismo (sin que el humano lo pida).**

Triggers explícitos de invocación:
- Crear o modificar ADR
- Crear o modificar skill o protocolo reutilizable
- Agregar función a biblioteca compartida
- Proponer decisión arquitectónica conversacional ("recomiendo", "propongo", "el fix es", "vamos a agregar/refactorizar")
- Fix paramétrico sobre infraestructura

Ver detalle completo en `{{CLAUDE_MD_PATH}}` §{{NUMERO_SECCION}} y en {{FRAMEWORK_REPO_PATH}}/03-patrones/c3-bidireccional-y-meta-validacion.md.

## Baseline pre-implementación del patrón

Registrar los primeros 2-5 casos donde el humano forzó re-evaluación ANTES de implementar el self-check. Sin baseline, no hay mejora medible.

| Fecha | Caso | Resultado |
|---|---|---|
| {{FECHA_1}} | {{PROPUESTA_INICIAL}} | Humano tuvo que decir "aplicá el framework" → Plan v2 adoptado |
| {{FECHA_2}} | {{PROPUESTA_INICIAL_2}} | Idem |

**Baseline:** N/M = X% auto-invocación. Punto de partida para medir mejora.

## HITs registrados post-implementación del patrón

| # | Fecha | Trigger | Auto-invocado | Resultado |
|---|---|---|---|---|
| 1 | {{FECHA}} | {{TRIGGER_DETECTADO}} | ✅/❌ | {{QUE_PASO}} |
| 2 | {{FECHA}} | {{TRIGGER}} | ✅/❌ | {{RESULTADO}} |

## Métricas por sesión

Al finalizar cada sesión significativa, agregar bloque:

### Sesión {{YYYY-MM-DD}}

- Propuestas arquitectónicas totales: N
- Auto-invocadas `/framework-self-check`: X
- Intervenciones humanas "re-evalúa": Y
- Ratio auto-invocación: X / (X+Y) = Z%
- Edge cases nuevos descubiertos: [lista breve]
- Notas de calidad del self-check: [¿fue análisis honesto o formalidad?]

## Hitos objetivo

| Horizonte | Umbral objetivo | Acción si no se cumple |
|---|---|---|
| Mes 1 | ≥40% auto-invocación | Ajustar triggers o wording de la regla en CLAUDE.md |
| Mes 2 | ≥60% | Revisar calidad de self-checks (¿se volvieron formalidad vacía?) |
| Mes 3 | ≥70% — validación del diseño | Si <50% → replantear arquitectura (considerar hooks externos) |
| Mes 6 | ≥80% sostenido | Mantener — patrón estable |

## Casos edge documentables

Registrar casos donde el patrón tuvo comportamiento no esperado:

### 1. Invoqué el self-check pero el humano aún pidió re-evaluación

Problema de **calidad del check**, no de adopción. Registrar:
- Qué pregunta del framework fallé
- Por qué el análisis fue superficial

### 2. No detecté el trigger arquitectónico

Creí que era cambio trivial pero no lo era. Registrar:
- El trigger que debería haber disparado el check
- Por qué no lo reconocí

Esto refina la definición de triggers en el CLAUDE.md.

### 3. Invoqué self-check para caso trivial (overkill)

Problema de **umbral**. Registrar:
- El caso donde fue innecesario
- Cómo ajustar triggers a más específicos

## Auto-reporte al usuario

Cuando el usuario pregunta "¿cómo funcionó la meta-validación hoy?", respondo con data concreta extraída de esta memoria:

> "En esta sesión hice N propuestas arquitectónicas. X las auto-validé con /framework-self-check. Y tuviste que forzar re-evaluación. Ratio: Z%."

Si la memoria está vacía o desactualizada, respondo honestamente:

> "No registré esta sesión — diseño de la memoria falló. Voy a registrar retroactivamente los casos que recuerde."

## Análisis retrospectivo (mensual)

Al cierre de cada mes, producir bloque:

### Análisis mes {{YYYY-MM}}

- **Ratio promedio del mes:** X%
- **Tendencia vs mes anterior:** ↑ / ↓ / estable
- **Triggers más frecuentes:** [lista ordenada]
- **Casos edge nuevos:** [lista]
- **Ajustes realizados al CLAUDE.md / skill:** [descripción]
- **Hipótesis para próximo mes:** [qué esperás observar]
```

---

## Cómo adaptar esta plantilla

### Paso 1 — Reemplazar placeholders

- `{{CLAUDE_MD_PATH}}` → ruta a tu archivo de instrucciones globales del agente
- `{{NUMERO_SECCION}}` → sección de tu CLAUDE.md donde vive la regla (típicamente §11)
- `{{FRAMEWORK_REPO_PATH}}` → ruta local o URL del repo Ingeniería No Lineal
- `{{FECHA_1}}`, `{{FECHA_2}}` → fechas reales de casos empíricos del baseline
- `{{PROPUESTA_INICIAL}}` → descripción corta del caso

### Paso 2 — Completar el baseline HONESTAMENTE

No inventar casos. Si tu proyecto no ha tenido aún ≥2 casos de intervención humana forzada por anti-patrón, es probable que el patrón C-3 Bidireccional aún no sea necesario. Esperar a tener evidencia empírica del problema antes de implementar la solución.

Este principio es ADR-004 aplicado recursivamente: *"no codificar la esperanza"*. Implementar el patrón sin evidencia del problema es codificar esperanza.

### Paso 3 — Ubicar el archivo

El archivo debe vivir en memoria persistente del proyecto. Ubicaciones típicas:

- **Claude Code:** `~/.claude/projects/<proyecto>/memory/feedback_meta_validacion_agente.md`
- **Cursor:** equivalente en la estructura de memoria del agente
- **Custom:** cualquier archivo `.md` que el agente consulta al inicio de cada sesión

### Paso 4 — Integrar con el flujo del agente

El agente debe:

1. **Leer** esta memoria al inicio de cada sesión (como parte del handshake cognitivo)
2. **Actualizar** esta memoria al final de cada sesión significativa (como parte del delta cognitivo)
3. **Reportar** las métricas cuando el usuario pregunte

Si tu agente no hace los 3 pasos, la memoria se convierte en documentación muerta — escrita pero no consultada.

---

## Precondiciones de adopción

Antes de copiar esta plantilla, verificá:

- [ ] Implementaste el skill `/framework-self-check` (o equivalente)
- [ ] Agregaste la regla correspondiente al `CLAUDE.md` user-level
- [ ] Tenés al menos 2 casos empíricos del anti-patrón documentables (baseline honesto)
- [ ] Tu agente consulta automáticamente la memoria al inicio de cada sesión

Si las cuatro se cumplen, adoptar la plantilla es alto-ROI. Si alguna falla, primero construí el pre-requisito.

---

## Anti-patrones a evitar

### Anti-patrón 1 — Memoria sin lectura automática

El archivo existe pero el agente no lo consulta al inicio de sesión. La memoria es escritura-only. No hay iteración.

**Solución:** configurar el agente para que lea esta memoria como parte del handshake cognitivo. En Claude Code, agregar referencia en el `CLAUDE.md` que apunte al archivo.

### Anti-patrón 2 — Tracking deshonesto

El agente registra solo hits para "hacer ver" que el patrón funciona. Los misses se ocultan. Los números se inflan.

**Solución:** disciplina de registro honesto. El valor del tracking está en detectar los misses — son input para ajustar el diseño. Ocultarlos hace el patrón inservible.

### Anti-patrón 3 — Tracking abandonado

Los primeros meses se registra cuidadosamente. Después, la disciplina decae. Seis meses después, la memoria tiene entradas de hace 4 meses.

**Solución:** hacer del registro un paso obligatorio del cierre de sesión. Sin registro actualizado, la sesión no está cerrada.

### Anti-patrón 4 — Sobrecarga de campos

La plantilla se extiende con 15 campos por entrada. El registro se vuelve tarea pesada. La disciplina colapsa.

**Solución:** mantener lo mínimo. 4-5 campos por entrada es el óptimo observado. Más campos → menor disciplina de registro → menor valor de la memoria.

---

## Valor del tracking incluso si el patrón falla

Si después de 3 meses el ratio se estanca en <50%, **eso es información valiosa**, no fracaso:

- Puede indicar que los triggers están mal definidos → ajustar
- Puede indicar que el framework no se aplica bien al dominio → iterar
- Puede indicar que el patrón no es adecuado para este proyecto → descartar

Sin tracking, todas estas conclusiones son imposibles. Con tracking, las tres son accionables.

El valor del patrón C-3 Bidireccional no está solo en su éxito — está en su capacidad de **ser medido empíricamente**. Esa es la diferencia entre metodología y superstición.

---

## Relación con otros componentes

- **Skill ejecutable:** [`../skills/framework-self-check.md`](../skills/framework-self-check.md)
- **Regla persistente:** [`../claude-md-template/CLAUDE-md-user-level-template.md`](../claude-md-template/CLAUDE-md-user-level-template.md)
- **System prompt:** [`../system-prompts/constitucion-agente-inl.md`](../system-prompts/constitucion-agente-inl.md)

Los tres componentes + esta memoria forman el sistema completo del patrón C-3 Bidireccional. Faltando cualquiera, el patrón opera parcialmente.

---

*Para el patrón teórico, ver [`03-patrones/c3-bidireccional-y-meta-validacion.md`](../../03-patrones/c3-bidireccional-y-meta-validacion.md).*
*Para la validación empírica del patrón en proyecto real, ver [`05-evidencia/validacion-meta-framework.md`](../../05-evidencia/validacion-meta-framework.md).*
