# Implementaciones de Referencia — Ingeniería No Lineal

> **Convertir el framework de leíble a adoptable.**
> Esta carpeta contiene plantillas ejecutables que materializan los patrones del framework en componentes reutilizables para cualquier proyecto bajo INL.

---

## Qué hay aquí

Los capítulos 01-07 del repositorio contienen **teoría, patrones, evidencia**. Son la **forma** del framework.

Esta carpeta contiene **plantillas adaptables de implementación**. Son la **materia** que llena esa forma en proyectos concretos.

La diferencia es operacional:

- Sin estas plantillas: cada adoptante reinventa cómo materializar el framework en su proyecto
- Con estas plantillas: cada adoptante descarga el componente, reemplaza placeholders, adapta al contexto, opera

---

## Estructura de la carpeta

```
08-implementaciones-referencia/
│
├── README.md                              ← este archivo (puerta de entrada)
│
├── skills/
│   └── framework-self-check.md            ← meta-skill del patrón C-3 Bidireccional
│
├── claude-md-template/
│   └── CLAUDE-md-user-level-template.md   ← instrucciones globales del agente IA
│
├── system-prompts/
│   └── constitucion-agente-inl.md         ← bloque XML inicial del agente
│
├── memory-templates/
│   └── feedback-tracking-template.md      ← tracking empírico del patrón
│
└── adrs-template/
    ├── 00-README-como-escribir-adr.md     ← guía operativa
    ├── template-adr-minimo.md             ← para decisiones acotadas
    └── template-adr-completo.md           ← para decisiones transversales
```

---

## Cómo usar esta carpeta

### Ruta de adopción recomendada

**Si tu proyecto es nuevo y estás iniciando con INL:**

1. Leer el [`README.md`](../README.md) principal y el paper fundacional
2. Establecer Constitución Técnica inicial (ver patrones G-2 y C-3)
3. Instalar el [`system-prompts/constitucion-agente-inl.md`](system-prompts/constitucion-agente-inl.md) como base del agente IA
4. Configurar [`claude-md-template/CLAUDE-md-user-level-template.md`](claude-md-template/CLAUDE-md-user-level-template.md)
5. Escribir tus primeros ADRs con [`adrs-template/template-adr-minimo.md`](adrs-template/template-adr-minimo.md)
6. Tras 2-3 semanas de uso, si observás el anti-patrón *"agente propone lineal"*, adoptar [`skills/framework-self-check.md`](skills/framework-self-check.md) + [`memory-templates/feedback-tracking-template.md`](memory-templates/feedback-tracking-template.md)

**Si tu proyecto ya existe y querés adoptar INL selectivamente:**

1. Identificar qué patrones del framework ya cumple tu proyecto (los 9 patrones en [`03-patrones/`](../03-patrones/))
2. Identificar qué patrones faltan y son aplicables a tu dominio
3. Adoptar plantillas correspondientes solo a esos patrones

**Si estás evaluando si INL aplica a tu proyecto:**

1. Leer [`01-teoria/paper-ingenieria-no-lineal.md`](../01-teoria/paper-ingenieria-no-lineal.md) y [`01-teoria/ecuacion-del-outlier.md`](../01-teoria/ecuacion-del-outlier.md)
2. Revisar [`05-evidencia/`](../05-evidencia/) para ver casos empíricos
3. Decidir si los pre-requisitos del framework se cumplen en tu contexto

---

## Componentes disponibles

### skills/

**`framework-self-check.md`** — Meta-skill invocable por el agente antes de proponer arquitectura.

Implementa el patrón C-3 Bidireccional. Es la skill que hace al agente consultar el framework antes de decidir, no solo registrar decisiones después.

**Cuándo adoptar:** tras observar ≥2 casos empíricos del anti-patrón *"agente propone lineal por default"*. Antes de eso, es overengineering.

**Precondiciones:**
- Framework arquitectónico documentado (≥3 ADRs)
- Agente IA con memoria persistente
- Evidencia empírica del problema

### claude-md-template/

**`CLAUDE-md-user-level-template.md`** — Instrucciones globales persistentes del agente IA.

Incluye sección §11 **Meta-Validación del Agente** que activa el patrón C-3 Bidireccional como regla obligatoria.

**Cuándo adoptar:** desde el Día 0 del proyecto (G-2). Las secciones específicas del proyecto se completan progresivamente.

### system-prompts/

**`constitucion-agente-inl.md`** — Bloque XML inicial que inyecta al agente el framework como ley.

Incluye 8 leyes operativas inmutables + 5 meta-principios del agente V5.

**Cuándo adoptar:** desde la primera sesión con el agente IA. Es el handshake cognitivo inicial.

### memory-templates/

**`feedback-tracking-template.md`** — Registro empírico de métricas del patrón C-3 Bidireccional.

Es el tercer componente obligatorio del patrón — sin tracking, no hay iteración posible del diseño.

**Cuándo adoptar:** simultáneamente con la skill `framework-self-check`. Los dos sin el tercero son incompletos.

### adrs-template/

**`00-README-como-escribir-adr.md`** — Guía operativa: cuándo crear ADR, cómo redactarlo, anti-patrones a evitar.

**`template-adr-minimo.md`** — Para decisiones acotadas (≤30 líneas, ≤30 min de redacción).

**`template-adr-completo.md`** — Para decisiones transversales con alto impacto.

**Cuándo adoptar:** desde el Día 0 del proyecto. Los primeros ADRs arrancan con el template mínimo.

---

## Principios de diseño de estas plantillas

### 1. Agnosticismo del dominio

Ninguna plantilla menciona el proyecto fuente del framework. Todos los ejemplos usan placeholders `{{...}}` o casos genéricos anonimizados. Esto permite adopción limpia sin "contaminación" de un dominio específico.

### 2. Precondiciones explícitas

Cada plantilla incluye sección *"Precondiciones de adopción"*. Si tu proyecto no las cumple, la plantilla no aplica — adoptarla ciegamente produce overhead sin valor.

### 3. Anti-patrones documentados

Cada plantilla incluye sección *"Anti-patrones a evitar"*. Estos son errores observados en adopciones reales del framework. Leerlos antes de implementar ahorra 1-2 iteraciones.

### 4. Cross-references vivas

Cada plantilla enlaza a los patrones teóricos que implementa (`../03-patrones/...`) y a la evidencia empírica (`../05-evidencia/...`). El adoptante puede navegar desde la implementación al fundamento teórico sin abandonar el repo.

### 5. Brevedad honesta

Las plantillas son lo más cortas posible — cada sección debe tener justificación empírica. Si una sección existe *"por si acaso alguien la necesita"*, se descarta.

---

## Lo que NO hay aquí (y por qué)

### NO hay skills operativas genéricas

Skills como `/resolve-issue` o `/new-report` son **específicas del dominio** de cada proyecto. Un skill de resolución de issues en un proyecto fiscal es distinto al de un proyecto de logística. Incluir plantillas genéricas daría ilusión de universalidad sin valor real.

### NO hay CI/CD templates

Los pipelines de CI/CD dependen del stack (Node, Python, Go, Rust) y del hosting (GitHub Actions, GitLab CI, Jenkins). Generalizarlos produce YAMLs verbosos que no se adaptan limpiamente.

### NO hay ORM templates

El patrón A-2 (CDD/RLS) se implementa distinto según la base de datos (PostgreSQL, MySQL, MongoDB). La plantilla genérica no capturaría las diferencias críticas.

### El criterio común

Solo se incluyen plantillas que son **genuinamente transferibles** entre proyectos con mínima adaptación. Lo específico del stack se documenta como principio, no como plantilla.

---

## Cómo contribuir plantillas nuevas

Si tu proyecto produjo una plantilla genuinamente transferible que otros proyectos INL podrían usar, el criterio de inclusión es:

1. **Agnóstica del dominio:** sin referencias a tu proyecto específico
2. **Placeholders claros:** `{{VARIABLE}}` con documentación de qué reemplazar
3. **Precondiciones explícitas:** *"esta plantilla aplica cuando..."*
4. **Anti-patrones documentados:** errores observados al adoptarla
5. **Validación empírica:** al menos 1 caso documentado donde se adoptó exitosamente

Si la plantilla cumple los 5 criterios, proponer su incorporación. Si no cumple ≥3, probablemente no es transferible aún — perfeccionarla antes.

---

## Estado de la carpeta

- ✅ **Skill meta** (`framework-self-check`)
- ✅ **Template CLAUDE.md**
- ✅ **System prompt agente INL**
- ✅ **Template memoria de tracking**
- ✅ **Templates ADR (mínimo + completo) + guía**
- 🔲 Skills operativas genéricas — ver sección *"Lo que NO hay aquí"*
- 🔲 Templates de CI/CD — ver sección *"Lo que NO hay aquí"*
- 🔲 Templates ORM/persistencia — ver sección *"Lo que NO hay aquí"*

Los ✅ cubren el **mínimo viable para adoptar el framework**. Los 🔲 son deliberadamente ausentes por razones documentadas.

---

## Para el adoptante apurado

Si querés el camino mínimo de adopción de INL:

1. Copiá [`system-prompts/constitucion-agente-inl.md`](system-prompts/constitucion-agente-inl.md) al system prompt de tu agente IA
2. Copiá las secciones relevantes de [`claude-md-template/CLAUDE-md-user-level-template.md`](claude-md-template/CLAUDE-md-user-level-template.md) a tu `~/.claude/CLAUDE.md`
3. Empezá a escribir ADRs con [`adrs-template/template-adr-minimo.md`](adrs-template/template-adr-minimo.md) desde el Día 0
4. Tras 2-3 sprints, evaluá si necesitás la skill meta y el tracking

Con estos 3 pasos tenés el 70% del valor del framework operando. Los refinamientos adicionales se incorporan cuando la evidencia empírica lo justifique.

---

## Relación con el resto del repositorio

- **Teoría:** [`01-teoria/`](../01-teoria/) — fundamentos conceptuales
- **Framework:** [`02-framework/`](../02-framework/) — protocolos y visión general
- **Patrones:** [`03-patrones/`](../03-patrones/) — los 9 patrones con detalle
- **Manifiestos:** [`04-manifiestos/`](../04-manifiestos/) — filosofía aplicada
- **Evidencia:** [`05-evidencia/`](../05-evidencia/) — casos empíricos con métricas
- **Arquitectura cognitiva:** [`06-arquitectura-cognitiva/`](../06-arquitectura-cognitiva/) — Grafo Maestro
- **Avances:** [`07-avances/`](../07-avances/) — hitos maduros
- **Implementaciones de referencia:** esta carpeta — plantillas adoptables

Las primeras 7 carpetas **explican qué es el framework**. Esta explica **cómo adoptarlo**.

---

*El framework sin implementación es filosofía. La implementación sin framework es código. Esta carpeta es el puente.*
