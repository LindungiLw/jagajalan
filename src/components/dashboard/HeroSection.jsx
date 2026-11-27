"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
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
  ShieldCheck,
  X,
} from "lucide-react";
import { INITIAL_REPORTS } from "@/data/reportsData";
import { ANNUAL_HISTORICAL_DATA, BINA_MARGA_APBN_TRENDS, NATIONAL_STATS } from "@/data/provincesData";
import RoadDetailModal from "@/components/modals/RoadDetailModal";

function getPaginationItems(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, "...", total];
  }
  if (current >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function HeroSection({
  roads = [],
  reports = INITIAL_REPORTS,
  onExploreData,
  onExploreMap,
  onOpenReport,
  onExploreNational,
  onOpenOfficerPortal,
  onOpenOmbudsmanDraft,
}) {
  const [selectedIndex, setSelectedIndex] = useState("kemantapan"); // 'kemantapan' | 'ombudsman' | 'pagu' | 'inpres'
  const [chartViewMode, setChartViewMode] = useState("line"); // 'line' | 'bar'
  const [selectedYear, setSelectedYear] = useState(2025);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoadForDetail, setSelectedRoadForDetail] = useState(null);

  // Table filter, search, and pagination state
  const [tableFilter, setTableFilter] = useState("ALL"); // ALL | NASIONAL | SUMUT | DAERAH
  const [tableSearch, setTableSearch] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(6); // Default 6 rows to prevent vertical overload

  // Expandable methodology footnote state
  const [expandedSources, setExpandedSources] = useState({});
  const toggleSourceExpanded = (key) => {
    setExpandedSources((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const { roadConditionTrends, ombudsmanMaladmin2025, inpresBudgets } = ANNUAL_HISTORICAL_DATA;

  const currentRoadTrend =
    roadConditionTrends.find((d) => d.year === selectedYear) ||
    roadConditionTrends[roadConditionTrends.length - 1];

  const binaMargaApbnTrends = BINA_MARGA_APBN_TRENDS;

  const currentBinaMarga =
    binaMargaApbnTrends.find((d) => d.year === selectedYear) ||
    binaMargaApbnTrends[binaMargaApbnTrends.length - 1];

  const inpresStats = inpresBudgets;

  // Pembagian resmi jaringan jalan non-tol Indonesia (BPS 2026 & Renstra KemenPU 2025–2029)
  const nationalAuthorityBreakdown = useMemo(() => [
    {
      key: "nasional",
      owner: "Pemerintah Pusat",
      sub: "Kementerian PU · Jalan Nasional",
      km: "47.605 km",
      share: "8,85%",
      goodPct: "94,18% Layak",
      badgeClass: "text-emerald-700 bg-emerald-50",
    },
    {
      key: "provinsi",
      owner: "Pemerintah Provinsi",
      sub: "Dinas PU Provinsi · Jalan Provinsi",
      km: "59.462 km",
      share: "11,05%",
      goodPct: "71,33% Layak",
      badgeClass: "text-purple-700 bg-purple-50",
    },
    {
      key: "kab_kota",
      owner: "Pemerintah Kab / Kota",
      sub: "Dinas PU Daerah · Jalan Kab/Kota",
      km: "431.035 km",
      share: "80,10%",
      goodPct: "57,91% Layak",
      badgeClass: "text-[#c2410c] bg-orange-50",
    },
  ], []);

  // Multi-entity search filtering
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return {
        matchedRoads: roads || [],
        matchedReports: reports || [],
        matchedPackages: (roads || []).map((r) => r?.budget).filter(Boolean),
        hasSearch: false,
      };
    }

    const matchedRoads = (roads || []).filter(
      (r) =>
        r?.name?.toLowerCase().includes(q) ||
        r?.code?.toLowerCase().includes(q) ||
        r?.authority?.toLowerCase().includes(q) ||
        r?.district?.toLowerCase().includes(q)
    );

    const matchedReports = (reports || []).filter(
      (rep) =>
        rep?.ticketCode?.toLowerCase().includes(q) ||
        rep?.roadName?.toLowerCase().includes(q) ||
        rep?.categoryLabel?.toLowerCase().includes(q) ||
        rep?.address?.toLowerCase().includes(q)
    );

    const matchedPackages = (roads || [])
      .map((r) => r?.budget)
      .filter(
        (b) =>
          b &&
          (b.packageId?.toLowerCase().includes(q) ||
            b.name?.toLowerCase().includes(q) ||
            b.packageName?.toLowerCase().includes(q) ||
            b.contractor?.toLowerCase().includes(q) ||
            b.source?.toLowerCase().includes(q))
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
    let list = roads || [];

    // 1. Filter by category
    if (tableFilter === "NASIONAL") {
      list = list.filter((r) => r?.authority === "NASIONAL");
    } else if (tableFilter === "PROVINSI") {
      list = list.filter((r) => r?.authority === "PROVINSI");
    } else if (tableFilter === "KOTA") {
      list = list.filter((r) => r?.authority === "KOTA");
    } else if (tableFilter === "KABUPATEN") {
      list = list.filter((r) => r?.authority === "KABUPATEN");
    } else if (tableFilter === "SUMUT") {
      list = list.filter(
        (r) =>
          r?.district?.toLowerCase().includes("medan") ||
          r?.district?.toLowerCase().includes("simalungun") ||
          r?.district?.toLowerCase().includes("karo") ||
          r?.district?.toLowerCase().includes("asahan") ||
          (r?.island === "Sumatera" && r?.code?.includes("SMT"))
      );
    } else if (tableFilter === "DAERAH") {
      list = list.filter((r) => r?.authority === "PROVINSI" || r?.authority === "KOTA" || r?.authority === "KABUPATEN" || r?.authority === "KOTA_KAB");
    }

    // 2. Filter by search query (combines local tableSearch and global hero searchQuery)
    const activeQuery = (tableSearch || searchQuery || "").trim().toLowerCase();
    if (activeQuery) {
      list = list.filter(
        (r) =>
          r?.name?.toLowerCase().includes(activeQuery) ||
          r?.code?.toLowerCase().includes(activeQuery) ||
          r?.district?.toLowerCase().includes(activeQuery) ||
          r?.authority?.toLowerCase().includes(activeQuery) ||
          r?.budget?.packageName?.toLowerCase().includes(activeQuery) ||
          r?.budget?.contractor?.toLowerCase().includes(activeQuery) ||
          r?.budget?.source?.toLowerCase().includes(activeQuery)
      );
    }

    return list;
  }, [roads, tableFilter, tableSearch, searchQuery]);

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
    <section id="beranda-hero" className="pt-3 pb-6 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5">
        
        {/* HERO UTAMA: CENTERED HEADER */}
        <div className="pt-2 pb-2.5 border-b border-slate-200/80 text-center">
          <h1 className="text-xl sm:text-2xl lg:text-[28px] font-bold font-heading text-slate-950 tracking-tight leading-snug mx-auto">
            Transparansi Kewenangan Jalan &amp; Anggaran Proyek Nasional
          </h1>
        </div>

        {/* 1. TOP UTILITY BAR: UNIFIED GLOBAL SEARCH & NATIONAL DATA SCOPE (FLOATING ISLAND) */}
        <div className="bg-slate-100/70 p-1.5 rounded-[8px] ring-1 ring-orange-200/50 flex flex-col md:flex-row md:items-center gap-1.5 text-xs transition-all">
          
          {/* Segment 1: Wilayah Scope */}
          <div className="px-3.5 py-2 flex items-center gap-2 font-sans text-slate-700 bg-white rounded-[6px] shadow-2xs shrink-0" title="Cakupan statistik kemantapan jalan 38 provinsi BPS dan percontohan koridor ruas daerah">
            <MapPin className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />
            <span className="text-[11.5px] font-semibold">
              Cakupan: <strong className="text-slate-900">Statistik 38 Provinsi &amp; Koridor Pilot</strong>
            </span>
          </div>

          {/* Segment 2: Official Verified Sources Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 text-[11px] font-sans text-slate-600 bg-white/60 rounded-[6px] shrink-0 select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-medium text-slate-700">BPS • LPSE • Kemen PU • Ombudsman</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">Data Resmi 2020–2025</span>
          </div>

          {/* Segment 3: Spacious Global Search Input with Active Submit */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const el = document.getElementById("daftar-ruas-tabel");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="relative flex-1 min-w-[280px] flex items-center bg-white rounded-[6px] shadow-2xs group ring-1 ring-orange-200/50 focus-within:ring-2 focus-within:ring-orange-500/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon/search_icon.png"
              alt=""
              width={16}
              height={16}
              style={{ width: "16px", height: "16px" }}
              className="w-3.5 h-3.5 object-contain absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setTablePage(1);
              }}
              placeholder="Cari nama ruas jalan, kode laporan, paket pengadaan, kontraktor..."
              className="w-full h-full pl-9 pr-20 py-2 text-xs text-slate-900 placeholder:text-slate-500 bg-transparent focus-visible:outline-none transition-all font-sans"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setTablePage(1);
                  }}
                  aria-label="Hapus pencarian"
                  className="p-1.5 rounded-[4px] bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-[#c2410c] flex items-center justify-center cursor-pointer transition-colors"
                  title="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="px-2.5 py-1 rounded-[4px] bg-[#c2410c] hover:bg-[#9a3412] text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                title="Cari ruas dan filter tabel"
              >
                Cari
              </button>
            </div>
          </form>
        </div>

        {/* Instant Search Results Summary Pill if searching */}
        {searchResults.hasSearch && (
          <div className="p-3 rounded-[6px] bg-orange-500/10 ring-1 ring-orange-500/20 text-xs flex flex-wrap items-center justify-between gap-2 animate-fade-in font-medium">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#c2410c] font-sans uppercase tracking-wider text-[10.5px]">
                Hasil Pencarian:
              </span>
              <span className="text-slate-800">
                <strong>{searchResults.matchedRoads.length}</strong> Ruas Jalan •{" "}
                <strong>{searchResults.matchedPackages.length}</strong> Paket Pengadaan •{" "}
                <strong>{searchResults.matchedReports.length}</strong> Tiket Aduan
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("daftar-ruas-tabel");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-slate-700 hover:text-[#c2410c] font-bold text-[11px] cursor-pointer flex items-center gap-1"
              >
                <span>Lihat Hasil di Tabel ({processedTableRoads.length})</span>
                <span>↓</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setTablePage(1);
                }}
                className="text-[#c2410c] hover:underline font-bold text-[11px] cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          </div>
        )}

        {/* 2. OPERATIONAL NATIONAL SUMMARY STRIP (ORANGE BRAND STRIP — 100% OFFICIAL NATIONAL STATS) */}
        <div className="bg-[#c2410c] text-white px-4 sm:px-5 py-2.5 rounded-[6px] flex flex-col sm:flex-row sm:items-center justify-between text-xs shadow-xs gap-3 font-semibold">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <span className="text-white font-bold text-xs font-sans">
              Data Nasional:
            </span>
            <div className="flex items-center gap-1.5" title="Cakupan statistik kondisi jalan seluruh Indonesia menurut BPS">
              <strong className="text-white font-sans font-bold text-sm tabular-nums">38</strong>
              <span className="text-white/90 font-medium text-xs">Provinsi (BPS)</span>
            </div>
            <span className="hidden sm:inline-block w-px h-3.5 bg-white/30 self-center" aria-hidden="true" />
            <div className="flex items-center gap-1.5" title="Total panjang jalan non-tol nasional, provinsi, dan kabupaten/kota (BPS Statistik Indonesia 2026, data 2025)">
              <strong className="text-white font-sans font-bold text-sm tabular-nums">538.102 km</strong>
              <span className="text-white/90 font-medium text-xs">Jalan Non-Tol</span>
            </div>
            <span className="hidden sm:inline-block w-px h-3.5 bg-white/30 self-center" aria-hidden="true" />
            <div className="flex items-center gap-1.5" title="Jumlah koridor ruas jalan yang sudah dipetakan di peta interaktif JagaJalan">
              <strong className="text-white font-sans font-bold text-sm tabular-nums">
                {(roads || []).length}
              </strong>
              <span className="text-white/90 font-medium text-xs">Koridor di Peta GIS</span>
            </div>
          </div>

          <span className="text-[11px] font-sans text-white/90 font-medium self-end sm:self-auto" title="Rujukan data makro resmi pemerintah Indonesia">
            Sumber Resmi: BPS · KemenPU · Ombudsman RI
          </span>
        </div>

        {/* 3. DUAL-PANEL DATA MONITOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          
          {/* LEFT 7 COLS: KONDISI JALAN INDONESIA & DATA KUNCI (100% OFFICIAL DATA) */}
          <div className="lg:col-span-7 bg-slate-100/60 p-2 sm:p-2.5 rounded-[8px] ring-1 ring-orange-200/50">
            <div className="bg-white rounded-[6px] p-4 sm:p-5 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] flex flex-col justify-between space-y-3.5 h-full">
            
            {/* Header: Title & View Links */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight">
                  Kondisi Jalan Indonesia &amp; Data Kunci
                </h2>
              </div>
              <button
                onClick={onExploreNational}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#c2410c] hover:text-[#9a3412] hover:underline transition-colors cursor-pointer font-sans group"
                title="Buka perbandingan kondisi jalan 38 provinsi di menu Statistik"
              >
                <span>Lihat 38 Provinsi</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#c2410c] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Split: Index List (Left) + Interactive Visual Chart (Right) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
              
              {/* Index Column (5 cols, citizen-friendly labels) */}
              <div className="sm:col-span-5 space-y-2">
                {/* Index 1: Jalan Layak Kab/Kota */}
                <button
                  onClick={() => setSelectedIndex("kemantapan")}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-[6px] transition-all cursor-pointer group ${
                    selectedIndex === "kemantapan"
                      ? "bg-[#c2410c] text-white shadow-md ring-1 ring-orange-600"
                      : "bg-slate-50/80 text-slate-800 hover:bg-orange-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[6px] p-1.5 shrink-0 flex items-center justify-center transition-all ${
                      selectedIndex === "kemantapan"
                        ? "bg-white/20"
                        : "bg-white shadow-2xs"
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/icon/jalan.png"
                        alt="Jalan Layak Kab/Kota"
                        width={28}
                        height={28}
                        style={{ width: "28px", height: "28px" }}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[11.5px] sm:text-xs font-semibold font-sans truncate ${
                          selectedIndex === "kemantapan" ? "text-white" : "text-slate-600"
                        }`}>
                          Jalan Layak Kab/Kota
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          selectedIndex === "kemantapan" ? "text-white translate-x-0.5" : "text-slate-400 group-hover:text-slate-600"
                        }`} />
                      </div>
                      <div className="text-lg sm:text-xl font-bold font-sans tabular-nums mt-0.5 leading-tight tracking-tight flex items-baseline gap-1.5">
                        <span className={selectedIndex === "kemantapan" ? "text-white" : "text-slate-900"}>57,91%</span>
                        <span className={`text-xs font-medium font-sans ${
                          selectedIndex === "kemantapan" ? "text-orange-100 font-semibold" : "text-slate-500"
                        }`}>
                          Baik &amp; Sedang
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Index 2: Aduan ke Pemda (Ombudsman RI) */}
                <button
                  onClick={() => setSelectedIndex("ombudsman")}
                  title="Total 4.766 laporan terhadap Pemerintah Daerah di seluruh sektor pelayanan publik sepanjang 2025 (622 substansi perhubungan & infrastruktur, 287 subkategori jalan)"
                  className={`w-full text-left p-2.5 sm:p-3 rounded-[6px] transition-all cursor-pointer group ${
                    selectedIndex === "ombudsman"
                      ? "bg-[#c2410c] text-white shadow-md ring-1 ring-orange-600"
                      : "bg-slate-50/80 text-slate-800 hover:bg-orange-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[6px] p-1.5 shrink-0 flex items-center justify-center transition-all ${
                      selectedIndex === "ombudsman"
                        ? "bg-white/20"
                        : "bg-white shadow-2xs"
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/icon/warning_icon.png"
                        alt="Aduan ke Pemda"
                        width={28}
                        height={28}
                        style={{ width: "28px", height: "28px" }}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[11.5px] sm:text-xs font-semibold font-sans truncate ${
                          selectedIndex === "ombudsman" ? "text-white" : "text-slate-600"
                        }`}>
                          Aduan Pemda · Ombudsman
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          selectedIndex === "ombudsman" ? "text-white translate-x-0.5" : "text-slate-400 group-hover:text-slate-600"
                        }`} />
                      </div>
                      <div className="text-lg sm:text-xl font-bold font-sans tabular-nums mt-0.5 leading-tight tracking-tight flex items-baseline gap-1.5 flex-nowrap">
                        <span className={`whitespace-nowrap ${selectedIndex === "ombudsman" ? "text-white" : "text-slate-900"}`}>4.766</span>
                        <span className={`text-[11px] font-medium font-sans whitespace-nowrap truncate ${
                          selectedIndex === "ombudsman" ? "text-orange-100 font-semibold" : "text-slate-500"
                        }`}>
                          Lintas Sektor (2025)
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedIndex("pagu")}
                  title="Pagu efektif Ditjen Bina Marga Kementerian PU TA 2025 pasca rekonstruksi efisiensi (dari pagu alokasi awal Rp 37,41 T)"
                  className={`w-full text-left p-2.5 sm:p-3 rounded-[6px] transition-all cursor-pointer group ${
                    selectedIndex === "pagu"
                      ? "bg-[#c2410c] text-white shadow-md ring-1 ring-orange-600"
                      : "bg-slate-50/80 text-slate-800 hover:bg-orange-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[6px] p-1.5 shrink-0 flex items-center justify-center transition-all ${
                      selectedIndex === "pagu"
                        ? "bg-white/20"
                        : "bg-white shadow-2xs"
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/icon/financial.png"
                        alt="Anggaran Jalan Pusat"
                        width={28}
                        height={28}
                        style={{ width: "28px", height: "28px" }}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[11.5px] sm:text-xs font-semibold font-sans truncate ${
                          selectedIndex === "pagu" ? "text-white" : "text-slate-600"
                        }`}>
                          Anggaran Jalan Pusat (APBN)
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          selectedIndex === "pagu" ? "text-white translate-x-0.5" : "text-slate-400 group-hover:text-slate-600"
                        }`} />
                      </div>
                      <div className="text-lg sm:text-xl font-bold font-sans tabular-nums mt-0.5 leading-tight tracking-tight flex items-baseline gap-1.5 flex-nowrap">
                        <span className={`whitespace-nowrap ${selectedIndex === "pagu" ? "text-white" : "text-slate-900"}`}>Rp 28,78 T</span>
                        <span className={`text-[11px] font-medium font-sans whitespace-nowrap truncate ${
                          selectedIndex === "pagu" ? "text-orange-100 font-semibold" : "text-slate-500"
                        }`}>
                          Efektif 2025
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedIndex("inpres")}
                  title="Akumulasi Inpres Jalan Daerah: Inpres No. 3/2023 (Rp 14,60 T) + Inpres No. 11/2025 (Rp 10,21 T)"
                  className={`w-full text-left p-2.5 sm:p-3 rounded-[6px] transition-all cursor-pointer group ${
                    selectedIndex === "inpres"
                      ? "bg-[#c2410c] text-white shadow-md ring-1 ring-orange-600"
                      : "bg-slate-50/80 text-slate-800 hover:bg-orange-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[6px] p-1.5 shrink-0 flex items-center justify-center transition-all ${
                      selectedIndex === "inpres"
                        ? "bg-white/20"
                        : "bg-white shadow-2xs"
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/icon/maps.png"
                        alt="Inpres Jalan Daerah"
                        width={28}
                        height={28}
                        style={{ width: "28px", height: "28px" }}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[11.5px] sm:text-xs font-semibold font-sans truncate ${
                          selectedIndex === "inpres" ? "text-white" : "text-slate-600"
                        }`}>
                          Inpres Jalan Daerah (IJD)
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          selectedIndex === "inpres" ? "text-white translate-x-0.5" : "text-slate-400 group-hover:text-slate-600"
                        }`} />
                      </div>
                      <div className="text-lg sm:text-xl font-bold font-sans tabular-nums mt-0.5 leading-tight tracking-tight flex items-baseline gap-1.5 flex-nowrap">
                        <span className={`whitespace-nowrap ${selectedIndex === "inpres" ? "text-white" : "text-slate-900"}`}>Rp 24,81 T</span>
                        <span className={`text-[11px] font-medium font-sans whitespace-nowrap truncate ${
                          selectedIndex === "inpres" ? "text-orange-100 font-semibold" : "text-slate-500"
                        }`}>
                          2023–2025
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Chart Column: Dynamic Visual Monitor based on selectedIndex */}
              <div className="sm:col-span-7 bg-slate-50/80 rounded-[6px] p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden">
                {/* Chart Header: Structured 2-Tier Header */}
                <div className="space-y-1.5 border-b border-slate-200/60 pb-2">
                  {/* Row 1: Title & Main Type Switcher (Garis / Batang) */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[9.5px] font-semibold text-slate-500 uppercase font-sans tracking-wide truncate block">
                        {selectedIndex === "kemantapan" && "BPS & BASELINE RENSTRA PU (2020–2025)"}
                        {selectedIndex === "ombudsman" && "LAPORAN OMBUDSMAN RI 2025/2026"}
                        {selectedIndex === "pagu" && "DITJEN BINA MARGA KEMENPU (APBN 2020–2025)"}
                        {selectedIndex === "inpres" && "KEMENPU · INPRES 3/2023 & INPRES 11/2025"}
                      </span>
                      <strong
                        className="text-xs sm:text-sm font-bold font-heading text-slate-900 tracking-tight truncate block"
                        title={
                          selectedIndex === "kemantapan"
                            ? "Persentase Jalan Kondisi Layak (Nasional, Provinsi, Kab/Kota)"
                            : selectedIndex === "ombudsman"
                            ? "5 Besar Dugaan Maladministrasi Ombudsman RI 2025 (%)"
                            : selectedIndex === "pagu"
                            ? "Pagu Awal vs DIPA Akhir/Efektif Ditjen Bina Marga (Rp Triliun)"
                            : "Alokasi APBN Inpres Jalan Daerah (2023 & 2025)"
                        }
                      >
                        {selectedIndex === "kemantapan" && "Persentase Jalan Kondisi Layak"}
                        {selectedIndex === "ombudsman" && "5 Dugaan Maladministrasi 2025"}
                        {selectedIndex === "pagu" && "Pagu APBN Bina Marga (Awal vs Efektif)"}
                        {selectedIndex === "inpres" && "Dana Bantuan Jalan Daerah (IJD)"}
                      </strong>
                    </div>

                    {/* Mode Switcher: Garis / Batang */}
                    <div className="inline-flex items-center border border-orange-200/70 bg-white rounded-[6px] overflow-hidden divide-x divide-orange-200/60 text-[10px] font-bold shadow-2xs font-sans shrink-0">
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

                  {/* Row 2: Sub-toolbar / Legend & Year Filter Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-y-1.5 gap-x-2 pt-0.5 text-[9px] sm:text-[9.5px] font-sans">
                    {/* Left: Dynamic Color Legend */}
                    {selectedIndex === "kemantapan" && (
                      <div className="flex items-center gap-2 font-medium text-slate-600 shrink-0">
                        <span className="flex items-center gap-1 text-[9px]"><span className="w-2 h-1 rounded-xs bg-blue-600" />Nasional</span>
                        <span className="flex items-center gap-1 text-[9px]"><span className="w-2 h-1 rounded-xs bg-purple-600" />Provinsi</span>
                        <span className="flex items-center gap-1 text-[9px] text-orange-700 font-bold"><span className="w-2 h-1 rounded-xs bg-orange-600" />Kab/Kota</span>
                      </div>
                    )}
                    {selectedIndex === "ombudsman" && (
                      <div className="flex items-center gap-2 font-medium text-slate-600 shrink-0">
                        <span className="flex items-center gap-1 text-[#c2410c] font-bold text-[9px]"><span className="w-2 h-1 rounded-xs bg-[#c2410c]" />Penundaan Berlarut (21,25%)</span>
                        <span className="flex items-center gap-1 text-[9px] text-slate-500"><span className="w-2 h-1 rounded-xs bg-slate-500" />Dugaan Lain (%)</span>
                      </div>
                    )}
                    {selectedIndex === "pagu" && (
                      <div className="flex items-center gap-2.5 font-medium shrink-0">
                        <span className="flex items-center gap-1 text-[9px] text-slate-600"><span className="w-2 h-1 rounded-xs bg-slate-500" />Pagu Awal</span>
                        <span className="flex items-center gap-1 text-[9px] text-[#c2410c] font-bold"><span className="w-2 h-1 rounded-xs bg-[#c2410c]" />DIPA Akhir / Efektif</span>
                      </div>
                    )}
                    {selectedIndex === "inpres" && (
                      <div className="flex items-center gap-2 font-medium text-slate-600 shrink-0">
                        <span className="flex items-center gap-1 text-[9px]"><span className="w-2 h-1 rounded-xs bg-[#c2410c]" />Alokasi APBN IJD (Rp Triliun)</span>
                      </div>
                    )}

                    {(selectedIndex === "kemantapan" || selectedIndex === "pagu") && (
                      <div className="inline-flex items-center border border-orange-200/70 bg-white rounded-[5px] overflow-hidden divide-x divide-orange-200/60 text-[9px] font-bold font-sans shadow-2xs tabular-nums shrink-0">
                        {[2020, 2021, 2022, 2023, 2024, 2025].map((yr) => (
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

                    {selectedIndex === "inpres" && (
                      <div className="inline-flex items-center border border-orange-200/70 bg-white rounded-[5px] overflow-hidden divide-x divide-orange-200/60 text-[9px] font-bold font-sans shadow-2xs tabular-nums shrink-0">
                        {[2023, 2025].map((yr) => (
                          <button
                            key={yr}
                            onClick={() => setSelectedYear(yr)}
                            className={`px-2 py-0.5 transition-colors cursor-pointer ${
                              selectedYear === yr
                                ? "bg-[#c2410c] text-white font-bold"
                                : "bg-white text-slate-600 hover:bg-orange-50/60 hover:text-[#c2410c]"
                            }`}
                          >
                            {yr === 2023 ? "Inpres 3/2023" : "Inpres 11/2025"}
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
                            ${roadConditionTrends.map((d, i) => `${56 + i * (348 / (roadConditionTrends.length - 1))},${18 + ((100 - d.nasional) / 60) * 94}`).join(" ")}
                            ${[...roadConditionTrends].reverse().map((d, i) => `${404 - i * (348 / (roadConditionTrends.length - 1))},${18 + ((100 - d.kabupatenKota) / 60) * 94}`).join(" ")}
                          `}
                          fill="url(#kemantapanAreaGrad)"
                        />
                        <path
                          d={roadConditionTrends.map((d, i) => `${i === 0 ? "M" : "L"} ${56 + i * (348 / (roadConditionTrends.length - 1))} ${18 + ((100 - d.nasional) / 60) * 94}`).join(" ")}
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <path
                          d={roadConditionTrends.map((d, i) => `${i === 0 ? "M" : "L"} ${56 + i * (348 / (roadConditionTrends.length - 1))} ${18 + ((100 - d.provinsi) / 60) * 94}`).join(" ")}
                          fill="none"
                          stroke="#9333ea"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                        <path
                          d={roadConditionTrends.map((d, i) => `${i === 0 ? "M" : "L"} ${56 + i * (348 / (roadConditionTrends.length - 1))} ${18 + ((100 - d.kabupatenKota) / 60) * 94}`).join(" ")}
                          fill="none"
                          stroke="#ea580c"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                        />
                        {roadConditionTrends.map((d, i) => {
                          const x = 56 + i * (348 / (roadConditionTrends.length - 1));
                          const yNas = 18 + ((100 - d.nasional) / 60) * 94;
                          const yProv = 18 + ((100 - d.provinsi) / 60) * 94;
                          const yKab = 18 + ((100 - d.kabupatenKota) / 60) * 94;
                          const isSelected = d.year === selectedYear;

                          return (
                            <g key={d.year} className="cursor-pointer" onClick={() => setSelectedYear(d.year)}>
                              <rect x={x - 20} y="10" width="40" height="135" fill="transparent" />
                              {isSelected && (
                                <line x1={x} y1="18" x2={x} y2="112" stroke="#ea580c" strokeWidth="1.2" strokeDasharray="2 2" />
                              )}
                              <circle cx={x} cy={yNas} r={isSelected ? 4.5 : 3} fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
                              <circle cx={x} cy={yProv} r={isSelected ? 4.5 : 3} fill="#9333ea" stroke="#fff" strokeWidth="1.5" />
                              <circle cx={x} cy={yKab} r={isSelected ? 6 : 4} fill="#ea580c" stroke="#fff" strokeWidth="2" />
                              <text x={x} y={yKab - 7} textAnchor="middle" fontSize="8" fontWeight="bold" fill={isSelected ? "#9a3412" : "#ea580c"}>
                                {d.kabupatenKota}%
                              </text>
                              {/* Bottom Year Button Pill */}
                              {isSelected ? (
                                <g>
                                  <rect x={x - 16} y="118" width="32" height="18" rx="4" fill="#c2410c" />
                                  <text x={x} y="131" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ffffff">{d.year}</text>
                                </g>
                              ) : (
                                <g>
                                  <rect x={x - 16} y="118" width="32" height="18" rx="4" fill="#f1f5f9" className="hover:fill-orange-50 transition-colors" />
                                  <text x={x} y="131" textAnchor="middle" fontSize="9" fontWeight="600" fill="#475569">{d.year}</text>
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
                          const xCenter = 58 + i * (355 / (roadConditionTrends.length - 1));
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
                                <rect x={xCenter - 18} y="14" width="36" height="98" rx="5" fill="#f8fafc" stroke="#fed7aa" strokeWidth="1" />
                              )}
                              
                              {/* Nasional Bar */}
                              <rect x={xCenter - 13} y={yNas} width="8" height={hNas} rx="2" fill="#2563eb" />
                              {isSelected && (
                                <text x={xCenter - 9} y={yNas - 3.5} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#1d4ed8">
                                  {d.nasional}%
                                </text>
                              )}

                              {/* Provinsi Bar */}
                              <rect x={xCenter - 4} y={yProv} width="8" height={hProv} rx="2" fill="#7c3aed" />
                              {isSelected && (
                                <text x={xCenter} y={yProv - 3.5} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#6d28d9">
                                  {d.provinsi}%
                                </text>
                              )}

                              {/* Kab/Kota Bar */}
                              <rect x={xCenter + 5} y={yKab} width="8" height={hKab} rx="2" fill="#ea580c" />
                              <text x={xCenter + 9} y={yKab - 3.5} textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#c2410c">
                                {d.kabupatenKota}%
                              </text>

                              {/* Year Button Pill Under Baseline */}
                              {isSelected ? (
                                <g>
                                  <rect x={xCenter - 16} y="118" width="32" height="18" rx="4" fill="#c2410c" />
                                  <text x={xCenter} y="131" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ffffff">{d.year}</text>
                                </g>
                              ) : (
                                <g>
                                  <rect x={xCenter - 16} y="118" width="32" height="18" rx="4" fill="#f1f5f9" className="hover:fill-orange-50 transition-colors" />
                                  <text x={xCenter} y="131" textAnchor="middle" fontSize="9" fontWeight="600" fill="#475569">{d.year}</text>
                                </g>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  )
                )}

                {/* 2. CHART BODY: 5 BESAR DUGAAN MALADMINISTRASI OMBUDSMAN RI 2025 */}
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
                        {[50, 40, 30, 20, 10].map((val) => {
                          const y = 18 + ((50 - val) / 50) * 94;
                          return (
                            <g key={val}>
                              <line x1="32" y1={y} x2="445" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="0.8" />
                              <text x="28" y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8" fontWeight="600">
                                {val}%
                              </text>
                            </g>
                          );
                        })}
                        <line x1="32" y1="112" x2="445" y2="112" stroke="#cbd5e1" strokeWidth="1" />
                        <polygon
                          points={`
                            ${ombudsmanMaladmin2025.map((d, i) => `${64 + i * 86},${18 + ((50 - d.pct) / 50) * 94}`).join(" ")}
                            408,112 64,112
                          `}
                          fill="url(#ombudsmanAreaGrad)"
                        />
                        <path
                          d={ombudsmanMaladmin2025.map((d, i) => `${i === 0 ? "M" : "L"} ${64 + i * 86} ${18 + ((50 - d.pct) / 50) * 94}`).join(" ")}
                          fill="none"
                          stroke="#c2410c"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {ombudsmanMaladmin2025.map((d, i) => {
                          const x = 64 + i * 86;
                          const y = 18 + ((50 - d.pct) / 50) * 94;
                          return (
                            <g key={d.key}>
                              <circle
                                cx={x}
                                cy={y}
                                r={d.highlight ? 6 : 4}
                                fill={d.highlight ? "#c2410c" : "#64748b"}
                                stroke="#fff"
                                strokeWidth="2"
                              />
                              <text x={x} y={y - 7} textAnchor="middle" fontSize="8" fontWeight="bold" fill={d.highlight ? "#c2410c" : "#334155"}>
                                {d.pct.toFixed(2).replace(".", ",")}%
                              </text>
                              <text x={x} y="128" textAnchor="middle" fontSize="7.5" fontWeight={d.highlight ? "bold" : "600"} fill={d.highlight ? "#9a3412" : "#475569"}>
                                {d.shortLabel}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  ) : (
                    <div className="h-40 sm:h-44 pt-1 px-1 flex flex-col justify-end">
                      <svg viewBox="0 0 460 144" className="w-full h-full select-none font-sans">
                        {[50, 40, 30, 20, 10].map((val) => {
                          const y = 18 + ((50 - val) / 50) * 94;
                          return (
                            <g key={val}>
                              <line x1="32" y1={y} x2="445" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="0.8" />
                              <text x="28" y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8" fontWeight="600">
                                {val}%
                              </text>
                            </g>
                          );
                        })}
                        <line x1="32" y1="112" x2="445" y2="112" stroke="#cbd5e1" strokeWidth="1" />
                        {ombudsmanMaladmin2025.map((d, i) => {
                          const xCenter = 64 + i * 86;
                          const h = (d.pct / 50) * 94;
                          const yBar = 112 - h;
                          return (
                            <g key={d.key}>
                              <rect
                                x={xCenter - 16}
                                y={yBar}
                                width="32"
                                height={h}
                                rx="3"
                                fill={d.highlight ? "#c2410c" : "#64748b"}
                                opacity={d.highlight ? 1 : 0.8}
                              />
                              <text x={xCenter} y={yBar - 4} textAnchor="middle" fontSize="8" fontWeight="bold" fill={d.highlight ? "#c2410c" : "#334155"}>
                                {d.pct.toFixed(2).replace(".", ",")}%
                              </text>
                              <text x={xCenter} y="128" textAnchor="middle" fontSize="7.5" fontWeight={d.highlight ? "bold" : "600"} fill={d.highlight ? "#9a3412" : "#475569"}>
                                {d.shortLabel}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  )
                )}

                {/* 3. CHART BODY: PAGU APBN BINA MARGA AWAL VS DIPA AKHIR/EFEKTIF (2020 - 2025) */}
                {selectedIndex === "pagu" && (
                  chartViewMode === "line" ? (
                    <div className="h-40 sm:h-44 pt-1 px-1 flex flex-col justify-end">
                      <svg viewBox="0 0 460 144" className="w-full h-full select-none font-sans">
                        <defs>
                          <linearGradient id="binaMargaAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c2410c" stopOpacity="0.22" />
                            <stop offset="100%" stopColor="#c2410c" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {[80, 60, 40, 20].map((val) => {
                          const y = 18 + ((80 - val) / 80) * 94;
                          return (
                            <g key={val}>
                              <line x1="34" y1={y} x2="445" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="0.8" />
                              <text x="30" y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8" fontWeight="600">
                                {val}T
                              </text>
                            </g>
                          );
                        })}
                        <line x1="34" y1="112" x2="445" y2="112" stroke="#cbd5e1" strokeWidth="1" />
                        <polygon
                          points={`
                            ${binaMargaApbnTrends.map((d, i) => `${58 + i * (348 / (binaMargaApbnTrends.length - 1))},${18 + ((80 - d.paguRevisi) / 80) * 94}`).join(" ")}
                            406,112 58,112
                          `}
                          fill="url(#binaMargaAreaGrad)"
                        />
                        <path
                          d={binaMargaApbnTrends.map((d, i) => `${i === 0 ? "M" : "L"} ${58 + i * (348 / (binaMargaApbnTrends.length - 1))} ${18 + ((80 - d.paguAwal) / 80) * 94}`).join(" ")}
                          fill="none"
                          stroke="#64748b"
                          strokeWidth="1.8"
                          strokeDasharray="3 3"
                          strokeLinecap="round"
                        />
                        <path
                          d={binaMargaApbnTrends.map((d, i) => `${i === 0 ? "M" : "L"} ${58 + i * (348 / (binaMargaApbnTrends.length - 1))} ${18 + ((80 - d.paguRevisi) / 80) * 94}`).join(" ")}
                          fill="none"
                          stroke="#c2410c"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                        />
                        {binaMargaApbnTrends.map((d, i) => {
                          const x = 58 + i * (348 / (binaMargaApbnTrends.length - 1));
                          const yAwal = 18 + ((80 - d.paguAwal) / 80) * 94;
                          const yRev = 18 + ((80 - d.paguRevisi) / 80) * 94;
                          const isSelected = d.year === selectedYear;

                          return (
                            <g key={d.year} className="cursor-pointer" onClick={() => setSelectedYear(d.year)}>
                              <rect x={x - 20} y="10" width="40" height="130" fill="transparent" />
                              {isSelected && (
                                <line x1={x} y1="18" x2={x} y2="112" stroke="#c2410c" strokeWidth="1.2" strokeDasharray="2 2" />
                              )}
                              <circle cx={x} cy={yAwal} r={isSelected ? 4 : 2.8} fill="#64748b" stroke="#fff" strokeWidth="1.2" />
                              <circle cx={x} cy={yRev} r={isSelected ? 5.5 : 3.8} fill="#c2410c" stroke="#fff" strokeWidth="2" />
                              <text x={x} y={yRev - 7} textAnchor="middle" fontSize="8" fontWeight="bold" fill={isSelected ? "#9a3412" : "#c2410c"}>
                                {d.paguRevisi.toFixed(1).replace(".", ",")}T
                              </text>
                              {isSelected ? (
                                <g>
                                  <rect x={x - 16} y="118" width="32" height="18" rx="4" fill="#c2410c" />
                                  <text x={x} y="131" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ffffff">{d.year}</text>
                                </g>
                              ) : (
                                <g>
                                  <rect x={x - 16} y="118" width="32" height="18" rx="4" fill="#f1f5f9" className="hover:fill-orange-50 transition-colors" />
                                  <text x={x} y="131" textAnchor="middle" fontSize="9" fontWeight="600" fill="#475569">{d.year}</text>
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
                        {[80, 60, 40, 20].map((val) => {
                          const y = 18 + ((80 - val) / 80) * 94;
                          return (
                            <g key={val}>
                              <line x1="34" y1={y} x2="445" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="0.8" />
                              <text x="30" y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8" fontWeight="600">
                                {val}T
                              </text>
                            </g>
                          );
                        })}
                        <line x1="34" y1="112" x2="445" y2="112" stroke="#cbd5e1" strokeWidth="1" />
                        {binaMargaApbnTrends.map((d, i) => {
                          const xCenter = 58 + i * (348 / (binaMargaApbnTrends.length - 1));
                          const isSelected = d.year === selectedYear;
                          const hAwal = (d.paguAwal / 80) * 94;
                          const hRev = (d.paguRevisi / 80) * 94;
                          const yAwal = 112 - hAwal;
                          const yRev = 112 - hRev;

                          return (
                            <g key={d.year} className="cursor-pointer" onClick={() => setSelectedYear(d.year)}>
                              {isSelected && (
                                <rect x={xCenter - 18} y="12" width="36" height="100" rx="4" fill="#c2410c" fillOpacity="0.06" />
                              )}
                              <rect x={xCenter - 12} y={yAwal} width="10" height={hAwal} rx="2" fill="#64748b" opacity={isSelected ? 1 : 0.78} />
                              <rect x={xCenter + 1} y={yRev} width="10" height={hRev} rx="2" fill="#c2410c" opacity={isSelected ? 1 : 0.85} />
                              <text x={xCenter} y={Math.min(yAwal, yRev) - 4} textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#c2410c">
                                {d.paguRevisi.toFixed(1).replace(".", ",")}T
                              </text>
                              {isSelected ? (
                                <g>
                                  <rect x={xCenter - 16} y="118" width="32" height="18" rx="4" fill="#c2410c" />
                                  <text x={xCenter} y="131" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ffffff">{d.year}</text>
                                </g>
                              ) : (
                                <g>
                                  <rect x={xCenter - 16} y="118" width="32" height="18" rx="4" fill="#f1f5f9" className="hover:fill-orange-50 transition-colors" />
                                  <text x={xCenter} y="131" textAnchor="middle" fontSize="9" fontWeight="600" fill="#475569">{d.year}</text>
                                </g>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  )
                )}

                {/* 4. CHART BODY: INPRES JALAN DAERAH (INPRES 3/2023 & INPRES 11/2025) */}
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
                          const y = 18 + ((16 - val) / 16) * 94;
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
                            120,${18 + ((16 - inpresStats[0].budgetTrillion) / 16) * 94}
                            340,${18 + ((16 - inpresStats[1].budgetTrillion) / 16) * 94}
                            340,112 120,112
                          `}
                          fill="url(#inpresLineGrad)"
                        />
                        <path
                          d={`M 120 ${18 + ((16 - inpresStats[0].budgetTrillion) / 16) * 94} L 340 ${18 + ((16 - inpresStats[1].budgetTrillion) / 16) * 94}`}
                          fill="none"
                          stroke="#c2410c"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        {inpresStats.map((d, i) => {
                          const x = 120 + i * 220;
                          const y = 18 + ((16 - d.budgetTrillion) / 16) * 94;
                          const isSelected = d.year === selectedYear;

                          return (
                            <g key={d.stage} className="cursor-pointer" onClick={() => setSelectedYear(d.year)}>
                              <circle cx={x} cy={y} r={isSelected ? 6 : 4.5} fill="#c2410c" stroke="#fff" strokeWidth="2" />
                              <text x={x} y={y - 8} textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#c2410c">
                                Rp {d.budgetTrillion.toFixed(2).replace(".", ",")} Triliun
                              </text>
                              <text x={x} y={y + 16} textAnchor="middle" fontSize="8.5" fill="#64748b">
                                ({d.realizedKm.toLocaleString("id-ID")} km)
                              </text>
                              <text x={x} y="130" textAnchor="middle" fontSize="10" fontWeight={isSelected ? "bold" : "600"} fill={isSelected ? "#c2410c" : "#475569"}>
                                {d.stage}
                              </text>
                              <text x={x} y="146" textAnchor="middle" fontSize="8" fill="#94a3b8">
                                {d.targetProvinces} Provinsi Penerima
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
                          const y = 18 + ((16 - val) / 16) * 94;
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
                                Rp {d.budgetTrillion.toFixed(2).replace(".", ",")} T
                              </text>
                              <text x={xCenter} y="128" textAnchor="middle" fontSize="10" fontWeight={isSelected ? "bold" : "600"} fill={isSelected ? "#c2410c" : "#475569"}>
                                {d.stage}
                              </text>
                              <text x={xCenter} y="143" textAnchor="middle" fontSize="8" fill="#64748b">
                                {d.realizedKm.toLocaleString("id-ID")} km • {d.targetProvinces} Prov
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  )
                )}

                {/* Unified Executive Metric Footnote Strip (Compact, Clean, Data Preserved) */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 font-sans">
                  {selectedIndex === "kemantapan" && (
                    <div className="bg-white rounded-[6px] px-3.5 py-2.5 shadow-2xs">
                      <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium">
                            Nasional
                          </span>
                          <strong className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                            {currentRoadTrend.nasional}%
                          </strong>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium">
                            Provinsi
                          </span>
                          <strong className="text-xs sm:text-sm font-bold text-purple-900 tabular-nums">
                            {currentRoadTrend.provinsi}%
                          </strong>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-orange-700 font-medium">
                            Kab/Kota
                          </span>
                          <strong className="text-xs sm:text-sm font-bold text-orange-900 tabular-nums">
                            {currentRoadTrend.kabupatenKota}%
                          </strong>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 border border-slate-200/60 rounded-[4px] px-2.5 py-1.5 flex items-start gap-1.5 font-sans leading-relaxed">
                        <Info className="w-3.5 h-3.5 text-[#c2410c] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate">
                              <strong className="text-slate-800">Sumber:</strong> BPS (Statistik Indonesia 2026, data 2025) &amp; Baseline Renstra PU 2025–2029
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleSourceExpanded("kemantapan")}
                              className="inline-flex items-center gap-0.5 text-[#c2410c] font-semibold hover:underline cursor-pointer text-[10px] shrink-0 ml-1"
                            >
                              <span>{expandedSources["kemantapan"] ? "Tutup" : "Selengkapnya"}</span>
                              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expandedSources["kemantapan"] ? "rotate-180" : ""}`} />
                            </button>
                          </div>
                          {expandedSources["kemantapan"] && (
                            <div className="mt-1.5 pt-1.5 border-t border-slate-200/70 text-slate-600">
                              <strong className="text-slate-700">Metodologi &amp; Rujukan:</strong> Tingkat kemantapan mengacu pada persentase panjang jalan berstatus Mantap (Kondisi Baik + Sedang) terhadap total panjang jalan per jenjang kewenangan, merujuk BPS (Statistik Indonesia 2026, data 2025 non-tol) dan Baseline Rancangan Akhir Renstra Kementerian PU 2025–2029 (Nasional: 94,18%, Provinsi: 71,33%, Kab/Kota: 57,91%).
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedIndex === "ombudsman" && (
                    <div className="bg-white rounded-[6px] px-3.5 py-2.5 shadow-2xs">
                      <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium">Terlapor #1 (Pemda)</span>
                          <strong className="text-xs sm:text-sm font-bold text-[#c2410c] tabular-nums">4.766</strong>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium">Penerimaan 2025</span>
                          <strong className="text-xs sm:text-sm font-bold text-slate-800 tabular-nums">23.596</strong>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium">Subkategori Jalan</span>
                          <strong className="text-xs sm:text-sm font-bold text-slate-800 tabular-nums">287 / 622</strong>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 border border-slate-200/60 rounded-[4px] px-2.5 py-1.5 flex items-start gap-1.5 font-sans leading-relaxed">
                        <Info className="w-3.5 h-3.5 text-[#c2410c] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate">
                              <strong className="text-slate-800">Sumber:</strong> Laporan Kinerja &amp; Siaran Pers Ombudsman RI 2025/2026
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleSourceExpanded("ombudsman")}
                              className="inline-flex items-center gap-0.5 text-[#c2410c] font-semibold hover:underline cursor-pointer text-[10px] shrink-0 ml-1"
                            >
                              <span>{expandedSources["ombudsman"] ? "Tutup" : "Selengkapnya"}</span>
                              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expandedSources["ombudsman"] ? "rotate-180" : ""}`} />
                            </button>
                          </div>
                          {expandedSources["ombudsman"] && (
                            <div className="mt-1.5 pt-1.5 border-t border-slate-200/70 text-slate-600">
                              <strong className="text-slate-700">Rincian Resmi 2025:</strong> Ombudsman RI mencatat 23.596 penerimaan masyarakat; 4.766 laporan ke Pemda merupakan total lintas seluruh sektor pelayanan publik (bukan hanya jalan), sementara substansi perhubungan &amp; infrastruktur tercatat 622 laporan (287 di antaranya subkategori infrastruktur jalan). Dugaan maladministrasi tertinggi: tidak memberikan pelayanan (40,68%) dan penundaan berlarut (21,25%).
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedIndex === "pagu" && (
                    <div className="bg-white rounded-[6px] px-3.5 py-2.5 shadow-2xs">
                      <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium">
                            Pagu Awal {currentBinaMarga.year}
                          </span>
                          <strong className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                            Rp {currentBinaMarga.paguAwal.toFixed(2).replace(".", ",")} T
                          </strong>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium">
                            DIPA Akhir/Efektif
                          </span>
                          <strong className="text-xs sm:text-sm font-bold text-[#c2410c] tabular-nums">
                            Rp {currentBinaMarga.paguRevisi.toFixed(2).replace(".", ",")} T
                          </strong>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium">
                            Efektif TA 2025
                          </span>
                          <strong className="text-xs sm:text-sm font-bold text-blue-700 tabular-nums">
                            Rp 28,78 T
                          </strong>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 border border-slate-200/60 rounded-[4px] px-2.5 py-1.5 flex items-start gap-1.5 font-sans leading-relaxed">
                        <Info className="w-3.5 h-3.5 text-[#c2410c] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate">
                              <strong className="text-slate-800">Sumber:</strong> RDP Komisi V DPR RI &amp; LAKIP Ditjen Bina Marga (2020–2025)
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleSourceExpanded("pagu")}
                              className="inline-flex items-center gap-0.5 text-[#c2410c] font-semibold hover:underline cursor-pointer text-[10px] shrink-0 ml-1"
                            >
                              <span>{expandedSources["pagu"] ? "Tutup" : "Selengkapnya"}</span>
                              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expandedSources["pagu"] ? "rotate-180" : ""}`} />
                            </button>
                          </div>
                          {expandedSources["pagu"] && (
                            <div className="mt-1.5 pt-1.5 border-t border-slate-200/70 text-slate-600">
                              <strong className="text-slate-700">Catatan TA {currentBinaMarga.year}:</strong> {currentBinaMarga.note}. Selaras penuh dengan grafik APBN pada menu Anggaran Proyek.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedIndex === "inpres" && (
                    <div className="bg-white rounded-[6px] px-3.5 py-2.5 shadow-2xs">
                      <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium">Inpres 3/2023</span>
                          <strong className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">Rp 14,60 T</strong>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-medium">Inpres 11/2025</span>
                          <strong className="text-xs sm:text-sm font-bold text-[#c2410c] tabular-nums">Rp 10,21 T</strong>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-emerald-700 font-medium">Total IJD</span>
                          <strong className="text-xs sm:text-sm font-bold text-emerald-800 tabular-nums">Rp 24,81 T</strong>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 border border-slate-200/60 rounded-[4px] px-2.5 py-1.5 flex items-start gap-1.5 font-sans leading-relaxed">
                        <Info className="w-3.5 h-3.5 text-[#c2410c] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate">
                              <strong className="text-slate-800">Dasar Regulasi:</strong> Inpres No. 3/2023 &amp; Inpres No. 11/2025 (IJD)
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleSourceExpanded("inpres")}
                              className="inline-flex items-center gap-0.5 text-[#c2410c] font-semibold hover:underline cursor-pointer text-[10px] shrink-0 ml-1"
                            >
                              <span>{expandedSources["inpres"] ? "Tutup" : "Selengkapnya"}</span>
                              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expandedSources["inpres"] ? "rotate-180" : ""}`} />
                            </button>
                          </div>
                          {expandedSources["inpres"] && (
                            <div className="mt-1.5 pt-1.5 border-t border-slate-200/70 text-slate-600">
                              <strong className="text-slate-700">Alokasi Resmi:</strong> Tahap I berdasarkan Inpres No. 3/2023 terealisasi Rp 14,60 T (3.194 km jalan &amp; 2.971 m jembatan di 34 provinsi), dilanjutkan Inpres No. 11/2025 sebesar Rp 10,21 T untuk TA 2025 (tahap awal 1.151 km di 37 provinsi diresmikan Juni 2026).
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: SIAPA PENANGGUNG JAWAB JALAN? (100% OFFICIAL BPS & RENSTRA PU) */}
          <div className="lg:col-span-5 bg-slate-100/60 p-2 sm:p-2.5 rounded-[8px] ring-1 ring-orange-200/50">
            <div className="bg-white rounded-[6px] p-4 sm:p-5 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] flex flex-col justify-between space-y-3 h-full">
            
            {/* Header: Title & Map Link */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight block">
                  Siapa Penanggung Jawab Jalan?
                </h2>
                <span className="text-[10.5px] text-slate-500 font-sans">
                  Pembagian resmi UU No. 2/2022 · BPS (Statistik Indonesia 2026, data 2025)
                </span>
              </div>
              <button
                type="button"
                onClick={() => (onExploreMap ? onExploreMap() : onExploreData && onExploreData())}
                className="text-[#c2410c] hover:text-[#9a3412] text-xs font-bold flex items-center gap-0.5 transition-colors cursor-pointer font-sans shrink-0"
              >
                <span>Cek di Peta</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3 Official Macro KPI Tiles (Zero Simulated Numbers) */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-slate-50/90 rounded-[6px] p-2.5 text-center">
                <span className="text-[10px] text-slate-500 font-semibold font-sans block">
                  Total Jalan
                </span>
                <strong className="text-base sm:text-lg font-bold text-slate-900 tabular-nums font-sans block mt-0.5">
                  538.102 km
                </strong>
                <span className="text-[9.5px] text-slate-500 font-sans block">Non-Tol · Data 2025 (BPS)</span>
              </div>
              <div className="bg-slate-50/90 rounded-[6px] p-2.5 text-center">
                <span className="text-[10px] text-slate-500 font-semibold font-sans block">
                  Jalan Daerah
                </span>
                <strong className="text-base sm:text-lg font-bold text-slate-900 tabular-nums font-sans block mt-0.5">
                  91,15%
                </strong>
                <span className="text-[9.5px] text-slate-500 font-sans block">Provinsi &amp; Kab/Kota</span>
              </div>
              <div className="bg-orange-50/80 rounded-[6px] p-2.5 text-center">
                <span className="text-[10px] text-[#9a3412] font-semibold font-sans block">
                  Selisih Kualitas
                </span>
                <strong className="text-base sm:text-lg font-bold text-[#c2410c] tabular-nums font-sans block mt-0.5">
                  36,27%
                </strong>
                <span className="text-[9.5px] text-[#9a3412]/80 font-sans block">Pusat vs Kab/Kota</span>
              </div>
            </div>

            {/* Clean Structured Table: 3 Official Road Authority Levels */}
            <div className="overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="border-y border-slate-100 bg-slate-50/60 text-[9.5px] text-slate-500 font-sans font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-2.5">Penanggung Jawab</th>
                    <th className="py-2 px-2 text-right">Panjang</th>
                    <th className="py-2 px-2 text-right">Porsi</th>
                    <th className="py-2 px-2.5 text-right">Kondisi Layak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-xs">
                  {nationalAuthorityBreakdown.map((item) => (
                    <tr key={item.key} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-2.5">
                        <div className="font-bold text-slate-900 text-xs">{item.owner}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{item.sub}</div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold tabular-nums text-slate-800">
                        {item.km}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums text-slate-600 font-medium">
                        {item.share}
                      </td>
                      <td className="py-2.5 px-2.5 text-right">
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-[5px] tabular-nums ${item.badgeClass}`}>
                          {item.goodPct}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50/70 font-bold border-t border-slate-200/70 text-xs">
                  <tr>
                    <td className="py-2 px-2.5 text-slate-900">Total Nasional (Non-Tol)</td>
                    <td className="py-2 px-2 text-right tabular-nums text-slate-900">538.102 km</td>
                    <td className="py-2 px-2 text-right tabular-nums text-slate-700">100%</td>
                    <td className="py-2 px-2.5 text-right">
                      <span className="text-[9.5px] font-bold text-slate-600 tabular-nums">Batas Tanggap ≤ 14 Hari</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Citizen-Friendly Action Strip */}
            <div className="pt-2 text-[11px] text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 border-t border-slate-100 font-sans">
              <div>
                <span>Menemukan jalan rusak? Cek dinas penanggung jawabnya atau laporkan langsung.</span>
              </div>
              <button
                type="button"
                onClick={() => (onOpenReport ? onOpenReport() : onExploreMap && onExploreMap())}
                className="font-bold text-[#c2410c] hover:underline shrink-0 cursor-pointer text-[11px] flex items-center gap-0.5"
              >
                <span>Laporkan Jalan</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            </div>
          </div>
        </div>

        {/* 4. ACTIVE DATA MONITORING TABLE: RUAS & ANGGARAN APBD / LPSE (DOUBLE-BEZEL AGENCY TIER) */}
        <div id="daftar-ruas-tabel" className="bg-slate-100/60 p-2 sm:p-2.5 rounded-[8px] ring-1 ring-orange-200/50 scroll-mt-20">
          <div className="bg-white rounded-[6px] p-5 sm:p-7 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] space-y-5">
            
            {/* Table Header: Eyebrow + Title + Button-in-Button CTA */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1.5 max-w-2xl">
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] font-semibold text-[#c2410c]">
                  Daftar Ruas Jalan &amp; LPSE
                </p>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-950 tracking-tight">
                  Daftar Ruas Jalan, Wewenang Dinas &amp; Kontrak LPSE
                </h2>
              </div>

              {/* Island Button-in-Button CTA */}
              <div className="shrink-0 self-start sm:self-auto">
                <button
                  onClick={onExploreData}
                  className="group inline-flex items-center gap-2.5 pl-4 pr-1.5 py-1.5 rounded-[6px] bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer font-sans"
                >
                  <span>Penelusuran Anggaran Proyek</span>
                  <span className="w-6 h-6 rounded-[4px] bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ChevronRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </button>
              </div>
            </div>

            {/* Table Controls: 5pt Filter Bar + Refined Search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Filter Bar */}
              <div className="flex items-center gap-1 flex-wrap bg-slate-100/80 p-1 rounded-[6px] text-xs font-sans ring-1 ring-orange-200/40">
                {[
                  { id: "ALL", label: "Semua Ruas" },
                  { id: "NASIONAL", label: "Jalan Nasional" },
                  { id: "PROVINSI", label: "Jalan Provinsi" },
                  { id: "KOTA", label: "Jalan Kota" },
                  { id: "KABUPATEN", label: "Jalan Kabupaten" },
                  { id: "SUMUT", label: "Pilot Sumut" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTableFilterChange(tab.id)}
                    className={`px-3 py-1.5 rounded-[5px] transition-all cursor-pointer whitespace-nowrap text-xs ${
                      tableFilter === tab.id
                        ? "bg-[#c2410c] text-white font-bold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 font-medium hover:bg-white/60"
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Refined Search */}
              <div className="relative w-full lg:w-72 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icon/search_icon.png"
                  alt=""
                  width={14}
                  height={14}
                  style={{ width: "14px", height: "14px" }}
                  className="w-3.5 h-3.5 object-contain absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={handleTableSearchChange}
                  placeholder="Cari ruas, kota, rekanan..."
                  className="w-full pl-9 pr-7 py-2 text-xs rounded-[6px] bg-slate-50/90 focus:bg-white ring-1 ring-orange-200/50 focus:ring-2 focus:ring-orange-500/20 placeholder-slate-500 text-slate-900 focus:outline-none font-sans transition-all"
                />
                {tableSearch && (
                  <button
                    onClick={() => { setTableSearch(""); setTablePage(1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* High-Legibility Table */}
            <div className="w-full">
              <table className="w-full text-left text-xs border-collapse md:table-fixed">
                <thead>
                  <tr className="border-b border-slate-200/70 text-[10px] text-slate-400 font-sans font-bold uppercase tracking-[0.14em]">
                    <th className="py-3 px-3 md:w-[28%]">Ruas Jalan &amp; Wilayah</th>
                    <th className="py-3 px-2.5 md:w-[15%]">Kewenangan</th>
                    <th className="py-3 px-2.5 md:w-[17%] text-right">Pagu &amp; Kontrak</th>
                    <th className="py-3 px-2.5 md:w-[20%] hidden sm:table-cell">Pelaksana LPSE</th>
                    <th className="py-3 px-2.5 md:w-[12%] text-center">Status Respons</th>
                    <th className="py-3 px-3 md:w-[8%] text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {paginatedRoads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                        <p className="font-semibold text-slate-700 text-sm">Tidak ada ruas jalan yang cocok</p>
                        <p className="text-xs text-slate-500 mt-1">Coba gunakan kata kunci pencarian atau ubah filter kategori di atas.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedRoads.map((road) => {
                      const rep = reports.find((r) => r.roadSegmentId === road.id);
                      const isOverdue = rep?.status === "OVERDUE";

                      return (
                        <tr key={road.id} className="hover:bg-slate-50/70 transition-colors group">
                          {/* 1. Ruas Jalan & Wilayah */}
                          <td className="py-4 px-3 align-middle">
                            <button
                              onClick={() => setSelectedRoadForDetail(road)}
                              className="font-bold text-slate-900 group-hover:text-[#c2410c] text-[13px] text-left transition-colors cursor-pointer block leading-snug line-clamp-1"
                              title={road.name}
                            >
                              {road.name}
                            </button>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 font-sans">
                              <span className="text-slate-600 font-medium">{road.district}</span>
                              <span className="text-slate-300">/</span>
                              <span className="font-mono text-slate-500 tabular-nums">{road.lengthKm} km</span>
                            </div>
                          </td>

                          {/* 2. Status Wewenang (Editorial Clean Indicator - No Colored Dot) */}
                          <td className="py-4 px-2.5 align-middle">
                            <span className="font-semibold text-slate-800 text-[11.5px] truncate block">
                              {road.authority === "NASIONAL"
                                ? "Jalan Nasional"
                                : road.authority === "PROVINSI"
                                ? "Jalan Provinsi"
                                : road.authority === "KOTA"
                                ? "Jalan Kota"
                                : "Jalan Kabupaten"}
                            </span>
                          </td>

                          {/* 3. Pagu vs Kontrak */}
                          <td className="py-4 px-2.5 text-right align-middle">
                            <div className="font-bold tabular-nums text-slate-900 text-[13px]">
                              Rp {(road.budget?.paguRp / 1000000000).toFixed(2)} M
                            </div>
                            <div className="text-[10.5px] font-mono text-slate-500 tabular-nums mt-0.5">
                              Kontrak: Rp {(road.budget?.contractValueRp / 1000000000).toFixed(2)} M
                            </div>
                          </td>

                          {/* 4. Kontraktor & Status Verifikasi */}
                          <td className="py-4 px-2.5 align-middle hidden sm:table-cell">
                            <div className="font-medium text-slate-800 text-[12px] truncate" title={road.budget?.contractor}>
                              {road.budget?.contractor || "Dalam Pengadaan"}
                            </div>
                            <div className="text-[10.5px] mt-0.5 flex items-center gap-1 font-sans">
                              {road.budget?.matchConfidence === "TERKONFIRMASI" ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>Terkurasi (Pilot)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>Data Parsial</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 5. Status Respons Pemantauan Tenggat */}
                          <td className="py-4 px-2.5 text-center align-middle">
                            {isOverdue ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-[5px] bg-rose-50 text-rose-700 text-[10.5px] font-semibold ring-1 ring-rose-200/50">
                                <span>Lewat Tenggat</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-[5px] bg-emerald-50/70 text-emerald-700 text-[10.5px] font-semibold ring-1 ring-emerald-200/50">
                                <span>Terkendali</span>
                              </span>
                            )}
                          </td>

                          {/* 6. Aksi: Buka Detail Ruas */}
                          <td className="py-4 px-3 text-right align-middle">
                            <button
                              onClick={() => setSelectedRoadForDetail(road)}
                              className="px-3 py-1 rounded-[6px] bg-slate-100 hover:bg-[#c2410c] text-slate-700 hover:text-white font-semibold text-xs transition-all duration-150 cursor-pointer inline-flex items-center gap-1 group/btn active:scale-[0.96]"
                            >
                              <span>Detail</span>
                              <ChevronRight className="w-3 h-3 text-slate-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-transform" />
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 text-xs text-slate-500 font-sans border-t border-slate-100">
              {/* Counter */}
              <div className="text-slate-500">
                Menampilkan{" "}
                <span className="text-slate-900 font-semibold tabular-nums">
                  {processedTableRoads.length === 0 ? 0 : (tablePage - 1) * (tablePageSize === "ALL" ? processedTableRoads.length : tablePageSize) + 1}
                </span>
                {" – "}
                <span className="text-slate-900 font-semibold tabular-nums">
                  {tablePageSize === "ALL" ? processedTableRoads.length : Math.min(tablePage * tablePageSize, processedTableRoads.length)}
                </span>
                {" dari "}
                <span className="text-slate-900 font-semibold tabular-nums">
                  {processedTableRoads.length}
                </span>{" "}
                ruas
              </div>

              {/* Pagination Buttons & Page Size Selector */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                {/* Page size toggle */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Per hal:</span>
                  {[6, 12, "ALL"].map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setTablePageSize(size);
                        setTablePage(1);
                      }}
                      className={`px-2 py-0.5 rounded-[4px] cursor-pointer font-bold transition-colors ${
                        tablePageSize === size
                          ? "bg-[#c2410c] text-white shadow-2xs"
                          : "bg-slate-100 hover:bg-slate-200/70 text-slate-600"
                      }`}
                    >
                      {size === "ALL" ? "Semua" : size}
                    </button>
                  ))}
                </div>

                {tablePageSize !== "ALL" && totalTablePages > 1 && (
                  <div className="w-px h-3.5 bg-slate-200 hidden sm:block" />
                )}

                {/* Prev & Next */}
                {tablePageSize !== "ALL" && totalTablePages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                      disabled={tablePage === 1}
                      className="h-7 px-2.5 rounded-[5px] bg-slate-100 hover:bg-slate-200/70 disabled:opacity-30 disabled:pointer-events-none text-slate-700 font-semibold text-xs cursor-pointer transition-colors inline-flex items-center gap-1"
                      title="Halaman Sebelumnya"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sebelumnya</span>
                    </button>

                    {/* Page numbers with ellipsis */}
                    {getPaginationItems(tablePage, totalTablePages).map((item, idx) =>
                      item === "..." ? (
                        <span key={`dots-${idx}`} className="w-6 text-center text-slate-500 font-bold select-none text-xs">
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setTablePage(item)}
                          className={`w-7 h-7 rounded-[5px] text-xs font-bold cursor-pointer transition-colors tabular-nums ${
                            tablePage === item
                              ? "bg-[#c2410c] text-white shadow-2xs"
                              : "bg-slate-100 hover:bg-slate-200/70 text-slate-700"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => setTablePage((p) => Math.min(totalTablePages, p + 1))}
                      disabled={tablePage === totalTablePages}
                      className="h-7 px-2.5 rounded-[5px] bg-slate-100 hover:bg-slate-200/70 disabled:opacity-30 disabled:pointer-events-none text-slate-700 font-semibold text-xs cursor-pointer transition-colors inline-flex items-center gap-1"
                      title="Halaman Berikutnya"
                    >
                      <span className="hidden sm:inline">Berikutnya</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
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
