// components/generic/GenericSearchableSelect.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  group?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface GenericSearchableSelectProps {
  options: SelectOption[];
  value?: string | number | null;
  onChange: (value: string | number | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  isMulti?: boolean;
  isLoading?: boolean;
  noOptionsMessage?: string;
  onSearch?: (term: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export function GenericSearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'انتخاب کنید...',
  searchPlaceholder = 'جستجو...',
  label,
  required = false,
  disabled = false,
  error,
  className = '',
  isMulti = false,
  isLoading = false,
  noOptionsMessage = 'موردی یافت نشد',
  onSearch,
  onOpen,
  onClose,
}: GenericSearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ========== Filter Options ==========
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const term = searchTerm.toLowerCase().trim();
    return options.filter(opt => 
      opt.label.toLowerCase().includes(term) ||
      String(opt.value).toLowerCase().includes(term)
    );
  }, [options, searchTerm]);
// ✅ اضافه کردن console.log برای دیباگ
console.log('🔍 SearchableSelect - options:', options);
console.log('🔍 SearchableSelect - filteredOptions:', filteredOptions);
  // ========== Get Selected Labels ==========
  const selectedLabels = useMemo(() => {
    if (isMulti && Array.isArray(value)) {
      return options
        .filter(opt => value.includes(opt.value))
        .map(opt => opt.label);
    }
    const selected = options.find(opt => opt.value === value);
    return selected ? [selected.label] : [];
  }, [options, value, isMulti]);

  // ========== Handlers ==========
  const toggleOpen = useCallback(() => {
    if (disabled || isLoading) return;
    setIsOpen(prev => {
      const newState = !prev;
      if (newState) {
        onOpen?.();
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        onClose?.();
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
      return newState;
    });
  }, [disabled, isLoading, onOpen, onClose]);

  const handleSelect = useCallback((option: SelectOption) => {
    if (option.disabled) return;

    if (isMulti) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.includes(option.value)
        ? currentValue.filter(v => v !== option.value)
        : [...currentValue, option.value];
      onChange(newValue);
    } else {
      onChange(option.value === value ? null : option.value);
      setIsOpen(false);
      setSearchTerm('');
      onClose?.();
    }
  }, [isMulti, value, onChange, onClose]);

  const handleRemove = useCallback((val: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMulti && Array.isArray(value)) {
      onChange(value.filter(v => v !== val));
    }
  }, [isMulti, value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        toggleOpen();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        onClose?.();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
    }
  }, [isOpen, filteredOptions, highlightedIndex, handleSelect, toggleOpen, onClose]);

  // ========== Click Outside ==========
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // ========== Scroll to highlighted ==========
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  // ========== Search Effect ==========
  useEffect(() => {
    if (onSearch && searchTerm) {
      const timer = setTimeout(() => onSearch(searchTerm), 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, onSearch]);

  // ========== Render ==========
  return (
    <div 
      ref={containerRef}
      className={`generic-searchable-select ${className} ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${error ? 'has-error' : ''}`}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label className="select-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div 
        className="select-control" 
        onClick={toggleOpen}
      >
        {/* Selected Values */}
        <div className="select-values">
          {isMulti && selectedLabels.length > 0 ? (
            selectedLabels.map((label, idx) => (
              <span key={idx} className="select-tag">
                {label}
                <button
                  type="button"
                  className="tag-remove"
                  onClick={(e) => handleRemove(
                    Array.isArray(value) ? value[idx] : 0, 
                    e
                  )}
                >
                  <X size={12} />
                </button>
              </span>
            ))
          ) : (
            <span className={`select-placeholder ${selectedLabels.length > 0 ? 'has-value' : ''}`}>
              {selectedLabels.length > 0 ? selectedLabels[0] : placeholder}
            </span>
          )}
        </div>

        {/* Loading / Chevron */}
        <div className="select-indicators">
          {isLoading ? (
            <span className="spinner-border spinner-border-sm text-primary" />
          ) : (
            <ChevronDown 
              size={18} 
              className={`chevron ${isOpen ? 'rotated' : ''}`}
            />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="select-dropdown">
          <div className="dropdown-search">
            <Search size={16} className="search-icon" />
            <input
              ref={inputRef}
              type="text"
              className="dropdown-input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchTerm('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div ref={listRef} className="dropdown-list">
            {filteredOptions.length === 0 ? (
              <div className="no-options">{noOptionsMessage}</div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = isMulti
                  ? Array.isArray(value) && value.includes(option.value)
                  : option.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={option.value}
                    className={`dropdown-item ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''} ${option.disabled ? 'disabled' : ''}`}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {option.icon && <span className="item-icon">{option.icon}</span>}
                    <span className="item-label">{option.label}</span>
                    {isSelected && <Check size={14} className="item-check" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <div className="select-error">{error}</div>}

      <style>{`
        .generic-searchable-select {
          position: relative;
          width: 100%;
        }

        .select-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 6px;
          color: #1f2937;
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

        .generic-searchable-select.open .select-control {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .generic-searchable-select.has-error .select-control {
          border-color: #ef4444;
        }

        .generic-searchable-select.disabled .select-control {
          background: #f3f4f6;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .select-values {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          flex: 1;
          align-items: center;
          min-height: 30px;
        }

        .select-placeholder {
          color: #9ca3af;
          font-size: 14px;
        }

        .select-placeholder.has-value {
          color: #1f2937;
        }

        .select-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 13px;
          border-radius: 6px;
          border: 1px solid #c7d2fe;
        }

        .tag-remove {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          padding: 0;
          color: #4f46e5;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .tag-remove:hover {
          opacity: 1;
        }

        .select-indicators {
          display: flex;
          align-items: center;
          color: #9ca3af;
        }

        .chevron {
          transition: transform 0.2s ease;
        }

        .chevron.rotated {
          transform: rotate(180deg);
        }

        /* Dropdown */
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
          max-height: 320px;
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

        .dropdown-input {
          width: 100%;
          padding: 8px 36px 8px 12px;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }

        .dropdown-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
        }

        .clear-search {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .clear-search:hover {
          background: #f3f4f6;
          color: #1f2937;
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
          gap: 10px;
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
          color: #4f46e5;
        }

        .dropdown-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .item-icon {
          display: flex;
          align-items: center;
        }

        .item-label {
          flex: 1;
          font-size: 14px;
        }

        .item-check {
          color: #4f46e5;
          flex-shrink: 0;
        }

        .no-options {
          padding: 20px;
          text-align: center;
          color: #9ca3af;
          font-size: 14px;
        }

        .select-error {
          margin-top: 6px;
          font-size: 13px;
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}
//