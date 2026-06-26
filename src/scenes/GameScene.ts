import Phaser from 'phaser';
import Player from '../objects/Player';
import NPC from '../objects/NPC';
import { PLACES, WORLD_WIDTH, WORLD_HEIGHT, Place } from '../data/places';
import { TILE, DESIGN } from '../config';
import { audio } from '../audio';

// Spritesheet warga (NPC) — tiap sheet beda warna baju saja.
const NPC_SHEETS = ['npc1', 'npc2', 'npc3', 'npc4', 'npc5'];

// Sapaan/semangat khas 17an yang diucapkan NPC saat didekati.
const NPC_QUOTES = [
  'Merdeka! 🇮🇩',
  'Ayo ikut lomba 17-an!',
  'Semangat, jangan menyerah!',
  'Bersatu kita teguh!',
  'Sudah daftar panjat pinang?',
  'Dirgahayu Indonesia!',
  'Gotong royong, yuk!',
  'Hidup rukun, hidup damai!',
];

interface PlaceMarker {
  place: Place;
  zone: Phaser.GameObjects.Zone;
  status: Phaser.GameObjects.Image; // ikon "!" atau centang
  flag: Phaser.GameObjects.Image; // bendera (muncul saat dikunjungi)
  pin: Phaser.GameObjects.Image; // titik berwarna di minimap
  visited: boolean;
}

// Ukuran minimap (dipakai juga oleh UIScene untuk bingkai & label "PETA").
export const MINIMAP = { w: 128, h: 96, pad: 12 };

// Scene dunia utama: tanah lapang, papan-papan tempat, dan pemain.
export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private markers: PlaceMarker[] = [];
  private nearby: PlaceMarker | null = null;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private visitedKeys = new Set<string>();
  private labels: Phaser.GameObjects.Text[] = [];
  private minimapHidden: Phaser.GameObjects.GameObject[] = []; // tak ditampilkan di minimap
  private treeBodies!: Phaser.Physics.Arcade.StaticGroup;
  private hillBodies!: Phaser.Physics.Arcade.StaticGroup;
  private npcs: NPC[] = [];
  private minimap!: Phaser.Cameras.Scene2D.Camera;
  private mmDot!: Phaser.GameObjects.Image;

  constructor() {
    super('GameScene');
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // catatan: progress TIDAK disimpan — tiap refresh mulai dari 0/10.

    this.buildMap();
    this.buildDecor();
    this.buildPlaces();

    // pemain mulai di tengah peta
    this.player = new Player(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

    // warga (NPC) yang berkeliaran
    this.spawnNPCs();

    // pemain & NPC menabrak pohon dan bukit
    this.physics.add.collider(this.player, this.treeBodies);
    this.physics.add.collider(this.player, this.hillBodies);
    this.physics.add.collider(this.npcs, this.treeBodies);
    this.physics.add.collider(this.npcs, this.hillBodies);
    this.physics.add.collider(this.npcs, this.npcs);
    this.physics.add.collider(this.player, this.npcs);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.setupMinimap();

    // kamera & minimap menyesuaikan ukuran layar (mode RESIZE)
    this.applyResize();
    this.scale.on('resize', this.applyResize, this);

    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', () => this.tryInteract());
    this.interactKey.on('down', () => this.tryInteract());

    // kirim status awal ke HUD pada tick berikutnya, setelah UIScene memasang
    // listener-nya (menghindari race: counter 0 padahal tanda sudah tersimpan).
    this.time.delayedCall(0, () => this.events.emit('progress', this.visitedKeys.size, PLACES.length));
  }

  private buildMap() {
    // Peta dari Tiled (public/assets/map.json) + tileset.png.
    // Edit map.json di Tiled Map Editor untuk mengubah tata letak rumput/jalan.
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('tiles', 'tiles');
    if (tileset) {
      const layer = map.createLayer('ground', tileset, 0, 0);
      layer?.setDepth(-10);
    }
  }

  private buildDecor() {
    this.treeBodies = this.physics.add.staticGroup();
    this.hillBodies = this.physics.add.staticGroup();
    const rnd = new Phaser.Math.RandomDataGenerator(['gebyar-17an']);
    const roadW = TILE * 2;
    const margin = 70;

    const onRoad = (x: number, y: number) =>
      Math.abs(x - WORLD_WIDTH / 2) < roadW / 2 + 60 || Math.abs(y - WORLD_HEIGHT / 2) < roadW / 2 + 60;
    const nearPlace = (x: number, y: number) =>
      PLACES.some((p) => Phaser.Math.Distance.Between(x, y, p.x, p.y) < 120);

    // ---- Bukit (menyatu dengan rumput, TIDAK bisa dilewati) ----
    let hills = 0;
    for (let i = 0; i < 120 && hills < 7; i++) {
      const x = rnd.between(margin, WORLD_WIDTH - margin);
      const y = rnd.between(margin, WORLD_HEIGHT - margin);
      if (onRoad(x, y) || nearPlace(x, y)) continue;
      const scale = rnd.realInRange(1.4, 2.4);
      const hill = this.add.image(x, y, 'hill').setOrigin(0.5, 0.6).setScale(scale).setDepth(y - 30);
      // penghalang di kaki bukit
      const bw = 150 * scale * 0.5;
      const bh = 90 * scale * 0.32;
      const body = this.add.rectangle(x, y + 90 * scale * 0.08, bw, bh, 0x000000, 0);
      this.physics.add.existing(body, true);
      this.hillBodies.add(body);
      void hill;
      hills++;
    }

    // ---- Pohon (punya tabrakan di batang) ----
    let trees = 0;
    for (let i = 0; i < 240 && trees < 75; i++) {
      const x = rnd.between(margin, WORLD_WIDTH - margin);
      const y = rnd.between(margin, WORLD_HEIGHT - margin);
      if (onRoad(x, y) || nearPlace(x, y)) continue;

      const tree = this.add.image(x, y, 'tree').setOrigin(0.5, 1).setScale(1.8);
      tree.setDepth(y);

      // body tak terlihat di pangkal batang sebagai penghalang
      const trunk = this.add.rectangle(x, y - 8, 22, 14, 0x000000, 0);
      this.physics.add.existing(trunk, true);
      this.treeBodies.add(trunk);
      trees++;
    }

    // ---- Rumput (dekoratif, tanpa tabrakan) ----
    let grass = 0;
    for (let i = 0; i < 400 && grass < 160; i++) {
      const x = rnd.between(margin, WORLD_WIDTH - margin);
      const y = rnd.between(margin, WORLD_HEIGHT - margin);
      if (onRoad(x, y)) continue;
      this.add.image(x, y, 'grass').setOrigin(0.5, 1).setScale(rnd.realInRange(1.1, 1.8)).setDepth(y - 4);
      grass++;
    }
  }

  private spawnNPCs() {
    const rnd = new Phaser.Math.RandomDataGenerator(['npc-17an']);
    const roadW = TILE * 2;
    const margin = 120;
    const valid = (x: number, y: number) =>
      !(Math.abs(x - WORLD_WIDTH / 2) < roadW / 2 + 60 || Math.abs(y - WORLD_HEIGHT / 2) < roadW / 2 + 60) &&
      !PLACES.some((p) => Phaser.Math.Distance.Between(x, y, p.x, p.y) < 140);

    NPC_SHEETS.forEach((sheet) => {
      let x = WORLD_WIDTH / 2;
      let y = WORLD_HEIGHT / 2;
      for (let tries = 0; tries < 60; tries++) {
        x = rnd.between(margin, WORLD_WIDTH - margin);
        y = rnd.between(margin, WORLD_HEIGHT - margin);
        if (valid(x, y)) break;
      }
      this.npcs.push(new NPC(this, x, y, sheet));
    });
  }

  // Sesuaikan zoom kamera utama & posisi minimap saat ukuran layar berubah.
  private applyResize() {
    const w = this.scale.width;
    const h = this.scale.height;
    // zoom "cover": pastikan area desain terisi penuh tanpa bilah hitam
    this.cameras.main.setZoom(Math.max(w / DESIGN.w, h / DESIGN.h));
    if (this.minimap) this.minimap.setPosition(w - MINIMAP.w - MINIMAP.pad, MINIMAP.pad);
  }

  private setupMinimap() {
    const gameW = this.scale.width;
    const x = gameW - MINIMAP.w - MINIMAP.pad;
    this.minimap = this.cameras.add(x, MINIMAP.pad, MINIMAP.w, MINIMAP.h);
    this.minimap.setZoom(MINIMAP.w / WORLD_WIDTH);
    this.minimap.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.minimap.centerOn(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

    // titik pemain hanya tampil di minimap (disembunyikan dari kamera utama)
    this.mmDot = this.add.image(this.player.x, this.player.y, 'dot').setDepth(10000);
    this.cameras.main.ignore(this.mmDot);

    // papan/label/ikon dunia tak perlu tampil di minimap — cukup pin berwarna
    this.minimap.ignore(this.minimapHidden);
  }

  private buildPlaces() {
    PLACES.forEach((place) => {
      const post = this.add.image(place.x, place.y, 'post').setOrigin(0.5, 1).setScale(1.6);
      post.setDepth(place.y);

      const visited = this.visitedKeys.has(place.key);

      // penanda: gelembung "!" (belum) -> centang hijau (sudah), keduanya prosedural.
      const status = this.add
        .image(place.x + 18, place.y - 44, visited ? 'check' : 'bang')
        .setScale(1.4)
        .setDepth(place.y + 1);

      const flag = this.add
        .image(place.x - 22, place.y, 'flag')
        .setOrigin(0.5, 1)
        .setScale(1.6)
        .setDepth(place.y)
        .setVisible(visited);

      // label nama tempat
      const label = this.add
        .text(place.x, place.y + 6, place.name, {
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '13px',
          color: '#3a2a18',
          align: 'center',
        })
        .setOrigin(0.5, 0)
        .setDepth(place.y);
      this.labels.push(label);

      // titik berwarna khusus minimap (merah=belum, hijau=sudah)
      const pin = this.add
        .image(place.x, place.y - 20, visited ? 'pin_green' : 'pin_red')
        .setDepth(9000);
      this.cameras.main.ignore(pin); // hanya tampil di minimap

      // papan, status, bendera, & label disembunyikan dari minimap
      this.minimapHidden.push(post, status, flag, label);

      // zona interaksi (radius di sekitar papan)
      const zone = this.add.zone(place.x, place.y - 20, 90, 90);
      this.physics.add.existing(zone, true);

      this.markers.push({ place, zone, status, flag, pin, visited });
    });
  }

  private tryInteract() {
    if (!this.nearby || this.nearby.visited) return;
    const marker = this.nearby;
    marker.visited = true;
    this.visitedKeys.add(marker.place.key);

    marker.status.setTexture('check');
    marker.pin.setTexture('pin_green');
    marker.flag.setVisible(true);
    this.tweens.add({
      targets: marker.flag,
      y: marker.flag.y - 6,
      yoyo: true,
      duration: 180,
    });
    audio.sfxVisit();

    this.events.emit('progress', this.visitedKeys.size, PLACES.length);
    // minta HUD menampilkan info edukatif
    this.events.emit('showInfo', marker.place);

    // semua tempat selesai => layar menang (beri jeda agar info terakhir terbaca)
    if (this.visitedKeys.size === PLACES.length) {
      this.time.delayedCall(900, () => {
        audio.sfxWin();
        this.scene.launch('WinScene');
      });
    }
  }

  update() {
    this.player.update();
    this.player.setDepth(this.player.y); // depth sorting sederhana
    this.npcs.forEach((n) => n.update(this.time.now));
    this.mmDot.setPosition(this.player.x, this.player.y); // titik pemain di minimap

    // NPC menyapa saat pemain mendekat (dengan jeda agar tak beruntun)
    const now = this.time.now;
    for (const n of this.npcs) {
      if (now < n.talkCooldownUntil) continue;
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, n.x, n.y) < 90) {
        n.say(Phaser.Utils.Array.GetRandom(NPC_QUOTES), now);
        audio.sfxTalk();
        break; // satu sapaan per frame
      }
    }

    // cari papan terdekat yang sedang bersinggungan dengan pemain
    let found: PlaceMarker | null = null;
    for (const m of this.markers) {
      const zb = m.zone.body as Phaser.Physics.Arcade.StaticBody;
      if (
        Phaser.Geom.Rectangle.Overlaps(
          new Phaser.Geom.Rectangle(zb.x, zb.y, zb.width, zb.height),
          this.player.getBounds()
        )
      ) {
        found = m;
        break;
      }
    }

    if (found !== this.nearby) {
      this.nearby = found;
      this.events.emit('nearby', found && !found.visited ? found.place : null);
    }
  }
}
