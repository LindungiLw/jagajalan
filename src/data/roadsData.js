// Data Ruas Jalan Terverifikasi JagaJalan
// Wilayah Fokus: JALAN NASIONAL, JALAN PROVINSI STRATEGIS SE-INDONESIA, & PILOT SUMATERA UTARA
// Terintegrasi dengan Kepala Daerah / Pejabat Penanggung Jawab, Data LPSE, dan SIGI PU

import sumutRoads from "./sumutRoadsData.json";
import nationalHighways from "./nationalHighwaysData.json";
import provincialRoads from "./provincialRoadsData.json";
import cityRegencyRoads from "./cityRegencyRoadsData.json";
import villageRoads from "./villageRoadsData.json";

// 1. Data Koridor Ruas Percontohan Sumatera Utara (Medan, Simalungun, Karo, Asahan)
export const SUMATERA_UTARA_ROADS = sumutRoads;

// 2. Data Koridor Arteri Jalan Nasional Seluruh Indonesia (SK MenPUPR No. 1688/2022)
export const NATIONAL_HIGHWAYS_INDONESIA = nationalHighways;

// 3. Data Koridor Arteri Jalan Provinsi Strategis Seluruh Indonesia (SK Gubernur Masing-Masing Pemprov)
export const PROVINCIAL_ROADS_INDONESIA = provincialRoads;

// 4. Data Koridor Jalan Kota & Kabupaten Strategis Seluruh Indonesia (SK Walikota & SK Bupati)
export const CITY_REGENCY_ROADS_INDONESIA = cityRegencyRoads;

// 5. Data Koridor Jalan Desa / Nagari / Kampung Strategis Lintas Pulau (UU No. 2 Tahun 2022 Pasal 9 & Dana Desa)
export const VILLAGE_ROADS_INDONESIA = villageRoads;

// 6. Gabungan Seluruh Ruas Terdata JagaJalan (5 Tingkat Kewenangan UU No. 2/2022)
export const ALL_ROADS = [
  ...SUMATERA_UTARA_ROADS,
  ...NATIONAL_HIGHWAYS_INDONESIA,
  ...PROVINCIAL_ROADS_INDONESIA,
  ...CITY_REGENCY_ROADS_INDONESIA,
  ...VILLAGE_ROADS_INDONESIA,
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

// Ringkasan Statistik Jaringan Jalan Resmi Indonesia (BPS 2026 - Data Tahun 2025 non-tol & Ditjen Bina Marga Kementerian PU)
export const PROVINCIAL_NETWORK_STATS = {
  totalNonTolKmIndonesia: 538102,
  totalProvincialKmIndonesia: 59462,
  totalNationalKmIndonesia: 47605,
  totalKabupatenKotaKmIndonesia: 431035,
  totalVillageKmIndonesia: 316000.0,
  totalProvinces: 38,
  activeCuratedProvincialCorridors: 26,
  activeCuratedNationalCorridors: 29,
  activeCuratedCityRegencyCorridors: 58,
  activeCuratedVillageCorridors: 15,
  activeCuratedPilotRoads: 6,
  dataSource: "BPS (2026) Data Panjang Jalan 2025 x PUSDATIN SIGI Kementerian PU x Kemendesa PDTT (Dana Desa) x SK Kepala Daerah 38 Provinsi",
};

// Katalog 38 Provinsi Indonesia (Jabatan Penyelenggara Resmi & Estimasi Panjang Jalan Provinsi Terkalibrasi ke Total BPS 2025: 59.462 km)
export const INDONESIA_PROVINCES = [
  {
    id: "aceh",
    name: "Aceh",
    region: "sumatera",
    capital: "Banda Aceh",
    center: [4.695, 96.749],
    zoom: 8,
    governor: "Gubernur Seluruh Indonesia (Jalan Nasional)",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Pemerintah Aceh",
    totalProvincialKm: 2086.11,
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
    governor: "Gubernur Sumatera Utara",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Sumatera Utara",
    totalProvincialKm: 3522.15,
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
    governor: "Gubernur Sumatera Barat",
    agency: "Dinas Bina Marga, Cipta Karya dan Tata Ruang Provinsi Sumatera Barat",
    totalProvincialKm: 1781.67,
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
    governor: "Gubernur Riau",
    agency: "Dinas PUPR, Perumahan, Kawasan Permukiman dan Pertanahan Provinsi Riau",
    totalProvincialKm: 3280.92,
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
    governor: "Gubernur Kepulauan Riau",
    agency: "Dinas Pekerjaan Umum, Penataan Ruang dan Pertanahan Provinsi Kepri",
    totalProvincialKm: 507.64,
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
    governor: "Gubernur Jambi",
    agency: "Dinas Pekerjaan Umum dan Perumahan Rakyat Provinsi Jambi",
    totalProvincialKm: 1209.93,
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
    governor: "Gubernur Sumatera Selatan",
    agency: "Dinas Pengelolaan Sumber Daya Air dan Bina Marga Provinsi Sumsel",
    totalProvincialKm: 1773.70,
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
    governor: "Gubernur Bengkulu",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Bengkulu",
    totalProvincialKm: 1828.07,
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
    governor: "Gubernur Lampung",
    agency: "Dinas Bina Marga dan Bina Konstruksi Provinsi Lampung",
    totalProvincialKm: 1984.28,
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
    governor: "Gubernur Kep. Bangka Belitung",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Kepulauan Babel",
    totalProvincialKm: 996.53,
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
    governor: "Gubernur DKI Jakarta",
    agency: "Dinas Bina Marga Provinsi DKI Jakarta",
    totalProvincialKm: 1429.65,
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
    governor: "Gubernur Jawa Barat",
    agency: "Dinas Bina Marga dan Penataan Ruang (DBMPR) Provinsi Jawa Barat",
    totalProvincialKm: 2766.23,
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
    governor: "Gubernur Jawa Tengah",
    agency: "Dinas Pekerjaan Umum Bina Marga dan Cipta Karya Jawa Tengah",
    totalProvincialKm: 3006.48,
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
    governor: "Gubernur D.I. Yogyakarta",
    agency: "Dinas Pekerjaan Umum, Perumahan dan Energi Sumber Daya Mineral DIY",
    totalProvincialKm: 892.94,
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
    governor: "Gubernur Jawa Timur",
    agency: "Dinas Pekerjaan Umum Bina Marga Provinsi Jawa Timur",
    totalProvincialKm: 1665.19,
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
    governor: "Gubernur Banten",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Banten",
    totalProvincialKm: 921.19,
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
    governor: "Gubernur Bali",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Bali",
    totalProvincialKm: 1006.61,
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
    governor: "Gubernur Nusa Tenggara Barat",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi NTB",
    totalProvincialKm: 1739.48,
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
    governor: "Gubernur Nusa Tenggara Timur",
    agency: "Dinas Pekerjaan Umum dan Perumahan Rakyat Provinsi NTT",
    totalProvincialKm: 3105.38,
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
    governor: "Gubernur Kalimantan Barat",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Kalimantan Barat",
    totalProvincialKm: 1772.76,
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
    governor: "Gubernur Kalimantan Tengah",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Kalteng",
    totalProvincialKm: 1490.58,
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
    governor: "Gubernur Kalimantan Selatan",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Kalsel",
    totalProvincialKm: 1024.78,
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
    governor: "Gubernur Kalimantan Timur",
    agency: "Dinas Pekerjaan Umum Penataan Ruang & Perumahan Rakyat Kaltim",
    totalProvincialKm: 1049.15,
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
    governor: "Gubernur Kalimantan Utara",
    agency: "Dinas Pekerjaan Umum, Penataan Ruang, Perumahan dan Kawasan Permukiman Kaltara",
    totalProvincialKm: 1014.82,
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
    governor: "Gubernur Sulawesi Utara",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Daerah Provinsi Sulut",
    totalProvincialKm: 1925.34,
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
    governor: "Gubernur Gorontalo",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Gorontalo",
    totalProvincialKm: 404.29,
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
    governor: "Gubernur Sulawesi Tengah",
    agency: "Dinas Bina Marga dan Penataan Ruang Provinsi Sulawesi Tengah",
    totalProvincialKm: 1912.45,
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
    governor: "Gubernur Sulawesi Barat",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Sulawesi Barat",
    totalProvincialKm: 597.64,
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
    governor: "Gubernur Sulawesi Selatan",
    agency: "Dinas Bina Marga dan Bina Konstruksi Provinsi Sulawesi Selatan",
    totalProvincialKm: 2158.53,
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
    governor: "Gubernur Sulawesi Tenggara",
    agency: "Dinas Sumber Daya Air dan Bina Marga Provinsi Sulawesi Tenggara",
    totalProvincialKm: 1185.90,
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
    governor: "Gubernur Maluku",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Maluku",
    totalProvincialKm: 1312.46,
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
    governor: "Gubernur Maluku Utara",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Maluku Utara",
    totalProvincialKm: 1546.83,
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
    governor: "Gubernur Papua",
    agency: "Dinas Pekerjaan Umum, Penataan Ruang, Perumahan dan Kawasan Permukiman Papua",
    totalProvincialKm: 1499.96,
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
    governor: "Gubernur Papua Barat",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Papua Barat",
    totalProvincialKm: 1218.72,
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
    governor: "Gubernur Papua Selatan",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Papua Selatan",
    totalProvincialKm: 1078.09,
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
    governor: "Gubernur Papua Tengah",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Papua Tengah",
    totalProvincialKm: 1042.94,
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
    governor: "Gubernur Papua Pegunungan",
    agency: "Dinas Pekerjaan Umum dan Perumahan Rakyat Papua Pegunungan",
    totalProvincialKm: 914.04,
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
    governor: "Gubernur Papua Barat Daya",
    agency: "Dinas Pekerjaan Umum dan Penataan Ruang Papua Barat Daya",
    totalProvincialKm: 808.57,
    skNumber: "SK Gubernur Papua Barat Daya No. 620/009/2023",
    hasPilotCorridor: false,
  },
];


// Deteksi Wilayah & Kewenangan Berdasarkan Koordinat Geospasial Indonesia (38 Provinsi & 4 Tingkat Wewenang)
export function detectJurisdictionByCoordinates(lat, lng, roads = []) {
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  // 1. Cari ruas terdekat (dengan prioritas spesifisitas Kota/Kabupaten/Provinsi jika sangat dekat)
  let closestRoad = null;
  let minDistanceKm = Infinity;
  let closestLocalRoad = null;
  let minLocalDistKm = Infinity;

  for (const road of roads) {
    if (!road.coordinates || road.coordinates.length === 0) continue;
    for (const [rLat, rLng] of road.coordinates) {
      const dLat = (lat - rLat) * 111;
      const dLng = (lng - rLng) * 111 * Math.cos((lat * Math.PI) / 180);
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < minDistanceKm) {
        minDistanceKm = dist;
        closestRoad = road;
      }
      if (road.authority !== "NASIONAL" && dist < minLocalDistKm) {
        minLocalDistKm = dist;
        closestLocalRoad = road;
      }
    }
  }

  // Jika titik klik berada sangat dekat (<= 5 km) dengan ruas Kota/Kabupaten/Provinsi yang terdata, prioritaskan ruas lokal tersebut
  if (closestLocalRoad && minLocalDistKm <= 5.0) {
    closestRoad = closestLocalRoad;
    minDistanceKm = minLocalDistKm;
  }

  // 2. Identifikasi Pulau & Provinsi dari Katalog 38 Provinsi Resmi (INDONESIA_PROVINCES)
  let matchedProvinceObj = null;

  // Cek spesifik untuk Kalimantan (5 Provinsi: Kalbar, Kalteng, Kalsel, Kaltim, Kaltara)
  if (lat >= -4.5 && lat <= 4.6 && lng >= 108.5 && lng <= 119.2) {
    if (lat >= 2.25 && lng >= 114.5) {
      matchedProvinceObj = INDONESIA_PROVINCES.find((p) => p.id === "kalimantan_utara");
    } else if (lng <= 112.4 && lat >= -3.1) {
      matchedProvinceObj = INDONESIA_PROVINCES.find((p) => p.id === "kalimantan_barat");
    } else if (lat <= -2.1 && lng >= 114.35 && lng <= 116.6) {
      matchedProvinceObj = INDONESIA_PROVINCES.find((p) => p.id === "kalimantan_selatan");
    } else if (lng >= 115.4 && lat >= -2.4 && lat < 2.25) {
      matchedProvinceObj = INDONESIA_PROVINCES.find((p) => p.id === "kalimantan_timur");
    } else {
      matchedProvinceObj = INDONESIA_PROVINCES.find((p) => p.id === "kalimantan_tengah");
    }
  }

  // Jika belum terpetakan oleh poligon Kalimantan, cari provinsi terdekat dari 38 provinsi di INDONESIA_PROVINCES
  if (!matchedProvinceObj) {
    let bestProvDist = Infinity;
    for (const prov of INDONESIA_PROVINCES) {
      if (!prov.center) continue;
      const dLat = (lat - prov.center[0]) * 111;
      const dLng = (lng - prov.center[1]) * 111 * Math.cos((lat * Math.PI) / 180);
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < bestProvDist) {
        bestProvDist = dist;
        matchedProvinceObj = prov;
      }
    }
  }

  const regionIslandMap = {
    sumatera: "Sumatera",
    jawa: "Jawa",
    bali_nusra: "Bali & Nusa Tenggara",
    kalimantan: "Kalimantan",
    sulawesi: "Sulawesi",
    maluku_papua: "Maluku & Papua",
  };

  const detectedProvince = matchedProvinceObj?.name || "Indonesia";
  const detectedIsland = regionIslandMap[matchedProvinceObj?.region] || "Nasional";
  const governorName = matchedProvinceObj?.governor || "Gubernur Provinsi Terkait";
  const provincialAgency = matchedProvinceObj?.agency || "Dinas Bina Marga & Penataan Ruang Provinsi";
  const provincialSk = matchedProvinceObj?.skNumber || `SK Gubernur ${detectedProvince} tentang Status Jalan Provinsi`;

  // 3. Klasifikasi Kewenangan Berdasarkan Ruas Terdekat & Proksimitas
  let authority = "KABUPATEN";
  let authorityLabel = `Pemerintah Kabupaten / Kota Setempat (${detectedProvince})`;
  let legalBasis = `Peraturan Bupati / Walikota tentang Penetapan Status Ruas Jalan di Provinsi ${detectedProvince}`;
  let regionalHead = `Bupati / Walikota di Wilayah ${detectedProvince}`;
  let agency = `Dinas Pekerjaan Umum & Penataan Ruang (PUPR) Kab/Kota di ${detectedProvince}`;

  if (minDistanceKm <= 15.0 && closestRoad) {
    if (closestRoad.authority === "DESA") {
      authority = "DESA";
      authorityLabel = closestRoad.authorityLabel || `Pemerintah Desa Setempat (${detectedProvince})`;
      legalBasis = closestRoad.legalBasis || `UU No. 2 Tahun 2022 Pasal 9 tentang Jalan Desa & Perbup Setempat`;
      regionalHead = closestRoad.leadership?.regionalHead || "Kepala Desa & Bupati Setempat";
      agency = closestRoad.leadership?.agency || "Pemerintah Desa & Dinas PMD/PUPR Kabupaten";
    } else if (closestRoad.authority === "KOTA") {
      authority = "KOTA";
      authorityLabel = closestRoad.authorityLabel || `Pemerintah ${closestRoad.district || "Kota"}`;
      legalBasis = closestRoad.legalBasis || `Peraturan Walikota tentang Penetapan Ruas Jalan Kota`;
      regionalHead = closestRoad.leadership?.regionalHead || "Walikota Setempat";
      agency = closestRoad.leadership?.agency || "Dinas PUPR Kota";
    } else if (closestRoad.authority === "KABUPATEN" || closestRoad.authority === "KOTA_KAB") {
      authority = "KABUPATEN";
      authorityLabel = closestRoad.authorityLabel || `Pemerintah ${closestRoad.district || "Kabupaten"}`;
      legalBasis = closestRoad.legalBasis || `Peraturan Bupati tentang Penetapan Ruas Jalan Kabupaten`;
      regionalHead = closestRoad.leadership?.regionalHead || "Bupati Setempat";
      agency = closestRoad.leadership?.agency || "Dinas PUPR Kabupaten";
    } else if (closestRoad.authority === "PROVINSI") {
      authority = "PROVINSI";
      authorityLabel = closestRoad.authorityLabel || `Pemerintah Provinsi ${detectedProvince}`;
      legalBasis = closestRoad.legalBasis || provincialSk;
      regionalHead = closestRoad.leadership?.regionalHead || governorName;
      agency = closestRoad.leadership?.agency || provincialAgency;
    } else {
      authority = "NASIONAL";
      authorityLabel = closestRoad.authorityLabel || "Kementerian Pekerjaan Umum (BBPJN/BPJN Wilayah)";
      legalBasis = closestRoad.legalBasis || "SK Menteri PUPR No. 1688/KPTS/M/2022 tentang Penetapan Status Ruas Jalan Nasional";
      regionalHead = "Ir. Dody Hanggodo, M.PE. (Menteri Pekerjaan Umum RI)";
      agency = "Direktorat Jenderal Bina Marga Kementerian Pekerjaan Umum";
    }
  } else if (minDistanceKm <= 35.0) {
    authority = "PROVINSI";
    authorityLabel = `Pemerintah Provinsi ${detectedProvince}`;
    legalBasis = provincialSk;
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
