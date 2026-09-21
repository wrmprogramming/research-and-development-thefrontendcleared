// src/modules/contract/components/ContractStats.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { useContract } from '../hooks/useContract';
import { CONTRACT_STATUSES, type ContractStatus } from '../types/contract.types';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Building2,
  GraduationCap,
  Calendar,
} from 'lucide-react';
// ✅ فقط از formatter.utils استفاده کن — تابع محلی حذف شد
import { formatCurrency, toPersianNumber } from '../../../utils/formatter.utils';

interface ContractStatsProps {
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

export const ContractStats: React.FC<ContractStatsProps> = ({ className = '' }) => {
  const { useStats } = useContract();

  // --- State برای انتخاب سال ---
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  // ✅ دریافت استات با پارامتر سال
  const yearParam = selectedYear === 'all' ? undefined : selectedYear;
  const { data: stats, isLoading, isError } = useStats(yearParam);

  // --- لیست سال‌های موجود ---
  const availableYears = useMemo(() => {
    if (!stats?.by_year) return [];
    return Object.keys(stats.by_year)
      .map(Number)
      .filter(year => !isNaN(year) && year > 0)
      .sort((a, b) => b - a);
  }, [stats]);

  // --- تعیین سال پیش‌فرض (آخرین سال) ---
  useEffect(() => {
    if (selectedYear === 'all' && availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  // --- هندلر تغییر سال ---
  const handleYearChange = (year: number | 'all') => {
    setSelectedYear(year);
  };

  // --- وضعیت بارگذاری ---
  if (isLoading) {
    return (
      <div className={`contract-stats ${className}`}>
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
      <div className={`contract-stats ${className}`}>
        <div className="stats-error">
          <AlertCircle size={24} />
          <p>خطا در دریافت آمار قراردادها</p>
        </div>
      </div>
    );
  }

  // --- تعیین داده‌های نمایشی ---
  const isYearSelected = selectedYear !== 'all';

  const totalCount = stats.total || 0;
  const activeCount = stats.active || 0;
  const completedCount = stats.completed || 0;
  const totalAmount = stats.total_amount || 0;

  // --- کارت‌های آمار اصلی ---
  const statItems = [
    {
      key: 'total',
      label: isYearSelected
        ? `قراردادهای سال ${toPersianNumber(selectedYear)}`
        : 'کل قراردادها',
      value: toPersianNumber(totalCount),
      icon: FileText,
      color: '#4f46e5',
      bgColor: '#eef2ff',
    },
    {
      key: 'active',
      label: 'جاری',
      value: toPersianNumber(activeCount),
      icon: Clock,
      color: '#2563eb',
      bgColor: '#dbeafe',
    },
    {
      key: 'completed',
      label: 'خاتمه یافته',
      value: toPersianNumber(completedCount),
      icon: CheckCircle,
      color: '#059669',
      bgColor: '#d1fae5',
    },
    {
      key: 'total_amount',
      label: 'مبلغ کل قراردادها',
      value: formatCurrency(totalAmount),
      icon: DollarSign,
      color: '#d97706',
      bgColor: '#fef3c7',
    },
  ];

  return (
    <div className={`contract-stats ${className}`}>
      {/* ==========================================================
          بخش انتخاب سال
          ========================================================== */}
      <div className="stats-header">
        <div className="stats-title">
          <FileText size={20} />
          <h3>آمار قراردادها</h3>
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
          توزیع بر اساس وضعیت
          ========================================================== */}
      {stats.by_status && Object.keys(stats.by_status).length > 0 && (
        <div className="stats-detail">
          <h4 className="stats-detail-title">
            <TrendingUp size={18} />
            توزیع بر اساس وضعیت
            {isYearSelected && (
              <span className="year-badge">سال {toPersianNumber(selectedYear)}</span>
            )}
          </h4>
          <div className="status-stats">
            {Object.entries(stats.by_status).map(([status, count]) => {
              const statusInfo = CONTRACT_STATUSES[status as ContractStatus];
              if (!statusInfo) return null;
              const percentage = totalCount > 0 ? (Number(count) / totalCount) * 100 : 0;
              return (
                <div key={status} className="status-stat-item">
                  <div className="status-stat-info">
                    <span className="status-dot" style={{ backgroundColor: statusInfo.color }} />
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
                  <span className="status-stat-count">{toPersianNumber(Number(count))}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==========================================================
          توزیع بر اساس نوع همکار
          ========================================================== */}
      {stats.by_affiliation && stats.by_affiliation.length > 0 && (
        <div className="stats-detail">
          <h4 className="stats-detail-title">
            <Building2 size={18} />
            توزیع بر اساس نوع همکار
            {isYearSelected && (
              <span className="year-badge">سال {toPersianNumber(selectedYear)}</span>
            )}
          </h4>
          <div className="affiliation-stats">
            {stats.by_affiliation.map((item) => {
              const percentage = totalCount > 0 ? (Number(item.count) / totalCount) * 100 : 0;
              const isUniversity = item.affiliation_type === 'UNIVERSITY';
              return (
                <div key={item.affiliation_type} className="affiliation-stat-item">
                  <div className="affiliation-stat-info">
                    <span className="affiliation-icon">
                      {isUniversity ? <GraduationCap size={16} /> : <Building2 size={16} />}
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
                  <span className="affiliation-stat-count">
                    {toPersianNumber(Number(item.count))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==========================================================
          آمار بر اساس سال (نوارهای پیشرفت)
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
              .map(([year, count]) => {
                const maxCount = getMaxValue(stats.by_year);
                const percentage = getPercentage(count, maxCount);
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
                    <span className="year-stat-count">{toPersianNumber(Number(count))}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ==========================================================
          مبلغ بر اساس سال
          ========================================================== */}
      {stats.amount_by_year && Object.keys(stats.amount_by_year).length > 0 && (
        <div className="stats-detail">
          <h4 className="stats-detail-title">
            <DollarSign size={18} />
            مبلغ قراردادها بر اساس سال
          </h4>
          <div className="year-amount-stats">
            {Object.entries(stats.amount_by_year)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([year, amount]) => {
                const maxAmount = getMaxValue(stats.amount_by_year);
                const percentage = getPercentage(amount, maxAmount);
                return (
                  <div key={year} className="year-amount-item">
                    <span className="year-label">{toPersianNumber(Number(year))}</span>
                    <div className="year-amount-bar">
                      <div
                        className="year-amount-fill"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: '#d97706',
                        }}
                      />
                    </div>
                    <span className="year-amount-value">
                      {formatCurrency(Number(amount))}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <style>{`
        .contract-stats { margin-bottom: 20px; }
        
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
        .skeleton .skeleton-text:first-child { width: 60%; margin-bottom: 6px; }
        .skeleton .skeleton-text:last-child { width: 40%; }
        @keyframes shimmer { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

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

        .status-stats, .affiliation-stats, .year-stats, .year-amount-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-stat-item, .affiliation-stat-item, .year-stat-item, .year-amount-item {
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

        .status-stat-name, .affiliation-stat-name {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a2e;
        }

        .status-stat-bar, .affiliation-stat-bar, .year-stat-bar, .year-amount-bar {
          flex: 1;
          height: 6px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
          min-width: 60px;
        }

        .status-stat-fill, .affiliation-stat-fill, .year-stat-fill, .year-amount-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .status-stat-count, .affiliation-stat-count, .year-stat-count {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a2e;
          min-width: 30px;
          text-align: left;
        }

        .year-amount-value {
          font-size: 13px;
          font-weight: 600;
          color: #d97706;
          min-width: 100px;
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

        .stats-error p { margin: 0; font-weight: 500; }

        @media (max-width: 768px) {
          .stats-header {
            flex-direction: column;
            align-items: stretch;
          }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .status-stat-item, .affiliation-stat-item, .year-stat-item, .year-amount-item { flex-wrap: wrap; }
          .status-stat-info { min-width: 80px; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
          .year-selector-wrapper { width: 100%; }
          .year-selector { flex: 1; min-width: 0; }
        }
      `}</style>
    </div>
  );
};

export default ContractStats;

// // src/modules/contract/components/ContractStats.tsx

// import React, { useState, useMemo, useEffect } from 'react';
// import { useContract } from '../hooks/useContract';
// import { CONTRACT_STATUSES, type ContractStatus } from '../types/contract.types';
// import { 
//   FileText, 
//   CheckCircle, 
//   Clock, 
//   DollarSign, 
//   TrendingUp, 
//   AlertCircle,
//   Building2,
//   GraduationCap,
//   Calendar,
//   Loader2,
// } from 'lucide-react';
// import { formatCurrency, toPersianNumber } from '../../../utils/formatter.utils';
// interface ContractStatsProps {
//   className?: string;
// }

// // ========== تابع تبدیل اعداد به فارسی ==========
// const toPersianNumber = (num: number): string => {
//   if (num === undefined || num === null) return '۰';
//   const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
//   return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
// };

// // ========== تابع کمکی برای محاسبه ماکزیمم ==========
// const getMaxValue = (obj: Record<string, any>): number => {
//   const values = Object.values(obj).map(v => Number(v));
//   return values.length > 0 ? Math.max(...values) : 0;
// };

// // ========== تابع کمکی برای محاسبه درصد ==========
// const getPercentage = (value: any, maxValue: number): number => {
//   return maxValue > 0 ? (Number(value) / maxValue) * 100 : 0;
// };

// export const ContractStats: React.FC<ContractStatsProps> = ({ className = '' }) => {
//   const { useStats } = useContract();

//   // --- State برای انتخاب سال ---
//   const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

//   // ✅ دریافت استات با پارامتر سال
//   const yearParam = selectedYear === 'all' ? undefined : selectedYear;
//   const { data: stats, isLoading, isError, refetch } = useStats(yearParam);

//   // --- لیست سال‌های موجود ---
//   const availableYears = useMemo(() => {
//     if (!stats?.by_year) return [];
//     return Object.keys(stats.by_year)
//       .map(Number)
//       .filter(year => !isNaN(year) && year > 0)
//       .sort((a, b) => b - a);
//   }, [stats]);

//   // --- تعیین سال پیش‌فرض (آخرین سال) ---
//   useEffect(() => {
//     if (selectedYear === 'all' && availableYears.length > 0) {
//       setSelectedYear(availableYears[0]);
//     }
//   }, [availableYears, selectedYear]);

//   // --- هندلر تغییر سال ---
//   const handleYearChange = (year: number | 'all') => {
//     setSelectedYear(year);
//   };

//   // --- وضعیت بارگذاری ---
//   if (isLoading) {
//     return (
//       <div className={`contract-stats ${className}`}>
//         <div className="stats-grid">
//           {[1, 2, 3, 4, 5].map((i) => (
//             <div key={i} className="stat-card skeleton">
//               <div className="stat-icon skeleton-icon" />
//               <div className="stat-info">
//                 <div className="stat-value skeleton-text" />
//                 <div className="stat-label skeleton-text" />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (isError || !stats) {
//     return (
//       <div className={`contract-stats ${className}`}>
//         <div className="stats-error">
//           <AlertCircle size={24} />
//           <p>خطا در دریافت آمار قراردادها</p>
//         </div>
//       </div>
//     );
//   }

//   // --- تعیین داده‌های نمایشی ---
//   const isYearSelected = selectedYear !== 'all';
//   const displayStats = stats;

//   const totalCount = displayStats.total || 0;
//   const activeCount = displayStats.active || 0;
//   const completedCount = displayStats.completed || 0;
//   const terminatedCount = displayStats.terminated || 0;
//   const draftCount = displayStats.draft || 0;
//   const totalAmount = displayStats.total_amount || 0;

//   // --- کارت‌های آمار اصلی ---
//   const statItems = [
//     {
//       key: 'total',
//       label: isYearSelected ? `قراردادهای سال ${selectedYear}` : 'کل قراردادها',
//       value: toPersianNumber(totalCount),
//       icon: FileText,
//       color: '#4f46e5',
//       bgColor: '#eef2ff',
//     },
//     {
//       key: 'active',
//       label: 'جاری',
//       value: toPersianNumber(activeCount),
//       icon: Clock,
//       color: '#2563eb',
//       bgColor: '#dbeafe',
//     },
//     {
//       key: 'completed',
//       label: 'خاتمه یافته',
//       value: toPersianNumber(completedCount),
//       icon: CheckCircle,
//       color: '#059669',
//       bgColor: '#d1fae5',
//     },
//     {
//       key: 'total_amount',
//       label: 'مبلغ کل قراردادها',
//       value: formatCurrency(totalAmount),
//       icon: DollarSign,
//       color: '#d97706',
//       bgColor: '#fef3c7',
//     },
//   ];

//   return (
//     <div className={`contract-stats ${className}`}>
//       {/* ==========================================================
//           بخش انتخاب سال
//           ========================================================== */}
//       <div className="stats-header">
//         <div className="stats-title">
//           <FileText size={20} />
//           <h3>آمار قراردادها</h3>
//         </div>
        
//         <div className="year-selector-wrapper">
//           <Calendar size={16} className="year-selector-icon" />
//           <select
//             className="year-selector"
//             value={selectedYear}
//             onChange={(e) => {
//               const value = e.target.value;
//               if (value === 'all') {
//                 handleYearChange('all');
//               } else {
//                 handleYearChange(Number(value));
//               }
//             }}
//           >
//             <option value="all">همه سال‌ها</option>
//             {availableYears.map((year) => (
//               <option key={year} value={year}>
//                 {year}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* ==========================================================
//           کارت‌های آمار اصلی
//           ========================================================== */}
//       <div className="stats-grid">
//         {statItems.map((item) => (
//           <div key={item.key} className="stat-card">
//             <div className="stat-icon" style={{ background: item.bgColor, color: item.color }}>
//               <item.icon size={20} />
//             </div>
//             <div className="stat-info">
//               <span className="stat-value">{item.value}</span>
//               <span className="stat-label">{item.label}</span>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ==========================================================
//           توزیع بر اساس وضعیت
//           ========================================================== */}
//       {(displayStats.by_status && Object.keys(displayStats.by_status).length > 0) && (
//         <div className="stats-detail">
//           <h4 className="stats-detail-title">
//             <TrendingUp size={18} />
//             توزیع بر اساس وضعیت
//             {isYearSelected && <span className="year-badge">سال {selectedYear}</span>}
//           </h4>
//           <div className="status-stats">
//             {Object.entries(displayStats.by_status).map(([status, count]) => {
//               const statusInfo = CONTRACT_STATUSES[status as ContractStatus];
//               if (!statusInfo) return null;
//               const percentage = totalCount > 0 ? (Number(count) / totalCount) * 100 : 0;
//               return (
//                 <div key={status} className="status-stat-item">
//                   <div className="status-stat-info">
//                     <span className="status-dot" style={{ backgroundColor: statusInfo.color }} />
//                     <span className="status-stat-name">{statusInfo.label}</span>
//                   </div>
//                   <div className="status-stat-bar">
//                     <div className="status-stat-fill" style={{
//                       width: `${percentage}%`,
//                       backgroundColor: statusInfo.color,
//                     }} />
//                   </div>
//                   <span className="status-stat-count">{toPersianNumber(Number(count))}</span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* ==========================================================
//           توزیع بر اساس نوع همکار
//           ========================================================== */}
//       {(displayStats.by_affiliation && displayStats.by_affiliation.length > 0) && (
//         <div className="stats-detail">
//           <h4 className="stats-detail-title">
//             <Building2 size={18} />
//             توزیع بر اساس نوع همکار
//             {isYearSelected && <span className="year-badge">سال {selectedYear}</span>}
//           </h4>
//           <div className="affiliation-stats">
//             {displayStats.by_affiliation.map((item) => {
//               const percentage = totalCount > 0 ? (Number(item.count) / totalCount) * 100 : 0;
//               const isUniversity = item.affiliation_type === 'UNIVERSITY';
//               return (
//                 <div key={item.affiliation_type} className="affiliation-stat-item">
//                   <div className="affiliation-stat-info">
//                     <span className="affiliation-icon">
//                       {isUniversity ? (
//                         <GraduationCap size={16} />
//                       ) : (
//                         <Building2 size={16} />
//                       )}
//                     </span>
//                     <span className="affiliation-stat-name">
//                       {isUniversity ? 'دانشگاه' : 'شرکت'}
//                     </span>
//                   </div>
//                   <div className="affiliation-stat-bar">
//                     <div className="affiliation-stat-fill" style={{
//                       width: `${percentage}%`,
//                       backgroundColor: isUniversity ? '#8b5cf6' : '#ec4899',
//                     }} />
//                   </div>
//                   <span className="affiliation-stat-count">{toPersianNumber(Number(item.count))}</span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* ==========================================================
//           آمار بر اساس سال (نوارهای پیشرفت)
//           ========================================================== */}
//       {stats.by_year && Object.keys(stats.by_year).length > 0 && (
//         <div className="stats-detail">
//           <h4 className="stats-detail-title">
//             <TrendingUp size={18} />
//             توزیع بر اساس سال
//           </h4>
//           <div className="year-stats">
//             {Object.entries(stats.by_year)
//               .sort((a, b) => Number(a[0]) - Number(b[0]))
//               .map(([year, count]) => {
//                 const maxCount = getMaxValue(stats.by_year);
//                 const percentage = getPercentage(count, maxCount);
//                 const isSelected = selectedYear === Number(year);
//                 return (
//                   <div 
//                     key={year} 
//                     className={`year-stat-item ${isSelected ? 'selected' : ''}`}
//                     onClick={() => handleYearChange(Number(year))}
//                     style={{ cursor: 'pointer' }}
//                   >
//                     <span className="year-label">{toPersianNumber(Number(year))}</span>
//                     <div className="year-stat-bar">
//                       <div className="year-stat-fill" style={{
//                         width: `${percentage}%`,
//                         backgroundColor: isSelected ? '#4f46e5' : '#818cf8',
//                       }} />
//                     </div>
//                     <span className="year-stat-count">{toPersianNumber(Number(count))}</span>
//                   </div>
//                 );
//               })}
//           </div>
//         </div>
//       )}

//       {/* ==========================================================
//           مبلغ بر اساس سال
//           ========================================================== */}
//       {stats.amount_by_year && Object.keys(stats.amount_by_year).length > 0 && (
//         <div className="stats-detail">
//           <h4 className="stats-detail-title">
//             <DollarSign size={18} />
//             مبلغ قراردادها بر اساس سال
//           </h4>
//           <div className="year-amount-stats">
//             {Object.entries(stats.amount_by_year)
//               .sort((a, b) => Number(a[0]) - Number(b[0]))
//               .map(([year, amount]) => {
//                 const maxAmount = getMaxValue(stats.amount_by_year);
//                 const percentage = getPercentage(amount, maxAmount);
//                 return (
//                   <div key={year} className="year-amount-item">
//                     <span className="year-label">{toPersianNumber(Number(year))}</span>
//                     <div className="year-amount-bar">
//                       <div className="year-amount-fill" style={{
//                         width: `${percentage}%`,
//                         backgroundColor: '#d97706',
//                       }} />
//                     </div>
//                     <span className="year-amount-value">{formatCurrency(Number(amount))}</span>
//                   </div>
//                 );
//               })}
//           </div>
//         </div>
//       )}

//       <style>{`
//         .contract-stats { margin-bottom: 20px; }
        
//         /* --- هدر استات با انتخابگر سال --- */
//         .stats-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 16px;
//           flex-wrap: wrap;
//           gap: 12px;
//         }

//         .stats-title {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//         }

//         .stats-title h3 {
//           margin: 0;
//           font-size: 18px;
//           font-weight: 600;
//           color: #1a1a2e;
//         }

//         .year-selector-wrapper {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           background: white;
//           border: 1.5px solid #e9ecef;
//           border-radius: 8px;
//           padding: 4px 12px;
//           transition: all 0.2s;
//         }

//         .year-selector-wrapper:focus-within {
//           border-color: #4f46e5;
//           box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
//         }

//         .year-selector-icon {
//           color: #6b7280;
//         }

//         .year-selector {
//           padding: 6px 4px;
//           border: none;
//           background: transparent;
//           font-size: 14px;
//           font-weight: 500;
//           color: #1a1a2e;
//           outline: none;
//           cursor: pointer;
//           min-width: 100px;
//         }

//         .year-selector option {
//           padding: 4px 8px;
//         }

//         .spinner {
//           animation: spin 1s linear infinite;
//           color: #4f46e5;
//         }

//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }

//         .year-badge {
//           font-size: 12px;
//           font-weight: 500;
//           color: #4f46e5;
//           background: #eef2ff;
//           padding: 2px 10px;
//           border-radius: 12px;
//           margin-right: 8px;
//         }

//         .stats-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
//           gap: 12px;
//         }

//         .stat-card {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           padding: 14px 18px;
//           background: white;
//           border-radius: 12px;
//           border: 1px solid #e9ecef;
//           transition: all 0.2s ease;
//         }

//         .stat-card:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 4px 12px rgba(0,0,0,0.06);
//         }

//         .stat-icon {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 40px;
//           height: 40px;
//           border-radius: 10px;
//           flex-shrink: 0;
//         }

//         .stat-info {
//           display: flex;
//           flex-direction: column;
//           min-width: 0;
//         }

//         .stat-value {
//           font-size: 20px;
//           font-weight: 700;
//           color: #1a1a2e;
//           line-height: 1.2;
//         }

//         .stat-label {
//           font-size: 12px;
//           color: #6b7280;
//         }

//         /* --- اسکلت --- */
//         .skeleton .skeleton-icon {
//           width: 40px;
//           height: 40px;
//           border-radius: 10px;
//           background: #e9ecef;
//           animation: shimmer 1.5s infinite;
//         }
//         .skeleton .skeleton-text {
//           height: 16px;
//           border-radius: 4px;
//           background: #e9ecef;
//           animation: shimmer 1.5s infinite;
//         }
//         .skeleton .skeleton-text:first-child { width: 60%; margin-bottom: 6px; }
//         .skeleton .skeleton-text:last-child { width: 40%; }
//         @keyframes shimmer { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

//         /* --- بخش‌های جزییات --- */
//         .stats-detail {
//           margin-top: 16px;
//           padding: 16px 20px;
//           background: white;
//           border-radius: 12px;
//           border: 1px solid #e9ecef;
//         }

//         .stats-detail-title {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           font-size: 14px;
//           font-weight: 600;
//           color: #1a1a2e;
//           margin: 0 0 12px 0;
//         }

//         /* --- وضعیت --- */
//         .status-stats, .affiliation-stats, .year-stats, .year-amount-stats {
//           display: flex;
//           flex-direction: column;
//           gap: 8px;
//         }

//         .status-stat-item, .affiliation-stat-item, .year-stat-item, .year-amount-item {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }

//         .status-stat-info {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           min-width: 100px;
//         }

//         .status-dot {
//           width: 10px;
//           height: 10px;
//           border-radius: 50%;
//           flex-shrink: 0;
//         }

//         .status-stat-name, .affiliation-stat-name {
//           font-size: 13px;
//           font-weight: 500;
//           color: #1a1a2e;
//         }

//         .status-stat-bar, .affiliation-stat-bar, .year-stat-bar, .year-amount-bar {
//           flex: 1;
//           height: 6px;
//           background: #f3f4f6;
//           border-radius: 4px;
//           overflow: hidden;
//           min-width: 60px;
//         }

//         .status-stat-fill, .affiliation-stat-fill, .year-stat-fill, .year-amount-fill {
//           height: 100%;
//           border-radius: 4px;
//           transition: width 0.6s ease;
//         }

//         .status-stat-count, .affiliation-stat-count, .year-stat-count {
//           font-size: 13px;
//           font-weight: 600;
//           color: #1a1a2e;
//           min-width: 30px;
//           text-align: left;
//         }

//         .year-amount-value {
//           font-size: 13px;
//           font-weight: 600;
//           color: #d97706;
//           min-width: 100px;
//           text-align: left;
//         }

//         .year-label {
//           font-size: 13px;
//           font-weight: 500;
//           color: #1a1a2e;
//           min-width: 50px;
//         }

//         .year-stat-item.selected .year-label {
//           color: #4f46e5;
//           font-weight: 700;
//         }

//         .year-stat-item.selected .year-stat-count {
//           color: #4f46e5;
//           font-weight: 700;
//         }

//         .affiliation-icon {
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           width: 24px;
//           height: 24px;
//           border-radius: 4px;
//           background: #f3f4f6;
//           color: #6b7280;
//         }

//         .stats-error {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 30px;
//           background: #fee2e2;
//           border-radius: 12px;
//           color: #dc2626;
//           gap: 8px;
//         }

//         .stats-error p { margin: 0; font-weight: 500; }

//         @media (max-width: 768px) {
//           .stats-header {
//             flex-direction: column;
//             align-items: stretch;
//           }
//           .stats-grid { grid-template-columns: 1fr 1fr; }
//           .status-stat-item, .affiliation-stat-item, .year-stat-item, .year-amount-item { flex-wrap: wrap; }
//           .status-stat-info { min-width: 80px; }
//         }
//         @media (max-width: 480px) {
//           .stats-grid { grid-template-columns: 1fr; }
//           .year-selector-wrapper { width: 100%; }
//           .year-selector { flex: 1; min-width: 0; }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ContractStats;

