/* Compression node: LZW (dictionary coder, output as Base64) or the simpler text-only RLE. */

EngineModules.define(() => {
    const LZW_FIRST_CODE = 256;
    const LZW_MAX_CODES = 1 << 16;
    const LZW_MIN_WIDTH = 9;
    const LZW_MAX_WIDTH = 16;

    const bitLength = (n) => n <= 0 ? 1 : n.toString(2).length;
    const clampWidth = (w) => Math.min(LZW_MAX_WIDTH, Math.max(LZW_MIN_WIDTH, w));

    class BitWriter {
        constructor() { this.bytes = []; this.acc = 0; this.count = 0; }
        write(value, width) {
            for (let i = width - 1; i >= 0; i--) {
                this.acc = (this.acc << 1) | ((value >> i) & 1);
                if (++this.count === 8) {
                    this.bytes.push(this.acc);
                    this.acc = 0;
                    this.count = 0;
                }
            }
        }
        finish() {
            if (this.count > 0) this.bytes.push(this.acc << (8 - this.count));
            return Uint8Array.from(this.bytes);
        }
    }

    class BitReader {
        constructor(bytes) { this.bytes = bytes; this.pos = 0; }
        get remaining() { return this.bytes.length * 8 - this.pos; }
        read(width) {
            let value = 0;
            for (let i = 0; i < width; i++, this.pos++) {
                const bit = (this.bytes[this.pos >> 3] >> (7 - (this.pos & 7))) & 1;
                value = (value << 1) | bit;
            }
            return value;
        }
    }

    function lzwCompress(bytes) {
        const dict = new Map();
        for (let i = 0; i < LZW_FIRST_CODE; i++) dict.set(String.fromCharCode(i), i);
        let next = LZW_FIRST_CODE;
        const writer = new BitWriter();
        let w = '';
        for (const byte of bytes) {
            const wc = w + String.fromCharCode(byte);
            if (dict.has(wc)) {
                w = wc;
                continue;
            }
            writer.write(dict.get(w), clampWidth(bitLength(next - 1)));
            if (next < LZW_MAX_CODES) dict.set(wc, next++);
            w = String.fromCharCode(byte);
        }
        if (w) writer.write(dict.get(w), clampWidth(bitLength(next - 1)));
        return writer.finish();
    }

    function lzwDecompress(bytes) {
        const dict = [];
        for (let i = 0; i < LZW_FIRST_CODE; i++) dict.push(String.fromCharCode(i));
        const reader = new BitReader(bytes);
        const out = [];
        let width = clampWidth(bitLength(dict.length));
        if (reader.remaining < width) return new Uint8Array(0);

        let prev = reader.read(width);
        if (prev >= dict.length) throw new Error('bad LZW stream');
        out.push(dict[prev]);
        while (reader.remaining >= (width = clampWidth(bitLength(dict.length)))) {
            const code = reader.read(width);
            let entry;
            if (code < dict.length) entry = dict[code];
            else if (code === dict.length) entry = dict[prev] + dict[prev][0];
            else throw new Error('bad LZW stream');
            out.push(entry);
            if (dict.length < LZW_MAX_CODES) dict.push(dict[prev] + entry[0]);
            prev = code;
        }
        const joined = out.join('');
        return Uint8Array.from(joined, ch => ch.charCodeAt(0));
    }

    const bytesToBase64 = (bytes) => btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
    const base64ToBytes = (text) => Uint8Array.from(atob(text.replace(/\s+/g, '')), ch => ch.charCodeAt(0));

    function lzwEncodeText(text) {
        if (!text) return '';
        return bytesToBase64(lzwCompress(new TextEncoder().encode(text)));
    }

    function lzwDecodeText(text) {
        if (!text.trim()) return '';
        return new TextDecoder('utf-8', { fatal: true }).decode(lzwDecompress(base64ToBytes(text)));
    }

    const RLE_OPEN = '#';
    const RLE_START = '[';
    const RLE_END = ']';

    function rleEncode(text) {
        let result = '';
        let i = 0;
        const len = text.length;
        const maxPatternLen = Math.min(Math.floor(len / 2), 50);
        while (i < len) {
            let best = { benefit: 0, compressed: '', length: 0 };
            for (let pLen = 1; pLen <= maxPatternLen && i + pLen <= len; pLen++) {
                // a run needs at least one repetition, so the pattern must reappear right after itself
                if (text.charCodeAt(i) !== text.charCodeAt(i + pLen)) continue;
                const pattern = text.substring(i, i + pLen);
                let count = 0;
                while (text.startsWith(pattern, i + count * pLen)) count++;
                let compressed = null;
                if (pLen === 1 && count >= 4) compressed = `${RLE_OPEN}${count}${pattern}`;
                else if (pLen > 1 && count >= 3) compressed = `${RLE_OPEN}${count}${RLE_START}${pattern}${RLE_END}`;
                if (!compressed) continue;
                const benefit = pattern.length * count - compressed.length;
                if (benefit > best.benefit) best = { benefit, compressed, length: pattern.length * count };
            }
            if (best.benefit > 0) {
                result += best.compressed;
                i += best.length;
            } else {
                const char = text[i];
                result += char === RLE_OPEN ? '##' : char === RLE_START ? '[[' : char === RLE_END ? ']]' : char;
                i++;
            }
        }
        return result;
    }

    function rleDecode(text) {
        return text.replace(/#(\d+)(?:\[([\s\S]*?)]|([\s\S]))|##|\[\[|]]|[\s\S]/g, (match, count, pattern, single) => {
            if (count) return (pattern !== undefined ? pattern : single).repeat(parseInt(count, 10));
            if (match === '##') return '#';
            if (match === '[[') return '[';
            if (match === ']]') return ']';
            return match;
        });
    }

    NodeRegistry.register({
        type: 'compression',
        category: 'transform',
        icon: 'fas fa-compress-arrows-alt',
        color: '#059669',
        title: 'node.compression',
        fields: [
            { name: 'algorithm', type: 'select', label: 'param.algorithm', value: 'rle', options: [
                { value: 'rle', label: 'option.rle' }, { value: 'lzw', label: 'option.lzw' },
            ] },
            { name: 'decrypt', type: 'checkbox', label: 'param.decompression', value: false },
        ],
        process(ctx, text) {
            if (!text) return '';
            const decompress = Boolean(ctx.fields.decrypt) !== Boolean(ctx.reverse);
            if (ctx.fields.algorithm === 'rle') return decompress ? rleDecode(text) : rleEncode(text);
            try {
                return decompress ? lzwDecodeText(text) : lzwEncodeText(text);
            } catch {
                return ctx.t('error.compression_decode');
            }
        },
        help: {
            title: 'help.algo.compression.title',
            desc: 'help.algo.compression.desc',
            blocks: [
                { kind: 'principle', text: 'help.algo.compression.principle' },
                { kind: 'example', title: 'help.algo.compression.lzw_example_title', lines: [
                    ['input', 'help.algo.compression.lzw_example_input'], ['output', 'help.algo.compression.lzw_example_output'],
                ] },
                { kind: 'example', title: 'help.algo.compression.rle_example_title', lines: [
                    ['input', 'help.algo.compression.rle_example_input'], ['output', 'help.algo.compression.rle_example_output'],
                ] },
                { kind: 'note', title: 'help.general.features', lines: ['help.algo.compression.feature1', 'help.algo.compression.feature2', 'help.algo.compression.feature3'] },
            ],
        },
    });
});
