class DynamicNodeStyler {
    constructor() {
        // === ЕДИНСТВЕННОЕ МЕСТО ДЛЯ РЕДАКТИРОВАНИЯ ЦВЕТОВ ===
        // Просто добавьте сюда новый тип нода и его HEX-цвет.
        this.NODE_COLORS = {
            'input': '#10b981',
            'output': '#f59e0b',
            'caesar': '#6366f1',
            'morse': '#8b5cf6',
            'vigenere': '#ec4899',
            'a1z26': '#14b8a6',
            'binary': '#3b82f6',
            'braille-cat': '#f472b6',
            'planet-enchanter': '#22d3ee',
            'numbers-to-words': '#84cc16',
            'math': '#facc15',
            'reverse': '#fb923c',
            'case-transform': '#c084fc',
            'secret-word': '#f87171',
            'monitor': '#64748b',
            'comment': '#9ca3af',
            'multi-replacer': '#d946ef',
            'text-router': '#0ea5e9',
            'stream-merger': '#f97316',
            'stream-splitter': '#9333ea',
            'atbash': '#4ade80',
            'base64': '#06b6d4',
            'gawr-gura': '#0891b2',
            'uwu-ifier': '#fb7185',
            'complex-substitution': '#dc2626',
            'simple-substitution': '#ea580c',
            'rle-compression': '#059669',
            'route-transposition': '#7c2d12',
        };

        this.generateAndInjectStyles();
    }

    /**
     * Конвертирует цвет из формата HEX в строку "R, G, B".
     * @param {string} hex - Цвет в формате #RRGGBB или #RGB.
     * @returns {string|null} - Строка "R, G, B" или null, если формат неверный.
     */
    hexToRgb(hex) {
        if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            return null;
        }

        let c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');

        const r = (c >> 16) & 255;
        const g = (c >> 8) & 255;
        const b = c & 255;

        return `${r}, ${g}, ${b}`;
    }

    /**
     * Генерирует CSS-правила на основе списка цветов и вставляет их в <head> документа.
     */
    generateAndInjectStyles() {
        let cssString = '/* === Стили нодов, сгенерированные JS === */\n\n';

        for (const [nodeType, hexColor] of Object.entries(this.NODE_COLORS)) {
            const rgbColor = this.hexToRgb(hexColor);
            if (!rgbColor) {
                console.warn(`Неверный формат HEX-цвета для нода "${nodeType}": ${hexColor}`);
                continue;
            }

            cssString += `
.canvas-node[data-node-type="${nodeType}"] {
    --current-node-color: ${hexColor};
    --current-node-color-rgb: ${rgbColor};
}
\n`;
        }

        const styleElement = document.createElement('style');
        styleElement.id = 'dynamic-node-styles';
        styleElement.textContent = cssString;

        // Удаляем старые стили, если они есть, чтобы избежать дублирования при горячей перезагрузке
        const oldStyle = document.getElementById('dynamic-node-styles');
        if (oldStyle) {
            oldStyle.remove();
        }

        document.head.appendChild(styleElement);
        console.log('🎨 Динамические стили для нодов успешно сгенерированы и применены.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DynamicNodeStyler();
});