// src/modules/steering-committee/components/SteeringCommitteeStats.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { useSteeringCommittee } from '../hooks/useSteeringCommittee';
import {
  FileText,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  GraduationCap,
} from 'lucide-react';
import { toPersianNumber } from '../../../utils/formatter.utils';
interface SteeringCommitteeStatsProps {
  className?: string;
}

// ========== تابع کمکی برای محاسبه ماکزیمم ==========
const getMaxValue = (obj: Record<string, any>): number => {
  const values = Object.values(obj).map(v => Number(v));
  return values.length > 0 ? Math.max(...values) : 0;
};

// ========== تابع کمکی برای محاسبه درصد ==========
const getPercentage = (value: any, maxValue: number): number => {
  return maxValue > 0 ? (Number(value) / maxValue) * 100 : 0;
};

export const SteeringCommitteeStats: React.FC<SteeringCommitteeStatsProps> = ({ className = '' }) => {
  const { useStats } = useSteeringCommittee();

  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // ✅ دریافت استات با پارامتر سال
  const { data: stats, isLoading, isError } = useStats(
    selectedYear === 'all' ? undefined : selectedYear
  );

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

  // ========== محاسبه آمار سال انتخاب شده ==========
  const yearStatsData = useMemo(() => {
    if (!stats) {
      return {
        totalCommittees: 0,
        totalApprovements: 0,
      };
    }

    // اگر سال انتخاب شده و در stats_by_year موجود است
    if (selectedYear !== 'all' && stats.stats_by_year?.[selectedYear as number]) {
      const yearStat = stats.stats_by_year[selectedYear as number];
      const approvCount = stats.approvements_by_year?.[selectedYear as number]?.count || 0;
      return {
        totalCommittees: yearStat.count || 0,
        totalApprovements: approvCount,
      };
    }

    // همه سال‌ها - از total استفاده کن
    return {
      totalCommittees: stats.total || 0,
      totalApprovements: stats.total_approvements || 0,
    };
  }, [stats, selectedYear]);

  // ========== هندلر تغییر سال ==========
  const handleYearChange = (year: number | 'all') => {
    setSelectedYear(year);
  };

  // ========== وضعیت بارگذاری ==========
  if (isLoading) {
    return (
      <div className={`steering-committee-stats ${className}`}>
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
      <div className={`steering-committee-stats ${className}`}>
        <div className="stats-error">
          <AlertCircle size={24} />
          <p>خطا در دریافت آمار کمیته‌های راهبری</p>
        </div>
      </div>
    );
  }

  // ✅ بررسی اینکه آیا سال خاصی انتخاب شده
  const isYearSelected = selectedYear !== 'all';
  const yearLabel = isYearSelected ? `سال ${toPersianNumber(selectedYear as number)}` : 'کل';

  // ========== کارت‌های آمار اصلی ==========
  const statItems = [
    {
      key: 'total',
      label: `تعداد کل جلسات (${yearLabel})`,
      value: toPersianNumber(yearStatsData?.totalCommittees || 0),
      icon: FileText,
      color: '#4f46e5',
      bgColor: '#eef2ff',
    },
    {
      key: 'total_approvements',
      label: `تعداد کل مصوبات (${yearLabel})`,
      value: toPersianNumber(yearStatsData?.totalApprovements || 0),
      icon: CheckCircle,
      color: '#2563eb',
      bgColor: '#dbeafe',
    },
  ];

  // ========== آمار بر اساس سال (نوارهای پیشرفت - جلسات) ==========
  const byYearEntries = stats.by_year ? Object.entries(stats.by_year) : [];
  const maxCount = getMaxValue(stats.by_year || {});

  // ========== آمار مصوبات بر اساس سال ==========
  const approvementsByYearEntries = stats.approvements_by_year 
    ? Object.entries(stats.approvements_by_year) 
    : [];
  const maxApprovementsCount = getMaxValue(stats.approvements_by_year || {});

  // ========== آمار بر اساس پژوهش ==========
  const byResearchEntries = stats.by_research || [];

  return (
    <div className={`steering-committee-stats ${className}`}>
      {/* ==========================================================
          هدر با انتخابگر سال
          ========================================================== */}
      <div className="stats-header">
        <div className="stats-title">
          <FileText size={20} />
          <h3>آمار کمیته‌های راهبری</h3>
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
          کارت‌های آمار اصلی
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
          توزیع جلسات بر اساس سال
          ========================================================== */}
      {byYearEntries.length > 0 && (
        <div className="stats-detail">
          <h4 className="stats-detail-title">
            <TrendingUp size={18} />
            توزیع جلسات بر اساس سال
          </h4>
          <div className="year-stats">
            {byYearEntries
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([year, data]) => {
                const count = typeof data === 'object' ? data.count : data;
                const percentage = maxCount > 0 ? (Number(count) / maxCount) * 100 : 0;
                const isSelected = selectedYear === Number(year);
                return (
                  <div 
                    key={year} 
                    className={`year-stat-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleYearChange(Number(year))}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="year-label">{toPersianNumber(Number(year))}</span>
                    <div className="year-stat-bar">
                      <div className="year-stat-fill" style={{
                        width: `${percentage}%`,
                        backgroundColor: isSelected ? '#059669' : '#34d399',
                      }} />
                    </div>
                    <span className="year-stat-count">{toPersianNumber(Number(count))}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ==========================================================
          توزیع مصوبات بر اساس سال
          ========================================================== */}
      {approvementsByYearEntries.length > 0 && (
        <div className="stats-detail">
          <h4 className="stats-detail-title">
            <CheckCircle size={18} />
            توزیع مصوبات بر اساس سال
          </h4>
          <div className="year-stats">
            {approvementsByYearEntries
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([year, data]) => {
                const count = typeof data === 'object' ? data.count : data;
                const percentage = maxApprovementsCount > 0 ? (Number(count) / maxApprovementsCount) * 100 : 0;
                const isSelected = selectedYear === Number(year);
                return (
                  <div 
                    key={year} 
                    className={`year-stat-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleYearChange(Number(year))}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="year-label">{toPersianNumber(Number(year))}</span>
                    <div className="year-stat-bar">
                      <div className="year-stat-fill" style={{
                        width: `${percentage}%`,
                        backgroundColor: isSelected ? '#2563eb' : '#60a5fa',
                      }} />
                    </div>
                    <span className="year-stat-count">{toPersianNumber(Number(count))}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ==========================================================
          توزیع بر اساس پژوهش
          ========================================================== */}
      {byResearchEntries.length > 0 && (
        <div className="stats-detail">
          <h4 className="stats-detail-title">
            <GraduationCap size={18} />
            توزیع بر اساس پژوهش
          </h4>
          <div className="research-stats">
            {byResearchEntries.slice(0, 10).map((item) => (
              <div key={item.research_id} className="research-stat-item">
                <span className="research-name">{item.research_title || 'پژوهش نامشخص'}</span>
                <div className="research-stat-bar">
                  <div className="research-stat-fill" style={{
                    width: `${(item.count / Math.max(...byResearchEntries.map(r => r.count), 1)) * 100}%`,
                    backgroundColor: '#059669',
                  }} />
                </div>
                <span className="research-count">{toPersianNumber(item.count)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .steering-committee-stats {
          margin-bottom: 20px;
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

       .year-selector-wrapper:focus-within { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }

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
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
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

        .stats-detail-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 12px 0;
        }

        .year-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .year-stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .year-label {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a2e;
          min-width: 50px;
        }

        .year-stat-bar {
          flex: 1;
          height: 6px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
          min-width: 60px;
        }

        .year-stat-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .year-stat-count {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a2e;
          min-width: 30px;
          text-align: left;
        }

        .year-stat-item.selected .year-label {
          color: #4f46e5;
          font-weight: 700;
        }

        .year-stat-item.selected .year-stat-count {
          color: #4f46e5;
          font-weight: 700;
        }

        .research-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .research-stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .research-name {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          min-width: 150px;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .research-stat-bar {
          flex: 1;
          height: 6px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
          min-width: 60px;
        }

        .research-stat-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
          background: #4f46e5;
        }

        .research-count {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a2e;
          min-width: 30px;
          text-align: left;
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

        @media (max-width: 768px) {
          .stats-header {
            flex-direction: column;
            align-items: stretch;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .year-stat-item {
            flex-wrap: wrap;
          }

          .research-stat-item {
            flex-wrap: wrap;
          }

          .research-name {
            min-width: 100px;
            max-width: 120px;
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

export default SteeringCommitteeStats;