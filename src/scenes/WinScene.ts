import Phaser from 'phaser';
import { PLACES } from '../data/places';

// Layar menang: muncul saat semua tempat dikunjungi. Menjeda GameScene,
// memberi ucapan selamat, dan tombol "Main Lagi" untuk mengulang.
export default class WinScene extends Phaser.Scene {
  constructor() {
    super('WinScene');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.scene.pause('GameScene');

    this.add.rectangle(0, 0, W, H, 0x1a1a1a, 0.66).setOrigin(0, 0);

    const cardW = 560;
    const cardH = 320;
    const cx = W / 2;
    const cy = H / 2;
    this.add.rectangle(cx, cy, cardW, cardH, 0xfdf6e3, 1).setStrokeStyle(4, 0xd12027);
    this.add.rectangle(cx, cy - cardH / 2 + 10, cardW, 12, 0xd12027).setOrigin(0.5, 0);
    this.add.rectangle(cx, cy - cardH / 2 + 22, cardW, 12, 0xfdf6e3).setOrigin(0.5, 0);

    this.add
      .text(cx, cy - 92, 'MERDEKA! 🎉', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '40px',
        color: '#b3161c',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5)
      .setResolution(2);

    this.add
      .text(
        cx,
        cy + 6,
        `Selamat! Kamu telah menjelajahi seluruh ${PLACES.length} permainan & momen\n` +
          'khas 17 Agustus. Semangat persatuan, kerja sama, dan pantang\nmenyerah — jadikan bekal sehari-hari. Dirgahayu Indonesia!',
        {
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '16px',
          color: '#3a2a18',
          align: 'center',
          lineSpacing: 5,
        }
      )
      .setOrigin(0.5, 0.5)
      .setResolution(2);

    const btnW = 200;
    const btnH = 52;
    const by = cy + cardH / 2 - 46;
    const btn = this.add.rectangle(cx, by, btnW, btnH, 0xd12027, 1).setStrokeStyle(3, 0x8a0f14);
    this.add
      .text(cx, by, 'Main Lagi', {
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
    // mulai dari awal (progres tak disimpan, jadi reload = permainan baru)
    btn.on('pointerdown', () => window.location.reload());
  }
}
