/**
 * Keyboard shortcuts. Uses e.code so the bindings work on any keyboard layout (Ctrl+Z is Ctrl+Я too).
 */
class Shortcuts {
    constructor(app) {
        this.app = app;
        document.addEventListener('keydown', (e) => this.handle(e));
    }

    static isTyping(target) {
        return Boolean(target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable));
    }

    handle(e) {
        const typing = Shortcuts.isTyping(e.target);
        const mod = e.ctrlKey || e.metaKey;
        const inModal = Boolean(e.target.closest?.('.modal-overlay'));

        if (e.key === 'F1') {
            e.preventDefault();
            this.app.help.show();
            return;
        }

        if (e.key === 'Escape') {
            if (this.app.connections.isConnecting) this.app.connections.cancelConnection();
            else if (!inModal && !typing) this.app.selection.clear();
            if (typing) e.target.blur();
            return;
        }

        if (mod && !e.shiftKey && !e.altKey) {
            switch (e.code) {
                case 'KeyS': e.preventDefault(); this.app.files.showSaveDialog(); return;
                case 'KeyO': e.preventDefault(); this.app.files.openFilePicker(); return;
                case 'KeyN': e.preventDefault(); this.app.files.clearScheme(); return;
                case 'Digit0': case 'Numpad0': e.preventDefault(); this.app.canvas.resetZoom(); return;
            }
        }

        if (typing || inModal) return;

        if (mod) {
            switch (e.code) {
                case 'KeyZ': e.preventDefault(); e.shiftKey ? this.app.history.redo() : this.app.history.undo(); return;
                case 'KeyY': e.preventDefault(); this.app.history.redo(); return;
                case 'KeyC': e.preventDefault(); this.app.selection.copySelected(); return;
                case 'KeyV': e.preventDefault(); this.app.selection.paste(); return;
                case 'KeyA': e.preventDefault(); this.app.selection.selectAll(); return;
            }
            return;
        }

        switch (e.code) {
            case 'Delete':
            case 'Backspace':
                if (this.app.selection.size > 0) {
                    e.preventDefault();
                    this.app.selection.deleteSelected();
                }
                return;
            case 'KeyX':
                if (!e.repeat) this.app.canvas.toggleCuttingMode();
                return;
            case 'Equal':
            case 'NumpadAdd':
                e.preventDefault();
                this.app.canvas.zoomIn();
                return;
            case 'Minus':
            case 'NumpadSubtract':
                e.preventDefault();
                this.app.canvas.zoomOut();
                return;
        }
    }
}
