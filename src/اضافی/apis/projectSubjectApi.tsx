// services/projectSubjectApi.ts
import { BaseApiService } from './baseApi';
import type { ProjectSubject, ProjectSubjectFormData } from '../types';

const toFormData = (data: ProjectSubjectFormData): FormData => {
  const formData = new FormData();
  formData.append('name', data.name);
  return formData;
};

class ProjectSubjectApiService extends BaseApiService<ProjectSubject, ProjectSubjectFormData, ProjectSubjectFormData> {
  constructor() {
    super({
      endpoint: '/projectsubjects/',
      transformFormData: toFormData,
    });
  }
}

export const projectSubjectApi = new ProjectSubjectApiService();