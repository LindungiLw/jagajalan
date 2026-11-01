# Pipeline Ekstraksi & Preprocessing Data Geospasial JagaJalan

Direktori ini berisi skrip otomatisasi pipeline data (ETL) yang digunakan untuk mengekstrak, membersihkan, dan memetakan koordinat geospasial serta dokumen anggaran dari portal resmi pemerintah Indonesia.

## Sumber Data Terintegrasi:
1. **Satu Data Kementerian PU & SIGI (Sistem Informasi Geospasial Infrastruktur)**:
   - Metadata geometris ruas jalan nasional (Trans-Jawa, Trans-Sumatera, Trans-Kalimantan, Trans-Sulawesi, Trans-Papua).
   - Validasi batas administrasi koridor antarprovinsi.
2. **Open Data Daerah (Jawa Barat, Sumatera Utara, dsb.)**:
   - Penetapan ruas jalan provinsi berdasarkan SK Gubernur.
   - Ruas jalan strategis kabupaten/kota pilot project.
3. **LPSE & Inaproc LKPP**:
   - Struktur data paket lelang, nilai HPS, dan kontrak SPK.

## Struktur Berkas:
- `data/`: Penyimpanan data mentah (*raw data*) hasil unduhan geospasial sebelum diintegrasikan ke `src/data/`.
- `build_accurate_national_highways.py`: Rekonstruksi kurva geospasial jalan nasional berdasarkan data titik koordinat PU.
- `build_provincial_roads.py`: Pembangunan dataset jalan provinsi dari portal satu data provinsi.
- `fetch_city_regency_roads.py`: Ekstraksi jaringan jalan kabupaten/kota percontohan.
- `merge_roads_data.py`: Penggabungan dan normalisasi atribut lintas status kewenangan.
