/**
 * lib/frontmatter_parser.js — Parser minimalista de YAML frontmatter
 *
 * Extrae el bloque YAML entre `---\n` y `\n---\n` al inicio del archivo
 * y parsea pares clave:valor simples (flat — no nested).
 *
 * Alcance intencional mínimo:
 *   - Solo maneja el formato de los reportes/ADRs ARCA (flat key:value + listas simples)
 *   - No soporta nesting, multi-line strings con >, anchors, etc.
 *   - Cero dependencies (no gray-matter, no js-yaml)
 *
 * Si el proyecto necesita YAML complejo, reemplazar por `require('js-yaml')`.
 */

'use strict';

/**
 * Dado un string con contenido markdown, retorna:
 *   { frontmatter: object|null, body: string }
 *
 * Si no hay frontmatter (no empieza con ---), frontmatter es null y body es todo el contenido.
 */
function parseFrontmatter(content) {
    if (typeof content !== 'string') return { frontmatter: null, body: content || '' };

    const trimmed = content.replace(/^\uFEFF/, '');  // strip BOM si existe
    if (!trimmed.startsWith('---\n') && !trimmed.startsWith('---\r\n')) {
        return { frontmatter: null, body: content };
    }

    // Buscar el cierre del frontmatter: otro --- en su propia línea
    const lines = trimmed.split(/\r?\n/);
    let closingIdx = -1;
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
            closingIdx = i;
            break;
        }
    }

    if (closingIdx === -1) {
        // Sin cierre → no es frontmatter válido
        return { frontmatter: null, body: content };
    }

    const frontmatterLines = lines.slice(1, closingIdx);
    const bodyLines = lines.slice(closingIdx + 1);

    const frontmatter = parseYamlFlat(frontmatterLines);
    const body = bodyLines.join('\n').replace(/^\n+/, '');  // strip leading newlines

    return { frontmatter, body };
}

/**
 * Parser flat de YAML key:value con soporte básico para listas en una línea.
 *
 * Soporta:
 *   key: value                   → string
 *   key: "value"                 → string
 *   key: value con espacios      → string
 *   key: [item1, item2]          → array
 *   key: true|false              → boolean
 *   key: 123                     → number
 *   # comentario                 → ignorado
 *
 * NO soporta:
 *   - Nesting (key:\n  subkey: ...)
 *   - Listas multi-línea (key:\n  - item)
 *   - Strings multi-línea (>, |)
 */
function parseYamlFlat(lines) {
    const obj = {};

    for (const rawLine of lines) {
        const line = rawLine.replace(/\s+$/, '');  // trim trailing whitespace
        if (!line.trim()) continue;
        if (line.trim().startsWith('#')) continue;  // comentario

        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;

        const key = line.slice(0, colonIdx).trim();
        let rawValue = line.slice(colonIdx + 1).trim();

        if (!rawValue) continue;  // clave sin valor → skip

        // Comentario inline
        const hashIdx = rawValue.indexOf(' #');
        if (hashIdx !== -1) rawValue = rawValue.slice(0, hashIdx).trim();

        obj[key] = parseValue(rawValue);
    }

    return obj;
}

function parseValue(raw) {
    // Array en una línea: [a, b, c]
    if (raw.startsWith('[') && raw.endsWith(']')) {
        const inner = raw.slice(1, -1).trim();
        if (!inner) return [];
        return inner.split(',').map(item => parseValue(item.trim()));
    }

    // String con comillas (dobles o simples)
    if ((raw.startsWith('"') && raw.endsWith('"')) ||
        (raw.startsWith("'") && raw.endsWith("'"))) {
        return raw.slice(1, -1);
    }

    // Boolean
    if (raw === 'true') return true;
    if (raw === 'false') return false;

    // Number (int o float)
    if (/^-?\d+$/.test(raw)) return parseInt(raw, 10);
    if (/^-?\d+\.\d+$/.test(raw)) return parseFloat(raw);

    // Null
    if (raw === 'null' || raw === '~') return null;

    // String por default
    return raw;
}

module.exports = { parseFrontmatter, parseYamlFlat, parseValue };
