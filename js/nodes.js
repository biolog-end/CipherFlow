// === Система управления нодами ===

class NodeManager {
    constructor() {
        this.nodes = new Map();
        this.nodeIdCounter = 0;
        this.selectedNode = null;
        this.draggedNode = null;
        this.dragOffset = { x: 0, y: 0 };
        
        this.nodesLayer = document.getElementById('nodesLayer');
        this.canvas = document.getElementById('canvas');
        
        this.initializeDragAndDrop();
        this.bindEvents();
    }
    
    initializeDragAndDrop() {
        const nodeItems = document.querySelectorAll('.node-item');
        
        nodeItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const nodeType = item.dataset.type;
                e.dataTransfer.setData('application/node-type', nodeType);
                e.dataTransfer.effectAllowed = 'copy';
            });
            
            // Альтернативный способ перетаскивания для лучшей поддержки
            item.addEventListener('mousedown', (e) => {
                if (e.button === 0) { // Левая кнопка мыши
                    this.startNodeDrag(item, e);
                }
            });
        });
        
        // Обработка сброса на canvas
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });
        
        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const nodeType = e.dataTransfer.getData('application/node-type');
            if (nodeType) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.createNode(nodeType, x, y);
            }
        });
    }
    
    startNodeDrag(item, e) {
        const clone = item.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.pointerEvents = 'none';
        clone.style.opacity = '0.7';
        clone.style.zIndex = '9999';
        clone.style.transform = 'rotate(5deg)';
        document.body.appendChild(clone);
        
        const updateClonePosition = (e) => {
            clone.style.left = e.clientX + 'px';
            clone.style.top = e.clientY + 'px';
        };
        
        const finishDrag = (e) => {
            document.body.removeChild(clone);
            document.removeEventListener('mousemove', updateClonePosition);
            document.removeEventListener('mouseup', finishDrag);
            
            // Проверим, попали ли мы на canvas
            const canvasRect = this.canvas.getBoundingClientRect();
            if (e.clientX >= canvasRect.left && e.clientX <= canvasRect.right &&
                e.clientY >= canvasRect.top && e.clientY <= canvasRect.bottom) {
                const x = e.clientX - canvasRect.left;
                const y = e.clientY - canvasRect.top;
                this.createNode(item.dataset.type, x, y);
            }
        };
        
        updateClonePosition(e);
        document.addEventListener('mousemove', updateClonePosition);
        document.addEventListener('mouseup', finishDrag);
    }
    
    bindEvents() {
        // Обработка кликов по canvas для снятия выделения
        this.canvas.addEventListener('click', (e) => {
            if (e.target === this.canvas || e.target.classList.contains('canvas-background')) {
                this.deselectAllNodes();
            }
        });
        
        // Обработка перемещения нодов
        this.nodesLayer.addEventListener('mousedown', (e) => {
            const nodeElement = e.target.closest('.canvas-node');
            if (nodeElement && !e.target.closest('.node-remove') && !e.target.closest('.connection-point')) {
                this.startNodeMove(nodeElement, e);
            }
        });
    }
    
    createNode(type, x, y) {
        const nodeId = `node_${this.nodeIdCounter++}`;
        const nodeData = this.getNodeTemplate(type);
        
        const nodeElement = this.createElement(nodeId, nodeData, x, y);
        this.nodesLayer.appendChild(nodeElement);
        
        this.nodes.set(nodeId, {
            id: nodeId,
            type: type,
            element: nodeElement,
            data: nodeData,
            x: x,
            y: y,
            inputs: {},
            outputs: {}
        });
        
        // Добавляем анимацию появления
        nodeElement.classList.add('fade-in');
        
        // Инициализируем обработчики для нового нода
        this.initializeNodeHandlers(nodeId);
        
        // Автоматически выбираем созданный нод
        this.selectNode(nodeId);
        
        return nodeId;
    }
    
    getNodeTemplate(type) {
        const templates = {
            'input': {
                title: 'Ввод текста',
                icon: 'fas fa-sign-in-alt',
                fields: [],
                hasInput: false,
                hasOutput: true
            },
            'output': {
                title: 'Вывод текста',
                icon: 'fas fa-sign-out-alt',
                fields: [],
                hasInput: true,
                hasOutput: false
            },
            'caesar': {
                title: 'Шифр Цезаря',
                icon: 'fas fa-exchange-alt',
                fields: [
                    {
                        name: 'shift',
                        type: 'number',
                        label: 'Сдвиг',
                        value: 3,
                        min: 1,
                        max: 25
                    }
                ],
                hasInput: true,
                hasOutput: true
            },
            'morse': {
                title: 'Код Морзе',
                icon: 'fas fa-broadcast-tower',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: 'Режим',
                        value: 'encode',
                        options: [
                            { value: 'encode', label: 'Кодировать' },
                            { value: 'decode', label: 'Декодировать' }
                        ]
                    }
                ],
                hasInput: true,
                hasOutput: true
            },
            'numbers-to-words': {
                title: 'Числа в слова',
                icon: 'fas fa-hashtag',
                fields: [
                    {
                        name: 'language',
                        type: 'select',
                        label: 'Язык',
                        value: 'ru',
                        options: [
                            { value: 'ru', label: 'Русский' },
                            { value: 'en', label: 'English' },
                            { value: 'mix', label: 'Перемешать' }
                        ]
                    },
                    {
                        name: 'mode',
                        type: 'select',
                        label: 'Направление',
                        value: 'to_words',
                        options: [
                            { value: 'to_words', label: 'В слова' },
                            { value: 'to_numbers', label: 'В числа' }
                        ]
                    }
                ],
                hasInput: true,
                hasOutput: true
            },
            'math': {
                title: 'Математика',
                icon: 'fas fa-calculator',
                fields: [
                    {
                        name: 'operation',
                        type: 'select',
                        label: 'Операция',
                        value: 'add',
                        options: [
                            { value: 'add', label: 'Прибавить' },
                            { value: 'subtract', label: 'Вычесть' },
                            { value: 'multiply', label: 'Умножить' },
                            { value: 'divide', label: 'Разделить' }
                        ]
                    },
                    {
                        name: 'value',
                        type: 'number',
                        label: 'Значение',
                        value: 1
                    }
                ],
                hasInput: true,
                hasOutput: true
            },
            'reverse': {
                title: 'Обратить текст',
                icon: 'fas fa-undo',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: 'Режим',
                        value: 'full',
                        options: [
                            { value: 'full', label: 'Полностью' },
                            { value: 'words', label: 'По словам' }
                        ]
                    }
                ],
                hasInput: true,
                hasOutput: true
            },
            'case-transform': {
                title: 'Регистр',
                icon: 'fas fa-text-height',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: 'Режим',
                        value: 'upper',
                        options: [
                            { value: 'upper', label: 'ВЕРХНИЙ' },
                            { value: 'lower', label: 'нижний' },
                            { value: 'title', label: 'Заглавные' },
                            { value: 'toggle', label: 'иНВЕРТИРОВАТЬ' }
                        ]
                    }
                ],
                hasInput: true,
                hasOutput: true
            },
            'secret-word': {
                title: 'Секретное слово',
                icon: 'fas fa-key',
                fields: [
                    {
                        name: 'keyword',
                        type: 'text',
                        label: 'Ключевое слово',
                        value: 'СЕКРЕТ'
                    }
                ],
                hasInput: false,
                hasOutput: true
            },
            'vigenere': {
                title: 'Шифр Виженера',
                icon: 'fas fa-shield-alt',
                fields: [],
                hasInput: false,
                hasOutput: true,
                multipleInputs: [
                    { name: 'key', label: 'Ключ', color: '#f59e0b' },
                    { name: 'text', label: 'Текст', color: '#3b82f6' }
                ]
            },
            'a1z26': {
                title: 'Шифр A1Z26',
                icon: 'fas fa-sort-numeric-up',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: 'Режим',
                        value: 'encode',
                        options: [
                            { value: 'encode', label: 'Буквы → Числа' },
                            { value: 'decode', label: 'Числа → Буквы' }
                        ]
                    }
                ],
                hasInput: true,
                hasOutput: true
            },
            'braille-binary': {
                title: 'Морзе (Бинарный)',
                icon: 'fas fa-braille',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: 'Режим',
                        value: 'encode',
                        options: [
                            { value: 'encode', label: 'Текст → Бинарный код' },
                            { value: 'decode', label: 'Бинарный код → Текст' }
                        ]
                    }
                ],
                hasInput: true,
                hasOutput: true
            },
            'braille-cat': {
                title: 'Морзе (Кошачий)',
                icon: 'fas fa-cat',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: 'Режим',
                        value: 'encode',
                        options: [
                            { value: 'encode', label: 'Текст → Кошачий код' },
                            { value: 'decode', label: 'Кошачий код → Текст' }
                        ]
                    }
                ],
                hasInput: true,
                hasOutput: true
            }
        };
        
        return templates[type] || templates['input'];
    }
    
    createElement(nodeId, nodeData, x, y) {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'canvas-node';
        nodeElement.dataset.nodeId = nodeId;
        nodeElement.style.transform = `translate(${x}px, ${y}px)`;
        
        // Создаем заголовок
        const header = document.createElement('div');
        header.className = 'node-header';
        header.innerHTML = `
            <i class="${nodeData.icon}"></i>
            <span class="node-title">${nodeData.title}</span>
            <button class="node-remove" onclick="nodeManager.removeNode('${nodeId}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Создаем содержимое
        const content = document.createElement('div');
        content.className = 'node-content';
        
        // Добавляем поля
        nodeData.fields.forEach(field => {
            const fieldElement = this.createFieldElement(field, nodeId);
            content.appendChild(fieldElement);
        });
        
        nodeElement.appendChild(header);
        nodeElement.appendChild(content);
        
        // Добавляем точки соединения
        if (nodeData.hasInput) {
            const inputPoint = document.createElement('div');
            inputPoint.className = 'connection-point input';
            inputPoint.dataset.nodeId = nodeId;
            inputPoint.dataset.type = 'input';
            nodeElement.appendChild(inputPoint);
        }
        
        // Добавляем множественные входы (для шифра Виженера)
        if (nodeData.multipleInputs && Array.isArray(nodeData.multipleInputs)) {
            nodeData.multipleInputs.forEach((input, index) => {
                const inputPoint = document.createElement('div');
                inputPoint.className = 'connection-point input multiple';
                inputPoint.dataset.nodeId = nodeId;
                inputPoint.dataset.type = 'input';
                inputPoint.dataset.inputName = input.name;
                inputPoint.style.top = `${40 + index * 30}px`;
                if (input.color) {
                    inputPoint.style.backgroundColor = input.color;
                }
                
                // Добавляем label для входа
                const label = document.createElement('span');
                label.className = 'input-label';
                label.textContent = input.label;
                label.style.position = 'absolute';
                label.style.left = '25px';
                label.style.top = `${35 + index * 30}px`;
                label.style.fontSize = '0.75rem';
                label.style.color = 'var(--text-muted)';
                label.style.userSelect = 'none';
                
                nodeElement.appendChild(inputPoint);
                nodeElement.appendChild(label);
            });
        }
        
        if (nodeData.hasOutput) {
            const outputPoint = document.createElement('div');
            outputPoint.className = 'connection-point output';
            outputPoint.dataset.nodeId = nodeId;
            outputPoint.dataset.type = 'output';
            nodeElement.appendChild(outputPoint);
        }
        
        return nodeElement;
    }
    
    createFieldElement(field, nodeId) {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'node-field';
        
        const label = document.createElement('label');
        label.textContent = field.label;
        fieldDiv.appendChild(label);
        
        let input;
        
        switch (field.type) {
            case 'textarea':
                input = document.createElement('textarea');
                input.rows = field.rows || 2;
                input.value = field.value || '';
                break;
                
            case 'select':
                input = document.createElement('select');
                field.options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option.value;
                    optionElement.textContent = option.label;
                    if (option.value === field.value) {
                        optionElement.selected = true;
                    }
                    input.appendChild(optionElement);
                });
                break;
                
            case 'number':
                input = document.createElement('input');
                input.type = 'number';
                input.value = field.value || 0;
                if (field.min !== undefined) input.min = field.min;
                if (field.max !== undefined) input.max = field.max;
                break;
                
            default:
                input = document.createElement('input');
                input.type = 'text';
                input.value = field.value || '';
        }
        
        input.name = field.name;
        input.addEventListener('input', () => {
            this.updateNodeData(nodeId, field.name, input.value);
            this.triggerExecution();
        });
        
        fieldDiv.appendChild(input);
        return fieldDiv;
    }
    
    initializeNodeHandlers(nodeId) {
        const nodeElement = this.nodes.get(nodeId).element;
        
        // Обработка кликов для выбора нода
        nodeElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectNode(nodeId);
        });
    }
    
    startNodeMove(nodeElement, e) {
        const nodeId = nodeElement.dataset.nodeId;
        const node = this.nodes.get(nodeId);
        
        if (!node) return;
        
        this.draggedNode = node;
        this.selectNode(nodeId);
        
        const rect = nodeElement.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        let animationFrameId = null;
        let lastMouseX = e.clientX;
        let lastMouseY = e.clientY;
        let isDragging = true;
        
        // Функция обновления позиции через requestAnimationFrame
        const updatePosition = () => {
            if (!isDragging || !this.draggedNode) return;
            
            const x = lastMouseX - canvasRect.left - this.dragOffset.x;
            const y = lastMouseY - canvasRect.top - this.dragOffset.y;
            
            // Обновляем позицию нода
            this.updateNodePosition(nodeId, x, y);
            
            // Обновляем соединения
            if (window.connectionManager) {
                window.connectionManager.updateConnections(nodeId);
            }
            
            // Планируем следующий кадр
            animationFrameId = requestAnimationFrame(updatePosition);
        };
        
        const moveHandler = (e) => {
            // Сохраняем позицию мыши
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        };
        
        const upHandler = () => {
            isDragging = false;
            this.draggedNode = null;
            
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            
            // Финальное обновление соединений
            if (window.connectionManager) {
                window.connectionManager.updateConnections(nodeId);
            }
            
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
        };
        
        // Запускаем цикл анимации
        animationFrameId = requestAnimationFrame(updatePosition);
        
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    }
    
    updateNodePosition(nodeId, x, y) {
        const node = this.nodes.get(nodeId);
        if (!node) return;
        
        // Ограничиваем перемещение границами canvas
        const canvasRect = this.canvas.getBoundingClientRect();
        const nodeRect = node.element.getBoundingClientRect();
        
        x = Math.max(0, Math.min(x, canvasRect.width - nodeRect.width));
        y = Math.max(0, Math.min(y, canvasRect.height - nodeRect.height));
        
        node.x = x;
        node.y = y;
        node.element.style.transform = `translate(${x}px, ${y}px)`;
    }
    
    moveNode(nodeId, x, y) {
        this.updateNodePosition(nodeId, x, y);
        
        // Обновляем соединения
        if (window.connectionManager) {
            window.connectionManager.updateConnections(nodeId);
        }
    }
    
    selectNode(nodeId) {
        this.deselectAllNodes();
        
        const node = this.nodes.get(nodeId);
        if (node) {
            node.element.classList.add('selected');
            this.selectedNode = nodeId;
        }
    }
    
    deselectAllNodes() {
        this.nodes.forEach(node => {
            node.element.classList.remove('selected');
        });
        this.selectedNode = null;
    }
    
    removeNode(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node) return;
        
        // Удаляем все соединения с этим нодом
        if (window.connectionManager) {
            window.connectionManager.removeNodeConnections(nodeId);
        }
        
        // Удаляем элемент из DOM
        node.element.remove();
        
        // Удаляем из карты нодов
        this.nodes.delete(nodeId);
        
        // Сбрасываем выбор если удаляли выбранный нод
        if (this.selectedNode === nodeId) {
            this.selectedNode = null;
        }
        
        // Запускаем обновление выполнения
        this.triggerExecution();
    }
    
    updateNodeData(nodeId, fieldName, value) {
        const node = this.nodes.get(nodeId);
        if (node && node.data.fields) {
            const field = node.data.fields.find(f => f.name === fieldName);
            if (field) {
                field.value = value;
            }
        }
    }
    
    getNodeData(nodeId) {
        const node = this.nodes.get(nodeId);
        return node ? node.data : null;
    }
    
    getAllNodes() {
        return Array.from(this.nodes.values());
    }
    
    clearAllNodes() {
        // Удаляем все соединения
        if (window.connectionManager) {
            window.connectionManager.clearAllConnections();
        }
        
        // Удаляем все ноды
        this.nodes.forEach(node => {
            node.element.remove();
        });
        
        this.nodes.clear();
        this.selectedNode = null;
        this.nodeIdCounter = 0;
        
        // Очищаем вывод
        document.getElementById('outputText').value = '';
    }
    
    triggerExecution() {
        // Запускаем выполнение цепочки через небольшую задержку
        // чтобы избежать слишком частых вызовов
        if (this.executionTimeout) {
            clearTimeout(this.executionTimeout);
        }
        
        this.executionTimeout = setTimeout(() => {
            if (window.cipherEngine) {
                window.cipherEngine.executeChain();
            }
        }, 100);
    }
}

// Инициализация после загрузки DOM
let nodeManager;
document.addEventListener('DOMContentLoaded', () => {
    nodeManager = new NodeManager();
    window.nodeManager = nodeManager; // Делаем доступным глобально
});