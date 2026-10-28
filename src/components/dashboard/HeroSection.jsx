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

  // Pilot budget statistics by authority
  const pilotBudgetStats = useMemo(() => [
    { key: "depok", label: "Dinas Depok", fullName: "Dinas PUPR Kota Depok", pagu: 11.65, kontrak: 10.87, ruas: 3, efficiency: 6.7 },
    { key: "jabar", label: "DBMPR Jabar", fullName: "DBMPR Prov. Jawa Barat", pagu: 15.70, kontrak: 14.80, ruas: 2, efficiency: 5.7 },
    { key: "pupr", label: "KemenPUPR", fullName: "Kementerian PUPR (BBPJN)", pagu: 8.45, kontrak: 7.92, ruas: 1, efficiency: 6.3 },
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
    } else if (tableFilter === "SUMUT") {
      list = list.filter(
        (r) =>
          r.district?.toLowerCase().includes("medan") ||
          r.district?.toLowerCase().includes("simalungun") ||
          r.district?.toLowerCase().includes("karo") ||
          r.district?.toLowerCase().includes("asahan") ||
          (r.island === "Sumatera" && r.code?.includes("SMT"))
      );
    } else if (tableFilter === "PROVINSI") {
      list = list.filter((r) => r.authority === "PROVINSI");
    } else if (tableFilter === "DAERAH") {
      list = list.filter((r) => r.authority === "PROVINSI" || r.authority === "KOTA_KAB");
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

        {/* 1. TOP UTILITY BAR: IDX-STYLE SEGMENTED TAB BAR WITH VERTICAL DIVIDERS */}
        <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs flex flex-col md:flex-row md:items-stretch overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200/90 text-xs">
          
          {/* Segment 1: Wilayah Scope */}
          <div className="px-3.5 py-2 flex items-center gap-2 font-sans text-slate-700 bg-slate-50/70 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#c2410c]" />
            <span className="text-[11px] font-semibold">
              Cakupan: <strong>Seluruh Indonesia (38 Provinsi)</strong>
            </span>
          </div>

          {/* Segment 2: Dataset Tabs (IDX Tab Style with Vertical Dividers) */}
          <div className="flex items-stretch divide-x divide-slate-200 shrink-0 overflow-x-auto">
            {/* Tab 1: BPS 2024 */}
            <button
              type="button"
              onClick={() => setSelectedIndex("kemantapan")}
              className={`px-4 py-2 font-sans text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap select-none ${
                selectedIndex === "kemantapan"
                  ? "bg-[#c2410c] text-white"
                  : "bg-white text-slate-700 hover:bg-orange-50/60 hover:text-[#c2410c]"
              }`}
              title="Tampilkan dataset Kemantapan Jalan BPS (Sirusa)"
            >
              <Database className="w-3.5 h-3.5 opacity-80" />
              <span>BPS 2024 (Sirusa)</span>
            </button>

            {/* Tab 2: LPSE Pengadaan TA 2026 */}
            <button
              type="button"
              onClick={() => setSelectedIndex("pagu")}
              className={`px-4 py-2 font-sans text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap select-none ${
                selectedIndex === "pagu"
                  ? "bg-[#c2410c] text-white"
                  : "bg-white text-slate-700 hover:bg-orange-50/60 hover:text-[#c2410c]"
              }`}
              title="Tampilkan dataset Pengadaan Tender LPSE TA 2026"
            >
              <FileText className="w-3.5 h-3.5 opacity-80" />
              <span>LPSE Pengadaan TA 2026</span>
            </button>

            {/* Segment: Update Date */}
            <div className="hidden xl:flex items-center px-3 py-2 text-[11px] font-sans text-slate-400 bg-slate-50/40 whitespace-nowrap select-none">
              <span>Pembaruan: 18 Okt 2026</span>
            </div>
          </div>

          {/* Segment 3: Integrated Unified Search Input */}
          <div className="relative flex-1 min-w-[240px] flex items-center bg-white group">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#c2410c] absolute left-3 pointer-events-none transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama ruas, kode laporan, paket pengadaan, atau kontraktor..."
              className="w-full h-full pl-9 pr-8 py-2 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none focus:bg-orange-50/15 transition-all font-sans"
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
            <span className="text-white font-bold uppercase tracking-wider text-[11px] font-sans">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#c2410c] bg-orange-50 hover:bg-orange-100/90 border border-orange-200/90 transition-all cursor-pointer font-sans shadow-2xs group"
                title="Buka data komparasi kemantapan jalan 38 provinsi di menu Statistik"
              >
                <span>Lihat Statistik 38 Provinsi</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#c2410c] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Split: Index List (Left) + Interactive Visual Chart (Right) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
              
              {/* Index Column (5 cols, accurate labels & clear sources) */}
              <div className="sm:col-span-5 space-y-1.5">
                {/* Index 1: Kemantapan Jalan (BPS 2024) */}
                <button
                  onClick={() => setSelectedIndex("kemantapan")}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    selectedIndex === "kemantapan"
                      ? "bg-[#c2410c] text-white border-transparent shadow-xs"
                      : "bg-slate-50/70 text-slate-800 border-slate-200/60 hover:bg-orange-50/40 hover:border-orange-200/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase font-sans">
                      JALAN KAB/KOTA (BPS)
                    </span>
                    <span className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded-full tabular-nums ${
                      selectedIndex === "kemantapan" ? "bg-white/20 text-white" : "bg-slate-200/60 text-slate-600"
                    }`}>
                      2024
                    </span>
                  </div>
                  <div className="text-2xl sm:text-[28px] font-bold font-sans tabular-nums mt-0.5 leading-tight tracking-tight">
                    57,1% <span className="text-xs font-semibold uppercase tracking-wider font-sans">MANTAP</span>
                  </div>
                  <div className={`text-[10px] truncate ${selectedIndex === "kemantapan" ? "text-orange-100/90" : "text-slate-500"} font-sans`}>
                    42,9% panjang jalan belum mantap
                  </div>
                </button>

                {/* Index 2: Konteks Ombudsman 2024 */}
                <button
                  onClick={() => setSelectedIndex("ombudsman")}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    selectedIndex === "ombudsman"
                      ? "bg-[#c2410c] text-white border-transparent shadow-xs"
                      : "bg-slate-50/70 text-slate-800 border-slate-200/60 hover:bg-orange-50/40 hover:border-orange-200/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase font-sans">
                      UNDUE DELAY (OMBUDSMAN)
                    </span>
                    <span className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded-full tabular-nums ${
                      selectedIndex === "ombudsman" ? "bg-white/20 text-white" : "bg-slate-200/60 text-slate-600"
                    }`}>
                      2024
                    </span>
                  </div>
                  <div className="text-2xl sm:text-[28px] font-bold font-sans tabular-nums mt-0.5 leading-tight tracking-tight">
                    33,86% <span className="text-xs font-semibold uppercase tracking-wider font-sans">LAPORAN</span>
                  </div>
                  <div className={`text-[10px] truncate ${selectedIndex === "ombudsman" ? "text-orange-100/90" : "text-slate-500"} font-sans`}>
                    Penundaan berlarut pada laporan selesai
                  </div>
                </button>

                {/* Index 3: Pagu Paket Pilot LPSE */}
                <button
                  onClick={() => setSelectedIndex("pagu")}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    selectedIndex === "pagu"
                      ? "bg-[#c2410c] text-white border-transparent shadow-xs"
                      : "bg-slate-50/70 text-slate-800 border-slate-200/60 hover:bg-orange-50/40 hover:border-orange-200/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase font-sans">
                      PAGU PENGADAAN PILOT
                    </span>
                    <span className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded-full tabular-nums ${
                      selectedIndex === "pagu" ? "bg-white/20 text-white" : "bg-slate-200/60 text-slate-600"
                    }`}>
                      6 Paket
                    </span>
                  </div>
                  <div className="text-2xl sm:text-[28px] font-bold font-sans tabular-nums mt-0.5 leading-tight tracking-tight">
                    Rp 35,80 <span className="text-xs font-semibold uppercase tracking-wider font-sans">MIL</span>
                  </div>
                  <div className={`text-[10px] truncate ${selectedIndex === "pagu" ? "text-orange-100/90" : "text-slate-500"} font-sans`}>
                    Total nilai pagu lelang terverifikasi
                  </div>
                </button>

                {/* Index 4: Alokasi Inpres Nasional 2023 */}
                <button
                  onClick={() => setSelectedIndex("inpres")}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    selectedIndex === "inpres"
                      ? "bg-[#c2410c] text-white border-transparent shadow-xs"
                      : "bg-slate-50/70 text-slate-800 border-slate-200/60 hover:bg-orange-50/40 hover:border-orange-200/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase font-sans">
                      INPRES JALAN DAERAH
                    </span>
                    <span className={`text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-[3px] tabular-nums ${
                      selectedIndex === "inpres" ? "bg-white/20 text-white" : "bg-slate-200/60 text-slate-600"
                    }`}>
                      TA 2023
                    </span>
                  </div>
                  <div className="text-2xl sm:text-[28px] font-bold font-sans tabular-nums mt-0.5 leading-tight tracking-tight">
                    Rp 14,60 <span className="text-xs font-semibold uppercase tracking-wider font-sans">TRIL</span>
                  </div>
                  <div className={`text-[10px] truncate ${selectedIndex === "inpres" ? "text-orange-100/90" : "text-slate-500"} font-sans`}>
                    Alokasi Tahap I Inpres No. 3/2023 (PUPR)
                  </div>
                </button>
              </div>

              {/* Chart Column: Dynamic Visual Monitor based on selectedIndex */}
              <div className="sm:col-span-7 bg-slate-50/80 rounded-[5px] border border-slate-200/60 p-3 flex flex-col justify-between">
                
                {/* Chart Header: Title on Top Full-Width, Year & Switcher Controls Below */}
                <div className="space-y-2 border-b border-slate-200/60 pb-2.5">
                  {/* Top: Full-Width Title & Source */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-sans tracking-wide block">
                      {selectedIndex === "kemantapan" && "Sumber: BPS Sirusa (2020–2024)"}
                      {selectedIndex === "ombudsman" && "Sumber: Laporan Tahunan Ombudsman RI (2020–2024)"}
                      {selectedIndex === "pagu" && "Sumber: SiRUP & LPSE Pengadaan TA 2026"}
                      {selectedIndex === "inpres" && "Sumber: Ditjen Bina Marga KemenPUPR (Inpres No. 3/2023)"}
                    </span>
                    <strong className="text-xs sm:text-sm font-bold font-heading text-slate-900 tracking-tight block">
                      {selectedIndex === "kemantapan" && `Tingkat Kemantapan Jalan (${selectedYear})`}
                      {selectedIndex === "ombudsman" && `Tren Maladministrasi Penundaan Berlarut (${selectedYear})`}
                      {selectedIndex === "pagu" && "Komparasi Pagu vs Nilai Kontrak Lelang Pilot"}
                      {selectedIndex === "inpres" && "Alokasi & Realisasi Percepatan Inpres Jalan Daerah (IJD)"}
                    </strong>
                  </div>

                  {/* Below: Controls Row (View Switcher + Year Segmented Bar) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    {/* View Switcher: Line vs Bar */}
                    <div className="inline-flex items-center border border-slate-200 bg-white rounded-[4px] overflow-hidden divide-x divide-slate-200 text-[10px] font-bold shadow-2xs font-sans">
                      <button
                        onClick={() => setChartViewMode("line")}
                        className={`px-2 py-1 transition-colors cursor-pointer flex items-center gap-1 ${
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
                        className={`px-2 py-1 transition-colors cursor-pointer flex items-center gap-1 ${
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

                    {/* Contextual Year Tabs */}
                    {(selectedIndex === "kemantapan" || selectedIndex === "ombudsman") && (
                      <div className="inline-flex items-center border border-slate-200 bg-white rounded-[4px] overflow-hidden divide-x divide-slate-200 text-[10px] font-bold font-sans shadow-2xs tabular-nums">
                        {[2020, 2021, 2022, 2023, 2024].map((yr) => (
                          <button
                            key={yr}
                            onClick={() => setSelectedYear(yr)}
                            className={`px-2 py-1 transition-colors cursor-pointer ${
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
                      <div className="inline-flex items-center border border-slate-200 bg-white rounded-[4px] px-2.5 py-1 text-[10px] font-bold font-sans text-slate-700 shadow-2xs">
                        <span>3 Instansi Wewenang (6 Paket)</span>
                      </div>
                    )}

                    {selectedIndex === "inpres" && (
                      <div className="inline-flex items-center border border-slate-200 bg-white rounded-[4px] overflow-hidden divide-x divide-slate-200 text-[10px] font-bold font-sans shadow-2xs tabular-nums">
                        {[2023, 2024].map((yr) => (
                          <button
                            key={yr}
                            onClick={() => setSelectedYear(yr)}
                            className={`px-2 py-1 transition-colors cursor-pointer ${
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
                {/* 1. CHART BODY: KEMANTAPAN JALAN (BPS SIRUSA) */}
                {/* ======================================================== */}
                {selectedIndex === "kemantapan" && (
                  chartViewMode === "line" ? (
                    <div className="h-36 pt-2 px-1 flex flex-col justify-end">
                      <svg viewBox="0 0 380 115" className="w-full h-full select-none">
                        {[100, 80, 60, 40].map((val) => {
                          const y = 14 + ((100 - val) / 60) * 78;
                          return (
                            <g key={val}>
                              <line x1="28" y1={y} x2="365" y2={y} stroke="#e2e8f0" strokeDasharray="2 2" strokeWidth="0.8" />
                              <text x="24" y={y + 3} textAnchor="end" fontSize="8" fontFamily="sans-serif" fill="#94a3b8" fontWeight="bold">
                                {val}%
                              </text>
                            </g>
                          );
                        })}
                        <polygon
                          points={`
                            ${roadConditionTrends.map((d, i) => `${30 + i * 82.5},${14 + ((100 - d.nasional) / 60) * 78}`).join(" ")}
                            ${[...roadConditionTrends].reverse().map((d, i) => `${360 - i * 82.5},${14 + ((100 - d.kabupatenKota) / 60) * 78}`).join(" ")}
                          `}
                          fill="#c2410c"
                          fillOpacity="0.08"
                        />
                        <path
                          d={roadConditionTrends.map((d, i) => `${i === 0 ? "M" : "L"} ${30 + i * 82.5} ${14 + ((100 - d.nasional) / 60) * 78}`).join(" ")}
                          fill="none"
                          stroke="#475569"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d={roadConditionTrends.map((d, i) => `${i === 0 ? "M" : "L"} ${30 + i * 82.5} ${14 + ((100 - d.provinsi) / 60) * 78}`).join(" ")}
                          fill="none"
                          stroke="#d97706"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d={roadConditionTrends.map((d, i) => `${i === 0 ? "M" : "L"} ${30 + i * 82.5} ${14 + ((100 - d.kabupatenKota) / 60) * 78}`).join(" ")}
                          fill="none"
                          stroke="#c2410c"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                        />
                        {roadConditionTrends.map((d, i) => {
                          const x = 30 + i * 82.5;
                          const yNas = 14 + ((100 - d.nasional) / 60) * 78;
                          const yProv = 14 + ((100 - d.provinsi) / 60) * 78;
                          const yKab = 14 + ((100 - d.kabupatenKota) / 60) * 78;
                          const isSelected = d.year === selectedYear;

                          return (
                            <g key={d.year} className="cursor-pointer" onClick={() => setSelectedYear(d.year)}>
                              <rect x={x - 20} y="5" width="40" height="100" fill="transparent" />
                              {isSelected && (
                                <line x1={x} y1="14" x2={x} y2="92" stroke="#c2410c" strokeWidth="1" strokeDasharray="2 2" />
                              )}
                              <circle cx={x} cy={yNas} r={isSelected ? 4 : 2.5} fill="#475569" stroke="#fff" strokeWidth="1.5" />
                              <circle cx={x} cy={yProv} r={isSelected ? 4 : 2.5} fill="#d97706" stroke="#fff" strokeWidth="1.5" />
                              <circle cx={x} cy={yKab} r={isSelected ? 5.5 : 3.5} fill="#c2410c" stroke="#fff" strokeWidth="2" />
                              <text x={x} y={yKab - 7} textAnchor="middle" fontSize="8" fontFamily="sans-serif" fontWeight="bold" fill={isSelected ? "#9a3412" : "#c2410c"}>
                                {d.kabupatenKota}%
                              </text>
                              <text x={x} y="108" textAnchor="middle" fontSize="9" fontFamily="sans-serif" fontWeight={isSelected ? "bold" : "normal"} fill={isSelected ? "#c2410c" : "#64748b"}>
                                {d.year}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  ) : (
                    <div className="h-36 flex items-end justify-between gap-2 pt-4 px-1">
                      {roadConditionTrends.map((d) => {
                        const isSelected = d.year === selectedYear;
                        return (
                          <div
                            key={d.year}
                            onClick={() => setSelectedYear(d.year)}
                            className="flex-1 flex flex-col justify-end items-center gap-1 cursor-pointer group"
                          >
                            <span className={`text-[9px] font-sans font-bold tabular-nums leading-none ${isSelected ? "text-[#c2410c]" : "text-slate-400 group-hover:text-slate-700"}`}>
                              {d.kabupatenKota}%
                            </span>
                            <div className="w-full flex items-end justify-center gap-0.5 h-24 bg-slate-200/50 rounded-t-[3px] p-0.5">
                              <div style={{ height: `${d.nasional}%` }} className="w-1/3 bg-slate-600 rounded-t-xs" title={`Nasional ${d.year}: ${d.nasional}% Mantap`} />
                              <div style={{ height: `${d.provinsi}%` }} className="w-1/3 bg-amber-600 rounded-t-xs" title={`Provinsi ${d.year}: ${d.provinsi}% Mantap`} />
                              <div style={{ height: `${d.kabupatenKota}%` }} className={`w-1/3 rounded-t-xs transition-colors ${isSelected ? "bg-[#c2410c]" : "bg-rose-500"}`} title={`Kab/Kota ${d.year}: ${d.kabupatenKota}% Mantap`} />
                            </div>
                            <span className={`text-[10px] font-sans font-bold tabular-nums ${isSelected ? "text-[#c2410c]" : "text-slate-500"}`}>
                              {d.year}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}

                {/* ======================================================== */}
                {/* 2. CHART BODY: OMBUDSMAN UNDUE DELAY TREND (2020 - 2024) */}
                {/* ======================================================== */}
                {selectedIndex === "ombudsman" && (
                  chartViewMode === "line" ? (
                    <div className="h-36 pt-2 px-1 flex flex-col justify-end">
                      <svg viewBox="0 0 380 115" className="w-full h-full select-none">
                        {[35, 33, 31, 29].map((val) => {
                          const y = 14 + ((36 - val) / 8) * 78;
                          return (
                            <g key={val}>
                              <line x1="28" y1={y} x2="365" y2={y} stroke="#e2e8f0" strokeDasharray="2 2" strokeWidth="0.8" />
                              <text x="24" y={y + 3} textAnchor="end" fontSize="8" fontFamily="sans-serif" fill="#94a3b8" fontWeight="bold">
                                {val}%
                              </text>
                            </g>
                          );
                        })}
                        <polygon
                          points={`
                            ${complaintTrends.map((d, i) => `${30 + i * 82.5},${14 + ((36 - d.overduePct) / 8) * 78}`).join(" ")}
                            360,92 30,92
                          `}
                          fill="#c2410c"
                          fillOpacity="0.12"
                        />
                        <path
                          d={complaintTrends.map((d, i) => `${i === 0 ? "M" : "L"} ${30 + i * 82.5} ${14 + ((36 - d.overduePct) / 8) * 78}`).join(" ")}
                          fill="none"
                          stroke="#c2410c"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                        />
                        {complaintTrends.map((d, i) => {
                          const x = 30 + i * 82.5;
                          const y = 14 + ((36 - d.overduePct) / 8) * 78;
                          const isSelected = d.year === selectedYear;

                          return (
                            <g key={d.year} className="cursor-pointer" onClick={() => setSelectedYear(d.year)}>
                              <rect x={x - 20} y="5" width="40" height="100" fill="transparent" />
                              {isSelected && (
                                <line x1={x} y1="14" x2={x} y2="92" stroke="#c2410c" strokeWidth="1" strokeDasharray="2 2" />
                              )}
                              <circle cx={x} cy={y} r={isSelected ? 5.5 : 3.5} fill="#c2410c" stroke="#fff" strokeWidth="2" />
                              <text x={x} y={y - 7} textAnchor="middle" fontSize="8" fontFamily="sans-serif" fontWeight="bold" fill={isSelected ? "#9a3412" : "#c2410c"}>
                                {d.overduePct}%
                              </text>
                              <text x={x} y="108" textAnchor="middle" fontSize="9" fontFamily="sans-serif" fontWeight={isSelected ? "bold" : "normal"} fill={isSelected ? "#c2410c" : "#64748b"}>
                                {d.year}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  ) : (
                    <div className="h-36 flex items-end justify-between gap-2 pt-4 px-1">
                      {complaintTrends.map((d) => {
                        const isSelected = d.year === selectedYear;
                        return (
                          <div
                            key={d.year}
                            onClick={() => setSelectedYear(d.year)}
                            className="flex-1 flex flex-col justify-end items-center gap-1 cursor-pointer group"
                          >
                            <span className={`text-[9px] font-sans font-bold tabular-nums leading-none ${isSelected ? "text-[#c2410c]" : "text-slate-400 group-hover:text-slate-700"}`}>
                              {d.overduePct}%
                            </span>
                            <div className="w-full flex items-end justify-center gap-1 h-24 bg-slate-200/50 rounded-t-[3px] p-1">
                              <div
                                style={{ height: `${(d.overdue / d.totalComplaints) * 100 * 2.5}%` }}
                                className={`w-3/4 rounded-t-xs transition-colors ${isSelected ? "bg-[#c2410c]" : "bg-amber-600"}`}
                                title={`${d.year}: ${d.overdue} dari ${d.totalComplaints} laporan`}
                              />
                            </div>
                            <span className={`text-[10px] font-sans font-bold tabular-nums ${isSelected ? "text-[#c2410c]" : "text-slate-500"}`}>
                              {d.year}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}

                {/* ======================================================== */}
                {/* 3. CHART BODY: PAGU VS KONTRAK LEALANG PILOT (LPSE)      */}
                {/* ======================================================== */}
                {selectedIndex === "pagu" && (
                  chartViewMode === "line" ? (
                    <div className="h-36 pt-2 px-1 flex flex-col justify-end">
                      <svg viewBox="0 0 380 115" className="w-full h-full select-none">
                        {[20, 15, 10, 5].map((val) => {
                          const y = 14 + ((20 - val) / 18) * 78;
                          return (
                            <g key={val}>
                              <line x1="32" y1={y} x2="365" y2={y} stroke="#e2e8f0" strokeDasharray="2 2" strokeWidth="0.8" />
                              <text x="28" y={y + 3} textAnchor="end" fontSize="8" fontFamily="sans-serif" fill="#94a3b8" fontWeight="bold">
                                {val}M
                              </text>
                            </g>
                          );
                        })}
                        {/* Pagu Line */}
                        <path
                          d={pilotBudgetStats.map((d, i) => `${i === 0 ? "M" : "L"} ${65 + i * 125} ${14 + ((20 - d.pagu) / 18) * 78}`).join(" ")}
                          fill="none"
                          stroke="#334155"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {/* Kontrak Line */}
                        <path
                          d={pilotBudgetStats.map((d, i) => `${i === 0 ? "M" : "L"} ${65 + i * 125} ${14 + ((20 - d.kontrak) / 18) * 78}`).join(" ")}
                          fill="none"
                          stroke="#c2410c"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                        />
                        {pilotBudgetStats.map((d, i) => {
                          const x = 65 + i * 125;
                          const yPagu = 14 + ((20 - d.pagu) / 18) * 78;
                          const yKontrak = 14 + ((20 - d.kontrak) / 18) * 78;

                          return (
                            <g key={d.key}>
                              <rect x={x - 3.5} y={yPagu - 3.5} width="7" height="7" rx="1.5" fill="#334155" stroke="#fff" strokeWidth="1.5" />
                              <rect x={x - 4} y={yKontrak - 4} width="8" height="8" rx="1.5" fill="#c2410c" stroke="#fff" strokeWidth="2" />
                              <text x={x} y={yPagu - 6} textAnchor="middle" fontSize="8" fontFamily="sans-serif" fontWeight="bold" fill="#334155">
                                Rp {d.pagu}M
                              </text>
                              <text x={x} y={yKontrak + 12} textAnchor="middle" fontSize="8" fontFamily="sans-serif" fontWeight="bold" fill="#c2410c">
                                Rp {d.kontrak}M
                              </text>
                              <text x={x} y="108" textAnchor="middle" fontSize="9" fontFamily="sans-serif" fontWeight="bold" fill="#475569">
                                {d.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  ) : (
                    <div className="h-36 flex items-end justify-around gap-4 pt-3 px-2">
                      {pilotBudgetStats.map((d) => (
                        <div key={d.key} className="flex-1 flex flex-col justify-end items-center gap-1.5 max-w-[100px]">
                          <div className="flex items-center gap-1.5 text-[8.5px] font-sans font-bold tabular-nums">
                            <span className="text-slate-600">P:{d.pagu}M</span>
                            <span className="text-[#c2410c]">K:{d.kontrak}M</span>
                          </div>
                          <div className="w-full flex items-end justify-center gap-1.5 h-24 bg-slate-200/50 rounded-t-[3px] p-1">
                            <div
                              style={{ height: `${(d.pagu / 18) * 100}%` }}
                              className="w-1/2 bg-slate-700 rounded-t-xs"
                              title={`Pagu: Rp ${d.pagu} Miliar`}
                            />
                            <div
                              style={{ height: `${(d.kontrak / 18) * 100}%` }}
                              className="w-1/2 bg-[#c2410c] rounded-t-xs"
                              title={`Kontrak: Rp ${d.kontrak} Miliar (Hemat ${d.efficiency}%)`}
                            />
                          </div>
                          <span className="text-[10px] font-bold font-sans text-slate-700 text-center leading-tight">
                            {d.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* ======================================================== */}
                {/* 4. CHART BODY: INPRES JALAN DAERAH (IJD)                 */}
                {/* ======================================================== */}
                {selectedIndex === "inpres" && (
                  chartViewMode === "line" ? (
                    <div className="h-36 pt-2 px-1 flex flex-col justify-end">
                      <svg viewBox="0 0 380 115" className="w-full h-full select-none">
                        {[16, 12, 8, 4].map((val) => {
                          const y = 14 + ((16 - val) / 14) * 78;
                          return (
                            <g key={val}>
                              <line x1="30" y1={y} x2="365" y2={y} stroke="#e2e8f0" strokeDasharray="2 2" strokeWidth="0.8" />
                              <text x="26" y={y + 3} textAnchor="end" fontSize="8" fontFamily="sans-serif" fill="#94a3b8" fontWeight="bold">
                                {val}T
                              </text>
                            </g>
                          );
                        })}
                        <path
                          d={`M 90 ${14 + ((16 - 14.60) / 14) * 78} L 270 ${14 + ((16 - 15.30) / 14) * 78}`}
                          fill="none"
                          stroke="#c2410c"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        {inpresStats.map((d, i) => {
                          const x = 90 + i * 180;
                          const y = 14 + ((16 - d.budgetTrillion) / 14) * 78;
                          const isSelected = d.year === selectedYear;

                          return (
                            <g key={d.stage} className="cursor-pointer" onClick={() => setSelectedYear(d.year)}>
                              <circle cx={x} cy={y} r={isSelected ? 5.5 : 4} fill="#c2410c" stroke="#fff" strokeWidth="2" />
                              <text x={x} y={y - 8} textAnchor="middle" fontSize="9" fontFamily="sans-serif" fontWeight="bold" fill="#c2410c">
                                Rp {d.budgetTrillion} Triliun
                              </text>
                              <text x={x} y={y + 14} textAnchor="middle" fontSize="8" fontFamily="sans-serif" fill="#64748b">
                                ({d.realizedKm.toLocaleString("id-ID")} KM)
                              </text>
                              <text x={x} y="108" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fontWeight={isSelected ? "bold" : "normal"} fill={isSelected ? "#c2410c" : "#475569"}>
                                {d.stage}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  ) : (
                    <div className="h-36 flex items-end justify-around gap-6 pt-3 px-4">
                      {inpresStats.map((d) => {
                        const isSelected = d.year === selectedYear;
                        return (
                          <div
                            key={d.stage}
                            onClick={() => setSelectedYear(d.year)}
                            className="flex-1 flex flex-col justify-end items-center gap-1 cursor-pointer max-w-[130px] group"
                          >
                            <span className="text-[9px] font-sans font-bold tabular-nums text-[#c2410c]">
                              Rp {d.budgetTrillion} T ({d.realizedKm} km)
                            </span>
                            <div className="w-full flex items-end justify-center h-24 bg-slate-200/50 rounded-t-[3px] p-1">
                              <div
                                style={{ height: `${(d.budgetTrillion / 16) * 100}%` }}
                                className={`w-3/4 rounded-t-xs transition-colors ${isSelected ? "bg-[#c2410c]" : "bg-amber-600 group-hover:bg-[#c2410c]"}`}
                                title={`${d.stage}: Rp ${d.budgetTrillion} Triliun untuk ${d.realizedKm} KM di ${d.provinces} Provinsi`}
                              />
                            </div>
                            <span className={`text-[10px] font-bold font-sans ${isSelected ? "text-[#c2410c]" : "text-slate-600"}`}>
                              {d.stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}

                {/* Chart Footnote & Legend (Dynamic based on selectedIndex) */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1.5">
                  {selectedIndex === "kemantapan" && (
                    <>
                      <div className="flex items-center gap-1.5 font-sans">
                        {/* Nasional */}
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[5px] bg-slate-500/10 border border-slate-500/20 text-slate-800 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                          <span className="font-medium text-slate-600">Nas:</span>
                          <span className="font-bold tabular-nums text-slate-900">{currentRoadTrend.nasional}%</span>
                        </div>

                        {/* Provinsi */}
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[5px] bg-amber-500/10 border border-amber-500/25 text-amber-950 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                          <span className="font-medium text-amber-800">Prov:</span>
                          <span className="font-bold tabular-nums text-amber-950">{currentRoadTrend.provinsi}%</span>
                        </div>

                        {/* Kab/Kota */}
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[5px] bg-orange-500/10 border border-orange-500/25 text-orange-950 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] shrink-0" />
                          <span className="font-medium text-[#c2410c]">Kab/Kota:</span>
                          <span className="font-bold tabular-nums text-orange-950">{currentRoadTrend.kabupatenKota}%</span>
                        </div>
                      </div>

                      <div className="text-[10.5px] font-sans text-slate-400">
                        Definisi BPS: Proporsi panjang jalan (km) kondisi mantap
                      </div>
                    </>
                  )}

                  {selectedIndex === "ombudsman" && (
                    <>
                      <div className="flex items-center gap-2 font-sans flex-wrap">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-orange-500/10 border border-orange-500/25 text-[#c2410c] text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] shrink-0" />
                          <span>Undue Delay: <strong className="ml-1 font-bold tabular-nums">{currentComplaintTrend.overduePct}% ({currentComplaintTrend.overdue.toLocaleString("id-ID")} Kasus)</strong></span>
                        </div>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-600 text-xs font-medium">
                          Total Selesai: <strong className="tabular-nums text-slate-800 font-bold">{currentComplaintTrend.resolved.toLocaleString("id-ID")}</strong>
                        </span>
                      </div>
                      <span className="text-[11px] font-sans text-slate-500">
                        Maladministrasi #1 tertinggi di Indonesia (UU 37/2008)
                      </span>
                    </>
                  )}

                  {selectedIndex === "pagu" && (
                    <div className="w-full flex flex-wrap items-center justify-between gap-2.5 font-sans">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Pagu Chip */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-slate-500/10 border border-slate-500/20 text-xs text-slate-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                          <span className="font-medium text-slate-600">Pagu:</span>
                          <span className="font-bold tabular-nums text-slate-900">Rp 35,80 M</span>
                        </div>

                        {/* Kontrak Chip */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-orange-500/10 border border-orange-500/25 text-xs text-orange-950">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] shrink-0" />
                          <span className="font-medium text-[#c2410c]">Kontrak:</span>
                          <span className="font-bold tabular-nums text-orange-950">Rp 33,59 M</span>
                        </div>

                        {/* Efisiensi / Hemat Chip */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-900">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                          <span className="font-medium text-emerald-700">Hemat:</span>
                          <span className="font-bold tabular-nums text-emerald-900">Rp 2,21 M</span>
                          <span className="text-[10px] font-bold bg-emerald-600/15 text-emerald-800 px-1.5 py-0.5 rounded-[3px]">
                            6.2%
                          </span>
                        </div>
                      </div>

                      {/* Sumber Data */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[5px] bg-slate-100/70 border border-slate-200/80 text-[11px] text-slate-600">
                        <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Sumber: <strong className="text-slate-800">LPSE &amp; SiRUP</strong> (6 Ruas Pilot)</span>
                      </div>
                    </div>
                  )}

                  {selectedIndex === "inpres" && (
                    <>
                      <div className="flex items-center gap-2 font-sans flex-wrap">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-orange-500/10 border border-orange-500/25 text-xs text-orange-950 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] shrink-0" />
                          <span>Total 2 Tahap: <strong className="ml-1 font-bold tabular-nums text-[#c2410c]">Rp 29,90 Triliun</strong></span>
                        </div>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-600 text-xs font-medium">
                          Panjang: <strong className="tabular-nums text-slate-800 font-bold">5.992 KM</strong>
                        </span>
                      </div>
                      <span className="text-[11px] font-sans text-slate-500">
                        Inpres No. 3/2023 Percepatan Jalan Daerah
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: REKAPITULASI KORIDOR PILOT */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between space-y-3">
            
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
                className="text-[#c2410c] hover:text-[#9a3412] text-xs font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
              >
                <span>Anggaran Proyek</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Financial-Grade Compact Table */}
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10.5px] text-slate-500 font-sans font-semibold uppercase tracking-wider">
                    <th className="py-1 font-bold">Klasifikasi Wewenang</th>
                    <th className="py-1 font-bold text-center">Ruas</th>
                    <th className="py-1 font-bold text-right">Pagu Pengadaan</th>
                    <th className="py-1 font-bold text-right">Tenggat Respons</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-xs sm:text-[13px]">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1.5">
                      <span className="font-bold text-slate-900 block text-xs">KemenPUPR (BBPJN)</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans">Jalan Nasional</span>
                    </td>
                    <td className="py-1.5 text-center font-sans font-bold tabular-nums text-slate-700">1</td>
                    <td className="py-1.5 text-right font-sans font-bold tabular-nums text-slate-900">Rp 8,45 M</td>
                    <td className="py-1.5 text-right font-sans tabular-nums text-emerald-700 font-bold">0</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1.5">
                      <span className="font-bold text-slate-900 block text-xs">DBMPR Jawa Barat</span>
                      <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider font-sans">Jalan Provinsi</span>
                    </td>
                    <td className="py-1.5 text-center font-sans font-bold tabular-nums text-slate-700">2</td>
                    <td className="py-1.5 text-right font-sans font-bold tabular-nums text-slate-900">Rp 15,70 M</td>
                    <td className="py-1.5 text-right font-sans tabular-nums text-rose-600 font-bold">1 Tiket</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1.5">
                      <span className="font-bold text-slate-900 block text-xs">Dinas PUPR Depok</span>
                      <span className="text-[10px] text-orange-800 font-bold uppercase tracking-wider font-sans">Jalan Kab / Kota</span>
                    </td>
                    <td className="py-1.5 text-center font-sans font-bold tabular-nums text-slate-700">3</td>
                    <td className="py-1.5 text-right font-sans font-bold tabular-nums text-slate-900">Rp 11,65 M</td>
                    <td className="py-1.5 text-right font-sans tabular-nums text-rose-600 font-bold">1 Tiket</td>
                  </tr>

                  <tr className="bg-slate-50/90 font-bold border-t border-slate-200">
                    <td className="py-1.5 text-slate-900 text-xs font-bold font-sans">Total Pilot</td>
                    <td className="py-1.5 text-center font-sans font-bold tabular-nums text-slate-900">6 Ruas</td>
                    <td className="py-1.5 text-right font-sans tabular-nums text-emerald-800">Rp 35,80 M</td>
                    <td className="py-1.5 text-right font-sans tabular-nums text-rose-600">2 Melewati Tenggat</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SLA Alert Strip with Responsible Legal Context */}
            <div className="pt-2 text-[11px] text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 border-t border-slate-100 font-sans">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
                <span>2 laporan pilot telah melewati tenggat pemantauan respons (14 hari kerja).</span>
              </div>
              <button
                onClick={() => {
                  if (onOpenOmbudsmanDraft) {
                    const firstOverdue = reports.find((r) => r.status === "OVERDUE");
                    if (firstOverdue) onOpenOmbudsmanDraft(firstOverdue);
                  }
                }}
                className="font-bold text-[#c2410c] hover:underline shrink-0 cursor-pointer text-[11px]"
              >
                Periksa Opsi Eskalasi →
              </button>
            </div>
          </div>
        </div>

        {/* 4. ACTIVE DATA MONITORING TABLE: RUAS & ANGGARAN APBD / LPSE */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          
          {/* Table Header: Title + Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
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

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onExploreData}
                className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-orange-50 hover:text-orange-900 text-slate-700 border border-slate-200/90 transition-all cursor-pointer flex items-center gap-1.5 font-sans text-xs font-semibold shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-[#c2410c]" />
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
                { id: "SUMUT", label: "Pilot Sumut", count: roads.filter((r) => r.district?.includes("Medan") || r.district?.includes("Simalungun") || r.district?.includes("Karo") || r.district?.includes("Asahan") || r.code?.includes("SMT")).length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTableFilterChange(tab.id)}
                  className={`px-3 py-1.5 rounded-[5px] border transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    tableFilter === tab.id
                      ? "bg-[#c2410c] text-white border-[#c2410c] shadow-xs font-semibold"
                      : "bg-white hover:bg-orange-50/60 text-slate-700 hover:text-[#c2410c] border-slate-200 font-medium"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-[4px] font-semibold tabular-nums ${
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
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[5px] border border-slate-200/90 bg-slate-50/50 focus:bg-white placeholder-slate-400 text-slate-800 focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c]/20 font-sans shadow-2xs transition-all"
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
          <div className="overflow-x-auto rounded-[5px] border border-slate-200/80 bg-white shadow-2xs">
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

                        {/* 2. Status Wewenang: Clean Badge Only */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {road.authority === "NASIONAL" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-xs font-semibold bg-orange-500/10 text-orange-950 border border-orange-500/25">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] shrink-0" />
                              <span>Jalan Nasional</span>
                            </span>
                          ) : road.authority === "PROVINSI" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-xs font-semibold bg-amber-500/10 text-amber-950 border border-amber-500/25">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                              <span>Jalan Provinsi</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-xs font-semibold bg-teal-500/10 text-teal-950 border border-teal-500/25">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                              <span>Kota / Kab</span>
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
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>LPSE Terverifikasi</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Parsial</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 5. Status Respons Pemantauan (14 Hari) */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          {isOverdue ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[5px] border border-rose-500 bg-white text-rose-700 text-xs font-semibold shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                              <span>Lewat Tenggat</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[5px] border border-emerald-500 bg-white text-emerald-700 text-xs font-semibold shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span>Terpantau Aman</span>
                            </div>
                          )}
                        </td>

                        {/* 6. Aksi: Buka Detail Ruas */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedRoadForDetail(road)}
                            className="px-3 py-1.5 rounded-[5px] bg-white hover:bg-orange-50 text-slate-700 hover:text-[#c2410c] font-semibold text-xs border border-slate-200 hover:border-orange-300 transition-all duration-150 cursor-pointer inline-flex items-center gap-1 shadow-2xs group/btn"
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
                        ? "bg-slate-900 text-white border-slate-900"
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
                    className="px-2.5 py-1 rounded-[4px] border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold cursor-pointer transition-colors"
                  >
                    Sebelumnya
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalTablePages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => setTablePage(num)}
                      className={`w-7 h-7 rounded-[4px] border text-xs font-bold cursor-pointer transition-colors tabular-nums ${
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
                    className="px-2.5 py-1 rounded-[4px] border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold cursor-pointer transition-colors"
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
