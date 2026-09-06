// src/modules/communication/components/CommunicationStats.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { useCommunication } from '../hooks/useCommunication';
import {
  FileText,
  Calendar,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Mail,
} from 'lucide-react';

interface CommunicationStatsProps {
  className?: string;
}
// // ========== تابع تبدیل اعداد به فارسی ==========
const toPersianNumber = (num: number): string => {
  if (num === undefined || num === null) return '۰';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

export const CommunicationStats: React.FC<CommunicationStatsProps> = ({ className = '' }) => {
  const { useStats } = useCommunication();
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const { data: stats, isLoading, isError } = useStats(
    selectedYear === 'all' ? undefined : selectedYear
  );

  // ========== استخراج سال‌های موجود ==========
  const availableYears = useMemo(() => {
    if (!stats?.by_year) return [];
    return Object.keys(stats.by_year)
      .map(Number)
      .filter(year => !isNaN(year) && year > 0)
      .sort((a, b) => b - a);
  }, [stats]);

  // ========== تعیین سال پیش‌فرض (آخرین سال) ==========
  useEffect(() => {
    if (selectedYear === 'all' && availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  // ========== هندلر تغییر سال ==========
  const handleYearChange = (year: number | 'all') => {
    setSelectedYear(year);
  };

  // ========== فیلتر بر اساس سال ==========
  const filteredByMonth = useMemo(() => {
    if (!stats?.by_month) return {};
    
    const filtered: Record<string, { month_name: string; count: number }> = {};
    
    Object.entries(stats.by_month).forEach(([key, value]) => {
      const year = parseInt(key.split('-')[0]);
      if (selectedYear === 'all' || year === selectedYear) {
        filtered[key] = value;
      }
    });
    
    return filtered;
  }, [stats, selectedYear]);

  // ========== آمار سال انتخاب شده ==========
  const yearStats = useMemo(() => {
    let totalCount = 0;
    let withResearch = 0;

    Object.values(filteredByMonth).forEach(item => {
      totalCount += (item.count || 0);
    });

    // محاسبه نسبت‌ها از داده‌های اصلی
    if (stats && totalCount > 0) {
      const ratio = stats.total > 0 ? totalCount / stats.total : 0;
      withResearch = Math.round((stats.total_with_research || 0) * ratio);
    }

    return {
      totalCount,
      withResearch,
    };
  }, [filteredByMonth, stats]);

  // ========== کارت‌های اصلی ==========
  const statItems = useMemo(() => {
    if (!stats) return [];
    
    const isYearSelected = selectedYear !== 'all';
    const yearLabel = isYearSelected ? `سال ${selectedYear}` : 'کل';
    
    return [
      {
        key: 'total',
        label: `تعداد کل مکاتبات (${yearLabel})`,
        value: toPersianNumber(yearStats.totalCount || 0),
        icon: Mail,
        color: '#4f46e5',
        bgColor: '#eef2ff',
      },
      {
        key: 'with_research',
        label: `مرتبط با پژوهش (${yearLabel})`,
        value: toPersianNumber(yearStats.withResearch || 0),
        icon: BookOpen,
        color: '#7c3aed',
        bgColor: '#ede9fe',
      },
    ];
  }, [stats, selectedYear, yearStats]);

  // ============================================================
  // وضعیت بارگذاری
  // ============================================================
  if (isLoading) {
    return (
      <div className={`communication-stats ${className}`}>
        <div className="stats-grid">
          {[1, 2].map((i) => (
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
      <div className={`communication-stats ${className}`}>
        <div className="stats-error">
          <AlertCircle size={24} />
          <p>خطا در دریافت آمار مکاتبات</p>
        </div>
      </div>
    );
  }

  const isYearSelected = selectedYear !== 'all';

  return (
    <div className={`communication-stats ${className}`}>
      {/* ==========================================================
          بخش انتخاب سال (همانند ماژول‌های قبلی)
          ========================================================== */}
      <div className="stats-header">
        <div className="stats-title">
          <Mail size={20} />
          <h3>آمار مکاتبات</h3>
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
          توزیع بر اساس ماه
          ========================================================== */}
      <div className="stats-detail">
        <h4 className="stats-detail-title">
          <TrendingUp size={18} />
          توزیع بر اساس ماه
          {isYearSelected && <span className="year-badge">سال {selectedYear}</span>}
        </h4>
        <div className="status-stats">
          {Object.keys(filteredByMonth).length === 0 ? (
            <div className="empty-state-small">
              <span>هیچ مکاتبه‌ای در {isYearSelected ? `سال ${selectedYear}` : 'سال‌های انتخاب شده'} ثبت نشده است</span>
            </div>
          ) : (
            Object.entries(filteredByMonth)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([key, item]) => {
                const total = yearStats.totalCount || 1;
                const percentage = total > 0 ? ((item.count || 0) / total) * 100 : 0;
                return (
                  <div key={key} className="status-stat-item">
                    <div className="status-stat-info">
                      <span className="status-dot" style={{ backgroundColor: '#4f46e5' }} />
                      <span className="status-stat-name">{item.month_name}</span>
                    </div>
                    <div className="status-stat-bar">
                      <div
                        className="status-stat-fill"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: '#4f46e5',
                        }}
                      />
                    </div>
                    <span className="status-stat-count">{toPersianNumber(item.count)} مورد</span>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* ==========================================================
          توزیع بر اساس سال (نوارهای پیشرفت)
          ========================================================== */}
      {stats.by_year && Object.keys(stats.by_year).length > 0 && (
        <div className="stats-detail">
          <h4 className="stats-detail-title">
            <TrendingUp size={18} />
            توزیع بر اساس سال
          </h4>
          <div className="year-stats">
            {Object.entries(stats.by_year)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([year, data]) => {
                const count = typeof data === 'number' ? data : data.count;
                const maxCount = Math.max(...Object.values(stats.by_year).map(v => typeof v === 'number' ? v : v.count));
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
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
                      <div
                        className="year-stat-fill"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: isSelected ? '#4f46e5' : '#818cf8',
                        }}
                      />
                    </div>
                    <span className="year-stat-count">{toPersianNumber(count)}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <style>{`
        .communication-stats {
          margin-bottom: 20px;
        }

        /* --- هدر استات با انتخابگر سال --- */
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

        .year-badge {
          font-size: 12px;
          font-weight: 500;
          color: #4f46e5;
          background: #eef2ff;
          padding: 2px 10px;
          border-radius: 12px;
          margin-right: 8px;
        }

        /* --- کارت‌های آمار --- */
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

        /* --- بخش‌های جزییات --- */
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

        .status-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-stat-item {
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

        .status-stat-name {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a2e;
        }

        .status-stat-bar {
          flex: 1;
          height: 6px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
          min-width: 60px;
        }

        .status-stat-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .status-stat-count {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a2e;
          min-width: 80px;
          text-align: left;
        }

        /* --- سال --- */
        .year-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .year-stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .year-stat-item:hover .year-stat-fill {
          opacity: 0.8;
        }

        .year-stat-item.selected .year-label {
          color: #4f46e5;
          font-weight: 700;
        }

        .year-stat-item.selected .year-stat-count {
          color: #4f46e5;
          font-weight: 700;
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

        /* --- اسکلت --- */
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

        .empty-state-small {
          text-align: center;
          padding: 16px;
          color: #9ca3af;
          font-size: 13px;
        }

        @media (max-width: 768px) {
          .stats-header {
            flex-direction: column;
            align-items: stretch;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .status-stat-item {
            flex-wrap: wrap;
          }

          .status-stat-info {
            min-width: 80px;
          }

          .year-stat-item {
            flex-wrap: wrap;
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
        }
      `}</style>
    </div>
  );
};

export default CommunicationStats;