/**
 * JagaJalan Platform - Global Constants & Standards
 * 
 * Sistem Kodefikasi Warna Terpisah:
 * - Kewenangan Jalan: Biru (Nasional), Ungu (Provinsi), Teal (Kota/Kabupaten)
 * - Status Tindak Lanjut: Merah (Terlambat), Amber (Diproses), Hijau (Selesai)
 * - Brand & Aksi: Safety Orange (Logo, Tombol Aksi Lapor, Highlight Interaktif)
 */

// Batas Waktu Pemantauan Tanggapan Instansi Terkait (Response SLA) berdasarkan UU No. 25 Tahun 2009 & Ombudsman RI
export const SLA_RESPONSE_DAYS_LIMIT = 14;

// 1. Sistem Warna Status Kewenangan Jalan
export const AUTHORITY_COLORS = {
  NASIONAL: {
    label: "Jalan Nasional",
    responsibleAgency: "Kementerian Pekerjaan Umum (BBPJN)",
    color: "#2563eb", // Royal Blue
    badgeBg: "bg-blue-50",
    badgeBorder: "border-blue-200",
    badgeText: "text-blue-700",
    ringColor: "ring-blue-500",
  },
  PROVINSI: {
    label: "Jalan Provinsi",
    responsibleAgency: "Dinas Bina Marga Provinsi",
    color: "#7c3aed", // Vivid Purple / Violet
    badgeBg: "bg-purple-50",
    badgeBorder: "border-purple-200",
    badgeText: "text-purple-700",
    ringColor: "ring-purple-500",
  },
  KOTA: {
    label: "Jalan Kota",
    responsibleAgency: "Dinas PUPR Kota / Walikota",
    color: "#0d9488", // Teal
    badgeBg: "bg-teal-50",
    badgeBorder: "border-teal-200",
    badgeText: "text-teal-800",
    ringColor: "ring-teal-500",
  },
  KABUPATEN: {
    label: "Jalan Kabupaten",
    responsibleAgency: "Dinas PUPR Kabupaten / Bupati",
    color: "#059669", // Emerald
    badgeBg: "bg-emerald-50",
    badgeBorder: "border-emerald-200",
    badgeText: "text-emerald-800",
    ringColor: "ring-emerald-500",
  },
  KOTA_KAB: {
    label: "Jalan Kota / Kabupaten",
    responsibleAgency: "Dinas PUPR Daerah",
    color: "#0d9488", // Teal
    badgeBg: "bg-teal-50",
    badgeBorder: "border-teal-200",
    badgeText: "text-teal-700",
    ringColor: "ring-teal-500",
  },
};

// 2. Sistem Warna Status Tindak Lanjut Pengaduan
export const REPORT_STATUS = {
  MENUNGGU_VERIFIKASI: {
    label: "Menunggu Verifikasi",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
  },
  DALAM_PENGERJAAN: {
    label: "Dalam Penanganan Fisik",
    badgeBg: "bg-sky-50 text-sky-800 border-sky-200",
  },
  SELESAI: {
    label: "Penanganan Selesai",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  OVERDUE: {
    label: "Terlambat Menanggapi (>14 Hari)",
    badgeBg: "bg-red-50 text-red-700 border-red-200 font-bold",
  },
};

// 3. Status Tingkat Keyakinan Pencocokan Anggaran Proyek (Budget Match Confidence)
export const BUDGET_MATCH_CONFIDENCE = {
  TERKONFIRMASI: {
    label: "Terkonfirmasi",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    desc: "Paket lelang LPSE terverifikasi spesifik pada ruas jalan ini.",
  },
  PARSIAL: {
    label: "Pencocokan Parsial",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    desc: "Paket pemeliharaan koridor mencakup beberapa segmen ruas terkait.",
  },
  BELUM_DITEMUKAN: {
    label: "Belum Ditemukan",
    badgeBg: "bg-slate-100 text-slate-600 border-slate-200",
    desc: "Belum terdata paket lelang APBD pemeliharaan periodik pada tahun anggaran berjalan.",
  },
};
