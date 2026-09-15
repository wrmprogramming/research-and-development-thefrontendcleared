
// src/modules/auth/components/Register.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Eye, EyeOff, User, Lock, Mail, Phone, UserCheck } from 'lucide-react';
import loginBg from '../../../assets/images/login-bg.jpg';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: '',
    national_code: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'نام کاربری الزامی است';
    } else if (formData.username.length < 3) {
      newErrors.username = 'نام کاربری حداقل ۳ کاراکتر باید باشد';
    }
    
    if (!formData.password) {
      newErrors.password = 'رمز عبور الزامی است';
    } else if (formData.password.length < 6) {
      newErrors.password = 'رمز عبور حداقل ۶ کاراکتر باید باشد';
    }
    
    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'رمز عبور و تکرار آن مطابقت ندارند';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'ایمیل نامعتبر است';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      const firstError = document.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        national_code: formData.national_code,
      });
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.error ||
                     'خطا در ثبت‌نام';
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page" style={{ backgroundImage: `url(${loginBg})`}}>
      <div className="register-container">
        <div className="register-box">
          <div className="register-header">
            <h1>ثبت‌نام</h1>
            <p>لطفاً اطلاعات خود را وارد کنید</p>
          </div>

          {errors.general && (
            <div className="alert alert-danger">{errors.general}</div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            {/* نام و نام خانوادگی */}
            <div className="form-row">
              <div className="form-group">
                <label>نام</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    name="first_name"
                    placeholder="نام خود را وارد کنید..."
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={isSubmitting}
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
                    placeholder="نام خانوادگی خود را وارد کنید..."
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* نام کاربری */}
            <div className="form-group">
              <label>نام کاربری <span className="required">*</span></label>
              <div className="input-with-icon">
                <UserCheck size={18} className="input-icon" />
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

            {/* ایمیل */}
            <div className="form-group">
              <label>ایمیل</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="ایمیل خود را وارد کنید..."
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'is-invalid' : ''}
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            {/* تلفن و کد ملی */}
            <div className="form-row">
              <div className="form-group">
                <label>تلفن</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="text"
                    name="phone"
                    placeholder="تلفن خود را وارد کنید..."
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>کد ملی</label>
                <div className="input-with-icon">
                  <UserCheck size={18} className="input-icon" />
                  <input
                    type="text"
                    name="national_code"
                    placeholder="کد ملی خود را وارد کنید..."
                    value={formData.national_code}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            {/* رمز عبور */}
            <div className="form-group">
              <label>رمز عبور <span className="required">*</span></label>
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

            {/* تکرار رمز عبور */}
            <div className="form-group">
              <label>تکرار رمز عبور <span className="required">*</span></label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  name="password_confirm"
                  placeholder="رمز عبور را مجدداً وارد کنید..."
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className={errors.password_confirm ? 'is-invalid' : ''}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                >
                  {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password_confirm && <span className="error-text">{errors.password_confirm}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" />
                  در حال ثبت‌نام...
                </>
              ) : (
                'ثبت‌نام'
              )}
            </button>
          </form>

          <div className="register-footer">
            <p>
              حساب کاربری دارید؟{' '}
              <Link to="/login">ورود</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          padding: 20px;
        }

        .register-container {
          width: 100%;
          max-width: 500px;
        }

        .register-box {
          background: white;
          border-radius: 16px;
          padding: 40px 32px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .register-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .register-header h1 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 4px 0;
        }

        .register-header p {
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

        .register-form {
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
          margin-top: 8px;
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

        .register-footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #e9ecef;
        }

        .register-footer p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .register-footer a {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 500;
        }

        .register-footer a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .register-box {
            padding: 24px 20px;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;


// // src/pages/Register/Register.tsx
// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { 
//   User, Mail, Lock, UserPlus, ArrowLeft, CheckCircle, 
//   Eye, EyeOff, Phone, CreditCard, AlertCircle 
// } from 'lucide-react';
// import './Register.css';

// export function Register() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     first_name: '',
//     last_name: '',
//     phone: '',
//     national_code: '',
//     password: '',
//     confirm_password: '',
//     accept_terms: false,
//   });

//   // ========== تابع تبدیل اعداد به فارسی ==========
//   const toPersianNumber = (num: any): string => {
//     if (num === undefined || num === null || num === '' || isNaN(num)) return '۰';
//     const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
//     return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
    
//     // ========== اعتبارسنجی ==========
//     if (formData.password !== formData.confirm_password) {
//       setError('رمز عبور و تکرار آن مطابقت ندارند');
//       return;
//     }

//     if (!formData.accept_terms) {
//       setError('لطفاً شرایط و قوانین را بپذیرید');
//       return;
//     }

//     // ========== اعتبارسنجی کد ملی ==========
//     if (formData.national_code && formData.national_code.length !== 10) {
//       setError('کد ملی باید ۱۰ رقم باشد');
//       return;
//     }

//     // ========== اعتبارسنجی شماره تلفن ==========
//     if (formData.phone && !/^09[0-9]{9}$/.test(formData.phone)) {
//       setError('شماره تلفن باید با ۰۹ شروع و ۱۱ رقم باشد');
//       return;
//     }

//     // ========== اعتبارسنجی رمز عبور ==========
//     if (formData.password.length < 6) {
//       setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
//       return;
//     }

//     setLoading(true);

//     try {
//       // ========== ارسال به سرور ==========
//       const response = await fetch('/api/auth/register/', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           username: formData.username,
//           email: formData.email,
//           first_name: formData.first_name,
//           last_name: formData.last_name,
//           phone: formData.phone,
//           national_code: formData.national_code,
//           password: formData.password,
//           password_confirm: formData.confirm_password,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setSuccess(true);
//         // بعد از ۳ ثانیه به صفحه ورود برو
//         setTimeout(() => {
//           navigate('/login');
//         }, 3000);
//       } else {
//         // نمایش خطاهای برگشتی از سرور
//         if (data && typeof data === 'object') {
//           const errors = [];
//           for (const [key, value] of Object.entries(data)) {
//             if (Array.isArray(value)) {
//               errors.push(`${key}: ${value.join(', ')}`);
//             } else {
//               errors.push(String(value));
//             }
//           }
//           setError(errors.join(' | '));
//         } else {
//           setError(data?.message || 'خطا در ثبت نام');
//         }
//       }
//     } catch (err) {
//       console.error('Register error:', err);
//       setError('خطا در ارتباط با سرور');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ===== صفحه موفقیت =====
//   if (success) {
//     return (
//       <div className="register-success">
//         <div className="success-container">
//           <CheckCircle size={64} className="success-icon" />
//           <h2>ثبت نام با موفقیت انجام شد!</h2>
//           <p>در حال انتقال به صفحه ورود...</p>
//           <Link to="/login" className="success-link">ورود به سامانه</Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="register-page">
//       <div className="register-bg-circle-1"></div>
//       <div className="register-bg-circle-2"></div>

//       <div className="register-container">
//         <div className="register-form-wrapper">
//           <div className="register-form-content">
//             <div className="register-header">
//               <Link to="/login" className="back-link">
//                 <ArrowLeft size={18} />
//                 بازگشت به ورود
//               </Link>
//               <div className="register-logo">
//                 <img src="/logo.jpg" alt="لوگو" />
//                 <h1>ثبت نام</h1>
//                 <p>ایجاد حساب کاربری جدید</p>
//               </div>
//             </div>

//             {error && (
//               <div className="register-error">
//                 <AlertCircle size={18} />
//                 <span>{error}</span>
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="register-form">
//               <div className="form-row">
//                 <div className="form-group">
//                   <label>نام</label>
//                   <div className="input-wrapper">
//                     <User size={18} className="input-icon" />
//                     <input
//                       type="text"
//                       placeholder="نام خود را وارد کنید"
//                       value={formData.first_name}
//                       onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div className="form-group">
//                   <label>نام خانوادگی</label>
//                   <div className="input-wrapper">
//                     <User size={18} className="input-icon" />
//                     <input
//                       type="text"
//                       placeholder="نام خانوادگی خود را وارد کنید"
//                       value={formData.last_name}
//                       onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
//                       required
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label>نام کاربری</label>
//                 <div className="input-wrapper">
//                   <User size={18} className="input-icon" />
//                   <input
//                     type="text"
//                     placeholder="نام کاربری خود را انتخاب کنید"
//                     value={formData.username}
//                     onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label>ایمیل</label>
//                 <div className="input-wrapper">
//                   <Mail size={18} className="input-icon" />
//                   <input
//                     type="email"
//                     placeholder="ایمیل خود را وارد کنید"
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label>شماره تلفن</label>
//                   <div className="input-wrapper">
//                     <Phone size={18} className="input-icon" />
//                     <input
//                       type="tel"
//                       placeholder="۰۹۱۲۱۲۳۴۵۶۷"
//                       value={formData.phone}
//                       onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                     />
//                   </div>
//                 </div>
//                 <div className="form-group">
//                   <label>کد ملی</label>
//                   <div className="input-wrapper">
//                     <CreditCard size={18} className="input-icon" />
//                     <input
//                       type="text"
//                       placeholder="کد ملی خود را وارد کنید"
//                       value={formData.national_code}
//                       onChange={(e) => setFormData({ ...formData, national_code: e.target.value })}
//                       maxLength={10}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label>رمز عبور</label>
//                 <div className="input-wrapper">
//                   <Lock size={18} className="input-icon" />
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder="رمز عبور خود را وارد کنید (حداقل ۶ کاراکتر)"
//                     value={formData.password}
//                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                     required
//                     minLength={6}
//                   />
//                   <button
//                     type="button"
//                     className="password-toggle"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label>تکرار رمز عبور</label>
//                 <div className="input-wrapper">
//                   <Lock size={18} className="input-icon" />
//                   <input
//                     type={showConfirmPassword ? 'text' : 'password'}
//                     placeholder="رمز عبور را مجدداً وارد کنید"
//                     value={formData.confirm_password}
//                     onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
//                     required
//                   />
//                   <button
//                     type="button"
//                     className="password-toggle"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   >
//                     {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//               </div>

//               <div className="form-options">
//                 <label className="checkbox-label">
//                   <input
//                     type="checkbox"
//                     checked={formData.accept_terms}
//                     onChange={(e) => setFormData({ ...formData, accept_terms: e.target.checked })}
//                   />
//                   <span>شرایط و قوانین سامانه را می‌پذیرم</span>
//                 </label>
//               </div>

//               <button type="submit" className="register-btn" disabled={loading}>
//                 {loading ? (
//                   <span className="spinner-small"></span>
//                 ) : (
//                   <>
//                     <UserPlus size={20} />
//                     ثبت نام
//                   </>
//                 )}
//               </button>
//             </form>

//             <div className="register-footer">
//               <span>حساب کاربری دارید؟</span>
//               <Link to="/login" className="login-link">وارد شوید</Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }