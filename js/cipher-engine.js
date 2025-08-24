// === Движок шифрования и выполнения цепочки нодов ===

class CipherEngine {
    constructor() {
this.morseCode = {
            // Русский алфавит (кириллица) - корректные коды Морзе
            'А': '.-',      'Б': '-...',    'В': '.--',     'Г': '--.',     'Д': '-..',     
            'Е': '.',       'Ё': '.',       'Ж': '...-',    'З': '--..',    'И': '..',      
            'Й': '.---',    'К': '-.-',     'Л': '.-..',    'М': '--',      'Н': '-.',      
            'О': '---',     'П': '.--.',    'Р': '.-.',     'С': '...',     'Т': '-',       
            'У': '..-',     'Ф': '..-.',    'Х': '....',    'Ц': '-.-.',    'Ч': '---.',    
            'Ш': '----',    'Щ': '--.-',    'Ъ': '--.--',   'Ы': '-.--',    'Ь': '-..-',    
            'Э': '..-.',    'Ю': '..--',    'Я': '.-.-',
            
            // Английский алфавит (латиница) - стандартные коды Морзе
            'A': '.-',      'B': '-...',    'C': '-.-.',    'D': '-..',     'E': '.',
            'F': '..-.',    'G': '--.',     'H': '....',    'I': '..',      'J': '.---',
            'K': '-.-',     'L': '.-..',    'M': '--',      'N': '-.',      'O': '---',
            'P': '.--.',    'Q': '--.-',    'R': '.-.',     'S': '...',     'T': '-',
            'U': '..-',     'V': '...-',    'W': '.--',     'X': '-..-',    'Y': '-.--',
            'Z': '--..',
            
            // Цифры
            '0': '-----',   '1': '.----',   '2': '..---',   '3': '...--',   '4': '....-',
            '5': '.....',   '6': '-....',   '7': '--...',   '8': '---..',   '9': '----.',
            
            // Знаки препинания и специальные символы
            ' ': '/',       '.': '.-.-.-',  ',': '--..--',  '?': '..--..',  "'": '.----.',
            '!': '-.-.--',  '/': '-..-.',   '(': '-.--.',   ')': '-.--.-',  '&': '.-...',
            ':': '---...',  ';': '-.-.-.',  '=': '-...-',   '+': '.-.-.',   '-': '-....-',
            '_': '..--.-',  '"': '.-..-.',  '$': '...-..-', '@': '.--.-.'
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
            const executionOrder = window.connectionManager.getExecutionOrder();
            const isReverseMode = window.connectionManager.reverseMode;
            const nodeResults = new Map();

            const initialInputElement = isReverseMode ? document.getElementById('outputText') : document.getElementById('inputText');
            const initialInputText = initialInputElement ? initialInputElement.value : '';

            for (const nodeId of executionOrder) {
                const node = window.nodeManager.nodes.get(nodeId);
                if (!node) continue;

                let inputData = '';
                const connections = window.connectionManager.getNodeConnections(nodeId);

                // ================== НАЧАЛО ИСПРАВЛЕННОЙ ЛОГИКИ ==================

                // Определяем, откуда брать данные для текущего узла.
                const isNormalStartNode = !isReverseMode && node.type === 'input';
                const isReverseStartNode = isReverseMode && node.type === 'output';

                if (isNormalStartNode || isReverseStartNode) {
                    // Это стартовый узел для текущего режима. Берем текст из соответствующего поля ввода.
                    inputData = initialInputText;
                } else {
                    // Это промежуточный или конечный узел. Берем данные от предыдущего обработанного узла.
                    if (isReverseMode) {
                        // В РЕЖИМЕ РАСШИФРОВКИ:
                        // Данные приходят от узла, в который этот узел ВЫДАВАЛ данные в обычном режиме.
                        // Этот узел (источник) уже был обработан, т.к. порядок выполнения обратный.
                        // Ищем источник данных в "старых" исходящих соединениях (connections.outputs).
                        if (connections.outputs.length > 0) {
                            const sourceNodeId = connections.outputs[0].toNodeId;
                            inputData = nodeResults.get(sourceNodeId) || '';
                        }
                    } else {
                        // В ОБЫЧНОМ РЕЖИМЕ:
                        // Данные приходят от узла, который ВХОДИЛ в этот узел.
                        // Ищем источник данных во входящих соединениях (connections.inputs).
                        if (node.data.multipleInputs) {
                            inputData = {};
                            connections.inputs.forEach(conn => {
                                const inputName = conn.inputName || 'default';
                                const sourceNodeId = conn.fromNodeId;
                                inputData[inputName] = nodeResults.get(sourceNodeId) || '';
                            });
                        } else if (connections.inputs.length > 0) {
                            const sourceNodeId = connections.inputs[0].fromNodeId;
                            inputData = nodeResults.get(sourceNodeId) || '';
                        }
                    }
                }

                // =================== КОНЕЦ ИСПРАВЛЕННОЙ ЛОГИКИ ===================

                // Выполняем обработку в ноде
                const result = this.processNode(node, inputData, nodeResults);
                nodeResults.set(nodeId, result);

                // Выводим результат в соответствующее поле, если это конечный узел
                const isNormalEndNode = !isReverseMode && node.type === 'output';
                const isReverseEndNode = isReverseMode && node.type === 'input';

                if (isNormalEndNode || isReverseEndNode) {
                    const outputElement = isReverseMode ? document.getElementById('inputText') : document.getElementById('outputText');
                    if (outputElement) {
                        outputElement.value = result;
                    }
                }
            }

            // Обработка случая, если цепочка не доходит до конечного узла (input/output)
            const endNodes = window.nodeManager.getAllNodes().filter(n => 
                isReverseMode ? n.type === 'input' : n.type === 'output'
            );
            if (endNodes.length === 0 && executionOrder.length > 0) {
                const lastNodeId = executionOrder[executionOrder.length - 1];
                const lastResult = nodeResults.get(lastNodeId);
                const outputElement = isReverseMode ? document.getElementById('inputText') : document.getElementById('outputText');
                if (outputElement) {
                    outputElement.value = lastResult || '';
                }
            }
            
        } catch (error) {
            console.error('Ошибка выполнения цепочки:', error);
            const isReverseMode = window.connectionManager?.reverseMode;
            const outputElement = isReverseMode ? 
                document.getElementById('inputText') : 
                document.getElementById('outputText');
            if(outputElement) outputElement.value = 'Ошибка выполнения: ' + error.message;
        }
    }
    
    processNode(node, inputData, allNodeResults) {
        const nodeData = node.data;
        
        try {
            switch (node.type) {
                case 'input':
                    return this.processInputNode(node, inputData);
                    
                case 'output':
                    // В режиме шифрования output нод просто возвращает то, что получил.
                    // В режиме расшифровки он является стартовой точкой, и его обработка
                    // происходит в executeChain, поэтому здесь тоже просто возвращаем inputData.
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
                    return this.processVigenereCipher(nodeData, inputData, allNodeResults);
                    
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
        // Этот узел либо является стартовой точкой (в режиме шифрования),
        // либо конечной (в режиме расшифровки). В обоих случаях он просто
        // возвращает данные, которые ему передали из executeChain.
        return inputData;
    }
    
    processCaesarCipher(nodeData, text) {
        const shiftField = nodeData.fields.find(f => f.name === 'shift');
        const shift = parseInt(shiftField?.value || 3);
        
        const isReverse = window.connectionManager?.reverseMode || false;
        const actualShift = isReverse ? -shift : shift;
        
        if (typeof text !== 'string') return ''; // Защита от ошибок, если на вход пришло не то
        
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
        
        return actualMode === 'encode' ? this._morseEncode(text) : this._morseDecode(text);
    }

    _morseEncode(text) {
        if (typeof text !== 'string') return '';
        return text.toUpperCase().split('').map(char => {
            return this.morseCode[char] || ''; 
        }).join(' ');
    }

    _morseDecode(morseText) {
        if (typeof morseText !== 'string') return '';
        return morseText.split(' / ').map(word => 
            word.split(' ').map(code => this.reverseMorseCode[code] || '').join('')
        ).join(' ');
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
                // Перемешанный режим с фиксированным seed для стабильности
                // Сбрасываем генератор для каждого нового преобразования
                this.seededRandom = this.createSeededRandom(42);
                
                return text.replace(/\d/g, (digit) => {
                    const usesRu = this.seededRandom() > 0.5;
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
            
            // Создаем комбинированный словарь для более эффективного поиска
            const allNumbers = {...this.reverseNumbersRu, ...this.reverseNumbersEn};
            
            // Сначала заменяем длинные слова, потом короткие (чтобы избежать конфликтов)
            const sortedEntries = Object.entries(allNumbers).sort((a, b) => b[0].length - a[0].length);
            
            for (const [word, num] of sortedEntries) {
                // Используем более гибкий поиск, который работает и без пробелов
                const regex = new RegExp(this.escapeRegExp(word), 'gi');
                result = result.replace(regex, num);
            }
            
            return result;
        }
    }

    createSeededRandom(seed) {
        let state = seed;
        return function() {
            state = (state * 9301 + 49297) % 233280;
            return state / 233280;
        };
    }
    

    // Вспомогательная функция для экранирования специальных символов в регулярных выражениях
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    processMath(nodeData, text) {
        const operationField = nodeData.fields.find(f => f.name === 'operation');
        const valueField = nodeData.fields.find(f => f.name === 'value');
        
        const operation = operationField?.value || 'add';
        const value = parseFloat(valueField?.value || 1);
        
        const isReverse = window.connectionManager?.reverseMode || false;
        
        if (typeof text !== 'string') return '';
        
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
                    if (value === 0) return isReverse ? 'Ошибка: деление на 0' : 0;
                    result = isReverse ? num / value : num * value;
                    break;
                case 'divide':
                    if (num === 0 && isReverse) return 'Ошибка: деление на 0';
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
        
        if (typeof text !== 'string') return '';
        
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
        
        if (typeof text !== 'string') return '';
        
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
                node.data = JSON.parse(JSON.stringify(nodeData.data)); // Глубокое копирование
                
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
    
    processVigenereCipher(node, inputData, allNodeResults) {
        const isReverse = window.connectionManager?.reverseMode || false;

        const connections = window.connectionManager.getNodeConnections(node.id);
        
        const keyConnection = connections.inputs.find(c => c.inputName === 'key');
        const keySourceNodeId = keyConnection?.fromNodeId;
        const key = keySourceNodeId ? (allNodeResults.get(keySourceNodeId) || '') : 'DEFAULT_KEY';

        let text = '';
        if (isReverse) {
            // В режиме расшифровки текст приходит от следующего нода в цепочке
            text = inputData;
        } else {
            // В режиме шифрования текст приходит от своего входа 'text'
            const textConnection = connections.inputs.find(c => c.inputName === 'text');
            const textSourceNodeId = textConnection?.fromNodeId;
            text = textSourceNodeId ? (allNodeResults.get(textSourceNodeId) || '') : '';
        }

        // В режиме расшифровки (isReverse=true) нам нужно дешифровать (encrypt=false)
        return this.vigenereTransform(text, key, !isReverse);
    }
    
    vigenereTransform(text, key, encrypt = true) {
        if (!key || typeof text !== 'string') return text;

        const russianAlphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'; // 33 буквы
        const englishAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // 26 букв
        
        // "Очищаем" ключ, оставляя только буквы, которые есть в алфавитах
        const cleanKey = key.toUpperCase().split('').filter(char => 
            russianAlphabet.includes(char) || englishAlphabet.includes(char)
        ).join('');

        if (cleanKey.length === 0) return text; // Если ключ пустой, ничего не делаем

        let result = '';
        let keyIndex = 0;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const upperChar = char.toUpperCase();
            
            let alphabet = null;
            if (russianAlphabet.includes(upperChar)) {
                alphabet = russianAlphabet;
            } else if (englishAlphabet.includes(upperChar)) {
                alphabet = englishAlphabet;
            }

            if (alphabet) {
                const keyChar = cleanKey[keyIndex % cleanKey.length];
                const keyShift = alphabet.indexOf(keyChar);
                
                // Если символ ключа (что маловероятно после очистки) не найден, пропускаем шифрацию для этого символа
                if (keyShift === -1) {
                    result += char;
                    continue;
                }

                const charIndex = alphabet.indexOf(upperChar);
                let newIndex;
                
                if (encrypt) {
                    newIndex = (charIndex + keyShift) % alphabet.length;
                } else { // decrypt
                    newIndex = (charIndex - keyShift + alphabet.length) % alphabet.length;
                }
                
                const newChar = alphabet[newIndex];
                result += (char === upperChar) ? newChar : newChar.toLowerCase();
                keyIndex++;
            } else {
                result += char; // Если символ не из алфавита, добавляем как есть
            }
        }
        
        return result;
    }
    
    processA1Z26(nodeData, inputData) {
        const modeField = nodeData.fields.find(f => f.name === 'mode');
        const langField = nodeData.fields.find(f => f.name === 'language');
        const mode = modeField?.value || 'encode';
        const lang = langField?.value || 'ru';

        const isReverse = window.connectionManager?.reverseMode || false;
        const actualMode = (mode === 'encode' && !isReverse) || (mode === 'decode' && isReverse) ? 'encode' : 'decode';

        if (typeof inputData !== 'string') return '';

        const alphabets = {
            en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            ru: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
        };
        const currentAlphabet = alphabets[lang];

        if (actualMode === 'encode') {
            let result = '';
            for (let i = 0; i < inputData.length; i++) {
                const char = inputData[i];
                const upperChar = char.toUpperCase();
                const index = currentAlphabet.indexOf(upperChar);

                if (index !== -1) {
                    result += (index + 1);
                    if (i + 1 < inputData.length && currentAlphabet.includes(inputData[i + 1].toUpperCase())) {
                        result += '-';
                    }
                } else {
                    result += char;
                }
            }
            return result;
        } else { // 'decode'
            // Разделяем по пробелам, чтобы сохранить их
            return inputData.split(' ').map(word => {
                // Внутри слова разделяем по дефисам и преобразуем числа
                return word.split('-').map(part => {
                    const num = parseInt(part, 10);
                    if (!isNaN(num) && num >= 1 && num <= currentAlphabet.length) {
                        return currentAlphabet[num - 1];
                    }
                    return part; // Возвращаем как есть, если не число
                }).join('');
            }).join(' '); // Соединяем слова обратно пробелами
        }
    }
    
    processBrailleBinary(nodeData, inputData) {
        const modeField = nodeData.fields.find(f => f.name === 'mode');
        const mode = modeField?.value || 'encode';
        
        const isReverse = window.connectionManager?.reverseMode || false;
        const actualMode = (mode === 'encode' && !isReverse) || (mode === 'decode' && isReverse) ? 'encode' : 'decode';
        
        if (typeof inputData !== 'string') return '';
        
        if (actualMode === 'encode') {
            const morseText = this._morseEncode(inputData);
            return morseText
                .replace(/\./g, '0')
                .replace(/-/g, '1');
        } else {
            const morseText = inputData
                .replace(/0/g, '.')
                .replace(/1/g, '-');
            return this._morseDecode(morseText);
        }
    }

    // Обновленный processBrailleCat
    processBrailleCat(nodeData, inputData) {
        const modeField = nodeData.fields.find(f => f.name === 'mode');
        const mode = modeField?.value || 'encode';
        
        const isReverse = window.connectionManager?.reverseMode || false;
        const actualMode = (mode === 'encode' && !isReverse) || (mode === 'decode' && isReverse) ? 'encode' : 'decode';
        
        if (typeof inputData !== 'string') return '';
        
        if (actualMode === 'encode') {
            const morseText = this._morseEncode(inputData);
            return morseText
                .replace(/\//g, ' брряу ') 
                .replace(/\./g, 'мяу')
                .replace(/-/g, 'мрряу')
                .replace(/\s+/g, ' ').trim();
        } else {
            const morseText = inputData
                .toLowerCase()
                .replace(/брряу/g, '/')
                .replace(/мрряу/g, '-')
                .replace(/мяу/g, '.');
            return this._morseDecode(morseText);
        }
    }
}

// Инициализация после загрузки DOM
let cipherEngine;
document.addEventListener('DOMContentLoaded', () => {
    cipherEngine = new CipherEngine();
    window.cipherEngine = cipherEngine; // Делаем доступным глобально
});