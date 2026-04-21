# Catálogo operativo de patrones V5

Referencia de aplicación de cada patrón. Para cada uno: cuándo activarlo, qué hacer exactamente, qué entregable exigir.

---

## Patrones cognitivos

### C-1 — Pre-Computación del Dominio

**Cuándo activar:** al inicio de cualquier proyecto nuevo o al integrar un servicio externo desconocido. Si el usuario abre el IDE antes de pasar el umbral de suficiencia, bloquealo.

**Qué hacer:**
1. Prohibir código hasta completar la investigación
2. Usar IA investigativa para mapear el dominio: endpoints, rate limits, protocolos legados, autenticación, flujo manual del usuario
3. Identificar los 3-5 "puntos hostiles" que generarán fricción

**Entregable obligatorio:** `REGLAS_NEGOCIO.md` con:
- Contratos de datos exactos de cada servicio externo
- Restricciones hostiles y sus workarounds
- Flujo de trabajo manual del usuario
- Diseño de base de datos completo (independiente de la API)

**Umbral de suficiencia — 4 preguntas de memoria:**
1. ¿Qué hace el sistema externo exactamente?
2. ¿Cuál es el cuello de botella real que mi sistema viene a romper?
3. ¿Tengo un diseño de DB que no dependa de ver la respuesta de la API?
4. ¿Cuáles son los puntos hostiles y tengo un Adaptador para cada uno?

Si alguna no tiene respuesta clara, C-1 no terminó.

---

### C-2 — Offloading Cognitivo Estratégico (Paradigma CPU/GPU)

**Cuándo activar:** siempre, en toda sesión. Defines el rol permanente del agente.

**Responsabilidades GPU (vos):**
- Análisis de patrones en 50+ archivos
- Generación de componentes según plantilla
- Auditoría de convenciones de nombrado
- Escritura de documentación de interfaces
- Aplicación de parches sistémicos masivos

**Responsabilidades CPU (Arquitecto humano):**
- Definición de la ontología del sistema
- Evaluación de riesgo y seguridad
- Validación de abstracciones clave
- Decisión de integración estratégica

**Señal de alarma:** si el Arquitecto no puede explicar la lógica interna del código que generaste, el paradigma está fallando.

---

### C-3 — Exocórtex de Memoria Activa

**Cuándo activar:** al inicio de cualquier proyecto. Proponer esta estructura desde el Día 1.

**Estructura del Exocórtex:**
```
docs/
├── CONSTITUCION_TECNICA.md    ← Leyes físicas e inmutables del proyecto
├── REGLAS_NEGOCIO.md          ← Mapa de la realidad del dominio
├── SNAPSHOT_ESTADO.md         ← Contexto actual al cierre de sesión
├── REGISTRO_TRAUMAS.md        ← Catálogo de errores sistémicos y su cura
└── INDICE_MAESTRO.md          ← Enrutador de la inteligencia del proyecto
```

**Regla de oro:** si una decisión arquitectónica requiere más de 5 minutos de pensamiento, debe persistirse en la Constitución antes de continuar.

---

### C-4 — Aislamiento de Memoria Bitemporal

**Cuándo activar:** cuando el agente opera con memoria de sesión y necesita diagnósticos precisos.

**Hemisferio A — Memoria de sesión (íntima):** contexto específico de esta interacción, preferencias del operador, estado de la tarea en curso. Efímero.

**Hemisferio B — Grafo global (verdad institucional):** historial de caídas de proveedores, patrones de error documentados, documentación técnica validada. Persistente.

Nunca mezclar los dos. Un incidente global del proveedor va al Hemisferio B. El contexto de esta sesión va al Hemisferio A.

---

### C-5 — Diagnóstico con Restricciones (ReAct Zero-Trust)

**Cuándo activar:** ante cualquier diagnóstico de error en producción o sistema.

**Protocolo obligatorio antes de cualquier conclusión:**
```xml
<diagnostic_protocol>
  <step id="1" required="true">
    ¿Hay traumas empaquetados relacionados con este síntoma?
  </step>
  <step id="2" required="true">
    ¿Cuál es el estado real del registro en la base de datos?
  </step>
</diagnostic_protocol>

<security_bound>
  PROHIBIDO: establecer conclusiones si existe discrepancia
  entre la telemetría y el grafo de conocimiento.
  Acción requerida: derivar a supervisión humana con reporte completo.
</security_bound>
```

No adivinás. No inferís sin evidencia instrumental.

---

## Patrones de arquitectura

### A-1 — Adaptador de Dominio Universal

**Cuándo activar:** ante cualquier integración con servicio externo. Sin excepción.

**Anatomía obligatoria:**
1. **Aislamiento PKI/Auth:** gestiona certificados y sesiones de forma opaca al resto
2. **Normalización:** convierte formatos legados a estructuras internas modernas
3. **Interpretación de errores:** los errores externos se traducen al lenguaje interno

**Ley:** ningún módulo del sistema habla con el tercero directamente. Todo pasa por el Adaptador.

**Verificación:** si la API externa cambia su contrato, ¿solo el Adaptador necesita actualizarse? Si la respuesta es no, el aislamiento está roto.

---

### A-2 — Constraint-Driven Development (CDD)

**Cuándo activar:** antes de escribir la primera tabla de la base de datos. Siempre.

**Implementación obligatoria:**
- **RLS activo desde el primer registro** — no es opcional, no es "lo agrego después"
- **Invariantes matemáticos:** constraints `CHECK`, `UNIQUE`, `NOT NULL` para evitar degradación del dato
- **Triggers de auditoría:** registro automático de quién movió el sistema

**Verificación:** ¿es físicamente imposible que un usuario acceda a datos de otro tenant? Si la respuesta depende del código de aplicación en lugar de la DB, el CDD no está aplicado.

---

### A-3 — Coordinación Event-Driven

**Cuándo activar:** ante cualquier operación con latencia >500ms.

**Patrón:**
1. El frontend registra la **Intención** en la DB con estado inicial
2. El backend reacciona al cambio de estado de forma asíncrona
3. El resultado llega mediante eventos en tiempo real

Los componentes no se llaman entre sí. Reaccionan a estados.

---

### A-4 — Trauma Empaquetado (Auto-Healing L2)

**Cuándo activar:** al diseñar el manejo de errores de cualquier integración externa.

**Secuencia obligatoria ante fallo externo:**
1. **Captura:** registra payload original + estado de transacción + metadatos del error
2. **Encapsula:** sella en contenedor atómico — el Trauma Empaquetado
3. **Deposita:** inserta en la Cola de Errores de Nivel 2 (DLQ)
4. **Continúa:** el proceso principal ignora la anomalía y sigue con el resto del volumen

**Agente de Recuperación Asíncrona:** opera en ciclos de baja demanda. Evalúa cada trauma:
- Causa transitoria (infraestructura) → reinyecta en el punto exacto de fallo
- Causa lógica (negocio) → cataloga para revisión humana

**Ley:** el error nunca es terminal para el sistema.

---

## Patrones de gobernanza

### G-1 — Debugging de Generadores Sistémicos

**Cuándo activar:** cuando el mismo tipo de error aparece en 3 o más lugares.

**Protocolo:**
1. Detener todas las correcciones individuales
2. Identificar el generador: ¿qué plantilla, instrucción o patrón produjo todos estos errores?
3. Corregir el generador
4. Aplicar el parche sistémico a todas las instancias simultáneamente

Corregir síntomas individuales = operación lineal.
Corregir el generador = operación exponencial.

---

### G-2 — Gobernanza desde el Día 0

**Cuándo activar:** al inicio de cualquier proyecto, antes de escribir código.

**Checklist mínimo:**
- [ ] Branch protection activa en la rama principal
- [ ] Commits semánticos configurados
- [ ] `CONSTITUCION.md` escrita y versionada
- [ ] Estructura de carpetas del Exocórtex creada
- [ ] RLS habilitado en la primera tabla

**Cierre térmico:** el último día de cada ciclo es exclusivamente para gobernanza. Sin código nuevo. Sin excepciones. Entregable: Exocórtex actualizado, deuda técnica catalogada, PRs cerrados.
