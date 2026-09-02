/**
 * Runs ChainExecutor inside a Web Worker so heavy schemes never freeze the interface.
 *
 * The worker is created from a Blob: the app runs from file://, where workers cannot load
 * script files. Its source is assembled from EngineModules (see js/core/modules.js).
 * Only the newest request matters — a queued request replaces the previous one, and a run
 * that has already been going for a while is killed to make room for the newer input.
 */
class EngineWorker {
    /** A run older than this is terminated (worker restart) when newer input arrives. */
    static STALE_AFTER_MS = 400;

    static isSupported() {
        return typeof Worker !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
    }

    /** Complete source of the worker script: engine modules plus the message loop. */
    static source() {
        return `${EngineModules.source()}

var localStorage = { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} };
var i18n = new I18n();
var executor = new ChainExecutor(function (key, params) { return i18n.t(key, params); });

self.onmessage = function (event) {
    var job = event.data;
    i18n.currentLanguage = job.language;
    try {
        var result = executor.run(job.graph);
        self.postMessage({ id: job.id, ok: true, results: result.results, output: result.output });
    } catch (error) {
        self.postMessage({ id: job.id, ok: false, error: error.message });
    }
};
`;
    }

    constructor() {
        this.url = URL.createObjectURL(new Blob([EngineWorker.source()], { type: 'text/javascript' }));
        this.worker = null;
        this.current = null;
        this.next = null;
        this.counter = 0;
    }

    /**
     * @param {object} graph argument for ChainExecutor.run
     * @param {string} language i18n language for error messages
     * @returns {Promise<{results: Map<string, object>, output: string}>}
     *          rejects with { superseded: true } when a newer request replaced this one
     */
    run(graph, language) {
        return new Promise((resolve, reject) => {
            if (this.next) this.next.reject({ superseded: true });
            this.next = { id: ++this.counter, graph, language, resolve, reject };
            if (this.current && performance.now() - this.current.startedAt > EngineWorker.STALE_AFTER_MS) this.abortCurrent();
            this.pump();
        });
    }

    get busy() {
        return this.current !== null;
    }

    /** How long the run in flight has been going, in milliseconds. */
    get elapsed() {
        return this.current ? performance.now() - this.current.startedAt : 0;
    }

    pump() {
        if (this.current || !this.next) return;
        this.current = this.next;
        this.next = null;
        this.current.startedAt = performance.now();
        if (!this.worker) this.spawn();
        this.worker.postMessage({ id: this.current.id, graph: this.current.graph, language: this.current.language });
    }

    spawn() {
        this.worker = new Worker(this.url);
        this.worker.onmessage = (event) => this.onMessage(event.data);
        this.worker.onerror = (event) => this.onError(event);
    }

    onMessage(data) {
        const job = this.current;
        if (!job || data.id !== job.id) return;
        this.current = null;
        if (data.ok) job.resolve({ results: data.results, output: data.output });
        else job.reject(new Error(data.error));
        this.pump();
    }

    onError(event) {
        console.error('Engine worker failed:', event.message || event);
        const job = this.current;
        this.current = null;
        this.restart();
        if (job) job.reject(new Error(event.message || 'worker error'));
        this.pump();
    }

    /** Kills the run in flight; its promise rejects as superseded. */
    abortCurrent() {
        const job = this.current;
        this.current = null;
        this.restart();
        if (job) job.reject({ superseded: true });
    }

    restart() {
        if (this.worker) this.worker.terminate();
        this.worker = null;
    }
}
