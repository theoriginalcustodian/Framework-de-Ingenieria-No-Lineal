/**
 * lib/zep_metadata.js — Sanitización y cap de metadata compliant con spec Zep
 *
 * Módulo puro, sin side effects (excepto `console.warn` en cap overflow).
 * Extraído y parametrizado desde ARCA `zep_daily_emitter.js` (sesión 2026-04-19).
 *
 * Encapsula 2 lecciones empíricas documentadas en
 * `docs/lecciones_heredadas_de_arca.md`:
 *   - L1: Cap de 10 keys por episodio (hard limit oficial Zep).
 *   - L2: Solo escalares en metadata (string | number | boolean).
 *         Arrays → strings CSV con sufijo `_csv`. Nulls/undefined/objetos
 *         anidados descartados silenciosamente.
 *
 * Ref oficial: https://help.getzep.com/adding-business-data#episode-metadata
 *
 * Uso típico en un ingester INL:
 *
 *   const { sanitizeFrontmatterForZep, capMetadataKeys } = require('../lib/zep_metadata');
 *
 *   const frontmatterSanitized = sanitizeFrontmatterForZep(frontmatter);
 *   const metadata = capMetadataKeys({
 *     // claves core prioritarias
 *     source: 'git_commit',
 *     file: relativePath,
 *     document_type: 'ADR',
 *     // frontmatter sanitizado (completa hasta el cap)
 *     ...frontmatterSanitized,
 *   });
 *
 *   episodes.push({ type: 'text', data: body, createdAt, metadata });
 */

'use strict';

const DEFAULT_MAX_KEYS = 10;

/**
 * Sanitiza un objeto de frontmatter para que cumpla la spec de metadata Zep.
 *
 * Reglas:
 *   - `null` / `undefined`                         → descartado
 *   - string | number | boolean                    → copiado tal cual
 *   - Array                                        → convertido a `<key>_csv` (string CSV)
 *   - Objeto anidado                               → descartado silenciosamente
 *
 * El caller es responsable de aplicar `capMetadataKeys()` después para respetar
 * el límite de 10 keys totales (que incluye las keys core del ingester, no solo
 * las del frontmatter).
 *
 * @param {Object|null|undefined} frontmatter
 * @returns {Object} objeto con scalars + `<key>_csv` strings, sin nulls ni objetos
 */
function sanitizeFrontmatterForZep(frontmatter) {
    if (!frontmatter || typeof frontmatter !== 'object' || Array.isArray(frontmatter)) {
        return {};
    }

    const out = {};
    for (const [key, value] of Object.entries(frontmatter)) {
        if (value === null || value === undefined) continue;

        if (Array.isArray(value)) {
            out[`${key}_csv`] = value.map(v => String(v)).join(',');
            continue;
        }

        const t = typeof value;
        if (t === 'string' || t === 'number' || t === 'boolean') {
            out[key] = value;
            continue;
        }

        // Objetos anidados: fuera de spec Zep → descartar silenciosamente
        // (comportamiento empírico validado en ARCA).
    }
    return out;
}

/**
 * Aplica cap de N keys al metadata, preservando el ORDEN DE INSERCIÓN del caller.
 *
 * El caller construye el objeto en orden decreciente de importancia; las claves
 * que excedan el cap se descartan con warning. Esto permite priorizar claves core
 * del ingester (source, file, commit_sha, ...) sobre claves derivadas del
 * frontmatter.
 *
 * @param {Object} metadata
 * @param {number} [maxKeys=10]
 * @returns {Object} metadata con ≤ maxKeys keys
 */
function capMetadataKeys(metadata, maxKeys = DEFAULT_MAX_KEYS) {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
        return {};
    }
    if (!Number.isInteger(maxKeys) || maxKeys <= 0) {
        throw new TypeError(`capMetadataKeys: maxKeys debe ser entero positivo, recibido: ${maxKeys}`);
    }

    const keys = Object.keys(metadata);
    if (keys.length <= maxKeys) return metadata;

    const capped = {};
    for (let i = 0; i < maxKeys; i++) capped[keys[i]] = metadata[keys[i]];

    const dropped = keys.slice(maxKeys);
    console.warn(
        `[zep_metadata] Descartadas ${dropped.length} keys por cap=${maxKeys}: ${dropped.join(', ')}`
    );
    return capped;
}

module.exports = {
    sanitizeFrontmatterForZep,
    capMetadataKeys,
    DEFAULT_MAX_KEYS,
};
