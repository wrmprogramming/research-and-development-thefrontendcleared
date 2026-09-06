// services/personApi.ts
import { BaseApiService } from './baseApi';
import type { Person, PersonFormData } from '../types';

const toFormData = (data: PersonFormData): FormData => {
  const formData = new FormData();
  formData.append('firstname', data.firstname);
  formData.append('lastname', data.lastname);
  formData.append('nationalcode', data.nationalcode);
  formData.append('mobilephone', data.mobilephone);
  
  if (data.educationaldegree) formData.append('educationaldegree', data.educationaldegree);
  if (data.jobposition) formData.append('jobposition', data.jobposition);
  if (data.email) formData.append('email', data.email);
  if (data.homeaddress) formData.append('homeaddress', data.homeaddress);
  if (data.homephone) formData.append('homephone', data.homephone);
  if (data.joblocatoionaddress) formData.append('joblocatoionaddress', data.joblocatoionaddress);
  if (data.joblocatoionphone) formData.append('joblocatoionphone', data.joblocatoionphone);
  
  return formData;
};

class PersonApiService extends BaseApiService<Person, PersonFormData, PersonFormData> {
  constructor() {
    super({
      endpoint: '/persons/',
      transformFormData: toFormData,
    });
  }
}

export const personApi = new PersonApiService();