// src/modules/person/components/PersonList.tsx

import React, { useState } from 'react';
import { usePerson } from '../hooks/usePerson';
import { GENDER_LABELS, EDUCATIONAL_DEGREE_LABELS, type Person, type PersonFilters } from '../types/person.types';
import { formatNumber } from '../../../utils/formatter.utils';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Filter,
  X,
  Users,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
} from 'lucide-react';
import dateUtils from '@utils/dateUtils';

interface PersonListProps {
  onEdit?: (item: Person) => void;
  onDelete?: (id: number) => void;
  onView?: (item: Person) => void;
  onAdd?: () => void;
  selectable?: boolean;
  onSelect?: (person: Person) => void;
  selectedIds?: number[];
}

export const PersonList: React.FC<PersonListProps> = ({
  onEdit,
  onDelete,
  onView,
  onAdd,
  selectable = false,
  onSelect,
  selectedIds = [],
}) => {
  const { useList, delete: deletePerson, isDeleting, useStats } = usePerson(); // ✅ اضافه کردن useStats
  const [filters, setFilters] = useState<PersonFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: persons = [], isLoading, refetch } = useList({
    ...filters,
    search: searchTerm || undefined,
  });

  // ========== دریافت آمار ==========
  const { data: stats } = useStats();

  // ========== محاسبه آمار کلی ==========
  const totalPersons = persons.length;
  const personsWithEmail = persons.filter(p => p.email).length;
  const personsWithMobile = persons.filter(p => p.mobile_phone).length;
  const personsWithDegree = persons.filter(p => p.educational_degree).length;

  // ========== Handlers ==========
  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`آیا از حذف "${name}" مطمئن هستید؟`)) {
      await deletePerson(id);
      refetch();
    }
  };

  const handleFilterChange = (key: keyof PersonFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const hasActiveFilters = searchTerm || Object.values(filters).some(v => v !== undefined);

  // ========== Render ==========
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
        <p className="mt-3 text-muted">در حال بارگذاری پژوهشگران...</p>
      </div>
    );
  }

  return (
    <div className="person-list">
      {/* Header */}
      <div className="person-list-header">
        <div className="header-title">
          <Users size={24} />
          <h2>مدیریت پژوهشگران</h2> {/* ✅ تغییر عنوان */}
          <span className="badge">{persons.length}</span>
        </div>
        {onAdd && (
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={18} />
            افزودن پژوهشگر جدید {/* ✅ تغییر عنوان */}
          </button>
        )}
      </div>

      {/* ========== Stats Grid ========== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Users size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalPersons}</span>
            <span className="stat-label">کل پژوهشگران</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <Mail size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{personsWithEmail}</span>
            <span className="stat-label">دارای ایمیل</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <Phone size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{personsWithMobile}</span>
            <span className="stat-label">دارای تلفن همراه</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <GraduationCap size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{personsWithDegree}</span>
            <span className="stat-label">دارای مدرک تحصیلی</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="جستجو در نام، کد ملی، تلفن، ایمیل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm('')}>
              <X size={16} />
            </button>
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
          </button>
          {hasActiveFilters && (
            <button className="clear-filters" onClick={clearFilters}>
              <X size={14} />
              پاک کردن
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-grid">
            <div className="filter-group">
              <label>جنسیت</label>
              <select
                value={filters.gender || ''}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
              >
                <option value="">همه</option>
                {Object.entries(GENDER_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>مدرک تحصیلی</label>
              <select
                value={filters.educational_degree || ''}
                onChange={(e) => handleFilterChange('educational_degree', e.target.value)}
              >
                <option value="">همه</option>
                {Object.entries(EDUCATIONAL_DEGREE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            {/* ❌ حذف فیلتر وضعیت چون فیلد is_active وجود ندارد */}
          </div>
        </div>
      )}

      {/* Table */}
      {persons.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h5>هیچ پژوهشگری یافت نشد</h5> {/* ✅ تغییر متن */}
          <p className="text-muted">
            {hasActiveFilters ? 'با فیلترهای انتخاب شده موردی پیدا نشد' : 'هنوز پژوهشگری ثبت نشده است'}
          </p>
          {hasActiveFilters ? (
            <button className="btn-outline-primary" onClick={clearFilters}>
              پاک کردن فیلترها
            </button>
          ) : (
            onAdd && (
              <button className="btn-primary" onClick={onAdd}>
                <Plus size={16} />
                افزودن اولین پژوهشگر
              </button>
            )
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="person-table">
            <thead>
              <tr>
                {selectable && <th style={{ width: 40 }}></th>}
                <th>نام و نام خانوادگی</th>
                <th>کد ملی</th>
                <th>جنسیت</th>
                <th>تلفن همراه</th>
                <th>مدرک تحصیلی</th>
                {/* ❌ حذف ستون وضعیت */}
                <th>تاریخ تولد</th>
                <th style={{ width: 120 }}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {persons.map((person) => (
                <tr key={person.id}>
                  {selectable && (
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(person.id)}
                        onChange={() => onSelect?.(person)}
                      />
                    </td>
                  )}
                  <td>
                    <div className="person-name-cell">
                      <div className="avatar">
                        {person.profile_image ? (
                          <img src={person.profile_image} alt={person.full_name} />
                        ) : (
                          <span>{person.first_name[0]}{person.last_name[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="name">{person.full_name}</div>
                        <div className="sub-info">
                          {person.job_position && (
                            <span className="job">{person.job_position}</span>
                          )}
                          {person.email && (
                            <span className="email">
                              <Mail size={12} />
                              {person.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="national-code">{person.national_code}</td>
                  <td>
                    <span className="gender-badge">
                      {GENDER_LABELS[person.gender] || person.gender}
                    </span>
                  </td>
                  <td>
                    <div className="phone-cell">
                      <Phone size={14} />
                      {person.mobile_phone}
                    </div>
                  </td>
                  <td>
                    {person.educational_degree ? (
                      <span className="degree-badge">
                        {EDUCATIONAL_DEGREE_LABELS[person.educational_degree] || person.educational_degree}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  {/* ❌ حذف ستون وضعیت */}
                  <td>
                    {person.birth_year ? person.birth_year : '—'}
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="action-btn view"
                        onClick={() => onView?.(person)}
                        title="مشاهده"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => onEdit?.(person)}
                        title="ویرایش"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(person.id, person.full_name)}
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
        .person-list {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .person-list-header {
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
        }

        .filter-group select:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .person-table {
          width: 100%;
          border-collapse: collapse;
        }

        .person-table thead th {
          padding: 12px 16px;
          text-align: right;
          font-weight: 600;
          font-size: 13px;
          color: #6b7280;
          border-bottom: 2px solid #e9ecef;
        }

        .person-table tbody td {
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .person-table tbody tr:hover {
          background: #f8fafc;
        }

        .person-name-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #eef2ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
          overflow: hidden;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .name {
          font-weight: 500;
          color: #1a1a2e;
        }

        .sub-info {
          display: flex;
          gap: 8px;
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
          flex-wrap: wrap;
        }

        .sub-info .job {
          background: #f3f4f6;
          padding: 0 8px;
          border-radius: 4px;
        }

        .sub-info .email {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .national-code {
          font-family: monospace;
          font-weight: 500;
        }

        .gender-badge {
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          background: #f3f4f6;
          color: #6b7280;
        }

        .phone-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #374151;
          font-family: monospace;
        }

        .degree-badge {
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          background: #dbeafe;
          color: #2563eb;
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

        .text-muted {
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .person-list {
            padding: 12px;
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

          .filter-grid {
            grid-template-columns: 1fr;
          }

          .person-table {
            font-size: 13px;
          }

          .person-table thead th,
          .person-table tbody td {
            padding: 8px 10px;
          }

          .person-name-cell {
            gap: 8px;
          }

          .avatar {
            width: 32px;
            height: 32px;
            font-size: 12px;
          }

          .actions {
            flex-direction: column;
            gap: 2px;
          }
        }
      `}</style>
    </div>
  );
};

