// src/components/generic/GenericFormModal.tsx

import React, { useState, useEffect } from 'react';
import type { FieldConfig } from '../../types/generic';
import JalaliDatePicker from '../JalaliDatePicker';
import { GenericSearchableSelect } from './GenericSearchableSelect';
import { Plus, FileText, Paperclip, Eye, Download, X } from 'lucide-react';
import { FileUploader } from '@components/common';

// ✅ interface با dataProvider برای وابستگی‌ها
interface FormExtraData {
  [key: string]: any[];
}

interface GenericFormModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  fields: FieldConfig[];
  initialData?: Partial<T>;
  isLoading?: boolean;
  uploadProgress?: number;
  isEditing?: boolean;
  currentFiles?: Record<string, string | null>;
  onFileRemove?: (field: string) => void;
  renderCustomField?: (field: FieldConfig, value: any, onChange: (value: any) => void) => React.ReactNode;
  extraData?: FormExtraData;
  getFieldOptions?: (field: FieldConfig, formData: Record<string, any>, extraData?: FormExtraData) => any[];
  isFieldDisabled?: (field: FieldConfig, formData: Record<string, any>) => boolean;
}

export function GenericFormModal<T>({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields,
  initialData = {},
  isLoading = false,
  uploadProgress = 0,
  isEditing = false,
  currentFiles = {},
  onFileRemove,
  renderCustomField,
  extraData = {},
  getFieldOptions,
  isFieldDisabled,
}: GenericFormModalProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // ========== useEffect ==========
  useEffect(() => {
    if (isOpen) {
      const newFormData = { ...initialData };
      
      if (currentFiles) {
        Object.keys(currentFiles).forEach(key => {
          if (currentFiles[key] === null) {
            newFormData[key] = null;
          }
        });
      }
      
      setFormData(newFormData);
      setErrors({});
      setTouched({});
    }
  }, [isOpen, initialData, currentFiles]);

  // ========== توابع پیش‌فرض ==========
  const defaultGetFieldOptions = (field: FieldConfig, data: Record<string, any>, extra?: FormExtraData): any[] => {
    if (field.options && field.options.length > 0) {
      return field.options;
    }
    
    if (extra && extra[field.name]) {
      return extra[field.name] || [];
    }
    
    if (field.dependsOn && extra && extra[field.name]) {
      const parentValue = data[field.dependsOn];
      if (parentValue) {
        return extra[field.name]?.filter((item: any) => {
          return item.parentId === parentValue || item.province === parentValue;
        }) || [];
      }
      return [];
    }
    
    return [];
  };

  const defaultIsFieldDisabled = (field: FieldConfig, data: Record<string, any>): boolean => {
    if (field.dependsOn) {
      return !data[field.dependsOn];
    }
    return false;
  };

  const getOptions = getFieldOptions || defaultGetFieldOptions;
  const isDisabled = isFieldDisabled || defaultIsFieldDisabled;

  const handleChange = (name: string, value: any) => {
    console.log(`🔥 handleChange: ${name} =`, value, 'type:', typeof value);
  console.log(`🔥 is null?`, value === null);
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      fields.forEach(f => {
        if (f.dependsOn === name) {
          newData[f.name] = undefined;
        }
      });
          console.log(`🔥 newData[${name}]:`, newData[name]);
      return newData;
    });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name: string, value: any): boolean => {
    const field = fields.find(f => f.name === name);
    if (!field) return true;

    let error = '';

    if (field.required && (!value || value === '' || value === undefined || value === null)) {
      error = `فیلد "${field.label}" الزامی است`;
    }

    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'فرمت ایمیل نامعتبر است';
    }

    if (field.name === 'phone' && value && !/^[\d\+\-\(\)\s]{6,15}$/.test(value)) {
      error = 'فرمت تلفن نامعتبر است';
    }

    if (field.name === 'website' && value && !/^https?:\/\/[^\s]+$/.test(value)) {
      error = 'فرمت وبسایت نامعتبر است (مثال: https://example.com)';
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = formData[field.name];
      if (field.required && (!value || value === '' || value === undefined || value === null)) {
        newErrors[field.name] = `فیلد "${field.label}" الزامی است`;
        isValid = false;
      }
      
      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors[field.name] = 'فرمت ایمیل نامعتبر است';
        isValid = false;
      }
      
      if (field.name === 'phone' && value && !/^[\d\+\-\(\)\s]{6,15}$/.test(value)) {
        newErrors[field.name] = 'فرمت تلفن نامعتبر است';
        isValid = false;
      }
      
      if (field.name === 'website' && value && !/^https?:\/\/[^\s]+$/.test(value)) {
        newErrors[field.name] = 'فرمت وبسایت نامعتبر است (مثال: https://example.com)';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleFileChange = (name: string, file: File | undefined) => {
    if (file) {
      handleChange(name, file);
      console.log('✅ File saved:', file.name, file.type);
    } else {
    // ❌ اگه فایل حذف شد، null بذار
    // handleChange(name, null);
    handleChange(name, undefined);
    console.log('🗑️ File removed');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    } else {
      const firstError = document.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // ========== تابع دریافت نام فایل از URL ==========
  const getFileName = (url: string) => {
    if (!url) return 'فایل';
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || 'فایل';
    } catch {
      return 'فایل';
    }
  };

  // ========== تابع حذف فایل ==========
  const handleRemoveFile = (fieldName: string) => {
    // 1. مقدار فایل رو در فرم null کن
    handleChange(fieldName, null);
    // 2. اگر onFileRemove وجود داره، صدا بزن
    if (onFileRemove) {
      onFileRemove(fieldName);
    }
  };

  const renderField = (field: FieldConfig) => {
    const value = formData[field.name] !== undefined ? formData[field.name] : '';
    const error = errors[field.name];
    const isTouched = touched[field.name];
    const showError = error && isTouched;
    const invalidClass = showError ? 'is-invalid' : '';
    const options = getOptions(field, formData, extraData);
    const disabled = isDisabled(field, formData) || field.disabled || false;

    let fieldContent = null;

    // ========== فیلد select با قابلیت جستجو ==========
    if (field.isSearchable && field.type === 'select') {
      fieldContent = (
        <>
          <GenericSearchableSelect
            options={options}
            value={value}
            onChange={(newValue) => handleChange(field.name, newValue)}
            placeholder={field.placeholder || `${field.label} را انتخاب کنید...`}
            searchPlaceholder={`جستجو در ${field.label}...`}
            label=""
            required={field.required}
            error={showError ? error : ''}
            disabled={disabled}
          />
          {showError && (
            <div className="invalid-feedback d-block">
              {error}
            </div>
          )}
          {field.dependsOn && !formData[field.dependsOn] && (
            <div className="form-hint text-warning small mt-1">
              لطفاً ابتدا {fields.find(f => f.name === field.dependsOn)?.label} را انتخاب کنید
            </div>
          )}
        </>
      );
    } 
    // ========== فیلد سفارشی ==========
    else if (renderCustomField) {
      const customRendered = renderCustomField(field, value, (newValue: any) => {
        handleChange(field.name, newValue);
      });
      if (customRendered) {
        fieldContent = (
          <>
            {customRendered}
            {showError && (
              <div className="invalid-feedback d-block">
                {error}
              </div>
            )}
          </>
        );
      }
    } 
    // ========== فیلد تاریخ ==========
    else if (field.type === 'date') {
      fieldContent = (
        <>
          <JalaliDatePicker
            value={value as string}
            onChange={(newValue) => handleChange(field.name, newValue)}
            label={field.label}
            required={field.required}
            placeholder={field.placeholder || '1402/12/25'}
            error={field.error}
            disabled={disabled}
          />
          {showError && (
            <div className="invalid-feedback d-block">
              {error}
            </div>
          )}
        </>
      );
    } 
    // ========== سایر فیلدها ==========
    else {
      switch (field.type) {
        case 'textarea':
          fieldContent = (
            <>
              <textarea
                className={`form-control ${invalidClass}`}
                rows={3}
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value)}
                onBlur={() => handleBlur(field.name)}
                required={field.required}
                placeholder={field.placeholder}
                disabled={disabled}
              />
              {showError && (
                <div className="invalid-feedback d-block">
                  {error}
                </div>
              )}
            </>
          );
          break;

        case 'select':
          const selectOptions = getOptions(field, formData, extraData);
          
          fieldContent = (
            <>
              <select
                className={`form-select ${invalidClass}`}
                value={value || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                onBlur={() => handleBlur(field.name)}
                required={field.required}
                disabled={disabled}
              >
                <option value="">{field.placeholder || 'انتخاب کنید...'}</option>
                {selectOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {showError && (
                <div className="invalid-feedback d-block">
                  {error}
                </div>
              )}
              {field.dependsOn && !formData[field.dependsOn] && (
                <div className="form-hint text-warning small mt-1">
                  لطفاً ابتدا {fields.find(f => f.name === field.dependsOn)?.label} را انتخاب کنید
                </div>
              )}
            </>
          );
          break;
  case 'file':
  fieldContent = (
    <FileUploader
      name={field.name}
      value={value}
      onChange={(newValue) => {
        console.log(`📝 FileUploader onChange[${field.name}]:`, newValue);
        handleChange(field.name, newValue);
      }}
      label={field.label}
      required={field.required}
      error={showError ? error : undefined}
      disabled={disabled}
      accept={field.accept || 'image/*,application/pdf,.doc,.docx,.xls,.xlsx'}
      maxSize={10 * 1024 * 1024}
      description={field.description || 'حداکثر حجم: ۱۰ مگابایت'}
      className="w-100"
    />
  );
  break;


        default:
          fieldContent = (
            <>
              <input
                type={field.type}
                className={`form-control ${invalidClass}`}
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value)}
                onBlur={() => handleBlur(field.name)}
                required={field.required}
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                disabled={disabled}
              />
              {showError && (
                <div className="invalid-feedback d-block">
                  {error}
                </div>
              )}
            </>
          );
          break;
      }
    }

    const addButton = (field as any).addButton;
    // ✅ تشخیص فیلد تاریخ برای جلوگیری از دوبار لیبل
    const isDateField = field.type === 'date';

    return (
      <div>
        {/* ✅ فقط برای فیلدهای غیر از date لیبل نمایش بده */}
        {!isDateField && (
          <label className="form-label">
            {field.label} {field.required && <span className="text-danger">*</span>}
          </label>
        )}
        <div className={`field-wrapper ${addButton ? 'with-add-button' : ''}`}>
          {fieldContent}
          {addButton && (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary add-field-btn"
              onClick={addButton.onClick}
            >
              <Plus size={14} />
              {addButton.label}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body">
              {Object.values(errors).filter(e => e).length > 0 && (
                <div className="alert alert-danger">
                  <strong>لطفاً خطاهای زیر را برطرف کنید:</strong>
                  <ul className="mb-0 mt-1">
                    {Object.values(errors).filter(e => e).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="row">
                {fields.map((field) => (
                  <div key={field.name} className={`col-${field.colSize || 12} mb-3`}>
                    {renderField(field)}
                  </div>
                ))}
              </div>
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="progress mt-3">
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    {uploadProgress}%
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                انصراف
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'در حال پردازش...' : (isEditing ? 'ویرایش' : 'افزودن')}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style>{`
        .invalid-feedback {
          display: block !important;
          font-size: 0.875rem;
          color: #dc3545;
          margin-top: 0.25rem;
        }

        .is-invalid {
          border-color: #dc3545 !important;
        }

        .is-invalid:focus {
          border-color: #dc3545 !important;
          box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25) !important;
        }

        .form-control.is-invalid,
        .form-select.is-invalid {
          background-image: none !important;
        }

        .alert-danger {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          padding: 0.75rem 1.25rem;
          border-radius: 0.25rem;
          margin-bottom: 1rem;
        }

        .alert-danger ul {
          padding-right: 1.5rem;
          margin-bottom: 0;
        }

        .form-hint {
          font-size: 0.8rem;
          margin-top: 4px;
        }

        .field-wrapper {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .field-wrapper.with-add-button {
          flex-direction: column;
        }

        .field-wrapper.with-add-button > *:first-child {
          flex: 1;
          width: 100%;
        }

        .add-field-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          font-size: 12px;
          border-radius: 6px;
          margin-top: 4px;
          white-space: nowrap;
        }

        @media (min-width: 768px) {
          .field-wrapper.with-add-button {
            flex-direction: row;
            align-items: center;
          }

          .field-wrapper.with-add-button > *:first-child {
            flex: 1;
          }

          .add-field-btn {
            margin-top: 0;
            margin-right: 8px;
          }
        }

        /* ✅ استایل‌های نمایش فایل */
        .current-file-wrapper {
          background: #f8fafc;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 12px;
          margin-top: 8px;
        }

        .current-file-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .file-preview {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: white;
          border: 1px solid #e9ecef;
          overflow: hidden;
          flex-shrink: 0;
        }

        .file-preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .file-preview-pdf {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #dc2626;
          font-size: 10px;
          font-weight: 600;
        }

        .file-preview-pdf svg {
          color: #dc2626;
        }

        .file-preview-generic {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .file-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .file-name {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a2e;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .file-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #4f46e5;
          text-decoration: none;
          padding: 2px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .file-link:hover {
          background: #eef2ff;
          text-decoration: none;
          color: #4f46e5;
        }

        .file-link.download-link {
          color: #059669;
        }

        .file-link.download-link:hover {
          background: #d1fae5;
          color: #059669;
        }

        .file-remove-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #dc2626;
          background: none;
          border: none;
          padding: 2px 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .file-remove-btn:hover {
          background: #fee2e2;
        }

        @media (max-width: 480px) {
          .current-file-info {
            flex-direction: column;
            align-items: flex-start;
          }

          .file-actions {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}

//