import { Badge, Card } from 'antd';
import { useEffect, useState } from 'react';
import type { WebSocketMessage } from '@/types';

interface WebSocketStatusProps {
  processType: string;
  wsManager: any;
  onMessage?: (message: WebSocketMessage) => void;
}

const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
  processType,
  wsManager,
  onMessage
}) => {
  const [status, setStatus] = useState<'success' | 'error' | 'processing'>('processing');
  const [message, setMessage] = useState<string>('连接中...');

  useEffect(() => {
    if (wsManager) {
      wsManager.onMessage = (data: WebSocketMessage) => {
        if (data.type === 'status') {
          setStatus(data.active ? 'success' : 'error');
          setMessage(data.message || '');
        }
        onMessage?.(data);
      };
    }
  }, [wsManager, onMessage]);

  return (
    <Card size="small" title="WebSocket状态" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Badge status={status} />
        <span>{processType}功能: {message}</span>
      </div>
    </Card>
  );
};

export default WebSocketStatus; 