# Tracking — propiedades exclusivas por `kind` de `ConceptoCanonico`

> **Constraint A-2 ejecutable** (ADR-001-cerebro-zep-inl.md §Seguimiento HM-1).
>
> `ConceptoCanonico` unifica Manifiesto + Concepto teórico + Artefacto canónico en una única entity para mantener la ontología v2 con 40-50% de margen. Si un `kind` acumula **≥3 propiedades exclusivas** (no compartidas con los otros kinds), se dispara ADR sucesor de promoción a entity dedicada.

---

## Tabla de tracking

| kind | propiedades exclusivas | count | notas |
|---|---|---|---|
| `manifiesto` | (ninguna hoy) | 0 | — |
| `concepto` | (ninguna hoy) | 0 | — |
| `artefacto` | (ninguna hoy) | 0 | — |

**Threshold de activación:** `count ≥ 3` en cualquier fila.

---

## Protocolo

1. Al agregar una propiedad custom a `ConceptoCanonico` en futuras iteraciones de la ontología, revisar si aplica a los 3 kinds o solo a uno.
2. Si aplica a solo 1 kind:
   - Agregar fila a la tabla: `kind`, nombre de la propiedad, incrementar count.
   - Si el count llega a 3 para ese kind, abrir ADR sucesor (ADR-00X-promocion-<kind>-a-entity-dedicada).
3. Al promover, migrar los nodos existentes con `kind=<X>` a la nueva entity vía `node_update` con nuevo `entity_type`.

---

## Historial de modificaciones

| Fecha | Cambio | Autor |
|---|---|---|
| 2026-04-20 | Archivo creado como stub (Fase 1 cierre) | Agente + CPU |

---

## Referencias

- **Mecanismo:** `ADR-001-cerebro-zep-inl.md §Seguimiento HM-1`
- **Entity afectada:** `ontology_definition.py` → `ConceptoCanonico`
- **Ley invocada:** F-1 Anti-Hardcoding (evita proliferación de entities ad-hoc sin evidencia de necesidad)
