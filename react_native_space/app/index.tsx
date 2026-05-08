import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { useTheme } from '../src/contexts/ThemeContext';
import type { ThemeColors } from '../src/theme/colors';

export default function Index() {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [splashDone, setSplashDone] = useState(false);
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    const timer = setTimeout(() => setSplashDone(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !splashDone) {
    return (
      <View style={styles.splash}>
        <Animated.View style={{ opacity }}>
          <Text style={styles.logo}>NEXXOS</Text>
          <Text style={styles.tagline}>Repuestos al alcance de tu mano</Text>
        </Animated.View>
      </View>
    );
  }

  if (user) {
    return <Redirect href="/role-selection" />;
  }

  return <Redirect href="/auth/login" />;
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  splash: {
    flex: 1, backgroundColor: c.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  logo: {
    fontSize: 48, fontWeight: '800', color: c.primary,
    letterSpacing: 4, textAlign: 'center',
  },
  tagline: {
    fontSize: 14, color: c.white, marginTop: 8,
    textAlign: 'center', opacity: 0.8,
  },
});
