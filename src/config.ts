// Tema warna & konstanta global. Diubah di satu tempat agar konsisten.
export const COLORS = {
  merah: 0xd12027,
  putih: 0xfdf6e3,
  tanah: 0xd9c79e,
  tanahGelap: 0xcdb888,
  jalan: 0xc8a86b,
  rumput: 0x8fae5d,
  rumputGelap: 0x82a154,
  rumputTerang: 0xa6c46c,
  kulit: 0xe8b27d,
  celana: 0x2f4b7c,
  peci: 0x1a1a1a,
  kayu: 0x7a5230,
  batang: 0x7a5230,
  daun: 0x4e8c3a,
  daunGelap: 0x3c6e2d,
  daunTerang: 0x6fae4f,
  bukit: 0x9bb563,
  bukitGelap: 0x82a14e,
  bukitTerang: 0xb1c87e,
  papan: 0x9aa0a6,
  centang: 0x37a04a,
  seru: 0xffffff,
  air: 0x4a90c2,
} as const;

export const TILE = 48; // ukuran 1 petak (piksel)

// Ukuran "desain" acuan. Zoom kamera = layar / desain, agar seberapa luas
// dunia yang terlihat tetap konsisten di berbagai ukuran layar.
export const DESIGN = { w: 960, h: 540 };

// Kecepatan jalan pemain (piksel/detik).
export const PLAYER_SPEED = 190;
