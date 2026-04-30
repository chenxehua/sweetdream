/**
 * Push Notification Service
 * Handles push notification permissions and registration
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// Configure notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission not granted');
    return false;
  }

  // For Android, need to set up a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('sleep-reminders', {
      name: '睡眠提醒',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4A90D9',
      sound: 'default',
    });
  }

  return true;
}

// Register device for push notifications
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // Request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Get the Expo push token
    const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Replace with actual project ID from app.config.ts
    });

    if (pushToken) {
      // Send token to server for storage
      await fetch(`${API_BASE}/api/v1/push-tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: pushToken,
          platform: Platform.OS,
          deviceName: Device.modelName,
        }),
      });
    }

    return pushToken;
  } catch (error) {
    console.error('Failed to register for push notifications:', error);
    return null;
  }
}

// Schedule a sleep reminder notification
export async function scheduleSleepReminder(hour: number, minute: number): Promise<string | null> {
  try {
    // Cancel existing sleep reminders first
    await cancelSleepReminders();

    const trigger = {
      hour,
      minute,
      repeats: true,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '睡前提醒 🌙',
        body: '该准备开始睡前仪式啦，今晚也要好好睡觉哦！',
        data: { type: 'sleep_reminder' },
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule sleep reminder:', error);
    return null;
  }
}

// Cancel all sleep reminder notifications
export async function cancelSleepReminders(): Promise<void> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const sleepReminders = scheduledNotifications.filter(
      (notification) => notification.content.data?.type === 'sleep_reminder'
    );

    for (const reminder of sleepReminders) {
      await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
    }
  } catch (error) {
    console.error('Failed to cancel sleep reminders:', error);
  }
}

// Add notification listeners
export function addNotificationListeners(
  onReceived: (notification: Notifications.Notification) => void,
  onResponseReceived: (response: Notifications.NotificationResponse) => void
): { remove: () => void } {
  const receivedSubscription = Notifications.addNotificationReceivedListener(onReceived);
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(onResponseReceived);

  return {
    remove: () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    },
  };
}

// Send test notification (for development)
export async function sendTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '测试通知 🌟',
      body: '推送通知功能正常工作！',
      data: { type: 'test' },
    },
    trigger: null, // Send immediately
  });
}
