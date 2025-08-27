// File: js/main.js
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
                    fileManager: window.fileManager,
                    canvasManager: window.canvasManager
                };
                
                return Promise.resolve();
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        throw new Error('Не удалось загрузить все компоненты');
    }
    
    setupGlobalEventListeners() {
        // Обработка клика по логотипу для показа справки
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('click', () => {
                this.showHelp();
            });
            logo.style.cursor = 'pointer';
            logo.title = 'Показать справку (F1)';
        }
        
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
            // Проверяем, что фокус не на элементах ввода текста
            const activeElement = document.activeElement;
            const isTextInput = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.contentEditable === 'true'
            );
            
            // Проверяем, что не открыта справка
            const helpOverlay = document.querySelector('.help-overlay');
            const isHelpOpen = helpOverlay && helpOverlay.classList.contains('show');
            
            // Проверяем, что не в области справки (включая example-input и example-output)
            const isInHelpArea = activeElement && (
                activeElement.closest('.help-overlay') ||
                activeElement.closest('.example-input') ||
                activeElement.closest('.example-output') ||
                activeElement.classList.contains('example-input') ||
                activeElement.classList.contains('example-output')
            );
            
            // Создаем мапинг клавиш для поддержки русской раскладки
            const keyMap = {
                'ы': 's', 'щ': 'o', 'т': 'n', 'з': 'p', // русские клавиши на соответствующих позициях
                'a': 'f', 'и': 'b', 'с': 'c', 'м': 'v', // дополнительные мапинги
                'х': 'x', 'я': 'z'
            };
            
            // Нормализуем клавишу (поддержка русской раскладки)
            const normalizedKey = keyMap[e.key.toLowerCase()] || e.key.toLowerCase();
            
            // Ctrl/Cmd + S - сохранить схему (поддержка 'ы' для русской раскладки)
            if ((e.ctrlKey || e.metaKey) && (normalizedKey === 's')) {
                e.preventDefault();
                if (this.components.fileManager) {
                    this.components.fileManager.saveScheme();
                }
                return;
            }
            
            // Ctrl/Cmd + O - загрузить схему (поддержка 'щ' для русской раскладки)
            if ((e.ctrlKey || e.metaKey) && (normalizedKey === 'o')) {
                e.preventDefault();
                if (this.components.fileManager) {
                    this.components.fileManager.loadScheme();
                }
                return;
            }
            
            // Ctrl/Cmd + N - новая схема (поддержка 'т' для русской раскладки)
            if ((e.ctrlKey || e.metaKey) && (normalizedKey === 'n')) {
                e.preventDefault();
                if (this.components.fileManager) {
                    this.components.fileManager.clearScheme();
                }
                return;
            }
            
            // Ограничиваем копирование/вставку только для области нодов (не в текстовых полях и не в справке)
            if (!isTextInput && !isHelpOpen && !isInHelpArea) {
                // Ctrl/Cmd + C - копирование выделенных нодов (поддержка 'с' для русской раскладки)
                if ((e.ctrlKey || e.metaKey) && (normalizedKey === 'c')) {
                    e.preventDefault();
                    if (window.selectionManager) {
                        window.selectionManager.copySelected();
                    }
                    return;
                }
                
                // Ctrl/Cmd + V - вставка нодов (поддержка 'м' для русской раскладки)
                if ((e.ctrlKey || e.metaKey) && (normalizedKey === 'v')) {
                    e.preventDefault();
                    if (window.selectionManager) {
                        window.selectionManager.paste();
                    }
                    return;
                }
                
                // Ctrl/Cmd + A - выделить все ноды (поддержка 'ф' для русской раскладки)
                if ((e.ctrlKey || e.metaKey) && (normalizedKey === 'a')) {
                    e.preventDefault();
                    if (window.selectionManager) {
                        window.selectionManager.selectAll();
                    }
                    return;
                }
            }
            
            // === ИЗМЕНЕНИЕ: Удаление работает с группой выделенных нодов ===
            if (e.key === 'Delete' && !isTextInput) {
                if (window.selectionManager && window.selectionManager.selectedNodes.size > 0) {
                    window.selectionManager.deleteSelected();
                }
                return;
            }
            
            // Escape - снять выделение
            if (e.key === 'Escape') {
                if (this.components.nodeManager) {
                    // this.components.nodeManager.deselectAllNodes(); // Заменено на selectionManager
                }
                if (window.selectionManager) {
                    window.selectionManager.clearSelection();
                }
                if (this.components.connectionManager?.isConnecting) {
                    this.components.connectionManager.cancelConnection();
                }
                return;
            }
            
            // F1 - показать справку
            if (e.key === 'F1') {
                e.preventDefault();
                this.showHelp();
                return;
            }
            
            // X - режим резки соединений (поддержка 'ч' для русской раскладки)
            if ((normalizedKey === 'x') && !isTextInput) {
                if (this.components.connectionManager) {
                    this.components.connectionManager.toggleCuttingMode();
                }
                return;
            }
            
            // + / = - увеличить масштаб
            if ((e.key === '+' || e.key === '=' || e.key === 'ъ') && !isTextInput) {
                if (this.components.canvasManager) {
                    this.components.canvasManager.zoomIn();
                }
                return;
            }
            
            // - - уменьшить масштаб
            if (e.key === '-' && !isTextInput) {
                if (this.components.canvasManager) {
                    this.components.canvasManager.zoomOut();
                }
                return;
            }
            
            // Ctrl/Cmd + 0 - сброс масштаба
            if ((e.ctrlKey || e.metaKey) && e.key === '0' && !isTextInput) {
                e.preventDefault();
                if (this.components.canvasManager) {
                    this.components.canvasManager.resetZoom();
                }
                return;
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
        // Используем новую систему справки
        if (window.helpSystem) {
            window.helpSystem.show();
        }
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
    
    // Тестовый метод для добавления нодов
    addTestNodes() {
        if (!this.components.nodeManager) {
            console.error('❌ nodeManager не доступен');
            return;
        }
        
        console.log('🔧 Создаю тестовый нод input...');
        const inputId = this.components.nodeManager.createNode('input', 200, 150);
        console.log('✅ Создан input нод:', inputId);
        
        console.log('🔧 Создаю тестовый нод caesar...');
        const caesarId = this.components.nodeManager.createNode('caesar', 400, 150);
        console.log('✅ Создан caesar нод:', caesarId);
        
        console.log('🔧 Создаю тестовый нод output...');
        const outputId = this.components.nodeManager.createNode('output', 600, 150);
        console.log('✅ Создан output нод:', outputId);
        
        console.log('📊 Общее количество нодов:', this.components.nodeManager.getAllNodes().length);
        
        // Проверим, есть ли элементы в DOM
        const nodesInDOM = document.querySelectorAll('.canvas-node');
        console.log('🎨 Ноды в DOM:', nodesInDOM.length);
        nodesInDOM.forEach((node, index) => {
            console.log(`Нод ${index + 1}:`, {
                id: node.dataset.nodeId,
                transform: node.style.transform,
                visible: getComputedStyle(node).display !== 'none',
                className: node.className
            });
        });
    }
}

// Инициализация приложения
const cipherFlowApp = new CipherFlowApp();
window.cipherFlowApp = cipherFlowApp;

// Экспорт для модульных систем (если нужно)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CipherFlowApp;
}