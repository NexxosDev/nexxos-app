import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getVendorProfile, updateVendorProfile } from '../src/services/vendor';
import { getErrorMessage } from '../src/services/api';
import { useCatalog } from '../src/contexts/CatalogContext';
import { useTheme } from '../src/contexts/ThemeContext';
import type { ThemeColors } from '../src/theme/colors';
import { Spacing, BorderRadius } from '../src/theme/colors';
import Button from '../src/components/Button';
import LoadingSpinner from '../src/components/LoadingSpinner';
import VehicleAccordion from '../src/components/VehicleAccordion';
import PartsAccordion from '../src/components/PartsAccordion';
import type { VendorProfile, CatalogItem } from '../src/types';

export default function VendorEditProfileScreen() {
  const router = useRouter();
  const catalog = useCatalog();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);

  const [modelsMap, setModelsMap] = useState<Record<string, CatalogItem[]>>({});
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, CatalogItem[]>>({});

  useEffect(() => {
    catalog?.loadBrands?.();
    catalog?.loadCategories?.();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const p = await getVendorProfile();
        setProfile(p ?? null);
        const models = p?.vehicleModels ?? [];
        const brandIds = [...new Set(models.map((m) => m?.brand?.id).filter(Boolean))] as string[];
        setSelectedModels(models.map((m) => m?.id).filter(Boolean) as string[]);
        for (const brandId of brandIds) {
          const items = await catalog?.loadModels?.(brandId) ?? [];
          setModelsMap((prev) => ({ ...(prev ?? {}), [brandId]: items }));
        }
        const subs = p?.partSubcategories ?? [];
        const catIds = [...new Set(subs.map((s) => s?.category?.id).filter(Boolean))] as string[];
        setSelectedSubcategories(subs.map((s) => s?.id).filter(Boolean) as string[]);
        for (const catId of catIds) {
          const items = await catalog?.loadSubcategories?.(catId) ?? [];
          setSubcategoriesMap((prev) => ({ ...(prev ?? {}), [catId]: items }));
        }
      } catch { }
      setLoading(false);
    })();
  }, []);

  const loadModelsForBrand = useCallback(async (brandId: string) => {
    if (!modelsMap?.[brandId]) {
      const items = await catalog?.loadModels?.(brandId) ?? [];
      setModelsMap((prev) => ({ ...(prev ?? {}), [brandId]: items }));
    }
  }, [modelsMap, catalog]);

  const loadSubsForCategory = useCallback(async (catId: string) => {
    if (!subcategoriesMap?.[catId]) {
      const items = await catalog?.loadSubcategories?.(catId) ?? [];
      setSubcategoriesMap((prev) => ({ ...(prev ?? {}), [catId]: items }));
    }
  }, [subcategoriesMap, catalog]);

  const toggleModel = useCallback((modelId: string) => {
    setSelectedModels((prev) => {
      const arr = prev ?? [];
      return arr.includes(modelId) ? arr.filter((id) => id !== modelId) : [...arr, modelId];
    });
  }, []);

  const selectAllModels = useCallback((brandId: string) => {
    const brandModels = modelsMap?.[brandId] ?? [];
    const ids = brandModels.map((m) => m?.id).filter(Boolean) as string[];
    setSelectedModels((prev) => [...new Set([...(prev ?? []), ...ids])]);
  }, [modelsMap]);

  const deselectAllModels = useCallback((brandId: string) => {
    const brandModelIds = new Set((modelsMap?.[brandId] ?? []).map((m) => m?.id).filter(Boolean));
    setSelectedModels((prev) => (prev ?? []).filter((id) => !brandModelIds.has(id)));
  }, [modelsMap]);

  const toggleSubcategory = useCallback((subId: string) => {
    setSelectedSubcategories((prev) => {
      const arr = prev ?? [];
      return arr.includes(subId) ? arr.filter((id) => id !== subId) : [...arr, subId];
    });
  }, []);

  const selectAllSubs = useCallback((catId: string) => {
    const catSubs = subcategoriesMap?.[catId] ?? [];
    const ids = catSubs.map((s) => s?.id).filter(Boolean) as string[];
    setSelectedSubcategories((prev) => [...new Set([...(prev ?? []), ...ids])]);
  }, [subcategoriesMap]);

  const deselectAllSubs = useCallback((catId: string) => {
    const catSubIds = new Set((subcategoriesMap?.[catId] ?? []).map((s) => s?.id).filter(Boolean));
    setSelectedSubcategories((prev) => (prev ?? []).filter((id) => !catSubIds.has(id)));
  }, [subcategoriesMap]);

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      await updateVendorProfile({
        vehicleModelIds: selectedModels ?? [],
        partSubcategoryIds: selectedSubcategories ?? [],
      });
      setSuccess(true);
      setTimeout(() => router.back(), 1000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const addressText = profile?.fullAddress
    || [profile?.street, profile?.parish, profile?.municipality, profile?.state, profile?.country].filter(Boolean).join(', ')
    || 'No registrada';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.topTitle}>Editar Negocio</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>Perfil actualizado \u2713</Text> : null}

          <View style={styles.readOnlySection}>
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyLabel}>Razón Social</Text>
              <Text style={styles.readOnlyValue}>{profile?.businessName ?? '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyLabel}>RIF</Text>
              <Text style={styles.readOnlyValue}>{profile?.rif ?? '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyLabel}>Ubicación</Text>
              <View style={styles.addressRow}>
                <Ionicons name="location" size={14} color={colors.primary} />
                <Text style={styles.readOnlyValueSmall}>{addressText}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionLabel}>¿Qué vehículos manejas?</Text>
          <Text style={styles.sectionDesc}>Toca una marca para ver sus modelos</Text>
          <VehicleAccordion
            brands={catalog?.brands ?? []}
            modelsMap={modelsMap ?? {}}
            selectedModels={selectedModels ?? []}
            onToggleModel={toggleModel}
            onSelectAllModels={selectAllModels}
            onDeselectAllModels={deselectAllModels}
            onExpandBrand={loadModelsForBrand}
          />

          <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>¿Qué repuestos ofreces?</Text>
          <Text style={styles.sectionDesc}>Toca una categoría para ver subcategorías</Text>
          <PartsAccordion
            categories={catalog?.categories ?? []}
            subcategoriesMap={subcategoriesMap ?? {}}
            selectedSubcategories={selectedSubcategories ?? []}
            onToggleSubcategory={toggleSubcategory}
            onSelectAllSubs={selectAllSubs}
            onDeselectAllSubs={deselectAllSubs}
            onExpandCategory={loadSubsForCategory}
          />

          <Button title="Guardar Cambios" onPress={handleSave} loading={saving} style={styles.saveBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  topTitle: { fontSize: 17, fontWeight: '600', color: c.textPrimary },
  scroll: { padding: Spacing.lg, paddingBottom: 60 },
  error: { backgroundColor: c.errorBg, color: c.error, padding: Spacing.md, borderRadius: 8, fontSize: 14, marginBottom: Spacing.md },
  success: { backgroundColor: c.successBg, color: c.success, padding: Spacing.md, borderRadius: 8, fontSize: 14, marginBottom: Spacing.md, textAlign: 'center' },
  readOnlySection: { backgroundColor: c.cardBg, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: c.border, padding: Spacing.md, marginBottom: Spacing.lg },
  readOnlyRow: { paddingVertical: 8 },
  readOnlyLabel: { fontSize: 12, color: c.textSecondary, fontWeight: '500', marginBottom: 2 },
  readOnlyValue: { fontSize: 15, color: c.textPrimary, fontWeight: '600' },
  readOnlyValueSmall: { fontSize: 13, color: c.textSubtitle, lineHeight: 18, flex: 1 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 2 },
  divider: { height: 1, backgroundColor: c.border, marginVertical: 4 },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: c.textPrimary, marginBottom: 4 },
  sectionDesc: { fontSize: 13, color: c.textSecondary, marginBottom: Spacing.sm },

  saveBtn: { marginTop: Spacing.lg },
});
