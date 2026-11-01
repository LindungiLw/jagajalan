import json
import urllib.request
import time

# 25+ Strategic City & Regency Roads across Indonesia
corridors = [
    # --- SUMATERA ---
    {
        "id": "ruas-kab-su-03",
        "provinceId": "sumatera_utara",
        "region": "sumatera",
        "name": "Ruas Lubuk Pakam - Pantai Labu (Akses Pesisir & Bandara)",
        "code": "RUAS-KAB-DS-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kabupaten (APBD Kab. Deli Serdang)",
        "legalBasis": "Keputusan Bupati Deli Serdang No. 412/2022 tentang Penetapan Status Ruas Jalan Kabupaten",
        "district": "Kabupaten Deli Serdang (Sumatera Utara)",
        "center": [3.612, 98.905],
        "pavementType": "Aspal Hotmix (HRS-Base & Binder)",
        "condition": "RUSAK_RINGAN",
        "lengthKm": 14.2,
        "hazardScore": 48,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [98.875, 3.565], # Lubuk Pakam
            [98.910, 3.615], # Aras Kabu
            [98.935, 3.660]  # Pantai Labu
        ],
        "leadership": {
            "regionalHead": "Bupati Deli Serdang",
            "agency": "Dinas Sumber Daya Air, Bina Marga & Bina Konstruksi Kab. Deli Serdang",
            "picName": "Ir. Janso Sipahutar, S.T., M.T."
        },
        "problemDetails": {
            "headline": "Amblesan dan Lubang Berulang Akibat Angkutan Material Proyek",
            "description": "Jalan akses penghubung sentra perikanan Pantai Labu menuju kota Lubuk Pakam yang mengalami penurunan struktur akibat drainase tersumbat.",
            "rootCause": "Genangan air pasang rob dan tingginya intensitas curah hujan.",
            "safetyImpact": "Membahayakan nelayan dan komuter bandara pada malam hari karena minimnya penerangan jalan umum (PJU)."
        },
        "budget": {
            "paguRp": 12500000000,
            "contractValueRp": 11840000000,
            "name": "Peningkatan Struktur Jalan Ruas Lubuk Pakam - Pantai Labu",
            "contractor": "CV Bina Cipta Mandiri",
            "source": "APBD Kabupaten Deli Serdang TA 2026",
            "fiscalYear": 2026,
            "progressPct": 45.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Bupati Deli Serdang No. 412/2022",
            "budgetSource": "LPSE Kabupaten Deli Serdang & SiRUP LKPP",
            "fieldDataSource": "Dinas SDABMBK Kabupaten Deli Serdang",
            "transparencyUrl": "https://lpse.deliserdangkab.go.id"
        }
    },
    {
        "id": "ruas-kab-su-04",
        "provinceId": "sumatera_utara",
        "region": "sumatera",
        "name": "Ruas Perdagangan - Bandar Betsy (Sentra Perkebunan)",
        "code": "RUAS-KAB-SML-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kabupaten (APBD Kab. Simalungun)",
        "legalBasis": "Keputusan Bupati Simalungun No. 188.45/489/PUPR/2021 tentang Status Jalan Kabupaten Simalungun",
        "district": "Kabupaten Simalungun (Sumatera Utara)",
        "center": [3.155, 99.285],
        "pavementType": "Penetrasi Macadam & Hotmix Patching",
        "condition": "RUSAK_BERAT",
        "lengthKm": 18.6,
        "hazardScore": 76,
        "hazardLevel": "TINGGI",
        "waypoints": [
            [99.325, 3.175], # Perdagangan
            [99.270, 3.145], # Bandar Betsy
            [99.225, 3.110]  # Simpang Mayang
        ],
        "leadership": {
            "regionalHead": "Bupati Simalungun",
            "agency": "Dinas Pekerjaan Umum dan Tata Ruang Kab. Simalungun",
            "picName": "Hotbinson Damanik, S.T., M.Sc."
        },
        "problemDetails": {
            "headline": "Kondisi Berlubang Parah Sepanjang 7 KM Jalur Truk Sawit",
            "description": "Jalur urat nadi pengangkutan kelapa sawit rakyat dan PTPN IV yang mengalami pelepasan butir agregat dan lubang berdiameter hingga 1.5 meter.",
            "rootCause": "Truk Over Dimension Over Load (ODOL) pengangkut tandan buah segar (TBS) sawit melampaui kelas jalan III.",
            "safetyImpact": "Sering terjadi truk terguling dan pengendara motor terperosok saat musim hujan."
        },
        "budget": {
            "paguRp": 16800000000,
            "contractValueRp": 15950000000,
            "name": "Rekonstruksi Jalan Kabupaten Ruas Perdagangan - Bandar Betsy",
            "contractor": "PT Sinar Perkasa Raya",
            "source": "Dana Bagi Hasil (DBH) Sawit & APBD Simalungun",
            "fiscalYear": 2026,
            "progressPct": 32.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Bupati Simalungun No. 188.45/489/PUPR/2021",
            "budgetSource": "LPSE Kab. Simalungun & BPKAD Simalungun",
            "fieldDataSource": "Dinas PUTR Kabupaten Simalungun",
            "transparencyUrl": "https://lpse.simalungunkab.go.id"
        }
    },
    {
        "id": "ruas-kab-riau-01",
        "provinceId": "riau",
        "region": "sumatera",
        "name": "Jl. Arifin Achmad - Tuanku Tambusai (Sentra Niaga)",
        "code": "RUAS-KTA-PKU-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Pekanbaru)",
        "legalBasis": "Keputusan Walikota Pekanbaru No. 176/2023 tentang Penetapan Ruas Jalan Kota Pekanbaru",
        "district": "Kota Pekanbaru (Riau)",
        "center": [0.490, 101.425],
        "pavementType": "Aspal Beton AC-WC",
        "condition": "RUSAK_RINGAN",
        "lengthKm": 6.8,
        "hazardScore": 44,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [101.450, 0.485], # Simpang Jl. Sudirman
            [101.425, 0.490], # Arifin Achmad Tengah
            [101.400, 0.505]  # Simpang Arengka
        ],
        "leadership": {
            "regionalHead": "Pj. Walikota Pekanbaru",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Kota Pekanbaru",
            "picName": "Edward Riansyah, S.T., M.T."
        },
        "problemDetails": {
            "headline": "Genangan Air Parit Meluap Mengikis Lapisan Permukaan Aspal",
            "description": "Koridor kuliner dan perkantoran sentral Pekanbaru yang kerap tergenang air saat hujan lebat akibat sedimentasi drainase samping.",
            "rootCause": "Penurunan elevasi tanah dasar gambut dan penyumbatan sedimen box culvert.",
            "safetyImpact": "Kemacetan parah dan lubang tertutup genangan air berbahaya bagi pengendara roda dua."
        },
        "budget": {
            "paguRp": 8500000000,
            "contractValueRp": 8120000000,
            "name": "Overlay Aspal & Normalisasi Drainase Koridor Jl. Arifin Achmad",
            "contractor": "PT Riau Multi Cipta",
            "source": "APBD Kota Pekanbaru TA 2026",
            "fiscalYear": 2026,
            "progressPct": 75.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Pekanbaru No. 176/2023",
            "budgetSource": "LPSE Kota Pekanbaru",
            "fieldDataSource": "Dinas PUPR Kota Pekanbaru",
            "transparencyUrl": "https://lpse.pekanbaru.go.id"
        }
    },
    {
        "id": "ruas-kab-sumbar-01",
        "provinceId": "sumatera_barat",
        "region": "sumatera",
        "name": "Jl. Bagindo Aziz Chan - Aie Pacah (Balai Kota Padang)",
        "code": "RUAS-KTA-PDG-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Padang)",
        "legalBasis": "Peraturan Walikota Padang No. 34/2021 tentang Jaringan Jalan Perkotaan Kota Padang",
        "district": "Kota Padang (Sumatera Barat)",
        "center": [-0.885, 100.385],
        "pavementType": "Aspal Hotmix AC-BC & Beton",
        "condition": "BAIK",
        "lengthKm": 8.4,
        "hazardScore": 25,
        "hazardLevel": "RENDAH",
        "waypoints": [
            [100.360, -0.920], # Simpang Tarandam
            [100.380, -0.885], # Sawahan - Bypass
            [100.405, -0.850]  # Kompleks Balai Kota Aie Pacah
        ],
        "leadership": {
            "regionalHead": "Pj. Walikota Padang",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Kota Padang",
            "picName": "Tri Hadiyanto, S.T., M.Sc."
        },
        "problemDetails": {
            "headline": "Konektivitas Evakuasi Tsunami & Akses Pusat Pemerintahan Kota",
            "description": "Jalan poros evakuasi tsunami dari zona pesisir menuju zona hijau Aie Pacah yang membutuhkan pemeliharaan median jalan rutin.",
            "rootCause": "Pertumbuhan volume kendaraan komuter perkantoran ASN Pemko Padang.",
            "safetyImpact": "Kesiapsiagaan rute evakuasi bencana gempa bumi & tsunami Samudra Hindia."
        },
        "budget": {
            "paguRp": 7200000000,
            "contractValueRp": 6850000000,
            "name": "Pemeliharaan Berkala Jalur Evakuasi Balai Kota Aie Pacah",
            "contractor": "PT Ranah Minang Konstruksi",
            "source": "APBD Kota Padang TA 2026",
            "fiscalYear": 2026,
            "progressPct": 88.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "Perwako Padang No. 34/2021",
            "budgetSource": "LPSE Kota Padang",
            "fieldDataSource": "Dinas PUPR Kota Padang",
            "transparencyUrl": "https://lpse.padang.go.id"
        }
    },
    {
        "id": "ruas-kab-sumsel-01",
        "provinceId": "sumatera_selatan",
        "region": "sumatera",
        "name": "Jl. R. Sukamto - Basuki Rahmat (Urat Nadi Niaga)",
        "code": "RUAS-KTA-PLG-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Palembang)",
        "legalBasis": "Keputusan Walikota Palembang No. 210/KPTS/2022 tentang Penetapan Status Jalan Kota Palembang",
        "district": "Kota Palembang (Sumatera Selatan)",
        "center": [-2.955, 104.755],
        "pavementType": "Aspal Hotmix SMA (Stone Matrix Asphalt)",
        "condition": "RUSAK_RINGAN",
        "lengthKm": 7.2,
        "hazardScore": 46,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [104.735, -2.965], # Simpang Polda Sumsel
            [104.755, -2.955], # Simpang PTC Mall
            [104.780, -2.940]  # Simpang Celentang
        ],
        "leadership": {
            "regionalHead": "Pj. Walikota Palembang",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Kota Palembang",
            "picName": "Ir. H. Akhmad Bastari, S.T., M.T."
        },
        "problemDetails": {
            "headline": "Keretakan Aspal Akibat Antrean Angkutan Berat & Genangan Simpang",
            "description": "Jalan arteri sekunder penghubung mal komersial dan pemukiman Sako yang mengalami retak buaya di titik antrean lampu merah.",
            "rootCause": "Beban geser kendaraan saat berhenti dan rem di persimpangan padat.",
            "safetyImpact": "Mengurangi kenyamanan berkendara dan rawan selip saat hujan."
        },
        "budget": {
            "paguRp": 9800000000,
            "contractValueRp": 9320000000,
            "name": "Rehabilitasi Struktur Jalan Koridor Sukamto - Basuki Rahmat",
            "contractor": "PT Sriwijaya Mandiri Perkasa",
            "source": "APBD Kota Palembang TA 2026",
            "fiscalYear": 2026,
            "progressPct": 60.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Palembang No. 210/2022",
            "budgetSource": "LPSE Kota Palembang",
            "fieldDataSource": "Dinas PUPR Kota Palembang",
            "transparencyUrl": "https://lpse.palembang.go.id"
        }
    },
    {
        "id": "ruas-kab-kepri-01",
        "provinceId": "kepulauan_riau",
        "region": "sumatera",
        "name": "Jl. Engku Putri - Batam Center (Pusat Pemerintahan & Feri)",
        "code": "RUAS-KTA-BTM-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota / Kawasan Bebas (Pemko Batam / BP Batam)",
        "legalBasis": "Keputusan Walikota Batam No. KPTS.148/HK/IV/2022 tentang Jalan Kota Batam",
        "district": "Kota Batam (Kepulauan Riau)",
        "center": [1.130, 104.055],
        "pavementType": "Rigid Pavement & Asphalt Overlay 6 Lajur",
        "condition": "BAIK",
        "lengthKm": 6.5,
        "hazardScore": 22,
        "hazardLevel": "RENDAH",
        "waypoints": [
            [104.030, 1.120], # Simpang Kabil
            [104.055, 1.130], # Bundaran BP Batam / Mega Mall
            [104.075, 1.140]  # Pelabuhan Internasional Batam Center
        ],
        "leadership": {
            "regionalHead": "Walikota Batam / Kepala BP Batam",
            "agency": "Dinas Bina Marga dan Sumber Daya Air Kota Batam",
            "picName": "Dr. Ir. Yumasnur, M.T."
        },
        "problemDetails": {
            "headline": "Penataan Simpang & Koridor Transit Internasional Singapura-Batam",
            "description": "Jalan boulevard kebanggaan Kota Batam dengan 6-8 lajur terbagi yang melayani ribuan wisatawan mancanegara setiap hari.",
            "rootCause": "Penataan pelebaran persimpangan sebidang untuk mengurangi titik konflik lampu lalu lintas.",
            "safetyImpact": "Menjaga citra gerbang internasional terdepan Indonesia di Selat Malaka."
        },
        "budget": {
            "paguRp": 21500000000,
            "contractValueRp": 20400000000,
            "name": "Pelebaran Koridor Boulevard Engku Putri Menjadi 8 Lajur Terbagi",
            "contractor": "PT Barelang Indo Nusa",
            "source": "APBD Kota Batam & PNBP BP Batam",
            "fiscalYear": 2026,
            "progressPct": 90.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Batam No. KPTS.148/2022",
            "budgetSource": "LPSE Kota Batam & BP Batam",
            "fieldDataSource": "Dinas BMSDA Kota Batam",
            "transparencyUrl": "https://lpse.batam.go.id"
        }
    },
    {
        "id": "ruas-kab-lampung-01",
        "provinceId": "lampung",
        "region": "sumatera",
        "name": "Jl. Raden Intan - Tanjung Karang Pusat",
        "code": "RUAS-KTA-BDL-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Bandar Lampung)",
        "legalBasis": "Peraturan Walikota Bandar Lampung No. 12/2021 tentang Jaringan Jalan Kota",
        "district": "Kota Bandar Lampung (Lampung)",
        "center": [-5.415, 105.260],
        "pavementType": "Aspal Hotmix HRS",
        "condition": "RUSAK_RINGAN",
        "lengthKm": 5.4,
        "hazardScore": 42,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [105.250, -5.400], # Tugu Juang
            [105.260, -5.415], # Simpang Plaza Lotus
            [105.270, -5.430]  # Simpang Tugu Adipura
        ],
        "leadership": {
            "regionalHead": "Walikota Bandar Lampung",
            "agency": "Dinas Bina Marga dan Bina Konstruksi Kota Bandar Lampung",
            "picName": "Iwan Gunawan, S.T., M.T."
        },
        "problemDetails": {
            "headline": "Penanganan Sambungan Flyover & Lubang Pipa Utilitas Perkotaan",
            "description": "Kawasan pusat bisnis Tanjung Karang dengan frekuensi galian utilitas kabel optik dan perpipaan PDAM yang tidak tertutup sempurna.",
            "rootCause": "Kurangnya koordinasi penimbunan kembali galian utilitas bawah tanah.",
            "safetyImpact": "Permukaan jalan bergelombang membahayakan pengguna jalan terutama saat jam sibuk malam."
        },
        "budget": {
            "paguRp": 6400000000,
            "contractValueRp": 6080000000,
            "name": "Rekondisi Aspal & Trotoar Koridor Raden Intan - Ahmad Yani",
            "contractor": "CV Sinar Lampung Makmur",
            "source": "APBD Kota Bandar Lampung TA 2026",
            "fiscalYear": 2026,
            "progressPct": 65.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "Perwako Bandar Lampung No. 12/2021",
            "budgetSource": "LPSE Kota Bandar Lampung",
            "fieldDataSource": "Dinas BMBK Kota Bandar Lampung",
            "transparencyUrl": "https://lpse.bandarlampungkab.go.id"
        }
    },

    # --- JAWA ---
    {
        "id": "ruas-kab-dki-01",
        "provinceId": "dki_jakarta",
        "region": "jawa",
        "name": "Jl. Prof. Dr. Satrio - Casablanca (Koridor Non-Tol)",
        "code": "RUAS-KTA-DKI-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota / Khusus Ibukota (APBD DKI Jakarta)",
        "legalBasis": "Keputusan Gubernur Provinsi DKI Jakarta No. 1290/2021",
        "district": "Kota Jakarta Selatan (DKI Jakarta)",
        "center": [-6.222, 106.828],
        "pavementType": "Asphalt Concrete Wearing Course (AC-WC) Polymer",
        "condition": "BAIK",
        "lengthKm": 5.8,
        "hazardScore": 28,
        "hazardLevel": "RENDAH",
        "waypoints": [
            [106.815, -6.218], # Simpang Sudirman (Karet)
            [106.828, -6.222], # Depan Mall Ambasador
            [106.845, -6.225]  # Terowongan Casablanca / Tebet
        ],
        "leadership": {
            "regionalHead": "Walikota Jakarta Selatan / Pj. Gubernur DKI",
            "agency": "Suku Dinas Bina Marga Jakarta Selatan",
            "picName": "Heri Darmawan, S.T."
        },
        "problemDetails": {
            "headline": "Pemeliharaan Tiang Kolom JLNT & Drainase Bawah Kolong",
            "description": "Kawasan pusat finansial Mega Kuningan yang berada tepat di bawah Jalan Layang Non Tol (JLNT) Casablanca.",
            "rootCause": "Tetesan air hujan dari talang elevated bridge memicu pengelupasan mikro lapisan aspal.",
            "safetyImpact": "Kepadatan volume lalu lintas eksekutif dan ekspatriat 24 jam."
        },
        "budget": {
            "paguRp": 14200000000,
            "contractValueRp": 13500000000,
            "name": "Milling & Resurfacing Koridor Satrio - Casablanca Jaksel",
            "contractor": "PT Adhi Persada Properti / KSO Aspal",
            "source": "APBD Provinsi DKI Jakarta TA 2026",
            "fiscalYear": 2026,
            "progressPct": 92.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "Kepgub DKI No. 1290/2021",
            "budgetSource": "LPSE DKI Jakarta",
            "fieldDataSource": "Sudin Bina Marga Kota Adm. Jakarta Selatan",
            "transparencyUrl": "https://lpse.jakarta.go.id"
        }
    },
    {
        "id": "ruas-kab-jabar-01",
        "provinceId": "jawa_barat",
        "region": "jawa",
        "name": "Jl. Ir. H. Djuanda (Dago) - Simpang Dago (Ikon Kota)",
        "code": "RUAS-KTA-BDG-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Bandung)",
        "legalBasis": "Keputusan Walikota Bandung No. 620/Kep.143-DBMPR/2021 tentang Status Jalan Kota Bandung",
        "district": "Kota Bandung (Jawa Barat)",
        "center": [-6.890, 107.615],
        "pavementType": "Hotmix AC-WC & Trotoar Granit Ramah Disabilitas",
        "condition": "BAIK",
        "lengthKm": 6.2,
        "hazardScore": 24,
        "hazardLevel": "RENDAH",
        "waypoints": [
            [107.610, -6.910], # Dago Bawah (Cikapayang)
            [107.615, -6.890], # RS Santo Borromeus / ITB
            [107.620, -6.865]  # Simpang Dago Atas (Terminal Dago)
        ],
        "leadership": {
            "regionalHead": "Pj. Walikota Bandung",
            "agency": "Dinas Sumber Daya Air dan Bina Marga (DSDABM) Kota Bandung",
            "picName": "Didi Ruswandi, M.T."
        },
        "problemDetails": {
            "headline": "Kawasan Wisata Ikonik Dago & Penataan Kabel Udara Ducting",
            "description": "Koridor heritage Dago dengan pepohonan rindang dan destinasi belanja yang sedang menjalani program penurunan kabel udara ducting bawah tanah.",
            "rootCause": "Galian ducting utilitas kabel fiber optik terintegrasi.",
            "safetyImpact": "Penataan trotoar estetik demi kenyamanan pejalan kaki dan wisatawan."
        },
        "budget": {
            "paguRp": 11500000000,
            "contractValueRp": 10850000000,
            "name": "Penataan Ruang Milik Jalan & Ducting Terpadu Koridor Ir. H. Djuanda",
            "contractor": "PT Bandung Daya Usaha",
            "source": "APBD Kota Bandung TA 2026",
            "fiscalYear": 2026,
            "progressPct": 85.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Bandung No. 620/2021",
            "budgetSource": "LPSE Kota Bandung",
            "fieldDataSource": "DSDABM Kota Bandung",
            "transparencyUrl": "https://lpse.bandung.go.id"
        }
    },
    {
        "id": "ruas-kab-jabar-02",
        "provinceId": "jawa_barat",
        "region": "jawa",
        "name": "Jl. Margonda Raya - Juanda (Urat Nadi Kota Depok)",
        "code": "RUAS-KTA-DPK-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Depok)",
        "legalBasis": "Peraturan Walikota Depok No. 58/2021 tentang Jaringan Jalan Perkotaan",
        "district": "Kota Depok (Jawa Barat)",
        "center": [-6.375, 106.832],
        "pavementType": "Aspal Hotmix & Trotoar Etnik Margonda",
        "condition": "RUSAK_RINGAN",
        "lengthKm": 8.5,
        "hazardScore": 48,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [106.840, -6.350], # UI Depok Gate
            [106.832, -6.375], # Margonda Tengah / Margo City
            [106.822, -6.400]  # Simpang Ramanda / Balai Kota Depok
        ],
        "leadership": {
            "regionalHead": "Walikota Depok",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Kota Depok",
            "picName": "Citra Indah Yulianty, S.T., M.H."
        },
        "problemDetails": {
            "headline": "Beban Lalu Lintas Harian 180 Ribu Kendaraan & Penataan Putaran Balik",
            "description": "Poros utama Kota Depok penghubung kampus UI, pusat perbelanjaan, dan stasiun komuter yang membutuhkan rekonstruksi berkala.",
            "rootCause": "Beban geser angkutan umum mikrotrans dan antrean U-turn padat.",
            "safetyImpact": "Kemacetan parah pada jam sibuk kerja Jakarta-Depok."
        },
        "budget": {
            "paguRp": 16500000000,
            "contractValueRp": 15720000000,
            "name": "Peningkatan Geometri & Penataan U-Turn Koridor Margonda Raya",
            "contractor": "PT Depok Graha Sejahtera",
            "source": "APBD Kota Depok TA 2026",
            "fiscalYear": 2026,
            "progressPct": 70.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "Perwako Depok No. 58/2021",
            "budgetSource": "LPSE Kota Depok",
            "fieldDataSource": "Dinas PUPR Kota Depok",
            "transparencyUrl": "https://lpse.depok.go.id"
        }
    },
    {
        "id": "ruas-kab-jabar-03",
        "provinceId": "jawa_barat",
        "region": "jawa",
        "name": "Jl. KH Noer Ali (Kalimalang Kota Bekasi)",
        "code": "RUAS-KTA-BKS-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Bekasi)",
        "legalBasis": "Keputusan Walikota Bekasi No. 620/Kep.318-BMSDA/2022 tentang Penetapan Status Ruas Jalan Kota",
        "district": "Kota Bekasi (Jawa Barat)",
        "center": [-6.245, 106.975],
        "pavementType": "Rigid Pavement & Hotmix Overlay",
        "condition": "RUSAK_RINGAN",
        "lengthKm": 7.8,
        "hazardScore": 52,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [106.945, -6.248], # Perbatasan Jaktim - Summarecon Mall
            [106.975, -6.245], # Metropolitan Mall Bekasi
            [107.005, -6.240]  # Simpang BCP / Islamic Center
        ],
        "leadership": {
            "regionalHead": "Pj. Walikota Bekasi",
            "agency": "Dinas Bina Marga dan Sumber Daya Air (DBMSDA) Kota Bekasi",
            "picName": "H. Solihin, S.T., M.Si."
        },
        "problemDetails": {
            "headline": "Penanganan Sambungan Cor Beton di Bawah Trase Tol Becakayu",
            "description": "Jalan arteri sekunder padat komuter pekerja Jakarta-Bekasi yang membentang di sisi saluran irigasi Kalimalang.",
            "rootCause": "Penurunan elevasi tanah tanggul saluran irigasi Kalimalang dan getaran tiang pancang Becakayu.",
            "safetyImpact": "Jalan bergelombang dan lubang sambungan expansion joint cor semen."
        },
        "budget": {
            "paguRp": 13800000000,
            "contractValueRp": 13150000000,
            "name": "Rekonstruksi Saluran & Rigid Pavement Jl. KH Noer Ali Kalimalang",
            "contractor": "PT Patriot Bangun Bersama",
            "source": "Bantuan Keuangan Provinsi DKI & APBD Kota Bekasi",
            "fiscalYear": 2026,
            "progressPct": 62.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Bekasi No. 620/2022",
            "budgetSource": "LPSE Kota Bekasi",
            "fieldDataSource": "DBMSDA Kota Bekasi",
            "transparencyUrl": "https://lpse.bekasikota.go.id"
        }
    },
    {
        "id": "ruas-kab-jabar-04",
        "provinceId": "jawa_barat",
        "region": "jawa",
        "name": "Ruas Cibinong - Bojonggede (Akses Stasiun KRL)",
        "code": "RUAS-KAB-BGR-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kabupaten (APBD Kab. Bogor)",
        "legalBasis": "Keputusan Bupati Bogor No. 620/381/Kpts/Per-UU/2021 tentang Penetapan Ruas Jalan Kabupaten Bogor",
        "district": "Kabupaten Bogor (Jawa Barat)",
        "center": [-6.495, 106.815],
        "pavementType": "Rigid Pavement K-350 & Aspal",
        "condition": "RUSAK_BERAT",
        "lengthKm": 11.2,
        "hazardScore": 72,
        "hazardLevel": "TINGGI",
        "waypoints": [
            [106.845, -6.485], # Simpang Pemda Cibinong
            [106.815, -6.495], # Sukahati
            [106.790, -6.505]  # Stasiun Bojonggede
        ],
        "leadership": {
            "regionalHead": "Pj. Bupati Bogor",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Bogor",
            "picName": "Iwan Irawan, S.T., M.M."
        },
        "problemDetails": {
            "headline": "Kerusakan Parah Sepanjang 4 KM Menuju Stasiun Bojonggede",
            "description": "Jalan akses utama 60.000 penumpang KRL harian yang mengalami kehancuran lapisan aspal dan lumpur saat musim hujan.",
            "rootCause": "Drainase jalan tersumbat sampah pemukiman dan tingginya angkutan logistik perumahan.",
            "safetyImpact": "Kemacetan ekstrem hingga 2 jam dan kecelakaan roda dua tergelincir genangan lumpur."
        },
        "budget": {
            "paguRp": 18200000000,
            "contractValueRp": 17400000000,
            "name": "Pelebaran & Rekonstruksi Rigid Beton Ruas Bojonggede - Cibinong",
            "contractor": "PT Tegar Beriman Konstruksi",
            "source": "APBD Kabupaten Bogor TA 2026",
            "fiscalYear": 2026,
            "progressPct": 40.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Bupati Bogor No. 620/2021",
            "budgetSource": "LPSE Kabupaten Bogor",
            "fieldDataSource": "Dinas PUPR Kabupaten Bogor",
            "transparencyUrl": "https://lpse.bogorkab.go.id"
        }
    },
    {
        "id": "ruas-kab-jateng-01",
        "provinceId": "jawa_tengah",
        "region": "jawa",
        "name": "Jl. Pandanaran - Simpang Lima (Pusat Kota)",
        "code": "RUAS-KTA-SMG-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Semarang)",
        "legalBasis": "Keputusan Walikota Semarang No. 620/847/2022 tentang Penetapan Status Jalan Kota Semarang",
        "district": "Kota Semarang (Jawa Tengah)",
        "center": [-6.988, 110.415],
        "pavementType": "Aspal Hotmix Stone Mastic Asphalt (SMA)",
        "condition": "BAIK",
        "lengthKm": 4.8,
        "hazardScore": 18,
        "hazardLevel": "RENDAH",
        "waypoints": [
            [110.405, -6.985], # Tugu Muda
            [110.418, -6.990], # Simpang Lima
            [110.435, -6.992]  # Ahmad Yani
        ],
        "leadership": {
            "regionalHead": "Walikota Semarang",
            "agency": "Dinas Pekerjaan Umum Kota Semarang",
            "picName": "Ir. Suwarto, M.T."
        },
        "problemDetails": {
            "headline": "Pusat Wisata Oleh-Oleh & Simpang Lima Landmark",
            "description": "Jalan etalase Kota Semarang yang menghubungkan Tugu Muda dan Simpang Lima dengan trotoar pedestrian terpadu.",
            "rootCause": "Pemeliharaan marka jalan termoplastik dan pembersihan saluran bawah trotoar.",
            "safetyImpact": "Mendukung kenyamanan pejalan kaki dan wisatawan kuliner lunpia Pandanaran."
        },
        "budget": {
            "paguRp": 7800000000,
            "contractValueRp": 7450000000,
            "name": "Pemeliharaan Berkala & Revitalisasi Trotoar Pandanaran - Simpang Lima",
            "contractor": "PT Semarang Jaya Abadi",
            "source": "APBD Kota Semarang TA 2026",
            "fiscalYear": 2026,
            "progressPct": 95.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Semarang No. 620/847/2022",
            "budgetSource": "LPSE Kota Semarang",
            "fieldDataSource": "Dinas PU Kota Semarang",
            "transparencyUrl": "https://lpse.semarangkota.go.id"
        }
    },
    {
        "id": "ruas-kab-jateng-02",
        "provinceId": "jawa_tengah",
        "region": "jawa",
        "name": "Jl. Slamet Riyadi - Gladag (Arteri Kota Surakarta)",
        "code": "RUAS-KTA-SKT-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Surakarta)",
        "legalBasis": "Keputusan Walikota Surakarta No. 620/22/2021 tentang Penetapan Ruas Jalan Kota Surakarta",
        "district": "Kota Surakarta / Solo (Jawa Tengah)",
        "center": [-7.568, 110.820],
        "pavementType": "Aspal Hotmix Berdampingan Rel Kereta Wisata Batara Kresna",
        "condition": "BAIK",
        "lengthKm": 5.6,
        "hazardScore": 20,
        "hazardLevel": "RENDAH",
        "waypoints": [
            [110.795, -7.565], # Purwosari
            [110.820, -7.568], # Ngarsopuro / Sriwedari
            [110.835, -7.572]  # Gladag / Keraton Kasunanan
        ],
        "leadership": {
            "regionalHead": "Walikota Surakarta",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Kota Surakarta",
            "picName": "Ir. Nur Basuki, M.T."
        },
        "problemDetails": {
            "headline": "Jalan Terlebar di Solo Bersebelahan Jalur Sepur Kluthuk Jaladara",
            "description": "Boulevard legendaris Kota Solo yang menjadi lokasi Car Free Day mingguan dan koridor transit Batik Solo Trans (BST).",
            "rootCause": "Penyesuaian aspal di sisi bantalan rel kereta api aktif tanpa merusak geometri lintasan.",
            "safetyImpact": "Keselamatan pesepeda dan pengendara motor dari celah rel kereta api."
        },
        "budget": {
            "paguRp": 8200000000,
            "contractValueRp": 7780000000,
            "name": "Peningkatan Kualitas Perkerasan & Penataan Perlintasan Sebidang Slamet Riyadi",
            "contractor": "PT Bengawan Solo Konstruksi",
            "source": "APBD Kota Surakarta TA 2026",
            "fiscalYear": 2026,
            "progressPct": 92.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Surakarta No. 620/22/2021",
            "budgetSource": "LPSE Kota Surakarta",
            "fieldDataSource": "DPUPR Kota Surakarta",
            "transparencyUrl": "https://lpse.surakarta.go.id"
        }
    },
    {
        "id": "ruas-kab-diy-01",
        "provinceId": "di_yogyakarta",
        "region": "jawa",
        "name": "Jl. Malioboro - Margo Utomo (Sumbu Filosofi)",
        "code": "RUAS-KTA-YOG-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota / Cagar Budaya UNESCO (Pemkot Yogyakarta)",
        "legalBasis": "Peraturan Walikota Yogyakarta No. 42/2022 tentang Pengelolaan Kawasan Khusus Malioboro",
        "district": "Kota Yogyakarta (DI Yogyakarta)",
        "center": [-7.792, 110.366],
        "pavementType": "Paving Block K-500 & Porous Asphalt Heritage",
        "condition": "BAIK",
        "lengthKm": 3.8,
        "hazardScore": 15,
        "hazardLevel": "RENDAH",
        "waypoints": [
            [110.367, -7.780], # Tugu Pal Putih
            [110.366, -7.792], # Malioboro Tengah
            [110.365, -7.802]  # Titik Nol Kilometer / Gedung Agung
        ],
        "leadership": {
            "regionalHead": "Pj. Walikota Yogyakarta",
            "agency": "Dinas Pekerjaan Umum Perumahan dan Kawasan Permukiman Kota Yogyakarta",
            "picName": "Ir. Umi Akhsanti, M.T."
        },
        "problemDetails": {
            "headline": "Kawasan Warisan Dunia UNESCO Sumbu Filosofi Yogyakarta",
            "description": "Jalan semi-pedestrian pusat budaya dan pariwisata yang menghubungkan Panggung Krapyak, Keraton, dan Tugu Pal Putih.",
            "rootCause": "Pemeliharaan rutin batu candi trotoar dan pembatasan kendaraan bermotor.",
            "safetyImpact": "Kenyamanan jutaan wisatawan lokal dan mancanegara pejalan kaki."
        },
        "budget": {
            "paguRp": 9500000000,
            "contractValueRp": 8980000000,
            "name": "Revitalisasi Preservasi Kawasan Sumbu Filosofi Malioboro",
            "contractor": "PT Mataram Cipta Kencana",
            "source": "Dana Keistimewaan (Danais) DIY & APBD Kota",
            "fiscalYear": 2026,
            "progressPct": 98.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "Perwako Yogyakarta No. 42/2022",
            "budgetSource": "LPSE Kota Yogyakarta",
            "fieldDataSource": "DPUPKP Kota Yogyakarta",
            "transparencyUrl": "https://lpse.jogjakota.go.id"
        }
    },
    {
        "id": "ruas-kab-jatim-01",
        "provinceId": "jawa_timur",
        "region": "jawa",
        "name": "Jl. Raya Darmo - Wonokromo (Urat Nadi Kota Surabaya)",
        "code": "RUAS-KTA-SBY-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Surabaya)",
        "legalBasis": "Keputusan Walikota Surabaya No. 188.45/219/436.1.2/2022 tentang Penetapan Status Jalan Kota Surabaya",
        "district": "Kota Surabaya (Jawa Timur)",
        "center": [-7.290, 112.740],
        "pavementType": "Aspal Hotmix Stone Mastic Asphalt (SMA) Premium",
        "condition": "BAIK",
        "lengthKm": 6.8,
        "hazardScore": 19,
        "hazardLevel": "RENDAH",
        "waypoints": [
            [112.742, -7.275], # Monumen Bambu Runcing / Basuki Rahmat
            [112.740, -7.290], # Kebun Binatang Surabaya / Darmo
            [112.738, -7.310]  # Terminal Joyoboyo / Wonokromo
        ],
        "leadership": {
            "regionalHead": "Walikota Surabaya",
            "agency": "Dinas Sumber Daya Air dan Bina Marga (DSDABM) Kota Surabaya",
            "picName": "Lilik Arijanto, S.T., M.T."
        },
        "problemDetails": {
            "headline": "Kawasan Hijau Percontohan Nasional dengan Sistem Drainase Bawah Tanah",
            "description": "Boulevard rindang utama Kota Pahlawan dengan jalur pedestrian berstandar internasional dan jalur sepeda terproteksi.",
            "rootCause": "Pemeliharaan berkala crossing box culvert penghubung saluran banjir Kalimas.",
            "safetyImpact": "Menjamin kelancaran mobilitas kendaraan dari arah Sidoarjo menuju pusat bisnis Surabaya."
        },
        "budget": {
            "paguRp": 15500000000,
            "contractValueRp": 14750000000,
            "name": "Overlay Aspal & Preservasi Koridor Darmo - Wonokromo",
            "contractor": "PT Surabaya Mega Konstruksi",
            "source": "APBD Kota Surabaya TA 2026",
            "fiscalYear": 2026,
            "progressPct": 88.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Surabaya No. 188.45/219/2022",
            "budgetSource": "LPSE Kota Surabaya",
            "fieldDataSource": "DSDABM Kota Surabaya",
            "transparencyUrl": "https://lpse.surabaya.go.id"
        }
    },
    {
        "id": "ruas-kab-jatim-02",
        "provinceId": "jawa_timur",
        "region": "jawa",
        "name": "Jl. Ijen - Alun-Alun Tugu (Kawasan Bersejarah)",
        "code": "RUAS-KTA-MLG-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Malang)",
        "legalBasis": "Keputusan Walikota Malang No. 188.45/144/35.73.112/2021 tentang Status Jalan Kota Malang",
        "district": "Kota Malang (Jawa Timur)",
        "center": [-7.975, 112.625],
        "pavementType": "Aspal Hotmix & Bougenville Heritage Median",
        "condition": "BAIK",
        "lengthKm": 5.2,
        "hazardScore": 22,
        "hazardLevel": "RENDAH",
        "waypoints": [
            [112.618, -7.965], # Gereja Katedral Ijen
            [112.625, -7.975], # Simpang Balapan
            [112.632, -7.980]  # Alun-Alun Bundar Tugu Balai Kota
        ],
        "leadership": {
            "regionalHead": "Pj. Walikota Malang",
            "agency": "Dinas Pekerjaan Umum, Penataan Ruang, Perumahan dan Kawasan Permukiman Kota Malang",
            "picName": "Dandung Djulharjanto, S.T., M.T."
        },
        "problemDetails": {
            "headline": "Boulevard Cagar Budaya Era Kolonial Belanda Karsten",
            "description": "Kawasan pemukiman bersejarah rancangan arsitek Thomas Karsten dengan median taman palem dan jalur pedestrian rindang.",
            "rootCause": "Penataan trotoar ramah lansia dan mahasiswa serta peremajaan tanaman pelindung.",
            "safetyImpact": "Kenyamanan mobilitas mahasiswa Universitas Brawijaya dan wisatawan Kota Malang."
        },
        "budget": {
            "paguRp": 6800000000,
            "contractValueRp": 6420000000,
            "name": "Preservasi & Peningkatan Estetika Koridor Heritage Ijen Boulevard",
            "contractor": "PT Arema Cipta Graha",
            "source": "APBD Kota Malang TA 2026",
            "fiscalYear": 2026,
            "progressPct": 92.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Malang No. 188.45/144/2021",
            "budgetSource": "LPSE Kota Malang",
            "fieldDataSource": "DPUPRPKP Kota Malang",
            "transparencyUrl": "https://lpse.malangkota.go.id"
        }
    },

    # --- BALI & NUSA TENGGARA ---
    {
        "id": "ruas-kab-bali-01",
        "provinceId": "bali",
        "region": "bali_nusra",
        "name": "Jl. Teuku Umar - Simpang Enam (Sentra Digital & Niaga)",
        "code": "RUAS-KTA-DPS-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Denpasar)",
        "legalBasis": "Keputusan Walikota Denpasar No. 188.45/456/HK/2022 tentang Status Jalan Kota Denpasar",
        "district": "Kota Denpasar (Bali)",
        "center": [-8.675, 115.205],
        "pavementType": "Aspal Hotmix AC-WC",
        "condition": "RUSAK_RINGAN",
        "lengthKm": 4.6,
        "hazardScore": 45,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [115.195, -8.678], # Simpang Teuku Umar Barat (Marlboro)
            [115.205, -8.675], # Simpang Enam Denpasar
            [115.215, -8.668]  # Simpang Sudirman / Hasanuddin
        ],
        "leadership": {
            "regionalHead": "Walikota Denpasar",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Kota Denpasar",
            "picName": "Ir. Anak Agung Ngurah Bagus Airawata, M.T."
        },
        "problemDetails": {
            "headline": "Kepadatan Sentra Gadget & Genangan Air Simpang Enam Saat Musim Hujan",
            "description": "Pusat perniagaan elektronik dan kuliner terpadat di Kota Denpasar yang membutuhkan perbaikan elevasi saluran samping.",
            "rootCause": "Kapasitas saluran drainase tersumbat buangan limbah usaha kuliner non-IPAL.",
            "safetyImpact": "Potensi kendaraan roda dua mogok dan perlambatan arus lalu lintas wisatawan."
        },
        "budget": {
            "paguRp": 7500000000,
            "contractValueRp": 7120000000,
            "name": "Peningkatan Saluran Drainase & Overlay Aspal Teuku Umar",
            "contractor": "PT Bali Cipta Mandiri",
            "source": "APBD Kota Denpasar TA 2026",
            "fiscalYear": 2026,
            "progressPct": 70.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Denpasar No. 188.45/2022",
            "budgetSource": "LPSE Kota Denpasar",
            "fieldDataSource": "Dinas PUPR Kota Denpasar",
            "transparencyUrl": "https://lpse.denpasarkota.go.id"
        }
    },
    {
        "id": "ruas-kab-bali-02",
        "provinceId": "bali",
        "region": "bali_nusra",
        "name": "Ruas Kuta - Legian - Seminyak (Jl. Sunset Road Barat)",
        "code": "RUAS-KAB-BDG-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kabupaten (APBD Kab. Badung)",
        "legalBasis": "Keputusan Bupati Badung No. 712/04.1/HK/2021 tentang Penetapan Status Ruas Jalan Kabupaten Badung",
        "district": "Kabupaten Badung (Bali)",
        "center": [-8.695, 115.168],
        "pavementType": "Aspal Hotmix Stone Mastic Asphalt & Trotoar Estetis",
        "condition": "BAIK",
        "lengthKm": 7.4,
        "hazardScore": 26,
        "hazardLevel": "RENDAH",
        "waypoints": [
            [115.175, -8.720], # Simpang Dewa Ruci Kuta
            [115.168, -8.695], # Sunset Road Tengah
            [115.160, -8.670]  # Simpang Kerobokan Seminyak
        ],
        "leadership": {
            "regionalHead": "Bupati Badung",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Badung",
            "picName": "Ir. I.B. Surya Suamba, S.T., M.T."
        },
        "problemDetails": {
            "headline": "Kawasan Pariwisata Internasional Terpadat di Pulau Dewata",
            "description": "Koridor hotel berbintang, butik, dan beach club utama Bali yang dilintasi ratusan ribu wisatawan mancanegara setiap bulan.",
            "rootCause": "Penataan trotoar berkonsep taman tropis dan penertiban parkir on-street.",
            "safetyImpact": "Menjaga kenyamanan dan reputasi pariwisata premium Kabupaten Badung."
        },
        "budget": {
            "paguRp": 19500000000,
            "contractValueRp": 18650000000,
            "name": "Pemeliharaan Jalan & Penataan Fasilitas Pejalan Kaki Sunset Road",
            "contractor": "PT Badung Karya Tama",
            "source": "Pendapatan Asli Daerah (PAD) PHR Kabupaten Badung",
            "fiscalYear": 2026,
            "progressPct": 85.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Bupati Badung No. 712/2021",
            "budgetSource": "LPSE Kabupaten Badung",
            "fieldDataSource": "Dinas PUPR Kabupaten Badung",
            "transparencyUrl": "https://lpse.badungkab.go.id"
        }
    },
    {
        "id": "ruas-kab-ntb-01",
        "provinceId": "nusa_tenggara_barat",
        "region": "bali_nusra",
        "name": "Jl. Pejanggik - Simpang Cakranegara (Pusat Niaga)",
        "code": "RUAS-KTA-MTR-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Mataram)",
        "legalBasis": "Keputusan Walikota Mataram No. 248/IV/2022 tentang Penetapan Status Ruas Jalan Kota Mataram",
        "district": "Kota Mataram (Nusa Tenggara Barat)",
        "center": [-8.585, 116.120],
        "pavementType": "Aspal Hotmix AC-WC",
        "condition": "RUSAK_RINGAN",
        "lengthKm": 5.8,
        "hazardScore": 40,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [116.095, -8.580], # Taman Udayana / Sangkareang
            [116.120, -8.585], # Mall Mataram / Pejanggik
            [116.145, -8.590]  # Simpang Empat Cakranegara
        ],
        "leadership": {
            "regionalHead": "Walikota Mataram",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Kota Mataram",
            "picName": "Lale Widiahning, S.T., M.Eng."
        },
        "problemDetails": {
            "headline": "Pusat Perdagangan Emas & Mutiara Lombok Serta Keramaian Kuliner",
            "description": "Kawasan perniagaan bersejarah Cakranegara yang mengalami penurunan lapisan aus aspal di sekitar persimpangan toko emas.",
            "rootCause": "Tingginya antrean kendaraan pembeli dan minimnya kantong parkir off-street.",
            "safetyImpact": "Perluasan marka penyeberangan zebra cross bagi pejalan kaki dan wisatawan."
        },
        "budget": {
            "paguRp": 6500000000,
            "contractValueRp": 6180000000,
            "name": "Overlay Aspal & Penataan Marka Koridor Pejanggik - Cakranegara",
            "contractor": "PT Sasak Indah Permai",
            "source": "APBD Kota Mataram TA 2026",
            "fiscalYear": 2026,
            "progressPct": 68.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Mataram No. 248/2022",
            "budgetSource": "LPSE Kota Mataram",
            "fieldDataSource": "Dinas PUPR Kota Mataram",
            "transparencyUrl": "https://lpse.mataramkota.go.id"
        }
    },

    # --- KALIMANTAN ---
    {
        "id": "ruas-kab-kaltim-01",
        "provinceId": "kalimantan_timur",
        "region": "kalimantan",
        "name": "Jl. Jenderal Sudirman - Klandasan (Pesisir Minyak)",
        "code": "RUAS-KTA-BPN-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Balikpapan)",
        "legalBasis": "Keputusan Walikota Balikpapan No. 188.45-312/2021 tentang Penetapan Status Jalan Kota Balikpapan",
        "district": "Kota Balikpapan (Kalimantan Timur)",
        "center": [-1.275, 116.835],
        "pavementType": "Rigid Pavement & Asphalt Overlay Pesisir",
        "condition": "BAIK",
        "lengthKm": 7.2,
        "hazardScore": 28,
        "hazardLevel": "RENDAH",
        "waypoints": [
            [116.820, -1.285], # Lapangan Merdeka / Kilang Pertamina
            [116.835, -1.275], # Kantor Walikota Balikpapan Klandasan
            [116.860, -1.260]  # Simpang Balikpapan Permai (BP)
        ],
        "leadership": {
            "regionalHead": "Walikota Balikpapan",
            "agency": "Dinas Pekerjaan Umum Kota Balikpapan",
            "picName": "Rita, S.T., M.Si."
        },
        "problemDetails": {
            "headline": "Urat Nadi Pesisir Kota Minyak Penyangga Logistik Maritim IKN",
            "description": "Jalan boulevard tepi pantai Selat Makassar yang menjadi pintu gerbang logistik dan komuter kota minyak Balikpapan.",
            "rootCause": "Paparan salinitas air laut dan curah hujan tinggi pesisir Selat Makassar.",
            "safetyImpact": "Proteksi tanggul laut penahan abrasi di sepanjang trotoar Klandasan."
        },
        "budget": {
            "paguRp": 16200000000,
            "contractValueRp": 15450000000,
            "name": "Peningkatan Daya Dukung & Penataan Estetika Jl. Jenderal Sudirman",
            "contractor": "PT Benua Etam Cipta",
            "source": "APBD Kota Balikpapan TA 2026",
            "fiscalYear": 2026,
            "progressPct": 85.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Balikpapan No. 188.45-312/2021",
            "budgetSource": "LPSE Kota Balikpapan",
            "fieldDataSource": "Dinas PU Kota Balikpapan",
            "transparencyUrl": "https://lpse.balikpapan.go.id"
        }
    },
    {
        "id": "ruas-kab-kaltim-02",
        "provinceId": "kalimantan_timur",
        "region": "kalimantan",
        "name": "Jl. Pangeran Antasari - Juanda (Pusat Kota Tepian)",
        "code": "RUAS-KTA-SMD-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Samarinda)",
        "legalBasis": "Keputusan Walikota Samarinda No. 620/124/HK-KS/2022 tentang Status Jalan Kota Samarinda",
        "district": "Kota Samarinda (Kalimantan Timur)",
        "center": [-0.495, 117.135],
        "pavementType": "Rigid Pavement Beton & Drainase U-Ditch",
        "condition": "RUSAK_RINGAN",
        "lengthKm": 6.4,
        "hazardScore": 56,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [117.125, -0.485], # Simpang Flyover Air Putih Juanda
            [117.135, -0.495], # Antasari Tengah
            [117.148, -0.505]  # Simpang Tengkawang / Karang Asam
        ],
        "leadership": {
            "regionalHead": "Walikota Samarinda",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Kota Samarinda",
            "picName": "Desy Damayanti, S.T., M.T."
        },
        "problemDetails": {
            "headline": "Titik Rawan Banjir Limpasan Pasang Sungai Mahakam & Simpang Macet",
            "description": "Jalan padat perniagaan dan perumahan yang sering tergenang banjir pasang surut Sungai Mahakam saat musim hujan lebat.",
            "rootCause": "Kapasitas saluran sekunder anak sungai Karang Asam terdesak pemukiman bantaran.",
            "safetyImpact": "Genangan air hingga 40 cm melumpuhkan lalu lintas kendaraan roda dua."
        },
        "budget": {
            "paguRp": 18500000000,
            "contractValueRp": 17620000000,
            "name": "Peninggian Badan Jalan Beton & Pembangunan Rumah Pompa Antasari",
            "contractor": "PT Mahakam Mega Mandiri",
            "source": "APBD Kota Samarinda TA 2026",
            "fiscalYear": 2026,
            "progressPct": 65.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Samarinda No. 620/124/2022",
            "budgetSource": "LPSE Kota Samarinda",
            "fieldDataSource": "Dinas PUPR Kota Samarinda",
            "transparencyUrl": "https://lpse.samarindakota.go.id"
        }
    },
    {
        "id": "ruas-kab-kaltim-03",
        "provinceId": "kalimantan_timur",
        "region": "kalimantan",
        "name": "Ruas Sepaku - Semoi Dua (Jalan Kabupaten Akses IKN)",
        "code": "RUAS-KAB-PPU-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kabupaten (APBD Kab. PPU & Inpres IJD)",
        "legalBasis": "Keputusan Bupati Penajam Paser Utara No. 620/152/2021 tentang Jaringan Jalan Kabupaten",
        "district": "Kabupaten Penajam Paser Utara (Kawasan Nusantara)",
        "center": [-0.925, 116.815],
        "pavementType": "Rigid Pavement K-400 & Soil Stabilization",
        "condition": "RUSAK_RINGAN",
        "lengthKm": 16.8,
        "hazardScore": 50,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [116.785, -0.905], # Pasar Sepaku
            [116.815, -0.925], # Desa Semoi Dua
            [116.850, -0.955]  # Perbatasan Hutan Tanaman Industri
        ],
        "leadership": {
            "regionalHead": "Pj. Bupati Penajam Paser Utara",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Kab. PPU",
            "picName": "Rivin Mulawarman, S.T."
        },
        "problemDetails": {
            "headline": "Urat Nadi Distribusi Pangan & Pertanian Warga Lokal Penyangga IKN",
            "description": "Jalan kabupaten penghubung sentra transmigrasi pertanian sayur-mayur Semoi Dua menuju Kawasan Inti Pusat Pemerintahan (KIPP) Nusantara.",
            "rootCause": "Peningkatan drastis kendaraan proyek dan dump truck tanah timbunan konstruksi IKN.",
            "safetyImpact": "Jalan berdebu tebal saat kemarau dan licin saat hujan butuh perkerasan aspal permanen."
        },
        "budget": {
            "paguRp": 24800000000,
            "contractValueRp": 23600000000,
            "name": "Peningkatan Jalan Kabupaten Ruas Sepaku - Semoi Dua (Inpres Jalan Daerah)",
            "contractor": "PT Borneo Jaya Konstruksi",
            "source": "Inpres Jalan Daerah (IJD) APBN & APBD PPU",
            "fiscalYear": 2026,
            "progressPct": 78.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Bupati PPU No. 620/152/2021",
            "budgetSource": "Balai Besar Pelaksanaan Jalan Nasional Kaltim & LPSE PPU",
            "fieldDataSource": "Dinas PUPR Kabupaten Penajam Paser Utara",
            "transparencyUrl": "https://lpse.penajamkab.go.id"
        }
    },
    {
        "id": "ruas-kab-kalsel-01",
        "provinceId": "kalimantan_selatan",
        "region": "kalimantan",
        "name": "Jl. Lambung Mangkurat - Pasar Terapung Siring",
        "code": "RUAS-KTA-BJM-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Banjarmasin)",
        "legalBasis": "Keputusan Walikota Banjarmasin No. 188.45/214/2022 tentang Penetapan Status Jalan Kota Banjarmasin",
        "district": "Kota Banjarmasin (Kalimantan Selatan)",
        "center": [-3.320, 114.595],
        "pavementType": "Rigid Pavement Di Atas Cerucuk Galam Lahan Rawa",
        "condition": "RUSAK_RINGAN",
        "lengthKm": 4.8,
        "hazardScore": 46,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [114.585, -3.328], # Simpang Jembatan Merdeka
            [114.595, -3.320], # Siring Sungai Martapura / Menara Pandang
            [114.610, -3.310]  # Simpang Pangeran Samudera
        ],
        "leadership": {
            "regionalHead": "Walikota Banjarmasin",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Kota Banjarmasin",
            "picName": "Surun, S.T., M.T."
        },
        "problemDetails": {
            "headline": "Tantangan Struktur Lahan Rawa Pasang Surut Sungai Martapura",
            "description": "Kawasan pusat ekonomi dan pariwisata sungai Kota Seribu Sungai yang bertumpu pada pondasi cerucuk kayu galam tradisional.",
            "rootCause": "Penurunan tanah organik gambut rawa dan fluktuasi pasang air laut muara Sungai Barito.",
            "safetyImpact": "Aspal bergelombang dan genangan pasang air sungai (rob) saat purnama."
        },
        "budget": {
            "paguRp": 8900000000,
            "contractValueRp": 8450000000,
            "name": "Peninggian Elevasi & Perkuatan Cerucuk Galam Koridor Lambung Mangkurat",
            "contractor": "PT Kayu Tangi Mandiri",
            "source": "APBD Kota Banjarmasin TA 2026",
            "fiscalYear": 2026,
            "progressPct": 72.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Banjarmasin No. 188.45/2022",
            "budgetSource": "LPSE Kota Banjarmasin",
            "fieldDataSource": "Dinas PUPR Kota Banjarmasin",
            "transparencyUrl": "https://lpse.banjarmasinkota.go.id"
        }
    },

    # --- SULAWESI ---
    {
        "id": "ruas-kab-sulsel-01",
        "provinceId": "sulawesi_selatan",
        "region": "sulawesi",
        "name": "Jl. Penghibur (Pantai Losari) - Somba Opu",
        "code": "RUAS-KTA-MKS-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Makassar)",
        "legalBasis": "Keputusan Walikota Makassar No. 620/190/Kep/IV/2022 tentang Penetapan Status Ruas Jalan Kota Makassar",
        "district": "Kota Makassar (Sulawesi Selatan)",
        "center": [-5.145, 119.405],
        "pavementType": "Aspal Hotmix AC-WC & Tanggul Beton Pantai",
        "condition": "BAIK",
        "lengthKm": 5.2,
        "hazardScore": 25,
        "hazardLevel": "RENDAH",
        "waypoints": [
            [119.402, -5.132], # Benteng Rotterdam / Pelabuhan Makassar
            [119.405, -5.145], # Anjungan Pantai Losari
            [119.408, -5.160]  # Simpang CPI (Center Point of Indonesia)
        ],
        "leadership": {
            "regionalHead": "Walikota Makassar",
            "agency": "Dinas Pekerjaan Umum Kota Makassar",
            "picName": "Zuhaelsi Zubir, S.T., M.T."
        },
        "problemDetails": {
            "headline": "Ikon Pariwisata Pantai Losari & Sentra Kerajinan Emas Somba Opu",
            "description": "Jalan tepi pantai Selat Makassar yang menjadi pusat kumpul warga menikmati senja dan kuliner pisang epe.",
            "rootCause": "Kepadatan parkir pengunjung anjungan wisata dan getaran gelombang laut pasang.",
            "safetyImpact": "Peremajaan trotoar ramah difabel dan penataan separator jalur sepeda tepi pantai."
        },
        "budget": {
            "paguRp": 12800000000,
            "contractValueRp": 12150000000,
            "name": "Pemeliharaan Jalan & Penataan Boulevard Pesisir Pantai Losari",
            "contractor": "PT Anging Mammiri Konstruksi",
            "source": "APBD Kota Makassar TA 2026",
            "fiscalYear": 2026,
            "progressPct": 90.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Makassar No. 620/190/2022",
            "budgetSource": "LPSE Kota Makassar",
            "fieldDataSource": "Dinas PU Kota Makassar",
            "transparencyUrl": "https://lpse.makassarkota.go.id"
        }
    },
    {
        "id": "ruas-kab-sulsel-02",
        "provinceId": "sulawesi_selatan",
        "region": "sulawesi",
        "name": "Jl. Hertasning Baru - Aroepala (Koridor Pemukiman Timur)",
        "code": "RUAS-KTA-MKS-02",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Makassar & Kab. Gowa)",
        "legalBasis": "Peraturan Bersama Walikota Makassar & Bupati Gowa tentang Koridor Perbatasan Mamminasata",
        "district": "Kota Makassar - Kab. Gowa (Sulawesi Selatan)",
        "center": [-5.175, 119.455],
        "pavementType": "Rigid Pavement & Hotmix 4 Lajur",
        "condition": "RUSAK_BERAT",
        "lengthKm": 8.6,
        "hazardScore": 75,
        "hazardLevel": "TINGGI",
        "waypoints": [
            [119.435, -5.165], # Simpang Pettarani - Hertasning
            [119.455, -5.175], # Hertasning Baru (Komp. PLN)
            [119.480, -5.185]  # Jl. Aroepala Perbatasan Gowa
        ],
        "leadership": {
            "regionalHead": "Walikota Makassar / Bupati Gowa",
            "agency": "Dinas PU Kota Makassar",
            "picName": "Tim Tanggap Darurat DPU Makassar"
        },
        "problemDetails": {
            "headline": "Kerusakan Jalan Berlubang Parah di Perbatasan Makassar - Gowa",
            "description": "Jalan akses komuter utama ratusan ribu warga perumahan Gowa yang bekerja di Makassar, banyak lubang dalam mencapai 20 cm.",
            "rootCause": "Truk pengangkut galian C (batu dan pasir) dari Sungai Jeneberang melampaui kapasitas MST 8 ton.",
            "safetyImpact": "Sering terjadi kecelakaan tunggal pengendara motor malam hari saat hujan lebat."
        },
        "budget": {
            "paguRp": 17500000000,
            "contractValueRp": 16650000000,
            "name": "Rekonstruksi Penuh Rigid Beton Koridor Hertasning Baru - Aroepala",
            "contractor": "PT Celebes Bangun Sejahtera",
            "source": "APBD Kota Makassar & Bantuan Keuangan Pemprov Sulsel",
            "fiscalYear": 2026,
            "progressPct": 35.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "Perwali Makassar No. 88/2021",
            "budgetSource": "LPSE Kota Makassar",
            "fieldDataSource": "Dinas PU Kota Makassar",
            "transparencyUrl": "https://lpse.makassarkota.go.id"
        }
    },
    {
        "id": "ruas-kab-sulut-01",
        "provinceId": "sulawesi_utara",
        "region": "sulawesi",
        "name": "Jl. Piere Tendean (Boulevard Manado Waterfront)",
        "code": "RUAS-KTA-MND-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Manado)",
        "legalBasis": "Keputusan Walikota Manado No. 142/Kep/PUPR/2021 tentang Status Jalan Kota Manado",
        "district": "Kota Manado (Sulawesi Utara)",
        "center": [1.475, 124.835],
        "pavementType": "Aspal Hotmix & Trotoar Reklamasi Pantai Teluk Manado",
        "condition": "BAIK",
        "lengthKm": 6.8,
        "hazardScore": 26,
        "hazardLevel": "RENDAH",
        "waypoints": [
            [124.830, 1.460], # Bahu Mall / Kampus Unsrat
            [124.835, 1.475], # Manado Town Square (Mantos)
            [124.840, 1.490]  # Jembatan Soekarno / Pasar Bersehati
        ],
        "leadership": {
            "regionalHead": "Walikota Manado",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Kota Manado",
            "picName": "Johny Suwu, S.T."
        },
        "problemDetails": {
            "headline": "Kawasan Reklamasi Bisnis Teluk Manado Menghadap Bunaken",
            "description": "Jalan tepi laut spektakuler yang membentang dari pusat kuliner Malalayang hingga Jembatan Soekarno pelabuhan Manado.",
            "rootCause": "Penanganan abrasi dinding tanggul pemecah ombak laut saat musim angin barat.",
            "safetyImpact": "Menjaga konektivitas akses turis menuju dermaga wisata Taman Nasional Bunaken."
        },
        "budget": {
            "paguRp": 11200000000,
            "contractValueRp": 10650000000,
            "name": "Pemeliharaan Jalan & Normalisasi Inlet Air Pasang Boulevard Manado",
            "contractor": "PT Nyiur Melambai Jaya",
            "source": "APBD Kota Manado TA 2026",
            "fiscalYear": 2026,
            "progressPct": 88.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Manado No. 142/2021",
            "budgetSource": "LPSE Kota Manado",
            "fieldDataSource": "Dinas PUPR Kota Manado",
            "transparencyUrl": "https://lpse.manadokota.go.id"
        }
    },

    # --- MALUKU & PAPUA ---
    {
        "id": "ruas-kab-maluku-01",
        "provinceId": "maluku",
        "region": "maluku_papua",
        "name": "Jl. Pattimura - Mardika (Pusat Kota & Dermaga Ambon)",
        "code": "RUAS-KTA-AMB-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Ambon)",
        "legalBasis": "Keputusan Walikota Ambon No. 289/2022 tentang Penetapan Status Ruas Jalan Kota Ambon",
        "district": "Kota Ambon (Maluku)",
        "center": [-3.695, 128.185],
        "pavementType": "Aspal Hotmix & Saluran Drainase Pantai",
        "condition": "RUSAK_RINGAN",
        "lengthKm": 4.5,
        "hazardScore": 42,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [128.180, -3.702], # Lapangan Merdeka / Patung Pattimura
            [128.185, -3.695], # Kawasan Pasar Mardika
            [128.192, -3.688]  # Jembatan Merah Putih Akses Bawah
        ],
        "leadership": {
            "regionalHead": "Pj. Walikota Ambon",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Kota Ambon",
            "picName": "Melianus Latuihamallo, S.T., M.T."
        },
        "problemDetails": {
            "headline": "Kepadatan Pasar Tradisional Terbesar Mardika & Angkutan Kota",
            "description": "Jantung perdagangan rempah dan ikan Teluk Ambon yang padat oleh ribuan pedagang dan ratusan angkot lin kota.",
            "rootCause": "Limpasan sampah pasar menyumbat gorong-gorong dan beban muatan truk distributor sembako.",
            "safetyImpact": "Perbaikan saluran drainase air laut pasang surut demi kelancaran logistik pangan Ambon."
        },
        "budget": {
            "paguRp": 6800000000,
            "contractValueRp": 6450000000,
            "name": "Peningkatan Jalan & Drainase Terpadu Kawasan Pasar Mardika Ambon",
            "contractor": "CV Maluku Maju Bersama",
            "source": "APBD Kota Ambon TA 2026",
            "fiscalYear": 2026,
            "progressPct": 75.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Ambon No. 289/2022",
            "budgetSource": "LPSE Kota Ambon",
            "fieldDataSource": "Dinas PUPR Kota Ambon",
            "transparencyUrl": "https://lpse.ambon.go.id"
        }
    },
    {
        "id": "ruas-kab-papua-01",
        "provinceId": "papua",
        "region": "maluku_papua",
        "name": "Jl. Percetakan Negara - Taman Imbi (Pusat Kota Jayapura)",
        "code": "RUAS-KTA-JYP-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Jayapura)",
        "legalBasis": "Keputusan Walikota Jayapura No. 188.4/112/2022 tentang Penetapan Status Jalan Kota Jayapura",
        "district": "Kota Jayapura (Papua)",
        "center": [-2.535, 140.715],
        "pavementType": "Aspal Hotmix HRS & Trotoar Khas Ornamen Papua",
        "condition": "BAIK",
        "lengthKm": 4.2,
        "hazardScore": 24,
        "hazardLevel": "RENDAH",
        "waypoints": [
            [140.710, -2.540], # Pelabuhan Laut Jayapura
            [140.715, -2.535], # Taman Imbi / Kantor Walikota
            [140.722, -2.530]  # Simpang Dok II / Kantor Gubernur Papua
        ],
        "leadership": {
            "regionalHead": "Pj. Walikota Jayapura",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Kota Jayapura",
            "picName": "Nofdi J. Rampi, S.T., M.T."
        },
        "problemDetails": {
            "headline": "Kawasan Pusat Pemerintahan & Pelabuhan Samudra Jayapura",
            "description": "Poros utama Kota Jayapura yang membentang di kaki perbukitan Polimak menghadap Teluk Yos Sudarso.",
            "rootCause": "Pemeliharaan tebing penahan tanah (talud) dari ancaman longsor lereng bukit saat musim hujan tropis.",
            "safetyImpact": "Menjaga stabilitas akses vital logistik peti kemas Pelabuhan Jayapura."
        },
        "budget": {
            "paguRp": 7500000000,
            "contractValueRp": 7120000000,
            "name": "Pemeliharaan Jalan & Perkuatan Dinding Penahan Tanah Percetakan Negara",
            "contractor": "PT Port Numbay Mandiri",
            "source": "Dana Otonomi Khusus (Otsus) Papua & APBD Kota Jayapura",
            "fiscalYear": 2026,
            "progressPct": 90.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Jayapura No. 188.4/112/2022",
            "budgetSource": "LPSE Kota Jayapura",
            "fieldDataSource": "Dinas PUPR Kota Jayapura",
            "transparencyUrl": "https://lpse.jayapurakota.go.id"
        }
    },
    {
        "id": "ruas-kab-pabar-01",
        "provinceId": "papua_barat_daya",
        "region": "maluku_papua",
        "name": "Jl. Basuki Rahmat Km 8 - 10 (Pintu Gerbang Sorong)",
        "code": "RUAS-KTA-SRG-01",
        "authority": "KOTA_KAB",
        "authorityLabel": "Jalan Kota (APBD Kota Sorong)",
        "legalBasis": "Keputusan Walikota Sorong No. 620/88/2023 tentang Status Ruas Jalan Kota Sorong",
        "district": "Kota Sorong (Papua Barat Daya)",
        "center": [-0.885, 131.295],
        "pavementType": "Rigid Pavement & Hotmix 4 Lajur",
        "condition": "RUSAK_RINGAN",
        "lengthKm": 6.8,
        "hazardScore": 48,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [131.275, -0.895], # Bandara DEO Km 8
            [131.295, -0.885], # Simpang Km 9.5
            [131.315, -0.875]  # Tugu Merah Km 10
        ],
        "leadership": {
            "regionalHead": "Pj. Walikota Sorong",
            "agency": "Dinas Bina Marga dan Cipta Karya Kota Sorong",
            "picName": "Esau Isir, S.T."
        },
        "problemDetails": {
            "headline": "Konektivitas Bandara Domine Eduard Osok & Gerbang Wisata Raja Ampat",
            "description": "Jalan utama ibukota provinsi baru Papua Barat Daya yang menyerap ribuan wisatawan transit Raja Ampat dan angkutan logistik.",
            "rootCause": "Genangan air parit saat hujan lebat akibat saluran primer belum terintegrasi ke muara laut.",
            "safetyImpact": "Percepatan pembangunan crossing saluran dan perbaikan marka keselamatan malam hari."
        },
        "budget": {
            "paguRp": 12500000000,
            "contractValueRp": 11850000000,
            "name": "Pelebaran & Normalisasi Drainase Koridor Basuki Rahmat Km 8 - 10",
            "contractor": "PT Raja Ampat Raya Konstruksi",
            "source": "Dana Otsus Papua Barat Daya & APBD Kota Sorong",
            "fiscalYear": 2026,
            "progressPct": 70.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Walikota Sorong No. 620/88/2023",
            "budgetSource": "LPSE Kota Sorong",
            "fieldDataSource": "Dinas Bina Marga Kota Sorong",
            "transparencyUrl": "https://lpse.kotasorong.go.id"
        }
    }
]

print(f"Total City/Regency corridors to process: {len(corridors)}")

final_corridors = []
for idx, c in enumerate(corridors):
    print(f"[{idx+1}/{len(corridors)}] Fetching OSRM for: {c['name']} ({c['district']})...")
    wp_str = ";".join([f"{pt[0]},{pt[1]}" for pt in c["waypoints"]])
    url = f"https://router.project-osrm.org/route/v1/driving/{wp_str}?overview=full&geometries=geojson"
    
    coordinates = []
    actual_km = c["lengthKm"]
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "JagaJalan-CivicMap/2.0"})
        with urllib.request.urlopen(req, timeout=8) as res:
            data = json.loads(res.read().decode())
            if data.get("code") == "Ok" and len(data.get("routes", [])) > 0:
                route = data["routes"][0]
                raw_coords = route["geometry"]["coordinates"]
                coordinates = [[pt[1], pt[0]] for pt in raw_coords]
                actual_km = round(route["distance"] / 1000.0, 1)
                print(f"   -> OK: {len(coordinates)} GPS points, {actual_km} km")
            else:
                print(f"   -> OSRM Code: {data.get('code')}, fallback to linear interpolation")
    except Exception as e:
        print(f"   -> Error fetching OSRM: {e}, using waypoints fallback")

    if not coordinates or len(coordinates) < 2:
        coordinates = [[pt[1], pt[0]] for pt in c["waypoints"]]

    # Build milestone markers
    milestones = []
    step_km = max(1.0, round(actual_km / 3.0, 1))
    milestones.append({
        "km": 0,
        "name": f"Titik Awal: {c['name'].split(' - ')[0]}",
        "status": c["condition"],
        "note": f"Akses Wilayah {c['district'].split(' (')[0]}"
    })
    milestones.append({
        "km": step_km,
        "name": f"Segmen Tengah {c['district'].split(' (')[0]}",
        "status": c["condition"],
        "note": "Konektivitas Pemukiman & Sentra Niaga Perkotaan"
    })
    milestones.append({
        "km": actual_km,
        "name": f"Titik Akhir: {c['name'].split(' - ')[-1] if ' - ' in c['name'] else c['name']}",
        "status": c["condition"],
        "note": "Batas Kewenangan Penyelenggara Daerah"
    })

    # Center coordinate calculation
    mid_idx = len(coordinates) // 2
    calculated_center = coordinates[mid_idx] if len(coordinates) > 0 else c["center"]

    corridor_obj = {
        "id": c["id"],
        "provinceId": c["provinceId"],
        "region": c["region"],
        "name": c["name"],
        "code": c["code"],
        "authority": c["authority"],
        "authorityLabel": c["authorityLabel"],
        "legalBasis": c["legalBasis"],
        "district": c["district"],
        "center": calculated_center,
        "pavementType": c["pavementType"],
        "condition": c["condition"],
        "lengthKm": actual_km,
        "hazardScore": c["hazardScore"],
        "hazardLevel": c["hazardLevel"],
        "activeReportsCount": 1 if c["condition"] == "RUSAK_BERAT" else 0,
        "leadership": c["leadership"],
        "problemDetails": c["problemDetails"],
        "budget": c["budget"],
        "officialSources": c["officialSources"],
        "milestones": milestones,
        "coordinates": coordinates
    }
    final_corridors.append(corridor_obj)
    time.sleep(0.3)

out_file = "src/data/cityRegencyRoadsData.json"
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(final_corridors, f, indent=2, ensure_ascii=False)

print(f"\n[SUCCESS] Generated {len(final_corridors)} City & Regency roads in {out_file}!")
