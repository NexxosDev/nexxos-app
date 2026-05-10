import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';
import type { ChatMessageReplyTo } from '../types';

interface ChatMessageProps {
  messageText: string;
  senderName: string;
  createdAt: string;
  isOwn: boolean;
  isVendorMessage?: boolean;
  messageType?: string;
  imageUrl?: string | null;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isEdited?: boolean;
  deletedForAll?: boolean;
  replyTo?: ChatMessageReplyTo | null;
  onReplyPress?: (replyToId: string) => void;
  onLongPress?: () => void;
}

const { width: SCREEN_W } = Dimensions.get('window');
const IMG_SIZE = SCREEN_W * 0.55;

function StatusTicks({ status, colors }: { status?: string; colors: ThemeColors }) {
  if (!status) return null;
  const isRead = status === 'read';
  const tickColor = isRead ? '#4FC3F7' : (colors.textSecondary ?? '#999');

  if (status === 'sending') {
    return <Ionicons name="time-outline" size={13} color={colors.textSecondary ?? '#999'} style={{ marginLeft: 4 }} />;
  }
  if (status === 'sent') {
    return <Ionicons name="checkmark" size={14} color={tickColor} style={{ marginLeft: 4 }} />;
  }
  return (
    <View style={{ flexDirection: 'row', marginLeft: 4 }}>
      <Ionicons name="checkmark" size={14} color={tickColor} style={{ marginRight: -6 }} />
      <Ionicons name="checkmark" size={14} color={tickColor} />
    </View>
  );
}

export default function ChatMessage({
  messageText, senderName, createdAt, isOwn, isVendorMessage = false,
  messageType, imageUrl, status, isEdited, deletedForAll,
  replyTo, onReplyPress, onLongPress,
}: ChatMessageProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const formatTime = (d: string) => {
    try { return new Date(d)?.toLocaleTimeString?.('es-VE', { hour: '2-digit', minute: '2-digit' }) ?? ''; }
    catch { return ''; }
  };

  const shouldBeYellow = isVendorMessage;
  const shouldBeOnRight = isVendorMessage;
  const isImage = !deletedForAll && (messageType ?? 'text') === 'image' && !!imageUrl;
  const isDeleted = !!deletedForAll;

  const replySnippet = (replyTo?.messageText ?? '').length > 60
    ? (replyTo?.messageText ?? '').substring(0, 57) + '...'
    : (replyTo?.messageText ?? '');

  return (
    <View style={[styles.row, shouldBeOnRight ? styles.rowOwn : styles.rowOther]}>
      <Pressable
        style={[
          styles.bubble,
          shouldBeYellow ? styles.bubbleVendor : styles.bubbleClient,
          isImage && styles.bubbleImage,
          isDeleted && styles.bubbleDeleted,
        ]}
        onLongPress={isOwn && !isDeleted ? onLongPress : undefined}
        delayLongPress={400}
      >
        {!isOwn ? <Text style={styles.sender}>{senderName ?? ''}</Text> : null}

        {replyTo?.id && !isDeleted ? (
          <Pressable
            style={[styles.quotedBox, shouldBeYellow ? styles.quotedBoxVendor : styles.quotedBoxClient]}
            onPress={() => onReplyPress?.(replyTo.id)}
          >
            <Text style={styles.quotedName} numberOfLines={1}>{replyTo?.senderName ?? ''}</Text>
            <Text style={styles.quotedText} numberOfLines={2}>{replySnippet}</Text>
          </Pressable>
        ) : null}

        {isDeleted ? (
          <View style={styles.deletedRow}>
            <Ionicons name="ban-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.deletedText}>Mensaje eliminado</Text>
          </View>
        ) : isImage ? (
          <Pressable onPress={() => setPreviewOpen(true)}>
            <Image source={{ uri: imageUrl ?? '' }} style={styles.image} contentFit="cover" transition={200} placeholder={{ color: colors.border } as any} />
          </Pressable>
        ) : (
          <Text style={[styles.text, shouldBeYellow ? styles.textVendor : styles.textClient]}>{messageText ?? ''}</Text>
        )}

        <View style={styles.metaRow}>
          {isEdited && !isDeleted ? (
            <Text style={styles.editedLabel}>editado</Text>
          ) : null}
          <Text style={styles.time}>{formatTime(createdAt ?? '')}</Text>
          {isOwn ? <StatusTicks status={status} colors={colors} /> : null}
        </View>
      </Pressable>

      {isImage ? (
        <Modal visible={previewOpen} transparent animationType="fade" onRequestClose={() => setPreviewOpen(false)}>
          <View style={styles.previewOverlay}>
            <Pressable style={styles.previewClose} onPress={() => setPreviewOpen(false)}>
              <Ionicons name="close-circle" size={36} color="#fff" />
            </Pressable>
            <Image source={{ uri: imageUrl ?? '' }} style={styles.previewImage} contentFit="contain" transition={200} />
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  row: { marginBottom: Spacing.sm, paddingHorizontal: Spacing.md },
  rowOwn: { alignItems: 'flex-end' },
  rowOther: { alignItems: 'flex-start' },
  bubble: { maxWidth: '80%', padding: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.lg },
  bubbleVendor: { backgroundColor: c.bubbleVendor, borderBottomRightRadius: 4, borderWidth: 1, borderColor: c.bubbleVendorBorder },
  bubbleClient: { backgroundColor: c.bubbleClient, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: c.bubbleClientBorder },
  bubbleImage: { padding: 4, paddingHorizontal: 4 },
  bubbleDeleted: { opacity: 0.7 },
  sender: { fontSize: 11, fontWeight: '600', color: c.textSecondary, marginBottom: 2, paddingHorizontal: 4 },
  quotedBox: { borderLeftWidth: 3, borderRadius: 6, padding: 6, paddingLeft: 8, marginBottom: 4 },
  quotedBoxVendor: { borderLeftColor: '#F9A825', backgroundColor: 'rgba(249,168,37,0.12)' },
  quotedBoxClient: { borderLeftColor: c.border, backgroundColor: `${c.textSecondary}10` },
  quotedName: { fontSize: 11, fontWeight: '700', color: '#F9A825', marginBottom: 1 },
  quotedText: { fontSize: 12, color: c.textSecondary, lineHeight: 16 },
  text: { fontSize: 15, lineHeight: 20 },
  textVendor: { color: c.textPrimary },
  textClient: { color: c.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 3, paddingHorizontal: 4 },
  editedLabel: { fontSize: 10, color: c.textSecondary, fontStyle: 'italic', marginRight: 4 },
  time: { fontSize: 10, color: c.textSecondary },
  deletedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2 },
  deletedText: { fontSize: 14, fontStyle: 'italic', color: c.textSecondary },
  image: { width: IMG_SIZE, height: IMG_SIZE, borderRadius: BorderRadius.md },
  previewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  previewClose: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, right: 20, zIndex: 10 },
  previewImage: { width: SCREEN_W, height: SCREEN_W * 1.2 },
});
