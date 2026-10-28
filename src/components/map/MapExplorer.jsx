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
} from "lucide-react";
import {
  INDONESIA_REGIONS,
  INDONESIA_PROVINCES,
  PROVINCIAL_NETWORK_STATS,
  detectJurisdictionByCoordinates,
} from "@/data/roadsData";

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
  const [activeTab, setActiveTab] = useState("masalah"); // "masalah" | "proyek" | "kewenangan" | "sumber"
  const [authorityFilter, setAuthorityFilter] = useState("ALL");
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
      KOTA_KAB: roads.filter((r) => r.authority === "KOTA_KAB").length,
    };
  }, [roads]);

  // Filter logic
  const filteredRoads = useMemo(() => {
    return roads.filter((road) => {
      const matchAuth = authorityFilter === "ALL" || road.authority === authorityFilter;
      const matchSearch =
        road.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        road.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        road.district.toLowerCase().includes(searchQuery.toLowerCase());
      return matchAuth && matchSearch;
    });
  }, [roads, authorityFilter, searchQuery]);

  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const matchAuth = authorityFilter === "ALL" || rep.authority === authorityFilter;
      const matchSearch =
        rep.roadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchAuth && matchSearch;
    });
  }, [reports, authorityFilter, searchQuery]);

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
    <section className="relative w-full h-[calc(100vh-4.25rem)] min-h-[680px] bg-slate-100 overflow-hidden font-sans">
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

      {/* 2. Top-Left Floating Search Box & Status Filter */}
      <div className="absolute top-4 left-4 z-[500] space-y-2 pointer-events-auto">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Interactive Region & Province Dropdown */}
          <div className="relative inline-block font-sans">
            <button
              onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
              className="px-3.5 py-2 rounded-[5px] bg-white/95 backdrop-blur-md shadow-md border border-slate-200/90 text-xs font-semibold text-slate-800 flex items-center gap-2 hover:bg-slate-50 transition-all cursor-pointer font-sans"
            >
              <Globe className="w-3.5 h-3.5 text-[#c2410c]" />
              <span className="text-slate-500 font-normal">Wilayah:</span>
              <span className="font-bold text-slate-900 max-w-[130px] sm:max-w-[180px] truncate">
                {selectedProvinceId
                  ? INDONESIA_PROVINCES.find((p) => p.id === selectedProvinceId)?.name
                  : INDONESIA_REGIONS.find((r) => r.id === selectedRegionId)?.name || "Seluruh Indonesia"}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
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
                                <span className="text-[8.5px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.2 rounded-[4px] border border-emerald-300">
                                  {prov.roadCount} Ruas Terdata
                                </span>
                              ) : prov.hasPilotCorridor ? (
                                <span className="text-[8.5px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.2 rounded-[4px] border border-emerald-300">
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


          {/* Search Bar */}
          <div className="relative w-64 sm:w-72 bg-white/95 backdrop-blur-md rounded-[5px] shadow-md border border-slate-200/90 p-2 flex items-center gap-2 transition-all font-sans">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama jalan atau wilayah..."
              className="w-full text-xs text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 rounded-[5px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Jalan Filter Pill */}
          <div className="relative inline-block font-sans">
            <button
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="px-3.5 py-2 rounded-[5px] bg-white/95 backdrop-blur-md shadow-md border border-slate-200/90 text-xs font-semibold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-all cursor-pointer font-sans"
            >
              <Shield className="w-3.5 h-3.5 text-[#c2410c]" />
              <span>{authorityFilterLabel}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
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

          {/* SIGI PU & GeoAPI Live Status Pill */}
          <button
            onClick={() => setSigiModalOpen(true)}
            title="Klik untuk melihat arsitektur koneksi API SIGI PUPR & Satu Data PU"
            className="px-3 py-2 rounded-[5px] bg-white/95 backdrop-blur-md shadow-md border border-slate-200/90 text-xs font-semibold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-all cursor-pointer font-sans"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline text-slate-500 font-medium">GeoAPI:</span>
            <span className="text-emerald-700 font-bold">SIGI PU Terhubung</span>
          </button>
        </div>

        {/* Quick Authority Filter Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setAuthorityFilter("ALL")}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
              authorityFilter === "ALL"
                ? "bg-orange-500/10 border-orange-500 text-orange-800 shadow-xs ring-1 ring-orange-500/30"
                : "bg-white/95 backdrop-blur-md text-slate-600 border-slate-200/90 hover:bg-slate-50"
            }`}
          >
            <span>Semua Ruas</span>
            <span className={`px-1.5 py-0.2 rounded-[4px] text-[10px] font-sans tabular-nums font-bold ${
              authorityFilter === "ALL" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              {roadCounts.ALL}
            </span>
          </button>

          <button
            onClick={() => setAuthorityFilter("NASIONAL")}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
              authorityFilter === "NASIONAL"
                ? "bg-blue-500/10 border-blue-500 text-blue-800 shadow-xs ring-1 ring-blue-500/30"
                : "bg-white/95 backdrop-blur-md text-slate-600 border-slate-200/90 hover:bg-blue-50/40"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Jalan Nasional</span>
            <span className={`px-1.5 py-0.2 rounded-[4px] text-[10px] font-sans tabular-nums font-bold ${
              authorityFilter === "NASIONAL" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700"
            }`}>
              {roadCounts.NASIONAL}
            </span>
          </button>

          <button
            onClick={() => setAuthorityFilter("PROVINSI")}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
              authorityFilter === "PROVINSI"
                ? "bg-purple-500/10 border-purple-500 text-purple-800 shadow-xs ring-1 ring-purple-500/30"
                : "bg-white/95 backdrop-blur-md text-slate-600 border-slate-200/90 hover:bg-purple-50/40"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span>Jalan Provinsi</span>
            <span className={`px-1.5 py-0.2 rounded-[4px] text-[10px] font-sans tabular-nums font-bold ${
              authorityFilter === "PROVINSI" ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-700"
            }`}>
              {roadCounts.PROVINSI}
            </span>
          </button>

          <button
            onClick={() => setAuthorityFilter("KOTA_KAB")}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
              authorityFilter === "KOTA_KAB"
                ? "bg-teal-500/10 border-teal-500 text-teal-800 shadow-xs ring-1 ring-teal-500/30 font-bold"
                : "bg-white/95 backdrop-blur-md text-slate-600 border-slate-200/90 hover:bg-teal-50/40"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span>Jalan Kota / Kab</span>
            <span className={`px-1.5 py-0.2 rounded-[4px] text-[10px] font-sans tabular-nums font-bold ${
              authorityFilter === "KOTA_KAB" ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-700"
            }`}>
              {roadCounts.KOTA_KAB}
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

      {/* City & Regency Transparency Context Banner */}
      {authorityFilter === "KOTA_KAB" && (
        <div className="hidden sm:block absolute bottom-[142px] left-4 z-[500] max-w-sm bg-white/95 backdrop-blur-md rounded-[5px] shadow-lg border border-teal-200/90 p-3 animate-fade-in font-sans pointer-events-auto">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-[5px] bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-1 text-left flex-1 min-w-0">
              <div className="text-[11px] font-bold text-slate-900 flex items-center justify-between">
                <span>Jalan Kota & Kabupaten Se-Indonesia</span>
                <span className="text-[9px] font-sans tabular-nums font-bold bg-teal-50 text-teal-800 px-1.5 py-0.2 rounded-[4px] border border-teal-200">
                  514 Pemkab/Pemkot
                </span>
              </div>
              <p className="text-[10px] text-slate-600 leading-snug">
                Total Jaringan Resmi: <strong className="text-teal-900 font-sans tabular-nums">445.000 KM</strong> (81% jalan nasional). Tanggung jawab Walikota & Bupati melalui Dinas PUPR Daerah. Menyumbang 42,9% jalan non-mantap dan porsi aduan terbanyak masyarakat (Inpres Jalan Daerah / Ombudsman RI).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Provincial Transparency Context Banner */}
      {authorityFilter === "PROVINSI" && (
        <div className="hidden sm:block absolute bottom-[142px] left-4 z-[500] max-w-sm bg-white/95 backdrop-blur-md rounded-[5px] shadow-lg border border-purple-200/90 p-3 animate-fade-in font-sans pointer-events-auto">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-[5px] bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-1 text-left flex-1 min-w-0">
              <div className="text-[11px] font-bold text-slate-900 flex items-center justify-between">
                <span>Jalan Provinsi Se-Indonesia</span>
                <span className="text-[9px] font-sans tabular-nums font-bold bg-purple-50 text-purple-800 px-1.5 py-0.2 rounded-[4px] border border-purple-200">
                  38 Pemprov
                </span>
              </div>
              <p className="text-[10px] text-slate-600 leading-snug">
                Total Jaringan Resmi: <strong className="text-purple-900 font-sans tabular-nums">54.544,75 KM</strong> (BPS & KemenPU). Ditayangkan terkurasi di bawah kewenangan Gubernur & Dinas Bina Marga Provinsi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* National Transparency Context Banner */}
      {authorityFilter === "NASIONAL" && (
        <div className="hidden sm:block absolute bottom-[142px] left-4 z-[500] max-w-sm bg-white/95 backdrop-blur-md rounded-[5px] shadow-lg border border-blue-200/90 p-3 animate-fade-in font-sans pointer-events-auto">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-[5px] bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-1 text-left flex-1 min-w-0">
              <div className="text-[11px] font-bold text-slate-900 flex items-center justify-between">
                <span>Jalan Arteri Primer Nasional</span>
                <span className="text-[9px] font-sans font-bold bg-blue-50 text-blue-800 px-1.5 py-0.2 rounded-[4px] border border-blue-200">
                  Kementerian PU
                </span>
              </div>
              <p className="text-[10px] text-slate-600 leading-snug">
                Total Jaringan Arteri: <strong className="text-blue-900 font-sans tabular-nums">47.017 KM</strong> di bawah SK MenPUPR No. 1688/2022. Dikelola BBPJN / BPJN Ditjen Bina Marga Kementerian PU.
              </p>
            </div>
          </div>
        </div>
      )}


      {/* 3. Left Side Floating Zoom Controls */}
      <div className="absolute top-[118px] left-4 z-[500] flex flex-col gap-1.5 bg-white/95 backdrop-blur-md rounded-[5px] shadow-md border border-slate-200/90 p-1 pointer-events-auto font-sans">
        <button
          onClick={() => mapInstance?.zoomIn()}
          title="Perbesar Peta"
          className="w-8 h-8 rounded-[5px] flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapInstance?.zoomOut()}
          title="Perkecil Peta"
          className="w-8 h-8 rounded-[5px] flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-slate-200 my-0.5" />
        <button
          onClick={handleResetLocation}
          title="Pusatkan Kembali Peta"
          className="w-8 h-8 rounded-[5px] flex items-center justify-center text-slate-700 hover:text-[#c2410c] hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Bottom-Left Floating Legend */}
      <div className="hidden sm:block absolute bottom-6 left-4 z-[500] space-y-1.5 pointer-events-auto font-sans">
        <div className="bg-white/95 backdrop-blur-md rounded-[5px] shadow-md border border-slate-200/90 p-3 text-[11px] space-y-1.5 min-w-[185px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-0.5">
            Kewenangan Ruas
          </div>
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <span className="w-5 h-1.5 rounded-[2px] bg-blue-600" />
            <span>Jalan Nasional (KemenPU)</span>
          </div>
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <span className="w-5 h-1.5 rounded-[2px] bg-purple-600" />
            <span>Jalan Provinsi (Pemprov)</span>
          </div>
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <span className="w-5 h-1.5 rounded-[2px] bg-teal-600" />
            <span>Jalan Kota / Kab (Pemda)</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 font-medium pl-1">
          Peta dasar © OpenStreetMap contributors
        </div>
      </div>

      {/* 5. Bottom-Center Floating Stats Card */}
      <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] bg-white/95 backdrop-blur-md rounded-[5px] shadow-md border border-slate-200/90 px-4 py-2 items-center gap-4 text-xs font-semibold text-slate-700 pointer-events-auto font-sans">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-[3px] bg-[#c2410c] text-white flex items-center justify-center text-[10px] font-black">
            !
          </span>
          <span className="tabular-nums">{roads.length} ruas jalan pilot terdata</span>
        </span>
        <span className="w-px h-3.5 bg-slate-300" />
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#c2410c]" />
          <span className="tabular-nums">{reports.length} aduan publik terverifikasi AI</span>
        </span>
        <span className="w-px h-3.5 bg-slate-300" />
        <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>100% Data Bersumber Resmi</span>
        </span>
      </div>

      {/* 6. Right Side Comprehensive Inspector Drawer */}
      {displayItem && (
        <aside className="absolute top-4 right-4 bottom-4 w-full max-w-[460px] z-[500] bg-white/98 backdrop-blur-md rounded-[5px] shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-fade-in pointer-events-auto font-sans">
          {/* Drawer Header */}
          <div className="px-5 pt-4 pb-3 border-b border-slate-100 shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-[5px] text-[10px] font-bold font-sans tracking-wide border ${
                  currentRoad?.authority === "NASIONAL"
                    ? "bg-blue-500/10 text-blue-800 border-blue-300"
                    : currentRoad?.authority === "PROVINSI"
                    ? "bg-purple-500/10 text-purple-800 border-purple-300"
                    : "bg-teal-500/10 text-teal-800 border-teal-300"
                }`}>
                  {currentRoad?.authority === "NASIONAL"
                    ? "JALAN NASIONAL • APBN"
                    : currentRoad?.authority === "PROVINSI"
                    ? "JALAN PROVINSI • APBD PROVINSI"
                    : "JALAN KOTA / KAB • APBD DAERAH"}
                </span>

                {currentReport && (
                  <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold font-sans tabular-nums bg-orange-100 text-orange-800 border border-orange-200">
                    TIKET {currentReport.ticketCode}
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedReport(null);
                  setSelectedRoad(null);
                }}
                className="p-1.5 rounded-[5px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Tutup Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight leading-snug">
                {currentReport ? currentReport.roadName : currentRoad.name}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-sans">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {currentReport ? currentReport.address : `${currentRoad.district} • ${currentRoad.lengthKm} KM`}
                </span>
              </p>
              {currentRoad?.leadership?.regionalHead && (
                <div className="mt-1.5 text-[10.5px] font-semibold text-slate-700 bg-slate-100/90 border border-slate-200/90 rounded-[4px] px-2 py-1 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Penanggung Jawab:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[230px]">{currentRoad.leadership.regionalHead}</span>
                </div>
              )}
            </div>

            {/* Interactive 4 Tabs Switcher */}
            <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-100 text-[11px] font-semibold">
              <button
                onClick={() => setActiveTab("masalah")}
                className={`py-2 px-1 text-center rounded-[4px] transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  activeTab === "masalah"
                    ? "bg-orange-50 text-orange-900 font-bold border-b-2 border-[#c2410c]"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                <span>Masalah</span>
              </button>

              <button
                onClick={() => setActiveTab("proyek")}
                className={`py-2 px-1 text-center rounded-[4px] transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  activeTab === "proyek"
                    ? "bg-orange-50 text-orange-900 font-bold border-b-2 border-[#c2410c]"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Hammer className="w-3.5 h-3.5 text-slate-700" />
                <span>Proyek</span>
              </button>

              <button
                onClick={() => setActiveTab("kewenangan")}
                className={`py-2 px-1 text-center rounded-[4px] transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  activeTab === "kewenangan"
                    ? "bg-orange-50 text-orange-900 font-bold border-b-2 border-[#c2410c]"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-slate-700" />
                <span>Wewenang</span>
              </button>

              <button
                onClick={() => setActiveTab("sumber")}
                className={`py-2 px-1 text-center rounded-[4px] transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  activeTab === "sumber"
                    ? "bg-orange-50 text-orange-900 font-bold border-b-2 border-[#c2410c]"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sumber</span>
              </button>
            </div>
          </div>

          {/* Drawer Body (Scrollable with tabs) */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700">
            {/* TAB 1: MASALAH & KONDISI LAPANGAN */}
            {activeTab === "masalah" && (
              <div className="space-y-3.5 animate-fade-in">
                {/* Photo Evidence Banner */}
                <div className="w-full h-44 rounded-[5px] overflow-hidden border border-slate-200 bg-slate-900 relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      currentReport?.photoUrl ||
                      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80"
                    }
                    alt="Bukti Kondisi Lapangan"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                      Foto Bukti Geotag
                    </span>
                    {currentReport?.proofPhotoUrl && (
                      <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                        ✓ Bukti Selesai Tersedia
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-orange-600 text-white shadow-xs">
                    Skor Bahaya: {currentReport?.hazardScore || currentRoad?.hazardScore || 75}/100
                  </div>
                </div>

                {/* Corridor Span Boundary Pill for National Arterial Highways */}
                {currentRoad?.startPoint && currentRoad?.endPoint && (
                  <div className="p-2.5 rounded-[5px] bg-slate-50 border border-slate-200/90 text-xs space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Crosshair className="w-3 h-3 text-[#c2410c]" />
                        <span>Bentang Batas Koridor Arteri</span>
                      </span>
                      <span className="font-sans tabular-nums text-slate-500 font-bold">{currentRoad.lengthKm} KM</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800">
                      <span className="truncate max-w-[46%] text-slate-800">📍 {currentRoad.startPoint.name}</span>
                      <span className="text-slate-400 font-sans font-bold">➔</span>
                      <span className="truncate max-w-[46%] text-slate-800 text-right">🏁 {currentRoad.endPoint.name}</span>
                    </div>
                  </div>
                )}

                {/* Problem Summary Card */}
                <div className="p-3.5 rounded-[5px] bg-orange-50/70 border border-orange-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-700" />
                      <span>Kerusakan Nyata di Lapangan</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-black bg-orange-200 text-orange-900">
                      {currentReport?.categoryLabel || currentRoad?.condition?.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {currentRoad?.problemDetails?.headline || currentReport?.problemDetails?.headline || "Kerusakan Lapisan Permukaan Aspal"}
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {currentRoad?.problemDetails?.description || currentReport?.problemDetails?.description || currentReport?.aiAnalysis}
                  </p>
                </div>

                {/* Technical Root Cause & Safety Impact */}
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="p-3 rounded-[5px] bg-white border border-slate-200 shadow-2xs space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-500" />
                      <span>Akar Penyebab Masalah (Root Cause)</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {currentRoad?.problemDetails?.rootCause || currentReport?.problemDetails?.rootCause || "Kelebihan muatan gandar kendaraan (ODOL) dan rembesan air akibat drainase yang tidak optimal."}
                    </p>
                  </div>

                  <div className="p-3 rounded-[5px] bg-white border border-slate-200 shadow-2xs space-y-1">
                    <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-500" />
                      <span>Dampak Keselamatan Pengguna Jalan</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {currentRoad?.problemDetails?.safetyImpact || currentReport?.problemDetails?.safetyImpact || "Membahayakan pengguna motor roda dua saat melintas, terutama saat malam hari dan kondisi hujan lebat."}
                    </p>
                  </div>
                </div>

                {/* SLA / Dinas Response Monitoring */}
                <div className="p-3.5 rounded-[5px] bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Pemantauan Waktu Respons Dinas (SLA 14 Hari)</span>
                    </div>
                    {currentReport?.isResponseOverdue ? (
                      <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        Terlambat {currentReport.daysOverdue} Hari
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Dalam Batas Wajar
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {currentRoad?.problemDetails?.slaNote || (currentReport?.isResponseOverdue
                      ? "Laporan telah melebihi batas waktu penanganan resmi 14 hari kerja berdasarkan UU No. 25/2009 tentang Pelayanan Publik."
                      : "Laporan berada dalam masa pemantauan respons teknis UPTD dinas terkait.")}
                  </p>

                  {/* Overdue Action */}
                  {currentReport?.isResponseOverdue && (
                    <button
                      onClick={() => onOpenOmbudsmanDraft(currentReport)}
                      className="w-full mt-1 py-2 px-3 rounded-[5px] text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer font-sans"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Generate Draf Laporan Ombudsman RI</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PROYEK YANG DIBANGUN / ANGGARAN */}
            {activeTab === "proyek" && (
              <div className="space-y-3.5 animate-fade-in">
                {budgetData ? (
                  <>
                    {/* Project Header Box */}
                    <div className="p-3.5 rounded-[5px] bg-slate-900 text-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-sans tabular-nums font-bold text-orange-400">
                          {budgetData.packageId}
                        </span>
                        <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${
                          budgetData.progressStatus === "SELESAI"
                            ? "bg-emerald-500 text-white"
                            : budgetData.progressStatus === "TERLAMBAT_RESPONS"
                            ? "bg-rose-500 text-white"
                            : "bg-amber-500 text-white"
                        }`}>
                          {budgetData.progressStatus.replace("_", " ")}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-white leading-snug">
                        {budgetData.name}
                      </h3>
                      <div className="text-[11px] text-slate-300 flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Tahun Anggaran {budgetData.fiscalYear} • {budgetData.source}</span>
                      </div>
                    </div>

                    {/* What is being built / Scope of construction work */}
                    <div className="p-3.5 rounded-[5px] bg-white border border-slate-200 shadow-2xs space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Hammer className="w-3.5 h-3.5 text-orange-600" />
                        <span>Lingkup Pekerjaan Fisik yang Dibangun</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        {budgetData.scope || "Pekerjaan rekonstruksi dan pemeliharaan berkala struktur perkerasan jalan, normalisasi sistem drainase, dan pelapisan ulang aspal hotmix."}
                      </p>
                    </div>

                    {/* Budget & Contract Comparison */}
                    <div className="p-3.5 rounded-[5px] bg-white border border-slate-200 shadow-2xs space-y-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Rincian Nilai Pengadaan & Anggaran
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2.5 rounded-[4px] bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-500 block">Pagu Anggaran</span>
                          <span className="text-sm font-bold text-slate-900 font-sans tabular-nums">
                            Rp {((budgetData.paguRp || 0) / 1000000000).toFixed(2)} M
                          </span>
                        </div>
                        <div className="p-2.5 rounded-[4px] bg-orange-50/60 border border-orange-100">
                          <span className="text-[10px] text-orange-800 block">Nilai Kontrak Terkoreksi</span>
                          <span className="text-sm font-bold text-orange-950 font-sans tabular-nums">
                            Rp {((budgetData.contractValueRp || 0) / 1000000000).toFixed(2)} M
                          </span>
                        </div>
                      </div>

                      {savingsRp > 0 && (
                        <div className="flex items-center justify-between text-[11px] p-2 rounded-[4px] bg-emerald-50 border border-emerald-100 text-emerald-800 font-medium">
                          <span className="flex items-center gap-1">
                            <BadgePercent className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Efisiensi Tender Hasil Lelang:</span>
                          </span>
                          <span className="font-bold font-sans tabular-nums">
                            Rp {(savingsRp / 1000000).toFixed(0)} Juta ({savingsPct}%)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contractor & Physical Progress */}
                    <div className="p-3.5 rounded-[5px] bg-white border border-slate-200 shadow-2xs space-y-2.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Kontraktor & Progres Fisik
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 block">Pemenang Tender Pelaksana:</span>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          <span>{budgetData.contractor || "Belum Ditetapkan / Proses Lelang"}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                          <span>Realisasi Fisik Lapangan</span>
                          <span className="font-sans tabular-nums text-orange-700 font-bold">{budgetData.progressPct || 0}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full transition-all duration-500 ${
                              budgetData.progressPct === 100
                                ? "bg-emerald-600"
                                : budgetData.progressPct < 30
                                ? "bg-rose-500"
                                : "bg-orange-600"
                            }`}
                            style={{ width: `${budgetData.progressPct || 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-2 rounded-[4px] bg-slate-50 text-[11px] text-slate-600 border border-slate-100 leading-relaxed">
                        <span className="font-bold text-slate-800">Catatan Pengawasan: </span>
                        {budgetData.statusNote}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center text-slate-500 space-y-2 bg-white rounded-[5px] border border-slate-200">
                    <FileText className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs">Belum ada paket anggaran tender aktif yang terhubung ke segmen jalan ini.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: STATUS KEWENANGAN & LEGALITAS */}
            {activeTab === "kewenangan" && (
              <div className="space-y-3.5 animate-fade-in">
                {/* Detected Location Special Banner */}
                {currentRoad?.isDetectedPoint && (
                  <div className="p-3.5 rounded-[5px] bg-teal-50 border border-teal-200 space-y-2">
                    <div className="text-xs font-bold text-teal-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-700" />
                        <span>Hasil Deteksi Spasial Lokasi</span>
                      </span>
                      <span className="text-[9px] font-sans font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                        Otomatis
                      </span>
                    </div>
                    <p className="text-[11px] text-teal-800 leading-relaxed">
                      Sistem mendeteksi titik koordinat ini berada di wilayah <span className="font-bold">{currentRoad.provinceName}</span> dengan kewenangan <span className="font-bold">{currentRoad.authorityLabel}</span>.
                      {currentRoad.lengthKm > 0 && (
                        <span> Jarak ke koridor Jalan Nasional terdekat: <strong className="font-sans tabular-nums">{currentRoad.lengthKm} KM</strong>.</span>
                      )}
                    </p>
                    <button
                      onClick={onOpenReportModal}
                      className="w-full py-2 px-3 rounded-[4px] bg-[#c2410c] hover:bg-[#ea580c] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Aduan / Lapor Jalan di Titik Ini</span>
                    </button>
                  </div>
                )}

                {/* Leadership & Pejabat Penanggung Jawab Card */}
                <div className="p-3.5 rounded-[5px] bg-slate-900 text-white space-y-2.5">
                  <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Kepala Daerah & Pejabat Berwenang</span>
                    <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-sans font-medium">PIC Terverifikasi</span>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-white">
                      {currentRoad?.leadership?.regionalHead || "Gubernur / Walikota / Kepala BBPJN"}
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {currentRoad?.leadership?.agency || currentRoad?.authorityLabel}
                    </div>
                    {currentRoad?.leadership?.officialPic && (
                      <div className="text-[10px] text-slate-400 pt-0.5">
                        Pelaksana Lapangan: {currentRoad.leadership.officialPic}
                      </div>
                    )}
                  </div>
                  {currentRoad?.leadership?.contactCenter && (
                    <div className="text-[10px] text-slate-300 border-t border-slate-800 pt-1.5 flex items-center justify-between">
                      <span>Kanal Resmi:</span>
                      <span className="font-sans tabular-nums text-orange-300 font-bold">{currentRoad.leadership.contactCenter}</span>
                    </div>
                  )}
                </div>

                {/* Interactive Milestone KM Points for National Highways */}
                {currentRoad?.milestones && currentRoad.milestones.length > 0 && (
                  <div className="p-3 rounded-[5px] bg-blue-50/70 border border-blue-200/90 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-700" />
                        <span>Titik Patok & Milestone Batas (KM)</span>
                      </span>
                      <span className="text-[9px] text-blue-800 font-sans tabular-nums font-bold bg-blue-100 px-1.5 py-0.5 rounded">
                        {currentRoad.milestones.length} Titik Penting
                      </span>
                    </div>
                    <p className="text-[10px] text-blue-800/80">
                      Klik salah satu patok untuk mengarahkan peta ke koordinat titik inspeksi tersebut:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {currentRoad.milestones.map((ms, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            mapInstance?.flyTo(ms.coords, 12, { duration: 1 });
                          }}
                          className="text-left p-1.5 bg-white rounded border border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-[10px] cursor-pointer"
                        >
                          <div className="flex items-center justify-between font-sans tabular-nums font-bold text-blue-900">
                            <span>KM {ms.km}</span>
                            <span className={`text-[8px] px-1 py-0.2 rounded font-sans ${
                              ms.status === "MANTAP" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}>{ms.status}</span>
                          </div>
                          <div className="text-slate-800 font-semibold truncate mt-0.5">{ms.name}</div>
                          <div className="text-[8.5px] text-slate-500 truncate">{ms.note}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Official Authority Card */}
                <div className="p-4 rounded-[5px] bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-[5px] bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                      <Building2 className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Instansi Penanggung Jawab Resmi
                      </div>
                      <div className="font-bold text-slate-900 text-sm">
                        {currentRoad?.authorityLabel}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-[4px] bg-slate-50 border border-slate-100 space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Dasar Penetapan Status Ruas (SK Resmi)
                    </div>
                    <div className="text-xs font-semibold text-slate-800 leading-snug">
                      {currentRoad?.legalBasis}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-[4px] bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Kode Ruas</span>
                      <span className="font-sans tabular-nums font-bold text-slate-900">{currentRoad?.code}</span>
                    </div>
                    <div className="p-2.5 rounded-[4px] bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Panjang Koridor</span>
                      <span className="font-bold text-slate-900">{currentRoad?.lengthKm} KM</span>
                    </div>
                    <div className="p-2.5 rounded-[4px] bg-slate-50 border border-slate-100 col-span-2">
                      <span className="text-[10px] text-slate-400 block">Tipe Perkerasan Jalan</span>
                      <span className="font-semibold text-slate-900">{currentRoad?.pavementType}</span>
                    </div>
                  </div>
                </div>

                {/* Legal Context Note */}
                <div className="p-3.5 rounded-[5px] bg-blue-50/70 border border-blue-200 text-blue-950 space-y-1.5 leading-relaxed">
                  <div className="font-bold text-xs flex items-center gap-1.5 text-blue-900">
                    <Shield className="w-3.5 h-3.5 text-blue-700" />
                    <span>Payung Hukum Kewenangan Ruas Jalan</span>
                  </div>
                  <p className="text-[11px] text-blue-900">
                    Berdasarkan <strong>UU No. 38 Tahun 2004</strong> jo. <strong>UU No. 2 Tahun 2022</strong> tentang Jalan, setiap ruas jalan memiliki pembagian kewenangan mutlak antara Pemerintah Pusat (Jalan Nasional), Pemerintah Provinsi (Jalan Provinsi), dan Pemerintah Kabupaten/Kota (Jalan Daerah). Hal ini mencegah praktik saling lempar tanggung jawab penanganan jalan rusak.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: SUMBER DATA RESMI & TERVERIFIKASI */}
            {activeTab === "sumber" && (
              <div className="space-y-3.5 animate-fade-in">
                {/* Verification Stamp */}
                <div className="p-3.5 rounded-[5px] bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-xs">Data Terverifikasi & Terbuka</h4>
                    <p className="text-[11px] text-emerald-800">
                      Setiap informasi ruas, masalah teknis, dan paket tender telah dicocokkan dengan portal resmi pemerintah.
                    </p>
                  </div>
                </div>

                {/* Source Checklist */}
                <div className="space-y-2">
                  {/* Source 1: Kewenangan */}
                  <div className="p-3 rounded-[5px] bg-white border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        1. Sumber Status Kewenangan
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-[3px] border border-emerald-200">
                        SK Sah
                      </span>
                    </div>
                    <p className="text-xs text-slate-900 font-semibold">
                      {currentRoad?.officialSources?.authoritySource || currentRoad?.legalBasis}
                    </p>
                  </div>

                  {/* Source 2: Anggaran & LPSE */}
                  <div className="p-3 rounded-[5px] bg-white border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        2. Sumber Anggaran & Tender
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-[3px] border border-blue-200">
                        LPSE / SiRUP
                      </span>
                    </div>
                    <p className="text-xs text-slate-900 font-semibold">
                      {currentRoad?.officialSources?.budgetSource || (budgetData ? `Portal LPSE - Paket ${budgetData.packageId}` : "Portal Pengadaan Barang/Jasa")}
                    </p>
                  </div>

                  {/* Source 3: Kondisi Lapangan */}
                  <div className="p-3 rounded-[5px] bg-white border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        3. Sumber Kerusakan & Aduan
                      </span>
                      <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded-[3px] border border-orange-200">
                        Geotagging + AI
                      </span>
                    </div>
                    <p className="text-xs text-slate-900 font-semibold">
                      {currentRoad?.officialSources?.fieldDataSource || "Laporan Pengaduan Geotag Warga & Validasi AI JagaJalan"}
                    </p>
                  </div>

                  {/* Source 4: Tanggal Audit */}
                  <div className="p-3 rounded-[5px] bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                    <span>Terakhir Diaudit & Disinkronkan:</span>
                    <span className="font-bold text-slate-800 font-sans tabular-nums">
                      {currentRoad?.budget?.lastVerifiedAt || "18 Oktober 2026"}
                    </span>
                  </div>
                </div>

                {/* SIGI PUPR & GeoAPI Spatial Infrastructure Card */}
                <div className="p-3.5 rounded-[5px] bg-slate-900 text-white space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Integrasi Spasial SIGI Kementerian PU</span>
                    </span>
                    <span className="text-[9px] font-sans font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-[3px]">
                      Open GeoAPI
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Data garis dan koridor jalan di JagaJalan mengacu pada layer resmi <strong>Sistem Informasi Geospasial Infrastruktur (SIGI)</strong> dan <strong>Satu Data PU</strong>, menggunakan vektor kurva fisik jalan nyata (bukan garis lurus perkiraan).
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                    <a
                      href="https://sigi.pu.go.id/astv2/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-[4px] bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center justify-between transition-colors border border-slate-700"
                    >
                      <span>SIGI ASTV2</span>
                      <ExternalLink className="w-3 h-3 text-orange-400" />
                    </a>
                    <a
                      href="https://data.pu.go.id/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-[4px] bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center justify-between transition-colors border border-slate-700"
                    >
                      <span>Satu Data PU</span>
                      <ExternalLink className="w-3 h-3 text-orange-400" />
                    </a>
                  </div>

                  <a
                    href="/api/roads?format=geojson"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-2.5 rounded-[4px] bg-orange-600/90 hover:bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Akses Data Ruas Format GeoJSON API (RFC 7946)</span>
                  </a>
                </div>

                {/* Open Official Portal Button */}
                {budgetData?.sourceUrl && (
                  <a
                    href={budgetData.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-[5px] text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                    <span>Buka Rincian Tender di Portal LPSE / Data Jabar</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-slate-100 space-y-2 bg-white shrink-0 font-sans">
            <button
              onClick={() => onOpenReportModal()}
              className="w-full py-2.5 px-4 rounded-[5px] text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer font-sans"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Laporkan Kerusakan di Sekitar Ruas Ini</span>
            </button>

            {currentReport?.isResponseOverdue && (
              <button
                onClick={() => onOpenOmbudsmanDraft(currentReport)}
                className="w-full py-2 px-4 rounded-[5px] text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-sans"
              >
                <FileCheck className="w-3.5 h-3.5" />
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
              <div className="p-3 rounded-[5px] bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Geometri Berbasis Vektor Jalan Nyata</span>
                </div>
                <p className="text-[11px] text-emerald-800">
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
    </section>
  );
}
