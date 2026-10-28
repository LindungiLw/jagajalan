// Data Ruas Jalan Terverifikasi JagaJalan
// Wilayah Fokus: JALAN NASIONAL, JALAN PROVINSI STRATEGIS SE-INDONESIA, & PILOT SUMATERA UTARA
// Terintegrasi dengan Kepala Daerah / Pejabat Penanggung Jawab, Data LPSE, dan SIGI PU

import sumutRoads from "./sumutRoadsData.json";
import nationalHighways from "./nationalHighwaysData.json";
import provincialRoads from "./provincialRoadsData.json";

// 1. Data Koridor Ruas Percontohan Sumatera Utara (Medan, Simalungun, Karo, Asahan)
export const SUMATERA_UTARA_ROADS = sumutRoads;

// 2. Data Koridor Arteri Jalan Nasional Seluruh Indonesia (SK MenPUPR No. 1688/2022)
export const NATIONAL_HIGHWAYS_INDONESIA = nationalHighways;

// 3. Data Koridor Arteri Jalan Provinsi Strategis Seluruh Indonesia (SK Gubernur Masing-Masing Pemprov)
export const PROVINCIAL_ROADS_INDONESIA = provincialRoads;

// 4. Gabungan Seluruh Ruas Terdata JagaJalan
export const ALL_ROADS = [
  ...SUMATERA_UTARA_ROADS,
  ...NATIONAL_HIGHWAYS_INDONESIA,
  ...PROVINCIAL_ROADS_INDONESIA,
];

// Default Active Segments: ALL_ROADS
export const ROAD_SEGMENTS = ALL_ROADS;

export const INDONESIA_REGIONS = [
  {
    id: "all",
    name: "Seluruh Indonesia (Jalan Nasional)",
    island: "Nasional",
    center: [-2.5489, 118.0149],
    zoom: 5,
    description: "Jaringan 20 koridor arteri primer Jalan Nasional melintasi 38 provinsi di bawah SK Menteri PUPR No. 1688/KPTS/M/2022."
  },
  {
    id: "sumatera",
    name: "Pulau Sumatera (Jalintim, Jalinteng, Jalinbar)",
    island: "Sumatera",
    center: [0.5897, 101.3431],
    zoom: 6,
    description: "Tiga tulang punggung arteri primer Sumatera: Lintas Timur (2.150 km), Lintas Tengah (1.840 km), dan Lintas Barat (2.350 km)."
  },
  {
    id: "sumut",
    name: "Sumatera Utara (Fokus Pilot)",
    island: "Sumatera",
    center: [3.5952, 98.6722],
    zoom: 11,
    description: "Wilayah percontohan transparansi anggaran dan pengaduan jalan rusak: Medan, Simalungun, Karo, dan Asahan."
  },
  {
    id: "jawa",
    name: "Pulau Jawa (Pantura, Tengah, Pansela)",
    island: "Jawa",
    center: [-7.1509, 110.1402],
    zoom: 7,
    description: "Koridor Pantura (1.316 km), Lintas Tengah (860 km), dan Jalur Pansela Pantai Selatan (1.540 km)."
  },
  {
    id: "bali_nusra",
    name: "Bali & Nusa Tenggara (Trans Bali, Flores, Timor)",
    island: "Bali & Nusa Tenggara",
    center: [-8.6500, 119.5000],
    zoom: 7,
    description: "Trans Bali (Gilimanuk - Padangbai), Trans Lombok-Sumbawa NTB, Trans Flores, dan Sabuk Merah Timor NTT."
  },
  {
    id: "kalimantan",
    name: "Pulau Kalimantan (Trans Kalimantan & IKN)",
    island: "Kalimantan",
    center: [-1.2379, 114.5908],
    zoom: 6,
    description: "Trans Kalimantan Poros Selatan, Poros Timur Kaltim, Koridor Akses KIPP IKN Nusantara, dan Sabuk Perbatasan."
  },
  {
    id: "sulawesi",
    name: "Pulau Sulawesi (Trans Sulawesi)",
    island: "Sulawesi",
    center: [-2.5000, 120.5000],
    zoom: 6,
    description: "Trans Sulawesi Poros Barat (Makassar-Palu), Poros Utara (Palu-Manado), dan Poros Tenggara (Makassar-Kendari)."
  },
  {
    id: "maluku_papua",
    name: "Maluku & Papua (Trans Seram, Trans Papua)",
    island: "Maluku & Papua",
    center: [-3.5000, 137.5000],
    zoom: 6,
    description: "Trans Pulau Seram Maluku, Trans Papua Sentani-Wamena, Trans Papua Merauke-Boven Digoel, dan Trans Papua Barat."
  }
];

// Ringkasan Statistik Jaringan Jalan Resmi Indonesia (BPS & Ditjen Bina Marga Kementerian PU)
export const PROVINCIAL_NETWORK_STATS = {
  totalProvincialKmIndonesia: 54544.75,
  totalNationalKmIndonesia: 47017.0,
  totalKabupatenKotaKmIndonesia: 445000.0,
  totalProvinces: 38,
  activeCuratedProvincialCorridors: 20,
  activeCuratedNationalCorridors: 21,
  activeCuratedPilotRoads: 6,
  dataSource: "PUSDATIN SIGI Kementerian PU x BPS Statistik Transportasi Darat x SK Gubernur Se-Indonesia",
};

// Katalog 38 Provinsi Indonesia dengan Data Kewenangan Jalan Provinsi Resmi
export const INDONESIA_PROVINCES = [
  {
    id: "aceh",
    name: "Aceh",
    region: "sumatera",
    capital: "Banda Aceh",
    center: [4.695, 96.749],
    zoom: 8,
    governor: "Dr. H. Safrizal ZA, M.Si. (Pj. Gubernur Aceh)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Pemerintah Aceh",
    totalProvincialKm: 1780.20,
    skNumber: "SK Gubernur Aceh No. 620/124/2021",
    hasPilotCorridor: false,
  },
  {
    id: "sumatera_utara",
    name: "Sumatera Utara",
    region: "sumatera",
    capital: "Medan",
    center: [3.595, 98.672],
    zoom: 8,
    governor: "Dr. Drs. A. Fatoni, M.Si. (Pj. Gubernur Sumut)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Sumatera Utara",
    totalProvincialKm: 3005.65,
    skNumber: "SK Gubernur Sumut No. 188.44/578/KPTS/2023",
    hasPilotCorridor: true,
  },
  {
    id: "sumatera_barat",
    name: "Sumatera Barat",
    region: "sumatera",
    capital: "Padang",
    center: [-0.949, 100.417],
    zoom: 8,
    governor: "H. Mahyeldi Ansharullah, S.P. (Gubernur Sumbar)",
    agency: "Dinas Bina Marga, Cipta Karya dan Tata Ruang Provinsi Sumatera Barat",
    totalProvincialKm: 1520.40,
    skNumber: "SK Gubernur Sumbar No. 620-2023",
    hasPilotCorridor: true,
  },
  {
    id: "riau",
    name: "Riau",
    region: "sumatera",
    capital: "Pekanbaru",
    center: [0.507, 101.447],
    zoom: 8,
    governor: "Dr. Rahman Hadi, M.Si. (Pj. Gubernur Riau)",
    agency: "Dinas PUPR, Perumahan, Kawasan Permukiman dan Pertanahan Provinsi Riau",
    totalProvincialKm: 2799.80,
    skNumber: "SK Gubernur Riau No. Kpts.882/XI/2021",
    hasPilotCorridor: false,
  },
  {
    id: "kepulauan_riau",
    name: "Kepulauan Riau",
    region: "sumatera",
    capital: "Tanjung Pinang",
    center: [0.916, 104.457],
    zoom: 8,
    governor: "H. Ansar Ahmad, S.E., M.M. (Gubernur Kepri)",
    agency: "Dinas Pekerjaan Umum, Penataan Ruang dan Pertanahan Provinsi Kepri",
    totalProvincialKm: 433.20,
    skNumber: "SK Gubernur Kepri No. 1205/2022",
    hasPilotCorridor: false,
  },
  {
    id: "jambi",
    name: "Jambi",
    region: "sumatera",
    capital: "Jambi",
    center: [-1.610, 103.613],
    zoom: 8,
    governor: "Dr. H. Al Haris, S.Sos., M.H. (Gubernur Jambi)",
    agency: "Dinas Pekerjaan Umum dan Perumahan Rakyat Provinsi Jambi",
    totalProvincialKm: 1032.50,
    skNumber: "SK Gubernur Jambi No. 248/KEP.GUB/D-PUPR/2022",
    hasPilotCorridor: false,
  },
  {
    id: "sumatera_selatan",
    name: "Sumatera Selatan",
    region: "sumatera",
    capital: "Palembang",
    center: [-2.976, 104.775],
    zoom: 8,
    governor: "Elen Setiadi, S.H., M.S.E. (Pj. Gubernur Sumsel)",
    agency: "Dinas Pengelolaan Sumber Daya Air dan Bina Marga Provinsi Sumsel",
    totalProvincialKm: 1513.60,
    skNumber: "SK Gubernur Sumsel No. 675/KPTS/PUBM-TR/2021",
    hasPilotCorridor: false,
  },
  {
    id: "bengkulu",
    name: "Bengkulu",
    region: "sumatera",
    capital: "Bengkulu",
    center: [-3.800, 102.265],
    zoom: 8,
    governor: "Prof. Dr. H. Rohidin Mersyah (Gubernur Bengkulu)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Bengkulu",
    totalProvincialKm: 1560.00,
    skNumber: "SK Gubernur Bengkulu No. G.385.DPU-TR/2021",
    hasPilotCorridor: false,
  },
  {
    id: "lampung",
    name: "Lampung",
    region: "sumatera",
    capital: "Bandar Lampung",
    center: [-5.450, 105.266],
    zoom: 8,
    governor: "Dr. Drs. Samsudin, S.H., M.H., M.Pd. (Pj. Gubernur Lampung)",
    agency: "Dinas Bina Marga dan Bina Konstruksi Provinsi Lampung",
    totalProvincialKm: 1693.30,
    skNumber: "SK Gubernur Lampung No. G/244/B.IV/HK/2023",
    hasPilotCorridor: false,
  },
  {
    id: "bangka_belitung",
    name: "Kep. Bangka Belitung",
    region: "sumatera",
    capital: "Pangkal Pinang",
    center: [-2.132, 106.113],
    zoom: 8,
    governor: "Sugito, S.Sos., M.H. (Pj. Gubernur Babel)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Kepulauan Babel",
    totalProvincialKm: 850.40,
    skNumber: "SK Gubernur Babel No. 188.44/621/PUPR/2021",
    hasPilotCorridor: false,
  },
  {
    id: "dki_jakarta",
    name: "DKI Jakarta",
    region: "jawa",
    capital: "Jakarta Pusat",
    center: [-6.2088, 106.8456],
    zoom: 11,
    governor: "Teguh Setyabudi, M.Pd. (Pj. Gubernur DKI Jakarta)",
    agency: "Dinas Bina Marga Provinsi DKI Jakarta",
    totalProvincialKm: 1220.00,
    skNumber: "SK Gubernur DKI Jakarta No. 1290/2021",
    hasPilotCorridor: true,
  },
  {
    id: "jawa_barat",
    name: "Jawa Barat",
    region: "jawa",
    capital: "Bandung",
    center: [-6.9175, 107.6191],
    zoom: 8,
    governor: "Bey Triadi Machmudin, S.E., M.T. (Pj. Gubernur Jawa Barat)",
    agency: "Dinas Bina Marga dan Penataan Ruang (DBMPR) Provinsi Jawa Barat",
    totalProvincialKm: 2360.58,
    skNumber: "SK Gubernur Jawa Barat No. 620/Kep.784-DBMPR/2021",
    hasPilotCorridor: true,
  },
  {
    id: "jawa_tengah",
    name: "Jawa Tengah",
    region: "jawa",
    capital: "Semarang",
    center: [-6.9667, 110.4167],
    zoom: 8,
    governor: "Komjen Pol (Purn) Drs. Nana Sudjana, M.M. (Pj. Gubernur Jateng)",
    agency: "Dinas Pekerjaan Umum Bina Marga dan Cipta Karya Jawa Tengah",
    totalProvincialKm: 2565.60,
    skNumber: "SK Gubernur Jawa Tengah No. 620/12/2022",
    hasPilotCorridor: true,
  },
  {
    id: "di_yogyakarta",
    name: "D.I. Yogyakarta",
    region: "jawa",
    capital: "Yogyakarta",
    center: [-7.7956, 110.3695],
    zoom: 10,
    governor: "Sri Sultan Hamengku Buwono X (Gubernur DIY)",
    agency: "Dinas Pekerjaan Umum, Perumahan dan Energi Sumber Daya Mineral DIY",
    totalProvincialKm: 762.00,
    skNumber: "SK Gubernur DIY No. 354/KPTS/2022",
    hasPilotCorridor: true,
  },
  {
    id: "jawa_timur",
    name: "Jawa Timur",
    region: "jawa",
    capital: "Surabaya",
    center: [-7.2575, 112.7521],
    zoom: 8,
    governor: "Adhy Karyono, A.Ks., M.A.P. (Pj. Gubernur Jawa Timur)",
    agency: "Dinas Pekerjaan Umum Bina Marga Provinsi Jawa Timur",
    totalProvincialKm: 1421.00,
    skNumber: "SK Gubernur Jawa Timur No. 188/875/KPTS/013/2022",
    hasPilotCorridor: true,
  },
  {
    id: "banten",
    name: "Banten",
    region: "jawa",
    capital: "Serang",
    center: [-6.1200, 106.1503],
    zoom: 9,
    governor: "Al Muktabar (Pj. Gubernur Banten)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Banten",
    totalProvincialKm: 786.10,
    skNumber: "SK Gubernur Banten No. 620/Kep.180-Huk/2023",
    hasPilotCorridor: true,
  },
  {
    id: "bali",
    name: "Bali",
    region: "bali_nusra",
    capital: "Denpasar",
    center: [-8.4095, 115.1889],
    zoom: 9,
    governor: "Sang Made Mahendra Jaya (Pj. Gubernur Bali)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Bali",
    totalProvincialKm: 859.00,
    skNumber: "SK Gubernur Bali No. 1045/03-C/HK/2022",
    hasPilotCorridor: true,
  },
  {
    id: "nusa_tenggara_barat",
    name: "Nusa Tenggara Barat",
    region: "bali_nusra",
    capital: "Mataram",
    center: [-8.5833, 116.1167],
    zoom: 8,
    governor: "Hassanudin (Pj. Gubernur NTB)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi NTB",
    totalProvincialKm: 1484.40,
    skNumber: "SK Gubernur NTB No. 620-410 Tahun 2021",
    hasPilotCorridor: true,
  },
  {
    id: "nusa_tenggara_timur",
    name: "Nusa Tenggara Timur",
    region: "bali_nusra",
    capital: "Kupang",
    center: [-8.6574, 121.0794],
    zoom: 8,
    governor: "Andriko Noto Susanto (Pj. Gubernur NTT)",
    agency: "Dinas Pekerjaan Umum dan Perumahan Rakyat Provinsi NTT",
    totalProvincialKm: 2650.00,
    skNumber: "SK Gubernur NTT No. 348/KEP/HK/2020",
    hasPilotCorridor: true,
  },
  {
    id: "kalimantan_barat",
    name: "Kalimantan Barat",
    region: "kalimantan",
    capital: "Pontianak",
    center: [-0.0263, 109.3425],
    zoom: 7,
    governor: "Harisson (Pj. Gubernur Kalbar)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Kalimantan Barat",
    totalProvincialKm: 1512.80,
    skNumber: "SK Gubernur Kalbar No. 505/DISPUPR/2023",
    hasPilotCorridor: true,
  },
  {
    id: "kalimantan_tengah",
    name: "Kalimantan Tengah",
    region: "kalimantan",
    capital: "Palangka Raya",
    center: [-2.2161, 113.9139],
    zoom: 7,
    governor: "H. Sugianto Sabran (Gubernur Kalteng)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Kalteng",
    totalProvincialKm: 1272.00,
    skNumber: "SK Gubernur Kalteng No. 188.44/420/2021",
    hasPilotCorridor: false,
  },
  {
    id: "kalimantan_selatan",
    name: "Kalimantan Selatan",
    region: "kalimantan",
    capital: "Banjarmasin",
    center: [-3.3194, 114.5908],
    zoom: 8,
    governor: "H. Sahbirin Noor (Gubernur Kalsel)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Kalsel",
    totalProvincialKm: 874.50,
    skNumber: "SK Gubernur Kalsel No. 188.44/0488/KUM/2021",
    hasPilotCorridor: false,
  },
  {
    id: "kalimantan_timur",
    name: "Kalimantan Timur (Mitra IKN)",
    region: "kalimantan",
    capital: "Samarinda",
    center: [-0.5022, 117.1537],
    zoom: 7,
    governor: "Akmal Malik (Pj. Gubernur Kaltim)",
    agency: "Dinas Pekerjaan Umum Penataan Ruang & Perumahan Rakyat Kaltim",
    totalProvincialKm: 895.30,
    skNumber: "SK Gubernur Kaltim No. 620/K.345/2022",
    hasPilotCorridor: true,
  },
  {
    id: "kalimantan_utara",
    name: "Kalimantan Utara",
    region: "kalimantan",
    capital: "Tanjung Selor",
    center: [2.8375, 117.3653],
    zoom: 7,
    governor: "Dr. Ir. H. Zainal Arifin Paliwang, S.H., M.Hum. (Gubernur Kaltara)",
    agency: "Dinas Pekerjaan Umum, Penataan Ruang, Perumahan dan Kawasan Permukiman Kaltara",
    totalProvincialKm: 866.00,
    skNumber: "SK Gubernur Kaltara No. 188.44/K.578/2021",
    hasPilotCorridor: false,
  },
  {
    id: "sulawesi_utara",
    name: "Sulawesi Utara",
    region: "sulawesi",
    capital: "Manado",
    center: [1.4748, 124.8428],
    zoom: 8,
    governor: "Olly Dondokambey, S.E. (Gubernur Sulut)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Daerah Provinsi Sulut",
    totalProvincialKm: 1643.00,
    skNumber: "SK Gubernur Sulut No. 182 Tahun 2021",
    hasPilotCorridor: true,
  },
  {
    id: "gorontalo",
    name: "Gorontalo",
    region: "sulawesi",
    capital: "Gorontalo",
    center: [0.5407, 123.0595],
    zoom: 8,
    governor: "Rudy Salahuddin (Pj. Gubernur Gorontalo)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Gorontalo",
    totalProvincialKm: 345.00,
    skNumber: "SK Gubernur Gorontalo No. 240/18/VIII/2021",
    hasPilotCorridor: false,
  },
  {
    id: "sulawesi_tengah",
    name: "Sulawesi Tengah",
    region: "sulawesi",
    capital: "Palu",
    center: [-0.8917, 119.8707],
    zoom: 7,
    governor: "H. Rusdy Mastura (Gubernur Sulteng)",
    agency: "Dinas Bina Marga dan Penataan Ruang Provinsi Sulawesi Tengah",
    totalProvincialKm: 1632.00,
    skNumber: "SK Gubernur Sulteng No. 620/338/DIS.BMPR-G.ST/2022",
    hasPilotCorridor: false,
  },
  {
    id: "sulawesi_barat",
    name: "Sulawesi Barat",
    region: "sulawesi",
    capital: "Mamuju",
    center: [-2.6772, 118.8879],
    zoom: 8,
    governor: "Bahtiar Baharuddin (Pj. Gubernur Sulbar)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Sulawesi Barat",
    totalProvincialKm: 510.00,
    skNumber: "SK Gubernur Sulbar No. 188.4/426/2021",
    hasPilotCorridor: false,
  },
  {
    id: "sulawesi_selatan",
    name: "Sulawesi Selatan",
    region: "sulawesi",
    capital: "Makassar",
    center: [-5.1477, 119.4327],
    zoom: 8,
    governor: "Prof. Zudan Arif Fakrulloh (Pj. Gubernur Sulsel)",
    agency: "Dinas Bina Marga dan Bina Konstruksi Provinsi Sulawesi Selatan",
    totalProvincialKm: 1842.00,
    skNumber: "SK Gubernur Sulsel No. 1120/IV/Tahun 2023",
    hasPilotCorridor: true,
  },
  {
    id: "sulawesi_tenggara",
    name: "Sulawesi Tenggara",
    region: "sulawesi",
    capital: "Kendari",
    center: [-3.9985, 122.5126],
    zoom: 8,
    governor: "Andap Budhi Revianto (Pj. Gubernur Sultra)",
    agency: "Dinas Sumber Daya Air dan Bina Marga Provinsi Sulawesi Tenggara",
    totalProvincialKm: 1012.00,
    skNumber: "SK Gubernur Sultra No. 420 Tahun 2021",
    hasPilotCorridor: false,
  },
  {
    id: "maluku",
    name: "Maluku",
    region: "maluku_papua",
    capital: "Ambon",
    center: [-3.6547, 128.1906],
    zoom: 8,
    governor: "Sadali Ie (Pj. Gubernur Maluku)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Maluku",
    totalProvincialKm: 1120.00,
    skNumber: "SK Gubernur Maluku No. 382 Tahun 2021",
    hasPilotCorridor: false,
  },
  {
    id: "maluku_utara",
    name: "Maluku Utara",
    region: "maluku_papua",
    capital: "Sofifi",
    center: [0.7303, 127.5683],
    zoom: 8,
    governor: "Samsuddin Abdul Kadir (Pj. Gubernur Malut)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Maluku Utara",
    totalProvincialKm: 1320.00,
    skNumber: "SK Gubernur Malut No. 290/KPTS/MU/2021",
    hasPilotCorridor: false,
  },
  {
    id: "papua",
    name: "Papua",
    region: "maluku_papua",
    capital: "Jayapura",
    center: [-2.5337, 140.7181],
    zoom: 8,
    governor: "Ramses Limbong (Pj. Gubernur Papua)",
    agency: "Dinas Pekerjaan Umum, Penataan Ruang, Perumahan dan Kawasan Permukiman Papua",
    totalProvincialKm: 1280.00,
    skNumber: "SK Gubernur Papua No. 188.4/290/2021",
    hasPilotCorridor: true,
  },
  {
    id: "papua_barat",
    name: "Papua Barat",
    region: "maluku_papua",
    capital: "Manokwari",
    center: [-0.8615, 134.0620],
    zoom: 8,
    governor: "Ali Baham Temongmere (Pj. Gubernur Papua Barat)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Papua Barat",
    totalProvincialKm: 1040.00,
    skNumber: "SK Gubernur Papua Barat No. 188.45/140/2021",
    hasPilotCorridor: false,
  },
  {
    id: "papua_selatan",
    name: "Papua Selatan",
    region: "maluku_papua",
    capital: "Merauke",
    center: [-8.4991, 140.4011],
    zoom: 7,
    governor: "Rudy Sufahriadi (Pj. Gubernur Papua Selatan)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Papua Selatan",
    totalProvincialKm: 920.00,
    skNumber: "SK Gubernur Papua Selatan No. 620/012/2023",
    hasPilotCorridor: false,
  },
  {
    id: "papua_tengah",
    name: "Papua Tengah",
    region: "maluku_papua",
    capital: "Nabire",
    center: [-3.3667, 135.5000],
    zoom: 7,
    governor: "Ribka Haluk (Pj. Gubernur Papua Tengah)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Papua Tengah",
    totalProvincialKm: 890.00,
    skNumber: "SK Gubernur Papua Tengah No. 620/024/2023",
    hasPilotCorridor: false,
  },
  {
    id: "papua_pegunungan",
    name: "Papua Pegunungan",
    region: "maluku_papua",
    capital: "Wamena",
    center: [-4.0950, 138.9450],
    zoom: 7,
    governor: "Velix Vernando Wanggai (Pj. Gubernur Papua Pegunungan)",
    agency: "Dinas Pekerjaan Umum dan Perumahan Rakyat Papua Pegunungan",
    totalProvincialKm: 780.00,
    skNumber: "SK Gubernur Papua Pegunungan No. 620/018/2023",
    hasPilotCorridor: false,
  },
  {
    id: "papua_barat_daya",
    name: "Papua Barat Daya",
    region: "maluku_papua",
    capital: "Sorong",
    center: [-0.8762, 131.2558],
    zoom: 8,
    governor: "Mohammad Musa'ad (Pj. Gubernur Papua Barat Daya)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Papua Barat Daya",
    totalProvincialKm: 690.00,
    skNumber: "SK Gubernur Papua Barat Daya No. 620/009/2023",
    hasPilotCorridor: false,
  },
];


// Deteksi Wilayah & Kewenangan Berdasarkan Koordinat Geospasial Indonesia
export function detectJurisdictionByCoordinates(lat, lng, roads = []) {
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  // 1. Cari jalan nasional / ruas terdekat (Euclidean approx)
  let closestRoad = null;
  let minDistanceKm = Infinity;

  for (const road of roads) {
    if (!road.coordinates || road.coordinates.length === 0) continue;
    for (const [rLat, rLng] of road.coordinates) {
      // 1 deg lat ~ 111 km, 1 deg lng ~ 111 * cos(lat)
      const dLat = (lat - rLat) * 111;
      const dLng = (lng - rLng) * 111 * Math.cos((lat * Math.PI) / 180);
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < minDistanceKm) {
        minDistanceKm = dist;
        closestRoad = road;
      }
    }
  }

  // 2. Identifikasi Pulau & Provinsi Berdasarkan Bounding Koordinat
  let detectedProvince = "Indonesia";
  let detectedIsland = "Nasional";
  let governorName = "Gubernur Provinsi Terkait";
  let provincialAgency = "Dinas Bina Marga & Penataan Ruang Provinsi";

  if (lat >= -6.0 && lat <= 6.0 && lng >= 95.0 && lng <= 106.0) {
    detectedIsland = "Sumatera";
    if (lat >= 1.5 && lat <= 4.5 && lng >= 97.0 && lng <= 100.5) {
      detectedProvince = "Sumatera Utara";
      governorName = "Dr. Drs. A. Fatoni, M.Si. (Pj. Gubernur Sumut)";
      provincialAgency = "Dinas PUPR Provinsi Sumatera Utara";
    } else if (lat >= 2.0 && lng <= 98.3) {
      detectedProvince = "Aceh";
      governorName = "Dr. H. Safrizal ZA, M.Si. (Pj. Gubernur Aceh)";
      provincialAgency = "Dinas PUPR Pemerintah Aceh";
    } else if (lat >= -1.2 && lat <= 2.5 && lng >= 100.0 && lng <= 103.8) {
      detectedProvince = "Riau";
      governorName = "Dr. Rahman Hadi, M.Si. (Pj. Gubernur Riau)";
      provincialAgency = "Dinas PUPR Provinsi Riau";
    } else if (lat >= -3.5 && lat <= 0.9 && lng >= 98.6 && lng <= 101.9) {
      detectedProvince = "Sumatera Barat";
      governorName = "H. Mahyeldi Ansharullah, S.P. (Gubernur Sumbar)";
      provincialAgency = "Dinas Bina Marga, Cipta Karya & Tata Ruang Sumbar";
    } else if (lat >= -4.9 && lat <= -1.6 && lng >= 102.1 && lng <= 106.2) {
      detectedProvince = "Sumatera Selatan";
      governorName = "Elen Setiadi, S.H., M.S.E. (Pj. Gubernur Sumsel)";
      provincialAgency = "Dinas PUBM-TR Provinsi Sumatera Selatan";
    } else if (lat >= -6.0 && lat <= -3.7 && lng >= 103.5 && lng <= 106.0) {
      detectedProvince = "Lampung";
      governorName = "Dr. Drs. Samsudin, S.H., M.H., M.Pd. (Pj. Gubernur Lampung)";
      provincialAgency = "Dinas Bina Marga & Bina Konstruksi Provinsi Lampung";
    } else {
      detectedProvince = "Sumatera";
    }
  } else if (lat >= -9.0 && lat <= -5.5 && lng >= 105.0 && lng <= 115.0) {
    detectedIsland = "Jawa";
    if (lat >= -6.37 && lat <= -6.08 && lng >= 106.68 && lng <= 106.98) {
      detectedProvince = "DKI Jakarta";
      governorName = "Teguh Setyabudi, M.Pd. (Pj. Gubernur DKI Jakarta)";
      provincialAgency = "Dinas Bina Marga Provinsi DKI Jakarta";
    } else if (lat >= -7.8 && lat <= -5.9 && lng >= 106.3 && lng <= 108.8) {
      detectedProvince = "Jawa Barat";
      governorName = "Bey Triadi Machmudin, S.E., M.T. (Pj. Gubernur Jawa Barat)";
      provincialAgency = "Dinas Bina Marga & Penataan Ruang (DBMPR) Prov. Jawa Barat";
    } else if (lat >= -8.2 && lat <= -6.4 && lng >= 108.5 && lng <= 111.6) {
      detectedProvince = "Jawa Tengah";
      governorName = "Komjen Pol (Purn) Drs. Nana Sudjana, M.M. (Pj. Gubernur Jateng)";
      provincialAgency = "Dinas Pekerjaan Umum Bina Marga & Cipta Karya Jawa Tengah";
    } else if (lat >= -8.2 && lat <= -7.5 && lng >= 110.0 && lng <= 110.8) {
      detectedProvince = "DI Yogyakarta";
      governorName = "Sri Sultan Hamengku Buwono X (Gubernur DIY)";
      provincialAgency = "Dinas PUPESDM Daerah Istimewa Yogyakarta";
    } else if (lat >= -8.8 && lat <= -6.7 && lng >= 110.9 && lng <= 114.6) {
      detectedProvince = "Jawa Timur";
      governorName = "Adhy Karyono, A.Ks., M.A.P. (Pj. Gubernur Jawa Timur)";
      provincialAgency = "Dinas Pekerjaan Umum Bina Marga Provinsi Jawa Timur";
    } else if (lat >= -7.0 && lat <= -5.8 && lng >= 105.5 && lng <= 106.5) {
      detectedProvince = "Banten";
      governorName = "Al Muktabar (Pj. Gubernur Banten)";
      provincialAgency = "Dinas Pekerjaan Umum & Penataan Ruang Provinsi Banten";
    } else {
      detectedProvince = "Jawa";
    }
  } else if (lat >= -9.2 && lat <= -8.0 && lng >= 114.4 && lng <= 125.5) {
    detectedIsland = "Bali & Nusa Tenggara";
    if (lng <= 115.7) {
      detectedProvince = "Bali";
      governorName = "Sang Made Mahendra Jaya (Pj. Gubernur Bali)";
      provincialAgency = "Dinas PUPR Provinsi Bali";
    } else if (lng <= 119.5) {
      detectedProvince = "Nusa Tenggara Barat";
      governorName = "Hassanudin (Pj. Gubernur NTB)";
      provincialAgency = "Dinas PUPR Provinsi Nusa Tenggara Barat";
    } else {
      detectedProvince = "Nusa Tenggara Timur";
      governorName = "Andriko Noto Susanto (Pj. Gubernur NTT)";
      provincialAgency = "Dinas PUPR Provinsi Nusa Tenggara Timur";
    }
  } else if (lat >= -4.5 && lat <= 4.5 && lng >= 108.5 && lng <= 119.2) {
    detectedIsland = "Kalimantan";
    if (lat >= -2.0 && lat <= 2.0 && lng >= 115.5 && lng <= 119.0) {
      detectedProvince = "Kalimantan Timur (Kawasan Mitra IKN)";
      governorName = "Akmal Malik (Pj. Gubernur Kaltim)";
      provincialAgency = "Dinas PUPR & Pera Provinsi Kalimantan Timur";
    } else if (lng <= 114.0 && lat >= -3.0) {
      detectedProvince = "Kalimantan Barat";
      governorName = "Harisson (Pj. Gubernur Kalbar)";
      provincialAgency = "Dinas PUPR Provinsi Kalimantan Barat";
    } else if (lat <= -2.5 && lng >= 114.0) {
      detectedProvince = "Kalimantan Selatan";
      governorName = "H. Sahbirin Noor (Gubernur Kalsel)";
      provincialAgency = "Dinas PUPR Provinsi Kalimantan Selatan";
    } else {
      detectedProvince = "Kalimantan Tengah";
      governorName = "H. Sugianto Sabran (Gubernur Kalteng)";
      provincialAgency = "Dinas PUPR Provinsi Kalimantan Tengah";
    }
  } else if (lat >= -6.0 && lat <= 2.0 && lng >= 118.5 && lng <= 126.0) {
    detectedIsland = "Sulawesi";
    if (lat <= -3.5) {
      detectedProvince = "Sulawesi Selatan";
      governorName = "Prof. Zudan Arif Fakrulloh (Pj. Gubernur Sulsel)";
      provincialAgency = "Dinas Bina Marga & Bina Konstruksi Sulsel";
    } else if (lat >= 0.5) {
      detectedProvince = "Sulawesi Utara";
      governorName = "Olly Dondokambey, S.E. (Gubernur Sulut)";
      provincialAgency = "Dinas Pekerjaan Umum & Penataan Ruang Sulut";
    } else {
      detectedProvince = "Sulawesi Tengah";
      governorName = "H. Rusdy Mastura (Gubernur Sulteng)";
      provincialAgency = "Dinas Bina Marga & Penataan Ruang Sulteng";
    }
  } else if (lat >= -11.0 && lat <= 2.0 && lng >= 126.0 && lng <= 141.0) {
    detectedIsland = "Maluku & Papua";
    if (lng <= 134.0) {
      detectedProvince = "Maluku";
      governorName = "Sadali Ie (Pj. Gubernur Maluku)";
      provincialAgency = "Dinas PUPR Provinsi Maluku";
    } else if (lat >= -3.0 && lng >= 138.0) {
      detectedProvince = "Papua";
      governorName = "Ramses Limbong (Pj. Gubernur Papua)";
      provincialAgency = "Dinas PUPR Provinsi Papua";
    } else if (lat <= -3.0 && lng >= 138.0) {
      detectedProvince = "Papua Pegunungan / Selatan";
      governorName = "Velix Vernando Wanggai (Pj. Gubernur)";
      provincialAgency = "Dinas PUPR Provinsi Terkait";
    } else {
      detectedProvince = "Papua Barat";
      governorName = "Ali Baham Temongmere (Pj. Gubernur Papua Barat)";
      provincialAgency = "Dinas PUPR Provinsi Papua Barat";
    }
  }

  // 3. Klasifikasi Kewenangan
  // Jika jarak < 15 km dari koridor nasional -> Potensi Jalan Nasional
  // Jika jarak 15 - 35 km -> Jalan Provinsi
  // Jika lebih jauh -> Jalan Kabupaten / Kota
  let authority = "KOTA_KAB";
  let authorityLabel = "Pemerintah Kabupaten / Kota Setempat";
  let legalBasis = `Peraturan Daerah Kabupaten/Kota di ${detectedProvince}`;
  let regionalHead = "Bupati / Walikota Daerah Setempat";
  let agency = "Dinas Pekerjaan Umum & Penataan Ruang (PUPR) Kab/Kota";

  if (minDistanceKm <= 15.0 && closestRoad) {
    authority = "NASIONAL";
    authorityLabel = closestRoad.authorityLabel || "Kementerian Pekerjaan Umum (BBPJN/BPJN Wilayah)";
    legalBasis = closestRoad.legalBasis || "SK Menteri PUPR No. 1688/KPTS/M/2022 tentang Penetapan Status Ruas Jalan Nasional";
    regionalHead = "Ir. Dody Hanggodo, M.PE. (Menteri Pekerjaan Umum RI)";
    agency = "Direktorat Jenderal Bina Marga Kementerian Pekerjaan Umum";
  } else if (minDistanceKm <= 35.0) {
    authority = "PROVINSI";
    authorityLabel = `Pemerintah Provinsi ${detectedProvince}`;
    legalBasis = `Surat Keputusan Gubernur ${detectedProvince} tentang Penetapan Ruas Jalan Provinsi`;
    regionalHead = governorName;
    agency = provincialAgency;
  }

  return {
    isDetectedPoint: true,
    coordinates: [Number(lat.toFixed(5)), Number(lng.toFixed(5))],
    authority,
    authorityLabel,
    legalBasis,
    provinceName: detectedProvince,
    island: detectedIsland,
    district: `Wilayah Koordinat [${lat.toFixed(4)}, ${lng.toFixed(4)}] (${detectedProvince})`,
    distanceToNearestNationalKm: Number(minDistanceKm.toFixed(1)),
    nearestRoad: closestRoad
      ? {
          id: closestRoad.id,
          name: closestRoad.name,
          code: closestRoad.code,
          distanceKm: Number(minDistanceKm.toFixed(1))
        }
      : null,
    leadership: {
      regionalHead,
      agency,
      officialPic: authority === "NASIONAL" ? "Satker Pelaksanaan Jalan Nasional BBPJN/BPJN" : "Bidang Bina Marga Dinas PU Daerah",
      contactCenter: authority === "NASIONAL" ? "Pusat Layanan KemenPU Halo 158" : "Layanan Pengaduan Pemda / SP4N-LAPOR!"
    }
  };
}
