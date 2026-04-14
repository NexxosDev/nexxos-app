import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getVendorRequests } from '../../src/services/vendor';
import { Colors, Spacing, BorderRadius } from '../../src/theme/colors';
import RequestCard from '../../src/components/RequestCard';
import EmptyState from '../../src/components/EmptyState';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import type { VendorRequestListItem } from '../../src/types';

type VFilter = 'all' | 'PENDING' | 'RESPONDED' | 'DECLINED';

export default function VendorRequests() {
  const router = useRouter();
  const [items, setItems] = useState<VendorRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<VFilter>('all');

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (filter !== 'all') params.status = filter;
      const data = await getVendorRequests(params as Parameters<typeof getVendorRequests>[0]);
      setItems(data?.items ?? []);
    } catch { }
    if (isRefresh) setRefreshing(false); else setLoading(false);
  }, [filter]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const filters: { key: VFilter; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'PENDING', label: 'Pendientes' },
    { key: 'RESPONDED', label: 'Respondidas' },
    { key: 'DECLINED', label: 'Declinadas' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Solicitudes</Text>
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Pressable key={f.key} style={[styles.filterChip, filter === f.key && styles.filterChipActive]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>
      {loading ? <LoadingSpinner /> : (
        <FlatList
          data={items ?? []}
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
          ListEmptyComponent={<EmptyState icon="mail-outline" title="Sin solicitudes" message="No hay solicitudes con este filtro" />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={Colors.primary} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.chipBg },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 13, color: Colors.textSubtitle },
  filterTextActive: { color: Colors.accent, fontWeight: '600' },
  list: { padding: Spacing.md, paddingBottom: 100 },
});
