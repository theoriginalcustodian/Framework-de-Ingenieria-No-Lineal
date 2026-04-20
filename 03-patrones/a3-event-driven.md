# Patrón A-3: Coordinación Event-Driven

> *"Cuando bloqueás el hilo esperando una respuesta externa, le regalaste a tu proveedor el control sobre tu experiencia de usuario."*

*Alias: Desacoplamiento de Intención y Resultado*

---

## La tesis

Toda operación del sistema con latencia superior a 500ms debe ser asíncrona por diseño. El sistema registra la **Intención** del usuario en persistencia y libera el hilo inmediatamente. El **Resultado** llega como evento cuando el proceso realmente termina.

La Ingeniería Lineal trata la sincronía como natural. Cuando el usuario solicita una operación, el sistema bloquea el hilo hasta que el resultado está disponible. Si el proveedor externo tarda 30 segundos, el usuario espera 30 segundos. Si el proveedor cae, el hilo queda colgado hasta timeout.

La Ingeniería No Lineal invierte este modelo. **Los componentes del sistema no se llaman entre sí — reaccionan a estados**. Un componente registra una intención, otro la detecta, la procesa, actualiza el resultado. Los componentes son independientes temporalmente y resilientes a fallos parciales.

---

## El problema que resuelve

### El anti-patrón: sincronía por defecto

En arquitecturas lineales, el flujo de una operación típica bloquea múltiples hilos en cascada:

```
Usuario solicita operación
  → Frontend espera respuesta del Backend
    → Backend espera respuesta del Proveedor Externo
      → Proveedor Externo tarda 10s (o falla)
    ← Backend devuelve resultado o error
  ← Frontend muestra resultado o mensaje de error
```

Esta cascada tiene tres fallas fatales:

1. **La experiencia del usuario hereda la latencia del eslabón más lento.** Si el proveedor tarda 30 segundos, el usuario ve 30 segundos de loading.
2. **Los fallos parciales rompen todo.** Si el proveedor cae, toda la operación falla. El usuario ve error incluso cuando el sistema interno está sano.
3. **La escalabilidad es proporcional a la paciencia del usuario.** No se pueden procesar operaciones en batch sin mantener al usuario esperando el batch completo.

### El costo real

El costo no son los segundos perdidos — es que el sistema **transfiere la fragilidad del exterior al usuario**. Cada integración externa hostil se convierte en un punto de falla visible para el cliente final.

---

## La regla operativa

**El sistema registra Intenciones. Procesa Intenciones en background. Emite Resultados cuando están listos.**

Tres fases desacopladas temporalmente, comunicadas exclusivamente a través de estado persistente (típicamente en la base de datos).

### Fase 1 — Registro de Intención

El usuario solicita una operación. El sistema:

1. Valida la solicitud (rápido, sincrónico — <100ms)
2. Persiste la Intención en una tabla de solicitudes con estado `pendiente`
3. Devuelve inmediatamente al usuario un identificador de tracking

El hilo queda libre. El usuario ve confirmación de recepción en <1 segundo, independientemente de cuánto tardará el procesamiento real.

### Fase 2 — Procesamiento asíncrono

Un motor independiente (trigger, worker, función programada) detecta nuevas Intenciones en la tabla de solicitudes. Las procesa:

- Invoca al proveedor externo
- Maneja timeouts, reintentos, errores
- Actualiza el estado de la Intención: `procesando` → `exitoso` / `fallido`

Este motor puede operar en cualquier momento, en cualquier máquina, con cualquier política de retry. El usuario no sabe ni le importa.

### Fase 3 — Emisión del Resultado

Cuando la Intención cambia de estado, el sistema emite un evento. El frontend del usuario, suscrito al tracking ID, recibe el evento en tiempo real y actualiza la interfaz.

El usuario ve el resultado como notificación asíncrona, no como respuesta bloqueante.

---

## Implementación canónica

### El triple de tablas

Un patrón común de implementación usa tres tipos de tablas:

- **Tabla de Intenciones** (ej. `facturacion_solicitudes`) — registra la voluntad del usuario
- **Tabla de Resultados** (ej. `facturacion_comprobantes`) — registra el output cuando está listo
- **Tabla de Eventos** (ej. `alertas`) — notifica al frontend vía realtime

### El trigger del motor

Típicamente un trigger en la tabla de Intenciones dispara el procesamiento:

```sql
CREATE TRIGGER procesar_factura_pendiente
  AFTER INSERT ON facturacion_solicitudes
  FOR EACH ROW
  WHEN (NEW.estado = 'pendiente')
  EXECUTE FUNCTION invocar_motor_facturacion();
```

Esto convierte la inserción en la tabla de Intenciones en la señal de activación del motor. El frontend no necesita "arrancar" el motor — el motor reacciona a estado.

### La suscripción realtime del frontend

El frontend se suscribe a cambios en el tracking ID específico:

```javascript
supabase.channel(`solicitud:${trackingId}`)
  .on('UPDATE', payload => actualizarUI(payload.new))
  .subscribe();
```

Cuando el motor actualiza el estado, el frontend recibe el evento en <1 segundo. El usuario ve el resultado sin necesidad de polling.

---

## Validación empírica del patrón

En proyectos con operaciones dependientes de servicios externos hostiles:

- **Reducción de latencia percibida de 10-30s a <1s** para el 100% de las operaciones
- **Resiliencia total a caídas parciales del proveedor** — el usuario solo ve "procesando" prolongado, no error
- **Capacidad de procesar operaciones en batch sin impacto en UX** — el usuario envía 100 facturas, ve 100 tickets inmediatos, los resultados llegan cuando llegan

Ejemplo concreto documentado: en un proyecto con integración a un servicio externo de latencia variable (5-45s) y caídas frecuentes, la implementación de A-3 desde el Día 1 resultó en experiencia de usuario percibida como instantánea (<1s) independientemente de la salud real del proveedor externo.

---

## Cuándo aplicar este patrón

**Aplicar obligatoriamente cuando:**

- El sistema depende de servicios externos con latencia >500ms
- El sistema tiene operaciones en batch (procesar múltiples elementos juntos)
- La experiencia del usuario es una prioridad del negocio
- El servicio externo tiene SLA menor al 99.9% (caídas ocurren)

**Aplicar con alto beneficio cuando:**

- El sistema tiene operaciones costosas (facturación, generación de PDFs, cálculos pesados)
- Hay posibilidad de reintentos automáticos ante fallos transitorios

**No aplicar cuando:**

- La operación es genuinamente sincrónica y rápida (<100ms) y no hay beneficio de desacoplamiento
- El overhead de implementar tablas de Intenciones + trigger + realtime excede el valor (raro en sistemas de complejidad media)

---

## Anti-patrones a evitar

### Anti-patrón 1 — Polling en lugar de realtime

El frontend consulta cada 2 segundos el estado de la Intención. Funciona, pero genera carga innecesaria en la base y experiencia de usuario degradada (2s de retraso mínimo).

**Solución:** realtime nativo de la base de datos (Supabase Realtime, PostgreSQL LISTEN/NOTIFY, websockets). El frontend recibe el evento en <1 segundo real.

### Anti-patrón 2 — Trigger en la tabla de Resultados

El trigger se coloca en la tabla de salida (ej. `facturacion_comprobantes`) en vez de en la tabla de Intenciones. Resultado: el motor se dispara cuando ya hay resultado — loop infinito potencial, flujo transaccional roto.

**Solución:** trigger solo en la tabla de Intenciones con condición `estado = 'pendiente'`. La tabla de Resultados es destino pasivo, no disparador.

### Anti-patrón 3 — Estado implícito en el tipo

El estado de la Intención se infiere de la existencia o ausencia del resultado asociado. Difícil de consultar, difícil de auditar.

**Solución:** columna `estado` explícita en la tabla de Intenciones con valores enumerados (`pendiente`, `procesando`, `exitoso`, `fallido`). Todos los flujos consultan y actualizan esta columna.

### Anti-patrón 4 — Reintentos sin idempotencia

El motor reintenta fallos automáticamente, pero la operación no es idempotente. Resultado: duplicados, inconsistencias, corrupción de datos.

**Solución:** verificación de idempotencia obligatoria antes de cada operación. Si el resultado ya existe, no re-procesar. El patrón se refuerza naturalmente con A-4 (Trauma Empaquetado) que maneja los reintentos de forma disciplinada.

---

## Los componentes no se llaman — reaccionan

La clave conceptual del patrón es que **los componentes del sistema no se invocan directamente entre sí**. Se comunican exclusivamente a través de estado persistente.

Esto tiene consecuencias profundas:

- **Desacoplamiento temporal completo**: el componente A no necesita que B esté vivo para registrar su Intención. B la procesa cuando esté vivo.
- **Desacoplamiento de deployment**: A y B pueden actualizarse independientemente sin coordinar releases.
- **Desacoplamiento de escalabilidad**: si B es el cuello de botella, se agregan más instancias de B sin tocar A.
- **Observabilidad emergente**: la tabla de Intenciones es un log natural de todo lo que el sistema está procesando.

---

## Relación con otros patrones

### Con A-1 (Adaptador Universal)

A-1 encapsula el contacto con el exterior. A-3 desacopla temporalmente ese contacto del resto del sistema. Juntos, el sistema interno es inmune a la latencia y fragilidad del exterior.

### Con A-2 (CDD/RLS)

Las tablas de Intenciones heredan naturalmente las políticas RLS de la base. Un tenant solo ve sus propias Intenciones. La seguridad del patrón event-driven es gratuita si ya se implementó CDD.

### Con A-4 (Trauma Empaquetado)

A-4 resuelve qué hacer cuando el proveedor externo falla durante el procesamiento asíncrono de A-3. Son patrones complementarios: A-3 desacopla temporalmente, A-4 maneja los fallos que ocurren durante ese desacoplamiento.

### Con el Manifiesto Muerte al Hardcoding

El tipo I de hardcoding (temporal) es exactamente lo que A-3 elimina. El tiempo deja de ser una constante de bloqueo y pasa a ser una variable asíncrona. El sistema nunca bloquea al usuario esperando procesos externos.

---

## Conclusión

A-3 no es una optimización de performance. Es una **decisión arquitectónica fundamental** sobre cómo el sistema trata el tiempo.

Un sistema sincrónico acepta la latencia de sus dependencias como propia. Un sistema event-driven rechaza esa herencia y establece su propio tempo. El usuario experimenta el sistema a velocidad del sistema — no a velocidad del eslabón más lento.

Implementar A-3 requiere inversión inicial (tablas, triggers, suscripciones realtime). Pero esa inversión se paga con la primera caída del proveedor externo, cuando el sistema sigue pareciendo vivo para el usuario mientras el motor reintenta en background.

Es la diferencia entre un sistema frágil que hereda la fragilidad de sus proveedores, y un sistema robusto que los consume como servicios reemplazables.

---

*Para el patrón que maneja los fallos transitorios durante el procesamiento asíncrono, ver [`02-framework/patrones-auto-healing.md`](../02-framework/patrones-auto-healing.md) (A-4 Trauma Empaquetado).*
*Para el aislamiento de contacto con servicios externos que típicamente son la razón del desacoplamiento temporal, ver [`03-patrones/a1-adaptador-universal.md`](a1-adaptador-universal.md).*
