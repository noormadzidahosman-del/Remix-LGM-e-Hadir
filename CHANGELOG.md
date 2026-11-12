# Rekod Perubahan (Changelog) — LGM e-Hadir

Semua perubahan ketara pada projek ini direkodkan dalam dokumen ini. Format penulisan adalah berasaskan amalan piawai *Keep a Changelog*.

---

## [1.1.0] — 12 November 2026

### Ditambah (Added)
- **Kad Pas Kehadiran Digital Rasmi LGM:** Reka bentuk tiket/pas digital bertaraf korporat dengan cop status rasmi *"DISAHKAN HADIR"*, Kod ID Pas pengesahan unik, dan Kod QR semakan dewan mesyuarat.
- **Fungsi Tambah ke Kalendar Satu Klik:** Butang simpan pantas ke Google Calendar dan muat turun fail piawai `.ics` (serasi Apple Calendar, Outlook, Android) dengan penggera 30 minit.
- **Tolok Kuorum Pekeliling (Circular Quorum Gauge):** Penunjuk peratusan kuorum bulat masa nyata dengan piawaian zon warna tadbir urus mesyuarat kerajaan.
- **Bilah Tindakan Lekap (Sticky Floating Action Bar):** Bar tindakan lekap yang muncul semasa skrol ke bawah pada skrin butiran mesyuarat bagi memudahkan capaian eksport dan statistik.
- **Cadangan Penamaan Wakil Pintar (Smart Representative Autocomplete):** Memaparkan senarai cadangan pantas pegawai kanan LGM semasa memilih *Tidak Hadir*.
- **Pengesanan Lokasi Pintar & Butang Navigasi:** Pengesanan automatik pautan mesyuarat atas talian (Teams/Zoom) dan butang navigasi pemanduan terus (Google Maps & Waze).
- **Pembantu Giliran WhatsApp Urus Setia (WhatsApp Dispatch Assistant):** Modal giliran penghantaran mesej berurutan satu demi satu kepada semua jemputan.
- **Pilihan Cetakan Lembaran Tandatangan Fizikal PDF:** Pilihan mod eksport PDF khas untuk borang pendaftaran di pintu meja dewan mesyuarat.
- **Pemeriksaan Tipografi Berangka:** Penambahan kelas `tabular-nums` pada semua paparan peratusan, jam, dan nombor bagi mengelakkan peranjakan susun atur (*layout shift*).

---

## [1.0.0] — 11 November 2026

### Ditambah (Pelaksanaan Teras MVP Fasa 1)
- **Pengesahan Kod Akses Urus Setia (FR-001):** Skrin log masuk pentadbir menggunakan Kod Akses Bersama (`LGM2026`).
- **Pengurusan Direktori Tetap Pegawai (FR-002):** Modul CRUD bagi Pengarah Bahagian dan Ketua Unit LGM beserta validasi format e-mel dan telefon.
- **Penciptaan Mesyuarat & Penjanaan Pautan Pantas (FR-003):** Borang cipta mesyuarat, pemilihan jemputan direktori dan ad-hoc, pencegahan duplikasi, dan penjanaan token rawak unik.
- **Halaman Awam One-Click RSVP (FR-004):** Antaramuka mudah alih tanpa kata laluan untuk pengesahan *Hadir* atau *Tidak Hadir* (<2 saat) dan kebolehan menukar jawapan.
- **Penghantaran WhatsApp & E-mel Pukal (FR-005):** Salin templat rasmi berserta pautan pantas ke papan keratan dengan *toast feedback*, pautan terus *wa.me*, dan penandaan status e-mel dihantar.
- **Papan Pemuka Pemantauan Masa Nyata (FR-006):** Kad metrik status kehadiran langsung, jadual terperinci maklum balas pegawai, dan butang salin peringatan susulan.
- **Eksport Laporan PDF & CSV (FR-007):** Muat turun laporan senarai kehadiran rasmi berformat PDF LGM dan fail CSV untuk Microsoft Excel.
- **Pelayan Express & Storan Berpusat:** Pelayan `server.ts` dengan fail `data/db.json` dan integrasi *Vite middlewares* untuk perkongsian data antara peranti.
