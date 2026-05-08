import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { Spacing, BorderRadius } from '../src/theme/colors';
import type { ThemeColors } from '../src/theme/colors';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (isLoading) return null;
  if (!user) return <Redirect href="/auth/login" />;

  const roles = user?.roles ?? [];
  const hasVendor = user?.hasVendorProfile ?? roles?.includes?.('VENDEDOR') ?? false;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.greeting}>¡Hola, {user?.firstName ?? 'Usuario'}!</Text>
        <Text style={styles.title}>¿Qué modo deseas usar hoy?</Text>

        <Pressable style={styles.card} onPress={() => router.replace('/client')}>
          <View style={styles.cardIcon}>
            <Ionicons name="search-outline" size={36} color={colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Cliente</Text>
            <Text style={styles.cardDesc}>Solicita lo que necesites y obtén respuestas en minutos</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          style={[styles.card, !hasVendor && styles.cardLocked]}
          onPress={() => {
            if (hasVendor) router.replace('/vendor');
            else router.push('/auth/register-vendor');
          }}
        >
          <View style={styles.cardIcon}>
            <Ionicons name={hasVendor ? 'storefront-outline' : 'lock-closed-outline'} size={36} color={hasVendor ? colors.primary : colors.textSecondary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Vendedor</Text>
            <Text style={styles.cardDesc}>
              {hasVendor ? 'Permite que te encuentren sin necesidad de buscar' : 'Completa tu perfil de vendedor'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  container: { flex: 1, padding: Spacing.lg, justifyContent: 'center' },
  greeting: { fontSize: 16, color: c.textSecondary, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '700', color: c.textPrimary, marginBottom: Spacing.xl },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: c.cardBg,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 2, borderColor: c.primary,
  },
  cardLocked: { borderColor: c.border, opacity: 0.75 },
  cardIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: `${c.primary}15`,
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: c.textPrimary, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: c.textSecondary, lineHeight: 18 },
});
