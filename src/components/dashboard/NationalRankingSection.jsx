"use client";

import React, { useState, useMemo } from "react";
import { PROVINCES_DATA, NATIONAL_STATS } from "@/data/provincesData";
import {
  BarChart3,
  Search,
  ArrowUpRight,
  Info,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  X,
  MapPin,
  FileText,
  Coins,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/exportTransparencyData";

export default function NationalRankingSection({ onSelectPilot }) {
  const [selectedIsland, setSelectedIsland] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("complaints"); // "complaints" | "damaged" | "inpres"
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [selectedProvince, setSelectedProvince] = useState(null);

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

  const provinceExportColumns = useMemo(
    () => [
      {
        header: "Rank",
        align: "center",
        mono: true,
        accessor: (prov) => `#${String(prov.complaintRank).padStart(2, "0")}`,
      },
      { header: "Kode BPS", key: "code", align: "center", mono: true },
      { header: "Provinsi", key: "name" },
      { header: "Ibukota", key: "capital" },
      { header: "Gugus Pulau", key: "island" },
      {
        header: "Total Panjang Jalan (KM)",
        type: "number",
        align: "right",
        accessor: (prov) => Number(prov.totalRoadKm || 0).toLocaleString("id-ID"),
      },
      {
        header: "Kemantapan (%)",
        type: "number",
        align: "right",
        accessor: (prov) => `${(100 - prov.damagedPercentage).toFixed(1)}%`,
      },
      {
        header: "Non-Mantap / Rusak (%)",
        type: "number",
        align: "right",
        accessor: (prov) => `${prov.damagedPercentage}%`,
      },
      {
        header: "Total Aduan",
        type: "number",
        align: "right",
        accessor: (prov) => Number(prov.totalComplaints || 0).toLocaleString("id-ID"),
      },
      {
        header: "Lewat Batas",
        type: "number",
        align: "right",
        accessor: (prov) => Number(prov.overdueComplaints || 0).toLocaleString("id-ID"),
      },
      {
        header: "Alokasi Inpres IJD (Rp Miliar)",
        type: "currency",
        align: "right",
        accessor: (prov) => `Rp ${prov.inpresAllocationMiliar} M`,
      },
    ],
    []
  );

  const handleExportProvincesExcel = () => {
    exportToExcel({
      filename: "Laporan_Transparansi_38_Provinsi_JagaJalan",
      sheetName: "Data 38 Provinsi",
      title: "LAPORAN TRANSPARANSI KEMANTAPAN JALAN & INPRES IJD 38 PROVINSI — JAGAJALAN",
      subtitle: `Wilayah: ${selectedIsland === "ALL" ? "Seluruh Indonesia (38 Provinsi)" : selectedIsland} • Sumber: BPS SIRUSA & Kementerian PU`,
      summaryMetrics: [
        { label: "Cakupan Provinsi", value: `${filteredAndSortedProvinces.length} Provinsi` },
        { label: "Total Jaringan Jalan", value: NATIONAL_STATS?.totalNationalRoadKm || "548.420 KM" },
        { label: "Alokasi Inpres IJD", value: "Rp 29,9 Triliun (Tahap I & II)" },
        { label: "Sumber Data Resmi", value: "BPS SIRUSA & Satu Data PU" },
      ],
      columns: provinceExportColumns,
      rows: filteredAndSortedProvinces,
    });
  };

  const handleExportProvincesPDF = () => {
    exportToPDF({
      title: "Laporan Transparansi Kondisi Jalan & Alokasi Inpres 38 Provinsi",
      subtitle: `Komparasi Kemantapan Jalan Daerah, Volume Aduan Publik, dan Dana Inpres No. 3/2023 (${selectedIsland === "ALL" ? "Seluruh Indonesia" : selectedIsland})`,
      documentCode: "JGJ-NAS-38PROV",
      orientation: "landscape",
      summaryMetrics: [
        {
          label: "Provinsi Terdata",
          value: `${filteredAndSortedProvinces.length} Provinsi`,
          sub: "Basis Data Agregat Nasional",
        },
        {
          label: "Dana Inpres Jalan Daerah",
          value: "Rp 29,9 Triliun",
          sub: "Inpres No. 3 Tahun 2023",
        },
        {
          label: "Aduan Pemda (Ombudsman)",
          value: "4.766 Laporan",
          sub: "Substansi Infrastruktur Tertinggi",
        },
        {
          label: "Rujukan Data",
          value: "BPS & KemenPU",
          sub: "Publikasi Statistik Resmi",
        },
      ],
      columns: provinceExportColumns,
      rows: filteredAndSortedProvinces,
    });
  };

  return (
    <section id="papan-skor-nasional" className="pt-1 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 font-sans">
      {/* 1. MODERN CONTROL BAR: SEARCH, ISLAND TABS, SORT, & VIEW SWITCHER */}
      <div className="bg-slate-100/70 p-2 sm:p-2.5 rounded-[8px] ring-1 ring-orange-200/50 space-y-2.5">
        
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
              placeholder="Cari provinsi atau ibukota (misal: Sumatera Utara, Medan, Jawa)..."
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

          {/* Right Controls: Export Buttons, Sort Dropdown & View Mode Switcher */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={handleExportProvincesExcel}
              title="Unduh Data 38 Provinsi dalam format Microsoft Excel (.xls)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80 text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Unduh Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportProvincesPDF}
              title="Unduh Laporan Transparansi 38 Provinsi dalam format PDF"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-orange-50 hover:bg-orange-100 text-[#9a3412] ring-1 ring-orange-200/80 text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-[#c2410c]" />
              <span>Unduh PDF</span>
            </button>
            
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-white ring-1 ring-orange-200/50 text-xs text-slate-500 shrink-0">
              <span className="hidden sm:inline text-[11px] font-medium text-slate-400">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="complaints">Volume Aduan Terbanyak</option>
                <option value="damaged">Persentase Jalan Rusak Tertinggi</option>
                <option value="inpres">Alokasi Inpres IJD Terbesar</option>
              </select>
            </div>

            {/* View Mode Toggle (Grid vs Table) */}
            <div className="flex items-center bg-white p-0.5 rounded-[6px] ring-1 ring-orange-200/50 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Tampilan Kartu Ringkas"
                className={`p-1.5 rounded-[5px] transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#c2410c] text-white shadow-2xs"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Tampilan Tabel Padat"
                className={`p-1.5 rounded-[5px] transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-[#c2410c] text-white shadow-2xs"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Island Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 scrollbar-none text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0 mr-1 hidden sm:inline">
            Gugus Pulau:
          </span>
          <div className="flex items-center gap-1 flex-nowrap">
            {islands.map((island) => (
              <button
                key={island.id}
                onClick={() => setSelectedIsland(island.id)}
                className={`px-3 py-1 rounded-[5px] text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedIsland === island.id
                    ? "bg-[#c2410c] text-white shadow-2xs"
                    : "bg-white text-slate-600 ring-1 ring-orange-200/40 hover:bg-orange-50/50 hover:text-[#c2410c]"
                }`}
              >
                {island.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN DATA DISPLAY (COMPACT GLANCEABLE CARDS OR TABLE) */}
      {filteredAndSortedProvinces.length === 0 ? (
        <div className="bg-white rounded-[6px] ring-1 ring-orange-200/50 p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">Tidak ada provinsi yang cocok dengan pencarian.</p>
          <p className="text-xs text-slate-400">Silakan ubah filter gugus pulau atau kata kunci pencarian Anda.</p>
        </div>
      ) : viewMode === "grid" ? (
        
        /* ------------------------------------------------------------- */
        /* VIEW 1: COMPACT GLANCEABLE CARDS (Clean, Fast, Zero Slop)    */
        /* ------------------------------------------------------------- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAndSortedProvinces.map((prov) => {
            const isPilot = prov.activePilot;
            const mantapPct = (100 - prov.damagedPercentage).toFixed(1);

            return (
              <div
                key={prov.id}
                onClick={() => setSelectedProvince(prov)}
                className={`bg-white rounded-[6px] p-4 transition-all flex flex-col justify-between gap-3 cursor-pointer group ${
                  isPilot
                    ? "ring-2 ring-orange-400/80 shadow-xs bg-orange-50/10 hover:ring-orange-500"
                    : "ring-1 ring-orange-200/50 hover:ring-orange-300 hover:shadow-xs"
                }`}
              >
                {/* Header: Rank, Province Name, & Pilot Status */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-baseline gap-2 truncate">
                      <span className="text-xs font-bold font-sans tabular-nums text-slate-400 tracking-wider">
                        #{String(prov.complaintRank).padStart(2, "0")}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base font-heading tracking-tight leading-snug group-hover:text-[#c2410c] transition-colors truncate">
                        {prov.name}
                      </h3>
                    </div>

                    {isPilot ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[9.5px] font-bold text-[#c2410c] bg-orange-50 ring-1 ring-orange-200/70 uppercase tracking-wider shrink-0">
                        Wilayah Pilot
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {prov.island}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ibukota: <strong className="font-medium text-slate-700">{prov.capital}</strong>
                  </p>
                </div>

                {/* Kemantapan Jalan (BPS) with Sleek Progress Line */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Kemantapan Jalan:</span>
                    <span className="font-bold tabular-nums text-xs text-slate-800">
                      {mantapPct}% Mantap
                    </span>
                  </div>
                  
                  {/* Thin Dual-Tone Progress Line */}
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        prov.damagedPercentage > 45
                          ? "bg-amber-600"
                          : prov.damagedPercentage > 35
                          ? "bg-[#c2410c]"
                          : "bg-emerald-600"
                      }`}
                      style={{ width: `${Math.max(10, 100 - prov.damagedPercentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 tabular-nums">
                    <span>Non-Mantap: <strong className={prov.damagedPercentage > 45 ? "text-rose-600 font-semibold" : "text-slate-600 font-semibold"}>{prov.damagedPercentage}%</strong></span>
                    <span>Total: {(prov.totalRoadKm).toLocaleString("id-ID")} Km</span>
                  </div>
                </div>

                {/* 2 Core Financial & Public Metrics (Clean, Non-Clunky) */}
                <div className="grid grid-cols-2 gap-2 py-2 px-2.5 rounded-[5px] bg-slate-50/70 ring-1 ring-orange-200/40 text-xs">
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-semibold uppercase tracking-wider block">Total Aduan</span>
                    <strong className="text-xs sm:text-[13px] font-bold text-slate-900 tabular-nums">
                      {prov.totalComplaints.toLocaleString("id-ID")}
                    </strong>
                  </div>
                  <div className="border-l border-slate-200/60 pl-2">
                    <span className="text-[9.5px] text-slate-400 font-semibold uppercase tracking-wider block">Inpres IJD</span>
                    <strong className="text-xs sm:text-[13px] font-bold text-emerald-800 tabular-nums">
                      Rp {prov.inpresAllocationMiliar} M
                    </strong>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Kode BPS: {prov.code}</span>
                  {isPilot ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectPilot) onSelectPilot();
                      }}
                      className="text-[#c2410c] hover:text-[#9a3412] font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Buka Peta Medan</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-medium group-hover:text-[#c2410c] transition-colors inline-flex items-center gap-0.5">
                      Lihat Rincian <ChevronRight className="w-3 h-3" />
                    </span>
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
        <div className="bg-white rounded-[6px] ring-1 ring-orange-200/50 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10.5px] text-slate-600 font-sans font-bold uppercase tracking-wider bg-slate-50/60">
                  <th className="py-2.5 px-3 font-bold text-center w-12">Rank</th>
                  <th className="py-2.5 px-3 font-bold">Provinsi &amp; Ibukota</th>
                  <th className="py-2.5 px-3 font-bold">Pulau</th>
                  <th className="py-2.5 px-3 font-bold text-right">Total Panjang</th>
                  <th className="py-2.5 px-3 font-bold text-center">Kemantapan</th>
                  <th className="py-2.5 px-3 font-bold text-right">Total Aduan</th>
                  <th className="py-2.5 px-3 font-bold text-right">Lewat Batas</th>
                  <th className="py-2.5 px-3 font-bold text-right">Alokasi Inpres</th>
                  <th className="py-2.5 px-3 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedProvinces.map((prov) => {
                  const isPilot = prov.activePilot;
                  const mantapPct = (100 - prov.damagedPercentage).toFixed(1);

                  return (
                    <tr
                      key={prov.id}
                      onClick={() => setSelectedProvince(prov)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
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

                      {/* Rasio Kemantapan Jalan */}
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-bold tabular-nums text-xs text-slate-800">
                          {mantapPct}%
                        </span>
                        <span className="text-[10px] text-slate-400 block tabular-nums">
                          Rusak: {prov.damagedPercentage}%
                        </span>
                      </td>

                      {/* Total Aduan */}
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-900 font-bold">
                        {prov.totalComplaints.toLocaleString("id-ID")}
                      </td>

                      {/* Overdue */}
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
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectPilot) onSelectPilot();
                            }}
                            className="text-[#c2410c] hover:underline font-bold text-[11px] inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Peta Medan</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProvince(prov);
                            }}
                            className="text-slate-500 hover:text-[#c2410c] text-[11px] font-medium cursor-pointer"
                          >
                            Detail
                          </button>
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
            <span className="text-[11px] text-slate-400">Sumber: BPS SIRUSA 2024 &amp; Inpres No. 3/2023 (Tahap I)</span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. MODAL DETAIL PROVINSI (INTERACTIVE MASTER-DETAIL DRAWER)    */}
      {/* ------------------------------------------------------------- */}
      {selectedProvince && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="max-w-xl w-full rounded-[8px] bg-slate-100/80 p-2 sm:p-2.5 ring-1 ring-orange-200/60 shadow-2xl">
            <div className="bg-white rounded-[6px] w-full overflow-hidden ring-1 ring-orange-200/50 max-h-[90vh] flex flex-col">
              
              {/* Header Modal */}
              <div className="flex items-center justify-between bg-[#c2410c] text-white px-5 py-4">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-[6px] bg-white/15 flex items-center justify-center text-white shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white truncate">
                        {selectedProvince.name}
                      </h3>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/20 text-orange-100 shrink-0">
                        Rank #{selectedProvince.complaintRank}
                      </span>
                    </div>
                    <span className="text-[11px] text-orange-100 block truncate">
                      Ibukota: {selectedProvince.capital} • Wilayah {selectedProvince.island} • Kode BPS: {selectedProvince.code}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProvince(null)}
                  className="p-1.5 rounded-[6px] text-orange-100 hover:text-white hover:bg-white/15 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-600 leading-relaxed overflow-y-auto">
                
                {/* 1. Status Summary Callout */}
                <div className="p-3.5 rounded-[6px] bg-orange-50/40 ring-1 ring-orange-200/50 text-slate-800">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#c2410c] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-semibold mb-0.5">
                        Karakteristik &amp; Dinamika Wilayah (BPS):
                      </strong>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans">
                        {selectedProvince.statusSummary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Key Metrics Grid */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-sans">
                    Ringkasan Statistik Infrastruktur (BPS SIRUSA)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="p-3 rounded-[6px] bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 block font-medium">Total Panjang Jalan</span>
                      <strong className="text-sm font-bold text-slate-900 tabular-nums">
                        {selectedProvince.totalRoadKm.toLocaleString("id-ID")} Km
                      </strong>
                    </div>

                    <div className="p-3 rounded-[6px] bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 block font-medium">Kondisi Mantap (BPS)</span>
                      <strong className="text-sm font-bold text-emerald-800 tabular-nums">
                        {(100 - selectedProvince.damagedPercentage).toFixed(1)}%
                      </strong>
                      <span className="text-[10px] text-slate-400 block">Baik &amp; Sedang</span>
                    </div>

                    <div className="p-3 rounded-[6px] bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 block font-medium">Rasio Belum Mantap</span>
                      <strong className={`text-sm font-bold tabular-nums ${
                        selectedProvince.damagedPercentage > 45 ? "text-rose-600" : "text-amber-700"
                      }`}>
                        {selectedProvince.damagedPercentage}%
                      </strong>
                      <span className="text-[10px] text-slate-400 block">Rusak Ringan/Berat</span>
                    </div>

                    <div className="p-3 rounded-[6px] bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 block font-medium">Total Aduan Publik</span>
                      <strong className="text-sm font-bold text-slate-900 tabular-nums">
                        {selectedProvince.totalComplaints.toLocaleString("id-ID")}
                      </strong>
                    </div>

                    <div className="p-3 rounded-[6px] bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 block font-medium">Lewat Waktu Acuan</span>
                      <strong className="text-sm font-bold text-rose-600 tabular-nums">
                        {selectedProvince.overdueComplaints.toLocaleString("id-ID")}
                      </strong>
                    </div>

                    <div className="p-3 rounded-[6px] bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 block font-medium">Alokasi Inpres IJD</span>
                      <strong className="text-sm font-bold text-emerald-800 tabular-nums">
                        Rp {selectedProvince.inpresAllocationMiliar} M
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 3. Visual Breakdown Progress Bar */}
                <div className="p-3 rounded-[6px] bg-slate-50/80 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-slate-600 font-medium">Proporsi Kemantapan Fisik Jalan:</span>
                    <span className="font-bold text-slate-900">
                      {(100 - selectedProvince.damagedPercentage).toFixed(1)}% Mantap
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-rose-200 overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${100 - selectedProvince.damagedPercentage}%` }}
                      title={`Mantap: ${(100 - selectedProvince.damagedPercentage).toFixed(1)}%`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-sans">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      Mantap (Baik &amp; Sedang)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-300" />
                      Belum Mantap (Rusak Ringan &amp; Berat)
                    </span>
                  </div>
                </div>

                {/* 4. Pilot Area Guidance */}
                {selectedProvince.activePilot ? (
                  <div className="p-3.5 rounded-[6px] bg-amber-50/60 ring-1 ring-amber-300/80 text-amber-900 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#c2410c] shrink-0" />
                      <strong className="text-xs font-bold text-slate-900">
                        Wilayah Percontohan Nasional (Deep-Dive Pilot Project)
                      </strong>
                    </div>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed font-sans">
                      Provinsi Sumatera Utara (khususnya Kota Medan dan sekitarnya) telah terintegrasi penuh dengan <strong>peta geospasial mikro GIS</strong>, sebaran titik foto kerusakan jalan berkoordinat, klasifikasi AI, serta transparansi kontrak pemeliharaan berkala SiRUP/LPSE.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic font-sans">
                    * Catatan: Data mikro ruas jalan berkoordinat dan titik laporan berfoto saat ini difokuskan pada Wilayah Percontohan (Sumatera Utara / Kota Medan). Wilayah ini menyajikan data agregasi resmi BPS SIRUSA.
                  </p>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
                  Sumber: BPS SIRUSA &amp; Inpres No. 3/2023
                </span>

                <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedProvince(null)}
                    className="px-3.5 py-1.5 rounded-[6px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>

                  {selectedProvince.activePilot && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProvince(null);
                        if (onSelectPilot) onSelectPilot();
                      }}
                      className="px-4 py-1.5 rounded-[6px] bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                    >
                      <span>Buka Peta Medan</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
}
