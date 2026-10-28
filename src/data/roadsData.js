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
