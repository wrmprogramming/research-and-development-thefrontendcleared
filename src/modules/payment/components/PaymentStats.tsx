// src/modules/payment/components/PaymentStats.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { usePayment } from '../hooks/usePayment';
import moment from 'moment-jalaali';
import {
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText,
  Calendar,
  Building2,
  Wallet,
  ChevronDown,
  ChevronUp,
  Percent,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { formatCurrency, toPersianNumber } from '../../../utils/formatter.utils';
interface PaymentStatsProps {
  className?: string;
}


export const PaymentStats: React.FC<PaymentStatsProps> = ({ className = '' }) => {
  const { useStats } = usePayment();
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const { data: stats, isLoading, isError, refetch } = useStats(
    selectedYear === 'all' ? undefined : selectedYear
  );
  const [showAllContracts, setShowAllContracts] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // ========== استخراج سال‌های موجود ==========
  const availableYears = useMemo(() => {
    if (!stats?.by_year) return [];
    const years = Object.keys(stats.by_year).map(Number);
    return years.length > 0 ? years.sort((a, b) => b - a) : [];
  }, [stats]);

  // ========== تنظیم سال پیش‌فرض فقط در بار اول ==========
  useEffect(() => {
    if (isFirstLoad && availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
      setIsFirstLoad(false);
    }
  }, [availableYears, isFirstLoad]);

  // ========== هندلر تغییر سال ==========
  const handleYearChange = (year: number | 'all') => {
    setSelectedYear(year);
  };

  // ========== فیلتر بر اساس سال ==========
  const filteredByMonth = useMemo(() => {
    if (!stats?.by_month) return {};
    
    const filtered: Record<string, { month_name: string; count: number; total_amount: number }> = {};
    
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
    let totalPayments = 0;
    let totalAmount = 0;
    let verifiedCount = 0;
    let unverifiedCount = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    let verifiedAmount = 0;
    let unverifiedAmount = 0;

    Object.values(filteredByMonth).forEach(item => {
      totalPayments += (item.count || 0);
      totalAmount += (item.total_amount || 0);
    });

    if (stats && totalPayments > 0) {
      const ratio = stats.total_payments > 0 ? totalPayments / stats.total_payments : 0;
      verifiedCount = Math.round((stats.verified_count || 0) * ratio);
      unverifiedCount = Math.round((stats.unverified_count || 0) * ratio);
      paidCount = Math.round((stats.paid_count || 0) * ratio);
      unpaidCount = Math.round((stats.unpaid_count || 0) * ratio);
      verifiedAmount = (stats.verified_amount || 0) * ratio;
      unverifiedAmount = (stats.total_amount || 0) * ratio - verifiedAmount;
    }

    return {
      totalPayments,
      totalAmount,
      verifiedCount,
      unverifiedCount,
      paidCount,
      unpaidCount,
      verifiedAmount,
      unverifiedAmount,
    };
  }, [filteredByMonth, stats]);

  // ========== قراردادها با فیلتر سال ==========
  const filteredContracts = useMemo(() => {
    if (!stats?.by_contract) return [];
    
    if (selectedYear !== 'all' && stats.contract_year_stats) {
      return stats.by_contract
        .map(item => ({
          ...item,
          contract__id: item.contract__id || 0,
          contract__total_amount: item.contract__total_amount || 0,
          paid_amount: item.paid_amount || 0,
        }))
        .filter(item => {
          const contractYears = stats.contract_year_stats?.[item.contract__id];
          if (!contractYears) return false;
          return Object.keys(contractYears).includes(String(selectedYear));
        });
    }
    
    return stats.by_contract
      .map(item => ({
        ...item,
        contract__id: item.contract__id || 0,
        contract__total_amount: item.contract__total_amount || 0,
        paid_amount: item.paid_amount || 0,
      }));
  }, [stats, selectedYear]);

  const totalContractAmount = useMemo(() => {
    return filteredContracts.reduce((sum, item) => sum + (item.contract__total_amount || 0), 0);
  }, [filteredContracts]);

  const totalContractPaid = useMemo(() => {
    return filteredContracts.reduce((sum, item) => sum + (item.paid_amount || 0), 0);
  }, [filteredContracts]);

  const displayContracts = useMemo(() => {
    return showAllContracts ? filteredContracts : filteredContracts.slice(0, 5);
  }, [filteredContracts, showAllContracts]);

  // ========== کارت‌های اصلی ==========
  const statItems = useMemo(() => {
    if (!stats) return [];
    
    const paidPercentage = yearStats.totalPayments > 0 
      ? Math.round((yearStats.paidCount / yearStats.totalPayments) * 100) 
      : 0;
    
    const isYearSelected = selectedYear !== 'all';
    const yearLabel = isYearSelected ? `سال ${toPersianNumber(selectedYear as number)}` : 'کل';
    
    return [
      {
        key: 'total',
        label: `تعداد کل پرداخت‌ها (${yearLabel})`,
        value: toPersianNumber(yearStats.totalPayments || 0),
        icon: FileText,
        color: '#4f46e5',
        bgColor: '#eef2ff',
      },
      {
        key: 'total_amount',
        label: `مبلغ کل پرداخت‌ها (${yearLabel})`,
        value: formatCurrency(yearStats.totalAmount || 0),
        icon: DollarSign,
        color: '#d97706',
        bgColor: '#fef3c7',
      },
      {
        key: 'verified',
        label: `تایید شده (${yearLabel})`,
        value: toPersianNumber(yearStats.verifiedCount || 0),
        subValue: formatCurrency(yearStats.verifiedAmount || 0),
        icon: CheckCircle,
        color: '#059669',
        bgColor: '#d1fae5',
      },
      {
        key: 'unverified',
        label: `تایید نشده (${yearLabel})`,
        value: toPersianNumber(yearStats.unverifiedCount || 0),
        subValue: formatCurrency(yearStats.unverifiedAmount || 0),
        icon: Clock,
        color: '#dc2626',
        bgColor: '#fee2e2',
      },
      {
        key: 'average',
        label: `میانگین پرداخت ها (${yearLabel})`,
        value: yearStats.totalPayments > 0 
          ? formatCurrency(yearStats.totalAmount / yearStats.totalPayments) 
          : '۰ ریال',
        icon: TrendingUp,
        color: '#7c3aed',
        bgColor: '#ede9fe',
      },
      {
        key: 'paid',
        label: `وضعیت پرداخت (${yearLabel})`,
        value: `${toPersianNumber(paidPercentage)}%`,
        subValue: `${toPersianNumber(yearStats.paidCount || 0)} پرداخت شده از ${toPersianNumber(yearStats.totalPayments || 0)}`,
        icon: Percent,
        color: '#2563eb',
        bgColor: '#dbeafe',
      },
    ];
  }, [stats, selectedYear, yearStats]);

  // --- وضعیت بارگذاری ---
  if (isLoading) {
    return (
      <div className={`payment-stats ${className}`}>
        <div className="stats-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      <div className={`payment-stats ${className}`}>
        <div className="stats-error">
          <AlertCircle size={24} />
          <p>خطا در دریافت آمار پرداخت‌ها</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`payment-stats ${className}`}>
      {/* ==========================================================
          بخش انتخاب سال (همانند ماژول‌های قبلی)
          ========================================================== */}
      <div className="stats-header">
        <div className="stats-title">
          <DollarSign size={20} />
          <h3>آمار پرداخت‌ها</h3>
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
              {item.subValue && (
                <span className="stat-sub-value">{item.subValue}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ==========================================================
          توزیع بر اساس نوع پرداخت
          ========================================================== */}
      {stats.by_payment_type && stats.by_payment_type.length > 0 && (
        <div className="stats-detail">
          <h4 className="stats-detail-title">
            <CreditCard size={18} />
            توزیع بر اساس نوع پرداخت
            {selectedYear !== 'all' && <span className="year-badge">سال {toPersianNumber(selectedYear as number)}</span>}
          </h4>
          <div className="status-stats">
            {stats.by_payment_type.map((item) => {
              const percentage = stats.total_amount > 0 
                ? ((item.total_amount || 0) / (stats.total_amount || 1)) * 100 
                : 0;
              return (
                <div key={item.payment_type__code} className="status-stat-item">
                  <div className="status-stat-info">
                    <span className="status-dot" style={{ backgroundColor: '#4f46e5' }} />
                    <span className="status-stat-name">{item.payment_type__name}</span>
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
                  <span className="status-stat-count">
                    {formatCurrency(item.total_amount || 0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==========================================================
          توزیع بر اساس ماه
          ========================================================== */}
      <div className="stats-detail">
        <h4 className="stats-detail-title">
          <Calendar size={18} />
          توزیع بر اساس ماه
          {selectedYear !== 'all' && <span className="year-badge">سال {toPersianNumber(selectedYear)}</span>}
        </h4>
        <div className="status-stats">
          {Object.keys(filteredByMonth).length === 0 ? (
            <div className="empty-state-small">
              <span>هیچ پرداختی در {selectedYear !== 'all' ? `سال ${toPersianNumber(selectedYear)}` : 'سال‌های انتخاب شده'} ثبت نشده است</span>
            </div>
          ) : (
            Object.entries(filteredByMonth)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([key, item]) => {
                const total = yearStats.totalAmount || 1;
                const percentage = total > 0 ? ((item.total_amount || 0) / total) * 100 : 0;
                return (
                  <div key={key} className="status-stat-item">
                    <div className="status-stat-info">
                      <span className="status-dot" style={{ backgroundColor: '#8b5cf6' }} />
                      <span className="status-stat-name">{item.month_name}</span>
                    </div>
                    <div className="status-stat-bar">
                      <div
                        className="status-stat-fill"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: '#8b5cf6',
                        }}
                      />
                    </div>
                    <span className="status-stat-count">
                      {toPersianNumber(item.count || 0)} مورد
                    </span>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* ==========================================================
          خلاصه وضعیت قراردادها
          ========================================================== */}
      <div className="contract-stats-card">
        <div className="contract-stats-header">
          <Building2 size={18} />
          <span>خلاصه وضعیت قراردادها</span>
          {selectedYear !== 'all' && <span className="year-badge">سال {toPersianNumber(selectedYear)}</span>}
        </div>
        <div className="contract-stats-body">
          <div className="contract-stat-item">
            <span className="contract-stat-label">تعداد قراردادهای دارای پرداخت</span>
            <span className="contract-stat-value">{toPersianNumber(filteredContracts.length)}</span>
          </div>
          <div className="contract-stat-item">
            <span className="contract-stat-label">مبلغ کل قراردادها</span>
            <span className="contract-stat-value highlight">{formatCurrency(totalContractAmount)}</span>
          </div>
          <div className="contract-stat-item">
            <span className="contract-stat-label">مبلغ پرداخت شده</span>
            <span className="contract-stat-value success">{formatCurrency(totalContractPaid)}</span>
          </div>
          <div className="contract-stat-item">
            <span className="contract-stat-label">مبلغ باقیمانده</span>
            <span className="contract-stat-value warning">{formatCurrency(totalContractAmount - totalContractPaid)}</span>
          </div>
          <div className="contract-stat-progress">
            <div className="progress-info">
              <span>پیشرفت کلی پرداخت‌ها</span>
              <span>
                {totalContractAmount > 0
                  ? `${toPersianNumber(Math.round((totalContractPaid / totalContractAmount) * 100))}%`
                  : '۰%'
                }
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: totalContractAmount > 0
                    ? `${(totalContractPaid / totalContractAmount) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>

          {/* جزئیات قراردادها */}
          {filteredContracts.length > 0 && (
            <div className="contract-details-list">
              <div className="contract-details-title">جزئیات پرداخت‌های هر قرارداد</div>
              {displayContracts.map((item, index) => {
                const totalAmount = item.contract__total_amount || 0;
                const paidAmount = item.paid_amount || 0;
                const progress = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;
                const remaining = totalAmount - paidAmount;

                return (
                  <div key={index} className="contract-detail-item">
                    <div className="contract-detail-header">
                      <div className="contract-detail-title">
                        <Building2 size={14} className="contract-icon" />
                        <span className="contract-number">{item.contract__contract_number}</span>
                        <span className="contract-subject">{item.contract__subject}</span>
                      </div>
                      <span className="contract-progress-badge">{toPersianNumber(progress)}%</span>
                    </div>
                    <div className="contract-detail-amounts">
                      <div className="amount-item">
                        <span className="amount-label">کل:</span>
                        <span className="amount-value">{formatCurrency(totalAmount)}</span>
                      </div>
                      <div className="amount-item">
                        <span className="amount-label">پرداخت شده:</span>
                        <span className="amount-value success">{formatCurrency(paidAmount)}</span>
                      </div>
                      <div className="amount-item">
                        <span className="amount-label">باقیمانده:</span>
                        <span className={`amount-value ${remaining > 0 ? 'warning' : 'success'}`}>
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                    </div>
                    <div className="contract-progress-bar">
                      <div
                        className="contract-progress-fill"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: progress === 100 ? '#059669' : '#4f46e5',
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {filteredContracts.length > 5 && (
                <button
                  className="show-more-btn"
                  onClick={() => setShowAllContracts(!showAllContracts)}
                >
                  {showAllContracts ? (
                    <>
                      <ChevronUp size={16} />
                      نمایش کمتر
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      مشاهده همه {toPersianNumber(filteredContracts.length)} قرارداد
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .payment-stats {
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

        .stat-sub-value {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 2px;
        }

        /* --- بخش‌های جزییات --- */
        .stats-detail {
          padding: 16px 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          margin-bottom: 16px;
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

        /* --- قراردادها --- */
        .contract-stats-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          overflow: hidden;
        }

        .contract-stats-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e9ecef;
          font-weight: 600;
          font-size: 14px;
          color: #1a1a2e;
          flex-wrap: wrap;
        }

        .contract-stats-body {
          padding: 12px 16px;
        }

        .contract-stat-item {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 13px;
        }

        .contract-stat-item:last-child {
          border-bottom: none;
        }

        .contract-stat-label {
          color: #6b7280;
        }

        .contract-stat-value {
          font-weight: 600;
          color: #1a1a2e;
        }

        .contract-stat-value.highlight {
          color: #4f46e5;
        }

        .contract-stat-value.success {
          color: #059669;
        }

        .contract-stat-value.warning {
          color: #d97706;
        }

        .contract-stat-progress {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e9ecef;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .progress-bar {
          height: 6px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        /* --- جزئیات قراردادها --- */
        .contract-details-list {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e9ecef;
        }

        .contract-details-title {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 8px;
        }

        .contract-detail-item {
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .contract-detail-item:last-child {
          border-bottom: none;
        }

        .contract-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .contract-detail-title {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          min-width: 0;
        }

        .contract-icon {
          flex-shrink: 0;
          color: #6b7280;
        }

        .contract-number {
          font-family: monospace;
          font-size: 12px;
          font-weight: 600;
          color: #4f46e5;
          background: #eef2ff;
          padding: 1px 8px;
          border-radius: 4px;
          white-space: nowrap;
        }

        .contract-subject {
          font-size: 12px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .contract-progress-badge {
          font-size: 12px;
          font-weight: 600;
          color: #4f46e5;
          background: #eef2ff;
          padding: 2px 10px;
          border-radius: 12px;
          white-space: nowrap;
        }

        .contract-detail-amounts {
          display: flex;
          gap: 16px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }

        .amount-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
        }

        .amount-label {
          color: #6b7280;
        }

        .amount-value {
          font-weight: 600;
          color: #1a1a2e;
        }

        .amount-value.success {
          color: #059669;
        }

        .amount-value.warning {
          color: #d97706;
        }

        .contract-progress-bar {
          height: 4px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }

        .contract-progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .show-more-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 8px;
          margin-top: 8px;
          border: 1px dashed #d1d5db;
          border-radius: 8px;
          background: transparent;
          color: #4f46e5;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .show-more-btn:hover {
          background: #eef2ff;
          border-color: #4f46e5;
        }

        .empty-state-small {
          text-align: center;
          padding: 16px;
          color: #9ca3af;
          font-size: 13px;
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

          .contract-detail-amounts {
            flex-wrap: wrap;
            gap: 8px;
          }

          .contract-detail-title {
            flex-wrap: wrap;
          }

          .contract-subject {
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

export default PaymentStats;
