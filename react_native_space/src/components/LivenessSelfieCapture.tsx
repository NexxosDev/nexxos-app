import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';

type LivenessStep = 'neutral' | 'smile' | 'turn';
interface CapturedSelfies { neutral?: string; smile?: string; turn?: string; }
interface LivenessSelfieCaptureProps { onComplete: (selfies: { neutral: string; smile: string; turn: string }) => void; onCancel: () => void; }

const STEPS: { key: LivenessStep; icon: string; title: string; instruction: string }[] = [
  { key: 'neutral', icon: 'person-outline', title: 'Paso 1 de 3', instruction: 'Mira directamente a la c\u00e1mara\ncon expresi\u00f3n neutra' },
  { key: 'smile', icon: 'happy-outline', title: 'Paso 2 de 3', instruction: '\u00a1Ahora sonr\u00ede!\nMuestra una sonrisa natural' },
  { key: 'turn', icon: 'arrow-redo-outline', title: 'Paso 3 de 3', instruction: 'Gira tu cabeza ligeramente\nhacia la derecha' },
];

const { width: SCREEN_W } = Dimensions.get('window');
const CAMERA_SIZE = SCREEN_W - 48;

export default function LivenessSelfieCapture({ onComplete, onCancel }: LivenessSelfieCaptureProps) {
  const { colors } = useTheme();
  // This component always has a dark bg (camera screen), so we use hardcoded dark values
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [permission, requestPermission] = useCameraPermissions();
  const [currentStep, setCurrentStep] = useState(0);
  const [captured, setCaptured] = useState<CapturedSelfies>({});
  const [capturing, setCapturing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const stepInfo = STEPS[currentStep] ?? STEPS[0];

  const takePicture = useCallback(async () => {
    if (!cameraRef?.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync?.({ quality: 0.7, skipProcessing: true });
      if (photo?.uri) { setCaptured((prev) => ({ ...(prev ?? {}), [stepInfo.key]: photo.uri })); setShowPreview(true); }
    } catch { }
    setCapturing(false);
  }, [currentStep, captured, capturing, stepInfo]);

  const confirmAndNext = useCallback(() => {
    setShowPreview(false);
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
    else if (captured?.neutral && captured?.smile && captured?.turn) onComplete({ neutral: captured.neutral, smile: captured.smile, turn: captured.turn });
  }, [currentStep, captured, onComplete]);

  const retake = useCallback(() => {
    setCaptured((prev) => ({ ...(prev ?? {}), [stepInfo.key]: undefined })); setShowPreview(false);
  }, [stepInfo]);

  if (!permission?.granted) {
    return (
      <View style={styles.permContainer}>
        <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.permTitle}>Permiso de C\u00e1mara</Text>
        <Text style={styles.permText}>Necesitamos acceso a tu c\u00e1mara frontal para la verificaci\u00f3n de identidad.</Text>
        <Pressable style={styles.permBtn} onPress={requestPermission}><Text style={styles.permBtnText}>Permitir C\u00e1mara</Text></Pressable>
        <Pressable onPress={onCancel} style={{ marginTop: Spacing.md }}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
      </View>
    );
  }

  const currentUri = captured?.[stepInfo.key];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onCancel} hitSlop={10}><Ionicons name="close" size={28} color="#FFFFFF" /></Pressable>
        <Text style={styles.headerTitle}>{stepInfo.title}</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={styles.dotsRow}>{STEPS.map((_, i) => <View key={i} style={[styles.dot, i <= currentStep ? styles.dotActive : null]} />)}</View>
      <View style={styles.cameraContainer}>
        {showPreview && currentUri ? <Image source={{ uri: currentUri }} style={styles.preview} contentFit="cover" /> : <CameraView ref={cameraRef} style={styles.camera} facing="front" mode="picture" />}
        {!showPreview ? <View style={styles.ovalOverlay} /> : null}
      </View>
      <View style={styles.instructionBox}>
        <Ionicons name={stepInfo.icon as any} size={28} color={colors.primary} />
        <Text style={styles.instructionText}>{stepInfo.instruction}</Text>
      </View>
      <View style={styles.buttonsRow}>
        {showPreview ? (
          <>
            <Pressable style={styles.retakeBtn} onPress={retake}><Ionicons name="refresh" size={22} color={colors.error} /><Text style={styles.retakeBtnText}>Repetir</Text></Pressable>
            <Pressable style={styles.confirmBtn} onPress={confirmAndNext}><Ionicons name="checkmark" size={22} color="#FFFFFF" /><Text style={styles.confirmBtnText}>{currentStep < STEPS.length - 1 ? 'Siguiente' : 'Finalizar'}</Text></Pressable>
          </>
        ) : (
          <Pressable style={[styles.captureBtn, capturing && { opacity: 0.5 }]} onPress={takePicture} disabled={capturing}><View style={styles.captureInner} /></Pressable>
        )}
      </View>
    </View>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: Spacing.md, paddingTop: Platform.OS === 'ios' ? 8 : Spacing.md, paddingBottom: Spacing.sm },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: c.primary },
  cameraContainer: { width: CAMERA_SIZE, height: CAMERA_SIZE * 1.15, borderRadius: CAMERA_SIZE / 2, overflow: 'hidden', backgroundColor: '#1A1A1A', position: 'relative' },
  camera: { width: '100%', height: '100%' },
  preview: { width: '100%', height: '100%' },
  ovalOverlay: { position: 'absolute', top: '8%', left: '12%', right: '12%', bottom: '8%', borderWidth: 2, borderColor: c.primary, borderRadius: 9999, opacity: 0.6 },
  instructionBox: { alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
  instructionText: { fontSize: 16, color: '#FFFFFF', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.lg, paddingBottom: Spacing.xl },
  captureBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: c.primary },
  retakeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 12, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: c.error },
  retakeBtnText: { color: c.error, fontWeight: '600', fontSize: 15 },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 12, borderRadius: BorderRadius.full, backgroundColor: c.success },
  confirmBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  permContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, backgroundColor: c.background },
  permTitle: { fontSize: 18, fontWeight: '600', color: c.textPrimary, marginTop: Spacing.md },
  permText: { fontSize: 14, color: c.textSecondary, textAlign: 'center', marginTop: 8 },
  permBtn: { marginTop: Spacing.lg, backgroundColor: c.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: BorderRadius.full },
  permBtnText: { fontWeight: '600', color: c.accent, fontSize: 15 },
  cancelText: { color: c.textSecondary, fontSize: 14 },
});
