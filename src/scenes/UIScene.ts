import Phaser from 'phaser';
import { Place, PLACES } from '../data/places';
import { MINIMAP } from './GameScene';
import { audio } from '../audio';

// HUD melayang di atas GameScene: penghitung tempat, panel misi,
// petunjuk interaksi, dan kartu info edukatif saat mengunjungi tempat.
// Tata letak menyesuaikan ukuran layar (mode RESIZE).
export default class UIScene extends Phaser.Scene {
  private counterText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private title!: Phaser.GameObjects.Text;
  private minimapFrame!: Phaser.GameObjects.Container;
  private infoPanel!: Phaser.GameObjects.Container;

  constructor() {
    super('UIScene');
  }

  create() {
    // ---- Penghitung tempat (kiri atas, posisi tetap) ----
    this.add.rectangle(16, 16, 190, 40, 0xfdf6e3, 0.95).setOrigin(0, 0).setStrokeStyle(2, 0xd12027);
    this.counterText = this.add.text(28, 26, `0/${PLACES.length} tempat`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '18px',
      color: '#b3161c',
      fontStyle: 'bold',
    });

    // ---- Judul (tengah atas) ----
    this.title = this.add
      .text(0, 24, 'GEBYAR SEMANGAT KEMERDEKAAN', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '20px',
        color: '#fdf6e3',
        fontStyle: 'bold',
        stroke: '#b3161c',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0);

    // ---- Petunjuk kontrol & interaksi (bawah) ----
    this.hintText = this.add
      .text(0, 0, 'Gerak: WASD / Panah  •  Kunjungi tempat: dekati lalu tekan E / Spasi', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '15px',
        color: '#fdf6e3',
        backgroundColor: '#00000066',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5, 1);

    // ---- Tombol bisukan audio (kiri atas, di samping penghitung) ----
    const muteBg = this.add.rectangle(216, 16, 40, 40, 0xfdf6e3, 0.95).setOrigin(0, 0).setStrokeStyle(2, 0xd12027);
    const muteIcon = this.add
      .text(236, 36, audio.isMuted() ? '🔇' : '🔊', { fontSize: '20px' })
      .setOrigin(0.5, 0.5);
    muteBg.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      const muted = audio.toggleMute();
      muteIcon.setText(muted ? '🔇' : '🔊');
    });

    // ---- Bingkai minimap "PETA" (kanan atas) ----
    this.buildMinimapFrame();

    // ---- Kartu info edukatif (tersembunyi awalnya) ----
    this.buildInfoPanel();

    // ---- Dengarkan event dari GameScene ----
    const game = this.scene.get('GameScene');
    game.events.on('progress', (done: number, total: number) => {
      this.counterText.setText(`${done}/${total} tempat`);
      // layar menang ditangani oleh WinScene saat semua tempat selesai
    });
    game.events.on('nearby', (place: Place | null) => {
      this.hintText.setText(
        place
          ? `▶ ${place.name} — tekan E / Spasi untuk mengunjungi`
          : 'Gerak: WASD / Panah  •  Kunjungi tempat: dekati lalu tekan E / Spasi'
      );
    });
    game.events.on('showInfo', (place: Place) => this.showInfo(place));

    // tata letak awal + responsif terhadap perubahan ukuran layar
    this.doLayout();
    this.scale.on('resize', this.doLayout, this);
  }

  // Posisikan elemen yang bergantung pada ukuran layar.
  private doLayout() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.title.setPosition(W / 2, 24);
    this.hintText.setPosition(W / 2, H - 24);
    this.minimapFrame.setPosition(W - MINIMAP.w - MINIMAP.pad, MINIMAP.pad);
    this.infoPanel.setPosition(W / 2, H / 2);
  }

  private buildMinimapFrame() {
    // Bingkai + label, anak-anaknya relatif ke pojok kiri-atas minimap.
    // Posisi container diatur di doLayout().
    const frame = this.add.rectangle(0, 0, MINIMAP.w, MINIMAP.h).setOrigin(0, 0).setStrokeStyle(3, 0xd12027);
    const tabW = 64;
    const tab = this.add
      .rectangle(MINIMAP.w / 2, MINIMAP.h, tabW, 20, 0xfdf6e3, 0.95)
      .setOrigin(0.5, 0)
      .setStrokeStyle(2, 0xd12027);
    const label = this.add
      .text(MINIMAP.w / 2, MINIMAP.h + 10, 'PETA', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '12px',
        color: '#b3161c',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);
    this.minimapFrame = this.add.container(0, 0, [frame, tab, label]);
  }

  private buildInfoPanel() {
    const cardW = 460;
    const cardH = 180;

    const bg = this.add.rectangle(0, 0, cardW, cardH, 0xfdf6e3, 0.98).setStrokeStyle(3, 0xd12027);
    const title = this.add
      .text(-cardW / 2 + 20, -cardH / 2 + 18, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '20px',
        color: '#b3161c',
        fontStyle: 'bold',
      })
      .setName('title');
    const cat = this.add
      .text(-cardW / 2 + 20, -cardH / 2 + 46, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '13px',
        color: '#7a5230',
      })
      .setName('cat');
    const body = this.add
      .text(-cardW / 2 + 20, -cardH / 2 + 72, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '15px',
        color: '#3a2a18',
        wordWrap: { width: cardW - 40 },
        lineSpacing: 4,
      })
      .setName('body');
    const close = this.add
      .text(cardW / 2 - 20, -cardH / 2 + 16, 'Tutup ✕', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '13px',
        color: '#b3161c',
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => this.infoPanel.setVisible(false));

    this.infoPanel = this.add.container(0, 0, [bg, title, cat, body, close]).setDepth(100).setVisible(false);
  }

  private showInfo(place: Place | null, allDone = false) {
    const title = this.infoPanel.getByName('title') as Phaser.GameObjects.Text;
    const cat = this.infoPanel.getByName('cat') as Phaser.GameObjects.Text;
    const body = this.infoPanel.getByName('body') as Phaser.GameObjects.Text;

    if (allDone) {
      title.setText('Merdeka! 🎉');
      cat.setText('Semua tempat telah dikunjungi');
      body.setText(
        'Hebat! Kamu telah menjelajahi seluruh permainan dan momen khas 17 Agustus. ' +
          'Jadikan semangat persatuan, kerja sama, dan pantang menyerah sebagai bekal sehari-hari. Dirgahayu Indonesia!'
      );
    } else if (place) {
      title.setText(place.name);
      cat.setText(`Kategori: ${place.category}`);
      body.setText(place.description);
    }

    this.infoPanel.setVisible(true);
    this.infoPanel.setScale(0.9);
    this.tweens.add({ targets: this.infoPanel, scale: 1, duration: 160, ease: 'Back.Out' });
  }
}
