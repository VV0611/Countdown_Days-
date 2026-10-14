import { useSettingsStore } from '../store/settingsStore';
import { translations, TranslationKey } from './translations';

type Vars = Record<string, string | number>;

export function useT() {
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  function t(key: TranslationKey, vars?: Vars): string {
    let str: string = translations[language][key] ?? translations.zh[key];
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  }

  return { t, language, setLanguage };
}
