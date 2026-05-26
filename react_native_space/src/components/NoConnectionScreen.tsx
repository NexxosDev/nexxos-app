import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface NoConnectionScreenProps {
  onRetry: () => void;
  retrying?: boolean;
}

export default function NoConnectionScreen({ onRetry, retrying }: NoConnectionScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Sad swing animation for emoji
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Entry animation
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 600 });
    // Gentle sad swing
    rotation.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  // Button press animation
  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const tips = [
    { icon: 'wifi-outline' as const, text: 'Revisa tu conexión WiFi' },
    { icon: 'cellular-outline' as const, text: 'Activa los datos móviles' },
    { icon: 'airplane-outline' as const, text: 'Desactiva el modo avión' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
      {/* Animated emoji */}
      <Animated.View style={emojiStyle}>
        <Text style={styles.emoji}>🚗</Text>
        <Text style={styles.emojiOverlay}>💧</Text>
      </Animated.View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.textPrimary }]}>¡Ups! No hay conexión</Text>

      {/* Message */}
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        Parece que NEXXOS no puede cargar en este momento.{"\n"}Verifica tu internet y vuelve a intentarlo.
      </Text>

      {/* Tips card */}
      <View style={[styles.tipsCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.tipsTitle, { color: colors.textSubtitle }]}>Prueba lo siguiente:</Text>
        {tips.map((tip, idx) => (
          <View key={idx} style={styles.tipRow}>
            <Ionicons name={tip.icon} size={20} color={colors.primary} />
            <Text style={[styles.tipText, { color: colors.textPrimary }]}>{tip.text}</Text>
          </View>
        ))}
      </View>

      {/* Retry button */}
      <Animated.View style={btnStyle}>
        <Pressable
          style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          onPressIn={() => { btnScale.value = withSpring(0.95); }}
          onPressOut={() => { btnScale.value = withSpring(1); }}
          onPress={onRetry}
          disabled={retrying}
          accessibilityLabel="Reintentar conexión"
          accessibilityRole="button"
        >
          {retrying ? (
            <Ionicons name="reload-outline" size={20} color="#121212" />
          ) : (
            <Ionicons name="refresh-outline" size={20} color="#121212" />
          )}
          <Text style={styles.retryText}>{retrying ? 'Reintentando...' : 'Reintentar'}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: Platform.OS === 'web' ? 100 : 120,
    textAlign: 'center',
  },
  emojiOverlay: {
    fontSize: Platform.OS === 'web' ? 36 : 44,
    position: 'absolute',
    top: Platform.OS === 'web' ? -8 : -10,
    right: Platform.OS === 'web' ? -4 : -6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 28,
  },
  tipsCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 14,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 180,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#121212',
  },
});
