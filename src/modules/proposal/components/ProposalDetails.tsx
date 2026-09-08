// src/modules/proposal/pages/ProposalDetailsPage.tsx

import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProposal } from '../hooks/useProposal';
import { formatCurrency, toPersianNumber } from '../../../utils/formatter.utils';

import {
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  Download,
  Eye,
  Printer,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Paperclip,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Building2,
  Loader2,
  User,
  Users,
  Trophy,
  XCircle,
  MapPin,
  Tag,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { ProposalForm } from '../components/ProposalForm';

interface ProposalDetailsPageProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

const toPersianNumberFn = (num: any): string => {
  if (num === undefined || num === null || num === '') return '۰';
  return toPersianNumber(num);
};

export const ProposalDetailsPage: React.FC<ProposalDetailsPageProps> = ({ onEdit, onDelete }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useItem, delete: deleteProposal, isDeleting } = useProposal();
  
  const { data: proposal, isLoading, refetch } = useItem(Number(id));
  
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // ========== Handle Delete ==========
  const handleDelete = async () => {
    if (window.confirm('آیا از حذف این پروپوزال مطمئن هستید؟')) {
      await deleteProposal(Number(id));
      navigate('/proposal');
      toast.success('پروپوزال با موفقیت حذف شد');
    }
  };

  // ========== Handle Edit ==========
  const handleEdit = () => {
    setEditFormOpen(true);
  };

  const handleEditSuccess = () => {
    setEditFormOpen(false);
    refetch();
    toast.success('پروپوزال با موفقیت ویرایش شد');
  };

  const handleEditCancel = () => {
    setEditFormOpen(false);
  };

  // ========== Export Functions ==========
  const exportHTML = () => {
    if (!proposal) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const rfpName = proposal.rfp_code || proposal.rfp_title || '—';
      const universityName = proposal.university_name || '—';
      const researcherName = proposal.primary_researcher_name || '—';

      let attachmentsHtml = '';
      if (proposal.attachments && proposal.attachments.length > 0) {
        attachmentsHtml = proposal.attachments.map(att => 
          `<div style="display:flex;align-items:center;gap:8px;padding:4px 8px;background:#f8fafc;border-radius:4px;border:1px solid #e9ecef;margin-bottom:2px;">
            <span>📎</span>
            <span>${att.filename || att.file.split('/').pop()}</span>
            <span style="font-size:11px;color:#6b7280;">(${(att.size / 1024).toFixed(1)} KB)</span>
          </div>`
        ).join('');
      }

      const html = `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>پروپوزال ${proposal.code}</title>
  <style>
    body { font-family: 'Vazir', Tahoma, sans-serif; direction: rtl; padding: 40px; max-width: 900px; margin: 0 auto; background: #f8fafc; }
    .container { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 35px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header .sub { font-size: 18px; opacity: 0.9; margin-top: 4px; }
    .header .status { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 24px; border-radius: 20px; font-size: 14px; margin-top: 10px; }
    .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
    .card { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e9ecef; }
    .card .lbl { font-size: 11px; color: #6b7280; }
    .card .val { font-size: 17px; font-weight: 700; margin-top: 4px; }
    .card.blue { background: #eef2ff; } .card.blue .val { color: #4f46e5; }
    .card.green { background: #d1fae5; } .card.green .val { color: #059669; }
    .card.orange { background: #fef3c7; } .card.orange .val { color: #d97706; }
    .card.purple { background: #dbeafe; } .card.purple .val { color: #6366f1; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .section { background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 18px 22px; margin-bottom: 16px; }
    .section h3 { font-size: 15px; font-weight: 700; color: #4f46e5; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e9ecef; }
    .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .row .lbl { color: #6b7280; }
    .row .val { font-weight: 500; color: #1a1a2e; }
    .row .val.highlight { color: #4f46e5; font-weight: 600; }
    .desc { font-size: 13px; color: #374151; line-height: 1.9; text-align: justify; }
    .meta-section { background: #f1f5f9; border-color: #e2e8f0; }
    .attachments-section { background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 14px 18px; margin-top: 16px; }
    .attachments-section h3 { font-size: 15px; font-weight: 700; color: #4f46e5; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e9ecef; }
    .footer { margin-top: 30px; padding-top: 16px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
    @media print { body { background: white; padding: 20px; } .container { box-shadow: none; padding: 20px; } }
    @media (max-width: 768px) { .cards { grid-template-columns: repeat(2, 1fr); } .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>📄 گزارش پروپوزال</h1>
    <div class="sub">${proposal.code}</div>
    <div class="status">${proposal.is_winner ? '🏆 برنده' : 'غیربرنده'}</div>
  </div>
  <div class="cards">
    <div class="card blue"><div class="lbl">کد پروپوزال</div><div class="val">${proposal.code}</div></div>
    <div class="card green"><div class="lbl">مدت اجرا</div><div class="val">${toPersianNumberFn(proposal.execution_time)} ماه</div></div>
    <div class="card orange"><div class="lbl">وضعیت</div><div class="val">${proposal.is_winner ? '🏆 برنده' : 'غیربرنده'}</div></div>
    <div class="card purple"><div class="lbl">سال</div><div class="val">${toPersianNumberFn(proposal.rfp_year || '—')}</div></div>
  </div>
  <div class="grid">
    <div>
      <div class="section"><h3>📋 اطلاعات پروپوزال</h3>
        <div class="row"><span class="lbl">عنوان فارسی</span><span class="val highlight">${proposal.title_farsi}</span></div>
        ${proposal.title_english ? `<div class="row"><span class="lbl">عنوان انگلیسی</span><span class="val">${proposal.title_english}</span></div>` : ''}
        ${proposal.keywords ? `<div class="row"><span class="lbl">کلیدواژه‌ها</span><span class="val">${proposal.keywords}</span></div>` : ''}
      </div>
      <div class="section"><h3>👤 پژوهشگر اصلی</h3>
        <div class="row"><span class="lbl">نام</span><span class="val highlight">${researcherName}</span></div>
      </div>
      <div class="section"><h3>🏢 دانشگاه</h3>
        <div class="row"><span class="lbl">دانشگاه</span><span class="val highlight">${universityName}</span></div>
      </div>
    </div>
    <div>
      <div class="section"><h3>📅 تاریخ‌ها</h3>
        <div class="row"><span class="lbl">تاریخ ارسال</span><span class="val">${proposal.submit_date}</span></div>
        <div class="row"><span class="lbl">تاریخ تصویب</span><span class="val">${proposal.approved_date || '—'}</span></div>
      </div>
      <div class="section"><h3>📍 اطلاعات اجرایی</h3>
        <div class="row"><span class="lbl">محل اجرا</span><span class="val">${proposal.execution_location}</span></div>
        <div class="row"><span class="lbl">مدت اجرا</span><span class="val">${toPersianNumberFn(proposal.execution_time)} ماه</span></div>
      </div>
      <div class="section"><h3>📄 RFP مرتبط</h3>
        <div class="row"><span class="lbl">کد RFP</span><span class="val highlight">${proposal.rfp_code || '—'}</span></div>
        <div class="row"><span class="lbl">عنوان RFP</span><span class="val">${proposal.rfp_title || '—'}</span></div>
        <div class="row"><span class="lbl">سال</span><span class="val">${toPersianNumberFn(proposal.rfp_year || '—')}</span></div>
      </div>
      ${proposal.attachments && proposal.attachments.length > 0 ? `
      <div class="attachments-section">
        <h3>📎 فایل‌های پیوست</h3>
        ${attachmentsHtml}
      </div>` : ''}
      <div class="section meta-section"><h3>📋 اطلاعات تکمیلی</h3>
        <div class="row"><span class="lbl">شناسه</span><span class="val">#${toPersianNumberFn(proposal.id)}</span></div>
        <div class="row"><span class="lbl">تاریخ ایجاد</span><span class="val">${proposal.created_at}</span></div>
        <div class="row"><span class="lbl">آخرین بروزرسانی</span><span class="val">${proposal.updated_at}</span></div>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>📅 تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
    <span>📄 کد پروپوزال: ${proposal.code}</span>
  </div>
</div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      saveAs(blob, `پروپوزال_${proposal.code}.html`);
      toast.success('فایل HTML با موفقیت دانلود شد');
    } catch (error) {
      console.error('HTML export error:', error);
      toast.error('خطا در ایجاد فایل HTML');
    }
    setIsExporting(false);
  };

  const exportJSON = () => {
    if (!proposal) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const data = {
        code: proposal.code,
        title_farsi: proposal.title_farsi,
        title_english: proposal.title_english || null,
        submit_date: proposal.submit_date,
        approved_date: proposal.approved_date || null,
        execution_location: proposal.execution_location,
        execution_time: proposal.execution_time,
        is_winner: proposal.is_winner,
        keywords: proposal.keywords || null,
        project_subject: proposal.project_subject_name || null,
        university: proposal.university_name || null,
        primary_researcher: proposal.primary_researcher_name || null,
        company: proposal.company_name || null,
        rfp: {
          code: proposal.rfp_code || null,
          title: proposal.rfp_title || null,
          year: proposal.rfp_year || null,
        },
        created_at: proposal.created_at,
        updated_at: proposal.updated_at,
        attachments: proposal.attachments?.map(att => ({
          id: att.id,
          filename: att.filename,
          file: att.file,
          size: att.size,
          uploaded_at: att.uploaded_at
        })) || []
      };

      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
      saveAs(blob, `پروپوزال_${proposal.code}.json`);
      toast.success('فایل JSON با موفقیت دانلود شد');
    } catch (error) {
      console.error('JSON export error:', error);
      toast.error('خطا در ایجاد فایل JSON');
    }
    setIsExporting(false);
  };

  const exportCSV = () => {
    if (!proposal) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const rows = [
        ['فیلد', 'مقدار'],
        ['کد پروپوزال', proposal.code],
        ['عنوان فارسی', proposal.title_farsi],
        ['عنوان انگلیسی', proposal.title_english || ''],
        ['تاریخ ارسال', proposal.submit_date],
        ['تاریخ تصویب', proposal.approved_date || ''],
        ['محل اجرا', proposal.execution_location],
        ['مدت اجرا (ماه)', toPersianNumberFn(proposal.execution_time)],
        ['وضعیت', proposal.is_winner ? 'برنده' : 'غیربرنده'],
        ['کلیدواژه‌ها', proposal.keywords || ''],
        ['دانشگاه', proposal.university_name || ''],
        ['پژوهشگر اصلی', proposal.primary_researcher_name || ''],
        ['RFP', proposal.rfp_code || ''],
        ['سال RFP', toPersianNumberFn(proposal.rfp_year || '')],
        ['تاریخ ایجاد', proposal.created_at],
        ['آخرین بروزرسانی', proposal.updated_at],
      ];

      const csvContent = rows.map(row => row.join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `پروپوزال_${proposal.code}.csv`);
      toast.success('فایل CSV با موفقیت دانلود شد');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('خطا در ایجاد فایل CSV');
    }
    setIsExporting(false);
  };

  const exportTXT = () => {
    if (!proposal) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      let attachmentsText = '';
      if (proposal.attachments && proposal.attachments.length > 0) {
        attachmentsText = proposal.attachments.map(att => 
          `  - ${att.filename || att.file.split('/').pop()} (${(att.size / 1024).toFixed(1)} KB)`
        ).join('\n');
      }

      const text = `
═══════════════════════════════════════════════════════════
                    گزارش پروپوزال
═══════════════════════════════════════════════════════════

کد پروپوزال: ${proposal.code}
عنوان فارسی: ${proposal.title_farsi}
${proposal.title_english ? `عنوان انگلیسی: ${proposal.title_english}` : ''}
وضعیت: ${proposal.is_winner ? '🏆 برنده' : 'غیربرنده'}

───────────────────────────────────────────────────────────
                    تاریخ‌ها
───────────────────────────────────────────────────────────

تاریخ ارسال: ${proposal.submit_date}
تاریخ تصویب: ${proposal.approved_date || '—'}

───────────────────────────────────────────────────────────
                    اطلاعات اجرایی
───────────────────────────────────────────────────────────

محل اجرا: ${proposal.execution_location}
مدت اجرا: ${toPersianNumberFn(proposal.execution_time)} ماه
${proposal.keywords ? `کلیدواژه‌ها: ${proposal.keywords}` : ''}

───────────────────────────────────────────────────────────
                    اطلاعات مرتبط
───────────────────────────────────────────────────────────

دانشگاه: ${proposal.university_name || '—'}
پژوهشگر اصلی: ${proposal.primary_researcher_name || '—'}
RFP: ${proposal.rfp_code || '—'} (${proposal.rfp_title || ''})
سال RFP: ${toPersianNumberFn(proposal.rfp_year || '—')}

${attachmentsText ? `───────────────────────────────────────────────────────────
فایل‌های پیوست:
${attachmentsText}
` : ''}
═══════════════════════════════════════════════════════════
تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}
═══════════════════════════════════════════════════════════
`;

      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `پروپوزال_${proposal.code}.txt`);
      toast.success('فایل TXT با موفقیت دانلود شد');
    } catch (error) {
      console.error('TXT export error:', error);
      toast.error('خطا در ایجاد فایل TXT');
    }
    setIsExporting(false);
  };

  const exportToWord = () => {
    if (!proposal) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const rfpName = proposal.rfp_code || proposal.rfp_title || '—';
      const universityName = proposal.university_name || '—';
      const researcherName = proposal.primary_researcher_name || '—';

      let attachmentsHtml = '';
      if (proposal.attachments && proposal.attachments.length > 0) {
        attachmentsHtml = proposal.attachments.map(att => 
          `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:#f8fafc;border-radius:6px;border:1px solid #e9ecef;margin-bottom:4px;">
            <span>📎</span>
            <span>${att.filename || att.file.split('/').pop()}</span>
            <span style="font-size:11px;color:#6b7280;">(${(att.size / 1024).toFixed(1)} KB)</span>
          </div>`
        ).join('');
      }

      const html = `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>پروپوزال ${proposal.code}</title>
  <style>
    body { direction: rtl; font-family: 'B Nazanin', 'Vazir', Tahoma, sans-serif; padding: 35px 40px; max-width: 850px; margin: 0 auto; background: #ffffff; color: #1a1a2e; }
    .header { background: #4f46e5; color: white; padding: 35px 40px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; color: white; }
    .header .sub { font-size: 18px; opacity: 0.9; margin-top: 4px; color: white; }
    .header .status { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 24px; border-radius: 20px; font-size: 14px; margin-top: 10px; color: white; font-weight: 600; }
    .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
    .card { border-radius: 10px; padding: 16px 14px; text-align: center; border: 1px solid #e9ecef; }
    .card .lbl { font-size: 11px; color: #6b7280; font-weight: 500; }
    .card .val { font-size: 17px; font-weight: 700; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .section { background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 18px 22px; margin-bottom: 16px; }
    .section h3 { font-size: 15px; font-weight: 700; color: #4f46e5; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e9ecef; }
    .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .row .lbl { color: #6b7280; }
    .row .val { font-weight: 500; color: #1a1a2e; }
    .row .val.highlight { color: #4f46e5; font-weight: 600; }
    .desc { font-size: 13px; color: #374151; line-height: 1.9; text-align: justify; }
    .meta-section { background: #f1f5f9; border-color: #e2e8f0; }
    .attachments-section { background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 14px 18px; margin-top: 16px; }
    .attachments-section h3 { font-size: 15px; font-weight: 700; color: #4f46e5; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e9ecef; }
    .footer { margin-top: 30px; padding-top: 16px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
    @media (max-width: 768px) { .cards { grid-template-columns: repeat(2, 1fr); } .grid { grid-template-columns: 1fr; } }
    @media print { body { padding: 20px; } .card { break-inside: avoid; } .section { break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>گزارش پروپوزال</h1>
    <div class="sub">${proposal.code}</div>
    <div class="status">${proposal.is_winner ? '🏆 برنده' : 'غیربرنده'}</div>
  </div>
  <div class="cards">
    <div class="card" style="background:#eef2ff;"><div class="lbl">کد پروپوزال</div><div class="val" style="color:#4f46e5;">${proposal.code}</div></div>
    <div class="card" style="background:#d1fae5;"><div class="lbl">مدت اجرا</div><div class="val" style="color:#059669;">${toPersianNumberFn(proposal.execution_time)} ماه</div></div>
    <div class="card" style="background:${proposal.is_winner ? '#d1fae5' : '#fee2e2'};"><div class="lbl">وضعیت</div><div class="val" style="color:${proposal.is_winner ? '#059669' : '#dc2626'};">${proposal.is_winner ? '🏆 برنده' : 'غیربرنده'}</div></div>
    <div class="card" style="background:#dbeafe;"><div class="lbl">سال</div><div class="val" style="color:#6366f1;">${toPersianNumberFn(proposal.rfp_year || '—')}</div></div>
  </div>
  <div class="grid">
    <div>
      <div class="section"><h3>اطلاعات پروپوزال</h3>
        <div class="row"><span class="lbl">عنوان فارسی</span><span class="val highlight">${proposal.title_farsi}</span></div>
        ${proposal.title_english ? `<div class="row"><span class="lbl">عنوان انگلیسی</span><span class="val">${proposal.title_english}</span></div>` : ''}
        ${proposal.keywords ? `<div class="row"><span class="lbl">کلیدواژه‌ها</span><span class="val">${proposal.keywords}</span></div>` : ''}
      </div>
      <div class="section"><h3>پژوهشگر اصلی</h3>
        <div class="row"><span class="lbl">نام</span><span class="val highlight">${researcherName}</span></div>
      </div>
      <div class="section"><h3>دانشگاه</h3>
        <div class="row"><span class="lbl">دانشگاه</span><span class="val highlight">${universityName}</span></div>
      </div>
    </div>
    <div>
      <div class="section"><h3>تاریخ‌ها</h3>
        <div class="row"><span class="lbl">تاریخ ارسال</span><span class="val">${proposal.submit_date}</span></div>
        <div class="row"><span class="lbl">تاریخ تصویب</span><span class="val">${proposal.approved_date || '—'}</span></div>
      </div>
      <div class="section"><h3>اطلاعات اجرایی</h3>
        <div class="row"><span class="lbl">محل اجرا</span><span class="val">${proposal.execution_location}</span></div>
        <div class="row"><span class="lbl">مدت اجرا</span><span class="val">${toPersianNumberFn(proposal.execution_time)} ماه</span></div>
      </div>
      <div class="section"><h3>RFP مرتبط</h3>
        <div class="row"><span class="lbl">کد RFP</span><span class="val highlight">${proposal.rfp_code || '—'}</span></div>
        <div class="row"><span class="lbl">عنوان RFP</span><span class="val">${proposal.rfp_title || '—'}</span></div>
        <div class="row"><span class="lbl">سال</span><span class="val">${toPersianNumberFn(proposal.rfp_year || '—')}</span></div>
      </div>
      ${proposal.attachments && proposal.attachments.length > 0 ? `
      <div class="attachments-section">
        <h3>فایل‌های پیوست</h3>
        ${attachmentsHtml}
      </div>` : ''}
      <div class="section meta-section"><h3>اطلاعات تکمیلی</h3>
        <div class="row"><span class="lbl">شناسه</span><span class="val">#${toPersianNumberFn(proposal.id)}</span></div>
        <div class="row"><span class="lbl">تاریخ ایجاد</span><span class="val">${proposal.created_at}</span></div>
        <div class="row"><span class="lbl">آخرین بروزرسانی</span><span class="val">${proposal.updated_at}</span></div>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
    <span>کد پروپوزال: ${proposal.code}</span>
  </div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
      saveAs(blob, `پروپوزال_${proposal.code}.doc`);
      toast.success('فایل Word با موفقیت دانلود شد');
    } catch (error) {
      console.error('Word export error:', error);
      toast.error('خطا در ایجاد فایل Word');
    }
    setIsExporting(false);
  };

  const exportToPDF = async () => {
    if (!proposal) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const rfpName = proposal.rfp_code || proposal.rfp_title || '—';
      const universityName = proposal.university_name || '—';
      const researcherName = proposal.primary_researcher_name || '—';

      let attachmentsHtml = '';
      if (proposal.attachments && proposal.attachments.length > 0) {
        attachmentsHtml = proposal.attachments.map(att => 
          `<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;background:#f8fafc;border-radius:4px;border:1px solid #e9ecef;margin-bottom:3px;font-size:11px;">
            <span>📎</span>
            <span>${att.filename || att.file.split('/').pop()}</span>
            <span style="color:#6b7280;">(${(att.size / 1024).toFixed(1)} KB)</span>
          </div>`
        ).join('');
      }

      const pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        padding: 30px;
        background: white;
        font-family: 'Vazir', 'B Nazanin', Tahoma, sans-serif;
        direction: rtl;
        width: 794px;
        margin: 0 auto;
        position: absolute;
        left: -9999px;
        top: 0;
      `;

      pdfContainer.innerHTML = `
        <div style="padding: 25px 30px; background: white; font-family: 'Vazir', 'B Nazanin', Tahoma, sans-serif; direction: rtl; max-width: 794px;">
          <div style="background: #4f46e5; color: white; padding: 25px 30px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 22px; font-weight: 700;">گزارش پروپوزال</div>
            <div style="font-size: 15px; opacity: 0.9; margin-top: 4px;">${proposal.code}</div>
            <div style="margin-top: 6px;">
              <span style="display: inline-block; background: rgba(255,255,255,0.2); padding: 3px 16px; border-radius: 18px; font-size: 12px; font-weight: 500;">
                ${proposal.is_winner ? '🏆 برنده' : 'غیربرنده'}
              </span>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;">
            <div style="background: #eef2ff; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">کد پروپوزال</div>
              <div style="font-size: 13px; font-weight: 700; color: #4f46e5;">${proposal.code}</div>
            </div>
            <div style="background: #d1fae5; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">مدت اجرا</div>
              <div style="font-size: 13px; font-weight: 700; color: #059669;">${toPersianNumberFn(proposal.execution_time)} ماه</div>
            </div>
            <div style="background: ${proposal.is_winner ? '#d1fae5' : '#fee2e2'}; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">وضعیت</div>
              <div style="font-size: 13px; font-weight: 700; color: ${proposal.is_winner ? '#059669' : '#dc2626'};">${proposal.is_winner ? 'برنده' : 'غیربرنده'}</div>
            </div>
            <div style="background: #dbeafe; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">سال</div>
              <div style="font-size: 13px; font-weight: 700; color: #6366f1;">${toPersianNumberFn(proposal.rfp_year || '—')}</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div>
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">اطلاعات پروپوزال</div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">عنوان فارسی</span>
                  <span style="font-weight: 600; color: #4f46e5;">${proposal.title_farsi}</span>
                </div>
                ${proposal.title_english ? `
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">عنوان انگلیسی</span>
                  <span style="font-weight: 500;">${proposal.title_english}</span>
                </div>` : ''}
                ${proposal.keywords ? `
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">کلیدواژه‌ها</span>
                  <span style="font-weight: 500;">${proposal.keywords}</span>
                </div>` : ''}
              </div>
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">پژوهشگر اصلی</div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
                  <span style="color: #6b7280;">نام</span>
                  <span style="font-weight: 600; color: #4f46e5;">${researcherName}</span>
                </div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">دانشگاه</div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
                  <span style="color: #6b7280;">دانشگاه</span>
                  <span style="font-weight: 600; color: #4f46e5;">${universityName}</span>
                </div>
              </div>
            </div>
            <div>
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">تاریخ‌ها</div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">تاریخ ارسال</span>
                  <span style="font-weight: 500;">${proposal.submit_date}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
                  <span style="color: #6b7280;">تاریخ تصویب</span>
                  <span style="font-weight: 500;">${proposal.approved_date || '—'}</span>
                </div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">اطلاعات اجرایی</div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">محل اجرا</span>
                  <span style="font-weight: 500;">${proposal.execution_location}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
                  <span style="color: #6b7280;">مدت اجرا</span>
                  <span style="font-weight: 500;">${toPersianNumberFn(proposal.execution_time)} ماه</span>
                </div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">RFP مرتبط</div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">کد RFP</span>
                  <span style="font-weight: 600; color: #4f46e5;">${proposal.rfp_code || '—'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">عنوان RFP</span>
                  <span style="font-weight: 500;">${proposal.rfp_title || '—'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
                  <span style="color: #6b7280;">سال</span>
                  <span style="font-weight: 500;">${toPersianNumberFn(proposal.rfp_year || '—')}</span>
                </div>
              </div>
              ${proposal.attachments && proposal.attachments.length > 0 ? `
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">فایل‌های پیوست</div>
                ${attachmentsHtml}
              </div>` : ''}
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">اطلاعات تکمیلی</div>
                <div style="display: flex; justify-content: space-between; padding: 2px 0; font-size: 10px; border-bottom: 1px solid #f3f4f6;">
                  <span style="color: #6b7280;">شناسه</span>
                  <span style="font-weight: 500;">#${toPersianNumberFn(proposal.id)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 2px 0; font-size: 10px; border-bottom: 1px solid #f3f4f6;">
                  <span style="color: #6b7280;">تاریخ ایجاد</span>
                  <span style="font-weight: 500;">${proposal.created_at}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 2px 0; font-size: 10px;">
                  <span style="color: #6b7280;">آخرین بروزرسانی</span>
                  <span style="font-weight: 500;">${proposal.updated_at}</span>
                </div>
              </div>
            </div>
          </div>
          <div style="margin-top: 20px; padding-top: 12px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 9px; color: #9ca3af;">
            <span>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
            <span>کد پروپوزال: ${proposal.code}</span>
          </div>
        </div>
      `;

      document.body.appendChild(pdfContainer);

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        height: pdfContainer.scrollHeight,
      });

      document.body.removeChild(pdfContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`پروپوزال_${proposal.code}.pdf`);
      toast.success('فایل PDF با موفقیت دانلود شد');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('خطا در ایجاد فایل PDF');
    }
    setIsExporting(false);
  };

  const exportToExcel = () => {
    if (!proposal) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const data = [
        {
          'کد پروپوزال': proposal.code,
          'عنوان فارسی': proposal.title_farsi,
          'عنوان انگلیسی': proposal.title_english || '',
          'تاریخ ارسال': proposal.submit_date,
          'تاریخ تصویب': proposal.approved_date || '',
          'محل اجرا': proposal.execution_location,
          'مدت اجرا (ماه)': toPersianNumberFn(proposal.execution_time),
          'وضعیت': proposal.is_winner ? 'برنده' : 'غیربرنده',
          'کلیدواژه‌ها': proposal.keywords || '',
          'دانشگاه': proposal.university_name || '',
          'پژوهشگر اصلی': proposal.primary_researcher_name || '',
          'کد RFP': proposal.rfp_code || '',
          'عنوان RFP': proposal.rfp_title || '',
          'سال RFP': toPersianNumberFn(proposal.rfp_year || ''),
          'تاریخ ایجاد': proposal.created_at,
          'آخرین بروزرسانی': proposal.updated_at,
        }
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);

      const colWidths = [
        { wch: 20 }, { wch: 40 }, { wch: 30 }, { wch: 15 },
        { wch: 15 }, { wch: 25 }, { wch: 18 }, { wch: 15 },
        { wch: 30 }, { wch: 30 }, { wch: 25 }, { wch: 20 },
        { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 20 },
      ];

      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'پروپوزال');
      XLSX.writeFile(wb, `پروپوزال_${proposal.code}.xlsx`);
      toast.success('فایل Excel با موفقیت دانلود شد');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('خطا در ایجاد فایل Excel');
    }
    setIsExporting(false);
  };

  const exportXML = () => {
    if (!proposal) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      let attachmentsXml = '';
      if (proposal.attachments && proposal.attachments.length > 0) {
        attachmentsXml = proposal.attachments.map(att => 
          `    <attachment>
      <filename>${att.filename || att.file.split('/').pop()}</filename>
      <file>${att.file}</file>
      <size>${att.size}</size>
      <uploaded_at>${att.uploaded_at}</uploaded_at>
    </attachment>`
        ).join('\n');
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<proposal>
  <header>
    <code>${proposal.code}</code>
    <title_farsi>${proposal.title_farsi}</title_farsi>
    ${proposal.title_english ? `<title_english>${proposal.title_english}</title_english>` : ''}
    <is_winner>${proposal.is_winner}</is_winner>
  </header>
  
  <details>
    <submit_date>${proposal.submit_date}</submit_date>
    ${proposal.approved_date ? `<approved_date>${proposal.approved_date}</approved_date>` : ''}
    <execution_location>${proposal.execution_location}</execution_location>
    <execution_time>${toPersianNumberFn(proposal.execution_time)}</execution_time>
    ${proposal.keywords ? `<keywords>${proposal.keywords}</keywords>` : ''}
  </details>
  
  <university>
    <name>${proposal.university_name || ''}</name>
  </university>
  
  <researcher>
    <primary>${proposal.primary_researcher_name || ''}</primary>
  </researcher>
  
  <rfp>
    <code>${proposal.rfp_code || ''}</code>
    <title>${proposal.rfp_title || ''}</title>
    <year>${toPersianNumberFn(proposal.rfp_year || '')}</year>
  </rfp>
  
  <attachments>
${attachmentsXml}
  </attachments>
  
  <meta>
    <id>${toPersianNumberFn(proposal.id)}</id>
    <created_at>${proposal.created_at}</created_at>
    <updated_at>${proposal.updated_at}</updated_at>
  </meta>
</proposal>`;

      const blob = new Blob([xml], { type: 'text/xml;charset=utf-8' });
      saveAs(blob, `پروپوزال_${proposal.code}.xml`);
      toast.success('فایل XML با موفقیت دانلود شد');
    } catch (error) {
      console.error('XML export error:', error);
      toast.error('خطا در ایجاد فایل XML');
    }
    setIsExporting(false);
  };

  // ========== Print ==========
  const handlePrint = () => {
    setShowExportMenu(false);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // ========== Loading ==========
  if (isLoading) {
    return (
      <div className="proposal-details-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>در حال بارگذاری اطلاعات پروپوزال...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="proposal-details-page">
        <div className="error-container">
          <AlertCircle size={64} />
          <h3>پروپوزال یافت نشد</h3>
          <p>پروپوزال مورد نظر با شناسه {id} در سیستم وجود ندارد</p>
          <button className="btn-back" onClick={() => navigate('/proposal')}>
            <ArrowLeft size={16} />
            بازگشت به لیست پروپوزال‌ها
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="proposal-details-page" ref={contentRef}>
      {/* ========== Header ========== */}
      <div className="details-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/proposal')}>
            <ArrowLeft size={18} />
            بازگشت
          </button>
          <div className="header-title">
            <FileText size={24} className="title-icon" />
            <div>
              <h1>{proposal.code}</h1>
              <span className="proposal-subject-header">{proposal.title_farsi}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <span
            className={`status-badge-large ${proposal.is_winner ? 'winner' : 'not-winner'}`}
            style={{
              backgroundColor: proposal.is_winner ? '#d1fae5' : '#fee2e2',
              color: proposal.is_winner ? '#059669' : '#dc2626',
            }}
          >
            {proposal.is_winner ? (
              <><Trophy size={16} /> برنده</>
            ) : (
              <><XCircle size={16} /> غیربرنده</>
            )}
          </span>
        </div>
      </div>

      {/* ========== Action Bar ========== */}
      <div className="action-bar">
        <div className="action-bar-left">
          <button className="action-btn primary" onClick={handleEdit}>
            <Edit size={16} />
            ویرایش
          </button>
          <button className="action-btn danger" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 size={16} />
            حذف
          </button>
        </div>
        <div className="action-bar-right">
          {/* <button className="action-btn" onClick={handlePrint}>
            <Printer size={16} />
            چاپ
          </button> */}
          <div className="export-wrapper">
            <button
              className="action-btn primary"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {isExporting ? 'در حال خروجی‌گیری...' : 'خروجی'}
              <ChevronDown size={14} />
            </button>
            {showExportMenu && (
              <div className="export-menu">
                <div className="export-group-label">اسناد رسمی</div>
                <button onClick={exportToPDF} disabled={isExporting}>
                  <FileText size={16} /> PDF
                  <span className="export-desc">سند قابل چاپ</span>
                </button>
                <button onClick={exportToWord} disabled={isExporting}>
                  <FileText size={16} /> Word
                  <span className="export-desc">قابل ویرایش در ورد</span>
                </button>
                <button onClick={exportToExcel} disabled={isExporting}>
                  <FileSpreadsheet size={16} /> Excel
                  <span className="export-desc">داده‌های عددی</span>
                </button>
                <div className="export-group-label">وب و متن</div>
                <button onClick={exportHTML} disabled={isExporting}>
                  <FileText size={16} /> HTML
                  <span className="export-desc">صفحه وب</span>
                </button>
                <button onClick={exportTXT} disabled={isExporting}>
                  <FileText size={16} /> TXT
                  <span className="export-desc">متن ساده</span>
                </button>
                <div className="export-group-label">داده و تبادل</div>
                <button onClick={exportJSON} disabled={isExporting}>
                  <FileText size={16} /> JSON
                  <span className="export-desc">داده‌های ساختاریافته</span>
                </button>
                <button onClick={exportXML} disabled={isExporting}>
                  <FileText size={16} /> XML
                  <span className="export-desc">تبادل داده</span>
                </button>
                <button onClick={exportCSV} disabled={isExporting}>
                  <FileText size={16} /> CSV
                  <span className="export-desc">صفحات گسترده</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== Content ========== */}
      <div className="details-content">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <Tag size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">کد پروپوزال</span>
              <span className="summary-value">{proposal.code}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#d1fae5', color: '#059669' }}>
              <Clock size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">مدت اجرا</span>
              <span className="summary-value">{toPersianNumberFn(proposal.execution_time)} ماه</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: proposal.is_winner ? '#d1fae5' : '#fee2e2', color: proposal.is_winner ? '#059669' : '#dc2626' }}>
              {proposal.is_winner ? <Trophy size={20} /> : <XCircle size={20} />}
            </div>
            <div className="summary-info">
              <span className="summary-label">وضعیت</span>
              <span className="summary-value">{proposal.is_winner ? 'برنده' : 'غیربرنده'}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
              <Calendar size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">سال</span>
              <span className="summary-value">{toPersianNumberFn(proposal.rfp_year || '—')}</span>
            </div>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-column">
            {/* Proposal Info */}
            <div className="info-section">
              <h3><FileText size={18} /> اطلاعات پروپوزال</h3>
              <div className="info-row-detail">
                <span className="info-label">عنوان فارسی</span>
                <span className="info-value highlight">{proposal.title_farsi}</span>
              </div>
              {proposal.title_english && (
                <div className="info-row-detail">
                  <span className="info-label">عنوان انگلیسی</span>
                  <span className="info-value">{proposal.title_english}</span>
                </div>
              )}
              {proposal.keywords && (
                <div className="info-row-detail">
                  <span className="info-label">کلیدواژه‌ها</span>
                  <span className="info-value">{proposal.keywords}</span>
                </div>
              )}
            </div>

            {/* Primary Researcher */}
            <div className="info-section">
              <h3><User size={18} /> پژوهشگر اصلی</h3>
              <div className="info-row-detail">
                <span className="info-label">نام</span>
                <span className="info-value highlight">{proposal.primary_researcher_name || '—'}</span>
              </div>
            </div>

            {/* University */}
            <div className="info-section">
              <h3><Building2 size={18} /> دانشگاه</h3>
              <div className="info-row-detail">
                <span className="info-label">دانشگاه</span>
                <span className="info-value highlight">{proposal.university_name || '—'}</span>
              </div>
            </div>

            {/* Company */}
            {proposal.company_name && (
              <div className="info-section">
                <h3><Building2 size={18} /> شرکت</h3>
                <div className="info-row-detail">
                  <span className="info-label">شرکت</span>
                  <span className="info-value">{proposal.company_name}</span>
                </div>
              </div>
            )}
          </div>

          <div className="info-column">
            {/* Dates */}
            <div className="info-section">
              <h3><Calendar size={18} /> تاریخ‌ها</h3>
              <div className="info-row-detail">
                <span className="info-label">تاریخ ارسال</span>
                <span className="info-value">{proposal.submit_date}</span>
              </div>
              <div className="info-row-detail">
                <span className="info-label">تاریخ تصویب</span>
                <span className="info-value">{proposal.approved_date || '—'}</span>
              </div>
            </div>

            {/* Execution Info */}
            <div className="info-section">
              <h3><MapPin size={18} /> اطلاعات اجرایی</h3>
              <div className="info-row-detail">
                <span className="info-label">محل اجرا</span>
                <span className="info-value">{proposal.execution_location}</span>
              </div>
              <div className="info-row-detail">
                <span className="info-label">مدت اجرا</span>
                <span className="info-value">{toPersianNumberFn(proposal.execution_time)} ماه</span>
              </div>
            </div>

            {/* Related RFP */}
            <div className="info-section">
              <h3><FileText size={18} /> RFP مرتبط</h3>
              <div className="info-row-detail">
                <span className="info-label">کد RFP</span>
                <span className="info-value highlight">{proposal.rfp_code || '—'}</span>
              </div>
              <div className="info-row-detail">
                <span className="info-label">عنوان RFP</span>
                <span className="info-value">{proposal.rfp_title || '—'}</span>
              </div>
              <div className="info-row-detail">
                <span className="info-label">سال</span>
                <span className="info-value">{toPersianNumberFn(proposal.rfp_year || '—')}</span>
              </div>
            </div>

            {/* Files */}
            {proposal.attachments && proposal.attachments.length > 0 && (
              <div className="info-section">
                <h3><Paperclip size={18} /> فایل‌های پیوست</h3>
                <div className="files-list">
                  {proposal.attachments.map((att) => (
                    <div key={att.id} className="file-item">
                      <Paperclip size={16} className="file-icon" />
                      <span className="file-label">{att.filename || att.file.split('/').pop()}</span>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>
                        {(att.size / 1024).toFixed(1)} KB
                      </span>
                      <div className="file-actions">
                        <a href={att.file} target="_blank" rel="noopener noreferrer" className="file-action" title="مشاهده">
                          <Eye size={14} />
                        </a>
                        <a href={att.file} download className="file-action" title="دانلود">
                          <Download size={14} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="info-section meta">
              <div className="meta-row"><span className="meta-label">شناسه</span><span className="meta-value">#{toPersianNumberFn(proposal.id)}</span></div>
              <div className="meta-row"><span className="meta-label">تاریخ ایجاد</span><span className="meta-value">{proposal.created_at}</span></div>
              <div className="meta-row"><span className="meta-label">آخرین بروزرسانی</span><span className="meta-value">{proposal.updated_at}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Modal Edit ========== */}
      {editFormOpen && proposal && (
        <div className="modal-overlay" onClick={handleEditCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ProposalForm
              initialData={proposal}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          </div>
        </div>
      )}

      <style>{`
        .proposal-details-page {
          padding: 24px;
          min-height: 100vh;
          background: #f8fafc;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e9ecef;
          border-top-color: #4f46e5;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 12px;
          text-align: center;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding: 20px 24px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          background: white;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .btn-back:hover {
          background: #f8fafc;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-icon {
          color: #4f46e5;
        }

        .header-title h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: #1a1a2e;
        }

        .proposal-subject-header {
          font-size: 14px;
          color: #6b7280;
          display: block;
        }

        .status-badge-large {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 24px;
          font-size: 14px;
          font-weight: 600;
        }

        .status-badge-large.winner {
          background: #d1fae5;
          color: #059669;
        }

        .status-badge-large.not-winner {
          background: #fee2e2;
          color: #dc2626;
        }

        .action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 12px 16px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          flex-wrap: wrap;
          gap: 12px;
        }

        .action-bar-left, .action-bar-right {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          background: white;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
          font-weight: 500;
        }

        .action-btn:hover {
          background: #f8fafc;
        }

        .action-btn.primary {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }

        .action-btn.primary:hover {
          background: #4338ca;
        }

        .action-btn.danger {
          color: #dc2626;
          border-color: #fecaca;
        }

        .action-btn.danger:hover {
          background: #fee2e2;
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .export-wrapper {
          position: relative;
        }

        .export-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          min-width: 220px;
          z-index: 100;
          overflow: hidden;
          padding: 8px 0;
        }

        .export-group-label {
          padding: 8px 16px 4px 16px;
          font-size: 11px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #f3f4f6;
          margin-bottom: 4px;
        }

        .export-group-label:not(:first-child) {
          margin-top: 8px;
          border-top: 1px solid #f3f4f6;
          padding-top: 12px;
        }

        .export-menu button {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 16px;
          border: none;
          background: transparent;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          text-align: right;
          font-weight: 500;
        }

        .export-menu button:hover {
          background: #f3f4f6;
        }

        .export-menu button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .export-menu button .export-desc {
          font-size: 11px;
          color: #9ca3af;
          font-weight: 400;
          margin-right: auto;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {
          .modal-content {
            margin: 10px;
            max-width: 100%;
          }
        }

        .details-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          transition: all 0.2s;
        }

        .summary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .summary-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .summary-info {
          display: flex;
          flex-direction: column;
        }

        .summary-label {
          font-size: 12px;
          color: #6b7280;
        }

        .summary-value {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .info-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-section {
          padding: 16px 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .info-section h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 12px 0;
        }

        .info-row-detail {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 13px;
        }

        .info-row-detail:last-child {
          border-bottom: none;
        }

        .info-label {
          color: #6b7280;
        }

        .info-value {
          font-weight: 500;
          color: #1a1a2e;
        }

        .info-value.highlight {
          color: #4f46e5;
          font-weight: 600;
        }

        .files-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: #f8fafc;
          border: 1px solid #e9ecef;
          border-radius: 8px;
        }

        .file-item .file-icon {
          color: #6b7280;
        }

        .file-item .file-label {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a2e;
          flex: 1;
        }

        .file-item .file-actions {
          display: flex;
          gap: 4px;
        }

        .file-item .file-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .file-item .file-action:hover {
          background: #f3f4f6;
          color: #4f46e5;
        }

        .info-section.meta {
          background: #f8fafc;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 12px;
        }

        .meta-label {
          color: #6b7280;
        }

        .meta-value {
          color: #1a1a2e;
          font-weight: 500;
        }

        @media (max-width: 1024px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .proposal-details-page {
            padding: 12px;
          }

          .details-header {
            flex-direction: column;
            padding: 16px;
          }

          .header-left {
            width: 100%;
          }

          .header-title h1 {
            font-size: 18px;
          }

          .action-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .action-bar-left, .action-bar-right {
            justify-content: center;
          }

          .summary-cards {
            grid-template-columns: 1fr 1fr;
          }

          .export-menu {
            position: fixed;
            top: auto;
            bottom: 0;
            right: 0;
            left: 0;
            border-radius: 16px 16px 0 0;
            max-height: 70vh;
            overflow-y: auto;
            min-width: unset;
            width: 100%;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
            padding: 12px 0 20px 0;
          }

          .export-menu button {
            padding: 12px 20px;
            font-size: 15px;
          }

          .export-group-label {
            padding: 12px 20px 4px 20px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }

        @media print {
          .proposal-details-page {
            background: white;
            padding: 20px;
          }

          .action-bar, .btn-back, .export-wrapper {
            display: none !important;
          }

          .details-header {
            box-shadow: none;
            border-bottom: 2px solid #e9ecef;
          }

          .info-section {
            border: 1px solid #e9ecef;
            break-inside: avoid;
          }

          .summary-card {
            border: 1px solid #e9ecef;
          }
        }
      `}</style>
    </div>
  );
};

export default ProposalDetailsPage;