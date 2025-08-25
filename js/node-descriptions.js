// === Описания алгоритмов для справки по нодам ===

const nodeDescriptions = {
    'input': {
        title: 'Ввод текста',
        description: 'Начальная точка для вашей цепочки шифрования. Введите текст, который нужно обработать.',
        fields: {},
        examples: [
            'Привет, мир!',
            'Hello, World!',
            '123456789'
        ]
    },
    
    'output': {
        title: 'Вывод текста',
        description: 'Конечная точка цепочки. Отображает результат всех примененных преобразований.',
        fields: {},
        examples: []
    },
    
    'caesar': {
        title: 'Шифр Цезаря',
        description: 'Один из самых древних методов шифрования. Сдвигает каждую букву алфавита на фиксированное число позиций.',
        fields: {
            'shift': 'Количество позиций для сдвига букв (1-25). Например, при сдвиге 3: А→Г, Б→Д, В→Е'
        },
        examples: [
            'ABC + сдвиг 3 = DEF',
            'АБВ + сдвиг 3 = ГДЕ',
            'xyz + сдвиг 1 = yza'
        ]
    },
    
    'morse': {
        title: 'Код Морзе',
        description: 'Преобразует текст в последовательность точек и тире. Каждая буква имеет уникальную комбинацию.',
        fields: {
            'mode': 'Кодировать - преобразует текст в морзе, Декодировать - обратное преобразование'
        },
        examples: [
            'SOS = ··· −−− ···',
            'А = ·−',
            'E = ·'
        ]
    },
    
    'vigenere': {
        title: 'Шифр Виженера',
        description: 'Полиалфавитный шифр, использующий ключевое слово для шифрования. Более стойкий, чем шифр Цезаря.',
        fields: {},
        inputs: {
            'key': 'Ключевое слово для шифрования',
            'text': 'Текст для шифрования'
        },
        examples: [
            'Текст: ПРИВЕТ, Ключ: КЛЮЧ = ЫЭРНПЮ',
            'Text: HELLO, Key: KEY = RIJVS'
        ]
    },
    
    'a1z26': {
        title: 'Шифр A1Z26',
        description: 'Заменяет буквы на их порядковые номера в алфавите. А=1, Б=2, В=3 и т.д.',
        fields: {
            'language': 'Выбор алфавита для преобразования',
            'mode': 'Направление преобразования (буквы↔числа)'
        },
        examples: [
            'АБВ = 1-2-3',
            'ABC = 1-2-3',
            'HELLO = 8-5-12-12-15'
        ]
    },
    
    'binary': {
        title: 'Бинарный код',
        description: 'Преобразует текст в двоичную систему счисления (0 и 1). Каждый символ представлен 8-битным кодом.',
        fields: {
            'mode': 'Кодировать - текст в бинарный код, Декодировать - обратное преобразование'
        },
        examples: [
            'A = 01000001',
            'Привет = последовательность байтов',
            '0 = 00110000'
        ]
    },
    
    'braille-cat': {
        title: 'Морзе (Кошачий)',
        description: 'Забавная вариация кода Морзе с кошачьими звуками. Точка = "мяy", Тире = "мрряy", Пробел = "брряy".',
        fields: {
            'mode': 'Направление преобразования'
        },
        examples: [
            'SOS = nyannyannyan myaumyaumyau nyannyannyan',
            'котик = мрряумяумрряу мрряумрряумрряу мрряу мяумяу мрряумяумрряу'
        ]
    },
    
    'planet-enchanter': {
        title: 'Зачаровыватель планет',
        description: 'Уникальный алгоритм, заменяющий буквы на координаты городов мира, начинающихся на эту букву.',
        fields: {
            'mode': 'Направление преобразования',
            'language': 'Язык для выбора городов'
        },
        examples: [
            'М = 55.7558, 37.6173 (Москва)',
            'P = 48.8566, 2.3522 (Paris)',
            'Каждая буква = случайный город на эту букву'
        ]
    },
    
    'numbers-to-words': {
        title: 'Числа в слова',
        description: 'Преобразует цифры в их словесное представление на выбранном языке.',
        fields: {
            'language': 'Язык для преобразования',
            'mode': 'Направление (числа→слова или слова→числа)'
        },
        examples: [
            '123 = одиндватри',
            '42 = fourtwo',
            '0 = ноль/zero'
        ]
    },
    
    'math': {
        title: 'Математика',
        description: 'Применяет математические операции к числам в тексте.',
        fields: {
            'operation': 'Тип операции (сложение, вычитание, умножение, деление)',
            'value': 'Значение для операции'
        },
        examples: [
            '10 + 5 = 15',
            '20 × 2 = 40',
            'Обрабатывает все числа в тексте'
        ]
    },
    
    'reverse': {
        title: 'Обратить текст',
        description: 'Переворачивает текст в обратном порядке.',
        fields: {
            'mode': 'Полностью - весь текст, По словам - каждое слово отдельно'
        },
        examples: [
            'ПРИВЕТ = ТЕВИРП',
            'Hello World = dlroW olleH',
            'По словам: Hello World = olleH dlroW'
        ]
    },
    
    'case-transform': {
        title: 'Регистр',
        description: 'Изменяет регистр букв в тексте.',
        fields: {
            'mode': 'Тип преобразования регистра'
        },
        examples: [
            'ВЕРХНИЙ = ВСЕ ЗАГЛАВНЫЕ',
            'нижний = все строчные',
            'Заглавные = Первая Буква Каждого Слова',
            'иНВЕРТИРОВАТЬ = мЕНЯЕТ рЕГИСТР'
        ]
    },
    
    'secret-word': {
        title: 'Секретное слово',
        description: 'Генератор ключевых слов. Используется как источник ключа для других алгоритмов шифрования.',
        fields: {
            'keyword': 'Ключевое слово для использования'
        },
        examples: [
            'Подключите к входу "Ключ" шифра Виженера',
            'Можно использовать любое слово'
        ]
    },
    
    'monitor': {
        title: 'Монитор',
        description: 'Отображает проходящий через него текст без изменений. Полезен для отладки и наблюдения за промежуточными результатами.',
        fields: {},
        examples: [
            'Показывает текущее состояние данных',
            'Не изменяет проходящий текст',
            'Обновляется при каждом изменении'
        ]
    }
};

// Функция для получения описания нода
function getNodeDescription(nodeType) {
    return nodeDescriptions[nodeType] || {
        title: 'Неизвестный нод',
        description: 'Описание недоступно',
        fields: {},
        examples: []
    };
}

// Функция для показа справки по ноду
function showNodeHelp(nodeType) {
    const info = getNodeDescription(nodeType);
    
    const helpDialog = document.createElement('div');
    helpDialog.className = 'node-help-dialog-overlay';
    
    let fieldsHtml = '';
    if (info.fields && Object.keys(info.fields).length > 0) {
        fieldsHtml = '<div class="help-section"><h4>📝 Параметры:</h4><ul>';
        for (const [field, desc] of Object.entries(info.fields)) {
            fieldsHtml += `<li><strong>${field}:</strong> ${desc}</li>`;
        }
        fieldsHtml += '</ul></div>';
    }
    
    let inputsHtml = '';
    if (info.inputs && Object.keys(info.inputs).length > 0) {
        inputsHtml = '<div class="help-section"><h4>🔌 Входы:</h4><ul>';
        for (const [input, desc] of Object.entries(info.inputs)) {
            inputsHtml += `<li><strong>${input}:</strong> ${desc}</li>`;
        }
        inputsHtml += '</ul></div>';
    }
    
    let examplesHtml = '';
    if (info.examples && info.examples.length > 0) {
        examplesHtml = '<div class="help-section"><h4>💡 Примеры:</h4><ul>';
        for (const example of info.examples) {
            examplesHtml += `<li><code>${example}</code></li>`;
        }
        examplesHtml += '</ul></div>';
    }
    
    helpDialog.innerHTML = `
        <div class="node-help-dialog">
            <div class="help-dialog-header">
                <h3>❓ ${info.title}</h3>
                <button class="dialog-close" onclick="this.closest('.node-help-dialog-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="help-dialog-content">
                <div class="help-section">
                    <p>${info.description}</p>
                </div>
                ${fieldsHtml}
                ${inputsHtml}
                ${examplesHtml}
            </div>
            <div class="help-dialog-footer">
                <button class="btn btn-primary" onclick="this.closest('.node-help-dialog-overlay').remove()">
                    Понятно
                </button>
            </div>
        </div>
    `;
    
    // Стили для диалога справки
    const styles = `
        .node-help-dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-out;
        }
        
        .node-help-dialog {
            background: var(--bg-secondary);
            border-radius: var(--radius-lg);
            width: 600px;
            max-width: 90vw;
            max-height: 80vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border-color);
        }
        
        .help-dialog-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            background: var(--bg-primary);
            border-bottom: 1px solid var(--border-color);
        }
        
        .help-dialog-header h3 {
            margin: 0;
            color: var(--text-primary);
        }

        .dialog-close {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 0.5rem;
            border-radius: var(--radius);
            transition: var(--transition);
        }
            
        .dialog-close:hover {
            color: var(--text-primary);
            background: rgba(255, 255, 255, 0.1);
        }
        
        .help-dialog-content {
            padding: 1.5rem;
            overflow-y: auto;
            flex: 1;
        }
        
        .help-section {
            margin-bottom: 1.5rem;
        }
        
        .help-section:last-child {
            margin-bottom: 0;
        }
        
        .help-section h4 {
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }
        
        .help-section p {
            color: var(--text-secondary);
            line-height: 1.6;
        }
        
        .help-section ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .help-section li {
            color: var(--text-secondary);
            padding: 0.25rem 0;
        }
        
        .help-section code {
            background: var(--bg-primary);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            color: var(--accent-primary);
        }
        
        .help-dialog-footer {
            padding: 1rem 1.5rem;
            background: var(--bg-primary);
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: flex-end;
        }
    `;
    
    if (!document.querySelector('#node-help-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'node-help-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    document.body.appendChild(helpDialog);
}

// Экспортируем для использования
window.nodeDescriptions = nodeDescriptions;
window.showNodeHelp = showNodeHelp;