// src/apis/communicationApi.tsx

import axios from 'axios';
import type { AxiosProgressEvent } from 'axios';
import type { Communication, CommunicationFormData } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// ========== متد getAll ==========
const getAll = async (): Promise<Communication[]> => {
  console.log('📡 communicationsApi.getAll');
  const response = await api.get('/communications/');
  return response.data;
};

// ========== متد getById ==========
const getById = async (id: number): Promise<Communication> => {
  console.log('📡 communicationsApi.getById:', id);
  const response = await api.get(`/communications/${id}/`);
  return response.data;
};

// ========== متد create ==========
const create = async (
  data: CommunicationFormData,
  onProgress?: (progress: number) => void
): Promise<Communication> => {
  console.log('📡 communicationsApi.create:', data);
  const formData = new FormData();
  
  formData.append('title', data.title || '');
  formData.append('sender', data.sender || '');
  formData.append('receiver', data.receiver || '');
  formData.append('date', data.date || '');
  
  if (data.description) formData.append('description', data.description);
  if (data.send_date) formData.append('send_date', data.send_date);
  if (data.receive_date) formData.append('receive_date', data.receive_date);
  if (data.contractId) formData.append('contract', String(data.contractId));
  if (data.researchId) formData.append('research', String(data.researchId));
  
  if (data.attachment instanceof File) {
    formData.append('attachment', data.attachment);
    console.log('✅ attachment: فایل جدید', data.attachment.name);
  }
  if (data.letter_file instanceof File) {
    formData.append('letter_file', data.letter_file);
    console.log('✅ letter_file: فایل جدید', data.letter_file.name);
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
};

// ========== متد update ==========
const update = async (
  id: number,
  data: CommunicationFormData,
  onProgress?: (progress: number) => void
): Promise<Communication> => {
  console.log('🔥🔥🔥 ===== communicationsApi.update =====');
  console.log('📤 id:', id);
  console.log('📤 data:', data);
  console.log('📤 data.attachment:', data.attachment);
  console.log('📤 data.attachment === null:', data.attachment === null);
  console.log('📤 data.letter_file:', data.letter_file);
  console.log('📤 data.letter_file === null:', data.letter_file === null);

  const formData = new FormData();
  
  // فیلدهای متنی
  formData.append('title', data.title || '');
  formData.append('sender', data.sender || '');
  formData.append('receiver', data.receiver || '');
  formData.append('date', data.date || '');
  
  if (data.description) formData.append('description', data.description);
  if (data.send_date) formData.append('send_date', data.send_date);
  if (data.receive_date) formData.append('receive_date', data.receive_date);
  if (data.contractId) formData.append('contract', String(data.contractId));
  if (data.researchId) formData.append('research', String(data.researchId));

  // ✅ مدیریت attachment
  if (data.attachment instanceof File) {
    formData.append('attachment', data.attachment);
    console.log('✅ attachment: فایل جدید', data.attachment.name);
  } else if (data.attachment === null) {
    formData.append('attachment', 'null');
    console.log('🗑️ attachment: حذف (ارسال null)');
  } else {
    console.log('⏭️ attachment: نگهداری (ارسال نشد)');
  }

  // ✅ مدیریت letter_file
  if (data.letter_file instanceof File) {
    formData.append('letter_file', data.letter_file);
    console.log('✅ letter_file: فایل جدید', data.letter_file.name);
  } else if (data.letter_file === null) {
    formData.append('letter_file', 'null');
    console.log('🗑️ letter_file: حذف (ارسال null)');
  } else {
    console.log('⏭️ letter_file: نگهداری (ارسال نشد)');
  }

  console.log('📤 Final FormData:');
  for (const pair of formData.entries()) {
    if (pair[1] instanceof File) {
      console.log(`  ${pair[0]}: File(${pair[1].name})`);
    } else {
      console.log(`  ${pair[0]}: ${pair[1]}`);
    }
  }

  const response = await api.put(`/communications/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  
  console.log('🔥🔥🔥 Update response:', response.data);
  return response.data;
};

// ========== متد delete ==========
const deleteItem = async (id: number): Promise<void> => {
  console.log('📡 communicationsApi.delete:', id);
  await api.delete(`/communications/${id}/`);
};

// ========== ✅ Export نهایی ==========
export const communicationsApi = {
  getAll,
  getById,
  create,
  update,
  delete: deleteItem,
};

console.log('🔥 communicationsApi exported:', communicationsApi);

export default communicationsApi;