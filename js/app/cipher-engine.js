/**
 * Runs the current scheme through ChainExecutor and pushes the result into the UI.
 * Execution is coalesced with a short delay so typing does not re-run the graph on every keystroke.
 * The graph is evaluated in a Web Worker (see EngineWorker); when workers are unavailable it runs inline.
 * A run that takes noticeably long shows a status bar so the user knows the app is busy, not frozen.
 */
class CipherEngine {
    /** Runs longer than this show the "computing" status. */
    static STATUS_AFTER_MS = 350;

    constructor(app) {
        this.app = app;
        this.executor = new ChainExecutor((key, params) => i18n.t(key, params));
        this.worker = null;
        if (EngineWorker.isSupported()) {
            try {
                this.worker = new EngineWorker();
            } catch (error) {
                console.warn('Engine worker unavailable, running inline:', error);
            }
        }
        this.timer = null;
        this.runId = 0;
        this.lastResults = new Map();
        this.status = this.createStatus();
        this.statusTimer = null;
        this.statusTicker = null;
        i18n.onLanguageChange(() => this.refreshStatusTexts());
    }

    schedule(delay = 60) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.run(), delay);
    }

    graph() {
        return {
            nodes: this.app.nodes.serialize(),
            connections: this.app.connections.getAllConnections().map(c => ({ id: c.id, from: c.from, to: c.to })),
            reverse: this.app.connections.reverseMode,
            sourceText: this.app.io.sourceText,
        };
    }

    run() {
        clearTimeout(this.timer);
        this.timer = null;
        const id = ++this.runId;
        const graph = this.graph();

        if (!this.worker) {
            try {
                this.apply(this.executor.run(graph), graph.reverse);
            } catch (error) {
                this.fail(error);
            }
            return;
        }

        this.scheduleStatus();
        this.worker.run(graph, i18n.currentLanguage).then(
            (result) => {
                if (id !== this.runId) return;
                this.hideStatus();
                this.apply(result, graph.reverse);
            },
            (error) => {
                if (error && error.superseded) return;
                if (id !== this.runId) return;
                this.hideStatus();
                this.fail(error);
            },
        );
    }

    apply({ results, output }, reverse) {
        this.lastResults = results;
        this.app.io.resultText = output;
        this.app.nodes.updateMonitors(results, reverse);
        document.dispatchEvent(new CustomEvent('chain-executed', { detail: { reverse, output } }));
    }

    fail(error) {
        console.error('Chain execution failed:', error);
        this.app.io.resultText = i18n.t('error.execution_failed', { message: error.message });
    }

    /** Stops the run in flight; the result box explains why it is empty. */
    cancel() {
        if (!this.worker || !this.worker.busy) return;
        this.runId++;
        this.worker.abortCurrent();
        this.hideStatus();
        this.app.io.resultText = i18n.t('error.engine_cancelled');
    }

    /* ---------- status bar ---------- */

    createStatus() {
        const el = document.createElement('div');
        el.className = 'engine-status';
        el.hidden = true;
        el.innerHTML = `
            <span class="engine-status-spinner"></span>
            <div class="engine-status-text">
                <strong></strong>
                <span class="engine-status-hint"></span>
            </div>
            <span class="engine-status-elapsed"></span>
            <button type="button" class="btn btn-small engine-status-cancel"></button>`;
        el.querySelector('.engine-status-cancel').addEventListener('click', () => this.cancel());
        document.querySelector('.workspace').appendChild(el);
        this.refreshStatusTexts(el);
        return el;
    }

    refreshStatusTexts(el = this.status) {
        el.querySelector('strong').textContent = i18n.t('engine.computing');
        el.querySelector('.engine-status-hint').textContent = i18n.t('engine.computing_hint');
        el.querySelector('.engine-status-cancel').textContent = i18n.t('engine.cancel');
    }

    scheduleStatus() {
        if (this.statusTimer || !this.status.hidden) return;
        this.statusTimer = setTimeout(() => {
            this.statusTimer = null;
            if (!this.worker.busy) return;
            this.status.hidden = false;
            this.updateElapsed();
            this.statusTicker = setInterval(() => this.updateElapsed(), 1000);
        }, CipherEngine.STATUS_AFTER_MS);
    }

    updateElapsed() {
        const seconds = Math.round(this.worker.elapsed / 1000);
        this.status.querySelector('.engine-status-elapsed').textContent = i18n.t('engine.elapsed', { seconds: String(seconds) });
    }

    hideStatus() {
        clearTimeout(this.statusTimer);
        clearInterval(this.statusTicker);
        this.statusTimer = null;
        this.statusTicker = null;
        this.status.hidden = true;
    }
}
