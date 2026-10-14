import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useT } from '../i18n/useT';

export default function EmptyState() {
  const { t } = useT();
  return (
    <View style={styles.container}>
      <Ionicons name="calendar-outline" size={64} color="#CBD5E1" />
      <Text style={styles.heading}>{t('emptyTitle')}</Text>
      <Text style={styles.sub}>{t('emptySubtitle')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 80,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
  },
  sub: {
    fontSize: 14,
    color: '#CBD5E1',
  },
});
