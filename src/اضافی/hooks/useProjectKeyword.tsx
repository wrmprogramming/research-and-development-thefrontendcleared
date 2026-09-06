// hooks/useProjectKeyword.ts
import { useGenericCrud } from './useGenericCrud';
import { projectKeywordApi } from 'src/apis/projectKeywordApi';
import type { ProjectKeyword, ProjectKeywordFormData } from '../types';

export const useProjectKeyword = () => {
  return useGenericCrud<ProjectKeyword, ProjectKeywordFormData, ProjectKeywordFormData>(
    projectKeywordApi,
    'projectkeywords',
    {
      successMessages: {
        create: 'کلیدواژه پروژه با موفقیت اضافه شد',
        update: 'کلیدواژه پروژه با موفقیت ویرایش شد',
        delete: 'کلیدواژه پروژه با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};