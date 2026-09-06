// src/modules/university-type/api/university-type.api.ts
import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type { UniversityType, UniversityTypeFormData, UniversityTypeFilters } from '../types/university-type.types';

class UniversityTypeApi {
  // ========== CRUD Operations ==========

  async getAll(params?: UniversityTypeFilters): Promise<UniversityType[]> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof UniversityTypeFilters];
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      });
    }
    
    const response = await axiosClient.get<UniversityType[]>(API_ENDPOINTS.UNIVERSITY_TYPE.BASE, { 
      params: cleanParams 
    });
    return response;
  }

  async getById(id: number): Promise<UniversityType> {
    const response = await axiosClient.get<UniversityType>(API_ENDPOINTS.UNIVERSITY_TYPE.DETAIL(id));
    return response;
  }

  async create(data: UniversityTypeFormData): Promise<UniversityType> {
    const payload: any = {
      name: data.name,
    };
    
    if (data.code) payload.code = data.code;
    if (data.description) payload.description = data.description;

    console.log('📤 UniversityTypeApi.create - payload:', payload);

    const response = await axiosClient.post<UniversityType>(API_ENDPOINTS.UNIVERSITY_TYPE.BASE, payload);
    return response;
  }

  async update(id: number, data: UniversityTypeFormData): Promise<UniversityType> {
    const payload: any = {
      name: data.name,
    };
    
    if (data.code !== undefined) payload.code = data.code;
    if (data.description !== undefined) payload.description = data.description;

    console.log('📤 UniversityTypeApi.update - payload:', payload);

    const response = await axiosClient.put<UniversityType>(API_ENDPOINTS.UNIVERSITY_TYPE.DETAIL(id), payload);
    return response;
  }

  async patch(id: number, data: Partial<UniversityTypeFormData>): Promise<UniversityType> {
    const response = await axiosClient.patch<UniversityType>(API_ENDPOINTS.UNIVERSITY_TYPE.DETAIL(id), data);
    return response;
  }

  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.UNIVERSITY_TYPE.DETAIL(id));
  }
}

export const universityTypeApi = new UniversityTypeApi();