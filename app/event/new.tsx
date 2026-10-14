import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { useEventStore } from '../../src/store/eventStore';
import EventForm from '../../src/components/EventForm';
import { CountdownEvent } from '../../src/types';
import { useT } from '../../src/i18n/useT';

type FormData = Omit<CountdownEvent, 'id' | 'createdAt'>;

export default function NewEventScreen() {
  const router = useRouter();
  const add = useEventStore((s) => s.add);
  const { t } = useT();

  function handleSubmit(data: FormData) {
    add(data);
    router.replace('/');
  }

  return (
    <>
      <Stack.Screen options={{ title: t('newEventTitle') }} />
      <EventForm onSubmit={handleSubmit} />
    </>
  );
}
