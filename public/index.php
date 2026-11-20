<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/layout.php';

page_top('Beranda', 'beranda');
?>
    <section class="mb-8 max-w-3xl">
      <h2 class="text-4xl font-semibold leading-[1] tracking-tight text-daun sm:text-6xl md:text-7xl">Kebun kopi Giri Mekar, dilihat dari atas</h2>
      <p class="mt-5 max-w-xl text-lg text-lembut">Setiap petak adalah lahan satu petani dan luasnya mengikuti luas lahan. Pohon yang berbuah lebat menandai hasil per hektare yang tinggi. Klik petak untuk membuka datanya.</p>
      <a href="petani.php" class="btn btn-utama mt-6">Tambah petani</a>
    </section>

    <section class="card" aria-labelledby="judul-peta">
      <div class="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="judul-peta" class="text-xl font-semibold">Peta kebun anggota</h2>
        <p id="ringkas-lahan" class="text-sm text-lembut" aria-live="polite"></p>
      </div>
      <div id="peta" class="peta"></div>
      <p id="peta-galat" class="galat" hidden></p>
      <ul class="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-lembut">
        <li class="flex items-center gap-2"><span class="size-3 rounded-full bg-daun" aria-hidden="true"></span>Pohon kopi</li>
        <li class="flex items-center gap-2"><span class="size-3 rounded-full bg-[#ff4d67]" aria-hidden="true"></span>Berbuah lebat: makin banyak, makin tinggi hasil per hektare<span id="legenda-tahun"></span></li>
      </ul>
    </section>

    <div class="mt-6 grid gap-6 md:grid-cols-5">
      <section class="card md:col-span-3" aria-labelledby="judul-tahun">
        <h2 id="judul-tahun" class="text-xl font-semibold">Hasil panen per tahun</h2>
        <p class="text-sm text-lembut">Total berat panen seluruh anggota, dalam kilogram.</p>
        <div id="grafik-tahun" class="mt-6"></div>
        <div id="jenis" class="mt-6"></div>
      </section>

      <section class="card md:col-span-2" aria-labelledby="judul-top">
        <h2 id="judul-top" class="text-xl font-semibold">Panen terbanyak</h2>
        <p class="text-sm text-lembut">Lima petani dengan total panen tertinggi.</p>
        <ol id="top" class="mt-6 space-y-4"></ol>
      </section>
    </div>
<?php page_bottom();
