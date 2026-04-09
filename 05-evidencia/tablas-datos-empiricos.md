# Tablas de datos empíricos

> El 65% del tiempo de un desarrollador promedio es fricción disfrazada de trabajo.

---

## Tabla 1: el costo real del overhead de coordinación

La investigación en dinámica de equipos demuestra que un equipo de 5 personas no produce 5x más que una persona sola — produce entre 1.5x y 2.5x más. Los costos de coordinación absorben la diferencia.

| Costo de coordinación | Tiempo típico (equipo de 5) |
|---|---|
| Reuniones de sprint planning | 2–4 horas / semana |
| Revisión de pull requests ajenos | 3–5 horas / semana |
| Resolución de conflictos de merge | 1–3 horas / semana |
| Comunicación de decisiones de arquitectura | 2–4 horas / semana |
| Reconstrucción de contexto tras interrupciones | 30–60 min / interrupción |
| **Total estimado de overhead** | **8–16 horas / persona / semana** |

### Cálculo de throughput real

| Perfil | Horas brutas | Horas productivas |
|---|---|---|
| Equipo de 5 personas | 200 h | 160–180 h |
| Arquitecto solitario | 40 h | 40 h |
| **Ratio real** | — | **4x – 4.5x** (esperado: 5x) |

El overhead de coordinación destruye el 10–20% del throughput teórico de un equipo antes de que escriban una sola línea.

---

## Tabla 2: comparación de perfiles por dimensión

| Perfil | Velocidad | Calidad arquitectónica | Relevancia de negocio |
|---|---|---|---|
| Equipo enterprise (5 devs) | Media | Alta | Media-Alta |
| Hacker solitario (sin IA, sin enterprise) | Alta | Baja | Alta |
| Hacker con IA (sin enterprise) | Muy alta | Media | Alta |
| **Arquitecto V5 (enterprise + IA)** | **Muy alta** | **Alta** | **Alta** |

El perfil V5 es el único que no realiza trade-offs. Los demás sacrifican alguna dimensión para optimizar otra. La Ingeniería No Lineal resuelve esa tensión estructuralmente — no por esfuerzo adicional.

---

## Tabla 3: equivalente lineal de un sprint fundacional V5

Lo construido en 15 días calendario bajo el marco No Lineal, estimado en tiempo de paradigma lineal:

| Componente | Estimación lineal (3–5 devs) |
|---|---|
| Frontend (13 módulos enterprise) | 2–3 meses |
| Orquestación de automatización (25 flujos) | 1–2 meses |
| Persistencia con RLS + triggers | 2–3 semanas |
| Capa semántica de memoria IA | 3–4 semanas |
| Gobernanza + documentación maestra | 1–2 semanas |
| **Total estimado paradigma lineal** | **4–6 meses** |

**Factor de aceleración observado:**
- En tiempo de entrega (días calendario): **8x–12x**
- En persona-días de desarrollo: **más de 20x**

---

## Tabla 4: distribución del tiempo en el desarrollo promedio

| Actividad | % del tiempo |
|---|---|
| Escribir código que produce valor directo | 30–40% |
| Leer docs por asunción incorrecta de API | 15–20% |
| Debuggear asunciones de negocio erróneas | 15–20% |
| Reconstruir contexto tras interrupciones | 10–15% |
| Búsqueda de archivos y nombres de variables | 5–10% |
| **Trabajo que realmente mueve el proyecto** | **~35%** |

El 65% restante es fricción estructural — no falta de talento ni de esfuerzo. El Patrón C-1 ataca directamente las dos primeras filas de fricción antes de abrir el IDE. El Exocórtex ataca la tercera.

---

## El multiplicador de orquestación IA

| Perfil | Throughput relativo |
|---|---|
| Arquitecto solitario (sin IA) | 1x |
| Equipo de 5 (sin IA) | 3x – 4x |
| **Arquitecto con IA orquestada (V5)** | **8x – 12x** |

El Arquitecto V5 supera al equipo de 5 combinando tres factores simultáneos:

- **Velocidad de decisión** del solitario — sin overhead de consenso
- **Procesamiento paralelo masivo** de la IA — análisis de 30.000+ líneas en minutos
- **Coherencia de una sola mente rectora** — sin fricción semántica entre módulos

---

*Para ver cómo estos números se materializaron en el sprint real, ver [`05-evidencia/genesis-y-metricas-sprint.md`](genesis-y-metricas-sprint.md).*
