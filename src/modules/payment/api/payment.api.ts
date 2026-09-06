import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  Payment,
  PaymentFormData,
  PaymentStats,
  PaymentFilters,
} from '../types/payment.types';
import type { PaginatedResponse } from '../../../types/common.types';

class PaymentApi {
  async getAll(params?: PaymentFilters): Promise<PaginatedResponse<Payment>> {
    const response = await axiosClient.get<PaginatedResponse<Payment>>(
      API_ENDPOINTS.PAYMENT.BASE,
      { params }
    );
    return response;
  }

  async getById(id: number): Promise<Payment> {
    const response = await axiosClient.get<Payment>(API_ENDPOINTS.PAYMENT.DETAIL(id));
    return response;
  }

  async create(data: PaymentFormData, onProgress?: (progress: number) => void): Promise<Payment> {
    const formData = this.toFormData(data);
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

  async update(id: number, data: Partial<PaymentFormData>, onProgress?: (progress: number) => void): Promise<Payment> {
    const formData = this.toFormData(data as PaymentFormData);
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

  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.PAYMENT.DETAIL(id));
  }

  async getStats(year?: number): Promise<PaymentStats> {
  const params = year ? { year } : {};
  const response = await axiosClient.get<PaymentStats>(`${API_ENDPOINTS.PAYMENT.BASE}stats/`, { params });
  return response;
}

  // async getStats(): Promise<PaymentStats> {
  //   const response = await axiosClient.get<PaymentStats>(`${API_ENDPOINTS.PAYMENT.BASE}stats/`);
  //   return response;
  // }

  async verify(id: number): Promise<Payment> {
    const response = await axiosClient.post<Payment>(API_ENDPOINTS.PAYMENT.VERIFY(id));
    return response;
  }

  async unverify(id: number): Promise<Payment> {
    const response = await axiosClient.post<Payment>(API_ENDPOINTS.PAYMENT.UNVERIFY(id));
    return response;
  }

  async getByContract(contractId: number, params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<Payment>> {
    const response = await axiosClient.get<PaginatedResponse<Payment>>(
      `${API_ENDPOINTS.PAYMENT.BASE}by-contract/${contractId}/`,
      { params }
    );
    return response;
  }

  private toFormData(data: PaymentFormData): FormData {
    const formData = new FormData();

    if (data.payment_number) formData.append('payment_number', data.payment_number);
    formData.append('amount', String(data.amount));
    // formData.append('payment_date', data.payment_date);
     if (data.payment_date !== undefined && data.payment_date !== null) {
    formData.append('payment_date', data.payment_date);
  } else {
    //  اگر null است، رشته خالی ارسال کن تا بک‌اند مقدار را پاک کند
    formData.append('payment_date', '');
  }
    if (data.description) formData.append('description', data.description);
    if (data.is_paid !== undefined) formData.append('is_paid', String(data.is_paid));
    if (data.is_verified !== undefined) formData.append('is_verified', String(data.is_verified));
    formData.append('contract_id', String(data.contract_id));
    // formData.append('receiver_id', String(data.receiver_id));
    formData.append('payment_type_id', String(data.payment_type_id));

    //  فایل‌های پیوست چندگانه
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

    return formData;
  }
}

export const paymentApi = new PaymentApi();

