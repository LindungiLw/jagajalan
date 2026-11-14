import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { INITIAL_REPORTS } from "@/data/reportsData";
import { ROAD_SEGMENTS, detectJurisdictionByCoordinates } from "@/data/roadsData";
import { computeSpatialCellId, getDatabaseScalabilityMetrics } from "@/lib/firebase";

const STORAGE_FILE = path.join(os.tmpdir(), "jagajalan-live-reports-v1.json");

function buildSeedNotifications(reports) {
  const seeded = [];

  for (const rep of reports) {
    if (!rep) continue;

    if (rep.status === "SELESAI" || rep.progressStatus === "SELESAI") {
      const lastUpdate =
        Array.isArray(rep.updates) && rep.updates.length > 0
          ? rep.updates[rep.updates.length - 1]
          : null;
      seeded.push({
        id: `NOTIF-SEED-${rep.id}-DONE`,
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
        message:
          lastUpdate?.note ||
          `Perbaikan fisik pada ${rep.roadName} telah diselesaikan dan terverifikasi oleh ${rep.authorityLabel}.`,
        officer: lastUpdate?.officer || rep.authorityLabel,
        createdAt: lastUpdate?.date || rep.reportDate || new Date().toISOString(),
        hasProofPhoto: Boolean(rep.afterPhotoUrl),
      });
    } else if (rep.status === "DALAM_PENGERJAAN" || rep.progressStatus === "DALAM_PENGERJAAN") {
      const lastUpdate =
        Array.isArray(rep.updates) && rep.updates.length > 0
          ? rep.updates[rep.updates.length - 1]
          : null;
      seeded.push({
        id: `NOTIF-SEED-${rep.id}-PROG`,
        reportId: rep.id,
        ticketCode: rep.ticketCode,
        roadSegmentId: rep.roadSegmentId,
        roadName: rep.roadName,
        district: rep.district,
        authority: rep.authority,
        authorityLabel: rep.authorityLabel,
        type: "STATUS_IN_PROGRESS",
        status: "DALAM_PENGERJAAN",
        title: `Dalam Pengerjaan Dinas: #${rep.ticketCode}`,
        message:
          lastUpdate?.note ||
          `Tim teknis ${rep.authorityLabel} sedang menindaklanjuti perbaikan pada ${rep.roadName}.`,
        officer: lastUpdate?.officer || rep.authorityLabel,
        createdAt: lastUpdate?.date || rep.reportDate || new Date().toISOString(),
        hasProofPhoto: false,
      });
    } else if (rep.status === "OVERDUE" || rep.isResponseOverdue) {
      seeded.push({
        id: `NOTIF-SEED-${rep.id}-SLA`,
        reportId: rep.id,
        ticketCode: rep.ticketCode,
        roadSegmentId: rep.roadSegmentId,
        roadName: rep.roadName,
        district: rep.district,
        authority: rep.authority,
        authorityLabel: rep.authorityLabel,
        type: "SLA_OVERDUE_ALERT",
        status: "OVERDUE",
        title: `Peringatan Tenggat Respons: #${rep.ticketCode}`,
        message: `Laporan pada ${rep.roadName} telah melewati batas waktu tanggap acuan (+${rep.daysOverdue || 1} hari). Draf advokasi Ombudsman RI siap digunakan.`,
        officer: "Pemantau Akuntabilitas JagaJalan",
        createdAt: rep.targetResponseDeadline || rep.reportDate || new Date().toISOString(),
        hasProofPhoto: false,
      });
    }
  }

  return seeded
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);
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
        notifications: (state.notifications || []).slice(0, 30),
        data: paginatedReports,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memuat daftar laporan warga.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const state = loadPersistedState();

    const matchedRoad =
      ROAD_SEGMENTS.find((r) => r.id === body.roadSegmentId) || ROAD_SEGMENTS[0];

    let lat = Number(body.coordinates?.[0]);
    let lng = Number(body.coordinates?.[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      lat = matchedRoad?.center?.[0] || -6.2088;
      lng = matchedRoad?.center?.[1] || 106.8456;
    }

    const detected = detectJurisdictionByCoordinates(lat, lng, ROAD_SEGMENTS);
    const authority =
      body.authority || matchedRoad?.authority || detected?.authority || "NASIONAL";
    const authCode = authority.substring(0, 3).toUpperCase();
    const ticketCode =
      body.ticketCode || `JGJ-${authCode}-${Math.floor(100 + Math.random() * 900)}`;

    const nowIso = new Date().toISOString();
    const deadlineIso = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const newReport = {
      id: body.id || `REP-${Date.now()}`,
      ticketCode,
      roadSegmentId: body.roadSegmentId || matchedRoad?.id || "ruas-nas-01",
      roadName: body.roadName || matchedRoad?.name || "Ruas Jalan Publik",
      district:
        body.district || matchedRoad?.district || detected?.district || "Indonesia",
      authority,
      authorityLabel:
        body.authorityLabel ||
        matchedRoad?.authorityLabel ||
        detected?.authorityLabel ||
        "Penyelenggara Jalan Terkait",
      legalBasis:
        body.legalBasis ||
        matchedRoad?.legalBasis ||
        detected?.legalBasis ||
        "UU No. 2 Tahun 2022 tentang Jalan",
      coordinates: [Number(lat.toFixed(6)), Number(lng.toFixed(6))],
      coordinateSource: body.coordinateSource || "GIS_PINPOINT",
      spatialCellId: computeSpatialCellId(lat, lng, 0.5),
      address:
        body.address || `Titik Koordinat [${lat.toFixed(5)}, ${lng.toFixed(5)}]`,
      damageCategory: body.damageCategory || "POTHOLE_CRITICAL",
      categoryLabel: body.categoryLabel || "Lubang Jalan Kritis (Pothole)",
      hazardScore: Number(body.hazardScore) || 85,
      hazardLevel: body.hazardLevel || "TINGGI",
      aiAnalysis:
        body.aiAnalysis ||
        "Pemeriksaan awal foto mendeteksi indikasi kerusakan perkerasan jalan yang memerlukan verifikasi lapangan.",
      photoUrl:
        body.photoUrl ||
        "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
      reporterName: body.reporterName || "W*** (Warga Terverifikasi)",
      notificationContact: body.notificationContact || "",
      notifyOnUpdate: body.notifyOnUpdate !== false,
      reportDate: body.reportDate || nowIso,
      targetResponseDeadline: body.targetResponseDeadline || deadlineIso,
      status: body.status || "MENUNGGU_VERIFIKASI",
      progressStatus: body.progressStatus || "MENUNGGU_VERIFIKASI",
      isResponseOverdue: false,
      daysOverdue: 0,
      upvotes: Number(body.upvotes) || 1,
      userConfirmed: true,
      isLiveCitizenReport: true,
      leadership: body.leadership || matchedRoad?.leadership || detected?.leadership,
      matchingBudget: body.matchingBudget || matchedRoad?.budget || null,
      updates:
        Array.isArray(body.updates) && body.updates.length > 0
          ? body.updates
          : [
              {
                date: nowIso,
                officer: "Sistem Geospasial JagaJalan",
                note: `Titik kerusakan [${lat.toFixed(5)}, ${lng.toFixed(5)}] dipetakan pada layer GIS dan diteruskan ke ${
                  body.authorityLabel || matchedRoad?.authorityLabel || "dinas terkait"
                }.`,
              },
            ],
    };

    const createdNotification = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      reportId: newReport.id,
      ticketCode: newReport.ticketCode,
      roadSegmentId: newReport.roadSegmentId,
      roadName: newReport.roadName,
      district: newReport.district,
      authority: newReport.authority,
      authorityLabel: newReport.authorityLabel,
      type: "REPORT_CREATED",
      status: newReport.status,
      title: `Tiket #${newReport.ticketCode} Terbit & Dipetakan di GIS`,
      message: `Titik laporan pada ${newReport.roadName} [${lat.toFixed(4)}, ${lng.toFixed(4)}] telah masuk antrean verifikasi ${newReport.authorityLabel}.`,
      officer: "Sistem Notifikasi Otomatis JagaJalan",
      createdAt: nowIso,
      hasProofPhoto: false,
    };

    state.customReports = [
      newReport,
      ...state.customReports.filter((r) => r.id !== newReport.id),
    ];
    state.notifications = [
      createdNotification,
      ...(state.notifications || []),
    ].slice(0, 60);

    savePersistedState(state);

    return NextResponse.json(
      {
        success: true,
        report: newReport,
        notification: createdNotification,
        totalCustomReports: state.customReports.length,
        lastUpdatedAt: state.lastUpdatedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal menyimpan laporan kerusakan jalan.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, ...rawUpdatedFields } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID laporan wajib disertakan." },
        { status: 400 }
      );
    }

    const updatedFields = { ...rawUpdatedFields };
    const nextStatusCandidate = updatedFields.status || updatedFields.progressStatus;
    if (
      nextStatusCandidate === "TERVERIFIKASI" ||
      nextStatusCandidate === "DALAM_PENGERJAAN" ||
      nextStatusCandidate === "SELESAI"
    ) {
      updatedFields.status = nextStatusCandidate;
      updatedFields.progressStatus = nextStatusCandidate;
      updatedFields.isResponseOverdue = false;
      updatedFields.daysOverdue = 0;
    }
    if (updatedFields.proofPhotoUrl && !updatedFields.afterPhotoUrl) {
      updatedFields.afterPhotoUrl = updatedFields.proofPhotoUrl;
    }

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
      generatedNotification = {
        id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
          ? `Verifikasi Diterima Dinas: #${updatedReport.ticketCode}`
          : `Dalam Perbaikan Dinas: #${updatedReport.ticketCode}`,
        message:
          latestUpdate?.note ||
          (isResolved
            ? `Perbaikan fisik jalan pada ${updatedReport.roadName} telah selesai beserta unggahan bukti dokumentasi.`
            : isVerified
            ? `Laporan warga pada ${updatedReport.roadName} telah diterima dan diverifikasi oleh ${updatedReport.authorityLabel}.`
            : `Laporan pada ${updatedReport.roadName} kini berstatus Dalam Perbaikan oleh ${updatedReport.authorityLabel}.`),
        officer: latestUpdate?.officer || updatedReport.authorityLabel,
        createdAt: new Date().toISOString(),
        hasProofPhoto: Boolean(updatedReport.proofPhotoUrl || updatedReport.afterPhotoUrl),
      };

      state.notifications = [
        generatedNotification,
        ...(state.notifications || []),
      ].slice(0, 60);
      savePersistedState(state);
    }

    return NextResponse.json({
      success: true,
      report: updatedReport,
      notification: generatedNotification,
      lastUpdatedAt: state.lastUpdatedAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memperbarui status laporan.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
