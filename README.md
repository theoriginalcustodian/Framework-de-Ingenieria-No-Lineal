# Ingeniería No Lineal — V5

> *"El problema con la ingeniería lineal no es que sea lenta.
> El problema es que asume que la única forma de escalar el impacto es escalar el headcount."*

---

## ¿Qué es esto?

Un repositorio de conocimiento sobre una forma de construir software donde el cuello de botella no es el tamaño del equipo.

No es un framework con dependencias. No tiene un `npm install` que te salve.
Es un conjunto de principios, patrones y protocolos destilados de ciclos reales de construcción — donde un arquitecto trabajando con agentes IA y este framework produjo un sistema de complejidad enterprise en un ciclo comprimido. Las métricas están documentadas en [`05-evidencia/`](05-evidencia/), no extrapoladas.

El punto central no es la velocidad. Es esto:

**Construir sistemas que no te necesiten para sobrevivir.**

---

## El problema real

La ingeniería de software tradicional tiene un fallo filosófico fundacional que pocos nombran en voz alta:

> Te convierte en el eslabón más frágil de tu propio sistema.

Sos el que tiene que estar despierto cuando falla el proveedor.
Sos el que recuerda por qué se tomó esa decisión hace seis meses.
Sos el soporte vital. La alerta de las 3am. El contexto que no está escrito en ningún lado.

Y una fracción significativa de tu tiempo no es trabajo — es fricción disfrazada de trabajo:

- Leer documentación porque asumiste mal una API
- Debuggear el mismo error en tres lugares distintos
- Reconstruir contexto después de una pausa de 48 horas
- Reuniones para decidir lo que una sola mente ya resolvió en 20 minutos

La **Ingeniería No Lineal** ataca esa fricción de forma sistemática.
No para que trabajes más rápido. Para que puedas **desconectarte**.

---

## La tesis central

```
Arquitectura Enterprise  ×  Agilidad de Fundador  ×  Orquestación de IA
= Resultados desproporcionados al headcount
```

Estas tres variables no se suman — se **multiplican**. Cuando convergen, el ratio entre output y personas involucradas deja de encajar en los promedios de la industria.

No es trampa. Es método. Lo que encontrarás en este repositorio es un caso de referencia honesto, con timestamps y métricas verificables — no un estudio estadístico controlado ni una garantía replicable sin contexto.

---

## La promesa real (la que nadie escribe en los frameworks)

Un sistema construido bajo este marco:

- **Recuerda lo que vos vas a olvidar** — la intención arquitectónica vive en el código, no solo en tu cabeza
- **Sana sus propias heridas** — cuando falla un proveedor a las 3am, el sistema empaqueta el problema, lo procesa cuando puede, y vos seguís durmiendo
- **Defiende su propia pureza** — cualquier agente futuro (humano o IA) que intente un atajo choca contra las leyes físicas del diseño original
- **Sobrevive a tu ausencia** — la madurez de un sistema no se mide por "nunca falla", sino por "puedo apagar la computadora e irme sin que colapse"

La velocidad es el medio.
**La paz es el fin.**

---

## Una nota sobre las voces del repositorio

Este repositorio usa tres registros distintos según la sección:

- **Paper académico** en `01-teoria/` y partes de `05-evidencia/` — para fundamentos rigurosos
- **Manifesto** en `04-manifiestos/` — para transmitir la filosofía con densidad
- **Documentación técnica directa** en `03-patrones/`, `07-avances/` y `08-implementaciones-referencia/` — para operar

No es inconsistencia — es intencional. Cada voz acompaña al propósito del documento. Si venís buscando solo uno de los tres registros, la *Ruta de lectura recomendada* te ahorra leer los otros dos.

---

## Cómo está organizado este repositorio

```
ingenieria-no-lineal/
│
├── 01-teoria/                          → El "Por Qué" — Fundamentos y papers
├── 02-framework/                       → El "Qué" — Sistema operativo y protocolos
├── 03-patrones/                        → El "Cómo" — Los 9 patrones canónicos
├── 04-manifiestos/                     → El "Por Qué Importa" — Filosofía aplicada
├── 05-evidencia/                       → El Caso Real — Métricas y datos del ciclo fundacional
├── 06-arquitectura-cognitiva/          → El Exocórtex — Memoria persistente del sistema
├── 07-avances/                         → Hitos maduros del framework
└── 08-implementaciones-referencia/     → Plantillas adoptables (skills, ADRs, CLAUDE.md, system prompts)
```

Las primeras 7 carpetas **explican qué es el framework**. La carpeta `08-` explica **cómo adoptarlo en tu proyecto**.

---

## Quick Start — adopción en ~15 minutos

Si querés operar con el framework sin leer las 7 carpetas primero:

1. **Leer el paper fundacional** (~10 min) → [`01-teoria/paper-ingenieria-no-lineal.md`](01-teoria/paper-ingenieria-no-lineal.md)
2. **Copiar el system prompt** al agente IA de tu proyecto → [`08-implementaciones-referencia/system-prompts/constitucion-agente-inl.md`](08-implementaciones-referencia/system-prompts/constitucion-agente-inl.md)
3. **Adaptar las secciones relevantes** del CLAUDE.md template → [`08-implementaciones-referencia/claude-md-template/CLAUDE-md-user-level-template.md`](08-implementaciones-referencia/claude-md-template/CLAUDE-md-user-level-template.md)
4. **Escribir tu primer ADR** con el template mínimo → [`08-implementaciones-referencia/adrs-template/template-adr-minimo.md`](08-implementaciones-referencia/adrs-template/template-adr-minimo.md)
5. **Iterar** — tras 2-3 semanas de uso, si observás el anti-patrón *"agente propone lineal por default"*, adoptar la [skill meta `framework-self-check`](08-implementaciones-referencia/skills/framework-self-check.md) + su [template de tracking empírico](08-implementaciones-referencia/memory-templates/feedback-tracking-template.md)

Con estos 4 pasos tenés el núcleo del framework operando en tu proyecto. El resto se incorpora cuando la evidencia empírica lo justifique.

Para la ruta completa de adopción, ver [`08-implementaciones-referencia/README.md`](08-implementaciones-referencia/README.md).

---

## Ruta de lectura recomendada

**Si llegaste hoy y no sabés nada de esto:**
```
01-teoria/paper-ingenieria-no-lineal.md
→ 01-teoria/ecuacion-del-outlier.md
→ 02-framework/framework-vision-general.md
→ 02-framework/protocolo-peap-v5-144h.md
```

**Si encontrás un término que no conocés:**
```
GLOSARIO.md  ← definiciones de referencia rápida con links a los documentos fuente
```

**Si ya entendés el paradigma y querés los patrones:**
```
03-patrones/c1-precomputacion-de-dominio.md
→ 03-patrones/a1-adaptador-universal.md
→ 03-patrones/g1-debugging-generadores.md
→ 03-patrones/c3-bidireccional-y-meta-validacion.md
```

**Si querés entender la filosofía antes que los protocolos:**
```
04-manifiestos/muerte-al-hardcoding.md
→ 04-manifiestos/sistemas-autonomos-v5.md
→ 01-teoria/abandono-preparado.md
```

**Si sos escéptico y querés ver el caso real primero:**
```
05-evidencia/genesis-y-metricas-sprint.md
→ 05-evidencia/tablas-datos-empiricos.md
→ 05-evidencia/validacion-empirica-v5.md
→ 05-evidencia/validacion-meta-framework.md
```

**Si querés adoptar el framework en tu proyecto:**
```
08-implementaciones-referencia/README.md
→ 08-implementaciones-referencia/system-prompts/constitucion-agente-inl.md
→ 08-implementaciones-referencia/adrs-template/00-README-como-escribir-adr.md
```

---

## Para quién es esto

Para el dev que siente que trabaja mucho y avanza poco.
Para el fundador técnico que construye solo y necesita que su sistema dure sin él.
Para el arquitecto que ya sabe que más gente no siempre es más velocidad.
Para el estudiante que quiere entender cómo se construyen sistemas reales de grado enterprise.
Para cualquiera que sospecha que hay una forma mejor y quiere ver los números antes de creerlo.

---

## Los 9 patrones canónicos

El framework se articula en 9 patrones, agrupados en tres familias. Cada uno tiene documento dedicado en [`03-patrones/`](03-patrones/).

### Familia A — Arquitectura (defensa estructural)

| Patrón | Tesis |
|---|---|
| **A-1** Adaptador Universal | Encapsular ecosistemas hostiles detrás de un único punto de traducción |
| **A-2** Constraint-Driven Development | Las invariantes viven en la persistencia (RLS, checks), no en la app |
| **A-3** Event-Driven | Desacoplamiento de intención y resultado para sobrevivir fallos parciales |

### Familia C — Cognición (apalancamiento mental)

| Patrón | Tesis |
|---|---|
| **C-1** Pre-Computación del Dominio | Resolver el problema antes de abrir el IDE |
| **C-2** Offloading Cognitivo (CPU/GPU) | El humano diseña intención; la IA ejecuta volumen |
| **C-3 Unidireccional** Exocórtex | La memoria del sistema vive en archivos estructurados, no en la cabeza |
| **C-3 Bidireccional** Meta-Validación | El exocórtex se consulta ANTES de decidir, no solo se escribe DESPUÉS |

### Familia G — Gobernanza (institucionalización prematura)

| Patrón | Tesis |
|---|---|
| **G-1** Debugging de Generadores | ≥3 instancias del mismo síntoma = fix paramétrico al generador, no parches distribuidos |
| **G-2** Gobernanza Día Cero | ADRs, CI/CD, branch protection desde el commit #1, no cuando "hay tiempo" |

---

## Conceptos clave (referencia rápida)

| Concepto | Qué significa |
|---|---|
| **CPU / GPU** | El humano diseña la intención; la IA ejecuta el volumen |
| **Autopoiesis (V5)** | El sistema abstrae matemáticamente su código (Sensor AST) para defender sus leyes endógenamente |
| **Trauma Empaquetado** | Los fallos se encapsulan y se procesan solos, sin despertar a nadie |
| **Exocórtex** | La memoria del sistema vive en archivos estructurados, no en la cabeza del Arquitecto |
| **Exocórtex Bidireccional** | El agente consulta la memoria ANTES de decidir arquitectura — gate pre-decisión, no solo destino de escritura |
| **Implementation-Bias** | Sesgo sistémico del agente IA hacia "implementar ya" cuando la evidencia empírica todavía no justifica el componente |
| **Skill Meta vs Operativa** | Skill meta: invocada por el agente antes de proponer. Skill operativa: invocada por el humano para ejecutar |
| **Abandono Preparado** | El sistema sobrevive estructuralmente a la ausencia de su creador |
| **Canje SRE / Zero-Waste** | Erradicación de deuda técnica diaria apoyando el Grafo Maestro sobre actualización de deltas I/O Cero |
| **Protocolo PEAP-V5** | Ciclo determinista para construir sistemas de grado enterprise |

Ver [`GLOSARIO.md`](GLOSARIO.md) para definiciones extendidas con links a documentos fuente.

---

## Estado del repositorio

El corpus teórico, el inventario de patrones y la capa de adopción están completos.

### Hitos cubiertos

- ✅ **Fundamentos teóricos** — paper, ecuación del outlier, teoría cibernética V5
- ✅ **Los 9 patrones canónicos** — documentados con plantilla consistente
- ✅ **Validación empírica del framework** — caso con baseline medido + post-implementación
- ✅ **Capa adoptable** — plantillas agnósticas en `08-implementaciones-referencia/` (skills, ADRs, system prompts, CLAUDE.md, tracking de memoria)
- ✅ **Evidencia meta-recursiva** — validación del patrón C-3 Bidireccional con métricas reales

### Lo que viene

- 🔲 Casos de implementación por dominio (distinto del dominio fundacional)
- 🔲 Integraciones específicas de stack (Supabase, n8n, Zep, Vercel AI SDK) como guías separadas
- 🔲 Feedback de adoptantes externos para refinar las plantillas de `08-`

Lo deliberadamente ausente (CI/CD templates, ORM templates, skills operativas genéricas) está documentado en [`08-implementaciones-referencia/README.md`](08-implementaciones-referencia/README.md) con las razones.

---

## Contribuciones

Por ahora el repositorio es de lectura.
Cuando abramos contribuciones, el criterio será simple:
si tu aporte reduce fricción y aumenta claridad, entra.
Si agrega complejidad sin valor demostrable, no.

---

## Licencia

MIT — Usalo, modificalo, distribuilo.
Si construís algo con esto, contanos.

---

*Este repositorio no tiene sponsors, no vende cursos y no tiene newsletter.
Solo ideas destiladas de ciclos reales de construcción y un caso documentado que permite evaluarlas honestamente.*
