import { Stack } from "expo-router";

export default function RootLayout() {
  return (
  <Stack>
    <Stack.Screen name="index" options={{ title: 'Map' }} />
    <Stack.Screen
        name="marker/[id]"
        options={{
          title: 'About',
          headerShown: false // Это скроет заголовок для данного экрана
        }}
      />
  </Stack>
);
}
