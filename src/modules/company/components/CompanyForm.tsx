// src/modules/company/components/CompanyForm.tsx

import React, { useState, useEffect } from 'react';
import { useCompany } from '../hooks/useCompany';
import { useProvince } from '../../province/hooks/useProvince';
import { type Company, type CompanyFormData } from '../types/company.types';
import { X, Building2, Phone, Mail, MapPin, Globe } from 'lucide-react';

interface CompanyFormProps {
  initialData?: Company;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { create, update, isCreating, isUpdating } = useCompany();
  const { useList: useProvinceList } = useProvince();

  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const isEditing = !!initialData;

  // ========== دریافت لیست استان‌ها ==========
  const { data: provinces = [] } = useProvinceList();

  // ========== پر کردن داده‌ها در حالت ویرایش ==========
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        economic_code: initialData.economic_code || '',
        registration_number: initialData.registration_number || '',
        national_id: initialData.national_id || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        fax: initialData.fax || '',
        email: initialData.email || '',
        website: initialData.website || '',
        province_id: typeof initialData.province === 'object'
          ? initialData.province?.id
          : initialData.province || undefined,
        postal_code: initialData.postal_code || '',
      });
    }
  }, [initialData]);

  // ========== Validation ==========
  const validateField = (field: keyof CompanyFormData, value: any): string | null => {
    switch (field) {
      case 'name':
        if (!value?.trim()) return 'نام شرکت الزامی است';
        return null;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'فرمت ایمیل معتبر نیست';
        }
        return null;
      default:
        return null;
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    const fieldsToValidate: (keyof CompanyFormData)[] = ['name'];
    
    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasError = true;
      }
    });

    if (formData.email) {
      const error = validateField('email', formData.email);
      if (error) {
        newErrors.email = error;
        hasError = true;
      }
    }

    setErrors(newErrors);
    return !hasError;
  };

  // ========== Handle Change ==========
  const handleChange = (field: keyof CompanyFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitAttempted || touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || '' }));
    }
  };

  const handleBlur = (field: keyof CompanyFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error || '' }));
  };

  // ========== Handle Submit ==========
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

  // ========== Render ==========
  return (
    <div className="company-form">
      <div className="form-header">
        <h3>{isEditing ? 'ویرایش شرکت' : 'افزودن شرکت جدید'}</h3>
        <button className="close-btn" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-body">
          {/* نام شرکت */}
          <div className="form-group">
            <label>نام شرکت <span className="required">*</span></label>
            <div className="input-with-icon">
              <Building2 size={18} className="input-icon" />
              <input
                type="text"
                placeholder="نام شرکت را وارد کنید..."
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={(touched.name || submitAttempted) && errors.name ? 'error' : ''}
              />
            </div>
            {(touched.name || submitAttempted) && errors.name && (
              <span className="error-text">{errors.name}</span>
            )}
          </div>

          {/* کد اقتصادی و شماره ثبت */}
          <div className="form-row">
            <div className="form-group">
              <label>کد اقتصادی</label>
              <input
                type="text"
                placeholder="کد اقتصادی..."
                value={formData.economic_code || ''}
                onChange={(e) => handleChange('economic_code', e.target.value)}
                onBlur={() => handleBlur('economic_code')}
              />
            </div>
            <div className="form-group">
              <label>شماره ثبت</label>
              <input
                type="text"
                placeholder="شماره ثبت..."
                value={formData.registration_number || ''}
                onChange={(e) => handleChange('registration_number', e.target.value)}
                onBlur={() => handleBlur('registration_number')}
              />
            </div>
          </div>

          {/* شناسه ملی و کد پستی */}
          <div className="form-row">
            <div className="form-group">
              <label>شناسه ملی</label>
              <input
                type="text"
                placeholder="شناسه ملی..."
                value={formData.national_id || ''}
                onChange={(e) => handleChange('national_id', e.target.value)}
                onBlur={() => handleBlur('national_id')}
              />
            </div>
            <div className="form-group">
              <label>کد پستی</label>
              <input
                type="text"
                placeholder="کد پستی..."
                value={formData.postal_code || ''}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                onBlur={() => handleBlur('postal_code')}
              />
            </div>
          </div>

          {/* تلفن و فکس */}
          <div className="form-row">
            <div className="form-group">
              <label>تلفن</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="تلفن..."
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                />
              </div>
            </div>
            <div className="form-group">
              <label>فکس</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="فکس..."
                  value={formData.fax || ''}
                  onChange={(e) => handleChange('fax', e.target.value)}
                  onBlur={() => handleBlur('fax')}
                />
              </div>
            </div>
          </div>

          {/* ایمیل و وب‌سایت */}
          <div className="form-row">
            <div className="form-group">
              <label>ایمیل</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="ایمیل..."
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={(touched.email || submitAttempted) && errors.email ? 'error' : ''}
                />
              </div>
              {(touched.email || submitAttempted) && errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>
            <div className="form-group">
              <label>وب‌سایت</label>
              <div className="input-with-icon">
                <Globe size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="وب‌سایت..."
                  value={formData.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  onBlur={() => handleBlur('website')}
                />
              </div>
            </div>
          </div>

          {/* استان و آدرس */}
          <div className="form-row">
            <div className="form-group">
              <label>استان</label>
              <select
                value={formData.province_id || ''}
                onChange={(e) => handleChange('province_id', Number(e.target.value) || undefined)}
                onBlur={() => handleBlur('province_id')}
              >
                <option value="">انتخاب استان...</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>آدرس</label>
              <div className="input-with-icon">
                <MapPin size={18} className="input-icon" />
                <textarea
                  placeholder="آدرس کامل..."
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  onBlur={() => handleBlur('address')}
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-footer">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            انصراف
          </button>
          <button type="submit" className="btn-primary" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? 'در حال پردازش...' : isEditing ? 'ویرایش' : 'افزودن'}
          </button>
        </div>
      </form>

      <style>{`
        .company-form {
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
        .form-group select,
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
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
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

        .input-with-icon input,
        .input-with-icon select,
        .input-with-icon textarea {
          padding-right: 36px;
        }

        .input-with-icon textarea {
          padding-top: 10px;
          min-height: 60px;
          resize: vertical;
        }

        .input-with-icon .input-icon {
          top: 14px;
          transform: none;
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
          .company-form {
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