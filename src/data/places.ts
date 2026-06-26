// Data "tempat" yang bisa dikunjungi pemain.
// Tema: permainan & momen khas perayaan 17 Agustus (HUT RI).
// Untuk menambah konten, cukup tambah objek baru di array ini —
// marker, misi, dan penghitung "x/N tempat" akan menyesuaikan otomatis.

export type PlaceCategory = 'Permainan' | 'Momen' | 'Kuliner';

export interface Place {
  key: string;
  name: string;
  category: PlaceCategory;
  /** Posisi di dunia (piksel). */
  x: number;
  y: number;
  /** Penjelasan edukatif singkat yang muncul saat dikunjungi. */
  description: string;
}

export const WORLD_WIDTH = 1920;
export const WORLD_HEIGHT = 1440;

export const PLACES: Place[] = [
  {
    key: 'panjat-pinang',
    name: 'Panjat Pinang',
    category: 'Permainan',
    x: 360,
    y: 320,
    description:
      'Batang pinang dilumuri pelumas, hadiah digantung di puncak. Mengajarkan kerja sama dan pantang menyerah.',
  },
  {
    key: 'balap-karung',
    name: 'Balap Karung',
    category: 'Permainan',
    x: 980,
    y: 280,
    description:
      'Peserta melompat di dalam karung menuju garis finis. Melatih keseimbangan dan sportivitas.',
  },
  {
    key: 'makan-kerupuk',
    name: 'Lomba Makan Kerupuk',
    category: 'Permainan',
    x: 1560,
    y: 360,
    description:
      'Kerupuk digantung dengan tali, dimakan tanpa tangan. Lambang kesederhanaan dan keceriaan rakyat.',
  },
  {
    key: 'tarik-tambang',
    name: 'Tarik Tambang',
    category: 'Permainan',
    x: 520,
    y: 760,
    description:
      'Dua regu beradu kekuatan menarik tali. Simbol persatuan dan kekuatan gotong royong.',
  },
  {
    key: 'balap-kelereng',
    name: 'Balap Kelereng',
    category: 'Permainan',
    x: 1180,
    y: 720,
    description:
      'Membawa kelereng di atas sendok yang digigit. Melatih fokus dan kesabaran.',
  },
  {
    key: 'bakiak',
    name: 'Lomba Bakiak',
    category: 'Permainan',
    x: 1640,
    y: 840,
    description:
      'Bertiga berjalan di atas satu bakiak panjang. Kekompakan adalah kunci kemenangan.',
  },
  {
    key: 'upacara-bendera',
    name: 'Upacara Bendera',
    category: 'Momen',
    x: 320,
    y: 1140,
    description:
      'Pengibaran Sang Merah Putih 17 Agustus 1945. Momen khidmat mengenang proklamasi kemerdekaan.',
  },
  {
    key: 'proklamasi',
    name: 'Pembacaan Proklamasi',
    category: 'Momen',
    x: 960,
    y: 1180,
    description:
      'Teks Proklamasi dibacakan Ir. Soekarno didampingi Drs. Mohammad Hatta. Tonggak lahirnya Indonesia.',
  },
  {
    key: 'pawai',
    name: 'Karnaval Kemerdekaan',
    category: 'Momen',
    x: 1520,
    y: 1160,
    description:
      'Pawai warga berbusana adat dan kostum kreatif. Merayakan keberagaman dalam semangat persatuan.',
  },
  {
    key: 'tumpeng',
    name: 'Tumpeng Kemerdekaan',
    category: 'Kuliner',
    x: 1320,
    y: 480,
    description:
      'Nasi tumpeng disantap bersama usai lomba. Wujud syukur atas nikmat kemerdekaan.',
  },
];
