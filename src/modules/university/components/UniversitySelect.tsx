// src/modules/university/components/UniversitySelect.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useUniversity } from '../hooks/useUniversity';
import { type University } from '../types/university.types';
import { Search, GraduationCap, X, Check } from 'lucide-react';

interface UniversitySelectProps {
  value?: number | null;
  onChange: (universityId: number | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const UniversitySelect: React.FC<UniversitySelectProps> = ({
  value,
  onChange,
  placeholder = 'انتخاب دانشگاه...',
  label,
  required = false,
  disabled = false,
  error,
  className = '',
}) => {
  const { useList } = useUniversity();
  const { data: universities = [], isLoading } = useList({});
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredUniversities = universities.filter((uni) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    return uni.name.toLowerCase().includes(search) ||
           uni.type_name?.toLowerCase().includes(search) ||
           uni.city_name?.toLowerCase().includes(search);
  });

  const selectedUniversity = universities.find((u) => u.id === value);

  const toggleOpen = () => {
    if (disabled || isLoading) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  };

  const handleSelect = (university: University) => {
    if (university.id === value) {
      onChange(null);
    } else {
      onChange(university.id);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        toggleOpen();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < filteredUniversities.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredUniversities.length) {
          handleSelect(filteredUniversities[highlightedIndex]);
        }
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (highlightedIndex >= 0) {
      const list = document.getElementById('university-select-list');
      const item = list?.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  return (
    <div 
      ref={containerRef}
      className={`university-select ${className} ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${error ? 'has-error' : ''}`}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label className="select-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}

      <div className="select-control" onClick={toggleOpen}>
        <div className="select-value">
          <GraduationCap size={16} className="select-icon" />
          {selectedUniversity ? (
            <span className="selected-name">{selectedUniversity.name}</span>
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
        </div>

        <div className="select-actions">
          {selectedUniversity && (
            <button className="clear-btn" onClick={handleClear} type="button">
              <X size={14} />
            </button>
          )}
          <span className="chevron">▼</span>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="select-dropdown">
          <div className="dropdown-search">
            <Search size={16} className="search-icon" />
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="جستجوی دانشگاه..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div id="university-select-list" className="dropdown-list">
            {isLoading ? (
              <div className="loading-state">در حال بارگذاری...</div>
            ) : filteredUniversities.length === 0 ? (
              <div className="empty-state">نتیجه‌ای یافت نشد</div>
            ) : (
              filteredUniversities.map((university, index) => {
                const isSelected = university.id === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={university.id}
                    className={`dropdown-item ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                    onClick={() => handleSelect(university)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="university-info">
                      <span className="university-name">{university.name}</span>
                      {university.type_name && (
                        <span className="university-type">{university.type_name}</span>
                      )}
                      {university.city_name && (
                        <span className="university-city">{university.city_name}</span>
                      )}
                    </div>
                    {isSelected && <Check size={16} className="check-icon" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}


      <style>{`
        .university-select {
          position: relative;
          width: 100%;
        }

        .select-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
        }

        .required {
          color: #dc2626;
        }

        .select-control {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 42px;
          padding: 4px 12px;
          background: white;
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          gap: 8px;
        }

        .university-select.open .select-control {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .university-select.has-error .select-control {
          border-color: #dc2626;
        }

        .university-select.disabled .select-control {
          background: #f3f4f6;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .select-value {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }

        .select-icon {
          color: #9ca3af;
          flex-shrink: 0;
        }

        .selected-name {
          font-weight: 500;
          color: #1a1a2e;
        }

        .placeholder {
          color: #9ca3af;
          font-size: 14px;
        }

        .select-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .clear-btn {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .clear-btn:hover {
          background: #f3f4f6;
          color: #dc2626;
        }

        .chevron {
          color: #9ca3af;
          font-size: 10px;
        }

        .select-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
          z-index: 1050;
          overflow: hidden;
          max-height: 300px;
          display: flex;
          flex-direction: column;
        }

        .dropdown-search {
          position: relative;
          padding: 10px 12px;
          border-bottom: 1px solid #e9ecef;
        }

        .dropdown-search .search-icon {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .dropdown-search .search-input {
          width: 100%;
          padding: 8px 36px 8px 12px;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
        }

        .dropdown-search .search-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
        }

        .dropdown-list {
          flex: 1;
          overflow-y: auto;
          padding: 6px;
          max-height: 220px;
        }

        .dropdown-list::-webkit-scrollbar {
          width: 6px;
        }

        .dropdown-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .dropdown-list::-webkit-scrollbar-thumb {
          background: #c1c7cd;
          border-radius: 4px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .dropdown-item:hover {
          background: #f3f4f6;
        }

        .dropdown-item.highlighted {
          background: #eef2ff;
        }

        .dropdown-item.selected {
          background: #eef2ff;
        }

        .university-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .university-name {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a2e;
        }

        .university-type {
          font-size: 12px;
          color: #6b7280;
        }

        .university-city {
          font-size: 12px;
          color: #059669;
        }

        .check-icon {
          color: #4f46e5;
          flex-shrink: 0;
        }

        .loading-state,
        .empty-state {
          padding: 20px;
          text-align: center;
          color: #9ca3af;
          font-size: 14px;
        }

        .select-error {
          margin-top: 4px;
          font-size: 12px;
          color: #dc2626;
        }
      `}</style>
    </div>
  );
};

