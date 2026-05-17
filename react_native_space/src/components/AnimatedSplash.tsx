import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform, Image as RNImage, ImageBackground } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const LOGO_SIZE = Math.min(SCREEN_W * 0.3, 130);

const textureDark = require('../../assets/images/texture-automotive-dark.png');
const textureLight = require('../../assets/images/texture-automotive-light.png');
const logoYellow = require('../../assets/images/nexxos-logo-yellow.png');

interface AnimatedSplashProps {
  onFinish: () => void;
  fontLoaded: boolean;
}

export default function AnimatedSplash({ onFinish, fontLoaded }: AnimatedSplashProps) {
  const { isDark } = useTheme();

  // ── Shared values ──
  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(24);
  const wholeOpacity = useSharedValue(1);

  const finishSplash = useCallback(() => {
    onFinish?.();
  }, [onFinish]);

  useEffect(() => {
    if (!fontLoaded) return;

    // Step 1: Logo fade-in + scale (0ms → 800ms)
    logoOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSpring(1, { damping: 14, stiffness: 100, mass: 0.8 });

    // Step 2: Glow appears behind logo (300ms → 1100ms)
    glowOpacity.value = withDelay(
      300,
      withSequence(
        withTiming(0.8, { duration: 600, easing: Easing.out(Easing.cubic) }),
        withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      ),
    );

    // Step 3: Text "NEXXOS" fade-in + slide up (600ms → 1300ms)
    textOpacity.value = withDelay(600, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
    textTranslateY.value = withDelay(
      600,
      withSpring(0, { damping: 16, stiffness: 120, mass: 0.7 }),
    );

    // Step 4: Whole splash fades out (2800ms → 3400ms)
    wholeOpacity.value = withDelay(
      2800,
      withTiming(0, { duration: 600, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) {
          runOnJS(finishSplash)();
        }
      }),
    );
  }, [fontLoaded]);

  // ── Animated styles ──
  const containerStyle = useAnimatedStyle(() => ({
    opacity: wholeOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const bgColor = isDark ? '#0A0A0A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#121212';
  const glowColor = isDark
    ? 'rgba(255,193,7,0.10)'
    : 'rgba(255,193,7,0.12)';
  const shadowColor = isDark
    ? 'rgba(255,193,7,0.25)'
    : 'rgba(255,193,7,0.3)';

  return (
    <Animated.View style={[styles.container, containerStyle, { backgroundColor: bgColor }]}>
      {/* Tileable automotive texture */}
      <ImageBackground
        source={isDark ? textureDark : textureLight}
        resizeMode="repeat"
        imageStyle={{ opacity: isDark ? 0.025 : 0.03 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Center content */}
      <View style={styles.content}>
        {/* Glow behind logo — subtle amber halo */}
        <Animated.View style={[styles.glowContainer, glowStyle]}>
          <View style={[
            styles.glowCircle,
            { backgroundColor: glowColor, shadowColor: shadowColor },
          ]} />
        </Animated.View>

        {/* Logo icon — yellow */}
        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <RNImage
            source={logoYellow}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* NEXXOS text */}
        <Animated.Text
          style={[
            styles.brandText,
            textStyle,
            {
              color: textColor,
              fontFamily: Platform.select({
                ios: 'Montserrat-ExtraBold',
                android: 'Montserrat-ExtraBold',
                web: 'Montserrat-ExtraBold',
                default: 'System',
              }),
            },
          ]}
        >
          NEXXOS
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    position: 'absolute',
    width: LOGO_SIZE * 3.5,
    height: LOGO_SIZE * 3.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircle: {
    width: '100%',
    height: '100%',
    borderRadius: LOGO_SIZE * 1.75,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
    elevation: 0,
  },
  logoWrap: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  brandText: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 8,
  },
});
