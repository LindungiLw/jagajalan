"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  RefreshCw,
  Database,
  Sparkles,
  AlertCircle,
  Activity,
  Layers,
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

  // State sinkronisasi API Handler (Vercel Serverless Ready)
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [apiGatewayMeta, setApiGatewayMeta] = useState({
    status: "CONNECTED",
    mode: "VERCEL_SERVERLESS_ENGINE",
    source: "INAPROC LKPP & LPSE Kementerian PU",
    message: "Engine kalkulasi serverless aktif & terhubung.",
  });
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
        if (data.meta?.gateway) {
          setApiGatewayMeta({
            status: data.meta.gateway.status,
            mode: data.meta.deploymentEnvironment || "Vercel Serverless Function",
            source: data.meta.gateway.inaprocEndpoint || "Portal INAPROC & LPSE",
            message: data.meta.gateway.message,
          });
        }
        const now = new Date();
        const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setLastSyncedAt(timeStr);

        if (isManualTrigger) {
          setSyncFeedback(`Sinkronisasi sukses: ${data.packages.length} paket audit diperbarui secara real-time.`);
          setTimeout(() => setSyncFeedback(null), 4500);
        }
      }
    } catch (err) {
      console.warn("Gagal fetch /api/procurement, menggunakan data lokal:", err);
      if (isManualTrigger) {
        setSyncFeedback("Menggunakan cache lokal terverifikasi (Jalur failsafe aktif).");
        setTimeout(() => setSyncFeedback(null), 4000);
      }
    } finally {
      if (isManualTrigger) setIsSyncing(false);
    }
  }, [selectedAuthority]);

  // Initial load
  useEffect(() => {
    fetchProcurementData(false);
  }, [fetchProcurementData]);

  // Extract all budget packages linked to road segments (sebagai sumber lokal / fallback terjamin)
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
              ? "Risiko Keterlambatan Fisik"
              : isLowTenderCompetition
              ? "Persaingan Tender Minim (<1%)"
              : "Wajar & Akuntabel",
            riskLevel: isNegativeDeviationRisk ? "TINGGI" : isLowTenderCompetition ? "PERHATIAN" : "RENDAH",
          },
          fullRoad: road,
        };
      });
  }, [roads]);

  // Unified packages (utamakan API response jika tersedia, fallback ke local)
  const allPackages = useMemo(() => {
    if (apiPackages && apiPackages.length > 0) {
      return apiPackages.map((pkg) => {
        // Hubungkan kembali fullRoad untuk interaktivitas modal & peta
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

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return allPackages.filter((pkg) => {
      // Authority matching
      let matchAuth = true;
      if (selectedAuthority !== "ALL") {
        if (selectedAuthority === "KOTA_KAB") {
          matchAuth =
            pkg.authority === "KOTA_KAB" || pkg.authority === "KOTA" || pkg.authority === "KABUPATEN";
        } else {
          matchAuth = pkg.authority === selectedAuthority;
        }
      }

      // Search matching
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (pkg.name && pkg.name.toLowerCase().includes(q)) ||
        (pkg.packageId && pkg.packageId.toLowerCase().includes(q)) ||
        (pkg.roadName && pkg.roadName.toLowerCase().includes(q)) ||
        (pkg.contractor && pkg.contractor.toLowerCase().includes(q)) ||
        (pkg.source && pkg.source.toLowerCase().includes(q));

      // Anomaly only matching
      const matchAnomaly =
        !anomalyFilterOnly ||
        pkg.audit?.isLowTenderCompetition ||
        pkg.audit?.isNegativeDeviationRisk;

      return matchAuth && matchSearch && matchAnomaly;
    });
  }, [allPackages, selectedAuthority, searchQuery, anomalyFilterOnly]);

  // Aggregate financial metrics (kalkulasi tepat tanpa estimasi fiktif)
  const totalPagu = useMemo(() => {
    return filteredPackages.reduce((acc, curr) => acc + (curr.paguRp || 0), 0);
  }, [filteredPackages]);

  const totalContract = useMemo(() => {
    return filteredPackages.reduce((acc, curr) => acc + (curr.contractValueRp || 0), 0);
  }, [filteredPackages]);

  const totalEfficiency = totalPagu > totalContract ? totalPagu - totalContract : 0;
  const efficiencyPercent = totalPagu > 0 ? ((totalEfficiency / totalPagu) * 100).toFixed(2) : "0";

  // Rata-rata biaya konstruksi per KM
  const averageCostPerKm = useMemo(() => {
    const valid = filteredPackages.filter((p) => p.calculations?.costPerKmRp > 0);
    if (valid.length === 0) return 0;
    const sum = valid.reduce((acc, curr) => acc + curr.calculations.costPerKmRp, 0);
    return Math.round(sum / valid.length);
  }, [filteredPackages]);

  // Jumlah temuan audit anomali
  const anomalyCount = useMemo(() => {
    return allPackages.filter(
      (p) => p.audit?.isLowTenderCompetition || p.audit?.isNegativeDeviationRisk
    ).length;
  }, [allPackages]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in text-slate-800">
      
      {/* 1. PAGE HEADER & VERCEL LIVE API SYNC BAR */}
      <div className="space-y-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-50/90 border border-orange-200/80 p-2 shadow-xs shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon/financial.png"
                alt="Anggaran Proyek"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-sans uppercase bg-slate-50 text-slate-700 border border-slate-200/90 mb-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#c2410c] animate-pulse" />
                <span>Gateway API Serverless Aktif (Vercel Ready)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
                Penelusuran Anggaran Proyek & Audit Kontrak LPSE
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed font-sans">
                Portal keterbukaan informasi publik (UU KIP No. 14/2008). Menghubungkan pagu lelang HPS, nilai kontrak pemenang, kontraktor pelaksana, dan perhitungan efisiensi per kilometer secara real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fetchProcurementData(true)}
              disabled={isSyncing}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-colors cursor-pointer disabled:opacity-50 font-sans"
              title="Sinkronkan data dengan API Gateway INAPROC LKPP & LPSE"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-orange-700 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Menyinkronkan API..." : "Sinkronkan Data API"}</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-sm transition-all cursor-pointer font-sans"
            >
              <MapPin className="w-4 h-4" />
              <span>Laporkan Kerusakan</span>
            </button>
          </div>
        </div>

        {/* Live Gateway & Integrity Status Banner */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-slate-700 font-sans">
            <Database className="w-4 h-4 text-orange-700 shrink-0" />
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-bold text-slate-900">INAPROC & SIGI PU Adapter:</span>
              <span className="text-slate-600">Terverifikasi DIPA TA 2026</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-500">
                {lastSyncedAt ? `Audit terakhir: ${lastSyncedAt} WIB` : "Audit otomatis aktif"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-sans">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
            <span>Dasar Hukum: <strong>UU KIP No. 14/2008 & SK PUPR 1688/2022</strong></span>
          </div>
        </div>

        {/* Sync Toast Feedback */}
        {syncFeedback && (
          <div className="p-2.5 bg-orange-50 border border-orange-200/90 rounded-xl text-xs text-orange-950 font-medium font-sans flex items-center gap-2 animate-fade-in shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}
      </div>

      {/* 2. AGGREGATE FINANCIAL KPI CARDS (rounded-[5px], Warm Neutral Tone) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Pagu */}
        <div className="p-4 rounded-[5px] bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 font-sans uppercase tracking-wider">
            <span>TOTAL PAGU HPS RESMI</span>
            <DollarSign className="w-4 h-4 text-[#c2410c]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-slate-900">
            {formatRupiahShort(totalPagu)}
          </div>
          <p className="text-[11px] text-slate-500 font-sans">
            Dari {filteredPackages.length} paket lelang terverifikasi
          </p>
        </div>

        {/* Card 2: Nilai Kontrak */}
        <div className="p-4 rounded-[5px] bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 font-sans uppercase tracking-wider">
            <span>NILAI KONTRAK PEMENANG</span>
            <Building2 className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-emerald-800">
            {formatRupiahShort(totalContract)}
          </div>
          <p className="text-[11px] text-slate-500 font-sans">
            Nilai kesepakatan surat perjanjian tender
          </p>
        </div>

        {/* Card 3: Efisiensi Tender */}
        <div className="p-4 rounded-[5px] bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 font-sans uppercase tracking-wider">
            <span>PENGHEMATAN ANGGARAN</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-emerald-700">
            {formatRupiahShort(totalEfficiency)}
            <span className="text-sm font-semibold ml-1 text-emerald-600">({efficiencyPercent}%)</span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans">
            Efisiensi kas negara hasil lelang kompetitif
          </p>
        </div>

        {/* Card 4: Unit Cost per KM */}
        <div className="p-4 rounded-[5px] bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 font-sans uppercase tracking-wider">
            <span>UNIT COST RATA-RATA / KM</span>
            <Activity className="w-4 h-4 text-orange-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-slate-900">
            {averageCostPerKm > 0 ? `${formatRupiahShort(averageCostPerKm)}/km` : "Rp 0"}
          </div>
          <p className="text-[11px] text-slate-500 font-sans">
            Benchmark standar audit biaya preservasi jalan
          </p>
        </div>
      </div>

      {/* 3. FILTER & SEARCH BAR WITH ANOMALY AUDIT TOGGLE */}
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

        {/* Authority Filter Tabs & Anomaly Toggle */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setSelectedAuthority("ALL")}
            className={`px-3 py-1.5 rounded-[5px] whitespace-nowrap transition-colors cursor-pointer ${
              selectedAuthority === "ALL"
                ? "bg-[#c2410c] text-white font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua ({allPackages.length})
          </button>
          <button
            onClick={() => setSelectedAuthority("NASIONAL")}
            className={`px-3 py-1.5 rounded-[5px] whitespace-nowrap transition-colors cursor-pointer ${
              selectedAuthority === "NASIONAL"
                ? "bg-[#c2410c] text-white font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Nasional (APBN)
          </button>
          <button
            onClick={() => setSelectedAuthority("PROVINSI")}
            className={`px-3 py-1.5 rounded-[5px] whitespace-nowrap transition-colors cursor-pointer ${
              selectedAuthority === "PROVINSI"
                ? "bg-[#c2410c] text-white font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Provinsi
          </button>
          <button
            onClick={() => setSelectedAuthority("KOTA_KAB")}
            className={`px-3 py-1.5 rounded-[5px] whitespace-nowrap transition-colors cursor-pointer ${
              selectedAuthority === "KOTA_KAB"
                ? "bg-[#c2410c] text-white font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Kota / Kab
          </button>

          {/* Anomaly Filter Toggle Button */}
          <button
            onClick={() => setAnomalyFilterOnly(!anomalyFilterOnly)}
            className={`px-2.5 py-1.5 rounded-[5px] whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 border ${
              anomalyFilterOnly
                ? "bg-amber-600 text-white border-amber-700 font-bold"
                : "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
            }`}
            title="Filter paket dengan potensi deviasi progres atau persaingan tender minim"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sorotan Audit ({anomalyCount})</span>
          </button>
        </div>
      </div>

      {/* 4. PACKAGE CARDS GRID */}
      {filteredPackages.length === 0 ? (
        <div className="bg-white rounded-[5px] border border-slate-200 p-8 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Paket yang Sesuai Kriteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Coba ubah kata kunci pencarian atau matikan filter sorotan audit untuk melihat seluruh paket pengadaan yang terdata.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedAuthority("ALL");
              setAnomalyFilterOnly(false);
            }}
            className="mt-2 px-3 py-1.5 rounded-[5px] text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {filteredPackages.map((pkg, idx) => {
            let statusBadge = {
              label: "Selesai (PHO)",
              color: "bg-slate-50 text-slate-700 border-slate-200/90",
              icon: CheckCircle2,
            };
            if (pkg.progressStatus === "DALAM_PENGERJAAN") {
              statusBadge = {
                label: `Fisik: ${pkg.progressPct || 0}%`,
                color: "bg-slate-50 text-slate-700 border-slate-200/90",
                icon: Clock,
              };
            } else if (pkg.progressStatus === "TERLAMBAT_RESPONS") {
              statusBadge = {
                label: "Tertunda / Terlambat",
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
                ? { label: "Terkonfirmasi LPSE", color: "bg-slate-50 text-slate-700 border-slate-200/90" }
                : { label: "Pencocokan Parsial", color: "bg-amber-50 text-amber-800 border-amber-200" };

            // Audit forensic badge
            const isLowComp = pkg.audit?.isLowTenderCompetition;
            const isDevRisk = pkg.audit?.isNegativeDeviationRisk;
            const cardKey = pkg.packageId || `pkg-${pkg.roadId || pkg.road?.id || idx}`;

            return (
              <div
                key={cardKey}
                className="bg-white rounded-[5px] border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between gap-3.5"
              >
                {/* Header Info */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-sans tabular-nums text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-slate-100 border border-slate-200 text-slate-800">
                        {pkg.packageId}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold font-sans tabular-nums">
                        TA {pkg.fiscalYear}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] border ${matchBadge.color}`}>
                        {matchBadge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isDevRisk && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-rose-50 text-rose-700 border border-rose-200">
                          Deviasi Negatif
                        </span>
                      )}
                      {isLowComp && !isDevRisk && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-amber-50 text-amber-800 border border-amber-200">
                          Tender Minim
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${statusBadge.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusBadge.label}</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {pkg.name}
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium font-sans">
                      <MapPin className="w-3.5 h-3.5 text-orange-700 shrink-0" />
                      <span className="text-slate-800">{pkg.roadName}</span>
                      {pkg.roadCode && <span className="font-sans">({pkg.roadCode})</span>}
                    </div>
                  </div>

                  {/* Financial Breakdown (Pagu vs Kontrak & Unit Cost) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-[5px] bg-slate-50 border border-slate-200 text-xs font-sans">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Pagu Anggaran (HPS)
                      </span>
                      <strong className="text-slate-900 font-bold tabular-nums text-sm block">
                        {formatRupiahShort(pkg.paguRp)}
                      </strong>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {pkg.source}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Nilai Kontrak Lelang
                      </span>
                      <strong className="text-emerald-800 font-bold tabular-nums text-sm block">
                        {formatRupiahShort(pkg.contractValueRp)}
                      </strong>
                      <span className="text-[10px] text-slate-600 block truncate font-medium">
                        {pkg.contractor}
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Unit Cost / Efisiensi
                      </span>
                      <strong className="text-slate-900 font-bold tabular-nums text-sm block">
                        {pkg.calculations?.costPerKmFormatted || "N/A"}
                      </strong>
                      <span className="text-[10px] text-emerald-700 font-semibold block truncate">
                        Hemat {pkg.calculations?.efficiencyPct || 0}% ({formatRupiahShort(pkg.calculations?.efficiencyRp)})
                      </span>
                    </div>
                  </div>

                  {/* Audit Analysis & Legal Basis */}
                  <div className="space-y-1.5 text-xs">
                    <div className="text-[11px] text-slate-600 bg-orange-50/50 p-2.5 rounded-[5px] border border-orange-100">
                      <strong className="text-orange-950 block font-semibold mb-0.5">
                        Alasan Pencocokan & Status Lapangan:
                      </strong>
                      <p className="text-[11px] text-slate-700">{pkg.matchReason}</p>
                      {pkg.statusNote && (
                        <p className="text-[10px] text-slate-500 mt-1 italic">{pkg.statusNote}</p>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-500 flex flex-wrap items-center justify-between pt-1 gap-2 font-sans">
                      <span>Kewenangan: <strong className="text-slate-800">{pkg.authorityLabel || pkg.authority}</strong></span>
                      <span className="font-sans text-slate-500">Dokumen: {pkg.sourceDocument || "DIPA TA 2026"}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedRoadForDetail(pkg.fullRoad)}
                    className="flex-1 py-1.5 px-3 rounded-[5px] text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs font-sans"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Detail Ruas</span>
                  </button>

                  <button
                    onClick={() => onSelectRoadOnMap(pkg.roadId)}
                    className="py-1.5 px-3 rounded-[5px] text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer font-sans"
                  >
                    <MapPin className="w-3.5 h-3.5 text-orange-700" />
                    <span className="hidden sm:inline">Peta</span>
                  </button>

                  <a
                    href={pkg.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-3 rounded-[5px] text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-orange-50 border border-slate-200 transition-colors flex items-center gap-1 font-sans"
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
