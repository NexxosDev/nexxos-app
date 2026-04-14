import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../theme/colors';
import Button from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon = 'document-text-outline', title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBg}>
        <Ionicons name={icon} size={48} color={Colors.textSecondary} />
      </View>
      <Text style={styles.title}>{title ?? ''}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} style={styles.btn} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.lg },
  iconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.backgroundSection, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  title: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.xs },
  message: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  btn: { marginTop: Spacing.md },
});
