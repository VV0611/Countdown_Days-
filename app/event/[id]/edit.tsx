import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEventStore } from '../../../src/store/eventStore';
import EventForm from '../../../src/components/EventForm';
import { CountdownEvent } from '../../../src/types';
import { useT } from '../../../src/i18n/useT';

type FormData = Omit<CountdownEvent, 'id' | 'createdAt'>;

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { events, update, remove } = useEventStore();
  const event = events.find((e) => e.id === id);
  const { t } = useT();

  if (!event) {
    return (
      <>
        <Stack.Screen options={{ title: t('editEventTitle') }} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>{t('eventNotFound')}</Text>
        </View>
      </>
    );
  }

  function handleSubmit(data: FormData) {
    update(id, data);
    router.replace('/');
  }

  function handleDelete() {
    remove(id);
    router.replace('/');
  }

  return (
    <>
      <Stack.Screen options={{ title: t('editEventTitle') }} />
      <EventForm
        initialData={event}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: '#9CA3AF', fontSize: 15 },
});
