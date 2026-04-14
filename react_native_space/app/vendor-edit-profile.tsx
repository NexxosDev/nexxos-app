import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getVendorProfile, updateVendorProfile } from '../src/services/vendor';
import { useCatalog } from '../src/contexts/CatalogContext';
import { getErrorMessage } from '../src/services/api';
import { Colors, Spacing, BorderRadius } from '../src/theme/colors';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import SelectInput from '../src/components/SelectInput';
import RadiusSelector from '../src/components/RadiusSelector';
import LoadingSpinner from '../src/components/LoadingSpinner';
import type { VendorProfile, CatalogItem } from '../src/types';

export default function VendorEditProfileScreen() {
  const router = useRouter();
  const catalog = useCatalog();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [rif, setRif] = useState('');
  const [stateId, setStateId] = useState('');
  const [municipalityId, setMunicipalityId] = useState('');
  const [searchRadius, setSearchRadius] = useState(5);
  const [municipalities, setMunicipalities] = useState<CatalogItem[]>([]);

  useEffect(() => {
    catalog?.loadStates?.();
    (async () => {
      try {
        const p = await getVendorProfile();
        setProfile(p ?? null);
        setBusinessName(p?.businessName ?? '');
        setRif(p?.rif ?? '');
        setStateId(p?.state?.id ?? '');
        setMunicipalityId(p?.municipality?.id ?? '');
        setSearchRadius(p?.searchRadiusKm ?? 5);
        if (p?.state?.id) {
          const munis = await catalog?.loadMunicipalities?.(p.state.id) ?? [];
          setMunicipalities(munis);
        }
      } catch { }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (stateId) {
      catalog?.loadMunicipalities?.(stateId)?.then?.((items) => setMunicipalities(items ?? []));
    }
  }, [stateId]);

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      await updateVendorProfile({
        businessName: businessName?.trim?.() ?? '',
        rif: rif?.trim?.() ?? '',
        stateId, municipalityId,
        searchRadiusKm: searchRadius,
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

          <Input label="Raz\u00f3n Social" value={businessName} onChangeText={setBusinessName} />
          <Input label="RIF" value={rif} onChangeText={setRif} />
          <SelectInput label="Estado" items={catalog?.states ?? []} selectedId={stateId} onSelect={(i) => { setStateId(i?.id ?? ''); setMunicipalityId(''); }} searchable />
          <SelectInput label="Municipio" items={municipalities} selectedId={municipalityId} onSelect={(i) => setMunicipalityId(i?.id ?? '')} searchable />
          <RadiusSelector value={searchRadius} onChange={setSearchRadius} />

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
  scroll: { padding: Spacing.lg },
  error: { backgroundColor: '#FEE2E2', color: Colors.error, padding: Spacing.md, borderRadius: 8, fontSize: 14, marginBottom: Spacing.md },
  success: { backgroundColor: '#E8F5E9', color: Colors.success, padding: Spacing.md, borderRadius: 8, fontSize: 14, marginBottom: Spacing.md, textAlign: 'center' },
  saveBtn: { marginTop: Spacing.md },
});
