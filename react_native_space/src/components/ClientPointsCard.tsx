import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';
import type { ClientPointsSummary } from '../types';
import { getClientPoints } from '../services/requests';
import ClientLevelBadge from './ClientLevelBadge';

export default function ClientPointsCard() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [data, setData] = useState<ClientPointsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getClientPoints();
        if (!cancelled) setData(res ?? null);
      } catch { }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []));

  if (loading) return (
    <View style={styles.card}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );

  if (!data) return null;

  const total = data?.totalPoints ?? 0;
  const current = data?.currentLevel;
  const next = data?.nextLevel;
  const progressPct = next
    ? Math.min(100, ((total - ((next?.pointsRequired ?? 0) - (next?.pointsRemaining ?? 0) - total + total)) / (next?.pointsRequired ?? 1)) * 100)
    : 100;

  // Compute progress more accurately
  const currentThreshold = (next?.pointsRequired ?? 0) - (next?.pointsRemaining ?? 0);
  const nextThreshold = next?.pointsRequired ?? total;
  const range = nextThreshold - currentThreshold;
  const progress = range > 0 ? Math.min(100, Math.max(0, ((total - currentThreshold) / range) * 100)) : 100;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.emoji}>{current?.emoji ?? '🧭'}</Text>
          <View>
            <Text style={styles.levelLabel}>Nivel de Cliente</Text>
            <Text style={styles.levelName}>{current?.label ?? 'Explorador'}</Text>
          </View>
        </View>
        <View style={styles.pointsBadge}>
          <Ionicons name="star" size={14} color={colors.primary} />
          <Text style={styles.pointsText}>{total} pts</Text>
        </View>
      </View>

      {/* Progress bar */}
      {next ? (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {next.pointsRemaining} pts para {next.emoji} {next.label}
          </Text>
        </View>
      ) : (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressLabel}>¡Nivel máximo alcanzado! 🎉</Text>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="star-outline" size={16} color={colors.primary} />
          <Text style={styles.statValue}>{data?.stats?.totalRatings ?? 0}</Text>
          <Text style={styles.statLabel}>Calificaciones</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="document-text-outline" size={16} color={colors.primary} />
          <Text style={styles.statValue}>{data?.stats?.totalRequests ?? 0}</Text>
          <Text style={styles.statLabel}>Solicitudes</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: c.cardBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: c.border,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emoji: {
    fontSize: 28,
  },
  levelLabel: {
    fontSize: 11,
    color: c.textSecondary,
    fontWeight: '500',
  },
  levelName: {
    fontSize: 17,
    fontWeight: '700',
    color: c.textPrimary,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${c.primary}18`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '700',
    color: c.primary,
  },
  progressSection: {
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: c.backgroundSection,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: c.primary,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: c.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: c.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: c.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: c.border,
  },
});
