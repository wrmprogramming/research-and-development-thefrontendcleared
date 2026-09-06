// src/hooks/useUniversityType.ts
import { useGenericCrud } from './useGenericCrud';
import { universityTypeApi } from '../apis/universityTypeApi';
import type { UniversityType } from '../types';

export const useUniversityType = () => {
  const base = useGenericCrud<UniversityType, { name: string }, { name: string }>(
    universityTypeApi,
    'university-types',
    {
      successMessages: {
        create: 'نوع دانشگاه با موفقیت اضافه شد',
        update: 'نوع دانشگاه با موفقیت ویرایش شد',
        delete: 'نوع دانشگاه با موفقیت حذف شد',
      },
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  );

  return {
    ...base,
    useItems: base.useItems,
    create: base.create,
    update: base.update,
    delete: base.delete,
    refetch: base.refetch,
  };
};
// // src/hooks/useUniversityType.ts
// import { useGenericCrud } from './useGenericCrud';
// import { universityTypeApi } from '../services/universityTypeApi';
// import type { UniversityType, UniversityTypeFormData } from '../types';

// export const useUniversityType = () => {
//   return useGenericCrud<UniversityType, UniversityTypeFormData, UniversityTypeFormData>(
//     universityTypeApi,
//     'university-types',
//     {
//       successMessages: {
//         create: 'نوع دانشگاه با موفقیت اضافه شد',
//         update: 'نوع دانشگاه با موفقیت ویرایش شد',
//         delete: 'نوع دانشگاه با موفقیت حذف شد',
//       },
//       staleTime: 5 * 60 * 1000,
//       retry: 2,
//     }
//   );
// };
// // hooks/useUniversityType.ts

// import { useGenericCrud } from './useGenericCrud';
// import { BaseApiService } from '@services/baseApi';
// import type { UniversityType, UniversityTypeFormData } from '../types';

// class UniversityTypeApiService extends BaseApiService<UniversityType, UniversityTypeFormData, UniversityTypeFormData> {
//   constructor() {
//     super({ endpoint: '/universitytype/' });
//   }
// }

// const universityTypeApi = new UniversityTypeApiService();

// export const useUniversityType = () => {
//   return useGenericCrud<UniversityType, UniversityTypeFormData, UniversityTypeFormData>(
//     universityTypeApi,
//     'universitytype',
//     {
//       successMessages: {
//         create: 'نوع دانشگاه با موفقیت اضافه شد',
//         update: 'نوع دانشگاه با موفقیت ویرایش شد',
//         delete: 'نوع دانشگاه با موفقیت حذف شد',
//       },
//     }
//   );
// };
