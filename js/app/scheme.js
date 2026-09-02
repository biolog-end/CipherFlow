/**
 * Scheme format and conversion.
 *
 * Current format (version "3.0"):
 * {
 *   version, name, description, created,
 *   nodes:       [{ id, type, x, y, title?, values: { field: value } }],
 *   connections: [{ id, from: { node, port }, to: { node, port } }]
 * }
 * Format 1.0 / 2.0 files (node fields stored as data.fields[], connections as fromOutputName/inputName)
 * are converted on load.
 */
const Scheme = (() => {
    const VERSION = '3.0';

    /** Type ids found in 1.0 / 2.0 files and the current type plus values they map to. */
    const LEGACY_TYPES = {
        'rle-compression': { type: 'compression', values: { algorithm: 'rle' } },
    };

    function normalizeNode(raw) {
        if (!raw || typeof raw.id !== 'string' || typeof raw.type !== 'string') return null;
        const legacy = LEGACY_TYPES[raw.type];
        const type = legacy ? legacy.type : raw.type;
        if (!NodeRegistry.has(type)) return null;

        const values = { ...(legacy ? legacy.values : {}) };
        if (raw.values && typeof raw.values === 'object') {
            Object.assign(values, raw.values);
        } else if (raw.data && Array.isArray(raw.data.fields)) {
            for (const field of raw.data.fields) {
                if (field && typeof field.name === 'string' && field.value !== undefined) values[field.name] = field.value;
            }
        }
        // only fields the node type defines
        const def = NodeRegistry.get(type);
        const known = new Set(def.fields.map(f => f.name));
        for (const key of Object.keys(values)) if (!known.has(key)) delete values[key];

        let title = null;
        if (typeof raw.title === 'string' && raw.title.trim()) title = raw.title.trim();
        else if (raw.data && raw.data.isTitleCustomized && typeof raw.data.title === 'string') title = raw.data.title;

        return {
            id: raw.id,
            type,
            x: Number.isFinite(raw.x) ? raw.x : 0,
            y: Number.isFinite(raw.y) ? raw.y : 0,
            title,
            values,
        };
    }

    function normalizeConnection(raw, index, nodeIds) {
        if (!raw) return null;
        let from, to;
        if (raw.from && typeof raw.from === 'object') {
            from = { node: raw.from.node ?? raw.from.nodeId, port: raw.from.port || 'out' };
            to = { node: raw.to.node ?? raw.to.nodeId, port: raw.to.port || 'in' };
        } else {
            from = { node: raw.from, port: raw.fromOutputName || 'out' };
            to = { node: raw.to, port: raw.inputName || 'in' };
        }
        if (!nodeIds.has(from.node) || !nodeIds.has(to.node)) return null;
        return { id: typeof raw.id === 'string' ? raw.id : `connection_${index}`, from, to };
    }

    /** Converts any supported scheme object into the current format. Throws on structurally invalid input. */
    function normalize(raw) {
        if (!raw || typeof raw !== 'object' || !Array.isArray(raw.nodes)) {
            throw new Error(i18n.t('error.invalid_scheme'));
        }
        const nodes = raw.nodes.map(normalizeNode).filter(Boolean);
        const nodeIds = new Set(nodes.map(n => n.id));
        const connections = (Array.isArray(raw.connections) ? raw.connections : [])
            .map((c, i) => normalizeConnection(c, i, nodeIds))
            .filter(Boolean);
        return {
            version: VERSION,
            name: typeof raw.name === 'string' ? raw.name : '',
            description: typeof raw.description === 'string' ? raw.description : '',
            created: typeof raw.created === 'string' ? raw.created : new Date().toISOString(),
            nodes,
            connections,
        };
    }

    function parse(json) {
        return normalize(JSON.parse(json));
    }

    function stringify(scheme) {
        return JSON.stringify({ version: VERSION, ...scheme }, null, 2);
    }

    /** Structural equality used to skip no-op history entries. */
    function equal(a, b) {
        return JSON.stringify(a.nodes) === JSON.stringify(b.nodes) && JSON.stringify(a.connections) === JSON.stringify(b.connections);
    }

    return Object.freeze({ VERSION, normalize, parse, stringify, equal });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Scheme;
}
