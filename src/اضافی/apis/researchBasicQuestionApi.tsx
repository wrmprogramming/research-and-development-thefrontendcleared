// services/researchBasicQuestionApi.ts
import { BaseApiService } from './baseApi';
import type { ResearchBasicQuestion, ResearchBasicQuestionFormData } from '../types';

const toFormData = (data: ResearchBasicQuestionFormData): FormData => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('rfpId', data.rfpId.toString());
  return formData;
};

class ResearchBasicQuestionApiService extends BaseApiService<ResearchBasicQuestion, ResearchBasicQuestionFormData, ResearchBasicQuestionFormData> {
  constructor() {
    super({
      endpoint: '/researchbasicquestions/',
      transformFormData: toFormData,
    });
  }
}

export const researchBasicQuestionApi = new ResearchBasicQuestionApiService();