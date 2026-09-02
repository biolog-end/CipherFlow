/* Classic ciphers: Caesar, Morse, Vigenère/Beaufort, substitution ciphers, A1Z26, route transposition. */

EngineModules.define(() => {
    const { RU_LOWER, RU_UPPER, EN_LOWER, EN_UPPER, resolveDirection, toNumber, applySubstitution, substitutionMap, uniqueChars } = TextUtils;

    const ENCODE_DECODE_OPTIONS = [
        { value: 'encode', label: 'option.encode' },
        { value: 'decode', label: 'option.decode' },
    ];
    const TEXT_PORT = { name: 'text', label: 'option.text_input', color: '#3b82f6' };
    const KEY_PORT = { name: 'key', label: 'option.key_input', color: '#f59e0b', kind: 'param' };

    /** Fetches the key delivered on the "key" param port; falls back when nothing is connected. */
    function keyParam(ctx, fallback = '') {
        const key = ctx.params.key;
        return (typeof key === 'string' && key.length > 0) ? key : fallback;
    }

    NodeRegistry.register({
        type: 'caesar',
        category: 'classic',
        icon: 'fas fa-exchange-alt',
        color: '#6366f1',
        title: 'node.caesar_cipher',
        fields: [
            { name: 'shift', type: 'number', label: 'param.shift', value: 3, min: 1, max: 32 },
        ],
        process(ctx, text) {
            const shift = toNumber(ctx.fields.shift, 3);
            const actualShift = ctx.reverse ? -shift : shift;
            let result = '';
            for (const char of text) {
                result += TextUtils.shiftInAlphabet(char, actualShift, RU_LOWER, RU_UPPER)
                    ?? TextUtils.shiftInAlphabet(char, actualShift, EN_LOWER, EN_UPPER)
                    ?? char;
            }
            return result;
        },
        help: {
            title: 'help.algo.caesar_cipher',
            desc: 'help.algo.caesar_desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.caesar_principle' },
                { kind: 'example', title: 'help.algo.caesar_example', lines: [['input', 'help.algo.caesar_input'], ['output', 'help.algo.caesar_output']] },
            ],
        },
    });

    NodeRegistry.register({
        type: 'morse',
        category: 'classic',
        icon: 'fas fa-broadcast-tower',
        color: '#8b5cf6',
        title: 'node.morse_code',
        fields: [
            { name: 'mode', type: 'select', label: 'param.operation', value: 'encode', options: ENCODE_DECODE_OPTIONS },
            { name: 'supportYo', type: 'checkbox', label: 'param.yo_support', value: false, tooltip: 'param.yo_tooltip' },
        ],
        process(ctx, text) {
            const supportYo = ctx.fields.supportYo === true || ctx.fields.supportYo === 'true';
            return resolveDirection(ctx.fields.mode, ctx.reverse) === 'encode'
                ? Morse.encode(text, supportYo)
                : Morse.decode(text, supportYo);
        },
        help: {
            title: 'help.algo.morse_code',
            desc: 'help.algo.morse_desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.morse_principle' },
                { kind: 'example', title: 'help.algo.morse_languages', lines: [
                    ['input', 'help.algo.morse_russian'], ['input', 'help.algo.morse_english'], ['output', 'help.algo.morse_distinction'],
                ] },
                { kind: 'example', title: 'help.algo.morse_example', lines: [
                    ['input', 'help.algo.morse_input'], ['output', 'help.algo.morse_output'], ['output', 'help.algo.morse_mix'],
                ] },
                { kind: 'note', title: 'help.algo.morse_yo_setting', lines: ['help.algo.morse_yo_desc', 'help.algo.morse_yo_without', 'help.algo.morse_yo_with'] },
            ],
        },
    });

    function vigenereTransform(text, key, encrypt, mode) {
        if (!key || typeof text !== 'string') return text;
        const cleanKey = key.toUpperCase().split('').filter(ch => RU_UPPER.includes(ch) || EN_UPPER.includes(ch)).join('');
        if (cleanKey.length === 0) return text;

        let result = '';
        let keyIndex = 0;
        for (const char of text) {
            const upper = char.toUpperCase();
            const alphabet = RU_UPPER.includes(upper) ? RU_UPPER : (EN_UPPER.includes(upper) ? EN_UPPER : null);
            if (!alphabet) {
                result += char;
                continue;
            }
            const keyShift = alphabet.indexOf(cleanKey[keyIndex % cleanKey.length]);
            if (keyShift === -1) {
                // key letter belongs to the other alphabet — the character passes through untouched
                result += char;
                continue;
            }
            const charIndex = alphabet.indexOf(upper);
            let newIndex;
            if (mode === 'beaufort') {
                newIndex = (keyShift - charIndex + alphabet.length) % alphabet.length;
            } else if (encrypt) {
                newIndex = (charIndex + keyShift) % alphabet.length;
            } else {
                newIndex = (charIndex - keyShift + alphabet.length) % alphabet.length;
            }
            const newChar = alphabet[newIndex];
            result += char === upper ? newChar : newChar.toLowerCase();
            keyIndex++;
        }
        return result;
    }

    NodeRegistry.register({
        type: 'vigenere',
        category: 'classic',
        icon: 'fas fa-shield-alt',
        color: '#ec4899',
        title: 'node.vigenere_cipher',
        fields: [
            { name: 'mode', type: 'select', label: 'param.cipher_type', value: 'vigenere', options: [
                { value: 'vigenere', label: 'option.vigenere' },
                { value: 'beaufort', label: 'option.beaufort' },
            ] },
        ],
        inputs: [TEXT_PORT, KEY_PORT],
        process(ctx, text) {
            return vigenereTransform(text, keyParam(ctx, 'DEFAULT_KEY'), !ctx.reverse, ctx.fields.mode);
        },
        help: {
            title: 'help.algo.vigenere',
            desc: 'help.algo.vigenere_desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.vigenere_principle' },
                { kind: 'example', title: 'help.algo.vigenere_mode', lines: [
                    ['input', 'help.algo.vigenere_formula'], ['input', 'help.algo.vigenere_text'], ['output', 'help.algo.vigenere_result'],
                ] },
                { kind: 'example', title: 'help.algo.beaufort_mode', lines: [
                    ['input', 'help.algo.beaufort_formula'], ['input', 'help.algo.beaufort_text'], ['output', 'help.algo.beaufort_result'],
                ] },
                { kind: 'note', title: 'help.algo.beaufort_title', lines: ['help.algo.beaufort_feature1', 'help.algo.beaufort_feature2', 'help.algo.beaufort_feature3'] },
                { kind: 'note', title: 'help.general.features', lines: ['help.algo.vigenere_feature1', 'help.algo.vigenere_feature2', 'help.algo.vigenere_feature3'] },
            ],
        },
    });

    function complexSubstitutionAlphabet(key, base) {
        if (!key) return base;
        const alphabetPart = [];
        const otherPart = [];
        for (const char of uniqueChars(key.toLowerCase())) {
            (base.includes(char) ? alphabetPart : otherPart).push(char);
        }
        const remaining = base.split('').filter(ch => !alphabetPart.includes(ch));
        return [...otherPart, ...alphabetPart, ...remaining].slice(0, base.length).join('');
    }

    NodeRegistry.register({
        type: 'complex-substitution',
        category: 'classic',
        icon: 'fas fa-mask',
        color: '#dc2626',
        title: 'node.complex_substitution',
        fields: [
            { name: 'language', type: 'select', label: 'param.base_alphabet', value: 'ru', options: [
                { value: 'ru', label: 'option.ru_alphabet_33' },
                { value: 'en', label: 'option.en_alphabet_26' },
            ] },
            { name: 'decrypt', type: 'checkbox', label: 'param.decryption', value: false },
        ],
        inputs: [TEXT_PORT, KEY_PORT],
        process(ctx, text) {
            const decrypt = Boolean(ctx.fields.decrypt) !== Boolean(ctx.reverse);
            const base = ctx.fields.language === 'en' ? EN_LOWER : RU_LOWER;
            const substituted = complexSubstitutionAlphabet(keyParam(ctx), base);
            const map = decrypt ? substitutionMap(substituted, base) : substitutionMap(base, substituted);
            return applySubstitution(text, map);
        },
        help: {
            title: 'help.algo.complex_substitution.title',
            desc: 'help.algo.complex_substitution.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.complex_substitution.principle' },
                { kind: 'example', title: 'help.algo.complex_substitution.example_title', lines: [
                    ['input', 'help.algo.complex_substitution.example_base'], ['input', 'help.algo.complex_substitution.example_process'],
                    ['input', 'help.algo.complex_substitution.example_new_alphabet'], ['output', 'help.algo.complex_substitution.example_encrypt'],
                ] },
                { kind: 'note', title: 'help.general.features', lines: ['help.algo.complex_substitution.feature1', 'help.algo.complex_substitution.feature2', 'help.algo.complex_substitution.feature3'] },
            ],
        },
    });

    function simpleSubstitutionAlphabet(key, base) {
        if (!key) return base;
        const keyChars = [...uniqueChars(key.toLowerCase())].filter(ch => base.includes(ch));
        const remaining = base.split('').filter(ch => !keyChars.includes(ch));
        return [...keyChars, ...remaining].join('');
    }

    NodeRegistry.register({
        type: 'simple-substitution',
        category: 'classic',
        icon: 'fas fa-random',
        color: '#ea580c',
        title: 'node.simple_substitution',
        fields: [
            { name: 'decrypt', type: 'checkbox', label: 'param.decryption', value: false },
        ],
        inputs: [TEXT_PORT, KEY_PORT],
        process(ctx, text) {
            const decrypt = Boolean(ctx.fields.decrypt) !== Boolean(ctx.reverse);
            const key = keyParam(ctx);
            let result = text;
            for (const base of [RU_LOWER, EN_LOWER]) {
                const substituted = simpleSubstitutionAlphabet(key, base);
                const map = decrypt ? substitutionMap(substituted, base) : substitutionMap(base, substituted);
                result = applySubstitution(result, map);
            }
            return result;
        },
        help: {
            title: 'help.algo.simple_substitution.title',
            desc: 'help.algo.simple_substitution.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.simple_substitution.principle' },
                { kind: 'example', title: 'help.algo.simple_substitution.example_title', lines: [
                    ['input', 'help.algo.simple_substitution.example_base'], ['input', 'help.algo.simple_substitution.example_new_alphabet'],
                    ['output', 'help.algo.simple_substitution.example_encrypt'],
                ] },
                { kind: 'note', title: 'help.general.features', lines: ['help.algo.simple_substitution.feature1', 'help.algo.simple_substitution.feature2', 'help.algo.simple_substitution.feature3'] },
            ],
        },
    });

    const A1Z26_ALPHABETS = { en: EN_UPPER, ru: RU_UPPER };

    function a1z26Encode(text, alphabet) {
        const regex = new RegExp(`[${alphabet}]+`, 'gi');
        return text.replace(regex, word =>
            word.split('').map(char => alphabet.indexOf(char.toUpperCase()) + 1).join('-')
        );
    }

    function a1z26Decode(text, alphabet) {
        const toLetter = (numStr) => {
            const num = parseInt(numStr, 10);
            return (num >= 1 && num <= alphabet.length) ? alphabet[num - 1] : numStr;
        };
        return text.replace(/\b(\d+(\.\d+)*(-\d+(\.\d+)*)*)\b/g, match =>
            match.split('-').map(part => {
                if (!part.includes('.')) return toLetter(part);
                // "1.05" style parts: keep leading zeros, convert only the numeric tail
                return part.split('.').map(sub => {
                    const m = sub.match(/^(0*)(\d+)$/);
                    if (!m) return sub;
                    const letter = toLetter(m[2]);
                    return letter === m[2] ? sub : m[1] + letter;
                }).join('.');
            }).join('')
        );
    }

    NodeRegistry.register({
        type: 'a1z26',
        category: 'classic',
        icon: 'fas fa-sort-numeric-up',
        color: '#14b8a6',
        title: 'node.a1z26_cipher',
        fields: [
            { name: 'language', type: 'select', label: 'param.language', value: 'ru', options: [
                { value: 'ru', label: 'option.russian' },
                { value: 'en', label: 'option.english' },
            ] },
            { name: 'mode', type: 'select', label: 'param.mode', value: 'encode', options: ENCODE_DECODE_OPTIONS },
        ],
        process(ctx, text) {
            const alphabet = A1Z26_ALPHABETS[ctx.fields.language] || RU_UPPER;
            return resolveDirection(ctx.fields.mode, ctx.reverse) === 'encode'
                ? a1z26Encode(text, alphabet)
                : a1z26Decode(text, alphabet);
        },
        help: {
            title: 'help.algo.a1z26',
            desc: 'help.algo.a1z26_desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.a1z26_principle' },
                { kind: 'example', title: 'help.algo.a1z26_example', lines: [['input', 'help.algo.a1z26_input'], ['output', 'help.algo.a1z26_output']] },
            ],
        },
    });

    /** Column read order: indices of key characters sorted alphabetically (stable). */
    function columnOrder(key) {
        return key.split('')
            .map((char, index) => ({ char, index }))
            .sort((a, b) => a.char.localeCompare(b.char) || a.index - b.index)
            .map(item => item.index);
    }

    function routeEncrypt(text, key) {
        const keyLen = key.length;
        const numRows = Math.ceil(text.length / keyLen);
        let result = '';
        for (const col of columnOrder(key)) {
            for (let row = 0; row < numRows; row++) {
                const index = row * keyLen + col;
                if (index < text.length) result += text[index];
            }
        }
        return result;
    }

    function routeDecrypt(text, key) {
        const keyLen = key.length;
        const numRows = Math.ceil(text.length / keyLen);
        const fullColumns = text.length % keyLen || keyLen;
        const table = Array.from({ length: numRows }, () => Array(keyLen).fill(''));
        let cursor = 0;
        for (const col of columnOrder(key)) {
            const height = col < fullColumns ? numRows : numRows - 1;
            for (let row = 0; row < height; row++) table[row][col] = text[cursor++];
        }
        return table.flat().join('');
    }

    NodeRegistry.register({
        type: 'route-transposition',
        category: 'classic',
        icon: 'fas fa-route',
        color: '#7c2d12',
        title: 'node.route_transposition',
        fields: [
            { name: 'decrypt', type: 'checkbox', label: 'param.decryption', value: false },
        ],
        inputs: [TEXT_PORT, KEY_PORT],
        process(ctx, text) {
            const key = keyParam(ctx);
            if (!text || !key) return text;
            const decrypt = Boolean(ctx.fields.decrypt) !== Boolean(ctx.reverse);
            return decrypt ? routeDecrypt(text, key) : routeEncrypt(text, key);
        },
        help: {
            title: 'help.algo.route_transposition.title',
            desc: 'help.algo.route_transposition.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.route_transposition.principle' },
                { kind: 'example', title: 'help.algo.route_transposition.example_title', lines: [
                    ['input', 'help.algo.route_transposition.example_text'], ['input', 'help.algo.route_transposition.example_order'],
                    ['pre', 'help.algo.route_transposition.example_matrix'], ['output', 'help.algo.route_transposition.example_result'],
                ] },
            ],
        },
    });
});
