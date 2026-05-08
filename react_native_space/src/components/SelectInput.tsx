import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';
import type { CatalogItem } from '../types';

interface SelectInputProps {
  label: string;
  items: CatalogItem[];
  selectedId?: string;
  onSelect: (item: CatalogItem) => void;
  error?: string;
  placeholder?: string;
  searchable?: boolean;
}

export default function SelectInput({ label, items, selectedId, onSelect, error, placeholder, searchable = false }: SelectInputProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = (items ?? [])?.find?.((i) => i?.id === selectedId);
  const filtered = searchable && search
    ? (items ?? [])?.filter?.((i) => i?.name?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? '') ?? false) ?? []
    : items ?? [];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label ?? ''}</Text>
      <Pressable style={[styles.select, error ? styles.errorBorder : null]} onPress={() => setOpen(true)}>
        <Text style={selected ? styles.value : styles.placeholder} numberOfLines={1}>
          {selected?.name ?? placeholder ?? `Seleccionar ${label?.toLowerCase?.() ?? ''}...`}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => { setOpen(false); setSearch(''); }} />
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label ?? ''}</Text>
            <Pressable onPress={() => { setOpen(false); setSearch(''); }} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
          </View>
          {searchable ? (
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={colors.textSecondary}
            />
          ) : null}
          <FlatList
            data={filtered ?? []}
            keyExtractor={(item) => item?.id ?? ''}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.item, item?.id === selectedId && styles.itemSelected]}
                onPress={() => { onSelect?.(item); setOpen(false); setSearch(''); }}
              >
                <Text style={[styles.itemText, item?.id === selectedId && styles.itemTextSelected]}>
                  {item?.name ?? ''}
                </Text>
                {item?.id === selectedId ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
              </Pressable>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Sin opciones disponibles</Text>}
          />
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: { fontSize: 13, fontWeight: '500', color: c.textSubtitle, marginBottom: 6 },
  select: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: c.border, borderRadius: BorderRadius.md,
    backgroundColor: c.inputBg, paddingHorizontal: Spacing.md, paddingVertical: 14,
  },
  errorBorder: { borderColor: c.error },
  value: { fontSize: 15, color: c.textPrimary, flex: 1 },
  placeholder: { fontSize: 15, color: c.textSecondary, flex: 1 },
  errorText: { color: c.error, fontSize: 12, marginTop: 4 },
  overlay: { flex: 1, backgroundColor: c.overlay },
  modal: { backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%', paddingBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: c.border },
  modalTitle: { fontSize: 17, fontWeight: '600', color: c.textPrimary },
  searchInput: { marginHorizontal: Spacing.md, marginVertical: Spacing.sm, borderWidth: 1, borderColor: c.border, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: 15, color: c.textPrimary, backgroundColor: c.inputBg },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
  itemSelected: { backgroundColor: `${c.primary}15` },
  itemText: { fontSize: 15, color: c.textPrimary },
  itemTextSelected: { fontWeight: '600', color: c.primary },
  empty: { padding: Spacing.lg, textAlign: 'center', color: c.textSecondary },
});
