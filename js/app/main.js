/**
 * Application root: builds every subsystem in dependency order and exposes the operations
 * that span several of them (snapshots for undo, loading schemes, running the graph).
 */
class CipherFlowApp {
    constructor() {
        this.settings = new SettingsSystem(this);
        this.io = new IoPanel(this);
        this.canvas = new CanvasManager(this);
        this.history = new HistoryManager(this);
        this.selection = new SelectionManager(this);
        this.nodes = new NodeManager(this);
        this.connections = new ConnectionManager(this);
        this.engine = new CipherEngine(this);
        this.files = new FileManager(this);
        this.panel = new NodePanel(this);
        this.help = new HelpSystem(this);
        this.shortcuts = new Shortcuts(this);

        this.bindGlobalEvents();
        this.history.reset();
        this.exposeGlobals();
        this.start();
    }

    /* ---------- cross-cutting operations ---------- */

    /** Runs the graph soon (coalesced). */
    execute() {
        this.engine.schedule();
    }

    snapshot() {
        return { nodes: this.nodes.serialize(), connections: this.connections.serialize() };
    }

    /**
     * Makes the live scheme match `state` while touching only what differs.
     * Used by undo/redo, so node DOM (and with it focus, scroll, selection) is preserved where possible.
     */
    applySnapshot(state) {
        const wanted = new Map(state.nodes.map(n => [n.id, n]));

        for (const node of this.nodes.getAllNodes()) {
            if (!wanted.has(node.id) || wanted.get(node.id).type !== node.type) this.nodes.removeNode(node.id, { silent: true });
        }
        for (const n of state.nodes) {
            const existing = this.nodes.get(n.id);
            if (!existing) {
                this.nodes.createNode(n.type, n.x, n.y, { id: n.id, values: n.values, title: n.title, silent: true });
                continue;
            }
            if (existing.x !== n.x || existing.y !== n.y) this.nodes.setPosition(n.id, n.x, n.y);
            if ((existing.title || null) !== (n.title || null)) this.nodes.setTitle(n.id, n.title);
            for (const [name, value] of Object.entries(n.values)) {
                if (JSON.stringify(existing.values[name]) !== JSON.stringify(value)) this.nodes.setValue(n.id, name, JSON.parse(JSON.stringify(value)));
            }
        }

        const key = (c) => `${c.from.node}:${c.from.port}>${c.to.node}:${c.to.port}`;
        const wantedConnections = new Set(state.connections.map(key));
        for (const c of this.connections.serialize()) {
            if (!wantedConnections.has(key(c))) this.connections.disconnect(c.id, { silent: true });
        }
        const present = new Set(this.connections.serialize().map(key));
        for (const c of state.connections) {
            if (present.has(key(c))) continue;
            this.connections.connect(c.from.node, c.from.port, c.to.node, c.to.port, { id: c.id, silent: true });
        }

        this.connections.updateAll();
        this.execute();
    }

    /** Replaces the scheme with a normalized one (file, example, autosave). Undoable. */
    loadScheme(scheme) {
        this.nodes.clear();
        for (const n of scheme.nodes) {
            this.nodes.createNode(n.type, n.x, n.y, { id: n.id, values: n.values, title: n.title, silent: true });
        }
        for (const c of scheme.connections) {
            this.connections.connect(c.from.node, c.from.port, c.to.node, c.to.port, { id: c.id, silent: true });
        }
        this.selection.clear();
        this.connections.updateAll();
        this.history.commit(i18n.t('history.scheme_loaded'));
        this.engine.run();
    }

    clearScheme() {
        this.nodes.clear();
        this.io.clear();
        this.history.commit(i18n.t('history.scheme_cleared'));
        this.engine.run();
    }

    onHistoryChanged() {
        this.files.scheduleAutosave();
    }

    /* ---------- wiring ---------- */

    bindGlobalEvents() {
        document.querySelector('.help-btn')?.addEventListener('click', () => this.help.show());
        document.querySelector('.settings-btn')?.addEventListener('click', () => this.settings.show());
        document.querySelector('.brand')?.addEventListener('click', () => this.help.show());

        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => this.connections.updateAll(), 100);
        });

        window.addEventListener('error', (e) => {
            console.error('Unhandled error:', e.error || e.message);
        });
    }

    /** The easter-egg system looks these up on window. */
    exposeGlobals() {
        window.app = this;
        window.nodeManager = this.nodes;
        window.connectionManager = this.connections;
        window.canvasManager = this.canvas;
        window.cipherEngine = this.engine;
        window.fileManager = this.files;
        window.historyManager = this.history;
        window.selectionManager = this.selection;
        window.helpSystem = this.help;
        window.settingsSystem = this.settings;
        window.showHelp = () => this.help.show();
        window.showNodeHelp = (type) => this.help.showNode(type);
    }

    start() {
        i18n.updateInterface();
        const restored = this.files.restoreAutosave();
        if (!restored && !localStorage.getItem('cipher-flow-visited')) {
            localStorage.setItem('cipher-flow-visited', 'true');
            this.showTutorial();
        }
        this.engine.run();
    }

    showTutorial() {
        const t = (key) => UI.escapeHtml(i18n.t(key));
        const steps = [1, 2, 3, 4].map(n => `
            <li>
                <span class="tutorial-step">${n}</span>
                <div><h4>${t(`tutorial.step${n}_title`)}</h4><p>${t(`tutorial.step${n}_desc`)}</p></div>
            </li>`).join('');
        const { overlay, close } = UI.modal({
            title: i18n.t('tutorial.welcome'),
            icon: 'fas fa-project-diagram',
            className: 'modal-tutorial',
            bodyHtml: `<ol class="tutorial-steps">${steps}</ol>`,
            footerHtml: `
                <button class="btn" data-action="example"><i class="fas fa-download"></i> ${t('button.load_example')}</button>
                <button class="btn btn-primary" data-action="ok">${t('button.got_it')}</button>`,
        });
        overlay.querySelector('[data-action="ok"]').onclick = close;
        overlay.querySelector('[data-action="example"]').onclick = () => {
            close();
            this.files.loadExample('simple-caesar', { confirm: false });
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        new CipherFlowApp();
    } catch (error) {
        console.error('Failed to start CipherFlow:', error);
        alert(i18n.t('error.app_init', { message: error.message }));
    }
});
