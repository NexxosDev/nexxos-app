import { useRef, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

/* eslint-disable @typescript-eslint/no-var-requires */
const SEND_ASSET = require('../../assets/sounds/send.wav');
const RECEIVE_ASSET = require('../../assets/sounds/receive.wav');

/**
 * Plays a one-shot sound from a require()'d asset.
 * Creates a fresh Sound instance each time to avoid stale-cache issues
 * on Expo Go hot-reloads.
 */
async function playOneShot(asset: number, volume: number): Promise<void> {
  try {
    const { sound } = await Audio.Sound.createAsync(asset, {
      shouldPlay: true,
      volume,
    });
    // Unload after playback finishes to free memory
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch {
    // Non-critical — fail silently
  }
}

export default function useChatSounds() {
  const audioConfigured = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'web' && !audioConfigured.current) {
      Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        allowsRecordingIOS: false,
      }).catch(() => {});
      audioConfigured.current = true;
    }
  }, []);

  const playSend = useCallback(() => {
    playOneShot(SEND_ASSET, 0.6);
  }, []);

  const playReceive = useCallback(() => {
    playOneShot(RECEIVE_ASSET, 0.7);
  }, []);

  return { playSend, playReceive };
}
