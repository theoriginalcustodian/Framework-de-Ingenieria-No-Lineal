# Patrón C-1: Pre-Computación del Dominio

> *"El argumento más común contra la velocidad extrema es: 'sí, pero ya conocías el negocio'. La evidencia demuestra que el método sustituye a la experiencia previa."*

---

## La tesis

El conocimiento previo de un dominio **no es un requisito de entrada** para la ejecución outlier. Es un output del método.

Durante la validación empírica del framework en ecosistemas de alta complejidad — regulación fiscal, procesos legales, integraciones bancarias — se identificó un factor crítico: el Arquitecto no poseía conocimiento previo del sector en ninguno de los casos.

Este dato transforma el Patrón C-1 de ser una técnica útil a ser una **metodología de compresión cognitiva experta**. Permite que un ingeniero de software sea funcionalmente indistinguible de un experto de dominio en menos de tres jornadas de trabajo.

---

## El problema que resuelve

Cuando un desarrollador intenta construir la solución mientras descubre las reglas del negocio, entra en el **ciclo de la alucinación estructural**: asume el comportamiento de una API o proceso externo, escribe código sobre esa asunción, descubre que está equivocado, reescribe. Ese ciclo consume el 60% del tiempo de desarrollo en borrar y reescribir.

El Patrón C-1 rompe ese ciclo antes de que empiece. La actividad de decodificar la lógica del negocio y la actividad de codificar la arquitectura técnica son procesos cerebrales incompatibles — deben ejecutarse en fases secuenciales, nunca en paralelo.

---

## Anatomía de la pre-computación

El proceso no consiste en lectura pasiva de manuales. Es un **interrogatorio activo asistido por IA investigativa**.

### Fase 1: mapeo de ecosistemas hostiles

En lugar de preguntar "cómo funciona la API", el Arquitecto interroga con precisión quirúrgica:

- ¿Qué endpoints existen y qué servicios críticos exponen?
- ¿Cuáles son las limitaciones físicas — rate limits, latencias, cuotas?
- ¿Qué protocolos legados — SOAP, XML, archivos planos — imponen fricción?
- ¿Qué sistemas de autenticación no estándar — PKI, tokens rotativos — se requieren?
- ¿Cuál es el flujo de trabajo manual del usuario que el sistema viene a disolver?

### Fase 2: identificación de puntos hostiles

Antes de escribir una línea de código se identifican las 3–5 áreas donde la integración colisionará con la realidad. Esta identificación temprana permite diseñar **Adaptadores Universales** que neutralizan el caos externo antes de que contamine la lógica de negocio.

### Fase 3: separación de modos cognitivos

| Modo | Estado mental | Prohibición |
|---|---|---|
| **Absorción (C-1)** | Recepción y síntesis | No se escribe código |
| **Construcción** | Ejecución de alto rendimiento | No se investiga dominio |

La separación es estricta. Si durante la construcción surge una duda de dominio, se pausa la codificación, se actualiza el documento de reglas y después se retoma. Nunca en paralelo.

---

## Por qué funciona: la IA como destilador de realidad

Los modelos con acceso a la red sintetizan en minutos lo que a un humano le tomaría semanas: foros técnicos, documentación desactualizada, casos de error comunes, arquitecturas de referencia, restricciones no documentadas. El Arquitecto determina qué es relevante; la IA filtra el ruido.

El resultado es un documento `REGLAS_NEGOCIO.md` que contiene:

- Los contratos de datos exactos de cada servicio externo
- Las restricciones hostiles con sus workarounds
- El flujo de trabajo manual del usuario con sus puntos de dolor
- El diseño de base de datos completo que no depende de ver la respuesta de ninguna API

---

## El umbral de suficiencia (test de salida)

El IDE no se abre hasta poder responder estas cuatro preguntas de memoria, sin consultar nada:

1. ¿Qué hace el sistema externo exactamente? — contratos, formatos, protocolos
2. ¿Cuál es el cuello de botella real que mi sistema viene a romper? — el dolor manual del usuario
3. ¿Tengo un diseño de base de datos completo que no dependa de ver la respuesta de la API? — si el esquema depende de la API, el dominio no se entiende aún
4. ¿Cuáles son los puntos hostiles y tengo un Adaptador diseñado para cada uno?

Si alguna de estas preguntas no tiene respuesta clara, la Fase C-1 no terminó.

---

## El impacto en la ecuación

La variable "agilidad" deja de depender de la experiencia acumulada en años en un sector. Depende de la capacidad de ejecutar el Patrón C-1.

- **Antes:** "Solo puedo construir rápido lo que ya conozco."
- **Después:** "Puedo construir cualquier sistema porque domino el arte de comprimir cualquier dominio en días."

Esa es la diferencia entre un especialista con un techo y un Arquitecto con escala infinita.

---

*Para ver el Patrón C-1 en el contexto del ciclo completo de 6 días, ver [`02-framework/protocolo-peap-v5-144h.md`](../02-framework/protocolo-peap-v5-144h.md).*
