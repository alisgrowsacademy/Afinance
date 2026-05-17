// Motivational quotes for Blueprint app

export const QUOTES: string[] = [
  // 1
  'Disiplin adalah kebebasan yang sesungguhnya.',
  // 2
  'The body achieves what the mind believes.',
  // 3
  'Konsistensi kecil setiap hari mengalahkan ledakan motivasi sesekali.',
  // 4
  'Do not count the days. Make the days count.',
  // 5
  'Kerja keras hari ini adalah investasi terbesar untuk masa depanmu.',
  // 6
  'The pain you feel today will be the strength you feel tomorrow.',
  // 7
  'Tidak ada jalan pintas menuju tempat yang layak dituju.',
  // 8
  'Success is the sum of small efforts repeated day in and day out.',
  // 9
  'Bukan tentang seberapa keras kamu dipukul, tapi seberapa cepat kamu bangkit.',
  // 10
  'Your future self is watching you right now through memories.',
  // 11
  'Setiap rep, setiap set, setiap menit belajar — itu adalah versi dirimu yang lebih baik.',
  // 12
  'Motivation gets you started. Discipline keeps you going.',
  // 13
  'Jangan tunggu sempurna. Mulai, lalu perbaiki di jalan.',
  // 14
  "Hard work beats talent when talent doesn't work hard.",
  // 15
  'Tubuhmu adalah cerminan dari keputusan-keputusanmu.',
  // 16
  'Champions are made from something deep inside — a desire, a dream, a vision.',
  // 17
  'Waktu yang sama setiap hari digunakan berbeda oleh orang berbeda.',
  // 18
  "You don't rise to the level of your goals. You fall to the level of your systems.",
  // 19
  'Rasa tidak nyaman adalah harga dari pertumbuhan.',
  // 20
  'The man who moves a mountain begins by carrying away small stones.',
  // 21
  'Setiap kali kamu memilih disiplin atas kenyamanan, kamu memenangkan pertempuran terkecil yang paling penting.',
  // 22
  'Strength does not come from physical capacity. It comes from an indomitable will.',
  // 23
  'Hidupmu tidak akan berubah sampai kamu berubah.',
  // 24
  'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
  // 25
  'Pasar tidak peduli seberapa pintar kamu — tapi dia menghargai mereka yang sabar dan disiplin.',
  // 26
  'The secret of getting ahead is getting started.',
  // 27
  'Tiga tahun disiplin total bisa mengubah nasibmu selamanya.',
  // 28
  'It never gets easier. You just get stronger.',
  // 29
  'Tidur lebih awal, bangun lebih awal — dua jam pagi bisa mengubah arah hidupmu.',
  // 30
  'You are one decision away from a completely different life.',
];

/**
 * Returns a deterministic quote based on the day of the year.
 * The same quote is returned for the entire day, cycling through the list.
 */
export function getTodayQuote(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay); // 1–365
  const index = dayOfYear % QUOTES.length;
  return QUOTES[index];
}
