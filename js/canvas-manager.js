// === Система управления канвасом (масштабирование, перемещение) ===

class CanvasManager {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.nodesLayer = document.getElementById('nodesLayer');
        this.connectionsLayer = document.getElementById('connections');
        this.canvasBackground = document.querySelector('.canvas-background');
        
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.minScale = 0.1;
        this.maxScale = 3;
        
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;
        this.panStartOffsetX = 0;
        this.panStartOffsetY = 0;
        
        // Начальное смещение для центрирования виртуального пространства
        this.virtualCenterX = 5000;
        this.virtualCenterY = 5000;
        
        // Режим резки соединений
        this.cuttingModeEnabled = false; // Переключается клавишей 'X'
        this.altKeyDown = false;         // Удерживается клавиша 'Alt'
        this.isDrawingCutLine = false;   // Происходит ли сейчас рисование линии
        this.cutPath = [];               // Координаты линии резки
        this.cutLineElement = null;      // SVG элемент линии резки
        
        this.initializeControls();
        this.bindEvents();
        this.centerView();
        this.initializeCuttingControls(); 
    }
    
    initializeControls() {
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const resetZoomBtn = document.getElementById('resetZoomBtn');
        
        zoomInBtn.addEventListener('click', () => this.zoomIn());
        zoomOutBtn.addEventListener('click', () => this.zoomOut());
        resetZoomBtn.addEventListener('click', () => this.resetZoom());
    }
    
    bindEvents() {
        // Масштабирование колесом мыши
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.zoomToPoint(mouseX, mouseY, delta);
        });
        
        // Перемещение канваса (панорамирование)
        this.canvas.addEventListener('mousedown', (e) => {
            // Если активен режим резки, начинаем рисовать линию
            if (this.isCuttingActive() && e.button === 0) {
                e.preventDefault();
                e.stopPropagation();
                this.startCutting(e);
                return;
            }

            // Проверяем, что клик не по ноду или точке соединения
            if (e.target.closest('.canvas-node') || e.target.closest('.connection-point')) {
                return;
            }
            
            if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Средняя кнопка или Ctrl+левая
                e.preventDefault();
                this.startPanning(e);
            }
        });
        
        // Также поддерживаем правую кнопку мыши для панорамирования
        this.canvas.addEventListener('contextmenu', (e) => {
            if (!e.target.closest('.canvas-node')) {
                e.preventDefault();
            }
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Правая кнопка
                if (!e.target.closest('.canvas-node') && !e.target.closest('.connection-point')) {
                    e.preventDefault();
                    this.startPanning(e);
                }
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                this.updatePanning(e);
            }

            if (this.isDrawingCutLine) {
                this.updateCutting(e);
            } else if (this.isCuttingActive()) {
                // Подсветка соединений даже без рисования линии
                this.highlightConnectionsUnderCursor(e);
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (this.isPanning) {
                this.stopPanning();
            }

            if (this.isDrawingCutLine) {
                this.endCutting(e);
            }
        });
        
        // Горячие клавиши для масштабирования
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                this.zoomIn();
            } else if (e.key === '-') {
                e.preventDefault();
                this.zoomOut();
            } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.resetZoom();
            }
        });
    }
    
    startPanning(e) {
        this.isPanning = true;
        this.panStartX = e.clientX;
        this.panStartY = e.clientY;
        this.panStartOffsetX = this.offsetX;
        this.panStartOffsetY = this.offsetY;
        
        this.canvas.style.cursor = 'grabbing';
    }
    
    updatePanning(e) {
        if (!this.isPanning) return;
        
        const deltaX = e.clientX - this.panStartX;
        const deltaY = e.clientY - this.panStartY;
        
        this.offsetX = this.panStartOffsetX + deltaX;
        this.offsetY = this.panStartOffsetY + deltaY;
        
        this.updateTransform();
    }
    
    stopPanning() {
        this.isPanning = false;
        this.canvas.style.cursor = '';
    }
    
    zoomIn() {
        const rect = this.canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        this.zoomToPoint(centerX, centerY, 0.2);
    }
    
    zoomOut() {
        const rect = this.canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        this.zoomToPoint(centerX, centerY, -0.2);
    }
    
    resetZoom() {
        this.scale = 1;
        this.centerView();
    }
    
    centerView() {
        const rect = this.canvas.getBoundingClientRect();
        // Центрируем вид на начальной позиции (0, 0)
        this.offsetX = 0;
        this.offsetY = 0;
        this.updateTransform();
    }
    
    zoomToPoint(mouseX, mouseY, deltaScale) {
        const newScale = Math.max(this.minScale, 
                         Math.min(this.maxScale, this.scale + deltaScale));
        
        if (newScale === this.scale) return;
        
        // Вычисляем мировые координаты точки под мышью
        const worldX = (mouseX - this.offsetX) / this.scale;
        const worldY = (mouseY - this.offsetY) / this.scale;
        
        // Обновляем масштаб
        this.scale = newScale;
        
        // Пересчитываем смещение, чтобы точка под мышью осталась на месте
        this.offsetX = mouseX - worldX * this.scale;
        this.offsetY = mouseY - worldY * this.scale;
        
        this.updateTransform();
    }
    
    updateTransform() {
        const transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
        
        // Применяем одинаковую трансформацию ко всем слоям
        this.nodesLayer.style.transform = transform;
        this.nodesLayer.style.transformOrigin = '0 0';
        
        this.connectionsLayer.style.transform = transform;
        this.connectionsLayer.style.transformOrigin = '0 0';
        
        if (this.canvasBackground) {
            this.canvasBackground.style.transform = transform;
            this.canvasBackground.style.transformOrigin = '0 0';
        }
        
        // Обновляем отображение масштаба
        const zoomLevel = document.getElementById('zoomLevel');
        if (zoomLevel) {
            zoomLevel.textContent = Math.round(this.scale * 100) + '%';
        }
    }
    
    // Преобразование экранных координат в мировые
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.offsetX) / this.scale,
            y: (screenY - this.offsetY) / this.scale
        };
    }
    
    // Преобразование мировых координат в экранные
    worldToScreen(worldX, worldY) {
        return {
            x: worldX * this.scale + this.offsetX,
            y: worldY * this.scale + this.offsetY
        };
    }
    
    // Получить текущий масштаб
    getScale() {
        return this.scale;
    }
    
    // Получить текущее смещение
    getOffset() {
        return { x: this.offsetX, y: this.offsetY };
    }

    isCuttingActive() {
        return this.cuttingModeEnabled || this.altKeyDown;
    }

    initializeCuttingControls() {
        const canvasControls = document.querySelector('.canvas-controls');
        if (canvasControls) {
            const scissorBtn = document.createElement('button');
            scissorBtn.className = 'canvas-control-btn';
            scissorBtn.id = 'scissorBtn';
            scissorBtn.title = 'Режим резки соединений (X / Alt)';
            scissorBtn.innerHTML = '<i class="fas fa-cut"></i>';
            scissorBtn.addEventListener('click', () => this.toggleCuttingMode());
            
            canvasControls.appendChild(scissorBtn);
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if (e.key.toLowerCase() === 'x' && !e.repeat) {
                e.preventDefault();
                this.toggleCuttingMode();
            }
            if (e.key === 'Alt' && !this.altKeyDown) {
                e.preventDefault();
                this.altKeyDown = true;
                this.updateCuttingVisuals();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Alt') {
                e.preventDefault();
                this.altKeyDown = false;
                this.updateCuttingVisuals();
                this.highlightConnectionsUnderCursor(null, true); // Снимаем подсветку
            }
        });
    }
    toggleCuttingMode() {
        this.cuttingModeEnabled = !this.cuttingModeEnabled;
        this.updateCuttingVisuals();
        if (!this.cuttingModeEnabled) {
            this.highlightConnectionsUnderCursor(null, true); // Снимаем подсветку при выключении
        }
    }

    /**
     * Обновляет визуальное состояние (курсор, кнопка) в зависимости от режима резки
     */
    updateCuttingVisuals() {
        const scissorBtn = document.getElementById('scissorBtn');
        if (this.isCuttingActive()) {
            this.canvas.classList.add('cutting-mode');
            if (scissorBtn) {
                scissorBtn.classList.add('active');
                scissorBtn.style.backgroundColor = 'var(--error)';
            }
            
            this.showCuttingHint(); 
            
        } else {
            this.canvas.classList.remove('cutting-mode');
            if (scissorBtn) {
                scissorBtn.classList.remove('active');
                scissorBtn.style.backgroundColor = '';
            }
            
            this.hideCuttingHint(); 
            
            this.isDrawingCutLine = false; 
            this.endCutting();
        }
    }

    showCuttingHint() {
        if (document.querySelector('.cutting-hint-tooltip')) return;

        const hint = document.createElement('div');
        hint.className = 'cutting-hint-tooltip'; // Используем другое имя, чтобы не конфликтовать со стилями иконки
        hint.innerHTML = `
            <div class="cutting-hint">
                <i class="fas fa-cut"></i>
                <span>Режим резки активен: проведите линию через соединения</span>
            </div>
        `;
        hint.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-tertiary);
            color: var(--text-primary);
            padding: 0.75rem 1.5rem;
            border-radius: 50px;
            font-size: 0.9rem;
            font-weight: 500;
            z-index: 10000;
            pointer-events: none;
            animation: slideDown 0.3s ease-out forwards;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border-color);
        `;
        document.body.appendChild(hint);
    }

    /**
     * Скрывает большую подсказку о режиме резки.
     */
    hideCuttingHint() {
        const hint = document.querySelector('.cutting-hint-tooltip');
        if (hint) {
            hint.style.animation = 'slideUp 0.3s ease-out forwards';
            setTimeout(() => {
                hint.remove();
            }, 300);
        }
    }
    
    /**
     * Начинает рисование линии резки
     * @param {MouseEvent} e 
     */
    startCutting(e) {
        this.isDrawingCutLine = true;
        const rect = this.canvas.getBoundingClientRect();
        const startPoint = this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
        this.cutPath = [startPoint];

        if (!this.cutLineElement) {
            this.cutLineElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            this.cutLineElement.setAttribute('stroke', 'var(--error)');
            this.cutLineElement.setAttribute('stroke-width', '3');
            this.cutLineElement.setAttribute('fill', 'none');
            this.cutLineElement.setAttribute('stroke-linecap', 'round');
            this.cutLineElement.setAttribute('stroke-dasharray', '8, 4');
            this.cutLineElement.style.pointerEvents = 'none';
            this.cutLineElement.style.filter = 'drop-shadow(0 0 5px var(--error))';
            this.connectionsLayer.appendChild(this.cutLineElement);
        }
    }

    /**
     * Обновляет путь линии резки во время движения мыши
     * @param {MouseEvent} e 
     */
    updateCutting(e) {
        const rect = this.canvas.getBoundingClientRect();
        const newPoint = this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
        this.cutPath.push(newPoint);

        let pathData = `M ${this.cutPath[0].x} ${this.cutPath[0].y}`;
        for (let i = 1; i < this.cutPath.length; i++) {
            pathData += ` L ${this.cutPath[i].x} ${this.cutPath[i].y}`;
        }
        this.cutLineElement.setAttribute('d', pathData);
        this.highlightConnectionsUnderCursor(e);
    }
    
    /**
     * Завершает рисование линии и выполняет резку
     */
    endCutting() {
        if (this.isDrawingCutLine) {
            this.performCut();
        }
        this.isDrawingCutLine = false;
        this.cutPath = [];
        if (this.cutLineElement) {
            this.cutLineElement.remove();
            this.cutLineElement = null;
        }
        // Не сбрасываем подсветку, если режим все еще активен
        if (this.isCuttingActive()) {
            this.highlightConnectionsUnderCursor(null, false);
        } else {
            this.highlightConnectionsUnderCursor(null, true);
        }
    }

    /**
     * Подсвечивает соединения, пересекаемые линией резки или находящиеся под курсором
     * @param {MouseEvent | null} e - Событие мыши или null
     * @param {boolean} forceClear - Принудительно убрать всю подсветку
     */
    highlightConnectionsUnderCursor(e, forceClear = false) {
        if (!window.connectionManager) return;
        
        const connections = this.getConnectionsAsSegments();
        let segmentsToTest = [];

        if (this.isDrawingCutLine && this.cutPath.length > 1) {
            // Проверяем последний сегмент нарисованной линии
            const lastPoint = this.cutPath[this.cutPath.length - 1];
            const prevPoint = this.cutPath[this.cutPath.length - 2];
            segmentsToTest.push({ p1: prevPoint, p2: lastPoint });
        } else if (e) {
            // Создаем небольшой сегмент вокруг курсора для проверки "наведения"
            const rect = this.canvas.getBoundingClientRect();
            const worldPos = this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
            const tolerance = 1 / this.scale;
            segmentsToTest.push({
                p1: { x: worldPos.x - tolerance, y: worldPos.y },
                p2: { x: worldPos.x + tolerance, y: worldPos.y }
            });
        }
        
        connections.forEach(conn => {
            const element = conn.element;
            if (!element) return;
            
            let intersected = false;
            if (!forceClear) {
                for (const testSeg of segmentsToTest) {
                    if (this.doSegmentsIntersect(conn.p1, conn.p2, testSeg.p1, testSeg.p2)) {
                        intersected = true;
                        break;
                    }
                }
            }
            
            if (intersected) {
                element.classList.add('cut-highlight');
            } else {
                element.classList.remove('cut-highlight');
            }
        });
    }

    /**
     * Выполняет фактическое удаление пересеченных соединений
     */
    performCut() {
        if (this.cutPath.length < 2 || !window.connectionManager) return;

        const connections = this.getConnectionsAsSegments();
        const connectionsToRemove = new Set();

        for (let i = 1; i < this.cutPath.length; i++) {
            const cutSegment = { p1: this.cutPath[i - 1], p2: this.cutPath[i] };
            connections.forEach(conn => {
                if (this.doSegmentsIntersect(conn.p1, conn.p2, cutSegment.p1, cutSegment.p2)) {
                    connectionsToRemove.add(conn.id);
                }
            });
        }

        if (connectionsToRemove.size > 0) {
            connectionsToRemove.forEach(id => window.connectionManager.removeConnection(id));
            if (window.fileManager) {
                window.fileManager.showNotification(`✂️ Разрезано соединений: ${connectionsToRemove.size}`, 'success');
            }
            if (window.cipherEngine) {
                window.cipherEngine.executeChain();
            }
        }
    }

    /**
     * Получает все соединения в виде отрезков с мировыми координатами
     * @returns {Array<{id: string, p1: {x,y}, p2: {x,y}, element: SVGElement}>}
     */
    getConnectionsAsSegments() {
        if (!window.connectionManager) return [];
        
        const segments = [];
        for (const conn of window.connectionManager.connections.values()) {
            const fromNode = window.nodeManager.nodes.get(conn.from.nodeId);
            const toNode = window.nodeManager.nodes.get(conn.to.nodeId);
            if (fromNode && toNode && conn.from.element && conn.to.element) {
                const fromRect = conn.from.element.getBoundingClientRect();
                const toRect = conn.to.element.getBoundingClientRect();
                const canvasRect = this.canvas.getBoundingClientRect();

                const p1 = this.screenToWorld(
                    fromRect.left + fromRect.width / 2 - canvasRect.left,
                    fromRect.top + fromRect.height / 2 - canvasRect.top
                );
                const p2 = this.screenToWorld(
                    toRect.left + toRect.width / 2 - canvasRect.left,
                    toRect.top + toRect.height / 2 - canvasRect.top
                );
                segments.push({ id: conn.id, p1, p2, element: conn.element });
            }
        }
        return segments;
    }

    /* Проверяет, пересекаются ли два отрезка*/
    doSegmentsIntersect(p1, p2, p3, p4) {
        function onSegment(p, q, r) {
            return (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
                    q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y));
        }

        function orientation(p, q, r) {
            const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
            if (val == 0) return 0; // Collinear
            return (val > 0) ? 1 : 2; // Clockwise or Counterclockwise
        }

        const o1 = orientation(p1, p2, p3);
        const o2 = orientation(p1, p2, p4);
        const o3 = orientation(p3, p4, p1);
        const o4 = orientation(p3, p4, p2);

        if (o1 !== o2 && o3 !== o4) return true;

        // Special Cases for collinear points
        if (o1 === 0 && onSegment(p1, p3, p2)) return true;
        if (o2 === 0 && onSegment(p1, p4, p2)) return true;
        if (o3 === 0 && onSegment(p3, p1, p4)) return true;
        if (o4 === 0 && onSegment(p3, p2, p4)) return true;

        return false;
    }
    
    isPointOnConnection(screenX, screenY, connection) {
        if (!connection.element) return false;
        
        const path = connection.element;
        const pathData = path.getAttribute('d');
        
        if (!pathData) return false;
        
        // Преобразуем экранные координаты с учетом трансформации SVG
        const svg = path.ownerSVGElement;
        const point = svg.createSVGPoint();
        point.x = screenX;
        point.y = screenY;
        
        try {
            const transformedPoint = point.matrixTransform(svg.getScreenCTM().inverse());
            
            // Проверяем расстояние до линии
            const tolerance = 10 / this.scale; // Увеличиваем толерантность при уменьшении масштаба
            
            // Получаем точки начала и конца соединения
            const fromElement = connection.from.element;
            const toElement = connection.to.element;
            
            if (!fromElement || !toElement) return false;
            
            const fromRect = fromElement.getBoundingClientRect();
            const toRect = toElement.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            
            const fromX = (fromRect.left + fromRect.width / 2 - canvasRect.left - this.offsetX) / this.scale;
            const fromY = (fromRect.top + fromRect.height / 2 - canvasRect.top - this.offsetY) / this.scale;
            const toX = (toRect.left + toRect.width / 2 - canvasRect.left - this.offsetX) / this.scale;
            const toY = (toRect.top + toRect.height / 2 - canvasRect.top - this.offsetY) / this.scale;
            
            // Вычисляем расстояние от точки до линии
            const distance = this.distanceToLine(
                transformedPoint.x, transformedPoint.y,
                fromX, fromY,
                toX, toY
            );
            
            return distance <= tolerance;
        } catch (e) {
            return false;
        }
    }
    
    distanceToLine(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) {
            // Точки совпадают
            return Math.sqrt(A * A + B * B);
        }
        
        let param = dot / lenSq;
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// Инициализация после загрузки DOM
let canvasManager;
document.addEventListener('DOMContentLoaded', () => {
    canvasManager = new CanvasManager();
    window.canvasManager = canvasManager; // Делаем доступным глобально
});