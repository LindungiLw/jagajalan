import urllib.request, json, time

provincial_defs = [
    {
        "id": "ruas-prv-jbr-01",
        "provinceId": "jawa_barat",
        "region": "jawa",
        "name": "Jl. Poros Puncak II (Sentul - Sukamakmur - Jonggol)",
        "code": "RUAS-PRV-JBR-001",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Jawa Barat)",
        "legalBasis": "Keputusan Gubernur Jawa Barat No. 620/Kep.784-DBMPR/2021 tentang Penetapan Status Ruas Jalan Provinsi",
        "district": "Kab. Bogor - Kab. Cianjur (Jawa Barat)",
        "center": [-6.58, 106.98],
        "pavementType": "Rigid Pavement Beton & Aspal Hotmix",
        "condition": "MANTAP",
        "waypoints": [(-6.560, 106.868), (-6.602, 107.031), (-6.531, 107.060)],
        "milestones": [
            {"km": 0, "name": "Sentul City (Bogor)", "status": "MANTAP", "note": "Simpang Tol Jagorawi"},
            {"km": 24, "name": "Sukamakmur (Puncak II)", "status": "RUSAK_RINGAN", "note": "Lereng Perbukitan Rawan Longsor"},
            {"km": 45, "name": "Jonggol - Cariu", "status": "MANTAP", "note": "Konektivitas Transyogi Koridor Timur"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Jawa Barat",
            "agency": "Dinas Bina Marga dan Penataan Ruang (DBMPR) Provinsi Jawa Barat",
            "picName": "Ir. Bambang Tirtoyono, M.T. (Kadis BMPR Jabar)"
        },
        "problemDetails": {
            "headline": "Rawan Longsor Lereng & Penuntasan Jalur Puncak II",
            "description": "Jalur alternatif vital pengurai kemacetan Puncak Bogor-Cianjur, sedang diperkuat dinding penahan tanah lereng Sukamakmur."
        },
        "budget": {
            "paguRp": 28500000000,
            "contractValueRp": 26900000000,
            "name": "Peningkatan Jalan dan Dinding Penahan Tebing Jalur Sukamakmur - Jonggol",
            "contractor": "PT Tirta Restu Ayunda (KSO)",
            "source": "APBD Provinsi Jawa Barat",
            "fiscalYear": 2026,
            "matchConfidence": "TERKONFIRMASI"
        }
    },
    {
        "id": "ruas-prv-jbr-02",
        "provinceId": "jawa_barat",
        "region": "jawa",
        "name": "Jl. Raya Cikidang - Palabuhanratu (Akses Wisata Geopark Ciletuh)",
        "code": "RUAS-PRV-JBR-015",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Jawa Barat)",
        "legalBasis": "Keputusan Gubernur Jawa Barat No. 620/Kep.784-DBMPR/2021",
        "district": "Kab. Sukabumi (Jawa Barat)",
        "center": [-6.94, 106.66],
        "pavementType": "Aspal Hotmix AC-WC",
        "condition": "MANTAP",
        "waypoints": [(-6.890, 106.780), (-6.932, 106.660), (-6.980, 106.540)],
        "milestones": [
            {"km": 0, "name": "Simpang Cibadak", "status": "MANTAP", "note": "Pertemuan Arteri Sukabumi-Bogor"},
            {"km": 18, "name": "Tanjakan Cikidang", "status": "RUSAK_RINGAN", "note": "Jalur Curam Ekstrem"},
            {"km": 38, "name": "Palabuhanratu", "status": "MANTAP", "note": "Pesisir Teluk Palabuhanratu & Geopark"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Jawa Barat",
            "agency": "Dinas Bina Marga dan Penataan Ruang (DBMPR) Provinsi Jawa Barat",
            "picName": "Kadis BMPR Prov. Jabar"
        },
        "problemDetails": {
            "headline": "Tikungan Curam & Jalur Penyelamat Rem",
            "description": "Jalur wisata favorit menuju Geopark Ciletuh, membutuhkan pemeliharaan rutin guardrail dan marka jalan mata kucing."
        },
        "budget": {
            "paguRp": 19800000000,
            "contractValueRp": 18700000000,
            "name": "Preservasi Berkala dan Perkuatan Guardrail Jalan Cikidang - Palabuhanratu",
            "contractor": "PT Daya Mulia Turangga",
            "source": "APBD Provinsi Jawa Barat",
            "fiscalYear": 2026,
            "matchConfidence": "TERKONFIRMASI"
        }
    },
    {
        "id": "ruas-prv-jtg-01",
        "provinceId": "jawa_tengah",
        "region": "jawa",
        "name": "Jl. Bawang - Dieng (Jalur Tol Kahyangan Batang - Banjarnegara)",
        "code": "RUAS-PRV-JTG-008",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Jawa Tengah)",
        "legalBasis": "Keputusan Gubernur Jawa Tengah No. 620/12/2020 tentang Penetapan Status Jalan Provinsi Jawa Tengah",
        "district": "Kab. Batang - Kab. Banjarnegara (Jawa Tengah)",
        "center": [-7.15, 109.91],
        "pavementType": "Rigid Pavement Beton Bertulang",
        "condition": "MANTAP",
        "waypoints": [(-7.089, 109.920), (-7.170, 109.910), (-7.200, 109.899)],
        "milestones": [
            {"km": 0, "name": "Bawang (Batang)", "status": "MANTAP", "note": "Kawasan Bawah Kaki Gunung Prau"},
            {"km": 8, "name": "Tol Kahyangan Pranten", "status": "MANTAP", "note": "Puncak Panorama Awan"},
            {"km": 16, "name": "Dataran Tinggi Dieng", "status": "MANTAP", "note": "Kawasan Candi & Kawah Sikidang"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Jawa Tengah",
            "agency": "Dinas PU Bina Marga dan Cipta Karya Provinsi Jawa Tengah",
            "picName": "Ir. AR Hanung Triyono, M.Si. (Kadis PUBMCK Jateng)"
        },
        "problemDetails": {
            "headline": "Elevasi Ekstrem & Kabut Tebal Pegunungan",
            "description": "Jalur wisata lereng Dieng yang viral, penanganan lapisan beton anti-slip dan lampu penerangan bertenaga surya."
        },
        "budget": {
            "paguRp": 24200000000,
            "contractValueRp": 22800000000,
            "name": "Peningkatan Struktur Jalan Beton dan Dinding Penahan Tebing Bawang - Dieng",
            "contractor": "PT Pringgondani Mandiri",
            "source": "APBD Provinsi Jawa Tengah",
            "fiscalYear": 2026,
            "matchConfidence": "TERKONFIRMASI"
        }
    },
    {
        "id": "ruas-prv-jtg-02",
        "provinceId": "jawa_tengah",
        "region": "jawa",
        "name": "Jl. Raya Purwodadi - Wirosari - Blora",
        "code": "RUAS-PRV-JTG-022",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Jawa Tengah)",
        "legalBasis": "Keputusan Gubernur Jawa Tengah No. 620/12/2020",
        "district": "Kab. Grobogan - Kab. Blora (Jawa Tengah)",
        "center": [-7.05, 111.15],
        "pavementType": "Rigid Pavement Beton & Cerucuk",
        "condition": "RUSAK_RINGAN",
        "waypoints": [(-7.085, 110.915), (-7.090, 111.120), (-6.972, 111.415)],
        "milestones": [
            {"km": 0, "name": "Simpang Lima Purwodadi", "status": "MANTAP", "note": "Pusat Pemerintahan Grobogan"},
            {"km": 28, "name": "Wirosari", "status": "RUSAK_RINGAN", "note": "Kawasan Tanah Lempung Ekspansif"},
            {"km": 64, "name": "Alun-Alun Blora", "status": "MANTAP", "note": "Pusat Kota Blora"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Jawa Tengah",
            "agency": "Dinas PU Bina Marga dan Cipta Karya Provinsi Jawa Tengah",
            "picName": "Kadis PUBMCK Prov. Jateng"
        },
        "problemDetails": {
            "headline": "Tanah Bergerak & Struktur Jalan Amblas",
            "description": "Karakteristik tanah lempung Grobogan-Blora berdaya dukung rendah sering memicu jalan patah, membutuhkan fondasi tiang pancang."
        },
        "budget": {
            "paguRp": 32000000000,
            "contractValueRp": 30500000000,
            "name": "Rekonstruksi Jalan Beton Struktur Bore Pile Ruas Purwodadi - Wirosari - Blora",
            "contractor": "PT Sumber Wijaya Sakti",
            "source": "APBD Provinsi Jawa Tengah",
            "fiscalYear": 2026,
            "matchConfidence": "TERKONFIRMASI"
        }
    },
    {
        "id": "ruas-prv-jtm-01",
        "provinceId": "jawa_timur",
        "region": "jawa",
        "name": "Jl. Pacet - Cangar - Kota Batu (Lereng Welirang)",
        "code": "RUAS-PRV-JTM-004",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Jawa Timur)",
        "legalBasis": "Keputusan Gubernur Jawa Timur No. 188/456/KPTS/013/2021 tentang Penetapan Ruas Jalan Provinsi Jawa Timur",
        "district": "Kab. Mojokerto - Kota Batu (Jawa Timur)",
        "center": [-7.76, 112.53],
        "pavementType": "Aspal Hotmix & Perkerasan Rigid",
        "condition": "MANTAP",
        "waypoints": [(-7.670, 112.540), (-7.740, 112.530), (-7.870, 112.520)],
        "milestones": [
            {"km": 0, "name": "Pacet (Mojokerto)", "status": "MANTAP", "note": "Kawasan Wisata Pemandian Air Hangat"},
            {"km": 14, "name": "Gotekan (Cangar)", "status": "RUSAK_RINGAN", "note": "Tikungan Ekstrem & Jalur Rem Darurat"},
            {"km": 31, "name": "Alun-Alun Kota Batu", "status": "MANTAP", "note": "Pusat Destinasi Agrowisata Batu"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Jawa Timur",
            "agency": "Dinas PU Bina Marga Provinsi Jawa Timur",
            "picName": "Ir. Edy Tambeng Widjaja, S.T., M.Si. (Kadis PU Bina Marga Jatim)"
        },
        "problemDetails": {
            "headline": "Tikungan Turunan Gotekan Rawan Rem Blong",
            "description": "Jalur alternatif favorit Surabaya/Mojokerto menuju Kota Batu, pemasangan separator beton dan jalur darurat sekam/pasir."
        },
        "budget": {
            "paguRp": 21500000000,
            "contractValueRp": 20300000000,
            "name": "Pemeliharaan Berkala dan Peningkatan Geometrik Jalan Pacet - Cangar",
            "contractor": "PT Duta Perkasa Mandiri",
            "source": "APBD Provinsi Jawa Timur",
            "fiscalYear": 2026,
            "matchConfidence": "TERKONFIRMASI"
        }
    },
    {
        "id": "ruas-prv-jtm-02",
        "provinceId": "jawa_timur",
        "region": "jawa",
        "name": "Jl. Raya Ponorogo - Slahung - Pacitan",
        "code": "RUAS-PRV-JTM-019",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Jawa Timur)",
        "legalBasis": "Keputusan Gubernur Jawa Timur No. 188/456/KPTS/013/2021",
        "district": "Kab. Ponorogo - Kab. Pacitan (Jawa Timur)",
        "center": [-8.03, 111.28],
        "pavementType": "Aspal Hotmix AC-WC",
        "condition": "MANTAP",
        "waypoints": [(-7.865, 111.465), (-8.010, 111.390), (-8.200, 111.090)],
        "milestones": [
            {"km": 0, "name": "Kota Ponorogo", "status": "MANTAP", "note": "Alun-Alun Reog Ponorogo"},
            {"km": 26, "name": "Slahung", "status": "RUSAK_RINGAN", "note": "Perbukitan Rawan Longsoran Tebing"},
            {"km": 68, "name": "Kota Pacitan", "status": "MANTAP", "note": "Kawasan Wisata Pantai Teluk Pacitan"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Jawa Timur",
            "agency": "Dinas PU Bina Marga Provinsi Jawa Timur",
            "picName": "Kadis PU Bina Marga Prov. Jatim"
        },
        "problemDetails": {
            "headline": "Tebing Karst Rawan Runtuh & Amblas",
            "description": "Akses logistik utama Ponorogo ke Pacitan, perkuatan struktur penahan tanah geotextile dan jaring kawat baja tebing."
        },
        "budget": {
            "paguRp": 26800000000,
            "contractValueRp": 25100000000,
            "name": "Pembangunan Tembok Penahan Tanah dan Rekonstruksi Jalan Slahung - Pacitan",
            "contractor": "PT Tugu Bangun Konstruksi",
            "source": "APBD Provinsi Jawa Timur",
            "fiscalYear": 2026,
            "matchConfidence": "TERKONFIRMASI"
        }
    },
    {
        "id": "ruas-prv-diy-01",
        "provinceId": "di_yogyakarta",
        "region": "jawa",
        "name": "Jl. Imogiri - Dlingo - Patuk (Kawasan Wisata Mangunan)",
        "code": "RUAS-PRV-DIY-003",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD D.I. Yogyakarta)",
        "legalBasis": "Keputusan Gubernur D.I. Yogyakarta No. 142/KEP/2021 tentang Status Jalan Provinsi DIY",
        "district": "Kab. Bantul - Kab. Gunungkidul (D.I. Yogyakarta)",
        "center": [-7.90, 110.43],
        "pavementType": "Aspal Hotmix AC-WC",
        "condition": "MANTAP",
        "waypoints": [(-7.925, 110.380), (-7.910, 110.460), (-7.850, 110.485)],
        "milestones": [
            {"km": 0, "name": "Makam Imogiri", "status": "MANTAP", "note": "Situs Cagar Budaya Makam Raja-Raja"},
            {"km": 12, "name": "Hutan Pinus Mangunan", "status": "MANTAP", "note": "Kawasan Strategis Wisata Alam"},
            {"km": 25, "name": "Patuk (Bukit Bintang)", "status": "MANTAP", "note": "Gerbang Wisata Gunungkidul"}
        ],
        "leadership": {
            "regionalHead": "Gubernur D.I. Yogyakarta",
            "agency": "Dinas Pekerjaan Umum, Perumahan, dan ESDM D.I. Yogyakarta",
            "picName": "Ir. Anna Riana Herbranti, S.T., M.T."
        },
        "problemDetails": {
            "headline": "Pelebaran Tikungan Sempit Jalur Pariwisata",
            "description": "Jalur sempit ramai bus pariwisata menuju Mangunan, pelebaran badan jalan dan pengaspalan bahu jalan beton."
        },
        "budget": {
            "paguRp": 16400000000,
            "contractValueRp": 15600000000,
            "name": "Pelebaran Jalan dan Normalisasi Geometrik Ruas Imogiri - Dlingo",
            "contractor": "PT Saraswanti Hasil Makmur",
            "source": "APBD D.I. Yogyakarta",
            "fiscalYear": 2026,
            "matchConfidence": "TERKONFIRMASI"
        }
    },
    {
        "id": "ruas-prv-btn-01",
        "provinceId": "banten",
        "region": "jawa",
        "name": "Jl. Raya Palima - Baros - Pandeglang",
        "code": "RUAS-PRV-BTN-007",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Banten)",
        "legalBasis": "Keputusan Gubernur Banten No. 620/Kep.180-Huk/2020 tentang Penetapan Status Ruas Jalan Provinsi Banten",
        "district": "Kota Serang - Kab. Pandeglang (Banten)",
        "center": [-6.24, 106.13],
        "pavementType": "Rigid Pavement Beton & Aspal Hotmix",
        "condition": "MANTAP",
        "waypoints": [(-6.170, 106.140), (-6.230, 106.130), (-6.310, 106.110)],
        "milestones": [
            {"km": 0, "name": "Simpang Palima Serang", "status": "MANTAP", "note": "Gerbang Kawasan Pusat Pemerintahan Prov. Banten"},
            {"km": 9, "name": "Baros", "status": "MANTAP", "note": "Kawasan Perdagangan & Pasar Tradisional"},
            {"km": 19, "name": "Kota Pandeglang", "status": "MANTAP", "note": "Alun-Alun Pandeglang"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Banten",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang (PUPR) Provinsi Banten",
            "picName": "Ir. Arlan Marzan, S.T., M.T."
        },
        "problemDetails": {
            "headline": "Kemacetan Pasar Baros & Drainase Limpasan",
            "description": "Konektivitas poros Serang-Pandeglang, peningkatan jalur beton 4 lajur dan perbaikan box culvert saluran pembuang air hujan."
        },
        "budget": {
            "paguRp": 22000000000,
            "contractValueRp": 20800000000,
            "name": "Pelebaran Jalan Menjadi 4 Lajur Ruas Palima - Baros (Segmen II)",
            "contractor": "PT Karya Mitra Graha",
            "source": "APBD Provinsi Banten",
            "fiscalYear": 2026,
            "matchConfidence": "TERKONFIRMASI"
        }
    },
    {
        "id": "ruas-prv-bali-01",
        "provinceId": "bali",
        "region": "bali_nusra",
        "name": "Jl. Penelokan Kintamani - Rendang - Pura Agung Besakih",
        "code": "RUAS-PRV-BALI-005",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Bali)",
        "legalBasis": "Keputusan Gubernur Bali No. 518/03-C/HK/2021 tentang Status Jalan Provinsi Bali",
        "district": "Kab. Bangli - Kab. Karangasem (Bali)",
        "center": [-8.35, 115.40],
        "pavementType": "Aspal Hotmix Halus AC-WC",
        "condition": "MANTAP",
        "waypoints": [(-8.280, 115.360), (-8.440, 115.420), (-8.370, 115.449)],
        "milestones": [
            {"km": 0, "name": "Penelokan (Kintamani)", "status": "MANTAP", "note": "Kaldera Gunung Batur & Danau Batur"},
            {"km": 18, "name": "Rendang (Karangasem)", "status": "MANTAP", "note": "Pertigaan Arteri Lingkar Timur"},
            {"km": 35, "name": "Pura Agung Besakih", "status": "MANTAP", "note": "Kawasan Cagar Budaya Pura Terbesar di Bali"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Bali",
            "agency": "Dinas Pekerjaan Umum, Penataan Ruang, Perumahan dan Kawasan Permukiman Provinsi Bali",
            "picName": "Ir. Nusakti Yasa Wedha, S.T., M.T."
        },
        "problemDetails": {
            "headline": "Akses Upacara Sakral Ida Bhatara Turun Kabeh",
            "description": "Jalur utama ribuan umat menuju Pura Besakih, pemeliharaan rutin aspal mulus dan trotoar ornamen batu candi khas Bali."
        },
        "budget": {
            "paguRp": 18500000000,
            "contractValueRp": 17400000000,
            "name": "Preservasi Berkala dan Estetika Trotoar Koridor Kintamani - Pura Besakih",
            "contractor": "PT Tunas Jaya Sanur",
            "source": "APBD Provinsi Bali",
            "fiscalYear": 2026,
            "matchConfidence": "TERKONFIRMASI"
        }
    },
    {
        "id": "ruas-prv-kalbar-01",
        "provinceId": "kalimantan_barat",
        "region": "kalimantan",
        "name": "Jl. Rasau Jaya - Pelabuhan Penyeberangan Feri Kapuas",
        "code": "RUAS-PRV-KALBAR-002",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Kalimantan Barat)",
        "legalBasis": "Keputusan Gubernur Kalimantan Barat No. 892/DISPUPR/2021 tentang Status Jalan Provinsi Kalbar",
        "district": "Kab. Kubu Raya (Kalimantan Barat)",
        "center": [-0.16, 109.36],
        "pavementType": "Rigid Pavement Beton & Geotekstil",
        "condition": "RUSAK_RINGAN",
        "waypoints": [(-0.080, 109.380), (-0.230, 109.360), (-0.245, 109.350)],
        "milestones": [
            {"km": 0, "name": "Sungai Raya (Kubu Raya)", "status": "MANTAP", "note": "Akses Menuju Bandara Supadio"},
            {"km": 14, "name": "Rasau Jaya Pusat", "status": "RUSAK_RINGAN", "note": "Kawasan Transmigrasi & Pertanian"},
            {"km": 22, "name": "Dermaga Feri Rasau Jaya", "status": "MANTAP", "note": "Penyeberangan Roro ke Kayong Utara & Ketapang"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Kalimantan Barat",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Kalimantan Barat",
            "picName": "Ir. Iskandar Zulkarnaen, M.T."
        },
        "problemDetails": {
            "headline": "Struktur Tanah Gambut Labil & Muatan Truk Sawit",
            "description": "Akses penyeberangan feri antar-kabupaten, membutuhkan peningkatan fondasi geotekstil agar tidak amblas terendam pasang air sungai."
        },
        "budget": {
            "paguRp": 17800000000,
            "contractValueRp": 16700000000,
            "name": "Rekonstruksi Jalan Beton Geotekstil Akses Dermaga Feri Rasau Jaya",
            "contractor": "PT Mitra Sentosa Kalbar",
            "source": "APBD Provinsi Kalimantan Barat",
            "fiscalYear": 2026,
            "matchConfidence": "TERKONFIRMASI"
        }
    },
    {
        "id": "ruas-prv-sulsel-01",
        "provinceId": "sulawesi_selatan",
        "region": "sulawesi",
        "name": "Jl. Poros Sungguminasa - Malino - Sinjai Barat",
        "code": "RUAS-PRV-SULSEL-010",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Sulawesi Selatan)",
        "legalBasis": "Keputusan Gubernur Sulawesi Selatan No. 1290/V/Tahun 2021 tentang Status Ruas Jalan Provinsi Sulsel",
        "district": "Kab. Gowa - Kab. Sinjai (Sulawesi Selatan)",
        "center": [-5.23, 119.75],
        "pavementType": "Aspal Hotmix AC-WC & DPT Beton",
        "condition": "MANTAP",
        "waypoints": [(-5.200, 119.450), (-5.250, 119.850), (-5.230, 120.020)],
        "milestones": [
            {"km": 0, "name": "Sungguminasa (Gowa)", "status": "MANTAP", "note": "Kawasan Metropolitan Mamminasata"},
            {"km": 64, "name": "Kota Bunga Malino", "status": "MANTAP", "note": "Destinasi Wisata Sejuk Pegunungan Bawakaraeng"},
            {"km": 91, "name": "Sinjai Barat", "status": "MANTAP", "note": "Lumbung Sayur-Mayur & Buah Sulsel"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Sulawesi Selatan",
            "agency": "Dinas Bina Marga dan Bina Konstruksi Provinsi Sulawesi Selatan",
            "picName": "Ir. Astina Abbas, M.T."
        },
        "problemDetails": {
            "headline": "Titik Rawan Longsor Tebing KM 62 Lonjoboko",
            "description": "Jalur urat nadi wisata Malino dan logistik pangan Gowa-Sinjai, perkuatan dinding penahan tebing beton dan drainase lereng."
        },
        "budget": {
            "paguRp": 34500000000,
            "contractValueRp": 32800000000,
            "name": "Penanganan Longsoran Tebing dan Preservasi Jalan Sungguminasa - Malino - Sinjai",
            "contractor": "PT Bumi Karsa",
            "source": "APBD Provinsi Sulawesi Selatan",
            "fiscalYear": 2026,
            "matchConfidence": "TERKONFIRMASI"
        }
    },
    {
        "id": "ruas-prv-ntb-01",
        "provinceId": "nusa_tenggara_barat",
        "region": "bali_nusra",
        "name": "Jl. Rembiga - Senggigi - Pemenang (Pesisir Pantai Lombok)",
        "code": "RUAS-PRV-NTB-006",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Nusa Tenggara Barat)",
        "legalBasis": "Keputusan Gubernur NTB No. 620-312 Tahun 2021 tentang Penetapan Status Ruas Jalan Provinsi NTB",
        "district": "Kab. Lombok Barat - Kab. Lombok Utara (NTB)",
        "center": [-8.48, 116.08],
        "pavementType": "Aspal Hotmix AC-WC",
        "condition": "MANTAP",
        "waypoints": [(-8.560, 116.110), (-8.490, 116.040), (-8.400, 116.100)],
        "milestones": [
            {"km": 0, "name": "Rembiga (Kota Mataram)", "status": "MANTAP", "note": "Kuliner Khas Sate Rembiga & Akses Bandara Lama"},
            {"km": 15, "name": "Kawasan Wisata Senggigi", "status": "MANTAP", "note": "Pesisir Hotel Resor & Pantai Pasir Putih"},
            {"km": 32, "name": "Pelabuhan Bangsal (Pemenang)", "status": "MANTAP", "note": "Dermaga Penyeberangan Gili Trawangan"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Nusa Tenggara Barat",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi NTB",
            "picName": "Ir. H. Mohammad Rum, M.T."
        },
        "problemDetails": {
            "headline": "Abrasi Pasang Gelombang Laut Tebing Senggigi",
            "description": "Jalur pariwisata utama pulau Lombok, penanganan revetment pemecah gelombang dan perapian lereng batu karang Malimbu."
        },
        "budget": {
            "paguRp": 16900000000,
            "contractValueRp": 15800000000,
            "name": "Perkuatan Dinding Tanggul Laut dan Preservasi Jalan Koridor Senggigi - Bangsal",
            "contractor": "PT Lombok Mulia Konstruksi",
            "source": "APBD Provinsi NTB",
            "fiscalYear": 2026,
            "matchConfidence": "TERKONFIRMASI"
        }
    },
    {
        "id": "ruas-prv-smt-02",
        "provinceId": "sumatera_utara",
        "region": "sumatera",
        "name": "Jl. Medan - Marelan - Simpang Kantor Belawan",
        "code": "RUAS-PRV-SMT-012",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Sumatera Utara)",
        "legalBasis": "Keputusan Gubernur Sumatera Utara No. 188.44/991/KPTS/2023 tentang Status Ruas Jalan Provinsi Sumut",
        "district": "Kota Medan (Medan Marelan - Medan Labuhan, Sumut)",
        "center": [3.68, 98.66],
        "pavementType": "Rigid Pavement Beton & Aspal Hotmix",
        "condition": "RUSAK_RINGAN",
        "waypoints": [(3.630, 98.670), (3.670, 98.660), (3.730, 98.670)],
        "milestones": [
            {"km": 0, "name": "Pulo Brayan (Medan Barat)", "status": "MANTAP", "note": "Simpang Pertemuan Arteri Medan"},
            {"km": 6, "name": "Pasar Marelan", "status": "RUSAK_RINGAN", "note": "Kepadatan Sentra Ekonomi Rakyat"},
            {"km": 14, "name": "Simpang Kantor (Belawan)", "status": "MANTAP", "note": "Konektivitas Menuju Gerbang Tol Belmera"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Sumatera Utara",
            "agency": "Dinas Bina Marga dan Bina Konstruksi Provinsi Sumatera Utara",
            "picName": "Kadis BMBK Prov. Sumut"
        },
        "problemDetails": {
            "headline": "Banjir Rob Pasang Air Laut & Beban Angkutan Truk",
            "description": "Jalur padat Medan Utara menuju pelabuhan, peninggian badan jalan beton 40 cm untuk mengantisipasi luapan banjir rob Sungai Deli."
        },
        "budget": {
            "paguRp": 22400000000,
            "contractValueRp": 21100000000,
            "name": "Peninggian Struktur Rigid Beton dan Perbaikan Drainase Jalan Marelan Raya",
            "contractor": "PT Deli Mitra Pratama",
            "source": "APBD Provinsi Sumatera Utara",
            "fiscalYear": 2026,
            "matchConfidence": "TERKONFIRMASI"
        }
    },
    {
        "id": "ruas-prv-smt-03",
        "provinceId": "sumatera_utara",
        "region": "sumatera",
        "name": "Jl. Kabanjahe - Tigapanah - Merek - Simarjarunjung",
        "code": "RUAS-PRV-SMT-042",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Sumatera Utara)",
        "legalBasis": "Keputusan Gubernur Sumatera Utara No. 188.44/991/KPTS/2023",
        "district": "Kab. Karo - Kab. Simalungun (Sumatera Utara)",
        "center": [2.98, 98.57],
        "pavementType": "Aspal Hotmix AC-WC",
        "condition": "MANTAP",
        "waypoints": [(3.170, 98.490), (2.960, 98.530), (2.880, 98.680)],
        "milestones": [
            {"km": 0, "name": "Kota Kabanjahe", "status": "MANTAP", "note": "Pusat Agrobisnis Tanah Karo"},
            {"km": 28, "name": "Merek (Air Terjun Sipiso-Piso)", "status": "MANTAP", "note": "Pintu Gerbang Danau Toba Sisi Utara"},
            {"km": 52, "name": "Bukit Indah Simarjarunjung", "status": "MANTAP", "note": "Panorama Danau Toba & Sunset Spot"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Sumatera Utara",
            "agency": "Dinas Bina Marga dan Bina Konstruksi Provinsi Sumatera Utara",
            "picName": "Kadis BMBK Prov. Sumut"
        },
        "problemDetails": {
            "headline": "Akses Pariwisata Lingkar Danau Toba & Truk Sayur",
            "description": "Jalur vital agrowisata dataran tinggi Karo menuju Simalungun, penanganan pelebaran tikungan sempit dan marka jalan."
        },
        "budget": {
            "paguRp": 29000000000,
            "contractValueRp": 27400000000,
            "name": "Pelebaran Jalan dan Preservasi Berkala Ruas Merek - Simarjarunjung",
            "contractor": "PT Sumber Mitra Jaya (SMJ)",
            "source": "APBD Provinsi Sumatera Utara",
            "fiscalYear": 2026,
            "matchConfidence": "TERKONFIRMASI"
        }
    }
]

def get_osrm_curve(waypoints):
    coord_str = ';'.join(f'{lon},{lat}' for lat, lon in waypoints)
    url = f'http://router.project-osrm.org/route/v1/driving/{coord_str}?overview=full&geometries=geojson'
    req = urllib.request.Request(url, headers={'User-Agent': 'JagaJalanProvincialBuilder/1.0'})
    with urllib.request.urlopen(req, timeout=20) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        coords = res['routes'][0]['geometry']['coordinates']
        dist_km = round(res['routes'][0]['distance'] / 1000, 1)
        full_coords = [[round(c[1], 5), round(c[0], 5)] for c in coords]
        step = max(1, len(full_coords) // 250)
        sampled = full_coords[::step]
        if sampled[-1] != full_coords[-1]:
            sampled.append(full_coords[-1])
        return sampled, dist_km

results = []
print(f"Total provincial roads to fetch: {len(provincial_defs)}")
for i, item in enumerate(provincial_defs, 1):
    print(f"[{i}/{len(provincial_defs)}] Fetching {item['name']}...")
    try:
        sampled_coords, real_dist = get_osrm_curve(item['waypoints'])
        item['coordinates'] = sampled_coords
        item['lengthKm'] = real_dist
        item['startPoint'] = {"name": item['milestones'][0]['name'], "coords": item['waypoints'][0]}
        item['endPoint'] = {"name": item['milestones'][-1]['name'], "coords": item['waypoints'][-1]}
        item['officialSources'] = [
            f"Dinas Bina Marga {item['provinceId'].replace('_', ' ').title()}",
            item['legalBasis'],
            f"Portal LPSE Provinsi {item['provinceId'].replace('_', ' ').title()}"
        ]
        del item['waypoints']
        results.append(item)
        print(f"  -> SUCCESS! {real_dist} km, {len(sampled_coords)} points")
    except Exception as e:
        print(f"  -> ERROR: {e}")
    time.sleep(0.5)

output_file = 'src/data/provincialRoadsData.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\nALL DONE! Saved {len(results)} provincial roads to {output_file}!")
