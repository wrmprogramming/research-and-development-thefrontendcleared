// hooks/useResearchBasicQuestion.ts
import { useGenericCrud } from './useGenericCrud';
import { researchBasicQuestionApi } from 'src/apis/researchBasicQuestionApi';
import type { ResearchBasicQuestion, ResearchBasicQuestionFormData } from '../types';

export const useResearchBasicQuestion = () => {
  return useGenericCrud<ResearchBasicQuestion, ResearchBasicQuestionFormData, ResearchBasicQuestionFormData>(
    researchBasicQuestionApi,
    'researchbasicquestions',
    {
      successMessages: {
        create: 'سوال اساسی تحقیق با موفقیت اضافه شد',
        update: 'سوال اساسی تحقیق با موفقیت ویرایش شد',
        delete: 'سوال اساسی تحقیق با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};