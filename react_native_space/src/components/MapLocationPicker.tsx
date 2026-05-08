import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Alert, Platform, ActivityIndicator, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';
import Button from './Button';
import Input from './Input';

let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = undefined;
if (Platform.OS !== 'web') {
  try { const Maps = require('react-native-maps'); MapView = Maps.default; Marker = Maps.Marker; PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE; } catch (e) { console.warn('react-native-maps not available'); }
}

interface LocationData { latitude: number; longitude: number; country?: string; city?: string; state?: string; municipality?: string; parish?: string; street?: string; postalCode?: string; referencePoint?: string; fullAddress?: string; }
interface MapLocationPickerProps { onLocationUpdate: (location: LocationData) => void; initialLocation?: { latitude: number; longitude: number }; }

export default function MapLocationPicker({ onLocationUpdate, initialLocation }: MapLocationPickerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [region, setRegion] = useState({ latitude: initialLocation?.latitude || 10.4806, longitude: initialLocation?.longitude || -66.9036, latitudeDelta: 0.02, longitudeDelta: 0.02 });
  const [markerPosition, setMarkerPosition] = useState({ latitude: initialLocation?.latitude || 10.4806, longitude: initialLocation?.longitude || -66.9036 });
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(Platform.OS !== 'web');
  const [address, setAddress] = useState<string>('');
  const [referencePoint, setReferencePoint] = useState<string>('');
  const [webForm, setWebForm] = useState({ country: 'Venezuela', state: '', city: '', municipality: '', parish: '', street: '', postalCode: '', referencePoint: '' });

  useEffect(() => { if (Platform.OS !== 'web') getCurrentLocation(); }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permiso denegado', 'Se necesita permiso de ubicaci\u00f3n'); setLoadingLocation(false); return; }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const newPosition = { latitude: location?.coords?.latitude ?? 10.4806, longitude: location?.coords?.longitude ?? -66.9036 };
      setMarkerPosition(newPosition); setRegion({ ...newPosition, latitudeDelta: 0.02, longitudeDelta: 0.02 });
    } catch (error) { console.error('Error getting location:', error); Alert.alert('Error', 'No se pudo obtener la ubicaci\u00f3n actual'); }
    finally { setLoadingLocation(false); }
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`, { headers: { 'User-Agent': 'NEXXOS-App/1.0' } });
      if (!response?.ok) throw new Error('Error en la geocodificaci\u00f3n');
      const data = await response.json();
      const addr = data?.address ?? {};
      const streetParts = [addr?.suburb ?? '', addr?.neighbourhood ?? '', addr?.road ?? ''].filter(Boolean);
      const streetValue = streetParts.join(' ').trim();
      const locationData: LocationData = { latitude: lat, longitude: lon, country: addr?.country ?? 'Venezuela', state: addr?.state ?? '', city: addr?.city ?? '', municipality: addr?.county ?? '', parish: addr?.municipality ?? '', street: streetValue, postalCode: addr?.postcode ?? '', fullAddress: data?.display_name ?? '' };
      const parts = [locationData.street, locationData.parish, locationData.municipality, locationData.city, locationData.state, locationData.country].filter(Boolean);
      locationData.fullAddress = parts.join(', ') || data?.display_name || 'Direcci\u00f3n no disponible';
      locationData.referencePoint = referencePoint;
      setAddress(locationData.fullAddress ?? 'Direcci\u00f3n no disponible');
      onLocationUpdate(locationData);
      Alert.alert('Ubicaci\u00f3n actualizada', 'La direcci\u00f3n ha sido actualizada correctamente');
    } catch (error) { console.error('Error in reverse geocoding:', error); Alert.alert('Error', 'No se pudo obtener la direcci\u00f3n.'); }
    finally { setLoading(false); }
  };

  const handleUpdateLocation = () => reverseGeocode(markerPosition.latitude, markerPosition.longitude);

  const handleWebFormSubmit = () => {
    const fullAddress = [webForm.street, webForm.parish, webForm.municipality, webForm.city, webForm.state, webForm.country].filter(Boolean).join(', ') || 'Direcci\u00f3n ingresada manualmente';
    onLocationUpdate({ latitude: 10.4806, longitude: -66.9036, country: webForm.country || 'Venezuela', state: webForm.state, city: webForm.city, municipality: webForm.municipality, parish: webForm.parish, street: webForm.street, postalCode: webForm.postalCode, referencePoint: webForm.referencePoint, fullAddress });
    Alert.alert('\u00c9xito', 'Direcci\u00f3n guardada correctamente');
  };

  if (loadingLocation) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.loadingText}>Obteniendo ubicaci\u00f3n actual...</Text></View>;

  if (Platform.OS === 'web') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.webFormContainer}>
          <Text style={styles.webInfoText}>📍 En la versión web, ingresa tu dirección manualmente. El mapa interactivo estará disponible en la app móvil.</Text>
          <Input label="Pa\u00eds" value={webForm.country} onChangeText={(t: string) => setWebForm({ ...webForm, country: t })} placeholder="Venezuela" />
          <Input label="Estado" value={webForm.state} onChangeText={(t: string) => setWebForm({ ...webForm, state: t })} placeholder="Distrito Capital" />
          <Input label="Ciudad" value={webForm.city} onChangeText={(t: string) => setWebForm({ ...webForm, city: t })} placeholder="Caracas" />
          <Input label="Municipio" value={webForm.municipality} onChangeText={(t: string) => setWebForm({ ...webForm, municipality: t })} placeholder="Libertador" />
          <Input label="Parroquia (opcional)" value={webForm.parish} onChangeText={(t: string) => setWebForm({ ...webForm, parish: t })} placeholder="Catedral" />
          <Input label="Calle/Avenida (opcional)" value={webForm.street} onChangeText={(t: string) => setWebForm({ ...webForm, street: t })} placeholder="Av. Universidad" />
          <Input label="C\u00f3digo Postal (opcional)" value={webForm.postalCode} onChangeText={(t: string) => setWebForm({ ...webForm, postalCode: t })} placeholder="1010" />
          <Input label="Punto de Referencia" value={webForm.referencePoint} onChangeText={(t: string) => setWebForm({ ...webForm, referencePoint: t })} placeholder="Cerca del Centro Comercial..." />
          <Button title="Guardar Ubicaci\u00f3n" onPress={handleWebFormSubmit} style={styles.submitButton} />
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {MapView && Marker ? (
          <MapView provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined} style={styles.map} region={region} onRegionChangeComplete={setRegion}>
            <Marker coordinate={markerPosition} draggable onDragEnd={(e: any) => setMarkerPosition(e?.nativeEvent?.coordinate ?? markerPosition)} title="Tu ubicaci\u00f3n" description="Arrastra para ajustar" />
          </MapView>
        ) : <View style={styles.mapPlaceholder}><Text style={{ color: colors.textSecondary }}>Mapa no disponible</Text></View>}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Arrastra el marcador para ajustar tu ubicación exacta, luego presiona el botón para actualizar la dirección.</Text>
        {address ? <View style={styles.addressContainer}><Text style={styles.addressLabel}>Dirección actual:</Text><Text style={styles.addressText}>{address}</Text></View> : null}
        <Input label="Punto de Referencia" value={referencePoint} onChangeText={setReferencePoint} placeholder="Ej: Cerca del Centro Comercial..." containerStyle={styles.referenceInput} />
        <Button title="Actualizar Dirección" onPress={handleUpdateLocation} loading={loading} style={styles.updateButton} />
      </View>
    </View>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { padding: Spacing.xl, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: Spacing.md, fontSize: 14, color: c.textSecondary },
  mapContainer: { height: 300, borderRadius: BorderRadius.md, overflow: 'hidden', marginBottom: Spacing.md, borderWidth: 1, borderColor: c.border },
  map: { flex: 1 },
  infoContainer: { padding: Spacing.md, backgroundColor: c.backgroundSection, borderRadius: BorderRadius.md },
  infoText: { fontSize: 14, color: c.textSecondary, marginBottom: Spacing.md, lineHeight: 20 },
  addressContainer: { marginBottom: Spacing.md, padding: Spacing.sm, backgroundColor: c.surface, borderRadius: BorderRadius.sm, borderLeftWidth: 3, borderLeftColor: c.primary },
  addressLabel: { fontSize: 12, fontWeight: '600', color: c.textSubtitle, marginBottom: 4 },
  addressText: { fontSize: 14, color: c.textPrimary, lineHeight: 20 },
  referenceInput: { marginTop: Spacing.md, marginBottom: 0 },
  updateButton: { marginTop: Spacing.sm },
  webFormContainer: { padding: Spacing.lg },
  webInfoText: { fontSize: 14, color: c.textSecondary, backgroundColor: c.backgroundSection, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.lg, lineHeight: 20 },
  submitButton: { marginTop: Spacing.md },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.backgroundSection },
});
