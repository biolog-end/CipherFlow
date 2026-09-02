/**
 * Morse code tables and codec shared by the Morse and Cat-Morse nodes.
 * Russian letters use Unicode "·" / "−", Latin letters use ASCII "." / "-" so a mixed
 * message can still be decoded unambiguously.
 */
const Morse = EngineModules.define('Morse', () => {
    const RU = {
        'А': '·−',      'Б': '−···',    'В': '·−−',     'Г': '−−·',     'Д': '−··',
        'Ё': '·',       'Е': '·',       'Ж': '···−',    'З': '−−··',    'И': '··',
        'Й': '·−−−',    'К': '−·−',     'Л': '·−··',    'М': '−−',      'Н': '−·',
        'О': '−−−',     'П': '·−−·',    'Р': '·−·',     'С': '···',     'Т': '−',
        'У': '··−',     'Ф': '··−·',    'Х': '····',    'Ц': '−·−·',    'Ч': '−−−·',
        'Ш': '−−−−',    'Щ': '−−·−',    'Ъ': '−−·−−',   'Ы': '−·−−',    'Ь': '−··−',
        'Э': '···−···', 'Ю': '··−−',    'Я': '·−·−',
    };

    const EN = {
        'A': '.-',      'B': '-...',    'C': '-.-.',    'D': '-..',     'E': '.',
        'F': '..-.',    'G': '--.',     'H': '....',    'I': '..',      'J': '.---',
        'K': '-.-',     'L': '.-..',    'M': '--',      'N': '-.',      'O': '---',
        'P': '.--.',    'Q': '--.-',    'R': '.-.',     'S': '...',     'T': '-',
        'U': '..-',     'V': '...-',    'W': '.--',     'X': '-..-',    'Y': '-.--',
        'Z': '--..',
    };

    const SYMBOLS = {
        '0': '-----',   '1': '.----',   '2': '..---',   '3': '...--',   '4': '....-',
        '5': '.....',   '6': '-....',   '7': '--...',   '8': '---..',   '9': '----.',
        ' ': '/',       '.': '.-.-.-',  ',': '--..--',  '?': '..--..',  "'": '.----.',
        '!': '-.-.--',  '/': '-..-.',   '(': '-.--.',   ')': '-.--.-',  '&': '.-...',
        ':': '---...',  ';': '-.-.-.',  '=': '-...-',   '+': '.-.-.',   '-': '-....-',
        '_': '..--.-',  '"': '.-..-.',  '$': '...-..-', '@': '.--.-.',
    };

    const YO_CODE = '··−··';

    const TABLE = { ...RU, ...EN, ...SYMBOLS };
    const REVERSE = {};
    for (const [char, code] of Object.entries(TABLE)) REVERSE[code] = char;

    function tables(supportYo) {
        if (!supportYo) return { table: TABLE, reverse: REVERSE };
        return {
            table: { ...TABLE, 'Ё': YO_CODE },
            reverse: { ...REVERSE, [YO_CODE]: 'Ё' },
        };
    }

    function encode(text, supportYo = false) {
        if (typeof text !== 'string') return '';
        const { table } = tables(supportYo);
        return text.split('\n').map(line =>
            line.toUpperCase().split('').map(char => table[char] || '').join(' ')
        ).join('\n');
    }

    function decode(morse, supportYo = false) {
        if (typeof morse !== 'string') return '';
        const { reverse } = tables(supportYo);
        return morse.split('\n').map(line =>
            line.trim()
                .split(/\s*\/\s*/)
                .map(word => word.split(' ').filter(Boolean).map(code => reverse[code] || '').join(''))
                .join(' ')
        ).join('\n');
    }

    return Object.freeze({ RU, EN, SYMBOLS, YO_CODE, encode, decode });
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Morse;
}
