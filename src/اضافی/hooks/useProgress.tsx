// hooks/useProgress.ts
import { useGenericCrud } from './useGenericCrud';
import { progressApi } from 'src/apis/progressApi';
import type { Progress, ProgressFormData } from '../types';

export const useProgress = () => {
  return useGenericCrud<Progress, ProgressFormData, ProgressFormData>(
    progressApi,
    'progresses',
    {
      successMessages: {
        create: 'پیشرفت با موفقیت اضافه شد',
        update: 'پیشرفت با موفقیت ویرایش شد',
        delete: 'پیشرفت با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};