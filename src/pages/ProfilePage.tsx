// src/pages/ProfilePage.tsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, UserCheck, Edit, Save, X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    national_code: user?.national_code || '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('اطلاعات با موفقیت به‌روزرسانی شد');
    } catch (error: any) {
      toast.error(error.message || 'خطا در به‌روزرسانی اطلاعات');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.new_password_confirm) {
      setErrors({ new_password_confirm: 'رمز عبور و تکرار آن مطابقت ندارند' });
      return;
    }
    
    try {
      await changePassword(passwordData);
      setIsChangingPassword(false);
      setPasswordData({ old_password: '', new_password: '', new_password_confirm: '' });
      toast.success('رمز عبور با موفقیت تغییر کرد');
    } catch (error: any) {
      toast.error(error.message || 'خطا در تغییر رمز عبور');
    }
  };

  if (!user) {
    return <div className="loading">در حال بارگذاری...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.profile_image ? (
            <img src={user.profile_image} alt={user.full_name} />
          ) : (
            <span>{user.full_name?.charAt(0) || 'U'}</span>
          )}
        </div>
        <div className="profile-info">
          <h1>{user.full_name}</h1>
          <span className="profile-role">{user.role_display}</span>
          <span className={`profile-status ${user.is_active ? 'active' : 'inactive'}`}>
            {user.is_active ? 'فعال' : 'غیرفعال'}
          </span>
        </div>
        <button className="btn-edit" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? <X size={18} /> : <Edit size={18} />}
          {isEditing ? 'لغو' : 'ویرایش پروفایل'}
        </button>
      </div>

      {/* ===== فرم اطلاعات شخصی ===== */}
      <div className="profile-card">
        <h3>اطلاعات شخصی</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>نام</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="form-group">
              <label>نام خانوادگی</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>ایمیل</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="form-group">
              <label>تلفن</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>کد ملی</label>
            <div className="input-with-icon">
              <UserCheck size={18} className="input-icon" />
              <input
                type="text"
                name="national_code"
                value={formData.national_code || ''}
                onChange={handleChange}
                disabled
              />
            </div>
            <small className="hint">کد ملی قابل ویرایش نیست</small>
          </div>

          {isEditing && (
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                <Save size={16} />
                ذخیره تغییرات
              </button>
            </div>
          )}
        </form>
      </div>

      {/* ===== تغییر رمز عبور ===== */}
      <div className="profile-card">
        <div className="card-header">
          <h3>تغییر رمز عبور</h3>
          <button 
            className="btn-change-password"
            onClick={() => setIsChangingPassword(!isChangingPassword)}
          >
            <Lock size={16} />
            {isChangingPassword ? 'لغو' : 'تغییر رمز عبور'}
          </button>
        </div>
        
        {isChangingPassword && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>رمز عبور فعلی</label>
              <input
                type="password"
                name="old_password"
                placeholder="رمز عبور فعلی را وارد کنید..."
                value={passwordData.old_password}
                onChange={handlePasswordChange}
                className={errors.old_password ? 'is-invalid' : ''}
              />
              {errors.old_password && <span className="error-text">{errors.old_password}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>رمز عبور جدید</label>
                <input
                  type="password"
                  name="new_password"
                  placeholder="رمز عبور جدید را وارد کنید..."
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className={errors.new_password ? 'is-invalid' : ''}
                />
                {errors.new_password && <span className="error-text">{errors.new_password}</span>}
              </div>
              <div className="form-group">
                <label>تکرار رمز عبور جدید</label>
                <input
                  type="password"
                  name="new_password_confirm"
                  placeholder="رمز عبور جدید را مجدداً وارد کنید..."
                  value={passwordData.new_password_confirm}
                  onChange={handlePasswordChange}
                  className={errors.new_password_confirm ? 'is-invalid' : ''}
                />
                {errors.new_password_confirm && <span className="error-text">{errors.new_password_confirm}</span>}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                <Lock size={16} />
                تغییر رمز عبور
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ===== مجوزهای کاربر ===== */}
      <div className="profile-card">
        <h3>مجوزهای دسترسی</h3>
        <div className="permissions-grid">
          <div className={`permission-item ${user.can_manage_base ? 'allowed' : 'denied'}`}>
            <span className="permission-name">مدیریت پایه</span>
            <span className="permission-badge">
              {user.can_manage_base ? '✅' : '❌'}
            </span>
            <span className="permission-desc">
              {user.can_manage_base ? 'دسترسی کامل' : 'بدون دسترسی'}
            </span>
          </div>
          <div className={`permission-item ${user.can_manage_research ? 'allowed' : 'denied'}`}>
            <span className="permission-name">مدیریت پژوهشی</span>
            <span className="permission-badge">
              {user.can_manage_research ? '✅' : '❌'}
            </span>
            <span className="permission-desc">
              {user.can_manage_research ? 'دسترسی کامل' : 'بدون دسترسی'}
            </span>
          </div>
          <div className={`permission-item ${user.can_manage_contracts ? 'allowed' : 'denied'}`}>
            <span className="permission-name">مدیریت قراردادها</span>
            <span className="permission-badge">
              {user.can_manage_contracts ? '✅' : '❌'}
            </span>
            <span className="permission-desc">
              {user.can_manage_contracts ? 'دسترسی کامل' : 'بدون دسترسی'}
            </span>
          </div>
          <div className="permission-item allowed">
            <span className="permission-name">مشاهده همه</span>
            <span className="permission-badge">✅</span>
            <span className="permission-desc">دسترسی کامل</span>
          </div>
        </div>
      </div>

      <style>{`
        .profile-page {
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #4f46e5;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 600;
          overflow: hidden;
          flex-shrink: 0;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-info {
          flex: 1;
        }

        .profile-info h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
        }

        .profile-role {
          display: inline-block;
          padding: 2px 12px;
          background: #eef2ff;
          color: #4f46e5;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          margin-right: 8px;
        }

        .profile-status {
          display: inline-block;
          padding: 2px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .profile-status.active {
          background: #d1fae5;
          color: #059669;
        }

        .profile-status.inactive {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-edit {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1.5px solid #e9ecef;
          border-radius: 8px;
          background: white;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .btn-edit:hover {
          border-color: #4f46e5;
          color: #4f46e5;
        }

        .profile-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          margin-bottom: 20px;
        }

        .profile-card h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .card-header h3 {
          margin: 0;
        }

        .btn-change-password {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border: 1.5px solid #e9ecef;
          border-radius: 6px;
          background: white;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
        }

        .btn-change-password:hover {
          border-color: #4f46e5;
          color: #4f46e5;
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
          width: 100%;
          padding: 10px 40px 10px 12px;
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
          background: white;
        }

        .input-with-icon input:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .input-with-icon input:disabled {
          background: #f9fafb;
          color: #6b7280;
        }

        .input-with-icon input.is-invalid {
          border-color: #dc2626;
        }

        .error-text {
          font-size: 12px;
          color: #dc2626;
        }

        .hint {
          font-size: 12px;
          color: #6b7280;
        }

        .form-actions {
          margin-top: 16px;
          display: flex;
          justify-content: flex-end;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #4338ca;
          transform: translateY(-1px);
        }

        .permissions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .permission-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          background: #f8fafc;
        }

        .permission-item.allowed {
          border-color: #d1fae5;
          background: #f0fdf4;
        }

        .permission-item.denied {
          border-color: #fee2e2;
          background: #fef2f2;
        }

        .permission-name {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          flex: 1;
        }

        .permission-badge {
          font-size: 16px;
        }

        .permission-desc {
          font-size: 12px;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            text-align: center;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .permissions-grid {
            grid-template-columns: 1fr;
          }

          .card-header {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;