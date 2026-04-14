import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../src/theme/colors';

export default function RegisterTypeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
      </Pressable>
      <Text style={styles.title}>¿Cómo deseas registrarte?</Text>

      <View style={styles.cards}>
        <Pressable style={styles.card} onPress={() => router.push('/auth/register-client')}>
          <View style={styles.iconBg}>
            <Ionicons name="person-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.cardTitle}>Cliente</Text>
          <Text style={styles.cardSub}>Busca repuestos fácilmente</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => router.push('/auth/register-vendor')}>
          <View style={styles.iconBg}>
            <Ionicons name="storefront-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.cardTitle}>Vendedor</Text>
          <Text style={styles.cardSub}>Ofrece tus productos</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => router.push('/auth/login')} style={styles.loginLink}>
        <Text style={styles.loginText}>¿Ya tienes cuenta? <Text style={styles.loginBold}>Inicia Sesión</Text></Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg },
  back: { width: 44, height: 44, justifyContent: 'center', marginBottom: Spacing.md },
  title: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xl },
  cards: { gap: Spacing.md },
  card: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    alignItems: 'center', borderWidth: 2, borderColor: Colors.border,
  },
  iconBg: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  cardSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  loginLink: { alignItems: 'center', marginTop: Spacing.xl },
  loginText: { fontSize: 15, color: Colors.textSecondary },
  loginBold: { color: Colors.primary, fontWeight: '600' },
});
