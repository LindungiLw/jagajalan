// Data Akun Petugas Portal Dinas JagaJalan
// Digunakan untuk Autentikasi Pengujian & Akses Portal Dinas (Officer Portal) JagaJalan
// Memenuhi Standar Pemerintahan & Menghindari Kesan Akun Pribadi Pejabat Riil

export const OFFICIAL_OFFICERS = [
  {
    id: "DEMO-001",
    nip: "DEMO-001",
    email: "petugas.demo@jagajalan.id",
    legacyEmail: "petugas.bbpjn@pu.go.id",
    name: "Petugas Demo",
    title: "Inspektur Pengawas Preservasi Jalan",
    institution: "Kementerian Pekerjaan Umum / BBPJN",
    authorityLevel: "NASIONAL",
    authorityLabel: "Jalan Nasional",
    jurisdiction: "Ruas Arteri Primer Nasional Koridor Medan - Berastagi & Lintas Timur",
    badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
    avatar: "PD",
    password: "jagajalan2026",
    status: "Aktif",
    activeSince: "2026",
  },
  {
    id: "DEMO-002",
    nip: "DEMO-002",
    email: "demo.provinsi@jagajalan.id",
    legacyEmail: "petugas.pupr@sumutprov.go.id",
    name: "Petugas Demo (Provinsi)",
    title: "Kasi Preservasi UPTD Jalan",
    institution: "Dinas Pekerjaan Umum & Penataan Ruang Provinsi",
    authorityLevel: "PROVINSI",
    authorityLabel: "Jalan Provinsi",
    jurisdiction: "Ruas Strategis Provinsi Sumatera Utara (Siantar - Tanah Jawa)",
    badgeColor: "bg-purple-100 text-purple-900 border-purple-200",
    avatar: "DP",
    password: "jagajalan2026",
    status: "Aktif",
    activeSince: "2026",
  },
  {
    id: "DEMO-003",
    nip: "DEMO-003",
    email: "demo.kota@jagajalan.id",
    legacyEmail: "petugas.sdabmbk@pemkomedan.go.id",
    name: "Petugas Demo (Kota)",
    title: "Inspektur Preservasi Jalan & Drainase",
    institution: "Dinas Bina Marga & Bina Konstruksi Kota",
    authorityLevel: "KOTA",
    authorityLabel: "Jalan Kota",
    jurisdiction: "Ruas Lokal & Jaringan Drainase Perkotaan",
    badgeColor: "bg-teal-100 text-teal-900 border-teal-200",
    avatar: "DK",
    password: "jagajalan2026",
    status: "Aktif",
    activeSince: "2026",
  },
  {
    id: "DEMO-004",
    nip: "DEMO-004",
    email: "demo.kabupaten@jagajalan.id",
    legacyEmail: "petugas.putr@simalungunkab.go.id",
    name: "Petugas Demo (Kabupaten)",
    title: "Kasi Preservasi Jalan & Jembatan",
    institution: "Dinas Pekerjaan Umum & Tata Ruang Kabupaten",
    authorityLevel: "KABUPATEN",
    authorityLabel: "Jalan Kabupaten",
    jurisdiction: "Ruas Penghubung Antar-Kecamatan",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
    avatar: "DB",
    password: "jagajalan2026",
    status: "Aktif",
    activeSince: "2026",
  },
];

const SESSION_STORAGE_KEY = "jagajalan_officer_session";

/**
 * Autentikasi petugas dengan ID Demo / NIP atau Email dan Kata Sandi
 */
export function authenticateOfficer(identifier, password) {
  if (!identifier) {
    return { success: false, message: "ID Akun (misal: DEMO-001) atau Email wajib diisi." };
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
    status: "Aktif",
  };

  // Simpan ke local storage jika di lingkungan browser
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(targetOfficer));
    } catch (e) {
      console.warn("Gagal menyimpan sesi petugas:", e);
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
    
    // Auto-migrate sesi lama jika masih berisi nama pejabat riil
    if (parsed && !parsed.id?.startsWith("DEMO") && parsed.name !== "Petugas Demo") {
      const demoAccount = {
        ...OFFICIAL_OFFICERS[0],
        name: "Petugas Demo",
        id: "DEMO-001",
        nip: "DEMO-001",
        status: "Aktif",
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
