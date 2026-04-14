import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../theme/colors';

interface ChatMessageProps {
  messageText: string;
  senderName: string;
  createdAt: string;
  isOwn: boolean;
}

export default function ChatMessage({ messageText, senderName, createdAt, isOwn }: ChatMessageProps) {
  const formatTime = (d: string) => {
    try {
      const date = new Date(d);
      return date?.toLocaleTimeString?.('es-VE', { hour: '2-digit', minute: '2-digit' }) ?? '';
    } catch { return ''; }
  };

  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        {!isOwn ? <Text style={styles.sender}>{senderName ?? ''}</Text> : null}
        <Text style={[styles.text, isOwn ? styles.textOwn : styles.textOther]}>{messageText ?? ''}</Text>
        <Text style={[styles.time, isOwn ? styles.timeOwn : styles.timeOther]}>{formatTime(createdAt ?? '')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: Spacing.sm, paddingHorizontal: Spacing.md },
  rowOwn: { alignItems: 'flex-end' },
  rowOther: { alignItems: 'flex-start' },
  bubble: { maxWidth: '80%', padding: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.lg },
  bubbleOwn: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: Colors.backgroundSection, borderBottomLeftRadius: 4 },
  sender: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, marginBottom: 2 },
  text: { fontSize: 15, lineHeight: 20 },
  textOwn: { color: Colors.accent },
  textOther: { color: Colors.textPrimary },
  time: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  timeOwn: { color: 'rgba(0,0,0,0.5)' },
  timeOther: { color: Colors.textSecondary },
});
