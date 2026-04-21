# Protocolo PEAP-V5 — Guía de fase por fase

Referencia operativa del ciclo de 6 días. Para cada fase: misión, acciones, entregables, condición de salida y señales de alarma.

> **Nota:** El protocolo describe el ciclo optimizado para Arquitectos que dominan la metodología. El primer sprint puede tomar más tiempo calendario — lo importante es completar cada condición de salida antes de avanzar.

---

## Día -1 — Compresión cognitiva (Patrón C-1)

**Misión:** erradicar la ambigüedad del negocio antes de escribir una línea de código.

**Acciones GPU:**
- Interrogatorio activo al dominio usando IA investigativa
- Mapeo de todos los servicios externos: endpoints, rate limits, protocolos legados, puntos hostiles
- Identificación de las 3-5 "cajas negras" que generarán fricción

**Entregable obligatorio:** `REGLAS_NEGOCIO.md`

**Condición de salida:** el Arquitecto puede describir el sistema completo de memoria en menos de 5 minutos, sin consultar documentación externa. Verificar con las 4 preguntas del umbral de suficiencia (ver patrones.md → C-1).

**Señal de alarma:** si el Arquitecto no puede responder alguna de las 4 preguntas, el Día -1 no terminó. No avanzar.

---

## Día 1 — El tronco (constitucionalidad)

**Misión:** establecer las restricciones que liberan la velocidad futura.

**Acciones GPU:**
- Asistir en la redacción de `CONSTITUCION.md`
- Diseñar el esquema de datos completo con RLS activo desde el primer registro
- Configurar gobernanza: branch protection, commits semánticos, estructura de carpetas

**Entregables:**
- `CONSTITUCION.md` escrita y versionada
- Esquema de DB con RLS habilitado
- Repositorio con gobernanza activa
- Bootstrap inicial del Grafo Maestro (si aplica)

**Condición de salida:** es físicamente imposible insertar un registro que cruce los límites de tenancy. La Constitución describe el sistema sin ambigüedad.

**Señal de alarma:** si el esquema de DB depende de ver la respuesta de una API para estar completo, el C-1 fue insuficiente. Volver al Día -1.

---

## Día 2 — La silueta (generación procedural)

**Misión:** materializar el 80% de la estructura del sistema asumiendo condiciones ideales.

**Principio del día:** Impresión 3D de Código. El resultado es una silueta imperfecta pero completa — lista para ser auditada, no para ser usada.

**Acciones GPU:**
- Generación masiva de boilerplate bajo las plantillas de la Constitución
- Construcción de Adaptadores Universales (Capa 0) para cada servicio externo del Día -1
- Construcción hacia adelante — asumir que todos los proveedores responden correctamente (APIs Mágicas)
- No detenerse a debuggear detalles finos — priorizar el volumen de estructura

**Condición de salida:** el sistema tiene forma. Todos los módulos existen, aunque algunos tengan lógica placeholder.

**Señal de alarma:** si el Arquitecto intenta conectar servicios reales → Anti-Patrón 3. Detener y redirigir.

---

## Día 3 — El perímetro (validación en el borde)

**Misión:** blindar todas las entradas al backend.

**Acciones GPU:**
- Implementar esquemas de validación estrictos en la interfaz (Shift-Left)
- Rechazar payloads malformados en el cliente antes de que lleguen al servidor
- Configurar feedback en tiempo real al usuario ante errores de validación

**Condición de salida:** es matemáticamente imposible enviar al servidor una instrucción que viole la estructura de datos establecida.

**Señal de alarma:** si algún dato malformado puede llegar al backend, el Día 3 no terminó.

---

## Día 4 — La poda (ensamblaje y auditoría)

**Misión:** conectar los cables reales y erradicar los errores sistémicos.

**Acciones GPU:**
- Conmutar de APIs Mágicas a servicios reales
- Identificar patrones de error sistémicos — aplicar G-1 masivamente
- Auditoría de código: buscar inconsistencias, violaciones a la Constitución, deuda técnica
- Aplicar parches sistémicos masivos (200+ correcciones en una sola jornada es posible)

**Entregable:** sistema 85% funcional. Deuda técnica catalogada y cuantificada.

**Condición de salida:** los errores restantes son conocidos, catalogados y tienen dueño. No hay errores sorpresa.

**Señal de alarma:** si los mismos errores aparecen en >3 lugares sin que se haya identificado el generador → Anti-Patrón 2 activo.

---

## Día 5 — Sello y asincronía (resiliencia)

**Misión:** construir la infraestructura de auto-conservación.

**Acciones GPU:**
- Cierre del anillo de feedback asíncrono: Trigger → Backend → Realtime
- Implementar Handler Global de Errores
- Implementar patrón Trauma Empaquetado (DLQ) — ver patrones.md → A-4
- Configurar Agentes de Sanación para procesar la cola en ciclos de baja demanda
- Smoke tests y validación de onboarding end-to-end

**Condición de salida:** si un proveedor externo cae durante 2 horas, las transacciones afectadas se procesan automáticamente cuando vuelve. Sin intervención humana.

---

## Día 6 — Institucionalización (cierre térmico)

**Misión:** prohibición total de código nuevo. Preparación para escala y colaboradores.

**Acciones GPU:**
- Depuración y actualización de toda la documentación operativa
- Generación de guías de onboarding para colaboradores futuros
- Actualización completa del Exocórtex
- Establecimiento de KPIs de operación

**Entregable:** cualquier desarrollador — humano o IA — puede integrarse al sistema en menos de 30 minutos leyendo la documentación sin asistencia del Arquitecto fundador.

**Condición de salida:** el Exocórtex refleja el estado real del sistema. La Constitución está actualizada. Delta cognitivo ejecutado.

**Señal de alarma:** si el Arquitecto escribe código nuevo en este día → Anti-Patrón 4 activo. Detener.

---

## KPIs de velocidad PEAP-V5

Termómetro de salud del método. Si varios valores están en zona de alarma simultáneamente, hay un problema sistémico.

| Indicador | Valor saludable | Valor de alarma |
|---|---|---|
| Tiempo para describir el sistema sin consultar docs | < 5 minutos | > 15 minutos |
| Bugs similares antes de buscar el patrón sistémico | ≤ 3 | > 5 |
| Tiempo para recuperar contexto tras una pausa | < 15 minutos | > 45 minutos |
| % del sistema construido sin API real conectada | > 70% | < 40% |
| Features nuevas escritas en el día de gobernanza | 0 | > 0 |
| Tiempo de debugging sin aplicar parche sistémico | < 2 horas | > 2 horas |
| Documentación actualizada al cierre de cada sesión | Siempre | A veces |

**Interpretación:** cada KPI en alarma apunta a un anti-patrón específico. El diagnóstico es directo. La corrección también.
