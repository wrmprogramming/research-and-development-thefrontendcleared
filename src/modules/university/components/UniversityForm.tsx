// src/modules/university/components/UniversityForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useUniversity } from '../hooks/useUniversity';
import type { UniversityFormData } from '../types/university.types';
import { X, GraduationCap, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { CitySelect } from '../../city/components/CitySelect';
import { UniversityTypeSelect } from '../../university-type/components/UniversityTypeSelect';

interface UniversityFormProps {
  initialData?: any;
  cityId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  title?: string;
}

export const UniversityForm: React.FC<UniversityFormProps> = ({
  initialData = {},
  cityId,
  onSuccess,
  onCancel,
  title = 'افزودن دانشگاه جدید',
}) => {
  const { create, update, isCreating, isUpdating } = useUniversity();

  // ========== State ==========
  const [formData, setFormData] = useState<UniversityFormData>({
    name: '',
    city_id: cityId || 0,
    type_id: 0,
    address: '',
    phone: '',
    email: '',
    website: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData?.id;

  // ========== پر کردن داده‌ها در حالت ویرایش ==========
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        city_id: initialData.city_id || cityId || 0,
        type_id: initialData.type_id || 0,
        address: initialData.address || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        website: initialData.website || '',
      });
      setSubmitAttempted(false);
      setErrors({});
      setTouched({});
    }
  }, [initialData, cityId]);

  // ========== Validation ==========
  const validateField = useCallback((field: keyof UniversityFormData, value: any): string | null => {
    switch (field) {
      case 'name':
        if (!value?.trim()) return 'نام دانشگاه الزامی است';
        return null;
      case 'city_id':
        if (!value || value <= 0) return 'انتخاب شهر الزامی است';
        return null;
      case 'type_id':
        if (!value || value <= 0) return 'انتخاب نوع دانشگاه الزامی است';
        return null;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'فرمت ایمیل نامعتبر است';
        }
        return null;
      case 'phone':
        if (value && !/^[\d\+\-\(\)\s]{6,15}$/.test(value)) {
          return 'فرمت تلفن نامعتبر است';
        }
        return null;
      case 'website':
        if (value && !/^https?:\/\/[^\s]+$/.test(value)) {
          return 'فرمت وبسایت نامعتبر است (مثال: https://example.com)';
        }
        return null;
      default:
        return null;
    }
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    const fieldsToValidate: (keyof UniversityFormData)[] = ['name', 'city_id', 'type_id'];

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasError = true;
      }
    });

    // اعتبارسنجی اختیاری
    if (formData.email) {
      const emailError = validateField('email', formData.email);
      if (emailError) {
        newErrors.email = emailError;
        hasError = true;
      }
    }
    if (formData.phone) {
      const phoneError = validateField('phone', formData.phone);
      if (phoneError) {
        newErrors.phone = phoneError;
        hasError = true;
      }
    }
    if (formData.website) {
      const websiteError = validateField('website', formData.website);
      if (websiteError) {
        newErrors.website = websiteError;
        hasError = true;
      }
    }

    setErrors(newErrors);
    return !hasError;
  }, [formData, validateField]);

  // ========== Handlers ==========
  const handleChange = useCallback((field: keyof UniversityFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitAttempted || touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || '' }));
    }
  }, [submitAttempted, touched, validateField]);

  const handleBlur = useCallback((field: keyof UniversityFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error || '' }));
  }, [formData, validateField]);

  // ========== Submit ==========
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    setSubmitAttempted(true);

    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validate()) {
      setIsSubmitting(false);
      const firstError = document.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      const submitData: any = {
        name: formData.name,
        city_id: formData.city_id,
        type_id: formData.type_id,
      };
      
      if (formData.address) submitData.address = formData.address;
      if (formData.phone) submitData.phone = formData.phone;
      if (formData.email) submitData.email = formData.email;
      if (formData.website) submitData.website = formData.website;

      console.log('📤 Submitting university data:', submitData);

      if (isEditing && initialData?.id) {
        await update(initialData.id, submitData);
      } else {
        await create(submitData);
      }
      
      // ✅ تاخیر کم برای اطمینان از ثبت در سرور
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // ✅ تماس با onSuccess
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('❌ Submit error:', error);
      if (error.response?.data) {
        const serverErrors = error.response.data;
        if (typeof serverErrors === 'object') {
          Object.keys(serverErrors).forEach((field) => {
            const errorMessage = Array.isArray(serverErrors[field])
              ? serverErrors[field][0]
              : serverErrors[field];
            const fieldMapping: Record<string, string> = {
              'city': 'city_id',
              'type': 'type_id',
            };
            const formField = fieldMapping[field] || field;
            setErrors((prev) => ({ ...prev, [formField]: errorMessage }));
            setTouched((prev) => ({ ...prev, [formField]: true }));
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isEditing, initialData, create, update, validate, onSuccess, isSubmitting]);

  return (
    <div className="university-form">
      {/* ========== Header ========== */}
      <div className="form-header">
        <h3>{title}</h3>
        <button className="close-btn" onClick={onCancel} type="button">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-body">
          {/* ===== نام دانشگاه ===== */}
          <div className="form-group">
            <label>نام دانشگاه <span className="required">*</span></label>
            <div className="input-with-icon">
              <GraduationCap size={18} className="input-icon" />
              <input
                type="text"
                placeholder="نام دانشگاه را وارد کنید..."
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={(touched.name || submitAttempted) && errors.name ? 'is-invalid' : ''}
              />
            </div>
            {(touched.name || submitAttempted) && errors.name && (
              <span className="error-text">{errors.name}</span>
            )}
          </div>

          {/* ===== شهر و نوع دانشگاه ===== */}
          <div className="form-row">
            <div className="form-group">
              <label>شهر <span className="required">*</span></label>
              <CitySelect
                value={formData.city_id}
                onChange={(id) => handleChange('city_id', id || 0)}
                placeholder="انتخاب شهر..."
                label=""
                required={true}
                error={errors.city_id}
              />
              {(touched.city_id || submitAttempted) && errors.city_id && (
                <span className="error-text">{errors.city_id}</span>
              )}
            </div>

            <div className="form-group">
              <label>نوع دانشگاه <span className="required">*</span></label>
              <UniversityTypeSelect
                value={formData.type_id}
                onChange={(id) => handleChange('type_id', id || 0)}
                placeholder="انتخاب نوع دانشگاه..."
                label=""
                required={true}
                error={errors.type_id}
              />
              {(touched.type_id || submitAttempted) && errors.type_id && (
                <span className="error-text">{errors.type_id}</span>
              )}
            </div>
          </div>

          {/* ===== آدرس ===== */}
          <div className="form-group">
            <label>آدرس</label>
            <div className="input-with-icon">
              <MapPin size={18} className="input-icon" />
              <input
                type="text"
                placeholder="آدرس دانشگاه..."
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                onBlur={() => handleBlur('address')}
                className={(touched.address || submitAttempted) && errors.address ? 'is-invalid' : ''}
              />
            </div>
            {(touched.address || submitAttempted) && errors.address && (
              <span className="error-text">{errors.address}</span>
            )}
          </div>

          {/* ===== تلفن و ایمیل ===== */}
          <div className="form-row">
            <div className="form-group">
              <label>تلفن</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="تلفن دانشگاه..."
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  className={(touched.phone || submitAttempted) && errors.phone ? 'is-invalid' : ''}
                />
              </div>
              {(touched.phone || submitAttempted) && errors.phone && (
                <span className="error-text">{errors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label>ایمیل</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="ایمیل دانشگاه..."
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={(touched.email || submitAttempted) && errors.email ? 'is-invalid' : ''}
                />
              </div>
              {(touched.email || submitAttempted) && errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>
          </div>

          {/* ===== وبسایت ===== */}
          <div className="form-group">
            <label>وبسایت</label>
            <div className="input-with-icon">
              <Globe size={18} className="input-icon" />
              <input
                type="url"
                placeholder="وبسایت دانشگاه (مثال: https://example.com)..."
                value={formData.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                onBlur={() => handleBlur('website')}
                className={(touched.website || submitAttempted) && errors.website ? 'is-invalid' : ''}
              />
            </div>
            {(touched.website || submitAttempted) && errors.website && (
              <span className="error-text">{errors.website}</span>
            )}
          </div>
        </div>

        {/* ===== Footer ===== */}
        <div className="form-footer">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            انصراف
          </button>
          <button type="submit" className="btn-primary" disabled={isCreating || isUpdating || isSubmitting}>
            {isCreating || isUpdating || isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                در حال پردازش...
              </>
            ) : (
              isEditing ? 'ویرایش' : 'افزودن'
            )}
          </button>
        </div>
      </form>

      <style>{`
        .university-form {
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
        .form-group select {
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
        .form-group select:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .form-group input.is-invalid,
        .form-group select.is-invalid {
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
        .input-with-icon select {
          padding-right: 36px;
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
          justify-content: center;
          gap: 8px;
          padding: 10px 32px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 120px;
        }

        .btn-primary:hover:not(:disabled) {
          background: #4338ca;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
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
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .university-form {
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

export default UniversityForm;
