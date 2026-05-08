import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getErrorMessage } from '../../src/services/api';
import { Spacing } from '../../src/theme/colors';
import type { ThemeColors } from '../../src/theme/colors';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';

export default function LoginScreen() {
  const router = useRouter();
  const { login, user } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      router.replace('/role-selection');
    }
  }, [user]);

  const handleLogin = async () => {
    setError('');
    if (!email?.trim?.()) { setError('Ingresa tu email'); return; }
    if (!password) { setError('Ingresa tu contrase\u00f1a'); return; }
    setLoading(true);
    try {
      await login(email?.trim?.() ?? '', password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>NEXXOS</Text>
            <Text style={styles.title}>Iniciar Sesi\u00f3n</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <Input label="Contrase\u00f1a" value={password} onChangeText={setPassword} secureTextEntry />

          <Button title="Iniciar Sesi\u00f3n" onPress={handleLogin} loading={loading} />

          <Pressable onPress={() => router.push('/auth/forgot-password')} style={styles.link}>
            <Text style={styles.linkText}>\u00bfOlvidaste tu contrase\u00f1a?</Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable onPress={() => router.push('/auth/register-type')} style={styles.link}>
            <Text style={styles.registerText}>\u00bfNo tienes cuenta? <Text style={styles.registerBold}>Reg\u00edstrate</Text></Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  flex: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingTop: Spacing.xxl },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: { fontSize: 36, fontWeight: '800', color: c.primary, letterSpacing: 3 },
  title: { fontSize: 22, fontWeight: '600', color: c.textPrimary, marginTop: Spacing.md },
  error: {
    backgroundColor: c.errorBg, color: c.error, padding: Spacing.md,
    borderRadius: 8, fontSize: 14, marginBottom: Spacing.md, textAlign: 'center',
  },
  link: { alignItems: 'center', marginTop: Spacing.md },
  linkText: { color: c.info, fontSize: 14 },
  divider: { height: 1, backgroundColor: c.border, marginVertical: Spacing.lg },
  registerText: { fontSize: 15, color: c.textSecondary, textAlign: 'center' },
  registerBold: { color: c.primary, fontWeight: '600' },
});
