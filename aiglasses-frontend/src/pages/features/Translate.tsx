import { useState } from 'react';
import { Card, Button, Space, Typography, message } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import ImageUpload from '@/components/ImageUpload';
import WebSocketStatus from '@/components/WebSocketStatus';
import { uploadImage, toggleMessengerProcessing } from '@/api/imageProcessing';
import { WebSocketManager } from '@/utils/websocket';
import type { WebSocketMessage, ImageProcessingResponse } from '@/types';

const { Text } = Typography;

const Translate = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [wsManager] = useState(() => new WebSocketManager('translate'));

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const response = await uploadImage(file, 'translate');
      setResult(response.result?.result || '无法识别图片内容');
      message.success('翻译成功');
    } catch (error) {
      message.error('翻译失败');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMessenger = async () => {
    try {
      const response = await toggleMessengerProcessing('translate');
      message.success(response.message);
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
        processType="翻译"
        wsManager={wsManager}
        onMessage={handleWsMessage}
      />
      
      <Card title="图片翻译">
        <Space direction="vertical" style={{ width: '100%' }}>
          <ImageUpload onUpload={handleUpload} />
          
          <Button 
            type="primary"
            icon={<SyncOutlined />}
            onClick={handleToggleMessenger}
            loading={loading}
          >
            切换Messenger翻译状态
          </Button>

          {result && (
            <Card title="翻译结果" size="small">
              <Text>{result}</Text>
            </Card>
          )}
        </Space>
      </Card>
    </Space>
  );
};

export default Translate; 