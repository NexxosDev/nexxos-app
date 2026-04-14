import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { forgotPasswordApi } from '../../src/services/auth';
import { getErrorMessage } from '../../src/services/api';
import { Colors, Spacing } from '../../src/theme/colors';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    setError('');
    if (!email?.trim?.()) { setError('Ingresa tu email'); return; }
    setLoading(true);
    try {
      await forgotPasswordApi(email?.trim?.() ?? '');
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Recuperar Contrase\u00f1a</Text>
          <Text style={styles.desc}>Ingresa tu email y te enviaremos instrucciones para recuperar tu contrase\u00f1a.</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {sent ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
              <Text style={styles.successText}>Si el email existe, recibir\u00e1s instrucciones para restablecer tu contrase\u00f1a.</Text>
            </View>
          ) : (
            <>
              <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <Button title="Enviar" onPress={handleSend} loading={loading} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingTop: Spacing.md },
  back: { marginBottom: Spacing.md, width: 44, height: 44, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  desc: { fontSize: 15, color: Colors.textSecondary, marginBottom: Spacing.lg, lineHeight: 22 },
  error: { backgroundColor: '#FEE2E2', color: Colors.error, padding: Spacing.md, borderRadius: 8, fontSize: 14, marginBottom: Spacing.md },
  successBox: { backgroundColor: '#E8F5E9', padding: Spacing.lg, borderRadius: 12, alignItems: 'center', gap: 12 },
  successText: { fontSize: 15, color: Colors.textPrimary, textAlign: 'center', lineHeight: 22 },
});
