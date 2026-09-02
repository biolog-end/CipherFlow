/**
 * Node selection: click / ctrl-click / rubber-band, plus copy, paste and delete of the selected nodes.
 * Copied data uses the scheme format and goes to the system clipboard, so it can be pasted into another tab.
 */
class SelectionManager {
    constructor(app) {
        this.app = app;
        this.selected = new Set();
        this.internalClipboard = null;
        this.box = null;
        this.canvas = document.getElementById('canvas');
        this.bindEvents();
    }

    /* ---------- state ---------- */

    ids() { return [...this.selected]; }
    has(id) { return this.selected.has(id); }
    get size() { return this.selected.size; }

    add(id) {
        const node = this.app.nodes.get(id);
        if (!node) return;
        this.selected.add(id);
        node.element.classList.add('selected');
    }

    deselect(id) {
        this.selected.delete(id);
        this.app.nodes.get(id)?.element.classList.remove('selected');
    }

    toggle(id) {
        this.has(id) ? this.deselect(id) : this.add(id);
    }

    select(ids) {
        this.clear();
        for (const id of ids) this.add(id);
    }

    clear() {
        for (const id of this.ids()) this.deselect(id);
    }

    selectAll() {
        this.select(this.app.nodes.getAllNodes().map(n => n.id));
    }

    /* ---------- rubber band ---------- */

    bindEvents() {
        // a finger on empty canvas pans (see CanvasManager); the rubber band is a mouse tool
        this.canvas.addEventListener('pointerdown', (e) => {
            if (e.button !== 0 || e.ctrlKey || e.metaKey || e.pointerType === 'touch') return;
            if (e.target.closest('.canvas-node') || e.target.closest('.connection-point')) return;
            if (this.app.canvas.isCuttingActive()) return;
            e.preventDefault();
            UI.blurTextControl();
            this.startBox(e);
        });
        document.addEventListener('pointermove', (e) => { if (this.box && e.pointerId === this.box.pointerId) this.updateBox(e); });
        const end = (e) => { if (this.box && e.pointerId === this.box.pointerId) this.endBox(); };
        document.addEventListener('pointerup', end);
        document.addEventListener('pointercancel', end);
    }

    startBox(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.box = { pointerId: e.pointerId, startX: e.clientX - rect.left, startY: e.clientY - rect.top, el: document.createElement('div'), additive: e.shiftKey };
        this.box.el.className = 'selection-box';
        this.canvas.appendChild(this.box.el);
        if (!this.box.additive) this.clear();
    }

    updateBox(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const left = Math.min(x, this.box.startX);
        const top = Math.min(y, this.box.startY);
        const right = Math.max(x, this.box.startX);
        const bottom = Math.max(y, this.box.startY);
        Object.assign(this.box.el.style, { left: `${left}px`, top: `${top}px`, width: `${right - left}px`, height: `${bottom - top}px` });

        for (const node of this.app.nodes.getAllNodes()) {
            const r = node.element.getBoundingClientRect();
            const nodeBox = { left: r.left - rect.left, top: r.top - rect.top, right: r.right - rect.left, bottom: r.bottom - rect.top };
            const hit = nodeBox.left < right && nodeBox.right > left && nodeBox.top < bottom && nodeBox.bottom > top;
            if (hit) this.add(node.id);
            else if (!this.box.additive) this.deselect(node.id);
        }
    }

    endBox() {
        this.box.el.remove();
        this.box = null;
    }

    /* ---------- clipboard ---------- */

    async copySelected() {
        if (this.selected.size === 0) return;
        const nodes = this.app.nodes.serialize().filter(n => this.selected.has(n.id));
        const connections = this.app.connections.serialize().filter(c => this.selected.has(c.from.node) && this.selected.has(c.to.node));
        const payload = { __cipherFlowData: true, version: Scheme.VERSION, nodes, connections };
        this.internalClipboard = payload;
        for (const id of this.selected) {
            const el = this.app.nodes.get(id)?.element;
            if (!el) continue;
            el.classList.add('is-copied');
            setTimeout(() => el.classList.remove('is-copied'), 400);
        }
        try {
            await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        } catch {
            // clipboard access can be denied on file:// — the internal copy still works
        }
        UI.indicator(i18n.t('selection.copied', { count: nodes.length }));
    }

    async paste() {
        let payload = null;
        try {
            const parsed = JSON.parse(await navigator.clipboard.readText());
            if (parsed && parsed.__cipherFlowData) payload = parsed;
        } catch {
            // fall through to the internal clipboard
        }
        payload = payload || this.internalClipboard;
        if (!payload || !Array.isArray(payload.nodes) || payload.nodes.length === 0) {
            UI.indicator(i18n.t('selection.paste_empty'), 'error');
            return;
        }

        let scheme;
        try {
            scheme = Scheme.normalize(payload);
        } catch {
            UI.indicator(i18n.t('selection.paste_empty'), 'error');
            return;
        }

        // drop the group so its centre lands in the middle of the viewport
        const center = this.app.canvas.viewportCenterWorld();
        const avgX = scheme.nodes.reduce((s, n) => s + n.x, 0) / scheme.nodes.length;
        const avgY = scheme.nodes.reduce((s, n) => s + n.y, 0) / scheme.nodes.length;
        const dx = center.x - avgX + 20;
        const dy = center.y - avgY + 20;

        const idMap = new Map();
        for (const n of scheme.nodes) {
            const created = this.app.nodes.createNode(n.type, n.x + dx, n.y + dy, { values: n.values, title: n.title, silent: true });
            idMap.set(n.id, created.id);
        }
        for (const c of scheme.connections) {
            this.app.connections.connect(idMap.get(c.from.node), c.from.port, idMap.get(c.to.node), c.to.port, { silent: true });
        }
        this.select([...idMap.values()]);
        this.app.history.commit(i18n.t('selection.pasted', { count: idMap.size }));
        UI.indicator(i18n.t('selection.pasted', { count: idMap.size }));
        this.app.execute();
    }

    deleteSelected() {
        const ids = this.ids();
        if (ids.length === 0) return;
        for (const id of ids) this.app.nodes.removeNode(id, { silent: true });
        this.clear();
        this.app.settings.playSound('node_delete');
        this.app.history.commit(i18n.t('selection.deleted', { count: ids.length }));
        UI.indicator(i18n.t('selection.deleted', { count: ids.length }));
        this.app.execute();
    }
}
