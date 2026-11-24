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
    status: "Aktif",
    activeSince: "2026",
  },
];

const SESSION_STORAGE_KEY = "jagajalan_officer_session_v2";
const LEGACY_SESSION_KEY = "jagajalan_officer_session";
const SESSION_TTL_MS = 4 * 60 * 60 * 1000;

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
    authMethod: safeOfficer.authMethod || authMethod,
    sessionToken: safeOfficer.sessionToken || "",
    issuedAt: safeOfficer.issuedAt || new Date(now).toISOString(),
    expiresAt: safeOfficer.expiresAt || now + SESSION_TTL_MS,
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

async function postOfficerAuth(payload) {
  const res = await fetch("/api/officer-auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function authenticateOfficer(identifier, password) {
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

  try {
    const { ok, data } = await postOfficerAuth({
      action: "NIP_PASSWORD",
      identifier: identifier.trim(),
      password: password.trim(),
    });
    if (!ok || !data?.success || !data?.officer) {
      return {
        success: false,
        message:
          data?.message ||
          "ID Akun atau Kata Sandi tidak sesuai. Gunakan tombol Masuk Cepat Demo atau periksa kredensial Anda.",
      };
    }
    const saved = saveOfficerSession(data.officer, "NIP_PASSWORD");
    return { success: true, officer: saved };
  } catch {
    return {
      success: false,
      message: "Gagal menghubungi layanan autentikasi server. Periksa koneksi Anda.",
    };
  }
}

export async function requestOfficerOtp(email) {
  try {
    const { ok, data } = await postOfficerAuth({
      action: "SEND_OTP",
      email: String(email || "").trim(),
    });
    if (!ok || !data?.success) {
      return {
        success: false,
        message: data?.message || "Gagal mengirim kode OTP verifikasi.",
      };
    }
    return {
      success: true,
      challengeToken: data.challengeToken,
      demoOtpPreview: data.demoOtpPreview || "",
    };
  } catch {
    return {
      success: false,
      message: "Layanan OTP sedang tidak terjangkau. Coba beberapa saat lagi.",
    };
  }
}

export async function verifyOfficerOtp(email, code, challengeToken) {
  try {
    const { ok, data } = await postOfficerAuth({
      action: "VERIFY_OTP",
      email: String(email || "").trim(),
      code: String(code || "").trim(),
      challengeToken,
    });
    if (!ok || !data?.success || !data?.officer) {
      return {
        success: false,
        message: data?.message || "Kode OTP salah atau telah kedaluwarsa.",
      };
    }
    const saved = saveOfficerSession(data.officer, "EMAIL_OTP");
    return { success: true, officer: saved };
  } catch {
    return {
      success: false,
      message: "Gagal memverifikasi kode OTP ke server.",
    };
  }
}

export async function authenticateOfficerGoogle({ idToken = "", officerId = "DEMO-001" }) {
  try {
    const { ok, data } = await postOfficerAuth({
      action: "GOOGLE_SSO",
      idToken,
      officerId,
    });
    if (!ok || !data?.success || !data?.officer) {
      return {
        success: false,
        message: data?.message || "Autentikasi Google SSO gagal diverifikasi.",
      };
    }
    const saved = saveOfficerSession(data.officer, "GOOGLE_SSO");
    return { success: true, officer: saved };
  } catch {
    return {
      success: false,
      message: "Gagal menghubungi server autentikasi Google SSO.",
    };
  }
}

export async function authenticateOfficerDemo(officerId = "DEMO-001") {
  try {
    const { ok, data } = await postOfficerAuth({
      action: "DEMO_INSTANT",
      officerId,
    });
    if (!ok || !data?.success || !data?.officer) {
      return {
        success: false,
        message: data?.message || "Login akun demo tidak tersedia.",
      };
    }
    const saved = saveOfficerSession(data.officer, "DEMO_INSTANT");
    return { success: true, officer: saved };
  } catch {
    return {
      success: false,
      message: "Gagal memulai sesi petugas demo.",
    };
  }
}

export function getActiveOfficerSession() {
  if (typeof window === "undefined") return null;
  try {
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
      !String(parsed.sessionToken).includes(".") ||
      !parsed.id
    ) {
      clearOfficerSession();
      return null;
    }

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

export function clearOfficerSession() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_SESSION_KEY);
    fetch("/api/officer-auth", { method: "DELETE", credentials: "same-origin" }).catch(() => {});
  } catch (e) {
    console.warn("Gagal menghapus sesi petugas:", e);
  }
}
