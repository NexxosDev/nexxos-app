import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';
import Button from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon = 'document-text-outline', title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.iconBg}>
        <Ionicons name={icon} size={48} color={colors.textSecondary} />
      </View>
      <Text style={styles.title}>{title ?? ''}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} style={styles.btn} />
      ) : null}
    </View>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.lg },
  iconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: c.backgroundSection, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  title: { fontSize: 17, fontWeight: '600', color: c.textPrimary, textAlign: 'center', marginBottom: Spacing.xs },
  message: { fontSize: 14, color: c.textSecondary, textAlign: 'center', lineHeight: 20 },
  btn: { marginTop: Spacing.md },
});
