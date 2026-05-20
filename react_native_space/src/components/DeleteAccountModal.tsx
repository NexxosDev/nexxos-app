import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';
import { deleteAccountApi } from '../services/auth';

interface Props {
  visible: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

const CONFIRM_WORD = 'ELIMINAR';

export default function DeleteAccountModal({ visible, onClose, onDeleted }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const isConfirmed = input.trim().toUpperCase() === CONFIRM_WORD;

  const handleDelete = async () => {
    if (!isConfirmed || loading) return;
    setLoading(true);
    try {
      await deleteAccountApi();
      onDeleted();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'No se pudo eliminar la cuenta. Intenta de nuevo.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInput('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.modal}>
          <View style={styles.iconWrap}>
            <Ionicons name="warning" size={40} color={colors.error} />
          </View>

          <Text style={styles.title}>Eliminar Cuenta</Text>

          <Text style={styles.warning}>
            Esta acción es <Text style={styles.bold}>irreversible</Text>. Se eliminarán permanentemente:
          </Text>

          <View style={styles.list}>
            <Text style={styles.listItem}>• Tu nombre, correo, teléfono y cédula</Text>
            <Text style={styles.listItem}>• Tu foto de perfil y documentos de identidad</Text>
            <Text style={styles.listItem}>• Tus tokens de sesión y notificaciones</Text>
            {/* vendor-specific */}
            <Text style={styles.listItem}>• Datos de tu negocio (si eres vendedor)</Text>
          </View>

          <Text style={styles.warning}>
            Las solicitudes y mensajes existentes se conservarán de forma anónima.
          </Text>

          <Text style={styles.confirmLabel}>
            Escribe <Text style={styles.bold}>{CONFIRM_WORD}</Text> para confirmar:
          </Text>

          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={CONFIRM_WORD}
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!loading}
          />

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelBtn} onPress={handleClose} disabled={loading}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.deleteBtn, !isConfirmed && styles.deleteBtnDisabled]}
              onPress={handleDelete}
              disabled={!isConfirmed || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.deleteText}>Eliminar cuenta</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modal: {
    backgroundColor: c.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    width: '90%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: c.error,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  warning: {
    fontSize: 14,
    color: c.textPrimary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  bold: {
    fontWeight: '700',
  },
  list: {
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
  listItem: {
    fontSize: 13,
    color: c.textSecondary,
    lineHeight: 20,
  },
  confirmLabel: {
    fontSize: 14,
    color: c.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: c.backgroundSection,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: c.textPrimary,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: Spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.sm,
    backgroundColor: c.backgroundSection,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: c.textPrimary,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.sm,
    backgroundColor: c.error,
    alignItems: 'center',
  },
  deleteBtnDisabled: {
    opacity: 0.4,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
