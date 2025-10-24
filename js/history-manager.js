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

            const activeElement = document.activeElement;
            const isTextInput = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.contentEditable === 'true'
            );
            
            if (isTextInput) return;
            
            const keyMap = {
                'я': 'z',  
                'н': 'y'   
            };
            
            const normalizedKey = keyMap[e.key.toLowerCase()] || e.key.toLowerCase();
            
            if ((e.ctrlKey || e.metaKey) && normalizedKey === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            
            if ((e.ctrlKey || e.metaKey) && (normalizedKey === 'y' || (normalizedKey === 'z' && e.shiftKey))) {
                e.preventDefault();
                this.redo();
            }
        });
    }
    
    addAction(action) {
        if (this.isExecutingCommand) return;
        
        this.history = this.history.slice(0, this.currentIndex + 1);
        
        this.history.push(action);
        
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
    }
    
    undo() {
        const t = window.i18n.t.bind(window.i18n);
        if (this.currentIndex < 0) {
            this.showIndicator(t('history.nothing_to_undo'));
            return;
        }
        
        const action = this.history[this.currentIndex];
        this.isExecutingCommand = true;
        
        try {
            this.executeUndo(action);
            this.currentIndex--;
            this.showIndicator(t('history.undone', { description: action.description }));
        } catch (error) {
            console.error('Ошибка отмены действия:', error);
            this.showIndicator(t('history.undo_error'), 'error');
        } finally {
            this.isExecutingCommand = false;
        }
    }
    
    redo() {
        const t = window.i18n.t.bind(window.i18n);
        if (this.currentIndex >= this.history.length - 1) {
            this.showIndicator(t('history.nothing_to_redo'));
            return;
        }
        
        this.currentIndex++;
        const action = this.history[this.currentIndex];
        this.isExecutingCommand = true;
        
    try {
        this.executeRedo(action);
        this.showIndicator(t('history.redone', { description: action.description }));
    } catch (error) {
        console.error('Action retry error:', error);
        this.showIndicator(t('history.redo_error'), 'error');
    } finally {
            this.isExecutingCommand = false;
        }
    }
    
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
    
    clear() {
        this.history = [];
        this.currentIndex = -1;
    }
}

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

            e.preventDefault();
            this.startSelection(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isSelecting) {
                this.updateSelection(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (this.isSelecting) {
                this.endSelection();
            }
        });
    }
    
    initializeKeyboardShortcuts() {
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
        
        this.selectionBox = document.createElement('div');
        this.selectionBox.className = 'selection-box';
        this.selectionBox.style.left = this.startX + 'px';
        this.selectionBox.style.top = this.startY + 'px';
        this.selectionBox.style.width = '0';
        this.selectionBox.style.height = '0';
        
        canvas.appendChild(this.selectionBox);
        
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
                
                if (nodePos.left < selectionRect.right &&
                    nodePos.right > selectionRect.left &&
                    nodePos.top < selectionRect.bottom &&
                    nodePos.bottom > selectionRect.top) {
                    
                    this.addToSelection(nodeId);
                } else if (!event || (!event.ctrlKey && !event.metaKey)) {
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
            __cipherFlowData: true, 
            nodes: [],
            connections: []
        };
        
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
                
                node.element.classList.add('copying');
                setTimeout(() => {
                    node.element.classList.remove('copying');
                }, 500);
            }
        });
        
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
        
        this.clipboard = copiedData;
        
        const t = window.i18n.t.bind(window.i18n);
        try {
            const jsonString = JSON.stringify(copiedData, null, 2);
            await navigator.clipboard.writeText(jsonString);
            
            if (window.historyManager) {
                window.historyManager.showIndicator(t('selection.copied', { count: copiedData.nodes.length }));
            }
        } catch (err) {
            console.error('Ошибка записи в буфер обмена:', err);
            if (window.historyManager) {
                window.historyManager.showIndicator(t('selection.copy_error'), 'error');
            }
        }
    }

    async paste() {
        const t = window.i18n.t.bind(window.i18n); 
        let clipboardData = null;

        try {
            const textFromClipboard = await navigator.clipboard.readText();
            const parsedData = JSON.parse(textFromClipboard);

            if (parsedData && parsedData.__cipherFlowData) {
                clipboardData = parsedData;
            }
        } catch (err) {
            console.warn('Не удалось прочитать данные из системного буфера, используется внутренний.', err);
        }
        
        if (!clipboardData) {
            clipboardData = this.clipboard;
        }

        if (!clipboardData || !clipboardData.nodes || clipboardData.nodes.length === 0) {
            if (window.historyManager) {
                window.historyManager.showIndicator(t('selection.paste_empty'), 'error');
            }
            return;
        }
        
        const nodeIdMapping = new Map();

        const canvas = document.getElementById('canvas');
        const canvasRect = canvas.getBoundingClientRect();
        const centerScreenX = canvasRect.width / 2;
        const centerScreenY = canvasRect.height / 2;
        const worldCenter = window.canvasManager.screenToWorld(centerScreenX, centerScreenY);

        const firstNode = clipboardData.nodes[0];
        const offsetX = worldCenter.x - firstNode.x;
        const offsetY = worldCenter.y - firstNode.y;

        clipboardData.nodes.forEach(nodeData => {
            const newX = nodeData.x + offsetX + (Math.random() * 20 - 10); 
            const newY = nodeData.y + offsetY + (Math.random() * 20 - 10);
            
            const newNodeId = window.nodeManager.createNode(nodeData.type, newX, newY, true);
            nodeIdMapping.set(nodeData.id, newNodeId);
            
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
        
        clipboardData.connections.forEach(connData => {
            const fromNodeId = nodeIdMapping.get(connData.from);
            const toNodeId = nodeIdMapping.get(connData.to);
            
            if (fromNodeId && toNodeId) {
                const fromNode = window.nodeManager.nodes.get(fromNodeId);
                const toNode = window.nodeManager.nodes.get(toNodeId);
                
                if (fromNode && toNode) {
                    let fromPoint, toPoint;

                    if (connData.fromOutputName) {
                        fromPoint = fromNode.element.querySelector(`.connection-point.output[data-output-name="${connData.fromOutputName}"]`);
                    } else {
                        fromPoint = fromNode.element.querySelector('.connection-point.output');
                    }

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
        
        this.clearSelection();
        nodeIdMapping.forEach(newNodeId => {
            this.addToSelection(newNodeId);
        });
        
        if (window.historyManager) {
            window.historyManager.showIndicator(t('selection.pasted', { count: nodeIdMapping.size }));
        }

        window.nodeManager.triggerExecution();
    }
    
    deleteSelected() {
        const t = window.i18n.t.bind(window.i18n); 

        if (this.selectedNodes.size === 0) return;
        
        const count = this.selectedNodes.size;
        
        this.selectedNodes.forEach(nodeId => {
            if (window.nodeManager) {
                window.nodeManager.removeNode(nodeId);
            }
        });
        
        this.clearSelection();
        
        if (window.historyManager) {
            window.historyManager.showIndicator(t('selection.deleted', { count }));
        }
    }
}
window.historyManager = new HistoryManager();
window.selectionManager = new SelectionManager();