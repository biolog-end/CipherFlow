/**
 * Every worked example in the help must be reproducible by the engine.
 * Each case: node type, field values, input, and the i18n key whose text must contain the real output.
 * `en` overrides input/params/fields for the English help, which uses its own examples.
 */
module.exports = function registerHelpExampleTests(test, assertEqual, runNode, i18n) {
    const RULES_RU = [{ find: 'а', replace: '@' }, { find: 'е', replace: '3' }, { find: 'о', replace: '0' }, { find: 'кот', replace: 'cat' }];
    const RULES_EN = [{ find: 'a', replace: '@' }, { find: 'e', replace: '3' }, { find: 'o', replace: '0' }, { find: 'cat', replace: 'dog' }];

    const CASES = [
        { type: 'caesar', fields: { shift: 3 }, input: 'ПРИВЕТ', key: 'help.algo.caesar_output', en: { input: 'HELLO' } },
        { type: 'caesar', fields: { shift: 3 }, input: 'ПРИВЕТ', key: 'help.examples.basic_encryption.scheme_result', en: { input: 'HELLO' } },
        { type: 'braille-cat', input: 'КОТ', key: 'help.examples.fun.scheme_result' },
        { type: 'morse', input: 'ПРИВЕТ SOS', key: 'help.algo.morse_output', en: { input: 'HELLO SOS' } },
        { type: 'morse', input: 'ЁЛЬ', key: 'help.algo.morse_yo_without' },
        { type: 'morse', input: 'ЁЛЬ', key: 'help.dataloss.morse.example_output' },
        { type: 'morse', fields: { supportYo: true }, input: 'ЁЛЬ', key: 'help.algo.morse_yo_with' },
        { type: 'braille-cat', input: 'КОТ', key: 'help.algo.morse_cat_output' },
        { type: 'braille-cat', fields: { supportYo: true }, input: 'Ё', key: 'help.algo.morse_cat_yo_example' },
        { type: 'a1z26', fields: { language: 'ru' }, input: 'КОТ', key: 'help.algo.a1z26_output', en: { fields: { language: 'en' }, input: 'CAT' } },
        { type: 'a1z26', fields: { language: 'ru' }, input: 'А1Б', key: 'help.dataloss.a1z26.example1', en: { fields: { language: 'en' }, input: 'A1B' } },
        { type: 'vigenere', input: 'ПРИВЕТ', params: { key: 'КОТ' }, key: 'help.algo.vigenere_result', en: { input: 'HELLO', params: { key: 'KEY' } } },
        { type: 'vigenere', fields: { mode: 'beaufort' }, input: 'ПРИВЕТ', params: { key: 'КОТ' }, key: 'help.algo.beaufort_result', en: { input: 'HELLO', params: { key: 'KEY' } } },
        { type: 'complex-substitution', fields: { language: 'ru' }, input: 'бак', params: { key: 'Кот!#' }, key: 'help.algo.complex_substitution.example_encrypt', en: { fields: { language: 'en' }, input: 'bag', params: { key: 'Cat!#' } } },
        { type: 'simple-substitution', input: 'attack', params: { key: 'cipher' }, key: 'help.algo.simple_substitution.example_encrypt' },
        { type: 'route-transposition', input: 'ПРИВЕТСТВУЮ', params: { key: 'КОД' }, key: 'help.algo.route_transposition.example_result', en: { input: 'HELLOWORLD', params: { key: 'KEY' } } },
        { type: 'compression', fields: { algorithm: 'rle' }, input: 'ААААААБББВВГГГГГ', key: 'help.algo.compression.rle_example_output', en: { input: 'AAAAAABBBCCDDDDD' } },
        { type: 'compression', fields: { algorithm: 'lzw' }, input: 'абракадабра абракадабра абракадабра', key: 'help.algo.compression.lzw_example_output' },
        { type: 'numbers-to-words', fields: { language: 'ru' }, input: 'Мой код: 123', key: 'help.algo.numbers_to_words.example_ru_output' },
        { type: 'numbers-to-words', fields: { language: 'en' }, input: 'I have 7 cats', key: 'help.algo.numbers_to_words.example_en_output' },
        { type: 'numbers-to-words', fields: { language: 'ru' }, input: 'У меня 5 или пять яблок', key: 'help.dataloss.numbers.example_output', en: { fields: { language: 'en' }, input: 'I have 5 or five apples' } },
        { type: 'math', fields: { operation: 'multiply', value: 2 }, input: 'У меня 5 котов и 12 собак', key: 'help.algo.math.example_output', en: { input: 'I have 5 cats and 12 dogs' } },
        { type: 'math', fields: { operation: 'divide', value: 3 }, input: '10', key: 'help.dataloss.math.example_result' },
        { type: 'reverse', input: 'ПРИВЕТ МИР', key: 'help.algo.reverse.mode_full_output', en: { input: 'HELLO WORLD' } },
        { type: 'reverse', fields: { mode: 'words' }, input: 'ПРИВЕТ МИР', key: 'help.algo.reverse.mode_words_output', en: { input: 'HELLO WORLD' } },
        { type: 'reverse', fields: { mode: 'boustrophedon' }, input: 'Первая строка\nВторая строка\nТретья строка', key: 'help.algo.reverse.mode_snake_output', en: { input: 'First line\nSecond line\nThird line' } },
        { type: 'case-transform', fields: { mode: 'title' }, input: 'привет мир', key: 'help.algo.case.mode_title', en: { input: 'hello world' } },
        { type: 'case-transform', fields: { mode: 'toggle' }, input: 'ПрИвЕт', key: 'help.algo.case.mode_toggle', en: { input: 'HeLlO' } },
        { type: 'binary', input: 'A', key: 'help.algo.binary.example_output' },
        { type: 'planet-enchanter', fields: { language: 'ru' }, input: 'МИР', key: 'help.algo.planet_enchanter.example_output', perLine: true, en: { fields: { language: 'en' }, input: 'MAP' } },
        { type: 'multi-replacer', fields: { rules: RULES_RU }, input: 'Привет кот', key: 'help.algo.multi_replace.example_output', en: { fields: { rules: RULES_EN }, input: 'Hello cat' } },
        { type: 'atbash', input: 'ПРИВЕТ', key: 'help.algo.atbash.example_output', en: { input: 'HELLO' } },
        { type: 'base64', input: 'Привет', key: 'help.algo.base64.example_output', en: { input: 'Hello' } },
        { type: 'gawr-gura', input: 'привет мир', key: 'help.algo.shark.example_ru_result' },
        { type: 'gawr-gura', input: 'cat', key: 'help.algo.shark.example_en_result' },
        { type: 'uwu-ifier', input: 'Привет мир', key: 'help.algo.uwu.example_output', en: { input: 'Hello world' } },
        { type: 'navi-terminal', fields: { detailLevel: 'standard' }, input: 'LAIN', key: 'help.algo.navi_terminal.example_output' },
        { type: 'perfect-cipher', fields: { depth: 1, alphabet: 'ru' }, input: 'ПРИВЕТ', key: 'help.algo.perfect.example_output', en: { fields: { depth: 1, alphabet: 'en' }, input: 'HELLO' } },
        { type: 'perfect-cipher', fields: { depth: 1, alphabet: 'ru' }, input: 'ПРИВЕС', key: 'help.algo.perfect.example_avalanche', en: { fields: { depth: 1, alphabet: 'en' }, input: 'HELLP' } },
        { type: 'stream-merger', input: { streamA: 'АВС', streamB: '123' }, key: 'help.algo.stream_merger.method1_example', en: { input: { streamA: 'ABC', streamB: '123' } } },
        { type: 'stream-merger', fields: { mode: 'alternating_words' }, input: { streamA: 'раз два', streamB: 'три четыре' }, key: 'help.algo.stream_merger.method2_example', en: { input: { streamA: 'one two', streamB: 'three four' } } },
        { type: 'stream-merger', input: { streamA: 'АБ', streamB: '123' }, key: 'help.dataloss.merger.example_output', en: { input: { streamA: 'AB', streamB: '123' } } },
    ];

    for (const lang of i18n.getSupportedLanguages()) {
        for (const base of CASES) {
            const c = { ...base, ...(lang !== 'ru' && base[lang] ? base[lang] : {}) };
            test(`help example [${lang}] ${c.key}`, () => {
                const output = runNode(c.type, c.fields || {}, c.input, { params: c.params || {} });
                const text = i18n.translations[lang][c.key];
                if (typeof text !== 'string') throw new Error(`missing translation ${c.key}`);
                const expected = typeof output === 'string' ? output : Object.values(output).join(' / ');
                // help texts add explanations around the value, so containment is what we check;
                // multi-line examples are annotated per line, so each line is checked on its own
                const haystack = text.replace(/\\n/g, '\n');
                const contained = c.perLine
                    ? expected.split('\n').every(line => haystack.split('\n').some(t => t.includes(line)))
                    : haystack.includes(expected);
                if (!contained) {
                    throw new Error(`help text ${JSON.stringify(text)} does not contain engine output ${JSON.stringify(expected)}`);
                }
            });
        }
    }
};
