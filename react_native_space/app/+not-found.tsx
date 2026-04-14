import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '../src/theme/colors';
import Button from '../src/components/Button';

export default function NotFound() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>P\u00e1gina no encontrada</Text>
      <Button title="Ir al inicio" onPress={() => router.replace('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg, backgroundColor: Colors.background },
  code: { fontSize: 48, fontWeight: '800', color: Colors.primary, marginBottom: Spacing.sm },
  title: { fontSize: 18, color: Colors.textSecondary, marginBottom: Spacing.lg },
});
