import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ClientLevelBadgeProps {
  level?: string;
  emoji?: string;
  label?: string;
  size?: 'small' | 'medium';
  style?: StyleProp<ViewStyle>;
}

const LEVEL_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  EXPLORADOR: { bg: 'rgba(33,150,243,0.12)', border: 'rgba(33,150,243,0.3)', text: '#2196F3' },
  RODANTE: { bg: 'rgba(76,175,80,0.12)', border: 'rgba(76,175,80,0.3)', text: '#4CAF50' },
  AFINADOR: { bg: 'rgba(255,193,7,0.14)', border: 'rgba(255,193,7,0.4)', text: '#F9A825' },
  MAESTRO: { bg: 'rgba(156,39,176,0.12)', border: 'rgba(156,39,176,0.3)', text: '#9C27B0' },
};

export default function ClientLevelBadge({ level, emoji, label, size = 'small', style }: ClientLevelBadgeProps) {
  const { isDark } = useTheme();
  const lvl = level ?? 'EXPLORADOR';
  const colorSet = LEVEL_COLORS[lvl] ?? LEVEL_COLORS.EXPLORADOR;
  const isSmall = size === 'small';

  return (
    <View style={[
      styles.badge,
      {
        backgroundColor: isDark ? colorSet.bg : colorSet.bg,
        borderColor: colorSet.border,
        paddingHorizontal: isSmall ? 6 : 10,
        paddingVertical: isSmall ? 2 : 4,
      },
      style,
    ]}>
      <Text style={[styles.emoji, { fontSize: isSmall ? 10 : 13 }]}>{emoji ?? '🧭'}</Text>
      <Text style={[
        styles.label,
        { color: colorSet.text, fontSize: isSmall ? 10 : 12 },
      ]}>
        {label ?? 'Explorador'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    gap: 3,
    alignSelf: 'flex-start',
  },
  emoji: {
    lineHeight: 16,
  },
  label: {
    fontWeight: '600',
  },
});
