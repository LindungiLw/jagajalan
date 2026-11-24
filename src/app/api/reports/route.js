import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { INITIAL_REPORTS } from "@/data/reportsData";
import { ROAD_SEGMENTS, detectJurisdictionByCoordinates } from "@/data/roadsData";
import { computeSpatialCellId, getDatabaseScalabilityMetrics } from "@/lib/firebase";
import { extractVerifiedOfficerFromRequest } from "@/lib/officerAuth";

export const dynamic = "force-dynamic";

const STORAGE_FILE = path.join(os.tmpdir(), "jagajalan-live-reports-v1.json");

const WRITE_RATE_LIMIT_MAP = new Map();
const WRITE_RATE_WINDOW_MS = 60 * 1000;
const MAX_WRITES_PER_WINDOW = 45;
const ALLOWED_STATUSES = new Set([
  "MENUNGGU_VERIFIKASI",
  "TERVERIFIKASI",
  "DALAM_PENGERJAAN",
  "SELESAI",
  "OVERDUE",
]);

function isWriteRateLimited(request) {
  const realIp = request.headers.get("x-real-ip");
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = (realIp || (forwardedFor ? forwardedFor.split(",")[0] : "") || "127.0.0.1").trim();
  const now = Date.now();
  if (WRITE_RATE_LIMIT_MAP.size > 500) {
    for (const [k, v] of WRITE_RATE_LIMIT_MAP.entries()) {
      if (now > v.resetTime) WRITE_RATE_LIMIT_MAP.delete(k);
    }
  }
  const entry = WRITE_RATE_LIMIT_MAP.get(ip) || {
    count: 0,
    resetTime: now + WRITE_RATE_WINDOW_MS,
  };
  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + WRITE_RATE_WINDOW_MS;
    WRITE_RATE_LIMIT_MAP.set(ip, entry);
    return false;
  }
  if (entry.count >= MAX_WRITES_PER_WINDOW) {
    return true;
  }
  entry.count += 1;
  WRITE_RATE_LIMIT_MAP.set(ip, entry);
  return false;
}

function sanitizePlainText(val, maxLen = 500, fallback = "") {
  if (typeof val !== "string") return fallback;
  const cleaned = val
    .replace(/<[^>]*>?/gm, "")
    .replace(/javascript:/gi, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  return cleaned ? cleaned.slice(0, maxLen) : fallback;
}

function maskReporterIdentity(rawName) {
  const cleaned = sanitizePlainText(rawName, 80, "");
  if (!cleaned) return "W*** (Warga Terverifikasi)";
  if (cleaned.includes("***")) return cleaned;
  const initial = cleaned.charAt(0).toUpperCase();
  return `${initial}*** (Warga Terverifikasi)`;
}

function toPublicReportView(rep) {
  if (!rep || typeof rep !== "object") return rep;
  const { notificationContact, ...publicFields } = rep;
  return {
    ...publicFields,
    reporterName: maskReporterIdentity(publicFields.reporterName),
    hasNotificationContact: Boolean(notificationContact),
  };
}

function sanitizeImageUrl(url, fallback = "/images/roads/jalan-lubang-medan.jpg") {
  if (!url || typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed.slice(0, 300);
  }
  if (/^https:\/\/[a-zA-Z0-9.-]+(\/[^\s<>"']*)?$/.test(trimmed)) {
    return trimmed.slice(0, 1000);
  }
  if (
    /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(trimmed) &&
    trimmed.length <= 6 * 1024 * 1024
  ) {
    return trimmed;
  }
  return fallback;
}

function canonicalNotifStage(item) {
  const status = String(item?.status || "").toUpperCase();
  const type = String(item?.type || "").toUpperCase();
  if (status === "SELESAI" || type === "STATUS_RESOLVED") return "SELESAI";
  if (status === "OVERDUE" || type === "SLA_OVERDUE_ALERT") return "OVERDUE";
  if (status === "TERVERIFIKASI" || type === "STATUS_VERIFIED") return "TERVERIFIKASI";
  if (status === "DALAM_PENGERJAAN" || type === "STATUS_IN_PROGRESS") return "DALAM_PENGERJAAN";
  return "CREATED";
}

function buildCleanNotificationMessage({ status, roadName, authorityLabel, note, daysOverdue }) {
  const safeRoad = roadName || "ruas jalan ini";
  const safeAuth = authorityLabel || "dinas penyelenggara jalan";
  const rawNote = typeof note === "string" ? note.trim() : "";
  const looksLikeRawGps = /\[-?\d+\.\d+,\s*-?\d+\.\d+\]/.test(rawNote) || /terpetakan secara real/i.test(rawNote);
  const looksLikeOverdueNote = /terlampaui|tenggat batas waktu/i.test(rawNote);

  if (status === "SELESAI") {
    if (rawNote && !looksLikeRawGps && !looksLikeOverdueNote) return rawNote;
    return `Perbaikan pada ${safeRoad} selesai dikerjakan dan diverifikasi oleh ${safeAuth}.`;
  }
  if (status === "OVERDUE") {
    if (rawNote && !looksLikeRawGps) return rawNote;
    return `Batas tanggap 14 hari kerja terlewati (+${daysOverdue || 1} hari). Draf pengaduan Ombudsman RI siap digunakan.`;
  }
  if (status === "TERVERIFIKASI") {
    if (rawNote && !looksLikeRawGps && !looksLikeOverdueNote) return rawNote;
    return `Laporan diterima dan diverifikasi oleh ${safeAuth}. Jadwal penanganan sedang disiapkan.`;
  }
  if (status === "DALAM_PENGERJAAN") {
    if (rawNote && !looksLikeRawGps && !looksLikeOverdueNote) return rawNote;
    return `Tim lapangan ${safeAuth} sedang menangani perbaikan pada ${safeRoad}.`;
  }
  return `Laporan kerusakan pada ${safeRoad} masuk antrean verifikasi ${safeAuth}.`;
}

function normalizeAndDedupeNotifications(rawList) {
  if (!Array.isArray(rawList)) return [];

  const sorted = [...rawList]
    .filter((item) => item && typeof item === "object")
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const byReportKey = new Map();
  for (const item of sorted) {
    if (
      typeof item.title === "string" &&
      item.title.toLowerCase().includes("notifikasi otomatis aktif")
    ) {
      continue;
    }

    const reportKey = String(item.reportId || item.ticketCode || item.id || "").toUpperCase();
    if (!reportKey || byReportKey.has(reportKey)) continue;

    const stage = canonicalNotifStage(item);
    const normalizedStatus = stage === "CREATED" ? item.status || "MENUNGGU_VERIFIKASI" : stage;
    const normalizedType =
      stage === "SELESAI"
        ? "STATUS_RESOLVED"
        : stage === "OVERDUE"
        ? "SLA_OVERDUE_ALERT"
        : stage === "TERVERIFIKASI"
        ? "STATUS_VERIFIED"
        : stage === "DALAM_PENGERJAAN"
        ? "STATUS_IN_PROGRESS"
        : "REPORT_CREATED";

    byReportKey.set(reportKey, {
      ...item,
      id: `NOTIF-${reportKey}-${stage}`,
      status: normalizedStatus,
      type: normalizedType,
      message: buildCleanNotificationMessage({
        status: normalizedStatus,
        roadName: item.roadName,
        authorityLabel: item.authorityLabel,
        note: item.message,
      }),
    });
  }

  return Array.from(byReportKey.values());
}

function buildSeedNotifications(reports) {
  const seeded = [];

  for (const rep of reports) {
    if (!rep) continue;

    const lastUpdate =
      Array.isArray(rep.updates) && rep.updates.length > 0
        ? rep.updates[rep.updates.length - 1]
        : null;

    if (rep.status === "SELESAI" || rep.progressStatus === "SELESAI") {
      seeded.push({
        id: `NOTIF-${String(rep.id).toUpperCase()}-SELESAI`,
        reportId: rep.id,
        ticketCode: rep.ticketCode,
        roadSegmentId: rep.roadSegmentId,
        roadName: rep.roadName,
        district: rep.district,
        authority: rep.authority,
        authorityLabel: rep.authorityLabel,
        type: "STATUS_RESOLVED",
        status: "SELESAI",
        title: `Perbaikan Selesai: #${rep.ticketCode}`,
        message: buildCleanNotificationMessage({
          status: "SELESAI",
          roadName: rep.roadName,
          authorityLabel: rep.authorityLabel,
          note: lastUpdate?.note,
        }),
        officer: lastUpdate?.officer || rep.authorityLabel,
        createdAt: lastUpdate?.date || rep.reportDate || new Date().toISOString(),
        hasProofPhoto: Boolean(rep.afterPhotoUrl || rep.proofPhotoUrl),
      });
    } else if (rep.status === "DALAM_PENGERJAAN" || rep.progressStatus === "DALAM_PENGERJAAN") {
      seeded.push({
        id: `NOTIF-${String(rep.id).toUpperCase()}-DALAM_PENGERJAAN`,
        reportId: rep.id,
        ticketCode: rep.ticketCode,
        roadSegmentId: rep.roadSegmentId,
        roadName: rep.roadName,
        district: rep.district,
        authority: rep.authority,
        authorityLabel: rep.authorityLabel,
        type: "STATUS_IN_PROGRESS",
        status: "DALAM_PENGERJAAN",
        title: `Dalam Perbaikan Dinas: #${rep.ticketCode}`,
        message: buildCleanNotificationMessage({
          status: "DALAM_PENGERJAAN",
          roadName: rep.roadName,
          authorityLabel: rep.authorityLabel,
          note: lastUpdate?.note,
        }),
        officer: lastUpdate?.officer || rep.authorityLabel,
        createdAt: lastUpdate?.date || rep.reportDate || new Date().toISOString(),
        hasProofPhoto: false,
      });
    } else if (rep.status === "OVERDUE" || rep.isResponseOverdue) {
      seeded.push({
        id: `NOTIF-${String(rep.id).toUpperCase()}-OVERDUE`,
        reportId: rep.id,
        ticketCode: rep.ticketCode,
        roadSegmentId: rep.roadSegmentId,
        roadName: rep.roadName,
        district: rep.district,
        authority: rep.authority,
        authorityLabel: rep.authorityLabel,
        type: "SLA_OVERDUE_ALERT",
        status: "OVERDUE",
        title: `Lewat Batas 14 Hari: #${rep.ticketCode}`,
        message: buildCleanNotificationMessage({
          status: "OVERDUE",
          roadName: rep.roadName,
          authorityLabel: rep.authorityLabel,
          daysOverdue: rep.daysOverdue,
        }),
        officer: "Pemantau Batas 14 Hari JagaJalan",
        createdAt: rep.targetResponseDeadline || rep.reportDate || new Date().toISOString(),
        hasProofPhoto: false,
      });
    }
  }

  return normalizeAndDedupeNotifications(seeded).slice(0, 12);
}

function loadPersistedState() {
  if (!globalThis.__JAGAJALAN_REPORTS_STATE__) {
    let customReports = [];
    let reportOverrides = {};
    let notifications = [];
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.customReports)) customReports = parsed.customReports;
        if (parsed.reportOverrides && typeof parsed.reportOverrides === "object") {
          reportOverrides = parsed.reportOverrides;
        }
        if (Array.isArray(parsed.notifications)) {
          notifications = parsed.notifications;
        }
      }
    } catch {
      // Ignore filesystem errors in restricted serverless environments
    }

    if (notifications.length === 0) {
      notifications = buildSeedNotifications(INITIAL_REPORTS);
    }

    globalThis.__JAGAJALAN_REPORTS_STATE__ = {
      customReports,
      reportOverrides,
      notifications,
      indexCache: null,
      indexVersion: 1,
      lastUpdatedAt: new Date().toISOString(),
    };
  }
  return globalThis.__JAGAJALAN_REPORTS_STATE__;
}

function savePersistedState(state) {
  state.lastUpdatedAt = new Date().toISOString();
  state.indexVersion = (state.indexVersion || 1) + 1;
  state.indexCache = null;
  globalThis.__JAGAJALAN_REPORTS_STATE__ = state;
  try {
    fs.writeFileSync(
      STORAGE_FILE,
      JSON.stringify(
        {
          customReports: state.customReports,
          reportOverrides: state.reportOverrides,
          notifications: (state.notifications || []).slice(0, 60),
          lastUpdatedAt: state.lastUpdatedAt,
        },
        null,
        2
      ),
      "utf8"
    );
  } catch {
    // Ignore write errors in read-only environments
  }
}

function getIndexedReportsStore() {
  const state = loadPersistedState();
  if (state.indexCache && state.indexCache.version === state.indexVersion) {
    return state.indexCache;
  }

  const seenIds = new Set();
  const all = [];
  const byId = new Map();
  const byTicket = new Map();
  const byAuthority = new Map();
  const byRoadId = new Map();
  const byStatus = new Map();
  const spatialGrid = new Map();

  const ingestReport = (rawRep) => {
    if (!rawRep || !rawRep.id || seenIds.has(rawRep.id)) return;
    seenIds.add(rawRep.id);
    const override = state.reportOverrides[rawRep.id] || {};
    const rep = { ...rawRep, ...override };
    const lat = Number(rep.coordinates?.[0]);
    const lng = Number(rep.coordinates?.[1]);
    rep.spatialCellId = computeSpatialCellId(lat, lng, 0.5);

    all.push(rep);
    byId.set(rep.id, rep);
    if (rep.ticketCode) byTicket.set(String(rep.ticketCode).toUpperCase(), rep);

    const authKey = rep.authority || "UNKNOWN";
    if (!byAuthority.has(authKey)) byAuthority.set(authKey, []);
    byAuthority.get(authKey).push(rep);

    if (rep.roadSegmentId) {
      if (!byRoadId.has(rep.roadSegmentId)) byRoadId.set(rep.roadSegmentId, []);
      byRoadId.get(rep.roadSegmentId).push(rep);
    }

    const statusKey = rep.status || "MENUNGGU_VERIFIKASI";
    if (!byStatus.has(statusKey)) byStatus.set(statusKey, []);
    byStatus.get(statusKey).push(rep);

    if (!spatialGrid.has(rep.spatialCellId)) spatialGrid.set(rep.spatialCellId, []);
    spatialGrid.get(rep.spatialCellId).push(rep);
  };

  for (const rep of state.customReports) {
    ingestReport(rep);
  }
  for (const rep of INITIAL_REPORTS) {
    ingestReport(rep);
  }

  const indexCache = {
    version: state.indexVersion,
    all,
    byId,
    byTicket,
    byAuthority,
    byRoadId,
    byStatus,
    spatialGrid,
  };

  state.indexCache = indexCache;
  return indexCache;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const authority = searchParams.get("authority") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const roadId = searchParams.get("roadId") || "";
    const ticketCode = searchParams.get("ticketCode") || "";
    const bboxParam = searchParams.get("bbox") || "";
    const search = searchParams.get("search") || "";
    const format = searchParams.get("format") || "json";
    const pageParam = Number.parseInt(searchParams.get("page") || "1", 10);
    const limitParam = Number.parseInt(searchParams.get("limit") || "0", 10);

    const state = loadPersistedState();
    const indexStore = getIndexedReportsStore();

    // 1. O(1) Indexed Partition Selection
    let candidates = indexStore.all;
    let indexUsed = "FULL_PARTITION";

    if (ticketCode.trim()) {
      const exact = indexStore.byTicket.get(ticketCode.trim().toUpperCase());
      candidates = exact ? [exact] : [];
      indexUsed = "HASH_INDEX_BY_TICKET";
    } else if (roadId) {
      candidates = indexStore.byRoadId.get(roadId) || [];
      indexUsed = "HASH_INDEX_BY_ROAD_SEGMENT";
    } else if (authority !== "ALL") {
      candidates = indexStore.byAuthority.get(authority) || [];
      indexUsed = "HASH_INDEX_BY_AUTHORITY";
    } else if (status !== "ALL") {
      candidates = indexStore.byStatus.get(status) || [];
      indexUsed = "HASH_INDEX_BY_STATUS";
    }

    // 2. Secondary Predicate Filters on Indexed Bucket
    let reports = candidates;

    if (authority !== "ALL" && indexUsed !== "HASH_INDEX_BY_AUTHORITY") {
      reports = reports.filter((r) => r.authority === authority);
    }

    if (status !== "ALL" && indexUsed !== "HASH_INDEX_BY_STATUS") {
      reports = reports.filter(
        (r) => r.status === status || r.progressStatus === status
      );
    }

    if (roadId && indexUsed !== "HASH_INDEX_BY_ROAD_SEGMENT") {
      reports = reports.filter((r) => r.roadSegmentId === roadId);
    }

    // 3. Spatial Bounding-Box Filter (?bbox=minLng,minLat,maxLng,maxLat)
    if (bboxParam.trim()) {
      const parts = bboxParam.split(",").map(Number);
      if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
        const [minLng, minLat, maxLng, maxLat] = parts;
        reports = reports.filter((r) => {
          const lat = Number(r.coordinates?.[0]);
          const lng = Number(r.coordinates?.[1]);
          return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
        });
        indexUsed = `${indexUsed}+BBOX_SPATIAL_FILTER`;
      }
    }

    // 4. Keyword Search
    if (search.trim()) {
      const q = search.toLowerCase();
      reports = reports.filter(
        (r) =>
          (r.roadName && r.roadName.toLowerCase().includes(q)) ||
          (r.ticketCode && r.ticketCode.toLowerCase().includes(q)) ||
          (r.address && r.address.toLowerCase().includes(q)) ||
          (r.district && r.district.toLowerCase().includes(q))
      );
    }

    const totalMatched = reports.length;

    // 5. Optional Pagination (?page=&limit=)
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit = !Number.isNaN(limitParam) && limitParam > 0 ? Math.min(limitParam, 500) : 0;
    const paginatedReports =
      limit > 0 ? reports.slice((page - 1) * limit, page * limit) : reports;

    if (format.toLowerCase() === "geojson") {
      const geojson = {
        type: "FeatureCollection",
        metadata: {
          generatedAt: new Date().toISOString(),
          lastUpdatedAt: state.lastUpdatedAt,
          totalFeatures: paginatedReports.length,
          totalMatched,
          liveCustomReportsCount: state.customReports.length,
          indexUsed,
          layerName: "JagaJalan Real-Time Citizen Damage Reports (GIS Layer)",
          spatialStandard: "RFC 7946 GeoJSON Point FeatureCollection (WGS84)",
        },
        features: paginatedReports
          .filter(
            (rep) =>
              Array.isArray(rep.coordinates) &&
              rep.coordinates.length >= 2 &&
              !Number.isNaN(Number(rep.coordinates[0])) &&
              !Number.isNaN(Number(rep.coordinates[1]))
          )
          .map((rep) => ({
            type: "Feature",
            id: rep.id,
            geometry: {
              type: "Point",
              coordinates: [Number(rep.coordinates[1]), Number(rep.coordinates[0])],
            },
            properties: {
              id: rep.id,
              ticketCode: rep.ticketCode,
              roadSegmentId: rep.roadSegmentId,
              roadName: rep.roadName,
              district: rep.district,
              authority: rep.authority,
              authorityLabel: rep.authorityLabel,
              legalBasis: rep.legalBasis,
              address: rep.address,
              damageCategory: rep.damageCategory,
              categoryLabel: rep.categoryLabel,
              hazardScore: rep.hazardScore,
              hazardLevel: rep.hazardLevel,
              status: rep.status,
              progressStatus: rep.progressStatus,
              isResponseOverdue: rep.isResponseOverdue,
              daysOverdue: rep.daysOverdue,
              upvotes: rep.upvotes,
              reportDate: rep.reportDate,
              targetResponseDeadline: rep.targetResponseDeadline,
              spatialCellId: rep.spatialCellId,
              isLiveCitizenReport: Boolean(rep.isLiveCitizenReport),
              proofPhotoUrl: rep.proofPhotoUrl || rep.afterPhotoUrl || null,
              latestOfficerNote: rep.updates?.[0]?.note || null,
              latestOfficerName: rep.updates?.[0]?.officer || null,
            },
          })),
      };

      return NextResponse.json(geojson, {
        headers: {
          "Content-Type": "application/geo+json",
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        total: totalMatched,
        returned: paginatedReports.length,
        page,
        limit: limit || totalMatched,
        liveCustomCount: state.customReports.length,
        lastUpdatedAt: state.lastUpdatedAt,
        scalability: {
          ...getDatabaseScalabilityMetrics(),
          indexUsed,
          indexVersion: state.indexVersion,
          spatialBucketsCount: indexStore.spatialGrid.size,
          authorityPartitionsCount: indexStore.byAuthority.size,
        },
        gisSync: {
          mode: "REALTIME_BIDIRECTIONAL_GIS",
          geojsonEndpoint: "/api/reports?format=geojson",
          authorityClassification: "UU No. 2 Tahun 2022 tentang Jalan & SK Penetapan Ruas",
        },
        notifications: normalizeAndDedupeNotifications(state.notifications || []).slice(0, 25),
        data: paginatedReports.map(toPublicReportView),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memuat daftar laporan warga.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    if (isWriteRateLimited(request)) {
      return NextResponse.json(
        {
          success: false,
          error: "Terlalu banyak permintaan pengiriman laporan. Silakan tunggu 1 menit.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Payload laporan tidak valid." },
        { status: 400 }
      );
    }

    const state = loadPersistedState();

    const matchedRoad =
      ROAD_SEGMENTS.find((r) => r.id === body.roadSegmentId) || ROAD_SEGMENTS[0];

    let lat = Number(body.coordinates?.[0]);
    let lng = Number(body.coordinates?.[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -15 || lat > 10 || lng < 90 || lng > 145) {
      lat = matchedRoad?.center?.[0] || -6.2088;
      lng = matchedRoad?.center?.[1] || 106.8456;
    }

    const detected = detectJurisdictionByCoordinates(lat, lng, ROAD_SEGMENTS);
    const rawAuthority = sanitizePlainText(
      body.authority || matchedRoad?.authority || detected?.authority || "NASIONAL",
      30,
      "NASIONAL"
    ).toUpperCase();
    const authority = ["NASIONAL", "PROVINSI", "KABUPATEN", "KOTA", "KOTA_KAB", "DESA"].includes(
      rawAuthority
    )
      ? rawAuthority
      : "NASIONAL";
    const authCode = authority.substring(0, 3).toUpperCase();
    const ticketCode = sanitizePlainText(
      body.ticketCode,
      32,
      `JGJ-${authCode}-${Math.floor(100 + Math.random() * 900)}`
    );

    const nowIso = new Date().toISOString();
    const deadlineIso = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const initialStatus = ALLOWED_STATUSES.has(body.status)
      ? body.status
      : "MENUNGGU_VERIFIKASI";

    const sanitizedUpdates =
      Array.isArray(body.updates) && body.updates.length > 0
        ? body.updates.slice(0, 15).map((u) => ({
            date: sanitizePlainText(u?.date, 40, nowIso),
            officer: sanitizePlainText(u?.officer, 120, "Sistem Geospasial JagaJalan"),
            note: sanitizePlainText(u?.note, 600, "Laporan terdaftar di layer GIS."),
          }))
        : [
            {
              date: nowIso,
              officer: "Sistem Geospasial JagaJalan",
              note: `Titik kerusakan [${lat.toFixed(5)}, ${lng.toFixed(5)}] dipetakan pada layer GIS dan diteruskan ke ${sanitizePlainText(
                body.authorityLabel || matchedRoad?.authorityLabel || "dinas terkait",
                120
              )}.`,
            },
          ];

    const newReport = {
      id: sanitizePlainText(body.id, 64, `REP-${Date.now()}`),
      ticketCode,
      roadSegmentId: sanitizePlainText(
        body.roadSegmentId,
        80,
        matchedRoad?.id || "ruas-nas-01"
      ),
      roadName: sanitizePlainText(
        body.roadName,
        160,
        matchedRoad?.name || "Ruas Jalan Publik"
      ),
      district: sanitizePlainText(
        body.district,
        120,
        matchedRoad?.district || detected?.district || "Indonesia"
      ),
      authority,
      authorityLabel: sanitizePlainText(
        body.authorityLabel,
        140,
        matchedRoad?.authorityLabel ||
          detected?.authorityLabel ||
          "Penyelenggara Jalan Terkait"
      ),
      legalBasis: sanitizePlainText(
        body.legalBasis,
        180,
        matchedRoad?.legalBasis ||
          detected?.legalBasis ||
          "UU No. 2 Tahun 2022 tentang Jalan"
      ),
      coordinates: [Number(lat.toFixed(6)), Number(lng.toFixed(6))],
      coordinateSource: sanitizePlainText(body.coordinateSource, 40, "GIS_PINPOINT"),
      spatialCellId: computeSpatialCellId(lat, lng, 0.5),
      address: sanitizePlainText(
        body.address,
        240,
        `Titik Koordinat [${lat.toFixed(5)}, ${lng.toFixed(5)}]`
      ),
      damageCategory: sanitizePlainText(body.damageCategory, 50, "POTHOLE_CRITICAL"),
      categoryLabel: sanitizePlainText(
        body.categoryLabel,
        100,
        "Lubang Jalan Kritis (Pothole)"
      ),
      hazardScore: Math.min(100, Math.max(1, Number(body.hazardScore) || 85)),
      hazardLevel: ["KRITIS", "TINGGI", "SEDANG", "RENDAH"].includes(body.hazardLevel)
        ? body.hazardLevel
        : "TINGGI",
      aiAnalysis: sanitizePlainText(
        body.aiAnalysis,
        800,
        "Pemeriksaan awal foto mendeteksi indikasi kerusakan perkerasan jalan yang memerlukan verifikasi lapangan."
      ),
      photoUrl: sanitizeImageUrl(body.photoUrl, "/images/roads/jalan-lubang-medan.jpg"),
      reporterName: maskReporterIdentity(body.reporterName),
      notificationContact: sanitizePlainText(body.notificationContact, 120, ""),
      notifyOnUpdate: body.notifyOnUpdate !== false,
      reportDate: nowIso,
      targetResponseDeadline: deadlineIso,
      status: initialStatus,
      progressStatus: initialStatus,
      isResponseOverdue: false,
      daysOverdue: 0,
      upvotes: Math.min(100000, Math.max(1, Number(body.upvotes) || 1)),
      userConfirmed: true,
      isLiveCitizenReport: true,
      leadership: matchedRoad?.leadership || detected?.leadership || null,
      matchingBudget: matchedRoad?.budget || null,
      updates: sanitizedUpdates,
    };

    const createdNotification = {
      id: `NOTIF-${String(newReport.id).toUpperCase()}-CREATED`,
      reportId: newReport.id,
      ticketCode: newReport.ticketCode,
      roadSegmentId: newReport.roadSegmentId,
      roadName: newReport.roadName,
      district: newReport.district,
      authority: newReport.authority,
      authorityLabel: newReport.authorityLabel,
      type: "REPORT_CREATED",
      status: newReport.status,
      title: `Laporan Baru Diterima: #${newReport.ticketCode}`,
      message: buildCleanNotificationMessage({
        status: newReport.status,
        roadName: newReport.roadName,
        authorityLabel: newReport.authorityLabel,
      }),
      officer: "Sistem JagaJalan",
      createdAt: nowIso,
      hasProofPhoto: false,
    };

    state.customReports = [
      newReport,
      ...state.customReports.filter((r) => r.id !== newReport.id),
    ].slice(0, 500);
    state.notifications = normalizeAndDedupeNotifications([
      createdNotification,
      ...(state.notifications || []),
    ]).slice(0, 40);

    savePersistedState(state);

    return NextResponse.json(
      {
        success: true,
        report: toPublicReportView(newReport),
        notification: createdNotification,
        totalCustomReports: state.customReports.length,
        lastUpdatedAt: state.lastUpdatedAt,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal menyimpan laporan kerusakan jalan.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    if (isWriteRateLimited(request)) {
      return NextResponse.json(
        {
          success: false,
          error: "Terlalu banyak permintaan pembaruan. Silakan tunggu 1 menit.",
        },
        { status: 429 }
      );
    }

    const verifiedOfficer = extractVerifiedOfficerFromRequest(request);
    if (!verifiedOfficer) {
      return NextResponse.json(
        {
          success: false,
          error: "Otorisasi sesi Petugas Dinas yang valid diperlukan untuk mengubah status laporan.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Payload pembaruan tidak valid." },
        { status: 400 }
      );
    }

    const id = sanitizePlainText(body.id, 64, "");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID laporan wajib disertakan." },
        { status: 400 }
      );
    }

    const officerHeaderId = verifiedOfficer.name || verifiedOfficer.id;
    const nextStatusCandidate = body.status || body.progressStatus;
    if (
      nextStatusCandidate &&
      !ALLOWED_STATUSES.has(nextStatusCandidate)
    ) {
      return NextResponse.json(
        { success: false, error: "Status tindak lanjut tidak valid." },
        { status: 400 }
      );
    }

    // Whitelist field yang diizinkan (mencegah Prototype Pollution & Mass Assignment)
    const updatedFields = {};

    if (nextStatusCandidate && ALLOWED_STATUSES.has(nextStatusCandidate)) {
      updatedFields.status = nextStatusCandidate;
      updatedFields.progressStatus = nextStatusCandidate;
      if (
        nextStatusCandidate === "TERVERIFIKASI" ||
        nextStatusCandidate === "DALAM_PENGERJAAN" ||
        nextStatusCandidate === "SELESAI"
      ) {
        updatedFields.isResponseOverdue = false;
        updatedFields.daysOverdue = 0;
      }
    }

    if (typeof body.isResponseOverdue === "boolean" && updatedFields.isResponseOverdue === undefined) {
      updatedFields.isResponseOverdue = body.isResponseOverdue;
    }

    if (typeof body.daysOverdue === "number" && updatedFields.daysOverdue === undefined) {
      updatedFields.daysOverdue = Math.max(0, Math.min(3650, Math.floor(body.daysOverdue)));
    }

    if (typeof body.upvotes === "number" && !Number.isNaN(body.upvotes)) {
      updatedFields.upvotes = Math.max(0, Math.min(100000, Math.floor(body.upvotes)));
    }

    if (body.proofPhotoUrl) {
      const safeProof = sanitizeImageUrl(
        body.proofPhotoUrl,
        "/images/roads/jalan-selesai-hotmix.jpg"
      );
      updatedFields.proofPhotoUrl = safeProof;
      updatedFields.afterPhotoUrl = safeProof;
    } else if (body.afterPhotoUrl) {
      updatedFields.afterPhotoUrl = sanitizeImageUrl(
        body.afterPhotoUrl,
        "/images/roads/jalan-selesai-hotmix.jpg"
      );
    }

    if (Array.isArray(body.updates)) {
      updatedFields.updates = body.updates.slice(0, 25).map((u) => ({
        date: sanitizePlainText(u?.date, 40, new Date().toISOString()),
        officer: sanitizePlainText(u?.officer, 120, officerHeaderId || "Petugas Dinas"),
        note: sanitizePlainText(u?.note, 600, "Status penanganan diperbarui."),
      }));
    }

    updatedFields.updatedAt = new Date().toISOString();

    const state = loadPersistedState();
    const previousReport = getIndexedReportsStore().byId.get(id) || null;
    const existingCustomIdx = state.customReports.findIndex((r) => r.id === id);

    if (existingCustomIdx !== -1) {
      state.customReports[existingCustomIdx] = {
        ...state.customReports[existingCustomIdx],
        ...updatedFields,
      };
    } else {
      state.reportOverrides[id] = {
        ...(state.reportOverrides[id] || {}),
        ...updatedFields,
      };
    }

    savePersistedState(state);
    const updatedReport = getIndexedReportsStore().byId.get(id) || null;

    let generatedNotification = null;
    if (updatedReport && (updatedFields.status || updatedFields.progressStatus || updatedFields.updates)) {
      const nextStatus = updatedReport.status || updatedReport.progressStatus || "DALAM_PENGERJAAN";
      const sortedUpdates = Array.isArray(updatedReport.updates)
        ? [...updatedReport.updates].sort(
            (a, b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime()
          )
        : [];
      const latestUpdate = sortedUpdates[0] || null;

      const isResolved = nextStatus === "SELESAI";
      const isVerified = nextStatus === "TERVERIFIKASI";
      const stage = canonicalNotifStage({ status: nextStatus });
      generatedNotification = {
        id: `NOTIF-${String(updatedReport.id).toUpperCase()}-${stage}`,
        reportId: updatedReport.id,
        ticketCode: updatedReport.ticketCode,
        roadSegmentId: updatedReport.roadSegmentId,
        roadName: updatedReport.roadName,
        district: updatedReport.district,
        authority: updatedReport.authority,
        authorityLabel: updatedReport.authorityLabel,
        previousStatus: previousReport?.status || "MENUNGGU_VERIFIKASI",
        type: isResolved
          ? "STATUS_RESOLVED"
          : isVerified
          ? "STATUS_VERIFIED"
          : "STATUS_IN_PROGRESS",
        status: nextStatus,
        title: isResolved
          ? `Perbaikan Selesai: #${updatedReport.ticketCode}`
          : isVerified
          ? `Terverifikasi Dinas: #${updatedReport.ticketCode}`
          : `Dalam Perbaikan Dinas: #${updatedReport.ticketCode}`,
        message: buildCleanNotificationMessage({
          status: nextStatus,
          roadName: updatedReport.roadName,
          authorityLabel: updatedReport.authorityLabel,
          note: latestUpdate?.note,
        }),
        officer: latestUpdate?.officer || updatedReport.authorityLabel,
        createdAt: new Date().toISOString(),
        hasProofPhoto: Boolean(updatedReport.proofPhotoUrl || updatedReport.afterPhotoUrl),
      };

      state.notifications = normalizeAndDedupeNotifications([
        generatedNotification,
        ...(state.notifications || []),
      ]).slice(0, 40);
      savePersistedState(state);
    }

    return NextResponse.json({
      success: true,
      report: toPublicReportView(updatedReport),
      notification: generatedNotification,
      lastUpdatedAt: state.lastUpdatedAt,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memperbarui status laporan.",
      },
      { status: 500 }
    );
  }
}
