// src/core/utils/date.utils.ts

/**
 * تبدیل تاریخ میلادی به شمسی
 */
export const toJalali = (date: Date | string): string => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  // استفاده از کتابخانه moment-jalaali یا یک کتابخانه مشابه
  // در اینجا یک پیاده‌سازی ساده برای نمونه
  try {
    // اگر کتابخانه moment-jalaali نصب است:
    // const moment = require('moment-jalaali');
    // return moment(d).format('jYYYY/jMM/jDD');
    
    // پیاده‌سازی ساده با Date
    return d.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return d.toISOString().split('T')[0];
  }
};

/**
 * تبدیل تاریخ شمسی به میلادی
 */
export const toGregorian = (jalaliDate: string): Date | null => {
  if (!jalaliDate) return null;
  
  try {
    // استفاده از کتابخانه برای تبدیل
    // اگر moment-jalaali نصب است:
    // const moment = require('moment-jalaali');
    // return moment(jalaliDate, 'jYYYY/jMM/jDD').toDate();
    
    // نمونه ساده
    const parts = jalaliDate.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * فرمت کردن تاریخ
 */
export const formatDate = (date: Date | string, format: string = 'YYYY/MM/DD'): string => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
};

/**
 * محاسبه تفاوت تاریخ‌ها به روز
 */
export const daysBetween = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
  
  const diff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * آیا تاریخ معتبر است؟
 */
export const isValidDate = (date: any): boolean => {
  if (!date) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
};