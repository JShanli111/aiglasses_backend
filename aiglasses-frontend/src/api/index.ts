import request from '@/utils/request';
import type { 
  LoginParams, 
  RegisterParams, 
  User, 
  ImageProcessingResponse 
} from '@/types';

// 认证相关 API
export const auth = {
  login: (data: LoginParams) =>
    request.post<any, { access_token: string; token_type: string }>(
      '/auth/token',
      new URLSearchParams({
        username: data.username,
        password: data.password,
      })
    ),

  register: (data: RegisterParams) =>
    request.post<any, User>('/auth/register', data),

  getCurrentUser: () =>
    request.get<any, User>('/auth/me'),
};

// 图像处理相关 API
export const imageProcessing = {
  upload: (file: File, type: 'translate' | 'calorie' | 'navigate') => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post<any, ImageProcessingResponse>(
      `/images/${type}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  toggleMessenger: (type: 'translate' | 'calorie' | 'navigate') =>
    request.post<any, ImageProcessingResponse>(`/images/${type}/messenger`),
};

// WebSocket相关
export const ws = {
  getUrl: (type: string) => {
    const baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    return `${baseUrl}/api/v1/ws/${type}`;
  },
}; 