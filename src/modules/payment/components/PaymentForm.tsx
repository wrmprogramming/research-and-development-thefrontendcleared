// src/modules/payment/components/PaymentForm.tsx

import React, { useState, useEffect } from 'react';
import { usePayment } from '../hooks/usePayment';
import { type Payment, type PaymentFormData } from '../types/payment.types';
import { X, DollarSign, FileText, Upload, Download, Eye } from 'lucide-react';
import JalaliDatePicker from '../../../components/JalaliDatePicker';
import { ContractSelect } from '../../contract/components/ContractSelect';
import toast from 'react-hot-toast';
import { formatJalaliDate, jalaliToGregorian } from '@/utils/dateUtils';

interface PaymentFormProps {
  initialData?: Payment;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { create, update, usePaymentTypes, isCreating, isUpdating } = usePayment();
  const { data: paymentTypes = [] } = usePaymentTypes();
  
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 0,
    payment_date: '',
    is_paid: true,
    is_verified: false,
    contract_id: null,
    payment_type_id: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<number[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        payment_number: initialData.payment_number || '',
        amount: Number(initialData.amount) || 0,
        payment_date: initialData.payment_date || '',
        description: initialData.description || '',
        is_paid: initialData.is_paid !== undefined ? initialData.is_paid : true,
        is_verified: initialData.is_verified || false,
        contract_id: typeof initialData.contract === 'object' ? initialData.contract?.id : initialData.contract || null,
        payment_type_id: typeof initialData.payment_type === 'object' ? initialData.payment_type?.id : initialData.payment_type || null,
      });
      setExistingAttachments(initialData.attachments || []);
      setDeletedAttachmentIds([]);
      setSelectedFiles([]);
      setSubmitAttempted(false);
      setErrors({});
      setTouched({});
    }
  }, [initialData]);

  const validateField = (field: keyof PaymentFormData, value: any): string | null => {
    switch (field) {
      case 'amount':
        if (!value || value <= 0) return 'مبلغ پرداخت باید بیشتر از صفر باشد';
        return null;
      case 'payment_date':
        if (!value) return 'تاریخ پرداخت الزامی است';
        return null;
      case 'contract_id':
        if (!value || value <= 0) return 'انتخاب قرارداد الزامی است';
        return null;
      case 'payment_type_id':
        if (!value || value <= 0) return 'انتخاب نوع پرداخت الزامی است';
        return null;
      default:
        return null;
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    const fieldsToValidate: (keyof PaymentFormData)[] = [
      'amount', 'payment_date', 'contract_id', 'payment_type_id'
    ];

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

  const handleChange = (field: keyof PaymentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitAttempted || touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || '' }));
    }
  };

  const handleBlur = (field: keyof PaymentFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error || '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setFormData(prev => ({
        ...prev,
        attachment_files: [...(prev.attachment_files || []), ...newFiles]
      }));
    }
    e.target.value = '';
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      attachment_files: prev.attachment_files?.filter((_, i) => i !== index) || []
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
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
      // ✅ ساخت داده ارسالی با تبدیل null به عدد معتبر
      const submitData = {
        ...formData,
        contract_id: formData.contract_id || 0,
        payment_type_id: formData.payment_type_id || 0,
        attachment_files: selectedFiles,
        deleted_attachment_ids: deletedAttachmentIds,
      };

      submitData.payment_date = jalaliToGregorian(formatJalaliDate(submitData.payment_date));
      
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
            const fieldMapping: Record<string, string> = {
              'contract': 'contract_id',
              'payment_type': 'payment_type_id',
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
    <div className="payment-form">
      <div className="form-header">
        <h3>{isEditing ? 'ویرایش پرداخت' : 'افزودن پرداخت جدید'}</h3>
        <button className="close-btn" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-body">
          {/* شماره پرداخت و مبلغ */}
          <div className="form-row">
            <div className="form-group">
              <label>شماره پرداخت</label>
              <input
                type="text"
                placeholder="مثال: PAY-1402-001"
                value={formData.payment_number || ''}
                onChange={(e) => handleChange('payment_number', e.target.value)}
                onBlur={() => handleBlur('payment_number')}
              />
            </div>
            <div className="form-group">
              <label>مبلغ (ریال) <span className="required">*</span></label>
              <div className="input-with-icon">
                <DollarSign size={18} className="input-icon" />
                <input
                  type="number"
                  placeholder="مبلغ را به ریال وارد کنید..."
                  value={formData.amount || ''}
                  onChange={(e) => handleChange('amount', Number(e.target.value))}
                  onBlur={() => handleBlur('amount')}
                  className={(touched.amount || submitAttempted) && errors.amount ? 'is-invalid' : ''}
                  min="0"
                />
              </div>
              {(touched.amount || submitAttempted) && errors.amount && (
                <span className="error-text">{errors.amount}</span>
              )}
            </div>
          </div>

          {/* تاریخ پرداخت */}
          <div className="form-row">
            <div className="form-group">
              <label>تاریخ پرداخت <span className="required">*</span></label>
              <JalaliDatePicker
                value={formData.payment_date || null}
                onChange={(date) => handleChange('payment_date', date)}
                placeholder="1402/01/01"
                label=""
                error={errors.payment_date}
                disabled={isCreating || isUpdating}
              />
              {(touched.payment_date || submitAttempted) && errors.payment_date && (
                <span className="error-text">{errors.payment_date}</span>
              )}
            </div>
          </div>

          {/* انتخاب‌ها */}
          <div className="form-row">
            <div className="form-group">
              <label>قرارداد <span className="required">*</span></label>
              <ContractSelect
                value={formData.contract_id}
                onChange={(id) => handleChange('contract_id', id)}
                placeholder="انتخاب قرارداد..."
                label=""
                required={true}
                error={errors.contract_id}
              />
              {(touched.contract_id || submitAttempted) && errors.contract_id && (
                <span className="error-text">{errors.contract_id}</span>
              )}
            </div>
            <div className="form-group">
              <label>نوع پرداخت <span className="required">*</span></label>
              <select
                value={formData.payment_type_id || ''}
                onChange={(e) => handleChange('payment_type_id', e.target.value ? Number(e.target.value) : null)}
                onBlur={() => handleBlur('payment_type_id')}
                className={(touched.payment_type_id || submitAttempted) && errors.payment_type_id ? 'is-invalid' : ''}
              >
                <option value="">انتخاب نوع پرداخت...</option>
                {paymentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {(touched.payment_type_id || submitAttempted) && errors.payment_type_id && (
                <span className="error-text">{errors.payment_type_id}</span>
              )}
            </div>
          </div>

          {/* وضعیت پرداخت */}
          <div className="form-row">
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', paddingTop: '8px' }}>
              <label style={{ margin: 0 }}>پرداخت شده</label>
              <input
                type="checkbox"
                checked={formData.is_paid || false}
                onChange={(e) => handleChange('is_paid', e.target.checked)}
              />
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', paddingTop: '8px' }}>
              <label style={{ margin: 0 }}>تایید شده</label>
              <input
                type="checkbox"
                checked={formData.is_verified || false}
                onChange={(e) => handleChange('is_verified', e.target.checked)}
              />
            </div>
          </div>

          {/* توضیحات */}
          <div className="form-group">
            <label>توضیحات</label>
            <textarea
              rows={3}
              placeholder="توضیحات تکمیلی درباره پرداخت..."
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
            />
          </div>

          {/* فایل‌های پیوست چندگانه */}
          <div className="form-group">
            <label>فایل‌های پیوست</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="attachments"
                onChange={handleFileChange}
                multiple
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
              />
              <label htmlFor="attachments" className="file-upload-label">
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
                      <button type="button" className="file-remove" onClick={() => handleExistingAttachmentRemove(att.id)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <small className="hint">می‌توانید چندین فایل را همزمان انتخاب کنید</small>
          </div>

          {/* Progress Bar */}
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
              <><span className="spinner-border spinner-border-sm" /> در حال پردازش...</>
            ) : (
              isEditing ? 'ویرایش' : 'افزودن'
            )}
          </button>
        </div>
      </form>

      <style>{`
        .payment-form { padding: 24px; }
        .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e9ecef; }
        .form-header h3 { margin: 0; font-size: 20px; font-weight: 600; color: #1a1a2e; }
        .close-btn { background: none; border: none; color: #6b7280; cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.2s; }
        .close-btn:hover { background: #f3f4f6; color: #1a1a2e; }
        .form-body { display: flex; flex-direction: column; gap: 16px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 4px; }
        .form-group label { font-size: 13px; font-weight: 500; color: #374151; }
        .required { color: #dc2626; }
        .form-group input, .form-group select, .form-group textarea {
          padding: 10px 14px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 14px; transition: all 0.2s; font-family: inherit; width: 100%; background: white;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: #4f46e5; outline: none; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        .form-group input.is-invalid, .form-group select.is-invalid { border-color: #dc2626; }
        .error-text { font-size: 12px; color: #dc2626; margin-top: 2px; }
        .input-with-icon { position: relative; }
        .input-with-icon .input-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .input-with-icon input { padding-right: 36px; }

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
          .payment-form { padding: 16px; }
          .form-row { grid-template-columns: 1fr; }
          .form-footer { flex-direction: column-reverse; }
          .form-footer button { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default PaymentForm;
