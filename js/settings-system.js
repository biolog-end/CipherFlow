class SettingsSystem {
    constructor() {
        this.isOpen = false;
        this.settings = this.loadSettings();
        
        this.themeLockedByEasterEgg = false;
        this.savedThemeBeforeLock = null;

        this.applySettings();
        if (window.i18n && this.settings.language !== window.i18n.getCurrentLanguage()) {
            window.i18n.setLanguage(this.settings.language);
        }
        this.bindEasterEggEvents();
    }
    loadSettings() {
        const saved = localStorage.getItem('cipherflow-settings');
        const defaultSettings = {
            theme: 'dark',
            autoSave: true,
            soundEffects: true,
            animations: true,
            compactMode: false,
            showGrid: false,
            language: window.i18n ? window.i18n.getCurrentLanguage() : 'ru'
        };
        if (saved) {
            const parsedSettings = JSON.parse(saved);
            if (window.i18n) {
                parsedSettings.language = window.i18n.getCurrentLanguage();
            }
            return {...defaultSettings, ...parsedSettings};
        }
        return defaultSettings;
    }

    saveSettings() {
        const settingsToSave = { ...this.settings };

        if (this.themeLockedByEasterEgg) {
            settingsToSave.theme = this.savedThemeBeforeLock;
        }

        localStorage.setItem('cipherflow-settings', JSON.stringify(settingsToSave));
        this.applySettings();
    }

    bindEasterEggEvents() {
        document.addEventListener('easter-egg-activated', () => {
            if (this.themeLockedByEasterEgg) return; 

            this.themeLockedByEasterEgg = true;
            this.savedThemeBeforeLock = this.settings.theme;
            this.settings.theme = 'dark';
            
            this.applySettings();
            this.updateThemeControlLock();
        });

        document.addEventListener('easter-egg-deactivated', () => {
            if (!this.themeLockedByEasterEgg) return;

            this.themeLockedByEasterEgg = false;
            if (this.savedThemeBeforeLock) {
                this.settings.theme = this.savedThemeBeforeLock;
            }
            this.savedThemeBeforeLock = null;
            
            this.applySettings();
            this.updateThemeControlLock();
        });
    }

    show() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.createSettingsModal();
        this.updateThemeControlLock(); 
    }

    hide() {
        if (!this.isOpen) return;
        this.isOpen = false;
        const overlay = document.querySelector('.settings-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        }
        document.removeEventListener('keydown', this.handleKeyPress);
    }

    createSettingsModal() {
        const overlay = document.createElement('div');
        overlay.className = 'settings-overlay';
        const t = window.i18n ? window.i18n.t.bind(window.i18n) : (key) => key;
        overlay.innerHTML = `
            <div class="settings-modal">
                <div class="settings-header">
                    <div class="settings-title">
                        <i class="fas fa-cog"></i>
                        ${t('settings.title')}
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
                        ${t('settings.reset')}
                    </button>
                    <button class="settings-button" onclick="window.settingsSystem.hide()">
                        <i class="fas fa-save"></i>
                        ${t('settings.close')}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });
        overlay.querySelector('.settings-close').onclick = () => this.hide();
        overlay.onclick = (e) => {
            if (e.target === overlay) this.hide();
        };
        this.initializeControls();
        document.addEventListener('keydown', this.handleKeyPress);
    }

    handleKeyPress = (e) => {
        if (e.key === 'Escape' && this.isOpen) {
            this.hide();
        }
    }

    generateSettingsContent() {
        const t = window.i18n ? window.i18n.t.bind(window.i18n) : (key) => key;
        return `
            <div class="settings-section">
                <h3><i class="fas fa-palette"></i> ${t('settings.theme')}</h3>
                
                <div class="setting-item setting-item-theme"> 
                    <div class="setting-info">
                        <h4>${t('settings.theme')}</h4>
                        <p>${t('settings.theme_desc')}</p>
                    </div>
                    <div class="setting-control">
                        <select class="setting-select" data-setting="theme">
                            <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>${t('theme.dark')}</option>
                            <option value="light" ${this.settings.theme === 'light' ? 'selected' : ''}>${t('theme.light')}</option>
                            <option value="colorful" ${this.settings.theme === 'colorful' ? 'selected' : ''}>${t('theme.colorful')}</option>
                            <option value="auto" ${this.settings.theme === 'auto' ? 'selected' : ''}>${t('theme.auto')}</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <h4>${t('settings.animations')}</h4>
                        <p>${t('settings.animations_desc')}</p>
                    </div>
                    <div class="setting-control">
                        <button class="toggle-switch ${this.settings.animations ? 'active' : ''}" data-setting="animations"></button>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <h4>${t('settings.compact_mode')}</h4>
                        <p>${t('settings.compact_mode_desc')}</p>
                    </div>
                    <div class="setting-control">
                        <button class="toggle-switch ${this.settings.compactMode ? 'active' : ''}" data-setting="compactMode"></button>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <h4>${t('settings.grid')}</h4>
                        <p>${t('settings.grid_desc')}</p>
                    </div>
                    <div class="setting-control">
                        <button class="toggle-switch ${this.settings.showGrid ? 'active' : ''}" data-setting="showGrid"></button>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3><i class="fas fa-save"></i> ${t('settings.section_saving')}</h3>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>${t('settings.autosave')}</h4>
                        <p>${t('settings.autosave_desc')}</p>
                    </div>
                    <div class="setting-control">
                        <button class="toggle-switch ${this.settings.autoSave ? 'active' : ''}" data-setting="autoSave"></button>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3><i class="fas fa-volume-up"></i> ${t('settings.section_sound')}</h3>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>${t('settings.sound_effects')}</h4>
                        <p>${t('settings.sound_effects_desc')}</p>
                        ${this.settings.soundEffects ? `<div class="sound-indicator"><i class="fas fa-volume-up"></i> ${t('settings.sound_on_indicator')}</div>` : ''}
                    </div>
                    <div class="setting-control">
                        <button class="toggle-switch ${this.settings.soundEffects ? 'active' : ''}" data-setting="soundEffects"></button>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3><i class="fas fa-globe"></i> ${t('settings.language')}</h3>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>${t('settings.language')}</h4>
                        <p>${t('settings.language_desc')}</p>
                    </div>
                    <div class="setting-control">
                        <select class="setting-select" data-setting="language">
                            <option value="ru" ${this.settings.language === 'ru' ? 'selected' : ''}>${t('language.ru')}</option>
                            <option value="en" ${this.settings.language === 'en' ? 'selected' : ''}>${t('language.en')}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3><i class="fas fa-info-circle"></i> ${t('settings.section_info')}</h3>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>${t('settings.app_version')}</h4>
                        <p>${t('settings.app_version_desc')}</p>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <h4>${t('settings.hotkeys')}</h4>
                        <p>${t('settings.hotkeys_desc')}</p>
                    </div>
                    <div class="setting-control">
                        <button class="settings-button secondary" onclick="window.showHelp(); window.settingsSystem.hide();">
                            <i class="fas fa-keyboard"></i>
                            ${t('button.show')}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    initializeControls() {
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.onclick = () => {
                const setting = toggle.dataset.setting;
                this.settings[setting] = !this.settings[setting];
                toggle.classList.toggle('active');
                this.saveSettings();
                if (this.settings.soundEffects && setting !== 'soundEffects') {
                    this.playSound('toggle');
                }
                this.updateIndicators();
            };
        });
        document.querySelectorAll('.setting-select').forEach(select => {
            select.onchange = () => {
                const setting = select.dataset.setting;
                this.settings[setting] = select.value;
                if (setting === 'language' && window.i18n) {
                    window.i18n.setLanguage(select.value);
                    setTimeout(() => {
                        const content = document.querySelector('.settings-content');
                        if (content) {
                            content.innerHTML = this.generateSettingsContent();
                            this.initializeControls();
                            this.updateThemeControlLock();
                        }
                        const title = document.querySelector('.settings-title');
                        if (title) {
                            title.innerHTML = `<i class="fas fa-cog"></i> ${window.i18n.t('settings.title')}`;
                        }
                    }, 100);
                }
                this.saveSettings();
                if (this.settings.soundEffects) {
                    this.playSound('select');
                }
            };
        });
    }

    updateThemeControlLock() {
        if (!this.isOpen) return;

        const t = window.i18n ? window.i18n.t.bind(window.i18n) : (key) => key;
        const themeControlContainer = document.querySelector('.setting-item-theme .setting-control');
        if (!themeControlContainer) return;

        const themeSelect = themeControlContainer.querySelector('[data-setting="theme"]');
        let lockMessage = themeControlContainer.querySelector('.setting-lock-message');
        
        if (this.themeLockedByEasterEgg) {
            if (themeSelect) themeSelect.style.display = 'none';

            if (!lockMessage) {
                lockMessage = document.createElement('div');
                lockMessage.className = 'setting-lock-message';
                themeControlContainer.appendChild(lockMessage);
            }
            lockMessage.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 0.5rem;
                padding: 0.5rem 0.75rem;
                border-radius: 8px;
                background: var(--bg-tertiary);
                border: 1px dashed var(--accent-primary);
                color: var(--accent-primary);
                font-size: 0.9em;
                font-weight: 500;
            `;
            lockMessage.innerHTML = `<i class="fas fa-lock"></i> ${t('settings.theme_locked')}`;
            lockMessage.style.display = 'flex';

        } else {
            if (themeSelect) themeSelect.style.display = '';

            if (lockMessage) {
                lockMessage.style.display = 'none';
            }
        }
    }

    updateIndicators() {
        const t = window.i18n.t.bind(window.i18n);
        const soundItem = document.querySelector('[data-setting="soundEffects"]').closest('.setting-item');
        const existingIndicator = soundItem.querySelector('.sound-indicator');
        
        if (this.settings.soundEffects && !existingIndicator) {
            const indicator = document.createElement('div');
            indicator.className = 'sound-indicator';
            indicator.innerHTML = `<i class="fas fa-volume-up"></i> ${t('settings.sound_on_indicator')}`;
            soundItem.querySelector('.setting-info').appendChild(indicator);
        } else if (!this.settings.soundEffects && existingIndicator) {
            existingIndicator.remove();
        }
    }

    applySettings() {
        const body = document.body;
        
        body.className = body.className.replace(/theme-\w+/g, '');
        
        if (this.settings.theme) {
             body.classList.add(`theme-${this.settings.theme}`);
        }

        if (!this.settings.animations) {
            body.classList.add('no-animations');
        } else {
            body.classList.remove('no-animations');
        }
        if (this.settings.compactMode) {
            body.classList.add('compact-mode');
        } else {
            body.classList.remove('compact-mode');
        }
        if (this.settings.autoSave && window.fileManager) {
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
        const t = window.i18n.t.bind(window.i18n);
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
        indicator.innerHTML = `<i class="fas fa-save"></i> ${t('notification.autosave_complete')}`;
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
                
                oscillator.start(audioContext.currentTime); 
                oscillator.stop(audioContext.currentTime + 0.3);
                return; 
            case 'disconnect':
                // Нисходящий звук для разрыва соединения
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.25);
                return;
            case 'node_create':
                // Звук создания нода - восходящий аккорд
                oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
                gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                return;
            case 'node_delete':
                // Звук удаления нода - нисходящий
                oscillator.frequency.setValueAtTime(659, audioContext.currentTime); // E5
                oscillator.frequency.setValueAtTime(523, audioContext.currentTime + 0.1); // C5
                oscillator.frequency.setValueAtTime(392, audioContext.currentTime + 0.2); // G4
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.25);
                return;
            case 'cipher_process':
                // Звук обработки шифра - быстрая трель
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(554, audioContext.currentTime + 0.05);
                oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.15);
                break;
            case 'success':
                // Звук успеха - мажорный аккорд
                oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.05); // E5
                oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.1); // G5
                oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.15); // C6
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.4);
                return;
            case 'error':
                // Звук ошибки - диссонанс
                oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(233, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(196, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                return;
            case 'hover':
                // Тихий звук при наведении
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                return;
            case 'mode_switch':
                // Звук переключения режима шифрования/дешифрования
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.2);
                break;
            case 'file_save':
                // Звук сохранения файла
                oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(698, audioContext.currentTime + 0.1); // F5
                oscillator.frequency.setValueAtTime(523, audioContext.currentTime + 0.2); // C5
                break;
            case 'file_load':
                // Звук загрузки файла
                oscillator.frequency.setValueAtTime(392, audioContext.currentTime); // G4
                oscillator.frequency.setValueAtTime(523, audioContext.currentTime + 0.1); // C5
                oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2); // E5
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
        const t = window.i18n.t.bind(window.i18n); 
        if (confirm(t('dialog.reset_settings_confirm'))) {
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
                alert(t('dialog.settings_reset_alert'));
            }, 100);
        }
    }
}

// Создаем глобальный экземпляр системы настроек
window.settingsSystem = new SettingsSystem();