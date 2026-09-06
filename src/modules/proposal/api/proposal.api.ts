// src/modules/proposal/api/proposal.api.ts

import { axiosClient } from '../../../api/client/axiosClient';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type { Proposal, ProposalFormData, ProposalFilters, ProposalStats } from '../types/proposal.types';
import type { PaginatedResponse } from '../../../types/common.types';

class ProposalApi {
  // ========== CRUD Operations ==========

  async getAll(params?: ProposalFilters): Promise<PaginatedResponse<Proposal>> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof ProposalFilters];
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          cleanParams[key] = value;
        }
      });
    }
    
    const response = await axiosClient.get<PaginatedResponse<Proposal>>(
      API_ENDPOINTS.PROPOSAL.BASE,
      { params: cleanParams }
    );
    return response;
  }
  
  async getPaginated(params?: ProposalFilters & { page?: number; pageSize?: number }): Promise<PaginatedResponse<Proposal>> {
    const response = await axiosClient.get<PaginatedResponse<Proposal>>(
      API_ENDPOINTS.PROPOSAL.BASE,
      { params }
    );
    return response;
  }

  async getById(id: number): Promise<Proposal> {
    const response = await axiosClient.get<Proposal>(API_ENDPOINTS.PROPOSAL.DETAIL(id));
    return response;
  }

  async create(data: ProposalFormData, onProgress?: (progress: number) => void): Promise<Proposal> {
    const formData = this.toFormData(data);
    const response = await axiosClient.post<Proposal>(
      API_ENDPOINTS.PROPOSAL.BASE,
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

  async update(id: number, data: ProposalFormData, onProgress?: (progress: number) => void): Promise<Proposal> {
    const formData = this.toFormData(data);
    const response = await axiosClient.put<Proposal>(
      API_ENDPOINTS.PROPOSAL.DETAIL(id),
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

  async patch(id: number, data: Partial<ProposalFormData>): Promise<Proposal> {
    const response = await axiosClient.patch<Proposal>(API_ENDPOINTS.PROPOSAL.DETAIL(id), data);
    return response;
  }

  async delete(id: number): Promise<void> {
    await axiosClient.delete<void>(API_ENDPOINTS.PROPOSAL.DETAIL(id));
  }

  // ========== Stats ==========
  async getStats(): Promise<ProposalStats> {
    const response = await axiosClient.get<ProposalStats>(`${API_ENDPOINTS.PROPOSAL.BASE}stats/`);
    return response;
  }

  // ========== Custom Operations ==========
  async getByRfp(rfpId: number): Promise<Proposal[]> {
    const response = await this.getAll({ rfp: rfpId });
    return response.results || [];
  }

  async getByUniversity(universityId: number): Promise<Proposal[]> {
    const response = await this.getAll({ university: universityId });
    return response.results || [];
  }

  async getWinners(): Promise<Proposal[]> {
    const response = await this.getAll({ is_winner: true });
    return response.results || [];
  }

  // ========== Helper Methods ==========
  private toFormData(data: ProposalFormData): FormData {
    const formData = new FormData();

    // فیلدهای متنی
    if (data.code) formData.append('code', data.code);
    formData.append('title_farsi', data.title_farsi);
    if (data.title_english) formData.append('title_english', data.title_english);
    if (data.approved_date !== undefined && data.approved_date !== null) {
    formData.append('approved_date', data.approved_date);
  } else {
    // ✅ اگر null است، رشته خالی ارسال کن تا بک‌اند مقدار را پاک کند
    formData.append('approved_date', '');
  }
    // if (data.approved_date) formData.append('approved_date', data.approved_date);
    formData.append('execution_location', data.execution_location);
    formData.append('execution_time', String(data.execution_time));
    if (data.is_winner !== undefined) {
      formData.append('is_winner', String(data.is_winner));
    }
    if (data.keywords) formData.append('keywords', data.keywords);

    // فیلدهای ارتباطی
    if (data.project_subject_id && data.project_subject_id > 0) {
      formData.append('project_subject', String(data.project_subject_id));
    }
    
    if (data.rfp_id && data.rfp_id > 0) {
      formData.append('rfp', String(data.rfp_id));
    }
    
    if (data.university_id && data.university_id > 0) {
      formData.append('university', String(data.university_id));
    }
    
    if (data.primary_researcher_id && data.primary_researcher_id > 0) {
      formData.append('primary_researcher', String(data.primary_researcher_id));
    }
    
    if (data.company_id && data.company_id > 0) {
      formData.append('company', String(data.company_id));
    }

    // ✅ فایل‌های پیوست چندگانه
    if (data.attachment_files && data.attachment_files.length > 0) {
      data.attachment_files.forEach((file) => {
        formData.append('attachment_files', file);
      });
    }

    // ✅ آیدی فایل‌هایی که باید حذف شوند
    if (data.deleted_attachment_ids && data.deleted_attachment_ids.length > 0) {
      data.deleted_attachment_ids.forEach((id) => {
        formData.append('deleted_attachment_ids', String(id));
      });
    }

    return formData;
  }
}

export const proposalApi = new ProposalApi();
