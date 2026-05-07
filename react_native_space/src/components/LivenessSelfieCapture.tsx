import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, Spacing, BorderRadius } from '../theme/colors';

type LivenessStep = 'neutral' | 'smile' | 'turn';

interface CapturedSelfies {
  neutral?: string;
  smile?: string;
  turn?: string;
}

interface LivenessSelfieCaptureProps {
  onComplete: (selfies: { neutral: string; smile: string; turn: string }) => void;
  onCancel: () => void;
}

const STEPS: { key: LivenessStep; icon: string; title: string; instruction: string }[] = [
  { key: 'neutral', icon: 'person-outline', title: 'Paso 1 de 3', instruction: 'Mira directamente a la c\u00e1mara\ncon expresi\u00f3n neutra' },
  { key: 'smile', icon: 'happy-outline', title: 'Paso 2 de 3', instruction: '\u00a1Ahora sonr\u00ede!\nMuestra una sonrisa natural' },
  { key: 'turn', icon: 'arrow-redo-outline', title: 'Paso 3 de 3', instruction: 'Gira tu cabeza ligeramente\nhacia la derecha' },
];

const { width: SCREEN_W } = Dimensions.get('window');

export default function LivenessSelfieCapture({ onComplete, onCancel }: LivenessSelfieCaptureProps) {
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
      const photo = await cameraRef.current.takePictureAsync?.({
        quality: 0.7,
        skipProcessing: true,
      });
      if (photo?.uri) {
        const key = stepInfo.key;
        const newCaptured = { ...(captured ?? {}), [key]: photo.uri };
        setCaptured(newCaptured);
        setShowPreview(true);
      }
    } catch { }
    setCapturing(false);
  }, [currentStep, captured, capturing, stepInfo]);

  const confirmAndNext = useCallback(() => {
    setShowPreview(false);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // All 3 captured
      if (captured?.neutral && captured?.smile && captured?.turn) {
        onComplete({ neutral: captured.neutral, smile: captured.smile, turn: captured.turn });
      }
    }
  }, [currentStep, captured, onComplete]);

  const retake = useCallback(() => {
    const key = stepInfo.key;
    setCaptured((prev) => ({ ...(prev ?? {}), [key]: undefined }));
    setShowPreview(false);
  }, [stepInfo]);

  if (!permission?.granted) {
    return (
      <View style={styles.permContainer}>
        <Ionicons name="camera-outline" size={48} color={Colors.textSecondary} />
        <Text style={styles.permTitle}>Permiso de C\u00e1mara</Text>
        <Text style={styles.permText}>Necesitamos acceso a tu c\u00e1mara frontal para la verificaci\u00f3n de identidad.</Text>
        <Pressable style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Permitir C\u00e1mara</Text>
        </Pressable>
        <Pressable onPress={onCancel} style={{ marginTop: Spacing.md }}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
      </View>
    );
  }

  const currentUri = captured?.[stepInfo.key];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onCancel} hitSlop={10}>
          <Ionicons name="close" size={28} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>{stepInfo.title}</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i <= currentStep ? styles.dotActive : null]} />
        ))}
      </View>

      {/* Camera or Preview */}
      <View style={styles.cameraContainer}>
        {showPreview && currentUri ? (
          <Image source={{ uri: currentUri }} style={styles.preview} contentFit="cover" />
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
            mode="picture"
          />
        )}
        {/* Oval overlay */}
        {!showPreview ? <View style={styles.ovalOverlay} /> : null}
      </View>

      {/* Instruction */}
      <View style={styles.instructionBox}>
        <Ionicons name={stepInfo.icon as any} size={28} color={Colors.primary} />
        <Text style={styles.instructionText}>{stepInfo.instruction}</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsRow}>
        {showPreview ? (
          <>
            <Pressable style={styles.retakeBtn} onPress={retake}>
              <Ionicons name="refresh" size={22} color={Colors.error} />
              <Text style={styles.retakeBtnText}>Repetir</Text>
            </Pressable>
            <Pressable style={styles.confirmBtn} onPress={confirmAndNext}>
              <Ionicons name="checkmark" size={22} color={Colors.white} />
              <Text style={styles.confirmBtnText}>
                {currentStep < STEPS.length - 1 ? 'Siguiente' : 'Finalizar'}
              </Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={[styles.captureBtn, capturing && { opacity: 0.5 }]}
            onPress={takePicture}
            disabled={capturing}
          >
            <View style={styles.captureInner} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const CAMERA_SIZE = SCREEN_W - 48;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', paddingHorizontal: Spacing.md, paddingTop: Platform.OS === 'ios' ? 8 : Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: Colors.white },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: Colors.primary },
  cameraContainer: {
    width: CAMERA_SIZE, height: CAMERA_SIZE * 1.15,
    borderRadius: CAMERA_SIZE / 2, overflow: 'hidden',
    backgroundColor: '#1A1A1A', position: 'relative',
  },
  camera: { width: '100%', height: '100%' },
  preview: { width: '100%', height: '100%' },
  ovalOverlay: {
    position: 'absolute', top: '8%', left: '12%', right: '12%', bottom: '8%',
    borderWidth: 2, borderColor: Colors.primary, borderRadius: 9999,
    opacity: 0.6,
  },
  instructionBox: {
    alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
  },
  instructionText: {
    fontSize: 16, color: Colors.white, textAlign: 'center', marginTop: 8, lineHeight: 22,
  },
  buttonsRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: Spacing.lg, paddingBottom: Spacing.xl,
  },
  captureBtn: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: Colors.white,
    justifyContent: 'center', alignItems: 'center',
  },
  captureInner: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary,
  },
  retakeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.error,
  },
  retakeBtnText: { color: Colors.error, fontWeight: '600', fontSize: 15 },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: BorderRadius.full,
    backgroundColor: Colors.success,
  },
  confirmBtnText: { color: Colors.white, fontWeight: '600', fontSize: 15 },
  permContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  permTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginTop: Spacing.md },
  permText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8 },
  permBtn: {
    marginTop: Spacing.lg, backgroundColor: Colors.primary,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: BorderRadius.full,
  },
  permBtnText: { fontWeight: '600', color: Colors.accent, fontSize: 15 },
  cancelText: { color: Colors.textSecondary, fontSize: 14 },
});
