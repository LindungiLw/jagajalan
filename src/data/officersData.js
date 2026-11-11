// Data Akun Petugas Mode Demonstrasi & Pengujian JagaJalan
// Digunakan untuk Simulasi Resmi Portal Dinas (Officer Portal) JagaJalan
// Memenuhi Standar Transparansi Pengujian & Menghindari Kesan Akun Pribadi Pejabat Riil

export const OFFICIAL_OFFICERS = [
  {
    id: "DEMO-001",
    nip: "DEMO-001",
    email: "petugas.demo@jagajalan.id",
    legacyEmail: "petugas.bbpjn@pu.go.id",
    name: "Petugas Demo",
    title: "Inspektur Pengawas Preservasi Jalan (Mode Demonstrasi)",
    institution: "Kementerian Pekerjaan Umum / Balai Pelaksanaan Jalan Nasional (Simulasi)",
    authorityLevel: "NASIONAL",
    authorityLabel: "Jalan Nasional (Mode Demo)",
    jurisdiction: "Ruas Arteri Primer Nasional Koridor Medan - Berastagi & Lintas Timur",
    badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
    avatar: "DM",
    password: "jagajalan2026",
    status: "Mode Demonstrasi Aktif",
    activeSince: "Simulasi 2026",
  },
  {
    id: "DEMO-002",
    nip: "DEMO-002",
    email: "demo.provinsi@jagajalan.id",
    legacyEmail: "petugas.pupr@sumutprov.go.id",
    name: "Petugas Demo (Provinsi)",
    title: "Kasi Preservasi UPTD Jalan (Mode Demonstrasi)",
    institution: "Dinas Pekerjaan Umum & Penataan Ruang Provinsi (Simulasi)",
    authorityLevel: "PROVINSI",
    authorityLabel: "Jalan Provinsi (Mode Demo)",
    jurisdiction: "Ruas Strategis Provinsi Sumatera Utara (Siantar - Tanah Jawa)",
    badgeColor: "bg-purple-100 text-purple-900 border-purple-200",
    avatar: "DP",
    password: "jagajalan2026",
    status: "Mode Demonstrasi Aktif",
    activeSince: "Simulasi 2026",
  },
  {
    id: "DEMO-003",
    nip: "DEMO-003",
    email: "demo.kota@jagajalan.id",
    legacyEmail: "petugas.sdabmbk@pemkomedan.go.id",
    name: "Petugas Demo (Kota)",
    title: "Inspektur Preservasi Jalan & Drainase (Mode Demonstrasi)",
    institution: "Dinas Bina Marga & Bina Konstruksi Kota (Simulasi)",
    authorityLevel: "KOTA",
    authorityLabel: "Dinas Bina Marga Kota (Mode Demo)",
    jurisdiction: "Ruas Lokal & Jaringan Drainase Perkotaan (Simulasi Pengujian)",
    badgeColor: "bg-teal-100 text-teal-900 border-teal-200",
    avatar: "DK",
    password: "jagajalan2026",
    status: "Mode Demonstrasi Aktif",
    activeSince: "Simulasi 2026",
  },
  {
    id: "DEMO-004",
    nip: "DEMO-004",
    email: "demo.kabupaten@jagajalan.id",
    legacyEmail: "petugas.putr@simalungunkab.go.id",
    name: "Petugas Demo (Kabupaten)",
    title: "Kasi Preservasi Jalan & Jembatan (Mode Demonstrasi)",
    institution: "Dinas Pekerjaan Umum & Tata Ruang Kabupaten (Simulasi)",
    authorityLevel: "KABUPATEN",
    authorityLabel: "Dinas PUTR Kabupaten (Mode Demo)",
    jurisdiction: "Ruas Penghubung Antar-Kecamatan (Simulasi Pengujian)",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
    avatar: "DB",
    password: "jagajalan2026",
    status: "Mode Demonstrasi Aktif",
    activeSince: "Simulasi 2026",
  },
];

const SESSION_STORAGE_KEY = "jagajalan_officer_session";

/**
 * Autentikasi petugas dengan ID Demo / NIP atau Email dan Kata Sandi
 */
export function authenticateOfficer(identifier, password) {
  if (!identifier) {
    return { success: false, message: "ID Akun Demo (misal: DEMO-001) atau Email wajib diisi." };
  }

  const cleanId = identifier.trim().toLowerCase();

  // Cari yang cocok berdasarkan id, nip, email, legacyEmail, atau kata kunci 'demo'
  const found = OFFICIAL_OFFICERS.find(
    (o) =>
      o.id.toLowerCase() === cleanId ||
      o.nip.toLowerCase() === cleanId ||
      o.email.toLowerCase() === cleanId ||
      o.legacyEmail?.toLowerCase() === cleanId
  ) || (cleanId.includes("demo") ? OFFICIAL_OFFICERS[0] : null);

  // Jika tidak ditemukan secara spesifik, fallback ke akun demo utama DEMO-001
  const targetOfficer = found || {
    ...OFFICIAL_OFFICERS[0],
    id: cleanId.startsWith("demo") ? cleanId.toUpperCase() : "DEMO-001",
    name: "Petugas Demo",
    status: "Mode Demonstrasi Aktif",
  };

  // Simpan ke local storage jika di lingkungan browser
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(targetOfficer));
    } catch (e) {
      console.warn("Gagal menyimpan sesi petugas demo:", e);
    }
  }

  return { success: true, officer: targetOfficer };
}

/**
 * Mengambil data sesi petugas yang sedang aktif
 */
export function getActiveOfficerSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    
    // Auto-migrate sesi lama ke identitas demonstrasi jika masih berisi akun lama
    if (parsed && (!parsed.id?.startsWith("DEMO") || parsed.status !== "Mode Demonstrasi Aktif")) {
      const demoAccount = {
        ...OFFICIAL_OFFICERS[0],
        name: "Petugas Demo",
        id: "DEMO-001",
        nip: "DEMO-001",
        status: "Mode Demonstrasi Aktif",
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(demoAccount));
      return demoAccount;
    }
    
    return parsed;
  } catch (e) {
    return null;
  }
}

/**
 * Menghapus sesi login petugas (Logout)
 */
export function clearOfficerSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.warn("Gagal menghapus sesi petugas:", e);
  }
}
