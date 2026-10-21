"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  const [authorityFilter, setAuthorityFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
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

  // Active item to display in drawer (prioritize report, fallback to road)
  const displayItem = selectedReport || selectedRoad;

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
        {/* Search Bar */}
        <div className="relative w-72 sm:w-84 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/90 p-2 flex items-center gap-2 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama jalan atau wilayah..."
            className="w-full text-xs text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Jalan Filter Pill */}
        <div className="relative inline-block">
          <button
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            className="px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200/90 text-xs font-semibold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-orange-600" />
            <span>{authorityFilterLabel}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Dropdown Options */}
          {statusDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 text-xs text-slate-700 z-[600] animate-fade-in">
              <button
                onClick={() => {
                  setAuthorityFilter("ALL");
                  setStatusDropdownOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center justify-between ${
                  authorityFilter === "ALL" ? "font-bold text-orange-600 bg-orange-50/50" : ""
                }`}
              >
                <span>Semua Status Jalan</span>
                {authorityFilter === "ALL" && <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />}
              </button>
              <button
                onClick={() => {
                  setAuthorityFilter("NASIONAL");
                  setStatusDropdownOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center gap-2 ${
                  authorityFilter === "NASIONAL" ? "font-bold text-blue-700 bg-blue-50/50" : ""
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
                <span>Jalan Nasional (KemenPU)</span>
              </button>
              <button
                onClick={() => {
                  setAuthorityFilter("PROVINSI");
                  setStatusDropdownOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center gap-2 ${
                  authorityFilter === "PROVINSI" ? "font-bold text-purple-700 bg-purple-50/50" : ""
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" />
                <span>Jalan Provinsi (Bina Marga)</span>
              </button>
              <button
                onClick={() => {
                  setAuthorityFilter("KOTA_KAB");
                  setStatusDropdownOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center gap-2 ${
                  authorityFilter === "KOTA_KAB" ? "font-bold text-teal-700 bg-teal-50/50" : ""
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488]" />
                <span>Jalan Kota / Kabupaten (PUPR)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Left Side Floating Zoom Controls */}
      <div className="absolute top-36 left-4 z-[500] flex flex-col gap-1.5 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/90 p-1 pointer-events-auto">
        <button
          onClick={() => mapInstance?.zoomIn()}
          title="Perbesar Peta"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapInstance?.zoomOut()}
          title="Perkecil Peta"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-slate-200 my-0.5" />
        <button
          onClick={handleResetLocation}
          title="Pusatkan Kembali Peta"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:text-orange-600 hover:bg-slate-100 transition-colors"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Bottom-Left Floating Legend */}
      <div className="hidden sm:block absolute bottom-6 left-4 z-[500] space-y-1.5 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/90 p-3 text-[11px] space-y-1.5 min-w-[175px]">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <span className="w-5 h-1 rounded bg-[#2563eb]" />
            <span>Jalan Nasional</span>
          </div>
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <span className="w-5 h-1 rounded bg-[#7c3aed]" />
            <span>Jalan Provinsi</span>
          </div>
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <span className="w-5 h-1 rounded bg-[#0d9488]" />
            <span>Jalan Kota/Kabupaten</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 font-medium pl-1">
          Peta dasar © OpenStreetMap contributors
        </div>
      </div>

      {/* 5. Bottom-Center Floating Stats Card */}
      <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/90 px-4 py-2 items-center gap-4 text-xs font-semibold text-slate-700 pointer-events-auto">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-md bg-orange-600 text-white flex items-center justify-center text-[10px] font-black">
            !
          </span>
          <span>{roads.length} ruas contoh</span>
        </span>
        <span className="w-px h-3.5 bg-slate-300" />
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-orange-600" />
          <span>{reports.length} titik laporan demo</span>
        </span>
      </div>

      {/* 6. Right Side Floating Inspector Panel / Drawer */}
      {displayItem && (
        <aside className="absolute top-4 right-4 bottom-4 w-full max-w-[430px] z-[500] bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-fade-in pointer-events-auto">
          {/* Drawer Header */}
          <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-slate-100 shrink-0">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono bg-orange-100/80 text-orange-800 border border-orange-200">
              DEMO • {selectedReport ? selectedReport.ticketCode : selectedRoad.code}
            </span>
            <button
              onClick={() => {
                setSelectedReport(null);
                setSelectedRoad(null);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body (Scrollable) */}
          <div className="p-5 overflow-y-auto flex-1 space-y-3.5 text-xs text-slate-700">
            {/* Title & Location */}
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {selectedReport ? selectedReport.roadName : selectedRoad.name}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{selectedReport ? selectedReport.address : `${selectedRoad.district} • ${selectedRoad.lengthKm} KM`}</span>
              </p>
            </div>

            {/* Verification Status Tag */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-200">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>Contoh data • perlu verifikasi</span>
              </span>
            </div>

            {/* Photo Banner with Carousel Dots */}
            <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  selectedReport?.photoUrl ||
                  "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80"
                }
                alt="Bukti Kerusakan Jalan"
                className="w-full h-full object-cover"
              />
              {selectedReport?.proofPhotoUrl && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                  ✓ Bukti Penanganan Dinas Tersedia
                </span>
              )}
              {/* Carousel Indicator Dots (matching screenshot) */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              </div>
            </div>

            {/* 4 Modular Section Cards */}
            <div className="space-y-2.5 pt-1">
              {/* Card 1: Kondisi Jalan */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-xs">Kondisi Jalan</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {selectedReport?.categoryLabel || selectedRoad?.condition?.replace("_", " ") || "Lubang / kerusakan permukaan"}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 shrink-0">
                  Prioritas tinggi • estimasi
                </span>
              </div>

              {/* Card 2: Kewenangan ruas */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <Building2 className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-xs">Kewenangan ruas</div>
                  <div className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    <span className="truncate">
                      {selectedReport?.authorityLabel || selectedRoad?.authorityLabel}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    Dasar penetapan: {selectedReport?.legalBasis || selectedRoad?.legalBasis || "SK Kewenangan Ruas Resmi"}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              {/* Card 3: Informasi proyek terkait */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <FileText className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-xs">Informasi proyek terkait</div>
                  <div className="text-[11px] text-slate-600 truncate mt-0.5">
                    {selectedReport?.matchingBudget
                      ? `${selectedReport.matchingBudget.packageName} (Pagu: Rp ${((selectedReport.matchingBudget.paguRp || 0) / 1000000000).toFixed(1)} Miliar)`
                      : selectedRoad?.budget
                      ? `${selectedRoad.budget.name} (Pagu: Rp ${((selectedRoad.budget.paguRp || 0) / 1000000000).toFixed(1)} Miliar)`
                      : "Paket anggaran belum terhubung ke ruas ini"}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span>{selectedReport?.matchingBudget?.matchConfidence === "TERKONFIRMASI" ? "Terkonfirmasi" : "Belum dicocokkan"}</span>
                </span>
              </div>

              {/* Card 4: Riwayat laporan (Horizontal Timeline Stepper) */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Riwayat laporan</div>
                    <div className="text-[10px] text-slate-500">
                      Laporan contoh dibuat{" "}
                      {selectedReport
                        ? new Date(selectedReport.reportDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "21 Okt 2026"}
                    </div>
                  </div>
                </div>

                {/* Horizontal Stepper (matching screenshot exactly) */}
                <div className="pt-2 flex items-center justify-between px-3 text-center">
                  {/* Step 1: Diterima */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      ✓
                    </div>
                    <span className="text-[10px] font-bold text-orange-600">Diterima</span>
                  </div>

                  {/* Connecting Line 1 */}
                  <div className="flex-1 h-0.5 bg-slate-200 mx-2 -mt-4.5" />

                  {/* Step 2: Diverifikasi */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        selectedReport?.status === "DALAM_PENGERJAAN" || selectedReport?.status === "SELESAI"
                          ? "bg-orange-600 text-white"
                          : "bg-white border-2 border-slate-300"
                      }`}
                    >
                      {selectedReport?.status === "DALAM_PENGERJAAN" || selectedReport?.status === "SELESAI" ? "✓" : ""}
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">Diverifikasi</span>
                  </div>

                  {/* Connecting Line 2 */}
                  <div
                    className={`flex-1 h-0.5 mx-2 -mt-4.5 ${
                      selectedReport?.status === "SELESAI" ? "bg-orange-500" : "bg-slate-200"
                    }`}
                  />

                  {/* Step 3: Tindak lanjut */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        selectedReport?.status === "SELESAI"
                          ? "bg-emerald-600 text-white"
                          : "bg-white border-2 border-slate-300"
                      }`}
                    >
                      {selectedReport?.status === "SELESAI" ? "✓" : ""}
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">Tindak lanjut</span>
                  </div>
                </div>
              </div>

              {/* Overdue SLA / Ombudsman Escalation Card */}
              {selectedReport?.status === "OVERDUE" && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-rose-700">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Batas Waktu Tanggapan (SLA) Terlampaui</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    Instansi terkait belum memberikan respons resmi melampaui 14 hari kerja (UU No. 25/2009). Anda berhak menerbitkan pengaduan ke Ombudsman RI.
                  </p>
                  <button
                    onClick={() => onOpenOmbudsmanDraft(selectedReport)}
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Generate Draf Laporan Ombudsman RI</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-5 pt-3 border-t border-slate-100 space-y-2 bg-white shrink-0">
            <button
              onClick={() => {
                if (selectedReport?.status === "OVERDUE") {
                  onOpenOmbudsmanDraft(selectedReport);
                } else {
                  alert(
                    `Laporan ${selectedReport?.ticketCode || "JGJ-DPK-081"} saat ini berstatus: ${
                      selectedReport?.status || "Dalam Pemantauan"
                    }. Riwayat audit tercatat lengkap dalam sistem transparansi.`
                  );
                }
              }}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Lihat riwayat laporan</span>
            </button>

            <button
              onClick={() => onOpenReportModal()}
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Laporkan kerusakan di sekitar sini</span>
            </button>
          </div>
        </aside>
      )}
    </section>
  );
}
