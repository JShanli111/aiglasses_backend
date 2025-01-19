// 用户相关类型
export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  device_id?: string;
}

export interface LoginParams {
  username: string;  // 实际是email
  password: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  device_id?: string;
}

// 图像处理相关类型
export interface ImageProcessingResponse {
  status: string;
  file_path?: string;
  result?: {
    result: string;
    [key: string]: any;
  };
  message?: string;
}

// WebSocket消息类型
export interface WebSocketMessage {
  type: 'status' | 'result' | 'error';
  active?: boolean;
  message?: string;
  result?: string;
  process_type?: string;
} 