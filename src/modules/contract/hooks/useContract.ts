// src/modules/contract/hooks/useContract.ts

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { contractApi } from '../api/contract.api';
import { paymentApi } from '../../payment/api/payment.api';
import type {
  Contract,
  ContractFormData,
  ContractFilters,
  ContractStatistics,
  ContractActivity,
  ContractActivityFormData,
  ContractDelay,
  ContractDelayFormData,
  Payment,
  PaymentFormData,
  PaymentType,
  Settlement,
  SettlementFormData,
  Progress,
  ProgressFormData,
  Communication,
  CommunicationFormData,
} from '../types/contract.types';
import { toast } from 'react-hot-toast';

const CONTRACT_KEYS = {
  all: ['contracts'] as const,
  lists: () => [...CONTRACT_KEYS.all, 'list'] as const,
  list: (filters?: ContractFilters) => [...CONTRACT_KEYS.lists(), filters] as const,
  details: () => [...CONTRACT_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...CONTRACT_KEYS.details(), id] as const,
  detailWithPayments: (id: number) => [...CONTRACT_KEYS.details(), id, 'with-payments'] as const,
  stats: () => [...CONTRACT_KEYS.all, 'stats'] as const,
  activities: (id: number) => [...CONTRACT_KEYS.detail(id), 'activities'] as const,
  delays: (id: number) => [...CONTRACT_KEYS.detail(id), 'delays'] as const,
  payments: (id: number) => [...CONTRACT_KEYS.detail(id), 'payments'] as const,
  settlements: (id: number) => [...CONTRACT_KEYS.detail(id), 'settlements'] as const,
  progresses: (id: number) => [...CONTRACT_KEYS.detail(id), 'progresses'] as const,
  communications: ['communications'] as const,
  paymentTypes: ['payment-types'] as const,
};

export const useContract = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ==================== Contract Queries ====================
  const useList = (filters?: ContractFilters) => {
    return useQuery({
      queryKey: CONTRACT_KEYS.list(filters),
      queryFn: () => contractApi.getAll(filters),
      staleTime: 5 * 60 * 1000,
      placeholderData: keepPreviousData,
    });
  };

  const useStats = (year?: number) => {
    return useQuery<ContractStatistics>({
      queryKey: [...CONTRACT_KEYS.stats(), year],
      queryFn: () => contractApi.getStats(year),
      staleTime: 2 * 60 * 1000,
    });
  };

  const useItem = (id: number) => {
    return useQuery({
      queryKey: CONTRACT_KEYS.detail(id),
      queryFn: () => contractApi.getById(id),
      enabled: !!id && id > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  // ✅ متد: دریافت قرارداد با مبلغ پرداختی از paymentApi
  const useItemWithPayments = (id: number) => {
    return useQuery({
      queryKey: CONTRACT_KEYS.detailWithPayments(id),
      queryFn: async () => {
        // دریافت قرارداد
        const contract = await contractApi.getById(id);
        
        // دریافت مبلغ پرداختی از paymentApi
        const totalPaid = await paymentApi.getTotalPaidByContract(id);
        
        return {
          ...contract,
          paid_amount: totalPaid,
          total_paid: totalPaid,
        };
      },
      enabled: !!id && id > 0,
      staleTime: 2 * 60 * 1000,
    });
  };

  // ==================== Activity Queries ====================
  const useActivities = (contractId: number) => {
    return useQuery({
      queryKey: CONTRACT_KEYS.activities(contractId),
      queryFn: () => contractApi.getActivities(contractId),
      enabled: !!contractId && contractId > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  // ==================== Delay Queries ====================
  const useDelays = (contractId: number) => {
    return useQuery({
      queryKey: CONTRACT_KEYS.delays(contractId),
      queryFn: () => contractApi.getDelays(contractId),
      enabled: !!contractId && contractId > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  // ==================== Payment Queries ====================
  const usePayments = (contractId: number) => {
    return useQuery({
      queryKey: CONTRACT_KEYS.payments(contractId),
      queryFn: () => contractApi.getPayments(contractId),
      enabled: !!contractId && contractId > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  const usePaymentTypes = () => {
    return useQuery({
      queryKey: CONTRACT_KEYS.paymentTypes,
      queryFn: () => contractApi.getPaymentTypes(),
      staleTime: 10 * 60 * 1000,
    });
  };

  // ==================== Settlement Queries ====================
  const useSettlements = (contractId: number) => {
    return useQuery({
      queryKey: CONTRACT_KEYS.settlements(contractId),
      queryFn: () => contractApi.getSettlements(contractId),
      enabled: !!contractId && contractId > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  // ==================== Progress Queries ====================
  const useProgresses = (contractId: number) => {
    return useQuery({
      queryKey: CONTRACT_KEYS.progresses(contractId),
      queryFn: () => contractApi.getProgresses(contractId),
      enabled: !!contractId && contractId > 0,
      staleTime: 5 * 60 * 1000,
    });
  };

  // ==================== Communication Queries ====================
  const useCommunications = (params?: { contract?: number; research?: number }) => {
    return useQuery({
      queryKey: [...CONTRACT_KEYS.communications, params],
      queryFn: () => contractApi.getCommunications(params),
      staleTime: 5 * 60 * 1000,
    });
  };

  // ==================== Contract Mutations ====================
  const createMutation = useMutation({
    mutationFn: ({ data, onProgress }: { data: ContractFormData; onProgress?: (p: number) => void }) =>
      contractApi.create(data, onProgress),
    onMutate: () => setIsCreating(true),
    onSuccess: () => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.stats() });
      toast.success('قرارداد با موفقیت اضافه شد');
    },
    onError: (error: any) => {
      setIsCreating(false);
      toast.error(error.message || 'خطا در ایجاد قرارداد');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, onProgress }: { id: number; data: ContractFormData; onProgress?: (p: number) => void }) =>
      contractApi.update(id, data, onProgress),
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.detailWithPayments(id) });
      toast.success('قرارداد با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      setIsUpdating(false);
      toast.error(error.message || 'خطا در ویرایش قرارداد');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => contractApi.delete(id),
    onMutate: () => setIsDeleting(true),
    onSuccess: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.stats() });
      toast.success('قرارداد با موفقیت حذف شد');
    },
    onError: (error: any) => {
      setIsDeleting(false);
      toast.error(error.message || 'خطا در حذف قرارداد');
    },
  });

  // ==================== Activity Mutations ====================
  const createActivityMutation = useMutation({
    mutationFn: (data: ContractActivityFormData) => contractApi.createActivity(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.activities(variables.contract_id) });
      toast.success('فعالیت با موفقیت اضافه شد');
    },
    onError: (error: any) => {
      toast.error(error.message || 'خطا در ایجاد فعالیت');
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (id: number) => contractApi.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.all });
      toast.success('فعالیت با موفقیت حذف شد');
    },
    onError: (error: any) => {
      toast.error(error.message || 'خطا در حذف فعالیت');
    },
  });

  // ==================== Delay Mutations ====================
  const createDelayMutation = useMutation({
    mutationFn: (data: ContractDelayFormData) => contractApi.createDelay(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.delays(variables.contract_id) });
      toast.success('تاخیر با موفقیت ثبت شد');
    },
    onError: (error: any) => {
      toast.error(error.message || 'خطا در ثبت تاخیر');
    },
  });

  // ==================== Payment Mutations ====================
  const createPaymentMutation = useMutation({
    mutationFn: ({ data, onProgress }: { data: PaymentFormData; onProgress?: (p: number) => void }) =>
      contractApi.createPayment(data, onProgress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.payments(variables.data.contract_id) });
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.detailWithPayments(variables.data.contract_id) });
      toast.success('پرداخت با موفقیت ثبت شد');
    },
    onError: (error: any) => {
      toast.error(error.message || 'خطا در ثبت پرداخت');
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: (id: number) => contractApi.verifyPayment(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.payments(data.contract) });
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.detailWithPayments(data.contract) });
      toast.success('پرداخت با موفقیت تایید شد');
    },
    onError: (error: any) => {
      toast.error(error.message || 'خطا در تایید پرداخت');
    },
  });

  // ==================== Settlement Mutations ====================
  const createSettlementMutation = useMutation({
    mutationFn: ({ data, onProgress }: { data: SettlementFormData; onProgress?: (p: number) => void }) =>
      contractApi.createSettlement(data, onProgress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.settlements(variables.data.contract_id) });
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.stats() });
      toast.success('تسویه حساب با موفقیت ثبت شد');
    },
    onError: (error: any) => {
      toast.error(error.message || 'خطا در ثبت تسویه حساب');
    },
  });

  // ==================== Progress Mutations ====================
  const createProgressMutation = useMutation({
    mutationFn: (data: ProgressFormData) => contractApi.createProgress(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.progresses(variables.contract_id) });
      toast.success('پیشرفت با موفقیت ثبت شد');
    },
    onError: (error: any) => {
      toast.error(error.message || 'خطا در ثبت پیشرفت');
    },
  });

  // ==================== Communication Mutations ====================
  const createCommunicationMutation = useMutation({
    mutationFn: ({ data, onProgress }: { data: CommunicationFormData; onProgress?: (p: number) => void }) =>
      contractApi.createCommunication(data, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.communications });
      toast.success('مکاتبه با موفقیت ثبت شد');
    },
    onError: (error: any) => {
      toast.error(error.message || 'خطا در ثبت مکاتبه');
    },
  });

  // ==================== Wrappers ====================
  const create = useCallback(
    (data: ContractFormData, onProgress?: (p: number) => void) => {
      return createMutation.mutateAsync({ data, onProgress });
    },
    [createMutation]
  );

  const update = useCallback(
    (id: number, data: ContractFormData, onProgress?: (p: number) => void) => {
      return updateMutation.mutateAsync({ id, data, onProgress });
    },
    [updateMutation]
  );

  const deleteItem = useCallback((id: number) => deleteMutation.mutateAsync(id), [deleteMutation]);

  const createActivity = useCallback(
    (data: ContractActivityFormData) => createActivityMutation.mutateAsync(data),
    [createActivityMutation]
  );

  const deleteActivity = useCallback((id: number) => deleteActivityMutation.mutateAsync(id), [deleteActivityMutation]);

  const createDelay = useCallback(
    (data: ContractDelayFormData) => createDelayMutation.mutateAsync(data),
    [createDelayMutation]
  );

  const createPayment = useCallback(
    (data: PaymentFormData, onProgress?: (p: number) => void) => {
      return createPaymentMutation.mutateAsync({ data, onProgress });
    },
    [createPaymentMutation]
  );

  const verifyPayment = useCallback(
    (id: number) => verifyPaymentMutation.mutateAsync(id),
    [verifyPaymentMutation]
  );

  const createSettlement = useCallback(
    (data: SettlementFormData, onProgress?: (p: number) => void) => {
      return createSettlementMutation.mutateAsync({ data, onProgress });
    },
    [createSettlementMutation]
  );

  const createProgress = useCallback(
    (data: ProgressFormData) => createProgressMutation.mutateAsync(data),
    [createProgressMutation]
  );

  const createCommunication = useCallback(
    (data: CommunicationFormData, onProgress?: (p: number) => void) => {
      return createCommunicationMutation.mutateAsync({ data, onProgress });
    },
    [createCommunicationMutation]
  );

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.all });
    queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.stats() });
  }, [queryClient]);

  // ==================== Return ====================
  return {
    // Queries
    useList,
    useItem,
    useItemWithPayments,
    useStats,
    useActivities,
    useDelays,
    usePayments,
    usePaymentTypes,
    useSettlements,
    useProgresses,
    useCommunications,

    // Mutations
    create,
    update,
    delete: deleteItem,
    createActivity,
    deleteActivity,
    createDelay,
    createPayment,
    verifyPayment,
    createSettlement,
    createProgress,
    createCommunication,
    refetch,

    // Status
    isCreating,
    isUpdating,
    isDeleting,
  };
};
// // src/modules/contract/hooks/useContract.ts

// import { useState, useCallback } from 'react';
// import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
// import { contractApi } from '../api/contract.api';
// import type {
//   Contract,
//   ContractFormData,
//   ContractFilters,
//   ContractStatistics,
//   ContractActivity,
//   ContractActivityFormData,
//   ContractDelay,
//   ContractDelayFormData,
//   Payment,
//   PaymentFormData,
//   PaymentType,
//   Settlement,
//   SettlementFormData,
//   Progress,
//   ProgressFormData,
//   Communication,
//   CommunicationFormData,
// } from '../types/contract.types';
// import { toast } from 'react-hot-toast';

// const CONTRACT_KEYS = {
//   all: ['contracts'] as const,
//   lists: () => [...CONTRACT_KEYS.all, 'list'] as const,
//   list: (filters?: ContractFilters) => [...CONTRACT_KEYS.lists(), filters] as const,
//   details: () => [...CONTRACT_KEYS.all, 'detail'] as const,
//   detail: (id: number) => [...CONTRACT_KEYS.details(), id] as const,
//   stats: () => [...CONTRACT_KEYS.all, 'stats'] as const,
//   activities: (id: number) => [...CONTRACT_KEYS.detail(id), 'activities'] as const,
//   delays: (id: number) => [...CONTRACT_KEYS.detail(id), 'delays'] as const,
//   payments: (id: number) => [...CONTRACT_KEYS.detail(id), 'payments'] as const,
//   settlements: (id: number) => [...CONTRACT_KEYS.detail(id), 'settlements'] as const,
//   progresses: (id: number) => [...CONTRACT_KEYS.detail(id), 'progresses'] as const,
//   communications: ['communications'] as const,
//   paymentTypes: ['payment-types'] as const,
// };

// export const useContract = () => {
//   const queryClient = useQueryClient();
//   const [isCreating, setIsCreating] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);

//   // ==================== Contract Queries ====================
//   // ==================== Contract Queries ====================
//   const useList = (filters?: ContractFilters) => {
//     return useQuery({
//       queryKey: CONTRACT_KEYS.list(filters),
//       queryFn: () => contractApi.getAll(filters),
//       staleTime: 5 * 60 * 1000,
//       placeholderData: keepPreviousData,
//     });
//   };
//   // const useList = (filters?: ContractFilters) => {
//   //   return useQuery({
//   //     queryKey: CONTRACT_KEYS.list(filters),
//   //     queryFn: () => contractApi.getAll(filters),
//   //     staleTime: 5 * 60 * 1000,
//   //     placeholderData: keepPreviousData,
//   //   });
//   // };
//   // ✅ اصلاح: useStats با پارامتر year
//   const useStats = (year?: number) => {
//     return useQuery<ContractStatistics>({
//       queryKey: [...CONTRACT_KEYS.stats(), year],
//       queryFn: () => contractApi.getStats(year),
//       staleTime: 2 * 60 * 1000,
//     });
//   };
//   // const useStats = (year?: number) => {
//   //   return useQuery<ContractStatistics>({
//   //     queryKey: [...CONTRACT_KEYS.stats(), year],
//   //     queryFn: () => contractApi.getStats(year),
//   //     staleTime: 2 * 60 * 1000,
//   //   });
//   // };
//   // const useList = (filters?: ContractFilters) => {
//   //   return useQuery({
//   //     queryKey: CONTRACT_KEYS.list(filters),
//   //     queryFn: () => contractApi.getAll(filters),
//   //     staleTime: 5 * 60 * 1000,
//   //     placeholderData: keepPreviousData,
//   //   });
//   // };
  
//    const useItem = (id: number) => {
//     return useQuery({
//       queryKey: CONTRACT_KEYS.detail(id),
//       queryFn: () => contractApi.getById(id),
//       enabled: !!id && id > 0,
//       staleTime: 5 * 60 * 1000,
//     });
//   };
 
//   // ==================== Activity Queries ====================
//   const useActivities = (contractId: number) => {
//     return useQuery({
//       queryKey: CONTRACT_KEYS.activities(contractId),
//       queryFn: () => contractApi.getActivities(contractId),
//       enabled: !!contractId && contractId > 0,
//       staleTime: 5 * 60 * 1000,
//     });
//   };

//   // ==================== Delay Queries ====================
//   const useDelays = (contractId: number) => {
//     return useQuery({
//       queryKey: CONTRACT_KEYS.delays(contractId),
//       queryFn: () => contractApi.getDelays(contractId),
//       enabled: !!contractId && contractId > 0,
//       staleTime: 5 * 60 * 1000,
//     });
//   };

//   // ==================== Payment Queries ====================
//   const usePayments = (contractId: number) => {
//     return useQuery({
//       queryKey: CONTRACT_KEYS.payments(contractId),
//       queryFn: () => contractApi.getPayments(contractId),
//       enabled: !!contractId && contractId > 0,
//       staleTime: 5 * 60 * 1000,
//     });
//   };

//   const usePaymentTypes = () => {
//     return useQuery({
//       queryKey: CONTRACT_KEYS.paymentTypes,
//       queryFn: () => contractApi.getPaymentTypes(),
//       staleTime: 10 * 60 * 1000,
//     });
//   };

//   // ==================== Settlement Queries ====================
//   const useSettlements = (contractId: number) => {
//     return useQuery({
//       queryKey: CONTRACT_KEYS.settlements(contractId),
//       queryFn: () => contractApi.getSettlements(contractId),
//       enabled: !!contractId && contractId > 0,
//       staleTime: 5 * 60 * 1000,
//     });
//   };

//   // ==================== Progress Queries ====================
//   const useProgresses = (contractId: number) => {
//     return useQuery({
//       queryKey: CONTRACT_KEYS.progresses(contractId),
//       queryFn: () => contractApi.getProgresses(contractId),
//       enabled: !!contractId && contractId > 0,
//       staleTime: 5 * 60 * 1000,
//     });
//   };

//   // ==================== Communication Queries ====================
//   const useCommunications = (params?: { contract?: number; research?: number }) => {
//     return useQuery({
//       queryKey: [...CONTRACT_KEYS.communications, params],
//       queryFn: () => contractApi.getCommunications(params),
//       staleTime: 5 * 60 * 1000,
//     });
//   };

//   // ==================== Contract Mutations ====================
//   const createMutation = useMutation({
//     mutationFn: ({ data, onProgress }: { data: ContractFormData; onProgress?: (p: number) => void }) =>
//       contractApi.create(data, onProgress),
//     onMutate: () => setIsCreating(true),
//     onSuccess: () => {
//       setIsCreating(false);
//       queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.all });
//       queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.stats() });
//       toast.success('قرارداد با موفقیت اضافه شد');
//     },
//     onError: (error: any) => {
//       setIsCreating(false);
//       toast.error(error.message || 'خطا در ایجاد قرارداد');
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: ({ id, data, onProgress }: { id: number; data: ContractFormData; onProgress?: (p: number) => void }) =>
//       contractApi.update(id, data, onProgress),
//     onMutate: () => setIsUpdating(true),
//     onSuccess: () => {
//       setIsUpdating(false);
//       queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.all });
//       queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.stats() });
//       toast.success('قرارداد با موفقیت ویرایش شد');
//     },
//     onError: (error: any) => {
//       setIsUpdating(false);
//       toast.error(error.message || 'خطا در ویرایش قرارداد');
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: (id: number) => contractApi.delete(id),
//     onMutate: () => setIsDeleting(true),
//     onSuccess: () => {
//       setIsDeleting(false);
//       queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.all });
//       queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.stats() });
//       toast.success('قرارداد با موفقیت حذف شد');
//     },
//     onError: (error: any) => {
//       setIsDeleting(false);
//       toast.error(error.message || 'خطا در حذف قرارداد');
//     },
//   });

//   // ==================== Activity Mutations ====================
//   const createActivityMutation = useMutation({
//     mutationFn: (data: ContractActivityFormData) => contractApi.createActivity(data),
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.activities(variables.contract_id) });
//       toast.success('فعالیت با موفقیت اضافه شد');
//     },
//     onError: (error: any) => {
//       toast.error(error.message || 'خطا در ایجاد فعالیت');
//     },
//   });

//   const deleteActivityMutation = useMutation({
//     mutationFn: (id: number) => contractApi.deleteActivity(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.all });
//       toast.success('فعالیت با موفقیت حذف شد');
//     },
//     onError: (error: any) => {
//       toast.error(error.message || 'خطا در حذف فعالیت');
//     },
//   });

//   // ==================== Delay Mutations ====================
//   const createDelayMutation = useMutation({
//     mutationFn: (data: ContractDelayFormData) => contractApi.createDelay(data),
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.delays(variables.contract_id) });
//       toast.success('تاخیر با موفقیت ثبت شد');
//     },
//     onError: (error: any) => {
//       toast.error(error.message || 'خطا در ثبت تاخیر');
//     },
//   });

//   // ==================== Payment Mutations ====================
//   const createPaymentMutation = useMutation({
//     mutationFn: ({ data, onProgress }: { data: PaymentFormData; onProgress?: (p: number) => void }) =>
//       contractApi.createPayment(data, onProgress),
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.payments(variables.data.contract_id) });
//       queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.stats() });
//       toast.success('پرداخت با موفقیت ثبت شد');
//     },
//     onError: (error: any) => {
//       toast.error(error.message || 'خطا در ثبت پرداخت');
//     },
//   });

//   const verifyPaymentMutation = useMutation({
//     mutationFn: (id: number) => contractApi.verifyPayment(id),
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.payments(data.contract) });
//       toast.success('پرداخت با موفقیت تایید شد');
//     },
//     onError: (error: any) => {
//       toast.error(error.message || 'خطا در تایید پرداخت');
//     },
//   });

//   // ==================== Settlement Mutations ====================
//   const createSettlementMutation = useMutation({
//     mutationFn: ({ data, onProgress }: { data: SettlementFormData; onProgress?: (p: number) => void }) =>
//       contractApi.createSettlement(data, onProgress),
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.settlements(variables.data.contract_id) });
//       queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.stats() });
//       toast.success('تسویه حساب با موفقیت ثبت شد');
//     },
//     onError: (error: any) => {
//       toast.error(error.message || 'خطا در ثبت تسویه حساب');
//     },
//   });

//   // ==================== Progress Mutations ====================
//   const createProgressMutation = useMutation({
//     mutationFn: (data: ProgressFormData) => contractApi.createProgress(data),
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.progresses(variables.contract_id) });
//       toast.success('پیشرفت با موفقیت ثبت شد');
//     },
//     onError: (error: any) => {
//       toast.error(error.message || 'خطا در ثبت پیشرفت');
//     },
//   });

//   // ==================== Communication Mutations ====================
//   const createCommunicationMutation = useMutation({
//     mutationFn: ({ data, onProgress }: { data: CommunicationFormData; onProgress?: (p: number) => void }) =>
//       contractApi.createCommunication(data, onProgress),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.communications });
//       toast.success('مکاتبه با موفقیت ثبت شد');
//     },
//     onError: (error: any) => {
//       toast.error(error.message || 'خطا در ثبت مکاتبه');
//     },
//   });

//   // ==================== Wrappers ====================
//   const create = useCallback(
//     (data: ContractFormData, onProgress?: (p: number) => void) => {
//       return createMutation.mutateAsync({ data, onProgress });
//     },
//     [createMutation]
//   );

//   const update = useCallback(
//     (id: number, data: ContractFormData, onProgress?: (p: number) => void) => {
//       return updateMutation.mutateAsync({ id, data, onProgress });
//     },
//     [updateMutation]
//   );

//   const deleteItem = useCallback((id: number) => deleteMutation.mutateAsync(id), [deleteMutation]);

//   const createActivity = useCallback(
//     (data: ContractActivityFormData) => createActivityMutation.mutateAsync(data),
//     [createActivityMutation]
//   );

//   const deleteActivity = useCallback((id: number) => deleteActivityMutation.mutateAsync(id), [deleteActivityMutation]);

//   const createDelay = useCallback(
//     (data: ContractDelayFormData) => createDelayMutation.mutateAsync(data),
//     [createDelayMutation]
//   );

//   const createPayment = useCallback(
//     (data: PaymentFormData, onProgress?: (p: number) => void) => {
//       return createPaymentMutation.mutateAsync({ data, onProgress });
//     },
//     [createPaymentMutation]
//   );

//   const verifyPayment = useCallback(
//     (id: number) => verifyPaymentMutation.mutateAsync(id),
//     [verifyPaymentMutation]
//   );

//   const createSettlement = useCallback(
//     (data: SettlementFormData, onProgress?: (p: number) => void) => {
//       return createSettlementMutation.mutateAsync({ data, onProgress });
//     },
//     [createSettlementMutation]
//   );

//   const createProgress = useCallback(
//     (data: ProgressFormData) => createProgressMutation.mutateAsync(data),
//     [createProgressMutation]
//   );

//   const createCommunication = useCallback(
//     (data: CommunicationFormData, onProgress?: (p: number) => void) => {
//       return createCommunicationMutation.mutateAsync({ data, onProgress });
//     },
//     [createCommunicationMutation]
//   );

//   const refetch = useCallback(() => {
//     queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.all });
//     queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.stats() });
//   }, [queryClient]);

//   // ==================== Return ====================
//   return {
//     // Queries
//     useList,
//     useItem,
//     useStats,
//     useActivities,
//     useDelays,
//     usePayments,        // ✅ تعریف شده
//     usePaymentTypes,    // ✅ تعریف شده
//     useSettlements,
//     useProgresses,
//     useCommunications,

//     // Mutations
//     create,
//     update,
//     delete: deleteItem,
//     createActivity,
//     deleteActivity,
//     createDelay,
//     createPayment,
//     verifyPayment,
//     createSettlement,
//     createProgress,
//     createCommunication,
//     refetch,

//     // Status
//     isCreating,
//     isUpdating,
//     isDeleting,
//   };
// };