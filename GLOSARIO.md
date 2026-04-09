# Glosario

Definiciones de referencia rápida para los términos del framework de Ingeniería No Lineal. Cada entrada es la formulación más corta que elimina la ambigüedad — para el desarrollo completo, seguir el link al documento fuente.

---

## Paradigma

**Ingeniería No Lineal (INL)**
Metodología de construcción de software donde el output escala exponencialmente mediante la eliminación sistemática de fricción estructural y la orquestación de IA, en lugar de escalar el headcount. → [`01-teoria/paper-ingenieria-no-lineal.md`](01-teoria/paper-ingenieria-no-lineal.md)

**Ingeniería Lineal (IL)**
Paradigma donde el output es proporcional al esfuerzo y al número de desarrolladores. Asume que la fricción es una constante inevitable. → [`01-teoria/paper-ingenieria-no-lineal.md`](01-teoria/paper-ingenieria-no-lineal.md)

**Paradigma CPU/GPU**
División de roles entre el Arquitecto humano (CPU: diseña la intención, evalúa el riesgo, valida abstracciones) y la IA (GPU: ejecuta auditorías masivas, genera boilerplate, aplica parches sistémicos). → [`02-framework/framework-vision-general.md`](02-framework/framework-vision-general.md)

**Outlier Estadístico**
Resultado de rendimiento fuera de norma producido por la intersección de arquitectura enterprise × agilidad del solitario × orquestación de IA. En el sprint fundacional documentado: 8x–12x más rápido en tiempo de entrega, más de 20x en persona-días de desarrollo. No es talento — es método replicable. → [`01-teoria/ecuacion-del-outlier.md`](01-teoria/ecuacion-del-outlier.md)

**Deep Flow**
Estado de concentración sostenida de 4+ horas sin interrupciones externas. Condición necesaria para la velocidad outlier. Se protege por diseño — no por disciplina reactiva. → [`02-framework/framework-vision-general.md`](02-framework/framework-vision-general.md)

**Hardcoding Cognitivo**
El cuarto tipo de hardcoding letal: re-explicar el stack, las convenciones y las reglas arquitectónicas en cada sesión nueva con una IA. Se elimina mediante el Grafo Maestro. → [`04-manifiestos/muerte-al-hardcoding.md`](04-manifiestos/muerte-al-hardcoding.md)

**Abandono Preparado**
Estado de madurez sistémica donde el sistema puede operar sin intervención humana indefinidamente — sanando sus propios fallos, procesando sus propias colas de error, sobreviviendo a la ausencia de su creador. → [`01-teoria/abandono-preparado.md`](01-teoria/abandono-preparado.md)

---

## Patrones

**C-1 — Pre-Computación del Dominio**
Separación estricta entre la fase de investigación del dominio (antes del IDE) y la fase de implementación. El entregable obligatorio es `REGLAS_NEGOCIO.md`. El IDE no se abre hasta pasar el umbral de suficiencia. → [`03-patrones/c1-precomputacion-de-dominio.md`](03-patrones/c1-precomputacion-de-dominio.md)

**C-2 — Offloading Cognitivo Estratégico**
El Arquitecto delega el volumen masivo (auditorías, boilerplate, parches) a la IA y retiene las decisiones de seguridad, ontología y validación. Sinónimo del Paradigma CPU/GPU en su aplicación táctica. → [`02-framework/framework-vision-general.md`](02-framework/framework-vision-general.md)

**C-3 — Exocórtex de Memoria Activa**
Uso del sistema de archivos `.md` como extensión de la RAM biológica. Toda decisión que requiere más de 5 minutos de pensamiento se persiste antes de continuar. → [`02-framework/framework-vision-general.md`](02-framework/framework-vision-general.md)

**C-4 — Aislamiento de Memoria Bitemporal**
Separación de la memoria de los agentes IA en dos hemisferios: Hemisferio A (contexto de sesión, efímero) y Hemisferio B (verdad institucional, persistente). Evita alucinaciones de diagnóstico. → [`02-framework/patrones-auto-healing.md`](02-framework/patrones-auto-healing.md)

**C-5 — Diagnóstico con Restricciones (ReAct Zero-Trust)**
Los agentes operativos siguen un protocolo de pasos fijos que ancla sus respuestas a evidencia extraída de herramientas concretas. Prohibido el razonamiento abductivo sin evidencia instrumental. → [`02-framework/patrones-auto-healing.md`](02-framework/patrones-auto-healing.md)

**A-1 — Adaptador de Dominio Universal**
Capa única que traduce el caos externo (APIs hostiles, protocolos legados, errores crípticos) al lenguaje interno del sistema. Ningún otro módulo habla con el tercero directamente. → [`02-framework/framework-vision-general.md`](02-framework/framework-vision-general.md)

**A-2 — Constraint-Driven Development (CDD)**
Las reglas de seguridad y aislamiento residen en la capa física más profunda — la base de datos — no en el middleware. RLS activo desde el primer registro. → [`02-framework/framework-vision-general.md`](02-framework/framework-vision-general.md)

**A-3 — Coordinación Event-Driven**
Toda operación con latencia >500ms es asíncrona por diseño. El sistema registra la Intención y libera al usuario; el Resultado llega mediante eventos en tiempo real. → [`02-framework/framework-vision-general.md`](02-framework/framework-vision-general.md)

**A-4 — Trauma Empaquetado (Auto-Healing L2)**
Ante el fallo de un servicio externo, el sistema captura el payload, el estado y los metadatos del error en un contenedor atómico (DLQ) y continúa procesando el resto del volumen. Un Agente de Sanación lo reinyecta cuando las condiciones se restauran. → [`02-framework/patrones-auto-healing.md`](02-framework/patrones-auto-healing.md)

**G-1 — Debugging de Generadores Sistémicos**
Si un error aparece en 3+ lugares, no es un bug — es una falla en el generador. No se corrigen las instancias; se corrige la regla que las produce. Corregir el generador es exponencial. → [`02-framework/framework-vision-general.md`](02-framework/framework-vision-general.md)

**G-2 — Gobernanza desde el Día 0**
Branch protection, commits semánticos y Constitución Técnica desde el inicio. El último día de cada ciclo se dedica exclusivamente a gobernanza — sin código nuevo. → [`02-framework/framework-vision-general.md`](02-framework/framework-vision-general.md)

---

## Mecanismos

**PEAP-V5**
Protocolo de Ejecución de Alta Performance V5. Ciclo determinista de 6 días (144 horas) para construir sistemas de grado enterprise desde cero. Cada día tiene misión, entregables y condición de salida. → [`02-framework/protocolo-peap-v5-144h.md`](02-framework/protocolo-peap-v5-144h.md)

**Handshake cognitivo**
Las tres consultas ejecutadas al inicio de cada sesión con un agente: LEYES (¿cómo pensás?), HISTORIA (¿por qué pensás así?), ESTADO (¿dónde estás ahora?). Elimina la re-explicación del contexto. → [`06-arquitectura-cognitiva/diseno-master-brain.md`](06-arquitectura-cognitiva/diseno-master-brain.md)

**Delta cognitivo**
Las tres preguntas al cierre de cada sesión significativa: ¿Cambió alguna ley? ¿Tomamos una decisión con razonamiento? ¿Cambió el estado del proyecto? La respuesta determina qué se persiste en el Grafo Maestro. → [`06-arquitectura-cognitiva/diseno-master-brain.md`](06-arquitectura-cognitiva/diseno-master-brain.md)

**Bootstrap del Grafo**
La primera ingesta del Grafo Maestro al finalizar el Día 1: `CONSTITUCION.md` puebla LEYES, `REGLAS_NEGOCIO.md` puebla HISTORIA, la fase actual puebla ESTADO. Es la primera ejecución del Delta en dirección inversa. → [`06-arquitectura-cognitiva/diseno-master-brain.md`](06-arquitectura-cognitiva/diseno-master-brain.md)

**Shift-Left Validation**
El perímetro se defiende en el punto de entrada del dato — cliente/browser/edge — no en el servidor. Ningún dato malformado consume ciclos de procesamiento en el backend. → [`02-framework/protocolo-peap-v5-144h.md`](02-framework/protocolo-peap-v5-144h.md)

**Cierre térmico**
Última jornada de cada ciclo de ejecución dedicada exclusivamente a gobernanza, documentación y actualización del Exocórtex. Sin código nuevo. Sin excepciones. → [`05-evidencia/antipatrones-y-kpis.md`](05-evidencia/antipatrones-y-kpis.md)

**Arbitraje temporal**
Construir asumiendo que todos los proveedores externos responden correctamente ("APIs Mágicas") durante los Días 2–3, para no bloquear el momentum. Los cables reales se conectan en el Día 4. → [`02-framework/protocolo-peap-v5-144h.md`](02-framework/protocolo-peap-v5-144h.md)

---

## Artefactos

**Constitución Técnica (`CONSTITUCION.md`)**
Las leyes físicas e inmutables del proyecto. Define patrones obligatorios, restricciones absolutas y convenciones inamovibles. Ningún agente —humano o IA— puede proponer algo que la contradiga sin señalarlo explícitamente. → [`02-framework/framework-vision-general.md`](02-framework/framework-vision-general.md)

**Exocórtex**
La estructura de archivos `.md` que funciona como extensión de la memoria RAM del Arquitecto: `CONSTITUCION.md`, `REGLAS_NEGOCIO.md`, `SNAPSHOT_ESTADO.md`, `REGISTRO_TRAUMAS.md`, `INDICE_MAESTRO.md`. → [`02-framework/framework-vision-general.md`](02-framework/framework-vision-general.md)

**Grafo Maestro**
Motor de memoria semántica persistente que almacena LEYES (inmutable), HISTORIA (evolutivo) y ESTADO (efímero) del Arquitecto. Convierte cualquier agente nuevo en colaborador con contexto de meses. → [`06-arquitectura-cognitiva/diseno-master-brain.md`](06-arquitectura-cognitiva/diseno-master-brain.md)

**LEYES / HISTORIA / ESTADO**
Las tres categorías del Grafo Maestro. LEYES: patrones y restricciones siempre verdaderos. HISTORIA: decisiones con razonamiento y aprendizajes de fallos. ESTADO: fase actual, pendientes, deuda técnica. → [`06-arquitectura-cognitiva/diseno-master-brain.md`](06-arquitectura-cognitiva/diseno-master-brain.md)

**RLS (Row Level Security)**
Seguridad a Nivel de Fila en la base de datos. Garantiza que cada usuario solo acceda a su fragmento de realidad — implementada como ley física de la persistencia, no como sugerencia del middleware. → [`02-framework/framework-vision-general.md`](02-framework/framework-vision-general.md)

**DLQ (Dead Letter Queue)**
Cola de errores de Nivel 2 donde se depositan los Traumas Empaquetados. Los Agentes de Sanación la patrullan en ciclos de baja demanda y reinyectan transacciones cuando las condiciones externas se restauran. → [`02-framework/patrones-auto-healing.md`](02-framework/patrones-auto-healing.md)

**Isomorfismo Estructural**
Principio por el cual el repositorio, la documentación, las tablas de la base de datos y las capas de automatización comparten la misma nomenclatura y estructura. Elimina el tiempo de búsqueda de archivos y la fricción de traducción entre capas. → [`02-framework/framework-vision-general.md`](02-framework/framework-vision-general.md)
