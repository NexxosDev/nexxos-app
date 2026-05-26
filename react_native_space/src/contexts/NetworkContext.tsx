import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import api from '../services/api';
import NoConnectionScreen from '../components/NoConnectionScreen';
import ServerErrorScreen from '../components/ServerErrorScreen';

type NetworkStatus = 'online' | 'no-connection' | 'server-error';

interface NetworkContextValue {
  status: NetworkStatus;
  isOnline: boolean;
  checkConnection: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextValue>({
  status: 'online',
  isOnline: true,
  checkConnection: async () => {},
});

export const useNetwork = () => useContext(NetworkContext);

const HEALTH_ENDPOINT = '/health';
const CONSECUTIVE_ERRORS_THRESHOLD = 2;

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<NetworkStatus>('online');
  const [retrying, setRetrying] = useState(false);
  const consecutiveServerErrors = useRef(0);
  const hasCheckedInitially = useRef(false);

  // Check if device has internet connectivity
  const checkDeviceConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      return state?.isConnected === true && state?.isInternetReachable !== false;
    } catch {
      return true; // assume connected on error
    }
  }, []);

  // Check if server is reachable
  const checkServerHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await api.get(HEALTH_ENDPOINT, { timeout: 8000 });
      return (response?.status ?? 500) < 500;
    } catch (err: any) {
      const responseStatus = err?.response?.status;
      // If we get a response (even 4xx), server is up
      if (responseStatus && responseStatus < 500) return true;
      // 5xx = server error
      if (responseStatus && responseStatus >= 500) return false;
      // Network error (no response) - could be connectivity
      return false;
    }
  }, []);

  // Full connection check
  const checkConnection = useCallback(async () => {
    const hasInternet = await checkDeviceConnectivity();
    if (!hasInternet) {
      consecutiveServerErrors.current = 0;
      setStatus('no-connection');
      return;
    }

    const serverOk = await checkServerHealth();
    if (serverOk) {
      consecutiveServerErrors.current = 0;
      setStatus('online');
    } else {
      consecutiveServerErrors.current += 1;
      // Only show server error after consecutive failures to avoid false positives
      if (consecutiveServerErrors.current >= CONSECUTIVE_ERRORS_THRESHOLD) {
        setStatus('server-error');
      }
    }
  }, [checkDeviceConnectivity, checkServerHealth]);

  // Retry handler
  const handleRetry = useCallback(async () => {
    setRetrying(true);
    try {
      await checkConnection();
    } finally {
      setRetrying(false);
    }
  }, [checkConnection]);

  // Listen to NetInfo changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state?.isConnected === true && state?.isInternetReachable !== false;
      if (!connected) {
        consecutiveServerErrors.current = 0;
        setStatus('no-connection');
      } else if (status === 'no-connection') {
        // Connection restored, verify server
        checkConnection();
      }
    });

    return () => unsubscribe();
  }, [status, checkConnection]);

  // Initial check on mount
  useEffect(() => {
    if (!hasCheckedInitially.current) {
      hasCheckedInitially.current = true;
      checkConnection();
    }
  }, [checkConnection]);

  // Check on app foreground
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active' && status !== 'online') {
        checkConnection();
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub?.remove?.();
  }, [status, checkConnection]);

  // Axios interceptor for 5xx responses during normal usage
  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => {
        // Successful response → reset server error counter
        consecutiveServerErrors.current = 0;
        if (status === 'server-error') {
          setStatus('online');
        }
        return response;
      },
      (error) => {
        const responseStatus = error?.response?.status;
        if (responseStatus && responseStatus >= 500) {
          consecutiveServerErrors.current += 1;
          if (consecutiveServerErrors.current >= CONSECUTIVE_ERRORS_THRESHOLD) {
            setStatus('server-error');
          }
        }
        // Don't swallow — re-throw so callers still handle the error
        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [status]);

  const value = useMemo(() => ({
    status,
    isOnline: status === 'online',
    checkConnection,
  }), [status, checkConnection]);

  // Render error screens as overlays
  if (status === 'no-connection') {
    return (
      <NetworkContext.Provider value={value}>
        <NoConnectionScreen onRetry={handleRetry} retrying={retrying} />
      </NetworkContext.Provider>
    );
  }

  if (status === 'server-error') {
    return (
      <NetworkContext.Provider value={value}>
        <ServerErrorScreen onRetry={handleRetry} retrying={retrying} />
      </NetworkContext.Provider>
    );
  }

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}
