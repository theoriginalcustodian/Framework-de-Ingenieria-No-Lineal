# Template ADR Mínimo — Ingeniería No Lineal

> **Plantilla adaptable.** Formato compacto para decisiones arquitectónicas rápidas
> del día a día. Para decisiones con alto impacto o reversibilidad baja,
> usar [`template-adr-completo.md`](template-adr-completo.md).

---

## Cuándo usar esta plantilla

Usar template MÍNIMO cuando:

- La decisión afecta un componente acotado del sistema (no arquitectura transversal)
- Las alternativas consideradas son ≤3
- La reversibilidad es alta (se puede cambiar después sin grandes costos)
- El tiempo disponible es ≤30 minutos

Ejemplos típicos:
- Elección de biblioteca auxiliar entre opciones conocidas
- Decisión de convención de naming en un módulo
- Elección de estrategia de caching local
- Fix paramétrico sobre un generador común identificado (G-1)

Si la decisión no cumple las 4 condiciones, usar template completo.

---

## Plantilla

```markdown
# ADR-{{NNN}} — {{Título descriptivo}}

**Fecha:** {{YYYY-MM-DD}}
**Status:** PROPUESTA | ACEPTADA | SUPERSEDED por ADR-{{MMM}} | RECHAZADA
**Contexto originante:** {{sesión / issue / PR que motivó la decisión}}

## Contexto

{{2-5 líneas describiendo el problema real}}

## Decisión

{{1-3 líneas con la elección tomada, en prosa clara}}

## Alternativas consideradas

- **Alt 1 — {{nombre}}:** {{razón de rechazo en 1 línea}}
- **Alt 2 — {{nombre}}:** {{razón de rechazo en 1 línea}}

## Consecuencias

### Positivas
- {{consecuencia positiva 1}}
- {{consecuencia positiva 2}}

### Negativas / trade-offs
- {{trade-off honesto 1}}
- {{trade-off honesto 2}}

## Patrones del framework aplicados

- {{A-1 / C-3 / G-1 / etc.}} — {{1 línea de justificación}}

## Referencias

- {{link a PR / issue / reporte si aplica}}
```

---

## Ejemplo real

```markdown
# ADR-047 — Extender ERROR_MAP con código 413 PAYLOAD_TOO_LARGE

**Fecha:** 2026-05-15
**Status:** ACEPTADA
**Contexto originante:** PR #242 resolviendo issue #240 (timeout en upload masivo)

## Contexto

El adaptador externo devuelve HTTP 413 cuando el payload supera 5MB.
Actualmente cae en fallback genérico "UNKNOWN_ERROR", perdiendo
semántica útil para los callers.

## Decisión

Agregar entrada al ERROR_MAP del Adaptador Universal para código 413:

```javascript
413: { tipo: 'PAYLOAD_TOO_LARGE', reintentable: false, alerta: false }
```

## Alternativas consideradas

- **Alt 1 — IF hardcodeado en cada caller:** rechazada por violar A-1 (tabla declarativa ya existe).
- **Alt 2 — Incluir retry automático con payload más chico:** rechazada por agregar complejidad sin evidencia de que resuelve los casos reales.

## Consecuencias

### Positivas
- Callers reciben semántica clara (`PAYLOAD_TOO_LARGE` vs `UNKNOWN_ERROR`)
- Cero costo incremental — agregar entrada a tabla existente

### Negativas / trade-offs
- La decisión de "no reintentable" asume que los callers particionarán el batch. Si no lo hacen, el error queda sin resolución automática.

## Patrones del framework aplicados

- **A-1:** extensión de tabla declarativa, no nuevo IF distribuido.
- **Manifiesto Muerte al Hardcoding:** la tabla es configuración, no código hardcodeado.

## Referencias

- PR #242
- Issue #240 (stack trace con error 413)
```

---

## Cómo adaptar

### Paso 1 — Asignar número NNN

Usar el siguiente número secuencial disponible. Los números nunca se reusan (aún si el ADR fue rechazado).

### Paso 2 — Decidir ubicación

Ubicaciones típicas:
- `docs/ADRs/{{YYYY-MM-DD}}_ADR-{{NNN}}_{{slug}}.md`
- `docs/15_Estandares_Documentacion/ADRs/...`
- `.adrs/` (si seguís el estándar ADR Tools)

### Paso 3 — Status inicial

- **PROPUESTA:** escrito pero aún no discutido/aprobado
- **ACEPTADA:** discutido y en vigor
- **SUPERSEDED:** reemplazado por otro ADR más reciente
- **RECHAZADA:** discutido pero NO adoptado (útil conservar para futuros debates)

### Paso 4 — Brevedad

La regla del ADR mínimo es **brevedad honesta**. Si no podés escribirlo en ≤30 líneas, la decisión probablemente requiere template completo.

---

## Anti-patrones a evitar

### Anti-patrón 1 — ADR mínimo para decisión grande

Se usa template mínimo para ocultar complejidad de una decisión transversal. El resultado: ADR incompleto que no captura el razonamiento real.

**Solución:** si dudás entre mínimo y completo, usá completo. El ADR sirve para el futuro — el template completo se agradece cuando alguien revisa la decisión meses después.

### Anti-patrón 2 — Sin alternativas consideradas

Se documenta solo la decisión tomada. Sin alternativas, el ADR pierde la mitad de su valor: el futuro no puede saber si se consideraron opciones y por qué se descartaron.

**Solución:** al menos 2 alternativas consideradas, incluso si son obvias. Si realmente no había alternativa, escribir *"No se consideraron alternativas porque {{razón}}"*.

### Anti-patrón 3 — Consecuencias solo positivas

El ADR lista solo beneficios. No hay trade-offs. Señal de análisis incompleto o justificación post-hoc.

**Solución:** forzar al menos 1 trade-off honesto. Toda decisión arquitectónica tiene costos — si no se ven, no se analizaron.

### Anti-patrón 4 — Sin patrones del framework

El ADR no menciona qué patrones del framework aplica o contradice. Queda desconectado del corpus conceptual.

**Solución:** enlazar al menos 1 patrón relevante. Si la decisión no conecta con ningún patrón del framework, quizás no es decisión arquitectónica sino operativa.

---

## Relación con ADRs completos

- **Template mínimo:** este archivo — para decisiones acotadas
- **Template completo:** [`template-adr-completo.md`](template-adr-completo.md) — para decisiones transversales

Ambos producen ADRs válidos. La diferencia es el nivel de detalle requerido por el impacto de la decisión.

---

## Cómo escribir buenos ADRs

Ver [`00-README-como-escribir-adr.md`](00-README-como-escribir-adr.md) para guía completa sobre cuándo crear un ADR, cómo redactarlo y cómo integrarlo al flujo del equipo.

---

*Para el patrón que fundamenta los ADRs como componente del Exocórtex, ver [`03-patrones/c3-exocortex-memoria-activa.md`](../../03-patrones/c3-exocortex-memoria-activa.md).*
