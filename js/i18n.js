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
                'nodes.title': 'Ноды шифрования',
                'nodes.input_output': 'Ввод/Вывод',
                'nodes.classic_ciphers': 'Классические шифры',
                'nodes.morse_variants': 'Варианты Морзе',
                'nodes.transformations': 'Преобразования',
                'nodes.advanced_processing': 'Продвинутая обработка',
                'nodes.logical_operations': 'Логические операции',
                'nodes.modern_ciphers': 'Современные шифры',
                'nodes.fun_ciphers': 'Забавные шифры',
                'nodes.utilities': 'Утилиты',
                
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
                'node.complex_substitution': 'Сложная замена',
                'node.simple_substitution': 'Простая замена',
                'node.rle_compression': 'Сжатие (RLE)',
                'node.stream_splitter': 'Разрез Потоков',
                'node.text_router': 'Маршрутизатор текста',
                'node.stream_merger': 'Слияние потоков',
                'node.atbash_cipher': 'Шифр Атбаш',
                'node.base64': 'Base64 Кодировщик',
                'node.shark_cipher': 'Акулий шифр',
                'node.uwu_cipher': 'UwU-фикатор (Шифр Няшек)',
                'node.monitor': 'Монитор',
                'node.comment': 'Комментарий',
                'node.route_transposition': 'Маршрутная перестановка', 

                // Выходы и входы
                'output.if_true': 'Если ДА',
                'output.if_false': 'Если НЕТ',
                'input.stream_a': 'Поток А',
                'input.stream_b': 'Поток Б',

                // Плейсхолдеры и тултипы
                'placeholder.find': 'Найти',
                'placeholder.replace': 'Заменить',
                'node.show_help_tooltip': 'Показать справку по ноду',

                // Монитор
                'monitor.waiting_for_data': 'Ожидание данных...',
                'monitor.copy_content': 'Скопировать содержимое',
                'notification.monitor_copied': 'Содержимое монитора скопировано!',
                'error.copy_failed': 'Не удалось скопировать',
                'monitor.direction_decrypt': '⬅ Дешифровка',
                'monitor.direction_encrypt': '➡ Шифровка',
                'monitor.empty_input': 'Пусто',

                // Значения по умолчанию
                'param.default_keyword': 'СЕКРЕТ',

                // Кнопки и UI
                'button.add': 'Добавить',

                // История и выделение
                'history.node_created': 'Создан нод: {{title}}',
                'history.node_deleted': 'Удален нод: {{title}}',
                'history.group_moved': 'Перемещено нодов: {{count}}',
                'history.nothing_to_undo': 'Нечего отменять',
                'history.undone': 'Отменено: {{description}}',
                'history.undo_error': 'Ошибка отмены',
                'history.nothing_to_redo': 'Нечего повторять',
                'history.redone': 'Повторено: {{description}}',
                'history.redo_error': 'Ошибка повтора',

                'selection.copied': 'Скопировано в буфер: {{count}} нод(ов)',
                'selection.copy_error': 'Ошибка: не удалось скопировать в системный буфер',
                'selection.paste_empty': 'Буфер обмена пуст или содержит неверные данные',
                'selection.pasted': 'Вставлено нодов: {{count}}',
                'selection.deleted': 'Удалено нодов: {{count}}',
                                
                // Панель управления канвасом
                'canvas.zoom_in': 'Увеличить (Ctrl + +)',
                'canvas.zoom_out': 'Уменьшить (Ctrl + -)',
                'canvas.zoom_reset': 'Сбросить масштаб (Ctrl + 0)',
                'canvas.cut_mode': 'Режим резки соединений (X)',
                'canvas.fullscreen': 'Полноэкранный режим',
                'canvas.export_image': 'Экспорт в изображение',
                'canvas.cut_mode_tooltip': 'Режим резки соединений (X / Alt)',
                'canvas.cut_mode_hint': 'Режим резки активен: проведите линию через соединения',
                'notification.connections_cut': '✂️ Разрезано соединений: {{count}}',
                
                // Панель ввода/вывода
                'io.input_label': 'Входной текст:',
                'io.output_label': 'Результат:',
                'io.input_placeholder': 'Введите текст для обработки...',
                'io.output_placeholder': 'Результат будет отображен здесь...',
                'io.clear_input': 'Очистить ввод',
                'io.copy_output': 'Копировать результат',
                'io.paste_input': 'Вставить из буфера обмена',
                'io.decrypted_placeholder': 'Дешифрованный текст появится здесь...',
                'io.encrypted_placeholder': 'Введите зашифрованный текст для обработки...',
                'io.decrypted_label': 'Дешифрованный текст:',
                'io.encrypted_label': 'Зашифрованный текст:',
                
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
                'settings.theme_desc': 'Выберите цветовую схему приложения',
                'settings.animations_desc': 'Включить плавные анимации и переходы',
                'settings.compact_mode': 'Компактный режим',
                'settings.compact_mode_desc': 'Уменьшенные размеры нодов и панелей',
                'settings.grid_desc': 'Показать сетку на холсте',
                'settings.autosave_desc': 'Автоматически сохранять изменения в браузере',
                'settings.sound_effects_desc': 'Звуки при соединении нодов и других действиях',
                'settings.language_desc': 'Основной язык приложения',
                'settings.app_version': 'Версия приложения',
                'settings.app_version_desc': 'CipherFlow v1.0',
                'settings.hotkeys': 'Горячие клавиши',
                'settings.hotkeys_desc': 'Нажмите F1 или кнопку справки для просмотра всех комбинаций',
                'settings.section_saving': 'Сохранение',
                'settings.section_sound': 'Звук и эффекты',
                'settings.section_info': 'Информация',
                'settings.sound_on_indicator': 'Звук включен',
                'button.show': 'Показать',
                'notification.autosave_complete': 'Автосохранение выполнено',
                'dialog.reset_settings_confirm': 'Сбросить все настройки до значений по умолчанию?',
                'dialog.settings_reset_alert': 'Настройки сброшены до значений по умолчанию',
                                
                // Темы
                'theme.dark': 'Темная',
                'theme.light': 'Светлая',
                'theme.colorful': 'Цветная',
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
                'error.clipboard_access': 'Нет доступа к буферу обмена',

                // Ошибки инициализации
                'error.app_init': 'Ошибка инициализации приложения: {{message}}',
                'error.components_load': 'Ошибка загрузки компонентов: {{message}}',
                'error.components_timeout': 'Не удалось загрузить все компоненты',
                'error.unhandled': 'Произошла ошибка: {{message}}',
                'error.unknown': 'Неизвестная ошибка',

                // Ошибки движка
                'error.execution_failed': 'Ошибка выполнения: {{message}}',
                'error.node_processing': 'Ошибка в ноде: {{message}}',
                'error.division_by_zero': 'Ошибка: деление на 0',
                'error.invalid_binary_input': 'Ошибка: Некорректный бинарный ввод',
                'error.binary_decode': 'Ошибка декодирования: {{message}}',
                'error.base64': 'Ошибка Base64: {{message}}',
                'error.node_systems_not_ready': 'Системы нодов или соединений не инициализированы',

                // Диалоги
                'dialog.unsaved_changes': 'У вас есть несохраненная схема. Вы уверены, что хотите покинуть страницу?',

                // Обучающее окно (Tutorial)
                'tutorial.welcome': 'Добро пожаловать в CipherFlow!',
                'tutorial.step1_title': 'Перетащите ноды',
                'tutorial.step1_desc': 'Выберите ноды из левой панели и перетащите их на рабочую область.',
                'tutorial.step2_title': 'Соедините ноды',
                'tutorial.step2_desc': 'Кликните на точку вывода одного нода и перетащите к точке ввода другого.',
                'tutorial.step3_title': 'Настройте параметры',
                'tutorial.step3_desc': 'Измените настройки в нодах для получения нужного результата.',
                'tutorial.step4_title': 'Сохраните схему',
                'tutorial.step4_desc': 'Используйте кнопки сохранения для экспорта ваших схем шифрования.',
                'button.got_it': 'Понятно, спасибо!',
                'button.load_example': 'Загрузить пример',
                
                // Справочная система
                'help.navigation.overview': 'Обзор',
                'help.navigation.algorithms': 'Алгоритмы',
                'help.navigation.data_loss': 'Потеря данных',
                'help.navigation.examples': 'Примеры',
                'help.navigation.hotkeys': 'Горячие клавиши',
                
                // Обзор
                'help.overview.title': 'CipherFlow - Визуальное программирование шифров',
                'help.overview.description': 'CipherFlow позволяет создавать сложные схемы шифрования с помощью визуальных нодов. Соединяйте алгоритмы в цепочки для создания уникальных методов шифрования.',
                'help.overview.features': 'Основные возможности',
                'help.overview.visual_programming': 'Визуальное программирование',
                'help.overview.visual_desc': 'Создавайте алгоритмы без кодирования',
                'help.overview.chain_encryption': 'Цепочки шифрования',
                'help.overview.chain_desc': 'Комбинируйте множество алгоритмов',
                'help.overview.reverse_encryption': 'Реверсивное шифрование',
                'help.overview.reverse_desc': 'Автоматическое дешифрование',
                
                // Алгоритмы
                'help.algorithms.title': 'Алгоритмы шифрования',
                'help.algorithms.input_output': 'Входные и выходные ноды',
                'help.algorithms.classic_ciphers': 'Классические шифры',
                'help.algorithms.transformations': 'Преобразования',
                'help.algorithms.modern_ciphers': 'Современные шифры',
                
                // Описания алгоритмов
                'help.algo.text_input': 'Ввод текста',
                'help.algo.text_input_desc': 'Источник данных для цепочки шифрования',
                'help.algo.text_input_principle': 'Берет текст из общего поля ввода в нижней панели и передает его в цепочку обработки. Является начальной точкой любой схемы шифрования.',
                'help.algo.text_input_usage': 'Использование:',
                'help.algo.text_input_step1': '1. Введите текст в поле внизу экрана',
                'help.algo.text_input_step2': '2. Соедините выход нода "Ввод текста" со входом следующего алгоритма',
                'help.algo.text_input_result': 'Данные автоматически передаются в цепочку',
                'help.algo.text_input_features': 'Особенности',
                'help.algo.text_input_feature1': '• Только один выход, нет входов',
                'help.algo.text_input_feature2': '• Автоматически обновляется при изменении текста в поле ввода',
                'help.algo.text_input_feature3': '• Может быть несколько нодов ввода в одной схеме',
                
                'help.algo.text_output': 'Вывод текста',
                'help.algo.text_output_desc': 'Отображение результата цепочки шифрования',
                'help.algo.text_output_principle': 'Получает обработанные данные и отображает их в поле вывода в нижней панели. Является конечной точкой схемы шифрования.',
                'help.algo.text_output_usage': 'Использование:',
                'help.algo.text_output_step1': '1. Соедините вход нода "Вывод текста" с выходом последнего алгоритма',
                'help.algo.text_output_step2': '2. Результат автоматически появится в поле вывода внизу экрана',
                'help.algo.text_output_result': 'Можно копировать результат из поля вывода',
                'help.algo.text_output_features': 'Особенности',
                'help.algo.text_output_feature1': '• Только один вход, нет выходов',
                'help.algo.text_output_feature2': '• Автоматически обновляется при изменении данных',
                'help.algo.text_output_feature3': '• Может быть несколько нодов вывода для промежуточных результатов',
                
                'help.algo.caesar_cipher': 'Шифр Цезаря',
                'help.algo.caesar_desc': 'Сдвиг каждой буквы алфавита на фиксированное количество позиций',
                'help.algo.caesar_principle': 'Каждая буква текста заменяется буквой, стоящей в алфавите на N позиций дальше (с циклическим переносом).',
                'help.algo.caesar_example': 'Пример (сдвиг +3):',
                'help.algo.caesar_input': 'Вход: ПРИВЕТ',
                'help.algo.caesar_output': 'Выход: ТУЛГЖХ (П→Т, Р→У, И→Л, В→Г, Е→Ж, Т→Х)',
                
                'help.algo.morse_code': 'Код Морзе',
                'help.algo.morse_desc': 'Представление текста в виде последовательности точек и тире',
                'help.algo.morse_principle': 'Каждая буква, цифра и знак препинания кодируется уникальной комбинацией коротких (точка) и длинных (тире) сигналов.',
                'help.algo.morse_languages': 'Различия символов для языков:',
                'help.algo.morse_russian': 'Русский: · (Unicode точка) и − (Unicode тире)',
                'help.algo.morse_english': 'Английский: . (ASCII точка) и - (ASCII дефис)',
                'help.algo.morse_distinction': 'Это позволяет различать язык при декодировании смешанного текста',
                'help.algo.morse_example': 'Пример кодирования:',
                'help.algo.morse_input': 'Вход: "ПРИВЕТ SOS"',
                'help.algo.morse_output': 'Выход: ·−−· ·−· ·· ·−·· · ·− ... --- ...',
                'help.algo.morse_mix': 'Русские буквы: ·−, английские: .--',
                'help.algo.morse_yo_setting': 'Настройка поддержки Ё',
                'help.algo.morse_yo_desc': 'По умолчанию Ё кодируется как Е (·). Включите переключатель "Поддержка Ё" для отдельного кода ··−··',
                'help.algo.morse_yo_without': 'Без поддержки: ЁЛЬ → · ·−·· ·−··−',
                'help.algo.morse_yo_with': 'С поддержкой: ЁЛЬ → ··−·· ·−·· ·−··−',
                
                'help.algo.morse_cat': 'Морзе (Кошачий)',
                'help.algo.morse_cat_desc': 'Забавный вариант кода Морзе с кошачьими звуками',
                'help.algo.morse_cat_principle': 'Сначала текст кодируется в обычный код Морзе, затем символы заменяются на кошачьи звуки.',
                'help.algo.morse_cat_replacements': 'Замены:',
                'help.algo.morse_cat_dot': '· (точка) → мяy',
                'help.algo.morse_cat_dash': '− (тире) → мрряy',
                'help.algo.morse_cat_space': '/ (пробел между словами) → брряy',
                'help.algo.morse_cat_example': 'Пример кодирования:',
                'help.algo.morse_cat_input': 'Вход: КОТ',
                'help.algo.morse_cat_morse': 'Морзе: −·− −−− −',
                'help.algo.morse_cat_output': 'Кошачий: мрряyмяy мрряyмрряyмрряy мрряy',
                'help.algo.morse_cat_yo': 'Поддержка Ё в кошачьем морзе',
                'help.algo.morse_cat_yo_desc': 'Также поддерживается переключатель Ё, как в обычном морзе',
                'help.algo.morse_cat_yo_example': 'Ё с поддержкой → мяyмяyмрряyмяyмяy',
                
                'help.algo.a1z26': 'A1Z26 (Позиционный шифр)',
                'help.algo.a1z26_desc': 'Замена букв на их порядковые номера в алфавите',
                'help.algo.a1z26_principle': 'Каждая буква заменяется на её номер в алфавите (А=1, Б=2, ..., Я=33).',
                'help.algo.a1z26_example': 'Пример:',
                'help.algo.a1z26_input': 'Вход: КОТ',
                'help.algo.a1z26_output': 'Выход: 12-16-20 (К=12, О=16, Т=20)',
                
                'help.algo.vigenere': 'Шифр Виженера / Бофора',
                'help.algo.vigenere_desc': 'Полиалфавитный шифр с двумя режимами работы',
                'help.algo.vigenere_principle': 'Шифр с двумя режимами: классический Виженер и шифр Бофора.',
                'help.algo.vigenere_mode': 'Режим Виженер (ключ: КОТ):',
                'help.algo.vigenere_formula': 'Формула: (Текст + Ключ) mod m',
                'help.algo.vigenere_text': 'Текст: ПРИВЕТ, Ключ: КОТКО(Т)',
                'help.algo.vigenere_result': 'Результат: П+К=Э, Р+О=Е, И+Т=Б → ЕБИСМ',
                'help.algo.beaufort_mode': 'Режим Бофор (ключ: КОТ):',
                'help.algo.beaufort_formula': 'Формула: (Ключ - Текст) mod m',
                'help.algo.beaufort_text': 'Текст: ПРИВЕТ, Ключ: КОТКО(Т)',
                'help.algo.beaufort_result': 'Результат: К-П=Ь, О-Р=Ч, Т-И=Л → ЬЧЛФПВ',
                'help.algo.beaufort_title': 'Шифр Бофора',
                'help.algo.beaufort_feature1': '• Реципрокный (инволютивный) шифр',
                'help.algo.beaufort_feature2': '• Дешифровка = повторное применение с тем же ключом',
                'help.algo.beaufort_feature3': '• Формула одинакова для шифровки и дешифровки',
                'help.algo.vigenere_features': 'Особенности',
                'help.algo.vigenere_feature1': '• Имеет два входа: текст и ключ',
                'help.algo.vigenere_feature2': '• Ключ повторяется циклически',
                'help.algo.vigenere_feature3': '• Устойчив к частотному анализу',
                
                'help.algo.secret_word': 'Секретное слово',
                'help.algo.secret_word_desc': 'Генератор ключевых слов для других алгоритмов',
                'help.algo.secret_word_principle': 'Создает ключевое слово, которое можно использовать в шифрах типа Виженер.',
                'help.algo.secret_word_example': 'Пример:',
                'help.algo.secret_word_input': 'Секретное слово: ТАЙНА',
                'help.algo.secret_word_usage': 'Использование: подключить к ключевому входу Виженера',
                
                // Примеры
                'help.examples.title': 'Готовые примеры схем',
                'help.examples.subtitle': 'Загрузите готовые схемы для изучения',
                'help.examples.load': 'Загрузить пример',
                'help.examples.loaded': 'Пример загружен!',
                
                // Имена примеров
                'help.example.simple_caesar': 'Простой шифр Цезаря',
                'help.example.vigenere_secret': 'Шифр Виженера с секретным словом',
                'help.example.multilevel': 'Многоуровневое шифрование',
                'help.example.planet': 'Географическое шифрование',
                'help.example.cat_morse': 'Забавный кошачий морзе',
                'help.example.monitoring': 'Отладка с мониторами',
                
                // Общие термины для справки
                'help.general.principle': 'Принцип работы:',
                'help.general.example': 'Пример:',
                'help.general.input': 'Вход:',
                'help.general.output': 'Выход:',
                'help.general.usage': 'Использование:',
                'help.general.features': 'Особенности',
                'help.general.result': 'Результат:',
                
                // Дополнительные параметры нодов
                'param.mode': 'Режим',
                'param.rules': 'Правила замены',
                'param.case_sensitive': 'Учитывать регистр',
                'param.whole_words': 'Только целые слова',
                'param.condition': 'Условие',
                'param.search': 'Поиск',
                'param.merge_mode': 'Режим слияния',
                'param.split_mode': 'Режим разреза',
                'param.base_alphabet': 'Базовый алфавит',
                'param.decryption': 'Дешифровка',
                'param.decompression': 'Декомпрессия',
                'param.direction': 'Направление',
                'param.cipher_type': 'Тип шифра',
                'param.value': 'Значение',
                'param.yo_support': 'Поддержка Ё (··−··)',
                'param.yo_tooltip': 'Включить отдельный код для буквы Ё. По умолчанию Ё = Е',
                
                // Значения полей выбора
                'option.encode': 'Кодировать',
                'option.decode': 'Декодировать',
                'option.russian': 'Русский',
                'option.english': 'English',
                'option.mix': 'Перемешать',
                'option.to_words': 'В слова',
                'option.to_numbers': 'В числа',
                'option.add': 'Прибавить',
                'option.subtract': 'Вычесть',
                'option.multiply': 'Умножить',
                'option.divide': 'Разделить',
                'option.full': 'Полностью',
                'option.words': 'По словам',
                'option.boustrophedon': 'Змейка (Бустрофедон)',
                'option.upper': 'ВЕРХНИЙ',
                'option.lower': 'нижний',
                'option.title': 'Заглавные',
                'option.toggle': 'иНВЕРТИРОВАТЬ',
                'option.vigenere': 'Виженер ((T+K) mod m)',
                'option.beaufort': 'Бофор ((K-T) mod m)',
                'option.text_input': 'Текст',
                'option.key_input': 'Ключ',
                'option.text_to_cat': 'Текст → Кошачий код',
                'option.cat_to_text': 'Кошачий код → Текст',
                'option.yo_support_cat': 'Поддержка Ё (мяумяумрряумяумяу)',
                'option.text_to_coords': 'Текст → Координаты',
                'option.coords_to_text': 'Координаты → Текст',
                'option.contains_numbers': 'Содержит числа',
                'option.no_numbers': 'Не содержит чисел',
                'option.contains_latin': 'Содержит латиницу',
                'option.no_latin': 'Не содержит латиницу',
                'option.contains_cyrillic': 'Содержит кириллицу',
                'option.no_cyrillic': 'Не содержит кириллицу',
                'option.contains_text': 'Текст содержит...',
                'option.regex_match': 'Соответствует Regex...',
                'option.alt_chars': 'Чередование символов (ABAB...)',
                'option.alt_words': 'Чередование слов (A_word B_word...)',
                'option.alt_lines': 'Чередование строк (A_line B_line...)',
                'option.split_chars': 'Разделение по символам (AB...→A,B)',
                'option.split_words': 'Разделение по словам (A B...→A,B)',
                'option.split_lines': 'Разделение по строкам (A\\nB...→A,B)',
                'option.ru_alphabet_33': 'Русский (33 буквы)',
                'option.en_alphabet_26': 'Английский (26 букв)'
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
                'nodes.title': 'Encryption Nodes',
                'nodes.input_output': 'Input/Output',
                'nodes.classic_ciphers': 'Classic Ciphers',
                'nodes.morse_variants': 'Morse Variants',
                'nodes.transformations': 'Transformations',
                'nodes.advanced_processing': 'Advanced Processing',
                'nodes.logical_operations': 'Logical Operations',
                'nodes.modern_ciphers': 'Modern Ciphers',
                'nodes.fun_ciphers': 'Fun Ciphers',
                'nodes.utilities': 'Utilities',
                
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
                'node.complex_substitution': 'Complex Substitution',
                'node.simple_substitution': 'Simple Substitution',
                'node.rle_compression': 'Compression (RLE)',
                'node.stream_splitter': 'Stream Splitter',
                'node.text_router': 'Text Router',
                'node.stream_merger': 'Stream Merger',
                'node.atbash_cipher': 'Atbash Cipher',
                'node.base64': 'Base64 Encoder',
                'node.shark_cipher': 'Shark Cipher',
                'node.uwu_cipher': 'UwU-ifier (Cuteness Cipher)',
                'node.monitor': 'Monitor',
                'node.comment': 'Comment',
                'node.route_transposition': 'Route Transposition',

                // Outputs and inputs
                'output.if_true': 'If YES',
                'output.if_false': 'If NO',
                'input.stream_a': 'Stream A',
                'input.stream_b': 'Stream B',

                // Placeholders and tooltips
                'placeholder.find': 'Find',
                'placeholder.replace': 'Replace',
                'node.show_help_tooltip': 'Show help for this node',

                // Monitor
                'monitor.waiting_for_data': 'Waiting for data...',
                'monitor.copy_content': 'Copy content',
                'notification.monitor_copied': 'Monitor content copied!',
                'error.copy_failed': 'Could not copy',
                'monitor.direction_decrypt': '⬅ Decryption',
                'monitor.direction_encrypt': '➡ Encryption',
                'monitor.empty_input': 'Empty',

                // Default values
                'param.default_keyword': 'SECRET',

                // Buttons and UI
                'button.add': 'Add',

                // History and Selection
                'history.node_created': 'Created node: {{title}}',
                'history.node_deleted': 'Deleted node: {{title}}',
                'history.group_moved': 'Moved nodes: {{count}}',
                'history.nothing_to_undo': 'Nothing to undo',
                'history.undone': 'Undone: {{description}}',
                'history.undo_error': 'Undo error',
                'history.nothing_to_redo': 'Nothing to redo',
                'history.redone': 'Redone: {{description}}',
                'history.redo_error': 'Redo error',

                'selection.copied': 'Copied to clipboard: {{count}} node(s)',
                'selection.copy_error': 'Error: Could not copy to system clipboard',
                'selection.paste_empty': 'Clipboard is empty or contains invalid data',
                'selection.pasted': 'Pasted nodes: {{count}}',
                'selection.deleted': 'Deleted nodes: {{count}}',
                
                // Canvas controls
                'canvas.zoom_in': 'Zoom In (Ctrl + +)',
                'canvas.zoom_out': 'Zoom Out (Ctrl + -)',
                'canvas.zoom_reset': 'Reset Zoom (Ctrl + 0)',
                'canvas.cut_mode': 'Connection Cut Mode (X)',
                'canvas.fullscreen': 'Fullscreen Mode',
                'canvas.export_image': 'Export as Image',
                'canvas.cut_mode_tooltip': 'Connection Cutting Mode (X / Alt)',
                'canvas.cut_mode_hint': 'Cutting mode active: Drag a line across connections',
                'notification.connections_cut': '✂️ Connections cut: {{count}}',
                
                // I/O panel
                'io.input_label': 'Input text:',
                'io.output_label': 'Result:',
                'io.input_placeholder': 'Enter text to process...',
                'io.output_placeholder': 'Result will be displayed here...',
                'io.clear_input': 'Clear Input',
                'io.copy_output': 'Copy Result',
                'io.paste_input': 'Paste from Clipboard',
                'io.decrypted_placeholder': 'Decrypted text will appear here...',
                'io.encrypted_placeholder': 'Enter encrypted text to process...',
                'io.decrypted_label': 'Decrypted text:',
                'io.encrypted_label': 'Encrypted text:',
                
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
                'settings.theme_desc': 'Choose the color scheme of the application',
                'settings.animations_desc': 'Enable smooth animations and transitions',
                'settings.compact_mode': 'Compact Mode',
                'settings.compact_mode_desc': 'Reduced size for nodes and panels',
                'settings.grid_desc': 'Display a grid on the canvas',
                'settings.autosave_desc': 'Automatically save changes in the browser',
                'settings.sound_effects_desc': 'Sounds for connecting nodes and other actions',
                'settings.language_desc': 'The main language of the application',
                'settings.app_version': 'Application Version',
                'settings.app_version_desc': 'CipherFlow v1.0',
                'settings.hotkeys': 'Hotkeys',
                'settings.hotkeys_desc': 'Press F1 or the help button to see all combinations',
                'settings.section_saving': 'Saving',
                'settings.section_sound': 'Sound & Effects',
                'settings.section_info': 'Information',
                'settings.sound_on_indicator': 'Sound is ON',
                'button.show': 'Show',
                'notification.autosave_complete': 'Autosave complete',
                'dialog.reset_settings_confirm': 'Reset all settings to their default values?',
                'dialog.settings_reset_alert': 'Settings have been reset to default',
                                
                // Themes
                'theme.dark': 'Dark',
                'theme.colorful': 'Colorful',
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
                'error.clipboard_access': 'No clipboard access',

                // Initialization Errors
                'error.app_init': 'Application initialization error: {{message}}',
                'error.components_load': 'Component loading error: {{message}}',
                'error.components_timeout': 'Failed to load all components',
                'error.unhandled': 'An error occurred: {{message}}',
                'error.unknown': 'Unknown error',

                // Engine Errors
                'error.execution_failed': 'Execution error: {{message}}',
                'error.node_processing': 'Error in node: {{message}}',
                'error.division_by_zero': 'Error: Division by zero',
                'error.invalid_binary_input': 'Error: Invalid binary input',
                'error.binary_decode': 'Decoding error: {{message}}',
                'error.base64': 'Base64 Error: {{message}}',
                'error.node_systems_not_ready': 'Node or connection systems are not initialized',

                // Dialogs
                'dialog.unsaved_changes': 'You have an unsaved scheme. Are you sure you want to leave the page?',

                // Tutorial Window
                'tutorial.welcome': 'Welcome to CipherFlow!',
                'tutorial.step1_title': 'Drag and Drop Nodes',
                'tutorial.step1_desc': 'Select nodes from the left panel and drag them onto the workspace.',
                'tutorial.step2_title': 'Connect the Nodes',
                'tutorial.step2_desc': 'Click on the output point of one node and drag to the input point of another.',
                'tutorial.step3_title': 'Configure Parameters',
                'tutorial.step3_desc': 'Change the settings within the nodes to get the desired result.',
                'tutorial.step4_title': 'Save Your Scheme',
                'tutorial.step4_desc': 'Use the save buttons to export your encryption schemes.',
                'button.got_it': 'Got it, thanks!',
                'button.load_example': 'Load Example',
                
                // Help system
                'help.navigation.overview': 'Overview',
                'help.navigation.algorithms': 'Algorithms',
                'help.navigation.data_loss': 'Data Loss',
                'help.navigation.examples': 'Examples',
                'help.navigation.hotkeys': 'Hotkeys',
                
                // Overview
                'help.overview.title': 'CipherFlow - Visual Cipher Programming',
                'help.overview.description': 'CipherFlow allows creating complex encryption schemes using visual nodes. Connect algorithms in chains to create unique encryption methods.',
                'help.overview.features': 'Key Features',
                'help.overview.visual_programming': 'Visual Programming',
                'help.overview.visual_desc': 'Create algorithms without coding',
                'help.overview.chain_encryption': 'Encryption Chains',
                'help.overview.chain_desc': 'Combine multiple algorithms',
                'help.overview.reverse_encryption': 'Reverse Encryption',
                'help.overview.reverse_desc': 'Automatic decryption',
                
                // Algorithms
                'help.algorithms.title': 'Encryption Algorithms',
                'help.algorithms.input_output': 'Input and Output Nodes',
                'help.algorithms.classic_ciphers': 'Classic Ciphers',
                'help.algorithms.transformations': 'Transformations',
                'help.algorithms.modern_ciphers': 'Modern Ciphers',
                
                // Algorithm descriptions
                'help.algo.text_input': 'Text Input',
                'help.algo.text_input_desc': 'Data source for encryption chain',
                'help.algo.text_input_principle': 'Takes text from the common input field in the bottom panel and passes it to the processing chain. Is the starting point of any encryption scheme.',
                'help.algo.text_input_usage': 'Usage:',
                'help.algo.text_input_step1': '1. Enter text in the field at the bottom of the screen',
                'help.algo.text_input_step2': '2. Connect the "Text Input" node output to the next algorithm input',
                'help.algo.text_input_result': 'Data is automatically passed to the chain',
                'help.algo.text_input_features': 'Features',
                'help.algo.text_input_feature1': '• Only one output, no inputs',
                'help.algo.text_input_feature2': '• Automatically updates when text changes in input field',
                'help.algo.text_input_feature3': '• Multiple input nodes can exist in one scheme',
                
                'help.algo.text_output': 'Text Output',
                'help.algo.text_output_desc': 'Display result of encryption chain',
                'help.algo.text_output_principle': 'Receives processed data and displays it in the output field in the bottom panel. Is the end point of the encryption scheme.',
                'help.algo.text_output_usage': 'Usage:',
                'help.algo.text_output_step1': '1. Connect the "Text Output" node input to the last algorithm output',
                'help.algo.text_output_step2': '2. Result automatically appears in the output field at bottom of screen',
                'help.algo.text_output_result': 'You can copy the result from the output field',
                'help.algo.text_output_features': 'Features',
                'help.algo.text_output_feature1': '• Only one input, no outputs',
                'help.algo.text_output_feature2': '• Automatically updates when data changes',
                'help.algo.text_output_feature3': '• Multiple output nodes can exist for intermediate results',
                
                'help.algo.caesar_cipher': 'Caesar Cipher',
                'help.algo.caesar_desc': 'Shift each letter of alphabet by fixed number of positions',
                'help.algo.caesar_principle': 'Each letter of the text is replaced by a letter standing N positions further in the alphabet (with cyclic wrap-around).',
                'help.algo.caesar_example': 'Example (shift +3):',
                'help.algo.caesar_input': 'Input: HELLO',
                'help.algo.caesar_output': 'Output: KHOOR (H→K, E→H, L→O, L→O, O→R)',
                
                'help.algo.morse_code': 'Morse Code',
                'help.algo.morse_desc': 'Text representation as sequence of dots and dashes',
                'help.algo.morse_principle': 'Each letter, digit and punctuation mark is encoded with unique combination of short (dot) and long (dash) signals.',
                'help.algo.morse_languages': 'Symbol differences for languages:',
                'help.algo.morse_russian': 'Russian: · (Unicode dot) and − (Unicode dash)',
                'help.algo.morse_english': 'English: . (ASCII dot) and - (ASCII hyphen)',
                'help.algo.morse_distinction': 'This allows distinguishing language when decoding mixed text',
                'help.algo.morse_example': 'Encoding example:',
                'help.algo.morse_input': 'Input: "HELLO SOS"',
                'help.algo.morse_output': 'Output: .... . .-.. .-.. --- ... --- ...',
                'help.algo.morse_mix': 'Russian letters: ·−, English: .--',
                'help.algo.morse_yo_setting': 'Ё Support Setting',
                'help.algo.morse_yo_desc': 'By default Ё is encoded as Е (·). Enable "Ё Support" toggle for separate code ··−··',
                'help.algo.morse_yo_without': 'Without support: ЁЛЬ → · ·−·· ·−··−',
                'help.algo.morse_yo_with': 'With support: ЁЛЬ → ··−·· ·−·· ·−··−',
                
                'help.algo.morse_cat': 'Morse (Cat)',
                'help.algo.morse_cat_desc': 'Fun variant of Morse code with cat sounds',
                'help.algo.morse_cat_principle': 'First text is encoded to regular Morse code, then symbols are replaced with cat sounds.',
                'help.algo.morse_cat_replacements': 'Replacements:',
                'help.algo.morse_cat_dot': '· (dot) → мяy',
                'help.algo.morse_cat_dash': '− (dash) → мрряy',
                'help.algo.morse_cat_space': '/ (space between words) → брряy',
                'help.algo.morse_cat_example': 'Encoding example:',
                'help.algo.morse_cat_input': 'Input: CAT',
                'help.algo.morse_cat_morse': 'Morse: -.-. .- -',
                'help.algo.morse_cat_output': 'Cat: мрряyмяyмрряyмяy мяyмрряy мрряy',
                'help.algo.morse_cat_yo': 'Ё Support in Cat Morse',
                'help.algo.morse_cat_yo_desc': 'Ё toggle is also supported, like in regular Morse',
                'help.algo.morse_cat_yo_example': 'Ё with support → мяyмяyмрряyмяyмяy',
                
                'help.algo.a1z26': 'A1Z26 (Positional Cipher)',
                'help.algo.a1z26_desc': 'Replace letters with their ordinal numbers in alphabet',
                'help.algo.a1z26_principle': 'Each letter is replaced with its number in the alphabet (A=1, B=2, ..., Z=26).',
                'help.algo.a1z26_example': 'Example:',
                'help.algo.a1z26_input': 'Input: CAT',
                'help.algo.a1z26_output': 'Output: 3-1-20 (C=3, A=1, T=20)',
                
                'help.algo.vigenere': 'Vigenère / Beaufort Cipher',
                'help.algo.vigenere_desc': 'Polyalphabetic cipher with two operation modes',
                'help.algo.vigenere_principle': 'Cipher with two modes: classic Vigenère and Beaufort cipher.',
                'help.algo.vigenere_mode': 'Vigenère Mode (key: KEY):',
                'help.algo.vigenere_formula': 'Formula: (Text + Key) mod m',
                'help.algo.vigenere_text': 'Text: HELLO, Key: KEYKE',
                'help.algo.vigenere_result': 'Result: H+K=R, E+E=I, L+Y=J → RIJVS',
                'help.algo.beaufort_mode': 'Beaufort Mode (key: KEY):',
                'help.algo.beaufort_formula': 'Formula: (Key - Text) mod m',
                'help.algo.beaufort_text': 'Text: HELLO, Key: KEYKE',
                'help.algo.beaufort_result': 'Result: K-H=D, E-E=A, Y-L=M → DAMIG',
                'help.algo.beaufort_title': 'Beaufort Cipher',
                'help.algo.beaufort_feature1': '• Reciprocal (involutory) cipher',
                'help.algo.beaufort_feature2': '• Decryption = reapplying with same key',
                'help.algo.beaufort_feature3': '• Same formula for encryption and decryption',
                'help.algo.vigenere_features': 'Features',
                'help.algo.vigenere_feature1': '• Has two inputs: text and key',
                'help.algo.vigenere_feature2': '• Key repeats cyclically',
                'help.algo.vigenere_feature3': '• Resistant to frequency analysis',
                
                'help.algo.secret_word': 'Secret Word',
                'help.algo.secret_word_desc': 'Key word generator for other algorithms',
                'help.algo.secret_word_principle': 'Creates a key word that can be used in ciphers like Vigenère.',
                'help.algo.secret_word_example': 'Example:',
                'help.algo.secret_word_input': 'Secret word: SECRET',
                'help.algo.secret_word_usage': 'Usage: connect to Vigenère key input',
                
                // Examples
                'help.examples.title': 'Ready-made Scheme Examples',
                'help.examples.subtitle': 'Load ready schemes for learning',
                'help.examples.load': 'Load Example',
                'help.examples.loaded': 'Example loaded!',
                
                // Example names
                'help.example.simple_caesar': 'Simple Caesar Cipher',
                'help.example.vigenere_secret': 'Vigenère with Secret Word',
                'help.example.multilevel': 'Multi-level Encryption',
                'help.example.planet': 'Geographic Encryption',
                'help.example.cat_morse': 'Fun Cat Morse',
                'help.example.monitoring': 'Debug with Monitors',
                
                // General help terms
                'help.general.principle': 'Principle:',
                'help.general.example': 'Example:',
                'help.general.input': 'Input:',
                'help.general.output': 'Output:',
                'help.general.usage': 'Usage:',
                'help.general.features': 'Features',
                'help.general.result': 'Result:',
                
                // Additional node parameters
                'param.mode': 'Mode',
                'param.rules': 'Replacement Rules',
                'param.case_sensitive': 'Case Sensitive',
                'param.whole_words': 'Whole Words Only',
                'param.condition': 'Condition',
                'param.search': 'Search Text',
                'param.merge_mode': 'Merge Mode',
                'param.split_mode': 'Split Mode',
                'param.base_alphabet': 'Base Alphabet',
                'param.decryption': 'Decryption',
                'param.decompression': 'Decompression',
                'param.direction': 'Direction',
                'param.cipher_type': 'Cipher Type',
                'param.value': 'Value',
                'param.yo_support': 'Ё Support (··−··)',
                'param.yo_tooltip': 'Enable separate code for letter Ё. By default Ё = Е',
                
                // Option values
                'option.encode': 'Encode',
                'option.decode': 'Decode',
                'option.russian': 'Russian',
                'option.english': 'English',
                'option.mix': 'Mix',
                'option.to_words': 'To Words',
                'option.to_numbers': 'To Numbers',
                'option.add': 'Add',
                'option.subtract': 'Subtract',
                'option.multiply': 'Multiply',
                'option.divide': 'Divide',
                'option.full': 'Full',
                'option.words': 'By Words',
                'option.boustrophedon': 'Snake (Boustrophedon)',
                'option.upper': 'UPPER',
                'option.lower': 'lower',
                'option.title': 'Title Case',
                'option.toggle': 'tOGGLE cASE',
                'option.vigenere': 'Vigenère ((T+K) mod m)',
                'option.beaufort': 'Beaufort ((K-T) mod m)',
                'option.text_input': 'Text',
                'option.key_input': 'Key',
                'option.text_to_cat': 'Text → Cat Code',
                'option.cat_to_text': 'Cat Code → Text',
                'option.yo_support_cat': 'Ё Support (meowmeowpurrmeowmeow)',
                'option.text_to_coords': 'Text → Coordinates',
                'option.coords_to_text': 'Coordinates → Text',
                'option.contains_numbers': 'Contains numbers',
                'option.no_numbers': 'Does not contain numbers',
                'option.contains_latin': 'Contains Latin',
                'option.no_latin': 'Does not contain Latin',
                'option.contains_cyrillic': 'Contains Cyrillic',
                'option.no_cyrillic': 'Does not contain Cyrillic',
                'option.contains_text': 'Text contains...',
                'option.regex_match': 'Matches Regex...',
                'option.alt_chars': 'Alternating Chars (ABAB...)',
                'option.alt_words': 'Alternating Words (A_word B_word...)',
                'option.alt_lines': 'Alternating Lines (A_line B_line...)',
                'option.split_chars': 'Split by Chars (AB...→A,B)',
                'option.split_words': 'Split by Words (A B...→A,B)',
                'option.split_lines': 'Split by Lines (A\\nB...→A,B)',
                'option.ru_alphabet_33': 'Russian (33 letters)',
                'option.en_alphabet_26': 'English (26 letters)',
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