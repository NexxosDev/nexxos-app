import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';
import type { ResponseTagValue } from '../types';
import { TAG_DEFINITIONS } from '../utils/responseTags';

interface TagSelectorSheetProps {
  visible: boolean;
  selectedTags: ResponseTagValue[];
  vendorName: string;
  onSave: (tags: ResponseTagValue[]) => void;
  onClose: () => void;
}

export default function TagSelectorSheet({ visible, selectedTags, vendorName, onSave, onClose }: TagSelectorSheetProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [localTags, setLocalTags] = useState<ResponseTagValue[]>(selectedTags ?? []);

  // Sync local state when sheet opens with new selection
  React.useEffect(() => {
    if (visible) setLocalTags(selectedTags ?? []);
  }, [visible, selectedTags]);

  const toggleTag = useCallback((tag: ResponseTagValue) => {
    setLocalTags((prev) => {
      const arr = prev ?? [];
      return arr.includes(tag) ? arr.filter((t) => t !== tag) : [...arr, tag];
    });
  }, []);

  const handleSave = useCallback(() => {
    onSave?.(localTags ?? []);
    onClose?.();
  }, [localTags, onSave, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Etiquetar respuesta</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{vendorName ?? ''}</Text>

        <View style={styles.tagList}>
          {(TAG_DEFINITIONS ?? []).map((def) => {
            const isSelected = (localTags ?? []).includes(def?.key);
            return (
              <Pressable
                key={def?.key}
                style={[styles.tagRow, isSelected && { backgroundColor: def?.bgColor ?? 'transparent' }]}
                onPress={() => toggleTag(def?.key)}
              >
                <Text style={styles.tagEmoji}>{def?.emoji ?? ''}</Text>
                <Text style={[styles.tagLabel, isSelected && { color: def?.color, fontWeight: '600' }]}>{def?.label ?? ''}</Text>
                <Ionicons
                  name={isSelected ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={isSelected ? (def?.color ?? colors.primary) : colors.textSecondary}
                />
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Guardar</Text>
        </Pressable>
        <Pressable style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: c.overlay },
  sheet: {
    backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: Spacing.lg, paddingBottom: 40,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 10 },
      default: {},
    }),
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginBottom: Spacing.md },
  title: { fontSize: 18, fontWeight: '700', color: c.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: c.textSecondary, marginBottom: Spacing.lg },
  tagList: { gap: 4, marginBottom: Spacing.lg },
  tagRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm, gap: 10,
  },
  tagEmoji: { fontSize: 18 },
  tagLabel: { flex: 1, fontSize: 15, color: c.textPrimary },
  saveBtn: {
    backgroundColor: c.primary, borderRadius: BorderRadius.md, paddingVertical: 14,
    alignItems: 'center', marginBottom: Spacing.sm,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: c.accent },
  cancelBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  cancelText: { fontSize: 15, color: c.textSecondary },
});
