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
} from "lucide-react";
import {
  INDONESIA_REGIONS,
  INDONESIA_PROVINCES,
  PROVINCIAL_NETWORK_STATS,
  detectJurisdictionByCoordinates,
} from "@/data/roadsData";
import RoadDetailModal from "@/components/modals/RoadDetailModal";

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
    if (authorityFilter === "KOTA_KAB") return "Jalan Kota/Kabupaten";
    return "Status Jalan";
  }, [authorityFilter]);

  // Active item to display in drawer (prioritize report if selected, fallback to road)
  const displayItem = selectedReport || selectedRoad;
  const currentRoad = selectedRoad || roads[0];
  const currentReport = selectedReport;

  // Budget calculations
  const budgetData = currentRoad?.budget;
  const savingsRp = budgetData ? Math.max(0, (budgetData.paguRp || 0) - (budgetData.contractValueRp || 0)) : 0;
  const savingsPct = budgetData && budgetData.paguRp ? ((savingsRp / budgetData.paguRp) * 100).toFixed(1) : "0.0";

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
      {(regionDropdownOpen || statusDropdownOpen) && (
        <div
          className="fixed inset-0 z-[490]"
          onClick={() => {
            setRegionDropdownOpen(false);
            setStatusDropdownOpen(false);
          }}
        />
      )}

      {/* 2. Top-Left Unified GIS Command Toolbar */}
      <div className="absolute top-3 left-3 z-[500] flex flex-col gap-1.5 max-w-[calc(100vw-24px)] lg:max-w-3xl pointer-events-auto font-sans">
        {/* Main Floating Control Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-white/95 backdrop-blur-md rounded-[5px] shadow-md border border-slate-200/90 flex-wrap sm:flex-nowrap">
          {/* Interactive Region & Province Dropdown */}
          <div className="relative inline-block font-sans shrink-0">
            <button
              onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
              className="px-2.5 py-1.5 rounded-[4px] text-xs font-semibold text-slate-800 flex items-center gap-1.5 hover:bg-slate-50 transition-all cursor-pointer font-sans"
            >
              <Globe className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />
              <span className="font-bold text-slate-900 max-w-[110px] sm:max-w-[140px] truncate">
                {selectedProvinceId
                  ? INDONESIA_PROVINCES.find((p) => p.id === selectedProvinceId)?.name
                  : INDONESIA_REGIONS.find((r) => r.id === selectedRegionId)?.name || "Seluruh Indonesia"}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {regionDropdownOpen && (
              <div
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-full left-0 mt-1.5 w-80 sm:w-96 rounded-[5px] bg-white shadow-2xl border border-slate-200 py-2 text-xs text-slate-700 z-[600] animate-fade-in font-sans max-h-96 flex flex-col"
              >
                {/* Tab Switcher: 38 Provinsi vs Pulau/Koridor */}
                <div className="px-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex bg-slate-100 p-0.5 rounded-[4px] text-[10.5px]">
                    <button
                      onClick={() => setRegionTab("provinces")}
                      className={`px-2.5 py-1 rounded-[3px] font-semibold transition-all cursor-pointer ${
                        regionTab === "provinces"
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      38 Provinsi ({INDONESIA_PROVINCES.length})
                    </button>
                    <button
                      onClick={() => setRegionTab("regions")}
                      className={`px-2.5 py-1 rounded-[3px] font-semibold transition-all cursor-pointer ${
                        regionTab === "regions"
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
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
                            <div className="flex items-center gap-1.5">
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

          <div className="w-px h-5 bg-slate-200 hidden sm:block shrink-0" />

          {/* Search Bar */}
          <div className="relative flex-1 min-w-[150px] sm:min-w-[190px] flex items-center gap-1.5 px-2 py-1 font-sans">
            <img src="/icon/search_icon.png" alt="" className="w-3.5 h-3.5 object-contain shrink-0" />
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
                className="p-0.5 rounded-[4px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200 hidden sm:block shrink-0" />

          {/* Status Jalan Filter Dropdown */}
          <div className="relative inline-block font-sans shrink-0">
            <button
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="px-2.5 py-1.5 rounded-[4px] text-xs font-semibold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50 transition-all cursor-pointer font-sans"
            >
              <Shield className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />
              <span>{authorityFilterLabel}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {/* Dropdown Options */}
            {statusDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-56 rounded-[5px] bg-white shadow-xl border border-slate-200 py-1.5 text-xs text-slate-700 z-[600] animate-fade-in font-sans">
                <button
                  onClick={() => {
                    setAuthorityFilter("ALL");
                    setStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center justify-between cursor-pointer ${
                    authorityFilter === "ALL" ? "font-bold text-[#c2410c] bg-orange-50/50" : ""
                  }`}
                >
                  <span>Semua Status Jalan</span>
                  {authorityFilter === "ALL" && <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]" />}
                </button>
                <button
                  onClick={() => {
                    setAuthorityFilter("NASIONAL");
                    setStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer ${
                    authorityFilter === "NASIONAL" ? "font-bold text-blue-700 bg-blue-50/60" : ""
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span>Jalan Nasional (KemenPU)</span>
                </button>
                <button
                  onClick={() => {
                    setAuthorityFilter("PROVINSI");
                    setStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer ${
                    authorityFilter === "PROVINSI" ? "font-bold text-purple-700 bg-purple-50/60" : ""
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  <span>Jalan Provinsi (Bina Marga)</span>
                </button>
                <button
                  onClick={() => {
                    setAuthorityFilter("KOTA_KAB");
                    setStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer ${
                    authorityFilter === "KOTA_KAB" ? "font-bold text-teal-700 bg-teal-50/60" : ""
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                  <span>Jalan Kota / Kabupaten (PUPR)</span>
                </button>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200 hidden md:block shrink-0" />

          {/* SIGI PU & GeoAPI Live Status Pill */}
          <button
            onClick={() => setSigiModalOpen(true)}
            title="Klik untuk melihat arsitektur koneksi API SIGI PUPR & Satu Data PU"
            className="hidden md:flex px-2 py-1.5 rounded-[4px] text-xs font-semibold text-slate-700 items-center gap-1.5 hover:bg-slate-50 transition-all cursor-pointer font-sans shrink-0"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-700 font-bold text-[11px]">SIGI PU</span>
          </button>
        </div>

        {/* Quick Authority Filter Badges (Row 2) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          <button
            onClick={() => setAuthorityFilter("ALL")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
              authorityFilter === "ALL"
                ? "bg-[#c2410c] border-[#c2410c] text-white shadow-xs font-semibold"
                : "bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/90 hover:bg-slate-50"
            }`}
          >
            <span>Semua Ruas</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-sans tabular-nums font-semibold ${
              authorityFilter === "ALL" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              {roadCounts.ALL}
            </span>
          </button>

          <button
            onClick={() => setAuthorityFilter("NASIONAL")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
              authorityFilter === "NASIONAL"
                ? "bg-[#c2410c] border-[#c2410c] text-white shadow-xs font-semibold"
                : "bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/90 hover:bg-slate-50"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${authorityFilter === "NASIONAL" ? "bg-white" : "bg-slate-700"}`} />
            <span>Jalan Nasional</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-sans tabular-nums font-semibold ${
              authorityFilter === "NASIONAL" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              {roadCounts.NASIONAL}
            </span>
          </button>

          <button
            onClick={() => setAuthorityFilter("PROVINSI")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
              authorityFilter === "PROVINSI"
                ? "bg-[#c2410c] border-[#c2410c] text-white shadow-xs font-semibold"
                : "bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/90 hover:bg-slate-50"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${authorityFilter === "PROVINSI" ? "bg-white" : "bg-amber-600"}`} />
            <span>Jalan Provinsi</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-sans tabular-nums font-semibold ${
              authorityFilter === "PROVINSI" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              {roadCounts.PROVINSI}
            </span>
          </button>

          <button
            onClick={() => setAuthorityFilter("KOTA")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
              authorityFilter === "KOTA"
                ? "bg-[#c2410c] border-[#c2410c] text-white shadow-xs font-semibold"
                : "bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/90 hover:bg-slate-50"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${authorityFilter === "KOTA" ? "bg-white" : "bg-orange-500"}`} />
            <span>Jalan Kota</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-sans tabular-nums font-semibold ${
              authorityFilter === "KOTA" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              {roadCounts.KOTA}
            </span>
          </button>

          <button
            onClick={() => setAuthorityFilter("KABUPATEN")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
              authorityFilter === "KABUPATEN"
                ? "bg-[#c2410c] border-[#c2410c] text-white shadow-xs font-semibold"
                : "bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/90 hover:bg-slate-50"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${authorityFilter === "KABUPATEN" ? "bg-white" : "bg-stone-500"}`} />
            <span>Jalan Kabupaten</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-sans tabular-nums font-semibold ${
              authorityFilter === "KABUPATEN" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              {roadCounts.KABUPATEN}
            </span>
          </button>

          <div className="w-px h-5 bg-slate-300 mx-0.5 shrink-0" />

          {/* Special Quick Toggles */}
          <button
            onClick={() => setHighlightFilter(highlightFilter === "OVERDUE" ? "ALL" : "OVERDUE")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
              highlightFilter === "OVERDUE"
                ? "bg-rose-600 border-rose-600 text-white shadow-xs"
                : "bg-white/95 backdrop-blur-md text-rose-700 border-rose-200 hover:bg-rose-50"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${highlightFilter === "OVERDUE" ? "bg-white" : "bg-rose-600 animate-pulse"}`} />
            <span>Overdue SLA</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] tabular-nums font-bold ${
              highlightFilter === "OVERDUE" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-800"
            }`}>
              {overdueRoadCount}
            </span>
          </button>

          <button
            onClick={() => setHighlightFilter(highlightFilter === "CRITICAL" ? "ALL" : "CRITICAL")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
              highlightFilter === "CRITICAL"
                ? "bg-amber-600 border-amber-600 text-white shadow-xs"
                : "bg-white/95 backdrop-blur-md text-amber-800 border-amber-200 hover:bg-amber-50"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${highlightFilter === "CRITICAL" ? "bg-white" : "bg-amber-600"}`} />
            <span>Rusak Berat (AI &gt;80)</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] tabular-nums font-bold ${
              highlightFilter === "CRITICAL" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900"
            }`}>
              {criticalRoadCount}
            </span>
          </button>

          <button
            onClick={() => setHighlightFilter(highlightFilter === "BUDGET" ? "ALL" : "BUDGET")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
              highlightFilter === "BUDGET"
                ? "bg-emerald-700 border-emerald-700 text-white shadow-xs"
                : "bg-white/95 backdrop-blur-md text-emerald-800 border-emerald-200 hover:bg-emerald-50"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${highlightFilter === "BUDGET" ? "bg-white" : "bg-emerald-600"}`} />
            <span>Paket LPSE</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] tabular-nums font-bold ${
              highlightFilter === "BUDGET" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-900"
            }`}>
              {budgetRoadCount}
            </span>
          </button>
        </div>
      </div>

      {/* Floating Notice / Province Context Banner */}
      {floatingNotice && (
        <div className="absolute top-18 left-4 z-[500] max-w-sm sm:max-w-md bg-white/95 backdrop-blur-md rounded-[6px] shadow-xl border border-slate-200/90 p-3 flex items-start gap-2.5 animate-fade-in font-sans pointer-events-auto">
          <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 mt-0.5">
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

      {/* City Transparency Context Banner */}
      {authorityFilter === "KOTA" && (
        <div className="hidden sm:block absolute bottom-[142px] left-4 z-[500] max-w-sm bg-white/95 backdrop-blur-md rounded-[5px] shadow-lg border border-orange-200/90 p-3 animate-fade-in font-sans pointer-events-auto">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-[5px] bg-orange-100 text-orange-800 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-1 text-left flex-1 min-w-0">
              <div className="text-[11px] font-bold text-slate-900 flex items-center justify-between">
                <span>Jalan Kota Se-Indonesia</span>
                <span className="text-[9px] font-sans tabular-nums font-bold bg-orange-50 text-orange-950 px-1.5 py-0.2 rounded-[4px] border border-orange-200 shadow-2xs">
                  98 Pemkot
                </span>
              </div>
              <p className="text-[10px] text-slate-600 leading-snug">
                Total Jaringan: <strong className="text-orange-950 font-sans tabular-nums">~52.000 KM</strong> di bawah Walikota & Dinas PUPR Kota. Isu utama: Kerapatan drainase perkotaan, bekas galian pipa/kabel fiber utilitas, serta batas muatan MST 8-10 Ton.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Regency Transparency Context Banner */}
      {authorityFilter === "KABUPATEN" && (
        <div className="hidden sm:block absolute bottom-[142px] left-4 z-[500] max-w-sm bg-white/95 backdrop-blur-md rounded-[5px] shadow-lg border border-stone-200/90 p-3 animate-fade-in font-sans pointer-events-auto">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-[5px] bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-1 text-left flex-1 min-w-0">
              <div className="text-[11px] font-bold text-slate-900 flex items-center justify-between">
                <span>Jalan Kabupaten Se-Indonesia</span>
                <span className="text-[9px] font-sans tabular-nums font-bold bg-stone-50 text-stone-900 px-1.5 py-0.2 rounded-[4px] border border-stone-200 shadow-2xs">
                  416 Pemkab & IJD
                </span>
              </div>
              <p className="text-[10px] text-slate-600 leading-snug">
                Total Jaringan: <strong className="text-stone-900 font-sans tabular-nums">~393.000 KM</strong> (tulang punggung konektivitas antar-kecamatan & sentra pangan). Dikelola Dinas PUPR Kabupaten dan didukung Inpres Jalan Daerah (IJD) Kementerian PU.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Bottom-Left Stack: Zoom Controls, Context Banners & Map Legend */}
      <div className="absolute bottom-3 left-3 z-[500] flex flex-col gap-2 pointer-events-none font-sans max-w-[280px]">
        {/* Provincial Transparency Context Banner */}
        {authorityFilter === "PROVINSI" && (
          <div className="hidden sm:block bg-white/95 backdrop-blur-md rounded-[5px] shadow-md border border-amber-200/90 p-2.5 animate-fade-in pointer-events-auto">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-[4px] bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-3 h-3" />
              </div>
              <div className="space-y-0.5 text-left flex-1 min-w-0">
                <div className="text-[10.5px] font-bold text-slate-900 flex items-center justify-between">
                  <span>Jalan Provinsi</span>
                  <span className="text-[8.5px] font-sans tabular-nums font-bold bg-amber-50 text-amber-950 px-1 py-0.2 rounded border border-amber-200 shadow-2xs">
                    38 Pemprov
                  </span>
                </div>
                <p className="text-[9.5px] text-slate-600 leading-tight">
                  <strong className="text-amber-950 font-sans tabular-nums">54.544 KM</strong> jaringan resmi di bawah kewenangan Pemprov.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* National Transparency Context Banner */}
        {authorityFilter === "NASIONAL" && (
          <div className="hidden sm:block bg-white/95 backdrop-blur-md rounded-[5px] shadow-md border border-orange-200/90 p-2.5 animate-fade-in pointer-events-auto">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-[4px] bg-orange-100 text-orange-800 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-3 h-3" />
              </div>
              <div className="space-y-0.5 text-left flex-1 min-w-0">
                <div className="text-[10.5px] font-bold text-slate-900 flex items-center justify-between">
                  <span>Jalan Arteri Nasional</span>
                  <span className="text-[8.5px] font-sans font-bold bg-orange-50 text-orange-950 px-1 py-0.2 rounded border border-orange-200 shadow-2xs">
                    KemenPU
                  </span>
                </div>
                <p className="text-[9.5px] text-slate-600 leading-tight">
                  <strong className="text-orange-950 font-sans tabular-nums">47.017 KM</strong> di bawah SK MenPUPR No. 1688/2022.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Zoom & Reset Location Controls */}
        <div className="flex flex-col gap-1 bg-white/95 backdrop-blur-md rounded-[5px] shadow-md border border-slate-200/90 p-1 pointer-events-auto w-fit">
          <button
            onClick={() => mapInstance?.zoomIn()}
            title="Perbesar Peta"
            className="w-7 h-7 rounded-[4px] flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => mapInstance?.zoomOut()}
            title="Perkecil Peta"
            className="w-7 h-7 rounded-[4px] flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <div className="w-full h-px bg-slate-200 my-0.5" />
          <button
            onClick={handleResetLocation}
            title="Pusatkan Kembali Peta"
            className="w-7 h-7 rounded-[4px] flex items-center justify-center text-slate-700 hover:text-[#c2410c] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom-Left Floating Legend */}
        <div className="hidden sm:block pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-[5px] shadow-md border border-slate-200/90 p-2.5 text-[10.5px] space-y-1.5 min-w-[175px]">
            <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider pb-0.5">
              Kewenangan Ruas
            </div>
            <div className="flex items-center gap-2 font-medium text-slate-700 text-[10px]">
              <span className="w-4 h-1.5 rounded-[2px] bg-blue-600" />
              <span>Jalan Nasional (KemenPU)</span>
            </div>
            <div className="flex items-center gap-2 font-medium text-slate-700 text-[10px]">
              <span className="w-4 h-1.5 rounded-[2px] bg-purple-600" />
              <span>Jalan Provinsi (Pemprov)</span>
            </div>
            <div className="flex items-center gap-2 font-medium text-slate-700 text-[10px]">
              <span className="w-4 h-1.5 rounded-[2px] bg-teal-600" />
              <span>Jalan Kota (Pemkot)</span>
            </div>
            <div className="flex items-center gap-2 font-medium text-slate-700 text-[10px]">
              <span className="w-4 h-1.5 rounded-[2px] bg-emerald-600" />
              <span>Jalan Kabupaten (Pemkab)</span>
            </div>
          </div>
          <div className="text-[9px] text-slate-500 font-medium pl-1 pt-1">
            © OpenStreetMap • SIGI PU
          </div>
        </div>
      </div>

      {/* 4. Bottom-Center Floating Stats Card */}
      <div className={`hidden md:flex absolute bottom-3 z-[480] bg-white/95 backdrop-blur-md rounded-[5px] shadow-md border border-slate-200/90 px-3 py-1.5 items-center gap-3 text-xs font-semibold text-slate-700 pointer-events-auto font-sans transition-all duration-300 ${
        displayItem
          ? "left-[210px] xl:left-1/2 xl:-translate-x-1/2"
          : "left-1/2 -translate-x-1/2"
      }`}>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-[3px] bg-[#c2410c] text-white flex items-center justify-center text-[9px] font-black">
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

      {/* 5. Right Side Concise & Target-Oriented Inspector Drawer */}
      {displayItem && (
        <aside className="absolute top-3 right-3 bottom-3 w-full sm:w-[380px] lg:w-[400px] max-w-[calc(100vw-24px)] z-[500] bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-fade-in pointer-events-auto font-sans">
          {/* Drawer Header */}
          <div className="px-4 py-3 border-b border-slate-100 shrink-0 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  currentRoad?.authority === "NASIONAL"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : currentRoad?.authority === "PROVINSI"
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : currentRoad?.authority === "KOTA"
                    ? "bg-teal-50 text-teal-700 border-teal-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  {currentRoad?.authority === "NASIONAL"
                    ? "JALAN NASIONAL • APBN"
                    : currentRoad?.authority === "PROVINSI"
                    ? "JALAN PROVINSI • APBD"
                    : currentRoad?.authority === "KOTA"
                    ? "JALAN KOTA • APBD"
                    : "JALAN KABUPATEN • APBD"}
                </span>

                {currentReport?.ticketCode ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tabular-nums bg-slate-100 text-slate-700 border border-slate-200">
                    TIKET {currentReport.ticketCode}
                  </span>
                ) : currentRoad?.code ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tabular-nums bg-slate-100 text-slate-700 border border-slate-200">
                    {currentRoad.code}
                  </span>
                ) : null}
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

          {/* Drawer Body - Concise, Single-Glance Information */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs text-slate-700 font-sans">
            {/* 1. Foto Lapangan & Deteksi Tingkat Bahaya */}
            {(currentReport?.photoUrl || currentReport?.hazardScore || currentRoad?.condition) && (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs group">
                {currentReport?.photoUrl ? (
                  <img
                    src={currentReport.photoUrl}
                    alt="Foto Kerusakan Jalan"
                    className="w-full h-36 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-24 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400">
                    <span className="text-[11px] font-medium">Data Visual Ruas Terverifikasi</span>
                  </div>
                )}

                {/* Floating Chips */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                  {currentReport?.hazardScore && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-600/95 text-white backdrop-blur-xs shadow-xs flex items-center gap-1">
                      <img src="/icon/warning_icon.png" alt="" className="w-3.5 h-3.5 object-contain" />
                      <span>Bahaya: {currentReport.hazardScore} / 100</span>
                    </span>
                  )}
                  {currentRoad?.condition && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-xs shadow-xs ${
                      currentRoad.condition === "RUSAK_BERAT"
                        ? "bg-rose-500/90 text-white"
                        : currentRoad.condition === "RUSAK_SEDANG"
                        ? "bg-amber-500/90 text-white"
                        : "bg-emerald-600/90 text-white"
                    }`}>
                      {currentRoad.condition === "RUSAK_BERAT"
                        ? "Rusak Berat"
                        : currentRoad.condition === "RUSAK_SEDANG"
                        ? "Rusak Sedang"
                        : "Mantap"}
                    </span>
                  )}
                </div>

                {/* Headline Masalah Ringkas */}
                {(currentReport?.problemDetails?.headline || currentReport?.categoryLabel || currentRoad?.problemDetails?.headline) && (
                  <div className="p-2.5 bg-white/95 backdrop-blur-xs border-t border-slate-100">
                    <p className="text-[11.5px] font-bold text-slate-900 leading-snug">
                      {currentReport?.problemDetails?.headline || currentReport?.categoryLabel || currentRoad?.problemDetails?.headline}
                    </p>
                    <p className="text-[10.5px] text-slate-500 line-clamp-2 mt-0.5">
                      {currentReport?.problemDetails?.description || currentReport?.aiAnalysis || currentRoad?.problemDetails?.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 2. Instansi Penanggung Jawab Hukum (Wewenang Mutlak) */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
              <div className="flex items-center justify-between text-slate-500 text-[10.5px]">
                <span className="font-semibold uppercase tracking-wider flex items-center gap-1 text-slate-600">
                  <img src="/icon/hukum_icon.png" alt="" className="w-3.5 h-3.5 object-contain" />
                  <span>Instansi Penanggung Jawab</span>
                </span>
                <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  Wewenang Mutlak
                </span>
              </div>

              <div className="font-bold text-slate-900 text-xs">
                {currentReport?.leadership?.agency || currentRoad?.leadership?.agency || "Dinas PUPR Terkait"}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10.5px] text-slate-600">
                <span>Pejabat / Pimpinan:</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px]">
                  {currentReport?.leadership?.regionalHead || currentRoad?.leadership?.regionalHead || "Kepala Daerah"}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Dasar Hukum:</span>
                <span className="font-medium text-slate-700 truncate max-w-[200px]" title={currentReport?.legalBasis || currentRoad?.officialSources?.authoritySource || "UU No. 2 Tahun 2022"}>
                  {currentReport?.legalBasis || currentRoad?.officialSources?.authoritySource || "UU No. 2 Tahun 2022"}
                </span>
              </div>
            </div>

            {/* 3. Alokasi Anggaran & LPSE Terkait */}
            {(budgetData || currentReport?.matchingBudget) && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-semibold uppercase tracking-wider flex items-center gap-1 text-slate-600">
                    <img src="/icon/financial.png" alt="" className="w-3.5 h-3.5 object-contain" />
                    <span>Anggaran & Data LPSE</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200 tabular-nums">
                    TA {budgetData?.fiscalYear || currentReport?.matchingBudget?.fiscalYear || "2024"}
                  </span>
                </div>

                {/* Scoreboard Nilai Pagu vs Kontrak */}
                <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <div className="text-[10px] text-slate-500">Pagu Anggaran</div>
                    <div className="font-bold text-slate-900 text-xs tabular-nums">
                      {budgetData?.paguRp
                        ? `Rp ${(budgetData.paguRp / 1e9).toFixed(2)} M`
                        : currentReport?.matchingBudget?.paguRp
                        ? `Rp ${(currentReport.matchingBudget.paguRp / 1e9).toFixed(2)} M`
                        : "Rp 0"}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <div className="text-[10px] text-slate-500">Nilai Kontrak</div>
                    <div className="font-bold text-slate-900 text-xs tabular-nums">
                      {budgetData?.contractValueRp
                        ? `Rp ${(budgetData.contractValueRp / 1e9).toFixed(2)} M`
                        : currentReport?.matchingBudget?.contractValueRp
                        ? `Rp ${(currentReport.matchingBudget.contractValueRp / 1e9).toFixed(2)} M`
                        : "Rp 0"}
                    </div>
                  </div>
                </div>

                {/* Pelaksana & Progres */}
                <div className="space-y-1 pt-1 border-t border-slate-200/60 text-[10.5px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Pelaksana:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[200px]">
                      {budgetData?.contractor || currentReport?.matchingBudget?.contractor || "Dalam Proses Tender"}
                    </span>
                  </div>

                  {(budgetData?.physicalProgressPct !== undefined || currentReport?.matchingBudget?.physicalProgressPct !== undefined) && (
                    <div className="space-y-1 pt-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Progres Fisik:</span>
                        <span className="font-bold text-emerald-700 tabular-nums">
                          {budgetData?.physicalProgressPct ?? currentReport?.matchingBudget?.physicalProgressPct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${Math.min(100, budgetData?.physicalProgressPct ?? currentReport?.matchingBudget?.physicalProgressPct ?? 0)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Status Aduan & SLA (Khusus jika ada laporan) */}
            {currentReport && (
              <div className={`p-3 rounded-xl border space-y-1.5 ${
                currentReport.isResponseOverdue
                  ? "bg-rose-50/60 border-rose-200"
                  : "bg-slate-50 border-slate-200/90"
              }`}>
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-semibold uppercase tracking-wider flex items-center gap-1 text-slate-600">
                    <img src="/icon/time.png" alt="" className="w-3.5 h-3.5 object-contain" />
                    <span>SLA Respons KemenPAN-RB</span>
                  </span>
                  <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded border ${
                    currentReport.isResponseOverdue
                      ? "bg-rose-100 text-rose-800 border-rose-300"
                      : "bg-amber-100 text-amber-800 border-amber-300"
                  }`}>
                    {currentReport.isResponseOverdue ? "Terlambat Tanggapan" : "Dalam Batas Waktu"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-slate-600">Status 14 Hari Kerja:</span>
                  <span className={`font-bold tabular-nums ${
                    currentReport.isResponseOverdue ? "text-rose-700" : "text-amber-700"
                  }`}>
                    {currentReport.isResponseOverdue
                      ? `Lewat ${currentReport.daysOverdue || 4} Hari dari Batas Waktu`
                      : "Menunggu Tindak Lanjut Instansi"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-3 sm:p-3.5 border-t border-slate-100 space-y-2 bg-white shrink-0 font-sans">
            <button
              onClick={() => {
                const targetRoad = (currentReport?.roadSegmentId && roads.find((r) => r.id === currentReport.roadSegmentId)) || currentRoad;
                setSelectedRoadForDetailModal(targetRoad);
              }}
              className="w-full py-2 px-3.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200/90 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-[#c2410c]" />
              <span>Lihat Detail Lengkap Ruas</span>
            </button>

            {/* Action 2: Report Damage */}
            <button
              onClick={() => onOpenReportModal()}
              className="w-full py-2 px-3.5 rounded-xl text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Laporkan Kerusakan di Sini</span>
            </button>

            {/* Action 3: Ombudsman Draft (if overdue) */}
            {currentReport?.isResponseOverdue && (
              <button
                onClick={() => onOpenOmbudsmanDraft(currentReport)}
                className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5 text-rose-600" />
                <span>Unduh Draf Laporan Ombudsman RI</span>
              </button>
            )}
          </div>
        </aside>
      )}

      {/* 7. Modal Penjelasan Arsitektur SIGI PU & GeoAPI */}
      {sigiModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-[5px] shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-bold text-sm font-heading">
                  Integrasi SIGI PU & GeoAPI Geospasial
                </h3>
              </div>
              <button
                onClick={() => setSigiModalOpen(false)}
                className="p-1 rounded-[4px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 rounded-[5px] bg-orange-50 border border-orange-200/90 text-orange-950 space-y-1 shadow-2xs">
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  <span>Geometri Berbasis Vektor Jalan Nyata</span>
                </div>
                <p className="text-[11px] text-orange-900">
                  Seluruh garis jalan pada peta JagaJalan <strong>bukan digambar manual atau garis perkiraan lurus</strong>, melainkan memuat 100+ koordinat kurva fisik presisi tinggi yang melacak badan aspal jalan raya asli di satelit dan jaringan jalan nasional/daerah.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  Layanan & Endpoint Resmi yang Terhubung:
                </h4>

                <div className="p-3 rounded-[5px] bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>1. SIGI-PU ASTV2 (Pusdatin KemenPU)</span>
                    <span className="text-[10px] text-orange-700 font-sans font-bold">WebGIS & MapServer</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Menyediakan layer MapServer resmi WMS untuk Jalan Nasional (<code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">jalan_nasional.map</code>) dan Jalan Daerah (<code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">jalan_daerah.map</code>).
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

                <div className="p-3 rounded-[5px] bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>2. Satu Data Kementerian PU</span>
                    <span className="text-[10px] text-blue-700 font-sans font-bold">Open Data Portal</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Portal keterbukaan data kementerian untuk rekapitulasi kondisi mantap jalan, kemantapan per provinsi, dan penetapan status hukum ruas jalan.
                  </p>
                  <a
                    href="https://data.pu.go.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-700 font-bold hover:underline inline-flex items-center gap-1 pt-0.5"
                  >
                    <span>Kunjungi data.pu.go.id</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3 rounded-[5px] bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>3. Endpoint API Mikro JagaJalan</span>
                    <span className="text-[10px] text-emerald-700 font-sans font-bold">REST & GeoJSON API</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Dapat diakses secara terbuka melalui rute API internal aplikasi:
                  </p>
                  <div className="space-y-1 pt-0.5 font-mono text-[10.5px]">
                    <div className="p-1.5 bg-white border border-slate-200 rounded text-slate-800">
                      GET /api/roads?format=json
                    </div>
                    <div className="p-1.5 bg-white border border-slate-200 rounded text-slate-800">
                      GET /api/roads?format=geojson
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSigiModalOpen(false)}
                className="py-2 px-4 rounded-[4px] text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Tutup Informasi
              </button>
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
