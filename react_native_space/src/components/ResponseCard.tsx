import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import Button from './Button';

const LINK_COLOR = '#07a0ff';

interface ResponseCardProps {
  businessName: string;
  avgRating?: number | null;
  initialMessage: string;
  distanceKm?: number | null;
  vendorLatitude?: number | null;
  vendorLongitude?: number | null;
  onOpenChat?: () => void;
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `A ${Math.round(km * 1000)} m de tu ubicación`;
  }
  return `A ${km.toFixed(1)} km de tu ubicación`;
}

function openGoogleMaps(lat: number, lng: number) {
  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  const iosUrl = `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`;

  if (Platform.OS === 'ios') {
    Linking.canOpenURL(iosUrl)
      .then((supported) => {
        if (supported) return Linking.openURL(iosUrl);
        return Linking.openURL(webUrl);
      })
      .catch(() => Linking.openURL(webUrl).catch(() => {}));
  } else {
    Linking.openURL(webUrl).catch(() =>
      Alert.alert('Error', 'No se pudo abrir Google Maps'),
    );
  }
}

export default function ResponseCard({ businessName, avgRating, initialMessage, distanceKm, vendorLatitude, vendorLongitude, onOpenChat }: ResponseCardProps) {
  const hasDistance = typeof distanceKm === 'number' && isFinite(distanceKm);
  const hasCoords = typeof vendorLatitude === 'number' && typeof vendorLongitude === 'number';
  const canNavigate = hasDistance && hasCoords;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="storefront-outline" size={20} color={Colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{businessName ?? ''}</Text>
          <View style={styles.metaRow}>
            {typeof avgRating === 'number' ? (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color={Colors.primary} />
                <Text style={styles.rating}>{avgRating?.toFixed?.(1) ?? '0'}</Text>
              </View>
            ) : null}
            {hasDistance ? (
              canNavigate ? (
                <Pressable style={styles.distanceRow} onPress={() => openGoogleMaps(vendorLatitude!, vendorLongitude!)}>
                  <Ionicons name="navigate-outline" size={12} color={LINK_COLOR} />
                  <Text style={styles.distanceLink}>{formatDistance(distanceKm as number)}</Text>
                </Pressable>
              ) : (
                <View style={styles.distanceRow}>
                  <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                  <Text style={styles.distance}>{formatDistance(distanceKm as number)}</Text>
                </View>
              )
            ) : null}
          </View>
        </View>
      </View>
      <Text style={styles.message} numberOfLines={2}>{initialMessage ?? ''}</Text>
      {onOpenChat ? <Button title="Abrir Chat" variant="secondary" onPress={onOpenChat} style={styles.chatBtn} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
      android: { elevation: 1 },
      default: {},
    }),
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.backgroundSection,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.sm,
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2, flexWrap: 'wrap' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  rating: { fontSize: 12, color: Colors.textSecondary },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  distance: { fontSize: 12, color: Colors.textSecondary },
  distanceLink: { fontSize: 12, color: '#07a0ff', textDecorationLine: 'underline', fontWeight: '600' },
  message: { fontSize: 13, color: Colors.textSubtitle, marginBottom: Spacing.sm, lineHeight: 18 },
  chatBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: Spacing.md },
});
