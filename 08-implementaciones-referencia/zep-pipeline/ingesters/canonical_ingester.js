#!/usr/bin/env node
/**
 * ingesters/canonical_ingester.js — Bootstrap del grafo canonical INL
 *
 * Ingesta puntual, corre UNA sola vez para sembrar el grafo
 * `inl-framework-canonical` con los nodos estáticos del framework (Leyes,
 * Anti-Patrones, Fases PEAP) + los nodos descubiertos del filesystem
 * (Patrones, Manifiestos, Teoría, Framework, Arquitectura Cognitiva) +
 * los edges declarativos entre ellos.
 *
 * Arquitectura (Decisión H del ADR-001 — Camino C):
 *   1. `addFactTriple` para crear nodos + edges declarativos (determinístico,
 *      sin extractor LLM inventando). Cada nodo canonical tiene entity_name
 *      puro (regex (F|O|R|C|A|G|AP|Dia)-\d+).
 *   2. `addBatch` con episodios `json` + metadata sanitizada para el body
 *      largo de patrones/manifiestos/teoría (chunks de prosa descriptiva).
 *   3. Emite `canonical_uuid_map.json` con UUIDs de nodos para Fase 3
 *      cross-graph resolution.
 *
 * Uso:
 *   node ingesters/canonical_ingester.js --dry-run   # lista lo que haría
 *   node ingesters/canonical_ingester.js --apply     # ejecuta contra Zep
 *
 * Requiere en `.env`: `ZEP_API_KEY` del proyecto Zep `inl-framework`.
 * Precondición: grafos creados (`bootstrap_graphs.py --apply`) + ontología
 * aplicada (`setup_ontology.py --apply`).
 *
 * Ref: zep-pipeline/docs/adr-001-cerebro-zep-inl.md (Decisión H — Camino C)
 * Ref: zep-pipeline/docs/adr-002-reutilizacion-scripts-arca.md (stack Node)
 * Ref: zep-pipeline/docs/lecciones_heredadas_de_arca.md (L1-L11)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { ZepClient } = require('@getzep/zep-cloud');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { chunkDocument } = require('../lib/chunker');
const { parseFrontmatter } = require('../lib/frontmatter_parser');
const { sanitizeFrontmatterForZep, capMetadataKeys } = require('../lib/zep_metadata');
const { batchIngest } = require('../lib/zep_batching');
const { staticNodes, fileMappings, staticEdges } = require('./canonical_source_map');

// ─── Config constantes ──────────────────────────────────────────────────────

const GRAPH_ID = 'inl-framework-canonical';
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const TIMEZONE_OFFSET = '-03:00'; // America/Argentina/Buenos_Aires
const CAPS = { entity_name: 50, fact: 250, fact_name: 50 };
// Nodo raíz canónico — todos los nodos del framework se vinculan a él con
// el edge DECLARES_SELF (porque Zep prohíbe source==target en addFactTriple).
const ROOT_NODE_NAME = 'INL-Framework';
const UUID_MAP_PATH = path.resolve(__dirname, '..', 'audit_reports', 'canonical_uuid_map.json');
const ZEP_API_BASE = 'https://api.getzep.com/api/v2';

/**
 * addFactTriple via HTTP directo.
 * Workaround: el SDK Node 2.22.0 no serializa `graph_id` — solo `group_id`/`user_id`.
 * La API backend SÍ acepta `graph_id` para standalone graphs. Hacemos POST directo
 * con el payload correcto en snake_case (el wire format real de la API).
 */
async function addBatchHTTP(apiKey, graphId, episodes) {
    const payload = { graph_id: graphId, episodes };
    // Endpoint oficial: POST /graph-batch (NO /graph/add-batch)
    const res = await fetch(`${ZEP_API_BASE}/graph-batch`, {
        method: 'POST',
        headers: {
            'Authorization': `Api-Key ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`HTTP ${res.status}: ${errBody}`);
    }
    return await res.json();
}

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
    if (triple.expiredAt) payload.expired_at = triple.expiredAt;
    if (triple.invalidAt) payload.invalid_at = triple.invalidAt;

    const res = await fetch(`${ZEP_API_BASE}/graph/add-fact-triple`, {
        method: 'POST',
        headers: {
            'Authorization': `Api-Key ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`HTTP ${res.status}: ${errBody}`);
    }
    return await res.json();
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function nowISOWithOffset() {
    const now = new Date();
    return now.toISOString().replace('Z', TIMEZONE_OFFSET);
}

function mtimeISO(filePath) {
    return fs.statSync(filePath).mtime.toISOString().replace('Z', TIMEZONE_OFFSET);
}

function truncate(str, max) {
    if (typeof str !== 'string') return str;
    if (str.length <= max) return str;
    return str.slice(0, max - 1) + '…';
}

/**
 * Valida caps Zep antes de enviar — tira error explícito si se excede.
 * Los caps vienen validados por Spike V-RES #2 del sprint.
 */
function enforceCaps({ sourceNodeName, targetNodeName, fact, factName }) {
    if (sourceNodeName && sourceNodeName.length > CAPS.entity_name) {
        throw new Error(`source_node_name excede cap ${CAPS.entity_name}: "${sourceNodeName}"`);
    }
    if (targetNodeName && targetNodeName.length > CAPS.entity_name) {
        throw new Error(`target_node_name excede cap ${CAPS.entity_name}: "${targetNodeName}"`);
    }
    if (fact && fact.length > CAPS.fact) {
        throw new Error(`fact excede cap ${CAPS.fact}: "${fact.slice(0, 100)}..."`);
    }
    if (factName && factName.length > CAPS.fact_name) {
        throw new Error(`fact_name excede cap ${CAPS.fact_name}: "${factName}"`);
    }
}

/**
 * Glob simple sin dependency: listar archivos que matchean el pattern de carpeta.
 * Acepta `<dir>/*.md` o `<dir>/**\/*.md`.
 */
function expandGlob(pattern, rootDir) {
    const starIdx = pattern.indexOf('*');
    if (starIdx === -1) {
        const abs = path.join(rootDir, pattern);
        return fs.existsSync(abs) ? [pattern] : [];
    }
    const dir = pattern.slice(0, starIdx).replace(/\/$/, '');
    const absDir = path.join(rootDir, dir);
    if (!fs.existsSync(absDir) || !fs.statSync(absDir).isDirectory()) return [];

    const recursive = pattern.includes('**');
    const ext = pattern.slice(pattern.lastIndexOf('.'));

    const results = [];
    const walk = (current, relPrefix) => {
        for (const name of fs.readdirSync(current)) {
            const full = path.join(current, name);
            const rel = relPrefix ? `${relPrefix}/${name}` : name;
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
                if (recursive) walk(full, rel);
            } else if (stat.isFile() && name.endsWith(ext)) {
                results.push(`${dir}/${rel}`);
            }
        }
    };
    walk(absDir, '');
    return results;
}

// ─── Builders ──────────────────────────────────────────────────────────────

/**
 * Construye los fact_triples de auto-declaración de un nodo estático.
 * Estrategia: cada nodo se auto-declara vía un edge SELF-referential con
 * factName `DECLARES_SELF`, donde source = target = entity_name. Esto crea
 * el nodo + un edge descriptivo que persiste los props como fact legible.
 *
 * Alternativa considerada (descartada): usar addBatch con json. El problema es
 * que el extractor LLM (aunque con ontología aplicada) podría generar nombre
 * diferente al que queremos — Spike V-RES #1 validó esto. addFactTriple con
 * entity_name exacto es determinístico.
 */
function buildStaticNodeTriples(node, ingestedAt) {
    const code = node.entity_name;
    const type = node.entity_type;

    // Resumen legible del nodo para el `fact` del self-edge
    let summary;
    if (type === 'Ley') {
        summary = `Ley ${code} (${node.categoria}): ${node.titulo}`;
    } else if (type === 'AntiPatron') {
        summary = `AntiPatron ${code}: ${node.nombre}. Señal: ${node.senal_deteccion}`;
    } else if (type === 'FasePEAP') {
        summary = `Fase ${code}: ${node.nombre}. Salida: ${node.condicion_salida}`;
    } else {
        summary = `${type} ${code}`;
    }
    const fact = truncate(summary, CAPS.fact);

    return {
        sourceNodeName: code,
        targetNodeName: ROOT_NODE_NAME,
        fact,
        factName: 'IS_PART_OF_FRAMEWORK',
        createdAt: ingestedAt,
        validAt: ingestedAt,
    };
}

/**
 * Construye el triple para un edge estático declarativo (Ley-PROHIBE-AP, etc.)
 */
function buildStaticEdgeTriple(edge, createdAt) {
    return {
        sourceNodeName: edge.source,
        targetNodeName: edge.target,
        fact: truncate(edge.fact, CAPS.fact),
        factName: truncate(edge.factName, CAPS.fact_name),
        createdAt,
        validAt: createdAt,
    };
}

/**
 * Parsea un archivo canonical del filesystem según su fileMapping.
 * Retorna `{ node, body, frontmatter, filePath, mtime }` o `null` si skip.
 */
function parseCanonicalFile(relPath, mapping, absRoot) {
    const absPath = path.join(absRoot, relPath);
    if (!fs.existsSync(absPath)) return null;

    const basename = path.basename(relPath);
    if (mapping.skipFiles && mapping.skipFiles.some(rx => rx.test(basename))) {
        return null;
    }

    const content = fs.readFileSync(absPath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(content);

    const nodeProps = mapping.extractEntity(relPath, frontmatter);
    if (!nodeProps) return null;

    return {
        node: { entity_type: mapping.entity_type, ...nodeProps },
        body: body || content,
        frontmatter: frontmatter || {},
        filePath: relPath,
        mtime: mtimeISO(absPath),
    };
}

// ─── Runner ────────────────────────────────────────────────────────────────

async function run({ dryRun, apply }) {
    if (!dryRun && !apply) {
        console.error('❌ Usar --dry-run o --apply');
        process.exit(1);
    }

    const ingestedAt = nowISOWithOffset();
    console.log(`\n# canonical_ingester — modo=${dryRun ? 'DRY-RUN' : 'APPLY'} — ingestedAt=${ingestedAt}\n`);

    // ─── Fase A: descubrir archivos del filesystem ──────────────
    console.log('## Fase A — Descubrimiento de archivos canonical');
    const fileNodes = [];
    for (const mapping of fileMappings) {
        const files = expandGlob(mapping.glob, REPO_ROOT);
        console.log(`  - ${mapping.name} (${mapping.entity_type}): ${files.length} archivos matchean '${mapping.glob}'`);
        for (const rel of files) {
            const parsed = parseCanonicalFile(rel, mapping, REPO_ROOT);
            if (parsed) fileNodes.push(parsed);
        }
    }
    console.log(`  Total fileNodes descubiertos: ${fileNodes.length}`);

    // ─── Fase B: planificar triples a emitir ────────────────────
    console.log('\n## Fase B — Planificación de triples');
    const nodeTriples = [];

    // B.1 — static nodes (self-declarative triples)
    for (const sn of staticNodes) {
        nodeTriples.push({
            __kind: 'static_node',
            entity_type: sn.entity_type,
            entity_name: sn.entity_name,
            triple: buildStaticNodeTriples(sn, ingestedAt),
        });
    }
    console.log(`  - Static node triples: ${staticNodes.length}`);

    // B.2 — file-discovered nodes (self-declarative triples)
    for (const fn of fileNodes) {
        const code = fn.node.entity_name;
        let summary;
        if (fn.node.entity_type === 'Patron') {
            summary = `Patron ${code} (${fn.node.familia}): ${fn.node.nombre}. Estado: ${fn.node.estado}`;
        } else {
            summary = `${fn.node.kind || 'ConceptoCanonico'}: ${fn.node.nombre}`;
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
                factName: 'IS_PART_OF_FRAMEWORK',
                createdAt: fn.mtime,
                validAt: fn.mtime,
            },
        });
    }
    console.log(`  - File-discovered node triples: ${fileNodes.length}`);

    // B.3 — static edges (declarative relationships)
    const edgeTriples = staticEdges.map(e => ({
        __kind: 'static_edge',
        edge_type: e.edge_type,
        source: e.source,
        target: e.target,
        triple: buildStaticEdgeTriple(e, ingestedAt),
    }));
    console.log(`  - Static edge triples: ${staticEdges.length}`);

    const totalTriples = nodeTriples.length + edgeTriples.length;
    console.log(`  TOTAL triples: ${totalTriples}`);

    // B.4 — episodes de body (json para ConceptoCanonico/Patron con prosa)
    const bodyEpisodes = [];
    for (const fn of fileNodes) {
        const code = fn.node.entity_name;
        const refKey = fn.node.entity_type === 'Patron' ? 'patron_codigo_ref' : 'concepto_slug_ref';
        let chunkIndex = 0;
        const chunks = [...chunkDocument(fn.body)];
        for (const chunk of chunks) {
            const frontmatterSanitized = sanitizeFrontmatterForZep(fn.frontmatter);
            const metadata = capMetadataKeys({
                source: 'canonical_ingester',
                file: fn.filePath,
                document_type: fn.node.entity_type,
                [refKey]: code,
                chunk_index: chunkIndex,
                chunk_total: chunks.length,
                ingested_at: ingestedAt,
                ...frontmatterSanitized,
            });
            bodyEpisodes.push({
                type: 'text',
                data: `[${fn.node.entity_type}: ${code}]\n${chunk}`,
                createdAt: fn.mtime,
                metadata,
            });
            chunkIndex++;
        }
    }
    console.log(`  - Body episodes: ${bodyEpisodes.length}`);

    // ─── Validación de caps ─────────────────────────────────────
    console.log('\n## Fase C — Validación de caps');
    let capViolations = 0;
    for (const nt of nodeTriples) {
        try { enforceCaps(nt.triple); }
        catch (e) { console.error(`  ❌ ${nt.entity_type} ${nt.entity_name}: ${e.message}`); capViolations++; }
    }
    for (const et of edgeTriples) {
        try { enforceCaps(et.triple); }
        catch (e) { console.error(`  ❌ edge ${et.edge_type} ${et.source}→${et.target}: ${e.message}`); capViolations++; }
    }
    if (capViolations > 0) {
        console.error(`\n❌ ${capViolations} violaciones de caps. Abortando.`);
        process.exit(2);
    }
    console.log('  ✓ Todos los triples pasan caps');

    // ─── DRY-RUN: imprimir plan y salir ─────────────────────────
    if (dryRun) {
        console.log('\n## DRY-RUN — Plan completo (no se ejecuta contra Zep)');
        console.log(`\nGRAPH_ID destino: ${GRAPH_ID}`);
        console.log(`\n### Muestra primeros 3 node triples:`);
        nodeTriples.slice(0, 3).forEach(nt => {
            console.log(JSON.stringify({ kind: nt.__kind, entity_type: nt.entity_type, triple: nt.triple }, null, 2));
        });
        console.log(`\n### Muestra primeros 3 edge triples:`);
        edgeTriples.slice(0, 3).forEach(et => {
            console.log(JSON.stringify({ kind: et.__kind, edge_type: et.edge_type, triple: et.triple }, null, 2));
        });
        console.log(`\n### Resumen:`);
        console.log(`  - Node triples (self-declarative): ${nodeTriples.length}`);
        console.log(`  - Edge triples (relacionales): ${edgeTriples.length}`);
        console.log(`  - Body episodes (chunks prosa): ${bodyEpisodes.length}`);
        console.log(`  - TOTAL ops contra Zep: ${totalTriples + Math.ceil(bodyEpisodes.length / 20)} (${totalTriples} triples + ~${Math.ceil(bodyEpisodes.length / 20)} batches)`);
        console.log('\n✓ DRY-RUN OK. Para ejecutar: node canonical_ingester.js --apply');
        return;
    }

    // ─── APPLY: ejecutar contra Zep ─────────────────────────────
    const apiKey = process.env.ZEP_API_KEY;
    if (!apiKey) {
        console.error('❌ ZEP_API_KEY no cargada. Configurar en .env');
        process.exit(3);
    }
    const client = new ZepClient({ apiKey });

    console.log(`\n## Fase D — Ejecución contra Zep (${GRAPH_ID})`);

    // D.1 — Emitir node triples (crea los nodos)
    console.log(`\n### D.1 — Emitir ${nodeTriples.length} node triples (self-declarative)`);
    const uuidMap = {
        Ley: {}, Patron: {}, AntiPatron: {}, FasePEAP: {}, ConceptoCanonico: {},
        edges: [],
    };
    let nodeOk = 0, nodeFail = 0;
    for (let i = 0; i < nodeTriples.length; i++) {
        const nt = nodeTriples[i];
        try {
            const res = await addFactTripleHTTP(apiKey, GRAPH_ID, nt.triple);
            // API responde con snake_case: source_node, target_node, edge, task_id
            const srcNode = res?.source_node || res?.sourceNode;
            if (srcNode?.uuid) {
                uuidMap[nt.entity_type][nt.entity_name] = srcNode.uuid;
            }
            nodeOk++;
            if ((i + 1) % 10 === 0 || i === nodeTriples.length - 1) {
                console.log(`  [${i + 1}/${nodeTriples.length}] ${nt.entity_type} ${nt.entity_name} → OK`);
            }
        } catch (e) {
            nodeFail++;
            console.error(`  [${i + 1}/${nodeTriples.length}] ${nt.entity_type} ${nt.entity_name} → FALLÓ: ${e.message}`);
            if (nodeFail >= 3) {
                console.error('\n❌ Hard-stop: 3+ fallos consecutivos en nodos. Abortando.');
                process.exit(4);
            }
        }
        // anti-rate-limit soft
        if ((i + 1) % 20 === 0) await new Promise(r => setTimeout(r, 1500));
    }
    console.log(`  ✓ ${nodeOk} nodos ok, ${nodeFail} fallos`);

    // D.2 — Emitir edge triples
    console.log(`\n### D.2 — Emitir ${edgeTriples.length} edge triples`);
    let edgeOk = 0, edgeFail = 0;
    for (let i = 0; i < edgeTriples.length; i++) {
        const et = edgeTriples[i];
        try {
            const res = await addFactTripleHTTP(apiKey, GRAPH_ID, et.triple);
            const edgeObj = res?.edge;
            if (edgeObj?.uuid) {
                uuidMap.edges.push({
                    edge_type: et.edge_type,
                    source: et.source,
                    target: et.target,
                    uuid: edgeObj.uuid,
                });
            }
            edgeOk++;
            if ((i + 1) % 5 === 0 || i === edgeTriples.length - 1) {
                console.log(`  [${i + 1}/${edgeTriples.length}] ${et.edge_type} ${et.source}→${et.target} → OK`);
            }
        } catch (e) {
            edgeFail++;
            console.error(`  [${i + 1}/${edgeTriples.length}] ${et.edge_type} ${et.source}→${et.target} → FALLÓ: ${e.message}`);
        }
        if ((i + 1) % 10 === 0) await new Promise(r => setTimeout(r, 1500));
    }
    console.log(`  ✓ ${edgeOk} edges ok, ${edgeFail} fallos`);

    // D.3 — Emitir body episodes (HTTP directo: el SDK 2.22 no serializa graph_id)
    console.log(`\n### D.3 — Emitir ${bodyEpisodes.length} body episodes (chunks de prosa)`);
    if (bodyEpisodes.length > 0) {
        bodyEpisodes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const BATCH_SIZE = 20;
        const SLEEP_MS = 1500;
        const totalBatches = Math.ceil(bodyEpisodes.length / BATCH_SIZE);
        let successBatches = 0;
        for (let i = 0; i < bodyEpisodes.length; i += BATCH_SIZE) {
            const batch = bodyEpisodes.slice(i, i + BATCH_SIZE);
            // El wire format de addBatch espera episodios con snake_case fields
            const wireBatch = batch.map(ep => ({
                data: ep.data,
                type: ep.type,
                created_at: ep.createdAt,
                metadata: ep.metadata,
            }));
            const batchIndex = Math.floor(i / BATCH_SIZE) + 1;
            try {
                await addBatchHTTP(apiKey, GRAPH_ID, wireBatch);
                successBatches++;
                console.log(`  [${batchIndex}/${totalBatches}] ${batch.length} episodios OK`);
            } catch (e) {
                console.error(`  [${batchIndex}/${totalBatches}] FALLÓ: ${e.message}`);
                console.error('  Hard-stop. Abortando ingesta de body episodes.');
                break;
            }
            if (i + BATCH_SIZE < bodyEpisodes.length) {
                await new Promise(r => setTimeout(r, SLEEP_MS));
            }
        }
        console.log(`  OK ${successBatches}/${totalBatches} batches`);
    }

    // D.4 — Persistir canonical_uuid_map.json
    console.log(`\n### D.4 — Persistir canonical_uuid_map.json`);
    fs.mkdirSync(path.dirname(UUID_MAP_PATH), { recursive: true });
    fs.writeFileSync(UUID_MAP_PATH, JSON.stringify(uuidMap, null, 2), 'utf8');
    const totalUuids = Object.values(uuidMap).reduce((acc, v) => acc + (Array.isArray(v) ? v.length : Object.keys(v).length), 0);
    console.log(`  ✓ ${UUID_MAP_PATH} con ${totalUuids} UUIDs`);

    console.log(`\n# ✅ canonical_ingester COMPLETADO`);
    console.log(`   - Nodos: ${nodeOk}/${nodeTriples.length}`);
    console.log(`   - Edges: ${edgeOk}/${edgeTriples.length}`);
    console.log(`   - Body episodes: ${bodyEpisodes.length}`);
    console.log(`   - UUID map: ${UUID_MAP_PATH}\n`);
}

// ─── CLI ───────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const apply = args.includes('--apply');

run({ dryRun, apply }).catch(err => {
    console.error('\n💥 Error fatal:', err.message);
    console.error(err.stack);
    process.exit(10);
});
