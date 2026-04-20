# Patrón A-2: Constraint-Driven Development (CDD)

> *"La seguridad no es una sugerencia del código. Es una ley física de la persistencia."*

*Alias: Blindaje en la capa física*

---

## La tesis

Las reglas críticas de seguridad — aislamiento de datos, multi-tenencia, invariantes del dominio — deben residir en la capa más profunda del sistema: la base de datos. No son validaciones del middleware. No son verificaciones del frontend. Son **restricciones físicas infranqueables** implementadas en la capa de persistencia.

La Ingeniería Lineal coloca la seguridad donde es cómodo para el desarrollador: en el código de aplicación. Esta es la decisión más peligrosa del paradigma, y su costo se paga en la primera brecha de seguridad o en el primer bug de multi-tenencia que expone datos entre clientes.

La Ingeniería No Lineal invierte la jerarquía: **la base de datos es la única autoridad de seguridad**. El código de aplicación puede intentar acceder a lo que quiera — la base lo bloquea a nivel atómico.

---

## El problema que resuelve

### El anti-patrón: seguridad como código

En arquitecturas lineales, las reglas de aislamiento viven en el middleware. Cada endpoint verifica si el usuario actual tiene permiso. Cada query incluye cláusulas `WHERE user_id = ?`. Cada funcionalidad nueva debe recordar aplicar los mismos checks.

Esto tiene tres fallas fatales:

1. **La disciplina falla con certeza estadística.** Tarde o temprano, un endpoint nuevo olvida el check. Un desarrollador junior copia código sin entender por qué. Una refactorización rompe una verificación sin que nadie lo note.
2. **El perímetro es poroso por diseño.** Cualquier punto de entrada al sistema — API, webhook, job batch — debe replicar los mismos controles. Si uno falla, todos fallan.
3. **Los auditores de seguridad no pueden certificar el sistema.** No hay forma matemática de demostrar que ningún path del código accede a datos que no debería. La seguridad depende de la ausencia de bugs en todo el código, no de una propiedad estructural.

### El costo real

El costo no es un endpoint inseguro — es el **riesgo sistémico de filtración cruzada**. En sistemas multi-tenant, la consecuencia de violar el aislamiento es catastrófica: el cliente A ve datos del cliente B. La empresa pierde credibilidad, legalidad, contrato. A veces todo junto.

---

## La regla operativa

**La lógica de aislamiento, multi-tenencia y invariantes críticas reside exclusivamente en la base de datos.**

El middleware puede agregar verificaciones por conveniencia (mejor UX, errores tempranos), pero la base de datos es la **autoridad final e inviolable**. Si el middleware se compromete, la base aún bloquea accesos ilegítimos.

---

## Implementación canónica

El CDD se materializa en tres mecanismos de la base de datos:

### 1. Row Level Security (RLS)

En bases de datos modernas (PostgreSQL, SQL Server, Oracle), RLS permite definir políticas que se aplican automáticamente a cada query. Cada fila de cada tabla "conoce" a quién pertenece. Cualquier query que intente acceder a filas fuera del alcance del usuario actual es bloqueada a nivel atómico.

```sql
CREATE POLICY tenant_isolation ON pedidos
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

Esta política garantiza que, independientemente de qué query ejecute el código de aplicación, solo se devuelven filas del tenant activo. Cero confianza en el middleware.

### 2. Restricciones declarativas (CHECK, UNIQUE, NOT NULL, FOREIGN KEY)

Los invariantes matemáticos del dominio se expresan como restricciones de la base de datos, no como validaciones del middleware. Si una regla del negocio dice *"un pedido no puede tener total negativo"*, eso se expresa:

```sql
ALTER TABLE pedidos ADD CONSTRAINT total_no_negativo CHECK (total >= 0);
```

Ahora ningún path del código puede insertar un pedido con total negativo. La base lo rechaza atómicamente.

### 3. Triggers de auditoría

Todo movimiento sensible del sistema se audita automáticamente mediante triggers que escriben a tablas inmutables. No depende de que el código de aplicación "recuerde" auditar — la base lo hace como efecto colateral de la modificación.

```sql
CREATE TRIGGER audit_pedidos
  AFTER INSERT OR UPDATE OR DELETE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();
```

---

## El principio filosófico

Las restricciones del sistema no son *"lo que el programador decidió verificar"*. Son **leyes físicas del universo del sistema**, implementadas en el lugar donde no pueden ser sobornadas.

Esta inversión de jerarquía tiene una consecuencia profunda: el desarrollador no puede **accidentalmente** violar una restricción crítica. Puede intentarlo — la base lo rechaza. Puede escribir código que parece violar la restricción — la base lo rechaza en runtime. El sistema se vuelve **insobornable por construcción**.

---

## Validación empírica del patrón

En proyectos multi-tenant aplicando CDD desde el primer commit:

- **Cero incidentes de filtración cruzada** a lo largo de la vida del sistema
- **Reducción del 60-70% de lógica de validación** en el middleware (ya no hace falta replicar checks)
- **Certificación de auditoría simplificada** — los auditores validan las políticas de RLS en vez de revisar cada endpoint
- **Onboarding acelerado** — los desarrolladores nuevos no pueden romper la seguridad aunque quieran

Ejemplo concreto documentado: en un proyecto multi-tenant con 19 tablas, el RLS fue activado desde el Día 1 como parte de la constitución técnica. El middleware subsiguiente se construyó **sin verificaciones redundantes de tenant**. Cero incidentes de filtración en 15+ días de desarrollo intensivo con múltiples tenants simultáneos.

---

## La inversión de 20 minutos con retorno compuesto

Implementar RLS en una tabla nueva toma ~20 minutos. Implementarlo después, retroactivamente, cuando el sistema ya está en producción, puede tomar **semanas** — porque cada query existente asume ausencia de RLS y debe ser auditada.

Esta es la esencia del patrón G-2 (Gobernanza desde Día 0) aplicada a seguridad. El costo es mínimo si se paga al inicio. El costo es insoportable si se paga después. Por esta razón, CDD es **obligatorio desde la primera tabla del proyecto**.

---

## Cuándo aplicar este patrón

**Aplicar obligatoriamente cuando:**

- El sistema es multi-tenant (múltiples clientes comparten infraestructura)
- El sistema maneja datos regulados (fiscales, médicos, financieros, personales)
- Hay invariantes del dominio que nunca deben violarse (totales no negativos, fechas coherentes, estados consecutivos)
- Hay requerimiento legal o contractual de auditoría inmutable

**Aplicar con alto beneficio cuando:**

- Hay múltiples puntos de entrada al sistema (API, webhooks, jobs, CLI)
- El sistema será mantenido por equipos rotativos o desarrolladores junior
- El costo de una brecha es alto (reputacional, legal, operativo)

**No aplicar cuando:**

- El sistema es un prototipo desechable sin datos sensibles
- La base de datos utilizada no soporta los mecanismos necesarios (raro en bases modernas)

---

## Anti-patrones a evitar

### Anti-patrón 1 — Seguridad solo en middleware

El sistema "tiene seguridad" porque cada endpoint verifica permisos. Pero la base de datos está abierta — cualquier SQL injection o bug lógico lo compromete. La seguridad es una ilusión estadística.

**Solución:** RLS obligatorio en todas las tablas del esquema `public` o equivalente. El middleware es defensa en profundidad, no la capa primaria.

### Anti-patrón 2 — RLS activado pero sin pruebas

El desarrollador crea políticas RLS pero nunca prueba que funcionan. Bajo carga, políticas mal formuladas pueden ser evitadas o dar rendimiento catastrófico.

**Solución:** suite de tests específica para RLS. Cada política se prueba con dos usuarios diferentes y se valida que uno no ve los datos del otro, aún con queries deliberadamente adversariales.

### Anti-patrón 3 — Restricciones como documentación

El proyecto documenta *"los totales no pueden ser negativos"* pero no implementa la restricción CHECK en la base. La documentación es aspiracional; el código puede violar lo documentado en silencio.

**Solución:** si una regla aparece en documentación, debe existir como restricción implementada. Si no se puede implementar en la base, replantear si realmente es una regla invariante.

### Anti-patrón 4 — Auditoría como responsabilidad del código

El middleware "debería" escribir a la tabla de auditoría cada vez que modifica pedidos. A veces lo hace, a veces lo olvida. La auditoría tiene gaps silenciosos.

**Solución:** triggers automáticos. La auditoría ocurre como efecto colateral inevitable de la modificación. El código no puede olvidarla porque no es el responsable.

---

## La regla de oro del CDD

> **Si la regla es importante, vive en la base. Si vive solo en el código, no es importante.**

Esta regla es brutal pero efectiva. Si un desarrollador argumenta que una regla es crítica pero resiste implementarla en la base, está confesando que la regla es aspiracional — una sugerencia que espera que todos respeten.

Las reglas reales se codifican en la capa física. Las aspiracionales viven en PRs olvidados.

---

## Relación con otros patrones

### Con A-1 (Adaptador Universal)

A-1 aísla el contacto con servicios externos hostiles. A-2 aísla la persistencia con reglas físicas. Juntos establecen las dos fronteras inviolables del sistema: hacia afuera (adaptador) y hacia abajo (persistencia). El núcleo de negocio opera con confianza entre esas dos fronteras.

### Con G-2 (Gobernanza desde Día 0)

A-2 es uno de los elementos constitucionales que G-2 exige desde el primer commit. Un proyecto que omite RLS en el Día 1 y promete implementarlo "después" rara vez lo hace — y cuando lo hace, el costo es órdenes de magnitud mayor.

### Con el Manifiesto Muerte al Hardcoding

El tipo II de hardcoding (lógica de seguridad) es precisamente lo que A-2 elimina. La seguridad no es "hardcoded" en el middleware — es ley física de la persistencia.

### Con Abandono Preparado

Un sistema con CDD robusto sobrevive a la ausencia de su creador con integridad garantizada. Desarrolladores futuros pueden experimentar, cometer errores, escribir código imperfecto — la base mantiene la seguridad intacta.

---

## Conclusión

CDD no es "buenas prácticas de seguridad". Es una **decisión arquitectónica fundacional**: reconocer que el código de aplicación es falible por naturaleza, y que la única forma de garantizar integridad sistémica es delegar la seguridad a la capa donde no puede ser eludida.

Un sistema construido con CDD tiene una propiedad rara en software: **la seguridad es matemáticamente demostrable**. Los auditores pueden revisar las políticas RLS y certificar que el aislamiento es correcto, sin necesidad de revisar cada línea del middleware.

Esa certeza estructural no se obtiene con disciplina del desarrollador. Se obtiene delegando la seguridad al único lugar del sistema que no puede ser sobornado: la base de datos.

---

*Para el patrón que aisla el contacto con el exterior del sistema, ver [`03-patrones/a1-adaptador-universal.md`](a1-adaptador-universal.md).*
*Para la gobernanza que exige CDD desde el primer día del proyecto, ver [`03-patrones/g2-gobernanza-dia-cero.md`](g2-gobernanza-dia-cero.md).*
