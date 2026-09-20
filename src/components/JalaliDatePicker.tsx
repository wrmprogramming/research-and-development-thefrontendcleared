//modern 3 PICKER_SCALE=0.75
//modern 3
// src/components/JalaliDatePicker.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import moment from 'moment-jalaali';

interface JalaliDatePickerProps {
  value?: string | null;
  onChange: (date: string | null) => void;
  placeholder?: string;
  required?: boolean;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

moment.loadPersian({ dialect: 'persian-modern' });

const LEAP_YEARS = [
  1210, 1214, 1218, 1222, 1226, 1230, 1234, 1238, 1243,
  1247, 1251, 1255, 1259, 1263, 1267, 1271, 1276,
  1280, 1284, 1288, 1292, 1296, 1300, 1304, 1309,
  1313, 1317, 1321, 1325, 1329, 1333, 1337, 1342,
  1346, 1350, 1354, 1358, 1362, 1366, 1370, 1375,
  1379, 1383, 1387, 1391, 1395, 1399, 1403, 1408,
  1412, 1416, 1420, 1424, 1428, 1432, 1436, 1441,
  1445, 1449, 1453, 1457, 1461, 1465, 1469, 1474,
  1478, 1482, 1486, 1490, 1494, 1498
];

const getJalaliMonthDays = (year: number, month: number): number => {
  const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  if (month === 12) {
    return LEAP_YEARS.includes(year) ? 30 : 29;
  }
  return daysInMonth[month - 1];
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  const date = moment(`${year}/${month}/01`, 'jYYYY/jMM/jDD');
  let day = date.day();
  day = (day + 1) % 7;
  return day;
};

const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  value,
  onChange,
  placeholder = '1402/12/25',
  required = false,
  label,
  error,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(moment().jYear());
  const [currentMonth, setCurrentMonth] = useState(moment().jMonth() + 1);
  const [currentDay, setCurrentDay] = useState(moment().jDate());
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showDayDropdown, setShowDayDropdown] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const dayDropdownRef = useRef<HTMLDivElement>(null);

  // ✅🆕 مقدار مقیاس - برای تغییر سایز فقط این عدد رو عوض کن
  // مثلا: 0.75 = ۷۵٪، 0.85 = ۸۵٪، 1 = سایز اصلی
  const PICKER_SCALE = 0.85;

  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  const formatJalaliDate = (year: number, month: number, day: number): string => {
    return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
  };

  // ✅ ساده و درست
  const parseJalaliDate = (dateStr: string): { year: number; month: number; day: number } | null => {
    if (!dateStr) return null;
    
    const clean = dateStr.replace(/[^0-9/]/g, '');
    const parts = clean.split('/');
    
    if (parts.length !== 3) return null;
    
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    if (year < 1300 || year > 1500) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    
    const formatted = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    const m = moment(formatted, 'jYYYY/jMM/jDD');
    if (!m.isValid()) return null;
    
    return { year, month, day };
  };

  const toJalaliFormat = (dateStr: string | null | undefined): string | null => {
    if (!dateStr) return null;
    const parsed = parseJalaliDate(dateStr);
    if (parsed) {
      return formatJalaliDate(parsed.year, parsed.month, parsed.day);
    }
    if (dateStr.includes('-')) {
      try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          const day = parseInt(parts[2]);
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            const m = moment(`${year}/${month}/${day}`, 'YYYY/MM/DD');
            if (m.isValid()) {
              return formatJalaliDate(m.jYear(), m.jMonth() + 1, m.jDate());
            }
          }
        }
      } catch (e) {
        console.warn('Error parsing date:', dateStr, e);
      }
    }
    return null;
  };

  useEffect(() => {
    if (!value || value === '' || value === 'null' || value === 'undefined') {
      if (!isTyping) {
        setInputValue('');
      }
      return;
    }
    if (value && !isTyping) {
      const formatted = toJalaliFormat(value);
      if (formatted) {
        const parsed = parseJalaliDate(formatted);
        if (parsed) {
          setInputValue(formatted);
          setCurrentYear(parsed.year);
          setCurrentMonth(parsed.month);
          setCurrentDay(parsed.day);
          return;
        }
      }
      setInputValue('');
    } else if (!value && !isTyping) {
      setInputValue('');
    }
  }, [value, isTyping]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowYearDropdown(false);
        setShowMonthDropdown(false);
        setShowDayDropdown(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setShowYearDropdown(false);
      }
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setShowMonthDropdown(false);
      }
      if (dayDropdownRef.current && !dayDropdownRef.current.contains(event.target as Node)) {
        setShowDayDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDays = () => {
    const daysInMonth = getJalaliMonthDays(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handleDateSelect = (day: number) => {
    const jalaliStr = formatJalaliDate(currentYear, currentMonth, day);
    onChange(jalaliStr);
    setInputValue(jalaliStr);
    setCurrentDay(day);
    setIsOpen(false);
    setIsTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    setIsTyping(true);
    
    val = val.replace(/[^0-9/]/g, '');
    if (val.length > 10) {
      val = val.slice(0, 10);
    }
    
    const numbers = val.replace(/\//g, '');
    if (numbers.length >= 5 && !val.includes('/')) {
      val = `${numbers.slice(0, 4)}/${numbers.slice(4)}`;
    } else if (numbers.length >= 7 && val.split('/').length === 2) {
      const parts = val.split('/');
      if (parts[1].length >= 2) {
        val = `${parts[0]}/${parts[1].slice(0, 2)}/${numbers.slice(6)}`;
      }
    }
    
    setInputValue(val);
    
    if (val.length >= 4) {
      const parts = val.split('/');
      
      if (parts.length >= 1) {
        const year = parseInt(parts[0]);
        if (!isNaN(year) && year >= 1300 && year <= 1500) {
          setCurrentYear(year);
        }
      }
      
      if (parts.length >= 2) {
        const month = parseInt(parts[1]);
        if (!isNaN(month) && month >= 1 && month <= 12) {
          setCurrentMonth(month);
        }
      }
      
      if (parts.length >= 3) {
        const day = parseInt(parts[2]);
        if (!isNaN(day) && day >= 1 && day <= 31) {
          setCurrentDay(day);
        }
      }
    }
  };

  const handleInputBlur = () => {
    setIsTyping(false);
    
    if (!inputValue) {
      onChange(null);
      return;
    }

    console.log('📝 Input value on blur:', inputValue);
    
    const parsed = parseJalaliDate(inputValue);
    console.log('📝 Parsed result:', parsed);
    if (parsed) {
      const formatted = formatJalaliDate(parsed.year, parsed.month, parsed.day);
      console.log('📝 Formatted date:', formatted);
      onChange(formatted);
      setInputValue(formatted);
      setCurrentYear(parsed.year);
      setCurrentMonth(parsed.month);
      setCurrentDay(parsed.day);
      return;
    }
    
    if (value) {
      const formatted = toJalaliFormat(value);
      if (formatted) {
        setInputValue(formatted);
      } else {
        setInputValue('');
        onChange(null);
      }
    } else {
      setInputValue('');
      onChange(null);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
      setIsOpen(false);
    }
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const changeMonth = (delta: number) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const changeYear = (delta: number) => {
    setCurrentYear(prev => prev + delta);
  };

  const clearDate = () => {
    onChange(null);
    setInputValue('');
    setIsOpen(false);
    setIsTyping(false);
  };

  const isToday = (day: number) => {
    const today = moment();
    const todayYear = today.jYear();
    const todayMonth = today.jMonth() + 1;
    const todayDay = today.jDate();
    
    return todayYear === currentYear && todayMonth === currentMonth && todayDay === day;
  };

  const isSelected = (day: number) => {
    if (inputValue && inputValue.length >= 4) {
      const parts = inputValue.split('/');
      
      let year = null;
      if (parts.length >= 1) {
        year = parseInt(parts[0]);
        if (isNaN(year) || year < 1300 || year > 1500) return false;
      }
      
      let month = null;
      if (parts.length >= 2) {
        month = parseInt(parts[1]);
        if (isNaN(month) || month < 1 || month > 12) return false;
      }
      
      let dayFromInput = null;
      if (parts.length >= 3) {
        dayFromInput = parseInt(parts[2]);
        if (isNaN(dayFromInput) || dayFromInput < 1 || dayFromInput > 31) return false;
      }
      
      if (year === currentYear && month === currentMonth && dayFromInput !== null) {
        return dayFromInput === day;
      }
      
      if (year === currentYear && month === currentMonth && dayFromInput === null) {
        return false;
      }
    }
    return false;
  };

  const goToToday = () => {
    const today = moment();
    const year = today.jYear();
    const month = today.jMonth() + 1;
    const day = today.jDate();
    const jalaliStr = formatJalaliDate(year, month, day);
    
    onChange(jalaliStr);
    setInputValue(jalaliStr);
    setCurrentYear(year);
    setCurrentMonth(month);
    setCurrentDay(day);
    setIsOpen(false);
    setIsTyping(false);
  };

  const handleYearSelect = (year: number) => {
    setCurrentYear(year);
    setShowYearDropdown(false);
  };

  const handleMonthSelect = (month: number) => {
    setCurrentMonth(month);
    setShowMonthDropdown(false);
  };

  const handleDaySelect = (day: number) => {
    const jalaliStr = formatJalaliDate(currentYear, currentMonth, day);
    onChange(jalaliStr);
    setInputValue(jalaliStr);
    setCurrentDay(day);
    setShowDayDropdown(false);
    setIsOpen(false);
  };

  const getYearOptions = () => {
    const years = [];
    for (let i = 1300; i <= 1500; i++) {
      years.push(i);
    }
    return years;
  };

  const getMonthOptions = () => {
    return monthNames.map((name, index) => ({
      value: index + 1,
      label: name
    }));
  };

  const getDayOptions = () => {
    const daysInMonth = getJalaliMonthDays(currentYear, currentMonth);
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const displayValue = inputValue;

  return (
    <div className={`position-relative ${className}`} ref={pickerRef} style={{ direction: 'rtl' }}>
      {label && (
        <label className="form-label fw-semibold mb-1" style={{ 
          fontSize: '13px', 
          color: '#374151',
          display: 'block',
          marginBottom: '4px'
        }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}
      
      <div className="position-relative">
        <input
          type="text"
          className={`form-control ${error ? 'is-invalid' : ''}`}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          onClick={handleInputClick}
          disabled={disabled}
          required={required}
          style={{ 
            padding: '10px 14px',
            direction: 'ltr',
            borderRadius: '10px',
            border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
            width: '100%',
            fontFamily: 'monospace',
            fontSize: '14px',
            backgroundColor: disabled ? '#f9fafb' : 'white',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            outline: 'none',
            color: '#1f2937'
          }}
          onFocus={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = '#6366f1';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.12)';
            }
          }}
          onBlur={(e) => {
            if (!disabled && !error) {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        />
      </div>
      
      {error && (
        <div className="text-danger small mt-1" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </div>
      )}

      {isOpen && !disabled && (
        <>
          <div 
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              zIndex: 1040,
              backgroundColor: 'rgba(0,0,0,0.08)',
              backdropFilter: 'blur(2px)',
              transition: 'all 0.3s ease'
            }}
            onClick={() => {
              setIsOpen(false);
              setShowYearDropdown(false);
              setShowMonthDropdown(false);
              setShowDayDropdown(false);
            }}
          />

          {/* ============================================================ */}
          {/* ✅🆕 WRAPPER جدید برای تغییر سایز                            */}
          {/* این wrapper موقعیت و فضای پاپ‌آپ رو حفظ می‌کنه               */}
          {/* height: 0 تا فضای اضافی اشغال نکنه                           */}
          {/* pointerEvents: 'none' تا کلیک‌ها به عناصر زیرین برسه          */}
          {/* ============================================================ */}
          <div style={{ 
            position: 'absolute', 
            top: '100%', 
            // left: 0,
            right: 0,                    // ✅ برای RTL بهتره
            width: '340px',        // 🆕 همون عرض اصلی تقویم
            // height: 0,             // 🆕 ارتفاع صفر
            zIndex: 1050,          // 🆕 z-index منتقل شده از div داخلی
            pointerEvents: 'none'  // 🆕 کلیک‌ها از wrapper رد بشن
          }}>
            <div 
              className="bg-white rounded-2 shadow-xl"
              style={{ 
                width: '340px',
                // ============================================================ 
                // ✅🆕 این ۳ خط برای کوچک کردن اضافه شدن
                // ============================================================
                transform: `scale(${PICKER_SCALE})`,  // 🆕 کوچک کردن به ۷۵٪
                transformOrigin: 'top right',   // ✅ برای RTL بهتره
                // transformOrigin: 'top left',          // 🆕 از گوشه بالا-چپ کوچک بشه
                pointerEvents: 'auto',                // 🆕 برگرداندن کلیک‌پذیری به تقویم
                // ============================================================
                boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.06)',
                border: '1px solid #f1f3f5',
                borderRadius: '12px',
                overflow: 'hidden',
                animation: 'fadeInDown 0.2s ease-out'
              }}
            >
              <style>{`
               
                @keyframes fadeInDown {
                  from { opacity: 0; }
                  to   { opacity: 1; }
                }
                .date-picker-scroll::-webkit-scrollbar {
                  width: 4px;
                }
                .date-picker-scroll::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 4px;
                }
                .date-picker-scroll::-webkit-scrollbar-thumb {
                  background: #d1d5db;
                  border-radius: 4px;
                }
                .date-picker-scroll::-webkit-scrollbar-thumb:hover {
                  background: #9ca3af;
                }
              `}</style>

              {/* هدر تقویم - کد کاملش مثل قبل */}
              <div style={{ 
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                padding: '14px 16px',
                color: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                  <button type="button" onClick={() => changeYear(-1)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', fontSize: '16px', fontWeight: 'bold', backdropFilter: 'blur(4px)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}>«</button>
                  <button type="button" onClick={() => changeMonth(-1)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', fontSize: '16px', fontWeight: 'bold', backdropFilter: 'blur(4px)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}>‹</button>

                  <div style={{ display: 'flex', gap: '6px', flex: 1, justifyContent: 'center' }}>
                    {/* انتخاب سال */}
                    <div style={{ position: 'relative' }} ref={yearDropdownRef}>
                      <button type="button" onClick={() => { setShowYearDropdown(!showYearDropdown); setShowMonthDropdown(false); setShowDayDropdown(false); }} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px', padding: '4px 14px', cursor: 'pointer', color: 'white', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', minWidth: '60px', justifyContent: 'center', transition: 'all 0.2s', backdropFilter: 'blur(4px)', height: '32px' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}>
                        {currentYear}
                        {showYearDropdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {showYearDropdown && (
                        <div className="date-picker-scroll" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', background: 'white', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxHeight: '200px', overflowY: 'auto', zIndex: 1060, minWidth: '80px', color: '#1f2937', border: '1px solid #f1f3f5' }}>
                          {getYearOptions().map((year) => (
                            <div key={year} onClick={() => handleYearSelect(year)} style={{ padding: '8px 18px', cursor: 'pointer', fontSize: '14px', textAlign: 'center', background: year === currentYear ? '#eef2ff' : 'transparent', color: year === currentYear ? '#4f46e5' : '#374151', fontWeight: year === currentYear ? '600' : '400', transition: 'all 0.15s', borderBottom: '1px solid #f3f4f6' }} onMouseEnter={(e) => { if (year !== currentYear) { e.currentTarget.style.background = '#f9fafb'; } }} onMouseLeave={(e) => { if (year !== currentYear) { e.currentTarget.style.background = 'transparent'; } }}>{year}</div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* انتخاب ماه */}
                    <div style={{ position: 'relative' }} ref={monthDropdownRef}>
                      <button type="button" onClick={() => { setShowMonthDropdown(!showMonthDropdown); setShowYearDropdown(false); setShowDayDropdown(false); }} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px', padding: '4px 14px', cursor: 'pointer', color: 'white', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', minWidth: '70px', justifyContent: 'center', transition: 'all 0.2s', backdropFilter: 'blur(4px)', height: '32px' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}>
                        {monthNames[currentMonth - 1]}
                        {showMonthDropdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {showMonthDropdown && (
                        <div className="date-picker-scroll" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', background: 'white', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxHeight: '200px', overflowY: 'auto', zIndex: 1060, minWidth: '100px', color: '#1f2937', border: '1px solid #f1f3f5' }}>
                          {getMonthOptions().map((month) => (
                            <div key={month.value} onClick={() => handleMonthSelect(month.value)} style={{ padding: '8px 18px', cursor: 'pointer', fontSize: '14px', textAlign: 'center', background: month.value === currentMonth ? '#eef2ff' : 'transparent', color: month.value === currentMonth ? '#4f46e5' : '#374151', fontWeight: month.value === currentMonth ? '600' : '400', transition: 'all 0.15s', borderBottom: '1px solid #f3f4f6' }} onMouseEnter={(e) => { if (month.value !== currentMonth) { e.currentTarget.style.background = '#f9fafb'; } }} onMouseLeave={(e) => { if (month.value !== currentMonth) { e.currentTarget.style.background = 'transparent'; } }}>{month.label}</div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* انتخاب روز */}
                    <div style={{ position: 'relative' }} ref={dayDropdownRef}>
                      <button type="button" onClick={() => { setShowDayDropdown(!showDayDropdown); setShowYearDropdown(false); setShowMonthDropdown(false); }} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', color: 'white', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', minWidth: '50px', justifyContent: 'center', transition: 'all 0.2s', backdropFilter: 'blur(4px)', height: '32px' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}>
                        {currentDay}
                        {showDayDropdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {showDayDropdown && (
                        <div className="date-picker-scroll" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', background: 'white', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxHeight: '200px', overflowY: 'auto', zIndex: 1060, minWidth: '60px', color: '#1f2937', border: '1px solid #f1f3f5' }}>
                          {getDayOptions().map((day) => (
                            <div key={day} onClick={() => handleDaySelect(day)} style={{ padding: '8px 18px', cursor: 'pointer', fontSize: '14px', textAlign: 'center', background: day === currentDay ? '#eef2ff' : 'transparent', color: day === currentDay ? '#4f46e5' : '#374151', fontWeight: day === currentDay ? '600' : '400', transition: 'all 0.15s', borderBottom: '1px solid #f3f4f6' }} onMouseEnter={(e) => { if (day !== currentDay) { e.currentTarget.style.background = '#f9fafb'; } }} onMouseLeave={(e) => { if (day !== currentDay) { e.currentTarget.style.background = 'transparent'; } }}>{day}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button type="button" onClick={() => changeMonth(1)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', fontSize: '16px', fontWeight: 'bold', backdropFilter: 'blur(4px)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}>›</button>
                  <button type="button" onClick={() => changeYear(1)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', fontSize: '16px', fontWeight: 'bold', backdropFilter: 'blur(4px)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}>»</button>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 10px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafbfc' }}>
                {weekDays.map((day, idx) => (
                  <div key={idx} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', color: '#9ca3af', padding: '6px 0', letterSpacing: '0.5px' }}>{day}</div>
                ))}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 10px', gap: '2px' }}>
                {getDays().map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => day && handleDateSelect(day)}
                    disabled={!day}
                    style={{
                      textAlign: 'center',
                      padding: '8px 0',
                      borderRadius: '8px',
                      border: 'none',
                      background: isSelected(day) ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : isToday(day) ? '#eef2ff' : 'transparent',
                      color: isSelected(day) ? 'white' : isToday(day) ? '#4f46e5' : '#374151',
                      fontWeight: isSelected(day) ? '600' : isToday(day) ? '600' : '400',
                      cursor: day ? 'pointer' : 'default',
                      opacity: day ? 1 : 0.3,
                      fontSize: '14px',
                      transition: 'all 0.15s ease',
                      fontFamily: 'inherit',
                      boxShadow: isSelected(day) ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (day && !isSelected(day) && !isToday(day)) {
                        e.currentTarget.style.background = '#f3f4f6';
                        e.currentTarget.style.transform = 'scale(1.04)';
                      }
                      if (day && isToday(day) && !isSelected(day)) {
                        e.currentTarget.style.background = '#e0e7ff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (day && !isSelected(day) && !isToday(day)) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                      if (day && isToday(day) && !isSelected(day)) {
                        e.currentTarget.style.background = '#eef2ff';
                      }
                    }}
                  >
                    {day || ''}
                    {isToday(day) && !isSelected(day) && (
                      <span style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#4f46e5' }} />
                    )}
                  </button>
                ))}
              </div>
              
              <div style={{ padding: '10px', borderTop: '1px solid #f3f4f6', textAlign: 'center', background: '#fafbfc', borderRadius: '0 0 12px 12px' }}>
                <button
                  type="button"
                  onClick={goToToday}
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '7px 28px',
                    color: 'white',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 2px 12px rgba(79, 70, 229, 0.3)',
                    fontWeight: '500',
                    letterSpacing: '0.3px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.04)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(79, 70, 229, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(79, 70, 229, 0.3)';
                  }}
                >
                  امروز
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default JalaliDatePicker;

// //modern 3
// // src/components/JalaliDatePicker.tsx
// import React, { useState, useRef, useEffect } from 'react';
// import { ChevronDown, ChevronUp } from 'lucide-react';
// import moment from 'moment-jalaali';

// interface JalaliDatePickerProps {
//   value?: string | null;
//   onChange: (date: string | null) => void;
//   placeholder?: string;
//   required?: boolean;
//   label?: string;
//   error?: string;
//   disabled?: boolean;
//   className?: string;
// }

// moment.loadPersian({ dialect: 'persian-modern' });

// const LEAP_YEARS = [
//   1210, 1214, 1218, 1222, 1226, 1230, 1234, 1238, 1243,
//   1247, 1251, 1255, 1259, 1263, 1267, 1271, 1276,
//   1280, 1284, 1288, 1292, 1296, 1300, 1304, 1309,
//   1313, 1317, 1321, 1325, 1329, 1333, 1337, 1342,
//   1346, 1350, 1354, 1358, 1362, 1366, 1370, 1375,
//   1379, 1383, 1387, 1391, 1395, 1399, 1403, 1408,
//   1412, 1416, 1420, 1424, 1428, 1432, 1436, 1441,
//   1445, 1449, 1453, 1457, 1461, 1465, 1469, 1474,
//   1478, 1482, 1486, 1490, 1494, 1498
// ];

// const getJalaliMonthDays = (year: number, month: number): number => {
//   const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
//   if (month === 12) {
//     return LEAP_YEARS.includes(year) ? 30 : 29;
//   }
//   return daysInMonth[month - 1];
// };

// const getFirstDayOfMonth = (year: number, month: number): number => {
//   const date = moment(`${year}/${month}/01`, 'jYYYY/jMM/jDD');
//   let day = date.day();
//   day = (day + 1) % 7;
//   return day;
// };

// const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
//   value,
//   onChange,
//   placeholder = '1402/12/25',
//   required = false,
//   label,
//   error,
//   disabled = false,
//   className = '',
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [currentYear, setCurrentYear] = useState(moment().jYear());
//   const [currentMonth, setCurrentMonth] = useState(moment().jMonth() + 1);
//   const [currentDay, setCurrentDay] = useState(moment().jDate());
//   const [inputValue, setInputValue] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [showYearDropdown, setShowYearDropdown] = useState(false);
//   const [showMonthDropdown, setShowMonthDropdown] = useState(false);
//   const [showDayDropdown, setShowDayDropdown] = useState(false);
//   const pickerRef = useRef<HTMLDivElement>(null);
//   const yearDropdownRef = useRef<HTMLDivElement>(null);
//   const monthDropdownRef = useRef<HTMLDivElement>(null);
//   const dayDropdownRef = useRef<HTMLDivElement>(null);

//   const monthNames = [
//     'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
//     'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
//   ];

//   const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

//   const formatJalaliDate = (year: number, month: number, day: number): string => {
//     return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
//   };

//   // ✅ ساده و درست
//   const parseJalaliDate = (dateStr: string): { year: number; month: number; day: number } | null => {
//     if (!dateStr) return null;
    
//     const clean = dateStr.replace(/[^0-9/]/g, '');
//     const parts = clean.split('/');
    
//     if (parts.length !== 3) return null;
    
//     const year = parseInt(parts[0]);
//     const month = parseInt(parts[1]);
//     const day = parseInt(parts[2]);
    
//     if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
//     if (year < 1300 || year > 1500) return null;
//     if (month < 1 || month > 12) return null;
//     if (day < 1 || day > 31) return null;
    
//     const formatted = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
//     const m = moment(formatted, 'jYYYY/jMM/jDD');
//     if (!m.isValid()) return null;
    
//     return { year, month, day };
//   };

//   const toJalaliFormat = (dateStr: string | null | undefined): string | null => {
//     if (!dateStr) return null;
//     const parsed = parseJalaliDate(dateStr);
//     if (parsed) {
//       return formatJalaliDate(parsed.year, parsed.month, parsed.day);
//     }
//     if (dateStr.includes('-')) {
//       try {
//         const parts = dateStr.split('-');
//         if (parts.length === 3) {
//           const year = parseInt(parts[0]);
//           const month = parseInt(parts[1]);
//           const day = parseInt(parts[2]);
//           if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
//             const m = moment(`${year}/${month}/${day}`, 'YYYY/MM/DD');
//             if (m.isValid()) {
//               return formatJalaliDate(m.jYear(), m.jMonth() + 1, m.jDate());
//             }
//           }
//         }
//       } catch (e) {
//         console.warn('Error parsing date:', dateStr, e);
//       }
//     }
//     return null;
//   };

//   useEffect(() => {
//     if (!value || value === '' || value === 'null' || value === 'undefined') {
//       if (!isTyping) {
//         setInputValue('');
//       }
//       return;
//     }
//     if (value && !isTyping) {
//       const formatted = toJalaliFormat(value);
//       if (formatted) {
//         const parsed = parseJalaliDate(formatted);
//         if (parsed) {
//           setInputValue(formatted);
//           setCurrentYear(parsed.year);
//           setCurrentMonth(parsed.month);
//           setCurrentDay(parsed.day);
//           return;
//         }
//       }
//       setInputValue('');
//     } else if (!value && !isTyping) {
//       setInputValue('');
//     }
//   }, [value, isTyping]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//         setShowYearDropdown(false);
//         setShowMonthDropdown(false);
//         setShowDayDropdown(false);
//       }
//       if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
//         setShowYearDropdown(false);
//       }
//       if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
//         setShowMonthDropdown(false);
//       }
//       if (dayDropdownRef.current && !dayDropdownRef.current.contains(event.target as Node)) {
//         setShowDayDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const getDays = () => {
//     const daysInMonth = getJalaliMonthDays(currentYear, currentMonth);
//     const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
//     const days = [];
    
//     for (let i = 0; i < firstDay; i++) {
//       days.push(null);
//     }
//     for (let i = 1; i <= daysInMonth; i++) {
//       days.push(i);
//     }
//     return days;
//   };

//   const handleDateSelect = (day: number) => {
//     const jalaliStr = formatJalaliDate(currentYear, currentMonth, day);
//     onChange(jalaliStr);
//     setInputValue(jalaliStr);
//     setCurrentDay(day);
//     setIsOpen(false);
//     setIsTyping(false);
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let val = e.target.value;
//     setIsTyping(true);
    
//     val = val.replace(/[^0-9/]/g, '');
//     if (val.length > 10) {
//       val = val.slice(0, 10);
//     }
    
//     const numbers = val.replace(/\//g, '');
//     if (numbers.length >= 5 && !val.includes('/')) {
//       val = `${numbers.slice(0, 4)}/${numbers.slice(4)}`;
//     } else if (numbers.length >= 7 && val.split('/').length === 2) {
//       const parts = val.split('/');
//       if (parts[1].length >= 2) {
//         val = `${parts[0]}/${parts[1].slice(0, 2)}/${numbers.slice(6)}`;
//       }
//     }
    
//     setInputValue(val);
    
//     if (val.length >= 4) {
//       const parts = val.split('/');
      
//       if (parts.length >= 1) {
//         const year = parseInt(parts[0]);
//         if (!isNaN(year) && year >= 1300 && year <= 1500) {
//           setCurrentYear(year);
//         }
//       }
      
//       if (parts.length >= 2) {
//         const month = parseInt(parts[1]);
//         if (!isNaN(month) && month >= 1 && month <= 12) {
//           setCurrentMonth(month);
//         }
//       }
      
//       if (parts.length >= 3) {
//         const day = parseInt(parts[2]);
//         if (!isNaN(day) && day >= 1 && day <= 31) {
//           setCurrentDay(day);
//         }
//       }
//     }
//   };

//   const handleInputBlur = () => {
//     setIsTyping(false);
    
//     if (!inputValue) {
//       onChange(null);
//       return;
//     }

//     console.log('📝 Input value on blur:', inputValue);
    
//     const parsed = parseJalaliDate(inputValue);
//     console.log('📝 Parsed result:', parsed);
//     if (parsed) {
//       const formatted = formatJalaliDate(parsed.year, parsed.month, parsed.day);
//       console.log('📝 Formatted date:', formatted);
//       onChange(formatted);
//       setInputValue(formatted);
//       setCurrentYear(parsed.year);
//       setCurrentMonth(parsed.month);
//       setCurrentDay(parsed.day);
//       return;
//     }
    
//     if (value) {
//       const formatted = toJalaliFormat(value);
//       if (formatted) {
//         setInputValue(formatted);
//       } else {
//         setInputValue('');
//         onChange(null);
//       }
//     } else {
//       setInputValue('');
//       onChange(null);
//     }
//   };

//   const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       handleInputBlur();
//       setIsOpen(false);
//     }
//   };

//   const handleInputClick = () => {
//     if (!disabled) {
//       setIsOpen(true);
//     }
//   };

//   const changeMonth = (delta: number) => {
//     let newMonth = currentMonth + delta;
//     let newYear = currentYear;
    
//     if (newMonth < 1) {
//       newMonth = 12;
//       newYear--;
//     } else if (newMonth > 12) {
//       newMonth = 1;
//       newYear++;
//     }
//     setCurrentMonth(newMonth);
//     setCurrentYear(newYear);
//   };

//   const changeYear = (delta: number) => {
//     setCurrentYear(prev => prev + delta);
//   };

//   const clearDate = () => {
//     onChange(null);
//     setInputValue('');
//     setIsOpen(false);
//     setIsTyping(false);
//   };

//   const isToday = (day: number) => {
//     const today = moment();
//     const todayYear = today.jYear();
//     const todayMonth = today.jMonth() + 1;
//     const todayDay = today.jDate();
    
//     return todayYear === currentYear && todayMonth === currentMonth && todayDay === day;
//   };

//   const isSelected = (day: number) => {
//     if (inputValue && inputValue.length >= 4) {
//       const parts = inputValue.split('/');
      
//       let year = null;
//       if (parts.length >= 1) {
//         year = parseInt(parts[0]);
//         if (isNaN(year) || year < 1300 || year > 1500) return false;
//       }
      
//       let month = null;
//       if (parts.length >= 2) {
//         month = parseInt(parts[1]);
//         if (isNaN(month) || month < 1 || month > 12) return false;
//       }
      
//       let dayFromInput = null;
//       if (parts.length >= 3) {
//         dayFromInput = parseInt(parts[2]);
//         if (isNaN(dayFromInput) || dayFromInput < 1 || dayFromInput > 31) return false;
//       }
      
//       if (year === currentYear && month === currentMonth && dayFromInput !== null) {
//         return dayFromInput === day;
//       }
      
//       if (year === currentYear && month === currentMonth && dayFromInput === null) {
//         return false;
//       }
//     }
//     return false;
//   };

//   const goToToday = () => {
//     const today = moment();
//     const year = today.jYear();
//     const month = today.jMonth() + 1;
//     const day = today.jDate();
//     const jalaliStr = formatJalaliDate(year, month, day);
    
//     onChange(jalaliStr);
//     setInputValue(jalaliStr);
//     setCurrentYear(year);
//     setCurrentMonth(month);
//     setCurrentDay(day);
//     setIsOpen(false);
//     setIsTyping(false);
//   };

//   const handleYearSelect = (year: number) => {
//     setCurrentYear(year);
//     setShowYearDropdown(false);
//   };

//   const handleMonthSelect = (month: number) => {
//     setCurrentMonth(month);
//     setShowMonthDropdown(false);
//   };

//   const handleDaySelect = (day: number) => {
//     const jalaliStr = formatJalaliDate(currentYear, currentMonth, day);
//     onChange(jalaliStr);
//     setInputValue(jalaliStr);
//     setCurrentDay(day);
//     setShowDayDropdown(false);
//     setIsOpen(false);
//   };

//   const getYearOptions = () => {
//     const years = [];
//     for (let i = 1300; i <= 1500; i++) {
//       years.push(i);
//     }
//     return years;
//   };

//   const getMonthOptions = () => {
//     return monthNames.map((name, index) => ({
//       value: index + 1,
//       label: name
//     }));
//   };

//   const getDayOptions = () => {
//     const daysInMonth = getJalaliMonthDays(currentYear, currentMonth);
//     const days = [];
//     for (let i = 1; i <= daysInMonth; i++) {
//       days.push(i);
//     }
//     return days;
//   };

//   const displayValue = inputValue;

//   return (
//     <div className={`position-relative ${className}`} ref={pickerRef} style={{ direction: 'rtl' }}>
//       {label && (
//         <label className="form-label fw-semibold mb-1" style={{ 
//           fontSize: '13px', 
//           color: '#374151',
//           display: 'block',
//           marginBottom: '4px'
//         }}>
//           {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
//         </label>
//       )}
      
//       <div className="position-relative">
//         <input
//           type="text"
//           className={`form-control ${error ? 'is-invalid' : ''}`}
//           placeholder={placeholder}
//           value={displayValue}
//           onChange={handleInputChange}
//           onBlur={handleInputBlur}
//           onKeyDown={handleInputKeyDown}
//           onClick={handleInputClick}
//           disabled={disabled}
//           required={required}
//           style={{ 
//             padding: '10px 14px',
//             direction: 'ltr',
//             borderRadius: '10px',
//             border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
//             width: '100%',
//             fontFamily: 'monospace',
//             fontSize: '14px',
//             backgroundColor: disabled ? '#f9fafb' : 'white',
//             cursor: disabled ? 'not-allowed' : 'pointer',
//             transition: 'all 0.2s ease',
//             boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
//             outline: 'none',
//             color: '#1f2937'
//           }}
//           onFocus={(e) => {
//             if (!disabled) {
//               e.currentTarget.style.borderColor = '#6366f1';
//               e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.12)';
//             }
//           }}
//           onBlur={(e) => {
//             if (!disabled && !error) {
//               e.currentTarget.style.borderColor = '#e5e7eb';
//               e.currentTarget.style.boxShadow = 'none';
//             }
//           }}
//         />
//       </div>
      
//       {error && (
//         <div className="text-danger small mt-1" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
//           {error}
//         </div>
//       )}

//       {isOpen && !disabled && (
//         <>
//           <div 
//             style={{ 
//               position: 'fixed', 
//               top: 0, 
//               left: 0, 
//               right: 0, 
//               bottom: 0, 
//               zIndex: 1040,
//               backgroundColor: 'rgba(0,0,0,0.08)',
//               backdropFilter: 'blur(2px)',
//               transition: 'all 0.3s ease'
//             }}
//             onClick={() => {
//               setIsOpen(false);
//               setShowYearDropdown(false);
//               setShowMonthDropdown(false);
//               setShowDayDropdown(false);
//             }}
//           />
//           <div 
//             className="position-absolute bg-white rounded-2 shadow-xl mt-1"
//             style={{ 
//               zIndex: 1050, 
//               width: '340px',
//               top: '100%',
//               left: 0,
//               boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.06)',
//               border: '1px solid #f1f3f5',
//               overflow: 'hidden',
//               animation: 'fadeInDown 0.2s ease-out'
//             }}
//           >
//             <style>{`
//               @keyframes fadeInDown {
//                 from {
//                   opacity: 0;
//                   transform: translateY(-8px) scale(0.98);
//                 }
//                 to {
//                   opacity: 1;
//                   transform: translateY(0) scale(1);
//                 }
//               }
//               .date-picker-scroll::-webkit-scrollbar {
//                 width: 4px;
//               }
//               .date-picker-scroll::-webkit-scrollbar-track {
//                 background: #f1f1f1;
//                 border-radius: 4px;
//               }
//               .date-picker-scroll::-webkit-scrollbar-thumb {
//                 background: #d1d5db;
//                 border-radius: 4px;
//               }
//               .date-picker-scroll::-webkit-scrollbar-thumb:hover {
//                 background: #9ca3af;
//               }
//             `}</style>

//             {/* هدر تقویم - کد کاملش مثل قبل */}
//             <div style={{ 
//               background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
//               padding: '14px 16px',
//               color: 'white'
//             }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
//                 <button type="button" onClick={() => changeYear(-1)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', fontSize: '16px', fontWeight: 'bold', backdropFilter: 'blur(4px)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}>«</button>
//                 <button type="button" onClick={() => changeMonth(-1)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', fontSize: '16px', fontWeight: 'bold', backdropFilter: 'blur(4px)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}>‹</button>

//                 <div style={{ display: 'flex', gap: '6px', flex: 1, justifyContent: 'center' }}>
//                   {/* انتخاب سال */}
//                   <div style={{ position: 'relative' }} ref={yearDropdownRef}>
//                     <button type="button" onClick={() => { setShowYearDropdown(!showYearDropdown); setShowMonthDropdown(false); setShowDayDropdown(false); }} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px', padding: '4px 14px', cursor: 'pointer', color: 'white', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', minWidth: '60px', justifyContent: 'center', transition: 'all 0.2s', backdropFilter: 'blur(4px)', height: '32px' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}>
//                       {currentYear}
//                       {showYearDropdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//                     </button>
//                     {showYearDropdown && (
//                       <div className="date-picker-scroll" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', background: 'white', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxHeight: '200px', overflowY: 'auto', zIndex: 1060, minWidth: '80px', color: '#1f2937', border: '1px solid #f1f3f5' }}>
//                         {getYearOptions().map((year) => (
//                           <div key={year} onClick={() => handleYearSelect(year)} style={{ padding: '8px 18px', cursor: 'pointer', fontSize: '14px', textAlign: 'center', background: year === currentYear ? '#eef2ff' : 'transparent', color: year === currentYear ? '#4f46e5' : '#374151', fontWeight: year === currentYear ? '600' : '400', transition: 'all 0.15s', borderBottom: '1px solid #f3f4f6' }} onMouseEnter={(e) => { if (year !== currentYear) { e.currentTarget.style.background = '#f9fafb'; } }} onMouseLeave={(e) => { if (year !== currentYear) { e.currentTarget.style.background = 'transparent'; } }}>{year}</div>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   {/* انتخاب ماه */}
//                   <div style={{ position: 'relative' }} ref={monthDropdownRef}>
//                     <button type="button" onClick={() => { setShowMonthDropdown(!showMonthDropdown); setShowYearDropdown(false); setShowDayDropdown(false); }} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px', padding: '4px 14px', cursor: 'pointer', color: 'white', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', minWidth: '70px', justifyContent: 'center', transition: 'all 0.2s', backdropFilter: 'blur(4px)', height: '32px' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}>
//                       {monthNames[currentMonth - 1]}
//                       {showMonthDropdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//                     </button>
//                     {showMonthDropdown && (
//                       <div className="date-picker-scroll" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', background: 'white', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxHeight: '200px', overflowY: 'auto', zIndex: 1060, minWidth: '100px', color: '#1f2937', border: '1px solid #f1f3f5' }}>
//                         {getMonthOptions().map((month) => (
//                           <div key={month.value} onClick={() => handleMonthSelect(month.value)} style={{ padding: '8px 18px', cursor: 'pointer', fontSize: '14px', textAlign: 'center', background: month.value === currentMonth ? '#eef2ff' : 'transparent', color: month.value === currentMonth ? '#4f46e5' : '#374151', fontWeight: month.value === currentMonth ? '600' : '400', transition: 'all 0.15s', borderBottom: '1px solid #f3f4f6' }} onMouseEnter={(e) => { if (month.value !== currentMonth) { e.currentTarget.style.background = '#f9fafb'; } }} onMouseLeave={(e) => { if (month.value !== currentMonth) { e.currentTarget.style.background = 'transparent'; } }}>{month.label}</div>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   {/* انتخاب روز */}
//                   <div style={{ position: 'relative' }} ref={dayDropdownRef}>
//                     <button type="button" onClick={() => { setShowDayDropdown(!showDayDropdown); setShowYearDropdown(false); setShowMonthDropdown(false); }} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', color: 'white', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', minWidth: '50px', justifyContent: 'center', transition: 'all 0.2s', backdropFilter: 'blur(4px)', height: '32px' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}>
//                       {currentDay}
//                       {showDayDropdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//                     </button>
//                     {showDayDropdown && (
//                       <div className="date-picker-scroll" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', background: 'white', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxHeight: '200px', overflowY: 'auto', zIndex: 1060, minWidth: '60px', color: '#1f2937', border: '1px solid #f1f3f5' }}>
//                         {getDayOptions().map((day) => (
//                           <div key={day} onClick={() => handleDaySelect(day)} style={{ padding: '8px 18px', cursor: 'pointer', fontSize: '14px', textAlign: 'center', background: day === currentDay ? '#eef2ff' : 'transparent', color: day === currentDay ? '#4f46e5' : '#374151', fontWeight: day === currentDay ? '600' : '400', transition: 'all 0.15s', borderBottom: '1px solid #f3f4f6' }} onMouseEnter={(e) => { if (day !== currentDay) { e.currentTarget.style.background = '#f9fafb'; } }} onMouseLeave={(e) => { if (day !== currentDay) { e.currentTarget.style.background = 'transparent'; } }}>{day}</div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <button type="button" onClick={() => changeMonth(1)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', fontSize: '16px', fontWeight: 'bold', backdropFilter: 'blur(4px)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}>›</button>
//                 <button type="button" onClick={() => changeYear(1)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', fontSize: '16px', fontWeight: 'bold', backdropFilter: 'blur(4px)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}>»</button>
//               </div>
//             </div>
            
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 10px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafbfc' }}>
//               {weekDays.map((day, idx) => (
//                 <div key={idx} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', color: '#9ca3af', padding: '6px 0', letterSpacing: '0.5px' }}>{day}</div>
//               ))}
//             </div>
            
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 10px', gap: '2px' }}>
//               {getDays().map((day, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => day && handleDateSelect(day)}
//                   disabled={!day}
//                   style={{
//                     textAlign: 'center',
//                     padding: '8px 0',
//                     borderRadius: '8px',
//                     border: 'none',
//                     background: isSelected(day) ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : isToday(day) ? '#eef2ff' : 'transparent',
//                     color: isSelected(day) ? 'white' : isToday(day) ? '#4f46e5' : '#374151',
//                     fontWeight: isSelected(day) ? '600' : isToday(day) ? '600' : '400',
//                     cursor: day ? 'pointer' : 'default',
//                     opacity: day ? 1 : 0.3,
//                     fontSize: '14px',
//                     transition: 'all 0.15s ease',
//                     fontFamily: 'inherit',
//                     boxShadow: isSelected(day) ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none',
//                     position: 'relative'
//                   }}
//                   onMouseEnter={(e) => {
//                     if (day && !isSelected(day) && !isToday(day)) {
//                       e.currentTarget.style.background = '#f3f4f6';
//                       e.currentTarget.style.transform = 'scale(1.04)';
//                     }
//                     if (day && isToday(day) && !isSelected(day)) {
//                       e.currentTarget.style.background = '#e0e7ff';
//                     }
//                   }}
//                   onMouseLeave={(e) => {
//                     if (day && !isSelected(day) && !isToday(day)) {
//                       e.currentTarget.style.background = 'transparent';
//                       e.currentTarget.style.transform = 'scale(1)';
//                     }
//                     if (day && isToday(day) && !isSelected(day)) {
//                       e.currentTarget.style.background = '#eef2ff';
//                     }
//                   }}
//                 >
//                   {day || ''}
//                   {isToday(day) && !isSelected(day) && (
//                     <span style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#4f46e5' }} />
//                   )}
//                 </button>
//               ))}
//             </div>
            
//             <div style={{ padding: '10px', borderTop: '1px solid #f3f4f6', textAlign: 'center', background: '#fafbfc', borderRadius: '0 0 12px 12px' }}>
//               <button
//                 type="button"
//                 onClick={goToToday}
//                 style={{
//                   background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
//                   border: 'none',
//                   borderRadius: '20px',
//                   padding: '7px 28px',
//                   color: 'white',
//                   fontSize: '13px',
//                   cursor: 'pointer',
//                   transition: 'all 0.25s ease',
//                   boxShadow: '0 2px 12px rgba(79, 70, 229, 0.3)',
//                   fontWeight: '500',
//                   letterSpacing: '0.3px'
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = 'scale(1.04)';
//                   e.currentTarget.style.boxShadow = '0 4px 20px rgba(79, 70, 229, 0.4)';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = 'scale(1)';
//                   e.currentTarget.style.boxShadow = '0 2px 12px rgba(79, 70, 229, 0.3)';
//                 }}
//               >
//                 امروز
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default JalaliDatePicker;


// //modern 1
// // src/components/JalaliDatePicker.tsx
// import React, { useState, useRef, useEffect } from 'react';
// import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
// import moment from 'moment-jalaali';

// interface JalaliDatePickerProps {
//   value?: string | null;
//   onChange: (date: string | null) => void;
//   placeholder?: string;
//   required?: boolean;
//   label?: string;
//   error?: string;
//   disabled?: boolean;
//   className?: string;
// }

// moment.loadPersian({ dialect: 'persian-modern' });

// const LEAP_YEARS = [
//   1210, 1214, 1218, 1222, 1226, 1230, 1234, 1238, 1243,
//   1247, 1251, 1255, 1259, 1263, 1267, 1271, 1276,
//   1280, 1284, 1288, 1292, 1296, 1300, 1304, 1309,
//   1313, 1317, 1321, 1325, 1329, 1333, 1337, 1342,
//   1346, 1350, 1354, 1358, 1362, 1366, 1370, 1375,
//   1379, 1383, 1387, 1391, 1395, 1399, 1403, 1408,
//   1412, 1416, 1420, 1424, 1428, 1432, 1436, 1441,
//   1445, 1449, 1453, 1457, 1461, 1465, 1469, 1474,
//   1478, 1482, 1486, 1490, 1494, 1498
// ];

// const getJalaliMonthDays = (year: number, month: number): number => {
//   const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
//   if (month === 12) {
//     return LEAP_YEARS.includes(year) ? 30 : 29;
//   }
//   return daysInMonth[month - 1];
// };

// const getFirstDayOfMonth = (year: number, month: number): number => {
//   const date = moment(`${year}/${month}/01`, 'jYYYY/jMM/jDD');
//   let day = date.day();
//   day = (day + 1) % 7;
//   return day;
// };

// const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
//   value,
//   onChange,
//   placeholder = '1402/12/25',
//   required = false,
//   label,
//   error,
//   disabled = false,
//   className = '',
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [currentYear, setCurrentYear] = useState(moment().jYear());
//   const [currentMonth, setCurrentMonth] = useState(moment().jMonth() + 1);
//   const [currentDay, setCurrentDay] = useState(moment().jDate());
//   const [inputValue, setInputValue] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [showYearDropdown, setShowYearDropdown] = useState(false);
//   const [showMonthDropdown, setShowMonthDropdown] = useState(false);
//   const [showDayDropdown, setShowDayDropdown] = useState(false);
//   const pickerRef = useRef<HTMLDivElement>(null);
//   const yearDropdownRef = useRef<HTMLDivElement>(null);
//   const monthDropdownRef = useRef<HTMLDivElement>(null);
//   const dayDropdownRef = useRef<HTMLDivElement>(null);

//   const monthNames = [
//     'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
//     'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
//   ];

//   const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

//   const formatJalaliDate = (year: number, month: number, day: number): string => {
//     return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
//   };

//   const parseJalaliDate = (dateStr: string): { year: number; month: number; day: number } | null => {
//     if (!dateStr) return null;
//     const cleanStr = dateStr.replace(/[^0-9/]/g, '');
//     const parts = cleanStr.split('/');
//     if (parts.length !== 3) return null;
    
//     const year = parseInt(parts[0]);
//     const month = parseInt(parts[1]);
//     const day = parseInt(parts[2]);
    
//     if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
//     if (year < 1300 || year > 1500) return null;
//     if (month < 1 || month > 12) return null;
//     if (day < 1 || day > 31) return null;
    
//     const m = moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD');
//     if (!m.isValid()) return null;
    
//     return { year, month, day };
//   };

//   const toJalaliFormat = (dateStr: string | null | undefined): string | null => {
//     if (!dateStr) return null;
//     const parsed = parseJalaliDate(dateStr);
//     if (parsed) {
//       return formatJalaliDate(parsed.year, parsed.month, parsed.day);
//     }
//     if (dateStr.includes('-')) {
//       try {
//         const parts = dateStr.split('-');
//         if (parts.length === 3) {
//           const year = parseInt(parts[0]);
//           const month = parseInt(parts[1]);
//           const day = parseInt(parts[2]);
//           if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
//             const m = moment(`${year}/${month}/${day}`, 'YYYY/MM/DD');
//             if (m.isValid()) {
//               return formatJalaliDate(m.jYear(), m.jMonth() + 1, m.jDate());
//             }
//           }
//         }
//       } catch (e) {
//         console.warn('Error parsing date:', dateStr, e);
//       }
//     }
//     return null;
//   };

//   useEffect(() => {
//     if (!value || value === '' || value === 'null' || value === 'undefined') {
//       if (!isTyping) {
//         setInputValue('');
//       }
//       return;
//     }
//     if (value && !isTyping) {
//       const formatted = toJalaliFormat(value);
//       if (formatted) {
//         const parsed = parseJalaliDate(formatted);
//         if (parsed) {
//           setInputValue(formatted);
//           setCurrentYear(parsed.year);
//           setCurrentMonth(parsed.month);
//           setCurrentDay(parsed.day);
//           return;
//         }
//       }
//       setInputValue('');
//     } else if (!value && !isTyping) {
//       setInputValue('');
//     }
//   }, [value, isTyping]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//         setShowYearDropdown(false);
//         setShowMonthDropdown(false);
//         setShowDayDropdown(false);
//       }
//       if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
//         setShowYearDropdown(false);
//       }
//       if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
//         setShowMonthDropdown(false);
//       }
//       if (dayDropdownRef.current && !dayDropdownRef.current.contains(event.target as Node)) {
//         setShowDayDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const getDays = () => {
//     const daysInMonth = getJalaliMonthDays(currentYear, currentMonth);
//     const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
//     const days = [];
    
//     for (let i = 0; i < firstDay; i++) {
//       days.push(null);
//     }
//     for (let i = 1; i <= daysInMonth; i++) {
//       days.push(i);
//     }
//     return days;
//   };

//   const handleDateSelect = (day: number) => {
//     const jalaliStr = formatJalaliDate(currentYear, currentMonth, day);
//     onChange(jalaliStr);
//     setInputValue(jalaliStr);
//     setCurrentDay(day);
//     setIsOpen(false);
//     setIsTyping(false);
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let val = e.target.value;
//     setIsTyping(true);
    
//     val = val.replace(/[^0-9/]/g, '');
//     if (val.length > 10) {
//       val = val.slice(0, 10);
//     }
    
//     const numbers = val.replace(/\//g, '');
//     if (numbers.length >= 5 && !val.includes('/')) {
//       val = `${numbers.slice(0, 4)}/${numbers.slice(4)}`;
//     } else if (numbers.length >= 7 && val.split('/').length === 2) {
//       const parts = val.split('/');
//       if (parts[1].length >= 2) {
//         val = `${parts[0]}/${parts[1].slice(0, 2)}/${numbers.slice(6)}`;
//       }
//     }
    
//     setInputValue(val);
    
//     if (val.length >= 4) {
//       const parts = val.split('/');
      
//       if (parts.length >= 1) {
//         const year = parseInt(parts[0]);
//         if (!isNaN(year) && year >= 1300 && year <= 1500) {
//           setCurrentYear(year);
//         }
//       }
      
//       if (parts.length >= 2) {
//         const month = parseInt(parts[1]);
//         if (!isNaN(month) && month >= 1 && month <= 12) {
//           setCurrentMonth(month);
//         }
//       }
      
//       if (parts.length >= 3) {
//         const day = parseInt(parts[2]);
//         if (!isNaN(day) && day >= 1 && day <= 31) {
//           setCurrentDay(day);
//         }
//       }
//     }
//   };

//   const handleInputBlur = () => {
//     setIsTyping(false);
    
//     if (!inputValue) {
//       onChange(null);
//       return;
//     }
    
//     const parsed = parseJalaliDate(inputValue);
//     if (parsed) {
//       const formatted = formatJalaliDate(parsed.year, parsed.month, parsed.day);
//       onChange(formatted);
//       setInputValue(formatted);
//       setCurrentYear(parsed.year);
//       setCurrentMonth(parsed.month);
//       setCurrentDay(parsed.day);
//       return;
//     }
    
//     if (value) {
//       const formatted = toJalaliFormat(value);
//       if (formatted) {
//         setInputValue(formatted);
//       } else {
//         setInputValue('');
//         onChange(null);
//       }
//     } else {
//       setInputValue('');
//       onChange(null);
//     }
//   };

//   const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       handleInputBlur();
//       setIsOpen(false);
//     }
//   };

//   // ✅ با کلیک روی هر جای تکست باکس، تقویم باز میشه
//   const handleInputClick = () => {
//     if (!disabled) {
//       setIsOpen(true);
//     }
//   };

//   const changeMonth = (delta: number) => {
//     let newMonth = currentMonth + delta;
//     let newYear = currentYear;
    
//     if (newMonth < 1) {
//       newMonth = 12;
//       newYear--;
//     } else if (newMonth > 12) {
//       newMonth = 1;
//       newYear++;
//     }
//     setCurrentMonth(newMonth);
//     setCurrentYear(newYear);
//   };

//   const changeYear = (delta: number) => {
//     setCurrentYear(prev => prev + delta);
//   };

//   const clearDate = () => {
//     onChange(null);
//     setInputValue('');
//     setIsOpen(false);
//     setIsTyping(false);
//   };

//   const isToday = (day: number) => {
//     const today = moment();
//     const todayYear = today.jYear();
//     const todayMonth = today.jMonth() + 1;
//     const todayDay = today.jDate();
    
//     return todayYear === currentYear && todayMonth === currentMonth && todayDay === day;
//   };

//   const isSelected = (day: number) => {
//     if (inputValue && inputValue.length >= 4) {
//       const parts = inputValue.split('/');
      
//       let year = null;
//       if (parts.length >= 1) {
//         year = parseInt(parts[0]);
//         if (isNaN(year) || year < 1300 || year > 1500) return false;
//       }
      
//       let month = null;
//       if (parts.length >= 2) {
//         month = parseInt(parts[1]);
//         if (isNaN(month) || month < 1 || month > 12) return false;
//       }
      
//       let dayFromInput = null;
//       if (parts.length >= 3) {
//         dayFromInput = parseInt(parts[2]);
//         if (isNaN(dayFromInput) || dayFromInput < 1 || dayFromInput > 31) return false;
//       }
      
//       if (year === currentYear && month === currentMonth && dayFromInput !== null) {
//         return dayFromInput === day;
//       }
      
//       if (year === currentYear && month === currentMonth && dayFromInput === null) {
//         return false;
//       }
//     }
//     return false;
//   };

//   const goToToday = () => {
//     const today = moment();
//     const year = today.jYear();
//     const month = today.jMonth() + 1;
//     const day = today.jDate();
//     const jalaliStr = formatJalaliDate(year, month, day);
    
//     onChange(jalaliStr);
//     setInputValue(jalaliStr);
//     setCurrentYear(year);
//     setCurrentMonth(month);
//     setCurrentDay(day);
//     setIsOpen(false);
//     setIsTyping(false);
//   };

//   const handleYearSelect = (year: number) => {
//     setCurrentYear(year);
//     setShowYearDropdown(false);
//   };

//   const handleMonthSelect = (month: number) => {
//     setCurrentMonth(month);
//     setShowMonthDropdown(false);
//   };

//   const handleDaySelect = (day: number) => {
//     const jalaliStr = formatJalaliDate(currentYear, currentMonth, day);
//     onChange(jalaliStr);
//     setInputValue(jalaliStr);
//     setCurrentDay(day);
//     setShowDayDropdown(false);
//     setIsOpen(false);
//   };

//   // ✅ سال‌ها از 1300 تا 1500
//   const getYearOptions = () => {
//     const years = [];
//     for (let i = 1300; i <= 1500; i++) {
//       years.push(i);
//     }
//     return years;
//   };

//   const getMonthOptions = () => {
//     return monthNames.map((name, index) => ({
//       value: index + 1,
//       label: name
//     }));
//   };

//   const getDayOptions = () => {
//     const daysInMonth = getJalaliMonthDays(currentYear, currentMonth);
//     const days = [];
//     for (let i = 1; i <= daysInMonth; i++) {
//       days.push(i);
//     }
//     return days;
//   };

//   const displayValue = inputValue;

//   return (
//     <div className={`position-relative ${className}`} ref={pickerRef} style={{ direction: 'rtl' }}>
//       {label && (
//         <label className="form-label fw-semibold mb-1" style={{ 
//           fontSize: '13px', 
//           color: '#374151',
//           display: 'block',
//           marginBottom: '4px'
//         }}>
//           {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
//         </label>
//       )}
      
//       <div className="position-relative">
//         <input
//           type="text"
//           className={`form-control ${error ? 'is-invalid' : ''}`}
//           placeholder={placeholder}
//           value={displayValue}
//           onChange={handleInputChange}
//           onBlur={handleInputBlur}
//           onKeyDown={handleInputKeyDown}
//           onClick={handleInputClick}
//           disabled={disabled}
//           required={required}
//           style={{ 
//             paddingLeft: '14px',
//             paddingRight: '14px',
//             direction: 'ltr',
//             borderRadius: '10px',
//             border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
//             padding: '10px 14px',
//             width: '100%',
//             fontFamily: 'monospace',
//             fontSize: '14px',
//             backgroundColor: disabled ? '#f9fafb' : 'white',
//             cursor: disabled ? 'not-allowed' : 'pointer',
//             transition: 'all 0.2s ease',
//             boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
//             outline: 'none',
//             color: '#1f2937'
//           }}
//           onFocus={(e) => {
//             if (!disabled) {
//               e.currentTarget.style.borderColor = '#6366f1';
//               e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.12)';
//             }
//           }}
//           onBlur={(e) => {
//             if (!disabled && !error) {
//               e.currentTarget.style.borderColor = '#e5e7eb';
//               e.currentTarget.style.boxShadow = 'none';
//             }
//           }}
//         />
//       </div>
      
//       {error && (
//         <div className="text-danger small mt-1" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
//           {error}
//         </div>
//       )}

//       {/* Dropdown تقویم */}
//       {isOpen && !disabled && (
//         <>
//           <div 
//             style={{ 
//               position: 'fixed', 
//               top: 0, 
//               left: 0, 
//               right: 0, 
//               bottom: 0, 
//               zIndex: 1040,
//               backgroundColor: 'rgba(0,0,0,0.08)',
//               backdropFilter: 'blur(2px)',
//               transition: 'all 0.3s ease'
//             }}
//             onClick={() => {
//               setIsOpen(false);
//               setShowYearDropdown(false);
//               setShowMonthDropdown(false);
//               setShowDayDropdown(false);
//             }}
//           />
//           <div 
//             className="position-absolute bg-white rounded-2 shadow-xl mt-1"
//             style={{ 
//               zIndex: 1050, 
//               width: '340px',
//               top: '100%',
//               left: 0,
//               boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.06)',
//               border: '1px solid #f1f3f5',
//               overflow: 'hidden',
//               animation: 'fadeInDown 0.2s ease-out'
//             }}
//           >
//             <style>{`
//               @keyframes fadeInDown {
//                 from {
//                   opacity: 0;
//                   transform: translateY(-8px) scale(0.98);
//                 }
//                 to {
//                   opacity: 1;
//                   transform: translateY(0) scale(1);
//                 }
//               }
//               .date-picker-scroll::-webkit-scrollbar {
//                 width: 4px;
//               }
//               .date-picker-scroll::-webkit-scrollbar-track {
//                 background: #f1f1f1;
//                 border-radius: 4px;
//               }
//               .date-picker-scroll::-webkit-scrollbar-thumb {
//                 background: #d1d5db;
//                 border-radius: 4px;
//               }
//               .date-picker-scroll::-webkit-scrollbar-thumb:hover {
//                 background: #9ca3af;
//               }
//             `}</style>

//             {/* هدر تقویم */}
//             <div style={{ 
//               background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
//               padding: '14px 16px',
//               color: 'white'
//             }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
//                 <button
//                   type="button"
//                   onClick={() => changeYear(-1)}
//                   style={{
//                     background: 'rgba(255,255,255,0.12)',
//                     border: 'none',
//                     borderRadius: '8px',
//                     width: '32px',
//                     height: '32px',
//                     cursor: 'pointer',
//                     color: 'white',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     transition: 'all 0.2s',
//                     fontSize: '16px',
//                     fontWeight: 'bold',
//                     backdropFilter: 'blur(4px)'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
//                     e.currentTarget.style.transform = 'scale(1.05)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
//                     e.currentTarget.style.transform = 'scale(1)';
//                   }}
//                 >
//                   «
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => changeMonth(-1)}
//                   style={{
//                     background: 'rgba(255,255,255,0.12)',
//                     border: 'none',
//                     borderRadius: '8px',
//                     width: '32px',
//                     height: '32px',
//                     cursor: 'pointer',
//                     color: 'white',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     transition: 'all 0.2s',
//                     fontSize: '16px',
//                     fontWeight: 'bold',
//                     backdropFilter: 'blur(4px)'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
//                     e.currentTarget.style.transform = 'scale(1.05)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
//                     e.currentTarget.style.transform = 'scale(1)';
//                   }}
//                 >
//                   ‹
//                 </button>

//                 <div style={{ display: 'flex', gap: '6px', flex: 1, justifyContent: 'center' }}>
//                   {/* انتخاب سال */}
//                   <div style={{ position: 'relative' }} ref={yearDropdownRef}>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setShowYearDropdown(!showYearDropdown);
//                         setShowMonthDropdown(false);
//                         setShowDayDropdown(false);
//                       }}
//                       style={{
//                         background: 'rgba(255,255,255,0.12)',
//                         border: 'none',
//                         borderRadius: '8px',
//                         padding: '4px 14px',
//                         cursor: 'pointer',
//                         color: 'white',
//                         fontSize: '14px',
//                         fontWeight: '600',
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: '4px',
//                         minWidth: '60px',
//                         justifyContent: 'center',
//                         transition: 'all 0.2s',
//                         backdropFilter: 'blur(4px)',
//                         height: '32px'
//                       }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
//                       }}
//                     >
//                       {currentYear}
//                       {showYearDropdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//                     </button>
                    
//                     {showYearDropdown && (
//                       <div
//                         className="date-picker-scroll"
//                         style={{
//                           position: 'absolute',
//                           top: 'calc(100% + 6px)',
//                           left: '50%',
//                           transform: 'translateX(-50%)',
//                           background: 'white',
//                           borderRadius: '10px',
//                           boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
//                           maxHeight: '200px',
//                           overflowY: 'auto',
//                           zIndex: 1060,
//                           minWidth: '80px',
//                           color: '#1f2937',
//                           border: '1px solid #f1f3f5'
//                         }}
//                       >
//                         {getYearOptions().map((year) => (
//                           <div
//                             key={year}
//                             onClick={() => handleYearSelect(year)}
//                             style={{
//                               padding: '8px 18px',
//                               cursor: 'pointer',
//                               fontSize: '14px',
//                               textAlign: 'center',
//                               background: year === currentYear ? '#eef2ff' : 'transparent',
//                               color: year === currentYear ? '#4f46e5' : '#374151',
//                               fontWeight: year === currentYear ? '600' : '400',
//                               transition: 'all 0.15s',
//                               borderBottom: '1px solid #f3f4f6'
//                             }}
//                             onMouseEnter={(e) => {
//                               if (year !== currentYear) {
//                                 e.currentTarget.style.background = '#f9fafb';
//                               }
//                             }}
//                             onMouseLeave={(e) => {
//                               if (year !== currentYear) {
//                                 e.currentTarget.style.background = 'transparent';
//                               }
//                             }}
//                           >
//                             {year}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   {/* انتخاب ماه */}
//                   <div style={{ position: 'relative' }} ref={monthDropdownRef}>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setShowMonthDropdown(!showMonthDropdown);
//                         setShowYearDropdown(false);
//                         setShowDayDropdown(false);
//                       }}
//                       style={{
//                         background: 'rgba(255,255,255,0.12)',
//                         border: 'none',
//                         borderRadius: '8px',
//                         padding: '4px 14px',
//                         cursor: 'pointer',
//                         color: 'white',
//                         fontSize: '14px',
//                         fontWeight: '600',
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: '4px',
//                         minWidth: '70px',
//                         justifyContent: 'center',
//                         transition: 'all 0.2s',
//                         backdropFilter: 'blur(4px)',
//                         height: '32px'
//                       }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
//                       }}
//                     >
//                       {monthNames[currentMonth - 1]}
//                       {showMonthDropdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//                     </button>
                    
//                     {showMonthDropdown && (
//                       <div
//                         className="date-picker-scroll"
//                         style={{
//                           position: 'absolute',
//                           top: 'calc(100% + 6px)',
//                           left: '50%',
//                           transform: 'translateX(-50%)',
//                           background: 'white',
//                           borderRadius: '10px',
//                           boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
//                           maxHeight: '200px',
//                           overflowY: 'auto',
//                           zIndex: 1060,
//                           minWidth: '100px',
//                           color: '#1f2937',
//                           border: '1px solid #f1f3f5'
//                         }}
//                       >
//                         {getMonthOptions().map((month) => (
//                           <div
//                             key={month.value}
//                             onClick={() => handleMonthSelect(month.value)}
//                             style={{
//                               padding: '8px 18px',
//                               cursor: 'pointer',
//                               fontSize: '14px',
//                               textAlign: 'center',
//                               background: month.value === currentMonth ? '#eef2ff' : 'transparent',
//                               color: month.value === currentMonth ? '#4f46e5' : '#374151',
//                               fontWeight: month.value === currentMonth ? '600' : '400',
//                               transition: 'all 0.15s',
//                               borderBottom: '1px solid #f3f4f6'
//                             }}
//                             onMouseEnter={(e) => {
//                               if (month.value !== currentMonth) {
//                                 e.currentTarget.style.background = '#f9fafb';
//                               }
//                             }}
//                             onMouseLeave={(e) => {
//                               if (month.value !== currentMonth) {
//                                 e.currentTarget.style.background = 'transparent';
//                               }
//                             }}
//                           >
//                             {month.label}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   {/* انتخاب روز */}
//                   <div style={{ position: 'relative' }} ref={dayDropdownRef}>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setShowDayDropdown(!showDayDropdown);
//                         setShowYearDropdown(false);
//                         setShowMonthDropdown(false);
//                       }}
//                       style={{
//                         background: 'rgba(255,255,255,0.12)',
//                         border: 'none',
//                         borderRadius: '8px',
//                         padding: '4px 10px',
//                         cursor: 'pointer',
//                         color: 'white',
//                         fontSize: '14px',
//                         fontWeight: '600',
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: '4px',
//                         minWidth: '50px',
//                         justifyContent: 'center',
//                         transition: 'all 0.2s',
//                         backdropFilter: 'blur(4px)',
//                         height: '32px'
//                       }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
//                       }}
//                     >
//                       {currentDay}
//                       {showDayDropdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//                     </button>
                    
//                     {showDayDropdown && (
//                       <div
//                         className="date-picker-scroll"
//                         style={{
//                           position: 'absolute',
//                           top: 'calc(100% + 6px)',
//                           left: '50%',
//                           transform: 'translateX(-50%)',
//                           background: 'white',
//                           borderRadius: '10px',
//                           boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
//                           maxHeight: '200px',
//                           overflowY: 'auto',
//                           zIndex: 1060,
//                           minWidth: '60px',
//                           color: '#1f2937',
//                           border: '1px solid #f1f3f5'
//                         }}
//                       >
//                         {getDayOptions().map((day) => (
//                           <div
//                             key={day}
//                             onClick={() => handleDaySelect(day)}
//                             style={{
//                               padding: '8px 18px',
//                               cursor: 'pointer',
//                               fontSize: '14px',
//                               textAlign: 'center',
//                               background: day === currentDay ? '#eef2ff' : 'transparent',
//                               color: day === currentDay ? '#4f46e5' : '#374151',
//                               fontWeight: day === currentDay ? '600' : '400',
//                               transition: 'all 0.15s',
//                               borderBottom: '1px solid #f3f4f6'
//                             }}
//                             onMouseEnter={(e) => {
//                               if (day !== currentDay) {
//                                 e.currentTarget.style.background = '#f9fafb';
//                               }
//                             }}
//                             onMouseLeave={(e) => {
//                               if (day !== currentDay) {
//                                 e.currentTarget.style.background = 'transparent';
//                               }
//                             }}
//                           >
//                             {day}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => changeMonth(1)}
//                   style={{
//                     background: 'rgba(255,255,255,0.12)',
//                     border: 'none',
//                     borderRadius: '8px',
//                     width: '32px',
//                     height: '32px',
//                     cursor: 'pointer',
//                     color: 'white',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     transition: 'all 0.2s',
//                     fontSize: '16px',
//                     fontWeight: 'bold',
//                     backdropFilter: 'blur(4px)'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
//                     e.currentTarget.style.transform = 'scale(1.05)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
//                     e.currentTarget.style.transform = 'scale(1)';
//                   }}
//                 >
//                   ›
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => changeYear(1)}
//                   style={{
//                     background: 'rgba(255,255,255,0.12)',
//                     border: 'none',
//                     borderRadius: '8px',
//                     width: '32px',
//                     height: '32px',
//                     cursor: 'pointer',
//                     color: 'white',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     transition: 'all 0.2s',
//                     fontSize: '16px',
//                     fontWeight: 'bold',
//                     backdropFilter: 'blur(4px)'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
//                     e.currentTarget.style.transform = 'scale(1.05)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
//                     e.currentTarget.style.transform = 'scale(1)';
//                   }}
//                 >
//                   »
//                 </button>
//               </div>
//             </div>
            
//             {/* روزهای هفته */}
//             <div style={{ 
//               display: 'grid', 
//               gridTemplateColumns: 'repeat(7, 1fr)',
//               padding: '8px 10px',
//               borderBottom: '1px solid #f3f4f6',
//               backgroundColor: '#fafbfc'
//             }}>
//               {weekDays.map((day, idx) => (
//                 <div key={idx} style={{ 
//                   textAlign: 'center', 
//                   fontSize: '11px', 
//                   fontWeight: '600', 
//                   color: '#9ca3af',
//                   padding: '6px 0',
//                   letterSpacing: '0.5px'
//                 }}>
//                   {day}
//                 </div>
//               ))}
//             </div>
            
//             {/* روزهای ماه */}
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 10px', gap: '2px' }}>
//               {getDays().map((day, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => day && handleDateSelect(day)}
//                   disabled={!day}
//                   style={{
//                     textAlign: 'center',
//                     padding: '8px 0',
//                     borderRadius: '8px',
//                     border: 'none',
//                     background: isSelected(day)
//                       ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
//                       : isToday(day)
//                       ? '#eef2ff'
//                       : 'transparent',
//                     color: isSelected(day) ? 'white' : isToday(day) ? '#4f46e5' : '#374151',
//                     fontWeight: isSelected(day) ? '600' : isToday(day) ? '600' : '400',
//                     cursor: day ? 'pointer' : 'default',
//                     opacity: day ? 1 : 0.3,
//                     fontSize: '14px',
//                     transition: 'all 0.15s ease',
//                     fontFamily: 'inherit',
//                     boxShadow: isSelected(day) ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none',
//                     position: 'relative'
//                   }}
//                   onMouseEnter={(e) => {
//                     if (day && !isSelected(day) && !isToday(day)) {
//                       e.currentTarget.style.background = '#f3f4f6';
//                       e.currentTarget.style.transform = 'scale(1.04)';
//                     }
//                     if (day && isToday(day) && !isSelected(day)) {
//                       e.currentTarget.style.background = '#e0e7ff';
//                     }
//                   }}
//                   onMouseLeave={(e) => {
//                     if (day && !isSelected(day) && !isToday(day)) {
//                       e.currentTarget.style.background = 'transparent';
//                       e.currentTarget.style.transform = 'scale(1)';
//                     }
//                     if (day && isToday(day) && !isSelected(day)) {
//                       e.currentTarget.style.background = '#eef2ff';
//                     }
//                   }}
//                 >
//                   {day || ''}
//                   {isToday(day) && !isSelected(day) && (
//                     <span style={{
//                       position: 'absolute',
//                       bottom: '2px',
//                       left: '50%',
//                       transform: 'translateX(-50%)',
//                       width: '4px',
//                       height: '4px',
//                       borderRadius: '50%',
//                       backgroundColor: '#4f46e5'
//                     }} />
//                   )}
//                 </button>
//               ))}
//             </div>
            
//             {/* دکمه امروز */}
//             <div style={{ 
//               padding: '10px',
//               borderTop: '1px solid #f3f4f6',
//               textAlign: 'center',
//               background: '#fafbfc',
//               borderRadius: '0 0 12px 12px'
//             }}>
//               <button
//                 type="button"
//                 onClick={goToToday}
//                 style={{
//                   background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
//                   border: 'none',
//                   borderRadius: '20px',
//                   padding: '7px 28px',
//                   color: 'white',
//                   fontSize: '13px',
//                   cursor: 'pointer',
//                   transition: 'all 0.25s ease',
//                   boxShadow: '0 2px 12px rgba(79, 70, 229, 0.3)',
//                   fontWeight: '500',
//                   letterSpacing: '0.3px'
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = 'scale(1.04)';
//                   e.currentTarget.style.boxShadow = '0 4px 20px rgba(79, 70, 229, 0.4)';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = 'scale(1)';
//                   e.currentTarget.style.boxShadow = '0 2px 12px rgba(79, 70, 229, 0.3)';
//                 }}
//               >
//                 امروز
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default JalaliDatePicker;

//modern 2
// // src/components/JalaliDatePicker.tsx
// import React, { useState, useRef, useEffect } from 'react';
// import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
// import moment from 'moment-jalaali';

// interface JalaliDatePickerProps {
//   value?: string | null;
//   onChange: (date: string | null) => void;
//   placeholder?: string;
//   required?: boolean;
//   label?: string;
//   error?: string;
//   disabled?: boolean;
//   className?: string;
// }

// moment.loadPersian({ dialect: 'persian-modern' });

// const LEAP_YEARS = [
//   1210, 1214, 1218, 1222, 1226, 1230, 1234, 1238, 1243,
//   1247, 1251, 1255, 1259, 1263, 1267, 1271, 1276,
//   1280, 1284, 1288, 1292, 1296, 1300, 1304, 1309,
//   1313, 1317, 1321, 1325, 1329, 1333, 1337, 1342,
//   1346, 1350, 1354, 1358, 1362, 1366, 1370, 1375,
//   1379, 1383, 1387, 1391, 1395, 1399, 1403, 1408,
//   1412, 1416, 1420, 1424, 1428, 1432, 1436, 1441,
//   1445, 1449, 1453, 1457, 1461, 1465, 1469, 1474,
//   1478, 1482, 1486, 1490, 1494, 1498
// ];

// const getJalaliMonthDays = (year: number, month: number): number => {
//   const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
//   if (month === 12) {
//     return LEAP_YEARS.includes(year) ? 30 : 29;
//   }
//   return daysInMonth[month - 1];
// };

// const getFirstDayOfMonth = (year: number, month: number): number => {
//   const date = moment(`${year}/${month}/01`, 'jYYYY/jMM/jDD');
//   let day = date.day();
//   day = (day + 1) % 7;
//   return day;
// };

// const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
//   value,
//   onChange,
//   placeholder = '1402/12/25',
//   required = false,
//   label,
//   error,
//   disabled = false,
//   className = '',
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [currentYear, setCurrentYear] = useState(moment().jYear());
//   const [currentMonth, setCurrentMonth] = useState(moment().jMonth() + 1);
//   const [currentDay, setCurrentDay] = useState(moment().jDate());
//   const [inputValue, setInputValue] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [showYearDropdown, setShowYearDropdown] = useState(false);
//   const [showMonthDropdown, setShowMonthDropdown] = useState(false);
//   const [showDayDropdown, setShowDayDropdown] = useState(false);
//   const pickerRef = useRef<HTMLDivElement>(null);
//   const yearDropdownRef = useRef<HTMLDivElement>(null);
//   const monthDropdownRef = useRef<HTMLDivElement>(null);
//   const dayDropdownRef = useRef<HTMLDivElement>(null);

//   const monthNames = [
//     'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
//     'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
//   ];

//   const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

//   const formatJalaliDate = (year: number, month: number, day: number): string => {
//     return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
//   };

//   const parseJalaliDate = (dateStr: string): { year: number; month: number; day: number } | null => {
//     if (!dateStr) return null;
//     const cleanStr = dateStr.replace(/[^0-9/]/g, '');
//     const parts = cleanStr.split('/');
//     if (parts.length !== 3) return null;
    
//     const year = parseInt(parts[0]);
//     const month = parseInt(parts[1]);
//     const day = parseInt(parts[2]);
    
//     if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
//     if (year < 1300 || year > 1500) return null;
//     if (month < 1 || month > 12) return null;
//     if (day < 1 || day > 31) return null;
    
//     const m = moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD');
//     if (!m.isValid()) return null;
    
//     return { year, month, day };
//   };

//   const toJalaliFormat = (dateStr: string | null | undefined): string | null => {
//     if (!dateStr) return null;
//     const parsed = parseJalaliDate(dateStr);
//     if (parsed) {
//       return formatJalaliDate(parsed.year, parsed.month, parsed.day);
//     }
//     if (dateStr.includes('-')) {
//       try {
//         const parts = dateStr.split('-');
//         if (parts.length === 3) {
//           const year = parseInt(parts[0]);
//           const month = parseInt(parts[1]);
//           const day = parseInt(parts[2]);
//           if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
//             const m = moment(`${year}/${month}/${day}`, 'YYYY/MM/DD');
//             if (m.isValid()) {
//               return formatJalaliDate(m.jYear(), m.jMonth() + 1, m.jDate());
//             }
//           }
//         }
//       } catch (e) {
//         console.warn('Error parsing date:', dateStr, e);
//       }
//     }
//     return null;
//   };

//   useEffect(() => {
//     if (!value || value === '' || value === 'null' || value === 'undefined') {
//       if (!isTyping) {
//         setInputValue('');
//       }
//       return;
//     }
//     if (value && !isTyping) {
//       const formatted = toJalaliFormat(value);
//       if (formatted) {
//         const parsed = parseJalaliDate(formatted);
//         if (parsed) {
//           setInputValue(formatted);
//           setCurrentYear(parsed.year);
//           setCurrentMonth(parsed.month);
//           setCurrentDay(parsed.day);
//           return;
//         }
//       }
//       setInputValue('');
//     } else if (!value && !isTyping) {
//       setInputValue('');
//     }
//   }, [value, isTyping]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//         setShowYearDropdown(false);
//         setShowMonthDropdown(false);
//         setShowDayDropdown(false);
//       }
//       if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
//         setShowYearDropdown(false);
//       }
//       if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
//         setShowMonthDropdown(false);
//       }
//       if (dayDropdownRef.current && !dayDropdownRef.current.contains(event.target as Node)) {
//         setShowDayDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const getDays = () => {
//     const daysInMonth = getJalaliMonthDays(currentYear, currentMonth);
//     const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
//     const days = [];
    
//     for (let i = 0; i < firstDay; i++) {
//       days.push(null);
//     }
//     for (let i = 1; i <= daysInMonth; i++) {
//       days.push(i);
//     }
//     return days;
//   };

//   const handleDateSelect = (day: number) => {
//     const jalaliStr = formatJalaliDate(currentYear, currentMonth, day);
//     onChange(jalaliStr);
//     setInputValue(jalaliStr);
//     setCurrentDay(day);
//     setIsOpen(false);
//     setIsTyping(false);
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let val = e.target.value;
//     setIsTyping(true);
    
//     val = val.replace(/[^0-9/]/g, '');
//     if (val.length > 10) {
//       val = val.slice(0, 10);
//     }
    
//     const numbers = val.replace(/\//g, '');
//     if (numbers.length >= 5 && !val.includes('/')) {
//       val = `${numbers.slice(0, 4)}/${numbers.slice(4)}`;
//     } else if (numbers.length >= 7 && val.split('/').length === 2) {
//       const parts = val.split('/');
//       if (parts[1].length >= 2) {
//         val = `${parts[0]}/${parts[1].slice(0, 2)}/${numbers.slice(6)}`;
//       }
//     }
    
//     setInputValue(val);
    
//     if (val.length >= 4) {
//       const parts = val.split('/');
      
//       if (parts.length >= 1) {
//         const year = parseInt(parts[0]);
//         if (!isNaN(year) && year >= 1300 && year <= 1500) {
//           setCurrentYear(year);
//         }
//       }
      
//       if (parts.length >= 2) {
//         const month = parseInt(parts[1]);
//         if (!isNaN(month) && month >= 1 && month <= 12) {
//           setCurrentMonth(month);
//         }
//       }
      
//       if (parts.length >= 3) {
//         const day = parseInt(parts[2]);
//         if (!isNaN(day) && day >= 1 && day <= 31) {
//           setCurrentDay(day);
//         }
//       }
//     }
//   };

//   const handleInputBlur = () => {
//     setIsTyping(false);
    
//     if (!inputValue) {
//       onChange(null);
//       return;
//     }
    
//     const parsed = parseJalaliDate(inputValue);
//     if (parsed) {
//       const formatted = formatJalaliDate(parsed.year, parsed.month, parsed.day);
//       onChange(formatted);
//       setInputValue(formatted);
//       setCurrentYear(parsed.year);
//       setCurrentMonth(parsed.month);
//       setCurrentDay(parsed.day);
//       return;
//     }
    
//     if (value) {
//       const formatted = toJalaliFormat(value);
//       if (formatted) {
//         setInputValue(formatted);
//       } else {
//         setInputValue('');
//         onChange(null);
//       }
//     } else {
//       setInputValue('');
//       onChange(null);
//     }
//   };

//   const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       handleInputBlur();
//       setIsOpen(false);
//     }
//   };

//   const handleCalendarClick = () => {
//     if (!disabled) {
//       setIsOpen(true);
//     }
//   };

//   const changeMonth = (delta: number) => {
//     let newMonth = currentMonth + delta;
//     let newYear = currentYear;
    
//     if (newMonth < 1) {
//       newMonth = 12;
//       newYear--;
//     } else if (newMonth > 12) {
//       newMonth = 1;
//       newYear++;
//     }
//     setCurrentMonth(newMonth);
//     setCurrentYear(newYear);
//   };

//   const changeYear = (delta: number) => {
//     setCurrentYear(prev => prev + delta);
//   };

//   const clearDate = () => {
//     onChange(null);
//     setInputValue('');
//     setIsOpen(false);
//     setIsTyping(false);
//   };

//   const isToday = (day: number) => {
//     const today = moment();
//     const todayYear = today.jYear();
//     const todayMonth = today.jMonth() + 1;
//     const todayDay = today.jDate();
    
//     return todayYear === currentYear && todayMonth === currentMonth && todayDay === day;
//   };

//   const isSelected = (day: number) => {
//     if (inputValue && inputValue.length >= 4) {
//       const parts = inputValue.split('/');
      
//       let year = null;
//       if (parts.length >= 1) {
//         year = parseInt(parts[0]);
//         if (isNaN(year) || year < 1300 || year > 1500) return false;
//       }
      
//       let month = null;
//       if (parts.length >= 2) {
//         month = parseInt(parts[1]);
//         if (isNaN(month) || month < 1 || month > 12) return false;
//       }
      
//       let dayFromInput = null;
//       if (parts.length >= 3) {
//         dayFromInput = parseInt(parts[2]);
//         if (isNaN(dayFromInput) || dayFromInput < 1 || dayFromInput > 31) return false;
//       }
      
//       if (year === currentYear && month === currentMonth && dayFromInput !== null) {
//         return dayFromInput === day;
//       }
      
//       if (year === currentYear && month === currentMonth && dayFromInput === null) {
//         return false;
//       }
//     }
//     return false;
//   };

//   const goToToday = () => {
//     const today = moment();
//     const year = today.jYear();
//     const month = today.jMonth() + 1;
//     const day = today.jDate();
//     const jalaliStr = formatJalaliDate(year, month, day);
    
//     onChange(jalaliStr);
//     setInputValue(jalaliStr);
//     setCurrentYear(year);
//     setCurrentMonth(month);
//     setCurrentDay(day);
//     setIsOpen(false);
//     setIsTyping(false);
//   };

//   const handleYearSelect = (year: number) => {
//     setCurrentYear(year);
//     setShowYearDropdown(false);
//   };

//   const handleMonthSelect = (month: number) => {
//     setCurrentMonth(month);
//     setShowMonthDropdown(false);
//   };

//   const handleDaySelect = (day: number) => {
//     const jalaliStr = formatJalaliDate(currentYear, currentMonth, day);
//     onChange(jalaliStr);
//     setInputValue(jalaliStr);
//     setCurrentDay(day);
//     setShowDayDropdown(false);
//     setIsOpen(false);
//   };

//   const getYearOptions = () => {
//     const years = [];
//     const currentYearInt = moment().jYear();
//     for (let i = currentYearInt - 10; i <= currentYearInt + 10; i++) {
//       years.push(i);
//     }
//     return years;
//   };

//   const getMonthOptions = () => {
//     return monthNames.map((name, index) => ({
//       value: index + 1,
//       label: name
//     }));
//   };

//   const getDayOptions = () => {
//     const daysInMonth = getJalaliMonthDays(currentYear, currentMonth);
//     const days = [];
//     for (let i = 1; i <= daysInMonth; i++) {
//       days.push(i);
//     }
//     return days;
//   };

//   const displayValue = inputValue;

//   return (
//     <div className={`position-relative ${className}`} ref={pickerRef} style={{ direction: 'rtl' }}>
//       {label && (
//         <label className="form-label fw-semibold mb-1" style={{ fontSize: '14px' }}>
//           {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
//         </label>
//       )}
      
//       <div className="position-relative">
//         <input
//           type="text"
//           className={`form-control ${error ? 'is-invalid' : ''}`}
//           placeholder={placeholder}
//           value={displayValue}
//           onChange={handleInputChange}
//           onBlur={handleInputBlur}
//           onKeyDown={handleInputKeyDown}
//           onFocus={() => !disabled && handleCalendarClick()}
//           disabled={disabled}
//           required={required}
//           style={{ 
//             paddingLeft: '40px', 
//             direction: 'ltr',
//             borderRadius: '10px',
//             border: error ? '1px solid #dc3545' : '1px solid #e0e0e0',
//             padding: '10px 12px',
//             width: '100%',
//             fontFamily: 'monospace',
//             fontSize: '14px',
//             backgroundColor: disabled ? '#f5f5f5' : 'white',
//             cursor: disabled ? 'not-allowed' : 'pointer'
//           }}
//         />
//         <div
//           className="position-absolute d-flex align-items-center"
//           style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
//         >
//           <button
//             type="button"
//             onClick={handleCalendarClick}
//             style={{ 
//               background: 'none', 
//               border: 'none', 
//               padding: '4px',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               borderRadius: '6px',
//               transition: 'all 0.2s',
//               opacity: disabled ? 0.5 : 1
//             }}
//             disabled={disabled}
//             onMouseEnter={(e) => {
//               if (!disabled) {
//                 e.currentTarget.style.backgroundColor = '#f0f0f0';
//               }
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.backgroundColor = 'transparent';
//             }}
//           >
//             <Calendar size={18} color="#6c757d" />
//           </button>
//         </div>
//       </div>
      
//       {error && <div className="text-danger small mt-1">{error}</div>}

//       {isOpen && !disabled && (
//         <>
//           <div 
//             style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1040 }}
//             onClick={() => {
//               setIsOpen(false);
//               setShowYearDropdown(false);
//               setShowMonthDropdown(false);
//               setShowDayDropdown(false);
//             }}
//           />
//           <div 
//             className="position-absolute bg-white rounded-3 shadow-lg mt-2"
//             style={{ 
//               zIndex: 1050, 
//               width: '340px',
//               top: '100%',
//               left: 0,
//               boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
//               border: '1px solid #eef2f6',
//               overflow: 'hidden'
//             }}
//           >
//             {/* هدر تقویم */}
//             <div style={{ 
//               background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
//               padding: '12px 14px',
//               color: 'white'
//             }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
//                 <button
//                   type="button"
//                   onClick={() => changeYear(-1)}
//                   style={{
//                     background: 'rgba(255,255,255,0.15)',
//                     border: 'none',
//                     borderRadius: '6px',
//                     width: '28px',
//                     height: '28px',
//                     cursor: 'pointer',
//                     color: 'white',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     transition: 'all 0.2s',
//                     fontSize: '16px',
//                     fontWeight: 'bold'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                   }}
//                 >
//                   «
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => changeMonth(-1)}
//                   style={{
//                     background: 'rgba(255,255,255,0.15)',
//                     border: 'none',
//                     borderRadius: '6px',
//                     width: '28px',
//                     height: '28px',
//                     cursor: 'pointer',
//                     color: 'white',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     transition: 'all 0.2s',
//                     fontSize: '16px',
//                     fontWeight: 'bold'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                   }}
//                 >
//                   ‹
//                 </button>

//                 {/* انتخاب سال */}
//                 <div style={{ position: 'relative' }} ref={yearDropdownRef}>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowYearDropdown(!showYearDropdown);
//                       setShowMonthDropdown(false);
//                       setShowDayDropdown(false);
//                     }}
//                     style={{
//                       background: 'rgba(255,255,255,0.15)',
//                       border: 'none',
//                       borderRadius: '6px',
//                       padding: '4px 12px',
//                       cursor: 'pointer',
//                       color: 'white',
//                       fontSize: '14px',
//                       fontWeight: 'bold',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '4px',
//                       minWidth: '60px',
//                       justifyContent: 'center',
//                       transition: 'all 0.2s'
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                     }}
//                   >
//                     {currentYear}
//                     {showYearDropdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
//                   </button>
                  
//                   {showYearDropdown && (
//                     <div
//                       style={{
//                         position: 'absolute',
//                         top: '100%',
//                         left: '50%',
//                         transform: 'translateX(-50%)',
//                         marginTop: '4px',
//                         background: 'white',
//                         borderRadius: '8px',
//                         boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
//                         maxHeight: '180px',
//                         overflowY: 'auto',
//                         zIndex: 1060,
//                         minWidth: '80px',
//                         color: '#333'
//                       }}
//                     >
//                       {getYearOptions().map((year) => (
//                         <div
//                           key={year}
//                           onClick={() => handleYearSelect(year)}
//                           style={{
//                             padding: '8px 16px',
//                             cursor: 'pointer',
//                             fontSize: '14px',
//                             textAlign: 'center',
//                             background: year === currentYear ? '#e3f0ff' : 'transparent',
//                             color: year === currentYear ? '#1e3c72' : '#333',
//                             fontWeight: year === currentYear ? 'bold' : 'normal',
//                             transition: 'all 0.15s',
//                             borderBottom: '1px solid #f5f5f5'
//                           }}
//                           onMouseEnter={(e) => {
//                             if (year !== currentYear) {
//                               e.currentTarget.style.background = '#f5f7fa';
//                             }
//                           }}
//                           onMouseLeave={(e) => {
//                             if (year !== currentYear) {
//                               e.currentTarget.style.background = 'transparent';
//                             }
//                           }}
//                         >
//                           {year}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* انتخاب ماه */}
//                 <div style={{ position: 'relative' }} ref={monthDropdownRef}>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowMonthDropdown(!showMonthDropdown);
//                       setShowYearDropdown(false);
//                       setShowDayDropdown(false);
//                     }}
//                     style={{
//                       background: 'rgba(255,255,255,0.15)',
//                       border: 'none',
//                       borderRadius: '6px',
//                       padding: '4px 12px',
//                       cursor: 'pointer',
//                       color: 'white',
//                       fontSize: '14px',
//                       fontWeight: 'bold',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '4px',
//                       minWidth: '70px',
//                       justifyContent: 'center',
//                       transition: 'all 0.2s'
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                     }}
//                   >
//                     {monthNames[currentMonth - 1]}
//                     {showMonthDropdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
//                   </button>
                  
//                   {showMonthDropdown && (
//                     <div
//                       style={{
//                         position: 'absolute',
//                         top: '100%',
//                         left: '50%',
//                         transform: 'translateX(-50%)',
//                         marginTop: '4px',
//                         background: 'white',
//                         borderRadius: '8px',
//                         boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
//                         maxHeight: '180px',
//                         overflowY: 'auto',
//                         zIndex: 1060,
//                         minWidth: '100px',
//                         color: '#333'
//                       }}
//                     >
//                       {getMonthOptions().map((month) => (
//                         <div
//                           key={month.value}
//                           onClick={() => handleMonthSelect(month.value)}
//                           style={{
//                             padding: '8px 16px',
//                             cursor: 'pointer',
//                             fontSize: '14px',
//                             textAlign: 'center',
//                             background: month.value === currentMonth ? '#e3f0ff' : 'transparent',
//                             color: month.value === currentMonth ? '#1e3c72' : '#333',
//                             fontWeight: month.value === currentMonth ? 'bold' : 'normal',
//                             transition: 'all 0.15s',
//                             borderBottom: '1px solid #f5f5f5'
//                           }}
//                           onMouseEnter={(e) => {
//                             if (month.value !== currentMonth) {
//                               e.currentTarget.style.background = '#f5f7fa';
//                             }
//                           }}
//                           onMouseLeave={(e) => {
//                             if (month.value !== currentMonth) {
//                               e.currentTarget.style.background = 'transparent';
//                             }
//                           }}
//                         >
//                           {month.label}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* انتخاب روز */}
//                 <div style={{ position: 'relative' }} ref={dayDropdownRef}>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowDayDropdown(!showDayDropdown);
//                       setShowYearDropdown(false);
//                       setShowMonthDropdown(false);
//                     }}
//                     style={{
//                       background: 'rgba(255,255,255,0.15)',
//                       border: 'none',
//                       borderRadius: '6px',
//                       padding: '4px 10px',
//                       cursor: 'pointer',
//                       color: 'white',
//                       fontSize: '14px',
//                       fontWeight: 'bold',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '4px',
//                       minWidth: '50px',
//                       justifyContent: 'center',
//                       transition: 'all 0.2s'
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                     }}
//                   >
//                     {currentDay}
//                     {showDayDropdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
//                   </button>
                  
//                   {showDayDropdown && (
//                     <div
//                       style={{
//                         position: 'absolute',
//                         top: '100%',
//                         left: '50%',
//                         transform: 'translateX(-50%)',
//                         marginTop: '4px',
//                         background: 'white',
//                         borderRadius: '8px',
//                         boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
//                         maxHeight: '180px',
//                         overflowY: 'auto',
//                         zIndex: 1060,
//                         minWidth: '60px',
//                         color: '#333'
//                       }}
//                     >
//                       {getDayOptions().map((day) => (
//                         <div
//                           key={day}
//                           onClick={() => handleDaySelect(day)}
//                           style={{
//                             padding: '8px 16px',
//                             cursor: 'pointer',
//                             fontSize: '14px',
//                             textAlign: 'center',
//                             background: day === currentDay ? '#e3f0ff' : 'transparent',
//                             color: day === currentDay ? '#1e3c72' : '#333',
//                             fontWeight: day === currentDay ? 'bold' : 'normal',
//                             transition: 'all 0.15s',
//                             borderBottom: '1px solid #f5f5f5'
//                           }}
//                           onMouseEnter={(e) => {
//                             if (day !== currentDay) {
//                               e.currentTarget.style.background = '#f5f7fa';
//                             }
//                           }}
//                           onMouseLeave={(e) => {
//                             if (day !== currentDay) {
//                               e.currentTarget.style.background = 'transparent';
//                             }
//                           }}
//                         >
//                           {day}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => changeMonth(1)}
//                   style={{
//                     background: 'rgba(255,255,255,0.15)',
//                     border: 'none',
//                     borderRadius: '6px',
//                     width: '28px',
//                     height: '28px',
//                     cursor: 'pointer',
//                     color: 'white',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     transition: 'all 0.2s',
//                     fontSize: '16px',
//                     fontWeight: 'bold'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                   }}
//                 >
//                   ›
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => changeYear(1)}
//                   style={{
//                     background: 'rgba(255,255,255,0.15)',
//                     border: 'none',
//                     borderRadius: '6px',
//                     width: '28px',
//                     height: '28px',
//                     cursor: 'pointer',
//                     color: 'white',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     transition: 'all 0.2s',
//                     fontSize: '16px',
//                     fontWeight: 'bold'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                   }}
//                 >
//                   »
//                 </button>
//               </div>
//             </div>
            
//             {/* روزهای هفته */}
//             <div style={{ 
//               display: 'grid', 
//               gridTemplateColumns: 'repeat(7, 1fr)',
//               padding: '8px 10px',
//               borderBottom: '1px solid #eef2f6',
//               backgroundColor: '#f8f9fa'
//             }}>
//               {weekDays.map((day, idx) => (
//                 <div key={idx} style={{ 
//                   textAlign: 'center', 
//                   fontSize: '12px', 
//                   fontWeight: 'bold', 
//                   color: '#6c757d',
//                   padding: '4px 0'
//                 }}>
//                   {day}
//                 </div>
//               ))}
//             </div>
            
//             {/* روزهای ماه */}
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 10px', gap: '2px' }}>
//               {getDays().map((day, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => day && handleDateSelect(day)}
//                   disabled={!day}
//                   style={{
//                     textAlign: 'center',
//                     padding: '8px 0',
//                     borderRadius: '6px',
//                     border: 'none',
//                     background: isSelected(day)
//                       ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
//                       : isToday(day)
//                       ? '#e8f0fe'
//                       : 'transparent',
//                     color: isSelected(day) ? 'white' : isToday(day) ? '#1e3c72' : '#333',
//                     fontWeight: isSelected(day) || isToday(day) ? 'bold' : 'normal',
//                     cursor: day ? 'pointer' : 'default',
//                     opacity: day ? 1 : 0.3,
//                     fontSize: '14px',
//                     transition: 'all 0.15s',
//                     fontFamily: 'inherit'
//                   }}
//                   onMouseEnter={(e) => {
//                     if (day && !isSelected(day) && !isToday(day)) {
//                       e.currentTarget.style.background = '#f0f2f5';
//                     }
//                   }}
//                   onMouseLeave={(e) => {
//                     if (day && !isSelected(day) && !isToday(day)) {
//                       e.currentTarget.style.background = 'transparent';
//                     }
//                   }}
//                 >
//                   {day || ''}
//                 </button>
//               ))}
//             </div>
            
//             {/* دکمه امروز */}
//             <div style={{ 
//               padding: '8px',
//               borderTop: '1px solid #eef2f6',
//               textAlign: 'center',
//               background: '#fafbfc'
//             }}>
//               <button
//                 type="button"
//                 onClick={goToToday}
//                 style={{
//                   background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
//                   border: 'none',
//                   borderRadius: '20px',
//                   padding: '6px 24px',
//                   color: 'white',
//                   fontSize: '13px',
//                   cursor: 'pointer',
//                   transition: 'all 0.2s',
//                   boxShadow: '0 2px 8px rgba(30, 60, 114, 0.25)',
//                   fontWeight: '500'
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = 'scale(1.04)';
//                   e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 60, 114, 0.35)';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = 'scale(1)';
//                   e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 60, 114, 0.25)';
//                 }}
//               >
//                 امروز
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default JalaliDatePicker;

//قدیمی

// // src/components/JalaliDatePicker.tsx
// import React, { useState, useRef, useEffect } from 'react';
// import { Calendar, X, ChevronDown, ChevronUp } from 'lucide-react';
// import moment from 'moment-jalaali';

// interface JalaliDatePickerProps {
//   value?: string | null;
//   onChange: (date: string | null) => void;
//   placeholder?: string;
//   required?: boolean;
//   label?: string;
//   error?: string;
//   disabled?: boolean;
//   className?: string;
// }

// moment.loadPersian({ dialect: 'persian-modern' });

// const LEAP_YEARS = [
//   1210, 1214, 1218, 1222, 1226, 1230, 1234, 1238, 1243,
//   1247, 1251, 1255, 1259, 1263, 1267, 1271, 1276,
//   1280, 1284, 1288, 1292, 1296, 1300, 1304, 1309,
//   1313, 1317, 1321, 1325, 1329, 1333, 1337, 1342,
//   1346, 1350, 1354, 1358, 1362, 1366, 1370, 1375,
//   1379, 1383, 1387, 1391, 1395, 1399, 1403, 1408,
//   1412, 1416, 1420, 1424, 1428, 1432, 1436, 1441,
//   1445, 1449, 1453, 1457, 1461, 1465, 1469, 1474,
//   1478, 1482, 1486, 1490, 1494, 1498
// ];

// const getJalaliMonthDays = (year: number, month: number): number => {
//   const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
//   if (month === 12) {
//     return LEAP_YEARS.includes(year) ? 30 : 29;
//   }
//   return daysInMonth[month - 1];
// };

// const getFirstDayOfMonth = (year: number, month: number): number => {
//   const date = moment(`${year}/${month}/01`, 'jYYYY/jMM/jDD');
//   let day = date.day();
//   day = (day + 1) % 7;
//   return day;
// };

// const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
//   value,
//   onChange,
//   placeholder = '1402/12/25',
//   required = false,
//   label,
//   error,
//   disabled = false,
//   className = '',
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [currentYear, setCurrentYear] = useState(moment().jYear());
//   const [currentMonth, setCurrentMonth] = useState(moment().jMonth() + 1);
//   const [currentDay, setCurrentDay] = useState(moment().jDate());
//   const [inputValue, setInputValue] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [showYearDropdown, setShowYearDropdown] = useState(false);
//   const [showMonthDropdown, setShowMonthDropdown] = useState(false);
//   const [showDayDropdown, setShowDayDropdown] = useState(false);
//   const pickerRef = useRef<HTMLDivElement>(null);
//   const yearDropdownRef = useRef<HTMLDivElement>(null);
//   const monthDropdownRef = useRef<HTMLDivElement>(null);
//   const dayDropdownRef = useRef<HTMLDivElement>(null);

//   const monthNames = [
//     'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
//     'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
//   ];

//   const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

//   const formatJalaliDate = (year: number, month: number, day: number): string => {
//     return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
//   };

//   const parseJalaliDate = (dateStr: string): { year: number; month: number; day: number } | null => {
//     if (!dateStr) return null;
//     const cleanStr = dateStr.replace(/[^0-9/]/g, '');
//     const parts = cleanStr.split('/');
//     if (parts.length !== 3) return null;
    
//     const year = parseInt(parts[0]);
//     const month = parseInt(parts[1]);
//     const day = parseInt(parts[2]);
    
//     if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
//     if (year < 1300 || year > 1500) return null;
//     if (month < 1 || month > 12) return null;
//     if (day < 1 || day > 31) return null;
    
//     const m = moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD');
//     if (!m.isValid()) return null;
    
//     return { year, month, day };
//   };

//   const toJalaliFormat = (dateStr: string | null | undefined): string | null => {
//     if (!dateStr) return null;
//     const parsed = parseJalaliDate(dateStr);
//     if (parsed) {
//       return formatJalaliDate(parsed.year, parsed.month, parsed.day);
//     }
//     if (dateStr.includes('-')) {
//       try {
//         const parts = dateStr.split('-');
//         if (parts.length === 3) {
//           const year = parseInt(parts[0]);
//           const month = parseInt(parts[1]);
//           const day = parseInt(parts[2]);
//           if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
//             const m = moment(`${year}/${month}/${day}`, 'YYYY/MM/DD');
//             if (m.isValid()) {
//               return formatJalaliDate(m.jYear(), m.jMonth() + 1, m.jDate());
//             }
//           }
//         }
//       } catch (e) {
//         console.warn('Error parsing date:', dateStr, e);
//       }
//     }
//     return null;
//   };

//   useEffect(() => {
//     if (!value || value === '' || value === 'null' || value === 'undefined') {
//       if (!isTyping) {
//         setInputValue('');
//       }
//       return;
//     }
//     if (value && !isTyping) {
//       const formatted = toJalaliFormat(value);
//       if (formatted) {
//         const parsed = parseJalaliDate(formatted);
//         if (parsed) {
//           setInputValue(formatted);
//           setCurrentYear(parsed.year);
//           setCurrentMonth(parsed.month);
//           setCurrentDay(parsed.day);
//           return;
//         }
//       }
//       setInputValue('');
//     } else if (!value && !isTyping) {
//       setInputValue('');
//     }
//   }, [value, isTyping]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//         setShowYearDropdown(false);
//         setShowMonthDropdown(false);
//         setShowDayDropdown(false);
//       }
//       if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
//         setShowYearDropdown(false);
//       }
//       if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
//         setShowMonthDropdown(false);
//       }
//       if (dayDropdownRef.current && !dayDropdownRef.current.contains(event.target as Node)) {
//         setShowDayDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const getDays = () => {
//     const daysInMonth = getJalaliMonthDays(currentYear, currentMonth);
//     const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
//     const days = [];
    
//     for (let i = 0; i < firstDay; i++) {
//       days.push(null);
//     }
//     for (let i = 1; i <= daysInMonth; i++) {
//       days.push(i);
//     }
//     return days;
//   };

//   const handleDateSelect = (day: number) => {
//     const jalaliStr = formatJalaliDate(currentYear, currentMonth, day);
//     console.log('📤 Date selected:', jalaliStr);
//     onChange(jalaliStr);
//     setInputValue(jalaliStr);
//     setCurrentDay(day);
//     setIsOpen(false);
//     setIsTyping(false);
//   };

//   // ✅ اصلاح: پشتیبانی از اعداد تک رقمی برای ماه و روز
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let val = e.target.value;
//     setIsTyping(true);
    
//     val = val.replace(/[^0-9/]/g, '');
//     if (val.length > 10) {
//       val = val.slice(0, 10);
//     }
    
//     const numbers = val.replace(/\//g, '');
//     if (numbers.length >= 5 && !val.includes('/')) {
//       val = `${numbers.slice(0, 4)}/${numbers.slice(4)}`;
//     } else if (numbers.length >= 7 && val.split('/').length === 2) {
//       const parts = val.split('/');
//       if (parts[1].length >= 2) {
//         val = `${parts[0]}/${parts[1].slice(0, 2)}/${numbers.slice(6)}`;
//       }
//     }
    
//     setInputValue(val);
    
//     // ✅ حتی با اعداد تک رقمی هم تقویم رو به روز کن
//     if (val.length >= 4) {
//       const parts = val.split('/');
      
//       // استخراج سال
//       if (parts.length >= 1) {
//         const year = parseInt(parts[0]);
//         if (!isNaN(year) && year >= 1300 && year <= 1500) {
//           setCurrentYear(year);
//         }
//       }
      
//       // استخراج ماه (تک رقمی یا دو رقمی)
//       if (parts.length >= 2) {
//         const month = parseInt(parts[1]);
//         if (!isNaN(month) && month >= 1 && month <= 12) {
//           setCurrentMonth(month);
//         }
//       }
      
//       // استخراج روز (تک رقمی یا دو رقمی)
//       if (parts.length >= 3) {
//         const day = parseInt(parts[2]);
//         if (!isNaN(day) && day >= 1 && day <= 31) {
//           setCurrentDay(day);
//         }
//       }
//     }
//   };

//   const handleInputBlur = () => {
//     setIsTyping(false);
    
//     if (!inputValue) {
//       onChange(null);
//       return;
//     }
    
//     const parsed = parseJalaliDate(inputValue);
//     if (parsed) {
//       const formatted = formatJalaliDate(parsed.year, parsed.month, parsed.day);
//       console.log('📤 Formatted on blur:', formatted);
//       onChange(formatted);
//       setInputValue(formatted);
//       setCurrentYear(parsed.year);
//       setCurrentMonth(parsed.month);
//       setCurrentDay(parsed.day);
//       return;
//     }
    
//     if (value) {
//       const formatted = toJalaliFormat(value);
//       if (formatted) {
//         setInputValue(formatted);
//       } else {
//         setInputValue('');
//         onChange(null);
//       }
//     } else {
//       setInputValue('');
//       onChange(null);
//     }
//   };

//   const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       handleInputBlur();
//       setIsOpen(false);
//     }
//   };

//   const handleCalendarClick = () => {
//     if (!disabled) {
//       setIsOpen(true);
//     }
//   };

//   const changeMonth = (delta: number) => {
//     let newMonth = currentMonth + delta;
//     let newYear = currentYear;
    
//     if (newMonth < 1) {
//       newMonth = 12;
//       newYear--;
//     } else if (newMonth > 12) {
//       newMonth = 1;
//       newYear++;
//     }
//     setCurrentMonth(newMonth);
//     setCurrentYear(newYear);
//   };

//   const changeYear = (delta: number) => {
//     setCurrentYear(prev => prev + delta);
//   };

//   const clearDate = () => {
//     onChange(null);
//     setInputValue('');
//     setIsOpen(false);
//     setIsTyping(false);
//   };

//   const isToday = (day: number) => {
//     const today = moment();
//     const todayYear = today.jYear();
//     const todayMonth = today.jMonth() + 1;
//     const todayDay = today.jDate();
    
//     return todayYear === currentYear && todayMonth === currentMonth && todayDay === day;
//   };

//   const isSelected = (day: number) => {
//     if (inputValue && inputValue.length >= 4) {
//       const parts = inputValue.split('/');
      
//       // استخراج سال
//       let year = null;
//       if (parts.length >= 1) {
//         year = parseInt(parts[0]);
//         if (isNaN(year) || year < 1300 || year > 1500) return false;
//       }
      
//       // استخراج ماه
//       let month = null;
//       if (parts.length >= 2) {
//         month = parseInt(parts[1]);
//         if (isNaN(month) || month < 1 || month > 12) return false;
//       }
      
//       // استخراج روز
//       let dayFromInput = null;
//       if (parts.length >= 3) {
//         dayFromInput = parseInt(parts[2]);
//         if (isNaN(dayFromInput) || dayFromInput < 1 || dayFromInput > 31) return false;
//       }
      
//       // اگر سال و ماه با current مطابقت داره و روز مشخص شده
//       if (year === currentYear && month === currentMonth && dayFromInput !== null) {
//         return dayFromInput === day;
//       }
      
//       // اگر فقط سال و ماه مشخص شده، هیچ روزی رو هایلایت نکن
//       if (year === currentYear && month === currentMonth && dayFromInput === null) {
//         return false;
//       }
//     }
//     return false;
//   };

//   const goToToday = () => {
//     const today = moment();
//     const year = today.jYear();
//     const month = today.jMonth() + 1;
//     const day = today.jDate();
//     const jalaliStr = formatJalaliDate(year, month, day);
    
//     console.log('📤 Today date:', jalaliStr);
//     onChange(jalaliStr);
//     setInputValue(jalaliStr);
//     setCurrentYear(year);
//     setCurrentMonth(month);
//     setCurrentDay(day);
//     setIsOpen(false);
//     setIsTyping(false);
//   };

//   const handleYearSelect = (year: number) => {
//     setCurrentYear(year);
//     setShowYearDropdown(false);
//   };

//   const handleMonthSelect = (month: number) => {
//     setCurrentMonth(month);
//     setShowMonthDropdown(false);
//   };

//   const handleDaySelect = (day: number) => {
//     const jalaliStr = formatJalaliDate(currentYear, currentMonth, day);
//     console.log('📤 Day selected:', jalaliStr);
//     onChange(jalaliStr);
//     setInputValue(jalaliStr);
//     setCurrentDay(day);
//     setShowDayDropdown(false);
//     setIsOpen(false);
//   };

//   const getYearOptions = () => {
//     const years = [];
//     for (let i = 1300; i <= 1500; i++) {
//       years.push(i);
//     }
//     return years;
//   };

//   const getMonthOptions = () => {
//     return monthNames.map((name, index) => ({
//       value: index + 1,
//       label: name
//     }));
//   };

//   const getDayOptions = () => {
//     const daysInMonth = getJalaliMonthDays(currentYear, currentMonth);
//     const days = [];
//     for (let i = 1; i <= daysInMonth; i++) {
//       days.push(i);
//     }
//     return days;
//   };

//   const displayValue = inputValue;

//   return (
//     <div className={`position-relative ${className}`} ref={pickerRef} style={{ direction: 'rtl' }}>
//       {label && (
//         <label className="form-label fw-semibold mb-1" style={{ fontSize: '14px' }}>
//           {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
//         </label>
//       )}
      
//       <div className="position-relative">
//         <input
//           type="text"
//           className={`form-control ${error ? 'is-invalid' : ''}`}
//           placeholder={placeholder}
//           value={displayValue}
//           onChange={handleInputChange}
//           onBlur={handleInputBlur}
//           onKeyDown={handleInputKeyDown}
//           onFocus={() => !disabled && handleCalendarClick()}
//           disabled={disabled}
//           required={required}
//           style={{ 
//             paddingLeft: '60px', 
//             direction: 'ltr',
//             borderRadius: '10px',
//             border: error ? '1px solid #dc3545' : '1px solid #e0e0e0',
//             padding: '10px 12px',
//             width: '100%',
//             fontFamily: 'monospace'
//           }}
//         />
//         <div
//           className="position-absolute d-flex align-items-center gap-2"
//           style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
//         >
//           {inputValue && (
//             <button
//               type="button"
//               onClick={clearDate}
//               style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', opacity: 0.6 }}
//             >
//               <X size={16} color="#999" />
//             </button>
//           )}
//           <button
//             type="button"
//             onClick={handleCalendarClick}
//             style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
//             disabled={disabled}
//           >
//             <Calendar size={18} color="#aaa" />
//           </button>
//         </div>
//       </div>
      
//       {error && <div className="text-danger small mt-1">{error}</div>}
//       {isTyping && inputValue && inputValue.length < 10 && (
//         <div className="text-muted small mt-1">
//           مثال: 1402/12/25
//         </div>
//       )}

//       {isOpen && !disabled && (
//         <>
//           <div 
//             style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1040 }}
//             onClick={() => {
//               setIsOpen(false);
//               setShowYearDropdown(false);
//               setShowMonthDropdown(false);
//               setShowDayDropdown(false);
//             }}
//           />
//           <div 
//             className="position-absolute bg-white rounded-3 shadow-lg mt-2"
//             style={{ 
//               zIndex: 1050, 
//               width: '340px',
//               top: '100%',
//               left: 0,
//               boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
//               border: '1px solid #eef2f6',
//               overflow: 'hidden'
//             }}
//           >
//             <div style={{ 
//               background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
//               padding: '12px',
//               color: 'white'
//             }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
//                 <button
//                   type="button"
//                   onClick={() => changeYear(-1)}
//                   style={{
//                     background: 'rgba(255,255,255,0.15)',
//                     border: '1px solid rgba(255,255,255,0.2)',
//                     borderRadius: '8px',
//                     width: '30px',
//                     height: '30px',
//                     cursor: 'pointer',
//                     color: 'white',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     transition: 'all 0.3s ease',
//                     fontSize: '18px',
//                     fontWeight: 'bold'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                     e.currentTarget.style.transform = 'scale(1.05)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                     e.currentTarget.style.transform = 'scale(1)';
//                   }}
//                 >
//                   «
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => changeMonth(-1)}
//                   style={{
//                     background: 'rgba(255,255,255,0.15)',
//                     border: '1px solid rgba(255,255,255,0.2)',
//                     borderRadius: '8px',
//                     width: '30px',
//                     height: '30px',
//                     cursor: 'pointer',
//                     color: 'white',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     transition: 'all 0.3s ease',
//                     fontSize: '18px',
//                     fontWeight: 'bold'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                     e.currentTarget.style.transform = 'scale(1.05)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                     e.currentTarget.style.transform = 'scale(1)';
//                   }}
//                 >
//                   ‹
//                 </button>

//                 <div style={{ position: 'relative' }} ref={yearDropdownRef}>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowYearDropdown(!showYearDropdown);
//                       setShowMonthDropdown(false);
//                       setShowDayDropdown(false);
//                     }}
//                     style={{
//                       background: 'rgba(255,255,255,0.15)',
//                       border: '1px solid rgba(255,255,255,0.2)',
//                       borderRadius: '8px',
//                       padding: '4px 10px',
//                       cursor: 'pointer',
//                       color: 'white',
//                       fontSize: '13px',
//                       fontWeight: 'bold',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '4px',
//                       minWidth: '60px',
//                       justifyContent: 'center',
//                       transition: 'all 0.3s ease'
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                     }}
//                   >
//                     {currentYear}
//                     {showYearDropdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
//                   </button>
                  
//                   {showYearDropdown && (
//                     <div
//                       style={{
//                         position: 'absolute',
//                         top: '100%',
//                         left: '50%',
//                         transform: 'translateX(-50%)',
//                         marginTop: '4px',
//                         background: 'white',
//                         borderRadius: '10px',
//                         boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
//                         maxHeight: '160px',
//                         overflowY: 'auto',
//                         zIndex: 1060,
//                         minWidth: '70px',
//                         color: '#333'
//                       }}
//                     >
//                       {getYearOptions().map((year) => (
//                         <div
//                           key={year}
//                           onClick={() => handleYearSelect(year)}
//                           style={{
//                             padding: '6px 14px',
//                             cursor: 'pointer',
//                             fontSize: '13px',
//                             textAlign: 'center',
//                             background: year === currentYear ? '#e3f0ff' : 'transparent',
//                             color: year === currentYear ? '#1e3c72' : '#333',
//                             fontWeight: year === currentYear ? 'bold' : 'normal',
//                             transition: 'all 0.2s ease'
//                           }}
//                           onMouseEnter={(e) => {
//                             if (year !== currentYear) {
//                               e.currentTarget.style.background = '#f5f7fa';
//                             }
//                           }}
//                           onMouseLeave={(e) => {
//                             if (year !== currentYear) {
//                               e.currentTarget.style.background = 'transparent';
//                             }
//                           }}
//                         >
//                           {year}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 <div style={{ position: 'relative' }} ref={monthDropdownRef}>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowMonthDropdown(!showMonthDropdown);
//                       setShowYearDropdown(false);
//                       setShowDayDropdown(false);
//                     }}
//                     style={{
//                       background: 'rgba(255,255,255,0.15)',
//                       border: '1px solid rgba(255,255,255,0.2)',
//                       borderRadius: '8px',
//                       padding: '4px 10px',
//                       cursor: 'pointer',
//                       color: 'white',
//                       fontSize: '13px',
//                       fontWeight: 'bold',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '4px',
//                       minWidth: '70px',
//                       justifyContent: 'center',
//                       transition: 'all 0.3s ease'
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                     }}
//                   >
//                     {monthNames[currentMonth - 1]}
//                     {showMonthDropdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
//                   </button>
                  
//                   {showMonthDropdown && (
//                     <div
//                       style={{
//                         position: 'absolute',
//                         top: '100%',
//                         left: '50%',
//                         transform: 'translateX(-50%)',
//                         marginTop: '4px',
//                         background: 'white',
//                         borderRadius: '10px',
//                         boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
//                         maxHeight: '160px',
//                         overflowY: 'auto',
//                         zIndex: 1060,
//                         minWidth: '90px',
//                         color: '#333'
//                       }}
//                     >
//                       {getMonthOptions().map((month) => (
//                         <div
//                           key={month.value}
//                           onClick={() => handleMonthSelect(month.value)}
//                           style={{
//                             padding: '6px 14px',
//                             cursor: 'pointer',
//                             fontSize: '13px',
//                             textAlign: 'center',
//                             background: month.value === currentMonth ? '#e3f0ff' : 'transparent',
//                             color: month.value === currentMonth ? '#1e3c72' : '#333',
//                             fontWeight: month.value === currentMonth ? 'bold' : 'normal',
//                             transition: 'all 0.2s ease'
//                           }}
//                           onMouseEnter={(e) => {
//                             if (month.value !== currentMonth) {
//                               e.currentTarget.style.background = '#f5f7fa';
//                             }
//                           }}
//                           onMouseLeave={(e) => {
//                             if (month.value !== currentMonth) {
//                               e.currentTarget.style.background = 'transparent';
//                             }
//                           }}
//                         >
//                           {month.label}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 <div style={{ position: 'relative' }} ref={dayDropdownRef}>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowDayDropdown(!showDayDropdown);
//                       setShowYearDropdown(false);
//                       setShowMonthDropdown(false);
//                     }}
//                     style={{
//                       background: 'rgba(255,255,255,0.15)',
//                       border: '1px solid rgba(255,255,255,0.2)',
//                       borderRadius: '8px',
//                       padding: '4px 10px',
//                       cursor: 'pointer',
//                       color: 'white',
//                       fontSize: '13px',
//                       fontWeight: 'bold',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '4px',
//                       minWidth: '50px',
//                       justifyContent: 'center',
//                       transition: 'all 0.3s ease'
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                     }}
//                   >
//                     {currentDay}
//                     {showDayDropdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
//                   </button>
                  
//                   {showDayDropdown && (
//                     <div
//                       style={{
//                         position: 'absolute',
//                         top: '100%',
//                         left: '50%',
//                         transform: 'translateX(-50%)',
//                         marginTop: '4px',
//                         background: 'white',
//                         borderRadius: '10px',
//                         boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
//                         maxHeight: '160px',
//                         overflowY: 'auto',
//                         zIndex: 1060,
//                         minWidth: '50px',
//                         color: '#333'
//                       }}
//                     >
//                       {getDayOptions().map((day) => (
//                         <div
//                           key={day}
//                           onClick={() => handleDaySelect(day)}
//                           style={{
//                             padding: '6px 14px',
//                             cursor: 'pointer',
//                             fontSize: '13px',
//                             textAlign: 'center',
//                             background: day === currentDay ? '#e3f0ff' : 'transparent',
//                             color: day === currentDay ? '#1e3c72' : '#333',
//                             fontWeight: day === currentDay ? 'bold' : 'normal',
//                             transition: 'all 0.2s ease'
//                           }}
//                           onMouseEnter={(e) => {
//                             if (day !== currentDay) {
//                               e.currentTarget.style.background = '#f5f7fa';
//                             }
//                           }}
//                           onMouseLeave={(e) => {
//                             if (day !== currentDay) {
//                               e.currentTarget.style.background = 'transparent';
//                             }
//                           }}
//                         >
//                           {day}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => changeMonth(1)}
//                   style={{
//                     background: 'rgba(255,255,255,0.15)',
//                     border: '1px solid rgba(255,255,255,0.2)',
//                     borderRadius: '8px',
//                     width: '30px',
//                     height: '30px',
//                     cursor: 'pointer',
//                     color: 'white',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     transition: 'all 0.3s ease',
//                     fontSize: '18px',
//                     fontWeight: 'bold'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                     e.currentTarget.style.transform = 'scale(1.05)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                     e.currentTarget.style.transform = 'scale(1)';
//                   }}
//                 >
//                   ›
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => changeYear(1)}
//                   style={{
//                     background: 'rgba(255,255,255,0.15)',
//                     border: '1px solid rgba(255,255,255,0.2)',
//                     borderRadius: '8px',
//                     width: '30px',
//                     height: '30px',
//                     cursor: 'pointer',
//                     color: 'white',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     transition: 'all 0.3s ease',
//                     fontSize: '18px',
//                     fontWeight: 'bold'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                     e.currentTarget.style.transform = 'scale(1.05)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                     e.currentTarget.style.transform = 'scale(1)';
//                   }}
//                 >
//                   »
//                 </button>
//               </div>
//             </div>
            
//             <div style={{ 
//               display: 'grid', 
//               gridTemplateColumns: 'repeat(7, 1fr)',
//               padding: '10px',
//               borderBottom: '1px solid #eef2f6'
//             }}>
//               {weekDays.map((day, idx) => (
//                 <div key={idx} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>
//                   {day}
//                 </div>
//               ))}
//             </div>
            
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '10px', gap: '2px' }}>
//               {getDays().map((day, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => day && handleDateSelect(day)}
//                   disabled={!day}
//                   style={{
//                     textAlign: 'center',
//                     padding: '8px 0',
//                     borderRadius: '8px',
//                     border: 'none',
//                     background: isSelected(day)
//                       ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
//                       : isToday(day)
//                       ? '#e8f0fe'
//                       : 'transparent',
//                     color: isSelected(day) ? 'white' : isToday(day) ? '#1e3c72' : '#333',
//                     fontWeight: isSelected(day) || isToday(day) ? 'bold' : 'normal',
//                     cursor: day ? 'pointer' : 'default',
//                     opacity: day ? 1 : 0.3,
//                     fontSize: '13px',
//                     transition: 'all 0.2s ease'
//                   }}
//                   onMouseEnter={(e) => {
//                     if (day && !isSelected(day) && !isToday(day)) {
//                       e.currentTarget.style.background = '#f5f7fa';
//                     }
//                   }}
//                   onMouseLeave={(e) => {
//                     if (day && !isSelected(day) && !isToday(day)) {
//                       e.currentTarget.style.background = 'transparent';
//                     }
//                   }}
//                 >
//                   {day || ''}
//                 </button>
//               ))}
//             </div>
            
//             <div style={{ 
//               padding: '8px', 
//               borderTop: '1px solid #eef2f6',
//               textAlign: 'center',
//               background: '#fafbfc'
//             }}>
//               <button
//                 type="button"
//                 onClick={goToToday}
//                 style={{
//                   background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
//                   border: 'none',
//                   borderRadius: '20px',
//                   padding: '6px 24px',
//                   color: 'white',
//                   fontSize: '13px',
//                   cursor: 'pointer',
//                   transition: 'all 0.3s ease',
//                   boxShadow: '0 2px 10px rgba(30, 60, 114, 0.3)'
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = 'scale(1.05)';
//                   e.currentTarget.style.boxShadow = '0 4px 20px rgba(30, 60, 114, 0.4)';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = 'scale(1)';
//                   e.currentTarget.style.boxShadow = '0 2px 10px rgba(30, 60, 114, 0.3)';
//                 }}
//               >
//                 امروز
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default JalaliDatePicker;

// // src/components/JalaliDatePicker.tsx
// import React, { useState, useRef, useEffect } from 'react';
// import { Calendar, X, ChevronDown, ChevronUp } from 'lucide-react';
// import moment from 'moment-jalaali';

// interface JalaliDatePickerProps {
//   value?: string | null;
//   onChange: (date: string | null) => void;
//   placeholder?: string;
//   required?: boolean;
//   label?: string;
//   error?: string;
//   disabled?: boolean;
//   className?: string;
// }

// moment.loadPersian({ dialect: 'persian-modern' });

// const LEAP_YEARS = [
//   1210, 1214, 1218, 1222, 1226, 1230, 1234, 1238, 1243,
//   1247, 1251, 1255, 1259, 1263, 1267, 1271, 1276,
//   1280, 1284, 1288, 1292, 1296, 1300, 1304, 1309,
//   1313, 1317, 1321, 1325, 1329, 1333, 1337, 1342,
//   1346, 1350, 1354, 1358, 1362, 1366, 1370, 1375,
//   1379, 1383, 1387, 1391, 1395, 1399, 1403, 1408,
//   1412, 1416, 1420, 1424, 1428, 1432, 1436, 1441,
//   1445, 1449, 1453, 1457, 1461, 1465, 1469, 1474,
//   1478, 1482, 1486, 1490, 1494, 1498
// ];

// const getJalaliMonthDays = (year: number, month: number): number => {
//   const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
//   if (month === 12) {
//     return LEAP_YEARS.includes(year) ? 30 : 29;
//   }
//   return daysInMonth[month - 1];
// };

// const getFirstDayOfMonth = (year: number, month: number): number => {
//   const date = moment(`${year}/${month}/01`, 'jYYYY/jMM/jDD');
//   let day = date.day();
//   day = (day + 1) % 7;
//   return day;
// };

// const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
//   value,
//   onChange,
//   placeholder = '1402/12/25',
//   required = false,
//   label,
//   error,
//   disabled = false,
//   className = '',
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [currentYear, setCurrentYear] = useState(moment().jYear());
//   const [currentMonth, setCurrentMonth] = useState(moment().jMonth() + 1);
//   const [currentDay, setCurrentDay] = useState(moment().jDate());
//   const [inputValue, setInputValue] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [showYearDropdown, setShowYearDropdown] = useState(false);
//   const [showMonthDropdown, setShowMonthDropdown] = useState(false);
//   const [showDayDropdown, setShowDayDropdown] = useState(false);
//   const pickerRef = useRef<HTMLDivElement>(null);
//   const yearDropdownRef = useRef<HTMLDivElement>(null);
//   const monthDropdownRef = useRef<HTMLDivElement>(null);
//   const dayDropdownRef = useRef<HTMLDivElement>(null);

//   const monthNames = [
//     'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
//     'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
//   ];

//   const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

//   const formatJalaliDate = (year: number, month: number, day: number): string => {
//     return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
//   };

//   const parseJalaliDate = (dateStr: string): { year: number; month: number; day: number } | null => {
//     if (!dateStr) return null;
//     const cleanStr = dateStr.replace(/[^0-9/]/g, '');
//     const parts = cleanStr.split('/');
//     if (parts.length !== 3) return null;
    
//     const year = parseInt(parts[0]);
//     const month = parseInt(parts[1]);
//     const day = parseInt(parts[2]);
    
//     if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
//     if (year < 1300 || year > 1500) return null;
//     if (month < 1 || month > 12) return null;
//     if (day < 1 || day > 31) return null;
    
//     const m = moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD');
//     if (!m.isValid()) return null;
    
//     return { year, month, day };
//   };

//   const toJalaliFormat = (dateStr: string | null | undefined): string | null => {
//     if (!dateStr) return null;
//     const parsed = parseJalaliDate(dateStr);
//     if (parsed) {
//       return formatJalaliDate(parsed.year, parsed.month, parsed.day);
//     }
//     if (dateStr.includes('-')) {
//       try {
//         const parts = dateStr.split('-');
//         if (parts.length === 3) {
//           const year = parseInt(parts[0]);
//           const month = parseInt(parts[1]);
//           const day = parseInt(parts[2]);
//           if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
//             const m = moment(`${year}/${month}/${day}`, 'YYYY/MM/DD');
//             if (m.isValid()) {
//               return formatJalaliDate(m.jYear(), m.jMonth() + 1, m.jDate());
//             }
//           }
//         }
//       } catch (e) {
//         console.warn('Error parsing date:', dateStr, e);
//       }
//     }
//     return null;
//   };

//   useEffect(() => {
//     if (!value || value === '' || value === 'null' || value === 'undefined') {
//       if (!isTyping) {
//         setInputValue('');
//       }
//       return;
//     }
//     if (value && !isTyping) {
//       const formatted = toJalaliFormat(value);
//       if (formatted) {
//         const parsed = parseJalaliDate(formatted);
//         if (parsed) {
//           setInputValue(formatted);
//           setCurrentYear(parsed.year);
//           setCurrentMonth(parsed.month);
//           setCurrentDay(parsed.day);
//           return;
//         }
//       }
//       setInputValue('');
//     } else if (!value && !isTyping) {
//       setInputValue('');
//     }
//   }, [value, isTyping]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//         setShowYearDropdown(false);
//         setShowMonthDropdown(false);
//         setShowDayDropdown(false);
//       }
//       if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
//         setShowYearDropdown(false);
//       }
//       if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
//         setShowMonthDropdown(false);
//       }
//       if (dayDropdownRef.current && !dayDropdownRef.current.contains(event.target as Node)) {
//         setShowDayDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const getDays = () => {
//     const daysInMonth = getJalaliMonthDays(currentYear, currentMonth);
//     const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
//     const days = [];
    
//     for (let i = 0; i < firstDay; i++) {
//       days.push(null);
//     }
//     for (let i = 1; i <= daysInMonth; i++) {
//       days.push(i);
//     }
//     return days;
//   };

//   // ✅ انتخاب تاریخ از تقویم - مستقیماً شمسی ارسال کن
//   const handleDateSelect = (day: number) => {
//     const jalaliStr = formatJalaliDate(currentYear, currentMonth, day);
//     console.log('📤 Date selected:', jalaliStr);
//     onChange(jalaliStr);
//     setInputValue(jalaliStr);
//     setCurrentDay(day);
//     setIsOpen(false);
//     setIsTyping(false);
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let val = e.target.value;
//     setIsTyping(true);
    
//     val = val.replace(/[^0-9/]/g, '');
//     if (val.length > 10) {
//       val = val.slice(0, 10);
//     }
    
//     const numbers = val.replace(/\//g, '');
//     if (numbers.length >= 5 && !val.includes('/')) {
//       val = `${numbers.slice(0, 4)}/${numbers.slice(4)}`;
//     } else if (numbers.length >= 7 && val.split('/').length === 2) {
//       const parts = val.split('/');
//       if (parts[1].length >= 2) {
//         val = `${parts[0]}/${parts[1].slice(0, 2)}/${numbers.slice(6)}`;
//       }
//     }
    
//     setInputValue(val);
    
    
//     if (val.length === 10) {
//       const parsed = parseJalaliDate(val);
//       if (parsed) {
//         const formatted = formatJalaliDate(parsed.year, parsed.month, parsed.day);
//         setInputValue(formatted);
//         setCurrentYear(parsed.year);
//         setCurrentMonth(parsed.month);
//         setCurrentDay(parsed.day);
//       }
//     }
//   };

//   const handleInputBlur = () => {
//     setIsTyping(false);
    
//     if (!inputValue) {
//       onChange(null);
//       return;
//     }
    
//     const parsed = parseJalaliDate(inputValue);
//     if (parsed) {
//       const formatted = formatJalaliDate(parsed.year, parsed.month, parsed.day);
//       console.log('📤 Formatted on blur:', formatted);
//       onChange(formatted);
//       setInputValue(formatted);
//       setCurrentYear(parsed.year);
//       setCurrentMonth(parsed.month);
//       setCurrentDay(parsed.day);
//       return;
//     }
    
//     if (value) {
//       const formatted = toJalaliFormat(value);
//       if (formatted) {
//         setInputValue(formatted);
//       } else {
//         setInputValue('');
//         onChange(null);
//       }
//     } else {
//       setInputValue('');
//       onChange(null);
//     }
//   };

//   const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       handleInputBlur();
//       setIsOpen(false);
//     }
//   };

//   const handleCalendarClick = () => {
//     if (!disabled) {
//       setIsOpen(true);
//     }
//   };

//   const changeMonth = (delta: number) => {
//     let newMonth = currentMonth + delta;
//     let newYear = currentYear;
    
//     if (newMonth < 1) {
//       newMonth = 12;
//       newYear--;
//     } else if (newMonth > 12) {
//       newMonth = 1;
//       newYear++;
//     }
//     setCurrentMonth(newMonth);
//     setCurrentYear(newYear);
//   };

//   const changeYear = (delta: number) => {
//     setCurrentYear(prev => prev + delta);
//   };

//   const clearDate = () => {
//     onChange(null);
//     setInputValue('');
//     setIsOpen(false);
//     setIsTyping(false);
//   };

//   const isToday = (day: number) => {
//     const today = moment();
//     const todayYear = today.jYear();
//     const todayMonth = today.jMonth() + 1;
//     const todayDay = today.jDate();
    
//     return todayYear === currentYear && todayMonth === currentMonth && todayDay === day;
//   };

//   // ✅ اصلاح کلیدی: هم inputValue و هم value رو چک کن
//   const isSelected = (day: number) => {
//   // فقط inputValue رو بررسی کن (تاریخ در حال نمایش)
//   if (inputValue && inputValue.length === 10) {
//     const parsed = parseJalaliDate(inputValue);
//     if (parsed && parsed.year === currentYear && parsed.month === currentMonth && parsed.day === day) {
//       return true;
//     }
//   }
  
//   return false;
// };
//   // const isSelected = (day: number) => {
//   //   // اول inputValue رو چک کن (تاریخ در حال تایپ)
//   //   if (inputValue && inputValue.length === 10) {
//   //     const parsed = parseJalaliDate(inputValue);
//   //     if (parsed && parsed.year === currentYear && parsed.month === currentMonth && parsed.day === day) {
//   //       return true;
//   //     }
//   //   }
    
//   //   // بعد value رو چک کن (تاریخ ذخیره شده)
//   //   if (value) {
//   //     const formatted = toJalaliFormat(value);
//   //     if (formatted) {
//   //       const parsed = parseJalaliDate(formatted);
//   //       if (parsed && parsed.year === currentYear && parsed.month === currentMonth && parsed.day === day) {
//   //         return true;
//   //       }
//   //     }
//   //   }
    
//   //   return false;
//   // };

//   const goToToday = () => {
//     const today = moment();
//     const year = today.jYear();
//     const month = today.jMonth() + 1;
//     const day = today.jDate();
//     const jalaliStr = formatJalaliDate(year, month, day);
    
//     console.log('📤 Today date:', jalaliStr);
//     onChange(jalaliStr);
//     setInputValue(jalaliStr);
//     setCurrentYear(year);
//     setCurrentMonth(month);
//     setCurrentDay(day);
//     setIsOpen(false);
//     setIsTyping(false);
//   };

//   const handleYearSelect = (year: number) => {
//     setCurrentYear(year);
//     setShowYearDropdown(false);
//   };

//   const handleMonthSelect = (month: number) => {
//     setCurrentMonth(month);
//     setShowMonthDropdown(false);
//   };

//   const handleDaySelect = (day: number) => {
//     const jalaliStr = formatJalaliDate(currentYear, currentMonth, day);
//     console.log('📤 Day selected:', jalaliStr);
//     onChange(jalaliStr);
//     setInputValue(jalaliStr);
//     setCurrentDay(day);
//     setShowDayDropdown(false);
//     setIsOpen(false);
//   };

//   const getYearOptions = () => {
//     const years = [];
//     for (let i = 1300; i <= 1500; i++) {
//       years.push(i);
//     }
//     return years;
//   };

//   const getMonthOptions = () => {
//     return monthNames.map((name, index) => ({
//       value: index + 1,
//       label: name
//     }));
//   };

//   const getDayOptions = () => {
//     const daysInMonth = getJalaliMonthDays(currentYear, currentMonth);
//     const days = [];
//     for (let i = 1; i <= daysInMonth; i++) {
//       days.push(i);
//     }
//     return days;
//   };

//   const displayValue = inputValue;

//   return (
//     <div className={`position-relative ${className}`} ref={pickerRef} style={{ direction: 'rtl' }}>
//       {label && (
//         <label className="form-label fw-semibold mb-1" style={{ fontSize: '14px' }}>
//           {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
//         </label>
//       )}
      
//       <div className="position-relative">
//         <input
//           type="text"
//           className={`form-control ${error ? 'is-invalid' : ''}`}
//           placeholder={placeholder}
//           value={displayValue}
//           onChange={handleInputChange}
//           onBlur={handleInputBlur}
//           onKeyDown={handleInputKeyDown}
//           onFocus={() => !disabled && handleCalendarClick()}
//           disabled={disabled}
//           required={required}
//           style={{ 
//             paddingLeft: '60px', 
//             direction: 'ltr',
//             borderRadius: '10px',
//             border: error ? '1px solid #dc3545' : '1px solid #e0e0e0',
//             padding: '10px 12px',
//             width: '100%',
//             fontFamily: 'monospace'
//           }}
//         />
//         <div
//           className="position-absolute d-flex align-items-center gap-2"
//           style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
//         >
//           {inputValue && (
//             <button
//               type="button"
//               onClick={clearDate}
//               style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', opacity: 0.6 }}
//             >
//               <X size={16} color="#999" />
//             </button>
//           )}
//           <button
//             type="button"
//             onClick={handleCalendarClick}
//             style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
//             disabled={disabled}
//           >
//             <Calendar size={18} color="#aaa" />
//           </button>
//         </div>
//       </div>
      
//       {error && <div className="text-danger small mt-1">{error}</div>}
//       {isTyping && inputValue && inputValue.length < 10 && (
//         <div className="text-muted small mt-1">
//           مثال: 1402/12/25
//         </div>
//       )}

//       {isOpen && !disabled && (
//         <>
//           <div 
//             style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1040 }}
//             onClick={() => {
//               setIsOpen(false);
//               setShowYearDropdown(false);
//               setShowMonthDropdown(false);
//               setShowDayDropdown(false);
//             }}
//           />
//           <div 
//             className="position-absolute bg-white rounded-3 shadow-lg mt-2"
//             style={{ 
//               zIndex: 1050, 
//               width: '340px',
//               top: '100%',
//               left: 0,
//               boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
//               border: '1px solid #eef2f6',
//               overflow: 'hidden'
//             }}
//           >
//             <div style={{ 
//               background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
//               padding: '12px',
//               color: 'white'
//             }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
//                 <button
//                   type="button"
//                   onClick={() => changeYear(-1)}
//                   style={{
//                     background: 'rgba(255,255,255,0.15)',
//                     border: '1px solid rgba(255,255,255,0.2)',
//                     borderRadius: '8px',
//                     width: '30px',
//                     height: '30px',
//                     cursor: 'pointer',
//                     color: 'white',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     transition: 'all 0.3s ease',
//                     fontSize: '18px',
//                     fontWeight: 'bold'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                     e.currentTarget.style.transform = 'scale(1.05)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                     e.currentTarget.style.transform = 'scale(1)';
//                   }}
//                 >
//                   «
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => changeMonth(-1)}
//                   style={{
//                     background: 'rgba(255,255,255,0.15)',
//                     border: '1px solid rgba(255,255,255,0.2)',
//                     borderRadius: '8px',
//                     width: '30px',
//                     height: '30px',
//                     cursor: 'pointer',
//                     color: 'white',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     transition: 'all 0.3s ease',
//                     fontSize: '18px',
//                     fontWeight: 'bold'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                     e.currentTarget.style.transform = 'scale(1.05)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                     e.currentTarget.style.transform = 'scale(1)';
//                   }}
//                 >
//                   ‹
//                 </button>

//                 <div style={{ position: 'relative' }} ref={yearDropdownRef}>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowYearDropdown(!showYearDropdown);
//                       setShowMonthDropdown(false);
//                       setShowDayDropdown(false);
//                     }}
//                     style={{
//                       background: 'rgba(255,255,255,0.15)',
//                       border: '1px solid rgba(255,255,255,0.2)',
//                       borderRadius: '8px',
//                       padding: '4px 10px',
//                       cursor: 'pointer',
//                       color: 'white',
//                       fontSize: '13px',
//                       fontWeight: 'bold',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '4px',
//                       minWidth: '60px',
//                       justifyContent: 'center',
//                       transition: 'all 0.3s ease'
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                     }}
//                   >
//                     {currentYear}
//                     {showYearDropdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
//                   </button>
                  
//                   {showYearDropdown && (
//                     <div
//                       style={{
//                         position: 'absolute',
//                         top: '100%',
//                         left: '50%',
//                         transform: 'translateX(-50%)',
//                         marginTop: '4px',
//                         background: 'white',
//                         borderRadius: '10px',
//                         boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
//                         maxHeight: '160px',
//                         overflowY: 'auto',
//                         zIndex: 1060,
//                         minWidth: '70px',
//                         color: '#333'
//                       }}
//                     >
//                       {getYearOptions().map((year) => (
//                         <div
//                           key={year}
//                           onClick={() => handleYearSelect(year)}
//                           style={{
//                             padding: '6px 14px',
//                             cursor: 'pointer',
//                             fontSize: '13px',
//                             textAlign: 'center',
//                             background: year === currentYear ? '#e3f0ff' : 'transparent',
//                             color: year === currentYear ? '#1e3c72' : '#333',
//                             fontWeight: year === currentYear ? 'bold' : 'normal',
//                             transition: 'all 0.2s ease'
//                           }}
//                           onMouseEnter={(e) => {
//                             if (year !== currentYear) {
//                               e.currentTarget.style.background = '#f5f7fa';
//                             }
//                           }}
//                           onMouseLeave={(e) => {
//                             if (year !== currentYear) {
//                               e.currentTarget.style.background = 'transparent';
//                             }
//                           }}
//                         >
//                           {year}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 <div style={{ position: 'relative' }} ref={monthDropdownRef}>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowMonthDropdown(!showMonthDropdown);
//                       setShowYearDropdown(false);
//                       setShowDayDropdown(false);
//                     }}
//                     style={{
//                       background: 'rgba(255,255,255,0.15)',
//                       border: '1px solid rgba(255,255,255,0.2)',
//                       borderRadius: '8px',
//                       padding: '4px 10px',
//                       cursor: 'pointer',
//                       color: 'white',
//                       fontSize: '13px',
//                       fontWeight: 'bold',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '4px',
//                       minWidth: '70px',
//                       justifyContent: 'center',
//                       transition: 'all 0.3s ease'
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                     }}
//                   >
//                     {monthNames[currentMonth - 1]}
//                     {showMonthDropdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
//                   </button>
                  
//                   {showMonthDropdown && (
//                     <div
//                       style={{
//                         position: 'absolute',
//                         top: '100%',
//                         left: '50%',
//                         transform: 'translateX(-50%)',
//                         marginTop: '4px',
//                         background: 'white',
//                         borderRadius: '10px',
//                         boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
//                         maxHeight: '160px',
//                         overflowY: 'auto',
//                         zIndex: 1060,
//                         minWidth: '90px',
//                         color: '#333'
//                       }}
//                     >
//                       {getMonthOptions().map((month) => (
//                         <div
//                           key={month.value}
//                           onClick={() => handleMonthSelect(month.value)}
//                           style={{
//                             padding: '6px 14px',
//                             cursor: 'pointer',
//                             fontSize: '13px',
//                             textAlign: 'center',
//                             background: month.value === currentMonth ? '#e3f0ff' : 'transparent',
//                             color: month.value === currentMonth ? '#1e3c72' : '#333',
//                             fontWeight: month.value === currentMonth ? 'bold' : 'normal',
//                             transition: 'all 0.2s ease'
//                           }}
//                           onMouseEnter={(e) => {
//                             if (month.value !== currentMonth) {
//                               e.currentTarget.style.background = '#f5f7fa';
//                             }
//                           }}
//                           onMouseLeave={(e) => {
//                             if (month.value !== currentMonth) {
//                               e.currentTarget.style.background = 'transparent';
//                             }
//                           }}
//                         >
//                           {month.label}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 <div style={{ position: 'relative' }} ref={dayDropdownRef}>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowDayDropdown(!showDayDropdown);
//                       setShowYearDropdown(false);
//                       setShowMonthDropdown(false);
//                     }}
//                     style={{
//                       background: 'rgba(255,255,255,0.15)',
//                       border: '1px solid rgba(255,255,255,0.2)',
//                       borderRadius: '8px',
//                       padding: '4px 10px',
//                       cursor: 'pointer',
//                       color: 'white',
//                       fontSize: '13px',
//                       fontWeight: 'bold',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '4px',
//                       minWidth: '50px',
//                       justifyContent: 'center',
//                       transition: 'all 0.3s ease'
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                     }}
//                   >
//                     {currentDay}
//                     {showDayDropdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
//                   </button>
                  
//                   {showDayDropdown && (
//                     <div
//                       style={{
//                         position: 'absolute',
//                         top: '100%',
//                         left: '50%',
//                         transform: 'translateX(-50%)',
//                         marginTop: '4px',
//                         background: 'white',
//                         borderRadius: '10px',
//                         boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
//                         maxHeight: '160px',
//                         overflowY: 'auto',
//                         zIndex: 1060,
//                         minWidth: '50px',
//                         color: '#333'
//                       }}
//                     >
//                       {getDayOptions().map((day) => (
//                         <div
//                           key={day}
//                           onClick={() => handleDaySelect(day)}
//                           style={{
//                             padding: '6px 14px',
//                             cursor: 'pointer',
//                             fontSize: '13px',
//                             textAlign: 'center',
//                             background: day === currentDay ? '#e3f0ff' : 'transparent',
//                             color: day === currentDay ? '#1e3c72' : '#333',
//                             fontWeight: day === currentDay ? 'bold' : 'normal',
//                             transition: 'all 0.2s ease'
//                           }}
//                           onMouseEnter={(e) => {
//                             if (day !== currentDay) {
//                               e.currentTarget.style.background = '#f5f7fa';
//                             }
//                           }}
//                           onMouseLeave={(e) => {
//                             if (day !== currentDay) {
//                               e.currentTarget.style.background = 'transparent';
//                             }
//                           }}
//                         >
//                           {day}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => changeMonth(1)}
//                   style={{
//                     background: 'rgba(255,255,255,0.15)',
//                     border: '1px solid rgba(255,255,255,0.2)',
//                     borderRadius: '8px',
//                     width: '30px',
//                     height: '30px',
//                     cursor: 'pointer',
//                     color: 'white',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     transition: 'all 0.3s ease',
//                     fontSize: '18px',
//                     fontWeight: 'bold'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                     e.currentTarget.style.transform = 'scale(1.05)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                     e.currentTarget.style.transform = 'scale(1)';
//                   }}
//                 >
//                   ›
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => changeYear(1)}
//                   style={{
//                     background: 'rgba(255,255,255,0.15)',
//                     border: '1px solid rgba(255,255,255,0.2)',
//                     borderRadius: '8px',
//                     width: '30px',
//                     height: '30px',
//                     cursor: 'pointer',
//                     color: 'white',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     transition: 'all 0.3s ease',
//                     fontSize: '18px',
//                     fontWeight: 'bold'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
//                     e.currentTarget.style.transform = 'scale(1.05)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
//                     e.currentTarget.style.transform = 'scale(1)';
//                   }}
//                 >
//                   »
//                 </button>
//               </div>
//             </div>
            
//             <div style={{ 
//               display: 'grid', 
//               gridTemplateColumns: 'repeat(7, 1fr)',
//               padding: '10px',
//               borderBottom: '1px solid #eef2f6'
//             }}>
//               {weekDays.map((day, idx) => (
//                 <div key={idx} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>
//                   {day}
//                 </div>
//               ))}
//             </div>
            
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '10px', gap: '2px' }}>
//               {getDays().map((day, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => day && handleDateSelect(day)}
//                   disabled={!day}
//                   style={{
//                     textAlign: 'center',
//                     padding: '8px 0',
//                     borderRadius: '8px',
//                     border: 'none',
//                     background: isSelected(day)
//                       ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
//                       : isToday(day)
//                       ? '#e8f0fe'
//                       : 'transparent',
//                     color: isSelected(day) ? 'white' : isToday(day) ? '#1e3c72' : '#333',
//                     fontWeight: isSelected(day) || isToday(day) ? 'bold' : 'normal',
//                     cursor: day ? 'pointer' : 'default',
//                     opacity: day ? 1 : 0.3,
//                     fontSize: '13px',
//                     transition: 'all 0.2s ease'
//                   }}
//                   onMouseEnter={(e) => {
//                     if (day && !isSelected(day) && !isToday(day)) {
//                       e.currentTarget.style.background = '#f5f7fa';
//                     }
//                   }}
//                   onMouseLeave={(e) => {
//                     if (day && !isSelected(day) && !isToday(day)) {
//                       e.currentTarget.style.background = 'transparent';
//                     }
//                   }}
//                 >
//                   {day || ''}
//                 </button>
//               ))}
//             </div>
            
//             <div style={{ 
//               padding: '8px', 
//               borderTop: '1px solid #eef2f6',
//               textAlign: 'center',
//               background: '#fafbfc'
//             }}>
//               <button
//                 type="button"
//                 onClick={goToToday}
//                 style={{
//                   background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
//                   border: 'none',
//                   borderRadius: '20px',
//                   padding: '6px 24px',
//                   color: 'white',
//                   fontSize: '13px',
//                   cursor: 'pointer',
//                   transition: 'all 0.3s ease',
//                   boxShadow: '0 2px 10px rgba(30, 60, 114, 0.3)'
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = 'scale(1.05)';
//                   e.currentTarget.style.boxShadow = '0 4px 20px rgba(30, 60, 114, 0.4)';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = 'scale(1)';
//                   e.currentTarget.style.boxShadow = '0 2px 10px rgba(30, 60, 114, 0.3)';
//                 }}
//               >
//                 امروز
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default JalaliDatePicker;

// // // src/components/JalaliDatePicker.tsx
// // import React, { useState, useRef, useEffect } from 'react';
// // import { Calendar, X, ChevronDown, ChevronUp } from 'lucide-react';
// // import moment from 'moment-jalaali';

// // interface JalaliDatePickerProps {
// //   value?: string | null;
// //   onChange: (date: string | null) => void;
// //   placeholder?: string;
// //   required?: boolean;
// //   label?: string;
// //   error?: string;
// //   disabled?: boolean;
// //   className?: string;
// // }

// // moment.loadPersian({ dialect: 'persian-modern' });

// // const LEAP_YEARS = [
// //   1210, 1214, 1218, 1222, 1226, 1230, 1234, 1238, 1243,
// //   1247, 1251, 1255, 1259, 1263, 1267, 1271, 1276,
// //   1280, 1284, 1288, 1292, 1296, 1300, 1304, 1309,
// //   1313, 1317, 1321, 1325, 1329, 1333, 1337, 1342,
// //   1346, 1350, 1354, 1358, 1362, 1366, 1370, 1375,
// //   1379, 1383, 1387, 1391, 1395, 1399, 1403, 1408,
// //   1412, 1416, 1420, 1424, 1428, 1432, 1436, 1441,
// //   1445, 1449, 1453, 1457, 1461, 1465, 1469, 1474,
// //   1478, 1482, 1486, 1490, 1494, 1498
// // ];

// // const getJalaliMonthDays = (year: number, month: number): number => {
// //   const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
// //   if (month === 12) {
// //     return LEAP_YEARS.includes(year) ? 30 : 29;
// //   }
// //   return daysInMonth[month - 1];
// // };

// // const getFirstDayOfMonth = (year: number, month: number): number => {
// //   const date = moment(`${year}/${month}/01`, 'jYYYY/jMM/jDD');
// //   let day = date.day();
// //   day = (day + 1) % 7;
// //   return day;
// // };

// // const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
// //   value,
// //   onChange,
// //   placeholder = '1402/12/25',
// //   required = false,
// //   label,
// //   error,
// //   disabled = false,
// //   className = '',
// // }) => {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const [currentYear, setCurrentYear] = useState(moment().jYear());
// //   const [currentMonth, setCurrentMonth] = useState(moment().jMonth() + 1);
// //   const [currentDay, setCurrentDay] = useState(moment().jDate());
// //   const [inputValue, setInputValue] = useState('');
// //   const [isTyping, setIsTyping] = useState(false);
// //   const [showYearDropdown, setShowYearDropdown] = useState(false);
// //   const [showMonthDropdown, setShowMonthDropdown] = useState(false);
// //   const [showDayDropdown, setShowDayDropdown] = useState(false);
// //   const pickerRef = useRef<HTMLDivElement>(null);
// //   const yearDropdownRef = useRef<HTMLDivElement>(null);
// //   const monthDropdownRef = useRef<HTMLDivElement>(null);
// //   const dayDropdownRef = useRef<HTMLDivElement>(null);

// //   const monthNames = [
// //     'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
// //     'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
// //   ];

// //   const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

// //   // ✅ تابع برای فرمت‌دهی تاریخ با صفر جلو
// // const formatJalaliDate = (year: number, month: number, day: number): string => {
// //   return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
// // };

// //   // // ✅ تابع اصلی برای فرمت‌دهی تاریخ با صفر جلو
// //   // const formatJalaliDate = (year: number, month: number, day: number): string => {
// //   //   return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
// //   // };

// //   // ✅ استخراج تاریخ از رشته
// //   const parseJalaliDate = (dateStr: string): { year: number; month: number; day: number } | null => {
// //     if (!dateStr) return null;
    
// //     // حذف کاراکترهای غیرمجاز
// //     const cleanStr = dateStr.replace(/[^0-9/]/g, '');
// //     const parts = cleanStr.split('/');
// //     if (parts.length !== 3) return null;
    
// //     const year = parseInt(parts[0]);
// //     const month = parseInt(parts[1]);
// //     const day = parseInt(parts[2]);
    
// //     if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
// //     if (year < 1300 || year > 1500) return null;
// //     if (month < 1 || month > 12) return null;
// //     if (day < 1 || day > 31) return null;
    
// //     // بررسی اعتبار با moment
// //     const m = moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD');
// //     if (!m.isValid()) return null;
    
// //     return { year, month, day };
// //   };

// //   // ✅ تبدیل هر نوع تاریخ به فرمت شمسی استاندارد
// //   const toJalaliFormat = (dateStr: string | null | undefined): string | null => {
// //     if (!dateStr) return null;
    
// //     // اگر به فرمت YYYY/MM/DD است
// //     const parsed = parseJalaliDate(dateStr);
// //     if (parsed) {
// //       return formatJalaliDate(parsed.year, parsed.month, parsed.day);
// //     }
    
// //     // اگر به فرمت YYYY-MM-DD است (میلادی)
// //     if (dateStr.includes('-')) {
// //       try {
// //         const parts = dateStr.split('-');
// //         if (parts.length === 3) {
// //           const year = parseInt(parts[0]);
// //           const month = parseInt(parts[1]);
// //           const day = parseInt(parts[2]);
// //           if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
// //             const m = moment(`${year}/${month}/${day}`, 'YYYY/MM/DD');
// //             if (m.isValid()) {
// //               return formatJalaliDate(m.jYear(), m.jMonth() + 1, m.jDate());
// //             }
// //           }
// //         }
// //       } catch (e) {
// //         console.warn('Error parsing date:', dateStr, e);
// //       }
// //     }
    
// //     return null;
// //   };

// //   // ✅ مقداردهی اولیه
// //   useEffect(() => {
// //       // ✅ اگر value null یا undefined یا رشته خالی است، inputValue را خالی کن
// //   if (!value || value === '' || value === 'null' || value === 'undefined') {
// //     if (!isTyping) {
// //       setInputValue('');
// //     }
// //     return;
// //   }
// //     if (value && !isTyping) {
// //       const formatted = toJalaliFormat(value);
// //       if (formatted) {
// //         const parsed = parseJalaliDate(formatted);
// //         if (parsed) {
// //           setInputValue(formatted);
// //           setCurrentYear(parsed.year);
// //           setCurrentMonth(parsed.month);
// //           setCurrentDay(parsed.day);
// //           return;
// //         }
// //       }
// //       setInputValue('');
// //     } else if (!value && !isTyping) {
// //       setInputValue('');
// //     }
// //   }, [value, isTyping]);

// //   useEffect(() => {
// //     const handleClickOutside = (event: MouseEvent) => {
// //       if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
// //         setIsOpen(false);
// //         setShowYearDropdown(false);
// //         setShowMonthDropdown(false);
// //         setShowDayDropdown(false);
// //       }
// //       if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
// //         setShowYearDropdown(false);
// //       }
// //       if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
// //         setShowMonthDropdown(false);
// //       }
// //       if (dayDropdownRef.current && !dayDropdownRef.current.contains(event.target as Node)) {
// //         setShowDayDropdown(false);
// //       }
// //     };
// //     document.addEventListener('mousedown', handleClickOutside);
// //     return () => document.removeEventListener('mousedown', handleClickOutside);
// //   }, []);

// //   const getDays = () => {
// //     const daysInMonth = getJalaliMonthDays(currentYear, currentMonth);
// //     const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
// //     const days = [];
    
// //     for (let i = 0; i < firstDay; i++) {
// //       days.push(null);
// //     }
// //     for (let i = 1; i <= daysInMonth; i++) {
// //       days.push(i);
// //     }
// //     return days;
// //   };

// //   // ✅ انتخاب تاریخ از تقویم
// //   const handleDateSelect = (day: number) => {
// //     const jalaliStr = formatJalaliDate(currentYear, currentMonth, day);
// //     console.log('📤 Date selected:', jalaliStr);
// //     onChange(jalaliStr);
// //     setInputValue(jalaliStr);
// //     setCurrentDay(day);
// //     setIsOpen(false);
// //     setIsTyping(false);
// //   };

// //   // ✅ تغییر در ورودی
// //   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     let val = e.target.value;
// //     setIsTyping(true);
    
// //     // فقط اعداد و / مجاز هستند
// //     val = val.replace(/[^0-9/]/g, '');
// //     if (val.length > 10) {
// //       val = val.slice(0, 10);
// //     }
    
// //     // فرمت‌دهی خودکار هنگام تایپ
// //     const numbers = val.replace(/\//g, '');
// //     if (numbers.length >= 5 && !val.includes('/')) {
// //       val = `${numbers.slice(0, 4)}/${numbers.slice(4)}`;
// //     } else if (numbers.length >= 7 && val.split('/').length === 2) {
// //       const parts = val.split('/');
// //       if (parts[1].length >= 2) {
// //         val = `${parts[0]}/${parts[1].slice(0, 2)}/${numbers.slice(6)}`;
// //       }
// //     }
    
// //     setInputValue(val);
    
// //     // اگر تاریخ کامل شد، اعتبارسنجی و فرمت‌دهی
// //     if (val.length === 10) {
// //       const parsed = parseJalaliDate(val);
// //       if (parsed) {
// //         const formatted = formatJalaliDate(parsed.year, parsed.month, parsed.day);
// //         setInputValue(formatted);
// //         setCurrentYear(parsed.year);
// //         setCurrentMonth(parsed.month);
// //         setCurrentDay(parsed.day);
// //       }
// //     }
// //   };

// //   // ✅ وقتی کاربر از فیلد خارج می‌شود
// //   const handleInputBlur = () => {
// //     setIsTyping(false);
    
// //     if (!inputValue) {
// //       onChange(null);
// //       return;
// //     }
    
// //     // تلاش برای فرمت‌دهی
// //     const parsed = parseJalaliDate(inputValue);
// //     if (parsed) {
// //       const formatted = formatJalaliDate(parsed.year, parsed.month, parsed.day);
// //       console.log('📤 Formatted on blur:', formatted);
// //       onChange(formatted);
// //       setInputValue(formatted);
// //       setCurrentYear(parsed.year);
// //       setCurrentMonth(parsed.month);
// //       setCurrentDay(parsed.day);
// //       return;
// //     }
    
// //     // اگر نامعتبر بود، مقدار قبلی را برگردان
// //     if (value) {
// //       const formatted = toJalaliFormat(value);
// //       if (formatted) {
// //         setInputValue(formatted);
// //       } else {
// //         setInputValue('');
// //         onChange(null);
// //       }
// //     } else {
// //       setInputValue('');
// //       onChange(null);
// //     }
// //   };

// //   const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
// //     if (e.key === 'Enter') {
// //       handleInputBlur();
// //       setIsOpen(false);
// //     }
// //   };

// //   const handleCalendarClick = () => {
// //     if (!disabled) {
// //       setIsOpen(true);
// //     }
// //   };

// //   const changeMonth = (delta: number) => {
// //     let newMonth = currentMonth + delta;
// //     let newYear = currentYear;
    
// //     if (newMonth < 1) {
// //       newMonth = 12;
// //       newYear--;
// //     } else if (newMonth > 12) {
// //       newMonth = 1;
// //       newYear++;
// //     }
// //     setCurrentMonth(newMonth);
// //     setCurrentYear(newYear);
// //   };

// //   const changeYear = (delta: number) => {
// //     setCurrentYear(prev => prev + delta);
// //   };

// //   const clearDate = () => {
// //     onChange(null);
// //     setInputValue('');
// //     setIsOpen(false);
// //     setIsTyping(false);
// //   };

// //   const isToday = (day: number) => {
// //     const today = moment();
// //     const todayYear = today.jYear();
// //     const todayMonth = today.jMonth() + 1;
// //     const todayDay = today.jDate();
    
// //     return todayYear === currentYear && todayMonth === currentMonth && todayDay === day;
// //   };

// //   const isSelected = (day: number) => {
// //     if (!value) return false;
// //     const formatted = toJalaliFormat(value);
// //     if (!formatted) return false;
// //     const parsed = parseJalaliDate(formatted);
// //     if (!parsed) return false;
// //     return parsed.year === currentYear && parsed.month === currentMonth && parsed.day === day;
// //   };

// //   const goToToday = () => {
// //     const today = moment();
// //     const year = today.jYear();
// //     const month = today.jMonth() + 1;
// //     const day = today.jDate();
// //     const jalaliStr = formatJalaliDate(year, month, day);
    
// //     console.log('📤 Today date:', jalaliStr);
// //     onChange(jalaliStr);
// //     setInputValue(jalaliStr);
// //     setCurrentYear(year);
// //     setCurrentMonth(month);
// //     setCurrentDay(day);
// //     setIsOpen(false);
// //     setIsTyping(false);
// //   };

// //   const handleYearSelect = (year: number) => {
// //     setCurrentYear(year);
// //     setShowYearDropdown(false);
// //   };

// //   const handleMonthSelect = (month: number) => {
// //     setCurrentMonth(month);
// //     setShowMonthDropdown(false);
// //   };

// //   const handleDaySelect = (day: number) => {
// //     const jalaliStr = formatJalaliDate(currentYear, currentMonth, day);
// //     console.log('📤 Day selected:', jalaliStr);
// //     onChange(jalaliStr);
// //     setInputValue(jalaliStr);
// //     setCurrentDay(day);
// //     setShowDayDropdown(false);
// //     setIsOpen(false);
// //   };

// //   const getYearOptions = () => {
// //     const years = [];
// //     for (let i = 1300; i <= 1500; i++) {
// //       years.push(i);
// //     }
// //     return years;
// //   };

// //   const getMonthOptions = () => {
// //     return monthNames.map((name, index) => ({
// //       value: index + 1,
// //       label: name
// //     }));
// //   };

// //   const getDayOptions = () => {
// //     const daysInMonth = getJalaliMonthDays(currentYear, currentMonth);
// //     const days = [];
// //     for (let i = 1; i <= daysInMonth; i++) {
// //       days.push(i);
// //     }
// //     return days;
// //   };

// //   const displayValue = inputValue;

// //   return (
// //     <div className={`position-relative ${className}`} ref={pickerRef} style={{ direction: 'rtl' }}>
// //       {label && (
// //         <label className="form-label fw-semibold mb-1" style={{ fontSize: '14px' }}>
// //           {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
// //         </label>
// //       )}
      
// //       <div className="position-relative">
// //         <input
// //           type="text"
// //           className={`form-control ${error ? 'is-invalid' : ''}`}
// //           placeholder={placeholder}
// //           value={displayValue}
// //           onChange={handleInputChange}
// //           onBlur={handleInputBlur}
// //           onKeyDown={handleInputKeyDown}
// //           onFocus={() => !disabled && handleCalendarClick()}
// //           disabled={disabled}
// //           required={required}
// //           style={{ 
// //             paddingLeft: '60px', 
// //             direction: 'ltr',
// //             borderRadius: '10px',
// //             border: error ? '1px solid #dc3545' : '1px solid #e0e0e0',
// //             padding: '10px 12px',
// //             width: '100%',
// //             fontFamily: 'monospace'
// //           }}
// //         />
// //         <div
// //           className="position-absolute d-flex align-items-center gap-2"
// //           style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
// //         >
// //           {inputValue && (
// //             <button
// //               type="button"
// //               onClick={clearDate}
// //               style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', opacity: 0.6 }}
// //             >
// //               <X size={16} color="#999" />
// //             </button>
// //           )}
// //           <button
// //             type="button"
// //             onClick={handleCalendarClick}
// //             style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
// //             disabled={disabled}
// //           >
// //             <Calendar size={18} color="#aaa" />
// //           </button>
// //         </div>
// //       </div>
      
// //       {error && <div className="text-danger small mt-1">{error}</div>}
// //       {isTyping && inputValue && inputValue.length < 10 && (
// //         <div className="text-muted small mt-1">
// //           مثال: 1402/12/25
// //         </div>
// //       )}

// //       {isOpen && !disabled && (
// //         <>
// //           <div 
// //             style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1040 }}
// //             onClick={() => {
// //               setIsOpen(false);
// //               setShowYearDropdown(false);
// //               setShowMonthDropdown(false);
// //               setShowDayDropdown(false);
// //             }}
// //           />
// //           <div 
// //             className="position-absolute bg-white rounded-3 shadow-lg mt-2"
// //             style={{ 
// //               zIndex: 1050, 
// //               width: '340px',
// //               top: '100%',
// //               left: 0,
// //               boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
// //               border: '1px solid #eef2f6',
// //               overflow: 'hidden'
// //             }}
// //           >
// //             <div style={{ 
// //               background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
// //               padding: '12px',
// //               color: 'white'
// //             }}>
// //               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
// //                 <button
// //                   type="button"
// //                   onClick={() => changeYear(-1)}
// //                   style={{
// //                     background: 'rgba(255,255,255,0.15)',
// //                     border: '1px solid rgba(255,255,255,0.2)',
// //                     borderRadius: '8px',
// //                     width: '30px',
// //                     height: '30px',
// //                     cursor: 'pointer',
// //                     color: 'white',
// //                     display: 'flex',
// //                     alignItems: 'center',
// //                     justifyContent: 'center',
// //                     transition: 'all 0.3s ease',
// //                     fontSize: '18px',
// //                     fontWeight: 'bold'
// //                   }}
// //                   onMouseEnter={(e) => {
// //                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
// //                     e.currentTarget.style.transform = 'scale(1.05)';
// //                   }}
// //                   onMouseLeave={(e) => {
// //                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
// //                     e.currentTarget.style.transform = 'scale(1)';
// //                   }}
// //                 >
// //                   «
// //                 </button>

// //                 <button
// //                   type="button"
// //                   onClick={() => changeMonth(-1)}
// //                   style={{
// //                     background: 'rgba(255,255,255,0.15)',
// //                     border: '1px solid rgba(255,255,255,0.2)',
// //                     borderRadius: '8px',
// //                     width: '30px',
// //                     height: '30px',
// //                     cursor: 'pointer',
// //                     color: 'white',
// //                     display: 'flex',
// //                     alignItems: 'center',
// //                     justifyContent: 'center',
// //                     transition: 'all 0.3s ease',
// //                     fontSize: '18px',
// //                     fontWeight: 'bold'
// //                   }}
// //                   onMouseEnter={(e) => {
// //                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
// //                     e.currentTarget.style.transform = 'scale(1.05)';
// //                   }}
// //                   onMouseLeave={(e) => {
// //                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
// //                     e.currentTarget.style.transform = 'scale(1)';
// //                   }}
// //                 >
// //                   ‹
// //                 </button>

// //                 <div style={{ position: 'relative' }} ref={yearDropdownRef}>
// //                   <button
// //                     type="button"
// //                     onClick={() => {
// //                       setShowYearDropdown(!showYearDropdown);
// //                       setShowMonthDropdown(false);
// //                       setShowDayDropdown(false);
// //                     }}
// //                     style={{
// //                       background: 'rgba(255,255,255,0.15)',
// //                       border: '1px solid rgba(255,255,255,0.2)',
// //                       borderRadius: '8px',
// //                       padding: '4px 10px',
// //                       cursor: 'pointer',
// //                       color: 'white',
// //                       fontSize: '13px',
// //                       fontWeight: 'bold',
// //                       display: 'flex',
// //                       alignItems: 'center',
// //                       gap: '4px',
// //                       minWidth: '60px',
// //                       justifyContent: 'center',
// //                       transition: 'all 0.3s ease'
// //                     }}
// //                     onMouseEnter={(e) => {
// //                       e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
// //                     }}
// //                     onMouseLeave={(e) => {
// //                       e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
// //                     }}
// //                   >
// //                     {currentYear}
// //                     {showYearDropdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
// //                   </button>
                  
// //                   {showYearDropdown && (
// //                     <div
// //                       style={{
// //                         position: 'absolute',
// //                         top: '100%',
// //                         left: '50%',
// //                         transform: 'translateX(-50%)',
// //                         marginTop: '4px',
// //                         background: 'white',
// //                         borderRadius: '10px',
// //                         boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
// //                         maxHeight: '160px',
// //                         overflowY: 'auto',
// //                         zIndex: 1060,
// //                         minWidth: '70px',
// //                         color: '#333'
// //                       }}
// //                     >
// //                       {getYearOptions().map((year) => (
// //                         <div
// //                           key={year}
// //                           onClick={() => handleYearSelect(year)}
// //                           style={{
// //                             padding: '6px 14px',
// //                             cursor: 'pointer',
// //                             fontSize: '13px',
// //                             textAlign: 'center',
// //                             background: year === currentYear ? '#e3f0ff' : 'transparent',
// //                             color: year === currentYear ? '#1e3c72' : '#333',
// //                             fontWeight: year === currentYear ? 'bold' : 'normal',
// //                             transition: 'all 0.2s ease'
// //                           }}
// //                           onMouseEnter={(e) => {
// //                             if (year !== currentYear) {
// //                               e.currentTarget.style.background = '#f5f7fa';
// //                             }
// //                           }}
// //                           onMouseLeave={(e) => {
// //                             if (year !== currentYear) {
// //                               e.currentTarget.style.background = 'transparent';
// //                             }
// //                           }}
// //                         >
// //                           {year}
// //                         </div>
// //                       ))}
// //                     </div>
// //                   )}
// //                 </div>

// //                 <div style={{ position: 'relative' }} ref={monthDropdownRef}>
// //                   <button
// //                     type="button"
// //                     onClick={() => {
// //                       setShowMonthDropdown(!showMonthDropdown);
// //                       setShowYearDropdown(false);
// //                       setShowDayDropdown(false);
// //                     }}
// //                     style={{
// //                       background: 'rgba(255,255,255,0.15)',
// //                       border: '1px solid rgba(255,255,255,0.2)',
// //                       borderRadius: '8px',
// //                       padding: '4px 10px',
// //                       cursor: 'pointer',
// //                       color: 'white',
// //                       fontSize: '13px',
// //                       fontWeight: 'bold',
// //                       display: 'flex',
// //                       alignItems: 'center',
// //                       gap: '4px',
// //                       minWidth: '70px',
// //                       justifyContent: 'center',
// //                       transition: 'all 0.3s ease'
// //                     }}
// //                     onMouseEnter={(e) => {
// //                       e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
// //                     }}
// //                     onMouseLeave={(e) => {
// //                       e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
// //                     }}
// //                   >
// //                     {monthNames[currentMonth - 1]}
// //                     {showMonthDropdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
// //                   </button>
                  
// //                   {showMonthDropdown && (
// //                     <div
// //                       style={{
// //                         position: 'absolute',
// //                         top: '100%',
// //                         left: '50%',
// //                         transform: 'translateX(-50%)',
// //                         marginTop: '4px',
// //                         background: 'white',
// //                         borderRadius: '10px',
// //                         boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
// //                         maxHeight: '160px',
// //                         overflowY: 'auto',
// //                         zIndex: 1060,
// //                         minWidth: '90px',
// //                         color: '#333'
// //                       }}
// //                     >
// //                       {getMonthOptions().map((month) => (
// //                         <div
// //                           key={month.value}
// //                           onClick={() => handleMonthSelect(month.value)}
// //                           style={{
// //                             padding: '6px 14px',
// //                             cursor: 'pointer',
// //                             fontSize: '13px',
// //                             textAlign: 'center',
// //                             background: month.value === currentMonth ? '#e3f0ff' : 'transparent',
// //                             color: month.value === currentMonth ? '#1e3c72' : '#333',
// //                             fontWeight: month.value === currentMonth ? 'bold' : 'normal',
// //                             transition: 'all 0.2s ease'
// //                           }}
// //                           onMouseEnter={(e) => {
// //                             if (month.value !== currentMonth) {
// //                               e.currentTarget.style.background = '#f5f7fa';
// //                             }
// //                           }}
// //                           onMouseLeave={(e) => {
// //                             if (month.value !== currentMonth) {
// //                               e.currentTarget.style.background = 'transparent';
// //                             }
// //                           }}
// //                         >
// //                           {month.label}
// //                         </div>
// //                       ))}
// //                     </div>
// //                   )}
// //                 </div>

// //                 <div style={{ position: 'relative' }} ref={dayDropdownRef}>
// //                   <button
// //                     type="button"
// //                     onClick={() => {
// //                       setShowDayDropdown(!showDayDropdown);
// //                       setShowYearDropdown(false);
// //                       setShowMonthDropdown(false);
// //                     }}
// //                     style={{
// //                       background: 'rgba(255,255,255,0.15)',
// //                       border: '1px solid rgba(255,255,255,0.2)',
// //                       borderRadius: '8px',
// //                       padding: '4px 10px',
// //                       cursor: 'pointer',
// //                       color: 'white',
// //                       fontSize: '13px',
// //                       fontWeight: 'bold',
// //                       display: 'flex',
// //                       alignItems: 'center',
// //                       gap: '4px',
// //                       minWidth: '50px',
// //                       justifyContent: 'center',
// //                       transition: 'all 0.3s ease'
// //                     }}
// //                     onMouseEnter={(e) => {
// //                       e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
// //                     }}
// //                     onMouseLeave={(e) => {
// //                       e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
// //                     }}
// //                   >
// //                     {currentDay}
// //                     {showDayDropdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
// //                   </button>
                  
// //                   {showDayDropdown && (
// //                     <div
// //                       style={{
// //                         position: 'absolute',
// //                         top: '100%',
// //                         left: '50%',
// //                         transform: 'translateX(-50%)',
// //                         marginTop: '4px',
// //                         background: 'white',
// //                         borderRadius: '10px',
// //                         boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
// //                         maxHeight: '160px',
// //                         overflowY: 'auto',
// //                         zIndex: 1060,
// //                         minWidth: '50px',
// //                         color: '#333'
// //                       }}
// //                     >
// //                       {getDayOptions().map((day) => (
// //                         <div
// //                           key={day}
// //                           onClick={() => handleDaySelect(day)}
// //                           style={{
// //                             padding: '6px 14px',
// //                             cursor: 'pointer',
// //                             fontSize: '13px',
// //                             textAlign: 'center',
// //                             background: day === currentDay ? '#e3f0ff' : 'transparent',
// //                             color: day === currentDay ? '#1e3c72' : '#333',
// //                             fontWeight: day === currentDay ? 'bold' : 'normal',
// //                             transition: 'all 0.2s ease'
// //                           }}
// //                           onMouseEnter={(e) => {
// //                             if (day !== currentDay) {
// //                               e.currentTarget.style.background = '#f5f7fa';
// //                             }
// //                           }}
// //                           onMouseLeave={(e) => {
// //                             if (day !== currentDay) {
// //                               e.currentTarget.style.background = 'transparent';
// //                             }
// //                           }}
// //                         >
// //                           {day}
// //                         </div>
// //                       ))}
// //                     </div>
// //                   )}
// //                 </div>

// //                 <button
// //                   type="button"
// //                   onClick={() => changeMonth(1)}
// //                   style={{
// //                     background: 'rgba(255,255,255,0.15)',
// //                     border: '1px solid rgba(255,255,255,0.2)',
// //                     borderRadius: '8px',
// //                     width: '30px',
// //                     height: '30px',
// //                     cursor: 'pointer',
// //                     color: 'white',
// //                     display: 'flex',
// //                     alignItems: 'center',
// //                     justifyContent: 'center',
// //                     transition: 'all 0.3s ease',
// //                     fontSize: '18px',
// //                     fontWeight: 'bold'
// //                   }}
// //                   onMouseEnter={(e) => {
// //                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
// //                     e.currentTarget.style.transform = 'scale(1.05)';
// //                   }}
// //                   onMouseLeave={(e) => {
// //                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
// //                     e.currentTarget.style.transform = 'scale(1)';
// //                   }}
// //                 >
// //                   ›
// //                 </button>

// //                 <button
// //                   type="button"
// //                   onClick={() => changeYear(1)}
// //                   style={{
// //                     background: 'rgba(255,255,255,0.15)',
// //                     border: '1px solid rgba(255,255,255,0.2)',
// //                     borderRadius: '8px',
// //                     width: '30px',
// //                     height: '30px',
// //                     cursor: 'pointer',
// //                     color: 'white',
// //                     display: 'flex',
// //                     alignItems: 'center',
// //                     justifyContent: 'center',
// //                     transition: 'all 0.3s ease',
// //                     fontSize: '18px',
// //                     fontWeight: 'bold'
// //                   }}
// //                   onMouseEnter={(e) => {
// //                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
// //                     e.currentTarget.style.transform = 'scale(1.05)';
// //                   }}
// //                   onMouseLeave={(e) => {
// //                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
// //                     e.currentTarget.style.transform = 'scale(1)';
// //                   }}
// //                 >
// //                   »
// //                 </button>
// //               </div>
// //             </div>
            
// //             <div style={{ 
// //               display: 'grid', 
// //               gridTemplateColumns: 'repeat(7, 1fr)',
// //               padding: '10px',
// //               borderBottom: '1px solid #eef2f6'
// //             }}>
// //               {weekDays.map((day, idx) => (
// //                 <div key={idx} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>
// //                   {day}
// //                 </div>
// //               ))}
// //             </div>
            
// //             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '10px', gap: '2px' }}>
// //               {getDays().map((day, idx) => (
// //                 <button
// //                   key={idx}
// //                   onClick={() => day && handleDateSelect(day)}
// //                   disabled={!day}
// //                   style={{
// //                     textAlign: 'center',
// //                     padding: '8px 0',
// //                     borderRadius: '8px',
// //                     border: 'none',
// //                     background: isSelected(day)
// //                       ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
// //                       : isToday(day)
// //                       ? '#e8f0fe'
// //                       : 'transparent',
// //                     color: isSelected(day) ? 'white' : isToday(day) ? '#1e3c72' : '#333',
// //                     fontWeight: isSelected(day) || isToday(day) ? 'bold' : 'normal',
// //                     cursor: day ? 'pointer' : 'default',
// //                     opacity: day ? 1 : 0.3,
// //                     fontSize: '13px',
// //                     transition: 'all 0.2s ease'
// //                   }}
// //                   onMouseEnter={(e) => {
// //                     if (day && !isSelected(day) && !isToday(day)) {
// //                       e.currentTarget.style.background = '#f5f7fa';
// //                     }
// //                   }}
// //                   onMouseLeave={(e) => {
// //                     if (day && !isSelected(day) && !isToday(day)) {
// //                       e.currentTarget.style.background = 'transparent';
// //                     }
// //                   }}
// //                 >
// //                   {day || ''}
// //                 </button>
// //               ))}
// //             </div>
            
// //             <div style={{ 
// //               padding: '8px', 
// //               borderTop: '1px solid #eef2f6',
// //               textAlign: 'center',
// //               background: '#fafbfc'
// //             }}>
// //               <button
// //                 type="button"
// //                 onClick={goToToday}
// //                 style={{
// //                   background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
// //                   border: 'none',
// //                   borderRadius: '20px',
// //                   padding: '6px 24px',
// //                   color: 'white',
// //                   fontSize: '13px',
// //                   cursor: 'pointer',
// //                   transition: 'all 0.3s ease',
// //                   boxShadow: '0 2px 10px rgba(30, 60, 114, 0.3)'
// //                 }}
// //                 onMouseEnter={(e) => {
// //                   e.currentTarget.style.transform = 'scale(1.05)';
// //                   e.currentTarget.style.boxShadow = '0 4px 20px rgba(30, 60, 114, 0.4)';
// //                 }}
// //                 onMouseLeave={(e) => {
// //                   e.currentTarget.style.transform = 'scale(1)';
// //                   e.currentTarget.style.boxShadow = '0 2px 10px rgba(30, 60, 114, 0.3)';
// //                 }}
// //               >
// //                 امروز
// //               </button>
// //             </div>
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default JalaliDatePicker;

// // // // src/components/JalaliDatePicker.tsx
// // // import React, { useState, useRef, useEffect } from 'react';
// // // import { Calendar, X, ChevronDown, ChevronUp } from 'lucide-react';
// // // import moment from 'moment-jalaali';
// // // import dateUtils from '../utils/dateUtils';

// // // interface JalaliDatePickerProps {
// // //   value?: string | null;
// // //   onChange: (date: string | null) => void;
// // //   placeholder?: string;
// // //   required?: boolean;
// // //   label?: string;
// // //   error?: string;
// // //   disabled?: boolean;
// // //   className?: string;
// // // }

// // // // تنظیمات اولیه
// // // moment.loadPersian({ dialect: 'persian-modern' });

// // // // ✅ لیست کامل سال‌های کبیسه شمسی از ۱۲۱۰ تا ۱۴۹۸
// // // // بر اساس سند رسمی مرکز تقویم مؤسسه ژئوفیزیک دانشگاه تهران
// // // const LEAP_YEARS = [
// // //   // دوره اول: ۱۲۱۰ تا ۱۲۴۳
// // //   1210, 1214, 1218, 1222, 1226, 1230, 1234, 1238, 1243,
  
// // //   // دوره دوم: ۱۲۴۷ تا ۱۲۷۶
// // //   1247, 1251, 1255, 1259, 1263, 1267, 1271, 1276,
  
// // //   // دوره سوم: ۱۲۸۰ تا ۱۳۰۹
// // //   1280, 1284, 1288, 1292, 1296, 1300, 1304, 1309,
  
// // //   // دوره چهارم: ۱۳۱۳ تا ۱۳۴۲
// // //   1313, 1317, 1321, 1325, 1329, 1333, 1337, 1342,
  
// // //   // دوره پنجم: ۱۳۴۶ تا ۱۳۷۵
// // //   1346, 1350, 1354, 1358, 1362, 1366, 1370, 1375,
  
// // //   // دوره ششم: ۱۳۷۹ تا ۱۴۰۸
// // //   1379, 1383, 1387, 1391, 1395, 1399, 1403, 1408,
  
// // //   // دوره هفتم: ۱۴۱۲ تا ۱۴۴۱
// // //   1412, 1416, 1420, 1424, 1428, 1432, 1436, 1441,
  
// // //   // دوره هشتم: ۱۴۴۵ تا ۱۴۷۴
// // //   1445, 1449, 1453, 1457, 1461, 1465, 1469, 1474,
  
// // //   // دوره نهم: ۱۴۷۸ تا ۱۴۹۸
// // //   1478, 1482, 1486, 1490, 1494, 1498
// // // ];

// // // // ✅ دریافت تعداد روزهای ماه شمسی
// // // const getJalaliMonthDays = (year: number, month: number): number => {
// // //   const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  
// // //   if (month === 12) {
// // //     return LEAP_YEARS.includes(year) ? 30 : 29;
// // //   }
  
// // //   return daysInMonth[month - 1];
// // // };

// // // // دریافت اولین روز ماه شمسی (شنبه = 0)
// // // const getFirstDayOfMonth = (year: number, month: number): number => {
// // //   const date = moment(`${year}/${month}/01`, 'jYYYY/jMM/jDD');
// // //   let day = date.day();
// // //   day = (day + 1) % 7;
// // //   return day;
// // // };

// // // const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
// // //   value,
// // //   onChange,
// // //   placeholder = '1402/12/25',
// // //   required = false,
// // //   label,
// // //   error,
// // //   disabled = false,
// // //   className = '',
// // // }) => {
// // //   const [isOpen, setIsOpen] = useState(false);
// // //   const [currentYear, setCurrentYear] = useState(1405);
// // //   const [currentMonth, setCurrentMonth] = useState(1);
// // //   const [currentDay, setCurrentDay] = useState(1);
// // //   const [inputValue, setInputValue] = useState('');
// // //   const [isTyping, setIsTyping] = useState(false);
// // //   const [showYearDropdown, setShowYearDropdown] = useState(false);
// // //   const [showMonthDropdown, setShowMonthDropdown] = useState(false);
// // //   const [showDayDropdown, setShowDayDropdown] = useState(false);
// // //   const pickerRef = useRef<HTMLDivElement>(null);
// // //   const yearDropdownRef = useRef<HTMLDivElement>(null);
// // //   const monthDropdownRef = useRef<HTMLDivElement>(null);
// // //   const dayDropdownRef = useRef<HTMLDivElement>(null);

// // //   const monthNames = [
// // //     'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
// // //     'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
// // //   ];

// // //   const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

// // //   const extractYearMonth = (dateStr: string): { year: number; month: number; day: number } | null => {
// // //     const pattern = /^\d{4}\/\d{2}\/\d{2}$/;
// // //     if (!pattern.test(dateStr)) return null;
    
// // //     const parts = dateStr.split('/');
// // //     const year = parseInt(parts[0]);
// // //     const month = parseInt(parts[1]);
// // //     const day = parseInt(parts[2]);
    
// // //     if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    
// // //     const m = moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD');
// // //     if (!m.isValid()) return null;
    
// // //     return { year, month, day };
// // //   };

// // //   useEffect(() => {
// // //     if (value && !isTyping) {
// // //       const jalaliStr = dateUtils.toJalali(value as string);
// // //       if (jalaliStr) {
// // //         const parts = jalaliStr.split('/');
// // //         if (parts.length === 3) {
// // //           const year = parseInt(parts[0]);
// // //           const month = parseInt(parts[1]);
// // //           const day = parseInt(parts[2]);
// // //           setInputValue(jalaliStr);
// // //           setCurrentYear(year);
// // //           setCurrentMonth(month);
// // //           setCurrentDay(day);
// // //         }
// // //       } else {
// // //         setInputValue('');
// // //         const today = moment();
// // //         setCurrentYear(today.jYear());
// // //         setCurrentMonth(today.jMonth() + 1);
// // //         setCurrentDay(today.jDate());
// // //       }
// // //     } else if (!value && !isTyping) {
// // //       const today = moment();
// // //       setInputValue('');
// // //       setCurrentYear(today.jYear());
// // //       setCurrentMonth(today.jMonth() + 1);
// // //       setCurrentDay(today.jDate());
// // //     }
// // //   }, [value, isTyping]);

// // //   useEffect(() => {
// // //     const handleClickOutside = (event: MouseEvent) => {
// // //       if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
// // //         setIsOpen(false);
// // //         setShowYearDropdown(false);
// // //         setShowMonthDropdown(false);
// // //         setShowDayDropdown(false);
// // //       }
// // //       if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
// // //         setShowYearDropdown(false);
// // //       }
// // //       if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
// // //         setShowMonthDropdown(false);
// // //       }
// // //       if (dayDropdownRef.current && !dayDropdownRef.current.contains(event.target as Node)) {
// // //         setShowDayDropdown(false);
// // //       }
// // //     };
// // //     document.addEventListener('mousedown', handleClickOutside);
// // //     return () => document.removeEventListener('mousedown', handleClickOutside);
// // //   }, []);

// // //   const getDays = () => {
// // //     const daysInMonth = getJalaliMonthDays(currentYear, currentMonth);
// // //     const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
// // //     const days = [];
    
// // //     for (let i = 0; i < firstDay; i++) {
// // //       days.push(null);
// // //     }
// // //     for (let i = 1; i <= daysInMonth; i++) {
// // //       days.push(i);
// // //     }
// // //     return days;
// // //   };

// // //   const handleDateSelect = (day: number) => {
// // //     const jalaliStr = `${currentYear}/${String(currentMonth).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
// // //     const gregorianDate = dateUtils.jalaliToGregorian(jalaliStr);
    
// // //     onChange(gregorianDate || null);
// // //     setInputValue(jalaliStr);
// // //     setCurrentDay(day);
// // //     setIsOpen(false);
// // //     setIsTyping(false);
// // //   };

// // //   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// // //     let val = e.target.value;
// // //     setIsTyping(true);
    
// // //     val = val.replace(/[^0-9/]/g, '');
// // //     if (val.length > 10) {
// // //       val = val.slice(0, 10);
// // //     }
    
// // //     const numbers = val.replace(/\//g, '');
// // //     if (numbers.length >= 5 && !val.includes('/')) {
// // //       val = `${numbers.slice(0, 4)}/${numbers.slice(4)}`;
// // //     } else if (numbers.length >= 7 && val.split('/').length === 2) {
// // //       const parts = val.split('/');
// // //       if (parts[1].length >= 2) {
// // //         val = `${parts[0]}/${parts[1].slice(0, 2)}/${numbers.slice(6)}`;
// // //       }
// // //     }
    
// // //     setInputValue(val);
    
// // //     if (val.length === 10) {
// // //       const result = extractYearMonth(val);
// // //       if (result) {
// // //         setCurrentYear(result.year);
// // //         setCurrentMonth(result.month);
// // //         setCurrentDay(result.day);
// // //       }
// // //     }
// // //   };

// // //   const handleInputBlur = () => {
// // //     setIsTyping(false);
    
// // //     if (!inputValue) {
// // //       onChange(null);
// // //       return;
// // //     }
    
// // //     const pattern = /^\d{4}\/\d{2}\/\d{2}$/;
// // //     if (pattern.test(inputValue)) {
// // //       const m = moment(inputValue, 'jYYYY/jMM/jDD');
// // //       if (m.isValid()) {
// // //         const gregorianDate = dateUtils.jalaliToGregorian(inputValue);
// // //         onChange(gregorianDate || null);
// // //         const result = extractYearMonth(inputValue);
// // //         if (result) {
// // //           setCurrentYear(result.year);
// // //           setCurrentMonth(result.month);
// // //           setCurrentDay(result.day);
// // //         }
// // //         return;
// // //       }
// // //     }
    
// // //     if (value) {
// // //       const jalaliStr = dateUtils.toJalali(value as string);
// // //       if (jalaliStr) {
// // //         setInputValue(jalaliStr);
// // //         const result = extractYearMonth(jalaliStr);
// // //         if (result) {
// // //           setCurrentYear(result.year);
// // //           setCurrentMonth(result.month);
// // //           setCurrentDay(result.day);
// // //         }
// // //       } else {
// // //         setInputValue('');
// // //         onChange(null);
// // //       }
// // //     } else {
// // //       setInputValue('');
// // //     }
// // //   };

// // //   const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
// // //     if (e.key === 'Enter') {
// // //       handleInputBlur();
// // //       setIsOpen(false);
// // //     }
// // //   };

// // //   const handleCalendarClick = () => {
// // //     if (!disabled) {
// // //       setIsOpen(true);
// // //       if (inputValue && inputValue.length === 10) {
// // //         const result = extractYearMonth(inputValue);
// // //         if (result) {
// // //           setCurrentYear(result.year);
// // //           setCurrentMonth(result.month);
// // //           setCurrentDay(result.day);
// // //         }
// // //       }
// // //     }
// // //   };

// // //   const changeMonth = (delta: number) => {
// // //     let newMonth = currentMonth + delta;
// // //     let newYear = currentYear;
    
// // //     if (newMonth < 1) {
// // //       newMonth = 12;
// // //       newYear--;
// // //     } else if (newMonth > 12) {
// // //       newMonth = 1;
// // //       newYear++;
// // //     }
// // //     setCurrentMonth(newMonth);
// // //     setCurrentYear(newYear);
// // //   };

// // //   const changeYear = (delta: number) => {
// // //     setCurrentYear(prev => prev + delta);
// // //   };

// // //   const clearDate = () => {
// // //     onChange(null);
// // //     setInputValue('');
// // //     setIsOpen(false);
// // //     setIsTyping(false);
// // //   };

// // //   const isToday = (day: number) => {
// // //     const today = moment();
// // //     const todayYear = today.jYear();
// // //     const todayMonth = today.jMonth() + 1;
// // //     const todayDay = today.jDate();
    
// // //     return todayYear === currentYear && todayMonth === currentMonth && todayDay === day;
// // //   };

// // //   const isSelected = (day: number) => {
// // //     if (value) {
// // //       const jalaliStr = dateUtils.toJalali(value as string);
// // //       if (jalaliStr) {
// // //         const [year, month, dayStr] = jalaliStr.split('/').map(Number);
// // //         if (year === currentYear && month === currentMonth && dayStr === day) {
// // //           return true;
// // //         }
// // //       }
// // //     }
    
// // //     if (inputValue && inputValue.length === 10) {
// // //       const result = extractYearMonth(inputValue);
// // //       if (result && result.year === currentYear && result.month === currentMonth && result.day === day) {
// // //         return true;
// // //       }
// // //     }
    
// // //     return false;
// // //   };

// // //   const goToToday = () => {
// // //     const today = moment();
// // //     const gregorianStr = today.format('YYYY-MM-DD');
// // //     const jalaliStr = today.format('jYYYY/jMM/jDD');
// // //     const [year, month, day] = jalaliStr.split('/').map(Number);
    
// // //     onChange(gregorianStr);
// // //     setInputValue(jalaliStr);
// // //     setCurrentYear(year);
// // //     setCurrentMonth(month);
// // //     setCurrentDay(day);
// // //     setIsOpen(false);
// // //     setIsTyping(false);
// // //   };

// // //   const handleYearSelect = (year: number) => {
// // //     setCurrentYear(year);
// // //     setShowYearDropdown(false);
// // //   };

// // //   const handleMonthSelect = (month: number) => {
// // //     setCurrentMonth(month);
// // //     setShowMonthDropdown(false);
// // //   };

// // //   const handleDaySelect = (day: number) => {
// // //     setCurrentDay(day);
// // //     const jalaliStr = `${currentYear}/${String(currentMonth).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
// // //     const gregorianDate = dateUtils.jalaliToGregorian(jalaliStr);
// // //     onChange(gregorianDate || null);
// // //     setInputValue(jalaliStr);
// // //     setShowDayDropdown(false);
// // //     setIsOpen(false);
// // //   };

// // //   const getYearOptions = () => {
// // //     const years = [];
// // //     for (let i = 1300; i <= 1500; i++) {
// // //       years.push(i);
// // //     }
// // //     return years;
// // //   };

// // //   const getMonthOptions = () => {
// // //     return monthNames.map((name, index) => ({
// // //       value: index + 1,
// // //       label: name
// // //     }));
// // //   };

// // //   const getDayOptions = () => {
// // //     const daysInMonth = getJalaliMonthDays(currentYear, currentMonth);
// // //     const days = [];
// // //     for (let i = 1; i <= daysInMonth; i++) {
// // //       days.push(i);
// // //     }
// // //     return days;
// // //   };

// // //   const displayValue = inputValue;

// // //   return (
// // //     <div className={`position-relative ${className}`} ref={pickerRef} style={{ direction: 'rtl' }}>
// // //       {label && (
// // //         <label className="form-label fw-semibold mb-1" style={{ fontSize: '14px' }}>
// // //           {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
// // //         </label>
// // //       )}
      
// // //       <div className="position-relative">
// // //         <input
// // //           type="text"
// // //           className={`form-control ${error ? 'is-invalid' : ''}`}
// // //           placeholder={placeholder}
// // //           value={displayValue}
// // //           onChange={handleInputChange}
// // //           onBlur={handleInputBlur}
// // //           onKeyDown={handleInputKeyDown}
// // //           onFocus={() => !disabled && handleCalendarClick()}
// // //           disabled={disabled}
// // //           required={required}
// // //           style={{ 
// // //             paddingLeft: '60px', 
// // //             direction: 'ltr',
// // //             borderRadius: '10px',
// // //             border: error ? '1px solid #dc3545' : '1px solid #e0e0e0',
// // //             padding: '10px 12px',
// // //             width: '100%',
// // //             fontFamily: 'monospace'
// // //           }}
// // //         />
// // //         <div
// // //           className="position-absolute d-flex align-items-center gap-2"
// // //           style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
// // //         >
// // //           {inputValue && (
// // //             <button
// // //               type="button"
// // //               onClick={clearDate}
// // //               style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', opacity: 0.6 , display: 'none'}}
// // //             >
// // //               <X size={16} color="#999" />
// // //             </button>
// // //           )}
// // //           <button
// // //             type="button"
// // //             onClick={handleCalendarClick}
// // //             style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'none' }} 
// // //             // style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
// // //             disabled={disabled}
// // //           >
// // //             <Calendar size={18} color="#aaa" />
// // //           </button>
// // //         </div>
// // //       </div>
      
// // //       {error && <div className="text-danger small mt-1">{error}</div>}
// // //       {isTyping && inputValue && inputValue.length < 10 && (
// // //         <div className="text-muted small mt-1">
// // //           مثال: 1402/12/25
// // //         </div>
// // //       )}

// // //       {isOpen && !disabled && (
// // //         <>
// // //           <div 
// // //             style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1040 }}
// // //             onClick={() => {
// // //               setIsOpen(false);
// // //               setShowYearDropdown(false);
// // //               setShowMonthDropdown(false);
// // //               setShowDayDropdown(false);
// // //             }}
// // //           />
// // //           <div 
// // //             className="position-absolute bg-white rounded-3 shadow-lg mt-2"
// // //             style={{ 
// // //               zIndex: 1050, 
// // //               width: '340px',
// // //               top: '100%',
// // //               left: 0,
// // //               boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
// // //               border: '1px solid #eef2f6',
// // //               overflow: 'hidden'
// // //             }}
// // //           >
// // //             <div style={{ 
// // //               background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
// // //               padding: '12px',
// // //               color: 'white'
// // //             }}>
// // //               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
// // //                 <button
// // //                   type="button"
// // //                   onClick={() => changeYear(-1)}
// // //                   style={{
// // //                     background: 'rgba(255,255,255,0.15)',
// // //                     border: '1px solid rgba(255,255,255,0.2)',
// // //                     borderRadius: '8px',
// // //                     width: '30px',
// // //                     height: '30px',
// // //                     cursor: 'pointer',
// // //                     color: 'white',
// // //                     display: 'flex',
// // //                     alignItems: 'center',
// // //                     justifyContent: 'center',
// // //                     transition: 'all 0.3s ease',
// // //                     fontSize: '18px',
// // //                     fontWeight: 'bold'
// // //                   }}
// // //                   onMouseEnter={(e) => {
// // //                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
// // //                     e.currentTarget.style.transform = 'scale(1.05)';
// // //                   }}
// // //                   onMouseLeave={(e) => {
// // //                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
// // //                     e.currentTarget.style.transform = 'scale(1)';
// // //                   }}
// // //                 >
// // //                   «
// // //                 </button>

// // //                 <button
// // //                   type="button"
// // //                   onClick={() => changeMonth(-1)}
// // //                   style={{
// // //                     background: 'rgba(255,255,255,0.15)',
// // //                     border: '1px solid rgba(255,255,255,0.2)',
// // //                     borderRadius: '8px',
// // //                     width: '30px',
// // //                     height: '30px',
// // //                     cursor: 'pointer',
// // //                     color: 'white',
// // //                     display: 'flex',
// // //                     alignItems: 'center',
// // //                     justifyContent: 'center',
// // //                     transition: 'all 0.3s ease',
// // //                     fontSize: '18px',
// // //                     fontWeight: 'bold'
// // //                   }}
// // //                   onMouseEnter={(e) => {
// // //                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
// // //                     e.currentTarget.style.transform = 'scale(1.05)';
// // //                   }}
// // //                   onMouseLeave={(e) => {
// // //                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
// // //                     e.currentTarget.style.transform = 'scale(1)';
// // //                   }}
// // //                 >
// // //                   ‹
// // //                 </button>

// // //                 <div style={{ position: 'relative' }} ref={yearDropdownRef}>
// // //                   <button
// // //                     type="button"
// // //                     onClick={() => {
// // //                       setShowYearDropdown(!showYearDropdown);
// // //                       setShowMonthDropdown(false);
// // //                       setShowDayDropdown(false);
// // //                     }}
// // //                     style={{
// // //                       background: 'rgba(255,255,255,0.15)',
// // //                       border: '1px solid rgba(255,255,255,0.2)',
// // //                       borderRadius: '8px',
// // //                       padding: '4px 10px',
// // //                       cursor: 'pointer',
// // //                       color: 'white',
// // //                       fontSize: '13px',
// // //                       fontWeight: 'bold',
// // //                       display: 'flex',
// // //                       alignItems: 'center',
// // //                       gap: '4px',
// // //                       minWidth: '60px',
// // //                       justifyContent: 'center',
// // //                       transition: 'all 0.3s ease'
// // //                     }}
// // //                     onMouseEnter={(e) => {
// // //                       e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
// // //                     }}
// // //                     onMouseLeave={(e) => {
// // //                       e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
// // //                     }}
// // //                   >
// // //                     {currentYear}
// // //                     {showYearDropdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
// // //                   </button>
                  
// // //                   {showYearDropdown && (
// // //                     <div
// // //                       style={{
// // //                         position: 'absolute',
// // //                         top: '100%',
// // //                         left: '50%',
// // //                         transform: 'translateX(-50%)',
// // //                         marginTop: '4px',
// // //                         background: 'white',
// // //                         borderRadius: '10px',
// // //                         boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
// // //                         maxHeight: '160px',
// // //                         overflowY: 'auto',
// // //                         zIndex: 1060,
// // //                         minWidth: '70px',
// // //                         color: '#333'
// // //                       }}
// // //                     >
// // //                       {getYearOptions().map((year) => (
// // //                         <div
// // //                           key={year}
// // //                           onClick={() => handleYearSelect(year)}
// // //                           style={{
// // //                             padding: '6px 14px',
// // //                             cursor: 'pointer',
// // //                             fontSize: '13px',
// // //                             textAlign: 'center',
// // //                             background: year === currentYear ? '#e3f0ff' : 'transparent',
// // //                             color: year === currentYear ? '#1e3c72' : '#333',
// // //                             fontWeight: year === currentYear ? 'bold' : 'normal',
// // //                             transition: 'all 0.2s ease'
// // //                           }}
// // //                           onMouseEnter={(e) => {
// // //                             if (year !== currentYear) {
// // //                               e.currentTarget.style.background = '#f5f7fa';
// // //                             }
// // //                           }}
// // //                           onMouseLeave={(e) => {
// // //                             if (year !== currentYear) {
// // //                               e.currentTarget.style.background = 'transparent';
// // //                             }
// // //                           }}
// // //                         >
// // //                           {year}
// // //                         </div>
// // //                       ))}
// // //                     </div>
// // //                   )}
// // //                 </div>

// // //                 <div style={{ position: 'relative' }} ref={monthDropdownRef}>
// // //                   <button
// // //                     type="button"
// // //                     onClick={() => {
// // //                       setShowMonthDropdown(!showMonthDropdown);
// // //                       setShowYearDropdown(false);
// // //                       setShowDayDropdown(false);
// // //                     }}
// // //                     style={{
// // //                       background: 'rgba(255,255,255,0.15)',
// // //                       border: '1px solid rgba(255,255,255,0.2)',
// // //                       borderRadius: '8px',
// // //                       padding: '4px 10px',
// // //                       cursor: 'pointer',
// // //                       color: 'white',
// // //                       fontSize: '13px',
// // //                       fontWeight: 'bold',
// // //                       display: 'flex',
// // //                       alignItems: 'center',
// // //                       gap: '4px',
// // //                       minWidth: '70px',
// // //                       justifyContent: 'center',
// // //                       transition: 'all 0.3s ease'
// // //                     }}
// // //                     onMouseEnter={(e) => {
// // //                       e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
// // //                     }}
// // //                     onMouseLeave={(e) => {
// // //                       e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
// // //                     }}
// // //                   >
// // //                     {monthNames[currentMonth - 1]}
// // //                     {showMonthDropdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
// // //                   </button>
                  
// // //                   {showMonthDropdown && (
// // //                     <div
// // //                       style={{
// // //                         position: 'absolute',
// // //                         top: '100%',
// // //                         left: '50%',
// // //                         transform: 'translateX(-50%)',
// // //                         marginTop: '4px',
// // //                         background: 'white',
// // //                         borderRadius: '10px',
// // //                         boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
// // //                         maxHeight: '160px',
// // //                         overflowY: 'auto',
// // //                         zIndex: 1060,
// // //                         minWidth: '90px',
// // //                         color: '#333'
// // //                       }}
// // //                     >
// // //                       {getMonthOptions().map((month) => (
// // //                         <div
// // //                           key={month.value}
// // //                           onClick={() => handleMonthSelect(month.value)}
// // //                           style={{
// // //                             padding: '6px 14px',
// // //                             cursor: 'pointer',
// // //                             fontSize: '13px',
// // //                             textAlign: 'center',
// // //                             background: month.value === currentMonth ? '#e3f0ff' : 'transparent',
// // //                             color: month.value === currentMonth ? '#1e3c72' : '#333',
// // //                             fontWeight: month.value === currentMonth ? 'bold' : 'normal',
// // //                             transition: 'all 0.2s ease'
// // //                           }}
// // //                           onMouseEnter={(e) => {
// // //                             if (month.value !== currentMonth) {
// // //                               e.currentTarget.style.background = '#f5f7fa';
// // //                             }
// // //                           }}
// // //                           onMouseLeave={(e) => {
// // //                             if (month.value !== currentMonth) {
// // //                               e.currentTarget.style.background = 'transparent';
// // //                             }
// // //                           }}
// // //                         >
// // //                           {month.label}
// // //                         </div>
// // //                       ))}
// // //                     </div>
// // //                   )}
// // //                 </div>

// // //                 <div style={{ position: 'relative' }} ref={dayDropdownRef}>
// // //                   <button
// // //                     type="button"
// // //                     onClick={() => {
// // //                       setShowDayDropdown(!showDayDropdown);
// // //                       setShowYearDropdown(false);
// // //                       setShowMonthDropdown(false);
// // //                     }}
// // //                     style={{
// // //                       background: 'rgba(255,255,255,0.15)',
// // //                       border: '1px solid rgba(255,255,255,0.2)',
// // //                       borderRadius: '8px',
// // //                       padding: '4px 10px',
// // //                       cursor: 'pointer',
// // //                       color: 'white',
// // //                       fontSize: '13px',
// // //                       fontWeight: 'bold',
// // //                       display: 'flex',
// // //                       alignItems: 'center',
// // //                       gap: '4px',
// // //                       minWidth: '50px',
// // //                       justifyContent: 'center',
// // //                       transition: 'all 0.3s ease'
// // //                     }}
// // //                     onMouseEnter={(e) => {
// // //                       e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
// // //                     }}
// // //                     onMouseLeave={(e) => {
// // //                       e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
// // //                     }}
// // //                   >
// // //                     {currentDay}
// // //                     {showDayDropdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
// // //                   </button>
                  
// // //                   {showDayDropdown && (
// // //                     <div
// // //                       style={{
// // //                         position: 'absolute',
// // //                         top: '100%',
// // //                         left: '50%',
// // //                         transform: 'translateX(-50%)',
// // //                         marginTop: '4px',
// // //                         background: 'white',
// // //                         borderRadius: '10px',
// // //                         boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
// // //                         maxHeight: '160px',
// // //                         overflowY: 'auto',
// // //                         zIndex: 1060,
// // //                         minWidth: '50px',
// // //                         color: '#333'
// // //                       }}
// // //                     >
// // //                       {getDayOptions().map((day) => (
// // //                         <div
// // //                           key={day}
// // //                           onClick={() => handleDaySelect(day)}
// // //                           style={{
// // //                             padding: '6px 14px',
// // //                             cursor: 'pointer',
// // //                             fontSize: '13px',
// // //                             textAlign: 'center',
// // //                             background: day === currentDay ? '#e3f0ff' : 'transparent',
// // //                             color: day === currentDay ? '#1e3c72' : '#333',
// // //                             fontWeight: day === currentDay ? 'bold' : 'normal',
// // //                             transition: 'all 0.2s ease'
// // //                           }}
// // //                           onMouseEnter={(e) => {
// // //                             if (day !== currentDay) {
// // //                               e.currentTarget.style.background = '#f5f7fa';
// // //                             }
// // //                           }}
// // //                           onMouseLeave={(e) => {
// // //                             if (day !== currentDay) {
// // //                               e.currentTarget.style.background = 'transparent';
// // //                             }
// // //                           }}
// // //                         >
// // //                           {day}
// // //                         </div>
// // //                       ))}
// // //                     </div>
// // //                   )}
// // //                 </div>

// // //                 <button
// // //                   type="button"
// // //                   onClick={() => changeMonth(1)}
// // //                   style={{
// // //                     background: 'rgba(255,255,255,0.15)',
// // //                     border: '1px solid rgba(255,255,255,0.2)',
// // //                     borderRadius: '8px',
// // //                     width: '30px',
// // //                     height: '30px',
// // //                     cursor: 'pointer',
// // //                     color: 'white',
// // //                     display: 'flex',
// // //                     alignItems: 'center',
// // //                     justifyContent: 'center',
// // //                     transition: 'all 0.3s ease',
// // //                     fontSize: '18px',
// // //                     fontWeight: 'bold'
// // //                   }}
// // //                   onMouseEnter={(e) => {
// // //                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
// // //                     e.currentTarget.style.transform = 'scale(1.05)';
// // //                   }}
// // //                   onMouseLeave={(e) => {
// // //                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
// // //                     e.currentTarget.style.transform = 'scale(1)';
// // //                   }}
// // //                 >
// // //                   ›
// // //                 </button>

// // //                 <button
// // //                   type="button"
// // //                   onClick={() => changeYear(1)}
// // //                   style={{
// // //                     background: 'rgba(255,255,255,0.15)',
// // //                     border: '1px solid rgba(255,255,255,0.2)',
// // //                     borderRadius: '8px',
// // //                     width: '30px',
// // //                     height: '30px',
// // //                     cursor: 'pointer',
// // //                     color: 'white',
// // //                     display: 'flex',
// // //                     alignItems: 'center',
// // //                     justifyContent: 'center',
// // //                     transition: 'all 0.3s ease',
// // //                     fontSize: '18px',
// // //                     fontWeight: 'bold'
// // //                   }}
// // //                   onMouseEnter={(e) => {
// // //                     e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
// // //                     e.currentTarget.style.transform = 'scale(1.05)';
// // //                   }}
// // //                   onMouseLeave={(e) => {
// // //                     e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
// // //                     e.currentTarget.style.transform = 'scale(1)';
// // //                   }}
// // //                 >
// // //                   »
// // //                 </button>
// // //               </div>
// // //             </div>
            
// // //             <div style={{ 
// // //               display: 'grid', 
// // //               gridTemplateColumns: 'repeat(7, 1fr)',
// // //               padding: '10px',
// // //               borderBottom: '1px solid #eef2f6'
// // //             }}>
// // //               {weekDays.map((day, idx) => (
// // //                 <div key={idx} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>
// // //                   {day}
// // //                 </div>
// // //               ))}
// // //             </div>
            
// // //             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '10px', gap: '2px' }}>
// // //               {getDays().map((day, idx) => (
// // //                 <button
// // //                   key={idx}
// // //                   onClick={() => day && handleDateSelect(day)}
// // //                   disabled={!day}
// // //                   style={{
// // //                     textAlign: 'center',
// // //                     padding: '8px 0',
// // //                     borderRadius: '8px',
// // //                     border: 'none',
// // //                     background: isSelected(day)
// // //                       ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
// // //                       : isToday(day)
// // //                       ? '#e8f0fe'
// // //                       : 'transparent',
// // //                     color: isSelected(day) ? 'white' : isToday(day) ? '#1e3c72' : '#333',
// // //                     fontWeight: isSelected(day) || isToday(day) ? 'bold' : 'normal',
// // //                     cursor: day ? 'pointer' : 'default',
// // //                     opacity: day ? 1 : 0.3,
// // //                     fontSize: '13px',
// // //                     transition: 'all 0.2s ease'
// // //                   }}
// // //                   onMouseEnter={(e) => {
// // //                     if (day && !isSelected(day) && !isToday(day)) {
// // //                       e.currentTarget.style.background = '#f5f7fa';
// // //                     }
// // //                   }}
// // //                   onMouseLeave={(e) => {
// // //                     if (day && !isSelected(day) && !isToday(day)) {
// // //                       e.currentTarget.style.background = 'transparent';
// // //                     }
// // //                   }}
// // //                 >
// // //                   {day || ''}
// // //                 </button>
// // //               ))}
// // //             </div>
            
// // //             <div style={{ 
// // //               padding: '8px', 
// // //               borderTop: '1px solid #eef2f6',
// // //               textAlign: 'center',
// // //               background: '#fafbfc'
// // //             }}>
// // //               <button
// // //                 type="button"
// // //                 onClick={goToToday}
// // //                 style={{
// // //                   background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
// // //                   border: 'none',
// // //                   borderRadius: '20px',
// // //                   padding: '6px 24px',
// // //                   color: 'white',
// // //                   fontSize: '13px',
// // //                   cursor: 'pointer',
// // //                   transition: 'all 0.3s ease',
// // //                   boxShadow: '0 2px 10px rgba(30, 60, 114, 0.3)'
// // //                 }}
// // //                 onMouseEnter={(e) => {
// // //                   e.currentTarget.style.transform = 'scale(1.05)';
// // //                   e.currentTarget.style.boxShadow = '0 4px 20px rgba(30, 60, 114, 0.4)';
// // //                 }}
// // //                 onMouseLeave={(e) => {
// // //                   e.currentTarget.style.transform = 'scale(1)';
// // //                   e.currentTarget.style.boxShadow = '0 2px 10px rgba(30, 60, 114, 0.3)';
// // //                 }}
// // //               >
// // //                 امروز
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default JalaliDatePicker;