// hooks/useProjectSubject.ts
import { useGenericCrud } from './useGenericCrud';
import { projectSubjectApi } from 'src/apis/projectSubjectApi';
import type { ProjectSubject, ProjectSubjectFormData } from '../types';

export const useProjectSubject = () => {
  return useGenericCrud<ProjectSubject, ProjectSubjectFormData, ProjectSubjectFormData>(
    projectSubjectApi,
    'projectsubjects',
    {
      successMessages: {
        create: 'موضوع پروژه با موفقیت اضافه شد',
        update: 'موضوع پروژه با موفقیت ویرایش شد',
        delete: 'موضوع پروژه با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};