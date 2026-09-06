import React, { useState, useEffect } from 'react';
import { useSettlement } from '../hooks/useSettlement';
import type { Settlement, SettlementFormData } from '../types/settlement.types';
import { X, DollarSign, FileText, Upload, Eye, Download, Calendar } from 'lucide-react';
import JalaliDatePicker from '../../../components/JalaliDatePicker';
import { ContractSelect } from '../../contract/components/ContractSelect';
import { formatCurrency } from '../../../utils/formatter.utils';

interface SettlementFormProps {
  contractId?: number;
  initialData?: Settlement;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SettlementForm: React.FC<SettlementFormProps> = ({
  contractId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { create, update, isCreating, isUpdating } = useSettlement();

  const [formData, setFormData] = useState<SettlementFormData>({
    certificate_number: '',
    date: '',
    description: '',
    total_amount: 0,
    remaining_amount: 0,
    contract_id: contractId || 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isFileRemoved, setIsFileRemoved] = useState(false);

  const isEditing = !!initialData;
  const isStandalone = !contractId;

  // ========== پر کردن داده‌ها در حالت ویرایش ==========
  useEffect(() => {
    if (initialData) {
      let contractIdValue = contractId || 0;

      if (initialData.contract) {
        if (typeof initialData.contract === 'object') {
          contractIdValue = (initialData.contract as any).id || 0;
        } else {
          contractIdValue = initialData.contract as number;
        }
      }

      setFormData({
        certificate_number: initialData.certificate_number || '',
        date: initialData.date || '',
        description: initialData.description || '',
        contract_id: contractIdValue,
        certificate_file: initialData.certificate_file || null,
      });
      setIsFileRemoved(false);
      setSelectedFile(null);
      setSubmitAttempted(false);
      setErrors({});
      setTouched({});
    }
  }, [initialData, contractId]);

  // ========== Validation ==========
  const validateField = (field: keyof SettlementFormData, value: any): string | null => {
    switch (field) {
      case 'certificate_number':
        if (!value?.trim()) return 'شماره مفاصا الزامی است';
        return null;
      case 'date':
        if (!value) return 'تاریخ تسویه الزامی است';
        return null;
      case 'contract_id':
        if (!value || value <= 0) return 'انتخاب قرارداد الزامی است';
        return null;
      default:
        return null;
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    const fieldsToValidate: (keyof SettlementFormData)[] = [
      'certificate_number',
      'date',
    ];

    if (isStandalone || !contractId) {
      fieldsToValidate.push('contract_id');
    }

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasError = true;
      }
    });

    setErrors(newErrors);
    return !hasError;
  };

  // ========== Handlers ==========
  const handleChange = (field: keyof SettlementFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitAttempted || touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || '' }));
    }
  };

  const handleBlur = (field: keyof SettlementFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error || '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsFileRemoved(false);
      setFormData((prev) => ({ ...prev, certificate_file: file }));
      setUploadProgress(0);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setIsFileRemoved(true);
    setFormData((prev) => ({ ...prev, certificate_file: null }));
    const fileInput = document.getElementById('certificate_file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const getFileName = (url: string) => {
    if (!url) return 'فایل';
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || 'فایل';
    } catch {
      return 'فایل';
    }
  };

  // ========== Submit ==========
// src/modules/settlement/components/SettlementForm.tsx

// ... (قسمت‌های دیگر保持不变) ...

// ========== Submit ==========
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitAttempted(true);

  const allTouched: Record<string, boolean> = {};
  Object.keys(formData).forEach((key) => {
    allTouched[key] = true;
  });
  setTouched(allTouched);

  if (!validate()) {
    const firstError = document.querySelector('.is-invalid');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  try {
    // ✅ اینجا فقط contract_id را ارسال می‌کنیم
    // API layer مسئول تبدیل contract_id به contract است
    const submitData: SettlementFormData = {
      certificate_number: formData.certificate_number,
      date: formData.date,
      description: formData.description || '',
      contract_id: formData.contract_id,  // ← فقط contract_id
      certificate_file: formData.certificate_file,
    };

    console.log('📤 Submitting Settlement data:', submitData);

    setUploadProgress(0);

    if (isEditing && initialData) {
      await update(initialData.id, submitData, (progress) => {
        setUploadProgress(progress);
      });
    } else {
      await create(submitData, (progress) => {
        setUploadProgress(progress);
      });
    }
    onSuccess?.();
  } catch (error: any) {
    console.error('Submit error:', error);
    if (error.response?.data) {
      const serverErrors = error.response.data;
      if (typeof serverErrors === 'object') {
        Object.keys(serverErrors).forEach((field) => {
          const errorMessage = Array.isArray(serverErrors[field])
            ? serverErrors[field][0]
            : serverErrors[field];
          
          // ✅ mapping خطاها
          const fieldMapping: Record<string, string> = {
            'contract': 'contract_id',
          };
          const formField = fieldMapping[field] || field;
          
          setErrors((prev) => ({ ...prev, [formField]: errorMessage }));
          setTouched((prev) => ({ ...prev, [formField]: true }));
        });
      }
    }
  }
};


  // ========== Render ==========
  return (
    <div className="settlement-form">
      <div className="form-header">
        <h3>{isEditing ? 'ویرایش تسویه حساب' : 'ثبت تسویه حساب جدید'}</h3>
        <button className="close-btn" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-body">
          {isStandalone && (
            <div className="form-group">
              <label>قرارداد <span className="required">*</span></label>
              <ContractSelect
                value={formData.contract_id || null}
                onChange={(id) => handleChange('contract_id', id || 0)}
                placeholder="انتخاب قرارداد..."
                label=""
                required={true}
                error={errors.contract_id}
              />
              {(touched.contract_id || submitAttempted) && errors.contract_id && (
                <span className="error-text">{errors.contract_id}</span>
              )}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>شماره مفاصا <span className="required">*</span></label>
              <input
                type="text"
                placeholder="مثال: SET-1402-001"
                value={formData.certificate_number || ''}
                onChange={(e) => handleChange('certificate_number', e.target.value)}
                onBlur={() => handleBlur('certificate_number')}
                className={(touched.certificate_number || submitAttempted) && errors.certificate_number ? 'is-invalid' : ''}
              />
              {(touched.certificate_number || submitAttempted) && errors.certificate_number && (
                <span className="error-text">{errors.certificate_number}</span>
              )}
            </div>
            <div className="form-group">
              <label>تاریخ تسویه <span className="required">*</span></label>
              <JalaliDatePicker
                value={formData.date || null}
                onChange={(date) => handleChange('date', date)}
                placeholder="1402/01/01"
                label=""
                error={errors.date}
                disabled={isCreating || isUpdating}
              />
              {(touched.date || submitAttempted) && errors.date && (
                <span className="error-text">{errors.date}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>توضیحات</label>
            <textarea
              rows={3}
              placeholder="توضیحات تکمیلی..."
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
            />
          </div>

          <div className="form-group">
            <label>فایل مفاصا</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="certificate_file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label htmlFor="certificate_file" className="file-upload-label">
                <Upload size={18} />
                <span>انتخاب فایل مفاصا</span>
              </label>

              {selectedFile && (
                <div className="file-info">
                  <FileText size={14} />
                  <span className="file-name">{selectedFile.name}</span>
                  <span className="file-size">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                  <button type="button" className="file-remove" onClick={handleFileRemove}>
                    <X size={14} />
                  </button>
                </div>
              )}

              {!selectedFile && !isFileRemoved && initialData?.certificate_file && (
                <div className="file-info existing">
                  <a
                    href={initialData.certificate_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-link"
                    title="مشاهده فایل"
                  >
                    <Eye size={14} />
                  </a>
                  <a
                    href={initialData.certificate_file}
                    download
                    className="file-link download"
                    title="دانلود فایل"
                  >
                    <Download size={14} />
                  </a>
                  <span className="file-name">{getFileName(initialData.certificate_file)}</span>
                  <button type="button" className="file-remove" onClick={handleFileRemove}>
                    <X size={14} />
                  </button>
                </div>
              )}

              {isEditing && isFileRemoved && !selectedFile && (
                <div className="file-info removed">
                  <span className="file-name" style={{ color: '#dc2626' }}>
                    فایل حذف شده است
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-wrapper">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          )}
        </div>

        <div className="form-footer">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            انصراف
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? (
              <>
                <span className="spinner-border spinner-border-sm" />
                در حال پردازش...
              </>
            ) : (
              isEditing ? 'ویرایش' : 'ثبت'
            )}
          </button>
        </div>
      </form>

      <style>{`
        .settlement-form {
          padding: 24px;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e9ecef;
        }

        .form-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .close-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #f3f4f6;
          color: #1a1a2e;
        }

        .form-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .required {
          color: #dc2626;
        }

        .form-group input,
        .form-group textarea {
          padding: 10px 14px;
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
          font-family: inherit;
          width: 100%;
          background: white;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .form-group input.is-invalid {
          border-color: #dc2626;
        }

        .error-text {
          font-size: 12px;
          color: #dc2626;
          margin-top: 2px;
        }

        .input-with-icon {
          position: relative;
        }

        .input-with-icon .input-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .input-with-icon input {
          padding-right: 36px;
        }

        .file-upload-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .file-upload-wrapper input[type="file"] {
          display: none;
        }

        .file-upload-label {
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

        .file-upload-label:hover {
          border-color: #4f46e5;
          background: #eef2ff;
          color: #4f46e5;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f8fafc;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          flex-wrap: wrap;
        }

        .file-info.existing {
          background: #eef2ff;
          border-color: #c7d2fe;
        }

        .file-info.removed {
          background: #fee2e2;
          border-color: #fecaca;
        }

        .file-name {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a2e;
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

        .file-remove:hover {
          background: #fee2e2;
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

        .progress-wrapper {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          font-weight: 500;
          color: #4f46e5;
          min-width: 40px;
        }

        .form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e9ecef;
        }

        .btn-secondary {
          padding: 10px 24px;
          border: 1.5px solid #e9ecef;
          border-radius: 8px;
          background: white;
          color: #6b7280;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #f8fafc;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 32px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #4338ca;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner-border {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .settlement-form {
            padding: 16px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-footer {
            flex-direction: column-reverse;
          }

          .form-footer button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default SettlementForm;