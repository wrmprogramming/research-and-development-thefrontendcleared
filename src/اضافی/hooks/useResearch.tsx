// hooks/useResearch.ts
import { useGenericCrud } from './useGenericCrud';
import { researchApi } from 'src/apis/researchApi';
import type { Research, ResearchFormData } from '../types';

export const useResearch = () => {
  return useGenericCrud<Research, ResearchFormData, ResearchFormData>(
    researchApi,
    'researches',
    {
      successMessages: {
        create: 'پژوهش با موفقیت اضافه شد',
        update: 'پژوهش با موفقیت ویرایش شد',
        delete: 'پژوهش با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};