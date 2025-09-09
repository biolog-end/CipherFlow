class EasterEggsSystem {
    constructor() {
        this.isActive = false;
        this.currentEasterEgg = null;
        this.videoWindow = null; 
        
        this.easterEggs = new Map([
            ['cute_mode', {
                activation: (chains) => {
                    for (const chain of chains) {
                        const cuteNodesCount = chain.filter(node => node.type === 'uwu-ifier').length;
                        if (cuteNodesCount >= 3) {
                            return true; 
                        }
                    }
                    return false;
                },
                // Все данные для уведомления и эффектов
                payload: {
                    title: 'easter_eggs.cute_mode.title', 
                    subtitle: 'easter_eggs.cute_mode.subtitle',
                    image: 'src/easter_eggs/images/cute.gif', 
                    sound: 'src/easter_eggs/sounds/default_notification.mp3', 
                    className: 'cute-mode-notification', 
                },
                // Функции, которые вызываются при активации/деактивации
                onActivate: () => {
                    document.body.classList.add('cute-mode');
                    this.showCuteModeVideo(); 
                    console.log('🌸✨ Няшный режим активирован! ✨🌸');
                },
                onDeactivate: () => {
                    document.body.classList.remove('cute-mode');
                    this.hideCuteModeVideo();
                    console.log('💔 Няшный режим деактивирован');
                }
            }],
        ]);
        
        this.init();
    }
    
    init() {
        console.log('🐣 Инициализация системы пасхалок...');
        document.addEventListener('nodes-updated', () => this.checkForEasterEggs());
        document.addEventListener('connections-updated', () => this.checkForEasterEggs());
    }
    
    checkForEasterEggs() {
        try {
            const activeChains = this.getActiveChains();
            let eggToActivate = null;

            for (const [id, egg] of this.easterEggs.entries()) {
                if (egg.activation(activeChains)) {
                    eggToActivate = id;
                    break;
                }
            }
            
            if (eggToActivate && this.currentEasterEgg !== eggToActivate) {
                this.deactivateCurrentEasterEgg(); 
                this.activateEasterEgg(eggToActivate);
            } 
            else if (!eggToActivate && this.isActive) {
                this.deactivateCurrentEasterEgg();
            }

        } catch (error) {
            console.error('❌ Ошибка проверки пасхалок:', error);
        }
    }
    
    activateEasterEgg(eggId) {
        const egg = this.easterEggs.get(eggId);
        if (!egg) return;

        this.isActive = true;
        this.currentEasterEgg = eggId;
        
        this.showNotification(egg.payload); 
        
        if (egg.onActivate) {
            egg.onActivate();
        }
        
        document.dispatchEvent(new CustomEvent('easter-egg-activated', {
            detail: { type: eggId }
        }));
    }

    deactivateCurrentEasterEgg() {
        if (!this.currentEasterEgg) return;

        const egg = this.easterEggs.get(this.currentEasterEgg);
        
        if (egg && egg.onDeactivate) {
            egg.onDeactivate();
        }
        
        document.dispatchEvent(new CustomEvent('easter-egg-deactivated', {
            detail: { type: this.currentEasterEgg }
        }));
        
        this.isActive = false;
        this.currentEasterEgg = null;
    }

    showNotification({ title, subtitle, image, sound, className }) {
        const t = window.i18n ? window.i18n.t.bind(window.i18n) : (key) => key.split('.').pop();
        
        const notification = document.createElement('div');
        notification.className = `easter-egg-notification ${className || ''}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-image-container">
                    <img src="${image}" alt="Easter Egg" class="notification-image"/>
                </div>
                <div class="notification-text">
                    <div class="notification-title">${t(title)}</div>
                    <div class="notification-subtitle">${t(subtitle)}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        if (sound) {
            const audio = new Audio(sound);
            audio.play().catch(e => console.error("Ошибка воспроизведения звука:", e));
        }
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500); 
        }, 5000);
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
                .filter(Boolean);
            
            if (chainNodes.length > 0) {
                chains.push(chainNodes);
            }
        });
        
        return chains;
    }

    getChainFromNode(startNodeId, connections) {
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
    
    showCuteModeVideo() {
        if (this.videoWindow) {
            this.videoWindow.style.display = 'block';
            return;
        }
        
        const t = window.i18n ? window.i18n.t.bind(window.i18n) : (key) => key;
        
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
        
        this.makeDraggable(this.videoWindow);
        
        const closeBtn = this.videoWindow.querySelector('.cute-close-btn');
        const minimizeBtn = this.videoWindow.querySelector('.cute-minimize-btn');
        
        closeBtn.addEventListener('click', () => {
            this.hideCuteModeVideo();
        });
        
        minimizeBtn.addEventListener('click', () => {
            this.minimizeVideo();
        });
        
        setTimeout(() => this.videoWindow.classList.add('show'), 100);
    }
    
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
    
    minimizeVideo() {
        if (this.videoWindow) {
            this.videoWindow.classList.toggle('minimized');
        }
    }
    
    makeDraggable(element) {
        const header = element.querySelector('.cute-video-header');
        let isDragging = false;
        let initialX = 0;
        let initialY = 0;
        let xOffset = 0;
        let yOffset = 0;
        
        element.style.position = 'fixed';
        element.style.left = '0px';
        element.style.top = '0px';
        
        const initialRight = 50;
        const initialTop = 50;
        xOffset = window.innerWidth - element.offsetWidth - initialRight;
        yOffset = initialTop;
        
        element.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        
        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('button')) return;
            
            isDragging = true;
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            
            header.style.cursor = 'grabbing';
            element.style.zIndex = '10001';
            
            element.style.transition = 'none';
            
            e.preventDefault();
            e.stopPropagation();
        });
        
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            
            xOffset = e.clientX - initialX;
            yOffset = e.clientY - initialY;
            
            const rect = element.getBoundingClientRect();
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;
            
            xOffset = Math.max(0, Math.min(xOffset, maxX));
            yOffset = Math.max(0, Math.min(yOffset, maxY));

            element.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
        };
        
        const handleMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                header.style.cursor = 'grab';
                element.style.zIndex = '10000';
                
                element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
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
        
        header.style.cursor = 'grab';
        
        header.addEventListener('dragstart', (e) => e.preventDefault());
        
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
    
}

document.addEventListener('DOMContentLoaded', () => {
    window.easterEggs = new EasterEggsSystem();
    console.log('🐣 Система пасхалок инициализирована');
});

window.EasterEggsSystem = EasterEggsSystem;

