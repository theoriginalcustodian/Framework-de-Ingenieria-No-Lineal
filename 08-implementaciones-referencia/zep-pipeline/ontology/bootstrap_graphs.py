"""
Bootstrap de los 2 grafos standalone del cerebro Zep INL.

Crea `inl-framework-canonical` + `inl-framework-evidence` en el proyecto Zep
dedicado `inl-framework`. Idempotente: si un grafo ya existe, lo deja tal cual.

TODO(Fase 2): este stub se ejecuta UNA sola vez al inicio de Fase 2 del sprint
INL-ZepBrain. No ejecutar en Fase 1 — el proyecto Zep debe quedar pristino
hasta que los ingesters esten listos.

Precondicion:
- Proyecto Zep `inl-framework` creado via dashboard (no hay API para crear proyectos).
- `ZEP_API_KEY` del proyecto INL cargada en env (ver `.env.example`).

Uso:
    python bootstrap_graphs.py --dry-run
    python bootstrap_graphs.py --apply
"""

from __future__ import annotations

import argparse
import sys
from typing import Any

from constants import GRAPH_IDS


GRAPH_DESCRIPTIONS: dict[str, str] = {
    "canonical": (
        "Grafo canonical del framework INL — Leyes, Patrones, Manifiestos, "
        "Teoria, Arquitectura Cognitiva, Reglas Editoriales, Fases PEAP, "
        "Conceptos canonicos, Artefactos. Velocidad de cambio: baja."
    ),
    "evidence": (
        "Grafo evidence del framework INL — Evidencia empirica, Avances, "
        "Traumas, Snapshots historicos, ADRs instanciados, Proyectos fuente. "
        "Velocidad de cambio: alta, evolutivo bitemporal."
    ),
}


def _graph_exists(client: Any, graph_id: str) -> bool:
    existing = {g.graph_id for g in client.graph.list_all()}
    return graph_id in existing


def _create_graph(client: Any, graph_id: str, description: str) -> None:
    """TODO(Fase 2): confirmar signature exacta de client.graph.create en zep-cloud SDK."""

    client.graph.create(
        graph_id=graph_id,
        name=graph_id,
        description=description,
    )


def bootstrap(dry_run: bool = True) -> None:
    """
    Crea los 2 grafos si no existen. Dry-run imprime lo que haria.
    """

    if dry_run:
        for kind, gid in GRAPH_IDS.items():
            print(f"[dry-run] graph.create(graph_id='{gid}')")
            print(f"           description: {GRAPH_DESCRIPTIONS[kind]}")
        return

    try:
        from zep_cloud.client import Zep
    except ImportError:
        print(
            "[error] zep-cloud SDK no instalado. `pip install zep-cloud`",
            file=sys.stderr,
        )
        sys.exit(1)

    import os

    api_key = os.getenv("ZEP_API_KEY")
    if not api_key:
        print("[error] ZEP_API_KEY no cargada en env.", file=sys.stderr)
        sys.exit(1)

    client = Zep(api_key=api_key)

    for kind, gid in GRAPH_IDS.items():
        if _graph_exists(client, gid):
            print(f"[skip] {gid} ya existe")
            continue
        print(f"[create] {gid}")
        _create_graph(client, gid, GRAPH_DESCRIPTIONS[kind])
        print(f"[create] ✓ {gid} creado")


def main() -> None:
    parser = argparse.ArgumentParser(description="Bootstrap de grafos Zep INL.")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--dry-run", action="store_true")
    mode.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    bootstrap(dry_run=args.dry_run)


if __name__ == "__main__":
    main()
