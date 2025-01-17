import { useState, useEffect } from 'react';

const MessengerProcessor = ({ processType }) => {
    const [result, setResult] = useState(null);
    const [ws, setWs] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 初始化 WebSocket 连接
        const websocket = new WebSocket(`ws://localhost:8000/ws/${processType}`);
        
        websocket.onopen = () => {
            console.log('WebSocket 连接已建立');
        };

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.status === 'success') {
                setResult(data.result);
            } else {
                setError(data.message);
            }
        };

        websocket.onerror = (error) => {
            console.error('WebSocket 错误:', error);
            setError('WebSocket 连接错误');
        };

        websocket.onclose = () => {
            console.log('WebSocket 连接已关闭');
        };

        setWs(websocket);

        // 组件卸载时关闭 WebSocket
        return () => {
            websocket.close();
        };
    }, [processType]);

    const handleProcessMessenger = async () => {
        try {
            // 1. 调用对应的功能路由
            const response = await fetch(`/${processType}/messenger`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('处理请求失败');
            }

            // 2. 等待 WebSocket 接收图片 URL
            // WebSocket 会自动处理接收到的消息
            
        } catch (error) {
            setError(error.message);
            console.error('错误:', error);
        }
    };

    return (
        <div>
            <button onClick={handleProcessMessenger}>
                处理 Messenger 图片
            </button>
            
            {error && (
                <div className="error">
                    错误: {error}
                </div>
            )}
            
            {result && (
                <div className="result">
                    处理结果: {JSON.stringify(result)}
                </div>
            )}
        </div>
    );
};

export default MessengerProcessor; 