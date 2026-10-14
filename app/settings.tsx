import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useT } from '../src/i18n/useT';
import { Language } from '../src/i18n/translations';
import { webMaxWidth } from '../src/utils/webStyle';

const LANGUAGE_OPTIONS: { code: Language; labelKey: 'languageChinese' | 'languageEnglish' }[] = [
  { code: 'zh', labelKey: 'languageChinese' },
  { code: 'en', labelKey: 'languageEnglish' },
];

export default function SettingsScreen() {
  const { t, language, setLanguage } = useT();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: t('settingsTitle') }} />
      <View style={styles.screen}>
        <View style={[styles.content, webMaxWidth]}>
          <Text style={styles.sectionLabel}>{t('language')}</Text>
          <View style={styles.card}>
            {LANGUAGE_OPTIONS.map((option, index) => (
              <TouchableOpacity
                key={option.code}
                style={[styles.row, index > 0 && styles.rowDivider]}
                onPress={() => setLanguage(option.code)}
              >
                <Text style={styles.rowText}>{t(option.labelKey)}</Text>
                {language === option.code && (
                  <Ionicons name="checkmark" size={20} color="#5B8DEF" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionLabel, styles.sectionSpacing]}>{t('categoriesTitle')}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={() => router.push('/categories')}>
              <Text style={styles.rowText}>{t('manageCategories')}</Text>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionSpacing: { marginTop: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F3F4F6',
  },
  rowText: { fontSize: 16, color: '#111' },
});
