// src/modules/research-committee/api/researchCommittee.api.ts

import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  ResearchCommittee,
  ResearchCommitteeFormData,
  ResearchCommitteeFilters,
  ResearchCommitteeStats,
  ResearchCommitteePaginatedResponse,
  ResearchApprovement,
} from '../types/researchCommittee.types';

class ResearchCommitteeApi {
  // ==================== Research Committee ====================
  async getAll(params?: ResearchCommitteeFilters): Promise<ResearchCommitteePaginatedResponse> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof ResearchCommitteeFilters];
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          cleanParams[key] = value;
        }
      });
    }
    const response = await axiosClient.get<ResearchCommitteePaginatedResponse>(
      API_ENDPOINTS.RESEARCH_COMMITTEE.BASE,
      { params: cleanParams }
    );
    return response;
  }

  async getById(id: number): Promise<ResearchCommittee> {
    const response = await axiosClient.get<ResearchCommittee>(
      API_ENDPOINTS.RESEARCH_COMMITTEE.DETAIL(id)
    );
    return response;
  }

  async create(data: ResearchCommitteeFormData, onProgress?: (progress: number) => void): Promise<ResearchCommittee> {
    const formData = this.toFormData(data);
    const response = await axiosClient.post<ResearchCommittee>(
      API_ENDPOINTS.RESEARCH_COMMITTEE.BASE,
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

  async update(id: number, data: Partial<ResearchCommitteeFormData>, onProgress?: (progress: number) => void): Promise<ResearchCommittee> {
    const formData = this.toFormData(data as ResearchCommitteeFormData);
    const response = await axiosClient.put<ResearchCommittee>(
      API_ENDPOINTS.RESEARCH_COMMITTEE.DETAIL(id),
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
    await axiosClient.delete<void>(API_ENDPOINTS.RESEARCH_COMMITTEE.DETAIL(id));
  }

  async getStats(year?: number): Promise<ResearchCommitteeStats> {
    const params: Record<string, any> = {};
    if (year) {
      params.year = year;
    }
    const response = await axiosClient.get<ResearchCommitteeStats>(
      `${API_ENDPOINTS.RESEARCH_COMMITTEE.BASE}stats/`,
       { params }
    );
    return response;
  }

  // ==================== Helper Methods ====================
  private toFormData(data: ResearchCommitteeFormData): FormData {
    const formData = new FormData();

    if (data.session_number) formData.append('session_number', data.session_number);
    if (data.date !== undefined && data.date !== null) {
    formData.append('date', data.date);
  } else {
    // ✅ اگر null است، رشته خالی ارسال کن تا بک‌اند مقدار را پاک کند
    formData.append('date', '');
  }
    // if (data.date) formData.append('date', data.date);
    if (data.order) formData.append('order', data.order);

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

export const researchCommitteeApi = new ResearchCommitteeApi();
