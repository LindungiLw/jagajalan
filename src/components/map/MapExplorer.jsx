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
} from "lucide-react";

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
  const [selectedRoad, setSelectedRoad] = useState(roads[2] || roads[0]); // Default to Sawangan (ruas-03)
  const [selectedReport, setSelectedReport] = useState(reports[0] || null); // Default to JGJ-DPK-081 (Jl. Raya Sawangan)
  const [activeTab, setActiveTab] = useState("masalah"); // "masalah" | "proyek" | "kewenangan" | "sumber"
  const [authorityFilter, setAuthorityFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [sigiModalOpen, setSigiModalOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState([-6.3985, 106.7892]); // Sawangan, Depok
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

  const handleResetLocation = () => {
    setMapCenter([-6.3985, 106.825]);
    mapInstance?.setView([-6.3985, 106.825], 11.5, { animate: true });
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
          onSelectRoad={handleSelectRoad}
          onSelectReport={handleSelectReport}
          mapCenter={mapCenter}
          onMapReady={setMapInstance}
        />
      </div>

      {/* 2. Top-Left Floating Search Box & Status Filter */}
      <div className="absolute top-4 left-4 z-[500] space-y-2 pointer-events-auto">
        <div className="flex items-center gap-2 flex-wrap">
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
      </div>

      {/* 3. Left Side Floating Zoom Controls */}
      <div className="absolute top-36 left-4 z-[500] flex flex-col gap-1.5 bg-white/95 backdrop-blur-md rounded-[5px] shadow-md border border-slate-200/90 p-1 pointer-events-auto font-sans">
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
                <span className={`px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold font-mono border ${
                  currentRoad?.authority === "NASIONAL"
                    ? "bg-blue-50 text-blue-800 border-blue-200"
                    : currentRoad?.authority === "PROVINSI"
                    ? "bg-purple-50 text-purple-800 border-purple-200"
                    : "bg-teal-50 text-teal-800 border-teal-200"
                }`}>
                  {currentRoad?.authority === "NASIONAL"
                    ? "JALAN NASIONAL • APBN"
                    : currentRoad?.authority === "PROVINSI"
                    ? "JALAN PROVINSI • APBD JABAR"
                    : "JALAN KOTA/KAB • APBD DAERAH"}
                </span>

                {currentReport && (
                  <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold font-mono bg-orange-100 text-orange-800 border border-orange-200">
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
                        <span className="text-[10px] font-mono font-bold text-orange-400">
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
                          <span className="text-sm font-bold text-slate-900 font-mono">
                            Rp {((budgetData.paguRp || 0) / 1000000000).toFixed(2)} M
                          </span>
                        </div>
                        <div className="p-2.5 rounded-[4px] bg-orange-50/60 border border-orange-100">
                          <span className="text-[10px] text-orange-800 block">Nilai Kontrak Terkoreksi</span>
                          <span className="text-sm font-bold text-orange-950 font-mono">
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
                          <span className="font-bold font-mono">
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
                          <span className="font-mono text-orange-700 font-bold">{budgetData.progressPct || 0}%</span>
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
                      <span className="font-mono font-bold text-slate-900">{currentRoad?.code}</span>
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
                    <span className="font-bold text-slate-800 font-mono">
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
                    <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-[3px]">
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
                    <span className="text-[10px] text-orange-700 font-mono">WebGIS & MapServer</span>
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
                    <span className="text-[10px] text-blue-700 font-mono">Open Data Portal</span>
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
                    <span className="text-[10px] text-emerald-700 font-mono">REST & GeoJSON API</span>
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
