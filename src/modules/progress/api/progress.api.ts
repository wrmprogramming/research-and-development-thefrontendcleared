// src/modules/progress/api/progress.api.ts

import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  Progress,
  ProgressFormData,
  ProgressStats,
  ProgressFilters,
} from '../types/progress.types';
import type { PaginatedResponse } from '../../../types/common.types';


class ProgressApi {
  // ==================== CRUD Operations ====================

async getAll(params?: ProgressFilters): Promise<PaginatedResponse<Progress>> {
    const response = await axiosClient.get<PaginatedResponse<Progress>>(
      API_ENDPOINTS.PROGRESS.BASE,
      { params }
    );
    return response;
  }


  async getById(id: number): Promise<Progress> {
    const response = await axiosClient.get<Progress>(API_ENDPOINTS.PROGRESS.DETAIL(id));
    return response;
  }

  async getByContract(contractId: number, params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<Progress>> {
    const response = await axiosClient.get<PaginatedResponse<Progress>>(
      API_ENDPOINTS.PROGRESS.BY_CONTRACT(contractId),
      { params }
    );
    return response;
  }

  async getLatestByContract(contractId: number): Promise<Progress | null> {
    const response = await axiosClient.get<Progress[]>(API_ENDPOINTS.PROGRESS.BY_CONTRACT(contractId));
    return response.data.length > 0 ? response.data[0] : null;
  }

  async create(data: ProgressFormData): Promise<Progress> {
   
    const payload = {
      physical_progress_percentage: data.physical_progress_percentage,
      registered_date: data.registered_date,
      notes: data.notes || '',
      contract_id: data.contract_id,
      steering_committee: data.steering_committee_id || null,
    };
     if (data.registered_date !== undefined && data.registered_date !== null) {
    payload.registered_date = data.registered_date;
  } else {
    //  اگر null است، رشته خالی ارسال کن تا بک‌اند مقدار را پاک کند
        payload.registered_date = '';
  }
    const response = await axiosClient.post<Progress>(API_ENDPOINTS.PROGRESS.BASE, payload);
    return response;
  }

 
  async update(id: number, data: Partial<ProgressFormData>): Promise<Progress> {
    const payload = {
      physical_progress_percentage: data.physical_progress_percentage,
      registered_date: data.registered_date,
      notes: data.notes || '',
      contract_id: data.contract_id,
      steering_committee: data.steering_committee_id || null,
    };
       if (data.registered_date !== undefined && data.registered_date !== null) {
    payload.registered_date = data.registered_date;
  } else {
    //  اگر null است، رشته خالی ارسال کن تا بک‌اند مقدار را پاک کند
        payload.registered_date = '';
  }
    const response = await axiosClient.put<Progress>(API_ENDPOINTS.PROGRESS.DETAIL(id), payload);
    return response;
  }

  async patch(id: number, data: Partial<ProgressFormData>): Promise<Progress> {
    const response = await axiosClient.patch<Progress>(API_ENDPOINTS.PROGRESS.DETAIL(id), data);
    return response;
  }

  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.PROGRESS.DETAIL(id));
  }

  // ==================== Stats ====================

  async getStats(params?: { contract?: number; year?: number }): Promise<ProgressStats> {
    const response = await axiosClient.get<ProgressStats>(`${API_ENDPOINTS.PROGRESS.BASE}stats/`, { params });
    return response;
  }
}

export const progressApi = new ProgressApi();
