import { useRef, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { Audio, type AVPlaybackSource } from 'expo-av';

const sendAsset = require('../../assets/sounds/send.wav');
const receiveAsset = require('../../assets/sounds/receive.wav');

export default function useChatSounds() {
  const sendRef = useRef<Audio.Sound | null>(null);
  const receiveRef = useRef<Audio.Sound | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Allow sounds to mix with other audio (e.g. music)
        if (Platform.OS !== 'web') {
          await Audio.setAudioModeAsync({ playsInSilentModeIOS: false, allowsRecordingIOS: false });
        }
        const [s1, s2] = await Promise.all([
          Audio.Sound.createAsync(sendAsset, { shouldPlay: false, volume: 0.6 }),
          Audio.Sound.createAsync(receiveAsset, { shouldPlay: false, volume: 0.7 }),
        ]);
        if (cancelled) {
          s1?.sound?.unloadAsync?.();
          s2?.sound?.unloadAsync?.();
          return;
        }
        sendRef.current = s1?.sound ?? null;
        receiveRef.current = s2?.sound ?? null;
        loadedRef.current = true;
      } catch (e) {
        // Sounds are non-critical; fail silently
        console.log('Chat sounds load error:', e);
      }
    })();

    return () => {
      cancelled = true;
      sendRef.current?.unloadAsync?.();
      receiveRef.current?.unloadAsync?.();
      sendRef.current = null;
      receiveRef.current = null;
      loadedRef.current = false;
    };
  }, []);

  const playSend = useCallback(async () => {
    if (!loadedRef.current || !sendRef.current) return;
    try {
      await sendRef.current.setPositionAsync(0);
      await sendRef.current.playAsync();
    } catch { }
  }, []);

  const playReceive = useCallback(async () => {
    if (!loadedRef.current || !receiveRef.current) return;
    try {
      await receiveRef.current.setPositionAsync(0);
      await receiveRef.current.playAsync();
    } catch { }
  }, []);

  return { playSend, playReceive };
}
