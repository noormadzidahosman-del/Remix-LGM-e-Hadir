# Panduan Pemasangan & Penyelenggaraan Teknikal

Dokumen ini ditujukan kepada pentadbir sistem, jurutera perisian, atau pasukan IT yang ingin memasang, menjalankan, atau menyelenggara kod sumber **LGM e-Hadir**.

---

## 1. Keperluan Sistem (Prerequisites)

Sebelum memulakan pemasangan, pastikan persekitaran komputer atau pelayan anda memenuhi keperluan berikut:
- **Node.js:** Versi 18.0 atau lebih tinggi (disyorkan versi LTS terkini, cth: Node.js 20+).
- **npm:** Versi 9.0 atau lebih tinggi (biasanya disertakan bersama Node.js).
- **Sistem Operasi:** Linux (Ubuntu/Debian/RHEL), macOS, atau Windows (melalui WSL2 atau PowerShell).
- **Pelayar Web Moden:** Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari.

---

## 2. Struktur Direktori Utama Projek

```text
├── data/                    # Fail pangkalan data berpusat (db.json)
├── docs/                    # Dokumentasi lengkap sistem
├── public/                  # Aset statik awam (termasuk PRD asal LGM)
├── src/
│   ├── components/          # Komponen UI (Navbar, Kad Pas Digital, Tolok Kuorum, dll)
│   ├── data/                # Data benih permulaan rasmi LGM (initialData.ts)
│   ├── pages/               # Halaman utama (Dashboard, RSVP, Direktori, Cipta Mesyuarat)
│   ├── services/            # Logik API pelanggan, sinkronisasi, dan storan sandaran
│   ├── types/               # Definisi jenis data TypeScript
│   └── utils/               # Utiliti format tarikh, WhatsApp, kalendar, eksport PDF/CSV
├── server.ts                # Pelayan Express backend + integrasi Vite middleware
├── package.json             # Pakej dependensi dan skrip arahan
└── tsconfig.json            # Konfigurasi pengkompil TypeScript
```

---

## 3. Langkah Pemasangan & Menjalankan Projek

### Langkah 1: Klon Repositori
```bash
git clone https://github.com/[organisasi-anda]/lgm-e-hadir.git
cd lgm-e-hadir
```

### Langkah 2: Pasang Pakej Dependensi
Jalankan arahan berikut untuk memuat turun semua pakej perpustakaan yang diperlukan:
```bash
npm install
```

### Langkah 3: Konfigurasi Pemboleh Ubah Persekitaran (Environment Variables)
Salin fail contoh `.env.example` kepada `.env`:
```bash
cp .env.example .env
```

Buka fail `.env` dan laraskan nilai mengikut keperluan anda:
```env
# Kod Lalai Akses Urus Setia (Tukar mengikut kata laluan pilihan anda)
VITE_SECRETARIAT_PASSCODE="LGM2026"

# URL hos tempatan atau pelayan awan
APP_URL="http://localhost:3000"
```

### Langkah 4: Jalankan Mod Pembangunan (Development Mode)
```bash
npm run dev
```
Pelayan akan berjalan pada port `3000`. Buka pelayar anda di:
[http://localhost:3000](http://localhost:3000)

---

## 4. Arahan Skrip Utama (NPM Scripts)

| Skrip Arahan | Penerangan Operasi |
| :--- | :--- |
| `npm run dev` | Memulakan pelayan Express bersama enjin Vite middleware untuk pembangunan langsung. |
| `npm run build` | Mengkompil fail TypeScript dan menghasilkan pakej pengeluaran statik dalam folder `dist/`. |
| `npm run start` | Menjalankan pelayan pengeluaran penuh menggunakan `tsx server.ts`. |
| `npm run lint` | Menjalankan pemeriksaan jenis TypeScript (`tsc --noEmit`) untuk mengesan sebarang ralat kod. |

---

## 5. Pilihan Pelaksanaan / Deployment

### Pilihan A: Google Cloud Run (Disyorkan untuk Skalabiliti)
Aplikasi ini serasi dengan seni bina pelayan kontena Google Cloud Run kerana pelayan `server.ts` telah dikonfigurasikan untuk mendengar pada port `3000` dan mengendalikan kedua-dua panggilan REST API serta aset statik frontend.

### Pilihan B: Pelayan Maya Sendiri (Ubuntu VPS / Nginx)
1. Pasang Node.js dan PM2 pada pelayan:
   ```bash
   sudo npm install -g pm2
   ```
2. Bina projek pada pelayan:
   ```bash
   npm run build
   ```
3. Mulakan aplikasi di latar belakang dengan PM2:
   ```bash
   pm2 start "npm run start" --name "lgm-ehadir"
   pm2 save
   ```
4. Pasang Nginx sebagai proksi songsang (*reverse proxy*) yang mengalihkan trafik port 80/443 (HTTPS) kepada `http://127.0.0.1:3000`.

---

## 6. Penyelesaian Masalah Teknikal (Troubleshooting)

- **Port 3000 Sedang Digunakan:**
  - Sekiranya port 3000 digunakan oleh proses lain, semak proses tersebut dengan arahan:
    ```bash
    lsof -i :3000
    ```
    Hentikan proses lama atau ubah nilai port dalam fail `server.ts`.

- **Pangkalan Data JSON Rosak atau Perlu Dikosongkan:**
  - Anda boleh memadam fail `data/db.json` atau memanggil endpoint pengesetan semula:
    ```bash
    curl -X POST http://localhost:3000/api/state/reset
    ```
    Sistem akan memulihkan data direktori sampel asal LGM secara automatik.

- **Ralat Fail PDF pada Pelayar Lama:**
  - Pastikan pelayar membenarkan muat turun fail automatik (*pop-up / automatic download permissions*). Penjanaan PDF menggunakan modul `jspdf` dan `jspdf-autotable` yang memerlukan sokongan Blob URL piawai.
