import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { Colors, Spacing, BorderRadius } from '../src/theme/colors';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Redirect href="/auth/login" />;

  const roles = user?.roles ?? [];
  const hasVendor = user?.hasVendorProfile ?? roles?.includes?.('VENDEDOR') ?? false;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.greeting}>\u00a1Hola, {user?.firstName ?? 'Usuario'}!</Text>
        <Text style={styles.title}>\u00bfQu\u00e9 modo deseas usar hoy?</Text>

        <Pressable style={styles.card} onPress={() => router.replace('/client')}>
          <View style={styles.cardIcon}>
            <Ionicons name="search-outline" size={36} color={Colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Cliente</Text>
            <Text style={styles.cardDesc}>Solicita lo que necesites y obt\u00e9n respuestas en minutos</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
        </Pressable>

        <Pressable
          style={[styles.card, !hasVendor && styles.cardLocked]}
          onPress={() => {
            if (hasVendor) router.replace('/vendor');
            else router.push('/auth/register-vendor');
          }}
        >
          <View style={styles.cardIcon}>
            <Ionicons name={hasVendor ? 'storefront-outline' : 'lock-closed-outline'} size={36} color={hasVendor ? Colors.primary : Colors.textSecondary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Vendedor</Text>
            <Text style={styles.cardDesc}>
              {hasVendor ? 'Permite que te encuentren sin necesidad de buscar' : 'Completa tu perfil de vendedor'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: Spacing.lg, justifyContent: 'center' },
  greeting: { fontSize: 16, color: Colors.textSecondary, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xl },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 2, borderColor: Colors.primary,
  },
  cardLocked: { borderColor: Colors.border, opacity: 0.75 },
  cardIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
});
