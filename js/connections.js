// === Система управления соединениями между нодами ===

class ConnectionManager {
    constructor() {
        this.connections = new Map();
        this.connectionIdCounter = 0;
        this.isConnecting = false;
        this.startPoint = null;
        this.tempConnection = null;
        this.reverseMode = false;
        
        // Переменные для резки соединений
        this.isCutting = false;
        this.cutPath = [];
        this.cutTrail = null;
        this.lastCutPosition = null;
        
        this.svg = document.getElementById('connections');
        this.canvas = document.getElementById('canvas');
        
        this.initializeConnectionHandlers();
        this.bindEvents();
        this.initializeCuttingMode();
    }
    
    initializeConnectionHandlers() {
        // Обработка кликов на точки соединения
        this.canvas.addEventListener('mousedown', (e) => {
            const connectionPoint = e.target.closest('.connection-point');
            if (connectionPoint) {
                e.stopPropagation();
                
                // Правый клик + Shift для разрыва связей
                if ((e.button === 2 || (e.button === 0 && e.shiftKey)) && e.shiftKey) {
                    e.preventDefault();
                    this.breakConnectionsAtPoint(connectionPoint);
                } else if (e.button === 0) {
                    // Левый клик для создания соединения
                    this.startConnection(connectionPoint, e);
                }
            }
        });
        
        // Предотвращаем контекстное меню на точках соединения при Shift
        this.canvas.addEventListener('contextmenu', (e) => {
            const connectionPoint = e.target.closest('.connection-point');
            if (connectionPoint && e.shiftKey) {
                e.preventDefault();
            }
        });
        
        // Обработка перемещения мыши для временного соединения
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isConnecting && this.tempConnection) {
                this.updateTempConnection(e);
            }
        });
        
        // Завершение соединения
        this.canvas.addEventListener('mouseup', (e) => {
            if (this.isConnecting) {
                const connectionPoint = e.target.closest('.connection-point');
                if (connectionPoint && connectionPoint !== this.startPoint) {
                    this.finishConnection(connectionPoint);
                } else {
                    this.cancelConnection();
                }
            }
        });
        
        // Отмена соединения при клике вне точек
        this.canvas.addEventListener('click', (e) => {
            if (this.isConnecting && !e.target.closest('.connection-point')) {
                this.cancelConnection();
            }
        });
        
        // Подсказка при наведении на точку соединения
        this.canvas.addEventListener('mouseover', (e) => {
            const connectionPoint = e.target.closest('.connection-point');
            if (connectionPoint && e.shiftKey) {
                connectionPoint.style.cursor = 'not-allowed';
                connectionPoint.title = 'Удерживайте Shift и кликните правой кнопкой для разрыва связей';
            }
        });
        
        this.canvas.addEventListener('mouseout', (e) => {
            const connectionPoint = e.target.closest('.connection-point');
            if (connectionPoint) {
                connectionPoint.style.cursor = '';
                connectionPoint.title = '';
            }
        });
    }
    
    bindEvents() {
        // Обработка переключения режима шифрования/дешифрования
        const modeSwitch = document.getElementById('modeSwitch');
        modeSwitch.addEventListener('change', (e) => {
            this.reverseMode = e.target.checked;
            this.updateAllConnectionDirections();
            this.swapInputOutputFields();
        });
        
        // Обработка кликов по соединительным линиям для удаления
        this.svg.addEventListener('click', (e) => {
            if (e.target.classList.contains('connection-line')) {
                const connectionId = e.target.dataset.connectionId;
                if (connectionId) {
                    // Показываем подтверждение удаления
                    if (confirm('Удалить соединение?')) {
                        this.removeConnection(connectionId);
                    }
                }
            }
        });
        
        // Добавляем hover эффект для соединений
        this.svg.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('connection-line')) {
                e.target.style.strokeWidth = '3';
                e.target.style.cursor = 'pointer';
                
                // Показываем подсказку
                const tooltip = document.createElement('div');
                tooltip.className = 'connection-tooltip';
                tooltip.textContent = 'Нажмите для удаления соединения';
                tooltip.style.cssText = `
                    position: fixed;
                    left: ${e.clientX + 10}px;
                    top: ${e.clientY - 30}px;
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    pointer-events: none;
                    z-index: 1000;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                `;
                document.body.appendChild(tooltip);
                e.target._tooltip = tooltip;
            }
        });
        
        this.svg.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('connection-line')) {
                e.target.style.strokeWidth = '2';
                if (e.target._tooltip) {
                    e.target._tooltip.remove();
                    delete e.target._tooltip;
                }
            }
        });
    }
    
    startConnection(connectionPoint, e) {
        this.isConnecting = true;
        this.startPoint = connectionPoint;
        
        // Добавляем визуальный индикатор
        connectionPoint.classList.add('connecting');
        
        // Создаем временную линию соединения
        this.createTempConnection(e);
    }
    
    createTempConnection(e) {
        const startRect = this.startPoint.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        // Учитываем масштабирование канваса
        const scale = window.canvasManager ? window.canvasManager.getScale() : 1;
        const offset = window.canvasManager ? window.canvasManager.getOffset() : { x: 0, y: 0 };
        
        const startX = (startRect.left + startRect.width / 2 - canvasRect.left - offset.x) / scale;
        const startY = (startRect.top + startRect.height / 2 - canvasRect.top - offset.y) / scale;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('connection-line', 'temporary');
        
        this.tempConnection = {
            element: path,
            startX: startX,
            startY: startY
        };
        
        this.svg.appendChild(path);
        this.updateTempConnection(e);
    }
    
    updateTempConnection(e) {
        if (!this.tempConnection) return;
        
        const canvasRect = this.canvas.getBoundingClientRect();
        
        // Учитываем масштабирование канваса
        const scale = window.canvasManager ? window.canvasManager.getScale() : 1;
        const offset = window.canvasManager ? window.canvasManager.getOffset() : { x: 0, y: 0 };
        
        const endX = (e.clientX - canvasRect.left - offset.x) / scale;
        const endY = (e.clientY - canvasRect.top - offset.y) / scale;
        
        const pathData = this.createBezierPath(
            this.tempConnection.startX,
            this.tempConnection.startY,
            endX,
            endY
        );
        
        this.tempConnection.element.setAttribute('d', pathData);
    }
    
    finishConnection(endPoint) {
        if (!this.canConnect(this.startPoint, endPoint)) {
            this.cancelConnection();
            return;
        }
        
        const connectionId = this.createConnection(this.startPoint, endPoint);
        this.cleanupConnection();
        
        // Запускаем выполнение цепочки
        if (window.nodeManager) {
            window.nodeManager.triggerExecution();
        }
        
        return connectionId;
    }
    
    cancelConnection() {
        this.cleanupConnection();
    }
    
    cleanupConnection() {
        if (this.startPoint) {
            this.startPoint.classList.remove('connecting');
        }
        
        if (this.tempConnection) {
            this.tempConnection.element.remove();
            this.tempConnection = null;
        }
        
        this.isConnecting = false;
        this.startPoint = null;
    }
    
    canConnect(startPoint, endPoint) {
        const startNodeId = startPoint.dataset.nodeId;
        const startType = startPoint.dataset.type;
        const endNodeId = endPoint.dataset.nodeId;
        const endType = endPoint.dataset.type;
        
        // Нельзя соединять нод сам с собой
        if (startNodeId === endNodeId) {
            return false;
        }
        
        // Соединение должно быть от output к input или наоборот
        if (startType === endType) {
            return false;
        }
        
        // Проверяем, нет ли уже соединения между этими точками
        for (const connection of this.connections.values()) {
            if ((connection.from.nodeId === startNodeId && connection.to.nodeId === endNodeId) ||
                (connection.from.nodeId === endNodeId && connection.to.nodeId === startNodeId)) {
                return false;
            }
        }
        
        return true;
    }
    
    createConnection(startPoint, endPoint) {
        const connectionId = `connection_${this.connectionIdCounter++}`;
        
        const startNodeId = startPoint.dataset.nodeId;
        const startType = startPoint.dataset.type;
        const endNodeId = endPoint.dataset.nodeId;
        const endType = endPoint.dataset.type;
        
        // Определяем направление соединения (всегда от output к input)
        let fromPoint, toPoint;
        if (startType === 'output' && endType === 'input') {
            fromPoint = { nodeId: startNodeId, element: startPoint, type: 'output' };
            toPoint = { nodeId: endNodeId, element: endPoint, type: 'input' };
        } else if (startType === 'input' && endType === 'output') {
            fromPoint = { nodeId: endNodeId, element: endPoint, type: 'output' };
            toPoint = { nodeId: startNodeId, element: startPoint, type: 'input' };
        }
        
        // Создаем визуальную линию соединения
        const pathElement = this.createConnectionPath(fromPoint, toPoint, connectionId);
        
        // Сохраняем соединение
        const connection = {
            id: connectionId,
            from: fromPoint,
            to: toPoint,
            element: pathElement
        };
        
        this.connections.set(connectionId, connection);
        
        // Обновляем позицию линии
        this.updateConnectionPath(connection);
        
        return connectionId;
    }
    
    createConnectionPath(fromPoint, toPoint, connectionId) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('connection-line');
        path.dataset.connectionId = connectionId;
        
        // Добавляем класс для режима дешифрования
        if (this.reverseMode) {
            path.classList.add('reverse');
        }
        
        this.svg.appendChild(path);
        return path;
    }
    
    updateConnectionPath(connection) {
        const fromNode = window.nodeManager.nodes.get(connection.from.nodeId);
        const toNode = window.nodeManager.nodes.get(connection.to.nodeId);
        
        if (!fromNode || !toNode) return;
        
        // Используем позиции нодов напрямую, без учета трансформации
        // так как SVG тоже трансформируется
        const fromPoint = connection.from.element;
        const toPoint = connection.to.element;
        
        // Получаем позиции элементов относительно canvas
        const fromPointRect = fromPoint.getBoundingClientRect();
        const toPointRect = toPoint.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        // Учитываем масштабирование канваса
        const scale = window.canvasManager ? window.canvasManager.getScale() : 1;
        const offset = window.canvasManager ? window.canvasManager.getOffset() : { x: 0, y: 0 };
        
        // Вычисляем позиции в системе координат SVG (до трансформации)
        const fromX = (fromPointRect.left + fromPointRect.width / 2 - canvasRect.left - offset.x) / scale;
        const fromY = (fromPointRect.top + fromPointRect.height / 2 - canvasRect.top - offset.y) / scale;
        const toX = (toPointRect.left + toPointRect.width / 2 - canvasRect.left - offset.x) / scale;
        const toY = (toPointRect.top + toPointRect.height / 2 - canvasRect.top - offset.y) / scale;
        
        let pathData;
        if (this.reverseMode) {
            // В режиме дешифрования направление меняется
            pathData = this.createBezierPath(toX, toY, fromX, fromY);
        } else {
            pathData = this.createBezierPath(fromX, fromY, toX, toY);
        }
        
        connection.element.setAttribute('d', pathData);
    }
    
    createBezierPath(startX, startY, endX, endY) {
        // Создаем красивую кривую Безье для соединения
        const deltaX = Math.abs(endX - startX);
        const controlPointDistance = Math.max(deltaX * 0.5, 50);
        
        const cp1X = startX + controlPointDistance;
        const cp1Y = startY;
        const cp2X = endX - controlPointDistance;
        const cp2Y = endY;
        
        return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
    }
    
    updateConnections(nodeId) {
        // Обновляем все соединения, связанные с указанным нодом
        for (const connection of this.connections.values()) {
            if (connection.from.nodeId === nodeId || connection.to.nodeId === nodeId) {
                this.updateConnectionPath(connection);
            }
        }
    }
    
    updateAllConnectionDirections() {
        // Обновляем направления всех соединений при переключении режима
        for (const connection of this.connections.values()) {
            if (this.reverseMode) {
                connection.element.classList.add('reverse');
            } else {
                connection.element.classList.remove('reverse');
            }
            this.updateConnectionPath(connection);
        }
        
        // Запускаем обновление выполнения
        if (window.nodeManager) {
            window.nodeManager.triggerExecution();
        }
    }
    
    removeConnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (!connection) return;
        
        // Удаляем визуальный элемент
        connection.element.remove();
        
        // Удаляем из карты соединений
        this.connections.delete(connectionId);
        
        // Запускаем обновление выполнения
        if (window.nodeManager) {
            window.nodeManager.triggerExecution();
        }
    }
    
    removeNodeConnections(nodeId) {
        // Удаляем все соединения, связанные с указанным нодом
        const connectionsToRemove = [];
        
        for (const [connectionId, connection] of this.connections.entries()) {
            if (connection.from.nodeId === nodeId || connection.to.nodeId === nodeId) {
                connectionsToRemove.push(connectionId);
            }
        }
        
        connectionsToRemove.forEach(connectionId => {
            this.removeConnection(connectionId);
        });
    }
    
    clearAllConnections() {
        // Удаляем все соединения
        for (const connection of this.connections.values()) {
            connection.element.remove();
        }
        
        this.connections.clear();
        this.connectionIdCounter = 0;
    }
    
    getNodeConnections(nodeId) {
        // Возвращает все соединения для указанного нода
        const nodeConnections = {
            inputs: [],
            outputs: []
        };
        
        for (const connection of this.connections.values()) {
            if (connection.to.nodeId === nodeId) {
                nodeConnections.inputs.push({
                    connectionId: connection.id,
                    fromNodeId: connection.from.nodeId,
                    inputName: connection.to.element.dataset.inputName || 'default'
                });
            }
            
            if (connection.from.nodeId === nodeId) {
                nodeConnections.outputs.push({
                    connectionId: connection.id,
                    toNodeId: connection.to.nodeId
                });
            }
        }
        
        return nodeConnections;
    }
    
    getExecutionOrder() {
        // Возвращает порядок выполнения нодов на основе соединений
        const nodes = new Set();
        const dependencies = new Map();
        
        // Собираем все ноды и их зависимости
        for (const connection of this.connections.values()) {
            const fromNode = this.reverseMode ? connection.to.nodeId : connection.from.nodeId;
            const toNode = this.reverseMode ? connection.from.nodeId : connection.to.nodeId;
            
            nodes.add(fromNode);
            nodes.add(toNode);
            
            if (!dependencies.has(toNode)) {
                dependencies.set(toNode, new Set());
            }
            dependencies.get(toNode).add(fromNode);
        }
        
        // Добавляем ноды без соединений
        if (window.nodeManager) {
            window.nodeManager.getAllNodes().forEach(node => {
                nodes.add(node.id);
            });
        }
        
        // Топологическая сортировка
        const visited = new Set();
        const result = [];
        
        const visit = (nodeId) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            
            const deps = dependencies.get(nodeId);
            if (deps) {
                for (const dep of deps) {
                    visit(dep);
                }
            }
            
            result.push(nodeId);
        };
        
        for (const nodeId of nodes) {
            visit(nodeId);
        }
        
        return result;
    }
    
    getAllConnections() {
        return Array.from(this.connections.values());
    }
    
    breakConnectionsAtPoint(connectionPoint) {
        const nodeId = connectionPoint.dataset.nodeId;
        const pointType = connectionPoint.dataset.type;
        const inputName = connectionPoint.dataset.inputName;
        
        const connectionsToRemove = [];
        
        // Находим все соединения, связанные с этой точкой
        for (const [connectionId, connection] of this.connections.entries()) {
            if (pointType === 'input') {
                // Если это входная точка
                if (connection.to.nodeId === nodeId && 
                    (!inputName || connection.to.element.dataset.inputName === inputName)) {
                    connectionsToRemove.push(connectionId);
                }
            } else if (pointType === 'output') {
                // Если это выходная точка
                if (connection.from.nodeId === nodeId) {
                    connectionsToRemove.push(connectionId);
                }
            }
        }
        
        // Удаляем найденные соединения
        if (connectionsToRemove.length > 0) {
            connectionsToRemove.forEach(connectionId => {
                this.removeConnection(connectionId);
            });
            
            // Показываем визуальный эффект разрыва
            connectionPoint.style.animation = 'pulse 0.5s';
            setTimeout(() => {
                connectionPoint.style.animation = '';
            }, 500);
        }
    }
    
    swapInputOutputFields() {
        const inputText = document.getElementById('inputText');
        const outputText = document.getElementById('outputText');
        const inputLabel = document.getElementById('inputLabel');
        const outputLabel = document.getElementById('outputLabel');
        const inputSection = document.getElementById('inputSection');
        const outputSection = document.getElementById('outputSection');
        
        if (this.reverseMode) {
            // В режиме дешифровки: поле вывода становится вводом, поле ввода становится выводом
            inputText.readOnly = true;
            outputText.readOnly = false;
            inputText.placeholder = 'Дешифрованный текст появится здесь...';
            outputText.placeholder = 'Введите зашифрованный текст...';
            inputLabel.textContent = 'Дешифрованный текст:';
            outputLabel.textContent = 'Зашифрованный текст:';
            
            // Добавляем CSS классы для стилизации
            inputSection.classList.add('decrypt-result');
            outputSection.classList.add('decrypt-input');
            
            // Переносим содержимое из поля ввода в поле "вывода" (которое теперь ввод)
            const tempValue = inputText.value;
            inputText.value = outputText.value;
            outputText.value = tempValue;
            
            // Добавляем обработчик для нового поля ввода (бывшего вывода)
            if (!this.handleDecryptModeInput) {
                this.handleDecryptModeInput = () => {
                    if (window.cipherEngine) {
                        window.cipherEngine.executeChain();
                    }
                };
            }
            outputText.removeEventListener('input', this.handleDecryptModeInput);
            outputText.addEventListener('input', this.handleDecryptModeInput);
            
        } else {
            // В обычном режиме: восстанавливаем исходное состояние
            inputText.readOnly = false;
            outputText.readOnly = true;
            inputText.placeholder = 'Введите текст для шифрования...';
            outputText.placeholder = 'Результат появится здесь...';
            inputLabel.textContent = 'Входной текст:';
            outputLabel.textContent = 'Результат:';
            
            // Удаляем CSS классы для стилизации
            inputSection.classList.remove('decrypt-result');
            outputSection.classList.remove('decrypt-input');
            
            // Переносим содержимое обратно
            const tempValue = outputText.value;
            outputText.value = inputText.value;
            inputText.value = tempValue;
            
            // Удаляем обработчик с поля вывода
            if (this.handleDecryptModeInput) {
                outputText.removeEventListener('input', this.handleDecryptModeInput);
            }
        }
        
        // Запускаем выполнение цепочки после переключения режима
        if (window.cipherEngine) {
            window.cipherEngine.executeChain();
        }
    }
    
    // === Методы для резки соединений ===
    
    initializeCuttingMode() {
        // Обработка нажатия Alt для начала резки
        document.addEventListener('keydown', (e) => {
            if (e.altKey && !this.isCutting && !this.isConnecting) {
                this.startCuttingMode();
            }
        });
        
        // Обработка отпускания Alt для завершения резки
        document.addEventListener('keyup', (e) => {
            if (!e.altKey && this.isCutting) {
                this.endCuttingMode();
            }
        });
        
        // Обработка движения мыши в режиме резки
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isCutting) {
                this.updateCutTrail(e);
                this.checkConnectionIntersections(e);
            }
        });
        
        // Начало резки при клике с Alt
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.altKey && !this.isConnecting) {
                e.preventDefault();
                this.startCuttingPath(e);
            }
        });
        
        // Завершение резки при отпускании мыши
        this.canvas.addEventListener('mouseup', (e) => {
            if (this.isCutting) {
                this.endCuttingPath();
            }
        });
    }
    
    startCuttingMode() {
        this.isCutting = true;
        this.canvas.style.cursor = 'crosshair';
        document.body.style.cursor = 'crosshair';
        
        // Добавляем визуальную подсказку
        this.showCuttingHint();
    }
    
    endCuttingMode() {
        this.isCutting = false;
        this.canvas.style.cursor = '';
        document.body.style.cursor = '';
        this.removeCutTrail();
        this.hideCuttingHint();
    }
    
    startCuttingPath(e) {
        if (!this.isCutting) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.cutPath = [{ x, y }];
        this.lastCutPosition = { x, y };
        this.createCutTrail();
    }
    
    updateCutTrail(e) {
        if (!this.isCutting || !this.cutTrail) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Добавляем точку в путь только если достаточно переместились
        if (this.lastCutPosition) {
            const dx = x - this.lastCutPosition.x;
            const dy = y - this.lastCutPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) { // Минимальное расстояние для добавления точки
                this.cutPath.push({ x, y });
                this.lastCutPosition = { x, y };
                this.redrawCutTrail();
            }
        }
    }
    
    createCutTrail() {
        this.cutTrail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.cutTrail.setAttribute('stroke', '#ef4444');
        this.cutTrail.setAttribute('stroke-width', '3');
        this.cutTrail.setAttribute('stroke-dasharray', '8,4');
        this.cutTrail.setAttribute('fill', 'none');
        this.cutTrail.setAttribute('opacity', '0.8');
        this.cutTrail.style.filter = 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))';
        this.cutTrail.style.pointerEvents = 'none';
        
        // Анимация пунктира
        this.cutTrail.style.animation = 'dash-animation 1s linear infinite';
        
        this.svg.appendChild(this.cutTrail);
    }
    
    redrawCutTrail() {
        if (!this.cutTrail || this.cutPath.length < 2) return;
        
        let pathData = `M ${this.cutPath[0].x} ${this.cutPath[0].y}`;
        for (let i = 1; i < this.cutPath.length; i++) {
            pathData += ` L ${this.cutPath[i].x} ${this.cutPath[i].y}`;
        }
        
        this.cutTrail.setAttribute('d', pathData);
    }
    
    removeCutTrail() {
        if (this.cutTrail) {
            this.svg.removeChild(this.cutTrail);
            this.cutTrail = null;
        }
        this.cutPath = [];
        this.lastCutPosition = null;
    }
    
    endCuttingPath() {
        if (!this.isCutting) return;
        
        // Проверяем пересечения с соединениями
        this.cutConnections();
        
        // Удаляем след резки с задержкой для визуального эффекта
        setTimeout(() => {
            this.removeCutTrail();
        }, 200);
    }
    
    checkConnectionIntersections(e) {
        // Проверяем пересечения в реальном времени для визуального фидбека
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Подсвечиваем соединения, которые будут разрезаны
        this.connections.forEach((connection, connectionId) => {
            const line = document.querySelector(`[data-connection-id="${connectionId}"]`);
            if (line && this.isLineIntersectingPath(line, this.cutPath)) {
                line.style.stroke = '#ef4444';
                line.style.strokeWidth = '4';
                line.style.filter = 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.8))';
            } else if (line) {
                // Восстанавливаем стиль
                line.style.stroke = '';
                line.style.strokeWidth = '';
                line.style.filter = '';
            }
        });
    }
    
    cutConnections() {
        const connectionsToRemove = [];
        
        this.connections.forEach((connection, connectionId) => {
            const line = document.querySelector(`[data-connection-id="${connectionId}"]`);
            if (line && this.isLineIntersectingPath(line, this.cutPath)) {
                connectionsToRemove.push(connectionId);
            }
        });
        
        // Удаляем пересекаемые соединения с анимацией
        connectionsToRemove.forEach(connectionId => {
            const line = document.querySelector(`[data-connection-id="${connectionId}"]`);
            if (line) {
                // Анимация исчезновения
                line.style.transition = 'opacity 0.3s ease-out, stroke-width 0.3s ease-out';
                line.style.opacity = '0';
                line.style.strokeWidth = '0';
                
                setTimeout(() => {
                    this.removeConnection(connectionId);
                }, 300);
            } else {
                this.removeConnection(connectionId);
            }
        });
        
        if (connectionsToRemove.length > 0) {
            console.log(`🔪 Разрезано соединений: ${connectionsToRemove.length}`);
        }
    }
    
    isLineIntersectingPath(lineElement, path) {
        if (path.length < 2) return false;
        
        // Получаем координаты линии из SVG
        const x1 = parseFloat(lineElement.getAttribute('x1'));
        const y1 = parseFloat(lineElement.getAttribute('y1'));
        const x2 = parseFloat(lineElement.getAttribute('x2'));
        const y2 = parseFloat(lineElement.getAttribute('y2'));
        
        // Проверяем пересечение линии с каждым сегментом пути резки
        for (let i = 1; i < path.length; i++) {
            const px1 = path[i - 1].x;
            const py1 = path[i - 1].y;
            const px2 = path[i].x;
            const py2 = path[i].y;
            
            if (this.lineIntersection(x1, y1, x2, y2, px1, py1, px2, py2)) {
                return true;
            }
        }
        
        return false;
    }
    
    lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
        // Алгоритм проверки пересечения двух отрезков
        const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        
        if (Math.abs(denominator) < 0.0001) {
            return false; // Линии параллельны
        }
        
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;
        
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }
    
    showCuttingHint() {
        // Создаем подсказку для режима резки
        if (document.querySelector('.cutting-hint')) return;
        
        const hint = document.createElement('div');
        hint.className = 'cutting-hint';
        hint.innerHTML = `
            <i class="fas fa-cut"></i>
            Режим резки активен - проведите линию через соединения
        `;
        hint.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(45deg, #ef4444, #dc2626);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 500;
            z-index: 10000;
            pointer-events: none;
            animation: slideDown 0.3s ease-out;
            box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.2);
        `;
        
        document.body.appendChild(hint);
    }
    
    hideCuttingHint() {
        const hint = document.querySelector('.cutting-hint');
        if (hint) {
            hint.style.animation = 'slideUp 0.3s ease-out forwards';
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.parentNode.removeChild(hint);
                }
            }, 300);
        }
    }
}

// Инициализация после загрузки DOM
let connectionManager;
document.addEventListener('DOMContentLoaded', () => {
    connectionManager = new ConnectionManager();
    window.connectionManager = connectionManager; // Делаем доступным глобально
});