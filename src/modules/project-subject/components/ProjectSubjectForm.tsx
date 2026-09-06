// src/modules/project-subject/components/ProjectSubjectForm.tsx

import React, { useState, useEffect } from 'react';
import { useProjectSubject } from '../hooks/useProjectSubject';
import { type ProjectSubject, type ProjectSubjectFormData } from '../types/project-subject.types';
import { X, BookOpen } from 'lucide-react';

interface ProjectSubjectFormProps {
  initialData?: ProjectSubject;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProjectSubjectForm: React.FC<ProjectSubjectFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { create, update, isCreating, isUpdating } = useProjectSubject();

  const [formData, setFormData] = useState<ProjectSubjectFormData>({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const isEditing = !!initialData;

  // ========== پر کردن داده‌ها در حالت ویرایش ==========
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
      });
      setSubmitAttempted(false);
      setErrors({});
      setTouched({});
    }
  }, [initialData]);

  // ========== Validation Field ==========
  const validateField = (field: keyof ProjectSubjectFormData, value: any): string | null => {
    switch (field) {
      case 'name':
        if (!value?.trim()) return 'نام موضوع الزامی است';
        return null;
      default:
        return null;
    }
  };

  // ========== Validation All ==========
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    const fieldsToValidate: (keyof ProjectSubjectFormData)[] = ['name'];
    
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

  // ========== Handle Change ==========
  const handleChange = (field: keyof ProjectSubjectFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitAttempted || touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || '' }));
    }
  };

  const handleBlur = (field: keyof ProjectSubjectFormData) => {
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
    <div className="subject-form">
      <div className="form-header">
        <h3>{isEditing ? 'ویرایش موضوع پروژه' : 'افزودن موضوع پروژه جدید'}</h3>
        <button className="close-btn" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-body">
          {/* نام موضوع */}
          <div className="form-group">
            <label>نام موضوع <span className="required">*</span></label>
            <div className="input-with-icon">
              <BookOpen size={18} className="input-icon" />
              <input
                type="text"
                placeholder="نام موضوع پروژه را وارد کنید..."
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

          {/* توضیحات */}
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
        .subject-form {
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

        .form-group input.error {
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

        @media (max-width: 768px) {
          .subject-form {
            padding: 16px;
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