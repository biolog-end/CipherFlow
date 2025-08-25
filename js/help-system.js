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
                        <span>Обзор</span>
                    </button>
                    <button class="help-nav-item" data-section="algorithms">
                        <i class="fas fa-cogs"></i>
                        <span>Алгоритмы</span>
                    </button>
                    <button class="help-nav-item" data-section="data-loss">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Потеря данных</span>
                    </button>
                    <button class="help-nav-item" data-section="examples">
                        <i class="fas fa-lightbulb"></i>
                        <span>Примеры</span>
                    </button>
                    <button class="help-nav-item" data-section="hotkeys">
                        <i class="fas fa-keyboard"></i>
                        <span>Горячие клавиши</span>
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
        // Получаем данные примера для отображения имени
        const exampleNames = {
            'simple-caesar': 'Простой шифр Цезаря',
            'vigenere-with-secret': 'Шифр Виженера с секретным словом',
            'multilevel-encryption': 'Многоуровневое шифрование',
            'planet-enchanter': 'Географическое шифрование',
            'cat-morse': 'Забавный кошачий морзе',
            'monitoring-chain': 'Отладка с мониторами'
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
        
        notification.innerHTML = `
            <i class="fas fa-check-circle" style="font-size: 1.2rem;"></i>
            <div>
                <div style="font-weight: 600;">Пример загружен!</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">${exampleNames[exampleName] || exampleName}</div>
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
                    CipherFlow - Визуальное программирование шифров
                </div>
                
                <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 2rem;">
                    CipherFlow позволяет создавать сложные схемы шифрования с помощью визуальных нодов. 
                    Соединяйте алгоритмы в цепочки для создания уникальных методов шифрования.
                </p>

                <div class="animated-diagram">
                    <div class="cipher-animation">ТЕКСТ → ШИФР → РЕЗУЛЬТАТ</div>
                    <div class="progress-dots">
                        <div class="progress-dot"></div>
                        <div class="progress-dot"></div>
                        <div class="progress-dot"></div>
                    </div>
                </div>

                <div class="help-subtitle">Основные возможности</div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                                <i class="fas fa-puzzle-piece"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>Визуальное программирование</h3>
                                <p>Создавайте алгоритмы без кодирования</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                                <i class="fas fa-link"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>Цепочки шифрования</h3>
                                <p>Комбинируйте множество алгоритмов</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                                <i class="fas fa-exchange-alt"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>Реверсивное шифрование</h3>
                                <p>Автоматическое дешифрование</p>
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
                    Алгоритмы шифрования
                </div>

                <div class="help-subtitle">Входные и выходные ноды</div>
                
                <div class="algorithm-card" data-node-type="input">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                            <i class="fas fa-sign-in-alt"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Ввод текста</h3>
                            <p>Источник данных для цепочки шифрования</p>
                        </div>
                    </div>
                    <p><strong>Принцип работы:</strong> Берет текст из общего поля ввода в нижней панели и передает его в цепочку обработки. Является начальной точкой любой схемы шифрования.</p>
                    <div class="example-box">
                        <h4>Использование:</h4>
                        <div class="example-input">1. Введите текст в поле внизу экрана</div>
                        <div class="example-input">2. Соедините выход нода "Ввод текста" со входом следующего алгоритма</div>
                        <div class="example-output">Данные автоматически передаются в цепочку</div>
                    </div>
                    <div class="data-loss-warning">
                        <h4>Особенности</h4>
                        <p>• Только один выход, нет входов<br>• Автоматически обновляется при изменении текста в поле ввода<br>• Может быть несколько нодов ввода в одной схеме</p>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="output">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                            <i class="fas fa-sign-out-alt"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Вывод текста</h3>
                            <p>Отображение результата цепочки шифрования</p>
                        </div>
                    </div>
                    <p><strong>Принцип работы:</strong> Получает обработанные данные и отображает их в поле вывода в нижней панели. Является конечной точкой схемы шифрования.</p>
                    <div class="example-box">
                        <h4>Использование:</h4>
                        <div class="example-input">1. Соедините вход нода "Вывод текста" с выходом последнего алгоритма</div>
                        <div class="example-input">2. Результат автоматически появится в поле вывода внизу экрана</div>
                        <div class="example-output">Можно копировать результат из поля вывода</div>
                    </div>
                    <div class="data-loss-warning">
                        <h4>Особенности</h4>
                        <p>• Только один вход, нет выходов<br>• Автоматически обновляется при изменении данных<br>• Может быть несколько нодов вывода для промежуточных результатов</p>
                    </div>
                </div>

                <div class="help-subtitle">Классические шифры</div>
                
                <div class="algorithm-card" data-node-type="caesar">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #6366f1, #4f46e5);">
                            <i class="fas fa-exchange-alt"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Шифр Цезаря</h3>
                            <p>Сдвиг каждой буквы алфавита на фиксированное количество позиций</p>
                        </div>
                    </div>
                    <p><strong>Принцип работы:</strong> Каждая буква текста заменяется буквой, стоящей в алфавите на N позиций дальше (с циклическим переносом).</p>
                    <div class="example-box">
                        <h4>Пример (сдвиг +3):</h4>
                        <div class="example-input">Вход: ПРИВЕТ</div>
                        <div class="example-output">Выход: ТУЛГЖХ (П→Т, Р→У, И→Л, В→Г, Е→Ж, Т→Х)</div>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="morse">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                            <i class="fas fa-broadcast-tower"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Код Морзе</h3>
                            <p>Представление текста в виде последовательности точек и тире</p>
                        </div>
                    </div>
                    <p><strong>Принцип работы:</strong> Каждая буква, цифра и знак препинания кодируется уникальной комбинацией коротких (точка) и длинных (тире) сигналов.</p>
                    
                    <div class="example-box">
                        <h4>Различия символов для языков:</h4>
                        <div class="example-input"><strong>Русский:</strong> · (Unicode точка) и − (Unicode тире)</div>
                        <div class="example-input"><strong>Английский:</strong> . (ASCII точка) и - (ASCII дефис)</div>
                        <div class="example-output">Это позволяет различать язык при декодировании смешанного текста</div>
                    </div>
                    
                    <div class="example-box">
                        <h4>Пример кодирования:</h4>
                        <div class="example-input">Вход: "ПРИВЕТ SOS"</div>
                        <div class="example-output">Выход: ·−−· ·−· ·· ·−·· · ·− ... --- ...</div>
                        <div class="example-output">Русские буквы: ·−, английские: .--</div>
                    </div>
                    
                    <div class="data-loss-warning">
                        <h4>Настройка поддержки Ё</h4>
                        <p>По умолчанию Ё кодируется как Е (·). Включите переключатель "Поддержка Ё" для отдельного кода ··−··</p>
                        <div class="example-input">Без поддержки: ЁЛЬ → · ·−·· ·−··−</div>
                        <div class="example-input">С поддержкой: ЁЛЬ → ··−·· ·−·· ·−··−</div>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="braille-cat">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #f472b6, #ec4899);">
                            <i class="fas fa-cat"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Морзе (Кошачий)</h3>
                            <p>Забавный вариант кода Морзе с кошачьими звуками</p>
                        </div>
                    </div>
                    <p><strong>Принцип работы:</strong> Сначала текст кодируется в обычный код Морзе, затем символы заменяются на кошачьи звуки.</p>
                    <div class="example-box">
                        <h4>Замены:</h4>
                        <div class="example-input">· (точка) → мяy</div>
                        <div class="example-input">− (тире) → мрряy</div>
                        <div class="example-input">/ (пробел между словами) → брряy</div>
                    </div>
                    <div class="example-box">
                        <h4>Пример кодирования:</h4>
                        <div class="example-input">Вход: КОТ</div>
                        <div class="example-output">Морзе: −·− −−− −</div>
                        <div class="example-output">Кошачий: мрряyмяy мрряyмрряyмрряy мрряy</div>
                    </div>
                    <div class="data-loss-warning">
                        <h4>Поддержка Ё в кошачьем морзе</h4>
                        <p>Также поддерживается переключатель Ё, как в обычном морзе</p>
                        <div class="example-input">Ё с поддержкой → мяyмяyмрряyмяyмяy</div>
                    </div>
                </div>

                <div class="help-subtitle">Преобразования</div>

                <div class="algorithm-card" data-node-type="a1z26">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #14b8a6, #0d9488);">
                            <i class="fas fa-sort-numeric-up"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>A1Z26 (Позиционный шифр)</h3>
                            <p>Замена букв на их порядковые номера в алфавите</p>
                        </div>
                    </div>
                    <p><strong>Принцип работы:</strong> Каждая буква заменяется на её номер в алфавите (А=1, Б=2, ..., Я=33).</p>
                    <div class="example-box">
                        <h4>Пример:</h4>
                        <div class="example-input">Вход: КОТ</div>
                        <div class="example-output">Выход: 12-16-20 (К=12, О=16, Т=20)</div>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="vigenere">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #ec4899, #db2777);">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Шифр Виженера</h3>
                            <p>Полиалфавитный шифр с ключевым словом</p>
                        </div>
                    </div>
                    <p><strong>Принцип работы:</strong> Каждая буква текста сдвигается на количество позиций, соответствующее букве ключа в том же положении.</p>
                    <div class="example-box">
                        <h4>Пример (ключ: КОТ):</h4>
                        <div class="example-input">Текст: ПРИВЕТ</div>
                        <div class="example-input">Ключ: КОТКО(Т)</div>
                        <div class="example-output">Результат: П+К=Э, Р+О=Е, И+Т=Б, В+К=И, Е+О=С, Т+Т=М → ЕБИСМ</div>
                    </div>
                    <div class="data-loss-warning">
                        <h4>Особенности</h4>
                        <p>• Имеет два входа: текст и ключ<br>• Ключ повторяется циклически<br>• Устойчив к частотному анализу</p>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="secret-word">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #f87171, #ef4444);">
                            <i class="fas fa-key"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Секретное слово</h3>
                            <p>Генератор ключевых слов для других алгоритмов</p>
                        </div>
                    </div>
                    <p><strong>Принцип работы:</strong> Создает ключевое слово, которое можно использовать в шифрах типа Виженер.</p>
                    <div class="example-box">
                        <h4>Пример:</h4>
                        <div class="example-input">Секретное слово: ТАЙНА</div>
                        <div class="example-output">Использование: подключить к ключевому входу Виженера</div>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="numbers-to-words">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #84cc16, #65a30d);">
                            <i class="fas fa-hashtag"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Числа в слова</h3>
                            <p>Преобразование цифр в словесное представление</p>
                        </div>
                    </div>
                    <p><strong>Принцип работы:</strong> Заменяет цифры в тексте на их словесное представление на выбранном языке.</p>
                    <div class="example-box">
                        <h4>Пример (русский):</h4>
                        <div class="example-input">Вход: У меня 5 котов и 12 собак</div>
                        <div class="example-output">Выход: У меня пять котов и двенадцать собак</div>
                    </div>
                    <div class="example-box">
                        <h4>Пример (английский):</h4>
                        <div class="example-input">Вход: I have 7 cats</div>
                        <div class="example-output">Выход: I have seven cats</div>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="math">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #facc15, #eab308);">
                            <i class="fas fa-calculator"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Математика</h3>
                            <p>Арифметические операции над числами в тексте</p>
                        </div>
                    </div>
                    <p><strong>Принцип работы:</strong> Находит числа в тексте и выполняет над ними выбранную математическую операцию.</p>
                    <div class="example-box">
                        <h4>Пример (умножение на 2):</h4>
                        <div class="example-input">Вход: У меня 5 котов и 12 собак</div>
                        <div class="example-output">Выход: У меня 10 котов и 24 собак</div>
                    </div>
                    <div class="data-loss-warning">
                        <h4>Доступные операции</h4>
                        <p>• Сложение/вычитание константы<br>• Умножение/деление<br>• Возведение в степень</p>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="reverse">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #fb923c, #f97316);">
                            <i class="fas fa-undo"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Обратить текст</h3>
                            <p>Реверс всего текста или отдельных слов</p>
                        </div>
                    </div>
                    <p><strong>Принцип работы:</strong> Изменяет порядок символов в тексте в обратном направлении.</p>
                    <div class="example-box">
                        <h4>Режим "Весь текст":</h4>
                        <div class="example-input">Вход: ПРИВЕТ МИР</div>
                        <div class="example-output">Выход: РИМ ТЕВИРП</div>
                    </div>
                    <div class="example-box">
                        <h4>Режим "По словам":</h4>
                        <div class="example-input">Вход: ПРИВЕТ МИР</div>
                        <div class="example-output">Выход: ТЕВИРП РИМ</div>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="case-transform">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #c084fc, #a855f7);">
                            <i class="fas fa-text-height"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Регистр</h3>
                            <p>Изменение регистра букв в тексте</p>
                        </div>
                    </div>
                    <p><strong>Принцип работы:</strong> Преобразует регистр букв согласно выбранному режиму.</p>
                    <div class="example-box">
                        <h4>Доступные режимы:</h4>
                        <div class="example-input">Верхний: привет → ПРИВЕТ</div>
                        <div class="example-input">Нижний: ПРИВЕТ → привет</div>
                        <div class="example-input">Заглавные: привет мир → Привет Мир</div>
                        <div class="example-input">Инвертировать: ПрИвЕт → пРиВеТ</div>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="binary">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                            <i class="fas fa-microchip"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Бинарный код</h3>
                            <p>Представление текста в двоичной системе</p>
                        </div>
                    </div>
                    <p><strong>Принцип работы:</strong> Каждый символ кодируется в его ASCII/UTF-8 представление в двоичной системе.</p>
                    <div class="example-box">
                        <h4>Пример:</h4>
                        <div class="example-input">Вход: A</div>
                        <div class="example-output">Выход: 01000001 (ASCII 65)</div>
                    </div>
                    <div class="data-loss-warning">
                        <h4>Особенности</h4>
                        <p>• Кириллица требует UTF-8 (более длинные коды)<br>• Результат может быть очень длинным</p>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="monitor">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #64748b, #475569);">
                            <i class="fas fa-desktop"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Монитор</h3>
                            <p>Промежуточный просмотр данных в цепочке</p>
                        </div>
                    </div>
                    <p><strong>Принцип работы:</strong> Отображает проходящие через него данные без изменения, позволяя отслеживать промежуточные результаты.</p>
                    <div class="example-box">
                        <h4>Использование:</h4>
                        <div class="example-input">Установите между алгоритмами для отладки</div>
                        <div class="example-output">Данные проходят без изменений</div>
                    </div>
                </div>

                <div class="algorithm-card" data-node-type="planet-enchanter">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #22d3ee, #06b6d4);">
                            <i class="fas fa-globe"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Зачаровыватель планет</h3>
                            <p>Уникальный шифр через координаты городов мира</p>
                        </div>
                    </div>
                    <p><strong>Принцип работы:</strong> Каждая буква заменяется координатами случайного города, название которого начинается на эту букву.</p>
                    <div class="example-box">
                        <h4>Пример:</h4>
                        <div class="example-input">Вход: МИР</div>
                        <div class="example-output">Выход: 55.7558, 37.6176 (Москва)<br>55.7558, 49.2076 (Иркутск)<br>61.2181, 73.4529 (Рига)</div>
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
                    Потеря информации при шифровании
                </div>

                <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 2rem;">
                    <strong>Важно!</strong> Некоторые алгоритмы шифрования необратимо теряют часть информации. 
                    Это нужно учитывать при создании сложных цепочек шифрования.
                </p>

                <div class="data-loss-warning">
                    <h4>Общая потеря: Регистр букв</h4>
                    <p>Большинство алгоритмов не различают заглавные и строчные буквы. "Привет" и "ПРИВЕТ" будут зашифрованы одинаково.</p>
                </div>

                <div class="help-subtitle">Потери по алгоритмам</div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                            <i class="fas fa-broadcast-tower"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Код Морзе</h3>
                            <p>Потеря различий между Е и Ё</p>
                        </div>
                    </div>
                    <div class="data-loss-warning">
                        <h4>Потеря информации</h4>
                        <p>По умолчанию Ё кодируется как Е. При дешифровке невозможно определить, какая буква была изначально.</p>
                        <p><strong>Решение:</strong> Включите переключатель "Поддержка Ё" для отдельного кода.</p>
                    </div>
                    <div class="example-box">
                        <h4>Проблемный пример:</h4>
                        <div class="example-input">Вход: "ЕЛЬ" и "ЁЛЬ"</div>
                        <div class="example-output">Выход: "· ·−·· ·−··−" (одинаковый результат)</div>
                    </div>
                </div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                            <i class="fas fa-sort-numeric-up"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>A1Z26</h3>
                            <p>Потеря чисел и проблемы с многоязычностью</p>
                        </div>
                    </div>
                    <div class="data-loss-warning">
                        <h4>Потеря информации</h4>
                        <p>1. Числа меньше длины алфавита (1-33) невозможно отличить от букв при дешифровке.</p>
                        <p>2. При смешивании русского и английского текста дешифровка может стать невозможной.</p>
                    </div>
                    <div class="example-box">
                        <h4>Проблемные примеры:</h4>
                        <div class="example-input">Вход: "А1Б" → "1-1-2" (неоднозначность с числом 1)</div>
                        <div class="example-input">Вход: "CAT КОТ" → смешанный результат, сложный для разделения</div>
                    </div>
                </div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #84cc16, #65a30d);">
                            <i class="fas fa-hashtag"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Числа в слова</h3>
                            <p>Потеря чисел-слов</p>
                        </div>
                    </div>
                    <div class="data-loss-warning">
                        <h4>Потеря информации</h4>
                        <p>Числа от 0 до 9 заменяются словами. Если в тексте уже есть эти слова, при дешифровке невозможно определить, что было изначально - число или слово.</p>
                    </div>
                    <div class="example-box">
                        <h4>Проблемный пример:</h4>
                        <div class="example-input">Вход: "У меня 5 или пять яблок"</div>
                        <div class="example-output">Выход: "У меня пять или пять яблок"</div>
                        <div style="color: var(--error); margin-top: 0.5rem;">При дешифровке неясно, где было число, а где слово</div>
                    </div>
                </div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #facc15, #eab308);">
                            <i class="fas fa-calculator"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Математические операции</h3>
                            <p>Потеря точности при делении</p>
                        </div>
                    </div>
                    <div class="data-loss-warning">
                        <h4>Потеря информации</h4>
                        <p>При делении чисел возможна потеря точности из-за дробных результатов, которые округляются.</p>
                    </div>
                    <div class="example-box">
                        <h4>Проблемный пример:</h4>
                        <div class="example-input">Операция: деление на 3</div>
                        <div class="example-input">Вход: "10" → "3.333..." → "3" (потеря точности)</div>
                    </div>
                </div>

                <div class="help-subtitle">Рекомендации</div>
                <div style="background: var(--accent-primary-10); border: 1px solid var(--accent-primary-30); border-radius: 8px; padding: 1.5rem; margin: 1rem 0;">
                    <h4 style="color: var(--accent-primary); margin: 0 0 1rem 0;">💡 Советы по избежанию потерь:</h4>
                    <ul style="margin: 0; color: var(--text-secondary);">
                        <li>Включайте переключатель "Поддержка Ё" в нодах Морзе</li>
                        <li>Избегайте смешивания языков в A1Z26</li>
                        <li>Осторожно используйте "Числа в слова" с текстами, содержащими числительные</li>
                        <li>Тестируйте цепочки в режиме дешифрования</li>
                        <li>Используйте нод "Монитор" для отслеживания изменений на каждом этапе</li>
                    </ul>
                </div>
            </div>
        `;
    }

    getExamplesSection() {
        return `
            <div id="help-examples" class="help-section">
                <div class="help-title">
                    <i class="fas fa-lightbulb"></i>
                    Примеры использования
                </div>

                <div class="help-subtitle">Простые схемы</div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                            <i class="fas fa-play"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Базовое шифрование</h3>
                            <p>Ввод → Шифр Цезаря → Вывод</p>
                        </div>
                    </div>
                    <p>Самая простая схема для начинающих. Один алгоритм шифрования.</p>
                    <div class="example-box">
                        <h4>Схема:</h4>
                        <div class="example-input">[Ввод текста] → [Шифр Цезаря, сдвиг +3] → [Вывод текста]</div>
                        <div class="example-output">Результат: "ПРИВЕТ" → "ТУЛЖЗЧ"</div>
                        <button class="example-load-btn" onclick="window.helpSystem.loadExample('simple-caesar')">
                            <i class="fas fa-download"></i> Загрузить пример
                        </button>
                    </div>
                </div>

                <div class="help-subtitle">Сложные схемы</div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                            <i class="fas fa-link"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Многоуровневое шифрование</h3>
                            <p>Цепочка из нескольких алгоритмов</p>
                        </div>
                    </div>
                    <div class="example-box">
                        <h4>Схема:</h4>
                        <div class="example-input">[Ввод] → [Регистр: верхний] → [A1Z26] → [Морзе] → [Кошачий морзе] → [Вывод]</div>
                        <div class="example-output">Результат: многослойная защита с преобразованием в кошачьи звуки</div>
                        <button class="example-load-btn" onclick="window.helpSystem.loadExample('multilevel-encryption')">
                            <i class="fas fa-download"></i> Загрузить пример
                        </button>
                    </div>
                </div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #ec4899, #db2777);">
                            <i class="fas fa-key"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Шифрование с ключом (Виженер)</h3>
                            <p>Использование секретного слова</p>
                        </div>
                    </div>
                    <div class="example-box">
                        <h4>Схема:</h4>
                        <div class="example-input">[Ввод текста] → [Текст] ↘<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Шифр Виженера] → [Вывод]<br>[Секретное слово] → [Ключ] ↗</div>
                        <div class="example-output">Результат: полиалфавитное шифрование с вашим секретным словом</div>
                        <button class="example-load-btn" onclick="window.helpSystem.loadExample('vigenere-with-secret')">
                            <i class="fas fa-download"></i> Загрузить пример
                        </button>
                    </div>
                </div>

                <div class="help-subtitle">Творческие применения</div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #22d3ee, #06b6d4);">
                            <i class="fas fa-globe"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Географическое шифрование</h3>
                            <p>Превращение текста в координаты</p>
                        </div>
                    </div>
                    <div class="example-box">
                        <h4>Схема:</h4>
                        <div class="example-input">[Ввод] → [Зачаровыватель планет] → [Вывод]</div>
                        <div class="example-output">Результат: секретное сообщение в виде GPS-координат городов</div>
                        <button class="example-load-btn" onclick="window.helpSystem.loadExample('planet-enchanter')">
                            <i class="fas fa-download"></i> Загрузить пример
                        </button>
                    </div>
                    <p>💡 Можно использовать для создания квестов или головоломок!</p>
                </div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #f472b6, #ec4899);">
                            <i class="fas fa-cat"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Забавное шифрование</h3>
                            <p>Для развлечения и обучения детей</p>
                        </div>
                    </div>
                    <div class="example-box">
                        <h4>Схема:</h4>
                        <div class="example-input">[Ввод] → [Морзе (Кошачий)] → [Вывод]</div>
                        <div class="example-output">Результат: "КОТ" → "мрряyмяy мрряyмрряyмрряy мрряy"</div>
                        <button class="example-load-btn" onclick="window.helpSystem.loadExample('cat-morse')">
                            <i class="fas fa-download"></i> Загрузить пример
                        </button>
                    </div>
                    <p>🐱 Отлично подходит для обучения основам криптографии в игровой форме!</p>
                </div>

                <div class="algorithm-card">
                    <div class="algorithm-header">
                        <div class="algorithm-icon" style="background: linear-gradient(135deg, #64748b, #475569);">
                            <i class="fas fa-desktop"></i>
                        </div>
                        <div class="algorithm-info">
                            <h3>Отладка с мониторами</h3>
                            <p>Отслеживание промежуточных результатов</p>
                        </div>
                    </div>
                    <div class="example-box">
                        <h4>Схема:</h4>
                        <div class="example-input">[Ввод] → [Числа в слова] → [Монитор] + [Цезарь] → [Монитор] + [Реверс] → [Вывод]</div>
                        <div class="example-output">Результат: возможность видеть результат на каждом этапе обработки</div>
                        <button class="example-load-btn" onclick="window.helpSystem.loadExample('monitoring-chain')">
                            <i class="fas fa-download"></i> Загрузить пример
                        </button>
                    </div>
                    <p>🔍 Полезно для понимания того, как работают сложные цепочки алгоритмов!</p>
                </div>
            </div>
        `;
    }

    getHotkeysSection() {
        return `
            <div id="help-hotkeys" class="help-section">
                <div class="help-title">
                    <i class="fas fa-keyboard"></i>
                    Горячие клавиши
                </div>

                <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 2rem;">
                    Быстрое управление приложением с помощью клавиатуры. Поддерживается русская раскладка!
                </p>

                <div class="help-subtitle">Управление файлами</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                                <i class="fas fa-save"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>Ctrl + S (Ctrl + Ы)</h3>
                                <p>Сохранить схему</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                                <i class="fas fa-folder-open"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>Ctrl + O (Ctrl + Щ)</h3>
                                <p>Загрузить схему</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #6366f1, #4f46e5);">
                                <i class="fas fa-file"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>Ctrl + N (Ctrl + Т)</h3>
                                <p>Новая схема</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="help-subtitle">Управление нодами</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #ec4899, #db2777);">
                                <i class="fas fa-copy"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>Ctrl + C (Ctrl + С)</h3>
                                <p>Копировать выделенные ноды</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                                <i class="fas fa-paste"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>Ctrl + V (Ctrl + М)</h3>
                                <p>Вставить ноды</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #14b8a6, #0d9488);">
                                <i class="fas fa-check-square"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>Ctrl + A (Ctrl + Ф)</h3>
                                <p>Выделить все ноды</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                                <i class="fas fa-trash"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>Delete</h3>
                                <p>Удалить выделенные ноды</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="help-subtitle">История изменений</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #84cc16, #65a30d);">
                                <i class="fas fa-undo"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>Ctrl + Z</h3>
                                <p>Отменить действие</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #fb923c, #f97316);">
                                <i class="fas fa-redo"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>Ctrl + Y / Ctrl + Shift + Z</h3>
                                <p>Повторить действие</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="help-subtitle">Управление канвасом</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #22d3ee, #06b6d4);">
                                <i class="fas fa-search-plus"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>+ / = (Ъ)</h3>
                                <p>Увеличить масштаб</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #a855f7, #9333ea);">
                                <i class="fas fa-search-minus"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>-</h3>
                                <p>Уменьшить масштаб</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #f87171, #ef4444);">
                                <i class="fas fa-expand-arrows-alt"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>Ctrl + 0</h3>
                                <p>Сбросить масштаб</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #64748b, #475569);">
                                <i class="fas fa-cut"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>X (Ч)</h3>
                                <p>Режим резки соединений</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="help-subtitle">Общие команды</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #facc15, #eab308);">
                                <i class="fas fa-question"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>F1</h3>
                                <p>Показать эту справку</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="algorithm-card">
                        <div class="algorithm-header">
                            <div class="algorithm-icon" style="background: linear-gradient(135deg, #9ca3af, #6b7280);">
                                <i class="fas fa-times"></i>
                            </div>
                            <div class="algorithm-info">
                                <h3>Escape</h3>
                                <p>Отменить / Снять выделение</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="background: var(--accent-primary-10); border: 1px solid var(--accent-primary-30); border-radius: 8px; padding: 1.5rem; margin: 2rem 0;">
                    <h4 style="color: var(--accent-primary); margin: 0 0 1rem 0;">🌐 Поддержка русской раскладки</h4>
                    <p style="margin: 0; color: var(--text-secondary);">
                        Все горячие клавиши работают с русской раскладкой клавиатуры! В скобках указаны соответствующие русские буквы на тех же клавишах.
                    </p>
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
    window.helpSystem.show();
    // Переключаемся на раздел алгоритмов
    setTimeout(() => {
        window.helpSystem.switchSection('algorithms');
        // Прокручиваем к нужному ноду
        setTimeout(() => {
            const nodeCard = document.querySelector(`[data-node-type="${nodeType}"]`);
            if (nodeCard) {
                nodeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Подсвечиваем карточку
                nodeCard.style.background = 'var(--accent-primary-10)';
                nodeCard.style.borderColor = 'var(--accent-primary)';
                nodeCard.style.boxShadow = '0 0 20px rgba(124, 58, 237, 0.3)';
                
                // Убираем подсветку через 3 секунды
                setTimeout(() => {
                    nodeCard.style.background = '';
                    nodeCard.style.borderColor = '';
                    nodeCard.style.boxShadow = '';
                }, 3000);
            }
        }, 200);
    }, 100);
};