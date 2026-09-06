// src/modules/payment/components/paymentType/PaymentTypeForm.tsx
import React, { useState, useEffect } from 'react';
import { usePaymentType } from '../../hooks/usePaymentType';
import type { PaymentType, PaymentTypeFormData } from '../../types/paymentType.types';
import { X } from 'lucide-react';

interface PaymentTypeFormProps {
  initialData?: PaymentType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PaymentTypeForm: React.FC<PaymentTypeFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { create, update, isCreating, isUpdating } = usePaymentType();
  const [formData, setFormData] = useState<PaymentTypeFormData>({
    name: '',
    code: '',
    description: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        description: initialData.description || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      });
      setSubmitAttempted(false);
      setErrors({});
      setTouched({});
    }
  }, [initialData]);

  const validateField = (field: keyof PaymentTypeFormData, value: any): string | null => {
    switch (field) {
      case 'name':
        if (!value?.trim()) return 'نام نوع پرداخت الزامی است';
        return null;
      case 'code':
        if (!value?.trim()) return 'کد نوع پرداخت الزامی است';
        return null;
      default:
        return null;
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    const fieldsToValidate: (keyof PaymentTypeFormData)[] = ['name', 'code'];

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

  const handleChange = (field: keyof PaymentTypeFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitAttempted || touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || '' }));
    }
  };

  const handleBlur = (field: keyof PaymentTypeFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error || '' }));
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
      if (isEditing && initialData) {
        await update(initialData.id, formData);
      } else {
        await create(formData);
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

  return (
    <div className="payment-type-form">
      <div className="form-header">
        <h3>{isEditing ? 'ویرایش نوع پرداخت' : 'افزودن نوع پرداخت جدید'}</h3>
        <button className="close-btn" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-body">
          <div className="form-row">
            <div className="form-group">
              <label>نام <span className="required">*</span></label>
              <input
                type="text"
                placeholder="مثال: پیش‌پرداخت"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={(touched.name || submitAttempted) && errors.name ? 'is-invalid' : ''}
              />
              {(touched.name || submitAttempted) && errors.name && (
                <span className="error-text">{errors.name}</span>
              )}
            </div>
            <div className="form-group">
              <label>کد <span className="required">*</span></label>
              <input
                type="text"
                placeholder="مثال: ADVANCE"
                value={formData.code || ''}
                onChange={(e) => handleChange('code', e.target.value)}
                onBlur={() => handleBlur('code')}
                className={(touched.code || submitAttempted) && errors.code ? 'is-invalid' : ''}
              />
              {(touched.code || submitAttempted) && errors.code && (
                <span className="error-text">{errors.code}</span>
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

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <label style={{ margin: 0 }}>فعال</label>
            <input
              type="checkbox"
              checked={formData.is_active !== false}
              onChange={(e) => handleChange('is_active', e.target.checked)}
            />
          </div>
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
              isEditing ? 'ویرایش' : 'افزودن'
            )}
          </button>
        </div>
      </form>

      <style>{`
        .payment-type-form {
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
          .payment-type-form {
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

export default PaymentTypeForm;