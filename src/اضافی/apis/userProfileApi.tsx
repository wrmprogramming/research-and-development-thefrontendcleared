// services/userProfileApi.ts
import { BaseApiService } from './baseApi';
import type { UserProfile, UserProfileFormData } from '../types';

const toFormData = (data: UserProfileFormData): FormData => {
  const formData = new FormData();
  formData.append('mobile', data.mobile);
  formData.append('nationalcode', data.nationalcode);
  return formData;
};

class UserProfileApiService extends BaseApiService<UserProfile, UserProfileFormData, UserProfileFormData> {
  constructor() {
    super({
      endpoint: '/userprofiles/',
      transformFormData: toFormData,
    });
  }
}

export const userProfileApi = new UserProfileApiService();