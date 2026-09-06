// src/core/services/CommunicationService.ts

import type { Communication, CommunicationFormData } from '../types';
import communicationsApi from '../apis/communicationApi';

export class CommunicationService {
  private queryKey = 'communications';

  // ========== دریافت همه ==========
  async getAll(params?: Record<string, any>): Promise<Communication[]> {
    console.log('📤 CommunicationService.getAll:', params);
    return await communicationsApi.getAll();
  }

  // ========== دریافت یکی ==========
  async getById(id: number): Promise<Communication> {
    console.log('📤 CommunicationService.getById:', id);
    return await communicationsApi.getById(id);
  }

  // ========== ایجاد ==========
  async create(data: CommunicationFormData, onProgress?: (p: number) => void): Promise<Communication> {
    console.log('📤 CommunicationService.create:', data);
    return await communicationsApi.create(data, onProgress);
  }

  // ========== ویرایش ==========
  async update(id: number, data: CommunicationFormData, onProgress?: (p: number) => void): Promise<Communication> {
    console.log('🔥🔥🔥 CommunicationService.update CALLED');
    console.log('📤 id:', id);
    console.log('📤 data:', data);
    console.log('📤 data.attachment:', data.attachment);
    console.log('📤 data.attachment === null:', data.attachment === null);
    console.log('📤 data.letter_file:', data.letter_file);
    console.log('📤 data.letter_file === null:', data.letter_file === null);
    
    // ✅ مستقیماً communicationsApi.update رو صدا بزن
    const result = await communicationsApi.update(id, data, onProgress);
    console.log('🔥🔥🔥 CommunicationService.update RESULT:', result);
    return result;
  }

  // ========== حذف ==========
  async delete(id: number): Promise<void> {
    console.log('📤 CommunicationService.delete:', id);
    return await communicationsApi.delete(id);
  }

  // ========== بروزرسانی ==========
  async refetch(): Promise<void> {
    console.log('📤 CommunicationService.refetch');
  }

  getQueryKey(): string {
    return this.queryKey;
  }
}

export default CommunicationService;

// 