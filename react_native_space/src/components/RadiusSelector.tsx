import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme/colors';

interface RadiusSelectorProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function RadiusSelector({ value = 5, onChange, min = 5, max = 30, step = 5 }: RadiusSelectorProps) {
  const decrease = () => {
    const newVal = (value ?? min) - step;
    if (newVal >= min) onChange?.(newVal);
  };
  const increase = () => {
    const newVal = (value ?? min) + step;
    if (newVal <= max) onChange?.(newVal);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Radio de b\u00fasqueda</Text>
      <View style={styles.row}>
        <Pressable style={[styles.btn, (value ?? min) <= min && styles.btnDisabled]} onPress={decrease} disabled={(value ?? min) <= min}>
          <Ionicons name="remove" size={20} color={(value ?? min) <= min ? Colors.border : Colors.textPrimary} />
        </Pressable>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value ?? min} km</Text>
        </View>
        <Pressable style={[styles.btn, (value ?? min) >= max && styles.btnDisabled]} onPress={increase} disabled={(value ?? min) >= max}>
          <Ionicons name="add" size={20} color={(value ?? min) >= max ? Colors.border : Colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: { fontSize: 13, fontWeight: '500', color: Colors.textSubtitle, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white,
  },
  btnDisabled: { opacity: 0.4 },
  valueContainer: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    marginHorizontal: Spacing.md, backgroundColor: Colors.backgroundSection,
    borderRadius: BorderRadius.sm,
  },
  value: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
});
