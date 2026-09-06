import { useGenericCrud } from './useGenericCrud';
import { universityApi } from '../apis/universityApi';
import type { University, UniversityFormData } from '../types';

export const useUniversity = () => {
  const base = useGenericCrud<University, UniversityFormData, UniversityFormData>(
    universityApi,
    'universities',
    {
      successMessages: {
        create: 'دانشگاه با موفقیت اضافه شد',
        update: 'دانشگاه با موفقیت ویرایش شد',
        delete: 'دانشگاه با موفقیت حذف شد',
      },
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  );

  return {
    ...base,
    useItems: base.useItems,
    useItem: base.useItem,
    create: base.create,
    update: base.update,
    delete: base.delete,
    refetch: base.refetch,
    isCreating: base.isCreating,
    isUpdating: base.isUpdating,
    isDeleting: base.isDeleting,
    // متدهای کمکی
    getByCity: universityApi.getByCity.bind(universityApi),
    getByProvince: universityApi.getByProvince.bind(universityApi),
  };
};

