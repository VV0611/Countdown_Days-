import dayjs from 'dayjs';

export function daysFromToday(targetDate: string): number {
  const today = dayjs().startOf('day');
  const target = dayjs(targetDate).startOf('day');
  return target.diff(today, 'day');
}

export function getDayLabel(event: { type: 'countdown' | 'countup'; targetDate: string }): string {
  const diff = daysFromToday(event.targetDate);
  if (diff === 0) return 'Today';
  if (event.type === 'countdown') {
    return diff > 0 ? `${diff} days left` : `${Math.abs(diff)} days ago`;
  } else {
    return diff < 0 ? `${Math.abs(diff)} days since` : `${diff} days until`;
  }
}

export function formatDisplayDate(dateStr: string): string {
  return dayjs(dateStr).format('MMM D, YYYY');
}

export function sortKey(targetDate: string): number {
  return Math.abs(daysFromToday(targetDate));
}
