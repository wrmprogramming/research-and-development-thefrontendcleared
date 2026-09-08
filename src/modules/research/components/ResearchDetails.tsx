// src/modules/research/pages/ResearchDetailsPage.tsx

import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResearch } from '../hooks/useResearch';
import { RESEARCH_STATUSES } from '../types/research.types';
import { formatCurrency, toPersianNumber } from '../../../utils/formatter.utils';
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Building2,
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
  Layers,
  BarChart3,
  TrendingUp,
  Loader2,
  GraduationCap,
  User,
  Users,
  Briefcase,
  Tag,
  Hash,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { ResearchForm } from '../components/ResearchForm';

interface ResearchDetailsPageProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

const toPersianNumberFn = (num: any): string => {
  if (num === undefined || num === null || num === '') return '۰';
  return toPersianNumber(num);
};

const toNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  return 0;
};

export const ResearchDetailsPage: React.FC<ResearchDetailsPageProps> = ({ onEdit, onDelete }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useItem, delete: deleteResearch, isDeleting } = useResearch();
  
  const { data: research, isLoading, refetch } = useItem(Number(id));
  
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // ========== Handle Delete ==========
  const handleDelete = async () => {
    if (window.confirm('آیا از حذف این پژوهش مطمئن هستید؟')) {
      await deleteResearch(Number(id));
      navigate('/research');
      toast.success('پژوهش با موفقیت حذف شد');
    }
  };

  // ========== Handle Edit ==========
  const handleEdit = () => {
    setEditFormOpen(true);
  };

  const handleEditSuccess = () => {
    setEditFormOpen(false);
    refetch();
    toast.success('پژوهش با موفقیت ویرایش شد');
  };

  const handleEditCancel = () => {
    setEditFormOpen(false);
  };

  // ========== Export Functions ==========
  const exportHTML = () => {
    if (!research) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const statusInfo = RESEARCH_STATUSES[research.status];
      const researcherName = research.primary_researcher_name || '—';
      const universityName = research.university_name || '—';
      const companyName = research.company_name || '—';

      let attachmentsHtml = '';
      if (research.attachments && research.attachments.length > 0) {
        attachmentsHtml = research.attachments.map(att => 
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
  <title>پژوهش ${research.code}</title>
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
    <h1>📄 گزارش پژوهش</h1>
    <div class="sub">${research.code}</div>
    <div class="status">${statusInfo?.label || research.status}</div>
  </div>
  <div class="cards">
    <div class="card blue"><div class="lbl">کد پژوهش</div><div class="val">${research.code}</div></div>
    <div class="card green"><div class="lbl">سال</div><div class="val">${toPersianNumberFn(research.year)}</div></div>
    <div class="card orange"><div class="lbl">بودجه</div><div class="val">${toPersianNumberFn(Number(research.budget))} ریال</div></div>
    <div class="card purple"><div class="lbl">وضعیت</div><div class="val">${statusInfo?.label || research.status}</div></div>
  </div>
  <div class="grid">
    <div>
      <div class="section"><h3>📋 اطلاعات پژوهش</h3>
        <div class="row"><span class="lbl">عنوان</span><span class="val highlight">${research.title}</span></div>
        ${research.description ? `<div class="row"><span class="lbl">توضیحات</span><span class="val">${research.description}</span></div>` : ''}
      </div>
      <div class="section"><h3>👤 پژوهشگر اصلی</h3>
        <div class="row"><span class="lbl">نام</span><span class="val highlight">${researcherName}</span></div>
      </div>
      <div class="section"><h3>📅 تاریخ‌ها</h3>
        <div class="row"><span class="lbl">تاریخ تصویب</span><span class="val">${research.approve_date}</span></div>
        <div class="row"><span class="lbl">تاریخ شروع</span><span class="val">${research.start_date}</span></div>
        <div class="row"><span class="lbl">تاریخ پایان</span><span class="val">${research.end_date}</span></div>
      </div>
    </div>
    <div>
      <div class="section"><h3>🏢 همکاران</h3>
        <div class="row"><span class="lbl">نوع همکار</span><span class="val">${research.affiliation_type === 'UNIVERSITY' ? 'دانشگاه' : 'شرکت'}</span></div>
        ${research.affiliation_type === 'UNIVERSITY' ? `
        <div class="row"><span class="lbl">دانشگاه</span><span class="val highlight">${universityName}</span></div>
        ` : `
        <div class="row"><span class="lbl">شرکت</span><span class="val highlight">${companyName}</span></div>
        `}
        ${research.researchers ? `<div class="row"><span class="lbl">همکاران</span><span class="val">${research.researchers}</span></div>` : ''}
      </div>
      ${research.attachments && research.attachments.length > 0 ? `
      <div class="attachments-section">
        <h3>📎 فایل‌های پیوست</h3>
        ${attachmentsHtml}
      </div>` : ''}
      <div class="section meta-section"><h3>📋 اطلاعات تکمیلی</h3>
        <div class="row"><span class="lbl">شناسه</span><span class="val">#${toPersianNumberFn(research.id)}</span></div>
        <div class="row"><span class="lbl">تاریخ ایجاد</span><span class="val">${research.created_at}</span></div>
        <div class="row"><span class="lbl">آخرین بروزرسانی</span><span class="val">${research.updated_at}</span></div>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>📅 تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
    <span>📄 کد پژوهش: ${research.code}</span>
  </div>
</div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      saveAs(blob, `پژوهش_${research.code}.html`);
      toast.success('فایل HTML با موفقیت دانلود شد');
    } catch (error) {
      console.error('HTML export error:', error);
      toast.error('خطا در ایجاد فایل HTML');
    }
    setIsExporting(false);
  };

  const exportJSON = () => {
    if (!research) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const data = {
        code: research.code,
        title: research.title,
        description: research.description || null,
        year: research.year,
        budget: Number(research.budget),
        status: research.status,
        approve_date: research.approve_date,
        start_date: research.start_date,
        end_date: research.end_date,
        primary_researcher: research.primary_researcher_name || null,
        affiliation_type: research.affiliation_type,
        university: research.university_name || null,
        company: research.company_name || null,
        researchers: research.researchers || null,
        created_at: research.created_at,
        updated_at: research.updated_at,
        attachments: research.attachments?.map(att => ({
          id: att.id,
          filename: att.filename,
          file: att.file,
          size: att.size,
          uploaded_at: att.uploaded_at
        })) || []
      };

      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
      saveAs(blob, `پژوهش_${research.code}.json`);
      toast.success('فایل JSON با موفقیت دانلود شد');
    } catch (error) {
      console.error('JSON export error:', error);
      toast.error('خطا در ایجاد فایل JSON');
    }
    setIsExporting(false);
  };

  const exportCSV = () => {
    if (!research) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const statusInfo = RESEARCH_STATUSES[research.status];
      const rows = [
        ['فیلد', 'مقدار'],
        ['کد پژوهش', research.code],
        ['عنوان', research.title],
        ['توضیحات', research.description || ''],
        ['سال', toPersianNumberFn(research.year)],
        ['بودجه', toPersianNumberFn(Number(research.budget))],
        ['وضعیت', statusInfo?.label || research.status],
        ['تاریخ تصویب', research.approve_date],
        ['تاریخ شروع', research.start_date],
        ['تاریخ پایان', research.end_date],
        ['پژوهشگر اصلی', research.primary_researcher_name || '—'],
        ['نوع همکار', research.affiliation_type === 'UNIVERSITY' ? 'دانشگاه' : 'شرکت'],
        ['دانشگاه/شرکت', research.affiliation_type === 'UNIVERSITY' ? research.university_name : research.company_name || '—'],
        ['همکاران', research.researchers || ''],
        ['تاریخ ایجاد', research.created_at],
        ['آخرین بروزرسانی', research.updated_at],
      ];

      const csvContent = rows.map(row => row.join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `پژوهش_${research.code}.csv`);
      toast.success('فایل CSV با موفقیت دانلود شد');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('خطا در ایجاد فایل CSV');
    }
    setIsExporting(false);
  };

  const exportTXT = () => {
    if (!research) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const statusInfo = RESEARCH_STATUSES[research.status];

      let attachmentsText = '';
      if (research.attachments && research.attachments.length > 0) {
        attachmentsText = research.attachments.map(att => 
          `  - ${att.filename || att.file.split('/').pop()} (${(att.size / 1024).toFixed(1)} KB)`
        ).join('\n');
      }

      const text = `
═══════════════════════════════════════════════════════════
                    گزارش پژوهش
═══════════════════════════════════════════════════════════

کد پژوهش: ${research.code}
عنوان: ${research.title}
${research.description ? `توضیحات: ${research.description}` : ''}
سال: ${toPersianNumberFn(research.year)}
بودجه: ${toPersianNumberFn(Number(research.budget))} ریال
وضعیت: ${statusInfo?.label || research.status}

───────────────────────────────────────────────────────────
                    پژوهشگر اصلی
───────────────────────────────────────────────────────────

${research.primary_researcher_name || 'نامشخص'}

───────────────────────────────────────────────────────────
                    تاریخ‌ها
───────────────────────────────────────────────────────────

تاریخ تصویب: ${research.approve_date}
تاریخ شروع: ${research.start_date}
تاریخ پایان: ${research.end_date}

───────────────────────────────────────────────────────────
                    همکاران
───────────────────────────────────────────────────────────

نوع همکار: ${research.affiliation_type === 'UNIVERSITY' ? 'دانشگاه' : 'شرکت'}
${research.affiliation_type === 'UNIVERSITY' ? `دانشگاه: ${research.university_name || '—'}` : `شرکت: ${research.company_name || '—'}`}
${research.researchers ? `همکاران: ${research.researchers}` : ''}

${attachmentsText ? `───────────────────────────────────────────────────────────
فایل‌های پیوست:
${attachmentsText}
` : ''}
═══════════════════════════════════════════════════════════
تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}
═══════════════════════════════════════════════════════════
`;

      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `پژوهش_${research.code}.txt`);
      toast.success('فایل TXT با موفقیت دانلود شد');
    } catch (error) {
      console.error('TXT export error:', error);
      toast.error('خطا در ایجاد فایل TXT');
    }
    setIsExporting(false);
  };

  const exportToWord = () => {
    if (!research) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const statusInfo = RESEARCH_STATUSES[research.status];
      const researcherName = research.primary_researcher_name || '—';
      const universityName = research.university_name || '—';
      const companyName = research.company_name || '—';

      let attachmentsHtml = '';
      if (research.attachments && research.attachments.length > 0) {
        attachmentsHtml = research.attachments.map(att => 
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
  <title>پژوهش ${research.code}</title>
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
    <h1>گزارش پژوهش</h1>
    <div class="sub">${research.code}</div>
    <div class="status">${statusInfo?.label || research.status}</div>
  </div>
  <div class="cards">
    <div class="card" style="background:#eef2ff;"><div class="lbl">کد پژوهش</div><div class="val" style="color:#4f46e5;">${research.code}</div></div>
    <div class="card" style="background:#d1fae5;"><div class="lbl">سال</div><div class="val" style="color:#059669;">${toPersianNumberFn(research.year)}</div></div>
    <div class="card" style="background:#fef3c7;"><div class="lbl">بودجه</div><div class="val" style="color:#d97706;">${toPersianNumberFn(Number(research.budget))} ریال</div></div>
    <div class="card" style="background:#dbeafe;"><div class="lbl">وضعیت</div><div class="val" style="color:#6366f1;">${statusInfo?.label || research.status}</div></div>
  </div>
  <div class="grid">
    <div>
      <div class="section"><h3>اطلاعات پژوهش</h3>
        <div class="row"><span class="lbl">عنوان</span><span class="val highlight">${research.title}</span></div>
        ${research.description ? `<div class="row"><span class="lbl">توضیحات</span><span class="val">${research.description}</span></div>` : ''}
      </div>
      <div class="section"><h3>پژوهشگر اصلی</h3>
        <div class="row"><span class="lbl">نام</span><span class="val highlight">${researcherName}</span></div>
      </div>
      <div class="section"><h3>تاریخ‌ها</h3>
        <div class="row"><span class="lbl">تاریخ تصویب</span><span class="val">${research.approve_date}</span></div>
        <div class="row"><span class="lbl">تاریخ شروع</span><span class="val">${research.start_date}</span></div>
        <div class="row"><span class="lbl">تاریخ پایان</span><span class="val">${research.end_date}</span></div>
      </div>
    </div>
    <div>
      <div class="section"><h3>همکاران</h3>
        <div class="row"><span class="lbl">نوع همکار</span><span class="val">${research.affiliation_type === 'UNIVERSITY' ? 'دانشگاه' : 'شرکت'}</span></div>
        ${research.affiliation_type === 'UNIVERSITY' ? `
        <div class="row"><span class="lbl">دانشگاه</span><span class="val highlight">${universityName}</span></div>
        ` : `
        <div class="row"><span class="lbl">شرکت</span><span class="val highlight">${companyName}</span></div>
        `}
        ${research.researchers ? `<div class="row"><span class="lbl">همکاران</span><span class="val">${research.researchers}</span></div>` : ''}
      </div>
      ${research.attachments && research.attachments.length > 0 ? `
      <div class="attachments-section">
        <h3>فایل‌های پیوست</h3>
        ${attachmentsHtml}
      </div>` : ''}
      <div class="section meta-section"><h3>اطلاعات تکمیلی</h3>
        <div class="row"><span class="lbl">شناسه</span><span class="val">#${toPersianNumberFn(research.id)}</span></div>
        <div class="row"><span class="lbl">تاریخ ایجاد</span><span class="val">${research.created_at}</span></div>
        <div class="row"><span class="lbl">آخرین بروزرسانی</span><span class="val">${research.updated_at}</span></div>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
    <span>کد پژوهش: ${research.code}</span>
  </div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
      saveAs(blob, `پژوهش_${research.code}.doc`);
      toast.success('فایل Word با موفقیت دانلود شد');
    } catch (error) {
      console.error('Word export error:', error);
      toast.error('خطا در ایجاد فایل Word');
    }
    setIsExporting(false);
  };

  const exportToPDF = async () => {
    if (!research) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const statusInfo = RESEARCH_STATUSES[research.status];
      const researcherName = research.primary_researcher_name || '—';
      const universityName = research.university_name || '—';
      const companyName = research.company_name || '—';

      let attachmentsHtml = '';
      if (research.attachments && research.attachments.length > 0) {
        attachmentsHtml = research.attachments.map(att => 
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
            <div style="font-size: 22px; font-weight: 700;">گزارش پژوهش</div>
            <div style="font-size: 15px; opacity: 0.9; margin-top: 4px;">${research.code}</div>
            <div style="margin-top: 6px;">
              <span style="display: inline-block; background: rgba(255,255,255,0.2); padding: 3px 16px; border-radius: 18px; font-size: 12px; font-weight: 500;">
                ${statusInfo?.label || research.status}
              </span>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;">
            <div style="background: #eef2ff; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">کد پژوهش</div>
              <div style="font-size: 13px; font-weight: 700; color: #4f46e5;">${research.code}</div>
            </div>
            <div style="background: #d1fae5; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">سال</div>
              <div style="font-size: 13px; font-weight: 700; color: #059669;">${toPersianNumberFn(research.year)}</div>
            </div>
            <div style="background: #fef3c7; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">بودجه</div>
              <div style="font-size: 13px; font-weight: 700; color: #d97706;">${toPersianNumberFn(Number(research.budget))} ریال</div>
            </div>
            <div style="background: #dbeafe; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">وضعیت</div>
              <div style="font-size: 13px; font-weight: 700; color: #6366f1;">${statusInfo?.label || research.status}</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div>
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">اطلاعات پژوهش</div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">عنوان</span>
                  <span style="font-weight: 600; color: #4f46e5;">${research.title}</span>
                </div>
                ${research.description ? `
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">توضیحات</span>
                  <span style="font-weight: 500;">${research.description}</span>
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
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">تاریخ‌ها</div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">تاریخ تصویب</span>
                  <span style="font-weight: 500;">${research.approve_date}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">تاریخ شروع</span>
                  <span style="font-weight: 500;">${research.start_date}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
                  <span style="color: #6b7280;">تاریخ پایان</span>
                  <span style="font-weight: 500;">${research.end_date}</span>
                </div>
              </div>
            </div>
            <div>
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">همکاران</div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">نوع همکار</span>
                  <span style="font-weight: 500;">${research.affiliation_type === 'UNIVERSITY' ? 'دانشگاه' : 'شرکت'}</span>
                </div>
                ${research.affiliation_type === 'UNIVERSITY' ? `
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">دانشگاه</span>
                  <span style="font-weight: 600; color: #4f46e5;">${universityName}</span>
                </div>` : `
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">شرکت</span>
                  <span style="font-weight: 600; color: #4f46e5;">${companyName}</span>
                </div>`}
                ${research.researchers ? `
                <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
                  <span style="color: #6b7280;">همکاران</span>
                  <span style="font-weight: 500;">${research.researchers}</span>
                </div>` : ''}
              </div>
              ${research.attachments && research.attachments.length > 0 ? `
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">فایل‌های پیوست</div>
                ${attachmentsHtml}
              </div>` : ''}
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">اطلاعات تکمیلی</div>
                <div style="display: flex; justify-content: space-between; padding: 2px 0; font-size: 10px; border-bottom: 1px solid #f3f4f6;">
                  <span style="color: #6b7280;">شناسه</span>
                  <span style="font-weight: 500;">#${toPersianNumberFn(research.id)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 2px 0; font-size: 10px; border-bottom: 1px solid #f3f4f6;">
                  <span style="color: #6b7280;">تاریخ ایجاد</span>
                  <span style="font-weight: 500;">${research.created_at}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 2px 0; font-size: 10px;">
                  <span style="color: #6b7280;">آخرین بروزرسانی</span>
                  <span style="font-weight: 500;">${research.updated_at}</span>
                </div>
              </div>
            </div>
          </div>
          <div style="margin-top: 20px; padding-top: 12px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 9px; color: #9ca3af;">
            <span>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
            <span>کد پژوهش: ${research.code}</span>
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

      pdf.save(`پژوهش_${research.code}.pdf`);
      toast.success('فایل PDF با موفقیت دانلود شد');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('خطا در ایجاد فایل PDF');
    }
    setIsExporting(false);
  };

  const exportToExcel = () => {
    if (!research) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const statusInfo = RESEARCH_STATUSES[research.status];
      const data = [
        {
          'کد پژوهش': research.code,
          'عنوان': research.title,
          'توضیحات': research.description || '',
          'سال': toPersianNumberFn(research.year),
          'بودجه (ریال)': toPersianNumberFn(Number(research.budget)),
          'وضعیت': statusInfo?.label || research.status,
          'تاریخ تصویب': research.approve_date,
          'تاریخ شروع': research.start_date,
          'تاریخ پایان': research.end_date,
          'پژوهشگر اصلی': research.primary_researcher_name || '—',
          'نوع همکار': research.affiliation_type === 'UNIVERSITY' ? 'دانشگاه' : 'شرکت',
          'دانشگاه/شرکت': research.affiliation_type === 'UNIVERSITY' ? research.university_name : research.company_name || '—',
          'همکاران': research.researchers || '',
          'تاریخ ایجاد': research.created_at,
          'آخرین بروزرسانی': research.updated_at,
        }
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);

      const colWidths = [
        { wch: 20 }, { wch: 40 }, { wch: 50 }, { wch: 12 },
        { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 30 },
        { wch: 40 }, { wch: 20 }, { wch: 20 },
      ];

      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'پژوهش');
      XLSX.writeFile(wb, `پژوهش_${research.code}.xlsx`);
      toast.success('فایل Excel با موفقیت دانلود شد');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('خطا در ایجاد فایل Excel');
    }
    setIsExporting(false);
  };

  const exportXML = () => {
    if (!research) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const statusInfo = RESEARCH_STATUSES[research.status];

      let attachmentsXml = '';
      if (research.attachments && research.attachments.length > 0) {
        attachmentsXml = research.attachments.map(att => 
          `    <attachment>
      <id>${att.id}</id>
      <filename>${att.filename || att.file.split('/').pop()}</filename>
      <file>${att.file}</file>
      <size>${att.size}</size>
      <uploaded_at>${att.uploaded_at}</uploaded_at>
    </attachment>`
        ).join('\n');
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<research>
  <header>
    <code>${research.code}</code>
    <title>${research.title}</title>
    <status>${statusInfo?.label || research.status}</status>
    <status_code>${research.status}</status_code>
    <year>${toPersianNumberFn(research.year)}</year>
  </header>
  
  <details>
    <description>${research.description || ''}</description>
    <budget>${toPersianNumberFn(Number(research.budget))}</budget>
    <approve_date>${research.approve_date}</approve_date>
    <start_date>${research.start_date}</start_date>
    <end_date>${research.end_date}</end_date>
  </details>
  
  <researcher>
    <primary>${research.primary_researcher_name || ''}</primary>
    <affiliation_type>${research.affiliation_type}</affiliation_type>
    ${research.affiliation_type === 'UNIVERSITY' ? `<university>${research.university_name || ''}</university>` : `<company>${research.company_name || ''}</company>`}
    <collaborators>${research.researchers || ''}</collaborators>
  </researcher>
  
  <attachments>
${attachmentsXml}
  </attachments>
  
  <meta>
    <id>${toPersianNumberFn(research.id)}</id>
    <created_at>${research.created_at}</created_at>
    <updated_at>${research.updated_at}</updated_at>
  </meta>
</research>`;

      const blob = new Blob([xml], { type: 'text/xml;charset=utf-8' });
      saveAs(blob, `پژوهش_${research.code}.xml`);
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
      <div className="research-details-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>در حال بارگذاری اطلاعات پژوهش...</p>
        </div>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="research-details-page">
        <div className="error-container">
          <AlertCircle size={64} />
          <h3>پژوهش یافت نشد</h3>
          <p>پژوهش مورد نظر با شناسه {id} در سیستم وجود ندارد</p>
          <button className="btn-back" onClick={() => navigate('/research')}>
            <ArrowLeft size={16} />
            بازگشت به لیست پژوهش‌ها
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = RESEARCH_STATUSES[research.status];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return CheckCircle;
      case 'IN_PROGRESS': return Clock;
      case 'DRAFT': return Edit;
      default: return Clock;
    }
  };

  const StatusIcon = getStatusIcon(research.status);

  return (
    <div className="research-details-page" ref={contentRef}>
      {/* ========== Header ========== */}
      <div className="details-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/research')}>
            <ArrowLeft size={18} />
            بازگشت
          </button>
          <div className="header-title">
            <FileText size={24} className="title-icon" />
            <div>
              <h1>{research.code}</h1>
              <span className="research-subject-header">{research.title}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <span
            className="status-badge-large"
            style={{
              backgroundColor: statusInfo?.color + '20',
              color: statusInfo?.color,
            }}
          >
            <StatusIcon size={16} />
            {statusInfo?.label || research.status}
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
              <Hash size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">کد پژوهش</span>
              <span className="summary-value">{research.code}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#d1fae5', color: '#059669' }}>
              <Calendar size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">سال</span>
              <span className="summary-value">{toPersianNumberFn(research.year)}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <DollarSign size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">بودجه</span>
              <span className="summary-value">{toPersianNumberFn(Number(research.budget))} ریال</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
              <User size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">پژوهشگر اصلی</span>
              <span className="summary-value">{research.primary_researcher_name || '—'}</span>
            </div>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-column">
            {/* Research Info */}
            <div className="info-section">
              <h3><FileText size={18} /> اطلاعات پژوهش</h3>
              <div className="info-row-detail">
                <span className="info-label">عنوان</span>
                <span className="info-value highlight">{research.title}</span>
              </div>
              {research.description && (
                <div className="info-row-detail">
                  <span className="info-label">توضیحات</span>
                  <p className={`description-text ${showFullDescription ? 'expanded' : ''}`}>
                    {research.description}
                  </p>
                  {research.description.length > 200 && (
                    <button className="toggle-description" onClick={() => setShowFullDescription(!showFullDescription)}>
                      {showFullDescription ? (
                        <>مشاهده کمتر <ChevronUp size={14} /></>
                      ) : (
                        <>مشاهده بیشتر <ChevronDown size={14} /></>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Primary Researcher */}
            <div className="info-section">
              <h3><User size={18} /> پژوهشگر اصلی</h3>
              <div className="info-row-detail">
                <span className="info-label">نام</span>
                <span className="info-value highlight">{research.primary_researcher_name || '—'}</span>
              </div>
            </div>

            {/* Dates */}
            <div className="info-section">
              <h3><Calendar size={18} /> تاریخ‌ها</h3>
              <div className="info-row-detail">
                <span className="info-label">تاریخ تصویب</span>
                <span className="info-value">{research.approve_date}</span>
              </div>
              <div className="info-row-detail">
                <span className="info-label">تاریخ شروع</span>
                <span className="info-value">{research.start_date}</span>
              </div>
              <div className="info-row-detail">
                <span className="info-label">تاریخ پایان</span>
                <span className="info-value">{research.end_date}</span>
              </div>
            </div>
          </div>

          <div className="info-column">
            {/* Collaborators */}
            <div className="info-section">
              <h3><Users size={18} /> همکاران</h3>
              <div className="info-row-detail">
                <span className="info-label">نوع همکار</span>
                <span className="info-value">
                  {research.affiliation_type === 'UNIVERSITY' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <GraduationCap size={14} /> دانشگاه
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building2 size={14} /> شرکت
                    </span>
                  )}
                </span>
              </div>
              {research.affiliation_type === 'UNIVERSITY' ? (
                <div className="info-row-detail">
                  <span className="info-label">دانشگاه</span>
                  <span className="info-value highlight">{research.university_name || '—'}</span>
                </div>
              ) : (
                <div className="info-row-detail">
                  <span className="info-label">شرکت</span>
                  <span className="info-value highlight">{research.company_name || '—'}</span>
                </div>
              )}
              {research.researchers && (
                <div className="info-row-detail">
                  <span className="info-label">همکاران</span>
                  <span className="info-value">{research.researchers}</span>
                </div>
              )}
            </div>

            {/* Files */}
            {research.attachments && research.attachments.length > 0 && (
              <div className="info-section">
                <h3><Paperclip size={18} /> فایل‌های پیوست</h3>
                <div className="files-list">
                  {research.attachments.map((att) => (
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
              <div className="meta-row"><span className="meta-label">شناسه</span><span className="meta-value">#{toPersianNumberFn(research.id)}</span></div>
              <div className="meta-row"><span className="meta-label">تاریخ ایجاد</span><span className="meta-value">{research.created_at}</span></div>
              <div className="meta-row"><span className="meta-label">آخرین بروزرسانی</span><span className="meta-value">{research.updated_at}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Modal Edit ========== */}
      {editFormOpen && research && (
        <div className="modal-overlay" onClick={handleEditCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ResearchForm
              initialData={research}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          </div>
        </div>
      )}

      <style>{`
        .research-details-page {
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

        .research-subject-header {
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

        .description-text {
          font-size: 14px;
          color: #374151;
          line-height: 1.8;
          margin: 0;
          white-space: pre-wrap;
          max-height: 120px;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .description-text.expanded {
          max-height: none;
        }

        .toggle-description {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          background: none;
          border: none;
          color: #4f46e5;
          font-size: 13px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .toggle-description:hover {
          background: #eef2ff;
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
          .research-details-page {
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
          .research-details-page {
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

export default ResearchDetailsPage;