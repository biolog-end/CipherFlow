// File: js/nodes.js
// === Система управления нодами ===

class NodeManager {
    constructor() {
        this.nodes = new Map();
        this.nodeIdCounter = 0;
        // this.selectedNode = null; // УДАЛЕНО: Управляется через selectionManager
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
            // Отключаем стандартный drag & drop для избежания дублирования
            item.draggable = false;
            
            // Используем только кастомный механизм перетаскивания
            item.addEventListener('mousedown', (e) => {
                if (e.button === 0) { // Левая кнопка мыши
                    e.preventDefault(); // Предотвращаем выделение текста
                    this.startNodeDrag(item, e);
                }
            });
        });
    }
    
    startNodeDrag(item, e) {
        const clone = item.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.pointerEvents = 'none';
        clone.style.opacity = '0.8';
        clone.style.zIndex = '9999';
        clone.style.transform = 'rotate(2deg) scale(1.05)';
        clone.style.transition = 'none';
        clone.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
        
        // Получаем размеры элемента
        const itemRect = item.getBoundingClientRect();
        clone.style.width = itemRect.width + 'px';
        clone.style.height = itemRect.height + 'px';
        
        // Оффсет для центрирования элемента под курсором
        const offsetX = itemRect.width / 2;
        const offsetY = itemRect.height / 2;
        
        document.body.appendChild(clone);
        
        // Резервный таймер для удаления клона на случай зависания
        const failsafeTimer = setTimeout(() => {
            if (clone && clone.parentNode) {
                clone.parentNode.removeChild(clone);
            }
        }, 10000); // 10 секунд максимум
        
        let currentX = e.clientX;
        let currentY = e.clientY;
        
        // Функция плавного обновления позиции
        const updateClonePosition = () => {
            const targetX = currentX - offsetX;
            const targetY = currentY - offsetY;
            
            clone.style.left = targetX + 'px';
            clone.style.top = targetY + 'px';
        };
        
        const moveHandler = (e) => {
            currentX = e.clientX;
            currentY = e.clientY;
            requestAnimationFrame(updateClonePosition);
        };
        
        const finishDrag = (e) => {
            // Очищаем резервный таймер
            clearTimeout(failsafeTimer);
            
            // Сразу удаляем обработчики событий
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', finishDrag);
            
            // Проверим, попали ли мы на canvas
            const canvasRect = this.canvas.getBoundingClientRect();
            const droppedOnCanvas = e.clientX >= canvasRect.left && e.clientX <= canvasRect.right &&
                                   e.clientY >= canvasRect.top && e.clientY <= canvasRect.bottom;
            
            if (droppedOnCanvas) {
                const x = e.clientX - canvasRect.left;
                const y = e.clientY - canvasRect.top;
                
                // Анимация успешного создания нода
                clone.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                clone.style.opacity = '0';
                clone.style.transform = 'rotate(0deg) scale(1.2)';
                clone.style.filter = 'blur(2px)';
                
                this.createNode(item.dataset.type, x, y);
            } else {
                // Анимация возврата при неуспешном дропе
                clone.style.transition = 'all 0.2s ease-out';
                clone.style.opacity = '0';
                clone.style.transform = 'rotate(0deg) scale(0.8)';
            }
            
            // Гарантированное удаление клона через короткое время
            setTimeout(() => {
                if (clone && clone.parentNode) {
                    clone.parentNode.removeChild(clone);
                }
            }, 300);
        };
        
        // Начальная позиция
        updateClonePosition();
        
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', finishDrag);
    }
    
    bindEvents() {
        // === ИЗМЕНЕНИЕ: Обработка кликов по canvas для снятия выделения ===
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.target === this.canvas || e.target.classList.contains('canvas-background')) {
                if (window.selectionManager) {
                    window.selectionManager.clearSelection();
                }
            }
        });
        
        // === ИЗМЕНЕНИЕ: Унифицированная обработка выделения и перетаскивания нодов ===
        this.nodesLayer.addEventListener('mousedown', (e) => {
            const nodeElement = e.target.closest('.canvas-node');
            if (!nodeElement) return;

            const nodeId = nodeElement.dataset.nodeId;

            // 1. Логика выделения по клику
            if (e.button === 0) { // Только для ЛКМ
                const isSelected = window.selectionManager.selectedNodes.has(nodeId);

                if (e.ctrlKey || e.metaKey) {
                    // С Ctrl/Cmd переключаем состояние выделения
                    if (isSelected) {
                        window.selectionManager.removeFromSelection(nodeId);
                    } else {
                        window.selectionManager.addToSelection(nodeId);
                    }
                } else {
                    // Без Ctrl, если кликнутый нод не входит в группу выделенных,
                    // то снимаем выделение со всех и выделяем только его.
                    if (!isSelected) {
                        window.selectionManager.clearSelection();
                        window.selectionManager.addToSelection(nodeId);
                    }
                }
            }

            // 2. Логика начала перетаскивания
            if (e.button === 0 && !e.target.closest('.node-remove') && !e.target.closest('.connection-point')) {
                this.startNodeMove(nodeElement, e);
            }
        });
    }
    
    createNode(type, x, y, isWorldCoords = false) {
        const nodeId = `node_${this.nodeIdCounter++}`;
        const nodeData = this.getNodeTemplate(type);

        let worldX, worldY;

        if (isWorldCoords) {
            // Координаты уже в "мировом" формате, используем их напрямую.
            worldX = x;
            worldY = y;
        } else {
            // Координаты в "экранном" формате, нужно преобразовать.
            // Преобразуем экранные координаты относительно canvas в мировые координаты
            if (window.canvasManager) {
                const worldCoords = window.canvasManager.screenToWorld(x, y);
                worldX = worldCoords.x;
                worldY = worldCoords.y;
            } else {
                // Fallback на случай, если canvasManager недоступен
                worldX = x;
                worldY = y;
            }
        }

        // Сохраняем нод перед созданием элемента
        this.nodes.set(nodeId, {
            id: nodeId,
            type: type,
            element: null,
            data: nodeData,
            x: worldX,
            y: worldY,
            inputs: {},
            outputs: {}
        });

        const nodeElement = this.createElement(nodeId, nodeData, worldX, worldY);
        nodeElement.dataset.nodeType = type;
        this.nodesLayer.appendChild(nodeElement);

        // Обновляем элемент в сохраненном ноде
        const node = this.nodes.get(nodeId);
        node.element = nodeElement;

        // Добавляем анимацию появления
        nodeElement.classList.add('fade-in');

        // Инициализируем обработчики для нового нода
        this.initializeNodeHandlers(nodeId);

        // === ИЗМЕНЕНИЕ: Автоматически выбираем созданный нод через selectionManager ===
        if (window.selectionManager) {
            window.selectionManager.clearSelection();
            window.selectionManager.addToSelection(nodeId);
        }

        // Воспроизводим звук создания нода
        if (window.settingsSystem?.settings.soundEffects) {
            window.settingsSystem.playSound('node_create');
        }

        // Добавляем в историю
        if (window.historyManager) {
            window.historyManager.addAction({
                type: 'create_node',
                description: `Создан нод: ${nodeData.title}`,
                data: {
                    nodeId: nodeId,
                    type: type,
                    x: worldX,
                    y: worldY,
                    data: JSON.parse(JSON.stringify(nodeData))
                }
            });
        }

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
                    },
                    {
                        name: 'supportYo',
                        type: 'checkbox',
                        label: 'Поддержка Ё (··−··)',
                        value: false,
                        tooltip: 'Включить отдельный код для буквы Ё. По умолчанию Ё = Е'
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
                        name: 'language', 
                        type: 'select',
                        label: 'Язык',
                        value: 'ru',
                        options: [
                            { value: 'ru', label: 'Русский' },
                            { value: 'en', label: 'English' }
                        ]
                    },
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
            'binary': {
                title: 'Бинарный код',
                icon: 'fas fa-microchip',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: 'Режим',
                        value: 'encode',
                        options: [
                            { value: 'encode', label: 'Текст → Бинарный' },
                            { value: 'decode', label: 'Бинарный → Текст' }
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
                    },
                    {
                        name: 'supportYo',
                        type: 'checkbox',
                        label: 'Поддержка Ё (мяумяумрряумяумяу)',
                        value: false,
                        tooltip: 'Включить отдельный код для буквы Ё. По умолчанию Ё = Е'
                    }
                ],
                hasInput: true,
                hasOutput: true
            },
            'planet-enchanter': {
                title: 'Зачаровыватель планет',
                icon: 'fas fa-globe',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: 'Режим',
                        value: 'encode',
                        options: [
                            { value: 'encode', label: 'Текст → Координаты' },
                            { value: 'decode', label: 'Координаты → Текст' }
                        ]
                    },
                    {
                        name: 'language',
                        type: 'select',
                        label: 'Язык',
                        value: 'ru',
                        options: [
                            { value: 'ru', label: 'Русский' },
                            { value: 'en', label: 'English' },
                            { value: 'mix', label: 'Смешанный' }
                        ]
                    }
                ],
                hasInput: true,
                hasOutput: true
            },
            'monitor': {
                title: 'Монитор',
                icon: 'fas fa-desktop',
                fields: [],
                hasInput: true,
                hasOutput: true,
                isMonitor: true
            },
            'comment': {
                title: 'Комментарий',
                icon: 'fas fa-comment-alt',
                fields: [
                    {
                        name: 'commentText',
                        type: 'textarea',
                        label: '', 
                        value: '',
                        rows: 4
                    }
                ],
                hasInput: false, 
                hasOutput: false 
            }
        };
        
        return templates[type] || templates['input'];
    }
    
    createElement(nodeId, nodeData, x, y) {
        const nodeElement = document.createElement('div');
        const nodeType = this.nodes.get(nodeId)?.type || 'default';
        nodeElement.className = 'canvas-node';
        
        // Добавляем класс для нодов с множественными входами
        if (nodeData.multipleInputs && nodeData.multipleInputs.length > 0) {
            nodeElement.className += ' has-multiple-inputs';
        }
        
        nodeElement.dataset.nodeId = nodeId;
        nodeElement.dataset.nodeType = nodeType;
        nodeElement.style.transform = `translate(${x}px, ${y}px)`;
        
        // Создаем заголовок
        const header = document.createElement('div');
        header.className = 'node-header';
        header.innerHTML = `
            <i class="${nodeData.icon}"></i>
            <span class="node-title">${nodeData.title}</span>
            <button class="node-help-button" onclick="if(window.showNodeHelp) window.showNodeHelp('${nodeType}')" title="Показать справку">
                <i class="fas fa-question"></i>
            </button>
            <button class="node-remove" onclick="nodeManager.removeNode('${nodeId}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Создаем содержимое
        const content = document.createElement('div');
        content.className = 'node-content';
        
        // Если это монитор, добавляем дисплей
        if (nodeData.isMonitor) {
            const display = document.createElement('div');
            display.className = 'monitor-display';
            display.dataset.nodeId = nodeId;
            display.textContent = 'Ожидание данных...';
            content.appendChild(display);
        }
        
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
                // Опускаем входы ниже, чтобы не накладывались на заголовок
                inputPoint.style.top = `${80 + index * 35}px`;
                if (input.color) {
                    inputPoint.style.backgroundColor = input.color;
                }
                
                // Добавляем label для входа
                const label = document.createElement('span');
                label.className = 'input-label';
                label.textContent = input.label;
                label.style.position = 'absolute';
                label.style.left = '25px';
                // Также опускаем labels
                label.style.top = `${75 + index * 35}px`;
                label.style.fontSize = '0.75rem';
                label.style.color = 'var(--text-muted)';
                label.style.userSelect = 'none';
                label.style.whiteSpace = 'nowrap';
                
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
        
        // Создаем уникальный ID для поля
        const fieldId = `${nodeId}_${field.name}`;
        
        const label = document.createElement('label');
        label.textContent = field.label;
        label.setAttribute('for', fieldId);
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
                
            case 'checkbox':
                input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = field.value || false;
                break;
                
            default:
                input = document.createElement('input');
                input.type = 'text';
                input.value = field.value || '';
        }
        
        input.name = field.name;
        input.id = fieldId;
        
        // Обработчик изменений для всех типов полей
        const updateValue = () => {
            const value = field.type === 'checkbox' ? input.checked : input.value;
            this.updateNodeData(nodeId, field.name, value);
            this.triggerExecution();
        };
        
        input.addEventListener('input', updateValue);
        if (field.type === 'checkbox') {
            input.addEventListener('change', updateValue);
        }
        
        fieldDiv.appendChild(input);
        return fieldDiv;
    }
    
    initializeNodeHandlers(nodeId) {
        // Логика выделения теперь находится в bindEvents,
        // чтобы избежать дублирования обработчиков.
    }
    
    startNodeMove(nodeElement, e) {
        const clickedNodeId = nodeElement.dataset.nodeId;
        if (!window.selectionManager.selectedNodes.has(clickedNodeId)) {
            return;
        }

        const nodesToMove = new Map();
        const initialPositions = new Map();

        window.selectionManager.selectedNodes.forEach(id => {
            const node = this.nodes.get(id);
            if (node) {
                nodesToMove.set(id, node);
                initialPositions.set(id, { x: node.x, y: node.y });
            }
        });

        const startMouseScreenX = e.clientX;
        const startMouseScreenY = e.clientY;
        
        let lastMouseX = e.clientX;
        let lastMouseY = e.clientY;
        let isDragging = true;
        let animationFrameId = null;

        const updatePositions = () => {
            if (!isDragging) return;

            const deltaScreenX = lastMouseX - startMouseScreenX;
            const deltaScreenY = lastMouseY - startMouseScreenY;
            const scale = window.canvasManager ? window.canvasManager.getScale() : 1;
            const deltaWorldX = deltaScreenX / scale;
            const deltaWorldY = deltaScreenY / scale;

            nodesToMove.forEach((node, id) => {
                const initialPos = initialPositions.get(id);
                const newX = initialPos.x + deltaWorldX;
                const newY = initialPos.y + deltaWorldY;
                this.updateNodePosition(id, newX, newY);
            });

            if (window.connectionManager) {
                nodesToMove.forEach((_, id) => {
                    window.connectionManager.updateConnections(id);
                });
            }
            
            animationFrameId = requestAnimationFrame(updatePositions);
        };

        const moveHandler = (e) => {
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        };

        const upHandler = () => {
            isDragging = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            // === НАЧАЛО ИЗМЕНЕНИЯ: Логика сохранения истории для группы ===
            if (window.historyManager) {
                const movedNodesData = [];
                let hasMoved = false;

                nodesToMove.forEach((node, id) => {
                    const initialPos = initialPositions.get(id);
                    // Проверяем, изменилась ли позиция
                    if (node.x !== initialPos.x || node.y !== initialPos.y) {
                        hasMoved = true;
                    }
                    movedNodesData.push({
                        nodeId: id,
                        oldX: initialPos.x,
                        oldY: initialPos.y,
                        newX: node.x,
                        newY: node.y,
                    });
                });

                // Добавляем действие в историю, только если было реальное перемещение
                if (hasMoved) {
                    window.historyManager.addAction({
                        type: 'move_node_group',
                        description: `Перемещено нодов: ${movedNodesData.length}`,
                        data: {
                            nodes: movedNodesData
                        }
                    });
                }
            }
            // === КОНЕЦ ИЗМЕНЕНИЯ ===
            
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
        };

        animationFrameId = requestAnimationFrame(updatePositions);
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    }
    
    updateNodePosition(nodeId, x, y) {
        const node = this.nodes.get(nodeId);
        if (!node) return;
        
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
    
    // УДАЛЕНО: selectNode и deselectAllNodes. Их функциональность теперь в SelectionManager.
    
    removeNode(nodeId, skipHistory = false) {
        const node = this.nodes.get(nodeId);
        if (!node) return;
        
        // Сохраняем информацию для истории
        if (!skipHistory && window.historyManager) {
            const connections = [];
            if (window.connectionManager) {
                const nodeConns = window.connectionManager.getNodeConnections(nodeId);
                // Сохраняем все соединения нода
                [...nodeConns.inputs, ...nodeConns.outputs].forEach(conn => {
                    const connection = window.connectionManager.connections.get(conn.connectionId);
                    if (connection) {
                        connections.push({
                            id: connection.id,
                            from: connection.from,
                            to: connection.to
                        });
                    }
                });
            }
            
            window.historyManager.addAction({
                type: 'delete_node',
                description: `Удален нод: ${node.data.title}`,
                data: {
                    nodeId: nodeId,
                    type: node.type,
                    x: node.x,
                    y: node.y,
                    data: JSON.parse(JSON.stringify(node.data)),
                    connections: connections
                }
            });
        }
        
        // Удаляем все соединения с этим нодом
        if (window.connectionManager) {
            window.connectionManager.removeNodeConnections(nodeId);
        }
        
        // Удаляем элемент из DOM
        node.element.remove();
        
        // Удаляем из карты нодов
        this.nodes.delete(nodeId);
        
        // === ИЗМЕНЕНИЕ: Сообщаем менеджеру выделения, что нод удален ===
        if (window.selectionManager) {
            window.selectionManager.removeFromSelection(nodeId);
        }
        
        // Запускаем обновление выполнения
        this.triggerExecution();
    }
    
    restoreNode(nodeData) {
        const nodeId = nodeData.nodeId || `node_${this.nodeIdCounter++}`;
        
        // Восстанавливаем нод в карте
        this.nodes.set(nodeId, {
            id: nodeId,
            type: nodeData.type,
            element: null,
            data: nodeData.data,
            x: nodeData.x,
            y: nodeData.y,
            inputs: {},
            outputs: {}
        });
        
        // Создаем элемент
        const nodeElement = this.createElement(nodeId, nodeData.data, nodeData.x, nodeData.y);
        nodeElement.dataset.nodeType = nodeData.type;
        this.nodesLayer.appendChild(nodeElement);
        
        // Обновляем элемент в сохраненном ноде
        const node = this.nodes.get(nodeId);
        node.element = nodeElement;
        
        // Инициализируем обработчики
        this.initializeNodeHandlers(nodeId);
        
        return nodeId;
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
        
        // Очищаем выделение
        if (window.selectionManager) {
            window.selectionManager.clearSelection();
        }
        
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