# Pengurusan Data & Privasi — LGM e-Hadir

Dokumen ini menerangkan jenis maklumat yang diproses oleh sistem **LGM e-Hadir**, di mana data tersebut disimpan, kawalan akses yang dikuatkuasakan, serta dasar pengendalian perkhidmatan pihak ketiga.

---

## 1. Data yang Diproses oleh Aplikasi

Sistem ini memproses data asas yang diperlukan khusus untuk tujuan pengurusan mesyuarat dan pengesahan kehadiran:

| Kategori Data | Medan Maklumat yang Disimpan | Tujuan Penggunaan |
| :--- | :--- | :--- |
| **Direktori Pegawai** | Nama Penuh & Gelaran, Jawatan, Bahagian/Unit, Alamat E-mel Rasmi, Nombor Telefon WhatsApp. | Memudahkan urus setia memilih ahli mesyuarat tanpa menaip berulang kali. |
| **Butiran Mesyuarat** | Tajuk Mesyuarat, Tarikh, Masa Mula/Tamat, Lokasi Fizikal / Pautan Online, Catatan Agenda, Status Mesyuarat. | Memaparkan butiran rasmi kepada penerima jemputan dan laporan kuorum. |
| **Maklum Balas Kehadiran** | Token Unik (`rsvp_token`), Status Kehadiran (*attending/not_attending/pending*), Nama Pegawai Wakil (jika ada), Sebab Ketidakhadiran (jika ada), Cap Masa Respon (*responded_at*). | Menentukan bilangan kuorum dan persediaan meja mesyuarat urus setia. |

Aplikasi ini **TIDAK mengumpulkan** maklumat sensitif seperti kata laluan akaun peribadi, nombor kad pengenalan (MyKad), maklumat kewangan, atau data lokasi GPS peranti.

---

## 2. Di Mana Data Disimpan?

1. **Pelayan Belakang Berpusat (Backend Server):**
   - Disimpan secara tempatan pada fail pangkalan data JSON di pelayan (`data/db.json`).
   - Berfungsi sebagai sumber kebenaran (*single source of truth*) yang dikongsi bersama antara komputer urus setia dan telefon bimbit pegawai.
2. **Storan Tempatan Pelayar (*Browser LocalStorage*):**
   - Digunakan untuk menyimpan sesi log masuk urus setia (*session token*) supaya urus setia tidak perlu memasukkan kod akses setiap kali menukar halaman.
   - Bertindak sebagai sandaran seketika (*temporary fallback cache*) sekiranya berlaku gangguan sementara pada talian pelayan.

---

## 3. Kawalan Capaian & Keselamatan

- **Akses Pentadbiran Urus Setia:** Dilindungi oleh *Shared Passcode*. Hanya mereka yang mempunyai kod akses ini boleh melihat senarai penuh mesyuarat, maklumat semua jemputan, mengedit direktori, atau mengeksport dokumen.
- **Akses Penerima Jemputan (One-Click Magic Link):**
  - Penerima mengakses maklumat melalui token rawak unik (contoh: `lgm_kp_789f2a4bc10e4a77`) yang mempunyai *entropy* tinggi dan sukar diteka secara berurutan.
  - Token ini hanya membenarkan pegawai melihat butiran mesyuarat yang melibatkan dirinya dan hanya boleh mengemas kini status kehadirannya sendiri. Pegawai luar tidak mempunyai akses kepada senarai jemputan lain atau butiran mesyuarat yang tidak berkaitan.

---

## 4. Penggunaan Model AI & Perkhidmatan Pihak Ketiga

- **Tiada Panggilan Model AI (Zero LLM Dependency):** Sesuai dengan spesifikasi PRD Seksyen 12, sistem ini beroperasi secara logik program tulen tanpa menghantar sebarang data mesyuarat atau nama pegawai kepada mana-mana API model AI pihak ketiga. Ini memastikan keselamatan data dalaman agensi dan menjamin kelajuan respon tanpa sebarang kos token berterusan.
- **WhatsApp Web & Deep Link:** Sistem hanya menjana pautan selamat berasaskan protokol piawai `https://wa.me/...`. Tiada data nombor telefon atau teks mesej dihantar ke pelayan pihak ketiga; mesej diproses terus di dalam peranti pengguna sendiri.
- **Penjanaan Dokumen PDF:** Fail PDF dijana sepenuhnya di dalam pelayar pengguna (*client-side execution*) menggunakan pustaka `jspdf`. Tiada dokumen atau data kehadiran yang dimuat naik ke pelayan luar semasa proses penjanaan.

---

## 5. Cara Memadam & Menetapkan Semula Data

1. **Memadam Mesyuarat:** Urus setia boleh memadam mana-mana rekod mesyuarat melalui ikon tong sampah di papan pemuka. Apabila dipadam, rekod mesyuarat dan semua token jemputan berkaitan akan dipadamkan daripada pangkalan data secara kekal.
2. **Memadam Ahli Direktori:** Rekod pegawai boleh dipadamkan melalui halaman Direktori Pegawai dengan pengesahan dialog pemadaman.
3. **Menetapkan Semula Data Ujian (*Reset Database*):** Bagi tujuan demonstrasi dan ujian jaminan kualiti (*QA*), butang *Reset Data Ujian* disediakan pada pengepala urus setia untuk memulihkan pangkalan data kembali kepada data sampel asal LGM.

---

## 6. Pengisytiharan & Had Batasan

Sistem ini dibina berasaskan keperluan perisian dalaman Lembaga Getah Malaysia. Sebelum digunakan secara meluas di peringkat pengeluaran awam, pentadbir sistem agensi disyorkan menyemak dasar pematuhan pengurusan rekod elektronik dan keselamatan siber sektor awam yang berkuat kuasa.
