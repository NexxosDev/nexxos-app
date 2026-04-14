import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../theme/colors';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Paso {currentStep ?? 1} de {totalSteps ?? 1}</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${((currentStep ?? 1) / (totalSteps ?? 1)) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  label: { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.sm, textAlign: 'center' },
  barBg: { height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
});
