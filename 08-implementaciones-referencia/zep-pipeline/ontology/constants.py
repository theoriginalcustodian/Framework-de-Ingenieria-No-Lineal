"""
Constantes parametrizadas del pipeline INL-ZepBrain.

Externaliza valores que antes vivirian hardcodeados en multiples ingesters,
aplicando Ley F-1 (Anti-Hardcoding) y Ley F-5 (Adaptadores Universales).

Cualquier ingester (canonical, evidence, delta, queries, audit) debe importar
desde aqui en lugar de redefinir strings/numeros localmente.

Referencia: ADR-001-cerebro-zep-inl.md, Decision G (proyecto Zep dedicado) +
Decision H (cross-graph por UUID via regex).
"""

from __future__ import annotations

import re
from typing import Final


# ---------------------------------------------------------------------------
# Graph IDs — Decision G (proyecto Zep dedicado `inl-framework`)
# ---------------------------------------------------------------------------

GRAPH_IDS: Final[dict[str, str]] = {
    "canonical": "inl-framework-canonical",
    "evidence": "inl-framework-evidence",
}


# ---------------------------------------------------------------------------
# Caps de la API Zep — validados empiricamente en Spike V-RES #2
# ---------------------------------------------------------------------------

CAPS: Final[dict[str, int]] = {
    "entity_name": 50,
    "fact": 250,
    "fact_name": 50,
    "metadata_keys": 10,
}


# ---------------------------------------------------------------------------
# Cross-graph resolution — Decision H + entrada REGISTRO_TRAUMAS 2026-04-20
# Regex universal del framework sobre naming canonico uniforme.
# ---------------------------------------------------------------------------

CANONICAL_REGEX_PATTERN: Final[str] = r"(F|O|R|C|A|G|AP|Dia)-\d+"
CANONICAL_REGEX: Final[re.Pattern[str]] = re.compile(CANONICAL_REGEX_PATTERN)


# ---------------------------------------------------------------------------
# Chunking — ingestion_policy.md §parametros
# ---------------------------------------------------------------------------

CHUNK_TARGET_CHARS: Final[int] = 500
CHUNK_MAX_CHARS: Final[int] = 750
CHUNK_MIN_CHARS: Final[int] = 150


# ---------------------------------------------------------------------------
# Bitemporal — R7 FIX, timezone explicito
# ---------------------------------------------------------------------------

TIMEZONE: Final[str] = "America/Argentina/Buenos_Aires"


# ---------------------------------------------------------------------------
# Audit thresholds — ADR-001 HM-2 (KPI captura entropica)
# ---------------------------------------------------------------------------

EDGE_ENTROPY_THRESHOLD: Final[float] = 0.15
