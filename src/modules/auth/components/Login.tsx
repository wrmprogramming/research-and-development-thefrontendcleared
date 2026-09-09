// src/modules/auth/components/Login.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Eye, EyeOff, LogIn, User, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      setErrors((prev) => ({ ...prev, username: 'نام کاربری الزامی است' }));
      return;
    }
    if (!formData.password.trim()) {
      setErrors((prev) => ({ ...prev, password: 'رمز عبور الزامی است' }));
      return;
    }

    setIsSubmitting(true);
    try {
      await login(formData);
          // ✅ بعد از لاگین موفق، به صفحه اصلی برو
    navigate('/', { replace: true });
    //   navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.error ||
                     'خطا در ورود به سیستم';
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1>ورود به سیستم</h1>
            <p>لطفاً اطلاعات خود را وارد کنید</p>
          </div>

          {errors.general && (
            <div className="alert alert-danger">{errors.general}</div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>نام کاربری</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="username"
                  placeholder="نام کاربری خود را وارد کنید..."
                  value={formData.username}
                  onChange={handleChange}
                  className={errors.username ? 'is-invalid' : ''}
                  disabled={isSubmitting}
                />
              </div>
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label>رمز عبور</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="رمز عبور خود را وارد کنید..."
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'is-invalid' : ''}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" />
                  در حال ورود...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  ورود
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              حساب کاربری ندارید؟{' '}
              <Link to="/register">ثبت‌نام کنید</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          padding: 20px;
        }

        .login-container {
          width: 100%;
          max-width: 400px;
        }

        .login-box {
          background: white;
          border-radius: 16px;
          padding: 40px 32px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-header h1 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 4px 0;
        }

        .login-header p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .alert-danger {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .login-form {
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
          padding: 10px 40px 10px 40px;
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

        .input-with-icon input.is-invalid {
          border-color: #dc2626;
        }

        .password-toggle {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
        }

        .password-toggle:hover {
          color: #6b7280;
        }

        .error-text {
          font-size: 12px;
          color: #dc2626;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 16px;
          width: 100%;
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
          to { transform: rotate(360deg); }
        }

        .login-footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #e9ecef;
        }

        .login-footer p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .login-footer a {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 500;
        }

        .login-footer a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .login-box {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  );
};


// // src/pages/Login/Login.tsx
// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../../context/AuthContext';
// import { 
//   Eye, EyeOff, LogIn, Mail, Lock, Sparkles, Shield, Users, Building2,
//   UserPlus, FileText, TrendingUp
// } from 'lucide-react';
// import './Login.css';

// export function Login() {
//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     username: '',
//     password: '',
//     remember: false,
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       await login(formData.username, formData.password);
//       navigate('/');
//     } catch (err) {
//       setError('نام کاربری یا رمز عبور اشتباه است');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="login-bg-circle-1"></div>
//       <div className="login-bg-circle-2"></div>
//       <div className="login-bg-circle-3"></div>

//       <div className="login-container">
//         <div className="login-form-wrapper">
//           <div className="login-form-content">
//             <div className="login-logo">
//               <div className="logo-wrapper">
//                 <img src="/logo.jpg" alt="لوگو" className="logo-image" />
//               </div>
//               <h1>سامانه مدیریت پژوهش</h1>
//               <p>پنل مدیریت یکپارچه پروژه‌های پژوهشی</p>
//             </div>

//             <div className="login-divider">
//               <span></span>
//               <span className="login-divider-text">ورود به حساب کاربری</span>
//               <span></span>
//             </div>

//             <form onSubmit={handleSubmit} className="login-form">
//               {error && (
//                 <div className="login-error">
//                   <span>{error}</span>
//                 </div>
//               )}

//               <div className="form-group">
//                 <label>نام کاربری</label>
//                 <div className="input-wrapper">
//                   <Mail size={20} className="input-icon" />
//                   <input
//                     type="text"
//                     placeholder="نام کاربری خود را وارد کنید"
//                     value={formData.username}
//                     onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label>رمز عبور</label>
//                 <div className="input-wrapper">
//                   <Lock size={20} className="input-icon" />
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder="رمز عبور خود را وارد کنید"
//                     value={formData.password}
//                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                     required
//                   />
//                   <button
//                     type="button"
//                     className="password-toggle"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//               </div>

//               <div className="form-options">
//                 <label className="checkbox-label">
//                   <input
//                     type="checkbox"
//                     checked={formData.remember}
//                     onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
//                   />
//                   <span>مرا به خاطر بسپار</span>
//                 </label>
//                 <Link to="/forgot-password" className="forgot-link">
//                   رمز عبور را فراموش کرده‌اید؟
//                 </Link>
//               </div>

//               <button type="submit" className="login-btn" disabled={loading}>
//                 {loading ? (
//                   <span className="spinner-small"></span>
//                 ) : (
//                   <>
//                     <LogIn size={20} />
//                     ورود به سامانه
//                   </>
//                 )}
//               </button>
//             </form>

//             <div className="login-register">
//               <Link to="/register" className="register-link">
//                 <UserPlus size={18} />
//                 ثبت نام
//               </Link>
//             </div>

//             <div className="login-quick">
//               <p>یا با نقش‌های نمونه وارد شوید</p>
//               <div className="quick-buttons">
//                 <button 
//                   type="button" 
//                   className="quick-btn admin"
//                   onClick={() => {
//                     setFormData({ ...formData, username: 'admin', password: 'admin123' });
//                   }}
//                 >
//                   <Shield size={16} />
//                   ادمین
//                 </button>
//                 <button 
//                   type="button" 
//                   className="quick-btn manager"
//                   onClick={() => {
//                     setFormData({ ...formData, username: 'manager', password: 'manager123' });
//                   }}
//                 >
//                   <Users size={16} />
//                   مدیر
//                 </button>
//                 <button 
//                   type="button" 
//                   className="quick-btn user"
//                   onClick={() => {
//                     setFormData({ ...formData, username: 'user', password: 'user123' });
//                   }}
//                 >
//                   <Building2 size={16} />
//                   کاربر
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="login-info-wrapper">
//           <div className="login-info-content">
//             <div className="info-badge">
//               <Sparkles size={24} />
//               <span>سیستم مدیریت پژوهش</span>
//             </div>

//             <h2>به سامانه مدیریت پژوهش خوش آمدید</h2>
//             <p>
//               سامانه یکپارچه مدیریت پروژه‌های پژوهشی، قراردادها،
//               پیشرفت فیزیکی و مالی، کمیته‌ها و گزارش‌گیری پیشرفته
//             </p>

//             <div className="info-features">
//               <div className="info-feature">
//                 <div className="feature-icon purple">
//                   <FileText size={20} />
//                 </div>
//                 <div>
//                   <h4>مدیریت پژوهش</h4>
//                   <p>ثبت و پیگیری پروژه‌های پژوهشی</p>
//                 </div>
//               </div>

//               <div className="info-feature">
//                 <div className="feature-icon blue">
//                   <FileText size={20} />
//                 </div>
//                 <div>
//                   <h4>مدیریت قرارداد</h4>
//                   <p>ثبت و نظارت بر قراردادها</p>
//                 </div>
//               </div>

//               <div className="info-feature">
//                 <div className="feature-icon green">
//                   <TrendingUp size={20} />
//                 </div>
//                 <div>
//                   <h4>پیشرفت پروژه</h4>
//                   <p>پایش پیشرفت فیزیکی و مالی</p>
//                 </div>
//               </div>
//             </div>

//             <div className="info-footer">
//               <span>نسخه 1.0</span>
//               <span className="dot"></span>
//               <span>1405</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }