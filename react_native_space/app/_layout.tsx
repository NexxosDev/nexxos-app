import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../src/contexts/AuthContext';
import { CatalogProvider } from '../src/contexts/CatalogContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 1500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AuthProvider>
            <CatalogProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="role-selection" options={{ gestureEnabled: false }} />
                <Stack.Screen name="client" options={{ gestureEnabled: false }} />
                <Stack.Screen name="vendor" options={{ gestureEnabled: false }} />
                <Stack.Screen name="create-request" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="request-detail" />
                <Stack.Screen name="vendor-request-detail" />
                <Stack.Screen name="chat" />
                <Stack.Screen name="edit-profile" />
                <Stack.Screen name="vendor-edit-profile" />
                <Stack.Screen name="+not-found" />
              </Stack>
            </CatalogProvider>
          </AuthProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
