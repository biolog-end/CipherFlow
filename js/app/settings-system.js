/**
 * User settings (theme, sound, autosave, language) persisted in localStorage, plus the settings window
 * with the list of achievements.
 */
class SettingsSystem {
    static STORAGE_KEY = 'cipherflow-settings';
    static DEFAULTS = Object.freeze({
        theme: 'dark',
        animations: true,
        compactMode: false,
        showGrid: true,
        autoSave: true,
        soundEffects: true,
        language: 'ru',
    });

    constructor(app) {
        this.app = app;
        this.modal = null;
        this.themeLocked = false;
        this.themeBeforeLock = null;
        this.audioContext = null;
        this.settings = this.load();
        this.mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
        this.mediaQuery?.addEventListener('change', () => this.apply());

        if (this.settings.language !== i18n.getCurrentLanguage()) i18n.setLanguage(this.settings.language);
        this.apply();
        this.bindEasterEggEvents();
    }

    load() {
        let saved = {};
        try {
            saved = JSON.parse(localStorage.getItem(SettingsSystem.STORAGE_KEY) || '{}');
        } catch {
            saved = {};
        }
        const settings = { ...SettingsSystem.DEFAULTS, ...saved };
        if (!['dark', 'light', 'auto'].includes(settings.theme)) settings.theme = 'dark';
        if (!i18n.getSupportedLanguages().includes(settings.language)) settings.language = i18n.getCurrentLanguage();
        return settings;
    }

    save() {
        const toSave = { ...this.settings };
        if (this.themeLocked) toSave.theme = this.themeBeforeLock;
        localStorage.setItem(SettingsSystem.STORAGE_KEY, JSON.stringify(toSave));
        this.apply();
    }

    set(key, value) {
        this.settings[key] = value;
        if (key === 'language') i18n.setLanguage(value);
        this.save();
    }

    resolvedTheme() {
        if (this.settings.theme === 'auto') return this.mediaQuery && this.mediaQuery.matches ? 'light' : 'dark';
        return this.settings.theme;
    }

    apply() {
        const body = document.body;
        body.classList.remove('theme-dark', 'theme-light');
        body.classList.add(`theme-${this.resolvedTheme()}`);
        body.classList.toggle('no-animations', !this.settings.animations);
        body.classList.toggle('compact-mode', this.settings.compactMode);
        body.classList.toggle('hide-grid', !this.settings.showGrid);
    }

    /* ---------- easter eggs lock the theme while active ---------- */

    bindEasterEggEvents() {
        document.addEventListener('easter-egg-activated', () => {
            if (this.themeLocked) return;
            this.themeLocked = true;
            this.themeBeforeLock = this.settings.theme;
            this.settings.theme = 'dark';
            this.apply();
            this.refreshModal();
        });
        document.addEventListener('easter-egg-deactivated', () => {
            if (!this.themeLocked) return;
            this.themeLocked = false;
            this.settings.theme = this.themeBeforeLock || 'dark';
            this.themeBeforeLock = null;
            this.apply();
            this.refreshModal();
        });
    }

    /* ---------- window ---------- */

    show() {
        if (this.modal) return;
        this.modal = UI.modal({
            title: i18n.t('settings.title'),
            icon: 'fas fa-cog',
            className: 'modal-settings',
            bodyHtml: this.renderContent(),
            footerHtml: `
                <button class="btn" data-action="reset"><i class="fas fa-undo"></i> ${UI.escapeHtml(i18n.t('settings.reset'))}</button>
                <button class="btn btn-primary" data-action="close">${UI.escapeHtml(i18n.t('settings.close'))}</button>`,
            onClose: () => { this.modal = null; },
        });
        this.modal.overlay.querySelector('[data-action="reset"]').onclick = () => this.resetSettings();
        this.modal.overlay.querySelector('[data-action="close"]').onclick = () => this.hide();
        this.bindControls();
    }

    hide() {
        if (this.modal) this.modal.close();
        this.modal = null;
    }

    refreshModal() {
        if (!this.modal) return;
        this.modal.body.innerHTML = this.renderContent();
        this.modal.overlay.querySelector('.modal-title').textContent = i18n.t('settings.title');
        this.modal.overlay.querySelector('[data-action="reset"]').innerHTML = `<i class="fas fa-undo"></i> ${UI.escapeHtml(i18n.t('settings.reset'))}`;
        this.modal.overlay.querySelector('[data-action="close"]').textContent = i18n.t('settings.close');
        this.bindControls();
    }

    renderContent() {
        const t = (key) => UI.escapeHtml(i18n.t(key));
        const toggle = (key, titleKey, descKey) => `
            <div class="setting-row">
                <div class="setting-info"><h4>${t(titleKey)}</h4><p>${t(descKey)}</p></div>
                <button class="switch ${this.settings[key] ? 'on' : ''}" role="switch" aria-checked="${this.settings[key]}" data-setting="${key}"></button>
            </div>`;
        const select = (key, titleKey, descKey, options) => `
            <div class="setting-row">
                <div class="setting-info"><h4>${t(titleKey)}</h4><p>${t(descKey)}</p></div>
                <select class="select" data-setting="${key}">
                    ${options.map(([value, labelKey]) => `<option value="${value}" ${this.settings[key] === value ? 'selected' : ''}>${t(labelKey)}</option>`).join('')}
                </select>
            </div>`;

        const themeControl = this.themeLocked
            ? `<div class="setting-row"><div class="setting-info"><h4>${t('settings.theme')}</h4><p>${t('settings.theme_desc')}</p></div><span class="setting-locked"><i class="fas fa-lock"></i> ${t('settings.theme_locked')}</span></div>`
            : select('theme', 'settings.theme', 'settings.theme_desc', [['dark', 'theme.dark'], ['light', 'theme.light'], ['auto', 'theme.auto']]);

        return `
            <section class="settings-section">
                <h3><i class="fas fa-palette"></i> ${t('settings.section_appearance')}</h3>
                ${themeControl}
                ${toggle('animations', 'settings.animations', 'settings.animations_desc')}
                ${toggle('compactMode', 'settings.compact_mode', 'settings.compact_mode_desc')}
                ${toggle('showGrid', 'settings.grid', 'settings.grid_desc')}
            </section>
            <section class="settings-section">
                <h3><i class="fas fa-sliders-h"></i> ${t('settings.section_behaviour')}</h3>
                ${toggle('autoSave', 'settings.autosave', 'settings.autosave_desc')}
                ${toggle('soundEffects', 'settings.sound_effects', 'settings.sound_effects_desc')}
                ${select('language', 'settings.language', 'settings.language_desc', [['ru', 'language.ru'], ['en', 'language.en']])}
            </section>
            <section class="settings-section">
                <h3><i class="fas fa-trophy"></i> ${t('settings.section_achievements')}</h3>
                <p class="settings-hint">${t('settings.achievements_list_desc')}</p>
                ${this.renderAchievements()}
                <div class="setting-row">
                    <div class="setting-info"><h4>${t('settings.reset_achievements')}</h4><p>${t('settings.reset_achievements_desc')}</p></div>
                    <button class="btn btn-danger" data-action="reset-achievements"><i class="fas fa-trash-alt"></i> ${t('button.reset')}</button>
                </div>
            </section>
            <section class="settings-section">
                <h3><i class="fas fa-info-circle"></i> ${t('settings.section_info')}</h3>
                <div class="setting-row">
                    <div class="setting-info"><h4>${t('settings.app_version')}</h4><p>${t('settings.app_version_desc')}</p></div>
                </div>
                <div class="setting-row">
                    <div class="setting-info"><h4>${t('settings.hotkeys')}</h4><p>${t('settings.hotkeys_desc')}</p></div>
                    <button class="btn" data-action="hotkeys"><i class="fas fa-keyboard"></i> ${t('button.show')}</button>
                </div>
            </section>`;
    }

    renderAchievements() {
        const eggs = window.easterEggs;
        if (!eggs) return '';
        const items = [...eggs.achievementsData.entries()].map(([id, payload]) => {
            const unlocked = eggs.unlockedAchievements.has(id);
            const title = unlocked ? i18n.t(payload.title) : '???';
            const subtitle = unlocked ? i18n.t(payload.subtitle) : i18n.t('settings.achievement_locked');
            return `
                <div class="achievement ${unlocked ? 'is-unlocked' : 'is-locked'}">
                    <span class="achievement-icon">${unlocked ? `<img src="${UI.escapeHtml(payload.image)}" alt="">` : '<i class="fas fa-lock"></i>'}</span>
                    <div class="achievement-text"><h4>${UI.escapeHtml(title)}</h4><p>${UI.escapeHtml(subtitle)}</p></div>
                    <span class="achievement-state">${unlocked ? '<i class="fas fa-check"></i>' : ''}</span>
                </div>`;
        });
        return `<div class="achievements">${items.join('')}</div>`;
    }

    bindControls() {
        const { overlay } = this.modal;
        overlay.querySelectorAll('.switch[data-setting]').forEach(button => {
            button.addEventListener('click', () => {
                const key = button.dataset.setting;
                this.set(key, !this.settings[key]);
                button.classList.toggle('on', this.settings[key]);
                button.setAttribute('aria-checked', String(this.settings[key]));
                if (key !== 'soundEffects' || this.settings[key]) this.playSound('toggle');
            });
        });
        overlay.querySelectorAll('select[data-setting]').forEach(select => {
            select.addEventListener('change', () => {
                this.set(select.dataset.setting, select.value);
                this.playSound('select');
                if (select.dataset.setting === 'language') this.refreshModal();
            });
        });
        overlay.querySelector('[data-action="reset-achievements"]')?.addEventListener('click', () => this.resetAchievements());
        overlay.querySelector('[data-action="hotkeys"]')?.addEventListener('click', () => {
            this.hide();
            this.app.help.show('hotkeys');
        });
    }

    async resetAchievements() {
        const ok = await UI.confirm({ message: i18n.t('dialog.reset_achievements_confirm'), confirmLabel: i18n.t('button.reset'), cancelLabel: i18n.t('dialog.cancel'), danger: true });
        if (!ok) return;
        window.easterEggs?.resetAchievements();
        UI.notify(i18n.t('notification.achievements_reset'), 'success');
        this.playSound('node_delete');
        this.refreshModal();
    }

    async resetSettings() {
        const ok = await UI.confirm({ message: i18n.t('dialog.reset_settings_confirm'), confirmLabel: i18n.t('settings.reset'), cancelLabel: i18n.t('dialog.cancel') });
        if (!ok) return;
        const language = this.settings.language;
        this.settings = { ...SettingsSystem.DEFAULTS, language };
        this.save();
        this.refreshModal();
        UI.notify(i18n.t('dialog.settings_reset_alert'), 'success');
    }

    /* ---------- sounds ---------- */

    playSound(type) {
        if (!this.settings.soundEffects) return;
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            if (!this.audioContext) this.audioContext = new Ctx();
            const ctx = this.audioContext;
            if (ctx.state === 'suspended') ctx.resume();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            // [frequencies over time], volume, length
            const SOUNDS = {
                toggle: [[800, 1000], 0.08, 0.15],
                select: [[600], 0.08, 0.12],
                connection: [[400, 800], 0.12, 0.3],
                disconnect: [[800, 300], 0.1, 0.25],
                node_create: [[523, 659, 784], 0.1, 0.3],
                node_delete: [[659, 523, 392], 0.1, 0.25],
                mode_switch: [[440, 880, 440], 0.08, 0.3],
                file_save: [[523, 698, 523], 0.08, 0.3],
                file_load: [[392, 523, 659], 0.08, 0.3],
                success: [[523, 659, 784, 1047], 0.12, 0.4],
                error: [[220, 233, 196], 0.1, 0.3],
            };
            const [notes, volume, length] = SOUNDS[type] || SOUNDS.select;
            notes.forEach((freq, i) => osc.frequency.setValueAtTime(freq, now + (i * length) / notes.length));
            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + length);
            osc.start(now);
            osc.stop(now + length);
        } catch {
            // audio is optional
        }
    }
}
