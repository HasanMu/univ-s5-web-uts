# DESIGN.md: Sistem Informasi Petani Kopi Giri Mekar

Panduan desain untuk aplikasi web petani kopi (PHP, PDO, PostgreSQL, Tailwind CSS v4, JavaScript biasa). Semua nilai di bawah diambil dari kode yang berjalan: `src/app.css`, `config/layout.php`, dan `public/assets/app.js`.

## 1. Gagasan

Aplikasi ini dirancang seperti **peta kebun yang dilihat dari atas**. Tiga hal yang diulang di seluruh halaman:

- **Melayang.** Setiap bagian adalah kartu yang terangkat dari latar dengan bayangan berwarna hijau. Tidak ada garis tepi sama sekali.
- **Kontur lereng.** Latar halaman memakai garis kontur yang sangat tipis, sebagai pengingat bahwa kebun kopi ada di lereng.
- **Hijau dan cokelat.** Hijau daun untuk struktur dan aksi, cokelat sangrai untuk data panen, merah ceri hanya untuk bahaya dan satu penanda kecil.

Satu elemen yang sengaja dibuat paling berani: **peta kebun** di Beranda. Elemen lain dibuat tenang supaya peta itu menjadi hal yang diingat.

## 2. Token

### Warna

| Token | Hex | Dipakai untuk |
|---|---|---|
| `daun` | `#1e3b2a` | Judul, tombol utama, menu aktif, ikon utama |
| `lumut` | `#3f6b4a` | Hover tombol, fokus, tautan, batang luas lahan |
| `pucuk` | `#a9c79b` | Latar petak kebun, sorotan baris baru |
| `kabut` | `#e5ebe0` | Latar halaman, isian form, track grafik |
| `surface` | `#fafbf7` | Latar kartu dan dialog |
| `sangrai` | `#5a3825` | Batang grafik panen, logo biji kopi |
| `mocha` | `#8a5b3a` | Penanda jenis Robusta |
| `ceri` | `#a82a3e` | Galat, tombol hapus, garis menu aktif di dock |
| `tinta` | `#1b2a21` | Teks isi |
| `lembut` | `#56655a` | Teks pendukung, label, keterangan |
| `#ff4d67` | (khusus kanvas) | Buah matang pada pohon di peta kebun |

Aturan pemakaian: hijau dominan, cokelat hanya untuk data, ceri jarang. Tidak ada gradasi sebagai hiasan dan tidak ada hitam murni (teks memakai `tinta` yang bernuansa hijau).

Kontras (rasio WCAG yang dihitung dari nilai di atas):

| Pasangan | Rasio |
|---|---|
| `tinta` di `kabut` | 12,4 : 1 |
| `tinta` di `surface` | 14,4 : 1 |
| `lembut` di `kabut` | 5,1 : 1 |
| `lembut` di `surface` | 5,9 : 1 |
| putih di `daun` | 12,3 : 1 |
| putih di `lumut` | 6,2 : 1 |
| `daun` di `pucuk` | 6,6 : 1 |
| `ceri` di `surface` | 6,6 : 1 |
| `lumut` di `surface` (tautan) | 5,9 : 1 |

Semua pasangan di tabel ini melewati 4,5 : 1. Pengecualian yang disengaja: teks placeholder di isian form dibuat lebih terang dari teks biasa, karena hanya contoh isian dan label di atasnya sudah menjelaskan fungsinya.

### Tipografi

| Peran | Keluarga | Berkas |
|---|---|---|
| Judul (`h1`, `h2`, `h3`) | Bricolage Grotesque, variabel 200 sampai 800 | `assets/fonts/bricolage-grotesque-latin-wght-normal.woff2` |
| Isi dan antarmuka | Instrument Sans, variabel 400 sampai 700 | `assets/fonts/instrument-sans-latin-wght-normal.woff2` |

Kedua font disimpan lokal (tanpa CDN), dengan `font-display: swap`. Judul memakai `letter-spacing: -0.01em`.

Skala yang dipakai:

| Pemakaian | Ukuran dan bobot |
|---|---|
| Judul hero Beranda | 36 px (ponsel), 60 px (`sm`), 72 px (`md` ke atas), semibold, `line-height` sekitar 1 |
| Judul halaman (Kontak) | 36 px, 48 px (`sm`), semibold |
| Judul kartu | 20 px, semibold |
| Judul di header | 16 px (ponsel), 20 px (`md`), semibold |
| Isi | 16 px, `line-height` 1,6 |
| Pendukung dan label | 14 px, `lembut` |
| Label dock | 12 px |

Lebar baris isi dibatasi di bawah 80 karakter (`max-w-xl` pada paragraf hero). Angka di tabel dan grafik memakai `tabular-nums`.

### Bentuk dan bayangan

| Token | Nilai |
|---|---|
| `--shadow-float` | `0 1px 2px rgb(30 59 42 / .07), 0 14px 34px -12px rgb(30 59 42 / .24)` |
| `--shadow-float-lg` | `0 2px 4px rgb(30 59 42 / .08), 0 26px 50px -16px rgb(30 59 42 / .34)` |

Radius: kartu 28 px (`1.75rem`), header 28 px, isian 16 px, petak kebun 24 px, tombol dan chip berbentuk pil (`999px`). Bayangan berwarna hijau (bukan abu-abu) supaya kartu menyatu dengan latar.

## 3. Tata letak

- Lebar konten maksimum `max-w-6xl` (72 rem), tengah halaman, jarak samping 12 px.
- **Header melayang**: kartu pil dengan latar `surface` 95 persen dan `backdrop-blur`, menempel di atas (`sticky`) mulai lebar `md`. Isinya logo biji kopi dan judul "Sistem Informasi Petani Kopi Giri Mekar" di kiri, dan menu (Beranda, Data Petani, Data Panen, Kontak) di kanan.
- **Beranda**: judul besar, paragraf pendek, tombol, lalu kartu peta kebun. Di bawahnya dua kartu grafik berdampingan (5 kolom: 3 untuk panen per tahun, 2 untuk panen terbanyak).
- **Data Petani dan Data Panen**: dua kolom pada layar lebar (form 21 rem di kiri dan menempel saat digulir, tabel di kanan). Pada layar sempit form di atas, tabel di bawah.
- **Kontak**: judul lalu tiga kartu informasi.
- Latar: warna `kabut` dengan `kontur.svg` (tiga puncak dengan sebelas cincin tak beraturan, garis `#d3ddcc`). Mulai lebar `md` latarnya `fixed` sehingga diam saat halaman digulir.

### Breakpoint

| Lebar | Perubahan |
|---|---|
| di bawah 768 px | Menu atas disembunyikan, dock melayang muncul di bawah. Tabel berubah jadi kartu bertumpuk. Header tidak menempel. |
| 768 px ke atas | Menu di header, tabel penuh, latar kontur `fixed`, padding kartu 32 px. |
| 1024 px ke atas | Form dan tabel berdampingan (`lg`). |
| di bawah 368 px (23 rem) | Padding item dock dikecilkan supaya muat di 320 px. |

Tidak ada geser horizontal di 320, 360, 390, 768, 1024, dan 1280 px.

## 4. Komponen

### Kartu (`.card`)
Latar `surface`, radius 28 px, `--shadow-float`, padding 24 px (32 px di `md`). Pemisah antarbagian adalah jarak dan bayangan, bukan garis.

### Isian form (`.field`)
Kotak berwarna `kabut` (dicampur putih 25 persen), radius 16 px, tanpa garis tepi. Saat hover warnanya lebih pekat. Saat fokus berubah putih dengan cincin `lumut` 3 px dan bayangan. Galat memberi cincin `ceri` 2 px, `aria-invalid="true"`, dan pesan di bawah isian (`.galat`, 14 px, `ceri`) yang terhubung lewat `aria-describedby`.

### Tombol
- **Utama** (`.btn-utama`): latar `daun`, teks putih, bentuk pil, bayangan. Hover berubah `lumut` dan naik 1 px. Saat memproses: `disabled` dengan opasitas 60 persen.
- **Tenang** (`.btn-tenang`): tanpa latar, teks `daun`, hover `kabut`. Untuk "Ubah", "Batal", dan "Unduh CSV".
- **Bahaya** (`.btn-bahaya`): teks `ceri`, hover merah muda sangat pucat. Untuk "Hapus".
- Tinggi sentuh minimal 44 px untuk tombol di dalam kartu tabel pada layar sempit.

### Tabel (`.tabel`)
Tanpa garis. Baris dipisahkan jarak 0,3 rem dan disorot dengan warna `kabut` saat hover. Header kolom 13 px, semibold, `lembut`, bisa diklik untuk mengurutkan (`aria-sort` dan panah). Kolom luas lahan punya batang mini (lebar tetap 5,5 rem) yang membandingkan antarpetani. Klik nama petani membuka baris detail berisi riwayat panen (grafik batang kecil, total, hasil per hektare). Baris yang baru ditambahkan berkedip hijau `pucuk` selama 1,8 detik.

Di bawah 768 px, header disembunyikan secara visual dan setiap baris menjadi kartu: tiap sel menampilkan labelnya sendiri lewat `data-label`.

### Peta kebun (elemen utama)
Treemap squarified: luas kotak sebanding dengan luas lahan petani. Setiap petak diisi pohon kopi yang digambar di `<canvas>`:

- Bulatan hijau tua adalah satu pohon. Kerapatannya sama di semua petak, jadi jumlah pohon hanya ilustrasi (bukan data pohon sungguhan).
- Titik merah (`#ff4d67`) adalah buah matang. Persentase pohon berbuah mengikuti **hasil per hektare** (panen tahun terbaru), dinormalisasi antara petani terendah dan tertinggi. Artinya nilai relatif antaranggota, bukan angka mutlak.
- Label melayang (`surface` 88 persen, blur) di sudut kiri atas petak: nama, luas, dan kg/ha. Pada petak yang terlalu kecil, nama disembunyikan secara visual tetapi tetap ada untuk pembaca layar.
- Setiap petak adalah tautan ke `petani.php?cari=<nama>`. Hover mengangkat petak 4 px dengan bayangan besar.
- Posisi pohon diacak secara deterministik (seed dari id petani), jadi tampilannya stabil di setiap muat.

### Grafik panen
Dibuat dari `div` dan CSS, tanpa library. Batang cokelat `sangrai` per tahun, strip proporsi jenis kopi (Arabika `lumut`, Robusta `mocha`), dan daftar lima petani teratas dengan batang horizontal.

### Dock bawah (layar sempit)
Pil melayang di bawah, empat menu dengan ikon di atas label (Beranda, Petani, Panen, Kontak). Menu aktif ditandai warna `daun`, teks tebal, dan garis kecil `ceri` di bawahnya (tanpa blok warna). Perilaku:

- **Diam sekitar 3 detik**: menciut menjadi satu menu aktif, ikon dan teks satu baris, lebih kecil.
- **Disentuh, digulir, atau difokus keyboard**: melebar lagi. Mengetuk menu aktif dalam keadaan ringkas hanya melebarkan, tidak memuat ulang.
- **Saat mengetik di kolom isian**: turun menyingkir supaya tidak tertutup papan ketik.
- Memperhitungkan area aman perangkat (`env(safe-area-inset-bottom)`).

### Notifikasi (`.toast`)
Pil `daun` di tengah bawah, `role="status"` (galat memakai `role="alert"`, latar `ceri`), hilang otomatis setelah 3,5 detik (6 detik untuk galat). Pada layar sempit posisinya naik di atas dock.

### Dialog
`<dialog>` bawaan browser, radius 28 px, latar belakang `daun` 45 persen dengan blur. Dipakai untuk konfirmasi hapus: judul menyebut aksinya, isi menyebut dampaknya (data panen ikut terhapus), tombol utama bertuliskan "Hapus petani".

## 5. Gerak

Prinsipnya hemat: gerak otomatis hanya satu momen, sisanya menjawab tindakan pengguna.

| Gerak | Jenis |
|---|---|
| Pohon di peta kebun "ditanam" satu per satu saat Beranda dibuka (sekitar 1,5 detik: tiap pohon tumbuh 420 ms dan mulainya bertahap per baris dan per petak) | Satu-satunya gerak otomatis |
| Petak naik saat hover, tombol naik 1 px saat hover | Respons pengguna |
| Baris baru berkedip hijau, toast naik dari bawah | Konfirmasi aksi |
| Dock melebar dan menciut | Respons aktivitas |

`prefers-reduced-motion: reduce` mematikan semua animasi dan transisi, dan pohon langsung tergambar penuh.

## 6. Aksesibilitas

- Tautan "Lewati ke isi halaman" muncul saat difokus keyboard.
- Fokus terlihat: garis `lumut` 3 px dengan jarak 3 px pada semua elemen interaktif.
- Setiap isian punya `<label>` yang terlihat. Galat dibacakan lewat `aria-describedby` dan `aria-invalid`.
- Ringkasan jumlah data (`#jumlah`) memakai `aria-live="polite"`.
- Tabel memakai `<th scope="col">`, `aria-sort` pada kolom yang bisa diurutkan, dan tombol aksi yang berlabel lengkap (`aria-label="Hapus data <nama>"`).
- Menu aktif ditandai `aria-current="page"`.
- Informasi pada grafik tidak hanya bergantung warna: angka dan label selalu tertulis.
- Teks isi, label, tautan, dan tombol lolos kontras 4,5 : 1 (lihat bagian 2). Placeholder isian lebih terang, tetapi tidak membawa informasi penting.

## 7. Bahasa antarmuka

Bahasa Indonesia sehari-hari, huruf besar hanya di awal kalimat, kata kerja aktif.

- Tombol menyebut hasilnya: "Simpan", "Hapus petani", "Unduh CSV". Istilahnya konsisten dari tombol sampai pesan ("Hapus petani" lalu "Data petani dihapus.").
- Galat menjelaskan apa yang salah dan cara memperbaikinya: "Luas lahan harus berupa angka lebih dari 0 (hektare)."
- Kondisi kosong mengajak bertindak: "Belum ada petani. Isi formulir untuk menambahkan petani pertama."
- Pencarian tanpa hasil memberi arahan: "Tidak ada petani bernama “zzzz”. Coba ejaan lain atau kosongkan kolom pencarian."

## 8. Yang dihindari

- Garis tepi, kecuali cincin fokus dan galat.
- Gradasi sebagai hiasan, bayangan abu-abu seragam, dan semua elemen berradius sama.
- Label huruf kapital semua dan penomoran yang bukan urutan.
- Gerak otomatis di banyak tempat.
- Menyampaikan data hanya lewat warna.

## 9. Peta berkas

| Berkas | Isi |
|---|---|
| `src/app.css` | Token (`@theme`), komponen, dan breakpoint. Dibangun ke `public/assets/app.css` |
| `config/layout.php` | Header, menu, dock, footer, ikon menu |
| `public/index.php` | Hero, peta kebun, grafik |
| `public/petani.php`, `public/panen.php` | Form dan tabel |
| `public/kontak.php` | Halaman kontak |
| `public/assets/app.js` | Peta kebun, grafik, tabel interaktif, dock, validasi, toast, dialog |
| `public/assets/kontur.svg` | Latar kontur |
| `public/assets/fonts/` | Font lokal |

Membangun ulang CSS setelah mengubah token: `npm run build`.
