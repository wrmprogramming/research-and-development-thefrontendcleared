// src/modules/research/components/ResearchStats.tsx

// ============================================================
// 1. ایمپورت‌ها
// ============================================================
import React, { useState, useMemo, useEffect } from 'react';
import { useResearch } from '../hooks/useResearch';
import { RESEARCH_STATUSES, type ResearchStatus } from '../types/research.types';
import {
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Building2,
  GraduationCap,
  PieChart,
  Calendar,
  Loader2
} from 'lucide-react';

// ============================================================
// 2. پراپ‌های کامپوننت
// ============================================================
interface ResearchStatsProps {
  className?: string;
}

// ============================================================
// 3. کامپوننت اصلی
// ============================================================
export const ResearchStats: React.FC<ResearchStatsProps> = ({ className = '' }) => {
  // --- 3.1. دریافت داده‌های آمار از هوک ---
  const { useStats, useList } = useResearch();
  const { data: stats, isLoading, isError } = useStats();

  // --- 3.2. State برای انتخاب سال ---
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  // --- 3.3. State برای آمار تفکیک شده بر اساس سال ---
  const [yearlyStats, setYearlyStats] = useState<{
    total: number;
    draft: number;
    active: number;
    completed: number;
    affiliation: {
    UNIVERSITY: number;
    COMPANY: number;
  };
  } | null>(null);
  const [isLoadingYearly, setIsLoadingYearly] = useState(false);

  // --- 3.4. هوک برای دریافت لیست پژوهش‌های یک سال خاص ---
  // از useList استفاده می‌کنیم تا داده‌های یک سال را دریافت کنیم
  const { data: yearData, isLoading: isLoadingYearData } = useList({
    year: selectedYear === 'all' ? undefined : selectedYear,
    page_size: 1000, // دریافت تعداد زیادی برای محاسبه آمار
  });

  // --- 3.5. محاسبه آمار سالانه از داده‌های دریافتی ---
  useEffect(() => {
    if (selectedYear === 'all') {
      setYearlyStats(null);
      return;
    }

    if (yearData?.results) {
      const researches = yearData.results;
      const draft = researches.filter(r => r.status === 'DRAFT').length;
      const active = researches.filter(r => r.status === 'IN_PROGRESS').length;
      const completed = researches.filter(r => r.status === 'COMPLETED').length;
      const universityCount = researches.filter(r => r.affiliation_type === 'UNIVERSITY').length;
      const companyCount = researches.filter(r => r.affiliation_type === 'COMPANY').length;

      setYearlyStats({
        total: researches.length,
        draft,
        active,
        completed,
        affiliation: {
        UNIVERSITY: universityCount,
        COMPANY: companyCount,
      },
      });
    }
  }, [yearData, selectedYear]);

  // --- 3.6. لیست سال‌های موجود ---
  const availableYears = useMemo(() => {
    if (!stats || !stats.by_year) return [];
    const years = Object.keys(stats.by_year)
      .map(Number)
      .filter(year => !isNaN(year) && year > 0)
      .sort((a, b) => b - a);
    return years;
  }, [stats]);

  // --- 3.7. تعیین سال پیش‌فرض ---
  useEffect(() => {
    if (selectedYear === 'all' && availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  // --- 3.8. هندلر تغییر سال ---
  const handleYearChange = (year: number | 'all') => {
    setSelectedYear(year);
  };

  // --- 3.9. وضعیت‌های بارگذاری و خطا ---
  if (isLoading) {
    return (
      <div className={`research-stats ${className}`}>
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
      <div className={`research-stats ${className}`}>
        <div className="stats-error">
          <p>خطا در دریافت آمار</p>
        </div>
      </div>
    );
  }

  // --- 3.10. تعیین مقادیر نمایش داده شده ---
  // اگر سال خاصی انتخاب شده باشد، از yearlyStats استفاده کن
  // در غیر این صورت از stats کلی استفاده کن
  const isYearSelected = selectedYear !== 'all';
  const displayStats = isYearSelected && yearlyStats ? yearlyStats : stats;

  // مقادیر برای کارت‌ها
  const totalCount = displayStats.total || 0;
  const draftCount = displayStats.draft || 0;
  const activeCount = displayStats.active || 0;
  const completedCount = displayStats.completed || 0;

  // --- 3.11. کارت‌های آمار اصلی ---
  const statItems = [
    {
      key: 'total',
      label: isYearSelected ? `پژوهش‌های سال ${selectedYear}` : 'کل پژوهش‌ها',
      value: totalCount,
      icon: FileText,
      color: '#4f46e5',
      bgColor: '#eef2ff',
    },
    {
      key: 'draft',
      label: 'پیش‌نویس',
      value: draftCount,
      icon: FileText,
      color: '#6b7280',
      bgColor: '#f3f4f6',
    },
    {
      key: 'active',
      label: 'در حال اجرا',
      value: activeCount,
      icon: Clock,
      color: '#2563eb',
      bgColor: '#dbeafe',
    },
    {
      key: 'completed',
      label: 'خاتمه یافته',
      value: completedCount,
      icon: CheckCircle,
      color: '#059669',
      bgColor: '#d1fae5',
    },
  ];

  return (
    <div className={`research-stats ${className}`}>
      {/* ==========================================================
          3.12. بخش انتخاب سال (مثل بخش پرداخت)
          ========================================================== */}
      <div className="stats-header">
        <div className="stats-title">
          <PieChart size={20} />
          <h3>آمار پژوهش‌ها</h3>
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
                {year}
              </option>
            ))}
          </select>
          {isLoadingYearData && isYearSelected && (
            <Loader2 size={14} className="spinner" />
          )}
        </div>
      </div>

      {/* ==========================================================
          3.13. کارت‌های آمار اصلی
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
          3.14. آمار بر اساس وضعیت (نوارهای پیشرفت)
          ========================================================== */}
      <div className="stats-detail">
        <h4 className="stats-detail-title">
          <TrendingUp size={18} />
          توزیع بر اساس وضعیت
        </h4>
        <div className="status-stats">
          {Object.entries(RESEARCH_STATUSES).map(([status, statusInfo]) => {
            // محاسبه تعداد برای وضعیت مورد نظر
            let count = 0;
            if (isYearSelected && yearlyStats) {
              // اگر سال انتخاب شده، از yearlyStats استفاده کن
              if (status === 'DRAFT') count = yearlyStats.draft;
              else if (status === 'IN_PROGRESS') count = yearlyStats.active;
              else if (status === 'COMPLETED') count = yearlyStats.completed;
            } else {
              // اگر همه سال‌ها، از stats.by_status استفاده کن
              count = stats.by_status?.[status as ResearchStatus] || 0;
            }

            const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;

            return (
              <div key={status} className="status-stat-item">
                <div className="status-stat-info">
                  <span
                    className="status-dot"
                    style={{ backgroundColor: statusInfo.color }}
                  />
                  <span className="status-stat-name">{statusInfo.label}</span>
                </div>
                <div className="status-stat-bar">
                  <div
                    className="status-stat-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: statusInfo.color,
                    }}
                  />
                </div>
                <span className="status-stat-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==========================================================
          3.15. آمار بر اساس سال (نوارهای پیشرفت)
          ========================================================== */}
      {stats.by_year && Object.keys(stats.by_year).length > 0 && (
        <div className="stats-detail">
          <h4 className="stats-detail-title">
            <PieChart size={18} />
            توزیع بر اساس سال
          </h4>
          <div className="year-stats">
            {Object.entries(stats.by_year)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([year, count]) => {
                const maxCount = Math.max(...Object.values(stats.by_year));
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                const isSelected = selectedYear === Number(year);

                return (
                  <div 
                    key={year} 
                    className={`year-stat-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleYearChange(Number(year))}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="year-label">{year}</span>
                    <div className="year-stat-bar">
                      <div
                        className="year-stat-fill"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: isSelected ? '#4f46e5' : '#818cf8',
                        }}
                      />
                    </div>
                    <span className="year-stat-count">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ==========================================================
          3.16. آمار بر اساس نوع همکار
          ========================================================== */}
      {/* ==========================================================
    3.16. آمار بر اساس نوع همکار (با پشتیبانی از سال)
    ========================================================== */}
{/*  اگر سال انتخاب شده، از yearlyStats استفاده کن، در غیر این صورت از stats.by_affiliation */}
{(isYearSelected && yearlyStats?.affiliation) || stats.by_affiliation?.length > 0 ? (
  <div className="stats-detail">
    <h4 className="stats-detail-title">
      <Building2 size={18} />
      توزیع بر اساس نوع همکار
      {isYearSelected && <span className="year-badge">سال {selectedYear}</span>}
    </h4>
    <div className="affiliation-stats">
      {isYearSelected && yearlyStats?.affiliation ? (
        //  حالت سال انتخاب شده - استفاده از داده‌های yearlyStats
        <>
          {[
            { type: 'UNIVERSITY', label: 'دانشگاه', icon: GraduationCap, color: '#8b5cf6' },
            { type: 'COMPANY', label: 'شرکت', icon: Building2, color: '#ec4899' },
          ].map((item) => {
            const count = yearlyStats.affiliation[item.type as 'UNIVERSITY' | 'COMPANY'] || 0;
            const percentage = yearlyStats.total > 0 ? (count / yearlyStats.total) * 100 : 0;
            const Icon = item.icon;
            return (
              <div key={item.type} className="affiliation-stat-item">
                <div className="affiliation-stat-info">
                  <span className="affiliation-icon" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                    <Icon size={16} />
                  </span>
                  <span className="affiliation-stat-name">{item.label}</span>
                </div>
                <div className="affiliation-stat-bar">
                  <div
                    className="affiliation-stat-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <span className="affiliation-stat-count">{count}</span>
              </div>
            );
          })}
        </>
      ) : (
        //  حالت همه سال‌ها - استفاده از stats.by_affiliation
        stats.by_affiliation?.map((item) => {
          const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
          const isUniversity = item.affiliation_type === 'UNIVERSITY';
          return (
            <div key={item.affiliation_type} className="affiliation-stat-item">
              <div className="affiliation-stat-info">
                <span className="affiliation-icon">
                  {isUniversity ? (
                    <GraduationCap size={16} />
                  ) : (
                    <Building2 size={16} />
                  )}
                </span>
                <span className="affiliation-stat-name">
                  {isUniversity ? 'دانشگاه' : 'شرکت'}
                </span>
              </div>
              <div className="affiliation-stat-bar">
                <div
                  className="affiliation-stat-fill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: isUniversity ? '#8b5cf6' : '#ec4899',
                  }}
                />
              </div>
              <span className="affiliation-stat-count">{item.count}</span>
            </div>
          );
        })
      )}
    </div>
  </div>
) : null}
    
      {/* ==========================================================
          3.18. استایل‌های CSS
          ========================================================== */}
      <style>{`
        .research-stats {
          margin-bottom: 20px;
        }
        .year-badge {
          font-size: 12px;
          font-weight: 500;
          color: #4f46e5;
          background: #eef2ff;
          padding: 2px 10px;
          border-radius: 12px;
          margin-right: 8px;
        }

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

        .spinner {
          animation: spin 1s linear infinite;
          color: #4f46e5;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
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

        .stats-detail {
          margin-top: 16px;
          padding: 16px 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .stats-detail-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 12px 0;
        }

        .status-stats,
        .year-stats,
        .affiliation-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-stat-item,
        .year-stat-item,
        .affiliation-stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-stat-info {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 100px;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .status-stat-name,
        .affiliation-stat-name {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a2e;
        }

        .status-stat-bar,
        .year-stat-bar,
        .affiliation-stat-bar {
          flex: 1;
          height: 6px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
          min-width: 60px;
        }

        .status-stat-fill,
        .year-stat-fill,
        .affiliation-stat-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .status-stat-count,
        .year-stat-count,
        .affiliation-stat-count {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a2e;
          min-width: 30px;
          text-align: left;
        }

        .year-label {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a2e;
          min-width: 50px;
        }

        .year-stat-item.selected .year-label {
          color: #4f46e5;
          font-weight: 700;
        }

        .year-stat-item.selected .year-stat-count {
          color: #4f46e5;
          font-weight: 700;
        }

        .affiliation-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          background: #f3f4f6;
          color: #6b7280;
        }

        .stats-note {
          margin-top: 12px;
          padding: 10px 16px;
          background: #fef3c7;
          border-radius: 8px;
          border: 1px solid #fcd34d;
        }

        .stats-note .text-muted {
          font-size: 13px;
          color: #92400e;
          margin: 0;
        }

        .stats-error {
          padding: 20px;
          text-align: center;
          color: #dc2626;
          background: #fee2e2;
          border-radius: 8px;
        }

        @media (max-width: 768px) {
          .stats-header {
            flex-direction: column;
            align-items: stretch;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .status-stat-item,
          .year-stat-item,
          .affiliation-stat-item {
            flex-wrap: wrap;
          }

          .status-stat-info {
            min-width: 80px;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .year-selector-wrapper {
            width: 100%;
          }

          .year-selector {
            flex: 1;
            min-width: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ResearchStats;