// src/modules/company/components/CompanySearch.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useCompany } from '../hooks/useCompany';
import { type Company } from '../types/company.types';
import { Search, Building2, X } from 'lucide-react';

interface CompanySearchProps {
  onSelect: (company: Company) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  minSearchLength?: number;
  autoFocus?: boolean;
}

export const CompanySearch: React.FC<CompanySearchProps> = ({
  onSelect,
  placeholder = 'جستجوی شرکت...',
  label,
  className = '',
  minSearchLength = 2,
  autoFocus = false,
}) => {
  const { useList } = useCompany();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ========== جستجو با حداقل 2 کاراکتر ==========
  const shouldSearch = searchTerm.length >= minSearchLength;
  
  const { data: companies = [], isLoading } = useList({
    search: shouldSearch ? searchTerm : undefined,
  });

  // ========== فیلتر کردن نتایج ==========
  const filteredCompanies = shouldSearch ? companies : [];

  // ========== هندلرها ==========
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(value.length >= minSearchLength);
    setHighlightedIndex(-1);
  };

  const handleSelect = (company: Company) => {
    onSelect(company);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCompanies.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredCompanies.length) {
          handleSelect(filteredCompanies[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // ========== کلیک خارج از کامپوننت ==========
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ========== فوکوس خودکار ==========
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // ========== اسکرول به آیتم هایلایت شده ==========
  useEffect(() => {
    if (highlightedIndex >= 0) {
      const list = document.getElementById('company-search-list');
      const item = list?.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className={`company-search ${className}`}>
      {label && (
        <label className="search-label">
          {label}
        </label>
      )}

      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length >= minSearchLength && setIsOpen(true)}
        />
        {searchTerm && (
          <button className="clear-btn" onClick={handleClear} type="button">
            <X size={16} />
          </button>
        )}
        {isLoading && (
          <span className="loading-spinner">
            <span className="spinner-border spinner-border-sm" />
          </span>
        )}
      </div>

      {isOpen && (
        <div className="search-results" id="company-search-list">
          {isLoading ? (
            <div className="result-item loading">
              <span>در حال جستجو...</span>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="result-item empty">
              <span>نتیجه‌ای یافت نشد</span>
            </div>
          ) : (
            filteredCompanies.map((company, index) => {
              const isHighlighted = index === highlightedIndex;
              return (
                <div
                  key={company.id}
                  className={`result-item ${isHighlighted ? 'highlighted' : ''}`}
                  onClick={() => handleSelect(company)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="result-icon">
                    <Building2 size={16} />
                  </div>
                  <div className="result-info">
                    <div className="result-name">{company.name}</div>
                    <div className="result-details">
                      {company.economic_code && (
                        <span>کد اقتصادی: {company.economic_code}</span>
                      )}
                      {company.phone && (
                        <span>تلفن: {company.phone}</span>
                      )}
                      {company.email && (
                        <span>ایمیل: {company.email}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <style>{`
        .company-search {
          position: relative;
          width: 100%;
        }

        .search-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
        }

        .search-input-wrapper {
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 10px 40px 10px 14px;
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
          background: white;
          padding-right: 40px;
        }

        .search-input:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
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
          border-radius: 4px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .clear-btn:hover {
          color: #ef4444;
          background: #f3f4f6;
        }

        .loading-spinner {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
        }

        .search-results {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
          z-index: 1050;
          max-height: 300px;
          overflow-y: auto;
          padding: 4px 0;
        }

        .search-results::-webkit-scrollbar {
          width: 6px;
        }

        .search-results::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .search-results::-webkit-scrollbar-thumb {
          background: #c1c7cd;
          border-radius: 4px;
        }

        .result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          cursor: pointer;
          transition: all 0.15s;
          border-bottom: 1px solid #f3f4f6;
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .result-item:hover {
          background: #f8fafc;
        }

        .result-item.highlighted {
          background: #eef2ff;
        }

        .result-item.loading,
        .result-item.empty {
          cursor: default;
          color: #9ca3af;
          justify-content: center;
        }

        .result-item.loading:hover,
        .result-item.empty:hover {
          background: transparent;
        }

        .result-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #eef2ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .result-info {
          flex: 1;
          min-width: 0;
        }

        .result-name {
          font-weight: 500;
          color: #1a1a2e;
          font-size: 14px;
        }

        .result-details {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #6b7280;
          flex-wrap: wrap;
          margin-top: 2px;
        }

        .result-details span {
          background: #f3f4f6;
          padding: 0 8px;
          border-radius: 4px;
          white-space: nowrap;
        }

        .spinner-border {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #4f46e5;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 480px) {
          .result-details {
            flex-direction: column;
            gap: 4px;
          }

          .result-details span {
            white-space: normal;
          }

          .result-item {
            padding: 8px 12px;
          }
        }
      `}</style>
    </div>
  );
};