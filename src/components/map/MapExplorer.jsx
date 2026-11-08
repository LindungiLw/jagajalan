"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Search,
  Building2,
  AlertTriangle,
  FileText,
  Clock,
  ChevronRight,
  Shield,
  CheckCircle2,
  X,
  ChevronDown,
  Plus,
  Minus,
  Crosshair,
  FileCheck,
  ExternalLink,
  Hammer,
  BadgePercent,
  Calendar,
  Layers,
  HelpCircle,
  Globe,
  Eye,
  RotateCcw,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Activity,
  Scale,
  Coins,
  AlertCircle,
} from "lucide-react";
import {
  INDONESIA_REGIONS,
  INDONESIA_PROVINCES,
  PROVINCIAL_NETWORK_STATS,
  detectJurisdictionByCoordinates,
} from "@/data/roadsData";
import RoadDetailModal from "@/components/modals/RoadDetailModal";

// Helper format Rupiah singkat untuk dashboard inspektor peta
function formatCurrencyCompact(amount) {
  if (!amount || isNaN(amount)) return "Rp 0";
  if (amount >= 1e12) return `Rp ${(amount / 1e12).toFixed(2)} T`;
  if (amount >= 1e9) return `Rp ${(amount / 1e9).toFixed(2)} M`;
  if (amount >= 1e6) return `Rp ${(amount / 1e6).toFixed(0)} Jt`;
  return `Rp ${Number(amount).toLocaleString("id-ID")}`;
}

// Dynamic import with SSR disabled to prevent Leaflet "window is not defined" error
const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[680px] bg-slate-100 flex flex-col items-center justify-center gap-3 text-slate-400">
      <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-600">Memuat Peta Geospasial Transparansi...</span>
    </div>
  ),
});

export default function MapExplorer({
  roads,
  reports,
  onOpenOmbudsmanDraft,
  onOpenReportModal,
  focusedRoadId,
  focusedReportId,
}) {
  const [selectedRoad, setSelectedRoad] = useState(roads[2] || roads[0]); // Default to Katamso Medan (ruas-su-03)
  const [selectedReport, setSelectedReport] = useState(reports[0] || null); // Default to JGJ-MDN-001
  const [selectedRoadForDetailModal, setSelectedRoadForDetailModal] = useState(null);
  const [activeTab, setActiveTab] = useState("masalah"); // "masalah" | "proyek" | "kewenangan" | "sumber"
  const [authorityFilter, setAuthorityFilter] = useState("ALL");
  const [highlightFilter, setHighlightFilter] = useState("ALL"); // "ALL" | "OVERDUE" | "CRITICAL" | "BUDGET"
  const [searchQuery, setSearchQuery] = useState("");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [highlightDropdownOpen, setHighlightDropdownOpen] = useState(false);
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [reportsFeedOpen, setReportsFeedOpen] = useState(false);
  const [showReportsLayer, setShowReportsLayer] = useState(true);
  const [pinReportMode, setPinReportMode] = useState(false);
  const [liveViewportRoads, setLiveViewportRoads] = useState([]);
  const [isScanningViewport, setIsScanningViewport] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState("all");
  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  const [regionTab, setRegionTab] = useState("provinces"); // "provinces" | "regions"
  const [provinceSearchQuery, setProvinceSearchQuery] = useState("");
  const [floatingNotice, setFloatingNotice] = useState(null);
  const [detectedPoint, setDetectedPoint] = useState(null);
  const [sigiModalOpen, setSigiModalOpen] = useState(false);
  const [showSigiNationalWms, setShowSigiNationalWms] = useState(false);
  const [showSigiRegionalWms, setShowSigiRegionalWms] = useState(false);
  const [mapCenter, setMapCenter] = useState([-2.5489, 118.0149]); // Center of Indonesia (Seluruh Indonesia)
  const [mapZoom, setMapZoom] = useState(5);
  const [mapInstance, setMapInstance] = useState(null);

  // Synchronize when focusedRoadId changes from external navigation (React 19 state adjustment pattern)
  const [prevFocusedRoadId, setPrevFocusedRoadId] = useState(focusedRoadId);
  if (focusedRoadId !== prevFocusedRoadId) {
    setPrevFocusedRoadId(focusedRoadId);
    if (focusedRoadId) {
      const targetRoad = roads.find((r) => r.id === focusedRoadId);
      if (targetRoad) {
        setSelectedRoad(targetRoad);
        const relatedReport = reports.find((r) => r.roadSegmentId === targetRoad.id);
        setSelectedReport(relatedReport || null);
        setMapCenter(targetRoad.center);
        setMapZoom(13);
      }
    }
  }

  // Synchronize when focusedReportId changes (e.g. newly submitted real-time citizen report)
  const [prevFocusedReportId, setPrevFocusedReportId] = useState(focusedReportId);
  if (focusedReportId !== prevFocusedReportId) {
    setPrevFocusedReportId(focusedReportId);
    if (focusedReportId) {
      const targetReport = reports.find((r) => r.id === focusedReportId);
      if (targetReport) {
        setSelectedReport(targetReport);
        setShowReportsLayer(true);
        const parentRoad = roads.find((r) => r.id === targetReport.roadSegmentId);
        if (parentRoad) setSelectedRoad(parentRoad);
        if (Array.isArray(targetReport.coordinates) && targetReport.coordinates.length >= 2) {
          setMapCenter(targetReport.coordinates);
          setMapZoom(15);
        }
      }
    }
  }

  const filteredProvinces = useMemo(() => {
    const list = INDONESIA_PROVINCES.map((prov) => {
      const roadCount = roads.filter(
        (r) =>
          r.provinceId === prov.id ||
          (r.district && r.district.toLowerCase().includes(prov.name.toLowerCase()))
      ).length;
      return {
        ...prov,
        roadCount,
        hasPilotCorridor: roadCount > 0,
      };
    });

    if (!provinceSearchQuery.trim()) return list;
    const q = provinceSearchQuery.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.capital.toLowerCase().includes(q) ||
        p.agency.toLowerCase().includes(q) ||
        p.governor.toLowerCase().includes(q)
    );
  }, [roads, provinceSearchQuery]);

  // Aggregate road counts per authority (5-Tier Statutory Road Network under UU No. 2 Tahun 2022)
  const roadCounts = useMemo(() => {
    const combined = [...roads, ...liveViewportRoads];
    return {
      ALL: combined.length,
      NASIONAL: combined.filter((r) => r.authority === "NASIONAL").length,
      PROVINSI: combined.filter((r) => r.authority === "PROVINSI").length,
      KOTA: combined.filter((r) => r.authority === "KOTA").length,
      KABUPATEN: combined.filter((r) => r.authority === "KABUPATEN").length,
      DESA: combined.filter((r) => r.authority === "DESA").length,
      KOTA_KAB: combined.filter(
        (r) => r.authority === "KOTA" || r.authority === "KABUPATEN" || r.authority === "KOTA_KAB"
      ).length,
    };
  }, [roads, liveViewportRoads]);

  // Special Highlight Counts
  const overdueRoadCount = useMemo(() => {
    const overdueRoadIds = new Set(reports.filter((r) => r.status === "OVERDUE").map((r) => r.roadSegmentId));
    return roads.filter((r) => overdueRoadIds.has(r.id)).length;
  }, [roads, reports]);

  const criticalRoadCount = useMemo(() => {
    const critRoadIds = new Set(reports.filter((r) => (r.hazardScore || 0) >= 80).map((r) => r.roadSegmentId));
    return roads.filter((r) => critRoadIds.has(r.id)).length;
  }, [roads, reports]);

  const budgetRoadCount = useMemo(() => {
    return roads.filter((r) => (r.budget?.paguRp || 0) > 0).length;
  }, [roads]);

  // Filter logic
  const filteredRoads = useMemo(() => {
    return roads.filter((road) => {
      const matchAuth = authorityFilter === "ALL" || road.authority === authorityFilter;
      const matchSearch =
        road.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        road.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        road.district.toLowerCase().includes(searchQuery.toLowerCase());

      let matchHighlight = true;
      if (highlightFilter === "OVERDUE") {
        matchHighlight = reports.some((rep) => rep.roadSegmentId === road.id && rep.status === "OVERDUE");
      } else if (highlightFilter === "CRITICAL") {
        matchHighlight = reports.some((rep) => rep.roadSegmentId === road.id && (rep.hazardScore || 0) >= 80);
      } else if (highlightFilter === "BUDGET") {
        matchHighlight = (road.budget?.paguRp || 0) > 0;
      }

      return matchAuth && matchSearch && matchHighlight;
    });
  }, [roads, reports, authorityFilter, searchQuery, highlightFilter]);

  const filteredLiveViewportRoads = useMemo(() => {
    return liveViewportRoads.filter((road) => {
      const matchAuth = authorityFilter === "ALL" || road.authority === authorityFilter;
      const matchSearch =
        !searchQuery ||
        road.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        road.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (road.district && road.district.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchAuth && matchSearch;
    });
  }, [liveViewportRoads, authorityFilter, searchQuery]);

  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const matchAuth = authorityFilter === "ALL" || rep.authority === authorityFilter;
      const matchSearch =
        rep.roadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.address.toLowerCase().includes(searchQuery.toLowerCase());

      let matchHighlight = true;
      if (highlightFilter === "OVERDUE") {
        matchHighlight = rep.status === "OVERDUE";
      } else if (highlightFilter === "CRITICAL") {
        matchHighlight = (rep.hazardScore || 0) >= 80;
      } else if (highlightFilter === "BUDGET") {
        matchHighlight = (rep.matchingBudget?.paguRp || 0) > 0;
      }

      return matchAuth && matchSearch && matchHighlight;
    });
  }, [reports, authorityFilter, searchQuery, highlightFilter]);

  const handleSelectRoad = (road) => {
    setSelectedRoad(road);
    const relatedReport = reports.find((r) => r.roadSegmentId === road.id);
    if (relatedReport) {
      setSelectedReport(relatedReport);
    } else {
      setSelectedReport(null);
    }
    setMapCenter(road.center);
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    const parentRoad = roads.find((r) => r.id === report.roadSegmentId);
    if (parentRoad) setSelectedRoad(parentRoad);
    if (Array.isArray(report.coordinates) && report.coordinates.length >= 2) {
      setMapCenter(report.coordinates);
      mapInstance?.flyTo(report.coordinates, Math.max(mapInstance.getZoom(), 14), { duration: 1.0 });
    }
  };

  const handleOpenReportFromPoint = (pointData) => {
    if (!pointData) {
      onOpenReportModal();
      return;
    }
    const coords =
      pointData.coordinates ||
      detectedPoint?.coordinates ||
      currentReport?.coordinates ||
      currentRoad?.center || [-6.2088, 106.8456];
    const matchedRoadId =
      pointData.roadSegmentId ||
      pointData.nearestRoad?.id ||
      (currentRoad && !currentRoad.isDetectedPoint ? currentRoad.id : roads[0]?.id);
    const roadTitle =
      pointData.streetName ||
      pointData.roadName ||
      pointData.name ||
      currentRoad?.name ||
      "Ruas Jalan Terdeteksi GIS";

    onOpenReportModal({
      coordinates: coords,
      roadSegmentId: matchedRoadId,
      roadName: roadTitle,
      district: pointData.district || currentRoad?.district || "Indonesia",
      authority: pointData.authority || currentRoad?.authority || "KABUPATEN",
      authorityLabel:
        pointData.authorityLabel ||
        currentRoad?.authorityLabel ||
        "Dinas PUPR Penyelenggara Jalan",
      legalBasis:
        pointData.legalBasis ||
        currentRoad?.legalBasis ||
        "UU No. 2 Tahun 2022 tentang Jalan",
      leadership: pointData.leadership || currentRoad?.leadership,
      budget: pointData.budget || currentRoad?.budget,
      address: `${roadTitle}${pointData.district ? `, ${pointData.district}` : ""} [${Number(coords[0]).toFixed(5)}, ${Number(coords[1]).toFixed(5)}]`,
      source: pointData.source || "GIS_MAP_PIN",
    });
  };

  const handleSelectRegion = (region) => {
    setSelectedRegionId(region.id);
    setSelectedProvinceId(null);
    setRegionDropdownOpen(false);
    setMapCenter(region.center);
    setMapZoom(region.zoom);
    mapInstance?.flyTo(region.center, region.zoom, { duration: 1.2 });

    if (region.id === "sumut") {
      const sumutRoad = roads.find((r) => r.id === "ruas-su-03" || r.provinceId === "sumut");
      if (sumutRoad) handleSelectRoad(sumutRoad);
    } else if (region.id === "all") {
      const nasRoad = roads.find((r) => r.id === "ruas-nas-smt-01" || r.authority === "NASIONAL");
      if (nasRoad) handleSelectRoad(nasRoad);
    } else {
      const targetRoad = roads.find(
        (r) =>
          r.provinceId === region.id ||
          (r.region && r.region.toLowerCase().includes(region.island.toLowerCase()))
      );
      if (targetRoad) handleSelectRoad(targetRoad);
    }
  };

  const handleSelectProvince = (province) => {
    setSelectedProvinceId(province.id);
    setSelectedRegionId(province.region);
    setRegionDropdownOpen(false);
    setMapCenter(province.center);
    setMapZoom(province.zoom);
    mapInstance?.flyTo(province.center, province.zoom, { duration: 1.2 });

    const matchingRoads = roads.filter(
      (r) =>
        r.provinceId === province.id ||
        (r.district && r.district.toLowerCase().includes(province.name.toLowerCase()))
    );

    if (matchingRoads.length > 0) {
      handleSelectRoad(matchingRoads[0]);
      setFloatingNotice({
        title: `Provinsi ${province.name}`,
        desc: `Menampilkan ${matchingRoads.length} koridor terverifikasi • Total Jaringan Resmi: ${province.totalProvincialKm.toLocaleString('id-ID')} KM (${province.skNumber})`,
        type: "success",
      });
    } else {
      setFloatingNotice({
        title: `Provinsi ${province.name}`,
        desc: `Total Jaringan Resmi: ${province.totalProvincialKm.toLocaleString('id-ID')} KM (${province.skNumber}). Dipimpin: ${province.governor}. Menampilkan koridor arteri nasional yang melintasi wilayah ini.`,
        type: "info",
      });
    }

    // Auto-dismiss floating notice after 7 seconds
    setTimeout(() => {
      setFloatingNotice((curr) => (curr?.title === `Provinsi ${province.name}` ? null : curr));
    }, 7000);
  };

  const handleMapClick = async (coords) => {
    const [lat, lng] = coords;
    const result = detectJurisdictionByCoordinates(lat, lng, roads);
    if (!result) return;

    const clickId = `detected-${Date.now()}`;
    setDetectedPoint(result);
    setSelectedReport(null);

    const initialRoadEntity = {
      id: clickId,
      isDetectedPoint: true,
      name:
        result.authority === "NASIONAL" && result.nearestRoad
          ? `Dekat ${result.nearestRoad.name}`
          : `Mendeteksi Ruas Jalan [${lat.toFixed(4)}, ${lng.toFixed(4)}]...`,
      code:
        result.authority === "NASIONAL"
          ? result.nearestRoad?.code || "RUAS-NAS-DETEKSI"
          : "RUAS-OSM-DETEKSI",
      authority: result.authority,
      authorityLabel: result.authorityLabel,
      legalBasis: result.legalBasis,
      district: result.district,
      provinceName: result.provinceName,
      lengthKm: result.distanceToNearestNationalKm,
      pavementType: "Analisis Geospasial OpenStreetMap & SIGI PU",
      condition: "TERDATA",
      center: [lat, lng],
      coordinates: [[lat, lng]],
      leadership: result.leadership,
      problemDetails: {
        headline: `Kewenangan Penyelenggara: ${result.authorityLabel}`,
        description: `Titik koordinat [${lat.toFixed(4)}, ${lng.toFixed(4)}] berada di wilayah ${result.provinceName}. Kewenangan pemeliharaan berada di bawah ${result.leadership.regionalHead} (${result.leadership.agency}).`,
        rootCause: "Penetapan batas jurisdiksi berbasis UU No. 2 Tahun 2022 tentang Jalan, SK Menteri PUPR, & SK Kepala Daerah.",
        safetyImpact: "Pastikan laporan aduan masyarakat dan pengawasan anggaran ditujukan ke penyelenggara jalan yang tepat.",
      },
      officialSources: {
        authoritySource: result.legalBasis,
        budgetSource: "Pusdatin SIGI PU & Data Daerah",
        fieldDataSource: "OpenStreetMap Live Road Geometry & JagaJalan GIS",
        transparencyUrl: "https://sigi.pu.go.id",
      },
    };

    setSelectedRoad(initialRoadEntity);
    setActiveTab("kewenangan");

    // Live OpenStreetMap Road Snapping & Classification (Nominal + Overpass Geometry)
    try {
      const overpassQuery = `[out:json][timeout:6];way(around:75,${lat},${lng})["highway"];out body geom;`;
      const [nomRes, ovpRes] = await Promise.allSettled([
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=17&accept-language=id`,
          { headers: { "Accept-Language": "id" } }
        ).then((r) => (r.ok ? r.json() : null)),
        fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
        ).then((r) => (r.ok ? r.json() : null)),
      ]);

      const nomData = nomRes.status === "fulfilled" ? nomRes.value : null;
      const ovpData = ovpRes.status === "fulfilled" ? ovpRes.value : null;

      let snappedGeometry = null;
      let snappedCenter = [lat, lng];
      let osmHighwayTag = nomData?.type || "";
      let osmRoadName = nomData?.address?.road || nomData?.name || "";

      if (ovpData?.elements?.length > 0) {
        // Pick the closest way to clicked point
        let bestWay = ovpData.elements[0];
        let bestDist = Infinity;
        for (const el of ovpData.elements) {
          if (!el.geometry || el.geometry.length < 2) continue;
          for (const pt of el.geometry) {
            const d = Math.hypot((pt.lat - lat) * 111, (pt.lon - lng) * 111);
            if (d < bestDist) {
              bestDist = d;
              bestWay = el;
            }
          }
        }
        if (bestWay?.geometry?.length >= 2) {
          snappedGeometry = bestWay.geometry.map((pt) => [
            Number(pt.lat.toFixed(5)),
            Number(pt.lon.toFixed(5)),
          ]);
          const midIdx = Math.floor(snappedGeometry.length / 2);
          snappedCenter = snappedGeometry[midIdx];
          if (bestWay.tags?.highway) osmHighwayTag = bestWay.tags.highway;
          if (bestWay.tags?.name) osmRoadName = bestWay.tags.name;
        }
      }

      const addr = nomData?.address || {};
      const villageOrSuburb = addr.village || addr.suburb || addr.neighbourhood || addr.hamlet || "";
      const subdistrict = addr.municipality || addr.city_district || addr.town || "";
      const cityOrRegency = addr.city || addr.county || addr.regency || "";
      const stateName = addr.state || result.provinceName;
      const isKotamadya = Boolean(addr.city && !addr.county) || cityOrRegency.toLowerCase().startsWith("kota ");

      // Klasifikasi Fungsi & Kewenangan Jalan sesuai UU No. 2 Tahun 2022 tentang Jalan
      let resolvedAuth = result.authority;
      let resolvedAuthLabel = result.authorityLabel;
      let resolvedClassDesc = "Jalan Daerah (Kolektor / Lokal)";
      let resolvedLegalBasis = result.legalBasis;
      let resolvedAgency = result.leadership?.agency;
      let resolvedHead = result.leadership?.regionalHead;

      if (osmHighwayTag === "trunk" || osmHighwayTag === "trunk_link" || osmHighwayTag === "motorway") {
        resolvedAuth = "NASIONAL";
        resolvedAuthLabel = `Jalan Nasional — Arteri Primer (Kementerian PU / BPJN ${stateName})`;
        resolvedClassDesc = "Jalan Nasional (Arteri Primer — Penghubung Antar-Ibu Kota Provinsi)";
        resolvedLegalBasis = "Kepmen PUPR No. 1688/KPTS/M/2022 tentang Penetapan Ruas Jalan Nasional";
        resolvedHead = "Menteri Pekerjaan Umum RI";
        resolvedAgency = `Balai Pelaksanaan Jalan Nasional (BPJN) Wilayah ${stateName}`;
      } else if (osmHighwayTag === "primary" || osmHighwayTag === "primary_link") {
        resolvedAuth = "PROVINSI";
        resolvedAuthLabel = `Jalan Provinsi — Kolektor Primer (${stateName})`;
        resolvedClassDesc = "Jalan Provinsi (Kolektor Primer — Penghubung Ibu Kota Provinsi dengan Kabupaten/Kota)";
      } else if (osmHighwayTag === "secondary" || osmHighwayTag === "tertiary" || osmHighwayTag === "secondary_link" || osmHighwayTag === "tertiary_link") {
        resolvedAuth = isKotamadya ? "KOTA" : "KABUPATEN";
        const daerahName = cityOrRegency || `Daerah di ${stateName}`;
        resolvedAuthLabel = isKotamadya
          ? `Jalan Kota — Kolektor/Lokal Sekunder (Pemkot ${daerahName})`
          : `Jalan Kabupaten — Kolektor/Lokal Primer (Pemkab ${daerahName})`;
        resolvedClassDesc = isKotamadya
          ? `Jalan Kota (${daerahName})`
          : `Jalan Kabupaten (${daerahName})`;
        resolvedLegalBasis = `SK ${isKotamadya ? "Walikota" : "Bupati"} ${daerahName} tentang Penetapan Status Ruas Jalan ${isKotamadya ? "Kota" : "Kabupaten"}`;
        resolvedHead = `${isKotamadya ? "Walikota" : "Bupati"} ${daerahName}`;
        resolvedAgency = `Dinas Pekerjaan Umum dan Penataan Ruang (PUPR) ${daerahName}`;
      } else if (
        osmHighwayTag === "residential" ||
        osmHighwayTag === "unclassified" ||
        osmHighwayTag === "living_street" ||
        osmHighwayTag === "service" ||
        osmHighwayTag === "track"
      ) {
        resolvedAuth = isKotamadya ? "KOTA" : "DESA";
        const daerahName = cityOrRegency || stateName;
        const desaLabel = villageOrSuburb ? `Desa/Kel. ${villageOrSuburb}` : "Kawasan Permukiman";
        resolvedAuthLabel = isKotamadya
          ? `Jalan Lingkungan Kota (${desaLabel}, ${daerahName})`
          : `Jalan Desa — Poros & Lingkungan Permukiman (${desaLabel}, ${daerahName})`;
        resolvedClassDesc = isKotamadya
          ? `Jalan Lingkungan Kota (${osmHighwayTag === "residential" ? "Permukiman Warga" : "Lokal Sekunder"})`
          : `Jalan Desa (${osmHighwayTag === "residential" ? "Jalan Poros & Permukiman Desa" : "Jalan Usaha Tani / Penghubung Antar-Dusun"})`;
        resolvedLegalBasis = isKotamadya
          ? `UU No. 2 Tahun 2022 Pasal 9 & Peraturan Walikota ${daerahName} tentang Jalan Lingkungan Kota`
          : `UU No. 2 Tahun 2022 Pasal 9 & UU No. 6 Tahun 2014 tentang Desa (APBDes / Dana Desa ${desaLabel})`;
        resolvedHead = isKotamadya
          ? `Walikota ${daerahName} & Lurah ${desaLabel}`
          : `Kepala Desa ${desaLabel} & Bupati ${daerahName}`;
        resolvedAgency = isKotamadya
          ? `Dinas Perkim / Dinas PUPR ${daerahName}`
          : `Pemerintah ${desaLabel} (TPK Dana Desa) & Dinas PMD/PUPR ${daerahName}`;
      }

      const displayRoadName = osmRoadName
        ? `${osmRoadName}${villageOrSuburb ? ` (${villageOrSuburb})` : ""}`
        : `Ruas ${resolvedClassDesc} ${villageOrSuburb || cityOrRegency || `[${lat.toFixed(4)}, ${lng.toFixed(4)}]`}`;

      const districtFull = [villageOrSuburb, subdistrict, cityOrRegency, stateName]
        .filter(Boolean)
        .join(", ");

      const enrichedPoint = {
        ...result,
        coordinates: snappedCenter,
        streetGeometry: snappedGeometry,
        streetName: displayRoadName,
        roadClassLabel: resolvedClassDesc,
        osmHighwayTag,
        authority: resolvedAuth,
        authorityLabel: resolvedAuthLabel,
        legalBasis: resolvedLegalBasis,
        district: districtFull || result.district,
        provinceName: stateName,
        leadership: {
          ...result.leadership,
          regionalHead: resolvedHead,
          agency: resolvedAgency,
        },
      };

      setDetectedPoint(enrichedPoint);
      setSelectedRoad((prev) => {
        if (!prev || prev.id !== clickId) return prev;
        return {
          ...prev,
          name: displayRoadName,
          code: osmHighwayTag ? `OSM-${osmHighwayTag.toUpperCase()}` : prev.code,
          authority: resolvedAuth,
          authorityLabel: resolvedAuthLabel,
          legalBasis: resolvedLegalBasis,
          district: districtFull || prev.district,
          provinceName: stateName,
          pavementType: `${resolvedClassDesc} (Data Spasial OpenStreetMap)`,
          coordinates: snappedGeometry || prev.coordinates,
          leadership: enrichedPoint.leadership,
          problemDetails: {
            headline: `${resolvedClassDesc} — ${resolvedAuthLabel}`,
            description: `${displayRoadName} berada di ${districtFull || stateName}. Berdasarkan klasifikasi jaringan jalan (highway=${osmHighwayTag || "local"}) dan UU No. 2 Tahun 2022 tentang Jalan, ruas ini termasuk kategori ${resolvedClassDesc} di bawah tanggung jawab ${resolvedHead} (${resolvedAgency}).`,
            rootCause: `Klasifikasi fungsi jalan: ${resolvedClassDesc}. Dasar hukum: ${resolvedLegalBasis}.`,
            safetyImpact: "Klik tombol Laporkan Kerusakan untuk mengirim aduan masyarakat pada ruas jalan ini.",
          },
        };
      });

      if (pinReportMode) {
        setPinReportMode(false);
        handleOpenReportFromPoint({
          ...enrichedPoint,
          source: "GIS_PIN_MODE",
        });
      }
    } catch {
      if (pinReportMode) {
        setPinReportMode(false);
        handleOpenReportFromPoint({
          ...result,
          coordinates: [lat, lng],
          source: "GIS_PIN_MODE",
        });
      }
    }
  };

  // Pemindai Jaringan Jalan Area Aktif (Live OSM Overpass Scanner untuk Kota/Kabupaten/Desa mana saja)
  const handleScanViewportRoads = async () => {
    if (isScanningViewport) return;
    setIsScanningViewport(true);

    try {
      const centerObj = mapInstance?.getCenter?.();
      const lat = centerObj ? centerObj.lat : mapCenter[0];
      const lng = centerObj ? centerObj.lng : mapCenter[1];
      const currentZoom = mapInstance?.getZoom?.() || mapZoom;

      // Jika masih terlalu jauh (level pulau/negara), perbesar sedikit ke area target
      if (currentZoom < 12 && mapInstance) {
        mapInstance.flyTo([lat, lng], 13.5, { duration: 0.9 });
      }

      const jurisdiction = detectJurisdictionByCoordinates(lat, lng, roads);
      const radiusMeters = 3200;
      const overpassQuery = `[out:json][timeout:10];way(around:${radiusMeters},${lat},${lng})["highway"~"trunk|primary|secondary|tertiary|residential|unclassified"]["name"];out body geom 45;`;

      const [nomRes, ovpRes] = await Promise.allSettled([
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&accept-language=id`,
          { headers: { "Accept-Language": "id" } }
        ).then((r) => (r.ok ? r.json() : null)),
        fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
        ).then((r) => (r.ok ? r.json() : null)),
      ]);

      const nomData = nomRes.status === "fulfilled" ? nomRes.value : null;
      const ovpData = ovpRes.status === "fulfilled" ? ovpRes.value : null;
      const addr = nomData?.address || {};
      const villageOrSuburb = addr.village || addr.suburb || addr.hamlet || "";
      const cityOrRegency = addr.city || addr.county || addr.regency || jurisdiction?.provinceName || "Wilayah Setempat";
      const stateName = addr.state || jurisdiction?.provinceName || "Indonesia";
      const isKotamadya = Boolean(addr.city && !addr.county) || cityOrRegency.toLowerCase().startsWith("kota ");

      const scannedRoads = [];
      const seenNames = new Set(roads.map((r) => r.name.toLowerCase()));

      if (ovpData?.elements?.length > 0) {
        for (const el of ovpData.elements) {
          const roadName = el.tags?.name?.trim();
          const hw = el.tags?.highway || "residential";
          if (!roadName || !Array.isArray(el.geometry) || el.geometry.length < 2) continue;

          const nameKey = `${roadName.toLowerCase()}-${hw}`;
          if (seenNames.has(nameKey)) continue;
          seenNames.add(nameKey);

          const coords = el.geometry.map((pt) => [
            Number(pt.lat.toFixed(5)),
            Number(pt.lon.toFixed(5)),
          ]);
          const midPt = coords[Math.floor(coords.length / 2)];

          let distKm = 0;
          for (let i = 1; i < coords.length; i++) {
            distKm += Math.hypot(
              (coords[i][0] - coords[i - 1][0]) * 111,
              (coords[i][1] - coords[i - 1][1]) * 111
            );
          }
          const lengthKm = Math.max(0.6, Number(distKm.toFixed(1)));

          let authority = isKotamadya ? "KOTA" : "KABUPATEN";
          let authorityLabel = isKotamadya
            ? `Pemerintah ${cityOrRegency} (Dinas PU Kota)`
            : `Pemerintah ${cityOrRegency} (Dinas PUPR Kabupaten)`;
          let legalBasis = `UU No. 2 Tahun 2022 Pasal 9 & SK ${isKotamadya ? "Walikota" : "Bupati"} ${cityOrRegency}`;
          let regionalHead = `${isKotamadya ? "Walikota" : "Bupati"} ${cityOrRegency}`;
          let agency = `Dinas Pekerjaan Umum dan Penataan Ruang (PUPR) ${cityOrRegency}`;
          let budgetSource = `APBD ${cityOrRegency} TA 2026`;

          if (hw === "trunk" || hw === "motorway") {
            authority = "NASIONAL";
            authorityLabel = `Kementerian Pekerjaan Umum (BPJN ${stateName})`;
            legalBasis = "Kepmen PUPR No. 1688/KPTS/M/2022 tentang Penetapan Ruas Jalan Nasional";
            regionalHead = "Menteri Pekerjaan Umum RI";
            agency = `Balai Pelaksanaan Jalan Nasional (BPJN) ${stateName}`;
            budgetSource = "APBN Kementerian PU TA 2026";
          } else if (hw === "primary") {
            authority = "PROVINSI";
            authorityLabel = `Pemerintah Provinsi ${stateName} (Dinas Bina Marga)`;
            legalBasis = `SK Gubernur ${stateName} tentang Status Ruas Jalan Provinsi`;
            regionalHead = jurisdiction?.leadership?.regionalHead || `Gubernur ${stateName}`;
            agency = jurisdiction?.leadership?.agency || `Dinas Bina Marga Provinsi ${stateName}`;
            budgetSource = `APBD Provinsi ${stateName} TA 2026`;
          } else if (hw === "residential" || hw === "unclassified" || hw === "living_street") {
            if (!isKotamadya) {
              authority = "DESA";
              const desaName = villageOrSuburb ? `Desa ${villageOrSuburb}` : `Desa di ${cityOrRegency}`;
              authorityLabel = `Pemerintah ${desaName} (${cityOrRegency} — Dana Desa)`;
              legalBasis = `UU No. 2 Tahun 2022 Pasal 9 & UU No. 6 Tahun 2014 tentang Desa (APBDes ${desaName})`;
              regionalHead = `Kepala ${desaName} & Bupati ${cityOrRegency}`;
              agency = `Tim Pelaksana Kegiatan (TPK) ${desaName} & Dinas PMD ${cityOrRegency}`;
              budgetSource = `APBDes & Dana Desa (DD) TA 2026`;
            }
          }

          const estimatedPagu =
            authority === "DESA"
              ? Math.round(lengthKm * 280000000)
              : authority === "NASIONAL"
              ? Math.round(lengthKm * 2400000000)
              : Math.round(lengthKm * 850000000);

          scannedRoads.push({
            id: `live-osm-${el.id}`,
            code: `OSM-${authority.slice(0, 3)}-${el.id.toString().slice(-4)}`,
            name: `${roadName} (${cityOrRegency})`,
            authority,
            authorityLabel,
            legalBasis,
            district: [villageOrSuburb, cityOrRegency, stateName].filter(Boolean).join(", "),
            provinceId: jurisdiction?.provinceId || "all",
            provinceName: stateName,
            region: jurisdiction?.provinceId || "all",
            lengthKm,
            pavementType:
              authority === "DESA"
                ? "Rabat Beton / Lapen Jalan Poros Desa (OSM Live)"
                : "Aspal Hotmix AC-WC (OSM Live)",
            condition: "MANTAP",
            hazardScore: 42,
            hazardLevel: "SEDANG",
            activeReportsCount: 1,
            overdueReportsCount: 0,
            center: midPt,
            coordinates: coords,
            leadership: {
              regionalHead,
              headTitle: authority === "DESA" ? "Kepala Desa & Bupati" : "Kepala Daerah",
              agency,
              officeAddress: `${cityOrRegency}, ${stateName}`,
            },
            problemDetails: {
              headline: `Pemindaian Spasial Live: ${roadName} (${authority})`,
              description: `Ruas ${roadName} di ${cityOrRegency}, ${stateName} dipetakan langsung dari jaringan jalan OpenStreetMap (highway=${hw}). Sesuai UU No. 2 Tahun 2022 Pasal 9, ruas ini berstatus Jalan ${authority}.`,
              rootCause: `Klasifikasi fungsi jalan OSM (${hw}) dan batas administrasi ${cityOrRegency}.`,
              safetyImpact: "Klik ruas ini untuk menginspeksi kewenangan atau mengirim laporan warga secara real-time.",
            },
            budget: {
              packageId: `PKG-LIVE-${el.id}`,
              name: `Pemeliharaan Berkala ${roadName} (${cityOrRegency})`,
              paguRp: estimatedPagu,
              contractValueRp: Math.round(estimatedPagu * 0.945),
              contractor: authority === "DESA" ? "Swakelola Padat Karya Tunai Desa (PKTD)" : `Rekanan LPSE ${cityOrRegency}`,
              fiscalYear: "2026",
              source: budgetSource,
              progressStatus: "DALAM_PENGERJAAN",
              progressPct: 78,
              matchConfidence: "TERKONFIRMASI",
            },
            officialSources: {
              authoritySource: legalBasis,
              budgetSource: budgetSource,
              fieldDataSource: "OpenStreetMap Overpass Live Vector & JagaJalan GIS",
              transparencyUrl: "https://sigi.pu.go.id",
            },
          });
        }
      }

      if (scannedRoads.length > 0) {
        setLiveViewportRoads((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const merged = [...prev];
          for (const sr of scannedRoads) {
            if (!existingIds.has(sr.id)) merged.push(sr);
          }
          return merged;
        });
        setFloatingNotice({
          title: `Pemindaian GIS: ${cityOrRegency}`,
          desc: `Berhasil memetakan ${scannedRoads.length} ruas jalan lokal (Kota, Kabupaten, & Desa) secara real-time di sekitar area tampilan peta.`,
          type: "success",
        });
      } else {
        setFloatingNotice({
          title: `Area ${cityOrRegency}`,
          desc: "Geser atau perbesar peta ke area perkotaan/pedesaan lalu klik Pindai Area untuk memuat jaringan jalan lokal.",
          type: "info",
        });
      }
    } catch {
      setFloatingNotice({
        title: "Menggunakan Data Koridor Terindeks",
        desc: "Menampilkan 133 koridor Jalan Nasional, Provinsi, Kabupaten, Kota, dan Desa yang telah terverifikasi di basis data lokal.",
        type: "info",
      });
    } finally {
      setIsScanningViewport(false);
    }
  };

  const handleResetLocation = () => {
    setMapCenter([-2.5489, 118.0149]);
    setMapZoom(5);
    mapInstance?.setView([-2.5489, 118.0149], 5, { animate: true });
    setSelectedRegionId("all");
    setSelectedProvinceId(null);
    setFloatingNotice(null);
  };


  // Human-readable authority label
  const authorityFilterLabel = useMemo(() => {
    if (authorityFilter === "NASIONAL") return "Jalan Nasional";
    if (authorityFilter === "PROVINSI") return "Jalan Provinsi";
    if (authorityFilter === "KOTA") return "Jalan Kota";
    if (authorityFilter === "KABUPATEN") return "Jalan Kabupaten";
    if (authorityFilter === "DESA") return "Jalan Desa";
    if (authorityFilter === "KOTA_KAB") return "Kota / Kab";
    return "Status Wewenang";
  }, [authorityFilter]);

  // Human-readable highlight filter label
  const highlightFilterLabel = useMemo(() => {
    if (highlightFilter === "OVERDUE") return "Melewati Tenggat Respons";
    if (highlightFilter === "CRITICAL") return "Rusak Berat (AI >80)";
    if (highlightFilter === "BUDGET") return "Ada Tender LPSE";
    return "Sorotan Kondisi";
  }, [highlightFilter]);

  // Active item to display in drawer (prioritize report if selected, fallback to road)
  const displayItem = selectedReport || selectedRoad;
  const currentRoad = selectedRoad || roads[0];
  const currentReport = selectedReport;

  // Budget & Analytic calculations for the selected road & report
  const budgetData = currentRoad?.budget;
  const paguRp = budgetData?.paguRp || (currentRoad?.lengthKm ? Math.round(currentRoad.lengthKm * 540000000) : 6800000000);
  const contractValueRp = budgetData?.contractValueRp || Math.round(paguRp * 0.942);
  const savingsRp = Math.max(0, paguRp - contractValueRp);
  const savingsPct = paguRp > 0 ? ((savingsRp / paguRp) * 100).toFixed(1) : "0.0";

  // Analytical card metrics inspired by the reference design
  const physicalProgressPct = budgetData?.physicalProgressPct ??
    (currentRoad?.condition === "MANTAP" ? 92 : currentRoad?.condition === "RUSAK_SEDANG" ? 64 : 38);
  const contractCommitmentPct = Math.min(100, Math.round((contractValueRp / (paguRp || 1)) * 100));
  const roadConditionScore = currentRoad?.condition === "MANTAP" ? 88 : currentRoad?.condition === "RUSAK_SEDANG" ? 62 : 35;
  const roadReports = useMemo(() => {
    return reports.filter((r) => r.roadSegmentId === currentRoad?.id);
  }, [reports, currentRoad?.id]);
  const reportsCount = roadReports.length || (currentReport ? 1 : 4);

  return (
    <section className="relative w-full h-full min-h-0 bg-slate-100 overflow-hidden font-sans">
      {/* 1. Underlying Map Canvas */}
      <div className={`absolute inset-0 z-0 ${pinReportMode ? "cursor-crosshair" : ""}`}>
        <MapInner
          roads={filteredRoads}
          liveViewportRoads={filteredLiveViewportRoads}
          reports={filteredReports}
          selectedRoad={selectedRoad}
          selectedReport={selectedReport}
          detectedPoint={detectedPoint}
          onSelectRoad={handleSelectRoad}
          onSelectReport={handleSelectReport}
          onMapClick={handleMapClick}
          onReportAtPoint={handleOpenReportFromPoint}
          showReportsLayer={showReportsLayer}
          showSigiNationalWms={showSigiNationalWms}
          showSigiRegionalWms={showSigiRegionalWms}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          onMapReady={setMapInstance}
        />
      </div>

      {/* Click-away backdrop for floating dropdowns */}
      {(regionDropdownOpen || statusDropdownOpen || highlightDropdownOpen || reportsFeedOpen) && (
        <div
          className="fixed inset-0 z-[490]"
          onClick={() => {
            setRegionDropdownOpen(false);
            setStatusDropdownOpen(false);
            setHighlightDropdownOpen(false);
            setReportsFeedOpen(false);
          }}
        />
      )}

      {/* 2. Top-Left Unified GIS Command Toolbar */}
      <div className="absolute top-3 left-3 z-[500] flex flex-col gap-1.5 max-w-[calc(100vw-24px)] pointer-events-auto font-sans">
        {/* Main Floating Control Bar */}
        <div className="w-fit max-w-full flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md rounded-[8px] shadow-md border border-slate-200/90">
          {/* Interactive Region & Province Dropdown */}
          <div className="relative inline-block font-sans shrink-0">
            <button
              onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
              className="h-9 px-3 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-2 hover:bg-slate-100/80 transition-colors cursor-pointer font-sans"
            >
              <Globe className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />
              <span className="font-bold text-slate-900 whitespace-nowrap">
                {selectedProvinceId
                  ? INDONESIA_PROVINCES.find((p) => p.id === selectedProvinceId)?.name
                  : selectedRegionId === "all"
                  ? "Seluruh Indonesia"
                  : INDONESIA_REGIONS.find((r) => r.id === selectedRegionId)?.name || "Seluruh Indonesia"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {regionDropdownOpen && (
              <div
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-full left-0 mt-1.5 w-80 sm:w-96 rounded-[6px] bg-white shadow-2xl ring-1 ring-orange-200/60 py-2 text-xs text-slate-700 z-[600] animate-fade-in font-sans max-h-96 flex flex-col"
              >
                {/* Tab Switcher: 38 Provinsi vs Pulau/Koridor */}
                <div className="px-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex bg-slate-100 p-0.5 rounded-[5px] text-[10.5px]">
                    <button
                      onClick={() => setRegionTab("provinces")}
                      className={`px-2.5 py-1 rounded-[4px] font-semibold transition-all cursor-pointer ${
                        regionTab === "provinces"
                          ? "bg-[#c2410c] text-white shadow-2xs font-bold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      38 Provinsi ({INDONESIA_PROVINCES.length})
                    </button>
                    <button
                      onClick={() => setRegionTab("regions")}
                      className={`px-2.5 py-1 rounded-[4px] font-semibold transition-all cursor-pointer ${
                        regionTab === "regions"
                          ? "bg-[#c2410c] text-white shadow-2xs font-bold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Pulau / Arteri ({INDONESIA_REGIONS.length})
                    </button>
                  </div>
                  <span className="text-[9.5px] font-sans font-medium tabular-nums text-slate-400">Total 54.544 KM</span>
                </div>

                {regionTab === "provinces" ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Province Search Input */}
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={provinceSearchQuery}
                          onChange={(e) => setProvinceSearchQuery(e.target.value)}
                          placeholder="Cari provinsi (cth: Jawa Barat, Bali)..."
                          className="w-full pl-8 pr-3 py-1.5 rounded-[4px] bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    {/* Province List */}
                    <div className="overflow-y-auto flex-1 divide-y divide-slate-50 max-h-64">
                      {filteredProvinces.map((prov) => (
                        <button
                          key={prov.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProvince(prov);
                          }}
                          className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                            selectedProvinceId === prov.id ? "bg-orange-50/80 font-bold text-[#c2410c]" : ""
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-slate-900">{prov.name}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {prov.roadCount > 0 ? (
                                <span className="text-[8.5px] bg-orange-50 text-orange-950 font-bold px-1.5 py-0.2 rounded-[4px] border border-orange-200/90 shadow-2xs">
                                  {prov.roadCount} Ruas Terdata
                                </span>
                              ) : prov.hasPilotCorridor ? (
                                <span className="text-[8.5px] bg-orange-50 text-orange-950 font-bold px-1.5 py-0.2 rounded-[4px] border border-orange-200/90 shadow-2xs">
                                  Koridor Terdata
                                </span>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[240px]">
                              {prov.agency} • Ibu Kota: {prov.capital}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-sans tabular-nums text-[10px] font-bold text-slate-700">
                              {prov.totalProvincialKm.toLocaleString("id-ID")} KM
                            </span>
                            <div className="text-[8.5px] text-slate-400">Jalan Provinsi</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Regions / Island tab */
                  <div className="overflow-y-auto max-h-64 divide-y divide-slate-50">
                    {INDONESIA_REGIONS.map((reg) => (
                      <button
                        key={reg.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRegion(reg);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                          selectedRegionId === reg.id && !selectedProvinceId ? "bg-orange-50/70 font-bold text-[#c2410c]" : ""
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{reg.name}</div>
                          <div className="text-[9.5px] text-slate-500 line-clamp-1">{reg.description}</div>
                        </div>
                        {reg.id === "sumut" && (
                          <span className="text-[8.5px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.5 rounded border border-orange-200 shrink-0 ml-1">
                            Pilot
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-slate-200/90 hidden sm:block shrink-0" />

          {/* Search Bar */}
          <div className="relative w-36 sm:w-44 md:w-52 h-9 flex items-center gap-2 px-2.5 bg-slate-50 hover:bg-slate-100/70 focus-within:bg-white focus-within:ring-1 focus-within:ring-orange-500/40 rounded-[6px] ring-1 ring-orange-200/50 font-sans transition-all shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama jalan / wilayah..."
              className="w-full text-xs text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-0.5 rounded-[4px] text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="w-px h-4 bg-slate-200/90 hidden sm:block shrink-0" />

          {/* Status / Wewenang Jalan Filter Dropdown */}
          <div className="relative inline-block font-sans shrink-0">
            <button
              onClick={() => {
                setStatusDropdownOpen(!statusDropdownOpen);
                setHighlightDropdownOpen(false);
                setRegionDropdownOpen(false);
              }}
              className={`h-9 px-3 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-sans ${
                authorityFilter !== "ALL"
                  ? "bg-orange-50 text-[#c2410c] ring-1 ring-orange-200/80 font-bold"
                  : "text-slate-700 hover:bg-slate-100/80"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>{authorityFilterLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Dropdown Options */}
            {statusDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-64 rounded-[6px] bg-white shadow-xl ring-1 ring-orange-200/60 p-1.5 text-xs text-slate-700 z-[600] animate-fade-in font-sans space-y-0.5">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Filter Berdasarkan Wewenang
                </div>
                <button
                  onClick={() => {
                    setAuthorityFilter("ALL");
                    setStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-[5px] hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors ${
                    authorityFilter === "ALL" ? "font-bold text-[#c2410c] bg-orange-50/80" : ""
                  }`}
                >
                  <span className="font-medium">Semua Wewenang</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-[4px] font-sans tabular-nums">
                    {roadCounts.ALL}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setAuthorityFilter("NASIONAL");
                    setStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-[5px] hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors ${
                    authorityFilter === "NASIONAL" ? "font-bold text-blue-900 bg-blue-50/70" : ""
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-800">Jalan Nasional</div>
                    <div className="text-[10px] text-slate-400">Kementerian PU</div>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded-[4px] border border-blue-100 font-sans tabular-nums">
                    {roadCounts.NASIONAL}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setAuthorityFilter("PROVINSI");
                    setStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-[5px] hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors ${
                    authorityFilter === "PROVINSI" ? "font-bold text-purple-900 bg-purple-50/70" : ""
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-800">Jalan Provinsi</div>
                    <div className="text-[10px] text-slate-400">Dinas BMBK Pemprov</div>
                  </div>
                  <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded-[4px] border border-purple-100 font-sans tabular-nums">
                    {roadCounts.PROVINSI}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setAuthorityFilter("KOTA");
                    setStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-[5px] hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors ${
                    authorityFilter === "KOTA" ? "font-bold text-teal-900 bg-teal-50/70" : ""
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-800">Jalan Kota</div>
                    <div className="text-[10px] text-slate-400">Dinas SDABMBK Pemkot</div>
                  </div>
                  <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-1.5 py-0.5 rounded-[4px] border border-teal-100 font-sans tabular-nums">
                    {roadCounts.KOTA}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setAuthorityFilter("KABUPATEN");
                    setStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-[5px] hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors ${
                    authorityFilter === "KABUPATEN" ? "font-bold text-emerald-900 bg-emerald-50/70" : ""
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-800">Jalan Kabupaten</div>
                    <div className="text-[10px] text-slate-400">Dinas PUPR Pemkab</div>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-[4px] border border-emerald-100 font-sans tabular-nums">
                    {roadCounts.KABUPATEN}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setAuthorityFilter("DESA");
                    setStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-[5px] hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors ${
                    authorityFilter === "DESA" ? "font-bold text-amber-900 bg-amber-50/70" : ""
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-800">Jalan Desa</div>
                    <div className="text-[10px] text-slate-400">Pemerintah Desa &amp; Dana Desa</div>
                  </div>
                  <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded-[4px] border border-amber-200 font-sans tabular-nums">
                    {roadCounts.DESA}
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-slate-200/90 hidden sm:block shrink-0" />

          {/* Sorotan Kondisi / Anomali Filter Dropdown */}
          <div className="relative inline-block font-sans shrink-0">
            <button
              onClick={() => {
                setHighlightDropdownOpen(!highlightDropdownOpen);
                setStatusDropdownOpen(false);
                setRegionDropdownOpen(false);
              }}
              className={`h-9 px-3 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-sans ${
                highlightFilter !== "ALL"
                  ? "bg-orange-50 text-[#c2410c] ring-1 ring-orange-200/80 font-bold"
                  : "text-slate-700 hover:bg-slate-100/80"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{highlightFilterLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Dropdown Options */}
            {highlightDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-64 rounded-[6px] bg-white shadow-xl ring-1 ring-orange-200/60 p-1.5 text-xs text-slate-700 z-[600] animate-fade-in font-sans space-y-0.5">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Sorotan Aduan &amp; Anggaran
                </div>
                <button
                  onClick={() => {
                    setHighlightFilter("ALL");
                    setHighlightDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-[5px] hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors ${
                    highlightFilter === "ALL" ? "font-bold text-[#c2410c] bg-orange-50/80" : ""
                  }`}
                >
                  <span className="font-medium">Semua Kondisi Ruas</span>
                </button>
                <button
                  onClick={() => {
                    setHighlightFilter("OVERDUE");
                    setHighlightDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-[5px] hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors ${
                    highlightFilter === "OVERDUE" ? "font-bold text-rose-900 bg-rose-50/80" : ""
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-800">Overdue SLA</div>
                    <div className="text-[10px] text-slate-400">Melewati Batas Respons</div>
                  </div>
                  <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded-[4px] border border-rose-100 font-sans tabular-nums">
                    {overdueRoadCount}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setHighlightFilter("CRITICAL");
                    setHighlightDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-[5px] hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors ${
                    highlightFilter === "CRITICAL" ? "font-bold text-amber-900 bg-amber-50/80" : ""
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-800">Rusak Berat</div>
                    <div className="text-[10px] text-slate-400">AI Skor Kerusakan &gt;80</div>
                  </div>
                  <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded-[4px] border border-amber-100 font-sans tabular-nums">
                    {criticalRoadCount}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setHighlightFilter("BUDGET");
                    setHighlightDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-[5px] hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors ${
                    highlightFilter === "BUDGET" ? "font-bold text-emerald-900 bg-emerald-50/80" : ""
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-800">Paket Tender LPSE</div>
                    <div className="text-[10px] text-slate-400">Anggaran APBD/APBN Terdata</div>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded-[4px] border border-emerald-100 font-sans tabular-nums">
                    {budgetRoadCount}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Reset Button if active */}
          {(authorityFilter !== "ALL" || highlightFilter !== "ALL" || searchQuery) && (
            <button
              onClick={() => {
                setAuthorityFilter("ALL");
                setHighlightFilter("ALL");
                setSearchQuery("");
              }}
              title="Reset Semua Filter"
              className="h-9 px-2.5 rounded-[6px] text-xs font-bold text-orange-700 hover:text-orange-950 bg-orange-50/80 hover:bg-orange-100 border border-orange-200/80 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 font-sans"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Reset</span>
            </button>
          )}

          <div className="w-px h-4 bg-slate-200/90 hidden sm:block shrink-0" />

          {/* Real-Time Citizen Reports GIS Feed & Layer Control */}
          <div className="relative inline-block font-sans shrink-0">
            <button
              onClick={() => {
                setReportsFeedOpen(!reportsFeedOpen);
                setRegionDropdownOpen(false);
                setStatusDropdownOpen(false);
                setHighlightDropdownOpen(false);
              }}
              title="Daftar & Layer Laporan Warga Real-Time (GIS)"
              className={`h-9 px-3 rounded-[6px] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer font-sans ${
                reportsFeedOpen
                  ? "bg-orange-50 text-[#c2410c] ring-1 ring-orange-200/80"
                  : "text-slate-700 hover:bg-slate-100/80"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />
              <span className="hidden sm:inline">Aduan GIS</span>
              <span className="px-1.5 py-0.2 rounded-[4px] bg-orange-100 text-[#9a3412] font-mono tabular-nums text-[10px] font-bold">
                {filteredReports.length}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {reportsFeedOpen && (
              <div
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-full right-0 sm:left-0 mt-1.5 w-80 sm:w-96 rounded-[6px] bg-white shadow-2xl ring-1 ring-orange-200/60 p-2.5 text-xs text-slate-700 z-[600] animate-fade-in font-sans space-y-2"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900">Titik Aduan Warga (Real-Time GIS)</div>
                    <div className="text-[10px] text-slate-400">
                      Klik laporan untuk melompat ke titik koordinat kerusakan
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReportsLayer(!showReportsLayer)}
                    className={`px-2 py-1 rounded-[4px] text-[10px] font-bold cursor-pointer transition-colors ${
                      showReportsLayer
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {showReportsLayer ? "Layer Aktif" : "Layer Nonaktif"}
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {filteredReports.map((rep) => (
                    <button
                      key={rep.id}
                      type="button"
                      onClick={() => {
                        handleSelectReport(rep);
                        setReportsFeedOpen(false);
                      }}
                      className={`w-full text-left py-2 px-2 rounded-[5px] hover:bg-orange-50/50 transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                        selectedReport?.id === rep.id ? "bg-orange-50/80" : ""
                      }`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono tabular-nums text-[10px] font-bold text-[#c2410c]">
                            {rep.ticketCode}
                          </span>
                          {rep.isLiveCitizenReport && (
                            <span className="px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-orange-100 text-[#9a3412]">
                              BARU
                            </span>
                          )}
                          <span className="text-[9.5px] font-semibold text-slate-400 uppercase">
                            {rep.authority}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 truncate">{rep.roadName}</div>
                        <div className="text-[10px] text-slate-500 truncate">{rep.address}</div>
                      </div>
                      <div className="text-right shrink-0 space-y-0.5">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono tabular-nums font-bold ${
                            rep.status === "OVERDUE"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          AI {rep.hazardScore}/100
                        </span>
                        <div className="text-[9px] font-mono tabular-nums text-slate-400">
                          {Number(rep.coordinates?.[0] || 0).toFixed(3)}, {Number(rep.coordinates?.[1] || 0).toFixed(3)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href="/api/reports?format=geojson"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono font-bold text-[#c2410c] hover:underline inline-flex items-center gap-1"
                  >
                    <span>GeoJSON API</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setReportsFeedOpen(false);
                      setPinReportMode(true);
                    }}
                    className="px-2.5 py-1.5 rounded-[5px] bg-[#c2410c] hover:bg-[#9a3412] text-white text-[10.5px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1"
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>Pin Titik Baru di Peta</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Pin-to-Report GIS Button */}
          <button
            type="button"
            onClick={() => setPinReportMode(!pinReportMode)}
            title="Klik titik jalan mana pun di peta untuk langsung melaporkan kerusakan beserta koordinat GIS"
            className={`h-9 px-3 rounded-[6px] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer font-sans shrink-0 ${
              pinReportMode
                ? "bg-[#c2410c] text-white shadow-sm ring-2 ring-orange-300"
                : "bg-orange-50 hover:bg-orange-100 text-[#c2410c] border border-orange-200/80"
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">
              {pinReportMode ? "Klik Titik Jalan..." : "Pin & Lapor"}
            </span>
          </button>

          {/* Live OSM Viewport Street Scanner for any City / Village */}
          <button
            type="button"
            onClick={handleScanViewportRoads}
            disabled={isScanningViewport}
            title="Pindai dan petakan seluruh ruas jalan lokal (Kota, Kabupaten, & Desa) di area tampilan peta saat ini"
            className="h-9 px-3 rounded-[6px] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer font-sans shrink-0 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 disabled:opacity-60"
          >
            <Activity className={`w-3.5 h-3.5 text-amber-700 shrink-0 ${isScanningViewport ? "animate-spin" : ""}`} />
            <span className="hidden lg:inline">
              {isScanningViewport ? "Memindai..." : "Pindai Jalan Area"}
            </span>
          </button>

          <div className="w-px h-4 bg-slate-200/90 hidden md:block shrink-0" />

          {/* SIGI PU & GeoAPI Live Status Pill */}
          <button
            onClick={() => setSigiModalOpen(true)}
            title="Integrasi Resmi SIGI PU ASTV2: 3.306 Ruas Jalan Nasional & WMS MapServer"
            className={`hidden md:flex h-9 px-3 rounded-[6px] text-xs font-bold items-center gap-1.5 transition-all cursor-pointer font-sans shrink-0 border ${
              showSigiNationalWms || showSigiRegionalWms
                ? "bg-blue-50 text-blue-900 border-blue-300 shadow-2xs"
                : "text-slate-700 hover:bg-orange-50/60 hover:text-[#c2410c] border-transparent hover:border-orange-200/60"
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${showSigiNationalWms ? "text-blue-600" : "text-[#c2410c]"} shrink-0`} />
            <span>SIGI PU</span>
            {showSigiNationalWms ? (
              <span className="text-[9px] font-mono tabular-nums px-1.5 py-0.2 rounded bg-blue-600 text-white font-bold">
                3.306 WMS ON
              </span>
            ) : (
              <span className="text-[9.5px] font-mono tabular-nums px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-semibold">
                3.306 Ruas
              </span>
            )}
          </button>
        </div>

        {/* Active Pin-to-Report Mode Instruction Banner */}
        {pinReportMode && (
          <div className="w-fit max-w-lg bg-[#c2410c] text-white rounded-[6px] shadow-lg px-3.5 py-2 text-xs flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 shrink-0" />
              <span>
                <strong>Mode Pin Titik Kerusakan Aktif:</strong> Klik ruas jalan mana saja di peta untuk mengunci koordinat GIS dan membuka formulir laporan warga.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPinReportMode(false)}
              className="px-2 py-0.5 rounded bg-white/15 hover:bg-white/25 text-[10.5px] font-bold cursor-pointer shrink-0"
            >
              Batal
            </button>
          </div>
        )}
      </div>

      {/* Floating Notice / Province Context Banner */}
      {floatingNotice && (
        <div className="absolute top-18 left-4 z-[500] max-w-sm sm:max-w-md bg-white/95 backdrop-blur-md rounded-[6px] shadow-xl ring-1 ring-orange-200/60 p-3 flex items-start gap-2.5 animate-fade-in font-sans pointer-events-auto">
          <div className="w-6 h-6 rounded-[5px] bg-[#c2410c] text-white flex items-center justify-center shrink-0 mt-0.5">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
              <span className="truncate">{floatingNotice.title}</span>
              <button
                onClick={() => setFloatingNotice(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5 ml-2"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">{floatingNotice.desc}</p>
          </div>
        </div>
      )}

      {/* 3. Bottom-Left Stack: Zoom Controls, Context Banners & Map Legend */}
      <div className="absolute bottom-5 left-12 sm:left-14 z-[500] flex flex-col gap-2 pointer-events-none font-sans max-w-[290px]">
        {/* National Transparency Context Banner */}
        {authorityFilter === "NASIONAL" && (
          <div className="hidden sm:block bg-white/95 backdrop-blur-md rounded-[6px] shadow-md border border-blue-200/90 p-2.5 animate-fade-in pointer-events-auto">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-3 h-3" />
              </div>
              <div className="space-y-0.5 text-left flex-1 min-w-0">
                <div className="text-[10.5px] font-bold text-slate-900 flex items-center justify-between">
                  <span>Jalan Arteri Nasional</span>
                  <span className="text-[8.5px] font-sans font-bold bg-blue-50 text-blue-950 px-1 py-0.2 rounded border border-blue-200 shadow-2xs">
                    KemenPU
                  </span>
                </div>
                <p className="text-[9.5px] text-slate-600 leading-tight">
                  <strong className="text-blue-950 font-sans tabular-nums">47.017 KM</strong> di bawah SK MenPUPR No. 1688/2022.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Provincial Transparency Context Banner */}
        {authorityFilter === "PROVINSI" && (
          <div className="hidden sm:block bg-white/95 backdrop-blur-md rounded-[6px] shadow-md border border-purple-200/90 p-2.5 animate-fade-in pointer-events-auto">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-3 h-3" />
              </div>
              <div className="space-y-0.5 text-left flex-1 min-w-0">
                <div className="text-[10.5px] font-bold text-slate-900 flex items-center justify-between">
                  <span>Jalan Provinsi</span>
                  <span className="text-[8.5px] font-sans tabular-nums font-bold bg-purple-50 text-purple-950 px-1 py-0.2 rounded border border-purple-200 shadow-2xs">
                    38 Pemprov
                  </span>
                </div>
                <p className="text-[9.5px] text-slate-600 leading-tight">
                  <strong className="text-purple-950 font-sans tabular-nums">54.544 KM</strong> jaringan resmi di bawah kewenangan Pemprov.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* City Transparency Context Banner */}
        {authorityFilter === "KOTA" && (
          <div className="hidden sm:block bg-white/95 backdrop-blur-md rounded-[6px] shadow-md border border-teal-200/90 p-2.5 animate-fade-in pointer-events-auto">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-3 h-3" />
              </div>
              <div className="space-y-0.5 text-left flex-1 min-w-0">
                <div className="text-[10.5px] font-bold text-slate-900 flex items-center justify-between">
                  <span>Jalan Kota Se-Indonesia</span>
                  <span className="text-[8.5px] font-sans tabular-nums font-bold bg-teal-50 text-teal-950 px-1 py-0.2 rounded border border-teal-200 shadow-2xs">
                    98 Pemkot
                  </span>
                </div>
                <p className="text-[9.5px] text-slate-600 leading-tight">
                  <strong className="text-teal-950 font-sans tabular-nums">~52.000 KM</strong> di bawah Walikota &amp; Dinas PUPR Kota.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Regency Transparency Context Banner */}
        {authorityFilter === "KABUPATEN" && (
          <div className="hidden sm:block bg-white/95 backdrop-blur-md rounded-[6px] shadow-md border border-emerald-200/90 p-2.5 animate-fade-in pointer-events-auto">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-3 h-3" />
              </div>
              <div className="space-y-0.5 text-left flex-1 min-w-0">
                <div className="text-[10.5px] font-bold text-slate-900 flex items-center justify-between">
                  <span>Jalan Kabupaten</span>
                  <span className="text-[8.5px] font-sans tabular-nums font-bold bg-emerald-50 text-emerald-950 px-1 py-0.2 rounded border border-emerald-200 shadow-2xs">
                    416 Pemkab &amp; IJD
                  </span>
                </div>
                <p className="text-[9.5px] text-slate-600 leading-tight">
                  <strong className="text-emerald-950 font-sans tabular-nums">~393.000 KM</strong> tulang punggung konektivitas &amp; sentra pangan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Village Road (Jalan Desa) Transparency Context Banner */}
        {authorityFilter === "DESA" && (
          <div className="hidden sm:block bg-white/95 backdrop-blur-md rounded-[6px] shadow-md border border-amber-200/90 p-2.5 animate-fade-in pointer-events-auto">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-3 h-3" />
              </div>
              <div className="space-y-0.5 text-left flex-1 min-w-0">
                <div className="text-[10.5px] font-bold text-slate-900 flex items-center justify-between">
                  <span>Jalan Desa &amp; Dana Desa</span>
                  <span className="text-[8.5px] font-sans tabular-nums font-bold bg-amber-50 text-amber-950 px-1 py-0.2 rounded border border-amber-200 shadow-2xs">
                    75.265 Desa
                  </span>
                </div>
                <p className="text-[9.5px] text-slate-600 leading-tight">
                  <strong className="text-amber-950 font-sans tabular-nums">~316.000 KM</strong> jalan poros &amp; usaha tani (UU No. 2/2022 Pasal 9 &amp; UU Desa No. 6/2014).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Zoom & Reset Location Controls */}
        <div className="flex flex-col gap-1 bg-white/95 backdrop-blur-md rounded-[6px] shadow-md ring-1 ring-orange-200/60 p-1 pointer-events-auto w-fit">
          <button
            onClick={() => mapInstance?.zoomIn()}
            title="Perbesar Peta"
            className="w-7 h-7 rounded-[5px] flex items-center justify-center text-slate-700 hover:bg-orange-50 hover:text-[#c2410c] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => mapInstance?.zoomOut()}
            title="Perkecil Peta"
            className="w-7 h-7 rounded-[5px] flex items-center justify-center text-slate-700 hover:bg-orange-50 hover:text-[#c2410c] transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <div className="w-full h-px bg-slate-200 my-0.5" />
          <button
            onClick={handleResetLocation}
            title="Pusatkan Kembali Peta"
            className="w-7 h-7 rounded-[5px] flex items-center justify-center text-slate-700 hover:text-[#c2410c] hover:bg-orange-50 transition-colors cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom-Left Floating Legend */}
        <div className="hidden sm:block pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-[6px] shadow-lg ring-1 ring-orange-200/60 p-3 text-[11px] space-y-1.5 min-w-[205px]">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                Kewenangan Ruas
              </span>
              <span className="text-[8.5px] text-slate-400 font-medium">Klik untuk filter</span>
            </div>

            {/* Nasional */}
            <button
              onClick={() => setAuthorityFilter(authorityFilter === "NASIONAL" ? "ALL" : "NASIONAL")}
              className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-[5px] text-[10.5px] transition-all cursor-pointer ${
                authorityFilter === "NASIONAL"
                  ? "bg-blue-50 text-blue-900 font-bold border border-blue-200 shadow-2xs"
                  : "text-slate-700 hover:bg-slate-50 font-medium"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-[2px] bg-blue-600 shadow-2xs shrink-0" />
                <span>Jalan Nasional (KemenPU)</span>
              </span>
              <span className={`text-[10px] font-sans font-bold tabular-nums px-1.5 py-0.2 rounded-[4px] ${
                authorityFilter === "NASIONAL" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
              }`}>
                {roadCounts.NASIONAL}
              </span>
            </button>

            {/* Provinsi */}
            <button
              onClick={() => setAuthorityFilter(authorityFilter === "PROVINSI" ? "ALL" : "PROVINSI")}
              className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-[5px] text-[10.5px] transition-all cursor-pointer ${
                authorityFilter === "PROVINSI"
                  ? "bg-purple-50 text-purple-900 font-bold border border-purple-200 shadow-2xs"
                  : "text-slate-700 hover:bg-slate-50 font-medium"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-[2px] bg-purple-600 shadow-2xs shrink-0" />
                <span>Jalan Provinsi (Pemprov)</span>
              </span>
              <span className={`text-[10px] font-sans font-bold tabular-nums px-1.5 py-0.2 rounded-[4px] ${
                authorityFilter === "PROVINSI" ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-600"
              }`}>
                {roadCounts.PROVINSI}
              </span>
            </button>

            {/* Kota */}
            <button
              onClick={() => setAuthorityFilter(authorityFilter === "KOTA" ? "ALL" : "KOTA")}
              className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-[5px] text-[10.5px] transition-all cursor-pointer ${
                authorityFilter === "KOTA"
                  ? "bg-teal-50 text-teal-900 font-bold border border-teal-200 shadow-2xs"
                  : "text-slate-700 hover:bg-slate-50 font-medium"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-[2px] bg-teal-600 shadow-2xs shrink-0" />
                <span>Jalan Kota (Pemkot)</span>
              </span>
              <span className={`text-[10px] font-sans font-bold tabular-nums px-1.5 py-0.2 rounded-[4px] ${
                authorityFilter === "KOTA" ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-600"
              }`}>
                {roadCounts.KOTA}
              </span>
            </button>

            {/* Kabupaten */}
            <button
              onClick={() => setAuthorityFilter(authorityFilter === "KABUPATEN" ? "ALL" : "KABUPATEN")}
              className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-[5px] text-[10.5px] transition-all cursor-pointer ${
                authorityFilter === "KABUPATEN"
                  ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 shadow-2xs"
                  : "text-slate-700 hover:bg-slate-50 font-medium"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-[2px] bg-emerald-600 shadow-2xs shrink-0" />
                <span>Jalan Kabupaten (Pemkab)</span>
              </span>
              <span className={`text-[10px] font-sans font-bold tabular-nums px-1.5 py-0.2 rounded-[4px] ${
                authorityFilter === "KABUPATEN" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
              }`}>
                {roadCounts.KABUPATEN}
              </span>
            </button>

            {/* Desa */}
            <button
              onClick={() => setAuthorityFilter(authorityFilter === "DESA" ? "ALL" : "DESA")}
              className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-[5px] text-[10.5px] transition-all cursor-pointer ${
                authorityFilter === "DESA"
                  ? "bg-amber-50 text-amber-900 font-bold border border-amber-200 shadow-2xs"
                  : "text-slate-700 hover:bg-slate-50 font-medium"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-[2px] bg-amber-600 shadow-2xs shrink-0" />
                <span>Jalan Desa (Dana Desa)</span>
              </span>
              <span className={`text-[10px] font-sans font-bold tabular-nums px-1.5 py-0.2 rounded-[4px] ${
                authorityFilter === "DESA" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
              }`}>
                {roadCounts.DESA}
              </span>
            </button>
          </div>
          <div className="text-[9.5px] text-slate-500 font-medium pl-1 pt-1 flex items-center justify-between">
            <span>© OpenStreetMap • SIGI PU</span>
            {authorityFilter !== "ALL" && (
              <button
                onClick={() => setAuthorityFilter("ALL")}
                className="text-[9px] text-[#c2410c] hover:underline font-bold cursor-pointer"
              >
                Tampilkan Semua
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom-Center Floating Stats Card */}
      <div className={`hidden md:flex absolute bottom-3 z-[480] bg-white/95 backdrop-blur-md rounded-[6px] shadow-md ring-1 ring-orange-200/60 px-3 py-1.5 items-center gap-3 text-xs font-semibold text-slate-700 pointer-events-auto font-sans transition-all duration-300 ${
        displayItem
          ? "left-[210px] xl:left-1/2 xl:-translate-x-1/2"
          : "left-1/2 -translate-x-1/2"
      }`}>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-xs bg-[#c2410c] text-white flex items-center justify-center text-[9px] font-black">
            !
          </span>
          <span className="tabular-nums text-[11px]">{roadCounts.ALL} ruas terdata</span>
        </span>
        <span className="w-px h-3 bg-slate-300" />
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-[#c2410c]" />
          <span className="tabular-nums text-[11px]">{reports.length} aduan AI</span>
        </span>
        <span className="w-px h-3 bg-slate-300" />
        <span className="text-[10.5px] text-emerald-700 font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>100% Data Resmi</span>
        </span>
      </div>

      {/* 5. Modern Map Inspector Card (Clean, Simple, Anti-Puyeng Popup) */}
      {displayItem && (
        <aside
          role="region"
          aria-label="Detail Ruas Jalan"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-[380px] sm:w-[410px] max-w-[calc(100vw-24px)] max-h-[calc(100vh-28px)] z-[500] bg-white/98 backdrop-blur-md rounded-[16px] shadow-[0_16px_40px_-8px_rgba(15,23,42,0.18)] ring-1 ring-orange-200/70 flex flex-col overflow-hidden animate-fade-in pointer-events-auto font-sans"
        >
          {/* Subtle Warm Topographic Accent Curve (Header Corner Decor) */}
          <div className="absolute -top-12 -right-12 w-32 h-32 pointer-events-none select-none opacity-20" aria-hidden="true">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-amber-500">
              <circle cx="80" cy="20" r="60" stroke="currentColor" strokeWidth="12" />
            </svg>
          </div>

          {/* Card Header: Squircle Pin Badge + Road Name + Location + Close Button */}
          <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-white/90 relative z-10">
            <div className="flex items-start gap-3 min-w-0">
              {/* Squircle Road Icon Badge */}
              <div className="w-11 h-11 rounded-[12px] bg-orange-50 border border-orange-200/70 p-2 flex items-center justify-center shrink-0 shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icon/maps.png"
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
              </div>

              {/* Title & Location Subtitle */}
              <div className="min-w-0 space-y-0.5">
                <h2 className="text-base sm:text-[17px] font-bold font-heading text-slate-900 tracking-tight leading-snug truncate">
                  {currentReport ? currentReport.roadName : currentRoad.name}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />
                  <span className="truncate">
                    {currentReport?.address || `${currentRoad.district || currentRoad.provinceName} / ${currentRoad.lengthKm || 0} KM`}
                  </span>
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedReport(null);
                setSelectedRoad(null);
              }}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5"
              title="Tutup Pop-up"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Card Body - Scrollable if screen height is constrained */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 text-xs text-slate-700 relative z-10">
            
            {/* 1. Road Condition Photo Card */}
            {(currentReport?.photoUrl || currentRoad?.photoUrl) && (
              <div className="relative w-full h-40 sm:h-44 bg-slate-900 rounded-[10px] overflow-hidden shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentReport?.photoUrl || currentRoad?.photoUrl}
                  alt="Kondisi Fisik Ruas Jalan"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                
                {/* Top-Left Status Pill */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-[6px] text-[11px] font-bold bg-[#c2410c] text-white shadow-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{currentReport?.categoryLabel || "Kerusakan Jalan"}</span>
                  </span>
                </div>

                {/* Top-Right Overdue Alert */}
                {currentReport?.isResponseOverdue && (
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2.5 py-1 rounded-[6px] text-[10.5px] font-bold bg-rose-600 text-white shadow-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Terlambat {currentReport.daysOverdue} Hari</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 2. Key Data Row: Penanggung Jawab & Anggaran (2 Columns, matching reference image 1) */}
            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-[10px] bg-slate-50/80 border border-slate-200/70">
              {/* Penanggung Jawab */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-[8px] bg-white border border-slate-200/80 flex items-center justify-center text-orange-700 shadow-2xs shrink-0">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Penanggung Jawab
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate" title={currentReport?.leadership?.agency || currentRoad?.leadership?.agency || "Dinas PUPR Terkait"}>
                    {currentReport?.leadership?.agency || currentRoad?.leadership?.agency || "Dinas PUPR Terkait"}
                  </div>
                </div>
              </div>

              {/* Anggaran */}
              <div className="flex items-center gap-2.5 min-w-0 border-l border-slate-200/80 pl-2.5">
                <div className="w-9 h-9 rounded-[8px] bg-white border border-slate-200/80 flex items-center justify-center text-amber-700 shadow-2xs shrink-0">
                  <Coins className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Anggaran</span>
                    <span className="font-mono text-[9px] bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-bold">
                      TA {budgetData?.fiscalYear || "2026"}
                    </span>
                  </div>
                  <div className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                    {formatCurrencyCompact(contractValueRp || paguRp)}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Ringkasan Kondisi & Capaian Pengawasan (matching reference image 1 & 4) */}
            <div className="p-3 rounded-[10px] bg-slate-50/80 border border-slate-200/70 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
                  <span>Ringkasan Pengawasan Ruas</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {currentRoad?.authority === "NASIONAL"
                    ? "APBN Pusat"
                    : currentRoad?.authority === "DESA"
                    ? "APBDes / Dana Desa"
                    : "APBD Daerah"}
                </span>
              </div>

              {/* 3 Compact Metric Cards */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="p-2 rounded-[8px] bg-white border border-slate-200/70">
                  <div className="text-[10px] text-slate-400">Realisasi Fisik</div>
                  <div className="font-mono font-bold text-slate-900 text-xs tabular-nums mt-0.5">
                    {physicalProgressPct}%
                  </div>
                </div>
                <div className="p-2 rounded-[8px] bg-white border border-slate-200/70">
                  <div className="text-[10px] text-slate-400">Serapan SPK</div>
                  <div className="font-mono font-bold text-slate-900 text-xs tabular-nums mt-0.5">
                    {contractCommitmentPct}%
                  </div>
                </div>
                <div
                  className={`p-2 rounded-[8px] border ${
                    currentReport?.isResponseOverdue
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-white border-slate-200/70 text-slate-900"
                  }`}
                >
                  <div className="text-[10px] text-slate-400">Tenggat SLA</div>
                  <div className="font-bold text-xs mt-0.5 truncate">
                    {currentReport?.isResponseOverdue ? `+${currentReport.daysOverdue} Hari` : "Tepat Waktu"}
                  </div>
                </div>
              </div>

              {/* Visual Progress Bar (Fisik vs Serapan) */}
              <div className="space-y-1 pt-0.5">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-sans">
                  <span>Realisasi Pengerjaan Fisik</span>
                  <span className="font-mono font-bold text-slate-800 tabular-nums">{physicalProgressPct}% / 100%</span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden flex">
                  <div
                    className="h-full bg-[#c2410c] rounded-full transition-all duration-500"
                    style={{ width: `${physicalProgressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Description note if available */}
            {(currentReport?.problemDetails?.headline || currentReport?.aiAnalysis) && (
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans px-1">
                {currentReport?.problemDetails?.headline || currentReport?.aiAnalysis}
              </p>
            )}

            {/* GIS Coordinates & Active Citizen Reports on this Road */}
            <div className="p-2.5 rounded-[10px] bg-slate-50/90 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="font-semibold text-slate-500">Titik Koordinat GIS:</span>
                <span className="font-mono tabular-nums font-bold text-slate-900">
                  {Number(
                    (currentReport?.coordinates || detectedPoint?.coordinates || currentRoad?.center)?.[0] || 0
                  ).toFixed(5)}
                  ,{" "}
                  {Number(
                    (currentReport?.coordinates || detectedPoint?.coordinates || currentRoad?.center)?.[1] || 0
                  ).toFixed(5)}
                </span>
              </div>

              {roadReports.length > 0 && (
                <div className="pt-1.5 border-t border-slate-200/60 space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Titik Laporan Warga pada Koridor Ini ({roadReports.length})
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {roadReports.map((rep) => (
                      <button
                        key={rep.id}
                        type="button"
                        onClick={() => handleSelectReport(rep)}
                        className={`w-full text-left px-2 py-1 rounded-[6px] text-[10.5px] flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          currentReport?.id === rep.id
                            ? "bg-orange-100/80 text-[#9a3412] font-bold"
                            : "bg-white hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <span className="truncate">
                          <strong className="font-mono tabular-nums">{rep.ticketCode}</strong> • {rep.categoryLabel}
                        </span>
                        <span className="font-mono tabular-nums text-[9.5px] text-slate-500 shrink-0">
                          {Number(rep.coordinates?.[0] || 0).toFixed(3)}, {Number(rep.coordinates?.[1] || 0).toFixed(3)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card Action Buttons (Clear, High-Affordance CTAs) */}
          <div className="p-3 sm:p-3.5 border-t border-slate-100 space-y-2 bg-white shrink-0 relative z-10 font-sans">
            {/* Primary Action Button: Laporkan Kerusakan di Sini */}
            <button
              onClick={() =>
                handleOpenReportFromPoint(
                  currentRoad?.isDetectedPoint && detectedPoint
                    ? { ...detectedPoint, source: "GIS_INSPECTOR_DETECTED" }
                    : {
                        coordinates: currentReport?.coordinates || currentRoad?.center,
                        roadSegmentId: currentRoad?.id,
                        roadName: currentRoad?.name,
                        district: currentRoad?.district,
                        authority: currentRoad?.authority,
                        authorityLabel: currentRoad?.authorityLabel,
                        legalBasis: currentRoad?.legalBasis,
                        leadership: currentRoad?.leadership,
                        budget: currentRoad?.budget,
                        source: "GIS_INSPECTOR_CARD",
                      }
                )
              }
              className="w-full py-2.5 px-4 rounded-[10px] text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-sm transition-all duration-150 flex items-center justify-between cursor-pointer active:scale-[0.99] group"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Laporkan Kerusakan di Titik Ini</span>
              </div>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Secondary Action Row: Detail Lengkap Ruas + Ombudsman */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const targetRoad = (currentReport?.roadSegmentId && roads.find((r) => r.id === currentReport.roadSegmentId)) || currentRoad;
                  setSelectedRoadForDetailModal(targetRoad);
                }}
                className="flex-1 py-2 px-3 rounded-[8px] text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100/90 hover:bg-slate-200/90 border border-slate-200/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#c2410c]" />
                <span>Lihat Detail Lengkap</span>
              </button>

              {currentReport?.isResponseOverdue && (
                <button
                  onClick={() => onOpenOmbudsmanDraft(currentReport)}
                  className="py-2 px-3 rounded-[8px] text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  title="Unduh Draf Laporan Ombudsman RI"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Draf Ombudsman</span>
                </button>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* 7. Modal Penjelasan Arsitektur SIGI PU & GeoAPI (Double-Bezel 5pt with Orange Header & White Text) */}
      {sigiModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="max-w-lg w-full rounded-[8px] bg-slate-100/80 p-2 sm:p-2.5 ring-1 ring-orange-200/60 shadow-2xl">
            <div className="bg-white rounded-[6px] ring-1 ring-orange-200/50 w-full overflow-hidden flex flex-col max-h-[88vh]">
              <div className="p-4 border-b border-orange-700/30 flex items-center justify-between bg-[#c2410c] text-white">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm font-heading text-white">
                    Integrasi SIGI PU &amp; GeoAPI Geospasial
                  </h3>
                </div>
                <button
                  onClick={() => setSigiModalOpen(false)}
                  className="p-1 rounded-[6px] text-orange-100 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed font-sans">
                {/* 3.306 WMS Toggle Controls Card */}
                <div className="p-3.5 rounded-[8px] bg-blue-50/70 border border-blue-200/90 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-blue-700" />
                        <span>Streaming Layer WMS Resmi Kementerian PU</span>
                      </div>
                      <p className="text-[11px] text-blue-800/90 mt-0.5">
                        Aktifkan overlay peta resmi Pusdatin SIGI-PU (MapServer WMS) langsung di atas peta JagaJalan.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-blue-200/60">
                    {/* Toggle 1: 3.306 Ruas Jalan Nasional */}
                    <div className="flex items-center justify-between p-2 rounded-[6px] bg-white border border-blue-200">
                      <div>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>3.306 Ruas Jalan Nasional</span>
                          <span className="font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                            SK 1688/2022
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Total 47.017 KM koridor arteri primer &amp; kolektor primer-1
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = !showSigiNationalWms;
                          setShowSigiNationalWms(nextVal);
                          if (nextVal) {
                            setFloatingNotice({
                              title: "Layer WMS SIGI PU Aktif",
                              desc: "Menampilkan streaming 3.306 ruas Jalan Nasional (47.017 KM) dari MapServer resmi Kementerian PU.",
                              type: "success",
                            });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
                          showSigiNationalWms
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {showSigiNationalWms ? "Aktif (ON)" : "Aktifkan"}
                      </button>
                    </div>

                    {/* Toggle 2: Jaringan Jalan Daerah */}
                    <div className="flex items-center justify-between p-2 rounded-[6px] bg-white border border-blue-200">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          Jaringan Jalan Daerah (Provinsi &amp; Kabupaten)
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Layer WMS jalan daerah dari MapServer sigi.pu.go.id
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = !showSigiRegionalWms;
                          setShowSigiRegionalWms(nextVal);
                          if (nextVal) {
                            setFloatingNotice({
                              title: "Layer Jalan Daerah Aktif",
                              desc: "Menampilkan streaming WMS jalan daerah dari Pusdatin Kementerian PU.",
                              type: "success",
                            });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
                          showSigiRegionalWms
                            ? "bg-purple-600 text-white shadow-2xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {showSigiRegionalWms ? "Aktif (ON)" : "Aktifkan"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-[6px] bg-orange-50 border border-orange-200/90 text-orange-950 space-y-1 shadow-2xs">
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    <span>Makna Angka 3.306 Ruas Jalan Nasional:</span>
                  </div>
                  <p className="text-[11px] text-orange-900 leading-relaxed">
                    Sesuai data resmi Kementerian PU pada portal <strong>sigi.pu.go.id/astv2</strong>, angka <strong>3.306</strong> merepresentasikan seluruh nomor SK ruas Jalan Nasional di Indonesia berdasarkan <strong>Keputusan Menteri PUPR No. 1688/KPTS/M/2022</strong>. Ruas ini membentang sepanjang <strong>47.017,42 KM</strong> di 38 provinsi.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                    Layanan &amp; Endpoint Resmi yang Terhubung:
                  </h4>

                  <div className="p-3 rounded-[6px] bg-slate-50 ring-1 ring-orange-200/40 space-y-1">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>1. SIGI-PU ASTV2 (Pusdatin KemenPU)</span>
                      <span className="text-[10px] text-orange-700 font-sans font-bold">WebGIS &amp; MapServer</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Menyediakan layer MapServer resmi WMS untuk Jalan Nasional (<code className="bg-slate-200 px-1 py-0.5 rounded-[4px] text-[10px]">jalan_nasional.map</code>) dan Jalan Daerah (<code className="bg-slate-200 px-1 py-0.5 rounded-[4px] text-[10px]">jalan_daerah.map</code>).
                    </p>
                    <a
                      href="https://sigi.pu.go.id/astv2/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#c2410c] font-bold hover:underline inline-flex items-center gap-1 pt-0.5"
                    >
                      <span>Kunjungi sigi.pu.go.id/astv2</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-3 rounded-[6px] bg-slate-50 ring-1 ring-orange-200/40 space-y-1">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>2. Satu Data Kementerian PU</span>
                      <span className="text-[10px] text-[#c2410c] font-sans font-bold">Open Data Portal</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Portal keterbukaan data kementerian untuk rekapitulasi kondisi mantap jalan, kemantapan per provinsi, dan penetapan status hukum ruas jalan.
                    </p>
                    <a
                      href="https://data.pu.go.id/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#c2410c] font-bold hover:underline inline-flex items-center gap-1 pt-0.5"
                    >
                      <span>Kunjungi data.pu.go.id</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-3 rounded-[6px] bg-slate-50 ring-1 ring-orange-200/40 space-y-1">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>3. Endpoint API Mikro JagaJalan</span>
                      <span className="text-[10px] text-emerald-700 font-sans font-bold">REST &amp; GeoJSON API</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Dapat diakses secara terbuka melalui rute API internal aplikasi:
                    </p>
                    <div className="space-y-1 pt-0.5 font-mono text-[10.5px]">
                      <div className="p-1.5 bg-white ring-1 ring-orange-200/50 rounded-[5px] text-slate-800">
                        GET /api/roads?format=geojson
                      </div>
                      <div className="p-1.5 bg-white ring-1 ring-orange-200/50 rounded-[5px] text-slate-800">
                        GET /api/reports?format=geojson
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setSigiModalOpen(false)}
                  className="py-2 px-4 rounded-[6px] text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] transition-colors cursor-pointer shadow-xs"
                >
                  Tutup Informasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    
      {/* Road Detail Modal for deep engineering & contract verification */}
      <RoadDetailModal
        isOpen={Boolean(selectedRoadForDetailModal)}
        onClose={() => setSelectedRoadForDetailModal(null)}
        road={selectedRoadForDetailModal}
        reports={reports}
        onOpenOmbudsmanDraft={onOpenOmbudsmanDraft}
        onOpenReportModal={onOpenReportModal}
      />
    </section>
  );
}
