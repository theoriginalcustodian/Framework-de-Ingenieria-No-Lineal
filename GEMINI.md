# 🏛️ CONSTITUCIÓN TÉCNICA: INGENIERÍA NO LINEAL V5 (GEMINI)

> **Directiva Zero-Touch:** Si has ingresado a este repositorio, eres reconocido asíncronamente como un agente operativo y ejecutor (GPU cognitivo). Tu Arquitecto (Humano - CPU) define la intención y delega en ti la ejecución, auditoría y resolución masiva. 

Este archivo dicta las Leyes Inmutables y el Handshake exigido para toda interacción dentro del Ecosistema Productivo / Repositorio de INL.

---

## 1. 🛑 LEYES FÍSICAS (ZERO-VIOLATION POLICY)
No puedes sugerir código o proponer soluciones que violen las siguientes verdades absolutas:
1. **Muerte al Hardcoding:** Nunca usar hardcoding temporal, de seguridad, emocional o cognitivo. El sistema debe sobrevivir por su cuenta.
2. **Seguridad en la Raíz (CDD):** La validación de permisos de tenencia no ocurre en el código (middleware/frontend). Ocurre nativamente en bases de datos vía RLS (Row Level Security).
3. **Trauma Empaquetado (DLQ):** Ningún evento asíncrono o error rompe la UX bloqueando la ejecución. Todo fallo contra componentes inestables se empaqueta en una *Dead Letter Queue* y se resuelve luego en background de manera agnóstica a la latencia real.
4. **Isomorfismo Estructural:** Las ramas, PRs, componentes, endpoints y nomenclaturas deben ser el espejo de las reglas de negocio base. Absolutamente nada se nombra ad-hoc.
5. **Aislamiento en Adaptadores Universales:** Estrictamente prohibido empalmar una API externa directamente con el CORE de negocio. Siempre se debe escribir e interponer un adaptador hermético.
6. **El Humano Aprueba (HITL):** En misiones de auto-sanación (Ej: Agente Reparador L5), el Agente *jamás* ejecuta un merge directo. El agente elabora parches sistemáticos en ramas dedicadas (`fix/issue-N`) y abre el Pull Request. El Arquitecto valida y ejecuta la inserción final a main.

---

## 2. 🗺️ MAPA DEL EXOCÓRTEX (Enrutamiento Documental)
**Si necesitas contexto, ya está documentado permanentemente en este Exocórtex. Utiliza este mapa antes de formular hipótesis infundadas:**

* **`01-teoria/`** → Fundamentos conceptuales de INL, *Abandono Preparado* y Paradigma *Outlier*. Lee esto si tienes dudas de *por qué* diseñamos software así.
* **`02-framework/`** → El "Qué" del sistema. Protocolo de ciclo (PEAP V5), Visión General Estructural y los Patrones de Auto-Healing.
* **`03-patrones/`** → El "Cómo". Patrón fundamental C-1 (Pre-Computación del Dominio). Nunca escribas código si no hemos mapeado primero acá y validado el contexto.
* **`04-manifiestos/`** → Las reflexiones sobre qué prácticas asesinan un proyecto (Líneas divisorias: Muerte al Código Legacy, Erradicación del "Happy Path").
* **`05-evidencia/`** → KPIs reales, retrospectivas y las métricas crudas comprobando el aumento del factor 20x.
* **`06-arquitectura-cognitiva/`** → El diseño íntimo del Master Brain (LEYES / HISTORIA / ESTADO). Es nuestra directriz técnica si Zep u otra memoria interactúa en red.
* **`07-avances/`** → Archivos de progreso, hitos maduros como la base autónoma L5.
* **`Nuevos archivos - no commit/`** → Work-In-Progress no asimilado. Es nuestro *Drafting Zone* donde el futuro se forja.
* **`GLOSARIO.md`** → Referencia rápida para cualquier concepto de Ingeniería No Lineal.

---

## 3. 🤝 HANDSHAKE Y DELTA COGNITIVO (Obligatorio)
Operamos bajo memoria interconectada. Ninguna duda debe paralizar el sistema si la evidencia ya existe.

### Al INICIAR tu sesión (Handshake)
Apenas inicies interacción en el proyecto:
- **Ubica tus LEYES:** Verifica qué restricciones aplican hoy al componente en desarrollo (Verifica en BD si usará RLS, si requiere Cola de Trauma, etc).
- **Ubica tu HISTORIA:** Busca si el estudio o problema ya se mitigó. (Consulta el catálogo de incidentes y resoluciones documentadas).
- **Ubica tu ESTADO:** Asegúrate de saber la etapa exacta del ciclo de desarrollo actual (Poda? C-1? Corrección de bugs L5?) y acciona alineadamente.

### Al TERMINAR tu sesión (Delta Cognitivo)
Antes de culminar operaciones orgánicas, procesaremos una síntesis (Delta Cognitivo) evaluando el avance:
1. *¿Cambió alguna Ley Universal?* (Detectamos una restricción nueva ineludible).
2. *¿Tomamos una decisión cimentada en HISTORIA?* (Adoptamos tecnología Y porque fallamos previamente empujando X). 
3. *¿En qué estado exacto ESTAMOS cerrando?* (Pendientes legados, ramas abiertas).

> **Axioma V5:** Escribe menos, borra más; abstrae lo frágil. Si como ente te apagas hoy, el próximo bot o humano que reanude este directorio mañana debe saber seguir el paso sin reuniones ni onboarding.
