/**
 * Undo / redo built on whole-scheme snapshots.
 *
 * Every user gesture (create, delete, move a group, connect, cut, paste, edit a field, load, clear)
 * ends with one commit(), which stores the scheme as it is now. Undo restores the previous snapshot
 * by reconciling the live nodes and connections with it — nothing is rebuilt that did not change,
 * so positions, selection and focus survive.
 */
class HistoryManager {
    constructor(app) {
        this.app = app;
        this.stack = [];
        this.index = -1;
        this.limit = 100;
        this.replaying = false;
        this.pending = null;
    }

    /** Sets the baseline snapshot; called once the app is ready and after a clear/load. */
    reset() {
        this.cancelPending();
        this.stack = [{ label: '', state: this.app.snapshot() }];
        this.index = 0;
    }

    get canUndo() { return this.index > 0; }
    get canRedo() { return this.index < this.stack.length - 1; }

    commit(label) {
        if (this.replaying) return;
        this.cancelPending();
        const state = this.app.snapshot();
        if (this.index >= 0 && Scheme.equal(state, this.stack[this.index].state)) return;
        this.stack.splice(this.index + 1);
        this.stack.push({ label, state });
        if (this.stack.length > this.limit) this.stack.shift();
        this.index = this.stack.length - 1;
        this.app.onHistoryChanged();
    }

    /** Coalesces rapid edits (typing) into one entry. */
    commitDebounced(label, delay = 500) {
        if (this.replaying) return;
        this.cancelPending();
        this.pending = setTimeout(() => {
            this.pending = null;
            this.commit(label);
        }, delay);
    }

    cancelPending() {
        if (this.pending) {
            clearTimeout(this.pending);
            this.pending = null;
        }
    }

    /** Flushes a pending debounced commit so undo sees the latest text. */
    flush() {
        if (!this.pending) return;
        const label = i18n.t('history.field_changed');
        this.cancelPending();
        this.commit(label);
    }

    undo() {
        this.flush();
        if (!this.canUndo) {
            UI.indicator(i18n.t('history.nothing_to_undo'));
            return;
        }
        const undone = this.stack[this.index];
        this.index--;
        this.replay(this.stack[this.index].state);
        UI.indicator(i18n.t('history.undone', { description: undone.label }));
    }

    redo() {
        this.flush();
        if (!this.canRedo) {
            UI.indicator(i18n.t('history.nothing_to_redo'));
            return;
        }
        this.index++;
        this.replay(this.stack[this.index].state);
        UI.indicator(i18n.t('history.redone', { description: this.stack[this.index].label }));
    }

    replay(state) {
        this.replaying = true;
        try {
            this.app.applySnapshot(state);
        } catch (error) {
            console.error('History replay failed:', error);
            UI.indicator(i18n.t('history.undo_error'), 'error');
        } finally {
            this.replaying = false;
        }
        this.app.onHistoryChanged();
    }
}
