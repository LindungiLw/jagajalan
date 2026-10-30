"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  MapPin,
  FileText,
  AlertTriangle,
  Scale,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  Database,
  Info,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { ROAD_SEGMENTS } from "@/data/roadsData";
import { INITIAL_REPORTS } from "@/data/reportsData";
import { ANNUAL_HISTORICAL_DATA, NATIONAL_STATS } from "@/data/provincesData";
import RoadDetailModal from "@/components/modals/RoadDetailModal";

export default function HeroSection({
  roads = ROAD_SEGMENTS,
  reports = INITIAL_REPORTS,
  onExploreData,
  onOpenReport,
  onExploreNational,
  onOpenOfficerPortal,
  onOpenOmbudsmanDraft,
}) {
  const [selectedIndex, setSelectedIndex] = useState("kemantapan"); // 'kemantapan' | 'ombudsman' | 'pagu' | 'inpres'
  const [chartViewMode, setChartViewMode] = useState("line"); // 'line' | 'bar'
  const [selectedYear, setSelectedYear] = useState(2024);
  const [budgetTimeScale, setBudgetTimeScale] = useState("instansi"); // 'instansi' | 'bulanan'
  const [summaryTab, setSummaryTab] = useState("wewenang"); // 'wewenang' | 'aduan'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoadForDetail, setSelectedRoadForDetail] = useState(null);

  // Table filter, search, and pagination state
  const [tableFilter, setTableFilter] = useState("ALL"); // ALL | NASIONAL | SUMUT | DAERAH
  const [tableSearch, setTableSearch] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(6); // Default 6 rows to prevent vertical overload

  const { roadConditionTrends, complaintTrends, inpresBudgets } = ANNUAL_HISTORICAL_DATA;

  // Selected year data point for road condition
  const currentRoadTrend =
    roadConditionTrends.find((d) => d.year === selectedYear) ||
    roadConditionTrends[roadConditionTrends.length - 1];

  // Selected year data point for ombudsman complaints
  const currentComplaintTrend =
    complaintTrends?.find((d) => d.year === selectedYear) ||
    complaintTrends?.[complaintTrends.length - 1] || {
      year: 2024,
      overduePct: 33.86,
      overdue: 5450,
      totalComplaints: 16100,
      resolved: 10650,
    };

  // Pilot budget statistics by authority (TA 2026)
  const pilotBudgetStats = useMemo(() => [
    { key: "depok", label: "Dinas Depok", fullName: "Dinas PUPR Depok", timeline: "Mar – Jul 2026", pagu: 11.65, kontrak: 10.87, ruas: 3, efficiency: 6.7, savings: "0,78 M" },
    { key: "jabar", label: "DBMPR Jabar", fullName: "DBMPR Jawa Barat", timeline: "Mei – Jun 2026", pagu: 15.70, kontrak: 14.80, ruas: 2, efficiency: 5.7, savings: "0,90 M" },
    { key: "pupr", label: "KemenPUPR", fullName: "KemenPUPR (BBPJN)", timeline: "Feb – Apr 2026", pagu: 8.45, kontrak: 7.92, ruas: 1, efficiency: 6.3, savings: "0,53 M" },
  ], []);

  // Monthly progress for Pilot Budget (TA 2026: Jan - Okt)
  const monthlyPilotBudgetTrend = useMemo(() => [
    { month: "Jan", pagu: 3.50, kontrak: 0.00, phase: "SiRUP LKPP" },
    { month: "Feb", pagu: 8.45, kontrak: 7.92, phase: "KemenPUPR Selesai" },
    { month: "Mar", pagu: 14.20, kontrak: 13.40, phase: "Depok Paket 1" },
    { month: "Apr", pagu: 20.10, kontrak: 18.79, phase: "Depok Paket 2" },
    { month: "Mei", pagu: 24.15, kontrak: 22.54, phase: "DBMPR Jabar 1" },
    { month: "Jun", pagu: 31.85, kontrak: 29.80, phase: "DBMPR Jabar 2" },
    { month: "Jul", pagu: 33.50, kontrak: 31.35, phase: "Depok Paket 3" },
    { month: "Ags", pagu: 34.90, kontrak: 32.70, phase: "MC-50 Lapangan" },
    { month: "Sep", pagu: 35.80, kontrak: 33.59, phase: "MC-100 Lapangan" },
    { month: "Okt", pagu: 35.80, kontrak: 33.59, phase: "Audit PHO Selesai" },
  ], []);

  // Inpres stages
  const inpresStats = useMemo(() => [
    { stage: "Tahap I (2023)", year: 2023, budgetTrillion: 14.60, realizedKm: 2872, provinces: 34 },
    { stage: "Tahap II (2024)", year: 2024, budgetTrillion: 15.30, realizedKm: 3120, provinces: 38 },
  ], []);

  // Multi-entity search filtering
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return {
        matchedRoads: roads,
        matchedReports: reports,
        matchedPackages: roads.map((r) => r.budget).filter(Boolean),
        hasSearch: false,
      };
    }

    const matchedRoads = roads.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.authority.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q)
    );

    const matchedReports = reports.filter(
      (rep) =>
        rep.ticketCode.toLowerCase().includes(q) ||
        rep.roadName.toLowerCase().includes(q) ||
        rep.categoryLabel.toLowerCase().includes(q) ||
        rep.address.toLowerCase().includes(q)
    );

    const matchedPackages = roads
      .map((r) => r.budget)
      .filter(
        (b) =>
          b &&
          (b.packageId.toLowerCase().includes(q) ||
            b.name.toLowerCase().includes(q) ||
            b.contractor.toLowerCase().includes(q) ||
            b.source.toLowerCase().includes(q))
      );

    return {
      matchedRoads,
      matchedReports,
      matchedPackages,
      hasSearch: true,
    };
  }, [roads, reports, searchQuery]);

  // Dedicated Road Monitoring Table processing
  const processedTableRoads = useMemo(() => {
    let list = roads;

    // 1. Filter by category
    if (tableFilter === "NASIONAL") {
      list = list.filter((r) => r.authority === "NASIONAL");
    } else if (tableFilter === "PROVINSI") {
      list = list.filter((r) => r.authority === "PROVINSI");
    } else if (tableFilter === "KOTA") {
      list = list.filter((r) => r.authority === "KOTA");
    } else if (tableFilter === "KABUPATEN") {
      list = list.filter((r) => r.authority === "KABUPATEN");
    } else if (tableFilter === "SUMUT") {
      list = list.filter(
        (r) =>
          r.district?.toLowerCase().includes("medan") ||
          r.district?.toLowerCase().includes("simalungun") ||
          r.district?.toLowerCase().includes("karo") ||
          r.district?.toLowerCase().includes("asahan") ||
          (r.island === "Sumatera" && r.code?.includes("SMT"))
      );
    } else if (tableFilter === "DAERAH") {
      list = list.filter((r) => r.authority === "PROVINSI" || r.authority === "KOTA" || r.authority === "KABUPATEN" || r.authority === "KOTA_KAB");
    }

    // 2. Filter by local search query
    if (tableSearch.trim()) {
      const q = tableSearch.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.code?.toLowerCase().includes(q) ||
          r.district?.toLowerCase().includes(q) ||
          r.authority?.toLowerCase().includes(q) ||
          r.budget?.contractor?.toLowerCase().includes(q) ||
          r.budget?.source?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [roads, tableFilter, tableSearch]);

  const totalTablePages = Math.max(
    1,
    Math.ceil(
      processedTableRoads.length /
        (tablePageSize === "ALL" ? processedTableRoads.length || 1 : tablePageSize)
    )
  );

  const paginatedRoads = useMemo(() => {
    if (tablePageSize === "ALL") return processedTableRoads;
    const start = (tablePage - 1) * tablePageSize;
    return processedTableRoads.slice(start, start + tablePageSize);
  }, [processedTableRoads, tablePage, tablePageSize]);

  const handleTableFilterChange = (filterKey) => {
    setTableFilter(filterKey);
    setTablePage(1);
  };

  const handleTableSearchChange = (e) => {
    setTableSearch(e.target.value);
    setTablePage(1);
  };

  return (
    <section className="pt-3 pb-6 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5">
        
        {/* HERO UTAMA: CENTERED & CLEAN */}
        <div className="pt-2 pb-2 space-y-1 text-center flex flex-col items-center">
          <h1 className="text-xl sm:text-2xl lg:text-[28px] xl:text-[30px] font-bold font-heading text-slate-900 tracking-tight leading-snug">
            Transparansi Kewenangan Jalan, Anggaran Proyek, dan Tindak Lanjut Pengaduan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed font-sans font-normal mx-auto">
            Prototipe platform keterbukaan informasi kewenangan ruas jalan, penelusuran paket anggaran proyek LPSE, aduan warga dengan estimasi awal AI, dan pemantauan tenggat respons pengaduan.
          </p>
        </div>

        {/* 1. TOP UTILITY BAR: UNIFIED GLOBAL SEARCH & NATIONAL DATA SCOPE */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-stretch overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200/80 text-xs transition-all">
          
          {/* Segment 1: Wilayah Scope */}
          <div className="px-3.5 py-2.5 flex items-center gap-2 font-sans text-slate-700 bg-slate-50/70 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />
            <span className="text-[11.5px] font-semibold">
              Cakupan: <strong className="text-slate-900">Seluruh Indonesia (38 Provinsi)</strong>
            </span>
          </div>

          {/* Segment 2: Official Verified Sources Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-2.5 text-[11px] font-sans text-slate-600 bg-slate-50/40 shrink-0 select-none">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200/90 font-sans shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-[#c2410c]" />
              <span>BPS • LPSE • KemenPU • Ombudsman</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">Update: 18 Okt 2026</span>
          </div>

          {/* Segment 3: Spacious Global Search Input */}
          <div className="relative flex-1 min-w-[280px] flex items-center bg-white group">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#c2410c] absolute left-3 pointer-events-none transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama ruas jalan, kode laporan, paket pengadaan, atau kontraktor..."
              className="w-full h-full pl-9 pr-8 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none focus:bg-orange-50/15 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200/80 hover:bg-orange-100 text-slate-500 hover:text-[#c2410c] flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors"
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Instant Search Results Summary Pill if searching */}
        {searchResults.hasSearch && (
          <div className="p-2.5 rounded-lg bg-orange-50/90 border border-orange-200/90 text-xs flex flex-wrap items-center justify-between gap-2 animate-fade-in font-medium">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#c2410c] font-sans uppercase">Hasil Pencarian:</span>
              <span className="text-slate-800">
                <strong>{searchResults.matchedRoads.length}</strong> Ruas Jalan •{" "}
                <strong>{searchResults.matchedPackages.length}</strong> Paket Pengadaan •{" "}
                <strong>{searchResults.matchedReports.length}</strong> Tiket Aduan
              </span>
            </div>
            <button
              onClick={() => setSearchQuery("")}
              className="text-[#c2410c] hover:underline font-bold text-[11px] cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* 2. OPERATIONAL NATIONAL SUMMARY STRIP (Pure Crisp White Text on Brand Orange) */}
        <div className="bg-[#c2410c] text-white px-4 py-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs shadow-2xs gap-3 font-semibold border border-[#9a3412]">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <span className="text-white font-bold text-xs font-sans">
              Monitoring Infrastruktur Nasional:
            </span>
            <div className="flex items-center gap-1.5">
              <strong className="text-white font-sans font-black text-sm tabular-nums">38</strong>
              <span className="text-white font-medium text-xs">Provinsi Terdata</span>
            </div>
            <span className="hidden sm:inline-block w-px h-3.5 bg-white/40 self-center" aria-hidden="true" />
            <div className="flex items-center gap-1.5">
              <strong className="text-white font-sans font-black text-sm tabular-nums">6</strong>
              <span className="text-white font-medium text-xs">Paket Audit Pilot (Rp 35,80 M)</span>
            </div>
            <span className="hidden sm:inline-block w-px h-3.5 bg-white/40 self-center" aria-hidden="true" />
            <div className="flex items-center gap-1.5">
              <strong className="text-white font-sans font-black text-sm tabular-nums">2</strong>
              <span className="text-white font-medium text-xs">Laporan Melewati Tenggat Respons</span>
            </div>
          </div>

          <span className="text-[11px] font-sans text-white/85 font-medium self-end sm:self-auto">
            Integrasi Geospasial &amp; LPSE Aktif
          </span>
        </div>

        {/* 3. DUAL-PANEL DATA MONITOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          
          {/* LEFT 7 COLS: IKHTISAR DATA & GRAFIK KEMANTAPAN JALAN (BPS SIRUSA 2020-2024) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between space-y-3.5">
            
            {/* Header: Title & View Links */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight">
                  Ikhtisar Kemantapan &amp; Konteks Kebijakan
                </h2>
              </div>
              <button
                onClick={onExploreNational}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#c2410c] hover:text-[#9a3412] hover:underline transition-colors cursor-pointer font-sans group"
                title="Buka data komparasi kemantapan jalan 38 provinsi di menu Statistik"
              >
                <span>Lihat Statistik 38 Provinsi</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#c2410c] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Split: Index List (Left) + Interactive Visual Chart (Right) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
              
              {/* Index Column (5 cols, clean uncluttered metric tabs) */}
              <div className="sm:col-span-5 space-y-2">
                {/* Index 1: Kemantapan Jalan (BPS) */}
                <button
                  onClick={() => setSelectedIndex("kemantapan")}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer group ${
                    selectedIndex === "kemantapan"
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white border-transparent shadow-md"
                      : "bg-slate-50/70 text-slate-800 border-slate-200/70 hover:bg-orange-50/50 hover:border-orange-200/80 hover:shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl p-1.5 shrink-0 flex items-center justify-center transition-all ${
                      selectedIndex === "kemantapan"
                        ? "bg-white/20 border border-white/30 shadow-xs"
                        : "bg-white border border-slate-200/90 shadow-2xs group-hover:border-orange-200"
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/icon/jalan.png"
                        alt="Jalan Kab/Kota"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[11.5px] sm:text-xs font-semibold font-sans truncate ${
                          selectedIndex === "kemantapan" ? "text-orange-50" : "text-slate-700"
                        }`}>
                          Jalan Kab/Kota (BPS)
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          selectedIndex === "kemantapan" ? "text-white translate-x-0.5" : "text-slate-400 group-hover:text-slate-600"
                        }`} />
                      </div>
                      <div className="text-lg sm:text-xl font-bold font-sans tabular-nums mt-0.5 leading-tight tracking-tight flex items-baseline gap-1.5">
                        <span>57,1%</span>
                        <span className={`text-xs font-medium font-sans ${
                          selectedIndex === "kemantapan" ? "text-orange-100" : "text-slate-500"
                        }`}>
                          Mantap
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Index 2: Konteks Ombudsman */}
                <button
                  onClick={() => setSelectedIndex("ombudsman")}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer group ${
                    selectedIndex === "ombudsman"
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white border-transparent shadow-md"
                      : "bg-slate-50/70 text-slate-800 border-slate-200/70 hover:bg-orange-50/50 hover:border-orange-200/80 hover:shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl p-1.5 shrink-0 flex items-center justify-center transition-all ${
                      selectedIndex === "ombudsman"
                        ? "bg-white/20 border border-white/30 shadow-xs"
                        : "bg-white border border-slate-200/90 shadow-2xs group-hover:border-orange-200"
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/icon/time.png"
                        alt="Undue Delay"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[11.5px] sm:text-xs font-semibold font-sans truncate ${
                          selectedIndex === "ombudsman" ? "text-orange-50" : "text-slate-700"
                        }`}>
                          Undue Delay (Ombudsman)
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          selectedIndex === "ombudsman" ? "text-white translate-x-0.5" : "text-slate-400 group-hover:text-slate-600"
                        }`} />
                      </div>
                      <div className="text-lg sm:text-xl font-bold font-sans tabular-nums mt-0.5 leading-tight tracking-tight flex items-baseline gap-1.5">
                        <span>33,86%</span>
                        <span className={`text-xs font-medium font-sans ${
                          selectedIndex === "ombudsman" ? "text-orange-100" : "text-slate-500"
                        }`}>
                          Laporan
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Index 3: Pagu Paket Pilot LPSE */}
                <button
                  onClick={() => setSelectedIndex("pagu")}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer group ${
                    selectedIndex === "pagu"
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white border-transparent shadow-md"
                      : "bg-slate-50/70 text-slate-800 border-slate-200/70 hover:bg-orange-50/50 hover:border-orange-200/80 hover:shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl p-1.5 shrink-0 flex items-center justify-center transition-all ${
                      selectedIndex === "pagu"
                        ? "bg-white/20 border border-white/30 shadow-xs"
                        : "bg-white border border-slate-200/90 shadow-2xs group-hover:border-orange-200"
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/icon/financial.png"
                        alt="Pagu Pengadaan"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[11.5px] sm:text-xs font-semibold font-sans truncate ${
                          selectedIndex === "pagu" ? "text-orange-50" : "text-slate-700"
                        }`}>
                          Pagu Pengadaan Pilot
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          selectedIndex === "pagu" ? "text-white translate-x-0.5" : "text-slate-400 group-hover:text-slate-600"
                        }`} />
                      </div>
                      <div className="text-lg sm:text-xl font-bold font-sans tabular-nums mt-0.5 leading-tight tracking-tight flex items-baseline gap-1.5">
                        <span>Rp 35,80</span>
                        <span className={`text-xs font-medium font-sans ${
                          selectedIndex === "pagu" ? "text-orange-100" : "text-slate-500"
                        }`}>
                          Miliar
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Index 4: Alokasi Inpres Nasional */}
                <button
                  onClick={() => setSelectedIndex("inpres")}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer group ${
                    selectedIndex === "inpres"
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white border-transparent shadow-md"
                      : "bg-slate-50/70 text-slate-800 border-slate-200/70 hover:bg-orange-50/50 hover:border-orange-200/80 hover:shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl p-1.5 shrink-0 flex items-center justify-center transition-all ${
                      selectedIndex === "inpres"
                        ? "bg-white/20 border border-white/30 shadow-xs"
                        : "bg-white border border-slate-200/90 shadow-2xs group-hover:border-orange-200"
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/icon/maps.png"
                        alt="Inpres Jalan"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[11.5px] sm:text-xs font-semibold font-sans truncate ${
                          selectedIndex === "inpres" ? "text-orange-50" : "text-slate-700"
                        }`}>
                          Inpres Jalan Daerah
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          selectedIndex === "inpres" ? "text-white translate-x-0.5" : "text-slate-400 group-hover:text-slate-600"
                        }`} />
                      </div>
                      <div className="text-lg sm:text-xl font-bold font-sans tabular-nums mt-0.5 leading-tight tracking-tight flex items-baseline gap-1.5">
                        <span>Rp 14,60</span>
                        <span className={`text-xs font-medium font-sans ${
                          selectedIndex === "inpres" ? "text-orange-100" : "text-slate-500"
                        }`}>
                          Triliun
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Chart Column: Dynamic Visual Monitor based on selectedIndex */}
              <div className="sm:col-span-7 bg-slate-50/70 rounded-xl border border-slate-200/80 p-3.5 flex flex-col justify-between">
                {/* Chart Header: Structured 2-Tier Header (Never Wraps Awkwardly) */}
                <div className="space-y-1.5 border-b border-slate-200/60 pb-2">
                  {/* Row 1: Title & Main Type Switcher (Garis / Batang) */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[9.5px] font-semibold text-slate-400 uppercase font-sans tracking-wide truncate block">
                        {selectedIndex === "kemantapan" && "BPS SIRUSA (DATA TAHUNAN 2020–2024)"}
                        {selectedIndex === "ombudsman" && "OMBUDSMAN RI (LAPORAN TAHUNAN 2020–2024)"}
                        {selectedIndex === "pagu" && "SIRUP & LPSE LKPP (TAHUN ANGGARAN 2026)"}
                        {selectedIndex === "inpres" && "KEMENPUPR (INPRES NO. 3/2023)"}
                      </span>
                      <strong className="text-xs sm:text-sm font-bold font-heading text-slate-900 tracking-tight truncate block">
                        {selectedIndex === "kemantapan" && "Tingkat Kemantapan Jalan"}
                        {selectedIndex === "ombudsman" && "Tren Penundaan Berlarut (Undue Delay)"}
                        {selectedIndex === "pagu" && (
                          budgetTimeScale === "bulanan"
                            ? "Tren Realisasi Pagu vs Kontrak Bulanan"
                            : "Komparasi Pagu vs Nilai Kontrak Pilot"
                        )}
                        {selectedIndex === "inpres" && "Alokasi Inpres Jalan Daerah (IJD)"}
                      </strong>
                    </div>

                    {/* Mode Switcher: Garis / Batang */}
                    <div className="inline-flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden divide-x divide-slate-200 text-[10px] font-bold shadow-2xs font-sans shrink-0">
                      <button
                        onClick={() => setChartViewMode("line")}
                        className={`px-2 py-0.5 transition-colors cursor-pointer flex items-center gap-1 ${
                          chartViewMode === "line"
                            ? "bg-[#c2410c] text-white"
                            : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                        title="Grafik Garis Kontinu"
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span>Garis</span>
                      </button>
                      <button
                        onClick={() => setChartViewMode("bar")}
                        className={`px-2 py-0.5 transition-colors cursor-pointer flex items-center gap-1 ${
                          chartViewMode === "bar"
                            ? "bg-[#c2410c] text-white"
                            : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                        title="Diagram Batang Komparatif"
                      >
                        <BarChart3 className="w-3 h-3" />
                        <span>Batang</span>
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Sub-toolbar / Legend & Filter Bar (Never wraps awkwardly!) */}
                  <div className="flex items-center justify-between gap-1 pt-0.5 text-[9.5px] font-sans">
                    {/* Left: Dynamic Color Legend */}
                    {selectedIndex === "kemantapan" && (
                      <div className="flex items-center gap-2 font-medium text-slate-600">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-700" />Nas</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-600" />Prov</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]" />Kab/Kota</span>
                      </div>
                    )}
                    {selectedIndex === "ombudsman" && (
                      <div className="flex items-center gap-2 font-medium text-slate-600">
                        <span className="flex items-center gap-1 text-[#c2410c] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]" />Undue Delay (%)</span>
                      </div>
                    )}
                    {selectedIndex === "pagu" && (
                      <div className="flex items-center gap-2 font-medium">
                        <span className="flex items-center gap-1 text-slate-600"><span className="w-1.5 h-1.5 rounded-full bg-slate-700" />Pagu</span>
                        <span className="flex items-center gap-1 text-[#c2410c]"><span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]" />Kontrak</span>
                      </div>
                    )}
                    {selectedIndex === "inpres" && (
                      <div className="flex items-center gap-2 font-medium text-slate-600">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]" />Alokasi APBN</span>
                      </div>
                    )}

                    {/* Right: Year Selector / Time Scale Toggle */}
                    {(selectedIndex === "kemantapan" || selectedIndex === "ombudsman") && (
                      <div className="inline-flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden divide-x divide-slate-200 text-[10px] font-bold font-sans shadow-2xs tabular-nums shrink-0">
                        {[2020, 2021, 2022, 2023, 2024].map((yr) => (
                          <button
                            key={yr}
                            onClick={() => setSelectedYear(yr)}
                            className={`px-1.5 py-0.5 transition-colors cursor-pointer ${
                              selectedYear === yr
                                ? "bg-[#c2410c] text-white font-bold"
                                : "bg-white text-slate-600 hover:bg-orange-50/60 hover:text-[#c2410c]"
                            }`}
                          >
                            {yr}
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedIndex === "pagu" && (
                      <div className="inline-flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden divide-x divide-slate-200 text-[9.5px] font-bold font-sans shadow-2xs shrink-0">
                        <button
                          onClick={() => setBudgetTimeScale("instansi")}
                          className={`px-1.5 py-0.5 transition-colors cursor-pointer ${
                            budgetTimeScale === "instansi"
                              ? "bg-[#c2410c] text-white"
                              : "bg-white text-slate-600 hover:bg-orange-50/60"
                          }`}
                        >
                          Per Instansi
                        </button>
                        <button
                          onClick={() => setBudgetTimeScale("bulanan")}
                          className={`px-1.5 py-0.5 transition-colors cursor-pointer ${
                            budgetTimeScale === "bulanan"
                              ? "bg-[#c2410c] text-white"
                              : "bg-white text-slate-600 hover:bg-orange-50/60"
                          }`}
                        >
                          Bulanan (2026)
                        </button>
                      </div>
                    )}

                    {selectedIndex === "inpres" && (
                      <div className="inline-flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden divide-x divide-slate-200 text-[10px] font-bold font-sans shadow-2xs tabular-nums shrink-0">
                        {[2023, 2024].map((yr) => (
                          <button
                            key={yr}
                            onClick={() => setSelectedYear(yr)}
                            className={`px-2.5 py-0.5 transition-colors cursor-pointer ${
                              selectedYear === yr
                                ? "bg-[#c2410c] text-white font-bold"
                                : "bg-white text-slate-600 hover:bg-orange-50/60 hover:text-[#c2410c]"
                            }`}
                          >
                            {yr === 2023 ? "Tahap I (2023)" : "Tahap II (2024)"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ======================================================== */}
                {/* 1. CHART BODY: KEMANTAPAN JALAN (BPS SIRUSA 2020 - 2024) */}
                {/* ======================================================== */}
                {selectedIndex === "kemantapan" && (
                  chartViewMode === "line" ? (
                    <div className="h-40 sm:h-44 pt-1 px-1 flex flex-col justify-end">
                      <svg viewBox="0 0 460 144" className="w-full h-full select-none font-sans">
                        <defs>
                          <linearGradient id="kemantapanAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c2410c" stopOpacity="0.20" />
                            <stop offset="100%" stopColor="#c2410c" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {[100, 80, 60, 40].map((val) => {
                          const y = 18 + ((100 - val) / 60) * 94;
                          return (
                            <g key={val}>
                              <line x1="32" y1={y} x2="445" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="0.8" />
                              <text x="28" y={y + 3} textAnchor="end" fontSize="8.5" fill="#94a3b8" fontWeight="600">
                                {val}%
                              </text>
                            </g>
                          );
                        })}
                        <line x1="32" y1="112" x2="445" y2="112" stroke="#cbd5e1" strokeWidth="1" />
                        <polygon
                          points={`
                            ${roadConditionTrends.map((d, i) => `${68 + i * 82},${18 + ((100 - d.nasional) / 60) * 94}`).join(" ")}
                            ${[...roadConditionTrends].reverse().map((d, i) => `${396 - i * 82},${18 + ((100 - d.kabupatenKota) / 60) * 94}`).join(" ")}
                          `}
                          fill="url(#kemantapanAreaGrad)"
                        />
                        <path
                          d={roadConditionTrends.map((d, i) => `${i === 0 ? "M" : "L"} ${68 + i * 82} ${18 + ((100 - d.nasional) / 60) * 94}`).join(" ")}
                          fill="none"
                          stroke="#334155"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                        <path
                          d={roadConditionTrends.map((d, i) => `${i === 0 ? "M" : "L"} ${68 + i * 82} ${18 + ((100 - d.provinsi) / 60) * 94}`).join(" ")}
                          fill="none"
                          stroke="#d97706"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                        <path
                          d={roadConditionTrends.map((d, i) => `${i === 0 ? "M" : "L"} ${68 + i * 82} ${18 + ((100 - d.kabupatenKota) / 60) * 94}`).join(" ")}
                          fill="none"
                          stroke="#c2410c"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        {roadConditionTrends.map((d, i) => {
                          const x = 68 + i * 82;
                          const yNas = 18 + ((100 - d.nasional) / 60) * 94;
                          const yProv = 18 + ((100 - d.provinsi) / 60) * 94;
                          const yKab = 18 + ((100 - d.kabupatenKota) / 60) * 94;
                          const isSelected = d.year === selectedYear;

                          return (
                            <g key={d.year} className="cursor-pointer" onClick={() => setSelectedYear(d.year)}>
                              <rect x={x - 24} y="10" width="48" height="135" fill="transparent" />
                              {isSelected && (
                                <line x1={x} y1="18" x2={x} y2="112" stroke="#c2410c" strokeWidth="1.2" strokeDasharray="2 2" />
                              )}
                              <circle cx={x} cy={yNas} r={isSelected ? 4.5 : 3} fill="#334155" stroke="#fff" strokeWidth="1.5" />
                              <circle cx={x} cy={yProv} r={isSelected ? 4.5 : 3} fill="#d97706" stroke="#fff" strokeWidth="1.5" />
                              <circle cx={x} cy={yKab} r={isSelected ? 6 : 4} fill="#c2410c" stroke="#fff" strokeWidth="2" />
                              <text x={x} y={yKab - 7} textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={isSelected ? "#9a3412" : "#c2410c"}>
                                {d.kabupatenKota}%
                              </text>
                              {/* Bottom Year Button Pill */}
                              {isSelected ? (
                                <g>
                                  <rect x={x - 18} y="118" width="36" height="18" rx="4" fill="#c2410c" />
                                  <text x={x} y="131" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#ffffff">{d.year}</text>
                                </g>
                              ) : (
                                <g>
                                  <rect x={x - 18} y="118" width="36" height="18" rx="4" fill="#f1f5f9" className="hover:fill-orange-50 transition-colors" />
                                  <text x={x} y="131" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#475569">{d.year}</text>
                                </g>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  ) : (
                    <div className="h-40 sm:h-44 pt-1 px-1 flex flex-col justify-end">
                      <svg viewBox="0 0 460 144" className="w-full h-full select-none font-sans">
                        {[100, 80, 60, 40].map((val) => {
                          const y = 18 + ((100 - val) / 60) * 94;
                          return (
                            <g key={val}>
                              <line x1="32" y1={y} x2="445" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="0.8" />
                              <text x="28" y={y + 3} textAnchor="end" fontSize="8.5" fill="#94a3b8" fontWeight="600">
                                {val}%
                              </text>
                            </g>
                          );
                        })}
                        <line x1="32" y1="112" x2="445" y2="112" stroke="#cbd5e1" strokeWidth="1" />
                        {roadConditionTrends.map((d, i) => {
                          const xCenter = 68 + i * 82;
                          const isSelected = d.year === selectedYear;
                          const hNas = ((d.nasional - 40) / 60) * 94;
                          const hProv = ((d.provinsi - 40) / 60) * 94;
                          const hKab = ((d.kabupatenKota - 40) / 60) * 94;
                          const yNas = 112 - hNas;
                          const yProv = 112 - hProv;
                          const yKab = 112 - hKab;

                          return (
                            <g key={d.year} className="cursor-pointer" onClick={() => setSelectedYear(d.year)}>
                              {/* Selected Year Card Framing */}
                              {isSelected && (
                                <rect x={xCenter - 23} y="14" width="46" height="98" rx="5" fill="#f8fafc" stroke="#fed7aa" strokeWidth="1" />
                              )}
                              
                              {/* Nasional Bar */}
                              <rect x={xCenter - 18} y={yNas} width="11" height={hNas} rx="2.5" fill="#334155" />
                              {isSelected && (
                                <text x={xCenter - 12.5} y={yNas - 3.5} textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#334155">
                                  {d.nasional}%
                                </text>
                              )}

                              {/* Provinsi Bar */}
                              <rect x={xCenter - 5} y={yProv} width="11" height={hProv} rx="2.5" fill="#d97706" />
                              {isSelected && (
                                <text x={xCenter + 0.5} y={yProv - 3.5} textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#b45309">
                                  {d.provinsi}%
                                </text>
                              )}

                              {/* Kab/Kota Bar */}
                              <rect x={xCenter + 8} y={yKab} width="11" height={hKab} rx="2.5" fill="#c2410c" />
                              <text x={xCenter + 13.5} y={yKab - 3.5} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#c2410c">
                                {d.kabupatenKota}%
                              </text>

                              {/* Year Button Pill Under Baseline */}
                              {isSelected ? (
                                <g>
                                  <rect x={xCenter - 18} y="118" width="36" height="18" rx="4" fill="#c2410c" />
                                  <text x={xCenter} y="131" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#ffffff">{d.year}</text>
                                </g>
                              ) : (
                                <g>
                                  <rect x={xCenter - 18} y="118" width="36" height="18" rx="4" fill="#f1f5f9" className="hover:fill-orange-50 transition-colors" />
                                  <text x={xCenter} y="131" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#475569">{d.year}</text>
                                </g>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  )
                )}

                {/* ======================================================== */}
                {/* 2. CHART BODY: OMBUDSMAN UNDUE DELAY TREND (2020 - 2024) */}
                {/* ======================================================== */}
                {selectedIndex === "ombudsman" && (
                  chartViewMode === "line" ? (
                    <div className="h-40 sm:h-44 pt-1 px-1 flex flex-col justify-end">
                      <svg viewBox="0 0 460 144" className="w-full h-full select-none font-sans">
                        <defs>
                          <linearGradient id="ombudsmanAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c2410c" stopOpacity="0.22" />
                            <stop offset="100%" stopColor="#c2410c" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {[35, 33, 31, 29].map((val) => {
                          const y = 18 + ((36 - val) / 8) * 94;
                          return (
                            <g key={val}>
                              <line x1="32" y1={y} x2="445" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="0.8" />
                              <text x="28" y={y + 3} textAnchor="end" fontSize="8.5" fill="#94a3b8" fontWeight="600">
                                {val}%
                              </text>
                            </g>
                          );
                        })}
                        <line x1="32" y1="112" x2="445" y2="112" stroke="#cbd5e1" strokeWidth="1" />
                        <polygon
                          points={`
                            ${complaintTrends.map((d, i) => `${68 + i * 82},${18 + ((36 - d.overduePct) / 8) * 94}`).join(" ")}
                            396,112 68,112
                          `}
                          fill="url(#ombudsmanAreaGrad)"
                        />
                        <path
                          d={complaintTrends.map((d, i) => `${i === 0 ? "M" : "L"} ${68 + i * 82} ${18 + ((36 - d.overduePct) / 8) * 94}`).join(" ")}
                          fill="none"
                          stroke="#c2410c"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                        />
                        {complaintTrends.map((d, i) => {
                          const x = 68 + i * 82;
                          const y = 18 + ((36 - d.overduePct) / 8) * 94;
                          const isSelected = d.year === selectedYear;

                          return (
                            <g key={d.year} className="cursor-pointer" onClick={() => setSelectedYear(d.year)}>
                              <rect x={x - 22} y="10" width="44" height="135" fill="transparent" />
                              {isSelected && (
                                <line x1={x} y1="18" x2={x} y2="112" stroke="#c2410c" strokeWidth="1.2" strokeDasharray="2 2" />
                              )}
                              <circle cx={x} cy={y} r={isSelected ? 6 : 4} fill="#c2410c" stroke="#fff" strokeWidth="2" />
                              <text x={x} y={y - 7} textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={isSelected ? "#9a3412" : "#c2410c"}>
                                {d.overduePct}%
                              </text>
                              {isSelected ? (
                                <g>
                                  <rect x={x - 18} y="118" width="36" height="18" rx="4" fill="#c2410c" />
                                  <text x={x} y="131" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#ffffff">{d.year}</text>
                                </g>
                              ) : (
                                <g>
                                  <rect x={x - 18} y="118" width="36" height="18" rx="4" fill="#f1f5f9" className="hover:fill-orange-50 transition-colors" />
                                  <text x={x} y="131" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#475569">{d.year}</text>
                                </g>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  ) : (
                    <div className="h-40 sm:h-44 pt-1 px-1 flex flex-col justify-end">
                      <svg viewBox="0 0 460 144" className="w-full h-full select-none font-sans">
                        <defs>
                          <linearGradient id="ombudsmanBarGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ea580c" />
                            <stop offset="100%" stopColor="#c2410c" />
                          </linearGradient>
                        </defs>
                        {[35, 33, 31, 29].map((val) => {
                          const y = 18 + ((36 - val) / 8) * 94;
                          return (
                            <g key={val}>
                              <line x1="32" y1={y} x2="445" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="0.8" />
                              <text x="28" y={y + 3} textAnchor="end" fontSize="8.5" fill="#94a3b8" fontWeight="600">
                                {val}%
                              </text>
                            </g>
                          );
                        })}
                        <line x1="32" y1="112" x2="445" y2="112" stroke="#cbd5e1" strokeWidth="1" />
                        {complaintTrends.map((d, i) => {
                          const xCenter = 68 + i * 82;
                          const isSelected = d.year === selectedYear;
                          const h = ((d.overduePct - 28) / 8) * 94;
                          const yBar = 112 - h;

                          return (
                            <g key={d.year} className="cursor-pointer" onClick={() => setSelectedYear(d.year)}>
                              {isSelected && (
                                <rect x={xCenter - 22} y="12" width="44" height="100" rx="4" fill="#c2410c" fillOpacity="0.06" />
                              )}
                              <rect
                                x={xCenter - 16}
                                y={yBar}
                                width="32"
                                height={h}
                                rx="3.5"
                                fill={isSelected ? "url(#ombudsmanBarGrad)" : "#ea580c"}
                                opacity={isSelected ? 1 : 0.85}
                              />
                              <text x={xCenter} y={yBar - 4} textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#c2410c">
                                {d.overduePct}%
                              </text>
                              {isSelected ? (
                                <g>
                                  <rect x={xCenter - 18} y="118" width="36" height="18" rx="4" fill="#c2410c" />
                                  <text x={xCenter} y="131" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#ffffff">{d.year}</text>
                                </g>
                              ) : (
                                <g>
                                  <rect x={xCenter - 18} y="118" width="36" height="18" rx="4" fill="#f1f5f9" className="hover:fill-orange-50 transition-colors" />
                                  <text x={xCenter} y="131" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#475569">{d.year}</text>
                                </g>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  )
                )}

                {/* ======================================================== */}
                {/* 3. CHART BODY: PAGU VS KONTRAK LELANG PILOT (LPSE TA 2026) */}
                {/* ======================================================== */}
                {selectedIndex === "pagu" && (
                  budgetTimeScale === "bulanan" ? (
                    // VIEW A: REALISASI BULANAN TA 2026 (JANUARI - OKTOBER 2026)
                    chartViewMode === "line" ? (
                      <div className="h-44 sm:h-48 pt-1 px-1 flex flex-col justify-end">
                        <svg viewBox="0 0 460 162" className="w-full h-full select-none font-sans">
                          <defs>
                            <linearGradient id="paguMonthGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#334155" stopOpacity="0.18" />
                              <stop offset="100%" stopColor="#334155" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="kontrakMonthGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#c2410c" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#c2410c" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          {[40, 30, 20, 10].map((val) => {
                            const y = 18 + ((40 - val) / 40) * 94;
                            return (
                              <g key={val}>
                                <line x1="30" y1={y} x2="445" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="0.8" />
                                <text x="26" y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8" fontWeight="600">
                                  {val}M
                                </text>
                              </g>
                            );
                          })}
                          <line x1="30" y1="112" x2="445" y2="112" stroke="#cbd5e1" strokeWidth="1" />

                          {/* Pagu Area & Line */}
                          <polygon
                            points={`
                              ${monthlyPilotBudgetTrend.map((d, i) => `${45 + i * 42},${18 + ((40 - d.pagu) / 40) * 94}`).join(" ")}
                              423,112 45,112
                            `}
                            fill="url(#paguMonthGrad)"
                          />
                          <path
                            d={monthlyPilotBudgetTrend.map((d, i) => `${i === 0 ? "M" : "L"} ${45 + i * 42} ${18 + ((40 - d.pagu) / 40) * 94}`).join(" ")}
                            fill="none"
                            stroke="#334155"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                          />

                          {/* Kontrak Area & Line */}
                          <polygon
                            points={`
                              ${monthlyPilotBudgetTrend.map((d, i) => `${45 + i * 42},${18 + ((40 - d.kontrak) / 40) * 94}`).join(" ")}
                              423,112 45,112
                            `}
                            fill="url(#kontrakMonthGrad)"
                          />
                          <path
                            d={monthlyPilotBudgetTrend.map((d, i) => `${i === 0 ? "M" : "L"} ${45 + i * 42} ${18 + ((40 - d.kontrak) / 40) * 94}`).join(" ")}
                            fill="none"
                            stroke="#c2410c"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                          />

                          {monthlyPilotBudgetTrend.map((d, i) => {
                            const x = 45 + i * 42;
                            const yPagu = 18 + ((40 - d.pagu) / 40) * 94;
                            const yKontrak = 18 + ((40 - d.kontrak) / 40) * 94;
                            const isLast = i === monthlyPilotBudgetTrend.length - 1;

                            return (
                              <g key={d.month} className="group">
                                <circle cx={x} cy={yPagu} r={isLast ? 4 : 2.5} fill="#334155" stroke="#fff" strokeWidth="1.5" />
                                <circle cx={x} cy={yKontrak} r={isLast ? 5 : 3} fill="#c2410c" stroke="#fff" strokeWidth="1.8" />
                                
                                {isLast && (
                                  <g>
                                    <text x={x} y={yPagu - 8} textAnchor="end" fontSize="8" fontWeight="bold" fill="#334155">
                                      Pagu: Rp {d.pagu}M
                                    </text>
                                    <text x={x} y={yKontrak + 13} textAnchor="end" fontSize="8.5" fontWeight="bold" fill="#c2410c">
                                      Kontrak: Rp {d.kontrak}M
                                    </text>
                                  </g>
                                )}

                                <text x={x} y="126" textAnchor="middle" fontSize="9" fontWeight={isLast ? "bold" : "600"} fill={isLast ? "#c2410c" : "#475569"}>
                                  {d.month}
                                </text>
                                <text x={x} y="138" textAnchor="middle" fontSize="6.5" fill="#94a3b8">
                                  {i < 3 ? "Q1" : i < 6 ? "Q2" : i < 9 ? "Q3" : "Q4"}
                                </text>
                              </g>
                            );
                          })}
                          <text x="235" y="154" textAnchor="middle" fontSize="8" fill="#64748b">
                            Skala Waktu: Realisasi Kumulatif Pengadaan Jan – Okt TA 2026
                          </text>
                        </svg>
                      </div>
                    ) : (
                      <div className="h-44 sm:h-48 pt-1 px-1 flex flex-col justify-end">
                        <svg viewBox="0 0 460 162" className="w-full h-full select-none font-sans">
                          {[40, 30, 20, 10].map((val) => {
                            const y = 18 + ((40 - val) / 40) * 94;
                            return (
                              <g key={val}>
                                <line x1="30" y1={y} x2="445" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="0.8" />
                                <text x="26" y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8" fontWeight="600">
                                  {val}M
                                </text>
                              </g>
                            );
                          })}
                          <line x1="30" y1="112" x2="445" y2="112" stroke="#cbd5e1" strokeWidth="1" />
                          {monthlyPilotBudgetTrend.map((d, i) => {
                            const xCenter = 45 + i * 42;
                            const hPagu = (d.pagu / 40) * 94;
                            const hKontrak = (d.kontrak / 40) * 94;
                            const yPagu = 112 - hPagu;
                            const yKontrak = 112 - hKontrak;
                            const isLast = i === monthlyPilotBudgetTrend.length - 1;

                            return (
                              <g key={d.month} className="group">
                                <rect x={xCenter - 10} y={yPagu} width="9" height={hPagu} rx="2" fill="#334155" />
                                <rect x={xCenter + 1} y={yKontrak} width="9" height={hKontrak} rx="2" fill="#ea580c" />
                                {isLast && (
                                  <text x={xCenter + 5} y={yKontrak - 4} textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#c2410c">
                                    33.6M
                                  </text>
                                )}
                                <text x={xCenter} y="126" textAnchor="middle" fontSize="9" fontWeight={isLast ? "bold" : "600"} fill={isLast ? "#c2410c" : "#475569"}>
                                  {d.month}
                                </text>
                                <text x={xCenter} y="138" textAnchor="middle" fontSize="6.5" fill="#94a3b8">
                                  {d.phase.substring(0, 7)}
                                </text>
                              </g>
                            );
                          })}
                          <text x="235" y="154" textAnchor="middle" fontSize="8" fill="#64748b">
                            Skala Waktu: Realisasi Kumulatif Pengadaan Jan – Okt TA 2026
                          </text>
                        </svg>
                      </div>
                    )
                  ) : (
                    // VIEW B: PER INSTANSI (TA 2026 DENGAN TIMELINE LELANG)
                    chartViewMode === "line" ? (
                      <div className="h-44 sm:h-48 pt-1 px-1 flex flex-col justify-end">
                        <svg viewBox="0 0 460 162" className="w-full h-full select-none font-sans">
                          <defs>
                            <linearGradient id="paguLineGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#334155" stopOpacity="0.18" />
                              <stop offset="100%" stopColor="#334155" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="kontrakLineGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#c2410c" stopOpacity="0.22" />
                              <stop offset="100%" stopColor="#c2410c" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          {[20, 15, 10, 5].map((val) => {
                            const y = 20 + ((20 - val) / 20) * 92;
                            return (
                              <g key={val}>
                                <line x1="30" y1={y} x2="445" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="0.8" />
                                <text x="26" y={y + 3} textAnchor="end" fontSize="8.5" fill="#94a3b8" fontWeight="600">
                                  {val}M
                                </text>
                              </g>
                            );
                          })}
                          <line x1="30" y1="112" x2="445" y2="112" stroke="#cbd5e1" strokeWidth="1" />

                          {/* Pagu Area & Line */}
                          <polygon
                            points={`
                              ${pilotBudgetStats.map((d, i) => `${100 + i * 137},${20 + ((20 - d.pagu) / 20) * 92}`).join(" ")}
                              374,112 100,112
                            `}
                            fill="url(#paguLineGrad)"
                          />
                          <path
                            d={pilotBudgetStats.map((d, i) => `${i === 0 ? "M" : "L"} ${100 + i * 137} ${20 + ((20 - d.pagu) / 20) * 92}`).join(" ")}
                            fill="none"
                            stroke="#334155"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />

                          {/* Kontrak Area & Line */}
                          <polygon
                            points={`
                              ${pilotBudgetStats.map((d, i) => `${100 + i * 137},${20 + ((20 - d.kontrak) / 20) * 92}`).join(" ")}
                              374,112 100,112
                            `}
                            fill="url(#kontrakLineGrad)"
                          />
                          <path
                            d={pilotBudgetStats.map((d, i) => `${i === 0 ? "M" : "L"} ${100 + i * 137} ${20 + ((20 - d.kontrak) / 20) * 92}`).join(" ")}
                            fill="none"
                            stroke="#c2410c"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                          />

                          {pilotBudgetStats.map((d, i) => {
                            const x = 100 + i * 137;
                            const yPagu = 20 + ((20 - d.pagu) / 20) * 92;
                            const yKontrak = 20 + ((20 - d.kontrak) / 20) * 92;

                            return (
                              <g key={d.key}>
                                <line x1={x} y1="20" x2={x} y2="112" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="2 2" />
                                <circle cx={x} cy={yPagu} r={4.5} fill="#334155" stroke="#fff" strokeWidth="1.8" />
                                <circle cx={x} cy={yKontrak} r={5} fill="#c2410c" stroke="#fff" strokeWidth="2" />
                                
                                <text x={x} y={yPagu - 7} textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#334155">
                                  Rp {d.pagu}M
                                </text>
                                <text x={x} y={yKontrak + 14} textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#c2410c">
                                  Rp {d.kontrak}M
                                </text>
                                
                                <text x={x} y="126" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#0f172a">
                                  {d.fullName}
                                </text>
                                
                                <rect x={x - 48} y="132" width="96" height="13" rx="3.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
                                <text x={x} y="141.5" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#475569">
                                  Hemat {d.efficiency}% ({d.timeline})
                                </text>
                                
                                <text x={x} y="155" textAnchor="middle" fontSize="8" fill="#64748b">
                                  {d.ruas} Paket Pilot • TA 2026
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    ) : (
                      <div className="h-44 sm:h-48 pt-1 px-1 flex flex-col justify-end">
                        <svg viewBox="0 0 460 162" className="w-full h-full select-none font-sans">
                          <defs>
                            <linearGradient id="paguBarGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#475569" />
                              <stop offset="100%" stopColor="#1e293b" />
                            </linearGradient>
                            <linearGradient id="kontrakBarGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f97316" />
                              <stop offset="100%" stopColor="#c2410c" />
                            </linearGradient>
                            <filter id="barShadow" x="-10%" y="-10%" width="120%" height="120%">
                              <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.08" />
                            </filter>
                          </defs>

                          {/* Grid Lines */}
                          {[20, 15, 10, 5].map((val) => {
                            const y = 20 + ((20 - val) / 20) * 92;
                            return (
                              <g key={val}>
                                <line x1="30" y1={y} x2="445" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="0.8" />
                                <text x="26" y={y + 3} textAnchor="end" fontSize="8.5" fill="#94a3b8" fontWeight="600">
                                  {val}M
                                </text>
                              </g>
                            );
                          })}
                          <line x1="30" y1="112" x2="445" y2="112" stroke="#cbd5e1" strokeWidth="1" />

                          {/* Grouped Bars */}
                          {pilotBudgetStats.map((d, i) => {
                            const xCenter = 100 + i * 137;
                            const hPagu = (d.pagu / 20) * 92;
                            const hKontrak = (d.kontrak / 20) * 92;
                            const yPagu = 112 - hPagu;
                            const yKontrak = 112 - hKontrak;

                            return (
                              <g key={d.key} className="group">
                                <rect x={xCenter - 54} y="12" width="108" height="100" rx="6" fill="transparent" className="hover:fill-slate-50 transition-colors" />

                                {/* Pagu Bar */}
                                <rect
                                  x={xCenter - 30}
                                  y={yPagu}
                                  width="28"
                                  height={hPagu}
                                  rx="3.5"
                                  fill="url(#paguBarGrad)"
                                  filter="url(#barShadow)"
                                  className="transition-all hover:opacity-95"
                                />
                                <text x={xCenter - 16} y={yPagu - 4} textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#334155">
                                  {d.pagu}M
                                </text>

                                {/* Kontrak Bar */}
                                <rect
                                  x={xCenter + 2}
                                  y={yKontrak}
                                  width="28"
                                  height={hKontrak}
                                  rx="3.5"
                                  fill="url(#kontrakBarGrad)"
                                  filter="url(#barShadow)"
                                  className="transition-all hover:opacity-95"
                                />
                                <text x={xCenter + 16} y={yKontrak - 4} textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#c2410c">
                                  {d.kontrak}M
                                </text>

                                {/* Institution Label */}
                                <text x={xCenter} y="126" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#0f172a">
                                  {d.fullName}
                                </text>

                                {/* Savings Badge with Timeline Months */}
                                <rect x={xCenter - 52} y="132" width="104" height="13" rx="3.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
                                <text x={xCenter} y="141.5" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#475569">
                                  Hemat {d.efficiency}% ({d.timeline})
                                </text>

                                {/* Subtitle */}
                                <text x={xCenter} y="155" textAnchor="middle" fontSize="8" fill="#64748b">
                                  {d.ruas} Paket Pilot Lelang TA 2026
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    )
                  )
                )}

                {/* ======================================================== */}
                {/* 4. CHART BODY: INPRES JALAN DAERAH (IJD 2023 - 2024)     */}
                {/* ======================================================== */}
                {selectedIndex === "inpres" && (
                  chartViewMode === "line" ? (
                    <div className="h-44 sm:h-48 pt-1 px-1 flex flex-col justify-end">
                      <svg viewBox="0 0 460 162" className="w-full h-full select-none font-sans">
                        <defs>
                          <linearGradient id="inpresLineGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c2410c" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#c2410c" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {[16, 12, 8, 4].map((val) => {
                          const y = 18 + ((16 - val) / 14) * 94;
                          return (
                            <g key={val}>
                              <line x1="32" y1={y} x2="445" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="0.8" />
                              <text x="28" y={y + 3} textAnchor="end" fontSize="8.5" fill="#94a3b8" fontWeight="600">
                                {val}T
                              </text>
                            </g>
                          );
                        })}
                        <line x1="32" y1="112" x2="445" y2="112" stroke="#cbd5e1" strokeWidth="1" />
                        <polygon
                          points={`
                            120,${18 + ((16 - 14.60) / 14) * 94}
                            340,${18 + ((16 - 15.30) / 14) * 94}
                            340,112 120,112
                          `}
                          fill="url(#inpresLineGrad)"
                        />
                        <path
                          d={`M 120 ${18 + ((16 - 14.60) / 14) * 94} L 340 ${18 + ((16 - 15.30) / 14) * 94}`}
                          fill="none"
                          stroke="#c2410c"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        {inpresStats.map((d, i) => {
                          const x = 120 + i * 220;
                          const y = 18 + ((16 - d.budgetTrillion) / 14) * 94;
                          const isSelected = d.year === selectedYear;

                          return (
                            <g key={d.stage} className="cursor-pointer" onClick={() => setSelectedYear(d.year)}>
                              <circle cx={x} cy={y} r={isSelected ? 6 : 4.5} fill="#c2410c" stroke="#fff" strokeWidth="2" />
                              <text x={x} y={y - 8} textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#c2410c">
                                Rp {d.budgetTrillion} Triliun
                              </text>
                              <text x={x} y={y + 16} textAnchor="middle" fontSize="8.5" fill="#64748b">
                                ({d.realizedKm.toLocaleString("id-ID")} KM)
                              </text>
                              <text x={x} y="130" textAnchor="middle" fontSize="10" fontWeight={isSelected ? "bold" : "600"} fill={isSelected ? "#c2410c" : "#475569"}>
                                {d.stage}
                              </text>
                              <text x={x} y="146" textAnchor="middle" fontSize="8" fill="#94a3b8">
                                {d.provinces} Provinsi Penerima
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  ) : (
                    <div className="h-44 sm:h-48 pt-1 px-1 flex flex-col justify-end">
                      <svg viewBox="0 0 460 162" className="w-full h-full select-none font-sans">
                        <defs>
                          <linearGradient id="inpresBarGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ea580c" />
                            <stop offset="100%" stopColor="#c2410c" />
                          </linearGradient>
                        </defs>
                        {[16, 12, 8, 4].map((val) => {
                          const y = 18 + ((16 - val) / 14) * 94;
                          return (
                            <g key={val}>
                              <line x1="32" y1={y} x2="445" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="0.8" />
                              <text x="28" y={y + 3} textAnchor="end" fontSize="8.5" fill="#94a3b8" fontWeight="600">
                                {val}T
                              </text>
                            </g>
                          );
                        })}
                        <line x1="32" y1="112" x2="445" y2="112" stroke="#cbd5e1" strokeWidth="1" />
                        {inpresStats.map((d, i) => {
                          const xCenter = 140 + i * 180;
                          const isSelected = d.year === selectedYear;
                          const h = (d.budgetTrillion / 16) * 94;
                          const yBar = 112 - h;

                          return (
                            <g key={d.stage} className="cursor-pointer" onClick={() => setSelectedYear(d.year)}>
                              {isSelected && (
                                <rect x={xCenter - 34} y="12" width="68" height="100" rx="4" fill="#c2410c" fillOpacity="0.06" />
                              )}
                              <rect
                                x={xCenter - 26}
                                y={yBar}
                                width="52"
                                height={h}
                                rx="3.5"
                                fill={isSelected ? "url(#inpresBarGrad)" : "#ea580c"}
                                opacity={isSelected ? 1 : 0.85}
                              />
                              <text x={xCenter} y={yBar - 5} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#c2410c">
                                Rp {d.budgetTrillion} T
                              </text>
                              <text x={xCenter} y="128" textAnchor="middle" fontSize="10" fontWeight={isSelected ? "bold" : "600"} fill={isSelected ? "#c2410c" : "#475569"}>
                                {d.stage}
                              </text>
                              <text x={xCenter} y="143" textAnchor="middle" fontSize="8" fill="#64748b">
                                {d.realizedKm.toLocaleString("id-ID")} KM • {d.provinces} Prov
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  )
                )}

                {/* Unified Executive Metric Footnote Strip (Compact, Clean, Data Preserved) */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/70 font-sans">
                  {selectedIndex === "kemantapan" && (
                    <div className="bg-white rounded-xl border border-slate-200/80 px-3.5 py-2.5 shadow-2xs">
                      <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                            Nasional
                          </span>
                          <strong className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                            {currentRoadTrend.nasional}%
                          </strong>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            Provinsi
                          </span>
                          <strong className="text-xs sm:text-sm font-bold text-amber-900 tabular-nums">
                            {currentRoadTrend.provinsi}%
                          </strong>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-[#c2410c] font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]" />
                            Kab/Kota
                          </span>
                          <strong className="text-xs sm:text-sm font-bold text-[#c2410c] tabular-nums">
                            {currentRoadTrend.kabupatenKota}%
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedIndex === "ombudsman" && (
                    <div className="bg-white rounded-xl border border-slate-200/80 px-3.5 py-2.5 shadow-2xs">
                      <div className="grid grid-cols-2 gap-2 text-center divide-x divide-slate-100">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]" />
                            Undue Delay ({selectedYear})
                          </span>
                          <strong className="text-xs sm:text-sm font-bold text-[#c2410c] tabular-nums">
                            {currentComplaintTrend.overduePct}% ({currentComplaintTrend.overdue.toLocaleString("id-ID")} Aduan)
                          </strong>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                            Total Aduan Selesai
                          </span>
                          <strong className="text-xs sm:text-sm font-bold text-slate-800 tabular-nums">
                            {currentComplaintTrend.resolved.toLocaleString("id-ID")} Aduan
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedIndex === "pagu" && (
                    <div className="bg-white rounded-xl border border-slate-200/80 px-3.5 py-2.5 shadow-2xs">
                      <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                            Total Pagu
                          </span>
                          <strong className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                            Rp 35,80 M
                          </strong>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]" />
                            Kontrak
                          </span>
                          <strong className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                            Rp 33,59 M
                          </strong>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Efisiensi
                          </span>
                          <div className="flex items-center gap-1">
                            <strong className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                              Rp 2,21 M
                            </strong>
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-1 py-0.2 rounded border border-slate-200">
                              6,2%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedIndex === "inpres" && (
                    <div className="bg-white rounded-xl border border-slate-200/80 px-3.5 py-2.5 shadow-2xs">
                      <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium">Tahap I (2023)</span>
                          <strong className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">Rp 14,60 T</strong>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium">Tahap II (2024)</span>
                          <strong className="text-xs sm:text-sm font-bold text-[#c2410c] tabular-nums">Rp 15,30 T</strong>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-emerald-700 font-medium">Total Fisik</span>
                          <strong className="text-xs sm:text-sm font-bold text-emerald-800 tabular-nums">5.992 KM</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: REKAPITULASI KORIDOR PILOT */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between space-y-2.5">
            
            {/* Header: Title & View Links */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight block">
                  Rekapitulasi Koridor Pilot
                </h2>
                <span className="text-[10px] text-slate-500 font-sans">
                  Klasifikasi kewenangan ruas terdata (Bukan peringkat kinerja)
                </span>
              </div>
              <button
                onClick={onExploreData}
                className="text-[#c2410c] hover:text-[#9a3412] text-xs font-bold flex items-center gap-0.5 transition-colors cursor-pointer font-sans"
              >
                <span>Anggaran Proyek</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Executive KPI Micro Strip (Eliminates barren empty space) */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50/90 border border-slate-200/70 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-500 font-semibold font-sans block">
                  Ruas Pilot
                </span>
                <strong className="text-base sm:text-lg font-bold text-slate-900 tabular-nums font-sans block mt-0.5">
                  6 Ruas
                </strong>
                <span className="text-[9px] text-slate-400 font-sans block">1 Nas • 2 Prov • 3 Kota</span>
              </div>
              <div className="bg-slate-50/90 border border-slate-200/70 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-500 font-semibold font-sans block">
                  Total Pagu
                </span>
                <strong className="text-base sm:text-lg font-bold text-slate-900 tabular-nums font-sans block mt-0.5">
                  Rp 35,80 M
                </strong>
                <span className="text-[9px] text-slate-400 font-sans block">Kontrak: Rp 33,59 M</span>
              </div>
              <div className="bg-rose-50/70 border border-rose-200/70 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-rose-700 font-semibold font-sans block">
                  Lewat SLA
                </span>
                <strong className="text-base sm:text-lg font-bold text-rose-600 tabular-nums font-sans block mt-0.5">
                  2 Tiket
                </strong>
                <span className="text-[9px] text-rose-600/80 font-sans block">&gt; 14 Hari Kerja</span>
              </div>
            </div>

            {/* Financial-Grade Structured Table */}
            <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/70 text-[9.5px] text-slate-500 font-sans font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-1.5 px-2.5">Klasifikasi Wewenang</th>
                    <th className="py-1.5 px-2 text-center">Ruas</th>
                    <th className="py-1.5 px-2.5 text-right">Pagu Pengadaan</th>
                    <th className="py-1.5 px-2.5 text-right">Status SLA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-xs">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-1.5 px-2.5">
                      <div className="font-bold text-slate-900 text-xs">KemenPUPR (BBPJN)</div>
                      <div className="text-[9.5px] text-slate-500 font-medium">Jalan Nasional</div>
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold tabular-nums text-slate-700">1</td>
                    <td className="py-1.5 px-2.5 text-right">
                      <div className="font-bold tabular-nums text-slate-900">Rp 8,45 M</div>
                      <div className="text-[9px] text-slate-400 tabular-nums">23,6% Pagu</div>
                    </td>
                    <td className="py-1.5 px-2.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 tabular-nums">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        Aman (0)
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-1.5 px-2.5">
                      <div className="font-bold text-slate-900 text-xs">DBMPR Jawa Barat</div>
                      <div className="text-[9.5px] text-slate-500 font-medium">Jalan Provinsi</div>
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold tabular-nums text-slate-700">2</td>
                    <td className="py-1.5 px-2.5 text-right">
                      <div className="font-bold tabular-nums text-slate-900">Rp 15,70 M</div>
                      <div className="text-[9px] text-slate-400 tabular-nums">43,9% Pagu</div>
                    </td>
                    <td className="py-1.5 px-2.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60 tabular-nums">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        1 Tiket Eskalasi
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-1.5 px-2.5">
                      <div className="font-bold text-slate-900 text-xs">Dinas PUPR Depok</div>
                      <div className="text-[9.5px] text-slate-500 font-medium">Jalan Kab / Kota</div>
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold tabular-nums text-slate-700">3</td>
                    <td className="py-1.5 px-2.5 text-right">
                      <div className="font-bold tabular-nums text-slate-900">Rp 11,65 M</div>
                      <div className="text-[9px] text-slate-400 tabular-nums">32,5% Pagu</div>
                    </td>
                    <td className="py-1.5 px-2.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60 tabular-nums">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        1 Tiket Eskalasi
                      </span>
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
                  <tr>
                    <td className="py-1.5 px-2.5 text-slate-900">Total Koridor Pilot</td>
                    <td className="py-1.5 px-2 text-center tabular-nums text-slate-900">6 Ruas</td>
                    <td className="py-1.5 px-2.5 text-right tabular-nums text-slate-900">Rp 35,80 M</td>
                    <td className="py-1.5 px-2.5 text-right">
                      <span className="text-[9.5px] font-bold text-rose-700 tabular-nums">2 Lewat SLA</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* SLA Alert Strip with Responsible Legal Context */}
            <div className="pt-2 text-[11px] text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 border-t border-slate-100 font-sans">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
                <span>2 laporan pilot telah melewati tenggat respons (14 hari kerja).</span>
              </div>
              <button
                onClick={() => {
                  if (onOpenOmbudsmanDraft) {
                    const firstOverdue = reports.find((r) => r.status === "OVERDUE");
                    if (firstOverdue) onOpenOmbudsmanDraft(firstOverdue);
                  }
                }}
                className="font-bold text-[#c2410c] hover:underline shrink-0 cursor-pointer text-[11px] flex items-center gap-0.5"
              >
                <span>Periksa Opsi Eskalasi</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. ACTIVE DATA MONITORING TABLE: RUAS & ANGGARAN APBD / LPSE */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          
          {/* Table Header: Title + Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/80 p-1.5 shadow-2xs shrink-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icon/jalan.png"
                  alt="Ruas Jalan"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight">
                    Tabel Penelusuran Ruas & Anggaran APBD
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 font-sans tabular-nums shadow-2xs">
                    {processedTableRoads.length} Ruas Terdata
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-sans">
                  Transparansi kewenangan, kepatuhan batas waktu respons 14 hari, serta pagu dan realisasi kontrak proyek APBD/APBN.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onExploreData}
                className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-orange-50 hover:text-orange-900 text-slate-700 border border-slate-200/90 transition-all cursor-pointer flex items-center gap-2 font-sans text-xs font-semibold shadow-2xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icon/financial.png" alt="" className="w-4 h-4 object-contain" />
                <span>Penelusuran Anggaran Proyek</span>
              </button>
            </div>
          </div>

          {/* Table Controls: Category Filter Tabs + Search Input */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-sans">
              {[
                { id: "ALL", label: "Semua Ruas", count: roads.length },
                { id: "NASIONAL", label: "Jalan Nasional", count: roads.filter((r) => r.authority === "NASIONAL").length },
                { id: "PROVINSI", label: "Jalan Provinsi", count: roads.filter((r) => r.authority === "PROVINSI").length },
                { id: "KOTA", label: "Jalan Kota", count: roads.filter((r) => r.authority === "KOTA").length },
                { id: "KABUPATEN", label: "Jalan Kabupaten", count: roads.filter((r) => r.authority === "KABUPATEN").length },
                { id: "SUMUT", label: "Pilot Sumut", count: roads.filter((r) => r.district?.includes("Medan") || r.district?.includes("Simalungun") || r.district?.includes("Karo") || r.district?.includes("Asahan") || r.code?.includes("SMT")).length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTableFilterChange(tab.id)}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    tableFilter === tab.id
                      ? "bg-[#c2410c] text-white border-[#c2410c] shadow-xs font-semibold"
                      : "bg-white hover:bg-orange-50/60 text-slate-700 hover:text-[#c2410c] border-slate-200 font-medium"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold tabular-nums ${
                    tableFilter === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={tableSearch}
                onChange={handleTableSearchChange}
                placeholder="Cari ruas, kota, atau kontraktor..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200/90 bg-slate-50/50 focus:bg-white placeholder-slate-400 text-slate-800 focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c]/20 font-sans shadow-2xs transition-all"
              />
              {tableSearch && (
                <button
                  onClick={() => { setTableSearch(""); setTablePage(1); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Clean, Streamlined Table with Orderly Layout */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse min-w-[960px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-600 font-sans font-bold uppercase tracking-wider bg-slate-50/80 whitespace-nowrap">
                  <th className="py-3 px-4 font-bold">Ruas Jalan</th>
                  <th className="py-3 px-3 font-bold">Kewenangan</th>
                  <th className="py-3 px-3 font-bold text-right">Pagu &amp; Kontrak</th>
                  <th className="py-3 px-3 font-bold">Kontraktor Pelaksana</th>
                  <th className="py-3 px-3 font-bold text-center">Status Respons</th>
                  <th className="py-3 px-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {paginatedRoads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                      <p className="font-semibold text-slate-700">Tidak ada ruas jalan yang cocok</p>
                      <p className="text-[11px] text-slate-400 mt-1">Coba gunakan kata kunci pencarian atau ubah filter kategori di atas.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedRoads.map((road) => {
                    const rep = reports.find((r) => r.roadSegmentId === road.id);
                    const isOverdue = rep?.status === "OVERDUE";

                    return (
                      <tr key={road.id} className="hover:bg-slate-50/70 transition-colors group">
                        {/* 1. Ruas Jalan & Wilayah: Clean 2-Line Hierarchy */}
                        <td className="py-3.5 px-4 min-w-[260px]">
                          <button
                            onClick={() => setSelectedRoadForDetail(road)}
                            className="font-bold text-slate-900 group-hover:text-[#c2410c] text-[13px] text-left transition-colors cursor-pointer block leading-snug"
                          >
                            {road.name}
                          </button>
                          <div className="text-[11.5px] text-slate-500 mt-1 flex items-center gap-1.5 font-sans whitespace-nowrap">
                            <span className="text-slate-600 font-medium">{road.district}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-semibold text-slate-700 tabular-nums">{road.lengthKm} km</span>
                          </div>
                        </td>

                        {/* 2. Status Wewenang: Calm Neutral Slate Pill */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {road.authority === "NASIONAL" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200/90">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                              <span>Jalan Nasional</span>
                            </span>
                          ) : road.authority === "PROVINSI" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200/90">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                              <span>Jalan Provinsi</span>
                            </span>
                          ) : road.authority === "KOTA" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200/90">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                              <span>Jalan Kota</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200/90">
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-500 shrink-0" />
                              <span>Jalan Kabupaten</span>
                            </span>
                          )}
                        </td>

                        {/* 3. Pagu vs Kontrak: Clean 2 Lines */}
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="font-sans font-bold tabular-nums text-slate-900 text-[13px]">
                            Rp {(road.budget?.paguRp / 1000000000).toFixed(2)} M
                          </div>
                          <div className="text-[11px] font-medium text-slate-500 tabular-nums mt-0.5">
                            Kontrak: Rp {(road.budget?.contractValueRp / 1000000000).toFixed(2)} M
                          </div>
                        </td>

                        {/* 4. Kontraktor & Status Verifikasi */}
                        <td className="py-3.5 px-3 min-w-[200px]">
                          <div className="font-semibold text-slate-800 text-[12.5px] truncate max-w-[220px]" title={road.budget?.contractor}>
                            {road.budget?.contractor || "Dalam Pengadaan"}
                          </div>
                          <div className="text-[11px] mt-0.5 flex items-center gap-1 font-sans">
                            {road.budget?.matchConfidence === "TERKONFIRMASI" ? (
                              <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />
                                <span>LPSE Terverifikasi</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>Parsial</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 5. Status Respons Pemantauan (14 Hari) */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          {isOverdue ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 text-xs font-semibold shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                              <span>Lewat Tenggat</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200/90 bg-slate-50/80 text-slate-700 text-xs font-medium shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                              <span>Terpantau Aman</span>
                            </div>
                          )}
                        </td>

                        {/* 6. Aksi: Buka Detail Ruas */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedRoadForDetail(road)}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-orange-50 text-slate-700 hover:text-[#c2410c] font-semibold text-xs border border-slate-200 hover:border-orange-300 transition-all duration-150 cursor-pointer inline-flex items-center gap-1 shadow-2xs group/btn"
                          >
                            <span>Detail</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-[#c2410c] group-hover/btn:translate-x-0.5 transition-all" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs text-slate-600 font-sans border-t border-slate-100">
            {/* Counter */}
            <div className="text-slate-500">
              Menampilkan{" "}
              <strong className="text-slate-800 font-semibold tabular-nums">
                {processedTableRoads.length === 0 ? 0 : (tablePage - 1) * (tablePageSize === "ALL" ? processedTableRoads.length : tablePageSize) + 1}
              </strong>
              {" - "}
              <strong className="text-slate-800 font-semibold tabular-nums">
                {tablePageSize === "ALL" ? processedTableRoads.length : Math.min(tablePage * tablePageSize, processedTableRoads.length)}
              </strong>
              {" dari "}
              <strong className="text-slate-800 font-semibold tabular-nums">
                {processedTableRoads.length}
              </strong>{" "}
              ruas jalan
            </div>

            {/* Pagination Buttons & Page Size Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Page size toggle */}
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mr-2">
                <span>Per hal:</span>
                {[6, 12, "ALL"].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setTablePageSize(size);
                      setTablePage(1);
                    }}
                    className={`px-2 py-0.5 rounded border cursor-pointer font-bold transition-colors ${
                      tablePageSize === size
                        ? "bg-[#c2410c] text-white border-[#c2410c] shadow-2xs"
                        : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {size === "ALL" ? "Semua" : size}
                  </button>
                ))}
              </div>

              {/* Prev & Next */}
              {tablePageSize !== "ALL" && totalTablePages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                    disabled={tablePage === 1}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold cursor-pointer transition-colors"
                  >
                    Sebelumnya
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalTablePages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => setTablePage(num)}
                      className={`w-7 h-7 rounded-lg border text-xs font-bold cursor-pointer transition-colors tabular-nums ${
                        tablePage === num
                          ? "bg-[#c2410c] text-white border-[#c2410c]"
                          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    onClick={() => setTablePage((p) => Math.min(totalTablePages, p + 1))}
                    disabled={tablePage === totalTablePages}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold cursor-pointer transition-colors"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Road Detail Modal */}
      <RoadDetailModal
        isOpen={Boolean(selectedRoadForDetail)}
        onClose={() => setSelectedRoadForDetail(null)}
        road={selectedRoadForDetail}
        reports={reports}
        onOpenOmbudsmanDraft={onOpenOmbudsmanDraft}
        onOpenReportModal={onOpenReport}
      />
    </section>
  );
}
