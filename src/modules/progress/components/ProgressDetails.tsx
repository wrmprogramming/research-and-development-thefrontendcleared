// src/modules/progress/pages/ProgressDetailsPage.tsx

import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { formatCurrency, toPersianNumber } from '../../../utils/formatter.utils';
import {
  ArrowLeft,
  FileText,
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
  TrendingUp,
  Percent,
  User,
  Users,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { ProgressForm } from '../components/ProgressForm';

interface ProgressDetailsPageProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

const toPersianNumberFn = (num: any): string => {
  if (num === undefined || num === null || num === '') return '۰';
  return toPersianNumber(num);
};

export const ProgressDetailsPage: React.FC<ProgressDetailsPageProps> = ({ onEdit, onDelete }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useItem, delete: deleteProgress, isDeleting } = useProgress();
  
  const { data: progress, isLoading, refetch } = useItem(Number(id));
  
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // ========== Handle Delete ==========
  const handleDelete = async () => {
    if (window.confirm('آیا از حذف این رکورد پیشرفت مطمئن هستید؟')) {
      await deleteProgress(Number(id));
      navigate('/progress');
      toast.success('پیشرفت با موفقیت حذف شد');
    }
  };

  // ========== Handle Edit ==========
  const handleEdit = () => {
    setEditFormOpen(true);
  };

  const handleEditSuccess = () => {
    setEditFormOpen(false);
    refetch();
    toast.success('پیشرفت با موفقیت ویرایش شد');
  };

  const handleEditCancel = () => {
    setEditFormOpen(false);
  };

  // ========== Get Status ==========
  const getStatusDisplay = (percentage: number) => {
    if (percentage >= 100) {
      return { label: 'تکمیل شده', color: '#059669', bgColor: '#d1fae5', icon: CheckCircle };
    } else if (percentage >= 70) {
      return { label: 'پیشرفت خوب', color: '#2563eb', bgColor: '#dbeafe', icon: TrendingUp };
    } else if (percentage >= 40) {
      return { label: 'در حال اجرا', color: '#d97706', bgColor: '#fef3c7', icon: Clock };
    } else {
      return { label: 'آغاز شده', color: '#6b7280', bgColor: '#f3f4f6', icon: AlertCircle };
    }
  };

  // ========== Export Functions ==========
  const exportHTML = () => {
    if (!progress) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const status = getStatusDisplay(progress.physical_progress_percentage);
      const StatusIcon = status.icon;
      const contractNumber = progress.contract_number || '—';
      const contractSubject = progress.contract_subject || '—';
      const committeeSession = progress.steering_committee_session || '—';

      const html = `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>گزارش پیشرفت</title>
  <style>
    body { font-family: 'Vazir', Tahoma, sans-serif; direction: rtl; padding: 40px; max-width: 900px; margin: 0 auto; background: #f8fafc; }
    .container { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 35px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header .sub { font-size: 18px; opacity: 0.9; margin-top: 4px; }
    .header .status { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 24px; border-radius: 20px; font-size: 14px; margin-top: 10px; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 25px; }
    .card { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e9ecef; }
    .card .lbl { font-size: 11px; color: #6b7280; }
    .card .val { font-size: 17px; font-weight: 700; margin-top: 4px; }
    .card.blue { background: #eef2ff; } .card.blue .val { color: #4f46e5; }
    .card.green { background: #d1fae5; } .card.green .val { color: #059669; }
    .card.orange { background: #fef3c7; } .card.orange .val { color: #d97706; }
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
    .footer { margin-top: 30px; padding-top: 16px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
    .progress-bar-big { height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 12px 0; }
    .progress-bar-big .fill { height: 100%; border-radius: 10px; transition: width 0.6s ease; }
    .fill.complete { background: linear-gradient(90deg, #059669, #10b981); }
    .fill.good { background: linear-gradient(90deg, #4f46e5, #7c3aed); }
    .fill.medium { background: linear-gradient(90deg, #d97706, #f59e0b); }
    .fill.low { background: linear-gradient(90deg, #6b7280, #9ca3af); }
    @media print { body { background: white; padding: 20px; } .container { box-shadow: none; padding: 20px; } }
    @media (max-width: 768px) { .cards { grid-template-columns: 1fr; } .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>📄 گزارش پیشرفت فیزیکی</h1>
    <div class="sub">${contractNumber}</div>
    <div class="status">${status.label}</div>
  </div>
  <div class="cards">
    <div class="card blue"><div class="lbl">درصد پیشرفت</div><div class="val">${toPersianNumberFn(progress.physical_progress_percentage)}%</div></div>
    <div class="card green"><div class="lbl">وضعیت</div><div class="val">${status.label}</div></div>
    <div class="card orange"><div class="lbl">تاریخ ثبت</div><div class="val">${progress.registered_date}</div></div>
  </div>
  <div class="progress-bar-big">
    <div class="fill ${progress.physical_progress_percentage >= 100 ? 'complete' : progress.physical_progress_percentage >= 70 ? 'good' : progress.physical_progress_percentage >= 40 ? 'medium' : 'low'}" style="width: ${Math.min(progress.physical_progress_percentage, 100)}%;"></div>
  </div>
  <div class="grid">
    <div>
      <div class="section"><h3>📋 اطلاعات قرارداد</h3>
        <div class="row"><span class="lbl">شماره قرارداد</span><span class="val highlight">${contractNumber}</span></div>
        <div class="row"><span class="lbl">موضوع</span><span class="val">${contractSubject}</span></div>
      </div>
      <div class="section"><h3>📅 تاریخ ثبت</h3>
        <div class="row"><span class="lbl">تاریخ ثبت</span><span class="val">${progress.registered_date}</span></div>
        <div class="row"><span class="lbl">تاریخ ایجاد</span><span class="val">${progress.created_at}</span></div>
      </div>
    </div>
    <div>
      ${progress.notes ? `<div class="section"><h3>📝 توضیحات</h3><div class="desc">${progress.notes}</div></div>` : ''}
      ${progress.steering_committee_session ? `
      <div class="section"><h3>🏛️ کمیته راهبری</h3>
        <div class="row"><span class="lbl">جلسه</span><span class="val">${committeeSession}</span></div>
      </div>` : ''}
      <div class="section meta-section"><h3>📋 اطلاعات تکمیلی</h3>
        <div class="row"><span class="lbl">شناسه</span><span class="val">#${toPersianNumberFn(progress.id)}</span></div>
        <div class="row"><span class="lbl">آخرین بروزرسانی</span><span class="val">${progress.updated_at}</span></div>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>📅 تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
    <span>📄 شناسه پیشرفت: ${toPersianNumberFn(progress.id)}</span>
  </div>
</div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      saveAs(blob, `پیشرفت_${progress.id}.html`);
      toast.success('فایل HTML با موفقیت دانلود شد');
    } catch (error) {
      console.error('HTML export error:', error);
      toast.error('خطا در ایجاد فایل HTML');
    }
    setIsExporting(false);
  };

  const exportJSON = () => {
    if (!progress) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const data = {
        id: progress.id,
        physical_progress_percentage: progress.physical_progress_percentage,
        registered_date: progress.registered_date,
        notes: progress.notes || null,
        contract: {
          id: typeof progress.contract === 'object' ? (progress.contract as any)?.id : progress.contract,
          number: progress.contract_number || null,
          subject: progress.contract_subject || null,
        },
        steering_committee: {
          id: progress.steering_committee || null,
          session: progress.steering_committee_session || null,
        },
        status: getStatusDisplay(progress.physical_progress_percentage).label,
        created_at: progress.created_at,
        updated_at: progress.updated_at,
      };

      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
      saveAs(blob, `پیشرفت_${progress.id}.json`);
      toast.success('فایل JSON با موفقیت دانلود شد');
    } catch (error) {
      console.error('JSON export error:', error);
      toast.error('خطا در ایجاد فایل JSON');
    }
    setIsExporting(false);
  };

  const exportCSV = () => {
    if (!progress) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const status = getStatusDisplay(progress.physical_progress_percentage);
      const rows = [
        ['فیلد', 'مقدار'],
        ['شناسه', toPersianNumberFn(progress.id)],
        ['درصد پیشرفت', toPersianNumberFn(progress.physical_progress_percentage)],
        ['وضعیت', status.label],
        ['تاریخ ثبت', progress.registered_date],
        ['شماره قرارداد', progress.contract_number || '—'],
        ['موضوع قرارداد', progress.contract_subject || '—'],
        ['جلسه کمیته راهبری', progress.steering_committee_session || '—'],
        ['توضیحات', progress.notes || ''],
        ['تاریخ ایجاد', progress.created_at],
        ['آخرین بروزرسانی', progress.updated_at],
      ];

      const csvContent = rows.map(row => row.join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `پیشرفت_${progress.id}.csv`);
      toast.success('فایل CSV با موفقیت دانلود شد');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('خطا در ایجاد فایل CSV');
    }
    setIsExporting(false);
  };

  const exportTXT = () => {
    if (!progress) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const status = getStatusDisplay(progress.physical_progress_percentage);

      const text = `
═══════════════════════════════════════════════════════════
                    گزارش پیشرفت فیزیکی
═══════════════════════════════════════════════════════════

شناسه: ${toPersianNumberFn(progress.id)}
درصد پیشرفت: ${toPersianNumberFn(progress.physical_progress_percentage)}%
وضعیت: ${status.label}

───────────────────────────────────────────────────────────
                    اطلاعات قرارداد
───────────────────────────────────────────────────────────

شماره قرارداد: ${progress.contract_number || '—'}
موضوع: ${progress.contract_subject || '—'}

───────────────────────────────────────────────────────────
                    تاریخ‌ها
───────────────────────────────────────────────────────────

تاریخ ثبت: ${progress.registered_date}
تاریخ ایجاد: ${progress.created_at}
آخرین بروزرسانی: ${progress.updated_at}

${progress.steering_committee_session ? `───────────────────────────────────────────────────────────
کمیته راهبری:
جلسه: ${progress.steering_committee_session}
` : ''}
${progress.notes ? `───────────────────────────────────────────────────────────
توضیحات:
${progress.notes}
` : ''}
═══════════════════════════════════════════════════════════
تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}
═══════════════════════════════════════════════════════════
`;

      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `پیشرفت_${progress.id}.txt`);
      toast.success('فایل TXT با موفقیت دانلود شد');
    } catch (error) {
      console.error('TXT export error:', error);
      toast.error('خطا در ایجاد فایل TXT');
    }
    setIsExporting(false);
  };

  const exportToWord = () => {
    if (!progress) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const status = getStatusDisplay(progress.physical_progress_percentage);
      const StatusIcon = status.icon;
      const contractNumber = progress.contract_number || '—';
      const contractSubject = progress.contract_subject || '—';
      const committeeSession = progress.steering_committee_session || '—';

      const html = `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>گزارش پیشرفت</title>
  <style>
    body { direction: rtl; font-family: 'B Nazanin', 'Vazir', Tahoma, sans-serif; padding: 35px 40px; max-width: 850px; margin: 0 auto; background: #ffffff; color: #1a1a2e; }
    .header { background: #4f46e5; color: white; padding: 35px 40px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; color: white; }
    .header .sub { font-size: 18px; opacity: 0.9; margin-top: 4px; color: white; }
    .header .status { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 24px; border-radius: 20px; font-size: 14px; margin-top: 10px; color: white; font-weight: 600; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 25px; }
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
    .footer { margin-top: 30px; padding-top: 16px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
    .progress-bar-big { height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 12px 0; }
    .progress-bar-big .fill { height: 100%; border-radius: 10px; }
    .fill.complete { background: linear-gradient(90deg, #059669, #10b981); }
    .fill.good { background: linear-gradient(90deg, #4f46e5, #7c3aed); }
    .fill.medium { background: linear-gradient(90deg, #d97706, #f59e0b); }
    .fill.low { background: linear-gradient(90deg, #6b7280, #9ca3af); }
    @media print { body { padding: 20px; } .card { break-inside: avoid; } .section { break-inside: avoid; } }
    @media (max-width: 768px) { .cards { grid-template-columns: 1fr; } .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>گزارش پیشرفت فیزیکی</h1>
    <div class="sub">${contractNumber}</div>
    <div class="status">${status.label}</div>
  </div>
  <div class="cards">
    <div class="card" style="background:#eef2ff;"><div class="lbl">درصد پیشرفت</div><div class="val" style="color:#4f46e5;">${toPersianNumberFn(progress.physical_progress_percentage)}%</div></div>
    <div class="card" style="background:${status.bgColor};"><div class="lbl">وضعیت</div><div class="val" style="color:${status.color};">${status.label}</div></div>
    <div class="card" style="background:#fef3c7;"><div class="lbl">تاریخ ثبت</div><div class="val" style="color:#d97706;">${progress.registered_date}</div></div>
  </div>
  <div class="progress-bar-big">
    <div class="fill ${progress.physical_progress_percentage >= 100 ? 'complete' : progress.physical_progress_percentage >= 70 ? 'good' : progress.physical_progress_percentage >= 40 ? 'medium' : 'low'}" style="width: ${Math.min(progress.physical_progress_percentage, 100)}%;"></div>
  </div>
  <div class="grid">
    <div>
      <div class="section"><h3>اطلاعات قرارداد</h3>
        <div class="row"><span class="lbl">شماره قرارداد</span><span class="val highlight">${contractNumber}</span></div>
        <div class="row"><span class="lbl">موضوع</span><span class="val">${contractSubject}</span></div>
      </div>
      <div class="section"><h3>تاریخ ثبت</h3>
        <div class="row"><span class="lbl">تاریخ ثبت</span><span class="val">${progress.registered_date}</span></div>
        <div class="row"><span class="lbl">تاریخ ایجاد</span><span class="val">${progress.created_at}</span></div>
      </div>
    </div>
    <div>
      ${progress.notes ? `<div class="section"><h3>توضیحات</h3><div class="desc">${progress.notes}</div></div>` : ''}
      ${progress.steering_committee_session ? `
      <div class="section"><h3>کمیته راهبری</h3>
        <div class="row"><span class="lbl">جلسه</span><span class="val">${committeeSession}</span></div>
      </div>` : ''}
      <div class="section meta-section"><h3>اطلاعات تکمیلی</h3>
        <div class="row"><span class="lbl">شناسه</span><span class="val">#${toPersianNumberFn(progress.id)}</span></div>
        <div class="row"><span class="lbl">آخرین بروزرسانی</span><span class="val">${progress.updated_at}</span></div>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
    <span>شناسه پیشرفت: ${toPersianNumberFn(progress.id)}</span>
  </div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
      saveAs(blob, `پیشرفت_${progress.id}.doc`);
      toast.success('فایل Word با موفقیت دانلود شد');
    } catch (error) {
      console.error('Word export error:', error);
      toast.error('خطا در ایجاد فایل Word');
    }
    setIsExporting(false);
  };

  const exportToPDF = async () => {
    if (!progress) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const status = getStatusDisplay(progress.physical_progress_percentage);
      const contractNumber = progress.contract_number || '—';
      const contractSubject = progress.contract_subject || '—';
      const committeeSession = progress.steering_committee_session || '—';

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
            <div style="font-size: 22px; font-weight: 700;">گزارش پیشرفت فیزیکی</div>
            <div style="font-size: 15px; opacity: 0.9; margin-top: 4px;">${contractNumber}</div>
            <div style="margin-top: 6px;">
              <span style="display: inline-block; background: rgba(255,255,255,0.2); padding: 3px 16px; border-radius: 18px; font-size: 12px; font-weight: 500;">
                ${status.label}
              </span>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;">
            <div style="background: #eef2ff; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">درصد پیشرفت</div>
              <div style="font-size: 13px; font-weight: 700; color: #4f46e5;">${toPersianNumberFn(progress.physical_progress_percentage)}%</div>
            </div>
            <div style="background: ${status.bgColor}; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">وضعیت</div>
              <div style="font-size: 13px; font-weight: 700; color: ${status.color};">${status.label}</div>
            </div>
            <div style="background: #fef3c7; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">تاریخ ثبت</div>
              <div style="font-size: 13px; font-weight: 700; color: #d97706;">${progress.registered_date}</div>
            </div>
          </div>
          <div style="height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin-bottom: 16px;">
            <div style="height: 100%; width: ${Math.min(progress.physical_progress_percentage, 100)}%; border-radius: 10px; background: ${progress.physical_progress_percentage >= 100 ? 'linear-gradient(90deg, #059669, #10b981)' : progress.physical_progress_percentage >= 70 ? 'linear-gradient(90deg, #4f46e5, #7c3aed)' : progress.physical_progress_percentage >= 40 ? 'linear-gradient(90deg, #d97706, #f59e0b)' : 'linear-gradient(90deg, #6b7280, #9ca3af)'};"></div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div>
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">اطلاعات قرارداد</div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">شماره قرارداد</span>
                  <span style="font-weight: 600; color: #4f46e5;">${contractNumber}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
                  <span style="color: #6b7280;">موضوع</span>
                  <span style="font-weight: 500;">${contractSubject}</span>
                </div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">تاریخ ثبت</div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">تاریخ ثبت</span>
                  <span style="font-weight: 500;">${progress.registered_date}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
                  <span style="color: #6b7280;">تاریخ ایجاد</span>
                  <span style="font-weight: 500;">${progress.created_at}</span>
                </div>
              </div>
            </div>
            <div>
              ${progress.notes ? `
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">توضیحات</div>
                <div style="font-size: 11px; color: #374151; line-height: 1.7; text-align: justify;">${progress.notes}</div>
              </div>` : ''}
              ${progress.steering_committee_session ? `
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">کمیته راهبری</div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
                  <span style="color: #6b7280;">جلسه</span>
                  <span style="font-weight: 500;">${committeeSession}</span>
                </div>
              </div>` : ''}
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">اطلاعات تکمیلی</div>
                <div style="display: flex; justify-content: space-between; padding: 2px 0; font-size: 10px; border-bottom: 1px solid #f3f4f6;">
                  <span style="color: #6b7280;">شناسه</span>
                  <span style="font-weight: 500;">#${toPersianNumberFn(progress.id)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 2px 0; font-size: 10px;">
                  <span style="color: #6b7280;">آخرین بروزرسانی</span>
                  <span style="font-weight: 500;">${progress.updated_at}</span>
                </div>
              </div>
            </div>
          </div>
          <div style="margin-top: 20px; padding-top: 12px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 9px; color: #9ca3af;">
            <span>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
            <span>شناسه پیشرفت: ${toPersianNumberFn(progress.id)}</span>
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

      pdf.save(`پیشرفت_${progress.id}.pdf`);
      toast.success('فایل PDF با موفقیت دانلود شد');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('خطا در ایجاد فایل PDF');
    }
    setIsExporting(false);
  };

  const exportToExcel = () => {
    if (!progress) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const status = getStatusDisplay(progress.physical_progress_percentage);
      const data = [
        {
          'شناسه': toPersianNumberFn(progress.id),
          'درصد پیشرفت': toPersianNumberFn(progress.physical_progress_percentage),
          'وضعیت': status.label,
          'تاریخ ثبت': progress.registered_date,
          'شماره قرارداد': progress.contract_number || '—',
          'موضوع قرارداد': progress.contract_subject || '—',
          'جلسه کمیته راهبری': progress.steering_committee_session || '—',
          'توضیحات': progress.notes || '',
          'تاریخ ایجاد': progress.created_at,
          'آخرین بروزرسانی': progress.updated_at,
        }
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);

      const colWidths = [
        { wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 15 },
        { wch: 20 }, { wch: 35 }, { wch: 20 }, { wch: 50 },
        { wch: 20 }, { wch: 20 },
      ];

      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'پیشرفت');
      XLSX.writeFile(wb, `پیشرفت_${progress.id}.xlsx`);
      toast.success('فایل Excel با موفقیت دانلود شد');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('خطا در ایجاد فایل Excel');
    }
    setIsExporting(false);
  };

  const exportXML = () => {
    if (!progress) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const status = getStatusDisplay(progress.physical_progress_percentage);

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<progress>
  <header>
    <id>${toPersianNumberFn(progress.id)}</id>
    <percentage>${toPersianNumberFn(progress.physical_progress_percentage)}</percentage>
    <status>${status.label}</status>
    <registered_date>${progress.registered_date}</registered_date>
  </header>
  
  <contract>
    <id>${typeof progress.contract === 'object' ? (progress.contract as any)?.id : progress.contract}</id>
    <number>${progress.contract_number || ''}</number>
    <subject>${progress.contract_subject || ''}</subject>
  </contract>
  
  <steering_committee>
    <id>${progress.steering_committee || ''}</id>
    <session>${progress.steering_committee_session || ''}</session>
  </steering_committee>
  
  <details>
    <notes>${progress.notes || ''}</notes>
    <created_at>${progress.created_at}</created_at>
    <updated_at>${progress.updated_at}</updated_at>
  </details>
</progress>`;

      const blob = new Blob([xml], { type: 'text/xml;charset=utf-8' });
      saveAs(blob, `پیشرفت_${progress.id}.xml`);
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
      <div className="progress-details-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>در حال بارگذاری اطلاعات پیشرفت...</p>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="progress-details-page">
        <div className="error-container">
          <AlertCircle size={64} />
          <h3>پیشرفت یافت نشد</h3>
          <p>رکورد پیشرفت مورد نظر با شناسه {id} در سیستم وجود ندارد</p>
          <button className="btn-back" onClick={() => navigate('/progress')}>
            <ArrowLeft size={16} />
            بازگشت به لیست پیشرفت‌ها
          </button>
        </div>
      </div>
    );
  }

  const status = getStatusDisplay(progress.physical_progress_percentage);
  const StatusIcon = status.icon;

  return (
    <div className="progress-details-page" ref={contentRef}>
      {/* ========== Header ========== */}
      <div className="details-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/progress')}>
            <ArrowLeft size={18} />
            بازگشت
          </button>
          <div className="header-title">
            <TrendingUp size={24} className="title-icon" />
            <div>
              <h1>پیشرفت فیزیکی #{toPersianNumberFn(progress.id)}</h1>
              <span className="progress-subject-header">{progress.contract_number || '—'}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <span
            className="status-badge-large"
            style={{
              backgroundColor: status.color + '20',
              color: status.color,
            }}
          >
            <StatusIcon size={16} />
            {status.label}
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
              <Percent size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">درصد پیشرفت</span>
              <span className="summary-value">{toPersianNumberFn(progress.physical_progress_percentage)}%</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: status.bgColor, color: status.color }}>
              <StatusIcon size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">وضعیت</span>
              <span className="summary-value">{status.label}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Calendar size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">تاریخ ثبت</span>
              <span className="summary-value">{progress.registered_date}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
              <Building2 size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">قرارداد</span>
              <span className="summary-value">{progress.contract_number || '—'}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar Big */}
        <div className="progress-bar-big-container">
          <div className="progress-bar-big">
            <div
              className={`progress-fill-big ${progress.physical_progress_percentage >= 100 ? 'complete' : progress.physical_progress_percentage >= 70 ? 'good' : progress.physical_progress_percentage >= 40 ? 'medium' : 'low'}`}
              style={{ width: `${Math.min(progress.physical_progress_percentage, 100)}%` }}
            />
          </div>
          <span className="progress-label-big">{toPersianNumberFn(progress.physical_progress_percentage)}%</span>
        </div>

        <div className="info-grid">
          <div className="info-column">
            {/* Contract Info */}
            <div className="info-section">
              <h3><Building2 size={18} /> اطلاعات قرارداد</h3>
              <div className="info-row-detail">
                <span className="info-label">شماره قرارداد</span>
                <span className="info-value highlight">{progress.contract_number || '—'}</span>
              </div>
              <div className="info-row-detail">
                <span className="info-label">موضوع</span>
                <span className="info-value">{progress.contract_subject || '—'}</span>
              </div>
              {progress.contract_total_amount && (
                <div className="info-row-detail">
                  <span className="info-label">مبلغ کل</span>
                  <span className="info-value">{progress.contract_total_amount}</span>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="info-section">
              <h3><Calendar size={18} /> تاریخ‌ها</h3>
              <div className="info-row-detail">
                <span className="info-label">تاریخ ثبت</span>
                <span className="info-value">{progress.registered_date}</span>
              </div>
              <div className="info-row-detail">
                <span className="info-label">تاریخ ایجاد</span>
                <span className="info-value">{progress.created_at}</span>
              </div>
              <div className="info-row-detail">
                <span className="info-label">آخرین بروزرسانی</span>
                <span className="info-value">{progress.updated_at}</span>
              </div>
            </div>
          </div>

          <div className="info-column">
            {/* Notes */}
            {progress.notes && (
              <div className="info-section">
                <h3><FileText size={18} /> توضیحات</h3>
                <p className={`description-text ${showFullDescription ? 'expanded' : ''}`}>
                  {progress.notes}
                </p>
                {progress.notes.length > 200 && (
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

            {/* Steering Committee */}
            {progress.steering_committee_session && (
              <div className="info-section">
                <h3><Users size={18} /> کمیته راهبری</h3>
                <div className="info-row-detail">
                  <span className="info-label">جلسه</span>
                  <span className="info-value">{progress.steering_committee_session}</span>
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="info-section meta">
              <div className="meta-row"><span className="meta-label">شناسه</span><span className="meta-value">#{toPersianNumberFn(progress.id)}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Modal Edit ========== */}
      {editFormOpen && progress && (
        <div className="modal-overlay" onClick={handleEditCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ProgressForm
              initialData={progress}
              contractId={typeof progress.contract === 'object' ? (progress.contract as any)?.id : progress.contract}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          </div>
        </div>
      )}

      <style>{`
        .progress-details-page {
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

        .progress-subject-header {
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
          max-width: 600px;
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

        .progress-bar-big-container {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .progress-bar-big {
          flex: 1;
          height: 14px;
          background: #e9ecef;
          border-radius: 8px;
          overflow: hidden;
        }

        .progress-fill-big {
          height: 100%;
          border-radius: 8px;
          transition: width 0.6s ease;
        }

        .progress-fill-big.complete {
          background: linear-gradient(90deg, #059669, #10b981);
        }

        .progress-fill-big.good {
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
        }

        .progress-fill-big.medium {
          background: linear-gradient(90deg, #d97706, #f59e0b);
        }

        .progress-fill-big.low {
          background: linear-gradient(90deg, #6b7280, #9ca3af);
        }

        .progress-label-big {
          font-size: 18px;
          font-weight: 700;
          color: #4f46e5;
          min-width: 60px;
          text-align: left;
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
          .progress-details-page {
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

          .progress-bar-big-container {
            flex-direction: column;
            align-items: stretch;
          }

          .progress-label-big {
            text-align: center;
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
          .progress-details-page {
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

export default ProgressDetailsPage;