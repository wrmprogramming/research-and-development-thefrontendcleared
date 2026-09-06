// src/dtos/base.dto.ts

export interface BaseDTO {
  id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDTO {
  // برای ایجاد
}

export interface UpdateDTO {
  // برای ویرایش
}

// ========== DTO برای فایل‌ها ==========
export interface FileDTO {
  file: File | string | null;
  isDeleted: boolean;
  isNew: boolean;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

// ========== ابزارهای مدیریت فایل در DTO ==========
export class FileDTOHelper {
  static createFromFile(file: File): FileDTO {
    return {
      file: file,
      isDeleted: false,
      isNew: true,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };
  }

  static createFromUrl(url: string): FileDTO {
    return {
      file: url,
      isDeleted: false,
      isNew: false,
      fileName: url.split('/').pop() || 'فایل',
    };
  }

  static createForDelete(): FileDTO {
    return {
      file: null,
      isDeleted: true,
      isNew: false,
    };
  }

  static isEmpty(fileDTO: FileDTO | null | undefined): boolean {
    if (!fileDTO) return true;
    return !fileDTO.file && !fileDTO.isNew && !fileDTO.isDeleted;
  }

  static shouldDelete(fileDTO: FileDTO): boolean {
    return fileDTO.isDeleted === true;
  }

  static shouldUpload(fileDTO: FileDTO): boolean {
    return fileDTO.isNew === true && fileDTO.file instanceof File;
  }

  static getFileForApi(fileDTO: FileDTO): File | string | null {
    if (fileDTO.isDeleted) {
      return null;
    }
    if (fileDTO.isNew && fileDTO.file instanceof File) {
      return fileDTO.file;
    }
    return fileDTO.file as string;
  }
}