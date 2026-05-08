import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Paso {currentStep ?? 1} de {totalSteps ?? 1}</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${((currentStep ?? 1) / (totalSteps ?? 1)) * 100}%` }]} />
      </View>
    </View>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  label: { fontSize: 13, color: c.textSecondary, marginBottom: Spacing.sm, textAlign: 'center' },
  barBg: { height: 4, backgroundColor: c.border, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: c.primary, borderRadius: 2 },
});
