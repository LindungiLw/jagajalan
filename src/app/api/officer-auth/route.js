import { NextResponse } from "next/server";
import {
  OFFICER_COOKIE_NAME,
  createOtpChallenge,
  findServerOfficerByIdentifier,
  signOfficerToken,
  verifyOfficerToken,
  verifyOtpChallenge,
  verifyServerOfficerPassword,
} from "@/lib/officerAuth";

export const dynamic = "force-dynamic";

const AUTH_RATE_LIMIT = new Map();
const AUTH_WINDOW_MS = 60 * 1000;
const AUTH_MAX_ATTEMPTS = 20;

function isAuthRateLimited(request) {
  const ip =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1";
  const now = Date.now();
  if (AUTH_RATE_LIMIT.size > 500) {
    for (const [k, v] of AUTH_RATE_LIMIT.entries()) {
      if (now > v.resetTime) AUTH_RATE_LIMIT.delete(k);
    }
  }
  const entry = AUTH_RATE_LIMIT.get(ip) || { count: 0, resetTime: now + AUTH_WINDOW_MS };
  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + AUTH_WINDOW_MS;
    AUTH_RATE_LIMIT.set(ip, entry);
    return false;
  }
  if (entry.count >= AUTH_MAX_ATTEMPTS) return true;
  entry.count += 1;
  AUTH_RATE_LIMIT.set(ip, entry);
  return false;
}

function buildAuthenticatedResponse(officer, authMethod) {
  const { token, issuedAt, expiresAt } = signOfficerToken(officer, authMethod);
  const sessionRecord = {
    ...officer,
    isAuthenticated: true,
    authMethod,
    sessionToken: token,
    issuedAt,
    expiresAt,
  };

  const res = NextResponse.json({
    success: true,
    officer: sessionRecord,
  });

  res.cookies.set(OFFICER_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 4 * 60 * 60,
  });

  return res;
}

async function verifyFirebaseIdToken(idToken) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!idToken || !apiKey) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        signal: controller.signal,
      }
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const user = data?.users?.[0];
    if (!user?.email) return null;
    return {
      email: user.email,
      displayName: user.displayName || "",
    };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export async function GET(request) {
  const cookieToken = request.cookies.get(OFFICER_COOKIE_NAME)?.value;
  const verified = verifyOfficerToken(cookieToken);
  if (!verified) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  return NextResponse.json({ authenticated: true, claims: verified }, { status: 200 });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(OFFICER_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

export async function POST(request) {
  try {
    if (isAuthRateLimited(request)) {
      return NextResponse.json(
        { success: false, message: "Terlalu banyak percobaan login. Tunggu 1 menit." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Permintaan autentikasi tidak valid." },
        { status: 400 }
      );
    }

    const action = String(body.action || "").toUpperCase();

    if (action === "NIP_PASSWORD") {
      const officer = verifyServerOfficerPassword(body.identifier, body.password);
      if (!officer) {
        return NextResponse.json(
          {
            success: false,
            message:
              "ID Akun atau Kata Sandi tidak sesuai. Gunakan akun demo resmi (misal: DEMO-001 / jagajalan2026).",
          },
          { status: 401 }
        );
      }
      return buildAuthenticatedResponse(officer, "NIP_PASSWORD");
    }

    if (action === "SEND_OTP") {
      const cleanEmail = String(body.email || "").trim().toLowerCase();
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json(
          {
            success: false,
            message: "Silakan masukkan alamat email yang valid (contoh: petugas.demo@jagajalan.id).",
          },
          { status: 400 }
        );
      }
      const { code, challengeToken, expiresAt } = createOtpChallenge(cleanEmail);
      return NextResponse.json({
        success: true,
        challengeToken,
        expiresAt,
        // Demo preview code displayed in the Mode Demonstrasi helper banner when no SMTP gateway is configured
        demoOtpPreview: process.env.DISABLE_DEMO_AUTH === "true" ? undefined : code,
      });
    }

    if (action === "VERIFY_OTP") {
      const cleanEmail = String(body.email || "").trim().toLowerCase();
      const valid = verifyOtpChallenge(cleanEmail, body.code, body.challengeToken);
      if (!valid) {
        return NextResponse.json(
          {
            success: false,
            message: "Kode OTP salah atau telah kedaluwarsa. Silakan kirim ulang kode.",
          },
          { status: 401 }
        );
      }

      const matched = findServerOfficerByIdentifier(cleanEmail);
      const officer = matched || {
        id: "DEMO-001",
        nip: "DEMO-001",
        email: cleanEmail,
        name: "Petugas Demo",
        title: "Inspektur Pelaporan & Preservasi Jalan (Mode Demonstrasi)",
        institution: "Simulasi Satuan Tugas Penyelenggara Jalan",
        authorityLevel: "NASIONAL",
        authorityLabel: "Jalan Nasional (Mode Demo)",
        jurisdiction: "Wilayah Penyelenggaraan Terverifikasi (Simulasi)",
        badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
        avatar: "DM",
        status: "Mode Demonstrasi Aktif",
        activeSince: "Simulasi 2026",
      };
      return buildAuthenticatedResponse(officer, "EMAIL_OTP");
    }

    if (action === "GOOGLE_SSO") {
      const fbUser = await verifyFirebaseIdToken(body.idToken);
      if (fbUser) {
        const matched = findServerOfficerByIdentifier(fbUser.email);
        const officer = matched || {
          id: "DEMO-001",
          nip: "DEMO-001",
          email: fbUser.email,
          name: fbUser.displayName ? `${fbUser.displayName} (Petugas)` : "Petugas Demo",
          title: "Inspektur Lapangan Penyelenggara Jalan (SSO Google)",
          institution: "Dinas Pekerjaan Umum & Penataan Ruang",
          authorityLevel: "NASIONAL",
          authorityLabel: "Jalan Nasional (Mode Demo)",
          jurisdiction: "Koridor Pengawasan Lintas Wilayah (Simulasi)",
          badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
          avatar: "GG",
          status: "Terverifikasi Google SSO",
          activeSince: "Simulasi 2026",
        };
        return buildAuthenticatedResponse(officer, "GOOGLE_SSO");
      }

      if (process.env.DISABLE_DEMO_AUTH === "true") {
        return NextResponse.json(
          { success: false, message: "Token Google SSO tidak valid." },
          { status: 401 }
        );
      }

      const preset = findServerOfficerByIdentifier(body.officerId || "DEMO-001");
      if (!preset) {
        return NextResponse.json(
          { success: false, message: "Akun petugas demo tidak ditemukan." },
          { status: 404 }
        );
      }
      return buildAuthenticatedResponse(preset, "GOOGLE_SSO");
    }

    if (action === "DEMO_INSTANT") {
      if (process.env.DISABLE_DEMO_AUTH === "true") {
        return NextResponse.json(
          { success: false, message: "Mode demo dinonaktifkan pada lingkungan produksi." },
          { status: 403 }
        );
      }
      const preset = findServerOfficerByIdentifier(body.officerId || "DEMO-001");
      if (!preset) {
        return NextResponse.json(
          { success: false, message: "Akun petugas demo tidak ditemukan." },
          { status: 404 }
        );
      }
      return buildAuthenticatedResponse(preset, "DEMO_INSTANT");
    }

    return NextResponse.json(
      { success: false, message: "Metode autentikasi tidak dikenal." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat memproses autentikasi." },
      { status: 500 }
    );
  }
}
