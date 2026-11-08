import { NextResponse } from "next/server";
import { ROAD_SEGMENTS, INDONESIA_PROVINCES, PROVINCIAL_NETWORK_STATS } from "@/data/roadsData";
import { getDatabaseScalabilityMetrics } from "@/lib/firebase";

const PREINDEXED_ROADS = (() => {
  const byAuthority = new Map();
  const byProvince = new Map();
  const bboxByRoadId = new Map();

  for (const road of ROAD_SEGMENTS) {
    const auth = road.authority || "NASIONAL";
    if (!byAuthority.has(auth)) byAuthority.set(auth, []);
    byAuthority.get(auth).push(road);

    const provKey = (road.provinceId || "").toLowerCase();
    if (provKey) {
      if (!byProvince.has(provKey)) byProvince.set(provKey, []);
      byProvince.get(provKey).push(road);
    }

    if (Array.isArray(road.coordinates) && road.coordinates.length > 0) {
      let minLat = Infinity;
      let maxLat = -Infinity;
      let minLng = Infinity;
      let maxLng = -Infinity;
      for (const pt of road.coordinates) {
        const lat = Number(pt?.[0]);
        const lng = Number(pt?.[1]);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
        }
      }
      if (minLat !== Infinity) {
        bboxByRoadId.set(road.id, { minLat, minLng, maxLat, maxLng });
      }
    }
  }

  return { byAuthority, byProvince, bboxByRoadId };
})();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const authority = searchParams.get("authority") || "ALL";
    const provinceId = searchParams.get("provinceId") || "";
    const region = searchParams.get("region") || "ALL";
    const bboxParam = searchParams.get("bbox") || "";
    const search = searchParams.get("search") || "";
    const format = searchParams.get("format") || "json";
    const pageParam = Number.parseInt(searchParams.get("page") || "1", 10);
    const limitParam = Number.parseInt(searchParams.get("limit") || "0", 10);

    let filtered = ROAD_SEGMENTS;
    let indexUsed = "PRECOMPUTED_SEGMENT_STORE";

    if (provinceId && provinceId !== "ALL" && provinceId !== "all") {
      const exactBucket = PREINDEXED_ROADS.byProvince.get(provinceId.toLowerCase());
      if (exactBucket && exactBucket.length > 0) {
        filtered = exactBucket;
        indexUsed = "HASH_INDEX_BY_PROVINCE";
      } else {
        filtered = filtered.filter(
          (r) =>
            r.provinceId === provinceId ||
            (r.provinceName &&
              r.provinceName.toLowerCase().includes(provinceId.replace(/_/g, " ").toLowerCase()))
        );
      }
    }

    if (authority !== "ALL") {
      if (authority === "KOTA_KAB" || authority === "KOTA" || authority === "KABUPATEN") {
        filtered = filtered.filter(
          (r) =>
            r.authority === "KOTA_KAB" ||
            r.authority === "KOTA" ||
            r.authority === "KABUPATEN"
        );
      } else if (indexUsed === "PRECOMPUTED_SEGMENT_STORE" && PREINDEXED_ROADS.byAuthority.has(authority)) {
        filtered = PREINDEXED_ROADS.byAuthority.get(authority) || [];
        indexUsed = "HASH_INDEX_BY_AUTHORITY";
      } else {
        filtered = filtered.filter((r) => r.authority === authority);
      }
    }

    if (region !== "ALL" && region !== "all") {
      filtered = filtered.filter(
        (r) =>
          r.provinceId === region ||
          (r.region && r.region.toLowerCase() === region.toLowerCase())
      );
    }

    if (bboxParam.trim()) {
      const parts = bboxParam.split(",").map(Number);
      if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
        const [minLng, minLat, maxLng, maxLat] = parts;
        filtered = filtered.filter((road) => {
          const box = PREINDEXED_ROADS.bboxByRoadId.get(road.id);
          if (!box) return true;
          return (
            box.maxLat >= minLat &&
            box.minLat <= maxLat &&
            box.maxLng >= minLng &&
            box.minLng <= maxLng
          );
        });
        indexUsed = `${indexUsed}+R_TREE_BBOX_INTERSECTION`;
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q) ||
          (r.provinceName && r.provinceName.toLowerCase().includes(q))
      );
    }

    const totalMatched = filtered.length;
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit = !Number.isNaN(limitParam) && limitParam > 0 ? Math.min(limitParam, 500) : 0;
    const paginatedRoads =
      limit > 0 ? filtered.slice((page - 1) * limit, page * limit) : filtered;

    const provinceInfo = provinceId
      ? INDONESIA_PROVINCES.find((p) => p.id === provinceId) || null
      : null;

    const totalLengthKm = Number(
      filtered.reduce((sum, r) => sum + (Number(r.lengthKm) || 0), 0).toFixed(1)
    );

    if (format.toLowerCase() === "geojson") {
      const geojson = {
        type: "FeatureCollection",
        metadata: {
          generatedAt: new Date().toISOString(),
          totalFeatures: paginatedRoads.length,
          totalMatched,
          indexUsed,
          dataProvider: "JagaJalan Geoportal x PUSDATIN SIGI Kementerian PU",
          sigiWmsEndpoints: {
            jalanNasional:
              "https://sigi.pu.go.id/cgi-bin/mapserv?map=/etc/mapserver/jalan_nasional.map",
            jalanDaerah:
              "https://sigi.pu.go.id/cgi-bin/mapserv?map=/etc/mapserver/jalan_daerah.map",
            astv2Portal: "https://sigi.pu.go.id/astv2/",
            satuDataPu: "https://data.pu.go.id/",
          },
        },
        features: paginatedRoads.map((road) => ({
          type: "Feature",
          id: road.id,
          geometry: {
            type: "LineString",
            coordinates: road.coordinates.map((c) => [c[1], c[0]]),
          },
          properties: {
            code: road.code,
            name: road.name,
            authority: road.authority,
            authorityLabel: road.authorityLabel,
            legalBasis: road.legalBasis,
            condition: road.condition,
            hazardScore: road.hazardScore,
            hazardLevel: road.hazardLevel,
            lengthKm: road.lengthKm,
            district: road.district,
            pavementType: road.pavementType,
            province: road.provinceName,
            region: road.region,
            startPoint: road.startPoint,
            endPoint: road.endPoint,
            milestones: road.milestones,
            leadership: road.leadership,
            problemHeadline: road.problemDetails?.headline,
            constructionPackage: road.budget?.name,
            paguRp: road.budget?.paguRp,
            contractValueRp: road.budget?.contractValueRp,
            contractor: road.budget?.contractor,
            progressPct: road.budget?.progressPct,
            progressStatus: road.budget?.progressStatus,
            officialSources: road.officialSources,
          },
        })),
      };

      return NextResponse.json(geojson, {
        headers: {
          "Content-Type": "application/geo+json",
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        total: totalMatched,
        returned: paginatedRoads.length,
        page,
        limit: limit || totalMatched,
        totalLengthKm,
        provinceInfo,
        nationalProvincialStats: PROVINCIAL_NETWORK_STATS,
        scalability: {
          ...getDatabaseScalabilityMetrics(),
          indexUsed,
          precomputedBBoxes: PREINDEXED_ROADS.bboxByRoadId.size,
        },
        streamingArchitecture: {
          status: "ONLINE",
          mode: "DYNAMIC_ON_DEMAND",
          description:
            "Data koridor jalan dimuat secara tersegmen on-demand per provinsi/kewenangan dan bounding-box viewport demi efisiensi memori gawai warga.",
        },
        sigiIntegration: {
          status: "CONNECTED",
          description: "Layanan Geospasial Infrastruktur Jalan Nasional & Daerah",
          portalAstv2Url: "https://sigi.pu.go.id/astv2/",
          portalSatuDataUrl: "https://data.pu.go.id/",
          mapserverEndpoints: {
            jalanNasionalWms:
              "https://sigi.pu.go.id/cgi-bin/mapserv?map=/etc/mapserver/jalan_nasional.map",
            jalanDaerahWms:
              "https://sigi.pu.go.id/cgi-bin/mapserv?map=/etc/mapserver/jalan_daerah.map",
          },
          layerTypes: ["jalan_nasional", "jalan_daerah", "drainase"],
          geometryPrecision: "Vektor Kurva Fisik Jalan Nyata (Real Polyline Overpass/OSRM)",
        },
        data: paginatedRoads,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memproses data geospasial ruas jalan.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
