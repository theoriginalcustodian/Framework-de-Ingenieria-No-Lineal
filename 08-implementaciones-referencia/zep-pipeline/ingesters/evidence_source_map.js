/**
 * ingesters/evidence_source_map.js — Mapping declarativo para grafo evidence
 *
 * Tabla declarativa de fuentes evidence. Similar a canonical_source_map.js
 * pero apuntando al grafo `inl-framework-evidence` con 5 entity types
 * (ProyectoFuente, EvidenciaEmpirica, DecisionFundada, Avance, SnapshotHistorico)
 * y 6 edge types (RESPALDA, INVALIDA, EMERGIO_EN, GENERADO_EN, CAPTURA, REFERENCIA).
 *
 * Estructura:
 *   - `staticNodes[]`: ProyectoFuente declarativos + SnapshotHistorico inicial
 *     (el repo INL como proyecto fuente, ARCA como hermano, y un snapshot
 *     actual del momento de ingesta).
 *   - `fileMappings[]`: archivos `.md` que mapean a Avance/DecisionFundada/
 *     EvidenciaEmpirica según carpeta origen.
 *   - `staticEdges[]`: edges declarativos entre entidades evidence (ej.
 *     "Avance X GENERADO_EN Proyecto Y").
 *
 * Cross-graph a canonical:
 *   Los grafos standalone Zep son aislados — NO emitimos edges cruzando grafos.
 *   La resolución cross-graph se hace en tiempo de consulta vía el regex
 *   `(F|O|R|C|A|G|AP|Dia)-\d+` sobre el body de cada episodio evidence. El
 *   agente que consulta evidence puede hacer un 2º query a canonical con los
 *   códigos extraídos del body.
 */

'use strict';

const NOW_ISO = new Date().toISOString();
const TODAY = NOW_ISO.slice(0, 10); // YYYY-MM-DD

// ─── STATIC NODES — estructura fija del grafo evidence ─────────────────────

const staticNodes = [
    // ─── ProyectoFuente ─────────────────────────────────────────
    {
        entity_type: 'ProyectoFuente',
        entity_name: 'INL-Meta-Repo',
        nombre_completo: 'Repositorio Ingenieria No Lineal — meta-documentación viva del framework',
        repo_url: 'https://github.com/theoriginalcustodian/Framework-de-Ingenieria-No-Lineal',
        stack_csv: 'markdown,claude-code,zep-cloud,python,nodejs',
        fase_peap_actual: 'Fuera-del-ciclo',
        activo: true,
        fecha_alta: '2026-04-08',
        source_path: 'CONSTITUCION.md',
    },
    {
        entity_type: 'ProyectoFuente',
        entity_name: 'ARCA',
        nombre_completo: 'Suite de Automatización ARCA (proyecto fuente privado del operador)',
        repo_url: '',
        stack_csv: 'n8n,supabase,nextjs-14,typescript',
        fase_peap_actual: 'Fuera-del-ciclo',
        activo: true,
        fecha_alta: '2026-04-10',
        source_path: 'REGISTRO_TRAUMAS.md',
    },
    // ─── SnapshotHistorico — estado actual ──────────────────────
    {
        entity_type: 'SnapshotHistorico',
        entity_name: `snapshot/${TODAY}`,
        fecha_snapshot: NOW_ISO,
        fase_framework: 'V5-estable-con-cerebro-zep',
        iniciativa_activa: 'Sprint INL-ZepBrain Fase 3 (evidence ingester)',
        version_framework: 'V5.2',
        proyectos_activos_csv: 'INL-Meta-Repo,ARCA',
        pendiente_principal: 'Fase 4 — integración Claude Code (slash + skill de consulta)',
        ramas_csv: 'master,sprint-inl-zepbrain/fase-1-y-adr-002',
        source_path: 'SNAPSHOT_ESTADO.md',
    },
];

// ─── FILE MAPPINGS — archivos que se parsean del filesystem ────────────────

const fileMappings = [
    // ─── 05-evidencia/*.md → EvidenciaEmpirica ────────────────
    {
        name: 'evidencia',
        glob: '05-evidencia/*.md',
        entity_type: 'EvidenciaEmpirica',
        extractEntity: (filePath, frontmatter, bodyContent, mtime) => {
            const basename = filePath.split('/').pop().replace(/\.md$/, '');
            const slug = `INL-Meta-Repo/${basename}`.slice(0, 50);
            // Heurística de tipo: si el título/body contiene 'métrica'/'kpi'/'tabla' → metrica
            const blob = (frontmatter?.titulo || '') + ' ' + bodyContent.slice(0, 500);
            const tipo = /\b(kpi|m[eé]trica|tabla|datos|stats)\b/i.test(blob) ? 'metrica' : 'validacion';
            const fecha = frontmatter?.fecha || extractDateFromBody(bodyContent) || mtime;
            return {
                entity_name: slug,
                tipo,
                fecha_observacion: fecha,
                proyecto_ref: 'INL-Meta-Repo',
                descripcion_corta: truncate((frontmatter?.titulo || basename.replace(/-/g, ' ')), 250),
                metricas_csv: frontmatter?.metricas_csv || '',
                pr_incidente_ref: frontmatter?.pr_incidente_ref || '',
            };
        },
    },
    // ─── 07-avances/*.md → Avance ──────────────────────────────
    {
        name: 'avances',
        glob: '07-avances/*.md',
        entity_type: 'Avance',
        extractEntity: (filePath, frontmatter, bodyContent, mtime) => {
            const basename = filePath.split('/').pop().replace(/\.md$/, '');
            const slug = basename.slice(0, 50);
            const blob = (frontmatter?.categoria || frontmatter?.titulo || basename);
            const categoria = /\b(ideaci[oó]n|prospectivo|borrador)\b/i.test(blob)
                ? 'ideacion'
                : /\b(consolidac|cerrado|madur|consumible)\b/i.test(blob)
                ? 'consolidacion'
                : 'sprint';
            const fecha = frontmatter?.fecha || extractDateFromBody(bodyContent) || mtime;
            return {
                entity_name: slug,
                titulo: frontmatter?.titulo || basename.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                categoria,
                fecha,
                proyecto_origen: frontmatter?.proyecto_origen || 'INL-Meta-Repo',
                patrones_emergentes_csv: frontmatter?.patrones_csv || '',
            };
        },
    },
    // ─── zep-pipeline/docs/adr-*.md → DecisionFundada tipo=adr ─
    {
        name: 'adrs',
        glob: '08-implementaciones-referencia/zep-pipeline/docs/adr-*.md',
        entity_type: 'DecisionFundada',
        extractEntity: (filePath, frontmatter, bodyContent, mtime) => {
            // adr-001-cerebro-zep-inl.md → entity_name 'ADR-001'
            const basename = filePath.split('/').pop().replace(/\.md$/, '');
            const match = basename.match(/^adr-(\d+)-/i);
            if (!match) return null;
            const adrCode = `ADR-${match[1].padStart(3, '0')}`;
            const fecha = frontmatter?.fecha || extractDateFromBody(bodyContent) || mtime;
            // Extraer status del body (línea "**Status:**")
            const statusMatch = bodyContent.match(/\*\*Status:\*\*\s*([A-Z]+)/i);
            const rawStatus = statusMatch ? statusMatch[1].toLowerCase() : 'propuesta';
            const status = ['aceptada', 'superseded', 'rechazada', 'propuesta'].includes(rawStatus)
                ? rawStatus
                : rawStatus === 'aprobado'
                ? 'aceptada'
                : 'propuesta';
            return {
                entity_name: adrCode,
                tipo: 'adr',
                fecha,
                titulo: extractTitleFromBody(bodyContent, basename),
                autor: frontmatter?.autor || 'Arquitecto (CPU) + Unidad GPU',
                leyes_impactadas_csv: frontmatter?.leyes_csv || '',
                patrones_invocados_csv: frontmatter?.patrones_csv || '',
                status,
            };
        },
    },
];

// ─── STATIC EDGES — relaciones entre entidades evidence ────────────────────

const staticEdges = [
    // ARCA EMERGIO el Patrón C-3 Bidireccional (evidencia empírica)
    // → se ingesta como edge RESPALDA Evidencia → (código canonical en body)
    // Los edges reales declarados se agregan dinámicamente desde fileMappings.
    // Acá solo staticEdges entre nodos estáticos:
    {
        source: 'snapshot/' + TODAY,
        target: 'INL-Meta-Repo',
        edge_type: 'CAPTURA',
        factName: 'CAPTURA',
        fact: `El snapshot del ${TODAY} captura el estado del proyecto INL-Meta-Repo con sprint ZepBrain Fase 3 en curso.`,
        estado_en_snapshot: 'sprint-activo',
    },
    {
        source: 'snapshot/' + TODAY,
        target: 'ARCA',
        edge_type: 'CAPTURA',
        factName: 'CAPTURA',
        fact: `El snapshot del ${TODAY} captura también el estado del proyecto ARCA como proyecto fuente hermano del meta-repo.`,
        estado_en_snapshot: 'activo-externo',
    },
];

// ─── Helpers de extracción ─────────────────────────────────────────────────

function truncate(str, max) {
    if (typeof str !== 'string') return str;
    if (str.length <= max) return str;
    return str.slice(0, max - 1) + '…';
}

/**
 * Extrae primera fecha YYYY-MM-DD del body (regla L9 — prioridad 2 del catálogo).
 */
function extractDateFromBody(body) {
    if (!body || typeof body !== 'string') return null;
    // Prioridad: "Fecha: YYYY-MM-DD" → "**Fecha:** YYYY-MM-DD" → primera YYYY-MM-DD suelta
    const pats = [
        /(?:\*\*)?[Ff]echa(?:\*\*)?:\s*(\d{4}-\d{2}-\d{2})/,
        /\b(\d{4}-\d{2}-\d{2})\b/,
    ];
    for (const p of pats) {
        const m = body.match(p);
        if (m) return m[1] + 'T00:00:00.000-03:00';
    }
    return null;
}

/**
 * Extrae el título del ADR desde el primer `# Titulo` del body.
 */
function extractTitleFromBody(body, fallback) {
    const m = body.match(/^#\s+(.+)$/m);
    return m ? truncate(m[1].trim(), 200) : fallback;
}

module.exports = {
    staticNodes,
    fileMappings,
    staticEdges,
    extractDateFromBody,
    extractTitleFromBody,
};
