/* "System" ciphers: the NAVI terminal log and the invisible-character steganography of the Knights. */

EngineModules.define(() => {
    const { resolveDirection, lcgRandom } = TextUtils;

    const NAVI_SYS_CALLS = { ' ': 'WSPACE', '\n': 'NEWLINE', '.': 'DOT', ',': 'COMMA', '!': 'EXCLAIM', '?': 'QUESTION' };
    const NAVI_SYS_CALL_CHARS = Object.fromEntries(Object.entries(NAVI_SYS_CALLS).map(([ch, name]) => [name.toLowerCase(), ch]));
    const NAVI_NOISE = ['CACHE_HIT: block ', 'IRQ_HANDLED: timer', 'SCHED: context switch', 'MM_ALLOC: 4096 bytes'];

    function naviLine(timestamp, pid, message, detail, random) {
        if (detail === 'brief') {
            const mem = message.match(/MEM_WRITE:\s*(0x[0-9A-F]+)/);
            if (mem) return mem[1];
            const sys = message.match(/SYS_CALL:\s*(\w+)/);
            return sys ? `[${sys[1]}]` : message;
        }
        const status = detail === 'full' && random() <= 0.05 ? '<RETRY>' : '<OK>';
        return `[${timestamp.toFixed(1)}] [PID:${pid}] ${message} ${status}`;
    }

    function naviEncrypt(text, detail) {
        if (!text) return '';
        const random = lcgRandom(text.length);
        const pid = Math.floor(random() * 9000) + 1000;
        const lines = [];
        let timestamp = 1663459200.0;

        if (detail === 'full') {
            lines.push(`[${timestamp.toFixed(1)}] [PID:${pid}] KERNEL_MSG: User input detected...`);
            timestamp += 0.1;
        }
        for (const char of text) {
            const sysCall = NAVI_SYS_CALLS[char];
            const message = sysCall
                ? `SYS_CALL: ${sysCall}`
                : `MEM_WRITE: 0x${char.codePointAt(0).toString(16).toUpperCase()}`;
            lines.push(naviLine(timestamp, pid, message, detail, random));

            if (detail === 'full' && random() > 0.7) {
                timestamp += 0.1;
                // the block number is drawn before the message is picked: the draw order is part of the log format
                const block = Math.floor(random() * 512);
                const noise = NAVI_NOISE[Math.floor(random() * NAVI_NOISE.length)];
                lines.push(`[${timestamp.toFixed(1)}] [PID:${pid}] ${noise}${noise.endsWith(' ') ? block : ''}`);
            }
            timestamp += 0.1;
        }
        return lines.join('\n');
    }

    function naviDecrypt(log) {
        if (!log) return '';
        let result = '';
        for (const line of log.split('\n')) {
            const mem = line.match(/MEM_WRITE:\s*(0x[0-9A-Fa-f]+)/i) || line.match(/^(0x[0-9A-Fa-f]+)$/i);
            if (mem) {
                const code = parseInt(mem[1], 16);
                result += code <= 0x10FFFF ? String.fromCodePoint(code) : '';
                continue;
            }
            const lower = line.toLowerCase();
            for (const [name, char] of Object.entries(NAVI_SYS_CALL_CHARS)) {
                if (lower.includes(`sys_call: ${name}`) || lower.includes(`[${name}]`)) {
                    result += char;
                    break;
                }
            }
        }
        return result;
    }

    NodeRegistry.register({
        type: 'navi-terminal',
        category: 'system',
        icon: 'fas fa-terminal',
        color: '#1e293b',
        title: 'node.navi_terminal',
        fields: [
            { name: 'mode', type: 'select', label: 'param.mode', value: 'encrypt', options: [
                { value: 'encrypt', label: 'option.encrypt' }, { value: 'decrypt', label: 'option.decrypt' },
            ] },
            { name: 'detailLevel', type: 'select', label: 'param.detail_level', value: 'standard', options: [
                { value: 'brief', label: 'option.detail_brief' }, { value: 'standard', label: 'option.detail_standard' }, { value: 'full', label: 'option.detail_full' },
            ] },
        ],
        process(ctx, text) {
            return resolveDirection(ctx.fields.mode, ctx.reverse, 'encrypt', 'decrypt') === 'encrypt'
                ? naviEncrypt(text, ctx.fields.detailLevel)
                : naviDecrypt(text);
        },
        help: {
            title: 'help.algo.navi_terminal.title',
            desc: 'help.algo.navi_terminal.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.navi_terminal.principle' },
                { kind: 'example', title: 'help.algo.navi_terminal.example_title', lines: [['input', 'help.algo.navi_terminal.example_input'], ['pre-output', 'help.algo.navi_terminal.example_output']] },
                { kind: 'note', title: 'help.general.features', lines: ['help.algo.navi_terminal.feature1', 'help.algo.navi_terminal.feature2', 'help.algo.navi_terminal.feature3'] },
            ],
        },
    });

    const ZERO = '\u200C';
    const ONE = '\u200B';
    const MARKER = '\u200D\u200D';

    function knightsEncrypt(container, secret) {
        const bits = [...secret].map(ch => ch.charCodeAt(0).toString(2).padStart(16, '0')).join('');
        const invisible = [...bits].map(bit => bit === '0' ? ZERO : ONE).join('');
        const chunkSize = Math.ceil(invisible.length / container.length);
        let result = '';
        let cursor = 0;
        for (const char of container) {
            result += char + invisible.slice(cursor, cursor + chunkSize);
            cursor += chunkSize;
        }
        return MARKER + result;
    }

    function knightsDecrypt(text) {
        if (!text.startsWith(MARKER)) return '';
        let bits = '';
        for (const char of text) {
            if (char === ZERO) bits += '0';
            else if (char === ONE) bits += '1';
        }
        let result = '';
        for (let i = 0; i + 16 <= bits.length; i += 16) {
            result += String.fromCharCode(parseInt(bits.slice(i, i + 16), 2));
        }
        return result;
    }

    NodeRegistry.register({
        type: 'knights-cipher',
        category: 'system',
        icon: 'fas fa-chess-knight',
        color: '#581c87',
        title: 'node.knights_cipher',
        fields: [
            { name: 'mode', type: 'select', label: 'param.mode', value: 'encrypt', options: [
                { value: 'encrypt', label: 'option.encrypt' }, { value: 'decrypt', label: 'option.decrypt' },
            ] },
        ],
        inputs: [
            { name: 'secret', label: 'option.secret_text', color: '#ef4444' },
            { name: 'container', label: 'option.container_text', color: '#3b82f6' },
        ],
        process(ctx, entry) {
            const encrypt = resolveDirection(ctx.fields.mode, ctx.reverse, 'encrypt', 'decrypt') === 'encrypt';
            if (ctx.reverse) {
                // the hidden message flows back to whoever supplied the secret
                const text = typeof entry === 'string' ? entry : '';
                const secret = encrypt ? '' : knightsDecrypt(text);
                return { secret, container: encrypt ? text : '' };
            }
            const container = entry.container || '';
            const secret = entry.secret || '';
            if (!encrypt) return knightsDecrypt(secret || container);
            if (!container || !secret) return ctx.t('error.knights_cipher_needs_inputs');
            return knightsEncrypt(container, secret);
        },
        help: {
            title: 'help.algo.knights_cipher.title',
            desc: 'help.algo.knights_cipher.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.knights_cipher.principle' },
                { kind: 'example', title: 'help.algo.knights_cipher.example_title', lines: [
                    ['input', 'help.algo.knights_cipher.example_input_container'], ['input', 'help.algo.knights_cipher.example_input_secret'], ['output', 'help.algo.knights_cipher.example_output'],
                ] },
                { kind: 'note', title: 'help.general.features', lines: ['help.algo.knights_cipher.feature1', 'help.algo.knights_cipher.feature2', 'help.algo.knights_cipher.feature3'] },
            ],
        },
    });
});
