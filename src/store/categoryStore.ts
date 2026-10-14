import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TranslationKey } from '../i18n/translations';

export function categoryLabel(category: EventCategory, t: (key: TranslationKey) => string): string {
  return category.labelKey ? t(category.labelKey) : category.label ?? '';
}

export interface EventCategory {
  id: string;
  label?: string; // user-created categories
  labelKey?: TranslationKey; // built-in categories, translated via useT()
  color: string;
  isDefault?: boolean;
}

const DEFAULT_CATEGORIES: EventCategory[] = [
  { id: 'anniversary', labelKey: 'categoryAnniversary', color: '#F472B6', isDefault: true },
  { id: 'work', labelKey: 'categoryWork', color: '#60A5FA', isDefault: true },
  { id: 'life', labelKey: 'categoryLife', color: '#34D399', isDefault: true },
];

function generateId(): string {
  return 'cat_' + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface CategoryStore {
  categories: EventCategory[];
  addCategory: (label: string, color: string) => void;
  updateCategory: (id: string, label: string, color: string) => void;
  removeCategory: (id: string) => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      categories: DEFAULT_CATEGORIES,

      addCategory: (label, color) =>
        set((state) => ({
          categories: [...state.categories, { id: generateId(), label, color }],
        })),

      updateCategory: (id, label, color) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, label, color, labelKey: undefined } : c
          ),
        })),

      removeCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'countdown-categories',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
