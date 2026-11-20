<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

// [halaman, label menu atas, label dock bawah, ikon]
const MENU = [
    'beranda' => ['index.php', 'Beranda', 'Beranda', '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>'],
    'petani'  => ['petani.php', 'Data Petani', 'Petani', '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.8-4 3.7-6 7.5-6s6.7 2 7.5 6"/>'],
    'panen'   => ['panen.php', 'Data Panen', 'Panen', '<path d="M5 20v-8"/><path d="M12 20V5"/><path d="M19 20v-5"/>'],
    'kontak'  => ['kontak.php', 'Kontak', 'Kontak', '<rect x="3.5" y="5.5" width="17" height="13" rx="3"/><path d="m4 8 8 5.5L20 8"/>'],
];

function page_top(string $title, string $active): void
{
    $GLOBALS['menu_aktif'] = $active;
    ?><!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#e5ebe0">
  <meta name="csrf-token" content="<?= e(csrf_token()) ?>">
  <title><?= e($title) ?> · Petani Kopi Giri Mekar</title>
  <link rel="preload" href="assets/fonts/bricolage-grotesque-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="assets/app.css">
  <script src="assets/app.js" defer></script>
</head>
<body data-page="<?= e($active) ?>">
  <a href="#isi" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">Lewati ke isi halaman</a>

  <header class="top-3 z-20 md:sticky mx-auto mt-3 max-w-6xl px-3">
    <div class="float flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-[1.75rem] bg-surface/95 px-4 py-3 backdrop-blur md:px-6">
      <a href="index.php" class="flex items-center gap-3">
        <svg class="size-9 shrink-0" viewBox="0 0 40 40" aria-hidden="true">
          <ellipse cx="20" cy="20" rx="11" ry="16" transform="rotate(32 20 20)" fill="#5a3825"/>
          <path d="M13 8c6 5 1 11 7 14s2 8 6 11" transform="rotate(0 20 20)" fill="none" stroke="#e5ebe0" stroke-width="2.4" stroke-linecap="round"/>
        </svg>
        <h1 class="text-base font-semibold leading-tight text-daun md:text-xl">Sistem Informasi Petani Kopi Giri Mekar</h1>
      </a>
      <nav aria-label="Menu utama" class="hidden gap-1 md:flex">
        <?php foreach (MENU as $key => [$href, $label]): ?>
          <a href="<?= $href ?>" class="nav-link" <?= $key === $active ? 'aria-current="page"' : '' ?>><?= $label ?></a>
        <?php endforeach; ?>
      </nav>
    </div>
  </header>

  <main id="isi" class="mx-auto max-w-6xl px-3 pb-32 pt-8 md:pb-24 md:pt-10">
<?php
}

function page_bottom(): void
{
    $active = $GLOBALS['menu_aktif'] ?? '';
    ?>
  </main>

  <footer class="mx-auto max-w-6xl px-6 pb-28 text-sm text-lembut md:pb-10">
    Kelompok Petani Giri Mekar Senang. Data pada aplikasi ini adalah contoh untuk keperluan tugas.
  </footer>

  <!-- Dock bawah untuk layar sempit: menciut jadi satu menu aktif saat diam. -->
  <nav class="dock md:hidden" aria-label="Menu utama" data-dock>
    <?php foreach (MENU as $key => [$href, $label, $pendek, $ikon]): ?>
      <a href="<?= $href ?>" class="dock-item" aria-label="<?= $label ?>" <?= $key === $active ? 'aria-current="page"' : '' ?>>
        <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><?= $ikon ?></svg>
        <span><?= $pendek ?></span>
      </a>
    <?php endforeach; ?>
  </nav>
</body>
</html>
<?php
}
