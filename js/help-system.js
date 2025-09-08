// === Улучшенная система справки с анимациями и подробными объяснениями ===

class HelpSystem {
    constructor() {
        this.isOpen = false;
        this.currentSection = 'overview';
        this.initializeStyles();
    }

    initializeStyles() {
        // Добавляем дополнительные стили для справки
        const style = document.createElement('style');
        style.textContent = `
            .help-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .help-overlay.show {
                opacity: 1;
                visibility: visible;
            }

            .help-modal {
                background: var(--bg-primary);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                width: 90%;
                max-width: 1200px;
                height: 80vh;
                display: flex;
                overflow: hidden;
                transform: scale(0.8) translateY(50px);
                transition: all 0.3s ease;
            }

            .help-overlay.show .help-modal {
                transform: scale(1) translateY(0);
            }

            .help-sidebar {
                width: 300px;
                background: var(--bg-secondary);
                border-right: 1px solid var(--border-color);
                padding: 2rem 0;
                overflow-y: auto;
            }

            .help-nav-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 0.75rem 2rem;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
                background: none;
                width: 100%;
                text-align: left;
                color: var(--text-secondary);
            }

            .help-nav-item:hover {
                background: var(--accent-primary-10);
                color: var(--text-primary);
            }

            .help-nav-item.active {
                background: var(--accent-primary);
                color: white;
                box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
            }

            .help-nav-item i {
                font-size: 1.2rem;
                width: 20px;
            }

            .help-content {
                flex: 1;
                padding: 2rem;
                overflow-y: auto;
                position: relative;
            }

            .help-section {
                display: none;
                animation: fadeInUp 0.5s ease;
            }

            .help-section.active {
                display: block;
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .help-title {
                font-size: 2rem;
                font-weight: 700;
                color: var(--text-primary);
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .help-subtitle {
                font-size: 1.5rem;
                font-weight: 600;
                color: var(--accent-primary);
                margin: 2rem 0 1rem 0;
                border-bottom: 2px solid var(--accent-primary-20);
                padding-bottom: 0.5rem;
            }

            .algorithm-card {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 1.5rem;
                margin: 1rem 0;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .algorithm-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                border-color: var(--accent-primary);
            }

            .algorithm-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .algorithm-icon {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                color: white;
            }

            .algorithm-info h3 {
                margin: 0;
                color: var(--text-primary);
                font-size: 1.2rem;
            }

            .algorithm-info p {
                margin: 0.5rem 0 0 0;
                color: var(--text-secondary);
                font-size: 0.9rem;
            }

            .data-loss-warning {
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 8px;
                padding: 1rem;
                margin: 1rem 0;
                position: relative;
            }

            .data-loss-warning::before {
                content: '⚠️';
                position: absolute;
                top: 1rem;
                left: 1rem;
                font-size: 1.2rem;
            }

            .data-loss-warning h4 {
                color: var(--error);
                margin: 0 0 0.5rem 2rem;
                font-size: 1rem;
            }

            .data-loss-warning p {
                margin: 0 0 0 2rem;
                color: var(--text-secondary);
                font-size: 0.9rem;
            }

            .example-box {
                background: var(--bg-tertiary);
                border-left: 4px solid var(--accent-primary);
                padding: 1rem;
                margin: 1rem 0;
                border-radius: 0 8px 8px 0;
            }

            .example-box h4 {
                margin: 0 0 0.5rem 0;
                color: var(--accent-primary);
            }

            .example-input, .example-output {
                font-family: 'Courier New', monospace;
                background: var(--bg-primary);
                padding: 0.5rem;
                border-radius: 4px;
                margin: 0.5rem 0;
                border: 1px solid var(--border-color);
            }

            .help-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                transition: all 0.2s ease;
                font-size: 1.5rem;
            }

            .help-close:hover {
                color: var(--error);
                background: rgba(239, 68, 68, 0.1);
            }

            .animated-diagram {
                width: 100%;
                height: 200px;
                background: var(--bg-tertiary);
                border-radius: 8px;
                margin: 1rem 0;
                position: relative;
                overflow: hidden;
                border: 1px solid var(--border-color);
            }

            .cipher-animation {
                position: absolute;
                top: 50%;
                left: 10%;
                transform: translateY(-50%);
                font-family: 'Courier New', monospace;
                font-size: 1.2rem;
                color: var(--accent-primary);
                animation: slideEncrypt 3s infinite;
            }

            @keyframes slideEncrypt {
                0% { left: 10%; opacity: 1; }
                50% { left: 50%; opacity: 0.7; }
                100% { left: 90%; opacity: 1; }
            }

            .progress-dots {
                display: flex;
                gap: 0.5rem;
                margin: 1rem 0;
                justify-content: center;
            }

            .progress-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: var(--text-muted);
                animation: pulse 1.5s infinite;
            }

            .progress-dot:nth-child(2) { animation-delay: 0.3s; }
            .progress-dot:nth-child(3) { animation-delay: 0.6s; }

            @keyframes pulse {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
            }

            .example-load-btn {
                background: var(--accent-primary);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-size: 0.9rem;
                margin-top: 1rem;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                width: fit-content;
            }

            .example-load-btn:hover {
                background: var(--accent-secondary);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
            }

            .example-load-btn:active {
                transform: translateY(0);
            }

            .example-load-btn i {
                font-size: 1rem;
            }

            .example-load-btn {
                background: var(--accent-primary);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-size: 0.9rem;
                margin-top: 1rem;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                width: fit-content;
            }

            .example-load-btn:hover {
                background: var(--accent-secondary);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
            }

            .example-load-btn:active {
                transform: translateY(0);
            }

            .example-load-btn i {
                font-size: 1rem;
            }
        `;
        document.head.appendChild(style);
    }

    show() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.createHelpModal();
    }

    hide() {
        if (!this.isOpen) return;
        this.isOpen = false;
        const overlay = document.querySelector('.help-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        }
    }

    createHelpModal() {
        const overlay = document.createElement('div');
        overlay.className = 'help-overlay';
        
        overlay.innerHTML = `
            <div class="help-modal">
                <div class="help-sidebar">
                    <button class="help-nav-item active" data-section="overview">
                        <i class="fas fa-home"></i>
                        <span data-i18n="help.navigation.overview">Обзор</span>
                    </button>
                    <button class="help-nav-item" data-section="algorithms">
                        <i class="fas fa-cogs"></i>
                        <span data-i18n="help.navigation.algorithms">Алгоритмы</span>
                    </button>
                    <button class="help-nav-item" data-section="data-loss">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span data-i18n="help.navigation.data_loss">Потеря данных</span>
                    </button>
                    <button class="help-nav-item" data-section="examples">
                        <i class="fas fa-lightbulb"></i>
                        <span data-i18n="help.navigation.examples">Примеры</span>
                    </button>
                    <button class="help-nav-item" data-section="hotkeys">
                        <i class="fas fa-keyboard"></i>
                        <span data-i18n="help.navigation.hotkeys">Горячие клавиши</span>
                    </button>
                </div>
                <div class="help-content">
                    <button class="help-close">
                        <i class="fas fa-times"></i>
                    </button>
                    ${this.generateContent()}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        
        // Показываем с анимацией
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });

        // Обновляем переводы если i18n доступен
        if (window.i18n) {
            window.i18n.updateInterface();
        }

        // Обработчики событий
        overlay.querySelector('.help-close').onclick = () => this.hide();
        overlay.onclick = (e) => {
            if (e.target === overlay) this.hide();
        };

        // Навигация
        overlay.querySelectorAll('.help-nav-item').forEach(item => {
            item.onclick = () => this.switchSection(item.dataset.section);
        });

        // Закрытие по ESC
        document.addEventListener('keydown', this.handleKeyPress);
    }

    handleKeyPress = (e) => {
        if (e.key === 'Escape' && this.isOpen) {
            this.hide();
            document.removeEventListener('keydown', this.handleKeyPress);
        }
    }

    switchSection(sectionId) {
        // Обновляем навигацию
        document.querySelectorAll('.help-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // Показываем секцию
        document.querySelectorAll('.help-section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelector(`#help-${sectionId}`).classList.add('active');

        this.currentSection = sectionId;
    }

    async loadExample(exampleName) {
        try {
            // Скрываем справку
            this.hide();
            
            // Загружаем файл примера
            const response = await fetch(`examples/${exampleName}.json`);
            if (!response.ok) {
                throw new Error(`Не удалось загрузить пример: ${response.status}`);
            }
            
            const exampleData = await response.text();
            
            // Используем файловый менеджер для загрузки схемы
            if (window.fileManager) {
                window.fileManager.importScheme(exampleData);
                
                // Показываем уведомление
                this.showExampleLoadedNotification(exampleName);

                // Воспроизводим звук если включены звуковые эффекты
                if (window.settingsSystem?.settings.soundEffects) {
                    window.settingsSystem.playSound('select');
                }
            } else {
                throw new Error('Файловый менеджер недоступен');
            }
            
        } catch (error) {
            console.error('Ошибка загрузки примера:', error);
            alert(`Ошибка загрузки примера "${exampleName}": ${error.message}`);
        }
    }

    showExampleLoadedNotification(exampleName) {
        // Получаем переведенные имена примеров
        const getExampleName = (name) => {
            const key = `help.example.${name.replace('-', '_')}`;
            return window.i18n ? window.i18n.t(key) : name;
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--accent-primary);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-size: 1rem;
            z-index: 10001;
            box-shadow: 0 8px 25px rgba(124, 58, 237, 0.3);
            animation: slideInUp 0.3s ease, slideOutDown 0.3s ease 3s forwards;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        `;
        
        const loadedText = window.i18n ? window.i18n.t('help.examples.loaded') : 'Пример загружен!';
        const exampleDisplayName = getExampleName(exampleName);
        
        notification.innerHTML = `
            <i class="fas fa-check-circle" style="font-size: 1.2rem;"></i>
            <div>
                <div style="font-weight: 600;">${loadedText}</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">${exampleDisplayName}</div>
            </div>
        `;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3500);
    }

    generateContent() {
        return `
            ${this.getOverviewSection()}
            ${this.getAlgorithmsSection()}
            ${this.getDataLossSection()}
            ${this.getExamplesSection()}
            ${this.getHotkeysSection()}
        `;
    }

    getOverviewSection() {
        return `
            <div id="help-overview" class="help-section active">
                <div class="help-title">
                    <i class="fas fa-project-diagram"></i>
                    <span data-i18n="help.overview.title"></span>
                </div>
                
                <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 2rem;" data-i18n="help.overview.description"></p>

                <div class="animated-diagram">
                    <div class="cipher-animation" data-i18n="help.overview.animation_text"></div>
                    <div class="progress-dots">
                        <div class="progress-dot"></div>
                        <div class="progress-dot"></div>
                        <div class="progress-dot"></div>
                    </div>
                </div>

                <div class="help-subtitle" data-i18n="help.overview.features"></div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                                <i class="fas fa-puzzle-piece"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3 data-i18n="help.overview.visual_programming"></h3>
                                <p data-i18n="help.overview.visual_desc"></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                                <i class="fas fa-link"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3 data-i18n="help.overview.chain_encryption"></h3>
                                <p data-i18n="help.overview.chain_desc"></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                                <i class="fas fa-exchange-alt"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3 data-i18n="help.overview.reverse_encryption"></h3>
                                <p data-i18n="help.overview.reverse_desc"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getAlgorithmsSection() {
        return `
            <div id="help-algorithms" class="help-section">
                <div class="help-title">
                    <i class="fas fa-cogs"></i>
                    <span data-i18n="help.algorithms.title"></span>
                </div>

                <div class="help-subtitle" data-i18n="help.algorithms.input_output"></div>
                
                <div class="algorithm-card" data-node-type="text_input">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #10b981, #059669);"><i class="fas fa-sign-in-alt"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.text_input"></h3>
                            <p data-i18n="help.algo.text_input_desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.text_input_principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.text_input_usage"></h4>
                        <div class="example-input" data-i18n="help.algo.text_input_step1"></div>
                        <div class="example-input" data-i18n="help.algo.text_input_step2"></div>
                        <div class="example-output" data-i18n="help.algo.text_input_result"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.algo.text_input_features"></h4>
                        <p><span data-i18n="help.algo.text_input_feature1"></span><br><span data-i18n="help.algo.text_input_feature2"></span><br><span data-i18n="help.algo.text_input_feature3"></span></p>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="text_output">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);"><i class="fas fa-sign-out-alt"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.text_output"></h3>
                            <p data-i18n="help.algo.text_output_desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.text_output_principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.text_output_usage"></h4>
                        <div class="example-input" data-i18n="help.algo.text_output_step1"></div>
                        <div class="example-input" data-i18n="help.algo.text_output_step2"></div>
                        <div class="example-output" data-i18n="help.algo.text_output_result"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.algo.text_output_features"></h4>
                        <p><span data-i18n="help.algo.text_output_feature1"></span><br><span data-i18n="help.algo.text_output_feature2"></span><br><span data-i18n="help.algo.text_output_feature3"></span></p>
                    </div>
                </div>

                <div class="help-subtitle" data-i18n="help.algorithms.classic_ciphers"></div>
                
                <div class="algorithm-card" data-node-type="caesar_cipher">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #6366f1, #4f46e5);"><i class="fas fa-exchange-alt"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.caesar_cipher"></h3>
                            <p data-i18n="help.algo.caesar_desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.caesar_principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.caesar_example"></h4>
                        <div class="example-input" data-i18n="help.algo.caesar_input"></div>
                        <div class="example-output" data-i18n="help.algo.caesar_output"></div>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="morse_code">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);"><i class="fas fa-broadcast-tower"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.morse_code"></h3>
                            <p data-i18n="help.algo.morse_desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.morse_principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.morse_languages"></h4>
                        <div class="example-input"><strong data-i18n="help.algo.morse_russian"></strong> <span data-i18n="help.algo.morse_russian" data-i18n-append=": · (Unicode точка) и − (Unicode тире)"></span></div>
                        <div class="example-input"><strong data-i18n="help.algo.morse_english"></strong> <span data-i18n="help.algo.morse_english" data-i18n-append=": . (ASCII точка) и - (ASCII дефис)"></span></div>
                        <div class="example-output" data-i18n="help.algo.morse_distinction"></div>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.morse_example"></h4>
                        <div class="example-input" data-i18n="help.algo.morse_input"></div>
                        <div class="example-output" data-i18n="help.algo.morse_output"></div>
                        <div class="example-output" data-i18n="help.algo.morse_mix"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.algo.morse_yo_setting"></h4>
                        <p data-i18n="help.algo.morse_yo_desc"></p>
                        <div class="example-input" data-i18n="help.algo.morse_yo_without"></div>
                        <div class="example-input" data-i18n="help.algo.morse_yo_with"></div>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="morse_cat">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #f472b6, #ec4899);"><i class="fas fa-cat"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.morse_cat"></h3>
                            <p data-i18n="help.algo.morse_cat_desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.morse_cat_principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.morse_cat_replacements"></h4>
                        <div class="example-input" data-i18n="help.algo.morse_cat_dot"></div>
                        <div class="example-input" data-i18n="help.algo.morse_cat_dash"></div>
                        <div class="example-input" data-i18n="help.algo.morse_cat_space"></div>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.morse_cat_example"></h4>
                        <div class="example-input" data-i18n="help.algo.morse_cat_input"></div>
                        <div class="example-output" data-i18n="help.algo.morse_cat_morse"></div>
                        <div class="example-output" data-i18n="help.algo.morse_cat_output"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.algo.morse_cat_yo"></h4>
                        <p data-i18n="help.algo.morse_cat_yo_desc"></p>
                        <div class="example-input" data-i18n="help.algo.morse_cat_yo_example"></div>
                    </div>
                </div>
                
                <div class="algorithm-card" data-node-type="a1z26_cipher">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #14b8a6, #0d9488);"><i class="fas fa-sort-numeric-up"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.a1z26"></h3>
                            <p data-i18n="help.algo.a1z26_desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.a1z26_principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.a1z26_example"></h4>
                        <div class="example-input" data-i18n="help.algo.a1z26_input"></div>
                        <div class="example-output" data-i18n="help.algo.a1z26_output"></div>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="vigenere_cipher">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #ec4899, #db2777);"><i class="fas fa-shield-alt"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.vigenere"></h3>
                            <p data-i18n="help.algo.vigenere_desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.vigenere_principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.vigenere_mode"></h4>
                        <div class="example-input" data-i18n="help.algo.vigenere_formula"></div>
                        <div class="example-input" data-i18n="help.algo.vigenere_text"></div>
                        <div class="example-output" data-i18n="help.algo.vigenere_result"></div>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.beaufort_mode"></h4>
                        <div class="example-input" data-i18n="help.algo.beaufort_formula"></div>
                        <div class="example-input" data-i18n="help.algo.beaufort_text"></div>
                        <div class="example-output" data-i18n="help.algo.beaufort_result"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.algo.beaufort_title"></h4>
                        <p><span data-i18n="help.algo.beaufort_feature1"></span><br><span data-i18n="help.algo.beaufort_feature2"></span><br><span data-i18n="help.algo.beaufort_feature3"></span></p>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p><span data-i18n="help.algo.vigenere_feature1"></span><br><span data-i18n="help.algo.vigenere_feature2"></span><br><span data-i18n="help.algo.vigenere_feature3"></span></p>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="secret_word">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #f87171, #ef4444);"><i class="fas fa-key"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.secret_word"></h3>
                            <p data-i18n="help.algo.secret_word_desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.secret_word_principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.secret_word_example"></h4>
                        <div class="example-input" data-i18n="help.algo.secret_word_input"></div>
                        <div class="example-output" data-i18n="help.algo.secret_word_usage"></div>
                    </div>
                </div>
                
                <div class="algorithm-card" data-node-type="complex_substitution">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #dc2626, #b91c1c);"><i class="fas fa-key"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.complex_substitution.title"></h3>
                            <p data-i18n="help.algo.complex_substitution.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.complex_substitution.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.complex_substitution.example_title"></h4>
                        <div class="example-input" data-i18n="help.algo.complex_substitution.example_base"></div>
                        <div class="example-input" data-i18n="help.algo.complex_substitution.example_process"></div>
                        <div class="example-input" data-i18n="help.algo.complex_substitution.example_new_alphabet"></div>
                        <div class="example-output" data-i18n="help.algo.complex_substitution.example_encrypt"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p><span data-i18n="help.algo.complex_substitution.feature1"></span><br><span data-i18n="help.algo.complex_substitution.feature2"></span><br><span data-i18n="help.algo.complex_substitution.feature3"></span></p>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="simple_substitution">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #ea580c, #dc2626);"><i class="fas fa-exchange-alt"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.simple_substitution.title"></h3>
                            <p data-i18n="help.algo.simple_substitution.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.simple_substitution.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.simple_substitution.example_title"></h4>
                        <div class="example-input" data-i18n="help.algo.simple_substitution.example_base"></div>
                        <div class="example-input" data-i18n="help.algo.simple_substitution.example_new_alphabet"></div>
                        <div class="example-output" data-i18n="help.algo.simple_substitution.example_encrypt"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p><span data-i18n="help.algo.simple_substitution.feature1"></span><br><span data-i18n="help.algo.simple_substitution.feature2"></span><br><span data-i18n="help.algo.simple_substitution.feature3"></span></p>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="route_transposition">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #7c2d12, #92400e);"><i class="fas fa-route"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.route_transposition.title"></h3>
                            <p data-i18n="help.algo.route_transposition.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.route_transposition.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.route_transposition.example_title"></h4>
                        <div class="example-input" data-i18n="help.algo.route_transposition.example_text"></div>
                        <div class="example-input" data-i18n="help.algo.route_transposition.example_order"></div>
                        <div class="example-input" style="white-space: pre;" data-i18n="help.algo.route_transposition.example_matrix"></div>
                        <div class="example-output" data-i18n="help.algo.route_transposition.example_result"></div>
                    </div>
                </div>

                <div class="help-subtitle" data-i18n="help.algorithms.compression"></div>

                <div class="algorithm-card" data-node-type="rle_compression">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #059669, #047857);"><i class="fas fa-compress-arrows-alt"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.rle.title"></h3>
                            <p data-i18n="help.algo.rle.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.rle.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.rle.example_compress_title"></h4>
                        <div class="example-input" data-i18n="help.algo.rle.example_compress_input"></div>
                        <div class="example-output" data-i18n="help.algo.rle.example_compress_output"></div>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.rle.example_decompress_title"></h4>
                        <div class="example-input" data-i18n="help.algo.rle.example_decompress_input"></div>
                        <div class="example-output" data-i18n="help.algo.rle.example_decompress_output"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p><span data-i18n="help.algo.rle.feature1"></span><br><span data-i18n="help.algo.rle.feature2"></span><br><span data-i18n="help.algo.rle.feature3"></span></p>
                    </div>
                </div>

                <div class="help-subtitle" data-i18n="help.algorithms.transformations"></div>

                <div class="algorithm-card" data-node-type="numbers_to_words">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #84cc16, #65a30d);"><i class="fas fa-hashtag"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.numbers_to_words.title"></h3>
                            <p data-i18n="help.algo.numbers_to_words.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.numbers_to_words.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.numbers_to_words.example_ru_title"></h4>
                        <div class="example-input" data-i18n="help.algo.numbers_to_words.example_ru_input"></div>
                        <div class="example-output" data-i18n="help.algo.numbers_to_words.example_ru_output"></div>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.numbers_to_words.example_en_title"></h4>
                        <div class="example-input" data-i18n="help.algo.numbers_to_words.example_en_input"></div>
                        <div class="example-output" data-i18n="help.algo.numbers_to_words.example_en_output"></div>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="math">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #facc15, #eab308);"><i class="fas fa-calculator"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.math.title"></h3>
                            <p data-i18n="help.algo.math.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.math.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.math.example_title"></h4>
                        <div class="example-input" data-i18n="help.algo.math.example_input"></div>
                        <div class="example-output" data-i18n="help.algo.math.example_output"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.algo.math.features_title"></h4>
                        <p><span data-i18n="help.algo.math.feature1"></span><br><span data-i18n="help.algo.math.feature2"></span></p>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="reverse_text">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #fb923c, #f97316);"><i class="fas fa-undo"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.reverse.title"></h3>
                            <p data-i18n="help.algo.reverse.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.reverse.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.reverse.mode_full_title"></h4>
                        <div class="example-input" data-i18n="help.algo.reverse.mode_full_input"></div>
                        <div class="example-output" data-i18n="help.algo.reverse.mode_full_output"></div>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.reverse.mode_words_title"></h4>
                        <div class="example-input" data-i18n="help.algo.reverse.mode_words_input"></div>
                        <div class="example-output" data-i18n="help.algo.reverse.mode_words_output"></div>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.reverse.mode_snake_title"></h4>
                        <div class="example-input" style="white-space: pre;" data-i18n="help.algo.reverse.mode_snake_input"></div>
                        <div class="example-output" style="white-space: pre;" data-i18n="help.algo.reverse.mode_snake_output"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.algo.reverse.snake_title"></h4>
                        <p><span data-i18n="help.algo.reverse.snake_feature1"></span><br><span data-i18n="help.algo.reverse.snake_feature2"></span><br><span data-i18n="help.algo.reverse.snake_feature3"></span></p>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="case_transform">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #c084fc, #a855f7);"><i class="fas fa-text-height"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.case.title"></h3>
                            <p data-i18n="help.algo.case.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.case.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.case.modes_title"></h4>
                        <div class="example-input" data-i18n="help.algo.case.mode_upper"></div>
                        <div class="example-input" data-i18n="help.algo.case.mode_lower"></div>
                        <div class="example-input" data-i18n="help.algo.case.mode_title"></div>
                        <div class="example-input" data-i18n="help.algo.case.mode_toggle"></div>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="binary_code">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);"><i class="fas fa-microchip"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.binary.title"></h3>
                            <p data-i18n="help.algo.binary.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.binary.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.binary.example_title"></h4>
                        <div class="example-input" data-i18n="help.algo.binary.example_input"></div>
                        <div class="example-output" data-i18n="help.algo.binary.example_output"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p><span data-i18n="help.algo.binary.feature1"></span><br><span data-i18n="help.algo.binary.feature2"></span></p>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="planet_enchanter">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #22d3ee, #06b6d4);"><i class="fas fa-globe"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.planet_enchanter.title"></h3>
                            <p data-i18n="help.algo.planet_enchanter.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.planet_enchanter.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.planet_enchanter.example_title"></h4>
                        <div class="example-input" data-i18n="help.algo.planet_enchanter.example_input"></div>
                        <div class="example-output" style="white-space: pre;" data-i18n="help.algo.planet_enchanter.example_output"></div>
                    </div>
                </div>

                <div class="help-subtitle" data-i18n="help.algorithms.advanced_processing"></div>

                <div class="algorithm-card" data-node-type="multi_replace">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);"><i class="fas fa-exchange-alt"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.multi_replace.title"></h3>
                            <p data-i18n="help.algo.multi_replace.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.multi_replace.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.multi_replace.example_rules_title"></h4>
                        <div class="example-input" style="white-space: pre;" data-i18n="help.algo.multi_replace.example_rules"></div>
                        <div class="example-input" data-i18n="help.algo.multi_replace.example_input"></div>
                        <div class="example-output" data-i18n="help.algo.multi_replace.example_output"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.algo.multi_replace.settings_title"></h4>
                        <p data-i18n="help.algo.multi_replace.settings_intro"></p>
                        <p><strong data-i18n="help.algo.multi_replace.case_sensitive_title"></strong><br><span data-i18n="help.algo.multi_replace.case_sensitive_off"></span><br><span data-i18n="help.algo.multi_replace.case_sensitive_on"></span></p>
                        <p><strong data-i18n="help.algo.multi_replace.whole_words_title"></strong><br><span data-i18n="help.algo.multi_replace.whole_words_off"></span><br><span data-i18n="help.algo.multi_replace.whole_words_on"></span></p>
                        <h4 data-i18n="help.general.features"></h4>
                        <p><span data-i18n="help.algo.multi_replace.feature1"></span><br><span data-i18n="help.algo.multi_replace.feature2"></span></p>
                    </div>
                </div>

                <div class="help-subtitle" data-i18n="help.algorithms.logical_operations"></div>

                <div class="algorithm-card" data-node-type="text_router">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);"><i class="fas fa-sitemap"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.text_router.title"></h3>
                            <p data-i18n="help.algo.text_router.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.text_router.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.text_router.conditions_title"></h4>
                        <div class="example-input" data-i18n="help.algo.text_router.condition1"></div>
                        <div class="example-input" data-i18n="help.algo.text_router.condition2"></div>
                        <div class="example-input" data-i18n="help.algo.text_router.condition3"></div>
                        <div class="example-input" data-i18n="help.algo.text_router.condition4"></div>
                        <div class="example-input" data-i18n="help.algo.text_router.condition5"></div>
                        <div class="example-output" data-i18n="help.algo.text_router.usage_tip"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p><span data-i18n="help.algo.text_router.feature1"></span><br><span data-i18n="help.algo.text_router.feature2"></span><br><span data-i18n="help.algo.text_router.feature3"></span></p>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="stream_merger">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #10b981, #059669);"><i class="fas fa-link"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.stream_merger.title"></h3>
                            <p data-i18n="help.algo.stream_merger.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.stream_merger.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.stream_merger.methods_title"></h4>
                        <div class="example-input" data-i18n="help.algo.stream_merger.method1_title"></div>
                        <div class="example-output" data-i18n="help.algo.stream_merger.method1_example"></div>
                        <div class="example-input" data-i18n="help.algo.stream_merger.method2_title"></div>
                        <div class="example-output" data-i18n="help.algo.stream_merger.method2_example"></div>
                        <div class="example-input" data-i18n="help.algo.stream_merger.method3_title"></div>
                        <div class="example-output" data-i18n="help.algo.stream_merger.method3_example"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p><span data-i18n="help.algo.stream_merger.feature1"></span><br><span data-i18n="help.algo.stream_merger.feature2"></span><br><span data-i18n="help.algo.stream_merger.feature3"></span></p>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="stream_splitter">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #9333ea, #7c3aed);"><i class="fas fa-cut"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.stream_splitter.title"></h3>
                            <p data-i18n="help.algo.stream_splitter.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.stream_splitter.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.stream_splitter.methods_title"></h4>
                        <div class="example-input" data-i18n="help.algo.stream_splitter.method1_title"></div>
                        <div class="example-output" data-i18n="help.algo.stream_splitter.method1_example"></div>
                        <div class="example-input" data-i18n="help.algo.stream_splitter.method2_title"></div>
                        <div class="example-output" data-i18n="help.algo.stream_splitter.method2_example"></div>
                        <div class="example-input" data-i18n="help.algo.stream_splitter.method3_title"></div>
                        <div class="example-output" data-i18n="help.algo.stream_splitter.method3_example"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p><span data-i18n="help.algo.stream_splitter.feature1"></span><br><span data-i18n="help.algo.stream_splitter.feature2"></span><br><span data-i18n="help.algo.stream_splitter.feature3"></span></p>
                    </div>
                </div>

                <div class="help-subtitle" data-i18n="help.algorithms.modern_ciphers"></div>

                <div class="algorithm-card" data-node-type="atbash_cipher">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #ec4899, #db2777);"><i class="fas fa-retweet"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.atbash.title"></h3>
                            <p data-i18n="help.algo.atbash.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.atbash.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.atbash.example_title"></h4>
                        <div class="example-input" data-i18n="help.algo.atbash.example_input"></div>
                        <div class="example-output" data-i18n="help.algo.atbash.example_output"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p><span data-i18n="help.algo.atbash.feature1"></span><br><span data-i18n="help.algo.atbash.feature2"></span><br><span data-i18n="help.algo.atbash.feature3"></span></p>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="base64">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);"><i class="fas fa-file-export"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.base64.title"></h3>
                            <p data-i18n="help.algo.base64.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.base64.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.base64.example_title"></h4>
                        <div class="example-input" data-i18n="help.algo.base64.example_input"></div>
                        <div class="example-output" data-i18n="help.algo.base64.example_output"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p><span data-i18n="help.algo.base64.feature1"></span><br><span data-i18n="help.algo.base64.feature2"></span><br><span data-i18n="help.algo.base64.feature3"></span></p>
                    </div>
                </div>

                <div class="help-subtitle" data-i18n="help.algorithms.fun_ciphers"></div>

                <div class="algorithm-card" data-node-type="shark_cipher">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #06b6d4, #0891b2);"><i class="fas fa-fish"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.shark.title"></h3>
                            <p data-i18n="help.algo.shark.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.shark.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.shark.lang_support_title"></h4>
                        <p data-i18n="help.algo.shark.lang_support_desc"></p>
                        <div class="example-input" data-i18n="help.algo.shark.lang_ru"></div>
                        <div class="example-input" data-i18n="help.algo.shark.lang_en"></div>
                        <h4 data-i18n="help.algo.shark.example_ru_title"></h4>
                        <div class="example-input" data-i18n="help.algo.shark.example_ru_1"></div>
                        <div class="example-input" data-i18n="help.algo.shark.example_ru_2"></div>
                        <div class="example-input" data-i18n="help.algo.shark.example_ru_3"></div>
                        <div class="example-output" data-i18n="help.algo.shark.example_ru_result"></div>
                        <h4 data-i18n="help.algo.shark.example_en_title"></h4>
                        <div class="example-input" data-i18n="help.algo.shark.example_en_input"></div>
                        <div class="example-output" style="white-space: pre-wrap;" data-i18n="help.algo.shark.example_en_result"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p><span data-i18n="help.algo.shark.feature1"></span><br><span data-i18n="help.algo.shark.feature2"></span><br><span data-i18n="help.algo.shark.feature3"></span></p>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="uwu_cipher">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #f472b6, #ec4899);"><i class="fas fa-grin-stars"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.uwu.title"></h3>
                            <p data-i18n="help.algo.uwu.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.uwu.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.uwu.rules_title"></h4>
                        <div class="example-input" data-i18n="help.algo.uwu.rule1"></div>
                        <div class="example-input" data-i18n="help.algo.uwu.rule2"></div>
                        <div class="example-input" data-i18n="help.algo.uwu.rule3"></div>
                        <h4 data-i18n="help.algo.uwu.example_title"></h4>
                        <div class="example-input" data-i18n="help.algo.uwu.example_input"></div>
                        <div class="example-output" data-i18n="help.algo.uwu.example_output"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.algo.uwu.data_loss_title"></h4>
                        <p data-i18n="help.algo.uwu.data_loss_desc"></p>
                    </div>
                </div>
                
                <div class="help-subtitle" data-i18n="help.algorithms.utilities"></div>

                <div class="algorithm-card" data-node-type="monitor">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #64748b, #475569);"><i class="fas fa-desktop"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.monitor.title"></h3>
                            <p data-i18n="help.algo.monitor.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.monitor.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.monitor.usage_title"></h4>
                        <div class="example-input" data-i18n="help.algo.monitor.usage_desc"></div>
                        <div class="example-output" data-i18n="help.algo.monitor.result"></div>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="comment">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #9ca3af, #6b7280);"><i class="fas fa-comment-alt"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.comment.title"></h3>
                            <p data-i18n="help.algo.comment.desc"></p>
                        </div>
                    </div>
                    <p><strong data-i18n="help.general.principle"></strong> <span data-i18n="help.algo.comment.principle"></span></p>
                    <div class="example-box">
                        <h4 data-i18n="help.algo.comment.usage_title"></h4>
                        <div class="example-input" data-i18n="help.algo.comment.usage_step1"></div>
                        <div class="example-input" data-i18n="help.algo.comment.usage_step2"></div>
                        <div class="example-input" data-i18n="help.algo.comment.usage_step3"></div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p><span data-i18n="help.algo.comment.feature1"></span><br><span data-i18n="help.algo.comment.feature2"></span><br><span data-i18n="help.algo.comment.feature3"></span></p>
                    </div>
                </div>
            </div>
        `;
    }

     getDataLossSection() {
        return `
            <div id="help-data-loss" class="help-section">
                <div class="help-title">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span data-i18n="help.dataloss.title"></span>
                </div>

                <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 2rem;" data-i18n="help.dataloss.intro"></p>

                <div class="data-loss-warning">
                    <h4 data-i18n="help.dataloss.general_loss_title"></h4>
                    <p data-i18n="help.dataloss.general_loss_desc"></p>
                </div>

                <div class="help-subtitle" data-i18n="help.dataloss.by_algo_subtitle"></div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);"><i class="fas fa-broadcast-tower"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.morse_code"></h3>
                            <p data-i18n="help.dataloss.morse.issue"></p>
                        </div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p data-i18n="help.dataloss.morse.desc"></p>
                        <p data-i18n="help.dataloss.morse.solution"></p>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.dataloss.morse.example_title"></h4>
                        <div class="example-input" data-i18n="help.dataloss.morse.example_input"></div>
                        <div class="example-output" data-i18n="help.dataloss.morse.example_output"></div>
                    </div>
                </div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);"><i class="fas fa-sort-numeric-up"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.a1z26"></h3>
                            <p data-i18n="help.dataloss.a1z26.issue"></p>
                        </div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p data-i18n="help.dataloss.a1z26.desc1"></p>
                        <p data-i18n="help.dataloss.a1z26.desc2"></p>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.dataloss.a1z26.example_title"></h4>
                        <div class="example-input" data-i18n="help.dataloss.a1z26.example1"></div>
                        <div class="example-input" data-i18n="help.dataloss.a1z26.example2"></div>
                    </div>
                </div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #84cc16, #65a30d);"><i class="fas fa-hashtag"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.numbers_to_words.title"></h3>
                            <p data-i18n="help.dataloss.numbers.issue"></p>
                        </div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p data-i18n="help.dataloss.numbers.desc"></p>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.dataloss.numbers.example_title"></h4>
                        <div class="example-input" data-i18n="help.dataloss.numbers.example_input"></div>
                        <div class="example-output" data-i18n="help.dataloss.numbers.example_output"></div>
                        <div style="color: var(--error); margin-top: 0.5rem;" data-i18n="help.dataloss.numbers.example_conclusion"></div>
                    </div>
                </div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #facc15, #eab308);"><i class="fas fa-calculator"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.math.title"></h3>
                            <p data-i18n="help.dataloss.math.issue"></p>
                        </div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p data-i18n="help.dataloss.math.desc"></p>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.dataloss.math.example_title"></h4>
                        <div class="example-input" data-i18n="help.dataloss.math.example_op"></div>
                        <div class="example-input" data-i18n="help.dataloss.math.example_result"></div>
                    </div>
                </div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #f472b6, #ec4899);"><i class="fas fa-grin-stars"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.uwu.title"></h3>
                            <p data-i18n="help.dataloss.uwu.issue"></p>
                        </div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p data-i18n="help.dataloss.uwu.desc"></p>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.dataloss.uwu.example_title"></h4>
                        <div class="example-input" data-i18n="help.dataloss.uwu.example_input"></div>
                        <div class="example-input" data-i18n="help.dataloss.uwu.example_output"></div>
                    </div>
                </div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #06b6d4, #0891b2);"><i class="fas fa-fish"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.shark.title"></h3>
                            <p data-i18n="help.dataloss.shark.issue"></p>
                        </div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p data-i18n="help.dataloss.shark.desc"></p>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.dataloss.shark.example_title"></h4>
                        <div class="example-input" data-i18n="help.dataloss.shark.example_input"></div>
                        <div class="example-output" data-i18n="help.dataloss.shark.example_output"></div>
                    </div>
                </div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #10b981, #059669);"><i class="fas fa-link"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.stream_merger.title"></h3>
                            <p data-i18n="help.dataloss.merger.issue"></p>
                        </div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p data-i18n="help.dataloss.merger.desc"></p>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.dataloss.merger.example_title"></h4>
                        <div class="example-input" data-i18n="help.dataloss.merger.example_input_a"></div>
                        <div class="example-input" data-i18n="help.dataloss.merger.example_input_b"></div>
                        <div class="example-output" data-i18n="help.dataloss.merger.example_output"></div>
                    </div>
                </div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);"><i class="fas fa-exchange-alt"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.algo.multi_replace.title"></h3>
                            <p data-i18n="help.dataloss.replace.issue"></p>
                        </div>
                    </div>
                    <div class="data-loss-warning">
                        <h4 data-i18n="help.general.features"></h4>
                        <p data-i18n="help.dataloss.replace.desc"></p>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.dataloss.replace.example_title"></h4>
                        <div class="example-input" data-i18n="help.dataloss.replace.example_rules"></div>
                        <div class="example-input" data-i18n="help.dataloss.replace.example_input"></div>
                        <div class="example-output" data-i18n="help.dataloss.replace.example_conclusion"></div>
                    </div>
                </div>

            </div>
        `;
    }

    getExamplesSection() {
        return `
            <div id="help-examples" class="help-section">
                <div class="help-title">
                    <i class="fas fa-lightbulb"></i>
                    <span data-i18n="help.examples.usage_title"></span>
                </div>

                <div class="help-subtitle" data-i18n="help.examples.simple_schemes"></div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #10b981, #059669);"><i class="fas fa-play"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.examples.basic_encryption.title"></h3>
                            <p data-i18n="help.examples.basic_encryption.desc"></p>
                        </div>
                    </div>
                    <p data-i18n="help.examples.basic_encryption.principle"></p>
                    <div class="example-box">
                        <h4 data-i18n="help.examples.basic_encryption.scheme_title"></h4>
                        <div class="example-input" data-i18n="help.examples.basic_encryption.scheme_desc"></div>
                        <div class="example-output" data-i18n="help.examples.basic_encryption.scheme_result"></div>
                        <button class="example-load-btn" onclick="window.helpSystem.loadExample('simple-caesar')">
                            <i class="fas fa-download"></i> <span data-i18n="help.examples.load_button"></span>
                        </button>
                    </div>
                </div>

                <div class="help-subtitle" data-i18n="help.examples.complex_schemes"></div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);"><i class="fas fa-link"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.examples.multilevel.title"></h3>
                            <p data-i18n="help.examples.multilevel.desc"></p>
                        </div>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.examples.multilevel.scheme_title"></h4>
                        <div class="example-input" data-i18n="help.examples.multilevel.scheme_desc"></div>
                        <div class="example-output" data-i18n="help.examples.multilevel.scheme_result"></div>
                        <button class="example-load-btn" onclick="window.helpSystem.loadExample('multilevel-encryption')">
                            <i class="fas fa-download"></i> <span data-i18n="help.examples.load_button"></span>
                        </button>
                    </div>
                </div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #ec4899, #db2777);"><i class="fas fa-key"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.examples.vigenere.title"></h3>
                            <p data-i18n="help.examples.vigenere.desc"></p>
                        </div>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.examples.vigenere.scheme_title"></h4>
                        <div class="example-input" data-i18n="help.examples.vigenere.scheme_desc"></div>
                        <div class="example-output" data-i18n="help.examples.vigenere.scheme_result"></div>
                        <button class="example-load-btn" onclick="window.helpSystem.loadExample('vigenere-with-secret')">
                            <i class="fas fa-download"></i> <span data-i18n="help.examples.load_button"></span>
                        </button>
                    </div>
                </div>

                <div class="help-subtitle" data-i18n="help.examples.creative_uses"></div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #22d3ee, #06b6d4);"><i class="fas fa-globe"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.examples.geo.title"></h3>
                            <p data-i18n="help.examples.geo.desc"></p>
                        </div>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.examples.geo.scheme_title"></h4>
                        <div class="example-input" data-i18n="help.examples.geo.scheme_desc"></div>
                        <div class="example-output" data-i18n="help.examples.geo.scheme_result"></div>
                        <button class="example-load-btn" onclick="window.helpSystem.loadExample('planet-enchanter')">
                            <i class="fas fa-download"></i> <span data-i18n="help.examples.load_button"></span>
                        </button>
                    </div>
                    <p data-i18n="help.examples.geo.tip"></p>
                </div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #f472b6, #ec4899);"><i class="fas fa-cat"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.examples.fun.title"></h3>
                            <p data-i18n="help.examples.fun.desc"></p>
                        </div>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.examples.fun.scheme_title"></h4>
                        <div class="example-input" data-i18n="help.examples.fun.scheme_desc"></div>
                        <div class="example-output" data-i18n="help.examples.fun.scheme_result"></div>
                        <button class="example-load-btn" onclick="window.helpSystem.loadExample('cat-morse')">
                            <i class="fas fa-download"></i> <span data-i18n="help.examples.load_button"></span>
                        </button>
                    </div>
                    <p data-i18n="help.examples.fun.tip"></p>
                </div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #64748b, #475569);"><i class="fas fa-desktop"></i></div>
                        <div class="algorithm-info">
                            <h3 data-i18n="help.examples.debug.title"></h3>
                            <p data-i18n="help.examples.debug.desc"></p>
                        </div>
                    </div>
                    <div class="example-box">
                        <h4 data-i18n="help.examples.debug.scheme_title"></h4>
                        <div class="example-input" data-i18n="help.examples.debug.scheme_desc"></div>
                        <div class="example-output" data-i18n="help.examples.debug.scheme_result"></div>
                        <button class="example-load-btn" onclick="window.helpSystem.loadExample('monitoring-chain')">
                            <i class="fas fa-download"></i> <span data-i18n="help.examples.load_button"></span>
                        </button>
                    </div>
                    <p data-i18n="help.examples.debug.tip"></p>
                </div>
            </div>
        `;
    }

    getHotkeysSection() {
        return `
            <div id="help-hotkeys" class="help-section">
                <div class="help-title">
                    <i class="fas fa-keyboard"></i>
                    <span data-i18n="help.hotkeys.title"></span>
                </div>

                <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 2rem;" data-i18n="help.hotkeys.intro"></p>

                <div class="help-subtitle" data-i18n="help.hotkeys.file_management"></div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #10b981, #059669);"><i class="fas fa-save"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="hotkey.save"></h3>
                                <p data-i18n="help.hotkeys.save_desc"></p>
                            </div>
                        </div>
                    </div>
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);"><i class="fas fa-folder-open"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="hotkey.load"></h3>
                                <p data-i18n="help.hotkeys.load_desc"></p>
                            </div>
                        </div>
                    </div>
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #6366f1, #4f46e5);"><i class="fas fa-file"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="hotkey.new"></h3>
                                <p data-i18n="help.hotkeys.new_desc"></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="help-subtitle" data-i18n="help.hotkeys.node_management"></div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #ec4899, #db2777);"><i class="fas fa-copy"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="hotkey.copy"></h3>
                                <p data-i18n="help.hotkeys.copy_desc"></p>
                            </div>
                        </div>
                    </div>
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);"><i class="fas fa-paste"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="hotkey.paste"></h3>
                                <p data-i18n="help.hotkeys.paste_desc"></p>
                            </div>
                        </div>
                    </div>
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #14b8a6, #0d9488);"><i class="fas fa-check-square"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="hotkey.select_all"></h3>
                                <p data-i18n="help.hotkeys.select_all_desc"></p>
                            </div>
                        </div>
                    </div>
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);"><i class="fas fa-trash"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="hotkey.delete"></h3>
                                <p data-i18n="help.hotkeys.delete_desc"></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="help-subtitle" data-i18n="help.hotkeys.history"></div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #84cc16, #65a30d);"><i class="fas fa-undo"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="hotkey.undo"></h3>
                                <p data-i18n="help.hotkeys.undo_desc"></p>
                            </div>
                        </div>
                    </div>
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #fb923c, #f97316);"><i class="fas fa-redo"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="hotkey.redo"></h3>
                                <p data-i18n="help.hotkeys.redo_desc"></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="help-subtitle" data-i18n="help.hotkeys.canvas_management"></div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #22d3ee, #06b6d4);"><i class="fas fa-search-plus"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="hotkey.zoom_in"></h3>
                                <p data-i18n="help.hotkeys.zoom_in_desc"></p>
                            </div>
                        </div>
                    </div>
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #a855f7, #9333ea);"><i class="fas fa-search-minus"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="hotkey.zoom_out"></h3>
                                <p data-i18n="help.hotkeys.zoom_out_desc"></p>
                            </div>
                        </div>
                    </div>
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #f87171, #ef4444);"><i class="fas fa-expand-arrows-alt"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="hotkey.zoom_reset"></h3>
                                <p data-i18n="help.hotkeys.zoom_reset_desc"></p>
                            </div>
                        </div>
                    </div>
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #64748b, #475569);"><i class="fas fa-cut"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="hotkey.cut_mode"></h3>
                                <p data-i18n="help.hotkeys.cut_mode_desc"></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="help-subtitle" data-i18n="help.hotkeys.general_commands"></div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #facc15, #eab308);"><i class="fas fa-question"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="hotkey.help"></h3>
                                <p data-i18n="help.hotkeys.help_desc"></p>
                            </div>
                        </div>
                    </div>
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #9ca3af, #6b7280);"><i class="fas fa-times"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="hotkey.escape"></h3>
                                <p data-i18n="help.hotkeys.escape_desc"></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="help-subtitle" data-i18n="help.hotkeys.additional"></div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #22d3ee, #06b6d4);"><i class="fas fa-mouse-pointer"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="help.hotkeys.break_connection_title">Shift + ПКМ</h3>
                                <p data-i18n="help.hotkeys.break_connection"></p>
                            </div>
                        </div>
                    </div>
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #f472b6, #ec4899);"><i class="fas fa-arrows-alt"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="help.hotkeys.zoom_wheel_title">Колесо мыши</h3>
                                <p data-i18n="help.hotkeys.zoom_wheel"></p>
                            </div>
                        </div>
                    </div>
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #84cc16, #65a30d);"><i class="fas fa-hand-paper"></i></div>
                            <div class="algorithm-info">
                                <h3 data-i18n="help.hotkeys.pan_title">Средняя кнопка / ПКМ</h3>
                                <p data-i18n="help.hotkeys.pan"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Создаем глобальный экземпляр системы справки
window.helpSystem = new HelpSystem();

// Функция для показа справки (совместимость с существующим кодом)
window.showHelp = () => {
    window.helpSystem.show();
};

// Функция для показа справки по конкретному ноду
window.showNodeHelp = (nodeType) => {
    // 1. Показываем общее окно справки
    window.helpSystem.show();

    // 2. Используем setTimeout, чтобы дать DOM время на обновление после вызова .show()
    setTimeout(() => {
        // Переключаемся на раздел с описанием алгоритмов
        window.helpSystem.switchSection('algorithms');

        // 3. Используем еще один setTimeout с большей задержкой.
        // Это необходимо, чтобы дождаться окончания CSS-анимации появления раздела (которая длится 0.5с).
        // Без этого, браузер пытается прокрутить к элементу, который еще не полностью видим и спозиционирован.
        setTimeout(() => {
            const helpContent = document.querySelector('.help-content');
            const nodeCard = helpContent?.querySelector(`[data-node-type="${nodeType}"]`);
            
            if (nodeCard) {
                // Прокручиваем к элементу
                nodeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Добавляем эффект подсветки для наглядности
                nodeCard.style.transition = 'all 0.3s ease';
                nodeCard.style.background = 'var(--accent-primary-10)';
                nodeCard.style.borderColor = 'var(--accent-primary)';
                nodeCard.style.boxShadow = '0 0 20px rgba(124, 58, 237, 0.3)';
                
                // Убираем подсветку через 3 секунды
                setTimeout(() => {
                    nodeCard.style.background = '';
                    nodeCard.style.borderColor = '';
                    nodeCard.style.boxShadow = '';
                }, 3000);
            } else {
                console.warn(`Элемент справки для нода "${nodeType}" не найден.`);
            }
        }, 550); 
    }, 50); 
};