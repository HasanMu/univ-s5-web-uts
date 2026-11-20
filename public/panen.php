<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/layout.php';

$petani = db()->query('SELECT id, kode, nama FROM petani ORDER BY nama')->fetchAll();
$awal = db()->query(
    'SELECT n.id, n.petani_id, p.nama AS petani, p.kode, n.tahun, n.jenis, n.berat_kg::float AS berat_kg
     FROM panen n JOIN petani p ON p.id = n.petani_id ORDER BY n.tahun DESC, n.id DESC LIMIT 500'
)->fetchAll();
page_top('Data Panen', 'panen');
?>
    <div class="grid items-start gap-6 lg:grid-cols-[21rem_1fr]">

      <section class="card lg:sticky lg:top-28" aria-labelledby="judul-form">
        <h2 id="judul-form" class="text-xl font-semibold">Catat hasil panen</h2>
        <?php if (!$petani): ?>
          <p class="mt-4 text-lembut">Belum ada petani. <a class="font-medium text-lumut underline" href="petani.php">Tambah petani</a> dulu sebelum mencatat panen.</p>
        <?php else: ?>
        <form id="form-panen" class="mt-5 space-y-4" novalidate>
          <div>
            <label for="petani_id" class="mb-1.5 block text-sm font-medium">Petani</label>
            <select id="petani_id" name="petani_id" class="field" required aria-describedby="petani_id-galat">
              <option value="">Pilih petani</option>
              <?php foreach ($petani as $p): ?>
                <option value="<?= (int) $p['id'] ?>"><?= e($p['nama']) ?> (<?= e($p['kode']) ?>)</option>
              <?php endforeach; ?>
            </select>
            <p id="petani_id-galat" class="galat" hidden></p>
          </div>
          <div>
            <label for="tahun" class="mb-1.5 block text-sm font-medium">Tahun panen</label>
            <input id="tahun" name="tahun" class="field" type="number" min="2000" max="2100" step="1" value="<?= (int) date('Y') ?>" required aria-describedby="tahun-galat">
            <p id="tahun-galat" class="galat" hidden></p>
          </div>
          <div>
            <label for="jenis" class="mb-1.5 block text-sm font-medium">Jenis kopi</label>
            <select id="jenis" name="jenis" class="field" required aria-describedby="jenis-galat">
              <option value="">Pilih jenis</option>
              <option>Arabika</option>
              <option>Robusta</option>
            </select>
            <p id="jenis-galat" class="galat" hidden></p>
          </div>
          <div>
            <label for="berat_kg" class="mb-1.5 block text-sm font-medium">Berat panen (kg)</label>
            <input id="berat_kg" name="berat_kg" class="field" type="number" min="0.01" step="0.01" inputmode="decimal" required aria-describedby="berat_kg-galat">
            <p id="berat_kg-galat" class="galat" hidden></p>
          </div>
          <button type="submit" class="btn btn-utama" id="simpan">Simpan</button>
        </form>
        <?php endif; ?>
      </section>

      <section class="card min-w-0" aria-labelledby="judul-tabel">
        <h2 id="judul-tabel" class="text-xl font-semibold">Riwayat panen</h2>
        <p id="jumlah" class="mb-5 text-sm text-lembut" aria-live="polite"></p>
        <div class="overflow-x-auto">
          <table class="tabel" id="tabel-panen">
            <thead>
              <tr>
                <th scope="col">No</th>
                <th scope="col">Petani</th>
                <th scope="col">Tahun</th>
                <th scope="col">Jenis</th>
                <th scope="col" class="angka">Berat (kg)</th>
                <th scope="col"><span class="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
        <p id="kosong" class="rounded-2xl bg-kabut/50 px-5 py-8 text-center text-lembut" hidden>Belum ada data panen. Isi formulir di samping untuk mencatat panen pertama.</p>
      </section>
    </div>

    <script type="application/json" id="data-awal"><?= json_encode($awal, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?></script>
<?php page_bottom();
