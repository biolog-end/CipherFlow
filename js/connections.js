// ФАЙЛ: js/connections.js
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
                
                // Правый клик + Shift для разрыва связей
                if ((e.button === 2 || (e.button === 0 && e.shiftKey)) && e.shiftKey) {
                    e.preventDefault();
                    this.breakConnectionsAtPoint(connectionPoint);
                } else if (e.button === 0) {
                    // === НАЧАЛО ИЗМЕНЕНИЯ: Добавлено для предотвращения нативного drag-and-drop ===
                    e.preventDefault(); 
                    // === КОНЕЦ ИЗМЕНЕНИЯ ===
                    
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
            fromPoint = { 
                nodeId: startNodeId, 
                element: startPoint, 
                type: 'output',
                outputName: startPoint.dataset.outputName || null
            };
            toPoint = { 
                nodeId: endNodeId, 
                element: endPoint, 
                type: 'input',
                inputName: endPoint.dataset.inputName || null
            };
        } else if (startType === 'input' && endType === 'output') {
            fromPoint = { 
                nodeId: endNodeId, 
                element: endPoint, 
                type: 'output',
                outputName: endPoint.dataset.outputName || null
            };
            toPoint = { 
                nodeId: startNodeId, 
                element: startPoint, 
                type: 'input',
                inputName: startPoint.dataset.inputName || null
            };
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
        
        // Воспроизводим звук соединения
        if (window.settingsSystem?.settings.soundEffects) {
            window.settingsSystem.playSound('connection');
        }
        
        // Уведомляем систему пасхалок о создании соединения
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('connections-updated', {
                detail: { action: 'connection-added', connectionId }
            }));
        }, 100);
        
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
        
        // Воспроизводим звук разрыва соединения
        if (window.settingsSystem?.settings.soundEffects) {
            window.settingsSystem.playSound('disconnect');
        }
        
        // Уведомляем систему пасхалок об удалении соединения
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('connections-updated', {
                detail: { action: 'connection-removed', connectionId }
            }));
        }, 100);
        
        // Запускаем обновление выполнения
        if (window.nodeManager) {
            window.nodeManager.triggerExecution();
        }
    }
    
    // Восстановить соединение из данных истории
    restoreConnection(connectionData) {
        if (!connectionData) return;
        
        // Найдем ноды для восстановления соединения
        const fromNode = window.nodeManager?.nodes.get(connectionData.from);
        const toNode = window.nodeManager?.nodes.get(connectionData.to);
        
        if (!fromNode || !toNode) {
            console.error('Cannot restore connection: nodes not found', connectionData);
            return;
        }
        
        // Найдем точки соединения
        const fromPoint = fromNode.element.querySelector('.connection-point.output');
        let toPoint;
        
        // Если есть имя входа, ищем специфический вход
        if (connectionData.inputName) {
            toPoint = toNode.element.querySelector(`.connection-point.input[data-input-name="${connectionData.inputName}"]`);
        }
        
        // Если не нашли специфический вход или его нет, используем первый доступный
        if (!toPoint) {
            toPoint = toNode.element.querySelector('.connection-point.input');
        }
        
        if (fromPoint && toPoint) {
            return this.createConnection(fromPoint, toPoint);
        }
        
        console.error('Cannot restore connection: connection points not found', connectionData);
        return null;
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
            // Проверяем, что to/from существуют и являются объектами
            if (connection.to && typeof connection.to === 'object' && connection.to.nodeId === nodeId) {
                nodeConnections.inputs.push({
                    connectionId: connection.id,
                    fromNodeId: connection.from.nodeId,
                    inputName: connection.to.element.dataset.inputName || 'default',
                    // Добавляем имя выхода, с которого пришло соединение (для маршрутизатора)
                    fromOutputName: connection.from.element.dataset.outputName || 'default'
                });
            }
                    
            // Проверяем, что to/from существуют и являются объектами
            if (connection.from && typeof connection.from === 'object' && connection.from.nodeId === nodeId) {
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
        
        // Получаем функцию перевода для удобства
        const t = window.i18n.t.bind(window.i18n);

        if (this.reverseMode) {
            // В режиме дешифровки меняем роли полей
            inputText.readOnly = true;
            outputText.readOnly = false;
            inputText.placeholder = t('io.decrypted_placeholder');
            outputText.placeholder = t('io.encrypted_placeholder');
            inputLabel.textContent = t('io.decrypted_label');
            outputLabel.textContent = t('io.encrypted_label');
            
            inputSection.classList.add('decrypt-result');
            outputSection.classList.add('decrypt-input');
            
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
            // Используем стандартные ключи
            inputText.placeholder = t('io.input_placeholder');
            outputText.placeholder = t('io.output_placeholder');
            inputLabel.textContent = t('io.input_label');
            outputLabel.textContent = t('io.output_label');
            
            inputSection.classList.remove('decrypt-result');
            outputSection.classList.remove('decrypt-input');
            
            if (this.handleDecryptModeInput) {
                outputText.removeEventListener('input', this.handleDecryptModeInput);
            }
        }
        
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