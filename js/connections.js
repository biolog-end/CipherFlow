// === Система управления соединениями между нодами ===

class ConnectionManager {
    constructor() {
        this.connections = new Map();
        this.connectionIdCounter = 0;
        this.isConnecting = false;
        this.startPoint = null;
        this.tempConnection = null;
        this.reverseMode = false;
        
        this.svg = document.getElementById('connections');
        this.canvas = document.getElementById('canvas');
        
        this.initializeConnectionHandlers();
        this.bindEvents();
    }
    
    initializeConnectionHandlers() {
        // Обработка кликов на точки соединения
        this.canvas.addEventListener('mousedown', (e) => {
            const connectionPoint = e.target.closest('.connection-point');
            if (connectionPoint) {
                e.stopPropagation();
                this.startConnection(connectionPoint, e);
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
    
    swapInputOutputFields() {
        const inputText = document.getElementById('inputText');
        const outputText = document.getElementById('outputText');
        const inputLabel = inputText.previousElementSibling;
        const outputLabel = outputText.previousElementSibling;
        
        if (this.reverseMode) {
            // В режиме дешифрации: поле вывода становится вводом, поле ввода становится выводом
            inputText.readOnly = true;
            outputText.readOnly = false;
            inputText.placeholder = 'Результат появится здесь...';
            outputText.placeholder = 'Введите зашифрованный текст...';
            inputLabel.textContent = 'Результат:';
            outputLabel.textContent = 'Зашифрованный текст:';
            
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
}

// Инициализация после загрузки DOM
let connectionManager;
document.addEventListener('DOMContentLoaded', () => {
    connectionManager = new ConnectionManager();
    window.connectionManager = connectionManager; // Делаем доступным глобально
});