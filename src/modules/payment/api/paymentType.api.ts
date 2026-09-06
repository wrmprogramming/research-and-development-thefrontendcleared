// src/modules/payment/api/paymentType.api.ts
import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  PaymentType,
  PaymentTypeFormData,
  PaymentTypeFilters,
} from '../types/paymentType.types';
import type { PaginatedResponse } from '../../../types/common.types';

class PaymentTypeApi {
  // ==================== CRUD Operations ====================

  async getAll(params?: PaymentTypeFilters): Promise<PaymentType[]> {
    const response = await axiosClient.get<PaymentType[]>(API_ENDPOINTS.PAYMENT_TYPE.BASE, { params });
    return response;
  }

  async getPaginated(params?: PaymentTypeFilters & { page?: number; pageSize?: number }): Promise<PaginatedResponse<PaymentType>> {
    const response = await axiosClient.get<PaginatedResponse<PaymentType>>(
      API_ENDPOINTS.PAYMENT_TYPE.BASE,
      { params }
    );
    return response;
  }

  async getById(id: number): Promise<PaymentType> {
    const response = await axiosClient.get<PaymentType>(API_ENDPOINTS.PAYMENT_TYPE.DETAIL(id));
    return response;
  }

  async create(data: PaymentTypeFormData): Promise<PaymentType> {
    const response = await axiosClient.post<PaymentType>(API_ENDPOINTS.PAYMENT_TYPE.BASE, data);
    return response;
  }

  async update(id: number, data: Partial<PaymentTypeFormData>): Promise<PaymentType> {
    const response = await axiosClient.put<PaymentType>(API_ENDPOINTS.PAYMENT_TYPE.DETAIL(id), data);
    return response;
  }

  async patch(id: number, data: Partial<PaymentTypeFormData>): Promise<PaymentType> {
    const response = await axiosClient.patch<PaymentType>(API_ENDPOINTS.PAYMENT_TYPE.DETAIL(id), data);
    return response;
  }

  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.PAYMENT_TYPE.DETAIL(id));
  }
}

export const paymentTypeApi = new PaymentTypeApi();