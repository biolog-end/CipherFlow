/**
 * Viewport of the workspace: pan, zoom, world/screen coordinate conversion and the connection-cutting tool.
 * The three layers (background grid, SVG connections, nodes) share one transform.
 */
class CanvasManager {
    constructor(app) {
        this.app = app;
        this.canvas = document.getElementById('canvas');
        this.layers = [
            document.querySelector('.canvas-background'),
            document.getElementById('connections'),
            document.getElementById('nodesLayer'),
        ].filter(Boolean);
        this.connectionsLayer = document.getElementById('connections');
        this.zoomLabel = document.getElementById('zoomLevel');

        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.minScale = 0.2;
        this.maxScale = 3;
        // nodes live around this point of the 10000x10000 virtual space
        this.virtualCenterX = 5000;
        this.virtualCenterY = 5000;

        this.panning = null;
        this.cuttingMode = false;
        this.altHeld = false;
        this.cutPath = null;
        this.cutLine = null;
        // active touch points on the canvas, for pinch zoom
        this.touches = new Map();
        this.pinch = null;

        this.bindControls();
        this.bindEvents();
        this.centerView();
    }

    bindControls() {
        document.getElementById('zoomInBtn')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOutBtn')?.addEventListener('click', () => this.zoomOut());
        document.getElementById('resetZoomBtn')?.addEventListener('click', () => this.resetZoom());
        const scissors = document.getElementById('scissorBtn');
        if (scissors) scissors.addEventListener('click', () => this.toggleCuttingMode());
    }

    bindEvents() {
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const factor = e.deltaY > 0 ? 1 / 1.1 : 1.1;
            this.zoomToPoint(e.clientX - rect.left, e.clientY - rect.top, this.scale * factor);
        }, { passive: false });

        // capture phase: every touch on the canvas is tracked for pinch zoom, whatever it landed on
        this.canvas.addEventListener('pointerdown', (e) => {
            if (e.pointerType !== 'touch') return;
            this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
            if (this.touches.size === 2) this.startPinch();
        }, true);

        this.canvas.addEventListener('pointerdown', (e) => {
            if (this.pinch) return;
            if (this.isCuttingActive() && e.button === 0) {
                e.preventDefault();
                e.stopPropagation();
                UI.blurTextControl();
                this.startCutting(e);
                return;
            }
            const onNode = e.target.closest('.canvas-node') || e.target.closest('.connection-point');
            // a finger on empty canvas pans; with a mouse it takes the middle/right button or ctrl
            const panButton = e.pointerType === 'touch' || e.button === 1 || e.button === 2 || (e.button === 0 && e.ctrlKey);
            if (!onNode && panButton) {
                e.preventDefault();
                UI.blurTextControl();
                this.startPanning(e);
            }
        });

        this.canvas.addEventListener('contextmenu', (e) => {
            if (!e.target.closest('.canvas-node')) e.preventDefault();
        });

        document.addEventListener('pointermove', (e) => {
            if (this.touches.has(e.pointerId)) {
                this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
                if (this.pinch) this.updatePinch();
            }
            if (this.panning && e.pointerId === this.panning.pointerId) this.updatePanning(e);
            if (this.cutPath && e.pointerId === this.cutPointerId) this.updateCutting(e);
        });
        const release = (e) => {
            if (this.touches.delete(e.pointerId) && this.pinch && this.touches.size < 2) this.pinch = null;
            if (this.panning && e.pointerId === this.panning.pointerId) this.stopPanning();
            if (this.cutPath && e.pointerId === this.cutPointerId) this.endCutting(e.type === 'pointerup');
        };
        document.addEventListener('pointerup', release);
        document.addEventListener('pointercancel', release);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Alt' && !this.altHeld && !this.isTypingTarget(e.target)) {
                e.preventDefault();
                this.altHeld = true;
                this.updateCuttingVisuals();
            }
        });
        document.addEventListener('keyup', (e) => {
            if (e.key === 'Alt' && this.altHeld) {
                this.altHeld = false;
                this.updateCuttingVisuals();
            }
        });
        window.addEventListener('blur', () => {
            if (this.altHeld) {
                this.altHeld = false;
                this.updateCuttingVisuals();
            }
        });
    }

    isTypingTarget(el) {
        return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    }

    /* ---------- pan ---------- */

    startPanning(e) {
        this.panning = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, offsetX: this.offsetX, offsetY: this.offsetY };
        this.canvas.classList.add('is-panning');
    }

    updatePanning(e) {
        this.offsetX = this.panning.offsetX + (e.clientX - this.panning.startX);
        this.offsetY = this.panning.offsetY + (e.clientY - this.panning.startY);
        this.applyTransform();
    }

    stopPanning() {
        this.panning = null;
        this.canvas.classList.remove('is-panning');
    }

    /* ---------- pinch zoom (two fingers) ---------- */

    pinchGeometry() {
        const [a, b] = [...this.touches.values()];
        return { distance: Math.hypot(b.x - a.x, b.y - a.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }

    startPinch() {
        // the second finger ends any one-finger gesture
        if (this.panning) this.stopPanning();
        if (this.cutPath) this.endCutting(false);
        const g = this.pinchGeometry();
        this.pinch = { distance: g.distance, x: g.x, y: g.y, scale: this.scale };
    }

    updatePinch() {
        const g = this.pinchGeometry();
        if (!g.distance || !this.pinch.distance) return;
        const rect = this.canvas.getBoundingClientRect();
        this.zoomToPoint(g.x - rect.left, g.y - rect.top, this.pinch.scale * (g.distance / this.pinch.distance));
        this.offsetX += g.x - this.pinch.x;
        this.offsetY += g.y - this.pinch.y;
        this.pinch.x = g.x;
        this.pinch.y = g.y;
        this.applyTransform();
    }

    /* ---------- zoom ---------- */

    zoomIn() { this.zoomAtCenter(this.scale * 1.2); }
    zoomOut() { this.zoomAtCenter(this.scale / 1.2); }

    zoomAtCenter(newScale) {
        const rect = this.canvas.getBoundingClientRect();
        this.zoomToPoint(rect.width / 2, rect.height / 2, newScale);
    }

    resetZoom() {
        this.scale = 1;
        this.centerView();
    }

    centerView() {
        const rect = this.canvas.getBoundingClientRect();
        this.offsetX = rect.width / 2 - this.virtualCenterX * this.scale;
        this.offsetY = rect.height / 2 - this.virtualCenterY * this.scale;
        this.applyTransform();
    }

    zoomToPoint(screenX, screenY, newScale) {
        const clamped = Math.min(this.maxScale, Math.max(this.minScale, newScale));
        if (clamped === this.scale) return;
        const worldX = (screenX - this.offsetX) / this.scale;
        const worldY = (screenY - this.offsetY) / this.scale;
        this.scale = clamped;
        this.offsetX = screenX - worldX * this.scale;
        this.offsetY = screenY - worldY * this.scale;
        this.applyTransform();
    }

    applyTransform() {
        const transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
        for (const layer of this.layers) layer.style.transform = transform;
        if (this.zoomLabel) this.zoomLabel.textContent = `${Math.round(this.scale * 100)}%`;
    }

    /* ---------- coordinates ---------- */

    screenToWorld(screenX, screenY) {
        return { x: (screenX - this.offsetX) / this.scale, y: (screenY - this.offsetY) / this.scale };
    }

    worldToScreen(worldX, worldY) {
        return { x: worldX * this.scale + this.offsetX, y: worldY * this.scale + this.offsetY };
    }

    /** World coordinates of the centre of a DOM element inside the canvas. */
    elementCenterWorld(element) {
        const rect = element.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        return this.screenToWorld(rect.left + rect.width / 2 - canvasRect.left, rect.top + rect.height / 2 - canvasRect.top);
    }

    /** World coordinates of the centre of the visible viewport. */
    viewportCenterWorld() {
        const rect = this.canvas.getBoundingClientRect();
        return this.screenToWorld(rect.width / 2, rect.height / 2);
    }

    getScale() { return this.scale; }
    getOffset() { return { x: this.offsetX, y: this.offsetY }; }

    /* ---------- cutting connections ---------- */

    isCuttingActive() {
        return this.cuttingMode || this.altHeld;
    }

    toggleCuttingMode() {
        this.cuttingMode = !this.cuttingMode;
        this.updateCuttingVisuals();
    }

    updateCuttingVisuals() {
        const active = this.isCuttingActive();
        this.canvas.classList.toggle('cutting-mode', active);
        document.getElementById('scissorBtn')?.classList.toggle('active', active);
        if (active) {
            this.showCuttingHint();
        } else {
            this.hideCuttingHint();
            if (this.cutPath) this.endCutting(false);
        }
    }

    showCuttingHint() {
        if (document.querySelector('.cutting-hint')) return;
        const hint = document.createElement('div');
        hint.className = 'cutting-hint';
        hint.innerHTML = `<i class="fas fa-cut"></i><span></span>`;
        hint.querySelector('span').textContent = i18n.t('canvas.cut_mode_hint');
        document.body.appendChild(hint);
        requestAnimationFrame(() => hint.classList.add('show'));
    }

    hideCuttingHint() {
        const hint = document.querySelector('.cutting-hint');
        if (!hint) return;
        hint.classList.remove('show');
        setTimeout(() => hint.remove(), 200);
    }

    startCutting(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.cutPointerId = e.pointerId;
        this.cutPath = [this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top)];
        this.cutLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.cutLine.classList.add('cut-line');
        this.connectionsLayer.appendChild(this.cutLine);
    }

    updateCutting(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.cutPath.push(this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top));
        this.cutLine.setAttribute('d', this.cutPath.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' '));
    }

    endCutting(perform = true) {
        if (perform && this.cutPath && this.cutPath.length > 1) this.performCut();
        this.cutPath = null;
        if (this.cutLine) {
            this.cutLine.remove();
            this.cutLine = null;
        }
    }

    performCut() {
        const connections = this.app.connections;
        const toRemove = new Set();
        for (const conn of connections.getAllConnections()) {
            const segment = connections.getSegment(conn);
            if (!segment) continue;
            for (let i = 1; i < this.cutPath.length; i++) {
                if (CanvasManager.segmentsIntersect(segment.p1, segment.p2, this.cutPath[i - 1], this.cutPath[i])) {
                    toRemove.add(conn.id);
                    break;
                }
            }
        }
        if (toRemove.size === 0) return;
        for (const id of toRemove) connections.disconnect(id, { silent: true });
        this.app.history.commit(i18n.t('notification.connections_cut', { count: toRemove.size }));
        UI.notify(i18n.t('notification.connections_cut', { count: toRemove.size }), 'success');
        this.app.execute();
    }

    static segmentsIntersect(p1, p2, p3, p4) {
        const orientation = (p, q, r) => {
            const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
            return val === 0 ? 0 : (val > 0 ? 1 : 2);
        };
        const onSegment = (p, q, r) =>
            q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);

        const o1 = orientation(p1, p2, p3);
        const o2 = orientation(p1, p2, p4);
        const o3 = orientation(p3, p4, p1);
        const o4 = orientation(p3, p4, p2);
        if (o1 !== o2 && o3 !== o4) return true;
        if (o1 === 0 && onSegment(p1, p3, p2)) return true;
        if (o2 === 0 && onSegment(p1, p4, p2)) return true;
        if (o3 === 0 && onSegment(p3, p1, p4)) return true;
        if (o4 === 0 && onSegment(p3, p2, p4)) return true;
        return false;
    }
}
