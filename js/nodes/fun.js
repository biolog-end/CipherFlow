/* Just-for-fun ciphers: the shark cipher and the UwU-ifier. */

EngineModules.define(() => {
    const { RU_LOWER, EN_LOWER, lcgRandom } = TextUtils;

    const SHARK = {
        ru: { alphabet: RU_LOWER, tiers: ['а', 'шорк', 'гура'], unit: 'а' },
        en: { alphabet: EN_LOWER, tiers: ['a', 'shork', 'gura'], unit: 'a' },
    };
    const TIER_SIZE = 12;
    const SPACE_WORD = 'bloop';

    function sharkEncodeChar(char) {
        if (char === ' ') return SPACE_WORD;
        for (const lang of Object.values(SHARK)) {
            const index = lang.alphabet.indexOf(char);
            if (index === -1) continue;
            const tier = Math.floor(index / TIER_SIZE);
            if (tier >= lang.tiers.length) return char;
            return [lang.tiers[tier], ...Array(index % TIER_SIZE).fill(lang.unit)].join(' ');
        }
        return char;
    }

    function sharkDecodePart(part) {
        if (part === SPACE_WORD) return ' ';
        const tokens = part.split(' ');
        const keyword = tokens[0];
        for (const lang of Object.values(SHARK)) {
            const tier = lang.tiers.indexOf(keyword);
            if (tier === -1) continue;
            const index = tier * TIER_SIZE + (tokens.length - 1);
            return index < lang.alphabet.length ? lang.alphabet[index] : part;
        }
        return part;
    }

    NodeRegistry.register({
        type: 'gawr-gura',
        category: 'fun',
        icon: 'fas fa-fish',
        color: '#0891b2',
        title: 'node.shark_cipher',
        process(ctx, text) {
            if (ctx.reverse) return text.split('  ').map(sharkDecodePart).join('');
            return [...text.toLowerCase()].map(sharkEncodeChar).join('  ');
        },
        help: {
            title: 'help.algo.shark.title',
            desc: 'help.algo.shark.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.shark.principle' },
                { kind: 'example', title: 'help.algo.shark.lang_support_title', lines: [
                    ['text', 'help.algo.shark.lang_support_desc'], ['input', 'help.algo.shark.lang_ru'], ['input', 'help.algo.shark.lang_en'],
                ] },
                { kind: 'example', title: 'help.algo.shark.example_ru_title', lines: [
                    ['input', 'help.algo.shark.example_ru_1'], ['input', 'help.algo.shark.example_ru_2'], ['input', 'help.algo.shark.example_ru_3'], ['output', 'help.algo.shark.example_ru_result'],
                ] },
                { kind: 'example', title: 'help.algo.shark.example_en_title', lines: [
                    ['input', 'help.algo.shark.example_en_input'], ['pre-output', 'help.algo.shark.example_en_result'],
                ] },
                { kind: 'note', title: 'help.general.features', lines: ['help.algo.shark.feature1', 'help.algo.shark.feature2', 'help.algo.shark.feature3'] },
            ],
        },
    });

    const UWU_FACES = [' UwU', ' OwO', ' :3', ' >w<', ' ^w^'];

    NodeRegistry.register({
        type: 'uwu-ifier',
        category: 'fun',
        icon: 'fas fa-grin-stars',
        color: '#fb7185',
        title: 'node.uwu_cipher',
        process(ctx, text) {
            if (ctx.reverse) return text;
            let seed = 0;
            for (let i = 0; i < text.length; i++) seed += text.charCodeAt(i);
            const random = lcgRandom(seed);

            let result = text.replace(/[рл]/g, 'в').replace(/[РЛ]/g, 'В');
            // stutter on the first letter of a word; \b does not know Cyrillic, hence the explicit boundary
            result = result.replace(/(^|[^a-zA-Zа-яёА-ЯЁ])([a-zA-Zа-яёА-ЯЁ])/g, (m, before, letter) =>
                random() < 0.7 ? `${before}${letter}-${letter.toLowerCase()}` : m
            );
            return result.split(' ').map(word =>
                random() < 0.3 ? word + UWU_FACES[Math.floor(random() * UWU_FACES.length)] : word
            ).join(' ');
        },
        help: {
            title: 'help.algo.uwu.title',
            desc: 'help.algo.uwu.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.uwu.principle' },
                { kind: 'example', title: 'help.algo.uwu.rules_title', lines: [
                    ['input', 'help.algo.uwu.rule1'], ['input', 'help.algo.uwu.rule2'], ['input', 'help.algo.uwu.rule3'],
                ] },
                { kind: 'example', title: 'help.algo.uwu.example_title', lines: [['input', 'help.algo.uwu.example_input'], ['output', 'help.algo.uwu.example_output']] },
                { kind: 'note', title: 'help.algo.uwu.data_loss_title', lines: ['help.algo.uwu.data_loss_desc'] },
            ],
        },
    });
});
