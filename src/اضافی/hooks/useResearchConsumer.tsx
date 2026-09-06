// hooks/useResearchConsumer.ts
import { useGenericCrud } from './useGenericCrud';
import { researchConsumerApi } from 'src/apis/researchConsumerApi';
import type { ResearchConsumer, ResearchConsumerFormData } from '../types';

export const useResearchConsumer = () => {
  return useGenericCrud<ResearchConsumer, ResearchConsumerFormData, ResearchConsumerFormData>(
    researchConsumerApi,
    'researchconsumers',
    {
      successMessages: {
        create: 'مصرف کننده تحقیق با موفقیت اضافه شد',
        update: 'مصرف کننده تحقیق با موفقیت ویرایش شد',
        delete: 'مصرف کننده تحقیق با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};