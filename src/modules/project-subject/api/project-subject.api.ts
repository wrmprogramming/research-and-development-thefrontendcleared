// src/modules/project-subject/api/project-subject.api.ts

import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type { ProjectSubject, ProjectSubjectFormData, ProjectSubjectFilters } from '../types/project-subject.types';
import type { PaginatedResponse } from '../../../types/common.types';

class ProjectSubjectApi {
  // ========== CRUD Operations ==========

  async getAll(params?: ProjectSubjectFilters): Promise<ProjectSubject[]> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof ProjectSubjectFilters];
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      });
    }
    
    const response = await axiosClient.get<ProjectSubject[]>(API_ENDPOINTS.PROJECT_SUBJECT.BASE, { 
      params: cleanParams 
    });
    return response;
  }

  async getPaginated(params?: ProjectSubjectFilters & { page?: number; pageSize?: number }): Promise<PaginatedResponse<ProjectSubject>> {
    const response = await axiosClient.get<PaginatedResponse<ProjectSubject>>(
      API_ENDPOINTS.PROJECT_SUBJECT.BASE,
      { params }
    );
    return response;
  }

  async getById(id: number): Promise<ProjectSubject> {
    const response = await axiosClient.get<ProjectSubject>(API_ENDPOINTS.PROJECT_SUBJECT.DETAIL(id));
    return response;
  }

  async create(data: ProjectSubjectFormData): Promise<ProjectSubject> {
    const response = await axiosClient.post<ProjectSubject>(API_ENDPOINTS.PROJECT_SUBJECT.BASE, data);
    return response;
  }

  async update(id: number, data: ProjectSubjectFormData): Promise<ProjectSubject> {
    const response = await axiosClient.put<ProjectSubject>(API_ENDPOINTS.PROJECT_SUBJECT.DETAIL(id), data);
    return response;
  }

  async patch(id: number, data: Partial<ProjectSubjectFormData>): Promise<ProjectSubject> {
    const response = await axiosClient.patch<ProjectSubject>(API_ENDPOINTS.PROJECT_SUBJECT.DETAIL(id), data);
    return response;
  }

  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.PROJECT_SUBJECT.DETAIL(id));
  }

  // ========== Custom Operations ==========
  async search(query: string): Promise<ProjectSubject[]> {
    return this.getAll({ search: query });
  }
}

export const projectSubjectApi = new ProjectSubjectApi();