import type { Communication, CommunicationFormData } from '../types';
import axios from 'axios';
import type { AxiosProgressEvent } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// اضافه کردن token به هدرها (اگر احراز هویت دارید)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // اگر FormData است، Content-Type را تنظیم نکنید (axios خودکار تنظیم می‌کند)
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
});

export const communicationsApi = {
  // دریافت لیست تمام مکاتبات
  getAll: async (): Promise<Communication[]> => {
    const response = await api.get('/communications/');
    return response.data;
  },

  // دریافت یک مکاتبه
  getById: async (id: number): Promise<Communication> => {
    const response = await api.get(`/communications/${id}/`);
    return response.data;
  },

  // ایجاد مکاتبه جدید با آپلود فایل
  create: async (
    data: CommunicationFormData,
    onProgress?: (progress: number) => void
  ): Promise<Communication> => {
    const formData = new FormData();
    formData.append('topic', data.topic);
    formData.append('sender', data.sender);
    formData.append('receiver', data.receiver);
    formData.append('date', data.date);
    
    if (data.attachment && data.attachment instanceof File) {
      formData.append('attachment', data.attachment);
    }
    if (data.lettersfile && data.lettersfile instanceof File) {
      formData.append('lettersfile', data.lettersfile);
    }

    const response = await api.post('/communications/', formData, {
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  // به‌روزرسانی مکاتبه
update: async (
  id: number,
  data: CommunicationFormData,
  onProgress?: (progress: number) => void
): Promise<Communication> => {
  const formData = new FormData();
  formData.append('topic', data.topic);
  formData.append('sender', data.sender);
  formData.append('receiver', data.receiver);
  formData.append('date', data.date);
  
  // مدیریت فایل پیوست
  if (data.attachment === null) {
    //formData.append('attachment', 'null');
      formData.append('attachment', '');
      console.log('🗑️ درخواست حذف فایل پیوست به API');
  } else if (data.attachment instanceof File) {
    // فایل جدید
    formData.append('attachment', data.attachment);
    console.log('✅ فایل جدید پیوست به API:', data.attachment.name);
  }
  
  // مدیریت فایل نامه
  if (data.lettersfile === null) {
    //formData.append('lettersfile', 'null');
    formData.append('lettersfile', '');
    console.log('🗑️ درخواست حذف فایل نامه به API');
  } else if (data.lettersfile instanceof File) {
    formData.append('lettersfile', data.lettersfile);
  }

  const response = await api.put(`/communications/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
},

  // حذف مکاتبه
  delete: async (id: number): Promise<void> => {
    await api.delete(`/communications/${id}/`);
  },
};

export default api;
