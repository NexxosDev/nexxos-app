import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import Button from './Button';

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
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    getCurrentLocation();
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
      setAddress(locationData.fullAddress);
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

  if (loadingLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Obteniendo ubicación actual...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          <Marker
            coordinate={markerPosition}
            draggable
            onDragEnd={(e) => setMarkerPosition(e?.nativeEvent?.coordinate ?? markerPosition)}
            title="Tu ubicación"
            description="Arrastra para ajustar"
          />
        </MapView>
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
  updateButton: {
    marginTop: Spacing.sm,
  },
});