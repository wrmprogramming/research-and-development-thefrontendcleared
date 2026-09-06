// src/modules/person/api/person.api.ts

import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type { 
  Person, 
  PersonFormData, 
  PersonFilters, 
  PersonStats 
} from '../types/person.types';
import type { PaginatedResponse } from '../../../types/common.types';

class PersonApi {
  // ========== CRUD Operations ==========

  async getAll(params?: PersonFilters): Promise<Person[]> {
    const response = await axiosClient.get<Person[]>(API_ENDPOINTS.PERSON.BASE, { params });
    return response;
  }

  async getPaginated(params?: PersonFilters & { page?: number; pageSize?: number }): Promise<PaginatedResponse<Person>> {
    const response = await axiosClient.get<PaginatedResponse<Person>>(
      API_ENDPOINTS.PERSON.BASE, 
      { params }
    );
    return response;
  }

  async getById(id: number): Promise<Person> {
    const response = await axiosClient.get<Person>(API_ENDPOINTS.PERSON.DETAIL(id));
    return response;
  }

  async create(data: PersonFormData, onProgress?: (progress: number) => void): Promise<Person> {
    const formData = this.toFormData(data);
    const response = await axiosClient.post<Person>(
      API_ENDPOINTS.PERSON.BASE,
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

  async update(id: number, data: PersonFormData, onProgress?: (progress: number) => void): Promise<Person> {
    const formData = this.toFormData(data);
    const response = await axiosClient.put<Person>(
      API_ENDPOINTS.PERSON.DETAIL(id),
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

  async patch(id: number, data: Partial<PersonFormData>): Promise<Person> {
    const response = await axiosClient.patch<Person>(API_ENDPOINTS.PERSON.DETAIL(id), data);
    return response;
  }

  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.PERSON.DETAIL(id));
  }

  // ========== Custom Operations ==========

  async search(query: string): Promise<Person[]> {
    return this.getAll({ search: query });
  }

  async getStats(): Promise<PersonStats> {
    const response = await axiosClient.get<PersonStats>(`${API_ENDPOINTS.PERSON.BASE}stats/`);
    return response;
  }

  async getByGender(gender: string): Promise<Person[]> {
    return this.getAll({ gender: gender as any });
  }

  async getByNationalCode(code: string): Promise<Person[]> {
    const response = await axiosClient.get<Person[]>(API_ENDPOINTS.PERSON.BASE, { 
      params: { national_code: code } 
    });
    return response;
  }

  // ========== Helper Methods ==========

  private toFormData(data: PersonFormData): FormData {
    const formData = new FormData();

    // فیلدهای متنی
    formData.append('first_name', data.first_name);
    formData.append('last_name', data.last_name);
    if (data.father_name) formData.append('father_name', data.father_name);
    formData.append('national_code', data.national_code);
    if (data.birth_year) formData.append('birth_year', data.birth_year);
    formData.append('gender', data.gender);
    formData.append('mobile_phone', data.mobile_phone);
    if (data.home_phone) formData.append('home_phone', data.home_phone);
    if (data.work_phone) formData.append('work_phone', data.work_phone);
    if (data.email) formData.append('email', data.email);
    if (data.educational_degree) formData.append('educational_degree', data.educational_degree);
    if (data.field_of_study) formData.append('field_of_study', data.field_of_study);
    if (data.job_position) formData.append('job_position', data.job_position);
    if (data.home_address) formData.append('home_address', data.home_address);
    if (data.work_address) formData.append('work_address', data.work_address);

    // فایل تصویر پروفایل
    if (data.profile_image === null || data.profile_image === '') {
      formData.append('profile_image', '');
    } else if (data.profile_image instanceof File) {
      formData.append('profile_image', data.profile_image);
    }

    return formData;
  }
}

export const personApi = new PersonApi();