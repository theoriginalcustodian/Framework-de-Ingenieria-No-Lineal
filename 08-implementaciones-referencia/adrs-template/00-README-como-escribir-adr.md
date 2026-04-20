# Cómo escribir buenos ADRs — Guía operativa

> **Los ADRs no son documentación — son Exocórtex**. Su valor se mide en cuánto contexto le ahorran al futuro (humano o IA), no en cuánto texto contienen.

---

## Qué es un ADR y qué NO es

### Qué es

Un **Architecture Decision Record** (ADR) captura una decisión arquitectónica significativa **en el momento en que se toma**, con el contexto fresco, las alternativas consideradas y las consecuencias esperadas.

Implementa el **Patrón C-3 Exocórtex Documental** del framework Ingeniería No Lineal: el costo de documentar una decisión mientras el contexto está activo es cercano a cero. El costo de reconstruirla en 6 meses es 100% del costo original + incertidumbre sobre si la reconstrucción es correcta.

### Qué NO es

- **NO es documentación de código** — la documentación describe cómo funciona algo; el ADR explica por qué fue decidido así
- **NO es post-mortem** — los post-mortems describen incidentes; los ADRs capturan decisiones ex-ante
- **NO es tutorial** — no enseña a usar algo; registra por qué ese algo existe como existe
- **NO es blog post** — no persigue claridad literaria; persigue trazabilidad forense

---

## Cuándo crear un ADR

### Crear ADR cuando

La decisión cumple ≥1 de estas condiciones:

- Afecta cómo se construyen futuros componentes del sistema
- Introduce una convención que otros deberán seguir
- Crea una excepción a una regla existente
- Consolida múltiples decisiones previas en un patrón unificado
- La reversibilidad es baja (cambiar después requiere refactor significativo)
- Alguien razonable en 6 meses preguntará *"¿por qué hicimos X?"*

### NO crear ADR cuando

- Bug fix rutinario (el PR y su descripción son suficientes)
- Refactor trivial (ej. renombre de variable, reorganización de imports)
- Decisión operativa acotada (ej. elección de color en UI)
- Configuración temporal que cambiará en próximas semanas

**La prueba ácida:** *¿alguien en 6 meses va a preguntar "por qué hicimos X"? Si la respuesta es sí, amerita ADR.*

---

## Cuándo usar mínimo vs completo

### Template mínimo — para decisiones acotadas

- Impacto en componente específico, no transversal
- ≤3 alternativas consideradas
- Reversibilidad alta
- Tiempo de redacción: ≤30 minutos

Ejemplos: elección de biblioteca auxiliar, convención de naming de un módulo, fix paramétrico sobre un generador identificado.

Ver [`template-adr-minimo.md`](template-adr-minimo.md).

### Template completo — para decisiones transversales

- Impacto en arquitectura global o múltiples capas
- ≥3 alternativas con trade-offs no triviales
- Reversibilidad baja
- Introduce patrón nuevo o consolida anti-patrones
- Tiempo de redacción: 45-90 minutos

Ejemplos: adopción de nuevo patrón, cambio de estrategia de persistencia, introducción de nuevo agente IA, consolidación de N casos empíricos.

Ver [`template-adr-completo.md`](template-adr-completo.md).

### Regla de elección

Si dudás entre mínimo y completo → usar **mínimo primero**. Si durante la redacción descubrís que no cabe, escalá a completo. Nunca al revés — empezar con completo y "recortar" produce ADRs artificialmente detallados.

---

## Nomenclatura de archivos

Formato canónico recomendado:

```
{{YYYY-MM-DD}}_ADR-{{NNN}}_{{slug-descriptivo}}.md
```

Ejemplos:
- `2026-04-19_ADR-001_skill_resolve_issue_framework_no_lineal.md`
- `2026-04-20_ADR-006_meta_validacion_agente.md`
- `2026-05-02_ADR-012_migracion_esquema_multi_tenant.md`

El número `ADR-NNN` es **secuencial y nunca se reusa** (aunque el ADR sea rechazado). Si ADR-003 fue rechazado, el siguiente es ADR-004, no "ADR-003 versión 2".

---

## Status semántico

Un ADR puede estar en uno de estos estados:

| Status | Significado |
|---|---|
| **PROPUESTA** | Escrito pero no discutido/aprobado aún. Tiempo máximo en este estado: 2 semanas. Después → ACEPTADA o RECHAZADA. |
| **ACEPTADA** | Discutido y en vigor. Es la verdad del proyecto hasta ser supersedido. |
| **SUPERSEDED** | Reemplazado por otro ADR más reciente. Linkear cuál lo supersede. NO eliminar — conservar para trazabilidad. |
| **RECHAZADA** | Discutido y NO adoptado. Útil conservar para futuros debates que reconsideren el tema. |

### Por qué conservar RECHAZADA y SUPERSEDED

Los ADRs rechazados y supersedidos son **memoria institucional**. Cuando alguien propone la misma idea 8 meses después, el ADR rechazado explica por qué se consideró y descartó. Evita re-debates estériles.

Es la diferencia entre un proyecto que aprende de sí mismo y uno que olvida sus propias decisiones.

---

## Estructura de un buen ADR

Los ADRs efectivos comparten rasgos independientemente del template:

### 1. Contexto con evidencia empírica

Un ADR sin evidencia empírica es aspiracional. Un ADR con casos concretos es forense.

Bueno: *"Durante la sesión 19-04, observamos 2 casos donde el agente propuso Plan v1 lineal y requirió intervención humana para re-evaluar (PR #204, ADR-005)."*

Malo: *"Existe un problema donde el agente a veces no aplica bien el framework."*

### 2. Decisión en prosa clara

La decisión debe ser entendida en una lectura. Si requiere re-lectura, está mal escrita.

Bueno: *"Introducir una skill `/framework-self-check` invocable por el propio agente antes de proponer arquitectura al humano."*

Malo: *"Mejorar la integración del agente con el framework a través de mecanismos de validación."*

### 3. Alternativas honestas

Listar solo las alternativas genuinamente consideradas. Con razón de rechazo específica, no *"no era lo ideal"*.

Bueno: *"Rechazada porque requeriría infraestructura externa (hooks del LLM provider) no disponible en el stack actual."*

Malo: *"Rechazada porque tenía algunos problemas."*

### 4. Trade-offs explícitos

Toda decisión arquitectónica tiene costos. Un ADR sin trade-offs es auto-engaño.

Bueno: *"Agregar self-check aumenta latencia de respuesta ~15-30s por propuesta arquitectónica. Trade-off aceptado vs. 5-10 min de intervención humana para reconducir."*

Malo: *"No se identifican trade-offs significativos."*

### 5. Seguimiento verificable

Criterios concretos de revisión futura.

Bueno: *"Evaluar en 3 meses. Si ratio de auto-invocación es <50%, replantear diseño (considerar Alt 3 descartada)."*

Malo: *"Revisar cuando sea apropiado."*

---

## Integración con el flujo de trabajo

### Cuándo escribir el ADR

Los ADRs se escriben **en el momento de la decisión**, no después. El contexto fresco es la materia prima — después se pierde.

Patrones efectivos observados:

1. **Durante sesiones intensivas:** cuando emerge una decisión arquitectónica, pausar 20-30 min para escribir ADR antes de continuar con implementación
2. **Al inicio de implementación de patrón nuevo:** escribir ADR como parte del C-1 (Pre-Computación) antes de codificar
3. **Post-incidente crítico:** si el incidente revela necesidad de nuevo patrón, escribir ADR inmediatamente (no esperar a "post-mortem al final del sprint")

### Revisión obligatoria

Cada ADR **debe ser revisado** por al menos otro agente (humano o IA) antes de pasar a ACEPTADA. La revisión verifica:

- ¿Las alternativas listadas fueron genuinamente consideradas?
- ¿Los trade-offs son honestos y completos?
- ¿El seguimiento es verificable?
- ¿La decisión conecta con patrones existentes del framework?

### Integración con el Exocórtex

Los ADRs aceptados deben:

1. **Linkearse desde el INDICE_MAESTRO.md** del proyecto
2. **Ingestarse al Grafo Maestro** (Zep, Graphiti u otro) para consulta semántica
3. **Referenciarse desde la Constitución Técnica** si establecen convenciones

Sin integración, los ADRs son archivos aislados que nadie consulta.

---

## ADRs en Ingeniería No Lineal

En un proyecto bajo INL, los ADRs cumplen un rol específico dentro del framework:

- **Expresión escrita del Exocórtex (C-3)** — el repositorio de decisiones que sobrevive al Arquitecto
- **Aplicación del C-3 Bidireccional** — los ADRs previos se consultan antes de nuevas decisiones, no solo se escriben
- **Manifestación de G-2 (Gobernanza Día 0)** — existen desde el primer sprint, no se agregan tardíamente
- **Consolidación de G-1 (Generadores)** — cuando un patrón sistémico se identifica, se captura en ADR

Un proyecto INL maduro tiene 20-50 ADRs acumulados después de 6 meses de desarrollo. Cada uno es un fragmento del razonamiento colectivo del proyecto.

---

## Anti-patrones a evitar

### Anti-patrón 1 — ADRs post-hoc

Escribir ADRs después de que las decisiones ya fueron tomadas e implementadas. El contexto se perdió; el ADR es ficción racional.

**Solución:** disciplina de escritura en el momento. Si una decisión requiere ADR y no hay tiempo para escribirlo, la decisión no está tomada — es prototipo.

### Anti-patrón 2 — ADRs sin impacto

Se escriben ADRs para decisiones triviales que no ameritan. Ruido documental que degrada el valor del resto.

**Solución:** aplicar la prueba ácida. Si nadie preguntará *"por qué hicimos X"* en 6 meses, no es ADR.

### Anti-patrón 3 — ADRs sin seguimiento

Se acumulan PROPUESTAS que nunca pasan a ACEPTADA ni RECHAZADA. El estado queda en limbo indefinido.

**Solución:** cada PROPUESTA tiene fecha de resolución. Inacción → RECHAZADA automática.

### Anti-patrón 4 — ADRs que no se consultan

Los ADRs existen, están ingestados, pero nadie los lee cuando toma decisiones nuevas. El Exocórtex opera unidireccional (escritura sin consulta).

**Solución:** implementar patrón C-3 Bidireccional — el agente consulta ADRs relevantes antes de proponer decisiones nuevas. Ver [`../skills/framework-self-check.md`](../skills/framework-self-check.md).

### Anti-patrón 5 — ADRs verbosos

Se escriben ADRs de 15 páginas para decisiones que ameritan 1 página. Nadie los termina de leer.

**Solución:** defaultear a template mínimo. Escalar a completo solo cuando el impacto justifica la inversión de redacción.

---

## Checklist de calidad de un ADR

Antes de marcar un ADR como ACEPTADA, verificar:

- [ ] Título descriptivo (no "decisión sobre X" sino "Adoptar patrón Y para caso Z")
- [ ] Status y fecha claros
- [ ] Contexto incluye ≥1 caso empírico concreto
- [ ] Decisión formulada en prosa entendible en 1 lectura
- [ ] ≥2 alternativas consideradas con razón específica de rechazo
- [ ] ≥1 trade-off honesto en Consecuencias Negativas
- [ ] ≥1 patrón del framework aplicado o referenciado
- [ ] Seguimiento con criterios verificables y horizonte temporal
- [ ] Referencias a PRs / issues / otros ADRs relevantes
- [ ] Revisado por al menos 1 agente distinto al autor

---

## Relación con el resto del framework

- **Patrón C-3 Exocórtex:** los ADRs son la forma canónica de materializar el C-3 original (ver [`../../03-patrones/c3-exocortex-memoria-activa.md`](../../03-patrones/c3-exocortex-memoria-activa.md))
- **Patrón C-3 Bidireccional:** los ADRs previos se consultan antes de nuevas decisiones (ver [`../../03-patrones/c3-bidireccional-y-meta-validacion.md`](../../03-patrones/c3-bidireccional-y-meta-validacion.md))
- **Patrón G-2 Gobernanza Día 0:** los ADRs se institucionalizan desde el primer sprint (ver [`../../03-patrones/g2-gobernanza-dia-cero.md`](../../03-patrones/g2-gobernanza-dia-cero.md))
- **Manifiesto Muerte al Hardcoding:** los ADRs eliminan el hardcoding cognitivo — las decisiones no viven en la cabeza del Arquitecto

---

*Templates disponibles: [`template-adr-minimo.md`](template-adr-minimo.md) y [`template-adr-completo.md`](template-adr-completo.md).*
