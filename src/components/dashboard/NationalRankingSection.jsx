"use client";

import React, { useState, useMemo } from "react";
import { PROVINCES_DATA, NATIONAL_STATS } from "@/data/provincesData";
import {
  BarChart3,
  Search,
  ArrowUpRight,
  Info,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function NationalRankingSection({ onSelectPilot }) {
  const [selectedIsland, setSelectedIsland] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("complaints"); // "complaints" | "damaged" | "inpres"
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"

  const islands = [
    { id: "ALL", label: "Semua Wilayah" },
    { id: "Jawa", label: "Jawa" },
    { id: "Sumatera", label: "Sumatera" },
    { id: "Kalimantan", label: "Kalimantan" },
    { id: "Sulawesi", label: "Sulawesi" },
    { id: "Nusa Tenggara", label: "Nusa Tenggara" },
    { id: "Papua", label: "Papua" },
  ];

  // Filter & Sort Logic
  const filteredAndSortedProvinces = useMemo(() => {
    return PROVINCES_DATA.filter((prov) => {
      const matchIsland = selectedIsland === "ALL" || prov.island === selectedIsland;
      const matchSearch =
        prov.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prov.capital.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prov.island.toLowerCase().includes(searchQuery.toLowerCase());
      return matchIsland && matchSearch;
    }).sort((a, b) => {
      if (sortBy === "damaged") {
        return b.damagedPercentage - a.damagedPercentage;
      }
      if (sortBy === "inpres") {
        return b.inpresAllocationMiliar - a.inpresAllocationMiliar;
      }
      return a.complaintRank - b.complaintRank;
    });
  }, [selectedIsland, searchQuery, sortBy]);

  return (
    <section id="papan-skor-nasional" className="pt-1 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
      {/* MODERN CONTROL BAR: SEARCH, ISLAND TABS, SORT, & VIEW SWITCHER (FLOATING PILL ISLAND) */}
      <div className="bg-slate-100/70 p-2 sm:p-2.5 rounded-[8px] ring-1 ring-orange-200/50 space-y-2.5 font-sans">
        
        {/* Row 1: Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari provinsi atau ibukota (misal: Jawa Barat, Medan, Papua)..."
              className="w-full pl-9 pr-7 py-2 rounded-[6px] bg-white ring-1 ring-orange-200/50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Controls: Sort Dropdown & View Mode Switcher */}
          <div className="flex items-center gap-2 justify-end">
            
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-white ring-1 ring-orange-200/50 text-xs text-slate-500 shrink-0">
              <span className="hidden sm:inline text-[11px] font-medium text-slate-400">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="complaints">Volume Aduan Terbanyak</option>
                <option value="damaged">Jalan Rusak Tertinggi (% Non-Mantap)</option>
                <option value="inpres">Alokasi Inpres IJD Terbesar</option>
              </select>
            </div>

            {/* View Mode Toggle: Grid vs Table */}
            <div className="flex items-center rounded-[6px] ring-1 ring-orange-200/50 p-0.5 bg-white shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-[5px] transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#c2410c] text-white shadow-2xs font-bold"
                    : "text-slate-400 hover:text-slate-900"
                }`}
                title="Tampilan Kartu Wilayah"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-[5px] transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-[#c2410c] text-white shadow-2xs font-bold"
                    : "text-slate-400 hover:text-slate-900"
                }`}
                title="Tampilan Tabel Leaderboard"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Segmented Island Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1 border-t border-slate-200/60 text-xs font-sans">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mr-2 shrink-0">Gugus Pulau:</span>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {islands.map((island) => (
              <button
                key={island.id}
                onClick={() => setSelectedIsland(island.id)}
                className={`px-3 py-1 rounded-[6px] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedIsland === island.id
                    ? "bg-[#c2410c] text-white shadow-xs font-bold"
                    : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
                }`}
              >
                {island.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. MAIN DATA DISPLAY (GRID CARDS OR LEADERBOARD TABLE) */}
      {filteredAndSortedProvinces.length === 0 ? (
        <div className="bg-white rounded-[6px] ring-1 ring-orange-200/50 p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">Tidak ada provinsi yang cocok dengan pencarian.</p>
          <p className="text-xs text-slate-400">Silakan ubah filter gugus pulau atau kata kunci pencarian Anda.</p>
        </div>
      ) : viewMode === "grid" ? (
        
        /* ------------------------------------------------------------- */
        /* VIEW 1: MODERN FLUID CARDS (Clean, Elegant, Zero Box-in-Box)  */
        /* ------------------------------------------------------------- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 font-sans">
          {filteredAndSortedProvinces.map((prov) => {
            const isPilot = prov.activePilot;
            const mantapPct = (100 - prov.damagedPercentage).toFixed(1);

            return (
              <div
                key={prov.id}
                className={`bg-white rounded-[6px] p-4.5 transition-all flex flex-col justify-between gap-3.5 ${
                  isPilot
                    ? "ring-2 ring-orange-300 shadow-xs"
                    : "ring-1 ring-orange-200/50 hover:ring-orange-300 hover:shadow-xs"
                }`}
              >
                {/* Header: Rank, Province Name, & Pilot Status */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold font-sans tabular-nums text-slate-400 tracking-wider">
                        #{String(prov.complaintRank).padStart(2, "0")}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base font-heading tracking-tight leading-snug">
                        {prov.name}
                      </h3>
                    </div>

                    {isPilot && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[9.5px] font-bold text-[#c2410c] bg-orange-50 ring-1 ring-orange-200/60 uppercase tracking-wider font-sans shrink-0">
                        Wilayah Pilot
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ibukota: <strong className="font-medium text-slate-700">{prov.capital}</strong> • {prov.island}
                  </p>
                </div>

                {/* Kemantapan Jalan (BPS) with Sleek Progress Line */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Rasio Jalan Non-Mantap (BPS):</span>
                    <span className={`font-bold tabular-nums text-xs ${
                      prov.damagedPercentage > 45 ? "text-rose-600" : prov.damagedPercentage > 35 ? "text-[#c2410c]" : "text-amber-600"
                    }`}>
                      {prov.damagedPercentage}%
                    </span>
                  </div>
                  
                  {/* Thin Elegant Progress Line */}
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        prov.damagedPercentage > 45
                          ? "bg-rose-500"
                          : prov.damagedPercentage > 35
                          ? "bg-[#c2410c]"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min(prov.damagedPercentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 tabular-nums">
                    <span>Kemantapan: <strong className="text-slate-600 font-semibold">{mantapPct}%</strong></span>
                    <span>Total: {(prov.totalRoadKm).toLocaleString("id-ID")} Km</span>
                  </div>
                </div>

                {/* Integrated Financial Metric Strip (No Clunky Boxes!) */}
                <div className="py-2.5 px-3 rounded-[6px] bg-slate-50/70 ring-1 ring-orange-200/40 flex items-center justify-between text-center">
                  <div className="flex-1 text-left">
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Total Aduan</span>
                    <strong className="text-sm font-bold text-slate-900 tabular-nums">
                      {prov.totalComplaints.toLocaleString("id-ID")}
                    </strong>
                  </div>
                  <div className="h-6 w-px bg-slate-200/60 mx-2" />
                  <div className="flex-1 text-left">
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Lewat Batas</span>
                    <strong className="text-sm font-bold text-rose-600 tabular-nums">
                      {prov.overdueComplaints.toLocaleString("id-ID")}
                    </strong>
                  </div>
                  <div className="h-6 w-px bg-slate-200/60 mx-2" />
                  <div className="flex-1 text-right">
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Inpres IJD</span>
                    <strong className="text-sm font-bold text-emerald-800 tabular-nums">
                      Rp {prov.inpresAllocationMiliar} M
                    </strong>
                  </div>
                </div>

                {/* Status Context Summary */}
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                  {prov.statusSummary}
                </p>

                {/* Footer Action */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Kode BPS: {prov.code}</span>
                  {isPilot ? (
                    <button
                      onClick={onSelectPilot}
                      className="text-[#c2410c] hover:text-[#9a3412] hover:underline font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Buka Peta Pilot Jabar</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Data Agregat BPS</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        
        /* ------------------------------------------------------------- */
        /* VIEW 2: LEADERBOARD TABLE (High-Density, Bloomberg/IDX Style) */
        /* ------------------------------------------------------------- */
        <div className="bg-white rounded-[6px] ring-1 ring-orange-200/50 shadow-2xs overflow-hidden font-sans">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10.5px] text-slate-600 font-sans font-bold uppercase tracking-wider bg-slate-50/60">
                  <th className="py-2.5 px-3 font-bold text-center w-12">Rank</th>
                  <th className="py-2.5 px-3 font-bold">Provinsi &amp; Ibukota</th>
                  <th className="py-2.5 px-3 font-bold">Pulau</th>
                  <th className="py-2.5 px-3 font-bold text-right">Total Panjang (Km)</th>
                  <th className="py-2.5 px-3 font-bold text-center">Rasio Rusak (BPS)</th>
                  <th className="py-2.5 px-3 font-bold text-right">Total Aduan</th>
                  <th className="py-2.5 px-3 font-bold text-right">Lewat Batas Respons</th>
                  <th className="py-2.5 px-3 font-bold text-right">Alokasi Inpres</th>
                  <th className="py-2.5 px-3 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedProvinces.map((prov) => {
                  const isPilot = prov.activePilot;

                  return (
                    <tr
                      key={prov.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isPilot ? "bg-orange-50/30" : ""
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-2.5 px-3 text-center font-sans tabular-nums font-bold text-slate-500 text-xs">
                        #{String(prov.complaintRank).padStart(2, "0")}
                      </td>

                      {/* Nama Provinsi & Status */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <strong className="font-bold text-slate-900 text-xs sm:text-[13px]">{prov.name}</strong>
                          {isPilot && (
                            <span className="text-[9px] font-bold text-[#c2410c] bg-orange-50 px-1.5 py-0.2 rounded-[4px] ring-1 ring-orange-200/60 shrink-0">
                              Pilot
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block">Ibukota: {prov.capital}</span>
                      </td>

                      {/* Pulau */}
                      <td className="py-2.5 px-3 text-slate-600 text-xs">
                        {prov.island}
                      </td>

                      {/* Total Panjang */}
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 font-medium">
                        {(prov.totalRoadKm).toLocaleString("id-ID")} Km
                      </td>

                      {/* Rasio Kerusakan Jalan */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                            <div
                              className={`h-full ${
                                prov.damagedPercentage > 45 ? "bg-rose-500" : "bg-[#c2410c]"
                              }`}
                              style={{ width: `${Math.min(prov.damagedPercentage, 100)}%` }}
                            />
                          </div>
                          <span className={`font-bold tabular-nums text-xs ${
                            prov.damagedPercentage > 45 ? "text-rose-600" : "text-slate-800"
                          }`}>
                            {prov.damagedPercentage}%
                          </span>
                        </div>
                      </td>

                      {/* Total Aduan */}
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-900 font-bold">
                        {prov.totalComplaints.toLocaleString("id-ID")}
                      </td>

                      {/* Overdue SLA */}
                      <td className="py-2.5 px-3 text-right tabular-nums text-rose-600 font-bold">
                        {prov.overdueComplaints.toLocaleString("id-ID")}
                      </td>

                      {/* Alokasi Inpres */}
                      <td className="py-2.5 px-3 text-right tabular-nums text-emerald-800 font-bold">
                        Rp {prov.inpresAllocationMiliar} M
                      </td>

                      {/* Aksi */}
                      <td className="py-2.5 px-3 text-center">
                        {isPilot ? (
                          <button
                            onClick={onSelectPilot}
                            className="text-[#c2410c] hover:underline font-bold text-[11px] inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Buka Peta</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">BPS</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Summary Footer */}
          <div className="p-3 bg-slate-50/70 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Menampilkan <strong>{filteredAndSortedProvinces.length}</strong> dari 38 Provinsi se-Indonesia</span>
            <span className="text-[11px] text-slate-400">Sumber: BPS Sirusa 2024 &amp; Inpres No. 3/2023 (Tahap I)</span>
          </div>
        </div>
      )}
    </section>
  );
}
