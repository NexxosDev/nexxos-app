import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/contexts/ThemeContext';
import { Spacing } from '../src/theme/colors';
import type { ThemeColors } from '../src/theme/colors';
import Button from '../src/components/Button';

export default function NotFound() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Página no encontrada</Text>
      <Button title="Ir al inicio" onPress={() => router.replace('/')} />
    </View>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg, backgroundColor: c.background },
  code: { fontSize: 48, fontWeight: '800', color: c.primary, marginBottom: Spacing.sm },
  title: { fontSize: 18, color: c.textSecondary, marginBottom: Spacing.lg },
});
