import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform, ActivityIndicator, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import Button from './Button';
import Input from './Input';

// Importación condicional de react-native-maps (solo móvil, no web)
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = undefined;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  } catch (e) {
    console.warn('react-native-maps not available');
  }
}

interface LocationData {
  latitude: number;
  longitude: number;
  country?: string;
  city?: string;
  state?: string;
  municipality?: string;
  parish?: string;
  street?: string;
  postalCode?: string;
  referencePoint?: string;
  fullAddress?: string;
}

interface MapLocationPickerProps {
  onLocationUpdate: (location: LocationData) => void;
  initialLocation?: { latitude: number; longitude: number };
}

export default function MapLocationPicker({ onLocationUpdate, initialLocation }: MapLocationPickerProps) {
  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || 10.4806,
    longitude: initialLocation?.longitude || -66.9036,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialLocation?.latitude || 10.4806,
    longitude: initialLocation?.longitude || -66.9036,
  });
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(Platform.OS !== 'web');
  const [address, setAddress] = useState<string>('');
  const [referencePoint, setReferencePoint] = useState<string>('');

  // Estados para modo web (formulario manual)
  const [webForm, setWebForm] = useState({
    country: 'Venezuela',
    state: '',
    city: '',
    municipality: '',
    parish: '',
    street: '',
    postalCode: '',
    referencePoint: '',
  });

  useEffect(() => {
    if (Platform.OS !== 'web') {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita permiso de ubicación para usar esta función');
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const newPosition = {
        latitude: location?.coords?.latitude ?? 10.4806,
        longitude: location?.coords?.longitude ?? -66.9036,
      };

      setMarkerPosition(newPosition);
      setRegion({
        ...newPosition,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación actual');
    } finally {
      setLoadingLocation(false);
    }
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      
      // Usar Nominatim (OpenStreetMap) para geocodificación inversa
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'NEXXOS-App/1.0',
          },
        }
      );

      if (!response?.ok) {
        throw new Error('Error en la geocodificación');
      }

      const data = await response.json();
      const addr = data?.address ?? {};

      const locationData: LocationData = {
        latitude: lat,
        longitude: lon,
        country: addr?.country ?? 'Venezuela',
        state: addr?.state ?? addr?.province ?? '',
        city: addr?.city ?? addr?.town ?? addr?.village ?? '',
        municipality: addr?.municipality ?? addr?.county ?? '',
        parish: addr?.suburb ?? addr?.neighbourhood ?? '',
        street: addr?.road ?? addr?.street ?? '',
        postalCode: addr?.postcode ?? '',
        fullAddress: data?.display_name ?? '',
      };

      // Construir dirección completa personalizada
      const parts = [
        locationData.street,
        locationData.parish,
        locationData.municipality,
        locationData.city,
        locationData.state,
        locationData.country,
      ].filter(Boolean);

      locationData.fullAddress = parts.join(', ') || data?.display_name || 'Dirección no disponible';
      locationData.referencePoint = referencePoint; // Agregar punto de referencia manual
      setAddress(locationData.fullAddress ?? 'Dirección no disponible');
      onLocationUpdate(locationData);

      Alert.alert('Ubicación actualizada', 'La dirección ha sido actualizada correctamente');
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      Alert.alert('Error', 'No se pudo obtener la dirección. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = () => {
    reverseGeocode(markerPosition.latitude, markerPosition.longitude);
  };

  const handleWebFormSubmit = () => {
    const fullAddress = [
      webForm.street,
      webForm.parish,
      webForm.municipality,
      webForm.city,
      webForm.state,
      webForm.country,
    ].filter(Boolean).join(', ') || 'Dirección ingresada manualmente';

    const locationData: LocationData = {
      latitude: 10.4806, // Coordenadas por defecto de Caracas
      longitude: -66.9036,
      country: webForm.country || 'Venezuela',
      state: webForm.state,
      city: webForm.city,
      municipality: webForm.municipality,
      parish: webForm.parish,
      street: webForm.street,
      postalCode: webForm.postalCode,
      referencePoint: webForm.referencePoint,
      fullAddress,
    };

    onLocationUpdate(locationData);
    Alert.alert('Éxito', 'Dirección guardada correctamente');
  };

  if (loadingLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Obteniendo ubicación actual...</Text>
      </View>
    );
  }

  // Modo Web: Formulario manual
  if (Platform.OS === 'web') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.webFormContainer}>
          <Text style={styles.webInfoText}>
            📍 En la versión web, ingresa tu dirección manualmente. El mapa interactivo estará disponible en la app móvil.
          </Text>

          <Input
            label="País"
            value={webForm.country}
            onChangeText={(text: string) => setWebForm({ ...webForm, country: text })}
            placeholder="Venezuela"
          />

          <Input
            label="Estado"
            value={webForm.state}
            onChangeText={(text: string) => setWebForm({ ...webForm, state: text })}
            placeholder="Distrito Capital"
          />

          <Input
            label="Ciudad"
            value={webForm.city}
            onChangeText={(text: string) => setWebForm({ ...webForm, city: text })}
            placeholder="Caracas"
          />

          <Input
            label="Municipio"
            value={webForm.municipality}
            onChangeText={(text: string) => setWebForm({ ...webForm, municipality: text })}
            placeholder="Libertador"
          />

          <Input
            label="Parroquia (opcional)"
            value={webForm.parish}
            onChangeText={(text: string) => setWebForm({ ...webForm, parish: text })}
            placeholder="Catedral"
          />

          <Input
            label="Calle/Avenida (opcional)"
            value={webForm.street}
            onChangeText={(text: string) => setWebForm({ ...webForm, street: text })}
            placeholder="Av. Universidad"
          />

          <Input
            label="Código Postal (opcional)"
            value={webForm.postalCode}
            onChangeText={(text: string) => setWebForm({ ...webForm, postalCode: text })}
            placeholder="1010"
          />

          <Input
            label="Punto de Referencia"
            value={webForm.referencePoint}
            onChangeText={(text: string) => setWebForm({ ...webForm, referencePoint: text })}
            placeholder="Cerca del Centro Comercial..."
          />

          <Button
            title="Guardar Ubicación"
            onPress={handleWebFormSubmit}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    );
  }

  // Modo Móvil: Mapa interactivo
  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {MapView && Marker ? (
          <MapView
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            <Marker
              coordinate={markerPosition}
              draggable
              onDragEnd={(e: any) => setMarkerPosition(e?.nativeEvent?.coordinate ?? markerPosition)}
              title="Tu ubicación"
              description="Arrastra para ajustar"
            />
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text>Mapa no disponible</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Arrastra el marcador para ajustar tu ubicación exacta, luego presiona el botón para actualizar la dirección.
        </Text>
        
        {address ? (
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Dirección actual:</Text>
            <Text style={styles.addressText}>{address}</Text>
          </View>
        ) : null}

        <Input
          label="Punto de Referencia"
          value={referencePoint}
          onChangeText={setReferencePoint}
          placeholder="Ej: Cerca del Centro Comercial..."
          containerStyle={styles.referenceInput}
        />

        <Button
          title="Actualizar Dirección"
          onPress={handleUpdateLocation}
          loading={loading}
          style={styles.updateButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  mapContainer: {
    height: 300,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSection,
    borderRadius: BorderRadius.md,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  addressContainer: {
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSubtitle,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  referenceInput: {
    marginTop: Spacing.md,
    marginBottom: 0,
  },
  updateButton: {
    marginTop: Spacing.sm,
  },
  webFormContainer: {
    padding: Spacing.lg,
  },
  webInfoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    backgroundColor: Colors.backgroundSection,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSection,
  },
});