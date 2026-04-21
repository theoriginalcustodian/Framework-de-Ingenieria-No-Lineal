/**
 * lib/zep_batching.js — Batching resiliente con asfixia controlada
 *
 * Módulo puro. Extraído y parametrizado desde ARCA `zep_daily_emitter.js`
 * y `zep_narrative_emitter.js` (constantes BATCH_SIZE=20, SLEEP_MS=1500).
 *
 * Encapsula 2 lecciones empíricas documentadas en
 * `docs/lecciones_heredadas_de_arca.md`:
 *   - L3: Batch size 20 + sleep 1500ms (calibrado contra rate limit ~600 RPM de Zep).
 *   - L4: Hard-stop on batch failure (NO auto-healing). Patrón DLQ —
 *         el operador investiga y re-corre.
 *
 * Alcance: ingesta PUNTUAL a UN solo grafo. Si el caller necesita multi-grafo
 * paralelo, debe envolver con `Promise.all([...])` externamente o agregar una
 * variante `batchIngestMulti` en este módulo.
 *
 * Uso típico:
 *
 *   const { batchIngest } = require('../lib/zep_batching');
 *   const result = await batchIngest({
 *     client,
 *     graphId: 'inl-framework-canonical',
 *     episodes: sortedEpisodes,
 *   });
 *   console.log(`${result.uuids.length} episodios inyectados, ${result.successBatches} lotes ok`);
 */

'use strict';

const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_SLEEP_MS = 1500;

/**
 * Duerme N milisegundos. Promise-based, compatible con await.
 */
function _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Ingesta episodios a un grafo Zep en lotes controlados.
 *
 * @param {Object} params
 * @param {Object} params.client              — Instancia de ZepClient (`new ZepClient({apiKey})`)
 * @param {string} params.graphId             — ID del grafo destino
 * @param {Array<Object>} params.episodes     — Array de episodios (`{type, data, createdAt, metadata?}`)
 * @param {number} [params.batchSize=20]      — Tamaño del lote
 * @param {number} [params.sleepMs=1500]      — Pausa entre lotes (ms)
 * @param {'hard-stop'|'log-continue'} [params.onError='hard-stop']
 *        — Comportamiento ante fallo de lote:
 *          - `hard-stop` (default): aborta, retorna resultado parcial con `failedBatch` poblado.
 *          - `log-continue`: loggea error y sigue con el siguiente lote.
 * @param {Object} [params.logger=console]    — Logger inyectable (debe tener `log` y `error`)
 * @returns {Promise<{
 *   successBatches: number,
 *   totalBatches: number,
 *   totalEpisodes: number,
 *   uuids: string[],
 *   failedBatch: { index: number, error: string } | null
 * }>}
 */
async function batchIngest({
    client,
    graphId,
    episodes,
    batchSize = DEFAULT_BATCH_SIZE,
    sleepMs = DEFAULT_SLEEP_MS,
    onError = 'hard-stop',
    logger = console,
}) {
    // ─── Validación de inputs ───────────────────────────────
    if (!client || typeof client.graph?.addBatch !== 'function') {
        throw new TypeError('batchIngest: `client` debe ser una instancia de ZepClient con graph.addBatch()');
    }
    if (typeof graphId !== 'string' || !graphId.trim()) {
        throw new TypeError('batchIngest: `graphId` debe ser un string no vacío');
    }
    if (!Array.isArray(episodes)) {
        throw new TypeError('batchIngest: `episodes` debe ser un array');
    }
    if (!Number.isInteger(batchSize) || batchSize <= 0) {
        throw new TypeError(`batchIngest: batchSize debe ser entero positivo, recibido: ${batchSize}`);
    }
    if (typeof sleepMs !== 'number' || sleepMs < 0) {
        throw new TypeError(`batchIngest: sleepMs debe ser número no-negativo, recibido: ${sleepMs}`);
    }
    if (onError !== 'hard-stop' && onError !== 'log-continue') {
        throw new TypeError(`batchIngest: onError debe ser 'hard-stop' o 'log-continue', recibido: ${onError}`);
    }

    const totalEpisodes = episodes.length;
    const totalBatches = Math.ceil(totalEpisodes / batchSize);
    const uuids = [];
    let successBatches = 0;
    let failedBatch = null;

    if (totalEpisodes === 0) {
        logger.log(`[zep_batching] 0 episodios a ingestar en ${graphId}. Noop.`);
        return { successBatches: 0, totalBatches: 0, totalEpisodes: 0, uuids: [], failedBatch: null };
    }

    logger.log(
        `[zep_batching] Ingesta a ${graphId}: ${totalEpisodes} episodios en ${totalBatches} lote(s) (batch=${batchSize}, sleep=${sleepMs}ms, onError=${onError})`
    );

    for (let i = 0; i < episodes.length; i += batchSize) {
        const batch = episodes.slice(i, i + batchSize);
        const batchIndex = Math.floor(i / batchSize) + 1;

        try {
            const res = await client.graph.addBatch({ graphId, episodes: batch });
            if (Array.isArray(res)) {
                for (const ep of res) {
                    if (ep && ep.uuid) uuids.push(ep.uuid);
                }
            }
            successBatches++;
            logger.log(
                `[zep_batching] Lote ${batchIndex}/${totalBatches} → ${batch.length} episodios OK`
            );
        } catch (e) {
            const errMsg = e && e.message ? e.message : String(e);
            logger.error(
                `[zep_batching] Lote ${batchIndex}/${totalBatches} FALLÓ: ${errMsg}`
            );
            failedBatch = { index: batchIndex, error: errMsg };

            if (onError === 'hard-stop') {
                logger.error(
                    `[zep_batching] Hard-stop activado. Abortando ingesta. ${successBatches}/${totalBatches} lotes exitosos antes del fallo.`
                );
                return { successBatches, totalBatches, totalEpisodes, uuids, failedBatch };
            }
            // log-continue: seguimos al próximo lote
        }

        // Sleep entre lotes (no después del último)
        if (i + batchSize < episodes.length && sleepMs > 0) {
            await _sleep(sleepMs);
        }
    }

    logger.log(
        `[zep_batching] Ingesta completa: ${successBatches}/${totalBatches} lotes OK, ${uuids.length} UUIDs recolectados`
    );
    return { successBatches, totalBatches, totalEpisodes, uuids, failedBatch };
}

module.exports = {
    batchIngest,
    DEFAULT_BATCH_SIZE,
    DEFAULT_SLEEP_MS,
};
