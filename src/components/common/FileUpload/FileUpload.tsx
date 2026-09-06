// src/components/common/FileUpload/FileUpload.tsx

import React, { useRef } from 'react';
import { Upload, X, FileText, Eye, Download } from 'lucide-react';
import './FileUpload.css';

export interface FileItem {
  id?: number;
  file?: File;
  name: string;
  size?: number;
  url?: string;
  isExisting?: boolean;
}

interface FileUploadProps {
  /** فایل‌های انتخاب شده */
  files: FileItem[];
  /** تابع اضافه کردن فایل */
  onAdd: (files: File[]) => void;
  /** تابع حذف فایل */
  onRemove: (file: FileItem, index: number) => void;
  /** فایل‌های موجود (برای ویرایش) */
  existingFiles?: FileItem[];
  /** کلاس‌های اضافی */
  className?: string;
  /** اکستنشن‌های مجاز */
  accept?: string;
  /** حداکثر تعداد فایل */
  maxFiles?: number;
  /** عنوان */
  label?: string;
  /** راهنما */
  hint?: string;
  /** غیرفعال */
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onAdd,
  onRemove,
  existingFiles = [],
  className = '',
  accept = 'image/*,application/pdf,.doc,.docx,.xls,.xlsx',
  maxFiles,
  label = 'فایل‌های پیوست',
  hint = 'می‌توانید چندین فایل را همزمان انتخاب کنید',
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles = Array.from(selectedFiles);
      if (maxFiles && files.length + newFiles.length > maxFiles) {
        alert(`حداکثر ${maxFiles} فایل مجاز است`);
        return;
      }
      onAdd(newFiles);
    }
    e.target.value = '';
  };

  const formatSize = (bytes?: number): string => {
    if (!bytes) return '0 KB';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const allFiles = [...existingFiles, ...files];

  return (
    <div className={`file-upload-component ${className}`}>
      {label && <label className="file-upload-label">{label}</label>}

      <div className="file-upload-wrapper">
        <input
          ref={inputRef}
          type="file"
          id="file-upload-input"
          onChange={handleFileChange}
          multiple
          accept={accept}
          disabled={disabled}
        />
        <label
          htmlFor="file-upload-input"
          className={`file-upload-dropzone ${disabled ? 'disabled' : ''}`}
        >
          <Upload size={18} />
          <span>انتخاب فایل‌ها</span>
          {maxFiles && <span className="file-count">(حداکثر {maxFiles} فایل)</span>}
        </label>

        {allFiles.length > 0 && (
          <div className="file-list">
            {existingFiles.length > 0 && (
              <div className="file-list-section existing">
                <div className="file-list-title">فایل‌های موجود:</div>
                {existingFiles.map((file, index) => (
                  <div key={file.id || index} className="file-info existing">
                    {file.url && (
                      <>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="file-link">
                          <Eye size={14} />
                        </a>
                        <a href={file.url} download className="file-link download">
                          <Download size={14} />
                        </a>
                      </>
                    )}
                    <FileText size={14} />
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatSize(file.size)}</span>
                    <button
                      type="button"
                      className="file-remove"
                      onClick={() => onRemove(file, index)}
                      disabled={disabled}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {files.length > 0 && (
              <div className="file-list-section new">
                {existingFiles.length > 0 && (
                  <div className="file-list-title">فایل‌های جدید:</div>
                )}
                {files.map((file, index) => (
                  <div key={index} className="file-info new">
                    <FileText size={14} />
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatSize(file.size)}</span>
                    <button
                      type="button"
                      className="file-remove"
                      onClick={() => onRemove(file, index)}
                      disabled={disabled}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {hint && <small className="file-hint">{hint}</small>}

      <style>{`
        .file-upload-component {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .file-upload-label {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .file-upload-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .file-upload-wrapper input[type="file"] {
          display: none;
        }

        .file-upload-dropzone {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #f3f4f6;
          border: 1.5px dashed #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #6b7280;
          transition: all 0.2s;
          width: fit-content;
        }

        .file-upload-dropzone:hover:not(.disabled) {
          border-color: #4f46e5;
          background: #eef2ff;
          color: #4f46e5;
        }

        .file-upload-dropzone.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .file-count {
          font-size: 11px;
          color: #6b7280;
          background: #e5e7eb;
          padding: 0 8px;
          border-radius: 10px;
        }

        .file-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 4px;
        }

        .file-list-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .file-list-section.existing {
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 8px;
        }

        .file-list-title {
          font-size: 12px;
          font-weight: 500;
          color: #374151;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: #f8fafc;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          flex-wrap: wrap;
        }

        .file-info.existing {
          background: #eef2ff;
          border-color: #c7d2fe;
        }

        .file-info.new {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }

        .file-name {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a2e;
          flex: 1;
          min-width: 60px;
        }

        .file-size {
          font-size: 12px;
          color: #6b7280;
        }

        .file-remove {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .file-remove:hover:not(:disabled) {
          background: #fee2e2;
        }

        .file-remove:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .file-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          color: #4f46e5;
          background: transparent;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          text-decoration: none;
        }

        .file-link:hover {
          background: #dbeafe;
        }

        .file-link.download {
          color: #059669;
        }

        .file-link.download:hover {
          background: #d1fae5;
        }

        .file-hint {
          font-size: 11px;
          color: #6b7280;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
};

export default FileUpload;

