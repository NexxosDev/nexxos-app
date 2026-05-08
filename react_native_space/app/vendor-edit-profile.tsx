import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getVendorProfile, updateVendorProfile } from '../src/services/vendor';
import { getErrorMessage } from '../src/services/api';
import { useCatalog } from '../src/contexts/CatalogContext';
import { Colors, Spacing, BorderRadius } from '../src/theme/colors';
import Button from '../src/components/Button';
import LoadingSpinner from '../src/components/LoadingSpinner';
import BrandsByOrigin from '../src/components/BrandsByOrigin';
import type { VendorProfile, CatalogItem } from '../src/types';

export default function VendorEditProfileScreen() {
  const router = useRouter();
  const catalog = useCatalog();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Editable selections
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);

  const [modelsMap, setModelsMap] = useState<Record<string, CatalogItem[]>>({});
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, CatalogItem[]>>({});

  // Load catalogs on mount
  useEffect(() => {
    catalog?.loadBrands?.();
    catalog?.loadCategories?.();
  }, []);

  // Load profile and pre-populate selections
  useEffect(() => {
    (async () => {
      try {
        const p = await getVendorProfile();
        setProfile(p ?? null);

        // Pre-populate vehicle selections
        const models = p?.vehicleModels ?? [];
        const brandIds = [...new Set(models.map((m) => m?.brand?.id).filter(Boolean))] as string[];
        setSelectedBrands(brandIds);
        setSelectedModels(models.map((m) => m?.id).filter(Boolean) as string[]);

        // Load models for each pre-selected brand
        for (const brandId of brandIds) {
          const items = await catalog?.loadModels?.(brandId) ?? [];
          setModelsMap((prev) => ({ ...(prev ?? {}), [brandId]: items }));
        }

        // Pre-populate category selections
        const subs = p?.partSubcategories ?? [];
        const catIds = [...new Set(subs.map((s) => s?.category?.id).filter(Boolean))] as string[];
        setSelectedCategories(catIds);
        setSelectedSubcategories(subs.map((s) => s?.id).filter(Boolean) as string[]);

        // Load subcategories for each pre-selected category
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

  const toggleBrand = (brandId: string) => {
    setSelectedBrands((prev) => {
      const arr = prev ?? [];
      if (arr.includes(brandId)) {
        setSelectedModels((m) => (m ?? []).filter((mid) => !(modelsMap?.[brandId] ?? []).some((model) => model?.id === mid)));
        return arr.filter((id) => id !== brandId);
      }
      loadModelsForBrand(brandId);
      return [...arr, brandId];
    });
  };

  const toggleModel = (modelId: string) => {
    setSelectedModels((prev) => {
      const arr = prev ?? [];
      return arr.includes(modelId) ? arr.filter((id) => id !== modelId) : [...arr, modelId];
    });
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => {
      const arr = prev ?? [];
      if (arr.includes(catId)) {
        setSelectedSubcategories((s) => (s ?? []).filter((sid) => !(subcategoriesMap?.[catId] ?? []).some((sub) => sub?.id === sid)));
        return arr.filter((id) => id !== catId);
      }
      loadSubsForCategory(catId);
      return [...arr, catId];
    });
  };

  const toggleSubcategory = (subId: string) => {
    setSelectedSubcategories((prev) => {
      const arr = prev ?? [];
      return arr.includes(subId) ? arr.filter((id) => id !== subId) : [...arr, subId];
    });
  };

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
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.topTitle}>Editar Negocio</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>Perfil actualizado \u2713</Text> : null}

          {/* ── Read-only info ── */}
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
                <Ionicons name="location" size={14} color={Colors.primary} />
                <Text style={styles.readOnlyValueSmall}>{addressText}</Text>
              </View>
            </View>
          </View>

          {/* ── Editable: Vehicles ── */}
          <Text style={styles.sectionLabel}>¿Qué vehículos manejas?</Text>
          <Text style={styles.sectionDesc}>Selecciona marcas y luego modelos</Text>
          <BrandsByOrigin
            brands={catalog?.brands ?? []}
            selectedBrands={selectedBrands ?? []}
            onToggleBrand={toggleBrand}
          />
          {(selectedBrands ?? []).map((brandId) => {
            const brand = (catalog?.brands ?? []).find((b) => b?.id === brandId);
            const models = modelsMap?.[brandId] ?? [];
            return (
              <View key={brandId} style={styles.modelSection}>
                <Text style={styles.modelBrand}>{brand?.name ?? ''}</Text>
                {(models?.length ?? 0) === 0 ? (
                  <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 4 }} />
                ) : (
                  <View style={styles.chipContainer}>
                    {(models ?? []).map((m) => (
                      <Pressable
                        key={m?.id}
                        style={[styles.chip, styles.chipSmall, (selectedModels ?? []).includes(m?.id ?? '') && styles.chipSelected]}
                        onPress={() => toggleModel(m?.id ?? '')}
                      >
                        <Text style={[styles.chipTextSmall, (selectedModels ?? []).includes(m?.id ?? '') && styles.chipTextSelected]}>
                          {m?.name ?? ''}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {/* ── Editable: Categories ── */}
          <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>¿Qué repuestos ofreces?</Text>
          <Text style={styles.sectionDesc}>Selecciona categorías y subcategorías</Text>
          {(catalog?.categories ?? []).map((cat) => {
            const isSelected = (selectedCategories ?? []).includes(cat?.id ?? '');
            const subs = subcategoriesMap?.[cat?.id ?? ''] ?? [];
            return (
              <View key={cat?.id}>
                <Pressable
                  style={[styles.categoryRow, isSelected && styles.categoryRowSelected]}
                  onPress={() => toggleCategory(cat?.id ?? '')}
                >
                  <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                    {cat?.name ?? ''}
                  </Text>
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={isSelected ? Colors.primary : Colors.border}
                  />
                </Pressable>
                {isSelected && (subs?.length ?? 0) > 0 ? (
                  <View style={styles.chipContainer}>
                    {(subs ?? []).map((sub) => (
                      <Pressable
                        key={sub?.id}
                        style={[styles.chip, styles.chipSmall, (selectedSubcategories ?? []).includes(sub?.id ?? '') && styles.chipSelected]}
                        onPress={() => toggleSubcategory(sub?.id ?? '')}
                      >
                        <Text style={[styles.chipTextSmall, (selectedSubcategories ?? []).includes(sub?.id ?? '') && styles.chipTextSelected]}>
                          {sub?.name ?? ''}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}

          <Button title="Guardar Cambios" onPress={handleSave} loading={saving} style={styles.saveBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  topTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  scroll: { padding: Spacing.lg, paddingBottom: 60 },
  error: { backgroundColor: '#FEE2E2', color: Colors.error, padding: Spacing.md, borderRadius: 8, fontSize: 14, marginBottom: Spacing.md },
  success: { backgroundColor: '#E8F5E9', color: Colors.success, padding: Spacing.md, borderRadius: 8, fontSize: 14, marginBottom: Spacing.md, textAlign: 'center' },

  // Read-only section
  readOnlySection: { backgroundColor: Colors.cardBg, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.lg },
  readOnlyRow: { paddingVertical: 8 },
  readOnlyLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500', marginBottom: 2 },
  readOnlyValue: { fontSize: 15, color: Colors.textPrimary, fontWeight: '600' },
  readOnlyValueSmall: { fontSize: 13, color: Colors.textSubtitle, lineHeight: 18, flex: 1 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },

  // Sections
  sectionLabel: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  sectionDesc: { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.sm },

  // Chips
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.chipBg },
  chipSmall: { paddingHorizontal: 10, paddingVertical: 6 },
  chipSelected: { backgroundColor: Colors.chipSelectedBg },
  chipText: { fontSize: 14, color: Colors.textSubtitle },
  chipTextSmall: { fontSize: 12, color: Colors.textSubtitle },
  chipTextSelected: { color: Colors.accent, fontWeight: '600' },

  // Models / Categories
  modelSection: { marginBottom: Spacing.md, paddingLeft: Spacing.sm },
  modelBrand: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.sm, marginBottom: 4 },
  categoryRowSelected: { backgroundColor: `${Colors.primary}15` },
  categoryText: { fontSize: 15, color: Colors.textPrimary },
  categoryTextSelected: { fontWeight: '600', color: Colors.primary },

  saveBtn: { marginTop: Spacing.lg },
});
