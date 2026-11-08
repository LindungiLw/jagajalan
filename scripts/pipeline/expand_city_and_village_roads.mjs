import fs from "fs";
import path from "path";

const NEW_CITY_REGENCY_CORRIDORS = [
  {
    id: "ruas-kta-ach-01",
    provinceId: "aceh",
    region: "sumatera",
    name: "Jl. Teuku Nyak Arief - Darussalam (Koridor Kampus & Pemerintahan)",
    code: "RUAS-KTA-BNA-01",
    authority: "KOTA",
    authorityLabel: "Jalan Kota (APBK Kota Banda Aceh)",
    legalBasis: "Keputusan Walikota Banda Aceh No. 318 Tahun 2022 tentang Status Ruas Jalan Kota Banda Aceh",
    district: "Kota Banda Aceh (Aceh)",
    pavementType: "Aspal Beton AC-WC",
    condition: "MANTAP",
    lengthKm: 6.4,
    hazardScore: 28,
    hazardLevel: "RENDAH",
    waypoints: [
      [95.3222, 5.5562],
      [95.3445, 5.5658],
      [95.3672, 5.5735]
    ],
    leadership: {
      regionalHead: "Pj. Walikota Banda Aceh",
      agency: "Dinas Pekerjaan Umum dan Penataan Ruang Kota Banda Aceh",
      picName: "Ir. Jalaluddin, S.T., M.T."
    },
    problemDetails: {
      headline: "Pemeliharaan Berkala Koridor Utama Pendidikan Darussalam",
      description: "Jalur utama penghubung pusat Kota Banda Aceh menuju kawasan Universitas Syiah Kuala dan UIN Ar-Raniry.",
      rootCause: "Beban lalu lintas harian tinggi dan genangan musiman pada saluran tepi.",
      safetyImpact: "Peremajaan marka penyeberangan mahasiswa dan perbaikan bahu jalan."
    },
    budget: {
      paguRp: 8400000000,
      contractValueRp: 7980000000,
      name: "Pemeliharaan Berkala & Overlay Jl. Teuku Nyak Arief",
      contractor: "PT Aceh Mandiri Konstruksi",
      source: "APBK Kota Banda Aceh & Dana Otsus Aceh TA 2026",
      fiscalYear: 2026,
      progressPct: 82,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Walikota Banda Aceh No. 318/2022",
      budgetSource: "LPSE Kota Banda Aceh",
      fieldDataSource: "Dinas PUPR Kota Banda Aceh",
      transparencyUrl: "https://lpse.bandaacehkota.go.id"
    }
  },
  {
    id: "ruas-kta-jmb-01",
    provinceId: "jambi",
    region: "sumatera",
    name: "Jl. Soemantri Brojonegoro - Sipin (Poros Niaga Kota Jambi)",
    code: "RUAS-KTA-JMB-01",
    authority: "KOTA",
    authorityLabel: "Jalan Kota (APBD Kota Jambi)",
    legalBasis: "Keputusan Walikota Jambi No. 295 Tahun 2022 tentang Penetapan Ruas Jalan Kota Jambi",
    district: "Kota Jambi (Jambi)",
    pavementType: "Aspal Hotmix AC-WC",
    condition: "RUSAK_RINGAN",
    lengthKm: 5.2,
    hazardScore: 54,
    hazardLevel: "SEDANG",
    waypoints: [
      [103.5935, -1.6025],
      [103.5882, -1.6138],
      [103.5968, -1.6245]
    ],
    leadership: {
      regionalHead: "Pj. Walikota Jambi",
      agency: "Dinas Pekerjaan Umum dan Penataan Ruang Kota Jambi",
      picName: "Momon Sukmana Fitra, S.T., M.T."
    },
    problemDetails: {
      headline: "Retak Permukaan & Genangan Drainase Kawasan Sipin - Broni",
      description: "Koridor perdagangan padat di jantung Kota Jambi yang mengalami pengelupasan aspal pada titik persimpangan.",
      rootCause: "Kapasitas gorong-gorong perkotaan meluap saat hujan deras.",
      safetyImpact: "Perbaikan lapis aus aspal dan penataan pedestrian perkotaan."
    },
    budget: {
      paguRp: 6900000000,
      contractValueRp: 6510000000,
      name: "Rehabilitasi Jalan dan Box Culvert Koridor Sipin - Broni",
      contractor: "CV Batanghari Karya",
      source: "APBD Kota Jambi TA 2026",
      fiscalYear: 2026,
      progressPct: 60,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Walikota Jambi No. 295/2022",
      budgetSource: "LPSE Kota Jambi",
      fieldDataSource: "Dinas PUPR Kota Jambi",
      transparencyUrl: "https://lpse.jambikota.go.id"
    }
  },
  {
    id: "ruas-kta-bkl-01",
    provinceId: "bengkulu",
    region: "sumatera",
    name: "Jl. Pariwisata Pantai Panjang - Pasar Bengkulu",
    code: "RUAS-KTA-BKL-01",
    authority: "KOTA",
    authorityLabel: "Jalan Kota (APBD Kota Bengkulu)",
    legalBasis: "Keputusan Walikota Bengkulu No. 214 Tahun 2022 tentang Status Jalan Kota Bengkulu",
    district: "Kota Bengkulu (Bengkulu)",
    pavementType: "Aspal Hotmix HRS-WC",
    condition: "RUSAK_RINGAN",
    lengthKm: 7.1,
    hazardScore: 52,
    hazardLevel: "SEDANG",
    waypoints: [
      [102.2545, -3.8165],
      [102.2485, -3.7985],
      [102.2562, -3.7845]
    ],
    leadership: {
      regionalHead: "Pj. Walikota Bengkulu",
      agency: "Dinas Pekerjaan Umum dan Penataan Ruang Kota Bengkulu",
      picName: "Noprisman, S.T., M.Si."
    },
    problemDetails: {
      headline: "Korosi Air Laut & Pengelupasan Aspal Sabuk Pesisir Pantai Panjang",
      description: "Jalur wisata utama dan akses warga pesisir Kota Bengkulu yang terpapar abrasi dan angin laut.",
      rootCause: "Intrusi air asin dan genangan pasir pantai pada bahu jalan.",
      safetyImpact: "Overlay berkala dan pembangunan tanggul pengaman bahu jalan."
    },
    budget: {
      paguRp: 7400000000,
      contractValueRp: 6980000000,
      name: "Peningkatan Jalan Koridor Pesisir Pantai Panjang - Pasar Bengkulu",
      contractor: "PT Rafflesia Bina Konstruksi",
      source: "APBD Kota Bengkulu TA 2026",
      fiscalYear: 2026,
      progressPct: 68,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Walikota Bengkulu No. 214/2022",
      budgetSource: "LPSE Kota Bengkulu",
      fieldDataSource: "Dinas PUPR Kota Bengkulu",
      transparencyUrl: "https://lpse.bengkulukota.go.id"
    }
  },
  {
    id: "ruas-kta-pba-01",
    provinceId: "bangka_belitung",
    region: "sumatera",
    name: "Jl. Jenderal Sudirman - Gabek (Poros Utama Pangkalpinang)",
    code: "RUAS-KTA-PGK-01",
    authority: "KOTA",
    authorityLabel: "Jalan Kota (APBD Kota Pangkalpinang)",
    legalBasis: "Keputusan Walikota Pangkalpinang No. 188/2022 tentang Status Jalan Kota Pangkalpinang",
    district: "Kota Pangkalpinang (Kep. Bangka Belitung)",
    pavementType: "Aspal Beton AC-WC",
    condition: "MANTAP",
    lengthKm: 5.8,
    hazardScore: 30,
    hazardLevel: "RENDAH",
    waypoints: [
      [106.1132, -2.1315],
      [106.1105, -2.1152],
      [106.1065, -2.0985]
    ],
    leadership: {
      regionalHead: "Pj. Walikota Pangkalpinang",
      agency: "Dinas Pekerjaan Umum dan Penataan Ruang Kota Pangkalpinang",
      picName: "Ir. Suparlan Dulaspar, M.T."
    },
    problemDetails: {
      headline: "Penataan Drainase Perkotaan & Pelapisan Ulang Koridor Niaga",
      description: "Jalur arteri dalam kota Pangkalpinang yang menghubungkan titik nol Alun-Alun Taman Merdeka menuju kawasan Gabek.",
      rootCause: "Genangan sesaat saat pasang laut bersamaan dengan hujan deras.",
      safetyImpact: "Peningkatan saluran U-Ditch tertutup dan marka keselamatan."
    },
    budget: {
      paguRp: 6200000000,
      contractValueRp: 5890000000,
      name: "Rehabilitasi Berkala & Drainase Jl. Jenderal Sudirman - Gabek",
      contractor: "CV Timah Jaya Konstruksi",
      source: "APBD Kota Pangkalpinang TA 2026",
      fiscalYear: 2026,
      progressPct: 86,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Walikota Pangkalpinang No. 188/2022",
      budgetSource: "LPSE Kota Pangkalpinang",
      fieldDataSource: "Dinas PUPR Kota Pangkalpinang",
      transparencyUrl: "https://lpse.pangkalpinangkota.go.id"
    }
  },
  {
    id: "ruas-kta-btn-01",
    provinceId: "banten",
    region: "jawa",
    name: "Jl. KH Abdul Fatah Hasan - Ciceri (Poros Kota Serang)",
    code: "RUAS-KTA-SRG-01",
    authority: "KOTA",
    authorityLabel: "Jalan Kota (APBD Kota Serang)",
    legalBasis: "Keputusan Walikota Serang No. 620/Kep.192-Huk/2022 tentang Status Jalan Kota Serang",
    district: "Kota Serang (Banten)",
    pavementType: "Rigid Pavement & Hotmix AC-WC",
    condition: "RUSAK_RINGAN",
    lengthKm: 4.8,
    hazardScore: 55,
    hazardLevel: "SEDANG",
    waypoints: [
      [106.1552, -6.1185],
      [106.1645, -6.1245],
      [106.1735, -6.1312]
    ],
    leadership: {
      regionalHead: "Pj. Walikota Serang",
      agency: "Dinas Pekerjaan Umum dan Penataan Ruang Kota Serang",
      picName: "Iwan Sunardi, S.T., M.M."
    },
    problemDetails: {
      headline: "Kerusakan Bahu Jalan & Kemacetan Simpang Ciceri - Cipocok",
      description: "Jalur sibuk ibu kota Provinsi Banten yang melayani aktivitas warga, perkantoran, dan kawasan pendidikan.",
      rootCause: "Penyempitan lajur dan drainase jalan yang tertutup bangunan liar.",
      safetyImpact: "Pelebaran perkerasan beton bahu jalan dan penertiban saluran air."
    },
    budget: {
      paguRp: 9100000000,
      contractValueRp: 8640000000,
      name: "Peningkatan Perkerasan Beton & Drainase Jl. KH Abdul Fatah Hasan",
      contractor: "PT Banten Raya Konstruksi",
      source: "APBD Kota Serang TA 2026",
      fiscalYear: 2026,
      progressPct: 58,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Walikota Serang No. 620/Kep.192-Huk/2022",
      budgetSource: "LPSE Kota Serang",
      fieldDataSource: "Dinas PUPR Kota Serang",
      transparencyUrl: "https://lpse.serangkota.go.id"
    }
  },
  {
    id: "ruas-kta-ntt-01",
    provinceId: "nusa_tenggara_timur",
    region: "bali_nusra",
    name: "Jl. W.J. Lalamentik - Oebobo (Poros Pemerintahan Kota Kupang)",
    code: "RUAS-KTA-KPG-01",
    authority: "KOTA",
    authorityLabel: "Jalan Kota (APBD Kota Kupang)",
    legalBasis: "Keputusan Walikota Kupang No. 194/KEP/HK/2022 tentang Status Ruas Jalan Kota Kupang",
    district: "Kota Kupang (Nusa Tenggara Timur)",
    pavementType: "Aspal Hotmix HRS-WC",
    condition: "RUSAK_RINGAN",
    lengthKm: 6.2,
    hazardScore: 56,
    hazardLevel: "SEDANG",
    waypoints: [
      [123.5955, -10.1635],
      [123.6125, -10.1695],
      [123.6285, -10.1755]
    ],
    leadership: {
      regionalHead: "Pj. Walikota Kupang",
      agency: "Dinas Pekerjaan Umum dan Penataan Ruang Kota Kupang",
      picName: "Maxi N. Dethan, S.T."
    },
    problemDetails: {
      headline: "Pengelupasan Aspal Pasca-Musim Hujan Ekstrem di Koridor Oebobo",
      description: "Jalur utama layanan publik, rumah sakit, dan pusat niaga di Kota Kupang.",
      rootCause: "Kontur berbukit yang memicu aliran air permukaan berkecepatan tinggi di atas aspal.",
      safetyImpact: "Perbaikan saluran kemiringan jalan dan pelapisan ulang hotmix."
    },
    budget: {
      paguRp: 8700000000,
      contractValueRp: 8250000000,
      name: "Rehabilitasi & Pemeliharaan Berkala Jl. W.J. Lalamentik - Oebobo",
      contractor: "PT Flobamora Karya Utama",
      source: "APBD Kota Kupang TA 2026",
      fiscalYear: 2026,
      progressPct: 63,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Walikota Kupang No. 194/KEP/HK/2022",
      budgetSource: "LPSE Kota Kupang",
      fieldDataSource: "Dinas PUPR Kota Kupang",
      transparencyUrl: "https://lpse.kupangkota.go.id"
    }
  },
  {
    id: "ruas-kta-gto-01",
    provinceId: "gorontalo",
    region: "sulawesi",
    name: "Jl. Nani Wartabone - Limba U (Pusat Kota Gorontalo)",
    code: "RUAS-KTA-GTO-01",
    authority: "KOTA",
    authorityLabel: "Jalan Kota (APBD Kota Gorontalo)",
    legalBasis: "Keputusan Walikota Gorontalo No. 210/2022 tentang Status Ruas Jalan Kota Gorontalo",
    district: "Kota Gorontalo (Gorontalo)",
    pavementType: "Aspal Beton AC-WC",
    condition: "MANTAP",
    lengthKm: 4.9,
    hazardScore: 32,
    hazardLevel: "RENDAH",
    waypoints: [
      [123.0525, 0.5385],
      [123.0595, 0.5455],
      [123.0665, 0.5545]
    ],
    leadership: {
      regionalHead: "Pj. Walikota Gorontalo",
      agency: "Dinas Pekerjaan Umum dan Penataan Ruang Kota Gorontalo",
      picName: "Heru Z. Thalib, S.T., M.T."
    },
    problemDetails: {
      headline: "Pemeliharaan Rutin Koridor Komersial & Ruang Terbuka Kota Gorontalo",
      description: "Jalur arteri sekunder dalam Kota Gorontalo yang menghubungkan kawasan Lapangan Taruna dengan pusat perbelanjaan.",
      rootCause: "Keausan normal permukaan aspal dan sedimen saluran drainase.",
      safetyImpact: "Pembersihan saluran berkala dan pengecatan ulang marka lajur sepeda."
    },
    budget: {
      paguRp: 5800000000,
      contractValueRp: 5490000000,
      name: "Pemeliharaan Berkala & Pedestrian Jl. Nani Wartabone",
      contractor: "CV Hulontalo Konstruksi",
      source: "APBD Kota Gorontalo TA 2026",
      fiscalYear: 2026,
      progressPct: 88,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Walikota Gorontalo No. 210/2022",
      budgetSource: "LPSE Kota Gorontalo",
      fieldDataSource: "Dinas PUPR Kota Gorontalo",
      transparencyUrl: "https://lpse.gorontalokota.go.id"
    }
  },
  {
    id: "ruas-kta-plu-01",
    provinceId: "sulawesi_tengah",
    region: "sulawesi",
    name: "Jl. Moh. Yamin - Tondo (Koridor Rekonstruksi Kota Palu)",
    code: "RUAS-KTA-PLU-01",
    authority: "KOTA",
    authorityLabel: "Jalan Kota (APBD Kota Palu)",
    legalBasis: "Keputusan Walikota Palu No. 620/312/PU/2022 tentang Status Jalan Kota Palu",
    district: "Kota Palu (Sulawesi Tengah)",
    pavementType: "Aspal Beton AC-WC 2 Jalur",
    condition: "MANTAP",
    lengthKm: 7.4,
    hazardScore: 34,
    hazardLevel: "RENDAH",
    waypoints: [
      [119.8755, -0.9025],
      [119.8825, -0.8815],
      [119.8895, -0.8525]
    ],
    leadership: {
      regionalHead: "Walikota Palu",
      agency: "Dinas Pekerjaan Umum Kota Palu",
      picName: "Ir. SinggihBudi Prasetyo, M.Si."
    },
    problemDetails: {
      headline: "Penanganan Deformasi Tanah & Drainase Jalan Protokol Moh. Yamin",
      description: "Boulevard utama Kota Palu menuju kawasan kampus Universitas Tadulako dan Huntap Tondo.",
      rootCause: "Pergerakan tanah mikro pascagempa yang membutuhkan perkuatan lapis pondasi.",
      safetyImpact: "Leveling aspal dan penyempurnaan lampu penerangan jalan tenaga surya."
    },
    budget: {
      paguRp: 11200000000,
      contractValueRp: 10540000000,
      name: "Peningkatan & Rekonstruksi Drainase Jl. Moh. Yamin - Tondo",
      contractor: "PT Kaili Mandiri Sejahtera",
      source: "APBD Kota Palu TA 2026",
      fiscalYear: 2026,
      progressPct: 79,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Walikota Palu No. 620/312/PU/2022",
      budgetSource: "LPSE Kota Palu",
      fieldDataSource: "Dinas PU Kota Palu",
      transparencyUrl: "https://lpse.palukota.go.id"
    }
  },
  {
    id: "ruas-kab-mmj-01",
    provinceId: "sulawesi_barat",
    region: "sulawesi",
    name: "Jl. Yos Sudarso - Pantai Manakarra (Poros Perkotaan Mamuju)",
    code: "RUAS-KAB-MMJ-01",
    authority: "KABUPATEN",
    authorityLabel: "Jalan Kabupaten (APBD Kab. Mamuju)",
    legalBasis: "Keputusan Bupati Mamuju No. 188.45/280/KPTS/2022 tentang Status Jalan Kabupaten Mamuju",
    district: "Kabupaten Mamuju (Sulawesi Barat)",
    pavementType: "Aspal Hotmix HRS-WC",
    condition: "RUSAK_RINGAN",
    lengthKm: 5.5,
    hazardScore: 49,
    hazardLevel: "SEDANG",
    waypoints: [
      [118.8825, -2.6815],
      [118.8885, -2.6745],
      [118.8955, -2.6685]
    ],
    leadership: {
      regionalHead: "Bupati Mamuju",
      agency: "Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Mamuju",
      picName: "Basit, S.T., M.T."
    },
    problemDetails: {
      headline: "Rehabilitasi Jalan Pesisir & Konektivitas Pelabuhan Mamuju",
      description: "Koridor pesisir ibu kota Provinsi Sulawesi Barat yang menghubungkan pusat niaga dengan kawasan anjungan Pantai Manakarra.",
      rootCause: "Penurunan tanah aluvial pesisir dan genangan pasang laut.",
      safetyImpact: "Perbaikan struktur perkerasan dan peninggian elevasi badan jalan."
    },
    budget: {
      paguRp: 7800000000,
      contractValueRp: 7390000000,
      name: "Peningkatan Struktur Jalan Koridor Pantai Manakarra Mamuju",
      contractor: "PT Manakarra Karya Konstruksi",
      source: "APBD Kabupaten Mamuju TA 2026",
      fiscalYear: 2026,
      progressPct: 65,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Bupati Mamuju No. 188.45/280/KPTS/2022",
      budgetSource: "LPSE Kabupaten Mamuju",
      fieldDataSource: "Dinas PUPR Kabupaten Mamuju",
      transparencyUrl: "https://lpse.mamujukab.go.id"
    }
  },
  {
    id: "ruas-kta-kdi-01",
    provinceId: "sulawesi_tenggara",
    region: "sulawesi",
    name: "Jl. MT Haryono - Wuawua (Poros Niaga Kota Kendari)",
    code: "RUAS-KTA-KDI-01",
    authority: "KOTA",
    authorityLabel: "Jalan Kota (APBD Kota Kendari)",
    legalBasis: "Keputusan Walikota Kendari No. 412 Tahun 2022 tentang Status Ruas Jalan Kota Kendari",
    district: "Kota Kendari (Sulawesi Tenggara)",
    pavementType: "Aspal Beton AC-WC",
    condition: "RUSAK_RINGAN",
    lengthKm: 6.6,
    hazardScore: 53,
    hazardLevel: "SEDANG",
    waypoints: [
      [122.5025, -3.9985],
      [122.5155, -3.9895],
      [122.5285, -3.9785]
    ],
    leadership: {
      regionalHead: "Pj. Walikota Kendari",
      agency: "Dinas Pekerjaan Umum dan Penataan Ruang Kota Kendari",
      picName: "Hj. Erlis Sadya Kencana, S.T., M.T."
    },
    problemDetails: {
      headline: "Lubang Aspal & Genangan di Simpang Pasar Baru - Wuawua",
      description: "Koridor perdagangan dan akses kampus di pusat Kota Kendari.",
      rootCause: "Sedimentasi saluran primer yang mengalir ke Teluk Kendari.",
      safetyImpact: "Rehabilitasi aspal dan pengerukan gorong-gorong sisi jalan."
    },
    budget: {
      paguRp: 8900000000,
      contractValueRp: 8420000000,
      name: "Rehabilitasi Berkala Jl. MT Haryono - Wuawua Kota Kendari",
      contractor: "PT Anoa Perkasa Mandiri",
      source: "APBD Kota Kendari TA 2026",
      fiscalYear: 2026,
      progressPct: 61,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Walikota Kendari No. 412/2022",
      budgetSource: "LPSE Kota Kendari",
      fieldDataSource: "Dinas PUPR Kota Kendari",
      transparencyUrl: "https://lpse.kendarikota.go.id"
    }
  },
  {
    id: "ruas-kta-tte-01",
    provinceId: "maluku_utara",
    region: "maluku_papua",
    name: "Jl. Sultan Muhammad Djabir Sjah - Bastiong (Poros Kota Ternate)",
    code: "RUAS-KTA-TTE-01",
    authority: "KOTA",
    authorityLabel: "Jalan Kota (APBD Kota Ternate)",
    legalBasis: "Keputusan Walikota Ternate No. 188.4/152/2022 tentang Status Jalan Kota Ternate",
    district: "Kota Ternate (Maluku Utara)",
    pavementType: "Aspal Hotmix HRS-WC",
    condition: "MANTAP",
    lengthKm: 6.1,
    hazardScore: 35,
    hazardLevel: "RENDAH",
    waypoints: [
      [127.3765, 0.7725],
      [127.3845, 0.7885],
      [127.3865, 0.8045]
    ],
    leadership: {
      regionalHead: "Walikota Ternate",
      agency: "Dinas Pekerjaan Umum dan Penataan Ruang Kota Ternate",
      picName: "Rus'an M. Nur Taib, S.T., M.T."
    },
    problemDetails: {
      headline: "Konektivitas Pelabuhan Penyeberangan Bastiong - Pusat Kota Ternate",
      description: "Urat nadi transportasi antarpulau yang menghubungkan Pelabuhan Bastiong (akses ke Sofifi & Tidore) dengan pusat niaga Ternate.",
      rootCause: "Volume kendaraan angkutan logistik kepulauan yang tinggi.",
      safetyImpact: "Pemeliharaan lapis aus dan penataan bahu jalan pelabuhan."
    },
    budget: {
      paguRp: 7600000000,
      contractValueRp: 7190000000,
      name: "Peningkatan Jalan Koridor Bastiong - Pusat Kota Ternate",
      contractor: "PT Kie Raha Konstruksi",
      source: "APBD Kota Ternate TA 2026",
      fiscalYear: 2026,
      progressPct: 81,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Walikota Ternate No. 188.4/152/2022",
      budgetSource: "LPSE Kota Ternate",
      fieldDataSource: "Dinas PUPR Kota Ternate",
      transparencyUrl: "https://lpse.ternatekota.go.id"
    }
  },
  {
    id: "ruas-kab-mkw-01",
    provinceId: "papua_barat",
    region: "maluku_papua",
    name: "Jl. Trikora Wosi - Sanggeng (Poros Utama Manokwari)",
    code: "RUAS-KAB-MKW-01",
    authority: "KABUPATEN",
    authorityLabel: "Jalan Kabupaten (APBD Kab. Manokwari)",
    legalBasis: "Keputusan Bupati Manokwari No. 620/195/2022 tentang Status Jalan Kabupaten Manokwari",
    district: "Kabupaten Manokwari (Papua Barat)",
    pavementType: "Rigid Pavement & Hotmix AC-WC",
    condition: "RUSAK_RINGAN",
    lengthKm: 6.3,
    hazardScore: 51,
    hazardLevel: "SEDANG",
    waypoints: [
      [134.0555, -0.8695],
      [134.0685, -0.8615],
      [134.0795, -0.8545]
    ],
    leadership: {
      regionalHead: "Bupati Manokwari",
      agency: "Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Manokwari",
      picName: "Emba R. Allo, S.T."
    },
    problemDetails: {
      headline: "Pelebaran Koridor Pasar Wosi - Pelabuhan Manokwari",
      description: "Jalan utama aktivitas ekonomi masyarakat di ibu kota Provinsi Papua Barat.",
      rootCause: "Kerusakan bahu jalan dan sedimentasi saluran air dari kawasan perbukitan.",
      safetyImpact: "Pengecoran bahu jalan dan normalisasi saluran tepi."
    },
    budget: {
      paguRp: 10400000000,
      contractValueRp: 9850000000,
      name: "Peningkatan Jalan & Drainase Ruas Trikora Wosi - Sanggeng",
      contractor: "PT Arfak Mandiri Konstruksi",
      source: "Dana Otsus & APBD Kabupaten Manokwari TA 2026",
      fiscalYear: 2026,
      progressPct: 64,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Bupati Manokwari No. 620/195/2022",
      budgetSource: "LPSE Kabupaten Manokwari",
      fieldDataSource: "Dinas PUPR Kabupaten Manokwari",
      transparencyUrl: "https://lpse.manokwarikab.go.id"
    }
  },
  {
    id: "ruas-kab-mrk-01",
    provinceId: "papua_selatan",
    region: "maluku_papua",
    name: "Jl. Raya Mandala - Mopah (Poros Utama Kota Merauke)",
    code: "RUAS-KAB-MRK-01",
    authority: "KABUPATEN",
    authorityLabel: "Jalan Kabupaten (APBD Kab. Merauke)",
    legalBasis: "Keputusan Bupati Merauke No. 620/244/2022 tentang Status Jalan Kabupaten Merauke",
    district: "Kabupaten Merauke (Papua Selatan)",
    pavementType: "Aspal Beton AC-WC & Rigid Beton",
    condition: "MANTAP",
    lengthKm: 7.2,
    hazardScore: 33,
    hazardLevel: "RENDAH",
    waypoints: [
      [140.3915, -8.4885],
      [140.4025, -8.5015],
      [140.4155, -8.5165]
    ],
    leadership: {
      regionalHead: "Bupati Merauke",
      agency: "Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Merauke",
      picName: "Romanus Sujatmiko, S.T., M.T."
    },
    problemDetails: {
      headline: "Konektivitas Bandara Mopah - Pusat Pemerintahan Papua Selatan",
      description: "Koridor protokol utama Kabupaten Merauke sekaligus pusat layanan Provinsi Papua Selatan.",
      rootCause: "Tanah dasar rawa dataran rendah yang memerlukan penguatan struktur beton.",
      safetyImpact: "Pemeliharaan lapis permukaan dan marka keselamatan jalan."
    },
    budget: {
      paguRp: 13500000000,
      contractValueRp: 12800000000,
      name: "Preservasi & Perkuatan Bahu Jalan Raya Mandala - Bandara Mopah",
      contractor: "PT Anim Ha Karya Mandiri",
      source: "Dana Otsus Papua Selatan & APBD Kab. Merauke TA 2026",
      fiscalYear: 2026,
      progressPct: 84,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Bupati Merauke No. 620/244/2022",
      budgetSource: "LPSE Kabupaten Merauke",
      fieldDataSource: "Dinas PUPR Kabupaten Merauke",
      transparencyUrl: "https://lpse.meraukekab.go.id"
    }
  },
  {
    id: "ruas-kab-nbr-01",
    provinceId: "papua_tengah",
    region: "maluku_papua",
    name: "Jl. Merdeka - Oyehe (Poros Perkotaan Nabire)",
    code: "RUAS-KAB-NBR-01",
    authority: "KABUPATEN",
    authorityLabel: "Jalan Kabupaten (APBD Kab. Nabire)",
    legalBasis: "Keputusan Bupati Nabire No. 620/118/2022 tentang Status Jalan Kabupaten Nabire",
    district: "Kabupaten Nabire (Papua Tengah)",
    pavementType: "Aspal Hotmix HRS-WC",
    condition: "RUSAK_RINGAN",
    lengthKm: 5.4,
    hazardScore: 47,
    hazardLevel: "SEDANG",
    waypoints: [
      [135.4925, -3.3685],
      [135.5015, -3.3615],
      [135.5125, -3.3545]
    ],
    leadership: {
      regionalHead: "Bupati Nabire",
      agency: "Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Nabire",
      picName: "Martinus Makai, S.T."
    },
    problemDetails: {
      headline: "Peningkatan Jalan Ibu Kota Provinsi Baru Papua Tengah",
      description: "Jalur utama layanan pemerintahan dan perdagangan di pesisir Teluk Cenderawasih Nabire.",
      rootCause: "Peningkatan tajam volume kendaraan sejak penetapan Nabire sebagai ibu kota Provinsi Papua Tengah.",
      safetyImpact: "Pelebaran lajur dan perbaikan drainase perkotaan."
    },
    budget: {
      paguRp: 11800000000,
      contractValueRp: 11150000000,
      name: "Peningkatan Kapasitas Jalan Merdeka - Oyehe Nabire",
      contractor: "PT Cenderawasih Tengah Konstruksi",
      source: "Dana Otsus Papua Tengah & APBD Kab. Nabire TA 2026",
      fiscalYear: 2026,
      progressPct: 72,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Bupati Nabire No. 620/118/2022",
      budgetSource: "LPSE Kabupaten Nabire",
      fieldDataSource: "Dinas PUPR Kabupaten Nabire",
      transparencyUrl: "https://lpse.nabirekab.go.id"
    }
  },
  {
    id: "ruas-kab-wmn-01",
    provinceId: "papua_pegunungan",
    region: "maluku_papua",
    name: "Jl. Yos Sudarso - Homhom (Poros Lembah Baliem Wamena)",
    code: "RUAS-KAB-JWY-01",
    authority: "KABUPATEN",
    authorityLabel: "Jalan Kabupaten (APBD Kab. Jayawijaya)",
    legalBasis: "Keputusan Bupati Jayawijaya No. 620/164/2022 tentang Status Jalan Kabupaten Jayawijaya",
    district: "Kabupaten Jayawijaya / Wamena (Papua Pegunungan)",
    pavementType: "Aspal Hotmix & Beton Bertulang",
    condition: "RUSAK_RINGAN",
    lengthKm: 5.1,
    hazardScore: 56,
    hazardLevel: "SEDANG",
    waypoints: [
      [138.9385, -4.0985],
      [138.9455, -4.0915],
      [138.9535, -4.0845]
    ],
    leadership: {
      regionalHead: "Pj. Bupati Jayawijaya",
      agency: "Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Jayawijaya",
      picName: "Markus Walilo, S.T."
    },
    problemDetails: {
      headline: "Distribusi Logistik Udara Bandara Wamena ke Sentra Pasar Lembah Baliem",
      description: "Koridor vital pendistribusian bahan pokok dari kargo Bandara Wamena menuju distrik-distrik di Papua Pegunungan.",
      rootCause: "Curah hujan pegunungan tinggi dan beban truk logistik antardistrik.",
      safetyImpact: "Perkuatan lapis pondasi agregat dan pengaspalan ulang."
    },
    budget: {
      paguRp: 14600000000,
      contractValueRp: 13890000000,
      name: "Rekonstruksi Jalan Koridor Bandara Wamena - Homhom",
      contractor: "PT Baliem Mandiri Konstruksi",
      source: "Dana Otsus Papua Pegunungan & APBD Jayawijaya TA 2026",
      fiscalYear: 2026,
      progressPct: 59,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Bupati Jayawijaya No. 620/164/2022",
      budgetSource: "LPSE Kabupaten Jayawijaya",
      fieldDataSource: "Dinas PUPR Kabupaten Jayawijaya",
      transparencyUrl: "https://lpse.jayawijayakab.go.id"
    }
  }
];

const VILLAGE_ROADS_CORRIDORS = [
  // --- SUMATERA ---
  {
    id: "ruas-desa-su-01",
    provinceId: "sumatera_utara",
    region: "sumatera",
    name: "Jalan Poros Desa Helvetia - Manunggal (Kec. Labuhan Deli)",
    code: "RUAS-DSA-DS-001",
    authority: "DESA",
    authorityLabel: "Jalan Desa (Pemerintah Desa Helvetia & Dana Desa Kab. Deli Serdang)",
    legalBasis: "UU No. 2 Tahun 2022 Pasal 9 tentang Jalan Desa & Perbup Deli Serdang No. 58/2022",
    district: "Desa Helvetia, Kec. Labuhan Deli, Kab. Deli Serdang (Sumatera Utara)",
    pavementType: "Rabat Beton Desa & Paving Block Mutu K-300",
    condition: "RUSAK_RINGAN",
    lengthKm: 3.4,
    hazardScore: 62,
    hazardLevel: "SEDANG",
    waypoints: [
      [98.6625, 3.6355],
      [98.6685, 3.6425],
      [98.6745, 3.6495]
    ],
    leadership: {
      regionalHead: "Kepala Desa Helvetia & Bupati Deli Serdang",
      agency: "Pemerintah Desa Helvetia & Dinas PMD / Dinas Perkim Kab. Deli Serdang",
      picName: "Tim Pelaksana Kegiatan (TPK) Dana Desa Helvetia"
    },
    problemDetails: {
      headline: "Retak Rabat Beton & Genangan Saluran Lingkungan Dusun III - IV",
      description: "Jalan poros penghubung permukiman warga Desa Helvetia menuju jalan kolektor kabupaten yang padat komuter.",
      rootCause: "Drainase parit desa menyempit dan dilintasi kendaraan angkutan melebihi tonase jalan desa.",
      safetyImpact: "Perbaikan rabat beton dan pembangunan parit gendong melalui Dana Desa TA 2026."
    },
    budget: {
      paguRp: 980000000,
      contractValueRp: 965000000,
      name: "Pembangunan Rabat Beton & Drainase Lingkungan Jalan Poros Desa Helvetia",
      contractor: "Swakelola Padat Karya Tunai Desa (PKTD) TPK Desa Helvetia",
      source: "APBDes (Dana Desa APBN & ADD Kab. Deli Serdang) TA 2026",
      fiscalYear: 2026,
      progressPct: 74,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "UU No. 2/2022 Pasal 9 & SK Bupati Deli Serdang tentang Inventarisasi Jalan Desa",
      budgetSource: "Siskeudes (Sistem Keuangan Desa) & Baliho Transparansi APBDes Helvetia",
      fieldDataSource: "Musrenbangdes Helvetia & Laporan Geotagged Warga",
      transparencyUrl: "https://sid.kemendesa.go.id"
    }
  },
  {
    id: "ruas-desa-su-02",
    provinceId: "sumatera_utara",
    region: "sumatera",
    name: "Jalan Desa Tongging - Sibolangit (Akses Agrowisata Tepian Danau Toba)",
    code: "RUAS-DSA-KRO-002",
    authority: "DESA",
    authorityLabel: "Jalan Desa (Pemerintah Desa Tongging & Bantuan Keuangan Kab. Karo)",
    legalBasis: "UU No. 2 Tahun 2022 Pasal 9 & Keputusan Bupati Karo tentang Ruas Jalan Poros Desa",
    district: "Desa Tongging, Kec. Merek, Kab. Karo (Sumatera Utara)",
    pavementType: "Lapen (Lapis Penetrasi Macadam) & Bahu Beton",
    condition: "RUSAK_BERAT",
    lengthKm: 4.2,
    hazardScore: 81,
    hazardLevel: "TINGGI",
    waypoints: [
      [98.5245, 2.9025],
      [98.5315, 2.8965],
      [98.5385, 2.8915]
    ],
    leadership: {
      regionalHead: "Kepala Desa Tongging & Bupati Karo",
      agency: "Pemerintah Desa Tongging & Dinas PUTR Kab. Karo",
      picName: "TPK Desa Tongging & UPTD PUTR Merek"
    },
    problemDetails: {
      headline: "Pengelupasan Aspal Lapen & Erosi Lereng Akses Kebun Jeruk dan Kopi Warga",
      description: "Jalan produksi pertanian dan ekowisata Desa Tongging di kaldera utara Danau Toba.",
      rootCause: "Kemiringan lereng curam dan limpasan air hujan dari perbukitan Merek.",
      safetyImpact: "Menghambat pengangkutan hasil panen petani desa dan membahayakan wisatawan."
    },
    budget: {
      paguRp: 1450000000,
      contractValueRp: 1390000000,
      name: "Peningkatan Jalan Produksi & Bronjong Penahan Lereng Desa Tongging",
      contractor: "CV Sibayak Karya Mandiri (Bantuan Keuangan Khusus Desa)",
      source: "Dana Desa & Bantuan Keuangan Kabupaten Karo TA 2026",
      fiscalYear: 2026,
      progressPct: 42,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "UU No. 2 Tahun 2022 Pasal 9 & Perbup Karo tentang Jalan Desa",
      budgetSource: "Siskeudes & LPSE Kabupaten Karo",
      fieldDataSource: "Pemerintah Desa Tongging",
      transparencyUrl: "https://sid.kemendesa.go.id"
    }
  },
  {
    id: "ruas-desa-sbr-01",
    provinceId: "sumatera_barat",
    region: "sumatera",
    name: "Jalan Poros Nagari Pariangan - Sawah Gadang (Kab. Tanah Datar)",
    code: "RUAS-DSA-TDR-001",
    authority: "DESA",
    authorityLabel: "Jalan Nagari / Desa (Pemerintah Nagari Pariangan & Kab. Tanah Datar)",
    legalBasis: "UU No. 2 Tahun 2022 Pasal 9 & Perbup Tanah Datar tentang Jalan Nagari",
    district: "Nagari Pariangan, Kec. Pariangan, Kab. Tanah Datar (Sumatera Barat)",
    pavementType: "Rabat Beton Bertulang & Batu Kali",
    condition: "MANTAP",
    lengthKm: 3.1,
    hazardScore: 29,
    hazardLevel: "RENDAH",
    waypoints: [
      [100.4985, -0.4615],
      [100.5065, -0.4565],
      [100.5145, -0.4515]
    ],
    leadership: {
      regionalHead: "Wali Nagari Pariangan",
      agency: "Pemerintah Nagari Pariangan & Dinas PMD Tanah Datar",
      picName: "TPK Nagari Pariangan"
    },
    problemDetails: {
      headline: "Pemeliharaan Jalan Lingkungan Nagari & Saluran Irigasi Lereng Marapi",
      description: "Jalan poros nagari penghubung jorong permukiman adat dan lahan pertanian lereng Gunung Marapi.",
      rootCause: "Endapan abu vulkanik dan aliran air hujan pegunungan.",
      safetyImpact: "Pembersihan rutin saluran tepi dan perkuatan bahu rabat beton."
    },
    budget: {
      paguRp: 820000000,
      contractValueRp: 805000000,
      name: "Rehabilitasi Rabat Beton & Parit Nagari Pariangan",
      contractor: "Swakelola PKTD Nagari Pariangan",
      source: "Dana Desa (APBN) & Alokasi Dana Nagari TA 2026",
      fiscalYear: 2026,
      progressPct: 91,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Bupati Tanah Datar tentang Inventarisasi Jalan Nagari",
      budgetSource: "Siskeudes Nagari Pariangan",
      fieldDataSource: "Pemerintah Nagari Pariangan",
      transparencyUrl: "https://sid.kemendesa.go.id"
    }
  },
  // --- JAWA ---
  {
    id: "ruas-desa-jbr-01",
    provinceId: "jawa_barat",
    region: "jawa",
    name: "Jalan Poros Desa Ciburial - Pakar Timur (Kec. Cimenyan)",
    code: "RUAS-DSA-BDG-001",
    authority: "DESA",
    authorityLabel: "Jalan Desa (Pemerintah Desa Ciburial, Kab. Bandung)",
    legalBasis: "UU No. 2 Tahun 2022 Pasal 9 & Perbup Bandung No. 72/2021 tentang Jalan Desa",
    district: "Desa Ciburial, Kec. Cimenyan, Kab. Bandung (Jawa Barat)",
    pavementType: "Aspal Hotmix Desa & Beton Siklop",
    condition: "RUSAK_RINGAN",
    lengthKm: 3.8,
    hazardScore: 54,
    hazardLevel: "SEDANG",
    waypoints: [
      [107.6385, -6.8585],
      [107.6465, -6.8515],
      [107.6545, -6.8445]
    ],
    leadership: {
      regionalHead: "Kepala Desa Ciburial",
      agency: "Pemerintah Desa Ciburial & Dinas PUTR Kab. Bandung",
      picName: "TPK Desa Ciburial"
    },
    problemDetails: {
      headline: "Kerusakan Lapis Permukaan pada Tanjakan Curam Kawasan Bandung Utara",
      description: "Jalan poros penghubung permukiman warga Desa Ciburial dan sentra peternakan rakyat menuju kawasan Dago Atas.",
      rootCause: "Tanjakan ekstrem (>14%) dan gerusan air hujan pada bahu jalan.",
      safetyImpact: "Pelapisan ulang beton bertekstur (grooving) untuk mencegah kendaraan selip."
    },
    budget: {
      paguRp: 1120000000,
      contractValueRp: 1095000000,
      name: "Peningkatan Jalan Poros Desa Ciburial & Saluran Drainase Batu Kali",
      contractor: "TPK Desa Ciburial (Bantuan Provinsi Jawa Barat & Dana Desa)",
      source: "Dana Desa & Banprov Jawa Barat TA 2026",
      fiscalYear: 2026,
      progressPct: 68,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "Perbup Bandung No. 72/2021 tentang Jalan Desa",
      budgetSource: "Siskeudes & Portal Desa Ciburial",
      fieldDataSource: "Pemerintah Desa Ciburial",
      transparencyUrl: "https://ciburial.desa.id"
    }
  },
  {
    id: "ruas-desa-jtg-01",
    provinceId: "jawa_tengah",
    region: "jawa",
    name: "Jalan Poros Desa Karangrejo - Wanurejo (Kawasan Borobudur)",
    code: "RUAS-DSA-MGL-001",
    authority: "DESA",
    authorityLabel: "Jalan Desa (Pemerintah Desa Karangrejo, Kab. Magelang)",
    legalBasis: "UU No. 2 Tahun 2022 Pasal 9 & Perbup Magelang tentang Status Jalan Desa",
    district: "Desa Karangrejo, Kec. Borobudur, Kab. Magelang (Jawa Tengah)",
    pavementType: "Aspal Hotmix & Paving Block Lingkungan",
    condition: "MANTAP",
    lengthKm: 3.5,
    hazardScore: 31,
    hazardLevel: "RENDAH",
    waypoints: [
      [110.1895, -7.6055],
      [110.1985, -7.6095],
      [110.2125, -7.6115]
    ],
    leadership: {
      regionalHead: "Kepala Desa Karangrejo",
      agency: "Pemerintah Desa Karangrejo & Dispermades Kab. Magelang",
      picName: "TPK Desa Karangrejo"
    },
    problemDetails: {
      headline: "Pemeliharaan Koridor Balkondes & Sentra UMKM Kerajinan Desa",
      description: "Jalur konektivitas antar-dusun, lahan pertanian, dan Balai Ekonomi Desa (Balkondes) di sekitar kawasan Borobudur.",
      rootCause: "Keausan bahu jalan akibat peningkatan kunjungan bus mikro wisata desa.",
      safetyImpact: "Perkuatan talud tepi sawah dan pemasangan penerangan jalan tenaga surya."
    },
    budget: {
      paguRp: 890000000,
      contractValueRp: 875000000,
      name: "Pemeliharaan Jalan Poros & Talud Pengaman Desa Karangrejo",
      contractor: "Swakelola PKTD Desa Karangrejo",
      source: "Dana Desa (APBN) & Bankeu Pemprov Jateng TA 2026",
      fiscalYear: 2026,
      progressPct: 87,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Bupati Magelang tentang Inventarisasi Jalan Desa",
      budgetSource: "Siskeudes Kab. Magelang",
      fieldDataSource: "Pemerintah Desa Karangrejo",
      transparencyUrl: "https://sid.kemendesa.go.id"
    }
  },
  {
    id: "ruas-desa-jtm-01",
    provinceId: "jawa_timur",
    region: "jawa",
    name: "Jalan Poros Desa Pujon Kidul - Sumber Maron (Sentra Susu & Hortikultura)",
    code: "RUAS-DSA-MLG-001",
    authority: "DESA",
    authorityLabel: "Jalan Desa (Pemerintah Desa Pujon Kidul, Kab. Malang)",
    legalBasis: "UU No. 2 Tahun 2022 Pasal 9 & Perbup Malang tentang Penetapan Jalan Desa",
    district: "Desa Pujon Kidul, Kec. Pujon, Kab. Malang (Jawa Timur)",
    pavementType: "Rabat Beton K-300 & Aspal Hotmix",
    condition: "RUSAK_RINGAN",
    lengthKm: 4.1,
    hazardScore: 49,
    hazardLevel: "SEDANG",
    waypoints: [
      [112.4485, -7.8485],
      [112.4565, -7.8545],
      [112.4645, -7.8615]
    ],
    leadership: {
      regionalHead: "Kepala Desa Pujon Kidul",
      agency: "Pemerintah Desa Pujon Kidul & Dinas PU Bina Marga Kab. Malang",
      picName: "TPK Desa Pujon Kidul"
    },
    problemDetails: {
      headline: "Pelebaran Jalan Usaha Tani & Akses Koperasi Susu Perah Desa",
      description: "Jalan utama pengangkutan sayur mayur, susu segar, dan wisata desa di dataran tinggi Pujon.",
      rootCause: "Lebar jalan eksisting sempit (4 meter) dengan bahu jalan tergerus hujan.",
      safetyImpact: "Pelebaran bahu beton 1 meter kanan-kiri dan pemasangan pagar pengaman tikungan."
    },
    budget: {
      paguRp: 1250000000,
      contractValueRp: 1210000000,
      name: "Pelebaran Rabat Beton & Drainase Jalan Poros Desa Pujon Kidul",
      contractor: "TPK Desa Pujon Kidul & BUMDes Sumber Sejahtera",
      source: "Dana Desa & PADes Pujon Kidul TA 2026",
      fiscalYear: 2026,
      progressPct: 76,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Bupati Malang tentang Status Jalan Desa",
      budgetSource: "Siskeudes & APBDes Pujon Kidul",
      fieldDataSource: "Pemerintah Desa Pujon Kidul",
      transparencyUrl: "https://sid.kemendesa.go.id"
    }
  },
  // --- BALI & NUSA TENGGARA ---
  {
    id: "ruas-desa-bli-01",
    provinceId: "bali",
    region: "bali_nusra",
    name: "Jalan Poros Desa Tigawasa - Sidatapa (Perbukitan Buleleng)",
    code: "RUAS-DSA-BLL-001",
    authority: "DESA",
    authorityLabel: "Jalan Desa (Pemerintah Desa Tigawasa, Kab. Buleleng)",
    legalBasis: "UU No. 2 Tahun 2022 Pasal 9 & Perbup Buleleng tentang Jalan Desa",
    district: "Desa Tigawasa, Kec. Banjar, Kab. Buleleng (Bali)",
    pavementType: "Aspal Lapen & Rabat Beton",
    condition: "RUSAK_RINGAN",
    lengthKm: 3.9,
    hazardScore: 57,
    hazardLevel: "SEDANG",
    waypoints: [
      [115.0215, -8.2125],
      [115.0295, -8.2045],
      [115.0375, -8.1965]
    ],
    leadership: {
      regionalHead: "Perbekel Desa Tigawasa",
      agency: "Pemerintah Desa Tigawasa & Dinas PMD Kab. Buleleng",
      picName: "TPK Desa Tigawasa"
    },
    problemDetails: {
      headline: "Perbaikan Tanjakan & Senderan Tebing Penghubung Desa Bali Aga",
      description: "Jalan poros penghubung sentra kerajinan anyaman bambu dan perkebunan cengkeh/kopi Desa Tigawasa.",
      rootCause: "Curah hujan tinggi di perbukitan Buleleng yang menggerus pondasi bahu jalan.",
      safetyImpact: "Pembangunan tembok penahan tanah (senderan) dan pelapisan beton."
    },
    budget: {
      paguRp: 940000000,
      contractValueRp: 920000000,
      name: "Peningkatan Jalan Poros & Senderan Tebing Desa Tigawasa",
      contractor: "Swakelola PKTD Desa Tigawasa",
      source: "Dana Desa (APBN) & BKK Provinsi Bali TA 2026",
      fiscalYear: 2026,
      progressPct: 70,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Bupati Buleleng tentang Ruas Jalan Desa",
      budgetSource: "Siskeudes Kab. Buleleng",
      fieldDataSource: "Pemerintah Desa Tigawasa",
      transparencyUrl: "https://sid.kemendesa.go.id"
    }
  },
  {
    id: "ruas-desa-ntb-01",
    provinceId: "nusa_tenggara_barat",
    region: "bali_nusra",
    name: "Jalan Poros Desa Rembitan - Sengkol (Kec. Pujut, Lombok Tengah)",
    code: "RUAS-DSA-LTG-001",
    authority: "DESA",
    authorityLabel: "Jalan Desa (Pemerintah Desa Rembitan, Kab. Lombok Tengah)",
    legalBasis: "UU No. 2 Tahun 2022 Pasal 9 & Perbup Lombok Tengah tentang Jalan Desa",
    district: "Desa Rembitan, Kec. Pujut, Kab. Lombok Tengah (Nusa Tenggara Barat)",
    pavementType: "Aspal Lapen & Rabat Beton Dusun",
    condition: "RUSAK_RINGAN",
    lengthKm: 4.3,
    hazardScore: 53,
    hazardLevel: "SEDANG",
    waypoints: [
      [116.2865, -8.8385],
      [116.2925, -8.8285],
      [116.2995, -8.8185]
    ],
    leadership: {
      regionalHead: "Kepala Desa Rembitan",
      agency: "Pemerintah Desa Rembitan & DPMD Kab. Lombok Tengah",
      picName: "TPK Desa Rembitan"
    },
    problemDetails: {
      headline: "Konektivitas Dusun Pertanian & Sentra Tenun Tradisional Desa Rembitan",
      description: "Jalan penghubung antar-dusun di Desa Rembitan menuju jalan arteri Pujut - Mandalika.",
      rootCause: "Tanah lempung ekspansif yang memicu retak memanjang saat musim kemarau.",
      safetyImpact: "Perkuatan lapis pondasi sirtu dan pengecoran rabat beton bertulang."
    },
    budget: {
      paguRp: 960000000,
      contractValueRp: 942000000,
      name: "Pembangunan Rabat Beton Jalan Poros Dusun Desa Rembitan",
      contractor: "Swakelola PKTD Desa Rembitan",
      source: "Dana Desa (APBN) & ADD Lombok Tengah TA 2026",
      fiscalYear: 2026,
      progressPct: 66,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Bupati Lombok Tengah tentang Jalan Desa",
      budgetSource: "Siskeudes Kab. Lombok Tengah",
      fieldDataSource: "Pemerintah Desa Rembitan",
      transparencyUrl: "https://sid.kemendesa.go.id"
    }
  },
  // --- KALIMANTAN ---
  {
    id: "ruas-desa-klb-01",
    provinceId: "kalimantan_barat",
    region: "kalimantan",
    name: "Jalan Poros Desa Sungai Rengas - Pal IX (Kec. Sungai Kakap)",
    code: "RUAS-DSA-KBR-001",
    authority: "DESA",
    authorityLabel: "Jalan Desa (Pemerintah Desa Sungai Rengas, Kab. Kubu Raya)",
    legalBasis: "UU No. 2 Tahun 2022 Pasal 9 & Perbup Kubu Raya tentang Status Jalan Desa",
    district: "Desa Sungai Rengas, Kec. Sungai Kakap, Kab. Kubu Raya (Kalimantan Barat)",
    pavementType: "Rabat Beton Bertulang di Atas Tanah Gambut/Aluvial",
    condition: "RUSAK_RINGAN",
    lengthKm: 3.7,
    hazardScore: 58,
    hazardLevel: "SEDANG",
    waypoints: [
      [109.2685, -0.0525],
      [109.2565, -0.0565],
      [109.2425, -0.0615]
    ],
    leadership: {
      regionalHead: "Kepala Desa Sungai Rengas",
      agency: "Pemerintah Desa Sungai Rengas & Dinas PUPR Kab. Kubu Raya",
      picName: "TPK Desa Sungai Rengas"
    },
    problemDetails: {
      headline: "Penurunan Pelat Beton Jalan Desa pada Lahan Pasang Surut Sungai Kapuas",
      description: "Jalan utama penghubung sentra pertanian jeruk dan sayur Desa Sungai Rengas menuju batas Kota Pontianak.",
      rootCause: "Daya dukung tanah lunak aluvial dan pasang air sungai.",
      safetyImpact: "Pengecoran ulang dengan cerucuk kayu galam dan tulangan wiremesh."
    },
    budget: {
      paguRp: 1180000000,
      contractValueRp: 1150000000,
      name: "Peningkatan Rabat Beton Bertulang Jalan Poros Desa Sungai Rengas",
      contractor: "Swakelola PKTD Desa Sungai Rengas",
      source: "Dana Desa (APBN) & ADD Kab. Kubu Raya TA 2026",
      fiscalYear: 2026,
      progressPct: 62,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Bupati Kubu Raya tentang Ruas Jalan Desa",
      budgetSource: "Siskeudes Kab. Kubu Raya",
      fieldDataSource: "Pemerintah Desa Sungai Rengas",
      transparencyUrl: "https://sid.kemendesa.go.id"
    }
  },
  {
    id: "ruas-desa-klt-01",
    provinceId: "kalimantan_timur",
    region: "kalimantan",
    name: "Jalan Poros Desa Bukit Raya - Sukaraja (Kawasan Penyangga Sepaku IKN)",
    code: "RUAS-DSA-PPU-001",
    authority: "DESA",
    authorityLabel: "Jalan Desa (Pemerintah Desa Bukit Raya, Kab. Penajam Paser Utara)",
    legalBasis: "UU No. 2 Tahun 2022 Pasal 9 & Perbup Penajam Paser Utara tentang Jalan Desa",
    district: "Desa Bukit Raya, Kec. Sepaku, Kab. Penajam Paser Utara (Kalimantan Timur)",
    pavementType: "Rabat Beton K-350 & Agregat Kelas A",
    condition: "RUSAK_RINGAN",
    lengthKm: 4.5,
    hazardScore: 55,
    hazardLevel: "SEDANG",
    waypoints: [
      [116.7625, -0.9525],
      [116.7745, -0.9585],
      [116.7865, -0.9645]
    ],
    leadership: {
      regionalHead: "Kepala Desa Bukit Raya",
      agency: "Pemerintah Desa Bukit Raya & DPMD Kab. Penajam Paser Utara",
      picName: "TPK Desa Bukit Raya Sepaku"
    },
    problemDetails: {
      headline: "Peningkatan Jalan Lingkungan & Usaha Tani Desa Penyangga Pangan IKN",
      description: "Jalan penghubung permukiman warga dan lahan pertanian penyangga logistik pangan di Kecamatan Sepaku.",
      rootCause: "Lonjakan mobilitas kendaraan material dan angkutan pangan lokal.",
      safetyImpact: "Pengecoran rabat beton dan perkuatan gorong-gorong box culvert desa."
    },
    budget: {
      paguRp: 1380000000,
      contractValueRp: 1345000000,
      name: "Semenisasi & Drainase Jalan Poros Desa Bukit Raya Sepaku",
      contractor: "TPK Desa Bukit Raya & Bankeu Pemprov Kaltim",
      source: "Dana Desa & Bantuan Keuangan Provinsi Kaltim TA 2026",
      fiscalYear: 2026,
      progressPct: 71,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Bupati Penajam Paser Utara tentang Jalan Desa",
      budgetSource: "Siskeudes Kab. PPU",
      fieldDataSource: "Pemerintah Desa Bukit Raya",
      transparencyUrl: "https://sid.kemendesa.go.id"
    }
  },
  {
    id: "ruas-desa-klu-01",
    provinceId: "kalimantan_utara",
    region: "kalimantan",
    name: "Jalan Poros Desa Jelarai Selor - Gunung Seriang (Kec. Tanjung Selor)",
    code: "RUAS-DSA-BLG-001",
    authority: "DESA",
    authorityLabel: "Jalan Desa (Pemerintah Desa Jelarai Selor, Kab. Bulungan)",
    legalBasis: "UU No. 2 Tahun 2022 Pasal 9 & Perbup Bulungan tentang Status Jalan Desa",
    district: "Desa Jelarai Selor, Kec. Tanjung Selor, Kab. Bulungan (Kalimantan Utara)",
    pavementType: "Aspal Lapen & Rabat Beton Desa",
    condition: "RUSAK_RINGAN",
    lengthKm: 4.8,
    hazardScore: 52,
    hazardLevel: "SEDANG",
    waypoints: [
      [117.3925, 2.8285],
      [117.4045, 2.8185],
      [117.4165, 2.8085]
    ],
    leadership: {
      regionalHead: "Kepala Desa Jelarai Selor",
      agency: "Pemerintah Desa Jelarai Selor & DPMD Kab. Bulungan",
      picName: "TPK Desa Jelarai Selor"
    },
    problemDetails: {
      headline: "Konektivitas Permukiman Desa Jelarai Selor ke Ibu Kota Provinsi Kaltara",
      description: "Jalan poros penghubung permukiman dan sentra pertanian Desa Jelarai Selor di pinggiran Tanjung Selor.",
      rootCause: "Genangan air hujan pada cekungan jalan dan erosi parit tanah.",
      safetyImpact: "Peninggian badan jalan dan pengecoran rabat beton."
    },
    budget: {
      paguRp: 1050000000,
      contractValueRp: 1020000000,
      name: "Peningkatan Jalan Poros & Gorong-Gorong Desa Jelarai Selor",
      contractor: "Swakelola PKTD Desa Jelarai Selor",
      source: "Dana Desa (APBN) & ADD Kab. Bulungan TA 2026",
      fiscalYear: 2026,
      progressPct: 69,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Bupati Bulungan tentang Inventarisasi Jalan Desa",
      budgetSource: "Siskeudes Kab. Bulungan",
      fieldDataSource: "Pemerintah Desa Jelarai Selor",
      transparencyUrl: "https://sid.kemendesa.go.id"
    }
  },
  // --- SULAWESI ---
  {
    id: "ruas-desa-sls-01",
    provinceId: "sulawesi_selatan",
    region: "sulawesi",
    name: "Jalan Poros Desa Salenrang - Rammang-Rammang (Kec. Bontoa, Kab. Maros)",
    code: "RUAS-DSA-MRS-001",
    authority: "DESA",
    authorityLabel: "Jalan Desa (Pemerintah Desa Salenrang, Kab. Maros)",
    legalBasis: "UU No. 2 Tahun 2022 Pasal 9 & Perbup Maros tentang Penetapan Jalan Desa",
    district: "Desa Salenrang, Kec. Bontoa, Kab. Maros (Sulawesi Selatan)",
    pavementType: "Rabat Beton K-300 & Talud Batu Gunung",
    condition: "MANTAP",
    lengthKm: 3.9,
    hazardScore: 34,
    hazardLevel: "RENDAH",
    waypoints: [
      [119.5885, -4.9325],
      [119.6025, -4.9295],
      [119.6165, -4.9265]
    ],
    leadership: {
      regionalHead: "Kepala Desa Salenrang",
      agency: "Pemerintah Desa Salenrang & Dinas PMD Kab. Maros",
      picName: "TPK Desa Salenrang"
    },
    problemDetails: {
      headline: "Akses Persawahan Karst & Dermaga Ekowisata Rammang-Rammang",
      description: "Jalan poros desa yang menghubungkan jalan nasional Maros-Pangkep dengan permukiman warga dan Geopark Karst Maros.",
      rootCause: "Tanah dasar persawahan yang rentan retak saat musim hujan.",
      safetyImpact: "Perkuatan talud penahan tepi sawah dan pemeliharaan beton jalan."
    },
    budget: {
      paguRp: 990000000,
      contractValueRp: 970000000,
      name: "Peningkatan Rabat Beton & Talud Jalan Desa Salenrang",
      contractor: "Swakelola PKTD Desa Salenrang",
      source: "Dana Desa (APBN) & ADD Kab. Maros TA 2026",
      fiscalYear: 2026,
      progressPct: 85,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Bupati Maros tentang Status Jalan Desa",
      budgetSource: "Siskeudes Kab. Maros",
      fieldDataSource: "Pemerintah Desa Salenrang",
      transparencyUrl: "https://sid.kemendesa.go.id"
    }
  },
  {
    id: "ruas-desa-slu-01",
    provinceId: "sulawesi_utara",
    region: "sulawesi",
    name: "Jalan Poros Desa Wori - Tiwoho (Pesisir Minahasa Utara)",
    code: "RUAS-DSA-MNU-001",
    authority: "DESA",
    authorityLabel: "Jalan Desa (Pemerintah Desa Wori, Kab. Minahasa Utara)",
    legalBasis: "UU No. 2 Tahun 2022 Pasal 9 & Perbup Minahasa Utara tentang Jalan Desa",
    district: "Desa Wori, Kec. Wori, Kab. Minahasa Utara (Sulawesi Utara)",
    pavementType: "Aspal Lapen & Rabat Beton Lingkungan",
    condition: "RUSAK_RINGAN",
    lengthKm: 4.1,
    hazardScore: 51,
    hazardLevel: "SEDANG",
    waypoints: [
      [124.8625, 1.5925],
      [124.8565, 1.5815],
      [124.8515, 1.5715]
    ],
    leadership: {
      regionalHead: "Hukum Tua (Kepala Desa) Wori",
      agency: "Pemerintah Desa Wori & Dinas PMD Kab. Minahasa Utara",
      picName: "TPK Desa Wori"
    },
    problemDetails: {
      headline: "Rehabilitasi Jalan Produksi Kelapa Kopra & Nelayan Pesisir Wori",
      description: "Jalan penghubung permukiman warga dan perkebunan kelapa rakyat di pesisir utara Minahasa.",
      rootCause: "Gerusan air hujan dan angkutan hasil bumi.",
      safetyImpact: "Perbaikan saluran drainase batu kali dan pelapisan rabat beton."
    },
    budget: {
      paguRp: 870000000,
      contractValueRp: 855000000,
      name: "Pembangunan Rabat Beton & Drainase Jalan Desa Wori",
      contractor: "Swakelola PKTD Desa Wori",
      source: "Dana Desa (APBN) & ADD Minahasa Utara TA 2026",
      fiscalYear: 2026,
      progressPct: 73,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Bupati Minahasa Utara tentang Jalan Desa",
      budgetSource: "Siskeudes Kab. Minahasa Utara",
      fieldDataSource: "Pemerintah Desa Wori",
      transparencyUrl: "https://sid.kemendesa.go.id"
    }
  },
  // --- MALUKU & PAPUA ---
  {
    id: "ruas-desa-mlk-01",
    provinceId: "maluku",
    region: "maluku_papua",
    name: "Jalan Poros Negeri Hila - Kaitetu (Kec. Leihitu, Kab. Maluku Tengah)",
    code: "RUAS-DSA-MLT-001",
    authority: "DESA",
    authorityLabel: "Jalan Desa / Negeri (Pemerintah Negeri Hila, Kab. Maluku Tengah)",
    legalBasis: "UU No. 2 Tahun 2022 Pasal 9 & Perbup Maluku Tengah tentang Jalan Negeri/Desa",
    district: "Negeri Hila, Kec. Leihitu, Kab. Maluku Tengah (Maluku)",
    pavementType: "Rabat Beton & Aspal Lapen Pesisir",
    condition: "MANTAP",
    lengthKm: 3.3,
    hazardScore: 36,
    hazardLevel: "RENDAH",
    waypoints: [
      [128.0815, -3.5845],
      [128.0895, -3.5835],
      [128.0985, -3.5825]
    ],
    leadership: {
      regionalHead: "Raja Negeri (Kepala Desa) Hila",
      agency: "Pemerintah Negeri Hila & DPMN Kab. Maluku Tengah",
      picName: "TPK Negeri Hila"
    },
    problemDetails: {
      headline: "Konektivitas Permukiman Pesisir Leihitu & Kawasan Cagar Budaya",
      description: "Jalan lingkungan dan poros ekonomi masyarakat nelayan serta kebun pala/cengkeh di Negeri Hila.",
      rootCause: "Abrasi gelombang pasang dan limpasan air sungai kecil.",
      safetyImpact: "Perkuatan talud pantai dan rabat beton lingkungan."
    },
    budget: {
      paguRp: 860000000,
      contractValueRp: 845000000,
      name: "Peningkatan Jalan Lingkungan & Talud Pengaman Negeri Hila",
      contractor: "Swakelola PKTD Negeri Hila",
      source: "Dana Desa (APBN) & Alokasi Dana Negeri TA 2026",
      fiscalYear: 2026,
      progressPct: 82,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Bupati Maluku Tengah tentang Jalan Negeri",
      budgetSource: "Siskeudes Kab. Maluku Tengah",
      fieldDataSource: "Pemerintah Negeri Hila",
      transparencyUrl: "https://sid.kemendesa.go.id"
    }
  },
  {
    id: "ruas-desa-ppu-01",
    provinceId: "papua",
    region: "maluku_papua",
    name: "Jalan Poros Kampung Doyo Baru - Bambar (Distrik Waibu, Kab. Jayapura)",
    code: "RUAS-DSA-JYP-001",
    authority: "DESA",
    authorityLabel: "Jalan Kampung / Desa (Pemerintah Kampung Doyo Baru, Kab. Jayapura)",
    legalBasis: "UU No. 2 Tahun 2022 Pasal 9 & Perbup Jayapura tentang Status Jalan Kampung",
    district: "Kampung Doyo Baru, Distrik Waibu, Kab. Jayapura (Papua)",
    pavementType: "Rabat Beton Bertulang & Sirtu Padat",
    condition: "RUSAK_RINGAN",
    lengthKm: 3.8,
    hazardScore: 54,
    hazardLevel: "SEDANG",
    waypoints: [
      [140.4625, -2.5585],
      [140.4715, -2.5525],
      [140.4815, -2.5465]
    ],
    leadership: {
      regionalHead: "Kepala Kampung (Ondoafi/Kakam) Doyo Baru",
      agency: "Pemerintah Kampung Doyo Baru & DPMK Kab. Jayapura",
      picName: "TPK Kampung Doyo Baru"
    },
    problemDetails: {
      headline: "Akses Kebun Sagu & Permukiman Warga di Tepian Barat Danau Sentani",
      description: "Jalan poros kampung yang menghubungkan rumah warga dan kebun komoditas lokal menuju jalan arteri Sentani.",
      rootCause: "Limpasan air dari Pegunungan Cycloop saat hujan lebat.",
      safetyImpact: "Pengecoran rabat beton dan pembuatan saluran drainase batu kali."
    },
    budget: {
      paguRp: 1150000000,
      contractValueRp: 1125000000,
      name: "Pembangunan Rabat Beton & Drainase Jalan Poros Kampung Doyo Baru",
      contractor: "Swakelola PKTD Kampung Doyo Baru",
      source: "Dana Desa (APBN) & Dana Kampung Otsus Papua TA 2026",
      fiscalYear: 2026,
      progressPct: 67,
      progressStatus: "BERJALAN",
      matchConfidence: "TERKONFIRMASI"
    },
    officialSources: {
      authoritySource: "SK Bupati Jayapura tentang Inventarisasi Jalan Kampung",
      budgetSource: "Siskeudes Kab. Jayapura",
      fieldDataSource: "Pemerintah Kampung Doyo Baru",
      transparencyUrl: "https://sid.kemendesa.go.id"
    }
  }
];

async function fetchOsrmGeometry(corridor) {
  const wpStr = corridor.waypoints.map((pt) => `${pt[0]},${pt[1]}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${wpStr}?overview=full&geometries=geojson`;
  let coordinates = [];
  let actualKm = corridor.lengthKm;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "JagaJalan-CivicGIS/2.0" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.code === "Ok" && data.routes?.length > 0) {
        const route = data.routes[0];
        coordinates = route.geometry.coordinates.map((pt) => [
          Number(pt[1].toFixed(5)),
          Number(pt[0].toFixed(5)),
        ]);
        actualKm = Math.max(1.2, Number((route.distance / 1000).toFixed(1)));
        console.log(`  [OSRM OK] ${corridor.name}: ${coordinates.length} pts (${actualKm} km)`);
      }
    }
  } catch (err) {
    console.warn(`  [OSRM Fallback] ${corridor.name}: ${err.message}`);
  }

  if (!coordinates || coordinates.length < 2) {
    coordinates = corridor.waypoints.map((pt) => [
      Number(pt[1].toFixed(5)),
      Number(pt[0].toFixed(5)),
    ]);
  }

  const midIdx = Math.floor(coordinates.length / 2);
  const center = coordinates[midIdx] || [
    corridor.waypoints[0][1],
    corridor.waypoints[0][0],
  ];

  const stepKm = Math.max(0.8, Number((actualKm / 3).toFixed(1)));
  const milestones = [
    {
      km: 0,
      name: `Titik Awal: ${corridor.name.split(" - ")[0]}`,
      status: corridor.condition,
      note: `Akses Wilayah ${corridor.district.split(" (")[0]}`,
    },
    {
      km: stepKm,
      name: `Segmen Tengah ${corridor.district.split(",")[0]}`,
      status: corridor.condition,
      note:
        corridor.authority === "DESA"
          ? "Konektivitas Permukiman Desa & Sentra Produksi Warga"
          : "Konektivitas Permukiman & Sentra Niaga Perkotaan",
    },
    {
      km: actualKm,
      name: `Titik Akhir: ${corridor.name.split(" - ").pop()}`,
      status: corridor.condition,
      note:
        corridor.authority === "DESA"
          ? "Batas Kewenangan Pemerintah Desa"
          : "Batas Kewenangan Penyelenggara Daerah",
    },
  ];

  const { waypoints, ...rest } = corridor;
  return {
    ...rest,
    center,
    lengthKm: actualKm,
    activeReportsCount: corridor.condition === "RUSAK_BERAT" ? 1 : 0,
    milestones,
    coordinates,
  };
}

async function main() {
  const cityFile = path.resolve("jagajalan/src/data/cityRegencyRoadsData.json");
  const villageFile = path.resolve("jagajalan/src/data/villageRoadsData.json");

  const existingCity = JSON.parse(fs.readFileSync(cityFile, "utf8"));
  const newIds = new Set(NEW_CITY_REGENCY_CORRIDORS.map((c) => c.id));
  const retainedCity = existingCity.filter((c) => !newIds.has(c.id));

  console.log("1. Fetching OSRM geometries for new City/Regency roads...");
  const addedCity = [];
  for (const c of NEW_CITY_REGENCY_CORRIDORS) {
    const built = await fetchOsrmGeometry(c);
    addedCity.push(built);
    await new Promise((r) => setTimeout(r, 250));
  }

  const mergedCity = [...retainedCity, ...addedCity];
  fs.writeFileSync(cityFile, JSON.stringify(mergedCity, null, 2), "utf8");
  console.log(`Saved ${mergedCity.length} total City/Regency roads to ${cityFile}`);

  console.log("2. Fetching OSRM geometries for Village (DESA) roads across all islands...");
  const builtVillages = [];
  for (const v of VILLAGE_ROADS_CORRIDORS) {
    const built = await fetchOsrmGeometry(v);
    builtVillages.push(built);
    await new Promise((r) => setTimeout(r, 250));
  }

  fs.writeFileSync(villageFile, JSON.stringify(builtVillages, null, 2), "utf8");
  console.log(`Saved ${builtVillages.length} Village (DESA) roads to ${villageFile}`);
}

main();
