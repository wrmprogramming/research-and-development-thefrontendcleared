// services/proposalApi.ts
import { BaseApiService } from './baseApi';
import type { Proposal, ProposalFormData } from '../types';

const toFormData = (data: ProposalFormData): FormData => {
  const formData = new FormData();
  formData.append('code', data.code);
  formData.append('projecttitlefarsi', data.projecttitlefarsi);
  if (data.projecttitleenglish) formData.append('projecttitleenglish', data.projecttitleenglish);
  formData.append('approveddate', data.approveddate);
  formData.append('executionlocation', data.executionlocation);
  formData.append('executiontime', data.executiontime.toString());
  formData.append('iswinner', data.iswinner.toString());
  formData.append('projectsubjectcodeId', data.projectsubjectcodeId.toString());
  formData.append('universityId', data.universityId.toString());
  formData.append('primaryresearcherId', data.primaryresearcherId.toString());
  
  if (data.companyId) formData.append('companyId', data.companyId.toString());
  if (data.rfpId) formData.append('rfpId', data.rfpId.toString());
  
  if (data.attachment === null) {
    formData.append('attachment', '');
  } else if (data.attachment instanceof File) {
    formData.append('attachment', data.attachment);
  }
  
  return formData;
};

class ProposalApiService extends BaseApiService<Proposal, ProposalFormData, ProposalFormData> {
  constructor() {
    super({
      endpoint: '/proposals/',
      transformFormData: toFormData,
    });
  }
}

export const proposalApi = new ProposalApiService();