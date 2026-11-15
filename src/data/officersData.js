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

const SESSION_STORAGE_KEY = "jagajalan_officer_session_v2";
const LEGACY_SESSION_KEY = "jagajalan_officer_session";
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 jam masa aktif sesi

function generateSessionToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `jgj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Menyimpan sesi login petugas yang telah terautentikasi (Demo / Google SSO / OTP / NIP)
 * dengan token sesi dan batas waktu kedaluwarsa (TTL) tanpa menyimpan password.
 */
export function saveOfficerSession(officerPayload, authMethod = "DEMO") {
  if (!officerPayload || typeof officerPayload !== "object") return null;

  const { password: _omittedPassword, ...safeOfficer } = officerPayload;
  const now = Date.now();
  const sessionRecord = {
    ...safeOfficer,
    id: safeOfficer.id || "DEMO-001",
    nip: safeOfficer.nip || safeOfficer.id || "DEMO-001",
    name: safeOfficer.name || "Petugas Demo",
    isAuthenticated: true,
    authMethod,
    sessionToken: safeOfficer.sessionToken || generateSessionToken(),
    issuedAt: new Date(now).toISOString(),
    expiresAt: now + SESSION_TTL_MS,
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(LEGACY_SESSION_KEY);
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionRecord));
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionRecord));
    } catch (e) {
      console.warn("Gagal menyimpan sesi petugas:", e);
    }
  }

  return sessionRecord;
}

/**
 * Autentikasi petugas dengan ID Demo / NIP atau Email dan Kata Sandi
 */
export function authenticateOfficer(identifier, password) {
  if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
    return {
      success: false,
      message: "ID Akun (misal: DEMO-001) atau Email wajib diisi.",
    };
  }

  if (!password || typeof password !== "string" || !password.trim()) {
    return {
      success: false,
      message: "Kata sandi wajib diisi.",
    };
  }

  const cleanId = identifier.trim().toLowerCase();
  const cleanPassword = password.trim();

  // Cari akun petugas yang cocok berdasarkan id, nip, email, atau legacyEmail
  const found = OFFICIAL_OFFICERS.find(
    (o) =>
      o.id.toLowerCase() === cleanId ||
      o.nip.toLowerCase() === cleanId ||
      o.email.toLowerCase() === cleanId ||
      o.legacyEmail?.toLowerCase() === cleanId
  );

  if (!found || found.password !== cleanPassword) {
    return {
      success: false,
      message:
        "ID Akun atau Kata Sandi tidak sesuai. Gunakan akun demo resmi (misal: DEMO-001 / jagajalan2026).",
    };
  }

  const sessionOfficer = saveOfficerSession(found, "NIP_PASSWORD");
  return { success: true, officer: sessionOfficer };
}

/**
 * Mengambil data sesi petugas yang sedang aktif dan valid (belum kedaluwarsa)
 */
export function getActiveOfficerSession() {
  if (typeof window === "undefined") return null;
  try {
    // Bersihkan kunci sesi versi lama yang belum memiliki validasi autentikasi/TTL
    window.localStorage.removeItem(LEGACY_SESSION_KEY);

    const raw =
      window.sessionStorage.getItem(SESSION_STORAGE_KEY) ||
      window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.isAuthenticated !== true ||
      !parsed.sessionToken ||
      !parsed.id
    ) {
      clearOfficerSession();
      return null;
    }

    // Periksa masa berlaku sesi (TTL)
    if (parsed.expiresAt && Number(parsed.expiresAt) < Date.now()) {
      clearOfficerSession();
      return null;
    }

    const { password: _omittedPassword, ...safeSession } = parsed;
    return safeSession;
  } catch {
    return null;
  }
}

/**
 * Menghapus sesi login petugas (Logout)
 */
export function clearOfficerSession() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_SESSION_KEY);
  } catch (e) {
    console.warn("Gagal menghapus sesi petugas:", e);
  }
}
