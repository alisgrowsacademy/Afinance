import { format, isToday, isYesterday, startOfWeek, addDays, differenceInDays } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd');
}

export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'EEEE, d MMMM yyyy', { locale: id });
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function getTodayKey(): string {
  return formatDate(new Date());
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return 'Good morning 🔥';
  if (hour >= 10 && hour < 14) return 'Selamat siang 💪';
  if (hour >= 14 && hour < 18) return 'Selamat sore ⚡';
  if (hour >= 18 && hour < 22) return 'Good evening 🌙';
  return 'Masih begadang? 😤';
}

export function getWeekDays(): { date: Date; key: string; label: string; dayNum: number }[] {
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    return {
      date,
      key: formatDate(date),
      label: format(date, 'EEE', { locale: id }).substring(0, 3),
      dayNum: date.getDay(),
    };
  });
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function getCurrentActivityIndex(
  activities: { time: string; duration: number }[]
): number {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = activities.length - 1; i >= 0; i--) {
    const startMin = parseTimeToMinutes(activities[i].time);
    const endMin = startMin + activities[i].duration;
    if (nowMinutes >= startMin && nowMinutes < endMin) return i;
    if (nowMinutes >= startMin) return i;
  }
  return -1;
}

export function isActivityLate(time: string, status: string): boolean {
  if (status === 'done' || status === 'skip') return false;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const actMinutes = parseTimeToMinutes(time);
  return nowMinutes > actMinutes + 15;
}

export function getProgressColor(percent: number): string {
  if (percent >= 80) return '#c8f135';
  if (percent >= 50) return '#fb923c';
  return '#f87171';
}

export function getDayCompletionColor(rate: number | undefined): string {
  if (rate === undefined) return '#2a2a2e'; // future/no data
  if (rate >= 0.8) return '#4ade80';
  if (rate >= 0.5) return '#fb923c';
  return '#f87171';
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}j`;
  return `${h}j ${m}m`;
}

export function daysSince(dateStr: string): number {
  return differenceInDays(new Date(), new Date(dateStr));
}
