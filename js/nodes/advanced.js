/* Rule-based multi replacement. */

EngineModules.define(() => {
    const { escapeRegExp } = TextUtils;

    function replaceSubstrings(text, rules, caseSensitive) {
        let result = text;
        for (const rule of rules) {
            if (!rule.find) continue;
            const regex = new RegExp(escapeRegExp(rule.find), caseSensitive ? 'g' : 'gi');
            result = result.replace(regex, rule.replace || '');
        }
        return result;
    }

    function replaceWholeWords(text, rules, caseSensitive) {
        const normalize = (s) => caseSensitive ? s : s.toLowerCase();
        return text.split(/(\s+)/).map(part => {
            if (part === '' || /^\s+$/.test(part)) return part;
            const rule = rules.find(r => r.find && normalize(r.find) === normalize(part));
            return rule ? (rule.replace || '') : part;
        }).join('');
    }

    NodeRegistry.register({
        type: 'multi-replacer',
        category: 'advanced',
        icon: 'fas fa-exchange-alt',
        color: '#d946ef',
        title: 'node.multi_replace',
        fields: [
            { name: 'rules', type: 'rules', label: 'param.rules', value: [] },
            { name: 'caseSensitive', type: 'checkbox', label: 'param.case_sensitive', value: false },
            { name: 'wholeWords', type: 'checkbox', label: 'param.whole_words', value: false },
        ],
        process(ctx, text) {
            const rules = Array.isArray(ctx.fields.rules) ? ctx.fields.rules : [];
            if (rules.length === 0) return text;
            const effective = ctx.reverse
                ? [...rules].reverse().map(rule => ({ find: rule.replace, replace: rule.find }))
                : rules;
            return ctx.fields.wholeWords
                ? replaceWholeWords(text, effective, Boolean(ctx.fields.caseSensitive))
                : replaceSubstrings(text, effective, Boolean(ctx.fields.caseSensitive));
        },
        help: {
            title: 'help.algo.multi_replace.title',
            desc: 'help.algo.multi_replace.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.multi_replace.principle' },
                { kind: 'example', title: 'help.algo.multi_replace.example_rules_title', lines: [
                    ['pre', 'help.algo.multi_replace.example_rules'], ['input', 'help.algo.multi_replace.example_input'], ['output', 'help.algo.multi_replace.example_output'],
                ] },
                { kind: 'note', title: 'help.algo.multi_replace.settings_title', lines: [
                    'help.algo.multi_replace.settings_intro',
                    'help.algo.multi_replace.case_sensitive_title', 'help.algo.multi_replace.case_sensitive_off', 'help.algo.multi_replace.case_sensitive_on',
                    'help.algo.multi_replace.whole_words_title', 'help.algo.multi_replace.whole_words_off', 'help.algo.multi_replace.whole_words_on',
                ] },
                { kind: 'note', title: 'help.general.features', lines: ['help.algo.multi_replace.feature1', 'help.algo.multi_replace.feature2'] },
            ],
        },
    });
});
