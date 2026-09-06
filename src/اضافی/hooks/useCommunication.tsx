// src/hooks/useCommunication.ts

import { useGenericCrud } from './useGenericCrud';
import type { Communication, CommunicationFormData } from '../types';
import communicationsApi from '../apis/communicationApi';

export const useCommunication = () => {
  console.log('🔥🔥🔥 useCommunication CREATED');
  console.log('🔥🔥🔥 communicationsApi.update exists?', typeof communicationsApi.update);
  
  const base = useGenericCrud<Communication, CommunicationFormData, CommunicationFormData>(
    communicationsApi,
    'communications',
    {
      successMessages: {
        create: 'ارتباط با موفقیت اضافه شد',
        update: 'ارتباط با موفقیت ویرایش شد',
        delete: 'ارتباط با موفقیت حذف شد',
      },
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  );

  // ✅ لاگ برای update
  const originalUpdate = base.update;
  const wrappedUpdate = async (id: number, data: any, onProgress?: (p: number) => void) => {
    console.log('🔥🔥🔥🔥🔥 useCommunication.update CALLED');
    console.log('📤 id:', id);
    console.log('📤 data:', data);
    console.log('📤 data.attachment:', data?.attachment);
    console.log('📤 data.attachment === null:', data?.attachment === null);
    console.log('📤 data.letter_file:', data?.letter_file);
    console.log('📤 data.letter_file === null:', data?.letter_file === null);
    
    const result = await originalUpdate(id, data, onProgress);
    console.log('🔥🔥🔥🔥🔥 useCommunication.update RESULT:', result);
    return result;
  };

  return {
    ...base,
    update: wrappedUpdate,
    useItems: base.useItems,
    useItem: base.useItem,
    create: base.create,
    delete: base.delete,
    refetch: base.refetch,
    isCreating: base.isCreating,
    isUpdating: base.isUpdating,
    isDeleting: base.isDeleting,
  };
};
// // src/hooks/useCommunication.ts
// import { useGenericCrud } from './useGenericCrud';
// import { communicationApi } from '../apis/communicationApi';
// import type { Communication, CommunicationFormData } from '../types';

// export const useCommunication = () => {
//   const base = useGenericCrud<Communication, CommunicationFormData, CommunicationFormData>(
//     communicationApi,
//     'communications',
//     {
//       successMessages: {
//         create: 'ارتباط با موفقیت اضافه شد',
//         update: 'ارتباط با موفقیت ویرایش شد',
//         delete: 'ارتباط با موفقیت حذف شد',
//       },
//       staleTime: 5 * 60 * 1000,
//       retry: 2,
//     }
//   );

//   return {
//     ...base,
//     // ✅ اطمینان از اینکه useItems در دسترس است
//     useItems: base.useItems,
//     useItem: base.useItem,
//     create: base.create,
//     update: base.update,
//     delete: base.delete,
//     refetch: base.refetch,
//     isCreating: base.isCreating,
//     isUpdating: base.isUpdating,
//     isDeleting: base.isDeleting,
//   };
// };
