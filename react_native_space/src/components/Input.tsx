import React, { useState, useRef, useMemo } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, Animated, TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  secureTextEntry?: boolean;
  locked?: boolean;
}

export default function Input({ label, error, containerStyle, secureTextEntry, value, onFocus, onBlur, locked, ...rest }: InputProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isLocked = locked === true;
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = (e: any) => {
    if (isLocked) return;
    setFocused(true);
    Animated.timing(labelAnim, { toValue: 1, duration: 150, useNativeDriver: false }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    if (!value) {
      Animated.timing(labelAnim, { toValue: 0, duration: 150, useNativeDriver: false }).start();
    }
    onBlur?.(e);
  };

  const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, -10] });
  const labelSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] });
  const hasValue = (value?.length ?? 0) > 0;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[
        styles.inputContainer,
        focused && !isLocked && styles.focused,
        isLocked && styles.lockedContainer,
        error ? styles.errorBorder : null,
      ]}>
        <Animated.Text style={[
          styles.label,
          { top: labelTop, fontSize: labelSize, backgroundColor: isLocked ? 'transparent' : colors.inputBg },
          (focused || hasValue) && !isLocked && styles.labelFocused,
          isLocked && styles.lockedLabel,
          error ? styles.labelError : null,
        ]}>
          {label ?? ''}
        </Animated.Text>
        <TextInput
          style={[styles.input, isLocked && styles.lockedInput]}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPassword}
          placeholderTextColor={colors.textSecondary}
          editable={!isLocked}
          {...rest}
        />
        {isLocked ? (
          <Ionicons name="lock-closed" size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
        ) : secureTextEntry ? (
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn} hitSlop={8}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { marginBottom: Spacing.md },
  inputContainer: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: BorderRadius.md,
    backgroundColor: c.inputBg,
    paddingHorizontal: Spacing.md,
    paddingTop: 18,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  focused: { borderColor: c.primary, borderWidth: 2 },
  errorBorder: { borderColor: c.error },
  label: {
    position: 'absolute',
    left: Spacing.md,
    color: c.textSecondary,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  labelFocused: { color: c.primary },
  labelError: { color: c.error },
  input: { flex: 1, fontSize: 16, color: c.textPrimary, paddingVertical: 0 },
  eyeBtn: { marginLeft: Spacing.sm },
  errorText: { color: c.error, fontSize: 12, marginTop: 4, marginLeft: 4 },
  lockedContainer: {
    backgroundColor: c.backgroundSection,
    borderColor: c.border,
    borderStyle: 'dashed' as const,
  },
  lockedLabel: {
    color: c.textSecondary,
  },
  lockedInput: {
    color: c.textSecondary,
  },
});
