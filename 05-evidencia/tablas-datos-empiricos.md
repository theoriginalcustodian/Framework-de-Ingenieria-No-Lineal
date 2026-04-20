# Tablas de datos empíricos

> Una fracción significativa del tiempo de un desarrollador es fricción disfrazada de trabajo.

---

## Nota sobre la naturaleza de estos datos

Las tablas siguientes combinan dos tipos de información:

- **Métricas directas del sprint fundacional** — verificables contra commits, PRs y artefactos del repositorio original
- **Extrapolaciones comparativas contra el paradigma lineal** — estimaciones razonadas del Arquitecto, no benchmarks controlados

Los ratios comparativos (por ejemplo "equipo de 5 vs arquitecto solitario") provienen de literatura sobre dinámica de equipos y no de un estudio replicado en este caso. Se presentan para establecer orden de magnitud, no precisión numérica.

---

## Tabla 1: el costo del overhead de coordinación

La investigación en dinámica de equipos sugiere que un equipo de 5 personas no produce 5x más que una persona sola — el rango típico reportado es entre 1.5x y 2.5x más. Los costos de coordinación absorben la diferencia.

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

El perfil V5 busca no hacer trade-offs fuertes entre las tres dimensiones. Los demás perfiles sacrifican típicamente al menos una para optimizar otra. La Ingeniería No Lineal intenta resolver esa tensión estructuralmente mediante separación de roles (CPU/GPU) y apalancamiento de IA — no por esfuerzo humano adicional. La tabla refleja el patrón observado en el sprint fundacional y no una medición comparativa controlada.

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

**Factor de aceleración estimado** (respecto al rango de estimación lineal documentado arriba):

- En tiempo de entrega (días calendario): el sprint fundacional se completó en ~15 días versus una estimación razonable de 4-6 meses para equipo lineal
- En persona-días de desarrollo: ~15 persona-días efectivos versus 240+ persona-días que implicaría el escenario lineal de referencia

El ratio depende fuertemente del escenario comparado. No es un benchmark sobre muestra estadística — es la razón entre un caso único documentado y una estimación sobre equipos estándar en la industria. Se presenta como orden de magnitud, no como promesa replicable.

---

## Tabla 4: distribución del tiempo en el desarrollo promedio

| Actividad | % del tiempo (rango típico) |
|---|---|
| Escribir código que produce valor directo | 30–40% |
| Leer docs por asunción incorrecta de API | 15–20% |
| Debuggear asunciones de negocio erróneas | 15–20% |
| Reconstruir contexto tras interrupciones | 10–15% |
| Búsqueda de archivos y nombres de variables | 5–10% |
| **Trabajo que realmente mueve el proyecto** | **~35%** |

Los porcentajes provienen de auto-observación y literatura sobre productividad de desarrollo (DORA, SPACE framework, estudios sobre developer experience). El rango restante (~65%) cubre fricción estructural — no falta de talento ni de esfuerzo. El Patrón C-1 ataca las dos primeras filas antes de abrir el IDE. El Exocórtex ataca la tercera.

---

## El apalancamiento de orquestación IA

| Perfil | Throughput relativo (orden de magnitud estimado) |
|---|---|
| Arquitecto solitario (sin IA) | 1x (línea base) |
| Equipo de 5 (sin IA) | ~3x – 4x (literatura de dinámica de equipos) |
| **Arquitecto con IA orquestada (V5)** | **Rango observado alto** — el sprint fundacional produjo volumen equivalente a meses de equipo lineal |

Los ratios son órdenes de magnitud estimados, no mediciones controladas. El Arquitecto V5 combina tres factores que tienden a multiplicarse:

- **Velocidad de decisión** del solitario — sin overhead de consenso
- **Procesamiento paralelo masivo** de la IA — análisis de código a volúmenes inviables para lectura humana directa
- **Coherencia de una sola mente rectora** — sin fricción semántica entre módulos

El valor del perfil V5 no está en ganar por un múltiplo exacto, sino en evitar los tres trade-offs clásicos (velocidad / calidad / relevancia) simultáneamente — y esa asimetría es la que el framework intenta documentar.

---

*Para ver cómo estos números se materializaron en el sprint real, ver [`05-evidencia/genesis-y-metricas-sprint.md`](genesis-y-metricas-sprint.md).*
