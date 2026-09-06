
// src/modules/city/hooks/useCity.ts

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cityApi } from '../api/city.api';
import type { City, CityFormData, CityFilters, TreeNode } from '../types/city.types';
import { toast } from 'react-hot-toast';

const CITY_KEYS = {
  all: ['cities'] as const,
  lists: () => [...CITY_KEYS.all, 'list'] as const,
  list: (filters?: CityFilters) => [...CITY_KEYS.lists(), filters] as const,
  tree: () => [...CITY_KEYS.all, 'tree'] as const,
  details: () => [...CITY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...CITY_KEYS.details(), id] as const,
  stats: () => [...CITY_KEYS.all, 'stats'] as const,
};

export const useCity = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ========== Queries ==========

  const useList = (filters?: CityFilters) => {
    return useQuery({
      queryKey: CITY_KEYS.list(filters),
      queryFn: () => cityApi.getAll(filters),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useTree = () => {
    return useQuery({
      queryKey: CITY_KEYS.tree(),
      queryFn: () => cityApi.getTreeData(),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useItem = (id: number) => {
    return useQuery({
      queryKey: CITY_KEYS.detail(id),
      queryFn: () => cityApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useStats = () => {
    return useQuery({
      queryKey: CITY_KEYS.stats(),
      queryFn: async () => {
        const treeData = await cityApi.getTreeData();
        const totalProvinces = treeData.length;
        const totalCities = treeData.reduce((acc, p) => acc + (p.children?.length || 0), 0);
        return {
          total_provinces: totalProvinces,
          total_cities: totalCities,
        };
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  // ========== Mutations ==========

  const createMutation = useMutation({
    mutationFn: (data: CityFormData) => cityApi.create(data),
    onMutate: () => setIsCreating(true),
    onSuccess: () => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: CITY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CITY_KEYS.tree() });
      queryClient.invalidateQueries({ queryKey: CITY_KEYS.stats() });
      toast.success('با موفقیت اضافه شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.message || 'خطا در ایجاد');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CityFormData }) =>
      cityApi.update(id, data),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: CITY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CITY_KEYS.tree() });
      queryClient.invalidateQueries({ queryKey: CITY_KEYS.stats() });
      
      // ✅ رفرش اجباری داده‌های درختی
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: CITY_KEYS.tree() });
        queryClient.refetchQueries({ queryKey: CITY_KEYS.stats() });
      }, 100);
      
      toast.success('با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.message || 'خطا در ویرایش');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => cityApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: CITY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CITY_KEYS.tree() });
      queryClient.invalidateQueries({ queryKey: CITY_KEYS.stats() });
      
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: CITY_KEYS.tree() });
        queryClient.refetchQueries({ queryKey: CITY_KEYS.stats() });
      }, 100);
      
      toast.success('با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.message || 'خطا در حذف');
    },
  });

  // ========== Wrappers ==========

  const create = useCallback(
    (data: CityFormData) => createMutation.mutateAsync(data),
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: CityFormData) => updateMutation.mutateAsync({ id, data }),
    [updateMutation]
  );

  const deleteItem = useCallback(
    (id: number) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  const refetch = useCallback(async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: CITY_KEYS.tree() }),
      queryClient.refetchQueries({ queryKey: CITY_KEYS.stats() }),
    ]);
  }, [queryClient]);

  // ========== Return ==========

  return {
    useList,
    useTree,
    useItem,
    useStats,
    create,
    update,
    delete: deleteItem,
    refetch,
    isCreating,
    isUpdating,
    isDeleting,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

// // src/hooks/useCity.ts
// // import { useGenericCrud } from './useGenericCrud';
// import { useGenericCrud } from './useGenericCrud';
// // import { cityApi } from '../apis/cityApi';
// import { cityApi } from '../api/city.api';
// // import type { City, CityFormData } from '../types';
// import type { City, CityFormData } from '../types/city.types';

// export const useCity = () => {
//   const base = useGenericCrud<City, CityFormData, CityFormData>(
//     cityApi,
//     'cities',
//     {
//       successMessages: {
//         create: 'شهر با موفقیت اضافه شد',
//         update: 'شهر با موفقیت ویرایش شد',
//         delete: 'شهر با موفقیت حذف شد',
//       },
//       staleTime: 5 * 60 * 1000,
//       retry: 2,
//     }
//   );

//   const useCitiesByProvince = (provinceId: number | null) => {
//     return base.useItems({ province: provinceId });
//   };

//   return {
//     ...base,
//     useCitiesByProvince,
//   };
// };

