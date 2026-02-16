import { Capacitor } from '@capacitor/core';
import {
  PushNotifications,
  type Token,
  type PushNotificationSchema,
  type ActionPerformed,
} from '@capacitor/push-notifications';
import {
  LocalNotifications,
  type LocalNotificationSchema,
} from '@capacitor/local-notifications';

// ── Push Notification Channel IDs ──────────────────────────────
export const PUSH_CHANNELS = {
  DUELS: 'duels',
  SOCIAL: 'social',
  LEAGUES: 'leagues',
  DAILY: 'daily-challenge',
} as const;

// ── Local Notification IDs ─────────────────────────────────────
const STREAK_REMINDER_ID = 9001;

// ── Push Notifications ─────────────────────────────────────────

export const initPushNotifications = async (
  onTokenReceived: (token: string) => void
): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted') return;

  await PushNotifications.register();

  PushNotifications.addListener('registration', (token: Token) => {
    onTokenReceived(token.value);
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('Push registration failed:', error);
  });

  PushNotifications.addListener(
    'pushNotificationReceived',
    (notification: PushNotificationSchema) => {
      console.log('Push received:', notification);
    }
  );

  PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (action: ActionPerformed) => {
      const data = action.notification.data;
      handlePushAction(data);
    }
  );

  if (Capacitor.getPlatform() === 'android') {
    await createAndroidChannels();
  }
};

const createAndroidChannels = async (): Promise<void> => {
  await PushNotifications.createChannel({
    id: PUSH_CHANNELS.DUELS,
    name: 'Duels',
    description: 'Duel challenges and results',
    importance: 4,
    sound: 'default',
    vibration: true,
  });

  await PushNotifications.createChannel({
    id: PUSH_CHANNELS.SOCIAL,
    name: 'Social',
    description: 'Friend requests and social updates',
    importance: 3,
    sound: 'default',
    vibration: true,
  });

  await PushNotifications.createChannel({
    id: PUSH_CHANNELS.LEAGUES,
    name: 'Leagues',
    description: 'League promotions and demotions',
    importance: 3,
    sound: 'default',
    vibration: false,
  });

  await PushNotifications.createChannel({
    id: PUSH_CHANNELS.DAILY,
    name: 'Daily Challenge',
    description: 'Daily challenge reminders',
    importance: 2,
    sound: 'default',
    vibration: false,
  });
};

const handlePushAction = (data: Record<string, string>): void => {
  const { type, id } = data;
  switch (type) {
    case 'duel_challenge':
    case 'duel_completed':
      if (id) window.location.href = `/duels/${id}`;
      break;
    case 'friend_request':
      window.location.href = '/profile?tab=friends';
      break;
    case 'league_change':
      window.location.href = '/leagues';
      break;
    case 'daily_challenge':
      window.location.href = '/daily';
      break;
  }
};

// ── Local Notifications (Streak Reminder) ──────────────────────

export const scheduleStreakReminder = async (
  streakDays: number
): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== 'granted') return;

  await cancelStreakReminder();

  const tonight8PM = new Date();
  tonight8PM.setHours(20, 0, 0, 0);

  if (tonight8PM.getTime() <= Date.now()) {
    tonight8PM.setDate(tonight8PM.getDate() + 1);
  }

  const notification: LocalNotificationSchema = {
    id: STREAK_REMINDER_ID,
    title: "Don't lose your streak! 🔥",
    body: `You have a ${streakDays}-day streak. Play a quiz to keep it alive!`,
    schedule: { at: tonight8PM, allowWhileIdle: true },
    channelId: 'streak-reminder',
  };

  await LocalNotifications.schedule({ notifications: [notification] });
};

export const cancelStreakReminder = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.cancel({
    notifications: [{ id: STREAK_REMINDER_ID }],
  });
};

// ── Cleanup ────────────────────────────────────────────────────

export const removeAllNotificationListeners = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  await PushNotifications.removeAllListeners();
  await LocalNotifications.removeAllListeners();
};
