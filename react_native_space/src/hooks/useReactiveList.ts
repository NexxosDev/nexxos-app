import { useEffect, useRef, useCallback } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

interface UseReactiveListOptions {
  /** Function to call when a refresh is needed */
  onRefresh: () => void;
  /** Polling interval in ms (default 30000 = 30s) */
  pollingInterval?: number;
  /** Push notification types that should trigger a refresh */
  notificationTypes?: string[];
  /** Whether the hook is active (e.g. only when screen is focused) */
  enabled?: boolean;
}

/**
 * Hook that combines interval polling + push notification triggers
 * for reactive list updates. Pauses polling when app is in background.
 */
export function useReactiveList({
  onRefresh,
  pollingInterval = 30000,
  notificationTypes = [],
  enabled = true,
}: UseReactiveListOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef = useRef(true);

  const refresh = useCallback(() => {
    if (isActiveRef.current && enabled) {
      onRefresh();
    }
  }, [onRefresh, enabled]);

  // Polling
  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(refresh, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [refresh, pollingInterval, enabled]);

  // Pause/resume polling when app goes to background/foreground
  useEffect(() => {
    if (!enabled) return;

    const subscription = AppState.addEventListener('change', (state) => {
      isActiveRef.current = state === 'active';
      // Refresh immediately when coming back to foreground
      if (state === 'active') {
        refresh();
      }
    });

    return () => subscription?.remove?.();
  }, [refresh, enabled]);

  // Push notification listener (foreground)
  useEffect(() => {
    if (!enabled || Platform.OS === 'web' || (notificationTypes?.length ?? 0) === 0) return;

    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification?.request?.content?.data;
      const type = data?.type as string | undefined;
      if (type && (notificationTypes ?? []).includes(type)) {
        // Small delay to let backend finish processing
        setTimeout(refresh, 500);
      }
    });

    return () => sub?.remove?.();
  }, [refresh, notificationTypes, enabled]);
}
