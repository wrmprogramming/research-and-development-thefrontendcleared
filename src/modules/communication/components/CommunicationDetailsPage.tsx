// src/modules/communication/pages/CommunicationDetailsPage.tsx

import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCommunication } from '../hooks/useCommunication';
import { toPersianNumber } from '../../../utils/formatter.utils';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Download,
  Eye,
  Printer,
  Edit,
  Trash2,
  AlertCircle,
  Paperclip,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Building2,
  Loader2,
  User,
  Hash,
  BookOpen,
  X,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { CommunicationForm } from '../components/CommunicationForm';

// ✅ تابع تبدیل اعداد به فارسی
const toPersianNumberFn = (num: any): string => {
  if (num === undefined || num === null || num === '') return '۰';
  return toPersianNumber(num);
};

interface CommunicationDetailsPageProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export const CommunicationDetailsPage: React.FC<CommunicationDetailsPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useItem, delete: deleteCommunication, isDeleting } = useCommunication();

  const { data: communication, isLoading, refetch } = useItem(Number(id));

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // ========== Helper ==========
  const getFileName = (url: string | null | undefined) => {
    if (!url) return '';
    try {
      const parts = url.split('/');
      return decodeURIComponent(parts[parts.length - 1] || '');
    } catch {
      return '';
    }
  };

  // ========== Delete ==========
  const handleDelete = async () => {
    if (window.confirm('آیا از حذف این مکاتبه مطمئن هستید؟')) {
      await deleteCommunication(Number(id));
      navigate('/communication');
      toast.success('مکاتبه با موفقیت حذف شد');
    }
  };

  // ========== Edit ==========
  const handleEdit = () => {
    setEditFormOpen(true);
  };

  const handleEditSuccess = () => {
    setEditFormOpen(false);
    refetch();
    toast.success('مکاتبه با موفقیت ویرایش شد');
  };

  const handleEditCancel = () => {
    setEditFormOpen(false);
  };

  // ========== Export Handlers ==========

  const exportHTML = () => {
    if (!communication) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      let filesHtml = '';
      if (communication.attachment || communication.letter_file) {
        filesHtml = `
          <div class="section">
            <h3>📎 فایل‌ها</h3>
            ${communication.attachment ? `<div class="row"><span class="lbl">فایل پیوست</span><span class="val">${getFileName(communication.attachment)}</span></div>` : ''}
            ${communication.letter_file ? `<div class="row"><span class="lbl">فایل نامه</span><span class="val">${getFileName(communication.letter_file)}</span></div>` : ''}
          </div>
        `;
      }

      const html = `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <title>مکاتبه ${communication.title}</title>
  <style>
    body { font-family: 'Vazir', Tahoma, sans-serif; direction: rtl; padding: 40px; max-width: 900px; margin: 0 auto; background: #f8fafc; }
    .container { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 35px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header .sub { font-size: 18px; opacity: 0.9; margin-top: 4px; }
    .header .status { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 24px; border-radius: 20px; font-size: 14px; margin-top: 10px; }
    .section { background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 18px 22px; margin-bottom: 16px; }
    .section h3 { font-size: 15px; font-weight: 700; color: #4f46e5; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e9ecef; }
    .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .row .lbl { color: #6b7280; }
    .row .val { font-weight: 500; color: #1a1a2e; }
    .row .val.highlight { color: #4f46e5; font-weight: 600; }
    .footer { margin-top: 30px; padding-top: 16px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 گزارش مکاتبه</h1>
      <div class="sub">${communication.title}</div>
      ${communication.letter_number ? `<div class="status">شماره: ${communication.letter_number}</div>` : ''}
    </div>

    <div class="section">
      <h3>📋 اطلاعات اصلی</h3>
      <div class="row"><span class="lbl">عنوان</span><span class="val highlight">${communication.title}</span></div>
      ${communication.letter_number ? `<div class="row"><span class="lbl">شماره مکاتبه</span><span class="val">${communication.letter_number}</span></div>` : ''}
      <div class="row"><span class="lbl">ارسال‌کننده</span><span class="val">${communication.sender}</span></div>
      <div class="row"><span class="lbl">دریافت‌کننده</span><span class="val">${communication.receiver}</span></div>
    </div>

    <div class="section">
      <h3>📅 تاریخ‌ها</h3>
      <div class="row"><span class="lbl">تاریخ مکاتبه</span><span class="val">${communication.date || '—'}</span></div>
      <div class="row"><span class="lbl">تاریخ ارسال/دریافت</span><span class="val">${communication.send_receive_date || '—'}</span></div>
    </div>

    ${communication.research_code ? `
    <div class="section">
      <h3>📚 پژوهش مرتبط</h3>
      <div class="row"><span class="lbl">کد پژوهش</span><span class="val highlight">${communication.research_code}</span></div>
      ${communication.research_title ? `<div class="row"><span class="lbl">عنوان پژوهش</span><span class="val">${communication.research_title}</span></div>` : ''}
    </div>` : ''}

    ${communication.description ? `
    <div class="section">
      <h3>📝 توضیحات</h3>
      <div style="font-size: 13px; line-height: 1.9; color: #374151; text-align: justify;">${communication.description}</div>
    </div>` : ''}

    ${filesHtml}

    <div class="footer">
      <span>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
      <span>شناسه: #${toPersianNumberFn(communication.id)}</span>
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      saveAs(blob, `مکاتبه_${communication.letter_number || communication.id}.html`);
      toast.success('فایل HTML با موفقیت دانلود شد');
    } catch (error) {
      console.error('HTML export error:', error);
      toast.error('خطا در ایجاد فایل HTML');
    }
    setIsExporting(false);
  };

  const exportJSON = () => {
    if (!communication) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const data = {
        id: communication.id,
        letter_number: communication.letter_number,
        title: communication.title,
        description: communication.description,
        sender: communication.sender,
        receiver: communication.receiver,
        date: communication.date,
        send_receive_date: communication.send_receive_date,
        research: {
          code: communication.research_code,
          title: communication.research_title,
        },
        files: {
          attachment: communication.attachment,
          letter_file: communication.letter_file,
        },
        created_at: communication.created_at,
        updated_at: communication.updated_at,
      };

      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
      saveAs(blob, `مکاتبه_${communication.letter_number || communication.id}.json`);
      toast.success('فایل JSON با موفقیت دانلود شد');
    } catch (error) {
      console.error('JSON export error:', error);
      toast.error('خطا در ایجاد فایل JSON');
    }
    setIsExporting(false);
  };

  const exportCSV = () => {
    if (!communication) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const rows = [
        ['فیلد', 'مقدار'],
        ['شناسه', toPersianNumberFn(communication.id)],
        ['شماره مکاتبه', communication.letter_number || ''],
        ['عنوان', communication.title],
        ['ارسال‌کننده', communication.sender],
        ['دریافت‌کننده', communication.receiver],
        ['تاریخ مکاتبه', communication.date || ''],
        ['تاریخ ارسال/دریافت', communication.send_receive_date || ''],
        ['کد پژوهش', communication.research_code || ''],
        ['عنوان پژوهش', communication.research_title || ''],
        ['توضیحات', communication.description || ''],
        ['تاریخ ایجاد', communication.created_at],
        ['آخرین بروزرسانی', communication.updated_at],
      ];

      const csvContent = rows.map((row) => row.join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `مکاتبه_${communication.letter_number || communication.id}.csv`);
      toast.success('فایل CSV با موفقیت دانلود شد');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('خطا در ایجاد فایل CSV');
    }
    setIsExporting(false);
  };

  const exportTXT = () => {
    if (!communication) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const text = `
═══════════════════════════════════════════════════════════
                    گزارش مکاتبه
═══════════════════════════════════════════════════════════

شناسه: ${toPersianNumberFn(communication.id)}
شماره مکاتبه: ${communication.letter_number || '—'}
عنوان: ${communication.title}

───────────────────────────────────────────────────────────
                    اطلاعات اصلی
───────────────────────────────────────────────────────────

ارسال‌کننده: ${communication.sender}
دریافت‌کننده: ${communication.receiver}
تاریخ مکاتبه: ${communication.date || '—'}
تاریخ ارسال/دریافت: ${communication.send_receive_date || '—'}

${communication.research_code ? `───────────────────────────────────────────────────────────
                    پژوهش مرتبط
───────────────────────────────────────────────────────────

کد پژوهش: ${communication.research_code}
${communication.research_title ? `عنوان پژوهش: ${communication.research_title}` : ''}
` : ''}

${communication.description ? `───────────────────────────────────────────────────────────
                    توضیحات
───────────────────────────────────────────────────────────

${communication.description}
` : ''}

═══════════════════════════════════════════════════════════
تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}
═══════════════════════════════════════════════════════════
`;

      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `مکاتبه_${communication.letter_number || communication.id}.txt`);
      toast.success('فایل TXT با موفقیت دانلود شد');
    } catch (error) {
      console.error('TXT export error:', error);
      toast.error('خطا در ایجاد فایل TXT');
    }
    setIsExporting(false);
  };

  const exportToWord = () => {
    if (!communication) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      let filesHtml = '';
      if (communication.attachment || communication.letter_file) {
        filesHtml = `
          <div class="section">
            <h3>فایل‌ها</h3>
            ${communication.attachment ? `<div class="row"><span class="lbl">فایل پیوست</span><span class="val">${getFileName(communication.attachment)}</span></div>` : ''}
            ${communication.letter_file ? `<div class="row"><span class="lbl">فایل نامه</span><span class="val">${getFileName(communication.letter_file)}</span></div>` : ''}
          </div>
        `;
      }

      const html = `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>مکاتبه ${communication.title}</title>
  <style>
    body { direction: rtl; font-family: 'B Nazanin', 'Vazir', Tahoma, sans-serif; padding: 35px 40px; max-width: 850px; margin: 0 auto; background: #ffffff; color: #1a1a2e; }
    .header { background: #4f46e5; color: white; padding: 35px 40px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; color: white; }
    .header .sub { font-size: 18px; opacity: 0.9; margin-top: 4px; color: white; }
    .header .status { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 24px; border-radius: 20px; font-size: 14px; margin-top: 10px; color: white; font-weight: 600; }
    .section { background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 18px 22px; margin-bottom: 16px; }
    .section h3 { font-size: 15px; font-weight: 700; color: #4f46e5; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e9ecef; }
    .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .row .lbl { color: #6b7280; }
    .row .val { font-weight: 500; color: #1a1a2e; }
    .row .val.highlight { color: #4f46e5; font-weight: 600; }
    .footer { margin-top: 30px; padding-top: 16px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="header">
    <h1>گزارش مکاتبه</h1>
    <div class="sub">${communication.title}</div>
    ${communication.letter_number ? `<div class="status">شماره: ${communication.letter_number}</div>` : ''}
  </div>

  <div class="section">
    <h3>اطلاعات اصلی</h3>
    <div class="row"><span class="lbl">عنوان</span><span class="val highlight">${communication.title}</span></div>
    ${communication.letter_number ? `<div class="row"><span class="lbl">شماره مکاتبه</span><span class="val">${communication.letter_number}</span></div>` : ''}
    <div class="row"><span class="lbl">ارسال‌کننده</span><span class="val">${communication.sender}</span></div>
    <div class="row"><span class="lbl">دریافت‌کننده</span><span class="val">${communication.receiver}</span></div>
  </div>

  <div class="section">
    <h3>تاریخ‌ها</h3>
    <div class="row"><span class="lbl">تاریخ مکاتبه</span><span class="val">${communication.date || '—'}</span></div>
    <div class="row"><span class="lbl">تاریخ ارسال/دریافت</span><span class="val">${communication.send_receive_date || '—'}</span></div>
  </div>

  ${communication.research_code ? `
  <div class="section">
    <h3>پژوهش مرتبط</h3>
    <div class="row"><span class="lbl">کد پژوهش</span><span class="val highlight">${communication.research_code}</span></div>
    ${communication.research_title ? `<div class="row"><span class="lbl">عنوان پژوهش</span><span class="val">${communication.research_title}</span></div>` : ''}
  </div>` : ''}

  ${communication.description ? `
  <div class="section">
    <h3>توضیحات</h3>
    <div style="font-size: 13px; line-height: 1.9; color: #374151; text-align: justify;">${communication.description}</div>
  </div>` : ''}

  ${filesHtml}

  <div class="footer">
    <span>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
    <span>شناسه: #${toPersianNumberFn(communication.id)}</span>
  </div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
      saveAs(blob, `مکاتبه_${communication.letter_number || communication.id}.doc`);
      toast.success('فایل Word با موفقیت دانلود شد');
    } catch (error) {
      console.error('Word export error:', error);
      toast.error('خطا در ایجاد فایل Word');
    }
    setIsExporting(false);
  };

  const exportToPDF = async () => {
    if (!communication) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      let filesHtml = '';
      if (communication.attachment || communication.letter_file) {
        filesHtml = `
          <div style="background:#f8fafc;border:1px solid #e9ecef;border-radius:8px;padding:12px 14px;margin-bottom:12px;">
            <div style="font-size:12px;font-weight:700;color:#4f46e5;margin-bottom:6px;padding-bottom:5px;border-bottom:2px solid #e9ecef;">فایل‌ها</div>
            ${communication.attachment ? `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">فایل پیوست</span><span>${getFileName(communication.attachment)}</span></div>` : ''}
            ${communication.letter_file ? `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11px;"><span style="color:#6b7280;">فایل نامه</span><span>${getFileName(communication.letter_file)}</span></div>` : ''}
          </div>
        `;
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
            <div style="font-size: 22px; font-weight: 700;">گزارش مکاتبه</div>
            <div style="font-size: 15px; opacity: 0.9; margin-top: 4px;">${communication.title}</div>
            ${communication.letter_number ? `<div style="margin-top: 8px;"><span style="display: inline-block; background: rgba(255,255,255,0.2); padding: 3px 16px; border-radius: 18px; font-size: 12px; font-weight: 500;">شماره: ${communication.letter_number}</span></div>` : ''}
          </div>

          <div style="background:#f8fafc;border:1px solid #e9ecef;border-radius:8px;padding:12px 14px;margin-bottom:12px;">
            <div style="font-size:12px;font-weight:700;color:#4f46e5;margin-bottom:6px;padding-bottom:5px;border-bottom:2px solid #e9ecef;">اطلاعات اصلی</div>
            <div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">عنوان</span><span style="font-weight:600;color:#4f46e5;">${communication.title}</span></div>
            ${communication.letter_number ? `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">شماره مکاتبه</span><span>${communication.letter_number}</span></div>` : ''}
            <div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">ارسال‌کننده</span><span>${communication.sender}</span></div>
            <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11px;"><span style="color:#6b7280;">دریافت‌کننده</span><span>${communication.receiver}</span></div>
          </div>

          <div style="background:#f8fafc;border:1px solid #e9ecef;border-radius:8px;padding:12px 14px;margin-bottom:12px;">
            <div style="font-size:12px;font-weight:700;color:#4f46e5;margin-bottom:6px;padding-bottom:5px;border-bottom:2px solid #e9ecef;">تاریخ‌ها</div>
            <div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">تاریخ مکاتبه</span><span>${communication.date || '—'}</span></div>
            <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11px;"><span style="color:#6b7280;">تاریخ ارسال/دریافت</span><span>${communication.send_receive_date || '—'}</span></div>
          </div>

          ${communication.research_code ? `
          <div style="background:#f8fafc;border:1px solid #e9ecef;border-radius:8px;padding:12px 14px;margin-bottom:12px;">
            <div style="font-size:12px;font-weight:700;color:#4f46e5;margin-bottom:6px;padding-bottom:5px;border-bottom:2px solid #e9ecef;">پژوهش مرتبط</div>
            <div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">کد پژوهش</span><span style="font-weight:600;color:#4f46e5;">${communication.research_code}</span></div>
            ${communication.research_title ? `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11px;"><span style="color:#6b7280;">عنوان</span><span>${communication.research_title}</span></div>` : ''}
          </div>` : ''}

          ${communication.description ? `
          <div style="background:#f8fafc;border:1px solid #e9ecef;border-radius:8px;padding:12px 14px;margin-bottom:12px;">
            <div style="font-size:12px;font-weight:700;color:#4f46e5;margin-bottom:6px;padding-bottom:5px;border-bottom:2px solid #e9ecef;">توضیحات</div>
            <div style="font-size:11px;line-height:1.9;color:#374151;text-align:justify;">${communication.description}</div>
          </div>` : ''}

          ${filesHtml}

          <div style="margin-top: 20px; padding-top: 12px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 9px; color: #9ca3af;">
            <span>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
            <span>شناسه: #${toPersianNumberFn(communication.id)}</span>
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

      pdf.save(`مکاتبه_${communication.letter_number || communication.id}.pdf`);
      toast.success('فایل PDF با موفقیت دانلود شد');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('خطا در ایجاد فایل PDF');
    }
    setIsExporting(false);
  };

  const exportToExcel = () => {
    if (!communication) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const data = [
        {
          'شناسه': toPersianNumberFn(communication.id),
          'شماره مکاتبه': communication.letter_number || '',
          'عنوان': communication.title,
          'ارسال‌کننده': communication.sender,
          'دریافت‌کننده': communication.receiver,
          'تاریخ مکاتبه': communication.date || '',
          'تاریخ ارسال/دریافت': communication.send_receive_date || '',
          'کد پژوهش': communication.research_code || '',
          'عنوان پژوهش': communication.research_title || '',
          'توضیحات': communication.description || '',
          'تاریخ ایجاد': communication.created_at,
          'آخرین بروزرسانی': communication.updated_at,
        },
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [
        { wch: 12 }, { wch: 20 }, { wch: 40 }, { wch: 25 },
        { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
        { wch: 40 }, { wch: 40 }, { wch: 20 }, { wch: 20 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'مکاتبه');
      XLSX.writeFile(wb, `مکاتبه_${communication.letter_number || communication.id}.xlsx`);
      toast.success('فایل Excel با موفقیت دانلود شد');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('خطا در ایجاد فایل Excel');
    }
    setIsExporting(false);
  };

  const exportXML = () => {
    if (!communication) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<communication>
  <header>
    <id>${communication.id}</id>
    <letter_number>${communication.letter_number || ''}</letter_number>
    <title>${communication.title}</title>
  </header>

  <details>
    <sender>${communication.sender}</sender>
    <receiver>${communication.receiver}</receiver>
    <date>${communication.date || ''}</date>
    <send_receive_date>${communication.send_receive_date || ''}</send_receive_date>
  </details>

  <research>
    <code>${communication.research_code || ''}</code>
    <title>${communication.research_title || ''}</title>
  </research>

  <description><![CDATA[${communication.description || ''}]]></description>

  <files>
    <attachment>${communication.attachment || ''}</attachment>
    <letter_file>${communication.letter_file || ''}</letter_file>
  </files>

  <meta>
    <created_at>${communication.created_at}</created_at>
    <updated_at>${communication.updated_at}</updated_at>
  </meta>
</communication>`;

      const blob = new Blob([xml], { type: 'text/xml;charset=utf-8' });
      saveAs(blob, `مکاتبه_${communication.letter_number || communication.id}.xml`);
      toast.success('فایل XML با موفقیت دانلود شد');
    } catch (error) {
      console.error('XML export error:', error);
      toast.error('خطا در ایجاد فایل XML');
    }
    setIsExporting(false);
  };

  const handlePrint = () => {
    setShowExportMenu(false);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // ========== Loading ==========
  if (isLoading) {
    return (
      <div className="communication-details-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>در حال بارگذاری اطلاعات مکاتبه...</p>
        </div>
      </div>
    );
  }

  if (!communication) {
    return (
      <div className="communication-details-page">
        <div className="error-container">
          <AlertCircle size={64} />
          <h3>مکاتبه یافت نشد</h3>
          <p>مکاتبه مورد نظر با شناسه {id} در سیستم وجود ندارد</p>
          <button className="btn-back" onClick={() => navigate('/communication')}>
            <ArrowLeft size={16} />
            بازگشت به لیست مکاتبات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="communication-details-page" ref={contentRef}>
      {/* ========== Header ========== */}
      <div className="details-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/communication')}>
            <ArrowLeft size={18} />
            بازگشت
          </button>
          <div className="header-title">
            <Mail size={24} className="title-icon" />
            <div>
              <h1>{communication.title}</h1>
              {communication.letter_number && (
                <span className="communication-number">
                  <Hash size={14} /> {communication.letter_number}
                </span>
              )}
            </div>
          </div>
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
                  <span className="export-desc">قابل ویرایش</span>
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
                  <span className="export-desc">ساختاریافته</span>
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
        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <Hash size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">شماره مکاتبه</span>
              <span className="summary-value">{communication.letter_number || '—'}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#d1fae5', color: '#059669' }}>
              <Calendar size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">تاریخ مکاتبه</span>
              <span className="summary-value">{communication.date || '—'}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Calendar size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">تاریخ ارسال/دریافت</span>
              <span className="summary-value">{communication.send_receive_date || '—'}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
              <BookOpen size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">کد پژوهش</span>
              <span className="summary-value">{communication.research_code || '—'}</span>
            </div>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-column">
            {/* Proposal Info */}
            <div className="info-section">
              <h3><Mail size={18} /> اطلاعات اصلی</h3>
              <div className="info-row-detail">
                <span className="info-label">عنوان</span>
                <span className="info-value highlight">{communication.title}</span>
              </div>
              {communication.letter_number && (
                <div className="info-row-detail">
                  <span className="info-label">شماره مکاتبه</span>
                  <span className="info-value">{communication.letter_number}</span>
                </div>
              )}
            </div>

            {/* Sender/Receiver */}
            <div className="info-section">
              <h3><User size={18} /> ارسال‌کننده و دریافت‌کننده</h3>
              <div className="info-row-detail">
                <span className="info-label">ارسال‌کننده</span>
                <span className="info-value">{communication.sender}</span>
              </div>
              <div className="info-row-detail">
                <span className="info-label">دریافت‌کننده</span>
                <span className="info-value">{communication.receiver}</span>
              </div>
            </div>

            {/* Research */}
            {communication.research_code && (
              <div className="info-section">
                <h3><BookOpen size={18} /> پژوهش مرتبط</h3>
                <div className="info-row-detail">
                  <span className="info-label">کد پژوهش</span>
                  <span className="info-value highlight">{communication.research_code}</span>
                </div>
                {communication.research_title && (
                  <div className="info-row-detail">
                    <span className="info-label">عنوان</span>
                    <span className="info-value">{communication.research_title}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="info-column">
            {/* Dates */}
            <div className="info-section">
              <h3><Calendar size={18} /> تاریخ‌ها</h3>
              <div className="info-row-detail">
                <span className="info-label">تاریخ مکاتبه</span>
                <span className="info-value">{communication.date || '—'}</span>
              </div>
              <div className="info-row-detail">
                <span className="info-label">تاریخ ارسال/دریافت</span>
                <span className="info-value">{communication.send_receive_date || '—'}</span>
              </div>
            </div>

            {/* Description */}
            {communication.description && (
              <div className="info-section">
                <h3><FileText size={18} /> توضیحات</h3>
                <p className="description-text">{communication.description}</p>
              </div>
            )}

            {/* Files */}
            {(communication.attachment || communication.letter_file) && (
              <div className="info-section">
                <h3><Paperclip size={18} /> فایل‌ها</h3>
                <div className="files-list">
                  {communication.attachment && (
                    <div className="file-item">
                      <Paperclip size={16} className="file-icon" />
                      <span className="file-label">
                        {getFileName(communication.attachment)}
                      </span>
                      <div className="file-actions">
                        <a
                          href={communication.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="file-action"
                          title="مشاهده"
                        >
                          <Eye size={14} />
                        </a>
                        <a
                          href={communication.attachment}
                          download
                          className="file-action"
                          title="دانلود"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    </div>
                  )}
                  {communication.letter_file && (
                    <div className="file-item">
                      <FileText size={16} className="file-icon" />
                      <span className="file-label">
                        {getFileName(communication.letter_file)}
                      </span>
                      <div className="file-actions">
                        <a
                          href={communication.letter_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="file-action"
                          title="مشاهده"
                        >
                          <Eye size={14} />
                        </a>
                        <a
                          href={communication.letter_file}
                          download
                          className="file-action"
                          title="دانلود"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="info-section meta">
              <div className="meta-row">
                <span className="meta-label">شناسه</span>
                <span className="meta-value">#{toPersianNumberFn(communication.id)}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">تاریخ ایجاد</span>
                <span className="meta-value">{communication.created_at}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">آخرین بروزرسانی</span>
                <span className="meta-value">{communication.updated_at}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Edit Modal ========== */}
      {editFormOpen && communication && (
        <div className="modal-overlay" onClick={handleEditCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CommunicationForm
              initialData={communication}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          </div>
        </div>
      )}

      <style>{`
        .communication-details-page {
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

        .communication-number {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #6b7280;
          margin-top: 4px;
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
          min-width: 0;
        }

        .summary-label {
          font-size: 12px;
          color: #6b7280;
        }

        .summary-value {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
          word-break: break-word;
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
          text-align: left;
          max-width: 60%;
          word-break: break-word;
        }

        .info-value.highlight {
          color: #4f46e5;
          font-weight: 600;
        }

        .description-text {
          font-size: 13px;
          color: #374151;
          line-height: 1.9;
          text-align: justify;
          margin: 0;
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
          flex-shrink: 0;
        }

        .file-item .file-label {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a2e;
          flex: 1;
          word-break: break-all;
        }

        .file-item .file-actions {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
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
          .communication-details-page {
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
          .communication-details-page {
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

export default CommunicationDetailsPage;