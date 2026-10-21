"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Calendar,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { ROAD_SEGMENTS } from "@/data/roadsData";
import { INITIAL_REPORTS } from "@/data/reportsData";
import { ANNUAL_HISTORICAL_DATA, NATIONAL_STATS } from "@/data/provincesData";

export default function HeroSection({
  roads = ROAD_SEGMENTS,
  reports = INITIAL_REPORTS,
  onExploreData,
  onOpenReport,
  onExploreNational,
  onOpenOfficerPortal,
}) {
  // Metric Index Selection (like COMPOSITE, LQ45 in IDX)
  const [selectedIndex, setSelectedIndex] = useState("kemantapan"); // 'kemantapan' | 'penundaan' | 'pagu' | 'inpres'
  const [selectedYear, setSelectedYear] = useState(2026);
  const [summaryTab, setSummaryTab] = useState("wewenang"); // 'wewenang' | 'aduan' | 'pagu'
  const [tableTab, setTableTab] = useState("ruas"); // 'ruas' | 'aduan' | 'lpse'
  const [searchQuery, setSearchQuery] = useState("");

  const { roadConditionTrends, complaintTrends, inpresBudgets } = ANNUAL_HISTORICAL_DATA;

  // Selected year data point
  const currentRoadTrend = roadConditionTrends.find((d) => d.year === selectedYear) || roadConditionTrends[5];
  const currentComplaintTrend = complaintTrends.find((d) => d.year === selectedYear) || complaintTrends[5];
  const currentInpresTrend = inpresBudgets.find((d) => d.year === selectedYear) || inpresBudgets[3];

  // Filtered roads for the quick table
  const filteredRoads = useMemo(() => {
    return roads.filter((r) => {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.authority.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        (r.budget?.contractor && r.budget.contractor.toLowerCase().includes(q))
      );
    });
  }, [roads, searchQuery]);

  return (
    <section className="pt-3 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5">
        
        {/* 1. TOP HEADER & QUICK SEARCH BAR (IDX Utility Bar Style, rounded-[5px]) */}
        <div className="bg-white p-3 sm:p-3.5 rounded-[5px] border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Live Timestamp & Ticker Status */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 font-mono text-slate-700 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-orange-700" />
              <span>Rabu, 21 Oktober 2026 | 13:00 WIB</span>
            </div>
            <span className="hidden sm:inline text-slate-300">•</span>
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded-[5px] border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Data Faktual BPS & LPSE Live</span>
            </div>
          </div>

          {/* Quick Search Input (Expanded & Clean) */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ruas jalan, nomor lelang LPSE, kode tiket, atau kontraktor..."
              className="w-full pl-9 pr-3 py-1.5 rounded-[5px] border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-orange-600 focus:bg-white transition-all font-sans"
            />
          </div>
        </div>

        {/* 2. SUB-NAV / QUICK JUMP STRIP (Warm Muted Orange, Like IDX Terminal Banner, rounded-[5px]) */}
        <div className="bg-[#c2410c] text-white px-4 py-2.5 rounded-[5px] flex items-center justify-between text-xs overflow-x-auto shadow-2xs gap-4 font-semibold border border-[#9a3412]">
          <div className="flex items-center gap-5 whitespace-nowrap">
            <span className="text-orange-200 font-bold uppercase tracking-wider text-[11px] font-mono">
              Indikator Keterbukaan Publik:
            </span>
            <button onClick={() => setSelectedIndex("kemantapan")} className="hover:text-orange-100 transition-colors cursor-pointer">
              Kemantapan Jalan ({NATIONAL_STATS.nationalAverageDamaged}% Rusak)
            </button>
            <span className="text-orange-300/40">|</span>
            <button onClick={() => setSelectedIndex("penundaan")} className="hover:text-orange-100 transition-colors cursor-pointer">
              Undue Delay ({NATIONAL_STATS.overdueRate}%)
            </button>
            <span className="text-orange-300/40">|</span>
            <button onClick={() => setSelectedIndex("pagu")} className="hover:text-orange-100 transition-colors cursor-pointer">
              Pagu Terdata (Rp 35,8 Miliar)
            </button>
            <span className="text-orange-300/40">|</span>
            <button onClick={() => setSelectedIndex("inpres")} className="hover:text-orange-100 transition-colors cursor-pointer">
              Inpres Jalan APBN (Rp 14,6 T)
            </button>
          </div>
          <button
            onClick={onExploreNational}
            className="text-orange-200 hover:text-white transition-colors shrink-0 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
          >
            <span>Peringkat 38 Provinsi</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. DUAL-PANEL DATA MONITOR (Like IDX IKHTISAR PASAR & RINGKASAN PERDAGANGAN) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          
          {/* LEFT 7 COLS: IKHTISAR DATA & GRAFIK TREN (rounded-[5px]) */}
          <div className="lg:col-span-7 bg-white rounded-[5px] border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between space-y-3.5">
            
            {/* Header: Title & View Links */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight uppercase">
                  Ikhtisar Kemantapan & Aduan Publik
                </span>
                <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200/80">
                  Resmi BPS
                </span>
              </div>
              <button
                onClick={onExploreNational}
                className="text-[#c2410c] hover:text-[#9a3412] text-xs font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
              >
                <span>Lihat Seluruh 38 Provinsi</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Split: Index List (Left) + Interactive SVG Chart (Right) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
              
              {/* Index Column (5 cols, like COMPOSITE, LQ45, IDX30) */}
              <div className="sm:col-span-5 space-y-1.5">
                {/* Index 1: Kemantapan Jalan */}
                <button
                  onClick={() => setSelectedIndex("kemantapan")}
                  className={`w-full text-left p-2 rounded-[5px] border transition-all cursor-pointer ${
                    selectedIndex === "kemantapan"
                      ? "bg-[#c2410c] text-white border-[#9a3412] shadow-xs"
                      : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-orange-50/40 hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider uppercase font-mono">
                      JALAN KAB/KOTA
                    </span>
                    <span className={`text-[10px] font-bold ${selectedIndex === "kemantapan" ? "text-orange-200" : "text-rose-600"}`}>
                      -42.9%
                    </span>
                  </div>
                  <div className="text-lg font-black font-mono mt-0.5">57.1% MANTAP</div>
                  <div className={`text-[10px] truncate ${selectedIndex === "kemantapan" ? "text-orange-100/90" : "text-slate-500"}`}>
                    Hampir separuh jalan rusak
                  </div>
                </button>

                {/* Index 2: Penundaan Berlarut */}
                <button
                  onClick={() => setSelectedIndex("penundaan")}
                  className={`w-full text-left p-2 rounded-[5px] border transition-all cursor-pointer ${
                    selectedIndex === "penundaan"
                      ? "bg-[#c2410c] text-white border-[#9a3412] shadow-xs"
                      : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-orange-50/40 hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider uppercase font-mono">
                      UNDUE DELAY
                    </span>
                    <span className={`text-[10px] font-bold ${selectedIndex === "penundaan" ? "text-orange-200" : "text-amber-600"}`}>
                      +2.1% YoY
                    </span>
                  </div>
                  <div className="text-lg font-black font-mono mt-0.5">33.86% OVERDUE</div>
                  <div className={`text-[10px] truncate ${selectedIndex === "penundaan" ? "text-orange-100/90" : "text-slate-500"}`}>
                    Maladministrasi nomor 1 pemda
                  </div>
                </button>

                {/* Index 3: Pagu APBD Pilot */}
                <button
                  onClick={() => setSelectedIndex("pagu")}
                  className={`w-full text-left p-2 rounded-[5px] border transition-all cursor-pointer ${
                    selectedIndex === "pagu"
                      ? "bg-[#c2410c] text-white border-[#9a3412] shadow-xs"
                      : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-orange-50/40 hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider uppercase font-mono">
                      PAGU APBD PILOT
                    </span>
                    <span className={`text-[10px] font-bold ${selectedIndex === "pagu" ? "text-orange-200" : "text-emerald-600"}`}>
                      6 Paket
                    </span>
                  </div>
                  <div className="text-lg font-black font-mono mt-0.5">RP 35.8 MILIAR</div>
                  <div className={`text-[10px] truncate ${selectedIndex === "pagu" ? "text-orange-100/90" : "text-slate-500"}`}>
                    Kroscek lelang tender LPSE
                  </div>
                </button>
              </div>

              {/* Chart Column (7 cols, interactive time-series, rounded-[5px]) */}
              <div className="sm:col-span-7 bg-slate-50/70 rounded-[5px] border border-slate-200 p-3 flex flex-col justify-between">
                
                {/* Chart Header with Year Selector */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Data Terpilih:</span>
                    <strong className="text-xs font-black text-slate-900">
                      {selectedIndex === "kemantapan" && `Kemantapan Ruas (${currentRoadTrend.year})`}
                      {selectedIndex === "penundaan" && `Aduan Pemda (${currentComplaintTrend.year})`}
                      {selectedIndex === "pagu" && `Alokasi LPSE Pilot (2026)`}
                      {selectedIndex === "inpres" && `Dana Inpres (${currentInpresTrend.year})`}
                    </strong>
                  </div>

                  {/* Year Tabs */}
                  <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-[5px] border border-slate-200 text-[10px] font-bold font-mono">
                    {[2021, 2022, 2023, 2024, 2025, 2026].map((yr) => (
                      <button
                        key={yr}
                        onClick={() => setSelectedYear(yr)}
                        className={`px-1.5 py-0.5 rounded-[5px] transition-colors cursor-pointer ${
                          selectedYear === yr
                            ? "bg-[#c2410c] text-white"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {yr.toString().slice(2)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Visual Graphic */}
                <div className="h-32 flex items-end justify-between gap-1.5 pt-3 px-1">
                  {roadConditionTrends.map((d) => {
                    const isSelected = d.year === selectedYear;
                    const val =
                      selectedIndex === "kemantapan"
                        ? d.kabupatenKota
                        : selectedIndex === "penundaan"
                        ? (d.gap / 40) * 80
                        : 55;

                    return (
                      <div
                        key={d.year}
                        onClick={() => setSelectedYear(d.year)}
                        className="flex-1 flex flex-col justify-end items-center gap-1 cursor-pointer group"
                      >
                        <div
                          style={{ height: `${val}%` }}
                          className={`w-full rounded-t-[3px] transition-all ${
                            isSelected
                              ? "bg-[#c2410c] shadow-xs"
                              : "bg-slate-300 group-hover:bg-orange-300"
                          }`}
                        />
                        <span
                          className={`text-[9px] font-mono font-bold ${
                            isSelected ? "text-[#c2410c]" : "text-slate-400"
                          }`}
                        >
                          {d.year}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Live Tooltip Data Footnote */}
                <div className="mt-2 pt-1.5 border-t border-slate-200 text-[10px] text-slate-600 flex items-center justify-between font-mono">
                  <span>
                    Nasional: <strong className="text-slate-800">{currentRoadTrend.nasional}%</strong> | Prov: <strong className="text-slate-800">{currentRoadTrend.provinsi}%</strong>
                  </span>
                  <span className="text-rose-600 font-bold">
                    Kab/Kota: {currentRoadTrend.kabupatenKota}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: RINGKASAN REKAPITULASI (rounded-[5px]) */}
          <div className="lg:col-span-5 bg-white rounded-[5px] border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between space-y-3">
            
            {/* Header: Title & Tab Filters */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight uppercase">
                Rekapitulasi Koridor Pilot
              </span>
              <button
                onClick={onExploreData}
                className="text-[#c2410c] hover:text-[#9a3412] text-xs font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
              >
                <span>Buka LPSE</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Sub-Tabs */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-[5px] text-xs font-semibold">
              <button
                onClick={() => setSummaryTab("wewenang")}
                className={`flex-1 py-1 rounded-[5px] text-center transition-all cursor-pointer ${
                  summaryTab === "wewenang" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Tingkat Wewenang
              </button>
              <button
                onClick={() => setSummaryTab("aduan")}
                className={`flex-1 py-1 rounded-[5px] text-center transition-all cursor-pointer ${
                  summaryTab === "aduan" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Kepatuhan SLA
              </button>
            </div>

            {/* Financial-Grade Compact Table */}
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] text-slate-400 font-mono uppercase">
                    <th className="py-1 font-bold">Instansi</th>
                    <th className="py-1 font-bold text-center">Ruas</th>
                    <th className="py-1 font-bold text-right">Pagu LPSE</th>
                    <th className="py-1 font-bold text-right">Overdue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1.5">
                      <span className="font-bold text-slate-900 block text-xs">KemenPUPR</span>
                      <span className="text-[10px] text-slate-500 font-semibold font-mono">NASIONAL</span>
                    </td>
                    <td className="py-1.5 text-center font-mono font-bold text-slate-700">1</td>
                    <td className="py-1.5 text-right font-mono font-bold text-slate-900">Rp 8,45 M</td>
                    <td className="py-1.5 text-right font-mono text-emerald-700 font-bold">0</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1.5">
                      <span className="font-bold text-slate-900 block text-xs">DBMPR Jabar</span>
                      <span className="text-[10px] text-amber-800 font-semibold font-mono">PROVINSI</span>
                    </td>
                    <td className="py-1.5 text-center font-mono font-bold text-slate-700">2</td>
                    <td className="py-1.5 text-right font-mono font-bold text-slate-900">Rp 15,70 M</td>
                    <td className="py-1.5 text-right font-mono text-rose-600 font-bold">1</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1.5">
                      <span className="font-bold text-slate-900 block text-xs">Dinas PUPR Depok</span>
                      <span className="text-[10px] text-orange-800 font-semibold font-mono">KOTA DEPOK</span>
                    </td>
                    <td className="py-1.5 text-center font-mono font-bold text-slate-700">3</td>
                    <td className="py-1.5 text-right font-mono font-bold text-slate-900">Rp 11,65 M</td>
                    <td className="py-1.5 text-right font-mono text-rose-600 font-bold">1</td>
                  </tr>

                  <tr className="bg-slate-50/90 font-bold border-t border-slate-200">
                    <td className="py-1.5 text-slate-900 text-xs uppercase font-mono">Total Pilot</td>
                    <td className="py-1.5 text-center font-mono text-slate-900">6</td>
                    <td className="py-1.5 text-right font-mono text-emerald-800">Rp 35,80 M</td>
                    <td className="py-1.5 text-right font-mono text-rose-600">2 Tiket</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Quick Status Note */}
            <div className="p-2 rounded-[5px] bg-orange-50/80 border border-orange-200/90 text-[10px] text-orange-950 flex items-center justify-between">
              <span>2 aduan melampaui 14 hari tanpa respon resmi dinas.</span>
              <span className="font-bold text-[#c2410c] font-mono">Ombudsman Alert</span>
            </div>
          </div>
        </div>

        {/* 4. ACTIVE DATA MONITORING TABLE (rounded-[5px]) */}
        <div className="bg-white rounded-[5px] border border-slate-200/90 shadow-2xs p-4 space-y-3">
          
          {/* Table Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs sm:text-sm text-slate-900 tracking-tight uppercase font-mono">
                Tabel Penelusuran Ruas & Anggaran APBD
              </span>
              <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {filteredRoads.length} Ruas Aktif
              </span>
            </div>

            {/* Quick Tab Selector */}
            <div className="flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => setTableTab("ruas")}
                className={`px-3 py-1 rounded-[5px] transition-colors cursor-pointer ${
                  tableTab === "ruas" ? "bg-[#c2410c] text-white font-bold" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Daftar Ruas & Wewenang
              </button>
              <button
                onClick={onExploreData}
                className="px-3 py-1 rounded-[5px] bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Paket Tender LPSE</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* The Data Table (Dense, Clean, Informative) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] text-slate-400 font-mono uppercase bg-slate-50/60">
                  <th className="py-2 px-3 font-bold">Kode Ruas</th>
                  <th className="py-2 px-3 font-bold">Nama Ruas Jalan</th>
                  <th className="py-2 px-3 font-bold">Status Wewenang</th>
                  <th className="py-2 px-3 font-bold text-right">Pagu APBD (LPSE)</th>
                  <th className="py-2 px-3 font-bold">Kontraktor Pelaksana</th>
                  <th className="py-2 px-3 font-bold text-center">Status SLA</th>
                  <th className="py-2 px-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoads.map((road) => {
                  const rep = reports.find((r) => r.roadSegmentId === road.id);
                  const isOverdue = rep?.status === "OVERDUE";

                  const badgeClass =
                    road.authority === "NASIONAL"
                      ? "bg-slate-100 text-slate-800 border-slate-300"
                      : road.authority === "PROVINSI"
                      ? "bg-amber-50 text-amber-900 border-amber-200"
                      : "bg-orange-50 text-orange-900 border-orange-200";

                  return (
                    <tr key={road.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-mono font-bold text-slate-500 text-[11px]">
                        {road.code}
                      </td>

                      <td className="py-2 px-3">
                        <span className="font-bold text-slate-900 block">{road.name}</span>
                        <span className="text-[10px] text-slate-500">{road.district} • {road.lengthKm} Km</span>
                      </td>

                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider border ${badgeClass} inline-block`}>
                          {road.authority}
                        </span>
                        <span className="block text-[10px] text-slate-600 mt-0.5">{road.authorityLabel}</span>
                      </td>

                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 text-sm">
                        Rp {(road.budget?.paguRp / 1000000000).toFixed(1)} M
                      </td>

                      <td className="py-2 px-3 text-slate-700">
                        <span className="block font-medium truncate max-w-[180px]">{road.budget?.contractor || "-"}</span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                          {road.budget?.source}
                        </span>
                      </td>

                      <td className="py-2 px-3 text-center">
                        {isOverdue ? (
                          <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            OVERDUE SLA
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            TERPANTAU
                          </span>
                        )}
                      </td>

                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={onExploreData}
                          className="px-2.5 py-1 rounded-[5px] bg-slate-100 hover:bg-orange-50 hover:text-orange-800 text-slate-700 font-bold text-[11px] border border-slate-200 transition-colors cursor-pointer"
                        >
                          Detail LPSE
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
    </section>
  );
}
