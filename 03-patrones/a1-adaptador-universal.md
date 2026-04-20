# Patrón A-1: El Adaptador de Dominio Universal

> *"Si tu código central conoce la sintaxis exacta de un servicio externo, no construiste una arquitectura — construiste una dependencia."*

---

## La tesis

Todo sistema complejo debe comunicarse con servicios externos: APIs de terceros, protocolos legados, proveedores con interfaces hostiles. La Ingeniería Lineal acepta esta comunicación como un mal necesario y la distribuye a lo largo del código: múltiples módulos del núcleo de negocio hablan directamente con esos servicios externos.

La Ingeniería No Lineal interpone **un único componente hermético** — el Adaptador Universal — entre el caos externo y la pureza del sistema interno. Ningún otro módulo habla con el tercero. Nunca.

La diferencia no es cosmética. Cuando la API externa cambia su contrato, rotaliza sus endpoints o introduce códigos de error nuevos, solo el Adaptador se ve afectado. El resto del sistema permanece intacto.

---

## El problema que resuelve

### El anti-patrón: acoplamiento distribuido

En arquitecturas lineales, la integración con un servicio externo se propaga por el código como una enfermedad. Diferentes módulos llaman directamente al servicio porque es la ruta de menor resistencia al escribir cada feature.

```
Módulo A ──┐
Módulo B ──┼──→ API externa (timeouts crípticos, XML legado, errores ambiguos)
Módulo C ──┤
Módulo D ──┘
```

Cuando la API cambia, cada módulo debe ser corregido individualmente. Cuando aparece un error nuevo, cada módulo lo interpreta como puede. Cuando el proveedor introduce rate limits, cada módulo los maneja por separado. La deuda técnica se multiplica por el número de puntos de acoplamiento.

Peor aún: el lenguaje del servicio externo (códigos de error específicos, estructuras de datos propietarias, formatos legados) contamina el vocabulario del negocio interno. Funciones del dominio terminan conociendo detalles irrelevantes del proveedor.

### El costo real

El costo no es la cantidad de código duplicado — es la **coherencia arquitectónica perdida**. El sistema deja de tener un modelo mental único. Cada módulo tiene su propia interpretación del servicio externo, y esas interpretaciones divergen con el tiempo.

---

## Anatomía del Adaptador

El Adaptador es un componente único con tres responsabilidades precisas:

### 1. Aislamiento de autenticación y protocolo

Gestiona certificados, tokens rotativos, sesiones, handshakes criptográficos — toda la complejidad ceremonial del servicio externo. El resto del sistema no conoce PKI, no conoce OAuth, no conoce expiraciones. Invoca al Adaptador con intenciones de negocio; el Adaptador traduce.

### 2. Normalización semántica

Convierte formatos legados del servicio externo a estructuras internas modernas y coherentes. Si el proveedor devuelve XML con timestamps en formato EDIFACT, el Adaptador lo transforma en un objeto JSON interno con timestamps ISO 8601. El resto del código nunca ve el formato original.

### 3. Interpretación de errores

Los errores del servicio externo no se propagan como excepciones genéricas. El Adaptador los mapea a un lenguaje semántico interno:

- `HTTP 429 + header Retry-After` → `{ tipo: 'RATE_LIMIT_EXTERNO', reintentable: true, espera_seg: 30 }`
- `HTTP 402 + body específico` → `{ tipo: 'CREDITOS_AGOTADOS', reintentable: false, alerta_critica: true }`
- `XML FaultString específico` → `{ tipo: 'ERROR_VALIDACION_DOMINIO', reintentable: false, detalle: ... }`

El código de negocio nunca reacciona a códigos HTTP. Reacciona a intenciones semánticas del dominio propio.

---

## La regla inviolable

**Ningún módulo del sistema, excepto el Adaptador Universal, puede comunicarse directamente con el servicio externo.**

No hay excepciones. No hay *"solo esta vez"*. No hay *"es solo una llamada rápida"*. Esta regla es gobernanza constitucional, no sugerencia de estilo.

La disciplina se refuerza estructuralmente:

- **Linting:** reglas que detectan llamadas directas a URLs del servicio externo fuera del Adaptador
- **Revisión obligatoria:** cualquier PR que importe el SDK del servicio externo fuera del Adaptador se bloquea automáticamente
- **Auditoría periódica:** grep recursivo del código buscando strings característicos del servicio externo

---

## Implementación — Tabla declarativa como corazón

Una implementación efectiva del Adaptador usa una **tabla declarativa** en el centro de su lógica de interpretación de errores. Cuando aparece un error nuevo del servicio externo, se agrega una entrada a la tabla — no se modifica código.

```javascript
const ERROR_MAP = {
  402: { tipo: 'CREDITOS_AGOTADOS',   reintentable: false, alerta: true  },
  429: { tipo: 'RATE_LIMIT',          reintentable: true,  alerta: false },
  503: { tipo: 'SERVICIO_CAIDO',      reintentable: true,  alerta: true  },
  // Agregar nuevas entradas aquí al descubrir códigos nuevos
};
```

Esta tabla es manifestación directa del patrón A-1 sobre sí mismo: una sola estructura de datos (tabla) captura N casos. Los futuros errores del servicio externo se incorporan agregando una línea, no reescribiendo lógica.

Es el **Manifiesto Muerte al Hardcoding** aplicado al propio Adaptador.

---

## Cuándo aplicar este patrón

**Aplicar siempre que:**

- El sistema se integra con ≥1 servicio externo con interfaz hostil (protocolos legados, errores crípticos, contratos cambiantes)
- Hay múltiples módulos del negocio que necesitan esa integración
- El servicio externo es crítico para el negocio (caída del servicio → pérdida de funcionalidad core)
- Existe posibilidad razonable de que el contrato del servicio cambie

**Aplicar con menor rigor cuando:**

- La integración es con un servicio interno bajo tu control (pero sigue siendo buena práctica)
- El servicio externo es estable, documentado y con SLA confiable (aún así, preferible tener Adaptador)

**No aplicar cuando:**

- La integración es una única llamada simple desde un único lugar, sin probabilidad razonable de crecer
- El costo de construir el Adaptador supera claramente el costo de mantenimiento distribuido (raro — suele ser la falacia del desarrollador apurado)

---

## Anatomía del Adaptador maduro

Un Adaptador bien construido expone hacia adentro una interfaz limpia que habla el lenguaje del dominio:

```
// Hacia adentro del sistema (lenguaje del dominio propio):
adaptador.consultarEstadoComprobante(cuit, numero)
adaptador.emitirFactura(datos)
adaptador.validarInscripcion(cuit)

// Hacia afuera del sistema (lenguaje del servicio externo):
<oculto al resto del código>
```

La interfaz pública del Adaptador tiene cero contaminación del vocabulario externo. Un desarrollador nuevo que lee solo los llamantes al Adaptador puede entender el negocio sin conocer jamás los detalles del proveedor.

---

## Relación con otros patrones

### Con A-3 (Event-Driven)

El Adaptador se beneficia naturalmente del desacoplamiento Intención-Resultado de A-3. Las operaciones con latencia (caídas del proveedor, reintentos largos) se procesan asincrónicamente. El Adaptador emite eventos; el resto del sistema los consume cuando están disponibles.

### Con A-4 (Trauma Empaquetado)

El Adaptador es el **lugar natural donde se empaquetan los traumas** externos. Cuando el servicio externo falla, es el Adaptador quien captura el payload, sella el trauma en la DLQ y decide si escala o continúa. El resto del código nunca ve el fallo externo como excepción fatal.

### Con el Manifiesto Muerte al Hardcoding

El Adaptador es la implementación arquitectónica del principio *"la esperanza no es arquitectura"*. Asume por diseño que el servicio externo es hostil, cambiante e impredecible — y lo neutraliza.

### Con C-1 (Pre-Computación del Dominio)

Durante la fase C-1, los puntos hostiles del dominio se identifican explícitamente. El Adaptador es la respuesta estructural a esos puntos hostiles. Sin C-1 previo, el Adaptador es reactivo. Con C-1 previo, el Adaptador es preventivo.

---

## Validación empírica del patrón

En proyectos con integración a servicios externos regulatorios complejos (ejemplos: agencias fiscales, portales gubernamentales, procesadores de pagos con interfaces legadas), la implementación temprana del Adaptador ha mostrado resultados consistentes:

- **Reducción del 80-90% del tiempo de adaptación** ante cambios del contrato externo
- **Cero propagación de formatos legados** al código de negocio
- **Mejora sustancial de testabilidad**: el Adaptador se mockea completo, el resto del sistema se prueba sin dependencia externa
- **Onboarding acelerado**: desarrolladores nuevos aprenden el negocio sin estudiar el SDK del proveedor

---

## Anti-patrones a evitar en implementación

### Anti-patrón 1 — Adaptador pasivo

El Adaptador solo reempaqueta las llamadas sin traducir nada. Interface pública que sigue hablando el lenguaje del proveedor. No hay ganancia arquitectónica.

**Solución:** la interface pública del Adaptador habla el lenguaje del dominio propio. Si una función del Adaptador devuelve `FaultString` o `ErrorCode` del proveedor, el Adaptador está fallando.

### Anti-patrón 2 — Adaptador multifuncional

Un mismo Adaptador maneja múltiples servicios externos diferentes. Se convierte en un Dios-objeto que concentra toda la complejidad.

**Solución:** un Adaptador por servicio externo. Si dos servicios externos son semánticamente equivalentes (ej. dos procesadores de pago intercambiables), usar patrón Strategy con Adaptadores hermanos.

### Anti-patrón 3 — Fuga de detalles externos

El código del negocio termina importando tipos del SDK externo porque "es solo un tipo, no es código". Ese tipo es una fuga.

**Solución:** el Adaptador define sus propios tipos internos. Si el SDK externo cambia los suyos, solo el Adaptador se ajusta.

### Anti-patrón 4 — "Solo una llamadita rápida"

Un desarrollador escribe una llamada directa al servicio externo en otro módulo porque "es un caso especial" o "es temporal". Seis meses después, hay 15 casos especiales.

**Solución:** el linting bloquea imports directos del SDK externo fuera del Adaptador. Gobernanza estructural.

---

## El Adaptador como punto de observabilidad

Un efecto secundario valioso: el Adaptador es el punto único donde ocurren todas las interacciones con el servicio externo. Esto lo convierte en el lugar natural para:

- Instrumentar métricas de latencia/errores del proveedor
- Implementar circuit breakers
- Aplicar rate limiting proactivo
- Alimentar el sistema de traumas empaquetados

La observabilidad emergente es otra forma de dividendos compuestos — beneficios que aparecen sin haber sido objetivo explícito.

---

## Conclusión

El Adaptador Universal no es un patrón técnico ingenioso. Es una **decisión arquitectónica fundacional**: aceptar que el mundo exterior al sistema es caótico, y encapsular ese caos en un único componente que lo neutraliza.

Sin Adaptador, el caos externo coloniza el código del dominio. Con Adaptador, el código del dominio habla su propio lenguaje, inmutable ante cualquier cambio del ecosistema externo.

Es la diferencia entre un sistema que vive bajo la dictadura de sus proveedores y un sistema que los consume como servicios reemplazables.

---

*Para el patrón que gestiona los fallos del servicio externo una vez capturados por el Adaptador, ver [`02-framework/patrones-auto-healing.md`](../02-framework/patrones-auto-healing.md) (A-4 Trauma Empaquetado).*
*Para la pre-identificación de los puntos hostiles que el Adaptador debe neutralizar, ver [`03-patrones/c1-precomputacion-de-dominio.md`](c1-precomputacion-de-dominio.md).*
