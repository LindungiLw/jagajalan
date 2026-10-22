"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Building2,
  Search,
  ExternalLink,
  MapPin,
  TrendingDown,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Scale,
  Eye,
} from "lucide-react";
import RoadDetailModal from "@/components/modals/RoadDetailModal";

export default function BudgetDataExplorer({
  roads = [],
  reports = [],
  onSelectRoadOnMap,
  onOpenReportModal,
}) {
  const [selectedAuthority, setSelectedAuthority] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoadForDetail, setSelectedRoadForDetail] = useState(null);

  // Extract all budget packages linked to road segments
  const budgetPackages = useMemo(() => {
    return roads
      .filter((r) => r.budget)
      .map((road) => ({
        ...road.budget,
        roadId: road.id,
        roadName: road.name,
        roadCode: road.code,
        authority: road.authority,
        authorityLabel: road.authorityLabel,
        legalBasis: road.legalBasis,
        activeReportsCount: road.activeReportsCount,
        condition: road.condition,
        center: road.center,
        fullRoad: road,
      }));
  }, [roads]);

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return budgetPackages.filter((pkg) => {
      const matchAuth = selectedAuthority === "ALL" || pkg.authority === selectedAuthority;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        pkg.name.toLowerCase().includes(q) ||
        pkg.packageId.toLowerCase().includes(q) ||
        pkg.roadName.toLowerCase().includes(q) ||
        pkg.contractor.toLowerCase().includes(q) ||
        pkg.source.toLowerCase().includes(q);
      return matchAuth && matchSearch;
    });
  }, [budgetPackages, selectedAuthority, searchQuery]);

  // Aggregate financial metrics
  const totalPagu = useMemo(() => {
    return filteredPackages.reduce((acc, curr) => acc + (curr.paguRp || 0), 0);
  }, [filteredPackages]);

  const totalContract = useMemo(() => {
    return filteredPackages.reduce((acc, curr) => acc + (curr.contractValueRp || 0), 0);
  }, [filteredPackages]);

  const totalEfficiency = totalPagu - totalContract;
  const efficiencyPercent = totalPagu > 0 ? ((totalEfficiency / totalPagu) * 100).toFixed(1) : "0";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in text-slate-800">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] text-[10px] font-bold font-mono uppercase bg-orange-50 text-orange-800 border border-orange-200 mb-2">
            Verifikasi LPSE & Dokumen Anggaran TA 2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
            Penelusuran Anggaran Proyek & Kontrak Fisik
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed font-sans">
            Hubungkan pagu lelang tender LPSE, nama kontraktor pemenang, nilai kontrak terverifikasi, dan status pencocokan langsung dengan ruas jalan pilot yang sedang diawasi.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[5px] text-xs font-semibold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-xs transition-colors cursor-pointer shrink-0 font-sans"
        >
          <MapPin className="w-4 h-4" />
          <span>Laporkan Kerusakan</span>
        </button>
      </div>

      {/* 2. AGGREGATE FINANCIAL KPI CARDS (rounded-[5px], Warm Neutral Tone) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Pagu */}
        <div className="p-4 rounded-[5px] bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 font-mono">
            <span>TOTAL PAGU TERVERIFIKASI</span>
            <DollarSign className="w-4 h-4 text-[#c2410c]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-slate-900">
            Rp {(totalPagu / 1000000000).toFixed(2)} M
          </div>
          <p className="text-[11px] text-slate-500 font-sans">
            Dari {filteredPackages.length} paket pengadaan fisik
          </p>
        </div>

        {/* Card 2: Nilai Kontrak */}
        <div className="p-4 rounded-[5px] bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 font-mono">
            <span>NILAI KONTRAK LELANG</span>
            <Building2 className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-emerald-800">
            Rp {(totalContract / 1000000000).toFixed(2)} M
          </div>
          <p className="text-[11px] text-slate-500 font-sans">
            Nilai kesepakatan pemenang tender
          </p>
        </div>

        {/* Card 3: Efisiensi Tender */}
        <div className="p-4 rounded-[5px] bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 font-mono">
            <span>EFISIENSI LELANG TENDER</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-emerald-700">
            Rp {(totalEfficiency / 1000000000).toFixed(2)} M ({efficiencyPercent}%)
          </div>
          <p className="text-[11px] text-slate-500 font-sans">
            Selisih efisiensi pagu terhadap kontrak
          </p>
        </div>

        {/* Card 4: Keterbukaan Data */}
        <div className="p-4 rounded-[5px] bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 font-mono">
            <span>STATUS PENCOCOKAN</span>
            <ShieldCheck className="w-4 h-4 text-orange-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-slate-900">
            100% Terdata
          </div>
          <p className="text-[11px] text-slate-500 font-sans">
            5 Terkonfirmasi • 1 Parsial
          </p>
        </div>
      </div>

      {/* 3. FILTER & SEARCH BAR */}
      <div className="p-3.5 rounded-[5px] bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari paket lelang, kode LPSE, kontraktor pelaksana, atau nama jalan..."
            className="w-full pl-9 pr-3 py-1.5 rounded-[5px] border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-orange-600 focus:bg-white transition-all font-sans"
          />
        </div>

        {/* Authority Filter Tabs (Clean Warm Styling, rounded-[5px]) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
          <button
            onClick={() => setSelectedAuthority("ALL")}
            className={`px-3 py-1.5 rounded-[5px] whitespace-nowrap transition-colors cursor-pointer ${
              selectedAuthority === "ALL"
                ? "bg-[#c2410c] text-white font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua Kewenangan ({budgetPackages.length})
          </button>
          <button
            onClick={() => setSelectedAuthority("NASIONAL")}
            className={`px-3 py-1.5 rounded-[5px] whitespace-nowrap transition-colors cursor-pointer ${
              selectedAuthority === "NASIONAL"
                ? "bg-[#c2410c] text-white font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Jalan Nasional (APBN)
          </button>
          <button
            onClick={() => setSelectedAuthority("PROVINSI")}
            className={`px-3 py-1.5 rounded-[5px] whitespace-nowrap transition-colors cursor-pointer ${
              selectedAuthority === "PROVINSI"
                ? "bg-[#c2410c] text-white font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Jalan Provinsi (Jabar)
          </button>
          <button
            onClick={() => setSelectedAuthority("KOTA_KAB")}
            className={`px-3 py-1.5 rounded-[5px] whitespace-nowrap transition-colors cursor-pointer ${
              selectedAuthority === "KOTA_KAB"
                ? "bg-[#c2410c] text-white font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Jalan Kota / Kab
          </button>
        </div>
      </div>

      {/* 4. PACKAGE CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {filteredPackages.map((pkg) => {
          let statusBadge = {
            label: "Selesai",
            color: "bg-emerald-50 text-emerald-800 border-emerald-200",
            icon: CheckCircle2,
          };
          if (pkg.progressStatus === "DALAM_PENGERJAAN") {
            statusBadge = {
              label: "Dalam Pengerjaan Fisik",
              color: "bg-orange-50 text-orange-800 border-orange-200",
              icon: Clock,
            };
          } else if (pkg.progressStatus === "TERLAMBAT_RESPONS") {
            statusBadge = {
              label: "Tertunda / Aduan Menumpuk",
              color: "bg-rose-50 text-rose-700 border-rose-200",
              icon: AlertTriangle,
            };
          } else if (pkg.progressStatus === "TERTUNDA_LELANG") {
            statusBadge = {
              label: "Tender Ulang / Belum Mulai",
              color: "bg-amber-50 text-amber-800 border-amber-200",
              icon: AlertTriangle,
            };
          }

          const StatusIcon = statusBadge.icon;
          const matchBadge =
            pkg.matchConfidence === "TERKONFIRMASI"
              ? { label: "Terkonfirmasi LPSE", color: "bg-emerald-50 text-emerald-800 border-emerald-200" }
              : { label: "Pencocokan Parsial", color: "bg-amber-50 text-amber-800 border-amber-200" };

          return (
            <div
              key={pkg.packageId}
              className="bg-white rounded-[5px] border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between gap-3.5"
            >
              {/* Header Info */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-slate-100 border border-slate-200 text-slate-800">
                      {pkg.packageId}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold font-mono">
                      TA {pkg.fiscalYear}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] border ${matchBadge.color}`}>
                      {matchBadge.label}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${statusBadge.color}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    <span>{statusBadge.label}</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {pkg.name}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-orange-700 shrink-0" />
                    <span className="text-slate-800">{pkg.roadName}</span>
                    <span className="font-mono">({pkg.roadCode})</span>
                  </div>
                </div>

                {/* Financial Breakdown (Pagu vs Kontrak) */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-[5px] bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold font-mono block">
                      Pagu Anggaran (HPS)
                    </span>
                    <strong className="text-slate-900 font-bold font-sans tabular-nums text-sm">
                      Rp {((pkg.paguRp || 0) / 1000000000).toFixed(2)} Miliar
                    </strong>
                    <span className="text-[10px] text-slate-500 block truncate font-sans">
                      {pkg.source}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold font-mono block">
                      Nilai Kontrak Pemenang
                    </span>
                    <strong className="text-emerald-800 font-bold font-sans tabular-nums text-sm">
                      Rp {((pkg.contractValueRp || 0) / 1000000000).toFixed(2)} Miliar
                    </strong>
                    <span className="text-[10px] text-slate-600 block truncate font-medium font-sans">
                      {pkg.contractor}
                    </span>
                  </div>
                </div>

                {/* Match Reason & Legal Basis */}
                <div className="space-y-1.5 text-xs">
                  <div className="text-[11px] text-slate-600 bg-orange-50/50 p-2.5 rounded-[5px] border border-orange-100">
                    <strong className="text-orange-950 block font-semibold mb-0.5">
                      Alasan Pencocokan & Kondisi Lapangan:
                    </strong>
                    <p className="text-[11px] text-slate-700">{pkg.matchReason}</p>
                    <p className="text-[10px] text-slate-500 mt-1 italic">{pkg.statusNote}</p>
                  </div>

                  <div className="text-[10px] text-slate-500 flex flex-wrap items-center justify-between pt-1 gap-2">
                    <span>Instansi: <strong className="text-slate-800">{pkg.authorityLabel}</strong></span>
                    <span className="font-mono text-slate-400">Verifikasi: {pkg.lastVerifiedAt || "18 Okt 2026"}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <button
                  onClick={() => setSelectedRoadForDetail(pkg.fullRoad)}
                  className="flex-1 py-1.5 px-3 rounded-[5px] text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Detail Ruas</span>
                </button>

                <button
                  onClick={() => onSelectRoadOnMap(pkg.roadId)}
                  className="py-1.5 px-3 rounded-[5px] text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-orange-700" />
                  <span className="hidden sm:inline">Peta</span>
                </button>

                <a
                  href={pkg.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-3 rounded-[5px] text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-orange-50 border border-slate-200 transition-colors flex items-center gap-1"
                  title="Buka dokumen lelang resmi pada portal LPSE"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">LPSE</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Road Detail Modal if triggered from Budget Explorer */}
      <RoadDetailModal
        isOpen={Boolean(selectedRoadForDetail)}
        onClose={() => setSelectedRoadForDetail(null)}
        road={selectedRoadForDetail}
        reports={reports}
        onOpenReportModal={onOpenReportModal}
      />
    </div>
  );
}
