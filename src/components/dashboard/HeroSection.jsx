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
        
        {/* 1. TOP UTILITY BAR: MEASURED DATASET SCOPE & UNIFIED SEARCH */}
        <div className="bg-white p-3 sm:p-3.5 rounded-[5px] border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          {/* Dataset Status & Verification Metadata (Replaced 'Live' with factual audit status) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1.5 font-mono text-slate-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-orange-600" />
              <span>Wilayah: <strong>Pilot Jawa Barat & Bodetabek</strong></span>
            </div>

            <span className="hidden sm:inline text-slate-300">•</span>

            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
              <span className="px-1.5 py-0.5 rounded-[4px] bg-slate-100 border border-slate-200 text-slate-700 font-bold">
                BPS 2024 (Sirusa)
              </span>
              <span className="px-1.5 py-0.5 rounded-[4px] bg-slate-100 border border-slate-200 text-slate-700 font-bold">
                LPSE Pengadaan TA 2026
              </span>
              <span className="hidden lg:inline text-slate-400">
                Pembaruan: 18 Okt 2026
              </span>
            </div>
          </div>

          {/* Unified Search Input (Routes to Road, Report, or Procurement Package) */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama ruas, kode laporan, paket pengadaan, atau kontraktor..."
              className="w-full pl-9 pr-3 py-1.5 rounded-[5px] border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-orange-600 focus:bg-white transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 font-mono text-xs cursor-pointer"
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

        {/* 2. OPERATIONAL PILOT SUMMARY STRIP (Clean & Verifiable Pilot Baseline) */}
        <div className="bg-[#c2410c] text-white px-4 py-2.5 rounded-[5px] flex flex-col sm:flex-row sm:items-center justify-between text-xs shadow-2xs gap-3 font-semibold border border-[#9a3412]">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <span className="text-orange-200 font-bold uppercase tracking-wider text-[11px] font-mono">
              Cakupan Pilot JagaJalan:
            </span>
            <div className="flex items-center gap-1.5">
              <strong className="text-white font-mono text-sm">6</strong>
              <span className="text-orange-100/90 text-xs font-normal">Ruas Terdata</span>
            </div>
            <span className="text-orange-300/40 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <strong className="text-white font-mono text-sm">6</strong>
              <span className="text-orange-100/90 text-xs font-normal">Paket Proyek Teridentifikasi (Rp 35,80 M)</span>
            </div>
            <span className="text-orange-300/40 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <strong className="text-white font-mono text-sm">2</strong>
              <span className="text-orange-100/90 text-xs font-normal">Laporan Melewati Tenggat Respons</span>
            </div>
          </div>

          <button
            onClick={onExploreNational}
            className="text-orange-200 hover:text-white transition-colors shrink-0 flex items-center gap-1 text-[11px] font-bold cursor-pointer self-end sm:self-auto"
            title="Buka data makro 38 provinsi dan alokasi Inpres Jalan Daerah nasional"
          >
            <span>Konteks Nasional (38 Provinsi & IJD Rp 14,6 T)</span>
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
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight uppercase">
                  Ikhtisar Kemantapan & Konteks Kebijakan
                </span>
                <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200/80">
                  Data Terverifikasi
                </span>
              </div>
              <button
                onClick={onExploreNational}
                className="text-[#c2410c] hover:text-[#9a3412] text-xs font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
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
                  className={`w-full text-left p-2 rounded-[5px] border transition-all cursor-pointer ${
                    selectedIndex === "kemantapan"
                      ? "bg-[#c2410c] text-white border-[#9a3412] shadow-xs"
                      : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-orange-50/40 hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase font-mono">
                      JALAN KAB/KOTA (BPS)
                    </span>
                    <span className={`text-[9px] font-mono px-1 py-0.2 rounded-[3px] ${
                      selectedIndex === "kemantapan" ? "bg-orange-800 text-orange-100" : "bg-slate-200 text-slate-700"
                    }`}>
                      2024
                    </span>
                  </div>
                  <div className="text-base font-black font-mono mt-0.5">57,1% MANTAP</div>
                  <div className={`text-[10px] truncate ${selectedIndex === "kemantapan" ? "text-orange-100/90" : "text-slate-500"}`}>
                    42,9% panjang jalan belum mantap
                  </div>
                </button>

                {/* Index 2: Konteks Ombudsman 2024 */}
                <button
                  onClick={() => setSelectedIndex("ombudsman")}
                  className={`w-full text-left p-2 rounded-[5px] border transition-all cursor-pointer ${
                    selectedIndex === "ombudsman"
                      ? "bg-[#c2410c] text-white border-[#9a3412] shadow-xs"
                      : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-orange-50/40 hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase font-mono">
                      UNDUE DELAY (OMBUDSMAN)
                    </span>
                    <span className={`text-[9px] font-mono px-1 py-0.2 rounded-[3px] ${
                      selectedIndex === "ombudsman" ? "bg-orange-800 text-orange-100" : "bg-slate-200 text-slate-700"
                    }`}>
                      2024
                    </span>
                  </div>
                  <div className="text-base font-black font-mono mt-0.5">33,86% LAPORAN</div>
                  <div className={`text-[10px] truncate ${selectedIndex === "ombudsman" ? "text-orange-100/90" : "text-slate-500"}`}>
                    Penundaan berlarut pada laporan selesai
                  </div>
                </button>

                {/* Index 3: Pagu Paket Pilot LPSE */}
                <button
                  onClick={() => setSelectedIndex("pagu")}
                  className={`w-full text-left p-2 rounded-[5px] border transition-all cursor-pointer ${
                    selectedIndex === "pagu"
                      ? "bg-[#c2410c] text-white border-[#9a3412] shadow-xs"
                      : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-orange-50/40 hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase font-mono">
                      PAGU PENGADAAN PILOT
                    </span>
                    <span className={`text-[9px] font-mono px-1 py-0.2 rounded-[3px] ${
                      selectedIndex === "pagu" ? "bg-orange-800 text-orange-100" : "bg-slate-200 text-slate-700"
                    }`}>
                      6 Paket
                    </span>
                  </div>
                  <div className="text-base font-black font-mono mt-0.5">RP 35,80 MILIAR</div>
                  <div className={`text-[10px] truncate ${selectedIndex === "pagu" ? "text-orange-100/90" : "text-slate-500"}`}>
                    Total nilai pagu lelang terverifikasi
                  </div>
                </button>

                {/* Index 4: Alokasi Inpres Nasional 2023 */}
                <button
                  onClick={() => setSelectedIndex("inpres")}
                  className={`w-full text-left p-2 rounded-[5px] border transition-all cursor-pointer ${
                    selectedIndex === "inpres"
                      ? "bg-[#c2410c] text-white border-[#9a3412] shadow-xs"
                      : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-orange-50/40 hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase font-mono">
                      INPRES JALAN DAERAH
                    </span>
                    <span className={`text-[9px] font-mono px-1 py-0.2 rounded-[3px] ${
                      selectedIndex === "inpres" ? "bg-orange-800 text-orange-100" : "bg-slate-200 text-slate-700"
                    }`}>
                      TA 2023
                    </span>
                  </div>
                  <div className="text-base font-black font-mono mt-0.5">RP 14,60 TRILIUN</div>
                  <div className={`text-[10px] truncate ${selectedIndex === "inpres" ? "text-orange-100/90" : "text-slate-500"}`}>
                    Alokasi Tahap I Inpres No. 3/2023 (PUPR)
                  </div>
                </button>
              </div>

              {/* Chart Column: Fully Populated BPS Historical Kemantapan Jalan (2020 - 2024) */}
              <div className="sm:col-span-7 bg-slate-50/80 rounded-[5px] border border-slate-200 p-3 flex flex-col justify-between">
                
                {/* Chart Header with Year Selector (2020-2024 final BPS data) */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      Sumber: BPS Sirusa (2020–2024)
                    </span>
                    <strong className="text-xs font-black text-slate-900">
                      Tingkat Kemantapan Jalan ({selectedYear})
                    </strong>
                  </div>

                  {/* Year Tabs */}
                  <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-[5px] border border-slate-200 text-[10px] font-bold font-mono">
                    {[2020, 2021, 2022, 2023, 2024].map((yr) => (
                      <button
                        key={yr}
                        onClick={() => setSelectedYear(yr)}
                        className={`px-1.5 py-0.5 rounded-[3px] transition-colors cursor-pointer ${
                          selectedYear === yr
                            ? "bg-[#c2410c] text-white"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Populated Bar Visualizer with Clear Values Above Bars */}
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
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight uppercase block">
                  Rekapitulasi Koridor Pilot
                </span>
                <span className="text-[10px] text-slate-500">
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
                <tbody className="divide-y divide-slate-100 font-sans">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1.5">
                      <span className="font-bold text-slate-900 block text-xs">KemenPUPR (BBPJN)</span>
                      <span className="text-[10px] text-slate-500 font-semibold font-mono">JALAN NASIONAL</span>
                    </td>
                    <td className="py-1.5 text-center font-mono font-bold text-slate-700">1</td>
                    <td className="py-1.5 text-right font-mono font-bold text-slate-900">Rp 8,45 M</td>
                    <td className="py-1.5 text-right font-mono text-emerald-700 font-bold">0</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1.5">
                      <span className="font-bold text-slate-900 block text-xs">DBMPR Jawa Barat</span>
                      <span className="text-[10px] text-amber-800 font-semibold font-mono">JALAN PROVINSI</span>
                    </td>
                    <td className="py-1.5 text-center font-mono font-bold text-slate-700">2</td>
                    <td className="py-1.5 text-right font-mono font-bold text-slate-900">Rp 15,70 M</td>
                    <td className="py-1.5 text-right font-mono text-rose-600 font-bold">1 Tiket</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1.5">
                      <span className="font-bold text-slate-900 block text-xs">Dinas PUPR Depok</span>
                      <span className="text-[10px] text-orange-800 font-semibold font-mono">JALAN KAB / KOTA</span>
                    </td>
                    <td className="py-1.5 text-center font-mono font-bold text-slate-700">3</td>
                    <td className="py-1.5 text-right font-mono font-bold text-slate-900">Rp 11,65 M</td>
                    <td className="py-1.5 text-right font-mono text-rose-600 font-bold">1 Tiket</td>
                  </tr>

                  <tr className="bg-slate-50/90 font-bold border-t border-slate-200">
                    <td className="py-1.5 text-slate-900 text-xs uppercase font-mono">Total Pilot</td>
                    <td className="py-1.5 text-center font-mono text-slate-900">6 Ruas</td>
                    <td className="py-1.5 text-right font-mono text-emerald-800">Rp 35,80 M</td>
                    <td className="py-1.5 text-right font-mono text-rose-600">2 Melewati Tenggat</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SLA Alert Strip with Responsible Legal Context */}
            <div className="p-2 rounded-[5px] bg-orange-50/80 border border-orange-200/90 text-[10px] text-orange-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
              <span>2 laporan pilot telah melewati tenggat pemantauan respons (14 hari kerja).</span>
              <button
                onClick={() => {
                  if (onOpenOmbudsmanDraft) {
                    const firstOverdue = reports.find((r) => r.status === "OVERDUE");
                    if (firstOverdue) onOpenOmbudsmanDraft(firstOverdue);
                  }
                }}
                className="font-bold text-[#c2410c] hover:underline font-mono shrink-0 cursor-pointer"
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
              <span className="font-black text-xs sm:text-sm text-slate-900 tracking-tight uppercase font-mono">
                Tabel Penelusuran Ruas & Anggaran APBD
              </span>
              <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {searchResults.matchedRoads.length} Ruas Terdata
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <button
                onClick={onExploreData}
                className="px-3 py-1 rounded-[5px] bg-slate-100 hover:bg-orange-50 hover:text-orange-900 text-slate-700 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-orange-700" />
                <span>Penelusuran Anggaran Proyek</span>
              </button>
            </div>
          </div>

          {/* Clean, High-Density Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
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

                  const badgeClass =
                    road.authority === "NASIONAL"
                      ? "bg-slate-100 text-slate-800 border-slate-300"
                      : road.authority === "PROVINSI"
                      ? "bg-amber-50 text-amber-900 border-amber-200"
                      : "bg-orange-50 text-orange-900 border-orange-200";

                  const matchBadge =
                    road.budget?.matchConfidence === "TERKONFIRMASI"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200";

                  return (
                    <tr key={road.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Kode Ruas */}
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-600 text-[11px]">
                        {road.code}
                      </td>

                      {/* Nama Ruas Jalan */}
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{road.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {road.district} • {road.lengthKm} Km
                        </span>
                      </td>

                      {/* Status Wewenang & SK */}
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider border ${badgeClass} inline-block`}>
                          {road.authority}
                        </span>
                        <span className="block text-[10px] text-slate-500 truncate max-w-[200px] mt-0.5" title={road.legalBasis}>
                          {road.legalBasis.split(" tentang ")[0]}
                        </span>
                      </td>

                      {/* Status Pencocokan LPSE */}
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-[5px] text-[10px] font-bold border ${matchBadge}`}>
                          {road.budget?.matchConfidence === "TERKONFIRMASI" ? "Terkonfirmasi" : "Parsial"}
                        </span>
                      </td>

                      {/* Nilai Pagu vs Kontrak */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          Rp {(road.budget?.paguRp / 1000000000).toFixed(2)} M
                        </div>
                        <div className="text-[10px] font-mono text-emerald-700">
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

                      {/* Status Pemantauan Respons (14 Hari) */}
                      <td className="py-2.5 px-3 text-center">
                        {isOverdue ? (
                          <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Melewati Tenggat
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Terpantau
                          </span>
                        )}
                      </td>

                      {/* Aksi: Buka Detail Ruas */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedRoadForDetail(road)}
                          className="px-2.5 py-1 rounded-[5px] bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-[11px] transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Lihat Detail Ruas</span>
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
