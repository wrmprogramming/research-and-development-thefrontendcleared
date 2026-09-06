// services/contractApi.ts
import { BaseApiService } from './baseApi';
import type { Contract, ContractFormData } from '../types';

const toFormData = (data: ContractFormData): FormData => {
  const formData = new FormData();
  formData.append('date', data.date);
  formData.append('subject', data.subject);
  if (data.documents) formData.append('documents', data.documents);
  formData.append('duration', data.duration.toString());
  formData.append('totalamount', data.totalamount.toString());
  if (data.commitments) formData.append('commitments', data.commitments);
  if (data.address) formData.append('address', data.address);
  if (data.servicesdescription) formData.append('servicesdescription', data.servicesdescription);
  formData.append('startdate', data.startdate);
  formData.append('enddate', data.enddate);
  formData.append('contractversionsnumber', data.contractversionsnumber.toString());
  formData.append('isarchive', data.isarchive.toString());
  formData.append('companyId', data.companyId.toString());
  formData.append('universityId', data.universityId.toString());
  
  if (data.contractfile === null) {
    formData.append('contractfile', '');
  } else if (data.contractfile instanceof File) {
    formData.append('contractfile', data.contractfile);
  }
  
  if (data.certificatefile === null) {
    formData.append('certificatefile', '');
  } else if (data.certificatefile instanceof File) {
    formData.append('certificatefile', data.certificatefile);
  }
  
  if (data.declarationletterfile === null) {
    formData.append('declarationletterfile', '');
  } else if (data.declarationletterfile instanceof File) {
    formData.append('declarationletterfile', data.declarationletterfile);
  }
  
  if (data.endletterfile === null) {
    formData.append('endletterfile', '');
  } else if (data.endletterfile instanceof File) {
    formData.append('endletterfile', data.endletterfile);
  }
  
  if (data.extentionfile === null) {
    formData.append('extentionfile', '');
  } else if (data.extentionfile instanceof File) {
    formData.append('extentionfile', data.extentionfile);
  }
  
  return formData;
};

class ContractApiService extends BaseApiService<Contract, ContractFormData, ContractFormData> {
  constructor() {
    super({
      endpoint: '/contracts/',
      transformFormData: toFormData,
    });
  }
}

export const contractApi = new ContractApiService();