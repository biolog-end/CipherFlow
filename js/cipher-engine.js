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
            '6': 'шесть', '7': 'семь', '8': 'восемь', '9': 'девять'
        };
        
        this.numbersEn = {
            '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five',
            '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'
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
            let executionOrder = window.connectionManager.getExecutionOrder();
            const isReverseMode = window.connectionManager.reverseMode;
            
            // В режиме дешифрования инвертируем порядок выполнения
            if (isReverseMode) {
                executionOrder = executionOrder.slice().reverse();
            }
            
            // Создаем карту для хранения результатов выполнения каждого нода
            const nodeResults = new Map();
            
            // Получаем входной текст в зависимости от режима
            const inputText = isReverseMode ? 
                document.getElementById('outputText').value : 
                document.getElementById('inputText').value;
            
            // Выполняем ноды в правильном порядке
            for (const nodeId of executionOrder) {
                const node = window.nodeManager.nodes.get(nodeId);
                if (!node) continue;
                
                let inputData = '';
                
                // В режиме дешифрования меняем логику input/output
                if (isReverseMode) {
                    if (node.type === 'output') {
                        // В режиме дешифрования output становится входом
                        inputData = inputText;
                    } else if (node.type === 'input') {
                        // В режиме дешифрования input становится выходом
                        const connections = window.connectionManager.getNodeConnections(nodeId);
                        if (connections.outputs.length > 0) {
                            const sourceNodeId = connections.outputs[0].toNodeId;
                            inputData = nodeResults.get(sourceNodeId) || '';
                        }
                    } else if (node.data.multipleInputs) {
                        // Для нодов с множественными входами в режиме дешифрования
                        const connections = window.connectionManager.getNodeConnections(nodeId);
                        inputData = {};
                        
                        // В режиме дешифрования берем данные от выходных соединений
                        connections.outputs.forEach(conn => {
                            const targetNodeId = conn.toNodeId;
                            const targetNode = window.nodeManager.nodes.get(targetNodeId);
                            if (targetNode) {
                                // Определяем какой это вход у исходного нода
                                const targetConnections = window.connectionManager.getNodeConnections(targetNodeId);
                                const inputConnection = targetConnections.inputs.find(ic => ic.fromNodeId === nodeId);
                                const inputName = inputConnection?.inputName || 'default';
                                inputData[inputName] = nodeResults.get(targetNodeId) || '';
                            }
                        });
                    } else {
                        // Для других нодов в режиме дешифрования
                        const connections = window.connectionManager.getNodeConnections(nodeId);
                        
                        if (connections.outputs.length > 0) {
                            // В режиме дешифрования берем данные от выходного нода
                            const targetNodeId = connections.outputs[0].toNodeId;
                            inputData = nodeResults.get(targetNodeId) || '';
                        } else if (node.data.hasOutput) {
                            inputData = '';
                        }
                    }
                } else {
                    // Обычный режим шифрования
                    if (node.type === 'input') {
                        inputData = inputText;
                    } else if (node.data.multipleInputs) {
                        const connections = window.connectionManager.getNodeConnections(nodeId);
                        inputData = {};
                        
                        connections.inputs.forEach(conn => {
                            const inputName = conn.inputName || 'default';
                            const sourceNodeId = conn.fromNodeId;
                            inputData[inputName] = nodeResults.get(sourceNodeId) || '';
                        });
                    } else {
                        const connections = window.connectionManager.getNodeConnections(nodeId);
                        
                        if (connections.inputs.length > 0) {
                            const sourceNodeId = connections.inputs[0].fromNodeId;
                            inputData = nodeResults.get(sourceNodeId) || '';
                        } else if (node.data.hasInput) {
                            inputData = '';
                        }
                    }
                }
                
                // Выполняем обработку в ноде
                const result = this.processNode(node, inputData);
                nodeResults.set(nodeId, result);
                
                // Выводим результат в соответствующее поле
                if ((node.type === 'output' && !isReverseMode) || (node.type === 'input' && isReverseMode)) {
                    const outputElement = isReverseMode ? 
                        document.getElementById('inputText') : 
                        document.getElementById('outputText');
                    outputElement.value = result;
                }
            }
            
            // Если нет соответствующего выходного нода, но есть результаты
            const outputNodes = window.nodeManager.getAllNodes().filter(n => 
                isReverseMode ? n.type === 'input' : n.type === 'output'
            );
            if (outputNodes.length === 0 && nodeResults.size > 0) {
                const lastResult = Array.from(nodeResults.values()).pop();
                const outputElement = isReverseMode ? 
                    document.getElementById('inputText') : 
                    document.getElementById('outputText');
                outputElement.value = lastResult || '';
            }
            
        } catch (error) {
            console.error('Ошибка выполнения цепочки:', error);
            const isReverseMode = window.connectionManager?.reverseMode;
            const outputElement = isReverseMode ? 
                document.getElementById('inputText') : 
                document.getElementById('outputText');
            outputElement.value = 'Ошибка выполнения: ' + error.message;
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
                    
                case 'secret-word':
                    return this.processSecretWord(nodeData, inputData);
                    
                case 'vigenere':
                    return this.processVigenereCipher(nodeData, inputData);
                    
                case 'a1z26':
                    return this.processA1Z26(nodeData, inputData);
                    
                case 'braille-binary':
                    return this.processBrailleBinary(nodeData, inputData);
                    
                case 'braille-cat':
                    return this.processBrailleCat(nodeData, inputData);
                    
                default:
                    return inputData;
            }
        } catch (error) {
            console.error(`Ошибка в ноде ${node.type}:`, error);
            return `Ошибка: ${error.message}`;
        }
    }
    
    processInputNode(node, inputData) {
        // Нод ввода берет текст из соответствующего поля в зависимости от режима
        const isReverseMode = window.connectionManager?.reverseMode;
        const inputElement = isReverseMode ? 
            document.getElementById('outputText') : 
            document.getElementById('inputText');
        return inputElement ? inputElement.value : '';
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
                // Перемешанный режим - случайно выбираем язык для каждой цифры
                return text.replace(/\d/g, (digit) => {
                    const usesRu = Math.random() > 0.5;
                    const dict = usesRu ? this.numbersRu : this.numbersEn;
                    return dict[digit] || digit;
                });
            } else {
                const dict = language === 'ru' ? this.numbersRu : this.numbersEn;
                // Заменяем каждую цифру отдельно
                return text.replace(/\d/g, (digit) => {
                    return dict[digit] || digit;
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
    
    processSecretWord(nodeData, inputData) {
        const keywordField = nodeData.fields.find(f => f.name === 'keyword');
        return keywordField?.value || 'СЕКРЕТ';
    }
    
    processVigenereCipher(nodeData, inputData) {
        // Для шифра Виженера нужно получить ключ и текст от разных нодов
        // inputData теперь должен быть объектом с полями key и text
        let key = '';
        let text = '';
        
        if (typeof inputData === 'object' && inputData !== null) {
            key = inputData.key || '';
            text = inputData.text || '';
        } else {
            // Если inputData - строка, используем её как текст
            text = inputData;
            key = 'КЛЮЧ'; // Значение по умолчанию
        }
        
        const isReverse = window.connectionManager?.reverseMode || false;
        
        return this.vigenereTransform(text, key, !isReverse);
    }
    
    vigenereTransform(text, key, encrypt = true) {
        if (!key) return text;
        
        const russianAlphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
        const englishAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        let result = '';
        let keyIndex = 0;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i].toUpperCase();
            let alphabet = '';
            
            if (russianAlphabet.includes(char)) {
                alphabet = russianAlphabet;
            } else if (englishAlphabet.includes(char)) {
                alphabet = englishAlphabet;
            } else {
                result += text[i];
                continue;
            }
            
            const keyChar = key[keyIndex % key.length].toUpperCase();
            const keyShift = russianAlphabet.includes(keyChar) ? 
                russianAlphabet.indexOf(keyChar) : 
                (englishAlphabet.includes(keyChar) ? englishAlphabet.indexOf(keyChar) : 0);
            
            const charIndex = alphabet.indexOf(char);
            let newIndex;
            
            if (encrypt) {
                newIndex = (charIndex + keyShift) % alphabet.length;
            } else {
                newIndex = (charIndex - keyShift + alphabet.length) % alphabet.length;
            }
            
            const newChar = alphabet[newIndex];
            result += text[i] === text[i].toLowerCase() ? newChar.toLowerCase() : newChar;
            keyIndex++;
        }
        
        return result;
    }
    
    processA1Z26(nodeData, inputData) {
        const modeField = nodeData.fields.find(f => f.name === 'mode');
        const mode = modeField?.value || 'encode';
        
        const isReverse = window.connectionManager?.reverseMode || false;
        const actualMode = (mode === 'encode' && !isReverse) || (mode === 'decode' && isReverse) ? 'encode' : 'decode';
        
        if (actualMode === 'encode') {
            return inputData.replace(/[а-яё]/gi, char => {
                const upperChar = char.toUpperCase();
                const code = upperChar.charCodeAt(0) - 'А'.charCodeAt(0) + 1;
                return code;
            }).replace(/[a-z]/gi, char => {
                const upperChar = char.toUpperCase();
                const code = upperChar.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
                return code;
            });
        } else {
            return inputData.replace(/\b(\d+)\b/g, (match, num) => {
                const n = parseInt(num);
                if (n >= 1 && n <= 33) {
                    return String.fromCharCode('А'.charCodeAt(0) + n - 1);
                } else if (n >= 1 && n <= 26) {
                    return String.fromCharCode('A'.charCodeAt(0) + n - 1);
                }
                return match;
            });
        }
    }
    
    processBrailleBinary(nodeData, inputData) {
        const modeField = nodeData.fields.find(f => f.name === 'mode');
        const mode = modeField?.value || 'encode';
        
        const isReverse = window.connectionManager?.reverseMode || false;
        const actualMode = (mode === 'encode' && !isReverse) || (mode === 'decode' && isReverse) ? 'encode' : 'decode';
        
        // Бинарная модификация Морзе: точка = 0, тире = 1, пробел между символами = пробел
        if (actualMode === 'encode') {
            // Сначала преобразуем в Морзе
            const morseText = this.processMorseCode({ fields: [{ name: 'mode', value: 'encode' }] }, inputData);
            // Затем преобразуем точки в 0, тире в 1
            return morseText
                .replace(/\./g, '0')
                .replace(/-/g, '1')
                .replace(/\//g, ' ');
        } else {
            // Сначала преобразуем 0 в точки, 1 в тире
            const morseText = inputData
                .replace(/0/g, '.')
                .replace(/1/g, '-');
            // Затем декодируем из Морзе
            return this.processMorseCode({ fields: [{ name: 'mode', value: 'decode' }] }, morseText);
        }
    }
    
    processBrailleCat(nodeData, inputData) {
        const modeField = nodeData.fields.find(f => f.name === 'mode');
        const mode = modeField?.value || 'encode';
        
        const isReverse = window.connectionManager?.reverseMode || false;
        const actualMode = (mode === 'encode' && !isReverse) || (mode === 'decode' && isReverse) ? 'encode' : 'decode';
        
        // Кошачья модификация Морзе: точка = мяу, тире = мрряу, пробел между буквами = брряу
        if (actualMode === 'encode') {
            // Сначала преобразуем в Морзе
            const morseText = this.processMorseCode({ fields: [{ name: 'mode', value: 'encode' }] }, inputData);
            // Затем преобразуем точки в мяу, тире в мрряу, слэш (разделитель слов) в брряу
            return morseText
                .replace(/\//g, ' брряу ') // сначала заменяем разделители слов
                .replace(/\./g, 'мяу')
                .replace(/-/g, 'мрряу')
                .replace(/\s+/g, ' '); // нормализуем пробелы
        } else {
            // Сначала преобразуем мяу в точки, мрряу в тире, брряу в слэш
            const morseText = inputData
                .replace(/брряу/g, '/')
                .replace(/мрряу/g, '-')
                .replace(/мяу/g, '.');
            // Затем декодируем из Морзе
            return this.processMorseCode({ fields: [{ name: 'mode', value: 'decode' }] }, morseText);
        }
    }
}

// Инициализация после загрузки DOM
let cipherEngine;
document.addEventListener('DOMContentLoaded', () => {
    cipherEngine = new CipherEngine();
    window.cipherEngine = cipherEngine; // Делаем доступным глобально
});