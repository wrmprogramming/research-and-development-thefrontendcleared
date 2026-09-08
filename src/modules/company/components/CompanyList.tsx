// src/modules/company/components/CompanyList.tsx

import React, { useState, useEffect } from 'react';
import { useCompany } from '../hooks/useCompany';
import { useProvince } from '../../province/hooks/useProvince';
import { type Company, type CompanyFilters } from '../types/company.types';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Filter,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
} from 'lucide-react';

interface CompanyListProps {
  onEdit?: (item: Company) => void;
  onDelete?: (id: number) => void;
  onView?: (item: Company) => void;
  onAdd?: () => void;
}

export const CompanyList: React.FC<CompanyListProps> = ({
  onEdit,
  onDelete,
  onView,
  onAdd,
}) => {
  const { useList, delete: deleteCompany, isDeleting, useStats } = useCompany();
  const { useList: useProvinceList } = useProvince();
  
  const [filters, setFilters] = useState<CompanyFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAllProvinces, setShowAllProvinces] = useState(false);

  // ========== دریافت لیست استان‌ها ==========
  const { data: provinces = [] } = useProvinceList();

  // ========== دریافت آمار شرکت‌ها ==========
  const { data: stats, isLoading: statsLoading } = useStats();

  // ========== Debounce برای جستجو ==========
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: companies = [], isLoading, refetch } = useList({
    ...filters,
    search: debouncedSearchTerm || undefined,
  });

  // ========== Handlers ==========
  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`آیا از حذف شرکت "${name}" مطمئن هستید؟`)) {
      await deleteCompany(id);
      refetch();
    }
  };

  const handleFilterChange = (key: keyof CompanyFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  const hasActiveFilters = searchTerm || Object.values(filters).some(v => v !== undefined);

  // ========== محاسبه آمار کلی ==========
  const totalCompanies = companies.length;
  const companiesWithPhone = companies.filter(c => c.phone).length;
  const companiesWithEmail = companies.filter(c => c.email).length;
  const companiesWithProvince = companies.filter(c => c.province).length;

  // ========== توزیع بر اساس استان ==========
  const getProvinceDistribution = () => {
    if (stats?.by_province && stats.by_province.length > 0) {
      return stats.by_province;
    }
    
    const distribution: Record<number, { province_id: number; province_name: string; count: number }> = {};
    
    companies.forEach(company => {
      if (company.province) {
        const provinceId = typeof company.province === 'object' ? company.province.id : company.province;
        const provinceName = typeof company.province === 'object' ? company.province.name : company.province_name || `استان ${provinceId}`;
        
        if (!distribution[provinceId]) {
          distribution[provinceId] = {
            province_id: provinceId,
            province_name: provinceName,
            count: 0,
          };
        }
        distribution[provinceId].count++;
      }
    });
    
    // استان‌هایی که شرکت ندارند را هم از لیست استان‌ها اضافه کن
    provinces.forEach(province => {
      if (!distribution[province.id]) {
        distribution[province.id] = {
          province_id: province.id,
          province_name: province.name,
          count: 0,
        };
      } else {
        // نام استان را از لیست استان‌ها به‌روز کن
        distribution[province.id].province_name = province.name;
      }
    });
    
    return Object.values(distribution).sort((a, b) => b.count - a.count);
  };

  const provinceDistribution = getProvinceDistribution();
  const maxCount = provinceDistribution.length > 0 ? Math.max(...provinceDistribution.map(p => p.count)) : 1;
  
  // استان‌های دارای شرکت
  const provincesWithCompanies = provinceDistribution.filter(p => p.count > 0);
  const provincesWithoutCompanies = provinceDistribution.filter(p => p.count === 0);
  
  // نمایش ۵ استان اول و بقیه در حالت گسترده
  const visibleProvinces = showAllProvinces 
    ? provinceDistribution 
    : provinceDistribution.slice(0, 5);

  // ========== Render ==========
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
        <p className="mt-3 text-muted">در حال بارگذاری شرکت‌ها...</p>
      </div>
    );
  }

  return (
    <div className="company-list">
      {/* Header */}
      <div className="company-list-header">
        <div className="header-title">
          <Building2 size={24} />
          <h2>شرکت‌ها</h2>
          <span className="badge">{companies.length}</span>
        </div>
        {onAdd && (
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={18} />
            افزودن شرکت
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Building2 size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalCompanies}</span>
            <span className="stat-label">کل شرکت‌ها</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <Phone size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{companiesWithPhone}</span>
            <span className="stat-label">دارای تلفن</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <Mail size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{companiesWithEmail}</span>
            <span className="stat-label">دارای ایمیل</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <MapPin size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{companiesWithProvince}</span>
            <span className="stat-label">دارای استان</span>
          </div>
        </div>
      </div>

      {/* ========== توزیع بر اساس استان ========== */}
      {provinceDistribution.length > 0 && (
        <div className="stats-distribution">
          <div className="distribution-header">
            <div className="distribution-title">
              <MapPin size={18} />
              <span>توزیع شرکت‌ها بر اساس استان</span>
            </div>
            <div className="distribution-header-actions">
              <span className="distribution-count">{companiesWithProvince} شرکت</span>
              {provincesWithCompanies.length > 5 && (
                <button
                  className="distribution-toggle"
                  onClick={() => setShowAllProvinces(!showAllProvinces)}
                >
                  {showAllProvinces ? (
                    <>
                      <ChevronUp size={14} />
                      نمایش کمتر
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      نمایش همه ({provincesWithCompanies.length})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="distribution-bars">
            {visibleProvinces.map((item) => {
              const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              const hasCompany = item.count > 0;
              
              return (
                <div 
                  key={item.province_id} 
                  className={`distribution-item ${hasCompany ? 'has-company' : 'no-company'}`}
                >
                  <div className="distribution-label">
                    <span className="distribution-name">{item.province_name}</span>
                    <span className="distribution-number">{item.count}</span>
                  </div>
                  <div className="distribution-bar-track">
                    <div
                      className="distribution-bar-fill"
                      style={{
                        width: `${percentage}%`,
                        background: hasCompany 
                          ? `hsl(${(item.province_id * 37) % 360}, 70%, 50%)`
                          : '#e9ecef',
                        opacity: hasCompany ? 1 : 0.3,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="جستجو در نام، کد اقتصادی، تلفن، ایمیل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm('')}>
              <X size={16} />
            </button>
          )}
          {searchTerm && searchTerm !== debouncedSearchTerm && (
            <span className="search-loading">⏳</span>
          )}
        </div>

        <div className="filter-actions">
          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            فیلترها
            {hasActiveFilters && <span className="badge-filter">•</span>}
            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {hasActiveFilters && (
            <button className="clear-filters" onClick={clearFilters}>
              <X size={14} />
              پاک کردن
            </button>
          )}
        </div>
      </div>

      {/* ========== Filter Panel ========== */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-grid">
            <div className="filter-group">
              <label>استان</label>
              <select
                value={filters.province || ''}
                onChange={(e) => handleFilterChange('province', e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">همه استان‌ها</option>
                {provinceDistribution.map((province) => (
                  <option key={province.province_id} value={province.province_id}>
                    {province.province_name} ({province.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {companies.length === 0 ? (
        <div className="empty-state">
          <Building2 size={48} />
          <h5>هیچ شرکتی یافت نشد</h5>
          <p className="text-muted">
            {hasActiveFilters ? 'با فیلترهای انتخاب شده موردی پیدا نشد' : 'هنوز شرکتی ثبت نشده است'}
          </p>
          {hasActiveFilters ? (
            <button className="btn-outline-primary" onClick={clearFilters}>
              پاک کردن فیلترها
            </button>
          ) : (
            onAdd && (
              <button className="btn-primary" onClick={onAdd}>
                <Plus size={16} />
                افزودن اولین شرکت
              </button>
            )
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="company-table">
            <thead>
              <tr>
                <th>نام شرکت</th>
                <th>کد اقتصادی</th>
                <th>شناسه ملی</th>
                <th>تلفن</th>
                <th>ایمیل</th>
                <th>استان</th>
                <th style={{ width: 120 }}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>
                    <div className="company-name-cell">
                      <Building2 size={16} className="company-icon" />
                      <span className="fw-semibold">{company.name}</span>
                    </div>
                  </td>
                  <td>{company.economic_code || '—'}</td>
                  <td>{company.national_id || '—'}</td>
                  <td>
                    {company.phone ? (
                      <div className="phone-cell">
                        <Phone size={14} />
                        {company.phone}
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    {company.email ? (
                      <div className="email-cell">
                        <Mail size={14} />
                        {company.email}
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>{company.province_name || '—'}</td>
                  <td>
                    <div className="actions">
                      {/* <button
                        className="action-btn view"
                        onClick={() => onView?.(company)}
                        title="مشاهده"
                      >
                        <Eye size={16} />
                      </button> */}
                      <button
                        className="action-btn edit"
                        onClick={() => onEdit?.(company)}
                        title="ویرایش"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(company.id, company.name)}
                        disabled={isDeleting}
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .company-list {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .company-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-title h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .header-title .badge {
          background: #eef2ff;
          color: #4f46e5;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #4338ca;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .btn-outline-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border: 1.5px solid #4f46e5;
          border-radius: 8px;
          background: transparent;
          color: #4f46e5;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-outline-primary:hover {
          background: #eef2ff;
        }

        /* ========== Stats Grid ========== */
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
          background: #f8fafc;
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

        /* ========== Stats Distribution ========== */
        .stats-distribution {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 16px;
          border: 1px solid #e9ecef;
        }

        .distribution-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .distribution-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          color: #1a1a2e;
        }

        .distribution-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .distribution-count {
          font-size: 13px;
          color: #6b7280;
        }

        .distribution-toggle {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          background: white;
          font-size: 12px;
          color: #4f46e5;
          cursor: pointer;
          transition: all 0.2s;
        }

        .distribution-toggle:hover {
          background: #eef2ff;
          border-color: #4f46e5;
        }

        .distribution-bars {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .distribution-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .distribution-item.no-company {
          opacity: 0.5;
        }

        .distribution-label {
          display: flex;
          justify-content: space-between;
          min-width: 120px;
          font-size: 13px;
        }

        .distribution-name {
          color: #374151;
        }

        .distribution-number {
          font-weight: 600;
          color: #1a1a2e;
        }

        .distribution-bar-track {
          flex: 1;
          height: 6px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }

        .distribution-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        /* ========== Search & Filters ========== */
        .search-section {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .search-input-wrapper {
          flex: 1;
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 8px 40px 8px 12px;
          border: 1.5px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .search-input:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-loading {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to { transform: translateY(-50%) rotate(360deg); }
        }

        .clear-btn {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          z-index: 2;
        }

        .clear-btn:hover {
          color: #ef4444;
        }

        .filter-actions {
          display: flex;
          gap: 8px;
        }

        .filter-toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1.5px solid #e9ecef;
          border-radius: 8px;
          background: white;
          color: #6b7280;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-toggle:hover {
          border-color: #4f46e5;
          color: #4f46e5;
        }

        .filter-toggle.active {
          border-color: #4f46e5;
          background: #eef2ff;
          color: #4f46e5;
        }

        .badge-filter {
          color: #4f46e5;
          font-size: 18px;
        }

        .clear-filters {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          border: none;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-filters:hover {
          background: #fecaca;
        }

        .filter-panel {
          padding: 16px;
          margin-bottom: 16px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .filter-group label {
          font-size: 12px;
          font-weight: 500;
          color: #374151;
        }

        .filter-group select {
          padding: 8px 12px;
          border: 1.5px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          background: white;
          width: 100%;
        }

        .filter-group select:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .filter-group select option {
          padding: 4px;
        }

        /* ========== Table ========== */
        .company-table {
          width: 100%;
          border-collapse: collapse;
        }

        .company-table thead th {
          padding: 12px 16px;
          text-align: right;
          font-weight: 600;
          font-size: 13px;
          color: #6b7280;
          border-bottom: 2px solid #e9ecef;
        }

        .company-table tbody td {
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .company-table tbody tr:hover {
          background: #f8fafc;
        }

        .company-name-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .company-icon {
          color: #4f46e5;
        }

        .phone-cell,
        .email-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #374151;
        }

        .actions {
          display: flex;
          gap: 4px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: #6b7280;
        }

        .action-btn:hover {
          background: #f3f4f6;
        }

        .action-btn.view:hover {
          background: #d1fae5;
          color: #059669;
        }

        .action-btn.edit:hover {
          background: #eef2ff;
          color: #4f46e5;
        }

        .action-btn.delete:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .text-muted {
          color: #9ca3af;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
        }

        .empty-state svg {
          color: #d1d5db;
          margin-bottom: 12px;
        }

        .empty-state h5 {
          margin-bottom: 4px;
          color: #374151;
        }

        @media (max-width: 768px) {
          .company-list {
            padding: 12px;
          }

          .company-list-header {
            flex-direction: column;
            align-items: stretch;
          }

          .search-section {
            flex-direction: column;
          }

          .filter-actions {
            width: 100%;
          }

          .filter-actions button {
            flex: 1;
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .filter-grid {
            grid-template-columns: 1fr;
          }

          .distribution-label {
            min-width: 80px;
            font-size: 12px;
          }

          .distribution-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .company-table {
            font-size: 13px;
          }

          .company-table thead th,
          .company-table tbody td {
            padding: 8px 10px;
          }

          .actions {
            flex-direction: column;
            gap: 2px;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .distribution-item {
            flex-wrap: wrap;
            gap: 4px;
          }

          .distribution-label {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyList;
