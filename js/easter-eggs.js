// === Система пасхалок (Easter Eggs) для CipherFlow ===

class EasterEggsSystem {
    constructor() {
        this.isActive = false;
        this.currentEasterEgg = null;
        this.videoWindow = null;
        
        // Определяем типы нодов, которые активируют пасхалки
        this.cuteModeNodes = ['uwu-ifier'];
        
        this.init();
    }
    
    init() {
        console.log('🐣 Инициализация системы пасхалок...');
        
        // Слушаем изменения в цепочке нодов
        document.addEventListener('nodes-updated', (event) => {
            this.checkForEasterEggs();
        });
        
        // Слушаем изменения соединений
        document.addEventListener('connections-updated', (event) => {
            this.checkForEasterEggs();
        });
    
    }
    
    // Проверяем активацию пасхалок
    checkForEasterEggs() {
        try {
            const activeChains = this.getActiveChains();
            let cuteModeShouldBeActive = false;

            for (const chain of activeChains) {
                const cuteNodesCount = chain.filter(node => this.cuteModeNodes.includes(node.type)).length;
                if (cuteNodesCount >= 3) {
                    cuteModeShouldBeActive = true;
                    break; 
                }
            }
            
            if (cuteModeShouldBeActive && !this.isActive) {
                console.log('🌸 Активация пасхалки: Няшный режим!');
                this.activateCuteMode();
            } else if (!cuteModeShouldBeActive && this.isActive) {
                console.log('💔 Деактивация няшного режима');
                this.deactivateCuteMode();
            }

        } catch (error) {
            console.error('❌ Ошибка проверки пасхалок:', error);
        }
    }

    getActiveChains() {
        const chains = [];
        if (!window.nodeManager?.nodes) return chains;

        const allNodes = window.nodeManager.nodes;
        const allConnections = Array.from(window.connectionManager?.connections.values() || []);
        
        const startNodes = [];
        for (const node of allNodes.values()) {
            const isDestination = allConnections.some(conn => conn.to.nodeId === node.id);
            if (!isDestination) {
                startNodes.push(node);
            }
        }
        
        startNodes.forEach(startNode => {
            const chainNodeIds = this.getChainFromNode(startNode.id, window.connectionManager.connections);
            const chainNodes = chainNodeIds
                .map(nodeId => allNodes.get(nodeId))
                .filter(Boolean); // Отфильтровываем возможные null/undefined
            
            if (chainNodes.length > 0) {
                chains.push(chainNodes);
            }
        });
        
        return chains;
    }

    getChainFromNode(startNodeId, connections) {
        // Эта функция остается без изменений, она работает корректно.
        const chain = [startNodeId];
        const visited = new Set([startNodeId]);

        const addConnectedNodes = (currentNodeId) => {
            for (const conn of connections.values()) {
                if (conn.from.nodeId === currentNodeId && !visited.has(conn.to.nodeId)) {
                    visited.add(conn.to.nodeId);
                    chain.push(conn.to.nodeId);
                    addConnectedNodes(conn.to.nodeId);
                }
            }
        };

        addConnectedNodes(startNodeId);
        return chain;
    }
    
    // Проверяем режим няшек
    checkCuteMode(activeNodes) {
        const cuteNodesCount = activeNodes.filter(node => 
            this.cuteModeNodes.includes(node.type)
        ).length;
        
        const t = window.i18n ? window.i18n.t.bind(window.i18n) : (key) => key;
        
        if (cuteNodesCount >= 3 && !this.isActive) {
            console.log('🌸 Активация пасхалки: Няшный режим!');
            this.activateCuteMode();
        } else if (cuteNodesCount < 3 && this.isActive) {
            console.log('💔 Деактивация няшного режима');
            this.deactivateCuteMode();
        }
    }
    
    // Активация няшного режима
    activateCuteMode() {
        this.isActive = true;
        this.currentEasterEgg = 'cute_mode';
        const t = window.i18n ? window.i18n.t.bind(window.i18n) : (key) => key;
        document.body.classList.add('cute-mode');
        this.showCuteModeNotification();
        this.showCuteModeVideo();
        
        document.dispatchEvent(new CustomEvent('easter-egg-activated', {
            detail: { type: 'cute_mode' }
        }));
        
        console.log('🌸✨ Няшный режим активирован! ✨🌸');
    }
    
    // Деактивация няшного режима
    deactivateCuteMode() {
        this.isActive = false;
        this.currentEasterEgg = null;
        document.body.classList.remove('cute-mode');
        this.hideCuteModeVideo();
        
        document.dispatchEvent(new CustomEvent('easter-egg-deactivated', {
            detail: { type: 'cute_mode' }
        }));
        
        console.log('💔 Няшный режим деактивирован');
    }
    
    // Показываем уведомление о няшном режиме
    showCuteModeNotification() {
        const t = window.i18n ? window.i18n.t.bind(window.i18n) : (key) => key;
        
        const notification = document.createElement('div');
        notification.className = 'easter-egg-notification cute-mode-notification';
        notification.innerHTML = `
            <div class="cute-notification-content">
                <div class="cute-emoji">🌸✨💖</div>
                <div class="cute-title">${t('easter_eggs.cute_mode.title', 'Няшный режим активирован!')}</div>
                <div class="cute-subtitle">${t('easter_eggs.cute_mode.subtitle', 'UwU! Добро пожаловать в мир няшек! ✨')}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Убираем уведомление через 4 секунды
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
    
    // Показываем видео няшного режима
    showCuteModeVideo() {
        if (this.videoWindow) {
            this.videoWindow.style.display = 'block';
            return;
        }
        
        const t = window.i18n ? window.i18n.t.bind(window.i18n) : (key) => key;
        
        // Создаем окно с видео
        this.videoWindow = document.createElement('div');
        this.videoWindow.className = 'cute-video-window';
        this.videoWindow.innerHTML = `
            <div class="cute-video-header">
                <div class="cute-video-title">
                    <span class="cute-icon">🌸</span>
                    ${t('easter_eggs.cute_mode.video_title', 'Няшные мелодии')}
                    <span class="cute-icon">🌸</span>
                </div>
                <div class="cute-video-controls">
                    <button class="cute-minimize-btn" title="${t('easter_eggs.cute_mode.minimize', 'Свернуть')}">−</button>
                    <button class="cute-close-btn" title="${t('easter_eggs.cute_mode.close', 'Закрыть')}">×</button>
                </div>
            </div>
            <div class="cute-video-content">
                <iframe 
                    src="https://www.youtube.com/embed/2b1IexhKPz4?autoplay=1&mute=0&loop=1&playlist=2b1IexhKPz4"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
        
        document.body.appendChild(this.videoWindow);
        
        // Делаем окно перетаскиваемым
        this.makeDraggable(this.videoWindow);
        
        // Обработчики кнопок
        const closeBtn = this.videoWindow.querySelector('.cute-close-btn');
        const minimizeBtn = this.videoWindow.querySelector('.cute-minimize-btn');
        
        closeBtn.addEventListener('click', () => {
            this.hideCuteModeVideo();
        });
        
        minimizeBtn.addEventListener('click', () => {
            this.minimizeVideo();
        });
        
        // Анимация появления
        setTimeout(() => this.videoWindow.classList.add('show'), 100);
    }
    
    // Скрываем видео
    hideCuteModeVideo() {
        if (this.videoWindow) {
            this.videoWindow.classList.remove('show');
            setTimeout(() => {
                if (this.videoWindow && this.videoWindow.parentNode) {
                    this.videoWindow.parentNode.removeChild(this.videoWindow);
                    this.videoWindow = null;
                }
            }, 300);
        }
    }
    
    // Сворачиваем/разворачиваем видео
    minimizeVideo() {
        if (this.videoWindow) {
            this.videoWindow.classList.toggle('minimized');
        }
    }
    
    // Делаем элемент перетаскиваемым
    makeDraggable(element) {
        const header = element.querySelector('.cute-video-header');
        let isDragging = false;
        let currentX = 0;
        let currentY = 0;
        let initialX = 0;
        let initialY = 0;
        let xOffset = 0;
        let yOffset = 0;
        
        // Устанавливаем начальную позицию элемента
        element.style.position = 'fixed';
        element.style.left = '0px';
        element.style.top = '0px';
        
        // Получаем начальную позицию из CSS (right: 50px, top: 50px)
        const initialRight = 50;
        const initialTop = 50;
        xOffset = window.innerWidth - element.offsetWidth - initialRight;
        yOffset = initialTop;
        
        // Применяем начальную позицию через transform
        element.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        
        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('button')) return;
            
            isDragging = true;
            
            // Сохраняем начальную позицию курсора
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            
            header.style.cursor = 'grabbing';
            element.style.zIndex = '10001';
            
            // Отключаем transition на время перетаскивания для плавности
            element.style.transition = 'none';
            
            // Предотвращаем выделение текста
            e.preventDefault();
            e.stopPropagation();
        });
        
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            
            // Вычисляем новую позицию
            xOffset = e.clientX - initialX;
            yOffset = e.clientY - initialY;
            
            // Ограничиваем перемещение границами окна
            const rect = element.getBoundingClientRect();
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;
            
            xOffset = Math.max(0, Math.min(xOffset, maxX));
            yOffset = Math.max(0, Math.min(yOffset, maxY));
            
            // Применяем transform для плавного перемещения
            // Используем translate3d для аппаратного ускорения
            element.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
        };
        
        const handleMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                header.style.cursor = 'grab';
                element.style.zIndex = '10000';
                
                // Возвращаем transition обратно
                element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        };
        
        // Используем document для событий мыши, чтобы отслеживать движение за пределами элемента
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Обработка touch-событий для мобильных устройств
        let touchItem = null;
        
        header.addEventListener('touchstart', (e) => {
            if (e.target.closest('button')) return;
            
            touchItem = e.targetTouches[0];
            initialX = touchItem.clientX - xOffset;
            initialY = touchItem.clientY - yOffset;
            isDragging = true;
            
            element.style.transition = 'none';
            header.style.cursor = 'grabbing';
            element.style.zIndex = '10001';
            
            e.preventDefault();
        }, {passive: false});
        
        header.addEventListener('touchmove', (e) => {
            if (!isDragging || !e.targetTouches.length) return;
            
            touchItem = e.targetTouches[0];
            
            xOffset = touchItem.clientX - initialX;
            yOffset = touchItem.clientY - initialY;
            
            // Ограничиваем перемещение границами окна
            const rect = element.getBoundingClientRect();
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;
            
            xOffset = Math.max(0, Math.min(xOffset, maxX));
            yOffset = Math.max(0, Math.min(yOffset, maxY));
            
            element.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
            
            e.preventDefault();
        }, {passive: false});
        
        header.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                touchItem = null;
                header.style.cursor = 'grab';
                element.style.zIndex = '10000';
                element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        });
        
        // Устанавливаем курсор
        header.style.cursor = 'grab';
        
        // Предотвращаем конфликты с другими обработчиками
        header.addEventListener('dragstart', (e) => e.preventDefault());
        
        // Очистка обработчиков при удалении элемента
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node === element) {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                        observer.disconnect();
                    }
                });
            });
        });
        
        observer.observe(element.parentNode || document.body, { childList: true });
    }
    
    // Метод для получения статуса системы пасхалок
    getStatus() {
        return {
            isActive: this.isActive,
            currentEasterEgg: this.currentEasterEgg,
            hasVideoWindow: !!this.videoWindow
        };
    }
    
    // Метод для принудительной активации (для отладки)
    forceActivateCuteMode() {
        console.log('🧪 Принудительная активация няшного режима (debug)');
        this.activateCuteMode();
    }
    
    // Метод для принудительной деактивации (для отладки)
    forceDeactivateCuteMode() {
        console.log('🧪 Принудительная деактивация няшного режима (debug)');
        this.deactivateCuteMode();
    }
}

// Инициализация системы пасхалок при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.easterEggs = new EasterEggsSystem();
    console.log('🐣 Система пасхалок инициализирована');
});

// Экспортируем для использования в других модулях
window.EasterEggsSystem = EasterEggsSystem;

// Добавляем глобальные функции для быстрого тестирования
window.activateCuteMode = () => {
    if (window.easterEggs) {
        window.easterEggs.forceActivateCuteMode();
        console.log('🌸 Няшный режим принудительно активирован!');
    } else {
        console.error('❌ Система пасхалок не найдена');
    }
};

window.deactivateCuteMode = () => {
    if (window.easterEggs) {
        window.easterEggs.forceDeactivateCuteMode();
        console.log('💔 Няшный режим деактивирован');
    } else {
        console.error('❌ Система пасхалок не найдена');
    }
};

window.checkEasterEggStatus = () => {
    if (window.easterEggs) {
        const status = window.easterEggs.getStatus();
        console.log('📊 Статус системы пасхалок:', status);
        return status;
    } else {
        console.error('❌ Система пасхалок не найдена');
        return null;
    }
};