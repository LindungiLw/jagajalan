# JagaJalan

Platform Transparansi Kewenangan, Keterbukaan Anggaran APBD, dan Akselerasi Kepatuhan Penanganan Jalan Publik.

Karya Inovasi Teknologi oleh **COMEL Team** untuk cabang kompetisi **Web In Action (WIA) - Multimedia In Action (MIA) 2026**, diselenggarakan oleh **KSM Multimedia UPN Veteran Jakarta**.

Tema Kompetisi: *Designing Digital Futures - Powering Public Transparency*

---

## 1. Latar Belakang dan Urgensi Masalah

Kerusakan jalan raya di Indonesia bukan sekadar persoalan teknis keausan aspal, melainkan cerminan kegagalan transparansi tata kelola birokrasi, fragmentasi kewenangan, dan lemahnya akuntabilitas anggaran pemeliharaan. Berdasarkan rujukan data resmi nasional:

1. **Pemerintah Daerah Sebagai Instansi Terlapor Tertinggi (45,88%)**
   Laporan Tahunan Ombudsman Republik Indonesia mencatat bahwa 45,88% dari total laporan pengaduan maladministrasi pelayanan publik di Indonesia tertuju kepada Pemerintah Daerah (Pemerintah Provinsi, Kabupaten, dan Kota). Dari jumlah tersebut, keluhan atas buruknya fasilitas infrastruktur jalan menempati porsi pengaduan paling menonjol.
2. **Krisis Kemantapan Jalan Daerah Nasional (47,0%)**
   Data Satu Data Kementerian Pekerjaan Umum dan Badan Pusat Statistik (BPS) menunjukkan disparitas ekstrem: jalan nasional memiliki tingkat kemantapan di atas 90%, namun rata-rata kemantapan jalan kabupaten/kota di Indonesia hanya berkisar 53%. Sebanyak 47% jalan daerah berada dalam status rusak ringan hingga rusak berat, yang memaksa pemerintah pusat menerbitkan Instruksi Presiden (Inpres) Jalan Daerah senilai Rp 14,6 Triliun akibat rendahnya kapasitas fiskal dan transparansi pemda.
3. **Maladministrasi Penundaan Berlarut (> 60%)**
   Bentuk maladministrasi terbesar dalam pelayanan jalan publik adalah Penundaan Berlarut (*Undue Delay*, 33,86%) yang dikombinasikan dengan pengabaian kewajiban pelayanan publik. Aduan warga melalui kanal konvensional kerap diabaikan berbulan-bulan tanpa kepastian penanganan fisik.
4. **Birokrasi "Saling Lempar Kewenangan"**
   Masyarakat awam kesulitan membedakan status jalan yang rusak:
   - Jalan Nasional: wewenang Kementerian Pekerjaan Umum (BBPJN).
   - Jalan Provinsi: wewenang Dinas Bina Marga Provinsi.
   - Jalan Kota/Kabupaten: wewenang Dinas PUPR Daerah.
   Ketiadaan integrasi data spasial terbuka menyebabkan dinas pemerintah saling melempar tanggung jawab (*blame-shifting*) ketika masyarakat menuntut perbaikan.

JagaJalan hadir sebagai sistem transparansi geospasial terpadu yang memotong rantai lempar wewenang, menyandingkan laporan kerusakan dengan paket anggaran APBD terbuka, dan menegakkan kepatuhan hukum standar waktu pelayanan publik (SLA 14 hari kerja) melalui mekanisme eskalasi resmi ke Ombudsman RI.

---

## 2. Keselarasan Tema dan Subtema Kompetisi

Platform JagaJalan dirancang untuk menjawab 4 pilar utama tema *Powering Public Transparency*:

1. **Transparansi Pelayanan Publik**: Membuka batas-batas administratif dan legalitas wewenang pengelolaan jalan secara terang benderang kepada publik.
2. **Akuntabilitas Keuangan Daerah**: Menghubungkan titik jalan rusak dengan data paket pengadaan tender pemeliharaan jalan APBD/LPSE, nama kontraktor pelaksana, dan pagu dana.
3. **Pengawasan Partisipatif Berbasis Bukti Digital & AI**: Membekali warga dengan teknologi Computer Vision untuk menilai tingkat keparahan jalan secara objektif dan anti-manipulasi.
4. **Penegakan Kepatuhan Hukum (Citizen Empowerment)**: Memberdayakan hak hukum masyarakat berdasarkan Undang-Undang Pelayanan Publik untuk menuntut akuntabilitas dinas melalui instrumen laporan resmi ke Ombudsman RI.

---

## 3. Pilar Inovasi dan Fitur Solusi

### A. Pemetaan Kewenangan Geospasial Instan
Mengintegrasikan data OpenStreetMap dan basis data Surat Keputusan (SK) Penetapan Status Ruas Jalan. Setiap klik pada peta langsung mengunci:
- Instansi penanggung jawab resmi (Kementerian PU, Dinas Bina Marga Provinsi, atau Dinas PUPR Kota/Kabupaten).
- Dasar hukum regulasi penetapan ruas.
- Nomor kode ruas dan panjang segmen jalan.

### B. Pencocokan Anggaran APBD Terbuka (Open Budget Matching)
Setiap segmen ruas jalan disandingkan secara relasional dengan data pengadaan lelang LPSE/APBD pemeliharaan jalan daerah:
- Nama paket pekerjaan proyek.
- Pagu anggaran dan nilai kontrak.
- Identitas kontraktor pemenang lelang.
- Catatan progres realisasi fisik di lapangan.

### C. Verifikasi Citra Kerusakan Berbasis AI Vision
Menggunakan modul analisis citra cerdas (Computer Vision) untuk memproses foto bukti yang diunggah warga:
- Validasi keaslian kerusakan (anti-spam dan anti-hoaks).
- Estimasi dimensi lubang dan kedalaman kerusakan aspal.
- Kalkulasi Skor Bahaya Keselamatan (*Hazard Score* skala 1-100) guna menyusun matriks prioritas perbaikan bagi dinas.

### D. Penegakan SLA 14 Hari Kerja dan Generator Draf Ombudsman RI
Menerapkan Service Level Agreement (SLA) penanganan aduan maksimal 14 hari kerja berdasarkan mandat UU No. 25 Tahun 2009 tentang Pelayanan Publik:
- Jam hitung mundur batas waktu terbuka yang dapat dipantau oleh seluruh publik.
- Jika status melewati batas toleransi (*status: OVERDUE*), sistem menyediakan fitur 1-klik untuk men-generate surat formal laporan pengaduan dugaan maladministrasi penundaan berlarut kepada Ombudsman Republik Indonesia (UU No. 37 Tahun 2008), lengkap dengan bukti geotagged, analisis AI, dan riwayat paket anggaran.

### E. Papan Skor Makro 38 Provinsi
Menyajikan visualisasi perbandingan makro seluruh provinsi di Indonesia berdasarkan persentase kemantapan jalan (BPS) dan volume aduan masyarakat (SP4N-LAPOR!), dilengkapi filter regional pulau untuk analisis kebijakan publik nasional.

---

## 4. Alur Perjalanan Pengguna (Multi-Role User Journey)

Sistem mengakomodasi dua sudut pandang pemangku kepentingan (*multi-stakeholder*):

### 1. Peran Masyarakat / Pengguna Jalan
1. Mengeksplorasi peta interaktif untuk mengecek status jalan rusak di rute aktivitas hariannya.
2. Mengetahui secara pasti instansi penanggung jawab jalan dan ketersediaan alokasi anggaran APBD pada ruas tersebut.
3. Mengunggah foto kerusakan jalan untuk diverifikasi oleh sistem AI Vision.
4. Memantau jam hitung mundur SLA penanganan publik secara transparan.
5. Mengunduh draf resmi laporan ke Ombudsman RI secara otomatis apabila laporan diabaikan pemda melampaui 14 hari kerja.

### 2. Peran Aparatur / Dinas Penyelenggara Jalan
1. Mengakses antrean laporan masuk yang telah difilter dari spam dan diurutkan berdasarkan skor bahaya AI serta jumlah konfirmasi warga (*crowd-validation*).
2. Memperbarui status pengerjaan secara transparan (Diverifikasi, Terjadwal, Sedang Dikerjakan, Selesai).
3. Mengunggah bukti foto dokumentasi perbaikan fisik (*before-after proof*) sebagai syarat penutupan tiket aduan publik.

---

## 5. Arsitektur Data Dua Tingkat (Two-Tier Data Architecture)

Untuk menyeimbangkan antara wawasan makro nasional dan kedalaman fungsional operasional, JagaJalan mengadopsi arsitektur data dua tingkat:

### Tingkat 1: Data Makro Nasional (38 Provinsi)
- Cakupan: 38 Provinsi di Indonesia.
- Sumber Data: Badan Pusat Statistik (BPS) dan SP4N-LAPOR!.
- Parameter: Persentase jalan tidak mantap, total aduan masuk, aduan berstatus overdue, dan alokasi Inpres Jalan Daerah (IJD).

### Tingkat 2: Data Mikro Pilot Geospasial (Koridor Jawa Barat & Bodetabek)
- Justifikasi Pemilihan Pilot:
  Provinsi Jawa Barat dan koridor aglomerasi Bodetabek (Depok, Bogor, Bekasi) dipilih secara berbasis data (*data-driven*) karena menempati peringkat tertinggi volume aduan infrastruktur jalan di Indonesia, memiliki mobilitas komuter terpadat dengan beban tonase berat, serta didukung portal data keterbukaan APBD yang matang (Open Data Jabar).
- Parameter Segmen: Koordinat jalur polyline ruas, titik geotagged aduan warga, SK wewenang dinas, serta paket anggaran tender LPSE.

---

## 6. Desain Skema Basis Data (Database Schema)

Sistem dirancang dengan normalisasi relasional berbasis entitas independen (Foreign Key terintegrasi):

```
+-----------------------------------------------------------------------------------+
|                                 DATABASE SCHEMA                                   |
+-----------------------------------------------------------------------------------+

 1. provinces_stat
    - id (PK)
    - nama_provinsi
    - kode_kemendagri
    - panjang_jalan_rusak_km
    - persentase_rusak
    - total_aduan_tercatat
    - aduan_overdue_count
    - alokasi_inpres_rp

 2. road_segments
    - id (PK)
    - nama_ruas
    - kode_ruas
    - kewenangan (NASIONAL | PROVINSI | KOTA_KAB)
    - instansi_penanggungjawab
    - dasar_hukum_sk
    - panjang_km
    - tipe_perkerasan
    - status_kondisi
    - geometry_coordinates (GeoJSON)
    - wilayah_administrasi

 3. budget_allocations
    - id (PK)
    - road_segment_id (FK -> road_segments.id)
    - tahun_anggaran
    - kode_paket_lpse
    - nama_paket_pekerjaan
    - pagu_anggaran_rp
    - nilai_kontrak_rp
    - nama_kontraktor
    - sumber_dana (APBD | DAK | Inpres)
    - status_progres_lelang

 4. road_reports
    - id (PK)
    - ticket_code (Contoh: JGJ-DPK-081)
    - road_segment_id (FK -> road_segments.id)
    - latitude
    - longitude
    - alamat_patokan
    - foto_bukti_url
    - ai_damage_category (Pothole | Subsidence | Cracking)
    - ai_hazard_score (1-100)
    - ai_analysis_summary
    - nama_pelapor
    - tanggal_lapor
    - sla_deadline_at (Tanggal lapor + 14 hari kerja)
    - status (MENUNGGU_VERIFIKASI | DALAM_PENGERJAAN | SELESAI | OVERDUE)
    - days_overdue
    - support_upvotes_count

 5. report_updates
    - id (PK)
    - report_id (FK -> road_reports.id)
    - status_baru
    - catatan_tindakan
    - foto_bukti_penanganan_url
    - updated_at

 6. ombudsman_escalations
    - id (PK)
    - report_id (FK -> road_reports.id)
    - nomor_surat_draf
    - teks_laporan_maladministrasi
    - status_diserahkan
    - created_at
```

---

## 7. Arsitektur Komponen dan Alur Interaksi Sistem

```
+-----------------------------------------------------------------------------------+
|                        ARSITEKTUR KOMPONEN APLIKASI                               |
+-----------------------------------------------------------------------------------+

                    [ Pengguna: Warga / Publik ]
                                 │
                                 ▼
             +─────────────────────────────────────────+
             |         Next.js App Router (UI)         |
             |   Navbar • KPI Header • Papan 38 Prov   |
             +────────────────────┬────────────────────+
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
+───────────────────────────+             +───────────────────────────────────+
|   Interactive Map Engine  |             |      Smart AI Report Module       |
|  - React-Leaflet Viewport |             |  - Geotagging & Ruas Matching     |
|  - OpenStreetMap Tiles    |             |  - Computer Vision Inspection     |
|  - GeoJSON Authority Line |             |  - Auto Hazard Score (1-100)      |
+─────────────┬─────────────+             +─────────────────┬─────────────────+
              │                                             │
              ▼                                             ▼
+───────────────────────────+             +───────────────────────────────────+
|     Inspector Drawer      |             |     SLA & Compliance Tracker      |
|  - Kunci Wewenang Instansi|             |  - Countdown 14 Hari Kerja        |
|  - Tautkan Anggaran APBD  |             |  - Deteksi Pelanggaran Overdue    |
|  - Rekam Status Pengerjaan|             |  - 1-Click Ombudsman RI Generator |
+───────────────────────────+             +───────────────────────────────────+
```

---

## 8. Filosofi Desain Antarmuka: Clean Light Dashboard

Untuk menghadirkan platform yang terasa seperti ruang kendali modern yang berwibawa, JagaJalan mengadopsi pendekatan desain *Clean Light Dashboard*:

1. **Latar Belakang Putih dan Slate Terang (`#f8fafc`)**
   Memberikan visibilitas maksimal, kebersihan tipografi, dan kontras yang nyaman di mata juri, membedakannya dari kesan gelap atau situs birokrasi konvensional.
2. **Warna Aksi Utama: Safety Orange (`#ea580c` / `#f97316`)**
   Merupakan standar keselamatan jalan raya internasional (rambu perbaikan jalan, marka darurat, dan rompi petugas PU). Warna ini memberikan sinyal psikologis atas tindakan cepat tanggap, energi tinggi, dan transparansi aktif.
3. **Sistem Pengkodean Warna Kewenangan Jalan**:
   - Merah (`#dc2626`): Jalan Nasional (Kementerian PU) dan Indikator Maladministrasi Overdue.
   - Oranye (`#ea580c`): Jalan Provinsi (Dinas Bina Marga).
   - Hijau (`#16a34a`): Jalan Kota/Kabupaten (Dinas PUPR Daerah) dan Status Selesai.
   - Kuning Emas (`#d97706`): Transparansi Pagu Anggaran Paket APBD.
4. **Ikonografi Fungsional**: Menggunakan ikon teknis yang bersih dan formal (Shield, Camera, AlertCircle, Building2, MapPin, Clock) untuk memperkuat citra instrumen pengawasan yang berbobot.

---

## 9. Spesifikasi Tumpukan Teknologi (Tech Stack)

- **Frontend Core**: Next.js (App Router, React 19)
- **Styling Architecture**: Tailwind CSS v4 (Light Dashboard Tokens)
- **Geospatial Engine**: Leaflet.js dan React-Leaflet
- **Map Tile Provider**: OpenStreetMap Standard Light Layer (Bebas lisensi berbayar dan tanpa watermark API key)
- **Image Analytics Architecture**: Model integrasi Computer Vision AI
- **Iconography**: Lucide React
- **Build Engine**: Next.js Turbopack

---

## 10. Struktur Organisasi Berkas Proyek

```
jagajalan/
├── src/
│   ├── app/
│   │   ├── globals.css          # Desain sistem dan token warna tema terang
│   │   ├── layout.js            # Metadata root dan pembungkus HTML
│   │   └── page.js              # Halaman utama orkestrator tab navigasi
│   ├── components/
│   │   ├── layout/              # Komponen navigasi dan kerangka tata letak
│   │   │   ├── Navbar.jsx       # Header navigasi bersegmen dan tombol lapor
│   │   │   └── Footer.jsx       # Navigasi penutup dan atribusi data resmi
│   │   ├── dashboard/           # Komponen ringkasan analitik dan metrik
│   │   │   ├── HeroSection.jsx  # Pita metrik KPI eksekutif dan 3 pilar solusi
│   │   │   └── NationalRankingSection.jsx # Papan skor makro 38 provinsi
│   │   ├── map/                 # Mesin pemetaan geospasial dan interaksi ruas
│   │   │   ├── MapExplorer.jsx  # Ruang kerja geospasial dan panel rincian aduan
│   │   │   └── MapInner.jsx     # Komponen peta Leaflet dan layer polyline jalan
│   │   ├── modals/              # Dialog interaktif dan eskalasi kepatuhan
│   │   │   ├── ReportModal.jsx  # Formulir lapor aduan dan verifikasi AI Vision
│   │   │   └── OmbudsmanModal.jsx # Generator draf surat formal Ombudsman RI
│   │   └── index.js             # Sentralisasi barrel export komponen
│   ├── data/
│   │   ├── provincesData.js     # Data agregat 38 provinsi (BPS & SP4N-LAPOR!)
│   │   ├── roadsData.js         # Data ruas jalan pilot, SK wewenang, dan APBD
│   │   └── reportsData.js       # Data aduan warga geotagged dan status SLA
│   └── lib/
│       ├── constants.js         # Standar kodefikasi warna wewenang dan limit SLA
│       └── utils.js             # Pembantu kalkulasi SLA, format mata uang, dan skor
├── public/                      # Aset statis dan favicon
├── package.json                 # Konfigurasi dependensi dan skrip proyek
├── LICENSE                      # Berkas lisensi terbuka MIT License
├── .gitignore                   # Konfigurasi proteksi berkas sensitif dan build
└── README.md                    # Konsep dan arsitektur sistem JagaJalan
```

---

## 11. Sumber Data Resmi dan Dasar Regulasi Hukum

1. **Satu Data Kementerian Pekerjaan Umum**: Basis data panjang jalan dan tingkat kemantapan jalan nasional serta daerah.
2. **Badan Pusat Statistik (BPS)**: Statistik Transportasi Darat Indonesia dan data kondisi infrastruktur provinsi.
3. **Ombudsman Republik Indonesia**: Laporan Tahunan Pelayanan Publik dan Statistik Pengaduan Maladministrasi.
4. **Portal Satu Data Jawa Barat**: Data realisasi tender pemeliharaan berkala jalan daerah APBD/LPSE.
5. **Undang-Undang No. 25 Tahun 2009 tentang Pelayanan Publik**: Dasar penentuan batas toleransi waktu standar pelayanan minimal (SLA maksimal 14 hari kerja).
6. **Undang-Undang No. 37 Tahun 2008 tentang Ombudsman Republik Indonesia**: Landasan hukum pemeriksaan dan penerbitan rekomendasi atas tindakan maladministrasi penundaan berlarut (*undue delay*).

---

## 12. Identitas Pengembang

- **Nama Tim**: COMEL Team
- **Kompetisi**: Multimedia In Action (MIA) 2026 - Web In Action (WIA)
- **Penyelenggara**: KSM Multimedia UPN Veteran Jakarta
- **Tahun**: 2026

---

## 13. Lisensi (License)

Seluruh kode sumber, basis data sampel, dan spesifikasi arsitektur proyek JagaJalan didistribusikan secara terbuka di bawah naungan **MIT License**.

Hak Cipta (c) 2026 COMEL Team - Cabang Lomba Web In Action (WIA), Multimedia In Action (MIA) 2026, KSM Multimedia UPN Veteran Jakarta.

Teks lengkap ketentuan lisensi dapat diakses secara langsung pada berkas [LICENSE](file:///d:/Lomba/MIA/COMEL%20Team/Projects/jagajalan/LICENSE).
