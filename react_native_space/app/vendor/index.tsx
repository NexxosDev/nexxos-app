import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, Pressable, RefreshControl, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getVendorDashboard, updateVendorAvailability } from '../../src/services/vendor';
import { Colors, Spacing, BorderRadius } from '../../src/theme/colors';
import MetricCard from '../../src/components/MetricCard';
import RequestCard from '../../src/components/RequestCard';
import StarRating from '../../src/components/StarRating';
import EmptyState from '../../src/components/EmptyState';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import type { VendorDashboard } from '../../src/types';

export default function VendorHome() {
  const router = useRouter();
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
        renderItem={({ item }) => (
          <RequestCard
            vehicleBrand={item?.request?.vehicleBrand ?? ''}
            vehicleModel={item?.request?.vehicleModel ?? ''}
            partCategory={item?.request?.partCategory ?? ''}
            status={item?.status ?? ''}
            municipality={item?.request?.municipality}
            state={item?.request?.state}
            createdAt={item?.request?.createdAt ?? ''}
            onPress={() => router.push(`/vendor-request-detail?matchId=${item?.matchId ?? ''}`)}
          />
        )}
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
