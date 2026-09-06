// src/modules/settlement/api/settlement.api.ts

import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  Settlement,
  SettlementFormData,
  SettlementFilters,
} from '../types/settlement.types';

class SettlementApi {
  // ========== GET Operations ==========

  async getAll(params?: SettlementFilters): Promise<Settlement[]> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof SettlementFilters];
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      });
    }

    const response = await axiosClient.get<Settlement[]>(
      '/settlements/',
      { params: cleanParams }
    );
    return response;
  }

  async getByContract(contractId: number): Promise<Settlement[]> {
    const response = await axiosClient.get<Settlement[]>(
      API_ENDPOINTS.CONTRACT.SETTLEMENTS(contractId)
    );
    return response;
  }

  async getById(id: number): Promise<Settlement> {
    const response = await axiosClient.get<Settlement>(
      `/settlements/${id}/`
    );
    return response;
  }

  // ========== CREATE ==========
  // ✅ مثل مدل Progress: contract_id را به contract تبدیل می‌کنیم
  async create(data: SettlementFormData, onProgress?: (progress: number) => void): Promise<Settlement> {
    const formData = new FormData();

    // ========== فیلدهای متنی ==========
    formData.append('certificate_number', data.certificate_number);
    formData.append('date', data.date);
    if (data.description) formData.append('description', data.description);
    
    // ✅ کلیدی: contract_id را به contract تبدیل می‌کنیم
    formData.append('contract', String(data.contract_id));  // ← اینجا contract است

    // ========== فایل ==========
    if (data.certificate_file === null || data.certificate_file === '') {
      formData.append('certificate_file', '');
    } else if (data.certificate_file instanceof File) {
      formData.append('certificate_file', data.certificate_file);
    }

    // ========== لاگ برای دیباگ ==========
    console.log('📤 Creating Settlement - FormData entries:');
    for (const pair of formData.entries()) {
      console.log(pair[0], ':', pair[1]);
    }

    const response = await axiosClient.post<Settlement>(
      '/settlements/',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return response;
  }

  // ========== UPDATE ==========
  // ✅ مثل مدل Progress
  async update(id: number, data: Partial<SettlementFormData>, onProgress?: (progress: number) => void): Promise<Settlement> {
    const formData = new FormData();

    // ========== فیلدهای متنی ==========
    if (data.certificate_number) formData.append('certificate_number', data.certificate_number);
    if (data.date) formData.append('date', data.date);
    if (data.description) formData.append('description', data.description);
    
    // ✅ کلیدی: contract_id را به contract تبدیل می‌کنیم
    if (data.contract_id !== undefined) {
      formData.append('contract', String(data.contract_id));  // ← اینجا contract است
    }

    // ========== فایل ==========
    if (data.certificate_file === null) {
      formData.append('certificate_file', '');
    } else if (data.certificate_file instanceof File) {
      formData.append('certificate_file', data.certificate_file);
    }

    // ========== لاگ برای دیباگ ==========
    console.log('📤 Updating Settlement - FormData entries:');
    for (const pair of formData.entries()) {
      console.log(pair[0], ':', pair[1]);
    }

    const response = await axiosClient.put<Settlement>(
      `/settlements/${id}/`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return response;
  }

  // ========== DELETE ==========
  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(`/settlements/${id}/`);
  }
}

export const settlementApi = new SettlementApi();