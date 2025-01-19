import request from '@/utils/request';
import type { ImageProcessingResponse } from '@/types';

export const uploadImage = (file: File, type: 'translate' | 'calorie' | 'navigate') => {
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
};

export const toggleMessengerProcessing = (type: 'translate' | 'calorie' | 'navigate') =>
  request.post<any, ImageProcessingResponse>(`/images/${type}/messenger`); 