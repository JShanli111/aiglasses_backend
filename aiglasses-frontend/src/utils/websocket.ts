import { ws } from '@/api';
import type { WebSocketMessage } from '@/types';

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private processType: string;
  public onMessage: ((data: WebSocketMessage) => void) | null = null;

  constructor(processType: string) {
    this.processType = processType;
    this.connect();
  }

  private connect() {
    const wsUrl = ws.getUrl(this.processType);
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log(`WebSocket connected: ${this.processType}`);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        this.onMessage?.(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log(`WebSocket disconnected: ${this.processType}`);
      setTimeout(() => this.connect(), 3000); // 重连
    };

    this.ws.onerror = (error) => {
      console.error(`WebSocket error: ${this.processType}`, error);
    };
  }

  public close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
} 