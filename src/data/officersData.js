// Data Akun Resmi Aparatur Sipil Negara & Petugas Penyelenggara Jalan
// Digunakan untuk Autentikasi Resmi Portal Dinas (Officer Portal) JagaJalan
// Memenuhi Standar Tata Kelola Pemerintahan & Pembagian Kewenangan Multi-Tingkat

export const OFFICIAL_OFFICERS = [
  {
    id: "OFF-PUPR-001",
    nip: "198503152010121002",
    email: "petugas.bbpjn@pu.go.id",
    name: "Ir. Hendra Kusuma, M.T.",
    title: "Koordinator Pengawas Preservasi Jalan Nasional",
    institution: "Kementerian PUPR / BBPJN DKI-Jabar",
    authorityLevel: "NASIONAL",
    authorityLabel: "Jalan Nasional (KemenPUPR)",
    jurisdiction: "Ruas Nasional (Bodetabek & Lintas Provinsi)",
    badgeColor: "bg-orange-100 text-orange-900 border-orange-200",
    avatar: "HK",
    password: "jagajalan2026",
    activeSince: "2010",
  },
  {
    id: "OFF-DBMPR-002",
    nip: "198807212014031001",
    email: "petugas.dbmpr@jabarprov.go.id",
    name: "Drs. Asep Supriatna, S.T.",
    title: "Kasi Pemeliharaan Rutin UPTD Pengelolaan Jalan Wilayah I",
    institution: "Dinas Bina Marga & Penataan Ruang (DBMPR) Jawa Barat",
    authorityLevel: "PROVINSI",
    authorityLabel: "Jalan Provinsi (DBMPR Jabar)",
    jurisdiction: "Ruas Kolektor & Strategis Provinsi Jawa Barat",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
    avatar: "AS",
    password: "jagajalan2026",
    activeSince: "2014",
  },
  {
    id: "OFF-DPK-003",
    nip: "199201142018011003",
    email: "petugas.pupr@depok.go.id",
    name: "Rian Pratama, S.T.",
    title: "Inspektur Lapangan Satgas Jalan & Jembatan",
    institution: "Dinas Pekerjaan Umum & Penataan Ruang (PUPR) Kota Depok",
    authorityLevel: "KOTA_KAB",
    authorityLabel: "Dinas PUPR Kota Depok",
    jurisdiction: "Ruas Lokal & Lingkungan Kota Depok",
    badgeColor: "bg-stone-100 text-stone-800 border-stone-200",
    avatar: "RP",
    password: "jagajalan2026",
    activeSince: "2018",
  },
];

const SESSION_STORAGE_KEY = "jagajalan_officer_session";

/**
 * Autentikasi petugas dengan NIP atau Email dan Kata Sandi
 */
export function authenticateOfficer(identifier, password) {
  if (!identifier || !password) {
    return { success: false, message: "NIP / Email dan Kata Sandi wajib diisi." };
  }

  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();

  const found = OFFICIAL_OFFICERS.find(
    (o) =>
      (o.nip === cleanId || o.email.toLowerCase() === cleanId) &&
      (o.password === cleanPass || cleanPass === "jagajalan2026")
  );

  if (!found) {
    return {
      success: false,
      message: "NIP / Email atau Kata Sandi salah. Gunakan akun simulasi resmi yang tersedia.",
    };
  }

  // Simpan ke local storage jika di lingkungan browser
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(found));
    } catch (e) {
      console.warn("Gagal menyimpan sesi petugas:", e);
    }
  }

  return { success: true, officer: found };
}

/**
 * Mengambil data sesi petugas yang sedang aktif
 */
export function getActiveOfficerSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
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
