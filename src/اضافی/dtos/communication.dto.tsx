// src/dtos/communication.dto.ts

import type { BaseDTO } from './base.dto';
import { type FileDTO, FileDTOHelper } from './base.dto';

// ========== DTO برای نمایش مکاتبه ==========
export interface CommunicationResponseDTO extends BaseDTO {
  id: number;
  title: string;
  description?: string;
  sender: string;
  receiver: string;
  date: string;
  send_date?: string;
  receive_date?: string;
  attachment: string | null;
  letter_file: string | null;
  contract?: number | { id: number; contract_number: string };
  research?: number | { id: number; code: string };
  created_at?: string;
  updated_at?: string;
}

// ========== DTO برای ایجاد مکاتبه ==========
export interface CommunicationCreateDTO {
  title: string;
  sender: string;
  receiver: string;
  date: string;
  description?: string;
  send_date?: string;
  receive_date?: string;
  contract?: number;
  research?: number;
  attachment?: File | null;
  letter_file?: File | null;
}

// ========== DTO برای ویرایش مکاتبه ==========
export interface CommunicationUpdateDTO {
  title?: string;
  sender?: string;
  receiver?: string;
  date?: string;
  description?: string | null;
  send_date?: string | null;
  receive_date?: string | null;
  contract?: number | null;
  research?: number | null;
  attachment?: File | string | null;
  letter_file?: File | string | null;
}

// ========== DTO برای فرم مکاتبه ==========
export interface CommunicationFormDTO {
  title: string;
  sender: string;
  receiver: string;
  date: string;
  description: string;
  send_date: string;
  receive_date: string;
  contractId: number | null;
  researchId: number | null;
  attachment: FileDTO | null;
  letter_file: FileDTO | null;
}

// ========== Factory برای ساخت CommunicationFormDTO ==========
export class CommunicationFormDTOFactory {
  static createEmpty(): CommunicationFormDTO {
    return {
      title: '',
      sender: '',
      receiver: '',
      date: '',
      description: '',
      send_date: '',
      receive_date: '',
      contractId: null,
      researchId: null,
      attachment: null,
      letter_file: null,
    };
  }

  static createFromResponse(response: CommunicationResponseDTO): CommunicationFormDTO {
    return {
      title: response.title || '',
      sender: response.sender || '',
      receiver: response.receiver || '',
      date: response.date || '',
      description: response.description || '',
      send_date: response.send_date || '',
      receive_date: response.receive_date || '',
      contractId: typeof response.contract === 'object' ? response.contract?.id : response.contract || null,
      researchId: typeof response.research === 'object' ? response.research?.id : response.research || null,
      attachment: response.attachment ? FileDTOHelper.createFromUrl(response.attachment) : null,
      letter_file: response.letter_file ? FileDTOHelper.createFromUrl(response.letter_file) : null,
    };
  }

  static createFromFormData(data: any): CommunicationFormDTO {
    return {
      title: data.title || '',
      sender: data.sender || '',
      receiver: data.receiver || '',
      date: data.date || '',
      description: data.description || '',
      send_date: data.send_date || '',
      receive_date: data.receive_date || '',
      contractId: data.contractId || null,
      researchId: data.researchId || null,
      attachment: data.attachment instanceof File 
        ? FileDTOHelper.createFromFile(data.attachment)
        : data.attachment === null 
          ? FileDTOHelper.createForDelete()
          : null,
      letter_file: data.letter_file instanceof File 
        ? FileDTOHelper.createFromFile(data.letter_file)
        : data.letter_file === null 
          ? FileDTOHelper.createForDelete()
          : null,
    };
  }
}

// ========== تبدیل Form به Create DTO ==========
export const toCommunicationCreateDTO = (formData: CommunicationFormDTO): CommunicationCreateDTO => {
  const result: CommunicationCreateDTO = {
    title: formData.title.trim(),
    sender: formData.sender.trim(),
    receiver: formData.receiver.trim(),
    date: formData.date,
  };

  if (formData.description) result.description = formData.description.trim();
  if (formData.send_date) result.send_date = formData.send_date;
  if (formData.receive_date) result.receive_date = formData.receive_date;
  if (formData.contractId) result.contract = formData.contractId;
  if (formData.researchId) result.research = formData.researchId;
  
  // ✅ مدیریت فایل‌ها با FileDTO
  if (formData.attachment) {
    if (FileDTOHelper.shouldUpload(formData.attachment)) {
      result.attachment = formData.attachment.file as File;
    }
    // اگر shouldDelete باشد، null ارسال می‌کنیم
    if (FileDTOHelper.shouldDelete(formData.attachment)) {
      result.attachment = null;
    }
  }
  
  if (formData.letter_file) {
    if (FileDTOHelper.shouldUpload(formData.letter_file)) {
      result.letter_file = formData.letter_file.file as File;
    }
    if (FileDTOHelper.shouldDelete(formData.letter_file)) {
      result.letter_file = null;
    }
  }

  return result;
};

// ========== تبدیل Form به Update DTO ==========
export const toCommunicationUpdateDTO = (formData: CommunicationFormDTO): CommunicationUpdateDTO => {
  const result: CommunicationUpdateDTO = {};

  if (formData.title) result.title = formData.title.trim();
  if (formData.sender) result.sender = formData.sender.trim();
  if (formData.receiver) result.receiver = formData.receiver.trim();
  if (formData.date) result.date = formData.date;
  if (formData.description !== undefined) result.description = formData.description?.trim() || null;
  if (formData.send_date !== undefined) result.send_date = formData.send_date || null;
  if (formData.receive_date !== undefined) result.receive_date = formData.receive_date || null;
  if (formData.contractId !== undefined) result.contract = formData.contractId;
  if (formData.researchId !== undefined) result.research = formData.researchId;
  
  // ✅ مدیریت فایل‌ها با FileDTO
  if (formData.attachment) {
    if (FileDTOHelper.shouldDelete(formData.attachment)) {
      result.attachment = null; // برای حذف
    } else if (FileDTOHelper.shouldUpload(formData.attachment)) {
      result.attachment = formData.attachment.file; // فایل جدید
    }
  }
  
  if (formData.letter_file) {
    if (FileDTOHelper.shouldDelete(formData.letter_file)) {
      result.letter_file = null; // برای حذف
    } else if (FileDTOHelper.shouldUpload(formData.letter_file)) {
      result.letter_file = formData.letter_file.file; // فایل جدید
    }
  }

  return result;
};