import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { useTheme } from '../src/contexts/ThemeContext';
import api, { getErrorMessage } from '../src/services/api';
import { Spacing } from '../src/theme/colors';
import type { ThemeColors } from '../src/theme/colors';
import Input from '../src/components/Input';
import Button from '../src/components/Button';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setError(''); setSuccess(false); setLoading(true);
    try {
      await api.patch('/users/profile', {
        firstName: firstName?.trim?.() ?? '',
        lastName: lastName?.trim?.() ?? '',
        phone: phone?.trim?.() ?? '',
      });
      await refreshUser?.();
      setSuccess(true);
      setTimeout(() => router.back(), 1000);
    } catch (err) { setError(getErrorMessage(err)); } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.topTitle}>Editar Perfil</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>Perfil actualizado \u2713</Text> : null}
          <Input label="Nombre" value={firstName} onChangeText={setFirstName} />
          <Input label="Apellido" value={lastName} onChangeText={setLastName} />
          <Input label="Tel\u00e9fono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <View style={styles.readonlyField}>
            <Text style={styles.readonlyLabel}>Email</Text>
            <Text style={styles.readonlyValue}>{user?.email ?? ''}</Text>
          </View>
          <View style={styles.readonlyField}>
            <Text style={styles.readonlyLabel}>C\u00e9dula</Text>
            <Text style={styles.readonlyValue}>{user?.documentId ?? ''}</Text>
          </View>
          <Button title="Guardar Cambios" onPress={handleSave} loading={loading} style={styles.saveBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  topTitle: { fontSize: 17, fontWeight: '600', color: c.textPrimary },
  scroll: { padding: Spacing.lg },
  error: { backgroundColor: c.errorBg, color: c.error, padding: Spacing.md, borderRadius: 8, fontSize: 14, marginBottom: Spacing.md },
  success: { backgroundColor: c.successBg, color: c.success, padding: Spacing.md, borderRadius: 8, fontSize: 14, marginBottom: Spacing.md, textAlign: 'center' },
  readonlyField: { marginBottom: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: 14, backgroundColor: c.backgroundSection, borderRadius: 12 },
  readonlyLabel: { fontSize: 12, color: c.textSecondary },
  readonlyValue: { fontSize: 15, color: c.textPrimary, fontWeight: '500', marginTop: 2 },
  saveBtn: { marginTop: Spacing.md },
});
