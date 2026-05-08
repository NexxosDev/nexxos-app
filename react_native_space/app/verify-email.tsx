import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { verifyEmailApi, resendVerificationEmailApi } from '../src/services/auth';
import { Spacing } from '../src/theme/colors';
import type { ThemeColors } from '../src/theme/colors';
import Button from '../src/components/Button';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { token = '' } = useLocalSearchParams<{ token?: string }>();
  const { user, refreshUser } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  useEffect(() => {
    if (token) { handleVerifyToken(token as string); }
  }, [token]);

  useEffect(() => {
    if (user?.emailVerified) { router.replace('/role-selection'); }
  }, [user?.emailVerified]);

  const handleVerifyToken = async (verificationToken: string) => {
    if (verifying) return;
    setVerifying(true);
    try {
      await verifyEmailApi(verificationToken);
      setVerifiedSuccess(true);
      Alert.alert('\u00a1\u00c9xito!', 'Tu correo ha sido verificado exitosamente', [
        { text: 'Continuar', onPress: async () => { await refreshUser(); router.replace('/role-selection'); } },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo verificar el correo');
    } finally { setVerifying(false); }
  };

  const handleResend = async () => {
    if (!user?.email) { Alert.alert('Error', 'No se encontr\u00f3 el email del usuario'); return; }
    setLoading(true);
    try {
      await resendVerificationEmailApi(user.email);
      Alert.alert('\u00a1Listo!', 'Se ha reenviado el correo de verificaci\u00f3n. Por favor revisa tu bandeja de entrada.');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo reenviar el correo');
    } finally { setLoading(false); }
  };

  const handleSkipForNow = () => { router.replace('/role-selection'); };

  if (verifying) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Ionicons name="mail" size={80} color={colors.primary} />
          <Text style={styles.title}>Verificando...</Text>
          <Text style={styles.description}>Por favor espera mientras verificamos tu correo.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (verifiedSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          <Text style={styles.title}>\u00a1Verificado!</Text>
          <Text style={styles.description}>Tu correo ha sido verificado exitosamente.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="mail-unread-outline" size={80} color={colors.primary} />
        <Text style={styles.title}>Verifica tu Correo Electr\u00f3nico</Text>
        <Text style={styles.description}>
          Hemos enviado un correo de verificaci\u00f3n a <Text style={styles.email}>{user?.email}</Text>
        </Text>
        <Text style={styles.description}>
          Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificaci\u00f3n.
        </Text>
        <View style={styles.warningBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
          <Text style={styles.warningText}>
            Algunas funcionalidades pueden estar limitadas hasta que verifiques tu correo.
          </Text>
        </View>
        <Button title="Reenviar Correo de Verificaci\u00f3n" onPress={handleResend} loading={loading} style={styles.button} />
        <Button title="Continuar sin Verificar" onPress={handleSkipForNow} variant="outline" style={styles.skipButton} />
        <Text style={styles.helpText}>\u00bfNo recibiste el correo? Revisa tu carpeta de spam o correo no deseado.</Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  content: { flex: 1, padding: Spacing.xl, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: c.textPrimary, marginTop: Spacing.lg, marginBottom: Spacing.md, textAlign: 'center' },
  description: { fontSize: 16, color: c.textSecondary, textAlign: 'center', marginBottom: Spacing.md, lineHeight: 24 },
  email: { fontWeight: '600', color: c.primary },
  warningBox: {
    flexDirection: 'row', backgroundColor: c.warningBg,
    borderLeftWidth: 4, borderLeftColor: c.warning, padding: Spacing.md,
    borderRadius: 8, marginVertical: Spacing.lg, alignItems: 'center',
  },
  warningText: { flex: 1, fontSize: 14, color: c.warningBoxText, marginLeft: Spacing.sm, lineHeight: 20 },
  button: { width: '100%', marginTop: Spacing.lg },
  skipButton: { width: '100%', marginTop: Spacing.md },
  helpText: { fontSize: 14, color: c.textSecondary, textAlign: 'center', marginTop: Spacing.lg, fontStyle: 'italic' },
});
