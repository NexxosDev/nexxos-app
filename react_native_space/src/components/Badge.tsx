import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '../theme/colors';

interface BadgeProps {
  status: string;
  size?: 'small' | 'normal';
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  ABIERTA: { bg: Colors.statusOpen, text: Colors.white, label: 'Abierta' },
  EN_PROCESO: { bg: Colors.statusInProgress, text: Colors.accent, label: 'En Proceso' },
  CERRADA: { bg: Colors.statusClosed, text: Colors.textSecondary, label: 'Cerrada' },
  PENDING: { bg: Colors.statusPending, text: Colors.white, label: 'Pendiente' },
  RESPONDED: { bg: Colors.statusResponded, text: Colors.white, label: 'Respondida' },
  DECLINED: { bg: Colors.statusDeclined, text: Colors.white, label: 'Declinada' },
};

export default function Badge({ status, size = 'normal' }: BadgeProps) {
  const config = STATUS_CONFIG?.[status] ?? { bg: Colors.border, text: Colors.textSecondary, label: status ?? '' };
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
