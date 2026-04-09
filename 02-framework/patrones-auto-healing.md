# Patrones avanzados: Auto-Healing y cognición aplicada

> *"La Ingeniería Lineal automatiza el caso de éxito. La Ingeniería No Lineal automatiza el caso de fallo."*

---

## Introducción

El framework base establece cómo construir sistemas complejos con fricción estructural mínima. Esta expansión resuelve la frontera siguiente: **cómo garantizar que el sistema sea homeostático** — que sobreviva a la entropía de producción y a los fallos de infraestructura externa sin requerir intervención humana inmediata.

Tres patrones componen esta capa:

- **A-4** — El fallo como señal estructural (arquitectura)
- **C-4** — Aislamiento de memoria bitemporal (cognición)
- **C-5** — Diagnóstico con restricciones Zero-Trust (cognición)

---

## Patrón A-4: El fallo como señal estructural
*Alias: Trauma Empaquetado / Dead Letter Recovery*

### El problema

En arquitecturas tradicionales, un error de proveedor externo — timeout 503, gateway caído — rompe el flujo de ejecución completo. Los procesos masivos se detienen. Un ingeniero debe analizar logs crípticos y reintentar la operación manualmente. A las 3am si es necesario.

### La solución formal

El error **nunca es terminal para el sistema**. Ante el fallo de cualquier interacción con un entorno hostil, el sistema ejecuta la siguiente secuencia:

1. **Captura:** registra el payload original, el estado de la transacción y los metadatos completos del error
2. **Encapsula:** sella esta información en un contenedor atómico — el **Trauma Empaquetado**
3. **Deposita:** inserta el trauma en la **Cola de Errores de Nivel 2 (DLQ)**
4. **Continúa:** el proceso principal ignora la anomalía individual y sigue con el resto del volumen

El usuario no ve un error fatal. Ve un estado intermedio honesto: procesamiento diferido.

### El mecanismo de sanación

Un **Agente de Recuperación Asíncrona** opera en ciclos de baja demanda — madrugadas, ventanas sin tráfico. Patrulla la DLQ y evalúa cada trauma:

- Si la causa fue **transitoria** (infraestructura del proveedor): reinyecta la transacción en el punto exacto de fallo original
- Si la causa fue **lógica** (error de negocio): cataloga el trauma para revisión humana sin bloquear el sistema

### Por qué genera resiliencia extrema

El sistema asume que los servicios externos *fallarán por diseño*. Al empaquetar el fallo como una señal recuperable, transforma incidentes de soporte en latencias asíncronas automáticas. Lo que antes era una alerta de madrugada se convierte en una cola que se procesa sola.

---

## Patrón C-4: Aislamiento de memoria bitemporal
*Alias: Separación de Hemisferios Cognitivos*

### El problema

Los agentes de IA que mezclan toda la información en un solo espacio vectorial tienden a alucinar correlaciones falsas: confunden incidentes técnicos pasados con contextos de usuario actuales, producen diagnósticos incorrectos y generan respuestas que suenan plausibles pero están equivocadas.

### La solución formal

La inteligencia del sistema se divide en **dos hemisferios de memoria aislados**:

**Hemisferio A — Memoria de sesión (íntima)**
El contexto específico de la interacción actual: preferencias del operador, historial de la conversación, estado de la tarea en curso. Efímero, personal, actualizable en tiempo real.

**Hemisferio B — Grafo global (verdad institucional)**
El conocimiento permanente del sistema: historial de caídas de proveedores, patrones de error documentados, documentación técnica validada, alertas de seguridad universales. Persistente, compartido, inmutable por diseño.

### El resultado práctico

Cuando un usuario experimenta un fallo, el agente consulta el Hemisferio B antes de responder. Puede decir con precisión: *"Este comportamiento no es un error de tu configuración — es un incidente global del proveedor X detectado y empaquetado hace 10 minutos."*

Sin la separación bitemporal, el agente confundiría ese incidente global con un error local del usuario. Con ella, el diagnóstico es correcto desde el primer intento.

---

## Patrón C-5: Diagnóstico con restricciones (ReAct Zero-Trust)
*Alias: Constitución XML para agentes operativos*

### El problema

Los agentes conversacionales sin restricciones intentan "adivinar" soluciones basándose en la probabilidad estadística del modelo de lenguaje. En entornos de desarrollo o soporte técnico, esto genera consejos que suenan correctos pero pueden ser peligrosos o completamente incorrectos.

La confianza ciega en el razonamiento abductivo de un modelo de lenguaje es un riesgo de Nivel 1 en sistemas de misión crítica.

### La solución formal

Los agentes operativos **nunca operan con libertad de razonamiento**. Deben seguir un Protocolo de Pasos Fijos (SOP) que ancla sus respuestas exclusivamente a la evidencia extraída de herramientas concretas.

```xml
<diagnostic_protocol>
  <!-- Paso 1: obligatorio antes de cualquier diagnóstico -->
  <step id="1" tool="tool_telemetria_sistema" required="true">
    Hay traumas empaquetados relacionados con este sintoma?
  </step>

  <!-- Paso 2: obligatorio antes de cualquier diagnóstico -->
  <step id="2" tool="tool_escaner_persistencia" required="true">
    Cual es el estado real del registro en la base de datos?
  </step>
</diagnostic_protocol>

<security_bound>
  PROHIBIDO: establecer conclusiones si existe discrepancia
  entre la telemetria y el grafo de conocimiento.
  Accion requerida: derivar a supervision humana con reporte completo.
</security_bound>
```

### Por qué este patrón es crítico

La inteligencia sintética en sistemas críticos no adivina — procesa herramientas e interpreta realidades técnicas con precisión quirúrgica. Cada conclusión debe tener evidencia instrumental que la respalde. Si la evidencia es contradictoria, el agente no decide solo — escala al humano con toda la información disponible.

Un agente que solo habla cuando tiene evidencia es infinitamente más valioso que uno que siempre tiene una respuesta.

---

## La relación entre los tres patrones

Los tres patrones forman una cadena de resiliencia:

```
Fallo externo
    ↓
A-4 lo captura y encapsula  →  nunca es terminal
    ↓
C-4 lo registra en el hemisferio correcto  →  no contamina el contexto de sesión
    ↓
C-5 lo diagnostica con evidencia instrumental  →  no adivina la causa
    ↓
Sistema sano — sin intervención humana inmediata
```

---

*Para el contexto arquitectónico de estos patrones en el framework general, ver [`02-framework/framework-vision-general.md`](framework-vision-general.md).*
