// === Система настроек приложения ===

class SettingsSystem {
    constructor() {
        this.isOpen = false;
        this.settings = this.loadSettings();
        this.initializeStyles();
        this.applySettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('cipherflow-settings');
        return saved ? JSON.parse(saved) : {
            theme: 'dark',
            autoSave: true,
            soundEffects: true,
            soundEffects: true,
            animations: true,
            compactMode: false,
            language: 'ru'
        };
    }

    saveSettings() {
        localStorage.setItem('cipherflow-settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    initializeStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .settings-overlay {
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

            .settings-overlay.show {
                opacity: 1;
                visibility: visible;
            }

            .settings-modal {
                background: var(--bg-primary);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.8) translateY(50px);
                transition: all 0.3s ease;
            }

            .settings-overlay.show .settings-modal {
                transform: scale(1) translateY(0);
            }

            .settings-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 2rem;
                border-bottom: 1px solid var(--border-color);
            }

            .settings-title {
                font-size: 2rem;
                font-weight: 700;
                color: var(--text-primary);
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .settings-close {
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                transition: all 0.2s ease;
                font-size: 1.5rem;
            }

            .settings-close:hover {
                color: var(--error);
                background: rgba(239, 68, 68, 0.1);
            }

            .settings-content {
                padding: 2rem;
            }

            .settings-section {
                margin-bottom: 2rem;
            }

            .settings-section h3 {
                color: var(--accent-primary);
                margin-bottom: 1rem;
                font-size: 1.3rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .setting-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1rem;
                background: var(--bg-secondary);
                border-radius: 12px;
                margin-bottom: 0.75rem;
                transition: all 0.2s ease;
            }

            .setting-item:hover {
                background: var(--bg-tertiary);
                transform: translateX(5px);
            }

            .setting-info {
                flex: 1;
            }

            .setting-info h4 {
                margin: 0 0 0.25rem 0;
                color: var(--text-primary);
                font-size: 1.1rem;
            }

            .setting-info p {
                margin: 0;
                color: var(--text-secondary);
                font-size: 0.9rem;
            }

            .setting-control {
                margin-left: 1rem;
            }

            /* Стили для переключателей */
            .toggle-switch {
                position: relative;
                width: 60px;
                height: 30px;
                background: var(--text-muted);
                border-radius: 15px;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;
            }

            .toggle-switch.active {
                background: var(--accent-primary);
            }

            .toggle-switch::after {
                content: '';
                position: absolute;
                top: 3px;
                left: 3px;
                width: 24px;
                height: 24px;
                background: white;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            }

            .toggle-switch.active::after {
                transform: translateX(30px);
            }

            /* Стили для селектов */
            .setting-select {
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 0.5rem 1rem;
                color: var(--text-primary);
                font-size: 1rem;
                cursor: pointer;
                min-width: 120px;
            }

            .setting-select:focus {
                outline: none;
                border-color: var(--accent-primary);
                box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
            }

            /* Стили для кнопок */
            .settings-button {
                background: var(--accent-primary);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.2s ease;
                margin: 0 0.5rem 0 0;
            }

            .settings-button:hover {
                background: var(--accent-secondary);
                transform: translateY(-2px);
            }

            .settings-button.secondary {
                background: var(--bg-tertiary);
                color: var(--text-primary);
            }

            .settings-button.secondary:hover {
                background: var(--bg-secondary);
            }

            .settings-actions {
                padding: 1.5rem 2rem;
                border-top: 1px solid var(--border-color);
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
            }

            /* Темы */
            .theme-light {
                --bg-primary: #ffffff;
                --bg-secondary: #f8fafc;
                --bg-tertiary: #e2e8f0;
                --text-primary: #1e293b;
                --text-secondary: #64748b;
                --text-muted: #94a3b8;
                --border-color: #e2e8f0;
            }

            .theme-colorful {
                --bg-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                --bg-secondary: rgba(255, 255, 255, 0.1);
                --bg-tertiary: rgba(255, 255, 255, 0.2);
                --text-primary: #ffffff;
                --text-secondary: rgba(255, 255, 255, 0.8);
                --border-color: rgba(255, 255, 255, 0.2);
            }

            /* Анимации */
            .no-animations * {
                animation-duration: 0s !important;
                animation-delay: 0s !important;
                transition-duration: 0s !important;
            }

            /* Компактный режим */
            .compact-mode .canvas-node {
                transform: scale(0.85);
            }

            .compact-mode .nodes-panel {
                width: 200px;
            }

            .compact-mode .node-item {
                padding: 0.5rem;
                font-size: 0.9rem;
            }

            /* Звуковые индикаторы */
            .sound-indicator {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                color: var(--accent-primary);
                font-size: 0.9rem;
                margin-top: 0.5rem;
            }

            .volume-control {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-top: 0.5rem;
            }

            .volume-slider {
                width: 100px;
                height: 4px;
                background: var(--border-color);
                border-radius: 2px;
                outline: none;
                cursor: pointer;
            }

            .volume-slider::-webkit-slider-thumb {
                appearance: none;
                width: 16px;
                height: 16px;
                background: var(--accent-primary);
                border-radius: 50%;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    show() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.createSettingsModal();
    }

    hide() {
        if (!this.isOpen) return;
        this.isOpen = false;
        const overlay = document.querySelector('.settings-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        }
    }

    createSettingsModal() {
        const overlay = document.createElement('div');
        overlay.className = 'settings-overlay';
        
        overlay.innerHTML = `
            <div class="settings-modal">
                <div class="settings-header">
                    <div class="settings-title">
                        <i class="fas fa-cog"></i>
                        Настройки
                    </div>
                    <button class="settings-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="settings-content">
                    ${this.generateSettingsContent()}
                </div>
                <div class="settings-actions">
                    <button class="settings-button secondary" onclick="window.settingsSystem.resetSettings()">
                        <i class="fas fa-undo"></i>
                        Сбросить
                    </button>
                    <button class="settings-button" onclick="window.settingsSystem.hide()">
                        <i class="fas fa-save"></i>
                        Сохранить
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        
        // Показываем с анимацией
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });

        // Обработчики событий
        overlay.querySelector('.settings-close').onclick = () => this.hide();
        overlay.onclick = (e) => {
            if (e.target === overlay) this.hide();
        };

        // Инициализируем контролы
        this.initializeControls();

        // Закрытие по ESC
        document.addEventListener('keydown', this.handleKeyPress);
    }

    handleKeyPress = (e) => {
        if (e.key === 'Escape' && this.isOpen) {
            this.hide();
            document.removeEventListener('keydown', this.handleKeyPress);
        }
    }

    generateSettingsContent() {
        return `
            <div class="settings-section">
                <h3><i class="fas fa-palette"></i> Внешний вид</h3>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Тема оформления</h4>
                        <p>Выберите цветовую схему приложения</p>
                    </div>
                    <div class="setting-control">
                        <select class="setting-select" data-setting="theme">
                            <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>Темная</option>
                            <option value="light" ${this.settings.theme === 'light' ? 'selected' : ''}>Светлая</option>
                            <option value="colorful" ${this.settings.theme === 'colorful' ? 'selected' : ''}>Цветная</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Анимации</h4>
                        <p>Включить плавные анимации и переходы</p>
                    </div>
                    <div class="setting-control">
                        <button class="toggle-switch ${this.settings.animations ? 'active' : ''}" data-setting="animations"></button>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Компактный режим</h4>
                        <p>Уменьшенные размеры нодов и панелей</p>
                    </div>
                    <div class="setting-control">
                        <button class="toggle-switch ${this.settings.compactMode ? 'active' : ''}" data-setting="compactMode"></button>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3><i class="fas fa-save"></i> Сохранение</h3>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Автосохранение</h4>
                        <p>Автоматически сохранять изменения в браузере</p>
                    </div>
                    <div class="setting-control">
                        <button class="toggle-switch ${this.settings.autoSave ? 'active' : ''}" data-setting="autoSave"></button>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3><i class="fas fa-volume-up"></i> Звук и эффекты</h3>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Звуковые эффекты</h4>
                        <p>Звуки при соединении нодов и других действиях</p>
                        ${this.settings.soundEffects ? '<div class="sound-indicator"><i class="fas fa-volume-up"></i> Звук включен</div>' : ''}
                    </div>
                    <div class="setting-control">
                        <button class="toggle-switch ${this.settings.soundEffects ? 'active' : ''}" data-setting="soundEffects"></button>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3><i class="fas fa-globe"></i> Язык и регион</h3>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Язык интерфейса</h4>
                        <p>Основной язык приложения</p>
                    </div>
                    <div class="setting-control">
                        <select class="setting-select" data-setting="language">
                            <option value="ru" ${this.settings.language === 'ru' ? 'selected' : ''}>Русский</option>
                            <option value="en" ${this.settings.language === 'en' ? 'selected' : ''}>English</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3><i class="fas fa-info-circle"></i> Информация</h3>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Версия приложения</h4>
                        <p>CipherFlow v2.0 - Улучшенная версия с новыми возможностями</p>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Горячие клавиши</h4>
                        <p>Нажмите F1 или кнопку справки для просмотра всех комбинаций</p>
                    </div>
                    <div class="setting-control">
                        <button class="settings-button secondary" onclick="window.showHelp(); window.settingsSystem.hide();">
                            <i class="fas fa-keyboard"></i>
                            Показать
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    initializeControls() {
        // Обработчики переключателей
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.onclick = () => {
                const setting = toggle.dataset.setting;
                this.settings[setting] = !this.settings[setting];
                toggle.classList.toggle('active');
                this.saveSettings();
                
                // Воспроизводим звук если включены звуковые эффекты
                if (this.settings.soundEffects && setting !== 'soundEffects') {
                    this.playSound('toggle');
                }

                // Обновляем индикаторы
                this.updateIndicators();
            };
        });

        // Обработчики селектов
        document.querySelectorAll('.setting-select').forEach(select => {
            select.onchange = () => {
                const setting = select.dataset.setting;
                this.settings[setting] = select.value;
                this.saveSettings();
                
                if (this.settings.soundEffects) {
                    this.playSound('select');
                }
            };
        });
    }

    updateIndicators() {
        // Обновляем индикатор звуковых эффектов
        const soundItem = document.querySelector('[data-setting="soundEffects"]').closest('.setting-item');
        const existingIndicator = soundItem.querySelector('.sound-indicator');
        
        if (this.settings.soundEffects && !existingIndicator) {
            const indicator = document.createElement('div');
            indicator.className = 'sound-indicator';
            indicator.innerHTML = '<i class="fas fa-volume-up"></i> Звук включен';
            soundItem.querySelector('.setting-info').appendChild(indicator);
        } else if (!this.settings.soundEffects && existingIndicator) {
            existingIndicator.remove();
        }
    }

    applySettings() {
        const body = document.body;
        
        // Применяем тему
        body.className = body.className.replace(/theme-\w+/g, '');
        body.classList.add(`theme-${this.settings.theme}`);
        
        // Применяем настройки анимаций
        if (!this.settings.animations) {
            body.classList.add('no-animations');
        } else {
            body.classList.remove('no-animations');
        }
        
        // Применяем компактный режим
        if (this.settings.compactMode) {
            body.classList.add('compact-mode');
        } else {
            body.classList.remove('compact-mode');
        }

        // Применяем автосохранение
        if (this.settings.autoSave && window.fileManager) {
            // Включаем автосохранение
            this.enableAutoSave();
        }
    }

    enableAutoSave() {
        // Автосохранение каждые 30 секунд
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            if (window.nodeManager && window.nodeManager.nodes.size > 0) {
                try {
                    const schemeData = window.cipherEngine?.exportScheme();
                    if (schemeData) {
                        localStorage.setItem('cipherflow-autosave', schemeData);
                        this.showAutoSaveIndicator();
                    }
                } catch (error) {
                    console.error('Ошибка автосохранения:', error);
                }
            }
        }, 30000);
    }

    showAutoSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--accent-primary);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-size: 0.9rem;
            z-index: 1000;
            animation: slideInUp 0.3s ease, slideOutDown 0.3s ease 2s forwards;
        `;
        indicator.innerHTML = '<i class="fas fa-save"></i> Автосохранение выполнено';
        document.body.appendChild(indicator);

        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, 3000);
    }

    playSound(type) {
        if (!this.settings.soundEffects) return;
        
        // Создаем звуковые эффекты через Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (!audioContext) return; // Добавлена проверка на случай, если Web Audio API не поддерживается
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Разные звуки для разных действий
        switch (type) {
            case 'toggle':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
                break;
            case 'select':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                break;
            case 'connection':
                // Восходящий звук для соединения
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.15);
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                // === ИСПРАВЛЕНИЕ: Добавляем запуск перед планированием остановки ===
                oscillator.start(audioContext.currentTime); 
                oscillator.stop(audioContext.currentTime + 0.3);
                return; 
            case 'disconnect':
                // Нисходящий звук для разрыва соединения
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
                
                // === ИСПРАВЛЕНИЕ: Добавляем запуск перед планированием остановки ===
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.25);
                return;
            case 'node_create':
                // Звук создания нода
                oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
                break;
            default:
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    resetSettings() {
        if (confirm('Сбросить все настройки до значений по умолчанию?')) {
            this.settings = {
                theme: 'dark',
                autoSave: true,
                soundEffects: false,
                animations: true,
                compactMode: false,
                language: 'ru'
            };
            
            this.saveSettings();
            this.hide();
            
            // Показываем уведомление
            setTimeout(() => {
                alert('Настройки сброшены до значений по умолчанию');
            }, 100);
        }
    }
}

// Создаем глобальный экземпляр системы настроек
window.settingsSystem = new SettingsSystem();