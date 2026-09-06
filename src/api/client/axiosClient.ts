// src/api/client/axiosClient.ts

import axios, { 
  type AxiosInstance, 
  type AxiosRequestConfig, 
  type AxiosResponse, 
  AxiosError 
} from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../endpoints';
import type { ApiResponse, ApiError } from '../../core/types/api.types';

class AxiosClient {
  private static instance: AxiosClient;
  private client: AxiosInstance;

  private constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://172.18.5.77:8000/api/v1',
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): AxiosClient {
    if (!AxiosClient.instance) {
      AxiosClient.instance = new AxiosClient();
    }
    return AxiosClient.instance;
  }

  private setupInterceptors(): void {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        const apiResponse: ApiResponse = {
          success: true,
          data: response.data,
          message: response.data?.message || 'عملیات با موفقیت انجام شد',
        };
        return { ...response, data: apiResponse };
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.client.post(API_ENDPOINTS.AUTH.REFRESH, {
                refresh: refreshToken,
              });
              const { access } = response.data;
              localStorage.setItem('access_token', access);
              originalRequest.headers!.Authorization = `Bearer ${access}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        }

        const apiError: ApiError = {
          success: false,
          message: (error.response?.data as any)?.message || error.message || 'خطا در ارتباط با سرور',
          status: error.response?.status || 500,
          errors: (error.response?.data as any)?.errors || {},
        };

        return Promise.reject(apiError);
      }
    );
  }

  // ========== متدهای عمومی ==========

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return (response.data as any).data || response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return (response.data as any).data || response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return (response.data as any).data || response.data;
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return (response.data as any).data || response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return (response.data as any).data || response.data;
  }

  public async upload<T>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    };

    const response = await this.client.post<T>(url, formData, config);
    return (response.data as any).data || response.data;
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

export const axiosClient = AxiosClient.getInstance();
