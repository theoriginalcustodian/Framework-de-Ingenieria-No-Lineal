# 🤖 CLAUDE.md — Adaptador Claude Code

> Este archivo contiene **solo convenciones específicas del runtime de Claude Code** para este repo. Todo lo universal (leyes, estructura, anti-patrones, regla de oro, relación con ARCA, etc.) vive en [`AGENTS.md`](./AGENTS.md).
>
> **Si sos un agente Claude Code, leé `AGENTS.md` primero — es obligatorio.**

---

## 1. 🤝 Handshake V5 (obligatorio al arrancar sesión)

Antes de cualquier instrucción técnica, leer en este orden:

1. `AGENTS.md` — reglas universales
2. `CONSTITUCION.md` — LEYES
3. `REGISTRO_TRAUMAS.md` — HISTORIA
4. `SNAPSHOT_ESTADO.md` — ESTADO

En **Fase 2** se configurará un hook `SessionStart` en `.claude/settings.json` que lo automatiza. Mientras tanto, hacerlo manualmente.

---

## 2. 🎛️ Configuración del harness (`.claude/`)

| Archivo | Función | Cuándo usar |
|---|---|---|
| `.claude/settings.json` | Permisos, hooks, status line, plugins del equipo | Fase 2 |
| `.claude/settings.local.json` | Overrides personales (gitignored) | Ya existe |
| `.claude/commands/*.md` | Slash commands del proyecto | Fase 3 |
| `.claude/agents/*.md` | Subagents específicos del repo | Futuro |
| `.claude/skills/<nombre>/SKILL.md` | Skills del repo | Futuro |

---

## 3. 🧩 Skills relevantes para este repo

### Skill `nonlinear-engineering` (local, activo)
**Fuente canónica (lectura humana):** `08-implementaciones-referencia/skills/nonlinear-engineering/`
**Runtime de Claude Code:** `.claude/skills/nonlinear-engineering/` (copia sincronizada manualmente)

Agente operativo V5 — activar siempre que el usuario mencione Ingeniería No Lineal, PEAP-V5, Exocórtex, Trauma Empaquetado, anti-patrones, o inicie trabajo sobre este framework. Contiene `SKILL.md` + `references/patrones.md` + `references/protocolo.md`.

**Tradeoff de duplicación:** las 2 copias existen por limitación técnica de Claude Code (el skill se carga desde su directorio propio, sin refs externas). Sincronización manual al cambiar la fuente canónica. Ver `REGISTRO_TRAUMAS.md` entrada 2026-04-20 "Promoción del skill nonlinear-engineering".

### Skills globales útiles
- `framework-self-check` — meta-validación de propuestas arquitectónicas (ADR-006)
- `superpowers:brainstorming` — antes de cualquier trabajo creativo
- `superpowers:writing-plans` — para planes de múltiples pasos
- `superpowers:verification-before-completion` — antes de declarar algo como "listo"
- `claude-md-management:revise-claude-md` — actualizar este archivo o `AGENTS.md`

---

## 4. 🔧 Slash commands del repo (en Fase 3)

| Comando | Función |
|---|---|
| `/handshake` | Ejecutar Handshake V5 manual (LEYES/HISTORIA/ESTADO) |
| `/delta-cognitivo` | Cierre de sesión con las 3 preguntas del Delta |
| `/audit-generador` | Activar Anti-Patrón 2 — auditar patrón sistémico |

---

## 5. 🚨 Meta-Validación obligatoria (ADR-006)

Antes de presentar cualquier propuesta arquitectónica (crear/modificar ADR, skill, biblioteca compartida, o decisión conversacional con frases-trigger tipo "recomiendo", "propongo", "mi fix es"), invocar el skill `framework-self-check` para generar Plan v1 + Plan v2 + recomendación.

**Frases-trigger que obligan meta-validación:**
- "recomiendo opción X"
- "propongo Y"
- "el fix es Z"
- "mi propuesta es..."
- "Opción A / B / C" (listado estructural)
- "vamos a agregar..."
- "vamos a refactorizar..."

**NO aplicar a:** cambios triviales (rename/typo/formato), explicaciones, resúmenes, análisis.

---

## 6. 📝 Edición de archivos

- Preferir `Edit` sobre `Write` para archivos existentes (envía solo el diff).
- Para los 3 docs del Handshake (`CONSTITUCION.md`, `REGISTRO_TRAUMAS.md`, `SNAPSHOT_ESTADO.md`): Ley F-6 HITL — siempre proponer el cambio en respuesta primero; nunca escribir directo sin aprobación CPU.
- Para el árbol canónico (`01-teoria/` → `08-implementaciones-referencia/`): material nuevo pasa primero por `Nuevos archivos - no commit/` (Ley R-2).

---

## 7. 🪟 Convenciones de entorno (Windows 11 + bash)

- Shell: bash (usar sintaxis Unix, no Windows — `/dev/null` no `NUL`, barras inclinadas hacia adelante en paths).
- En Windows, los paths del repo usan backslashes (`...\Repositorio Ingenieria No Lineal\...`).
- En comandos bash sobre Windows: forward slashes + comillas (`".../Repositorio Ingenieria No Lineal/..."`) por los espacios del nombre.

---

## 8. 🔗 Referencias cruzadas

- **Reglas universales:** → `AGENTS.md`
- **Leyes:** → `CONSTITUCION.md`
- **Historia:** → `REGISTRO_TRAUMAS.md`
- **Estado actual:** → `SNAPSHOT_ESTADO.md`
- **Skill V5 (fuente):** → `08-implementaciones-referencia/skills/nonlinear-engineering/SKILL.md`
- **Skill V5 (runtime):** → `.claude/skills/nonlinear-engineering/SKILL.md`
- **Global de Claude Code:** `~/.claude/CLAUDE.md` (instrucciones del operador humano, no del repo)
