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
        try {
            if (!window.cipherEngine) {
                throw new Error('Движок шифрования не инициализирован');
            }
            
            const schemeData = window.cipherEngine.exportScheme();
            const blob = new Blob([schemeData], { type: 'application/json' });
            
            // Создаем имя файла с текущей датой
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `cipher-scheme-${timestamp}.json`;
            
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
            
            this.showNotification('Схема успешно сохранена!', 'success');
            
        } catch (error) {
            console.error('Ошибка сохранения схемы:', error);
            this.showNotification('Ошибка сохранения: ' + error.message, 'error');
        }
    }
    
    loadScheme() {
        const fileInput = document.getElementById('fileInput');
        fileInput.click();
    }
    
    handleFileLoad(file) {
        if (!file) return;
        
        if (!file.name.endsWith('.json')) {
            this.showNotification('Пожалуйста, выберите JSON файл', 'error');
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
                    if (!confirm('Это заменит текущую схему. Продолжить?')) {
                        return;
                    }
                }
                
                window.cipherEngine.importScheme(schemeData);
                this.showNotification('Схема успешно загружена!', 'success');
                
                // Сохраняем в localStorage для автовосстановления
                this.saveToLocalStorage(schemeData);
                
            } catch (error) {
                console.error('Ошибка загрузки схемы:', error);
                this.showNotification('Ошибка загрузки: ' + error.message, 'error');
            }
        };
        
        reader.onerror = () => {
            this.showNotification('Ошибка чтения файла', 'error');
        };
        
        reader.readAsText(file);
    }
    
    clearScheme() {
        if (window.nodeManager && window.nodeManager.getAllNodes().length > 0) {
            if (!confirm('Это удалит все ноды и соединения. Продолжить?')) {
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
            
            this.showNotification('Схема очищена', 'success');
            
        } catch (error) {
            console.error('Ошибка очистки схемы:', error);
            this.showNotification('Ошибка очистки: ' + error.message, 'error');
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
                this.showNotification('Поддерживаются только JSON файлы', 'error');
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
                        if (confirm('Найдено автоматически сохраненная схема. Восстановить?')) {
                            window.cipherEngine.importScheme(savedScheme);
                            this.showNotification('Схема восстановлена из автосохранения', 'success');
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
        const examples = this.getExampleSchemes();
        const example = examples[exampleName];
        
        if (example) {
            try {
                if (window.nodeManager && window.nodeManager.getAllNodes().length > 0) {
                    if (!confirm('Это заменит текущую схему. Продолжить?')) {
                        return;
                    }
                }
                
                window.cipherEngine.importScheme(JSON.stringify(example));
                this.showNotification(`Пример "${example.name}" загружен!`, 'success');
                
            } catch (error) {
                console.error('Ошибка загрузки примера:', error);
                this.showNotification('Ошибка загрузки примера: ' + error.message, 'error');
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