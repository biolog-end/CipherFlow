/**
 * The node palette on the left, generated from the registry.
 * Items are dragged onto the canvas (dropping one onto a connection splices it in);
 * a plain tap/click adds the node in the middle of the view.
 * On narrow screens the palette is a drawer toggled from the top bar.
 */
class NodePanel {
    static TAP_DISTANCE = 6;

    constructor(app) {
        this.app = app;
        this.panel = document.querySelector('.nodes-panel');
        this.container = document.querySelector('.node-categories');
        this.canvas = document.getElementById('canvas');
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'panel-backdrop';
        this.backdrop.addEventListener('click', () => this.toggle(false));
        this.panel.after(this.backdrop);
        document.getElementById('paletteBtn')?.addEventListener('click', () => this.toggle());
        this.render();
        i18n.onLanguageChange(() => this.render());
    }

    render() {
        this.container.innerHTML = '';
        for (const group of NodeRegistry.byCategory()) {
            const section = document.createElement('div');
            section.className = 'category';
            const heading = document.createElement('h4');
            heading.textContent = i18n.t(group.label);
            section.appendChild(heading);
            for (const def of group.nodes) {
                const item = document.createElement('div');
                item.className = 'node-item';
                item.dataset.type = def.type;
                item.innerHTML = `<i class="${def.icon}"></i><span></span>`;
                item.querySelector('span').textContent = i18n.t(def.title);
                item.addEventListener('pointerdown', (e) => {
                    if (e.button === 0) {
                        e.preventDefault();
                        this.startDrag(item, e);
                    }
                });
                section.appendChild(item);
            }
            this.container.appendChild(section);
        }
    }

    /* ---------- drawer (narrow screens) ---------- */

    toggle(open = !this.panel.classList.contains('is-open')) {
        this.panel.classList.toggle('is-open', open);
        this.backdrop.classList.toggle('show', open);
        document.getElementById('paletteBtn')?.classList.toggle('active', open);
    }

    get isDrawer() {
        return getComputedStyle(this.backdrop).display !== 'none' || this.panel.classList.contains('is-open');
    }

    /* ---------- adding nodes ---------- */

    /** Drags a ghost of the palette item; dropping it over the canvas creates the node there. */
    startDrag(item, e) {
        const pointerId = e.pointerId;
        const startX = e.clientX;
        const startY = e.clientY;
        let ghost = null;
        const rect = item.getBoundingClientRect();
        const connections = this.app.connections;

        const place = (ev) => {
            ghost.style.left = `${ev.clientX - rect.width / 2}px`;
            ghost.style.top = `${ev.clientY - rect.height / 2}px`;
        };
        const onMove = (ev) => {
            if (ev.pointerId !== pointerId) return;
            if (!ghost) {
                if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < NodePanel.TAP_DISTANCE) return;
                ghost = item.cloneNode(true);
                ghost.classList.add('node-item-ghost');
                ghost.style.width = `${rect.width}px`;
                document.body.appendChild(ghost);
                if (this.isDrawer) this.toggle(false);
            }
            place(ev);
            const over = this.isOverCanvas(ev);
            this.canvas.classList.toggle('drop-target', over);
            connections.setInsertTarget(over ? this.findInsertTarget(ev) : null);
        };
        const onUp = (ev) => {
            if (ev.pointerId !== pointerId) return;
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
            document.removeEventListener('pointercancel', onUp);
            this.canvas.classList.remove('drop-target');
            const target = connections.insertTarget;
            connections.setInsertTarget(null);
            if (ev.type !== 'pointerup') { ghost?.remove(); return; }
            if (!ghost) {
                this.addAtCenter(item.dataset.type);
                return;
            }
            ghost.remove();
            if (!this.isOverCanvas(ev)) return;
            const canvasRect = this.canvas.getBoundingClientRect();
            const world = this.app.canvas.screenToWorld(ev.clientX - canvasRect.left, ev.clientY - canvasRect.top);
            // centre the new node under the cursor (node width ≈ 220)
            const node = this.app.nodes.createNode(item.dataset.type, world.x - 110, world.y - 20);
            if (!(target && connections.insertNode(node.id, target))) this.app.execute();
        };
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
        document.addEventListener('pointercancel', onUp);
    }

    /** Tap / click: the node lands in the middle of the view, slightly offset so repeats do not stack exactly. */
    addAtCenter(type) {
        const center = this.app.canvas.viewportCenterWorld();
        const offset = (this.app.nodes.nodes.size % 5) * 24;
        this.app.nodes.createNode(type, center.x - 110 + offset, center.y - 40 + offset);
        this.app.execute();
        if (this.isDrawer) this.toggle(false);
    }

    findInsertTarget(ev) {
        const canvasRect = this.canvas.getBoundingClientRect();
        const world = this.app.canvas.screenToWorld(ev.clientX - canvasRect.left, ev.clientY - canvasRect.top);
        return this.app.connections.nearestConnection([world], NodeManager.INSERT_DISTANCE / this.app.canvas.getScale());
    }

    isOverCanvas(e) {
        const r = this.canvas.getBoundingClientRect();
        return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    }
}
