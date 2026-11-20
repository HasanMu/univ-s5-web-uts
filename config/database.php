<?php
declare(strict_types=1);

// Koneksi PDO ke PostgreSQL. Nilai bisa diganti lewat variabel lingkungan
// (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS) atau langsung diubah di sini.
function db(): PDO
{
    static $pdo = null;
    if ($pdo) return $pdo;

    $dsn = sprintf(
        'pgsql:host=%s;port=%s;dbname=%s',
        getenv('DB_HOST') ?: '127.0.0.1',
        getenv('DB_PORT') ?: '5432',
        getenv('DB_NAME') ?: 'giri_mekar'
    );
    $pdo = new PDO($dsn, getenv('DB_USER') ?: 'postgres', getenv('DB_PASS') ?: 'root', [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
}

// True bila ekstensi pg_trgm terpasang; kalau tidak, pencarian turun ke ILIKE.
function has_trgm(): bool
{
    static $ok = null;
    return $ok ??= (bool) db()->query("SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'")->fetchColumn();
}
