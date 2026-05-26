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

interface ServerErrorScreenProps {
  onRetry: () => void;
  retrying?: boolean;
}

export default function ServerErrorScreen({ onRetry, retrying }: ServerErrorScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Wrench wobble animation
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 600 });
    // Wobble like a confused wrench
    rotation.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(12, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(-6, { duration: 200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500 }), // pause
      ),
      -1,
      false,
    );
  }, []);

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
      {/* Animated emoji */}
      <Animated.View style={emojiStyle}>
        <Text style={styles.emoji}>🔧</Text>
        <Text style={styles.emojiOverlay}>😵</Text>
      </Animated.View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.textPrimary }]}>¡Vaya! Algo no salió bien</Text>

      {/* Message */}
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        Estamos trabajando para solucionarlo.{"\n"}Por favor, intenta de nuevo en unos minutos.
      </Text>

      {/* Info box */}
      <View style={[styles.infoBox, { backgroundColor: colors.warningBg, borderColor: colors.primary + '40' }]}>
        <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.warningBoxText }]}>
          Nuestro equipo ya fue notificado. Esto suele resolverse en pocos minutos.
        </Text>
      </View>

      {/* Retry button */}
      <Animated.View style={btnStyle}>
        <Pressable
          style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          onPressIn={() => { btnScale.value = withSpring(0.95); }}
          onPressOut={() => { btnScale.value = withSpring(1); }}
          onPress={onRetry}
          disabled={retrying}
          accessibilityLabel="Reintentar"
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
    fontSize: Platform.OS === 'web' ? 40 : 48,
    position: 'absolute',
    top: Platform.OS === 'web' ? -14 : -18,
    right: Platform.OS === 'web' ? -10 : -14,
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 32,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19,
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
