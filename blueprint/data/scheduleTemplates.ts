// Daily schedule templates for Blueprint app

export type ScheduleCategory =
  | 'morning'
  | 'saham'
  | 'bisnis'
  | 'skill'
  | 'meal'
  | 'workout'
  | 'evening'
  | 'sleep';

export interface ScheduleActivity {
  id: string;
  time: string;       // "HH:MM" 24-hour format
  title: string;
  duration: number;   // minutes
  category: ScheduleCategory;
  desc: string;
}

// ─── WEEKDAY SCHEDULE (Mon–Fri) ───────────────────────────────────────────────
export const WEEKDAY_SCHEDULE: ScheduleActivity[] = [
  {
    id: 'wd-01',
    time: '05:00',
    title: 'Morning Protocol',
    duration: 35,
    category: 'morning',
    desc: 'Bangun, air, sholat, sarapan, suplemen. HP OFF sampai 07.00',
  },
  {
    id: 'wd-02',
    time: '05:35',
    title: 'Saham IDX - Pre Market',
    duration: 55,
    category: 'saham',
    desc: 'News IHSG, screener watchlist, 2-3 kandidat, review portofolio',
  },
  {
    id: 'wd-03',
    time: '06:30',
    title: 'Market Preparation',
    duration: 30,
    category: 'saham',
    desc: 'Siapkan order level, stop loss, target',
  },
  {
    id: 'wd-04',
    time: '07:00',
    title: 'Deep Work - BISNIS',
    duration: 120,
    category: 'bisnis',
    desc: 'Action item bisnis. Pomodoro 50/10. HP untuk riset saja',
  },
  {
    id: 'wd-05',
    time: '09:00',
    title: 'Live Market Sesi 1',
    duration: 150,
    category: 'saham',
    desc: 'Monitor aktif, eksekusi setup matang. No impulsive trading',
  },
  {
    id: 'wd-06',
    time: '11:30',
    title: 'Makan Siang + Istirahat',
    duration: 45,
    category: 'meal',
    desc: 'Makan besar, max 20 mnt HP, jalan 10 mnt',
  },
  {
    id: 'wd-07',
    time: '12:15',
    title: 'Skill Learning Sesi 1',
    duration: 90,
    category: 'skill',
    desc: '1 skill utama. Fokus penuh. No distraksi',
  },
  {
    id: 'wd-08',
    time: '13:45',
    title: 'Market Sesi 2',
    duration: 75,
    category: 'saham',
    desc: '13.30-15.00 IDX. Monitor + jurnal',
  },
  {
    id: 'wd-09',
    time: '15:00',
    title: 'Pre-Workout Meal',
    duration: 45,
    category: 'meal',
    desc: 'Roti + telur + pisang. Power nap max 20 mnt',
  },
  {
    id: 'wd-10',
    time: '16:00',
    title: 'WORKOUT',
    duration: 75,
    category: 'workout',
    desc: 'Sesuai split hari ini. Selesai = langsung mandi',
  },
  {
    id: 'wd-11',
    time: '17:15',
    title: 'Post-Workout Meal + Mandi',
    duration: 45,
    category: 'meal',
    desc: 'Nasi + ayam/ikan 150-200g + sayur dalam 60 mnt',
  },
  {
    id: 'wd-12',
    time: '18:00',
    title: 'Deep Work - BISNIS Sesi 2',
    duration: 90,
    category: 'bisnis',
    desc: 'Output wajib 1 hal konkret setiap sore',
  },
  {
    id: 'wd-13',
    time: '19:30',
    title: 'Makan Malam + Keluarga',
    duration: 45,
    category: 'meal',
    desc: 'Quality time. No laptop. No aimless scroll',
  },
  {
    id: 'wd-14',
    time: '20:15',
    title: 'Review Jurnal Saham + Chart',
    duration: 60,
    category: 'saham',
    desc: 'Review posisi, 1 bab analisa teknikal, siapkan watchlist besok',
  },
  {
    id: 'wd-15',
    time: '21:15',
    title: 'Wind Down + Refleksi Harian',
    duration: 30,
    category: 'evening',
    desc: '3 hal: accomplished, kurang, target besok. Jauhkan HP',
  },
  {
    id: 'wd-16',
    time: '21:45',
    title: 'Suplemen Malam + TIDUR 22.00',
    duration: 15,
    category: 'sleep',
    desc: 'Zinc + Magnesium. No screen. Growth hormone optimal',
  },
];

// ─── SATURDAY SCHEDULE ────────────────────────────────────────────────────────
export const SATURDAY_SCHEDULE: ScheduleActivity[] = [
  {
    id: 'sat-01',
    time: '05:00',
    title: 'Morning Protocol',
    duration: 35,
    category: 'morning',
    desc: 'Bangun, air, sholat, sarapan, suplemen. HP OFF sampai 07.00',
  },
  {
    id: 'sat-02',
    time: '07:00',
    title: 'Deep Work - BISNIS',
    duration: 120,
    category: 'bisnis',
    desc: 'Action item bisnis utama. Fokus penuh tanpa distraksi',
  },
  {
    id: 'sat-03',
    time: '09:00',
    title: 'Free Work / Learning',
    duration: 90,
    category: 'skill',
    desc: 'Eksplorasi skill baru atau lanjutkan proyek pribadi',
  },
  {
    id: 'sat-04',
    time: '10:30',
    title: 'WORKOUT',
    duration: 75,
    category: 'workout',
    desc: 'Legs Day — full lower body + core session',
  },
  {
    id: 'sat-05',
    time: '12:00',
    title: 'Makan Siang',
    duration: 45,
    category: 'meal',
    desc: 'Makan besar post-workout. Tinggi protein + karbohidrat',
  },
  {
    id: 'sat-06',
    time: '13:00',
    title: 'Konten / Creative',
    duration: 110,
    category: 'bisnis',
    desc: 'Buat konten, desain, copywriting, atau materi marketing',
  },
  {
    id: 'sat-07',
    time: '15:00',
    title: 'Free Time + Istirahat',
    duration: 60,
    category: 'evening',
    desc: 'Recharge. Baca buku, dengarkan podcast, atau tidur siang',
  },
  {
    id: 'sat-08',
    time: '16:00',
    title: 'Pre-Workout Meal',
    duration: 30,
    category: 'meal',
    desc: 'Snack ringan + hidrasi sebelum sore hari',
  },
  {
    id: 'sat-09',
    time: '17:00',
    title: 'Makan Malam + Keluarga',
    duration: 45,
    category: 'meal',
    desc: 'Quality time bersama keluarga. No gadget',
  },
  {
    id: 'sat-10',
    time: '19:00',
    title: 'Review Mingguan',
    duration: 60,
    category: 'saham',
    desc: 'Review portofolio mingguan, jurnal trading, evaluasi performa',
  },
  {
    id: 'sat-11',
    time: '20:00',
    title: 'Wind Down',
    duration: 30,
    category: 'evening',
    desc: 'Refleksi minggu ini. Apa yang berhasil, apa yang perlu diperbaiki',
  },
  {
    id: 'sat-12',
    time: '21:45',
    title: 'Suplemen Malam + TIDUR',
    duration: 15,
    category: 'sleep',
    desc: 'Zinc + Magnesium. No screen. Tidur berkualitas',
  },
];

// ─── SUNDAY SCHEDULE ──────────────────────────────────────────────────────────
export const SUNDAY_SCHEDULE: ScheduleActivity[] = [
  {
    id: 'sun-01',
    time: '06:00',
    title: 'Bangun + Ibadah',
    duration: 60,
    category: 'morning',
    desc: 'Sholat, baca Quran, meditasi pagi. Mulai hari dengan tenang',
  },
  {
    id: 'sun-02',
    time: '07:00',
    title: 'Weekly Planning',
    duration: 60,
    category: 'bisnis',
    desc: 'Rencanakan minggu depan: goals, prioritas, jadwal, target bisnis',
  },
  {
    id: 'sun-03',
    time: '08:00',
    title: 'Sarapan + Keluarga',
    duration: 60,
    category: 'meal',
    desc: 'Sarapan bersama keluarga. Quality time pagi hari',
  },
  {
    id: 'sun-04',
    time: '09:00',
    title: 'Reading / Learning',
    duration: 120,
    category: 'skill',
    desc: 'Baca buku, artikel, atau kursus online. 2 jam tanpa distraksi',
  },
  {
    id: 'sun-05',
    time: '11:00',
    title: 'Family Time',
    duration: 120,
    category: 'evening',
    desc: 'Aktivitas bersama keluarga. Jalan-jalan, bermain, rekreasi',
  },
  {
    id: 'sun-06',
    time: '13:00',
    title: 'Makan Siang',
    duration: 45,
    category: 'meal',
    desc: 'Makan siang bersama keluarga. Nikmati makanan tanpa rush',
  },
  {
    id: 'sun-07',
    time: '14:00',
    title: 'Istirahat / Recovery',
    duration: 120,
    category: 'evening',
    desc: 'Tidur siang, baca ringan, atau sekadar bersantai. Recovery penting',
  },
  {
    id: 'sun-08',
    time: '16:00',
    title: 'Olahraga Ringan / Jalan',
    duration: 45,
    category: 'workout',
    desc: 'Jalan kaki, stretching, atau yoga ringan. Active recovery',
  },
  {
    id: 'sun-09',
    time: '17:00',
    title: 'Persiapan Minggu Depan',
    duration: 60,
    category: 'bisnis',
    desc: 'Siapkan agenda, bahan kerja, review target minggu depan',
  },
  {
    id: 'sun-10',
    time: '19:00',
    title: 'Makan Malam Keluarga',
    duration: 60,
    category: 'meal',
    desc: 'Makan malam spesial hari Minggu bersama keluarga',
  },
  {
    id: 'sun-11',
    time: '20:00',
    title: 'Wind Down + Refleksi',
    duration: 60,
    category: 'evening',
    desc: 'Jurnal mingguan. Syukur, pencapaian, pelajaran, dan harapan',
  },
  {
    id: 'sun-12',
    time: '21:45',
    title: 'Suplemen Malam + TIDUR',
    duration: 15,
    category: 'sleep',
    desc: 'Zinc + Magnesium. Siapkan mental untuk minggu produktif besok',
  },
];

/**
 * Returns the appropriate schedule for a given day of the week.
 * @param dayOfWeek — JS Date.getDay() value (0 = Sunday … 6 = Saturday)
 */
export function getScheduleForDay(dayOfWeek: number): ScheduleActivity[] {
  if (dayOfWeek === 6) return SATURDAY_SCHEDULE;
  if (dayOfWeek === 0) return SUNDAY_SCHEDULE;
  return WEEKDAY_SCHEDULE;
}
