import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';

interface VoiceNotePlayerProps {
  audioUrl: string;
  duration: number; // seconds
  isOwn: boolean;
  isVendorMessage?: boolean;
}

const BAR_COUNT = 28;

function formatDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

// Generate pseudo-random bar heights for waveform visualization
function generateBars(count: number): number[] {
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    // Create a natural-looking waveform pattern
    const base = 0.3 + Math.sin(i * 0.5) * 0.2 + Math.sin(i * 1.3) * 0.15;
    const noise = ((i * 7 + 13) % 17) / 17 * 0.4;
    bars.push(Math.min(1, Math.max(0.15, base + noise)));
  }
  return bars;
}

export default function VoiceNotePlayer({ audioUrl, duration, isOwn, isVendorMessage }: VoiceNotePlayerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0); // ms
  const [totalDuration, setTotalDuration] = useState((duration ?? 0) * 1000); // ms
  const soundRef = useRef<Audio.Sound | null>(null);
  const bars = useMemo(() => generateBars(BAR_COUNT), []);

  const progress = totalDuration > 0 ? Math.min(1, position / totalDuration) : 0;
  const displayTime = isPlaying || position > 0
    ? formatDuration(position / 1000)
    : formatDuration(duration ?? 0);

  const accentColor = isVendorMessage ? '#D4A017' : colors.primary;
  const barInactiveColor = isVendorMessage
    ? 'rgba(180, 140, 20, 0.35)'
    : `${colors.primary}40`;

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync?.().catch(() => {});
    };
  }, []);

  const togglePlayback = useCallback(async () => {
    try {
      if (isPlaying && soundRef.current) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (soundRef.current) {
        // Resume
        const status = await soundRef.current.getStatusAsync();
        if (status?.isLoaded && status?.durationMillis && status.positionMillis >= status.durationMillis - 100) {
          await soundRef.current.setPositionAsync(0);
        }
        await soundRef.current.playAsync();
        setIsPlaying(true);
        return;
      }

      // Load new
      setIsLoading(true);
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        (status) => {
          if (!status?.isLoaded) return;
          setPosition(status.positionMillis ?? 0);
          if (status.durationMillis) setTotalDuration(status.durationMillis);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
          }
        },
      );
      soundRef.current = sound;
      setIsPlaying(true);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [isPlaying, audioUrl]);

  return (
    <View style={styles.container}>
      <Pressable onPress={togglePlayback} style={[styles.playBtn, { backgroundColor: accentColor }]} disabled={isLoading}>
        <Ionicons
          name={isLoading ? 'hourglass-outline' : isPlaying ? 'pause' : 'play'}
          size={20}
          color="#fff"
          style={!isPlaying && !isLoading ? { marginLeft: 2 } : undefined}
        />
      </Pressable>

      <View style={styles.waveContainer}>
        <View style={styles.barsRow}>
          {bars.map((h, i) => {
            const barProgress = i / BAR_COUNT;
            const isActive = barProgress <= progress;
            return (
              <View
                key={i}
                style={[
                  styles.bar,
                  {
                    height: 4 + h * 20,
                    backgroundColor: isActive ? accentColor : barInactiveColor,
                  },
                ]}
              />
            );
          })}
        </View>
        <Text style={[styles.duration, { color: colors.textSecondary }]}>{displayTime}</Text>
      </View>
    </View>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 200,
    paddingVertical: 2,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveContainer: {
    flex: 1,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1.5,
    height: 28,
  },
  bar: {
    flex: 1,
    borderRadius: 1.5,
    minWidth: 2,
  },
  duration: {
    fontSize: 11,
    marginTop: 2,
  },
});
