# Gebyar Semangat Kemerdekaan 🇮🇩

Game edukasi eksplorasi 2D top-down bertema **Hari Kemerdekaan 17 Agustus**.
Pemain berjalan menjelajahi alun-alun, mengunjungi **permainan & momen khas 17an**
(Panjat Pinang, Balap Karung, Tarik Tambang, Upacara Bendera, dll), dan membaca
penjelasan edukatif singkat untuk menumbuhkan semangat kemerdekaan.

Dibuat dengan **Phaser 3 + Vite + TypeScript**.

## Menjalankan

```bash
npm install
npm run dev
```

Buka URL yang ditampilkan (default http://localhost:5173).

## Build untuk produksi

```bash
npm run build      # hasil ada di folder dist/
npm run preview    # uji hasil build secara lokal
```

`base: './'` sudah diset, jadi folder `dist/` bisa langsung di-upload ke
hosting statis (Vercel/Netlify/GitHub Pages) maupun subfolder XAMPP/cPanel.

## Kontrol

- **WASD / Tombol Panah** — berjalan
- **E / Spasi** — kunjungi tempat saat berada di dekat papan penanda

Progress (tempat yang sudah dikunjungi) tersimpan otomatis di `localStorage`.

## Struktur

```
src/
├── main.ts              # konfigurasi Phaser & daftar scene
├── config.ts            # warna tema & konstanta
├── textures.ts          # generator tekstur pixel-art (pohon, bukit, rumput, papan, pin)
├── audio.ts             # musik & SFX prosedural (Web Audio API, tanpa file)
├── data/places.ts       # data tempat (permainan/momen 17an) + ukuran dunia
├── objects/
│   ├── Player.ts        # pemain (gerak 4 arah + animasi & hadap berarah)
│   └── NPC.ts           # warga berkeliaran + gelembung dialog saat didekati
└── scenes/
    ├── PreloadScene.ts  # muat aset + filter NEAREST (pixel tajam, teks halus)
    ├── MenuScene.ts     # modal intro "Mulai Bermain" (memulai audio + jeda game)
    ├── GameScene.ts     # dunia (tilemap), pohon/bukit, NPC, minimap, interaksi
    ├── UIScene.ts       # HUD: penghitung, misi, minimap "PETA", kartu info, tombol bisu
    └── WinScene.ts      # layar menang "MERDEKA!" + tombol "Main Lagi"

scripts/gen-assets.mjs   # generator aset NYATA -> public/assets/
public/assets/
├── player.png           # spritesheet pemain 3x3 (16x24): baris bawah/atas/samping — edit di Aseprite
├── tileset.png          # tileset 4 tile (48x48): rumput, variasi, jalan, setapak — edit di Aseprite
└── map.json             # peta Tiled 40x30 — edit di Tiled Map Editor
```

> Catatan: progres TIDAK disimpan — setiap refresh kembali ke 0/10 tempat.
> Bukit memakai palet rumput agar menyatu dengan tanah dan tidak bisa dilewati.

## Aset & peta (Aseprite / Tiled)

Aset dibuat oleh skrip dan disimpan sebagai file PNG/JSON sungguhan:

```bash
npm run gen:assets   # buat ulang public/assets/* (juga jalan otomatis saat build)
```

**Mengganti grafik dengan karya sendiri (Aseprite/Piskel):**
- Buka `public/assets/player.png` di [Aseprite](https://www.aseprite.org/). Grid **3×3 sel
  16×24** — baris: bawah/depan, atas/belakang, samping (hadap kanan); kolom: diam,
  langkah lebar, langkah rapat. Indeks frame: bawah 0-2, atas 3-5, samping 6-8.
  Ekspor menimpa file itu — selesai.
- `public/assets/tileset.png` = 4 petak 48×48 (rumput, rumput-variasi, jalan, jalan setapak).

**Mengedit peta (Tiled):**
- Buka `public/assets/map.json` di [Tiled Map Editor](https://www.mapeditor.org/).
  Peta 40×30 petak, satu layer `ground`, tileset `tileset.png` (gid 1=rumput,
  2=variasi, 3=jalan). Gambar ulang tata letak lalu simpan.
- Dimuat di `GameScene.buildMap()` via `this.make.tilemap({ key: 'map' })`.

> Jika menambah/menghapus frame pemain atau tile, sesuaikan juga
> `scripts/gen-assets.mjs` (sumber kebenaran) bila ingin `gen:assets` tetap akurat.

## Mengembangkan lebih lanjut

1. **Tambah konten**: edit `src/data/places.ts` — marker, pin minimap & penghitung menyesuaikan otomatis.
2. **Lapisan peta**: tambah layer di Tiled (mis. `obstacle`) lalu `map.createLayer(...)`
   + `layer.setCollisionByExclusion([-1])` untuk penghalang dari peta.
3. **Pohon dari Tiled**: pindahkan posisi pohon ke object layer Tiled agar bisa ditata visual.
4. **Audio**: tambahkan musik/efek (mis. [Howler.js](https://howlerjs.com/) atau `this.load.audio`).
