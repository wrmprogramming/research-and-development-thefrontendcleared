// src/core/utils/formatter.utils.ts

/**
 * تبدیل اعداد به فارسی
 */
export const toPersianNumber = (num: number | string): string => {
  if (num === undefined || num === null) return '';
  
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

/**
 * تبدیل اعداد فارسی به انگلیسی
 */
export const toEnglishNumber = (str: string): string => {
  if (!str) return '';
  
  const persianDigits: Record<string, string> = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
  };
  
  return str.replace(/[۰-۹]/g, (d) => persianDigits[d] || d);
};

/**
 * فرمت کردن عدد با جداکننده هزارگان
 */
export const formatNumber = (num: number): string => {
  if (num === undefined || num === null) return '';
  return num.toLocaleString('fa-IR');
};

/**
 * فرمت کردن مبلغ به ریال
 */
export const formatCurrency = (amount: number): string => {
  if (amount === undefined || amount === null) return '۰ ریال';
  return `${formatNumber(amount)} ریال`;
};

/**
 * کوتاه کردن متن
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * تبدیل به حروف بزرگ
 */
export const toUpperCase = (str: string): string => {
  if (!str) return '';
  return str.toUpperCase();
};

/**
 * تبدیل به حروف کوچک
 */
export const toLowerCase = (str: string): string => {
  if (!str) return '';
  return str.toLowerCase();
};