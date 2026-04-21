"""
Ontologia v2 del cerebro Zep INL — definiciones Pydantic v2.

Declara 10 entities (5 canonical + 5 evidence) + 12 edges (6 + 6) con
pares source-target permitidos via EntityEdgeSourceTarget. Alimenta
`setup_ontology.py` que invoca `zep_set_ontology(graph_ids=[...])` por grafo.

IMPORTANTE — bug MCP Zep documentado (REGISTRO_TRAUMAS 2026-04-20 +
Spike V-RES #1): el MCP expone `custom_fields` pero la API real espera
`properties`. Este modulo NO usa `custom_fields`. Las props custom por
entity/edge se declaran como campos Pydantic normales con `description=`
obligatorio — el SDK Zep las serializa correctamente al payload esperado.

Ref canonical: ADR-001-cerebro-zep-inl.md §Componente 6 (ontologia v2
especializada por grafo) + metadata_schema.md (caps + ejemplos JSON).
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from zep_cloud import EntityEdgeSourceTarget


# ---------------------------------------------------------------------------
# Base class — Ley F-1 Anti-Hardcoding (evita repetir props comunes en 10 clases)
# ---------------------------------------------------------------------------


class InlEntityBase(BaseModel):
    """
    Props comunes a toda entity del framework INL.

    `entity_name` se declara en subclases con description especifica
    (el formato varia: codigo puro para Ley/Patron, slug compuesto para
    EvidenciaEmpirica, etc).
    """

    model_config = ConfigDict(extra="forbid")

    source_path: str = Field(
        ...,
        description=(
            "Path relativo al repo INL donde vive el archivo fuente. "
            "Ej: 'CONSTITUCION.md', '03-patrones/c-1-precomputacion.md'."
        ),
    )
    ingested_at: str = Field(
        ...,
        description=(
            "Timestamp RFC3339 con timezone America/Argentina/Buenos_Aires "
            "del momento de ingesta. Distinto de created_at bitemporal."
        ),
    )


# ===========================================================================
# GRAFO 1 — inl-framework-canonical
# Contenido: Leyes, Patrones, Manifiestos, Teoria, Arquitectura Cognitiva,
# Reglas Editoriales, Fases PEAP, Conceptos canonicos, Artefactos.
# Velocidad de cambio: baja (inmutable con PR revisado).
# ===========================================================================


class Ley(InlEntityBase):
    """Regla inmutable del framework INL (fisica, operativa o r-especifica)."""

    entity_name: str = Field(
        ...,
        max_length=50,
        description=(
            "Codigo canonico puro: 'F-1' (fisicas), 'O-3' (operativas), "
            "'R-5' (r-especificas). Regex: (F|O|R)-\\d+."
        ),
    )
    codigo: str = Field(
        ..., description="Codigo canonico (mismo valor que entity_name)."
    )
    categoria: Literal["fisica", "operativa", "r_especifica"] = Field(
        ...,
        description=(
            "Categoria de la ley. 'fisica' = zero-violation, "
            "'operativa' = del skill nonlinear-engineering, "
            "'r_especifica' = de este repo docs-only."
        ),
    )
    titulo: str = Field(
        ..., description="Titulo corto legible. Ej: 'Muerte al Hardcoding'."
    )
    seccion_origen: str = Field(
        ...,
        description=(
            "Seccion del documento canonico donde se define. "
            "Ej: 'CONSTITUCION.md#ley-f-1'."
        ),
    )
    inmutable: bool = Field(
        default=True,
        description=(
            "True si la ley esta bajo clausula de inmutabilidad. "
            "Leyes F-* son siempre True; algunas R-* pueden evolucionar."
        ),
    )


class Patron(InlEntityBase):
    """Patron prescriptivo del framework (cognitivo, arquitectonico, gobernanza)."""

    entity_name: str = Field(
        ...,
        max_length=50,
        description="Codigo canonico puro: 'C-1', 'A-2', 'G-1'. Regex: (C|A|G)-\\d+.",
    )
    codigo: str = Field(..., description="Codigo canonico (mismo valor que entity_name).")
    familia: Literal["A", "C", "G"] = Field(
        ...,
        description=(
            "Familia del patron. 'A' = arquitectura, 'C' = cognitivo, "
            "'G' = gobernanza."
        ),
    )
    nombre: str = Field(..., description="Nombre del patron. Ej: 'Pre-Computacion de Dominio'.")
    estado: Literal["activo", "deprecated"] = Field(
        default="activo",
        description="Estado del patron en el framework. Deprecated se preserva por historia.",
    )
    fase_peap_aplicable_csv: str = Field(
        default="",
        description=(
            "CSV de fases PEAP donde aplica. Ej: 'Dia-1,Dia-2,Dia-3'. "
            "Vacio = aplica transversalmente."
        ),
    )
    leyes_asociadas_csv: str = Field(
        default="",
        description="CSV de codigos de leyes que fundamentan este patron. Ej: 'F-1,F-5'.",
    )
    anti_patrones_contrarios_csv: str = Field(
        default="",
        description="CSV de anti-patrones que este patron previene. Ej: 'AP-1,AP-3'.",
    )


class AntiPatron(InlEntityBase):
    """Patron proscriptivo — lo que el framework prohibe."""

    entity_name: str = Field(
        ...,
        max_length=50,
        description="Codigo canonico puro: 'AP-1'..'AP-4'. Regex: AP-\\d+.",
    )
    codigo: str = Field(..., description="Codigo canonico (mismo valor que entity_name).")
    nombre: str = Field(..., description="Nombre corto. Ej: 'Feature creep prematuro'.")
    fase_riesgo_csv: str = Field(
        default="",
        description="CSV de fases PEAP donde este anti-patron suele aparecer.",
    )
    senal_deteccion: str = Field(
        ...,
        description="Como identificarlo en el momento. Heuristica accionable.",
    )
    intervencion: str = Field(
        ...,
        description="Que hacer cuando se detecta. Paso concreto, no abstracto.",
    )
    patron_contrario_csv: str = Field(
        default="",
        description="CSV de patrones que lo previenen/corrigen.",
    )


class FasePEAP(InlEntityBase):
    """Fase del protocolo PEAP-V5 o estado fuera-del-ciclo."""

    entity_name: str = Field(
        ...,
        max_length=50,
        description=(
            "Valor del dia: 'Dia--1'..'Dia-6', 'Fuera-del-ciclo', "
            "'Sprint-360h'. Regex: Dia-\\d+ o literales declarados."
        ),
    )
    dia: str = Field(..., description="Identificador del dia/estado.")
    nombre: str = Field(..., description="Nombre de la fase. Ej: 'Gobernanza Dia 0'.")
    horas_desde_inicio: int = Field(
        default=0,
        description=(
            "Horas acumuladas desde Dia -1. 0 para fases fuera del ciclo. "
            "Valor negativo para Dia -1 si se modela simbolicamente."
        ),
    )
    condicion_salida: str = Field(
        ...,
        description="Criterio que cierra esta fase y habilita la siguiente.",
    )
    entregables_csv: str = Field(
        default="",
        description="CSV de entregables esperados al cerrar la fase.",
    )
    senales_alarma_csv: str = Field(
        default="",
        description="CSV de senales que indican que la fase esta en riesgo.",
    )
    patrones_activos_csv: str = Field(
        default="",
        description="CSV de codigos de patrones que aplican en esta fase.",
    )


class ConceptoCanonico(InlEntityBase):
    """
    Unifica Manifiesto + Concepto teorico + Artefacto canonico.

    Granularidad: 1 nodo por seccion `##` principal (no 1 por archivo).
    Esta entity es header; el body chunked se ingesta como episodios `text`
    separados con metadata `concepto_slug_ref` apuntando al entity_name.
    """

    entity_name: str = Field(
        ...,
        max_length=50,
        description=(
            "Slug compuesto: 'muerte-al-hardcoding/principio-iv', "
            "'teoria-cibernetica-v5/homeostasis'. Max 50 chars."
        ),
    )
    nombre: str = Field(..., description="Titulo legible de la seccion.")
    kind: Literal["manifiesto", "concepto", "artefacto"] = Field(
        ...,
        description=(
            "Tipo del contenido. Si un kind acumula >=3 propiedades "
            "exclusivas, disparar ADR sucesor de promocion a entity "
            "dedicada (Constraint A-2 — concepto_canonico_kinds.md)."
        ),
    )
    seccion_origen: str = Field(
        ...,
        description="Anchor markdown al `##` principal. Ej: '01-teoria/teoria-cibernetica-v5.md#homeostasis'.",
    )
    conceptos_relacionados_csv: str = Field(
        default="",
        description="CSV de slugs de otros conceptos relacionados.",
    )


# ---------------------------------------------------------------------------
# Edges del grafo canonical (6 de 10, 40% margen libre)
# ---------------------------------------------------------------------------


class Prohibe(BaseModel):
    """Una ley proscribe un anti-patron. Ley -> AntiPatron."""

    model_config = ConfigDict(extra="forbid")

    severidad: Literal["bloqueante", "fuerte", "advertencia"] = Field(
        ...,
        description=(
            "Fuerza normativa de la prohibicion. 'bloqueante' detiene ejecucion; "
            "'fuerte' exige justificacion documentada; 'advertencia' informa."
        ),
    )
    ambito: Literal["universal", "fase_especifica", "proyecto_especifico"] = Field(
        ...,
        description="Scope donde aplica la prohibicion.",
    )


class Requiere(BaseModel):
    """Una ley exige aplicar un patron. Ley -> Patron."""

    model_config = ConfigDict(extra="forbid")

    obligatoriedad: Literal["mandatoria", "recomendada", "contextual"] = Field(
        ...,
        description=(
            "Nivel de obligatoriedad. 'mandatoria' = ley exige sin excepcion; "
            "'recomendada' = default salvo justificacion; "
            "'contextual' = depende de condicion_aplicacion."
        ),
    )
    condicion_aplicacion: str = Field(
        default="",
        description="Condicion bajo la cual aplica. Vacio si obligatoriedad != contextual.",
    )


class AplicaA(BaseModel):
    """Un patron se aplica en una fase PEAP. Patron -> FasePEAP."""

    model_config = ConfigDict(extra="forbid")

    momento: str = Field(
        ...,
        description="Momento especifico dentro de la fase. Ej: 'apertura', 'cierre', 'transversal'.",
    )
    criticidad: Literal["critica", "media", "baja"] = Field(
        ...,
        description="Criticidad de aplicar el patron en esa fase.",
    )


class Contradice(BaseModel):
    """Oposicion prescriptiva entre patron y anti-patron. Patron <-> AntiPatron."""

    model_config = ConfigDict(extra="forbid")

    relacion_tipo: Literal["preventivo", "correctivo", "paralelo"] = Field(
        ...,
        description=(
            "Como el patron se opone al anti-patron. 'preventivo' evita que aparezca; "
            "'correctivo' lo repara cuando ya aparecio; 'paralelo' son alternativas mutuamente excluyentes."
        ),
    )


class Define(BaseModel):
    """Un concepto/manifiesto define formalmente otro elemento canonico."""

    model_config = ConfigDict(extra="forbid")

    grado_definicion: Literal["formal", "parcial", "implicita"] = Field(
        ...,
        description="Fuerza definicional. 'formal' cierra el concepto; 'parcial' lo acota; 'implicita' lo sugiere.",
    )


class Referencia(BaseModel):
    """Fallback generico — cualquier entity -> cualquier entity."""

    model_config = ConfigDict(extra="forbid")

    tipo_referencia: str = Field(
        ...,
        description=(
            "Naturaleza de la referencia. Usar cuando ningun edge especifico "
            "aplica. Valores tipicos: 'cita', 'contexto', 'ejemplo'."
        ),
    )


# ===========================================================================
# GRAFO 2 — inl-framework-evidence
# Contenido: 05-evidencia/, 07-avances/, REGISTRO_TRAUMAS.md, snapshots,
# ADRs instanciados, ProyectoFuente (declarativo).
# Velocidad de cambio: alta (evolutiva, bitemporal).
# ===========================================================================


class ProyectoFuente(InlEntityBase):
    """Proyecto real que aplica INL (ej. ARCA)."""

    entity_name: str = Field(
        ...,
        max_length=50,
        description="Nombre corto canonico del proyecto. Ej: 'ARCA'.",
    )
    nombre_completo: str = Field(
        ..., description="Nombre expandido. Ej: 'Suite de Automatizacion ARCA'."
    )
    repo_url: str = Field(
        default="",
        description="URL del repo. Vacio si no es publico.",
    )
    stack_csv: str = Field(
        default="",
        description="CSV de tecnologias principales. Ej: 'n8n,Supabase,Next.js,TypeScript'.",
    )
    fase_peap_actual: str = Field(
        default="",
        description="Referencia al entity_name de FasePEAP actual del proyecto.",
    )
    activo: bool = Field(
        default=True,
        description="False si el proyecto fue archivado o pausado.",
    )
    fecha_alta: str = Field(
        ...,
        description="Fecha RFC3339 en que el proyecto adopto el framework.",
    )


class EvidenciaEmpirica(InlEntityBase):
    """Dato u observacion empirica que respalda o invalida un elemento canonico."""

    entity_name: str = Field(
        ...,
        max_length=50,
        description=(
            "Slug compuesto: '<proyecto>/<incidente_o_pr>/<asunto>'. "
            "Ej: 'ARCA/PR-204/c-1-validacion'. Max 50 chars."
        ),
    )
    tipo: Literal["validacion", "invalidacion", "metrica"] = Field(
        ...,
        description="Rol de la evidencia. 'validacion' respalda; 'invalidacion' contradice; 'metrica' reporta KPI.",
    )
    fecha_observacion: str = Field(
        ...,
        description=(
            "Fecha RFC3339 cuando se observo el fenomeno (NO cuando se ingesto). "
            "Usar como created_at bitemporal (R7 FIX, HM-4)."
        ),
    )
    proyecto_ref: str = Field(
        ..., description="entity_name del ProyectoFuente que genero la evidencia."
    )
    descripcion_corta: str = Field(
        ...,
        max_length=250,
        description="Una oracion. El detalle completo va al body del episodio.",
    )
    metricas_csv: str = Field(
        default="",
        description="CSV key=value de metricas cuantitativas si tipo='metrica'.",
    )
    pr_incidente_ref: str = Field(
        default="",
        description="Referencia al PR/incidente origen. Ej: 'PR-204', 'incident-2025-11-03'.",
    )


class DecisionFundada(InlEntityBase):
    """ADR instanciado, trauma registrado, o decision estrategica documentada."""

    entity_name: str = Field(
        ...,
        max_length=50,
        description=(
            "Para ADR: 'ADR-001'. Para trauma: 'trauma/YYYY-MM-DD/slug'. "
            "Max 50 chars."
        ),
    )
    tipo: Literal["adr", "trauma", "estrategica"] = Field(
        ...,
        description=(
            "Tipo de decision. 'adr' = Architecture Decision Record; "
            "'trauma' = entrada en REGISTRO_TRAUMAS.md; "
            "'estrategica' = decision de alto nivel sin ADR formal."
        ),
    )
    fecha: str = Field(
        ...,
        description="Fecha RFC3339 de la decision. Usar como created_at bitemporal.",
    )
    titulo: str = Field(..., description="Titulo corto legible.")
    autor: str = Field(
        default="",
        description="Autor de la decision. Vacio si es colectiva o indocumentada.",
    )
    leyes_impactadas_csv: str = Field(
        default="",
        description="CSV de codigos de leyes que la decision modifica o invoca.",
    )
    patrones_invocados_csv: str = Field(
        default="",
        description="CSV de codigos de patrones que la decision aplica.",
    )
    status: Literal["aceptada", "superseded", "rechazada", "propuesta"] = Field(
        default="aceptada",
        description="Estado del ciclo de vida de la decision.",
    )


class Avance(InlEntityBase):
    """Entregable, ideacion o consolidacion producida por un sprint/sesion."""

    entity_name: str = Field(
        ...,
        max_length=50,
        description=(
            "Slug del archivo o seccion: 'homeostasis-documental-bitemporal'. "
            "Max 50 chars."
        ),
    )
    titulo: str = Field(..., description="Titulo legible del avance.")
    categoria: Literal["sprint", "ideacion", "consolidacion"] = Field(
        ...,
        description=(
            "Etapa de maduracion. 'sprint' = WIP activo; "
            "'ideacion' = borrador prospectivo; "
            "'consolidacion' = entregable cerrado y consumible."
        ),
    )
    fecha: str = Field(
        ...,
        description="Fecha RFC3339 de la ultima actualizacion del avance.",
    )
    proyecto_origen: str = Field(
        default="",
        description="entity_name del ProyectoFuente donde emergio. Vacio si es del meta-repo.",
    )
    patrones_emergentes_csv: str = Field(
        default="",
        description="CSV de codigos de patrones detectados en el avance.",
    )


class SnapshotHistorico(InlEntityBase):
    """Estado del repo/framework en un momento bitemporal discreto."""

    entity_name: str = Field(
        ...,
        max_length=50,
        description="'snapshot/YYYY-MM-DD' o marcador estructural.",
    )
    fecha_snapshot: str = Field(
        ...,
        description="Fecha RFC3339 del snapshot. Usar como created_at bitemporal.",
    )
    fase_framework: str = Field(
        ...,
        description="Fase del framework en el momento del snapshot. Ej: 'V5-estable'.",
    )
    iniciativa_activa: str = Field(
        default="",
        description="Nombre de la iniciativa en curso. Vacio si no hay sprint activo.",
    )
    version_framework: str = Field(
        default="",
        description="Version del framework. Ej: 'V5.2'.",
    )
    proyectos_activos_csv: str = Field(
        default="",
        description="CSV de entity_names de ProyectoFuente activos al momento.",
    )
    pendiente_principal: str = Field(
        default="",
        description="Primer bloqueante reconocido del siguiente paso.",
    )
    ramas_csv: str = Field(
        default="",
        description="CSV de ramas git activas relevantes al snapshot.",
    )


# ---------------------------------------------------------------------------
# Edges del grafo evidence (6 de 10, 40% margen libre)
# ---------------------------------------------------------------------------


class Respalda(BaseModel):
    """Evidencia o decision respalda un elemento canonico. Polaridad positiva."""

    model_config = ConfigDict(extra="forbid")

    fuerza: Literal["fuerte", "moderada", "anecdotica"] = Field(
        ...,
        description=(
            "Solidez del respaldo. 'fuerte' = multi-case replicable; "
            "'moderada' = case study unico; 'anecdotica' = observacion aislada."
        ),
    )
    fecha_respaldo: str = Field(
        ...,
        description="Fecha RFC3339 cuando se establecio el respaldo.",
    )


class Invalida(BaseModel):
    """Evidencia invalida un elemento canonico. Invalidacion bitemporal."""

    model_config = ConfigDict(extra="forbid")

    fuerza: Literal["fuerte", "moderada", "anecdotica"] = Field(
        ...,
        description="Solidez de la invalidacion (misma semantica que Respalda.fuerza).",
    )
    fecha_invalidacion: str = Field(
        ...,
        description=(
            "Fecha RFC3339 cuando se observo la invalidacion. Ancla bitemporal "
            "para que queries con 'as-of' antes de esta fecha aun vean el elemento valido."
        ),
    )
    superseded_by: str = Field(
        default="",
        description="entity_name del elemento que reemplaza al invalidado. Vacio si no hay reemplazo.",
    )


class EmergioEn(BaseModel):
    """Un patron/concepto emergio empiricamente en un proyecto fuente."""

    model_config = ConfigDict(extra="forbid")

    fecha_emergencia: str = Field(
        ...,
        description="Fecha RFC3339 de la primera observacion empirica.",
    )
    grado_emergencia: Literal[
        "empirico_validado", "observacional", "teorico_prospectivo"
    ] = Field(
        ...,
        description=(
            "Fuerza de la emergencia. 'empirico_validado' = replicable en el proyecto; "
            "'observacional' = se vio pero sin repeticion; "
            "'teorico_prospectivo' = se teorizo desde el proyecto pero no se instancio."
        ),
    )


class GeneradoEn(BaseModel):
    """Un avance fue producido por/para un proyecto fuente."""

    model_config = ConfigDict(extra="forbid")

    rol_proyecto: Literal["origen", "beneficiario"] = Field(
        ...,
        description=(
            "Rol del proyecto. 'origen' = genero el avance; "
            "'beneficiario' = lo consume pero no lo produjo."
        ),
    )


class Captura(BaseModel):
    """Un snapshot historico captura el estado de una entity en un momento."""

    model_config = ConfigDict(extra="forbid")

    estado_en_snapshot: str = Field(
        ...,
        description=(
            "Estado textual de la entity al momento del snapshot. "
            "Ej: 'activo', 'deprecated', 'propuesto'."
        ),
    )


# Nota: el edge `Referencia` tambien aplica en evidence. Se declara una sola
# vez arriba (en canonical) y se reusa — al registrarlo en la ontologia
# evidence, usar el mismo modelo con pares source-target especificos.


# ===========================================================================
# Mapas source-target — EntityEdgeSourceTarget por edge
# Declaracion explicita de pares permitidos (ontologia Zep exige esto).
# ===========================================================================


def canonical_edge_types() -> dict[str, dict]:
    """
    Retorna el dict de edge types del grafo canonical para pasar a
    `zep_set_ontology(graph_ids=['inl-framework-canonical'], edges=...)`.

    Formato esperado por el SDK:
        {"EDGE_NAME": (EdgeModel, [EntityEdgeSourceTarget(source=..., target=...), ...])}
    """

    return {
        "PROHIBE": (
            Prohibe,
            [EntityEdgeSourceTarget(source="Ley", target="AntiPatron")],
        ),
        "REQUIERE": (
            Requiere,
            [EntityEdgeSourceTarget(source="Ley", target="Patron")],
        ),
        "APLICA_A": (
            AplicaA,
            [EntityEdgeSourceTarget(source="Patron", target="FasePEAP")],
        ),
        "CONTRADICE": (
            Contradice,
            [
                EntityEdgeSourceTarget(source="Patron", target="AntiPatron"),
                EntityEdgeSourceTarget(source="AntiPatron", target="Patron"),
            ],
        ),
        "DEFINE": (
            Define,
            [
                EntityEdgeSourceTarget(source="ConceptoCanonico", target="Ley"),
                EntityEdgeSourceTarget(source="ConceptoCanonico", target="Patron"),
                EntityEdgeSourceTarget(source="ConceptoCanonico", target="AntiPatron"),
                EntityEdgeSourceTarget(source="ConceptoCanonico", target="FasePEAP"),
            ],
        ),
        "REFERENCIA": (
            Referencia,
            [EntityEdgeSourceTarget(source="Entity", target="Entity")],
        ),
    }


def evidence_edge_types() -> dict[str, dict]:
    """
    Retorna el dict de edge types del grafo evidence para pasar a
    `zep_set_ontology(graph_ids=['inl-framework-evidence'], edges=...)`.
    """

    return {
        "RESPALDA": (
            Respalda,
            [
                EntityEdgeSourceTarget(source="EvidenciaEmpirica", target="Entity"),
                EntityEdgeSourceTarget(source="DecisionFundada", target="Entity"),
            ],
        ),
        "INVALIDA": (
            Invalida,
            [EntityEdgeSourceTarget(source="EvidenciaEmpirica", target="Entity")],
        ),
        "EMERGIO_EN": (
            EmergioEn,
            [EntityEdgeSourceTarget(source="Entity", target="ProyectoFuente")],
        ),
        "GENERADO_EN": (
            GeneradoEn,
            [EntityEdgeSourceTarget(source="Avance", target="ProyectoFuente")],
        ),
        "CAPTURA": (
            Captura,
            [EntityEdgeSourceTarget(source="SnapshotHistorico", target="Entity")],
        ),
        "REFERENCIA": (
            Referencia,
            [EntityEdgeSourceTarget(source="Entity", target="Entity")],
        ),
    }


def canonical_entity_types() -> dict[str, type[BaseModel]]:
    """Dict de entity types del grafo canonical."""

    return {
        "Ley": Ley,
        "Patron": Patron,
        "AntiPatron": AntiPatron,
        "FasePEAP": FasePEAP,
        "ConceptoCanonico": ConceptoCanonico,
    }


def evidence_entity_types() -> dict[str, type[BaseModel]]:
    """Dict de entity types del grafo evidence."""

    return {
        "ProyectoFuente": ProyectoFuente,
        "EvidenciaEmpirica": EvidenciaEmpirica,
        "DecisionFundada": DecisionFundada,
        "Avance": Avance,
        "SnapshotHistorico": SnapshotHistorico,
    }
