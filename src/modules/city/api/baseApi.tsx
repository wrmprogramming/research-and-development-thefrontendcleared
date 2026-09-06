// src/apis/baseApi.ts

import axios from 'axios';
import type { AxiosProgressEvent, AxiosInstance, AxiosRequestConfig } from 'axios';

// ========== تنظیمات پویا ==========
let currentBaseURL = import.meta.env.VITE_API_URL || 'http://172.18.5.77:8000/api';

export const setBaseURL = (url: string) => {
  currentBaseURL = url;
  api.defaults.baseURL = currentBaseURL;
};

export const getBaseURL = () => currentBaseURL;

// ========== ایجاد Api Client ==========
const api: AxiosInstance = axios.create({
  baseURL: currentBaseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor برای اضافه کردن Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Interceptor برای مدیریت خطاهای 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== Generic Interfaces ==========
export interface IBaseModel {
  id: number;
  created_at?: string;
  updated_at?: string;
}

export interface IApiConfig<T extends IBaseModel, TCreate, TUpdate> {
  endpoint: string;
  transformFormData?: (data: TCreate | TUpdate) => FormData;
  transformResponse?: (data: any) => T;
}

// ========== Generic Base Service ==========
export class BaseApiService<T extends IBaseModel, TCreate, TUpdate> {
  protected endpoint: string;
  protected transformFormData?: (data: TCreate | TUpdate) => FormData;
  protected transformResponse?: (data: any) => T;

  constructor(config: IApiConfig<T, TCreate, TUpdate>) {
    this.endpoint = config.endpoint;
    this.transformFormData = config.transformFormData;
    this.transformResponse = config.transformResponse;
  }

  async getAll(params?: Record<string, any>): Promise<T[]> {
    console.log(`📤 BaseApiService[${this.endpoint}].getAll:`, params);
    const response = await api.get(this.endpoint, { params });
    if (response.data.results) {
      return response.data.results;
    }
    return response.data;
  }

  async getWithPagination(params?: Record<string, any>): Promise<{ results: T[]; count: number; next?: string; previous?: string }> {
    console.log(`📤 BaseApiService[${this.endpoint}].getWithPagination:`, params);
    const response = await api.get(this.endpoint, { params });
    return response.data;
  }

  async getById(id: number): Promise<T> {
    console.log(`📤 BaseApiService[${this.endpoint}].getById:`, id);
    const response = await api.get(`${this.endpoint}${id}/`);
    return this.transformResponse ? this.transformResponse(response.data) : response.data;
  }

  async create(data: TCreate, onProgress?: (progress: number) => void): Promise<T> {
    console.log(`📤 BaseApiService[${this.endpoint}].create:`, data);
    const requestData = this.transformFormData ? this.transformFormData(data) : (data as any);
    const isFormData = requestData instanceof FormData;
    
    const config: AxiosRequestConfig = {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    };
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      };
    }
    
    const response = await api.post(this.endpoint, requestData, config);
    return this.transformResponse ? this.transformResponse(response.data) : response.data;
  }

  async update(id: number, data: TUpdate, onProgress?: (progress: number) => void): Promise<T> {
    console.log(`📤 BaseApiService[${this.endpoint}].update:`, { id, data });
    console.log('📤 data.attachment:', (data as any).attachment);
    console.log('📤 data.attachment === null:', (data as any).attachment === null);
    
    const requestData = this.transformFormData ? this.transformFormData(data) : (data as any);
    const isFormData = requestData instanceof FormData;
    
    console.log('📤 requestData:', requestData);
    console.log('📤 requestData.attachment:', (requestData as any).attachment);
    
    const config: AxiosRequestConfig = {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    };
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      };
    }
    
    const response = await api.put(`${this.endpoint}${id}/`, requestData, config);
    return this.transformResponse ? this.transformResponse(response.data) : response.data;
  }

  async patch(id: number, data: Partial<TUpdate>, onProgress?: (progress: number) => void): Promise<T> {
    console.log(`📤 BaseApiService[${this.endpoint}].patch:`, { id, data });
    const requestData = this.transformFormData ? this.transformFormData(data as TUpdate) : (data as any);
    const isFormData = requestData instanceof FormData;
    
    const config: AxiosRequestConfig = {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    };
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      };
    }
    
    const response = await api.patch(`${this.endpoint}${id}/`, requestData, config);
    return this.transformResponse ? this.transformResponse(response.data) : response.data;
  }

  async delete(id: number): Promise<void> {
    console.log(`📤 BaseApiService[${this.endpoint}].delete:`, id);
    await api.delete(`${this.endpoint}${id}/`);
  }
}

export { api };