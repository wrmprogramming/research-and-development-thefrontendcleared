// src/utils/dateUtils.ts
// import { 
//   jalaliToGregorian, 
//   formatJalaliDate, 
//   gregorianToJalali,
//   isValidJalaliDate,
//   getCurrentJalaliDate,
//   getCurrentGregorianDate,
//   getCurrentJalaliYear
// } from '../../utils/dateUtils';
// // مثال: تبدیل تاریخ شمسی به میلادی
// const gregorian = jalaliToGregorian('1404/5/6'); // '2025-07-27'
// // مثال: فرمت‌دهی تاریخ شمسی
// const formatted = formatJalaliDate('1404/5/6'); // '1404/05/06'
// // مثال: تبدیل میلادی به شمسی
// const jalali = gregorianToJalali('2025-07-27'); // '1404/05/06'
// // مثال: بررسی اعتبار تاریخ
// const isValid = isValidJalaliDate('1404/5/6'); // true
// // مثال: دریافت تاریخ جاری
// const today = getCurrentJalaliDate(); // '1404/06/03'

// src/utils/dateUtils.ts
import moment from 'moment-jalaali';

/**
 * تبدیل تاریخ شمسی به میلادی با فرمت YYYY-MM-DD
 * @param dateStr - تاریخ شمسی به فرمت YYYY/MM/DD یا YYYY/M/D
 * @returns تاریخ میلادی به فرمت YYYY-MM-DD یا null در صورت نامعتبر بودن
 */
export const jalaliToGregorian = (dateStr: string | null | undefined): string | null => {
  if (!dateStr) return null;
  if (dateStr === '' || dateStr === 'null' || dateStr === 'undefined') return null;
  
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
  
  try {
    const m = moment(formatted, 'jYYYY/jMM/jDD');
    if (m.isValid()) {
      return m.format('YYYY-MM-DD');
    }
    return null;
  } catch (e) {
    console.error('Error converting date:', dateStr, e);
    return null;
  }
};

/**
 * ✅ فرمت‌دهی تاریخ شمسی با صفر جلو (تبدیل 1404/6/9 -> 1404/06/09)
 * @param dateStr - تاریخ شمسی به فرمت YYYY/MM/DD یا YYYY/M/D
 * @returns تاریخ شمسی با فرمت YYYY/MM/DD یا null در صورت نامعتبر بودن
 * 
 * @example
 * formatJalaliDate('1404/6/9') // returns '1404/06/09'
 * formatJalaliDate('1404/06/09') // returns '1404/06/09'
 */
export const formatJalaliDate = (dateStr: string | null | undefined): string | null => {
  if (!dateStr) return null;
  if (dateStr === '' || dateStr === 'null' || dateStr === 'undefined') return null;
  
  // حذف کاراکترهای اضافی
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
  
  // ✅ با صفر جلو
  return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
};


/**
 * تبدیل تاریخ میلادی به شمسی
 */
export const gregorianToJalali = (dateStr: string | null | undefined): string | null => {
  if (!dateStr) return null;
  if (dateStr === '' || dateStr === 'null' || dateStr === 'undefined') return null;
  
  try {
    const m = moment(dateStr, 'YYYY-MM-DD');
    if (m.isValid()) {
      return m.format('jYYYY/jMM/jDD');
    }
    return null;
  } catch (e) {
    console.error('Error converting date:', dateStr, e);
    return null;
  }
};

/**
 * بررسی معتبر بودن تاریخ شمسی
 */
export const isValidJalaliDate = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return false;
  const formatted = formatJalaliDate(dateStr);
  if (!formatted) return false;
  
  try {
    const m = moment(formatted, 'jYYYY/jMM/jDD');
    return m.isValid();
  } catch {
    return false;
  }
};

/**
 * دریافت تاریخ جاری شمسی
 */
export const getCurrentJalaliDate = (): string => {
  return moment().format('jYYYY/jMM/jDD');
};

/**
 * دریافت تاریخ جاری میلادی
 */
export const getCurrentGregorianDate = (): string => {
  return moment().format('YYYY-MM-DD');
};

/**
 * دریافت سال جاری شمسی
 */
export const getCurrentJalaliYear = (): number => {
  return moment().jYear();
};

export default {
  jalaliToGregorian,
  formatJalaliDate,
  gregorianToJalali,
  isValidJalaliDate,
  getCurrentJalaliDate,
  getCurrentGregorianDate,
  getCurrentJalaliYear,
};
