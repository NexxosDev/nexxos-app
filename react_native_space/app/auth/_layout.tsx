import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="register-type" />
      <Stack.Screen name="register-client" />
      <Stack.Screen name="register-vendor" />
    </Stack>
  );
}
