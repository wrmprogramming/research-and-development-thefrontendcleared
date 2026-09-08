// src/modules/steering-committee/pages/SteeringCommitteeDetailsPage.tsx

import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSteeringCommittee } from '../hooks/useSteeringCommittee';
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
  Loader2,
  Users,
  File,
  List,
  User,
  Building2,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { SteeringCommitteeForm } from '../components/SteeringCommitteeForm';

interface SteeringCommitteeDetailsPageProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

const toPersianNumberFn = (num: any): string => {
  if (num === undefined || num === null || num === '') return '۰';
  return toPersianNumber(num);
};

export const SteeringCommitteeDetailsPage: React.FC<SteeringCommitteeDetailsPageProps> = ({ onEdit, onDelete }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useItem, delete: deleteCommittee, isDeleting } = useSteeringCommittee();
  
  const { data: committee, isLoading, refetch } = useItem(Number(id));
  
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // ========== Handle Delete ==========
  const handleDelete = async () => {
    if (window.confirm('آیا از حذف این کمیته راهبری مطمئن هستید؟')) {
      await deleteCommittee(Number(id));
      navigate('/committees-steering');
      toast.success('کمیته راهبری با موفقیت حذف شد');
    }
  };

  // ========== Handle Edit ==========
  const handleEdit = () => {
    setEditFormOpen(true);
  };

  const handleEditSuccess = () => {
    setEditFormOpen(false);
    refetch();
    toast.success('کمیته راهبری با موفقیت ویرایش شد');
  };

  const handleEditCancel = () => {
    setEditFormOpen(false);
  };

  // ========== Export Functions ==========
  const exportHTML = () => {
    if (!committee) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const approvementsCount = committee.approvements?.length || 0;

      let approvementsHtml = '';
      if (committee.approvements && committee.approvements.length > 0) {
        approvementsHtml = committee.approvements.map((a, index) => 
          `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-weight:600;color:#059669;">${index + 1}.</span>
            <span style="color:#374151;">${a.description}</span>
            <span style="color:#6b7280;">${a.responsible || '—'}</span>
            <span style="color:#6b7280;font-size:12px;">${a.deadline_date || '—'}</span>
          </div>`
        ).join('');
      }

      const researchInfo = committee.research ? `
        <div class="section"><h3>🏛️ پژوهش مرتبط</h3>
          <div class="row"><span class="lbl">کد پژوهش</span><span class="val highlight">${committee.research_code || '—'}</span></div>
          <div class="row"><span class="lbl">عنوان پژوهش</span><span class="val">${committee.research_title || '—'}</span></div>
        </div>
      ` : '';

      const html = `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>کمیته راهبری - ${committee.session_number}</title>
  <style>
    body { font-family: 'Vazir', Tahoma, sans-serif; direction: rtl; padding: 40px; max-width: 900px; margin: 0 auto; background: #f8fafc; }
    .container { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 35px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header .sub { font-size: 18px; opacity: 0.9; margin-top: 4px; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 25px; }
    .card { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e9ecef; }
    .card .lbl { font-size: 11px; color: #6b7280; }
    .card .val { font-size: 17px; font-weight: 700; margin-top: 4px; }
    .card.green { background: #d1fae5; } .card.green .val { color: #059669; }
    .card.blue { background: #eef2ff; } .card.blue .val { color: #4f46e5; }
    .card.orange { background: #fef3c7; } .card.orange .val { color: #d97706; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .section { background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 18px 22px; margin-bottom: 16px; }
    .section h3 { font-size: 15px; font-weight: 700; color: #059669; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e9ecef; }
    .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .row .lbl { color: #6b7280; }
    .row .val { font-weight: 500; color: #1a1a2e; }
    .row .val.highlight { color: #059669; font-weight: 600; }
    .desc { font-size: 13px; color: #374151; line-height: 1.9; text-align: justify; }
    .meta-section { background: #f1f5f9; border-color: #e2e8f0; }
    .approvements-section { background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 14px 18px; margin-top: 16px; }
    .approvements-section h3 { font-size: 15px; font-weight: 700; color: #059669; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e9ecef; }
    .footer { margin-top: 30px; padding-top: 16px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
    @media print { body { background: white; padding: 20px; } .container { box-shadow: none; padding: 20px; } }
    @media (max-width: 768px) { .cards { grid-template-columns: 1fr; } .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>📄 گزارش کمیته راهبری</h1>
    <div class="sub">${committee.session_number}</div>
  </div>
  <div class="cards">
    <div class="card blue"><div class="lbl">شماره جلسه</div><div class="val">${committee.session_number}</div></div>
    <div class="card green"><div class="lbl">تاریخ جلسه</div><div class="val">${committee.date}</div></div>
    <div class="card orange"><div class="lbl">تعداد مصوبات</div><div class="val">${toPersianNumberFn(approvementsCount)}</div></div>
  </div>
  <div class="grid">
    <div>
      <div class="section"><h3>📋 اطلاعات جلسه</h3>
        <div class="row"><span class="lbl">شماره جلسه</span><span class="val highlight">${committee.session_number}</span></div>
        <div class="row"><span class="lbl">تاریخ جلسه</span><span class="val">${committee.date}</span></div>
      </div>
      <div class="section"><h3>📝 توضیحات</h3>
        <div class="desc">${committee.description || '—'}</div>
      </div>
      ${researchInfo}
    </div>
    <div>
      <div class="section"><h3>📎 فایل‌ها</h3>
        ${committee.minutes_file ? `<div class="row"><span class="lbl">صورتجلسه</span><span class="val"><a href="${committee.minutes_file}" target="_blank" style="color:#059669;">مشاهده فایل</a></span></div>` : ''}
        ${committee.attachment ? `<div class="row"><span class="lbl">فایل پیوست</span><span class="val"><a href="${committee.attachment}" target="_blank" style="color:#059669;">مشاهده فایل</a></span></div>` : ''}
        ${!committee.minutes_file && !committee.attachment ? `<div class="row"><span class="lbl">فایل‌ها</span><span class="val">—</span></div>` : ''}
      </div>
      <div class="section meta-section"><h3>📋 اطلاعات تکمیلی</h3>
        <div class="row"><span class="lbl">شناسه</span><span class="val">#${toPersianNumberFn(committee.id)}</span></div>
        <div class="row"><span class="lbl">تاریخ ایجاد</span><span class="val">${committee.created_at}</span></div>
        <div class="row"><span class="lbl">آخرین بروزرسانی</span><span class="val">${committee.updated_at}</span></div>
      </div>
    </div>
  </div>
  ${approvementsHtml ? `
  <div class="approvements-section">
    <h3>📋 مصوبات</h3>
    ${approvementsHtml}
  </div>` : ''}
  <div class="footer">
    <span>📅 تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
    <span>📄 کد جلسه: ${committee.session_number}</span>
  </div>
</div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      saveAs(blob, `کمیته_راهبری_${committee.session_number}.html`);
      toast.success('فایل HTML با موفقیت دانلود شد');
    } catch (error) {
      console.error('HTML export error:', error);
      toast.error('خطا در ایجاد فایل HTML');
    }
    setIsExporting(false);
  };

  const exportJSON = () => {
    if (!committee) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const data = {
        id: committee.id,
        session_number: committee.session_number,
        date: committee.date,
        description: committee.description || '',
        minutes_file: committee.minutes_file || null,
        attachment: committee.attachment || null,
        research: committee.research ? {
          id: typeof committee.research === 'object' ? (committee.research as any)?.id : committee.research,
          code: committee.research_code || null,
          title: committee.research_title || null,
        } : null,
        approvements: committee.approvements?.map(a => ({
          id: a.id,
          description: a.description,
          deadline_date: a.deadline_date || null,
          responsible: a.responsible,
        })) || [],
        created_at: committee.created_at,
        updated_at: committee.updated_at,
      };

      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
      saveAs(blob, `کمیته_راهبری_${committee.session_number}.json`);
      toast.success('فایل JSON با موفقیت دانلود شد');
    } catch (error) {
      console.error('JSON export error:', error);
      toast.error('خطا در ایجاد فایل JSON');
    }
    setIsExporting(false);
  };

  const exportTXT = () => {
    if (!committee) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      let approvementsText = '';
      if (committee.approvements && committee.approvements.length > 0) {
        approvementsText = committee.approvements.map((a, i) => 
          `  ${i+1}. ${a.description} (مسئول: ${a.responsible || '—'}) ${a.deadline_date ? `- مهلت: ${a.deadline_date}` : ''}`
        ).join('\n');
      }

      const researchText = committee.research ? `
پژوهش مرتبط:
  کد: ${committee.research_code || '—'}
  عنوان: ${committee.research_title || '—'}
` : '';

      const text = `
═══════════════════════════════════════════════════════════
                    گزارش کمیته راهبری
═══════════════════════════════════════════════════════════

شماره جلسه: ${committee.session_number}
تاریخ جلسه: ${committee.date}

───────────────────────────────────────────────────────────
                    توضیحات
───────────────────────────────────────────────────────────

${committee.description || '—'}

${researchText ? `───────────────────────────────────────────────────────────
${researchText}` : ''}
───────────────────────────────────────────────────────────
                    فایل‌ها
───────────────────────────────────────────────────────────

${committee.minutes_file ? `صورتجلسه: ${committee.minutes_file}` : 'صورتجلسه: —'}
${committee.attachment ? `فایل پیوست: ${committee.attachment}` : 'فایل پیوست: —'}

${approvementsText ? `───────────────────────────────────────────────────────────
مصوبات:
${approvementsText}
` : ''}
═══════════════════════════════════════════════════════════
تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}
═══════════════════════════════════════════════════════════
`;

      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `کمیته_راهبری_${committee.session_number}.txt`);
      toast.success('فایل TXT با موفقیت دانلود شد');
    } catch (error) {
      console.error('TXT export error:', error);
      toast.error('خطا در ایجاد فایل TXT');
    }
    setIsExporting(false);
  };

  const exportToPDF = async () => {
    if (!committee) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      let approvementsHtml = '';
      if (committee.approvements && committee.approvements.length > 0) {
        approvementsHtml = committee.approvements.map((a, index) => 
          `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f3f4f6;font-size:11px;">
            <span style="font-weight:600;color:#059669;">${index + 1}.</span>
            <span style="color:#374151;">${a.description}</span>
            <span style="color:#6b7280;">${a.responsible || '—'}</span>
            <span style="color:#6b7280;font-size:10px;">${a.deadline_date || '—'}</span>
          </div>`
        ).join('');
      }

      const researchText = committee.research ? `
        <div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f3f4f6;font-size:11px;">
          <span style="color:#6b7280;">کد پژوهش</span>
          <span style="font-weight:600;color:#059669;">${committee.research_code || '—'}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11px;">
          <span style="color:#6b7280;">عنوان پژوهش</span>
          <span style="font-weight:500;">${committee.research_title || '—'}</span>
        </div>
      ` : '';

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
          <div style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 25px 30px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 22px; font-weight: 700;">گزارش کمیته راهبری</div>
            <div style="font-size: 15px; opacity: 0.9; margin-top: 4px;">${committee.session_number}</div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;">
            <div style="background: #eef2ff; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">شماره جلسه</div>
              <div style="font-size: 13px; font-weight: 700; color: #4f46e5;">${committee.session_number}</div>
            </div>
            <div style="background: #d1fae5; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">تاریخ جلسه</div>
              <div style="font-size: 13px; font-weight: 700; color: #059669;">${committee.date}</div>
            </div>
            <div style="background: #fef3c7; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">تعداد مصوبات</div>
              <div style="font-size: 13px; font-weight: 700; color: #d97706;">${toPersianNumberFn(committee.approvements?.length || 0)}</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div>
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #059669; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">اطلاعات جلسه</div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">شماره جلسه</span>
                  <span style="font-weight: 600; color: #059669;">${committee.session_number}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
                  <span style="color: #6b7280;">تاریخ جلسه</span>
                  <span style="font-weight: 500;">${committee.date}</span>
                </div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px;">
                <div style="font-size: 12px; font-weight: 700; color: #059669; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">توضیحات</div>
                <div style="font-size: 11px; color: #374151; line-height: 1.7; text-align: justify;">${committee.description || '—'}</div>
              </div>
            </div>
            <div>
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #059669; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">فایل‌ها</div>
                ${committee.minutes_file ? `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">صورتجلسه</span><span style="color:#059669;">✓</span></div>` : ''}
                ${committee.attachment ? `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11px;"><span style="color:#6b7280;">فایل پیوست</span><span style="color:#059669;">✓</span></div>` : ''}
                ${!committee.minutes_file && !committee.attachment ? `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11px;"><span style="color:#6b7280;">فایل‌ها</span><span style="color:#6b7280;">—</span></div>` : ''}
              </div>
              ${committee.research ? `
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #059669; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">پژوهش مرتبط</div>
                ${researchText}
              </div>` : ''}
              ${approvementsHtml ? `
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #059669; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">مصوبات</div>
                ${approvementsHtml}
              </div>` : ''}
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px;">
                <div style="font-size: 12px; font-weight: 700; color: #059669; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">اطلاعات تکمیلی</div>
                <div style="display: flex; justify-content: space-between; padding: 2px 0; font-size: 10px; border-bottom: 1px solid #f3f4f6;">
                  <span style="color: #6b7280;">شناسه</span>
                  <span style="font-weight: 500;">#${toPersianNumberFn(committee.id)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 2px 0; font-size: 10px;">
                  <span style="color: #6b7280;">تاریخ ایجاد</span>
                  <span style="font-weight: 500;">${committee.created_at}</span>
                </div>
              </div>
            </div>
          </div>
          <div style="margin-top: 20px; padding-top: 12px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 9px; color: #9ca3af;">
            <span>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
            <span>کد جلسه: ${committee.session_number}</span>
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

      pdf.save(`کمیته_راهبری_${committee.session_number}.pdf`);
      toast.success('فایل PDF با موفقیت دانلود شد');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('خطا در ایجاد فایل PDF');
    }
    setIsExporting(false);
  };

  const exportToExcel = () => {
    if (!committee) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const data = [
        {
          'شماره جلسه': committee.session_number,
          'تاریخ جلسه': committee.date,
          'توضیحات': committee.description || '',
          'تعداد مصوبات': committee.approvements?.length || 0,
          'صورتجلسه': committee.minutes_file || '—',
          'فایل پیوست': committee.attachment || '—',
          'کد پژوهش': committee.research_code || '—',
          'عنوان پژوهش': committee.research_title || '—',
          'تاریخ ایجاد': committee.created_at,
          'آخرین بروزرسانی': committee.updated_at,
        }
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);

      const colWidths = [
        { wch: 20 }, { wch: 15 }, { wch: 50 }, { wch: 15 },
        { wch: 30 }, { wch: 30 }, { wch: 20 }, { wch: 35 },
        { wch: 20 }, { wch: 20 },
      ];

      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'کمیته_راهبری');
      XLSX.writeFile(wb, `کمیته_راهبری_${committee.session_number}.xlsx`);
      toast.success('فایل Excel با موفقیت دانلود شد');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('خطا در ایجاد فایل Excel');
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
      <div className="steering-committee-details-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>در حال بارگذاری اطلاعات کمیته راهبری...</p>
        </div>
      </div>
    );
  }

  if (!committee) {
    return (
      <div className="steering-committee-details-page">
        <div className="error-container">
          <AlertCircle size={64} />
          <h3>کمیته راهبری یافت نشد</h3>
          <p>کمیته مورد نظر با شناسه {id} در سیستم وجود ندارد</p>
          <button className="btn-back" onClick={() => navigate('/committees-steering')}>
            <ArrowLeft size={16} />
            بازگشت به لیست کمیته‌ها
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="steering-committee-details-page" ref={contentRef}>
      {/* Header */}
      <div className="details-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/committees-steering')}>
            <ArrowLeft size={18} />
            بازگشت
          </button>
          <div className="header-title">
            <Users size={24} className="title-icon" />
            <div>
              <h1>{committee.session_number}</h1>
              <span className="committee-subject-header">کمیته راهبری</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <span className="date-badge">
            <Calendar size={16} />
            {committee.date}
          </span>
        </div>
      </div>

      {/* Action Bar */}
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
          <button className="action-btn" onClick={handlePrint}>
            <Printer size={16} />
            چاپ
          </button>
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== Content - بخش اصلی که نمایش داده نمی‌شد ========== */}
      <div className="details-content">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#d1fae5', color: '#059669' }}>
              <FileText size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">شماره جلسه</span>
              <span className="summary-value">{committee.session_number}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#d1fae5', color: '#059669' }}>
              <Calendar size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">تاریخ جلسه</span>
              <span className="summary-value">{committee.date}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#d1fae5', color: '#059669' }}>
              <List size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">تعداد مصوبات</span>
              <span className="summary-value">{toPersianNumberFn(committee.approvements?.length || 0)}</span>
            </div>
          </div>
          {committee.research && (
            <div className="summary-card">
              <div className="summary-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                <Building2 size={20} />
              </div>
              <div className="summary-info">
                <span className="summary-label">پژوهش مرتبط</span>
                <span className="summary-value">{committee.research_code || committee.research_title || '—'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="info-grid">
          <div className="info-column">
            {/* اطلاعات جلسه */}
            <div className="info-section">
              <h3><FileText size={18} /> اطلاعات جلسه</h3>
              <div className="info-row-detail">
                <span className="info-label">شماره جلسه</span>
                <span className="info-value highlight">{committee.session_number}</span>
              </div>
              <div className="info-row-detail">
                <span className="info-label">تاریخ جلسه</span>
                <span className="info-value">{committee.date}</span>
              </div>
            </div>

            {/* توضیحات */}
            <div className="info-section">
              <h3><FileText size={18} /> توضیحات</h3>
              <p className={`description-text ${showFullDescription ? 'expanded' : ''}`}>
                {committee.description || '—'}
              </p>
              {committee.description && committee.description.length > 200 && (
                <button className="toggle-description" onClick={() => setShowFullDescription(!showFullDescription)}>
                  {showFullDescription ? (
                    <>مشاهده کمتر <ChevronUp size={14} /></>
                  ) : (
                    <>مشاهده بیشتر <ChevronDown size={14} /></>
                  )}
                </button>
              )}
            </div>

            {/* پژوهش مرتبط */}
            {committee.research && (
              <div className="info-section">
                <h3><Building2 size={18} /> پژوهش مرتبط</h3>
                <div className="info-row-detail">
                  <span className="info-label">کد پژوهش</span>
                  <span className="info-value highlight">{committee.research_code || '—'}</span>
                </div>
                <div className="info-row-detail">
                  <span className="info-label">عنوان پژوهش</span>
                  <span className="info-value">{committee.research_title || '—'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="info-column">
            {/* فایل‌ها */}
            <div className="info-section">
              <h3><Paperclip size={18} /> فایل‌ها</h3>
              <div className="files-list">
                {committee.minutes_file ? (
                  <div className="file-item">
                    <File size={16} className="file-icon" />
                    <span className="file-label">صورتجلسه</span>
                    <div className="file-actions">
                      <a href={committee.minutes_file} target="_blank" rel="noopener noreferrer" className="file-action" title="مشاهده">
                        <Eye size={14} />
                      </a>
                      <a href={committee.minutes_file} download className="file-action" title="دانلود">
                        <Download size={14} />
                      </a>
                    </div>
                  </div>
                ) : null}
                {committee.attachment ? (
                  <div className="file-item">
                    <File size={16} className="file-icon" />
                    <span className="file-label">فایل پیوست</span>
                    <div className="file-actions">
                      <a href={committee.attachment} target="_blank" rel="noopener noreferrer" className="file-action" title="مشاهده">
                        <Eye size={14} />
                      </a>
                      <a href={committee.attachment} download className="file-action" title="دانلود">
                        <Download size={14} />
                      </a>
                    </div>
                  </div>
                ) : null}
                {!committee.minutes_file && !committee.attachment && (
                  <span className="text-muted">هیچ فایلی وجود ندارد</span>
                )}
              </div>
            </div>

            {/* مصوبات */}
            {committee.approvements && committee.approvements.length > 0 && (
              <div className="info-section">
                <h3><List size={18} /> مصوبات</h3>
                <div className="approvements-list">
                  {committee.approvements.map((approvement, index) => (
                    <div key={index} className="approvement-item">
                      <div className="approvement-header">
                        <span className="approvement-number">{toPersianNumberFn(index + 1)}</span>
                        <span className="approvement-description">{approvement.description}</span>
                      </div>
                      <div className="approvement-meta">
                        {approvement.responsible && (
                          <span className="approvement-responsible">
                            <User size={14} />
                            {approvement.responsible}
                          </span>
                        )}
                        {approvement.deadline_date && (
                          <span className="approvement-deadline">
                            <Calendar size={14} />
                            مهلت: {approvement.deadline_date}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* اطلاعات تکمیلی */}
            <div className="info-section meta">
              <div className="meta-row"><span className="meta-label">شناسه</span><span className="meta-value">#{toPersianNumberFn(committee.id)}</span></div>
              <div className="meta-row"><span className="meta-label">تاریخ ایجاد</span><span className="meta-value">{committee.created_at}</span></div>
              <div className="meta-row"><span className="meta-label">آخرین بروزرسانی</span><span className="meta-value">{committee.updated_at}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Edit */}
      {editFormOpen && committee && (
        <div className="modal-overlay" onClick={handleEditCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <SteeringCommitteeForm
              initialData={committee}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          </div>
        </div>
      )}

      <style>{`
        .steering-committee-details-page {
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
          border-top-color: #059669;
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
          color: #059669;
        }

        .header-title h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: #1a1a2e;
        }

        .committee-subject-header {
          font-size: 14px;
          color: #6b7280;
          display: block;
        }

        .date-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #d1fae5;
          border-radius: 8px;
          font-size: 14px;
          color: #059669;
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
          background: #059669;
          color: white;
          border-color: #059669;
        }

        .action-btn.primary:hover {
          background: #047857;
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
          max-width: 700px;
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
          color: #059669;
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
          color: #059669;
          font-size: 13px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .toggle-description:hover {
          background: #d1fae5;
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
          background: #d1fae5;
          border: 1px solid #a7f3d0;
          border-radius: 8px;
        }

        .file-item .file-icon {
          color: #059669;
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
          color: #059669;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .file-item .file-action:hover {
          background: #a7f3d0;
          color: #047857;
        }

        .approvements-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .approvement-item {
          background: #d1fae5;
          border: 1px solid #a7f3d0;
          border-radius: 6px;
          padding: 10px 14px;
        }

        .approvement-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .approvement-number {
          font-weight: 700;
          color: #059669;
          font-size: 13px;
          min-width: 24px;
        }

        .approvement-description {
          font-size: 14px;
          color: #1a1a2e;
          font-weight: 500;
        }

        .approvement-meta {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          font-size: 12px;
          color: #6b7280;
        }

        .approvement-responsible,
        .approvement-deadline {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .text-muted {
          color: #9ca3af;
        }

        .info-section.meta {
          background: #d1fae5;
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
          .steering-committee-details-page {
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
          .steering-committee-details-page {
            background: white;
            padding: 20px;
          }

          .action-bar, .btn-back, .export-wrapper {
            display: none !important;
          }

          .details-header {
            box-shadow: none;
            border-bottom: 2px solid #a7f3d0;
          }

          .info-section {
            border: 1px solid #a7f3d0;
            break-inside: avoid;
          }

          .summary-card {
            border: 1px solid #a7f3d0;
          }
        }
      `}</style>
    </div>
  );
};

export default SteeringCommitteeDetailsPage;