# Status Pembangunan & Perancangan Masa Hadapan (Roadmap)

Dokumen ini merekodkan status sebenar ciri-ciri sistem **LGM e-Hadir**, membezakan antara apa yang telah siap dibina dan diuji, apa yang masih memerlukan pengesahan persekitaran luar, serta perancangan fasa seterusnya.

---

## 1. Status Komponen Semasa

### A. Siap Dibina & Telah Diuji (Verified in Development)

| ID Keperluan | Modul / Ciri | Status Ujian | Catatan Pelaksanaan |
| :--- | :--- | :--- | :--- |
| **FR-001** | Pengesahan Kod Akses Bersama | **Lulus Ujian** | Kod `LGM2026` disahkan; mesej ralat muncul jika kod tidak sah. Sesi disimpan dalam storan selamat pelayar. |
| **FR-002** | Pengurusan Direktori Pegawai | **Lulus Ujian** | CRUD penuh, validasi format e-mel dan telefon Malaysia, modal pengesahan pemadaman, dan carian segera. |
| **FR-003** | Cipta Mesyuarat & Jana Pautan | **Lulus Ujian** | Borang lengkap, pemilihan senarai direktori & ad-hoc, pencegahan duplikasi, penjanaan token unik $\ge 18$ aksara rawak. |
| **FR-004** | Pautan RSVP Pantas Penerima | **Lulus Ujian** | Dibuka tanpa log masuk, butang sentuhan besar, maklum balas pantas $<2$ saat, pilihan wakil/sebab, dan kebolehan menukar jawapan. |
| **FR-005** | Penghantaran WhatsApp & E-mel | **Lulus Ujian** | Salin templat rasmi berserta pautan unik ke papan keratan dengan *toast feedback*; e-mel pukal merekodkan masa penghantaran. |
| **FR-006** | Dashboard Pemantauan Masa Nyata | **Lulus Ujian** | Data dikemas kini secara langsung antara peranti tanpa perlu *refresh* manual; butang *Salin Peringatan* bagi yang belum respon. |
| **FR-007** | Eksport PDF & CSV Rasmi | **Lulus Ujian** | Muat turun fail `.csv` (UTF-8 BOM) dan dua format `.pdf` rasmi LGM (Laporan Status & Borang Pendaftaran Meja). |
| **UI-01** | Kad Pas Kehadiran Digital LGM | **Lulus Ujian** | Visual tiket digital korporat dengan cop pengesahan dan Kod QR semakan dewan mesyuarat. |
| **UI-02** | Tolok Kuorum Pekeliling (Quorum Gauge) | **Lulus Ujian** | Tolok bulat dengan zon warna piawai kerajaan (<50% Merah, 50-66% Kuning, $\ge 67\%$ Hijau). |
| **UI-03** | Bilah Tindakan Lekap (Sticky Bar) | **Lulus Ujian** | Muncul secara automatik apabila skrol ke bawah untuk akses pantas eksport dan ringkasan kuorum. |
| **UX-01** | Tambah ke Kalendar Satu Klik | **Lulus Ujian** | Pautan langsung ke Google Calendar dan muat turun fail `.ics` piawai dengan tetapan penggera 30 minit. |
| **UX-02** | Penamaan Wakil Pintar | **Lulus Ujian** | Cadangan pantas nama pegawai kanan daripada direktori LGM semasa memilih *Tidak Hadir*. |
| **UX-03** | Pengesanan Lokasi Pintar | **Lulus Ujian** | Pengesanan automatik pautan mesyuarat dalam talian (Teams/Zoom) dan butang navigasi pemanduan (Google Maps/Waze). |
| **UX-04** | Pembantu Giliran WhatsApp | **Lulus Ujian** | Modal giliran penghantaran satu demi satu yang membolehkan edaran pantas kepada puluhan pegawai tanpa kekeliruan. |

---

### B. Belum Disahkan di Persekitaran Sebenar (Pending Live Validation)

Perkara berikut memerlukan pengesahan lanjut setelah aplikasi dipasang pada infrastruktur pelayan pengeluaran LGM:
1. **Penghantaran E-mel Terus Melalui Domain Agensi (`@lgm.gov.my`):**
   - *Status Semasa:* Menggunakan mod sandaran (*mailto:* dan perekodan status dalaman).
   - *Perlu Pengesahan:* Kelulusan gerbang e-mel (*SMTP Relay / API Key*) daripada Unit IT LGM untuk mengelakkan mesej jemputan automatik disekat oleh penapis sekuriti atau spam agensi.
2. **Kesesuaian Rangkaian Dalaman Kerajaan (Intranet / MyGovNet):**
   - *Status Semasa:* Berfungsi pada rangkaian awam dan pelayan awan Google Cloud.
   - *Perlu Pengesahan:* Ujian capaian melalui sekatan proksi atau *firewall* dalaman kompleks pejabat Lembaga Getah Malaysia.

---

### C. Batasan Semasa yang Diketahui (*Known Limitations*)

- **Penyegerakan Multi-Peranti Awam:** Menggunakan pelayan Express setempat berasaskan fail `data/db.json` dan *BroadcastChannel*. Sekiranya dihoskan pada seni bina pelayan tanpa keadaan (*stateless serverless*), pangkalan data awan berpusat seperti Firebase Firestore atau PostgreSQL diperlukan untuk mengekalkan rekod kekal.
- **WhatsApp Web API:** Memerlukan staf urus setia menekan butang hantar di aplikasi WhatsApp (tiada penghantaran senyap di latar belakang kerana WhatsApp memerlukan akaun perniagaan berbayar Meta Business API).

---

## 2. Perancangan Fasa Seterusnya (Roadmap Masa Hadapan)

Perancangan ini adalah berdasarkan keperluan lanjutan yang dipersetujui dalam PRD Seksyen 6 (Fasa Seterusnya):

### Fasa 2 (Peningkatan Automasi & Keselamatan)
- [ ] **Integrasi WhatsApp Business Cloud API Rasmi:** Membolehkan sistem menghantar mesej WhatsApp secara automatik dari pelayan berpusat tanpa staf perlu membuka aplikasi WhatsApp telefon mereka.
- [ ] **Lampiran Fail Kalendar `.ics` Automatik:** Memasukkan fail jemputan kalendar secara langsung ke dalam e-mel yang dihantar kepada Pengarah.
- [ ] **Jejak Audit Pentadbiran Penuh (*Audit Log Trail*):** Merekodkan nama pegawai urus setia tertentu yang mencipta mesyuarat atau mengubah maklumat direktori.

### Di Luar Skop (Out of Scope untuk Sistem Ini)
Sistem ini memfokuskan kepada kelajuan pengesahan kehadiran sahaja. Perkara berikut kekal di luar skop:
- Sistem pengurusan dan edaran minit mesyuarat rasmi.
- Sistem tempahan bilik mesyuarat fizikal.
- Pengesahan biometrik atau OTP SMS bagi penerima jemputan.
