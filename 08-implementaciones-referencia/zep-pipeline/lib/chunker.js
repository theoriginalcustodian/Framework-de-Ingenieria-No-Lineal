/**
 * lib/chunker.js — Chunking Semántico Compartido
 *
 * Módulo único para todos los emitters Zep del sistema ARCA.
 * Usado por:
 *   - zep_daily_emitter.js      (ingesta periódica desde docs/ y Workflows/)
 *   - zep_narrative_emitter.js  (ingesta narrativa desde reportes)
 *   - zep_v7_afipsdk_ingest.js  (ingesta documentación oficial AfipSDK)
 *   - zep_pr_ingest.js          (ingesta body de PRs mergeados)
 *
 * Estrategia de chunking:
 *   1. Cortar por límites de párrafo (\n\n) — preserva coherencia semántica
 *   2. Si un párrafo excede chunkSize, delegar a subChunkByLines
 *   3. Overlap entre chunks calculado sobre límites de oración/línea,
 *      nunca en medio de palabras (ver bug-fix 2026-04-19)
 *
 * Parámetros calibrados según documentación oficial de Zep:
 *   chunkSize      : 500 chars  — granularidad óptima para grafos semánticos
 *   overlap        : 50 chars   — recomendación oficial (target aproximado)
 *   MAX_EPISODE    : 9500 chars — Zep hard-limit 10K, reservamos 500 para prefijo
 *
 * Ref: https://help.getzep.com/chunking-large-documents
 *
 * HISTORIAL DE FIXES:
 *   2026-04-19 (fix/zep-chunker-overlap-semantico):
 *     Bug detectado en PR #208 ingest: overlap con slice(-N) cortaba palabras
 *     a la mitad cuando el chunk no contenía \n en los últimos N chars.
 *     Ejemplo real: chunk empezó con "rante Paso 3 Zep..." (corte en "durante").
 *     Fix: calcular overlap sobre límites de oración/línea, nunca raw slice.
 */

'use strict';

const MAX_EPISODE_DATA = 9500; // Hard cap: Zep limit es 10K, reservamos 500 para prefijo de episodio

// Caracteres que marcan fin de oración (prioritarios para corte semántico)
// Se buscan de atrás hacia adelante en la ventana de overlap.
const SENTENCE_TERMINATORS = ['. ', '! ', '? ', '.\n', '!\n', '?\n', ':\n'];

/**
 * Calcula el texto de overlap respetando límites semánticos (oración o línea
 * completa), nunca cortando palabras a la mitad.
 *
 * Estrategia (en orden de preferencia):
 *   1. Buscar fin de oración (.!?:) en los últimos ~overlap*2 chars → usar desde ahí
 *   2. Si no hay fin de oración, buscar último \n → usar desde ahí
 *   3. Si no hay \n, buscar último espacio → usar desde ahí
 *   4. Si ninguno existe (edge extremo — texto sin espacios), retornar '' (sin overlap)
 *      para NO cortar palabra.
 *
 * @param {string} chunk - Chunk completo recién emitido
 * @param {number} overlap - Cantidad target de chars para overlap (aproximado)
 * @returns {string} Texto de overlap que empieza en límite semántico
 */
function computeSemanticOverlap(chunk, overlap) {
    if (overlap <= 0 || chunk.length <= overlap) return '';

    // Ventana de búsqueda: 2x el overlap target, para dar margen al buscar límite
    const windowStart = Math.max(0, chunk.length - overlap * 2);
    const window = chunk.slice(windowStart);

    // Estrategia 1: Fin de oración dentro de la ventana
    // Buscar DESDE la mitad de la ventana hacia adelante (preferir overlap cerca
    // del target, no demasiado corto).
    const idealOffset = window.length - overlap;
    let bestCut = -1;

    for (const terminator of SENTENCE_TERMINATORS) {
        let idx = window.indexOf(terminator);
        while (idx !== -1) {
            // Preferir cortes cercanos al idealOffset, pero cualquiera dentro de
            // [idealOffset-overlap/2, idealOffset+overlap/2] es aceptable.
            if (idx >= Math.max(0, idealOffset - overlap / 2) && idx <= idealOffset + overlap / 2) {
                // Cortar DESPUÉS del terminador (empezar en el nuevo enunciado)
                const cutPos = idx + terminator.length;
                if (cutPos < window.length && (bestCut === -1 || cutPos > bestCut)) {
                    bestCut = cutPos;
                }
            }
            idx = window.indexOf(terminator, idx + 1);
        }
    }
    if (bestCut !== -1) return window.slice(bestCut).trim();

    // Estrategia 2: Último \n en la ventana
    const lastNewline = window.lastIndexOf('\n');
    if (lastNewline !== -1 && lastNewline < window.length - 1) {
        return window.slice(lastNewline + 1).trim();
    }

    // Estrategia 3: Último espacio en la ventana (límite de palabra)
    const lastSpace = window.lastIndexOf(' ');
    if (lastSpace !== -1 && lastSpace < window.length - 1) {
        return window.slice(lastSpace + 1).trim();
    }

    // Estrategia 4: No hay límite semántico detectable → renunciar al overlap
    // antes que cortar palabra a la mitad. Prefer NO overlap over broken overlap.
    return '';
}

/**
 * Sub-chunking por líneas para párrafos que exceden chunkSize.
 * Fallback necesario porque diffs de Git y bloques de código no tienen
 * separadores \n\n, generando "párrafos" de cientos de líneas.
 *
 * @param {string} text
 * @param {number} chunkSize
 * @param {number} overlap
 * @yields {string}
 */
function* subChunkByLines(text, chunkSize = 500, overlap = 50) {
    const effectiveSize = Math.min(chunkSize, MAX_EPISODE_DATA);
    const lines = text.split('\n');
    let currentChunk = '';

    for (const line of lines) {
        if (currentChunk.length + line.length + 1 > effectiveSize) {
            if (currentChunk.length > 0) {
                yield currentChunk.trim();
                // Overlap semántico: buscar inicio de línea completa, nunca cortar mid-line
                const overlapText = computeSemanticOverlap(currentChunk, overlap);
                currentChunk = overlapText
                    ? overlapText + '\n' + line
                    : line;
            } else {
                // Línea individual más larga que el límite — truncar con safety
                yield line.slice(0, effectiveSize);
                currentChunk = '';
            }
        } else {
            currentChunk = currentChunk ? currentChunk + '\n' + line : line;
        }
    }

    if (currentChunk.trim().length > 0) yield currentChunk.trim();
}

/**
 * Chunking semántico por párrafos con overlap basado en límites de oración/línea.
 * Divide primero por \n\n (párrafos), luego agrupa hasta chunkSize.
 * Si un párrafo individual supera chunkSize, delega a subChunkByLines.
 *
 * El overlap NO corta palabras a la mitad — busca el último límite semántico
 * (fin de oración > fin de línea > fin de palabra) dentro de una ventana de
 * overlap*2 chars. Si no hay ningún límite, prefiere NO overlap antes que
 * corte incorrecto.
 *
 * @param {string} text
 * @param {number} chunkSize
 * @param {number} overlap
 * @yields {string}
 */
function* chunkDocument(text, chunkSize = 500, overlap = 50) {
    const cleaned = text.trim();
    if (!cleaned) return;

    const paragraphs = cleaned.split(/\n\n+/);
    let currentChunk = '';

    for (const paragraph of paragraphs) {
        const trimmed = paragraph.trim();
        if (!trimmed) continue;

        if (currentChunk.length + trimmed.length + 2 > chunkSize) {
            if (currentChunk.length > 0) {
                yield currentChunk.trim();

                // Overlap semántico: inicio de oración/línea, nunca mid-word
                const overlapText = computeSemanticOverlap(currentChunk, overlap);
                currentChunk = overlapText
                    ? overlapText + '\n\n' + trimmed
                    : trimmed;
            } else {
                // Párrafo individual mayor que chunkSize → sub-chunkear por líneas
                yield* subChunkByLines(trimmed, chunkSize, overlap);
                currentChunk = '';
            }

            // Si el overlap + párrafo ya supera el límite, sub-chunkear también
            if (currentChunk.length > chunkSize) {
                yield* subChunkByLines(currentChunk, chunkSize, overlap);
                currentChunk = '';
            }
        } else {
            currentChunk = currentChunk
                ? currentChunk + '\n\n' + trimmed
                : trimmed;
        }
    }

    if (currentChunk.trim().length > 0) yield currentChunk.trim();
}

module.exports = { chunkDocument, subChunkByLines, computeSemanticOverlap };
