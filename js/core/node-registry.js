/**
 * Central registry of node types.
 *
 * A node definition describes everything about one node type in a single object:
 *   type      unique id, also used in saved schemes ("caesar")
 *   category  one of NodeRegistry.CATEGORIES ids — drives the side panel and the help index
 *   icon      Font Awesome class
 *   color     accent colour used for the node card and its help entry
 *   title     i18n key of the default node title
 *   fields    editable parameters; each { name, type, label, value, options?, min?, max?, rows?, tooltip?, showWhen? }
 *             type: 'number' | 'text' | 'textarea' | 'select' | 'checkbox' | 'rules'
 *   inputs    ports; omitted = one unlabeled input "in", [] = none.
 *             { name, label?, color?, kind?: 'data' | 'param' }  — param ports always flow forward, even in decrypt mode
 *   outputs   ports; omitted = one unlabeled output "out", [] = none
 *   role      'input' | 'output' for the terminal nodes that talk to the text panels
 *   process   (ctx, entry) => exit
 *             entry: string when the node has exactly one data entry port, otherwise { port: value }
 *             exit:  string for a single exit port, otherwise { port: value }
 *             In decrypt mode entry ports are the outputs and exit ports are the inputs.
 *             ctx = { reverse, fields, params, t, node, sourceText, isSource }
 *   help      { desc, blocks } — see help-system.js; title/icon/colour are taken from the definition
 */
const NodeRegistry = EngineModules.define('NodeRegistry', () => {
    const CATEGORIES = Object.freeze([
        { id: 'io', label: 'nodes.input_output' },
        { id: 'classic', label: 'nodes.classic_ciphers' },
        { id: 'transform', label: 'nodes.transformations' },
        { id: 'advanced', label: 'nodes.advanced_processing' },
        { id: 'logic', label: 'nodes.logical_operations' },
        { id: 'modern', label: 'nodes.modern_ciphers' },
        { id: 'fun', label: 'nodes.fun_ciphers' },
        { id: 'system', label: 'nodes.system_ciphers' },
        { id: 'utility', label: 'nodes.utilities' },
    ]);

    const definitions = new Map();

    function normalizePort(port, fallbackName) {
        if (port === undefined) return { name: fallbackName, kind: 'data' };
        if (typeof port === 'string') return { name: port, kind: 'data' };
        return { kind: 'data', ...port };
    }

    function normalizePorts(ports, fallbackName) {
        if (ports === undefined) return [normalizePort(undefined, fallbackName)];
        return ports.map(p => normalizePort(p, fallbackName));
    }

    function register(def) {
        if (!def || typeof def.type !== 'string') throw new Error('Node definition needs a "type"');
        if (definitions.has(def.type)) throw new Error(`Node type "${def.type}" is already registered`);
        if (typeof def.process !== 'function') throw new Error(`Node "${def.type}" needs a process() function`);
        if (!CATEGORIES.some(c => c.id === def.category)) throw new Error(`Node "${def.type}" has unknown category "${def.category}"`);

        const normalized = Object.freeze({
            ...def,
            fields: Object.freeze((def.fields || []).map(f => Object.freeze({ ...f }))),
            inputs: Object.freeze(normalizePorts(def.inputs, 'in')),
            outputs: Object.freeze(normalizePorts(def.outputs, 'out')),
        });
        definitions.set(def.type, normalized);
        return normalized;
    }

    function get(type) {
        return definitions.get(type) || null;
    }

    function has(type) {
        return definitions.has(type);
    }

    function all() {
        return [...definitions.values()];
    }

    /** Definitions grouped by category, in panel order. Empty categories are skipped. */
    function byCategory() {
        return CATEGORIES
            .map(category => ({ ...category, nodes: all().filter(d => d.category === category.id) }))
            .filter(group => group.nodes.length > 0);
    }

    function dataInputs(def) {
        return def.inputs.filter(p => p.kind !== 'param');
    }

    function paramInputs(def) {
        return def.inputs.filter(p => p.kind === 'param');
    }

    /** A field's default; `value` may be a function so defaults can depend on the current language. */
    function defaultValue(field) {
        const value = typeof field.value === 'function' ? field.value() : field.value;
        return Array.isArray(value) ? value.map(v => ({ ...v })) : value;
    }

    /** Default values of all fields, keyed by field name. */
    function defaultValues(def) {
        const values = {};
        for (const field of def.fields) values[field.name] = defaultValue(field);
        return values;
    }

    function translate(key) {
        return (typeof i18n !== 'undefined' && key) ? i18n.t(key) : (key || '');
    }

    /** A translated, UI-ready snapshot of a definition: labels resolved through i18n. */
    function template(type) {
        const def = get(type);
        if (!def) return null;
        return {
            type: def.type,
            title: translate(def.title),
            icon: def.icon,
            color: def.color,
            fields: def.fields.map(field => ({
                ...field,
                value: defaultValue(field),
                label: translate(field.label),
                tooltip: field.tooltip ? translate(field.tooltip) : undefined,
                options: field.options ? field.options.map(o => ({ value: o.value, label: translate(o.label) })) : undefined,
            })),
            inputs: def.inputs.map(port => ({ ...port, label: port.label ? translate(port.label) : '' })),
            outputs: def.outputs.map(port => ({ ...port, label: port.label ? translate(port.label) : '' })),
        };
    }

    return Object.freeze({ CATEGORIES, register, get, has, all, byCategory, dataInputs, paramInputs, defaultValue, defaultValues, template });
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NodeRegistry;
}
