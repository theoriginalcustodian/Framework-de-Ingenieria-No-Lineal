# Template ADR Completo — Ingeniería No Lineal

> **Plantilla adaptable.** Formato extendido para decisiones arquitectónicas
> transversales con alto impacto o reversibilidad baja. Para decisiones
> acotadas del día a día, usar [`template-adr-minimo.md`](template-adr-minimo.md).

---

## Cuándo usar esta plantilla

Usar template COMPLETO cuando la decisión cumple ≥1 de estas condiciones:

- Afecta arquitectura transversal (múltiples capas del sistema)
- Las alternativas consideradas son ≥3 con trade-offs no triviales
- La reversibilidad es baja (cambiar después requiere refactor significativo)
- Impacta seguridad, multi-tenencia o compliance
- Consolidación de múltiples casos previos en un patrón unificado
- Introduce un patrón nuevo al framework del proyecto

Ejemplos típicos:
- Adopción de nuevo patrón arquitectónico global
- Cambio de estrategia de persistencia
- Migración de stack o framework crítico
- Introducción de nuevo agente IA al sistema
- Consolidación de N anti-patrones observados

---

## Plantilla completa

```markdown
# ADR-{{NNN}} — {{Título descriptivo}}

**Fecha:** {{YYYY-MM-DD}}
**Status:** PROPUESTA | ACEPTADA | SUPERSEDED por ADR-{{MMM}} | RECHAZADA
**Sesión origen:** {{contexto — sprint, sesión intensiva, post-incidente, etc.}}
**Relacionado con:** {{ADR-XXX, ADR-YYY que preceden o consolidan}}
**Autor:** {{nombres o roles}}

---

## Contexto

{{Sección expandida — 2-4 párrafos}}

Describir:
- ¿Qué problema real originó esta decisión?
- ¿Qué evidencia empírica existe? (casos observados, métricas, incidentes)
- ¿Por qué la situación actual es insuficiente?
- ¿Qué pasaría si no tomamos decisión?

Incluir referencias a casos concretos con fechas/IDs si aplica.

## Decisión

{{La elección tomada, en prosa clara. 1-3 párrafos}}

Si la decisión tiene múltiples componentes, enumerarlos:

### Componente 1 — {{nombre}}
{{descripción}}

### Componente 2 — {{nombre}}
{{descripción}}

### Componente 3 — {{nombre}}
{{descripción}}

## Alternativas consideradas

### Alt 1 — {{nombre descriptivo}}

**Qué proponía:** {{descripción}}

**Por qué se rechazó:** {{razón estructural, no de gusto}}

### Alt 2 — {{nombre descriptivo}}

**Qué proponía:** {{descripción}}

**Por qué se rechazó:** {{razón}}

### Alt 3 — {{nombre descriptivo}}

**Qué proponía:** {{descripción}}

**Por qué se rechazó:** {{razón}}

### Alt N (elegida) — {{nombre descriptivo}}

**Aceptada porque:**

- (a) {{razón estructural 1}}
- (b) {{razón estructural 2}}
- (c) {{razón estructural 3}}

---

## Consecuencias

### Positivas

- **{{consecuencia 1}}** — {{explicación}}
- **{{consecuencia 2}}** — {{explicación}}
- **{{consecuencia 3}}** — {{explicación}}

### Negativas / trade-offs

- **{{trade-off 1}}** — {{explicación honesta del costo}}
- **{{trade-off 2}}** — {{explicación}}
- **{{riesgo 1}}** — {{cómo se mitiga}}

### Consecuencias sistémicas

{{Cambios que esta decisión produce en otras partes del sistema — archivos a actualizar, patrones que cambian, documentos que requieren revisión, procesos que se modifican.}}

---

## Patrones del framework aplicados

- **{{Patrón 1}}:** {{1-2 líneas explicando cómo se aplica}}
- **{{Patrón 2}}:** {{1-2 líneas}}
- **{{Patrón 3}}:** {{1-2 líneas}}
- **{{Manifiesto N}}:** {{cómo honra el principio}}

---

## Referencias

- **Casos empíricos origen:**
  - {{PR/incidente #1}} — {{1 línea}}
  - {{PR/incidente #2}} — {{1 línea}}
- **ADRs relacionados:**
  - ADR-{{XXX}} — {{relación}}
  - ADR-{{YYY}} — {{relación}}
- **Artefactos afectados:**
  - {{archivo/módulo}} — {{tipo de cambio}}
  - {{documento}} — {{tipo de cambio}}
- **Framework de referencia:** {{link si aplica}}

---

## Seguimiento

- [ ] {{Acción post-merge 1 — ej. ingestar este ADR en la memoria semántica}}
- [ ] {{Acción post-merge 2 — ej. actualizar INDICE_MAESTRO.md}}
- [ ] {{Criterio de revisión — ej. "aplicar en próximas 3 ejecuciones y validar ratio"}}
- [ ] {{Horizonte de evaluación — ej. "revisar en 1 mes — si KPI X no mejora, superseed"}}
- [ ] {{Criterio de SUPERSEDED — ej. "si emergen ≥3 casos que este ADR no cubre, replantear"}}

---

*{{Epígrafe final opcional — conexión filosófica con el framework, cierre interpretativo, etc.}}*
```

---

## Ejemplo real (estructura condensada)

```markdown
# ADR-006 — Meta-validación del agente mediante auto-framework-check

**Fecha:** 2026-04-20
**Status:** ACEPTADA
**Sesión origen:** Retrospectiva cierre sesión intensiva — patrón sistémico detectado
**Relacionado con:** ADR-001 (framework integrado), ADR-004 (Validación Pre-Impl), ADR-005 (Biblioteca)

---

## Contexto

Tras uso intensivo del framework en proyecto real, emergió patrón:
1. Humano plantea problema
2. Agente propone Plan v1 (lineal)
3. Humano detecta anti-patrón
4. Humano invoca: "re-evaluá con framework"
5. Agente propone Plan v2 (no-lineal)
6. Plan v2 adoptado

Ratio observado pre-corrección: **100% detecciones dependieron del humano**.

Dos casos empíricos documentados: [...]

## Decisión

Introducir auto-validación del agente antes de propuestas arquitectónicas mediante 3 componentes coordinados:

### Componente 1 — Regla persistente en CLAUDE.md
[...]

### Componente 2 — Skill ejecutable /framework-self-check
[...]

### Componente 3 — Métrica empírica de adopción
[...]

## Alternativas consideradas

### Alt 1 — Skill manual que el humano dispara
**Rechazada.** Sigue dependiendo de detección humana. No escala.

### Alt 2 — Promesa interna "me aplico Paso 4.5 siempre"
**Rechazada.** Los LLMs no tenemos introspección confiable.

### Alt 3 — Hook externo que intercepta respuestas
**Rechazada por ahora.** Requiere infraestructura no disponible.

### Alt 4 — Skill autónoma invocable por el agente
**Parcial.** No garantiza invocación.

### Alt 5 (elegida) — Combinación CLAUDE.md + Skill + Métrica
**Aceptada porque:**
- Regla textual persistente + skill ejecutable + tracking empírico
- Los 3 componentes se refuerzan mutuamente
- Bajo costo de implementación (~45 min)

## Consecuencias

### Positivas
- Reduce dependencia de intervención humana (objetivo ≥70%)
- Transferibilidad a futuros agentes del proyecto
- Auto-documentación auditable

### Negativas / trade-offs
- No resuelve al 100% (LLMs fallan en auto-reglas)
- Riesgo de falso positivo — overkill en casos triviales

## Patrones del framework aplicados

- **C-3 Bidireccional:** exocórtex se consulta antes de decidir
- **G-1:** fix paramétrico al generador común ("agente propone lineal")
- **A-1:** biblioteca compartida de constraints aplicables
- **C-2:** humano sigue decidiendo, agente presenta v1+v2

## Referencias

- **Casos origen:** PR #204 (IF hardcodeado), ADR-005 (port selectivo)
- **ADRs relacionados:** ADR-001, ADR-004, ADR-005
- **Artefactos a crear:**
  - `~/.claude/CLAUDE.md` §11 (regla)
  - `~/.claude/commands/framework-self-check.md` (skill)
  - `feedback_meta_validacion_agente.md` (tracking)

## Seguimiento

- [ ] Aplicar en próximas 3 sesiones y validar ratio ≥40%
- [ ] Registrar cada propuesta arquitectónica en memoria de tracking
- [ ] Evaluación a 1 mes — objetivo ≥40%
- [ ] Evaluación a 3 meses — validación ≥70% o replantear diseño

---

*ADR-006 materializa C-3 Exocórtex recursivo: el sistema cognitivo aprende a auto-corregirse antes de que el humano lo corrija.*
```

---

## Cómo adaptar esta plantilla

### Paso 1 — Asignar número NNN

Usar el siguiente número secuencial disponible. Los números nunca se reusan.

### Paso 2 — Decidir si realmente necesitás template completo

Pregunta honesta: **¿alguien que lea esto en 1 año necesitará los 9 trade-offs y las 5 alternativas?**

Si la respuesta es sí → template completo. Si dudas → template mínimo.

### Paso 3 — No inventar alternativas

Si genuinamente consideraste solo 2 alternativas, escribir solo 2. Agregar "Alt 3" ficticia para "hacer más completo el ADR" es deshonesto y desinforma al futuro.

### Paso 4 — Seguimiento accionable

El seguimiento es el contrato del ADR con el futuro. Debe ser:

- **Verificable:** se puede chequear si se cumplió o no
- **Con horizonte temporal:** "en 1 mes", "en 3 sesiones", no "eventualmente"
- **Accionable:** describe qué acción toma quien chequea, no "revisar si fue buena decisión"

---

## Anti-patrones a evitar

### Anti-patrón 1 — Template completo para decisión trivial

Usar template completo genera overhead innecesario para decisiones acotadas. 45 minutos escribiendo un ADR que podría haber sido 5 minutos.

**Solución:** defaultear a mínimo. Solo escalar a completo si realmente cumple los criterios.

### Anti-patrón 2 — Alternativas consideradas como adorno

Listar alternativas que nunca se consideraron seriamente, para "hacer ver" que el análisis fue riguroso.

**Solución:** si no consideraste seriamente una alternativa, no la listes. Mejor honestidad que apariencia de rigor.

### Anti-patrón 3 — Consecuencias negativas diluidas

Las consecuencias negativas se escriben con eufemismos ("podría considerarse subóptimo en algunos casos"). El futuro lector no sabe cuál es el trade-off real.

**Solución:** lenguaje directo. "Esto agrega X ms de latencia por request" es útil. "Puede tener impacto en performance" es ruido.

### Anti-patrón 4 — Sin seguimiento

La sección Seguimiento queda vacía o con placeholders genéricos. El ADR es retrospectivo puro, sin compromiso con verificación futura.

**Solución:** al menos 2 items de seguimiento accionables. Si la decisión no tiene criterios de verificación, quizás no debería documentarse como ADR — podría ser solo comentario en código.

### Anti-patrón 5 — Status estancado en PROPUESTA

El ADR se escribe como PROPUESTA y nunca se actualiza a ACEPTADA o RECHAZADA. Decisiones en limbo indefinido.

**Solución:** cada PROPUESTA tiene fecha límite de resolución. Si no se resuelve en el plazo, automáticamente RECHAZADA por inacción.

---

## Relación con ADR mínimo

- **Template mínimo:** [`template-adr-minimo.md`](template-adr-minimo.md) — para decisiones acotadas del día a día
- **Template completo:** este archivo — para decisiones transversales o consolidadoras

Ambos producen ADRs válidos. La regla es: **el esfuerzo de redacción debe ser proporcional al impacto de la decisión**.

---

## Cómo escribir buenos ADRs

Ver [`00-README-como-escribir-adr.md`](00-README-como-escribir-adr.md) para guía completa.

---

*Para el patrón que fundamenta los ADRs como componente del Exocórtex, ver [`03-patrones/c3-exocortex-memoria-activa.md`](../../03-patrones/c3-exocortex-memoria-activa.md).*
*Para el patrón que exige ADRs desde el Día 0 del proyecto, ver [`03-patrones/g2-gobernanza-dia-cero.md`](../../03-patrones/g2-gobernanza-dia-cero.md).*
