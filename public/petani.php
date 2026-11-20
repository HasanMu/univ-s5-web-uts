<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/layout.php';

$awal = cari_petani('');
page_top('Data Petani', 'petani');
?>
    <div class="grid items-start gap-6 lg:grid-cols-[21rem_1fr]">

      <section class="card lg:sticky lg:top-28" aria-labelledby="judul-form">
        <h2 id="judul-form" class="text-xl font-semibold"><span id="judul-form-teks">Tambah petani</span></h2>
        <form id="form-petani" class="mt-5 space-y-4" novalidate>
          <div>
            <label for="nama" class="mb-1.5 block text-sm font-medium">Nama Petani</label>
            <input id="nama" name="nama" class="field" autocomplete="off" maxlength="100" required aria-describedby="nama-galat">
            <p id="nama-galat" class="galat" hidden></p>
          </div>
          <div>
            <label for="kode" class="mb-1.5 block text-sm font-medium">NIK atau ID Petani</label>
            <input id="kode" name="kode" class="field" autocomplete="off" maxlength="20" placeholder="contoh: GM-011" required aria-describedby="kode-galat">
            <p id="kode-galat" class="galat" hidden></p>
          </div>
          <div>
            <label for="alamat" class="mb-1.5 block text-sm font-medium">Alamat</label>
            <textarea id="alamat" name="alamat" rows="2" class="field" aria-describedby="alamat-galat"></textarea>
            <p id="alamat-galat" class="galat" hidden></p>
          </div>
          <div>
            <label for="luas_lahan" class="mb-1.5 block text-sm font-medium">Luas Lahan (hektare)</label>
            <input id="luas_lahan" name="luas_lahan" class="field" type="number" min="0.01" step="0.01" inputmode="decimal" required aria-describedby="luas_lahan-galat">
            <p id="luas_lahan-galat" class="galat" hidden></p>
          </div>
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <button type="submit" class="btn btn-utama" id="simpan">Simpan</button>
            <button type="button" class="btn btn-tenang" id="batal" hidden>Batal ubah</button>
          </div>
        </form>
      </section>

      <section class="card min-w-0" aria-labelledby="judul-tabel">
        <div class="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="judul-tabel" class="text-xl font-semibold">Daftar petani</h2>
            <p id="jumlah" class="text-sm text-lembut" aria-live="polite"></p>
          </div>
          <div class="w-full sm:w-72">
            <label for="cari" class="mb-1.5 block text-sm font-medium">Cari berdasarkan nama</label>
            <input id="cari" type="search" class="field" autocomplete="off" placeholder="mis. Asep, atau tekan /">
          </div>
        </div>
        <div class="mb-4 flex flex-wrap items-center gap-3">
          <label class="flex items-center gap-2 text-sm md:hidden">Urutkan
            <select id="urut-pilihan" class="field !w-auto !py-2">
              <option value="">Bawaan</option>
              <option value="nama:1">Nama A ke Z</option>
              <option value="nama:-1">Nama Z ke A</option>
              <option value="luas:-1">Lahan terluas</option>
              <option value="luas:1">Lahan tersempit</option>
            </select>
          </label>
          <button type="button" id="unduh" class="btn btn-tenang ml-auto">Unduh CSV</button>
        </div>
        <div class="overflow-x-auto">
          <table class="tabel" id="tabel-petani">
            <thead>
              <tr>
                <th scope="col">No</th>
                <th scope="col" aria-sort="none"><button type="button" class="urut" data-urut="kode">ID Petani</button></th>
                <th scope="col" aria-sort="none"><button type="button" class="urut" data-urut="nama">Nama Petani</button></th>
                <th scope="col" aria-sort="none"><button type="button" class="urut" data-urut="alamat">Alamat</button></th>
                <th scope="col" class="angka" aria-sort="none"><button type="button" class="urut" data-urut="luas">Luas Lahan (ha)</button></th>
                <th scope="col"><span class="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
        <p id="kosong" class="rounded-2xl bg-kabut/50 px-5 py-8 text-center text-lembut" hidden></p>
      </section>
    </div>

    <script type="application/json" id="data-awal"><?= json_encode($awal, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?></script>
<?php page_bottom();
