javascript: (function() {
    // 防止重复运行
    if (window.imageAnalysisRunning) {
        window.stopImageAnalysis();
        return;
    }

    const processTypes = ['translate', 'calorie', 'navigate'];
    let currentProcessType = null;

    window.imageAnalysisRunning = true;

    const MESSENGER_SELECTORS = [
        '[role="main"]',
        '.x1n2onr6'
    ];

    let ws = null;

    window.analyzedUrls = new Set();
    console.log(`📊 已初始化URL集合`);

    function normalizeUrl(url) {
        try {
            const urlObj = new URL(url);
            const path = urlObj.pathname.split('?')[0];
            return path.toLowerCase();
        } catch (e) {
            return url;
        }
    }

    function findMessageContainer() {
        for (let selector of MESSENGER_SELECTORS) {
            const container = document.querySelector(selector);
            if (container) {
                console.log('✅ 找到消息容器:', selector);
                return container;
            }
        }
        console.log('⚠️ 使用默认容器');
        return document.body;
    }

    function sendImageUrl(imageUrl) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'image_url',
                url: imageUrl
            }));
            console.log('📤 已发送图片URL到后端');
        } else {
            console.log('⚠️ WebSocket未连接，图片将在连接恢复后发送');
            // 将图片URL存储到待发送队列
            if (!window.pendingImages) {
                window.pendingImages = new Set();
            }
            window.pendingImages.add(imageUrl);
        }
    }

    function handleNewImage(node) {
        // 先尝试发送待发送队列中的图片
        if (window.pendingImages && ws && ws.readyState === WebSocket.OPEN) {
            console.log('🔄 尝试发送待处理的图片...');
            for (const url of window.pendingImages) {
                sendImageUrl(url);
            }
            window.pendingImages.clear();
        }

        const images = node.getElementsByTagName('img');
        for (let img of images) {
            if (img.dataset.analyzed) continue;

            const messageContainer = img.closest('.x78zum5') || 
                                  img.closest('.xzsf02u') || 
                                  img.closest('[role="row"]');
            if (!messageContainer) continue;

            const imageUrl = img.src;
            if (!imageUrl || !imageUrl.startsWith('http')) continue;

            const normalizedUrl = normalizeUrl(imageUrl);
            if (window.analyzedUrls.has(normalizedUrl)) {
                console.log('⏭️ 跳过已处理的图片:', imageUrl);
                continue;
            }

            img.dataset.analyzed = 'true';
            window.analyzedUrls.add(normalizedUrl);
            console.log('📸 发现新图片:', imageUrl);
            sendImageUrl(imageUrl);
        }
    }

    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        handleNewImage(node);
                    }
                });
            } else if (mutation.type === 'attributes' && 
                      mutation.target.tagName === 'IMG' && 
                      !mutation.target.dataset.analyzed) {
                handleNewImage(mutation.target.parentNode);
            }
        }
    });

    async function checkActiveProcessType() {
        // 首先尝试从 localStorage 获取上次使用的类型
        const lastType = localStorage.getItem('lastProcessType');
        if (lastType) {
            try {
                const ws = new WebSocket(`ws://localhost:8000/api/v1/ws/${lastType}`);
                const result = await new Promise((resolve) => {
                    ws.onopen = () => {
                        console.log(`正在检查${lastType}功能状态...`);
                    };
                    ws.onmessage = (e) => {
                        const data = JSON.parse(e.data);
                        if (data.type === 'status') {
                            resolve(data.active);
                        }
                    };
                    ws.onerror = () => resolve(false);
                    // 添加超时处理
                    setTimeout(() => resolve(false), 3000);
                });
                ws.close();
                
                if (result) {
                    currentProcessType = lastType;
                    console.log(`✅ 恢复上次使用的功能: ${lastType}`);
                    return lastType;
                }
            } catch (e) {
                console.log('上次使用的功能未激活，尝试其他功能');
            }
        }

        // 检查其他类型
        for (const type of processTypes) {
            if (type === lastType) continue;
            try {
                const ws = new WebSocket(`ws://localhost:8000/api/v1/ws/${type}`);
                const result = await new Promise((resolve) => {
                    ws.onopen = () => {
                        console.log(`正在检查${type}功能状态...`);
                    };
                    ws.onmessage = (e) => {
                        const data = JSON.parse(e.data);
                        if (data.type === 'status') {
                            resolve(data.active);
                        }
                    };
                    ws.onerror = () => resolve(false);
                    setTimeout(() => resolve(false), 3000);
                });
                ws.close();
                
                if (result) {
                    currentProcessType = type;
                    localStorage.setItem('lastProcessType', type);
                    console.log(`✅ 发现激活的功能: ${type}`);
                    return type;
                }
            } catch (e) {
                continue;
            }
        }
        console.log('❌ 没有找到激活的功能');
        return null;
    }

    async function initWebSocket() {
        currentProcessType = await checkActiveProcessType();
        if (!currentProcessType) {
            console.log('❌ 没有激活的功能');
            return;
        }

        const connectWebSocket = () => {
            ws = new WebSocket(`ws://localhost:8000/api/v1/ws/${currentProcessType}`);
            
            ws.onopen = () => {
                console.log(`✅ WebSocket已连接 - 功能类型: ${currentProcessType}`);
                handleNewImage(document.body);
            };
            
            ws.onclose = (event) => {
                console.log('WebSocket已关闭:', event.code, event.reason || '未知原因');
                // 如果不是主动关闭，则尝试重连
                if (window.imageAnalysisRunning) {
                    console.log('🔄 尝试重新连接...');
                    setTimeout(connectWebSocket, 3000); // 3秒后重试
                }
            };
            
            ws.onerror = (error) => {
                console.error('WebSocket错误:', error);
            };
            
            ws.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    console.log('📥 收到服务器消息:', data);
                    
                    if (data.type === 'error' && data.message.includes('功能未激活')) {
                        window.stopImageAnalysis();
                        localStorage.removeItem('lastProcessType');
                        console.log(`⚠️ ${currentProcessType}功能未激活，已停止分析`);
                    } else if (data.type === 'result') {
                        const resultMessages = {
                            'translate': '📝 翻译结果:',
                            'calorie': '🍽️ 卡路里分析结果:',
                            'navigate': '🚶 导航避障分析结果:'
                        };
                        console.log(resultMessages[currentProcessType], data.result);
                    }
                } catch (err) {
                    console.error('消息处理错误:', err);
                }
            };
        };

        // 初始连接
        connectWebSocket();
    }

    function startObserving() {
        const container = findMessageContainer();
        observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'class']
        });
        console.log('🚀 开始监听新图片');
    }

    window.stopImageAnalysis = function() {
        if (observer) {
            observer.disconnect();
        }
        if (ws) {
            ws.close(1000, "User stopped"); // 使用正常关闭代码
        }
        window.imageAnalysisRunning = false;
        if (window.pendingImages) {
            window.pendingImages.clear();
        }
        console.log(`⏹️ ${currentProcessType || ''}功能已停止`);
    };

    initWebSocket();
    startObserving();
    console.log(`🤖 图片分析助手已启动
    - 实时监控: 已开启
    - WebSocket: 正在连接
    - 再次点击书签可停止处理`);
})(); 