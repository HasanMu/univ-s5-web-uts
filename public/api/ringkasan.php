<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/helpers.php';

// Data untuk grafik Beranda: luas lahan per petani, panen per tahun, dan petani dengan panen terbanyak.
$pdo = db();
json_out([
    // kg = panen tahun terbaru per petani, dipakai untuk menghitung hasil per hektare.
    'tahun_acuan' => (int) $pdo->query('SELECT COALESCE(MAX(tahun), 0) FROM panen')->fetchColumn(),
    'lahan' => $pdo->query('SELECT p.id, p.nama, p.luas_lahan::float AS ha, COALESCE(n.kg, 0)::float AS kg
                            FROM petani p
                            LEFT JOIN (SELECT petani_id, SUM(berat_kg) AS kg FROM panen
                                       WHERE tahun = (SELECT MAX(tahun) FROM panen) GROUP BY petani_id) n ON n.petani_id = p.id
                            ORDER BY p.luas_lahan DESC, p.nama')->fetchAll(),
    'tahun' => $pdo->query('SELECT tahun, SUM(berat_kg)::float AS kg FROM panen GROUP BY tahun ORDER BY tahun')->fetchAll(),
    'jenis' => $pdo->query('SELECT jenis, SUM(berat_kg)::float AS kg FROM panen GROUP BY jenis ORDER BY kg DESC')->fetchAll(),
    'top'   => $pdo->query('SELECT p.nama, SUM(n.berat_kg)::float AS kg FROM panen n JOIN petani p ON p.id = n.petani_id
                            GROUP BY p.id, p.nama ORDER BY kg DESC LIMIT 5')->fetchAll(),
]);
