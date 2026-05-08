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
  replyTo?: ChatMessageReplyTo | null;
  onReplyPress?: (replyToId: string) => void;
}

const { width: SCREEN_W } = Dimensions.get('window');
const IMG_SIZE = SCREEN_W * 0.55;

export default function ChatMessage({
  messageText, senderName, createdAt, isOwn, isVendorMessage = false,
  messageType, imageUrl, replyTo, onReplyPress,
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
  const isImage = (messageType ?? 'text') === 'image' && !!imageUrl;

  const replySnippet = (replyTo?.messageText ?? '').length > 60
    ? (replyTo?.messageText ?? '').substring(0, 57) + '...'
    : (replyTo?.messageText ?? '');

  return (
    <View style={[styles.row, shouldBeOnRight ? styles.rowOwn : styles.rowOther]}>
      <View style={[styles.bubble, shouldBeYellow ? styles.bubbleVendor : styles.bubbleClient, isImage && styles.bubbleImage]}>
        {!isOwn ? <Text style={styles.sender}>{senderName ?? ''}</Text> : null}

        {replyTo?.id ? (
          <Pressable
            style={[styles.quotedBox, shouldBeYellow ? styles.quotedBoxVendor : styles.quotedBoxClient]}
            onPress={() => onReplyPress?.(replyTo.id)}
          >
            <Text style={styles.quotedName} numberOfLines={1}>{replyTo?.senderName ?? ''}</Text>
            <Text style={styles.quotedText} numberOfLines={2}>{replySnippet}</Text>
          </Pressable>
        ) : null}

        {isImage ? (
          <Pressable onPress={() => setPreviewOpen(true)}>
            <Image source={{ uri: imageUrl ?? '' }} style={styles.image} contentFit="cover" transition={200} placeholder={{ color: colors.border } as any} />
          </Pressable>
        ) : (
          <Text style={[styles.text, shouldBeYellow ? styles.textVendor : styles.textClient]}>{messageText ?? ''}</Text>
        )}

        <Text style={styles.time}>{isImage ? '📷 ' : ''}{formatTime(createdAt ?? '')}</Text>
      </View>

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
  sender: { fontSize: 11, fontWeight: '600', color: c.textSecondary, marginBottom: 2, paddingHorizontal: 4 },
  quotedBox: { borderLeftWidth: 3, borderRadius: 6, padding: 6, paddingLeft: 8, marginBottom: 4 },
  quotedBoxVendor: { borderLeftColor: '#F9A825', backgroundColor: 'rgba(249,168,37,0.12)' },
  quotedBoxClient: { borderLeftColor: c.border, backgroundColor: `${c.textSecondary}10` },
  quotedName: { fontSize: 11, fontWeight: '700', color: '#F9A825', marginBottom: 1 },
  quotedText: { fontSize: 12, color: c.textSecondary, lineHeight: 16 },
  text: { fontSize: 15, lineHeight: 20 },
  textVendor: { color: c.textPrimary },
  textClient: { color: c.textPrimary },
  time: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end', paddingHorizontal: 4, color: c.textSecondary },
  image: { width: IMG_SIZE, height: IMG_SIZE, borderRadius: BorderRadius.md },
  previewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  previewClose: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, right: 20, zIndex: 10 },
  previewImage: { width: SCREEN_W, height: SCREEN_W * 1.2 },
});
