import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { ImageProcessingResponse } from '@/types';

const { Dragger } = Upload;

interface ImageUploadProps {
  onUpload: (file: File) => Promise<ImageProcessingResponse>;
  accept?: string;
  maxSize?: number; // MB
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  accept = 'image/*',
  maxSize = 5
}) => {
  const props: UploadProps = {
    name: 'file',
    multiple: false,
    accept,
    showUploadList: false,
    beforeUpload: async (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件！');
        return false;
      }

      const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
      if (!isLtMaxSize) {
        message.error(`图片必须小于 ${maxSize}MB！`);
        return false;
      }

      try {
        await onUpload(file);
        return false; // 阻止默认上传行为
      } catch (error) {
        console.error('上传失败:', error);
        return false;
      }
    },
  };

  return (
    <Dragger {...props}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
      <p className="ant-upload-hint">
        支持单个图片上传，图片大小不超过 {maxSize}MB
      </p>
    </Dragger>
  );
};

export default ImageUpload; 