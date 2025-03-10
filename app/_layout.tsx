import { Stack } from 'expo-router';
import { DatabaseProvider } from '../contexts/DatabaseContext';
import {  View, Text } from 'react-native';
import { useDatabase } from '../contexts/DatabaseContext';
export default function RootLayout() {
  const { isLoading } = useDatabase();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Идет инициализация базы данных...</Text>
      </View>
    );
  }
  return (
    <DatabaseProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Карта' }} />
        <Stack.Screen
          name="marker/[id]"
          options={{ headerShown: false }}
        />
      </Stack>
    </DatabaseProvider>
  );
}