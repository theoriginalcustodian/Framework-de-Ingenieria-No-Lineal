/**
 * Tests para lib/zep_metadata.js
 *
 * Cubren las lecciones L1 (cap 10 keys) y L2 (solo escalares, arrays→CSV,
 * nulls/objetos descartados) documentadas en
 * `docs/lecciones_heredadas_de_arca.md`.
 *
 * Correr con: `npm test` desde zep-pipeline/
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const {
    sanitizeFrontmatterForZep,
    capMetadataKeys,
    DEFAULT_MAX_KEYS,
} = require('../../lib/zep_metadata');

// ─── sanitizeFrontmatterForZep ──────────────────────────────────

describe('sanitizeFrontmatterForZep — L2 (solo escalares, arrays→CSV)', () => {
    it('retorna objeto vacío para null/undefined', () => {
        expect(sanitizeFrontmatterForZep(null)).toEqual({});
        expect(sanitizeFrontmatterForZep(undefined)).toEqual({});
    });

    it('retorna objeto vacío para no-objetos (string, number, array)', () => {
        expect(sanitizeFrontmatterForZep('foo')).toEqual({});
        expect(sanitizeFrontmatterForZep(42)).toEqual({});
        expect(sanitizeFrontmatterForZep([1, 2, 3])).toEqual({});
    });

    it('preserva string, number y boolean tal cual', () => {
        const result = sanitizeFrontmatterForZep({
            titulo: 'Ley F-1',
            version: 5,
            inmutable: true,
            activo: false,
        });
        expect(result).toEqual({
            titulo: 'Ley F-1',
            version: 5,
            inmutable: true,
            activo: false,
        });
    });

    it('descarta null y undefined silenciosamente', () => {
        const result = sanitizeFrontmatterForZep({
            codigo: 'C-1',
            obsoleto: null,
            deprecated: undefined,
            activo: true,
        });
        expect(result).toEqual({ codigo: 'C-1', activo: true });
    });

    it('convierte arrays a <key>_csv con string CSV', () => {
        const result = sanitizeFrontmatterForZep({
            codigo: 'Patron-A',
            leyes_asociadas: ['F-1', 'F-5', 'F-6'],
            fase_peap: [],
        });
        expect(result).toEqual({
            codigo: 'Patron-A',
            leyes_asociadas_csv: 'F-1,F-5,F-6',
            fase_peap_csv: '',
        });
    });

    it('coerciona elementos de array a string vía String()', () => {
        const result = sanitizeFrontmatterForZep({
            numeros: [1, 2, 3],
            mixed: ['a', 42, true],
        });
        expect(result).toEqual({
            numeros_csv: '1,2,3',
            mixed_csv: 'a,42,true',
        });
    });

    it('descarta objetos anidados silenciosamente', () => {
        const result = sanitizeFrontmatterForZep({
            codigo: 'F-1',
            nested: { foo: 'bar', deep: { bar: 'baz' } },
            activo: true,
        });
        expect(result).toEqual({ codigo: 'F-1', activo: true });
    });

    it('combina correctamente múltiples tipos en un mismo objeto', () => {
        const result = sanitizeFrontmatterForZep({
            codigo: 'AP-2',
            fase_riesgo: ['Dia-3', 'Dia-4'],
            senal_deteccion: 'alarma visible',
            patron_contrario: null,
            obsoleto: false,
            metadata: { ignorar: 'esto' },
            version: 5,
        });
        expect(result).toEqual({
            codigo: 'AP-2',
            fase_riesgo_csv: 'Dia-3,Dia-4',
            senal_deteccion: 'alarma visible',
            obsoleto: false,
            version: 5,
        });
    });
});

// ─── capMetadataKeys ────────────────────────────────────────────

describe('capMetadataKeys — L1 (cap 10 keys por episodio)', () => {
    let warnSpy;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => {
        warnSpy.mockRestore();
    });

    it('expone DEFAULT_MAX_KEYS = 10', () => {
        expect(DEFAULT_MAX_KEYS).toBe(10);
    });

    it('retorna objeto vacío para null/undefined/array', () => {
        expect(capMetadataKeys(null)).toEqual({});
        expect(capMetadataKeys(undefined)).toEqual({});
        expect(capMetadataKeys([1, 2, 3])).toEqual({});
    });

    it('retorna el objeto tal cual si tiene ≤ maxKeys', () => {
        const input = { a: 1, b: 2, c: 3 };
        expect(capMetadataKeys(input, 10)).toEqual(input);
        expect(capMetadataKeys(input, 3)).toEqual(input);
    });

    it('cappea a las primeras maxKeys preservando orden de inserción', () => {
        const input = { a: 1, b: 2, c: 3, d: 4, e: 5 };
        expect(capMetadataKeys(input, 3)).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('usa DEFAULT_MAX_KEYS=10 si no se pasa parámetro', () => {
        const input = {};
        for (let i = 0; i < 15; i++) input[`k${i}`] = i;
        const result = capMetadataKeys(input);
        expect(Object.keys(result).length).toBe(10);
        expect(result.k0).toBe(0);
        expect(result.k9).toBe(9);
        expect(result.k10).toBeUndefined();
    });

    it('emite warning cuando descarta keys', () => {
        const input = { a: 1, b: 2, c: 3 };
        capMetadataKeys(input, 2);
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy.mock.calls[0][0]).toMatch(/Descartadas 1 keys por cap=2/);
        expect(warnSpy.mock.calls[0][0]).toMatch(/\bc\b/);
    });

    it('NO emite warning cuando no descarta keys', () => {
        capMetadataKeys({ a: 1, b: 2 }, 10);
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('throws si maxKeys no es entero positivo', () => {
        expect(() => capMetadataKeys({ a: 1 }, 0)).toThrow(TypeError);
        expect(() => capMetadataKeys({ a: 1 }, -1)).toThrow(TypeError);
        expect(() => capMetadataKeys({ a: 1 }, 1.5)).toThrow(TypeError);
        expect(() => capMetadataKeys({ a: 1 }, 'diez')).toThrow(TypeError);
    });
});

// ─── Uso combinado (escenario real de ingester) ─────────────────

describe('sanitizeFrontmatterForZep + capMetadataKeys — pipeline real', () => {
    it('patrón típico: merge de claves core + frontmatter sanitizado con cap', () => {
        const frontmatter = {
            titulo: 'Patrón C-1 Pre-Computación',
            codigo: 'C-1',
            familia: 'C',
            estado: 'activo',
            leyes_asociadas: ['F-1', 'F-5'],
            anti_patrones_contrarios: ['AP-3'],
            fase_peap_aplicable: ['Dia-3', 'Dia-4', 'Fuera-del-ciclo'],
            autor: null,
            version_schema: 2,
        };

        const sanitized = sanitizeFrontmatterForZep(frontmatter);
        const metadata = capMetadataKeys({
            // 4 claves core (prioritarias)
            source: 'git_commit',
            file: '03-patrones/c1-pre-computacion.md',
            commit_sha: 'abc1234',
            document_type: 'Patron',
            // Frontmatter sanitizado (hasta 6 más para llegar a 10)
            ...sanitized,
        });

        // Debe tener exactamente 10 keys
        expect(Object.keys(metadata).length).toBe(10);
        // Las 4 core primero
        expect(metadata.source).toBe('git_commit');
        expect(metadata.file).toBe('03-patrones/c1-pre-computacion.md');
        expect(metadata.commit_sha).toBe('abc1234');
        expect(metadata.document_type).toBe('Patron');
        // Nulls descartados (autor no aparece)
        expect(metadata.autor).toBeUndefined();
        // Arrays convertidos a CSV
        expect(metadata.leyes_asociadas_csv).toBe('F-1,F-5');
    });
});
