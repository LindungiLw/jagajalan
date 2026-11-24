import { NextResponse } from "next/server";
import { ROAD_SEGMENTS, detectJurisdictionByCoordinates } from "@/data/roadsData";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

const VIEWPORT_CACHE = new Map();
const IN_FLIGHT_SCANS = new Map();
const MIRROR_COOLDOWN = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;
const MIRROR_COOLDOWN_MS = 60 * 1000;
const MAX_CACHE_ENTRIES = 200;

const OSM_RATE_LIMIT = new Map();
const OSM_RATE_WINDOW_MS = 60 * 1000;
const OSM_MAX_PER_MIN = 45;

function isOsmRateLimited(request) {
  const realIp = request.headers.get("x-real-ip");
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = (realIp || (forwardedFor ? forwardedFor.split(",")[0] : "") || "127.0.0.1").trim();
  const now = Date.now();
  if (OSM_RATE_LIMIT.size > 500) {
    for (const [k, v] of OSM_RATE_LIMIT.entries()) {
      if (now > v.resetTime) OSM_RATE_LIMIT.delete(k);
    }
  }
  const entry = OSM_RATE_LIMIT.get(ip) || { count: 0, resetTime: now + OSM_RATE_WINDOW_MS };
  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + OSM_RATE_WINDOW_MS;
    OSM_RATE_LIMIT.set(ip, entry);
    return false;
  }
  if (entry.count >= OSM_MAX_PER_MIN) return true;
  entry.count += 1;
  OSM_RATE_LIMIT.set(ip, entry);
  return false;
}

function haversineKm(p1, p2) {
  const dLat = (p2[0] - p1[0]) * 111.0;
  const dLng = (p2[1] - p1[1]) * 111.0 * Math.cos((p1[0] * Math.PI) / 180.0);
  return Math.hypot(dLat, dLng);
}

// Stitch consecutive OSM way polylines that touch at endpoints so roads render as continuous unbroken lines
function stitchSegments(segments) {
  if (!segments || segments.length <= 1) return segments;
  const pool = segments.map((s) => s.slice());
  const stitched = [];

  const closeEnough = (a, b) =>
    Math.abs(a[0] - b[0]) <= 0.00045 && Math.abs(a[1] - b[1]) <= 0.00045;

  while (pool.length > 0) {
    let chain = pool.shift();
    let mergedAny = true;
    while (mergedAny) {
      mergedAny = false;
      for (let i = 0; i < pool.length; i++) {
        const cand = pool[i];
        const cStart = chain[0];
        const cEnd = chain[chain.length - 1];
        const sStart = cand[0];
        const sEnd = cand[cand.length - 1];

        if (closeEnough(cEnd, sStart)) {
          chain = chain.concat(cand.slice(1));
          pool.splice(i, 1);
          mergedAny = true;
          break;
        }
        if (closeEnough(cEnd, sEnd)) {
          chain = chain.concat(cand.slice().reverse().slice(1));
          pool.splice(i, 1);
          mergedAny = true;
          break;
        }
        if (closeEnough(sEnd, cStart)) {
          chain = cand.concat(chain.slice(1));
          pool.splice(i, 1);
          mergedAny = true;
          break;
        }
        if (closeEnough(sStart, cStart)) {
          chain = cand.slice().reverse().concat(chain.slice(1));
          pool.splice(i, 1);
          mergedAny = true;
          break;
        }
      }
    }
    stitched.push(chain);
  }
  return stitched;
}

async function fetchOverpassWithFailover(query) {
  let lastError = null;
  const now = Date.now();
  const availableMirrors = OVERPASS_MIRRORS.filter(
    (m) => (MIRROR_COOLDOWN.get(m) || 0) <= now
  );
  const candidates = (availableMirrors.length > 0 ? availableMirrors : OVERPASS_MIRRORS).slice(0, 2);

  for (const endpoint of candidates) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4200);
    try {
      const res = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "JagaJalan-CivicGIS/3.0",
        },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.elements)) {
          return json;
        }
      }
      if (res.status === 429 || res.status >= 500) {
        MIRROR_COOLDOWN.set(endpoint, Date.now() + MIRROR_COOLDOWN_MS);
      }
      lastError = new Error(`Overpass status ${res.status} from ${endpoint}`);
    } catch (err) {
      clearTimeout(timer);
      MIRROR_COOLDOWN.set(endpoint, Date.now() + MIRROR_COOLDOWN_MS);
      lastError = err;
    }
  }
  throw lastError || new Error("Overpass mirrors unavailable");
}

async function fetchNominatimContext(lat, lng) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=12&accept-language=id`;
    const res = await fetch(url, {
      headers: {
        "Accept-Language": "id",
        "User-Agent": "JagaJalan-CivicGIS/3.0",
      },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(timer);
    return null;
  }
}

function classifyWayAuthority({ hw, isKotamadya, cityOrRegency, villageOrSuburb, stateName, jurisdiction }) {
  if (hw === "motorway" || hw === "motorway_link" || hw === "trunk" || hw === "trunk_link") {
    return {
      authority: "NASIONAL",
      authorityLabel: `Kementerian Pekerjaan Umum (BPJN ${stateName})`,
      legalBasis: "Kepmen PUPR No. 1688/KPTS/M/2022 tentang Penetapan Ruas Jalan Nasional",
      regionalHead: "Menteri Pekerjaan Umum RI",
      agency: `Balai Pelaksanaan Jalan Nasional (BPJN) ${stateName}`,
      budgetSource: "APBN Kementerian PU (Preservasi Jalan Nasional)",
      unitCostPerKm: 2200000000,
    };
  }

  if (hw === "primary" || hw === "primary_link") {
    return {
      authority: "PROVINSI",
      authorityLabel: `Pemerintah Provinsi ${stateName} (Dinas Bina Marga / PUPR)`,
      legalBasis:
        jurisdiction?.legalBasis ||
        `UU No. 2 Tahun 2022 & SK Gubernur ${stateName} tentang Status Ruas Jalan Provinsi`,
      regionalHead: jurisdiction?.leadership?.regionalHead || `Gubernur ${stateName}`,
      agency: jurisdiction?.leadership?.agency || `Dinas PUPR / Bina Marga Provinsi ${stateName}`,
      budgetSource: `APBD Provinsi ${stateName}`,
      unitCostPerKm: 1350000000,
    };
  }

  if (
    hw === "secondary" ||
    hw === "secondary_link" ||
    hw === "tertiary" ||
    hw === "tertiary_link"
  ) {
    const auth = isKotamadya ? "KOTA" : "KABUPATEN";
    const headTitle = isKotamadya ? "Walikota" : "Bupati";
    const cleanRegion = cityOrRegency.replace(/^(Kota|Kabupaten)\s+/i, "");
    return {
      authority: auth,
      authorityLabel: isKotamadya
        ? `Pemerintah Kota ${cleanRegion} (Dinas Bina Marga / PU Kota)`
        : `Pemerintah Kabupaten ${cleanRegion} (Dinas PUPR Kabupaten)`,
      legalBasis: `UU No. 2 Tahun 2022 Pasal 9 & SK ${headTitle} ${cleanRegion} tentang Ruas Jalan ${auth === "KOTA" ? "Kota" : "Kabupaten"}`,
      regionalHead: `${headTitle} ${cleanRegion}`,
      agency: `Dinas Pekerjaan Umum dan Penataan Ruang (PUPR) ${isKotamadya ? "Kota" : "Kabupaten"} ${cleanRegion}`,
      budgetSource: `APBD ${isKotamadya ? "Kota" : "Kabupaten"} ${cleanRegion}`,
      unitCostPerKm: 920000000,
    };
  }

  if (isKotamadya) {
    const cleanCity = cityOrRegency.replace(/^Kota\s+/i, "");
    return {
      authority: "KOTA",
      authorityLabel: `Pemerintah Kota ${cleanCity} (Jalan Lingkungan Perkotaan)`,
      legalBasis: `UU No. 2 Tahun 2022 Pasal 9 & Perwali Kota ${cleanCity}`,
      regionalHead: `Walikota ${cleanCity}`,
      agency: `Dinas Bina Marga / PUPR Kota ${cleanCity}`,
      budgetSource: `APBD Kota ${cleanCity}`,
      unitCostPerKm: 650000000,
    };
  }

  const cleanRegency = cityOrRegency.replace(/^Kabupaten\s+/i, "");
  const desaLabel = villageOrSuburb ? `Desa ${villageOrSuburb}` : `Desa di Kab. ${cleanRegency}`;
  return {
    authority: "DESA",
    authorityLabel: `Pemerintah ${desaLabel} (Kab. ${cleanRegency} — Dana Desa)`,
    legalBasis: "UU No. 2 Tahun 2022 Pasal 9 tentang Jalan Desa & UU No. 6 Tahun 2014 tentang Desa",
    regionalHead: `Kepala ${desaLabel} & Bupati ${cleanRegency}`,
    agency: `TPK ${desaLabel} & Dinas PMD/PUPR Kab. ${cleanRegency}`,
    budgetSource: "Dana Desa (APBN) & APBDes Setempat",
    unitCostPerKm: 320000000,
  };
}

export async function GET(request) {
  try {
    if (isOsmRateLimited(request)) {
      return NextResponse.json(
        { success: false, error: "Batas frekuensi pemindaian peta tercapai. Tunggu sebentar.", roads: [] },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bboxRaw = searchParams.get("bbox") || "";
    const zoom = Number.parseFloat(searchParams.get("zoom") || "12");

    const parts = bboxRaw.split(",").map(Number);
    if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
      return NextResponse.json(
        { success: false, error: "Parameter bbox (south,west,north,east) tidak valid." },
        { status: 400 }
      );
    }

    let [south, west, north, east] = parts;
    if (
      south >= north ||
      west >= east ||
      south < -12.5 ||
      north > 7.5 ||
      west < 94.0 ||
      east > 142.5
    ) {
      return NextResponse.json(
        { success: false, error: "Koordinat berada di luar cakupan wilayah Indonesia.", roads: [] },
        { status: 400 }
      );
    }
    // Static curated dataset already covers regional overview (zoom < 11.8) in 0ms; skip Overpass until zoomed into city/district level
    if (!Number.isFinite(zoom) || zoom < 11.8) {
      return NextResponse.json(
        { success: true, skippedZoom: true, count: 0, roads: [] },
        { headers: { "Cache-Control": "public, s-maxage=300" } }
      );
    }

    const centerLat = (south + north) / 2;
    const centerLng = (west + east) / 2;

    let maxSpan = 0.095;
    let tierKey = "city";
    let overpassBody = "";

    if (zoom >= 13.5) {
      maxSpan = 0.055;
      tierKey = "neighborhood";
    } else {
      maxSpan = 0.095;
      tierKey = "city";
    }

    if (north - south > maxSpan) {
      south = centerLat - maxSpan / 2;
      north = centerLat + maxSpan / 2;
    }
    if (east - west > maxSpan) {
      west = centerLng - maxSpan / 2;
      east = centerLng + maxSpan / 2;
    }

    const gridScale = tierKey === "neighborhood" ? 30 : 16;
    const cacheKey = `${Math.round(centerLat * gridScale)}_${Math.round(centerLng * gridScale)}_${tierKey}`;
    const now = Date.now();
    const cached = VIEWPORT_CACHE.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ ...cached.payload, cached: true });
    }

    const bboxStr = `${south.toFixed(4)},${west.toFixed(4)},${north.toFixed(4)},${east.toFixed(4)}`;

    if (tierKey === "neighborhood") {
      overpassBody = `(way["highway"~"^(trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|unclassified)$"](${bboxStr});way["highway"~"^(residential|living_street)$"]["name"](${bboxStr}););out body geom;`;
    } else {
      overpassBody = `(way["highway"~"^(trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link)$"](${bboxStr});way["highway"="unclassified"]["name"](${bboxStr}););out body geom;`;
    }

    const overpassQuery = `[out:json][timeout:5];${overpassBody}`;

    let scanPromise = IN_FLIGHT_SCANS.get(cacheKey);
    if (!scanPromise) {
      scanPromise = Promise.all([
        fetchNominatimContext(centerLat, centerLng),
        fetchOverpassWithFailover(overpassQuery),
      ]).finally(() => {
        IN_FLIGHT_SCANS.delete(cacheKey);
      });
      IN_FLIGHT_SCANS.set(cacheKey, scanPromise);
    }

    const [nomData, ovpData] = await scanPromise;

    const jurisdiction = detectJurisdictionByCoordinates(centerLat, centerLng, ROAD_SEGMENTS);
    const addr = nomData?.address || {};
    const villageOrSuburb = addr.village || addr.suburb || addr.hamlet || addr.town || "";
    const rawCity = addr.city || "";
    const rawCounty = addr.county || addr.regency || addr.municipality || "";
    const stateName = addr.state || jurisdiction?.provinceName || "Indonesia";
    const cityOrRegency =
      rawCity ||
      rawCounty ||
      (/jakarta/i.test(stateName) ? "DKI Jakarta" : "") ||
      nomData?.name ||
      jurisdiction?.provinceName ||
      "Wilayah Setempat";

    const isKotamadya =
      /jakarta/i.test(stateName) ||
      Boolean(rawCity && !addr.county) ||
      /^kota\s+/i.test(cityOrRegency) ||
      /jakarta|bandung|bogor|depok|bekasi|cimahi|cirebon|sukabumi|tasikmalaya|banjar|tangerang|serang|cilegon|gunungsitoli|medan|binjai|siantar|sibolga|gorontalo|makassar|parepare|palopo|kupang|mataram|bima|semarang|surakarta|tegal|magelang|pekalongan|salatiga|surabaya|malang|kediri|madiun|blitar|pasuruan|probolinggo|mojokerto|batu|yogyakarta|denpasar|pontianak|singkawang|banjarmasin|banjarbaru|samarinda|balikpapan|bontang|tarakan|manado|bitung|tomohon|kotamobagu|palu|kendari|baubau|ambon|tual|ternate|tidore|jayapura|sorong/i.test(
        rawCity || cityOrRegency
      );

    const groups = new Map();
    let unnamedCounter = 0;

    for (const el of ovpData?.elements || []) {
      if (!Array.isArray(el.geometry) || el.geometry.length < 2) continue;
      const hw = el.tags?.highway || "residential";
      const rawName = (el.tags?.name || el.tags?.ref || "").trim();

      const coords = el.geometry.map((pt) => [
        Number(pt.lat.toFixed(5)),
        Number(pt.lon.toFixed(5)),
      ]);

      let segKm = 0;
      for (let i = 1; i < coords.length; i++) {
        segKm += haversineKm(coords[i - 1], coords[i]);
      }

      if (!rawName && segKm < 0.15) continue;

      let bucketTier = "LOCAL";
      if (hw.startsWith("trunk") || hw.startsWith("motorway")) bucketTier = "NAS";
      else if (hw.startsWith("primary")) bucketTier = "PRV";
      else if (hw.startsWith("secondary") || hw.startsWith("tertiary")) bucketTier = "KABKOT";

      let groupKey;
      let displayStreetName;
      if (rawName) {
        groupKey = `${rawName.toLowerCase()}__${bucketTier}`;
        displayStreetName = rawName;
      } else {
        const gridLat = Math.round(coords[0][0] * 25);
        const gridLng = Math.round(coords[0][1] * 25);
        groupKey = `corridor_${bucketTier}_${gridLat}_${gridLng}`;
        if (!groups.has(groupKey)) unnamedCounter += 1;
        const classLabel =
          bucketTier === "NAS"
            ? "Jalan Arteri Nasional"
            : bucketTier === "PRV"
            ? "Jalan Kolektor Provinsi"
            : `Jalan Poros ${cityOrRegency}`;
        displayStreetName = `${classLabel} #${unnamedCounter}`;
      }

      const existing = groups.get(groupKey);
      if (existing) {
        existing.segments.push(coords);
        existing.totalKm += segKm;
      } else {
        groups.set(groupKey, {
          firstId: el.id,
          hw,
          displayStreetName,
          segments: [coords],
          totalKm: segKm,
        });
      }
    }

    const roads = [];
    for (const grp of groups.values()) {
      const stitchedSegs = stitchSegments(grp.segments);
      const lengthKm = Math.max(0.3, Number(grp.totalKm.toFixed(1)));
      const midSeg = stitchedSegs[Math.floor(stitchedSegs.length / 2)];
      const centerPt = midSeg[Math.floor(midSeg.length / 2)];

      const meta = classifyWayAuthority({
        hw: grp.hw,
        isKotamadya,
        cityOrRegency,
        villageOrSuburb,
        stateName,
        jurisdiction,
      });

      const estimatedPagu = Math.max(250000000, Math.round(lengthKm * meta.unitCostPerKm));

      roads.push({
        id: `live-osm-${grp.firstId}`,
        code: `GIS-${meta.authority.slice(0, 3)}-${String(grp.firstId).slice(-5)}`,
        name: `${grp.displayStreetName} (${cityOrRegency})`,
        authority: meta.authority,
        authorityLabel: meta.authorityLabel,
        legalBasis: meta.legalBasis,
        district: [villageOrSuburb, cityOrRegency, stateName].filter(Boolean).join(", "),
        provinceId: jurisdiction?.provinceId || "all",
        provinceName: stateName,
        region: jurisdiction?.provinceId || "all",
        lengthKm,
        pavementType:
          meta.authority === "DESA"
            ? "Jalan Poros Desa / Lingkungan (Vektor GIS Utuh)"
            : `Jaringan Jalan ${meta.authority} (Vektor GIS Utuh)`,
        condition: "TERDATA",
        hazardScore: 45,
        hazardLevel: "SEDANG",
        activeReportsCount: 0,
        overdueReportsCount: 0,
        center: centerPt,
        coordinates: stitchedSegs.length === 1 ? stitchedSegs[0] : stitchedSegs,
        isLiveOsmDetected: true,
        leadership: {
          regionalHead: meta.regionalHead,
          headTitle: meta.authority === "DESA" ? "Kepala Desa & Kepala Daerah" : "Penyelenggara Jalan",
          agency: meta.agency,
          officeAddress: `${cityOrRegency}, ${stateName}`,
        },
        problemDetails: {
          headline: `Kewenangan Terdeteksi Otomatis: ${meta.authorityLabel}`,
          description: `Ruas ${grp.displayStreetName} sepanjang ±${lengthKm} km di ${cityOrRegency}, ${stateName} dipetakan utuh dari jaringan spasial OpenStreetMap dan diklasifikasikan sebagai Jalan ${meta.authority} sesuai UU No. 2 Tahun 2022.`,
          rootCause: "Penentuan status wewenang otomatis berbasis kelas fungsi jalan & batas administrasi daerah.",
          safetyImpact: "Klik ruas ini untuk mengecek instansi penanggung jawab atau langsung mengirim laporan kerusakan.",
        },
        budget: {
          packageId: `EST-GIS-${String(grp.firstId).slice(-6)}`,
          name: `Estimasi Standar Pemeliharaan Berkala ${grp.displayStreetName}`,
          paguRp: estimatedPagu,
          contractValueRp: Math.round(estimatedPagu * 0.95),
          contractor: "Cek RUP / Kontrak Aktif di Portal SiRUP & LPSE Daerah",
          fiscalYear: "2026",
          source: `${meta.budgetSource} (Estimasi Standar Biaya / Sinkronisasi SiRUP)`,
          progressStatus: "TERDATA_GIS",
          progressPct: 75,
          matchConfidence: "ESTIMASI_STANDAR_GIS",
          statusNote:
            "Ruas jalan terpetakan utuh secara geospasial. Rincian paket lelang spesifik ruas dapat dikroscek langsung di portal SiRUP INAPROC Pemda terkait.",
        },
        officialSources: {
          authoritySource: meta.legalBasis,
          budgetSource: `Portal SiRUP INAPROC (${cityOrRegency})`,
          fieldDataSource: "OpenStreetMap Overpass Full Geometry & JagaJalan GIS",
          transparencyUrl: "https://sirup.inaproc.id",
        },
      });
    }

    const payload = {
      success: true,
      areaName: cityOrRegency,
      provinceName: stateName,
      tier: tierKey,
      isKotamadya,
      count: roads.length,
      roads,
    };

    if (VIEWPORT_CACHE.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = VIEWPORT_CACHE.keys().next().value;
      if (oldestKey) VIEWPORT_CACHE.delete(oldestKey);
    }
    VIEWPORT_CACHE.set(cacheKey, { timestamp: now, payload });

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memindai jaringan jalan area aktif.",
        roads: [],
      },
      { status: 200 }
    );
  }
}
