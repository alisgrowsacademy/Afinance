import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const dailyTriggers: { hour: number; minute: number; title: string; body: string }[] = [
    { hour: 4, minute: 50, title: '⏰ Bangun Sebentar Lagi!', body: '10 menit lagi bangun! Hari baru menanti.' },
    { hour: 5, minute: 0, title: '☀️ BANGUN!', body: 'Hari produktif dimulai sekarang.' },
    { hour: 5, minute: 15, title: '💊 Suplemen Pagi', body: 'Waktunya: Enervon C + D3 + HiLo Teen' },
    { hour: 5, minute: 30, title: '📈 Saham Pagi', body: 'Cek news IDX sekarang — pasar buka 3.5 jam lagi.' },
    { hour: 8, minute: 50, title: '📈 Market Buka 10 Menit!', body: 'Siapkan order dan level masuk kamu!' },
    { hour: 15, minute: 45, title: '💪 Workout dalam 15 Menit', body: 'Persiapkan diri. Pre-workout meal sudah?' },
    { hour: 21, minute: 30, title: '🌙 Wind Down Dimulai', body: '30 menit lagi tidur. Mulai wind down.' },
    { hour: 21, minute: 45, title: '💊 Suplemen Malam', body: 'Waktunya Zinc + Magnesium!' },
    { hour: 22, minute: 0, title: '😴 TIDUR SEKARANG!', body: 'Growth hormone bekerja malam ini. Istirahat yang cukup.' },
  ];

  for (const trigger of dailyTriggers) {
    await Notifications.scheduleNotificationAsync({
      content: { title: trigger.title, body: trigger.body, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: trigger.hour, minute: trigger.minute },
    });
  }

  // Every Friday 20:00
  await Notifications.scheduleNotificationAsync({
    content: { title: '📊 Weekly Review Time!', body: 'Waktunya evaluasi minggu ini. Buka BLUEPRINT sekarang.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 6, hour: 20, minute: 0 },
  });
}

export async function scheduleSmartNotification(
  title: string,
  body: string,
  date: Date
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
  return id;
}

export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}
