// hooks/useProposal.ts
import { useGenericCrud } from './useGenericCrud';
import { proposalApi } from 'src/apis/proposalApi';
import type { Proposal, ProposalFormData } from '../types';

export const useProposal = () => {
  return useGenericCrud<Proposal, ProposalFormData, ProposalFormData>(
    proposalApi,
    'proposals',
    {
      successMessages: {
        create: 'پروپوزال با موفقیت اضافه شد',
        update: 'پروپوزال با موفقیت ویرایش شد',
        delete: 'پروپوزال با موفقیت حذف شد',
      },
      staleTime: 2 * 60 * 1000,
      retry: 2,
    }
  );
};