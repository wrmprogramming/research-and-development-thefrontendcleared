// src/modules/contract-delay/components/ContractDelayForm.tsx

import React, { useState, useEffect } from 'react';
import { useContractDelay } from '../hooks/useContractDelay';
import type { ContractDelay, ContractDelayFormData, ContractDelayAttachment } from '../types/contractDelay.types';
import { X, Calendar, Clock, FileText, AlertCircle, CheckCircle, Upload, Download, Eye } from 'lucide-react';
import JalaliDatePicker from '../../../components/JalaliDatePicker';
import { ContractSelect } from '../../contract/components/ContractSelect';
import { formatJalaliDate, jalaliToGregorian } from '../../../utils/dateUtils';

interface ContractDelayFormProps {
  contractId?: number;
  initialData?: ContractDelay;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ContractDelayForm: React.FC<ContractDelayFormProps> = ({
  contractId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { create, update, isCreating, isUpdating } = useContractDelay();

  const [formData, setFormData] = useState<ContractDelayFormData>({
    delay_end_date: '',
    delay_days: 0,
    reason: '',
    is_allowed: false,
    contract_id: contractId || 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  // ✅ فایل‌های پیوست
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<ContractDelayAttachment[]>([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<number[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isEditing = !!initialData;
  const isStandalone = !contractId;

  // ========== Populate Data ==========
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
        delay_end_date: initialData.delay_end_date || '',
        delay_days: initialData.delay_days || 0,
        reason: initialData.reason || '',
        is_allowed: initialData.is_allowed || false,
        contract_id: contractIdValue,
      });

      setExistingAttachments(initialData.attachments || []);
      setDeletedAttachmentIds([]);
      setSelectedFiles([]);
      setSubmitAttempted(false);
      setErrors({});
      setTouched({});
    }
  }, [initialData, contractId]);

  // ========== Validation ==========
  const validateField = (field: keyof ContractDelayFormData, value: any): string | null => {
    switch (field) {
      case 'delay_end_date':
        if (!value) return 'تاریخ پایان مهلت تاخیر الزامی است';
        return null;
      case 'delay_days':
        if (value === undefined || value === null || value < 0) {
          return 'میزان تاخیر باید بیشتر یا مساوی صفر باشد';
        }
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

    const fieldsToValidate: (keyof ContractDelayFormData)[] = ['delay_end_date', 'delay_days'];
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

  const handleChange = (field: keyof ContractDelayFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitAttempted || touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || '' }));
    }
  };

  const handleBlur = (field: keyof ContractDelayFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error || '' }));
  };

  // ========== File Handlers ==========
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
    e.target.value = '';
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleExistingAttachmentRemove = (id: number) => {
    setDeletedAttachmentIds(prev => [...prev, id]);
    setExistingAttachments(prev => prev.filter(att => att.id !== id));
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

  // ========== Submit - با الگوی پژوهش ==========
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
      const submitData: ContractDelayFormData = {
        // ✅ تبدیل تاریخ در فرم - دقیقاً مثل ResearchForm
        delay_end_date: jalaliToGregorian(formatJalaliDate(formData.delay_end_date)),
        delay_days: formData.delay_days,
        reason: formData.reason,
        is_allowed: formData.is_allowed,
        contract_id: formData.contract_id,
        attachment_files: selectedFiles,
        deleted_attachment_ids: deletedAttachmentIds,
      };

      console.log('📤 Submit data (before API):', {
        delay_end_date: submitData.delay_end_date,
        delay_days: submitData.delay_days,
      });

      setUploadProgress(0);

      if (isEditing && initialData) {
        await update(initialData.id, submitData, (progress) => setUploadProgress(progress));
      } else {
        await create(submitData, (progress) => setUploadProgress(progress));
      }
      onSuccess?.();
    } catch (error: any) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);

      if (error.response?.data) {
        const serverErrors = error.response.data;
        if (typeof serverErrors === 'object') {
          Object.keys(serverErrors).forEach((field) => {
            const errorMessage = Array.isArray(serverErrors[field])
              ? serverErrors[field][0]
              : serverErrors[field];

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

  return (
    <div className="contract-delay-form">
      <div className="form-header">
        <h3>{isEditing ? 'ویرایش تاخیر قرارداد' : 'ثبت تاخیر جدید'}</h3>
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
              <label>تاریخ پایان مهلت تاخیر <span className="required">*</span></label>
              <JalaliDatePicker
                value={formData.delay_end_date || null}
                onChange={(date) => handleChange('delay_end_date', date)}
                placeholder="1402/01/01"
                label=""
                error={errors.delay_end_date}
                disabled={isCreating || isUpdating}
              />
              {(touched.delay_end_date || submitAttempted) && errors.delay_end_date && (
                <span className="error-text">{errors.delay_end_date}</span>
              )}
            </div>
            <div className="form-group">
              <label>میزان تاخیر (روز) <span className="required">*</span></label>
              <div className="input-with-icon">
                <Clock size={18} className="input-icon" />
                <input
                  type="number"
                  placeholder="مثال: 15"
                  value={formData.delay_days || ''}
                  onChange={(e) => handleChange('delay_days', Number(e.target.value))}
                  onBlur={() => handleBlur('delay_days')}
                  className={(touched.delay_days || submitAttempted) && errors.delay_days ? 'is-invalid' : ''}
                  min="0"
                />
              </div>
              {(touched.delay_days || submitAttempted) && errors.delay_days && (
                <span className="error-text">{errors.delay_days}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>دلیل تاخیر</label>
            <textarea
              rows={3}
              placeholder="دلیل تاخیر را وارد کنید..."
              value={formData.reason || ''}
              onChange={(e) => handleChange('reason', e.target.value)}
              onBlur={() => handleBlur('reason')}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>تمدید مجاز</label>
            <div className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={formData.is_allowed || false}
                onChange={(e) => handleChange('is_allowed', e.target.checked)}
              />
              {formData.is_allowed ? (
                <CheckCircle size={16} color="#059669" />
              ) : (
                <AlertCircle size={16} color="#dc2626" />
              )}
            </div>
          </div>

          {/* ========== فایل‌های پیوست ========== */}
          <div className="form-group">
            <label>فایل‌های پیوست</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="delay-attachments"
                onChange={handleFileChange}
                multiple
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
              />
              <label htmlFor="delay-attachments" className="file-upload-label">
                <Upload size={18} />
                <span>انتخاب فایل‌ها</span>
                <span className="file-count">(چندگانه)</span>
              </label>

              {selectedFiles.length > 0 && (
                <div className="file-list">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="file-info">
                      <FileText size={14} />
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                      <button type="button" className="file-remove" onClick={() => handleFileRemove(index)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {existingAttachments.length > 0 && (
                <div className="file-list existing">
                  <div className="file-list-title">فایل‌های موجود:</div>
                  {existingAttachments.map((att) => (
                    <div key={att.id} className="file-info existing">
                      <a href={att.file} target="_blank" rel="noopener noreferrer" className="file-link">
                        <Eye size={14} />
                      </a>
                      <a href={att.file} download className="file-link download">
                        <Download size={14} />
                      </a>
                      <span className="file-name">{att.filename || getFileName(att.file)}</span>
                      <span className="file-size">{att.size ? (att.size / 1024).toFixed(1) : '0'} KB</span>
                      <button
                        type="button"
                        className="file-remove"
                        onClick={() => handleExistingAttachmentRemove(att.id)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-wrapper">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          )}
        </div>

        <div className="form-footer">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            انصراف
          </button>
          <button type="submit" className="btn-primary" disabled={isCreating || isUpdating}>
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
        .contract-delay-form { padding: 24px; }
        .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e9ecef; }
        .form-header h3 { margin: 0; font-size: 20px; font-weight: 600; color: #1a1a2e; }
        .close-btn { background: none; border: none; color: #6b7280; cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.2s; }
        .close-btn:hover { background: #f3f4f6; color: #1a1a2e; }
        .form-body { display: flex; flex-direction: column; gap: 16px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 4px; }
        .form-group label { font-size: 13px; font-weight: 500; color: #374151; }
        .required { color: #dc2626; }
        .form-group input, .form-group textarea { padding: 10px 14px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 14px; transition: all 0.2s; font-family: inherit; width: 100%; background: white; }
        .form-group input:focus, .form-group textarea:focus { border-color: #4f46e5; outline: none; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
        .form-group input.is-invalid { border-color: #dc2626; }
        .error-text { font-size: 12px; color: #dc2626; margin-top: 2px; }
        .input-with-icon { position: relative; }
        .input-with-icon .input-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .input-with-icon input { padding-right: 36px; }
        .checkbox-group { flex-direction: row !important; align-items: center; gap: 8px !important; }
        .checkbox-wrapper { display: flex; align-items: center; gap: 8px; }
        .checkbox-wrapper input { width: auto; }

        /* Files */
        .file-upload-wrapper { display: flex; flex-direction: column; gap: 8px; }
        .file-upload-wrapper input[type="file"] { display: none; }
        .file-upload-label { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: #f3f4f6; border: 1.5px dashed #d1d5db; border-radius: 8px; cursor: pointer; font-size: 14px; color: #6b7280; transition: all 0.2s; width: fit-content; }
        .file-upload-label:hover { border-color: #4f46e5; background: #eef2ff; color: #4f46e5; }
        .file-count { font-size: 11px; color: #6b7280; background: #e5e7eb; padding: 0 8px; border-radius: 10px; }
        .file-list { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
        .file-list.existing { border-top: 1px solid #e9ecef; padding-top: 8px; }
        .file-list-title { font-size: 12px; font-weight: 500; color: #374151; }
        .file-info { display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: #f8fafc; border: 1px solid #e9ecef; border-radius: 6px; flex-wrap: wrap; }
        .file-info.existing { background: #eef2ff; border-color: #c7d2fe; }
        .file-name { font-size: 13px; font-weight: 500; color: #1a1a2e; flex: 1; min-width: 60px; }
        .file-size { font-size: 12px; color: #6b7280; }
        .file-remove { background: none; border: none; color: #dc2626; cursor: pointer; padding: 2px 4px; border-radius: 4px; transition: all 0.2s; }
        .file-remove:hover { background: #fee2e2; }
        .file-link { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 4px; color: #4f46e5; background: transparent; transition: all 0.2s; border: none; cursor: pointer; text-decoration: none; }
        .file-link:hover { background: #dbeafe; }
        .file-link.download { color: #059669; }
        .file-link.download:hover { background: #d1fae5; }

        .progress-wrapper { margin-top: 8px; display: flex; align-items: center; gap: 12px; }
        .progress-bar { flex: 1; height: 6px; background: #e9ecef; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #4f46e5, #7c3aed); border-radius: 4px; transition: width 0.3s ease; }
        .progress-text { font-size: 12px; font-weight: 500; color: #4f46e5; min-width: 40px; }

        .form-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e9ecef; }
        .btn-secondary { padding: 10px 24px; border: 1.5px solid #e9ecef; border-radius: 8px; background: white; color: #6b7280; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { background: #f8fafc; }
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 32px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover:not(:disabled) { background: #4338ca; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner-border { display: inline-block; width: 16px; height: 16px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .contract-delay-form { padding: 16px; }
          .form-row { grid-template-columns: 1fr; }
          .form-footer { flex-direction: column-reverse; }
          .form-footer button { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default ContractDelayForm;

// // src/modules/contract-delay/components/ContractDelayForm.tsx

// import React, { useState, useEffect } from 'react';
// import { useContractDelay } from '../hooks/useContractDelay';
// import type { ContractDelay, ContractDelayFormData, ContractDelayAttachment } from '../types/contractDelay.types';
// import { X, Calendar, Clock, FileText, AlertCircle, CheckCircle, Upload, Download, Eye } from 'lucide-react';
// import JalaliDatePicker from '../../../components/JalaliDatePicker';
// import { ContractSelect } from '../../contract/components/ContractSelect';
// import { formatJalaliDate, jalaliToGregorian } from '../../../utils/dateUtils';

// interface ContractDelayFormProps {
//   contractId?: number;
//   initialData?: ContractDelay;
//   onSuccess?: () => void;
//   onCancel?: () => void;
// }

// export const ContractDelayForm: React.FC<ContractDelayFormProps> = ({
//   contractId,
//   initialData,
//   onSuccess,
//   onCancel,
// }) => {
//   const { create, update, isCreating, isUpdating } = useContractDelay();

//   const [formData, setFormData] = useState<ContractDelayFormData>({
//     delay_end_date: '',
//     delay_days: 0,
//     reason: '',
//     is_allowed: false,
//     contract_id: contractId || 0,
//   });
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [touched, setTouched] = useState<Record<string, boolean>>({});
//   const [submitAttempted, setSubmitAttempted] = useState(false);
  
//   // ✅ فایل‌های پیوست
//   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
//   const [existingAttachments, setExistingAttachments] = useState<ContractDelayAttachment[]>([]);
//   const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<number[]>([]);
//   const [uploadProgress, setUploadProgress] = useState(0);

//   const isEditing = !!initialData;
//   const isStandalone = !contractId;

//   // ========== Populate Data ==========
//   useEffect(() => {
//     if (initialData) {
//       let contractIdValue = contractId || 0;
//       if (initialData.contract) {
//         if (typeof initialData.contract === 'object') {
//           contractIdValue = (initialData.contract as any).id || 0;
//         } else {
//           contractIdValue = initialData.contract as number;
//         }
//       }

//       setFormData({
//         delay_end_date: initialData.delay_end_date || '',
//         delay_days: initialData.delay_days || 0,
//         reason: initialData.reason || '',
//         is_allowed: initialData.is_allowed || false,
//         contract_id: contractIdValue,
//       });

//       setExistingAttachments(initialData.attachments || []);
//       setDeletedAttachmentIds([]);
//       setSelectedFiles([]);
//       setSubmitAttempted(false);
//       setErrors({});
//       setTouched({});
//     }
//   }, [initialData, contractId]);

//   // ========== Validation ==========
//   const validateField = (field: keyof ContractDelayFormData, value: any): string | null => {
//     switch (field) {
//       case 'delay_end_date':
//         if (!value) return 'تاریخ پایان مهلت تاخیر الزامی است';
//         return null;
//       case 'delay_days':
//         if (value === undefined || value === null || value < 0) {
//           return 'میزان تاخیر باید بیشتر یا مساوی صفر باشد';
//         }
//         return null;
//       case 'contract_id':
//         if (!value || value <= 0) return 'انتخاب قرارداد الزامی است';
//         return null;
//       default:
//         return null;
//     }
//   };

//   const validate = (): boolean => {
//     const newErrors: Record<string, string> = {};
//     let hasError = false;

//     const fieldsToValidate: (keyof ContractDelayFormData)[] = ['delay_end_date', 'delay_days'];
//     if (isStandalone || !contractId) {
//       fieldsToValidate.push('contract_id');
//     }

//     fieldsToValidate.forEach((field) => {
//       const error = validateField(field, formData[field]);
//       if (error) {
//         newErrors[field] = error;
//         hasError = true;
//       }
//     });

//     setErrors(newErrors);
//     return !hasError;
//   };

//   const handleChange = (field: keyof ContractDelayFormData, value: any) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     if (submitAttempted || touched[field]) {
//       const error = validateField(field, value);
//       setErrors((prev) => ({ ...prev, [field]: error || '' }));
//     }
//   };

//   const handleBlur = (field: keyof ContractDelayFormData) => {
//     setTouched((prev) => ({ ...prev, [field]: true }));
//     const error = validateField(field, formData[field]);
//     setErrors((prev) => ({ ...prev, [field]: error || '' }));
//   };

//   // ========== File Handlers ==========
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (files && files.length > 0) {
//       const newFiles = Array.from(files);
//       setSelectedFiles(prev => [...prev, ...newFiles]);
//     }
//     e.target.value = '';
//   };

//   const handleFileRemove = (index: number) => {
//     setSelectedFiles(prev => prev.filter((_, i) => i !== index));
//   };

//   const handleExistingAttachmentRemove = (id: number) => {
//     setDeletedAttachmentIds(prev => [...prev, id]);
//     setExistingAttachments(prev => prev.filter(att => att.id !== id));
//   };

//   const getFileName = (url: string) => {
//     if (!url) return 'فایل';
//     try {
//       const parts = url.split('/');
//       return parts[parts.length - 1] || 'فایل';
//     } catch {
//       return 'فایل';
//     }
//   };

//   // ========== Submit ==========
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSubmitAttempted(true);

//     const allTouched: Record<string, boolean> = {};
//     Object.keys(formData).forEach((key) => {
//       allTouched[key] = true;
//     });
//     setTouched(allTouched);

//     if (!validate()) {
//       const firstError = document.querySelector('.is-invalid');
//       if (firstError) {
//         firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       }
//       return;
//     }

//     try {
//       const submitData: ContractDelayFormData = {
//         delay_end_date: jalaliToGregorian(formatJalaliDate(formData.delay_end_date)),
//         delay_days: formData.delay_days,
//         reason: formData.reason,
//         is_allowed: formData.is_allowed,
//         contract_id: formData.contract_id,
//         attachment_files: selectedFiles,
//         deleted_attachment_ids: deletedAttachmentIds,
//       };
      

//       setUploadProgress(0);

//       if (isEditing && initialData) {
//         await update(initialData.id, submitData, (progress) => setUploadProgress(progress));
//       } else {
//         await create(submitData, (progress) => setUploadProgress(progress));
//       }
//       onSuccess?.();
//     } catch (error: any) {
//       console.error('Submit error:', error);
//       if (error.response?.data) {
//         const serverErrors = error.response.data;
//         if (typeof serverErrors === 'object') {
//           Object.keys(serverErrors).forEach((field) => {
//             const errorMessage = Array.isArray(serverErrors[field])
//               ? serverErrors[field][0]
//               : serverErrors[field];
//             setErrors((prev) => ({ ...prev, [field]: errorMessage }));
//             setTouched((prev) => ({ ...prev, [field]: true }));
//           });
//         }
//       }
//     }
//   };

//   return (
//     <div className="contract-delay-form">
//       <div className="form-header">
//         <h3>{isEditing ? 'ویرایش تاخیر قرارداد' : 'ثبت تاخیر جدید'}</h3>
//         <button className="close-btn" onClick={onCancel}>
//           <X size={20} />
//         </button>
//       </div>

//       <form onSubmit={handleSubmit} noValidate>
//         <div className="form-body">
//           {isStandalone && (
//             <div className="form-group">
//               <label>قرارداد <span className="required">*</span></label>
//               <ContractSelect
//                 value={formData.contract_id || null}
//                 onChange={(id) => handleChange('contract_id', id || 0)}
//                 placeholder="انتخاب قرارداد..."
//                 label=""
//                 required={true}
//                 error={errors.contract_id}
//               />
//               {(touched.contract_id || submitAttempted) && errors.contract_id && (
//                 <span className="error-text">{errors.contract_id}</span>
//               )}
//             </div>
//           )}

//           <div className="form-row">
//             <div className="form-group">
//               <label>تاریخ پایان مهلت تاخیر <span className="required">*</span></label>
//               <JalaliDatePicker
//                 value={formData.delay_end_date || null}
//                 onChange={(date) => handleChange('delay_end_date', date)}
//                 placeholder="1402/01/01"
//                 label=""
//                 error={errors.delay_end_date}
//                 disabled={isCreating || isUpdating}
//               />
//               {(touched.delay_end_date || submitAttempted) && errors.delay_end_date && (
//                 <span className="error-text">{errors.delay_end_date}</span>
//               )}
//             </div>
//             <div className="form-group">
//               <label>میزان تاخیر (روز) <span className="required">*</span></label>
//               <div className="input-with-icon">
//                 <Clock size={18} className="input-icon" />
//                 <input
//                   type="number"
//                   placeholder="مثال: 15"
//                   value={formData.delay_days || ''}
//                   onChange={(e) => handleChange('delay_days', Number(e.target.value))}
//                   onBlur={() => handleBlur('delay_days')}
//                   className={(touched.delay_days || submitAttempted) && errors.delay_days ? 'is-invalid' : ''}
//                   min="0"
//                 />
//               </div>
//               {(touched.delay_days || submitAttempted) && errors.delay_days && (
//                 <span className="error-text">{errors.delay_days}</span>
//               )}
//             </div>
//           </div>

//           <div className="form-group">
//             <label>دلیل تاخیر</label>
//             <textarea
//               rows={3}
//               placeholder="دلیل تاخیر را وارد کنید..."
//               value={formData.reason || ''}
//               onChange={(e) => handleChange('reason', e.target.value)}
//               onBlur={() => handleBlur('reason')}
//             />
//           </div>

//           <div className="form-group checkbox-group">
//             <label>تمدید مجاز</label>
//             <div className="checkbox-wrapper">
//               <input
//                 type="checkbox"
//                 checked={formData.is_allowed || false}
//                 onChange={(e) => handleChange('is_allowed', e.target.checked)}
//               />
//               {formData.is_allowed ? (
//                 <CheckCircle size={16} color="#059669" />
//               ) : (
//                 <AlertCircle size={16} color="#dc2626" />
//               )}
//             </div>
//           </div>

//           {/* ========== فایل‌های پیوست ========== */}
//           <div className="form-group">
//             <label>فایل‌های پیوست</label>
//             <div className="file-upload-wrapper">
//               <input
//                 type="file"
//                 id="delay-attachments"
//                 onChange={handleFileChange}
//                 multiple
//                 accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
//               />
//               <label htmlFor="delay-attachments" className="file-upload-label">
//                 <Upload size={18} />
//                 <span>انتخاب فایل‌ها</span>
//                 <span className="file-count">(چندگانه)</span>
//               </label>

//               {selectedFiles.length > 0 && (
//                 <div className="file-list">
//                   {selectedFiles.map((file, index) => (
//                     <div key={index} className="file-info">
//                       <FileText size={14} />
//                       <span className="file-name">{file.name}</span>
//                       <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
//                       <button type="button" className="file-remove" onClick={() => handleFileRemove(index)}>
//                         <X size={14} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {existingAttachments.length > 0 && (
//                 <div className="file-list existing">
//                   <div className="file-list-title">فایل‌های موجود:</div>
//                   {existingAttachments.map((att) => (
//                     <div key={att.id} className="file-info existing">
//                       <a href={att.file} target="_blank" rel="noopener noreferrer" className="file-link">
//                         <Eye size={14} />
//                       </a>
//                       <a href={att.file} download className="file-link download">
//                         <Download size={14} />
//                       </a>
//                       <span className="file-name">{att.filename || getFileName(att.file)}</span>
//                       <span className="file-size">{att.size ? (att.size / 1024).toFixed(1) : '0'} KB</span>
//                       <button
//                         type="button"
//                         className="file-remove"
//                         onClick={() => handleExistingAttachmentRemove(att.id)}
//                       >
//                         <X size={14} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {uploadProgress > 0 && uploadProgress < 100 && (
//             <div className="progress-wrapper">
//               <div className="progress-bar">
//                 <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
//               </div>
//               <span className="progress-text">{uploadProgress}%</span>
//             </div>
//           )}
//         </div>

//         <div className="form-footer">
//           <button type="button" className="btn-secondary" onClick={onCancel}>
//             انصراف
//           </button>
//           <button type="submit" className="btn-primary" disabled={isCreating || isUpdating}>
//             {isCreating || isUpdating ? (
//               <>
//                 <span className="spinner-border spinner-border-sm" />
//                 در حال پردازش...
//               </>
//             ) : (
//               isEditing ? 'ویرایش' : 'ثبت'
//             )}
//           </button>
//         </div>
//       </form>

//       <style>{`
//         .contract-delay-form { padding: 24px; }
//         .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e9ecef; }
//         .form-header h3 { margin: 0; font-size: 20px; font-weight: 600; color: #1a1a2e; }
//         .close-btn { background: none; border: none; color: #6b7280; cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.2s; }
//         .close-btn:hover { background: #f3f4f6; color: #1a1a2e; }
//         .form-body { display: flex; flex-direction: column; gap: 16px; }
//         .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
//         .form-group { display: flex; flex-direction: column; gap: 4px; }
//         .form-group label { font-size: 13px; font-weight: 500; color: #374151; }
//         .required { color: #dc2626; }
//         .form-group input, .form-group textarea { padding: 10px 14px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 14px; transition: all 0.2s; font-family: inherit; width: 100%; background: white; }
//         .form-group input:focus, .form-group textarea:focus { border-color: #4f46e5; outline: none; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
//         .form-group input.is-invalid { border-color: #dc2626; }
//         .error-text { font-size: 12px; color: #dc2626; margin-top: 2px; }
//         .input-with-icon { position: relative; }
//         .input-with-icon .input-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
//         .input-with-icon input { padding-right: 36px; }
//         .checkbox-group { flex-direction: row !important; align-items: center; gap: 8px !important; }
//         .checkbox-wrapper { display: flex; align-items: center; gap: 8px; }
//         .checkbox-wrapper input { width: auto; }

//         /* Files */
//         .file-upload-wrapper { display: flex; flex-direction: column; gap: 8px; }
//         .file-upload-wrapper input[type="file"] { display: none; }
//         .file-upload-label { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: #f3f4f6; border: 1.5px dashed #d1d5db; border-radius: 8px; cursor: pointer; font-size: 14px; color: #6b7280; transition: all 0.2s; width: fit-content; }
//         .file-upload-label:hover { border-color: #4f46e5; background: #eef2ff; color: #4f46e5; }
//         .file-count { font-size: 11px; color: #6b7280; background: #e5e7eb; padding: 0 8px; border-radius: 10px; }
//         .file-list { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
//         .file-list.existing { border-top: 1px solid #e9ecef; padding-top: 8px; }
//         .file-list-title { font-size: 12px; font-weight: 500; color: #374151; }
//         .file-info { display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: #f8fafc; border: 1px solid #e9ecef; border-radius: 6px; flex-wrap: wrap; }
//         .file-info.existing { background: #eef2ff; border-color: #c7d2fe; }
//         .file-name { font-size: 13px; font-weight: 500; color: #1a1a2e; flex: 1; min-width: 60px; }
//         .file-size { font-size: 12px; color: #6b7280; }
//         .file-remove { background: none; border: none; color: #dc2626; cursor: pointer; padding: 2px 4px; border-radius: 4px; transition: all 0.2s; }
//         .file-remove:hover { background: #fee2e2; }
//         .file-link { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 4px; color: #4f46e5; background: transparent; transition: all 0.2s; border: none; cursor: pointer; text-decoration: none; }
//         .file-link:hover { background: #dbeafe; }
//         .file-link.download { color: #059669; }
//         .file-link.download:hover { background: #d1fae5; }

//         .progress-wrapper { margin-top: 8px; display: flex; align-items: center; gap: 12px; }
//         .progress-bar { flex: 1; height: 6px; background: #e9ecef; border-radius: 4px; overflow: hidden; }
//         .progress-fill { height: 100%; background: linear-gradient(90deg, #4f46e5, #7c3aed); border-radius: 4px; transition: width 0.3s ease; }
//         .progress-text { font-size: 12px; font-weight: 500; color: #4f46e5; min-width: 40px; }

//         .form-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e9ecef; }
//         .btn-secondary { padding: 10px 24px; border: 1.5px solid #e9ecef; border-radius: 8px; background: white; color: #6b7280; font-weight: 500; cursor: pointer; transition: all 0.2s; }
//         .btn-secondary:hover { background: #f8fafc; }
//         .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 32px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
//         .btn-primary:hover:not(:disabled) { background: #4338ca; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
//         .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
//         .spinner-border { display: inline-block; width: 16px; height: 16px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; }
//         @keyframes spin { to { transform: rotate(360deg); } }

//         @media (max-width: 768px) {
//           .contract-delay-form { padding: 16px; }
//           .form-row { grid-template-columns: 1fr; }
//           .form-footer { flex-direction: column-reverse; }
//           .form-footer button { width: 100%; justify-content: center; }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ContractDelayForm;

// // import React, { useState, useEffect } from 'react';
// // import { useContractDelay } from '../hooks/useContractDelay';
// // import type { ContractDelay, ContractDelayFormData } from '../types/contractDelay.types';
// // import { X, Calendar, Clock, FileText, AlertCircle, CheckCircle } from 'lucide-react';
// // import JalaliDatePicker from '../../../components/JalaliDatePicker';
// // import { ContractSelect } from '../../contract/components/ContractSelect';
// // import dateUtils from '@utils/dateUtils';

// // interface ContractDelayFormProps {
// //   contractId?: number;
// //   initialData?: ContractDelay;
// //   onSuccess?: () => void;
// //   onCancel?: () => void;
// // }

// // export const ContractDelayForm: React.FC<ContractDelayFormProps> = ({
// //   contractId,
// //   initialData,
// //   onSuccess,
// //   onCancel,
// // }) => {
// //   const { create, update, isCreating, isUpdating } = useContractDelay();

// //   const [formData, setFormData] = useState<ContractDelayFormData>({
// //     delay_end_date: '',
// //     delay_days: 0,
// //     reason: '',
// //     is_allowed: false,
// //     contract_id: contractId || 0,
// //   });
// //   const [errors, setErrors] = useState<Record<string, string>>({});
// //   const [touched, setTouched] = useState<Record<string, boolean>>({});
// //   const [submitAttempted, setSubmitAttempted] = useState(false);

// //   const isEditing = !!initialData;
// //   const isStandalone = !contractId;

// //   // ========== پر کردن داده‌ها در حالت ویرایش ==========
// //   useEffect(() => {
// //     if (initialData) {
// //       let contractIdValue = contractId || 0;

// //       if (initialData.contract) {
// //         if (typeof initialData.contract === 'object') {
// //           contractIdValue = (initialData.contract as any).id || 0;
// //         } else {
// //           contractIdValue = initialData.contract as number;
// //         }
// //       }

// //       setFormData({
// //         delay_end_date: initialData.delay_end_date || '',
// //         delay_days: initialData.delay_days || 0,
// //         reason: initialData.reason || '',
// //         is_allowed: initialData.is_allowed || false,
// //         contract_id: contractIdValue,
// //       });
// //       setSubmitAttempted(false);
// //       setErrors({});
// //       setTouched({});
// //     }
// //   }, [initialData, contractId]);

// //   // ========== Validation ==========
// //   const validateField = (field: keyof ContractDelayFormData, value: any): string | null => {
// //     switch (field) {
// //       case 'delay_end_date':
// //         if (!value) return 'تاریخ پایان مهلت تاخیر الزامی است';
// //         return null;
// //       case 'delay_days':
// //         if (value === undefined || value === null || value < 0) {
// //           return 'میزان تاخیر باید بیشتر یا مساوی صفر باشد';
// //         }
// //         return null;
// //       case 'contract_id':
// //         if (!value || value <= 0) return 'انتخاب قرارداد الزامی است';
// //         return null;
// //       default:
// //         return null;
// //     }
// //   };

// //   const validate = (): boolean => {
// //     const newErrors: Record<string, string> = {};
// //     let hasError = false;

// //     const fieldsToValidate: (keyof ContractDelayFormData)[] = [
// //       'delay_end_date',
// //       'delay_days',
// //     ];

// //     if (isStandalone || !contractId) {
// //       fieldsToValidate.push('contract_id');
// //     }

// //     fieldsToValidate.forEach((field) => {
// //       const error = validateField(field, formData[field]);
// //       if (error) {
// //         newErrors[field] = error;
// //         hasError = true;
// //       }
// //     });

// //     setErrors(newErrors);
// //     return !hasError;
// //   };

// //   // ========== Handlers ==========
// //   const handleChange = (field: keyof ContractDelayFormData, value: any) => {
// //     setFormData((prev) => ({ ...prev, [field]: value }));
// //     if (submitAttempted || touched[field]) {
// //       const error = validateField(field, value);
// //       setErrors((prev) => ({ ...prev, [field]: error || '' }));
// //     }
// //   };

// //   const handleBlur = (field: keyof ContractDelayFormData) => {
// //     setTouched((prev) => ({ ...prev, [field]: true }));
// //     const error = validateField(field, formData[field]);
// //     setErrors((prev) => ({ ...prev, [field]: error || '' }));
// //   };

// //   // ========== Submit ==========
// //   // ✅ اصلاح: مثل مدل Progress
// // // ========== Submit ==========
// // const handleSubmit = async (e: React.FormEvent) => {
// //   e.preventDefault();
// //   setSubmitAttempted(true);

// //   const allTouched: Record<string, boolean> = {};
// //   Object.keys(formData).forEach((key) => {
// //     allTouched[key] = true;
// //   });
// //   setTouched(allTouched);

// //   if (!validate()) {
// //     const firstError = document.querySelector('.is-invalid');
// //     if (firstError) {
// //       firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
// //     }
// //     return;
// //   }

// //   try {
// //     // ✅ ارسال با نام 'contract' (نه contract_id)
// //     // اما تایپ ContractDelayFormData فقط contract_id را دارد
// //     // پس ما یک آبجکت جدید می‌سازیم که contract_id را به contract تبدیل می‌کند
// //     const submitData: ContractDelayFormData = {
// //       delay_end_date: formData.delay_end_date,
// //       delay_days: formData.delay_days,
// //       reason: formData.reason,
// //       is_allowed: formData.is_allowed,
// //       contract_id: formData.contract_id,  // ← اینجا contract_id است
// //     };

// //     console.log('📤 Submitting ContractDelay data:', submitData);

// //     if (isEditing && initialData) {
// //       await update(initialData.id, submitData);
// //     } else {
// //       await create(submitData);
// //     }
// //     onSuccess?.();
// //   } catch (error: any) {
// //     console.error('Submit error:', error);
// //     if (error.response?.data) {
// //       const serverErrors = error.response.data;
// //       if (typeof serverErrors === 'object') {
// //         Object.keys(serverErrors).forEach((field) => {
// //           const errorMessage = Array.isArray(serverErrors[field])
// //             ? serverErrors[field][0]
// //             : serverErrors[field];
// //           setErrors((prev) => ({ ...prev, [field]: errorMessage }));
// //           setTouched((prev) => ({ ...prev, [field]: true }));
// //         });
// //       }
// //     }
// //   }
// // };

 

// //   // ========== Render ==========
// //   return (
// //     <div className="contract-delay-form">
// //       <div className="form-header">
// //         <h3>{isEditing ? 'ویرایش تاخیر قرارداد' : 'ثبت تاخیر جدید'}</h3>
// //         <button className="close-btn" onClick={onCancel}>
// //           <X size={20} />
// //         </button>
// //       </div>

// //       <form onSubmit={handleSubmit} noValidate>
// //         <div className="form-body">
// //           {isStandalone && (
// //             <div className="form-group">
// //               <label>قرارداد <span className="required">*</span></label>
// //               <ContractSelect
// //                 value={formData.contract_id || null}
// //                 onChange={(id) => handleChange('contract_id', id || 0)}
// //                 placeholder="انتخاب قرارداد..."
// //                 label=""
// //                 required={true}
// //                 error={errors.contract_id}
// //               />
// //               {(touched.contract_id || submitAttempted) && errors.contract_id && (
// //                 <span className="error-text">{errors.contract_id}</span>
// //               )}
// //             </div>
// //           )}

// //           <div className="form-row">
// //             <div className="form-group">
// //               <label>تاریخ پایان مهلت تاخیر <span className="required">*</span></label>
// //               <JalaliDatePicker
// //                 value={formData.delay_end_date || null}
// //                 onChange={(date) => handleChange('delay_end_date', date)}
// //                 placeholder="1402/01/01"
// //                 label=""
// //                 error={errors.delay_end_date}
// //                 disabled={isCreating || isUpdating}
// //               />
// //               {(touched.delay_end_date || submitAttempted) && errors.delay_end_date && (
// //                 <span className="error-text">{errors.delay_end_date}</span>
// //               )}
// //             </div>
// //             <div className="form-group">
// //               <label>میزان تاخیر (روز) <span className="required">*</span></label>
// //               <div className="input-with-icon">
// //                 <Clock size={18} className="input-icon" />
// //                 <input
// //                   type="number"
// //                   placeholder="مثال: 15"
// //                   value={formData.delay_days || ''}
// //                   onChange={(e) => handleChange('delay_days', Number(e.target.value))}
// //                   onBlur={() => handleBlur('delay_days')}
// //                   className={(touched.delay_days || submitAttempted) && errors.delay_days ? 'is-invalid' : ''}
// //                   min="0"
// //                 />
// //               </div>
// //               {(touched.delay_days || submitAttempted) && errors.delay_days && (
// //                 <span className="error-text">{errors.delay_days}</span>
// //               )}
// //             </div>
// //           </div>

// //           <div className="form-group">
// //             <label>توضیحات</label>
// //             <textarea
// //               rows={3}
// //               placeholder="دلیل تاخیر را وارد کنید..."
// //               value={formData.reason || ''}
// //               onChange={(e) => handleChange('reason', e.target.value)}
// //               onBlur={() => handleBlur('reason')}
// //             />
// //           </div>

// //           <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
// //             <label style={{ margin: 0 }}>تمدید مجاز</label>
// //             <input
// //               type="checkbox"
// //               checked={formData.is_allowed || false}
// //               onChange={(e) => handleChange('is_allowed', e.target.checked)}
// //             />
// //             {formData.is_allowed ? (
// //               <CheckCircle size={16} color="#059669" />
// //             ) : (
// //               <AlertCircle size={16} color="#dc2626" />
// //             )}
// //           </div>
// //         </div>

// //         <div className="form-footer">
// //           <button type="button" className="btn-secondary" onClick={onCancel}>
// //             انصراف
// //           </button>
// //           <button
// //             type="submit"
// //             className="btn-primary"
// //             disabled={isCreating || isUpdating}
// //           >
// //             {isCreating || isUpdating ? (
// //               <>
// //                 <span className="spinner-border spinner-border-sm" />
// //                 در حال پردازش...
// //               </>
// //             ) : (
// //               isEditing ? 'ویرایش' : 'ثبت'
// //             )}
// //           </button>
// //         </div>
// //       </form>

// //       <style>{`
// //         .contract-delay-form {
// //           padding: 24px;
// //         }

// //         .form-header {
// //           display: flex;
// //           justify-content: space-between;
// //           align-items: center;
// //           margin-bottom: 24px;
// //           padding-bottom: 16px;
// //           border-bottom: 1px solid #e9ecef;
// //         }

// //         .form-header h3 {
// //           margin: 0;
// //           font-size: 20px;
// //           font-weight: 600;
// //           color: #1a1a2e;
// //         }

// //         .close-btn {
// //           background: none;
// //           border: none;
// //           color: #6b7280;
// //           cursor: pointer;
// //           padding: 4px;
// //           border-radius: 6px;
// //           transition: all 0.2s;
// //         }

// //         .close-btn:hover {
// //           background: #f3f4f6;
// //           color: #1a1a2e;
// //         }

// //         .form-body {
// //           display: flex;
// //           flex-direction: column;
// //           gap: 16px;
// //         }

// //         .form-row {
// //           display: grid;
// //           grid-template-columns: 1fr 1fr;
// //           gap: 16px;
// //         }

// //         .form-group {
// //           display: flex;
// //           flex-direction: column;
// //           gap: 4px;
// //         }

// //         .form-group label {
// //           font-size: 13px;
// //           font-weight: 500;
// //           color: #374151;
// //         }

// //         .required {
// //           color: #dc2626;
// //         }

// //         .form-group input,
// //         .form-group textarea {
// //           padding: 10px 14px;
// //           border: 1.5px solid #d1d5db;
// //           border-radius: 8px;
// //           font-size: 14px;
// //           transition: all 0.2s;
// //           font-family: inherit;
// //           width: 100%;
// //           background: white;
// //         }

// //         .form-group input:focus,
// //         .form-group textarea:focus {
// //           border-color: #4f46e5;
// //           outline: none;
// //           box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
// //         }

// //         .form-group input.is-invalid {
// //           border-color: #dc2626;
// //         }

// //         .error-text {
// //           font-size: 12px;
// //           color: #dc2626;
// //           margin-top: 2px;
// //         }

// //         .input-with-icon {
// //           position: relative;
// //         }

// //         .input-with-icon .input-icon {
// //           position: absolute;
// //           right: 12px;
// //           top: 50%;
// //           transform: translateY(-50%);
// //           color: #9ca3af;
// //         }

// //         .input-with-icon input {
// //           padding-right: 36px;
// //         }

// //         .form-footer {
// //           display: flex;
// //           justify-content: flex-end;
// //           gap: 12px;
// //           margin-top: 24px;
// //           padding-top: 16px;
// //           border-top: 1px solid #e9ecef;
// //         }

// //         .btn-secondary {
// //           padding: 10px 24px;
// //           border: 1.5px solid #e9ecef;
// //           border-radius: 8px;
// //           background: white;
// //           color: #6b7280;
// //           font-weight: 500;
// //           cursor: pointer;
// //           transition: all 0.2s;
// //         }

// //         .btn-secondary:hover {
// //           background: #f8fafc;
// //         }

// //         .btn-primary {
// //           display: inline-flex;
// //           align-items: center;
// //           gap: 8px;
// //           padding: 10px 32px;
// //           background: #4f46e5;
// //           color: white;
// //           border: none;
// //           border-radius: 8px;
// //           font-weight: 500;
// //           cursor: pointer;
// //           transition: all 0.2s;
// //         }

// //         .btn-primary:hover:not(:disabled) {
// //           background: #4338ca;
// //           transform: translateY(-1px);
// //           box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
// //         }

// //         .btn-primary:disabled {
// //           opacity: 0.6;
// //           cursor: not-allowed;
// //         }

// //         .spinner-border {
// //           display: inline-block;
// //           width: 16px;
// //           height: 16px;
// //           border: 2px solid currentColor;
// //           border-right-color: transparent;
// //           border-radius: 50%;
// //           animation: spin 0.6s linear infinite;
// //         }

// //         @keyframes spin {
// //           to {
// //             transform: rotate(360deg);
// //           }
// //         }

// //         @media (max-width: 768px) {
// //           .contract-delay-form {
// //             padding: 16px;
// //           }

// //           .form-row {
// //             grid-template-columns: 1fr;
// //           }

// //           .form-footer {
// //             flex-direction: column-reverse;
// //           }

// //           .form-footer button {
// //             width: 100%;
// //             justify-content: center;
// //           }
// //         }
// //       `}</style>
// //     </div>
// //   );
// // };

// // export default ContractDelayForm;

