import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEventStore } from '../src/store/eventStore';
import EventCard from '../src/components/EventCard';
import EmptyState from '../src/components/EmptyState';
import { sortKey } from '../src/utils/dateUtils';
import { useT } from '../src/i18n/useT';
import { webMaxWidth } from '../src/utils/webStyle';
import { useCategoryStore, categoryLabel } from '../src/store/categoryStore';

export default function HomeScreen() {
  const router = useRouter();
  const { events, togglePin } = useEventStore();
  const { categories } = useCategoryStore();
  const { t } = useT();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const filtered = activeCategoryId
      ? events.filter((e) => e.categoryId === activeCategoryId)
      : events;
    const pinned = filtered.filter((e) => e.pinned).sort((a, b) => sortKey(a.targetDate) - sortKey(b.targetDate));
    const rest = filtered.filter((e) => !e.pinned).sort((a, b) => sortKey(a.targetDate) - sortKey(b.targetDate));
    return [...pinned, ...rest];
  }, [events, activeCategoryId]);

  return (
    <>
      <Stack.Screen
        options={{
          title: t('appName'),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => router.push('/settings')} style={styles.headerBtn} accessibilityLabel="settings">
                <Ionicons name="settings-outline" size={22} color="#5B8DEF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/event/new')} style={styles.headerBtn} accessibilityLabel="add-event">
                <Ionicons name="add" size={28} color="#5B8DEF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <View style={styles.container}>
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => router.push(`/event/${item.id}`)}
              onPinPress={() => togglePin(item.id)}
            />
          )}
          ListHeaderComponent={events.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterRow}
              contentContainerStyle={styles.filterRowContent}
            >
              <TouchableOpacity
                style={[styles.filterChip, !activeCategoryId && styles.filterChipActive]}
                onPress={() => setActiveCategoryId(null)}
              >
                <Text style={[styles.filterChipText, !activeCategoryId && styles.filterChipTextActive]}>
                  {t('categoryAll')}
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => {
                const active = activeCategoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.filterChip, active && { backgroundColor: cat.color }]}
                    onPress={() => setActiveCategoryId(active ? null : cat.id)}
                  >
                    <View style={[styles.filterDot, { backgroundColor: active ? '#fff' : cat.color }]} />
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {categoryLabel(cat, t)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : null}
          ListEmptyComponent={<EmptyState />}
          contentContainerStyle={[sorted.length === 0 ? styles.emptyList : styles.list, webMaxWidth]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 32 },
  emptyList: { flex: 1, padding: 16 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerBtn: { marginRight: 4, padding: 4 },
  filterRow: { marginBottom: 14, marginHorizontal: -16 },
  filterRowContent: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: { backgroundColor: '#111827', borderColor: '#111827' },
  filterDot: { width: 7, height: 7, borderRadius: 3.5 },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  filterChipTextActive: { color: '#fff' },
});
