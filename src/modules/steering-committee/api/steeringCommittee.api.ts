// src/modules/steering-committee/api/steeringCommittee.api.ts

import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  SteeringCommittee,
  SteeringCommitteeFormData,
  SteeringCommitteeFilters,
  SteeringCommitteeStats,
  SteeringCommitteePaginatedResponse,
} from '../types/steeringCommittee.types';

class SteeringCommitteeApi {
  // ==================== Steering Committee ====================
  async getAll(params?: SteeringCommitteeFilters): Promise<SteeringCommitteePaginatedResponse> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof SteeringCommitteeFilters];
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          cleanParams[key] = value;
        }
      });
    }
    const response = await axiosClient.get<SteeringCommitteePaginatedResponse>(
      API_ENDPOINTS.STEERING_COMMITTEE.BASE,
      { params: cleanParams }
    );
    return response;
  }

  async getById(id: number): Promise<SteeringCommittee> {
    const response = await axiosClient.get<SteeringCommittee>(
      API_ENDPOINTS.STEERING_COMMITTEE.DETAIL(id)
    );
    return response;
  }

  async create(data: SteeringCommitteeFormData, onProgress?: (progress: number) => void): Promise<SteeringCommittee> {
    const formData = this.toFormData(data);
    const response = await axiosClient.post<SteeringCommittee>(
      API_ENDPOINTS.STEERING_COMMITTEE.BASE,
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

  async update(id: number, data: Partial<SteeringCommitteeFormData>, onProgress?: (progress: number) => void): Promise<SteeringCommittee> {
    const formData = this.toFormData(data as SteeringCommitteeFormData);
    const response = await axiosClient.put<SteeringCommittee>(
      API_ENDPOINTS.STEERING_COMMITTEE.DETAIL(id),
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

  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.STEERING_COMMITTEE.DETAIL(id));
  }

  async getStats(year?: number): Promise<SteeringCommitteeStats> {
    const params: Record<string, any> = {};
    if (year) {
      params.year = year;
    }
    const response = await axiosClient.get<SteeringCommitteeStats>(
      `${API_ENDPOINTS.STEERING_COMMITTEE.BASE}stats/`,
      { params }
    );
    return response;
  }

  // ==================== Helper Methods ====================
  private toFormData(data: SteeringCommitteeFormData): FormData {
    const formData = new FormData();

    if (data.session_number) formData.append('session_number', data.session_number);
    if (data.date !== undefined && data.date !== null) {
      formData.append('date', data.date);
    } else {
      formData.append('date', '');
    }
    if (data.description) formData.append('description', data.description);
    
    // ✅ research_id اختیاری
    if (data.research_id) {
      formData.append('research', String(data.research_id));
    }

    // فایل‌ها
    if (data.minutes_file instanceof File) {
      formData.append('minutes_file', data.minutes_file);
    } else if (data.minutes_file === null) {
      formData.append('minutes_file', '');
    }

    if (data.attachment instanceof File) {
      formData.append('attachment', data.attachment);
    } else if (data.attachment === null) {
      formData.append('attachment', '');
    }

    // مصوبات
    if (data.approvements && data.approvements.length > 0) {
      const validApprovements = data.approvements.filter(
        (a) => a.description?.trim() || a.responsible?.trim()
      );
      if (validApprovements.length > 0) {
        formData.append('approvements', JSON.stringify(validApprovements));
      }
    }

    return formData;
  }
}

export const steeringCommitteeApi = new SteeringCommitteeApi();

