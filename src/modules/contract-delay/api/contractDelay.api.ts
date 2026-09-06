import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  ContractDelay,
  ContractDelayFormData,
  ContractDelayFilters,
} from '../types/contractDelay.types';

class ContractDelayApi {
  async getAll(params?: ContractDelayFilters): Promise<ContractDelay[]> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof ContractDelayFilters];
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      });
    }

    const response = await axiosClient.get<ContractDelay[]>(
      '/contract-delays/',
      { params: cleanParams }
    );
    return response;
  }

  async getByContract(contractId: number): Promise<ContractDelay[]> {
    const response = await axiosClient.get<ContractDelay[]>(
      API_ENDPOINTS.CONTRACT.DELAYS(contractId)
    );
    return response;
  }

  async getById(id: number): Promise<ContractDelay> {
    const response = await axiosClient.get<ContractDelay>(
      `/contract-delays/${id}/`
    );
    return response;
  }

  // ✅ مثل مدل Progress: از contract استفاده می‌کنیم
  async create(data: ContractDelayFormData): Promise<ContractDelay> {
    // فقط فیلدهایی که بک‌اند نیاز دارد
    const payload = {
      delay_end_date: data.delay_end_date,
      delay_days: data.delay_days,
      reason: data.reason || '',
      is_allowed: data.is_allowed,
      contract: data.contract_id,  // ← contract_id را به contract تبدیل می‌کنیم
    };
    
    console.log('📤 Creating ContractDelay payload:', payload);
    
    const response = await axiosClient.post<ContractDelay>(
      '/contract-delays/',
      payload
    );
    return response;
  }

  async update(id: number, data: Partial<ContractDelayFormData>): Promise<ContractDelay> {
    const payload: Record<string, any> = {};
    
    if (data.delay_end_date !== undefined) payload.delay_end_date = data.delay_end_date;
    if (data.delay_days !== undefined) payload.delay_days = data.delay_days;
    if (data.reason !== undefined) payload.reason = data.reason;
    if (data.is_allowed !== undefined) payload.is_allowed = data.is_allowed;
    if (data.contract_id !== undefined) payload.contract = data.contract_id;  // ← تبدیل
    
    console.log('📤 Updating ContractDelay payload:', payload);
    
    const response = await axiosClient.patch<ContractDelay>(
      `/contract-delays/${id}/`,
      payload
    );
    return response;
  }

  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(`/contract-delays/${id}/`);
  }
}

export const contractDelayApi = new ContractDelayApi();