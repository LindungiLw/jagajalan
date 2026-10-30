"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
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
  Eye,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Activity,
  LayoutGrid,
  Table as TableIcon,
  ArrowUpDown,
  FileCheck2,
} from "lucide-react";
import RoadDetailModal from "@/components/modals/RoadDetailModal";

// Helper format Rupiah singkat
function formatRupiahShort(amount) {
  if (!amount || isNaN(amount)) return "Rp 0";
  if (amount >= 1e12) return `Rp ${(amount / 1e12).toFixed(2)} Triliun`;
  if (amount >= 1e9) return `Rp ${(amount / 1e9).toFixed(2)} Miliar`;
  if (amount >= 1e6) return `Rp ${(amount / 1e6).toFixed(1)} Juta`;
  return `Rp ${Number(amount).toLocaleString("id-ID")}`;
}

export default function BudgetDataExplorer({
  roads = [],
  reports = [],
  onSelectRoadOnMap,
  onOpenReportModal,
}) {
  const [selectedAuthority, setSelectedAuthority] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoadForDetail, setSelectedRoadForDetail] = useState(null);
  const [anomalyFilterOnly, setAnomalyFilterOnly] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [sortBy, setSortBy] = useState("value-desc"); // "value-desc" | "efficiency-desc" | "progress-desc"
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // State sinkronisasi API Handler (Vercel Serverless Ready)
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [syncFeedback, setSyncFeedback] = useState(null);
  const [apiPackages, setApiPackages] = useState(null);

  // Fetch dari Next.js API Route Handler /api/procurement
  const fetchProcurementData = useCallback(async (isManualTrigger = false) => {
    try {
      if (isManualTrigger) setIsSyncing(true);
      const url = `/api/procurement?authority=${selectedAuthority}${isManualTrigger ? "&sync=true" : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      if (data && data.success && Array.isArray(data.packages)) {
        setApiPackages(data.packages);
        const now = new Date();
        const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
        setLastSyncedAt(timeStr);

        if (isManualTrigger) {
          setSyncFeedback(`Sinkronisasi sukses: ${data.packages.length} paket audit diperbarui.`);
          setTimeout(() => setSyncFeedback(null), 4000);
        }
      }
    } catch (err) {
      console.warn("Gagal fetch /api/procurement, menggunakan data lokal:", err);
      if (isManualTrigger) {
        setSyncFeedback("Menggunakan cache data lokal terverifikasi.");
        setTimeout(() => setSyncFeedback(null), 3500);
      }
    } finally {
      if (isManualTrigger) setIsSyncing(false);
    }
  }, [selectedAuthority]);

  // Initial load
  useEffect(() => {
    fetchProcurementData(false);
  }, [fetchProcurementData]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedAuthority, searchQuery, anomalyFilterOnly, sortBy]);

  // Extract all budget packages linked to road segments
  const localBudgetPackages = useMemo(() => {
    return roads
      .filter((r) => r.budget)
      .map((road) => {
        const paguRp = Number(road.budget.paguRp) || 0;
        const contractValueRp = Number(road.budget.contractValueRp) || 0;
        const lengthKm = Number(road.lengthKm) || 0;
        const efficiencyRp = paguRp > contractValueRp ? paguRp - contractValueRp : 0;
        const efficiencyPct = paguRp > 0 ? Number(((efficiencyRp / paguRp) * 100).toFixed(2)) : 0;
        const costPerKmRp = lengthKm > 0 ? Math.round(contractValueRp / lengthKm) : 0;
        const isLowTenderCompetition = efficiencyPct < 1.0 && paguRp > 0;
        const isNegativeDeviationRisk =
          Number(road.budget.progressPct) < 50 &&
          (road.budget.progressStatus === "TERLAMBAT_RESPONS" || road.budget.progressStatus === "TERTUNDA_LELANG");

        const packageId =
          road.budget.packageId ||
          (road.authority === "PROVINSI"
            ? `PKG-PRV-${(road.provinceId || "DAERAH").toUpperCase()}-${road.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`
            : road.authority === "NASIONAL"
            ? `PKG-APBN-${road.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`
            : `PKG-${(road.authority || "DAERAH").toUpperCase()}-${road.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`);

        return {
          ...road.budget,
          packageId,
          paguRp,
          contractValueRp,
          roadId: road.id,
          roadName: road.name,
          roadCode: road.code,
          authority: road.authority,
          authorityLabel: road.authorityLabel,
          legalBasis: road.legalBasis,
          activeReportsCount: road.activeReportsCount,
          condition: road.condition,
          center: road.center,
          lengthKm,
          calculations: {
            efficiencyRp,
            efficiencyPct,
            costPerKmRp,
            costPerKmFormatted: costPerKmRp > 0 ? `${formatRupiahShort(costPerKmRp)}/km` : "N/A",
          },
          audit: {
            isLowTenderCompetition,
            isNegativeDeviationRisk,
            statusLabel: isNegativeDeviationRisk
              ? "Deviasi Negatif"
              : isLowTenderCompetition
              ? "Tender Minim (<1%)"
              : "Sesuai Standar",
            riskLevel: isNegativeDeviationRisk ? "TINGGI" : isLowTenderCompetition ? "PERHATIAN" : "RENDAH",
          },
          fullRoad: road,
        };
      });
  }, [roads]);

  // Unified packages (API first, local fallback)
  const allPackages = useMemo(() => {
    if (apiPackages && apiPackages.length > 0) {
      return apiPackages.map((pkg) => {
        const matchedRoad = roads.find((r) => r.id === pkg.road?.id);
        return {
          ...pkg,
          roadId: pkg.road?.id,
          roadName: pkg.road?.name,
          roadCode: pkg.road?.code,
          authority: pkg.road?.authority,
          authorityLabel: pkg.road?.authorityLabel,
          condition: pkg.road?.condition,
          legalBasis: pkg.road?.legalBasis,
          center: pkg.road?.center,
          fullRoad: matchedRoad || {
            id: pkg.road?.id,
            name: pkg.road?.name,
            code: pkg.road?.code,
            authority: pkg.road?.authority,
            authorityLabel: pkg.road?.authorityLabel,
            center: pkg.road?.center || [-6.2, 106.8],
            coordinates: [],
            budget: {
              packageId: pkg.packageId,
              name: pkg.name,
              paguRp: pkg.paguRp,
              contractValueRp: pkg.contractValueRp,
              contractor: pkg.contractor,
              fiscalYear: pkg.fiscalYear,
              source: pkg.source,
              progressStatus: pkg.progressStatus,
              progressPct: pkg.progressPct,
            },
          },
        };
      });
    }
    return localBudgetPackages;
  }, [apiPackages, localBudgetPackages, roads]);

  // Filtered & Sorted packages
  const filteredPackages = useMemo(() => {
    const filtered = allPackages.filter((pkg) => {
      let matchAuth = true;
      if (selectedAuthority !== "ALL") {
        if (selectedAuthority === "KOTA_KAB") {
          matchAuth =
            pkg.authority === "KOTA_KAB" || pkg.authority === "KOTA" || pkg.authority === "KABUPATEN";
        } else {
          matchAuth = pkg.authority === selectedAuthority;
        }
      }

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (pkg.name && pkg.name.toLowerCase().includes(q)) ||
        (pkg.packageId && pkg.packageId.toLowerCase().includes(q)) ||
        (pkg.roadName && pkg.roadName.toLowerCase().includes(q)) ||
        (pkg.contractor && pkg.contractor.toLowerCase().includes(q)) ||
        (pkg.source && pkg.source.toLowerCase().includes(q));

      const matchAnomaly =
        !anomalyFilterOnly ||
        pkg.audit?.isLowTenderCompetition ||
        pkg.audit?.isNegativeDeviationRisk;

      return matchAuth && matchSearch && matchAnomaly;
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === "value-desc") {
        return (b.paguRp || 0) - (a.paguRp || 0);
      }
      if (sortBy === "efficiency-desc") {
        return (b.calculations?.efficiencyPct || 0) - (a.calculations?.efficiencyPct || 0);
      }
      if (sortBy === "progress-desc") {
        return (Number(b.progressPct) || 0) - (Number(a.progressPct) || 0);
      }
      return 0;
    });
  }, [allPackages, selectedAuthority, searchQuery, anomalyFilterOnly, sortBy]);

  // Aggregate financial metrics
  const totalPagu = useMemo(() => {
    return filteredPackages.reduce((acc, curr) => acc + (curr.paguRp || 0), 0);
  }, [filteredPackages]);

  const totalContract = useMemo(() => {
    return filteredPackages.reduce((acc, curr) => acc + (curr.contractValueRp || 0), 0);
  }, [filteredPackages]);

  const totalEfficiency = totalPagu > totalContract ? totalPagu - totalContract : 0;
  const efficiencyPercent = totalPagu > 0 ? ((totalEfficiency / totalPagu) * 100).toFixed(1) : "0";

  const averageCostPerKm = useMemo(() => {
    const valid = filteredPackages.filter((p) => p.calculations?.costPerKmRp > 0);
    if (valid.length === 0) return 0;
    const sum = valid.reduce((acc, curr) => acc + curr.calculations.costPerKmRp, 0);
    return Math.round(sum / valid.length);
  }, [filteredPackages]);

  const anomalyCount = useMemo(() => {
    return allPackages.filter(
      (p) => p.audit?.isLowTenderCompetition || p.audit?.isNegativeDeviationRisk
    ).length;
  }, [allPackages]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPackages.length / pageSize) || 1;
  const paginatedPackages = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPackages.slice(start, start + pageSize);
  }, [filteredPackages, currentPage, pageSize]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6 animate-fade-in text-slate-800">
      
      {/* 1. SIGNATURE HEADER */}
      <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-50 border border-orange-200/80 p-2 shadow-2xs shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon/financial.png"
                alt="Audit Anggaran"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                  <span>Keterbukaan Informasi Publik (UU No. 14/2008)</span>
                </span>
                {lastSyncedAt && (
                  <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
                    Sinkron {lastSyncedAt} WIB
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
                Penelusuran Anggaran Proyek &amp; Audit LPSE
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed font-sans">
                Memadankan titik aduan jalan warga dengan kontrak pengadaan resmi pemerintah: pagu lelang HPS, efisiensi penawaran, serta kontraktor pelaksana.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-auto">
            <button
              onClick={() => fetchProcurementData(true)}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 shadow-2xs transition-all cursor-pointer disabled:opacity-50 font-sans"
              title="Sinkronkan data dengan portal LPSE & INAPROC"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-orange-600 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Menyinkronkan..." : "Perbarui Data"}</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-sm hover:shadow-md transition-all cursor-pointer font-sans active:scale-[0.98]"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-100" />
              <span>Laporkan Ruas Jalan</span>
            </button>
          </div>
        </div>

        {/* Sync Toast Feedback */}
        {syncFeedback && (
          <div className="p-2.5 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-950 font-medium font-sans flex items-center gap-2 animate-fade-in shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}
      </div>

      {/* 2. SIGNATURE FINANCIAL SCOREBOARD (Punchy, Clean, Scannable) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 font-sans">
              Total Pagu HPS
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200/80 flex items-center justify-center text-orange-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-slate-900 tracking-tight">
              {formatRupiahShort(totalPagu)}
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Dari <strong>{filteredPackages.length}</strong> paket lelang resmi
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 font-sans">
              Nilai Kontrak Pemenang
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-emerald-800 tracking-tight">
              {formatRupiahShort(totalContract)}
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Realisasi kesepakatan surat kontrak
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 font-sans">
              Efisiensi Lelang
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-emerald-700 tracking-tight flex items-baseline gap-1.5">
              <span>{formatRupiahShort(totalEfficiency)}</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                {efficiencyPercent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Selisih hemat dari pagu anggaran awal
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 font-sans">
              Biaya Rata-rata / KM
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-slate-900 tracking-tight">
              {averageCostPerKm > 0 ? `${formatRupiahShort(averageCostPerKm)}/km` : "N/A"}
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Benchmark per kilometer preservasi jalan
            </p>
          </div>
        </div>
      </div>

      {/* 3. CONTROLS BAR: SEARCH, CHIP FILTERS, SORT & VIEW TOGGLE */}
      <div className="bg-white/95 backdrop-blur-xl p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <img src="/icon/search_icon.png" alt="" className="w-4 h-4 object-contain absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode paket, nama ruas jalan, atau kontraktor pelaksana..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector & View Mode Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer font-sans"
              >
                <option value="value-desc">Nilai Anggaran Tertinggi</option>
                <option value="efficiency-desc">Efisiensi Hemat Tertinggi</option>
                <option value="progress-desc">Progres Fisik Tertinggi</option>
              </select>
            </div>

            {/* View Mode Toggle: Grid vs Table */}
            <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Tampilan Kartu"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Kartu</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Tampilan Tabel Audit"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Tabel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Chips Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", label: `Semua (${allPackages.length})` },
              { id: "NASIONAL", label: "Jalan Nasional (APBN)" },
              { id: "PROVINSI", label: "Jalan Provinsi (APBD I)" },
              { id: "KOTA_KAB", label: "Jalan Kab/Kota (APBD II)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedAuthority(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedAuthority === tab.id
                    ? "bg-orange-700 text-white shadow-2xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80"
                }`}
              >
                {tab.label}
              </button>
            ))}

            {/* Anomaly Badge Filter */}
            <button
              onClick={() => setAnomalyFilterOnly(!anomalyFilterOnly)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                anomalyFilterOnly
                  ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                  : "bg-amber-50/70 hover:bg-amber-100/70 text-amber-900 border-amber-200"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Sorotan Audit ({anomalyCount})</span>
            </button>
          </div>

          {/* Package Count summary */}
          <div className="text-xs text-slate-400 font-sans">
            Menampilkan <strong>{filteredPackages.length}</strong> paket pengadaan
          </div>
        </div>
      </div>

      {/* 4. CONTENT DISPLAY (GRID OR TABLE) */}
      {filteredPackages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-3 shadow-xs">
          <AlertCircle className="w-9 h-9 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Paket Pengadaan yang Cocok</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Tidak ditemukan paket lelang dengan filter atau kata kunci saat ini. Coba reset pencarian atau ganti status wewenang.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedAuthority("ALL");
              setAnomalyFilterOnly(false);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
          >
            Reset Filter Pencarian
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ===== CHARACTER CARD GRID (Clean, Scannable, 2-Columns) ===== */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {paginatedPackages.map((pkg, idx) => {
            const isDevRisk = pkg.audit?.isNegativeDeviationRisk;
            const isLowComp = pkg.audit?.isLowTenderCompetition;
            const cardKey = pkg.packageId || `pkg-${pkg.roadId || idx}`;

            // Clean Authority Badge
            const authorityBadge =
              pkg.authority === "NASIONAL"
                ? { label: "Nasional (Pusat)", color: "bg-slate-50 text-slate-800 border-slate-200" }
                : pkg.authority === "PROVINSI"
                ? { label: "Provinsi", color: "bg-amber-50 text-amber-900 border-amber-200" }
                : { label: "Kabupaten/Kota", color: "bg-stone-50 text-stone-800 border-stone-200" };

            return (
              <div
                key={cardKey}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-orange-300 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between gap-4 group"
              >
                {/* Card Top: Code & Status Badges */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/90 text-slate-800 shadow-2xs">
                        {pkg.packageId}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${authorityBadge.color}`}>
                        {authorityBadge.label}
                      </span>
                      <span className="text-[10.5px] text-slate-500 font-sans tabular-nums">
                        TA {pkg.fiscalYear}
                      </span>
                    </div>

                    {/* Progress / Risk Badge */}
                    <div className="flex items-center gap-1.5">
                      {isDevRisk ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Deviasi Negatif</span>
                        </span>
                      ) : isLowComp ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Tender Minim</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Fisik: {pkg.progressPct || 0}%</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Linked Road Name */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-orange-950 transition-colors line-clamp-2">
                      {pkg.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium font-sans">
                      <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span className="text-slate-700 truncate">{pkg.roadName}</span>
                      {pkg.roadCode && <span className="text-slate-400 font-mono text-[11px]">({pkg.roadCode})</span>}
                    </div>
                  </div>

                  {/* Financial Triplet Box */}
                  <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs font-sans">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Pagu HPS
                      </span>
                      <strong className="text-slate-900 font-bold tabular-nums text-xs sm:text-sm block">
                        {formatRupiahShort(pkg.paguRp)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Nilai Kontrak
                      </span>
                      <strong className="text-emerald-800 font-bold tabular-nums text-xs sm:text-sm block">
                        {formatRupiahShort(pkg.contractValueRp)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Efisiensi Lelang
                      </span>
                      <div className="flex items-baseline gap-1">
                        <strong className="text-emerald-700 font-bold tabular-nums text-xs sm:text-sm">
                          {formatRupiahShort(pkg.calculations?.efficiencyRp)}
                        </strong>
                        <span className="text-[10px] font-semibold text-emerald-600">
                          ({pkg.calculations?.efficiencyPct || 0}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contractor & Verification Details */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-medium text-slate-700">
                        {pkg.contractor || "Dalam Penunjukan"}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 shrink-0">
                      {pkg.calculations?.costPerKmFormatted && pkg.calculations?.costPerKmFormatted !== "N/A"
                        ? `${pkg.calculations.costPerKmFormatted}`
                        : "Biaya Standar"}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedRoadForDetail(pkg.fullRoad)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-orange-700 hover:bg-orange-800 shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Detail Ruas</span>
                  </button>

                  <button
                    onClick={() => onSelectRoadOnMap(pkg.roadId)}
                    className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer font-sans"
                    title="Buka lokasi ruas jalan pada Peta Transparansi"
                  >
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    <span className="hidden sm:inline">Peta</span>
                  </button>

                  {pkg.sourceUrl && (
                    <a
                      href={pkg.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1 font-sans"
                      title="Buka dokumen tender pada LPSE resmi"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span className="hidden sm:inline">LPSE</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ===== SIGNATURE AUDIT TABLE VIEW ===== */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10.5px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Paket &amp; Ruas Jalan</th>
                  <th className="py-3 px-3">Wewenang</th>
                  <th className="py-3 px-3 text-right">Pagu HPS</th>
                  <th className="py-3 px-3 text-right">Nilai Kontrak</th>
                  <th className="py-3 px-3 text-right">Efisiensi</th>
                  <th className="py-3 px-3">Kontraktor Pelaksana</th>
                  <th className="py-3 px-3 text-center">Fisik</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedPackages.map((pkg, idx) => (
                  <tr key={pkg.packageId || idx} className="hover:bg-orange-50/40 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{pkg.name}</div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <span className="font-mono text-slate-700 font-semibold">{pkg.packageId}</span>
                        <span>•</span>
                        <span>{pkg.roadName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {pkg.authority}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {formatRupiahShort(pkg.paguRp)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-800 tabular-nums whitespace-nowrap">
                      {formatRupiahShort(pkg.contractValueRp)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums whitespace-nowrap">
                      <span className="text-emerald-700 font-bold">
                        {formatRupiahShort(pkg.calculations?.efficiencyRp)}
                      </span>
                      <span className="text-[10px] text-emerald-600 block">
                        ({pkg.calculations?.efficiencyPct || 0}%)
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-[180px] truncate font-medium text-slate-800">
                      {pkg.contractor || "-"}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        {pkg.progressPct || 0}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedRoadForDetail(pkg.fullRoad)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-orange-700 hover:text-white bg-orange-50 hover:bg-orange-700 border border-orange-200 transition-colors cursor-pointer"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. CLEAN PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-2 font-sans text-xs">
          <div className="text-slate-500">
            Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (
            {filteredPackages.length} paket total)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Sebelumnya
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all cursor-pointer tabular-nums ${
                    currentPage === pageNum
                      ? "bg-orange-700 text-white border-orange-700 shadow-2xs"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}

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
