// src/pages/UserCreatePage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../modules/user/hooks/useUsers';
import { useAuth } from '../context/AuthContext';
import {
  UserPlus,
  ArrowRight,
  User,
  Mail,
  Phone,
  Lock,
  CreditCard,
  Shield,
  Eye,
  EyeOff,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Crown,
  UserCheck,
  Users,
  UserCog,
} from 'lucide-react';
import { ROLES } from '../modules/auth/types/auth.types';
import type { UserRole } from '../modules/auth/types/auth.types';

interface FormData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone: string;
  national_code: string;
  role: UserRole;
  is_active: boolean;
  is_staff: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { useCreate } = useUsers();
  const createMutation = useCreate();

  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: '',
    national_code: '',
    role: 'USER',
    is_active: true,
    is_staff: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const isSuperUser = currentUser?.is_superuser;

  // ========== تغییر فیلد ==========
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // ========== اعتبارسنجی ==========
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'نام کاربری الزامی است';
    } else if (formData.username.length < 3) {
      newErrors.username = 'نام کاربری حداقل ۳ کاراکتر باشد';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'نام کاربری فقط شامل حروف انگلیسی، اعداد و _ باشد';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'نام الزامی است';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'نام خانوادگی الزامی است';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'ایمیل نامعتبر است';
    }

    if (formData.phone && !/^09[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = 'شماره موبایل باید با ۰۹ شروع و ۱۱ رقم باشد';
    }

    if (formData.national_code && !/^[0-9]{10}$/.test(formData.national_code)) {
      newErrors.national_code = 'کد ملی باید ۱۰ رقم باشد';
    }

    if (!formData.password) {
      newErrors.password = 'رمز عبور الزامی است';
    } else if (formData.password.length < 8) {
      newErrors.password = 'رمز عبور حداقل ۸ کاراکتر باشد';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'رمز عبور باید شامل حروف بزرگ، کوچک و عدد باشد';
    }

    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'رمز عبور و تکرار آن مطابقت ندارند';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========== ارسال ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      const firstError = document.querySelector('.has-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      const payload = {
        ...formData,
        email: formData.email || '',
        phone: formData.phone || '',
        national_code: formData.national_code || null,
      };

      await createMutation.mutateAsync(payload);
      navigate('/users');
    } catch (error) {
      console.error('Create user error:', error);
    }
  };

  // ========== آیکون نقش ==========
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return Crown;
      case 'MANAGER': return Shield;
      case 'RESEARCHER': return UserCheck;
      case 'USER': return Users;
      case 'VIEWER': return UserCog;
      default: return User;
    }
  };

  return (
    <div className="user-create-page">
      {/* ========== هدر ========== */}
      <div className="page-header">
        <div className="header-left">
          <button
            className="back-btn"
            onClick={() => navigate('/users')}
            title="بازگشت"
          >
            <ArrowRight size={20} />
          </button>
          <div className="header-icon">
            <UserPlus size={28} />
          </div>
          <div className="header-content">
            <h1 className="page-title">ایجاد کاربر جدید</h1>
            <p className="page-subtitle">
              اطلاعات کاربر جدید را وارد کنید
            </p>
          </div>
        </div>
      </div>

      {/* ========== فرم ========== */}
      <form onSubmit={handleSubmit} className="create-form">
        {/* ========== بخش 1: اطلاعات ورود ========== */}
        <div className="form-section">
          <div className="section-header">
            <Lock size={18} />
            <h2>اطلاعات ورود</h2>
          </div>

          <div className="form-grid">
            <div className={`form-group ${errors.username ? 'has-error' : ''}`}>
              <label>نام کاربری <span className="required">*</span></label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="مثال: ali_rezaei"
                  dir="ltr"
                  autoComplete="off"
                />
              </div>
              {errors.username && (
                <span className="error-text">
                  <AlertCircle size={12} />
                  {errors.username}
                </span>
              )}
            </div>

            <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
              <label>ایمیل</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@domain.com"
                  dir="ltr"
                  autoComplete="off"
                />
              </div>
              {errors.email && (
                <span className="error-text">
                  <AlertCircle size={12} />
                  {errors.email}
                </span>
              )}
            </div>

            <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
              <label>رمز عبور <span className="required">*</span></label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="حداقل ۸ کاراکتر"
                  dir="ltr"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="error-text">
                  <AlertCircle size={12} />
                  {errors.password}
                </span>
              )}
            </div>

            <div className={`form-group ${errors.password_confirm ? 'has-error' : ''}`}>
              <label>تکرار رمز عبور <span className="required">*</span></label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  placeholder="رمز عبور را مجدداً وارد کنید"
                  dir="ltr"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                >
                  {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password_confirm && (
                <span className="error-text">
                  <AlertCircle size={12} />
                  {errors.password_confirm}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ========== بخش 2: اطلاعات شخصی ========== */}
        <div className="form-section">
          <div className="section-header">
            <User size={18} />
            <h2>اطلاعات شخصی</h2>
          </div>

          <div className="form-grid">
            <div className={`form-group ${errors.first_name ? 'has-error' : ''}`}>
              <label>نام <span className="required">*</span></label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="مثال: علی"
                />
              </div>
              {errors.first_name && (
                <span className="error-text">
                  <AlertCircle size={12} />
                  {errors.first_name}
                </span>
              )}
            </div>

            <div className={`form-group ${errors.last_name ? 'has-error' : ''}`}>
              <label>نام خانوادگی <span className="required">*</span></label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="مثال: رضایی"
                />
              </div>
              {errors.last_name && (
                <span className="error-text">
                  <AlertCircle size={12} />
                  {errors.last_name}
                </span>
              )}
            </div>

            <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
              <label>شماره موبایل</label>
              <div className="input-wrapper">
                <Phone size={18} className="input-icon" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="09121234567"
                  dir="ltr"
                  maxLength={11}
                />
              </div>
              {errors.phone && (
                <span className="error-text">
                  <AlertCircle size={12} />
                  {errors.phone}
                </span>
              )}
            </div>

            <div className={`form-group ${errors.national_code ? 'has-error' : ''}`}>
              <label>کد ملی</label>
              <div className="input-wrapper">
                <CreditCard size={18} className="input-icon" />
                <input
                  type="text"
                  name="national_code"
                  value={formData.national_code}
                  onChange={handleChange}
                  placeholder="1234567890"
                  dir="ltr"
                  maxLength={10}
                />
              </div>
              {errors.national_code && (
                <span className="error-text">
                  <AlertCircle size={12} />
                  {errors.national_code}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ========== بخش 3: نقش و دسترسی ========== */}
        <div className="form-section">
          <div className="section-header">
            <Shield size={18} />
            <h2>نقش و دسترسی</h2>
          </div>

          <div className="form-group">
            <label>نقش کاربر <span className="required">*</span></label>
            <div className="roles-grid">
              {Object.entries(ROLES).map(([roleCode, info]) => {
                const RoleIcon = getRoleIcon(roleCode as UserRole);
                const isSelected = formData.role === roleCode;
                const isDisabled = roleCode === 'ADMIN' && !isSuperUser;

                return (
                  <button
                    key={roleCode}
                    type="button"
                    className={`role-option ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => !isDisabled && setFormData({ ...formData, role: roleCode as UserRole })}
                    disabled={isDisabled}
                    style={{
                      borderColor: isSelected ? info.color : undefined,
                      background: isSelected ? `${info.color}10` : undefined,
                    }}
                  >
                    <div
                      className="role-option-icon"
                      style={{
                        background: isSelected ? info.color : '#f3f4f6',
                        color: isSelected ? 'white' : '#6b7280',
                      }}
                    >
                      <RoleIcon size={20} />
                    </div>
                    <div className="role-option-content">
                      <span className="role-option-name">{info.label}</span>
                      <span className="role-option-desc">{info.description}</span>
                    </div>
                    {isSelected && (
                      <div
                        className="role-option-check"
                        style={{ background: info.color }}
                      >
                        <CheckCircle size={16} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <span className="checkbox-custom"></span>
              <div className="checkbox-content">
                <span className="checkbox-title">حساب فعال باشد</span>
                <span className="checkbox-desc">
                  کاربر می‌تواند به سیستم وارد شود
                </span>
              </div>
            </label>

            {isSuperUser && (
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  name="is_staff"
                  checked={formData.is_staff}
                  onChange={handleChange}
                />
                <span className="checkbox-custom"></span>
                <div className="checkbox-content">
                  <span className="checkbox-title">دسترسی به پنل ادمین</span>
                  <span className="checkbox-desc">
                    کاربر می‌تواند به پنل ادمین جنگو وارد شود
                  </span>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* ========== دکمه‌های عملیات ========== */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/users')}
            disabled={createMutation.isPending}
          >
            <X size={18} />
            لغو
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <RefreshCw size={18} className="spin" />
                در حال ایجاد...
              </>
            ) : (
              <>
                <Save size={18} />
                ایجاد کاربر
              </>
            )}
          </button>
        </div>
      </form>

      {/* ========== استایل‌ها ========== */}
      <style>{`
        .user-create-page {
          padding: 24px;
          max-width: 1000px;
          margin: 0 auto;
          background-color: transparent;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: white;
          border: 1.5px solid #e5e7eb;
          color: #4f46e5;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .back-btn:hover {
          background: #f5f3ff;
          border-color: #4f46e5;
        }

        .header-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
          flex-shrink: 0;
        }

        .header-content h1 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 4px 0;
        }

        .page-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .create-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-section {
          background: white;
          border-radius: 14px;
          border: 1px solid #e9ecef;
          padding: 24px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1.5px solid #f3f4f6;
          color: #4f46e5;
        }

        .section-header h2 {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .required {
          color: #dc2626;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-wrapper .input-icon {
          position: absolute;
          right: 14px;
          color: #9ca3af;
          pointer-events: none;
        }

        .input-wrapper input {
          width: 100%;
          padding: 11px 42px 11px 16px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          background: #f9fafb;
          transition: all 0.2s;
        }

        .input-wrapper input:focus {
          border-color: #4f46e5;
          background: white;
          outline: none;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08);
        }

        .input-wrapper input::placeholder {
          color: #9ca3af;
        }

        .password-toggle {
          position: absolute;
          left: 12px;
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #4f46e5;
        }

        .has-error .input-wrapper input {
          border-color: #dc2626;
          background: #fef2f2;
        }

        .error-text {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #dc2626;
        }

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
          margin-top: 6px;
        }

        .role-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          text-align: right;
          font-family: inherit;
          position: relative;
        }

        .role-option:hover:not(.disabled) {
          border-color: #c7d2fe;
          background: #fafbff;
        }

        .role-option.selected {
          border-width: 2px;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
        }

        .role-option.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .role-option-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .role-option-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }

        .role-option-name {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .role-option-desc {
          font-size: 11px;
          color: #6b7280;
          line-height: 1.4;
        }

        .role-option-check {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          color: white;
          flex-shrink: 0;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1.5px solid #f3f4f6;
        }

        .checkbox-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          padding: 12px;
          border-radius: 10px;
          transition: background 0.2s;
        }

        .checkbox-item:hover {
          background: #f9fafb;
        }

        .checkbox-item input[type="checkbox"] {
          display: none;
        }

        .checkbox-custom {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border: 2px solid #d1d5db;
          border-radius: 6px;
          background: white;
          flex-shrink: 0;
          margin-top: 2px;
          transition: all 0.2s;
        }

        .checkbox-item input[type="checkbox"]:checked + .checkbox-custom {
          background: #4f46e5;
          border-color: #4f46e5;
        }

        .checkbox-item input[type="checkbox"]:checked + .checkbox-custom::after {
          content: '✓';
          color: white;
          font-size: 12px;
          font-weight: 700;
        }

        .checkbox-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .checkbox-title {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .checkbox-desc {
          font-size: 12px;
          color: #6b7280;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px;
          background: white;
          border-radius: 14px;
          border: 1px solid #e9ecef;
          position: sticky;
          bottom: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 24px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          white-space: nowrap;
        }

        .btn-primary {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35);
        }

        .btn-secondary {
          background: white;
          color: #374151;
          border: 1.5px solid #e5e7eb;
        }

        .btn-secondary:hover:not(:disabled) {
          border-color: #4f46e5;
          color: #4f46e5;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .user-create-page {
            padding: 16px;
          }

          .form-section {
            padding: 18px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .roles-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .form-actions .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default UserCreatePage;