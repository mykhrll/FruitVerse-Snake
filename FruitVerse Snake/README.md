# FruitVerse Snake — Setup di Visual Studio Code

## Persyaratan
- Java JDK 17 atau lebih baru
- Visual Studio Code
- Extension VS Code: **Extension Pack for Java** (oleh Microsoft)
- JavaFX SDK 21 (LTS)

---

## Langkah Setup

### 1. Download JavaFX SDK
1. Buka: https://gluonhq.com/products/javafx/
2. Pilih versi **JavaFX 21 LTS**, OS sesuai komputer (Windows/Mac/Linux)
3. Pilih tipe **SDK**, klik Download
4. Ekstrak file yang diunduh

### 2. Salin Jar JavaFX ke Folder `lib/`
Dari folder hasil ekstrak, masuk ke subfolder `lib/`.
Salin **semua file `.jar`** ke folder `lib/` di dalam project ini:

```
SnakeGame/
├── lib/
│   ├── javafx.base.jar
│   ├── javafx.controls.jar
│   ├── javafx.graphics.jar
│   ├── javafx.media.jar
│   └── ... (semua .jar lainnya)
├── sounds/
│   ├── eat.wav
│   ├── heal.wav
│   ├── damage.wav
│   ├── ability.wav
│   ├── gameover.wav
│   ├── bgm_menu.wav
│   ├── bgm_dark.wav
│   ├── bgm_desert.wav
│   ├── bgm_forest.wav
│   ├── bgm_neon.wav
│   └── bgm_snow.wav
├── Main.java
├── GamePane.java
└── ...
```

### 3. Buka Project di VS Code
1. Buka VS Code
2. Pilih **File → Open Folder** → pilih folder `SnakeGame`
3. Pastikan Extension **Extension Pack for Java** sudah terpasang
4. Tunggu VS Code mendeteksi project Java

### 4. Jalankan Game
- Tekan **F5** atau klik tombol **Run** (▶) di pojok kanan atas
- Atau buka file `Main.java` lalu klik tombol **Run Java** di atas kode

---

## Kontrol Game

| Tombol | Aksi |
|--------|------|
| W / ↑  | Gerak atas |
| S / ↓  | Gerak bawah |
| A / ←  | Gerak kiri |
| D / →  | Gerak kanan |
| 1      | Ability: Slow Motion (-50 koin) |
| 2      | Ability: Speed Up (-50 koin) |
| 3      | Ability: Magnet (-50 koin) |
| 4      | Ability: Ghost/Tembus (-50 koin) |
| SPACE / ESC / P | Pause / Resume |
| ENTER  | Kembali ke menu (saat Game Over) |

> **Catatan:** Tombol panah (↑ ↓ ← →) kini berfungsi penuh selama bermain.
> Input keyboard ditangkap di level scene menggunakan event filter sehingga
> tidak terhalang oleh fokus tombol-tombol UI di layar.

---

## Item dalam Game

| Item | Efek |
|------|------|
| Makanan biasa (Apple, Dark Berry, Mushroom, Cactus Fruit, Ice Berry, Neon Apple) | +10 Skor, +5 Koin, ular tumbuh |
| Bintang (Star/Bonus) | +30 Skor, +5 Koin, ular tumbuh |
| Ramuan Hijau (Potion) | +20 HP |
| Racun/Tengkorak (Poison) | -10 HP |
| Buah Pelangi (Map Fruit) | Ganti map & BGM (muncul tiap 60 detik) |

---

## Map & Makanan Khas

| Map | Makanan Khas |
|-----|-------------|
| Dark   | Dark Berry |
| Forest | Mushroom |
| Desert | Cactus Fruit |
| Snow   | Ice Berry |
| Neon   | Neon Apple |

---

## Abilities

| Tombol | Ability | Efek | Biaya |
|--------|---------|------|-------|
| 1 | Slow Motion | Game berjalan 0.5× lebih lambat | 50 koin |
| 2 | Speed Up | Game berjalan 2× lebih cepat | 50 koin |
| 3 | Magnet | Item di sekitar tertarik ke kepala ular | 50 koin |
| 4 | Ghost | Ular bisa menembus dinding (wrap around) | 50 koin |

---

## Struktur Class (OOP)

| Class | Peran |
|-------|-------|
| **Main** | Entry point aplikasi JavaFX |
| **LoginPane** | Layar input nama pemain |
| **MenuPane** | Tampilan menu utama |
| **GamePane** | Layar permainan + game loop |
| **ShopPane** | Tampilan toko skin ular |
| **GameManager** | Logika inti game (score, collision, item, map) |
| **Snake** | Representasi ular (body, movement, health, coins) |
| **Item** *(abstract)* | Superclass semua item di map |
| **Food** | Item makanan & buah peta |
| **Potion** | Item ramuan penyembuh |
| **Poison** | Item racun |
| **ItemFactory** | Factory pattern untuk membuat item |
| **MapType** | Enum tipe-tipe map beserta warna & BGM |
| **SoundManager** | Manajemen BGM (MediaPlayer) & SFX (AudioClip) |
| **LeaderboardManager** | Simpan & load data skor tertinggi |
| **LeaderboardEntry** | Satu entri nama + skor (Serializable) |
| **ScreenUtil** | Utilitas resolusi layar |

---

## Catatan Teknis

- **Keyboard input** ditangkap via `scene.addEventFilter(KeyEvent.KEY_PRESSED, ...)` sehingga
  arrow key dan ENTER berfungsi meskipun ada tombol UI yang terfokus.
- **Suara** dikelola oleh `SoundManager.stopAllSounds()` yang menghentikan sekaligus
  BGM (`MediaPlayer`) dan efek suara game over (`AudioClip`) sebelum berpindah layar,
  sehingga tidak ada suara yang tertumpuk saat kembali ke menu.
- **Leaderboard** disimpan secara lokal di file `leaderboard.dat` menggunakan Java Serialization.
