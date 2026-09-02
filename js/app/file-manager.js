/**
 * Saving, loading, examples and autosave.
 * Files are plain JSON in the scheme format (see scheme.js), which also converts earlier format versions.
 */
class FileManager {
    static AUTOSAVE_KEY = 'cipherflow-autosave';

    constructor(app) {
        this.app = app;
        this.autosaveTimer = null;
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('saveBtn')?.addEventListener('click', () => this.showSaveDialog());
        document.getElementById('loadBtn')?.addEventListener('click', () => this.openFilePicker());
        document.getElementById('clearBtn')?.addEventListener('click', () => this.clearScheme());

        const input = document.getElementById('fileInput');
        input.addEventListener('change', () => {
            const file = input.files[0];
            input.value = '';
            if (file) this.loadFile(file);
        });

        const workspace = document.querySelector('.workspace');
        workspace.addEventListener('dragover', (e) => {
            if (![...e.dataTransfer.types].includes('Files')) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            workspace.classList.add('drag-over');
        });
        workspace.addEventListener('dragleave', (e) => {
            if (!workspace.contains(e.relatedTarget)) workspace.classList.remove('drag-over');
        });
        workspace.addEventListener('drop', (e) => {
            e.preventDefault();
            workspace.classList.remove('drag-over');
            const file = [...e.dataTransfer.files].find(f => f.name.endsWith('.json'));
            if (file) this.loadFile(file);
            else if (e.dataTransfer.files.length) UI.notify(i18n.t('error.dnd_json_only'), 'error');
        });

        window.addEventListener('beforeunload', (e) => {
            this.autosaveNow();
            if (this.app.nodes.nodes.size > 0 && this.app.history.canUndo) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    /* ---------- save ---------- */

    showSaveDialog() {
        const { body, close } = UI.modal({
            title: i18n.t('dialog.save_scheme_title'),
            icon: 'fas fa-save',
            className: 'modal-save',
            bodyHtml: `
                <label class="form-field">
                    <span>${UI.escapeHtml(i18n.t('dialog.scheme_name_label'))}</span>
                    <input type="text" id="schemeName" placeholder="${UI.escapeHtml(i18n.t('dialog.scheme_name_placeholder'))}">
                </label>
                <label class="form-field">
                    <span>${UI.escapeHtml(i18n.t('dialog.scheme_desc_label'))}</span>
                    <textarea id="schemeDescription" rows="3" placeholder="${UI.escapeHtml(i18n.t('dialog.scheme_desc_placeholder'))}"></textarea>
                </label>`,
            footerHtml: `
                <button class="btn" data-action="cancel">${UI.escapeHtml(i18n.t('dialog.cancel'))}</button>
                <button class="btn btn-primary" data-action="save"><i class="fas fa-download"></i> ${UI.escapeHtml(i18n.t('dialog.save'))}</button>`,
        });
        const nameInput = body.querySelector('#schemeName');
        nameInput.value = i18n.t('dialog.default_scheme_name');
        const save = () => {
            this.download(nameInput.value.trim() || i18n.t('dialog.default_scheme_name'), body.querySelector('#schemeDescription').value.trim());
            close();
        };
        body.closest('.modal').querySelector('[data-action="cancel"]').onclick = close;
        body.closest('.modal').querySelector('[data-action="save"]').onclick = save;
        nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });
        setTimeout(() => nameInput.select(), 50);
    }

    download(name, description) {
        try {
            const scheme = { name, description, created: new Date().toISOString(), ...this.app.snapshot() };
            const blob = new Blob([Scheme.stringify(scheme)], { type: 'application/json' });
            const safeName = name.replace(/[^a-zа-яё0-9\s_-]/gi, '').replace(/\s+/g, '-').toLowerCase() || 'scheme';
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${safeName}-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(link.href);
            this.app.settings.playSound('file_save');
            UI.notify(i18n.t('notification.scheme_saved_as', { name }), 'success');
        } catch (error) {
            console.error('Save failed:', error);
            UI.notify(i18n.t('error.save_failed', { message: error.message }), 'error');
        }
    }

    /* ---------- load ---------- */

    openFilePicker() {
        document.getElementById('fileInput').click();
    }

    async confirmOverwrite() {
        if (this.app.nodes.nodes.size === 0) return true;
        return UI.confirm({ message: i18n.t('dialog.overwrite_confirm'), confirmLabel: i18n.t('dialog.yes'), cancelLabel: i18n.t('dialog.no') });
    }

    loadFile(file) {
        if (!file.name.endsWith('.json')) {
            UI.notify(i18n.t('error.json_only'), 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = async () => {
            let scheme;
            try {
                scheme = Scheme.parse(reader.result);
            } catch (error) {
                UI.notify(i18n.t('error.load_failed', { message: error.message }), 'error');
                return;
            }
            if (!(await this.confirmOverwrite())) return;
            this.app.loadScheme(scheme);
            this.app.settings.playSound('file_load');
            const name = scheme.name || i18n.t('scheme.unknown_name');
            let message = i18n.t('notification.scheme_loaded_as', { name });
            if (scheme.description) message += `\n${i18n.t('notification.desc_prefix')} ${scheme.description}`;
            UI.notify(message, 'success');
        };
        reader.onerror = () => UI.notify(i18n.t('error.file_read_error'), 'error');
        reader.readAsText(file);
    }

    async loadExample(key, { confirm = true } = {}) {
        const example = EXAMPLE_SCHEMES[key];
        if (!example) return;
        if (confirm && !(await this.confirmOverwrite())) return;
        try {
            this.app.loadScheme(Scheme.normalize(example));
            this.app.settings.playSound('file_load');
            UI.notify(i18n.t('notification.example_loaded', { name: i18n.t(example.nameKey) }), 'success');
        } catch (error) {
            console.error('Example load failed:', error);
            UI.notify(i18n.t('error.example_load_failed', { message: error.message }), 'error');
        }
    }

    async clearScheme() {
        if (this.app.nodes.nodes.size > 0) {
            const ok = await UI.confirm({ message: i18n.t('dialog.clear_all_confirm'), confirmLabel: i18n.t('header.clear'), cancelLabel: i18n.t('dialog.cancel'), danger: true });
            if (!ok) return;
        }
        this.app.clearScheme();
        localStorage.removeItem(FileManager.AUTOSAVE_KEY);
        UI.notify(i18n.t('notification.scheme_cleared'), 'success');
    }

    /* ---------- autosave ---------- */

    scheduleAutosave() {
        if (!this.app.settings.settings.autoSave) return;
        clearTimeout(this.autosaveTimer);
        this.autosaveTimer = setTimeout(() => this.autosaveNow(), 1500);
    }

    autosaveNow() {
        clearTimeout(this.autosaveTimer);
        if (!this.app.settings.settings.autoSave) return;
        try {
            if (this.app.nodes.nodes.size === 0) {
                localStorage.removeItem(FileManager.AUTOSAVE_KEY);
                return;
            }
            const scheme = { created: new Date().toISOString(), ...this.app.snapshot() };
            localStorage.setItem(FileManager.AUTOSAVE_KEY, Scheme.stringify(scheme));
        } catch (error) {
            console.warn('Autosave failed:', error);
        }
    }

    /** Restores the last autosaved scheme. Returns true when something was restored. */
    restoreAutosave() {
        const saved = localStorage.getItem(FileManager.AUTOSAVE_KEY);
        if (!saved) return false;
        let scheme;
        try {
            scheme = Scheme.parse(saved);
        } catch {
            localStorage.removeItem(FileManager.AUTOSAVE_KEY);
            return false;
        }
        if (scheme.nodes.length === 0) return false;
        this.app.loadScheme(scheme);
        this.app.history.reset();
        UI.notify(i18n.t('notification.scheme_restored'), 'info');
        return true;
    }
}
