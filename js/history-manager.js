// File: js/history-manager.js
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
            // Проверяем, что фокус не на элементах ввода текста
            const activeElement = document.activeElement;
            const isTextInput = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.contentEditable === 'true'
            );
            
            // Не обрабатываем горячие клавиши в текстовых полях
            if (isTextInput) return;
            
            // Создаем мапинг клавиш для поддержки русской раскладки
            const keyMap = {
                'я': 'z',  // я - русская Z
                'н': 'y'   // н - русская Y
            };
            
            // Нормализуем клавишу (поддержка русской раскладки)
            const normalizedKey = keyMap[e.key.toLowerCase()] || e.key.toLowerCase();
            
            // Ctrl/Cmd + Z для Undo (поддержка 'я' для русской раскладки)
            if ((e.ctrlKey || e.metaKey) && normalizedKey === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            
            // Ctrl/Cmd + Shift + Z или Ctrl/Cmd + Y для Redo (поддержка 'я' и 'н' для русской раскладки)
            if ((e.ctrlKey || e.metaKey) && (normalizedKey === 'y' || (normalizedKey === 'z' && e.shiftKey))) {
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

            case 'move_node_group':
                if (window.nodeManager) {
                    action.data.nodes.forEach(nodeData => {
                        window.nodeManager.moveNode(nodeData.nodeId, nodeData.oldX, nodeData.oldY);
                    });
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

            case 'move_node_group':
                if (window.nodeManager) {
                    action.data.nodes.forEach(nodeData => {
                        window.nodeManager.moveNode(nodeData.nodeId, nodeData.newX, nodeData.newY);
                    });
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
        
        canvas.addEventListener('mousedown', (e) => {

            if (e.button !== 0 || e.ctrlKey || 
                e.target.closest('.canvas-node') || 
                e.target.closest('.connection-point') ||
                (window.canvasManager && window.canvasManager.isCuttingActive())) {
                return;
            }

            // Запускаем выделение рамкой
            e.preventDefault();
            this.startSelection(e);
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
        // Убираем обработчики клавиатуры из SelectionManager,
        // так как они обрабатываются в main.js для лучшего контроля контекста
        // (проверка текстовых полей, справки и т.д.)
        
        // Остается только обработчик Escape для снятия выделения при клике на пустое место
        document.addEventListener('click', (e) => {
            if (e.target === document.getElementById('canvas') || 
                e.target.classList.contains('canvas-background')) {
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
        this.updateSelectedNodes(left, top, width, height, e);
    }
    
    updateSelectedNodes(left, top, width, height, event) {
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
                } else if (!event || (!event.ctrlKey && !event.metaKey)) {
                    // Удаляем из выделения только если не используются модификаторы
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
            // === ИЗМЕНЕНИЕ: Используем один класс "selected" для консистентности ===
            node.element.classList.add('selected');
        }
    }
    
    removeFromSelection(nodeId) {
        this.selectedNodes.delete(nodeId);
        const node = window.nodeManager.nodes.get(nodeId);
        if (node) {
            node.element.classList.remove('selected');
        }
    }
    
    clearSelection() {
        this.selectedNodes.forEach(nodeId => {
            const node = window.nodeManager.nodes.get(nodeId);
            if (node) {
                node.element.classList.remove('selected');
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
    
    async copySelected() {
        if (this.selectedNodes.size === 0) return;
        
        const copiedData = {
            __cipherFlowData: true, // Добавляем метку для идентификации наших данных
            nodes: [],
            connections: []
        };
        
        // Копируем ноды
        this.selectedNodes.forEach(nodeId => {
            const node = window.nodeManager.nodes.get(nodeId);
            if (node) {
                copiedData.nodes.push({
                    id: nodeId, // Мы все еще используем старый ID для маппинга соединений
                    type: node.type,
                    x: node.x,
                    y: node.y,
                    data: JSON.parse(JSON.stringify(node.data))
                });
                
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
                        fromOutputName: connection.from.element.dataset.outputName,
                        inputName: connection.to.element.dataset.inputName
                    });
                }
            });
        }
        
        // 1. Сохраняем во внутренний буфер для быстрого копирования в пределах одной вкладки
        this.clipboard = copiedData;
        
        // 2. Пытаемся записать в системный буфер обмена
        try {
            const jsonString = JSON.stringify(copiedData, null, 2);
            await navigator.clipboard.writeText(jsonString);
            
            if (window.historyManager) {
                window.historyManager.showIndicator(`Скопировано в буфер: ${copiedData.nodes.length} нод(ов)`);
            }
        } catch (err) {
            console.error('Ошибка записи в буфер обмена:', err);
            if (window.historyManager) {
                window.historyManager.showIndicator('Ошибка: не удалось скопировать в системный буфер', 'error');
            }
        }
    }
    
    // js/history-manager.js

    async paste() {
        let clipboardData = null;

        // 1. Пытаемся прочитать данные из системного буфера обмена.
        try {
            const textFromClipboard = await navigator.clipboard.readText();
            const parsedData = JSON.parse(textFromClipboard);

            // Проверяем наличие нашей специальной метки, чтобы не вставлять случайный JSON.
            if (parsedData && parsedData.__cipherFlowData) {
                clipboardData = parsedData;
            }
        } catch (err) {
            // Ошибка может возникнуть, если буфер пуст, содержит не JSON, или нет разрешений.
            // Это не страшно, мы просто перейдем к использованию внутреннего буфера.
            console.warn('Не удалось прочитать данные из системного буфера, используется внутренний.', err);
        }
        
        // 2. Фалбэк на внутренний буфер, если из системного ничего не получили.
        if (!clipboardData) {
            clipboardData = this.clipboard;
        }

        // 3. Проверяем валидность данных перед вставкой.
        if (!clipboardData || !clipboardData.nodes || clipboardData.nodes.length === 0) {
            if (window.historyManager) {
                window.historyManager.showIndicator('Буфер обмена пуст или содержит неверные данные', 'error');
            }
            return;
        }
        
        // 4. Логика вставки нодов.
        const nodeIdMapping = new Map();

        // Получаем центр видимой области канваса в мировых координатах.
        const canvas = document.getElementById('canvas');
        const canvasRect = canvas.getBoundingClientRect();
        const centerScreenX = canvasRect.width / 2;
        const centerScreenY = canvasRect.height / 2;
        const worldCenter = window.canvasManager.screenToWorld(centerScreenX, centerScreenY);

        // Вычисляем смещение, чтобы вставить ноды в центр.
        const firstNode = clipboardData.nodes[0];
        const offsetX = worldCenter.x - firstNode.x;
        const offsetY = worldCenter.y - firstNode.y;

        // Вставляем ноды со смещением.
        clipboardData.nodes.forEach(nodeData => {
            const newX = nodeData.x + offsetX + (Math.random() * 20 - 10); // Небольшая случайность, чтобы вставки не накладывались
            const newY = nodeData.y + offsetY + (Math.random() * 20 - 10);
            
            // Создаем нод, передавая мировые координаты (третий параметр true).
            const newNodeId = window.nodeManager.createNode(nodeData.type, newX, newY, true);
            nodeIdMapping.set(nodeData.id, newNodeId);
            
            // Восстанавливаем данные полей нода.
            const newNode = window.nodeManager.nodes.get(newNodeId);
            if (newNode && nodeData.data) {
                newNode.data = JSON.parse(JSON.stringify(nodeData.data));
                
                nodeData.data.fields?.forEach(field => {
                    if (field.type === 'multi-rules') {
                        if (Array.isArray(field.value)) {
                            const rulesContainer = newNode.element.querySelector(`.rules-container[data-node-id="${newNodeId}"]`);
                            if (rulesContainer) {
                                rulesContainer.innerHTML = '';
                                field.value.forEach((rule, index) => {
                                    window.nodeManager.createRuleElement(newNodeId, index, rule);
                                });
                            }
                        }
                    } else {
                        const input = newNode.element.querySelector(`[name="${field.name}"]`);
                        if (input) {
                            if (input.type === 'checkbox') {
                                input.checked = field.value;
                            } else {
                                input.value = field.value;
                            }
                        }
                    }
                });
            }
        });
        
        // 5. Восстанавливаем соединения между вставленными нодами.
        clipboardData.connections.forEach(connData => {
            const fromNodeId = nodeIdMapping.get(connData.from);
            const toNodeId = nodeIdMapping.get(connData.to);
            
            if (fromNodeId && toNodeId) {
                const fromNode = window.nodeManager.nodes.get(fromNodeId);
                const toNode = window.nodeManager.nodes.get(toNodeId);
                
                if (fromNode && toNode) {
                    let fromPoint, toPoint;

                    // Ищем КОНКРЕТНУЮ точку выхода, если ее имя сохранено
                    if (connData.fromOutputName) {
                        fromPoint = fromNode.element.querySelector(`.connection-point.output[data-output-name="${connData.fromOutputName}"]`);
                    } else {
                        fromPoint = fromNode.element.querySelector('.connection-point.output');
                    }

                    // Ищем КОНКРЕТНУЮ точку входа, если ее имя сохранено
                    if (connData.inputName) {
                        toPoint = toNode.element.querySelector(`.connection-point.input[data-input-name="${connData.inputName}"]`);
                    } else {
                        toPoint = toNode.element.querySelector('.connection-point.input');
                    }
                    
                    if (fromPoint && toPoint) {
                        window.connectionManager.createConnection(fromPoint, toPoint);
                    }
                }
            }
        });
        
        // 6. Выделяем вставленные ноды для удобства.
        this.clearSelection();
        nodeIdMapping.forEach(newNodeId => {
            this.addToSelection(newNodeId);
        });
        
        if (window.historyManager) {
            window.historyManager.showIndicator(`Вставлено нодов: ${nodeIdMapping.size}`);
        }

        // Запускаем пересчет цепочки
        window.nodeManager.triggerExecution();
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