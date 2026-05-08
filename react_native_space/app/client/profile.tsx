import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, RefreshControl, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Spacing, BorderRadius } from '../../src/theme/colors';
import type { ThemeColors } from '../../src/theme/colors';
import Button from '../../src/components/Button';
import ProfileAvatar from '../../src/components/ProfileAvatar';
import LoadingSpinner from '../../src/components/LoadingSpinner';

export default function ClientProfile() {
  const router = useRouter();
  const { user, logout, refreshUser, isLoading } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { refreshUser?.(); }, []));

  const handleLogout = () => {
    Alert.alert('Cerrar Sesi\u00f3n', '\u00bfEst\u00e1s seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar Sesi\u00f3n', style: 'destructive', onPress: async () => { await logout(); router.replace('/auth/login'); } },
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser?.();
    setRefreshing(false);
  };

  if (isLoading) return <LoadingSpinner />;

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}>
        {/* Dark mode toggle */}
        <View style={styles.themeRow}>
          <Pressable style={styles.themeBtn} onPress={toggleTheme} hitSlop={8}>
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.avatarContainer}>
          <ProfileAvatar
            imageUrl={user?.profileImageUrl}
            initials={initials}
            size={90}
            onImageUpdated={() => refreshUser?.()}
          />
          <Text style={styles.name}>{user?.firstName ?? ''} {user?.lastName ?? ''}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
        </View>

        <View style={styles.infoCard}>
          <InfoRow icon="person-outline" label="Nombre" value={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`} c={colors} />
          <InfoRow icon="card-outline" label="C\u00e9dula" value={user?.documentId ?? '-'} c={colors} />
          <InfoRow icon="call-outline" label="Tel\u00e9fono" value={user?.phone ?? '-'} c={colors} />
          <InfoRow icon="mail-outline" label="Email" value={user?.email ?? '-'} c={colors} />
        </View>

        <Button title="Editar Perfil" variant="secondary" onPress={() => router.push('/edit-profile')} style={styles.editBtn} />
        <Button title="Cambiar Modo" variant="ghost" onPress={() => router.replace('/role-selection')} icon={<Ionicons name="swap-horizontal-outline" size={18} color={colors.textSecondary} />} />
        <Button title="Cerrar Sesi\u00f3n" variant="destructive" onPress={handleLogout} style={styles.logoutBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value, c }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; c: ThemeColors }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.md }}>
      <Ionicons name={icon} size={20} color={c.textSecondary} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: c.textSecondary }}>{label}</Text>
        <Text style={{ fontSize: 15, color: c.textPrimary, fontWeight: '500' }}>{value}</Text>
      </View>
    </View>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  scroll: { padding: Spacing.lg },
  themeRow: { alignItems: 'flex-end', marginBottom: Spacing.sm },
  themeBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: c.backgroundSection,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarContainer: { alignItems: 'center', marginBottom: Spacing.lg },
  name: { fontSize: 20, fontWeight: '600', color: c.textPrimary, marginTop: Spacing.sm },
  email: { fontSize: 14, color: c.textSecondary, marginTop: 2 },
  infoCard: {
    backgroundColor: c.cardBg, borderRadius: BorderRadius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: c.border, marginBottom: Spacing.lg,
  },
  editBtn: { marginBottom: Spacing.sm },
  logoutBtn: { marginTop: Spacing.sm },
});
