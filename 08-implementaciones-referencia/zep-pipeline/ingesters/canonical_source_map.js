/**
 * ingesters/canonical_source_map.js — Mapping declarativo archivo→entity_type
 *
 * Tabla declarativa que le dice al `canonical_ingester.js` cómo interpretar
 * cada archivo del repo INL. Evita hardcoding dentro del ingester (Ley F-1).
 *
 * Estructura:
 *   - `staticNodes[]`: nodos que NO vienen de archivos sino de la estructura
 *     fija del framework (Leyes F-1..F-6, O-1..O-4, R-1..R-5 del CONSTITUCION.md,
 *     Anti-Patrones AP-1..AP-4, Fases Dia--1..Dia-6 + Fuera-del-ciclo +
 *     Sprint-360h). Se declaran acá porque el CONSTITUCION.md los tiene como
 *     headings, no como archivos separados.
 *   - `fileMappings[]`: patrones glob/regex por archivo + entity_type + extractor
 *     de `entity_name`. Los archivos de `03-patrones/`, `04-manifiestos/`,
 *     `01-teoria/`, `02-framework/`, `06-arquitectura-cognitiva/` caen acá.
 *   - `staticEdges[]`: edges declarativos entre nodos canonical — la tabla de
 *     relaciones normativas del framework que NO se infieren de archivos sino
 *     que se declaran fijas (ej. "Ley F-1 Requiere Patron A-1", "Patron C-1
 *     Contradice AntiPatron AP-3").
 *
 * Principio: lo que es estructural del framework (leyes, anti-patrones, fases)
 * se declara acá. Lo que es redactable (patrones, manifiestos, teoría) se
 * descubre por walk de filesystem.
 */

'use strict';

// ─── STATIC NODES — estructura fija del framework ────────────────────────────

const staticNodes = [
    // ─── Leyes Físicas (6) ─────────────────────────────────────────
    { entity_type: 'Ley', entity_name: 'F-1', codigo: 'F-1', categoria: 'fisica', titulo: 'Muerte al Hardcoding', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#ley-f-1', inmutable: true },
    { entity_type: 'Ley', entity_name: 'F-2', codigo: 'F-2', categoria: 'fisica', titulo: 'Seguridad en la Raíz (CDD)', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#ley-f-2', inmutable: true },
    { entity_type: 'Ley', entity_name: 'F-3', codigo: 'F-3', categoria: 'fisica', titulo: 'Trauma Empaquetado (DLQ)', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#ley-f-3', inmutable: true },
    { entity_type: 'Ley', entity_name: 'F-4', codigo: 'F-4', categoria: 'fisica', titulo: 'Isomorfismo Estructural', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#ley-f-4', inmutable: true },
    { entity_type: 'Ley', entity_name: 'F-5', codigo: 'F-5', categoria: 'fisica', titulo: 'Aislamiento en Adaptadores Universales', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#ley-f-5', inmutable: true },
    { entity_type: 'Ley', entity_name: 'F-6', codigo: 'F-6', categoria: 'fisica', titulo: 'El Humano Aprueba (HITL)', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#ley-f-6', inmutable: true },

    // ─── Leyes Operativas (4) ──────────────────────────────────────
    { entity_type: 'Ley', entity_name: 'O-1', codigo: 'O-1', categoria: 'operativa', titulo: 'Evaporación del Estado', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#ley-o-1', inmutable: true },
    { entity_type: 'Ley', entity_name: 'O-2', codigo: 'O-2', categoria: 'operativa', titulo: 'Protección del Perímetro', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#ley-o-2', inmutable: true },
    { entity_type: 'Ley', entity_name: 'O-3', codigo: 'O-3', categoria: 'operativa', titulo: 'Auditor antes que Generador', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#ley-o-3', inmutable: true },
    { entity_type: 'Ley', entity_name: 'O-4', codigo: 'O-4', categoria: 'operativa', titulo: 'Rigor Constitucional', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#ley-o-4', inmutable: true },

    // ─── Leyes R-Específicas (5) ───────────────────────────────────
    { entity_type: 'Ley', entity_name: 'R-1', codigo: 'R-1', categoria: 'r_especifica', titulo: 'Docs-Only', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#ley-r-1', inmutable: true },
    { entity_type: 'Ley', entity_name: 'R-2', codigo: 'R-2', categoria: 'r_especifica', titulo: 'Zona de Borrador Obligatoria', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#ley-r-2', inmutable: true },
    { entity_type: 'Ley', entity_name: 'R-3', codigo: 'R-3', categoria: 'r_especifica', titulo: 'Mutación de Documentación antes que Práctica', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#ley-r-3', inmutable: true },
    { entity_type: 'Ley', entity_name: 'R-4', codigo: 'R-4', categoria: 'r_especifica', titulo: 'Idioma', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#ley-r-4', inmutable: true },
    { entity_type: 'Ley', entity_name: 'R-5', codigo: 'R-5', categoria: 'r_especifica', titulo: 'Idempotencia Documental', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#ley-r-5', inmutable: true },

    // ─── Anti-Patrones (4) ─────────────────────────────────────────
    { entity_type: 'AntiPatron', entity_name: 'AP-1', codigo: 'AP-1', nombre: 'Feature Creep Prematuro', senal_deteccion: 'Agregar funcionalidad antes de validar la actual', intervencion: 'Cerrar scope mínimo viable y validar antes de expandir', fase_riesgo_csv: 'Dia-2,Dia-3,Dia-4', patron_contrario_csv: 'C-1', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#anti-patrones' },
    { entity_type: 'AntiPatron', entity_name: 'AP-2', codigo: 'AP-2', nombre: 'Parche Aislado sin Auditoría', senal_deteccion: 'Mismo defecto reaparece en 3+ lugares y se parchea localmente cada vez', intervencion: 'Detener parches, auditar el generador sistémico, aplicar O-3', fase_riesgo_csv: 'Dia-3,Dia-4,Dia-5,Fuera-del-ciclo', patron_contrario_csv: 'G-1', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#anti-patrones' },
    { entity_type: 'AntiPatron', entity_name: 'AP-3', codigo: 'AP-3', nombre: 'Conexión Prematura', senal_deteccion: 'Se conectan módulos/servicios antes de establecer el contrato', intervencion: 'Definir schema primero (C-1 Pre-Computación); conectar después', fase_riesgo_csv: 'Dia-1,Dia-2', patron_contrario_csv: 'C-1,A-1', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#anti-patrones' },
    { entity_type: 'AntiPatron', entity_name: 'AP-4', codigo: 'AP-4', nombre: 'Cierre Térmico Ausente', senal_deteccion: 'Sesión termina sin SNAPSHOT actualizado — la siguiente sesión reconstruye contexto manualmente', intervencion: 'Aplicar Delta Cognitivo al cierre; actualizar SNAPSHOT_ESTADO.md', fase_riesgo_csv: 'Fuera-del-ciclo', patron_contrario_csv: 'C-3', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#anti-patrones' },

    // ─── Fases PEAP (9) ────────────────────────────────────────────
    { entity_type: 'FasePEAP', entity_name: 'Dia--1', dia: 'Dia--1', nombre: 'Preparación Simbólica', horas_desde_inicio: -24, condicion_salida: 'Ideación clara + contexto preparado', entregables_csv: 'concepto_core,perímetro,nomenclatura', senales_alarma_csv: 'ambigüedad_de_scope', patrones_activos_csv: 'G-2', source_path: '02-framework/protocolo-peap-v5-144h.md', seccion_origen: '02-framework/protocolo-peap-v5-144h.md#dia--1' },
    { entity_type: 'FasePEAP', entity_name: 'Dia-0', dia: 'Dia-0', nombre: 'Gobernanza Día 0', horas_desde_inicio: 0, condicion_salida: 'Constitución técnica + Adaptador Universal + CDD/RLS activos', entregables_csv: 'CONSTITUCION.md,A-1,RLS', senales_alarma_csv: 'gobernanza_afterthought', patrones_activos_csv: 'G-2,A-1,A-2', source_path: '02-framework/protocolo-peap-v5-144h.md', seccion_origen: '02-framework/protocolo-peap-v5-144h.md#dia-0' },
    { entity_type: 'FasePEAP', entity_name: 'Dia-1', dia: 'Dia-1', nombre: 'Adaptador + Schema', horas_desde_inicio: 24, condicion_salida: 'Adaptador Universal sellado + DB schema estable', entregables_csv: 'adaptador,schema_db', senales_alarma_csv: 'conexion_prematura', patrones_activos_csv: 'A-1,C-1', source_path: '02-framework/protocolo-peap-v5-144h.md', seccion_origen: '02-framework/protocolo-peap-v5-144h.md#dia-1' },
    { entity_type: 'FasePEAP', entity_name: 'Dia-2', dia: 'Dia-2', nombre: 'Exocórtex + Offloading', horas_desde_inicio: 48, condicion_salida: 'Memoria semántica operativa + CPU/GPU roles claros', entregables_csv: 'exocortex_activo,c2_validado', senales_alarma_csv: 'rol_inversion', patrones_activos_csv: 'C-2,C-3', source_path: '02-framework/protocolo-peap-v5-144h.md', seccion_origen: '02-framework/protocolo-peap-v5-144h.md#dia-2' },
    { entity_type: 'FasePEAP', entity_name: 'Dia-3', dia: 'Dia-3', nombre: 'Event-Driven + Auto-Healing', horas_desde_inicio: 72, condicion_salida: 'Sistema asíncrono con DLQ + auto-healing por PR', entregables_csv: 'dlq_operativo,auto_healing', senales_alarma_csv: 'patch_en_caliente', patrones_activos_csv: 'A-3,F-3', source_path: '02-framework/protocolo-peap-v5-144h.md', seccion_origen: '02-framework/protocolo-peap-v5-144h.md#dia-3' },
    { entity_type: 'FasePEAP', entity_name: 'Dia-4', dia: 'Dia-4', nombre: 'Meta-Validación', horas_desde_inicio: 96, condicion_salida: 'ADR-006 activo + meta-validación del agente', entregables_csv: 'framework_self_check,adr006', senales_alarma_csv: 'decision_sin_framework_check', patrones_activos_csv: 'C-3', source_path: '02-framework/protocolo-peap-v5-144h.md', seccion_origen: '02-framework/protocolo-peap-v5-144h.md#dia-4' },
    { entity_type: 'FasePEAP', entity_name: 'Dia-5', dia: 'Dia-5', nombre: 'Consolidación', horas_desde_inicio: 120, condicion_salida: 'Sistema estable + docs consolidadas', entregables_csv: 'docs_canonicas,base_autonoma', senales_alarma_csv: 'docs_pendientes', patrones_activos_csv: 'G-1,G-2', source_path: '02-framework/protocolo-peap-v5-144h.md', seccion_origen: '02-framework/protocolo-peap-v5-144h.md#dia-5' },
    { entity_type: 'FasePEAP', entity_name: 'Dia-6', dia: 'Dia-6', nombre: 'Cierre + Handoff', horas_desde_inicio: 144, condicion_salida: 'Base autónoma L5 + handoff documentado', entregables_csv: 'handoff_completo,base_l5', senales_alarma_csv: 'cierre_sin_snapshot', patrones_activos_csv: 'C-3', source_path: '02-framework/protocolo-peap-v5-144h.md', seccion_origen: '02-framework/protocolo-peap-v5-144h.md#dia-6' },
    { entity_type: 'FasePEAP', entity_name: 'Fuera-del-ciclo', dia: 'Fuera-del-ciclo', nombre: 'Mantenimiento Reactivo', horas_desde_inicio: 0, condicion_salida: 'N/A — estado de mantenimiento continuo', entregables_csv: 'deltas_cognitivos,snapshots_reactivos', senales_alarma_csv: 'drift_sin_commit', patrones_activos_csv: 'G-1,C-3', source_path: 'CONSTITUCION.md', seccion_origen: 'CONSTITUCION.md#naturaleza-del-repo' },
];

// ─── FILE MAPPINGS — archivos que se parsean del filesystem ──────────────────

const fileMappings = [
    {
        name: 'patrones',
        glob: '03-patrones/*.md',
        entity_type: 'Patron',
        // `a1-adaptador-universal.md` → entity_name `A-1`, familia `A`, nombre derivado
        extractEntity: (filePath, frontmatter) => {
            const basename = filePath.split('/').pop().replace(/\.md$/, '');
            const match = basename.match(/^([acg])(\d+)-(.+)$/i);
            if (!match) return null;
            const familia = match[1].toUpperCase();
            const num = match[2];
            const slug = match[3];
            const code = `${familia}-${num}`;
            const nombre = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return {
                entity_name: code,
                codigo: code,
                familia,
                nombre,
                estado: frontmatter?.estado || 'activo',
                fase_peap_aplicable_csv: frontmatter?.fase_peap_aplicable_csv || frontmatter?.fases_csv || '',
                leyes_asociadas_csv: frontmatter?.leyes_asociadas_csv || frontmatter?.leyes_csv || '',
                anti_patrones_contrarios_csv: frontmatter?.anti_patrones_contrarios_csv || frontmatter?.anti_patrones_csv || '',
            };
        },
        skipFiles: [/^directivas-xml-agentes\.md$/], // no es patrón codificado
    },
    {
        name: 'manifiestos',
        glob: '04-manifiestos/*.md',
        entity_type: 'ConceptoCanonico',
        // `muerte-al-hardcoding.md` → entity_name slug directo, kind=manifiesto
        extractEntity: (filePath, frontmatter) => {
            const basename = filePath.split('/').pop().replace(/\.md$/, '');
            const slug = basename.slice(0, 50); // cap entity_name
            const nombre = frontmatter?.titulo || basename.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return {
                entity_name: slug,
                nombre,
                kind: 'manifiesto',
                seccion_origen: filePath,
                conceptos_relacionados_csv: frontmatter?.relacionados_csv || '',
            };
        },
    },
    {
        name: 'teoria',
        glob: '01-teoria/*.md',
        entity_type: 'ConceptoCanonico',
        extractEntity: (filePath, frontmatter) => {
            const basename = filePath.split('/').pop().replace(/\.md$/, '');
            const slug = basename.slice(0, 50);
            const nombre = frontmatter?.titulo || basename.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return {
                entity_name: slug,
                nombre,
                kind: 'concepto',
                seccion_origen: filePath,
                conceptos_relacionados_csv: frontmatter?.relacionados_csv || '',
            };
        },
    },
    {
        name: 'framework',
        glob: '02-framework/*.md',
        entity_type: 'ConceptoCanonico',
        extractEntity: (filePath, frontmatter) => {
            const basename = filePath.split('/').pop().replace(/\.md$/, '');
            const slug = basename.slice(0, 50);
            const nombre = frontmatter?.titulo || basename.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return {
                entity_name: slug,
                nombre,
                kind: 'concepto',
                seccion_origen: filePath,
                conceptos_relacionados_csv: frontmatter?.relacionados_csv || '',
            };
        },
        // El protocolo-peap-v5-144h.md ya alimenta las FasePEAP como nodos estáticos;
        // se ingesta además como ConceptoCanonico con kind=concepto para el body.
    },
    {
        name: 'arquitectura_cognitiva',
        glob: '06-arquitectura-cognitiva/*.md',
        entity_type: 'ConceptoCanonico',
        extractEntity: (filePath, frontmatter) => {
            const basename = filePath.split('/').pop().replace(/\.md$/, '');
            const slug = basename.slice(0, 50);
            const nombre = frontmatter?.titulo || basename.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return {
                entity_name: slug,
                nombre,
                kind: 'artefacto',
                seccion_origen: filePath,
                conceptos_relacionados_csv: frontmatter?.relacionados_csv || '',
            };
        },
    },
];

// ─── STATIC EDGES — relaciones normativas declarativas ──────────────────────
// Cada edge declara: source entity_name + target entity_name + edge type +
// fact legible + factName SCREAMING_SNAKE_CASE + props propias del edge.

const staticEdges = [
    // ─── Ley Prohíbe AntiPatron ───────────────────────────────────
    { source: 'F-1', target: 'AP-3', edge_type: 'PROHIBE', factName: 'PROHIBE',
      fact: 'La Ley F-1 Muerte al Hardcoding prohíbe el Anti-Patrón AP-3 Conexión Prematura porque conectar antes de parametrizar genera dependencias rígidas.',
      severidad: 'bloqueante', ambito: 'universal' },
    { source: 'F-3', target: 'AP-2', edge_type: 'PROHIBE', factName: 'PROHIBE',
      fact: 'La Ley F-3 Trauma Empaquetado prohíbe el Anti-Patrón AP-2 Parche Aislado: los errores van a DLQ auditado, no se reparan localmente.',
      severidad: 'fuerte', ambito: 'universal' },
    { source: 'F-4', target: 'AP-1', edge_type: 'PROHIBE', factName: 'PROHIBE',
      fact: 'La Ley F-4 Isomorfismo Estructural prohíbe el Anti-Patrón AP-1 Feature Creep Prematuro porque expandir antes de cerrar scope rompe la simetría del sistema.',
      severidad: 'fuerte', ambito: 'universal' },
    { source: 'O-3', target: 'AP-2', edge_type: 'PROHIBE', factName: 'PROHIBE',
      fact: 'La Ley O-3 Auditor antes que Generador prohíbe el Anti-Patrón AP-2 Parche Aislado: si el defecto aparece en 3+ lugares exige auditar el generador sistémico.',
      severidad: 'bloqueante', ambito: 'universal' },

    // ─── Ley Requiere Patron ──────────────────────────────────────
    { source: 'F-1', target: 'A-1', edge_type: 'REQUIERE', factName: 'REQUIERE',
      fact: 'La Ley F-1 Muerte al Hardcoding requiere aplicar el Patrón A-1 Adaptador Universal para externalizar diferencias entre APIs.',
      obligatoriedad: 'mandatoria', condicion_aplicacion: '' },
    { source: 'F-2', target: 'A-2', edge_type: 'REQUIERE', factName: 'REQUIERE',
      fact: 'La Ley F-2 Seguridad en la Raíz requiere aplicar el Patrón A-2 Constraint-Driven Development con RLS activo desde Día 0.',
      obligatoriedad: 'mandatoria', condicion_aplicacion: 'Proyectos multi-tenant' },
    { source: 'F-3', target: 'A-3', edge_type: 'REQUIERE', factName: 'REQUIERE',
      fact: 'La Ley F-3 Trauma Empaquetado requiere el Patrón A-3 Event-Driven para serializar fallos en DLQ sin bloquear ejecución.',
      obligatoriedad: 'mandatoria', condicion_aplicacion: '' },
    { source: 'F-6', target: 'C-2', edge_type: 'REQUIERE', factName: 'REQUIERE',
      fact: 'La Ley F-6 HITL requiere el Patrón C-2 Offloading Cognitivo CPU/GPU: el humano aprueba, el agente ejecuta volumen.',
      obligatoriedad: 'mandatoria', condicion_aplicacion: '' },
    { source: 'O-3', target: 'G-1', edge_type: 'REQUIERE', factName: 'REQUIERE',
      fact: 'La Ley O-3 Auditor antes que Generador requiere el Patrón G-1 Debugging de Generadores cuando un defecto aparece en 3+ lugares.',
      obligatoriedad: 'contextual', condicion_aplicacion: 'Defecto sistémico en 3+ locaciones' },

    // ─── Patron AplicaA FasePEAP ──────────────────────────────────
    { source: 'G-2', target: 'Dia-0', edge_type: 'APLICA_A', factName: 'APLICA_A',
      fact: 'El Patrón G-2 Gobernanza Día 0 aplica críticamente en la Fase Dia-0: la Constitución técnica debe existir antes de escribir código.',
      momento: 'apertura', criticidad: 'critica' },
    { source: 'A-1', target: 'Dia-1', edge_type: 'APLICA_A', factName: 'APLICA_A',
      fact: 'El Patrón A-1 Adaptador Universal aplica en el Día 1: Adaptador sellado antes de tocar APIs externas.',
      momento: 'apertura', criticidad: 'critica' },
    { source: 'C-1', target: 'Dia-1', edge_type: 'APLICA_A', factName: 'APLICA_A',
      fact: 'El Patrón C-1 Pre-Computación aplica en el Día 1: schema y contrato antes de conexión.',
      momento: 'transversal', criticidad: 'critica' },
    { source: 'C-2', target: 'Dia-2', edge_type: 'APLICA_A', factName: 'APLICA_A',
      fact: 'El Patrón C-2 Offloading Cognitivo aplica en el Día 2: roles CPU/GPU claros para scale out.',
      momento: 'transversal', criticidad: 'critica' },
    { source: 'C-3', target: 'Dia-2', edge_type: 'APLICA_A', factName: 'APLICA_A',
      fact: 'El Patrón C-3 Exocórtex Memoria Activa aplica en el Día 2: memoria semántica externa operativa.',
      momento: 'cierre', criticidad: 'critica' },
    { source: 'A-3', target: 'Dia-3', edge_type: 'APLICA_A', factName: 'APLICA_A',
      fact: 'El Patrón A-3 Event-Driven aplica en el Día 3: DLQ operativo + reintentos asíncronos.',
      momento: 'apertura', criticidad: 'critica' },
    { source: 'G-1', target: 'Dia-5', edge_type: 'APLICA_A', factName: 'APLICA_A',
      fact: 'El Patrón G-1 Debugging de Generadores aplica en el Día 5 durante la consolidación: auditar patrones sistémicos antes de cerrar.',
      momento: 'transversal', criticidad: 'media' },
    { source: 'G-1', target: 'Fuera-del-ciclo', edge_type: 'APLICA_A', factName: 'APLICA_A',
      fact: 'El Patrón G-1 Debugging de Generadores aplica transversalmente fuera del ciclo para mantener salud sistémica.',
      momento: 'transversal', criticidad: 'media' },

    // ─── Patron Contradice AntiPatron ─────────────────────────────
    { source: 'C-1', target: 'AP-3', edge_type: 'CONTRADICE', factName: 'CONTRADICE',
      fact: 'El Patrón C-1 Pre-Computación contradice al Anti-Patrón AP-3 Conexión Prematura: definir schema primero previene la conexión sin contrato.',
      relacion_tipo: 'preventivo' },
    { source: 'A-1', target: 'AP-3', edge_type: 'CONTRADICE', factName: 'CONTRADICE',
      fact: 'El Patrón A-1 Adaptador Universal contradice al Anti-Patrón AP-3 Conexión Prematura: el adaptador fuerza parametrización antes de conectar.',
      relacion_tipo: 'preventivo' },
    { source: 'G-1', target: 'AP-2', edge_type: 'CONTRADICE', factName: 'CONTRADICE',
      fact: 'El Patrón G-1 Debugging de Generadores contradice al Anti-Patrón AP-2 Parche Aislado: la auditoría del generador reemplaza los parches locales.',
      relacion_tipo: 'correctivo' },
    { source: 'C-3', target: 'AP-4', edge_type: 'CONTRADICE', factName: 'CONTRADICE',
      fact: 'El Patrón C-3 Exocórtex Memoria Activa contradice al Anti-Patrón AP-4 Cierre Térmico Ausente: el Delta Cognitivo + SNAPSHOT es el ritual de cierre.',
      relacion_tipo: 'preventivo' },
];

module.exports = {
    staticNodes,
    fileMappings,
    staticEdges,
};
