import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated, Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import type { ThemeColors } from '../theme/colors';

interface ProfileActionButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  variant?: 'default' | 'danger';
  /** Show a chevron arrow on the right */
  showChevron?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function ProfileActionButton({
  label,
  icon,
  onPress,
  variant = 'default',
  showChevron = true,
  style,
}: ProfileActionButtonProps) {
  const { colors, isDark } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const isDanger = variant === 'danger';

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, damping: 15, stiffness: 150 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4 }).start();
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light)?.catch?.(() => {});
    }
    onPress?.();
  };

  const iconColor = isDanger ? '#FF3B30' : (isDark ? '#E0E0E0' : '#555555');
  const textColor = isDanger ? '#FF3B30' : (isDark ? '#F0F0F0' : '#1A1A1A');
  const chevronColor = isDanger ? '#FF3B3066' : (isDark ? '#666666' : '#C0C0C0');
  const bgColor = isDanger
    ? (isDark ? 'rgba(255, 59, 48, 0.08)' : 'rgba(255, 59, 48, 0.04)')
    : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)');
  const pressedBg = isDanger
    ? (isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.10)')
    : (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)');

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: pressed ? pressedBg : bgColor,
            borderColor: isDanger
              ? (isDark ? 'rgba(255,59,48,0.20)' : 'rgba(255,59,48,0.15)')
              : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
          },
        ]}
      >
        <View style={[
          styles.iconCircle,
          {
            backgroundColor: isDanger
              ? (isDark ? 'rgba(255,59,48,0.15)' : 'rgba(255,59,48,0.10)')
              : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
          },
        ]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        {showChevron ? (
          <Ionicons name="chevron-forward" size={18} color={chevronColor} />
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
});
