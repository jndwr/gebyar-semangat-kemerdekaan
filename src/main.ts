import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';
import UIScene from './scenes/UIScene';
import MenuScene from './scenes/MenuScene';
import WinScene from './scenes/WinScene';
import { COLORS } from './config';

// Titik masuk aplikasi: konfigurasi Phaser & daftar scene.
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  backgroundColor: COLORS.tanah,
  // antialias aktif agar TEKS halus (tidak blok-blok). Sprite pixel-art tetap
  // tajam karena filter NEAREST dipasang per-tekstur di PreloadScene.
  render: { antialias: true, roundPixels: true },
  scale: {
    // RESIZE: kanvas mengisi penuh jendela (tanpa bilah hitam). Kamera & HUD
    // menyesuaikan diri lewat event 'resize' di GameScene & UIScene.
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false, // ubah true untuk melihat kotak tabrakan
    },
  },
  scene: [PreloadScene, GameScene, UIScene, MenuScene, WinScene],
};

const game = new Phaser.Game(config);

// Akses instance game dari konsol saat mode dev (untuk debugging/uji).
if (import.meta.env.DEV) {
  (window as unknown as { game: Phaser.Game }).game = game;
}
