import dayjs from 'dayjs';
import { Language } from '../i18n/translations';

// Returns positive = days remaining, negative = days past, 0 = today
export function daysFromToday(targetDate: string): number {
  const today = dayjs().startOf('day');
  const target = dayjs(targetDate).startOf('day');
  return target.diff(today, 'day');
}

export function formatDisplayDate(dateStr: string, language: Language): string {
  return language === 'zh'
    ? dayjs(dateStr).format('YYYY年M月D日')
    : dayjs(dateStr).format('MMM D, YYYY');
}

// Sort key: distance from today (ascending), 0 = today
export function sortKey(targetDate: string): number {
  return Math.abs(daysFromToday(targetDate));
}
