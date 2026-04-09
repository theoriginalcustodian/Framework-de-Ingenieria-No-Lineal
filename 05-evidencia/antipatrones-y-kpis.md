# Anti-patrones y KPIs del método

> Si una decisión arquitectónica requiere más de 5 minutos de pensamiento, debe persistirse en la Constitución.

---

## Los cuatro anti-patrones que destruyen la velocidad

Estos no son errores teóricos. Son trampas estructurales documentadas empíricamente en la construcción de sistemas de grado enterprise. Cada uno tiene un síntoma observable y una regla concreta para evitarlo.

---

### Anti-patrón 1: Feature creep antes de la validación

**El problema:** el impulso creativo que pospone el contacto con el usuario real. Cada feature nueva antes de tener validación de mercado es tiempo robado a la supervivencia del proyecto.

**La regla:** el sistema se cierra funcionalmente al Día 6. Nada nuevo entra después de ese punto hasta tener la primera validación real.

**Síntoma de alarma:** el backlog de ideas crece más rápido que el backlog de validaciones.

---

### Anti-patrón 2: Debuggear síntomas en lugar de auditar generadores (GPU fallido)

**El problema:** corregir manualmente errores que tienen el mismo origen en múltiples lugares. Es la señal más clara de que el Arquitecto abandonó su rol CPU y se convirtió en operario de código.

**La regla:** si un bug aparece en más de 3 lugares de código generado por IA, no se corrige ninguno manualmente. Se escribe un prompt de auditoría y se aplica un parche sistémico que corrige el generador, no los síntomas.

**Síntoma de alarma:** tiempo de debugging supera las 2 horas en errores del mismo tipo sin haber identificado la causa raíz.

---

### Anti-patrón 3: Conexión prematura con servicios externos

**El problema:** integrar APIs de terceros antes de que la infraestructura propia esté estable. Los problemas del proveedor externo bloquean el momentum de construcción del producto.

**La regla:** el sistema se construye asumiendo condiciones ideales ("APIs mágicas") hasta el Día 4. La integración con servicios externos hostiles ocurre cuando el 70% de la infraestructura propia ya está estable.

**Síntoma de alarma:** el Arquitecto pasa más de una jornada peleando con un servicio de terceros antes de tener su propio esquema de datos finalizado.

---

### Anti-patrón 4: Omitir el cierre térmico

**El problema:** terminar un ciclo de trabajo sin institucionalizar lo construido. Cada sesión que no cierra correctamente acumula deuda cognitiva que se paga con tiempo de recalentamiento en la próxima.

**La regla:** el último día de cada ciclo se dedica exclusivamente a documentación, gobernanza y PRs. Sin código nuevo. Sin excepciones.

**Síntoma de alarma:** al retomar el proyecto tras 72 horas de pausa, el tiempo de reconstrucción de contexto supera los 30 minutos.

---

## Tabla de KPIs: indicadores de velocidad PEAP-V5

Estos indicadores funcionan como termómetro de salud del método. Si varios valores están en zona de alarma simultáneamente, hay un problema sistémico — no un problema de esfuerzo.

| Indicador | Valor saludable | Valor de alarma |
|---|---|---|
| Tiempo para describir el sistema sin consultar docs | < 5 minutos | > 15 minutos |
| Bugs similares antes de buscar el patrón sistémico | ≤ 3 | > 5 |
| Tiempo para recuperar contexto tras una pausa | < 15 minutos | > 45 minutos |
| % del sistema construido sin API real conectada | > 70% | < 40% |
| Features nuevas escritas en el día de gobernanza | 0 | > 0 |
| Tiempo de debugging sin aplicar parche sistémico | < 2 horas | > 2 horas |
| Documentación actualizada al cierre de cada sesión | Siempre | A veces |

---

## Interpretación

Los KPIs en zona de alarma no son un juicio sobre el Arquitecto — son una señal de que el método no se está aplicando en algún punto concreto. Cada indicador apunta directamente a uno de los cuatro anti-patrones:

- **Tiempo de descripción alto** → Anti-patrón 4 (cierre térmico omitido)
- **Bugs repetitivos** → Anti-patrón 2 (debuggear síntomas)
- **% bajo sin API real** → Anti-patrón 3 (conexión prematura)
- **Features en día de gobernanza** → Anti-patrón 1 (feature creep)

El diagnóstico es directo. La corrección también.

---

*Para el protocolo completo del ciclo de 6 días donde estos KPIs se aplican, ver [`02-framework/protocolo-peap-v5-144h.md`](../02-framework/protocolo-peap-v5-144h.md).*
