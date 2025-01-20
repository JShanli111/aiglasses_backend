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
            if (!window.retryCount) {
                window.retryCount = {};
            }
            
            const normalizedUrl = normalizeUrl(imageUrl);
            if (!window.retryCount[normalizedUrl]) {
                window.retryCount[normalizedUrl] = 0;
            }
            
            if (window.retryCount[normalizedUrl] < 3) {
                console.log(`🔄 正在发送图片 (${currentProcessType}功能) - 重试次数: ${window.retryCount[normalizedUrl]}`);
                ws.send(JSON.stringify({
                    type: 'image_url',
                    url: imageUrl,
                    retry: window.retryCount[normalizedUrl]
                }));
                window.retryCount[normalizedUrl]++;
            } else {
                console.log('⚠️ 尝试Base64方式发送图片...');
                convertToBase64(imageUrl);
            }
        } else {
            if (!window.pendingImages) {
                window.pendingImages = new Set();
            }
            window.pendingImages.add(imageUrl);
            console.log('⚠️ WebSocket未连接，图片已加入待处理队列');
        }
    }

    function convertToBase64(imageUrl) {
        console.log(`🔄 开始处理图片: ${imageUrl}`);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function() {
            console.log('✅ 图片加载成功，开始转换...');
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            try {
                const base64Data = canvas.toDataURL('image/jpeg', 0.8);
                console.log('✅ 图片转换完成，正在发送...');
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'image_base64',
                        data: base64Data,
                        originalUrl: imageUrl
                    }));
                    console.log('📤 Base64数据已发送');
                }
            } catch (e) {
                console.error('❌ 转换失败:', e);
            }
        };
        img.onerror = function(e) {
            console.error('❌ 图片加载失败:', e);
        };
        img.src = imageUrl;
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
        console.log('🔍 开始检查可用功能...');
        
        const TIMEOUT = 5000;  // 改为5秒
        
        const results = await Promise.all(processTypes.map(async (type) => {
            console.log(`🔍 正在检查 ${type} 功能...`);
            try {
                const ws = new WebSocket(`ws://localhost:8000/api/v1/ws/${type}`);
                const result = await new Promise((resolve) => {
                    ws.onopen = () => {
                        console.log(`📡 正在连接 ${type} 功能...`);
                    };
                    ws.onmessage = (e) => {
                        const data = JSON.parse(e.data);
                        if (data.type === 'status') {
                            const isActive = data.active;
                            console.log(`📡 ${type} 功能状态: ${isActive ? '✅ 已激活' : '❌ 未激活'}`);
                            resolve({ type, active: isActive });
                        }
                    };
                    ws.onerror = () => {
                        console.log(`❌ ${type} 功能连接失败`);
                        resolve({ type, active: false });
                    };
                    setTimeout(() => {
                        console.log(`⏱️ ${type} 功能检查超时`);
                        resolve({ type, active: false });
                    }, TIMEOUT);
                });
                ws.close();
                return result;
            } catch (e) {
                console.log(`⚠️ ${type} 功能检查失败:`, e.message);
                return { type, active: false };
            }
        }));

        const activeType = results.find(r => r.active);
        if (activeType) {
            currentProcessType = activeType.type;
            localStorage.setItem('lastProcessType', activeType.type);
            console.log(`✅ 使用功能: ${activeType.type}`);
            return activeType.type;
        }

        console.log('❌ 没有找到可用的功能');
        console.log('💡 请确保以下至少一个功能已激活:');
        processTypes.forEach(type => {
            console.log(`   - ${type}`);
        });
        return null;
    }

    async function initWebSocket() {
        currentProcessType = await checkActiveProcessType();
        if (!currentProcessType) {
            console.log('❌ 启动失败: 没有找到可用的功能');
            console.log('💡 请确保以下至少一个功能已激活:');
            processTypes.forEach(type => {
                console.log(`   - ${type}`);
            });
            return;
        }

        const connectWebSocket = () => {
            if (ws) {
                try {
                    ws.close();
                } catch (e) {}
            }

            console.log(`🔌 正在连接 ${currentProcessType} 功能...`);
            ws = new WebSocket(`ws://localhost:8000/api/v1/ws/${currentProcessType}`);
            
            ws.onopen = () => {
                console.log(`✅ 连接成功 - 当前功能: ${currentProcessType}`);
                console.log(`📝 功能说明:`);
                const descriptions = {
                    'translate': '图片文字翻译',
                    'calorie': '食物卡路里估算',
                    'navigate': '导航避障分析'
                };
                console.log(`   - ${descriptions[currentProcessType] || currentProcessType}`);
                handleNewImage(document.body);
            };
            
            ws.onclose = (event) => {
                if (event.code !== 1000) {
                    console.log(`🔄 连接断开，3秒后重试...`);
                    if (window.imageAnalysisRunning) {
                        setTimeout(connectWebSocket, 3000);
                    }
                } else {
                    console.log('👋 连接已正常关闭');
                }
            };
            
            ws.onerror = (error) => {
                console.error('❌ 连接错误:', error);
            };
            
            ws.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    if (data.type === 'error') {
                        if (data.message.includes('功能未激活')) {
                            window.stopImageAnalysis();
                            localStorage.removeItem('lastProcessType');
                            console.log(`⚠️ ${currentProcessType} 功能未激活，已停止`);
                        } else {
                            console.error('❌ 错误:', data.message);
                        }
                    } else if (data.type === 'result') {
                        const imageUrl = data.originalUrl || data.url || '未知图片';
                        // 根据不同功能显示不同的结果格式
                        switch(currentProcessType) {
                            case 'calorie':
                                console.log(`
🍽️ 卡路里分析结果
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 图片: ${imageUrl}
📊 分析: ${data.result}
━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                                break;
                            case 'translate':
                                console.log(`
📝 翻译结果
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 图片: ${imageUrl}
🔤 文本: ${data.result}
━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                                break;
                            case 'navigate':
                                console.log(`
🚶 导航分析结果
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 图片: ${imageUrl}
🎯 建议: ${data.result}
━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                                break;
                            default:
                                console.log(`
✨ ${currentProcessType} 分析结果
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 图片: ${imageUrl}
📊 结果: ${data.result}
━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                        }
                    } else if (data.type === 'status') {
                        console.log(`📡 ${currentProcessType} 功能状态:`, data.active ? '✅ 已激活' : '❌ 未激活');
                    } else {
                        console.log('📨 收到消息:', data);
                    }
                } catch (err) {
                    console.error('❌ 消息处理错误:', err);
                    console.error('原始消息:', e.data);
                }
            };
        };

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