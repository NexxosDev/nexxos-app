import React, { useState, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, Animated, TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme/colors';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  secureTextEntry?: boolean;
}

export default function Input({ label, error, containerStyle, secureTextEntry, value, onFocus, onBlur, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = (e: any) => {
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
        focused && styles.focused,
        error ? styles.errorBorder : null,
      ]}>
        <Animated.Text style={[
          styles.label,
          { top: labelTop, fontSize: labelSize },
          (focused || hasValue) && styles.labelFocused,
          error ? styles.labelError : null,
        ]}>
          {label ?? ''}
        </Animated.Text>
        <TextInput
          style={styles.input}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPassword}
          placeholderTextColor={Colors.textSecondary}
          {...rest}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn} hitSlop={8}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingTop: 18,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  focused: { borderColor: Colors.primary, borderWidth: 2 },
  errorBorder: { borderColor: Colors.error },
  label: {
    position: 'absolute',
    left: Spacing.md,
    color: Colors.textSecondary,
    backgroundColor: Colors.white,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  labelFocused: { color: Colors.primary },
  labelError: { color: Colors.error },
  input: { flex: 1, fontSize: 16, color: Colors.textPrimary, paddingVertical: 0 },
  eyeBtn: { marginLeft: Spacing.sm },
  errorText: { color: Colors.error, fontSize: 12, marginTop: 4, marginLeft: 4 },
});
