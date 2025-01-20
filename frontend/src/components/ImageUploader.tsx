import React, { useState, useEffect } from 'react';
import { wsService } from '../services/websocket';

interface Props {
    type: 'translate' | 'calorie' | 'navigate';
}

export const ImageUploader: React.FC<Props> = ({ type }) => {
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // 组件加载时连接WebSocket
        const ws = wsService.connect(type);
        if (ws) {
            ws.onmessage = (e) => {
                const data = JSON.parse(e.data);
                console.log('收到WebSocket消息:', data);  // 添加日志
                if (data.type === 'result') {
                    setResult(data.result);
                }
            };
        }
    }, [type]);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            console.log('开始上传图片...'); // 添加日志
            await wsService.sendImage(file);
            console.log('图片已发送'); // 添加日志
        } catch (error) {
            console.error('上传失败:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <input 
                type="file" 
                accept="image/*"
                onChange={handleUpload}
                disabled={loading}
            />
            {loading && <div>处理中...</div>}
            {result && (
                <div>
                    <h3>分析结果:</h3>
                    <p>{result}</p>
                </div>
            )}
        </div>
    );
}; 