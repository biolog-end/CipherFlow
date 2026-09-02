class EasterEggsSystem {
    constructor() {
        this.isActive = false;
        this.currentEasterEgg = null;
        this.videoWindow = null;

        this.unlockedAchievements = new Set();
        this.achievementsData = new Map();

        this.canvas = document.getElementById('canvas');

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
                payload: {
                    title: 'easter_eggs.cute_mode.title', 
                    subtitle: 'easter_eggs.cute_mode.subtitle',
                    image: 'src/easter_eggs/images/cute.gif', 
                    sound: 'src/easter_eggs/sounds/default_notification.mp3', 
                    className: 'cute-mode-notification', 
                },
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
            ['wired_presence', {
                activation: (chains) => {
                    // Упрощаем условия активации для более легкого срабатывания
                    const hasLongChain = chains.some(chain => chain.length >= 5);
                    if (!hasLongChain) return false;
                    
                    const specialNodes = ['navi-terminal', 'knights-cipher', 'protocol-7', 'schumann-resonance', 'complex-substitution', 'binary', 'base64'];
                    const hasSpecialNode = chains.some(chain => 
                        chain.some(node => specialNodes.includes(node.type))
                    );
                    if (!hasSpecialNode) return false;
                    
                    const hasLainKeyword = this.checkForLainKeyword();
                    
                    return hasLainKeyword;
                },
                payload: {
                    title: 'easter_eggs.wired_presence.title',
                    subtitle: 'easter_eggs.wired_presence.subtitle',
                    image: 'src/easter_eggs/images/lain.gif', 
                    sound: 'src/easter_eggs/sounds/lain.mp3', 
                    className: 'wired-presence-notification',
                },
                onActivate: () => {
                    console.log('🌐🔺 ПРИСУТСТВИЕ В СЕТИ АКТИВИРОВАНО 🔺🌐');
                    console.log('└─ Инициализация протокола Layer 07...');
                    console.log('└─ Подключение к Wired...');
                    console.log('└─ Present Day, Present Time... Ahahahaha!');
                    this.activateWiredPresence();
                },
                onDeactivate: () => {
                    console.log('📡 Отключение от Сети...');
                    console.log('└─ Возврат в реальный мир');
                    this.deactivateWiredPresence();
                }
            }],
        ]);
        
        this.lainGhostNode = null;
        this.wiredAudio = null;
        
        this.init();
    }
    
    init() {
        console.log('🐣 Инициализация системы пасхалок...');

        this.loadUnlockedAchievements();
        this.easterEggs.forEach((egg, id) => {
            this.achievementsData.set(id, egg.payload);
        });
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
    
    loadUnlockedAchievements() {
        try {
            const saved = localStorage.getItem('unlockedAchievements');
            if (saved) {
                this.unlockedAchievements = new Set(JSON.parse(saved));
                console.log('🏆 Загружено ачивок:', this.unlockedAchievements.size);
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки ачивок из localStorage:', error);
            this.unlockedAchievements = new Set();
        }
    }

    /**
     * Сохраняет разблокированные ачивки в localStorage.
     */
    saveUnlockedAchievements() {
        try {
            localStorage.setItem('unlockedAchievements', JSON.stringify([...this.unlockedAchievements]));
        } catch (error) {
            console.error('❌ Ошибка сохранения ачивок в localStorage:', error);
        }
    }

    /**
     * Сбрасывает все полученные ачивки.
     */
    resetAchievements() {
        this.unlockedAchievements.clear();
        localStorage.removeItem('unlockedAchievements');
        console.log('🗑️ Все ачивки сброшены.');
    }
    
    activateEasterEgg(eggId) {
        const egg = this.easterEggs.get(eggId);
        if (!egg) return;

        const isFirstTime = !this.unlockedAchievements.has(eggId);

        if (isFirstTime) {
            console.log(`🎉 Новая ачивка: ${eggId}!`);
            this.unlockedAchievements.add(eggId);
            this.saveUnlockedAchievements();
    
            this.showNotification(egg.payload); 
        }

        this.isActive = true;
        this.currentEasterEgg = eggId;
        
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
    
    static CUTE_VIDEO_ID = '2b1IexhKPz4';

    /** Loads the YouTube IFrame API once; resolves with the YT namespace or rejects when it cannot load. */
    loadYouTubeApi() {
        if (this.youTubeApi) return this.youTubeApi;
        this.youTubeApi = new Promise((resolve, reject) => {
            if (window.YT && window.YT.Player) {
                resolve(window.YT);
                return;
            }
            const previous = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (typeof previous === 'function') previous();
                resolve(window.YT);
            };
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            script.onerror = () => reject(new Error('YouTube API failed to load'));
            document.head.appendChild(script);
            setTimeout(() => reject(new Error('YouTube API timed out')), 10000);
        });
        return this.youTubeApi;
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
                    <span class="cute-icon">♪</span>
                    <span class="cute-video-title-text"></span>
                </div>
                <div class="cute-video-controls">
                    <button class="cute-minimize-btn" type="button">−</button>
                    <button class="cute-close-btn" type="button">×</button>
                </div>
            </div>
            <div class="cute-video-content">
                <div class="cute-video-player"></div>
            </div>
        `;
        this.videoWindow.querySelector('.cute-video-title-text').textContent = t('easter_eggs.cute_mode.video_title');
        this.videoWindow.querySelector('.cute-minimize-btn').title = t('easter_eggs.cute_mode.minimize');
        this.videoWindow.querySelector('.cute-close-btn').title = t('easter_eggs.cute_mode.close');

        document.body.appendChild(this.videoWindow);
        this.mountCuteVideoPlayer(this.videoWindow);

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
    
    /**
     * Embeds the video through the IFrame API so playback errors can be caught. From file:// YouTube
     * always answers with error 153 (no Referer to check) — then a card with a direct link takes over.
     */
    mountCuteVideoPlayer(windowEl) {
        const mount = windowEl.querySelector('.cute-video-player');
        const fallback = () => {
            if (this.cuteVideoPlayer) {
                try { this.cuteVideoPlayer.destroy(); } catch { /* nothing left to destroy */ }
                this.cuteVideoPlayer = null;
            }
            if (!windowEl.isConnected) return;
            const t = window.i18n ? window.i18n.t.bind(window.i18n) : (key) => key;
            const card = document.createElement('div');
            card.className = 'cute-video-fallback';
            const text = document.createElement('p');
            text.textContent = t('easter_eggs.cute_mode.video_unavailable');
            const link = document.createElement('a');
            link.href = `https://www.youtube.com/watch?v=${EasterEggsSystem.CUTE_VIDEO_ID}`;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = t('easter_eggs.cute_mode.video_open') + ' ↗';
            card.append(text, link);
            windowEl.querySelector('.cute-video-content').replaceChildren(card);
        };
        this.loadYouTubeApi().then((YT) => {
            if (!windowEl.isConnected) return;
            this.cuteVideoPlayer = new YT.Player(mount, {
                videoId: EasterEggsSystem.CUTE_VIDEO_ID,
                playerVars: { autoplay: 1, loop: 1, playlist: EasterEggsSystem.CUTE_VIDEO_ID, rel: 0 },
                events: { onError: fallback },
            });
        }).catch(fallback);
    }

    hideCuteModeVideo() {
        if (this.videoWindow) {
            this.videoWindow.classList.remove('show');
            const windowEl = this.videoWindow;
            this.videoWindow = null;
            setTimeout(() => {
                windowEl.remove();
                if (this.cuteVideoPlayer) {
                    try { this.cuteVideoPlayer.destroy(); } catch { /* player may already be gone */ }
                    this.cuteVideoPlayer = null;
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
    
    // Методы для пасхалки "Присутствие в Сети"
    checkForLainKeyword() {
        const lainKeywords = [
            'lain', 'wired', 'layer', 'protocol', 'navi', 'present day', 
            'present time', 'identity', 'ego', 'reality', 'connected',
            'лейн', 'сеть', 'протокол', 'реальность', 'связан', 'эго'
        ];
        
        // Проверяем основное поле ввода
        const mainInput = document.getElementById('inputText');
        if (mainInput) {
            const inputText = mainInput.value.toLowerCase();
            if (lainKeywords.some(keyword => inputText.includes(keyword))) {
                return true;
            }
        }
        
        // Проверяем все textarea в нодах
        const textareas = document.querySelectorAll('.canvas-node textarea');
        for (const textarea of textareas) {
            const textareaText = textarea.value.toLowerCase();
            if (lainKeywords.some(keyword => textareaText.includes(keyword))) {
                return true;
            }
        }
        
        // Проверяем все input в нодах
        const inputs = document.querySelectorAll('.canvas-node input[type="text"]');
        for (const input of inputs) {
            const inputText = input.value.toLowerCase();
            if (lainKeywords.some(keyword => inputText.includes(keyword))) {
                return true;
            }
        }
        
        return false;
    }
    
    /** Ghost nodes clone themselves; this keeps the haunting from turning into a DOM flood. */
    static MAX_GHOSTS = 7;

    activateWiredPresence() {
        this.lainGhostNodes = new Map();
        this.wiredTimers = new Set();

        this.showWiredBoot(() => {
            if (this.currentEasterEgg !== 'wired_presence') return;
            this.createLainGhostNode();
            this.createMatrixRain();
            this.startGlitchEffects();
            this.createDataStreamOverlay();
            this.injectWiredTerminal();
            this.startBrandGlitch();
            this.screenShake();
            this.startSystemMessages();
        });
        this.startWiredAudio();

        document.body.classList.add('wired-active');
        document.body.classList.add('lain-theme');

        console.log('└─ Все системы онлайн. Добро пожаловать в Wired.');
    }

    /** setTimeout that is cancelled on deactivation. */
    wiredTimeout(fn, ms) {
        const id = setTimeout(() => {
            this.wiredTimers?.delete(id);
            fn();
        }, ms);
        this.wiredTimers?.add(id);
        return id;
    }

    /** Full-screen NAVI boot sequence typed line by line, then hands over to the effects. */
    showWiredBoot(onDone) {
        const overlay = document.createElement('div');
        overlay.className = 'wired-boot wired-effect';
        const screen = document.createElement('pre');
        overlay.appendChild(screen);
        document.body.appendChild(overlay);
        this.wiredBootElement = overlay;

        const lines = [
            'COPLAND OS ENTERPRISE',
            'NAVI boot sequence . . .',
            '',
            '> loading protocol layer 07 .......... ok',
            '> psyche processor ................... ok',
            '> ego boundary .............. undefined',
            '> resolving identity: lain ........ ????',
            '> connecting to the Wired ............ ok',
            '',
            'Present day. Present time.',
        ];
        let index = 0;
        const typeLine = () => {
            if (!overlay.isConnected) return;
            if (index < lines.length) {
                screen.textContent += (index ? '\n' : '') + lines[index++];
                this.wiredTimeout(typeLine, lines[index - 1] === '' ? 120 : 170 + Math.random() * 120);
                return;
            }
            this.wiredTimeout(() => {
                overlay.classList.add('is-fading');
                this.wiredTimeout(() => {
                    overlay.remove();
                    if (this.wiredBootElement === overlay) this.wiredBootElement = null;
                    onDone();
                }, 500);
            }, 900);
        };
        typeLine();
    }

    /** Every few seconds the brand name briefly corrupts. */
    startBrandGlitch() {
        const brand = document.querySelector('.brand span');
        if (!brand) return;
        this.brandOriginal = brand.textContent;
        const variants = ['C1PHERFL0W', 'CIPH3RFLOW', 'C¡PHERFLOW', 'CIPHER_LAIN', 'W1RED_FLOW', 'ĆIPHĚRFLÖW'];
        const tick = () => {
            if (this.currentEasterEgg !== 'wired_presence') return;
            brand.textContent = variants[Math.floor(Math.random() * variants.length)];
            this.wiredTimeout(() => { brand.textContent = this.brandOriginal; }, 120 + Math.random() * 200);
            this.wiredTimeout(tick, 2000 + Math.random() * 4000);
        };
        this.wiredTimeout(tick, 1500);
    }

    stopBrandGlitch() {
        const brand = document.querySelector('.brand span');
        if (brand && this.brandOriginal) brand.textContent = this.brandOriginal;
        this.brandOriginal = null;
    }

    deactivateWiredPresence() {
        if (this.wiredTimers) {
            for (const id of this.wiredTimers) clearTimeout(id);
            this.wiredTimers.clear();
        }
        if (this.wiredBootElement) {
            this.wiredBootElement.remove();
            this.wiredBootElement = null;
        }
        this.stopBrandGlitch();

        // Очищаем призрачные ноды
        if (this.lainGhostNodes) {
            for (const ghost of this.lainGhostNodes.values()) {
                clearTimeout(ghost.animationTimeout);
                ghost.element.remove();
            }
            this.lainGhostNodes.clear();
        }
        
        // Останавливаем аудио
        clearInterval(this.wiredFadeIn);
        this.wiredFadeIn = null;
        if (this.wiredAudio) {
            this.wiredAudio.pause();
            this.wiredAudio.remove();
            this.wiredAudio = null;
        }
        
        // Очищаем все дополнительные эффекты
        this.clearMatrixRain();
        this.stopGlitchEffects();
        this.clearDataStreamOverlay();
        this.removeWiredTerminal();
        this.stopSystemMessages();
        
        // Убираем все классы темы
        document.body.classList.remove('wired-active');
        document.body.classList.remove('lain-theme');
        
        // Очищаем все динамически созданные элементы
        const wiredElements = document.querySelectorAll('.wired-effect, .matrix-rain, .data-stream, .wired-terminal, .system-message');
        wiredElements.forEach(el => el.remove());
    }
    
    createLainGhostNode() {
        const canvas = document.getElementById('nodesLayer');
        if (!canvas) return;

        const viewCenterX = this.canvas.clientWidth / 2;
        const viewCenterY = this.canvas.clientHeight / 2;
        const worldCenter = window.canvasManager.screenToWorld(viewCenterX, viewCenterY);

        const ghostData = {
            id: 'lain_ghost_' + Date.now(),
            element: null,
            movementFrequency: 2000,
            movementDistance: 100,
            size: 1.0,
            jitterSpeed: 0.15,
            duplicationChance: 0.12,
            animationTimeout: null
        };
        
        const ghostNode = document.createElement('div');
        ghostNode.className = 'canvas-node lain-ghost';
        ghostNode.id = ghostData.id;
        ghostNode.style.position = 'absolute';
        ghostNode.style.left = (worldCenter.x - 90) + 'px';
        ghostNode.style.top = (worldCenter.y - 50) + 'px';
        ghostNode.style.zIndex = '1000';
        
        
        ghostNode.style.transform = `scale(${ghostData.size})`;
        
        ghostNode.style.animation = 'lain-drift 20s linear infinite alternate';

        // Вынес массив текстов сюда, чтобы он был доступен для функции клонирования
        this.ghostTexts = [
            'Present Day<br>Present Time',
            'Layer 07<br>Protocol',
            'Identity<br>Verified',
            'Ego Border<br>Dissolved',
            'Reality.exe<br>Not Found',
            'You Are<br>Connected',
            'Close the World<br>Open the Next',
            'I Am Not<br>Lain',
            'Everyone Is<br>Connected',
            'The Wired<br>Is Real'
        ];
        
        const selectedText = this.ghostTexts[Math.floor(Math.random() * this.ghostTexts.length)];
        
        
        ghostNode.innerHTML = `
            <div class="lain-ghost-inner">
                <div class="node-header" style="background: rgba(0,0,0,0.9); border: 1px solid rgba(0,255,0,0.3);">
                    <span class="node-title" style="color: #00ff41; text-shadow: 0 0 8px #00ff41; font-family: 'Courier New', monospace;">
                        ░▒▓ LAIN ▓▒░
                    </span>
                    <button class="node-close-btn" style="background: rgba(255,0,0,0.5); border: none; color: #fff; width: 20px; height: 20px; border-radius: 50%; font-size: 12px;">×</button>
                </div>
                <div class="node-body" style="background: rgba(0,0,0,0.8); min-height: 60px; border: 1px solid rgba(0,255,0,0.2);">
                    <div class="glitch-text" style="color: #00ff00; font-family: 'Courier New', monospace; text-align: center; padding: 15px; font-size: 11px;">
                        ${selectedText}
                    </div>
                    <div style="text-align: center; margin-top: 10px;">
                        <div style="width: 30px; height: 2px; background: #00ff41; margin: 2px auto; animation: lain-loading 2s infinite;"></div>
                        <div style="width: 20px; height: 2px; background: #ff0000; margin: 2px auto; animation: lain-loading 2s infinite 0.5s;"></div>
                        <div style="width: 25px; height: 2px; background: #0080ff; margin: 2px auto; animation: lain-loading 2s infinite 1s;"></div>
                    </div>
                </div>
            </div>
        `;
        
        const innerWrapper = ghostNode.querySelector('.lain-ghost-inner');
        innerWrapper.style.animation = `lain-jitter ${ghostData.jitterSpeed}s infinite`;

        canvas.appendChild(ghostNode);
        ghostData.element = ghostNode;
        this.lainGhostNodes.set(ghostData.id, ghostData);
        
        const closeBtn = ghostNode.querySelector('.node-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeGhostNode(ghostData.id);
            });
        }
        
        ghostNode.addEventListener('dblclick', () => {
            this.showSystemMessage('Ghost node activated: Reality breach detected');
        });
        
        this.makeLainGhostDraggable(ghostNode);
        this.animateLainGhost(ghostData);
    }

    /**
     * @param {object} parentData - Данные родительского нода.
     */
    createMutatedClone(parentData) {
        const canvas = document.getElementById('nodesLayer');
        if (!canvas || !parentData) return;
        // a parent whose move finished after deactivation must not spawn orphans
        if (!this.lainGhostNodes || !this.lainGhostNodes.has(parentData.id)) return;
        if (this.lainGhostNodes.size >= EasterEggsSystem.MAX_GHOSTS) return;

        const MUTATION_FACTOR = 0.25;
        const mutate = (value) => value * (1 + (Math.random() - 0.5) * MUTATION_FACTOR);

        const childData = {
            id: 'lain_ghost_' + Date.now() + '_' + Math.floor(Math.random() * 1e6),
            element: null,
            movementFrequency: Math.max(600, mutate(parentData.movementFrequency)),
            movementDistance: mutate(parentData.movementDistance), 
            size: Math.max(0.1, mutate(parentData.size)), 
            jitterSpeed: Math.max(0.01, mutate(parentData.jitterSpeed)), 
            duplicationChance: Math.min(0.35, Math.max(0, mutate(parentData.duplicationChance))),
            animationTimeout: null
        };

        const childNode = parentData.element.cloneNode(true);
        childNode.id = childData.id;

        childNode.style.left = (parseFloat(parentData.element.style.left) + (Math.random() - 0.5) * 50) + 'px';
        childNode.style.top = (parseFloat(parentData.element.style.top) + (Math.random() - 0.5) * 50) + 'px';
        
        childNode.style.transform = `scale(${childData.size})`;
        childNode.style.animation = 'lain-drift 20s linear infinite alternate';

        const innerWrapper = childNode.querySelector('.lain-ghost-inner');
        innerWrapper.style.animation = `lain-jitter ${childData.jitterSpeed}s infinite`;
        

        if (this.ghostTexts && this.ghostTexts.length > 0) {
            const newText = this.ghostTexts[Math.floor(Math.random() * this.ghostTexts.length)];
            const textElement = childNode.querySelector('.glitch-text');
            if (textElement) {
                textElement.innerHTML = newText;
            }
        }

        const closeBtn = childNode.querySelector('.node-close-btn');
        if (closeBtn) {
            if (Math.random() < 0.6) {
                closeBtn.remove();
            } else {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeGhostNode(childData.id);
                });
            }
        }

        childNode.addEventListener('dblclick', () => {
            this.showSystemMessage('Ghost node activated: Reality breach detected');
        });


        canvas.appendChild(childNode);
        childData.element = childNode;

        this.lainGhostNodes.set(childData.id, childData);

        this.makeLainGhostDraggable(childNode);
        this.animateLainGhost(childData);
    }

    animateLainGhost(ghostData) {
        if (!ghostData || !this.lainGhostNodes.has(ghostData.id)) return;

        const moveGhost = () => {
            if (!ghostData.element || ghostData.element.isBeingDragged) {
                if(ghostData.element) {
                    ghostData.animationTimeout = setTimeout(moveGhost, ghostData.movementFrequency);
                }
                return;
            }

            const currentLeft = parseFloat(ghostData.element.style.left);
            const currentTop = parseFloat(ghostData.element.style.top);
            
            const finalLeft = currentLeft + (Math.random() - 0.5) * ghostData.movementDistance;
            const finalTop = currentTop + (Math.random() - 0.5) * ghostData.movementDistance;

            this.performJerkyMove(ghostData.element, finalLeft, finalTop, () => {
                if (Math.random() < ghostData.duplicationChance) {
                    this.createMutatedClone(ghostData);
                }
                
                if (this.lainGhostNodes.has(ghostData.id)) {

                    const nextDelay = ghostData.movementFrequency * (0.5 + Math.random()); 
                    ghostData.animationTimeout = setTimeout(moveGhost, nextDelay);   
                }
            });
        };
        moveGhost();
    }

    /**
     * @param {HTMLElement} element - Перемещаемый элемент.
     * @param {number} finalX - Конечная координата X.
     * @param {number} finalY - Конечная координата Y.
     * @param {function} onComplete - Колбэк после завершения.
     */
    performJerkyMove(element, finalX, finalY, onComplete) {
        const JERKINESS = 40; 
        
        const targetX = finalX + (Math.random() - 0.5) * JERKINESS;
        const targetY = finalY + (Math.random() - 0.5) * JERKINESS;
        
        const transitionDuration = 100; 
        element.style.transition = `left ${transitionDuration}ms ease-out, top ${transitionDuration}ms ease-out`;
        
        element.style.left = targetX + 'px';
        element.style.top = targetY + 'px';
        
        
        setTimeout(onComplete, transitionDuration);
    }

    makeLainGhostDraggable(element) {
        const header = element.querySelector('.node-header');
        let initialX, initialY, startLeft, startTop;
    
        const dragStart = (e) => {
            if (e.button !== 0) return;

            e.preventDefault();
            e.stopPropagation();
    
            element.isBeingDragged = true; 
            element.style.transition = 'none'; 

            startLeft = parseFloat(element.style.left);
            startTop = parseFloat(element.style.top);
            initialX = e.clientX;
            initialY = e.clientY;
    
            document.addEventListener('mousemove', dragMove);
            document.addEventListener('mouseup', dragEnd, { once: true });
        };
    
        const dragMove = (e) => {
            if (!element.isBeingDragged) return;

            const scale = window.canvasManager ? window.canvasManager.getScale() : 1;
            const deltaX = (e.clientX - initialX) / scale;
            const deltaY = (e.clientY - initialY) / scale;
    
            element.style.left = `${startLeft + deltaX}px`;
            element.style.top = `${startTop + deltaY}px`;
        };
    
        const dragEnd = () => {
            element.isBeingDragged = false;
            document.removeEventListener('mousemove', dragMove);
        };
    
        header.addEventListener('mousedown', dragStart);
    }
    
    startWiredAudio() {
        this.wiredAudio = document.createElement('audio');
        this.wiredAudio.src = 'src/easter_eggs/sounds/lain.mp3';
        this.wiredAudio.loop = true;
        this.wiredAudio.volume = 0.15; // Увеличиваем громкость
        
        // Добавляем эффект постепенного появления
        const audio = this.wiredAudio;
        audio.addEventListener('loadstart', () => {
            audio.volume = 0;
        });

        audio.addEventListener('canplaythrough', () => {
            let volume = 0;
            clearInterval(this.wiredFadeIn);
            this.wiredFadeIn = setInterval(() => {
                if (this.wiredAudio !== audio) {
                    clearInterval(this.wiredFadeIn);
                } else if (volume < 0.15) {
                    volume += 0.01;
                    audio.volume = Math.min(volume, 0.15);
                } else {
                    clearInterval(this.wiredFadeIn);
                }
            }, 50);
        });
        
        this.wiredAudio.play().catch(err => {
            console.log('Не удалось запустить аудио:', err);
            // Fallback: создаем синтетические звуки
            this.createSyntheticAudio();
        });
    }
    
    createSyntheticAudio() {
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Создаем атмосферные звуки
            this.playAmbientSound();
        }
    }
    
    playAmbientSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(55, this.audioContext.currentTime); // Низкая частота
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 10);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 10);
        
        // Периодически воспроизводим звук
        setTimeout(() => {
            if (this.audioContext) {
                this.playAmbientSound();
            }
        }, 8000 + Math.random() * 4000);
    }
    
    createMatrixRain() {
        const matrixContainer = document.createElement('div');
        matrixContainer.className = 'matrix-rain wired-effect';
        matrixContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
            overflow: hidden;
        `;
        
        for (let i = 0; i < 50; i++) {
            const column = document.createElement('div');
            column.className = 'matrix-column';
            column.style.cssText = `
                position: absolute;
                top: -100px;
                left: ${Math.random() * 100}%;
                font-family: 'Courier New', monospace;
                font-size: ${12 + Math.random() * 8}px;
                color: #00ff41;
                text-shadow: 0 0 5px #00ff41;
                animation: matrix-fall ${3 + Math.random() * 7}s linear infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            
            const symbols = ['0', '1', 'Ѐ', 'Ё', '௹', 'Ђ', 'Ѓ', 'Є', 'Ѕ', 'І', 'Ї', 'Ј', 'Љ', 'Њ', 'Ћ', 'Ќ', 'Ѝ', 'Ў', 'Џ'];
            let columnText = '';
            for (let j = 0; j < 20; j++) {
                columnText += symbols[Math.floor(Math.random() * symbols.length)] + '<br>';
            }
            column.innerHTML = columnText;
            
            matrixContainer.appendChild(column);
        }
        
        document.body.appendChild(matrixContainer);
        this.matrixRainElement = matrixContainer;
    }
    
    clearMatrixRain() {
        if (this.matrixRainElement) {
            this.matrixRainElement.remove();
            this.matrixRainElement = null;
        }
    }
    
    startGlitchEffects() {
        this.glitchInterval = setInterval(() => {
            // Случайные глитчи на всем экране
            const glitch = document.createElement('div');
            glitch.className = 'screen-glitch wired-effect';
            glitch.style.cssText = `
                position: fixed;
                top: ${Math.random() * 100}%;
                left: 0;
                width: 100%;
                height: ${2 + Math.random() * 5}px;
                background: linear-gradient(90deg, 
                    transparent, 
                    rgba(255, 0, 0, 0.3), 
                    rgba(0, 255, 0, 0.3), 
                    rgba(0, 0, 255, 0.3), 
                    transparent);
                pointer-events: none;
                z-index: 10001;
                animation: glitch-bar 0.1s ease-out forwards;
            `;
            
            document.body.appendChild(glitch);
            setTimeout(() => glitch.remove(), 100);
        }, 200 + Math.random() * 800);
    }
    
    stopGlitchEffects() {
        if (this.glitchInterval) {
            clearInterval(this.glitchInterval);
            this.glitchInterval = null;
        }
    }
    
    createDataStreamOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'data-stream wired-effect';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9997;
            background: 
                repeating-linear-gradient(
                    45deg,
                    transparent 0px,
                    rgba(0, 255, 65, 0.01) 1px,
                    transparent 2px
                ),
                repeating-linear-gradient(
                    -45deg,
                    transparent 0px,
                    rgba(255, 0, 0, 0.01) 1px,
                    transparent 2px
                );
            animation: data-stream-flow 20s linear infinite;
        `;
        
        document.body.appendChild(overlay);
        this.dataStreamElement = overlay;
    }
    
    clearDataStreamOverlay() {
        if (this.dataStreamElement) {
            this.dataStreamElement.remove();
            this.dataStreamElement = null;
        }
    }
    
    injectWiredTerminal() {
        const terminal = document.createElement('div');
        terminal.className = 'wired-terminal wired-effect';
        terminal.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 400px;
            height: 200px;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid #00ff41;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            color: #00ff41;
            padding: 10px;
            font-size: 12px;
            overflow-y: auto;
            z-index: 10000;
            box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
        `;
        
        const messages = [
            'Initializing Layer 07 Protocol...',
            'Connecting to Wired infrastructure...',
            'Identity verification: LAIN',
            'Ego border dissolution: 47%',
            'Reality.exe has stopped working',
            'You are not alone.',
            'Present day... Present time...',
            'Everyone is connected.',
            'Close the world, open the next.',
            'No matter where you go, everyone\'s connected.',
            'The Wired is not merely a communication network.',
            'I am not Lain. Lain is...',
            'Schumann resonance locked: 7.83 Hz',
            'If you aren\'t remembered, you never existed.',
            'God is here. In the Wired.',
            'Layer 08: knights of the eastern calculus online',
            'Psyche chip detected. Overclocking...',
            'Let\'s all love Lain.',
        ];
        
        let messageIndex = 0;
        terminal.innerHTML = `<div style="color: #ff0000;">SYSTEM BREACH DETECTED</div><br>`;
        
        this.terminalInterval = setInterval(() => {
            if (messageIndex < messages.length) {
                terminal.innerHTML += `> ${messages[messageIndex]}<br>`;
                messageIndex++;
                terminal.scrollTop = terminal.scrollHeight;
            } else {
                // Циклический вывод
                messageIndex = 0;
                terminal.innerHTML = `<div style="color: #ff0000;">SYSTEM BREACH DETECTED</div><br>`;
            }
        }, 2000);
        
        document.body.appendChild(terminal);
        this.wiredTerminalElement = terminal;
    }
    
    removeWiredTerminal() {
        if (this.terminalInterval) {
            clearInterval(this.terminalInterval);
            this.terminalInterval = null;
        }
        if (this.wiredTerminalElement) {
            this.wiredTerminalElement.remove();
            this.wiredTerminalElement = null;
        }
    }
    
    screenShake() {
        document.body.style.animation = 'screen-shake 0.5s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }
    
    startSystemMessages() {
        const messages = [
            'Reality buffer overflow detected',
            'Ego.sys corrupted',
            'Boundary between real and virtual compromised',
            'Identity verification failed',
            'Multiple consciousness instances detected',
            'Layer 07 protocol active',
            'Neural link established',
            'Memory fragmentation in progress...'
        ];
        
        this.systemMessageInterval = setInterval(() => {
            const message = messages[Math.floor(Math.random() * messages.length)];
            this.showSystemMessage(message);
        }, 20000 + Math.random() * 20000);
    }
    
    stopSystemMessages() {
        if (this.systemMessageInterval) {
            clearInterval(this.systemMessageInterval);
            this.systemMessageInterval = null;
        }
    }
    
    showSystemMessage(text) {
        const message = document.createElement('div');
        message.className = 'system-message wired-effect';
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            color: #ff0000;
            font-family: 'Courier New', monospace;
            font-size: 18px;
            padding: 20px 40px;
            border: 2px solid #ff0000;
            border-radius: 5px;
            z-index: 10002;
            text-align: center;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
            animation: system-message-appear 0.5s ease-out;
        `;
        
        message.textContent = `ERROR: ${text}`;
        document.body.appendChild(message);
        
        // Воспроизводим звуковой эффект для системного сообщения
        this.playSystemSound();
        
        setTimeout(() => {
            message.style.animation = 'system-message-disappear 0.5s ease-out forwards';
            setTimeout(() => message.remove(), 500);
        }, 3000);
    }
    
    playSystemSound() {
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.systemAudioContext = this.systemAudioContext || new AudioContext();
            const audioContext = this.systemAudioContext;

            // a short, muted modem-like blip
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(520, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(180, audioContext.currentTime + 0.25);

            gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.25);
        }
    }
    
    removeGhostNode(ghostId) {
        const ghostData = this.lainGhostNodes.get(ghostId);
        if (ghostData) {
            // Добавляем эффект исчезновения
            ghostData.element.style.animation = 'lain-ghost-disappear 0.5s ease-out forwards';
            
            setTimeout(() => {
                clearTimeout(ghostData.animationTimeout);
                if (ghostData.element.parentNode) {
                    ghostData.element.remove();
                }
                this.lainGhostNodes.delete(ghostId);
            }, 500);
            
            // Показываем сообщение об удалении
            this.showSystemMessage('Ghost node deleted: Connection severed');
        }
    }
    
}

document.addEventListener('DOMContentLoaded', () => {
    window.easterEggs = new EasterEggsSystem();
    console.log('🐣 Система пасхалок инициализирована');
});

window.EasterEggsSystem = EasterEggsSystem;