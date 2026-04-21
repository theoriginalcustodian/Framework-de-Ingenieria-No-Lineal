"""
Aplica la ontologia v2 INL a los 2 grafos Zep (canonical + evidence).

Invoca `zep_set_ontology(graph_ids=[...])` con entity + edge types definidos
en `ontology_definition.py`. Soporta `--dry-run` para inspeccionar el payload
sin tocar infraestructura live.

Precondicion: los 2 grafos deben existir en el proyecto Zep `inl-framework`.
Si no existen, correr `bootstrap_graphs.py` primero.

Uso:
    python setup_ontology.py --dry-run      # imprime lo que enviaria, no ejecuta
    python setup_ontology.py --apply        # ejecuta contra Zep (requiere API key cargada)
    python setup_ontology.py --apply --graph canonical   # solo uno de los dos

IMPORTANTE — Ley F-6 HITL: correr siempre con --dry-run primero y
validar el JSON impreso. Recien despues --apply.
"""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any

from pydantic import BaseModel

from constants import GRAPH_IDS
from ontology_definition import (
    canonical_edge_types,
    canonical_entity_types,
    evidence_edge_types,
    evidence_entity_types,
)


# ---------------------------------------------------------------------------
# Serializacion para inspeccion humana (--dry-run)
# ---------------------------------------------------------------------------


def _serialize_entity_type(name: str, model: type[BaseModel]) -> dict[str, Any]:
    """Extrae schema JSON para inspeccion (no es el formato que consume Zep)."""

    schema = model.model_json_schema()
    props = schema.get("properties", {})
    return {
        "name": name,
        "description": (model.__doc__ or "").strip().splitlines()[0]
        if model.__doc__
        else "",
        "properties": {
            k: {
                "type": v.get("type", v.get("anyOf", "unknown")),
                "description": v.get("description", ""),
            }
            for k, v in props.items()
        },
    }


def _serialize_edge_type(name: str, edge_tuple: tuple) -> dict[str, Any]:
    """Extrae schema + pares source-target para inspeccion."""

    model, pairs = edge_tuple
    schema = model.model_json_schema()
    props = schema.get("properties", {})
    return {
        "name": name,
        "description": (model.__doc__ or "").strip().splitlines()[0]
        if model.__doc__
        else "",
        "source_targets": [
            {"source": p.source, "target": p.target} for p in pairs
        ],
        "properties": {
            k: {
                "type": v.get("type", v.get("anyOf", "unknown")),
                "description": v.get("description", ""),
            }
            for k, v in props.items()
        },
    }


def build_canonical_payload() -> dict[str, Any]:
    """Payload inspeccionable para el grafo canonical."""

    return {
        "graph_id": GRAPH_IDS["canonical"],
        "entity_types": [
            _serialize_entity_type(n, m) for n, m in canonical_entity_types().items()
        ],
        "edge_types": [
            _serialize_edge_type(n, t) for n, t in canonical_edge_types().items()
        ],
    }


def build_evidence_payload() -> dict[str, Any]:
    """Payload inspeccionable para el grafo evidence."""

    return {
        "graph_id": GRAPH_IDS["evidence"],
        "entity_types": [
            _serialize_entity_type(n, m) for n, m in evidence_entity_types().items()
        ],
        "edge_types": [
            _serialize_edge_type(n, t) for n, t in evidence_edge_types().items()
        ],
    }


# ---------------------------------------------------------------------------
# Aplicacion live via SDK Zep
# ---------------------------------------------------------------------------


def _verify_graphs_exist(client: Any, graph_ids: list[str]) -> list[str]:
    """
    Retorna la lista de graph_ids que NO existen en el proyecto actual.
    Usa `list_all()` paginado del SDK Zep.
    """

    response = client.graph.list_all(page_number=1, page_size=100)
    graphs = response.graphs if hasattr(response, "graphs") else []
    existing = {g.graph_id for g in graphs}
    return [gid for gid in graph_ids if gid not in existing]


def _apply_to_graph(
    client: Any,
    graph_id: str,
    entities: dict[str, type[BaseModel]],
    edges: dict[str, tuple],
) -> None:
    """
    Invoca `set_ontology` del SDK Zep con entity + edge types.

    NOTA: pasa `entities` y `edges` directos (modelos Pydantic + tuplas) —
    el SDK extrae `properties` automaticamente. NO usar `custom_fields`
    (bug MCP documentado en REGISTRO_TRAUMAS 2026-04-20, Spike V-RES #1).
    """

    print(f"  [apply] set_ontology(graph_ids=['{graph_id}'])")
    client.graph.set_ontology(
        graph_ids=[graph_id],
        entities=entities,
        edges=edges,
    )
    print(f"  [apply] OK ontologia aplicada a {graph_id}")


def apply_ontology(which: str = "both") -> None:
    """
    Aplica ontologia al grafo indicado ('canonical', 'evidence', 'both').

    Requiere `ZEP_API_KEY` cargada en env y `zep-cloud` SDK instalado.
    """

    try:
        from zep_cloud.client import Zep
    except ImportError:
        print(
            "[error] zep-cloud SDK no instalado. `pip install zep-cloud`",
            file=sys.stderr,
        )
        sys.exit(1)

    import os
    try:
        from dotenv import load_dotenv
        load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))
    except ImportError:
        pass

    api_key = os.getenv("ZEP_API_KEY")
    if not api_key:
        print(
            "[error] ZEP_API_KEY no cargada en env. Configurar en .env o export.",
            file=sys.stderr,
        )
        sys.exit(1)

    client = Zep(api_key=api_key)

    targets = []
    if which in ("canonical", "both"):
        targets.append(GRAPH_IDS["canonical"])
    if which in ("evidence", "both"):
        targets.append(GRAPH_IDS["evidence"])

    missing = _verify_graphs_exist(client, targets)
    if missing:
        print(
            f"[error] Grafos no existen en el proyecto Zep: {missing}\n"
            f"        Correr `python bootstrap_graphs.py` primero.",
            file=sys.stderr,
        )
        sys.exit(1)

    if which in ("canonical", "both"):
        _apply_to_graph(
            client,
            GRAPH_IDS["canonical"],
            canonical_entity_types(),
            canonical_edge_types(),
        )
    if which in ("evidence", "both"):
        _apply_to_graph(
            client,
            GRAPH_IDS["evidence"],
            evidence_entity_types(),
            evidence_edge_types(),
        )


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Aplica ontologia v2 INL a los grafos Zep.",
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument(
        "--dry-run",
        action="store_true",
        help="Imprime el payload que se enviaria, sin ejecutar.",
    )
    mode.add_argument(
        "--apply",
        action="store_true",
        help="Aplica la ontologia contra Zep live. Requiere ZEP_API_KEY.",
    )
    parser.add_argument(
        "--graph",
        choices=("canonical", "evidence", "both"),
        default="both",
        help="A que grafo aplicar. Default: both.",
    )
    args = parser.parse_args()

    if args.dry_run:
        payload = {}
        if args.graph in ("canonical", "both"):
            payload["canonical"] = build_canonical_payload()
        if args.graph in ("evidence", "both"):
            payload["evidence"] = build_evidence_payload()
        print(json.dumps(payload, indent=2, ensure_ascii=False))
        return

    if args.apply:
        apply_ontology(args.graph)
        return


if __name__ == "__main__":
    main()
