// src/modules/company/api/company.api.ts

import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type { Company, CompanyFormData, CompanyFilters, CompanyStats } from '../types/company.types';
import type { PaginatedResponse } from '../../../types/common.types';

class CompanyApi {
  // ========== CRUD Operations ==========

  async getAll(params?: CompanyFilters): Promise<Company[]> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof CompanyFilters];
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      });
    }
    
    const response = await axiosClient.get<Company[]>(API_ENDPOINTS.COMPANY.BASE, { 
      params: cleanParams 
    });
    return response;
  }

  async getPaginated(params?: CompanyFilters & { page?: number; pageSize?: number }): Promise<PaginatedResponse<Company>> {
    const response = await axiosClient.get<PaginatedResponse<Company>>(
      API_ENDPOINTS.COMPANY.BASE,
      { params }
    );
    return response;
  }

  async getById(id: number): Promise<Company> {
    const response = await axiosClient.get<Company>(API_ENDPOINTS.COMPANY.DETAIL(id));
    return response;
  }

  async create(data: CompanyFormData): Promise<Company> {
    const response = await axiosClient.post<Company>(API_ENDPOINTS.COMPANY.BASE, data);
    return response;
  }

  async update(id: number, data: CompanyFormData): Promise<Company> {
    const response = await axiosClient.put<Company>(API_ENDPOINTS.COMPANY.DETAIL(id), data);
    return response;
  }

  async patch(id: number, data: Partial<CompanyFormData>): Promise<Company> {
    const response = await axiosClient.patch<Company>(API_ENDPOINTS.COMPANY.DETAIL(id), data);
    return response;
  }

  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.COMPANY.DETAIL(id));
  }

  // ========== Stats ==========
  async getStats(): Promise<CompanyStats> {
    const response = await axiosClient.get<CompanyStats>(`${API_ENDPOINTS.COMPANY.BASE}stats/`);
    return response;
  }

  // ========== Custom Operations ==========
  async getByProvince(provinceId: number): Promise<Company[]> {
    return this.getAll({ province: provinceId });
  }
}

export const companyApi = new CompanyApi();

