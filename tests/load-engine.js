/**
 * Loads the browser scripts that make up the cipher engine into a Node.js sandbox,
 * so node definitions can be exercised without a DOM.
 */
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const SCRIPTS = [
    'js/core/modules.js',
    'js/core/i18n.js',
    'js/core/text-utils.js',
    'js/core/morse.js',
    'js/core/node-registry.js',
    ...fs.readdirSync(path.join(ROOT, 'js/nodes')).filter(f => f.endsWith('.js')).sort().map(f => `js/nodes/${f}`),
    'js/app/executor.js',
    'js/app/engine-worker.js',
    'js/app/scheme.js',
];

function createSandbox() {
    const sandbox = {
        console, TextEncoder, TextDecoder, btoa, atob, setTimeout, clearTimeout,
        localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
        navigator: { language: 'ru' },
        document: { addEventListener() {}, getElementById: () => null, querySelectorAll: () => [], dispatchEvent() {} },
        module: undefined,
    };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    for (const script of SCRIPTS) {
        const code = fs.readFileSync(path.join(ROOT, script), 'utf8');
        vm.runInContext(code, sandbox, { filename: script });
    }
    return sandbox;
}

const sandbox = createSandbox();
const NodeRegistry = vm.runInContext('NodeRegistry', sandbox);
const TextUtils = vm.runInContext('TextUtils', sandbox);
const ChainExecutor = vm.runInContext('ChainExecutor', sandbox);
const EngineWorker = vm.runInContext('EngineWorker', sandbox);
const i18n = sandbox.window.i18n;

/**
 * Runs a single node in isolation.
 * @param {string} type node type
 * @param {object} fields field values (missing ones take defaults)
 * @param {string|object} entry value(s) on the entry ports
 * @param {{reverse?: boolean, params?: object, sourceText?: string}} options
 */
function runNode(type, fields = {}, entry = '', options = {}) {
    const def = NodeRegistry.get(type);
    if (!def) throw new Error(`Unknown node type ${type}`);
    const ctx = {
        reverse: Boolean(options.reverse),
        fields: { ...NodeRegistry.defaultValues(def), ...fields },
        params: options.params || {},
        t: (key, params) => i18n.t(key, params),
        node: null,
        sourceText: options.sourceText || '',
        isSource: Boolean(options.isSource),
    };
    return def.process(ctx, entry);
}

module.exports = { sandbox, NodeRegistry, TextUtils, ChainExecutor, EngineWorker, i18n, runNode };
