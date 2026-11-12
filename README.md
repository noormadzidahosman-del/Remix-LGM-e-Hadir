# LGM e-Hadir

**Sistem Pengesahan Kehadiran Mesyuarat Pantas (One-Click RSVP) untuk Pengurusan Tertinggi Lembaga Getah Malaysia (LGM).**

LGM e-Hadir memudahkan Pengarah Bahagian dan Ketua Unit mengesahkan kehadiran mesyuarat dalam masa **kurang 10 saat** melalui telefon pintar tanpa perlu log masuk atau mengingati kata laluan, manakala pasukan Urus Setia dapat memantau status kuorum secara langsung (*real-time*).

---

## 📌 Masalah yang Diselesaikan

Di kebanyakan agensi kerajaan dan korporat, jemputan mesyuarat lazimnya dihantar melalui e-mel kalendar tradisional. Masalah yang sering timbul:
- Pengarah dan Ketua Unit mempunyai jadual tugasan lapangan yang padat, menyebabkan e-mel jemputan sering tenggelam.
- Butang *Accept* kalendar telefon sukar diakses atau memerlukan aplikasi khusus yang lambat dimuatkan.
- Urus setia mesyuarat terpaksa menelefon pegawai atau setiausaha pejabat (*PA*) seorang demi seorang pada saat akhir untuk mengetahui sama ada Pengarah hadir atau menghantar wakil.
- Kuorum mesyuarat sukar ditentukan lebih awal bagi persediaan bilik, jamuan, dan dokumen edaran.

**Penyelesaian LGM e-Hadir:** Pautan unik peribadi (*Magic Link*) dihantar terus melalui WhatsApp atau e-mel. Pengarah hanya perlu menekan satu butang untuk mengesahkan kehadiran atau menamakan pegawai pengganti/wakil.

---

## 👥 Untuk Siapa?

1. **Penerima Jemputan (Pengarah Bahagian & Ketua Unit LGM):**
   - Menerima jemputan peribadi di telefon pintar.
   - Boleh mengesahkan kehadiran (*Hadir* atau *Tidak Hadir & Nama Wakil*) tanpa kata laluan.
   - Menerima **Pas Kehadiran Digital Rasmi LGM** berserta fungsi simpan masa mesyuarat ke kalendar peribadi dalam satu sentuhan.

2. **Pasukan Urus Setia / Sekretariat Mesyuarat LGM:**
   - Mengurus Direktori Tetap Pengarah & Pegawai.
   - Mencipta mesyuarat dan menjana pautan pantas secara automatik.
   - Memantau tolok kuorum secara langsung (*live Quorum Gauge*).
   - Menghantar jemputan dan peringatan (*follow-up*) pantas melalui WhatsApp.
   - Mengeksport senarai kehadiran rasmi ke format **PDF Rasmi LGM** dan **CSV (Excel)**.

---

## ⚡ Apa yang Boleh Dibuat?

- **Pengesahan Satu Sentuhan (One-Click RSVP):** Butang besar mesra ibu jari untuk mengesahkan *Hadir* atau *Tidak Hadir*.
- **Kad Pas Kehadiran Digital (*Digital Meeting Pass*):** Kad pas digital rasmi LGM lengkap dengan cop pengesahan, butang *Tambah ke Google Calendar*, muat turun fail `.ics`, butang navigasi *Pandu Waze / Google Maps*, dan kod QR pendaftaran dewan.
- **Penamaan Wakil Pintar (*Smart Autocomplete*):** Cadangan automatik nama pegawai kanan daripada direktori LGM sekiranya Pengarah tidak dapat hadir.
- **Kemas Kini Jawapan Berulang:** Pegawai boleh menukar jawapan bila-bila masa sekiranya jadual tugas luar berubah selagi mesyuarat masih aktif.
- **Tolok Kuorum Langsung (*Quorum Health Gauge*):** Penunjuk peratusan kuorum mesyuarat kerajaan automatik (<50% Merah, 50–66% Kuning, $\ge$67% Hijau).
- **Pembantu Giliran WhatsApp (*WhatsApp Dispatch Assistant*):** Membolehkan urus setia mengedar jemputan kepada puluhan pegawai secara berurutan dengan satu klik setiap orang.
- **Dua Mod Eksport PDF Rasmi:** Pilihan menjana *Laporan Status Pengesahan Rasmi* atau *Borang Kehadiran & Tandatangan Fizikal Meja Urus Setia*.

---

## 📖 Contoh Cara Penggunaan

1. **Urus Setia Cipta Mesyuarat:** Urus setia log masuk menggunakan Kod Akses Bersama (`LGM2026`), mengisi tajuk mesyuarat, tarikh, masa, dan menanda senarai Pengarah yang dijemput dari Direktori Tetap.
2. **Pautan Dijana & Diedar:** Sistem menjana pautan peribadi unik untuk setiap Pengarah. Urus setia menekan *Giliran WhatsApp Pantas* untuk menghantar mesej jemputan rasmi terus ke telefon pegawai.
3. **Pengarah Buat Pengesahan:** Pengarah menekan pautan di WhatsApp. Halaman rasmi terbuka di telefon dalam masa 1 saat. Pengarah menekan butang hijau **HADIR**.
4. **Pas Digital Diberikan:** Skrin memaparkan Kad Pas Kehadiran Digital LGM. Pengarah menekan *Tambah ke Google Calendar* untuk mengunci masa acara.
5. **Urus Setia Pantau & Cetak:** Di komputer pejabat urus setia, kiraan kuorum meningkat secara langsung tanpa perlu *refresh*. Sebelum mesyuarat bermula, urus setia menekan *Eksport PDF* untuk cetakan rujukan Pengerusi.

---

## 🔗 Cara Mencuba

Aplikasi ini boleh diakses secara langsung melalui pelayan pratonton berikut:
- **Pautan Aplikasi (Live Preview):** [https://ais-pre-z3kods3qqdy3wieia56dcz-858941239743.asia-northeast1.run.app](https://ais-pre-z3kods3qqdy3wieia56dcz-858941239743.asia-northeast1.run.app)
- **Kod Akses Lalai Urus Setia:** `LGM2026`

---

## 📊 Status Projek Semasa

- **Tahap Semasa:** Versi 1.1 (MVP Fasa 1 Lengkap + Penambahbaikan UI/UX).
- **Fungsi yang Telah Dibina & Diuji:**
  - ✅ Log masuk urus setia berasaskan *Shared Passcode*.
  - ✅ Pengurusan Direktori Tetap Pengarah & Pegawai (CRUD penuh & carian).
  - ✅ Penciptaan mesyuarat, pemilihan jemputan direktori & ad-hoc, pencegahan duplikasi.
  - ✅ Halaman RSVP awam peribadi tanpa kata laluan (<2 saat).
  - ✅ Kad Pas Digital LGM, integrasi Google Calendar & fail `.ics`.
  - ✅ Cadangan penamaan wakil pintar dan butang navigasi lokasi (Waze/Maps).
  - ✅ Papan pemuka masa nyata, Tolok Kuorum, dan bilah lekap (*Sticky Action Bar*).
  - ✅ Pembantu Giliran WhatsApp & templat jemputan/peringatan *clipboard*.
  - ✅ Eksport dokumen PDF rasmi (Laporan & Lembaran Tandatangan) serta fail CSV Excel.
- **Batasan Semasa (Belum Lengkap):**
  - Penghantaran e-mel automatik peringkat pelayan menggunakan mod sandaran (*mailto:* dan simulasi rekod). Penyambungan akaun SMTP / API e-mel rasmi LGM memerlukan konfigurasi kunci pelayan.
  - Integrasi WhatsApp Business API terus tanpa membuka aplikasi WhatsApp dirancang untuk Fasa 2.

---

## 📚 Panduan Lanjut

Untuk maklumat terperinci, sila rujuk dokumentasi berkaitan:
- [Panduan Pengguna Langkah demi Langkah](docs/PANDUAN-PENGGUNA.md)
- [Spesifikasi Keperluan Produk (PRD)](docs/KEPERLUAN-PRODUK.md)
- [Status Pembangunan & Perancangan (Roadmap)](docs/STATUS-DAN-ROADMAP.md)
- [Pengurusan Data & Privasi](docs/DATA-DAN-PRIVASI.md)
- [Panduan Pemasangan & Penyelenggaraan Teknikal](docs/SETUP-DAN-PENYELENGGARAAN.md)
- [Log Perubahan (Changelog)](CHANGELOG.md)

---

## 🛠️ Ringkasan Teknologi

Aplikasi ini dibina berasaskan teknologi web moden yang ringan dan pantas:
- **React:** Digunakan untuk membina antara muka pengguna (*User Interface*) yang responsif dan interaktif.
- **Vite:** Alat pembina (*build tool*) pantas untuk persekitaran pembangunan web moden.
- **Express (Node.js):** Pelayan belakang (*backend server*) yang menyediakan REST API berpusat untuk menguruskan data mesyuarat dan pengesahan kehadiran.
- **Tailwind CSS:** Digunakan untuk mereka bentuk susun atur dan gaya visual korporat rasmi LGM (Hijau Emerald & Emas).
- **TypeScript:** Bahasa pengaturcaraan yang memastikan kod bebas ralat dan mudah diselenggara.
- **jsPDF & AutoTable:** Pustaka penjanaan dokumen fail PDF rasmi terus di dalam pelayar web pengguna.
- **Lucide React:** Koleksi ikon antaramuka moden dan mesra pengguna.

---

## 💬 Maklum Balas & Bantuan

Sekiranya anda menemui sebarang pepijat (*bug*) atau mempunyai cadangan penambahbaikan untuk sistem LGM e-Hadir, anda boleh mengemukakannya melalui ruangan **GitHub Issues** pada repositori ini setelah disambungkan.

---

*Hak Cipta Terpelihara &copy; Lembaga Getah Malaysia (LGM). Dibangunkan untuk kegunaan pengurusan mesyuarat dalaman rasmi.*
