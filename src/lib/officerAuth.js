import crypto from "crypto";

const SESSION_TTL_MS = 4 * 60 * 60 * 1000;
const OTP_TTL_MS = 5 * 60 * 1000;
export const OFFICER_COOKIE_NAME = "jagajalan_officer_token";

// Server-only credential lookup so demo passwords are never bundled into client JavaScript
const SERVER_OFFICER_ACCOUNTS = [
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

function getHmacKey() {
  const seed =
    process.env.OFFICER_SESSION_SECRET ||
    process.env.GEMINI_API_KEYS ||
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "jagajalan-civic-hmac-v2";
  return crypto.createHash("sha256").update(`jagajalan:${seed}`).digest();
}

function getDemoPassword() {
  return process.env.OFFICER_DEMO_PASSWORD || "jagajalan2026";
}

function base64UrlEncode(input) {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(str) {
  const normalized = str.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + "=".repeat(padLen), "base64").toString("utf8");
}

function signEncodedPayload(encodedPayload) {
  return crypto
    .createHmac("sha256", getHmacKey())
    .update(encodedPayload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function timingSafeEqualStr(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function findServerOfficerByIdentifier(identifier) {
  const clean = String(identifier || "").trim().toLowerCase();
  if (!clean) return null;
  return (
    SERVER_OFFICER_ACCOUNTS.find(
      (o) =>
        o.id.toLowerCase() === clean ||
        o.nip.toLowerCase() === clean ||
        o.email.toLowerCase() === clean ||
        o.legacyEmail?.toLowerCase() === clean
    ) || null
  );
}

export function verifyServerOfficerPassword(identifier, password) {
  const officer = findServerOfficerByIdentifier(identifier);
  if (!officer) return null;
  const expected = getDemoPassword();
  if (!timingSafeEqualStr(String(password || "").trim(), expected)) {
    return null;
  }
  return officer;
}

export function signOfficerToken(officer, authMethod = "DEMO") {
  const now = Date.now();
  const payload = {
    v: 2,
    id: officer.id || "DEMO-001",
    nip: officer.nip || officer.id || "DEMO-001",
    email: officer.email || "petugas.demo@jagajalan.id",
    name: officer.name || "Petugas Demo",
    authorityLevel: officer.authorityLevel || "NASIONAL",
    authMethod,
    iat: now,
    exp: now + SESSION_TTL_MS,
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const sig = signEncodedPayload(encoded);
  return {
    token: `${encoded}.${sig}`,
    issuedAt: new Date(now).toISOString(),
    expiresAt: payload.exp,
  };
}

export function verifyOfficerToken(rawToken) {
  if (!rawToken || typeof rawToken !== "string") return null;
  const token = rawToken.replace(/^Bearer\s+/i, "").trim();
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;

  const expectedSig = signEncodedPayload(encoded);
  if (!timingSafeEqualStr(sig, expectedSig)) return null;

  try {
    const parsed = JSON.parse(base64UrlDecode(encoded));
    if (!parsed || typeof parsed !== "object" || !parsed.id || !parsed.exp) return null;
    if (Number(parsed.exp) < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function extractVerifiedOfficerFromRequest(request) {
  const authHeader = request.headers.get("authorization");
  const tokenHeader = request.headers.get("x-officer-token");
  const cookieToken = request.cookies?.get?.(OFFICER_COOKIE_NAME)?.value;

  const candidates = [authHeader, tokenHeader, cookieToken].filter(Boolean);
  for (const candidate of candidates) {
    const verified = verifyOfficerToken(candidate);
    if (verified) return verified;
  }
  return null;
}

export function createOtpChallenge(email) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const code = String(crypto.randomInt(100000, 1000000));
  const now = Date.now();
  const otpHash = crypto
    .createHmac("sha256", getHmacKey())
    .update(`otp:${cleanEmail}:${code}`)
    .digest("hex");
  const encoded = base64UrlEncode(
    JSON.stringify({
      email: cleanEmail,
      otpHash,
      exp: now + OTP_TTL_MS,
    })
  );
  const sig = signEncodedPayload(encoded);
  return {
    code,
    challengeToken: `${encoded}.${sig}`,
    expiresAt: now + OTP_TTL_MS,
  };
}

export function verifyOtpChallenge(email, code, challengeToken) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanCode = String(code || "").replace(/\D/g, "");
  if (!cleanEmail || cleanCode.length !== 6 || !challengeToken) return false;

  const parts = String(challengeToken).split(".");
  if (parts.length !== 2) return false;
  const [encoded, sig] = parts;
  if (!timingSafeEqualStr(sig, signEncodedPayload(encoded))) return false;

  try {
    const parsed = JSON.parse(base64UrlDecode(encoded));
    if (!parsed || parsed.email !== cleanEmail || Number(parsed.exp) < Date.now()) {
      return false;
    }
    const candidateHash = crypto
      .createHmac("sha256", getHmacKey())
      .update(`otp:${cleanEmail}:${cleanCode}`)
      .digest("hex");
    return timingSafeEqualStr(candidateHash, parsed.otpHash);
  } catch {
    return false;
  }
}
