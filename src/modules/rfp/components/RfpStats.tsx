// src/modules/rfp/components/RfpStats.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useRfp } from '../hooks/useRfp';
import { FileText, DollarSign, TrendingUp, Calendar, PieChart, Loader2 } from 'lucide-react';
import { formatCurrency, toPersianNumber } from '../../../utils/formatter.utils';

interface RfpStatsProps {
  className?: string;
}

export const RfpStats: React.FC<RfpStatsProps> = ({ className = '' }) => {
  const { useStats } = useRfp();
  const { data: stats, isLoading, isError } = useStats();

  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  const availableYears = useMemo(() => {
    if (!stats?.by_year) return [];
    return stats.by_year
      .map((item) => item.year)
      .filter((year) => year > 0)
      .sort((a, b) => b - a);
  }, [stats]);

  useEffect(() => {
    if (selectedYear === 'all' && availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  if (isLoading) {
    return (
      <div className={`rfp-stats ${className}`}>
        <div className="stats-grid">
          {[1, 2, 3].map((i) => (
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
      <div className={`rfp-stats ${className}`}>
        <div className="stats-error">
          <p>خطا در دریافت آمار</p>
        </div>
      </div>
    );
  }

  const isYearSelected = selectedYear !== 'all';
  const yearStats = isYearSelected
    ? stats.by_year?.find((item) => item.year === selectedYear)
    : null;

  const totalCount = isYearSelected ? yearStats?.count || 0 : stats.total;
  const totalPrice = isYearSelected
    ? yearStats?.total_price || 0
    : stats.total_estimated_price;
  const averagePriceRaw  = isYearSelected
    ? yearStats?.count
      ? (yearStats.total_price || 0) / yearStats.count
      : 0
    : stats.average_estimated_price;
    const averagePrice = Math.round(averagePriceRaw);

  const statItems = [
    {
      key: 'total',
      label: isYearSelected
        ? `RFPهای سال ${toPersianNumber(selectedYear)}`
        : 'کل RFPها',
      value: toPersianNumber(totalCount),
      icon: FileText,
      color: '#4f46e5',
      bgColor: '#eef2ff',
    },
    {
      key: 'total_price',
      label: isYearSelected
        ? `مجموع مبلغ سال ${toPersianNumber(selectedYear)}`
        : 'مجموع مبلغ تخمینی',
      value: formatCurrency(totalPrice),
      icon: DollarSign,
      color: '#d97706',
      bgColor: '#fef3c7',
    },
    {
      key: 'average_price',
      label: isYearSelected
        ? `میانگین مبلغ سال ${toPersianNumber(selectedYear)}`
        : 'میانگین مبلغ تخمینی',
      value: formatCurrency(averagePrice),
      icon: TrendingUp,
      color: '#059669',
      bgColor: '#d1fae5',
    },
  ];

  return (
    <div className={`rfp-stats ${className}`}>
      {/* Header */}
      <div className="stats-header">
        <div className="stats-title">
          <PieChart size={20} />
          <h3>آمار RFPها</h3>
        </div>

        <div className="year-selector-wrapper">
          <Calendar size={16} className="year-selector-icon" />
          <select
            className="year-selector"
            value={selectedYear}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedYear(value === 'all' ? 'all' : Number(value));
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

      {/* Stat Cards */}
      <div className="stats-grid">
        {statItems.map((item) => (
          <div key={item.key} className="stat-card">
            <div
              className="stat-icon"
              style={{ background: item.bgColor, color: item.color }}
            >
              <item.icon size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{item.value}</span>
              <span className="stat-label">{item.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Year Distribution */}
      {stats.by_year && stats.by_year.length > 0 && (
        <div className="stats-detail">
          <h4 className="stats-detail-title">
            <PieChart size={18} />
            توزیع RFP بر اساس سال پژوهش مرتبط
          </h4>
          <div className="year-stats">
            {[...stats.by_year]
              .sort((a, b) => a.year - b.year)
              .map((item) => {
                const maxCount = Math.max(
                  ...stats.by_year.map((i) => i.count),
                  1
                );
                const percentage = (item.count / maxCount) * 100;
                const isSelected = selectedYear === item.year;

                return (
                  <div
                    key={item.year}
                    className={`year-stat-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedYear(item.year)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="year-label">
                      {toPersianNumber(item.year)}
                    </span>
                    <div className="year-stat-bar">
                      <div
                        className="year-stat-fill"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: isSelected ? '#4f46e5' : '#818cf8',
                        }}
                      />
                    </div>
                    <span className="year-stat-count">
                      {toPersianNumber(item.count)} RFP
                    </span>
                    <span className="year-stat-price">
                      {formatCurrency(item.total_price)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <style>{`
        .rfp-stats { margin-bottom: 20px; }
        .stats-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
        .stats-title { display: flex; align-items: center; gap: 8px; }
        .stats-title h3 { margin: 0; font-size: 18px; font-weight: 600; color: #1a1a2e; }
        .year-selector-wrapper { display: flex; align-items: center; gap: 8px; background: white; border: 1.5px solid #e9ecef; border-radius: 8px; padding: 4px 12px; transition: all 0.2s; }
        .year-selector-wrapper:focus-within { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
        .year-selector-icon { color: #6b7280; }
        .year-selector { padding: 6px 4px; border: none; background: transparent; font-size: 14px; font-weight: 500; color: #1a1a2e; outline: none; cursor: pointer; min-width: 100px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
        .stat-card { display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: white; border-radius: 12px; border: 1px solid #e9ecef; transition: all 0.2s ease; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .stat-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; }
        .stat-info { display: flex; flex-direction: column; min-width: 0; }
        .stat-value { font-size: 20px; font-weight: 700; color: #1a1a2e; line-height: 1.2; }
        .stat-label { font-size: 12px; color: #6b7280; }
        .skeleton .skeleton-icon { width: 40px; height: 40px; border-radius: 10px; background: #e9ecef; animation: shimmer 1.5s infinite; }
        .skeleton .skeleton-text { height: 16px; border-radius: 4px; background: #e9ecef; animation: shimmer 1.5s infinite; }
        .skeleton .skeleton-text:first-child { width: 60%; margin-bottom: 6px; }
        .skeleton .skeleton-text:last-child { width: 40%; }
        @keyframes shimmer { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .stats-detail { margin-top: 16px; padding: 16px 20px; background: white; border-radius: 12px; border: 1px solid #e9ecef; }
        .stats-detail-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #1a1a2e; margin: 0 0 12px 0; }
        .year-stats { display: flex; flex-direction: column; gap: 8px; }
        .year-stat-item { display: flex; align-items: center; gap: 12px; padding: 6px 10px; border-radius: 6px; transition: all 0.2s; }
        .year-stat-item:hover { background: #f8fafc; }
        .year-stat-item.selected { background: #eef2ff; border: 1px solid #c7d2fe; }
        .year-label { font-size: 13px; font-weight: 500; color: #1a1a2e; min-width: 50px; }
        .year-stat-item.selected .year-label { color: #4f46e5; font-weight: 700; }
        .year-stat-bar { flex: 1; height: 6px; background: #f3f4f6; border-radius: 4px; overflow: hidden; min-width: 60px; }
        .year-stat-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
        .year-stat-count { font-size: 13px; font-weight: 600; color: #1a1a2e; min-width: 60px; text-align: left; }
        .year-stat-item.selected .year-stat-count { color: #4f46e5; font-weight: 700; }
        .year-stat-price { font-size: 12px; font-weight: 500; color: #6b7280; min-width: 90px; text-align: left; }
        .stats-error { padding: 20px; text-align: center; color: #dc2626; background: #fee2e2; border-radius: 8px; }
        @media (max-width: 768px) {
          .stats-header { flex-direction: column; align-items: stretch; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .year-stat-item { flex-wrap: wrap; }
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

export default RfpStats;
// // src/modules/rfp/components/RfpStats.tsx

// import React, { useState, useEffect } from 'react';
// import { useRfp } from '../hooks/useRfp';
// import { FileText, DollarSign, TrendingUp, Calendar, PieChart } from 'lucide-react';
// import { formatCurrency } from '../../../utils/formatter.utils';

// interface RfpStatsProps {
//   className?: string;
// }

// export const RfpStats: React.FC<RfpStatsProps> = ({ className = '' }) => {
//   const { useStats } = useRfp();
//   const { data: stats, isLoading, isError } = useStats();

//   const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

//   const availableYears = React.useMemo(() => {
//     if (!stats || !stats.by_year) return [];
//     const years = stats.by_year
//       .map(item => item.year)
//       .filter(year => year > 0)
//       .sort((a, b) => b - a);
//     return years;
//   }, [stats]);

//   useEffect(() => {
//     if (selectedYear === 'all' && availableYears.length > 0) {
//       setSelectedYear(availableYears[0]);
//     }
//   }, [availableYears, selectedYear]);

//   const handleYearChange = (year: number | 'all') => {
//     setSelectedYear(year);
//   };

//   if (isLoading) {
//     return (
//       <div className={`rfp-stats ${className}`}>
//         <div className="stats-grid">
//           {[1, 2, 3].map((i) => (
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
//       <div className={`rfp-stats ${className}`}>
//         <div className="stats-error">
//           <p>خطا در دریافت آمار</p>
//         </div>
//       </div>
//     );
//   }

//   const isYearSelected = selectedYear !== 'all';
//   const yearStats = isYearSelected
//     ? stats.by_year?.find(item => item.year === selectedYear)
//     : null;

//   const totalCount = isYearSelected ? (yearStats?.count || 0) : stats.total;
//   const totalPrice = isYearSelected ? (yearStats?.total_price || 0) : stats.total_estimated_price;
//   const averagePrice = isYearSelected
//     ? (yearStats?.count || 0) > 0
//       ? (yearStats?.total_price || 0) / (yearStats?.count || 1)
//       : 0
//     : stats.average_estimated_price;

//   // ============================================================
//   // 🔥 کارت‌های آمار (۳ کارت)
//   // ============================================================
//   const statItems = [
//     {
//       key: 'total',
//       label: isYearSelected ? `کل RFPهای سال ${selectedYear}` : 'کل RFPها',
//       value: totalCount,
//       icon: FileText,
//       color: '#4f46e5',
//       bgColor: '#eef2ff',
//     },
//     {
//       key: 'total_price',
//       label: isYearSelected ? `مجموع مبلغ سال ${selectedYear}` : 'مجموع مبلغ تخمینی',
//       value: formatCurrency(totalPrice),
//       icon: DollarSign,
//       color: '#d97706',
//       bgColor: '#fef3c7',
//     },
//     {
//       key: 'average_price',
//       // 🔥 اضافه کردن سال به برچسب میانگین
//       label: isYearSelected ? `میانگین مبلغ سال ${selectedYear}` : 'میانگین مبلغ تخمینی',
//       value: formatCurrency(averagePrice),
//       icon: TrendingUp,
//       color: '#059669',
//       bgColor: '#d1fae5',
//     },
//   ];

//   return (
//     <div className={`rfp-stats ${className}`}>
//       {/* Header با انتخاب سال */}
//       <div className="stats-header">
//         <div className="stats-title">
//           <PieChart size={20} />
//           <h3>آمار RFPها</h3>
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

//       {/* ۳ کارت آمار */}
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

//       {/* توزیع بر اساس سال */}
//       {stats.by_year && stats.by_year.length > 0 && (
//         <div className="stats-detail">
//           <h4 className="stats-detail-title">
//             <PieChart size={18} />
//             توزیع RFP بر اساس سال پژوهش مرتبط
//           </h4>
//           <div className="year-stats">
//             {stats.by_year
//               .sort((a, b) => a.year - b.year)
//               .map((item) => {
//                 const maxCount = Math.max(...stats.by_year.map(i => i.count), 1);
//                 const percentage = (item.count / maxCount) * 100;
//                 const isSelected = selectedYear === item.year;

//                 return (
//                   <div
//                     key={item.year}
//                     className={`year-stat-item ${isSelected ? 'selected' : ''}`}
//                     onClick={() => handleYearChange(item.year)}
//                     style={{ cursor: 'pointer' }}
//                   >
//                     <span className="year-label">{item.year}</span>
//                     <div className="year-stat-bar">
//                       <div
//                         className="year-stat-fill"
//                         style={{
//                           width: `${percentage}%`,
//                           backgroundColor: isSelected ? '#4f46e5' : '#818cf8',
//                         }}
//                       />
//                     </div>
//                     <span className="year-stat-count">{item.count} RFP</span>
//                     <span className="year-stat-price">{formatCurrency(item.total_price)}</span>
//                   </div>
//                 );
//               })}
//           </div>
//         </div>
//       )}

//       {/* استایل‌ها - بدون تغییر */}
//       <style>{`
//         .rfp-stats {
//           margin-bottom: 20px;
//         }
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
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
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
//         .skeleton .skeleton-text:first-child {
//           width: 60%;
//           margin-bottom: 6px;
//         }
//         .skeleton .skeleton-text:last-child {
//           width: 40%;
//         }
//         @keyframes shimmer {
//           0% { opacity: 1; }
//           50% { opacity: 0.5; }
//           100% { opacity: 1; }
//         }
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
//         .year-stats {
//           display: flex;
//           flex-direction: column;
//           gap: 8px;
//         }
//         .year-stat-item {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           padding: 6px 10px;
//           border-radius: 6px;
//           transition: all 0.2s;
//         }
//         .year-stat-item:hover {
//           background: #f8fafc;
//         }
//         .year-stat-item.selected {
//           background: #eef2ff;
//           border: 1px solid #c7d2fe;
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
//         .year-stat-bar {
//           flex: 1;
//           height: 6px;
//           background: #f3f4f6;
//           border-radius: 4px;
//           overflow: hidden;
//           min-width: 60px;
//         }
//         .year-stat-fill {
//           height: 100%;
//           border-radius: 4px;
//           transition: width 0.6s ease;
//         }
//         .year-stat-count {
//           font-size: 13px;
//           font-weight: 600;
//           color: #1a1a2e;
//           min-width: 50px;
//           text-align: left;
//         }
//         .year-stat-item.selected .year-stat-count {
//           color: #4f46e5;
//           font-weight: 700;
//         }
//         .year-stat-price {
//           font-size: 12px;
//           font-weight: 500;
//           color: #6b7280;
//           min-width: 80px;
//           text-align: left;
//         }
//         .stats-error {
//           padding: 20px;
//           text-align: center;
//           color: #dc2626;
//           background: #fee2e2;
//           border-radius: 8px;
//         }
//         @media (max-width: 768px) {
//           .stats-header {
//             flex-direction: column;
//             align-items: stretch;
//           }
//           .stats-grid {
//             grid-template-columns: 1fr 1fr;
//           }
//           .year-stat-item {
//             flex-wrap: wrap;
//           }
//           .year-stat-price {
//             min-width: 60px;
//             font-size: 11px;
//           }
//         }
//         @media (max-width: 480px) {
//           .stats-grid {
//             grid-template-columns: 1fr;
//           }
//           .year-selector-wrapper {
//             width: 100%;
//           }
//           .year-selector {
//             flex: 1;
//             min-width: 0;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default RfpStats;

