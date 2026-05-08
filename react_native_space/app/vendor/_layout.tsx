import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function VendorLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const bottomPad = Math.max(insets?.bottom ?? 0, Platform.OS === 'android' ? 12 : 8);

  const tabBarStyle = useMemo(() => ({
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 56 + bottomPad,
    paddingBottom: bottomPad,
    paddingTop: 4,
  }), [colors, bottomPad]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="requests" options={{ title: 'Solicitudes', tabBarIcon: ({ color, size }) => <Ionicons name="mail-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
