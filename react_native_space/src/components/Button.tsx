import React, { useRef, useMemo } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, Animated, ViewStyle, TextStyle, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export default function Button({ title, onPress, variant = 'primary', loading, disabled, style, textStyle, icon }: ButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 3 }).start();
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light)?.catch?.(() => {});
    }
    onPress?.();
  };

  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'outline' && styles.outline,
    variant === 'destructive' && styles.destructive,
    variant === 'ghost' && styles.ghost,
    isDisabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.text,
    variant === 'primary' && styles.primaryText,
    variant === 'secondary' && styles.secondaryText,
    variant === 'outline' && styles.outlineText,
    variant === 'destructive' && styles.destructiveText,
    variant === 'ghost' && styles.ghostText,
    textStyle,
  ];

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={containerStyle}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        {loading ? (
          <ActivityIndicator size="small" color={variant === 'primary' ? colors.accent : colors.primary} />
        ) : (
          <>
            {icon}
            <Text style={labelStyle}>{title ?? ''}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    minHeight: 48,
    gap: Spacing.sm,
  },
  primary: { backgroundColor: c.primary },
  secondary: { backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.primary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: c.border },
  destructive: { backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.error },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  text: { fontSize: 16, fontWeight: '600' },
  primaryText: { color: c.accent },
  secondaryText: { color: c.primary },
  outlineText: { color: c.textPrimary },
  destructiveText: { color: c.error },
  ghostText: { color: c.textSecondary },
});
