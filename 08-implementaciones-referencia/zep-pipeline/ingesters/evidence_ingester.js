#!/usr/bin/env node
/**
 * ingesters/evidence_ingester.js — Bootstrap del grafo evidence INL
 *
 * Ingesta puntual, corre UNA vez para sembrar `inl-framework-evidence` con:
 *   - Nodos estáticos: ProyectoFuente (INL-Meta-Repo, ARCA) + SnapshotHistorico
 *     inicial del día de ingesta.
 *   - Nodos desde filesystem: EvidenciaEmpirica (05-evidencia/), Avance
 *     (07-avances/), DecisionFundada tipo=adr (08-.../zep-pipeline/docs/adr-*.md)
 *   - Body episodes chunked con metadata bitemporal (fecha del frontmatter o
 *     body o mtime fallback — L9 catálogo).
 *   - Detección de códigos canonical `(F|O|R|C|A|G|AP|Dia)-\d+` en el body
 *     → persiste en metadata `canonical_refs_csv` para consulta posterior.
 *   - Edges estáticos intra-grafo (snapshot CAPTURA proyecto, etc.)
 *
 * Cross-graph resolution:
 *   NO se emiten edges cross-graph. Los códigos canonical extraídos del body
 *   viven como metadata. Un agente que consulte evidence puede hacer un 2º
 *   query a `inl-framework-canonical` usando esos códigos.
 *
 * Uso:
 *   node ingesters/evidence_ingester.js --dry-run
 *   node ingesters/evidence_ingester.js --apply
 */

'use strict';

const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { chunkDocument } = require('../lib/chunker');
const { parseFrontmatter } = require('../lib/frontmatter_parser');
const { sanitizeFrontmatterForZep, capMetadataKeys } = require('../lib/zep_metadata');
const { staticNodes, fileMappings, staticEdges, extractDateFromBody } = require('./evidence_source_map');

// ─── Config ─────────────────────────────────────────────────────────────────

const GRAPH_ID = 'inl-framework-evidence';
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const TIMEZONE_OFFSET = '-03:00';
const CAPS = { entity_name: 50, fact: 250, fact_name: 50 };
const ROOT_NODE_NAME = 'INL-Framework';
const UUID_MAP_PATH = path.resolve(__dirname, '..', 'audit_reports', 'evidence_uuid_map.json');
const ZEP_API_BASE = 'https://api.getzep.com/api/v2';
const CANONICAL_REGEX = /\b([FORCAG]|AP|Dia)-\d+\b/g;

// ─── HTTP helpers (SDK Node 2.22.0 no serializa graph_id) ──────────────────

async function addFactTripleHTTP(apiKey, graphId, triple) {
    const payload = {
        graph_id: graphId,
        fact: triple.fact,
        fact_name: triple.factName,
        target_node_name: triple.targetNodeName,
    };
    if (triple.sourceNodeName) payload.source_node_name = triple.sourceNodeName;
    if (triple.createdAt) payload.created_at = triple.createdAt;
    if (triple.validAt) payload.valid_at = triple.validAt;

    const res = await fetch(`${ZEP_API_BASE}/graph/add-fact-triple`, {
        method: 'POST',
        headers: {
            'Authorization': `Api-Key ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return await res.json();
}

async function addBatchHTTP(apiKey, graphId, episodes) {
    const payload = { graph_id: graphId, episodes };
    const res = await fetch(`${ZEP_API_BASE}/graph-batch`, {
        method: 'POST',
        headers: {
            'Authorization': `Api-Key ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return await res.json();
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function nowISOWithOffset() {
    return new Date().toISOString().replace('Z', TIMEZONE_OFFSET);
}

function mtimeISO(filePath) {
    return fs.statSync(filePath).mtime.toISOString().replace('Z', TIMEZONE_OFFSET);
}

function truncate(str, max) {
    if (typeof str !== 'string') return str;
    if (str.length <= max) return str;
    return str.slice(0, max - 1) + '…';
}

function enforceCaps({ sourceNodeName, targetNodeName, fact, factName }) {
    if (sourceNodeName && sourceNodeName.length > CAPS.entity_name)
        throw new Error(`source_node_name excede cap ${CAPS.entity_name}: "${sourceNodeName}"`);
    if (targetNodeName && targetNodeName.length > CAPS.entity_name)
        throw new Error(`target_node_name excede cap ${CAPS.entity_name}: "${targetNodeName}"`);
    if (fact && fact.length > CAPS.fact)
        throw new Error(`fact excede cap ${CAPS.fact}: "${fact.slice(0, 100)}..."`);
    if (factName && factName.length > CAPS.fact_name)
        throw new Error(`fact_name excede cap ${CAPS.fact_name}: "${factName}"`);
}

/**
 * Extrae referencias canonical del body (L11 del catálogo).
 * Retorna array deduplicado de códigos `F-1`, `C-3`, `AP-2`, etc.
 */
function extractCanonicalRefs(body) {
    if (!body) return [];
    const matches = body.matchAll(CANONICAL_REGEX);
    const set = new Set();
    for (const m of matches) set.add(m[0]);
    return [...set].sort();
}

/**
 * Glob que soporta paths anidados. Reconoce el último segmento con `*` como
 * el filtro de archivo, y todos los segmentos previos fijos como el directorio
 * a listar (no recursivo profundo — un nivel fijo + un filtro simple en el último).
 */
function expandGlob(pattern, rootDir) {
    const starIdx = pattern.indexOf('*');
    if (starIdx === -1) {
        const abs = path.join(rootDir, pattern);
        return fs.existsSync(abs) ? [pattern] : [];
    }
    const lastSlash = pattern.lastIndexOf('/');
    const dir = lastSlash > 0 ? pattern.slice(0, lastSlash) : '.';
    const basePattern = lastSlash > 0 ? pattern.slice(lastSlash + 1) : pattern;
    const absDir = path.join(rootDir, dir);
    if (!fs.existsSync(absDir) || !fs.statSync(absDir).isDirectory()) return [];

    const ext = basePattern.slice(basePattern.lastIndexOf('.'));
    const prefix = basePattern.startsWith('*') ? '' : basePattern.slice(0, basePattern.indexOf('*'));

    const results = [];
    for (const name of fs.readdirSync(absDir)) {
        const full = path.join(absDir, name);
        if (!fs.statSync(full).isFile()) continue;
        if (!name.endsWith(ext)) continue;
        if (prefix && !name.startsWith(prefix)) continue;
        results.push(`${dir}/${name}`);
    }
    return results;
}

/**
 * Parsea un archivo evidence del filesystem según su fileMapping.
 */
function parseEvidenceFile(relPath, mapping, absRoot) {
    const absPath = path.join(absRoot, relPath);
    if (!fs.existsSync(absPath)) return null;

    const content = fs.readFileSync(absPath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(content);
    const mtime = mtimeISO(absPath);

    const nodeProps = mapping.extractEntity(relPath, frontmatter, body || content, mtime);
    if (!nodeProps) return null;

    const canonicalRefs = extractCanonicalRefs(body || content);
    const bitemporalDate = nodeProps.fecha || nodeProps.fecha_observacion || nodeProps.fecha_snapshot || mtime;

    return {
        node: { entity_type: mapping.entity_type, ...nodeProps },
        body: body || content,
        frontmatter: frontmatter || {},
        filePath: relPath,
        mtime,
        bitemporalDate,
        canonicalRefs,
    };
}

// ─── Runner ─────────────────────────────────────────────────────────────────

async function run({ dryRun, apply }) {
    if (!dryRun && !apply) {
        console.error('❌ Usar --dry-run o --apply');
        process.exit(1);
    }

    const ingestedAt = nowISOWithOffset();
    console.log(`\n# evidence_ingester — modo=${dryRun ? 'DRY-RUN' : 'APPLY'} — ingestedAt=${ingestedAt}\n`);

    // ─── Fase A: descubrir archivos ────────────────────────────
    console.log('## Fase A — Descubrimiento de archivos evidence');
    const fileNodes = [];
    for (const mapping of fileMappings) {
        const files = expandGlob(mapping.glob, REPO_ROOT);
        console.log(`  - ${mapping.name} (${mapping.entity_type}): ${files.length} archivos matchean '${mapping.glob}'`);
        for (const rel of files) {
            const parsed = parseEvidenceFile(rel, mapping, REPO_ROOT);
            if (parsed) fileNodes.push(parsed);
        }
    }
    console.log(`  Total fileNodes descubiertos: ${fileNodes.length}`);

    // ─── Fase B: planificar triples ────────────────────────────
    console.log('\n## Fase B — Planificación de triples');
    const nodeTriples = [];

    // B.1 — static nodes
    for (const sn of staticNodes) {
        let summary;
        if (sn.entity_type === 'ProyectoFuente') {
            summary = `ProyectoFuente ${sn.entity_name}: ${sn.nombre_completo}. Stack: ${sn.stack_csv}. Activo: ${sn.activo}.`;
        } else if (sn.entity_type === 'SnapshotHistorico') {
            summary = `Snapshot ${sn.entity_name} — ${sn.fase_framework}. Iniciativa: ${sn.iniciativa_activa}.`;
        } else {
            summary = `${sn.entity_type} ${sn.entity_name}`;
        }
        nodeTriples.push({
            __kind: 'static_node',
            entity_type: sn.entity_type,
            entity_name: sn.entity_name,
            triple: {
                sourceNodeName: sn.entity_name,
                targetNodeName: ROOT_NODE_NAME,
                fact: truncate(summary, CAPS.fact),
                factName: 'IS_EVIDENCE_OF_FRAMEWORK',
                createdAt: ingestedAt,
                validAt: ingestedAt,
            },
        });
    }
    console.log(`  - Static node triples: ${staticNodes.length}`);

    // B.2 — file-discovered nodes
    for (const fn of fileNodes) {
        const code = fn.node.entity_name;
        let summary;
        if (fn.node.entity_type === 'EvidenciaEmpirica') {
            summary = `Evidencia ${code} (${fn.node.tipo}, ${fn.node.proyecto_ref}): ${fn.node.descripcion_corta}`;
        } else if (fn.node.entity_type === 'Avance') {
            summary = `Avance ${code} (${fn.node.categoria}): ${fn.node.titulo}`;
        } else if (fn.node.entity_type === 'DecisionFundada') {
            summary = `${code} [${fn.node.status}]: ${fn.node.titulo}`;
        } else {
            summary = `${fn.node.entity_type} ${code}`;
        }
        nodeTriples.push({
            __kind: 'file_node',
            entity_type: fn.node.entity_type,
            entity_name: code,
            source_path: fn.filePath,
            triple: {
                sourceNodeName: code,
                targetNodeName: ROOT_NODE_NAME,
                fact: truncate(summary, CAPS.fact),
                factName: 'IS_EVIDENCE_OF_FRAMEWORK',
                createdAt: fn.bitemporalDate,
                validAt: fn.bitemporalDate,
            },
        });
    }
    console.log(`  - File-discovered node triples: ${fileNodes.length}`);

    // B.3 — static edges
    const edgeTriples = staticEdges.map(e => ({
        __kind: 'static_edge',
        edge_type: e.edge_type,
        source: e.source,
        target: e.target,
        triple: {
            sourceNodeName: e.source,
            targetNodeName: e.target,
            fact: truncate(e.fact, CAPS.fact),
            factName: truncate(e.factName, CAPS.fact_name),
            createdAt: ingestedAt,
            validAt: ingestedAt,
        },
    }));
    console.log(`  - Static edge triples: ${staticEdges.length}`);

    // B.4 — edges GENERADO_EN dinámicos (Avance → ProyectoFuente)
    // y EMERGIO_EN (EvidenciaEmpirica → ProyectoFuente)
    const dynamicEdges = [];
    for (const fn of fileNodes) {
        if (fn.node.entity_type === 'Avance' && fn.node.proyecto_origen) {
            dynamicEdges.push({
                __kind: 'dynamic_edge',
                edge_type: 'GENERADO_EN',
                source: fn.node.entity_name,
                target: fn.node.proyecto_origen,
                triple: {
                    sourceNodeName: fn.node.entity_name,
                    targetNodeName: fn.node.proyecto_origen,
                    fact: truncate(`El avance "${fn.node.titulo}" fue generado en el contexto del proyecto ${fn.node.proyecto_origen} el ${fn.bitemporalDate.slice(0, 10)}.`, CAPS.fact),
                    factName: 'GENERADO_EN',
                    createdAt: fn.bitemporalDate,
                    validAt: fn.bitemporalDate,
                },
            });
        }
        if (fn.node.entity_type === 'EvidenciaEmpirica' && fn.node.proyecto_ref) {
            dynamicEdges.push({
                __kind: 'dynamic_edge',
                edge_type: 'EMERGIO_EN',
                source: fn.node.entity_name,
                target: fn.node.proyecto_ref,
                triple: {
                    sourceNodeName: fn.node.entity_name,
                    targetNodeName: fn.node.proyecto_ref,
                    fact: truncate(`La evidencia "${fn.node.descripcion_corta}" emergió en el proyecto ${fn.node.proyecto_ref} el ${fn.bitemporalDate.slice(0, 10)}.`, CAPS.fact),
                    factName: 'EMERGIO_EN',
                    createdAt: fn.bitemporalDate,
                    validAt: fn.bitemporalDate,
                },
            });
        }
    }
    console.log(`  - Dynamic edge triples: ${dynamicEdges.length}`);

    const allEdgeTriples = [...edgeTriples, ...dynamicEdges];
    const totalTriples = nodeTriples.length + allEdgeTriples.length;
    console.log(`  TOTAL triples: ${totalTriples}`);

    // B.5 — body episodes con canonical_refs_csv
    const bodyEpisodes = [];
    for (const fn of fileNodes) {
        const code = fn.node.entity_name;
        const refKey = fn.node.entity_type === 'Avance' ? 'avance_slug_ref'
            : fn.node.entity_type === 'EvidenciaEmpirica' ? 'evidencia_slug_ref'
            : 'decision_codigo_ref';

        let chunkIndex = 0;
        const chunks = [...chunkDocument(fn.body)];
        for (const chunk of chunks) {
            const frontmatterSanitized = sanitizeFrontmatterForZep(fn.frontmatter);
            // L11 — canonical refs van como metadata (no como edges cross-graph)
            const canonicalRefsCsv = fn.canonicalRefs.join(',');
            const metadata = capMetadataKeys({
                source: 'evidence_ingester',
                file: fn.filePath,
                document_type: fn.node.entity_type,
                [refKey]: code,
                chunk_index: chunkIndex,
                chunk_total: chunks.length,
                bitemporal_date: fn.bitemporalDate,
                canonical_refs_csv: canonicalRefsCsv,
                ingested_at: ingestedAt,
                ...frontmatterSanitized,
            });
            bodyEpisodes.push({
                type: 'text',
                data: `[${fn.node.entity_type}: ${code}]\n${chunk}`,
                createdAt: fn.bitemporalDate,
                metadata,
            });
            chunkIndex++;
        }
    }
    // L10 — sort cronológico pre-ingesta
    bodyEpisodes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    console.log(`  - Body episodes (ordenados): ${bodyEpisodes.length}`);

    // ─── Fase C — Validación de caps ───────────────────────────
    console.log('\n## Fase C — Validación de caps');
    let capViolations = 0;
    for (const nt of nodeTriples) {
        try { enforceCaps(nt.triple); } catch (e) { console.error(`  ❌ ${nt.entity_type} ${nt.entity_name}: ${e.message}`); capViolations++; }
    }
    for (const et of allEdgeTriples) {
        try { enforceCaps(et.triple); } catch (e) { console.error(`  ❌ edge ${et.edge_type}: ${e.message}`); capViolations++; }
    }
    if (capViolations > 0) {
        console.error(`\n❌ ${capViolations} violaciones de caps. Abortando.`);
        process.exit(2);
    }
    console.log('  OK todos los triples pasan caps');

    // ─── Muestra de canonical refs detectadas ────────────────
    console.log('\n## Fase C.1 — Referencias canonical detectadas en body');
    for (const fn of fileNodes) {
        if (fn.canonicalRefs.length > 0) {
            console.log(`  ${fn.filePath.padEnd(70)} → ${fn.canonicalRefs.join(', ')}`);
        }
    }

    // ─── DRY-RUN ───────────────────────────────────────────────
    if (dryRun) {
        console.log('\n## DRY-RUN — plan completo');
        console.log(`\nGRAPH_ID destino: ${GRAPH_ID}`);
        console.log(`\n### Primer node triple:`);
        console.log(JSON.stringify(nodeTriples[0], null, 2));
        console.log(`\n### Primer dynamic edge:`);
        if (dynamicEdges.length > 0) console.log(JSON.stringify(dynamicEdges[0], null, 2));
        console.log(`\n### Primer body episode:`);
        if (bodyEpisodes.length > 0) console.log(JSON.stringify({ ...bodyEpisodes[0], data: bodyEpisodes[0].data.slice(0, 200) + '...' }, null, 2));
        console.log(`\n### Resumen:`);
        console.log(`  - Node triples: ${nodeTriples.length}`);
        console.log(`  - Edge triples (static + dynamic): ${allEdgeTriples.length}`);
        console.log(`  - Body episodes: ${bodyEpisodes.length}`);
        console.log(`  - Batches: ~${Math.ceil(bodyEpisodes.length / 20)}`);
        console.log('\nOK DRY-RUN. Ejecutar: node evidence_ingester.js --apply');
        return;
    }

    // ─── APPLY ─────────────────────────────────────────────────
    const apiKey = process.env.ZEP_API_KEY;
    if (!apiKey) {
        console.error('❌ ZEP_API_KEY no cargada en .env');
        process.exit(3);
    }

    console.log(`\n## Fase D — Ejecución contra Zep (${GRAPH_ID})`);

    // D.1 — node triples
    console.log(`\n### D.1 — Emitir ${nodeTriples.length} node triples`);
    let nodeOk = 0, nodeFail = 0;
    const uuidMap = { ProyectoFuente: {}, EvidenciaEmpirica: {}, DecisionFundada: {}, Avance: {}, SnapshotHistorico: {}, edges: [] };
    for (let i = 0; i < nodeTriples.length; i++) {
        const nt = nodeTriples[i];
        try {
            const res = await addFactTripleHTTP(apiKey, GRAPH_ID, nt.triple);
            const src = res?.source_node || res?.sourceNode;
            if (src?.uuid) uuidMap[nt.entity_type][nt.entity_name] = src.uuid;
            nodeOk++;
            if ((i + 1) % 5 === 0 || i === nodeTriples.length - 1) {
                console.log(`  [${i + 1}/${nodeTriples.length}] ${nt.entity_type} ${nt.entity_name} OK`);
            }
        } catch (e) {
            nodeFail++;
            console.error(`  [${i + 1}/${nodeTriples.length}] ${nt.entity_type} ${nt.entity_name} FALLÓ: ${e.message}`);
            if (nodeFail >= 3) {
                console.error('\n❌ Hard-stop 3 fallos consecutivos.');
                process.exit(4);
            }
        }
        if ((i + 1) % 20 === 0) await new Promise(r => setTimeout(r, 1500));
    }
    console.log(`  OK ${nodeOk}/${nodeTriples.length} nodos`);

    // D.2 — edge triples
    console.log(`\n### D.2 — Emitir ${allEdgeTriples.length} edge triples`);
    let edgeOk = 0, edgeFail = 0;
    for (let i = 0; i < allEdgeTriples.length; i++) {
        const et = allEdgeTriples[i];
        try {
            const res = await addFactTripleHTTP(apiKey, GRAPH_ID, et.triple);
            const edge = res?.edge;
            if (edge?.uuid) {
                uuidMap.edges.push({
                    edge_type: et.edge_type,
                    source: et.source,
                    target: et.target,
                    uuid: edge.uuid,
                });
            }
            edgeOk++;
            if ((i + 1) % 5 === 0 || i === allEdgeTriples.length - 1) {
                console.log(`  [${i + 1}/${allEdgeTriples.length}] ${et.edge_type} ${et.source}→${et.target} OK`);
            }
        } catch (e) {
            edgeFail++;
            console.error(`  [${i + 1}/${allEdgeTriples.length}] FALLÓ: ${e.message}`);
        }
        if ((i + 1) % 10 === 0) await new Promise(r => setTimeout(r, 1500));
    }
    console.log(`  OK ${edgeOk}/${allEdgeTriples.length} edges`);

    // D.3 — body episodes
    console.log(`\n### D.3 — Emitir ${bodyEpisodes.length} body episodes`);
    if (bodyEpisodes.length > 0) {
        const BATCH = 20, SLEEP = 1500;
        const total = Math.ceil(bodyEpisodes.length / BATCH);
        let ok = 0;
        for (let i = 0; i < bodyEpisodes.length; i += BATCH) {
            const batch = bodyEpisodes.slice(i, i + BATCH).map(ep => ({
                data: ep.data, type: ep.type, created_at: ep.createdAt, metadata: ep.metadata,
            }));
            const n = Math.floor(i / BATCH) + 1;
            try {
                await addBatchHTTP(apiKey, GRAPH_ID, batch);
                ok++;
                console.log(`  [${n}/${total}] ${batch.length} episodios OK`);
            } catch (e) {
                console.error(`  [${n}/${total}] FALLÓ: ${e.message}`);
                break;
            }
            if (i + BATCH < bodyEpisodes.length) await new Promise(r => setTimeout(r, SLEEP));
        }
        console.log(`  OK ${ok}/${total} batches`);
    }

    // D.4 — persistir uuid map
    fs.mkdirSync(path.dirname(UUID_MAP_PATH), { recursive: true });
    fs.writeFileSync(UUID_MAP_PATH, JSON.stringify(uuidMap, null, 2), 'utf8');

    console.log(`\n# ✅ evidence_ingester COMPLETADO`);
    console.log(`   - Nodos: ${nodeOk}/${nodeTriples.length}`);
    console.log(`   - Edges: ${edgeOk}/${allEdgeTriples.length}`);
    console.log(`   - Body episodes: ${bodyEpisodes.length}`);
    console.log(`   - UUID map: ${UUID_MAP_PATH}\n`);
}

// ─── CLI ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
run({ dryRun: args.includes('--dry-run'), apply: args.includes('--apply') }).catch(err => {
    console.error('\n💥 Error fatal:', err.message);
    console.error(err.stack);
    process.exit(10);
});
