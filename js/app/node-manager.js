/**
 * Owns node instances and their DOM. A node instance is
 *   { id, type, x, y, title, values, element }
 * where `title` is null unless the user renamed the node and `values` holds field values keyed by name.
 * Everything else (labels, ports, icon, colour) comes from the NodeRegistry definition.
 */
class NodeManager {
    constructor(app) {
        this.app = app;
        this.nodes = new Map();
        this.counter = 0;
        this.layer = document.getElementById('nodesLayer');
        this.canvas = document.getElementById('canvas');

        this.injectColorStyles();
        this.bindEvents();
        i18n.onLanguageChange(() => this.refreshTexts());
    }

    /* ---------- registry-driven styling ---------- */

    injectColorStyles() {
        const css = NodeRegistry.all().map(def => {
            const rgb = NodeManager.hexToRgb(def.color) || '156, 163, 175';
            return `.canvas-node[data-node-type="${def.type}"], .node-item[data-type="${def.type}"] { --node-color: ${def.color}; --node-color-rgb: ${rgb}; }`;
        }).join('\n');
        let style = document.getElementById('node-color-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'node-color-styles';
            document.head.appendChild(style);
        }
        style.textContent = css;
    }

    static hexToRgb(hex) {
        const m = /^#([0-9a-f]{6})$/i.exec(hex || '');
        if (!m) return null;
        const n = parseInt(m[1], 16);
        return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
    }

    /* ---------- ids ---------- */

    nextId() {
        let id;
        do { id = `node_${this.counter++}`; } while (this.nodes.has(id));
        return id;
    }

    /** Keeps the counter ahead of ids that came from a file or a snapshot. */
    reserveId(id) {
        const m = /^node_(\d+)$/.exec(id);
        if (m) this.counter = Math.max(this.counter, parseInt(m[1], 10) + 1);
    }

    /* ---------- lifecycle ---------- */

    /**
     * @param {string} type
     * @param {number} x world coordinates
     * @param {number} y
     * @param {{ id?: string, values?: object, title?: string|null, silent?: boolean }} options
     *        silent: no selection change, no sound, no history — used by undo/redo and file loading
     */
    createNode(type, x, y, options = {}) {
        const def = NodeRegistry.get(type);
        if (!def) throw new Error(i18n.t('error.node_not_found'));
        const id = options.id || this.nextId();
        this.reserveId(id);

        const node = {
            id,
            type,
            x,
            y,
            title: options.title || null,
            values: { ...NodeRegistry.defaultValues(def), ...(options.values || {}) },
            element: null,
        };
        node.element = this.render(node);
        this.layer.appendChild(node.element);
        this.nodes.set(id, node);
        this.updateConditionalFields(node);

        if (!options.silent) {
            node.element.classList.add('is-new');
            this.app.selection.select([id]);
            this.app.settings.playSound('node_create');
            this.app.history.commit(i18n.t('history.node_created', { title: this.titleOf(node) }));
        }
        this.emitNodesUpdated('node-added', node);
        return node;
    }

    removeNode(id, options = {}) {
        const node = this.nodes.get(id);
        if (!node) return;
        this.app.connections.removeNodeConnections(id, { silent: true });
        node.element.remove();
        this.nodes.delete(id);
        this.app.selection.deselect(id);

        if (!options.silent) {
            this.app.settings.playSound('node_delete');
            this.app.history.commit(i18n.t('history.node_deleted', { title: this.titleOf(node) }));
            this.app.execute();
        }
        this.emitNodesUpdated('node-removed', node);
    }

    clear() {
        this.app.connections.clear();
        for (const node of this.nodes.values()) node.element.remove();
        this.nodes.clear();
        this.app.selection.clear();
        this.counter = 0;
        document.dispatchEvent(new CustomEvent('nodes-updated', { detail: { action: 'cleared' } }));
    }

    get(id) {
        return this.nodes.get(id) || null;
    }

    getAllNodes() {
        return [...this.nodes.values()];
    }

    titleOf(node) {
        return node.title || i18n.t(NodeRegistry.get(node.type).title);
    }

    emitNodesUpdated(action, node) {
        document.dispatchEvent(new CustomEvent('nodes-updated', { detail: { action, nodeId: node.id, nodeType: node.type } }));
    }

    /* ---------- state ---------- */

    setPosition(id, x, y) {
        const node = this.nodes.get(id);
        if (!node) return;
        node.x = x;
        node.y = y;
        node.element.style.transform = `translate(${x}px, ${y}px)`;
        this.app.connections.updateConnections(id);
    }

    /** Updates a field value; syncs the DOM unless the change came from that very control. */
    setValue(id, name, value, { fromDom = false } = {}) {
        const node = this.nodes.get(id);
        if (!node) return;
        node.values[name] = value;
        if (!fromDom) this.syncFieldControl(node, name);
        this.updateConditionalFields(node);
    }

    setTitle(id, title) {
        const node = this.nodes.get(id);
        if (!node) return;
        node.title = title && title.trim() ? title.trim() : null;
        node.element.querySelector('.node-title').textContent = this.titleOf(node);
    }

    serialize() {
        return this.getAllNodes().map(node => ({
            id: node.id,
            type: node.type,
            x: node.x,
            y: node.y,
            ...(node.title ? { title: node.title } : {}),
            values: JSON.parse(JSON.stringify(node.values)),
        }));
    }

    getPortElement(id, direction, port) {
        const node = this.nodes.get(id);
        if (!node) return null;
        return node.element.querySelector(`.connection-point[data-direction="${direction}"][data-port="${port}"]`);
    }

    /* ---------- rendering ---------- */

    render(node) {
        const def = NodeRegistry.get(node.type);
        const template = NodeRegistry.template(node.type);
        const el = document.createElement('div');
        el.className = 'canvas-node';
        el.dataset.nodeId = node.id;
        el.dataset.nodeType = node.type;
        el.style.transform = `translate(${node.x}px, ${node.y}px)`;
        node.element = el;

        el.appendChild(this.renderHeader(node, template));

        const inputs = def.inputs.filter(p => p.label);
        const outputs = def.outputs.filter(p => p.label);
        if (inputs.length) el.appendChild(this.renderPortRows(node, template.inputs.filter(p => p.label), 'input'));

        const body = document.createElement('div');
        body.className = 'node-body';
        if (def.monitor) body.appendChild(this.renderMonitor(node));
        for (const field of template.fields) body.appendChild(this.renderField(node, field));
        if (body.childElementCount) el.appendChild(body);
        if (template.fields.some(f => f.type === 'rules')) this.renderRulesList(node);

        if (outputs.length) el.appendChild(this.renderPortRows(node, template.outputs.filter(p => p.label), 'output'));

        for (const port of def.inputs.filter(p => !p.label)) el.appendChild(this.renderPoint(node, port, 'input'));
        for (const port of def.outputs.filter(p => !p.label)) el.appendChild(this.renderPoint(node, port, 'output'));
        return el;
    }

    renderHeader(node, template) {
        const header = document.createElement('div');
        header.className = 'node-header';
        header.innerHTML = `
            <i class="node-icon ${template.icon}"></i>
            <span class="node-title" spellcheck="false"></span>
            <button class="node-btn node-help" type="button"><i class="fas fa-question"></i></button>
            <button class="node-btn node-remove" type="button"><i class="fas fa-times"></i></button>`;
        const title = header.querySelector('.node-title');
        title.textContent = this.titleOf(node);
        title.title = i18n.t('node.rename_hint');
        // double-click to rename; a single press on the title drags the node like the rest of the header
        title.addEventListener('dblclick', (e) => {
            e.preventDefault();
            title.contentEditable = 'true';
            title.focus();
            document.getSelection()?.selectAllChildren(title);
        });
        title.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); title.blur(); }
            if (e.key === 'Escape') { title.textContent = this.titleOf(node); title.blur(); }
            e.stopPropagation();
        });
        title.addEventListener('blur', () => {
            title.contentEditable = 'false';
            const text = title.textContent.trim();
            const defaultTitle = i18n.t(NodeRegistry.get(node.type).title);
            const newTitle = text && text !== defaultTitle ? text : null;
            if (newTitle !== node.title) {
                this.setTitle(node.id, newTitle);
                this.app.history.commit(i18n.t('history.node_renamed'));
            } else {
                title.textContent = this.titleOf(node);
            }
        });
        header.querySelector('.node-help').title = i18n.t('node.show_help_tooltip');
        header.querySelector('.node-help').addEventListener('click', (e) => {
            e.stopPropagation();
            this.app.help.showNode(node.type);
        });
        header.querySelector('.node-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeNode(node.id);
        });
        return header;
    }

    renderPortRows(node, ports, direction) {
        const wrap = document.createElement('div');
        wrap.className = `node-ports node-ports-${direction}`;
        for (const port of ports) {
            const row = document.createElement('div');
            row.className = 'port-row';
            row.dataset.port = port.name;
            const point = this.renderPoint(node, port, direction);
            const label = document.createElement('span');
            label.className = 'port-label';
            label.textContent = port.label;
            if (direction === 'input') row.append(point, label);
            else row.append(label, point);
            wrap.appendChild(row);
        }
        return wrap;
    }

    renderPoint(node, port, direction) {
        const point = document.createElement('span');
        point.className = `connection-point ${direction}${port.label ? ' labeled' : ''}${port.kind === 'param' ? ' param' : ''}`;
        point.dataset.nodeId = node.id;
        point.dataset.direction = direction;
        point.dataset.port = port.name;
        if (port.color) point.style.setProperty('--port-color', port.color);
        return point;
    }

    renderMonitor(node) {
        const wrap = document.createElement('div');
        wrap.className = 'monitor';
        wrap.innerHTML = `<pre class="monitor-display"></pre><button class="node-btn monitor-copy" type="button"><i class="fas fa-copy"></i></button>`;
        wrap.querySelector('.monitor-display').textContent = i18n.t('monitor.waiting_for_data');
        const copy = wrap.querySelector('.monitor-copy');
        copy.title = i18n.t('monitor.copy_content');
        copy.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                await navigator.clipboard.writeText(node.monitorValue || '');
                UI.notify(i18n.t('notification.monitor_copied'), 'success');
            } catch {
                UI.notify(i18n.t('error.copy_failed'), 'error');
            }
        });
        return wrap;
    }

    renderField(node, field) {
        const wrap = document.createElement('div');
        wrap.className = `node-field field-${field.type}`;
        wrap.dataset.field = field.name;
        const controlId = `${node.id}_${field.name}`;

        if (field.type === 'rules') {
            wrap.appendChild(this.renderRulesEditor(node, field));
            return wrap;
        }

        const label = document.createElement('label');
        label.htmlFor = controlId;
        label.textContent = field.label;
        if (field.tooltip) label.title = field.tooltip;

        let control;
        switch (field.type) {
            case 'select':
                control = document.createElement('select');
                for (const option of field.options || []) {
                    const opt = document.createElement('option');
                    opt.value = option.value;
                    opt.textContent = option.label;
                    control.appendChild(opt);
                }
                break;
            case 'textarea':
                control = document.createElement('textarea');
                control.rows = field.rows || 3;
                break;
            case 'checkbox':
                control = document.createElement('input');
                control.type = 'checkbox';
                break;
            case 'number':
                control = document.createElement('input');
                control.type = 'number';
                if (field.min !== undefined) control.min = field.min;
                if (field.max !== undefined) control.max = field.max;
                break;
            default:
                control = document.createElement('input');
                control.type = 'text';
        }
        control.name = field.name;
        control.id = controlId;
        if (field.tooltip) control.title = field.tooltip;

        const isImmediate = field.type === 'select' || field.type === 'checkbox';
        const onChange = () => {
            const value = control.type === 'checkbox' ? control.checked
                : control.type === 'number' ? (control.value === '' ? '' : Number(control.value))
                : control.value;
            this.setValue(node.id, field.name, value, { fromDom: true });
            this.app.execute();
            if (isImmediate) this.app.history.commit(i18n.t('history.field_changed'));
            else this.app.history.commitDebounced(i18n.t('history.field_changed'));
        };
        control.addEventListener(isImmediate ? 'change' : 'input', onChange);

        if (field.type === 'checkbox') {
            wrap.append(control, label);
        } else {
            if (field.label) wrap.appendChild(label);
            wrap.appendChild(control);
        }
        this.writeControl(control, node.values[field.name]);
        return wrap;
    }

    writeControl(control, value) {
        if (control.type === 'checkbox') control.checked = value === true || value === 'true';
        else control.value = value == null ? '' : value;
    }

    syncFieldControl(node, name) {
        const field = NodeRegistry.get(node.type).fields.find(f => f.name === name);
        if (!field) return;
        if (field.type === 'rules') {
            this.renderRulesList(node);
            return;
        }
        const control = node.element.querySelector(`[name="${name}"]`);
        if (control) this.writeControl(control, node.values[name]);
    }

    /** Fields with showWhen are visible only for the listed values of another field. */
    updateConditionalFields(node) {
        const def = NodeRegistry.get(node.type);
        for (const field of def.fields) {
            if (!field.showWhen) continue;
            const wrap = node.element.querySelector(`.node-field[data-field="${field.name}"]`);
            if (!wrap) continue;
            const visible = field.showWhen.values.includes(String(node.values[field.showWhen.field]));
            wrap.hidden = !visible;
        }
    }

    /* ---------- rules editor (multi-replacer) ---------- */

    renderRulesEditor(node, field) {
        const editor = document.createElement('div');
        editor.className = 'rules-editor';
        editor.innerHTML = `
            <div class="rules-header"><span></span><button type="button" class="btn btn-small rules-add"><i class="fas fa-plus"></i> <span></span></button></div>
            <div class="rules-list"></div>`;
        editor.querySelector('.rules-header > span').textContent = field.label;
        editor.querySelector('.rules-add span').textContent = i18n.t('button.add');
        editor.querySelector('.rules-add').addEventListener('click', () => {
            this.rulesOf(node).push({ find: '', replace: '' });
            this.renderRulesList(node);
            this.app.history.commit(i18n.t('history.field_changed'));
        });
        return editor;
    }

    rulesOf(node) {
        if (!Array.isArray(node.values.rules)) node.values.rules = [];
        return node.values.rules;
    }

    renderRulesList(node) {
        const list = node.element.querySelector('.rules-list');
        if (!list) return;
        list.innerHTML = '';
        this.rulesOf(node).forEach((rule, index) => {
            const row = document.createElement('div');
            row.className = 'rule-row';
            row.innerHTML = `
                <input type="text" data-key="find"><span class="rule-arrow">→</span><input type="text" data-key="replace">
                <button type="button" class="node-btn rule-remove"><i class="fas fa-times"></i></button>`;
            const find = row.querySelector('[data-key="find"]');
            const replace = row.querySelector('[data-key="replace"]');
            find.placeholder = i18n.t('placeholder.find');
            replace.placeholder = i18n.t('placeholder.replace');
            find.value = rule.find || '';
            replace.value = rule.replace || '';
            for (const input of [find, replace]) {
                input.addEventListener('input', () => {
                    rule[input.dataset.key] = input.value;
                    this.app.execute();
                    this.app.history.commitDebounced(i18n.t('history.field_changed'));
                });
            }
            row.querySelector('.rule-remove').addEventListener('click', () => {
                this.rulesOf(node).splice(index, 1);
                this.renderRulesList(node);
                this.app.execute();
                this.app.history.commit(i18n.t('history.field_changed'));
            });
            list.appendChild(row);
        });
    }

    /* ---------- monitors ---------- */

    /** Longest text laid out inside a monitor; the copy button still copies everything. */
    static MONITOR_DISPLAY_LIMIT = 10000;

    updateMonitors(results, reverse) {
        const limit = NodeManager.MONITOR_DISPLAY_LIMIT;
        for (const node of this.nodes.values()) {
            if (!NodeRegistry.get(node.type).monitor) continue;
            const display = node.element.querySelector('.monitor-display');
            if (!display) continue;
            const exit = results.get(node.id);
            const value = (exit && Object.values(exit)[0]) || '';
            node.monitorValue = value;
            const direction = i18n.t(reverse ? 'monitor.direction_decrypt' : 'monitor.direction_encrypt');
            display.textContent = '';
            const tag = document.createElement('small');
            tag.textContent = direction;
            display.append(tag, '\n', value ? value.slice(0, limit) : i18n.t('monitor.empty_input'));
            if (value.length > limit) {
                display.append('\n', i18n.t('monitor.truncated', { count: ChainExecutor.formatLength(value.length - limit) }));
            }
        }
    }

    /* ---------- language change ---------- */

    refreshTexts() {
        for (const node of this.nodes.values()) {
            const template = NodeRegistry.template(node.type);
            node.element.querySelector('.node-title').textContent = this.titleOf(node);
            node.element.querySelector('.node-help').title = i18n.t('node.show_help_tooltip');
            for (const field of template.fields) {
                const wrap = node.element.querySelector(`.node-field[data-field="${field.name}"]`);
                if (!wrap) continue;
                const label = wrap.querySelector('label');
                if (label) label.textContent = field.label;
                const select = wrap.querySelector('select');
                if (select && field.options) {
                    [...select.options].forEach((opt, i) => { if (field.options[i]) opt.textContent = field.options[i].label; });
                }
                const rulesTitle = wrap.querySelector('.rules-header > span');
                if (rulesTitle) rulesTitle.textContent = field.label;
                const addLabel = wrap.querySelector('.rules-add span');
                if (addLabel) addLabel.textContent = i18n.t('button.add');
                wrap.querySelectorAll('[data-key="find"]').forEach(el => { el.placeholder = i18n.t('placeholder.find'); });
                wrap.querySelectorAll('[data-key="replace"]').forEach(el => { el.placeholder = i18n.t('placeholder.replace'); });
            }
            for (const port of [...template.inputs, ...template.outputs]) {
                const row = node.element.querySelector(`.port-row[data-port="${port.name}"] .port-label`);
                if (row) row.textContent = port.label;
            }
            const copy = node.element.querySelector('.monitor-copy');
            if (copy) copy.title = i18n.t('monitor.copy_content');
        }
        this.app.execute();
    }

    /* ---------- interaction ---------- */

    bindEvents() {
        this.layer.addEventListener('pointerdown', (e) => {
            const nodeEl = e.target.closest('.canvas-node');
            if (!nodeEl || e.button !== 0) return;
            if (e.target.closest('.connection-point')) return;
            const id = nodeEl.dataset.nodeId;
            const selection = this.app.selection;

            if (e.ctrlKey || e.metaKey) {
                selection.toggle(id);
            } else if (!selection.has(id)) {
                selection.select([id]);
            }
            if (this.isInteractive(e.target)) return;
            e.preventDefault();
            UI.blurTextControl();
            this.startMove(e);
        });
    }

    isInteractive(el) {
        return Boolean(el.closest('input, select, textarea, button, [contenteditable="true"], .rules-editor'));
    }

    /** Screen-pixel distance within which a dragged node snaps into a connection. */
    static INSERT_DISTANCE = 24;

    /**
     * Drags every selected node together; one history entry per drag.
     * A single node with free ports that is dropped onto a connection is spliced into it.
     */
    startMove(e) {
        const moving = this.app.selection.ids().map(id => this.nodes.get(id)).filter(Boolean);
        if (moving.length === 0) return;
        const start = moving.map(node => ({ node, x: node.x, y: node.y }));
        const pointerId = e.pointerId;
        const startX = e.clientX;
        const startY = e.clientY;
        const connections = this.app.connections;
        const insertable = moving.length === 1 && connections.insertionPorts(moving[0].id) !== null;
        let moved = false;
        let frame = null;
        let lastEvent = e;

        const apply = () => {
            frame = null;
            const scale = this.app.canvas.getScale();
            const dx = (lastEvent.clientX - startX) / scale;
            const dy = (lastEvent.clientY - startY) / scale;
            for (const item of start) this.setPosition(item.node.id, item.x + dx, item.y + dy);
            if (insertable) connections.setInsertTarget(this.findInsertTarget(moving[0], lastEvent));
        };
        const onMove = (ev) => {
            if (ev.pointerId !== pointerId || this.app.canvas.pinch) return;
            lastEvent = ev;
            moved = moved || Math.abs(ev.clientX - startX) > 1 || Math.abs(ev.clientY - startY) > 1;
            if (!frame) frame = requestAnimationFrame(apply);
        };
        const onUp = (ev) => {
            if (ev.pointerId !== pointerId) return;
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
            document.removeEventListener('pointercancel', onUp);
            if (frame) { cancelAnimationFrame(frame); apply(); }
            for (const item of start) item.node.element.classList.remove('is-dragging');
            const target = connections.insertTarget;
            connections.setInsertTarget(null);
            if (!moved) return;
            if (target && ev.type === 'pointerup' && connections.insertNode(moving[0].id, target)) return;
            this.app.history.commit(moving.length > 1
                ? i18n.t('history.group_moved', { count: moving.length })
                : i18n.t('history.node_moved', { title: this.titleOf(moving[0]) }));
        };
        for (const item of start) item.node.element.classList.add('is-dragging');
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
        document.addEventListener('pointercancel', onUp);
    }

    /** Connection under the pointer or under the node's centre, if any. */
    findInsertTarget(node, event) {
        const canvas = this.app.canvas;
        const rect = canvas.canvas.getBoundingClientRect();
        const pointer = canvas.screenToWorld(event.clientX - rect.left, event.clientY - rect.top);
        const box = node.element.getBoundingClientRect();
        const center = canvas.screenToWorld(box.left + box.width / 2 - rect.left, box.top + box.height / 2 - rect.top);
        return this.app.connections.nearestConnection([pointer, center], NodeManager.INSERT_DISTANCE / canvas.getScale(), node.id);
    }
}
