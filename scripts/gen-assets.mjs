// Generator aset NYATA (PNG + peta Tiled JSON) untuk proyek ini.
// Menghasilkan file yang bisa langsung dibuka & ditimpa di Aseprite / Tiled:
//   public/assets/player.png   -> spritesheet pemain 3 frame (16x24 each)
//   public/assets/tileset.png  -> tileset 3 tile (48x48): rumput, rumput-variasi, jalan
//   public/assets/map.json     -> peta Tiled (40x30 tile) berisi layer "ground"
//
// Jalankan: npm run gen:assets   (otomatis dipanggil sebelum build)
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'public', 'assets');
fs.mkdirSync(OUT, { recursive: true });

// ---------- Encoder PNG minimal (RGBA 8-bit) ----------
const crcTable = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---------- Util gambar ----------
function canvas(w, h) {
  return { w, h, buf: Buffer.alloc(w * h * 4) };
}
function rect(c, [r, g, b, a], x, y, w, h) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      if (xx < 0 || yy < 0 || xx >= c.w || yy >= c.h) continue;
      const i = (yy * c.w + xx) * 4;
      c.buf[i] = r;
      c.buf[i + 1] = g;
      c.buf[i + 2] = b;
      c.buf[i + 3] = a;
    }
  }
}
function save(name, c) {
  fs.writeFileSync(path.join(OUT, name), encodePNG(c.w, c.h, c.buf));
  console.log('  ✓', name, `${c.w}x${c.h}`);
}

// Palet (samakan dengan src/config.ts)
const C = {
  merah: [209, 32, 39, 255],
  putih: [253, 246, 227, 255],
  kulit: [232, 178, 125, 255],
  celana: [47, 75, 124, 255],
  peci: [26, 26, 26, 255],
  mulut: [138, 75, 58, 255],
  rumput: [143, 174, 93, 255],
  rumputGelap: [130, 161, 84, 255],
  rumputTerang: [166, 196, 108, 255],
  jalan: [200, 168, 107, 255],
  jalanGelap: [188, 156, 96, 255],
  setapak: [214, 188, 140, 255], // jalan setapak (dirt lebih terang)
  setapakGelap: [201, 174, 126, 255],
  rambut: [120, 78, 44, 255], // rambut cokelat (gaya retro)
  rambutGelap: [92, 58, 32, 255],
  sepatu: [70, 48, 32, 255], // sepatu cokelat tua
  mata: [40, 30, 24, 255],
};

// Warna baju: pemain (merah) + 5 varian NPC (hanya baju yang berbeda).
const SHIRTS = [
  { file: 'player.png', color: [209, 32, 39, 255] }, // pemain — merah
  { file: 'npc1.png', color: [54, 116, 200, 255] }, // biru
  { file: 'npc2.png', color: [60, 160, 80, 255] }, // hijau
  { file: 'npc3.png', color: [230, 180, 40, 255] }, // kuning
  { file: 'npc4.png', color: [150, 90, 200, 255] }, // ungu
  { file: 'npc5.png', color: [40, 170, 170, 255] }, // tosca
];

// ---------- 1) Spritesheet karakter retro (grid 4x3, 16x24/frame) ----------
// Gaya acuan: assets-sprites/Retro Character Sprite Sheet.
// Baris (arah): 0=bawah/depan, 1=atas/belakang, 2=samping (hadap kanan).
// Kolom (frame jalan): 0=diam, 1=langkah, 2=diam, 3=langkah (kebalikan).
// Indeks frame Phaser (row-major): bawah 0-3, atas 4-7, samping 8-11.
// Hanya warna BAJU yang berbeda antar karakter (pemain vs NPC).
function drawCharacter(shirt) {
  const FW = 16;
  const FH = 24;
  // pose kaki & ayunan lengan per kolom
  const poses = [
    { legL: 5, legR: 9, armY: 0 }, // diam
    { legL: 4, legR: 10, armY: -1 }, // langkah
    { legL: 5, legR: 9, armY: 0 }, // diam
    { legL: 6, legR: 8, armY: 1 }, // langkah (kebalikan)
  ];
  const DIRS = ['down', 'up', 'side'];
  const c = canvas(FW * poses.length, FH * DIRS.length);

  // torso, lengan, celana, kaki + sepatu (sama untuk semua arah)
  function drawBody(ox, oy, p) {
    rect(c, C.kulit, ox + 2, oy + 10 + p.armY, 2, 5); // lengan kiri
    rect(c, C.kulit, ox + 12, oy + 10 - p.armY, 2, 5); // lengan kanan
    rect(c, shirt, ox + 4, oy + 9, 8, 6); // baju
    rect(c, C.celana, ox + 4, oy + 15, 8, 3); // celana
    // kaki kiri
    rect(c, C.celana, ox + p.legL, oy + 18, 3, 3);
    rect(c, C.sepatu, ox + p.legL, oy + 21, 3, 2);
    // kaki kanan
    rect(c, C.celana, ox + p.legR, oy + 18, 3, 3);
    rect(c, C.sepatu, ox + p.legR, oy + 21, 3, 2);
  }

  DIRS.forEach((dir, row) => {
    const oy = row * FH;
    poses.forEach((p, col) => {
      const ox = col * FW;
      drawBody(ox, oy, p);
      if (dir === 'down') {
        // depan: rambut + wajah menghadap layar
        rect(c, C.rambut, ox + 4, oy + 0, 8, 4);
        rect(c, C.rambut, ox + 3, oy + 2, 1, 3);
        rect(c, C.rambut, ox + 12, oy + 2, 1, 3);
        rect(c, C.kulit, ox + 4, oy + 4, 8, 5);
        rect(c, C.mata, ox + 6, oy + 6, 1, 2);
        rect(c, C.mata, ox + 9, oy + 6, 1, 2);
      } else if (dir === 'up') {
        // belakang: hanya rambut (balik badan)
        rect(c, C.rambut, ox + 4, oy + 0, 8, 8);
        rect(c, C.rambut, ox + 3, oy + 2, 1, 4);
        rect(c, C.rambut, ox + 12, oy + 2, 1, 4);
        rect(c, C.rambutGelap, ox + 5, oy + 6, 6, 2);
      } else {
        // samping (hadap kanan): rambut, wajah sisi kanan, satu mata + hidung
        rect(c, C.rambut, ox + 4, oy + 0, 8, 4);
        rect(c, C.rambut, ox + 4, oy + 4, 3, 4); // belakang kepala
        rect(c, C.kulit, ox + 7, oy + 4, 5, 5);
        rect(c, C.mata, ox + 9, oy + 6, 1, 2);
        rect(c, C.kulit, ox + 12, oy + 6, 1, 2); // hidung
      }
    });
  });
  return c;
}

function drawCharacters() {
  SHIRTS.forEach((s) => save(s.file, drawCharacter(s.color)));
}

// ---------- 2) Tileset (3 tile, 48x48) ----------
const TILE = 48;
function drawTileset() {
  const c = canvas(TILE * 4, TILE);
  // tile 0: rumput
  rect(c, C.rumput, 0, 0, TILE, TILE);
  rect(c, C.rumputGelap, 0, 0, TILE / 2, TILE / 2);
  rect(c, C.rumputGelap, TILE / 2, TILE / 2, TILE / 2, TILE / 2);
  rect(c, C.rumputTerang, 8, 30, 3, 2);
  rect(c, C.rumputTerang, 34, 12, 3, 2);
  // tile 1: rumput variasi
  const o = TILE;
  rect(c, C.rumput, o, 0, TILE, TILE);
  rect(c, C.rumputGelap, o + TILE / 2, 0, TILE / 2, TILE / 2);
  rect(c, C.rumputGelap, o, TILE / 2, TILE / 2, TILE / 2);
  rect(c, C.rumputTerang, o + 18, 8, 3, 2);
  rect(c, C.rumputTerang, o + 30, 34, 3, 2);
  // tile 2: jalan
  const o2 = TILE * 2;
  rect(c, C.jalan, o2, 0, TILE, TILE);
  rect(c, C.jalanGelap, o2 + 6, 10, 4, 4);
  rect(c, C.jalanGelap, o2 + 30, 28, 5, 4);
  rect(c, C.jalanGelap, o2 + 20, 40, 4, 3);
  // tile 3: jalan setapak
  const o3 = TILE * 3;
  rect(c, C.setapak, o3, 0, TILE, TILE);
  rect(c, C.setapakGelap, o3 + 10, 14, 5, 3);
  rect(c, C.setapakGelap, o3 + 28, 32, 4, 4);
  rect(c, C.setapakGelap, o3 + 18, 6, 3, 3);
  save('tileset.png', c);
}

// ---------- 3) Peta Tiled JSON (40x30 tile) ----------
const MAP_W = 40;
const MAP_H = 30;
function buildMap() {
  // gid: 1=rumput, 2=rumput-variasi, 3=jalan
  const data = new Array(MAP_W * MAP_H).fill(1);
  // sprinkle rumput variasi secara deterministik
  let seed = 12345;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = 0; i < data.length; i++) if (rnd() < 0.12) data[i] = 2;
  // jalan salib utama (lebar 2 tile): kolom 19-20, baris 14-15
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (x === 19 || x === 20 || y === 14 || y === 15) data[y * MAP_W + x] = 3;
    }
  }

  // jalan setapak berkelok (gid 4, lebar 1 tile) menghubungkan berbagai sudut,
  // tidak menimpa jalan utama (gid 3).
  const setTile = (x, y, gid) => {
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return;
    const i = y * MAP_W + x;
    if (data[i] !== 3) data[i] = gid;
  };
  const drawPath = (pts) => {
    for (let k = 0; k < pts.length - 1; k++) {
      let [x, y] = pts[k];
      const [tx, ty] = pts[k + 1];
      const sx = Math.sign(tx - x);
      const sy = Math.sign(ty - y);
      while (x !== tx) { setTile(x, y, 4); x += sx; } // melangkah horizontal
      while (y !== ty) { setTile(x, y, 4); y += sy; } // lalu vertikal (efek tangga)
      setTile(x, y, 4);
    }
  };
  drawPath([[3, 4], [9, 4], [9, 10], [18, 10]]); // kiri-atas menuju pusat
  drawPath([[36, 6], [30, 6], [30, 12], [21, 12]]); // kanan-atas menuju pusat
  drawPath([[5, 26], [12, 26], [12, 18], [18, 18]]); // kiri-bawah menuju pusat
  drawPath([[35, 25], [28, 25], [28, 19], [21, 19]]); // kanan-bawah menuju pusat
  drawPath([[6, 9], [6, 20], [14, 20]]); // setapak tepi kiri

  const map = {
    compressionlevel: -1,
    width: MAP_W,
    height: MAP_H,
    tilewidth: TILE,
    tileheight: TILE,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    infinite: false,
    type: 'map',
    version: '1.10',
    tiledversion: '1.10.2',
    nextlayerid: 2,
    nextobjectid: 1,
    tilesets: [
      {
        firstgid: 1,
        name: 'tiles',
        image: 'tileset.png',
        imagewidth: TILE * 4,
        imageheight: TILE,
        tilewidth: TILE,
        tileheight: TILE,
        tilecount: 4,
        columns: 4,
        margin: 0,
        spacing: 0,
      },
    ],
    layers: [
      {
        id: 1,
        name: 'ground',
        type: 'tilelayer',
        visible: true,
        opacity: 1,
        x: 0,
        y: 0,
        width: MAP_W,
        height: MAP_H,
        data,
      },
    ],
  };
  fs.writeFileSync(path.join(OUT, 'map.json'), JSON.stringify(map));
  console.log('  ✓ map.json', `${MAP_W}x${MAP_H} tiles`);
}

console.log('Membuat aset di public/assets/ ...');
drawCharacters();
drawTileset();
buildMap();
console.log('Selesai.');
