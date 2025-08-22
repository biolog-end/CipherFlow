// === Основной файл приложения CipherFlow ===

class CipherFlowApp {
    constructor() {
        this.initialized = false;
        this.components = {};
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Запуск CipherFlow...');
            
            // Проверяем готовность DOM
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
            
        } catch (error) {
            console.error('❌ Ошибка инициализации приложения:', error);
            this.showError('Ошибка инициализации приложения: ' + error.message);
        }
    }
    
    initializeApp() {
        console.log('🎯 Инициализация компонентов...');
        
        // Ждем загрузки всех компонентов
        this.waitForComponents().then(() => {
            this.setupGlobalEventListeners();
            this.setupKeyboardShortcuts();
            this.showWelcomeMessage();
            this.initialized = true;
            
            console.log('✅ CipherFlow успешно запущен!');
        }).catch(error => {
            console.error('❌ Ошибка загрузки компонентов:', error);
            this.showError('Ошибка загрузки компонентов: ' + error.message);
        });
    }
    
    async waitForComponents() {
        const maxAttempts = 50; // 5 секунд максимум
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            if (window.nodeManager && window.connectionManager && 
                window.cipherEngine && window.fileManager) {
                
                this.components = {
                    nodeManager: window.nodeManager,
                    connectionManager: window.connectionManager,
                    cipherEngine: window.cipherEngine,
                    fileManager: window.fileManager
                };
                
                return Promise.resolve();
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        throw new Error('Не удалось загрузить все компоненты');
    }
    
    setupGlobalEventListeners() {
        // Обработка изменения размера окна
        window.addEventListener('resize', this.debounce(() => {
            if (this.components.connectionManager) {
                // Обновляем все соединения при изменении размера
                for (const [nodeId] of this.components.nodeManager.nodes) {
                    this.components.connectionManager.updateConnections(nodeId);
                }
            }
        }, 250));
        
        // Обработка потери фокуса - автосохранение
        window.addEventListener('blur', () => {
            if (this.components.fileManager) {
                this.components.fileManager.autoSave();
            }
        });
        
        // Предотвращение случайного закрытия с несохраненными изменениями
        window.addEventListener('beforeunload', (e) => {
            if (this.components.nodeManager && this.components.nodeManager.getAllNodes().length > 0) {
                const message = 'У вас есть несохраненная схема. Вы уверены, что хотите покинуть страницу?';
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        });
        
        // Обработка ошибок JavaScript
        window.addEventListener('error', (e) => {
            console.error('Необработанная ошибка:', e.error);
            this.showError(`Произошла ошибка: ${e.error?.message || 'Неизвестная ошибка'}`);
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S - сохранить схему
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (this.components.fileManager) {
                    this.components.fileManager.saveScheme();
                }
            }
            
            // Ctrl/Cmd + O - загрузить схему
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                if (this.components.fileManager) {
                    this.components.fileManager.loadScheme();
                }
            }
            
            // Ctrl/Cmd + N - новая схема
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                if (this.components.fileManager) {
                    this.components.fileManager.clearScheme();
                }
            }
            
            // Delete - удалить выбранный нод
            if (e.key === 'Delete' && this.components.nodeManager?.selectedNode) {
                this.components.nodeManager.removeNode(this.components.nodeManager.selectedNode);
            }
            
            // Escape - снять выделение
            if (e.key === 'Escape') {
                if (this.components.nodeManager) {
                    this.components.nodeManager.deselectAllNodes();
                }
                if (this.components.connectionManager?.isConnecting) {
                    this.components.connectionManager.cancelConnection();
                }
            }
            
            // F1 - показать справку
            if (e.key === 'F1') {
                e.preventDefault();
                this.showHelp();
            }
        });
    }
    
    showWelcomeMessage() {
        // Показываем приветственное сообщение только новым пользователям
        const hasVisited = localStorage.getItem('cipher-flow-visited');
        
        if (!hasVisited) {
            setTimeout(() => {
                this.showTutorial();
                localStorage.setItem('cipher-flow-visited', 'true');
            }, 1000);
        }
    }
    
    showTutorial() {
        const tutorial = document.createElement('div');
        tutorial.className = 'tutorial-overlay';
        tutorial.innerHTML = `
            <div class="tutorial-modal">
                <div class="tutorial-header">
                    <h2>🎯 Добро пожаловать в CipherFlow!</h2>
                    <button class="tutorial-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="tutorial-content">
                    <div class="tutorial-step">
                        <div class="step-icon">1</div>
                        <div class="step-text">
                            <h3>Перетащите ноды</h3>
                            <p>Выберите ноды из левой панели и перетащите их на рабочую область</p>
                        </div>
                    </div>
                    <div class="tutorial-step">
                        <div class="step-icon">2</div>
                        <div class="step-text">
                            <h3>Соедините ноды</h3>
                            <p>Кликните на точку вывода одного нода и перетащите к точке ввода другого</p>
                        </div>
                    </div>
                    <div class="tutorial-step">
                        <div class="step-icon">3</div>
                        <div class="step-text">
                            <h3>Настройте параметры</h3>
                            <p>Измените настройки в нодах для получения нужного результата</p>
                        </div>
                    </div>
                    <div class="tutorial-step">
                        <div class="step-icon">4</div>
                        <div class="step-text">
                            <h3>Сохраните схему</h3>
                            <p>Используйте кнопки сохранения для экспорта ваших схем шифрования</p>
                        </div>
                    </div>
                </div>
                <div class="tutorial-footer">
                    <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Понятно, спасибо!
                    </button>
                    <button class="btn btn-outline" onclick="window.cipherFlowApp.loadExampleScheme()">
                        Загрузить пример
                    </button>
                </div>
            </div>
        `;
        
        // Добавляем стили для туториала
        tutorial.style.cssText = `
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
        
        const modalStyles = `
            .tutorial-modal {
                background: var(--bg-secondary);
                border-radius: var(--radius-lg);
                padding: 2rem;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: var(--shadow-lg);
                border: 1px solid var(--border-color);
            }
            .tutorial-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--border-color);
            }
            .tutorial-header h2 {
                color: var(--accent-primary);
                margin: 0;
            }
            .tutorial-close {
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                padding: 0.5rem;
                border-radius: var(--radius);
                transition: var(--transition);
            }
            .tutorial-close:hover {
                color: var(--text-primary);
                background: rgba(255, 255, 255, 0.1);
            }
            .tutorial-step {
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            .step-icon {
                width: 32px;
                height: 32px;
                background: var(--accent-primary);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                flex-shrink: 0;
            }
            .step-text h3 {
                margin: 0 0 0.5rem 0;
                color: var(--text-primary);
            }
            .step-text p {
                margin: 0;
                color: var(--text-secondary);
                line-height: 1.5;
            }
            .tutorial-footer {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid var(--border-color);
            }
        `;
        
        // Добавляем стили, если их нет
        if (!document.querySelector('#tutorial-styles')) {
            const style = document.createElement('style');
            style.id = 'tutorial-styles';
            style.textContent = modalStyles;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(tutorial);
    }
    
    loadExampleScheme() {
        if (this.components.fileManager) {
            this.components.fileManager.loadExampleScheme('simple-caesar');
        }
        
        // Закрываем туториал
        const tutorial = document.querySelector('.tutorial-overlay');
        if (tutorial) {
            tutorial.remove();
        }
    }
    
    showHelp() {
        const help = document.createElement('div');
        help.className = 'help-overlay';
        help.innerHTML = `
            <div class="help-modal">
                <div class="help-header">
                    <h2>📚 Справка CipherFlow</h2>
                    <button class="help-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="help-content">
                    <div class="help-section">
                        <h3>⌨️ Горячие клавиши</h3>
                        <ul>
                            <li><kbd>Ctrl/Cmd + S</kbd> - Сохранить схему</li>
                            <li><kbd>Ctrl/Cmd + O</kbd> - Загрузить схему</li>
                            <li><kbd>Ctrl/Cmd + N</kbd> - Новая схема</li>
                            <li><kbd>Delete</kbd> - Удалить выбранный нод</li>
                            <li><kbd>Escape</kbd> - Снять выделение</li>
                            <li><kbd>F1</kbd> - Показать справку</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h3>🔗 Типы нодов</h3>
                        <ul>
                            <li><strong>Ввод текста</strong> - источник данных</li>
                            <li><strong>Вывод текста</strong> - отображение результата</li>
                            <li><strong>Шифр Цезаря</strong> - сдвиг букв алфавита</li>
                            <li><strong>Код Морзе</strong> - преобразование в/из морзе</li>
                            <li><strong>Числа в слова</strong> - замена цифр словами</li>
                            <li><strong>Математика</strong> - арифметические операции</li>
                            <li><strong>Обратить текст</strong> - реверс строки</li>
                            <li><strong>Регистр</strong> - изменение регистра букв</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h3>🔄 Режимы работы</h3>
                        <p>Переключатель в верхней части позволяет менять режим между <strong>шифрованием</strong> и <strong>расшифровкой</strong>. В режиме расшифровки направления стрелок меняются, и алгоритмы работают в обратном направлении.</p>
                    </div>
                </div>
            </div>
        `;
        
        help.style.cssText = `
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
        
        const helpStyles = `
            .help-modal {
                background: var(--bg-secondary);
                border-radius: var(--radius-lg);
                padding: 2rem;
                max-width: 700px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: var(--shadow-lg);
                border: 1px solid var(--border-color);
            }
            .help-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--border-color);
            }
            .help-header h2 {
                color: var(--accent-primary);
                margin: 0;
            }
            .help-close {
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                padding: 0.5rem;
                border-radius: var(--radius);
                transition: var(--transition);
            }
            .help-close:hover {
                color: var(--text-primary);
                background: rgba(255, 255, 255, 0.1);
            }
            .help-section {
                margin-bottom: 2rem;
            }
            .help-section h3 {
                color: var(--text-primary);
                margin-bottom: 1rem;
            }
            .help-section ul {
                list-style: none;
                padding: 0;
            }
            .help-section li {
                color: var(--text-secondary);
                margin-bottom: 0.5rem;
                padding-left: 1rem;
            }
            .help-section li:before {
                content: "•";
                color: var(--accent-primary);
                margin-right: 0.5rem;
                margin-left: -1rem;
            }
            kbd {
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 3px;
                padding: 2px 6px;
                font-family: monospace;
                font-size: 0.9em;
                color: var(--text-primary);
            }
        `;
        
        if (!document.querySelector('#help-styles')) {
            const style = document.createElement('style');
            style.id = 'help-styles';
            style.textContent = helpStyles;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(help);
    }
    
    showError(message) {
        if (this.components.fileManager) {
            this.components.fileManager.showNotification(message, 'error');
        } else {
            console.error(message);
            alert(message);
        }
    }
    
    // Утилиты
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Публичные методы для взаимодействия
    getStats() {
        if (!this.initialized) return null;
        
        return {
            nodes: this.components.nodeManager.getAllNodes().length,
            connections: this.components.connectionManager.getAllConnections().length,
            mode: this.components.connectionManager.reverseMode ? 'decrypt' : 'encrypt'
        };
    }
    
    exportCurrentScheme() {
        if (this.components.cipherEngine) {
            return this.components.cipherEngine.exportScheme();
        }
        return null;
    }
}

// Инициализация приложения
const cipherFlowApp = new CipherFlowApp();
window.cipherFlowApp = cipherFlowApp;

// Экспорт для модульных систем (если нужно)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CipherFlowApp;
}