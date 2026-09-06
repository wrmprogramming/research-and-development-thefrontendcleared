// src/modules/contract/components/ContractForm.tsx

import React, { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';
import { ACTIVITY_STATUSES, CONTRACT_STATUSES, type Contract, type ContractFormData, type ContractAttachment } from '../types/contract.types';
import { X, Eye, Download, Upload, FileText, Building2, GraduationCap, DollarSign, Calendar, Plus, Trash2 } from 'lucide-react';
import JalaliDatePicker from '../../../components/JalaliDatePicker';
import { CompanySelect } from '../../company/components/CompanySelect';
import { UniversitySelect } from '../../university/components/UniversitySelect';
import { ResearchSelect } from '../../research/components/ResearchSelect';
import toast from 'react-hot-toast';
import { formatJalaliDate, jalaliToGregorian } from '@/utils/dateUtils';

interface ContractFormProps {
  initialData?: Contract;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ContractForm: React.FC<ContractFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { create, update, isCreating, isUpdating } = useContract();
  
  const [formData, setFormData] = useState<ContractFormData>({
    subject: '',
    date: '',
    start_date: '',
    end_date: '',
    total_amount: 0,
    // ❌ حذف paid_amount
    status: 'DRAFT',
    affiliation_type: 'UNIVERSITY',
    company_id: null,
    university_id: null,
    activities: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [existingAttachments, setExistingAttachments] = useState<ContractAttachment[]>([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<number[]>([]);

  const isEditing = !!initialData;

  // ========== پر کردن داده‌ها در حالت ویرایش ==========
  useEffect(() => {
  if (initialData) {
    setFormData({
      contract_number: initialData.contract_number || '',
      subject: initialData.subject || '',
      date: initialData.date || '',
      start_date: initialData.start_date || '',
      end_date: initialData.end_date || '',
      total_amount: initialData.total_amount || 0,
      // ❌ حذف paid_amount
      // paid_amount: initialData.paid_amount || 0,
      commitments: initialData.commitments || '',
      services_description: initialData.services_description || '',
      documents: initialData.documents || '',
      contractor_address: initialData.contractor_address || '',
      status: initialData.status || 'DRAFT',
      version: initialData.version || 1,
      is_archived: initialData.is_archived || false,
      affiliation_type: initialData.affiliation_type || 'UNIVERSITY',
      company_id: typeof initialData.company === 'object' ? initialData.company?.id : initialData.company || null,
      university_id: typeof initialData.university === 'object' ? initialData.university?.id : initialData.university || null,
      research_id: typeof initialData.research === 'object' ? initialData.research?.id : initialData.research || null,
      activities: initialData.activities?.map(activity => ({
        ...activity,
        start_date: activity.start_date ? activity.start_date : null,
        end_date: activity.end_date ? activity.end_date : null,
      })) || [],
    });
    setExistingAttachments(initialData.attachments || []);
    setDeletedAttachmentIds([]);
    setSelectedFiles([]);
    setSubmitAttempted(false);
    setErrors({});
    setTouched({});
  }
}, [initialData]);
const validateField = (field: keyof ContractFormData, value: any): string | null => {
  switch (field) {
    case 'subject':
      if (!value?.trim()) return 'موضوع قرارداد الزامی است';
      return null;
    case 'date':
      if (!value) return 'تاریخ قرارداد الزامی است';
      return null;
    case 'start_date':
      if (!value) return 'تاریخ شروع الزامی است';
      return null;
    case 'end_date':
      if (!value) return 'تاریخ پایان الزامی است';
      return null;
    case 'total_amount':
      if (!value || value <= 0) return 'مبلغ قرارداد باید بیشتر از صفر باشد';
      return null;
    default:
      return null;
  }
};
  

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    const fieldsToValidate: (keyof ContractFormData)[] = [
      'subject', 'date', 'start_date', 'end_date', 'total_amount'
    ];

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

  // ========== Handlers ==========
  const handleChange = (field: keyof ContractFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitAttempted || touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || '' }));
    }
  };

  const handleBlur = (field: keyof ContractFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error || '' }));
  };

  // ========== Activity Handlers ==========
  const addActivity = () => {
    setFormData((prev) => ({
      ...prev,
      activities: [
        ...(prev.activities || []),
        { title: '', description: '', start_date: null, end_date: null, progress: 0, status: 'PLANNED' }
      ]
    }));
  };

  const removeActivity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities?.filter((_, i) => i !== index) || []
    }));
  };

  const updateActivity = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities?.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  // ========== File Handlers ==========
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
    // ✅ اضافه کردن به لیست حذف‌شده‌ها
    setDeletedAttachmentIds(prev => [...prev, id]);
    // حذف از لیست نمایشی
    setExistingAttachments(prev => prev.filter(att => att.id !== id));
  };

  
  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitAttempted(true);

  const invalidActivities = formData.activities?.some(a => !a.title?.trim());
  if (invalidActivities) {
    toast.error('لطفاً عنوان همه فعالیت‌ها را وارد کنید');
    return;
  }

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
    submitData.deleted_attachment_ids = deletedAttachmentIds;  // ✅ این خط باید باشد

    if (submitData.company_id === 0) submitData.company_id = null;
    if (submitData.university_id === 0) submitData.university_id = null;
    if (!submitData.research_id || submitData.research_id <= 0) submitData.research_id = null;

    submitData.date = jalaliToGregorian(formatJalaliDate(submitData.date));
    submitData.start_date = jalaliToGregorian(formatJalaliDate(submitData.start_date));    
    submitData.end_date = jalaliToGregorian(formatJalaliDate(submitData.end_date));

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
          const fieldMapping: Record<string, string> = {
            'company': 'company_id',
            'university': 'university_id',
            'research': 'research_id',
          };
          const formField = fieldMapping[field] || field;
          setErrors((prev) => ({ ...prev, [formField]: errorMessage }));
          setTouched((prev) => ({ ...prev, [formField]: true }));
        });
      }
    }
  }
};

  const getFileName = (url: string) => {
    if (!url) return 'فایل';
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || 'فایل';
    } catch {
      return 'فایل';
    }
  };

  return (
    <div className="contract-form">
      <div className="form-header">
        <h3>{isEditing ? 'ویرایش قرارداد' : 'افزودن قرارداد جدید'}</h3>
        <button className="close-btn" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-body">
          {/* شماره قرارداد و موضوع */}
          <div className="form-row">
            <div className="form-group">
              <label>شماره قرارداد</label>
              <input
                type="text"
                placeholder="مثال: CON-1402-001"
                value={formData.contract_number || ''}
                onChange={(e) => handleChange('contract_number', e.target.value)}
                onBlur={() => handleBlur('contract_number')}
              />
            </div>
            <div className="form-group">
              <label>موضوع قرارداد <span className="required">*</span></label>
              <input
                type="text"
                placeholder="موضوع کامل قرارداد را وارد کنید..."
                value={formData.subject || ''}
                onChange={(e) => handleChange('subject', e.target.value)}
                onBlur={() => handleBlur('subject')}
                className={(touched.subject || submitAttempted) && errors.subject ? 'is-invalid' : ''}
              />
              {(touched.subject || submitAttempted) && errors.subject && (
                <span className="error-text">{errors.subject}</span>
              )}
            </div>
          </div>

          {/* تاریخ‌ها */}
          <div className="form-row">
            <div className="form-group">
              <label>تاریخ قرارداد <span className="required">*</span></label>
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
              <label>تاریخ شروع <span className="required">*</span></label>
              <JalaliDatePicker
                value={formData.start_date || null}
                onChange={(date) => handleChange('start_date', date)}
                placeholder="1402/01/01"
                label=""
                error={errors.start_date}
                disabled={isCreating || isUpdating}
              />
              {(touched.start_date || submitAttempted) && errors.start_date && (
                <span className="error-text">{errors.start_date}</span>
              )}
            </div>
            <div className="form-group">
              <label>تاریخ پایان <span className="required">*</span></label>
              <JalaliDatePicker
                value={formData.end_date || null}
                onChange={(date) => handleChange('end_date', date)}
                placeholder="1402/01/01"
                label=""
                error={errors.end_date}
                disabled={isCreating || isUpdating}
              />
              {(touched.end_date || submitAttempted) && errors.end_date && (
                <span className="error-text">{errors.end_date}</span>
              )}
            </div>
          </div>

          {/* مبالغ و نسخه */}
          <div className="form-row">
            <div className="form-group">
              <label>مبلغ قرارداد (ریال) <span className="required">*</span></label>
              <div className="input-with-icon">
                <DollarSign size={18} className="input-icon" />
                <input
                  type="number"
                  placeholder="مبلغ را به ریال وارد کنید..."
                  value={formData.total_amount || ''}
                  onChange={(e) => handleChange('total_amount', Number(e.target.value))}
                  onBlur={() => handleBlur('total_amount')}
                  className={(touched.total_amount || submitAttempted) && errors.total_amount ? 'is-invalid' : ''}
                  min="0"
                />
              </div>
              {(touched.total_amount || submitAttempted) && errors.total_amount && (
                <span className="error-text">{errors.total_amount}</span>
              )}
            </div>
          
            <div className="form-group">
              <label>نسخه</label>
              <input
                type="number"
                placeholder="1"
                value={formData.version || 1}
                onChange={(e) => handleChange('version', Number(e.target.value))}
                onBlur={() => handleBlur('version')}
                min="1"
              />
            </div>
          </div>

          {/* وضعیت و بایگانی */}
          <div className="form-row">
            <div className="form-group">
              <label>وضعیت <span className="required">*</span></label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                onBlur={() => handleBlur('status')}
              >
                {Object.entries(CONTRACT_STATUSES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', paddingTop: '24px' }}>
              <label style={{ margin: 0 }}>بایگانی شده</label>
              <input
                type="checkbox"
                checked={formData.is_archived || false}
                onChange={(e) => handleChange('is_archived', e.target.checked)}
              />
            </div>
          </div>

          {/* نوع همکار */}
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
                    company_id: null,
                    university_id: null
                  }));
                  setErrors(prev => ({ ...prev, university_id: '', company_id: '' }));
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
                      if (id) setErrors(prev => ({ ...prev, university_id: '' }));
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
                      if (id) setErrors(prev => ({ ...prev, company_id: '' }));
                    }}
                    placeholder="انتخاب شرکت..."
                    error={errors.company_id}
                  />
                  {errors.company_id && <span className="error-text">{errors.company_id}</span>}
                </>
              )}
            </div>
          </div>

          {/* پژوهش مرتبط */}
          <div className="form-row">
            <div className="form-group">
              <label>پژوهش مرتبط</label>
              <ResearchSelect
                value={formData.research_id || null}
                onChange={(id) => handleChange('research_id', id)}
                placeholder="انتخاب پژوهش مرتبط..."
                label=""
              />
            </div>
          </div>

          {/* تعهدات - شرح خدمات - اسناد و مدارک */}
          <div className="form-group">
            <label>تعهدات طرفین</label>
            <textarea
              rows={2}
              placeholder="تعهدات طرفین قرارداد..."
              value={formData.commitments || ''}
              onChange={(e) => handleChange('commitments', e.target.value)}
              onBlur={() => handleBlur('commitments')}
            />
          </div>

          <div className="form-group">
            <label>شرح خدمات</label>
            <textarea
              rows={2}
              placeholder="شرح کامل خدمات ارائه شده..."
              value={formData.services_description || ''}
              onChange={(e) => handleChange('services_description', e.target.value)}
              onBlur={() => handleBlur('services_description')}
            />
          </div>

          <div className="form-group">
            <label>اسناد و مدارک</label>
            <textarea
              rows={2}
              placeholder="اسناد و مدارک مرتبط با قرارداد..."
              value={formData.documents || ''}
              onChange={(e) => handleChange('documents', e.target.value)}
              onBlur={() => handleBlur('documents')}
            />
          </div>

          <div className="form-group">
            <label>نشانی طرفین قرارداد</label>
            <textarea
              rows={2}
              placeholder="نشانی کامل طرفین قرارداد..."
              value={formData.contractor_address || ''}
              onChange={(e) => handleChange('contractor_address', e.target.value)}
              onBlur={() => handleBlur('contractor_address')}
            />
          </div>

          {/* فایل‌های پیوست چندگانه */}
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
                      <span className="file-name">{att.filename || getFileName(att.file)}</span>
                      <span className="file-size">{att.size ? (att.size / 1024).toFixed(1) : '0'} KB</span>
                      <button type="button" className="file-remove" onClick={() => handleExistingAttachmentRemove(att.id)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <small className="hint">می‌توانید چندین فایل را همزمان انتخاب کنید</small>
          </div>

          {/* فعالیت‌ها */}
          <div className="activities-section">
            <div className="section-header">
              <label>فعالیت‌های قرارداد</label>
              <button type="button" className="add-btn" onClick={addActivity}>
                <Plus size={16} /> افزودن فعالیت
              </button>
            </div>

            {formData.activities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-header">
                  <span className="activity-number">فعالیت {index + 1}</span>
                  <button type="button" className="remove-btn" onClick={() => removeActivity(index)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>عنوان فعالیت <span className="required">*</span></label>
                    <input
                      type="text"
                      placeholder="عنوان فعالیت را وارد کنید..."
                      value={activity.title || ''}
                      onChange={(e) => updateActivity(index, 'title', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>وضعیت</label>
                    <select
                      value={activity.status || 'PLANNED'}
                      onChange={(e) => updateActivity(index, 'status', e.target.value)}
                    >
                      {Object.entries(ACTIVITY_STATUSES).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>تاریخ شروع</label>
                    <JalaliDatePicker
                      value={activity.start_date || null}
                      onChange={(date) => updateActivity(index, 'start_date', date)}
                      placeholder="1402/01/01"
                      label=""
                    />
                  </div>
                  <div className="form-group">
                    <label>تاریخ پایان</label>
                    <JalaliDatePicker
                      value={activity.end_date || null}
                      onChange={(date) => updateActivity(index, 'end_date', date)}
                      placeholder="1402/01/01"
                      label=""
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>پیشرفت (%)</label>
                    <input
                      type="number"
                      min="0" max="100"
                      placeholder="0"
                      value={activity.progress || 0}
                      onChange={(e) => updateActivity(index, 'progress', Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label>توضیحات</label>
                    <input
                      type="text"
                      placeholder="توضیحات فعالیت..."
                      value={activity.description || ''}
                      onChange={(e) => updateActivity(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {formData.activities.length === 0 && (
              <div className="empty-activities">
                <p>هیچ فعالیتی ثبت نشده است</p>
                <button type="button" className="add-btn-primary" onClick={addActivity}>
                  <Plus size={16} /> افزودن اولین فعالیت
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
              <><span className="spinner-border spinner-border-sm" /> در حال پردازش...</>
            ) : (
              isEditing ? 'ویرایش' : 'افزودن'
            )}
          </button>
        </div>
      </form>

      <style>{`
        .contract-form { padding: 24px; }
        .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e9ecef; }
        .form-header h3 { margin: 0; font-size: 20px; font-weight: 600; color: #1a1a2e; }
        .close-btn { background: none; border: none; color: #6b7280; cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.2s; }
        .close-btn:hover { background: #f3f4f6; color: #1a1a2e; }
        .form-body { display: flex; flex-direction: column; gap: 16px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 4px; }
        .form-group label { font-size: 13px; font-weight: 500; color: #374151; }
        .required { color: #dc2626; }
        .form-group input, .form-group select, .form-group textarea {
          padding: 10px 14px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 14px; transition: all 0.2s; font-family: inherit; width: 100%; background: white;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: #4f46e5; outline: none; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        .form-group input.is-invalid, .form-group select.is-invalid { border-color: #dc2626; }
        .error-text { font-size: 12px; color: #dc2626; margin-top: 2px; }
        .input-with-icon { position: relative; }
        .input-with-icon .input-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .input-with-icon input { padding-right: 36px; }

        .file-upload-wrapper { display: flex; flex-direction: column; gap: 8px; }
        .file-upload-wrapper input[type="file"] { display: none; }
        .file-upload-label { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: #f3f4f6; border: 1.5px dashed #d1d5db; border-radius: 8px; cursor: pointer; font-size: 14px; color: #6b7280; transition: all 0.2s; width: fit-content; }
        .file-upload-label:hover { border-color: #4f46e5; background: #eef2ff; color: #4f46e5; }
        .file-count { font-size: 11px; color: #6b7280; background: #e5e7eb; padding: 0 8px; border-radius: 10px; }
        .file-list { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
        .file-list.existing { border-top: 1px solid #e9ecef; padding-top: 8px; }
        .file-list-title { font-size: 12px; font-weight: 500; color: #374151; }
        .file-info { display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: #f8fafc; border: 1px solid #e9ecef; border-radius: 6px; flex-wrap: wrap; }
        .file-info.existing { background: #eef2ff; border-color: #c7d2fe; }
        .file-name { font-size: 13px; font-weight: 500; color: #1a1a2e; flex: 1; min-width: 60px; }
        .file-size { font-size: 12px; color: #6b7280; }
        .file-remove { background: none; border: none; color: #dc2626; cursor: pointer; padding: 2px 4px; border-radius: 4px; transition: all 0.2s; }
        .file-remove:hover { background: #fee2e2; }
        .file-link { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 4px; color: #4f46e5; background: transparent; transition: all 0.2s; border: none; cursor: pointer; text-decoration: none; }
        .file-link:hover { background: #dbeafe; }
        .file-link.download { color: #059669; }
        .file-link.download:hover { background: #d1fae5; }

        .activities-section { border-top: 1px solid #e9ecef; padding-top: 16px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .section-header label { font-size: 14px; font-weight: 600; color: #1a1a2e; }
        .add-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: #eef2ff; color: #4f46e5; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .add-btn:hover { background: #dbeafe; }
        .add-btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; margin-top: 8px; }
        .add-btn-primary:hover { background: #4338ca; }
        .activity-item { background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
        .activity-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .activity-number { font-size: 13px; font-weight: 600; color: #4f46e5; }
        .remove-btn { background: none; border: none; color: #dc2626; cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s; }
        .remove-btn:hover { background: #fee2e2; }
        .empty-activities { text-align: center; padding: 20px; color: #6b7280; }
        .empty-activities p { margin: 0 0 8px 0; }

        .progress-wrapper { margin-top: 8px; display: flex; align-items: center; gap: 12px; }
        .progress-bar { flex: 1; height: 6px; background: #e9ecef; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #4f46e5, #7c3aed); border-radius: 4px; transition: width 0.3s ease; }
        .progress-text { font-size: 12px; font-weight: 500; color: #4f46e5; min-width: 40px; }

        .form-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e9ecef; }
        .btn-secondary { padding: 10px 24px; border: 1.5px solid #e9ecef; border-radius: 8px; background: white; color: #6b7280; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { background: #f8fafc; }
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 32px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover:not(:disabled) { background: #4338ca; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner-border { display: inline-block; width: 16px; height: 16px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .contract-form { padding: 16px; }
          .form-row { grid-template-columns: 1fr; }
          .form-footer { flex-direction: column-reverse; }
          .form-footer button { width: 100%; justify-content: center; }
          .activity-item { padding: 12px; }
        }
      `}</style>
    </div>
  );
};

export default ContractForm;

