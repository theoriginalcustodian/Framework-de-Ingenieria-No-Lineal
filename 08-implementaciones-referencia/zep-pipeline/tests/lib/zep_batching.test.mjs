/**
 * Tests para lib/zep_batching.js
 *
 * Cubren las lecciones L3 (batch 20+sleep 1500ms) y L4 (hard-stop on failure)
 * documentadas en `docs/lecciones_heredadas_de_arca.md`.
 *
 * Los tests usan mock ZepClient (sin red real) + logger custom para no
 * ensuciar stdout.
 *
 * Correr con: `npm test` desde zep-pipeline/
 */

import { describe, it, expect, vi } from 'vitest';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const {
    batchIngest,
    DEFAULT_BATCH_SIZE,
    DEFAULT_SLEEP_MS,
} = require('../../lib/zep_batching');

// ─── Helpers ────────────────────────────────────────────────────

function makeClient({ failOnBatch = null, uuidPrefix = 'uuid' } = {}) {
    let callCount = 0;
    const client = {
        graph: {
            addBatch: vi.fn(async ({ graphId, episodes }) => {
                callCount++;
                if (failOnBatch !== null && callCount === failOnBatch) {
                    throw new Error(`mock: fallo programado en batch ${failOnBatch}`);
                }
                return episodes.map((_, i) => ({ uuid: `${uuidPrefix}-${callCount}-${i}` }));
            }),
        },
    };
    return client;
}

function silentLogger() {
    return { log: vi.fn(), error: vi.fn() };
}

function makeEpisodes(n) {
    return Array.from({ length: n }, (_, i) => ({
        type: 'text',
        data: `episodio ${i}`,
        createdAt: new Date(2026, 3, 20, 0, 0, i).toISOString(),
    }));
}

// ─── Defaults expuestos ─────────────────────────────────────────

describe('constantes exportadas', () => {
    it('DEFAULT_BATCH_SIZE = 20', () => {
        expect(DEFAULT_BATCH_SIZE).toBe(20);
    });
    it('DEFAULT_SLEEP_MS = 1500', () => {
        expect(DEFAULT_SLEEP_MS).toBe(1500);
    });
});

// ─── Validación de inputs ───────────────────────────────────────

describe('batchIngest — validación de inputs', () => {
    const validClient = makeClient();

    it('throws si client no tiene graph.addBatch', async () => {
        await expect(
            batchIngest({ client: {}, graphId: 'g', episodes: [] })
        ).rejects.toThrow(TypeError);
    });

    it('throws si graphId no es string no-vacío', async () => {
        await expect(
            batchIngest({ client: validClient, graphId: '', episodes: [] })
        ).rejects.toThrow(TypeError);
        await expect(
            batchIngest({ client: validClient, graphId: null, episodes: [] })
        ).rejects.toThrow(TypeError);
    });

    it('throws si episodes no es array', async () => {
        await expect(
            batchIngest({ client: validClient, graphId: 'g', episodes: 'foo' })
        ).rejects.toThrow(TypeError);
    });

    it('throws si batchSize no es entero positivo', async () => {
        await expect(
            batchIngest({ client: validClient, graphId: 'g', episodes: [], batchSize: 0 })
        ).rejects.toThrow(TypeError);
        await expect(
            batchIngest({ client: validClient, graphId: 'g', episodes: [], batchSize: 1.5 })
        ).rejects.toThrow(TypeError);
    });

    it('throws si sleepMs es negativo', async () => {
        await expect(
            batchIngest({ client: validClient, graphId: 'g', episodes: [], sleepMs: -1 })
        ).rejects.toThrow(TypeError);
    });

    it('throws si onError es inválido', async () => {
        await expect(
            batchIngest({ client: validClient, graphId: 'g', episodes: [], onError: 'retry' })
        ).rejects.toThrow(TypeError);
    });
});

// ─── Casos happy path ───────────────────────────────────────────

describe('batchIngest — casos exitosos', () => {
    it('noop con 0 episodios', async () => {
        const client = makeClient();
        const logger = silentLogger();
        const result = await batchIngest({
            client,
            graphId: 'g',
            episodes: [],
            logger,
        });
        expect(result).toEqual({
            successBatches: 0,
            totalBatches: 0,
            totalEpisodes: 0,
            uuids: [],
            failedBatch: null,
        });
        expect(client.graph.addBatch).not.toHaveBeenCalled();
    });

    it('un solo lote cuando episodes ≤ batchSize', async () => {
        const client = makeClient();
        const logger = silentLogger();
        const episodes = makeEpisodes(5);
        const result = await batchIngest({
            client,
            graphId: 'inl-framework-canonical',
            episodes,
            batchSize: 20,
            sleepMs: 0,
            logger,
        });
        expect(client.graph.addBatch).toHaveBeenCalledTimes(1);
        expect(result.successBatches).toBe(1);
        expect(result.totalBatches).toBe(1);
        expect(result.totalEpisodes).toBe(5);
        expect(result.uuids.length).toBe(5);
        expect(result.failedBatch).toBeNull();
    });

    it('múltiples lotes con batching correcto', async () => {
        const client = makeClient();
        const logger = silentLogger();
        const episodes = makeEpisodes(25); // 25 = 2 lotes (20 + 5)
        const result = await batchIngest({
            client,
            graphId: 'g',
            episodes,
            batchSize: 20,
            sleepMs: 0,
            logger,
        });
        expect(client.graph.addBatch).toHaveBeenCalledTimes(2);
        expect(result.successBatches).toBe(2);
        expect(result.totalBatches).toBe(2);
        expect(result.uuids.length).toBe(25);

        // Verificar tamaños de cada lote
        const call1 = client.graph.addBatch.mock.calls[0][0];
        const call2 = client.graph.addBatch.mock.calls[1][0];
        expect(call1.episodes.length).toBe(20);
        expect(call2.episodes.length).toBe(5);
    });

    it('pasa graphId correcto a cada llamada', async () => {
        const client = makeClient();
        const logger = silentLogger();
        await batchIngest({
            client,
            graphId: 'inl-framework-evidence',
            episodes: makeEpisodes(3),
            batchSize: 2,
            sleepMs: 0,
            logger,
        });
        for (const call of client.graph.addBatch.mock.calls) {
            expect(call[0].graphId).toBe('inl-framework-evidence');
        }
    });
});

// ─── Hard-stop on failure (L4) ──────────────────────────────────

describe('batchIngest — hard-stop on batch failure (L4)', () => {
    it('aborta en el primer lote fallido (default hard-stop)', async () => {
        const client = makeClient({ failOnBatch: 2 });
        const logger = silentLogger();
        const episodes = makeEpisodes(50); // 50 = 3 lotes (20+20+10)
        const result = await batchIngest({
            client,
            graphId: 'g',
            episodes,
            batchSize: 20,
            sleepMs: 0,
            logger,
        });

        // Solo se llamó 2 veces (1 ok + 1 fallido) — aborta ANTES del 3er lote
        expect(client.graph.addBatch).toHaveBeenCalledTimes(2);
        expect(result.successBatches).toBe(1);
        expect(result.totalBatches).toBe(3);
        expect(result.failedBatch).toEqual({
            index: 2,
            error: 'mock: fallo programado en batch 2',
        });
        // UUIDs del primer lote recolectados
        expect(result.uuids.length).toBe(20);

        // Logger.error llamado 2 veces (fallo + abort)
        expect(logger.error).toHaveBeenCalledTimes(2);
    });

    it('log-continue: sigue al próximo lote aunque uno falle', async () => {
        const client = makeClient({ failOnBatch: 2 });
        const logger = silentLogger();
        const episodes = makeEpisodes(50); // 3 lotes
        const result = await batchIngest({
            client,
            graphId: 'g',
            episodes,
            batchSize: 20,
            sleepMs: 0,
            onError: 'log-continue',
            logger,
        });

        // Se llamó 3 veces (los 3 lotes)
        expect(client.graph.addBatch).toHaveBeenCalledTimes(3);
        // 2 exitosos (1º y 3º), 1 fallido (2º)
        expect(result.successBatches).toBe(2);
        expect(result.failedBatch).toEqual({
            index: 2,
            error: 'mock: fallo programado en batch 2',
        });
        // UUIDs del 1er + 3er lote: 20 + 10 = 30
        expect(result.uuids.length).toBe(30);
    });
});

// ─── Sleep entre lotes (L3) ─────────────────────────────────────

describe('batchIngest — sleep entre lotes (L3)', () => {
    it('aplica sleepMs entre lotes y NO después del último', async () => {
        const client = makeClient();
        const logger = silentLogger();
        const episodes = makeEpisodes(10); // 5 lotes de 2

        const sleepSpy = vi.spyOn(global, 'setTimeout');

        await batchIngest({
            client,
            graphId: 'g',
            episodes,
            batchSize: 2,
            sleepMs: 50,
            logger,
        });

        // 5 lotes → 4 sleeps (después del 1º, 2º, 3º, 4º — no después del 5º)
        const sleepCalls = sleepSpy.mock.calls.filter(c => c[1] === 50);
        expect(sleepCalls.length).toBe(4);

        sleepSpy.mockRestore();
    });

    it('NO aplica sleep si sleepMs === 0', async () => {
        const client = makeClient();
        const logger = silentLogger();
        const sleepSpy = vi.spyOn(global, 'setTimeout');

        await batchIngest({
            client,
            graphId: 'g',
            episodes: makeEpisodes(6),
            batchSize: 2,
            sleepMs: 0,
            logger,
        });

        const sleepCalls = sleepSpy.mock.calls.filter(c => c[1] === 0);
        expect(sleepCalls.length).toBe(0);

        sleepSpy.mockRestore();
    });
});

// ─── Recolección de UUIDs ───────────────────────────────────────

describe('batchIngest — recolección de UUIDs', () => {
    it('recolecta todos los UUIDs del response ZepClient', async () => {
        const client = makeClient({ uuidPrefix: 'ep' });
        const logger = silentLogger();
        const result = await batchIngest({
            client,
            graphId: 'g',
            episodes: makeEpisodes(3),
            batchSize: 10,
            sleepMs: 0,
            logger,
        });
        expect(result.uuids).toEqual(['ep-1-0', 'ep-1-1', 'ep-1-2']);
    });

    it('ignora elementos del response sin uuid', async () => {
        const client = {
            graph: {
                addBatch: vi.fn(async () => [
                    { uuid: 'ok-1' },
                    { },                    // sin uuid
                    null,                   // null
                    { uuid: 'ok-2' },
                ]),
            },
        };
        const logger = silentLogger();
        const result = await batchIngest({
            client,
            graphId: 'g',
            episodes: makeEpisodes(4),
            batchSize: 10,
            sleepMs: 0,
            logger,
        });
        expect(result.uuids).toEqual(['ok-1', 'ok-2']);
    });

    it('tolera response no-array (retorna uuids vacíos pero success)', async () => {
        const client = {
            graph: {
                addBatch: vi.fn(async () => null),
            },
        };
        const logger = silentLogger();
        const result = await batchIngest({
            client,
            graphId: 'g',
            episodes: makeEpisodes(2),
            batchSize: 10,
            sleepMs: 0,
            logger,
        });
        expect(result.successBatches).toBe(1);
        expect(result.uuids).toEqual([]);
    });
});
