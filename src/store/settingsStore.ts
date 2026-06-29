import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ColorSchemeOption = 'light' | 'dark' | 'system';

interface SettingsState {
  colorScheme: ColorSchemeOption;
  setColorScheme: (scheme: ColorSchemeOption) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      colorScheme: 'system',
      setColorScheme: (colorScheme) => set({ colorScheme }),
    }),
    { name: 'app-settings' }
  )
);
