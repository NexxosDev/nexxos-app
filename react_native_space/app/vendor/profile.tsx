import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, RefreshControl, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { getVendorProfile } from '../../src/services/vendor';
import { Colors, Spacing, BorderRadius } from '../../src/theme/colors';
import Button from '../../src/components/Button';
import StarRating from '../../src/components/StarRating';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import type { VendorProfile as VPType } from '../../src/types';

export default function VendorProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<VPType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await getVendorProfile();
      setProfile(data ?? null);
    } catch { }
    if (isRefresh) setRefreshing(false); else setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { fetchProfile(); }, [fetchProfile]));

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar Sesión', style: 'destructive', onPress: async () => { await logout(); router.replace('/auth/login'); } },
    ]);
  };

  if (loading) return <LoadingSpinner />;

  const brandsGrouped = (profile?.vehicleModels ?? []).reduce<Record<string, string[]>>((acc, m) => {
    const brandName = m?.brand?.name ?? 'Otro';
    if (!acc[brandName]) acc[brandName] = [];
    acc[brandName]?.push?.(m?.name ?? '');
    return acc;
  }, {});

  const catsGrouped = (profile?.partSubcategories ?? []).reduce<Record<string, string[]>>((acc, s) => {
    const catName = s?.category?.name ?? 'Otro';
    if (!acc[catName]) acc[catName] = [];
    acc[catName]?.push?.(s?.name ?? '');
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchProfile(true)} tintColor={Colors.primary} />}>
        <View style={styles.header}>
          {profile?.logoUrl ? (
            <Image source={{ uri: profile.logoUrl }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Ionicons name="storefront" size={32} color={Colors.primary} />
            </View>
          )}
          <Text style={styles.businessName}>{profile?.businessName ?? ''}</Text>
          <Text style={styles.rif}>RIF: {profile?.rif ?? ''}</Text>
          {typeof profile?.metrics?.avgRating === 'number' ? (
            <View style={styles.ratingRow}>
              <StarRating rating={Math.round(profile.metrics.avgRating)} readonly size={18} />
              <Text style={styles.ratingText}>({profile?.metrics?.totalRatings ?? 0})</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <Text style={styles.sectionValue}>{profile?.municipality?.name ?? ''}, {profile?.state?.name ?? ''}</Text>
          <Text style={styles.sectionValue}>Radio: {profile?.searchRadiusKm ?? 0} km</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehículos</Text>
          {Object.entries(brandsGrouped).map(([brand, models]) => (
            <View key={brand} style={styles.chipGroup}>
              <Text style={styles.chipGroupTitle}>{brand}</Text>
              <View style={styles.chipRow}>
                {(models ?? []).map((m, i) => <View key={i} style={styles.chip}><Text style={styles.chipText}>{m}</Text></View>)}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          {Object.entries(catsGrouped).map(([cat, subs]) => (
            <View key={cat} style={styles.chipGroup}>
              <Text style={styles.chipGroupTitle}>{cat}</Text>
              <View style={styles.chipRow}>
                {(subs ?? []).map((s, i) => <View key={i} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>)}
              </View>
            </View>
          ))}
        </View>

        <Button title="Editar Perfil" variant="secondary" onPress={() => router.push('/vendor-edit-profile')} style={styles.btn} />
        <Button title="Cambiar Modo" variant="ghost" onPress={() => router.replace('/role-selection')} icon={<Ionicons name="swap-horizontal-outline" size={18} color={Colors.textSecondary} />} />
        <Button title="Cerrar Sesión" variant="destructive" onPress={handleLogout} style={styles.btn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg },
  header: { alignItems: 'center', marginBottom: Spacing.lg },
  logo: { width: 72, height: 72, borderRadius: 36, marginBottom: Spacing.sm },
  logoPlaceholder: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm,
  },
  businessName: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  rif: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
  ratingText: { fontSize: 13, color: Colors.textSecondary },
  section: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.sm },
  sectionValue: { fontSize: 14, color: Colors.textSubtitle, marginBottom: 4 },
  chipGroup: { marginBottom: Spacing.sm },
  chipGroupTitle: { fontSize: 13, fontWeight: '600', color: Colors.textSubtitle, marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, backgroundColor: Colors.chipBg },
  chipText: { fontSize: 12, color: Colors.textSubtitle },
  btn: { marginBottom: Spacing.sm },
});
