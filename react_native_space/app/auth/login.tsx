import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { getErrorMessage } from '../../src/services/api';
import { Colors, Spacing } from '../../src/theme/colors';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';

export default function LoginScreen() {
  const router = useRouter();
  const { login, user } = useAuth();
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
    if (!password) { setError('Ingresa tu contraseña'); return; }
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
            <Text style={styles.title}>Iniciar Sesión</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button title="Iniciar Sesión" onPress={handleLogin} loading={loading} />

          <Pressable onPress={() => router.push('/auth/forgot-password')} style={styles.link}>
            <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable onPress={() => router.push('/auth/register-type')} style={styles.link}>
            <Text style={styles.registerText}>¿No tienes cuenta? <Text style={styles.registerBold}>Regístrate</Text></Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingTop: Spacing.xxl },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: { fontSize: 36, fontWeight: '800', color: Colors.primary, letterSpacing: 3 },
  title: { fontSize: 22, fontWeight: '600', color: Colors.textPrimary, marginTop: Spacing.md },
  error: {
    backgroundColor: '#FEE2E2', color: Colors.error, padding: Spacing.md,
    borderRadius: 8, fontSize: 14, marginBottom: Spacing.md, textAlign: 'center',
  },
  link: { alignItems: 'center', marginTop: Spacing.md },
  linkText: { color: Colors.info, fontSize: 14 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.lg },
  registerText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center' },
  registerBold: { color: Colors.primary, fontWeight: '600' },
});
