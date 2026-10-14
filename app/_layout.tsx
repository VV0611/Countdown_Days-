import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#F9FAFB' },
        headerShadowVisible: false,
        headerTintColor: '#111',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#F9FAFB' },
      }}
    />
  );
}
