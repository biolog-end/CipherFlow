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
                'nodes.system_ciphers': 'Системные шифры',
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
                'node.navi_terminal': 'NAVI Terminal',
                'node.knights_cipher': 'Шифр Рыцарей',
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
                'dialog.save_scheme_title': 'Сохранить схему',
                'dialog.scheme_name_label': 'Название схемы:',
                'dialog.scheme_name_placeholder': 'Введите название схемы...',
                'dialog.default_scheme_name': 'Моя схема шифрования',
                'dialog.scheme_desc_label': 'Описание (необязательно):',
                'dialog.scheme_desc_placeholder': 'Краткое описание того, что делает эта схема...',
                'dialog.overwrite_confirm': 'Это заменит текущую схему. Продолжить?',
                'dialog.clear_all_confirm': 'Это удалит все ноды и соединения. Продолжить?',
                'dialog.autosave_found_confirm': 'Найдено автоматически сохраненная схема. Восстановить?',
                'dialog.reset_achievements_confirm': 'Вы уверены, что хотите сбросить все достижения? Это действие необратимо.',
                
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
                'settings.theme_locked': ' Активна пасхалка ௹ꙮ ', 
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
                'settings.section_achievements': 'Достижения',
                'settings.reset_achievements': 'Сброс достижений',
                'settings.reset_achievements_desc': 'Стереть все полученные пасхалки и достижения. Это действие необратимо.',
                'button.show': 'Показать',
                'button.reset': 'Сбросить',
                'notification.autosave_complete': 'Автосохранение выполнено',
                'dialog.reset_settings_confirm': 'Сбросить все настройки до значений по умолчанию?',
                'dialog.settings_reset_alert': 'Настройки сброшены до значений по умолчанию',
                'dialog.unsaved_changes': 'У вас есть несохраненная схема. Вы уверены, что хотите покинуть страницу?',

                                
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
                'notification.scheme_saved_as': 'Схема "{{name}}" успешно сохранена!',
                'notification.scheme_loaded_as': 'Схема "{{name}}" успешно загружена!',
                'notification.desc_prefix': 'Описание:',
                'notification.scheme_cleared': 'Схема очищена',
                'notification.scheme_restored': 'Схема восстановлена из автосохранения',
                'notification.example_loaded': 'Пример "{{name}}" загружен!',
                'notification.achievements_reset': 'Все достижения сброшены!',
                
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
                'error.knights_cipher_needs_inputs': 'Шифр Рыцарей требует два входа: контейнер и секрет',
                'error.division_by_zero': 'Ошибка: деление на 0',
                'error.invalid_binary_input': 'Ошибка: Некорректный бинарный ввод',
                'error.binary_decode': 'Ошибка декодирования: {{message}}',
                'error.base64': 'Ошибка Base64: {{message}}',
                'error.node_systems_not_ready': 'Системы нодов или соединений не инициализированы',

                // Ошибки сохранения 
                'error.save_failed': 'Ошибка сохранения: {{message}}',
                'error.load_failed': 'Ошибка загрузки: {{message}}',
                'error.clear_failed': 'Ошибка очистки: {{message}}',
                'error.example_load_failed': 'Ошибка загрузки примера: {{message}}',
                'error.file_read_error': 'Ошибка чтения файла',
                'error.json_only': 'Пожалуйста, выберите JSON файл',
                'error.dnd_json_only': 'Поддерживаются только JSON файлы',

                // Прочее
                'scheme.unknown_name': 'Неизвестная схема',

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
                'help.overview.animation_text': 'ТЕКСТ → ШИФР → РЕЗУЛЬТАТ',

                
                // Алгоритмы
                'help.algorithms.title': 'Алгоритмы шифрования',
                'help.algorithms.input_output': 'Входные и выходные ноды',
                'help.algorithms.classic_ciphers': 'Классические шифры',
                'help.algorithms.transformations': 'Преобразования',
                'help.algorithms.modern_ciphers': 'Современные шифры',
                'help.algorithms.compression': 'Сжатие данных',
                'help.algorithms.advanced_processing': 'Продвинутая обработка',
                'help.algorithms.logical_operations': 'Логические операции',
                'help.algorithms.fun_ciphers': 'Забавные шифры',
                'help.algorithms.utilities': 'Утилиты',
                
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

                'help.algo.complex_substitution.title': 'Шифр сложной замены',
                'help.algo.complex_substitution.desc': 'Пользовательский алфавит замены на основе ключа с любыми символами',
                'help.algo.complex_substitution.principle': 'Создает уникальный алфавит для замены, используя ключ с любыми символами. Ключ обрабатывается: удаляются повторения, разделяется на алфавитную и неалфавитную части, неалфавитные символы добавляются в начало нового алфавита.',
                'help.algo.complex_substitution.example_title': 'Пример (ключ: "Кот!#", русский алфавит):',
                'help.algo.complex_substitution.example_base': 'Базовый алфавит: абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
                'help.algo.complex_substitution.example_process': 'Обработка ключа: кот!# → алфавитная часть: кот, неалфавитная: !#',
                'help.algo.complex_substitution.example_new_alphabet': 'Новый алфавит: !#котабвгдеёжзийклмнпрсуфхцчшщъыьэ',
                'help.algo.complex_substitution.example_encrypt': 'Шифрование "бак": б→#, а→!, к→ж → "#!ж"',
                'help.algo.complex_substitution.feature1': '• Поддерживает русский и английский алфавиты',
                'help.algo.complex_substitution.feature2': '• Ключ может содержать любые символы',
                'help.algo.complex_substitution.feature3': '• Реверсивный: та же операция для шифровки и дешифровки',

                'help.algo.simple_substitution.title': 'Шифр простой замены',
                'help.algo.simple_substitution.desc': 'Классический шифр замены с ключевым словом',
                'help.algo.simple_substitution.principle': 'Создает алфавит замены, где в начале идут уникальные буквы ключа, за ними — остальные буквы алфавита. Работает с русским и английским алфавитами одновременно, не смешивая их.',
                'help.algo.simple_substitution.example_title': 'Пример (ключ: "cipher"):',
                'help.algo.simple_substitution.example_base': 'Английский алфавит: abcdefghijklmnopqrstuvwxyz',
                'help.algo.simple_substitution.example_new_alphabet': 'Новый алфавит: cipherabdfgjklmnoqstuvwxyz',
                'help.algo.simple_substitution.example_encrypt': 'Шифрование "attack": a→c, t→t, c→p, k→j → "cttcpj"',
                'help.algo.simple_substitution.feature1': '• Одновременная работа с двумя алфавитами',
                'help.algo.simple_substitution.feature2': '• Русские буквы заменяются по русскому словарю',
                'help.algo.simple_substitution.feature3': '• Английские — по английскому',

                'help.algo.route_transposition.title': 'Шифр маршрутной перестановки',
                'help.algo.route_transposition.desc': 'Перестановка символов через матричную запись текста',
                'help.algo.route_transposition.principle': 'Текст записывается в матрицу по строкам, ширина которой равна длине ключа. Порядок считывания столбцов определяется алфавитным порядком букв ключа.',
                'help.algo.route_transposition.example_title': 'Пример (ключ: "КОД"):',
                'help.algo.route_transposition.example_text': 'Текст: ПРИВЕТСТВУЮ',
                'help.algo.route_transposition.example_order': 'Порядок столбцов: Д(1), К(2), О(3)',
                'help.algo.route_transposition.example_matrix': 'Матрица:\nК О Д\nП Р И\nВ Е Т\nС Т В\nУ Ю',
                'help.algo.route_transposition.example_result': 'Считывание по столбцам: И+Т+В + П+В+С+У + Р+Е+Т+Ю = "ИТВПВСУРЕТЮ"',

                'help.algo.rle.title': 'Сжатие RLE',
                'help.algo.rle.desc': 'Кодирование длин серий (Run Length Encoding)',
                'help.algo.rle.principle': 'Алгоритм сжатия, который заменяет последовательности одинаковых символов на количество повторений и сам символ.',
                'help.algo.rle.example_compress_title': 'Пример сжатия:',
                'help.algo.rle.example_compress_input': 'Текст: ААААААБББВВГГГГГ',
                'help.algo.rle.example_compress_output': 'Результат: 6А3Б2В5Г',
                'help.algo.rle.example_decompress_title': 'Пример декомпрессии:',
                'help.algo.rle.example_decompress_input': 'Текст: 6А3Б2В5Г',
                'help.algo.rle.example_decompress_output': 'Результат: ААААААБББВВГГГГГ',
                'help.algo.rle.feature1': '• Не является шифром — алгоритм сжатия',
                'help.algo.rle.feature2': '• Эффективен для текстов с повторяющимися символами',
                'help.algo.rle.feature3': '• Полностью обратимый процесс',

                'help.algo.numbers_to_words.title': 'Числа в слова',
                'help.algo.numbers_to_words.desc': 'Преобразование цифр в словесное представление',
                'help.algo.numbers_to_words.principle': 'Заменяет каждую цифру в тексте на её словесное представление на выбранном языке.',
                'help.algo.numbers_to_words.example_ru_title': 'Пример (русский):',
                'help.algo.numbers_to_words.example_ru_input': 'Вход: Мой код: 123',
                'help.algo.numbers_to_words.example_ru_output': 'Выход: Мой код: одиндватри',
                'help.algo.numbers_to_words.example_en_title': 'Пример (английский):',
                'help.algo.numbers_to_words.example_en_input': 'Вход: I have 7 cats',
                'help.algo.numbers_to_words.example_en_output': 'Выход: I have seven cats',

                'help.algo.math.title': 'Математика',
                'help.algo.math.desc': 'Арифметические операции над числами в тексте',
                'help.algo.math.principle': 'Находит числа в тексте и выполняет над ними выбранную математическую операцию.',
                'help.algo.math.example_title': 'Пример (умножение на 2):',
                'help.algo.math.example_input': 'Вход: У меня 5 котов и 12 собак',
                'help.algo.math.example_output': 'Выход: У меня 10 котов и 24 собак',
                'help.algo.math.features_title': 'Доступные операции',
                'help.algo.math.feature1': '• Сложение/вычитание константы',
                'help.algo.math.feature2': '• Умножение/деление на константу',

                'help.algo.reverse.title': 'Обратить текст',
                'help.algo.reverse.desc': 'Реверс всего текста, отдельных слов или режим "Змейка"',
                'help.algo.reverse.principle': 'Изменяет порядок символов в тексте в обратном направлении.',
                'help.algo.reverse.mode_full_title': 'Режим "Весь текст":',
                'help.algo.reverse.mode_full_input': 'Вход: ПРИВЕТ МИР',
                'help.algo.reverse.mode_full_output': 'Выход: РИМ ТЕВИРП',
                'help.algo.reverse.mode_words_title': 'Режим "По словам":',
                'help.algo.reverse.mode_words_input': 'Вход: ПРИВЕТ МИР',
                'help.algo.reverse.mode_words_output': 'Выход: ТЕВИРП РИМ',
                'help.algo.reverse.mode_snake_title': 'Режим "Змейка (Бустрофедон)":',
                'help.algo.reverse.mode_snake_input': 'Вход:\nПервая строка\nВторая строка\nТретья строка',
                'help.algo.reverse.mode_snake_output': 'Выход:\nПервая строка\nакортс яаротВ\nТретья строка',
                'help.algo.reverse.snake_title': 'Режим "Змейка"',
                'help.algo.reverse.snake_feature1': '• Каждая четная строка (2-я, 4-я, 6-я...) переворачивается',
                'help.algo.reverse.snake_feature2': '• Нечетные строки остаются без изменений',
                'help.algo.reverse.snake_feature3': '• Операция является своей собственной инверсией',

                'help.algo.case.title': 'Регистр',
                'help.algo.case.desc': 'Изменение регистра букв в тексте',
                'help.algo.case.principle': 'Преобразует регистр букв согласно выбранному режиму.',
                'help.algo.case.modes_title': 'Доступные режимы:',
                'help.algo.case.mode_upper': 'Верхний: привет → ПРИВЕТ',
                'help.algo.case.mode_lower': 'Нижний: ПРИВЕТ → привет',
                'help.algo.case.mode_title': 'Заглавные: привет мир → Привет Мир',
                'help.algo.case.mode_toggle': 'Инвертировать: ПрИвЕт → пРиВеТ',

                'help.algo.binary.title': 'Бинарный код',
                'help.algo.binary.desc': 'Представление текста в двоичной системе',
                'help.algo.binary.principle': 'Каждый символ кодируется в его ASCII/UTF-8 представление в двоичной системе.',
                'help.algo.binary.example_title': 'Пример:',
                'help.algo.binary.example_input': 'Вход: A',
                'help.algo.binary.example_output': 'Выход: 01000001 (ASCII 65)',
                'help.algo.binary.feature1': '• Кириллица требует UTF-8 (более длинные коды)',
                'help.algo.binary.feature2': '• Результат может быть очень длинным',

                'help.algo.planet_enchanter.title': 'Зачаровыватель планет',
                'help.algo.planet_enchanter.desc': 'Уникальный шифр через координаты городов мира',
                'help.algo.planet_enchanter.principle': 'Каждая буква заменяется координатами случайного города, название которого начинается на эту букву.',
                'help.algo.planet_enchanter.example_title': 'Пример:',
                'help.algo.planet_enchanter.example_input': 'Вход: МИР',
                'help.algo.planet_enchanter.example_output': 'Выход: 55.7558, 37.6176 (Москва)\n55.7558, 49.2076 (Иркутск)\n61.2181, 73.4529 (Рига)',
                
                'help.algo.multi_replace.title': 'Мульти-Замена',
                'help.algo.multi_replace.desc': 'Множественная замена символов или слов по правилам',
                'help.algo.multi_replace.principle': 'Выполняет замену по списку правил "что→на что". Каждое правило записывается в отдельной строке.',
                'help.algo.multi_replace.example_rules_title': 'Пример правил:',
                'help.algo.multi_replace.example_rules': 'а→@\nе→3\nо→0\nкот→cat',
                'help.algo.multi_replace.example_input': 'Вход: "Привет кот"',
                'help.algo.multi_replace.example_output': 'Выход: "При3т cat"',
                'help.algo.multi_replace.settings_title': 'Настройки',
                'help.algo.multi_replace.settings_intro': 'Нод имеет две важные опции, которые управляют его поведением:',
                'help.algo.multi_replace.case_sensitive_title': 'Учитывать регистр (Case Sensitive):',
                'help.algo.multi_replace.case_sensitive_off': '• Выключено (по умолч.): Замена происходит без учета регистра. Правило кот→cat сработает для слов "кот", "Кот" и "КОТ".',
                'help.algo.multi_replace.case_sensitive_on': '• Включено: Замена происходит только при точном совпадении регистра. Правило кот→cat сработает только для "кот".',
                'help.algo.multi_replace.whole_words_title': 'Только целые слова (Whole Words):',
                'help.algo.multi_replace.whole_words_off': '• Выключено (по умолч.): Замена ищет подстроку в любом месте. Правило кот→cat превратит слово "котлета" в "catлета".',
                'help.algo.multi_replace.whole_words_on': '• Включено: Замена происходит, только если искомое слово совпадает с целым словом в тексте. Правило кот→cat не затронет слово "котлета".',
                'help.algo.multi_replace.feature1': '• Замены выполняются последовательно',
                'help.algo.multi_replace.feature2': '• Если правило пустое или некорректное, оно игнорируется',

                'help.algo.text_router.title': 'Маршрутизатор Текста',
                'help.algo.text_router.desc': 'Направляет текст по разным путям на основе условий',
                'help.algo.text_router.principle': 'Анализирует входной текст и направляет его в один из двух выходов в зависимости от заданного условия.',
                'help.algo.text_router.conditions_title': 'Доступные условия:',
                'help.algo.text_router.condition1': '• Содержит/не содержит цифры',
                'help.algo.text_router.condition2': '• Содержит/не содержит латиницу',
                'help.algo.text_router.condition3': '• Содержит/не содержит кириллицу',
                'help.algo.text_router.condition4': '• Содержит указанный текст',
                'help.algo.text_router.condition5': '• Соответствует регулярному выражению (Regex)',
                'help.algo.text_router.usage_tip': 'Полезно для создания условных цепочек шифрования',
                'help.algo.text_router.feature1': '• Один вход, два выхода',
                'help.algo.text_router.feature2': '• Данные идут только в один из выходов',
                'help.algo.text_router.feature3': '• Если условие не выполнено, данные идут во второй выход',

                'help.algo.stream_merger.title': 'Слияние Потоков',
                'help.algo.stream_merger.desc': 'Объединяет несколько входных потоков в один выход',
                'help.algo.stream_merger.principle': 'Принимает данные с нескольких входов и объединяет их в один поток согласно выбранному методу слияния.',
                'help.algo.stream_merger.methods_title': 'Методы слияния:',
                'help.algo.stream_merger.method1_title': '• Чередование символов: Два потока текста смешиваются посимвольно.',
                'help.algo.stream_merger.method1_example': 'Пример: Вход А: "АВC", Вход Б: "123" → Выход: "А1В2С3"',
                'help.algo.stream_merger.method2_title': '• Чередование слов: Два потока смешиваются по словам.',
                'help.algo.stream_merger.method2_example': 'Пример: Вход А: "раз два", Вход Б: "три четыре" → Выход: "раз три два четыре"',
                'help.algo.stream_merger.method3_title': '• Чередование строк: Строки из двух потоков добавляются в результат поочередно.',
                'help.algo.stream_merger.method3_example': 'Пример: Вход А: "стр1\\nстр2", Вход Б: "стр3\\nстр4" → Выход: "стр1\\nстр3\\nстр2\\nстр4"',
                'help.algo.stream_merger.feature1': '• Несколько входов, один выход',
                'help.algo.stream_merger.feature2': '• Если входы пустые, они игнорируются',
                'help.algo.stream_merger.feature3': '• Порядок входов влияет на результат',

                'help.algo.stream_splitter.title': 'Разрез Потоков',
                'help.algo.stream_splitter.desc': 'Разделяет один входной поток на два выхода',
                'help.algo.stream_splitter.principle': 'Принимает данные с одного входа и разделяет их на два потока согласно выбранному методу разделения. Работает обратно нода "Слияние Потоков".',
                'help.algo.stream_splitter.methods_title': 'Методы разделения:',
                'help.algo.stream_splitter.method1_title': '• Разделение по символам: Входной поток разделяется посимвольно.',
                'help.algo.stream_splitter.method1_example': 'Пример: Вход: "А1В2С3" → Поток А: "АВС", Поток Б: "123"',
                'help.algo.stream_splitter.method2_title': '• Разделение по словам: Входной поток разделяется по словам.',
                'help.algo.stream_splitter.method2_example': 'Пример: Вход: "раз три два четыре" → Поток А: "раз два", Поток Б: "три четыре"',
                'help.algo.stream_splitter.method3_title': '• Разделение по строкам: Строки разделяются поочередно.',
                'help.algo.stream_splitter.method3_example': 'Пример: Вход: "стр1\\nстр3\\nстр2\\nстр4" → Поток А: "стр1\\nстр2", Поток Б: "стр3\\nстр4"',
                'help.algo.stream_splitter.feature1': '• Один вход, два выхода',
                'help.algo.stream_splitter.feature2': '• Четные элементы идут в поток А, нечетные в поток Б',
                'help.algo.stream_splitter.feature3': '• При обратном процессе (дешифровке) работает как слияние',

                'help.algo.atbash.title': 'Шифр Атбаш',
                'help.algo.atbash.desc': 'Замена каждой буквы на симметричную в алфавите',
                'help.algo.atbash.principle': 'Каждая буква заменяется на букву, стоящую на симметричной позиции с конца алфавита (А↔Я, Б↔Ю, В↔Э, и т.д.).',
                'help.algo.atbash.example_title': 'Пример:',
                'help.algo.atbash.example_input': 'Вход: "ПРИВЕТ"',
                'help.algo.atbash.example_output': 'Выход: "ТКЛЕЗХ" (П→Т, Р→К, И→Л, В→Е, Е→З, Т→Х)',
                'help.algo.atbash.feature1': '• Симметричное шифрование (шифрование = дешифрование)',
                'help.algo.atbash.feature2': '• Поддерживает русский и английский алфавиты',
                'help.algo.atbash.feature3': '• Цифры и символы остаются без изменений',

                'help.algo.base64.title': 'Base64 Кодировщик',
                'help.algo.base64.desc': 'Кодирование/декодирование в формат Base64',
                'help.algo.base64.principle': 'Преобразует текст в Base64 - стандартный способ кодирования двоичных данных в текстовом формате.',
                'help.algo.base64.example_title': 'Пример:',
                'help.algo.base64.example_input': 'Вход: "Привет"',
                'help.algo.base64.example_output': 'Выход: "0J/RgNC40LLQtdGC" (Base64)',
                'help.algo.base64.feature1': '• Полностью обратимое кодирование',
                'help.algo.base64.feature2': '• Увеличивает размер текста примерно на 33%',
                'help.algo.base64.feature3': '• Использует символы A-Z, a-z, 0-9, +, /',

                'help.algo.shark.title': 'Акулий Шифр',
                'help.algo.shark.desc': 'Превращает текст в акульи звуки "a" разной длины',
                'help.algo.shark.principle': 'Превращает текст в "акульи" звуки, используя сложную трехуровневую систему. Буквы кодируются комбинацией ключевого слова (а, шорк, гура) и повторяющихся юнитов (а). Пробелы превращаются в bloop.',
                'help.algo.shark.lang_support_title': 'Поддержка языков:',
                'help.algo.shark.lang_support_desc': 'Шифр работает как с русским, так и с английским алфавитом, автоматически определяя язык для каждой буквы.',
                'help.algo.shark.lang_ru': 'Русский язык: Ключевые слова а, шорк, гура.',
                'help.algo.shark.lang_en': 'Английский язык: Ключевые слова a, shork, gura.',
                'help.algo.shark.example_ru_title': 'Пример (русский):',
                'help.algo.shark.example_ru_1': 'Вход: а (индекс 0) → а',
                'help.algo.shark.example_ru_2': 'Вход: м (индекс 12, начало второго уровня) → шорк',
                'help.algo.shark.example_ru_3': 'Вход: н (индекс 13) → шорк а',
                'help.algo.shark.example_ru_result': 'Результат: "привет мир" → "шорк а а а а · шорк а а · а · шорк а а а а а а а · шорк а а а а а а bloop шорк · шорк а а · шорк а а а"',
                'help.algo.shark.example_en_title': 'Пример (английский):',
                'help.algo.shark.example_en_input': 'Вход: cat',
                'help.algo.shark.example_en_result': 'c (индекс 2): a a a\na (индекс 0): a\nt (индекс 19, второй уровень): shork a a a a a a a\nВыход: "a a a a shork a a a a a a a"',
                'help.algo.shark.feature1': '• Результат может быть очень длинным',
                'help.algo.shark.feature2': '• Пробелы разделяют закодированные буквы',
                'help.algo.shark.feature3': '• Поддерживает только буквы (цифры и символы игнорируются)',

                'help.algo.uwu.title': 'UwU-фикатор (Шифр Няшек)',
                'help.algo.uwu.desc': 'Превращает обычный текст в милый "uwu-speak"',
                'help.algo.uwu.principle': 'Применяет правила "uwu-speak": заменяет некоторые согласные, добавляет "заикание" и милые смайлики.',
                'help.algo.uwu.rules_title': 'Правила преобразования:',
                'help.algo.uwu.rule1': '• Русские "р" и "л" заменяются на "в".',
                'help.algo.uwu.rule2': '• В начале слов с некоторой вероятностью добавляется заикание: Привет → П-привет.',
                'help.algo.uwu.rule3': '• В конце слов случайным образом могут добавляться смайлики: UwU, OwO, :3 и т.д.',
                'help.algo.uwu.example_title': 'Пример:',
                'help.algo.uwu.example_input': 'Вход: Привет мир',
                'help.algo.uwu.example_output': 'Выход (может отличаться из-за случайности): П-привет мив >w<',
                'help.algo.uwu.data_loss_title': 'Потеря данных',
                'help.algo.uwu.data_loss_desc': 'Замены "р/л→в" необратимы. При дешифровке невозможно восстановить исходные символы "р" и "л".',

                'help.algo.navi_terminal.title': 'NAVI Terminal',
                'help.algo.navi_terminal.desc': 'Имитирует вывод данных со старого терминала NAVI из аниме "Эксперименты Лэйн"',
                'help.algo.navi_terminal.principle': 'Преобразует текст в псевдо-системный лог, кодируя каждый символ в его шестнадцатеричное представление и добавляя системный "шум" (метки времени, ID процессов).',
                'help.algo.navi_terminal.example_title': 'Пример шифровки (стандартный режим):',
                'help.algo.navi_terminal.example_input': 'Вход: "LAIN"',
                'help.algo.navi_terminal.example_output': '[1663459200.1] [PID:4815] MEM_WRITE: 0x4C <OK>\n[1663459200.2] [PID:4815] MEM_WRITE: 0x41 <OK>\n[1663459200.3] [PID:4815] MEM_WRITE: 0x49 <OK>\n[1663459200.4] [PID:4815] MEM_WRITE: 0x4E <OK>',
                'help.algo.navi_terminal.feature1': '• Три уровня детализации: от чистого кода до лога с системными сообщениями.',
                'help.algo.navi_terminal.feature2': '• Дешифратор игнорирует весь системный "шум", извлекая только полезные данные.',
                'help.algo.navi_terminal.feature3': '• Использует детерминированный рандом для стабильного результата.',
                
                'help.algo.knights_cipher.title': 'Шифр Рыцарей',
                'help.algo.knights_cipher.desc': 'Прячет секретное сообщение внутри обычного текста с помощью невидимых символов (стеганография)',
                'help.algo.knights_cipher.principle': 'Секретное сообщение преобразуется в бинарный код, где 0 и 1 заменяются на разные невидимые Unicode-символы. Эта последовательность затем равномерно "вплетается" между символами обычного текста-контейнера.',
                'help.algo.knights_cipher.example_title': 'Пример шифровки:',
                'help.algo.knights_cipher.example_input_container': 'Вход "Контейнер": Просто текст',
                'help.algo.knights_cipher.example_input_secret': 'Вход "Секрет": lain',
                'help.algo.knights_cipher.example_output': 'Выход: (визуально неотличим от "Просто текст", но содержит скрытые данные)',
                'help.algo.knights_cipher.feature1': '• Имеет два входа: "Контейнер" и "Секрет".',
                'help.algo.knights_cipher.feature2': '• Зашифрованный текст можно безопасно копировать и вставлять.',
                'help.algo.knights_cipher.feature3': '• Дешифратор полностью игнорирует видимый текст, восстанавливая только скрытое сообщение.',
                
                'help.algo.monitor.title': 'Монитор',
                'help.algo.monitor.desc': 'Промежуточный просмотр данных в цепочке',
                'help.algo.monitor.principle': 'Отображает проходящие через него данные без изменения, позволяя отслеживать промежуточные результаты.',
                'help.algo.monitor.usage_title': 'Использование:',
                'help.algo.monitor.usage_desc': 'Установите между алгоритмами для отладки',
                'help.algo.monitor.result': 'Данные проходят без изменений',

                'help.algo.comment.title': 'Комментарий',
                'help.algo.comment.desc': 'Добавляйте заметки и пояснения прямо в схему',
                'help.algo.comment.principle': 'Этот нод не имеет входов и выходов и не участвует в цепочке шифрования. Он предназначен исключительно для документирования вашей схемы, чтобы вы или другие пользователи могли легко понять логику ее работы.',
                'help.algo.comment.usage_title': 'Использование:',
                'help.algo.comment.usage_step1': '1. Перетащите нод на рабочую область',
                'help.algo.comment.usage_step2': '2. Напишите любой поясняющий текст в текстовом поле',
                'help.algo.comment.usage_step3': '3. Измените размер нода, потянув за правый нижний угол текстового поля',
                'help.algo.comment.feature1': '• Не имеет входов и выходов, не соединяется с другими нодами',
                'help.algo.comment.feature2': '• Не влияет на результат шифрования',
                'help.algo.comment.feature3': '• Сохраняется и загружается вместе со всей схемой',

                // Потеря данных
                'help.dataloss.title': 'Потеря информации при шифровании',
                'help.dataloss.intro': '<strong>Важно!</strong> Некоторые алгоритмы шифрования необратимо теряют часть информации. Это нужно учитывать при создании сложных цепочек шифрования.',
                'help.dataloss.general_loss_title': 'Общая потеря: Регистр букв',
                'help.dataloss.general_loss_desc': 'Большинство алгоритмов не различают заглавные и строчные буквы. "Привет" и "ПРИВЕТ" будут зашифрованы одинаково.',
                'help.dataloss.by_algo_subtitle': 'Потери по алгоритмам',
                'help.dataloss.morse.issue': 'Потеря различий между Е и Ё',
                'help.dataloss.morse.desc': 'По умолчанию Ё кодируется как Е. При дешифровке невозможно определить, какая буква была изначально.',
                'help.dataloss.morse.solution': '<strong>Решение:</strong> Включите переключатель "Поддержка Ё" для отдельного кода.',
                'help.dataloss.morse.example_title': 'Проблемный пример:',
                'help.dataloss.morse.example_input': 'Вход: "ЕЛЬ" и "ЁЛЬ"',
                'help.dataloss.morse.example_output': 'Выход: "· ·−·· ·−··−" (одинаковый результат)',
                'help.dataloss.a1z26.issue': 'Потеря чисел и проблемы с многоязычностью',
                'help.dataloss.a1z26.desc1': '1. Числа меньше длины алфавита (1-33) невозможно отличить от букв при дешифровке.',
                'help.dataloss.a1z26.desc2': '2. При смешивании русского и английского текста дешифровка может стать невозможной.',
                'help.dataloss.a1z26.example_title': 'Проблемные примеры:',
                'help.dataloss.a1z26.example1': 'Вход: "А1Б" → "1-1-2" (неоднозначность с числом 1)',
                'help.dataloss.a1z26.example2': 'Вход: "CAT КОТ" → смешанный результат, сложный для разделения',
                'help.dataloss.numbers.issue': 'Потеря чисел-слов',
                'help.dataloss.numbers.desc': 'Числа от 0 до 9 заменяются словами. Если в тексте уже есть эти слова, при дешифровке невозможно определить, что было изначально - число или слово.',
                'help.dataloss.numbers.example_title': 'Проблемный пример:',
                'help.dataloss.numbers.example_input': 'Вход: "У меня 5 или пять яблок"',
                'help.dataloss.numbers.example_output': 'Выход: "У меня пять или пять яблок"',
                'help.dataloss.numbers.example_conclusion': 'При дешифровке неясно, где было число, а где слово',
                'help.dataloss.math.issue': 'Потеря точности при делении',
                'help.dataloss.math.desc': 'При делении чисел возможна потеря точности из-за дробных результатов, которые округляются.',
                'help.dataloss.math.example_title': 'Проблемный пример:',
                'help.dataloss.math.example_op': 'Операция: деление на 3',
                'help.dataloss.math.example_result': 'Вход: "10" → "3.333..." → "3" (потеря точности)',
                'help.dataloss.uwu.issue': 'Необратимые замены символов',
                'help.dataloss.uwu.desc': 'Замены "р/л→в" необратимы. При дешифровке невозможно различить исходные символы "р" и "л".',
                'help.dataloss.uwu.example_title': 'Проблемные примеры:',
                'help.dataloss.uwu.example_input': 'Вход: "лось" и "рось" → оба становятся "вось"',
                'help.dataloss.uwu.example_output': 'При дешифровке невозможно определить, какая буква была изначально',
                'help.dataloss.shark.issue': 'Потеря различий между буквами одинаковой длины',
                'help.dataloss.shark.desc': 'Цифры, символы пунктуации и специальные символы полностью игнорируются и теряются.',
                'help.dataloss.shark.example_title': 'Проблемный пример:',
                'help.dataloss.shark.example_input': 'Вход: "КОТ-123!" → теряются "-", "1", "2", "3", "!"',
                'help.dataloss.shark.example_output': 'Выход: только "КОТ" в виде "a" последовательностей',
                'help.dataloss.merger.issue': 'Потеря исходной структуры при неравных потоках',
                'help.dataloss.merger.desc': 'При дешифровке объединенный поток делится строго поочередно. Если исходные потоки имели разную длину (количество символов, слов или строк), восстановить их в первоначальном виде невозможно.',
                'help.dataloss.merger.example_title': 'Проблемный пример (чередование символов):',
                'help.dataloss.merger.example_input_a': 'Вход А: "АБ"',
                'help.dataloss.merger.example_input_b': 'Вход Б: "123"',
                'help.dataloss.merger.example_output': 'Результат шифрования: "А1Б23"',
                'help.dataloss.replace.issue': 'Последовательные замены могут создавать неоднозначность',
                'help.dataloss.replace.desc': 'Если правила замены пересекаются или применяются в неправильном порядке, может произойти потеря данных.',
                'help.dataloss.replace.example_title': 'Проблемный пример:',
                'help.dataloss.replace.example_rules': 'Правила: "а→@" и "ар→#"',
                'help.dataloss.replace.example_input': 'Слово "кар": если сначала а→@, то "к@р", потом нет "ар" для замены',
                'help.dataloss.replace.example_conclusion': 'Порядок правил критически важен!',
                
                // Примеры
                'help.examples.title': 'Готовые примеры схем',
                'help.examples.subtitle': 'Загрузите готовые схемы для изучения',
                'help.examples.load': 'Загрузить пример',
                'help.examples.loaded': 'Пример загружен!',
                'help.examples.usage_title': 'Примеры использования',
                'help.examples.simple_schemes': 'Простые схемы',
                'help.examples.basic_encryption.title': 'Базовое шифрование',
                'help.examples.basic_encryption.desc': 'Ввод → Шифр Цезаря → Вывод',
                'help.examples.basic_encryption.principle': 'Самая простая схема для начинающих. Один алгоритм шифрования.',
                'help.examples.basic_encryption.scheme_title': 'Схема:',
                'help.examples.basic_encryption.scheme_desc': '[Ввод текста] → [Шифр Цезаря, сдвиг +3] → [Вывод текста]',
                'help.examples.basic_encryption.scheme_result': 'Результат: "ПРИВЕТ" → "ТУЛЖЗЧ"',
                'help.examples.load_button': 'Загрузить пример',
                'help.examples.complex_schemes': 'Сложные схемы',
                'help.examples.multilevel.title': 'Многоуровневое шифрование',
                'help.examples.multilevel.desc': 'Цепочка из нескольких алгоритмов',
                'help.examples.multilevel.scheme_title': 'Схема:',
                'help.examples.multilevel.scheme_desc': '[Ввод] → [Регистр: верхний] → [A1Z26] → [Морзе] → [Кошачий морзе] → [Вывод]',
                'help.examples.multilevel.scheme_result': 'Результат: многослойная защита с преобразованием в кошачьи звуки',
                'help.examples.vigenere.title': 'Шифрование с ключом (Виженер)',
                'help.examples.vigenere.desc': 'Использование секретного слова',
                'help.examples.vigenere.scheme_title': 'Схема:',
                'help.examples.vigenere.scheme_desc': '[Ввод текста] → [Текст] ↘<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Шифр Виженера] → [Вывод]<br>[Секретное слово] → [Ключ] ↗',
                'help.examples.vigenere.scheme_result': 'Результат: полиалфавитное шифрование с вашим секретным словом',
                'help.examples.creative_uses': 'Творческие применения',
                'help.examples.geo.title': 'Географическое шифрование',
                'help.examples.geo.desc': 'Превращение текста в координаты',
                'help.examples.geo.scheme_title': 'Схема:',
                'help.examples.geo.scheme_desc': '[Ввод] → [Зачаровыватель планет] → [Вывод]',
                'help.examples.geo.scheme_result': 'Результат: секретное сообщение в виде GPS-координат городов',
                'help.examples.geo.tip': '💡 Можно использовать для создания квестов или головоломок!',
                'help.examples.fun.title': 'Забавное шифрование',
                'help.examples.fun.desc': 'Для развлечения и обучения детей',
                'help.examples.fun.scheme_title': 'Схема:',
                'help.examples.fun.scheme_desc': '[Ввод] → [Морзе (Кошачий)] → [Вывод]',
                'help.examples.fun.scheme_result': 'Результат: "КОТ" → "мрряyмяy мрряyмрряyмрряy мрряy"',
                'help.examples.fun.tip': '🐱 Отлично подходит для обучения основам криптографии в игровой форме!',
                'help.examples.debug.title': 'Отладка с мониторами',
                'help.examples.debug.desc': 'Отслеживание промежуточных результатов',
                'help.examples.debug.scheme_title': 'Схема:',
                'help.examples.debug.scheme_desc': '[Ввод] → [Числа в слова] → [Монитор] + [Цезарь] → [Монитор] + [Реверс] → [Вывод]',
                'help.examples.debug.scheme_result': 'Результат: возможность видеть результат на каждом этапе обработки',
                'help.examples.debug.tip': '🔍 Полезно для понимания того, как работают сложные цепочки алгоритмов!',
                
                // Имена примеров
                'help.example.simple_caesar': 'Простой шифр Цезаря',
                'help.example.vigenere_secret': 'Шифр Виженера с секретным словом',
                'help.example.multilevel': 'Многоуровневое шифрование',
                'help.example.planet': 'Географическое шифрование',
                'help.example.cat_morse': 'Забавный кошачий морзе',
                'help.example.monitoring': 'Отладка с мониторами',

                // Горячие клавиши
                'help.hotkeys.title': 'Горячие клавиши',
                'help.hotkeys.intro': 'Быстрое управление приложением с помощью клавиатуры. Поддерживается русская раскладка!',
                'help.hotkeys.file_management': 'Управление файлами',
                'help.hotkeys.save_desc': 'Сохранить схему',
                'help.hotkeys.load_desc': 'Загрузить схему',
                'help.hotkeys.new_desc': 'Новая схема',
                'help.hotkeys.node_management': 'Управление нодами',
                'help.hotkeys.copy_desc': 'Копировать выделенные ноды',
                'help.hotkeys.paste_desc': 'Вставить ноды',
                'help.hotkeys.select_all_desc': 'Выделить все ноды',
                'help.hotkeys.delete_desc': 'Удалить выделенные ноды',
                'help.hotkeys.history': 'История изменений',
                'help.hotkeys.undo_desc': 'Отменить действие',
                'help.hotkeys.redo_desc': 'Повторить действие',
                'help.hotkeys.canvas_management': 'Управление канвасом',
                'help.hotkeys.zoom_in_desc': 'Увеличить масштаб',
                'help.hotkeys.zoom_out_desc': 'Уменьшить масштаб',
                'help.hotkeys.zoom_reset_desc': 'Сбросить масштаб',
                'help.hotkeys.cut_mode_desc': 'Режим резки соединений',
                'help.hotkeys.general_commands': 'Общие команды',
                'help.hotkeys.help_desc': 'Показать эту справку',
                'help.hotkeys.escape_desc': 'Отменить / Снять выделение',
                'help.hotkeys.additional': 'Дополнительные возможности',
                'help.hotkeys.break_connection_title': 'Shift + ПКМ',
                'help.hotkeys.break_connection': 'Быстрый разрыв соединения на точке',
                'help.hotkeys.zoom_wheel_title': 'Колесо мыши',
                'help.hotkeys.zoom_wheel': 'Масштабирование канваса',
                'help.hotkeys.pan_title': 'Средняя кнопка / ПКМ',
                'help.hotkeys.pan': 'Панорамирование канваса',
                
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
                'param.detail_level': 'Уровень детализации',
                
                // Значения полей выбора
                'option.encode': 'Кодировать',
                'option.decode': 'Декодировать',
                'option.encrypt': 'Шифровать',
                'option.decrypt': 'Дешифровать',
                'option.detail_brief': 'Краткий',
                'option.detail_standard': 'Стандартный',
                'option.detail_full': 'Полный (DEBUG)',
                'option.container_text': 'Контейнер',
                'option.secret_text': 'Секрет',
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
                'option.en_alphabet_26': 'Английский (26 букв)',
                
                // Пасхалки (Easter Eggs)
                'easter_eggs.cute_mode.title': 'Няшный режим активирован! 🌸',
                'easter_eggs.wired_presence.title': '🔺 ПРИСУТСТВИЕ В СЕТИ АКТИВИРОВАНО 🔺',
                'easter_eggs.wired_presence.subtitle': 'Present Day, Present Time... Lain подключается к реальности',
                'easter_eggs.cute_mode.subtitle': 'UwU! Добро пожаловать в мир няшек! ✨',
                'easter_eggs.cute_mode.video_title': 'Няшные мелодии',
                'easter_eggs.cute_mode.minimize': 'Свернуть',
                'easter_eggs.cute_mode.close': 'Закрыть',
                'easter_eggs.cute_mode.notification.description': 'Обнаружено 3+ нодов UwU-шифра в активной цепочке!'
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
                'nodes.system_ciphers': 'System Ciphers',
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
                'node.navi_terminal': 'NAVI Terminal',
                'node.knights_cipher': 'Knights Cipher',
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
                'dialog.save_scheme_title': 'Save Scheme',
                'dialog.scheme_name_label': 'Scheme Name:',
                'dialog.scheme_name_placeholder': 'Enter scheme name...',
                'dialog.default_scheme_name': 'My Encryption Scheme',
                'dialog.scheme_desc_label': 'Description (optional):',
                'dialog.scheme_desc_placeholder': 'A brief description of what this scheme does...',
                'dialog.overwrite_confirm': 'This will replace the current scheme. Continue?',
                'dialog.clear_all_confirm': 'This will delete all nodes and connections. Continue?',
                'dialog.autosave_found_confirm': 'An automatically saved scheme was found. Restore it?',
                'dialog.reset_achievements_confirm': 'Are you sure you want to reset all achievements? This action is irreversible.',
                'dialog.unsaved_changes': 'You have an unsaved scheme. Are you sure you want to leave the page?',

                
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
                'settings.theme_locked': ' Easter egg is active ௹ꙮ', 
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
                'settings.section_achievements': 'Achievements',
                'settings.reset_achievements': 'Reset Achievements',
                'settings.reset_achievements_desc': 'Erase all unlocked easter eggs and achievements. This action is irreversible.',
                'button.show': 'Show',
                'button.reset': 'Reset',
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
                'notification.scheme_saved_as': 'Scheme "{{name}}" saved successfully!',
                'notification.scheme_loaded_as': 'Scheme "{{name}}" loaded successfully!',
                'notification.desc_prefix': 'Description:',
                'notification.scheme_cleared': 'Scheme cleared',
                'notification.scheme_restored': 'Scheme restored from autosave',
                'notification.example_loaded': 'Example "{{name}}" loaded!',
                'notification.achievements_reset': 'All achievements have been reset!',
                
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
                'error.knights_cipher_needs_inputs': 'Knights Cipher requires two inputs: container and secret',
                'error.division_by_zero': 'Error: Division by zero',
                'error.invalid_binary_input': 'Error: Invalid binary input',
                'error.binary_decode': 'Decoding error: {{message}}',
                'error.base64': 'Base64 Error: {{message}}',
                'error.node_systems_not_ready': 'Node or connection systems are not initialized',

                // Save Errors
                'error.save_failed': 'Save error: {{message}}',
                'error.load_failed': 'Load error: {{message}}',
                'error.clear_failed': 'Clear error: {{message}}',
                'error.example_load_failed': 'Example load error: {{message}}',
                'error.file_read_error': 'Error reading file',
                'error.json_only': 'Please select a JSON file',
                'error.dnd_json_only': 'Only JSON files are supported',

                // Miscellaneous
                'scheme.unknown_name': 'Unknown Scheme',

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
                'help.overview.animation_text': 'TEXT → CIPHER → RESULT',
                
                // Algorithms
                'help.algorithms.title': 'Encryption Algorithms',
                'help.algorithms.input_output': 'Input and Output Nodes',
                'help.algorithms.classic_ciphers': 'Classic Ciphers',
                'help.algorithms.transformations': 'Transformations',
                'help.algorithms.modern_ciphers': 'Modern Ciphers',
                'help.algorithms.compression': 'Data Compression',
                'help.algorithms.advanced_processing': 'Advanced Processing',
                'help.algorithms.logical_operations': 'Logical Operations',
                'help.algorithms.fun_ciphers': 'Fun Ciphers',
                'help.algorithms.utilities': 'Utilities',
                
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

                'help.algo.complex_substitution.title': 'Complex Substitution Cipher',
                'help.algo.complex_substitution.desc': 'Custom substitution alphabet based on a key with any characters',
                'help.algo.complex_substitution.principle': 'Creates a unique substitution alphabet using a key with any characters. The key is processed: duplicates are removed, it\'s split into alphabetic and non-alphabetic parts, and non-alphabetic characters are added to the beginning of the new alphabet.',
                'help.algo.complex_substitution.example_title': 'Example (key: "Cat!#", English alphabet):',
                'help.algo.complex_substitution.example_base': 'Base alphabet: abcdefghijklmnopqrstuvwxyz',
                'help.algo.complex_substitution.example_process': 'Key processing: Cat!# → alphabetic part: cat, non-alphabetic: !#',
                'help.algo.complex_substitution.example_new_alphabet': 'New alphabet: !#catbdefgh...z',
                'help.algo.complex_substitution.example_encrypt': 'Encrypting "bag": b→#, a→!, g→e → "#!e"',
                'help.algo.complex_substitution.feature1': '• Supports Russian and English alphabets',
                'help.algo.complex_substitution.feature2': '• Key can contain any characters',
                'help.algo.complex_substitution.feature3': '• Reversible: same operation for encryption and decryption',

                'help.algo.simple_substitution.title': 'Simple Substitution Cipher',
                'help.algo.simple_substitution.desc': 'Classic substitution cipher with a keyword',
                'help.algo.simple_substitution.principle': 'Creates a substitution alphabet where unique letters of the key come first, followed by the rest of the alphabet letters. Works with Russian and English alphabets simultaneously without mixing them.',
                'help.algo.simple_substitution.example_title': 'Example (key: "cipher"):',
                'help.algo.simple_substitution.example_base': 'English alphabet: abcdefghijklmnopqrstuvwxyz',
                'help.algo.simple_substitution.example_new_alphabet': 'New alphabet: cipherabdfgjklmnoqstuvwxyz',
                'help.algo.simple_substitution.example_encrypt': 'Encrypting "attack": a→c, t→t, c→p, k→j → "cttcpj"',
                'help.algo.simple_substitution.feature1': '• Simultaneous operation with two alphabets',
                'help.algo.simple_substitution.feature2': '• Russian letters are substituted using the Russian dictionary',
                'help.algo.simple_substitution.feature3': '• English letters are substituted using the English dictionary',

                'help.algo.route_transposition.title': 'Route Transposition Cipher',
                'help.algo.route_transposition.desc': 'Permutation of characters via matrix text recording',
                'help.algo.route_transposition.principle': 'The text is written into a matrix row by row, with the width equal to the key length. The order of reading the columns is determined by the alphabetical order of the key letters.',
                'help.algo.route_transposition.example_title': 'Example (key: "KEY"):',
                'help.algo.route_transposition.example_text': 'Text: HELLOWORLD',
                'help.algo.route_transposition.example_order': 'Column order: E(1), K(2), Y(3)',
                'help.algo.route_transposition.example_matrix': 'Matrix:\nK E Y\nH E L\nL O W\nO R L\nD',
                'help.algo.route_transposition.example_result': 'Reading by columns: E+O+R + H+L+O+D + L+W+L = "EORHLODLWL"',

                'help.algo.rle.title': 'RLE Compression',
                'help.algo.rle.desc': 'Run Length Encoding',
                'help.algo.rle.principle': 'A compression algorithm that replaces sequences of identical characters with the number of repetitions and the character itself.',
                'help.algo.rle.example_compress_title': 'Compression Example:',
                'help.algo.rle.example_compress_input': 'Text: AAAAAABBBCCGGGGG',
                'help.algo.rle.example_compress_output': 'Result: 6A3B2C5G',
                'help.algo.rle.example_decompress_title': 'Decompression Example:',
                'help.algo.rle.example_decompress_input': 'Text: 6A3B2C5G',
                'help.algo.rle.example_decompress_output': 'Result: AAAAAABBBCCGGGGG',
                'help.algo.rle.feature1': '• Not a cipher - a compression algorithm',
                'help.algo.rle.feature2': '• Effective for texts with repeating characters',
                'help.algo.rle.feature3': '• Fully reversible process',

                'help.algo.numbers_to_words.title': 'Numbers to Words',
                'help.algo.numbers_to_words.desc': 'Convert digits to their word representation',
                'help.algo.numbers_to_words.principle': 'Replaces each digit in the text with its word representation in the selected language.',
                'help.algo.numbers_to_words.example_ru_title': 'Example (Russian):',
                'help.algo.numbers_to_words.example_ru_input': 'Input: Мой код: 123',
                'help.algo.numbers_to_words.example_ru_output': 'Output: Мой код: одиндватри',
                'help.algo.numbers_to_words.example_en_title': 'Example (English):',
                'help.algo.numbers_to_words.example_en_input': 'Input: I have 7 cats',
                'help.algo.numbers_to_words.example_en_output': 'Output: I have seven cats',

                'help.algo.math.title': 'Math',
                'help.algo.math.desc': 'Arithmetic operations on numbers in text',
                'help.algo.math.principle': 'Finds numbers in the text and performs the selected mathematical operation on them.',
                'help.algo.math.example_title': 'Example (multiply by 2):',
                'help.algo.math.example_input': 'Input: I have 5 cats and 12 dogs',
                'help.algo.math.example_output': 'Output: I have 10 cats and 24 dogs',
                'help.algo.math.features_title': 'Available Operations',
                'help.algo.math.feature1': '• Add/subtract a constant',
                'help.algo.math.feature2': '• Multiply/divide by a constant',
                
                'help.algo.reverse.title': 'Reverse Text',
                'help.algo.reverse.desc': 'Reverse the entire text, individual words, or "Snake" mode',
                'help.algo.reverse.principle': 'Changes the order of characters in the text to the reverse direction.',
                'help.algo.reverse.mode_full_title': 'Mode "Full Text":',
                'help.algo.reverse.mode_full_input': 'Input: HELLO WORLD',
                'help.algo.reverse.mode_full_output': 'Output: DLROW OLLEH',
                'help.algo.reverse.mode_words_title': 'Mode "By Words":',
                'help.algo.reverse.mode_words_input': 'Input: HELLO WORLD',
                'help.algo.reverse.mode_words_output': 'Output: OLLEH DLROW',
                'help.algo.reverse.mode_snake_title': 'Mode "Snake (Boustrophedon)":',
                'help.algo.reverse.mode_snake_input': 'Input:\nFirst line\nSecond line\nThird line',
                'help.algo.reverse.mode_snake_output': 'Output:\nFirst line\nenil dnoceS\nThird line',
                'help.algo.reverse.snake_title': '"Snake" Mode',
                'help.algo.reverse.snake_feature1': '• Every even line (2nd, 4th, 6th...) is reversed',
                'help.algo.reverse.snake_feature2': '• Odd lines remain unchanged',
                'help.algo.reverse.snake_feature3': '• The operation is its own inverse',

                'help.algo.case.title': 'Case Transform',
                'help.algo.case.desc': 'Change the case of letters in the text',
                'help.algo.case.principle': 'Converts the case of letters according to the selected mode.',
                'help.algo.case.modes_title': 'Available modes:',
                'help.algo.case.mode_upper': 'Upper: hello → HELLO',
                'help.algo.case.mode_lower': 'Lower: HELLO → hello',
                'help.algo.case.mode_title': 'Title Case: hello world → Hello World',
                'help.algo.case.mode_toggle': 'Toggle Case: HeLlO → hElLo',

                'help.algo.binary.title': 'Binary Code',
                'help.algo.binary.desc': 'Representing text in the binary system',
                'help.algo.binary.principle': 'Each character is encoded into its ASCII/UTF-8 representation in the binary system.',
                'help.algo.binary.example_title': 'Example:',
                'help.algo.binary.example_input': 'Input: A',
                'help.algo.binary.example_output': 'Output: 01000001 (ASCII 65)',
                'help.algo.binary.feature1': '• Cyrillic requires UTF-8 (longer codes)',
                'help.algo.binary.feature2': '• The result can be very long',

                'help.algo.planet_enchanter.title': 'Planet Enchanter',
                'help.algo.planet_enchanter.desc': 'Unique cipher via coordinates of world cities',
                'help.algo.planet_enchanter.principle': 'Each letter is replaced by the coordinates of a random city whose name begins with that letter.',
                'help.algo.planet_enchanter.example_title': 'Example:',
                'help.algo.planet_enchanter.example_input': 'Input: MAP',
                'help.algo.planet_enchanter.example_output': 'Output: 55.7558, 37.6176 (Moscow)\n52.3676, 4.9041 (Amsterdam)\n48.8566, 2.3522 (Paris)',
                
                'help.algo.multi_replace.title': 'Multi-Replace',
                'help.algo.multi_replace.desc': 'Multiple replacement of characters or words by rules',
                'help.algo.multi_replace.principle': 'Performs replacements based on a list of "find→replace" rules. Each rule is written on a separate line.',
                'help.algo.multi_replace.example_rules_title': 'Example Rules:',
                'help.algo.multi_replace.example_rules': 'a→@\ne→3\no→0\ncat→dog',
                'help.algo.multi_replace.example_input': 'Input: "Hello cat"',
                'help.algo.multi_replace.example_output': 'Output: "H3ll0 dog"',
                'help.algo.multi_replace.settings_title': 'Settings',
                'help.algo.multi_replace.settings_intro': 'The node has two important options that control its behavior:',
                'help.algo.multi_replace.case_sensitive_title': 'Case Sensitive:',
                'help.algo.multi_replace.case_sensitive_off': '• Off (default): Replacement is case-insensitive. The rule cat→dog will work for "cat", "Cat", and "CAT".',
                'help.algo.multi_replace.case_sensitive_on': '• On: Replacement occurs only with an exact case match. The rule cat→dog will only work for "cat".',
                'help.algo.multi_replace.whole_words_title': 'Whole Words Only:',
                'help.algo.multi_replace.whole_words_off': '• Off (default): Replacement looks for the substring anywhere. The rule cat→dog will turn "caterpillar" into "dogerpillar".',
                'help.algo.multi_replace.whole_words_on': '• On: Replacement occurs only if the search term matches a whole word in the text. The rule cat→dog will not affect "caterpillar".',
                'help.algo.multi_replace.feature1': '• Replacements are performed sequentially',
                'help.algo.multi_replace.feature2': '• If a rule is empty or incorrect, it is ignored',

                'help.algo.text_router.title': 'Text Router',
                'help.algo.text_router.desc': 'Directs text along different paths based on conditions',
                'help.algo.text_router.principle': 'Analyzes the input text and directs it to one of two outputs depending on the specified condition.',
                'help.algo.text_router.conditions_title': 'Available conditions:',
                'help.algo.text_router.condition1': '• Contains/does not contain numbers',
                'help.algo.text_router.condition2': '• Contains/does not contain Latin letters',
                'help.algo.text_router.condition3': '• Contains/does not contain Cyrillic letters',
                'help.algo.text_router.condition4': '• Contains specified text',
                'help.algo.text_router.condition5': '• Matches a regular expression (Regex)',
                'help.algo.text_router.usage_tip': 'Useful for creating conditional encryption chains',
                'help.algo.text_router.feature1': '• One input, two outputs',
                'help.algo.text_router.feature2': '• Data goes to only one of the outputs',
                'help.algo.text_router.feature3': '• If the condition is not met, data goes to the second output',

                'help.algo.stream_merger.title': 'Stream Merger',
                'help.algo.stream_merger.desc': 'Combines multiple input streams into one output',
                'help.algo.stream_merger.principle': 'Receives data from multiple inputs and combines them into a single stream according to the selected merging method.',
                'help.algo.stream_merger.methods_title': 'Merging Methods:',
                'help.algo.stream_merger.method1_title': '• Alternating Chars: Two text streams are mixed character by character.',
                'help.algo.stream_merger.method1_example': 'Example: Input A: "ABC", Input B: "123" → Output: "A1B2C3"',
                'help.algo.stream_merger.method2_title': '• Alternating Words: Two streams are mixed word by word.',
                'help.algo.stream_merger.method2_example': 'Example: Input A: "one two", Input B: "three four" → Output: "one three two four"',
                'help.algo.stream_merger.method3_title': '• Alternating Lines: Lines from two streams are added to the result alternately.',
                'help.algo.stream_merger.method3_example': 'Example: Input A: "line1\\nline2", Input B: "line3\\nline4" → Output: "line1\\nline3\\nline2\\nline4"',
                'help.algo.stream_merger.feature1': '• Multiple inputs, one output',
                'help.algo.stream_merger.feature2': '• If inputs are empty, they are ignored',
                'help.algo.stream_merger.feature3': '• The order of inputs affects the result',

                'help.algo.stream_splitter.title': 'Stream Splitter',
                'help.algo.stream_splitter.desc': 'Splits one input stream into two outputs',
                'help.algo.stream_splitter.principle': 'Receives data from one input and splits it into two streams according to the selected splitting method. Works as the inverse of the "Stream Merger" node.',
                'help.algo.stream_splitter.methods_title': 'Splitting Methods:',
                'help.algo.stream_splitter.method1_title': '• Split by Chars: The input stream is split character by character.',
                'help.algo.stream_splitter.method1_example': 'Example: Input: "A1B2C3" → Stream A: "ABC", Stream B: "123"',
                'help.algo.stream_splitter.method2_title': '• Split by Words: The input stream is split word by word.',
                'help.algo.stream_splitter.method2_example': 'Example: Input: "one three two four" → Stream A: "one two", Stream B: "three four"',
                'help.algo.stream_splitter.method3_title': '• Split by Lines: Lines are split alternately.',
                'help.algo.stream_splitter.method3_example': 'Example: Input: "line1\\nline3\\nline2\\nline4" → Stream A: "line1\\nline2", Stream B: "line3\\nline4"',
                'help.algo.stream_splitter.feature1': '• One input, two outputs',
                'help.algo.stream_splitter.feature2': '• Even elements go to stream A, odd elements to stream B',
                'help.algo.stream_splitter.feature3': '• In the reverse process (decryption), it works like a merger',

                'help.algo.atbash.title': 'Atbash Cipher',
                'help.algo.atbash.desc': 'Replacing each letter with its symmetric counterpart in the alphabet',
                'help.algo.atbash.principle': 'Each letter is replaced by the letter at the symmetric position from the end of the alphabet (A↔Z, B↔Y, C↔X, etc.).',
                'help.algo.atbash.example_title': 'Example:',
                'help.algo.atbash.example_input': 'Input: "HELLO"',
                'help.algo.atbash.example_output': 'Output: "SVOOL" (H→S, E→V, L→O, L→O, O→L)',
                'help.algo.atbash.feature1': '• Symmetric encryption (encryption = decryption)',
                'help.algo.atbash.feature2': '• Supports Russian and English alphabets',
                'help.algo.atbash.feature3': '• Numbers and symbols remain unchanged',

                'help.algo.base64.title': 'Base64 Encoder',
                'help.algo.base64.desc': 'Encoding/decoding to Base64 format',
                'help.algo.base64.principle': 'Converts text to Base64 - a standard way of encoding binary data in text format.',
                'help.algo.base64.example_title': 'Example:',
                'help.algo.base64.example_input': 'Input: "Hello"',
                'help.algo.base64.example_output': 'Output: "SGVsbG8=" (Base64)',
                'help.algo.base64.feature1': '• Fully reversible encoding',
                'help.algo.base64.feature2': '• Increases text size by approximately 33%',
                'help.algo.base64.feature3': '• Uses characters A-Z, a-z, 0-9, +, /',

                'help.algo.shark.title': 'Shark Cipher',
                'help.algo.shark.desc': 'Turns text into shark sounds "a" of varying lengths',
                'help.algo.shark.principle': 'Transforms text into "shark" sounds using a complex three-tier system. Letters are encoded with a combination of a keyword (a, shork, gura) and repeating units (a). Spaces are turned into bloop.',
                'help.algo.shark.lang_support_title': 'Language Support:',
                'help.algo.shark.lang_support_desc': 'The cipher works with both Russian and English alphabets, automatically detecting the language for each letter.',
                'help.algo.shark.lang_ru': 'Russian language: Keywords а, шорк, гура.',
                'help.algo.shark.lang_en': 'English language: Keywords a, shork, gura.',
                'help.algo.shark.example_ru_title': 'Example (Russian):',
                'help.algo.shark.example_ru_1': 'Input: а (index 0) → а',
                'help.algo.shark.example_ru_2': 'Input: м (index 12, start of second tier) → шорк',
                'help.algo.shark.example_ru_3': 'Input: н (index 13) → шорк а',
                'help.algo.shark.example_ru_result': 'Result: "привет мир" → "шорк а а а а · шорк а а · а · шорк а а а а а а а · шорк а а а а а а bloop шорк · шорк а а · шорк а а а"',
                'help.algo.shark.example_en_title': 'Example (English):',
                'help.algo.shark.example_en_input': 'Input: cat',
                'help.algo.shark.example_en_result': 'c (index 2): a a a\na (index 0): a\nt (index 19, second tier): shork a a a a a a a\nOutput: "a a a a shork a a a a a a a"',
                'help.algo.shark.feature1': '• The result can be very long',
                'help.algo.shark.feature2': '• Spaces separate the encoded letters',
                'help.algo.shark.feature3': '• Supports only letters (numbers and symbols are ignored)',

                'help.algo.uwu.title': 'UwU-ifier (Cuteness Cipher)',
                'help.algo.uwu.desc': 'Turns normal text into cute "uwu-speak"',
                'help.algo.uwu.principle': 'Applies "uwu-speak" rules: replaces some consonants, adds "stuttering" and cute emoticons.',
                'help.algo.uwu.rules_title': 'Transformation Rules:',
                'help.algo.uwu.rule1': '• English "r" and "l" are replaced with "w".',
                'help.algo.uwu.rule2': '• Stuttering is added at the beginning of words with a certain probability: Hello → H-hello.',
                'help.algo.uwu.rule3': '• Cute emoticons like UwU, OwO, :3, etc., may be randomly added at the end of words.',
                'help.algo.uwu.example_title': 'Example:',
                'help.algo.uwu.example_input': 'Input: Hello world',
                'help.algo.uwu.example_output': 'Output (may vary due to randomness): H-hewwo wowld >w<',
                'help.algo.uwu.data_loss_title': 'Data Loss',
                'help.algo.uwu.data_loss_desc': 'The "r/l→w" replacements are irreversible. It is impossible to restore the original "r" and "l" characters during decryption.',

                'help.algo.navi_terminal.title': 'NAVI Terminal',
                'help.algo.navi_terminal.desc': 'Simulates data output from the old NAVI terminal from the anime "Serial Experiments Lain"',
                'help.algo.navi_terminal.principle': 'Transforms text into a pseudo-system log by encoding each character into its hexadecimal representation and adding system "noise" (timestamps, process IDs).',
                'help.algo.navi_terminal.example_title': 'Encryption Example (standard mode):',
                'help.algo.navi_terminal.example_input': 'Input: "LAIN"',
                'help.algo.navi_terminal.example_output': '[1663459200.1] [PID:4815] MEM_WRITE: 0x4C <OK>\n[1663459200.2] [PID:4815] MEM_WRITE: 0x41 <OK>\n[1663459200.3] [PID:4815] MEM_WRITE: 0x49 <OK>\n[1663459200.4] [PID:4815] MEM_WRITE: 0x4E <OK>',
                'help.algo.navi_terminal.feature1': '• Three detail levels: from clean code to a log with system messages.',
                'help.algo.navi_terminal.feature2': '• The decryptor ignores all system "noise", extracting only useful data.',
                'help.algo.navi_terminal.feature3': '• Uses deterministic random for a stable result.',

                'help.algo.knights_cipher.title': 'The Knights Cipher',
                'help.algo.knights_cipher.desc': 'Hides a secret message inside normal text using invisible characters (steganography)',
                'help.algo.knights_cipher.principle': 'The secret message is converted to binary code, where 0s and 1s are replaced by different invisible Unicode characters. This sequence is then evenly "woven" between the characters of a normal container text.',
                'help.algo.knights_cipher.example_title': 'Encryption Example:',
                'help.algo.knights_cipher.example_input_container': 'Input "Container": Just text',
                'help.algo.knights_cipher.example_input_secret': 'Input "Secret": lain',
                'help.algo.knights_cipher.example_output': 'Output: (visually indistinguishable from "Just text", but contains hidden data)',
                'help.algo.knights_cipher.feature1': '• Has two inputs: "Container" and "Secret".',
                'help.algo.knights_cipher.feature2': '• The encrypted text can be safely copied and pasted.',
                'help.algo.knights_cipher.feature3': '• The decryptor completely ignores the visible text, recovering only the hidden message.',

                'help.algo.monitor.title': 'Monitor',
                'help.algo.monitor.desc': 'Intermediate data preview in the chain',
                'help.algo.monitor.principle': 'Displays data passing through it without modification, allowing you to track intermediate results.',
                'help.algo.monitor.usage_title': 'Usage:',
                'help.algo.monitor.usage_desc': 'Place between algorithms for debugging',
                'help.algo.monitor.result': 'Data passes through unchanged',

                'help.algo.comment.title': 'Comment',
                'help.algo.comment.desc': 'Add notes and explanations directly in the scheme',
                'help.algo.comment.principle': 'This node has no inputs or outputs and does not participate in the encryption chain. It is intended solely for documenting your scheme so that you or other users can easily understand its logic.',
                'help.algo.comment.usage_title': 'Usage:',
                'help.algo.comment.usage_step1': '1. Drag the node onto the workspace',
                'help.algo.comment.usage_step2': '2. Write any explanatory text in the text field',
                'help.algo.comment.usage_step3': '3. Resize the node by dragging the bottom-right corner of the text field',
                'help.algo.comment.feature1': '• Has no inputs or outputs, does not connect to other nodes',
                'help.algo.comment.feature2': '• Does not affect the encryption result',
                'help.algo.comment.feature3': '• Is saved and loaded with the entire scheme',

                // Data Loss
                'help.dataloss.title': 'Information Loss During Encryption',
                'help.dataloss.intro': '<strong>Important!</strong> Some encryption algorithms irreversibly lose part of the information. This must be taken into account when creating complex encryption chains.',
                'help.dataloss.general_loss_title': 'General Loss: Letter Case',
                'help.dataloss.general_loss_desc': 'Most algorithms do not distinguish between uppercase and lowercase letters. "Hello" and "HELLO" will be encrypted identically.',
                'help.dataloss.by_algo_subtitle': 'Losses by Algorithm',
                'help.dataloss.morse.issue': 'Loss of distinction between E and Ё',
                'help.dataloss.morse.desc': 'By default, Ё is encoded as Е. During decryption, it is impossible to determine which letter was originally present.',
                'help.dataloss.morse.solution': '<strong>Solution:</strong> Enable the "Ё Support" toggle for a separate code.',
                'help.dataloss.morse.example_title': 'Problematic Example:',
                'help.dataloss.morse.example_input': 'Input: "ЕЛЬ" and "ЁЛЬ"',
                'help.dataloss.morse.example_output': 'Output: "· ·−·· ·−··−" (identical result)',
                'help.dataloss.a1z26.issue': 'Loss of numbers and multilingual issues',
                'help.dataloss.a1z26.desc1': '1. Numbers smaller than the alphabet length (1-26) cannot be distinguished from letters during decryption.',
                'help.dataloss.a1z26.desc2': '2. When mixing Russian and English text, decryption may become impossible.',
                'help.dataloss.a1z26.example_title': 'Problematic Examples:',
                'help.dataloss.a1z26.example1': 'Input: "A1B" → "1-1-2" (ambiguity with the number 1)',
                'help.dataloss.a1z26.example2': 'Input: "CAT КОТ" → mixed result, difficult to separate',
                'help.dataloss.numbers.issue': 'Loss of number-words',
                'help.dataloss.numbers.desc': 'Numbers from 0 to 9 are replaced by words. If the text already contains these words, it is impossible to determine whether the original was a number or a word during decryption.',
                'help.dataloss.numbers.example_title': 'Problematic Example:',
                'help.dataloss.numbers.example_input': 'Input: "I have 5 or five apples"',
                'help.dataloss.numbers.example_output': 'Output: "I have five or five apples"',
                'help.dataloss.numbers.example_conclusion': 'During decryption, it is unclear where the number was and where the word was',
                'help.dataloss.math.issue': 'Loss of precision during division',
                'help.dataloss.math.desc': 'When dividing numbers, precision may be lost due to fractional results that are rounded.',
                'help.dataloss.math.example_title': 'Problematic Example:',
                'help.dataloss.math.example_op': 'Operation: divide by 3',
                'help.dataloss.math.example_result': 'Input: "10" → "3.333..." → "3" (loss of precision)',
                'help.dataloss.uwu.issue': 'Irreversible character replacements',
                'help.dataloss.uwu.desc': 'The "r/l→w" replacements are irreversible. It is impossible to distinguish the original "r" and "l" characters during decryption.',
                'help.dataloss.uwu.example_title': 'Problematic Examples:',
                'help.dataloss.uwu.example_input': 'Input: "low" and "row" → both become "wow"',
                'help.dataloss.uwu.example_output': 'During decryption, it is impossible to determine which letter was originally present',
                'help.dataloss.shark.issue': 'Loss of distinction between letters of the same length',
                'help.dataloss.shark.desc': 'Numbers, punctuation marks, and special characters are completely ignored and lost.',
                'help.dataloss.shark.example_title': 'Problematic Example:',
                'help.dataloss.shark.example_input': 'Input: "CAT-123!" → "-", "1", "2", "3", "!" are lost',
                'help.dataloss.shark.example_output': 'Output: only "CAT" as "a" sequences',
                'help.dataloss.merger.issue': 'Loss of original structure with unequal streams',
                'help.dataloss.merger.desc': 'During decryption, the merged stream is divided strictly alternately. If the original streams had different lengths (number of characters, words, or lines), it is impossible to restore them to their original form.',
                'help.dataloss.merger.example_title': 'Problematic Example (alternating characters):',
                'help.dataloss.merger.example_input_a': 'Input A: "AB"',
                'help.dataloss.merger.example_input_b': 'Input B: "123"',
                'help.dataloss.merger.example_output': 'Encryption result: "A1B234"',
                'help.dataloss.replace.issue': 'Sequential replacements can create ambiguity',
                'help.dataloss.replace.desc': 'If replacement rules overlap or are applied in the wrong order, data loss can occur.',
                'help.dataloss.replace.example_title': 'Problematic Example:',
                'help.dataloss.replace.example_rules': 'Rules: "a→@" and "ar→#"',
                'help.dataloss.replace.example_input': 'Word "car": if a→@ first, then "c@r", then there is no "ar" to replace',
                'help.dataloss.replace.example_conclusion': 'The order of rules is critical!',
                
                // Examples
                'help.examples.title': 'Ready-made Scheme Examples',
                'help.examples.subtitle': 'Load ready schemes for learning',
                'help.examples.load': 'Load Example',
                'help.examples.loaded': 'Example loaded!',
                'help.examples.usage_title': 'Usage Examples',
                'help.examples.simple_schemes': 'Simple Schemes',
                'help.examples.basic_encryption.title': 'Basic Encryption',
                'help.examples.basic_encryption.desc': 'Input → Caesar Cipher → Output',
                'help.examples.basic_encryption.principle': 'The simplest scheme for beginners. One encryption algorithm.',
                'help.examples.basic_encryption.scheme_title': 'Scheme:',
                'help.examples.basic_encryption.scheme_desc': '[Text Input] → [Caesar Cipher, shift +3] → [Text Output]',
                'help.examples.basic_encryption.scheme_result': 'Result: "HELLO" → "KHOOR"',
                'help.examples.load_button': 'Load Example',
                'help.examples.complex_schemes': 'Complex Schemes',
                'help.examples.multilevel.title': 'Multi-level Encryption',
                'help.examples.multilevel.desc': 'A chain of several algorithms',
                'help.examples.multilevel.scheme_title': 'Scheme:',
                'help.examples.multilevel.scheme_desc': '[Input] → [Case: Upper] → [A1Z26] → [Morse] → [Cat Morse] → [Output]',
                'help.examples.multilevel.scheme_result': 'Result: multi-layered protection with conversion to cat sounds',
                'help.examples.vigenere.title': 'Encryption with a Key (Vigenère)',
                'help.examples.vigenere.desc': 'Using a secret word',
                'help.examples.vigenere.scheme_title': 'Scheme:',
                'help.examples.vigenere.scheme_desc': '[Text Input] → [Text] ↘<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Vigenère Cipher] → [Output]<br>[Secret Word] → [Key] ↗',
                'help.examples.vigenere.scheme_result': 'Result: polyalphabetic encryption with your secret word',
                'help.examples.creative_uses': 'Creative Applications',
                'help.examples.geo.title': 'Geographic Encryption',
                'help.examples.geo.desc': 'Turning text into coordinates',
                'help.examples.geo.scheme_title': 'Scheme:',
                'help.examples.geo.scheme_desc': '[Input] → [Planet Enchanter] → [Output]',
                'help.examples.geo.scheme_result': 'Result: a secret message in the form of GPS coordinates of cities',
                'help.examples.geo.tip': '💡 Can be used to create quests or puzzles!',
                'help.examples.fun.title': 'Fun Encryption',
                'help.examples.fun.desc': 'For entertainment and teaching children',
                'help.examples.fun.scheme_title': 'Scheme:',
                'help.examples.fun.scheme_desc': '[Input] → [Morse (Cat)] → [Output]',
                'help.examples.fun.scheme_result': 'Result: "CAT" → "purrmeowpurrmeow meowpurr purr"',
                'help.examples.fun.tip': '🐱 Great for teaching the basics of cryptography in a playful way!',
                'help.examples.debug.title': 'Debugging with Monitors',
                'help.examples.debug.desc': 'Tracking intermediate results',
                'help.examples.debug.scheme_title': 'Scheme:',
                'help.examples.debug.scheme_desc': '[Input] → [Numbers to Words] → [Monitor] + [Caesar] → [Monitor] + [Reverse] → [Output]',
                'help.examples.debug.scheme_result': 'Result: the ability to see the result at each processing stage',
                'help.examples.debug.tip': '🔍 Useful for understanding how complex algorithm chains work!',
                
                // Example names
                'help.example.simple_caesar': 'Simple Caesar Cipher',
                'help.example.vigenere_secret': 'Vigenère with Secret Word',
                'help.example.multilevel': 'Multi-level Encryption',
                'help.example.planet': 'Geographic Encryption',
                'help.example.cat_morse': 'Fun Cat Morse',
                'help.example.monitoring': 'Debug with Monitors',

                // Hotkeys
                'help.hotkeys.title': 'Hotkeys',
                'help.hotkeys.intro': 'Quick application control using the keyboard. Russian layout is also supported!',
                'help.hotkeys.file_management': 'File Management',
                'help.hotkeys.save_desc': 'Save scheme',
                'help.hotkeys.load_desc': 'Load scheme',
                'help.hotkeys.new_desc': 'New scheme',
                'help.hotkeys.node_management': 'Node Management',
                'help.hotkeys.copy_desc': 'Copy selected nodes',
                'help.hotkeys.paste_desc': 'Paste nodes',
                'help.hotkeys.select_all_desc': 'Select all nodes',
                'help.hotkeys.delete_desc': 'Delete selected nodes',
                'help.hotkeys.history': 'History',
                'help.hotkeys.undo_desc': 'Undo action',
                'help.hotkeys.redo_desc': 'Redo action',
                'help.hotkeys.canvas_management': 'Canvas Management',
                'help.hotkeys.zoom_in_desc': 'Zoom In',
                'help.hotkeys.zoom_out_desc': 'Zoom Out',
                'help.hotkeys.zoom_reset_desc': 'Reset Zoom',
                'help.hotkeys.cut_mode_desc': 'Connection Cut Mode',
                'help.hotkeys.general_commands': 'General Commands',
                'help.hotkeys.help_desc': 'Show this help',
                'help.hotkeys.escape_desc': 'Cancel / Deselect',
                'help.hotkeys.additional': 'Additional Features',
                'help.hotkeys.break_connection_title': 'Shift + RMB',
                'help.hotkeys.break_connection': 'Quickly break connection on a point',
                'help.hotkeys.zoom_wheel_title': 'Mouse Wheel',
                'help.hotkeys.zoom_wheel': 'Canvas zooming',
                'help.hotkeys.pan_title': 'Middle button / RMB',
                'help.hotkeys.pan': 'Canvas panning',
                
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
                'param.detail_level': 'Detail Level',
                
                // Option values
                'option.encode': 'Encode',
                'option.decode': 'Decode',
                'option.encrypt': 'Encrypt',
                'option.decrypt': 'Decrypt',
                'option.detail_brief': 'Brief',
                'option.detail_standard': 'Standard',
                'option.detail_full': 'Full (DEBUG)',
                'option.container_text': 'Container',
                'option.secret_text': 'Secret',
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
                
                // Easter Eggs
                'easter_eggs.cute_mode.title': 'Cute Mode Activated! 🌸',
                'easter_eggs.wired_presence.title': '🔺 WIRED PRESENCE ACTIVATED 🔺',
                'easter_eggs.wired_presence.subtitle': 'Present Day, Present Time... Lain is connecting to reality',
                'easter_eggs.cute_mode.subtitle': 'UwU! Welcome to the world of cuteness! ✨',
                'easter_eggs.cute_mode.video_title': 'Cute Melodies',
                'easter_eggs.cute_mode.minimize': 'Minimize',
                'easter_eggs.cute_mode.close': 'Close',
                'easter_eggs.cute_mode.notification.description': 'Detected 3+ UwU cipher nodes in active chain!'
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