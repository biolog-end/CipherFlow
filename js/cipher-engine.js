// === Движок шифрования и выполнения цепочки нодов ===

class CipherEngine {
    constructor() {
        this.morseCode = {
            'А': '.-', 'Б': '-...', 'В': '.--', 'Г': '--.', 'Д': '-..', 'Е': '.', 'Ё': '.', 'Ж': '...-',
            'З': '--..', 'И': '..', 'Й': '.---', 'К': '-.-', 'Л': '.-..', 'М': '--', 'Н': '-.', 'О': '---',
            'П': '.--.', 'Р': '.-.', 'С': '...', 'Т': '-', 'У': '..-', 'Ф': '..-.', 'Х': '....',
            'Ц': '-.-.', 'Ч': '---.', 'Ш': '----', 'Щ': '--.-', 'Ъ': '.--.-', 'Ы': '-.--', 'Ь': '-..-',
            'Э': '..-..', 'Ю': '..--', 'Я': '.-.-',
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
            'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
            'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
            'Y': '-.--', 'Z': '--..', 
            '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
            '6': '-....', '7': '--...', '8': '---..', '9': '----.',
            ' ': '/', '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
            '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.',
            '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-',
            '@': '.--.-.'
        };
        
        this.reverseMorseCode = {};
        for (const [key, value] of Object.entries(this.morseCode)) {
            this.reverseMorseCode[value] = key;
        }
        
        this.numbersRu = {
            '0': 'ноль', '1': 'один', '2': 'два', '3': 'три', '4': 'четыре', '5': 'пять',
            '6': 'шесть', '7': 'семь', '8': 'восемь', '9': 'девять', '10': 'десять'
        };
        
        this.numbersEn = {
            '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five',
            '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten'
        };
        
        this.reverseNumbersRu = {};
        this.reverseNumbersEn = {};
        
        for (const [key, value] of Object.entries(this.numbersRu)) {
            this.reverseNumbersRu[value] = key;
        }
        for (const [key, value] of Object.entries(this.numbersEn)) {
            this.reverseNumbersEn[value] = key;
        }
        
        this.bindEvents();
    }
    
    bindEvents() {
        // Обработка изменений в поле ввода
        const inputText = document.getElementById('inputText');
        inputText.addEventListener('input', () => {
            this.executeChain();
        });
    }
    
    executeChain() {
        if (!window.nodeManager || !window.connectionManager) {
            return;
        }
        
        try {
            // Получаем порядок выполнения нодов
            const executionOrder = window.connectionManager.getExecutionOrder();
            
            // Создаем карту для хранения результатов выполнения каждого нода
            const nodeResults = new Map();
            
            // Получаем входной текст
            const inputText = document.getElementById('inputText').value;
            
            // Выполняем ноды в правильном порядке
            for (const nodeId of executionOrder) {
                const node = window.nodeManager.nodes.get(nodeId);
                if (!node) continue;
                
                let inputData = '';
                
                // Определяем входные данные для нода
                if (node.type === 'input') {
                    // Для input нода берем текст из поля ввода
                    const inputElement = node.element.querySelector('textarea[name="text"]');
                    inputData = inputElement ? inputElement.value : inputText;
                } else {
                    // Для других нодов ищем входящие соединения
                    const connections = window.connectionManager.getNodeConnections(nodeId);
                    
                    if (connections.inputs.length > 0) {
                        // Берем данные от первого подключенного нода
                        const sourceNodeId = connections.inputs[0].fromNodeId;
                        inputData = nodeResults.get(sourceNodeId) || '';
                    } else if (node.data.hasInput) {
                        // Если нет соединений, но нод требует ввод, используем пустую строку
                        inputData = '';
                    }
                }
                
                // Выполняем обработку в ноде
                const result = this.processNode(node, inputData);
                nodeResults.set(nodeId, result);
                
                // Если это output нод, выводим результат
                if (node.type === 'output') {
                    document.getElementById('outputText').value = result;
                }
            }
            
            // Если нет output нода, но есть результаты, показываем последний результат
            const outputNodes = window.nodeManager.getAllNodes().filter(n => n.type === 'output');
            if (outputNodes.length === 0 && nodeResults.size > 0) {
                const lastResult = Array.from(nodeResults.values()).pop();
                document.getElementById('outputText').value = lastResult || '';
            }
            
        } catch (error) {
            console.error('Ошибка выполнения цепочки:', error);
            document.getElementById('outputText').value = 'Ошибка выполнения: ' + error.message;
        }
    }
    
    processNode(node, inputData) {
        const nodeData = node.data;
        
        try {
            switch (node.type) {
                case 'input':
                    return this.processInputNode(node, inputData);
                    
                case 'output':
                    return inputData;
                    
                case 'caesar':
                    return this.processCaesarCipher(nodeData, inputData);
                    
                case 'morse':
                    return this.processMorseCode(nodeData, inputData);
                    
                case 'numbers-to-words':
                    return this.processNumbersToWords(nodeData, inputData);
                    
                case 'math':
                    return this.processMath(nodeData, inputData);
                    
                case 'reverse':
                    return this.processReverse(nodeData, inputData);
                    
                case 'case-transform':
                    return this.processCaseTransform(nodeData, inputData);
                    
                default:
                    return inputData;
            }
        } catch (error) {
            console.error(`Ошибка в ноде ${node.type}:`, error);
            return `Ошибка: ${error.message}`;
        }
    }
    
    processInputNode(node, inputData) {
        const textField = node.data.fields.find(f => f.name === 'text');
        return textField ? textField.value : inputData;
    }
    
    processCaesarCipher(nodeData, text) {
        const shiftField = nodeData.fields.find(f => f.name === 'shift');
        const shift = parseInt(shiftField?.value || 3);
        
        const isReverse = window.connectionManager?.reverseMode || false;
        const actualShift = isReverse ? -shift : shift;
        
        return text.replace(/[а-яё]/gi, (char) => {
            const isUpperCase = char === char.toUpperCase();
            const code = char.toLowerCase().charCodeAt(0);
            const start = 'а'.charCodeAt(0);
            const alphabetSize = 33; // а-я + ё
            
            let shifted = ((code - start + actualShift) % alphabetSize + alphabetSize) % alphabetSize;
            
            let result = String.fromCharCode(start + shifted);
            return isUpperCase ? result.toUpperCase() : result;
        }).replace(/[a-z]/gi, (char) => {
            const isUpperCase = char === char.toUpperCase();
            const code = char.toLowerCase().charCodeAt(0);
            const start = 'a'.charCodeAt(0);
            const alphabetSize = 26;
            
            let shifted = ((code - start + actualShift) % alphabetSize + alphabetSize) % alphabetSize;
            
            let result = String.fromCharCode(start + shifted);
            return isUpperCase ? result.toUpperCase() : result;
        });
    }
    
    processMorseCode(nodeData, text) {
        const modeField = nodeData.fields.find(f => f.name === 'mode');
        const mode = modeField?.value || 'encode';
        
        const isReverse = window.connectionManager?.reverseMode || false;
        const actualMode = (mode === 'encode' && !isReverse) || (mode === 'decode' && isReverse) ? 'encode' : 'decode';
        
        if (actualMode === 'encode') {
            return text.toUpperCase().split('').map(char => {
                return this.morseCode[char] || char;
            }).join(' ');
        } else {
            return text.split(/\s+/).map(code => {
                return this.reverseMorseCode[code] || code;
            }).join('');
        }
    }
    
    processNumbersToWords(nodeData, text) {
        const languageField = nodeData.fields.find(f => f.name === 'language');
        const modeField = nodeData.fields.find(f => f.name === 'mode');
        
        const language = languageField?.value || 'ru';
        const mode = modeField?.value || 'to_words';
        
        const isReverse = window.connectionManager?.reverseMode || false;
        const actualMode = (mode === 'to_words' && !isReverse) || (mode === 'to_numbers' && isReverse) ? 'to_words' : 'to_numbers';
        
        if (actualMode === 'to_words') {
            if (language === 'mix') {
                // Перемешанный режим - случайно выбираем язык для каждого числа
                return text.replace(/\d+/g, (match) => {
                    const num = match;
                    const usesRu = Math.random() > 0.5;
                    const dict = usesRu ? this.numbersRu : this.numbersEn;
                    return dict[num] || num;
                });
            } else {
                const dict = language === 'ru' ? this.numbersRu : this.numbersEn;
                return text.replace(/\d+/g, (match) => {
                    return dict[match] || match;
                });
            }
        } else {
            // Обратное преобразование - от слов к числам
            let result = text;
            
            // Заменяем русские числа
            for (const [num, word] of Object.entries(this.numbersRu)) {
                result = result.replace(new RegExp('\\b' + word + '\\b', 'gi'), num);
            }
            
            // Заменяем английские числа
            for (const [num, word] of Object.entries(this.numbersEn)) {
                result = result.replace(new RegExp('\\b' + word + '\\b', 'gi'), num);
            }
            
            return result;
        }
    }
    
    processMath(nodeData, text) {
        const operationField = nodeData.fields.find(f => f.name === 'operation');
        const valueField = nodeData.fields.find(f => f.name === 'value');
        
        const operation = operationField?.value || 'add';
        const value = parseFloat(valueField?.value || 1);
        
        const isReverse = window.connectionManager?.reverseMode || false;
        
        return text.replace(/\d+(\.\d+)?/g, (match) => {
            let num = parseFloat(match);
            let result;
            
            switch (operation) {
                case 'add':
                    result = isReverse ? num - value : num + value;
                    break;
                case 'subtract':
                    result = isReverse ? num + value : num - value;
                    break;
                case 'multiply':
                    result = isReverse ? num / value : num * value;
                    break;
                case 'divide':
                    result = isReverse ? num * value : num / value;
                    break;
                default:
                    result = num;
            }
            
            return Number.isInteger(result) ? result.toString() : result.toFixed(2);
        });
    }
    
    processReverse(nodeData, text) {
        const modeField = nodeData.fields.find(f => f.name === 'mode');
        const mode = modeField?.value || 'full';
        
        if (mode === 'full') {
            return text.split('').reverse().join('');
        } else if (mode === 'words') {
            return text.split(' ').map(word => word.split('').reverse().join('')).join(' ');
        }
        
        return text;
    }
    
    processCaseTransform(nodeData, text) {
        const modeField = nodeData.fields.find(f => f.name === 'mode');
        const mode = modeField?.value || 'upper';
        
        switch (mode) {
            case 'upper':
                return text.toUpperCase();
            case 'lower':
                return text.toLowerCase();
            case 'title':
                return text.replace(/\w\S*/g, (txt) => {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            case 'toggle':
                return text.split('').map(char => {
                    if (char === char.toUpperCase()) {
                        return char.toLowerCase();
                    } else {
                        return char.toUpperCase();
                    }
                }).join('');
            default:
                return text;
        }
    }
    
    // Методы для сохранения и загрузки схем
    exportScheme() {
        if (!window.nodeManager || !window.connectionManager) {
            throw new Error('Системы нодов не инициализированы');
        }
        
        const nodes = window.nodeManager.getAllNodes().map(node => ({
            id: node.id,
            type: node.type,
            x: node.x,
            y: node.y,
            data: node.data
        }));
        
        const connections = window.connectionManager.getAllConnections().map(conn => ({
            id: conn.id,
            from: conn.from.nodeId,
            to: conn.to.nodeId
        }));
        
        const scheme = {
            version: '1.0',
            created: new Date().toISOString(),
            nodes: nodes,
            connections: connections
        };
        
        return JSON.stringify(scheme, null, 2);
    }
    
    importScheme(schemeJson) {
        if (!window.nodeManager || !window.connectionManager) {
            throw new Error('Системы нодов не инициализированы');
        }
        
        const scheme = JSON.parse(schemeJson);
        
        // Очищаем текущую схему
        window.nodeManager.clearAllNodes();
        
        // Восстанавливаем ноды
        const nodeIdMapping = new Map();
        
        for (const nodeData of scheme.nodes) {
            const newNodeId = window.nodeManager.createNode(nodeData.type, nodeData.x, nodeData.y);
            nodeIdMapping.set(nodeData.id, newNodeId);
            
            // Восстанавливаем данные нода
            const node = window.nodeManager.nodes.get(newNodeId);
            if (node && nodeData.data) {
                node.data = nodeData.data;
                
                // Обновляем значения в элементах формы
                nodeData.data.fields?.forEach(field => {
                    const input = node.element.querySelector(`[name="${field.name}"]`);
                    if (input) {
                        input.value = field.value;
                    }
                });
            }
        }
        
        // Восстанавливаем соединения
        for (const connData of scheme.connections) {
            const fromNodeId = nodeIdMapping.get(connData.from);
            const toNodeId = nodeIdMapping.get(connData.to);
            
            if (fromNodeId && toNodeId) {
                const fromNode = window.nodeManager.nodes.get(fromNodeId);
                const toNode = window.nodeManager.nodes.get(toNodeId);
                
                if (fromNode && toNode) {
                    const fromPoint = fromNode.element.querySelector('.connection-point.output');
                    const toPoint = toNode.element.querySelector('.connection-point.input');
                    
                    if (fromPoint && toPoint) {
                        window.connectionManager.createConnection(fromPoint, toPoint);
                    }
                }
            }
        }
        
        // Запускаем выполнение
        this.executeChain();
    }
}

// Инициализация после загрузки DOM
let cipherEngine;
document.addEventListener('DOMContentLoaded', () => {
    cipherEngine = new CipherEngine();
    window.cipherEngine = cipherEngine; // Делаем доступным глобально
});