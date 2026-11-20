<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/helpers.php';
api_guard();

const SELECT_PANEN = 'SELECT n.id, n.petani_id, p.nama AS petani, p.kode, n.tahun, n.jenis, n.berat_kg::float AS berat_kg
                      FROM panen n JOIN petani p ON p.id = n.petani_id';

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // shortcut: maksimum 500 baris tanpa paginasi.
            $st = db()->prepare(SELECT_PANEN . ' WHERE (:p::int IS NULL OR n.petani_id = :p) ORDER BY n.tahun DESC, n.id DESC LIMIT 500');
            $st->execute(['p' => isset($_GET['petani_id']) ? (int) $_GET['petani_id'] : null]);
            json_out(['data' => $st->fetchAll()]);

        case 'POST':
            $in = json_body();
            $petani = (int) ($in['petani_id'] ?? 0);
            $tahun  = (int) ($in['tahun'] ?? 0);
            $jenis  = (string) ($in['jenis'] ?? '');
            $berat  = str_replace(',', '.', trim((string) ($in['berat_kg'] ?? '')));
            $err = [];
            if ($petani <= 0) $err['petani_id'] = 'Pilih petani.';
            if ($tahun < 2000 || $tahun > 2100) $err['tahun'] = 'Tahun panen harus antara 2000 dan 2100.';
            if (!in_array($jenis, ['Arabika', 'Robusta'], true)) $err['jenis'] = 'Pilih jenis kopi.';
            if ($berat === '' || !is_numeric($berat) || (float) $berat <= 0 || (float) $berat > 99999999) $err['berat_kg'] = 'Berat panen harus berupa angka lebih dari 0 (kg).';
            if ($err) json_out(['error' => 'Data belum valid.', 'fields' => $err], 422);

            $ins = db()->prepare('INSERT INTO panen (petani_id, tahun, jenis, berat_kg) VALUES (:p, :t, :j, :b) RETURNING id');
            $ins->execute(['p' => $petani, 't' => $tahun, 'j' => $jenis, 'b' => $berat]);
            $row = db()->prepare(SELECT_PANEN . ' WHERE n.id = :id');
            $row->execute(['id' => $ins->fetchColumn()]);
            json_out(['data' => $row->fetch()], 201);

        case 'DELETE':
            $st = db()->prepare('DELETE FROM panen WHERE id = :id');
            $st->execute(['id' => (int) ($_GET['id'] ?? 0)]);
            $st->rowCount() ? json_out(['ok' => true]) : json_out(['error' => 'Data panen tidak ditemukan.'], 404);

        default:
            json_out(['error' => 'Metode tidak didukung.'], 405);
    }
} catch (PDOException $ex) {
    if ($ex->getCode() === '23503') json_out(['error' => 'Data belum valid.', 'fields' => ['petani_id' => 'Petani tidak ditemukan.']], 422);
    error_log($ex->getMessage());
    json_out(['error' => 'Basis data bermasalah. Coba lagi sebentar.'], 500);
}
