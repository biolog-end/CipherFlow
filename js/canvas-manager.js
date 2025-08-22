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
        
        this.initializeControls();
        this.bindEvents();
        this.centerView();
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
        });
        
        document.addEventListener('mouseup', (e) => {
            if (this.isPanning) {
                this.stopPanning();
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
        // Центрируем вид на виртуальном центре пространства
        this.offsetX = rect.width / 2 - this.virtualCenterX * this.scale;
        this.offsetY = rect.height / 2 - this.virtualCenterY * this.scale;
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
}

// Инициализация после загрузки DOM
let canvasManager;
document.addEventListener('DOMContentLoaded', () => {
    canvasManager = new CanvasManager();
    window.canvasManager = canvasManager; // Делаем доступным глобально
});