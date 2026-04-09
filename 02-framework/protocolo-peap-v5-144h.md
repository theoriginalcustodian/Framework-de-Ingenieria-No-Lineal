# Protocolo PEAP-V5: el ciclo de 144 horas

> *"El peligro no es no poder construir el sistema. El peligro es construirlo de la manera equivocada, desperdiciando el único recurso que no tiene precio: la capacidad de foco absoluto de las primeras 100 horas."*

---

## Qué es el PEAP-V5

El Protocolo de Ejecución de Alta Performance V5 es un algoritmo determinista de 6 días (144 horas) para construir sistemas de grado enterprise desde cero. No es una guía de gestión de tareas — es un **protocolo de ingeniería de resistencia cero**.

Cada día tiene una misión específica, entregables concretos y una condición de salida que debe cumplirse antes de avanzar al siguiente. Saltear una fase no ahorra tiempo — lo destruye en las fases posteriores.

> **Nota:** Este protocolo describe el ciclo optimizado para Arquitectos que dominan la metodología. El primer sprint fundacional documentado tomó 15 días calendario — incluyendo fines de semana, pausas y la curva de aprendizaje del protocolo mismo. Ver [`05-evidencia/genesis-y-metricas-sprint.md`](../05-evidencia/genesis-y-metricas-sprint.md).

---

## Los principios físicos del protocolo

Antes de entrar al ciclo día a día, estos cinco meta-principios definen las leyes que ningún día puede violar:

**1. Evaporación del estado**
Ninguna capa de cómputo retiene estado global. La única fuente de verdad es la base de datos central protegida por RLS. Los servidores, funciones y motores de automatización son stateless por diseño.

**2. Shift-Left Validation**
El perímetro se defiende en el punto de entrada del dato — cliente, browser, edge. Ningún dato malformado consume ciclos de procesamiento en el backend.

**3. Isomorfismo estructural**
El repositorio, la documentación y la base de datos son reflejos simétricos. El mismo nombre existe en las tres capas. Cero impedancia cognitiva en la búsqueda de cualquier componente.

**4. Acoplamiento por intenciones**
Los componentes se comunican mediante estados en la base de datos. Uno registra una intención, otro la detecta y procesa, un tercero notifica el resultado. Desacoplamiento total.

**5. Markdown como Exocórtex**
Los archivos `.md` son la memoria RAM extendida del sistema. Toda decisión que requiere más de 5 minutos de pensamiento se persiste en la Constitución antes de continuar.

---

## El ciclo de 6 días

---

### Día -1 — Compresión cognitiva (Patrón C-1)

**Misión:** erradicar la ambigüedad del negocio antes de escribir una línea de código.

**Acciones:**
- Interrogatorio profundo a modelos de IA investigativa sobre regulaciones, contratos de datos y flujos de usuario
- Mapeo de todos los servicios externos — sus endpoints, límites, protocolos legados y puntos hostiles
- Identificación de las 3–5 "cajas negras" que generarán fricción durante la integración

**Entregable obligatorio:** `REGLAS_NEGOCIO.md` — mapa completo del dominio.

**Condición de salida:** el proyecto puede construirse sin acceso a documentación externa. El Arquitecto describe el sistema completo de memoria en menos de 5 minutos.

> Si esta condición no se cumple, el Día -1 no terminó.

---

### Día 1 — El tronco (constitucionalidad)

**Misión:** establecer las restricciones que liberan la velocidad futura.

**Acciones:**
- Redacción de la `CONSTITUCION.md` — las leyes físicas e inmutables del proyecto
- Diseño del esquema de datos completo con RLS activo desde el primer registro
- Configuración de gobernanza en el repositorio: branch protection, commits semánticos, estructura de carpetas

**Entregables:**
- Repositorio blindado con gobernanza activa
- Constitución técnica escrita y versionada
- Tablas de base de datos con RLS habilitado

**Condición de salida:** es físicamente imposible insertar un registro que cruce los límites de tenancy. La Constitución describe el sistema sin ambigüedad.

---

### Día 2 — La silueta (generación procedural)

**Misión:** materializar el 80% de la estructura del sistema asumiendo condiciones ideales.

**Acciones:**
- Delegación masiva a IA para generar boilerplate y flujos base bajo las plantillas definidas en la Constitución
- Construcción de los Adaptadores Universales (Capa 0) para cada servicio externo identificado en el Día -1
- Construcción hacia adelante — asumir que todos los proveedores responden correctamente
- No detenerse a debuggear detalles finos; priorizar el volumen de estructura

**Principio del día:** la Impresión 3D de Código. El resultado es una silueta imperfecta pero completa — lista para ser auditada, no para ser usada.

**Condición de salida:** el sistema tiene forma. Todos los módulos existen, aunque algunos tengan lógica placeholder.

---

### Día 3 — El perímetro (validación en el borde)

**Misión:** blindar todas las entradas al backend.

**Acciones:**
- Implementación de esquemas de validación estrictos en la interfaz de usuario (Shift-Left)
- Rechazo de payloads malformados en el cliente antes de que lleguen al servidor
- Feedback en tiempo real al usuario ante errores de validación
- Ningún dato malformado tiene acceso al backend

**Condición de salida:** es matemáticamente imposible enviar al servidor una instrucción que viole la estructura de datos establecida. El perímetro está sellado.

---

### Día 4 — La poda (ensamblaje y auditoría)

**Misión:** conectar los cables reales y erradicar los errores sistémicos.

**Acciones:**
- Conmutar de "APIs Mágicas" (condiciones ideales del Día 2) a servicios reales
- Identificar patrones de error sistémicos — no errores individuales
- Delegar a agentes IA la auditoría masiva: si un error aparece en 3+ lugares, se corrige el generador, no los síntomas
- Aplicar parches sistémicos masivos (200+ correcciones en una sola jornada es posible y esperado)

**Entregable:** sistema 85% funcional. Deuda técnica catalogada y cuantificada.

**Condición de salida:** los errores restantes son conocidos, catalogados y tienen dueño. No hay errores sorpresa.

---

### Día 5 — Sello y asincronía (resiliencia)

**Misión:** construir la infraestructura de auto-conservación.

**Acciones:**
- Cierre del anillo de feedback asíncrono: Trigger → Backend → Realtime
- Implementación del Handler Global de Errores
- Implementación del patrón Trauma Empaquetado (DLQ) para recuperación automática
- Configuración de los Agentes de Sanación para procesar la cola de errores en ciclos de baja demanda
- Smoke tests y validación de onboarding end-to-end

**Condición de salida:** el sistema sana errores de infraestructura sin intervención humana. Si un proveedor externo cae durante 2 horas, las transacciones afectadas se procesan automáticamente cuando vuelve.

---

### Día 6 — Institucionalización (cierre térmico)

**Misión:** prohibición total de código nuevo. Preparación para escala y colaboradores.

**Acciones:**
- Blindaje de IP y marco legal (TOS, SLA, licencias)
- Depuración y actualización de documentación operativa
- Guías de onboarding para colaboradores futuros
- Establecimiento de KPIs de operación
- Actualización del Exocórtex con el estado final del sistema

**Condición de salida:** cualquier desarrollador — humano o IA — puede integrarse al sistema en menos de 30 minutos leyendo la documentación sin asistencia del Arquitecto fundador.

---

## El arbitraje temporal: construir hacia adelante

Uno de los principios más contraintuitivos del método: **no esperar a que la integración con el proveedor externo esté perfecta para avanzar**.

Durante los Días 2 y 3, se asume que todos los proveedores responden correctamente — "APIs Mágicas". La lógica interna se construye sobre esa aserción. Los cables reales se conectan en el Día 4, cuando el 70% de la infraestructura propia ya está estable.

Esto evita que los problemas de infraestructura de terceros — que son inevitables — bloqueen el momentum de construcción del producto propio.

---

## La lógica del método

El ciclo de 144 horas no es una carrera de velocidad. Es la materialización de un principio:

> La fricción no es una constante inevitable — es una ineficiencia de diseño que puede eliminarse antes de que contamine la ejecución.

Cada día existe para eliminar una categoría específica de fricción:
- **Día -1:** elimina la fricción cognitiva
- **Día 1:** elimina la fricción arquitectónica futura
- **Días 2–3:** genera volumen sobre terreno limpio
- **Día 4:** elimina la fricción operacional acumulada
- **Día 5:** elimina la fricción de infraestructura
- **Día 6:** elimina la fricción de incorporación futura

El resultado es un sistema que no acumula entropía — porque las fuentes de entropía fueron eliminadas por diseño antes de que aparecieran.

---

*Para los patrones individuales que este protocolo implementa, ver [`02-framework/framework-vision-general.md`](framework-vision-general.md).  
Para los KPIs que indican si el protocolo se está aplicando correctamente, ver [`05-evidencia/antipatrones-y-kpis.md`](../05-evidencia/antipatrones-y-kpis.md).*
