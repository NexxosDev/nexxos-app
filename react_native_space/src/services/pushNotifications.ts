import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import api from './api';

// Configurar handler para notificaciones en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  // Solo funciona en dispositivos físicos, no en web ni simuladores
  if (Platform.OS === 'web') return null;
  if (!Device.isDevice) {
    console.log('Push notifications requieren un dispositivo físico');
    return null;
  }

  try {
    // Configurar canal de Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    // Verificar/solicitar permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permiso de notificaciones denegado');
      return null;
    }

    // Obtener Expo Push Token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const token = tokenData?.data;

    if (!token) return null;

    // Enviar token al backend
    await api.post('/push-tokens', {
      token,
      platform: Platform.OS,
    });

    console.log('Push token registrado:', token);
    return token;
  } catch (error) {
    console.error('Error registrando push token:', error);
    return null;
  }
}

/**
 * Dismiss system-tray notifications matching a specific context (like WhatsApp).
 * Only removes notifications for the exact chatId or requestId opened.
 */
export async function dismissNotificationsForContext(filter: {
  requestId?: string;
  chatId?: string;
}) {
  if (Platform.OS === 'web') return;
  try {
    const presented = await Notifications.getPresentedNotificationsAsync();
    for (const notif of presented) {
      const data = notif?.request?.content?.data as Record<string, any> | undefined;
      if (!data) continue;
      const matchesChat = filter.chatId && data.chatId === filter.chatId;
      const matchesRequest = filter.requestId && data.requestId === filter.requestId;
      if (matchesChat || matchesRequest) {
        await Notifications.dismissNotificationAsync(notif.request.identifier);
      }
    }
    // Update badge to reflect remaining notifications
    const remaining = await Notifications.getPresentedNotificationsAsync();
    await Notifications.setBadgeCountAsync(remaining?.length ?? 0);
  } catch (err) {
    console.error('Error dismissing notifications:', err);
  }
}

export async function unregisterPushToken(token: string | null) {
  if (!token) return;
  try {
    await api.delete('/push-tokens', { data: { token } });
  } catch {
    // Silently ignore
  }
}
