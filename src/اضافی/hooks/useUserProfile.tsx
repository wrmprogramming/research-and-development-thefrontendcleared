// hooks/useUserProfile.ts
import { useGenericCrud } from './useGenericCrud';
import { userProfileApi } from 'src/apis/userProfileApi';
import type { UserProfile, UserProfileFormData } from '../types';

export const useUserProfile = () => {
  return useGenericCrud<UserProfile, UserProfileFormData, UserProfileFormData>(
    userProfileApi,
    'userprofiles',
    {
      successMessages: {
        create: 'پروفایل کاربر با موفقیت اضافه شد',
        update: 'پروفایل کاربر با موفقیت ویرایش شد',
        delete: 'پروفایل کاربر با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};