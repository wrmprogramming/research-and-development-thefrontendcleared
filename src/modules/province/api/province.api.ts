// src/modules/province/api/province.api.ts

import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type { Province, ProvinceFormData, ProvinceFilters } from '../types/province.types';
import type { PaginatedResponse } from '../../../types/common.types';

class ProvinceApi {
  // ========== CRUD Operations ==========

  async getAll(params?: ProvinceFilters): Promise<Province[]> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof ProvinceFilters];
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      });
    }
    
    const response = await axiosClient.get<Province[]>(API_ENDPOINTS.PROVINCE.BASE, { 
      params: cleanParams 
    });
    return response;
  }

  async getPaginated(params?: ProvinceFilters & { page?: number; pageSize?: number }): Promise<PaginatedResponse<Province>> {
    const response = await axiosClient.get<PaginatedResponse<Province>>(
      API_ENDPOINTS.PROVINCE.BASE,
      { params }
    );
    return response;
  }

  async getById(id: number): Promise<Province> {
    const response = await axiosClient.get<Province>(API_ENDPOINTS.PROVINCE.DETAIL(id));
    return response;
  }

  async create(data: ProvinceFormData): Promise<Province> {
    const response = await axiosClient.post<Province>(API_ENDPOINTS.PROVINCE.BASE, data);
    return response;
  }

  async update(id: number, data: ProvinceFormData): Promise<Province> {
    const response = await axiosClient.put<Province>(API_ENDPOINTS.PROVINCE.DETAIL(id), data);
    return response;
  }

  async patch(id: number, data: Partial<ProvinceFormData>): Promise<Province> {
    const response = await axiosClient.patch<Province>(API_ENDPOINTS.PROVINCE.DETAIL(id), data);
    return response;
  }

  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.PROVINCE.DETAIL(id));
  }
}

export const provinceApi = new ProvinceApi();



