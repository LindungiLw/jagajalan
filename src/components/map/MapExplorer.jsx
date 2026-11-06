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
  const [selectedRegionId, setSelectedRegionId] = useState("all");
  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  const [regionTab, setRegionTab] = useState("provinces"); // "provinces" | "regions"
  const [provinceSearchQuery, setProvinceSearchQuery] = useState("");
  const [floatingNotice, setFloatingNotice] = useState(null);
  const [detectedPoint, setDetectedPoint] = useState(null);
  const [sigiModalOpen, setSigiModalOpen] = useState(false);
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

  // Aggregate road counts per authority
  const roadCounts = useMemo(() => {
    return {
      ALL: roads.length,
      NASIONAL: roads.filter((r) => r.authority === "NASIONAL").length,
      PROVINSI: roads.filter((r) => r.authority === "PROVINSI").length,
      KOTA: roads.filter((r) => r.authority === "KOTA").length,
      KABUPATEN: roads.filter((r) => r.authority === "KABUPATEN").length,
      KOTA_KAB: roads.filter((r) => r.authority === "KOTA" || r.authority === "KABUPATEN" || r.authority === "KOTA_KAB").length,
    };
  }, [roads]);

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
    setMapCenter(report.coordinates);
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

  const handleMapClick = (coords) => {
    const [lat, lng] = coords;
    const result = detectJurisdictionByCoordinates(lat, lng, roads);
    if (result) {
      setDetectedPoint(result);
      setSelectedReport(null);

      const detectedRoadEntity = {
        id: `detected-${Date.now()}`,
        isDetectedPoint: true,
        name: result.authority === "NASIONAL" && result.nearestRoad
          ? `Dekat ${result.nearestRoad.name}`
          : `Titik Geospasial [${lat.toFixed(3)}, ${lng.toFixed(3)}]`,
        code: result.authority === "NASIONAL" ? (result.nearestRoad?.code || "RUAS-NAS-DETEKSI") : "JALAN-DAERAH-DETEKSI",
        authority: result.authority,
        authorityLabel: result.authorityLabel,
        legalBasis: result.legalBasis,
        district: result.district,
        provinceName: result.provinceName,
        lengthKm: result.distanceToNearestNationalKm,
        pavementType: "Hasil Analisis Spasial JagaJalan",
        condition: "TERDATA",
        center: [lat, lng],
        coordinates: [[lat, lng]],
        leadership: result.leadership,
        problemDetails: {
          headline: `Kewenangan Penyelenggara: ${result.authorityLabel}`,
          description: `Titik koordinat [${lat.toFixed(4)}, ${lng.toFixed(4)}] berada di wilayah ${result.provinceName}. ${
            result.authority === "NASIONAL"
              ? `Berada ~${result.distanceToNearestNationalKm} KM dari koridor Jalan Nasional (${result.nearestRoad?.name || "Arteri Primer"}). Tanggung jawab pemeliharaan berada di bawah ${result.leadership.regionalHead}.`
              : `Kewenangan pemeliharaan berada di bawah ${result.leadership.regionalHead} (${result.leadership.agency}).`
          }`,
          rootCause: "Penetapan batas jurisdiksi berbasis SK Menteri PUPR No. 1688/2022 & Perda Daerah.",
          safetyImpact: "Pastikan laporan aduan masyarakat dan pengawasan anggaran ditujukan ke instansi yang tepat."
        },
        officialSources: {
          authoritySource: result.legalBasis,
          budgetSource: "Pusdatin SIGI PU & Data Daerah",
          fieldDataSource: "Analisis Geospasial Instan JagaJalan",
          transparencyUrl: "https://sigi.pu.go.id"
        }
      };

      setSelectedRoad(detectedRoadEntity);
      setActiveTab("kewenangan");
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
      <div className="absolute inset-0 z-0">
        <MapInner
          roads={filteredRoads}
          reports={filteredReports}
          selectedRoad={selectedRoad}
          selectedReport={selectedReport}
          detectedPoint={detectedPoint}
          onSelectRoad={handleSelectRoad}
          onSelectReport={handleSelectReport}
          onMapClick={handleMapClick}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          onMapReady={setMapInstance}
        />
      </div>

      {/* Click-away backdrop for floating dropdowns */}
      {(regionDropdownOpen || statusDropdownOpen || highlightDropdownOpen) && (
        <div
          className="fixed inset-0 z-[490]"
          onClick={() => {
            setRegionDropdownOpen(false);
            setStatusDropdownOpen(false);
            setHighlightDropdownOpen(false);
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

          <div className="w-px h-4 bg-slate-200/90 hidden md:block shrink-0" />

          {/* SIGI PU & GeoAPI Live Status Pill */}
          <button
            onClick={() => setSigiModalOpen(true)}
            title="Klik untuk melihat arsitektur koneksi API SIGI PUPR & Satu Data PU"
            className="hidden md:flex h-9 px-3 rounded-[6px] text-xs font-bold text-slate-700 items-center gap-1.5 hover:bg-orange-50/60 hover:text-[#c2410c] transition-colors cursor-pointer font-sans shrink-0 border border-transparent hover:border-orange-200/60"
          >
            <Layers className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />
            <span>SIGI PU</span>
          </button>
        </div>
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
          <span className="tabular-nums text-[11px]">{roads.length} ruas terdata</span>
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

      {/* 5. Right Side Modern Executive Inspector Drawer */}
      {displayItem && (
        <aside className="absolute top-3 right-3 bottom-3 w-full sm:w-[410px] lg:w-[430px] max-w-[calc(100vw-24px)] z-[500] bg-white/98 backdrop-blur-md rounded-[8px] shadow-2xl ring-1 ring-orange-200/70 flex flex-col overflow-hidden animate-fade-in pointer-events-auto font-sans">
          {/* Drawer Header */}
          <div className="px-4 py-3 border-b border-slate-100 shrink-0 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono font-bold text-slate-900 tracking-tight">
                  {currentReport?.ticketCode ? `TIKET #${currentReport.ticketCode}` : currentRoad?.code}
                </span>
                <span className="h-3 w-px bg-slate-200" aria-hidden="true" />
                <span className="text-[11px] font-medium text-slate-500">
                  {currentRoad?.authority === "NASIONAL"
                    ? "Jalan Nasional (APBN)"
                    : currentRoad?.authority === "PROVINSI"
                    ? "Jalan Provinsi (APBD)"
                    : currentRoad?.authority === "KOTA"
                    ? "Jalan Kota (APBD)"
                    : "Jalan Kabupaten (APBD)"}
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedReport(null);
                  setSelectedRoad(null);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title="Tutup Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-base font-bold font-heading text-slate-900 tracking-tight leading-snug line-clamp-1">
              {currentReport ? currentReport.roadName : currentRoad.name}
            </h2>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-[#c2410c] shrink-0" />
              <span className="truncate">
                {currentReport ? currentReport.address : `${currentRoad.district || currentRoad.provinceName} • ${currentRoad.lengthKm || 0} KM`}
              </span>
            </p>
          </div>

          {/* Drawer Body - Domain-Authentic Civic & Procurement Transparency */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 text-xs text-slate-700 font-sans">
            {/* 1. Bukti Lapangan & Analisis AI Kerusakan Jalan */}
            {(currentReport?.photoUrl || currentReport?.hazardScore || currentRoad?.condition) && (
              <div className="rounded-[6px] overflow-hidden border border-slate-200 bg-white shadow-2xs">
                {currentReport?.photoUrl ? (
                  <div className="relative w-full h-36 bg-slate-900 overflow-hidden">
                    <img
                      src={currentReport.photoUrl}
                      alt="Foto Kerusakan Jalan"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                      {currentReport?.hazardScore && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-xs flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>AI Hazard: {currentReport.hazardScore} / 100</span>
                        </span>
                      )}
                      {currentRoad?.condition && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                            currentRoad.condition === "RUSAK_BERAT"
                              ? "bg-rose-500 text-white"
                              : currentRoad.condition === "RUSAK_SEDANG"
                              ? "bg-amber-500 text-white"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {currentRoad.condition === "RUSAK_BERAT"
                            ? "Rusak Berat"
                            : currentRoad.condition === "RUSAK_SEDANG"
                            ? "Rusak Sedang"
                            : "Kondisi Mantap"}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">Status Fisik Ruas</div>
                        <div className="text-[10px] text-slate-500">Hasil Pemindaian Geospasial</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {currentRoad?.condition || "TERDATA"}
                    </span>
                  </div>
                )}

                {/* Headline & Dampak Lapangan */}
                <div className="p-3 space-y-1.5 bg-white">
                  <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug">
                    {currentReport?.problemDetails?.headline || currentReport?.categoryLabel || currentRoad?.problemDetails?.headline || "Kerusakan Lapisan Permukaan Jalan"}
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {currentReport?.problemDetails?.description || currentReport?.aiAnalysis || currentRoad?.problemDetails?.description || "Teridentifikasi deformasi permukaan dan lubang yang membutuhkan penanganan preservasi."}
                  </p>
                  {(currentReport?.problemDetails?.safetyImpact || currentRoad?.problemDetails?.safetyImpact) && (
                    <div className="pt-1.5 border-t border-slate-100 flex items-start gap-1.5 text-[10.5px] text-rose-700 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                      <span>{currentReport?.problemDetails?.safetyImpact || currentRoad?.problemDetails?.safetyImpact}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Status Akuntabilitas Respons (KemenPAN-RB & Ombudsman) */}
            <div
              className={`rounded-[6px] p-3.5 border space-y-2.5 transition-all shadow-2xs ${
                currentReport?.isResponseOverdue
                  ? "bg-rose-50/70 border-rose-200"
                  : "bg-white border-slate-200/90"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Kepatuhan Batas Waktu Respons (SLA)</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold border tabular-nums ${
                    currentReport?.isResponseOverdue
                      ? "bg-rose-100 text-rose-800 border-rose-300"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {currentReport?.isResponseOverdue ? "Terlambat Tanggapan" : "Sesuai Batas Waktu"}
                </span>
              </div>

              {/* SLA Multi-Step Horizontal Flow */}
              <div className="grid grid-cols-3 gap-1.5 text-center pt-1">
                <div className="p-2 rounded-[6px] bg-white border border-slate-200/80">
                  <div className="text-[9.5px] text-slate-400">1. Laporan Masuk</div>
                  <div className="font-bold text-slate-800 text-[11px] font-sans mt-0.5">
                    {currentReport?.filedAt || "14 Okt 2026"}
                  </div>
                  <div className="text-[9px] text-emerald-600 font-bold mt-0.5">✓ Terverifikasi</div>
                </div>

                <div className="p-2 rounded-[6px] bg-white border border-slate-200/80">
                  <div className="text-[9.5px] text-slate-400">2. Batas Tenggat</div>
                  <div className="font-bold text-slate-800 text-[11px] font-sans mt-0.5">
                    {currentReport?.deadlineAt || "28 Okt 2026"}
                  </div>
                  <div className="text-[9px] text-slate-500 font-medium mt-0.5">Tenggat Resmi</div>
                </div>

                <div
                  className={`p-2 rounded-[6px] border ${
                    currentReport?.isResponseOverdue
                      ? "bg-rose-100/60 border-rose-300 text-rose-900"
                      : "bg-emerald-50 border-emerald-200 text-emerald-900"
                  }`}
                >
                  <div className="text-[9.5px] text-slate-500">3. Status Lapangan</div>
                  <div className="font-bold text-[11px] font-sans mt-0.5">
                    {currentReport?.isResponseOverdue
                      ? `+${currentReport?.daysOverdue || 6} Hari Kerja`
                      : "Dalam Proses"}
                  </div>
                  <div className={`text-[9px] font-bold mt-0.5 ${currentReport?.isResponseOverdue ? "text-rose-700" : "text-emerald-700"}`}>
                    {currentReport?.isResponseOverdue ? "Macet / Lewat" : "Tepat Waktu"}
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed pt-0.5">
                Berdasarkan <strong>UU No. 25/2009</strong> &amp; <strong>PermenPAN-RB No. 62/2018</strong>, instansi wajib memberikan kepastian tanggapan tindak lanjut. Keterlambatan ini memenuhi syarat rekomendasi Ombudsman RI.
              </p>
            </div>

            {/* 3. Transparansi Anggaran & Tender LPSE */}
            <div className="rounded-[6px] p-3.5 bg-white ring-1 ring-orange-200/60 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#c2410c]" />
                  <span className="text-[11.5px] font-bold text-slate-900">Alokasi Anggaran &amp; LPSE</span>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-[4px] border border-slate-200 tabular-nums">
                  TA {budgetData?.fiscalYear || "2026"} • {currentRoad?.authority === "NASIONAL" ? "APBN" : "APBD"}
                </span>
              </div>

              {/* 2 Big Scoreboard Cards */}
              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="p-2.5 rounded-[6px] bg-slate-50 ring-1 ring-orange-200/50 space-y-0.5">
                  <div className="text-[10px] text-slate-500 font-medium">Pagu Anggaran (HPS)</div>
                  <div className="text-base sm:text-lg font-black text-slate-900 font-sans tabular-nums">
                    {formatCurrencyCompact(paguRp)}
                  </div>
                  <div className="text-[9.5px] text-slate-400">Batas lelang SiRUP</div>
                </div>

                <div className="p-2.5 rounded-[6px] bg-[#c2410c] text-white space-y-0.5 shadow-2xs">
                  <div className="text-[10px] text-orange-100 font-medium">Nilai Kontrak (SPK)</div>
                  <div className="text-base sm:text-lg font-black text-white font-sans tabular-nums">
                    {formatCurrencyCompact(contractValueRp)}
                  </div>
                  <div className="text-[9.5px] text-orange-100 font-bold flex items-center gap-0.5">
                    <span>Hemat {formatCurrencyCompact(savingsRp)} ({savingsPct}%)</span>
                  </div>
                </div>
              </div>

              {/* Progres Pengerjaan Fisik vs Nilai Kontrak */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-semibold text-slate-700">Perbandingan Fisik vs Serapan SPK</span>
                  <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                    Fisik {physicalProgressPct}% • SPK {contractCommitmentPct}%
                  </span>
                </div>

                <div className="space-y-1.5">
                  {/* Fisik Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[9.5px] text-slate-500 mb-0.5">
                      <span>Realisasi Fisik Lapangan</span>
                      <span className="font-bold text-slate-800 tabular-nums">{physicalProgressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-[#c2410c] rounded-full transition-all duration-500"
                        style={{ width: `${physicalProgressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* SPK Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[9.5px] text-slate-500 mb-0.5">
                      <span>Penyerapan Anggaran Terikat SPK</span>
                      <span className="font-bold text-slate-800 tabular-nums">{contractCommitmentPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${contractCommitmentPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Audit Anomaly Callout jika fisik tertinggal */}
                {contractCommitmentPct - physicalProgressPct > 20 && (
                  <div className="p-2 rounded-[6px] bg-amber-50 border border-amber-200 text-amber-900 text-[10px] flex items-start gap-1.5 leading-relaxed font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Potensi Deviasi Pekerjaan:</strong> Penyerapan dana kontrak ({contractCommitmentPct}%) berjalan lebih cepat daripada capaian fisik di lapangan ({physicalProgressPct}%).
                    </span>
                  </div>
                )}

                {/* Info Kontraktor */}
                <div className="pt-1.5 flex items-center justify-between text-[10.5px] text-slate-600">
                  <span className="text-slate-400">Pemenang Tender:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[210px]">
                    {budgetData?.contractor || "PT Karya Deli Mandiri"}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Instansi Penanggung Jawab Hukum (Wewenang Mutlak) */}
            <div className="rounded-[6px] p-3.5 bg-slate-50 ring-1 ring-orange-200/50 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icon/hukum_icon.png"
                    alt=""
                    width={14}
                    height={14}
                    style={{ width: "14px", height: "14px" }}
                    className="w-3.5 h-3.5 object-contain"
                  />
                  <span>Instansi Penanggung Jawab</span>
                </span>
                <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Wewenang Mutlak
                </span>
              </div>

              <div className="font-extrabold text-slate-900 text-xs sm:text-[13px] leading-snug">
                {currentReport?.leadership?.agency || currentRoad?.leadership?.agency || "Dinas PUPR Terkait"}
              </div>

              <div className="space-y-1 pt-1 border-t border-slate-200/60 text-[10.5px]">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Pimpinan / PIC:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[210px]">
                    {currentReport?.leadership?.regionalHead || currentRoad?.leadership?.regionalHead || "Kepala Daerah"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Dasar Hukum:</span>
                  <span
                    className="font-medium text-slate-700 truncate max-w-[210px]"
                    title={currentReport?.legalBasis || currentRoad?.officialSources?.authoritySource || "UU No. 2 Tahun 2022"}
                  >
                    {currentReport?.legalBasis || currentRoad?.officialSources?.authoritySource || "UU No. 2 Tahun 2022"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-3 sm:p-3.5 border-t border-slate-100 space-y-2 bg-white shrink-0 font-sans">
            <button
              onClick={() => {
                const targetRoad = (currentReport?.roadSegmentId && roads.find((r) => r.id === currentReport.roadSegmentId)) || currentRoad;
                setSelectedRoadForDetailModal(targetRoad);
              }}
              className="w-full py-2 px-3.5 rounded-[6px] text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200/90 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-[#c2410c]" />
              <span>Lihat Detail Lengkap Ruas</span>
            </button>

            {/* Action 2: Report Damage */}
            <button
              onClick={() => onOpenReportModal()}
              className="w-full py-2 px-3.5 rounded-[6px] text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Laporkan Kerusakan di Sini</span>
            </button>

            {/* Action 3: Ombudsman Draft (if overdue) */}
            {currentReport?.isResponseOverdue && (
              <button
                onClick={() => onOpenOmbudsmanDraft(currentReport)}
                className="w-full py-1.5 px-3 rounded-[6px] text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5 text-rose-600" />
                <span>Unduh Draf Laporan Ombudsman RI</span>
              </button>
            )}
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

              <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="p-3 rounded-[6px] bg-orange-50 border border-orange-200/90 text-orange-950 space-y-1 shadow-2xs">
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    <span>Geometri Berbasis Vektor Jalan Nyata</span>
                  </div>
                  <p className="text-[11px] text-orange-900">
                    Setiap ruas jalan pada peta JagaJalan memuat <strong>100+ titik koordinat polilin</strong> yang mengikuti lengkungan aspal jalan asli berdasarkan citra satelit dan jaringan jalan nasional/daerah.
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
                        GET /api/roads?format=json
                      </div>
                      <div className="p-1.5 bg-white ring-1 ring-orange-200/50 rounded-[5px] text-slate-800">
                        GET /api/roads?format=geojson
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
