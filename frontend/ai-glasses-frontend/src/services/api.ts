interface TranslationData {
  image_url: string;
  target_language: string;
}

interface CalorieData {
  image_url: string;
}

interface NavigationData {
  image_url: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export const api = {
  translate: async (data: TranslationData) => {
    try {
      // 将 base64 转换为 Blob
      const base64Data = data.image_url.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      formData.append('target_language', data.target_language);
      formData.append('source_language', 'auto');
      formData.append('format', 'text');

      const response = await fetch(`${API_URL}/api/v1/translate/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.status === 422) {
        const errorData = await response.json();
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const errorMessages = errorData.detail.map((err: any) => 
            `${err.loc.join('.')}: ${err.msg}`
          ).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(errorData.detail || '数据验证失败');
      }

      if (!response.ok) {
        throw new Error(`服务器错误: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('未知错误');
      }
    }
  },

  calorie: async (data: CalorieData) => {
    try {
      // 将 base64 转换为 Blob
      const base64Data = data.image_url.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');

      const response = await fetch(`${API_URL}/api/v1/calorie/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.status === 422) {
        const errorData = await response.json();
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const errorMessages = errorData.detail.map((err: any) => 
            `${err.loc.join('.')}: ${err.msg}`
          ).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(errorData.detail || '数据验证失败');
      }

      if (!response.ok) {
        throw new Error(`服务器错误: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('未知错误');
      }
    }
  },

  navigate: async (data: NavigationData) => {
    try {
      // 将 base64 转换为 Blob
      const base64Data = data.image_url.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');

      const response = await fetch(`${API_URL}/api/v1/navigate/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.status === 422) {
        const errorData = await response.json();
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const errorMessages = errorData.detail.map((err: any) => 
            `${err.loc.join('.')}: ${err.msg}`
          ).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(errorData.detail || '数据验证失败');
      }

      if (!response.ok) {
        throw new Error(`服务器错误: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('未知错误');
      }
    }
  },
}; 