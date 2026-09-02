/* Text transformations: numbers ↔ words, arithmetic, reversing, case, binary, cat-morse. */

EngineModules.define(() => {
    const { resolveDirection, toNumber, escapeRegExp, lcgRandom } = TextUtils;

    const NUMBERS = {
        ru: { '0': 'ноль', '1': 'один', '2': 'два', '3': 'три', '4': 'четыре', '5': 'пять', '6': 'шесть', '7': 'семь', '8': 'восемь', '9': 'девять' },
        en: { '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine' },
    };
    const WORDS_TO_DIGITS = [...Object.entries(NUMBERS.ru), ...Object.entries(NUMBERS.en)]
        .map(([digit, word]) => [word, digit])
        .sort((a, b) => b[0].length - a[0].length);

    NodeRegistry.register({
        type: 'numbers-to-words',
        category: 'transform',
        icon: 'fas fa-hashtag',
        color: '#84cc16',
        title: 'node.numbers_to_words',
        fields: [
            { name: 'language', type: 'select', label: 'param.language', value: 'ru', options: [
                { value: 'ru', label: 'option.russian' }, { value: 'en', label: 'option.english' }, { value: 'mix', label: 'option.mix' },
            ] },
            { name: 'mode', type: 'select', label: 'param.direction', value: 'to_words', options: [
                { value: 'to_words', label: 'option.to_words' }, { value: 'to_numbers', label: 'option.to_numbers' },
            ] },
        ],
        process(ctx, text) {
            if (resolveDirection(ctx.fields.mode, ctx.reverse, 'to_words', 'to_numbers') === 'to_words') {
                if (ctx.fields.language === 'mix') {
                    const random = lcgRandom(42);
                    return text.replace(/\d/g, digit => (random() > 0.5 ? NUMBERS.ru : NUMBERS.en)[digit]);
                }
                const dict = NUMBERS[ctx.fields.language] || NUMBERS.ru;
                return text.replace(/\d/g, digit => dict[digit]);
            }
            let result = text;
            for (const [word, digit] of WORDS_TO_DIGITS) {
                result = result.replace(new RegExp(escapeRegExp(word), 'gi'), digit);
            }
            return result;
        },
        help: {
            title: 'help.algo.numbers_to_words.title',
            desc: 'help.algo.numbers_to_words.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.numbers_to_words.principle' },
                { kind: 'example', title: 'help.algo.numbers_to_words.example_ru_title', lines: [['input', 'help.algo.numbers_to_words.example_ru_input'], ['output', 'help.algo.numbers_to_words.example_ru_output']] },
                { kind: 'example', title: 'help.algo.numbers_to_words.example_en_title', lines: [['input', 'help.algo.numbers_to_words.example_en_input'], ['output', 'help.algo.numbers_to_words.example_en_output']] },
            ],
        },
    });

    NodeRegistry.register({
        type: 'math',
        category: 'transform',
        icon: 'fas fa-calculator',
        color: '#facc15',
        title: 'node.math',
        fields: [
            { name: 'operation', type: 'select', label: 'param.operation', value: 'add', options: [
                { value: 'add', label: 'option.add' }, { value: 'subtract', label: 'option.subtract' },
                { value: 'multiply', label: 'option.multiply' }, { value: 'divide', label: 'option.divide' },
            ] },
            { name: 'value', type: 'number', label: 'param.value', value: 1 },
        ],
        process(ctx, text) {
            const value = toNumber(ctx.fields.value, 1);
            const operation = ctx.fields.operation;
            const reverse = ctx.reverse;
            return text.replace(/\d+(\.\d+)?/g, match => {
                const num = parseFloat(match);
                switch (operation) {
                    case 'add': return String(reverse ? num - value : num + value);
                    case 'subtract': return String(reverse ? num + value : num - value);
                    case 'multiply':
                        if (value === 0) return reverse ? ctx.t('error.division_by_zero') : '0';
                        return String(reverse ? num / value : num * value);
                    case 'divide':
                        if (value === 0) return reverse ? '0' : ctx.t('error.division_by_zero');
                        return String(reverse ? num * value : num / value);
                    default: return match;
                }
            });
        },
        help: {
            title: 'help.algo.math.title',
            desc: 'help.algo.math.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.math.principle' },
                { kind: 'example', title: 'help.algo.math.example_title', lines: [['input', 'help.algo.math.example_input'], ['output', 'help.algo.math.example_output']] },
                { kind: 'note', title: 'help.algo.math.features_title', lines: ['help.algo.math.feature1', 'help.algo.math.feature2'] },
            ],
        },
    });

    const reverseString = (s) => [...s].reverse().join('');

    NodeRegistry.register({
        type: 'reverse',
        category: 'transform',
        icon: 'fas fa-undo',
        color: '#fb923c',
        title: 'node.reverse_text',
        fields: [
            { name: 'mode', type: 'select', label: 'param.mode', value: 'full', options: [
                { value: 'full', label: 'option.full' }, { value: 'words', label: 'option.words' }, { value: 'boustrophedon', label: 'option.boustrophedon' },
            ] },
        ],
        process(ctx, text) {
            switch (ctx.fields.mode) {
                case 'words':
                    return text.split(' ').map(reverseString).join(' ');
                case 'boustrophedon':
                    return text.split('\n').map((line, index) => index % 2 === 1 ? reverseString(line) : line).join('\n');
                default:
                    return reverseString(text);
            }
        },
        help: {
            title: 'help.algo.reverse.title',
            desc: 'help.algo.reverse.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.reverse.principle' },
                { kind: 'example', title: 'help.algo.reverse.mode_full_title', lines: [['input', 'help.algo.reverse.mode_full_input'], ['output', 'help.algo.reverse.mode_full_output']] },
                { kind: 'example', title: 'help.algo.reverse.mode_words_title', lines: [['input', 'help.algo.reverse.mode_words_input'], ['output', 'help.algo.reverse.mode_words_output']] },
                { kind: 'example', title: 'help.algo.reverse.mode_snake_title', lines: [['pre', 'help.algo.reverse.mode_snake_input'], ['pre-output', 'help.algo.reverse.mode_snake_output']] },
                { kind: 'note', title: 'help.algo.reverse.snake_title', lines: ['help.algo.reverse.snake_feature1', 'help.algo.reverse.snake_feature2', 'help.algo.reverse.snake_feature3'] },
            ],
        },
    });

    NodeRegistry.register({
        type: 'case-transform',
        category: 'transform',
        icon: 'fas fa-text-height',
        color: '#c084fc',
        title: 'node.case_transform',
        fields: [
            { name: 'mode', type: 'select', label: 'param.mode', value: 'upper', options: [
                { value: 'upper', label: 'option.upper' }, { value: 'lower', label: 'option.lower' },
                { value: 'title', label: 'option.title' }, { value: 'toggle', label: 'option.toggle' },
            ] },
        ],
        process(ctx, text) {
            switch (ctx.fields.mode) {
                case 'lower': return text.toLowerCase();
                case 'title': return text.replace(/\S+/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
                case 'toggle': return [...text].map(ch => ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()).join('');
                default: return text.toUpperCase();
            }
        },
        help: {
            title: 'help.algo.case.title',
            desc: 'help.algo.case.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.case.principle' },
                { kind: 'example', title: 'help.algo.case.modes_title', lines: [
                    ['input', 'help.algo.case.mode_upper'], ['input', 'help.algo.case.mode_lower'], ['input', 'help.algo.case.mode_title'], ['input', 'help.algo.case.mode_toggle'],
                ] },
            ],
        },
    });

    NodeRegistry.register({
        type: 'binary',
        category: 'transform',
        icon: 'fas fa-microchip',
        color: '#3b82f6',
        title: 'node.binary_code',
        fields: [
            { name: 'mode', type: 'select', label: 'param.mode', value: 'encode', options: [
                { value: 'encode', label: 'option.encode' }, { value: 'decode', label: 'option.decode' },
            ] },
        ],
        process(ctx, text) {
            if (resolveDirection(ctx.fields.mode, ctx.reverse) === 'encode') {
                return Array.from(new TextEncoder().encode(text), byte => byte.toString(2).padStart(8, '0')).join(' ');
            }
            if (!text.trim()) return '';
            const bytes = text.match(/[01]{8}/g);
            if (!bytes) return ctx.t('error.invalid_binary_input');
            try {
                return new TextDecoder('utf-8').decode(new Uint8Array(bytes.map(b => parseInt(b, 2))));
            } catch (e) {
                return ctx.t('error.binary_decode', { message: e.message });
            }
        },
        help: {
            title: 'help.algo.binary.title',
            desc: 'help.algo.binary.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.binary.principle' },
                { kind: 'example', title: 'help.algo.binary.example_title', lines: [['input', 'help.algo.binary.example_input'], ['output', 'help.algo.binary.example_output']] },
                { kind: 'note', title: 'help.general.features', lines: ['help.algo.binary.feature1', 'help.algo.binary.feature2'] },
            ],
        },
    });

    const CAT_TOKENS = [['мрряу', '−'], ['myau', '-'], ['мяу', '·'], ['nyan', '.']];

    function decodeCatWord(word) {
        let result = '';
        let rest = word;
        while (rest.length > 0) {
            const token = CAT_TOKENS.find(([sound]) => rest.startsWith(sound));
            if (token) {
                result += token[1];
                rest = rest.slice(token[0].length);
            } else {
                rest = rest.slice(1);
            }
        }
        return result;
    }

    NodeRegistry.register({
        type: 'braille-cat',
        category: 'transform',
        icon: 'fas fa-cat',
        color: '#f472b6',
        title: 'node.morse_cat',
        fields: [
            { name: 'mode', type: 'select', label: 'param.mode', value: 'encode', options: [
                { value: 'encode', label: 'option.text_to_cat' }, { value: 'decode', label: 'option.cat_to_text' },
            ] },
            { name: 'supportYo', type: 'checkbox', label: 'option.yo_support_cat', value: false, tooltip: 'param.yo_tooltip' },
        ],
        process(ctx, text) {
            const supportYo = ctx.fields.supportYo === true || ctx.fields.supportYo === 'true';
            if (resolveDirection(ctx.fields.mode, ctx.reverse) === 'encode') {
                return Morse.encode(text, supportYo)
                    .replace(/\//g, ' брряу ')
                    .replace(/·/g, 'мяу')
                    .replace(/−/g, 'мрряу')
                    .replace(/\./g, 'nyan')
                    .replace(/-/g, 'myau')
                    .replace(/ +/g, ' ')
                    .trim();
            }
            const morse = text.toLowerCase().trim().split('\n').map(line =>
                line.split(/\s+/).map(word => word === 'брряу' ? '/' : decodeCatWord(word)).join(' ')
            ).join('\n');
            return Morse.decode(morse, supportYo);
        },
        help: {
            title: 'help.algo.morse_cat',
            desc: 'help.algo.morse_cat_desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.morse_cat_principle' },
                { kind: 'example', title: 'help.algo.morse_cat_replacements', lines: [
                    ['input', 'help.algo.morse_cat_dot'], ['input', 'help.algo.morse_cat_dash'], ['input', 'help.algo.morse_cat_space'],
                ] },
                { kind: 'example', title: 'help.algo.morse_cat_example', lines: [
                    ['input', 'help.algo.morse_cat_input'], ['output', 'help.algo.morse_cat_morse'], ['output', 'help.algo.morse_cat_output'],
                ] },
                { kind: 'note', title: 'help.algo.morse_cat_yo', lines: ['help.algo.morse_cat_yo_desc', 'help.algo.morse_cat_yo_example'] },
            ],
        },
    });
});
