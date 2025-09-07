// === Система управления файлами для сохранения и загрузки схем ===

class FileManager {
    constructor() {
        this.initializeHandlers();
    }
    
    initializeHandlers() {
        // Кнопка сохранения
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.addEventListener('click', () => {
            this.saveScheme();
        });
        
        // Кнопка загрузки
        const loadBtn = document.getElementById('loadBtn');
        loadBtn.addEventListener('click', () => {
            this.loadScheme();
        });
        
        // Кнопка очистки
        const clearBtn = document.getElementById('clearBtn');
        clearBtn.addEventListener('click', () => {
            this.clearScheme();
        });
        
        // Скрытый input для файлов
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => {
            this.handleFileLoad(e.target.files[0]);
        });
        
        // Обработка drag & drop для файлов
        this.initializeDragAndDrop();
        
        // Автоматическое сохранение в localStorage
        this.initializeAutoSave();
    }
    
    saveScheme() {
        const t = window.i18n.t.bind(window.i18n); 

        try {
            if (!window.cipherEngine) {
                throw new Error(t('error.node_systems_not_ready'));
            }
            
            // Показываем диалог для ввода имени схемы
            this.showSaveDialog();
            
        } catch (error) {
            console.error('Ошибка сохранения схемы:', error);
            this.showNotification(t('error.save_failed', { message: error.message }), 'error');
        }
    }
    
    showSaveDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'save-dialog-overlay';
        const t = window.i18n.t.bind(window.i18n); 
        dialog.innerHTML = `
            <div class="save-dialog">
                <div class="save-dialog-header">
                    <h3>💾 ${t('dialog.save_scheme_title')}</h3>
                    <button class="dialog-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="save-dialog-content">
                    <div class="form-group">
                        <label for="schemeName">${t('dialog.scheme_name_label')}</label>
                        <input type="text" id="schemeName" placeholder="${t('dialog.scheme_name_placeholder')}" value="${t('dialog.default_scheme_name')}">
                    </div>
                    <div class="form-group">
                        <label for="schemeDescription">${t('dialog.scheme_desc_label')}</label>
                        <textarea id="schemeDescription" placeholder="${t('dialog.scheme_desc_placeholder')}" rows="3"></textarea>
                    </div>
                </div>
                <div class="save-dialog-footer">
                    <button class="btn btn-outline" onclick="this.parentElement.parentElement.parentElement.remove()">
                        ${t('dialog.cancel')}
                    </button>
                    <button class="btn btn-primary" onclick="window.fileManager.performSave()">
                        <i class="fas fa-save"></i>
                        ${t('dialog.save')}
                    </button>
                </div>
            </div>
        `;
        
        dialog.style.cssText = `
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
        `;
        
        const dialogStyles = `
            .save-dialog {
                background: var(--bg-secondary);
                border-radius: var(--radius-lg);
                padding: 0;
                width: 500px;
                max-width: 90vw;
                box-shadow: var(--shadow-lg);
                border: 1px solid var(--border-color);
                overflow: hidden;
            }
            .save-dialog-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                background: var(--bg-primary);
                border-bottom: 1px solid var(--border-color);
            }
            .save-dialog-header h3 {
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
            .save-dialog-content {
                padding: 1.5rem;
            }
            .form-group {
                margin-bottom: 1.5rem;
            }
            .form-group:last-child {
                margin-bottom: 0;
            }
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                color: var(--text-primary);
                font-weight: 500;
            }
            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid var(--border-color);
                border-radius: var(--radius);
                background: var(--bg-primary);
                color: var(--text-primary);
                font-family: inherit;
                transition: var(--transition);
            }
            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: var(--accent-primary);
                box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
            }
            .save-dialog-footer {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                padding: 1.5rem;
                background: var(--bg-primary);
                border-top: 1px solid var(--border-color);
            }
        `;
        
        if (!document.querySelector('#save-dialog-styles')) {
            const style = document.createElement('style');
            style.id = 'save-dialog-styles';
            style.textContent = dialogStyles;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(dialog);
        
        // Автофокус на поле ввода имени
        setTimeout(() => {
            const nameInput = document.getElementById('schemeName');
            if (nameInput) {
                nameInput.select();
            }
        }, 100);
    }
    
    performSave() {
        const t = window.i18n.t.bind(window.i18n);

        const nameInput = document.getElementById('schemeName');
        const descriptionInput = document.getElementById('schemeDescription');
        
        const schemeName = nameInput?.value.trim() || t('dialog.default_scheme_name');
        const schemeDescription = descriptionInput?.value.trim() || '';
        
        try {
            const schemeData = JSON.parse(window.cipherEngine.exportScheme());
            
            // Добавляем метаданные
            schemeData.name = schemeName;
            schemeData.description = schemeDescription;
            schemeData.created = new Date().toISOString();
            
            const blob = new Blob([JSON.stringify(schemeData, null, 2)], { type: 'application/json' });
            
            // Создаем безопасное имя файла
            const safeFileName = schemeName
                .replace(/[^a-zа-я0-9\s-_]/gi, '')
                .replace(/\s+/g, '-')
                .toLowerCase();
            
            const now = new Date();
            const timestamp = now.toISOString().slice(0, 10); // YYYY-MM-DD
            const filename = `${safeFileName}-${timestamp}.json`;
            
            // Создаем ссылку для скачивания
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            // Закрываем диалог
            const dialog = document.querySelector('.save-dialog-overlay');
            if (dialog) {
                dialog.remove();
            }
            
            this.showNotification(t('notification.scheme_saved_as', { name: schemeName }), 'success');
            
        } catch (error) {
            console.error('Ошибка сохранения схемы:', error);
            this.showNotification(t('error.save_failed', { message: error.message }), 'error');
        }
    }
    
    loadScheme() {
        const fileInput = document.getElementById('fileInput');
        fileInput.click();
    }
    
    handleFileLoad(file) {
        if (!file) return;

        const t = window.i18n.t.bind(window.i18n);
        
        if (!file.name.endsWith('.json')) {
            this.showNotification(t('error.json_only'), 'error');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const schemeData = e.target.result;
                
                if (!window.cipherEngine) {
                    throw new Error('Движок шифрования не инициализирован');
                }
                
                // Подтверждение загрузки (если есть существующая схема)
                if (window.nodeManager && window.nodeManager.getAllNodes().length > 0) {
                    if (!confirm(t('dialog.overwrite_confirm'))) {
                        return;
                    }
                }
                
                const parsedScheme = JSON.parse(schemeData);
                const schemeName = parsedScheme.name || t('scheme.unknown_name');
                const schemeDescription = parsedScheme.description || '';
                
                window.cipherEngine.importScheme(schemeData);
                
                let message = t('notification.scheme_loaded_as', { name: schemeName });
                if (schemeDescription) {
                    message += `\n${t('notification.desc_prefix')} ${schemeDescription}`;
                }
                
                this.showNotification(message, 'success');
                
                // Сохраняем в localStorage для автовосстановления
                this.saveToLocalStorage(schemeData);
                
            } catch (error) {
                console.error('Ошибка загрузки схемы:', error);
                this.showNotification(t('error.load_failed', { message: error.message }), 'error');
            } finally {
                const fileInput = document.getElementById('fileInput');
                if (fileInput) {
                    fileInput.value = null;
                }
            }
        };
        
        reader.onerror = () => {
            this.showNotification(t('error.file_read_error'), 'error');
        };
        
        reader.readAsText(file);
    }
    
    clearScheme() {
        const t = window.i18n.t.bind(window.i18n); 

        if (window.nodeManager && window.nodeManager.getAllNodes().length > 0) {
            if (!confirm(t('dialog.clear_all_confirm'))) {
                return;
            }
        }
        
        try {
            if (window.nodeManager) {
                window.nodeManager.clearAllNodes();
            }
            
            // Очищаем поля ввода и вывода
            document.getElementById('inputText').value = '';
            document.getElementById('outputText').value = '';
            
            // Очищаем localStorage
            this.clearLocalStorage();
            
            this.showNotification(t('notification.scheme_cleared'), 'success');
            
        } catch (error) {
            console.error('Ошибка очистки схемы:', error);
            this.showNotification(t('error.clear_failed', { message: error.message }), 'error');
        }
    }
    
    initializeDragAndDrop() {
        const workspace = document.querySelector('.workspace');
        
        workspace.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            workspace.classList.add('drag-over');
        });
        
        workspace.addEventListener('dragleave', (e) => {
            if (!workspace.contains(e.relatedTarget)) {
                workspace.classList.remove('drag-over');
            }
        });
        
        workspace.addEventListener('drop', (e) => {
            e.preventDefault();
            workspace.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            const jsonFile = files.find(file => file.name.endsWith('.json'));
            
            if (jsonFile) {
                this.handleFileLoad(jsonFile);
            } else if (files.length > 0) {
                this.showNotification(window.i18n.t('error.dnd_json_only'), 'error');
            }
        });
    }
    
    initializeAutoSave() {
        // Автоматическое сохранение каждые 30 секунд
        setInterval(() => {
            this.autoSave();
        }, 30000);
        
        // Сохранение при закрытии страницы
        window.addEventListener('beforeunload', () => {
            this.autoSave();
        });
        
        // Попытка восстановления при загрузке
        this.tryRestoreFromLocalStorage();
    }
    
    autoSave() {
        try {
            if (window.nodeManager && window.nodeManager.getAllNodes().length > 0) {
                const schemeData = window.cipherEngine.exportScheme();
                this.saveToLocalStorage(schemeData);
            }
        } catch (error) {
            console.warn('Ошибка автосохранения:', error);
        }
    }
    
    saveToLocalStorage(schemeData) {
        try {
            localStorage.setItem('cipher-flow-autosave', schemeData);
            localStorage.setItem('cipher-flow-autosave-timestamp', Date.now().toString());
        } catch (error) {
            console.warn('Ошибка сохранения в localStorage:', error);
        }
    }
    
    tryRestoreFromLocalStorage() {
        try {
            const savedScheme = localStorage.getItem('cipher-flow-autosave');
            const timestamp = localStorage.getItem('cipher-flow-autosave-timestamp');
            
            if (savedScheme && timestamp) {
                const saveTime = parseInt(timestamp);
                const hourAgo = Date.now() - (60 * 60 * 1000); // 1 час назад
                
                // Предлагаем восстановить только если сохранение было недавно
                if (saveTime > hourAgo) {
                    setTimeout(() => {
                        if (confirm(window.i18n.t('dialog.autosave_found_confirm'))) {
                            window.cipherEngine.importScheme(savedScheme);
                            this.showNotification(window.i18n.t('notification.scheme_restored'), 'success');
                        }
                    }, 1000);
                }
            }
        } catch (error) {
            console.warn('Ошибка восстановления из localStorage:', error);
        }
    }
    
    clearLocalStorage() {
        try {
            localStorage.removeItem('cipher-flow-autosave');
            localStorage.removeItem('cipher-flow-autosave-timestamp');
        } catch (error) {
            console.warn('Ошибка очистки localStorage:', error);
        }
    }
    
    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Добавляем стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--accent-primary)'};
            color: white;
            padding: 12px 20px;
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInNotification 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // Добавляем CSS анимацию если её нет
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInNotification {
                    from { 
                        opacity: 0; 
                        transform: translateX(100%); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateX(0); 
                    }
                }
                @keyframes slideOutNotification {
                    from { 
                        opacity: 1; 
                        transform: translateX(0); 
                    }
                    to { 
                        opacity: 0; 
                        transform: translateX(100%); 
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Удаляем уведомление через 4 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOutNotification 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
        
        // Удаляем при клике
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOutNotification 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
    
    // Методы для работы с примерами схем
    loadExampleScheme(exampleName) {
        const t = window.i18n.t.bind(window.i18n); 
        
        const examples = this.getExampleSchemes();
        const example = examples[exampleName];
        
        if (example) {
            try {
                if (window.nodeManager && window.nodeManager.getAllNodes().length > 0) {
                    if (!confirm(t('dialog.overwrite_confirm'))) {
                        return;
                    }
                }
                
                window.cipherEngine.importScheme(JSON.stringify(example));
                this.showNotification(t('notification.example_loaded', { name: example.name }), 'success');
                
            } catch (error) {
                console.error('Ошибка загрузки примера:', error);
                this.showNotification(t('error.example_load_failed', { message: error.message }), 'error');
            }
        }
    }
    
    getExampleSchemes() {
        return {
            'simple-caesar': {
                name: 'Простой шифр Цезаря',
                version: '1.0',
                created: new Date().toISOString(),
                nodes: [
                    {
                        id: 'node_0',
                        type: 'input',
                        x: 100,
                        y: 100,
                        data: {
                            title: 'Ввод текста',
                            icon: 'fas fa-sign-in-alt',
                            fields: [{ name: 'text', type: 'textarea', label: 'Текст', value: 'Привет мир!', rows: 3 }],
                            hasInput: false,
                            hasOutput: true
                        }
                    },
                    {
                        id: 'node_1',
                        type: 'caesar',
                        x: 350,
                        y: 100,
                        data: {
                            title: 'Шифр Цезаря',
                            icon: 'fas fa-exchange-alt',
                            fields: [{ name: 'shift', type: 'number', label: 'Сдвиг', value: 3, min: 1, max: 25 }],
                            hasInput: true,
                            hasOutput: true
                        }
                    },
                    {
                        id: 'node_2',
                        type: 'output',
                        x: 600,
                        y: 100,
                        data: {
                            title: 'Вывод текста',
                            icon: 'fas fa-sign-out-alt',
                            fields: [],
                            hasInput: true,
                            hasOutput: false
                        }
                    }
                ],
                connections: [
                    { id: 'connection_0', from: 'node_0', to: 'node_1' },
                    { id: 'connection_1', from: 'node_1', to: 'node_2' }
                ]
            },
            'complex-chain': {
                name: 'Сложная цепочка преобразований',
                version: '1.0',
                created: new Date().toISOString(),
                nodes: [
                    {
                        id: 'node_0',
                        type: 'input',
                        x: 50,
                        y: 150,
                        data: {
                            title: 'Ввод текста',
                            icon: 'fas fa-sign-in-alt',
                            fields: [{ name: 'text', type: 'textarea', label: 'Текст', value: 'Секретное сообщение 123', rows: 3 }],
                            hasInput: false,
                            hasOutput: true
                        }
                    },
                    {
                        id: 'node_1',
                        type: 'numbers-to-words',
                        x: 300,
                        y: 50,
                        data: {
                            title: 'Числа в слова',
                            icon: 'fas fa-hashtag',
                            fields: [
                                { name: 'language', type: 'select', label: 'Язык', value: 'ru', options: [{ value: 'ru', label: 'Русский' }, { value: 'en', label: 'English' }] },
                                { name: 'mode', type: 'select', label: 'Направление', value: 'to_words', options: [{ value: 'to_words', label: 'В слова' }, { value: 'to_numbers', label: 'В числа' }] }
                            ],
                            hasInput: true,
                            hasOutput: true
                        }
                    },
                    {
                        id: 'node_2',
                        type: 'caesar',
                        x: 300,
                        y: 200,
                        data: {
                            title: 'Шифр Цезаря',
                            icon: 'fas fa-exchange-alt',
                            fields: [{ name: 'shift', type: 'number', label: 'Сдвиг', value: 5, min: 1, max: 25 }],
                            hasInput: true,
                            hasOutput: true
                        }
                    },
                    {
                        id: 'node_3',
                        type: 'morse',
                        x: 550,
                        y: 150,
                        data: {
                            title: 'Код Морзе',
                            icon: 'fas fa-broadcast-tower',
                            fields: [{ name: 'mode', type: 'select', label: 'Режим', value: 'encode', options: [{ value: 'encode', label: 'Кодировать' }, { value: 'decode', label: 'Декодировать' }] }],
                            hasInput: true,
                            hasOutput: true
                        }
                    },
                    {
                        id: 'node_4',
                        type: 'output',
                        x: 800,
                        y: 150,
                        data: {
                            title: 'Вывод текста',
                            icon: 'fas fa-sign-out-alt',
                            fields: [],
                            hasInput: true,
                            hasOutput: false
                        }
                    }
                ],
                connections: [
                    { id: 'connection_0', from: 'node_0', to: 'node_1' },
                    { id: 'connection_1', from: 'node_1', to: 'node_2' },
                    { id: 'connection_2', from: 'node_2', to: 'node_3' },
                    { id: 'connection_3', from: 'node_3', to: 'node_4' }
                ]
            }
        };
    }
}

// Инициализация после загрузки DOM
let fileManager;
document.addEventListener('DOMContentLoaded', () => {
    fileManager = new FileManager();
    window.fileManager = fileManager; // Делаем доступным глобально
});