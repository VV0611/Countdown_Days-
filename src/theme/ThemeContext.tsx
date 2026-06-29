import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { lightColors, darkColors, ThemeColors } from './colors';
import { useSettingsStore } from '../store/settingsStore';

interface ThemeContextValue {
  isDark: boolean;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({ isDark: false, colors: lightColors });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { colorScheme } = useSettingsStore();
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDark =
    colorScheme === 'dark' ? true :
    colorScheme === 'light' ? false :
    systemDark;

  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    document.documentElement.style.setProperty('--bg', colors.background);
    document.documentElement.style.setProperty('--surface', colors.surface);
    document.documentElement.style.setProperty('--text', colors.text);
    document.body.style.backgroundColor = colors.background;
    document.body.style.color = colors.text;
  }, [colors]);

  return (
    <ThemeContext.Provider value={{ isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
