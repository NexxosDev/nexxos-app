import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { BorderRadius } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';

interface BadgeProps {
  status: string;
  size?: 'small' | 'normal';
}

function getStatusConfig(c: ThemeColors): Record<string, { bg: string; text: string; label: string }> {
  return {
    ABIERTA: { bg: c.statusOpen, text: c.white, label: 'Abierta' },
    EN_PROCESO: { bg: c.statusInProgress, text: c.accent, label: 'En Proceso' },
    CERRADA: { bg: c.statusClosed, text: c.textSecondary, label: 'Cerrada' },
    PENDING: { bg: c.statusPending, text: c.white, label: 'Pendiente' },
    RESPONDED: { bg: c.statusResponded, text: c.white, label: 'Respondida' },
    DECLINED: { bg: c.statusDeclined, text: c.white, label: 'Declinada' },
  };
}

export default function Badge({ status, size = 'normal' }: BadgeProps) {
  const { colors } = useTheme();
  const configMap = useMemo(() => getStatusConfig(colors), [colors]);
  const config = configMap?.[status] ?? { bg: colors.border, text: colors.textSecondary, label: status ?? '' };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, size === 'small' && styles.small]}>
      <Text style={[styles.text, { color: config.text }, size === 'small' && styles.smallText]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  small: { paddingHorizontal: 8, paddingVertical: 2 },
  text: { fontSize: 12, fontWeight: '600' },
  smallText: { fontSize: 10 },
});
