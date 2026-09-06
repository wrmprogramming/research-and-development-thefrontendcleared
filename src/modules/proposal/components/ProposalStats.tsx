// src/modules/proposal/components/ProposalStats.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useProposal } from '../hooks/useProposal';
import { FileText, Trophy, XCircle, Building2, TrendingUp, Calendar, PieChart, ChevronDown, ChevronUp } from 'lucide-react';

interface ProposalStatsProps {
  className?: string;
}

export const ProposalStats: React.FC<ProposalStatsProps> = ({ className = '' }) => {
  const { useStats } = useProposal();
  const { data: stats, isLoading, isError } = useStats();

  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [showAllRfp, setShowAllRfp] = useState(false);
  const [showAllUniversity, setShowAllUniversity] = useState(false);

  // ============================================================
  // 🔥 همه useMemoها قبل از هر return شرطی
  // ============================================================
  
  // 1. لیست سال‌های موجود
  const availableYears = useMemo(() => {
    if (!stats?.by_year) return [];
    const years = stats.by_year
      .map(item => item.year)
      .filter(year => year > 0)
      .sort((a, b) => b - a);
    return years;
  }, [stats]);

  // 2. محاسبه آمار بر اساس سال انتخاب شده
  const isYearSelected = selectedYear !== 'all';
  const yearStats = isYearSelected
    ? stats?.by_year?.find(item => item.year === selectedYear)
    : null;

  const totalCount = isYearSelected ? (yearStats?.count || 0) : (stats?.total || 0);
  const winnerCount = isYearSelected ? (yearStats?.winner_count || 0) : (stats?.winner_count || 0);
  const notWinnerCount = isYearSelected
    ? (yearStats?.count || 0) - (yearStats?.winner_count || 0)
    : (stats?.not_winner_count || 0);

  // 3. محاسبه تعداد RFPهای مرتبط
  const rfpCount = useMemo(() => {
    if (isYearSelected && stats?.total_by_rfp) {
      return stats.total_by_rfp.filter(rfp => rfp.year === selectedYear).length || 0;
    }
    return stats?.total_by_rfp?.length || 0;
  }, [isYearSelected, stats, selectedYear]);  // ✅ stats به جای stats?.total_by_rfp

  // 4. فیلتر کردن داده‌های RFP بر اساس سال
  const filteredRfpData = useMemo(() => {
    if (!stats?.total_by_rfp) return [];
    if (isYearSelected) {
      return stats.total_by_rfp.filter(item => item.year === selectedYear);
    }
    return stats.total_by_rfp;
  }, [stats, selectedYear, isYearSelected]);  // ✅ stats به جای stats?.total_by_rfp

  // 5. فیلتر کردن داده‌های دانشگاه
  const filteredUniversityData = useMemo(() => {
    if (!stats?.total_by_university) return [];
    return stats.total_by_university;
  }, [stats]);  // ✅ stats به جای stats?.total_by_university

  // 6. نمایش ۵ آیتم اول یا همه
  const DISPLAY_LIMIT = 5;
  const rfpDataToShow = showAllRfp ? filteredRfpData : filteredRfpData.slice(0, DISPLAY_LIMIT);
  const universityDataToShow = showAllUniversity ? filteredUniversityData : filteredUniversityData.slice(0, DISPLAY_LIMIT);

  // 7. کارت‌های آمار (۴ کارت)
  const statItems = [
    {
      key: 'total',
      label: isYearSelected ? `کل پروپوزال‌های سال ${selectedYear}` : 'کل پروپوزال‌ها',
      value: totalCount,
      icon: FileText,
      color: '#4f46e5',
      bgColor: '#eef2ff',
    },
    {
      key: 'winner',
      label: isYearSelected ? `برنده‌های سال ${selectedYear}` : 'برنده',
      value: winnerCount,
      icon: Trophy,
      color: '#059669',
      bgColor: '#d1fae5',
    },
    {
      key: 'not_winner',
      label: isYearSelected ? `غیربرنده‌های سال ${selectedYear}` : 'غیربرنده',
      value: notWinnerCount,
      icon: XCircle,
      color: '#dc2626',
      bgColor: '#fee2e2',
    },
    {
      key: 'rfp_count',
      label: isYearSelected ? `تعداد RFPهای مرتبط با سال ${selectedYear}` : 'تعداد RFPهای مرتبط',
      value: rfpCount,
      icon: TrendingUp,
      color: '#d97706',
      bgColor: '#fef3c7',
    },
  ];

  // ============================================================
  // ⚠️ useEffect باید بعد از همه useMemoها بیاید
  // ============================================================
  useEffect(() => {
    if (selectedYear === 'all' && availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  // ============================================================
  // ✅ حالا returnهای شرطی می‌آیند (بعد از همه هوک‌ها)
  // ============================================================
  if (isLoading) {
    return (
      <div className={`proposal-stats ${className}`}>
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
      <div className={`proposal-stats ${className}`}>
        <div className="stats-error">
          <p>خطا در دریافت آمار</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // هندلرها (بعد از returnهای شرطی)
  // ============================================================
  const handleYearChange = (year: number | 'all') => {
    setSelectedYear(year);
    setShowAllRfp(false);
    setShowAllUniversity(false);
  };

  return (
    <div className={`proposal-stats ${className}`}>
      {/* ==========================================================
           Header با انتخاب سال
          ========================================================== */}
      <div className="stats-header">
        <div className="stats-title">
          <PieChart size={20} />
          <h3>آمار پروپوزال‌ها</h3>
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
           کارت‌های آمار
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
           توزیع بر اساس سال
          ========================================================== */}
      {stats.by_year && stats.by_year.length > 0 && (
        <div className="stats-detail">
          <h4 className="stats-detail-title">
            <PieChart size={18} />
            توزیع پروپوزال بر اساس سال
          </h4>
          <div className="year-stats">
            {stats.by_year
              .sort((a, b) => a.year - b.year)
              .map((item) => {
                const maxCount = Math.max(...stats.by_year.map(i => i.count), 1);
                const percentage = (item.count / maxCount) * 100;
                const isSelected = selectedYear === item.year;
                const winRate = item.count > 0 ? Math.round((item.winner_count / item.count) * 100) : 0;

                return (
                  <div
                    key={item.year}
                    className={`year-stat-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleYearChange(item.year)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="year-label">{item.year}</span>
                    <div className="year-stat-bar">
                      <div
                        className="year-stat-fill"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: isSelected ? '#4f46e5' : '#818cf8',
                        }}
                      />
                    </div>
                    <span className="year-stat-count">{item.count} پروپوزال</span>
                    <span className="year-stat-winner">
                      <Trophy size={12} />
                      {item.winner_count} برنده
                    </span>
                    <span className="year-stat-rate">{winRate}%</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ==========================================================
           توزیع بر اساس RFP (با فیلتر سال و نمایش محدود)
          ========================================================== */}
      {filteredRfpData.length > 0 && (
        <div className="stats-detail">
          <h4 className="stats-detail-title">
            <Building2 size={18} />
            توزیع پروپوزال بر اساس RFP
            {isYearSelected && <span className="year-badge">سال {selectedYear}</span>}
          </h4>
          <div className="rfp-stats">
            {rfpDataToShow.map((item) => {
              const maxCount = Math.max(...filteredRfpData.map(i => i.count), 1);
              const percentage = (item.count / maxCount) * 100;
              return (
                <div key={item.rfp_id} className="rfp-stat-item">
                  <span className="rfp-stat-name">{item.rfp_title}</span>
                  <div className="rfp-stat-bar">
                    <div
                      className="rfp-stat-fill"
                      style={{
                        width: `${percentage}%`,
                        background: `hsl(${(item.rfp_id * 37) % 360}, 70%, 50%)`,
                      }}
                    />
                  </div>
                  <span className="rfp-stat-count">{item.count}</span>
                </div>
              );
            })}
            
            {/* دکمه مشاهده بیشتر/کمتر */}
            {filteredRfpData.length > DISPLAY_LIMIT && (
              <button
                className="show-more-btn"
                onClick={() => setShowAllRfp(!showAllRfp)}
              >
                {showAllRfp ? (
                  <>
                    <ChevronUp size={16} />
                    نمایش کمتر
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    مشاهده {filteredRfpData.length - DISPLAY_LIMIT} مورد دیگر
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ==========================================================
           توزیع بر اساس دانشگاه (با فیلتر سال و نمایش محدود)
          ========================================================== */}
      {filteredUniversityData.length > 0 && (
        <div className="stats-detail">
          <h4 className="stats-detail-title">
            <Building2 size={18} />
            توزیع پروپوزال بر اساس دانشگاه
            {/* {isYearSelected && <span className="year-badge">سال {selectedYear}</span>} */}
          </h4>
          <div className="university-stats">
            {universityDataToShow.map((item) => {
              const maxCount = Math.max(...filteredUniversityData.map(i => i.count), 1);
              const percentage = (item.count / maxCount) * 100;
              return (
                <div key={item.university_id} className="university-stat-item">
                  <span className="university-stat-name">{item.university_name}</span>
                  <div className="university-stat-bar">
                    <div
                      className="university-stat-fill"
                      style={{
                        width: `${percentage}%`,
                        background: `hsl(${(item.university_id * 53) % 360}, 70%, 50%)`,
                      }}
                    />
                  </div>
                  <span className="university-stat-count">{item.count}</span>
                </div>
              );
            })}
            
            {/* دکمه مشاهده بیشتر/کمتر */}
            {filteredUniversityData.length > DISPLAY_LIMIT && (
              <button
                className="show-more-btn"
                onClick={() => setShowAllUniversity(!showAllUniversity)}
              >
                {showAllUniversity ? (
                  <>
                    <ChevronUp size={16} />
                    نمایش کمتر
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    مشاهده {filteredUniversityData.length - DISPLAY_LIMIT} مورد دیگر
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        .proposal-stats {
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

        .year-badge {
          font-size: 12px;
          font-weight: 500;
          color: #4f46e5;
          background: #eef2ff;
          padding: 2px 10px;
          border-radius: 12px;
          margin-right: 8px;
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

        .year-stats,
        .rfp-stats,
        .university-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .year-stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 10px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .year-stat-item:hover {
          background: #f8fafc;
        }

        .year-stat-item.selected {
          background: #eef2ff;
          border: 1px solid #c7d2fe;
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
          min-width: 80px;
          text-align: left;
        }

        .year-stat-item.selected .year-stat-count {
          color: #4f46e5;
          font-weight: 700;
        }

        .year-stat-winner {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 500;
          color: #059669;
          min-width: 70px;
        }

        .year-stat-rate {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          min-width: 40px;
          text-align: left;
        }

        .year-stat-item.selected .year-stat-rate {
          color: #4f46e5;
        }

        .rfp-stat-item,
        .university-stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .rfp-stat-name,
        .university-stat-name {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a2e;
          min-width: 120px;
          word-break: break-word;
        }

        .rfp-stat-bar,
        .university-stat-bar {
          flex: 1;
          height: 6px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
          min-width: 60px;
        }

        .rfp-stat-fill,
        .university-stat-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .rfp-stat-count,
        .university-stat-count {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a2e;
          min-width: 30px;
          text-align: left;
        }

        .show-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          margin-top: 8px;
          border: 1.5px dashed #d1d5db;
          border-radius: 6px;
          background: transparent;
          color: #6b7280;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          width: fit-content;
        }

        .show-more-btn:hover {
          border-color: #4f46e5;
          color: #4f46e5;
          background: #eef2ff;
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

          .year-stat-item {
            flex-wrap: wrap;
          }

          .year-stat-count {
            min-width: 60px;
            font-size: 12px;
          }

          .year-stat-winner {
            min-width: 50px;
            font-size: 11px;
          }

          .rfp-stat-name,
          .university-stat-name {
            min-width: 80px;
            font-size: 12px;
          }

          .show-more-btn {
            width: 100%;
            justify-content: center;
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

export default ProposalStats;