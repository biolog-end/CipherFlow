/* Input / output terminals, key source and utility nodes. */

EngineModules.define(() => {
    NodeRegistry.register({
        type: 'input',
        category: 'io',
        icon: 'fas fa-sign-in-alt',
        color: '#10b981',
        title: 'node.text_input',
        role: 'input',
        inputs: [],
        process(ctx, entry) {
            return ctx.isSource ? ctx.sourceText : entry;
        },
        help: {
            title: 'help.algo.text_input',
            desc: 'help.algo.text_input_desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.text_input_principle' },
                { kind: 'example', title: 'help.algo.text_input_usage', lines: [
                    ['input', 'help.algo.text_input_step1'], ['input', 'help.algo.text_input_step2'], ['output', 'help.algo.text_input_result'],
                ] },
                { kind: 'note', title: 'help.algo.text_input_features', lines: ['help.algo.text_input_feature1', 'help.algo.text_input_feature2', 'help.algo.text_input_feature3'] },
            ],
        },
    });

    NodeRegistry.register({
        type: 'output',
        category: 'io',
        icon: 'fas fa-sign-out-alt',
        color: '#f59e0b',
        title: 'node.text_output',
        role: 'output',
        outputs: [],
        process(ctx, entry) {
            return ctx.isSource ? ctx.sourceText : entry;
        },
        help: {
            title: 'help.algo.text_output',
            desc: 'help.algo.text_output_desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.text_output_principle' },
                { kind: 'example', title: 'help.algo.text_output_usage', lines: [
                    ['input', 'help.algo.text_output_step1'], ['input', 'help.algo.text_output_step2'], ['output', 'help.algo.text_output_result'],
                ] },
                { kind: 'note', title: 'help.algo.text_output_features', lines: ['help.algo.text_output_feature1', 'help.algo.text_output_feature2', 'help.algo.text_output_feature3'] },
            ],
        },
    });

    NodeRegistry.register({
        type: 'secret-word',
        category: 'classic',
        icon: 'fas fa-key',
        color: '#f87171',
        title: 'node.secret_word',
        inputs: [],
        fields: [
            { name: 'keyword', type: 'text', label: 'param.keyword', value: () => i18n.t('param.default_keyword') },
        ],
        process(ctx) {
            return ctx.fields.keyword || '';
        },
        help: {
            title: 'help.algo.secret_word',
            desc: 'help.algo.secret_word_desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.secret_word_principle' },
                { kind: 'example', title: 'help.algo.secret_word_example', lines: [['input', 'help.algo.secret_word_input'], ['output', 'help.algo.secret_word_usage']] },
            ],
        },
    });

    NodeRegistry.register({
        type: 'monitor',
        category: 'utility',
        icon: 'fas fa-desktop',
        color: '#64748b',
        title: 'node.monitor',
        monitor: true,
        process(ctx, entry) {
            return entry;
        },
        help: {
            title: 'help.algo.monitor.title',
            desc: 'help.algo.monitor.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.monitor.principle' },
                { kind: 'example', title: 'help.algo.monitor.usage_title', lines: [['input', 'help.algo.monitor.usage_desc'], ['output', 'help.algo.monitor.result']] },
            ],
        },
    });

    NodeRegistry.register({
        type: 'comment',
        category: 'utility',
        icon: 'fas fa-comment-alt',
        color: '#9ca3af',
        title: 'node.comment',
        inputs: [],
        outputs: [],
        fields: [
            { name: 'commentText', type: 'textarea', label: '', value: '', rows: 4 },
        ],
        process() {
            return '';
        },
        help: {
            title: 'help.algo.comment.title',
            desc: 'help.algo.comment.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.comment.principle' },
                { kind: 'example', title: 'help.algo.comment.usage_title', lines: [
                    ['input', 'help.algo.comment.usage_step1'], ['input', 'help.algo.comment.usage_step2'], ['input', 'help.algo.comment.usage_step3'],
                ] },
                { kind: 'note', title: 'help.general.features', lines: ['help.algo.comment.feature1', 'help.algo.comment.feature2', 'help.algo.comment.feature3'] },
            ],
        },
    });
});
