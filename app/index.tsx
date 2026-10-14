import React, { useMemo } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEventStore } from '../src/store/eventStore';
import EventCard from '../src/components/EventCard';
import EmptyState from '../src/components/EmptyState';
import { sortKey } from '../src/utils/dateUtils';
import { useT } from '../src/i18n/useT';
import { webMaxWidth } from '../src/utils/webStyle';

export default function HomeScreen() {
  const router = useRouter();
  const { events, togglePin } = useEventStore();
  const { t } = useT();

  const sorted = useMemo(() => {
    const pinned = events.filter((e) => e.pinned).sort((a, b) => sortKey(a.targetDate) - sortKey(b.targetDate));
    const rest = events.filter((e) => !e.pinned).sort((a, b) => sortKey(a.targetDate) - sortKey(b.targetDate));
    return [...pinned, ...rest];
  }, [events]);

  return (
    <>
      <Stack.Screen
        options={{
          title: t('appName'),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => router.push('/settings')} style={styles.headerBtn}>
                <Ionicons name="settings-outline" size={22} color="#5B8DEF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/event/new')} style={styles.headerBtn}>
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
});
