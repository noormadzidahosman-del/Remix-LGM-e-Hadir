# Spesifikasi Keperluan Produk (PRD) — LGM e-Hadir

**Versi Dokumen:** v1.0  
**Tarikh Rujukan:** 12 November 2026  
**Status:** Disahkan & Sedia Digunakan  
**Fail Rujukan Asal:** `public/assets/aistudio/LGM-e-Hadir-PRD-v1.0_638048d4.pdf`

---

## 1. Tujuan Produk & Latar Belakang
LGM e-Hadir ialah aplikasi web pengurusan RSVP mesyuarat rasmi dalaman untuk Lembaga Getah Malaysia (LGM). Sistem ini direka khusus bagi menghapuskan masalah kelewatan pengesahan kehadiran dalam kalangan pengurusan tertinggi (Pengarah Bahagian & Ketua Unit).

### Masalah Utama yang Dihadapi:
1. Jemputan kalendar e-mel biasa sering tidak dijawab kerana kekangan masa, jadual luar yang padat, atau masalah aplikasi kalendar mudah alih.
2. Pasukan urus setia mesyuarat sukar menentukan kuorum lebih awal, tidak mengetahui kehadiran wakil pengganti, dan terpaksa menghubungi setiausaha pejabat (*PA*) secara manual satu persatu.
3. Ketiadaan rekod kehadiran berpusat yang boleh dicetak dengan pantas sebelum mesyuarat bermula.

---

## 2. Profil Pengguna & Peranan (*Roles*)

| Peranan | Profil Pengguna | Tanggungjawab Utama |
| :--- | :--- | :--- |
| **Urus Setia (Sekretariat / Admin)** | Sekumpulan kecil pegawai/staf urus setia mesyuarat LGM. | Mengurus Direktori Tetap, mencipta mesyuarat, mengedar jemputan (WhatsApp/E-mel), memantau status *real-time*, menghantar peringatan, dan mengeksport laporan PDF/CSV. |
| **Penerima Jemputan (Invitees)** | Pengarah Bahagian & Ketua Unit LGM (serta jemputan luar/ad-hoc). | Membuka Pautan Pantas peribadi di telefon pintar tanpa kata laluan, mengesahkan *Hadir* atau *Tidak Hadir* (beserta nama wakil/sebab), dan menyimpan acara ke kalendar. |

---

## 3. Skop MVP (Fasa 1 — Wajib)

1. **Akses Sekretariat:** Log masuk papan pemuka pentadbir menggunakan Kod Akses Bersama (*Shared Passcode*).
2. **Direktori Tetap:** Pengurusan profil tetap Pengarah & Ketua Unit (Tambah, Edit, Padam, Carian, Tapis).
3. **Penciptaan Mesyuarat:** Mencipta rekod mesyuarat rasmi beserta pemilihan jemputan (Direktori + Ad-hoc).
4. **Pautan Pantas Unik (*Magic Link*):** Penjanaan token unik rawak yang selamat bagi setiap jemputan.
5. **Halaman RSVP Awam:** Paparan mudah alih (*mobile-first*) untuk pengesahan satu klik tanpa log masuk.
6. **Penghantaran Jemputan:** Penghantaran pantas melalui templat WhatsApp (*clipboard* & *wa.me*) dan E-mel Pukal.
7. **Pemantauan & Laporan:** Papan pemuka statistik kuorum masa nyata, butang salin peringatan, dan eksport rasmi ke fail PDF dan CSV.

---

## 4. Keperluan Fungsian (*Functional Requirements*)

### FR-001: Pengesahan Akses Sekretariat (Shared Passcode Login)
- **Tujuan:** Melindungi data mesyuarat daripada capaian awam sambil membolehkan urus setia berkongsi akses dengan mudah.
- **Tingkah Laku:** Sistem menyemak kod dengan konfigurasi `VITE_SECRETARIAT_PASSCODE` (lalai: `LGM2026`). Sesi disimpan dalam storan pelayar. Jika kod salah, ralat dipaparkan: *"Kod akses tidak sah. Sila cuba lagi."*.

### FR-002: Pengurusan Direktori Tetap Pengarah & Ketua Unit
- **Tujuan:** Menyimpan data pengurusan tertinggi supaya tidak perlu ditaip berulang kali.
- **Validasi Medan:**
  - Nama Penuh & Gelaran (Wajib)
  - Jawatan / Unit (Wajib)
  - Alamat E-mel (Wajib, format sah)
  - No. Telefon WhatsApp (Wajib, format nombor Malaysia e.g. `6012XXXXXXX`)
- **Tingkah Laku:** Operasi CRUD penuh. Pemadaman rekod dilindungi dengan dialog pengesahan (*Confirmation Modal*).

### FR-003: Penciptaan Mesyuarat & Pemilihan Jemputan
- **Tujuan:** Menjana rekod mesyuarat dan pautan RSVP unik.
- **Medan Wajib:** Tajuk Mesyuarat, Tarikh, Masa Mula, Masa Tamat, Lokasi/Pautan Dalam Talian, dan sekurang-kurangnya 1 orang jemputan.
- **Tingkah Laku:** Sistem menjana token rawak unik minimum 16 aksara alfanumerik (`rsvp_token`) bagi setiap penerima dengan status lalai `pending` (*Belum Respon*).

### FR-004: Paparan Awam Pautan Pantas Penerima (One-Click RSVP)
- **Tujuan:** Membolehkan Pengarah mengesahkan kehadiran dalam masa $< 10$ saat tanpa log masuk.
- **Pilihan Tindakan:**
  - *HADIR* &rarr; Disimpan serta-merta, kad pas digital rasmi dijana.
  - *TIDAK HADIR* &rarr; Memaparkan medan pilihan untuk *Nama Pegawai Wakil* dan *Sebab Ketidakhadiran*.
- **Tukar Jawapan:** Penerima dibenarkan menukar jawapan selagi mesyuarat berstatus `active`.

### FR-005: Penghantaran Jemputan (WhatsApp & E-mel Pukal)
- **WhatsApp:** Menyalin mesej rasmi lengkap (nama pegawai, tajuk, tarikh, masa, lokasi, pautan RSVP peribadi) ke papan keratan dengan notifikasi *toast*, berserta butang melancarkan WhatsApp Web/Aplikasi.
- **E-mel Pukal:** Menghantar jemputan kepada semua penerima yang belum dihantar e-mel dan menandakan cap masa `email_sent_at`.

### FR-006: Dashboard Pemantauan Masa Nyata & Follow-up Pantas
- **Paparan Statistik:** Kad metrik *Jumlah Jemputan*, *Hadir*, *Tidak Hadir*, *Belum Respon*, dan *Tolok Kuorum (% Kuorum)*.
- **Masa Nyata:** Sebarang maklum balas daripada telefon Pengarah dikemas kini secara langsung di papan pemuka komputer urus setia tanpa perlu *refresh* halaman.
- **Salin Peringatan:** Butang khusus bagi penerima yang masih belum respon untuk menyalin mesej peringatan sopan.

### FR-007: Eksport Senarai Kehadiran (PDF & CSV)
- **Eksport PDF:** Menjana dokumen senarai kehadiran berformat rasmi LGM (warna Emerald `#064E3B` & Emas `#D97706`, perincian mesyuarat, ringkasan kuorum, jadual kehadiran lengkap dengan nama wakil dan sebab).
- **Eksport CSV:** Memuat turun fail `.csv` berpengekodan UTF-8 BOM untuk kegunaan Microsoft Excel.

---

## 5. Peraturan Perniagaan (*Business Rules*)

1. **Kemas Kini Jawapan Berulang:** Jika jawapan ditukar daripada *Tidak Hadir* kepada *Hadir*, ruangan `representative_name` dan `absence_reason` akan dikosongkan secara automatik supaya laporan kehadiran tepat dan tidak mengelirukan.
2. **Pencegahan Duplikasi Jemputan:** Seorang ahli direktori yang sama tidak boleh dimasukkan lebih daripada sekali ke dalam satu mesyuarat.
3. **Integriti Pemadaman:** Pemadaman ahli direktori atau mesyuarat mesti disahkan melalui modal pengesahan bagi mengelakkan kehilangan rekod secara tidak sengaja.
4. **Sekatan Status Mesyuarat:** Apabila mesyuarat ditandakan sebagai `completed` (*Selesai*) atau `cancelled` (*Dibatalkan*), pautan RSVP awam akan ditutup secara automatik daripada menerima sebarang perubahan baharu.

---

## 6. Kriteria Penerimaan (*Acceptance Criteria Checklist*)

- [x] **FR-001:** Sekretariat boleh log masuk menggunakan Shared Passcode dan disekat jika kod salah.
- [x] **FR-002:** Sekretariat boleh menambah, mengedit, dan memadam rekod dalam Direktori Tetap.
- [x] **FR-003:** Mesyuarat baru berjaya dicipta dan setiap jemputan dijana token URL unik yang sukar diteka.
- [x] **FR-004:** Pautan RSVP boleh dibuka dalam mod incognito (tanpa log masuk), membenarkan pilihan Hadir/Tidak Hadir, dan membenarkan tukar jawapan.
- [x] **FR-005:** Butang WhatsApp menyalin teks lengkap beserta pautan; e-mel pukal menandakan rekod penghantaran.
- [x] **FR-006:** Dashboard mengemas kini statistik kuorum dan jadual secara langsung apabila jawapan dihantar.
- [x] **FR-007:** Fail PDF dan CSV senarai kehadiran berjaya dijana dan dimuat turun dengan data yang sepadan 100%.
