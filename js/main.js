class CipherFlowApp {
    constructor() {
        this.initialized = false;
        this.components = {};
        
        this.init();
    }
    
    async init() {
        const t = window.i18n.t.bind(window.i18n);
        try {
            console.log('🚀 Запуск CipherFlow...');
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
            
        } catch (error) {
            console.error('❌ Ошибка инициализации приложения:', error);
            this.showError(window.i18n.t('error.app_init', { message: error.message }));
        }
    }
    
    initializeApp() {
        const t = window.i18n.t.bind(window.i18n);
        console.log('🎯 Инициализация компонентов...');
        
        this.waitForComponents().then(() => {
            this.setupGlobalEventListeners();
            this.setupKeyboardShortcuts();
            this.showWelcomeMessage();
            this.initialized = true;
            
            console.log('✅ CipherFlow успешно запущен!');
        }).catch(error => {
            console.error('❌ Ошибка загрузки компонентов:', error);
            this.showError(window.i18n.t('error.components_load', { message: error.message }));
        });
    }
    
    async waitForComponents() {
        const t = window.i18n.t.bind(window.i18n);

        const maxAttempts = 50; 
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            if (window.nodeManager && window.connectionManager && 
                window.cipherEngine && window.fileManager && window.i18n) {
                
                this.components = {
                    nodeManager: window.nodeManager,
                    connectionManager: window.connectionManager,
                    cipherEngine: window.cipherEngine,
                    fileManager: window.fileManager,
                    canvasManager: window.canvasManager,
                    i18n: window.i18n
                };
                
                return Promise.resolve();
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
            throw new Error(window.i18n.t('error.components_timeout'));
    }
    
    setupGlobalEventListeners() {
        const t = window.i18n.t.bind(window.i18n);

        if (window.i18n) {
            window.i18n.onLanguageChange(() => {
                this.updateInterfaceLanguage();
            });
        }
        
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('click', () => {
                this.showHelp();
            });
            logo.style.cursor = 'pointer';
            logo.title = t('header.help'); 
        }
        
        window.addEventListener('resize', this.debounce(() => {
            if (this.components.connectionManager) {
                for (const [nodeId] of this.components.nodeManager.nodes) {
                    this.components.connectionManager.updateConnections(nodeId);
                }
            }
        }, 250));
        
        window.addEventListener('blur', () => {
            if (this.components.fileManager) {
                this.components.fileManager.autoSave();
            }
        });
        
        window.addEventListener('beforeunload', (e) => {
            if (this.components.nodeManager && this.components.nodeManager.getAllNodes().length > 0) {
                const message = t('dialog.unsaved_changes');
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        });
        
        window.addEventListener('error', (e) => {
            console.error('Необработанная ошибка:', e.error);
            this.showError(t('error.unhandled', { message: errorMessage }));
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const activeElement = document.activeElement;
            const isTextInput = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.contentEditable === 'true'
            );
            
            const helpOverlay = document.querySelector('.help-overlay');
            const isHelpOpen = helpOverlay && helpOverlay.classList.contains('show');
            
            const isInHelpArea = activeElement && (
                activeElement.closest('.help-overlay') ||
                activeElement.closest('.example-input') ||
                activeElement.closest('.example-output') ||
                activeElement.classList.contains('example-input') ||
                activeElement.classList.contains('example-output')
            );
            
            const keyMap = {
                'ы': 's', 'щ': 'o', 'т': 'n', 'з': 'p', 
                'a': 'f', 'и': 'b', 'с': 'c', 'м': 'v', 
                'х': 'x', 'я': 'z'
            };
            
            const normalizedKey = keyMap[e.key.toLowerCase()] || e.key.toLowerCase();
            
            if ((e.ctrlKey || e.metaKey) && (normalizedKey === 's')) {
                e.preventDefault();
                if (this.components.fileManager) {
                    this.components.fileManager.saveScheme();
                }
                return;
            }
            
            if ((e.ctrlKey || e.metaKey) && (normalizedKey === 'o')) {
                e.preventDefault();
                if (this.components.fileManager) {
                    this.components.fileManager.loadScheme();
                }
                return;
            }
            
            if ((e.ctrlKey || e.metaKey) && (normalizedKey === 'n')) {
                e.preventDefault();
                if (this.components.fileManager) {
                    this.components.fileManager.clearScheme();
                }
                return;
            }
            
            if (!isTextInput && !isHelpOpen && !isInHelpArea) {
                if ((e.ctrlKey || e.metaKey) && (normalizedKey === 'c')) {
                    e.preventDefault();
                    if (window.selectionManager) {
                        window.selectionManager.copySelected();
                    }
                    return;
                }
                
                if ((e.ctrlKey || e.metaKey) && (normalizedKey === 'v')) {
                    e.preventDefault();
                    if (window.selectionManager) {
                        window.selectionManager.paste();
                    }
                    return;
                }
                
                if ((e.ctrlKey || e.metaKey) && (normalizedKey === 'a')) {
                    e.preventDefault();
                    if (window.selectionManager) {
                        window.selectionManager.selectAll();
                    }
                    return;
                }
            }
            
            if (e.key === 'Delete' && !isTextInput) {
                if (window.selectionManager && window.selectionManager.selectedNodes.size > 0) {
                    window.selectionManager.deleteSelected();
                }
                return;
            }
            
            if (e.key === 'Escape') {
                if (this.components.nodeManager) {
                    // Уже не надо, но если убрать. то всё умрёт, испарвь
                }
                if (window.selectionManager) {
                    window.selectionManager.clearSelection();
                }
                if (this.components.connectionManager?.isConnecting) {
                    this.components.connectionManager.cancelConnection();
                }
                return;
            }
            
            if (e.key === 'F1') {
                e.preventDefault();
                this.showHelp();
                return;
            }
            
            if ((normalizedKey === 'x') && !isTextInput) {
                if (this.components.connectionManager) {
                    this.components.connectionManager.toggleCuttingMode();
                }
                return;
            }
            
            if ((e.key === '+' || e.key === '=' || e.key === 'ъ') && !isTextInput) {
                if (this.components.canvasManager) {
                    this.components.canvasManager.zoomIn();
                }
                return;
            }
            
            if (e.key === '-' && !isTextInput) {
                if (this.components.canvasManager) {
                    this.components.canvasManager.zoomOut();
                }
                return;
            }
            
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
        const hasVisited = localStorage.getItem('cipher-flow-visited');
        
        if (!hasVisited) {
            setTimeout(() => {
                this.showTutorial();
                localStorage.setItem('cipher-flow-visited', 'true');
            }, 1000);
        }
    }
    
    showTutorial() {
        const t = window.i18n.t.bind(window.i18n); 
        const tutorial = document.createElement('div');
        tutorial.className = 'tutorial-overlay';
        tutorial.innerHTML = `
            <div class="tutorial-modal">
                <div class="tutorial-header">
                    <h2>🎯 ${t('tutorial.welcome')}</h2>
                    <button class="tutorial-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="tutorial-content">
                    <div class="tutorial-step">
                        <div class="step-icon">1</div>
                        <div class="step-text">
                            <h3>${t('tutorial.step1_title')}</h3>
                            <p>${t('tutorial.step1_desc')}</p>
                        </div>
                    </div>
                    <div class="tutorial-step">
                        <div class="step-icon">2</div>
                        <div class="step-text">
                            <h3>${t('tutorial.step2_title')}</h3>
                            <p>${t('tutorial.step2_desc')}</p>
                        </div>
                    </div>
                    <div class="tutorial-step">
                        <div class="step-icon">3</div>
                        <div class="step-text">
                            <h3>${t('tutorial.step3_title')}</h3>
                            <p>${t('tutorial.step3_desc')}</p>
                        </div>
                    </div>
                    <div class="tutorial-step">
                        <div class="step-icon">4</div>
                        <div class="step-text">
                            <h3>${t('tutorial.step4_title')}</h3>
                            <p>${t('tutorial.step4_desc')}</p>
                        </div>
                    </div>
                </div>
                <div class="tutorial-footer">
                    <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        ${t('button.got_it')}
                    </button>
                    <button class="btn btn-outline" onclick="window.cipherFlowApp.loadExampleScheme()">
                        ${t('button.load_example')}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(tutorial);
    }
    
    loadExampleScheme() {
        if (this.components.fileManager) {
            this.components.fileManager.loadExampleScheme('simple-caesar');
        }
        
        const tutorial = document.querySelector('.tutorial-overlay');
        if (tutorial) {
            tutorial.remove();
        }
    }
    
    showHelp() {
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
    
    updateInterfaceLanguage() {
        if (!window.i18n) return;
        
        const t = window.i18n.t.bind(window.i18n);
        
        document.title = t('app.title');
        
        const inputTextArea = document.getElementById('inputText');
        if (inputTextArea) {
            inputTextArea.placeholder = t('io.input_placeholder');
        }
        
        const outputTextArea = document.getElementById('outputText');
        if (outputTextArea) {
            outputTextArea.placeholder = t('io.output_placeholder');
        }
        
        this.notifyComponentsLanguageChange();
    }
    
    notifyComponentsLanguageChange() {
        if (window.nodeManager && window.nodeManager.updateNodeTexts) {
            window.nodeManager.updateNodeTexts();
        }
    }
}

const cipherFlowApp = new CipherFlowApp();
window.cipherFlowApp = cipherFlowApp;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CipherFlowApp;
}