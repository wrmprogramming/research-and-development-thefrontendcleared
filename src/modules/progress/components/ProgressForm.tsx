// src/modules/progress/components/ProgressForm.tsx

import React, { useState, useEffect } from 'react';
import { useProgress } from '../hooks/useProgress';
import type { Progress, ProgressFormData } from '../types/progress.types';
import { X, TrendingUp, Calendar, Building2 } from 'lucide-react';
import JalaliDatePicker from '../../../components/JalaliDatePicker';
import { ContractSelect } from '../../contract/components/ContractSelect';
import { formatJalaliDate, jalaliToGregorian } from '@/utils/dateUtils';

interface ProgressFormProps {
  contractId?: number;
  initialData?: Progress;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProgressForm: React.FC<ProgressFormProps> = ({
  contractId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { create, update, isCreating, isUpdating } = useProgress();
  
  const [formData, setFormData] = useState<ProgressFormData>({
    physical_progress_percentage: 0,
    registered_date: '',
    notes: '',
    contract_id: contractId || 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const isEditing = !!initialData;
  const isStandalone = !contractId;

  // ========== پر کردن داده‌ها در حالت ویرایش ==========
  useEffect(() => {
    if (initialData) {
      // ✅ دریافت contract_id از initialData
      let contractIdValue = contractId || 0;
      
      if (initialData.contract) {
        if (typeof initialData.contract === 'object') {
          contractIdValue = (initialData.contract as any).id || 0;
        } else {
          contractIdValue = initialData.contract as number;
        }
      }
      
      setFormData({
        physical_progress_percentage: Number(initialData.physical_progress_percentage) || 0,
        registered_date: initialData.registered_date || '',
        notes: initialData.notes || '',
        contract_id: contractIdValue,
      });
      setSubmitAttempted(false);
      setErrors({});
      setTouched({});
    }
  }, [initialData, contractId]);

  // ========== اعتبارسنجی ==========
  const validateField = (field: keyof ProgressFormData, value: any): string | null => {
    switch (field) {
      case 'physical_progress_percentage':
        if (value === undefined || value === null || value < 0) {
          return 'درصد پیشرفت باید بین 0 تا 100 باشد';
        }
        if (value > 100) {
          return 'درصد پیشرفت نمی‌تواند بیشتر از 100 باشد';
        }
        return null;
      case 'registered_date':
        if (!value) return 'تاریخ ثبت الزامی است';
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

    const fieldsToValidate: (keyof ProgressFormData)[] = [
      'physical_progress_percentage', 
      'registered_date',
      'contract_id'
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
  const handleChange = (field: keyof ProgressFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitAttempted || touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || '' }));
    }
  };

  const handleBlur = (field: keyof ProgressFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error || '' }));
  };

  // ========== Submit ==========
// src/modules/progress/components/ProgressForm.tsx

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
    const submitData: ProgressFormData = {
      physical_progress_percentage: formData.physical_progress_percentage,
      registered_date: jalaliToGregorian(formatJalaliDate(formData.registered_date)) || '',
      notes: formData.notes || '',
      contract_id: formData.contract_id,
    };

    if (isEditing && initialData) {
      await update(initialData.id, submitData);
    } else {
      await create(submitData);
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
          setErrors((prev) => ({ ...prev, [field]: errorMessage }));
          setTouched((prev) => ({ ...prev, [field]: true }));
        });
      }
    }
  }
};

// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setSubmitAttempted(true);

//   const allTouched: Record<string, boolean> = {};
//   Object.keys(formData).forEach(key => {
//     allTouched[key] = true;
//   });
//   setTouched(allTouched);

//   if (!validate()) {
//     const firstError = document.querySelector('.is-invalid');
//     if (firstError) {
//       firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }
//     return;
//   }

//   try {
    
//     // ✅ ارسال با نام 'contract' (نه contract_id)
//     const submitData = {
//       physical_progress_percentage: formData.physical_progress_percentage,
//       registered_date: formData.registered_date,
//       notes: formData.notes || '',
//       contract_id: formData.contract_id,  // ← اینجا contract رو میفرستیم
//       steering_committee: formData.steering_committee_id || null,
//     };
//     submitData.registered_date = jalaliToGregorian(formatJalaliDate(submitData.registered_date));
    

//     console.log('📤 Submitting progress data:', submitData);

//     if (isEditing && initialData) {
//       await update(initialData.id, submitData);
//     } else {
//       await create(submitData);
//     }
//     onSuccess?.();
//   } catch (error: any) {
//     console.error('Submit error:', error);
//     if (error.response?.data) {
//       const serverErrors = error.response.data;
//       console.log('Server errors:', serverErrors);
//       if (typeof serverErrors === 'object') {
//         Object.keys(serverErrors).forEach((field) => {
//           const errorMessage = Array.isArray(serverErrors[field])
//             ? serverErrors[field][0]
//             : serverErrors[field];
//           setErrors((prev) => ({ ...prev, [field]: errorMessage }));
//           setTouched((prev) => ({ ...prev, [field]: true }));
//         });
//       }
//     }
//   }
// };
 

  // ========== Render ==========
  return (
    <div className="progress-form">
      <div className="form-header">
        <h3>{isEditing ? 'ویرایش پیشرفت' : 'ثبت پیشرفت جدید'}</h3>
        <button className="close-btn" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-body">
          {isStandalone && (
            <div className="form-group">
              <label>قرارداد <span className="required">*</span></label>
              <div className="contract-select-wrapper">
                <Building2 size={18} className="select-icon" />
                <ContractSelect
                  value={formData.contract_id || null}
                  onChange={(id) => handleChange('contract_id', id || 0)}
                  placeholder="انتخاب قرارداد..."
                  label=""
                  required={true}
                  error={errors.contract_id}
                />
              </div>
              {(touched.contract_id || submitAttempted) && errors.contract_id && (
                <span className="error-text">{errors.contract_id}</span>
              )}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>درصد پیشرفت <span className="required">*</span></label>
              <div className="input-with-icon">
                <TrendingUp size={18} className="input-icon" />
                <input
                  type="number"
                  placeholder="مثال: 25"
                  value={formData.physical_progress_percentage || ''}
                  onChange={(e) => handleChange('physical_progress_percentage', Number(e.target.value))}
                  onBlur={() => handleBlur('physical_progress_percentage')}
                  className={(touched.physical_progress_percentage || submitAttempted) && errors.physical_progress_percentage ? 'is-invalid' : ''}
                  min="0"
                  max="100"
                />
                <span className="input-suffix">%</span>
              </div>
              {(touched.physical_progress_percentage || submitAttempted) && errors.physical_progress_percentage && (
                <span className="error-text">{errors.physical_progress_percentage}</span>
              )}
            </div>
            <div className="form-group">
              <label>تاریخ ثبت <span className="required">*</span></label>
              <JalaliDatePicker
                value={formData.registered_date || null}
                onChange={(date) => handleChange('registered_date', date)}
                placeholder="1402/01/01"
                label=""
                error={errors.registered_date}
                disabled={isCreating || isUpdating}
              />
              {(touched.registered_date || submitAttempted) && errors.registered_date && (
                <span className="error-text">{errors.registered_date}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>توضیحات</label>
            <textarea
              rows={4}
              placeholder="توضیحات تکمیلی درباره پیشرفت..."
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              onBlur={() => handleBlur('notes')}
            />
          </div>

          {formData.physical_progress_percentage >= 100 && (
            <div className="progress-complete-message">
              <span className="icon">🎉</span>
              <span>پروژه به ۱۰۰٪ پیشرفت رسیده است!</span>
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
        .progress-form {
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
          padding-left: 36px;
        }

        .input-suffix {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-weight: 500;
        }

        .contract-select-wrapper {
          position: relative;
        }

        .contract-select-wrapper .select-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          z-index: 1;
        }

        .progress-complete-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #d1fae5;
          border-radius: 8px;
          color: #059669;
          font-weight: 500;
          font-size: 14px;
        }

        .progress-complete-message .icon {
          font-size: 24px;
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
          .progress-form {
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

export default ProgressForm;
