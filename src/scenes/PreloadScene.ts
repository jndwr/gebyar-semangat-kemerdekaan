import Phaser from 'phaser';
import { generateTextures } from '../textures';

// Menyiapkan semua tekstur lalu pindah ke GameScene + UIScene.
// Saat sudah punya aset gambar/audio, muat di sini dengan this.load.*.
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // Aset NYATA hasil scripts/gen-assets.mjs (bisa ditimpa di Aseprite/Tiled):
    // - karakter: spritesheet 4x3 (16x24/frame) — pemain & 5 NPC (beda warna baju saja)
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 16, frameHeight: 24 });
    for (let i = 1; i <= 5; i++) {
      this.load.spritesheet(`npc${i}`, `assets/npc${i}.png`, { frameWidth: 16, frameHeight: 24 });
    }
    // - peta Tiled + tileset -> edit map.json di Tiled, tileset.png di Aseprite
    this.load.image('tiles', 'assets/tileset.png');
    this.load.tilemapTiledJSON('map', 'assets/map.json');
    // - blok pixel-art dari paket "Cube World" (atlas 5x5 tile 16x16)
    this.load.spritesheet('cube', 'assets/cube-blocks.png', { frameWidth: 16, frameHeight: 16 });
  }

  create() {
    // Tekstur lain (pohon, rumput, papan, pin, dll) masih digenerate prosedural.
    generateTextures(this);

    // Pertahankan ketajaman pixel-art: pasang filter NEAREST hanya pada sprite
    // (teks tetap halus karena antialias global aktif).
    ['player', 'npc1', 'npc2', 'npc3', 'npc4', 'npc5', 'tiles', 'tree', 'hill', 'grass', 'post', 'flag', 'cube'].forEach((key) => {
      if (this.textures.exists(key)) this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    });

    // GameScene berjalan, UIScene (HUD) & MenuScene (modal intro) di atasnya.
    // MenuScene menjeda GameScene sampai tombol "Mulai Bermain" ditekan.
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
    this.scene.launch('MenuScene');
  }
}
