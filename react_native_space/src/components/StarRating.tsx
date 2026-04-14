import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import * as Haptics from 'expo-haptics';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

export default function StarRating({ rating = 0, onChange, size = 28, readonly = false }: StarRatingProps) {
  const handlePress = (star: number) => {
    if (readonly) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light)?.catch?.(() => {});
    }
    onChange?.(star);
  };

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => handlePress(star)} hitSlop={4} disabled={readonly}>
          <FontAwesome
            name={(rating ?? 0) >= star ? 'star' : 'star-o'}
            size={size}
            color={(rating ?? 0) >= star ? Colors.primary : Colors.border}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
});
