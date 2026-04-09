# El Grafo Maestro
## Exocórtex persistente para Ingeniería No Lineal

> *"El objetivo no es un repositorio de chats. El objetivo es un grafo que entienda cómo pensás, cómo evolucionaron tus decisiones y pueda representarte ante cualquier IA en 30 segundos, eliminando la fricción de re-explicar tu arquitectura en cada sesión."*

---

## La pregunta que lo define todo

Existe una diferencia entre el médico de guardia y tu médico de cabecera de diez años.

El médico de guardia lee tu ficha en dos minutos y te atiende. Es competente. Pero no sabe que la última vez que probaste ese antibiótico te fue mal, ni que tomaste esa decisión de no operar por razones que tienen contexto, ni dónde estás en el tratamiento largo que empezamos juntos hace meses. Cada visita empieza casi desde cero.

Tu médico de cabecera no necesita que le expliques nada. Sabe cómo pensás, recuerda qué decidimos y por qué, y sabe exactamente dónde estamos hoy.

El Grafo Maestro convierte cualquier agente nuevo en tu médico de cabecera.

Sin él, cada sesión nueva con una IA es el médico de guardia — competente, pero sin contexto. El Arquitecto re-explica el stack, los principios, las decisiones críticas, la fase del proyecto. Ese ritual repetido es el **Hardcoding Cognitivo**: el cuarto tipo de hardcoding letal, el más costoso porque se paga en el recurso más escaso — el foco.

Para que un agente actúe como si hubiera trabajado con vos los últimos seis meses, necesita saber exactamente tres cosas:

- **Cómo pensás** — tus leyes y principios
- **Por qué pensás así** — la historia de tus decisiones
- **Dónde estás ahora** — el estado actual del trabajo

Ni una más. Y de estas tres cosas deriva todo el diseño del sistema.

---

## Lo que vive en el grafo

El grafo no almacena texto. Almacena conocimiento estructurado en tres categorías con propósitos y ciclos de vida distintos.

```
[ HISTORIA ] ──aprende──→ [ LEYES ]
      │
 contextualiza
      ↓
[ ESTADO ]
```

Las LEYES aprenden de la HISTORIA — un trauma documentado puede generar una nueva restricción universal. La HISTORIA contextualiza el ESTADO — el estado actual del proyecto solo tiene sentido con el historial de decisiones que lo llevó ahí. Esta es la diferencia entre un repositorio de documentos y un grafo vivo.

### LEYES — lo inmutable

Son los patrones, principios y restricciones que siempre son verdad en tu forma de trabajar. No cambian con el proyecto ni con el tiempo. Son la Constitución cognitiva del Arquitecto.

Pertenecen aquí los patrones operativos activos — C-1, A-1, G-2, A-4 — junto con los principios que los fundan: "la verdad reside donde no puede ser sobornada", "el fallo es un estado orgánico". También las restricciones que nunca se negocian: "nunca acoplar directamente con un tercero sin Adaptador", "RLS activo desde el primer registro".

Cuando una restricción reemplaza a otra — porque la práctica demostró que la anterior era incompleta — la relación `[EVOLUCIONÓ_A]` preserva la historia del cambio. Las LEYES no son estáticas: son las más estables, pero aprenden.

Un agente que conoce las LEYES sabe cómo debería pensar el Arquitecto ante cualquier situación nueva que todavía no ocurrió.

### HISTORIA — lo evolutivo

Son las decisiones tomadas con su razonamiento y contexto temporal. No solo el qué — fundamentalmente el **por qué** y el **cuándo**. Los aprendizajes destilados de fallos reales. Los traumas documentados con su cura.

Pertenecen aquí las decisiones arquitectónicas con razonamiento explícito — "elegimos SQL sobre documental porque la naturaleza relacional de los tenants hacía imposible garantizar aislamiento sin RLS nativo" — los aprendizajes destilados de fallos — "la IA tiende al Happy Path sin restricciones XML" — y los traumas catalogados con diagnóstico — "el timeout del proveedor Y en alta carga no es recuperable sincrónicamente: requiere DLQ obligatoria".

La HISTORIA captura la **temporalidad** — cómo evolucionó el pensamiento. Un agente que la conoce no solo sabe qué decidiste — sabe por qué, y puede razonar con ese contexto ante situaciones análogas futuras que todavía no existen.

### ESTADO — lo efímero

Es donde estás ahora. Cambia cada jornada y define la agenda inmediata.

Pertenecen aquí la fase del ciclo activo — "Día 4, La Poda, conectando servicios reales" — las últimas decisiones del sprint en curso, los pendientes para el próximo ciclo asíncrono y la deuda técnica catalogada. El ESTADO es efímero por diseño: cuando el proyecto avanza de fase, el ESTADO anterior se convierte en HISTORIA.

Un agente que conoce el ESTADO sabe qué hacer ahora, sin preguntar.

### La simetría que lo hace funcionar

Las tres categorías no son una taxonomía arbitraria. Son isomórficas con el ciclo operativo completo — la misma estructura que organiza el grafo organiza el Handshake de apertura y el Delta de cierre:

| | Handshake — consulta al abrir | Delta — pregunta al cerrar |
|---|---|---|
| **LEYES** | ¿Cuáles son los patrones activos y restricciones vigentes? | ¿Cambió o apareció alguna ley? |
| **HISTORIA** | ¿Qué decisiones críticas tomamos y qué aprendimos? | ¿Tomamos una decisión con razonamiento explícito? |
| **ESTADO** | ¿En qué fase estamos y cuáles son los pendientes? | ¿Cambió el estado del proyecto? |

La misma estructura que ingresa al grafo es la que sale en el Handshake y la que se actualiza en el Delta. Cero impedancia cognitiva entre las tres operaciones del sistema.

---

## Cómo se alimenta

### El bootstrap — cómo nace el grafo

El grafo nace en el Día 1, no antes.

Antes del Día 1 no hay nada concreto que ingestar — solo ideas vagas y suposiciones sin evidencia. Es el Día 1 del PEAP-V5 el que produce los dos documentos semilla que dan vida al grafo por primera vez:

| Documento semilla | Categoría que puebla | Qué aporta |
|---|---|---|
| `CONSTITUCION.md` | LEYES | Patrones activos, principios fundacionales, restricciones inmutables del proyecto |
| `REGLAS_NEGOCIO.md` | HISTORIA | Decisiones de dominio, puntos hostiles identificados, alternativas descartadas durante el C-1 |
| Fase: Día 1 completado | ESTADO | Punto de partida del ciclo — el grafo sabe en qué día del protocolo está |

Después del bootstrap, el primer Handshake del Día 2 ya tiene algo concreto que responder. El grafo no está lleno — está **sembrado**. La diferencia importa: sembrado significa que puede crecer con cada Delta, no que ya contiene todo el conocimiento.

El bootstrap es, técnicamente, la primera ejecución del Delta — pero en dirección inversa. Normalmente el Delta parte de una sesión de trabajo y produce ingesta. El bootstrap parte de los documentos del Día 1 y produce el estado inicial del grafo.

A partir del Día 2, el grafo crece por acumulación de Deltas. Cada sesión significativa lo hace más preciso, más completo, más capaz de representar al Arquitecto.

### El criterio de filtrado

Una sola pregunta decide si algo entra al grafo:

> **¿Cambiaría cómo un agente futuro tomaría una decisión arquitectónica?**

Si la respuesta es sí, entra. Si no, no entra. Este criterio elimina el ruido operativo — la charla cotidiana, el código rutinario, los detalles de implementación — y preserva el conocimiento que tiene valor estructural duradero.

### Las cinco fuentes

| Fuente | Qué aporta | Categoría |
|---|---|---|
| Conversaciones estratégicas con IA | Arquitecturas definidas, problemas resueltos con razonamiento | HISTORIA |
| Documentación constitucional | Manifiestos, reglas de negocio, constitución técnica | LEYES |
| Logs de decisión | Por qué se tomó un camino y qué alternativas se descartaron | HISTORIA |
| Post-mortems de aprendizaje | El fallo y su cura van a HISTORIA. Si además revelan una restricción universal nueva, también a LEYES | HISTORIA + LEYES |
| Estado del ciclo activo | Fase PEAP-V5, pendientes, deuda técnica catalogada | ESTADO |

### El principio de privacidad

El grafo contiene el **CÓMO** y el **QUÉ** arquitectónico, no el **QUIÉN** biográfico.

Nunca ingresar identificadores personales, secretos de infraestructura ni datos sensibles de clientes. Siempre anonimizar el contexto específico y preservar la restricción técnica que reveló. "El cliente del rubro fintech tenía esta limitación de autenticación" se convierte en "en sistemas de pagos con autenticación PKI, la restricción X requiere el Adaptador Y". El aprendizaje sobrevive. La identidad, no.

---

## El ciclo: leer y escribir

El Grafo Maestro tiene exactamente dos operaciones. Una al abrir, una al cerrar.

---

### LEER — el Handshake cognitivo

Al iniciar cualquier sesión de trabajo con un agente, se ejecutan las tres consultas de la tabla anterior en secuencia — LEYES, HISTORIA, ESTADO. El agente sintetiza las respuestas y confirma alineación antes de recibir la primera instrucción.

Una respuesta de alineación bien formada suena así:

> *"Entendido. Operando bajo Ingeniería No Lineal V5. Reconozco que estamos en el Día 4 — La Poda. Las leyes activas incluyen RLS obligatorio, Adaptadores Universales para todos los terceros y auditoría de patrones antes de parches individuales. El aprendizaje más reciente indica que el proveedor Z requiere DLQ por sus timeouts en alta carga. Los pendientes prioritarios son conectar el módulo de pagos al servicio real y auditar los 3 módulos con perímetro incompleto. ¿Iniciamos por la auditoría o por la conexión?"*

Ese es el médico de cabecera. Treinta segundos. Cero re-explicación.

---

### ESCRIBIR — el Delta cognitivo

Al cerrar una sesión significativa, las tres preguntas de la tabla determinan qué persiste:

**¿Cambió alguna ley?**
¿Descubrimos una nueva restricción? ¿Un patrón se refinó? ¿Una regla que creíamos fija demostró tener una excepción? Si sí — actualizar LEYES.

**¿Tomamos una decisión con razonamiento explícito?**
¿Elegimos entre alternativas con criterios claros? ¿Un fallo reveló un aprendizaje generalizable? ¿Un trauma quedó catalogado con su cura? Si sí — agregar a HISTORIA.

**¿Cambió el estado del proyecto?**
¿Avanzamos de fase? ¿Surgieron pendientes nuevos? ¿La deuda técnica cambió? Si sí — actualizar ESTADO.

Sin el Delta, el Grafo es una fotografía — captura el momento de creación pero no evoluciona. Con el Delta, es un organismo vivo: la experiencia de hoy se convierte en el conocimiento institucional que guía las decisiones de mañana. Es el loop de retroalimentación que distingue un sistema que aprende de uno que simplemente persiste.

Una sesión sin delta en ninguna categoría fue rutinaria — válida, pero no requiere ingesta. Una sesión con delta en las tres fue fundacional.

---

## El lugar del Grafo en el ecosistema

El Grafo Maestro no reemplaza los documentos de este repositorio — los anima. Los documentos son estáticos: capturan el conocimiento en el momento de su redacción. El Grafo es dinámico: captura cómo ese conocimiento evoluciona en la práctica real de cada proyecto.

Hay una distinción importante con [`03-patrones/directivas-xml-agentes.md`](../03-patrones/directivas-xml-agentes.md): ese documento define el **formato** del Handshake — la estructura genérica que inicializa cualquier agente. El Grafo Maestro define el **contenido** del Handshake — el contexto específico, vivo y actualizado del proyecto concreto. Son complementarios: uno es la forma, el otro es la materia que la llena.

> **Implementaciones de referencia:** Zep Cloud y Graphiti soportan nativamente la bitemporalidad y las relaciones semánticas tipadas que este patrón requiere. Cualquier motor de grafo de conocimiento temporal es una implementación válida.

---

*Los otros documentos de este repositorio describen cómo construir sistemas que no te necesitan para sobrevivir. Este describe cómo construir la memoria que hace posible que cualquier agente te represente fielmente — incluso ante situaciones que todavía no ocurrieron.*
