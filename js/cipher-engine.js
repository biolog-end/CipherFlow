// === Движок шифрования и выполнения цепочки нодов ===

class CipherEngine {
    constructor() {
        // Создаем отдельные таблицы для русского и английского морзе
        this.morseCodeRu = {
            // Русский алфавит (кириллица) - используем чуть другие символы
            'А': '·−',      'Б': '−···',    'В': '·−−',     'Г': '−−·',     'Д': '−··',     
            'Ё': '·',       'Е': '·',       'Ж': '···−',    'З': '−−··',    'И': '··',      
            'Й': '·−−−',    'К': '−·−',     'Л': '·−··',    'М': '−−',      'Н': '−·',      
            'О': '−−−',     'П': '·−−·',    'Р': '·−·',     'С': '···',     'Т': '−',       
            'У': '··−',     'Ф': '··−·',    'Х': '····',    'Ц': '−·−·',    'Ч': '−−−·',    
            'Ш': '−−−−',    'Щ': '−−·−',    'Ъ': '−−·−−',   'Ы': '−·−−',    'Ь': '−··−',    
            'Э': '···−···',    'Ю': '··−−',    'Я': '·−·−'
        };
        
        // Альтернативная таблица с отдельным кодом для Ё
        this.morseCodeRuWithYo = {
            // Русский алфавит (кириллица) с отдельным кодом для Ё
            'А': '·−',      'Б': '−···',    'В': '·−−',     'Г': '−−·',     'Д': '−··',     
            'Ё': '··−··',   'Е': '·',       'Ж': '···−',    'З': '−−··',    'И': '··',      
            'Й': '·−−−',    'К': '−·−',     'Л': '·−··',    'М': '−−',      'Н': '−·',      
            'О': '−−−',     'П': '·−−·',    'Р': '·−·',     'С': '···',     'Т': '−',       
            'У': '··−',     'Ф': '··−·',    'Х': '····',    'Ц': '−·−·',    'Ч': '−−−·',    
            'Ш': '−−−−',    'Щ': '−−·−',    'Ъ': '−−·−−',   'Ы': '−·−−',    'Ь': '−··−',    
            'Э': '···−···',    'Ю': '··−−',    'Я': '·−·−'
        };
        
        this.morseCodeEn = {
            // Английский алфавит (латиница) - стандартные коды Морзе
            'A': '.-',      'B': '-...',    'C': '-.-.',    'D': '-..',     'E': '.',
            'F': '..-.',    'G': '--.',     'H': '....',    'I': '..',      'J': '.---',
            'K': '-.-',     'L': '.-..',    'M': '--',      'N': '-.',      'O': '---',
            'P': '.--.',    'Q': '--.-',    'R': '.-.',     'S': '...',     'T': '-',
            'U': '..-',     'V': '...-',    'W': '.--',     'X': '-..-',    'Y': '-.--',
            'Z': '--..'
        };
        
        // Объединяем таблицы для общего использования
        this.morseCode = {
            ...this.morseCodeRu,
            ...this.morseCodeEn,
            
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
    
    // Метод для получения символов и цифр в коде Морзе
    getNumbersAndSymbolsMorse() {
        return {
            // Цифры
            '0': '-----',   '1': '.----',   '2': '..---',   '3': '...--',   '4': '....-',
            '5': '.....',   '6': '-....',   '7': '--...',   '8': '---..',   '9': '----.',
            
            // Знаки препинания и специальные символы
            ' ': '/',       '.': '.-.-.-',  ',': '--..--',  '?': '..--..',  "'": '.----.',
            '!': '-.-.--',  '/': '-..-.',   '(': '-.--.',   ')': '-.--.-',  '&': '.-...',
            ':': '---...',  ';': '-.-.-.',  '=': '-...-',   '+': '.-.-.',   '-': '-....-',
            '_': '..--.-',  '"': '.-..-.',  '$': '...-..-', '@': '.--.-.'
        };
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
                    return this.processVigenereCipher(node, inputData, allNodeResults);
                    
                case 'a1z26':
                    return this.processA1Z26(nodeData, inputData);
                    
                case 'binary':
                    return this.processBinary(nodeData, inputData);
                    
                case 'monitor':
                    return this.processMonitor(node, inputData);
                    
                case 'braille-cat':
                    return this.processBrailleCat(nodeData, inputData);
                    
                case 'planet-enchanter':
                    return this.processPlanetEnchanter(nodeData, inputData);
                    
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
        const supportYoField = nodeData.fields.find(f => f.name === 'supportYo');
        
        const mode = modeField?.value || 'encode';
        const supportYo = supportYoField?.value === 'true' || supportYoField?.value === true;
        
        const isReverse = window.connectionManager?.reverseMode || false;
        const actualMode = (mode === 'encode' && !isReverse) || (mode === 'decode' && isReverse) ? 'encode' : 'decode';
        
        return actualMode === 'encode' ? this._morseEncode(text, supportYo) : this._morseDecode(text, supportYo);
    }

    _morseEncode(text, supportYo = false) {
        if (typeof text !== 'string') return '';
        
        // Выбираем нужную таблицу Морзе в зависимости от настройки
        const morseTable = supportYo ? 
            { ...this.morseCodeRuWithYo, ...this.morseCodeEn, ...this.getNumbersAndSymbolsMorse() } :
            this.morseCode;
        
        return text.split('\n').map(line => {
           
            return line.toUpperCase().split('').map(char => {
                return morseTable[char] || ''; 
            }).join(' ');
        }).join('\n'); 
    }

    _morseDecode(morseText, supportYo = false) {
        if (typeof morseText !== 'string') return '';
        
        // Создаем обратную таблицу в зависимости от настройки
        let reverseMorseTable;
        if (supportYo) {
            const fullMorseTable = { ...this.morseCodeRuWithYo, ...this.morseCodeEn, ...this.getNumbersAndSymbolsMorse() };
            reverseMorseTable = {};
            for (const [key, value] of Object.entries(fullMorseTable)) {
                reverseMorseTable[value] = key;
            }
        } else {
            reverseMorseTable = this.reverseMorseCode;
        }
        
        return morseText.split('\n').map(line => {
            return line
                .trim() 
                .split(/\s*\/\s*/) 
                .map(word => 
                    word.split(' ').filter(code => code) 
                        .map(code => reverseMorseTable[code] || '')
                        .join('')
                ).join(' ');
        }).join('\n'); 
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
                    // Проверка деления на ноль при дешифрации
                    if (value === 0) return isReverse ? 'Ошибка: деление на 0' : 0;
                    result = isReverse ? num / value : num * value;
                    break;
                case 'divide':
                    // Проверка деления на ноль при шифрации
                    if (value === 0) return isReverse ? num * value : 'Ошибка: деление на 0';
                    result = isReverse ? num * value : num / value;
                    break;
                default:
                    result = num;
            }
            
            return result.toString();
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
        
        const connections = window.connectionManager.getAllConnections().map(conn => {
            const connData = {
                id: conn.id,
                from: conn.from.nodeId,
                to: conn.to.nodeId
            };
            
            // Сохраняем имя входа для множественных входов
            if (conn.to.element && conn.to.element.dataset.inputName) {
                connData.inputName = conn.to.element.dataset.inputName;
            }
            
            return connData;
        });
        
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
            // === ИЗМЕНЕНИЕ ЗДЕСЬ: добавлен 'true' в качестве четвертого аргумента ===
            // Это говорит функции, что nodeData.x и nodeData.y уже являются "мировыми" координатами
            const newNodeId = window.nodeManager.createNode(nodeData.type, nodeData.x, nodeData.y, true);
            nodeIdMapping.set(nodeData.id, newNodeId);

            // Восстанавливаем данные нода
            const node = window.nodeManager.nodes.get(newNodeId);
            if (node && nodeData.data) {
                node.data = JSON.parse(JSON.stringify(nodeData.data)); // Глубокое копирование

                // Обновляем значения в элементах формы
                nodeData.data.fields?.forEach(field => {
                    const input = node.element.querySelector(`[name="${field.name}"]`);
                    if (input) {
                        if (input.type === 'checkbox') {
                            input.checked = field.value;
                        } else {
                            input.value = field.value;
                        }
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
                    let toPoint;

                    // Проверяем, есть ли у соединения имя входа (для множественных входов)
                    if (connData.inputName) {
                        toPoint = toNode.element.querySelector(`.connection-point.input[data-input-name="${connData.inputName}"]`);
                    }

                    // Если не нашли специфический вход или его нет, используем обычный
                    if (!toPoint) {
                        toPoint = toNode.element.querySelector('.connection-point.input');
                    }

                    if (fromPoint && toPoint) {
                        window.connectionManager.createConnection(fromPoint, toPoint);
                    }
                }
            }
        }

        // Обновляем все соединения после небольшой задержки для корректного позиционирования
        setTimeout(() => {
            // Обновляем позиции всех соединений
            for (const [nodeId] of window.nodeManager.nodes) {
                window.connectionManager.updateConnections(nodeId);
            }

            // Запускаем выполнение
            this.executeChain();
        }, 470);
    }
    
    processSecretWord(nodeData, inputData) {
        const keywordField = nodeData.fields.find(f => f.name === 'keyword');
        return keywordField?.value || 'СЕКРЕТ';
    }

    processVigenereCipher(node, inputData, allNodeResults) {
        const isReverse = window.connectionManager?.reverseMode || false;

        if (isReverse) {
            // Логика дешифровки, которая была исправлена в прошлый раз, остается корректной
            const textToDecrypt = inputData || '';
            let key = 'DEFAULT_KEY';

            const connections = window.connectionManager.getNodeConnections(node.id);
            const keyConnection = connections.inputs.find(c => c.inputName === 'key');
            
            if (keyConnection) {
                const keySourceNodeId = keyConnection.fromNodeId;
                const keySourceNode = window.nodeManager.nodes.get(keySourceNodeId);
                
                if (keySourceNode) {
                    key = this.processNode(keySourceNode, null, allNodeResults);
                }
            }
            
            return this.vigenereTransform(textToDecrypt, key, false);

        } else { // Режим шифрования
            // [ИСПРАВЛЕНО] Корректно обрабатываем ситуацию, когда текст не подан на вход
            const textToEncrypt = (typeof inputData === 'object' && inputData !== null) ? (inputData.text || '') : (inputData || '');
            const key = (typeof inputData === 'object' && inputData !== null) ? (inputData.key || 'DEFAULT_KEY') : 'DEFAULT_KEY';
            
            return this.vigenereTransform(textToEncrypt, key, true);
        }
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
            const regex = new RegExp(`[${currentAlphabet}]+`, 'gi');

            return inputData.replace(regex, (word) => {

                return word.split('').map(char => {
                    const index = currentAlphabet.indexOf(char.toUpperCase());
                    
                    return index + 1;
                }).join('-'); 
            });

        } else { // 'decode'
            
            // ================== НАЧАЛО ИЗМЕНЕНИЯ 1: РЕГУЛЯРНОЕ ВЫРАЖЕНИЕ ==================
            // Обновлено, чтобы корректно обрабатывать числа с точками (например, 1.002) как единое целое.
            const regex = /\b(\d+(\.\d+)*(-\d+(\.\d+)*)*)\b/g;
            // =================== КОНЕЦ ИЗМЕНЕНИЯ 1: РЕГУЛЯРНОЕ ВЫРАЖЕНИЕ ===================
            
            return inputData.replace(regex, (match) => {
                
                const convertNumToLetter = (numStr) => {
                    const num = parseInt(numStr, 10);
                    if (!isNaN(num) && num >= 1 && num <= currentAlphabet.length) {
                        return currentAlphabet[num - 1];
                    }
                    return numStr; // Возвращаем как есть, если не удалось конвертировать
                };

                return match.split('-').map(part => {
                    // ================== НАЧАЛО ИЗМЕНЕНИЯ 2: ЛОГИКА ОБРАБОТКИ ==================
                    if (part.includes('.')) {
                        return part.split('.').map(subPart => {
                            // Ищем ведущие нули и само число
                            const numberMatch = subPart.match(/^(0*)(\d+)$/);
                            
                            if (numberMatch) {
                                const leadingZeros = numberMatch[1]; // например, "00" из "002"
                                const numberValue = numberMatch[2];  // например, "2" из "002"
                                
                                // Конвертируем только числовую часть
                                const letter = convertNumToLetter(numberValue);
                                
                                // Если конвертация не удалась (число вне диапазона), возвращаем исходную часть
                                if (letter === numberValue) {
                                    return subPart;
                                }
                                
                                // Возвращаем ведущие нули вместе с новой буквой
                                return leadingZeros + letter;
                            }
                            
                            // Если часть не является числом (например, в "1.abc"), возвращаем как есть
                            return subPart;
                        }).join('.');
                    }
                    // =================== КОНЕЦ ИЗМЕНЕНИЯ 2: ЛОГИКА ОБРАБОТКИ ===================
                    return convertNumToLetter(part);
                }).join('');
            });
        }
    }
    
    processBinary(nodeData, inputData) {
        const modeField = nodeData.fields.find(f => f.name === 'mode');
        const mode = modeField?.value || 'encode';
        
        const isReverse = window.connectionManager?.reverseMode || false;
        const actualMode = (mode === 'encode' && !isReverse) || (mode === 'decode' && isReverse) ? 'encode' : 'decode';
        
        if (typeof inputData !== 'string') return '';
        
        if (actualMode === 'encode') {

            const encoder = new TextEncoder();
            const utf8Bytes = encoder.encode(inputData); 
            
            return Array.from(utf8Bytes).map(byte => {
                return byte.toString(2).padStart(8, '0');
            }).join(' ');
        } else {
            const binaryStrings = inputData.match(/[01]{8}/g); 
            
            if (!binaryStrings || binaryStrings.length === 0) {
                return "Ошибка: Некорректный бинарный ввод для дешифровки.";
            }
            
            const utf8Bytes = new Uint8Array(binaryStrings.map(binary => parseInt(binary, 2)));
            
            const decoder = new TextDecoder('utf-8'); 
            try {
                return decoder.decode(utf8Bytes);
            } catch (e) {
                console.error("Binary decode error:", e);
                return "Ошибка декодирования бинарного кода: " + e.message;
            }
        }
    }
    
    processMonitor(node, inputData) {
        if (node.element) {
            const display = node.element.querySelector('.monitor-display');
            if (display) {
                const isReverse = window.connectionManager?.reverseMode || false;
                const direction = isReverse ? '⬅ Дешифровка' : '➡ Шифровка';
                
                const formattedInput = (inputData || 'Пусто').replace(/\n/g, '<br>');
                
                display.innerHTML = `<small style="color: var(--accent-primary);">${direction}</small><br>${formattedInput}`;
            }
        }
        return inputData;
    }

    _decodeCatMorseWord(word) {
        let result = '';
        let remainingWord = word;
        while (remainingWord.length > 0) {
            if (remainingWord.startsWith('мрряу')) {
                result += '−';
                remainingWord = remainingWord.substring(5);
            } else if (remainingWord.startsWith('myau')) {
                result += '-';
                remainingWord = remainingWord.substring(4);
            } else if (remainingWord.startsWith('мяу')) {
                result += '·';
                remainingWord = remainingWord.substring(3);
            } else if (remainingWord.startsWith('nyan')) {
                result += '.';
                remainingWord = remainingWord.substring(3);
            } else {
                remainingWord = remainingWord.substring(1);
            }
        }
        return result;
    }

    processBrailleCat(nodeData, inputData) {
        const modeField = nodeData.fields.find(f => f.name === 'mode');
        const supportYoField = nodeData.fields.find(f => f.name === 'supportYo');
        
        const mode = modeField?.value || 'encode';
        const supportYo = supportYoField?.value === 'true' || supportYoField?.value === true;
        
        const isReverse = window.connectionManager?.reverseMode || false;
        const actualMode = (mode === 'encode' && !isReverse) || (mode === 'decode' && isReverse) ? 'encode' : 'decode';
        
        if (typeof inputData !== 'string') return '';
        
        if (actualMode === 'encode') {
            
            const morseText = this._morseEncode(inputData, supportYo);
            return morseText
                .replace(/\//g, ' брряу ')
                .replace(/·/g, 'мяу')
                .replace(/−/g, 'мрряу')
                .replace(/\./g, 'nyan')
                .replace(/-/g, 'myau')
                .replace(/ +/g, ' ').trim(); 
        } else { // decode

            const catLines = inputData.toLowerCase().trim().split('\n');
            
            const morseLines = catLines.map(line => {
                const catWords = line.split(/\s+/);
                
                return catWords.map(word => {
                    if (word === 'брряу') {
                        return '/';
                    }
                    return this._decodeCatMorseWord(word);
                }).join(' '); 
            });
            
            const morseText = morseLines.join('\n');
            return this._morseDecode(morseText, supportYo);
        }
    }
    
    // Метод для обработки "Зачаровывателя планет"
    processPlanetEnchanter(nodeData, inputData) {
        const modeField = nodeData.fields.find(f => f.name === 'mode');
        const languageField = nodeData.fields.find(f => f.name === 'language');
        
        const mode = modeField?.value || 'encode';
        const language = languageField?.value || 'ru';
        
        const isReverse = window.connectionManager?.reverseMode || false;
        const actualMode = (mode === 'encode' && !isReverse) || (mode === 'decode' && isReverse) ? 'encode' : 'decode';
        
        if (typeof inputData !== 'string') return '';
        
        if (actualMode === 'encode') {
            return this._planetEncode(inputData, language);
        } else {
            return this._planetDecode(inputData, language);
        }
    }
    
    _planetEncode(text, language) {
        const alphabetRu = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
        const alphabetEn = 'abcdefghijklmnopqrstuvwxyz';
        
        const seededRandom = this.createSeededRandom(42);
        
        let result = '';
        
        for (let char of text.toLowerCase()) {
            if (char === ' ') {
                result += '\n';
                continue;
            }
            
            let cities = null;
            if (alphabetRu.includes(char) && (language === 'ru' || language === 'mix')) {
                cities = this.citiesRu[char];
            } else if (alphabetEn.includes(char) && (language === 'en' || language === 'mix')) {
                cities = this.citiesEn[char];
            }
            
            if (cities && cities.length > 0) {
                const randomIndex = Math.floor(seededRandom() * cities.length);
                const randomCity = cities[randomIndex];
                result += randomCity.coord + '\n';
            } else {
                result += char + '\n';
            }
        }
        
        return result.trim();
    }
    
    _planetDecode(coordinates, language) {
        const lines = coordinates.split('\n');
        let result = '';

        for (let line of lines) {
            const coord = line.trim();
            if (coord === '') {
                result += ' ';
                continue;
            }

            let found = false;
            
            // Функция для сравнения координат как чисел, а не как строк
            const compareCoords = (cityCoordStr, inputCoordStr) => {
                const cityParts = cityCoordStr.split(',').map(s => s.trim());
                const inputParts = inputCoordStr.split(',').map(s => s.trim());

                if (cityParts.length !== 2 || inputParts.length !== 2) {
                    return false; // Неверный формат координат
                }

                // Преобразуем строки в числа с плавающей точкой
                const cityLat = parseFloat(cityParts[0]);
                const cityLon = parseFloat(cityParts[1]);
                const inputLat = parseFloat(inputParts[0]);
                const inputLon = parseFloat(inputParts[1]);
                
                // Сравниваем именно числа
                return cityLat === inputLat && cityLon === inputLon;
            };

            // Поиск в русских городах
            if (language === 'ru' || language === 'mix') {
                for (let [letter, cityList] of Object.entries(this.citiesRu)) {
                    // Используем новую функцию для поиска
                    const city = cityList.find(city => compareCoords(city.coord, coord));
                    if (city) {
                        result += letter;
                        found = true;
                        break;
                    }
                }
            }
            
            // Поиск в английских городах
            if (!found && (language === 'en' || language === 'mix')) {
                for (let [letter, cityList] of Object.entries(this.citiesEn)) {
                    // Используем новую функцию для поиска
                    const city = cityList.find(city => compareCoords(city.coord, coord));
                    if (city) {
                        result += letter;
                        found = true;
                        break;
                    }
                }
            }
            
            if (!found) {
                result += coord;
            }
        }
        
        return result;
    }
    
    // Данные городов для "Зачаровывателя планет"
    citiesRu = {
        'а': [
            {name: 'Архангельск', coord: '64.5401, 40.5433'},
            {name: 'Астрахань', coord: '46.3497, 48.0408'},
            {name: 'Анапа', coord: '44.8950, 37.3163'},
            {name: 'Армавир', coord: '45.0012, 41.1320'},
            {name: 'Амстердам', coord: '52.3676, 4.9041'},
            {name: 'Анадырь', coord: '64.7311, 177.5016'},
            {name: 'Арзамас', coord: '55.3949, 43.8402'},
            {name: 'Ангарск', coord: '52.5467, 103.8881'},
            {name: 'Азов', coord: '47.1139, 39.4222'},
            {name: 'Альметьевск', coord: '54.9033, 52.3150'}
        ],
        'б': [
            {name: 'Барнаул', coord: '53.3548, 83.7698'},
            {name: 'Белгород', coord: '50.5977, 36.5858'},
            {name: 'Брянск', coord: '53.2521, 34.3717'},
            {name: 'Благовещенск', coord: '50.2785, 127.5391'},
            {name: 'Балашиха', coord: '55.7963, 37.9382'},
            {name: 'Балаково', coord: '52.0275, 47.8009'},
            {name: 'Бийск', coord: '52.5414, 85.2072'},
            {name: 'Бузулук', coord: '52.7800, 52.2614'},
            {name: 'Бердск', coord: '54.7582, 83.1071'}
        ],
        'в': [
            {name: 'Владивосток', coord: '43.1056, 131.8735'},
            {name: 'Волгоград', coord: '48.7194, 44.5018'},
            {name: 'Воронеж', coord: '51.6720, 39.1843'},
            {name: 'Великий Новгород', coord: '58.5256, 31.2740'},
            {name: 'Вязьма', coord: '55.2122, 34.2918'},
            {name: 'Вичуга', coord: '57.2042, 41.9134'},
            {name: 'Волхов', coord: '59.9266, 32.3462'},
            {name: 'Воскресенск', coord: '55.3230, 38.6796'},
            {name: 'Валдай', coord: '57.9792, 33.2555'}
        ],
        'г': [
            {name: 'Грозный', coord: '43.3168, 45.6814'},
            {name: 'Гатчина', coord: '59.5650, 30.1281'},
            {name: 'Геленджик', coord: '44.5622, 38.0848'},
            {name: 'Гусь-Хрустальный', coord: '55.6198, 40.6578'},
            {name: 'Гдов', coord: '58.7456, 27.8259'},
            {name: 'Георгиевск', coord: '44.1487, 43.4733'},
            {name: 'Горячий Ключ', coord: '44.6348, 39.1353'},
            {name: 'Гуково', coord: '48.0574, 39.9349'},
            {name: 'Грязи', coord: '52.4945, 39.9337'}
        ],
        'д': [
            {name: 'Дербент', coord: '42.0578, 48.2890'},
            {name: 'Дзержинск', coord: '56.2389, 43.4631'},
            {name: 'Дмитров', coord: '56.3477, 37.5267'},
            {name: 'Долгопрудный', coord: '55.9452, 37.4992'},
            {name: 'Дубна', coord: '56.7338, 37.1650'},
            {name: 'Донецк', coord: '48.0159, 37.8029'},
            {name: 'Десногорск', coord: '54.1507, 33.2806'},
            {name: 'Дмитровск', coord: '52.1286, 35.0714'},
            {name: 'Духовщина', coord: '55.1935, 32.4123'}
        ],
        'е': [
            {name: 'Екатеринбург', coord: '56.8389, 60.6057'},
            {name: 'Елец', coord: '52.6217, 38.5035'},
            {name: 'Ессентуки', coord: '44.0444, 42.8606'},
            {name: 'Евпатория', coord: '45.1907, 33.3667'},
            {name: 'Егорьевск', coord: '55.3832, 39.0357'},
            {name: 'Елецкий', coord: '52.7206, 38.4756'},
            {name: 'Енисейск', coord: '58.4485, 92.1769'},
            {name: 'Ершов', coord: '51.3505, 48.2828'},
            {name: 'Емва', coord: '62.5979, 50.8493'}
        ],
        'ё': [
            {name: 'Ёлки', coord: '56.8584, 60.6057'},
            {name: 'Ёж', coord: '52.6217, 38.5036'}
        ],
        'ж': [
            {name: 'Жуковский', coord: '55.5952, 38.1197'},
            {name: 'Железногорск', coord: '52.3380, 35.3516'},
            {name: 'Жигулёвск', coord: '53.4011, 49.4944'},
            {name: 'Жердевка', coord: '51.8421, 41.4617'},
            {name: 'Жуковка', coord: '53.5344, 33.7307'},
            {name: 'Железногорск-Илимский', coord: '56.5842, 104.1141'},
            {name: 'Жиздра', coord: '53.7493, 34.7343'},
            {name: 'Жирновск', coord: '50.9816, 44.7879'},
            {name: 'Жирятино', coord: '53.3097, 33.7949'}
        ],
        'з': [
            {name: 'Златоуст', coord: '55.1711, 59.6508'},
            {name: 'Зеленоград', coord: '55.9825, 37.1814'},
            {name: 'Заречный', coord: '53.1961, 45.1691'},
            {name: 'Зарайск', coord: '54.7650, 38.8844'},
            {name: 'Заволжье', coord: '56.6454, 43.3861'},
            {name: 'Зеленогорск', coord: '60.1997, 29.7018'},
            {name: 'Зея', coord: '53.7331, 127.2670'},
            {name: 'Звенигород', coord: '55.7317, 36.8545'},
            {name: 'Златоустовск', coord: '50.7506, 87.1623'}
        ],
        'и': [
            {name: 'Иркутск', coord: '52.2869, 104.3050'},
            {name: 'Иваново', coord: '57.0004, 40.9739'},
            {name: 'Ижевск', coord: '56.8526, 53.2069'},
            {name: 'Ишим', coord: '56.1129, 69.4907'},
            {name: 'Инта', coord: '66.0368, 60.1285'},
            {name: 'Икша', coord: '56.0215, 37.5455'},
            {name: 'Иловля', coord: '49.3036, 43.9797'},
            {name: 'Истра', coord: '55.9207, 36.8603'},
            {name: 'Ипатово', coord: '45.7189, 42.8975'},
            {name: 'Избербаш', coord: '42.5652, 47.8714'}
        ],
        'й': [
            {name: 'Йошкар-Ола', coord: '56.6431, 47.8903'},
            {name: 'Йорк', coord: '53.9599, -1.0873'}
        ],
        'к': [
            {name: 'Казань', coord: '55.7961, 49.1064'},
            {name: 'Кемерово', coord: '55.3552, 86.0867'},
            {name: 'Калининград', coord: '54.7104, 20.4522'},
            {name: 'Калуга', coord: '54.5078, 36.2526'},
            {name: 'Кострома', coord: '57.7679, 40.9260'},
            {name: 'Курск', coord: '51.7304, 36.1926'},
            {name: 'Курган', coord: '55.4408, 65.3411'},
            {name: 'Кисловодск', coord: '43.9133, 42.7206'},
            {name: 'Кингисепп', coord: '59.3739, 28.6144'},
            {name: 'Клин', coord: '56.3377, 36.7284'}
        ],
        'л': [
            {name: 'Липецк', coord: '52.6100, 39.5940'},
            {name: 'Люберцы', coord: '55.681874547325606, 37.8895875840235'},
            {name: 'Лобня', coord: '56.0130, 37.4717'},
            {name: 'Луга', coord: '58.7374, 29.8454'},
            {name: 'Ливны', coord: '52.4255, 37.6095'},
            {name: 'Лиски', coord: '50.9870, 39.5190'},
            {name: 'Ленинск-Кузнецкий', coord: '54.6604, 86.1773'},
            {name: 'Лабытнанги', coord: '66.6601, 66.3885'},
            {name: 'Лениногорск', coord: '54.5980, 52.4422'},
            {name: 'Ленинск', coord: '48.6934, 45.1995'}
        ],
        'м': [
            {name: 'Москва', coord: '55.7558, 37.6173'},
            {name: 'Мурманск', coord: '68.9585, 33.0827'},
            {name: 'Магнитогорск', coord: '53.4072, 58.9791'},
            {name: 'Майкоп', coord: '44.6098, 40.1004'},
            {name: 'Махачкала', coord: '42.9849, 47.5048'},
            {name: 'Можайск', coord: '55.5019, 36.0242'},
            {name: 'Муром', coord: '55.5635, 42.0230'},
            {name: 'Миасс', coord: '55.0458, 60.1083'},
            {name: 'Минеральные Воды', coord: '44.2103, 43.1332'},
            {name: 'Меленки', coord: '55.3344, 41.6344'}
        ],
        'н': [
            {name: 'Нижний Новгород', coord: '56.3269, 44.0059'},
            {name: 'Новосибирск', coord: '55.0084, 82.9357'},
            {name: 'Набережные Челны', coord: '55.7435, 52.3959'},
            {name: 'Новороссийск', coord: '44.7235, 37.7689'},
            {name: 'Невинномысск', coord: '44.6332, 41.9449'},
            {name: 'Нижнекамск', coord: '55.6310, 51.8149'},
            {name: 'Ноябрьск', coord: '63.2019, 75.4509'},
            {name: 'Нефтекамск', coord: '56.0910, 54.2630'},
            {name: 'Ногинск', coord: '55.8580, 38.4434'},
            {name: 'Новочеркасск', coord: '47.4203, 40.0935'}
        ],
        'о': [
            {name: 'Омск', coord: '54.9885, 73.3242'},
            {name: 'Оренбург', coord: '51.7682, 55.0969'},
            {name: 'Орёл', coord: '52.9685, 36.0695'},
            {name: 'Обнинск', coord: '55.0942, 36.6122'},
            {name: 'Орехово-Зуево', coord: '55.8057, 38.9634'},
            {name: 'Одинцово', coord: '55.6780, 37.2635'},
            {name: 'Острогожск', coord: '50.8607, 39.0472'},
            {name: 'Охотск', coord: '59.3543, 143.2173'},
            {name: 'Оленегорск', coord: '68.1374, 33.2670'},
            {name: 'Озерск', coord: '55.7633, 60.7076'}
        ],
        'п': [
            {name: 'Пенза', coord: '53.1945, 45.0196'},
            {name: 'Пермь', coord: '58.0104, 56.2294'},
            {name: 'Петрозаводск', coord: '61.7876, 34.3717'},
            {name: 'Псков', coord: '57.8194, 28.3318'},
            {name: 'Подольск', coord: '55.4296, 37.5451'},
            {name: 'Пятигорск', coord: '44.0486, 43.0594'},
            {name: 'Печора', coord: '65.1486, 57.2236'},
            {name: 'Павловский Посад', coord: '55.7802, 38.6568'},
            {name: 'Пущино', coord: '54.8298, 37.6111'},
            {name: 'Протвино', coord: '54.8685, 37.2185'}
        ],
        'р': [
            {name: 'Рязань', coord: '54.6197, 39.7414'},
            {name: 'Ростов-на-Дону', coord: '47.2357, 39.7015'},
            {name: 'Рубцовск', coord: '51.5010, 81.2078'},
            {name: 'Ревда', coord: '56.7985, 59.9073'},
            {name: 'Рославль', coord: '53.9520, 32.8618'},
            {name: 'Руза', coord: '55.6997, 36.1965'},
            {name: 'Раменское', coord: '55.5707, 38.2301'},
            {name: 'Радужный', coord: '55.9976, 40.3321'},
            {name: 'Рыбинск', coord: '58.0456, 38.8426'},
            {name: 'Реж', coord: '57.3706, 61.3921'}
        ],
        'с': [
            {name: 'Санкт-Петербург', coord: '59.9311, 30.3609'},
            {name: 'Самара', coord: '53.1959, 50.1008'},
            {name: 'Саратов', coord: '51.5336, 46.0343'},
            {name: 'Смоленск', coord: '54.7826, 32.0453'},
            {name: 'Сочи', coord: '43.6028, 39.7342'},
            {name: 'Старый Оскол', coord: '51.2967, 37.8399'},
            {name: 'Ставрополь', coord: '45.0448, 41.9691'},
            {name: 'Сыктывкар', coord: '61.6688, 50.8358'},
            {name: 'Сургут', coord: '61.2536, 73.3962'},
            {name: 'Серпухов', coord: '54.9227, 37.4030'}
        ],
        'т': [
            {name: 'Тула', coord: '54.1961, 37.6182'},
            {name: 'Тверь', coord: '56.8586, 35.9119'},
            {name: 'Томск', coord: '56.4846, 84.9470'},
            {name: 'Тамбов', coord: '52.7212, 41.4523'},
            {name: 'Тюмень', coord: '57.1530, 65.5343'},
            {name: 'Таганрог', coord: '47.2362, 38.8969'},
            {name: 'Туапсе', coord: '44.0993, 39.0723'},
            {name: 'Тобольск', coord: '58.2000, 68.2531'},
            {name: 'Тихвин', coord: '59.6308, 33.5073'},
            {name: 'Торжок', coord: '57.0471, 34.9601'}
        ],
        'у': [
            {name: 'Уфа', coord: '54.7388, 55.9721'},
            {name: 'Ульяновск', coord: '54.3142, 48.4031'},
            {name: 'Уссурийск', coord: '43.7972, 131.9458'},
            {name: 'Ухта', coord: '63.5675, 53.6943'},
            {name: 'Урай', coord: '60.1298, 64.7843'},
            {name: 'Улан-Удэ', coord: '51.8345, 107.5848'},
            {name: 'Удомля', coord: '57.8782, 35.0166'},
            {name: 'Углич', coord: '57.5274, 38.3316'},
            {name: 'Усинск', coord: '65.9943, 57.5572'},
            {name: 'Урюпинск', coord: '50.7909, 42.0027'}
        ],
        'ф': [
            {name: 'Фрязино', coord: '55.9604, 38.0409'},
            {name: 'Феодосия', coord: '45.0319, 35.3824'},
            {name: 'Фролово', coord: '49.7696, 43.6633'},
            {name: 'Фурманов', coord: '57.2534, 41.1035'},
            {name: 'Фокино', coord: '53.4558, 34.4157'},
            {name: 'Ферзиково', coord: '54.5134, 36.7562'}
        ],
        'х': [
            {name: 'Хабаровск', coord: '48.4827, 135.0838'},
            {name: 'Химки', coord: '55.8887, 37.4304'},
            {name: 'Ханты-Мансийск', coord: '61.0024, 69.0189'},
            {name: 'Хасавюрт', coord: '43.2509, 46.5858'},
            {name: 'Хвалынск', coord: '52.4950, 48.1040'},
            {name: 'Холмск', coord: '47.0409, 142.0478'},
            {name: 'Харовск', coord: '59.9448, 40.2000'},
            {name: 'Хотьково', coord: '56.2512, 37.9401'}
        ],
        'ц': [
            {name: 'Цимлянск', coord: '47.6477, 42.0930'},
            {name: 'Цивильск', coord: '55.8647, 47.4725'},
            {name: 'Циолковский', coord: '51.7631, 128.1217'},
            {name: 'Цхинвал', coord: '42.2273, 43.9686'}
        ],
        'ч': [
            {name: 'Челябинск', coord: '55.1644, 61.4368'},
            {name: 'Чебоксары', coord: '56.1439, 47.2489'},
            {name: 'Череповец', coord: '59.1269, 37.9097'},
            {name: 'Чита', coord: '52.0334, 113.4990'},
            {name: 'Черкесск', coord: '44.2268, 42.0486'},
            {name: 'Чапаевск', coord: '52.9820, 49.6874'},
            {name: 'Чехов', coord: '55.1473, 37.4773'},
            {name: 'Чистополь', coord: '55.3690, 50.6392'},
            {name: 'Чусовой', coord: '58.2976, 57.8190'},
            {name: 'Черногорск', coord: '53.8251, 91.2837'}
        ],
        'ш': [
            {name: 'Шахты', coord: '47.7087, 40.2157'},
            {name: 'Шуя', coord: '56.8567, 41.3897'},
            {name: 'Шадринск', coord: '56.0885, 63.6323'},
            {name: 'Шарыпово', coord: '55.5383, 89.1809'},
            {name: 'Шилка', coord: '51.8491, 116.0334'},
            {name: 'Шимановск', coord: '52.0059, 127.6776'},
            {name: 'Шлиссельбург', coord: '59.9441, 31.0335'}
        ],
        'щ': [
            {name: 'Щёлково', coord: '55.9203, 37.9784'},
            {name: 'Щёкино', coord: '54.0144, 37.5174'},
            {name: 'Щербинка', coord: '55.5008, 37.5596'},
            {name: 'Щигры', coord: '51.8787, 36.9136'}
        ],
        'ъ': [
            {name: 'Ъ', coord: '43.215767390154845, 24.328508437007898'}
        ],
        'ы': [
            {name: 'Ыныкчанский', coord: '63.0508, 152.8050'},
            {name: 'Ытык-Кюёль', coord: '62.3500, 134.4500'},
            {name: 'Ыгыатта', coord: '61.2833, 122.7667'},
            {name: 'Ыллымах', coord: '58.9500, 125.3167'}
        ],
        'ь': [
            {name: 'Мягкий знак', coord: '40.77598274370368, 72.3053188966056'}
        ],
        'э': [
            {name: 'Элиста', coord: '46.3083, 44.2702'},
            {name: 'Электросталь', coord: '55.7869, 38.4419'},
            {name: 'Энгельс', coord: '51.4750, 46.1169'},
            {name: 'Электрогорск', coord: '55.8776, 38.7804'}
        ],
        'ю': [
            {name: 'Южно-Сахалинск', coord: '46.9591, 142.7380'},
            {name: 'Южноуральск', coord: '54.4444, 61.2535'},
            {name: 'Юрга', coord: '55.7203, 84.8885'},
            {name: 'Юрьев-Польский', coord: '56.5025, 39.6832'},
            {name: 'Южа', coord: '56.5926, 42.0108'}
        ],
        'я': [
            {name: 'Ярославль', coord: '57.6260, 39.8845'},
            {name: 'Якутск', coord: '62.0355, 129.6755'},
            {name: 'Ярцево', coord: '55.0561, 32.6915'},
            {name: 'Ялта', coord: '44.4970, 34.1654'},
            {name: 'Ясногорск', coord: '54.4794, 37.6895'}
        ]
    };

    citiesEn = {
        'a': [
            {name: 'Amsterdam', coord: '52.3676, 4.9041'},
            {name: 'Athens', coord: '37.9838, 23.7275'},
            {name: 'Auckland', coord: '-36.8485, 174.7633'},
            {name: 'Atlanta', coord: '33.7490, -84.3880'}
        ],
        'b': [
            {name: 'Berlin', coord: '52.5200, 13.4050'},
            {name: 'Budapest', coord: '47.4979, 19.0402'},
            {name: 'Barcelona', coord: '41.3851, 2.1734'}
        ],
        'c': [
            {name: 'Cairo', coord: '30.0444, 31.2357'},
            {name: 'Cape Town', coord: '-33.9249, 18.4241'},
            {name: 'Chicago', coord: '41.8781, -87.6298'}
        ],
        'd': [
            {name: 'Dublin', coord: '53.3498, -6.2603'},
            {name: 'Dubai', coord: '25.2048, 55.2708'},
            {name: 'Delhi', coord: '28.6139, 77.2090'}
        ],
        'e': [
            {name: 'Edinburgh', coord: '55.9533, -3.1883'},
            {name: 'Edmonton', coord: '53.5461, -113.4938'},
            {name: 'Essen', coord: '51.4556, 7.0116'}
        ],
        'f': [
            {name: 'Frankfurt', coord: '50.1109, 8.6821'},
            {name: 'Florence', coord: '43.7696, 11.2558'},
            {name: 'Fukuoka', coord: '33.5904, 130.4017'}
        ],
        'g': [
            {name: 'Geneva', coord: '46.2044, 6.1432'},
            {name: 'Glasgow', coord: '55.8642, -4.2518'},
            {name: 'Guangzhou', coord: '23.1291, 113.2644'}
        ],
        'h': [
            {name: 'Helsinki', coord: '60.1699, 24.9384'},
            {name: 'Havana', coord: '23.1136, -82.3666'},
            {name: 'Hamburg', coord: '53.5511, 9.9937'}
        ],
        'i': [
            {name: 'Istanbul', coord: '41.0082, 28.9784'},
            {name: 'Indianapolis', coord: '39.7684, -86.1581'},
            {name: 'Incheon', coord: '37.4563, 126.7052'}
        ],
        'j': [
            {name: 'Jakarta', coord: '-6.2088, 106.8456'},
            {name: 'Jerusalem', coord: '31.7683, 35.2137'},
            {name: 'Johannesburg', coord: '-26.2041, 28.0473'}
        ],
        'k': [
            {name: 'Kyiv', coord: '50.4501, 30.5234'},
            {name: 'Kuala Lumpur', coord: '3.1390, 101.6869'},
            {name: 'Krakow', coord: '50.0647, 19.9450'}
        ],
        'l': [
            {name: 'London', coord: '51.5074, -0.1278'},
            {name: 'Los Angeles', coord: '34.0522, -118.2437'},
            {name: 'Lisbon', coord: '38.7223, -9.1393'}
        ],
        'm': [
            {name: 'Madrid', coord: '40.4168, -3.7038'},
            {name: 'Melbourne', coord: '-37.8136, 144.9631'},
            {name: 'Milan', coord: '45.4642, 9.1900'}
        ],
        'n': [
            {name: 'New York', coord: '40.7128, -74.0060'},
            {name: 'Naples', coord: '40.8518, 14.2681'},
            {name: 'Nairobi', coord: '-1.2921, 36.8219'}
        ],
        'o': [
            {name: 'Oslo', coord: '59.9139, 10.7522'},
            {name: 'Osaka', coord: '34.6937, 135.5023'},
            {name: 'Ottawa', coord: '45.4215, -75.6972'}
        ],
        'p': [
            {name: 'Paris', coord: '48.8566, 2.3522'},
            {name: 'Prague', coord: '50.0755, 14.4378'},
            {name: 'Porto', coord: '41.1579, -8.6291'}
        ],
        'q': [
            {name: 'Quebec City', coord: '46.8139, -71.2080'},
            {name: 'Quito', coord: '-0.1807, -78.4678'},
            {name: 'Queenstown', coord: '-45.0312, 168.6626'}
        ],
        'r': [
            {name: 'Rome', coord: '41.9028, 12.4964'},
            {name: 'Rio de Janeiro', coord: '-22.9068, -43.1729'},
            {name: 'Rotterdam', coord: '51.9244, 4.4777'}
        ],
        's': [
            {name: 'Sydney', coord: '-33.8688, 151.2093'},
            {name: 'Stockholm', coord: '59.3293, 18.0686'},
            {name: 'Seoul', coord: '37.5665, 126.9780'}
        ],
        't': [
            {name: 'Tokyo', coord: '35.6762, 139.6503'},
            {name: 'Toronto', coord: '43.6532, -79.3832'},
            {name: 'Taipei', coord: '25.0330, 121.5654'}
        ],
        'u': [
            {name: 'Utrecht', coord: '52.0907, 5.1214'},
            {name: 'Ulaanbaatar', coord: '47.8864, 106.9057'},
            {name: 'Ushuaia', coord: '-54.8019, -68.3030'}
        ],
        'v': [
            {name: 'Vienna', coord: '48.2082, 16.3738'},
            {name: 'Vancouver', coord: '49.2827, -123.1207'},
            {name: 'Venice', coord: '45.4408, 12.3155'}
        ],
        'w': [
            {name: 'Warsaw', coord: '52.2297, 21.0122'},
            {name: 'Washington D.C.', coord: '38.9072, -77.0369'},
            {name: 'Wellington', coord: '-41.2924, 174.7787'}
        ],
        'x': [
            {name: 'Xi\'an', coord: '34.3416, 108.9398'},
            {name: 'Xiamen', coord: '24.4798, 118.0819'},
            {name: 'Xalapa', coord: '19.5438, -96.9102'}
        ],
        'y': [
            {name: 'Yokohama', coord: '35.4437, 139.6380'},
            {name: 'Yerevan', coord: '40.1792, 44.4991'},
            {name: 'York', coord: '53.9599, -1.0873'}
        ],
        'z': [
            {name: 'Zurich', coord: '47.3769, 8.5417'},
            {name: 'Zagreb', coord: '45.8150, 15.9819'},
            {name: 'Zaragoza', coord: '41.6488, -0.8891'}
        ]
    };
}

// Инициализация после загрузки DOM
let cipherEngine;
document.addEventListener('DOMContentLoaded', () => {
    cipherEngine = new CipherEngine();
    window.cipherEngine = cipherEngine; // Делаем доступным глобально
});