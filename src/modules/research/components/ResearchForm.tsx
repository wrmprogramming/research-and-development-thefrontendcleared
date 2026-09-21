// src/modules/research/components/ResearchForm.tsx

// ============================================================
// 1. ایمپورت‌ها
// ============================================================
import React, { useState, useEffect } from 'react';
import { useResearch } from '../hooks/useResearch';
import { RESEARCH_STATUSES, type Research, type ResearchFormData, type ResearchAttachment } from '../types/research.types';
import { X, Eye, Download, Upload, FileText, User, Building2, GraduationCap, DollarSign } from 'lucide-react';
import { PersonSelect } from '../../person/components/PersonSelect';
import JalaliDatePicker from '../../../components/JalaliDatePicker';
import { CompanySelect } from '../../company/components/CompanySelect';
import { UniversitySelect } from '../../university/components/UniversitySelect';
import {  formatJalaliDate, jalaliToGregorian,getCurrentJalaliYear } from '../../../utils/dateUtils';

// ============================================================
// 2. ثابت‌های وضعیت
// ============================================================
const STATUS_OPTIONS = {
  DRAFT: { label: 'پیش‌نویس', color: '#6b7280' },
  IN_PROGRESS: { label: 'در حال اجرا', color: '#2563eb' },
  COMPLETED: { label: 'خاتمه یافته', color: '#059669' },
};

// ============================================================
// 3. تعریف پراپ‌ها
// ============================================================
interface ResearchFormProps {
  initialData?: Research;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ============================================================
// 4. کامپوننت اصلی
// ============================================================
export const ResearchForm: React.FC<ResearchFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { create, update, isCreating, isUpdating } = useResearch();

  const [formData, setFormData] = useState<ResearchFormData>({
    title: '',
    year: getCurrentJalaliYear(),//moment().jYear(),
    status: 'DRAFT',
    primary_researcher_id: null,
    affiliation_type: 'UNIVERSITY',
    researchers: '',
    budget: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [existingAttachments, setExistingAttachments] = useState<ResearchAttachment[]>([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<number[]>([]);

  const isEditing = !!initialData;

  // ==========================================================
  // 4.3. پر کردن داده‌ها در حالت ویرایش
  // ==========================================================
  useEffect(() => {
    if (initialData) {
      let primaryResearcherId = null;
      if (initialData.primary_researcher) {
        if (typeof initialData.primary_researcher === 'object') {
          primaryResearcherId = initialData.primary_researcher?.id;
        } else {
          primaryResearcherId = initialData.primary_researcher;
        }
      }

      setFormData({
        code: initialData.code || '',
        title: initialData.title || '',
        description: initialData.description || '',
        approve_date: initialData.approve_date || '',
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        // year: initialData.year || new Date().getFullYear(),
        year: initialData.year || getCurrentJalaliYear(),
        budget: initialData.budget || 0,
        status: initialData.status || 'DRAFT',
        primary_researcher_id: primaryResearcherId,
        researchers: initialData.researchers || '',
        affiliation_type: initialData.affiliation_type || 'UNIVERSITY',
        company_id: typeof initialData.company === 'object'
          ? initialData.company?.id
          : initialData.company || undefined,
        university_id: typeof initialData.university === 'object'
          ? initialData.university?.id
          : initialData.university || undefined,
        attachment_files: [],
      });
      
      setExistingAttachments(initialData.attachments || []);
      setDeletedAttachmentIds([]);
      setSelectedFiles([]);
      setSubmitAttempted(false);
      setErrors({});
      setTouched({});
    }
  }, [initialData]);

  // ==========================================================
  // 4.4. اعتبارسنجی
  // ==========================================================
  const validateField = (field: keyof ResearchFormData, value: any): string | null => {
    switch (field) {
      case 'title':
        if (!value?.trim()) return 'عنوان پژوهش الزامی است';
        return null;
      case 'primary_researcher_id':
        if (!value || value === 0 || value === null || value === undefined) {
          return 'انتخاب پژوهشگر اصلی الزامی است';
        }
        return null;
      case 'budget':
        if (value !== undefined && value !== null && value > 999999999999999) {
          return 'مبلغ وارد شده بیش از حد مجاز است (حداکثر 15 رقم)';
        }
        return null;
      default:
        return null;
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    const fieldsToValidate: (keyof ResearchFormData)[] = ['title', 'primary_researcher_id'];

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasError = true;
      }
    });

    if (formData.affiliation_type === 'UNIVERSITY' && !formData.university_id) {
      newErrors.university_id = 'انتخاب دانشگاه الزامی است';
      hasError = true;
    } else if (formData.affiliation_type === 'COMPANY' && !formData.company_id) {
      newErrors.company_id = 'انتخاب شرکت الزامی است';
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  // ==========================================================
  // 4.5. هندلرهای تغییر فیلدها
  // ==========================================================
  const handleChange = (field: keyof ResearchFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (submitAttempted || touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || '' }));
    }
  };

  const handleBlur = (field: keyof ResearchFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error || '' }));
  };

  // ==========================================================
  // 4.6. مدیریت فایل‌های پیوست
  // ==========================================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setFormData(prev => ({ 
        ...prev, 
        attachment_files: [...(prev.attachment_files || []), ...newFiles] 
      }));
    }
    e.target.value = '';
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      attachment_files: prev.attachment_files?.filter((_, i) => i !== index) || []
    }));
  };

  const handleExistingAttachmentRemove = (id: number) => {
    setDeletedAttachmentIds(prev => [...prev, id]);
    setExistingAttachments(prev => prev.filter(att => att.id !== id));
  };

  // ==========================================================
  // 4.7. ارسال فرم - نسخه ساده و درست
  // ==========================================================
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
      submitData.attachment_files = selectedFiles;
      submitData.deleted_attachment_ids = deletedAttachmentIds;

      if (submitData.primary_researcher_id === 0) {
        submitData.primary_researcher_id = null;
      }

      // ✅ تبدیل تاریخ‌ها
      submitData.approve_date = jalaliToGregorian(formatJalaliDate(submitData.approve_date));
      submitData.start_date = jalaliToGregorian(formatJalaliDate(submitData.start_date));
      submitData.end_date = jalaliToGregorian(formatJalaliDate(submitData.end_date));
      // submitData.approve_date = convertDate(submitData.approve_date);
      // submitData.start_date = convertDate(submitData.start_date);
      // submitData.end_date = convertDate(submitData.end_date);
      console.log('📤 Submit data (before API):', {
              approve_date: submitData.approve_date,
              start_date: submitData.start_date,
              end_date: submitData.end_date,
            });

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
      console.error(' Submit error:', error);
      console.error(' Error response:', error.response);
      console.error(' Error data:', error.response?.data);
      
      if (error.response?.data) {
        const serverErrors = error.response.data;
        if (typeof serverErrors === 'object') {
          Object.keys(serverErrors).forEach((field) => {
            const errorMessage = Array.isArray(serverErrors[field])
              ? serverErrors[field][0]
              : serverErrors[field];
            
            const fieldMapping: Record<string, string> = {
              'primary_researcher': 'primary_researcher_id',
              'company': 'company_id',
              'university': 'university_id',
            };
            const formField = fieldMapping[field] || field;
            setErrors((prev) => ({ ...prev, [formField]: errorMessage }));
            setTouched((prev) => ({ ...prev, [formField]: true }));
          });
        }
      }
    }
  };

  // ==========================================================
  // 4.8. رندر فرم
  // ==========================================================
  return (
    <div className="research-form">
      <div className="form-header">
        <h3>{isEditing ? 'ویرایش پژوهش' : 'افزودن پژوهش جدید'}</h3>
        <button className="close-btn" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-body">
          {/* ==========================================================
              4.8.1. کد و عنوان
              ========================================================== */}
          <div className="form-row">
            <div className="form-group">
              <label>کد پژوهش</label>
              <input
                type="text"
                placeholder="مثال: RES-1402-001"
                value={formData.code || ''}
                onChange={(e) => handleChange('code', e.target.value)}
                onBlur={() => handleBlur('code')}
              />
            </div>
            <div className="form-group">
              <label>عنوان پژوهش <span className="required">*</span></label>
              <input
                type="text"
                placeholder="عنوان کامل پژوهش را وارد کنید..."
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                className={(touched.title || submitAttempted) && errors.title ? 'error' : ''}
              />
              {(touched.title || submitAttempted) && errors.title && (
                <span className="error-text">{errors.title}</span>
              )}
            </div>
          </div>

          {/* ==========================================================
              4.8.2. توضیحات
              ========================================================== */}
          <div className="form-group">
            <label>توضیحات</label>
            <textarea
              rows={3}
              placeholder="توضیحات تکمیلی درباره پژوهش..."
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
            />
          </div>

          {/* ==========================================================
              4.8.3. تاریخ‌ها (شمسی)
              ========================================================== */}
          <div className="form-row">
            <div className="form-group">
              <label>تاریخ تصویب</label>
              <JalaliDatePicker
                value={formData.approve_date || null}
                onChange={(date) => handleChange('approve_date', date)}
                placeholder="1402/01/01"
                label=""
                error={errors.approve_date}
                disabled={isCreating || isUpdating}
              />
              <small className="hint">اختیاری</small>
            </div>
            <div className="form-group">
              <label>تاریخ شروع</label>
              <JalaliDatePicker
                value={formData.start_date || null}
                onChange={(date) => handleChange('start_date', date)}
                placeholder="1402/01/01"
                label=""
                error=""
                disabled={isCreating || isUpdating}
              />
            </div>
            <div className="form-group">
              <label>تاریخ پایان</label>
              <JalaliDatePicker
                value={formData.end_date || null}
                onChange={(date) => handleChange('end_date', date)}
                placeholder="1402/01/01"
                label=""
                error=""
                disabled={isCreating || isUpdating}
              />
            </div>
          </div>

          {/* ==========================================================
              4.8.4. مبلغ، سال و وضعیت
              ========================================================== */}
          <div className="form-row">
            <div className="form-group">
              <label>مبلغ (ریال)</label>
              <div className="input-with-icon">
                <DollarSign size={18} className="input-icon" />
                <input
                  type="number"
                  placeholder="مبلغ را به ریال وارد کنید..."
                  value={formData.budget || ''}
                  onChange={(e) => handleChange('budget', Number(e.target.value))}
                  onBlur={() => handleBlur('budget')}
                  className={(touched.budget || submitAttempted) && errors.budget ? 'error' : ''}
                  min="0"
                />
              </div>
              <small className="hint">اختیاری</small>
              {(touched.budget || submitAttempted) && errors.budget && (
                <span className="error-text">{errors.budget}</span>
              )}
            </div>
            <div className="form-group">
              <label>سال</label>
              <input
                type="number"
                placeholder="مثال: 1405"
                value={formData.year || ''}
                onChange={(e) => handleChange('year', Number(e.target.value))}
                onBlur={() => handleBlur('year')}
                min="1300"
                max="1500"
              />
            </div>
            <div className="form-group">
              <label>وضعیت <span className="required">*</span></label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                onBlur={() => handleBlur('status')}
              >
                {Object.entries(STATUS_OPTIONS).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ==========================================================
              4.8.5. پژوهشگر و همکاران
              ========================================================== */}
          <div className="form-row">
            <div className="form-group">
              <PersonSelect
                value={formData.primary_researcher_id}
                onChange={(id) => {
                  console.log('📝 ResearchForm - onChange called with id:', id);
                  handleChange('primary_researcher_id', id);
                }}
                placeholder="انتخاب پژوهشگر اصلی..."
                label="پژوهشگر اصلی"
                required={true}
                error={errors.primary_researcher_id}
              />
              {errors.primary_researcher_id && (
                <span className="error-text">{errors.primary_researcher_id}</span>
              )}
            </div>
            <div className="form-group">
              <label>همکاران</label>
              <input
                type="text"
                placeholder="اسامی همکاران را با کاما جدا کنید..."
                value={formData.researchers || ''}
                onChange={(e) => handleChange('researchers', e.target.value)}
                onBlur={() => handleBlur('researchers')}
              />
              <small className="hint">مثال: علی محمدی, سارا حسینی, رضا کریمی</small>
            </div>
          </div>

          {/* ==========================================================
              4.8.6. انتخاب نوع همکار (دانشگاه / شرکت)
              ========================================================== */}
          <div className="form-row">
            <div className="form-group">
              <label>نوع همکار <span className="required">*</span></label>
              <select
                value={formData.affiliation_type}
                onChange={(e) => {
                  const value = e.target.value as 'UNIVERSITY' | 'COMPANY';
                  setFormData(prev => ({ 
                    ...prev, 
                    affiliation_type: value,
                    university_id: null,
                    company_id: null
                  }));
                  setErrors(prev => ({
                    ...prev,
                    university_id: '',
                    company_id: ''
                  }));
                }}
              >
                <option value="UNIVERSITY">دانشگاه</option>
                <option value="COMPANY">شرکت</option>
              </select>
            </div>
            <div className="form-group">
              {formData.affiliation_type === 'UNIVERSITY' ? (
                <>
                  <label>دانشگاه <span className="required">*</span></label>
                  <UniversitySelect
                    value={formData.university_id}
                    onChange={(id) => {
                      handleChange('university_id', id);
                      if (id) {
                        setErrors(prev => ({ ...prev, university_id: '' }));
                      }
                    }}
                    placeholder="انتخاب دانشگاه..."
                    error={errors.university_id}
                  />
                  {errors.university_id && <span className="error-text">{errors.university_id}</span>}
                </>
              ) : (
                <>
                  <label>شرکت <span className="required">*</span></label>
                  <CompanySelect
                    value={formData.company_id}
                    onChange={(id) => {
                      handleChange('company_id', id);
                      if (id) {
                        setErrors(prev => ({ ...prev, company_id: '' }));
                      }
                    }}
                    placeholder="انتخاب شرکت..."
                    error={errors.company_id}
                  />
                  {errors.company_id && <span className="error-text">{errors.company_id}</span>}
                </>
              )}
            </div>
          </div>

          {/* ==========================================================
              4.8.7. فایل‌های پیوست (چندگانه)
              ========================================================== */}
          <div className="form-group">
            <label>فایل‌های پیوست</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="attachments"
                onChange={handleFileChange}
                multiple
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
              />
              <label htmlFor="attachments" className="file-upload-label">
                <Upload size={18} />
                <span>انتخاب فایل‌ها</span>
                <span className="file-count">(چندگانه)</span>
              </label>

              {selectedFiles.length > 0 && (
                <div className="file-list">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="file-info">
                      <FileText size={14} />
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                      <button type="button" className="file-remove" onClick={() => handleFileRemove(index)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {existingAttachments.length > 0 && (
                <div className="file-list existing">
                  <div className="file-list-title">فایل‌های موجود:</div>
                  {existingAttachments.map((att) => (
                    <div key={att.id} className="file-info existing">
                      <a href={att.file} target="_blank" rel="noopener noreferrer" className="file-link">
                        <Eye size={14} />
                      </a>
                      <a href={att.file} download className="file-link download">
                        <Download size={14} />
                      </a>
                      <span className="file-name">{att.filename || att.file.split('/').pop()}</span>
                      <span className="file-size">{att.size ? (att.size / 1024).toFixed(1) : '0'} KB</span>
                      <button 
                        type="button" 
                        className="file-remove" 
                        onClick={() => handleExistingAttachmentRemove(att.id)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <small className="hint">می‌توانید چندین فایل را همزمان انتخاب کنید</small>
          </div>

          {/* ==========================================================
              4.8.8. نوار پیشرفت آپلود
              ========================================================== */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-wrapper">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          )}
        </div>

        {/* ==========================================================
            4.8.9. دکمه‌های پایین فرم
            ========================================================== */}
        <div className="form-footer">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            انصراف
          </button>
          <button type="submit" className="btn-primary" disabled={isCreating || isUpdating}>
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

      {/* ==========================================================
          4.9. استایل‌های CSS
          ========================================================== */}
      <style>{`
        .research-form {
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

        .input-with-icon input {
          padding-right: 36px;
        }

        .hint {
          font-size: 11px;
          color: #6b7280;
          margin-top: 2px;
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

        .file-count {
          font-size: 11px;
          color: #6b7280;
          background: #e5e7eb;
          padding: 0 8px;
          border-radius: 10px;
        }

        .file-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 4px;
        }

        .file-list.existing {
          border-top: 1px solid #e9ecef;
          padding-top: 8px;
        }

        .file-list-title {
          font-size: 12px;
          font-weight: 500;
          color: #374151;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: #f8fafc;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          flex-wrap: wrap;
        }

        .file-name {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a2e;
          flex: 1;
          min-width: 60px;
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

        .file-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          color: #4f46e5;
          background: transparent;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          text-decoration: none;
        }

        .file-link:hover {
          background: #dbeafe;
        }

        .file-link.download {
          color: #059669;
        }

        .file-link.download:hover {
          background: #d1fae5;
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
          .research-form {
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

export default ResearchForm;