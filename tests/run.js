/**
 * CipherFlow engine tests. No dependencies: `node tests/run.js`.
 * Covers node round-trips, the graph executor and the worked examples shown in the help.
 */
const { NodeRegistry, ChainExecutor, i18n, runNode } = require('./load-engine');

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
    try {
        fn();
        passed++;
    } catch (error) {
        failed++;
        failures.push(`${name}\n    ${error.message}`);
    }
}

function assertEqual(actual, expected, label = '') {
    if (actual !== expected) {
        throw new Error(`${label ? label + ': ' : ''}expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}

const CORPUS = [
    'Привет мир!', 'Hello World', 'ПРИВЕТ', 'Съешь же ещё этих мягких французских булок, да выпей чаю.',
    'The quick brown fox jumps over the lazy dog 1234567890', 'Первая строка\nВторая строка\nТретья строка',
    'aaaabbbbccccdddd abcabcabc', 'Mixed Текст with Both alphabets', 'x', '',
];

/* ---------- round trips: encrypt in forward mode, decrypt in reverse mode ---------- */

const ROUND_TRIPS = [
    ['caesar', {}], ['caesar', { shift: 17 }],
    ['morse', { supportYo: true }],
    ['braille-cat', { supportYo: true }],
    ['atbash', {}],
    ['base64', {}],
    ['binary', {}],
    ['a1z26', { language: 'ru' }],
    ['reverse', {}], ['reverse', { mode: 'words' }], ['reverse', { mode: 'boustrophedon' }],
    ['navi-terminal', { detailLevel: 'brief' }], ['navi-terminal', { detailLevel: 'standard' }], ['navi-terminal', { detailLevel: 'full' }],
    ['compression', { algorithm: 'lzw' }], ['compression', { algorithm: 'rle' }],
    ['perfect-cipher', { depth: 1, alphabet: 'all' }], ['perfect-cipher', { depth: 5, alphabet: 'all' }],
    ['perfect-cipher', { depth: 3, alphabet: 'ru' }], ['perfect-cipher', { depth: 2, alphabet: 'en' }],
    ['gawr-gura', {}],
    ['math', { operation: 'add', value: 7 }], ['math', { operation: 'multiply', value: 3 }],
    ['planet-enchanter', { language: 'mix' }],
];

// Some nodes normalise their input (case, whitespace); compare after the same normalisation.
const NORMALIZERS = {
    'morse': (s) => s.toUpperCase().replace(/[^А-ЯЁA-Z0-9 .,?'!/()&:;=+\-_"$@\n]/g, '').replace(/\s+/g, ' ').trim(),
    'braille-cat': (s) => s.toUpperCase().replace(/[^А-ЯЁA-Z0-9 .,?'!/()&:;=+\-_"$@\n]/g, '').replace(/\s+/g, ' ').trim(),
    'a1z26': (s) => s.toUpperCase(),
    'gawr-gura': (s) => s.toLowerCase(),
    'planet-enchanter': (s) => s.toLowerCase().replace(/\s+/g, ' ').trim(),
};

for (const [type, fields] of ROUND_TRIPS) {
    for (const text of CORPUS) {
        test(`round trip ${type} ${JSON.stringify(fields)} on ${JSON.stringify(text.slice(0, 20))}`, () => {
            const encrypted = runNode(type, fields, text);
            const decrypted = runNode(type, fields, encrypted, { reverse: true });
            const normalize = NORMALIZERS[type] || ((s) => s);
            assertEqual(normalize(decrypted), normalize(text));
        });
    }
}

const KEYED_ROUND_TRIPS = [
    ['vigenere', {}, 'КОТ'], ['vigenere', { mode: 'beaufort' }, 'LEMON'], ['vigenere', {}, 'lemon'],
    ['complex-substitution', { language: 'ru' }, 'кот'], ['complex-substitution', { language: 'en' }, 'cipher'],
    ['simple-substitution', {}, 'cipher'], ['simple-substitution', {}, 'ключ'],
    ['route-transposition', {}, 'КОД'], ['route-transposition', {}, 'ZEBRA'], ['route-transposition', {}, 'ABCDEFG'],
];
for (const [type, fields, key] of KEYED_ROUND_TRIPS) {
    for (const text of CORPUS) {
        test(`round trip ${type} key=${key} on ${JSON.stringify(text.slice(0, 20))}`, () => {
            const encrypted = runNode(type, fields, text, { params: { key } });
            const decrypted = runNode(type, fields, encrypted, { reverse: true, params: { key } });
            assertEqual(decrypted, text);
        });
    }
}

test('multi-replacer reverses its rules', () => {
    const rules = [{ find: 'а', replace: '@' }, { find: 'о', replace: '0' }];
    const encrypted = runNode('multi-replacer', { rules }, 'молоко и каша');
    assertEqual(encrypted, 'м0л0к0 и к@ш@');
    assertEqual(runNode('multi-replacer', { rules }, encrypted, { reverse: true }), 'молоко и каша');
});

test('stream splitter and merger are inverses', () => {
    for (const mode of ['alternating_chars', 'alternating_words', 'alternating_lines']) {
        const text = mode === 'alternating_lines' ? 'a\nb\nc\nd\ne' : 'один два три четыре пять';
        const parts = runNode('stream-splitter', { mode }, text);
        assertEqual(runNode('stream-merger', { mode }, parts), text, mode);
        assertEqual(runNode('stream-splitter', { mode }, parts, { reverse: true }), text, mode + ' reverse');
    }
});

test('knights cipher hides and recovers the secret', () => {
    const hidden = runNode('knights-cipher', {}, { container: 'Просто текст', secret: 'lain' });
    assertEqual(hidden.replace(/[\u200B\u200C\u200D]/g, ''), 'Просто текст', 'visible text');
    assertEqual(runNode('knights-cipher', {}, hidden, { reverse: true }).secret, 'lain');
});

/* ---------- compression ---------- */

test('LZW shrinks repetitive text and survives unicode', () => {
    const text = 'абв '.repeat(200) + '🙂 done';
    const packed = runNode('compression', { algorithm: 'lzw' }, text);
    if (packed.length >= text.length) throw new Error(`no compression: ${packed.length} >= ${text.length}`);
    assertEqual(runNode('compression', { algorithm: 'lzw' }, packed, { reverse: true }), text);
});

test('LZW handles dictionary growth past 9 bits', () => {
    let text = '';
    for (let i = 0; i < 3000; i++) text += String.fromCharCode(97 + (i * 7) % 26) + String.fromCharCode(97 + (i * 13) % 26);
    const packed = runNode('compression', { algorithm: 'lzw' }, text);
    assertEqual(runNode('compression', { algorithm: 'lzw' }, packed, { reverse: true }), text);
});

test('LZW rejects garbage gracefully', () => {
    const out = runNode('compression', { algorithm: 'lzw', decrypt: true }, 'not base64 at all!!');
    assertEqual(out, i18n.t('error.compression_decode'));
});

/* ---------- perfect cipher ---------- */

test('perfect cipher is deterministic and keeps non-alphabet characters in place', () => {
    const a = runNode('perfect-cipher', { depth: 2, alphabet: 'ru' }, 'привет, мир! 123');
    const b = runNode('perfect-cipher', { depth: 2, alphabet: 'ru' }, 'привет, мир! 123');
    assertEqual(a, b);
    assertEqual(a.replace(/[а-яА-ЯёЁ]/g, '_'), '______, ___! 123');
});

test('perfect cipher has an avalanche effect', () => {
    const base = runNode('perfect-cipher', { depth: 1, alphabet: 'en' }, 'the quick brown fox jumps over the lazy dog');
    const changed = runNode('perfect-cipher', { depth: 1, alphabet: 'en' }, 'the quick brown fox jumps over the lazy dot');
    let differing = 0;
    for (let i = 0; i < base.length; i++) if (base[i] !== changed[i]) differing++;
    if (differing < base.length * 0.6) throw new Error(`only ${differing}/${base.length} characters changed`);
});

test('perfect cipher decrypts only with the same depth', () => {
    const text = 'Депth matters';
    const enc = runNode('perfect-cipher', { depth: 3 }, text);
    assertEqual(runNode('perfect-cipher', { depth: 3 }, enc, { reverse: true }), text);
    if (runNode('perfect-cipher', { depth: 2 }, enc, { reverse: true }) === text) throw new Error('wrong depth decrypted the text');
});

/* ---------- executor ---------- */

const executor = new ChainExecutor((key, params) => i18n.t(key, params));
const node = (id, type, values = {}) => ({ id, type, values });
const link = (from, to, fromPort = 'out', toPort = 'in') => ({ id: `${from}-${to}-${toPort}`, from: { nodeId: from, port: fromPort }, to: { nodeId: to, port: toPort } });

test('executor runs a linear chain both ways', () => {
    const graph = {
        nodes: [node('in', 'input'), node('c', 'caesar', { shift: 3 }), node('out', 'output')],
        connections: [link('in', 'c'), link('c', 'out')],
    };
    assertEqual(executor.run({ ...graph, reverse: false, sourceText: 'abc' }).output, 'def');
    assertEqual(executor.run({ ...graph, reverse: true, sourceText: 'def' }).output, 'abc');
});

test('executor feeds keys forward even in decrypt mode', () => {
    const graph = {
        nodes: [node('in', 'input'), node('key', 'secret-word', { keyword: 'LEMON' }), node('v', 'vigenere'), node('out', 'output')],
        connections: [link('in', 'v', 'out', 'text'), link('key', 'v', 'out', 'key'), link('v', 'out')],
    };
    const encrypted = executor.run({ ...graph, reverse: false, sourceText: 'ATTACKATDAWN' }).output;
    assertEqual(encrypted, 'LXFOPVEFRNHR');
    assertEqual(executor.run({ ...graph, reverse: true, sourceText: encrypted }).output, 'ATTACKATDAWN');
});

test('executor resolves a key produced by a chain', () => {
    const graph = {
        nodes: [node('in', 'input'), node('key', 'secret-word', { keyword: 'lemon' }), node('up', 'case-transform', { mode: 'upper' }), node('v', 'vigenere'), node('out', 'output')],
        connections: [link('in', 'v', 'out', 'text'), link('key', 'up'), link('up', 'v', 'out', 'key'), link('v', 'out')],
    };
    const encrypted = executor.run({ ...graph, reverse: false, sourceText: 'ATTACKATDAWN' }).output;
    assertEqual(encrypted, 'LXFOPVEFRNHR');
    assertEqual(executor.run({ ...graph, reverse: true, sourceText: encrypted }).output, 'ATTACKATDAWN');
});

test('executor routes text to one branch and merges it back', () => {
    const graph = {
        nodes: [node('in', 'input'), node('r', 'text-router', { condition: 'contains_numbers' }), node('c', 'caesar', { shift: 1 }), node('rev', 'reverse'), node('out', 'output')],
        connections: [link('in', 'r'), link('r', 'c', 'true', 'in'), link('r', 'rev', 'false', 'in'), link('c', 'out'), link('rev', 'out')],
    };
    assertEqual(executor.run({ ...graph, reverse: false, sourceText: 'abc1' }).output, 'bcd1');
    assertEqual(executor.run({ ...graph, reverse: false, sourceText: 'abc' }).output, 'cba');
    assertEqual(executor.run({ ...graph, reverse: true, sourceText: 'cba' }).output, 'abc');
});

test('branch merger reunites router branches and stays reversible through numbers-to-words', () => {
    const graph = {
        nodes: [
            node('in', 'input'),
            node('r', 'text-router', { condition: 'contains_numbers' }),
            node('n', 'numbers-to-words', { language: 'en', direction: 'to_words' }),
            node('m', 'branch-merger'),
            node('out', 'output'),
        ],
        connections: [
            link('in', 'r'),
            link('r', 'n', 'true', 'in'),
            link('r', 'm', 'false', 'false'),
            link('n', 'm', 'out', 'true'),
            link('m', 'out'),
        ],
    };
    assertEqual(executor.run({ ...graph, reverse: false, sourceText: 'hello 5' }).output, 'hello five');
    assertEqual(executor.run({ ...graph, reverse: false, sourceText: 'hello' }).output, 'hello');
    assertEqual(executor.run({ ...graph, reverse: true, sourceText: 'hello five' }).output, 'hello 5');
    assertEqual(executor.run({ ...graph, reverse: true, sourceText: 'hello' }).output, 'hello');
});

test('executor splits, transforms and merges streams in both directions', () => {
    const graph = {
        nodes: [node('in', 'input'), node('s', 'stream-splitter'), node('c', 'caesar', { shift: 1 }), node('m', 'stream-merger'), node('out', 'output')],
        connections: [link('in', 's'), link('s', 'c', 'streamA', 'in'), link('s', 'm', 'streamB', 'streamB'), link('c', 'm', 'out', 'streamA'), link('m', 'out')],
    };
    const encrypted = executor.run({ ...graph, reverse: false, sourceText: 'abcdef' }).output;
    assertEqual(encrypted, 'bbddff');
    assertEqual(executor.run({ ...graph, reverse: true, sourceText: encrypted }).output, 'abcdef');
});

test('executor ignores cycles instead of hanging', () => {
    const graph = {
        nodes: [node('in', 'input'), node('a', 'caesar'), node('b', 'reverse'), node('out', 'output')],
        connections: [link('in', 'a'), link('a', 'b'), link('b', 'a'), link('b', 'out')],
    };
    const result = executor.run({ ...graph, reverse: false, sourceText: 'abc' });
    if (typeof result.output !== 'string') throw new Error('no output');
});

test('executor reports node errors instead of aborting', () => {
    const def = NodeRegistry.get('caesar');
    const broken = { ...def, process() { throw new Error('boom'); } };
    const originalError = console.error;
    console.error = () => {};
    try {
        const exit = executor.invoke(node('x', 'caesar'), broken, { reverse: false, sourceText: '', entry: { in: 'a' }, params: {}, entryPorts: def.inputs, exitPorts: def.outputs });
        assertEqual(exit.out, i18n.t('error.node_processing', { message: 'boom' }));
    } finally {
        console.error = originalError;
    }
});

test('executor refuses to produce oversized text', () => {
    const limit = ChainExecutor.MAX_TEXT_LENGTH;
    ChainExecutor.MAX_TEXT_LENGTH = 100;
    try {
        const graph = { nodes: [node('in', 'input'), node('a', 'navi-terminal'), node('out', 'output')], connections: [link('in', 'a'), link('a', 'out')] };
        let message = null;
        try { executor.run({ ...graph, reverse: false, sourceText: 'hello' }); } catch (error) { message = error.message; }
        if (!message || !message.includes('NAVI')) throw new Error(`expected a size error naming the node, got ${JSON.stringify(message)}`);
        message = null;
        try { executor.run({ ...graph, reverse: false, sourceText: 'x'.repeat(101) }); } catch (error) { message = error.message; }
        assertEqual(message, i18n.t('error.source_too_large', { length: '101', limit: '100' }));
    } finally {
        ChainExecutor.MAX_TEXT_LENGTH = limit;
    }
});

/* ---------- worker source: the engine re-assembled from function sources must behave identically ---------- */

test('worker script rebuilt from EngineModules produces the same results', () => {
    const vm = require('vm');
    const { EngineWorker } = require('./load-engine');
    const messages = [];
    const scope = { console, TextEncoder, TextDecoder, btoa, atob, navigator: { language: 'ru' }, postMessage: (m) => messages.push(m) };
    scope.self = scope;
    vm.createContext(scope);
    vm.runInContext(EngineWorker.source(), scope, { filename: 'engine-worker-blob.js' });
    const graph = {
        nodes: [node('in', 'input'), node('k', 'secret-word', { keyword: 'LEMON' }), node('v', 'vigenere'), node('c', 'compression', { algorithm: 'lzw' }), node('p', 'perfect-cipher', { depth: 3 }), node('out', 'output')],
        connections: [link('in', 'v', 'out', 'text'), link('k', 'v', 'out', 'key'), link('v', 'c'), link('c', 'p'), link('p', 'out')],
        reverse: false,
        sourceText: 'ATTACK AT DAWN, Привет!',
    };
    scope.self.onmessage({ data: { id: 7, graph, language: 'en' } });
    const reply = messages[0];
    if (!reply || !reply.ok) throw new Error(`worker replied ${JSON.stringify(reply)}`);
    assertEqual(reply.id, 7);
    assertEqual(reply.output, executor.run(graph).output);
    // errors are translated in the language of the request
    scope.self.onmessage({ data: { id: 8, graph: { ...graph, sourceText: 'x'.repeat(ChainExecutor.MAX_TEXT_LENGTH + 1) }, language: 'en' } });
    assertEqual(messages[1].ok, false);
    if (!messages[1].error.startsWith('The input text is too large')) throw new Error(`unexpected error text: ${messages[1].error}`);
});

/* ---------- scheme format ---------- */

const Scheme = require('vm').runInContext('Scheme', require('./load-engine').sandbox);

test('legacy (v2) schemes are converted: fields, custom titles, named ports, renamed types', () => {
    const legacy = {
        version: '2.0',
        nodes: [
            { id: 'node_0', type: 'input', x: 10, y: 20, data: { title: 'Ввод текста', fields: [{ name: 'text', type: 'textarea', value: 'ignored' }], hasInput: false, hasOutput: true } },
            { id: 'node_1', type: 'rle-compression', x: 30, y: 40, data: { title: 'Моё сжатие', isTitleCustomized: true, fields: [{ name: 'decrypt', type: 'checkbox', value: true }] } },
            { id: 'node_2', type: 'vigenere', x: 50, y: 60, data: { title: 'Шифр Виженера', isTitleCustomized: false, fields: [{ name: 'mode', type: 'select', value: 'beaufort' }] } },
            { id: 'node_3', type: 'unknown-node', x: 0, y: 0, data: {} },
        ],
        connections: [
            { id: 'connection_0', from: 'node_0', to: 'node_1' },
            { id: 'connection_1', from: 'node_1', to: 'node_2', inputName: 'text' },
            { id: 'connection_2', from: 'node_0', to: 'node_3' },
        ],
    };
    const scheme = Scheme.normalize(legacy);
    assertEqual(scheme.nodes.length, 3, 'unknown node dropped');
    assertEqual(scheme.nodes[0].values.text, undefined, 'unknown field dropped');
    assertEqual(scheme.nodes[1].type, 'compression');
    assertEqual(scheme.nodes[1].values.algorithm, 'rle');
    assertEqual(scheme.nodes[1].values.decrypt, true);
    assertEqual(scheme.nodes[1].title, 'Моё сжатие');
    assertEqual(scheme.nodes[2].title, null, 'default title is not stored');
    assertEqual(scheme.nodes[2].values.mode, 'beaufort');
    assertEqual(scheme.connections.length, 2, 'dangling connection dropped');
    assertEqual(JSON.stringify(scheme.connections[1]), JSON.stringify({ id: 'connection_1', from: { node: 'node_1', port: 'out' }, to: { node: 'node_2', port: 'text' } }));
});

test('current schemes survive a stringify/parse round trip', () => {
    const scheme = Scheme.normalize({
        nodes: [{ id: 'a', type: 'caesar', x: 1, y: 2, title: 'X', values: { shift: 7 } }, { id: 'b', type: 'output', x: 3, y: 4, values: {} }],
        connections: [{ id: 'c', from: { node: 'a', port: 'out' }, to: { node: 'b', port: 'in' } }],
    });
    const again = Scheme.parse(Scheme.stringify(scheme));
    if (!Scheme.equal(scheme, again)) throw new Error('round trip changed the scheme');
    assertEqual(again.version, Scheme.VERSION);
});

test('invalid scheme input is rejected', () => {
    let threw = false;
    try { Scheme.normalize({ nodes: 'nope' }); } catch { threw = true; }
    if (!threw) throw new Error('expected an error');
});

/* ---------- help examples must match the engine ---------- */

require('./help-examples')(test, assertEqual, runNode, i18n);

/* ---------- report ---------- */

console.log(`\n${passed} passed, ${failed} failed`);
if (failures.length) {
    console.log('\nFAILURES:\n' + failures.map(f => '  - ' + f).join('\n'));
    process.exit(1);
}
