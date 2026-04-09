# Génesis y métricas del sprint fundacional

> *"Ya está en movimiento."*  
> — Arquitecto, Día 1, 13:44 hs

---

## El acta de nacimiento

El siguiente registro es la prueba más concisa del Patrón C-1 en acción. En menos de 35 minutos, un proyecto pasó de dominio cero a estar en movimiento con una arquitectura completamente definida.

```
[13:10, Día 1] Arquitecto: En una IA de investigación le pedí que busque todos los
endpoints disponibles del servicio externo y que haga un estudio de qué problemas
podíamos resolver para los usuarios con esos servicios...

[13:23, Día 1] Arquitecto: La cosa se resuelve usando todo lo que se puede usar
por endpoints y lo que no, con el motor de automatización de navegador...
en el documento de diseño está detallado todo esto.

[13:39, Día 1] Arquitecto: Ese conocimiento que necesitamos ya está en el
documento... están todas las direcciones del servicio para usar... de hecho el
documento está basado en lo que hay funcionando hoy.

[13:44, Día 1] Socio: Nos tenemos que juntar. Esto se tiene que empezar a mover.

[13:44, Día 1] Arquitecto: Ya está en movimiento.
```

### Lectura del timeline

| Timestamp | Evento |
|---|---|
| 13:10 | Investigación activa finalizada. Documento de dominio producido. |
| 13:23 | Arquitectura técnica definida (Endpoints + automatización de navegador). |
| 13:44 | Sistema en fase de construcción física. |
| — | Dominio de partida: **cero absoluto**. Conocimiento construido en minutos mediante C-1. |
| — | Tiempo de C-1 a ejecución: **34 minutos**. |

---

## Métricas de volumen: lo construido en el sprint fundacional

| Componente | Dimensión |
|---|---|
| Frontend | 13+ módulos operativos, 50+ componentes |
| Motor de persistencia | 19 tablas con RLS, 4 triggers, múltiples funciones RPC |
| Orquestación de backend | 25 flujos en 3 capas arquitecturales auditadas |
| Documentación y gobernanza | 30+ documentos estructurales |
| Líneas de código (estimado) | 15.000 – 25.000 (UI + lógica + SQL) |
| Defectos corregidos | 130+ en auditoría del Día 4 |
| Parches sistémicos aplicados | 215+ en una sola jornada |

---

## Velocidad de progreso: hitos del sprint fundacional

| Hito | Descripción | Estado |
|---|---|---|
| **Día 1** | Investigación de dominio + arquitectura definida | En movimiento |
| **Día 2** | Construcción de versión funcional completa (MVP) | **Funcional** |
| **Día 3** | Despliegue de infraestructura y configuración | Operativo |
| **Día 4** | Auditoría maestra: 215 parches sistémicos aplicados | **Estable** |
| **Día 5** | Automatización de onboarding y smoke tests | Producción técnica |
| **Día 6** | Gobernanza: constitución, IP legal, GitHub Enterprise | **V5 / Maestro** |

Los hitos corresponden a los días de trabajo activo dentro de un sprint calendario de 15 días que incluyó fines de semana, pausas y tiempo de revisión. No fueron 6 días consecutivos — fueron 6 jornadas de construcción intensiva dentro de ese período.

---

## Lectura de los números

El sprint fundacional tomó **15 días calendario** desde la investigación inicial hasta el cierre de gobernanza — incluyendo fines de semana, pausas y días sin trabajo activo.

El factor de aceleración observado respecto al paradigma lineal (equipo de 3-5 desarrolladores):

- **En tiempo de entrega (días calendario):** 8x–12x más rápido que la estimación para un equipo estándar.
- **En persona-días de desarrollo:** más de 20x — 15 días de 1 persona vs los 240+ persona-días que requeriría el paradigma lineal para el mismo sistema.

La causa no es velocidad de tipeo. Es la eliminación sistemática de las fuentes de fricción antes de escribir la primera línea de código — y la separación estricta entre el Arquitecto que decide y la IA que ejecuta volumen.

---

*Para los datos comparativos completos contra el paradigma lineal, ver [`05-evidencia/tablas-datos-empiricos.md`](tablas-datos-empiricos.md).*
