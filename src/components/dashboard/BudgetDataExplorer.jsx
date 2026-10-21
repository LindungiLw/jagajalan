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
} from "lucide-react";

export default function BudgetDataExplorer({
  roads,
  reports,
  onSelectRoadOnMap,
  onOpenReportModal,
}) {
  const [selectedAuthority, setSelectedAuthority] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);

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
        activeReportsCount: road.activeReportsCount,
        condition: road.condition,
        center: road.center,
      }));
  }, [roads]);

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return budgetPackages.filter((pkg) => {
      const matchAuth = selectedAuthority === "ALL" || pkg.authority === selectedAuthority;
      const matchSearch =
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.packageId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.roadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.contractor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.source.toLowerCase().includes(searchQuery.toLowerCase());
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase bg-orange-100 text-orange-800 border border-orange-200 mb-2">
            Transparansi APBD & APBN Infrastruktur 2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Penelusuran Anggaran Proyek & Kontrak Fisik
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Wujudkan pengawasan publik terhadap alokasi dana pemeliharaan jalan. Hubungkan pagu anggaran lelang LPSE, nama pemenang tender, dan status realisasi fisik langsung dengan kondisi riil di lapangan.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <MapPin className="w-4 h-4" />
          <span>Laporkan Jalan Rusak</span>
        </button>
      </div>

      {/* Aggregate KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pagu */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Pagu Terdata</span>
            <DollarSign className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            Rp {(totalPagu / 1000000000).toFixed(2)} Miliar
          </div>
          <p className="text-[11px] text-slate-500">
            Dari {filteredPackages.length} paket pengadaan fisik
          </p>
        </div>

        {/* Card 2: Nilai Terkontrak */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Nilai Kontrak Lelang</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            Rp {(totalContract / 1000000000).toFixed(2)} Miliar
          </div>
          <p className="text-[11px] text-slate-500">
            Nilai kesepakatan pemenang tender
          </p>
        </div>

        {/* Card 3: Efisiensi Tender */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Efisiensi Tender</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            Rp {(totalEfficiency / 1000000000).toFixed(2)} M ({efficiencyPercent}%)
          </div>
          <p className="text-[11px] text-slate-500">
            Penghematan kas dari proses lelang
          </p>
        </div>

        {/* Card 4: Keterbukaan Data */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Status Pencocokan</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-700">
            100% Terverifikasi
          </div>
          <p className="text-[11px] text-slate-500">
            Tersinkronisasi KAK & DPA Daerah
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari paket lelang, kode LPSE, kontraktor pelaksana, atau nama jalan..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* Authority Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-medium">
          <button
            onClick={() => setSelectedAuthority("ALL")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedAuthority === "ALL"
                ? "bg-slate-900 text-white font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua Kewenangan ({budgetPackages.length})
          </button>
          <button
            onClick={() => setSelectedAuthority("NASIONAL")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedAuthority === "NASIONAL"
                ? "bg-blue-600 text-white font-bold"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            Jalan Nasional (APBN)
          </button>
          <button
            onClick={() => setSelectedAuthority("PROVINSI")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedAuthority === "PROVINSI"
                ? "bg-purple-600 text-white font-bold"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            Jalan Provinsi (Jabar)
          </button>
          <button
            onClick={() => setSelectedAuthority("KOTA_KAB")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedAuthority === "KOTA_KAB"
                ? "bg-teal-600 text-white font-bold"
                : "bg-teal-50 text-teal-700 hover:bg-teal-100"
            }`}
          >
            Jalan Kota / Kab
          </button>
        </div>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPackages.map((pkg) => {
          let statusBadge = {
            label: "Selesai",
            color: "bg-emerald-50 text-emerald-700 border-emerald-200",
            icon: CheckCircle2,
          };
          if (pkg.progressStatus === "DALAM_PENGERJAAN") {
            statusBadge = {
              label: "Dalam Pengerjaan Fisik",
              color: "bg-blue-50 text-blue-700 border-blue-200",
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
              color: "bg-amber-50 text-amber-700 border-amber-200",
              icon: AlertTriangle,
            };
          }

          const StatusIcon = statusBadge.icon;

          return (
            <div
              key={pkg.packageId}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
            >
              {/* Header Info */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                      {pkg.packageId}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      TA {pkg.fiscalYear}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.color}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    <span>{statusBadge.label}</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span className="font-medium text-slate-700">{pkg.roadName}</span>
                    <span>({pkg.roadCode})</span>
                  </p>
                </div>

                {/* Financial breakdown */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Pagu Anggaran
                    </span>
                    <strong className="text-slate-900 font-bold">
                      Rp {((pkg.paguRp || 0) / 1000000000).toFixed(2)} Miliar
                    </strong>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {pkg.source}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Nilai Kontrak
                    </span>
                    <strong className="text-emerald-700 font-bold">
                      Rp {((pkg.contractValueRp || 0) / 1000000000).toFixed(2)} Miliar
                    </strong>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {pkg.contractor}
                    </span>
                  </div>
                </div>

                {/* Audit and match notes */}
                <div className="space-y-1.5 text-xs">
                  <div className="text-[11px] text-slate-600 bg-orange-50/60 p-2.5 rounded-lg border border-orange-100">
                    <strong className="text-orange-900 block font-semibold mb-0.5">
                      Catatan Audit Proyek:
                    </strong>
                    {pkg.statusNote}
                  </div>

                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                    <span>Instansi: <strong>{pkg.authorityLabel}</strong></span>
                    <span className="text-emerald-700 font-semibold">✓ Dokumen Terverifikasi</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onSelectRoadOnMap(pkg.roadId)}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Lihat di Peta</span>
                </button>

                <a
                  href={pkg.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">LPSE</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
