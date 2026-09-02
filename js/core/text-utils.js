/**
 * Shared helpers for cipher implementations: alphabets, deterministic PRNGs, string utilities.
 * Pure functions only — no DOM access — so node definitions can run in the browser and in tests.
 */
const TextUtils = EngineModules.define('TextUtils', () => {
    const RU_LOWER = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
    const RU_UPPER = RU_LOWER.toUpperCase();
    const EN_LOWER = 'abcdefghijklmnopqrstuvwxyz';
    const EN_UPPER = EN_LOWER.toUpperCase();

    /** Small LCG; its exact sequence is part of the output format of planet enchanter, uwu and navi. */
    function lcgRandom(seed) {
        let state = seed;
        return () => {
            state = (state * 9301 + 49297) % 233280;
            return state / 233280;
        };
    }

    /** mulberry32 — small, fast, good-quality 32-bit PRNG. Returns floats in [0, 1). */
    function mulberry32(seed) {
        let a = seed >>> 0;
        return () => {
            a = (a + 0x6D2B79F5) >>> 0;
            let t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    /** FNV-1a 32-bit hash of a string. */
    function hash32(str) {
        let h = 0x811c9dc5;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
        }
        return h >>> 0;
    }

    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function mod(n, m) {
        return ((n % m) + m) % m;
    }

    /** Shifts a letter of the given alphabet, preserving case. Non-alphabet chars are returned as-is. */
    function shiftInAlphabet(char, shift, lower, upper) {
        let idx = lower.indexOf(char);
        if (idx !== -1) return lower[mod(idx + shift, lower.length)];
        idx = upper.indexOf(char);
        if (idx !== -1) return upper[mod(idx + shift, upper.length)];
        return null;
    }

    /** Builds a one-to-one character substitution map from two equal-length alphabets. */
    function substitutionMap(from, to) {
        const map = new Map();
        for (let i = 0; i < from.length; i++) map.set(from[i], to[i]);
        return map;
    }

    /** Applies a lowercase substitution map to text, preserving case. */
    function applySubstitution(text, map) {
        let result = '';
        for (const char of text) {
            const lower = char.toLowerCase();
            const replacement = map.get(lower);
            if (replacement === undefined) {
                result += char;
            } else {
                result += char === lower ? replacement : replacement.toUpperCase();
            }
        }
        return result;
    }

    function uniqueChars(str) {
        return [...new Set([...str])].join('');
    }

    function isString(value) {
        return typeof value === 'string';
    }

    /**
     * Resolves a node's configured direction against the global decrypt switch.
     * A node set to "decode" in decrypt mode encodes, and vice versa.
     */
    function resolveDirection(mode, reverse, forward = 'encode', backward = 'decode') {
        const wantsForward = mode !== backward;
        return (wantsForward !== Boolean(reverse)) ? forward : backward;
    }

    function toNumber(value, fallback) {
        const n = typeof value === 'number' ? value : parseFloat(value);
        return Number.isFinite(n) ? n : fallback;
    }

    return Object.freeze({
        RU_LOWER, RU_UPPER, EN_LOWER, EN_UPPER,
        lcgRandom, mulberry32, hash32,
        escapeRegExp, mod, shiftInAlphabet, substitutionMap, applySubstitution, uniqueChars, isString,
        resolveDirection, toNumber,
    });
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextUtils;
}
