# Patrón G-2: Gobernanza desde el Día 0

> *"La calidad no se añade al final del proyecto. Es el sistema de rieles que permite la velocidad inicial."*

*Alias: Institucionalización prematura de la calidad*

---

## La tesis

En la Ingeniería Lineal, la gobernanza — branch protection, commits semánticos, constitución técnica, CI/CD — se considera "overhead" que se añade cuando el proyecto "madura". Se implementa después del MVP, antes de producción, o cuando el primer bug grave revela que era necesaria.

La Ingeniería No Lineal invierte este orden por completo. **La gobernanza no es un costo del proyecto maduro — es el prerequisito de la velocidad del proyecto joven.** Implementarla tarde es órdenes de magnitud más costoso que implementarla el Día 0.

Los sistemas que adoptan gobernanza temprana acumulan dividendos compuestos: cada nueva funcionalidad se construye sobre rieles sólidos, cada bug se captura en su mínima expresión, cada desarrollador nuevo opera con reglas claras.

---

## El problema que resuelve

### El anti-patrón: gobernanza como afterthought

En arquitecturas lineales, el orden operativo típico es:

1. Escribir el MVP rápido para validar la idea
2. Agregar tests cuando empiezan los bugs
3. Implementar CI/CD cuando hay múltiples contribuidores
4. Escribir constitución técnica cuando el onboarding se vuelve doloroso
5. Aplicar branch protection cuando alguien rompe `main`

Cada paso se posterga hasta que el dolor de no hacerlo supera al costo de hacerlo. El resultado: el proyecto acumula deuda de gobernanza que se paga en intereses durante años.

### El costo real

El costo no es la hora perdida en implementar CI/CD tarde — es la cascada de consecuencias:

- Miles de commits sin convención → historial impenetrable
- Meses de desarrollo sin branch protection → múltiples rupturas de `main` que destruyen la confianza en el proceso
- Proyecto sin constitución → cada desarrollador tiene su propia interpretación de las reglas
- Ausencia de cierre térmico de sprints → la deuda técnica se acumula invisible hasta ser inmanejable

Estas consecuencias son **irreversibles sin esfuerzo sostenido**. Revisar miles de commits mal formateados después del hecho es trabajo inútil.

---

## La regla operativa

**La gobernanza se implementa antes que la primera línea de código de negocio.**

El Día 0 del proyecto no produce funcionalidades — produce infraestructura de gobernanza. El Día 1 empieza construyendo sobre esa infraestructura.

La tentación natural es saltarse este Día 0 "porque queremos empezar rápido". Esa tentación es exactamente lo que la Ingeniería Lineal normaliza, y el origen de la deuda técnica que castigará al proyecto durante toda su vida.

---

## Los cinco elementos constitucionales

### 1. Branch protection

La rama principal del repositorio (`main`) debe ser **físicamente imposible de modificar directamente**. Todo cambio entra por Pull Request con revisión obligatoria.

Esto no es "mejor práctica" — es gobernanza estructural. Sin branch protection, cualquier desarrollador con acceso al repositorio puede romper el sistema accidentalmente. Con branch protection, la posibilidad se elimina por construcción.

Implementación típica: reglas del proveedor Git (GitHub, GitLab, Bitbucket) que exigen ≥1 aprobación + checks CI pasados antes de permitir merge a `main`.

### 2. Commits semánticos

Todo commit sigue una convención explícita (típicamente Conventional Commits): `feat:`, `fix:`, `docs:`, `chore:`, etc. Cada cambio tiene tipo, scope y mensaje descriptivo.

El valor no es estético — es **trazabilidad**. Dos años después, cuando alguien busca "cuándo se agregó la autenticación de tokens", una búsqueda por `feat(auth)` devuelve la respuesta en segundos. Sin convención, esa búsqueda toma horas o se abandona.

Implementación: `commitlint` en pre-commit hook + CI check que bloquea PRs con commits mal formateados.

### 3. Constitución Técnica desde el primer día

El archivo `CONSTITUCION_TECNICA.md` existe **antes que el primer commit de negocio**. Define las restricciones absolutas del proyecto: patrones obligatorios, convenciones inamovibles, reglas que ningún agente (humano o IA) puede violar.

La Constitución no espera a ser "completa" para existir — arranca con las 5-10 restricciones que el Arquitecto sabe desde el principio (ej. "multi-tenant desde el inicio", "ningún servicio externo sin Adaptador"). Se expande con el tiempo conforme emergen restricciones nuevas.

### 4. Cierre térmico de sprint

La última jornada de cada ciclo de ejecución está dedicada **exclusivamente a gobernanza**. Sin código nuevo. Sin excepciones. En ese día:

- Se actualiza el Exocórtex con las decisiones del ciclo
- Se cataloga la deuda técnica identificada
- Se documentan los traumas resueltos
- Se revisa que las convenciones del sprint estén alineadas con la Constitución

Sin cierre térmico, la deuda se acumula silenciosamente. Con cierre térmico, cada ciclo termina con la casa ordenada.

### 5. Diseño para N+1

Aunque el proyecto se construya con un solo Arquitecto, el sistema se diseña como si mañana ingresaran 3 ingenieros expertos al equipo. Las convenciones son claras, la documentación es suficiente para onboarding, las decisiones están explicadas.

Esta disciplina tiene efecto práctico inmediato: **la IA es el desarrollador N+1**. Cada sesión con un agente IA es un onboarding nuevo. Un proyecto diseñado para N+1 opera con IAs sin fricción cognitiva.

---

## Validación empírica del patrón

En proyectos con G-2 implementado desde el Día 0:

- **Cero rupturas de la rama principal** durante toda la vida del proyecto
- **Onboarding de colaboradores nuevos en horas**, no semanas
- **Historial de commits navegable y útil** años después
- **Deuda técnica visible y controlada** vs invisible y acumulativa
- **Velocidad de desarrollo sostenida** en lugar de degradación con el tiempo

En contraste, proyectos que intentaron implementar G-2 tardíamente:

- Semanas de trabajo recuperando el historial de commits
- Meses de disciplina para establecer cultura de Pull Requests
- Refactoring masivo para alinear código existente con convenciones recién creadas

---

## El argumento económico invertido

La objeción clásica a G-2 es económica: *"no tenemos tiempo de hacer gobernanza antes de construir el producto"*.

El argumento correcto es el inverso: *"no tenemos tiempo de construir el producto sin gobernanza previa, porque la deuda acumulada nos frenará en el segundo mes"*.

Un cálculo honesto:

- Implementar G-2 el Día 0: **1 jornada** de trabajo
- Implementar G-2 en el Día 60 del proyecto: **2-3 semanas** (mitigando deuda acumulada)
- No implementar G-2 nunca: **costo infinito** (el proyecto se vuelve inmantenible)

La inversión de 1 jornada al inicio tiene retorno garantizado antes de la semana 4. Después, el beneficio es puro.

---

## Cuándo aplicar este patrón

**Aplicar obligatoriamente cuando:**

- Se inicia cualquier proyecto nuevo con expectativa de vida ≥3 meses
- El proyecto será mantenido por ≥2 personas (incluso si esas 2 son el Arquitecto actual + un agente IA)
- Hay posibilidad de onboarding de colaboradores futuros

**Aplicar con precaución cuando:**

- Se hereda un proyecto existente sin G-2 — implementarlo retroactivamente es más costoso y requiere migración gradual

**No aplicar cuando:**

- Script de una sola ejecución sin mantenimiento posterior
- Prototipo explícitamente desechable con vida útil <2 semanas

---

## Anti-patrones a evitar

### Anti-patrón 1 — Gobernanza elegida por comité

El equipo debate durante semanas qué convenciones adoptar antes de empezar. Paralisis por análisis. El Día 0 se convierte en Día 30 sin haber escrito código.

**Solución:** convenciones estándar de la industria (Conventional Commits, branch protection default, testing framework establecido). No inventar convenciones propias para un proyecto nuevo.

### Anti-patrón 2 — Constitución aspiracional

El archivo `CONSTITUCION_TECNICA.md` se escribe con reglas que nadie respeta. Es documentación decorativa que nadie consulta.

**Solución:** la Constitución solo incluye reglas que se aplican con rigor. Si una regla no se puede garantizar estructuralmente (vía lint, CI, o revisión obligatoria), se convierte en hardcoding emocional — aspiración sin anclaje.

### Anti-patrón 3 — Cierre térmico pospuesto

El Arquitecto acuerda hacer cierre térmico "al final del próximo sprint". Ese sprint termina con código nuevo urgente y el cierre se pospone. Acumulación de deuda invisible.

**Solución:** el cierre térmico es inviolable. Si el último día del sprint no puede dedicarse a gobernanza, el sprint falló estructuralmente. Se reduce el scope del siguiente sprint para recuperar el ritmo.

### Anti-patrón 4 — Commits semánticos sin enforcement

El equipo "acuerda" usar Conventional Commits. Durante las primeras semanas, 70% de los commits siguen la convención. Después, la disciplina decae. Dos meses después, el historial es caos.

**Solución:** enforcement automatizado obligatorio. `commitlint` en pre-commit hook + CI check. Los commits mal formateados se rechazan, no se aceptan "como excepción".

---

## G-2 es el prerequisito invisible del factor 15-25x

El patrón G-2 rara vez aparece en discusiones sobre velocidad outlier. La atención se va a C-1 (pre-computación), C-2 (CPU/GPU), A-1 (adaptadores) — los patrones visibles que producen velocidad.

Pero esa velocidad solo es sostenible sobre rieles de G-2. Un proyecto sin gobernanza puede ir rápido los primeros 15 días; después empieza a desacelerar por deuda acumulada. La curva de productividad baja en lugar de mantenerse.

Con G-2 bien implementado, la curva se mantiene plana o incluso sube. Cada sprint es más rápido que el anterior porque la infraestructura de gobernanza absorbe el costo marginal del crecimiento.

---

## Relación con otros patrones

### Con A-2 (CDD/RLS)

A-2 es uno de los elementos constitucionales que G-2 exige desde el primer día. Activar RLS en la primera tabla del proyecto es aplicación directa de *"gobernanza prematura"* a seguridad.

### Con C-3 (Exocórtex)

El Exocórtex es la infraestructura documental que G-2 implementa desde el Día 0. Sin G-2, el Exocórtex no existe o se crea tardíamente. Con G-2, el Exocórtex opera desde el primer commit.

### Con G-1 (Debugging de Generadores)

G-1 identifica generadores defectuosos que aparecen durante el desarrollo. G-2 previene muchos de esos generadores estableciendo convenciones claras desde el inicio. G-2 es prevención; G-1 es cura.

### Con el Manifiesto Muerte al Hardcoding

G-2 implementa institucionalmente los principios del manifiesto. La Constitución Técnica **prohíbe** los 4 tipos de hardcoding desde el Día 0. Sin G-2, los principios son aspiración. Con G-2, son ley física del proyecto.

### Con Abandono Preparado

G-2 es prerequisito estructural del Abandono Preparado. Un proyecto sin gobernanza no puede ser abandonado con seguridad — depende del Arquitecto para navegar su caos interno. Con G-2, otros agentes pueden retomar el trabajo con cero fricción.

---

## Conclusión

G-2 no es "buenas prácticas de desarrollo". Es una **inversión con retorno compuesto** que paga dividendos desde la semana 4 del proyecto y durante toda su vida.

La decisión de implementar G-2 o no se toma en los primeros días. Después, la ventana se cierra: implementarlo tardíamente es ejercicio de dolor que pocos proyectos sostienen.

Un proyecto con G-2 desde el Día 0 opera con confianza estructural. Los desarrolladores pueden experimentar, cometer errores, escribir código imperfecto — la gobernanza absorbe el caos y lo convierte en orden. La velocidad se mantiene no por heroísmo individual sino por infraestructura.

Es la diferencia entre ingeniería como oficio personal y ingeniería como **institución disciplinada**.

---

*Para el patrón que identifica fallas sistémicas que G-2 busca prevenir estructuralmente, ver [`03-patrones/g1-debugging-generadores.md`](g1-debugging-generadores.md).*
*Para la seguridad que G-2 exige desde el Día 0 como parte del paquete constitucional, ver [`03-patrones/a2-constraint-driven-development.md`](a2-constraint-driven-development.md).*
