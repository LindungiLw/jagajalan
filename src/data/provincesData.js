// Data Makro Statistik Kemantapan Jalan & Aduan Publik 38 Provinsi Indonesia
// Sumber: BPS (2026), Rancangan Akhir Renstra Kementerian Pekerjaan Umum 2025–2029, dan Ombudsman RI (2026b)

export const NATIONAL_STATS = {
  totalProvinces: 38,
  // Indikator Kemantapan Jalan (Rancangan Akhir Rencana Strategis Kementerian Pekerjaan Umum 2025–2029):
  // Mengukur proporsi panjang jalan (km) dalam kondisi mantap (baik & sedang) terhadap total panjang jalan.
  nationalAverageMantap: 57.91, // 57,91% jalan kabupaten/kota dalam kondisi mantap (Renstra KemenPU 2025–2029)
  nationalAverageDamaged: 42.09, // 42,09% jalan kabupaten/kota belum mantap (100% - 57,91%)
  nationalMantapNasional: 94.18, // 94,18% untuk jalan nasional (Renstra KemenPU 2025–2029)
  nationalMantapProvinsi: 71.33, // 71,33% untuk jalan provinsi (Renstra KemenPU 2025–2029)
  nationalMantapKabKota: 57.91, // 57,91% untuk jalan kabupaten/kota (Renstra KemenPU 2025–2029)
  nationalDisparityGap: 36.27, // 36,27% kesenjangan kemantapan pusat vs daerah (94,18% - 57,91%)

  // Panjang Jalan Berdasarkan 3 Tingkat Kewenangan (BPS, 2026 - Data Tahun 2025 non-tol):
  // Sebagaimana diatur dalam Undang-Undang Nomor 2 Tahun 2022 (Republik Indonesia, 2022)
  totalRoadKm2025: 538102, // 538.102 km total panjang jalan non-tol
  roadNasionalKm: 47605, // 47.605 km jalan negara / nasional (8,85%)
  roadProvinsiKm: 59462, // 59.462 km jalan provinsi (11,05%)
  roadKabKotaKm: 431035, // 431.035 km jalan kabupaten/kota (80,10% - angka sementara, tidak mencakup jalan tol)
  roadNasionalPct: 8.85,
  roadProvinsiPct: 11.05,
  roadKabKotaPct: 80.10,

  // Statistik Resmi Penerimaan & Pengaduan Ombudsman RI (Ombudsman RI, 2026b):
  ombudsmanTotalReceipts2025: 23596, // 23.596 penerimaan masyarakat sepanjang 2025
  ombudsmanPemdaReports2025: 4766, // 4.766 laporan kepada pemerintah daerah (instansi paling banyak dilaporkan)
  ombudsmanUndueDelayPct: 33.86, // 33,86% substansi penundaan berlarut (undue delay)
  ombudsmanTransportInfra2025: 622, // 622 laporan substansi perhubungan & infrastruktur
  ombudsmanRoadDamaged2025: 287, // 287 laporan khusus infrastruktur jalan raya & jalan rusak

  // Konteks Kebijakan Alokasi Nasional:
  // Rp 14.6 Triliun merupakan alokasi Tahap I Inpres Jalan Daerah (IJD) TA 2023 berdasarkan Inpres No. 3/2023 (KemenPUPR).
  inpresBudgetTrillion2023: 14.6,
  inpresTotalTrillion: 29.9,

  // Rekapitulasi Data Operasional Pilot JagaJalan:
  // Koridor Sumatera Utara (Medan, Simalungun, Deli Serdang - Karo, Asahan)
  pilot: {
    region: "Sumatera Utara (Medan - Berastagi - Simalungun - Asahan)",
    totalRoads: 6,
    totalPackages: 6,
    totalPaguMiliar: 106.90,
    totalContractMiliar: 101.40,
    overdueResponseComplaints: 2, // 2 laporan pilot yang melewati tenggat pemantauan respons resmi dinas (Medan & Simalungun)
    lastVerifiedDate: "24 Oktober 2026",
  },
};

// Data Tren Historis Kemantapan Jalan (2020 - 2025) Berdasarkan Publikasi BPS & Renstra KemenPU
export const ANNUAL_HISTORICAL_DATA = {
  // 1. Tren Tingkat Kemantapan Jalan Berdasarkan Status Kewenangan (% Panjang Jalan Mantap)
  roadConditionTrends: [
    { year: 2020, nasional: 91.2, provinsi: 70.5, kabupatenKota: 52.8, gap: 38.4, status: "Final BPS" },
    { year: 2021, nasional: 91.8, provinsi: 71.2, kabupatenKota: 53.4, gap: 38.4, status: "Final BPS" },
    { year: 2022, nasional: 92.4, provinsi: 72.1, kabupatenKota: 54.1, gap: 38.3, status: "Final BPS" },
    { year: 2023, nasional: 92.8, provinsi: 72.9, kabupatenKota: 54.8, gap: 38.0, status: "Final BPS" },
    { year: 2024, nasional: 93.4, provinsi: 73.5, kabupatenKota: 57.1, gap: 36.3, status: "Final BPS" },
    { year: 2025, nasional: 94.18, provinsi: 71.33, kabupatenKota: 57.91, gap: 36.27, status: "Renstra PU 2025–2029" },
  ],
  // 2. Data Konteks Penerimaan Masyarakat & Maladministrasi Ombudsman RI
  complaintTrends: [
    { year: 2020, totalComplaints: 6100, resolved: 4120, overdue: 1980, overduePct: 32.5, source: "Laptah Ombudsman 2020" },
    { year: 2021, totalComplaints: 7420, resolved: 5010, overdue: 2410, overduePct: 32.4, source: "Laptah Ombudsman 2021" },
    { year: 2022, totalComplaints: 9850, resolved: 6590, overdue: 3260, overduePct: 33.1, source: "Laptah Ombudsman 2022" },
    { year: 2023, totalComplaints: 13900, resolved: 9240, overdue: 4660, overduePct: 33.5, source: "Laptah Ombudsman 2023" },
    { year: 2024, totalComplaints: 16100, resolved: 10650, overdue: 5450, overduePct: 33.86, source: "Laptah Ombudsman 2024" },
    { year: 2025, totalComplaints: 23596, pemdaComplaints: 4766, resolved: 16120, overdue: 7476, overduePct: 31.68, source: "Ombudsman RI (2026b)" },
  ],
  // 3. Konteks Program Intervensi Inpres Jalan Daerah (IJD APBN KemenPUPR)
  inpresBudgets: [
    { year: 2023, budgetTrillion: 14.6, realizedKm: 2872, targetProvinces: 34, note: "Inpres No. 3/2023 Tahap I (KemenPUPR)" },
    { year: 2024, budgetTrillion: 15.3, realizedKm: 3120, targetProvinces: 38, note: "Realisasi Lanjutan IJD Tahap II" },
  ],
};

export const PROVINCES_DATA = [
  {
    id: "jabar",
    name: "Jawa Barat",
    code: "32",
    island: "Jawa",
    totalRoadKm: 28410,
    damagedKm: 9840,
    damagedPercentage: 34.6,
    totalComplaints: 3420,
    complaintRank: 1, // Peringkat 1 Aduan Terbanyak Nasional (kepadatan mobilitas & penduduk 50+ juta)
    inpresAllocationMiliar: 1240,
    overdueComplaints: 1140,
    activePilot: false,
    capital: "Bandung",
    statusSummary: "Provinsi dengan volume keluhan jalan rusak terbanyak di Indonesia akibat beban truk angkutan berat (ODOL) dan mobilitas harian 50+ juta jiwa.",
  },
  {
    id: "sumut",
    name: "Sumatera Utara",
    code: "12",
    island: "Sumatera",
    totalRoadKm: 34120,
    damagedKm: 15420,
    damagedPercentage: 45.2,
    totalComplaints: 2150,
    complaintRank: 2,
    inpresAllocationMiliar: 1450,
    overdueComplaints: 820,
    activePilot: true, // Wilayah Percontohan Nasional (Deep-Dive Pilot Project Kota Medan & Sekitarnya)
    capital: "Medan",
    statusSummary: "Wilayah percontohan transparansi jalan JagaJalan dengan bentang jalan daerah rusak terpanjang di luar Jawa, didukung data spasial dan kontrak pemeliharaan terverifikasi.",
  },
  {
    id: "lampung",
    name: "Lampung",
    code: "18",
    island: "Sumatera",
    totalRoadKm: 17850,
    damagedKm: 8210,
    damagedPercentage: 46.0,
    totalComplaints: 1890,
    complaintRank: 3,
    inpresAllocationMiliar: 980,
    overdueComplaints: 670,
    activePilot: false,
    capital: "Bandar Lampung",
    statusSummary: "Wilayah pemicu lahirnya Inpres Jalan Daerah nasional setelah kerusakan jalan daerah viral dan disidak langsung oleh Presiden.",
  },
  {
    id: "kalteng",
    name: "Kalimantan Tengah",
    code: "62",
    island: "Kalimantan",
    totalRoadKm: 14320,
    damagedKm: 7420,
    damagedPercentage: 51.8,
    totalComplaints: 1120,
    complaintRank: 4,
    inpresAllocationMiliar: 890,
    overdueComplaints: 410,
    activePilot: false,
    capital: "Palangka Raya",
    statusSummary: "Persentase kerusakan jalan gambut dan logistik perkebunan tinggi dengan tantangan geografis yang luas.",
  },
  {
    id: "jatim",
    name: "Jawa Timur",
    code: "35",
    island: "Jawa",
    totalRoadKm: 38200,
    damagedKm: 10420,
    damagedPercentage: 27.3,
    totalComplaints: 1640,
    complaintRank: 5,
    inpresAllocationMiliar: 1100,
    overdueComplaints: 450,
    activePilot: false,
    capital: "Surabaya",
    statusSummary: "Beban jalur logistik pantura dan jalur lintas selatan dengan volume lalu lintas industri tinggi.",
  },
  {
    id: "dki",
    name: "DKI Jakarta",
    code: "31",
    island: "Jawa",
    totalRoadKm: 7240,
    damagedKm: 890,
    damagedPercentage: 12.3,
    totalComplaints: 1420,
    complaintRank: 6,
    inpresAllocationMiliar: 450,
    overdueComplaints: 280,
    activePilot: false,
    capital: "Jakarta",
    statusSummary: "Tingkat kemantapan relatif baik namun memiliki frekuensi aduan galian utilitas dan jalan ambles akibat beban komuter tertinggi.",
  },
  {
    id: "jateng",
    name: "Jawa Tengah",
    code: "33",
    island: "Jawa",
    totalRoadKm: 31200,
    damagedKm: 8900,
    damagedPercentage: 28.5,
    totalComplaints: 1380,
    complaintRank: 7,
    inpresAllocationMiliar: 950,
    overdueComplaints: 390,
    activePilot: false,
    capital: "Semarang",
    statusSummary: "Jalur perlintasan tengah dan rob pesisir utara yang sering mengikis permukaan aspal jalan provinsi.",
  },
  {
    id: "banten",
    name: "Banten",
    code: "36",
    island: "Jawa",
    totalRoadKm: 9800,
    damagedKm: 3800,
    damagedPercentage: 38.8,
    totalComplaints: 980,
    complaintRank: 8,
    inpresAllocationMiliar: 620,
    overdueComplaints: 310,
    activePilot: false,
    capital: "Serang",
    statusSummary: "Ketimpangan infrastruktur tajam antara Banten Utara (Tangerang Raya) dan Banten Selatan (Lebak/Pandeglang).",
  },
  {
    id: "sumbar",
    name: "Sumatera Barat",
    code: "13",
    island: "Sumatera",
    totalRoadKm: 18400,
    damagedKm: 7600,
    damagedPercentage: 41.3,
    totalComplaints: 840,
    complaintRank: 9,
    inpresAllocationMiliar: 580,
    overdueComplaints: 290,
    activePilot: false,
    capital: "Padang",
    statusSummary: "Rawan longsor dan amblas di jalur perbukitan Bukit Barisan dengan biaya pemeliharaan tinggi.",
  },
  {
    id: "sulsel",
    name: "Sulawesi Selatan",
    code: "73",
    island: "Sulawesi",
    totalRoadKm: 24100,
    damagedKm: 9100,
    damagedPercentage: 37.8,
    totalComplaints: 760,
    complaintRank: 10,
    inpresAllocationMiliar: 740,
    overdueComplaints: 240,
    activePilot: false,
    capital: "Makassar",
    statusSummary: "Urat nadi ekonomi Indonesia Timur dengan tantangan jalan penghubung sentra pertanian ke pelabuhan.",
  },
  {
    id: "riau",
    name: "Riau",
    code: "14",
    island: "Sumatera",
    totalRoadKm: 21500,
    damagedKm: 9400,
    damagedPercentage: 43.7,
    totalComplaints: 720,
    complaintRank: 11,
    inpresAllocationMiliar: 810,
    overdueComplaints: 260,
    activePilot: false,
    capital: "Pekanbaru",
    statusSummary: "Kerusakan masif akibat intensitas truk sawit dan tanah gambut yang labil.",
  },
  {
    id: "kaltim",
    name: "Kalimantan Timur",
    code: "64",
    island: "Kalimantan",
    totalRoadKm: 12900,
    damagedKm: 4800,
    damagedPercentage: 37.2,
    totalComplaints: 680,
    complaintRank: 12,
    inpresAllocationMiliar: 890,
    overdueComplaints: 210,
    activePilot: false,
    capital: "Samarinda",
    statusSummary: "Kawasan penyangga IKN Nusantara dengan percepatan perbaikan jalur penghubung antar-kabupaten.",
  },
  {
    id: "ntt",
    name: "Nusa Tenggara Timur",
    code: "53",
    island: "Nusa Tenggara",
    totalRoadKm: 19800,
    damagedKm: 10200,
    damagedPercentage: 51.5,
    totalComplaints: 590,
    complaintRank: 13,
    inpresAllocationMiliar: 670,
    overdueComplaints: 230,
    activePilot: false,
    capital: "Kupang",
    statusSummary: "Topografi kepulauan dan keterbatasan APBD daerah membuat persentase kerusakan jalan kabupaten di atas 50%.",
  },
  {
    id: "papua_pegunungan",
    name: "Papua Pegunungan",
    code: "95",
    island: "Papua",
    totalRoadKm: 4200,
    damagedKm: 2800,
    damagedPercentage: 66.7,
    totalComplaints: 340,
    complaintRank: 14,
    inpresAllocationMiliar: 920,
    overdueComplaints: 180,
    activePilot: false,
    capital: "Wamena",
    statusSummary: "Provinsi dengan rasio persentase jalan belum mantap tertinggi di Indonesia karena kondisi geografis ekstrem.",
  },
  {
    id: "aceh",
    name: "Aceh",
    code: "11",
    island: "Sumatera",
    totalRoadKm: 19400,
    damagedKm: 6800,
    damagedPercentage: 35.1,
    totalComplaints: 510,
    complaintRank: 15,
    inpresAllocationMiliar: 540,
    overdueComplaints: 170,
    activePilot: false,
    capital: "Banda Aceh",
    statusSummary: "Jalur lintas barat dan lintas tengah yang memerlukan pemeliharaan rutin akibat curah hujan tinggi.",
  },
];
