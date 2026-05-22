import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/colors';
import {
  getQuickReplies,
  createQuickReply,
  updateQuickReply,
  deleteQuickReply,
  reorderQuickReplies,
} from '../services/vendor';
import type { QuickReply } from '../types';

const MAX_QUICK_REPLIES = 10;

export default function QuickRepliesManager({ embedded = false }: { embedded?: boolean }) {
  const { colors } = useTheme();
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchReplies = useCallback(async () => {
    try {
      const data = await getQuickReplies();
      setReplies(data ?? []);
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { fetchReplies(); }, [fetchReplies]);

  const haptic = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAdd = async () => {
    const trimmed = newText?.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      haptic();
      const created = await createQuickReply(trimmed);
      setReplies((prev) => [...(prev ?? []), created]);
      setNewText('');
    } catch { }
    setSaving(false);
  };

  const handleUpdate = async (id: string) => {
    const trimmed = editText?.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const updated = await updateQuickReply(id, trimmed);
      setReplies((prev) => (prev ?? []).map((r) => (r.id === id ? updated : r)));
      setEditingId(null);
      setEditText('');
    } catch { }
    setSaving(false);
  };

  const handleDelete = (id: string) => {
    const doDelete = async () => {
      try {
        haptic();
        await deleteQuickReply(id);
        setReplies((prev) => (prev ?? []).filter((r) => r.id !== id));
      } catch { }
    };
    if (Platform.OS === 'web') {
      doDelete();
    } else {
      Alert.alert('Eliminar', '¿Eliminar esta respuesta rápida?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= (replies?.length ?? 0)) return;
    haptic();
    const updated = [...(replies ?? [])];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    const items = updated.map((r, i) => ({ id: r.id, order: i }));
    setReplies(updated);
    try {
      await reorderQuickReplies(items);
    } catch { }
  };

  const startEdit = (r: QuickReply) => {
    setEditingId(r.id);
    setEditText(r.messageText);
  };

  const s = React.useMemo(() => createStyles(colors), [colors]);

  const replyCount = replies?.length ?? 0;
  const atLimit = replyCount >= MAX_QUICK_REPLIES;

  const content = loading ? (
    <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
  ) : (
    <>
      {(replies ?? []).map((r, idx) => (
        <View key={r.id} style={s.replyRow}>
          {editingId === r.id ? (
            <View style={s.editRow}>
              <TextInput
                style={s.editInput}
                value={editText}
                onChangeText={setEditText}
                autoFocus
                maxLength={500}
              />
              <Pressable onPress={() => handleUpdate(r.id)} disabled={saving} hitSlop={8}>
                <Ionicons name="checkmark-circle" size={26} color={colors.success} />
              </Pressable>
              <Pressable onPress={() => setEditingId(null)} hitSlop={8}>
                <Ionicons name="close-circle" size={26} color={colors.textSecondary} />
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={s.replyText} numberOfLines={2}>{r.messageText}</Text>
              <View style={s.replyActions}>
                <Pressable onPress={() => handleMove(idx, 'up')} disabled={idx === 0} hitSlop={6} style={s.arrowBtn}>
                  <Ionicons name="chevron-up" size={18} color={idx === 0 ? colors.border : colors.textSecondary} />
                </Pressable>
                <Pressable onPress={() => handleMove(idx, 'down')} disabled={idx === (replies?.length ?? 0) - 1} hitSlop={6} style={s.arrowBtn}>
                  <Ionicons name="chevron-down" size={18} color={idx === (replies?.length ?? 0) - 1 ? colors.border : colors.textSecondary} />
                </Pressable>
                <Pressable onPress={() => startEdit(r)} hitSlop={6}>
                  <Ionicons name="pencil" size={16} color={colors.primary} />
                </Pressable>
                <Pressable onPress={() => handleDelete(r.id)} hitSlop={6}>
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                </Pressable>
              </View>
            </>
          )}
        </View>
      ))}

      {atLimit ? (
        <Text style={s.limitText}>Límite alcanzado ({MAX_QUICK_REPLIES}/{MAX_QUICK_REPLIES})</Text>
      ) : (
        <View style={s.addRow}>
          <TextInput
            style={s.addInput}
            value={newText}
            onChangeText={setNewText}
            placeholder="Nueva respuesta rápida..."
            placeholderTextColor={colors.textSecondary}
            maxLength={500}
          />
          <Pressable
            onPress={handleAdd}
            disabled={!newText?.trim() || saving}
            style={[s.addBtn, { opacity: newText?.trim() ? 1 : 0.4 }]}
          >
            <Ionicons name="add-circle" size={30} color={colors.primary} />
          </Pressable>
        </View>
      )}

      {!atLimit && replyCount > 0 ? (
        <Text style={s.counterText}>{replyCount} / {MAX_QUICK_REPLIES}</Text>
      ) : null}
    </>
  );

  if (embedded) return <View>{content}</View>;

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Ionicons name="flash" size={18} color={colors.primary} />
        <Text style={s.headerTitle}>Respuestas rápidas</Text>
      </View>
      <Text style={s.headerDesc}>
        Frases predefinidas que puedes insertar rápidamente al responder
      </Text>
      {content}
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginTop: Spacing.lg,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.textPrimary,
    },
    headerDesc: {
      fontSize: 13,
      color: c.textSecondary,
      marginBottom: Spacing.sm,
    },
    replyRow: {
      backgroundColor: c.cardBg,
      borderRadius: BorderRadius.sm,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    replyText: {
      flex: 1,
      fontSize: 14,
      color: c.textPrimary,
    },
    replyActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    arrowBtn: {
      padding: 2,
    },
    editRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    editInput: {
      flex: 1,
      fontSize: 14,
      color: c.textPrimary,
      borderWidth: 1,
      borderColor: c.primary,
      borderRadius: BorderRadius.sm,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: c.inputBg,
    },
    addRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    addInput: {
      flex: 1,
      fontSize: 14,
      color: c.textPrimary,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: BorderRadius.sm,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: c.inputBg,
    },
    addBtn: {
      padding: 2,
    },
    limitText: {
      fontSize: 13,
      color: c.textSecondary,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: Spacing.sm,
      paddingVertical: 8,
    },
    counterText: {
      fontSize: 12,
      color: c.textSecondary,
      textAlign: 'right',
      marginTop: 4,
    },
  });
