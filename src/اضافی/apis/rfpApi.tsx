// services/rfpApi.ts
import { BaseApiService } from './baseApi';
import type { Rfp, RfpFormData } from '../types';

const toFormData = (data: RfpFormData): FormData => {
  const formData = new FormData();
  formData.append('topic', data.topic);
  if (data.description) formData.append('description', data.description);
  formData.append('estimatedprice', data.estimatedprice);
  formData.append('approximateprojecttime', data.approximateprojecttime.toString());
  formData.append('necessitydeclaration', data.necessitydeclaration);
  formData.append('solutionexactdefinition', data.solutionexactdefinition);
  formData.append('researchId', data.researchId.toString());
  
  if (data.attachment === null) {
    formData.append('attachment', '');
  } else if (data.attachment instanceof File) {
    formData.append('attachment', data.attachment);
  }
  
  return formData;
};

class RfpApiService extends BaseApiService<Rfp, RfpFormData, RfpFormData> {
  constructor() {
    super({
      endpoint: '/rfps/',
      transformFormData: toFormData,
    });
  }
}

export const rfpApi = new RfpApiService();