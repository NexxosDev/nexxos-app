import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import { Spacing, BorderRadius } from '../src/theme/colors';
import type { ThemeColors } from '../src/theme/colors';
import { submitSuggestion } from '../src/services/suggestions';

const MAX_LENGTH = 500;

export default function SuggestionsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const canSubmit = text?.trim()?.length > 0 && !sending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSending(true);
    try {
      await submitSuggestion(text.trim());
      Alert.alert(
        '¡Gracias! 🎉',
        '¡Gracias por tu sugerencia! Nos ayuda a mejorar el catálogo de NEXXOS.',
        [{ text: 'Aceptar', onPress: () => { setText(''); router.back(); } }],
      );
    } catch {
      Alert.alert('Error', 'No se pudo enviar tu sugerencia. Inténtalo de nuevo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Ayúdanos a crecer</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icon & Description */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="bulb-outline" size={40} color={colors.primary} />
            </View>
          </View>

          <Text style={styles.title}>¿Qué te gustaría encontrar?</Text>
          <Text style={styles.subtitle}>
            Cuéntanos qué marca, modelo o repuesto te gustaría ver en NEXXOS.
            Tu sugerencia nos ayuda a expandir nuestro catálogo.
          </Text>

          {/* Text Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="¿Qué marca, modelo o repuesto te gustaría encontrar en NEXXOS?"
              placeholderTextColor={colors.textSecondary}
              value={text}
              onChangeText={(v) => setText(v?.slice(0, MAX_LENGTH) ?? '')}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={MAX_LENGTH}
              editable={!sending}
            />
            <Text style={styles.charCount}>
              {text?.length ?? 0}/{MAX_LENGTH}
            </Text>
          </View>

          {/* Submit Button */}
          <Pressable
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <>
                <Ionicons name="send" size={18} color={colors.accent} style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Enviar sugerencia</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: c.textPrimary,
    },
    scroll: {
      padding: Spacing.lg,
      paddingBottom: 40,
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: c.backgroundSection,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: c.primary,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: c.textPrimary,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    subtitle: {
      fontSize: 15,
      color: c.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: Spacing.xl,
    },
    inputContainer: {
      marginBottom: Spacing.lg,
    },
    textArea: {
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: 15,
      color: c.textPrimary,
      minHeight: 140,
      maxHeight: 200,
    },
    charCount: {
      fontSize: 12,
      color: c.textSecondary,
      textAlign: 'right',
      marginTop: 4,
    },
    submitBtn: {
      backgroundColor: c.primary,
      borderRadius: BorderRadius.md,
      paddingVertical: 14,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    submitBtnDisabled: {
      opacity: 0.5,
    },
    submitBtnText: {
      fontSize: 16,
      fontWeight: '600',
      color: c.accent,
    },
  });
