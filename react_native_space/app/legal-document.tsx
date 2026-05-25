import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Text, Platform, useWindowDimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../src/contexts/ThemeContext';
import api from '../src/services/api';

const TITLE_MAP: Record<string, string> = {
  terminos: 'Términos y Condiciones',
  privacidad: 'Política de Privacidad',
  'sobre-nosotros': 'Sobre Nosotros',
};

export default function LegalDocumentScreen() {
  const { key = '' } = useLocalSearchParams<{ key: string }>();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState(TITLE_MAP[key as string] ?? 'Documento Legal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDocument = useCallback(async () => {
    if (!key) return;
    setLoading(true);
    setError(false);
    try {
      const res = await api.get(`/legal/${key}`);
      setContent(res?.data?.content ?? '');
      setTitle(res?.data?.title ?? TITLE_MAP[key as string] ?? 'Documento Legal');
    } catch (err) {
      console.error('Error fetching legal document:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light)?.catch?.(() => {});
    }
    router.back();
  };

  // Build HTML for WebView-like rendering via a simple approach:
  // Since we store HTML content, we render in a lightweight web view on native
  // and dangerouslySetInnerHTML-style on web
  const htmlContent = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${isDark ? '#0A0A0A' : '#FAFAFA'}; color: ${isDark ? '#E0E0E0' : '#1A1A1A'}; line-height: 1.7; padding: 16px; }
  h2 { font-size: 18px; font-weight: 700; color: #FFC107; margin-top: 24px; margin-bottom: 10px; }
  h3 { font-size: 15px; font-weight: 600; color: ${isDark ? '#E0E0E0' : '#333'}; margin-top: 16px; margin-bottom: 6px; }
  p, li { font-size: 14px; color: ${isDark ? '#CCC' : '#555'}; margin-bottom: 8px; }
  ul, ol { padding-left: 20px; margin-bottom: 10px; }
  li { margin-bottom: 4px; }
  strong { color: ${isDark ? '#E0E0E0' : '#1A1A1A'}; }
  .date { text-align: center; font-size: 12px; color: ${isDark ? '#888' : '#999'}; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th, td { border: 1px solid ${isDark ? '#333' : '#DDD'}; padding: 8px 10px; font-size: 13px; text-align: left; }
  th { background: ${isDark ? '#1A1A1A' : '#F0F0F0'}; color: #FFC107; font-weight: 600; }
  td { color: ${isDark ? '#CCC' : '#555'}; }
  a { color: #FFC107; text-decoration: none; }
</style></head><body>${content}</body></html>`;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={handleBack} style={styles.backBtn} accessibilityLabel="Volver" accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>{title}</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFC107" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>No se pudo cargar el documento</Text>
          <Pressable onPress={fetchDocument} style={styles.retryBtn}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : Platform.OS === 'web' ? (
        <WebContentWeb html={htmlContent} />
      ) : (
        <WebViewLegal html={htmlContent} />
      )}
    </SafeAreaView>
  );
}

// Web: render HTML content via iframe
function WebContentWeb({ html }: { html: string }) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

  return (
    <View style={styles.webview}>
      {/* @ts-ignore - iframe is valid on web */}
      <iframe
        ref={iframeRef}
        style={{ width: '100%', height: '100%', border: 'none' } as any}
        title="Legal Document"
      />
    </View>
  );
}

// Native: render HTML content via WebView
function WebViewLegal({ html }: { html: string }) {
  const WebView = require('react-native-webview').default;
  return (
    <WebView
      source={{ html }}
      style={styles.webview}
      originWhitelist={['*']}
      scrollEnabled={true}
      showsVerticalScrollIndicator={false}
      javaScriptEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { fontSize: 15, marginTop: 12, textAlign: 'center' },
  retryBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#FFC107', borderRadius: 8 },
  retryText: { color: '#000', fontWeight: '700', fontSize: 14 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 0 },
  webview: { flex: 1 },
});
