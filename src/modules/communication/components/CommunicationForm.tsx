// src/modules/communication/components/CommunicationForm.tsx

import React, { useState, useEffect } from 'react';
import { useCommunication } from '../hooks/useCommunication';
import { type Communication, type CommunicationFormData } from '../types/communication.types';
import { X, Mail, User, Calendar, FileText, Upload, BookOpen } from 'lucide-react';
import JalaliDatePicker from '../../../components/JalaliDatePicker';
import { ResearchSelect } from '../../research/components/ResearchSelect';
import toast from 'react-hot-toast';

interface CommunicationFormProps {
  initialData?: Communication;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CommunicationForm: React.FC<CommunicationFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { create, update, isCreating, isUpdating } = useCommunication();

  const [formData, setFormData] = useState<CommunicationFormData>({
    title: '',
    description: '',
    sender: '',
    receiver: '',
    date: '',
    send_date: null,
    receive_date: null,
    attachment: null,
    letter_file: null,
    research_id: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [letterFile, setLetterFile] = useState<File | null>(null);
  const [existingAttachment, setExistingAttachment] = useState<string | null>(null);
  const [existingLetterFile, setExistingLetterFile] = useState<string | null>(null);

  const isEditing = !!initialData;

  useEffect(() => {
    console.log('🔍 CommunicationForm - useEffect - initialData:', initialData);
    
    if (initialData) {
      // ✅ استخراج صحیح research_id
      let researchId = null;
      
      console.log('🔍 initialData.research:', initialData.research);
      console.log('🔍 typeof initialData.research:', typeof initialData.research);
      
      // اگر research وجود دارد
      if (initialData.research !== null && initialData.research !== undefined) {
        // اگر آبجکت است، id را بگیر
        if (typeof initialData.research === 'object') {
          researchId = (initialData.research as any).id;
          console.log('🔍 research is object, id:', researchId);
        } 
        // اگر عدد است، همان را استفاده کن
        else if (typeof initialData.research === 'number') {
          researchId = initialData.research;
          console.log('🔍 research is number:', researchId);
        }
        // اگر string است (برای مواقعی که به صورت رشته می‌آید)
        else if (typeof initialData.research === 'string') {
          researchId = parseInt(initialData.research);
          console.log('🔍 research is string, parsed to:', researchId);
        }
      } else {
        console.log('🔍 research is null or undefined');
      }

      console.log('🔍 final researchId:', researchId);

      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        sender: initialData.sender || '',
        receiver: initialData.receiver || '',
        date: initialData.date || '',
        send_date: initialData.send_date || null,
        receive_date: initialData.receive_date || null,
        attachment: initialData.attachment || null,
        letter_file: initialData.letter_file || null,
        research_id: researchId,
      });
      setExistingAttachment(initialData.attachment || null);
      setExistingLetterFile(initialData.letter_file || null);
      setSubmitAttempted(false);
      setErrors({});
      setTouched({});
    }
  }, [initialData]);

  //  دیباگ برای مشاهده تغییرات formData.research_id
  useEffect(() => {
    console.log('🔍 formData.research_id changed to:', formData.research_id);
  }, [formData.research_id]);

  //  اعتبارسنجی یک فیلد خاص (با research_id)
  const validateField = (field: keyof CommunicationFormData, value: any): string | null => {
    switch (field) {
      case 'title':
        if (!value?.trim()) return 'عنوان مکاتبه الزامی است';
        return null;
      case 'sender':
        if (!value?.trim()) return 'نام ارسال‌کننده الزامی است';
        return null;
      case 'receiver':
        if (!value?.trim()) return 'نام دریافت‌کننده الزامی است';
        return null;
      case 'date':
        if (!value) return 'تاریخ مکاتبه الزامی است';
        return null;
      case 'research_id':
        if (!value || value <= 0) return 'انتخاب پژوهش الزامی است';
        return null;
      default:
        return null;
    }
  };

  //  اعتبارسنجی کل فرم (با research_id)
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    const fieldsToValidate: (keyof CommunicationFormData)[] = [
      'title', 'sender', 'receiver', 'date', 'research_id'
    ];

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

  const handleChange = (field: keyof CommunicationFormData, value: any) => {
    console.log(`🔍 handleChange - ${field}:`, value);
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitAttempted || touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || '' }));
    }
  };

  const handleBlur = (field: keyof CommunicationFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error || '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'attachment' | 'letter') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'attachment') {
        setAttachmentFile(file);
        setFormData(prev => ({ ...prev, attachment: file }));
        setExistingAttachment(null);
      } else {
        setLetterFile(file);
        setFormData(prev => ({ ...prev, letter_file: file }));
        setExistingLetterFile(null);
      }
    }
    e.target.value = '';
  };

  const removeFile = (type: 'attachment' | 'letter') => {
    if (type === 'attachment') {
      setAttachmentFile(null);
      setFormData(prev => ({ ...prev, attachment: null }));
      setExistingAttachment(null);
    } else {
      setLetterFile(null);
      setFormData(prev => ({ ...prev, letter_file: null }));
      setExistingLetterFile(null);
    }
  };

  const getFileName = (url: string | null) => {
    if (!url) return '';
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || '';
    } catch {
      return '';
    }
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
      const submitData = { ...formData };
      submitData.attachment = attachmentFile || existingAttachment || null;
      submitData.letter_file = letterFile || existingLetterFile || null;

      // ✅ اطمینان از اینکه research_id مقدار دارد
      if (!submitData.research_id) {
        setErrors(prev => ({ ...prev, research_id: 'انتخاب پژوهش الزامی است' }));
        setTouched(prev => ({ ...prev, research_id: true }));
        return;
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
    <div className="communication-form">
      <div className="form-header">
        <h3>{isEditing ? 'ویرایش مکاتبه' : 'افزودن مکاتبه جدید'}</h3>
        <button className="close-btn" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-body">
          {/* عنوان */}
          <div className="form-group">
            <label>عنوان <span className="required">*</span></label>
            <input
              type="text"
              placeholder="عنوان مکاتبه را وارد کنید..."
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              onBlur={() => handleBlur('title')}
              className={(touched.title || submitAttempted) && errors.title ? 'is-invalid' : ''}
            />
            {(touched.title || submitAttempted) && errors.title && (
              <span className="error-text">{errors.title}</span>
            )}
          </div>

          {/* ارسال‌کننده و دریافت‌کننده */}
          <div className="form-row">
            <div className="form-group">
              <label>ارسال‌کننده <span className="required">*</span></label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="نام ارسال‌کننده..."
                  value={formData.sender || ''}
                  onChange={(e) => handleChange('sender', e.target.value)}
                  onBlur={() => handleBlur('sender')}
                  className={(touched.sender || submitAttempted) && errors.sender ? 'is-invalid' : ''}
                />
              </div>
              {(touched.sender || submitAttempted) && errors.sender && (
                <span className="error-text">{errors.sender}</span>
              )}
            </div>
            <div className="form-group">
              <label>دریافت‌کننده <span className="required">*</span></label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="نام دریافت‌کننده..."
                  value={formData.receiver || ''}
                  onChange={(e) => handleChange('receiver', e.target.value)}
                  onBlur={() => handleBlur('receiver')}
                  className={(touched.receiver || submitAttempted) && errors.receiver ? 'is-invalid' : ''}
                />
              </div>
              {(touched.receiver || submitAttempted) && errors.receiver && (
                <span className="error-text">{errors.receiver}</span>
              )}
            </div>
          </div>

          {/* تاریخ‌ها */}
          <div className="form-row">
            <div className="form-group">
              <label>تاریخ مکاتبه <span className="required">*</span></label>
              <JalaliDatePicker
                value={formData.date || null}
                onChange={(date) => handleChange('date', date)}
                placeholder="1402/01/01"
                label=""
                error={errors.date}
                disabled={isCreating || isUpdating}
              />
              {(touched.date || submitAttempted) && errors.date && (
                <span className="error-text">{errors.date}</span>
              )}
            </div>
            <div className="form-group">
              <label>تاریخ ارسال</label>
              <JalaliDatePicker
                value={formData.send_date || null}
                onChange={(date) => handleChange('send_date', date)}
                placeholder="1402/01/01"
                label=""
                error=""
                disabled={isCreating || isUpdating}
              />
            </div>
            <div className="form-group">
              <label>تاریخ دریافت</label>
              <JalaliDatePicker
                value={formData.receive_date || null}
                onChange={(date) => handleChange('receive_date', date)}
                placeholder="1402/01/01"
                label=""
                error=""
                disabled={isCreating || isUpdating}
              />
            </div>
          </div>

          {/*  پژوهش - اجباری */}
          <div className="form-row">
            <div className="form-group">
              <label>پژوهش <span className="required">*</span></label>
              <ResearchSelect
                value={formData.research_id}
                onChange={(id) => {
                    console.log('📝 ResearchSelect onChange - id:', id);
                    handleChange('research_id', id);
                    if (id) {
                    setErrors(prev => ({ ...prev, research_id: '' }));
                    }
                }}
                placeholder="انتخاب پژوهش..."
                label="پژوهش"
                required={true}
                error={errors.research_id}
                />
            
              {(touched.research_id || submitAttempted) && errors.research_id && (
                <span className="error-text">{errors.research_id}</span>
              )}
            </div>
            <div className="form-group" style={{ visibility: 'hidden' }}>
              {/* اینجا خالی است تا فرم دو ستونه بماند */}
            </div>
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

          {/* فایل‌های پیوست */}
          <div className="form-row">
            <div className="form-group">
              <label>فایل پیوست</label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="attachment"
                  onChange={(e) => handleFileChange(e, 'attachment')}
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                />
                <label htmlFor="attachment" className="file-upload-label">
                  <Upload size={18} />
                  <span>انتخاب فایل پیوست</span>
                </label>
                {(attachmentFile || existingAttachment) && (
                  <div className="file-info">
                    <FileText size={14} />
                    <span className="file-name">
                      {attachmentFile ? attachmentFile.name : getFileName(existingAttachment)}
                    </span>
                    <button type="button" className="file-remove" onClick={() => removeFile('attachment')}>
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>فایل نامه</label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="letter_file"
                  onChange={(e) => handleFileChange(e, 'letter')}
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                />
                <label htmlFor="letter_file" className="file-upload-label">
                  <Upload size={18} />
                  <span>انتخاب فایل نامه</span>
                </label>
                {(letterFile || existingLetterFile) && (
                  <div className="file-info">
                    <FileText size={14} />
                    <span className="file-name">
                      {letterFile ? letterFile.name : getFileName(existingLetterFile)}
                    </span>
                    <button type="button" className="file-remove" onClick={() => removeFile('letter')}>
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-wrapper">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          )}
        </div>

        <div className="form-footer">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            انصراف
          </button>
          <button type="submit" className="btn-primary" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? (
              <><span className="spinner-border spinner-border-sm" /> در حال پردازش...</>
            ) : (
              isEditing ? 'ویرایش' : 'افزودن'
            )}
          </button>
        </div>
      </form>

      <style>{`
        .communication-form {
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
          padding: 8px 16px;
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
          padding: 6px 12px;
          background: #f8fafc;
          border: 1px solid #e9ecef;
          border-radius: 6px;
        }

        .file-name {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a2e;
          flex: 1;
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
          .communication-form {
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

export default CommunicationForm;

