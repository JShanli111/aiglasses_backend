import { useState } from 'react';
import { Card, Button, Space, Typography, message } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import ImageUpload from '@/components/ImageUpload';
import WebSocketStatus from '@/components/WebSocketStatus';
import { imageProcessing } from '@/api';
import { WebSocketManager } from '@/utils/websocket';
import type { WebSocketMessage } from '@/types';

const { Text } = Typography;

const Navigate = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [wsManager] = useState(() => new WebSocketManager('navigate'));

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const response = await imageProcessing.upload(file, 'navigate');
      setResult(response.result?.result || '无法识别环境信息');
      message.success('分析成功');
    } catch (error) {
      message.error('分析失败');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMessenger = async () => {
    try {
      await imageProcessing.toggleMessenger('navigate');
      message.success('切换状态成功');
    } catch (error) {
      message.error('切换状态失败');
    }
  };

  const handleWsMessage = (data: WebSocketMessage) => {
    if (data.type === 'result') {
      setResult(data.result || '');
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <WebSocketStatus 
        processType="导航避障"
        wsManager={wsManager}
        onMessage={handleWsMessage}
      />
      
      <Card title="环境导航避障">
        <Space direction="vertical" style={{ width: '100%' }}>
          <ImageUpload onUpload={handleUpload} />
          
          <Button 
            type="primary"
            icon={<SyncOutlined />}
            onClick={handleToggleMessenger}
            loading={loading}
          >
            切换Messenger导航避障状态
          </Button>

          {result && (
            <Card title="分析结果" size="small">
              <Text>{result}</Text>
            </Card>
          )}
        </Space>
      </Card>
    </Space>
  );
};

export default Navigate; 