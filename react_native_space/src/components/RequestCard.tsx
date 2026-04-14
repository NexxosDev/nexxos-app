import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import Badge from './Badge';

interface RequestCardProps {
  vehicleBrand: string;
  vehicleModel: string;
  partCategory: string;
  status: string;
  responseCount?: number;
  municipality?: string;
  state?: string;
  createdAt: string;
  onPress?: () => void;
}

export default function RequestCard({
  vehicleBrand, vehicleModel, partCategory, status,
  responseCount, municipality, state, createdAt, onPress,
}: RequestCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const formatDate = (d: string) => {
    try {
      const date = new Date(d);
      return date?.toLocaleDateString?.('es-VE', { day: '2-digit', month: 'short' }) ?? '';
    } catch { return ''; }
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }]}>
      <Pressable
        style={styles.card}
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 3 }).start()}
        accessibilityRole="button"
      >
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Ionicons name="car-outline" size={24} color={Colors.primary} />
          </View>
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>{vehicleBrand ?? ''} {vehicleModel ?? ''}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{partCategory ?? ''}</Text>
            {(municipality || state) ? (
              <Text style={styles.location} numberOfLines={1}>
                <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                {' '}{municipality ?? ''}{state ? `, ${state}` : ''}
              </Text>
            ) : null}
          </View>
          <View style={styles.right}>
            <Badge status={status ?? ''} size="small" />
            {typeof responseCount === 'number' ? (
              <Text style={styles.responses}>{responseCount} resp.</Text>
            ) : null}
            <Text style={styles.date}>{formatDate(createdAt ?? '')}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
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
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
      android: { elevation: 2 },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
    }),
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.backgroundSection,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.md,
  },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSubtitle, marginTop: 2 },
  location: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  responses: { fontSize: 11, color: Colors.textSecondary },
  date: { fontSize: 11, color: Colors.textSecondary },
});
