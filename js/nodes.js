// File: js/nodes.js
// === Система управления нодами ===

class NodeManager {
    constructor() {
        this.nodes = new Map();
        this.nodeIdCounter = 0;
        this.draggedNode = null;
        this.dragOffset = { x: 0, y: 0 };
        
        this.nodesLayer = document.getElementById('nodesLayer');
        this.canvas = document.getElementById('canvas');
        
        this.initializeDragAndDrop();
        this.bindEvents();
        
        // Подписываемся на изменения языка
        if (window.i18n) {
            window.i18n.onLanguageChange(() => {
                this.updateNodeTexts();
            });
        }
    }
    
    initializeDragAndDrop() {
        const nodeItems = document.querySelectorAll('.node-item');
        
        nodeItems.forEach(item => {
            item.draggable = false;
            
            
            item.addEventListener('mousedown', (e) => {
                if (e.button === 0) { 
                    e.preventDefault(); 
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
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.target === this.canvas || e.target.classList.contains('canvas-background')) {
                if (window.selectionManager) {
                    window.selectionManager.clearSelection();
                }
            }
        });
        
        this.nodesLayer.addEventListener('mousedown', (e) => {
            const nodeElement = e.target.closest('.canvas-node');
            if (!nodeElement) return;

            const nodeId = nodeElement.dataset.nodeId;

            
            if (e.button === 0) { 
                const isSelected = window.selectionManager.selectedNodes.has(nodeId);

                if (e.ctrlKey || e.metaKey) {
                    
                    if (isSelected) {
                        window.selectionManager.removeFromSelection(nodeId);
                    } else {
                        window.selectionManager.addToSelection(nodeId);
                    }
                } else {

                    if (!isSelected) {
                        window.selectionManager.clearSelection();
                        window.selectionManager.addToSelection(nodeId);
                    }
                }
            }

            if (e.button === 0 && !e.target.closest('.node-remove') && !e.target.closest('.connection-point')) {
                this.startNodeMove(nodeElement, e);
            }
        });
    }
    
    createNode(type, x, y, isWorldCoords = false) {
        const t = window.i18n ? window.i18n.t.bind(window.i18n) : (key) => key;
        const nodeId = `node_${this.nodeIdCounter++}`;
        const nodeData = this.getNodeTemplate(type);

        let worldX, worldY;

        if (isWorldCoords) {
            worldX = x;
            worldY = y;
        } else {
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

        nodeElement.classList.add('fade-in');

        this.initializeNodeHandlers(nodeId);

        if (window.selectionManager) {
            window.selectionManager.clearSelection();
            window.selectionManager.addToSelection(nodeId);
        }

        if (window.settingsSystem?.settings.soundEffects) {
            window.settingsSystem.playSound('node_create');
        }

        if (window.historyManager) {
            window.historyManager.addAction({
                type: 'create_node',
                description: t('history.node_created', { title: nodeData.title }),
                data: {
                    nodeId: nodeId,
                    type: type,
                    x: worldX,
                    y: worldY,
                    data: JSON.parse(JSON.stringify(nodeData))
                }
            });
        }

        // Уведомляем систему пасхалок о добавлении нода
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('nodes-updated', {
                detail: { action: 'node-added', nodeId, nodeType: type }
            }));
        }, 100);

        return nodeId;
    }
    
    getNodeTemplate(type) {
        const t = window.i18n ? window.i18n.t.bind(window.i18n) : (key) => key;
        
        const templates = {
            'input': {
                title: t('node.text_input'),
                icon: 'fas fa-sign-in-alt',
                fields: [],
                hasInput: false,
                hasOutput: true,
                isTitleCustomized: false
            },
            'output': {
                title: t('node.text_output'),
                icon: 'fas fa-sign-out-alt',
                fields: [],
                hasInput: true,
                hasOutput: false,
                isTitleCustomized: false
            },
            'caesar': {
                title: t('node.caesar_cipher'),
                icon: 'fas fa-exchange-alt',
                fields: [
                    {
                        name: 'shift',
                        type: 'number',
                        label: t('param.shift'),
                        value: 3,
                        min: 1,
                        max: 32
                    }
                ],
                hasInput: true,
                hasOutput: true,
                isTitleCustomized: false
            },
            'morse': {
                title: t('node.morse_code'),
                icon: 'fas fa-broadcast-tower',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: t('param.operation'),
                        value: 'encode',
                        options: [
                            { value: 'encode', label: t('option.encode') },
                            { value: 'decode', label: t('option.decode') }
                        ]
                    },
                    {
                        name: 'supportYo',
                        type: 'checkbox',
                        label: t('param.yo_support'),
                        value: false,
                        tooltip: t('param.yo_tooltip')
                    }
                ],
                hasInput: true,
                hasOutput: true,
                isTitleCustomized: false
            },
            'numbers-to-words': {
                title: t('node.numbers_to_words'),
                icon: 'fas fa-hashtag',
                fields: [
                    {
                        name: 'language',
                        type: 'select',
                        label: t('param.language'),
                        value: 'ru',
                        options: [
                            { value: 'ru', label: t('option.russian') },
                            { value: 'en', label: t('option.english') },
                            { value: 'mix', label: t('option.mix') }
                        ]
                    },
                    {
                        name: 'mode',
                        type: 'select',
                        label: t('param.direction'),
                        value: 'to_words',
                        options: [
                            { value: 'to_words', label: t('option.to_words') },
                            { value: 'to_numbers', label: t('option.to_numbers') }
                        ]
                    }
                ],
                hasInput: true,
                hasOutput: true,
                isTitleCustomized: false
            },
            'math': {
                title: t('node.math'),
                icon: 'fas fa-calculator',
                fields: [
                    {
                        name: 'operation',
                        type: 'select',
                        label: t('param.operation'),
                        value: 'add',
                        options: [
                            { value: 'add', label: t('option.add') },
                            { value: 'subtract', label: t('option.subtract') },
                            { value: 'multiply', label: t('option.multiply') },
                            { value: 'divide', label: t('option.divide') }
                        ]
                    },
                    {
                        name: 'value',
                        type: 'number',
                        label: t('param.value'),
                        value: 1
                    }
                ],
                hasInput: true,
                hasOutput: true,
                isTitleCustomized: false
            },
            'reverse': {
                title: t('node.reverse_text'),
                icon: 'fas fa-undo',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: t('param.mode'),
                        value: 'full',
                        options: [
                            { value: 'full', label: t('option.full') },
                            { value: 'words', label: t('option.words') },
                            { value: 'boustrophedon', label: t('option.boustrophedon') }
                        ]
                    }
                ],
                hasInput: true,
                hasOutput: true,
                isTitleCustomized: false
            },
            'case-transform': {
                title: t('node.case_transform'),
                icon: 'fas fa-text-height',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: t('param.mode'),
                        value: 'upper',
                        options: [
                            { value: 'upper', label: t('option.upper') },
                            { value: 'lower', label: t('option.lower') },
                            { value: 'title', label: t('option.title') },
                            { value: 'toggle', label: t('option.toggle') }
                        ]
                    }
                ],
                hasInput: true,
                hasOutput: true,
                isTitleCustomized: false
            },
            'secret-word': {
                title: t('node.secret_word'),
                icon: 'fas fa-key',
                fields: [
                    {
                        name: 'keyword',
                        type: 'text',
                        label: t('param.keyword'),
                        value: t('param.default_keyword')
                    }
                ],
                hasInput: false,
                hasOutput: true,
                isTitleCustomized: false
            },
            'vigenere': {
                title: t('node.vigenere_cipher'),
                icon: 'fas fa-shield-alt',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: t('param.cipher_type'),
                        value: 'vigenere',
                        options: [
                            { value: 'vigenere', label: t('option.vigenere') },
                            { value: 'beaufort', label: t('option.beaufort') }
                        ]
                    }
                ],
                hasInput: false,
                hasOutput: true,
                multipleInputs: [
                    { name: 'text', label: t('option.text_input'), color: '#3b82f6' },
                    { name: 'key', label: t('option.key_input'), color: '#f59e0b' }
                ],
                isTitleCustomized: false
            },
            'a1z26': {
                title: t('node.a1z26_cipher'),
                icon: 'fas fa-sort-numeric-up',
                fields: [
                    {
                        name: 'language', 
                        type: 'select',
                        label: t('param.language'),
                        value: 'ru',
                        options: [
                            { value: 'ru', label: t('option.russian') },
                            { value: 'en', label: t('option.english') }
                        ]
                    },
                    {
                        name: 'mode',
                        type: 'select',
                        label: t('param.mode'),
                        value: 'encode',
                        options: [
                            { value: 'encode', label: t('option.encode') },
                            { value: 'decode', label: t('option.decode') }
                        ]
                    }
                ],
                hasInput: true,
                hasOutput: true,
                isTitleCustomized: false
            },
            'binary': {
                title: t('node.binary_code'),
                icon: 'fas fa-microchip',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: t('param.mode'),
                        value: 'encode',
                        options: [
                            { value: 'encode', label: t('option.encode') },
                            { value: 'decode', label: t('option.decode') }
                        ]
                    }
                ],
                hasInput: true,
                hasOutput: true,
                isTitleCustomized: false
            },
            'braille-cat': {
                title: t('node.morse_cat'),
                icon: 'fas fa-cat',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: t('param.mode'),
                        value: 'encode',
                        options: [
                            { value: 'encode', label: t('option.text_to_cat') },
                            { value: 'decode', label: t('option.cat_to_text') }
                        ]
                    },
                    {
                        name: 'supportYo',
                        type: 'checkbox',
                        label: t('option.yo_support_cat'),
                        value: false,
                        tooltip: t('param.yo_tooltip')
                    }
                ],
                hasInput: true,
                hasOutput: true,
                isTitleCustomized: false
            },
            'planet-enchanter': {
                title: t('node.planet_enchanter'),
                icon: 'fas fa-globe',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: t('param.mode'),
                        value: 'encode',
                        options: [
                            { value: 'encode', label: t('option.text_to_coords') },
                            { value: 'decode', label: t('option.coords_to_text') }
                        ]
                    },
                    {
                        name: 'language',
                        type: 'select',
                        label: t('param.language'),
                        value: 'ru',
                        options: [
                            { value: 'ru', label: t('option.russian') },
                            { value: 'en', label: t('option.english') },
                            { value: 'mix', label: t('option.mix') }
                        ]
                    }
                ],
                hasInput: true,
                hasOutput: true,
                isTitleCustomized: false
            },
            'monitor': {
                title: t('node.monitor'),
                icon: 'fas fa-desktop',
                fields: [],
                hasInput: true,
                hasOutput: true,
                isMonitor: true
            },
            'comment': {
                title: t('node.comment'),
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
                hasOutput: false,
                isTitleCustomized: false
            },
            'multi-replacer': {
                title: t('node.multi_replace'),
                icon: 'fas fa-exchange-alt',
                fields: [
                    {
                        name: 'rules',
                        type: 'multi-rules',
                        label: t('param.rules'),
                        value: []
                    },
                    {
                        name: 'caseSensitive',
                        type: 'checkbox',
                        label: t('param.case_sensitive'),
                        value: false
                    },
                    {
                        name: 'wholeWords',
                        type: 'checkbox',
                        label: t('param.whole_words'),
                        value: false
                    }
                ],
                hasInput: true,
                hasOutput: true,
                isTitleCustomized: false
            },
            'text-router': {
                title: t('node.text_router'),
                icon: 'fas fa-sitemap',
                fields: [
                    {
                        name: 'condition',
                        type: 'select',
                        label: t('param.condition'),
                        value: 'contains_numbers',
                        options: [
                            { value: 'contains_numbers', label: t('option.contains_numbers') },
                            { value: 'no_numbers', label: t('option.no_numbers') },
                            { value: 'contains_latin', label: t('option.contains_latin') },
                            { value: 'no_latin', label: t('option.no_latin') },
                            { value: 'contains_cyrillic', label: t('option.contains_cyrillic') },
                            { value: 'no_cyrillic', label: t('option.no_cyrillic') },
                            { value: 'contains_text', label: t('option.contains_text') },
                            { value: 'regex_match', label: t('option.regex_match') }
                        ]
                    },
                    {
                        name: 'searchText',
                        type: 'text',
                        label: t('param.search'),
                        value: '',
                        showWhen: ['contains_text', 'regex_match']
                    }
                ],
                hasInput: true,
                hasOutput: false,
                multipleOutputs: [
                    { name: 'true', label: t('output.if_true'), color: '#22c55e' },
                    { name: 'false', label: t('output.if_false'), color: '#ef4444' }
                ],
                isTitleCustomized: false
            },
            'stream-merger': {
                title: t('node.stream_merger'),
                icon: 'fas fa-link',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: t('param.merge_mode'),
                        value: 'alternating_chars',
                        options: [
                            { value: 'alternating_chars', label: t('option.alt_chars') },
                            { value: 'alternating_words', label: t('option.alt_words') },
                            { value: 'alternating_lines', label: t('option.alt_lines') }
                        ]
                    }
                ],
                hasInput: false,
                hasOutput: true,
                multipleInputs: [
                    { name: 'streamA', label: t('input.stream_a'), color: '#3b82f6' },
                    { name: 'streamB', label: t('input.stream_b'), color: '#f59e0b' }
                ],
                isTitleCustomized: false
            },
            'stream-splitter': {
                title: t('node.stream_splitter'),
                icon: 'fas fa-cut',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: t('param.split_mode'),
                        value: 'alternating_chars',
                        options: [
                            { value: 'alternating_chars', label: t('option.split_chars') },
                            { value: 'alternating_words', label: t('option.split_words') },
                            { value: 'alternating_lines', label: t('option.split_lines') }
                        ]
                    }
                ],
                hasInput: true,
                hasOutput: false,
                multipleOutputs: [
                    { name: 'streamA', label: t('input.stream_a'), color: '#3b82f6' },
                    { name: 'streamB', label: t('input.stream_b'), color: '#f59e0b' }
                ],
                isTitleCustomized: false
            },
            'atbash': {
                title: t('node.atbash_cipher'),
                icon: 'fas fa-retweet',
                fields: [],
                hasInput: true,
                hasOutput: true,
                isTitleCustomized: false
            },
            'base64': {
                title: t('node.base64'),
                icon: 'fas fa-file-export',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: t('param.mode'),
                        value: 'encode',
                        options: [
                            { value: 'encode', label: t('option.encode') },
                            { value: 'decode', label: t('option.decode') }
                        ]
                    }
                ],
                hasInput: true,
                hasOutput: true,
                isTitleCustomized: false
            },
            'gawr-gura': {
                title: t('node.shark_cipher'),
                icon: 'fas fa-fish',
                fields: [],
                hasInput: true,
                hasOutput: true,
                isTitleCustomized: false
            },
            'uwu-ifier': {
                title: t('node.uwu_cipher'),
                icon: 'fas fa-grin-stars',
                fields: [],
                hasInput: true,
                hasOutput: true,
                isTitleCustomized: false
            },
            'complex-substitution': {
                title: t('node.complex_substitution'),
                icon: 'fas fa-mask', 
                fields: [
                    {
                        name: 'language',
                        type: 'select',
                        label: t('param.base_alphabet'),
                        value: 'ru',
                        options: [
                            { value: 'ru', label: t('option.ru_alphabet_33') },
                            { value: 'en', label: t('option.en_alphabet_26') }
                        ]
                    },
                    {
                        name: 'decrypt',
                        type: 'checkbox',
                        label: t('param.decryption'),
                        value: false
                    }
                ],
                hasInput: false, 
                hasOutput: true,
                multipleInputs: [
                    { name: 'text', label: t('option.text_input'), color: '#3b82f6' },
                    { name: 'key', label: t('option.key_input'), color: '#f59e0b' }
                ],
                isTitleCustomized: false
            },
            'simple-substitution': {
                title: t('node.simple_substitution'),
                icon: 'fas fa-random', 
                fields: [
                    {
                        name: 'decrypt',
                        type: 'checkbox',
                        label: t('param.decryption'),
                        value: false
                    }
                ],
                hasInput: false, 
                hasOutput: true,
                multipleInputs: [
                    { name: 'text', label: t('option.text_input'), color: '#3b82f6' },
                    { name: 'key', label: t('option.key_input'), color: '#f59e0b' }
                ],
                isTitleCustomized: false
            },
            'rle-compression': {
                title: t('node.rle_compression'),
                icon: 'fas fa-compress-arrows-alt',
                fields: [
                    {
                        name: 'decrypt',
                        type: 'checkbox',
                        label: t('param.decompression'),
                        value: false
                    }
                ],
                hasInput: true,
                hasOutput: true,
                isTitleCustomized: false
            },
            'route-transposition': {
                title: t('node.route_transposition'), 
                icon: 'fas fa-route',
                fields: [
                    {
                        name: 'decrypt',
                        type: 'checkbox',
                        label: t('param.decryption'),
                        value: false
                    }
                ],
                hasInput: false, 
                hasOutput: true,
                multipleInputs: [
                    { name: 'text', label: t('option.text_input'), color: '#3b82f6' },
                    { name: 'key', label: t('option.key_input'), color: '#f59e0b' }
                ],
                isTitleCustomized: false
            },
            'navi-terminal': {
                title: t('node.navi_terminal'),
                icon: 'fas fa-terminal',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: t('param.mode'),
                        value: 'encrypt',
                        options: [
                            { value: 'encrypt', label: t('option.encrypt') },
                            { value: 'decrypt', label: t('option.decrypt') }
                        ]
                    },
                    {
                        name: 'detailLevel',
                        type: 'select',
                        label: t('param.detail_level'),
                        value: 'standard',
                        options: [
                            { value: 'brief', label: t('option.detail_brief') },
                            { value: 'standard', label: t('option.detail_standard') },
                            { value: 'full', label: t('option.detail_full') }
                        ]
                    }
                ],
                hasInput: true,
                hasOutput: true,
                isTitleCustomized: false
            },
            'knights-cipher': {
                title: t('node.knights_cipher'),
                icon: 'fas fa-chess-knight',
                fields: [
                    {
                        name: 'mode',
                        type: 'select',
                        label: t('param.mode'),
                        value: 'encrypt',
                        options: [
                            { value: 'encrypt', label: t('option.encrypt') },
                            { value: 'decrypt', label: t('option.decrypt') }
                        ]
                    }
                ],
                hasInput: false,
                hasOutput: true,
                multipleInputs: [
                    { name: 'secret', label: t('option.secret_text'), color: '#ef4444' },
                    { name: 'container', label: t('option.container_text'), color: '#3b82f6' }
                ],
                isTitleCustomized: false
            }
        };
        
        return templates[type] || { ...templates['input'], isTitleCustomized: false };
    }

    
    createElement(nodeId, nodeData, x, y) {
        const t = window.i18n.t.bind(window.i18n);
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
            <span class="node-title" contenteditable="true">${nodeData.title}</span> 
            <button class="node-help-button" onclick="if(window.showNodeHelp) window.showNodeHelp('${nodeType}')" title="${t('node.show_help_tooltip')}">
                <i class="fas fa-question"></i>
            </button>
            <button class="node-remove" onclick="nodeManager.removeNode('${nodeId}')">
                <i class="fas fa-times"></i>
            </button>
        `;

        const titleSpan = header.querySelector('.node-title');
        titleSpan.addEventListener('blur', (e) => {
            const newTitle = e.target.textContent.trim();
            const node = this.nodes.get(nodeId);
            if (node && newTitle) {
                if (node.data.title = newTitle != newTitle){
                    node.data.title = newTitle;
                    node.data.isTitleCustomized = true; 
                }
            } else if (node) {
                e.target.textContent = node.data.title;
            }
        });
        
        // Создаем содержимое
        const content = document.createElement('div');
        content.className = 'node-content';
        
        // Если это монитор, добавляем дисплей
        if (nodeData.isMonitor) {
            const displayWrapper = document.createElement('div');
            displayWrapper.style.position = 'relative'; // Обертка для позиционирования кнопки

            const display = document.createElement('div');
            display.className = 'monitor-display';
            display.dataset.nodeId = nodeId;
            display.textContent = t('monitor.waiting_for_data');
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'monitor-copy-btn';
            copyBtn.title = t('monitor.copy_content');
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.onclick = () => this.copyMonitorContent(nodeId); // Используем this
            
            displayWrapper.appendChild(display);
            displayWrapper.appendChild(copyBtn);
            content.appendChild(displayWrapper);

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
                inputPoint.setAttribute('data-input-label', input.label); // Store label for tooltip
                // Опускаем входы ниже, чтобы не накладывались на заголовок
                inputPoint.style.top = `${80 + index * 35}px`;
                if (input.color) {
                    inputPoint.style.backgroundColor = input.color;
                }
                
                nodeElement.appendChild(inputPoint);
            });
        }
        
        if (nodeData.hasOutput) {
            const outputPoint = document.createElement('div');
            outputPoint.className = 'connection-point output';
            outputPoint.dataset.nodeId = nodeId;
            outputPoint.dataset.type = 'output';
            nodeElement.appendChild(outputPoint);
        }
        
        // Добавляем множественные выходы (для Text Router)
        if (nodeData.multipleOutputs && Array.isArray(nodeData.multipleOutputs)) {
            nodeData.multipleOutputs.forEach((output, index) => {
                const outputPoint = document.createElement('div');
                outputPoint.className = 'connection-point output multiple';
                outputPoint.dataset.nodeId = nodeId;
                outputPoint.dataset.type = 'output';
                outputPoint.dataset.outputName = output.name;
                outputPoint.setAttribute('data-output-label', output.label); // Store label for tooltip
                // Размещаем выходы справа
                outputPoint.style.top = `${80 + index * 35}px`;
                if (output.color) {
                    outputPoint.style.backgroundColor = output.color;
                }
                
                nodeElement.appendChild(outputPoint);
            });
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
                
            case 'textarea':
                input = document.createElement('textarea');
                input.value = field.value || '';
                if (field.rows) input.rows = field.rows;
                break;
                
            case 'multi-rules':
                input = this.createMultiRulesField(field, nodeId);
                break;
                
            default:
                input = document.createElement('input');
                input.type = 'text';
                input.value = field.value || '';
        }
        
        // Обработчики для специальных типов полей
        if (field.type === 'multi-rules') {
            // Для multi-rules обработчики уже настроены в createMultiRulesField
            fieldDiv.appendChild(input);
            return fieldDiv;
        }
        
        input.name = field.name;
        input.id = fieldId;
        
        // Обработчик изменений для всех типов полей
        const updateValue = () => {
            const value = field.type === 'checkbox' ? input.checked : input.value;
            this.updateNodeData(nodeId, field.name, value);
            this.triggerExecution();
            
            // Обновляем видимость условных полей
            this.updateConditionalFields(nodeId);
        };
        
        input.addEventListener('input', updateValue);
        if (field.type === 'checkbox') {
            input.addEventListener('change', updateValue);
        }
        
        fieldDiv.appendChild(input);
        
        // Настраиваем условную видимость
        if (field.showWhen) {
            fieldDiv.dataset.showWhen = JSON.stringify(field.showWhen);
            fieldDiv.style.display = 'none'; // Изначально скрыто
        }
        
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
            const t = window.i18n.t.bind(window.i18n);
            isDragging = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
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
                        description: t('history.group_moved', { count: movedNodesData.length }),
                        data: {
                            nodes: movedNodesData
                        }
                    });
                }
            }
            
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
        
    removeNode(nodeId, skipHistory = false) {
        const t = window.i18n.t.bind(window.i18n);
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
                description: t('history.node_deleted', { title: node.data.title }),
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
        
        node.element.remove();
        
        this.nodes.delete(nodeId);
        
        if (window.selectionManager) {
            window.selectionManager.removeFromSelection(nodeId);
        }
        
        // Уведомляем систему пасхалок об удалении нода
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('nodes-updated', {
                detail: { action: 'node-removed', nodeId, nodeType: node.type }
            }));
        }, 100);
        
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
    
    createMultiRulesField(field, nodeId) {
        const t = window.i18n.t.bind(window.i18n); 

        const container = document.createElement('div');
        container.className = 'multi-rules-container';
        
        // Заголовок с кнопкой добавления
        const header = document.createElement('div');
        header.className = 'multi-rules-header';
        header.innerHTML = `
            <span>${t('param.rules')}:</span>
            <button type="button" class="add-rule-btn" onclick="nodeManager.addReplaceRule('${nodeId}')">
                <i class="fas fa-plus"></i> ${t('button.add')}
            </button>
        `;
        container.appendChild(header);
        
        // Контейнер для правил
        const rulesContainer = document.createElement('div');
        rulesContainer.className = 'rules-container';
        rulesContainer.dataset.nodeId = nodeId;
        container.appendChild(rulesContainer);
        
        // Загружаем существующие правила
        const rules = field.value || [];
        rules.forEach((rule, index) => {
            this.createRuleElement(nodeId, index, rule);
        });
        
        return container;
    }
    
    addReplaceRule(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node || !node.data.fields) return;
        
        // Находим поле с правилами
        const rulesField = node.data.fields.find(f => f.type === 'multi-rules');
        if (!rulesField) return;
        
        if (!Array.isArray(rulesField.value)) {
            rulesField.value = [];
        }
        
        const newRule = { find: '', replace: '' };
        rulesField.value.push(newRule);
        
        const ruleIndex = rulesField.value.length - 1;
        this.createRuleElement(nodeId, ruleIndex, newRule);
        
        this.triggerExecution();
    }
    
    createRuleElement(nodeId, ruleIndex, rule) {
        const t = window.i18n.t.bind(window.i18n); 
        const rulesContainer = document.querySelector(`.rules-container[data-node-id="${nodeId}"]`);
        if (!rulesContainer) return;
        
        const ruleDiv = document.createElement('div');
        ruleDiv.className = 'rule-item';
        ruleDiv.dataset.ruleIndex = ruleIndex;
        
        ruleDiv.innerHTML = `
            <div class="rule-inputs">
                <input type="text" placeholder="${t('placeholder.find')}" value="${rule.find || ''}" 
                    onchange="nodeManager.updateRule('${nodeId}', ${ruleIndex}, 'find', this.value)">
                <input type="text" placeholder="${t('placeholder.replace')}" value="${rule.replace || ''}"
                    onchange="nodeManager.updateRule('${nodeId}', ${ruleIndex}, 'replace', this.value)">
                <button type="button" class="remove-rule-btn" 
                        onclick="nodeManager.removeRule('${nodeId}', ${ruleIndex})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        rulesContainer.appendChild(ruleDiv);
    }
    
    updateRule(nodeId, ruleIndex, field, value) {
        const node = this.nodes.get(nodeId);
        if (!node) return;
        
        const rulesField = node.data.fields.find(f => f.type === 'multi-rules');
        if (!rulesField || !Array.isArray(rulesField.value)) return;
        
        if (rulesField.value[ruleIndex]) {
            rulesField.value[ruleIndex][field] = value;
            this.triggerExecution();
        }
    }
    
    removeRule(nodeId, ruleIndex) {
        const node = this.nodes.get(nodeId);
        if (!node) return;
        
        const rulesField = node.data.fields.find(f => f.type === 'multi-rules');
        if (!rulesField || !Array.isArray(rulesField.value)) return;
        
        rulesField.value.splice(ruleIndex, 1);
        
        // Перестраиваем UI
        const rulesContainer = document.querySelector(`.rules-container[data-node-id="${nodeId}"]`);
        if (rulesContainer) {
            rulesContainer.innerHTML = '';
            rulesField.value.forEach((rule, index) => {
                this.createRuleElement(nodeId, index, rule);
            });
        }
        
        this.triggerExecution();
    }
    
    updateConditionalFields(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node || !node.element) return;
        
        const nodeElement = node.element;
        
        // Находим все поля с условной видимостью
        const conditionalFields = nodeElement.querySelectorAll('[data-show-when]');
        
        conditionalFields.forEach(fieldDiv => {
            try {
                const showWhen = JSON.parse(fieldDiv.dataset.showWhen);
                const conditionField = nodeElement.querySelector('select[name="condition"]');
                
                if (conditionField && showWhen.includes(conditionField.value)) {
                    fieldDiv.style.display = 'block';
                } else {
                    fieldDiv.style.display = 'none';
                }
            } catch (e) {
                console.error('Ошибка обработки условной видимости:', e);
            }
        });
    }
    
    async copyMonitorContent(nodeId) {
        const t = window.i18n.t.bind(window.i18n);
        const node = this.nodes.get(nodeId);
        if (!node || !node.element) return;

        const display = node.element.querySelector('.monitor-display');
        if (!display) return;

        const textToCopy = display.innerText;

        try {
            await navigator.clipboard.writeText(textToCopy);
            if (window.fileManager) {
                window.fileManager.showNotification(t('notification.monitor_copied'), 'success');
            }
        } catch (err) {
            console.error('Ошибка копирования:', err);
            if (window.fileManager) {
                window.fileManager.showNotification(t('error.copy_failed'), 'error');
            }
        }
    }
    
    /**
     * Обновляет тексты всех нодов при смене языка
     */
    updateNodeTexts() {
        if (!window.i18n) return;
        const t = window.i18n.t.bind(window.i18n);

        this.nodes.forEach(node => {
            const newTemplate = this.getNodeTemplate(node.type);
            const titleElement = node.element.querySelector('.node-title');

            if (titleElement && !node.data.isTitleCustomized) {
                // ИСПРАВЛЕНИЕ: Берем уже переведенный заголовок напрямую из шаблона
                const newTitle = newTemplate.title;
                node.data.title = newTitle;
                titleElement.textContent = newTitle;
            }

            newTemplate.fields.forEach((templateField, index) => {
                const currentField = node.data.fields[index];
                if (!currentField || currentField.name !== templateField.name) return;

                currentField.label = templateField.label;
                const labelElement = node.element.querySelector(`label[for="${node.id}_${currentField.name}"]`);
                if (labelElement) {
                    labelElement.textContent = templateField.label;
                }

                if (templateField.tooltip) {
                     const inputElement = node.element.querySelector(`[name="${currentField.name}"]`);
                     if (inputElement) {
                         inputElement.title = templateField.tooltip;
                     }
                }
                
                if (currentField.type === 'select' && Array.isArray(templateField.options)) {
                    currentField.options = JSON.parse(JSON.stringify(templateField.options));
                    const selectElement = node.element.querySelector(`select[name="${currentField.name}"]`);
                    if (selectElement) {
                        const selectedValue = selectElement.value;
                        selectElement.innerHTML = '';
                        templateField.options.forEach(option => {
                            const optionElement = document.createElement('option');
                            optionElement.value = option.value;
                            optionElement.textContent = option.label;
                            selectElement.appendChild(optionElement);
                        });
                        selectElement.value = selectedValue;
                    }
                }
            });

            const updateMultiPoints = (pointType, templateDataKey, pointNameAttr) => {
                if (node.data[templateDataKey] && newTemplate[templateDataKey]) {
                    newTemplate[templateDataKey].forEach((templatePoint, index) => {
                        const currentPointData = node.data[templateDataKey][index];
                        if (currentPointData && currentPointData.name === templatePoint.name) {
                            currentPointData.label = templatePoint.label;
                            const pointElement = node.element.querySelector(`.connection-point.${pointType}[${pointNameAttr}="${currentPointData.name}"]`);
                            if (pointElement) {
                                const labelAttr = pointType === 'input' ? 'data-input-label' : 'data-output-label';
                                pointElement.setAttribute(labelAttr, templatePoint.label);
                            }
                        }
                    });
                }
            };
            updateMultiPoints('input', 'multipleInputs', 'data-input-name');
            updateMultiPoints('output', 'multipleOutputs', 'data-output-name');

            if (node.type === 'monitor') {
                const display = node.element.querySelector('.monitor-display');
                if (display) {
                    const oldLang = window.i18n.getCurrentLanguage() === 'ru' ? 'en' : 'ru';
                    const oldWaiting = i18n.translations[oldLang]['monitor.waiting_for_data'];
                    const oldEmpty = i18n.translations[oldLang]['monitor.empty_input'];
                    const oldEncryptDir = i18n.translations[oldLang]['monitor.direction_encrypt'];
                    const oldDecryptDir = i18n.translations[oldLang]['monitor.direction_decrypt'];

                    const smallTag = display.querySelector('small');
                    if (smallTag) {
                        if (smallTag.textContent === oldEncryptDir) {
                            smallTag.textContent = t('monitor.direction_encrypt');
                        } else if (smallTag.textContent === oldDecryptDir) {
                            smallTag.textContent = t('monitor.direction_decrypt');
                        }
                        
                        const textNode = display.childNodes[display.childNodes.length - 1];
                        if (textNode && textNode.nodeType === Node.TEXT_NODE && textNode.textContent.trim() === oldEmpty) {
                            textNode.textContent = ' ' + t('monitor.empty_input');
                        }
                    } else if (display.textContent.trim() === oldWaiting) {
                        display.textContent = t('monitor.waiting_for_data');
                    }

                    const copyBtn = node.element.querySelector('.monitor-copy-btn');
                    if (copyBtn) {
                        copyBtn.title = t('monitor.copy_content');
                    }
                }
            }

            if (node.type === 'multi-replacer') {
                const rulesHeader = node.element.querySelector('.multi-rules-header span');
                if (rulesHeader) {
                    rulesHeader.textContent = t('param.rules');
                }
                const addBtn = node.element.querySelector('.add-rule-btn');
                if (addBtn) {
                    addBtn.innerHTML = `<i class="fas fa-plus"></i> ${t('button.add')}`;
                }
                const ruleItems = node.element.querySelectorAll('.rule-item');
                ruleItems.forEach(item => {
                    const findInput = item.querySelector('input:first-of-type');
                    const replaceInput = item.querySelector('input:nth-of-type(2)');
                    if (findInput) findInput.placeholder = t('placeholder.find');
                    if (replaceInput) replaceInput.placeholder = t('placeholder.replace');
                });
            }
        });
    }
}

// Инициализация после загрузки DOM
let nodeManager;
document.addEventListener('DOMContentLoaded', () => {
    nodeManager = new NodeManager();
    window.nodeManager = nodeManager; // Делаем доступным глобально
});