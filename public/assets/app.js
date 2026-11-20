(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const nf = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
  const csrf = $('meta[name="csrf-token"]').content;

  function el(tag, attrs = {}, ...kids) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v);
    }
    node.append(...kids);
    return node;
  }

  // ---- Jaringan ----

  async function api(method, url, body) {
    let res;
    try {
      res = await fetch(url, {
        method,
        headers: { Accept: 'application/json', 'X-CSRF-Token': csrf, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw { message: 'Server tidak dapat dihubungi. Periksa koneksi lalu coba lagi.' };
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw { message: json.error || 'Terjadi kesalahan di server.', fields: json.fields, status: res.status };
    return json;
  }

  // ---- Pesan dan dialog ----

  let toastTimer;
  function toast(message, isError = false) {
    $('.toast')?.remove();
    clearTimeout(toastTimer);
    const node = el('div', { class: 'toast' + (isError ? ' galat-toast' : ''), role: isError ? 'alert' : 'status', text: message });
    document.body.append(node);
    toastTimer = setTimeout(() => node.remove(), isError ? 6000 : 3500);
  }

  function konfirmasi(judul, isi, labelYa) {
    return new Promise((resolve) => {
      const ya = el('button', { type: 'button', class: 'btn btn-utama !bg-ceri', text: labelYa });
      const batal = el('button', { type: 'button', class: 'btn btn-tenang', text: 'Batal' });
      const dlg = el('dialog', { class: 'modal', 'aria-labelledby': 'dlg-judul' },
        el('h2', { id: 'dlg-judul', class: 'text-xl font-semibold', text: judul }),
        el('p', { class: 'mt-2 text-lembut', text: isi }),
        el('div', { class: 'mt-6 flex justify-end gap-2' }, batal, ya));
      let hasil = false;
      ya.addEventListener('click', () => { hasil = true; dlg.close(); });
      batal.addEventListener('click', () => dlg.close());
      dlg.addEventListener('close', () => { dlg.remove(); resolve(hasil); });
      document.body.append(dlg);
      dlg.showModal();
    });
  }

  // ---- Formulir ----

  function tampilkanGalat(form, fields = {}) {
    for (const input of form.elements) {
      if (!input.name) continue;
      const msg = fields[input.name];
      const p = $(`#${input.id}-galat`, form);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (p) { p.textContent = msg || ''; p.hidden = !msg; }
    }
    const first = form.querySelector('[aria-invalid="true"]');
    first?.focus();
  }

  const angka = (v) => parseFloat(String(v).replace(',', '.'));

  function sel(label, text, cls = '') {
    return el('td', { 'data-label': label, class: cls, text });
  }

  function tombolAksi(...btns) {
    return el('td', { class: 'aksi' }, el('div', { class: 'flex justify-end gap-1' }, ...btns));
  }

  // ---- Halaman Data Petani ----

  function halamanPetani() {
    let rows = JSON.parse($('#data-awal').textContent);
    let q = '';
    let editId = null;
    let permintaan = 0;
    let urut = { kunci: null, arah: 1 };
    const terbuka = new Set();
    const cachePanen = new Map();

    const form = $('#form-petani');
    const tbody = $('#tabel-petani tbody');
    const simpan = $('#simpan');
    const batal = $('#batal');
    const cari = $('#cari');

    const nilai = { kode: (r) => r.kode, nama: (r) => r.nama, alamat: (r) => r.alamat, luas: (r) => r.luas_lahan };
    function terurut() {
      if (!urut.kunci) return rows;
      const f = nilai[urut.kunci];
      return [...rows].sort((a, b) => {
        const x = f(a), y = f(b);
        return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y), 'id', { numeric: true })) * urut.arah;
      });
    }

    function badanDetail(r, data) {
      if (!data.length) {
        return el('p', { class: 'text-lembut' }, 'Belum ada catatan panen untuk petani ini. ',
          el('a', { href: 'panen.php', class: 'font-medium text-lumut underline', text: 'Catat panen' }));
      }
      const per = new Map();
      data.forEach((p) => per.set(p.tahun, (per.get(p.tahun) || 0) + p.berat_kg));
      const tahun = [...per.keys()].sort();
      const maks = Math.max(...per.values());
      const terbaru = tahun[tahun.length - 1];
      const total = [...per.values()].reduce((a, b) => a + b, 0);
      const stat = (k, v) => el('div', {}, el('dt', { class: 'text-sm text-lembut', text: k }), el('dd', { class: 'font-medium tabular-nums', text: v }));
      return el('div', { class: 'grid items-end gap-x-12 gap-y-5 sm:grid-cols-[auto_1fr]' },
        el('div', { class: 'flex h-28 items-end gap-3', role: 'img', 'aria-label': 'Panen per tahun: ' + tahun.map((t) => `${t} ${nf.format(per.get(t))} kg`).join(', ') },
          ...tahun.map((t) => el('div', { class: 'flex h-full flex-col items-center justify-end gap-1' },
            el('span', { class: 'text-xs tabular-nums', text: nf.format(per.get(t)) }),
            el('div', { class: 'w-10 rounded-xl bg-sangrai', style: `height:${Math.max(8, (per.get(t) / maks) * 62)}%` }),
            el('span', { class: 'text-xs text-lembut', text: String(t) })))),
        el('dl', { class: 'grid gap-x-8 gap-y-3 sm:grid-cols-3' },
          stat('Total panen', `${nf.format(total)} kg`),
          stat(`Hasil per hektare (${terbaru})`, `${nf.format(Math.round(per.get(terbaru) / r.luas_lahan))} kg/ha`),
          stat('Jenis kopi', [...new Set(data.map((p) => p.jenis))].join(', '))));
    }

    async function isiDetail(r, wadah) {
      try {
        if (!cachePanen.has(r.id)) cachePanen.set(r.id, (await api('GET', 'api/panen.php?petani_id=' + r.id)).data);
        wadah.replaceChildren(badanDetail(r, cachePanen.get(r.id)));
      } catch (e) { wadah.textContent = e.message; }
    }

    function render(sorotId, fokusId) {
      const total = rows.reduce((s, r) => s + r.luas_lahan, 0);
      const maksLuas = Math.max(...rows.map((r) => r.luas_lahan), 1);
      $('#jumlah').textContent = q
        ? `${rows.length} petani cocok dengan “${q}”`
        : `${rows.length} petani, total lahan ${nf.format(total)} hektare`;

      const baris = [];
      terurut().forEach((r, i) => {
        const buka = terbuka.has(r.id);
        const toggle = el('button', { type: 'button', class: 'btn-nama', 'aria-expanded': String(buka), 'data-toggle': r.id,
          'aria-label': `${r.nama}, ${buka ? 'tutup' : 'lihat'} riwayat panen` }, r.nama);
        const tr = el('tr', r.id === sorotId ? { class: 'baru' } : {},
          sel('No', String(i + 1)),
          sel('ID Petani', r.kode, 'whitespace-nowrap'),
          el('td', { 'data-label': 'Nama Petani', class: 'whitespace-nowrap' }, toggle),
          sel('Alamat', r.alamat || '-'),
          el('td', { 'data-label': 'Luas Lahan (ha)', class: 'angka' },
            el('div', { text: nf.format(r.luas_lahan) }),
            el('div', { class: 'luas-bar', 'aria-hidden': 'true' }, el('i', { style: `width:${(r.luas_lahan / maksLuas) * 100}%` }))),
          tombolAksi(
            el('button', { type: 'button', class: 'btn btn-tenang', 'aria-label': `Ubah data ${r.nama}`, text: 'Ubah' }),
            el('button', { type: 'button', class: 'btn btn-tenang btn-bahaya', 'aria-label': `Hapus data ${r.nama}`, text: 'Hapus' }),
          ));
        const [ubah, hapus] = tr.querySelectorAll('td.aksi button');
        toggle.addEventListener('click', () => { buka ? terbuka.delete(r.id) : terbuka.add(r.id); render(null, r.id); });
        ubah.addEventListener('click', () => mulaiUbah(r));
        hapus.addEventListener('click', () => hapusPetani(r));
        baris.push(tr);
        if (buka) {
          const wadah = el('div', { text: 'Memuat riwayat panen…', class: 'text-lembut' });
          baris.push(el('tr', { class: 'detail' }, el('td', { colspan: '6' }, wadah)));
          isiDetail(r, wadah);
        }
      });
      tbody.replaceChildren(...baris);
      if (fokusId) tbody.querySelector(`[data-toggle="${fokusId}"]`)?.focus();

      document.querySelectorAll('[data-urut]').forEach((b) => {
        b.parentElement.setAttribute('aria-sort', urut.kunci === b.dataset.urut ? (urut.arah === 1 ? 'ascending' : 'descending') : 'none');
      });
      $('#urut-pilihan').value = urut.kunci ? `${urut.kunci}:${urut.arah}` : '';

      const kosong = $('#kosong');
      kosong.hidden = rows.length > 0;
      $('#tabel-petani').hidden = rows.length === 0;
      kosong.textContent = q
        ? `Tidak ada petani bernama “${q}”. Coba ejaan lain atau kosongkan kolom pencarian.`
        : 'Belum ada petani. Isi formulir untuk menambahkan petani pertama.';
    }

    function resetForm() {
      editId = null;
      form.reset();
      tampilkanGalat(form);
      $('#judul-form-teks').textContent = 'Tambah petani';
      simpan.textContent = 'Simpan';
      batal.hidden = true;
    }

    function mulaiUbah(r) {
      editId = r.id;
      tampilkanGalat(form);
      form.nama.value = r.nama;
      form.kode.value = r.kode;
      form.alamat.value = r.alamat;
      form.luas_lahan.value = r.luas_lahan;
      $('#judul-form-teks').textContent = 'Ubah data petani';
      simpan.textContent = 'Simpan perubahan';
      batal.hidden = false;
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.nama.focus({ preventScroll: true });
    }

    async function muat(kata) {
      const no = ++permintaan;
      try {
        const { data } = await api('GET', 'api/petani.php?q=' + encodeURIComponent(kata));
        if (no !== permintaan) return;
        rows = data;
        render();
      } catch (e) { toast(e.message, true); }
    }

    function validasi() {
      const f = {};
      if (!form.nama.value.trim()) f.nama = 'Nama petani wajib diisi.';
      if (!form.kode.value.trim()) f.kode = 'NIK atau ID petani wajib diisi.';
      const luas = angka(form.luas_lahan.value);
      if (!(luas > 0)) f.luas_lahan = 'Luas lahan harus berupa angka lebih dari 0 (hektare).';
      return f;
    }

    async function hapusPetani(r) {
      const ya = await konfirmasi('Hapus data petani?', `${r.nama} (${r.kode}) beserta seluruh catatan panennya akan dihapus dan tidak bisa dikembalikan.`, 'Hapus petani');
      if (!ya) return;
      try {
        await api('DELETE', 'api/petani.php?id=' + r.id);
        rows = rows.filter((x) => x.id !== r.id);
        terbuka.delete(r.id); cachePanen.delete(r.id);
        if (editId === r.id) resetForm();
        render();
        toast('Data petani dihapus.');
      } catch (e) { toast(e.message, true); }
    }

    function unduhCsv() {
      const aman = (v) => {
        let t = String(v ?? '');
        if (/^[=+\-@\t\r]/.test(t)) t = "'" + t;
        return `"${t.replaceAll('"', '""')}"`;
      };
      const isi = [['ID Petani', 'Nama Petani', 'Alamat', 'Luas Lahan (ha)'], ...terurut().map((r) => [r.kode, r.nama, r.alamat, r.luas_lahan])];
      const blob = new Blob(['﻿' + isi.map((b) => b.map(aman).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
      const a = el('a', { href: URL.createObjectURL(blob), download: 'petani-giri-mekar.csv' });
      document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
      toast(`${rows.length} petani diunduh ke petani-giri-mekar.csv.`);
    }

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const galat = validasi();
      tampilkanGalat(form, galat);
      if (Object.keys(galat).length) return;

      const payload = {
        id: editId, nama: form.nama.value.trim(), kode: form.kode.value.trim(),
        alamat: form.alamat.value.trim(), luas_lahan: angka(form.luas_lahan.value),
      };
      simpan.disabled = true;
      try {
        if (editId) {
          const { data } = await api('PUT', 'api/petani.php', payload);
          rows = rows.map((x) => (x.id === data.id ? data : x));
          render(data.id);
          toast('Data petani berhasil diperbarui.');
        } else {
          const { data } = await api('POST', 'api/petani.php', payload);
          if (q) { q = ''; cari.value = ''; await muat(''); } else { rows.push(data); }
          render(data.id);
          toast('Data petani berhasil ditambahkan.');
        }
        resetForm();
      } catch (e) {
        if (e.fields) tampilkanGalat(form, e.fields); else toast(e.message, true);
      } finally { simpan.disabled = false; }
    });

    batal.addEventListener('click', resetForm);

    let tunda;
    cari.addEventListener('input', () => {
      clearTimeout(tunda);
      tunda = setTimeout(() => { q = cari.value.trim(); muat(q); }, 250);
    });
    cari.addEventListener('keydown', (e) => { if (e.key === 'Escape') { cari.value = ''; cari.dispatchEvent(new Event('input')); cari.blur(); } });
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) { e.preventDefault(); cari.focus(); }
    });

    document.querySelectorAll('[data-urut]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.urut;
      urut = urut.kunci !== k ? { kunci: k, arah: 1 } : urut.arah === 1 ? { kunci: k, arah: -1 } : { kunci: null, arah: 1 };
      render();
    }));
    $('#urut-pilihan').addEventListener('change', (e) => {
      const [k, a] = e.target.value.split(':');
      urut = k ? { kunci: k, arah: Number(a) } : { kunci: null, arah: 1 };
      render();
    });
    $('#unduh').addEventListener('click', unduhCsv);

    const awal = new URLSearchParams(location.search).get('cari');
    if (awal) { cari.value = awal; q = awal.trim(); muat(q); } else render();
  }

  // ---- Halaman Data Panen ----

  function halamanPanen() {
    let rows = JSON.parse($('#data-awal').textContent);
    const form = $('#form-panen');
    const tbody = $('#tabel-panen tbody');

    function render(sorotId) {
      const total = rows.reduce((s, r) => s + r.berat_kg, 0);
      $('#jumlah').textContent = `${rows.length} catatan, total ${nf.format(total)} kg`;
      tbody.replaceChildren(...rows.map((r, i) => {
        const hapus = el('button', { type: 'button', class: 'btn btn-tenang btn-bahaya', 'aria-label': `Hapus panen ${r.petani} tahun ${r.tahun}`, text: 'Hapus' });
        hapus.addEventListener('click', () => hapusPanen(r));
        return el('tr', r.id === sorotId ? { class: 'baru' } : {},
          sel('No', String(i + 1)),
          sel('Petani', r.petani),
          sel('Tahun', String(r.tahun)),
          sel('Jenis', r.jenis),
          sel('Berat (kg)', nf.format(r.berat_kg), 'angka'),
          tombolAksi(hapus));
      }));
      $('#kosong').hidden = rows.length > 0;
      $('#tabel-panen').hidden = rows.length === 0;
    }

    async function hapusPanen(r) {
      const ya = await konfirmasi('Hapus catatan panen?', `Panen ${r.jenis} ${r.petani} tahun ${r.tahun} (${nf.format(r.berat_kg)} kg) akan dihapus.`, 'Hapus catatan');
      if (!ya) return;
      try {
        await api('DELETE', 'api/panen.php?id=' + r.id);
        rows = rows.filter((x) => x.id !== r.id);
        render();
        toast('Catatan panen dihapus.');
      } catch (e) { toast(e.message, true); }
    }

    form?.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const f = {};
      if (!form.petani_id.value) f.petani_id = 'Pilih petani.';
      const tahun = parseInt(form.tahun.value, 10);
      if (!(tahun >= 2000 && tahun <= 2100)) f.tahun = 'Tahun panen harus antara 2000 dan 2100.';
      if (!form.jenis.value) f.jenis = 'Pilih jenis kopi.';
      if (!(angka(form.berat_kg.value) > 0)) f.berat_kg = 'Berat panen harus berupa angka lebih dari 0 (kg).';
      tampilkanGalat(form, f);
      if (Object.keys(f).length) return;

      $('#simpan').disabled = true;
      try {
        const { data } = await api('POST', 'api/panen.php', {
          petani_id: parseInt(form.petani_id.value, 10), tahun, jenis: form.jenis.value, berat_kg: angka(form.berat_kg.value),
        });
        rows.unshift(data);
        render(data.id);
        toast('Data panen berhasil ditambahkan.');
        form.berat_kg.value = '';
        form.jenis.value = '';
        form.petani_id.value = '';
      } catch (e) {
        if (e.fields) tampilkanGalat(form, e.fields); else toast(e.message, true);
      } finally { $('#simpan').disabled = false; }
    });

    render();
  }

  // ---- Beranda: grafik ----

  // Treemap squarified: luas kotak sebanding dengan nilai.
  function treemap(items, W, H) {
    const total = items.reduce((s, i) => s + i.v, 0);
    const k = (W * H) / total;
    const nodes = items.map((i) => ({ ...i, a: i.v * k }));
    const out = [];
    let x = 0, y = 0, w = W, h = H, row = [];
    const jumlah = (r) => r.reduce((t, n) => t + n.a, 0);
    const terburuk = (r, sisi) => {
      const s = jumlah(r);
      return Math.max((sisi * sisi * Math.max(...r.map((n) => n.a))) / (s * s), (s * s) / (sisi * sisi * Math.min(...r.map((n) => n.a))));
    };
    const taruh = (r) => {
      const s = jumlah(r);
      if (w >= h) {
        const cw = s / h; let cy = y;
        for (const n of r) { const nh = n.a / cw; out.push({ ...n, x, y: cy, w: cw, h: nh }); cy += nh; }
        x += cw; w -= cw;
      } else {
        const rh = s / w; let cx = x;
        for (const n of r) { const nw = n.a / rh; out.push({ ...n, x: cx, y, w: nw, h: rh }); cx += nw; }
        y += rh; h -= rh;
      }
    };
    for (let i = 0; i < nodes.length;) {
      const sisi = Math.min(w, h);
      if (!row.length || terburuk([...row, nodes[i]], sisi) <= terburuk(row, sisi)) row.push(nodes[i++]);
      else { taruh(row); row = []; }
    }
    if (row.length) taruh(row);
    return out;
  }

  // ---- Peta kebun: pohon kopi digambar di kanvas tiap petak ----

  function acak(a) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Posisi pohon: baris selang-seling dengan sedikit goyang; `share` = bagian pohon yang berbuah.
  function tanam(w, h, seed, share, mulai) {
    const r = acak(seed * 9301 + 7), jarak = 21, out = [];
    let baris = 0;
    for (let y = jarak * 0.8; y < h - 4; y += jarak * 0.86, baris++) {
      for (let x = jarak * 0.8 + (baris % 2 ? jarak / 2 : 0); x < w - 4; x += jarak) {
        out.push({ x: x + (r() - 0.5) * 4, y: y + (r() - 0.5) * 4, r: 6.4 + r() * 1.8, buah: r() < share, gelap: r() < 0.5, tunda: mulai + baris * 28 + r() * 160 });
      }
    }
    return out;
  }

  function lukis(k, t) {
    const ctx = k.cv.getContext('2d');
    ctx.setTransform(k.dpr, 0, 0, k.dpr, 0, 0);
    ctx.clearRect(0, 0, k.w, k.h);
    for (const s of k.pohon) {
      const p = Math.min(1, Math.max(0, (t - s.tunda) / 420));
      if (p <= 0) continue;
      const rr = s.r * (1 - Math.pow(1 - p, 3));
      ctx.fillStyle = s.gelap ? '#1e3b2a' : '#2d5239';
      ctx.beginPath(); ctx.arc(s.x, s.y, rr, 0, 6.2832); ctx.fill();
      ctx.fillStyle = '#4d7d58';
      ctx.beginPath(); ctx.arc(s.x - rr * 0.28, s.y - rr * 0.3, rr * 0.45, 0, 6.2832); ctx.fill();
      if (s.buah) {
        ctx.fillStyle = '#ff4d67';
        for (const [dx, dy] of [[-0.4, 0.25], [0.4, 0.2]]) {
          ctx.beginPath(); ctx.arc(s.x + dx * rr, s.y + dy * rr, Math.max(1.4, rr * 0.34), 0, 6.2832); ctx.fill();
        }
      }
    }
  }

  function gambarPeta(peta, lahan, animasi) {
    cancelAnimationFrame(peta._raf);
    const W = peta.clientWidth, H = peta.clientHeight, celah = 6, dpr = window.devicePixelRatio || 1;
    const produktif = lahan.filter((l) => l.kg > 0).map((l) => l.kg / l.ha);
    const minP = Math.min(...produktif, 0), maksP = Math.max(...produktif, 1);
    const kanvas = [];

    peta.replaceChildren(...treemap(lahan.map((l) => ({ ...l, v: l.ha })), W, H).map((n, i) => {
      const w = n.w - celah, h = n.h - celah, kgHa = n.kg / n.ha;
      const cv = el('canvas', { 'aria-hidden': 'true' });
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      kanvas.push({ cv, w, h, dpr, pohon: tanam(w, h, n.id, n.kg > 0 ? 0.1 + 0.75 * ((kgHa - minP) / Math.max(maksP - minP, 1)) : 0.03, i * 90) });

      const muatTeks = w > 120 && h > 80, muatAngka = w > 84 && h > 44, muatKg = w > 175;
      const ket = `${n.nama}, ${nf.format(n.ha)} hektare` + (n.kg > 0 ? `, ${nf.format(Math.round(kgHa))} kilogram per hektare` : '');
      return el('a', {
        class: 'petak', href: 'petani.php?cari=' + encodeURIComponent(n.nama), title: ket, 'aria-label': `${ket}. Buka di Data Petani`,
        style: `left:${n.x + celah / 2}px;top:${n.y + celah / 2}px;width:${w}px;height:${h}px;animation-delay:${i * 90}ms`,
      }, cv,
      el('div', { class: muatAngka ? 'label' : 'sr-only' },
        el('b', { class: muatTeks ? '' : 'sr-only', text: n.nama }),
        el('span', { text: `${nf.format(n.ha)} ha` + (muatKg && n.kg > 0 ? `, ${nf.format(Math.round(kgHa))} kg/ha` : '') })));
    }));

    const gerak = animasi && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!gerak) { kanvas.forEach((k) => lukis(k, Infinity)); return; }
    const total = Math.max(...kanvas.flatMap((k) => k.pohon.map((p) => p.tunda))) + 450;
    const t0 = performance.now();
    const bingkai = (now) => {
      const t = now - t0;
      kanvas.forEach((k) => lukis(k, t));
      if (t < total) peta._raf = requestAnimationFrame(bingkai);
    };
    peta._raf = requestAnimationFrame(bingkai);
  }

  function halamanBeranda() {
    const peta = $('#peta');
    api('GET', 'api/ringkasan.php').then((d) => {
      const totalHa = d.lahan.reduce((s, l) => s + l.ha, 0);
      $('#ringkas-lahan').textContent = `${d.lahan.length} petani, total ${nf.format(totalHa)} hektare`;
      if (d.tahun_acuan) $('#legenda-tahun').textContent = ` (panen ${d.tahun_acuan})`;

      if (d.lahan.length) {
        gambarPeta(peta, d.lahan, true);
        let lebar = peta.clientWidth;
        new ResizeObserver(() => {
          if (peta.clientWidth !== lebar) { lebar = peta.clientWidth; gambarPeta(peta, d.lahan, false); }
        }).observe(peta);
      } else {
        peta.replaceChildren(el('p', { class: 'py-16 text-center text-lembut', text: 'Belum ada data lahan. Tambahkan petani di halaman Data Petani.' }));
      }

      // Panen per tahun
      const gt = $('#grafik-tahun');
      if (d.tahun.length) {
        const tertinggi = Math.max(...d.tahun.map((t) => t.kg));
        gt.append(el('div', { class: 'flex h-56 items-end gap-3 sm:gap-5' }, ...d.tahun.map((t) =>
          el('div', { class: 'flex h-full min-w-0 flex-1 flex-col items-center justify-end' },
            el('span', { class: 'mb-2 text-sm font-medium tabular-nums', text: nf.format(t.kg) }),
            el('div', { class: 'w-full max-w-20 rounded-2xl bg-sangrai', style: `height:${Math.max(4, (t.kg / tertinggi) * 82)}%`, title: `${t.tahun}: ${nf.format(t.kg)} kg` }),
            el('span', { class: 'mt-2 text-sm text-lembut', text: String(t.tahun) })))));
      } else {
        gt.append(el('p', { class: 'py-10 text-center text-lembut', text: 'Belum ada data panen. Catat panen di halaman Data Panen.' }));
      }

      // Pembagian jenis kopi
      const jn = $('#jenis');
      const totalJenis = d.jenis.reduce((s, j) => s + j.kg, 0);
      if (totalJenis > 0) {
        const warna = { Arabika: 'bg-lumut', Robusta: 'bg-mocha' };
        jn.append(
          el('div', { class: 'flex h-3 overflow-hidden rounded-full bg-kabut', role: 'img', 'aria-label': d.jenis.map((j) => `${j.jenis} ${Math.round((j.kg / totalJenis) * 100)} persen`).join(', ') },
            ...d.jenis.map((j) => el('div', { class: warna[j.jenis] || 'bg-pucuk', style: `width:${(j.kg / totalJenis) * 100}%` }))),
          el('ul', { class: 'mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm' }, ...d.jenis.map((j) =>
            el('li', { class: 'flex items-center gap-2' },
              el('span', { class: `size-3 rounded-full ${warna[j.jenis] || 'bg-pucuk'}`, 'aria-hidden': 'true' }),
              el('span', { text: `${j.jenis}: ${nf.format(j.kg)} kg (${Math.round((j.kg / totalJenis) * 100)}%)` })))));
      }

      // Petani dengan panen terbanyak
      const top = $('#top');
      if (d.top.length) {
        const tertinggi = d.top[0].kg;
        top.append(...d.top.map((t) => el('li', {},
          el('div', { class: 'flex items-baseline justify-between gap-3' },
            el('span', { class: 'font-medium', text: t.nama }),
            el('span', { class: 'text-sm tabular-nums text-lembut', text: `${nf.format(t.kg)} kg` })),
          el('div', { class: 'mt-1.5 h-2.5 rounded-full bg-kabut' },
            el('div', { class: 'h-full rounded-full bg-sangrai', style: `width:${(t.kg / tertinggi) * 100}%` })))));
      } else {
        top.append(el('li', { class: 'text-lembut', text: 'Belum ada data panen.' }));
      }
    }).catch((e) => {
      const g = $('#peta-galat');
      g.textContent = e.message;
      g.hidden = false;
    });
  }

  // ---- Dock bawah: melebar saat ada aktivitas, menciut ke menu aktif saat diam ----

  function dockBawah() {
    const dock = $('[data-dock]');
    if (!dock) return;
    let timer;
    const ciut = () => { if (!dock.matches(':focus-within')) dock.classList.add('ringkas'); };
    const lebar = () => { dock.classList.remove('ringkas'); clearTimeout(timer); timer = setTimeout(ciut, 2800); };

    ['scroll', 'pointerdown', 'touchstart', 'keydown'].forEach((n) => addEventListener(n, lebar, { passive: true, capture: true }));
    dock.addEventListener('focusin', lebar);
    // Menu aktif yang dibuka dari kondisi ringkas hanya melebarkan dock, tidak memuat ulang halaman.
    $('[aria-current="page"]', dock)?.addEventListener('click', (e) => e.preventDefault());

    // Papan ketik layar sentuh menutupi dasar layar, jadi dock menyingkir saat mengetik.
    document.addEventListener('focusin', (e) => { if (e.target.matches('input, textarea, select')) dock.classList.add('sembunyi'); });
    document.addEventListener('focusout', (e) => { if (e.target.matches('input, textarea, select')) dock.classList.remove('sembunyi'); });
    lebar();
  }

  dockBawah();

  const halaman = { beranda: halamanBeranda, petani: halamanPetani, panen: halamanPanen };
  halaman[document.body.dataset.page]?.();
})();
