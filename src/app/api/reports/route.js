import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { INITIAL_REPORTS } from "@/data/reportsData";
import { ROAD_SEGMENTS, detectJurisdictionByCoordinates } from "@/data/roadsData";

const STORAGE_FILE = path.join(os.tmpdir(), "jagajalan-live-reports-v1.json");

function loadPersistedState() {
  if (!globalThis.__JAGAJALAN_REPORTS_STATE__) {
    let customReports = [];
    let reportOverrides = {};
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.customReports)) customReports = parsed.customReports;
        if (parsed.reportOverrides && typeof parsed.reportOverrides === "object") {
          reportOverrides = parsed.reportOverrides;
        }
      }
    } catch {
      // Ignore filesystem errors in restricted serverless environments
    }
    globalThis.__JAGAJALAN_REPORTS_STATE__ = {
      customReports,
      reportOverrides,
      lastUpdatedAt: new Date().toISOString(),
    };
  }
  return globalThis.__JAGAJALAN_REPORTS_STATE__;
}

function savePersistedState(state) {
  state.lastUpdatedAt = new Date().toISOString();
  globalThis.__JAGAJALAN_REPORTS_STATE__ = state;
  try {
    fs.writeFileSync(
      STORAGE_FILE,
      JSON.stringify(
        {
          customReports: state.customReports,
          reportOverrides: state.reportOverrides,
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

function getAllMergedReports() {
  const state = loadPersistedState();
  const seenIds = new Set();
  const merged = [];

  for (const rep of state.customReports) {
    if (!rep || !rep.id || seenIds.has(rep.id)) continue;
    seenIds.add(rep.id);
    const override = state.reportOverrides[rep.id] || {};
    merged.push({ ...rep, ...override });
  }

  for (const rep of INITIAL_REPORTS) {
    if (!rep || !rep.id || seenIds.has(rep.id)) continue;
    seenIds.add(rep.id);
    const override = state.reportOverrides[rep.id] || {};
    merged.push({ ...rep, ...override });
  }

  return merged;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const authority = searchParams.get("authority") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const roadId = searchParams.get("roadId") || "";
    const search = searchParams.get("search") || "";
    const format = searchParams.get("format") || "json";

    const state = loadPersistedState();
    let reports = getAllMergedReports();

    if (authority !== "ALL") {
      reports = reports.filter((r) => r.authority === authority);
    }

    if (status !== "ALL") {
      reports = reports.filter(
        (r) => r.status === status || r.progressStatus === status
      );
    }

    if (roadId) {
      reports = reports.filter((r) => r.roadSegmentId === roadId);
    }

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

    if (format.toLowerCase() === "geojson") {
      const geojson = {
        type: "FeatureCollection",
        metadata: {
          generatedAt: new Date().toISOString(),
          lastUpdatedAt: state.lastUpdatedAt,
          totalFeatures: reports.length,
          liveCustomReportsCount: state.customReports.length,
          layerName: "JagaJalan Real-Time Citizen Damage Reports (GIS Layer)",
          spatialStandard: "RFC 7946 GeoJSON Point FeatureCollection (WGS84)",
        },
        features: reports
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
              isLiveCitizenReport: Boolean(rep.isLiveCitizenReport),
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
        total: reports.length,
        liveCustomCount: state.customReports.length,
        lastUpdatedAt: state.lastUpdatedAt,
        gisSync: {
          mode: "REALTIME_BIDIRECTIONAL_GIS",
          geojsonEndpoint: "/api/reports?format=geojson",
          authorityClassification: "UU No. 2 Tahun 2022 tentang Jalan & SK Penetapan Ruas",
        },
        data: reports,
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
    const authority = body.authority || matchedRoad?.authority || detected?.authority || "NASIONAL";
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
      district: body.district || matchedRoad?.district || detected?.district || "Indonesia",
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
      address: body.address || `Titik Koordinat [${lat.toFixed(5)}, ${lng.toFixed(5)}]`,
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
      updates: Array.isArray(body.updates) && body.updates.length > 0
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

    state.customReports = [
      newReport,
      ...state.customReports.filter((r) => r.id !== newReport.id),
    ];
    savePersistedState(state);

    return NextResponse.json(
      {
        success: true,
        report: newReport,
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
    const { id, ...updatedFields } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID laporan wajib disertakan." },
        { status: 400 }
      );
    }

    const state = loadPersistedState();
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
    const updatedReport = getAllMergedReports().find((r) => r.id === id) || null;

    return NextResponse.json({
      success: true,
      report: updatedReport,
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

