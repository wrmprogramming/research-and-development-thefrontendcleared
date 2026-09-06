// src/modules/person/components/PersonForm.tsx

import React, { useState, useEffect } from 'react';
import { usePerson } from '../hooks/usePerson';
import { GENDER_LABELS, EDUCATIONAL_DEGREE_LABELS, type Person, type PersonFormData } from '../types/person.types';
import { X, Upload, User, Phone, Mail, MapPin, GraduationCap, Briefcase } from 'lucide-react';
import JalaliDatePicker from '../../../components/JalaliDatePicker';

interface PersonFormProps {
  initialData?: Person;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PersonForm: React.FC<PersonFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { create, update, isCreating, isUpdating } = usePerson();
  const [formData, setFormData] = useState<PersonFormData>({
    first_name: '',
    last_name: '',
    national_code: '',
    gender: 'M',
    mobile_phone: '',
    educational_degree: 'BACHELOR',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isFileRemoved, setIsFileRemoved] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false); // ✅ اضافه شد

  const isEditing = !!initialData;

  // ========== پر کردن داده‌ها در حالت ویرایش ==========
  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        father_name: initialData.father_name || '',
        national_code: initialData.national_code || '',
        birth_year: initialData.birth_year || '',
        gender: initialData.gender || 'M',
        mobile_phone: initialData.mobile_phone || '',
        home_phone: initialData.home_phone || '',
        work_phone: initialData.work_phone || '',
        email: initialData.email || '',
        educational_degree: initialData.educational_degree || 'BACHELOR',
        field_of_study: initialData.field_of_study || '',
        job_position: initialData.job_position || '',
        home_address: initialData.home_address || '',
        work_address: initialData.work_address || '',
        profile_image: initialData.profile_image || null,
      });
      setIsFileRemoved(false);
      setSelectedFile(null);
      setSubmitAttempted(false);
    }
  }, [initialData]);

  // ========== Validation ==========
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'نام الزامی است';
    }

    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'نام خانوادگی الزامی است';
    }

    if (!formData.national_code?.trim()) {
      newErrors.national_code = 'کد ملی الزامی است';
    } else if (!/^\d{10}$/.test(formData.national_code)) {
      newErrors.national_code = 'کد ملی باید 10 رقم باشد';
    }

    if (!formData.mobile_phone?.trim()) {
      newErrors.mobile_phone = 'تلفن همراه الزامی است';
    } else if (!/^09\d{9}$/.test(formData.mobile_phone)) {
      newErrors.mobile_phone = 'فرمت تلفن همراه معتبر نیست';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'فرمت ایمیل معتبر نیست';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========== Validate Single Field ==========
  const validateField = (field: keyof PersonFormData, value: any): string | null => {
    switch (field) {
      case 'first_name':
        if (!value?.trim()) return 'نام الزامی است';
        return null;
      case 'last_name':
        if (!value?.trim()) return 'نام خانوادگی الزامی است';
        return null;
      case 'national_code':
        if (!value?.trim()) return 'کد ملی الزامی است';
        if (!/^\d{10}$/.test(value)) return 'کد ملی باید 10 رقم باشد';
        return null;
      case 'mobile_phone':
        if (!value?.trim()) return 'تلفن همراه الزامی است';
        if (!/^09\d{9}$/.test(value)) return 'فرمت تلفن همراه معتبر نیست';
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

  // ========== Handle Change ==========
  const handleChange = (field: keyof PersonFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // ✅ اگر قبلاً submit شده بود یا فیلد touched بود، validation رو اجرا کن
    if (submitAttempted || touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || '' }));
    }
  };

  // ========== Handle Blur ==========
  const handleBlur = (field: keyof PersonFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error || '' }));
  };

  // ========== Handle File Change ==========
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsFileRemoved(false);
      setFormData((prev) => ({ ...prev, profile_image: file }));
      setUploadProgress(0);
    }
  };

  // ========== Handle File Remove ==========
  const handleFileRemove = () => {
    setSelectedFile(null);
    setIsFileRemoved(true);
    setFormData((prev) => ({ ...prev, profile_image: null }));
    const fileInput = document.getElementById('profile_image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // ========== Handle Submit ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ علامت بزن که submit شده
    setSubmitAttempted(true);
    
    // همه فیلدها را به عنوان touched علامت بزن
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // ✅ همه فیلدها رو validation کن
    let hasError = false;
    const newErrors: Record<string, string> = {};
    
    Object.keys(formData).forEach((key) => {
      const field = key as keyof PersonFormData;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasError = true;
      }
    });
    
    setErrors(newErrors);

    if (hasError) {
      // اسکرول به اولین خطا
      const firstError = document.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      const submitData = { ...formData };

      if (selectedFile) {
        submitData.profile_image = selectedFile;
      } else if (isEditing && isFileRemoved) {
        submitData.profile_image = null;
      }

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
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  // ========== Render ==========
  return (
    <div className="person-form">
      <div className="form-header">
        <h3>{isEditing ? 'ویرایش شخص' : 'افزودن شخص جدید'}</h3>
        <button className="close-btn" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-body">
          {/* ========== ردیف اول: نام و نام خانوادگی ========== */}
          <div className="form-row">
            <div className="form-group">
              <label>نام <span className="required">*</span></label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="نام..."
                  value={formData.first_name || ''}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  onBlur={() => handleBlur('first_name')}
                  className={(touched.first_name || submitAttempted) && errors.first_name ? 'error' : ''}
                />
              </div>
              {(touched.first_name || submitAttempted) && errors.first_name && (
                <span className="error-text">{errors.first_name}</span>
              )}
            </div>
            <div className="form-group">
              <label>نام خانوادگی <span className="required">*</span></label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="نام خانوادگی..."
                  value={formData.last_name || ''}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  onBlur={() => handleBlur('last_name')}
                  className={(touched.last_name || submitAttempted) && errors.last_name ? 'error' : ''}
                />
              </div>
              {(touched.last_name || submitAttempted) && errors.last_name && (
                <span className="error-text">{errors.last_name}</span>
              )}
            </div>
          </div>

          {/* ========== ردیف دوم: نام پدر و کد ملی ========== */}
          <div className="form-row">
            <div className="form-group">
              <label>نام پدر</label>
              <input
                type="text"
                placeholder="نام پدر..."
                value={formData.father_name || ''}
                onChange={(e) => handleChange('father_name', e.target.value)}
                onBlur={() => handleBlur('father_name')}
              />
            </div>
            <div className="form-group">
              <label>کد ملی <span className="required">*</span></label>
              <input
                type="text"
                placeholder="کد ملی 10 رقمی..."
                value={formData.national_code || ''}
                onChange={(e) => handleChange('national_code', e.target.value)}
                onBlur={() => handleBlur('national_code')}
                className={(touched.national_code || submitAttempted) && errors.national_code ? 'error' : ''}
                maxLength={10}
              />
              {(touched.national_code || submitAttempted) && errors.national_code && (
                <span className="error-text">{errors.national_code}</span>
              )}
            </div>
          </div>

          {/* ========== ردیف سوم: جنسیت و تاریخ تولد ========== */}
          <div className="form-row">
            <div className="form-group">
              <label>جنسیت <span className="required">*</span></label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                onBlur={() => handleBlur('gender')}
              >
                {Object.entries(GENDER_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>سال تولد</label>
               <input
                  type="text"
                  placeholder="1360"
                  value={formData.birth_year || ''}
                  onChange={(e) => handleChange('birth_year', e.target.value)}
                  onBlur={() => handleBlur('birth_year')}
                  className={(touched.birth_year || submitAttempted) && errors.birth_year ? 'error' : ''}
                  maxLength={4}
                />
            </div>
          </div>

          {/* ========== ردیف چهارم: تلفن‌ها ========== */}
          <div className="form-row">
            <div className="form-group">
              <label>تلفن همراه <span className="required">*</span></label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="09123456789..."
                  value={formData.mobile_phone || ''}
                  onChange={(e) => handleChange('mobile_phone', e.target.value)}
                  onBlur={() => handleBlur('mobile_phone')}
                  className={(touched.mobile_phone || submitAttempted) && errors.mobile_phone ? 'error' : ''}
                  maxLength={11}
                />
              </div>
              {(touched.mobile_phone || submitAttempted) && errors.mobile_phone && (
                <span className="error-text">{errors.mobile_phone}</span>
              )}
            </div>
            <div className="form-group">
              <label>تلفن منزل</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="021-12345678..."
                  value={formData.home_phone || ''}
                  onChange={(e) => handleChange('home_phone', e.target.value)}
                  onBlur={() => handleBlur('home_phone')}
                />
              </div>
            </div>
          </div>

          {/* ========== ردیف پنجم: تلفن کار و ایمیل ========== */}
          <div className="form-row">
            <div className="form-group">
              <label>تلفن محل کار</label>
              <div className="input-with-icon">
                <Briefcase size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="تلفن محل کار..."
                  value={formData.work_phone || ''}
                  onChange={(e) => handleChange('work_phone', e.target.value)}
                  onBlur={() => handleBlur('work_phone')}
                />
              </div>
            </div>
            <div className="form-group">
              <label>ایمیل</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="example@mail.com..."
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
          </div>

          {/* ========== ردیف ششم: مدرک تحصیلی و رشته ========== */}
          <div className="form-row">
            <div className="form-group">
              <label>مدرک تحصیلی</label>
              <div className="input-with-icon">
                <GraduationCap size={18} className="input-icon" />
                <select
                  value={formData.educational_degree || ''}
                  onChange={(e) => handleChange('educational_degree', e.target.value)}
                  onBlur={() => handleBlur('educational_degree')}
                >
                  <option value="">انتخاب کنید...</option>
                  {Object.entries(EDUCATIONAL_DEGREE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>رشته تحصیلی</label>
              <input
                type="text"
                placeholder="رشته تحصیلی..."
                value={formData.field_of_study || ''}
                onChange={(e) => handleChange('field_of_study', e.target.value)}
                onBlur={() => handleBlur('field_of_study')}
              />
            </div>
          </div>

          {/* ========== ردیف هفتم: سمت شغلی و تصویر ========== */}
          <div className="form-row">
            <div className="form-group">
              <label>سمت شغلی</label>
              <div className="input-with-icon">
                <Briefcase size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="سمت شغلی..."
                  value={formData.job_position || ''}
                  onChange={(e) => handleChange('job_position', e.target.value)}
                  onBlur={() => handleBlur('job_position')}
                />
              </div>
            </div>
            <div className="form-group">
              <label>تصویر پروفایل</label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="profile_image"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <label htmlFor="profile_image" className="file-upload-label">
                  <Upload size={18} />
                  <span>انتخاب تصویر</span>
                </label>
                {selectedFile && (
                  <div className="file-info">
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </span>
                    <button type="button" className="file-remove" onClick={handleFileRemove}>
                      <X size={14} />
                    </button>
                  </div>
                )}
                {!selectedFile && !isFileRemoved && initialData?.profile_image && (
                  <div className="file-info existing">
                    <span className="file-name">تصویر فعلی</span>
                    <button type="button" className="file-remove" onClick={handleFileRemove}>
                      <X size={14} />
                    </button>
                  </div>
                )}
                {isEditing && isFileRemoved && !selectedFile && (
                  <div className="file-info removed">
                    <span className="file-name" style={{ color: '#dc2626' }}>
                      تصویر حذف شده است
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========== ردیف هشتم: آدرس‌ها ========== */}
          <div className="form-row">
            <div className="form-group">
              <label>آدرس منزل</label>
              <div className="input-with-icon">
                <MapPin size={18} className="input-icon" />
                <textarea
                  placeholder="آدرس کامل منزل..."
                  value={formData.home_address || ''}
                  onChange={(e) => handleChange('home_address', e.target.value)}
                  onBlur={() => handleBlur('home_address')}
                  rows={2}
                />
              </div>
            </div>
            <div className="form-group">
              <label>آدرس محل کار</label>
              <div className="input-with-icon">
                <MapPin size={18} className="input-icon" />
                <textarea
                  placeholder="آدرس کامل محل کار..."
                  value={formData.work_address || ''}
                  onChange={(e) => handleChange('work_address', e.target.value)}
                  onBlur={() => handleBlur('work_address')}
                  rows={2}
                />
              </div>
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
              isEditing ? 'ویرایش' : 'افزودن'
            )}
          </button>
        </div>
      </form>

      {/* استایل‌ها (همان قبلی) */}
      <style>{`
        .person-form {
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
          .person-form {
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
