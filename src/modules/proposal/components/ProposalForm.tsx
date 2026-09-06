// src/modules/proposal/components/ProposalForm.tsx

import React, { useState, useEffect } from 'react';
import { useProposal } from '../hooks/useProposal';
import { useRfp } from '../../rfp/hooks/useRfp';
import { useUniversity } from '../../university/hooks/useUniversity';
import { usePerson } from '../../person/hooks/usePerson';
import { useCompany } from '../../company/hooks/useCompany';
import { type Proposal, type ProposalFormData, type ProposalAttachment } from '../types/proposal.types';
import { X, Upload, FileText, Building2, Users, Trophy, Calendar, Eye, Download } from 'lucide-react';
import { PersonSelect } from '../../person/components/PersonSelect';
import { CompanySelect } from '../../company/components/CompanySelect';
import { UniversitySelect } from '../../university/components/UniversitySelect';
import JalaliDatePicker from '../../../components/JalaliDatePicker';
import { ProjectSubjectSelect } from '../../project-subject/components/ProjectSubjectSelect';
import { RfpSelect } from '../../rfp/components/RfpSelect';
import { formatJalaliDate, jalaliToGregorian,getCurrentJalaliYear } from '../../../utils/dateUtils';
import type { Rfp } from '../../rfp/types/rfp.types';
import type { University } from '../../university/types/university.types';
import type { Person } from '../../person/types/person.types';
import type { Company } from '../../company/types/company.types';
import type { PaginatedResponse } from '../../../types/common.types';

// ✅ تابع کمکی برای تبدیل داده‌ها
function extractData<T>(data: unknown): T[] {
  if (!data) return [];
  
  // اگر PaginatedResponse باشد
  if (typeof data === 'object' && data !== null && 'results' in data) {
    const paginated = data as PaginatedResponse<T>;
    return paginated.results || [];
  }
  
  // اگر آرایه باشد
  if (Array.isArray(data)) {
    return data as T[];
  }
  
  return [];
}

interface ProposalFormProps {
  initialData?: Proposal;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProposalForm: React.FC<ProposalFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { create, update, isCreating, isUpdating } = useProposal();
  const { useList: useRfpList } = useRfp();
  const { useList: useUniversityList } = useUniversity();
  const { useList: usePersonList } = usePerson();
  const { useList: useCompanyList } = useCompany();

  const [formData, setFormData] = useState<ProposalFormData>({
    title_farsi: '',
    execution_location: '',
    execution_time: 6,
    project_subject_id: 0,
    university_id: 0,
    primary_researcher_id: 0,
    rfp_id: 0,
    is_winner: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [existingAttachments, setExistingAttachments] = useState<ProposalAttachment[]>([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<number[]>([]);


  const isEditing = !!initialData;

const { data: rfpsData } = useRfpList({});
  const rfps: Rfp[] = extractData<Rfp>(rfpsData);
  
  const { data: universitiesData } = useUniversityList({});
  const universities: University[] = extractData<University>(universitiesData);
  
  const { data: personsData } = usePersonList({});
  const persons: Person[] = extractData<Person>(personsData);
  
  const { data: companiesData } = useCompanyList({});
  const companies: Company[] = extractData<Company>(companiesData);

  
   // ============================================================
  // 🔥 پر کردن داده‌ها در حالت ویرایش (اصلاح شده)
  // ============================================================
  useEffect(() => {
    if (initialData) {
      // استخراج rfp_id از آبجکت rfp
      let rfpId = 0;
      if (initialData.rfp) {
        if (typeof initialData.rfp === 'object') {
          rfpId = (initialData.rfp as any)?.id || 0;
        } else {
          rfpId = initialData.rfp as number;
        }
      }

      // استخراج company_id
      let companyId: number | undefined = undefined;
      if (initialData.company) {
        if (typeof initialData.company === 'object') {
          companyId = (initialData.company as any)?.id || undefined;
        } else {
          companyId = initialData.company as number;
        }
      }

      setFormData({
        code: initialData.code || '',
        title_farsi: initialData.title_farsi || '',
        title_english: initialData.title_english || '',
        approved_date: initialData.approved_date || '',
        execution_location: initialData.execution_location || '',
        execution_time: initialData.execution_time || 6,
        is_winner: initialData.is_winner || false,
        keywords: initialData.keywords || '',
        project_subject_id: typeof initialData.project_subject === 'object'
          ? (initialData.project_subject as any)?.id
          : initialData.project_subject || 0,
        university_id: typeof initialData.university === 'object'
          ? (initialData.university as any)?.id
          : initialData.university || 0,
        primary_researcher_id: typeof initialData.primary_researcher === 'object'
          ? (initialData.primary_researcher as any)?.id
          : initialData.primary_researcher || 0,
        company_id: companyId,
        rfp_id: rfpId,  // 🔥 اصلاح شده
      });
      setExistingAttachments(initialData.attachments || []);
      setDeletedAttachmentIds([]);
      setSelectedFiles([]);
      setSubmitAttempted(false);
      setErrors({});
      setTouched({});
    }
  }, [initialData]);

  // ============================================================
  // Validation
  // ============================================================
  const validateField = (field: keyof ProposalFormData, value: any): string | null => {
    switch (field) {
      case 'title_farsi':
        if (!value?.trim()) return 'عنوان فارسی پروپوزال الزامی است';
        return null;
      case 'execution_location':
        if (!value?.trim()) return 'محل انجام پروژه الزامی است';
        return null;
      case 'execution_time':
        if (!value || value <= 0) return 'مدت اجرا باید بیشتر از صفر باشد';
        return null;
      case 'project_subject_id':
        if (!value || value <= 0) return 'موضوع پروژه الزامی است';
        return null;
      case 'university_id':
        if (!value || value <= 0) return 'دانشگاه الزامی است';
        return null;
      case 'primary_researcher_id':
        if (!value || value <= 0) return 'پژوهشگر اصلی الزامی است';
        return null;
      case 'rfp_id':
        if (!value || value <= 0) return 'انتخاب RFP الزامی است';
        return null;
      default:
        return null;
    }
  };

  const validate = (): boolean => {
    const fieldsToValidate: (keyof ProposalFormData)[] = [
      'title_farsi', 'execution_location', 'execution_time',
      'project_subject_id', 'university_id', 'primary_researcher_id', 'rfp_id'
    ];
    
    let hasError = false;
    const newErrors: Record<string, string> = {};
    
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

  const handleChange = (field: keyof ProposalFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitAttempted || touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || '' }));
    }
  };

  const handleBlur = (field: keyof ProposalFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error || '' }));
  };

  // ============================================================
  // Handle File Change
  // ============================================================
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

  // ============================================================
  // Submit
  // ============================================================
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
      submitData.approved_date = jalaliToGregorian(formatJalaliDate(submitData.approved_date));
      

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
    <div className="proposal-form">
      <div className="form-header">
        <h3>{isEditing ? 'ویرایش پروپوزال' : 'افزودن پروپوزال جدید'}</h3>
        <button className="close-btn" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-body">
          <div className="form-row">
            <div className="form-group">
              <label>کد پروپوزال</label>
              <input
                type="text"
                placeholder="مثال: PRO-1402-001"
                value={formData.code || ''}
                onChange={(e) => handleChange('code', e.target.value)}
                onBlur={() => handleBlur('code')}
              />
            </div>
            <div className="form-group">
              <label>عنوان فارسی <span className="required">*</span></label>
              <input
                type="text"
                placeholder="عنوان فارسی پروپوزال..."
                value={formData.title_farsi || ''}
                onChange={(e) => handleChange('title_farsi', e.target.value)}
                onBlur={() => handleBlur('title_farsi')}
                className={(touched.title_farsi || submitAttempted) && errors.title_farsi ? 'error' : ''}
              />
              {(touched.title_farsi || submitAttempted) && errors.title_farsi && (
                <span className="error-text">{errors.title_farsi}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>عنوان انگلیسی</label>
              <input
                type="text"
                placeholder="English Title..."
                value={formData.title_english || ''}
                onChange={(e) => handleChange('title_english', e.target.value)}
                onBlur={() => handleBlur('title_english')}
              />
            </div>
            <div className="form-group">
              <label>تاریخ تصویب</label>
              <JalaliDatePicker
                value={formData.approved_date || null}
                onChange={(date) => handleChange('approved_date', date)}
                placeholder="1402/01/01"
                label=""
                error={errors.approved_date}
                disabled={isCreating || isUpdating}
              />
              {(touched.approved_date || submitAttempted) && errors.approved_date && (
                <span className="error-text">{errors.approved_date}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>محل انجام پروژه <span className="required">*</span></label>
              <input
                type="text"
                placeholder="محل انجام پروژه..."
                value={formData.execution_location || ''}
                onChange={(e) => handleChange('execution_location', e.target.value)}
                onBlur={() => handleBlur('execution_location')}
                className={(touched.execution_location || submitAttempted) && errors.execution_location ? 'error' : ''}
              />
              {(touched.execution_location || submitAttempted) && errors.execution_location && (
                <span className="error-text">{errors.execution_location}</span>
              )}
            </div>
            <div className="form-group">
              <label>مدت اجرا (ماه) <span className="required">*</span></label>
              <input
                type="number"
                placeholder="مثال: 6"
                value={formData.execution_time || ''}
                onChange={(e) => handleChange('execution_time', Number(e.target.value))}
                onBlur={() => handleBlur('execution_time')}
                className={(touched.execution_time || submitAttempted) && errors.execution_time ? 'error' : ''}
                min="1"
              />
              {(touched.execution_time || submitAttempted) && errors.execution_time && (
                <span className="error-text">{errors.execution_time}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>کلیدواژه‌ها</label>
              <input
                type="text"
                placeholder="کلیدواژه‌ها را با کاما جدا کنید..."
                value={formData.keywords || ''}
                onChange={(e) => handleChange('keywords', e.target.value)}
                onBlur={() => handleBlur('keywords')}
              />
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
              <label style={{ margin: 0 }}>برنده</label>
              <input
                type="checkbox"
                checked={formData.is_winner || false}
                onChange={(e) => handleChange('is_winner', e.target.checked)}
                onBlur={() => handleBlur('is_winner')}
              />
              <Trophy size={16} color={formData.is_winner ? '#059669' : '#6b7280'} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>موضوع پروژه <span className="required">*</span></label>
              <ProjectSubjectSelect
                value={formData.project_subject_id}
                onChange={(id) => handleChange('project_subject_id', id || 0)}
                placeholder="جستجو و انتخاب موضوع پروژه..."
                label=""
                required={true}
                error={errors.project_subject_id}
              />
              {(touched.project_subject_id || submitAttempted) && errors.project_subject_id && (
                <span className="error-text">{errors.project_subject_id}</span>
              )}
            </div>
            <div className="form-group">
              <label>RFP مرتبط <span className="required">*</span></label>
              <RfpSelect
                value={formData.rfp_id}
                onChange={(id) => {
                  handleChange('rfp_id', id || 0);
                }}
                placeholder="جستجو و انتخاب RFP..."
                label=""
                required={true}
                error={errors.rfp_id}
              />
              {(touched.rfp_id || submitAttempted) && errors.rfp_id && (
                <span className="error-text">{errors.rfp_id}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>دانشگاه <span className="required">*</span></label>
              <UniversitySelect
                value={formData.university_id}
                onChange={(id) => handleChange('university_id', id || 0)}
                placeholder="جستجو و انتخاب دانشگاه..."
                label=""
                required={true}
                error={errors.university_id}
              />
              {(touched.university_id || submitAttempted) && errors.university_id && (
                <span className="error-text">{errors.university_id}</span>
              )}
            </div>
            <div className="form-group">
              <label>پژوهشگر اصلی <span className="required">*</span></label>
              <PersonSelect
                value={formData.primary_researcher_id}
                onChange={(id) => handleChange('primary_researcher_id', id || 0)}
                placeholder="جستجو و انتخاب پژوهشگر..."
                label=""
                required={true}
                error={errors.primary_researcher_id}
              />
              {(touched.primary_researcher_id || submitAttempted) && errors.primary_researcher_id && (
                <span className="error-text">{errors.primary_researcher_id}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>شرکت (اختیاری)</label>
              <CompanySelect
                value={formData.company_id}
                onChange={(id) => handleChange('company_id', id)}
                placeholder="جستجو و انتخاب شرکت..."
                label=""
                required={false}
                error={errors.company_id}
              />
              {(touched.company_id || submitAttempted) && errors.company_id && (
                <span className="error-text">{errors.company_id}</span>
              )}
            </div>
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
          </div>

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
            {isCreating || isUpdating ? 'در حال پردازش...' : isEditing ? 'ویرایش' : 'افزودن'}
          </button>
        </div>
      </form>

      {/* استایل‌ها */}
      <style>{`
        .proposal-form {
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

        .file-info.existing {
          background: #eef2ff;
          border-color: #c7d2fe;
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

        @media (max-width: 768px) {
          .proposal-form {
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

export default ProposalForm;