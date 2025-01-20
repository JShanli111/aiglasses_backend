export class WebSocketService {
    private ws: WebSocket | null = null;
    private currentType: string | null = null;

    connect(type: 'translate' | 'calorie' | 'navigate') {
        // 如果已经连接同类型，就不重复连接
        if (this.ws && this.currentType === type) {
            return this.ws;
        }
        
        // 关闭之前的连接
        if (this.ws) {
            this.ws.close();
        }

        console.log(`正在连接 ${type} 功能...`); // 添加日志
        this.currentType = type;
        this.ws = new WebSocket(`ws://localhost:8000/api/v1/ws/${type}`);
        
        this.ws.onopen = () => {
            console.log(`✅ ${type}功能已连接`);
        };

        this.ws.onclose = () => {
            console.log(`❌ ${type}功能已断开`);
            this.ws = null;
        };

        this.ws.onerror = (error) => {
            console.error(`WebSocket错误:`, error);
        };

        return this.ws;
    }

    // 发送图片（支持URL和Base64）
    async sendImage(file: File) {
        if (!this.ws) {
            throw new Error('WebSocket未连接');
        }

        console.log('正在转换图片为Base64...'); // 添加日志
        const base64 = await this.fileToBase64(file);
        
        console.log('正在发送图片数据...'); // 添加日志
        this.ws.send(JSON.stringify({
            type: 'image_base64',
            data: base64,
            originalName: file.name
        }));
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64 = reader.result as string;
                resolve(base64.split(',')[1]); // 移除 "data:image/jpeg;base64," 前缀
            };
            reader.onerror = error => reject(error);
        });
    }
}

export const wsService = new WebSocketService(); 