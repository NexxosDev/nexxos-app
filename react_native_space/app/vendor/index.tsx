import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, Pressable, RefreshControl, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getVendorDashboard, updateVendorAvailability } from '../../src/services/vendor';
import { useAuth } from '../../src/contexts/AuthContext';
import { Colors, Spacing, BorderRadius } from '../../src/theme/colors';
import MetricCard from '../../src/components/MetricCard';
import RequestCard from '../../src/components/RequestCard';
import StarRating from '../../src/components/StarRating';
import EmptyState from '../../src/components/EmptyState';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import type { VendorDashboard } from '../../src/types';

/** Format milliseconds to human-readable time string */
function formatDuration(ms: number): string {
  if (ms < 0) return '0s';
  const totalSec = Math.floor(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const totalMin = Math.floor(totalSec / 60);
  if (totalMin < 60) return `${totalMin}min`;
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours < 24) return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remH = hours % 24;
  return remH > 0 ? `${days}d ${remH}h` : `${days}d`;
}

/** Build the time label + color for a vendor match item */
function getTimeInfo(item: VendorDashboard['recentRequests'][number]): { label: string; color: string } {
  const delivered = item?.deliveredAt ? new Date(item.deliveredAt).getTime() : 0;
  const now = Date.now();

  switch (item?.status) {
    case 'PENDING': {
      if (!delivered) return { label: 'Pendiente', color: '#F57C00' };
      const elapsed = now - delivered;
      return { label: `⏳ Sin responder · ${formatDuration(elapsed)}`, color: '#F57C00' };
    }
    case 'RESPONDED': {
      const responded = item?.respondedAt ? new Date(item.respondedAt).getTime() : 0;
      if (!delivered || !responded) return { label: '✅ Respondida', color: Colors.success };
      const delta = responded - delivered;
      return { label: `✅ Respondida en ${formatDuration(delta)}`, color: Colors.success };
    }
    case 'DECLINED': {
      const declined = item?.declinedAt ? new Date(item.declinedAt).getTime() : 0;
      if (!delivered || !declined) return { label: '✖ Declinada', color: Colors.error };
      const delta = declined - delivered;
      return { label: `✖ Declinada en ${formatDuration(delta)}`, color: Colors.error };
    }
    case 'CERRADA': {
      if (item?.responded && item?.respondedAt && delivered) {
        const delta = new Date(item.respondedAt).getTime() - delivered;
        return { label: `🔒 Cerrada · Respondida en ${formatDuration(delta)}`, color: Colors.textSecondary };
      }
      if (item?.declined && item?.declinedAt && delivered) {
        const delta = new Date(item.declinedAt).getTime() - delivered;
        return { label: `🔒 Cerrada · Declinada en ${formatDuration(delta)}`, color: Colors.textSecondary };
      }
      return { label: '🔒 Cerrada · No respondida', color: Colors.textSecondary };
    }
    default:
      return { label: '', color: Colors.textSecondary };
  }
}

export default function VendorHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<VendorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await getVendorDashboard();
      setDashboard(data ?? null);
    } catch { }
    if (isRefresh) setRefreshing(false); else setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const handleToggle = async (val: boolean) => {
    setToggling(true);
    try {
      await updateVendorAvailability(val);
      setDashboard((prev) => prev ? { ...prev, isAvailable: val } : prev);
    } catch { }
    setToggling(false);
  };

  if (loading) return <LoadingSpinner />;

  const metrics = dashboard?.metrics;
  const reqs = dashboard?.recentRequests ?? [];

  const renderHeader = () => (
    <View>
      <View style={styles.topBar}>
        <Text style={styles.logo}>NEXXOS</Text>
        <Pressable onPress={() => router.replace('/role-selection')} hitSlop={8}>
          <Ionicons name="swap-horizontal-outline" size={24} color={Colors.textPrimary} />
        </Pressable>
      </View>

      {!user?.emailVerified && (
        <Pressable style={styles.verifyBanner} onPress={() => router.push('/verify-email')}>
          <Ionicons name="warning-outline" size={20} color="#856404" />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={styles.verifyBannerTitle}>Verifica tu correo electrónico</Text>
            <Text style={styles.verifyBannerText}>
              No podrás responder solicitudes hasta que verifiques tu correo.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#856404" />
        </Pressable>
      )}

      <Text style={styles.greeting}>¡Hola, {dashboard?.businessName ?? 'Vendedor'}!</Text>

      <View style={styles.availRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.availLabel}>Disponible para recibir solicitudes</Text>
        </View>
        <Switch
          value={dashboard?.isAvailable ?? false}
          onValueChange={handleToggle}
          disabled={toggling}
          trackColor={{ false: Colors.border, true: Colors.success }}
          thumbColor={Colors.white}
        />
      </View>

      <View style={styles.metricsRow}>
        <MetricCard label="Recibidas" value={metrics?.totalRequestsReceived ?? 0} icon="mail-outline" />
        <View style={{ width: Spacing.sm }} />
        <MetricCard label="Respondidas" value={metrics?.totalRequestsAnswered ?? 0} icon="checkmark-circle-outline" color={Colors.success} />
      </View>

      {typeof metrics?.avgRating === 'number' ? (
        <View style={styles.ratingContainer}>
          <StarRating rating={Math.round(metrics.avgRating)} readonly size={20} />
          <Text style={styles.ratingText}>{metrics?.avgRating?.toFixed?.(1) ?? '0'} ({metrics?.totalRatings ?? 0} calificaciones)</Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Solicitudes Recientes</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={reqs}
        keyExtractor={(item) => item?.matchId ?? ''}
        renderItem={({ item }) => {
          const timeInfo = getTimeInfo(item);
          return (
            <RequestCard
              vehicleBrand={item?.request?.vehicleBrand ?? ''}
              vehicleModel={item?.request?.vehicleModel ?? ''}
              partCategory={item?.request?.partCategory ?? ''}
              status={item?.status ?? ''}
              municipality={item?.request?.municipality}
              state={item?.request?.state}
              createdAt={item?.request?.createdAt ?? ''}
              timeLabel={timeInfo?.label}
              timeLabelColor={timeInfo?.color}
              onPress={() => router.push(`/vendor-request-detail?matchId=${item?.matchId ?? ''}`)}
            />
          );
        }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<EmptyState icon="mail-outline" title="Sin solicitudes" message="Aún no has recibido solicitudes" />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={Colors.primary} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md, paddingBottom: 100 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  logo: { fontSize: 22, fontWeight: '800', color: Colors.primary, letterSpacing: 2 },
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  verifyBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 2,
  },
  verifyBannerText: {
    fontSize: 13,
    color: '#856404',
  },
  greeting: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  availRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  availLabel: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  metricsRow: { flexDirection: 'row', marginBottom: Spacing.md },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  ratingText: { fontSize: 14, color: Colors.textSecondary },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.md },
});
