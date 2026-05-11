import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Spacing, BorderRadius } from '../../src/theme/colors';
import type { ThemeColors } from '../../src/theme/colors';

const CHECKLIST = [
  { icon: 'id-card-outline' as const, label: 'Foto de tu cédula de identidad' },
  { icon: 'camera-outline' as const, label: 'Selfie de verificación (liveness)' },
  { icon: 'car-outline' as const, label: 'Marcas y modelos de vehículos que manejas' },
  { icon: 'construct-outline' as const, label: 'Categorías de repuestos que vendes' },
  { icon: 'location-outline' as const, label: 'Ubicación de tu negocio' },
  { icon: 'storefront-outline' as const, label: 'Datos de tu negocio (nombre, RIF, logo)' },
];

export default function VendorConfirmScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="storefront" size={48} color={colors.primary} />
          </View>
        </View>

        <Text style={styles.title}>¿Listo para ser vendedor?</Text>
        <Text style={styles.subtitle}>
          Para activar tu perfil de vendedor necesitaremos algunos datos. Ten a mano lo siguiente:
        </Text>

        <View style={styles.checklistContainer}>
          {CHECKLIST.map((item, index) => (
            <View key={index} style={styles.checkItem}>
              <View style={styles.checkIconWrap}>
                <Ionicons name={item.icon} size={22} color={colors.primary} />
              </View>
              <Text style={styles.checkLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.timeEstimate}>
          <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.timeText}>Tiempo estimado: ~5 minutos</Text>
        </View>

        <View style={styles.buttonRow}>
          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelText}>CANCELAR</Text>
          </Pressable>
          <Pressable
            style={styles.continueButton}
            onPress={() => router.push('/auth/register-vendor?existing=1')}
          >
            <Text style={styles.continueText}>CONTINUAR</Text>
            <Ionicons name="arrow-forward" size={18} color="#121212" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    scroll: { padding: Spacing.lg, paddingBottom: 40 },
    backButton: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center',
      marginBottom: Spacing.lg,
    },
    iconContainer: { alignItems: 'center', marginBottom: Spacing.lg },
    iconCircle: {
      width: 96, height: 96, borderRadius: 48,
      backgroundColor: c.primary + '18',
      alignItems: 'center', justifyContent: 'center',
    },
    title: {
      fontSize: 26, fontWeight: '700', color: c.textPrimary,
      textAlign: 'center', marginBottom: Spacing.sm,
    },
    subtitle: {
      fontSize: 15, color: c.textSecondary, textAlign: 'center',
      lineHeight: 22, marginBottom: Spacing.xl, paddingHorizontal: Spacing.sm,
    },
    checklistContainer: {
      backgroundColor: c.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    checkItem: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: c.border,
    },
    checkIconWrap: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: c.primary + '15',
      alignItems: 'center', justifyContent: 'center',
      marginRight: 12,
    },
    checkLabel: { fontSize: 14, color: c.textPrimary, flex: 1 },
    timeEstimate: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      marginBottom: Spacing.xl,
    },
    timeText: { fontSize: 14, color: c.textSecondary, marginLeft: 6 },
    buttonRow: {
      flexDirection: 'row', gap: 12,
    },
    cancelButton: {
      flex: 1, paddingVertical: 14, borderRadius: BorderRadius.md,
      borderWidth: 1.5, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center',
    },
    cancelText: { fontSize: 15, fontWeight: '600', color: c.textSecondary },
    continueButton: {
      flex: 1.5, paddingVertical: 14, borderRadius: BorderRadius.md,
      backgroundColor: c.primary,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    },
    continueText: { fontSize: 15, fontWeight: '700', color: '#121212' },
  });
