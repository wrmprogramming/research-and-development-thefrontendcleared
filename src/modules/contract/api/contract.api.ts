// src/modules/contract/api/contract.api.ts

import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { jalaliToGregorian } from '../../../utils/dateUtils';
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
import type { PaginatedResponse } from '../../../types/common.types';

class ContractApi {
  // ==================== Contract ====================
  async getAll(params?: ContractFilters): Promise<PaginatedResponse<Contract>> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof ContractFilters];
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          cleanParams[key] = value;
        }
      });
    }
    const response = await axiosClient.get<PaginatedResponse<Contract>>(
      API_ENDPOINTS.CONTRACT.BASE,
      { params: cleanParams }
    );
    return response;
  }

  async getPaginated(params?: ContractFilters & { page?: number; pageSize?: number }): Promise<PaginatedResponse<Contract>> {
    const response = await axiosClient.get<PaginatedResponse<Contract>>(
      API_ENDPOINTS.CONTRACT.BASE,
      { params }
    );
    return response;
  }

  async getById(id: number): Promise<Contract> {
    const response = await axiosClient.get<Contract>(API_ENDPOINTS.CONTRACT.DETAIL(id));
    return response;
  }

  // ========== متد: دریافت مبلغ پرداختی قرارداد از paymentApi ==========
  async getContractPaidAmount(contractId: number): Promise<{ paid_amount: number; financial_progress: number }> {
    try {
      console.log(`🔍 Getting paid amount for contract ${contractId} from payments API`);
      
      // ✅ استفاده از paymentApi برای دریافت مجموع مبلغ پرداختی
      const totalPaid = await paymentApi.getTotalPaidByContract(contractId);
      
      // دریافت financial_progress از خود قرارداد
      const contract = await this.getById(contractId);
      const financialProgress = contract.financial_progress || 0;
      
      console.log(`💰 Total paid: ${totalPaid}, Financial progress: ${financialProgress}%`);
      
      return {
        paid_amount: totalPaid,
        financial_progress: financialProgress
      };
    } catch (error) {
      console.error('❌ Error getting contract paid amount:', error);
      return { paid_amount: 0, financial_progress: 0 };
    }
  }

  // ========== متد: دریافت جزئیات کامل قرارداد با مبلغ پرداختی ==========
  async getContractWithPayments(id: number): Promise<Contract & { paid_amount: number; total_paid: number }> {
    const contract = await this.getById(id);
    const { paid_amount } = await this.getContractPaidAmount(id);
    
    return {
      ...contract,
      paid_amount,
      total_paid: paid_amount,
    };
  }

  async create(data: ContractFormData, onProgress?: (progress: number) => void): Promise<Contract> {
    const formData = this.contractToFormData(data);
    const response = await axiosClient.post<Contract>(
      API_ENDPOINTS.CONTRACT.BASE,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return response;
  }

  async update(id: number, data: ContractFormData, onProgress?: (progress: number) => void): Promise<Contract> {
    const formData = this.contractToFormData(data);
    const response = await axiosClient.put<Contract>(
      API_ENDPOINTS.CONTRACT.DETAIL(id),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return response;
  }

  async patch(id: number, data: Partial<ContractFormData>): Promise<Contract> {
    const response = await axiosClient.patch<Contract>(API_ENDPOINTS.CONTRACT.DETAIL(id), data);
    return response;
  }

  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.CONTRACT.DETAIL(id));
  }

  async getStats(year?: number): Promise<ContractStatistics> {
    const params: Record<string, any> = {};
    if (year) {
      params.year = year;
    }
    const response = await axiosClient.get<ContractStatistics>(
      `${API_ENDPOINTS.CONTRACT.BASE}stats/`,
      { params }
    );
    return response;
  }

  // ==================== Contract Activities ====================
  async getActivities(contractId: number): Promise<ContractActivity[]> {
    const response = await axiosClient.get<ContractActivity[]>(API_ENDPOINTS.CONTRACT.ACTIVITIES(contractId));
    return response;
  }

  async createActivity(data: ContractActivityFormData): Promise<ContractActivity> {
    const response = await axiosClient.post<ContractActivity>(
      API_ENDPOINTS.CONTRACT.ACTIVITIES(data.contract_id),
      data
    );
    return response;
  }

  async updateActivity(id: number, data: Partial<ContractActivityFormData>): Promise<ContractActivity> {
    const response = await axiosClient.patch<ContractActivity>(
      `/dashboardadmin/contract-activities/${id}/`,
      data
    );
    return response;
  }

  async deleteActivity(id: number): Promise<void> {
    await axiosClient.delete<void>(`/dashboardadmin/contract-activities/${id}/`);
  }

  // ==================== Contract Delays ====================
  async getDelays(contractId: number): Promise<ContractDelay[]> {
    const response = await axiosClient.get<ContractDelay[]>(API_ENDPOINTS.CONTRACT.DELAYS(contractId));
    return response;
  }

  async createDelay(data: ContractDelayFormData): Promise<ContractDelay> {
    const response = await axiosClient.post<ContractDelay>(
      API_ENDPOINTS.CONTRACT.DELAYS(data.contract_id),
      data
    );
    return response;
  }

  async updateDelay(id: number, data: Partial<ContractDelayFormData>): Promise<ContractDelay> {
    const response = await axiosClient.patch<ContractDelay>(
      `/dashboardadmin/contract-delays/${id}/`,
      data
    );
    return response;
  }

  async deleteDelay(id: number): Promise<void> {
    await axiosClient.delete<void>(`/dashboardadmin/contract-delays/${id}/`);
  }

  // ==================== Payments ====================
  async getPayments(contractId: number): Promise<Payment[]> {
    const response = await axiosClient.get<Payment[]>(API_ENDPOINTS.CONTRACT.PAYMENTS(contractId));
    return response;
  }

  async getAllPayments(params?: { contract?: number; is_paid?: boolean }): Promise<Payment[]> {
    const response = await axiosClient.get<Payment[]>(API_ENDPOINTS.PAYMENT.BASE, { params });
    return response;
  }

  async getPaymentById(id: number): Promise<Payment> {
    const response = await axiosClient.get<Payment>(API_ENDPOINTS.PAYMENT.DETAIL(id));
    return response;
  }

  async createPayment(data: PaymentFormData, onProgress?: (progress: number) => void): Promise<Payment> {
    const formData = this.paymentToFormData(data);
    const response = await axiosClient.post<Payment>(
      API_ENDPOINTS.PAYMENT.BASE,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return response;
  }

  async updatePayment(id: number, data: Partial<PaymentFormData>, onProgress?: (progress: number) => void): Promise<Payment> {
    const formData = this.paymentToFormData(data as PaymentFormData);
    const response = await axiosClient.put<Payment>(
      API_ENDPOINTS.PAYMENT.DETAIL(id),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return response;
  }

  async deletePayment(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.PAYMENT.DETAIL(id));
  }

  async verifyPayment(id: number): Promise<Payment> {
    const response = await axiosClient.post<Payment>(API_ENDPOINTS.PAYMENT.VERIFY(id));
    return response;
  }

  // ==================== Payment Types ====================
  async getPaymentTypes(): Promise<PaymentType[]> {
    const response = await axiosClient.get<PaymentType[]>(API_ENDPOINTS.PAYMENT_TYPE.BASE);
    return response;
  }

  // ==================== Settlements ====================
  async getSettlements(contractId: number): Promise<Settlement[]> {
    const response = await axiosClient.get<Settlement[]>(API_ENDPOINTS.CONTRACT.SETTLEMENTS(contractId));
    return response;
  }

  async createSettlement(data: SettlementFormData, onProgress?: (progress: number) => void): Promise<Settlement> {
    const formData = this.settlementToFormData(data);
    const response = await axiosClient.post<Settlement>(
      '/dashboardadmin/settlements/',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return response;
  }

  async updateSettlement(id: number, data: Partial<SettlementFormData>, onProgress?: (progress: number) => void): Promise<Settlement> {
    const formData = this.settlementToFormData(data as SettlementFormData);
    const response = await axiosClient.put<Settlement>(
      `/dashboardadmin/settlements/${id}/`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return response;
  }

  async deleteSettlement(id: number): Promise<void> {
    await axiosClient.delete<void>(`/dashboardadmin/settlements/${id}/`);
  }

  // ==================== Progress ====================
  async getProgresses(contractId: number): Promise<Progress[]> {
    const response = await axiosClient.get<Progress[]>(API_ENDPOINTS.CONTRACT.PROGRESSES(contractId));
    return response;
  }

  async createProgress(data: ProgressFormData): Promise<Progress> {
    const response = await axiosClient.post<Progress>(
      API_ENDPOINTS.PROGRESS.BASE,
      data
    );
    return response;
  }

  async updateProgress(id: number, data: Partial<ProgressFormData>): Promise<Progress> {
    const response = await axiosClient.patch<Progress>(
      API_ENDPOINTS.PROGRESS.DETAIL(id),
      data
    );
    return response;
  }

  async deleteProgress(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.PROGRESS.DETAIL(id));
  }

  // ==================== Communications ====================
  async getCommunications(params?: { contract?: number; research?: number }): Promise<Communication[]> {
    const response = await axiosClient.get<Communication[]>(API_ENDPOINTS.COMMUNICATION.BASE, { params });
    return response;
  }

  async getCommunicationById(id: number): Promise<Communication> {
    const response = await axiosClient.get<Communication>(API_ENDPOINTS.COMMUNICATION.DETAIL(id));
    return response;
  }

  async createCommunication(data: CommunicationFormData, onProgress?: (progress: number) => void): Promise<Communication> {
    const formData = this.communicationToFormData(data);
    const response = await axiosClient.post<Communication>(
      API_ENDPOINTS.COMMUNICATION.BASE,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return response;
  }

  async updateCommunication(id: number, data: Partial<CommunicationFormData>, onProgress?: (progress: number) => void): Promise<Communication> {
    const formData = this.communicationToFormData(data as CommunicationFormData);
    const response = await axiosClient.put<Communication>(
      API_ENDPOINTS.COMMUNICATION.DETAIL(id),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return response;
  }

  async deleteCommunication(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.COMMUNICATION.DETAIL(id));
  }

  // ========== Helper Methods ==========

  private contractToFormData(data: ContractFormData): FormData {
    const formData = new FormData();

    if (data.contract_number) formData.append('contract_number', data.contract_number);
    formData.append('subject', data.subject);
    
    if (data.date) {
      const gregorianDate = jalaliToGregorian(data.date);
      if (gregorianDate) {
        formData.append('date', gregorianDate);
      } else {
        formData.append('date', '');
      }
    } else {
      formData.append('date', '');
    }

    if (data.start_date) {
      const gregorianDate = jalaliToGregorian(data.start_date);
      if (gregorianDate) {
        formData.append('start_date', gregorianDate);
      } else {
        formData.append('start_date', '');
      }
    } else {
      formData.append('start_date', '');
    }

    if (data.end_date) {
      const gregorianDate = jalaliToGregorian(data.end_date);
      if (gregorianDate) {
        formData.append('end_date', gregorianDate);
      } else {
        formData.append('end_date', '');
      }
    } else {
      formData.append('end_date', '');
    }

    formData.append('total_amount', String(data.total_amount));
    
    if (data.commitments) formData.append('commitments', data.commitments);
    if (data.services_description) formData.append('services_description', data.services_description);
    if (data.documents) formData.append('documents', data.documents);
    if (data.contractor_address) formData.append('contractor_address', data.contractor_address);
    formData.append('status', data.status);
    if (data.version !== undefined) formData.append('version', String(data.version));
    if (data.is_archived !== undefined) formData.append('is_archived', String(data.is_archived));
    formData.append('affiliation_type', data.affiliation_type || 'UNIVERSITY');

    if (data.company_id) {
      formData.append('company_id', String(data.company_id));
    }
    if (data.university_id) {
      formData.append('university_id', String(data.university_id));
    }
    if (data.research_id) {
      formData.append('research_id', String(data.research_id));
    }

    if (data.attachment_files && data.attachment_files.length > 0) {
      data.attachment_files.forEach((file) => {
        formData.append('attachment_files', file);
      });
    }

    if (data.deleted_attachment_ids && data.deleted_attachment_ids.length > 0) {
      data.deleted_attachment_ids.forEach((id) => {
        formData.append('deleted_attachment_ids', String(id));
      });
    }

    if (data.activities && data.activities.length > 0) {
      const validActivities = data.activities.filter((a) => a.title?.trim());
      if (validActivities.length > 0) {
        const activitiesToSend = validActivities.map((a) => ({
          title: a.title,
          description: a.description || '',
          start_date: a.start_date ? jalaliToGregorian(a.start_date) : null,
          end_date: a.end_date ? jalaliToGregorian(a.end_date) : null,
          progress: a.progress || 0,
          status: a.status || 'PLANNED'
        }));
        formData.append('activities', JSON.stringify(activitiesToSend));
      }
    }

    return formData;
  }

  private paymentToFormData(data: PaymentFormData): FormData {
    const formData = new FormData();

    if (data.payment_number) formData.append('payment_number', data.payment_number);
    formData.append('amount', String(data.amount));
    
    if (data.payment_date) {
      const gregorianDate = jalaliToGregorian(data.payment_date);
      if (gregorianDate) {
        formData.append('payment_date', gregorianDate);
      } else {
        formData.append('payment_date', '');
      }
    } else {
      formData.append('payment_date', '');
    }
    
    if (data.due_date) {
      const gregorianDate = jalaliToGregorian(data.due_date);
      if (gregorianDate) {
        formData.append('due_date', gregorianDate);
      } else {
        formData.append('due_date', '');
      }
    }
    
    if (data.description) formData.append('description', data.description);
    if (data.is_paid !== undefined) formData.append('is_paid', String(data.is_paid));
    if (data.is_verified !== undefined) formData.append('is_verified', String(data.is_verified));
    formData.append('payment_type_id', String(data.payment_type_id));
    formData.append('contract_id', String(data.contract_id));

    if (data.attachment_files && data.attachment_files.length > 0) {
      data.attachment_files.forEach((file) => {
        formData.append('attachment_files', file);
      });
    }

    if (data.deleted_attachment_ids && data.deleted_attachment_ids.length > 0) {
      data.deleted_attachment_ids.forEach((id) => {
        formData.append('deleted_attachment_ids', String(id));
      });
    }

    this.appendFile(formData, 'receipt_file', data.receipt_file);

    return formData;
  }

  private settlementToFormData(data: SettlementFormData): FormData {
    const formData = new FormData();

    if (data.certificate_number) formData.append('certificate_number', data.certificate_number);
    
    if (data.date) {
      const gregorianDate = jalaliToGregorian(data.date);
      if (gregorianDate) {
        formData.append('date', gregorianDate);
      } else {
        formData.append('date', '');
      }
    } else {
      formData.append('date', '');
    }
    
    if (data.description) formData.append('description', data.description);
    formData.append('total_amount', String(data.total_amount));
    if (data.remaining_amount !== undefined) formData.append('remaining_amount', String(data.remaining_amount));
    formData.append('contract_id', String(data.contract_id));

    this.appendFile(formData, 'certificate_file', data.certificate_file);

    return formData;
  }

  private communicationToFormData(data: CommunicationFormData): FormData {
    const formData = new FormData();

    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('sender', data.sender);
    formData.append('receiver', data.receiver);
    
    if (data.date) {
      const gregorianDate = jalaliToGregorian(data.date);
      if (gregorianDate) {
        formData.append('date', gregorianDate);
      } else {
        formData.append('date', '');
      }
    } else {
      formData.append('date', '');
    }
    
    if (data.send_date) {
      const gregorianDate = jalaliToGregorian(data.send_date);
      if (gregorianDate) {
        formData.append('send_date', gregorianDate);
      } else {
        formData.append('send_date', '');
      }
    }
    
    if (data.receive_date) {
      const gregorianDate = jalaliToGregorian(data.receive_date);
      if (gregorianDate) {
        formData.append('receive_date', gregorianDate);
      } else {
        formData.append('receive_date', '');
      }
    }
    
    if (data.contract_id) formData.append('contract_id', String(data.contract_id));
    if (data.research_id) formData.append('research_id', String(data.research_id));

    this.appendFile(formData, 'attachment', data.attachment);
    this.appendFile(formData, 'letter_file', data.letter_file);

    return formData;
  }

  private appendFile(formData: FormData, key: string, value: File | string | null | undefined): void {
    if (value === null || value === '') {
      formData.append(key, '');
    } else if (value instanceof File) {
      formData.append(key, value);
    }
  }
}

export const contractApi = new ContractApi();

// // src/modules/contract/api/contract.api.ts

// import { axiosClient } from '../../../api/client/axiosClient';
// import { API_ENDPOINTS } from '../../../api/endpoints';
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
// import type { PaginatedResponse } from '../../../types/common.types';

// class ContractApi {
//   // ==================== Contract ====================
//   async getAll(params?: ContractFilters): Promise<PaginatedResponse<Contract>> {
//     const cleanParams: Record<string, any> = {};
//     if (params) {
//       Object.keys(params).forEach(key => {
//         const value = params[key as keyof ContractFilters];
//         if (value !== undefined && value !== null && value !== '' && value !== 'all') {
//           cleanParams[key] = value;
//         }
//       });
//     }
//     const response = await axiosClient.get<PaginatedResponse<Contract>>(
//       API_ENDPOINTS.CONTRACT.BASE,
//       { params: cleanParams }
//     );
//     return response;
//   }

//   async getPaginated(params?: ContractFilters & { page?: number; pageSize?: number }): Promise<PaginatedResponse<Contract>> {
//     const response = await axiosClient.get<PaginatedResponse<Contract>>(
//       API_ENDPOINTS.CONTRACT.BASE,
//       { params }
//     );
//     return response;
//   }

//   async getById(id: number): Promise<Contract> {
//     const response = await axiosClient.get<Contract>(API_ENDPOINTS.CONTRACT.DETAIL(id));
//     return response;
//   }

//   async create(data: ContractFormData, onProgress?: (progress: number) => void): Promise<Contract> {
//     const formData = this.contractToFormData(data);
//     const response = await axiosClient.post<Contract>(
//       API_ENDPOINTS.CONTRACT.BASE,
//       formData,
//       {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         onUploadProgress: (progressEvent) => {
//           if (onProgress && progressEvent.total) {
//             const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             onProgress(percent);
//           }
//         },
//       }
//     );
//     return response;
//   }

//   async update(id: number, data: ContractFormData, onProgress?: (progress: number) => void): Promise<Contract> {
//     const formData = this.contractToFormData(data);
//     const response = await axiosClient.put<Contract>(
//       API_ENDPOINTS.CONTRACT.DETAIL(id),
//       formData,
//       {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         onUploadProgress: (progressEvent) => {
//           if (onProgress && progressEvent.total) {
//             const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             onProgress(percent);
//           }
//         },
//       }
//     );
//     return response;
//   }

//   async patch(id: number, data: Partial<ContractFormData>): Promise<Contract> {
//     const response = await axiosClient.patch<Contract>(API_ENDPOINTS.CONTRACT.DETAIL(id), data);
//     return response;
//   }

//   async delete(id: number): Promise<void> {
//     await axiosClient.delete<void>(API_ENDPOINTS.CONTRACT.DETAIL(id));
//   }

//   async getStats(year?: number): Promise<ContractStatistics> {
//     const params: Record<string, any> = {};
//     if (year) {
//       params.year = year;
//     }
//     const response = await axiosClient.get<ContractStatistics>(
//       `${API_ENDPOINTS.CONTRACT.BASE}stats/`,
//       { params }
//     );
//     return response;
//   }

//   // async getStats(): Promise<ContractStatistics> {
//   //   const response = await axiosClient.get<ContractStatistics>(`${API_ENDPOINTS.CONTRACT.BASE}stats/`);
//   //   return response;
//   // }

//   // ==================== Contract Activities ====================
//   async getActivities(contractId: number): Promise<ContractActivity[]> {
//     const response = await axiosClient.get<ContractActivity[]>(API_ENDPOINTS.CONTRACT.ACTIVITIES(contractId));
//     return response;
//   }

//   async createActivity(data: ContractActivityFormData): Promise<ContractActivity> {
//     const response = await axiosClient.post<ContractActivity>(
//       API_ENDPOINTS.CONTRACT.ACTIVITIES(data.contract_id),
//       data
//     );
//     return response;
//   }

//   async updateActivity(id: number, data: Partial<ContractActivityFormData>): Promise<ContractActivity> {
//     const response = await axiosClient.patch<ContractActivity>(
//       `/dashboardadmin/contract-activities/${id}/`,
//       data
//     );
//     return response;
//   }

//   async deleteActivity(id: number): Promise<void> {
//     await axiosClient.delete<void>(`/dashboardadmin/contract-activities/${id}/`);
//   }

//   // ==================== Contract Delays ====================
//   async getDelays(contractId: number): Promise<ContractDelay[]> {
//     const response = await axiosClient.get<ContractDelay[]>(API_ENDPOINTS.CONTRACT.DELAYS(contractId));
//     return response;
//   }

//   async createDelay(data: ContractDelayFormData): Promise<ContractDelay> {
//     const response = await axiosClient.post<ContractDelay>(
//       API_ENDPOINTS.CONTRACT.DELAYS(data.contract_id),
//       data
//     );
//     return response;
//   }

//   async updateDelay(id: number, data: Partial<ContractDelayFormData>): Promise<ContractDelay> {
//     const response = await axiosClient.patch<ContractDelay>(
//       `/dashboardadmin/contract-delays/${id}/`,
//       data
//     );
//     return response;
//   }

//   async deleteDelay(id: number): Promise<void> {
//     await axiosClient.delete<void>(`/dashboardadmin/contract-delays/${id}/`);
//   }

//   // ==================== Payments ====================
//   async getPayments(contractId: number): Promise<Payment[]> {
//     const response = await axiosClient.get<Payment[]>(API_ENDPOINTS.CONTRACT.PAYMENTS(contractId));
//     return response;
//   }

//   async getAllPayments(params?: { contract?: number; is_paid?: boolean }): Promise<Payment[]> {
//     const response = await axiosClient.get<Payment[]>('/dashboardadmin/payments/', { params });
//     return response;
//   }

//   async getPaymentById(id: number): Promise<Payment> {
//     const response = await axiosClient.get<Payment>(`/dashboardadmin/payments/${id}/`);
//     return response;
//   }

//   async createPayment(data: PaymentFormData, onProgress?: (progress: number) => void): Promise<Payment> {
//     const formData = this.paymentToFormData(data);
//     const response = await axiosClient.post<Payment>(
//       '/dashboardadmin/payments/',
//       formData,
//       {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         onUploadProgress: (progressEvent) => {
//           if (onProgress && progressEvent.total) {
//             const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             onProgress(percent);
//           }
//         },
//       }
//     );
//     return response;
//   }

//   async updatePayment(id: number, data: Partial<PaymentFormData>, onProgress?: (progress: number) => void): Promise<Payment> {
//     const formData = this.paymentToFormData(data as PaymentFormData);
//     const response = await axiosClient.put<Payment>(
//       `/dashboardadmin/payments/${id}/`,
//       formData,
//       {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         onUploadProgress: (progressEvent) => {
//           if (onProgress && progressEvent.total) {
//             const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             onProgress(percent);
//           }
//         },
//       }
//     );
//     return response;
//   }

//   async deletePayment(id: number): Promise<void> {
//     await axiosClient.delete<void>(`/dashboardadmin/payments/${id}/`);
//   }

//   async verifyPayment(id: number): Promise<Payment> {
//     const response = await axiosClient.post<Payment>(`/dashboardadmin/payments/${id}/verify/`);
//     return response;
//   }

//   // ==================== Payment Types ====================
//   async getPaymentTypes(): Promise<PaymentType[]> {
//     const response = await axiosClient.get<PaymentType[]>('/dashboardadmin/payment-types/');
//     return response;
//   }

//   // ==================== Settlements ====================
//   async getSettlements(contractId: number): Promise<Settlement[]> {
//     const response = await axiosClient.get<Settlement[]>(API_ENDPOINTS.CONTRACT.SETTLEMENTS(contractId));
//     return response;
//   }

//   async createSettlement(data: SettlementFormData, onProgress?: (progress: number) => void): Promise<Settlement> {
//     const formData = this.settlementToFormData(data);
//     const response = await axiosClient.post<Settlement>(
//       '/dashboardadmin/settlements/',
//       formData,
//       {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         onUploadProgress: (progressEvent) => {
//           if (onProgress && progressEvent.total) {
//             const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             onProgress(percent);
//           }
//         },
//       }
//     );
//     return response;
//   }

//   async updateSettlement(id: number, data: Partial<SettlementFormData>, onProgress?: (progress: number) => void): Promise<Settlement> {
//     const formData = this.settlementToFormData(data as SettlementFormData);
//     const response = await axiosClient.put<Settlement>(
//       `/dashboardadmin/settlements/${id}/`,
//       formData,
//       {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         onUploadProgress: (progressEvent) => {
//           if (onProgress && progressEvent.total) {
//             const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             onProgress(percent);
//           }
//         },
//       }
//     );
//     return response;
//   }

//   async deleteSettlement(id: number): Promise<void> {
//     await axiosClient.delete<void>(`/dashboardadmin/settlements/${id}/`);
//   }

//   // ==================== Progress ====================
//   async getProgresses(contractId: number): Promise<Progress[]> {
//     const response = await axiosClient.get<Progress[]>(API_ENDPOINTS.CONTRACT.PROGRESSES(contractId));
//     return response;
//   }

//   async createProgress(data: ProgressFormData): Promise<Progress> {
//     const response = await axiosClient.post<Progress>(
//       '/dashboardadmin/progresses/',
//       data
//     );
//     return response;
//   }

//   async updateProgress(id: number, data: Partial<ProgressFormData>): Promise<Progress> {
//     const response = await axiosClient.patch<Progress>(
//       `/dashboardadmin/progresses/${id}/`,
//       data
//     );
//     return response;
//   }

//   async deleteProgress(id: number): Promise<void> {
//     await axiosClient.delete<void>(`/dashboardadmin/progresses/${id}/`);
//   }

//   // ==================== Communications ====================
//   async getCommunications(params?: { contract?: number; research?: number }): Promise<Communication[]> {
//     const response = await axiosClient.get<Communication[]>('/dashboardadmin/communications/', { params });
//     return response;
//   }

//   async getCommunicationById(id: number): Promise<Communication> {
//     const response = await axiosClient.get<Communication>(`/dashboardadmin/communications/${id}/`);
//     return response;
//   }

//   async createCommunication(data: CommunicationFormData, onProgress?: (progress: number) => void): Promise<Communication> {
//     const formData = this.communicationToFormData(data);
//     const response = await axiosClient.post<Communication>(
//       '/dashboardadmin/communications/',
//       formData,
//       {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         onUploadProgress: (progressEvent) => {
//           if (onProgress && progressEvent.total) {
//             const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             onProgress(percent);
//           }
//         },
//       }
//     );
//     return response;
//   }

//   async updateCommunication(id: number, data: Partial<CommunicationFormData>, onProgress?: (progress: number) => void): Promise<Communication> {
//     const formData = this.communicationToFormData(data as CommunicationFormData);
//     const response = await axiosClient.put<Communication>(
//       `/dashboardadmin/communications/${id}/`,
//       formData,
//       {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         onUploadProgress: (progressEvent) => {
//           if (onProgress && progressEvent.total) {
//             const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             onProgress(percent);
//           }
//         },
//       }
//     );
//     return response;
//   }

//   async deleteCommunication(id: number): Promise<void> {
//     await axiosClient.delete<void>(`/dashboardadmin/communications/${id}/`);
//   }

//   // ========== Helper Methods ==========

//   // src/modules/contract/api/contract.api.ts

// private contractToFormData(data: ContractFormData): FormData {
//   const formData = new FormData();

//   // فیلدهای متنی
//   if (data.contract_number) formData.append('contract_number', data.contract_number);
//   formData.append('subject', data.subject);
//   // formData.append('date', data.date);
//   if (data.date !== undefined && data.date !== null) {
//     formData.append('date', data.date);
//   } else {
//     //  اگر null است، رشته خالی ارسال کن تا بک‌اند مقدار را پاک کند
//     formData.append('date', '');
//   }
//   // formData.append('start_date', data.start_date);
//   if (data.start_date !== undefined && data.start_date !== null) {
//     formData.append('start_date', data.start_date);
//   } else {
//     //  اگر null است، رشته خالی ارسال کن تا بک‌اند مقدار را پاک کند
//     formData.append('start_date', '');
//   }
//   // formData.append('end_date', data.end_date);
//   if (data.end_date !== undefined && data.end_date !== null) {
//     formData.append('end_date', data.end_date);
//   } else {
//     //  اگر null است، رشته خالی ارسال کن تا بک‌اند مقدار را پاک کند
//     formData.append('end_date', '');
//   }
//   formData.append('total_amount', String(data.total_amount));
//   //  حذف paid_amount
//   // if (data.paid_amount !== undefined) formData.append('paid_amount', String(data.paid_amount));
//   if (data.commitments) formData.append('commitments', data.commitments);
//   if (data.services_description) formData.append('services_description', data.services_description);
//   if (data.documents) formData.append('documents', data.documents);
//   if (data.contractor_address) formData.append('contractor_address', data.contractor_address);
//   formData.append('status', data.status);
//   if (data.version !== undefined) formData.append('version', String(data.version));
//   if (data.is_archived !== undefined) formData.append('is_archived', String(data.is_archived));
//   formData.append('affiliation_type', data.affiliation_type || 'UNIVERSITY');

//   // کلیدهای خارجی
//   if (data.company_id) {
//     formData.append('company', String(data.company_id));
//     formData.append('company_id', String(data.company_id));
//   }
//   if (data.university_id) {
//     formData.append('university', String(data.university_id));
//     formData.append('university_id', String(data.university_id));
//   }
//   if (data.research_id) {
//     formData.append('research', String(data.research_id));
//     formData.append('research_id', String(data.research_id));
//   }

//   //  فایل‌های پیوست چندگانه
//   if (data.attachment_files && data.attachment_files.length > 0) {
//     data.attachment_files.forEach((file) => {
//       formData.append('attachment_files', file);
//     });
//   }

//   //  آیدی فایل‌هایی که باید حذف شوند
//   if (data.deleted_attachment_ids && data.deleted_attachment_ids.length > 0) {
//     data.deleted_attachment_ids.forEach((id) => {
//       formData.append('deleted_attachment_ids', String(id));
//     });
//   }

//   // فعالیت‌ها
//   if (data.activities && data.activities.length > 0) {
//     const validActivities = data.activities.filter((a) => a.title?.trim());
//     if (validActivities.length > 0) {
//       const activitiesToSend = validActivities.map((a) => ({
//         title: a.title,
//         description: a.description || '',
//         start_date: a.start_date || null,
//         end_date: a.end_date || null,
//         progress: a.progress || 0,
//         status: a.status || 'PLANNED'
//       }));
//       formData.append('activities', JSON.stringify(activitiesToSend));
//     }
//   }

//   return formData;
// }


//   private paymentToFormData(data: PaymentFormData): FormData {
//     const formData = new FormData();

//     if (data.payment_number) formData.append('payment_number', data.payment_number);
//     formData.append('amount', String(data.amount));
//     formData.append('payment_date', data.payment_date);
//     if (data.due_date) formData.append('due_date', data.due_date);
//     if (data.description) formData.append('description', data.description);
//     if (data.is_paid !== undefined) formData.append('is_paid', String(data.is_paid));
//     if (data.is_verified !== undefined) formData.append('is_verified', String(data.is_verified));
//     formData.append('payment_type', String(data.payment_type_id));
//     formData.append('contract', String(data.contract_id));
//     formData.append('receiver', String(data.receiver_id));

//     this.appendFile(formData, 'receipt_file', data.receipt_file);

//     return formData;
//   }

//   private settlementToFormData(data: SettlementFormData): FormData {
//     const formData = new FormData();

//     if (data.certificate_number) formData.append('certificate_number', data.certificate_number);
//     formData.append('date', data.date);
//     if (data.description) formData.append('description', data.description);
//     formData.append('total_amount', String(data.total_amount));
//     if (data.remaining_amount !== undefined) formData.append('remaining_amount', String(data.remaining_amount));
//     formData.append('contract', String(data.contract_id));

//     this.appendFile(formData, 'certificate_file', data.certificate_file);

//     return formData;
//   }

//   private communicationToFormData(data: CommunicationFormData): FormData {
//     const formData = new FormData();

//     formData.append('title', data.title);
//     if (data.description) formData.append('description', data.description);
//     formData.append('sender', data.sender);
//     formData.append('receiver', data.receiver);
//     formData.append('date', data.date);
//     if (data.send_date) formData.append('send_date', data.send_date);
//     if (data.receive_date) formData.append('receive_date', data.receive_date);
//     if (data.contract_id) formData.append('contract', String(data.contract_id));
//     if (data.research_id) formData.append('research', String(data.research_id));

//     this.appendFile(formData, 'attachment', data.attachment);
//     this.appendFile(formData, 'letter_file', data.letter_file);

//     return formData;
//   }

//   private appendFile(formData: FormData, key: string, value: File | string | null | undefined): void {
//     if (value === null || value === '') {
//       formData.append(key, '');
//     } else if (value instanceof File) {
//       formData.append(key, value);
//     }
//   }
// }

// export const contractApi = new ContractApi();