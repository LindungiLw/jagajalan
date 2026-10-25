"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronRight,
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

  const { roadConditionTrends, inpresBudgets } = ANNUAL_HISTORICAL_DATA;

  // Selected year data point
  const currentRoadTrend =
    roadConditionTrends.find((d) => d.year === selectedYear) ||
    roadConditionTrends[roadConditionTrends.length - 1];

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

  return (
    <section className="pt-3 pb-6 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5">
        
        {/* HERO UTAMA: CENTERED & CLEAN */}
        <div className="pt-2 pb-2 space-y-1 text-center flex flex-col items-center">
          <h1 className="text-xl sm:text-2xl lg:text-[28px] xl:text-[30px] font-bold font-heading text-slate-900 tracking-tight leading-snug">
            Transparansi Kondisi Jalan, Anggaran &amp; Akuntabilitas Publik
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed font-sans font-normal mx-auto">
            Platform integrasi data kemantapan jalan (BPS), tender LPSE, aduan warga geotagging, dan pengawasan SOP 14 hari Ombudsman RI.
          </p>
        </div>

        {/* 1. TOP UTILITY BAR: IDX-STYLE SEGMENTED TAB BAR WITH VERTICAL DIVIDERS */}
        <div className="bg-white border border-slate-200 rounded-[4px] shadow-2xs flex flex-col md:flex-row md:items-stretch overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs">
          
          {/* Segment 1: Wilayah Scope */}
          <div className="px-3.5 py-2 flex items-center gap-2 font-sans text-slate-700 bg-slate-50/70 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold">
              Wilayah: <strong>Pilot Jawa Barat &amp; Bodetabek</strong>
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

            {/* Tab 3: Konteks 38 Provinsi */}
            <button
              type="button"
              onClick={onExploreNational}
              className="px-3.5 py-2 font-sans text-[11px] font-bold bg-white text-slate-700 hover:bg-orange-50/60 hover:text-[#c2410c] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap select-none"
              title="Buka data statistik kemantapan jalan 38 provinsi se-Indonesia"
            >
              <span>38 Provinsi</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
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
          <div className="p-2.5 rounded-[5px] bg-orange-50/90 border border-orange-200/90 text-xs flex flex-wrap items-center justify-between gap-2 animate-fade-in font-medium">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#c2410c] font-mono uppercase">Hasil Pencarian:</span>
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

        {/* 2. OPERATIONAL PILOT SUMMARY STRIP (Pure Crisp White Text on Brand Orange) */}
        <div className="bg-[#c2410c] text-white px-4 py-2.5 rounded-[5px] flex flex-col sm:flex-row sm:items-center justify-between text-xs shadow-2xs gap-3 font-semibold border border-[#9a3412]">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <span className="text-white font-bold uppercase tracking-wider text-[11px] font-sans">
              Cakupan Pilot JagaJalan:
            </span>
            <div className="flex items-center gap-1.5">
              <strong className="text-white font-sans font-black text-sm tabular-nums">6</strong>
              <span className="text-white font-medium text-xs">Ruas Terdata</span>
            </div>
            <span className="hidden sm:inline-block w-px h-3.5 bg-white/40 self-center" aria-hidden="true" />
            <div className="flex items-center gap-1.5">
              <strong className="text-white font-sans font-black text-sm tabular-nums">6</strong>
              <span className="text-white font-medium text-xs">Paket Proyek Teridentifikasi (Rp 35,80 M)</span>
            </div>
            <span className="hidden sm:inline-block w-px h-3.5 bg-white/40 self-center" aria-hidden="true" />
            <div className="flex items-center gap-1.5">
              <strong className="text-white font-sans font-black text-sm tabular-nums">2</strong>
              <span className="text-white font-medium text-xs">Laporan Melewati Tenggat Respons</span>
            </div>
          </div>

          <button
            onClick={onExploreNational}
            className="text-white hover:text-white/80 transition-colors shrink-0 flex items-center gap-1 text-[11px] font-bold cursor-pointer self-end sm:self-auto font-sans hover:underline"
            title="Buka data makro 38 provinsi dan alokasi Inpres Jalan Daerah nasional"
          >
            <span>Konteks Nasional (38 Provinsi &amp; IJD Rp 14,6 T)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. DUAL-PANEL DATA MONITOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          
          {/* LEFT 7 COLS: IKHTISAR DATA & GRAFIK KEMANTAPAN JALAN (BPS SIRUSA 2020-2024) */}
          <div className="lg:col-span-7 bg-white rounded-[5px] border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between space-y-3.5">
            
            {/* Header: Title & View Links */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight">
                  Ikhtisar Kemantapan &amp; Konteks Kebijakan
                </h2>
              </div>
              <button
                onClick={onExploreNational}
                className="text-[#c2410c] hover:text-[#9a3412] text-xs font-bold flex items-center gap-0.5 transition-colors cursor-pointer font-sans"
              >
                <span>Lihat 38 Provinsi</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Split: Index List (Left) + Interactive Visual Chart (Right) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
              
              {/* Index Column (5 cols, accurate labels & clear sources) */}
              <div className="sm:col-span-5 space-y-1.5">
                {/* Index 1: Kemantapan Jalan (BPS 2024) */}
                <button
                  onClick={() => setSelectedIndex("kemantapan")}
                  className={`w-full text-left p-2.5 rounded-[5px] border transition-all cursor-pointer ${
                    selectedIndex === "kemantapan"
                      ? "bg-[#c2410c] text-white border-transparent shadow-xs"
                      : "bg-slate-50/70 text-slate-800 border-slate-200/40 hover:bg-orange-50/40 hover:border-orange-200/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase font-sans">
                      JALAN KAB/KOTA (BPS)
                    </span>
                    <span className={`text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-[3px] tabular-nums ${
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
                  className={`w-full text-left p-2.5 rounded-[5px] border transition-all cursor-pointer ${
                    selectedIndex === "ombudsman"
                      ? "bg-[#c2410c] text-white border-transparent shadow-xs"
                      : "bg-slate-50/70 text-slate-800 border-slate-200/40 hover:bg-orange-50/40 hover:border-orange-200/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase font-sans">
                      UNDUE DELAY (OMBUDSMAN)
                    </span>
                    <span className={`text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-[3px] tabular-nums ${
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
                  className={`w-full text-left p-2.5 rounded-[5px] border transition-all cursor-pointer ${
                    selectedIndex === "pagu"
                      ? "bg-[#c2410c] text-white border-transparent shadow-xs"
                      : "bg-slate-50/70 text-slate-800 border-slate-200/40 hover:bg-orange-50/40 hover:border-orange-200/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase font-sans">
                      PAGU PENGADAAN PILOT
                    </span>
                    <span className={`text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-[3px] tabular-nums ${
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
                  className={`w-full text-left p-2.5 rounded-[5px] border transition-all cursor-pointer ${
                    selectedIndex === "inpres"
                      ? "bg-[#c2410c] text-white border-transparent shadow-xs"
                      : "bg-slate-50/70 text-slate-800 border-slate-200/40 hover:bg-orange-50/40 hover:border-orange-200/60"
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

              {/* Chart Column: Fully Populated BPS Historical Kemantapan Jalan (2020 - 2024) */}
              <div className="sm:col-span-7 bg-slate-50/80 rounded-[5px] border border-slate-200/60 p-3 flex flex-col justify-between">
                
                {/* Chart Header: Title on Top Full-Width, Year & Switcher Controls Below */}
                <div className="space-y-2 border-b border-slate-200/60 pb-2.5">
                  {/* Top: Full-Width Title & Source */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-sans tracking-wide block">
                      Sumber: BPS Sirusa (2020–2024)
                    </span>
                    <strong className="text-xs sm:text-sm font-bold font-heading text-slate-900 tracking-tight block">
                      Tingkat Kemantapan Jalan ({selectedYear})
                    </strong>
                  </div>

                  {/* Below: Controls Row (View Switcher + Year Segmented Bar) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    {/* View Switcher: Line vs Bar (IDX Segmented Style) */}
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

                    {/* Year Tabs: IDX Segmented Bar with Vertical Dividers */}
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
                  </div>
                </div>

                {/* Chart Body: Line Chart or Bar Chart */}
                {chartViewMode === "line" ? (
                  <div className="h-36 pt-2 px-1 flex flex-col justify-end">
                    <svg viewBox="0 0 380 115" className="w-full h-full select-none">
                      {/* Horizontal Gridlines */}
                      {[100, 80, 60, 40].map((val) => {
                        const y = 14 + ((100 - val) / 60) * 78;
                        return (
                          <g key={val}>
                            <line
                              x1="28"
                              y1={y}
                              x2="365"
                              y2={y}
                              stroke="#e2e8f0"
                              strokeDasharray="2 2"
                              strokeWidth="0.8"
                            />
                            <text
                              x="24"
                              y={y + 3}
                              textAnchor="end"
                              fontSize="8"
                              fontFamily="monospace"
                              fill="#94a3b8"
                              fontWeight="bold"
                            >
                              {val}%
                            </text>
                          </g>
                        );
                      })}

                      {/* Disparity Area Shading between Nasional and Kab/Kota */}
                      <polygon
                        points={`
                          ${roadConditionTrends.map((d, i) => `${30 + i * 82.5},${14 + ((100 - d.nasional) / 60) * 78}`).join(" ")}
                          ${[...roadConditionTrends].reverse().map((d, i) => `${360 - i * 82.5},${14 + ((100 - d.kabupatenKota) / 60) * 78}`).join(" ")}
                        `}
                        fill="#c2410c"
                        fillOpacity="0.08"
                      />

                      {/* Line 1: Jalan Nasional */}
                      <path
                        d={roadConditionTrends.map((d, i) => `${i === 0 ? "M" : "L"} ${30 + i * 82.5} ${14 + ((100 - d.nasional) / 60) * 78}`).join(" ")}
                        fill="none"
                        stroke="#475569"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      {/* Line 2: Jalan Provinsi */}
                      <path
                        d={roadConditionTrends.map((d, i) => `${i === 0 ? "M" : "L"} ${30 + i * 82.5} ${14 + ((100 - d.provinsi) / 60) * 78}`).join(" ")}
                        fill="none"
                        stroke="#d97706"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      {/* Line 3: Jalan Kab/Kota */}
                      <path
                        d={roadConditionTrends.map((d, i) => `${i === 0 ? "M" : "L"} ${30 + i * 82.5} ${14 + ((100 - d.kabupatenKota) / 60) * 78}`).join(" ")}
                        fill="none"
                        stroke="#c2410c"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                      />

                      {/* Interactive Points on Line */}
                      {roadConditionTrends.map((d, i) => {
                        const x = 30 + i * 82.5;
                        const yNas = 14 + ((100 - d.nasional) / 60) * 78;
                        const yProv = 14 + ((100 - d.provinsi) / 60) * 78;
                        const yKab = 14 + ((100 - d.kabupatenKota) / 60) * 78;
                        const isSelected = d.year === selectedYear;

                        return (
                          <g
                            key={d.year}
                            className="cursor-pointer"
                            onClick={() => setSelectedYear(d.year)}
                          >
                            <rect
                              x={x - 20}
                              y="5"
                              width="40"
                              height="100"
                              fill="transparent"
                            />

                            {/* Guideline on selected */}
                            {isSelected && (
                              <line
                                x1={x}
                                y1="14"
                                x2={x}
                                y2="92"
                                stroke="#c2410c"
                                strokeWidth="1"
                                strokeDasharray="2 2"
                              />
                            )}

                            {/* Point circles */}
                            <circle cx={x} cy={yNas} r={isSelected ? 4 : 2.5} fill="#475569" stroke="#fff" strokeWidth="1.5" />
                            <circle cx={x} cy={yProv} r={isSelected ? 4 : 2.5} fill="#d97706" stroke="#fff" strokeWidth="1.5" />
                            <circle cx={x} cy={yKab} r={isSelected ? 5.5 : 3.5} fill="#c2410c" stroke="#fff" strokeWidth="2" />

                            {/* Value label on top of Kab/Kota */}
                            <text
                              x={x}
                              y={yKab - 7}
                              textAnchor="middle"
                              fontSize="8"
                              fontFamily="monospace"
                              fontWeight="bold"
                              fill={isSelected ? "#9a3412" : "#c2410c"}
                            >
                              {d.kabupatenKota}%
                            </text>

                            {/* Year label on X-axis */}
                            <text
                              x={x}
                              y="108"
                              textAnchor="middle"
                              fontSize="9"
                              fontFamily="monospace"
                              fontWeight={isSelected ? "bold" : "normal"}
                              fill={isSelected ? "#c2410c" : "#64748b"}
                            >
                              {d.year}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                ) : (
                  /* Bar Chart View */
                  <div className="h-36 flex items-end justify-between gap-2 pt-4 px-1">
                    {roadConditionTrends.map((d) => {
                      const isSelected = d.year === selectedYear;
                      return (
                        <div
                          key={d.year}
                          onClick={() => setSelectedYear(d.year)}
                          className="flex-1 flex flex-col justify-end items-center gap-1 cursor-pointer group"
                        >
                          {/* Percentage Label on Top of Selected Bar */}
                          <span
                            className={`text-[9px] font-mono font-bold leading-none ${
                              isSelected ? "text-[#c2410c]" : "text-slate-400 group-hover:text-slate-700"
                            }`}
                          >
                            {d.kabupatenKota}%
                          </span>

                          {/* Bar Graphic with height proportionate to percentage (scaled 40% to 100%) */}
                          <div className="w-full flex items-end justify-center gap-0.5 h-24 bg-slate-200/50 rounded-t-[3px] p-0.5">
                            {/* Jalan Nasional */}
                            <div
                              style={{ height: `${d.nasional}%` }}
                              className="w-1/3 bg-slate-600 rounded-t-xs"
                              title={`Nasional ${d.year}: ${d.nasional}% Mantap`}
                            />
                            {/* Jalan Provinsi */}
                            <div
                              style={{ height: `${d.provinsi}%` }}
                              className="w-1/3 bg-amber-600 rounded-t-xs"
                              title={`Provinsi ${d.year}: ${d.provinsi}% Mantap`}
                            />
                            {/* Jalan Kab/Kota (Selected Highlight) */}
                            <div
                              style={{ height: `${d.kabupatenKota}%` }}
                              className={`w-1/3 rounded-t-xs transition-colors ${
                                isSelected ? "bg-[#c2410c]" : "bg-rose-500"
                              }`}
                              title={`Kab/Kota ${d.year}: ${d.kabupatenKota}% Mantap`}
                            />
                          </div>

                          {/* Year Label */}
                          <span
                            className={`text-[10px] font-mono font-bold ${
                              isSelected ? "text-[#c2410c]" : "text-slate-500"
                            }`}
                          >
                            {d.year}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Chart Footnote & Legend */}
                <div className="mt-2 pt-1.5 border-t border-slate-200 text-[10px] text-slate-600 flex flex-wrap items-center justify-between gap-1 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                      <span>Nas: {currentRoadTrend.nasional}%</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-600" />
                      <span>Prov: {currentRoadTrend.provinsi}%</span>
                    </span>
                    <span className="flex items-center gap-1 text-[#c2410c] font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#c2410c]" />
                      <span>Kab/Kota: {currentRoadTrend.kabupatenKota}%</span>
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400">
                    Definisi BPS: Proporsi panjang jalan (km) kondisi mantap
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: REKAPITULASI KORIDOR PILOT */}
          <div className="lg:col-span-5 bg-white rounded-[5px] border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between space-y-3">
            
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
                  <tr className="border-b border-slate-200 text-[10px] text-slate-400 font-mono uppercase">
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
                      <span className="text-[10px] text-slate-500 font-semibold font-mono">JALAN NASIONAL</span>
                    </td>
                    <td className="py-1.5 text-center font-sans font-bold tabular-nums text-slate-700">1</td>
                    <td className="py-1.5 text-right font-sans font-bold tabular-nums text-slate-900">Rp 8,45 M</td>
                    <td className="py-1.5 text-right font-sans tabular-nums text-emerald-700 font-bold">0</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1.5">
                      <span className="font-bold text-slate-900 block text-xs">DBMPR Jawa Barat</span>
                      <span className="text-[10px] text-amber-800 font-semibold font-mono">JALAN PROVINSI</span>
                    </td>
                    <td className="py-1.5 text-center font-sans font-bold tabular-nums text-slate-700">2</td>
                    <td className="py-1.5 text-right font-sans font-bold tabular-nums text-slate-900">Rp 15,70 M</td>
                    <td className="py-1.5 text-right font-sans tabular-nums text-rose-600 font-bold">1 Tiket</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1.5">
                      <span className="font-bold text-slate-900 block text-xs">Dinas PUPR Depok</span>
                      <span className="text-[10px] text-orange-800 font-semibold font-mono">JALAN KAB / KOTA</span>
                    </td>
                    <td className="py-1.5 text-center font-sans font-bold tabular-nums text-slate-700">3</td>
                    <td className="py-1.5 text-right font-sans font-bold tabular-nums text-slate-900">Rp 11,65 M</td>
                    <td className="py-1.5 text-right font-sans tabular-nums text-rose-600 font-bold">1 Tiket</td>
                  </tr>

                  <tr className="bg-slate-50/90 font-bold border-t border-slate-200">
                    <td className="py-1.5 text-slate-900 text-xs uppercase font-mono">Total Pilot</td>
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
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
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
        <div className="bg-white rounded-[5px] border border-slate-200/90 shadow-2xs p-4 space-y-3">
          
          {/* Table Header & View Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight">
                Tabel Penelusuran Ruas & Anggaran APBD
              </h2>
              <span className="text-xs font-semibold text-slate-400 font-sans tabular-nums">
                ({searchResults.matchedRoads.length} Ruas Terdata)
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <button
                onClick={onExploreData}
                className="px-3 py-1 rounded-[5px] bg-slate-100 hover:bg-orange-50 hover:text-orange-900 text-slate-700 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 font-sans"
              >
                <FileText className="w-3.5 h-3.5 text-orange-700" />
                <span>Penelusuran Anggaran Proyek</span>
              </button>
            </div>
          </div>

          {/* Clean, High-Density Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] text-slate-400 font-mono uppercase bg-slate-50/60">
                  <th className="py-2 px-3 font-bold">Kode Ruas</th>
                  <th className="py-2 px-3 font-bold">Nama Ruas Jalan</th>
                  <th className="py-2 px-3 font-bold">Status Wewenang & SK</th>
                  <th className="py-2 px-3 font-bold text-center">Status Pencocokan</th>
                  <th className="py-2 px-3 font-bold text-right">Pagu vs Kontrak</th>
                  <th className="py-2 px-3 font-bold">Kontraktor & Sumber</th>
                  <th className="py-2 px-3 font-bold text-center">Tenggat Respons</th>
                  <th className="py-2 px-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {searchResults.matchedRoads.map((road) => {
                  const rep = reports.find((r) => r.roadSegmentId === road.id);
                  const isOverdue = rep?.status === "OVERDUE";

                  return (
                    <tr key={road.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Kode Ruas */}
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-600 text-[11px]">
                        {road.code}
                      </td>

                      {/* Nama Ruas Jalan */}
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{road.name}</span>
                        <span className="text-[10px] text-slate-500 font-sans">
                          {road.district} • <strong className="font-semibold tabular-nums">{road.lengthKm}</strong> Km
                        </span>
                      </td>

                      {/* Status Wewenang & SK (Clean Typography with Status Dot) */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            road.authority === "NASIONAL"
                              ? "bg-slate-600"
                              : road.authority === "PROVINSI"
                              ? "bg-amber-600"
                              : "bg-[#c2410c]"
                          }`} />
                          <span className={`text-[11px] font-bold uppercase tracking-wide ${
                            road.authority === "NASIONAL"
                              ? "text-slate-800"
                              : road.authority === "PROVINSI"
                              ? "text-amber-800"
                              : "text-[#c2410c]"
                          }`}>
                            {road.authority}
                          </span>
                        </div>
                        <span className="block text-[10px] text-slate-500 truncate max-w-[200px] mt-0.5 font-sans" title={road.legalBasis}>
                          {road.legalBasis.split(" tentang ")[0]}
                        </span>
                      </td>

                      {/* Status Pencocokan LPSE (Clean Typography with Status Dot) */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            road.budget?.matchConfidence === "TERKONFIRMASI" ? "bg-emerald-600" : "bg-amber-500"
                          }`} />
                          <span className={`text-[11px] font-bold ${
                            road.budget?.matchConfidence === "TERKONFIRMASI" ? "text-emerald-700" : "text-amber-700"
                          }`}>
                            {road.budget?.matchConfidence === "TERKONFIRMASI" ? "Terkonfirmasi" : "Parsial"}
                          </span>
                        </div>
                      </td>

                      {/* Nilai Pagu vs Kontrak */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="font-sans font-bold tabular-nums text-slate-900 text-xs sm:text-[13px]">
                          Rp {(road.budget?.paguRp / 1000000000).toFixed(2)} M
                        </div>
                        <div className="text-[10px] font-sans font-medium tabular-nums text-emerald-700">
                          Kontrak: Rp {(road.budget?.contractValueRp / 1000000000).toFixed(2)} M
                        </div>
                      </td>

                      {/* Kontraktor Pelaksana */}
                      <td className="py-2.5 px-3 text-slate-700">
                        <span className="block font-medium truncate max-w-[170px]" title={road.budget?.contractor}>
                          {road.budget?.contractor || "-"}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[170px]">
                          {road.budget?.source} (TA {road.budget?.fiscalYear})
                        </span>
                      </td>

                      {/* Status Pemantauan Respons (14 Hari - Clean Typography with Status Dot) */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOverdue ? "bg-rose-500" : "bg-emerald-500"}`} />
                          <span className={`text-[11px] font-bold ${isOverdue ? "text-rose-600" : "text-slate-600"}`}>
                            {isOverdue ? "Melewati Tenggat" : "Terpantau"}
                          </span>
                        </div>
                      </td>

                      {/* Aksi: Buka Detail Ruas */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedRoadForDetail(road)}
                          className="text-[#c2410c] hover:text-[#9a3412] hover:underline font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-0.5 font-sans"
                        >
                          <span>Lihat Ruas</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
