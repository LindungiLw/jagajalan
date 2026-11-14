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

// 1. Sistem Warna Status Kewenangan Jalan (Terpisah tegas dari warna aksi & status SLA)
export const AUTHORITY_COLORS = {
  NASIONAL: {
    label: "Jalan Nasional",
    responsibleAgency: "Kementerian Pekerjaan Umum (BBPJN)",
    color: "#2563eb", // Blue
    badgeBg: "bg-blue-50",
    badgeBorder: "border-blue-200",
    badgeText: "text-blue-800",
    ringColor: "ring-blue-500",
  },
  PROVINSI: {
    label: "Jalan Provinsi",
    responsibleAgency: "Dinas Bina Marga Provinsi",
    color: "#7c3aed", // Purple
    badgeBg: "bg-purple-50",
    badgeBorder: "border-purple-200",
    badgeText: "text-purple-800",
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
    badgeText: "text-teal-800",
    ringColor: "ring-teal-500",
  },
};

// 2. Sistem Warna Status Tindak Lanjut Pengaduan
export const REPORT_STATUS = {
  MENUNGGU_VERIFIKASI: {
    label: "Menunggu Verifikasi",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
  },
  TERVERIFIKASI: {
    label: "Verifikasi Diterima Dinas",
    badgeBg: "bg-blue-50 text-blue-800 border-blue-200",
  },
  DALAM_PENGERJAAN: {
    label: "Dalam Penanganan Fisik",
    badgeBg: "bg-orange-50 text-orange-800 border-orange-200",
  },
  SELESAI: {
    label: "Penanganan Selesai",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  OVERDUE: {
    label: "Melewati Tenggat Respons",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
  },
};

// 3. Status Tingkat Keyakinan Pencocokan Anggaran Proyek (Budget Match Confidence)
export const BUDGET_MATCH_CONFIDENCE = {
  TERKONFIRMASI: {
    label: "Terkonfirmasi",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
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
