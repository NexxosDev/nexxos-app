import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { getQuickReplies } from '../services/vendor';
import type { QuickReply } from '../types';
import * as Haptics from 'expo-haptics';

interface Props {
  onSelect: (text: string) => void;
  style?: StyleProp<ViewStyle>;
}

export default function QuickReplyPicker({ onSelect, style }: Props) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchReplies = useCallback(async () => {
    if (fetched && replies.length > 0) return;
    setLoading(true);
    try {
      const data = await getQuickReplies();
      setReplies(data ?? []);
      setFetched(true);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [fetched, replies.length]);

  const handleOpen = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisible(true);
    fetchReplies();
  }, [fetchReplies]);

  const handleSelect = useCallback(
    (text: string) => {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(text);
      setVisible(false);
    },
    [onSelect],
  );

  return (
    <>
      <Pressable
        onPress={handleOpen}
        style={[styles.triggerBtn, { backgroundColor: colors.primary + '20' }, style]}
        accessibilityLabel="Respuestas rápidas"
        accessibilityHint="Abre la lista de respuestas rápidas"
      >
        <Ionicons name="flash" size={20} color={colors.primary} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => {}}
          >
            <View style={styles.sheetHeader}>
              <Ionicons name="flash" size={18} color={colors.primary} />
              <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Respuestas rápidas</Text>
              <Pressable onPress={() => setVisible(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            {loading ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
            ) : replies.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No tienes respuestas rápidas configuradas
              </Text>
            ) : (
              <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {replies.map((r) => (
                  <Pressable
                    key={r.id}
                    onPress={() => handleSelect(r.messageText)}
                    style={({ pressed }) => [
                      styles.replyItem,
                      {
                        backgroundColor: pressed
                          ? colors.primary + '18'
                          : colors.background + '80',
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.replyText, { color: colors.textPrimary }]}>
                      {r.messageText}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '60%',
    paddingBottom: 30,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    gap: 8,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
  },
  replyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 8,
  },
  replyText: {
    flex: 1,
    fontSize: 15,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 24,
    fontSize: 14,
  },
});
