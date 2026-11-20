<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/helpers.php';
api_guard();

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            json_out(['data' => cari_petani((string) ($_GET['q'] ?? ''))]);

        case 'POST':
        case 'PUT':
            $in = json_body();
            [$d, $err] = validasi_petani($in);
            if ($err) json_out(['error' => 'Data belum valid.', 'fields' => $err], 422);

            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $st = db()->prepare(
                    'INSERT INTO petani (kode, nama, alamat, luas_lahan) VALUES (:kode, :nama, :alamat, :luas)
                     RETURNING id, kode, nama, alamat, luas_lahan::float AS luas_lahan'
                );
                $st->execute(['kode' => $d['kode'], 'nama' => $d['nama'], 'alamat' => $d['alamat'], 'luas' => $d['luas_lahan']]);
                json_out(['data' => $st->fetch()], 201);
            }

            $st = db()->prepare(
                'UPDATE petani SET kode = :kode, nama = :nama, alamat = :alamat, luas_lahan = :luas WHERE id = :id
                 RETURNING id, kode, nama, alamat, luas_lahan::float AS luas_lahan'
            );
            $st->execute(['kode' => $d['kode'], 'nama' => $d['nama'], 'alamat' => $d['alamat'], 'luas' => $d['luas_lahan'], 'id' => (int) ($in['id'] ?? 0)]);
            $row = $st->fetch();
            $row ? json_out(['data' => $row]) : json_out(['error' => 'Data petani tidak ditemukan.'], 404);

        case 'DELETE':
            $st = db()->prepare('DELETE FROM petani WHERE id = :id');
            $st->execute(['id' => (int) ($_GET['id'] ?? 0)]);
            $st->rowCount() ? json_out(['ok' => true]) : json_out(['error' => 'Data petani tidak ditemukan.'], 404);

        default:
            json_out(['error' => 'Metode tidak didukung.'], 405);
    }
} catch (PDOException $ex) {
    if ($ex->getCode() === '23505') {
        json_out(['error' => 'Data belum valid.', 'fields' => ['kode' => 'ID petani sudah dipakai petani lain.']], 409);
    }
    error_log($ex->getMessage());
    json_out(['error' => 'Basis data bermasalah. Coba lagi sebentar.'], 500);
}
