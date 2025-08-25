// === Система управления историей действий (Undo/Redo) ===

class HistoryManager {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistorySize = 50;
        this.isExecutingCommand = false;
        
        this.initializeKeyboardShortcuts();
    }
    
    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Z для Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            
            // Ctrl/Cmd + Shift + Z или Ctrl/Cmd + Y для Redo
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                this.redo();
            }
        });
    }
    
    // Добавить действие в историю
    addAction(action) {
        if (this.isExecutingCommand) return;
        
        // Удаляем все действия после текущего индекса
        this.history = this.history.slice(0, this.currentIndex + 1);
        
        // Добавляем новое действие
        this.history.push(action);
        
        // Ограничиваем размер истории
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
    }
    
    // Отменить действие
    undo() {
        if (this.currentIndex < 0) {
            this.showIndicator('Нечего отменять');
            return;
        }
        
        const action = this.history[this.currentIndex];
        this.isExecutingCommand = true;
        
        try {
            this.executeUndo(action);
            this.currentIndex--;
            this.showIndicator('Отменено: ' + action.description);
        } catch (error) {
            console.error('Ошибка отмены действия:', error);
            this.showIndicator('Ошибка отмены', 'error');
        } finally {
            this.isExecutingCommand = false;
        }
    }
    
    // Повторить действие
    redo() {
        if (this.currentIndex >= this.history.length - 1) {
            this.showIndicator('Нечего повторять');
            return;
        }
        
        this.currentIndex++;
        const action = this.history[this.currentIndex];
        this.isExecutingCommand = true;
        
        try {
            this.executeRedo(action);
            this.showIndicator('Повторено: ' + action.description);
        } catch (error) {
            console.error('Ошибка повтора действия:', error);
            this.showIndicator('Ошибка повтора', 'error');
        } finally {
            this.isExecutingCommand = false;
        }
    }
    
    // Выполнить отмену действия
    executeUndo(action) {
        switch (action.type) {
            case 'create_node':
                if (window.nodeManager) {
                    window.nodeManager.removeNode(action.data.nodeId, true);
                }
                break;
                
            case 'delete_node':
                if (window.nodeManager) {
                    const node = window.nodeManager.restoreNode(action.data);
                    // Восстанавливаем соединения
                    if (action.data.connections) {
                        action.data.connections.forEach(conn => {
                            window.connectionManager.restoreConnection(conn);
                        });
                    }
                }
                break;
                
            case 'move_node':
                if (window.nodeManager) {
                    const node = window.nodeManager.nodes.get(action.data.nodeId);
                    if (node) {
                        node.element.style.transform = `translate(${action.data.oldX}px, ${action.data.oldY}px)`;
                        node.x = action.data.oldX;
                        node.y = action.data.oldY;
                        window.connectionManager.updateConnections(action.data.nodeId);
                    }
                }
                break;
                
            case 'create_connection':
                if (window.connectionManager) {
                    window.connectionManager.removeConnection(action.data.connectionId, true);
                }
                break;
                
            case 'delete_connection':
                if (window.connectionManager) {
                    window.connectionManager.restoreConnection(action.data);
                }
                break;
                
            case 'change_field':
                if (window.nodeManager) {
                    const node = window.nodeManager.nodes.get(action.data.nodeId);
                    if (node) {
                        const input = node.element.querySelector(`[name="${action.data.fieldName}"]`);
                        if (input) {
                            input.value = action.data.oldValue;
                            // Обновляем данные нода
                            const field = node.data.fields.find(f => f.name === action.data.fieldName);
                            if (field) {
                                field.value = action.data.oldValue;
                            }
                            window.nodeManager.triggerExecution();
                        }
                    }
                }
                break;
        }
    }
    
    // Выполнить повтор действия
    executeRedo(action) {
        switch (action.type) {
            case 'create_node':
                if (window.nodeManager) {
                    window.nodeManager.restoreNode(action.data);
                }
                break;
                
            case 'delete_node':
                if (window.nodeManager) {
                    window.nodeManager.removeNode(action.data.nodeId, true);
                }
                break;
                
            case 'move_node':
                if (window.nodeManager) {
                    const node = window.nodeManager.nodes.get(action.data.nodeId);
                    if (node) {
                        node.element.style.transform = `translate(${action.data.newX}px, ${action.data.newY}px)`;
                        node.x = action.data.newX;
                        node.y = action.data.newY;
                        window.connectionManager.updateConnections(action.data.nodeId);
                    }
                }
                break;
                
            case 'create_connection':
                if (window.connectionManager) {
                    window.connectionManager.restoreConnection(action.data);
                }
                break;
                
            case 'delete_connection':
                if (window.connectionManager) {
                    window.connectionManager.removeConnection(action.data.connectionId, true);
                }
                break;
                
            case 'change_field':
                if (window.nodeManager) {
                    const node = window.nodeManager.nodes.get(action.data.nodeId);
                    if (node) {
                        const input = node.element.querySelector(`[name="${action.data.fieldName}"]`);
                        if (input) {
                            input.value = action.data.newValue;
                            // Обновляем данные нода
                            const field = node.data.fields.find(f => f.name === action.data.fieldName);
                            if (field) {
                                field.value = action.data.newValue;
                            }
                            window.nodeManager.triggerExecution();
                        }
                    }
                }
                break;
        }
    }
    
    // Показать индикатор действия
    showIndicator(message, type = 'info') {
        let indicator = document.querySelector('.undo-redo-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'undo-redo-indicator';
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = message;
        indicator.className = 'undo-redo-indicator show';
        if (type === 'error') {
            indicator.style.background = 'var(--error)';
        } else {
            indicator.style.background = 'var(--bg-secondary)';
        }
        
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }
    
    // Очистить историю
    clear() {
        this.history = [];
        this.currentIndex = -1;
    }
}

// === Система группового выделения и копирования ===

class SelectionManager {
    constructor() {
        this.selectedNodes = new Set();
        this.isSelecting = false;
        this.selectionBox = null;
        this.startX = 0;
        this.startY = 0;
        this.clipboard = null;
        
        this.initializeSelectionHandlers();
        this.initializeKeyboardShortcuts();
    }
    
    initializeSelectionHandlers() {
        const canvas = document.getElementById('canvas');
        
        // Начало выделения
        canvas.addEventListener('mousedown', (e) => {
            // Проверяем, что клик не по ноду
            if (e.target.closest('.canvas-node') || e.target.closest('.connection-point')) {
                return;
            }
            
            // Начинаем выделение при зажатом Shift
            if (e.shiftKey && e.button === 0) {
                e.preventDefault();
                this.startSelection(e);
            }
        });
        
        // Обновление выделения
        document.addEventListener('mousemove', (e) => {
            if (this.isSelecting) {
                this.updateSelection(e);
            }
        });
        
        // Завершение выделения
        document.addEventListener('mouseup', () => {
            if (this.isSelecting) {
                this.endSelection();
            }
        });
    }
    
    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + A для выделения всех нодов
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                this.selectAll();
            }
            
            // Ctrl/Cmd + C для копирования
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                this.copySelected();
            }
            
            // Ctrl/Cmd + V для вставки
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                e.preventDefault();
                this.paste();
            }
            
            // Delete для удаления выделенных нодов
            if (e.key === 'Delete' && this.selectedNodes.size > 0) {
                e.preventDefault();
                this.deleteSelected();
            }
            
            // Escape для снятия выделения
            if (e.key === 'Escape') {
                this.clearSelection();
            }
        });
    }
    
    startSelection(e) {
        const canvas = document.getElementById('canvas');
        const rect = canvas.getBoundingClientRect();
        
        this.isSelecting = true;
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        
        // Создаем прямоугольник выделения
        this.selectionBox = document.createElement('div');
        this.selectionBox.className = 'selection-box';
        this.selectionBox.style.left = this.startX + 'px';
        this.selectionBox.style.top = this.startY + 'px';
        this.selectionBox.style.width = '0';
        this.selectionBox.style.height = '0';
        
        canvas.appendChild(this.selectionBox);
        
        // Очищаем предыдущее выделение если не зажат Ctrl
        if (!e.ctrlKey && !e.metaKey) {
            this.clearSelection();
        }
    }
    
    updateSelection(e) {
        if (!this.selectionBox) return;
        
        const canvas = document.getElementById('canvas');
        const rect = canvas.getBoundingClientRect();
        
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        const left = Math.min(this.startX, currentX);
        const top = Math.min(this.startY, currentY);
        const width = Math.abs(currentX - this.startX);
        const height = Math.abs(currentY - this.startY);
        
        this.selectionBox.style.left = left + 'px';
        this.selectionBox.style.top = top + 'px';
        this.selectionBox.style.width = width + 'px';
        this.selectionBox.style.height = height + 'px';
        
        // Проверяем какие ноды попали в область выделения
        this.updateSelectedNodes(left, top, width, height);
    }
    
    updateSelectedNodes(left, top, width, height) {
        const selectionRect = {
            left: left,
            top: top,
            right: left + width,
            bottom: top + height
        };
        
        if (window.nodeManager) {
            window.nodeManager.nodes.forEach((node, nodeId) => {
                const nodeRect = node.element.getBoundingClientRect();
                const canvasRect = document.getElementById('canvas').getBoundingClientRect();
                
                const nodePos = {
                    left: nodeRect.left - canvasRect.left,
                    top: nodeRect.top - canvasRect.top,
                    right: nodeRect.right - canvasRect.left,
                    bottom: nodeRect.bottom - canvasRect.top
                };
                
                // Проверяем пересечение
                if (nodePos.left < selectionRect.right &&
                    nodePos.right > selectionRect.left &&
                    nodePos.top < selectionRect.bottom &&
                    nodePos.bottom > selectionRect.top) {
                    
                    this.addToSelection(nodeId);
                } else if (!e.ctrlKey && !e.metaKey) {
                    this.removeFromSelection(nodeId);
                }
            });
        }
    }
    
    endSelection() {
        this.isSelecting = false;
        
        if (this.selectionBox) {
            this.selectionBox.remove();
            this.selectionBox = null;
        }
    }
    
    addToSelection(nodeId) {
        this.selectedNodes.add(nodeId);
        const node = window.nodeManager.nodes.get(nodeId);
        if (node) {
            node.element.classList.add('group-selected');
        }
    }
    
    removeFromSelection(nodeId) {
        this.selectedNodes.delete(nodeId);
        const node = window.nodeManager.nodes.get(nodeId);
        if (node) {
            node.element.classList.remove('group-selected');
        }
    }
    
    clearSelection() {
        this.selectedNodes.forEach(nodeId => {
            const node = window.nodeManager.nodes.get(nodeId);
            if (node) {
                node.element.classList.remove('group-selected');
            }
        });
        this.selectedNodes.clear();
    }
    
    selectAll() {
        if (window.nodeManager) {
            window.nodeManager.nodes.forEach((node, nodeId) => {
                this.addToSelection(nodeId);
            });
        }
    }
    
    copySelected() {
        if (this.selectedNodes.size === 0) return;
        
        const copiedData = {
            nodes: [],
            connections: []
        };
        
        // Копируем ноды
        this.selectedNodes.forEach(nodeId => {
            const node = window.nodeManager.nodes.get(nodeId);
            if (node) {
                copiedData.nodes.push({
                    id: nodeId,
                    type: node.type,
                    x: node.x,
                    y: node.y,
                    data: JSON.parse(JSON.stringify(node.data))
                });
                
                // Добавляем визуальный эффект копирования
                node.element.classList.add('copying');
                setTimeout(() => {
                    node.element.classList.remove('copying');
                }, 500);
            }
        });
        
        // Копируем соединения между выделенными нодами
        if (window.connectionManager) {
            window.connectionManager.connections.forEach(connection => {
                if (this.selectedNodes.has(connection.from.nodeId) &&
                    this.selectedNodes.has(connection.to.nodeId)) {
                    copiedData.connections.push({
                        from: connection.from.nodeId,
                        to: connection.to.nodeId,
                        fromOutput: connection.from.type,
                        toInput: connection.to.element.dataset.inputName || 'default'
                    });
                }
            });
        }
        
        this.clipboard = copiedData;
        
        if (window.historyManager) {
            window.historyManager.showIndicator(`Скопировано нодов: ${copiedData.nodes.length}`);
        }
    }
    
    paste() {
        if (!this.clipboard || this.clipboard.nodes.length === 0) return;
        
        const offset = 50; // Смещение для вставленных нодов
        const nodeIdMapping = new Map();
        
        // Вставляем ноды
        this.clipboard.nodes.forEach(nodeData => {
            const newNodeId = window.nodeManager.createNode(
                nodeData.type,
                nodeData.x + offset,
                nodeData.y + offset
            );
            
            nodeIdMapping.set(nodeData.id, newNodeId);
            
            // Восстанавливаем данные нода
            const newNode = window.nodeManager.nodes.get(newNodeId);
            if (newNode && nodeData.data) {
                newNode.data = JSON.parse(JSON.stringify(nodeData.data));
                
                // Обновляем значения в элементах формы
                nodeData.data.fields?.forEach(field => {
                    const input = newNode.element.querySelector(`[name="${field.name}"]`);
                    if (input) {
                        input.value = field.value;
                    }
                });
            }
        });
        
        // Восстанавливаем соединения
        this.clipboard.connections.forEach(connData => {
            const fromNodeId = nodeIdMapping.get(connData.from);
            const toNodeId = nodeIdMapping.get(connData.to);
            
            if (fromNodeId && toNodeId) {
                const fromNode = window.nodeManager.nodes.get(fromNodeId);
                const toNode = window.nodeManager.nodes.get(toNodeId);
                
                if (fromNode && toNode) {
                    const fromPoint = fromNode.element.querySelector('.connection-point.output');
                    let toPoint;
                    
                    if (connData.toInput && connData.toInput !== 'default') {
                        toPoint = toNode.element.querySelector(`.connection-point.input[data-input-name="${connData.toInput}"]`);
                    } else {
                        toPoint = toNode.element.querySelector('.connection-point.input');
                    }
                    
                    if (fromPoint && toPoint) {
                        window.connectionManager.createConnection(fromPoint, toPoint);
                    }
                }
            }
        });
        
        // Выделяем вставленные ноды
        this.clearSelection();
        nodeIdMapping.forEach(newNodeId => {
            this.addToSelection(newNodeId);
        });
        
        if (window.historyManager) {
            window.historyManager.showIndicator(`Вставлено нодов: ${nodeIdMapping.size}`);
        }
    }
    
    deleteSelected() {
        if (this.selectedNodes.size === 0) return;
        
        const count = this.selectedNodes.size;
        
        this.selectedNodes.forEach(nodeId => {
            if (window.nodeManager) {
                window.nodeManager.removeNode(nodeId);
            }
        });
        
        this.clearSelection();
        
        if (window.historyManager) {
            window.historyManager.showIndicator(`Удалено нодов: ${count}`);
        }
    }
}

// Создаем глобальные экземпляры
window.historyManager = new HistoryManager();
window.selectionManager = new SelectionManager();