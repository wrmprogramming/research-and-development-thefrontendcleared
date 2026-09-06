// src/modules/steering-committee/components/SteeringCommitteeForm.tsx

import React, { useState, useEffect } from 'react';
import { useSteeringCommittee } from '../hooks/useSteeringCommittee';
import type { SteeringCommittee } from '../types/steeringCommittee.types';
import { X, Eye, Download, Upload, FileText, Plus, Trash2 } from 'lucide-react';
import JalaliDatePicker from '../../../components/JalaliDatePicker';
import { ResearchSelect } from '../../research/components/ResearchSelect';
import { toast } from 'react-hot-toast';
import { jalaliToGregorian, formatJalaliDate } from '@/utils/dateUtils';

interface SteeringCommitteeFormProps {
  initialData?: SteeringCommittee;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SteeringCommitteeForm: React.FC<SteeringCommitteeFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { create, update, isCreating, isUpdating } = useSteeringCommittee();
  
  const [formData, setFormData] = useState({
    session_number: '',
    date: '',
    description: '',
    minutes_file: null as File | null,
    attachment: null as File | null,
    research_id: null as number | null,  // ✅ اختیاری
    approvements: [] as Array<{
      description: string;
      deadline_date: string | null;
      responsible: string;
    }>,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  // ✅ مدیریت فایل‌ها
  const [selectedMinutesFile, setSelectedMinutesFile] = useState<File | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<File | null>(null);
  const [existingMinutesFile, setExistingMinutesFile] = useState<string | null>(null);
  const [existingAttachment, setExistingAttachment] = useState<string | null>(null);
  const [removeMinutesFile, setRemoveMinutesFile] = useState(false);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  
  const [uploadProgress, setUploadProgress] = useState(0);

  const isEditing = !!initialData;

  // ========== Populate Data ==========
  useEffect(() => {
    if (initialData) {
      setFormData({
        session_number: initialData.session_number || '',
        date: initialData.date || '',
        description: initialData.description || '',
        minutes_file: null,
        attachment: null,
        research_id: typeof initialData.research === 'object' 
          ? (initialData.research as any)?.id 
          : initialData.research || null,
        approvements: initialData.approvements?.map(a => ({
          description: a.description || '',
          deadline_date: a.deadline_date || null,
          responsible: a.responsible || '',
        })) || [],
      });

      setExistingMinutesFile(initialData.minutes_file || null);
      setExistingAttachment(initialData.attachment || null);
      
      setSelectedMinutesFile(null);
      setSelectedAttachment(null);
      setRemoveMinutesFile(false);
      setRemoveAttachment(false);
      
      setSubmitAttempted(false);
      setErrors({});
      setTouched({});
    }
  }, [initialData]);

  // ========== Validation ==========
  const validateField = (field: string, value: any): string | null => {
    switch (field) {
      case 'session_number':
        if (!value?.trim()) return 'شماره جلسه الزامی است';
        return null;
      case 'date':
        if (!value) return 'تاریخ جلسه الزامی است';
        return null;
      case 'description':
        if (!value?.trim()) return 'توضیحات الزامی است';
        return null;
      default:
        return null;
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    const fieldsToValidate = ['session_number', 'date', 'description'];

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) {
        newErrors[field] = error;
        hasError = true;
      }
    });

    setErrors(newErrors);
    return !hasError;
  };

  // ========== Handlers ==========
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitAttempted || touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || '' }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof typeof formData]);
    setErrors((prev) => ({ ...prev, [field]: error || '' }));
  };

  // ✅ مدیریت فایل‌ها
  const handleFileChange = (type: 'minutes_file' | 'attachment', file: File | null) => {
    if (type === 'minutes_file') {
      setSelectedMinutesFile(file);
      if (file) {
        setRemoveMinutesFile(false);
      }
    } else {
      setSelectedAttachment(file);
      if (file) {
        setRemoveAttachment(false);
      }
    }
  };

  const handleFileRemove = (type: 'minutes_file' | 'attachment') => {
    if (type === 'minutes_file') {
      setSelectedMinutesFile(null);
      setRemoveMinutesFile(true);
      setExistingMinutesFile(null);
    } else {
      setSelectedAttachment(null);
      setRemoveAttachment(true);
      setExistingAttachment(null);
    }
  };

  // ========== Approvements ==========
  const addApprovement = () => {
    setFormData((prev) => ({
      ...prev,
      approvements: [...prev.approvements, { description: '', deadline_date: null, responsible: '' }]
    }));
  };

  const removeApprovement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      approvements: prev.approvements.filter((_, i) => i !== index)
    }));
  };

  const updateApprovement = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      approvements: prev.approvements.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // ========== Submit ==========
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

      // فیلتر کردن مصوبات خالی
      if (submitData.approvements) {
        submitData.approvements = submitData.approvements.filter(
          (a: any) => a.description?.trim() || a.responsible?.trim()
        );
      }

      // تبدیل تاریخ جلسه به میلادی
      submitData.date = jalaliToGregorian(formatJalaliDate(submitData.date));

      // ✅ مدیریت فایل‌ها
      if (selectedMinutesFile) {
        submitData.minutes_file = selectedMinutesFile;
      } else if (isEditing && removeMinutesFile) {
        submitData.minutes_file = null;
      } else if (isEditing && existingMinutesFile) {
        delete submitData.minutes_file;
      }

      if (selectedAttachment) {
        submitData.attachment = selectedAttachment;
      } else if (isEditing && removeAttachment) {
        submitData.attachment = null;
      } else if (isEditing && existingAttachment) {
        delete submitData.attachment;
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

  // ========== FileUpload Component ==========
  const FileUpload: React.FC<{
    value: File | null;
    existingFile: string | null;
    onFileChange: (file: File | null) => void;
    onRemove: () => void;
    accept?: string;
    label?: string;
    isRemove?: boolean;
  }> = ({ 
    value, 
    existingFile, 
    onFileChange, 
    onRemove, 
    accept = '*/*', 
    label = 'انتخاب فایل',
    isRemove = false,
  }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
      if (value) {
        const url = URL.createObjectURL(value);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      }
      setPreviewUrl(null);
    }, [value]);

    const getFileName = (url: string) => {
      if (!url) return 'فایل';
      try {
        const parts = url.split('/');
        return parts[parts.length - 1] || 'فایل';
      } catch {
        return 'فایل';
      }
    };

    const getFileIcon = (url: string) => {
      const ext = url.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
        return <Eye size={14} />;
      }
      return <FileText size={14} />;
    };

    return (
      <div className="file-upload-wrapper">
        <input
          type="file"
          id={`file-upload-${label}`}
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          accept={accept}
          style={{ display: 'none' }}
        />
        <label htmlFor={`file-upload-${label}`} className="file-upload-label">
          <Upload size={18} />
          <span>{label}</span>
        </label>

        {value && previewUrl && (
          <div className="file-info">
            {getFileIcon(value.name)}
            <span className="file-name">{value.name}</span>
            <span className="file-size">{(value.size / 1024).toFixed(1)} KB</span>
            <button type="button" className="file-remove" onClick={onRemove}>
              <X size={14} />
            </button>
          </div>
        )}

        {!value && existingFile && !isRemove && (
          <div className="file-info existing">
            {getFileIcon(existingFile)}
            <a href={existingFile} target="_blank" rel="noopener noreferrer" className="file-link" title="مشاهده فایل">
              <Eye size={14} />
            </a>
            <a href={existingFile} download className="file-link download" title="دانلود فایل">
              <Download size={14} />
            </a>
            <span className="file-name">{getFileName(existingFile)}</span>
            <button type="button" className="file-remove" onClick={onRemove}>
              <X size={14} />
            </button>
          </div>
        )}

        {!value && !existingFile && isRemove && (
          <div className="file-info removed">
            <span className="file-removed-text">فایل حذف شده است</span>
            <button type="button" className="file-undo" onClick={() => onFileChange(null)}>
              <span>↩️</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // ========== Render ==========
  return (
    <div className="steering-committee-form">
      <div className="form-header">
        <h3>{isEditing ? 'ویرایش کمیته راهبری' : 'افزودن کمیته راهبری جدید'}</h3>
        <button className="close-btn" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-body">
          {/* شماره جلسه و تاریخ */}
          <div className="form-row">
            <div className="form-group">
              <label>شماره جلسه <span className="required">*</span></label>
              <input
                type="text"
                placeholder="مثال: SC-1402-001"
                value={formData.session_number || ''}
                onChange={(e) => handleChange('session_number', e.target.value)}
                onBlur={() => handleBlur('session_number')}
                className={(touched.session_number || submitAttempted) && errors.session_number ? 'is-invalid' : ''}
              />
              {(touched.session_number || submitAttempted) && errors.session_number && (
                <span className="error-text">{errors.session_number}</span>
              )}
            </div>
            <div className="form-group" style={{ direction: 'rtl' }}>
              <label>تاریخ جلسه <span className="required">*</span></label>
              <JalaliDatePicker
                value={formData.date || null}
                onChange={(date) => handleChange('date', date)}
                placeholder="1402/01/01"
                label=""
                error={errors.date}
                disabled={isCreating || isUpdating}
                className="jalali-date-rtl"
              />
              {(touched.date || submitAttempted) && errors.date && (
                <span className="error-text">{errors.date}</span>
              )}
            </div>
          </div>

          {/* توضیحات */}
          <div className="form-group">
            <label>توضیحات <span className="required">*</span></label>
            <textarea
              rows={4}
              placeholder="توضیحات کامل جلسه را وارد کنید..."
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              className={(touched.description || submitAttempted) && errors.description ? 'is-invalid' : ''}
            />
            {(touched.description || submitAttempted) && errors.description && (
              <span className="error-text">{errors.description}</span>
            )}
          </div>

          {/* پژوهش مرتبط - اختیاری */}
          <div className="form-group">
            <label>پژوهش مرتبط</label>
            <ResearchSelect
              value={formData.research_id || null}
              onChange={(id) => handleChange('research_id', id || null)}
              placeholder="انتخاب پژوهش (اختیاری)..."
              label=""
              required={false}
              error={errors.research_id}
            />
            {errors.research_id && <span className="error-text">{errors.research_id}</span>}
          </div>

          {/* فایل‌ها */}
          <div className="form-row">
            <div className="form-group">
              <label>صورتجلسه</label>
              <FileUpload
                value={selectedMinutesFile}
                existingFile={existingMinutesFile}
                onFileChange={(file) => handleFileChange('minutes_file', file)}
                onRemove={() => handleFileRemove('minutes_file')}
                isRemove={removeMinutesFile}
                accept=".pdf,.doc,.docx"
                label="انتخاب فایل صورتجلسه"
              />
            </div>
            <div className="form-group">
              <label>فایل پیوست</label>
              <FileUpload
                value={selectedAttachment}
                existingFile={existingAttachment}
                onFileChange={(file) => handleFileChange('attachment', file)}
                onRemove={() => handleFileRemove('attachment')}
                isRemove={removeAttachment}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                label="انتخاب فایل پیوست"
              />
            </div>
          </div>

          {/* مصوبات */}
          <div className="approvements-section">
            <div className="section-header">
              <label>مصوبات</label>
              <button type="button" className="add-btn" onClick={addApprovement}>
                <Plus size={16} />
                افزودن مصوبه
              </button>
            </div>

            {formData.approvements.map((approvement, index) => (
              <div key={index} className="approvement-item">
                <div className="approvement-header">
                  <span className="approvement-number">مصوبه {index + 1}</span>
                  <button type="button" className="remove-btn" onClick={() => removeApprovement(index)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>متن مصوبه</label>
                    <input
                      type="text"
                      placeholder="متن مصوبه را وارد کنید..."
                      value={approvement.description || ''}
                      onChange={(e) => updateApprovement(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>مهلت</label>
                    <JalaliDatePicker
                      value={approvement.deadline_date || null}
                      onChange={(date) => updateApprovement(index, 'deadline_date', date)}
                      placeholder="1402/01/01"
                      label=""
                    />
                  </div>
                  <div className="form-group">
                    <label>مسئول پیگیری</label>
                    <input
                      type="text"
                      placeholder="نام مسئول پیگیری..."
                      value={approvement.responsible || ''}
                      onChange={(e) => updateApprovement(index, 'responsible', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {formData.approvements.length === 0 && (
              <div className="empty-approvements">
                <p>هیچ مصوبه‌ای ثبت نشده است</p>
                <button type="button" className="add-btn-primary" onClick={addApprovement}>
                  <Plus size={16} />
                  افزودن اولین مصوبه
                </button>
              </div>
            )}
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

      <style>{`
        .steering-committee-form {
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
          border-color: #059669;
          outline: none;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .form-group input.is-invalid,
        .form-group textarea.is-invalid {
          border-color: #dc2626;
        }

        .error-text {
          font-size: 12px;
          color: #dc2626;
          margin-top: 2px;
        }

        .jalali-date-rtl {
          direction: rtl !important;
        }

        .jalali-date-rtl input {
          direction: rtl !important;
          text-align: right !important;
        }

        .file-upload-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
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
          border-color: #059669;
          background: #d1fae5;
          color: #059669;
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
          background: #d1fae5;
          border-color: #a7f3d0;
        }

        .file-info.removed {
          background: #fee2e2;
          border-color: #fecaca;
        }

        .file-removed-text {
          font-size: 13px;
          color: #dc2626;
        }

        .file-undo {
          background: none;
          border: none;
          color: #059669;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
          transition: all 0.2s;
          font-size: 16px;
        }

        .file-undo:hover {
          background: #d1fae5;
        }

        .file-name {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a2e;
          flex: 1;
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
          color: #059669;
          background: transparent;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          text-decoration: none;
        }

        .file-link:hover {
          background: #d1fae5;
        }

        .file-link.download {
          color: #059669;
        }

        .file-link.download:hover {
          background: #a7f3d0;
        }

        .approvements-section {
          border-top: 1px solid #e9ecef;
          padding-top: 16px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .section-header label {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .add-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: #d1fae5;
          color: #059669;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-btn:hover {
          background: #a7f3d0;
        }

        .add-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #059669;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .add-btn-primary:hover {
          background: #047857;
        }

        .approvement-item {
          background: #f8fafc;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .approvement-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .approvement-number {
          font-size: 13px;
          font-weight: 600;
          color: #059669;
        }

        .remove-btn {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .remove-btn:hover {
          background: #fee2e2;
        }

        .empty-approvements {
          text-align: center;
          padding: 20px;
          color: #6b7280;
        }

        .empty-approvements p {
          margin: 0 0 8px 0;
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
          background: linear-gradient(90deg, #059669, #34d399);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          font-weight: 500;
          color: #059669;
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
          background: #059669;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #047857;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
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

        @media (max-width: 768px) {
          .steering-committee-form {
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

          .approvement-item {
            padding: 12px;
          }

          .approvement-item .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SteeringCommitteeForm;