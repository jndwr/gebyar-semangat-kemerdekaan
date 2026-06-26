import Phaser from 'phaser';
import { faceAndAnimate } from './Player';

const NPC_SPEED = 80;

// Warga yang berkeliaran acak, tampil seperti pemain tetapi memakai spritesheet
// dengan warna BAJU berbeda (npc1..npc5) — selain baju, semuanya sama.
export default class NPC extends Phaser.Physics.Arcade.Sprite {
  private dirX = 0;
  private dirY = 0;
  private nextChange = 0;
  private bubble?: Phaser.GameObjects.Container;
  private bubbleUntil = 0;
  talkCooldownUntil = 0; // dibaca GameScene agar tak menyapa beruntun

  constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string) {
    super(scene, x, y, textureKey, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(2);
    this.setOrigin(0.5, 1);
    this.setCollideWorldBounds(true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 8);
    body.setOffset(2, 16);
    body.onWorldBounds = true;

    this.pickDirection(0);
  }

  private pickDirection(time: number) {
    // pilih salah satu: diam, atau salah satu dari 4 arah utama
    const choices = [
      [0, 0],
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    const [dx, dy] = Phaser.Utils.Array.GetRandom(choices);
    this.dirX = dx;
    this.dirY = dy;
    this.nextChange = time + Phaser.Math.Between(900, 2600);
  }

  /** Tampilkan gelembung dialog di atas kepala selama beberapa detik. */
  say(text: string, time: number) {
    this.bubble?.destroy();
    const scene = this.scene;
    const label = scene.add
      .text(0, 0, text, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '13px',
        color: '#3a2a18',
        align: 'center',
        wordWrap: { width: 150 },
      })
      .setOrigin(0.5, 0.5)
      .setResolution(2);
    const pad = 8;
    const bg = scene.add
      .rectangle(0, 0, label.width + pad * 2, label.height + pad * 2, 0xfdf6e3, 0.98)
      .setStrokeStyle(2, 0xd12027);
    this.bubble = scene.add.container(this.x, this.y - 58, [bg, label]).setDepth(8000);
    this.bubbleUntil = time + 3000;
    // hentikan sebentar saat bicara
    this.dirX = 0;
    this.dirY = 0;
    this.nextChange = Math.max(this.nextChange, time + 1200);
    this.talkCooldownUntil = time + 6000;
  }

  update(time: number) {
    if (time >= this.nextChange) this.pickDirection(time);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(this.dirX * NPC_SPEED, this.dirY * NPC_SPEED);

    // jika menabrak sesuatu (kecepatan ter-blok), segera ganti arah
    if ((this.dirX !== 0 || this.dirY !== 0) && body.velocity.x === 0 && body.velocity.y === 0) {
      this.pickDirection(time);
    }

    faceAndAnimate(this, this.dirX, this.dirY, time);
    this.setDepth(this.y);

    // ikuti & sembunyikan gelembung dialog
    if (this.bubble) {
      this.bubble.setPosition(this.x, this.y - 58);
      if (time >= this.bubbleUntil) {
        this.bubble.destroy();
        this.bubble = undefined;
      }
    }
  }
}
