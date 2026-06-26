import Phaser from 'phaser';
import { COLORS } from './config';

// Membuat tekstur pixel-art secara prosedural memakai Graphics -> generateTexture.
// Tujuannya: proyek langsung jalan TANPA file gambar.
// Saat sudah punya sprite Aseprite, ganti pemanggilan ini dengan this.load.image/spritesheet
// di PreloadScene, lalu hapus fungsi yang tak lagi dipakai.

function px(g: Phaser.GameObjects.Graphics, color: number, x: number, y: number, w: number, h: number) {
  g.fillStyle(color, 1);
  g.fillRect(x, y, w, h);
}

// Catatan: pemain & tanah/jalan kini memakai aset NYATA dari public/assets/
// (player.png spritesheet + tileset.png/map.json Tiled), dimuat di PreloadScene.
// Tekstur di bawah ini masih digenerate prosedural sebagai placeholder pixel-art.

/** Pohon: batang + tajuk daun (punya tabrakan di bagian batang). */
function makeTree(scene: Phaser.Scene) {
  const W = 32;
  const H = 44;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  // batang
  px(g, COLORS.batang, 13, 30, 6, 14);
  // tajuk daun (3 gumpalan)
  g.fillStyle(COLORS.daunGelap, 1);
  g.fillCircle(16, 16, 14);
  g.fillStyle(COLORS.daun, 1);
  g.fillCircle(11, 14, 9);
  g.fillCircle(21, 13, 9);
  g.fillCircle(16, 8, 9);
  // highlight
  g.fillStyle(COLORS.daunTerang, 1);
  g.fillCircle(13, 9, 3);
  g.generateTexture('tree', W, H);
  g.destroy();
}

/** Bukit landai. Memakai palet rumput agar MENYATU dengan tanah sekitar;
 *  hanya bayangan & sorotan tipis yang memberi bentuk. */
function makeHill(scene: Phaser.Scene) {
  const W = 160;
  const H = 90;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  // dasar = warna rumput gelap (sama dgn corak tanah) -> tepi membaur
  g.fillStyle(COLORS.rumputGelap, 1);
  g.fillEllipse(W / 2, H * 0.72, W, H * 1.25);
  // badan = warna rumput
  g.fillStyle(COLORS.rumput, 1);
  g.fillEllipse(W / 2, H * 0.6, W * 0.86, H * 1.0);
  // sorotan puncak = rumput terang
  g.fillStyle(COLORS.rumputTerang, 1);
  g.fillEllipse(W * 0.45, H * 0.46, W * 0.46, H * 0.46);
  g.generateTexture('hill', W, H);
  g.destroy();
}

/** Rumpun rumput dekoratif (tanpa tabrakan). */
function makeGrass(scene: Phaser.Scene) {
  const W = 16;
  const H = 12;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(COLORS.daun, 1);
  // beberapa helai
  px(g, COLORS.daun, 2, 6, 2, 6);
  px(g, COLORS.daunGelap, 5, 3, 2, 9);
  px(g, COLORS.daun, 8, 5, 2, 7);
  px(g, COLORS.daunGelap, 11, 4, 2, 8);
  g.generateTexture('grass', W, H);
  g.destroy();
}

/** Papan penanda tempat (signpost). */
function makePost(scene: Phaser.Scene) {
  const W = 28;
  const H = 32;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  // tiang kayu
  px(g, COLORS.kayu, 12, 14, 4, 18);
  // papan
  px(g, COLORS.papan, 2, 2, 24, 16);
  // bingkai gelap
  g.lineStyle(2, 0x5b6066, 1);
  g.strokeRect(2, 2, 24, 16);
  g.generateTexture('post', W, H);
  g.destroy();
}

/** Bendera Merah Putih kecil sebagai penanda "sudah dikunjungi". */
function makeFlag(scene: Phaser.Scene) {
  const W = 16;
  const H = 16;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  px(g, COLORS.kayu, 1, 0, 2, 16); // tiang
  px(g, COLORS.merah, 3, 1, 11, 4); // merah
  px(g, COLORS.putih, 3, 5, 11, 4); // putih
  g.generateTexture('flag', W, H);
  g.destroy();
}

/** Lingkaran centang hijau (tempat selesai). */
function makeCheck(scene: Phaser.Scene) {
  const S = 16;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(COLORS.centang, 1);
  g.fillCircle(S / 2, S / 2, S / 2);
  g.lineStyle(2, 0xffffff, 1);
  g.beginPath();
  g.moveTo(4, 8);
  g.lineTo(7, 11);
  g.lineTo(12, 5);
  g.strokePath();
  g.generateTexture('check', S, S);
  g.destroy();
}

/** Gelembung tanda seru (tempat belum dikunjungi). */
function makeBang(scene: Phaser.Scene) {
  const S = 16;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(S / 2, S / 2, S / 2);
  g.fillStyle(COLORS.merah, 1);
  g.fillRect(7, 3, 2, 6);
  g.fillRect(7, 11, 2, 2);
  g.generateTexture('bang', S, S);
  g.destroy();
}

/** Titik penanda pemain di minimap (kuning, berbingkai putih agar menonjol). */
function makeDot(scene: Phaser.Scene) {
  const S = 88;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0x1a1a1a, 1);
  g.fillCircle(S / 2, S / 2, S / 2); // bingkai gelap
  g.fillStyle(0xffffff, 1);
  g.fillCircle(S / 2, S / 2, S / 2 - 7);
  g.fillStyle(0xffd23f, 1); // isi kuning
  g.fillCircle(S / 2, S / 2, S / 2 - 16);
  g.generateTexture('dot', S, S);
  g.destroy();
}

/** Pin lokasi untuk minimap (merah = belum, hijau = sudah dikunjungi). */
function makePin(scene: Phaser.Scene, key: string, color: number) {
  const S = 76;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(S / 2, S / 2, S / 2); // bingkai putih
  g.fillStyle(color, 1);
  g.fillCircle(S / 2, S / 2, S / 2 - 9);
  g.generateTexture(key, S, S);
  g.destroy();
}

export function generateTextures(scene: Phaser.Scene) {
  makeTree(scene);
  makeHill(scene);
  makeGrass(scene);
  makePost(scene);
  makeFlag(scene);
  makeCheck(scene);
  makeBang(scene);
  makeDot(scene);
  makePin(scene, 'pin_red', COLORS.merah);
  makePin(scene, 'pin_green', COLORS.centang);
}
