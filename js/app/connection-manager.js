/**
 * Connections between node ports and their SVG paths.
 * A connection is { id, from: { nodeId, port }, to: { nodeId, port }, element } — always output → input.
 * Also owns the encrypt/decrypt switch, since it decides which way the arrows point.
 */
class ConnectionManager {
    constructor(app) {
        this.app = app;
        this.connections = new Map();
        this.counter = 0;
        this.reverseMode = false;
        this.svg = document.getElementById('connections');
        this.canvas = document.getElementById('canvas');
        this.drag = null;

        this.bindEvents();
    }

    /* ---------- ids ---------- */

    nextId() {
        let id;
        do { id = `connection_${this.counter++}`; } while (this.connections.has(id));
        return id;
    }

    reserveId(id) {
        const m = /^connection_(\d+)$/.exec(id);
        if (m) this.counter = Math.max(this.counter, parseInt(m[1], 10) + 1);
    }

    /* ---------- model ---------- */

    /**
     * @returns {object|null} the connection, or null when it is not allowed
     */
    connect(fromNodeId, fromPort, toNodeId, toPort, options = {}) {
        if (!this.canConnect(fromNodeId, fromPort, toNodeId, toPort)) return null;
        const fromEl = this.app.nodes.getPortElement(fromNodeId, 'output', fromPort);
        const toEl = this.app.nodes.getPortElement(toNodeId, 'input', toPort);
        if (!fromEl || !toEl) return null;

        // an input accepts one source: a new link replaces the previous one
        for (const existing of this.connectionsTo(toNodeId, toPort)) this.disconnect(existing.id, { silent: true });

        const id = options.id || this.nextId();
        this.reserveId(id);
        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        element.classList.add('connection-line');
        element.dataset.connectionId = id;
        this.svg.appendChild(element);

        const connection = { id, from: { nodeId: fromNodeId, port: fromPort }, to: { nodeId: toNodeId, port: toPort }, element };
        this.connections.set(id, connection);
        this.updatePath(connection);

        if (!options.silent) {
            this.app.settings.playSound('connection');
            this.app.history.commit(i18n.t('history.connection_created'));
            this.app.execute();
        }
        this.emit('connection-added', id);
        return connection;
    }

    canConnect(fromNodeId, fromPort, toNodeId, toPort) {
        if (fromNodeId === toNodeId) return false;
        const fromDef = NodeRegistry.get(this.app.nodes.get(fromNodeId)?.type);
        const toDef = NodeRegistry.get(this.app.nodes.get(toNodeId)?.type);
        if (!fromDef || !toDef) return false;
        if (!fromDef.outputs.some(p => p.name === fromPort)) return false;
        if (!toDef.inputs.some(p => p.name === toPort)) return false;
        return !this.getAllConnections().some(c =>
            c.from.nodeId === fromNodeId && c.from.port === fromPort && c.to.nodeId === toNodeId && c.to.port === toPort);
    }

    disconnect(id, options = {}) {
        const connection = this.connections.get(id);
        if (!connection) return;
        connection.element.remove();
        this.connections.delete(id);
        if (!options.silent) {
            this.app.settings.playSound('disconnect');
            this.app.history.commit(i18n.t('history.connection_removed'));
            this.app.execute();
        }
        this.emit('connection-removed', id);
    }

    removeNodeConnections(nodeId, options = {}) {
        for (const c of this.getAllConnections()) {
            if (c.from.nodeId === nodeId || c.to.nodeId === nodeId) this.disconnect(c.id, options);
        }
    }

    clear() {
        for (const c of this.connections.values()) c.element.remove();
        this.connections.clear();
        this.counter = 0;
    }

    getAllConnections() {
        return [...this.connections.values()];
    }

    connectionsTo(nodeId, port) {
        return this.getAllConnections().filter(c => c.to.nodeId === nodeId && c.to.port === port);
    }

    /** Scheme-format connections: { id, from: { node, port }, to: { node, port } }. */
    serialize() {
        return this.getAllConnections().map(c => ({
            id: c.id,
            from: { node: c.from.nodeId, port: c.from.port },
            to: { node: c.to.nodeId, port: c.to.port },
        }));
    }

    emit(action, connectionId) {
        document.dispatchEvent(new CustomEvent('connections-updated', { detail: { action, connectionId } }));
    }

    /* ---------- geometry ---------- */

    /** World-space endpoints of a connection, or null when a port element is missing. */
    getSegment(connection) {
        const fromEl = this.app.nodes.getPortElement(connection.from.nodeId, 'output', connection.from.port);
        const toEl = this.app.nodes.getPortElement(connection.to.nodeId, 'input', connection.to.port);
        if (!fromEl || !toEl) return null;
        return { p1: this.app.canvas.elementCenterWorld(fromEl), p2: this.app.canvas.elementCenterWorld(toEl) };
    }

    updatePath(connection) {
        const segment = this.getSegment(connection);
        if (!segment) return;
        const { p1, p2 } = segment;
        connection.element.setAttribute('d', this.reverseMode
            ? ConnectionManager.bezier(p2.x, p2.y, p1.x, p1.y)
            : ConnectionManager.bezier(p1.x, p1.y, p2.x, p2.y));
        connection.element.classList.toggle('reverse', this.reverseMode);
    }

    static bezier(x1, y1, x2, y2) {
        const pull = Math.max(Math.abs(x2 - x1) * 0.5, 50);
        return `M ${x1} ${y1} C ${x1 + pull} ${y1}, ${x2 - pull} ${y2}, ${x2} ${y2}`;
    }

    updateConnections(nodeId) {
        for (const c of this.connections.values()) {
            if (c.from.nodeId === nodeId || c.to.nodeId === nodeId) this.updatePath(c);
        }
    }

    updateAll() {
        for (const c of this.connections.values()) this.updatePath(c);
    }

    /* ---------- dropping a node onto a connection ---------- */

    /**
     * The connection passing closest to any of `points` (world space) within `maxDistance`,
     * ignoring connections attached to `excludeNodeId`. Null when none is close enough.
     */
    nearestConnection(points, maxDistance, excludeNodeId = null) {
        let best = null;
        for (const c of this.connections.values()) {
            if (c.from.nodeId === excludeNodeId || c.to.nodeId === excludeNodeId) continue;
            const total = c.element.getTotalLength();
            if (!total) continue;
            const steps = Math.max(8, Math.min(48, Math.round(total / 12)));
            for (let i = 0; i <= steps; i++) {
                const p = c.element.getPointAtLength(total * i / steps);
                for (const point of points) {
                    const d = Math.hypot(p.x - point.x, p.y - point.y);
                    if (d <= maxDistance && (!best || d < best.distance)) best = { connection: c, distance: d };
                }
            }
        }
        return best ? best.connection : null;
    }

    /** Ports a node would use when spliced into a connection: its first free data input and first free output. */
    insertionPorts(nodeId) {
        const node = this.app.nodes.get(nodeId);
        if (!node) return null;
        const def = NodeRegistry.get(node.type);
        const all = this.getAllConnections();
        const input = NodeRegistry.dataInputs(def).find(p => !all.some(c => c.to.nodeId === nodeId && c.to.port === p.name));
        const output = def.outputs.find(p => !all.some(c => c.from.nodeId === nodeId && c.from.port === p.name));
        return input && output ? { input: input.name, output: output.name } : null;
    }

    /** Splices a node into a connection: A → B becomes A → node → B. One history entry. */
    insertNode(nodeId, connection) {
        const ports = this.insertionPorts(nodeId);
        if (!ports || !this.connections.has(connection.id)) return false;
        const { from, to } = connection;
        this.disconnect(connection.id, { silent: true });
        this.connect(from.nodeId, from.port, nodeId, ports.input, { silent: true });
        this.connect(nodeId, ports.output, to.nodeId, to.port, { silent: true });
        this.app.settings.playSound('connection');
        this.app.history.commit(i18n.t('history.node_inserted', { title: this.app.nodes.titleOf(this.app.nodes.get(nodeId)) }));
        this.app.execute();
        return true;
    }

    /** Marks the connection a dragged node would be inserted into (null clears the mark). */
    setInsertTarget(connection) {
        if (this.insertTarget === connection) return;
        if (this.insertTarget) this.insertTarget.element.classList.remove('insert-target');
        this.insertTarget = connection || null;
        if (connection) connection.element.classList.add('insert-target');
    }

    /* ---------- encrypt / decrypt switch ---------- */

    setReverseMode(reverse) {
        this.reverseMode = Boolean(reverse);
        document.body.classList.toggle('mode-decrypt', this.reverseMode);
        const toggle = document.getElementById('modeSwitch');
        if (toggle && toggle.checked !== this.reverseMode) toggle.checked = this.reverseMode;
        this.updateAll();
        this.app.io.applyMode(this.reverseMode);
        this.app.execute();
    }

    /* ---------- mouse interaction ---------- */

    bindEvents() {
        const toggle = document.getElementById('modeSwitch');
        if (toggle) toggle.addEventListener('change', () => {
            this.app.settings.playSound('mode_switch');
            this.setReverseMode(toggle.checked);
        });

        this.canvas.addEventListener('pointerdown', (e) => {
            const point = e.target.closest('.connection-point');
            if (!point) return;
            e.stopPropagation();
            e.preventDefault();
            if (e.shiftKey) {
                this.breakAt(point);
            } else if (e.button === 0) {
                this.startDrag(point, e);
            }
        });

        this.canvas.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.connection-point')) e.preventDefault();
        });

        document.addEventListener('pointermove', (e) => {
            if (this.drag && e.pointerId === this.drag.pointerId) this.updateDrag(e);
        });

        const finish = (e) => {
            if (!this.drag || e.pointerId !== this.drag.pointerId) return;
            const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('.connection-point');
            this.finishDrag(target);
        };
        document.addEventListener('pointerup', finish);
        document.addEventListener('pointercancel', (e) => { if (this.drag && e.pointerId === this.drag.pointerId) this.cancelDrag(); });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.drag) this.cancelDrag();
        });
    }

    get isConnecting() {
        return Boolean(this.drag);
    }

    startDrag(point, e) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('connection-line', 'temporary');
        this.svg.appendChild(path);
        this.drag = { point, path, start: this.app.canvas.elementCenterWorld(point), pointerId: e.pointerId };
        point.classList.add('connecting');
        this.canvas.classList.add('is-connecting');
        this.updateDrag(e);
    }

    updateDrag(e) {
        const rect = this.canvas.getBoundingClientRect();
        const end = this.app.canvas.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
        const { start } = this.drag;
        const d = this.drag.point.dataset.direction === 'output'
            ? ConnectionManager.bezier(start.x, start.y, end.x, end.y)
            : ConnectionManager.bezier(end.x, end.y, start.x, start.y);
        this.drag.path.setAttribute('d', d);
    }

    finishDrag(target) {
        const source = this.drag.point;
        this.cancelDrag();
        if (!target || target === source) return;
        const a = source.dataset;
        const b = target.dataset;
        if (a.direction === b.direction) return;
        const out = a.direction === 'output' ? a : b;
        const inp = a.direction === 'input' ? a : b;
        this.connect(out.nodeId, out.port, inp.nodeId, inp.port);
    }

    cancelDrag() {
        if (!this.drag) return;
        this.drag.point.classList.remove('connecting');
        this.drag.path.remove();
        this.drag = null;
        this.canvas.classList.remove('is-connecting');
    }

    cancelConnection() {
        this.cancelDrag();
    }

    /** Shift+click on a port removes every connection attached to it. */
    breakAt(point) {
        const { nodeId, direction, port } = point.dataset;
        const victims = this.getAllConnections().filter(c => direction === 'input'
            ? c.to.nodeId === nodeId && c.to.port === port
            : c.from.nodeId === nodeId && c.from.port === port);
        if (victims.length === 0) return;
        for (const c of victims) this.disconnect(c.id, { silent: true });
        this.app.settings.playSound('disconnect');
        this.app.history.commit(i18n.t('history.connection_removed'));
        this.app.execute();
    }
}
