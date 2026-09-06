// src/modules/university/hooks/useUniversity.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { universityApi } from '../api/university.api';
import type { 
  University, 
  UniversityFormData, 
  UniversityFilters, 
  TreeNode 
} from '../types/university.types';
import { toast } from 'react-hot-toast';

const UNIVERSITY_KEYS = {
  all: ['universities'] as const,
  lists: () => [...UNIVERSITY_KEYS.all, 'list'] as const,
  list: (filters?: UniversityFilters) => [...UNIVERSITY_KEYS.lists(), filters] as const,
  tree: () => [...UNIVERSITY_KEYS.all, 'tree'] as const,
  details: () => [...UNIVERSITY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...UNIVERSITY_KEYS.details(), id] as const,
  stats: () => [...UNIVERSITY_KEYS.all, 'stats'] as const,
};

export const useUniversity = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ========== Queries ==========

  const useList = (filters?: UniversityFilters) => {
    return useQuery({
      queryKey: UNIVERSITY_KEYS.list(filters),
      queryFn: () => universityApi.getAll(filters),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useTree = () => {
    return useQuery({
      queryKey: UNIVERSITY_KEYS.tree(),
      queryFn: () => universityApi.getTreeData(),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useItem = (id: number) => {
    return useQuery({
      queryKey: UNIVERSITY_KEYS.detail(id),
      queryFn: () => universityApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useStats = () => {
    return useQuery({
      queryKey: UNIVERSITY_KEYS.stats(),
      queryFn: async () => {
        const treeData = await universityApi.getTreeData();
        const totalProvinces = treeData.length;
        const totalCities = treeData.reduce((acc, p) => acc + (p.children?.length || 0), 0);
        const totalUniversities = treeData.reduce(
          (acc, p) => acc + (p.children?.reduce((acc2, c) => acc2 + (c.children?.length || 0), 0) || 0),
          0
        );
        return {
          total_provinces: totalProvinces,
          total_cities: totalCities,
          total_universities: totalUniversities,
        };
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  // ========== 🔄 تابع به‌روزرسانی درخت به‌صورت Optimistic ==========
  const updateTreeOptimistically = useCallback((updatedUniversity: any) => {
    // دریافت داده‌های فعلی درخت
    const currentTree = queryClient.getQueryData<TreeNode[]>(UNIVERSITY_KEYS.tree());
    
    if (!currentTree) return;

    // به‌روزرسانی بازگشتی درخت
    const updateNodeInTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        // اگر خود این گره است، به‌روزرسانی کن
        if (node.id === updatedUniversity.id && node.type === 'university') {
          return {
            ...node,
            name: updatedUniversity.name,
            data: {
              ...node.data,
              ...updatedUniversity,
            },
          };
        }
        
        // اگر فرزند دارد، بازگشتی بررسی کن
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: updateNodeInTree(node.children),
          };
        }
        
        return node;
      });
    };

    const updatedTree = updateNodeInTree(currentTree);
    
    // ✅ به‌روزرسانی کش بدون نیاز به رفرش کامل
    queryClient.setQueryData(UNIVERSITY_KEYS.tree(), updatedTree);
    console.log('⚡ Optimistic tree update applied for university:', updatedUniversity.id);
  }, [queryClient]);

  // ========== 🗑️ تابع حذف از درخت به‌صورت Optimistic ==========
  const removeFromTreeOptimistically = useCallback((universityId: number) => {
    const currentTree = queryClient.getQueryData<TreeNode[]>(UNIVERSITY_KEYS.tree());
    
    if (!currentTree) return;

    const removeNodeFromTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .map(node => {
          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: removeNodeFromTree(node.children),
            };
          }
          return node;
        })
        .filter(node => {
          // اگر گره مورد نظر است، حذف کن
          if (node.id === universityId && node.type === 'university') {
            return false;
          }
          return true;
        });
    };

    const updatedTree = removeNodeFromTree(currentTree);
    queryClient.setQueryData(UNIVERSITY_KEYS.tree(), updatedTree);
    console.log('⚡ Optimistic tree removal applied for university:', universityId);
  }, [queryClient]);

  // ========== ➕ تابع افزودن به درخت به‌صورت Optimistic ==========
  const addToTreeOptimistically = useCallback((newUniversity: any, cityId: number) => {
    const currentTree = queryClient.getQueryData<TreeNode[]>(UNIVERSITY_KEYS.tree());
    
    if (!currentTree) return;

    // ایجاد گره جدید
    const newNode: TreeNode = {
      id: newUniversity.id || Date.now(), // برای حالت موقت
      name: newUniversity.name,
      type: 'university',
      data: newUniversity,
      parentId: cityId,
      expanded: false,
    };

    const addNodeToTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        // اگر شهر مورد نظر است، دانشگاه را به فرزندانش اضافه کن
        if (node.id === cityId && node.type === 'city') {
          const children = node.children || [];
          return {
            ...node,
            children: [...children, newNode],
            universities_count: (node.universities_count || 0) + 1,
          };
        }
        
        // بازگشتی جستجو
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: addNodeToTree(node.children),
          };
        }
        
        return node;
      });
    };

    const updatedTree = addNodeToTree(currentTree);
    queryClient.setQueryData(UNIVERSITY_KEYS.tree(), updatedTree);
    console.log('⚡ Optimistic tree addition applied for university:', newUniversity.id);
  }, [queryClient]);

  // ========== Mutations با Optimistic Update ==========

  const createMutation = useMutation({
    mutationFn: (data: UniversityFormData) => universityApi.create(data),
    onMutate: () => setIsCreating(true),
    onSuccess: (data) => {
      setIsCreating(false);
      // ✅ Invalidate و رفرش کامل
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      queryClient.invalidateQueries({ queryKey: ['city'] });
      queryClient.invalidateQueries({ queryKey: ['province'] });
      
      // ✅ رفرش درخت پس از تایید سرور
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['universities', 'tree'] });
        queryClient.refetchQueries({ queryKey: ['universities', 'stats'] });
      }, 300);
      
      toast.success('دانشگاه با موفقیت اضافه شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.response?.data?.message || error.message || 'خطا در ایجاد دانشگاه');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UniversityFormData }) =>
      universityApi.update(id, data),
    onMutate: async ({ id, data }) => {
      setIsUpdating(true);
      
      // 🔥 Optimistic Update: قبل از ارسال به سرور، UI را به‌روزرسانی کن
      const universityData = {
        id,
        name: data.name,
        city: data.city_id,
        type: data.type_id,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
      };
      
      updateTreeOptimistically(universityData);
      
      // برگرداندن context برای rollback در صورت خطا
      return { universityData };
    },
    onSuccess: (data, variables) => {
      setIsUpdating(false);
      
      // ✅ Invalidate برای اطمینان از همگام‌سازی با سرور
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      queryClient.invalidateQueries({ queryKey: ['city'] });
      queryClient.invalidateQueries({ queryKey: ['province'] });
      
      // ✅ رفرش در پس‌زمینه
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['universities', 'tree'] });
        queryClient.refetchQueries({ queryKey: ['universities', 'stats'] });
      }, 500);
      
      toast.success('دانشگاه با موفقیت ویرایش شد');
    },
    onError: (error: any, variables, context) => {
      setIsUpdating(false);
      
      // 🔄 Rollback: در صورت خطا، داده‌های قبلی را برگردان
      if (context?.universityData) {
        // دوباره درخت را با داده‌های قبلی به‌روزرسانی کن
        const previousData = context.universityData;
        // برای rollback، نیاز به داده‌های قبلی داریم که باید ذخیره می‌کردیم
        // در اینجا ساده‌ترین کار رفرش کامل است
        queryClient.refetchQueries({ queryKey: ['universities', 'tree'] });
      }
      
      toast.error(error.response?.data?.message || error.message || 'خطا در ویرایش دانشگاه');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => universityApi.delete(id),
    onMutate: (id) => {
      setIsDeleting(true);
      // 🔥 Optimistic Delete: بلافاصله از UI حذف کن
      removeFromTreeOptimistically(id);
    },
    onSuccess: () => {
      setIsDeleting(false);
      
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      queryClient.invalidateQueries({ queryKey: ['city'] });
      queryClient.invalidateQueries({ queryKey: ['province'] });
      
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['universities', 'tree'] });
        queryClient.refetchQueries({ queryKey: ['universities', 'stats'] });
      }, 300);
      
      toast.success('دانشگاه با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      // 🔄 در صورت خطا، رفرش کن
      queryClient.refetchQueries({ queryKey: ['universities', 'tree'] });
      toast.error(error.response?.data?.message || error.message || 'خطا در حذف دانشگاه');
    },
  });

  // ========== Wrappers ==========

  const create = useCallback(
    (data: UniversityFormData) => createMutation.mutateAsync(data),
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: UniversityFormData) => updateMutation.mutateAsync({ id, data }),
    [updateMutation]
  );

  const deleteItem = useCallback(
    (id: number) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  const refetch = useCallback(async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['universities', 'tree'] }),
      queryClient.refetchQueries({ queryKey: ['universities', 'stats'] }),
      queryClient.refetchQueries({ queryKey: ['universities', 'list'] }),
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
