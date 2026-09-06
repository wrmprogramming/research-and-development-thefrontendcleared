// services/projectKeywordApi.ts
import { BaseApiService } from './baseApi';
import type { ProjectKeyword, ProjectKeywordFormData } from '../types';

const toFormData = (data: ProjectKeywordFormData): FormData => {
  const formData = new FormData();
  formData.append('farsiname', data.farsiname);
  if (data.englishname) formData.append('englishname', data.englishname);
  formData.append('proposalId', data.proposalId.toString());
  return formData;
};

class ProjectKeywordApiService extends BaseApiService<ProjectKeyword, ProjectKeywordFormData, ProjectKeywordFormData> {
  constructor() {
    super({
      endpoint: '/projectkeywords/',
      transformFormData: toFormData,
    });
  }
}

export const projectKeywordApi = new ProjectKeywordApiService();