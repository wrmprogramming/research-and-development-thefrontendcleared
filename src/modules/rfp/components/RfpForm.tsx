// src/modules/rfp/components/RfpForm.tsx

import React, { useState, useEffect } from 'react';
import { useRfp } from '../hooks/useRfp';
import { useResearch } from '../../research/hooks/useResearch';
import { type Rfp, type RfpFormData, type RfpAttachment } from '../types/rfp.types';
import { X, Upload, FileText, DollarSign, Clock, Eye, Download, Trash2, HelpCircle, Plus, Users } from 'lucide-react';
import { ResearchSelect } from '../../research/components/ResearchSelect';

// ============================================================
// تعریف تایپ‌ها
// ============================================================
interface BasicQuestion {
  id?: number;
  question: string;
  order?: number;
}

interface Consumer {
  id?: number;
  name: string;
  description?: string;
}

interface RfpFormProps {
  initialData?: Rfp;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const RfpForm: React.FC<RfpFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { create, update, isCreating, isUpdating } = useRfp();
  const { useList: useResearchList } = useResearch();

  const [formData, setFormData] = useState<RfpFormData>({
    title: '',
    description: '',
    estimated_price: 0,
    approximate_project_time: 6,
    necessity_declaration: '',
    solution_exact_definition: '',
    research_id: null,
    basic_questions: [],
    consumers: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [existingAttachments, setExistingAttachments] = useState<RfpAttachment[]>([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<number[]>([]);

  const isEditing = !!initialData;

  const { data: researchData } = useResearchList({});
  const researches = researchData?.results || [];

  // ============================================================
  // 🔥 پر کردن داده‌ها در حالت ویرایش (اصلاح شده)
  // ============================================================
  useEffect(() => {
    if (initialData) {
      // 🔥 استخراج research_id با مدیریت صحیح
      let researchId: number | null = null;
      
      if (initialData.research !== null && initialData.research !== undefined) {
        if (typeof initialData.research === 'object') {
          // اگر research یک آبجکت است، id آن را بگیر
          researchId = (initialData.research as any)?.id ?? null;
        } else {
          // اگر research یک عدد است (id)
          researchId = initialData.research as number;
        }
      }

      setFormData({
        code: initialData.code || '',
        title: initialData.title || '',
        description: initialData.description || '',
        estimated_price: initialData.estimated_price || 0,
        approximate_project_time: initialData.approximate_project_time || 6,
        necessity_declaration: initialData.necessity_declaration || '',
        solution_exact_definition: initialData.solution_exact_definition || '',
        research_id: researchId,
         // ✅ سوالات اساسی
        basic_questions: (initialData as any).basic_questions?.map((q: any) => ({
          id: q.id,
          question: q.question,
          order: q.order || 1,
        })) || [],
        // ✅ مصرف‌کنندگان
        consumers: (initialData as any).consumers?.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description || '',
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

  // ============================================================
  // Validation
  // ============================================================
  const validateField = (field: keyof RfpFormData, value: any): string | null => {
    switch (field) {
      case 'title':
        if (!value?.trim()) return 'عنوان RFP الزامی است';
        return null;
      case 'estimated_price':
        if (!value || value <= 0) return 'مبلغ تخمینی باید بیشتر از صفر باشد';
        return null;
      case 'approximate_project_time':
        if (!value || value <= 0) return 'مدت زمان باید بیشتر از صفر باشد';
        return null;
      case 'necessity_declaration':
        if (!value?.trim()) return 'تبیین ضرورت الزامی است';
        return null;
      case 'solution_exact_definition':
        if (!value?.trim()) return 'تعریف دقیق مسأله الزامی است';
        return null;
      default:
        return null;
    }
  };

  const validate = (): boolean => {
    const fieldsToValidate: (keyof RfpFormData)[] = [
      'title', 'estimated_price', 'approximate_project_time',
      'necessity_declaration', 'solution_exact_definition',
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

    // اعتبارسنجی سوالات اساسی
    if (formData.basic_questions?.some(q => !q.question?.trim())) {
      newErrors.basic_questions = 'لطفاً متن همه سوالات اساسی را وارد کنید';
      hasError = true;
    }

    // اعتبارسنجی مصرف‌کنندگان
    if (formData.consumers?.some(c => !c.name?.trim())) {
      newErrors.consumers = 'لطفاً نام همه مصرف‌کنندگان را وارد کنید';
      hasError = true;
    }
    
    setErrors(newErrors);
    return !hasError;
  };

  const handleChange = (field: keyof RfpFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitAttempted || touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || '' }));
    }
  };

  const handleBlur = (field: keyof RfpFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error || '' }));
  };

  // ============================================================
  // مدیریت سوالات اساسی
  // ============================================================
  const addBasicQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      basic_questions: [
        ...(prev.basic_questions || []),
        { question: '', order: (prev.basic_questions?.length || 0) + 1 }
      ]
    }));
  };

  const removeBasicQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      basic_questions: prev.basic_questions?.filter((_, i) => i !== index) || []
    }));
  };

  const updateBasicQuestion = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      basic_questions: prev.basic_questions?.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  // ============================================================
  // مدیریت مصرف‌کنندگان
  // ============================================================
  const addConsumer = () => {
    setFormData((prev) => ({
      ...prev,
      consumers: [
        ...(prev.consumers || []),
        { name: '', description: '' }
      ]
    }));
  };

  const removeConsumer = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      consumers: prev.consumers?.filter((_, i) => i !== index) || []
    }));
  };

  const updateConsumer = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      consumers: prev.consumers?.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
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
      
      if (!submitData.research_id || submitData.research_id <= 0) {
        submitData.research_id = null;
      }

          // ✅ دیباگ: لاگ داده‌های سوالات
    console.log('📤 Submitting basic_questions:', submitData.basic_questions);
    console.log('📤 Submitting consumers:', submitData.consumers);
      
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
            const formField = field === 'research' ? 'research_id' : field;
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
    <div className="rfp-form">
      <div className="form-header">
        <h3>{isEditing ? 'ویرایش RFP' : 'افزودن RFP جدید'}</h3>
        <button className="close-btn" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-body">
          <div className="form-row">
            <div className="form-group">
              <label>کد RFP</label>
              <input
                type="text"
                placeholder="مثال: RFP-1402-001"
                value={formData.code || ''}
                onChange={(e) => handleChange('code', e.target.value)}
                onBlur={() => handleBlur('code')}
              />
            </div>
            <div className="form-group">
              <label>عنوان RFP <span className="required">*</span></label>
              <input
                type="text"
                placeholder="عنوان RFP را وارد کنید..."
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

          <div className="form-row">
            <div className="form-group">
              <label>مبلغ تخمینی (ریال) <span className="required">*</span></label>
              <div className="input-with-icon">
                <DollarSign size={18} className="input-icon" />
                <input
                  type="number"
                  placeholder="مبلغ تخمینی..."
                  value={formData.estimated_price || ''}
                  onChange={(e) => handleChange('estimated_price', Number(e.target.value))}
                  onBlur={() => handleBlur('estimated_price')}
                  className={(touched.estimated_price || submitAttempted) && errors.estimated_price ? 'error' : ''}
                  min="0"
                />
              </div>
              {(touched.estimated_price || submitAttempted) && errors.estimated_price && (
                <span className="error-text">{errors.estimated_price}</span>
              )}
            </div>
            <div className="form-group">
              <label>مدت زمان تقریبی (ماه) <span className="required">*</span></label>
              <div className="input-with-icon">
                <Clock size={18} className="input-icon" />
                <input
                  type="number"
                  placeholder="مثال: 6"
                  value={formData.approximate_project_time || ''}
                  onChange={(e) => handleChange('approximate_project_time', Number(e.target.value))}
                  onBlur={() => handleBlur('approximate_project_time')}
                  className={(touched.approximate_project_time || submitAttempted) && errors.approximate_project_time ? 'error' : ''}
                  min="1"
                />
              </div>
              {(touched.approximate_project_time || submitAttempted) && errors.approximate_project_time && (
                <span className="error-text">{errors.approximate_project_time}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>تبیین ضرورت <span className="required">*</span></label>
              <textarea
                rows={3}
                placeholder="تبیین ضرورت انجام پژوهش..."
                value={formData.necessity_declaration || ''}
                onChange={(e) => handleChange('necessity_declaration', e.target.value)}
                onBlur={() => handleBlur('necessity_declaration')}
                className={(touched.necessity_declaration || submitAttempted) && errors.necessity_declaration ? 'error' : ''}
              />
              {(touched.necessity_declaration || submitAttempted) && errors.necessity_declaration && (
                <span className="error-text">{errors.necessity_declaration}</span>
              )}
            </div>
            <div className="form-group">
              <label>تعریف دقیق مسأله <span className="required">*</span></label>
              <textarea
                rows={3}
                placeholder="تعریف دقیق مسأله و راه حل..."
                value={formData.solution_exact_definition || ''}
                onChange={(e) => handleChange('solution_exact_definition', e.target.value)}
                onBlur={() => handleBlur('solution_exact_definition')}
                className={(touched.solution_exact_definition || submitAttempted) && errors.solution_exact_definition ? 'error' : ''}
              />
              {(touched.solution_exact_definition || submitAttempted) && errors.solution_exact_definition && (
                <span className="error-text">{errors.solution_exact_definition}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>پژوهش مرتبط</label>
              <ResearchSelect
                value={formData.research_id}
                onChange={(id) => {
                  handleChange('research_id', id || null);
                }}
                placeholder="جستجو و انتخاب پژوهش..."
                label=""
                error={errors.research_id}
              />
              {(touched.research_id || submitAttempted) && errors.research_id && (
                <span className="error-text">{errors.research_id}</span>
              )}
            </div>
          </div>

          <div className="questions-section">
            <div className="section-header">
              <label>سوالات اساسی پژوهش</label>
              <button type="button" className="add-btn" onClick={addBasicQuestion}>
                <Plus size={16} /> افزودن سوال
              </button>
            </div>

            {formData.basic_questions?.map((question, index) => (
              <div key={index} className="question-item">
                <div className="question-header">
                  <span className="question-number">سوال {index + 1}</span>
                  <button type="button" className="remove-btn" onClick={() => removeBasicQuestion(index)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="form-group">
                  <label>متن سوال <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <HelpCircle size={18} className="input-icon" />
                    <input
                      type="text"
                      placeholder="سوال اساسی را وارد کنید..."
                      value={question.question || ''}
                      onChange={(e) => updateBasicQuestion(index, 'question', e.target.value)}
                      className={errors.basic_questions ? 'error' : ''}
                    />
                  </div>
                </div>
              </div>
            ))}

            {(!formData.basic_questions || formData.basic_questions.length === 0) && (
              <div className="empty-questions">
                <HelpCircle size={32} />
                <p>هیچ سوال اساسی ثبت نشده است</p>
                <button type="button" className="add-btn-primary" onClick={addBasicQuestion}>
                  <Plus size={16} /> افزودن اولین سوال
                </button>
              </div>
            )}
            {errors.basic_questions && (
              <span className="error-text">{errors.basic_questions}</span>
            )}
          </div>

            <div className="consumers-section">
            <div className="section-header">
              <label>مصرف‌کنندگان پژوهش</label>
              <button type="button" className="add-btn" onClick={addConsumer}>
                <Plus size={16} /> افزودن مصرف‌کننده
              </button>
            </div>

            {formData.consumers?.map((consumer, index) => (
              <div key={index} className="consumer-item">
                <div className="consumer-header">
                  <span className="consumer-number">مصرف‌کننده {index + 1}</span>
                  <button type="button" className="remove-btn" onClick={() => removeConsumer(index)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>نام مصرف‌کننده <span className="required">*</span></label>
                    <div className="input-with-icon">
                      <Users size={18} className="input-icon" />
                      <input
                        type="text"
                        placeholder="نام مصرف‌کننده را وارد کنید..."
                        value={consumer.name || ''}
                        onChange={(e) => updateConsumer(index, 'name', e.target.value)}
                        className={errors.consumers ? 'error' : ''}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>توضیحات</label>
                    <input
                      type="text"
                      placeholder="توضیحات تکمیلی..."
                      value={consumer.description || ''}
                      onChange={(e) => updateConsumer(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {(!formData.consumers || formData.consumers.length === 0) && (
              <div className="empty-consumers">
                <Users size={32} />
                <p>هیچ مصرف‌کننده‌ای ثبت نشده است</p>
                <button type="button" className="add-btn-primary" onClick={addConsumer}>
                  <Plus size={16} /> افزودن اولین مصرف‌کننده
                </button>
              </div>
            )}
            {errors.consumers && (
              <span className="error-text">{errors.consumers}</span>
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

      <style>{`
        .rfp-form {
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
          .rfp-form {
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

         .questions-section {
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
          background: #eef2ff;
          color: #4f46e5;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-btn:hover {
          background: #dbeafe;
        }

        .add-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #4f46e5;
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
          background: #4338ca;
        }

        .question-item {
          background: #f8fafc;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .question-number {
          font-size: 13px;
          font-weight: 600;
          color: #4f46e5;
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

        .empty-questions {
          text-align: center;
          padding: 20px;
          color: #6b7280;
        }

        .empty-questions svg {
          color: #d1d5db;
          margin-bottom: 8px;
        }

        .empty-questions p {
          margin: 0 0 8px 0;
        }

         .consumers-section {
          border-top: 1px solid #e9ecef;
          padding-top: 16px;
        }

        .consumer-item {
          background: #f8fafc;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .consumer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .consumer-number {
          font-size: 13px;
          font-weight: 600;
          color: #4f46e5;
        }

        .empty-consumers {
          text-align: center;
          padding: 20px;
          color: #6b7280;
        }

        .empty-consumers svg {
          color: #d1d5db;
          margin-bottom: 8px;
        }

        .empty-consumers p {
          margin: 0 0 8px 0;
        }


      `}</style>
    </div>
  );
};

export default RfpForm;