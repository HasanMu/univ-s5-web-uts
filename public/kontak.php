<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/layout.php';

page_top('Kontak', 'kontak');
?>
    <section class="mb-8 max-w-xl">
      <h2 class="text-4xl font-semibold leading-[1.05] text-daun sm:text-5xl">Hubungi pengurus kelompok</h2>
      <p class="mt-4 text-lembut">Untuk pendaftaran anggota baru, koreksi data, atau pembelian hasil panen, datangi sekretariat atau kirim surel.</p>
    </section>

    <div class="grid gap-6 md:grid-cols-3">
      <section class="card">
        <h3 class="text-lg font-semibold">Sekretariat</h3>
        <p class="mt-2 text-lembut">Balai Kelompok Petani Giri Mekar Senang<br>Desa Giri Mekar</p>
      </section>
      <section class="card">
        <h3 class="text-lg font-semibold">Surel</h3>
        <p class="mt-2"><a class="font-medium text-lumut underline" href="mailto:pengurus@girimekar.example">pengurus@girimekar.example</a></p>
      </section>
      <section class="card">
        <h3 class="text-lg font-semibold">Jam layanan</h3>
        <p class="mt-2 text-lembut">Senin sampai Sabtu<br>08.00 sampai 15.00 WIB</p>
      </section>
    </div>
<?php page_bottom();
