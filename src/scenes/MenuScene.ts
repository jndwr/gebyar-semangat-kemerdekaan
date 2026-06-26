import Phaser from 'phaser';
import { audio } from '../audio';

// Modal intro: nama game, penjelasan, dan tombol "Mulai Bermain".
// Menjeda GameScene sampai pemain menekan tombol.
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // jeda dunia di belakang (pemain tak bisa bergerak dulu)
    this.scene.pause('GameScene');

    // selubung gelap
    this.add.rectangle(0, 0, W, H, 0x1a1a1a, 0.6).setOrigin(0, 0);

    // kartu modal
    const cardW = 560;
    const cardH = 320;
    const cx = W / 2;
    const cy = H / 2;
    this.add.rectangle(cx, cy, cardW, cardH, 0xfdf6e3, 1).setStrokeStyle(4, 0xd12027);
    // pita merah-putih di atas kartu
    this.add.rectangle(cx, cy - cardH / 2 + 10, cardW, 12, 0xd12027).setOrigin(0.5, 0);
    this.add.rectangle(cx, cy - cardH / 2 + 22, cardW, 12, 0xfdf6e3).setOrigin(0.5, 0);

    this.add
      .text(cx, cy - 96, 'GEBYAR SEMANGAT\nKEMERDEKAAN', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '34px',
        color: '#b3161c',
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: 2,
      })
      .setOrigin(0.5, 0.5)
      .setResolution(2);

    this.add
      .text(
        cx,
        cy + 4,
        'Jelajahi alun-alun kemerdekaan! Kunjungi 10 permainan & momen\nkhas 17 Agustus, baca kisahnya, dan nyalakan semangat persatuan.\n\nGerak: WASD / Panah   •   Kunjungi: E / Spasi',
        {
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '16px',
          color: '#3a2a18',
          align: 'center',
          lineSpacing: 4,
        }
      )
      .setOrigin(0.5, 0.5)
      .setResolution(2);

    // tombol "Mulai Bermain"
    const btnW = 220;
    const btnH = 52;
    const by = cy + cardH / 2 - 46;
    const btn = this.add.rectangle(cx, by, btnW, btnH, 0xd12027, 1).setStrokeStyle(3, 0x8a0f14);
    const btnText = this.add
      .text(cx, by, 'Mulai Bermain', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5)
      .setResolution(2);

    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setFillStyle(0xe5343b));
    btn.on('pointerout', () => btn.setFillStyle(0xd12027));
    const start = () => {
      audio.start(); // mulai musik dari gestur pengguna (syarat browser)
      this.scene.resume('GameScene');
      this.scene.stop();
    };
    btn.on('pointerdown', start);
    // bisa juga tekan Enter / Spasi
    this.input.keyboard?.once('keydown-ENTER', start);
    this.input.keyboard?.once('keydown-SPACE', start);

    // hint kecil
    void btnText;
  }
}
