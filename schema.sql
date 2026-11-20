-- Basis data Sistem Informasi Petani Kopi Giri Mekar (PostgreSQL 13+).
-- Jalankan:  createdb giri_mekar && psql -d giri_mekar -f schema.sql
-- Ekstensi pg_trgm dipakai untuk pencarian nama yang toleran salah ketik. Bila
-- CREATE EXTENSION ditolak (bukan superuser), hapus baris itu dan indeks GIN di
-- bawah: aplikasi otomatis memakai ILIKE biasa.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS petani (
    id          SERIAL PRIMARY KEY,
    kode        VARCHAR(20)   NOT NULL UNIQUE,          -- NIK atau ID Petani
    nama        VARCHAR(100)  NOT NULL,
    alamat      TEXT          NOT NULL DEFAULT '',
    luas_lahan  NUMERIC(8,2)  NOT NULL CHECK (luas_lahan > 0),  -- hektare
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS panen (
    id          SERIAL PRIMARY KEY,
    petani_id   INTEGER       NOT NULL REFERENCES petani(id) ON DELETE CASCADE,
    tahun       SMALLINT      NOT NULL CHECK (tahun BETWEEN 2000 AND 2100),
    jenis       VARCHAR(20)   NOT NULL CHECK (jenis IN ('Arabika', 'Robusta')),
    berat_kg    NUMERIC(10,2) NOT NULL CHECK (berat_kg > 0),
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS petani_nama_trgm ON petani USING gin (nama gin_trgm_ops);
CREATE INDEX IF NOT EXISTS panen_petani_idx ON panen (petani_id);

-- Data contoh (fiktif) agar halaman dan grafik langsung terisi.
INSERT INTO petani (kode, nama, alamat, luas_lahan) VALUES
 ('GM-001', 'Asep Sunandar',   'Kp. Cipanjalu RT 02/RW 05',  3.40),
 ('GM-002', 'Dedi Mulyana',    'Kp. Cipanjalu RT 04/RW 05',  2.15),
 ('GM-003', 'Euis Kartini',    'Kp. Giriharja RT 01/RW 03',  1.20),
 ('GM-004', 'Yayan Ruhiyat',   'Kp. Giriharja RT 03/RW 03',  4.80),
 ('GM-005', 'Cecep Hidayat',   'Kp. Ciburial RT 05/RW 07',   2.75),
 ('GM-006', 'Nining Suryani',  'Kp. Ciburial RT 02/RW 07',   0.90),
 ('GM-007', 'Omay Rohmat',     'Kp. Cibeusi RT 01/RW 02',    1.85),
 ('GM-008', 'Iwan Setiawan',   'Kp. Cibeusi RT 04/RW 02',    3.10),
 ('GM-009', 'Entin Maryati',   'Kp. Pasir Angling RT 02/RW 04', 1.50),
 ('GM-010', 'Ujang Saepudin',  'Kp. Pasir Angling RT 06/RW 04', 2.40)
ON CONFLICT (kode) DO NOTHING;

INSERT INTO panen (petani_id, tahun, jenis, berat_kg)
SELECT p.id, v.tahun, v.jenis, v.berat
FROM (VALUES
 ('GM-001', 2024, 'Arabika', 1850.00), ('GM-001', 2025, 'Arabika', 2120.00),
 ('GM-002', 2024, 'Arabika', 1040.00), ('GM-002', 2025, 'Arabika', 1210.00),
 ('GM-003', 2025, 'Arabika',  610.00),
 ('GM-004', 2024, 'Robusta', 3200.00), ('GM-004', 2025, 'Robusta', 3540.00),
 ('GM-005', 2024, 'Arabika', 1390.00), ('GM-005', 2025, 'Arabika', 1480.00),
 ('GM-006', 2025, 'Arabika',  430.00),
 ('GM-007', 2024, 'Robusta',  980.00), ('GM-007', 2025, 'Robusta', 1120.00),
 ('GM-008', 2024, 'Arabika', 1720.00), ('GM-008', 2025, 'Arabika', 1890.00),
 ('GM-009', 2025, 'Arabika',  790.00),
 ('GM-010', 2024, 'Robusta', 1310.00), ('GM-010', 2025, 'Robusta', 1450.00)
) AS v(kode, tahun, jenis, berat)
JOIN petani p ON p.kode = v.kode
WHERE NOT EXISTS (SELECT 1 FROM panen);
