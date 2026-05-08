import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
}

export default function MetricCard({ label, value, icon, color }: MetricCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const c = color ?? colors.primary;

  return (
    <View style={styles.card}>
      <View style={[styles.iconBg, { backgroundColor: `${c}20` }]}>
        <Ionicons name={icon} size={24} color={c} />
      </View>
      <Text style={styles.value}>{value ?? 0}</Text>
      <Text style={styles.label} numberOfLines={2}>{label ?? ''}</Text>
    </View>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: c.cardBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
      android: { elevation: 1 },
      default: {},
    }),
  },
  iconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  value: { fontSize: 24, fontWeight: '700', color: c.textPrimary, marginBottom: 2 },
  label: { fontSize: 12, color: c.textSecondary, textAlign: 'center' },
});
