// src/modules/city/components/CitySelect.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useCity } from '../hooks/useCity';
import { type City } from '../types/city.types';
import { Search, MapPin, X, Check } from 'lucide-react';

interface CitySelectProps {
  value?: number | null;
  onChange: (cityId: number | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  provinceId?: number | null; // برای فیلتر بر اساس استان
}

export const CitySelect: React.FC<CitySelectProps> = ({
  value,
  onChange,
  placeholder = 'انتخاب شهر...',
  label,
  required = false,
  disabled = false,
  error,
  className = '',
  provinceId,
}) => {
  const { useList } = useCity();
  const { data: cities = [], isLoading } = useList({ province: provinceId || undefined });
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ========== Filter Cities ==========
  const filteredCities = cities.filter((city) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    return city.name.toLowerCase().includes(search) ||
           city.province_name?.toLowerCase().includes(search);
  });

  // ========== Selected City ==========
  const selectedCity = cities.find((c) => c.id === value);

  // ========== Handlers ==========
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

  const handleSelect = (city: City) => {
    if (city.id === value) {
      onChange(null);
    } else {
      onChange(city.id);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearchTerm('');
  };

  // ========== Keyboard Navigation ==========
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
          prev < filteredCities.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredCities.length) {
          handleSelect(filteredCities[highlightedIndex]);
        }
        break;
    }
  };

  // ========== Click Outside ==========
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

  // ========== Scroll to highlighted ==========
  useEffect(() => {
    if (highlightedIndex >= 0) {
      const list = document.getElementById('city-select-list');
      const item = list?.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  // ========== Render ==========
  return (
    <div 
      ref={containerRef}
      className={`city-select ${className} ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${error ? 'has-error' : ''}`}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label className="select-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}

      <div className="select-control" onClick={toggleOpen}>
        <div className="select-value">
          <MapPin size={16} className="select-icon" />
          {selectedCity ? (
            <div className="selected-info">
              <span className="selected-name">{selectedCity.name}</span>
              {selectedCity.province_name && (
                <span className="selected-province">{selectedCity.province_name}</span>
              )}
            </div>
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
        </div>

        <div className="select-actions">
          {selectedCity && (
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
              placeholder="جستجوی شهر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div id="city-select-list" className="dropdown-list">
            {isLoading ? (
              <div className="loading-state">در حال بارگذاری...</div>
            ) : filteredCities.length === 0 ? (
              <div className="empty-state">نتیجه‌ای یافت نشد</div>
            ) : (
              filteredCities.map((city, index) => {
                const isSelected = city.id === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={city.id}
                    className={`dropdown-item ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                    onClick={() => handleSelect(city)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="city-info">
                      <span className="city-name">{city.name}</span>
                      {city.province_name && (
                        <span className="city-province">{city.province_name}</span>
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

      {error && <div className="select-error">{error}</div>}

      <style>{`
        .city-select {
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

        .city-select.open .select-control {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .city-select.has-error .select-control {
          border-color: #dc2626;
        }

        .city-select.disabled .select-control {
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
          color: #2563eb;
          flex-shrink: 0;
        }

        .selected-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .selected-name {
          font-weight: 500;
          color: #1a1a2e;
        }

        .selected-province {
          font-size: 12px;
          color: #6b7280;
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
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
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
          background: #dbeafe;
        }

        .dropdown-item.selected {
          background: #dbeafe;
        }

        .city-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .city-name {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a2e;
        }

        .city-province {
          font-size: 12px;
          color: #6b7280;
        }

        .check-icon {
          color: #2563eb;
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