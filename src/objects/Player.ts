import Phaser from 'phaser';
import { PLAYER_SPEED } from '../config';

// Atur arah hadap + frame jalan berdasarkan arah gerak (vx,vy = -1/0/1).
// Frame digubah manual (bukan Phaser anim) agar SATU fungsi ini berlaku untuk
// pemain & semua sheet NPC yang berbeda warna baju (tata letak frame identik):
//   bawah 0-3, atas 4-7, samping 8-11 (kolom = siklus jalan).
// idle => wajah menghadap layar (frame depan diam).
export function faceAndAnimate(sprite: Phaser.GameObjects.Sprite, vx: number, vy: number, now: number) {
  if (vx === 0 && vy === 0) {
    sprite.setFlipX(false);
    sprite.setFrame(0); // depan/diam
    return;
  }
  let base: number;
  let flip = false;
  if (vx !== 0) {
    base = 8; // samping
    flip = vx < 0;
  } else if (vy < 0) {
    base = 4; // atas/belakang
  } else {
    base = 0; // bawah/depan
  }
  sprite.setFlipX(flip);
  const col = Math.floor(now / 140) % 4; // siklus 4 frame jalan
  sprite.setFrame(base + col);
}

// Pemain yang bisa berjalan 4 arah (panah / WASD) dengan Arcade Physics.
// Kamera mengikuti objek ini (diatur di GameScene).
export default class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player', 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(2); // pixel-art diperbesar agar jelas
    this.setOrigin(0.5, 1);
    this.setCollideWorldBounds(true);
    // kotak tabrakan lebih kecil dari sprite (hanya bagian kaki)
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 8);
    body.setOffset(2, 16);

    const keyboard = scene.input.keyboard!;
    this.cursors = keyboard.createCursorKeys();
    this.wasd = {
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -1;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = 1;

    if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -1;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = 1;

    // normalisasi diagonal agar kecepatan tetap sama
    const len = Math.hypot(vx, vy) || 1;
    body.setVelocity((vx / len) * PLAYER_SPEED, (vy / len) * PLAYER_SPEED);

    faceAndAnimate(this, vx, vy, this.scene.time.now);
  }
}
