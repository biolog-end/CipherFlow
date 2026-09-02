/* "Modern" block: Atbash, Base64 and the keyless avalanche cipher ("perfect cipher"). */

EngineModules.define(() => {
    const { RU_LOWER, RU_UPPER, EN_LOWER, EN_UPPER, resolveDirection, toNumber, mulberry32, hash32, mod } = TextUtils;

    NodeRegistry.register({
        type: 'atbash',
        category: 'modern',
        icon: 'fas fa-retweet',
        color: '#4ade80',
        title: 'node.atbash_cipher',
        process(ctx, text) {
            let result = '';
            for (const char of text) {
                const alphabet = [RU_LOWER, RU_UPPER, EN_LOWER, EN_UPPER].find(a => a.includes(char));
                result += alphabet ? alphabet[alphabet.length - 1 - alphabet.indexOf(char)] : char;
            }
            return result;
        },
        help: {
            title: 'help.algo.atbash.title',
            desc: 'help.algo.atbash.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.atbash.principle' },
                { kind: 'example', title: 'help.algo.atbash.example_title', lines: [['input', 'help.algo.atbash.example_input'], ['output', 'help.algo.atbash.example_output']] },
                { kind: 'note', title: 'help.general.features', lines: ['help.algo.atbash.feature1', 'help.algo.atbash.feature2', 'help.algo.atbash.feature3'] },
            ],
        },
    });

    NodeRegistry.register({
        type: 'base64',
        category: 'modern',
        icon: 'fas fa-file-export',
        color: '#06b6d4',
        title: 'node.base64',
        fields: [
            { name: 'mode', type: 'select', label: 'param.mode', value: 'encode', options: [
                { value: 'encode', label: 'option.encode' }, { value: 'decode', label: 'option.decode' },
            ] },
        ],
        process(ctx, text) {
            try {
                if (resolveDirection(ctx.fields.mode, ctx.reverse) === 'encode') {
                    const bytes = new TextEncoder().encode(text);
                    let binary = '';
                    for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
                    return btoa(binary);
                }
                const binary = atob(text.replace(/\s+/g, ''));
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
            } catch (e) {
                return ctx.t('error.base64', { message: e.message });
            }
        },
        help: {
            title: 'help.algo.base64.title',
            desc: 'help.algo.base64.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.base64.principle' },
                { kind: 'example', title: 'help.algo.base64.example_title', lines: [['input', 'help.algo.base64.example_input'], ['output', 'help.algo.base64.example_output']] },
                { kind: 'note', title: 'help.general.features', lines: ['help.algo.base64.feature1', 'help.algo.base64.feature2', 'help.algo.base64.feature3'] },
            ],
        },
    });

    /* ---------- Perfect cipher ---------- */

    const ASCII_PRINTABLE = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('');
    const PERFECT_ALPHABETS = {
        ru: RU_LOWER + RU_UPPER,
        en: EN_LOWER + EN_UPPER,
        all: ASCII_PRINTABLE + '\n' + RU_LOWER + RU_UPPER,
    };
    const MAX_DEPTH = 32;

    const ALPHABET_INDEX = new Map();

    /** char -> position in the alphabet, built once per alphabet. */
    function indexOf(alphabet) {
        let index = ALPHABET_INDEX.get(alphabet);
        if (!index) {
            index = new Map([...alphabet].map((ch, i) => [ch, i]));
            ALPHABET_INDEX.set(alphabet, index);
        }
        return index;
    }

    /**
     * Everything one round needs, derived deterministically from the message length and the round number.
     * Both directions rebuild the exact same material, so no key has to travel with the message.
     * The order of random() calls is part of the format: permutation, keystream, S-box.
     */
    function roundMaterial(n, round, size) {
        const random = mulberry32(hash32(`${n}:${round}:${size}`));
        const permutation = new Uint32Array(n);
        for (let i = 0; i < n; i++) permutation[i] = i;
        for (let i = n - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            const t = permutation[i];
            permutation[i] = permutation[j];
            permutation[j] = t;
        }
        const keystream = new Uint16Array(n);
        for (let i = 0; i < n; i++) keystream[i] = Math.floor(random() * size);
        const sbox = new Uint16Array(size);
        for (let i = 0; i < size; i++) sbox[i] = i;
        for (let i = size - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            const t = sbox[i];
            sbox[i] = sbox[j];
            sbox[j] = t;
        }
        const inverseSbox = new Uint16Array(size);
        for (let i = 0; i < size; i++) inverseSbox[sbox[i]] = i;
        return { permutation, keystream, sbox, inverseSbox };
    }

    /** shuffle -> forward chain -> backward chain -> S-box */
    function encryptRound(values, round, size) {
        const n = values.length;
        const { permutation, keystream, sbox } = roundMaterial(n, round, size);
        const out = new Uint16Array(n);
        let prev = 0;
        for (let i = 0; i < n; i++) {
            prev = (values[permutation[i]] + prev + keystream[i]) % size;
            out[i] = prev;
        }
        let next = 0;
        for (let i = n - 1; i >= 0; i--) {
            next = (out[i] + next) % size;
            out[i] = sbox[next];
        }
        return out;
    }

    function decryptRound(values, round, size) {
        const n = values.length;
        const { permutation, keystream, inverseSbox } = roundMaterial(n, round, size);
        const backward = new Uint16Array(n);
        for (let i = 0; i < n; i++) backward[i] = inverseSbox[values[i]];
        const forward = new Uint16Array(n);
        for (let i = 0; i < n; i++) forward[i] = (backward[i] - (i < n - 1 ? backward[i + 1] : 0) + size) % size;
        const original = new Uint16Array(n);
        for (let i = 0; i < n; i++) {
            original[permutation[i]] = (forward[i] - (i > 0 ? forward[i - 1] : 0) - keystream[i] + 2 * size) % size;
        }
        return original;
    }

    function perfectCipher(text, alphabet, depth, decrypt) {
        const index = indexOf(alphabet);
        const chars = [...text];
        const positions = [];
        const values = [];
        chars.forEach((ch, i) => {
            const idx = index.get(ch);
            if (idx !== undefined) {
                positions.push(i);
                values.push(idx);
            }
        });
        if (values.length === 0) return text;

        let current = Uint16Array.from(values);
        if (decrypt) {
            for (let round = depth - 1; round >= 0; round--) current = decryptRound(current, round, alphabet.length);
        } else {
            for (let round = 0; round < depth; round++) current = encryptRound(current, round, alphabet.length);
        }
        for (let i = 0; i < positions.length; i++) chars[positions[i]] = alphabet[current[i]];
        return chars.join('');
    }

    NodeRegistry.register({
        type: 'perfect-cipher',
        category: 'modern',
        icon: 'fas fa-infinity',
        color: '#a78bfa',
        title: 'node.perfect_cipher',
        fields: [
            { name: 'depth', type: 'number', label: 'param.depth', value: 1, min: 1, max: MAX_DEPTH },
            { name: 'alphabet', type: 'select', label: 'param.alphabet', value: 'all', options: [
                { value: 'ru', label: 'option.alphabet_ru' }, { value: 'en', label: 'option.alphabet_en' }, { value: 'all', label: 'option.alphabet_all' },
            ] },
        ],
        process(ctx, text) {
            const alphabet = PERFECT_ALPHABETS[ctx.fields.alphabet] || PERFECT_ALPHABETS.all;
            const depth = Math.min(MAX_DEPTH, Math.max(1, Math.round(toNumber(ctx.fields.depth, 1))));
            return perfectCipher(text, alphabet, depth, Boolean(ctx.reverse));
        },
        help: {
            title: 'help.algo.perfect.title',
            desc: 'help.algo.perfect.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.perfect.principle' },
                { kind: 'example', title: 'help.algo.perfect.steps_title', lines: [
                    ['input', 'help.algo.perfect.step1'], ['input', 'help.algo.perfect.step2'], ['input', 'help.algo.perfect.step3'], ['input', 'help.algo.perfect.step4'], ['output', 'help.algo.perfect.steps_result'],
                ] },
                { kind: 'example', title: 'help.algo.perfect.example_title', lines: [
                    ['input', 'help.algo.perfect.example_input'], ['output', 'help.algo.perfect.example_output'], ['output', 'help.algo.perfect.example_avalanche'],
                ] },
                { kind: 'note', title: 'help.general.features', lines: ['help.algo.perfect.feature1', 'help.algo.perfect.feature2', 'help.algo.perfect.feature3'] },
            ],
        },
    });
});
