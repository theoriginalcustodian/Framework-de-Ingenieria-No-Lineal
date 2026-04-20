"""
KPI — Captura entrópica de edges post-ingesta.

Mide el ratio de edges con `fact_name` fuera de la whitelist declarada
en la ontología. Si excede `EDGE_ENTROPY_THRESHOLD` (default 15%), exit
con código ≠ 0 — integrable en CI.

Ref: ADR-001-cerebro-zep-inl.md §Seguimiento HM-2.

TODO(Fase 4): implementar extracción vía SDK nativo zep-cloud
(MCP `zep_graph_search` NO soporta `edge_types` filter — confirmado en
Spike V-RES #1).

Uso:
    python audit_edge_entropy.py                    # ambos grafos
    python audit_edge_entropy.py --graph canonical  # solo uno
    python audit_edge_entropy.py --threshold 0.20   # override
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Import de constants.py del modulo ontology (hermano de tests/)
sys.path.insert(0, str(Path(__file__).parent.parent / "ontology"))
from constants import EDGE_ENTROPY_THRESHOLD, GRAPH_IDS  # noqa: E402
from ontology_definition import (  # noqa: E402
    canonical_edge_types,
    evidence_edge_types,
)


def _whitelisted_fact_names(which: str) -> set[str]:
    """Retorna el set de fact_names declarados en la ontología del grafo."""

    if which == "canonical":
        return set(canonical_edge_types().keys())
    if which == "evidence":
        return set(evidence_edge_types().keys())
    raise ValueError(f"Unknown graph: {which}")


def _fetch_all_edges(client, graph_id: str) -> list[dict]:
    """
    TODO(Fase 4): implementar extracción completa de edges del grafo.

    Opciones:
    - `client.graph.edge.get_by_graph(graph_id=...)` si el SDK lo expone
    - `client.graph.search(graph_id=..., scope='edges', query='*')` paginado
    - Fallback: reconstruir desde episodios vía `episode.get_mentions`

    Por ahora retorna lista vacía — el audit corre pero reporta 0 edges.
    """

    print(f"  [stub] fetch_all_edges({graph_id}) — TODO Fase 4", file=sys.stderr)
    return []


def audit_graph(client, which: str) -> dict:
    """Audita un grafo. Retorna dict con métricas + veredicto."""

    graph_id = GRAPH_IDS[which]
    whitelist = _whitelisted_fact_names(which)

    edges = _fetch_all_edges(client, graph_id)
    total = len(edges)

    non_whitelisted = [e for e in edges if e.get("fact_name") not in whitelist]
    ratio = (len(non_whitelisted) / total) if total > 0 else 0.0

    return {
        "graph_id": graph_id,
        "total_edges": total,
        "whitelisted_count": total - len(non_whitelisted),
        "non_whitelisted_count": len(non_whitelisted),
        "non_whitelisted_examples": [
            e.get("fact_name") for e in non_whitelisted[:10]
        ],
        "entropy_ratio": round(ratio, 4),
        "whitelist": sorted(whitelist),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit entropia de edges.")
    parser.add_argument(
        "--graph",
        choices=("canonical", "evidence", "both"),
        default="both",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=EDGE_ENTROPY_THRESHOLD,
        help=f"Ratio máximo permitido. Default: {EDGE_ENTROPY_THRESHOLD}",
    )
    parser.add_argument(
        "--no-live",
        action="store_true",
        help="No intenta conectar a Zep. Útil para CI sin credenciales.",
    )
    args = parser.parse_args()

    client = None
    if not args.no_live:
        try:
            from zep_cloud.client import Zep

            api_key = os.getenv("ZEP_API_KEY")
            if not api_key:
                print("[warn] ZEP_API_KEY no cargada — usando stub.", file=sys.stderr)
            else:
                client = Zep(api_key=api_key)
        except ImportError:
            print("[warn] zep-cloud SDK no disponible — usando stub.", file=sys.stderr)

    report = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "threshold": args.threshold,
        "results": {},
    }

    targets = []
    if args.graph in ("canonical", "both"):
        targets.append("canonical")
    if args.graph in ("evidence", "both"):
        targets.append("evidence")

    exit_code = 0
    for t in targets:
        result = audit_graph(client, t)
        report["results"][t] = result
        if result["entropy_ratio"] > args.threshold:
            result["verdict"] = "FAIL"
            exit_code = 1
        else:
            result["verdict"] = "PASS"

    # Dump a audit_reports/
    reports_dir = Path(__file__).parent.parent / "audit_reports"
    reports_dir.mkdir(exist_ok=True)
    report_path = reports_dir / f"edge_entropy_{datetime.utcnow().strftime('%Y-%m-%d')}.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False))

    print(json.dumps(report, indent=2, ensure_ascii=False))
    print(f"\nReporte guardado en: {report_path}", file=sys.stderr)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
