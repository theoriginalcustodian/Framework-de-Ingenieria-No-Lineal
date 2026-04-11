# El Agente Reparador Autónomo — Nivel L5

> *"El techo de madurez de un sistema no es que nunca falle. Es que cuando falla, sepa cómo curarse solo sin despertar a nadie."*

---

## Contexto: La Cadena de Supervivencia L0–L4

Un sistema V5 implementa niveles de resiliencia progresivos ante el fallo. En el estado del arte previo a esta arquitectura, la cadena operaba en cinco niveles:

```
L0 — Tolerancia al fallo        → el proceso no muere ante el primer error
L1 — Persistencia del trauma     → el error se almacena en la capa de datos
L2 — Notificación activa         → el operador humano es informado
L3 — Ticketing estructurado      → se genera un registro de incidente formal
L4 — Reintento automático (DLQ) → la transacción fallida se reinyecta sola
```

**L0 a L4 aseguran que el sistema sobrevive y que el humano se entera.**

El gap no resuelto: la **corrección del código subyacente** que causó el error sigue siendo 100% manual. Un ingeniero lee el issue, abre el IDE, escribe el fix, abre el Pull Request y espera revisión. Este ciclo es fricción estructural pura — trabajo humano gastado en tareas que son, por naturaleza, delegables.

**L5 — Auto-Reparación Cognitiva** cierra ese gap.

---

## La Arquitectura del Agente L5

El Agente Reparador Autónomo es un componente cognitivo que opera como extensión del pipeline de errores. Su misión es única y acotada:

> **Leer el incidente → Diagnosticar la causa raíz → Escribir el parche → Abrir el Pull Request.**

El humano conserva la decisión del merge. Siempre.

### El Principio de Escritura Cero en Grafos

El agente opera sobre tres fuentes de conocimiento independientes en **modo lectura exclusiva**:

| Fuente | Qué contiene | Rol en el diagnóstico |
|---|---|---|
| **Grafo de topología** | Arquitectura del sistema — qué componente invoca a cuál, qué tablas lee o escribe, qué reglas lo gobiernan | Mapa de impacto: entiende qué toca el nodo fallido antes de escribir una línea |
| **Grafo de errores** | Historial de incidentes — patrones de fallo anteriores, traumas catalogados, soluciones que funcionaron | Memoria histórica: si este error ya ocurrió antes, el agente conoce la cura documentada |
| **Grafo de operador** | Conversaciones y diagnósticos previos con el Centinela Cognitivo | Contexto humano: si el operador ya reportó algo relacionado, el agente lo considera |

**El único output del agente es un Pull Request.** Nunca escribe directamente en los grafos, nunca mergea, nunca modifica credenciales ni variables de entorno.

---

## El Grafo de Topología como Prerequisito

El componente más crítico — y el que debe existir antes de cualquier otra pieza — es el **grafo de topología del sistema**.

Este grafo no es documentación: es el modelo mental del sistema representado como conocimiento estructurado y consultable. Contiene:

- **Nodos de tipo Workflow / Proceso:** cada componente del sistema como entidad
- **Nodos de tipo Tabla / Persistencia:** cada recurso de datos como entidad
- **Nodos de tipo Regla:** las restricciones arquitectónicas como entidades consultables
- **Edges tipados:** `INVOCA`, `LEE_DE`, `ESCRIBE_EN`, `GOBERNADO_POR`, `DISPARA_EN`

Cuando el agente recibe un incidente sobre el componente X, su primera acción es consultar el grafo de topología:

```
search_topology_graph("componente-X")
→ Descubre: X invoca al sub-proceso Y
→ Descubre: X lee de la tabla T1 y escribe en T2
→ Descubre: X está gobernado por la Regla R3
```

Sin este mapa, el agente diagnostica en el vacío. Con él, entiende el impacto sistémico antes de proponer una solución.

### Sincronización como Ley Física

El grafo de topología se desincroniza cada vez que el código evoluciona. Este es el riesgo mayor de la arquitectura.

La solución es estructural: una **acción automatizada post-merge** que reingesta el grafo con los cambios del Pull Request aprobado. El ciclo queda cerrado:

```
Merge → Acción automática → Re-ingesta del grafo → Topología actualizada
```

Sin este cierre, el agente podría diagnosticar basándose en una arquitectura que ya no existe.

---

## El Pipeline de Ejecución (8 Nodos)

El agente sigue un grafo de ejecución determinista — no un razonamiento libre. Cada nodo tiene una responsabilidad acotada:

```
Node 1: CARGAR_CONTEXTO
    → Lee el incidente: stack trace, fingerprint, componente afectado

Node 2: MAPEAR_ARQUITECTURA
    → Consulta el grafo de topología
    → Determina impacto sistémico y reglas que gobiernan el componente

Node 3: BUSCAR_HISTORIAL
    → Consulta el grafo de errores
    → ¿Este patrón de fallo ya ocurrió? ¿Hay una solución documentada?

Node 4: DIAGNOSTICAR
    → Genera hipótesis de causa raíz basadas en evidencia instrumental
    → Prohibido: razonamiento abductivo sin evidencia de herramientas

Node 5: GENERAR_FIX
    → Escribe el parche de código

Node 6: VALIDAR_FIX
    → Verifica que el parche no viola ninguna regla GOBERNADO_POR del grafo
    → Si viola: vuelve a Node 5 (max 5 iteraciones)

Node 7: PUBLICAR_PR
    → Crea rama fix/incidente-{N}
    → Abre Pull Request con diagnóstico completo como descripción

Node 8: NOTIFICAR
    → Comenta en el incidente con el diagnóstico y link al PR
    → Actualiza el estado del registro en la capa de datos
```

### Salvaguarda Anti-Bucle

El agente nunca puede quedar atrapado en un ciclo infinito. Las restricciones son físicas:

- **Máximo 5 iteraciones** por nodo antes de escalar
- **AbortSignal** a los 7m30s — retorna confirmación al llamante antes del timeout
- **Si no converge:** comenta en el incidente con "Requiere intervención manual" y cierra el ciclo en estado `descartado`

---

## Las Líneas Rojas (Zero-Violation Policy)

Las siguientes restricciones no son configurables ni negociables. Son la ley física del agente:

1. **Jamás merge directo** — el humano aprueba siempre
2. **Jamás push a la rama principal** — solo a ramas `fix/incidente-{N}`
3. **Jamás modificar credenciales o variables de entorno**
4. **Jamás ignorar una regla `GOBERNADO_POR`** del grafo de topología
5. **Jamás más de 5 iteraciones** — si no converge, escala
6. **Jamás operar sin evidencia instrumental** — cada conclusión tiene una herramienta que la respalda

El Principio IV de Gobernanza Prematura se aplica aquí en su forma más estricta: el HITL (Human-in-the-Loop) no es una preferencia de diseño. Es la barrera estructural final e inviolable del sistema.

---

## El Catálogo de Herramientas (10 Tools)

Las herramientas del agente se dividen en tres categorías con permisos distintos:

### Herramientas de Contexto (5 — solo lectura)
1. `search_topology_graph` — consulta el grafo de topología
2. `search_error_graph` — consulta el historial de errores
3. `get_incident` — lee el incidente desde el sistema de tracking
4. `list_related_incidents` — busca incidentes similares
5. `query_errors_table` — consulta directa a la capa de datos (SELECT only)

### Herramientas de Diagnóstico (3 — solo lectura)
6. `read_workflow_definition` — lee la definición del proceso afectado
7. `read_source_file` — lee el código fuente del componente
8. `list_directory` — navega la estructura del repositorio

### Herramientas de Escritura (2 — produce PR, no merge)
9. `create_fix_branch` — crea la rama `fix/incidente-{N}`
10. `submit_pull_request` — abre el Pull Request con el parche

---

## Ciclo de Vida Completo de un Incidente: L0 → L5

```
[T+00s] Componente falla → excepción capturada
           │
[T+01s] L0: tolerancia al fallo → el proceso continúa
           │
[T+02s] L1: INSERT en la tabla de errores (con fingerprint de deduplicación)
           │
[T+03s] L2: notificación al operador (Slack / email)
           │
[T+05s] L3: Issue creado automáticamente en el sistema de tracking
           │    Labels: [bug, auto-detectado, capa-{N}]
           │
[T+06s] L5: HTTP POST → Agente activado
           │    Payload: { incidente_id, fingerprint, componente }
           │
[T+60s] → Node 2: el grafo de topología confirma el impacto sistémico
[T+120s] → Node 3: el historial revela un error similar resuelto antes
[T+240s] → Node 5-6: parche generado y validado contra las reglas del grafo
[T+420s] → Node 7: rama creada + PR abierto automáticamente
           │
[T+27900s] Operador humano revisa → Aprueba → Merge
           │
           └─→ Acción automática → Re-ingesta del grafo de topología
```

**Tiempo de intervención humana:** ~5 minutos de revisión. El resto es autonomía del sistema.

---

## Roadmap de Implementación

La arquitectura se construye en fases secuenciales con dependencias estrictas. Saltear una fase no ahorra tiempo — lo destruye en las posteriores.

| Fase | Componente | Dependencia |
|---|---|---|
| **F1** | Ingesta del grafo de topología en el motor de conocimiento | Ninguna — es el prerequisito de todo |
| **F2** | Evolución del pipeline de errores con los 3 pasos nuevos (tracking → acción automática) | F1 completada |
| **F3** | Esqueleto del agente (API + LangGraph + herramientas de lectura) | F2 completada |
| **F4** | Herramientas de escritura (branch + PR) | F3 completada |
| **F5** | Acción automática de sincronización post-merge | F4 completada |
| **F6** | Smoke test E2E + documentación operativa | F5 completada |

**El único prerequisito no negociable es F1.** El agente puede operar sin PR automático (F4), pero no puede operar sin el mapa de topología del sistema.

---

## Relación con el Framework

El Agente Reparador Autónomo es la implementación más completa de la capa de resiliencia del framework:

| Patrón | Manifestación en el Agente |
|---|---|
| **A-4 — Trauma Empaquetado** | El pipeline L1-L3 empaqueta el error; el agente L5 lo desempaqueta y lo cura |
| **C-4 — Memoria Bitemporal** | El agente opera sobre grafos diferenciados (topología vs. historial), sin contaminar contextos |
| **C-5 — ReAct Zero-Trust** | El agente nunca concluye sin evidencia instrumental — cada hipótesis tiene una herramienta que la valida |
| **G-2 — Gobernanza Día 0** | El HITL es gobernanza inviolable: el humano aprueba el merge, siempre |
| **Abandono Preparado** | El sistema detecta, diagnostica, parchea y actualiza su propio grafo — sin intervención humana en el flujo |

---

*Este documento es el primer avance de la capa de implementación. Para los patrones teóricos que lo fundamentan, ver [`02-framework/patrones-auto-healing.md`](../02-framework/patrones-auto-healing.md) y [`01-teoria/abandono-preparado.md`](../01-teoria/abandono-preparado.md).*
