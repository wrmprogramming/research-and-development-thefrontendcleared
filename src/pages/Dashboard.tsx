// src/pages/Dashboard.tsx

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Line, Doughnut, Pie, PolarArea, Radar } from 'react-chartjs-2';
import { useResearch } from '../modules/research/hooks/useResearch';
import { useContract } from '../modules/contract/hooks/useContract';
import { usePayment } from '../modules/payment/hooks/usePayment';
import { useRfp } from '../modules/rfp/hooks/useRfp';
import { useProposal } from '../modules/proposal/hooks/useProposal';
import { useProgress } from '../modules/progress/hooks/useProgress';
import { usePerson } from '../modules/person/hooks/usePerson';
import { useCompany } from '../modules/company/hooks/useCompany';
import { useUniversity } from '../modules/university/hooks/useUniversity';
import { formatCurrency } from '../utils/formatter.utils';
import dateUtils from '../utils/dateUtils';
import {
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Activity,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  Users,
  Award,
  Building2,
  BarChart3,
  PieChart,
  Layers,
  Briefcase,
  GraduationCap,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Zap,
  Target,
  GitBranch,
  Globe,
  UserCheck,
  Wallet,
  Percent,
  Shield,
} from 'lucide-react';

// ========== ثبت کامپوننت‌های Chart.js ==========
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ========== تبدیل اعداد به فارسی ==========
const toPersianNumber = (num: any): string => {
  if (num === undefined || num === null || num === '' || isNaN(num)) return '۰';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

// ========== تبدیل تاریخ میلادی به شمسی با فرمت فارسی ==========
const toPersianDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const jalali = dateUtils.gregorianToJalali(dateStr);
    if (jalali) {
      const parts = jalali.split('/');
      if (parts.length === 3) {
        return `${toPersianNumber(parseInt(parts[0]))}/${toPersianNumber(parseInt(parts[1]))}/${toPersianNumber(parseInt(parts[2]))}`;
      }
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

// ========== رنگ‌های ثابت ==========
const COLORS = {
  primary: '#4f46e5',
  secondary: '#7c3aed',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#2563eb',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  orange: '#f97316',
  gray: '#6b7280',
  indigo: '#6366f1',
  rose: '#f43f5e',
  emerald: '#10b981',
  amber: '#f59e0b',
  cyan: '#06b6d4',
  violet: '#8b5cf6',
};

const Dashboard: React.FC = () => {
  // ========== هُک‌ها ==========
  const { useStats: useResearchStats } = useResearch();
  const { useStats: useContractStats } = useContract();
  const { useStats: usePaymentStats } = usePayment();
  const { useStats: useRfpStats } = useRfp();
  const { useStats: useProposalStats } = useProposal();
  const { useStats: useProgressStats } = useProgress();
  const { useStats: usePersonStats } = usePerson();
  const { useStats: useCompanyStats } = useCompany();
  const { useList: useUniversityList } = useUniversity();

  const { data: researchStats, isLoading: researchLoading } = useResearchStats();
  const { data: contractStats, isLoading: contractLoading } = useContractStats();
  const { data: paymentStats, isLoading: paymentLoading } = usePaymentStats();
  const { data: rfpStats, isLoading: rfpLoading } = useRfpStats();
  const { data: proposalStats, isLoading: proposalLoading } = useProposalStats();
  const { data: progressStats, isLoading: progressLoading } = useProgressStats();
  const { data: personStats } = usePersonStats();
  const { data: companyStats } = useCompanyStats();
  const { data: universities = [] } = useUniversityList({});

  const isLoading = researchLoading || contractLoading || paymentLoading || rfpLoading || proposalLoading || progressLoading;

  // ========== محاسبه شاخص‌های کلیدی ==========
  const totalResearch = researchStats?.total || 0;
  const totalContract = contractStats?.total || 0;
  const totalPayment = paymentStats?.total_payments || 0;
  const totalRfp = rfpStats?.total || 0;
  const totalProposal = proposalStats?.total || 0;

  const activeResearch = researchStats?.active || 0;
  const completedResearch = researchStats?.completed || 0;
  const activeContract = contractStats?.active || 0;
  const completedContract = contractStats?.completed || 0;

  const totalBudget = researchStats?.total_budget || 0;
  const totalContractAmount = contractStats?.total_amount || 0;
  const totalPaidAmount = paymentStats?.total_amount || 0;
  
  const remainingAmount = totalContractAmount - totalPaidAmount;

  const avgProgress = progressStats?.average_progress || 0;
  const maxProgress = progressStats?.max_progress || 0;
  const minProgress = progressStats?.min_progress || 0;

  const researchCompletionRate = totalResearch > 0 ? (completedResearch / totalResearch) * 100 : 0;
  const contractCompletionRate = totalContract > 0 ? (completedContract / totalContract) * 100 : 0;
  const financialProgressRate = totalContractAmount > 0 ? (totalPaidAmount / totalContractAmount) * 100 : 0;

  // ========== داده‌های نمودارها ==========
  //  حذف بودجه از نمودار پژوهش‌ها
  const researchByYearData = researchStats?.by_year
    ? Object.entries(researchStats.by_year)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([year, count]) => ({
          year: toPersianNumber(Number(year)),
          count: count || 0,
        }))
    : [];

  const researchStatusData = researchStats?.by_status
    ? Object.entries(researchStats.by_status).map(([status, count]) => {
        const labels: Record<string, string> = {
          DRAFT: 'پیش‌نویس',
          IN_PROGRESS: 'در حال اجرا',
          COMPLETED: 'خاتمه یافته',
        };
        return { label: labels[status] || status, value: count || 0 };
      })
    : [];

  const statsByYear = (contractStats as any)?.stats_by_year || {};
  const progressByYearData = Object.entries(statsByYear)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([year, data]: [string, any]) => ({
      year: toPersianNumber(Number(year)),
      physical: Math.round(data?.avg_physical_progress || 0),
      financial: Math.round(data?.avg_financial_progress || 0),
      count: data?.count || 0,
    }));

  const paymentTypeData = paymentStats?.by_payment_type || [];
  
  const paymentTypeChartData = paymentTypeData.map((item: any) => ({
    label: item.payment_type__name || item.payment_type__code || 'نامشخص',
    value: item.total_amount || 0,
  }));

  const monthlyPaymentData = paymentStats?.by_month
    ? Object.values(paymentStats.by_month).map((item: any) => ({
        month: item.month_name || 'نامشخص',
        count: item.count || 0,
        amount: item.total_amount || 0,
      }))
    : [];

  // ========== پیکربندی نمودارها ==========
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { family: 'Vazir, Tahoma, sans-serif', size: 12 },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        },
      },
      tooltip: {
        rtl: true,
        titleFont: { family: 'Vazir, Tahoma, sans-serif' },
        bodyFont: { family: 'Vazir, Tahoma, sans-serif' },
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            if (label.includes('مبلغ') || label.includes('بودجه') || label.includes('ریال')) {
              return `${label}: ${formatCurrency(value)}`;
            }
            return `${label}: ${toPersianNumber(value)}`;
          }
        }
      },
    },
  };

  // ========== کارت‌های KPI ==========
  const kpiCards = [
    {
      title: 'کل پژوهش‌ها',
      value: toPersianNumber(totalResearch),
      icon: FileText,
      color: COLORS.primary,
      bgColor: '#eef2ff',
      subtitle: `${toPersianNumber(activeResearch)} فعال | ${toPersianNumber(completedResearch)} تکمیل شده`,
      change: `${toPersianNumber(Math.round(researchCompletionRate))}% نرخ تکمیل`,
      trend: researchCompletionRate > 50 ? 'up' : 'down',
    },
    {
      title: 'کل قراردادها',
      value: toPersianNumber(totalContract),
      icon: FileSpreadsheet,
      color: COLORS.secondary,
      bgColor: '#ede9fe',
      subtitle: `${toPersianNumber(activeContract)} جاری | ${toPersianNumber(completedContract)} خاتمه یافته`,
      change: `${toPersianNumber(Math.round(contractCompletionRate))}% نرخ تکمیل`,
      trend: contractCompletionRate > 50 ? 'up' : 'down',
    },
    {
      title: 'مبلغ کل قراردادها',
      value: formatCurrency(totalContractAmount),
      icon: DollarSign,
      color: COLORS.warning,
      bgColor: '#fef3c7',
      subtitle: `${formatCurrency(totalPaidAmount)} پرداخت شده`,
      change: `${toPersianNumber(Math.round(financialProgressRate))}% پیشرفت مالی`,
      trend: financialProgressRate > 50 ? 'up' : 'down',
    },
    {
      title: 'مبلغ باقیمانده',
      value: formatCurrency(remainingAmount),
      icon: Wallet,
      color: COLORS.danger,
      bgColor: '#fee2e2',
      subtitle: `${toPersianNumber(totalPayment)} پرداخت انجام شده`,
      change: `${toPersianNumber(paymentStats?.verified_count || 0)} تایید شده`,
      trend: remainingAmount > 0 ? 'down' : 'up',
    },
    {
      title: 'میانگین پیشرفت فیزیکی',
      value: `${toPersianNumber(Math.round(avgProgress))}%`,
      icon: TrendingUp,
      color: COLORS.success,
      bgColor: '#d1fae5',
      subtitle: `بیشترین: ${toPersianNumber(Math.round(maxProgress))}% | کمترین: ${toPersianNumber(Math.round(minProgress))}%`,
      change: `${toPersianNumber(progressStats?.total_contracts || 0)} قرارداد`,
      trend: avgProgress > 50 ? 'up' : 'down',
    },
    {
      title: 'RFP و پروپوزال',
      value: toPersianNumber(totalRfp),
      icon: FileText,
      color: COLORS.purple,
      bgColor: '#ede9fe',
      subtitle: `${toPersianNumber((rfpStats as any)?.active || 0)} RFP فعال`,
      change: `${toPersianNumber(totalProposal)} پروپوزال | ${toPersianNumber(proposalStats?.winner_count || 0)} برنده`,
      trend: 'up',
    },
  ];

  // ========== تاریخ امروز به فارسی ==========
  const todayDate = dateUtils.getCurrentJalaliDate();
  const todayParts = todayDate.split('/');
  const persianToday = todayParts.length === 3 
    ? `${toPersianNumber(parseInt(todayParts[0]))}/${toPersianNumber(parseInt(todayParts[1]))}/${toPersianNumber(parseInt(todayParts[2]))}`
    : todayDate;

  // ========== داده‌های جداول بدون بودجه ==========
  const byResearcher = (researchStats as any)?.by_researcher || [];
  const byUniversity = (researchStats as any)?.by_university || [];

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>در حال بارگذاری اطلاعات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* ========== هدر ========== */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">📊 داشبورد مدیریت جامع</h1>
          <p className="dashboard-subtitle">خلاصه وضعیت کلی سیستم مدیریت پژوهش و قراردادها</p>
        </div>
        <div className="dashboard-header-right">
          <div className="dashboard-date">
            <Calendar size={16} />
            <span>{persianToday}</span>
          </div>
          <div className="dashboard-status">
            <span className="status-dot online"></span>
            <span>سیستم فعال</span>
          </div>
        </div>
      </div>

      {/* ========== کارت‌های KPI ========== */}
      <div className="kpi-grid">
        {kpiCards.map((card, index) => (
          <div key={index} className="kpi-card">
            <div className="kpi-card-header">
              <div className="kpi-icon" style={{ background: card.bgColor, color: card.color }}>
                <card.icon size={20} />
              </div>
              <span className={`kpi-trend ${card.trend}`}>
                {card.trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              </span>
            </div>
            <div className="kpi-card-body">
              <span className="kpi-value">{card.value}</span>
              <span className="kpi-title">{card.title}</span>
              <span className="kpi-subtitle">{card.subtitle}</span>
              <span className={`kpi-change ${card.trend === 'up' ? 'positive' : 'negative'}`}>
                {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ========== ردیف اول: نمودارهای اصلی ========== */}
      <div className="charts-row">
        {/*  نمودار پژوهش‌ها بر اساس سال (بدون بودجه) */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-title-group">
              <BarChart3 size={18} className="chart-icon" />
              <h3>پژوهش‌ها بر اساس سال</h3>
            </div>
            <span className="chart-badge">{toPersianNumber(researchByYearData.length)} سال</span>
          </div>
          <div className="chart-wrapper">
            <Bar
              data={{
                labels: researchByYearData.map(d => d.year),
                datasets: [
                  {
                    label: 'تعداد پژوهش',
                    data: researchByYearData.map(d => d.count),
                    backgroundColor: 'rgba(79, 70, 229, 0.7)',
                    borderColor: '#4f46e5',
                    borderWidth: 2,
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                      callback: function(value: any) {
                        return toPersianNumber(value);
                      }
                    }
                  },
                  x: {
                    grid: { display: false },
                    ticks: {
                      font: { family: 'Vazir, Tahoma, sans-serif' }
                    }
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-title-group">
              <PieChart size={18} className="chart-icon" />
              <h3>وضعیت پژوهش‌ها</h3>
            </div>
            <span className="chart-badge">{toPersianNumber(researchStatusData.length)} وضعیت</span>
          </div>
          <div className="chart-wrapper">
            <Doughnut
              data={{
                labels: researchStatusData.map(d => d.label),
                datasets: [
                  {
                    data: researchStatusData.map(d => d.value),
                    backgroundColor: [
                      'rgba(107, 114, 128, 0.8)',
                      'rgba(37, 99, 235, 0.8)',
                      'rgba(5, 150, 105, 0.8)',
                    ],
                    borderColor: ['#6b7280', '#2563eb', '#059669'],
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                ...chartOptions,
                cutout: '65%',
                plugins: {
                  ...chartOptions.plugins,
                  legend: { ...chartOptions.plugins.legend, position: 'bottom' },
                  tooltip: {
                    ...chartOptions.plugins.tooltip,
                    callbacks: {
                      label: function(context: any) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return `${label}: ${toPersianNumber(value)} (${toPersianNumber(percentage)}%)`;
                      }
                    }
                  }
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* ========== ردیف دوم: نمودارهای پیشرفت ========== */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-title-group">
              <Target size={18} className="chart-icon" />
              <h3>میانگین پیشرفت بر اساس سال</h3>
            </div>
            <span className="chart-badge">{toPersianNumber(progressByYearData.length)} سال</span>
          </div>
          <div className="chart-wrapper">
            <Bar
              data={{
                labels: progressByYearData.map(d => d.year),
                datasets: [
                  {
                    label: 'پیشرفت فیزیکی (%)',
                    data: progressByYearData.map(d => d.physical),
                    backgroundColor: 'rgba(79, 70, 229, 0.7)',
                    borderColor: '#4f46e5',
                    borderWidth: 2,
                    borderRadius: 6,
                  },
                  {
                    label: 'پیشرفت مالی (%)',
                    data: progressByYearData.map(d => d.financial),
                    backgroundColor: 'rgba(5, 150, 105, 0.7)',
                    borderColor: '#059669',
                    borderWidth: 2,
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                      callback: function(value: any) {
                        return toPersianNumber(value);
                      }
                    }
                  },
                  x: {
                    grid: { display: false },
                    ticks: {
                      font: { family: 'Vazir, Tahoma, sans-serif' }
                    }
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-title-group">
              <TrendingUp size={18} className="chart-icon" />
              <h3>روند پرداخت‌های ماهانه</h3>
            </div>
            <span className="chart-badge">{toPersianNumber(monthlyPaymentData.length)} ماه</span>
          </div>
          <div className="chart-wrapper">
            <Line
              data={{
                labels: monthlyPaymentData.map(d => d.month),
                datasets: [
                  {
                    label: 'تعداد پرداخت',
                    data: monthlyPaymentData.map(d => d.count),
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4f46e5',
                    pointBorderColor: '#4f46e5',
                    pointRadius: 4,
                  },
                  {
                    label: 'مبلغ (میلیون ریال)',
                    data: monthlyPaymentData.map(d => Math.round(d.amount / 1000000)),
                    borderColor: '#d97706',
                    backgroundColor: 'rgba(217, 119, 6, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#d97706',
                    pointBorderColor: '#d97706',
                    pointRadius: 4,
                  },
                ],
              }}
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                      callback: function(value: any) {
                        return toPersianNumber(value);
                      }
                    }
                  },
                  x: {
                    grid: { display: false },
                    ticks: {
                      font: { family: 'Vazir, Tahoma, sans-serif' }
                    }
                  },
                },
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    ...chartOptions.plugins.tooltip,
                    callbacks: {
                      label: function(context: any) {
                        const label = context.dataset.label || '';
                        const value = context.raw || 0;
                        if (label.includes('مبلغ')) {
                          return `${label}: ${formatCurrency(value * 1000000)}`;
                        }
                        return `${label}: ${toPersianNumber(value)}`;
                      }
                    }
                  }
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* ========== ردیف سوم: نمودارهای تحلیلی ========== */}
      <div className="charts-row">
        {/*  اصلاح: نمودار رادار با اعداد مناسب */}
        {/* ========== نمودار رادار - عملکرد کلی سیستم با دو مقیاس مختلف ========== */}
{/* ========== نمودار رادار - عملکرد کلی سیستم ========== */}
<div className="chart-card">
  <div className="chart-card-header">
    <div className="chart-title-group">
      <Activity size={18} className="chart-icon" />
      <h3>عملکرد کلی سیستم</h3>
    </div>
    <span className="chart-badge">۵ شاخص</span>
  </div>
  <div className="chart-wrapper">
    <Radar
      data={{
        labels: ['پژوهش', 'قرارداد', 'پرداخت', 'پیشرفت', 'RFP'],
        datasets: [
          {
            label: 'عملکرد فعلی',
            data: [
              //  پژوهش: نرمالایز شده به 0-100 (حداکثر 10 پژوهش = 100%)
              Math.min((totalResearch / 10) * 100, 100),
              //  قرارداد: نرمالایز شده به 0-100 (حداکثر 10 قرارداد = 100%)
              Math.min((totalContract / 10) * 100, 100),
              //  پرداخت: درصد پیشرفت مالی (0-100)
              Math.min((totalPaidAmount / (totalContractAmount || 1)) * 100, 100),
              //  پیشرفت: درصد پیشرفت فیزیکی (0-100)
              Math.min(avgProgress, 100),
              //  RFP: نرمالایز شده به 0-100 (حداکثر 5 RFP = 100%)
              Math.min((totalRfp / 10) * 100, 100),
            ],
            backgroundColor: 'rgba(79, 70, 229, 0.2)',
            borderColor: '#4f46e5',
            pointBackgroundColor: '#4f46e5',
            borderWidth: 2,
          },
          {
            label: 'هدف',
            data: [
              100,  //  هدف پژوهش: 20% (معادل 2 پژوهش از 10)
              100,  //  هدف قرارداد: 20% (معادل 2 قرارداد از 10)
              100, //  هدف پرداخت: 100%
              100, //  هدف پیشرفت: 100%
              100,  //  هدف RFP: 20% (معادل 1 RFP از 5)
            ],
            backgroundColor: 'rgba(5, 150, 105, 0.1)',
            borderColor: '#059669',
            pointBackgroundColor: '#059669',
            borderWidth: 2,
            borderDash: [5, 5],
          },
        ],
      }}
      options={{
        ...chartOptions,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { 
              stepSize: 10,
              callback: function(value: any) {
                return toPersianNumber(value);
              }
            },
            grid: { color: 'rgba(0,0,0,0.05)' },
            pointLabels: {
              font: { family: 'Vazir, Tahoma, sans-serif' }
            }
          },
        },
        plugins: {
          ...chartOptions.plugins,
          tooltip: {
            ...chartOptions.plugins.tooltip,
            callbacks: {
              label: function(context: any) {
                const label = context.dataset.label || '';
                const value = Math.round(context.raw || 0);
                const dataIndex = context.dataIndex;
                const labels = ['پژوهش', 'قرارداد', 'پرداخت', 'پیشرفت', 'RFP'];
                
                // برای شاخص‌های تعدادی، مقدار واقعی رو محاسبه کن
                let displayValue = value;
                let extraInfo = '';
                
                if (dataIndex === 0) { // پژوهش
                  const actualCount = Math.round((value / 100) * 10);
                  extraInfo = ` (${toPersianNumber(actualCount)} پژوهش)`;
                } else if (dataIndex === 1) { // قرارداد
                  const actualCount = Math.round((value / 100) * 10);
                  extraInfo = ` (${toPersianNumber(actualCount)} قرارداد)`;
                } else if (dataIndex === 4) { // RFP
                  const actualCount = Math.round((value / 100) * 10);
                  extraInfo = ` (${toPersianNumber(actualCount)} RFP)`;
                } else if (dataIndex === 2) { // پرداخت
                  extraInfo = ` (${toPersianNumber(value)}% پیشرفت مالی)`;
                } else if (dataIndex === 3) { // پیشرفت
                  extraInfo = ` (${toPersianNumber(value)}% پیشرفت فیزیکی)`;
                }
                
                return `${label}: ${toPersianNumber(value)}%${extraInfo}`;
              }
            }
          }
        },
      }}
    />
  </div>
</div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-title-group">
              <CreditCard size={18} className="chart-icon" />
              <h3>توزیع پرداخت‌ها بر اساس نوع</h3>
            </div>
            <span className="chart-badge">{toPersianNumber(paymentTypeChartData.length)} نوع</span>
          </div>
          <div className="chart-wrapper">
            {paymentTypeChartData.length > 0 ? (
              <Pie
                data={{
                  labels: paymentTypeChartData.map(d => d.label),
                  datasets: [
                    {
                      data: paymentTypeChartData.map(d => d.value),
                      backgroundColor: [
                        'rgba(79, 70, 229, 0.8)',
                        'rgba(5, 150, 105, 0.8)',
                        'rgba(217, 119, 6, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(20, 184, 166, 0.8)',
                      ],
                      borderColor: ['#4f46e5', '#059669', '#d97706', '#ec4899', '#8b5cf6', '#14b8a6'],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: { ...chartOptions.plugins.legend, position: 'bottom' },
                    tooltip: {
                      ...chartOptions.plugins.tooltip,
                      callbacks: {
                        label: function(context: any) {
                          const label = context.label || 'نامشخص';
                          const value = context.raw || 0;
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                          return `${label}: ${formatCurrency(value)} (${toPersianNumber(percentage)}%)`;
                        }
                      }
                    }
                  },
                }}
              />
            ) : (
              <div className="empty-chart">
                <p>هیچ داده‌ای برای نمایش وجود ندارد</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== ردیف چهارم: جداول تحلیلی ========== */}
      <div className="tables-row">
        {/*  پژوهشگران فعال (بدون بودجه) */}
        <div className="table-card">
          <div className="table-card-header">
            <div className="table-title-group">
              <Award size={18} className="table-icon" />
              <h3>پژوهشگران فعال</h3>
            </div>
            <span className="table-badge">بر اساس تعداد پژوهش</span>
          </div>
          <div className="table-scroll">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>پژوهشگر</th>
                  <th>تعداد پژوهش</th>
                </tr>
              </thead>
              <tbody>
                {byResearcher.slice(0, 10).map((item: any, index: number) => (
                  <tr key={index}>
                    <td>
                      <div className="rank-cell">
                        <span className={`rank-badge rank-${index + 1}`}>{toPersianNumber(index + 1)}</span>
                        {item.researcher_name || 'نامشخص'}
                      </div>
                    </td>
                    <td>{toPersianNumber(item.count || 0)}</td>
                  </tr>
                ))}
                {byResearcher.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center">هیچ داده‌ای وجود ندارد</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/*  دانشگاه‌های فعال (بدون بودجه) */}
        <div className="table-card">
          <div className="table-card-header">
            <div className="table-title-group">
              <GraduationCap size={18} className="table-icon" />
              <h3>دانشگاه‌های فعال</h3>
            </div>
            <span className="table-badge">بر اساس تعداد پژوهش</span>
          </div>
          <div className="table-scroll">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>دانشگاه</th>
                  <th>تعداد پژوهش</th>
                </tr>
              </thead>
              <tbody>
                {byUniversity.slice(0, 10).map((item: any, index: number) => (
                  <tr key={index}>
                    <td>
                      <div className="rank-cell">
                        <span className={`rank-badge rank-${index + 1}`}>{toPersianNumber(index + 1)}</span>
                        {item.university_name || 'نامشخص'}
                      </div>
                    </td>
                    <td>{toPersianNumber(item.count || 0)}</td>
                  </tr>
                ))}
                {byUniversity.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center">هیچ داده‌ای وجود ندارد</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========== ردیف پنجم: اطلاعات تکمیلی ========== */}
      <div className="info-row">
        <div className="info-card">
          <div className="info-card-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Users size={20} />
          </div>
          <div className="info-card-content">
            <span className="info-card-value">{toPersianNumber(personStats?.total || 0)}</span>
            <span className="info-card-title">کل پژوهشگران</span>
            <span className="info-card-sub">{toPersianNumber(personStats?.total || 0)} پژوهشگر</span>
          </div>
        </div>
        <div className="info-card">
          <div className="info-card-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <Building2 size={20} />
          </div>
          <div className="info-card-content">
            <span className="info-card-value">{toPersianNumber(companyStats?.total || 0)}</span>
            <span className="info-card-title">کل شرکت‌ها</span>
            <span className="info-card-sub">{toPersianNumber(companyStats?.with_contract || 0)} دارای قرارداد</span>
          </div>
        </div>
        <div className="info-card">
          <div className="info-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Globe size={20} />
          </div>
          <div className="info-card-content">
            <span className="info-card-value">{toPersianNumber(universities.length || 0)}</span>
            <span className="info-card-title">کل دانشگاه‌ها</span>
            <span className="info-card-sub">{toPersianNumber(byUniversity.length || 0)} دارای پژوهش</span>
          </div>
        </div>
        <div className="info-card">
          <div className="info-card-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <AlertCircle size={20} />
          </div>
          <div className="info-card-content">
            <span className="info-card-value">{toPersianNumber(contractStats?.terminated || 0)}</span>
            <span className="info-card-title">قراردادهای فسخ شده</span>
            <span className="info-card-sub">{toPersianNumber(contractStats?.draft || 0)} پیش‌نویس</span>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          padding: 24px;
          min-height: 100vh;
          background-color: transparent;

        }

        .dashboard-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          background: #f8fafc;
        }
        .spinner-container {
          text-align: center;
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e9ecef;
          border-top-color: #4f46e5;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner-container p {
          color: #6b7280;
          font-size: 16px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .dashboard-title {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 4px 0;
        }

        .dashboard-subtitle {
          font-size: 15px;
          color: #6b7280;
          margin: 0;
        }

        .dashboard-header-right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .dashboard-date {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          font-size: 14px;
          color: #374151;
        }

        .dashboard-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          font-size: 13px;
          color: #374151;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-dot.online {
          background: #059669;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .kpi-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          padding: 18px 20px;
          transition: all 0.2s ease;
        }

        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .kpi-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .kpi-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .kpi-trend {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          font-size: 12px;
        }

        .kpi-trend.up {
          background: #d1fae5;
          color: #059669;
        }

        .kpi-trend.down {
          background: #fee2e2;
          color: #dc2626;
        }

        .kpi-card-body {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .kpi-value {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
        }

        .kpi-title {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .kpi-subtitle {
          font-size: 12px;
          color: #6b7280;
        }

        .kpi-change {
          font-size: 12px;
          font-weight: 500;
          margin-top: 4px;
          padding: 2px 10px;
          border-radius: 12px;
          display: inline-block;
          width: fit-content;
        }

        .kpi-change.positive {
          background: #d1fae5;
          color: #059669;
        }

        .kpi-change.negative {
          background: #fee2e2;
          color: #dc2626;
        }

        .charts-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .chart-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          padding: 20px;
          transition: all 0.2s ease;
        }

        .chart-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .chart-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .chart-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chart-icon {
          color: #4f46e5;
        }

        .chart-card-header h3 {
          font-size: 15px;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0;
        }

        .chart-badge {
          font-size: 11px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .chart-wrapper {
          width: 100%;
          height: 280px;
          position: relative;
        }

        .empty-chart {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #9ca3af;
          font-size: 14px;
        }

        .tables-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .table-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          padding: 20px;
          transition: all 0.2s ease;
        }

        .table-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .table-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .table-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .table-icon {
          color: #4f46e5;
        }

        .table-card-header h3 {
          font-size: 15px;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0;
        }

        .table-badge {
          font-size: 11px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .table-scroll {
          max-height: 280px;
          overflow-y: auto;
        }

        .table-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .table-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .table-scroll::-webkit-scrollbar-thumb {
          background: #c1c7cd;
          border-radius: 4px;
        }

        .dashboard-table {
          width: 100%;
          border-collapse: collapse;
        }

        .dashboard-table thead th {
          padding: 10px 12px;
          text-align: right;
          font-weight: 600;
          font-size: 12px;
          color: #6b7280;
          border-bottom: 2px solid #e9ecef;
          background: #f8fafc;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .dashboard-table tbody td {
          padding: 10px 12px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 13px;
          color: #374151;
        }

        .dashboard-table tbody tr:hover {
          background: #f8fafc;
        }

        .dashboard-table .text-center {
          text-align: center;
          color: #9ca3af;
          padding: 20px;
        }

        .rank-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rank-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          font-size: 11px;
          font-weight: 700;
          color: white;
        }

        .rank-badge.rank-1 { background: #d97706; }
        .rank-badge.rank-2 { background: #6b7280; }
        .rank-badge.rank-3 { background: #92400e; }
        .rank-badge.rank-4,
        .rank-badge.rank-5,
        .rank-badge.rank-6,
        .rank-badge.rank-7,
        .rank-badge.rank-8,
        .rank-badge.rank-9,
        .rank-badge.rank-10 { background: #4f46e5; }

        .info-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .info-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          transition: all 0.2s ease;
        }

        .info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .info-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .info-card-content {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .info-card-value {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1.2;
        }

        .info-card-title {
          font-size: 13px;
          color: #374151;
        }

        .info-card-sub {
          font-size: 12px;
          color: #6b7280;
        }

        @media (max-width: 1200px) {
          .kpi-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          }
        }

        @media (max-width: 992px) {
          .charts-row {
            grid-template-columns: 1fr;
          }
          .tables-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 16px;
          }

          .dashboard-title {
            font-size: 22px;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
          }

          .kpi-grid {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .kpi-card {
            padding: 14px 16px;
          }

          .kpi-value {
            font-size: 20px;
          }

          .chart-card {
            padding: 16px;
          }

          .chart-wrapper {
            height: 220px;
          }

          .table-card {
            padding: 16px;
          }

          .info-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .dashboard-container {
            padding: 12px;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .info-row {
            grid-template-columns: 1fr;
          }

          .chart-wrapper {
            height: 200px;
          }

          .dashboard-table {
            font-size: 12px;
          }

          .dashboard-table thead th,
          .dashboard-table tbody td {
            padding: 8px 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

// //5
// // src/pages/Dashboard.tsx

// import React, { useEffect, useState } from 'react';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler,
//   RadialLinearScale,
// } from 'chart.js';
// import { Bar, Line, Doughnut, Pie, PolarArea, Radar } from 'react-chartjs-2';
// import { useResearch } from '../modules/research/hooks/useResearch';
// import { useContract } from '../modules/contract/hooks/useContract';
// import { usePayment } from '../modules/payment/hooks/usePayment';
// import { useRfp } from '../modules/rfp/hooks/useRfp';
// import { useProposal } from '../modules/proposal/hooks/useProposal';
// import { useProgress } from '../modules/progress/hooks/useProgress';
// import { usePerson } from '../modules/person/hooks/usePerson';
// import { useCompany } from '../modules/company/hooks/useCompany';
// import { useUniversity } from '../modules/university/hooks/useUniversity';
// import { formatCurrency } from '../utils/formatter.utils';
// import dateUtils from '../utils/dateUtils';
// import {
//   FileText,
//   CheckCircle,
//   Clock,
//   DollarSign,
//   TrendingUp,
//   Activity,
//   Calendar,
//   CreditCard,
//   FileSpreadsheet,
//   Users,
//   Award,
//   Building2,
//   BarChart3,
//   PieChart,
//   Layers,
//   Briefcase,
//   GraduationCap,
//   AlertCircle,
//   ArrowUp,
//   ArrowDown,
//   Zap,
//   Target,
//   GitBranch,
//   Globe,
//   UserCheck,
//   Wallet,
//   Percent,
//   Shield,
// } from 'lucide-react';

// // ========== ثبت کامپوننت‌های Chart.js ==========
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   RadialLinearScale,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// );

// // ========== تبدیل اعداد به فارسی ==========
// const toPersianNumber = (num: number): string => {
//   if (num === undefined || num === null) return '۰';
//   const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
//   return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
// };

// // ========== رنگ‌های ثابت ==========
// const COLORS = {
//   primary: '#4f46e5',
//   secondary: '#7c3aed',
//   success: '#059669',
//   warning: '#d97706',
//   danger: '#dc2626',
//   info: '#2563eb',
//   purple: '#8b5cf6',
//   pink: '#ec4899',
//   teal: '#14b8a6',
//   orange: '#f97316',
//   gray: '#6b7280',
//   indigo: '#6366f1',
//   rose: '#f43f5e',
//   emerald: '#10b981',
//   amber: '#f59e0b',
//   cyan: '#06b6d4',
//   violet: '#8b5cf6',
// };

// const CHART_COLORS = [
//   COLORS.primary,
//   COLORS.secondary,
//   COLORS.success,
//   COLORS.warning,
//   COLORS.danger,
//   COLORS.info,
//   COLORS.purple,
//   COLORS.pink,
//   COLORS.teal,
//   COLORS.orange,
// ];

// const Dashboard: React.FC = () => {
//   // ========== هُک‌ها ==========
//   const { useStats: useResearchStats } = useResearch();
//   const { useStats: useContractStats } = useContract();
//   const { useStats: usePaymentStats } = usePayment();
//   const { useStats: useRfpStats } = useRfp();
//   const { useStats: useProposalStats } = useProposal();
//   const { useStats: useProgressStats } = useProgress();
//   const { useStats: usePersonStats } = usePerson();
//   const { useStats: useCompanyStats } = useCompany();
//   const { useList: useUniversityList } = useUniversity();

//   const { data: researchStats, isLoading: researchLoading } = useResearchStats();
//   const { data: contractStats, isLoading: contractLoading } = useContractStats();
//   const { data: paymentStats, isLoading: paymentLoading } = usePaymentStats();
//   const { data: rfpStats, isLoading: rfpLoading } = useRfpStats();
//   const { data: proposalStats, isLoading: proposalLoading } = useProposalStats();
//   const { data: progressStats, isLoading: progressLoading } = useProgressStats();
//   const { data: personStats } = usePersonStats();
//   const { data: companyStats } = useCompanyStats();
//   const { data: universities = [] } = useUniversityList({});

//   const isLoading = researchLoading || contractLoading || paymentLoading || rfpLoading || proposalLoading || progressLoading;

//   // ========== محاسبه شاخص‌های کلیدی ==========
//   const totalResearch = researchStats?.total || 0;
//   const totalContract = contractStats?.total || 0;
//   const totalPayment = paymentStats?.total_payments || 0;
//   const totalRfp = rfpStats?.total || 0;
//   const totalProposal = proposalStats?.total || 0;

//   const activeResearch = researchStats?.active || 0;
//   const completedResearch = researchStats?.completed || 0;
//   const activeContract = contractStats?.active || 0;
//   const completedContract = contractStats?.completed || 0;

//   const totalBudget = researchStats?.total_budget || 0;
//   const totalContractAmount = contractStats?.total_amount || 0;
//   const totalPaidAmount = paymentStats?.total_amount || 0;
//   const remainingAmount = contractStats?.remaining_amount || 0;

//   const avgProgress = progressStats?.average_progress || 0;
//   const maxProgress = progressStats?.max_progress || 0;
//   const minProgress = progressStats?.min_progress || 0;

//   const researchCompletionRate = totalResearch > 0 ? (completedResearch / totalResearch) * 100 : 0;
//   const contractCompletionRate = totalContract > 0 ? (completedContract / totalContract) * 100 : 0;
//   const financialProgressRate = totalContractAmount > 0 ? (totalPaidAmount / totalContractAmount) * 100 : 0;

//   // ========== داده‌های نمودارها ==========
//   const researchByYearData = researchStats?.by_year
//     ? Object.entries(researchStats.by_year)
//         .sort((a, b) => Number(a[0]) - Number(b[0]))
//         .map(([year, count]) => ({
//           year: toPersianNumber(Number(year)),
//           count: count,
//           budget: researchStats.budget_by_year?.[Number(year)] || 0,
//         }))
//     : [];

//   const contractByYearData = contractStats?.by_year
//     ? Object.entries(contractStats.by_year)
//         .sort((a, b) => Number(a[0]) - Number(b[0]))
//         .map(([year, count]) => ({
//           year: toPersianNumber(Number(year)),
//           count: count,
//           amount: contractStats.amount_by_year?.[Number(year)] || 0,
//         }))
//     : [];

//   const researchStatusData = researchStats?.by_status
//     ? Object.entries(researchStats.by_status).map(([status, count]) => {
//         const labels: Record<string, string> = {
//           DRAFT: 'پیش‌نویس',
//           IN_PROGRESS: 'در حال اجرا',
//           COMPLETED: 'خاتمه یافته',
//         };
//         return { label: labels[status] || status, value: count };
//       })
//     : [];

//   const contractStatusData = contractStats?.by_status
//     ? Object.entries(contractStats.by_status).map(([status, count]) => {
//         const labels: Record<string, string> = {
//           DRAFT: 'پیش‌نویس',
//           IN_PROGRESS: 'جاری',
//           COMPLETED: 'خاتمه یافته',
//           TERMINATED: 'فسخ شده',
//         };
//         return { label: labels[status] || status, value: count };
//       })
//     : [];

//   const progressByYearData = contractStats?.stats_by_year
//     ? Object.entries(contractStats.stats_by_year)
//         .sort((a, b) => Number(a[0]) - Number(b[0]))
//         .map(([year, data]) => ({
//           year: toPersianNumber(Number(year)),
//           physical: Math.round(data.avg_physical_progress),
//           financial: Math.round(data.avg_financial_progress),
//           count: data.count,
//         }))
//     : [];

//   const paymentTypeData = paymentStats?.by_payment_type || [];

//   const monthlyPaymentData = paymentStats?.by_month
//     ? Object.values(paymentStats.by_month).map(item => ({
//         month: item.month_name,
//         count: item.count,
//         amount: item.total_amount,
//       }))
//     : [];

//   // ========== پیکربندی نمودارها ==========
//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'bottom' as const,
//         labels: {
//           font: { family: 'Vazir, Tahoma, sans-serif', size: 12 },
//           usePointStyle: true,
//           pointStyle: 'circle',
//           padding: 20,
//         },
//       },
//       tooltip: {
//         rtl: true,
//         titleFont: { family: 'Vazir, Tahoma, sans-serif' },
//         bodyFont: { family: 'Vazir, Tahoma, sans-serif' },
//         callbacks: {
//           label: function(context: any) {
//             if (context.dataset.label?.includes('مبلغ') || context.dataset.label?.includes('بودجه')) {
//               return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
//             }
//             return `${context.dataset.label}: ${context.raw}`;
//           }
//         }
//       },
//     },
//   };

//   // ========== کارت‌های KPI ==========
//   const kpiCards = [
//     {
//       title: 'کل پژوهش‌ها',
//       value: totalResearch,
//       icon: FileText,
//       color: COLORS.primary,
//       bgColor: '#eef2ff',
//       subtitle: `${activeResearch} فعال | ${completedResearch} تکمیل شده`,
//       change: `${researchCompletionRate.toFixed(1)}% نرخ تکمیل`,
//       trend: researchCompletionRate > 50 ? 'up' : 'down',
//     },
//     {
//       title: 'کل قراردادها',
//       value: totalContract,
//       icon: FileSpreadsheet,
//       color: COLORS.secondary,
//       bgColor: '#ede9fe',
//       subtitle: `${activeContract} جاری | ${completedContract} خاتمه یافته`,
//       change: `${contractCompletionRate.toFixed(1)}% نرخ تکمیل`,
//       trend: contractCompletionRate > 50 ? 'up' : 'down',
//     },
//     {
//       title: 'مبلغ کل قراردادها',
//       value: formatCurrency(totalContractAmount),
//       icon: DollarSign,
//       color: COLORS.warning,
//       bgColor: '#fef3c7',
//       subtitle: `${formatCurrency(totalPaidAmount)} پرداخت شده`,
//       change: `${financialProgressRate.toFixed(1)}% پیشرفت مالی`,
//       trend: financialProgressRate > 50 ? 'up' : 'down',
//     },
//     {
//       title: 'مبلغ باقیمانده',
//       value: formatCurrency(remainingAmount),
//       icon: Wallet,
//       color: COLORS.danger,
//       bgColor: '#fee2e2',
//       subtitle: `${totalPayment} پرداخت انجام شده`,
//       change: `${paymentStats?.verified_count || 0} تایید شده`,
//       trend: remainingAmount > 0 ? 'down' : 'up',
//     },
//     {
//       title: 'میانگین پیشرفت فیزیکی',
//       value: `${avgProgress.toFixed(1)}%`,
//       icon: TrendingUp,
//       color: COLORS.success,
//       bgColor: '#d1fae5',
//       subtitle: `بیشترین: ${maxProgress.toFixed(1)}% | کمترین: ${minProgress.toFixed(1)}%`,
//       change: `${progressStats?.total_contracts || 0} قرارداد`,
//       trend: avgProgress > 50 ? 'up' : 'down',
//     },
//     {
//       title: 'RFP و پروپوزال',
//       value: totalRfp,
//       icon: FileText,
//       color: COLORS.purple,
//       bgColor: '#ede9fe',
//       subtitle: `${rfpStats?.active || 0} RFP فعال`,
//       change: `${totalProposal} پروپوزال | ${proposalStats?.winner_count || 0} برنده`,
//       trend: 'up',
//     },
//   ];

//   if (isLoading) {
//     return (
//       <div className="dashboard-loading">
//         <div className="spinner-container">
//           <div className="spinner"></div>
//           <p>در حال بارگذاری اطلاعات...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard-container">
//       {/* ========== هدر ========== */}
//       <div className="dashboard-header">
//         <div>
//           <h1 className="dashboard-title">📊 داشبورد مدیریت جامع</h1>
//           <p className="dashboard-subtitle">خلاصه وضعیت کلی سیستم مدیریت پژوهش و قراردادها</p>
//         </div>
//         <div className="dashboard-header-right">
//           <div className="dashboard-date">
//             <Calendar size={16} />
//             <span>{dateUtils.getCurrentJalaliDate()}</span>
//           </div>
//           <div className="dashboard-status">
//             <span className="status-dot online"></span>
//             <span>سیستم فعال</span>
//           </div>
//         </div>
//       </div>

//       {/* ========== کارت‌های KPI ========== */}
//       <div className="kpi-grid">
//         {kpiCards.map((card, index) => (
//           <div key={index} className="kpi-card">
//             <div className="kpi-card-header">
//               <div className="kpi-icon" style={{ background: card.bgColor, color: card.color }}>
//                 <card.icon size={20} />
//               </div>
//               <span className={`kpi-trend ${card.trend}`}>
//                 {card.trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
//               </span>
//             </div>
//             <div className="kpi-card-body">
//               <span className="kpi-value">{card.value}</span>
//               <span className="kpi-title">{card.title}</span>
//               <span className="kpi-subtitle">{card.subtitle}</span>
//               <span className={`kpi-change ${card.trend === 'up' ? 'positive' : 'negative'}`}>
//                 {card.change}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ========== ردیف اول: نمودارهای اصلی ========== */}
//       <div className="charts-row">
//         {/* نمودار پژوهش‌ها بر اساس سال */}
//         <div className="chart-card">
//           <div className="chart-card-header">
//             <div className="chart-title-group">
//               <BarChart3 size={18} className="chart-icon" />
//               <h3>پژوهش‌ها بر اساس سال</h3>
//             </div>
//             <span className="chart-badge">{researchByYearData.length} سال</span>
//           </div>
//           <div className="chart-wrapper">
//             <Bar
//               data={{
//                 labels: researchByYearData.map(d => d.year),
//                 datasets: [
//                   {
//                     label: 'تعداد پژوهش',
//                     data: researchByYearData.map(d => d.count),
//                     backgroundColor: 'rgba(79, 70, 229, 0.7)',
//                     borderColor: '#4f46e5',
//                     borderWidth: 2,
//                     borderRadius: 6,
//                   },
//                   {
//                     label: 'بودجه (میلیون ریال)',
//                     data: researchByYearData.map(d => Math.round(d.budget / 1000000)),
//                     backgroundColor: 'rgba(217, 119, 6, 0.7)',
//                     borderColor: '#d97706',
//                     borderWidth: 2,
//                     borderRadius: 6,
//                   },
//                 ],
//               }}
//               options={{
//                 ...chartOptions,
//                 scales: {
//                   y: {
//                     beginAtZero: true,
//                     grid: { color: 'rgba(0,0,0,0.05)' },
//                   },
//                   x: {
//                     grid: { display: false },
//                   },
//                 },
//               }}
//             />
//           </div>
//         </div>

//         {/* نمودار وضعیت پژوهش‌ها */}
//         <div className="chart-card">
//           <div className="chart-card-header">
//             <div className="chart-title-group">
//               <PieChart size={18} className="chart-icon" />
//               <h3>وضعیت پژوهش‌ها</h3>
//             </div>
//             <span className="chart-badge">{researchStatusData.length} وضعیت</span>
//           </div>
//           <div className="chart-wrapper">
//             <Doughnut
//               data={{
//                 labels: researchStatusData.map(d => d.label),
//                 datasets: [
//                   {
//                     data: researchStatusData.map(d => d.value),
//                     backgroundColor: [
//                       'rgba(107, 114, 128, 0.8)',
//                       'rgba(37, 99, 235, 0.8)',
//                       'rgba(5, 150, 105, 0.8)',
//                     ],
//                     borderColor: ['#6b7280', '#2563eb', '#059669'],
//                     borderWidth: 2,
//                   },
//                 ],
//               }}
//               options={{
//                 ...chartOptions,
//                 cutout: '65%',
//                 plugins: {
//                   ...chartOptions.plugins,
//                   legend: { ...chartOptions.plugins.legend, position: 'bottom' },
//                 },
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* ========== ردیف دوم: نمودارهای پیشرفت ========== */}
//       <div className="charts-row">
//         {/* نمودار پیشرفت مالی و فیزیکی */}
//         <div className="chart-card">
//           <div className="chart-card-header">
//             <div className="chart-title-group">
//               <Target size={18} className="chart-icon" />
//               <h3>میانگین پیشرفت بر اساس سال</h3>
//             </div>
//             <span className="chart-badge">{progressByYearData.length} سال</span>
//           </div>
//           <div className="chart-wrapper">
//             <Bar
//               data={{
//                 labels: progressByYearData.map(d => d.year),
//                 datasets: [
//                   {
//                     label: 'پیشرفت فیزیکی (%)',
//                     data: progressByYearData.map(d => d.physical),
//                     backgroundColor: 'rgba(79, 70, 229, 0.7)',
//                     borderColor: '#4f46e5',
//                     borderWidth: 2,
//                     borderRadius: 6,
//                   },
//                   {
//                     label: 'پیشرفت مالی (%)',
//                     data: progressByYearData.map(d => d.financial),
//                     backgroundColor: 'rgba(5, 150, 105, 0.7)',
//                     borderColor: '#059669',
//                     borderWidth: 2,
//                     borderRadius: 6,
//                   },
//                 ],
//               }}
//               options={{
//                 ...chartOptions,
//                 scales: {
//                   y: {
//                     beginAtZero: true,
//                     max: 100,
//                     grid: { color: 'rgba(0,0,0,0.05)' },
//                   },
//                   x: {
//                     grid: { display: false },
//                   },
//                 },
//               }}
//             />
//           </div>
//         </div>

//         {/* نمودار پرداخت‌های ماهانه */}
//         <div className="chart-card">
//           <div className="chart-card-header">
//             <div className="chart-title-group">
//               <TrendingUp size={18} className="chart-icon" />
//               <h3>روند پرداخت‌های ماهانه</h3>
//             </div>
//             <span className="chart-badge">{monthlyPaymentData.length} ماه</span>
//           </div>
//           <div className="chart-wrapper">
//             <Line
//               data={{
//                 labels: monthlyPaymentData.map(d => d.month),
//                 datasets: [
//                   {
//                     label: 'تعداد پرداخت',
//                     data: monthlyPaymentData.map(d => d.count),
//                     borderColor: '#4f46e5',
//                     backgroundColor: 'rgba(79, 70, 229, 0.1)',
//                     fill: true,
//                     tension: 0.4,
//                     pointBackgroundColor: '#4f46e5',
//                   },
//                   {
//                     label: 'مبلغ (میلیون ریال)',
//                     data: monthlyPaymentData.map(d => Math.round(d.amount / 1000000)),
//                     borderColor: '#d97706',
//                     backgroundColor: 'rgba(217, 119, 6, 0.1)',
//                     fill: true,
//                     tension: 0.4,
//                     pointBackgroundColor: '#d97706',
//                   },
//                 ],
//               }}
//               options={{
//                 ...chartOptions,
//                 scales: {
//                   y: {
//                     beginAtZero: true,
//                     grid: { color: 'rgba(0,0,0,0.05)' },
//                   },
//                   x: {
//                     grid: { display: false },
//                   },
//                 },
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* ========== ردیف سوم: نمودارهای تحلیلی ========== */}
//       <div className="charts-row">
//         {/* نمودار رادار - عملکرد کلی */}
//         <div className="chart-card">
//           <div className="chart-card-header">
//             <div className="chart-title-group">
//               <Activity size={18} className="chart-icon" />
//               <h3>عملکرد کلی سیستم</h3>
//             </div>
//             <span className="chart-badge">5 شاخص</span>
//           </div>
//           <div className="chart-wrapper">
//             <Radar
//               data={{
//                 labels: ['پژوهش', 'قرارداد', 'پرداخت', 'پیشرفت', 'RFP'],
//                 datasets: [
//                   {
//                     label: 'عملکرد فعلی',
//                     data: [
//                       Math.min((totalResearch / 100) * 100, 100),
//                       Math.min((totalContract / 50) * 100, 100),
//                       Math.min((totalPaidAmount / (totalContractAmount || 1)) * 100, 100),
//                       Math.min(avgProgress, 100),
//                       Math.min((totalRfp / 20) * 100, 100),
//                     ],
//                     backgroundColor: 'rgba(79, 70, 229, 0.2)',
//                     borderColor: '#4f46e5',
//                     pointBackgroundColor: '#4f46e5',
//                     borderWidth: 2,
//                   },
//                   {
//                     label: 'هدف',
//                     data: [80, 80, 80, 80, 80],
//                     backgroundColor: 'rgba(5, 150, 105, 0.1)',
//                     borderColor: '#059669',
//                     pointBackgroundColor: '#059669',
//                     borderWidth: 2,
//                     borderDash: [5, 5],
//                   },
//                 ],
//               }}
//               options={{
//                 ...chartOptions,
//                 scales: {
//                   r: {
//                     beginAtZero: true,
//                     max: 100,
//                     ticks: { stepSize: 20 },
//                     grid: { color: 'rgba(0,0,0,0.05)' },
//                   },
//                 },
//               }}
//             />
//           </div>
//         </div>

//         {/* نمودار نوع پرداخت‌ها */}
//         <div className="chart-card">
//           <div className="chart-card-header">
//             <div className="chart-title-group">
//               <CreditCard size={18} className="chart-icon" />
//               <h3>توزیع پرداخت‌ها بر اساس نوع</h3>
//             </div>
//             <span className="chart-badge">{paymentTypeData.length} نوع</span>
//           </div>
//           <div className="chart-wrapper">
//             <Pie
//               data={{
//                 labels: paymentTypeData.map(d => d.payment_type),
//                 datasets: [
//                   {
//                     data: paymentTypeData.map(d => d.total_amount),
//                     backgroundColor: [
//                       'rgba(79, 70, 229, 0.8)',
//                       'rgba(5, 150, 105, 0.8)',
//                       'rgba(217, 119, 6, 0.8)',
//                     ],
//                     borderColor: ['#4f46e5', '#059669', '#d97706'],
//                     borderWidth: 2,
//                   },
//                 ],
//               }}
//               options={{
//                 ...chartOptions,
//                 plugins: {
//                   ...chartOptions.plugins,
//                   legend: { ...chartOptions.plugins.legend, position: 'bottom' },
//                   tooltip: {
//                     ...chartOptions.plugins.tooltip,
//                     callbacks: {
//                       label: function(context: any) {
//                         const label = context.label || '';
//                         const value = context.raw || 0;
//                         return `${label}: ${formatCurrency(value)}`;
//                       }
//                     }
//                   }
//                 },
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* ========== ردیف چهارم: جداول تحلیلی ========== */}
//       <div className="tables-row">
//         {/* جدول بهترین پژوهشگران */}
//         <div className="table-card">
//           <div className="table-card-header">
//             <div className="table-title-group">
//               <Award size={18} className="table-icon" />
//               <h3>پژوهشگران برتر</h3>
//             </div>
//             <span className="table-badge">بر اساس تعداد پژوهش</span>
//           </div>
//           <div className="table-scroll">
//             <table className="dashboard-table">
//               <thead>
//                 <tr>
//                   <th>پژوهشگر</th>
//                   <th>تعداد پژوهش</th>
//                   <th>بودجه کل</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {(researchStats?.by_researcher || []).slice(0, 10).map((item, index) => (
//                   <tr key={index}>
//                     <td>
//                       <div className="rank-cell">
//                         <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
//                         {item.researcher_name}
//                       </div>
//                     </td>
//                     <td>{item.count}</td>
//                     <td>{formatCurrency(item.total_budget)}</td>
//                   </tr>
//                 ))}
//                 {(!researchStats?.by_researcher || researchStats.by_researcher.length === 0) && (
//                   <tr>
//                     <td colSpan={3} className="text-center">هیچ داده‌ای وجود ندارد</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* جدول بهترین دانشگاه‌ها */}
//         <div className="table-card">
//           <div className="table-card-header">
//             <div className="table-title-group">
//               <GraduationCap size={18} className="table-icon" />
//               <h3>دانشگاه‌های برتر</h3>
//             </div>
//             <span className="table-badge">بر اساس تعداد پژوهش</span>
//           </div>
//           <div className="table-scroll">
//             <table className="dashboard-table">
//               <thead>
//                 <tr>
//                   <th>دانشگاه</th>
//                   <th>تعداد پژوهش</th>
//                   <th>بودجه کل</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {(researchStats?.by_university || []).slice(0, 10).map((item, index) => (
//                   <tr key={index}>
//                     <td>{item.university_name}</td>
//                     <td>{item.count}</td>
//                     <td>{formatCurrency(item.total_budget)}</td>
//                   </tr>
//                 ))}
//                 {(!researchStats?.by_university || researchStats.by_university.length === 0) && (
//                   <tr>
//                     <td colSpan={3} className="text-center">هیچ داده‌ای وجود ندارد</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* ========== ردیف پنجم: اطلاعات تکمیلی ========== */}
//     <div className="info-row">
//   <div className="info-card">
//     <div className="info-card-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
//       <Users size={20} />
//     </div>
//     <div className="info-card-content">
//       <span className="info-card-value">{personStats?.total || 0}</span>
//       <span className="info-card-title">کل پژوهشگران</span>
//       {/* ✅ تغییر به آمار مفیدتر */}
//       <span className="info-card-sub">{personStats?.total || 0} پژوهشگر</span>
//     </div>
//   </div>
//   <div className="info-card">
//     <div className="info-card-icon" style={{ background: '#d1fae5', color: '#059669' }}>
//       <Building2 size={20} />
//     </div>
//     <div className="info-card-content">
//       <span className="info-card-value">{companyStats?.total || 0}</span>
//       <span className="info-card-title">کل شرکت‌ها</span>
//       <span className="info-card-sub">{companyStats?.with_contract || 0} دارای قرارداد</span>
//     </div>
//   </div>
//   <div className="info-card">
//     <div className="info-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
//       <Globe size={20} />
//     </div>
//     <div className="info-card-content">
//       <span className="info-card-value">{universities.length}</span>
//       <span className="info-card-title">کل دانشگاه‌ها</span>
//       <span className="info-card-sub">{researchStats?.by_university?.length || 0} دارای پژوهش</span>
//     </div>
//   </div>
//   <div className="info-card">
//     <div className="info-card-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
//       <AlertCircle size={20} />
//     </div>
//     <div className="info-card-content">
//       <span className="info-card-value">{contractStats?.terminated || 0}</span>
//       <span className="info-card-title">قراردادهای فسخ شده</span>
//       <span className="info-card-sub">{contractStats?.draft || 0} پیش‌نویس</span>
//     </div>
//   </div>
// </div>
     

//       {/* ========== استایل‌ها ========== */}
//       <style>{`
//         .dashboard-container {
//           padding: 24px;
//           min-height: 100vh;
//           background: #f8fafc;
//         }

//         /* ========== Loading ========== */
//         .dashboard-loading {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           min-height: 80vh;
//           background: #f8fafc;
//         }
//         .spinner-container {
//           text-align: center;
//         }
//         .spinner {
//           width: 50px;
//           height: 50px;
//           border: 4px solid #e9ecef;
//           border-top-color: #4f46e5;
//           border-radius: 50%;
//           animation: spin 0.8s linear infinite;
//           margin: 0 auto 16px;
//         }
//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }
//         .spinner-container p {
//           color: #6b7280;
//           font-size: 16px;
//         }

//         /* ========== Header ========== */
//         .dashboard-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 24px;
//           flex-wrap: wrap;
//           gap: 12px;
//         }

//         .dashboard-title {
//           font-size: 28px;
//           font-weight: 700;
//           color: #1a1a2e;
//           margin: 0 0 4px 0;
//         }

//         .dashboard-subtitle {
//           font-size: 15px;
//           color: #6b7280;
//           margin: 0;
//         }

//         .dashboard-header-right {
//           display: flex;
//           align-items: center;
//           gap: 16px;
//           flex-wrap: wrap;
//         }

//         .dashboard-date {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           padding: 8px 16px;
//           background: white;
//           border-radius: 8px;
//           border: 1px solid #e9ecef;
//           font-size: 14px;
//           color: #374151;
//         }

//         .dashboard-status {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           padding: 8px 16px;
//           background: white;
//           border-radius: 8px;
//           border: 1px solid #e9ecef;
//           font-size: 13px;
//           color: #374151;
//         }

//         .status-dot {
//           width: 8px;
//           height: 8px;
//           border-radius: 50%;
//           display: inline-block;
//         }

//         .status-dot.online {
//           background: #059669;
//           animation: pulse 2s infinite;
//         }

//         @keyframes pulse {
//           0% { opacity: 1; }
//           50% { opacity: 0.5; }
//           100% { opacity: 1; }
//         }

//         /* ========== KPI Grid ========== */
//         .kpi-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
//           gap: 16px;
//           margin-bottom: 24px;
//         }

//         .kpi-card {
//           background: white;
//           border-radius: 12px;
//           border: 1px solid #e9ecef;
//           padding: 18px 20px;
//           transition: all 0.2s ease;
//         }

//         .kpi-card:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
//         }

//         .kpi-card-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 8px;
//         }

//         .kpi-icon {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 40px;
//           height: 40px;
//           border-radius: 10px;
//         }

//         .kpi-trend {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 28px;
//           height: 28px;
//           border-radius: 50%;
//           font-size: 12px;
//         }

//         .kpi-trend.up {
//           background: #d1fae5;
//           color: #059669;
//         }

//         .kpi-trend.down {
//           background: #fee2e2;
//           color: #dc2626;
//         }

//         .kpi-card-body {
//           display: flex;
//           flex-direction: column;
//           gap: 2px;
//         }

//         .kpi-value {
//           font-size: 24px;
//           font-weight: 700;
//           color: #1a1a2e;
//         }

//         .kpi-title {
//           font-size: 13px;
//           font-weight: 500;
//           color: #374151;
//         }

//         .kpi-subtitle {
//           font-size: 12px;
//           color: #6b7280;
//         }

//         .kpi-change {
//           font-size: 12px;
//           font-weight: 500;
//           margin-top: 4px;
//           padding: 2px 10px;
//           border-radius: 12px;
//           display: inline-block;
//           width: fit-content;
//         }

//         .kpi-change.positive {
//           background: #d1fae5;
//           color: #059669;
//         }

//         .kpi-change.negative {
//           background: #fee2e2;
//           color: #dc2626;
//         }

//         /* ========== Charts Row ========== */
//         .charts-row {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 20px;
//           margin-bottom: 24px;
//         }

//         .chart-card {
//           background: white;
//           border-radius: 12px;
//           border: 1px solid #e9ecef;
//           padding: 20px;
//           transition: all 0.2s ease;
//         }

//         .chart-card:hover {
//           box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
//         }

//         .chart-card-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 16px;
//         }

//         .chart-title-group {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//         }

//         .chart-icon {
//           color: #4f46e5;
//         }

//         .chart-card-header h3 {
//           font-size: 15px;
//           font-weight: 600;
//           color: #1a1a2e;
//           margin: 0;
//         }

//         .chart-badge {
//           font-size: 11px;
//           color: #6b7280;
//           background: #f3f4f6;
//           padding: 2px 10px;
//           border-radius: 12px;
//         }

//         .chart-wrapper {
//           width: 100%;
//           height: 280px;
//           position: relative;
//         }

//         /* ========== Tables Row ========== */
//         .tables-row {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 20px;
//           margin-bottom: 24px;
//         }

//         .table-card {
//           background: white;
//           border-radius: 12px;
//           border: 1px solid #e9ecef;
//           padding: 20px;
//           transition: all 0.2s ease;
//         }

//         .table-card:hover {
//           box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
//         }

//         .table-card-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 12px;
//         }

//         .table-title-group {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//         }

//         .table-icon {
//           color: #4f46e5;
//         }

//         .table-card-header h3 {
//           font-size: 15px;
//           font-weight: 600;
//           color: #1a1a2e;
//           margin: 0;
//         }

//         .table-badge {
//           font-size: 11px;
//           color: #6b7280;
//           background: #f3f4f6;
//           padding: 2px 10px;
//           border-radius: 12px;
//         }

//         .table-scroll {
//           max-height: 280px;
//           overflow-y: auto;
//         }

//         .table-scroll::-webkit-scrollbar {
//           width: 4px;
//         }

//         .table-scroll::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 4px;
//         }

//         .table-scroll::-webkit-scrollbar-thumb {
//           background: #c1c7cd;
//           border-radius: 4px;
//         }

//         .dashboard-table {
//           width: 100%;
//           border-collapse: collapse;
//         }

//         .dashboard-table thead th {
//           padding: 10px 12px;
//           text-align: right;
//           font-weight: 600;
//           font-size: 12px;
//           color: #6b7280;
//           border-bottom: 2px solid #e9ecef;
//           background: #f8fafc;
//           position: sticky;
//           top: 0;
//           z-index: 1;
//         }

//         .dashboard-table tbody td {
//           padding: 10px 12px;
//           border-bottom: 1px solid #f3f4f6;
//           font-size: 13px;
//           color: #374151;
//         }

//         .dashboard-table tbody tr:hover {
//           background: #f8fafc;
//         }

//         .dashboard-table .text-center {
//           text-align: center;
//           color: #9ca3af;
//           padding: 20px;
//         }

//         .rank-cell {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//         }

//         .rank-badge {
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           width: 24px;
//           height: 24px;
//           border-radius: 50%;
//           font-size: 11px;
//           font-weight: 700;
//           color: white;
//         }

//         .rank-badge.rank-1 { background: #d97706; }
//         .rank-badge.rank-2 { background: #6b7280; }
//         .rank-badge.rank-3 { background: #92400e; }
//         .rank-badge.rank-4,
//         .rank-badge.rank-5,
//         .rank-badge.rank-6,
//         .rank-badge.rank-7,
//         .rank-badge.rank-8,
//         .rank-badge.rank-9,
//         .rank-badge.rank-10 { background: #4f46e5; }

//         /* ========== Info Row ========== */
//         .info-row {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
//           gap: 16px;
//         }

//         .info-card {
//           display: flex;
//           align-items: center;
//           gap: 14px;
//           padding: 16px 20px;
//           background: white;
//           border-radius: 12px;
//           border: 1px solid #e9ecef;
//           transition: all 0.2s ease;
//         }

//         .info-card:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
//         }

//         .info-card-icon {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 44px;
//           height: 44px;
//           border-radius: 10px;
//           flex-shrink: 0;
//         }

//         .info-card-content {
//           display: flex;
//           flex-direction: column;
//           min-width: 0;
//         }

//         .info-card-value {
//           font-size: 20px;
//           font-weight: 700;
//           color: #1a1a2e;
//           line-height: 1.2;
//         }

//         .info-card-title {
//           font-size: 13px;
//           color: #374151;
//         }

//         .info-card-sub {
//           font-size: 12px;
//           color: #6b7280;
//         }

//         /* ========== Responsive ========== */
//         @media (max-width: 1200px) {
//           .kpi-grid {
//             grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
//           }
//         }

//         @media (max-width: 992px) {
//           .charts-row {
//             grid-template-columns: 1fr;
//           }
//           .tables-row {
//             grid-template-columns: 1fr;
//           }
//         }

//         @media (max-width: 768px) {
//           .dashboard-container {
//             padding: 16px;
//           }

//           .dashboard-title {
//             font-size: 22px;
//           }

//           .dashboard-header {
//             flex-direction: column;
//             align-items: stretch;
//           }

//           .kpi-grid {
//             grid-template-columns: 1fr 1fr;
//             gap: 12px;
//           }

//           .kpi-card {
//             padding: 14px 16px;
//           }

//           .kpi-value {
//             font-size: 20px;
//           }

//           .chart-card {
//             padding: 16px;
//           }

//           .chart-wrapper {
//             height: 220px;
//           }

//           .table-card {
//             padding: 16px;
//           }

//           .info-row {
//             grid-template-columns: 1fr 1fr;
//           }
//         }

//         @media (max-width: 480px) {
//           .dashboard-container {
//             padding: 12px;
//           }

//           .kpi-grid {
//             grid-template-columns: 1fr;
//           }

//           .info-row {
//             grid-template-columns: 1fr;
//           }

//           .chart-wrapper {
//             height: 200px;
//           }

//           .dashboard-table {
//             font-size: 12px;
//           }

//           .dashboard-table thead th,
//           .dashboard-table tbody td {
//             padding: 8px 10px;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Dashboard;
