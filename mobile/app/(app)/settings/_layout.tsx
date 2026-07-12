import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="account" />
      <Stack.Screen name="discovery" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="privacy-safety" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="support" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="about" />
    </Stack>
  );
}
