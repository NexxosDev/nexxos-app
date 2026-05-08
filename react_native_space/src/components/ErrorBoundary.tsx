import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LightColors, Spacing } from '../theme/colors';

// ErrorBoundary is a class component — cannot use hooks.
// We use LightColors as static fallback. Since this only renders on errors,
// a light-themed error screen is acceptable as a safe fallback.

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info?.componentStack);
  }

  handleRetry = () => { this.setState({ hasError: false, error: null }); };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Algo salió mal</Text>
          <Text style={styles.message}>{this.state?.error?.message ?? 'Error desconocido'}</Text>
          <Pressable style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Reintentar</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const c = LightColors;
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg, backgroundColor: c.background },
  emoji: { fontSize: 48, marginBottom: Spacing.md },
  title: { fontSize: 20, fontWeight: '700', color: c.textPrimary, marginBottom: Spacing.sm },
  message: { fontSize: 14, color: c.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  button: { backgroundColor: c.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: 12 },
  buttonText: { fontSize: 16, fontWeight: '600', color: c.accent },
});
