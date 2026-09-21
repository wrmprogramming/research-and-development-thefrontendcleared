// src/modules/progress/components/ProgressStats.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { useProgress } from '../hooks/useProgress';
import {
  TrendingUp,
  AlertCircle,
  Building2,
  Calendar,
  Percent,
  BarChart3,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';
import { toPersianNumber } from '../../../utils/formatter.utils';
interface ProgressStatsProps {
  contractId?: number;
  className?: string;
}

// گرفتن سال شمسی فعلی
const getCurrentJalaliYear = (): number => {
  try {
    const now = new Date();
    const jalaliDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
    }).format(now);
    const year = parseInt(jalaliDate);
    return isNaN(year) ? 1404 : year;
  } catch {
    return 1404;
  }
};

export const ProgressStats: React.FC<ProgressStatsProps> = ({ contractId, className = '' }) => {
  const { useStats } = useProgress();
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const { data: stats, isLoading, isError, refetch } = useStats({ 
    contract: contractId,
    year: selectedYear === 'all' ? undefined : selectedYear 
  });
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // ========== استخراج سال‌های موجود ==========
  const availableYears = useMemo(() => {
    if (!stats?.available_years || stats.available_years.length === 0) {
      return [];
    }
    return stats.available_years;
  }, [stats]);

  // ========== تنظیم سال پیش‌فرض فقط در بار اول ==========
  useEffect(() => {
    if (isFirstLoad && availableYears.length > 0) {
      const latestYear = availableYears[0];
      if (latestYear !== selectedYear && !isNaN(latestYear)) {
        setSelectedYear(latestYear);
      }
      setIsFirstLoad(false);
    }
  }, [availableYears, isFirstLoad, selectedYear]);

  // ========== هندلر تغییر سال ==========
  const handleYearChange = (year: number | 'all') => {
    setSelectedYear(year);
  };

  // ========== فیلتر بر اساس سال ==========
  const filteredContracts = useMemo(() => {
    if (!stats?.by_contract) return [];
    
    if (selectedYear !== 'all' && !isNaN(selectedYear as number)) {
      return stats.by_contract.filter(contract => {
        const yearStats = stats.contract_year_stats?.[contract.contract_id]?.[selectedYear as number];
        return yearStats !== undefined;
      });
    }
    return stats.by_contract;
  }, [stats, selectedYear]);

  // ========== محاسبه آمار سال انتخاب شده ==========
// ========== محاسبه آمار سال انتخاب شده ==========
const yearStatsData = useMemo(() => {
  if (!stats) return null;
    // ✅ اگر سال انتخاب شده و در stats_by_year موجود است، از آن استفاده کن
  if (selectedYear !== 'all' && stats.stats_by_year?.[selectedYear as number]) {
    const yearStat = stats.stats_by_year[selectedYear as number];
    return {
      totalContracts: yearStat.count || 0,
      progressCount: yearStat.count || 0,
      averageProgress: yearStat.average_progress || 0,
      maxProgress: yearStat.max_progress || 0,
      minProgress: yearStat.min_progress || 0,
    };
  } 
  

  // اگر سال انتخاب نشده یا داده‌ای وجود ندارد، از by_contract محاسبه کن
  const totalContracts = filteredContracts.length;
  
  let totalProgress = 0;
  let maxProgress = 0;
  let minProgress = 100;

  filteredContracts.forEach(contract => {
    const yearStats = selectedYear !== 'all' && !isNaN(selectedYear as number)
      ? stats.contract_year_stats?.[contract.contract_id]?.[selectedYear as number]
      : null;
    const progress = yearStats?.physical_progress ?? contract.physical_progress ?? 0;
    
    totalProgress += progress;
    if (progress > maxProgress) maxProgress = progress;
    if (progress < minProgress) minProgress = progress;
  });

  const averageProgress = totalContracts > 0 ? totalProgress / totalContracts : 0;

  return {
    totalContracts,
    progressCount: totalContracts,
    averageProgress,
    maxProgress: maxProgress === 100 ? 0 : maxProgress,
    minProgress: minProgress === 100 ? 0 : minProgress,
  };
}, [filteredContracts, stats, selectedYear]);



  if (isLoading) {
    return (
      <div className={`progress-stats ${className}`}>
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card skeleton">
              <div className="stat-icon skeleton-icon" />
              <div className="stat-info">
                <div className="stat-value skeleton-text" />
                <div className="stat-label skeleton-text" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className={`progress-stats ${className}`}>
        <div className="stats-error">
          <AlertCircle size={24} />
          <p>خطا در دریافت آمار پیشرفت</p>
        </div>
      </div>
    );
  }

  const isYearSelected = selectedYear !== 'all';
const yearLabel = isYearSelected ? `سال ${toPersianNumber(selectedYear as number)}` : 'کل';

  // ========== کارت‌های اصلی ==========
  const statItems = [
    {
      key: 'total',
      label: `تعداد کل قراردادها (${yearLabel})`,
      value: toPersianNumber(yearStatsData?.totalContracts || 0),
      icon: Building2,
      color: '#4f46e5',
      bgColor: '#eef2ff',
    },
    {
      key: 'average',
      label: `میانگین پیشرفت (${yearLabel})`,
      value: `${toPersianNumber(Math.round(yearStatsData?.averageProgress || 0))}%`,
      icon: Percent,
      color: '#059669',
      bgColor: '#d1fae5',
    },
    {
      key: 'max',
      label: `بیشترین پیشرفت (${yearLabel})`,
      value: `${toPersianNumber(Math.round(yearStatsData?.maxProgress || 0))}%`,
      icon: TrendingUp,
      color: '#2563eb',
      bgColor: '#dbeafe',
    },
    {
      key: 'min',
      label: `کمترین پیشرفت (${yearLabel})`,
      value: `${toPersianNumber(Math.round(yearStatsData?.minProgress || 0))}%`,
      icon: AlertCircle,
      color: '#dc2626',
      bgColor: '#fee2e2',
    },
  ];

  // ========== دریافت وضعیت نمایشی ==========
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'خاتمه یافته', icon: CheckCircle, color: '#059669', bgColor: '#d1fae5' };
      case 'IN_PROGRESS':
        return { label: 'جاری', icon: Clock, color: '#2563eb', bgColor: '#dbeafe' };
      case 'DRAFT':
        return { label: 'پیش‌نویس', icon: AlertCircle, color: '#6b7280', bgColor: '#f3f4f6' };
      case 'TERMINATED':
        return { label: 'فسخ شده', icon: XCircle, color: '#dc2626', bgColor: '#fee2e2' };
      default:
        return { label: status, icon: Clock, color: '#6b7280', bgColor: '#f3f4f6' };
    }
  };

  const statsByYearEntries = Object.entries(stats.stats_by_year || {});
  const hasStatsByYear = statsByYearEntries.length > 0;

  return (
    <div className={`progress-stats ${className}`}>
      {/* ==========================================================
          بخش انتخاب سال (همانند ماژول‌های قبلی)
          ========================================================== */}
      <div className="stats-header">
        <div className="stats-title">
          <TrendingUp size={20} />
          <h3>آمار پیشرفت فیزیکی</h3>
        </div>
        
        <div className="year-selector-wrapper">
          <Calendar size={16} className="year-selector-icon" />
          <select
            className="year-selector"
            value={selectedYear}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'all') {
                handleYearChange('all');
              } else {
                handleYearChange(Number(value));
              }
            }}
          >
            <option value="all">همه سال‌ها</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
              {toPersianNumber(year)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ==========================================================
          کارت‌های اصلی
          ========================================================== */}
      <div className="stats-grid">
        {statItems.map((item) => (
          <div key={item.key} className="stat-card">
            <div className="stat-icon" style={{ background: item.bgColor, color: item.color }}>
              <item.icon size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{item.value}</span>
              <span className="stat-label">{item.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ==========================================================
          آمار بر اساس سال
          ========================================================== */}
      {hasStatsByYear && (
        <div className="stats-detail">
          <div className="detail-header">
            <h4>
              <BarChart3 size={16} />
              آمار پیشرفت بر اساس سال
            </h4>
            <span className="detail-badge">{toPersianNumber(statsByYearEntries.length)} سال</span>
          </div>
          <div className="year-stats-grid">
            {statsByYearEntries
              .sort((a, b) => Number(b[0]) - Number(a[0]))
              .map(([year, yearStat]) => {
                const isSelected = selectedYear === Number(year);
                return (
                  <div 
                    key={year} 
                    className={`year-stat-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleYearChange(Number(year))}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="year-stat-header">
                      <span className="year-label">{toPersianNumber(Number(year))}</span>
                      <span className="year-count">
                        {toPersianNumber(yearStat.count)} قرارداد
                      </span>
                    </div>
                    <div className="year-stat-body">
                      <div className="stat-row">
                        <span className="stat-label">میانگین</span>
                        <span className="stat-value primary">{toPersianNumber(Math.round(yearStat.average_progress || 0))}%</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">بیشترین</span>
                        <span className="stat-value max">{toPersianNumber(Math.round(yearStat.max_progress || 0))}%</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">کمترین</span>
                        <span className="stat-value min">{toPersianNumber(Math.round(yearStat.min_progress || 0))}%</span>
                      </div>
                      <div className="progress-bar-mini">
                        <div
                          className="progress-fill-mini"
                          style={{ width: `${Math.min(yearStat.average_progress || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <style>{`
        .progress-stats {
          margin-bottom: 20px;
        }

        /* --- هدر استات با انتخابگر سال (همانند ماژول‌های قبلی) --- */
        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .stats-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stats-title h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .year-selector-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1.5px solid #e9ecef;
          border-radius: 8px;
          padding: 4px 12px;
          transition: all 0.2s;
        }

        .year-selector-wrapper:focus-within {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .year-selector-icon {
          color: #6b7280;
        }

        .year-selector {
          padding: 6px 4px;
          border: none;
          background: transparent;
          font-size: 14px;
          font-weight: 500;
          color: #1a1a2e;
          outline: none;
          cursor: pointer;
          min-width: 100px;
        }

        .year-selector option {
          padding: 4px 8px;
        }

        .year-stat-card.selected {
          border-color: #4f46e5;
          background: #eef2ff;
        }

        .year-stat-card.selected .year-label {
          color: #4f46e5;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 12px;
          color: #6b7280;
        }

        .stats-detail {
          padding: 16px 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          margin-top: 12px;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .detail-header h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0;
        }

        .detail-badge {
          font-size: 11px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .year-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .year-stat-card {
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .year-stat-card:hover {
          border-color: #818cf8;
          background: #f3f4f6;
        }

        .year-stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .year-label {
          font-weight: 700;
          font-size: 16px;
          color: #374151;
        }

        .year-count {
          font-size: 12px;
          color: #6b7280;
          background: white;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .year-stat-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .stat-row .stat-label {
          color: #6b7280;
        }

        .stat-row .stat-value {
          font-size: 14px;
          font-weight: 600;
        }

        .stat-row .stat-value.primary {
          color: #4f46e5;
        }

        .stat-row .stat-value.max {
          color: #059669;
        }

        .stat-row .stat-value.min {
          color: #dc2626;
        }

        .progress-bar-mini {
          height: 4px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 4px;
        }

        .progress-fill-mini {
          height: 100%;
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .skeleton .skeleton-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #e9ecef;
          animation: shimmer 1.5s infinite;
        }

        .skeleton .skeleton-text {
          height: 16px;
          border-radius: 4px;
          background: #e9ecef;
          animation: shimmer 1.5s infinite;
        }

        .skeleton .skeleton-text:first-child {
          width: 60%;
          margin-bottom: 6px;
        }

        .skeleton .skeleton-text:last-child {
          width: 40%;
        }

        @keyframes shimmer {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .stats-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background: #fee2e2;
          border-radius: 12px;
          color: #dc2626;
          gap: 8px;
        }

        .stats-error p {
          margin: 0;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .stats-header {
            flex-direction: column;
            align-items: stretch;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .year-stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .year-selector-wrapper {
            width: 100%;
          }

          .year-selector {
            flex: 1;
            min-width: 0;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .year-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressStats;
