// src/components/common/SearchBar/SearchBar.tsx

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

interface SearchBarProps {
  /** مقدار جستجو */
  value: string;
  /** تابع تغییر مقدار */
  onChange: (value: string) => void;
  /** placeholder */
  placeholder?: string;
  /** کلاس‌های اضافی */
  className?: string;
  /** تاخیر در اجرای جستجو (میلی‌ثانیه) */
  debounceDelay?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'جستجو...',
  className = '',
  debounceDelay = 500,
}) => {
  const [localValue, setLocalValue] = useState(value);

  // همگام‌سازی با value پراپ
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // دیبونس برای اجرای جستجو
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [localValue, debounceDelay, onChange, value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={`search-bar-wrapper ${className}`}>
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className="search-input"
        />
        {localValue && (
          <button className="search-clear-btn" onClick={handleClear}>
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
