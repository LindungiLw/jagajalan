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
    color: "#c2410c", // Safety Orange
    badgeBg: "bg-orange-50",
    badgeBorder: "border-orange-200",
    badgeText: "text-orange-900",
    ringColor: "ring-orange-500",
  },
  PROVINSI: {
    label: "Jalan Provinsi",
    responsibleAgency: "Dinas Bina Marga Provinsi",
    color: "#d97706", // Amber
    badgeBg: "bg-amber-50",
    badgeBorder: "border-amber-200",
    badgeText: "text-amber-900",
    ringColor: "ring-amber-500",
  },
  KOTA: {
    label: "Jalan Kota",
    responsibleAgency: "Dinas PUPR Kota / Walikota",
    color: "#ea580c", // Warm Orange
    badgeBg: "bg-orange-50/70",
    badgeBorder: "border-orange-200/70",
    badgeText: "text-orange-950",
    ringColor: "ring-orange-400",
  },
  KABUPATEN: {
    label: "Jalan Kabupaten",
    responsibleAgency: "Dinas PUPR Kabupaten / Bupati",
    color: "#78716c", // Stone
    badgeBg: "bg-stone-50",
    badgeBorder: "border-stone-200",
    badgeText: "text-stone-900",
    ringColor: "ring-stone-400",
  },
  KOTA_KAB: {
    label: "Jalan Kota / Kabupaten",
    responsibleAgency: "Dinas PUPR Daerah",
    color: "#b45309", // Warm Amber
    badgeBg: "bg-amber-50/70",
    badgeBorder: "border-amber-200/70",
    badgeText: "text-amber-950",
    ringColor: "ring-amber-400",
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
    badgeBg: "bg-orange-50 text-orange-800 border-orange-200",
  },
  SELESAI: {
    label: "Penanganan Selesai",
    badgeBg: "bg-orange-50/90 text-orange-950 border-orange-200/90",
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
    badgeBg: "bg-orange-50/90 text-orange-950 border-orange-200/90",
    desc: "Paket lelang LPSE terverifikasi spesifik pada ruas jalan ini.",
  },
  PARSIAL: {
    label: "Pencocokan Parsial",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    desc: "Paket pemeliharaan koridor mencakup beberapa segmen ruas terkait.",
  },
  BELUM_DITEMUKAN: {
    label: "Belum Ditemukan",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
    desc: "Belum terdata paket lelang APBD pemeliharaan periodik pada tahun anggaran berjalan.",
  },
};
