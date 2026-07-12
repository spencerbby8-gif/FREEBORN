import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="about" />
      <Stack.Screen name="photos" />
      <Stack.Screen name="intent" />
      <Stack.Screen name="values" />
      <Stack.Screen name="lifestyle" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="prompts" />
      <Stack.Screen name="dealbreakers" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="account" />
      <Stack.Screen name="preview" />
    </Stack>
  );
}
