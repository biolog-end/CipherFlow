/**
 * Система интернационализации (i18n) для CipherFlow
 * Поддерживает русский и английский языки
 */

class I18n {
    constructor() {
        this.currentLanguage = 'ru';
        this.translations = {};
        this.defaultLanguage = 'ru';
        this.supportedLanguages = ['ru', 'en'];
        
        // Загружаем сохраненный язык из localStorage
        this.loadSavedLanguage();
        
        // Инициализируем с базовыми переводами
        this.initTranslations();
        
        // Наблюдатели за изменением языка
        this.languageChangeCallbacks = [];
    }
    
    /**
     * Инициализация переводов
     */
    initTranslations() {
        this.translations = {
            'ru': {
                // Общие элементы
                'app.title': 'CipherFlow - Нодовый Шифратор',
                'app.logo': 'CipherFlow',
                
                // Заголовок
                'header.help': 'Показать справку (F1)',
                'header.settings': 'Настройки',
                'header.encryption': 'Шифрование',
                'header.decryption': 'Расшифровка',
                'header.load_scheme': 'Загрузить схему',
                'header.save_scheme': 'Сохранить схему',
                'header.clear': 'Очистить',
                
                // Панель нодов
                'nodes.input_output': 'Ввод/Вывод',
                'nodes.classic_ciphers': 'Классические шифры',
                'nodes.morse_variants': 'Варианты Морзе',
                'nodes.transformations': 'Преобразования',
                'nodes.advanced_processing': 'Продвинутая обработка',
                'nodes.logical_operations': 'Логические операции',
                'nodes.modern_ciphers': 'Современные шифры',
                'nodes.fun_ciphers': 'Забавные шифры',
                
                // Типы нодов
                'node.text_input': 'Ввод текста',
                'node.text_output': 'Вывод текста',
                'node.caesar_cipher': 'Шифр Цезаря',
                'node.vigenere_cipher': 'Шифр Виженера',
                'node.morse_code': 'Код Морзе',
                'node.planet_enchanter': 'Зачаровыватель планет',
                'node.a1z26_cipher': 'Шифр A1Z26',
                'node.secret_word': 'Секретное слово',
                'node.morse_binary': 'Морзе (Бинарный)',
                'node.morse_cat': 'Морзе (Кошачий)',
                'node.numbers_to_words': 'Числа в слова',
                'node.math': 'Математика',
                'node.reverse_text': 'Обратить текст',
                'node.case_transform': 'Регистр',
                'node.binary_code': 'Бинарный код',
                'node.multi_replace': 'Мульти-замена',
                'node.text_router': 'Маршрутизатор текста',
                'node.stream_merger': 'Слияние потоков',
                'node.atbash_cipher': 'Шифр Атбаш',
                'node.base64': 'Base64 Кодировщик',
                'node.shark_cipher': 'Акулий шифр',
                'node.uwu_cipher': 'UwU-фикатор (Шифр Няшек)',
                
                // Панель управления канвасом
                'canvas.zoom_in': 'Увеличить (Ctrl + +)',
                'canvas.zoom_out': 'Уменьшить (Ctrl + -)',
                'canvas.zoom_reset': 'Сбросить масштаб (Ctrl + 0)',
                'canvas.cut_mode': 'Режим резки соединений (X)',
                'canvas.fullscreen': 'Полноэкранный режим',
                'canvas.export_image': 'Экспорт в изображение',
                
                // Панель ввода/вывода
                'io.input_placeholder': 'Введите текст для обработки...',
                'io.output_placeholder': 'Результат будет отображен здесь...',
                'io.clear_input': 'Очистить ввод',
                'io.copy_output': 'Копировать результат',
                'io.paste_input': 'Вставить из буфера обмена',
                
                // Диалоги
                'dialog.save_scheme': 'Сохранить схему',
                'dialog.scheme_name': 'Название схемы',
                'dialog.scheme_description': 'Описание схемы (необязательно)',
                'dialog.save': 'Сохранить',
                'dialog.cancel': 'Отмена',
                'dialog.load_scheme': 'Загрузить схему',
                'dialog.clear_confirm': 'Вы уверены, что хотите очистить всю схему?',
                'dialog.yes': 'Да',
                'dialog.no': 'Нет',
                
                // Настройки
                'settings.title': 'Настройки',
                'settings.language': 'Язык интерфейса',
                'settings.theme': 'Тема оформления',
                'settings.autosave': 'Автосохранение',
                'settings.sound_effects': 'Звуковые эффекты',
                'settings.animations': 'Анимации',
                'settings.grid': 'Показать сетку',
                'settings.reset': 'Сброс настроек',
                'settings.close': 'Закрыть',
                
                // Темы
                'theme.dark': 'Темная',
                'theme.light': 'Светлая',
                'theme.auto': 'Авто',
                
                // Языки
                'language.ru': 'Русский',
                'language.en': 'English',
                
                // Уведомления
                'notification.scheme_saved': 'Схема сохранена',
                'notification.scheme_loaded': 'Схема загружена',
                'notification.copied_to_clipboard': 'Скопировано в буфер обмена',
                'notification.pasted_from_clipboard': 'Вставлено из буфера обмена',
                'notification.connection_cut': 'Соединение разорвано',
                'notification.cut_mode_on': 'Режим резки включен',
                'notification.cut_mode_off': 'Режим резки выключен',
                
                // Горячие клавиши
                'hotkey.save': 'Ctrl+S',
                'hotkey.load': 'Ctrl+O', 
                'hotkey.new': 'Ctrl+N',
                'hotkey.copy': 'Ctrl+C',
                'hotkey.paste': 'Ctrl+V',
                'hotkey.select_all': 'Ctrl+A',
                'hotkey.undo': 'Ctrl+Z',
                'hotkey.redo': 'Ctrl+Y',
                'hotkey.help': 'F1',
                'hotkey.cut_mode': 'X',
                'hotkey.delete': 'Delete',
                'hotkey.escape': 'Escape',
                'hotkey.zoom_in': '+',
                'hotkey.zoom_out': '-',
                'hotkey.zoom_reset': 'Ctrl+0',
                
                // Параметры нодов
                'param.shift': 'Сдвиг',
                'param.keyword': 'Ключевое слово',
                'param.language': 'Язык',
                'param.operation': 'Операция',
                'param.case_type': 'Тип регистра',
                'param.rules': 'Правила замены',
                'param.condition': 'Условие',
                'param.separator': 'Разделитель',
                
                // Ошибки
                'error.invalid_scheme': 'Неверный формат схемы',
                'error.file_read': 'Ошибка чтения файла',
                'error.connection_failed': 'Не удалось создать соединение',
                'error.node_not_found': 'Нод не найден',
                'error.clipboard_access': 'Нет доступа к буферу обмена'
            },
            
            'en': {
                // General elements  
                'app.title': 'CipherFlow - Node-based Cipher Tool',
                'app.logo': 'CipherFlow',
                
                // Header
                'header.help': 'Show Help (F1)',
                'header.settings': 'Settings',
                'header.encryption': 'Encryption',
                'header.decryption': 'Decryption',
                'header.load_scheme': 'Load Scheme',
                'header.save_scheme': 'Save Scheme',
                'header.clear': 'Clear',
                
                // Node panel
                'nodes.input_output': 'Input/Output',
                'nodes.classic_ciphers': 'Classic Ciphers',
                'nodes.morse_variants': 'Morse Variants',
                'nodes.transformations': 'Transformations',
                'nodes.advanced_processing': 'Advanced Processing',
                'nodes.logical_operations': 'Logical Operations',
                'nodes.modern_ciphers': 'Modern Ciphers',
                'nodes.fun_ciphers': 'Fun Ciphers',
                
                // Node types
                'node.text_input': 'Text Input',
                'node.text_output': 'Text Output',
                'node.caesar_cipher': 'Caesar Cipher',
                'node.vigenere_cipher': 'Vigenère Cipher',
                'node.morse_code': 'Morse Code',
                'node.planet_enchanter': 'Planet Enchanter',
                'node.a1z26_cipher': 'A1Z26 Cipher',
                'node.secret_word': 'Secret Word',
                'node.morse_binary': 'Morse (Binary)',
                'node.morse_cat': 'Morse (Cat)',
                'node.numbers_to_words': 'Numbers to Words',
                'node.math': 'Math',
                'node.reverse_text': 'Reverse Text',
                'node.case_transform': 'Case Transform',
                'node.binary_code': 'Binary Code',
                'node.multi_replace': 'Multi-Replace',
                'node.text_router': 'Text Router',
                'node.stream_merger': 'Stream Merger',
                'node.atbash_cipher': 'Atbash Cipher',
                'node.base64': 'Base64 Encoder',
                'node.shark_cipher': 'Shark Cipher',
                'node.uwu_cipher': 'UwU-ifier (Cuteness Cipher)',
                
                // Canvas controls
                'canvas.zoom_in': 'Zoom In (Ctrl + +)',
                'canvas.zoom_out': 'Zoom Out (Ctrl + -)',
                'canvas.zoom_reset': 'Reset Zoom (Ctrl + 0)',
                'canvas.cut_mode': 'Connection Cut Mode (X)',
                'canvas.fullscreen': 'Fullscreen Mode',
                'canvas.export_image': 'Export as Image',
                
                // I/O panel
                'io.input_placeholder': 'Enter text to process...',
                'io.output_placeholder': 'Result will be displayed here...',
                'io.clear_input': 'Clear Input',
                'io.copy_output': 'Copy Result',
                'io.paste_input': 'Paste from Clipboard',
                
                // Dialogs
                'dialog.save_scheme': 'Save Scheme',
                'dialog.scheme_name': 'Scheme Name',
                'dialog.scheme_description': 'Scheme Description (optional)',
                'dialog.save': 'Save',
                'dialog.cancel': 'Cancel',
                'dialog.load_scheme': 'Load Scheme',
                'dialog.clear_confirm': 'Are you sure you want to clear the entire scheme?',
                'dialog.yes': 'Yes',
                'dialog.no': 'No',
                
                // Settings
                'settings.title': 'Settings',
                'settings.language': 'Interface Language',
                'settings.theme': 'Theme',
                'settings.autosave': 'Autosave',
                'settings.sound_effects': 'Sound Effects',
                'settings.animations': 'Animations',
                'settings.grid': 'Show Grid',
                'settings.reset': 'Reset Settings',
                'settings.close': 'Close',
                
                // Themes
                'theme.dark': 'Dark',
                'theme.light': 'Light',
                'theme.auto': 'Auto',
                
                // Languages
                'language.ru': 'Русский',
                'language.en': 'English',
                
                // Notifications
                'notification.scheme_saved': 'Scheme saved',
                'notification.scheme_loaded': 'Scheme loaded',
                'notification.copied_to_clipboard': 'Copied to clipboard',
                'notification.pasted_from_clipboard': 'Pasted from clipboard',
                'notification.connection_cut': 'Connection cut',
                'notification.cut_mode_on': 'Cut mode enabled',
                'notification.cut_mode_off': 'Cut mode disabled',
                
                // Hotkeys
                'hotkey.save': 'Ctrl+S',
                'hotkey.load': 'Ctrl+O',
                'hotkey.new': 'Ctrl+N',
                'hotkey.copy': 'Ctrl+C',
                'hotkey.paste': 'Ctrl+V',
                'hotkey.select_all': 'Ctrl+A',
                'hotkey.undo': 'Ctrl+Z',
                'hotkey.redo': 'Ctrl+Y',
                'hotkey.help': 'F1',
                'hotkey.cut_mode': 'X',
                'hotkey.delete': 'Delete',
                'hotkey.escape': 'Escape',
                'hotkey.zoom_in': '+',
                'hotkey.zoom_out': '-',
                'hotkey.zoom_reset': 'Ctrl+0',
                
                // Node parameters
                'param.shift': 'Shift',
                'param.keyword': 'Keyword',
                'param.language': 'Language',
                'param.operation': 'Operation',
                'param.case_type': 'Case Type',
                'param.rules': 'Replacement Rules',
                'param.condition': 'Condition',
                'param.separator': 'Separator',
                
                // Errors
                'error.invalid_scheme': 'Invalid scheme format',
                'error.file_read': 'File reading error',
                'error.connection_failed': 'Failed to create connection',
                'error.node_not_found': 'Node not found',
                'error.clipboard_access': 'No clipboard access'
            }
        };
    }
    
    /**
     * Загрузка сохраненного языка
     */
    loadSavedLanguage() {
        try {
            const savedLang = localStorage.getItem('cipherflow_language');
            if (savedLang && this.supportedLanguages.includes(savedLang)) {
                this.currentLanguage = savedLang;
            }
        } catch (e) {
            console.warn('Could not load saved language:', e);
        }
    }
    
    /**
     * Сохранение текущего языка
     */
    saveLanguage() {
        try {
            localStorage.setItem('cipherflow_language', this.currentLanguage);
        } catch (e) {
            console.warn('Could not save language:', e);
        }
    }
    
    /**
     * Получение перевода по ключу
     * @param {string} key - Ключ перевода (например: 'header.save_scheme')
     * @param {Object} params - Параметры для подстановки в перевод
     * @returns {string} - Переведенный текст
     */
    t(key, params = {}) {
        const translation = this.translations[this.currentLanguage]?.[key] || 
                           this.translations[this.defaultLanguage]?.[key] || 
                           key;
        
        // Подстановка параметров
        return this.interpolate(translation, params);
    }
    
    /**
     * Подстановка параметров в строку перевода
     * @param {string} template - Шаблон строки
     * @param {Object} params - Параметры для подстановки
     * @returns {string} - Строка с подставленными параметрами
     */
    interpolate(template, params) {
        return template.replace(/{{(.*?)}}/g, (match, key) => {
            return params[key.trim()] || match;
        });
    }
    
    /**
     * Смена языка
     * @param {string} lang - Код языка ('ru' или 'en')
     */
    setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Language ${lang} is not supported`);
            return;
        }
        
        const oldLang = this.currentLanguage;
        this.currentLanguage = lang;
        this.saveLanguage();
        
        // Уведомляем всех подписчиков об изменении языка
        this.notifyLanguageChange(lang, oldLang);
        
        // Обновляем интерфейс
        this.updateInterface();
    }
    
    /**
     * Получение текущего языка
     * @returns {string} - Код текущего языка
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    /**
     * Получение списка поддерживаемых языков
     * @returns {Array} - Массив кодов языков
     */
    getSupportedLanguages() {
        return [...this.supportedLanguages];
    }
    
    /**
     * Подписка на изменение языка
     * @param {Function} callback - Функция обратного вызова
     */
    onLanguageChange(callback) {
        this.languageChangeCallbacks.push(callback);
    }
    
    /**
     * Уведомление об изменении языка
     * @param {string} newLang - Новый язык
     * @param {string} oldLang - Старый язык
     */
    notifyLanguageChange(newLang, oldLang) {
        this.languageChangeCallbacks.forEach(callback => {
            try {
                callback(newLang, oldLang);
            } catch (e) {
                console.error('Error in language change callback:', e);
            }
        });
    }
    
    /**
     * Обновление интерфейса после смены языка
     */
    updateInterface() {
        // Обновляем заголовок страницы
        document.title = this.t('app.title');
        
        // Обновляем все элементы с data-i18n атрибутами
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.t(key);
            
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = text;
            } else if (element.tagName === 'INPUT' && element.type === 'button') {
                element.value = text;
            } else if (element.hasAttribute('title')) {
                element.title = text;
            } else {
                element.textContent = text;
            }
        });
        
        // Обновляем placeholder'ы
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
        
        // Обновляем title атрибуты
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });
    }
    
    /**
     * Автоматическое определение языка браузера
     * @returns {string} - Предпочтительный язык
     */
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.languages?.[0] || 'en';
        const langCode = browserLang.split('-')[0];
        return this.supportedLanguages.includes(langCode) ? langCode : this.defaultLanguage;
    }
    
    /**
     * Инициализация системы после загрузки DOM
     */
    init() {
        // Если язык не был сохранен, пытаемся определить автоматически
        if (!localStorage.getItem('cipherflow_language')) {
            const detectedLang = this.detectBrowserLanguage();
            this.setLanguage(detectedLang);
        } else {
            // Просто обновляем интерфейс с текущим языком
            this.updateInterface();
        }
    }
}

// Создаем глобальный экземпляр
window.i18n = new I18n();

// Автоматическая инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.i18n.init();
});