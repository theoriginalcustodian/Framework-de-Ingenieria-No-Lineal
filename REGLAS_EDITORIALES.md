# 📐 REGLAS EDITORIALES — Repositorio Ingeniería No Lineal

> Adaptación de `REGLAS_NEGOCIO.md` (del skill INL, prescrito para proyectos con dominio de negocio) al **dominio editorial** de este repo docs-only.
>
> **Dominio de negocio de este repo** = composición documental rigurosa del framework INL V5. Las reglas acá formalizan convenciones implícitas para que futuros colaboradores (humanos o agentes) no tengan que inferirlas.

---

## 1. 📄 Template canónico para `03-patrones/*.md`

Todo patrón en `03-patrones/` DEBE seguir esta estructura:

```markdown
# [Código-N] — [Nombre completo del patrón]

## Cuándo activar
[Disparador concreto — condición observable que obliga a aplicar el patrón]

## Qué hacer
[Pasos operativos numerados]

## Entregable obligatorio
[Archivo, artefacto o estado verificable que deja el patrón al completarse]

## Verificación
[Pregunta binaria o checklist que confirma que el patrón está aplicado correctamente]

## Señal de alarma
[Indicador observable de que el patrón no se aplicó o se violó]
```

**Nomenclatura de código:**
- Cognitivos: `C-N` (C-1, C-2, ..., C-5)
- Arquitectura: `A-N` (A-1, ..., A-4)
- Gobernanza: `G-N` (G-1, G-2)

**Nomenclatura de archivo:** `cN-nombre-kebab-case.md` (ej: `c1-pre-computacion-del-dominio.md`).

---

## 2. 📜 Template canónico para `04-manifiestos/*.md`

```markdown
# Manifiesto: [Título]

> [Epígrafe de 1-2 líneas que captura la tesis central]

## La línea divisoria
[Qué diferencia al sistema que adopta este manifiesto del que lo ignora]

## Síntomas de la práctica que asesina el proyecto
[Lista de señales observables del anti-patrón]

## La alternativa del framework
[Qué reemplaza al anti-patrón]

## Consecuencia de la adopción
[Resultado medible/observable esperado]
```

**Nomenclatura de archivo:** `nombre-descriptivo-kebab-case.md` (ej: `muerte-al-hardcoding.md`).

---

## 3. 🔬 Criterio de aceptación de un patrón nuevo

Para que un patrón ingrese a `03-patrones/` del árbol canónico, DEBE cumplir **las 3**:

1. **Origen empírico documentado.** El patrón emergió en un proyecto fuente real (no es especulación). Evidencia registrada en `05-evidencia/` con referencia al proyecto.
2. **≥1 caso de validación.** Al menos un proyecto aplicó el patrón y confirmó su efecto (KPI mejorado, bug evitado, tiempo ahorrado). Documentado.
3. **ADR vinculado.** Decisión arquitectónica pública (en el proyecto fuente) que referencia el patrón.

**Sin los 3, el patrón queda en `Nuevos archivos - no commit/` como hipótesis — no se promueve.**

Esta regla implementa la Meta-regla del `CLAUDE.md`:
> "Los patrones emergen en el fuego de la ejecución. Este repo es el cementerio honrado donde los patrones validados descansan."

---

## 4. 🗂️ Convención de nomenclatura transversal

| Tipo | Convención | Ejemplo |
|---|---|---|
| Archivos de patrón | `cN-nombre-kebab-case.md` | `c1-pre-computacion-del-dominio.md` |
| Archivos de manifiesto | `nombre-kebab-case.md` | `muerte-al-hardcoding.md` |
| Archivos de teoría | `nombre-kebab-case.md` | `abandono-preparado.md` |
| Archivos de arquitectura cognitiva | `nombre-kebab-case.md` | `master-brain-diseno.md` |
| Documentos de gobierno (raíz) | `MAYUSCULAS_SNAKE.md` | `CONSTITUCION.md`, `SNAPSHOT_ESTADO.md` |
| Adaptadores de agente (raíz) | `AGENTE.md` | `CLAUDE.md`, `GEMINI.md`, `AGENTS.md` |

**Prohibido:** mezclar PascalCase, camelCase o snake_case dentro de una misma carpeta del árbol canónico (Ley F-4 Isomorfismo).

---

## 5. 📦 Criterio de promoción: `Nuevos archivos - no commit/` → árbol canónico

Un archivo se mueve de la **Drafting Zone** al árbol canónico solo si cumple:

1. **Propósito claro** — el archivo pertenece a una de las 8 carpetas del Exocórtex (Ley F-4).
2. **Superó Delta Cognitivo** — se validó en una sesión que registró el razonamiento (en `REGISTRO_TRAUMAS.md` si aplica).
3. **Nombre canónico** — cumple la convención de nomenclatura del bloque 4.
4. **Aprobación CPU** — el Arquitecto humano autoriza el movimiento (Ley F-6 HITL).
5. **Sin dependencias rotas** — si referencia otros archivos, existen en el filesystem (`/audit-coherencia-docs refs` pasa OK).

**Formato del commit que mueve:** `docs: promote <nombre> from draft to <carpeta-destino>`.

---

## 6. 🧠 Criterio de "evidencia empírica suficiente"

Para que una pieza entre a `05-evidencia/`:

- **KPIs:** número, fecha, proyecto, baseline comparativo. No "mejoramos la productividad" — **"retrospectiva 2026-04-15 proyecto X: reducción de bugs de X a Y en Z semanas"**.
- **Retrospectivas:** fecha, participantes (rol, no nombre personal), 3 aprendizajes explícitos.
- **Antipatrones detectados:** qué patrón se violó, qué costó, cómo se detectó, cómo se resolvió.
- **Validaciones meta-framework:** cuando el framework se aplicó al framework mismo — caso especial de interés.

**Cualquier evidencia sin fecha, proyecto y resultado medible es hipótesis, no evidencia.**

---

## 7. 🖋️ Estilo de prosa

- **Voz:** segunda persona (vos/tú) cuando te dirigís al agente o lector. Primera del plural ("nosotros") cuando hablás del framework colectivo.
- **Tiempo:** presente. El framework es un presente permanente, no un histórico.
- **Español rioplatense aceptable** — este repo se escribe en castellano no-neutro.
- **Sin emojis en títulos de patrones** — los emojis sirven como guía visual en navegación (README, CONSTITUCION), no en el contenido teórico formal.
- **Código y paths en backticks.** Siempre.
- **Sin adjetivos marketineros** ("revolucionario", "game-changer", "innovador"). El framework se defiende por resultados, no por hype.

---

## 8. 🔗 Reglas de cita y referencias cruzadas

- **Referencias internas:** usar paths relativos desde raíz del repo. Ejemplo correcto: `` `03-patrones/c1-pre-computacion-del-dominio.md` ``.
- **Enlaces markdown:** `[texto descriptivo](./ruta/relativa.md)` — siempre descriptivos, nunca "click here".
- **Citas a proyectos fuente:** mencionar el proyecto y el contexto. Ejemplo: "En Suite ARCA PR #204 se detectó este anti-patrón..."
- **Auditoría:** `/audit-coherencia-docs refs` debe correr OK antes de commitear cambios que agregan referencias nuevas.

---

## 9. 🔄 Mantenimiento

Este archivo se modifica cuando:
1. Se detecta una inconsistencia sistémica en `/audit-coherencia-docs` que requiere formalizar una regla.
2. Surge un tipo nuevo de contenido (ej. ADRs, playbooks) que necesita template canónico.
3. Un proyecto fuente identifica una regla editorial faltante.

**Formato del cambio:** entrada en `REGISTRO_TRAUMAS.md` + edit a este archivo + Pull Request (Ley F-6 HITL).

---

## 10. 🔒 Cláusula de inmutabilidad

Este documento se modifica solo con aprobación CPU explícita, registrada en `REGISTRO_TRAUMAS.md`. Un agente que detecte necesidad de cambiar una regla debe **proponer la modificación, no ejecutarla**.

---

## Ref canónica

- `CONSTITUCION.md` — leyes que estas reglas editoriales implementan (Ley F-1, Ley F-4, Ley R-3, Ley R-4, Ley R-5)
- `AGENTS.md §10` — convenciones universales (idioma, commits, git)
- Skill `nonlinear-engineering/SKILL.md` — origen conceptual de `REGLAS_NEGOCIO.md`
