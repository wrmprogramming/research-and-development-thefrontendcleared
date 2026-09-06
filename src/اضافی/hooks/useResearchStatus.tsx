// hooks/useResearchStatus.ts
import { useGenericCrud } from './useGenericCrud';
import { researchStatusApi } from 'src/apis/researchStatusApi';
import type { ResearchStatus, ResearchStatusFormData } from '../types';

export const useResearchStatus = () => {
  return useGenericCrud<ResearchStatus, ResearchStatusFormData, ResearchStatusFormData>(
    researchStatusApi,
    'researchstatuses',
    {
      successMessages: {
        create: 'وضعیت پژوهش با موفقیت اضافه شد',
        update: 'وضعیت پژوهش با موفقیت ویرایش شد',
        delete: 'وضعیت پژوهش با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};