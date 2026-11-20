# Sistem Informasi Petani Kopi Giri Mekar

Aplikasi web untuk mencatat petani dan hasil panen Kelompok Petani Giri Mekar Senang.
PHP 8.x + PDO + PostgreSQL, tampilan dengan HTML, Tailwind CSS (sudah dibangun, tidak perlu Node), dan JavaScript biasa.

## Menjalankan

Kebutuhan: PHP 8.1 atau lebih baru dengan ekstensi `pdo_pgsql`, dan PostgreSQL 13 atau lebih baru.

1. Buat basis data dan isi tabelnya (sudah termasuk data contoh):

   ```bash
   createdb giri_mekar
   psql -d giri_mekar -f schema.sql
   ```

   `schema.sql` memasang ekstensi `pg_trgm` untuk pencarian nama yang toleran salah ketik. Bila `CREATE EXTENSION`
   ditolak (bukan superuser), hapus baris itu dan baris `CREATE INDEX ... gin`. Aplikasi otomatis memakai `ILIKE`.

2. Samakan koneksi di `config/database.php`, atau lewat variabel lingkungan
   `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`. Bawaan: `127.0.0.1:5432`, basis data `giri_mekar`, pengguna `postgres`, sandi `root`.

3. Jalankan server dari folder ini:

   ```bash
   php -S localhost:8000 -t public
   ```

   Buka http://localhost:8000. Di XAMPP atau Laragon, arahkan document root ke folder `public/`
   (atau salin proyek ke `htdocs` lalu buka `/giri-mekar/public/`).

Folder tidak bisa dibuka langsung dengan klik dua kali `index.php`: PHP dan basis data butuh server.

## Pemetaan ke soal praktik

| Soal | Lokasi |
|---|---|
| 1a Header judul, 1b menu navigasi | `config/layout.php` |
| 1c Form petani, 1d tabel petani | `public/petani.php` |
| 2a-2d Warna, layout, form dan tabel, responsif | `src/app.css` (dibangun ke `public/assets/app.css`) |
| 2e Grafik luas lahan dan panen | `public/index.php`, fungsi `halamanBeranda` di `public/assets/app.js` |
| 3a Validasi nama dan ID tidak kosong | `validasi()` di `app.js`, dan `validasi_petani()` di `config/helpers.php` |
| 3b Tambah ke tabel secara dinamis, 3c pesan berhasil | `halamanPetani` di `app.js` |
| 3d Pencarian nama | kolom "Cari berdasarkan nama", `app.js` |
| 4a-4d CRUD basis data, pesan, pencarian | `public/api/petani.php`, `public/api/panen.php`, `cari_petani()` |

Tambahan di luar soal:

- **Peta kebun** di Beranda: tiap petak seluas lahan petani, diisi pohon kopi yang digambar di kanvas. Persentase pohon berbuah
  mengikuti hasil per hektare (panen tahun terbaru). Klik petak untuk membuka datanya di Data Petani.
- **Tabel petani**: urut per kolom, batang mini luas lahan, klik nama untuk melihat riwayat panen petani, unduh CSV, dan
  tombol `/` untuk langsung ke kolom pencarian.
- Halaman Data Panen (tabel `panen`), ubah dan hapus petani, serta token CSRF pada setiap permintaan tulis.
- Pencarian dengan `pg_trgm` (mis. "Sunandr" tetap menemukan "Asep Sunandar").

## Keamanan singkat

- Semua query memakai prepared statement PDO (`ATTR_EMULATE_PREPARES = false`); karakter `%` dan `_` pada pencarian di-escape.
- Teks dari basis data dipasang dengan `textContent`/`htmlspecialchars`, bukan `innerHTML`.
- Permintaan tulis wajib membawa header `X-CSRF-Token` yang cocok dengan sesi.
- Validasi dilakukan di browser (JavaScript) dan diulang di server (PHP).

## Mengubah tampilan

```bash
npm install
npm run build     # atau: npm run watch
```

Data petani dan panen dalam `schema.sql` adalah data contoh (fiktif).
