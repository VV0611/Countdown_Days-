export type EventType = 'countdown' | 'countup';
export type RepeatType = 'none' | 'yearly' | 'monthly';

export interface CountdownEvent {
  id: string;
  title: string;
  targetDate: string; // ISO date string YYYY-MM-DD
  type: EventType;
  repeat: RepeatType;
  isLunar: boolean;
  pinned: boolean;
  categoryId?: string;
  themeColor: string;
  coverImage?: string;
  note?: string;
  createdAt: string;
}

export const THEME_COLORS = [
  '#5B8DEF', // blue
  '#F87171', // red
  '#34D399', // green
  '#FBBF24', // amber
  '#A78BFA', // purple
  '#F472B6', // pink
  '#FB923C', // orange
  '#2DD4BF', // teal
];

export const DEFAULT_COLOR = THEME_COLORS[0];
