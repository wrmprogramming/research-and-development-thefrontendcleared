// src/modules/contract/components/ContractDetailsPage.tsx

import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContract } from '../hooks/useContract';
import { ACTIVITY_STATUSES, CONTRACT_STATUSES } from '../types/contract.types';
import { formatCurrency } from '../../../utils/formatter.utils';
import dateUtils from '@utils/dateUtils';
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
  Copy,
  Check,
  Layers,
  BarChart3,
  TrendingUp,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { ContractForm } from '../components/ContractForm';

interface ContractDetailsPageProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

// ===== تابع تبدیل اعداد به فارسی =====
const toPersianNumber = (num: number): string => {
  if (num === undefined || num === null) return '۰';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

const toNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  return 0;
};

export const ContractDetailsPage: React.FC<ContractDetailsPageProps> = ({ onEdit, onDelete }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useItem, delete: deleteContract, isDeleting } = useContract();
  const { data: contract, isLoading, refetch } = useItem(Number(id));
  
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  // ========== Handle Delete ==========
  const handleDelete = async () => {
    if (window.confirm('آیا از حذف این قرارداد مطمئن هستید؟')) {
      await deleteContract(Number(id));
      navigate('/contract');
      toast.success('قرارداد با موفقیت حذف شد');
    }
  };

  // ========== Handle Edit ==========
  const handleEdit = () => {
    setEditFormOpen(true);
  };

  const handleEditSuccess = () => {
    setEditFormOpen(false);
    refetch();
    toast.success('قرارداد با موفقیت ویرایش شد');
  };

  const handleEditCancel = () => {
    setEditFormOpen(false);
  };

  // ========== Copy to Clipboard ==========
  const copyToClipboard = () => {
    if (!contract) return;
    const text = `
شماره قرارداد: ${contract.contract_number}
موضوع: ${contract.subject}
طرف قرارداد: ${contract.company_name || contract.university_name || '—'}
مبلغ کل: ${formatCurrency(contract.total_amount)}
وضعیت: ${CONTRACT_STATUSES[contract.status]?.label || contract.status}
تاریخ شروع: ${contract.start_date}
تاریخ پایان: ${contract.end_date}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('اطلاعات قرارداد کپی شد');
    setTimeout(() => setCopied(false), 3000);
  };

  // ========== Export to HTML ==========
  const exportHTML = () => {
    if (!contract) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const statusInfo = CONTRACT_STATUSES[contract.status];
      const remaining = contract.total_amount - contract.paid_amount;
      const financialProgress = contract.total_amount > 0
        ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100)
        : 0;
      const physicalProgress = toNumber(contract.physical_progress);
      const contractorName = contract.company_name || contract.university_name || '—';

      const html = `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>قرارداد ${contract.contract_number}</title>
  <style>
    body { font-family: 'Vazir', Tahoma, sans-serif; direction: rtl; padding: 40px; max-width: 900px; margin: 0 auto; background: #f8fafc; }
    .container { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 35px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header .sub { font-size: 18px; opacity: 0.9; margin-top: 4px; }
    .header .status { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 24px; border-radius: 20px; font-size: 14px; margin-top: 10px; }
    
    .cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 25px; }
    .card { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e9ecef; }
    .card .lbl { font-size: 11px; color: #6b7280; }
    .card .val { font-size: 17px; font-weight: 700; margin-top: 4px; }
    .card.blue { background: #eef2ff; } .card.blue .val { color: #4f46e5; }
    .card.green { background: #d1fae5; } .card.green .val { color: #059669; }
    .card.red { background: #fee2e2; } .card.red .val { color: #dc2626; }
    .card.orange { background: #fef3c7; } .card.orange .val { color: #d97706; }
    .card.purple { background: #dbeafe; } .card.purple .val { color: #6366f1; }
    
    .progress-section { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 18px 22px; background: #f8fafc; border-radius: 10px; border: 1px solid #e9ecef; margin-bottom: 25px; }
    .progress-item .head { display: flex; justify-content: space-between; font-size: 13px; color: #374151; margin-bottom: 6px; }
    .progress-item .bar { height: 10px; background: #e9ecef; border-radius: 6px; overflow: hidden; }
    .progress-item .bar .fill { height: 100%; border-radius: 6px; }
    .fill.financial { background: linear-gradient(90deg, #059669, #10b981); }
    .fill.physical { background: linear-gradient(90deg, #4f46e5, #818cf8); }
    
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
    
    .signature { margin-top: 35px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding-top: 20px; border-top: 2px dashed #e9ecef; }
    .signature .sig-item { text-align: center; }
    .signature .sig-item .line { width: 200px; height: 1px; border-bottom: 2px solid #1a1a2e; margin: 50px auto 8px auto; }
    .signature .sig-item .label { font-size: 12px; color: #6b7280; }
    
    .footer { margin-top: 30px; padding-top: 16px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
    
    .download-btn { display: inline-block; background: #4f46e5; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
    
    @media print { body { background: white; padding: 20px; } .container { box-shadow: none; padding: 20px; } }
    @media (max-width: 768px) { .cards { grid-template-columns: repeat(3, 1fr); } .grid { grid-template-columns: 1fr; } .progress-section { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>📄 گزارش قرارداد</h1>
    <div class="sub">${contract.contract_number}</div>
    <div class="status">${statusInfo?.label || contract.status}</div>
  </div>

  <div class="cards">
    <div class="card blue"><div class="lbl">مبلغ کل</div><div class="val">${toPersianNumber(Number(contract.total_amount))} ریال</div></div>
    <div class="card green"><div class="lbl">مبلغ پرداختی</div><div class="val">${toPersianNumber(Number(contract.paid_amount))} ریال</div></div>
    <div class="card ${remaining > 0 ? 'red' : 'green'}"><div class="lbl">مبلغ باقیمانده</div><div class="val">${toPersianNumber(Number(remaining))} ریال</div></div>
    <div class="card orange"><div class="lbl">پیشرفت مالی</div><div class="val">${toPersianNumber(financialProgress)}%</div></div>
    <div class="card purple"><div class="lbl">پیشرفت فیزیکی</div><div class="val">${toPersianNumber(physicalProgress)}%</div></div>
  </div>

  <div class="progress-section">
    <div class="progress-item">
      <div class="head"><span>پیشرفت مالی</span><span>${toPersianNumber(financialProgress)}%</span></div>
      <div class="bar"><div class="fill financial" style="width:${financialProgress}%;"></div></div>
    </div>
    <div class="progress-item">
      <div class="head"><span>پیشرفت فیزیکی</span><span>${toPersianNumber(physicalProgress)}%</span></div>
      <div class="bar"><div class="fill physical" style="width:${physicalProgress}%;"></div></div>
    </div>
  </div>

  <div class="grid">
    <div>
      <div class="section">
        <h3>🏢 طرف قرارداد</h3>
        <div class="row"><span class="lbl">طرف قرارداد</span><span class="val highlight">${contractorName}</span></div>
        <div class="row"><span class="lbl">نوع</span><span class="val">${contract.affiliation_type === 'UNIVERSITY' ? 'دانشگاه' : 'شرکت'}</span></div>
      </div>
      <div class="section">
        <h3>📅 تاریخ‌ها</h3>
        <div class="row"><span class="lbl">تاریخ قرارداد</span><span class="val">${contract.date}</span></div>
        <div class="row"><span class="lbl">تاریخ شروع</span><span class="val">${contract.start_date}</span></div>
        <div class="row"><span class="lbl">تاریخ پایان</span><span class="val">${contract.end_date}</span></div>
        <div class="row"><span class="lbl">مدت قرارداد</span><span class="val highlight">${toPersianNumber(contract.contract_duration_months || 0)} ماه</span></div>
      </div>
      <div class="section">
        <h3>💰 اطلاعات مالی</h3>
        <div class="row"><span class="lbl">مبلغ کل</span><span class="val highlight">${toPersianNumber(Number(contract.total_amount))} ریال</span></div>
        <div class="row"><span class="lbl">مبلغ پرداختی</span><span class="val" style="color:#059669;">${toPersianNumber(Number(contract.paid_amount))} ریال</span></div>
        <div class="row"><span class="lbl">مبلغ باقیمانده</span><span class="val" style="color:${remaining > 0 ? '#d97706' : '#059669'};">${toPersianNumber(Number(remaining))} ریال</span></div>
      </div>
    </div>
    <div>
      ${contract.commitments ? `<div class="section"><h3>✅ تعهدات طرفین</h3><div class="desc">${contract.commitments}</div></div>` : ''}
      ${contract.services_description ? `<div class="section"><h3>🛠️ شرح خدمات</h3><div class="desc">${contract.services_description}</div></div>` : ''}
      ${contract.documents ? `<div class="section"><h3>📄 اسناد و مدارک</h3><div class="desc">${contract.documents}</div></div>` : ''}
      ${contract.contractor_address ? `<div class="section"><h3>📍 نشانی طرفین</h3><div class="desc">${contract.contractor_address}</div></div>` : ''}
      <div class="section meta-section">
        <h3>📋 اطلاعات تکمیلی</h3>
        <div class="row"><span class="lbl">شناسه</span><span class="val">#${toPersianNumber(contract.id)}</span></div>
        <div class="row"><span class="lbl">نسخه</span><span class="val">${toPersianNumber(contract.version)}</span></div>
        <div class="row"><span class="lbl">بایگانی</span><span class="val">${contract.is_archived ? 'بله' : 'خیر'}</span></div>
        <div class="row"><span class="lbl">تاریخ ایجاد</span><span class="val">${contract.created_at}</span></div>
      </div>
      
    </div>
  </div>

  <div class="signature">
    <div class="sig-item"><div class="line"></div><div class="label">امضای کارفرما</div></div>
    <div class="sig-item"><div class="line"></div><div class="label">امضای پیمانکار</div></div>
  </div>

  <div class="footer">
    <span>📅 تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
    <span>📄 شماره قرارداد: ${contract.contract_number}</span>
  </div>
</div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      saveAs(blob, `قرارداد_${contract.contract_number}.html`);
      toast.success('فایل HTML با موفقیت دانلود شد');

    } catch (error) {
      console.error('HTML export error:', error);
      toast.error('خطا در ایجاد فایل HTML');
    }
    setIsExporting(false);
  };

  // ========== Export to JSON ==========
  const exportJSON = () => {
    if (!contract) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const data = {
        contract_number: contract.contract_number,
        subject: contract.subject,
        contractor: contract.company_name || contract.university_name || null,
        affiliation_type: contract.affiliation_type,
        total_amount: Number(contract.total_amount),
        paid_amount: Number(contract.paid_amount),
        remaining_amount: Number(contract.total_amount - contract.paid_amount),
        financial_progress: contract.total_amount > 0
          ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100)
          : 0,
        physical_progress: toNumber(contract.physical_progress),
        status: contract.status,
        date: contract.date,
        start_date: contract.start_date,
        end_date: contract.end_date,
        duration_months: contract.contract_duration_months || 0,
        version: contract.version,
        is_archived: contract.is_archived,
        commitments: contract.commitments || null,
        services_description: contract.services_description || null,
        documents: contract.documents || null,
        contractor_address: contract.contractor_address || null,
        created_at: contract.created_at,
        updated_at: contract.updated_at,
        attachments: contract.attachments?.map(att => ({
          id: att.id,
          filename: att.filename,
          file: att.file,
          size: att.size,
          uploaded_at: att.uploaded_at
        })) || []
      };

      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
      saveAs(blob, `قرارداد_${contract.contract_number}.json`);
      toast.success('فایل JSON با موفقیت دانلود شد');

    } catch (error) {
      console.error('JSON export error:', error);
      toast.error('خطا در ایجاد فایل JSON');
    }
    setIsExporting(false);
  };

  // ========== Export to CSV ==========
  const exportCSV = () => {
    if (!contract) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const rows = [
        ['فیلد', 'مقدار'],
        ['شماره قرارداد', contract.contract_number],
        ['موضوع', contract.subject],
        ['طرف قرارداد', contract.company_name || contract.university_name || '—'],
        ['نوع همکار', contract.affiliation_type === 'UNIVERSITY' ? 'دانشگاه' : 'شرکت'],
        ['مبلغ کل', toPersianNumber(Number(contract.total_amount))],
        ['مبلغ پرداختی', toPersianNumber(Number(contract.paid_amount))],
        ['مبلغ باقیمانده', toPersianNumber(Number(contract.total_amount - contract.paid_amount))],
        ['پیشرفت مالی', toPersianNumber(contract.total_amount > 0 ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100) : 0)],
        ['پیشرفت فیزیکی', toPersianNumber(toNumber(contract.physical_progress))],
        ['وضعیت', CONTRACT_STATUSES[contract.status]?.label || contract.status],
        ['تاریخ قرارداد', contract.date],
        ['تاریخ شروع', contract.start_date],
        ['تاریخ پایان', contract.end_date],
        ['مدت (ماه)', toPersianNumber(contract.contract_duration_months || 0)],
        ['نسخه', toPersianNumber(contract.version)],
        ['بایگانی', contract.is_archived ? 'بله' : 'خیر'],
      ];

      if (contract.commitments) rows.push(['تعهدات طرفین', contract.commitments]);
      if (contract.services_description) rows.push(['شرح خدمات', contract.services_description]);
      if (contract.documents) rows.push(['اسناد و مدارک', contract.documents]);
      if (contract.contractor_address) rows.push(['نشانی طرفین', contract.contractor_address]);

      const csvContent = rows.map(row => row.join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `قرارداد_${contract.contract_number}.csv`);
      toast.success('فایل CSV با موفقیت دانلود شد');

    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('خطا در ایجاد فایل CSV');
    }
    setIsExporting(false);
  };

  // ========== Export to TXT ==========
  const exportTXT = () => {
    if (!contract) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const statusInfo = CONTRACT_STATUSES[contract.status];
      const remaining = contract.total_amount - contract.paid_amount;
      const financialProgress = contract.total_amount > 0
        ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100)
        : 0;
      const physicalProgress = toNumber(contract.physical_progress);
      const contractorName = contract.company_name || contract.university_name || '—';

      const text = `
═══════════════════════════════════════════════════════════
                    گزارش قرارداد
═══════════════════════════════════════════════════════════

شماره قرارداد: ${contract.contract_number}
موضوع: ${contract.subject}
طرف قرارداد: ${contractorName}
نوع همکار: ${contract.affiliation_type === 'UNIVERSITY' ? 'دانشگاه' : 'شرکت'}
وضعیت: ${statusInfo?.label || contract.status}
نسخه: ${toPersianNumber(contract.version)}

───────────────────────────────────────────────────────────
                    خلاصه اطلاعات
───────────────────────────────────────────────────────────

مبلغ کل: ${toPersianNumber(Number(contract.total_amount))} ریال
مبلغ پرداختی: ${toPersianNumber(Number(contract.paid_amount))} ریال
مبلغ باقیمانده: ${toPersianNumber(Number(remaining))} ریال
پیشرفت مالی: ${toPersianNumber(financialProgress)}%
پیشرفت فیزیکی: ${toPersianNumber(physicalProgress)}%

───────────────────────────────────────────────────────────
                    تاریخ‌ها
───────────────────────────────────────────────────────────

تاریخ قرارداد: ${contract.date}
تاریخ شروع: ${contract.start_date}
تاریخ پایان: ${contract.end_date}
مدت قرارداد: ${toPersianNumber(contract.contract_duration_months || 0)} ماه

───────────────────────────────────────────────────────────
                    اطلاعات تکمیلی
───────────────────────────────────────────────────────────

شناسه: #${toPersianNumber(contract.id)}
بایگانی: ${contract.is_archived ? 'بله' : 'خیر'}
تاریخ ایجاد: ${contract.created_at}
تاریخ بروزرسانی: ${contract.updated_at}

${contract.commitments ? `───────────────────────────────────────────────────────────
تعهدات طرفین:
${contract.commitments}
` : ''}
${contract.services_description ? `───────────────────────────────────────────────────────────
شرح خدمات:
${contract.services_description}
` : ''}
${contract.documents ? `───────────────────────────────────────────────────────────
اسناد و مدارک:
${contract.documents}
` : ''}
${contract.contractor_address ? `───────────────────────────────────────────────────────────
نشانی طرفین:
${contract.contractor_address}
` : ''}
${contract.attachments && contract.attachments.length > 0 ? `───────────────────────────────────────────────────────────
فایل‌های پیوست:
${contract.attachments.map(att => `  - ${att.filename || att.file.split('/').pop()} (${(att.size / 1024).toFixed(1)} KB)`).join('\n')}
` : ''}
═══════════════════════════════════════════════════════════
تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}
═══════════════════════════════════════════════════════════
`;

      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `قرارداد_${contract.contract_number}.txt`);
      toast.success('فایل TXT با موفقیت دانلود شد');

    } catch (error) {
      console.error('TXT export error:', error);
      toast.error('خطا در ایجاد فایل TXT');
    }
    setIsExporting(false);
  };

  // ========== Export to XML ==========
  const exportXML = () => {
    if (!contract) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const statusInfo = CONTRACT_STATUSES[contract.status];
      const remaining = contract.total_amount - contract.paid_amount;
      const financialProgress = contract.total_amount > 0
        ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100)
        : 0;
      const physicalProgress = toNumber(contract.physical_progress);
      const contractorName = contract.company_name || contract.university_name || '—';

      let attachmentsXml = '';
      if (contract.attachments && contract.attachments.length > 0) {
        attachmentsXml = contract.attachments.map(att => 
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
<contract>
  <header>
    <contract_number>${contract.contract_number}</contract_number>
    <subject>${contract.subject}</subject>
    <contractor>${contractorName}</contractor>
    <affiliation_type>${contract.affiliation_type}</affiliation_type>
    <status>${statusInfo?.label || contract.status}</status>
    <status_code>${contract.status}</status_code>
    <version>${toPersianNumber(contract.version)}</version>
  </header>
  
  <financial>
    <total_amount>${toPersianNumber(Number(contract.total_amount))}</total_amount>
    <paid_amount>${toPersianNumber(Number(contract.paid_amount))}</paid_amount>
    <remaining_amount>${toPersianNumber(Number(remaining))}</remaining_amount>
    <financial_progress>${toPersianNumber(financialProgress)}</financial_progress>
    <physical_progress>${toPersianNumber(physicalProgress)}</physical_progress>
  </financial>
  
  <dates>
    <date>${contract.date}</date>
    <start_date>${contract.start_date}</start_date>
    <end_date>${contract.end_date}</end_date>
    <duration_months>${toPersianNumber(contract.contract_duration_months || 0)}</duration_months>
  </dates>
  
  <details>
    <id>${toPersianNumber(contract.id)}</id>
    <is_archived>${contract.is_archived}</is_archived>
    <created_at>${contract.created_at}</created_at>
    <updated_at>${contract.updated_at}</updated_at>
  </details>
  
  ${contract.commitments ? `<commitments>${contract.commitments}</commitments>` : ''}
  ${contract.services_description ? `<services>${contract.services_description}</services>` : ''}
  ${contract.documents ? `<documents>${contract.documents}</documents>` : ''}
  ${contract.contractor_address ? `<contractor_address>${contract.contractor_address}</contractor_address>` : ''}
  
  <attachments>
${attachmentsXml}
  </attachments>
</contract>`;

      const blob = new Blob([xml], { type: 'text/xml;charset=utf-8' });
      saveAs(blob, `قرارداد_${contract.contract_number}.xml`);
      toast.success('فایل XML با موفقیت دانلود شد');

    } catch (error) {
      console.error('XML export error:', error);
      toast.error('خطا در ایجاد فایل XML');
    }
    setIsExporting(false);
  };

  // ========== Export to Word ==========
  const exportToWord = () => {
    if (!contract) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const statusInfo = CONTRACT_STATUSES[contract.status];
      const remaining = contract.total_amount - contract.paid_amount;
      const financialProgress = contract.total_amount > 0
        ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100)
        : 0;
      const physicalProgress = toNumber(contract.physical_progress);
      const contractorName = contract.company_name || contract.university_name || '—';

      let attachmentsHtml = '';
      if (contract.attachments && contract.attachments.length > 0) {
        attachmentsHtml = contract.attachments.map(att => 
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
  <title>قرارداد ${contract.contract_number}</title>
  <style>
    body { direction: rtl; font-family: 'B Nazanin', 'Vazir', Tahoma, sans-serif; padding: 35px 40px; max-width: 850px; margin: 0 auto; background: #ffffff; color: #1a1a2e; }
    .header { background: #4f46e5; color: white; padding: 35px 40px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; color: white; }
    .header .sub { font-size: 18px; opacity: 0.9; margin-top: 4px; color: white; }
    .header .status { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 24px; border-radius: 20px; font-size: 14px; margin-top: 10px; color: white; font-weight: 600; }
    .cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 25px; }
    .card { border-radius: 10px; padding: 16px 14px; text-align: center; border: 1px solid #e9ecef; }
    .card .lbl { font-size: 11px; color: #6b7280; font-weight: 500; }
    .card .val { font-size: 17px; font-weight: 700; margin-top: 4px; }
    .progress-section { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 18px 22px; background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; margin-bottom: 25px; }
    .progress-item .head { display: flex; justify-content: space-between; font-size: 13px; color: #374151; margin-bottom: 6px; font-weight: 500; }
    .progress-item .head .value { font-weight: 700; color: #1a1a2e; }
    .progress-item .bar { height: 10px; background: #e9ecef; border-radius: 6px; overflow: hidden; }
    .progress-item .bar .fill { height: 100%; border-radius: 6px; }
    .progress-item .bar .fill.financial { background: #059669; }
    .progress-item .bar .fill.physical { background: #4f46e5; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .section { background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 18px 22px; margin-bottom: 16px; }
    .section:last-child { margin-bottom: 0; }
    .section h3 { font-size: 15px; font-weight: 700; color: #4f46e5; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e9ecef; }
    .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .row .lbl { color: #6b7280; }
    .row .val { font-weight: 500; color: #1a1a2e; }
    .row .val.highlight { color: #4f46e5; font-weight: 600; }
    .row .val.success { color: #059669; }
    .row .val.warning { color: #d97706; }
    .desc { font-size: 13px; color: #374151; line-height: 1.9; text-align: justify; }
    .meta-section { background: #f1f5f9; border-color: #e2e8f0; }
    .meta-section .row { font-size: 12px; padding: 3px 0; }
    .meta-section .row .lbl { color: #64748b; }
    .attachments-section { background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 14px 18px; }
    .attachments-section h3 { font-size: 15px; font-weight: 700; color: #4f46e5; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e9ecef; }
    .signature { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding-top: 20px; border-top: 2px dashed #e9ecef; }
    .signature .sig-item { text-align: center; }
    .signature .sig-item .line { width: 200px; height: 1px; border-bottom: 2px solid #1a1a2e; margin: 50px auto 8px auto; }
    .signature .sig-item .label { font-size: 12px; color: #6b7280; font-weight: 500; }
    .footer { margin-top: 30px; padding-top: 16px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
    @media (max-width: 768px) { body { padding: 20px; } .cards { grid-template-columns: repeat(3, 1fr); } .grid { grid-template-columns: 1fr; } .progress-section { grid-template-columns: 1fr; } .signature { grid-template-columns: 1fr; gap: 20px; } .signature .sig-item .line { width: 100%; } }
    @media (max-width: 480px) { .cards { grid-template-columns: repeat(2, 1fr); } }
    @media print { body { padding: 20px; } .card { break-inside: avoid; } .section { break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>گزارش قرارداد</h1>
    <div class="sub">${contract.contract_number}</div>
    <div class="status">${statusInfo?.label || contract.status}</div>
  </div>
  <div class="cards">
    <div class="card" style="background:#eef2ff;"><div class="lbl">مبلغ کل</div><div class="val" style="color:#4f46e5;">${toPersianNumber(Number(contract.total_amount))} ریال</div></div>
    <div class="card" style="background:#d1fae5;"><div class="lbl">مبلغ پرداختی</div><div class="val" style="color:#059669;">${toPersianNumber(Number(contract.paid_amount))} ریال</div></div>
    <div class="card" style="background:${remaining > 0 ? '#fee2e2' : '#d1fae5'};"><div class="lbl">مبلغ باقیمانده</div><div class="val" style="color:${remaining > 0 ? '#dc2626' : '#059669'};">${toPersianNumber(Number(remaining))} ریال</div></div>
    <div class="card" style="background:#fef3c7;"><div class="lbl">پیشرفت مالی</div><div class="val" style="color:#d97706;">${toPersianNumber(financialProgress)}%</div></div>
    <div class="card" style="background:#dbeafe;"><div class="lbl">پیشرفت فیزیکی</div><div class="val" style="color:#6366f1;">${toPersianNumber(physicalProgress)}%</div></div>
  </div>
  <div class="progress-section">
    <div class="progress-item">
      <div class="head"><span>پیشرفت مالی</span><span class="value">${toPersianNumber(financialProgress)}%</span></div>
      <div class="bar"><div class="fill financial" style="width:${financialProgress}%;"></div></div>
    </div>
    <div class="progress-item">
      <div class="head"><span>پیشرفت فیزیکی</span><span class="value">${toPersianNumber(physicalProgress)}%</span></div>
      <div class="bar"><div class="fill physical" style="width:${physicalProgress}%;"></div></div>
    </div>
  </div>
  <div class="grid">
    <div>
      <div class="section"><h3>طرف قرارداد</h3><div class="row"><span class="lbl">طرف قرارداد</span><span class="val highlight">${contractorName}</span></div><div class="row"><span class="lbl">نوع</span><span class="val">${contract.affiliation_type === 'UNIVERSITY' ? 'دانشگاه' : 'شرکت'}</span></div></div>
      <div class="section"><h3>تاریخ‌ها</h3><div class="row"><span class="lbl">تاریخ قرارداد</span><span class="val">${contract.date}</span></div><div class="row"><span class="lbl">تاریخ شروع</span><span class="val">${contract.start_date}</span></div><div class="row"><span class="lbl">تاریخ پایان</span><span class="val">${contract.end_date}</span></div><div class="row"><span class="lbl">مدت قرارداد</span><span class="val highlight">${toPersianNumber(contract.contract_duration_months || 0)} ماه</span></div></div>
      <div class="section"><h3>اطلاعات مالی</h3><div class="row"><span class="lbl">مبلغ کل</span><span class="val highlight">${toPersianNumber(Number(contract.total_amount))} ریال</span></div><div class="row"><span class="lbl">مبلغ پرداختی</span><span class="val success">${toPersianNumber(Number(contract.paid_amount))} ریال</span></div><div class="row"><span class="lbl">مبلغ باقیمانده</span><span class="val ${remaining > 0 ? 'warning' : 'success'}">${toPersianNumber(Number(remaining))} ریال</span></div></div>
    </div>
    <div>
      ${contract.commitments ? `<div class="section"><h3>تعهدات طرفین</h3><div class="desc">${contract.commitments}</div></div>` : ''}
      ${contract.services_description ? `<div class="section"><h3>شرح خدمات</h3><div class="desc">${contract.services_description}</div></div>` : ''}
      ${contract.documents ? `<div class="section"><h3>اسناد و مدارک</h3><div class="desc">${contract.documents}</div></div>` : ''}
      ${contract.contractor_address ? `<div class="section"><h3>نشانی طرفین</h3><div class="desc">${contract.contractor_address}</div></div>` : ''}
      ${contract.attachments && contract.attachments.length > 0 ? `
      <div class="attachments-section">
        <h3>فایل‌های پیوست</h3>
        ${attachmentsHtml}
      </div>` : ''}
      <div class="section meta-section"><h3>اطلاعات تکمیلی</h3><div class="row"><span class="lbl">شناسه</span><span class="val">#${toPersianNumber(contract.id)}</span></div><div class="row"><span class="lbl">نسخه</span><span class="val">${toPersianNumber(contract.version)}</span></div><div class="row"><span class="lbl">بایگانی</span><span class="val">${contract.is_archived ? 'بله' : 'خیر'}</span></div><div class="row"><span class="lbl">تاریخ ایجاد</span><span class="val">${contract.created_at}</span></div></div>
    </div>
  </div>
  <div class="signature">
    <div class="sig-item"><div class="line"></div><div class="label">امضای کارفرما</div></div>
    <div class="sig-item"><div class="line"></div><div class="label">امضای پیمانکار</div></div>
  </div>
  <div class="footer">
    <span>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
    <span>شماره قرارداد: ${contract.contract_number}</span>
  </div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
      saveAs(blob, `قرارداد_${contract.contract_number}.doc`);
      toast.success('فایل Word با موفقیت دانلود شد');

    } catch (error) {
      console.error('Word export error:', error);
      toast.error('خطا در ایجاد فایل Word');
    }
    setIsExporting(false);
  };

  // ========== Export to PDF ==========
  const exportToPDF = async () => {
    if (!contract) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const statusInfo = CONTRACT_STATUSES[contract.status];
      const remaining = contract.total_amount - contract.paid_amount;
      const financialProgress = contract.total_amount > 0
        ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100)
        : 0;
      const physicalProgress = toNumber(contract.physical_progress);
      const contractorName = contract.company_name || contract.university_name || '—';

      // ساخت HTML برای PDF
      let attachmentsHtml = '';
      if (contract.attachments && contract.attachments.length > 0) {
        attachmentsHtml = contract.attachments.map(att => 
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
            <div style="font-size: 22px; font-weight: 700;">گزارش قرارداد</div>
            <div style="font-size: 15px; opacity: 0.9; margin-top: 4px;">${contract.contract_number}</div>
            <div style="margin-top: 6px;">
              <span style="display: inline-block; background: rgba(255,255,255,0.2); padding: 3px 16px; border-radius: 18px; font-size: 12px; font-weight: 500;">
                ${statusInfo?.label || contract.status}
              </span>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 16px;">
            <div style="background: #eef2ff; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">مبلغ کل</div>
              <div style="font-size: 13px; font-weight: 700; color: #4f46e5;">${toPersianNumber(Number(contract.total_amount))} ریال</div>
            </div>
            <div style="background: #d1fae5; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">مبلغ پرداختی</div>
              <div style="font-size: 13px; font-weight: 700; color: #059669;">${toPersianNumber(Number(contract.paid_amount))} ریال</div>
            </div>
            <div style="background: ${remaining > 0 ? '#fee2e2' : '#d1fae5'}; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">مبلغ باقیمانده</div>
              <div style="font-size: 13px; font-weight: 700; color: ${remaining > 0 ? '#dc2626' : '#059669'};">${toPersianNumber(Number(remaining))} ریال</div>
            </div>
            <div style="background: #fef3c7; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">پیشرفت مالی</div>
              <div style="font-size: 13px; font-weight: 700; color: #d97706;">${toPersianNumber(financialProgress)}%</div>
            </div>
            <div style="background: #dbeafe; border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 9px; color: #6b7280;">پیشرفت فیزیکی</div>
              <div style="font-size: 13px; font-weight: 700; color: #6366f1;">${toPersianNumber(physicalProgress)}%</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; padding: 12px 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e9ecef;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #374151; margin-bottom: 3px;">
                <span>پیشرفت مالی</span>
                <span style="font-weight: 600; color: #1a1a2e;">${toPersianNumber(financialProgress)}%</span>
              </div>
              <div style="height: 6px; background: #e9ecef; border-radius: 3px; overflow: hidden;">
                <div style="height: 100%; width: ${financialProgress}%; background: #059669; border-radius: 3px;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #374151; margin-bottom: 3px;">
                <span>پیشرفت فیزیکی</span>
                <span style="font-weight: 600; color: #1a1a2e;">${toPersianNumber(physicalProgress)}%</span>
              </div>
              <div style="height: 6px; background: #e9ecef; border-radius: 3px; overflow: hidden;">
                <div style="height: 100%; width: ${physicalProgress}%; background: #4f46e5; border-radius: 3px;"></div>
              </div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div>
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">طرف قرارداد</div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
                  <span style="color: #6b7280;">طرف قرارداد</span>
                  <span style="font-weight: 600; color: #4f46e5;">${contractorName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
                  <span style="color: #6b7280;">نوع</span>
                  <span style="font-weight: 500;">${contract.affiliation_type === 'UNIVERSITY' ? 'دانشگاه' : 'شرکت'}</span>
                </div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">تاریخ‌ها</div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">تاریخ قرارداد</span>
                  <span style="font-weight: 500;">${contract.date}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">تاریخ شروع</span>
                  <span style="font-weight: 500;">${contract.start_date}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">تاریخ پایان</span>
                  <span style="font-weight: 500;">${contract.end_date}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
                  <span style="color: #6b7280;">مدت قرارداد</span>
                  <span style="font-weight: 600; color: #4f46e5;">${toPersianNumber(contract.contract_duration_months || 0)} ماه</span>
                </div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">اطلاعات مالی</div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">مبلغ کل</span>
                  <span style="font-weight: 700; color: #4f46e5;">${toPersianNumber(Number(contract.total_amount))} ریال</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px;">
                  <span style="color: #6b7280;">مبلغ پرداختی</span>
                  <span style="font-weight: 700; color: #059669;">${toPersianNumber(Number(contract.paid_amount))} ریال</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
                  <span style="color: #6b7280;">مبلغ باقیمانده</span>
                  <span style="font-weight: 700; color: ${remaining > 0 ? '#d97706' : '#059669'};">${toPersianNumber(Number(remaining))} ریال</span>
                </div>
              </div>
            </div>
            <div>
              ${contract.commitments ? `
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">تعهدات طرفین</div>
                <div style="font-size: 11px; color: #374151; line-height: 1.7; text-align: justify;">${contract.commitments}</div>
              </div>` : ''}
              ${contract.services_description ? `
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">شرح خدمات</div>
                <div style="font-size: 11px; color: #374151; line-height: 1.7; text-align: justify;">${contract.services_description}</div>
              </div>` : ''}
              ${contract.documents ? `
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">اسناد و مدارک</div>
                <div style="font-size: 11px; color: #374151; line-height: 1.7; text-align: justify;">${contract.documents}</div>
              </div>` : ''}
              ${contract.contractor_address ? `
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">نشانی طرفین</div>
                <div style="font-size: 11px; color: #374151; line-height: 1.7; text-align: justify;">${contract.contractor_address}</div>
              </div>` : ''}
              ${contract.attachments && contract.attachments.length > 0 ? `
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">فایل‌های پیوست</div>
                ${attachmentsHtml}
              </div>` : ''}
              <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 14px; margin-top: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">اطلاعات تکمیلی</div>
                <div style="display: flex; justify-content: space-between; padding: 2px 0; font-size: 10px; border-bottom: 1px solid #f3f4f6;">
                  <span style="color: #6b7280;">شناسه</span>
                  <span style="font-weight: 500;">#${toPersianNumber(contract.id)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 2px 0; font-size: 10px; border-bottom: 1px solid #f3f4f6;">
                  <span style="color: #6b7280;">نسخه</span>
                  <span style="font-weight: 500;">${toPersianNumber(contract.version)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 2px 0; font-size: 10px; border-bottom: 1px solid #f3f4f6;">
                  <span style="color: #6b7280;">بایگانی</span>
                  <span style="font-weight: 500;">${contract.is_archived ? 'بله' : 'خیر'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 2px 0; font-size: 10px;">
                  <span style="color: #6b7280;">تاریخ ایجاد</span>
                  <span style="font-weight: 500;">${contract.created_at}</span>
                </div>
              </div>
            </div>
          </div>
          <div style="margin-top: 20px; padding-top: 12px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 9px; color: #9ca3af;">
            <span>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
            <span>شماره قرارداد: ${contract.contract_number}</span>
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

      pdf.save(`قرارداد_${contract.contract_number}.pdf`);
      toast.success('فایل PDF با موفقیت دانلود شد');

    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('خطا در ایجاد فایل PDF');
    }
    setIsExporting(false);
  };

  // ========== Export to Excel ==========
  const exportToExcel = () => {
    if (!contract) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const remaining = contract.total_amount - contract.paid_amount;
      const financialProgress = contract.total_amount > 0
        ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100)
        : 0;
      const physicalProgress = toNumber(contract.physical_progress);

      const data = [
        {
          'شماره قرارداد': contract.contract_number,
          'موضوع': contract.subject,
          'طرف قرارداد': contract.company_name || contract.university_name || '—',
          'نوع همکار': contract.affiliation_type === 'UNIVERSITY' ? 'دانشگاه' : 'شرکت',
          'مبلغ کل (ریال)': toPersianNumber(Number(contract.total_amount)),
          'مبلغ پرداختی (ریال)': toPersianNumber(Number(contract.paid_amount)),
          'مبلغ باقیمانده (ریال)': toPersianNumber(Number(remaining)),
          'پیشرفت مالی (%)': toPersianNumber(financialProgress),
          'پیشرفت فیزیکی (%)': toPersianNumber(physicalProgress),
          'وضعیت': CONTRACT_STATUSES[contract.status]?.label || contract.status,
          'تاریخ قرارداد': contract.date,
          'تاریخ شروع': contract.start_date,
          'تاریخ پایان': contract.end_date,
          'مدت (ماه)': toPersianNumber(contract.contract_duration_months || 0),
          'نسخه': toPersianNumber(contract.version),
          'بایگانی': contract.is_archived ? 'بله' : 'خیر',
        }
      ];

      if (contract.commitments) {
        data[0]['تعهدات طرفین'] = contract.commitments;
      }
      if (contract.services_description) {
        data[0]['شرح خدمات'] = contract.services_description;
      }
      if (contract.documents) {
        data[0]['اسناد و مدارک'] = contract.documents;
      }
      if (contract.contractor_address) {
        data[0]['نشانی طرفین'] = contract.contractor_address;
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);

      const colWidths = [
        { wch: 20 }, { wch: 30 }, { wch: 25 }, { wch: 12 }, { wch: 18 },
        { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
      ];

      if (contract.commitments) colWidths.push({ wch: 40 });
      if (contract.services_description) colWidths.push({ wch: 40 });
      if (contract.documents) colWidths.push({ wch: 40 });
      if (contract.contractor_address) colWidths.push({ wch: 40 });

      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'قرارداد');
      XLSX.writeFile(wb, `قرارداد_${contract.contract_number}.xlsx`);
      toast.success('فایل Excel با موفقیت دانلود شد');

    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('خطا در ایجاد فایل Excel');
    }
    setIsExporting(false);
  };

  // ========== Print ==========
  const handlePrint = () => {
    window.print();
    setShowExportMenu(false);
  };

  // ========== Loading ==========
  if (isLoading) {
    return (
      <div className="contract-details-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>در حال بارگذاری اطلاعات قرارداد...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="contract-details-page">
        <div className="error-container">
          <AlertCircle size={64} />
          <h3>قرارداد یافت نشد</h3>
          <p>قرارداد مورد نظر با شناسه {id} در سیستم وجود ندارد</p>
          <button className="btn-back" onClick={() => navigate('/contract')}>
            <ArrowLeft size={16} />
            بازگشت به لیست قراردادها
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = CONTRACT_STATUSES[contract.status];
  const remaining = contract.total_amount - contract.paid_amount;
  const financialProgress = contract.total_amount > 0
    ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100)
    : 0;
  const physicalProgress = toNumber(contract.physical_progress);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return CheckCircle;
      case 'IN_PROGRESS': return Clock;
      case 'DRAFT': return Edit;
      case 'TERMINATED': return AlertCircle;
      default: return Clock;
    }
  };

  const StatusIcon = getStatusIcon(contract.status);

  return (
    <div className="contract-details-page">
      {/* ========== Header ========== */}
      <div className="details-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/contract')}>
            <ArrowLeft size={18} />
            بازگشت
          </button>
          <div className="header-title">
            <FileText size={24} className="title-icon" />
            <div>
              <h1>{contract.contract_number}</h1>
              <span className="contract-subject-header">{contract.subject}</span>
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
            {statusInfo?.label || contract.status}
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
          <button className="action-btn" onClick={copyToClipboard}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'کپی شد' : 'کپی اطلاعات'}
          </button>
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
      <div className="details-content" ref={contentRef}>
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <DollarSign size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">مبلغ کل</span>
              <span className="summary-value">{toPersianNumber(Number(contract.total_amount))} ریال</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#d1fae5', color: '#059669' }}>
              <CheckCircle size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">مبلغ پرداختی</span>
              <span className="summary-value">{toPersianNumber(Number(contract.paid_amount))} ریال</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <TrendingUp size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">مبلغ باقیمانده</span>
              <span className="summary-value">{toPersianNumber(Number(remaining))} ریال</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <BarChart3 size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">پیشرفت مالی</span>
              <span className="summary-value">{toPersianNumber(financialProgress)}%</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
              <TrendingUp size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">پیشرفت فیزیکی</span>
              <span className="summary-value">{toPersianNumber(physicalProgress)}%</span>
            </div>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-item">
            <div className="progress-header">
              <span className="progress-label">پیشرفت مالی</span>
              <span className="progress-value">{toPersianNumber(financialProgress)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill financial"
                style={{ width: `${financialProgress}%` }}
              />
            </div>
          </div>
          <div className="progress-item">
            <div className="progress-header">
              <span className="progress-label">پیشرفت فیزیکی</span>
              <span className="progress-value">{toPersianNumber(physicalProgress)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill physical"
                style={{ width: `${physicalProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-column">
            <div className="info-section">
              <h3><Building2 size={18} /> طرف قرارداد</h3>
              <div className="info-row">
                <span className="info-label">طرف قرارداد</span>
                <span className="info-value highlight">{contract.company_name || contract.university_name || '—'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">نوع همکار</span>
                <span className="info-value">
                  {contract.affiliation_type === 'UNIVERSITY' ? (
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
            </div>

            <div className="info-section">
              <h3><Calendar size={18} /> تاریخ‌ها</h3>
              <div className="info-row">
                <span className="info-label">تاریخ قرارداد</span>
                <span className="info-value">{contract.date}</span>
              </div>
              <div className="info-row">
                <span className="info-label">تاریخ شروع</span>
                <span className="info-value">{contract.start_date}</span>
              </div>
              <div className="info-row">
                <span className="info-label">تاریخ پایان</span>
                <span className="info-value">{contract.end_date}</span>
              </div>
              <div className="info-row">
                <span className="info-label">مدت قرارداد</span>
                <span className="info-value">{toPersianNumber(contract.contract_duration_months || 0)} ماه</span>
              </div>
            </div>

            <div className="info-section">
              <h3><DollarSign size={18} /> اطلاعات مالی</h3>
              <div className="info-row">
                <span className="info-label">مبلغ کل</span>
                <span className="info-value amount">{toPersianNumber(Number(contract.total_amount))} ریال</span>
              </div>
              <div className="info-row">
                <span className="info-label">مبلغ پرداختی</span>
                <span className="info-value amount success">{toPersianNumber(Number(contract.paid_amount))} ریال</span>
              </div>
              <div className="info-row">
                <span className="info-label">مبلغ باقیمانده</span>
                <span className={`info-value amount ${remaining > 0 ? 'warning' : 'success'}`}>
                  {toPersianNumber(Number(remaining))} ریال
                </span>
              </div>
            </div>
          </div>

          <div className="info-column">
            {contract.commitments && (
              <div className="info-section">
                <h3><CheckCircle size={18} /> تعهدات طرفین</h3>
                <p className="description-text">{contract.commitments}</p>
              </div>
            )}

            {contract.services_description && (
              <div className="info-section">
                <h3><Layers size={18} /> شرح خدمات</h3>
                <p className="description-text">{contract.services_description}</p>
              </div>
            )}

            {contract.documents && (
              <div className="info-section">
                <h3><FileText size={18} /> اسناد و مدارک</h3>
                <p className="description-text">{contract.documents}</p>
              </div>
            )}

            {contract.contractor_address && (
              <div className="info-section">
                <h3><Building2 size={18} /> نشانی طرفین</h3>
                <p className="description-text">{contract.contractor_address}</p>
              </div>
            )}

            {/* ✅ فایل‌های پیوست چندگانه */}
            {contract.attachments && contract.attachments.length > 0 && (
              <div className="info-section">
                <h3><Paperclip size={18} /> فایل‌های پیوست</h3>
                <div className="files-list">
                  {contract.attachments.map((att) => (
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

            {/* ===== فعالیت‌ها ===== */}
            {contract.activities && contract.activities.length > 0 && (
              <div className="info-section">
                <h3><Layers size={18} /> فعالیت‌های قرارداد</h3>
                <div className="activities-list">
                  {contract.activities.map((activity, index) => (
                    <div key={index} className="activity-item-detail">
                      <div className="activity-detail-header">
                        <span className="activity-detail-title">{activity.title}</span>
                        <span
                          className="activity-status-badge"
                          style={{
                            backgroundColor: ACTIVITY_STATUSES[activity.status]?.color + '20',
                            color: ACTIVITY_STATUSES[activity.status]?.color,
                          }}
                        >
                          {ACTIVITY_STATUSES[activity.status]?.label || activity.status}
                        </span>
                      </div>
                      {activity.description && (
                        <p className="activity-detail-desc">{activity.description}</p>
                      )}
                      <div className="activity-detail-meta">
                        {activity.start_date && (
                          <span>شروع: {activity.start_date}</span>
                        )}
                        {activity.end_date && (
                          <span>پایان: {activity.end_date}</span>
                        )}
                        <span>پیشرفت: {activity.progress || 0}%</span>
                      </div>
                      <div className="progress-mini-detail">
                        <div
                          className="progress-fill-mini-detail"
                          style={{ width: `${activity.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="info-section meta">
              <div className="meta-row"><span className="meta-label">شناسه</span><span className="meta-value">#{toPersianNumber(contract.id)}</span></div>
              <div className="meta-row"><span className="meta-label">نسخه</span><span className="meta-value">{toPersianNumber(contract.version)}</span></div>
              <div className="meta-row"><span className="meta-label">بایگانی</span><span className="meta-value">{contract.is_archived ? 'بله' : 'خیر'}</span></div>
              <div className="meta-row"><span className="meta-label">تاریخ ایجاد</span><span className="meta-value">{contract.created_at}</span></div>
              <div className="meta-row"><span className="meta-label">آخرین بروزرسانی</span><span className="meta-value">{contract.updated_at}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== مودال ویرایش ========== */}
      {editFormOpen && contract && (
        <div className="modal-overlay" onClick={handleEditCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ContractForm
              initialData={contract}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          </div>
        </div>
      )}

      <style>{`
        .contract-details-page {
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

        .contract-subject-header {
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

        .progress-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 16px 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .progress-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #374151;
        }

        .progress-label {
          font-weight: 500;
        }

        .progress-value {
          font-weight: 600;
          color: #1a1a2e;
        }

        .progress-bar {
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .progress-fill.financial {
          background: linear-gradient(90deg, #059669, #10b981);
        }

        .progress-fill.physical {
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
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

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 13px;
        }

        .info-row:last-child {
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

        .info-value.amount {
          font-size: 15px;
        }

        .info-value.success {
          color: #059669;
        }

        .info-value.warning {
          color: #d97706;
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

        /* ===== فعالیت‌ها ===== */
        .activities-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item-detail {
          background: #f8fafc;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 12px 16px;
          transition: all 0.2s;
        }

        .activity-item-detail:hover {
          border-color: #c7d2fe;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.06);
        }

        .activity-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          gap: 8px;
          flex-wrap: wrap;
        }

        .activity-detail-title {
          font-weight: 600;
          font-size: 14px;
          color: #1a1a2e;
        }

        .activity-status-badge {
          padding: 2px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
        }

        .activity-detail-desc {
          font-size: 13px;
          color: #6b7280;
          margin: 4px 0 8px 0;
          line-height: 1.6;
        }

        .activity-detail-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #9ca3af;
          flex-wrap: wrap;
        }

        .progress-mini-detail {
          margin-top: 6px;
          height: 4px;
          background: #e9ecef;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill-mini-detail {
          height: 100%;
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
          border-radius: 2px;
          transition: width 0.6s ease;
        }

        @media (max-width: 1024px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .contract-details-page {
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

          .progress-section {
            grid-template-columns: 1fr;
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
          .contract-details-page {
            background: white;
            padding: 20px;
          }

          .action-bar, .btn-back, .export-wrapper, .toggle-description {
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

export default ContractDetailsPage;

// // ==================== src/modules/contract/pages/ContractDetailsPage.tsx ====================

// import React, { useState, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useContract } from '../hooks/useContract';
// import { ACTIVITY_STATUSES, CONTRACT_STATUSES } from '../types/contract.types';
// import { formatCurrency } from '../../../core/utils/formatter.utils';
// import dateUtils from '@utils/dateUtils';
// import {
//   ArrowLeft,
//   FileText,
//   DollarSign,
//   Building2,
//   Calendar,
//   Download,
//   Eye,
//   Printer,
//   Edit,
//   Trash2,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   Paperclip,
//   ChevronDown,
//   ChevronUp,
//   FileSpreadsheet,
//   Copy,
//   Check,
//   Layers,
//   BarChart3,
//   TrendingUp,
//   Loader2,
// } from 'lucide-react';
// import { saveAs } from 'file-saver';
// import { toast } from 'react-hot-toast';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// import * as XLSX from 'xlsx';
// import { ContractForm } from '../components/ContractForm';

// interface ContractDetailsPageProps {
//   onEdit?: () => void;
//   onDelete?: () => void;
// }

// // ===== تابع تبدیل اعداد به فارسی =====
// const toPersianNumber = (num: number): string => {
//   if (num === undefined || num === null) return '۰';
//   const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
//   return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
// };

// const toNumber = (value: any): number => {
//   if (typeof value === 'number') return value;
//   if (typeof value === 'string') return parseFloat(value) || 0;
//   return 0;
// };

// export const ContractDetailsPage: React.FC<ContractDetailsPageProps> = ({ onEdit, onDelete }) => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const { useItem, delete: deleteContract, isDeleting } = useContract();
//   const { data: contract, isLoading, refetch } = useItem(Number(id));
  
//   const [showFullDescription, setShowFullDescription] = useState(false);
//   const [showExportMenu, setShowExportMenu] = useState(false);
//   const [isExporting, setIsExporting] = useState(false);
//   const [copied, setCopied] = useState(false);
//   const [editFormOpen, setEditFormOpen] = useState(false);
//   const contentRef = useRef<HTMLDivElement>(null);
//   const pdfContentRef = useRef<HTMLDivElement>(null);

//   // ========== Handle Delete ==========
//   const handleDelete = async () => {
//     if (window.confirm('آیا از حذف این قرارداد مطمئن هستید؟')) {
//       await deleteContract(Number(id));
//       navigate('/contract');
//       toast.success('قرارداد با موفقیت حذف شد');
//     }
//   };

//   // ========== Handle Edit ==========
//   const handleEdit = () => {
//     setEditFormOpen(true);
//   };

//   const handleEditSuccess = () => {
//     setEditFormOpen(false);
//     refetch();
//     toast.success('قرارداد با موفقیت ویرایش شد');
//   };

//   const handleEditCancel = () => {
//     setEditFormOpen(false);
//   };

//   // ========== Copy to Clipboard ==========
//   const copyToClipboard = () => {
//     if (!contract) return;
//     const text = `
// شماره قرارداد: ${contract.contract_number}
// موضوع: ${contract.subject}
// طرف قرارداد: ${contract.company_name || contract.university_name || '—'}
// مبلغ کل: ${formatCurrency(contract.total_amount)}
// وضعیت: ${CONTRACT_STATUSES[contract.status]?.label || contract.status}
// تاریخ شروع: ${dateUtils.toJalali(contract.start_date)}
// تاریخ پایان: ${dateUtils.toJalali(contract.end_date)}
//     `.trim();
    
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     toast.success('اطلاعات قرارداد کپی شد');
//     setTimeout(() => setCopied(false), 3000);
//   };

//   // ========== Export to HTML ==========
//   const exportHTML = () => {
//     if (!contract) return;
//     setIsExporting(true);
//     setShowExportMenu(false);

//     try {
//       const statusInfo = CONTRACT_STATUSES[contract.status];
//       const remaining = contract.total_amount - contract.paid_amount;
//       const financialProgress = contract.total_amount > 0
//         ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100)
//         : 0;
//       const physicalProgress = toNumber(contract.physical_progress);
//       const contractorName = contract.company_name || contract.university_name || '—';

//       const html = `<!DOCTYPE html>
// <html dir="rtl" lang="fa">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>قرارداد ${contract.contract_number}</title>
//   <style>
//     body { font-family: 'Vazir', Tahoma, sans-serif; direction: rtl; padding: 40px; max-width: 900px; margin: 0 auto; background: #f8fafc; }
//     .container { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
//     .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 35px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
//     .header h1 { margin: 0; font-size: 28px; }
//     .header .sub { font-size: 18px; opacity: 0.9; margin-top: 4px; }
//     .header .status { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 24px; border-radius: 20px; font-size: 14px; margin-top: 10px; }
    
//     .cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 25px; }
//     .card { padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e9ecef; }
//     .card .lbl { font-size: 11px; color: #6b7280; }
//     .card .val { font-size: 17px; font-weight: 700; margin-top: 4px; }
//     .card.blue { background: #eef2ff; } .card.blue .val { color: #4f46e5; }
//     .card.green { background: #d1fae5; } .card.green .val { color: #059669; }
//     .card.red { background: #fee2e2; } .card.red .val { color: #dc2626; }
//     .card.orange { background: #fef3c7; } .card.orange .val { color: #d97706; }
//     .card.purple { background: #dbeafe; } .card.purple .val { color: #6366f1; }
    
//     .progress-section { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 18px 22px; background: #f8fafc; border-radius: 10px; border: 1px solid #e9ecef; margin-bottom: 25px; }
//     .progress-item .head { display: flex; justify-content: space-between; font-size: 13px; color: #374151; margin-bottom: 6px; }
//     .progress-item .bar { height: 10px; background: #e9ecef; border-radius: 6px; overflow: hidden; }
//     .progress-item .bar .fill { height: 100%; border-radius: 6px; }
//     .fill.financial { background: linear-gradient(90deg, #059669, #10b981); }
//     .fill.physical { background: linear-gradient(90deg, #4f46e5, #818cf8); }
    
//     .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
//     .section { background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 18px 22px; margin-bottom: 16px; }
//     .section h3 { font-size: 15px; font-weight: 700; color: #4f46e5; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e9ecef; }
//     .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
//     .row:last-child { border-bottom: none; }
//     .row .lbl { color: #6b7280; }
//     .row .val { font-weight: 500; color: #1a1a2e; }
//     .row .val.highlight { color: #4f46e5; font-weight: 600; }
    
//     .desc { font-size: 13px; color: #374151; line-height: 1.9; text-align: justify; }
//     .meta-section { background: #f1f5f9; border-color: #e2e8f0; }
    
//     .signature { margin-top: 35px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding-top: 20px; border-top: 2px dashed #e9ecef; }
//     .signature .sig-item { text-align: center; }
//     .signature .sig-item .line { width: 200px; height: 1px; border-bottom: 2px solid #1a1a2e; margin: 50px auto 8px auto; }
//     .signature .sig-item .label { font-size: 12px; color: #6b7280; }
    
//     .footer { margin-top: 30px; padding-top: 16px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
    
//     .download-btn { display: inline-block; background: #4f46e5; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
    
//     @media print { body { background: white; padding: 20px; } .container { box-shadow: none; padding: 20px; } }
//     @media (max-width: 768px) { .cards { grid-template-columns: repeat(3, 1fr); } .grid { grid-template-columns: 1fr; } .progress-section { grid-template-columns: 1fr; } }
//   </style>
// </head>
// <body>
// <div class="container">
//   <div class="header">
//     <h1>📄 گزارش قرارداد</h1>
//     <div class="sub">${contract.contract_number}</div>
//     <div class="status">${statusInfo?.label || contract.status}</div>
//   </div>

//   <div class="cards">
//     <div class="card blue"><div class="lbl">مبلغ کل</div><div class="val">${toPersianNumber(Number(contract.total_amount))} ریال</div></div>
//     <div class="card green"><div class="lbl">مبلغ پرداختی</div><div class="val">${toPersianNumber(Number(contract.paid_amount))} ریال</div></div>
//     <div class="card ${remaining > 0 ? 'red' : 'green'}"><div class="lbl">مبلغ باقیمانده</div><div class="val">${toPersianNumber(Number(remaining))} ریال</div></div>
//     <div class="card orange"><div class="lbl">پیشرفت مالی</div><div class="val">${toPersianNumber(financialProgress)}%</div></div>
//     <div class="card purple"><div class="lbl">پیشرفت فیزیکی</div><div class="val">${toPersianNumber(physicalProgress)}%</div></div>
//   </div>

//   <div class="progress-section">
//     <div class="progress-item">
//       <div class="head"><span>پیشرفت مالی</span><span>${toPersianNumber(financialProgress)}%</span></div>
//       <div class="bar"><div class="fill financial" style="width:${financialProgress}%;"></div></div>
//     </div>
//     <div class="progress-item">
//       <div class="head"><span>پیشرفت فیزیکی</span><span>${toPersianNumber(physicalProgress)}%</span></div>
//       <div class="bar"><div class="fill physical" style="width:${physicalProgress}%;"></div></div>
//     </div>
//   </div>

//   <div class="grid">
//     <div>
//       <div class="section">
//         <h3>🏢 طرف قرارداد</h3>
//         <div class="row"><span class="lbl">طرف قرارداد</span><span class="val highlight">${contractorName}</span></div>
//       </div>
//       <div class="section">
//         <h3>📅 تاریخ‌ها</h3>
//         <div class="row"><span class="lbl">تاریخ قرارداد</span><span class="val">${dateUtils.toJalali(contract.date)}</span></div>
//         <div class="row"><span class="lbl">تاریخ شروع</span><span class="val">${dateUtils.toJalali(contract.start_date)}</span></div>
//         <div class="row"><span class="lbl">تاریخ پایان</span><span class="val">${dateUtils.toJalali(contract.end_date)}</span></div>
//         <div class="row"><span class="lbl">مدت قرارداد</span><span class="val highlight">${toPersianNumber(contract.contract_duration_months || 0)} ماه</span></div>
//       </div>
//       <div class="section">
//         <h3>💰 اطلاعات مالی</h3>
//         <div class="row"><span class="lbl">مبلغ کل</span><span class="val highlight">${toPersianNumber(Number(contract.total_amount))} ریال</span></div>
//         <div class="row"><span class="lbl">مبلغ پرداختی</span><span class="val" style="color:#059669;">${toPersianNumber(Number(contract.paid_amount))} ریال</span></div>
//         <div class="row"><span class="lbl">مبلغ باقیمانده</span><span class="val" style="color:${remaining > 0 ? '#d97706' : '#059669'};">${toPersianNumber(Number(remaining))} ریال</span></div>
//       </div>
//     </div>
//     <div>
//       ${contract.description ? `<div class="section"><h3>📝 شرح قرارداد</h3><div class="desc">${contract.description}</div></div>` : ''}
//       ${contract.commitments ? `<div class="section"><h3>✅ تعهدات طرفین</h3><div class="desc">${contract.commitments}</div></div>` : ''}
//       ${contract.services_description ? `<div class="section"><h3>🛠️ شرح خدمات</h3><div class="desc">${contract.services_description}</div></div>` : ''}
//       <div class="section meta-section">
//         <h3>📋 اطلاعات تکمیلی</h3>
//         <div class="row"><span class="lbl">شناسه</span><span class="val">#${toPersianNumber(contract.id)}</span></div>
//         <div class="row"><span class="lbl">نسخه</span><span class="val">${toPersianNumber(contract.version)}</span></div>
//         <div class="row"><span class="lbl">بایگانی</span><span class="val">${contract.is_archived ? 'بله' : 'خیر'}</span></div>
//         <div class="row"><span class="lbl">تاریخ ایجاد</span><span class="val">${dateUtils.toJalali(contract.created_at)}</span></div>
//       </div>
      
//     </div>
//   </div>

//   <div class="signature">
//     <div class="sig-item"><div class="line"></div><div class="label">امضای کارفرما</div></div>
//     <div class="sig-item"><div class="line"></div><div class="label">امضای پیمانکار</div></div>
//   </div>

//   <div class="footer">
//     <span>📅 تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
//     <span>📄 شماره قرارداد: ${contract.contract_number}</span>
//   </div>
// </div>
// </body>
// </html>`;

//       const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
//       saveAs(blob, `قرارداد_${contract.contract_number}.html`);
//       toast.success('فایل HTML با موفقیت دانلود شد');

//     } catch (error) {
//       console.error('HTML export error:', error);
//       toast.error('خطا در ایجاد فایل HTML');
//     }
//     setIsExporting(false);
//   };

//   // ========== Export to JSON ==========
//   const exportJSON = () => {
//     if (!contract) return;
//     setIsExporting(true);
//     setShowExportMenu(false);

//     try {
//       const data = {
//         contract_number: contract.contract_number,
//         subject: contract.subject,
//         contractor: contract.company_name || contract.university_name || null,
//         total_amount: Number(contract.total_amount),
//         paid_amount: Number(contract.paid_amount),
//         remaining_amount: Number(contract.total_amount - contract.paid_amount),
//         financial_progress: contract.total_amount > 0
//           ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100)
//           : 0,
//         physical_progress: toNumber(contract.physical_progress),
//         status: contract.status,
//         date: contract.date,
//         start_date: contract.start_date,
//         end_date: contract.end_date,
//         duration_months: contract.contract_duration_months || 0,
//         version: contract.version,
//         is_archived: contract.is_archived,
//         description: contract.description || null,
//         commitments: contract.commitments || null,
//         services_description: contract.services_description || null,
//         created_at: contract.created_at,
//         updated_at: contract.updated_at,
//         files: {
//           contract_file: contract.contract_file || null,
//           certificate_file: contract.certificate_file || null,
//           declaration_file: contract.declaration_file || null,
//         }
//       };

//       const jsonContent = JSON.stringify(data, null, 2);
//       const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
//       saveAs(blob, `قرارداد_${contract.contract_number}.json`);
//       toast.success('فایل JSON با موفقیت دانلود شد');

//     } catch (error) {
//       console.error('JSON export error:', error);
//       toast.error('خطا در ایجاد فایل JSON');
//     }
//     setIsExporting(false);
//   };

//   // ========== Export to CSV ==========
//   const exportCSV = () => {
//     if (!contract) return;
//     setIsExporting(true);
//     setShowExportMenu(false);

//     try {
//       const rows = [
//         ['فیلد', 'مقدار'],
//         ['شماره قرارداد', contract.contract_number],
//         ['موضوع', contract.subject],
//         ['طرف قرارداد', contract.company_name || contract.university_name || '—'],
//         ['مبلغ کل', toPersianNumber(Number(contract.total_amount))],
//         ['مبلغ پرداختی', toPersianNumber(Number(contract.paid_amount))],
//         ['مبلغ باقیمانده', toPersianNumber(Number(contract.total_amount - contract.paid_amount))],
//         ['پیشرفت مالی', toPersianNumber(contract.total_amount > 0 ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100) : 0)],
//         ['پیشرفت فیزیکی', toPersianNumber(toNumber(contract.physical_progress))],
//         ['وضعیت', CONTRACT_STATUSES[contract.status]?.label || contract.status],
//         ['تاریخ قرارداد', dateUtils.toJalali(contract.date)],
//         ['تاریخ شروع', dateUtils.toJalali(contract.start_date)],
//         ['تاریخ پایان', dateUtils.toJalali(contract.end_date)],
//         ['مدت (ماه)', toPersianNumber(contract.contract_duration_months || 0)],
//         ['نسخه', toPersianNumber(contract.version)],
//         ['بایگانی', contract.is_archived ? 'بله' : 'خیر'],
//       ];

//       const csvContent = rows.map(row => row.join(',')).join('\n');
//       const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
//       saveAs(blob, `قرارداد_${contract.contract_number}.csv`);
//       toast.success('فایل CSV با موفقیت دانلود شد');

//     } catch (error) {
//       console.error('CSV export error:', error);
//       toast.error('خطا در ایجاد فایل CSV');
//     }
//     setIsExporting(false);
//   };

//   // ========== Export to TXT ==========
//   const exportTXT = () => {
//     if (!contract) return;
//     setIsExporting(true);
//     setShowExportMenu(false);

//     try {
//       const statusInfo = CONTRACT_STATUSES[contract.status];
//       const remaining = contract.total_amount - contract.paid_amount;
//       const financialProgress = contract.total_amount > 0
//         ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100)
//         : 0;
//       const physicalProgress = toNumber(contract.physical_progress);
//       const contractorName = contract.company_name || contract.university_name || '—';

//       const text = `
// ═══════════════════════════════════════════════════════════
//                     گزارش قرارداد
// ═══════════════════════════════════════════════════════════

// شماره قرارداد: ${contract.contract_number}
// موضوع: ${contract.subject}
// طرف قرارداد: ${contractorName}
// وضعیت: ${statusInfo?.label || contract.status}
// نسخه: ${toPersianNumber(contract.version)}

// ───────────────────────────────────────────────────────────
//                     خلاصه اطلاعات
// ───────────────────────────────────────────────────────────

// مبلغ کل: ${toPersianNumber(Number(contract.total_amount))} ریال
// مبلغ پرداختی: ${toPersianNumber(Number(contract.paid_amount))} ریال
// مبلغ باقیمانده: ${toPersianNumber(Number(remaining))} ریال
// پیشرفت مالی: ${toPersianNumber(financialProgress)}%
// پیشرفت فیزیکی: ${toPersianNumber(physicalProgress)}%

// ───────────────────────────────────────────────────────────
//                     تاریخ‌ها
// ───────────────────────────────────────────────────────────

// تاریخ قرارداد: ${dateUtils.toJalali(contract.date)}
// تاریخ شروع: ${dateUtils.toJalali(contract.start_date)}
// تاریخ پایان: ${dateUtils.toJalali(contract.end_date)}
// مدت قرارداد: ${toPersianNumber(contract.contract_duration_months || 0)} ماه

// ───────────────────────────────────────────────────────────
//                     اطلاعات تکمیلی
// ───────────────────────────────────────────────────────────

// شناسه: #${toPersianNumber(contract.id)}
// بایگانی: ${contract.is_archived ? 'بله' : 'خیر'}
// تاریخ ایجاد: ${dateUtils.toJalali(contract.created_at)}
// تاریخ بروزرسانی: ${dateUtils.toJalali(contract.updated_at)}

// ${contract.description ? `───────────────────────────────────────────────────────────
// شرح قرارداد:
// ${contract.description}
// ` : ''}
// ${contract.commitments ? `───────────────────────────────────────────────────────────
// تعهدات طرفین:
// ${contract.commitments}
// ` : ''}
// ${contract.services_description ? `───────────────────────────────────────────────────────────
// شرح خدمات:
// ${contract.services_description}
// ` : ''}
// ═══════════════════════════════════════════════════════════
// تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}
// ═══════════════════════════════════════════════════════════
// `;

//       const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
//       saveAs(blob, `قرارداد_${contract.contract_number}.txt`);
//       toast.success('فایل TXT با موفقیت دانلود شد');

//     } catch (error) {
//       console.error('TXT export error:', error);
//       toast.error('خطا در ایجاد فایل TXT');
//     }
//     setIsExporting(false);
//   };

//   // ========== Export to XML ==========
//   const exportXML = () => {
//     if (!contract) return;
//     setIsExporting(true);
//     setShowExportMenu(false);

//     try {
//       const statusInfo = CONTRACT_STATUSES[contract.status];
//       const remaining = contract.total_amount - contract.paid_amount;
//       const financialProgress = contract.total_amount > 0
//         ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100)
//         : 0;
//       const physicalProgress = toNumber(contract.physical_progress);
//       const contractorName = contract.company_name || contract.university_name || '—';

//       const xml = `<?xml version="1.0" encoding="UTF-8"?>
// <contract>
//   <header>
//     <contract_number>${contract.contract_number}</contract_number>
//     <subject>${contract.subject}</subject>
//     <contractor>${contractorName}</contractor>
//     <status>${statusInfo?.label || contract.status}</status>
//     <status_code>${contract.status}</status_code>
//     <version>${toPersianNumber(contract.version)}</version>
//   </header>
  
//   <financial>
//     <total_amount>${toPersianNumber(Number(contract.total_amount))}</total_amount>
//     <paid_amount>${toPersianNumber(Number(contract.paid_amount))}</paid_amount>
//     <remaining_amount>${toPersianNumber(Number(remaining))}</remaining_amount>
//     <financial_progress>${toPersianNumber(financialProgress)}</financial_progress>
//     <physical_progress>${toPersianNumber(physicalProgress)}</physical_progress>
//   </financial>
  
//   <dates>
//     <date>${contract.date}</date>
//     <start_date>${contract.start_date}</start_date>
//     <end_date>${contract.end_date}</end_date>
//     <duration_months>${toPersianNumber(contract.contract_duration_months || 0)}</duration_months>
//   </dates>
  
//   <details>
//     <id>${toPersianNumber(contract.id)}</id>
//     <is_archived>${contract.is_archived}</is_archived>
//     <created_at>${contract.created_at}</created_at>
//     <updated_at>${contract.updated_at}</updated_at>
//   </details>
  
//   ${contract.description ? `<description>${contract.description}</description>` : ''}
//   ${contract.commitments ? `<commitments>${contract.commitments}</commitments>` : ''}
//   ${contract.services_description ? `<services>${contract.services_description}</services>` : ''}
  
//   <files>
//     <contract_file>${contract.contract_file || ''}</contract_file>
//     <certificate_file>${contract.certificate_file || ''}</certificate_file>
//     <declaration_file>${contract.declaration_file || ''}</declaration_file>
//   </files>
// </contract>`;

//       const blob = new Blob([xml], { type: 'text/xml;charset=utf-8' });
//       saveAs(blob, `قرارداد_${contract.contract_number}.xml`);
//       toast.success('فایل XML با موفقیت دانلود شد');

//     } catch (error) {
//       console.error('XML export error:', error);
//       toast.error('خطا در ایجاد فایل XML');
//     }
//     setIsExporting(false);
//   };

//   // ========== Export to Word ==========
//   const exportToWord = () => {
//     if (!contract) return;
//     setIsExporting(true);
//     setShowExportMenu(false);

//     try {
//       const statusInfo = CONTRACT_STATUSES[contract.status];
//       const remaining = contract.total_amount - contract.paid_amount;
//       const financialProgress = contract.total_amount > 0
//         ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100)
//         : 0;
//       const physicalProgress = toNumber(contract.physical_progress);
//       const contractorName = contract.company_name || contract.university_name || '—';

//       const html = `<!DOCTYPE html>
// <html dir="rtl" lang="fa">
// <head>
//   <meta charset="UTF-8">
//   <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
//   <title>قرارداد ${contract.contract_number}</title>
//   <style>
//     body { direction: rtl; font-family: 'B Nazanin', 'Vazir', Tahoma, sans-serif; padding: 35px 40px; max-width: 850px; margin: 0 auto; background: #ffffff; color: #1a1a2e; }
//     .header { background: #4f46e5; color: white; padding: 35px 40px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
//     .header h1 { margin: 0; font-size: 28px; font-weight: 700; color: white; }
//     .header .sub { font-size: 18px; opacity: 0.9; margin-top: 4px; color: white; }
//     .header .status { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 24px; border-radius: 20px; font-size: 14px; margin-top: 10px; color: white; font-weight: 600; }
//     .cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 25px; }
//     .card { border-radius: 10px; padding: 16px 14px; text-align: center; border: 1px solid #e9ecef; }
//     .card .lbl { font-size: 11px; color: #6b7280; font-weight: 500; }
//     .card .val { font-size: 17px; font-weight: 700; margin-top: 4px; }
//     .progress-section { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 18px 22px; background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; margin-bottom: 25px; }
//     .progress-item .head { display: flex; justify-content: space-between; font-size: 13px; color: #374151; margin-bottom: 6px; font-weight: 500; }
//     .progress-item .head .value { font-weight: 700; color: #1a1a2e; }
//     .progress-item .bar { height: 10px; background: #e9ecef; border-radius: 6px; overflow: hidden; }
//     .progress-item .bar .fill { height: 100%; border-radius: 6px; }
//     .progress-item .bar .fill.financial { background: #059669; }
//     .progress-item .bar .fill.physical { background: #4f46e5; }
//     .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
//     .section { background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 18px 22px; margin-bottom: 16px; }
//     .section:last-child { margin-bottom: 0; }
//     .section h3 { font-size: 15px; font-weight: 700; color: #4f46e5; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e9ecef; }
//     .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
//     .row:last-child { border-bottom: none; }
//     .row .lbl { color: #6b7280; }
//     .row .val { font-weight: 500; color: #1a1a2e; }
//     .row .val.highlight { color: #4f46e5; font-weight: 600; }
//     .row .val.success { color: #059669; }
//     .row .val.warning { color: #d97706; }
//     .desc { font-size: 13px; color: #374151; line-height: 1.9; text-align: justify; }
//     .meta-section { background: #f1f5f9; border-color: #e2e8f0; }
//     .meta-section .row { font-size: 12px; padding: 3px 0; }
//     .meta-section .row .lbl { color: #64748b; }
//     .signature { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding-top: 20px; border-top: 2px dashed #e9ecef; }
//     .signature .sig-item { text-align: center; }
//     .signature .sig-item .line { width: 200px; height: 1px; border-bottom: 2px solid #1a1a2e; margin: 50px auto 8px auto; }
//     .signature .sig-item .label { font-size: 12px; color: #6b7280; font-weight: 500; }
//     .footer { margin-top: 30px; padding-top: 16px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
//     @media (max-width: 768px) { body { padding: 20px; } .cards { grid-template-columns: repeat(3, 1fr); } .grid { grid-template-columns: 1fr; } .progress-section { grid-template-columns: 1fr; } .signature { grid-template-columns: 1fr; gap: 20px; } .signature .sig-item .line { width: 100%; } }
//     @media (max-width: 480px) { .cards { grid-template-columns: repeat(2, 1fr); } }
//     @media print { body { padding: 20px; } .card { break-inside: avoid; } .section { break-inside: avoid; } }
//   </style>
// </head>
// <body>
//   <div class="header">
//     <h1>گزارش قرارداد</h1>
//     <div class="sub">${contract.contract_number}</div>
//     <div class="status">${statusInfo?.label || contract.status}</div>
//   </div>
//   <div class="cards">
//     <div class="card" style="background:#eef2ff;"><div class="lbl">مبلغ کل</div><div class="val" style="color:#4f46e5;">${toPersianNumber(Number(contract.total_amount))} ریال</div></div>
//     <div class="card" style="background:#d1fae5;"><div class="lbl">مبلغ پرداختی</div><div class="val" style="color:#059669;">${toPersianNumber(Number(contract.paid_amount))} ریال</div></div>
//     <div class="card" style="background:${remaining > 0 ? '#fee2e2' : '#d1fae5'};"><div class="lbl">مبلغ باقیمانده</div><div class="val" style="color:${remaining > 0 ? '#dc2626' : '#059669'};">${toPersianNumber(Number(remaining))} ریال</div></div>
//     <div class="card" style="background:#fef3c7;"><div class="lbl">پیشرفت مالی</div><div class="val" style="color:#d97706;">${toPersianNumber(financialProgress)}%</div></div>
//     <div class="card" style="background:#dbeafe;"><div class="lbl">پیشرفت فیزیکی</div><div class="val" style="color:#6366f1;">${toPersianNumber(physicalProgress)}%</div></div>
//   </div>
//   <div class="progress-section">
//     <div class="progress-item">
//       <div class="head"><span>پیشرفت مالی</span><span class="value">${toPersianNumber(financialProgress)}%</span></div>
//       <div class="bar"><div class="fill financial" style="width:${financialProgress}%;"></div></div>
//     </div>
//     <div class="progress-item">
//       <div class="head"><span>پیشرفت فیزیکی</span><span class="value">${toPersianNumber(physicalProgress)}%</span></div>
//       <div class="bar"><div class="fill physical" style="width:${physicalProgress}%;"></div></div>
//     </div>
//   </div>
//   <div class="grid">
//     <div>
//       <div class="section"><h3>طرف قرارداد</h3><div class="row"><span class="lbl">طرف قرارداد</span><span class="val highlight">${contractorName}</span></div></div>
//       <div class="section"><h3>تاریخ‌ها</h3><div class="row"><span class="lbl">تاریخ قرارداد</span><span class="val">${dateUtils.toJalali(contract.date)}</span></div><div class="row"><span class="lbl">تاریخ شروع</span><span class="val">${dateUtils.toJalali(contract.start_date)}</span></div><div class="row"><span class="lbl">تاریخ پایان</span><span class="val">${dateUtils.toJalali(contract.end_date)}</span></div><div class="row"><span class="lbl">مدت قرارداد</span><span class="val highlight">${toPersianNumber(contract.contract_duration_months || 0)} ماه</span></div></div>
//       <div class="section"><h3>اطلاعات مالی</h3><div class="row"><span class="lbl">مبلغ کل</span><span class="val highlight">${toPersianNumber(Number(contract.total_amount))} ریال</span></div><div class="row"><span class="lbl">مبلغ پرداختی</span><span class="val success">${toPersianNumber(Number(contract.paid_amount))} ریال</span></div><div class="row"><span class="lbl">مبلغ باقیمانده</span><span class="val ${remaining > 0 ? 'warning' : 'success'}">${toPersianNumber(Number(remaining))} ریال</span></div></div>
//     </div>
//     <div>
//       ${contract.description ? `<div class="section"><h3>شرح قرارداد</h3><div class="desc">${contract.description}</div></div>` : ''}
//       ${contract.commitments ? `<div class="section"><h3>تعهدات طرفین</h3><div class="desc">${contract.commitments}</div></div>` : ''}
//       ${contract.services_description ? `<div class="section"><h3>شرح خدمات</h3><div class="desc">${contract.services_description}</div></div>` : ''}
//       <div class="section meta-section"><h3>اطلاعات تکمیلی</h3><div class="row"><span class="lbl">شناسه</span><span class="val">#${toPersianNumber(contract.id)}</span></div><div class="row"><span class="lbl">نسخه</span><span class="val">${toPersianNumber(contract.version)}</span></div><div class="row"><span class="lbl">بایگانی</span><span class="val">${contract.is_archived ? 'بله' : 'خیر'}</span></div><div class="row"><span class="lbl">تاریخ ایجاد</span><span class="val">${dateUtils.toJalali(contract.created_at)}</span></div></div>
//     </div>
//   </div>
//   <div class="signature">
//     <div class="sig-item"><div class="line"></div><div class="label">امضای کارفرما</div></div>
//     <div class="sig-item"><div class="line"></div><div class="label">امضای پیمانکار</div></div>
//   </div>
//   <div class="footer">
//     <span>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
//     <span>شماره قرارداد: ${contract.contract_number}</span>
//   </div>
// </body>
// </html>`;

//       const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
//       saveAs(blob, `قرارداد_${contract.contract_number}.doc`);
//       toast.success('فایل Word با موفقیت دانلود شد');

//     } catch (error) {
//       console.error('Word export error:', error);
//       toast.error('خطا در ایجاد فایل Word');
//     }
//     setIsExporting(false);
//   };

//   // ========== Export to PDF ==========
//   const exportToPDF = async () => {
//     if (!contract) return;
//     setIsExporting(true);
//     setShowExportMenu(false);

//     try {
//       const statusInfo = CONTRACT_STATUSES[contract.status];
//       const remaining = contract.total_amount - contract.paid_amount;
//       const financialProgress = contract.total_amount > 0
//         ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100)
//         : 0;
//       const physicalProgress = toNumber(contract.physical_progress);
//       const contractorName = contract.company_name || contract.university_name || '—';

//       const pdfContainer = document.createElement('div');
//       pdfContainer.style.cssText = `
//         padding: 40px;
//         background: white;
//         font-family: 'Vazir', 'B Nazanin', Tahoma, sans-serif;
//         direction: rtl;
//         width: 794px;
//         margin: 0 auto;
//         position: absolute;
//         left: -9999px;
//         top: 0;
//       `;

//       pdfContainer.innerHTML = `
//         <div style="padding: 30px 35px; background: white; font-family: 'Vazir', 'B Nazanin', Tahoma, sans-serif; direction: rtl; max-width: 794px;">
//           <div style="background: #4f46e5; color: white; padding: 30px 35px; border-radius: 14px; margin-bottom: 25px; text-align: center;">
//             <div style="font-size: 26px; font-weight: 700;">گزارش قرارداد</div>
//             <div style="font-size: 17px; opacity: 0.9; margin-top: 4px;">${contract.contract_number}</div>
//             <div style="margin-top: 8px;">
//               <span style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 18px; border-radius: 20px; font-size: 13px; font-weight: 500;">
//                 ${statusInfo?.label || contract.status}
//               </span>
//             </div>
//           </div>
//           <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 20px;">
//             <div style="background: #eef2ff; border-radius: 10px; padding: 12px 14px; text-align: center;">
//               <div style="font-size: 10px; color: #6b7280;">مبلغ کل</div>
//               <div style="font-size: 15px; font-weight: 700; color: #4f46e5;">${toPersianNumber(Number(contract.total_amount))} ریال</div>
//             </div>
//             <div style="background: #d1fae5; border-radius: 10px; padding: 12px 14px; text-align: center;">
//               <div style="font-size: 10px; color: #6b7280;">مبلغ پرداختی</div>
//               <div style="font-size: 15px; font-weight: 700; color: #059669;">${toPersianNumber(Number(contract.paid_amount))} ریال</div>
//             </div>
//             <div style="background: ${remaining > 0 ? '#fee2e2' : '#d1fae5'}; border-radius: 10px; padding: 12px 14px; text-align: center;">
//               <div style="font-size: 10px; color: #6b7280;">مبلغ باقیمانده</div>
//               <div style="font-size: 15px; font-weight: 700; color: ${remaining > 0 ? '#dc2626' : '#059669'};">${toPersianNumber(Number(remaining))} ریال</div>
//             </div>
//             <div style="background: #fef3c7; border-radius: 10px; padding: 12px 14px; text-align: center;">
//               <div style="font-size: 10px; color: #6b7280;">پیشرفت مالی</div>
//               <div style="font-size: 15px; font-weight: 700; color: #d97706;">${toPersianNumber(financialProgress)}%</div>
//             </div>
//             <div style="background: #dbeafe; border-radius: 10px; padding: 12px 14px; text-align: center;">
//               <div style="font-size: 10px; color: #6b7280;">پیشرفت فیزیکی</div>
//               <div style="font-size: 15px; font-weight: 700; color: #6366f1;">${toPersianNumber(physicalProgress)}%</div>
//             </div>
//           </div>
//           <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; padding: 14px 18px; background: #f8fafc; border-radius: 10px; border: 1px solid #e9ecef;">
//             <div>
//               <div style="display: flex; justify-content: space-between; font-size: 12px; color: #374151; margin-bottom: 4px;">
//                 <span>پیشرفت مالی</span>
//                 <span style="font-weight: 600; color: #1a1a2e;">${toPersianNumber(financialProgress)}%</span>
//               </div>
//               <div style="height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden;">
//                 <div style="height: 100%; width: ${financialProgress}%; background: #059669; border-radius: 4px;"></div>
//               </div>
//             </div>
//             <div>
//               <div style="display: flex; justify-content: space-between; font-size: 12px; color: #374151; margin-bottom: 4px;">
//                 <span>پیشرفت فیزیکی</span>
//                 <span style="font-weight: 600; color: #1a1a2e;">${toPersianNumber(physicalProgress)}%</span>
//               </div>
//               <div style="height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden;">
//                 <div style="height: 100%; width: ${physicalProgress}%; background: #4f46e5; border-radius: 4px;"></div>
//               </div>
//             </div>
//           </div>
//           <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
//             <div>
//               <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px;">
//                 <div style="font-size: 13px; font-weight: 700; color: #4f46e5; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid #e9ecef;">طرف قرارداد</div>
//                 <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px;">
//                   <span style="color: #6b7280;">طرف قرارداد</span>
//                   <span style="font-weight: 600; color: #4f46e5;">${contractorName}</span>
//                 </div>
//               </div>
//               <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px;">
//                 <div style="font-size: 13px; font-weight: 700; color: #4f46e5; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid #e9ecef;">تاریخ‌ها</div>
//                 <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px;">
//                   <span style="color: #6b7280;">تاریخ قرارداد</span>
//                   <span style="font-weight: 500;">${dateUtils.toJalali(contract.date)}</span>
//                 </div>
//                 <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px;">
//                   <span style="color: #6b7280;">تاریخ شروع</span>
//                   <span style="font-weight: 500;">${dateUtils.toJalali(contract.start_date)}</span>
//                 </div>
//                 <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px;">
//                   <span style="color: #6b7280;">تاریخ پایان</span>
//                   <span style="font-weight: 500;">${dateUtils.toJalali(contract.end_date)}</span>
//                 </div>
//                 <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px;">
//                   <span style="color: #6b7280;">مدت قرارداد</span>
//                   <span style="font-weight: 600; color: #4f46e5;">${toPersianNumber(contract.contract_duration_months || 0)} ماه</span>
//                 </div>
//               </div>
//               <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 14px 18px;">
//                 <div style="font-size: 13px; font-weight: 700; color: #4f46e5; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid #e9ecef;">اطلاعات مالی</div>
//                 <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px;">
//                   <span style="color: #6b7280;">مبلغ کل</span>
//                   <span style="font-weight: 700; color: #4f46e5;">${toPersianNumber(Number(contract.total_amount))} ریال</span>
//                 </div>
//                 <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px;">
//                   <span style="color: #6b7280;">مبلغ پرداختی</span>
//                   <span style="font-weight: 700; color: #059669;">${toPersianNumber(Number(contract.paid_amount))} ریال</span>
//                 </div>
//                 <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px;">
//                   <span style="color: #6b7280;">مبلغ باقیمانده</span>
//                   <span style="font-weight: 700; color: ${remaining > 0 ? '#d97706' : '#059669'};">${toPersianNumber(Number(remaining))} ریال</span>
//                 </div>
//               </div>
//             </div>
//             <div>
//               ${contract.description ? `
//               <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px;">
//                 <div style="font-size: 13px; font-weight: 700; color: #4f46e5; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid #e9ecef;">شرح قرارداد</div>
//                 <div style="font-size: 12px; color: #374151; line-height: 1.8; text-align: justify;">${contract.description}</div>
//               </div>` : ''}
//               ${contract.commitments ? `
//               <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px;">
//                 <div style="font-size: 13px; font-weight: 700; color: #4f46e5; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid #e9ecef;">تعهدات طرفین</div>
//                 <div style="font-size: 12px; color: #374151; line-height: 1.8; text-align: justify;">${contract.commitments}</div>
//               </div>` : ''}
//               ${contract.services_description ? `
//               <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px;">
//                 <div style="font-size: 13px; font-weight: 700; color: #4f46e5; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid #e9ecef;">شرح خدمات</div>
//                 <div style="font-size: 12px; color: #374151; line-height: 1.8; text-align: justify;">${contract.services_description}</div>
//               </div>` : ''}
//               <div style="background: #f8fafc; border: 1px solid #e9ecef; border-radius: 10px; padding: 14px 18px;">
//                 <div style="font-size: 13px; font-weight: 700; color: #4f46e5; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid #e9ecef;">اطلاعات تکمیلی</div>
//                 <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; border-bottom: 1px solid #f3f4f6;">
//                   <span style="color: #6b7280;">شناسه</span>
//                   <span style="font-weight: 500;">#${toPersianNumber(contract.id)}</span>
//                 </div>
//                 <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; border-bottom: 1px solid #f3f4f6;">
//                   <span style="color: #6b7280;">نسخه</span>
//                   <span style="font-weight: 500;">${toPersianNumber(contract.version)}</span>
//                 </div>
//                 <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; border-bottom: 1px solid #f3f4f6;">
//                   <span style="color: #6b7280;">بایگانی</span>
//                   <span style="font-weight: 500;">${contract.is_archived ? 'بله' : 'خیر'}</span>
//                 </div>
//                 <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
//                   <span style="color: #6b7280;">تاریخ ایجاد</span>
//                   <span style="font-weight: 500;">${dateUtils.toJalali(contract.created_at)}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div style="margin-top: 25px; padding-top: 14px; border-top: 2px solid #e9ecef; display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af;">
//             <span>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</span>
//             <span>شماره قرارداد: ${contract.contract_number}</span>
//           </div>
//         </div>
//       `;

//       document.body.appendChild(pdfContainer);

//       const canvas = await html2canvas(pdfContainer, {
//         scale: 2,
//         useCORS: true,
//         allowTaint: true,
//         backgroundColor: '#ffffff',
//         logging: false,
//         width: 794,
//         height: pdfContainer.scrollHeight,
//       });

//       document.body.removeChild(pdfContainer);

//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

//       let heightLeft = pdfHeight;
//       let position = 0;
//       const pageHeight = pdf.internal.pageSize.getHeight();

//       pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
//       heightLeft -= pageHeight;

//       while (heightLeft > 0) {
//         position = heightLeft - pdfHeight;
//         pdf.addPage();
//         pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
//         heightLeft -= pageHeight;
//       }

//       pdf.save(`قرارداد_${contract.contract_number}.pdf`);
//       toast.success('فایل PDF با موفقیت دانلود شد');

//     } catch (error) {
//       console.error('PDF export error:', error);
//       toast.error('خطا در ایجاد فایل PDF');
//     }
//     setIsExporting(false);
//   };

//   // ========== Export to Excel ==========
//   const exportToExcel = () => {
//     if (!contract) return;
//     setIsExporting(true);
//     setShowExportMenu(false);

//     try {
//       const remaining = contract.total_amount - contract.paid_amount;
//       const financialProgress = contract.total_amount > 0
//         ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100)
//         : 0;
//       const physicalProgress = toNumber(contract.physical_progress);

//       const data = [
//         {
//           'شماره قرارداد': contract.contract_number,
//           'موضوع': contract.subject,
//           'طرف قرارداد': contract.company_name || contract.university_name || '—',
//           'مبلغ کل (ریال)': toPersianNumber(Number(contract.total_amount)),
//           'مبلغ پرداختی (ریال)': toPersianNumber(Number(contract.paid_amount)),
//           'مبلغ باقیمانده (ریال)': toPersianNumber(Number(remaining)),
//           'پیشرفت مالی (%)': toPersianNumber(financialProgress),
//           'پیشرفت فیزیکی (%)': toPersianNumber(physicalProgress),
//           'وضعیت': CONTRACT_STATUSES[contract.status]?.label || contract.status,
//           'تاریخ قرارداد': dateUtils.toJalali(contract.date),
//           'تاریخ شروع': dateUtils.toJalali(contract.start_date),
//           'تاریخ پایان': dateUtils.toJalali(contract.end_date),
//           'مدت (ماه)': toPersianNumber(contract.contract_duration_months || 0),
//           'نسخه': toPersianNumber(contract.version),
//           'بایگانی': contract.is_archived ? 'بله' : 'خیر',
//         }
//       ];

//       if (contract.description) {
//         data[0]['شرح قرارداد'] = contract.description;
//       }
//       if (contract.commitments) {
//         data[0]['تعهدات طرفین'] = contract.commitments;
//       }
//       if (contract.services_description) {
//         data[0]['شرح خدمات'] = contract.services_description;
//       }

//       const wb = XLSX.utils.book_new();
//       const ws = XLSX.utils.json_to_sheet(data);

//       const colWidths = [
//         { wch: 20 }, { wch: 30 }, { wch: 25 }, { wch: 18 }, { wch: 18 },
//         { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
//         { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
//       ];

//       if (contract.description) colWidths.push({ wch: 40 });
//       if (contract.commitments) colWidths.push({ wch: 40 });
//       if (contract.services_description) colWidths.push({ wch: 40 });

//       ws['!cols'] = colWidths;

//       XLSX.utils.book_append_sheet(wb, ws, 'قرارداد');
//       XLSX.writeFile(wb, `قرارداد_${contract.contract_number}.xlsx`);
//       toast.success('فایل Excel با موفقیت دانلود شد');

//     } catch (error) {
//       console.error('Excel export error:', error);
//       toast.error('خطا در ایجاد فایل Excel');
//     }
//     setIsExporting(false);
//   };

//   // ========== Print ==========
//   const handlePrint = () => {
//     window.print();
//     setShowExportMenu(false);
//   };

//   // ========== Loading ==========
//   if (isLoading) {
//     return (
//       <div className="contract-details-page">
//         <div className="loading-container">
//           <div className="spinner"></div>
//           <p>در حال بارگذاری اطلاعات قرارداد...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!contract) {
//     return (
//       <div className="contract-details-page">
//         <div className="error-container">
//           <AlertCircle size={64} />
//           <h3>قرارداد یافت نشد</h3>
//           <p>قرارداد مورد نظر با شناسه {id} در سیستم وجود ندارد</p>
//           <button className="btn-back" onClick={() => navigate('/contract')}>
//             <ArrowLeft size={16} />
//             بازگشت به لیست قراردادها
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const statusInfo = CONTRACT_STATUSES[contract.status];
//   const remaining = contract.total_amount - contract.paid_amount;
//   const financialProgress = contract.total_amount > 0
//     ? Math.round((Number(contract.paid_amount) / Number(contract.total_amount)) * 100)
//     : 0;
//   const physicalProgress = toNumber(contract.physical_progress);

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'COMPLETED': return CheckCircle;
//       case 'IN_PROGRESS': return Clock;
//       case 'DRAFT': return Edit;
//       case 'TERMINATED': return AlertCircle;
//       default: return Clock;
//     }
//   };

//   const StatusIcon = getStatusIcon(contract.status);

//   return (
//     <div className="contract-details-page">
//       {/* ========== Header ========== */}
//       <div className="details-header">
//         <div className="header-left">
//           <button className="btn-back" onClick={() => navigate('/contract')}>
//             <ArrowLeft size={18} />
//             بازگشت
//           </button>
//           <div className="header-title">
//             <FileText size={24} className="title-icon" />
//             <div>
//               <h1>{contract.contract_number}</h1>
//               <span className="contract-subject-header">{contract.subject}</span>
//             </div>
//           </div>
//         </div>
//         <div className="header-right">
//           <span
//             className="status-badge-large"
//             style={{
//               backgroundColor: statusInfo?.color + '20',
//               color: statusInfo?.color,
//             }}
//           >
//             <StatusIcon size={16} />
//             {statusInfo?.label || contract.status}
//           </span>
//         </div>
//       </div>

//       {/* ========== Action Bar ========== */}
//       <div className="action-bar">
//         <div className="action-bar-left">
//           <button className="action-btn primary" onClick={handleEdit}>
//             <Edit size={16} />
//             ویرایش
//           </button>
//           <button className="action-btn danger" onClick={handleDelete} disabled={isDeleting}>
//             <Trash2 size={16} />
//             حذف
//           </button>
//         </div>
//         <div className="action-bar-right">
//           <button className="action-btn" onClick={copyToClipboard}>
//             {copied ? <Check size={16} /> : <Copy size={16} />}
//             {copied ? 'کپی شد' : 'کپی اطلاعات'}
//           </button>
//           <button className="action-btn" onClick={handlePrint}>
//             <Printer size={16} />
//             چاپ
//           </button>
//           <div className="export-wrapper">
//             <button
//               className="action-btn primary"
//               onClick={() => setShowExportMenu(!showExportMenu)}
//               disabled={isExporting}
//             >
//               {isExporting ? (
//                 <Loader2 size={16} className="animate-spin" />
//               ) : (
//                 <Download size={16} />
//               )}
//               {isExporting ? 'در حال خروجی‌گیری...' : 'خروجی'}
//               <ChevronDown size={14} />
//             </button>
//             {showExportMenu && (
//               <div className="export-menu">
//                 <div className="export-group-label">اسناد رسمی</div>
//                 <button onClick={exportToPDF} disabled={isExporting}>
//                   <FileText size={16} />
//                   PDF
//                   <span className="export-desc">سند قابل چاپ</span>
//                 </button>
//                 <button onClick={exportToWord} disabled={isExporting}>
//                   <FileText size={16} />
//                   Word
//                   <span className="export-desc">قابل ویرایش در ورد</span>
//                 </button>
//                 <button onClick={exportToExcel} disabled={isExporting}>
//                   <FileSpreadsheet size={16} />
//                   Excel
//                   <span className="export-desc">داده‌های عددی</span>
//                 </button>
//                 <div className="export-group-label">وب و متن</div>
//                 <button onClick={exportHTML} disabled={isExporting}>
//                   <FileText size={16} />
//                   HTML
//                   <span className="export-desc">صفحه وب</span>
//                 </button>
//                 <button onClick={exportTXT} disabled={isExporting}>
//                   <FileText size={16} />
//                   TXT
//                   <span className="export-desc">متن ساده</span>
//                 </button>
//                 <div className="export-group-label">داده و تبادل</div>
//                 <button onClick={exportJSON} disabled={isExporting}>
//                   <FileText size={16} />
//                   JSON
//                   <span className="export-desc">داده‌های ساختاریافته</span>
//                 </button>
//                 <button onClick={exportXML} disabled={isExporting}>
//                   <FileText size={16} />
//                   XML
//                   <span className="export-desc">تبادل داده</span>
//                 </button>
//                 <button onClick={exportCSV} disabled={isExporting}>
//                   <FileText size={16} />
//                   CSV
//                   <span className="export-desc">صفحات گسترده</span>
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ========== Content ========== */}
//       <div className="details-content" ref={contentRef}>
//         <div className="summary-cards">
//           <div className="summary-card">
//             <div className="summary-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
//               <DollarSign size={20} />
//             </div>
//             <div className="summary-info">
//               <span className="summary-label">مبلغ کل</span>
//               <span className="summary-value">{toPersianNumber(Number(contract.total_amount))} ریال</span>
//             </div>
//           </div>
//           <div className="summary-card">
//             <div className="summary-icon" style={{ background: '#d1fae5', color: '#059669' }}>
//               <CheckCircle size={20} />
//             </div>
//             <div className="summary-info">
//               <span className="summary-label">مبلغ پرداختی</span>
//               <span className="summary-value">{toPersianNumber(Number(contract.paid_amount))} ریال</span>
//             </div>
//           </div>
//           <div className="summary-card">
//             <div className="summary-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
//               <TrendingUp size={20} />
//             </div>
//             <div className="summary-info">
//               <span className="summary-label">مبلغ باقیمانده</span>
//               <span className="summary-value">{toPersianNumber(Number(remaining))} ریال</span>
//             </div>
//           </div>
//           <div className="summary-card">
//             <div className="summary-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
//               <BarChart3 size={20} />
//             </div>
//             <div className="summary-info">
//               <span className="summary-label">پیشرفت مالی</span>
//               <span className="summary-value">{toPersianNumber(financialProgress)}%</span>
//             </div>
//           </div>
//           <div className="summary-card">
//             <div className="summary-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
//               <TrendingUp size={20} />
//             </div>
//             <div className="summary-info">
//               <span className="summary-label">پیشرفت فیزیکی</span>
//               <span className="summary-value">{toPersianNumber(physicalProgress)}%</span>
//             </div>
//           </div>
//         </div>

//         <div className="progress-section">
//           <div className="progress-item">
//             <div className="progress-header">
//               <span className="progress-label">پیشرفت مالی</span>
//               <span className="progress-value">{toPersianNumber(financialProgress)}%</span>
//             </div>
//             <div className="progress-bar">
//               <div
//                 className="progress-fill financial"
//                 style={{ width: `${financialProgress}%` }}
//               />
//             </div>
//           </div>
//           <div className="progress-item">
//             <div className="progress-header">
//               <span className="progress-label">پیشرفت فیزیکی</span>
//               <span className="progress-value">{toPersianNumber(physicalProgress)}%</span>
//             </div>
//             <div className="progress-bar">
//               <div
//                 className="progress-fill physical"
//                 style={{ width: `${physicalProgress}%` }}
//               />
//             </div>
//           </div>
//         </div>

//         <div className="info-grid">
//           <div className="info-column">
//             <div className="info-section">
//               <h3><Building2 size={18} /> طرف قرارداد</h3>
//               <div className="info-row">
//                 <span className="info-label">طرف قرارداد</span>
//                 <span className="info-value highlight">{contract.company_name || contract.university_name || '—'}</span>
//               </div>
//             </div>

//             <div className="info-section">
//               <h3><Calendar size={18} /> تاریخ‌ها</h3>
//               <div className="info-row">
//                 <span className="info-label">تاریخ قرارداد</span>
//                 <span className="info-value">{dateUtils.toJalali(contract.date)}</span>
//               </div>
//               <div className="info-row">
//                 <span className="info-label">تاریخ شروع</span>
//                 <span className="info-value">{dateUtils.toJalali(contract.start_date)}</span>
//               </div>
//               <div className="info-row">
//                 <span className="info-label">تاریخ پایان</span>
//                 <span className="info-value">{dateUtils.toJalali(contract.end_date)}</span>
//               </div>
//               <div className="info-row">
//                 <span className="info-label">مدت قرارداد</span>
//                 <span className="info-value">{toPersianNumber(contract.contract_duration_months || 0)} ماه</span>
//               </div>
//             </div>

//             <div className="info-section">
//               <h3><DollarSign size={18} /> اطلاعات مالی</h3>
//               <div className="info-row">
//                 <span className="info-label">مبلغ کل</span>
//                 <span className="info-value amount">{toPersianNumber(Number(contract.total_amount))} ریال</span>
//               </div>
//               <div className="info-row">
//                 <span className="info-label">مبلغ پرداختی</span>
//                 <span className="info-value amount success">{toPersianNumber(Number(contract.paid_amount))} ریال</span>
//               </div>
//               <div className="info-row">
//                 <span className="info-label">مبلغ باقیمانده</span>
//                 <span className={`info-value amount ${remaining > 0 ? 'warning' : 'success'}`}>
//                   {toPersianNumber(Number(remaining))} ریال
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="info-column">
//             {contract.description && (
//               <div className="info-section">
//                 <h3><FileText size={18} /> شرح قرارداد</h3>
//                 <p className={`description-text ${showFullDescription ? 'expanded' : ''}`}>
//                   {contract.description}
//                 </p>
//                 {contract.description.length > 300 && (
//                   <button className="toggle-description" onClick={() => setShowFullDescription(!showFullDescription)}>
//                     {showFullDescription ? <>مشاهده کمتر <ChevronUp size={14} /></> : <>مشاهده بیشتر <ChevronDown size={14} /></>}
//                   </button>
//                 )}
//               </div>
//             )}

//             {contract.commitments && (
//               <div className="info-section">
//                 <h3><CheckCircle size={18} /> تعهدات طرفین</h3>
//                 <p className="description-text">{contract.commitments}</p>
//               </div>
//             )}

//             {contract.services_description && (
//               <div className="info-section">
//                 <h3><Layers size={18} /> شرح خدمات</h3>
//                 <p className="description-text">{contract.services_description}</p>
//               </div>
//             )}

//             {(contract.contract_file || contract.certificate_file || contract.declaration_file) && (
//               <div className="info-section">
//                 <h3><Paperclip size={18} /> فایل‌های پیوست</h3>
//                 <div className="files-list">
//                   {contract.contract_file && <FileItem url={contract.contract_file} label="فایل قرارداد" />}
//                   {contract.certificate_file && <FileItem url={contract.certificate_file} label="فایل مفاصا" />}
//                   {contract.declaration_file && <FileItem url={contract.declaration_file} label="فایل نامه قرارداد" />}
//                 </div>
//               </div>
//             )}

//              {/* ===== فعالیت‌ها ===== */}
//             {contract.activities && contract.activities.length > 0 && (
//               <div className="info-section">
//                 <h3><Layers size={18} /> فعالیت‌های قرارداد</h3>
//                 <div className="activities-list">
//                   {contract.activities.map((activity, index) => (
//                     <div key={index} className="activity-item-detail">
//                       <div className="activity-detail-header">
//                         <span className="activity-detail-title">{activity.title}</span>
//                         <span
//                           className="activity-status-badge"
//                           style={{
//                             backgroundColor: ACTIVITY_STATUSES[activity.status]?.color + '20',
//                             color: ACTIVITY_STATUSES[activity.status]?.color,
//                           }}
//                         >
//                           {ACTIVITY_STATUSES[activity.status]?.label || activity.status}
//                         </span>
//                       </div>
//                       {activity.description && (
//                         <p className="activity-detail-desc">{activity.description}</p>
//                       )}
//                       <div className="activity-detail-meta">
//                         {activity.start_date && (
//                           <span>شروع: {dateUtils.toJalali(activity.start_date)}</span>
//                         )}
//                         {activity.end_date && (
//                           <span>پایان: {dateUtils.toJalali(activity.end_date)}</span>
//                         )}
//                         <span>پیشرفت: {activity.progress || 0}%</span>
//                       </div>
//                       <div className="progress-mini-detail">
//                         <div
//                           className="progress-fill-mini-detail"
//                           style={{ width: `${activity.progress || 0}%` }}
//                         />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="info-section meta">
//               <div className="meta-row"><span className="meta-label">شناسه</span><span className="meta-value">#{toPersianNumber(contract.id)}</span></div>
//               <div className="meta-row"><span className="meta-label">نسخه</span><span className="meta-value">{toPersianNumber(contract.version)}</span></div>
//               <div className="meta-row"><span className="meta-label">بایگانی</span><span className="meta-value">{contract.is_archived ? 'بله' : 'خیر'}</span></div>
//               <div className="meta-row"><span className="meta-label">تاریخ ایجاد</span><span className="meta-value">{dateUtils.toJalali(contract.created_at)}</span></div>
//               <div className="meta-row"><span className="meta-label">آخرین بروزرسانی</span><span className="meta-value">{dateUtils.toJalali(contract.updated_at)}</span></div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ========== مودال ویرایش ========== */}
//       {editFormOpen && contract && (
//         <div className="modal-overlay" onClick={handleEditCancel}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <ContractForm
//               initialData={contract}
//               onSuccess={handleEditSuccess}
//               onCancel={handleEditCancel}
//             />
//           </div>
//         </div>
//       )}

//       <style>{`
//         .contract-details-page {
//           padding: 24px;
//           min-height: 100vh;
//           background: #f8fafc;
//         }

//         .loading-container {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           min-height: 400px;
//           gap: 16px;
//         }

//         .spinner {
//           width: 40px;
//           height: 40px;
//           border: 4px solid #e9ecef;
//           border-top-color: #4f46e5;
//           border-radius: 50%;
//           animation: spin 0.8s linear infinite;
//         }

//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }

//         .animate-spin {
//           animation: spin 1s linear infinite;
//         }

//         .error-container {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           min-height: 400px;
//           gap: 12px;
//           text-align: center;
//         }

//         .details-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: flex-start;
//           margin-bottom: 20px;
//           padding: 20px 24px;
//           background: white;
//           border-radius: 12px;
//           box-shadow: 0 1px 3px rgba(0,0,0,0.06);
//           flex-wrap: wrap;
//           gap: 16px;
//         }

//         .header-left {
//           display: flex;
//           align-items: center;
//           gap: 16px;
//           flex-wrap: wrap;
//         }

//         .btn-back {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 8px 16px;
//           border: 1px solid #e9ecef;
//           border-radius: 8px;
//           background: white;
//           color: #374151;
//           cursor: pointer;
//           transition: all 0.2s;
//           font-size: 14px;
//         }

//         .btn-back:hover {
//           background: #f8fafc;
//         }

//         .header-title {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }

//         .title-icon {
//           color: #4f46e5;
//         }

//         .header-title h1 {
//           margin: 0;
//           font-size: 22px;
//           font-weight: 700;
//           color: #1a1a2e;
//         }

//         .contract-subject-header {
//           font-size: 14px;
//           color: #6b7280;
//           display: block;
//         }

//         .status-badge-large {
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           padding: 8px 20px;
//           border-radius: 24px;
//           font-size: 14px;
//           font-weight: 600;
//         }

//         .action-bar {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 20px;
//           padding: 12px 16px;
//           background: white;
//           border-radius: 12px;
//           box-shadow: 0 1px 3px rgba(0,0,0,0.06);
//           flex-wrap: wrap;
//           gap: 12px;
//         }

//         .action-bar-left, .action-bar-right {
//           display: flex;
//           gap: 8px;
//           flex-wrap: wrap;
//         }

//         .action-btn {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 8px 16px;
//           border: 1px solid #e9ecef;
//           border-radius: 8px;
//           background: white;
//           color: #374151;
//           cursor: pointer;
//           transition: all 0.2s;
//           font-size: 13px;
//           font-weight: 500;
//         }

//         .action-btn:hover {
//           background: #f8fafc;
//         }

//         .action-btn.primary {
//           background: #4f46e5;
//           color: white;
//           border-color: #4f46e5;
//         }

//         .action-btn.primary:hover {
//           background: #4338ca;
//         }

//         .action-btn.danger {
//           color: #dc2626;
//           border-color: #fecaca;
//         }

//         .action-btn.danger:hover {
//           background: #fee2e2;
//         }

//         .action-btn:disabled {
//           opacity: 0.6;
//           cursor: not-allowed;
//         }

//         .export-wrapper {
//           position: relative;
//         }

//         .export-menu {
//           position: absolute;
//           top: calc(100% + 8px);
//           right: 0;
//           background: white;
//           border: 1px solid #e9ecef;
//           border-radius: 12px;
//           box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
//           min-width: 220px;
//           z-index: 100;
//           overflow: hidden;
//           padding: 8px 0;
//         }

//         .export-group-label {
//           padding: 8px 16px 4px 16px;
//           font-size: 11px;
//           font-weight: 700;
//           color: #9ca3af;
//           text-transform: uppercase;
//           letter-spacing: 0.5px;
//           border-bottom: 1px solid #f3f4f6;
//           margin-bottom: 4px;
//         }

//         .export-group-label:not(:first-child) {
//           margin-top: 8px;
//           border-top: 1px solid #f3f4f6;
//           padding-top: 12px;
//         }

//         .export-menu button {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           width: 100%;
//           padding: 10px 16px;
//           border: none;
//           background: transparent;
//           color: #374151;
//           cursor: pointer;
//           transition: all 0.2s;
//           font-size: 14px;
//           text-align: right;
//           font-weight: 500;
//         }

//         .export-menu button:hover {
//           background: #f3f4f6;
//         }

//         .export-menu button:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         .export-menu button .export-desc {
//           font-size: 11px;
//           color: #9ca3af;
//           font-weight: 400;
//           margin-right: auto;
//         }

//         .modal-overlay {
//           position: fixed;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background: rgba(0, 0, 0, 0.5);
//           backdrop-filter: blur(4px);
//           z-index: 1050;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           padding: 20px;
//         }

//         .modal-content {
//           background: white;
//           border-radius: 16px;
//           max-width: 800px;
//           width: 100%;
//           max-height: 90vh;
//           overflow-y: auto;
//           box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
//         }

//         @media (max-width: 768px) {
//           .modal-content {
//             margin: 10px;
//             max-width: 100%;
//           }
//         }

//         .details-content {
//           display: flex;
//           flex-direction: column;
//           gap: 20px;
//         }

//         .summary-cards {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
//           gap: 12px;
//         }

//         .summary-card {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           padding: 16px 20px;
//           background: white;
//           border-radius: 12px;
//           border: 1px solid #e9ecef;
//           transition: all 0.2s;
//         }

//         .summary-card:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 4px 12px rgba(0,0,0,0.06);
//         }

//         .summary-icon {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 40px;
//           height: 40px;
//           border-radius: 10px;
//           flex-shrink: 0;
//         }

//         .summary-info {
//           display: flex;
//           flex-direction: column;
//         }

//         .summary-label {
//           font-size: 12px;
//           color: #6b7280;
//         }

//         .summary-value {
//           font-size: 18px;
//           font-weight: 700;
//           color: #1a1a2e;
//         }

//         .progress-section {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 16px;
//           padding: 16px 20px;
//           background: white;
//           border-radius: 12px;
//           border: 1px solid #e9ecef;
//         }

//         .progress-item {
//           display: flex;
//           flex-direction: column;
//           gap: 6px;
//         }

//         .progress-header {
//           display: flex;
//           justify-content: space-between;
//           font-size: 13px;
//           color: #374151;
//         }

//         .progress-label {
//           font-weight: 500;
//         }

//         .progress-value {
//           font-weight: 600;
//           color: #1a1a2e;
//         }

//         .progress-bar {
//           height: 8px;
//           background: #e9ecef;
//           border-radius: 4px;
//           overflow: hidden;
//         }

//         .progress-fill {
//           height: 100%;
//           border-radius: 4px;
//           transition: width 0.6s ease;
//         }

//         .progress-fill.financial {
//           background: linear-gradient(90deg, #059669, #10b981);
//         }

//         .progress-fill.physical {
//           background: linear-gradient(90deg, #4f46e5, #7c3aed);
//         }

//         .info-grid {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 20px;
//         }

//         .info-column {
//           display: flex;
//           flex-direction: column;
//           gap: 16px;
//         }

//         .info-section {
//           padding: 16px 20px;
//           background: white;
//           border-radius: 12px;
//           border: 1px solid #e9ecef;
//         }

//         .info-section h3 {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           font-size: 14px;
//           font-weight: 600;
//           color: #1a1a2e;
//           margin: 0 0 12px 0;
//         }

//         .info-row {
//           display: flex;
//           justify-content: space-between;
//           padding: 6px 0;
//           border-bottom: 1px solid #f3f4f6;
//           font-size: 13px;
//         }

//         .info-row:last-child {
//           border-bottom: none;
//         }

//         .info-label {
//           color: #6b7280;
//         }

//         .info-value {
//           font-weight: 500;
//           color: #1a1a2e;
//         }

//         .info-value.highlight {
//           color: #4f46e5;
//           font-weight: 600;
//         }

//         .info-value.amount {
//           font-size: 15px;
//         }

//         .info-value.success {
//           color: #059669;
//         }

//         .info-value.warning {
//           color: #d97706;
//         }

//         .description-text {
//           font-size: 14px;
//           color: #374151;
//           line-height: 1.8;
//           margin: 0;
//           white-space: pre-wrap;
//           max-height: 120px;
//           overflow: hidden;
//           transition: max-height 0.3s ease;
//         }

//         .description-text.expanded {
//           max-height: none;
//         }

//         .toggle-description {
//           display: inline-flex;
//           align-items: center;
//           gap: 4px;
//           margin-top: 8px;
//           background: none;
//           border: none;
//           color: #4f46e5;
//           font-size: 13px;
//           cursor: pointer;
//           padding: 4px 8px;
//           border-radius: 4px;
//           transition: all 0.2s;
//         }

//         .toggle-description:hover {
//           background: #eef2ff;
//         }

//         .files-list {
//           display: flex;
//           flex-direction: column;
//           gap: 8px;
//         }

//         .file-item {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           padding: 10px 14px;
//           background: #f8fafc;
//           border: 1px solid #e9ecef;
//           border-radius: 8px;
//         }

//         .file-item .file-icon {
//           color: #6b7280;
//         }

//         .file-item .file-label {
//           font-size: 13px;
//           font-weight: 500;
//           color: #1a1a2e;
//           flex: 1;
//         }

//         .file-item .file-actions {
//           display: flex;
//           gap: 4px;
//         }

//         .file-item .file-action {
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           width: 32px;
//           height: 32px;
//           border: none;
//           border-radius: 6px;
//           background: transparent;
//           color: #6b7280;
//           cursor: pointer;
//           transition: all 0.2s;
//           text-decoration: none;
//         }

//         .file-item .file-action:hover {
//           background: #f3f4f6;
//           color: #4f46e5;
//         }

//         .info-section.meta {
//           background: #f8fafc;
//         }

//         .meta-row {
//           display: flex;
//           justify-content: space-between;
//           padding: 4px 0;
//           font-size: 12px;
//         }

//         .meta-label {
//           color: #6b7280;
//         }

//         .meta-value {
//           color: #1a1a2e;
//           font-weight: 500;
//         }

//         @media (max-width: 1024px) {
//           .info-grid {
//             grid-template-columns: 1fr;
//           }
//         }

//         @media (max-width: 768px) {
//           .contract-details-page {
//             padding: 12px;
//           }

//           .details-header {
//             flex-direction: column;
//             padding: 16px;
//           }

//           .header-left {
//             width: 100%;
//           }

//           .header-title h1 {
//             font-size: 18px;
//           }

//           .action-bar {
//             flex-direction: column;
//             align-items: stretch;
//           }

//           .action-bar-left, .action-bar-right {
//             justify-content: center;
//           }

//           .summary-cards {
//             grid-template-columns: 1fr 1fr;
//           }

//           .progress-section {
//             grid-template-columns: 1fr;
//           }

//           .export-menu {
//             position: fixed;
//             top: auto;
//             bottom: 0;
//             right: 0;
//             left: 0;
//             border-radius: 16px 16px 0 0;
//             max-height: 70vh;
//             overflow-y: auto;
//             min-width: unset;
//             width: 100%;
//             box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
//             padding: 12px 0 20px 0;
//           }

//           .export-menu button {
//             padding: 12px 20px;
//             font-size: 15px;
//           }

//           .export-group-label {
//             padding: 12px 20px 4px 20px;
//           }
//         }

//         @media print {
//           .contract-details-page {
//             background: white;
//             padding: 20px;
//           }

//           .action-bar, .btn-back, .export-wrapper, .toggle-description {
//             display: none !important;
//           }

//           .details-header {
//             box-shadow: none;
//             border-bottom: 2px solid #e9ecef;
//           }

//           .info-section {
//             border: 1px solid #e9ecef;
//             break-inside: avoid;
//           }

//           .summary-card {
//             border: 1px solid #e9ecef;
//           }
//           .activities-list {
//             display: flex;
//             flex-direction: column;
//             gap: 12px;
//           }

//           .activity-item-detail {
//             background: #f8fafc;
//             border: 1px solid #e9ecef;
//             border-radius: 8px;
//             padding: 12px 16px;
//             transition: all 0.2s;
//           }

//           .activity-item-detail:hover {
//             border-color: #c7d2fe;
//             box-shadow: 0 2px 8px rgba(79, 70, 229, 0.06);
//           }

//           .activity-detail-header {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             margin-bottom: 6px;
//             gap: 8px;
//             flex-wrap: wrap;
//           }

//           .activity-detail-title {
//             font-weight: 600;
//             font-size: 14px;
//             color: #1a1a2e;
//           }

//           .activity-status-badge {
//             padding: 2px 12px;
//             border-radius: 12px;
//             font-size: 11px;
//             font-weight: 500;
//             white-space: nowrap;
//           }

//           .activity-detail-desc {
//             font-size: 13px;
//             color: #6b7280;
//             margin: 4px 0 8px 0;
//             line-height: 1.6;
//           }

//           .activity-detail-meta {
//             display: flex;
//             gap: 16px;
//             font-size: 12px;
//             color: #9ca3af;
//             flex-wrap: wrap;
//           }

//           .progress-mini-detail {
//             margin-top: 6px;
//             height: 4px;
//             background: #e9ecef;
//             border-radius: 2px;
//             overflow: hidden;
//           }

//           .progress-fill-mini-detail {
//             height: 100%;
//             background: linear-gradient(90deg, #4f46e5, #7c3aed);
//             border-radius: 2px;
//             transition: width 0.6s ease;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// // ========== FileItem Component ==========
// interface FileItemProps {
//   url: string;
//   label: string;
// }

// const FileItem: React.FC<FileItemProps> = ({ url, label }) => {
//   const getFileName = (url: string) => {
//     try {
//       const parts = url.split('/');
//       return parts[parts.length - 1] || 'فایل';
//     } catch {
//       return 'فایل';
//     }
//   };

//   return (
//     <div className="file-item">
//       <Paperclip size={16} className="file-icon" />
//       <span className="file-label">{label}</span>
//       <span style={{ fontSize: 12, color: '#9ca3af' }}>{getFileName(url)}</span>
//       <div className="file-actions">
//         <a href={url} target="_blank" rel="noopener noreferrer" className="file-action" title="مشاهده">
//           <Eye size={14} />
//         </a>
//         <a href={url} download className="file-action" title="دانلود">
//           <Download size={14} />
//         </a>
//       </div>
//     </div>
//   );
// };

// export default ContractDetailsPage;

