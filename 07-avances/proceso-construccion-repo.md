# Proceso de construcción del repositorio — registro histórico

> **Documento retrospectivo.** Describe cómo se construyó este repositorio en sucesivas priorizaciones entre el 19 y 20 de abril de 2026. Se preserva como evidencia del proceso, no como plan operativo.

---

## Contexto

Este repositorio pasó de *"corpus teórico leíble"* a *"framework adoptable por terceros"* en una sesión extendida de trabajo durante la cual se ejecutaron cuatro prioridades secuenciales. Este documento registra el proceso.

Al momento del cierre final:

- **49 archivos markdown**
- **~8.000 líneas**
- **9 de 9 patrones canónicos documentados**
- **8 plantillas adoptables agnósticas del dominio**
- **Caso empírico del patrón C-3 Bidireccional** con baseline 0/2 → 3/3 post-implementación

---

## Prioridad 1 — Incorporar aprendizajes recientes como contenido agnóstico

**Objetivo original:** trasladar al repo los aprendizajes de una sesión 19-04-2026 donde se formalizó el patrón C-3 Bidireccional (meta-validación del agente) en el proyecto fuente.

### Archivos creados

| Archivo | Carpeta | Propósito |
|---|---|---|
| `c3-bidireccional-y-meta-validacion.md` | `03-patrones/` | Patrón formalizado: exocórtex como gate pre-decisión |
| `validacion-meta-framework.md` | `05-evidencia/` | Caso empírico con baseline 0/2 → 3/3 |
| `framework-self-check-skill.md` | `07-avances/` | Implementación de referencia del skill meta |
| `GLOSARIO.md` | raíz | 4 entradas nuevas: C-3 Bi, Meta-Validación, Skill Meta, Implementation-Bias |

### Criterios aplicados

- Agnosticismo del dominio — casos citados como *"proyecto de dominio regulatorio complejo"*, sin mención al origen
- Evidencia empírica incluida con limitaciones honestas
- Cross-references vivas entre los tres documentos

---

## Prioridad 2 — Completar los 9 patrones canónicos

**Objetivo:** llevar `03-patrones/` a inventario completo. Al inicio solo existían 2 de 9 (C-1 + directivas XML).

### Archivos creados

| Archivo | Patrón | Familia |
|---|---|---|
| `a1-adaptador-universal.md` | Encapsulamiento de ecosistemas hostiles | Arquitectura |
| `a2-constraint-driven-development.md` | Invariantes en persistencia (RLS) | Arquitectura |
| `a3-event-driven.md` | Desacoplamiento intención-resultado | Arquitectura |
| `c2-offloading-cognitivo.md` | Paradigma CPU/GPU | Cognición |
| `c3-exocortex-memoria-activa.md` | Exocórtex unidireccional | Cognición |
| `g1-debugging-generadores.md` | ≥3 instancias = fix paramétrico | Gobernanza |
| `g2-gobernanza-dia-cero.md` | Institucionalización prematura | Gobernanza |

Todos siguen plantilla consistente: tesis → problema → anatomía → validación empírica → cuándo aplicar / NO aplicar → anti-patrones → relación con otros → conclusión. Esto garantiza navegabilidad — un lector que entendió un patrón recorre los otros sin fricción.

---

## Prioridad 3 — Capa adoptable (`08-implementaciones-referencia/`)

**Objetivo:** convertir el framework de *"leíble"* a *"adoptable por terceros"*. Crear plantillas agnósticas que cualquier proyecto pueda copiar, adaptar con placeholders y operar desde Día 0.

### Archivos creados

| # | Archivo | Subcarpeta |
|---|---|---|
| 1 | `framework-self-check.md` | `skills/` |
| 2 | `CLAUDE-md-user-level-template.md` | `claude-md-template/` |
| 3 | `constitucion-agente-inl.md` | `system-prompts/` |
| 4 | `feedback-tracking-template.md` | `memory-templates/` |
| 5 | `00-README-como-escribir-adr.md` | `adrs-template/` |
| 6 | `template-adr-minimo.md` | `adrs-template/` |
| 7 | `template-adr-completo.md` | `adrs-template/` |
| 8 | `README.md` | raíz de `08-` |

Cada plantilla incluye: precondiciones de adopción, placeholders claros, instrucciones de adaptación, anti-patrones observados y cross-references.

Este fue el hito que transformó el repo de *"repositorio de conocimiento"* a *"framework operacional"*.

---

## Prioridad 4 — Pulido y consistencia

**Objetivo:** resolver inconsistencias menores detectadas durante la lectura exhaustiva del repo.

### Items ejecutados

| Item | Descripción | Resultado |
|---|---|---|
| P4.1 | Nota sobre voces del repo (paper / manifesto / técnico) | Integrada en README principal |
| P4.2 | Quick Start accionable en README principal | Agregada sección de adopción en ~15 minutos |
| P4.3 | Decidir destino de WIP | Reporte de dominio-específico eliminado; SUPERVIVENCIA integrado a P4.4; plan movido aquí |
| P4.4 | Consolidar `teoria-cibernetica-v5.md` + `SUPERVIVENCIA_VS_ELEGANCIA_V5.md` | Fusionados en documento único con 4 partes + reconocimiento de dónde el canje NO aplica |
| P4.5 | Diagramas Mermaid en patrones temporales | Agregados a C-1, A-3, A-4 (Trauma Empaquetado), C-3 Bidireccional |
| P4.6 | Deduplicar `07-avances/framework-self-check-skill.md` vs plantilla canónica | Archivo reducido 269→95 líneas; apunta a la plantilla en `08-` como fuente de verdad |

Además, en paralelo al pulido estructural, se ejecutó un **suavizado de framing** en el README principal y en tres archivos de evidencia (`tablas-datos-empiricos.md`, `genesis-y-metricas-sprint.md`, `validacion-empirica-v5.md`). Los multiplicadores extrapolados (*"15x-25x"*, *"8x-12x"*, *"65% es fricción"*) fueron reemplazados por comparaciones narrativas honestas con distinción explícita entre métricas verificables y estimaciones comparativas.

---

## Lecciones del proceso

### 1. La plantilla consistente escala la ejecución

La Prioridad 2 (7 patrones) fue la más barata por item — una vez establecida la plantilla estructural en la Prioridad 1 (tesis → problema → anatomía → validación → aplicar/no aplicar → anti-patrones → relación → conclusión), los 7 patrones siguientes se ejecutaron en ~2 horas totales. Sin la plantilla, habrían tomado 4-6 horas.

### 2. El agnosticismo del dominio requiere disciplina explícita

Cada archivo creado fue revisado para eliminar referencias al proyecto fuente. El costo marginal es bajo (5-10% del tiempo de redacción) pero el valor es alto: el repo queda adoptable sin "contaminación" de un dominio específico.

### 3. La auditoría post-push detecta inconsistencias invisibles durante la redacción

Tras el primer push (Prioridades 1+2+3), una revisión sistemática de los documentos de evidencia reveló que el framing del README había sido suavizado pero los documentos históricos de evidencia seguían con multiplicadores inflados. Sin esa auditoría, un lector que profundizara desde el README honesto habría encontrado contradicción en los documentos fuente.

### 4. Dedupliación vale la pena

El archivo `07-avances/framework-self-check-skill.md` (Prioridad 1) duplicaba ~85% del contenido de la plantilla canónica creada en Prioridad 3. Detectarlo y deduplicarlo (P4.6) liberó 174 líneas y estableció una única fuente de verdad para adoptantes.

### 5. Los diagramas Mermaid tienen ROI desproporcionado

30 minutos de diagrama por patrón temporal (C-1, A-3, A-4, C-3 Bi) aceleran significativamente la comprensión del orden temporal. Renderizan nativos en GitHub sin setup adicional. Son el item con mejor relación impacto/esfuerzo de la Prioridad 4.

---

## Estado al cierre

El repositorio completó el tránsito desde *"corpus teórico"* hacia *"framework operacional adoptable"*. Un ingeniero externo puede ahora:

1. Leer la teoría y evidencia empírica (capítulos 01-07)
2. Descargar plantillas de `08-implementaciones-referencia/`
3. Reemplazar placeholders con valores de su proyecto
4. Adoptar el framework sin reinventar componentes

### Lo que queda fuera deliberadamente

El repo no incluye (y documenta por qué):
- Skills operativas genéricas (`/resolve-issue`, `/new-report`) — son dominio-específicas
- Templates de CI/CD — dependen del stack y hosting
- Templates de ORM/persistencia — dependen de la base de datos

Ver [`08-implementaciones-referencia/README.md`](../08-implementaciones-referencia/README.md) para el razonamiento completo.

---

## Trazabilidad de commits

Los commits que materializaron este proceso son auditables en el historial git del repositorio:

- Incorporación de aprendizajes recientes + patrones completos + capa adoptable (un solo commit consolidado)
- Suavizado de framing en documentos de evidencia
- Deduplicación del skill entre `07-avances/` y `08-`
- Diagramas Mermaid en 4 patrones temporales
- Consolidación de teoría cibernética V5
- Este documento de cierre

Cada commit sigue la convención de Conventional Commits y documenta en su mensaje el subset de patrones / archivos afectados.

---

*Este documento cierra formalmente el proceso de construcción del repositorio en su estado actual. Futuras expansiones (feedback de adoptantes externos, nuevos patrones emergentes, integraciones específicas de stack) se documentarán en sus propios avances bajo `07-avances/` o en los capítulos correspondientes.*
