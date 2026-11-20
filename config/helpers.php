<?php
declare(strict_types=1);

require_once __DIR__ . '/database.php';

session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
session_start();

function e(?string $s): string
{
    return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function csrf_token(): string
{
    return $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}

// ---- JSON API ----

function json_out(mixed $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION);
    exit;
}

function api_guard(): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (!hash_equals(csrf_token(), $sent)) {
            json_out(['error' => 'Sesi kedaluwarsa. Muat ulang halaman lalu coba lagi.'], 403);
        }
    }
}

function json_body(): array
{
    $b = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($b) ? $b : [];
}

// ---- Data ----

/** Cari petani menurut nama. pg_trgm: cocok sebagian atau mirip; tanpa itu: ILIKE. */
function cari_petani(string $q): array
{
    // shortcut: maksimum 500 baris tanpa paginasi; tambah LIMIT/OFFSET bila anggota ribuan.
    $cols = "id, kode, nama, alamat, luas_lahan::float AS luas_lahan";
    $q = trim($q);
    if ($q === '') {
        return db()->query("SELECT $cols FROM petani ORDER BY id LIMIT 500")->fetchAll();
    }
    $like = '%' . addcslashes($q, '%_\\') . '%';
    if (has_trgm()) {
        $st = db()->prepare(
            "SELECT $cols FROM petani
             WHERE nama ILIKE :like OR nama % :q
             ORDER BY similarity(nama, :q) DESC, nama LIMIT 500"
        );
        $st->execute(['like' => $like, 'q' => $q]);
    } else {
        $st = db()->prepare("SELECT $cols FROM petani WHERE nama ILIKE :like ORDER BY nama LIMIT 500");
        $st->execute(['like' => $like]);
    }
    return $st->fetchAll();
}

/** Validasi data petani; kembalikan [bersih, galat-per-kolom]. */
function validasi_petani(array $in): array
{
    $d = [
        'kode'       => trim((string) ($in['kode'] ?? '')),
        'nama'       => trim((string) ($in['nama'] ?? '')),
        'alamat'     => trim((string) ($in['alamat'] ?? '')),
        'luas_lahan' => str_replace(',', '.', trim((string) ($in['luas_lahan'] ?? ''))),
    ];
    $err = [];
    if ($d['nama'] === '') $err['nama'] = 'Nama petani wajib diisi.';
    elseif (mb_strlen($d['nama']) > 100) $err['nama'] = 'Nama petani maksimal 100 karakter.';
    if ($d['kode'] === '') $err['kode'] = 'NIK atau ID petani wajib diisi.';
    elseif (!preg_match('/^[A-Za-z0-9._-]{3,20}$/', $d['kode'])) $err['kode'] = 'ID petani 3–20 karakter: huruf, angka, titik, garis bawah, atau strip.';
    if ($d['luas_lahan'] === '' || !is_numeric($d['luas_lahan']) || (float) $d['luas_lahan'] <= 0 || (float) $d['luas_lahan'] > 99999) {
        $err['luas_lahan'] = 'Luas lahan harus berupa angka lebih dari 0 (hektare).';
    }
    return [$d, $err];
}
