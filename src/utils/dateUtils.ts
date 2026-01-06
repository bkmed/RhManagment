import { format } from 'date-fns';
import { fr, enUS, arSA, de, es } from 'date-fns/locale';
import i18n from 'i18next';

const getLocale = () => {
  const lang = i18n.language || 'fr';
  switch (lang) {
    case 'fr':
      return fr;
    case 'en':
      return enUS;
    case 'ar':
      return arSA;
    case 'de':
      return de;
    case 'es':
      return es;
    default:
      return fr;
  }
};

/**
 * Formats a date string or Date object into a professional-looking format.
 * Example: "24 Octobre 2023" or "24 Oct 2023"
 */
export const formatDate = (date: string | Date, formatStr: string = 'PPP') => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return String(date);
    return format(d, formatStr, { locale: getLocale() });
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
};

/**
 * Formats a date string or Date object into a professional-looking datetime format.
 * Example: "24 Octobre 2023 à 14:30"
 */
export const formatDateTime = (date: string | Date) => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return String(date);
    const formatStr = i18n.language === 'fr' ? "PPP 'à' p" : "PPP 'at' p";
    return format(d, formatStr, { locale: getLocale() });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return String(date);
  }
};

/**
 * Formats a date range.
 */
export const formatDateRange = (start: string | Date, end?: string | Date) => {
  if (!end) return formatDate(start);

  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;

  if (startDate.toDateString() === endDate.toDateString()) {
    return formatDate(startDate);
  }

  return `${formatDate(startDate, 'PP')} - ${formatDate(endDate, 'PP')}`;
};
