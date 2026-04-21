# 🏛️ CONSTITUCIÓN — Repositorio Ingeniería No Lineal

> Este documento rige como **ley física** del ecosistema. No es una guía de estilo. Cualquier propuesta — humana o agente — que contradiga una de estas leyes debe ser **bloqueada y señalada**, no silenciosamente seguida.
>
> **Naturaleza del repo:** Meta-documentación viva del Framework Ingeniería No Lineal V5. No es un sistema PEAP-V5 en construcción. Está **fuera del ciclo fundacional de 144/360 horas**. Su función es servir como Exocórtex canónico del framework y como referencia teórica para todo proyecto V5 aguas abajo.

---

## 🛑 LEYES FÍSICAS (Zero-Violation Policy)

### Ley F-1 — Muerte al Hardcoding
Nunca usar hardcoding temporal, de seguridad, emocional o cognitivo. El sistema debe sobrevivir por su cuenta. Aplicado a docs: **no duplicar conceptos entre archivos**; cada concepto vive en un único punto canónico, los demás archivos lo referencian.

### Ley F-2 — Seguridad en la Raíz (CDD)
La validación de permisos no ocurre en el código (middleware/frontend). Ocurre nativamente en bases de datos vía RLS. Aplicado a docs: **la verdad arquitectónica vive en `01-teoria/` y `02-framework/`** — no en README, no en archivos derivados. El lector valida contra la raíz.

### Ley F-3 — Trauma Empaquetado (DLQ)
Ningún evento asíncrono o error rompe la UX bloqueando la ejecución. Todo fallo se empaqueta en Dead Letter Queue y se resuelve en background. Aplicado a docs: **los errores/aprendizajes van a `REGISTRO_TRAUMAS.md`, no se olvidan ni se ocultan**.

### Ley F-4 — Isomorfismo Estructural
Las ramas, PRs, componentes, endpoints y nomenclaturas deben ser espejo de las reglas de negocio base. Absolutamente nada se nombra ad-hoc. Aplicado aquí: **la estructura de 8 carpetas numeradas (`01-teoria` → `08-implementaciones-referencia`) es ley**. Agregar, renombrar o mover carpetas requiere actualizar este documento primero.

### Ley F-5 — Aislamiento en Adaptadores Universales
Estrictamente prohibido empalmar una API externa directamente con el CORE. Siempre se debe interponer un adaptador hermético. Aplicado a agentes IA: **`AGENTS.md` es el core canónico**. `CLAUDE.md`, `GEMINI.md` y futuros archivos por-agente son adaptadores delgados que apuntan a `AGENTS.md`. Nunca duplicar reglas entre adaptadores.

### Ley F-6 — El Humano Aprueba (HITL)
El Agente *jamás* ejecuta un merge directo. Elabora parches en ramas dedicadas y abre PR. El Arquitecto (CPU) valida y hace el merge final.

---

## ⚙️ LEYES OPERATIVAS INMUTABLES (del SKILL `nonlinear-engineering`)

### Ley O-1 — Evaporación del Estado
Nunca retener estado global en la capa de cómputo. Toda verdad persiste en base central protegida por RLS. Las capas de lógica son stateless. Aplicado a este repo: **el Grafo Maestro vive en los archivos del repo, no en la memoria de ninguna sesión de agente**.

### Ley O-2 — Protección del Perímetro
Validación al Edge. Ningún dato malformado consume ciclos en el backend. Aplicado a docs: **la validación de un concepto ocurre antes de ingresarlo al Exocórtex** (revisión en `Nuevos archivos - no commit/`), no después.

### Ley O-3 — Auditor antes que Generador
Si un defecto aparece en 3+ lugares, no escribir parches aislados — identificar el patrón sistémico y proponer reemplazo global. Aplicado a agentes: **este repo opera bajo offloading cognitivo**. El agente audita, el humano decide.

### Ley O-4 — Rigor Constitucional
Este documento no se cuestiona. Se hace cumplir como ley física. Cualquier propuesta que lo contradiga se bloquea y se señala.

---

## 🎯 LEYES ESPECÍFICAS DE ESTE REPOSITORIO

### Ley R-1 — Docs-Only
Este repo no aloja código ejecutable de producción. Si una idea requiere implementación, va a un repo aparte que **importa** los patrones de acá. Excepciones permitidas: skills Claude (`nonlinear-engineering/`, `.claude/skills/`), scripts utilitarios del harness. Cualquier otra implementación viola Ley R-1.

### Ley R-2 — Zona de Borrador Obligatoria
Todo material no consolidado vive en `Nuevos archivos - no commit/` (gitignored) hasta que supere el Delta Cognitivo de cierre de sesión. Nunca se commitea work-in-progress al árbol canónico.

### Ley R-3 — Mutación de Documentación antes que Mutación de Práctica
Si el framework evoluciona, **primero** se muta el documento canónico en el Exocórtex y **después** se aplica en proyectos derivados. Nunca al revés. Violación típica: "hice X en ARCA, después lo documento" — INCORRECTO.

### Ley R-4 — Idioma
- Instrucciones, prosa conceptual, comentarios: **Español**
- Nombres de variables, funciones, archivos técnicos, código: **Inglés**
- Nombres de patrones (C-1, A-2, G-1): **códigos del framework**, no se traducen

### Ley R-5 — Idempotencia Documental
Antes de crear un archivo o sección, verificar que no exista uno equivalente. Si existe uno similar, se actualiza; no se duplica.

---

## 🗺️ MAPA CANÓNICO DEL EXOCÓRTEX

| Ruta | Función |
|---|---|
| `01-teoria/` | Fundamentos conceptuales INL, Abandono Preparado, Paradigma Outlier |
| `02-framework/` | PEAP-V5, Visión General Estructural, Patrones Auto-Healing |
| `03-patrones/` | Catálogo operativo (C-1..C-5, A-1..A-4, G-1..G-2) |
| `04-manifiestos/` | Reflexiones sobre prácticas que asesinan proyectos |
| `05-evidencia/` | KPIs, retrospectivas, métricas del factor 20x |
| `06-arquitectura-cognitiva/` | Diseño del Master Brain (LEYES/HISTORIA/ESTADO) |
| `07-avances/` | Progreso, hitos maduros, base autónoma L5 |
| `08-implementaciones-referencia/` | Ejemplos canónicos de aplicación del framework |
| `Nuevos archivos - no commit/` | Drafting Zone (gitignored) |
| `08-implementaciones-referencia/skills/nonlinear-engineering/` | Skill del framework V5 (fuente canónica legible) |
| `.claude/skills/nonlinear-engineering/` | Copia activa del skill para Claude Code (runtime; ver REGISTRO_TRAUMAS 2026-04-20 entrada γ") |
| `GLOSARIO.md` | Referencia rápida de conceptos |
| `README.md` | Entrada pública al repo |
| `AGENTS.md` | Adaptador canónico multi-agente |
| `CLAUDE.md`, `GEMINI.md` | Adaptadores específicos por agente → `AGENTS.md` |
| `CONSTITUCION.md` | **Este documento — LEYES** |
| `REGISTRO_TRAUMAS.md` | HISTORIA — decisiones con razonamiento |
| `SNAPSHOT_ESTADO.md` | ESTADO — fase actual y pendientes |
| `REGLAS_EDITORIALES.md` | Convenciones de composición documental (templates, criterios, estilo) |

Agregar/modificar rutas requiere actualizar esta tabla primero (Ley F-4 Isomorfismo).

---

## 🔒 CLÁUSULA DE INMUTABILIDAD

Este documento se modifica **solo** por:
1. Decisión explícita del Arquitecto humano (CPU)
2. Registrada como entrada en `REGISTRO_TRAUMAS.md` con fecha, razonamiento y ley afectada
3. Por Pull Request (nunca push directo a `master`)

Un agente que detecta la necesidad de cambiar una ley debe **proponer la modificación, no ejecutarla**.
