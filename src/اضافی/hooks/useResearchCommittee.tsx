// hooks/useResearchCommittee.ts
import { useGenericCrud } from './useGenericCrud';
import { researchCommitteeApi } from 'src/apis/researchCommitteeApi';
import type { ResearchCommittee, ResearchCommitteeFormData } from '../types';

export const useResearchCommittee = () => {
  return useGenericCrud<ResearchCommittee, ResearchCommitteeFormData, ResearchCommitteeFormData>(
    researchCommitteeApi,
    'researchcommittees',
    {
      successMessages: {
        create: 'کمیته تحقیقات با موفقیت اضافه شد',
        update: 'کمیته تحقیقات با موفقیت ویرایش شد',
        delete: 'کمیته تحقیقات با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};