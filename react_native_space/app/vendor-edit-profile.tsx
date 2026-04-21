import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getVendorProfile, updateVendorProfile } from '../src/services/vendor';
import { getErrorMessage } from '../src/services/api';
import { Colors, Spacing, BorderRadius } from '../src/theme/colors';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import MapLocationPicker from '../src/components/MapLocationPicker';
import LoadingSpinner from '../src/components/LoadingSpinner';
import type { VendorProfile } from '../src/types';

export default function VendorEditProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [rif, setRif] = useState('');
  const [location, setLocation] = useState<Record<string, any>>({});

  useEffect(() => {
    (async () => {
      try {
        const p = await getVendorProfile();
        setProfile(p ?? null);
        setBusinessName(p?.businessName ?? '');
        setRif(p?.rif ?? '');
        setLocation({
          country: p?.country ?? '',
          city: p?.city ?? '',
          state: p?.state ?? '',
          municipality: p?.municipality ?? '',
          parish: p?.parish ?? '',
          street: p?.street ?? '',
          postalCode: p?.postalCode ?? '',
          latitude: p?.latitude ?? undefined,
          longitude: p?.longitude ?? undefined,
          referencePoint: p?.referencePoint ?? '',
          fullAddress: p?.fullAddress ?? '',
        });
      } catch { }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      await updateVendorProfile({
        businessName: businessName?.trim?.() ?? '',
        rif: rif?.trim?.() ?? '',
        country: location?.country ?? '',
        city: location?.city ?? '',
        state: location?.state ?? '',
        municipality: location?.municipality ?? '',
        parish: location?.parish ?? '',
        street: location?.street ?? '',
        postalCode: location?.postalCode ?? '',
        latitude: location?.latitude,
        longitude: location?.longitude,
        referencePoint: location?.referencePoint ?? '',
        fullAddress: location?.fullAddress ?? '',
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

          <Text style={styles.sectionLabel}>Ubicaci\u00f3n</Text>
          <Text style={styles.sectionDesc}>
            Selecciona tu ubicaci\u00f3n en el mapa. Arrastra el marcador para ajustar.
          </Text>
          <MapLocationPicker
            onLocationUpdate={(loc) => setLocation((p) => ({ ...(p ?? {}), ...loc }))}
            initialLocation={profile?.latitude && profile?.longitude ? { latitude: profile.latitude, longitude: profile.longitude } : undefined}
          />
          {location?.fullAddress ? (
            <View style={styles.addressBox}>
              <Ionicons name="location" size={16} color={Colors.primary} />
              <Text style={styles.addressText}>{location.fullAddress}</Text>
            </View>
          ) : null}

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
  sectionLabel: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginTop: Spacing.md, marginBottom: 4 },
  sectionDesc: { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.sm },
  addressBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: Colors.cardBg, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.sm },
  addressText: { flex: 1, fontSize: 13, color: Colors.textSubtitle, lineHeight: 18 },
  saveBtn: { marginTop: Spacing.lg },
});
