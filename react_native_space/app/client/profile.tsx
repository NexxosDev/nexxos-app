import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { Colors, Spacing, BorderRadius } from '../../src/theme/colors';
import Button from '../../src/components/Button';
import LoadingSpinner from '../../src/components/LoadingSpinner';

export default function ClientProfile() {
  const router = useRouter();
  const { user, logout, refreshUser, isLoading } = useAuth();
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
      <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.firstName ?? ''} {user?.lastName ?? ''}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
        </View>

        <View style={styles.infoCard}>
          <InfoRow icon="person-outline" label="Nombre" value={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`} />
          <InfoRow icon="card-outline" label="C\u00e9dula" value={user?.documentId ?? '-'} />
          <InfoRow icon="call-outline" label="Tel\u00e9fono" value={user?.phone ?? '-'} />
          <InfoRow icon="mail-outline" label="Email" value={user?.email ?? '-'} />
        </View>

        <Button title="Editar Perfil" variant="secondary" onPress={() => router.push('/edit-profile')} style={styles.editBtn} />
        <Button title="Cambiar Modo" variant="ghost" onPress={() => router.replace('/role-selection')} icon={<Ionicons name="swap-horizontal-outline" size={18} color={Colors.textSecondary} />} />
        <Button title="Cerrar Sesi\u00f3n" variant="destructive" onPress={handleLogout} style={styles.logoutBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon} size={20} color={Colors.textSecondary} />
      <View style={infoStyles.textCol}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg },
  avatarContainer: { alignItems: 'center', marginBottom: Spacing.lg },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm,
  },
  initials: { fontSize: 28, fontWeight: '700', color: Colors.accent },
  name: { fontSize: 20, fontWeight: '600', color: Colors.textPrimary },
  email: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  infoCard: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg,
  },
  editBtn: { marginBottom: Spacing.sm },
  logoutBtn: { marginTop: Spacing.sm },
});

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.md },
  textCol: { flex: 1 },
  label: { fontSize: 12, color: Colors.textSecondary },
  value: { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
});
