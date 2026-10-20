"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Filter,
  Search,
  Building2,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  ChevronRight,
  Shield,
  Camera,
  CheckCircle2,
} from "lucide-react";

// Dynamic import with SSR disabled to prevent Leaflet "window is not defined" error
const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] rounded-xl bg-slate-100 flex flex-col items-center justify-center gap-2 text-slate-400">
      <div className="w-7 h-7 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-medium">Memuat Peta Geospasial...</span>
    </div>
  ),
});

export default function MapExplorer({
  roads,
  reports,
  onOpenOmbudsmanDraft,
  onOpenReportModal,
}) {
  const [selectedRoad, setSelectedRoad] = useState(roads[0] || null);
  const [selectedReport, setSelectedReport] = useState(reports[0] || null);
  const [authorityFilter, setAuthorityFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState([-6.3985, 106.825]);

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
    setSelectedReport(null);
    setMapCenter(road.center);
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    const parentRoad = roads.find((r) => r.id === report.roadSegmentId);
    if (parentRoad) setSelectedRoad(parentRoad);
    setMapCenter(report.coordinates);
  };

  return (
    <section id="peta-transparansi" className="py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Filter & Toolbar Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs mb-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama jalan atau wilayah (misal: Margonda, Cileungsi, Sawangan)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
          />
        </div>

        {/* Authority Segmented Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-medium">
          <span className="text-slate-400 text-xs mr-1 hidden sm:inline">Wewenang:</span>
          <button
            onClick={() => setAuthorityFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              authorityFilter === "ALL"
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            Semua Ruas
          </button>
          <button
            onClick={() => setAuthorityFilter("NASIONAL")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              authorityFilter === "NASIONAL"
                ? "bg-blue-600 text-white font-semibold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            Nasional (PUPR)
          </button>
          <button
            onClick={() => setAuthorityFilter("PROVINSI")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              authorityFilter === "PROVINSI"
                ? "bg-purple-600 text-white font-semibold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            Provinsi (Bina Marga)
          </button>
          <button
            onClick={() => setAuthorityFilter("KOTA_KAB")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              authorityFilter === "KOTA_KAB"
                ? "bg-teal-600 text-white font-semibold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            Kota/Kab (Dinas PU)
          </button>
        </div>

        {/* Legend */}
        <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Nasional</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span>Provinsi</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <span>Kota/Kab</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Live Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Interactive Map Viewport */}
        <div className="lg:col-span-8 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="h-[540px] rounded-xl overflow-hidden border border-slate-200 relative bg-slate-50">
            <MapInner
              roads={filteredRoads}
              reports={filteredReports}
              selectedRoad={selectedRoad}
              selectedReport={selectedReport}
              onSelectRoad={handleSelectRoad}
              onSelectReport={handleSelectReport}
              mapCenter={mapCenter}
            />
          </div>

          {/* Map Status Bar */}
          <div className="px-2 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Ruas Terdata: <strong>{filteredRoads.length}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>Titik Aduan: <strong>{filteredReports.length}</strong></span>
              </span>
            </div>
            <button
              onClick={onOpenReportModal}
              className="text-orange-600 hover:text-orange-700 font-semibold text-xs flex items-center gap-1"
            >
              <span>+ Tambah Laporan Kerusakan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Detailed Inspector Panel */}
        <div className="lg:col-span-4 space-y-4">
          {selectedReport ? (
            /* Selected Citizen Report Card */
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              {/* Ticket Code & Status */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-mono font-bold text-slate-900 text-xs px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
                  {selectedReport.ticketCode}
                </span>
                {selectedReport.status === "OVERDUE" ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                    OVERDUE SLA (+{selectedReport.daysOverdue} HARI)
                  </span>
                ) : selectedReport.status === "DALAM_PENGERJAAN" ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                    DALAM PENGERJAAN
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    SELESAI DIPERBAIKI
                  </span>
                )}
              </div>

              {/* Title & Location */}
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedReport.roadName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedReport.address} ({selectedReport.district})</p>
              </div>

              {/* Verified Image Preview */}
              {selectedReport.photoUrl && (
                <div className="rounded-xl overflow-hidden relative border border-slate-200 h-36 bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedReport.photoUrl}
                    alt={selectedReport.categoryLabel}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-white/95 text-[10px] font-bold text-slate-800 shadow-xs border border-slate-200 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-orange-600" />
                    <span>Terverifikasi AI Vision</span>
                  </div>
                </div>
              )}

              {/* Damage Details & Hazard Score */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-800">{selectedReport.categoryLabel}</span>
                  <span className="text-rose-700 font-extrabold">Skor Risiko: {selectedReport.hazardScore}/100</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {selectedReport.aiAnalysis}
                </p>
              </div>

              {/* Authority & Legal Mandate */}
              <div
                className="p-3.5 rounded-xl border text-xs space-y-1"
                style={{
                  backgroundColor: selectedReport.authority === "NASIONAL" ? "#eff6ff" : selectedReport.authority === "PROVINSI" ? "#faf5ff" : "#f0fdfa",
                  borderColor: selectedReport.authority === "NASIONAL" ? "#bfdbfe" : selectedReport.authority === "PROVINSI" ? "#e9d5ff" : "#99f6e4",
                }}
              >
                <div
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: selectedReport.authority === "NASIONAL" ? "#1d4ed8" : selectedReport.authority === "PROVINSI" ? "#6d28d9" : "#0f766e",
                  }}
                >
                  Instansi Penanggung Jawab Resmi:
                </div>
                <div className="font-bold text-slate-900">{selectedReport.authorityLabel}</div>
                <div className="text-[11px] text-slate-600">{selectedReport.legalBasis}</div>
              </div>

              {/* Linked APBD Procurement with Match Confidence */}
              {selectedReport.matchingBudget && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      Paket Tender APBD:
                    </span>
                    <span className="text-orange-700 font-extrabold">
                      Rp {((selectedReport.matchingBudget.paguRp || 0)/1000000000).toFixed(1)} Miliar
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700">{selectedReport.matchingBudget.packageName}</p>
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Penyedia: {selectedReport.matchingBudget.contractor || "Belum Ditentukan"}</span>
                    <span className="px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Terkonfirmasi
                    </span>
                  </div>
                </div>
              )}

              {/* Overdue Response Escalation CTA */}
              {selectedReport.status === "OVERDUE" && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 leading-snug">
                    Laporan melewati batas pemantauan tanggapan 14 hari kerja tanpa respons resmi dinas (UU No. 25/2009 & Ombudsman RI).
                  </div>
                  <button
                    onClick={() => onOpenOmbudsmanDraft(selectedReport)}
                    className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Generate Draf Laporan Ombudsman RI</span>
                  </button>
                </div>
              )}
            </div>
          ) : selectedRoad ? (
            /* Selected Road Overview */
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span
                  className="px-2.5 py-0.5 rounded text-xs font-bold uppercase"
                  style={{
                    backgroundColor: selectedRoad.authority === "NASIONAL" ? "#dbeafe" : selectedRoad.authority === "PROVINSI" ? "#f3e8ff" : "#ccfbf1",
                    color: selectedRoad.authority === "NASIONAL" ? "#1e40af" : selectedRoad.authority === "PROVINSI" ? "#6b21a8" : "#115e59",
                  }}
                >
                  Wewenang {selectedRoad.authority}
                </span>
                <span className="text-xs text-slate-500">{selectedRoad.district}</span>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">{selectedRoad.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Kode Ruas: {selectedRoad.code} • Panjang: {selectedRoad.lengthKm} KM</p>
              </div>

              <div
                className="p-3.5 rounded-xl border text-xs space-y-1"
                style={{
                  backgroundColor: selectedRoad.authority === "NASIONAL" ? "#eff6ff" : selectedRoad.authority === "PROVINSI" ? "#faf5ff" : "#f0fdfa",
                  borderColor: selectedRoad.authority === "NASIONAL" ? "#bfdbfe" : selectedRoad.authority === "PROVINSI" ? "#e9d5ff" : "#99f6e4",
                }}
              >
                <div
                  className="text-[10px] uppercase font-bold"
                  style={{
                    color: selectedRoad.authority === "NASIONAL" ? "#1d4ed8" : selectedRoad.authority === "PROVINSI" ? "#6d28d9" : "#0f766e",
                  }}
                >
                  Instansi Penanggung Jawab:
                </div>
                <div className="font-bold text-slate-900">{selectedRoad.authorityLabel}</div>
                <div className="text-[11px] text-slate-600 italic">{selectedRoad.legalBasis}</div>
              </div>

              {selectedRoad.budget && (
                <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-orange-600" />
                      Paket Tender APBD TA {selectedRoad.budget.fiscalYear}
                    </span>
                    <span className="text-orange-700 font-extrabold">
                      Rp {(selectedRoad.budget.paguRp / 1000000000).toFixed(1)} Miliar
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{selectedRoad.budget.name}</p>
                  <p className="text-[11px] text-slate-600">Kontraktor: {selectedRoad.budget.contractor}</p>
                  
                  {/* Match Confidence & Source Provenance */}
                  <div className="flex items-center justify-between pt-1 border-t border-orange-200/80 text-[10px]">
                    <span className="text-slate-600">Sumber: {selectedRoad.budget.sourceDocument || "LPSE Resmi"}</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      selectedRoad.budget.matchConfidence === "TERKONFIRMASI"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {selectedRoad.budget.matchConfidence === "TERKONFIRMASI" ? "Terkonfirmasi" : "Pencocokan Parsial"}
                    </span>
                  </div>

                  <div className="mt-1 text-[10px] p-2 rounded bg-white text-slate-700 border border-orange-200/60">
                    <strong>Catatan Progres:</strong> {selectedRoad.budget.statusNote}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Aduan Aktif di Ruas Ini:</span>
                  <span className="text-rose-600 font-extrabold text-base">{selectedRoad.activeReportsCount} Laporan</span>
                </div>
                <button
                  onClick={onOpenReportModal}
                  className="px-3 py-1.5 rounded-lg bg-orange-600 text-white font-semibold text-xs hover:bg-orange-700 shadow-xs"
                >
                  + Lapor di Ruas Ini
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">Pilih Ruas Jalan atau Titik Aduan</p>
              <p className="text-xs text-slate-500">Klik garis jalan atau titik laporan pada peta di sebelah kiri untuk melihat rincian wewenang & anggaran APBD.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
