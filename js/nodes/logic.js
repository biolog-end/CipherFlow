/* Flow control: conditional routing, merging and splitting of text streams. */

EngineModules.define(() => {
    const STREAM_A = { name: 'streamA', label: 'input.stream_a', color: '#3b82f6' };
    const STREAM_B = { name: 'streamB', label: 'input.stream_b', color: '#f59e0b' };
    const MODE_OPTIONS = (prefix) => [
        { value: 'alternating_chars', label: `option.${prefix}_chars` },
        { value: 'alternating_words', label: `option.${prefix}_words` },
        { value: 'alternating_lines', label: `option.${prefix}_lines` },
    ];

    const CONDITIONS = {
        contains_numbers: (text) => /\d/.test(text),
        no_numbers: (text) => !/\d/.test(text),
        contains_latin: (text) => /[a-zA-Z]/.test(text),
        no_latin: (text) => !/[a-zA-Z]/.test(text),
        contains_cyrillic: (text) => /[а-яё]/i.test(text),
        no_cyrillic: (text) => !/[а-яё]/i.test(text),
        contains_text: (text, search) => text.toLowerCase().includes(search.toLowerCase()),
        regex_match: (text, search) => {
            try { return new RegExp(search, 'i').test(text); } catch { return false; }
        },
    };

    NodeRegistry.register({
        type: 'text-router',
        category: 'logic',
        icon: 'fas fa-sitemap',
        color: '#0ea5e9',
        title: 'node.text_router',
        fields: [
            { name: 'condition', type: 'select', label: 'param.condition', value: 'contains_numbers', options: [
                { value: 'contains_numbers', label: 'option.contains_numbers' }, { value: 'no_numbers', label: 'option.no_numbers' },
                { value: 'contains_latin', label: 'option.contains_latin' }, { value: 'no_latin', label: 'option.no_latin' },
                { value: 'contains_cyrillic', label: 'option.contains_cyrillic' }, { value: 'no_cyrillic', label: 'option.no_cyrillic' },
                { value: 'contains_text', label: 'option.contains_text' }, { value: 'regex_match', label: 'option.regex_match' },
            ] },
            { name: 'searchText', type: 'text', label: 'param.search', value: '', showWhen: { field: 'condition', values: ['contains_text', 'regex_match'] } },
        ],
        outputs: [
            { name: 'true', label: 'output.if_true', color: '#22c55e' },
            { name: 'false', label: 'output.if_false', color: '#ef4444' },
        ],
        process(ctx, entry) {
            const check = CONDITIONS[ctx.fields.condition] || CONDITIONS.contains_numbers;
            const search = ctx.fields.searchText || '';
            if (ctx.reverse) {
                if (typeof entry === 'string') return entry;
                // Both branches flow back into one input. The plaintext must satisfy the condition
                // of the branch it originally took, so that is how the right candidate is picked.
                const viaTrue = entry.true || '';
                const viaFalse = entry.false || '';
                if (viaTrue && check(viaTrue, search)) return viaTrue;
                if (viaFalse && !check(viaFalse, search)) return viaFalse;
                return viaTrue || viaFalse;
            }
            const met = check(entry, search);
            return { true: met ? entry : '', false: met ? '' : entry };
        },
        help: {
            title: 'help.algo.text_router.title',
            desc: 'help.algo.text_router.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.text_router.principle' },
                { kind: 'example', title: 'help.algo.text_router.conditions_title', lines: [
                    ['input', 'help.algo.text_router.condition1'], ['input', 'help.algo.text_router.condition2'], ['input', 'help.algo.text_router.condition3'],
                    ['input', 'help.algo.text_router.condition4'], ['input', 'help.algo.text_router.condition5'], ['output', 'help.algo.text_router.usage_tip'],
                ] },
                { kind: 'note', title: 'help.general.features', lines: ['help.algo.text_router.feature1', 'help.algo.text_router.feature2', 'help.algo.text_router.feature3'] },
            ],
        },
    });

    const interleave = (a, b) => {
        const result = [];
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
            if (i < a.length) result.push(a[i]);
            if (i < b.length) result.push(b[i]);
        }
        return result;
    };
    const deinterleave = (items) => ({
        a: items.filter((_, i) => i % 2 === 0),
        b: items.filter((_, i) => i % 2 === 1),
    });
    const words = (text) => text.split(/\s+/).filter(Boolean);

    function merge(streamA, streamB, mode) {
        switch (mode) {
            case 'alternating_words': return interleave(words(streamA), words(streamB)).join(' ');
            case 'alternating_lines': return interleave(streamA.split('\n'), streamB.split('\n')).filter(Boolean).join('\n');
            default: return interleave([...streamA], [...streamB]).join('');
        }
    }

    function split(text, mode) {
        switch (mode) {
            case 'alternating_words': {
                const { a, b } = deinterleave(words(text));
                return { streamA: a.join(' '), streamB: b.join(' ') };
            }
            case 'alternating_lines': {
                const { a, b } = deinterleave(text.split('\n'));
                return { streamA: a.join('\n'), streamB: b.join('\n') };
            }
            default: {
                const { a, b } = deinterleave([...text]);
                return { streamA: a.join(''), streamB: b.join('') };
            }
        }
    }

    NodeRegistry.register({
        type: 'stream-merger',
        category: 'logic',
        icon: 'fas fa-link',
        color: '#f97316',
        title: 'node.stream_merger',
        fields: [
            { name: 'mode', type: 'select', label: 'param.merge_mode', value: 'alternating_chars', options: MODE_OPTIONS('alt') },
        ],
        inputs: [STREAM_A, STREAM_B],
        process(ctx, entry) {
            if (ctx.reverse) return split(entry, ctx.fields.mode);
            return merge(entry.streamA || '', entry.streamB || '', ctx.fields.mode);
        },
        help: {
            title: 'help.algo.stream_merger.title',
            desc: 'help.algo.stream_merger.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.stream_merger.principle' },
                { kind: 'example', title: 'help.algo.stream_merger.methods_title', lines: [
                    ['input', 'help.algo.stream_merger.method1_title'], ['output', 'help.algo.stream_merger.method1_example'],
                    ['input', 'help.algo.stream_merger.method2_title'], ['output', 'help.algo.stream_merger.method2_example'],
                    ['input', 'help.algo.stream_merger.method3_title'], ['output', 'help.algo.stream_merger.method3_example'],
                ] },
                { kind: 'note', title: 'help.general.features', lines: ['help.algo.stream_merger.feature1', 'help.algo.stream_merger.feature2', 'help.algo.stream_merger.feature3'] },
            ],
        },
    });

    NodeRegistry.register({
        type: 'stream-splitter',
        category: 'logic',
        icon: 'fas fa-cut',
        color: '#9333ea',
        title: 'node.stream_splitter',
        fields: [
            { name: 'mode', type: 'select', label: 'param.split_mode', value: 'alternating_chars', options: MODE_OPTIONS('split') },
        ],
        outputs: [STREAM_A, STREAM_B],
        process(ctx, entry) {
            if (ctx.reverse) return merge(entry.streamA || '', entry.streamB || '', ctx.fields.mode);
            return split(entry, ctx.fields.mode);
        },
        help: {
            title: 'help.algo.stream_splitter.title',
            desc: 'help.algo.stream_splitter.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.stream_splitter.principle' },
                { kind: 'example', title: 'help.algo.stream_splitter.methods_title', lines: [
                    ['input', 'help.algo.stream_splitter.method1_title'], ['output', 'help.algo.stream_splitter.method1_example'],
                    ['input', 'help.algo.stream_splitter.method2_title'], ['output', 'help.algo.stream_splitter.method2_example'],
                    ['input', 'help.algo.stream_splitter.method3_title'], ['output', 'help.algo.stream_splitter.method3_example'],
                ] },
                { kind: 'note', title: 'help.general.features', lines: ['help.algo.stream_splitter.feature1', 'help.algo.stream_splitter.feature2', 'help.algo.stream_splitter.feature3'] },
            ],
        },
    });
});
