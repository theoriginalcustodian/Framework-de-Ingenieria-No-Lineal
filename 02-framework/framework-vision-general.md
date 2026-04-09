# Framework de Ingeniería No Lineal: visión general

> *"La velocidad de un sistema complejo no está determinada por cuán rápido se escribe código. Está determinada por cuánta fricción estructural se eliminó antes de que la primera línea de ejecución fuera concebida."*

---

## La tesis

Los proyectos que producen resultados outlier no lo hacen por fuerza bruta. Lo hacen porque el Arquitecto **elimina sistemáticamente las fuentes de entropía estructural** antes de que contaminen el flujo de trabajo.

Existen tres categorías de fricción que destruyen la velocidad de desarrollo:

- **Fricción cognitiva:** construir la solución sin haber comprimido el dominio del problema.
- **Fricción arquitectónica:** decisiones de diseño inflexibles que aumentan el costo marginal de cada nuevo componente.
- **Fricción operacional:** tratar anomalías sistémicas como fallos aislados e individuales.

Los siete patrones de este documento atacan cada una de estas fricciones de forma quirúrgica.

---

## Los tres niveles de abstracción

```
Nivel 3 — Meta-patrón        La ecuación del outlier (síntesis)
    ↑
Nivel 2 — Patrones           Los 7 pilares de este documento (invariantes)
    ↑
Nivel 1 — Prácticas          RLS, triggers, validación de esquemas (evoluciona con el stack)
```

Este documento opera en el **Nivel 2**. Las herramientas del Nivel 1 cambian con el tiempo y con el stack tecnológico. Los patrones del Nivel 2 son las leyes físicas del sistema — permanecen inmutables independientemente de la tecnología que los implemente.

---

## Categoría 1: patrones cognitivos

### C-1 — Pre-Computación del Dominio
*Alias: Separación estricta de Descubrimiento vs. Implementación*

La actividad de decodificar la lógica del negocio y la actividad de codificar la arquitectura técnica son procesos cerebrales incompatibles. Deben ejecutarse en fases secuenciales estrictas.

**El problema:** cuando un desarrollador asume el comportamiento de una API sin evidencia previa, entra en el ciclo de la alucinación estructural — un bucle de error-corrección que consume el 60% del tiempo en borrar y reescribir.

**La solución:** antes de abrir el IDE, se realiza una investigación profunda del dominio usando IA investigativa. El entregable obligatorio es un `REGLAS_NEGOCIO.md` que define contratos de datos, restricciones hostiles, flujo de trabajo manual del usuario y localización de la verdad del dato.

**Umbral de suficiencia:** no abrir el código hasta poder describir el sistema completo de memoria en 300 segundos.

| Contexto | Puntos hostiles típicos | Foco de investigación |
|---|---|---|
| Fintech / Pagos | Capas de autenticación complejas | Flujos de tokenización y webhooks |
| Gubernamental / Legal | Protocolos privados y certificados | Estructuras de error no estándar |
| Logística / ERP | Formatos legados propietarios | Eventos de trazabilidad y sincronicidad |

---

### C-2 — Offloading Cognitivo Estratégico
*Alias: Paradigma CPU/GPU*

El Arquitecto opera como **CPU**: diseña la intención, evalúa el riesgo y valida abstracciones. La IA opera como **GPU**: ejecuta el volumen masivo, audita patrones y genera boilerplate consistente.

| Responsabilidad CPU (Arquitecto) | Responsabilidad GPU (IA) |
|---|---|
| Definición de la ontología del sistema | Análisis de patrones en 50+ archivos |
| Evaluación de riesgo y seguridad | Generación de componentes según plantilla |
| Validación de abstracciones clave | Auditoría de convenciones de nombrado |
| Decisión de integración estratégica | Escritura de documentación de interfaces |

**Indicador de éxito:** el Arquitecto describe el trabajo de la IA como un mandato validado, no como una consulta pasiva.
**Señal de alarma:** el Arquitecto no puede explicar la lógica interna del código generado por la IA.

---

### C-3 — Exocórtex de Memoria Activa
*Alias: Extensión RAM mediante documentación estructural*

La RAM biológica es limitada. El sistema externaliza su estado en una estructura de archivos que funciona como Exocórtex. Cualquier decisión que requiera más de 300 segundos de análisis se persiste inmediatamente.

```
docs/
├── CONSTITUCION_TECNICA.md    ← Leyes físicas e inmutables del proyecto
├── REGLAS_NEGOCIO.md          ← Mapa de la realidad del dominio
├── SNAPSHOT_ESTADO.md         ← Contexto actual al cierre de sesión
├── REGISTRO_TRAUMAS.md        ← Catálogo de errores sistémicos y su cura
└── INDICE_MAESTRO.md          ← Enrutador de la inteligencia del proyecto
```

**Regla de oro:** si una decisión arquitectónica requiere más de 5 minutos de pensamiento, debe persistirse en la Constitución.

---

## Categoría 2: patrones de arquitectura

### A-1 — El Adaptador de Dominio Universal
*Alias: Encapsulamiento de ecosistemas hostiles*

Toda comunicación con un servicio externo complejo debe estar mediada por **un único componente** que traduzca el caos externo a la pureza interna del sistema. Ningún otro módulo habla con el tercero directamente.

**Anatomía del Adaptador:**
1. **Aislamiento PKI/Auth:** gestiona certificados y sesiones de forma opaca al resto del sistema.
2. **Normalización:** convierte formatos legados a estructuras de datos internas modernas.
3. **Interpretación de errores:** los errores externos no son fallos — son señales que el Adaptador traduce al lenguaje interno.

**El problema que resuelve:** si la API externa cambia o cae, solo el Adaptador se ve afectado. El resto del sistema permanece intacto.

---

### A-2 — Constraint-Driven Development (CDD)
*Alias: Blindaje en la capa de persistencia*

Las reglas de seguridad — aislamiento de datos, multi-tenancy — deben residir en la capa física más profunda: la base de datos. No son sugerencias en el middleware; son restricciones físicas infranqueables.

**Implementación obligatoria:**
- **RLS (Row Level Security):** garantiza que un usuario solo acceda a su fragmento de realidad. Si el código de aplicación intenta cruzar datos, la base de datos lo bloquea a nivel atómico.
- **Invariantes matemáticos:** restricciones `CHECK`, `UNIQUE`, `NOT NULL` para evitar la degradación del dato.
- **Triggers de auditoría:** registro automático e inmutable de quién movió el sistema.

---

### A-3 — Coordinación Event-Driven
*Alias: Desacoplamiento de Intención y Resultado*

Toda operación con latencia superior a 500ms debe ser asíncrona por diseño. El sistema registra la **Intención** en la base de datos y libera al usuario inmediatamente. El **Resultado** llega mediante eventos en tiempo real cuando el proceso finaliza.

Los componentes no se llaman entre sí — reaccionan a estados. Esto hace al sistema resiliente a caídas parciales de infraestructura y fácil de extender sin romper lo existente.

---

## Categoría 3: patrones de gobernanza y resiliencia

### G-1 — Debugging de generadores sistémicos
*Alias: Búsqueda de la causa en la matriz de generación*

Si un error aparece en 3 o más lugares, no es un bug — es una falla en el **generador**: la plantilla de código o la instrucción de IA que lo produjo. No se corrigen las instancias; se corrige la regla que las genera.

Corregir síntomas individuales es una operación lineal.
Corregir el generador es una operación exponencial.

---

### G-2 — Gobernanza desde el Día 0
*Alias: Institucionalización prematura de la calidad*

La calidad no se añade al final — es el sistema de rieles que permite la velocidad inicial. Implementar gobernanza tarde es más costoso que implementarla temprano.

- **Branch protection:** prohibición física de inyectar código en la rama principal sin revisión.
- **Commits semánticos:** trazabilidad obligatoria de cada cambio.
- **Cierre térmico de sprint:** última jornada de cada ciclo dedicada exclusivamente a actualizar el Exocórtex y cerrar deuda técnica. Sin código nuevo.
- **Diseño para N+1:** aunque se trabaje solo, el sistema se diseña como si mañana ingresaran tres ingenieros expertos al equipo.

---

## Síntesis: la ecuación del outlier

```
Arquitectura de grado enterprise  (solidez sin trade-offs)
×  Agilidad del Arquitecto Solitario   (velocidad de decisión)
×  Orquestación estratégica de IA      (volumen sin fricción)
────────────────────────────────────────────────────────────
=  Resultados estadísticamente imposibles   (15x – 25x)
```

Este método no depende del talento excepcional. Depende de la disciplina en la aplicación de estos siete patrones. Cuando la fricción cognitiva se reduce a cero mediante la pre-computación y la seguridad se delega a los cimientos, la velocidad de ejecución se multiplica por un orden de magnitud.

---

*Para el ciclo de implementación día a día de estos patrones, ver [`02-framework/protocolo-peap-v5-144h.md`](protocolo-peap-v5-144h.md).  
Para los patrones avanzados de auto-healing y cognición, ver [`02-framework/patrones-auto-healing.md`](patrones-auto-healing.md).*
