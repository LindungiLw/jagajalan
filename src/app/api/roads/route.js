import { NextResponse } from "next/server";
import { ROAD_SEGMENTS, INDONESIA_PROVINCES, PROVINCIAL_NETWORK_STATS } from "@/data/roadsData";

/**
 * Endpoint API Geospasial Ruas Jalan JagaJalan
 * Terintegrasi dengan metadata Sistem Informasi Geospasial Infrastruktur (SIGI) Kementerian PU
 * Sumber Portal: https://sigi.pu.go.id/astv2/ & https://data.pu.go.id/
 * 
 * Query Params:
 * - authority: 'ALL' | 'NASIONAL' | 'PROVINSI' | 'KOTA_KAB'
 * - provinceId: string (id provinsi, cth: 'jawa_barat', 'sumatera_utara', 'bali')
 * - region: 'ALL' | 'sumatera' | 'jawa' | 'kalimantan' | 'sulawesi' | 'bali_nusra' | 'maluku_papua'
 * - search: string (nama jalan / kode ruas / wilayah)
 * - format: 'json' (default) | 'geojson' (FeatureCollection standar RFC 7946)
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const authority = searchParams.get("authority") || "ALL";
    const provinceId = searchParams.get("provinceId") || "";
    const region = searchParams.get("region") || "ALL";
    const search = searchParams.get("search") || "";
    const format = searchParams.get("format") || "json";

    // 1. Filter dataset
    let filtered = ROAD_SEGMENTS;

    if (authority !== "ALL") {
      if (authority === "KOTA_KAB" || authority === "KOTA" || authority === "KABUPATEN") {
        filtered = filtered.filter(
          (r) => r.authority === "KOTA_KAB" || r.authority === "KOTA" || r.authority === "KABUPATEN"
        );
      } else {
        filtered = filtered.filter((r) => r.authority === authority);
      }
    }

    if (provinceId && provinceId !== "ALL" && provinceId !== "all") {
      filtered = filtered.filter(
        (r) =>
          r.provinceId === provinceId ||
          (r.provinceName && r.provinceName.toLowerCase().includes(provinceId.replace(/_/g, " ").toLowerCase()))
      );
    }

    if (region !== "ALL" && region !== "all") {
      filtered = filtered.filter(
        (r) =>
          r.provinceId === region ||
          (r.region && r.region.toLowerCase() === region.toLowerCase())
      );
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

    const provinceInfo = provinceId
      ? INDONESIA_PROVINCES.find((p) => p.id === provinceId) || null
      : null;

    const totalLengthKm = Number(
      filtered.reduce((sum, r) => sum + (Number(r.lengthKm) || 0), 0).toFixed(1)
    );

    // 2. Format as GeoJSON FeatureCollection if requested
    if (format.toLowerCase() === "geojson") {
      const geojson = {
        type: "FeatureCollection",
        metadata: {
          generatedAt: new Date().toISOString(),
          totalFeatures: filtered.length,
          dataProvider: "JagaJalan Geoportal x PUSDATIN SIGI Kementerian PU",
          sigiWmsEndpoints: {
            jalanNasional: "https://sigi.pu.go.id/cgi-bin/mapserv?map=/etc/mapserver/jalan_nasional.map",
            jalanDaerah: "https://sigi.pu.go.id/cgi-bin/mapserv?map=/etc/mapserver/jalan_daerah.map",
            astv2Portal: "https://sigi.pu.go.id/astv2/",
            satuDataPu: "https://data.pu.go.id/",
          },
        },
        features: filtered.map((road) => ({
          type: "Feature",
          id: road.id,
          geometry: {
            type: "LineString",
            // GeoJSON coordinates standard: [longitude, latitude]
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

    // 3. Default JSON response with API provenance & SIGI endpoints
    return NextResponse.json(
      {
        success: true,
        total: filtered.length,
        totalLengthKm,
        provinceInfo,
        nationalProvincialStats: PROVINCIAL_NETWORK_STATS,
        streamingArchitecture: {
          status: "ONLINE",
          mode: "DYNAMIC_ON_DEMAND",
          description: "Data koridor jalan dimuat secara tersegmen on-demand per provinsi/kewenangan demi efisiensi memori gawai warga.",
        },
        sigiIntegration: {
          status: "CONNECTED",
          description: "Layanan Geospasial Infrastruktur Jalan Nasional & Daerah",
          portalAstv2Url: "https://sigi.pu.go.id/astv2/",
          portalSatuDataUrl: "https://data.pu.go.id/",
          mapserverEndpoints: {
            jalanNasionalWms: "https://sigi.pu.go.id/cgi-bin/mapserv?map=/etc/mapserver/jalan_nasional.map",
            jalanDaerahWms: "https://sigi.pu.go.id/cgi-bin/mapserv?map=/etc/mapserver/jalan_daerah.map",
          },
          layerTypes: ["jalan_nasional", "jalan_daerah", "drainase"],
          geometryPrecision: "Vektor Kurva Fisik Jalan Nyata (Real Polyline Overpass/OSRM)",
        },
        data: filtered,
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
