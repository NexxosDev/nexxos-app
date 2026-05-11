import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaskInput from 'react-native-mask-input';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';

interface PhoneInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
  editable?: boolean;
  style?: ViewStyle;
  locked?: boolean;
}

const PHONE_MASK = ['+', '5', '8', '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];

export default function PhoneInput({ label, value, onChangeText, error, containerStyle, editable = true, style, locked }: PhoneInputProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [focused, setFocused] = useState(false);
  const isLocked = locked === true;
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    if (isLocked) return;
    setFocused(true);
    Animated.timing(labelAnim, { toValue: 1, duration: 150, useNativeDriver: false }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    if (!value) Animated.timing(labelAnim, { toValue: 0, duration: 150, useNativeDriver: false }).start();
  };

  const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, -10] });
  const labelSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] });
  const hasValue = (value?.length ?? 0) > 0;

  return (
    <View style={[styles.container, containerStyle, style]}>
      <View style={[styles.inputContainer, focused && !isLocked && styles.focused, isLocked && styles.lockedContainer, error ? styles.errorBorder : null]}>
        <Animated.Text style={[styles.label, { top: labelTop, fontSize: labelSize, backgroundColor: isLocked ? 'transparent' : colors.inputBg }, (focused || hasValue) && !isLocked && styles.labelFocused, isLocked && styles.lockedLabel, error ? styles.labelError : null]}>
          {label ?? ''}
        </Animated.Text>
        <MaskInput
          style={[styles.input, isLocked && styles.lockedInput]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          mask={PHONE_MASK}
          keyboardType="phone-pad"
          placeholderTextColor={colors.textSecondary}
          editable={!isLocked && editable}
        />
        {isLocked ? (
          <Ionicons name="lock-closed" size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { marginBottom: Spacing.md },
  inputContainer: { borderWidth: 1, borderColor: c.border, borderRadius: BorderRadius.md, backgroundColor: c.inputBg, paddingHorizontal: Spacing.md, paddingTop: 18, paddingBottom: 8, position: 'relative', flexDirection: 'row', alignItems: 'center' },
  focused: { borderColor: c.primary, borderWidth: 2 },
  errorBorder: { borderColor: c.error },
  label: { position: 'absolute', left: Spacing.md, color: c.textSecondary, paddingHorizontal: 4, zIndex: 1 },
  labelFocused: { color: c.primary },
  labelError: { color: c.error },
  lockedLabel: { color: c.textSecondary },
  input: { flex: 1, fontSize: 16, color: c.textPrimary, paddingVertical: 0 },
  lockedContainer: { backgroundColor: c.backgroundSection, borderColor: c.border, borderStyle: 'dashed' as const },
  lockedInput: { color: c.textSecondary },
  errorText: { color: c.error, fontSize: 12, marginTop: 4, marginLeft: 4 },
});
