// Supplement tracking data for Blueprint app

export interface Supplement {
  id: string;
  name: string;
  dose: string;
  times: string[];
  status: 'punya' | 'restock' | 'beli' | 'nanti';
  notes?: string;
}

export const SUPPLEMENTS: Supplement[] = [
  {
    id: 's1',
    name: 'HiLo Teen Kalsium',
    dose: '2x/hari',
    times: ['pagi', 'malam'],
    status: 'punya',
    notes: 'Kalsium untuk pertumbuhan tulang dan kepadatan massa tulang',
  },
  {
    id: 's2',
    name: 'Enervon C',
    dose: '1 tablet/hari',
    times: ['pagi sarapan'],
    status: 'punya',
    notes: 'Vitamin C + B-Complex untuk imunitas dan metabolisme energi',
  },
  {
    id: 's3',
    name: 'Zinc Picolinate 50mg+B6',
    dose: '1 tablet/hari',
    times: ['malam sebelum tidur'],
    status: 'punya',
    notes: 'Zinc untuk testosteron, imunitas, dan recovery otot',
  },
  {
    id: 's4',
    name: 'IPI D3 1000IU',
    dose: '1 kapsul/hari',
    times: ['pagi + makan berlemak'],
    status: 'restock',
    notes: 'Vitamin D3 untuk hormon, kekuatan tulang, dan mood',
  },
  {
    id: 's5',
    name: 'Magnesium Glycinate 200-300mg',
    dose: '1x/hari',
    times: ['30-60 mnt sebelum tidur'],
    status: 'beli',
    notes: 'Magnesium untuk kualitas tidur, relaksasi otot, dan ZMA stack',
  },
  {
    id: 's6',
    name: 'Creatine Monohydrate 3-5g',
    dose: '1x/hari',
    times: ['kapan saja'],
    status: 'nanti',
    notes: 'Untuk kekuatan, volume otot, dan performa latihan. Beli setelah stok lain habis',
  },
];
