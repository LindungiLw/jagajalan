"use client";

import React, { useState } from "react";
import { PROVINCES_DATA, NATIONAL_STATS } from "@/data/provincesData";
import { BarChart3, AlertCircle, ArrowUpRight, Info } from "lucide-react";

export default function NationalRankingSection({ onSelectPilot }) {
  const [selectedIsland, setSelectedIsland] = useState("ALL");

  const islands = ["ALL", "Jawa", "Sumatera", "Kalimantan", "Sulawesi", "Nusa Tenggara", "Papua"];

  const filteredProvinces = PROVINCES_DATA.filter((prov) => {
    if (selectedIsland === "ALL") return true;
    return prov.island === selectedIsland;
  }).sort((a, b) => a.complaintRank - b.complaintRank);

  return (
    <section id="papan-skor-nasional" className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-wider uppercase text-slate-500 font-mono mb-1">
            Data Agregat 38 Provinsi • Sumber: BPS & SP4N-LAPOR!
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
            Papan Skor Kemantapan Jalan & Sebaran Aduan Nasional
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl font-sans">
            Transparansi perbandingan rasio kerusakan jalan daerah serta sebaran volume keluhan masyarakat di seluruh provinsi Indonesia.
          </p>
        </div>

        {/* Why Pilot Card */}
        <div className="p-3.5 rounded-[5px] bg-slate-50 border border-slate-200 text-xs text-slate-700 max-w-sm">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold mb-1">
            <Info className="w-3.5 h-3.5 shrink-0 text-orange-600" />
            <span>Cakupan Wilayah Pilot Terverifikasi</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
            Koridor Jawa Barat & Bodetabek dipilih berdasarkan kelengkapan keterbukaan APBD, portal LPSE, serta keragaman status ruas jalan yang dapat diverifikasi secara faktual.
          </p>
        </div>
      </div>

      {/* Island Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium font-sans">
        <span className="text-slate-400 mr-1 hidden sm:inline">Wilayah Pulau:</span>
        {islands.map((island) => (
          <button
            key={island}
            onClick={() => setSelectedIsland(island)}
            className={`px-3 py-1.5 rounded-[5px] transition-all cursor-pointer ${
              selectedIsland === island
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {island === "ALL" ? "Semua Wilayah" : island}
          </button>
        ))}
      </div>

      {/* Grid of Provinces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProvinces.map((prov) => {
          const isPilot = prov.activePilot;

          return (
            <div
              key={prov.id}
              className={`bg-white p-5 rounded-[5px] border transition-all ${
                isPilot
                  ? "border-orange-400 shadow-sm ring-2 ring-orange-400/20"
                  : "border-slate-200 hover:border-slate-300 shadow-xs"
              }`}
            >
              {/* Header Card */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-[5px] bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      #{prov.complaintRank}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base font-heading">{prov.name}</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-sans">Ibukota: {prov.capital} • {prov.island}</p>
                </div>

                {isPilot && (
                  <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200 font-mono">
                    WILAYAH PILOT
                  </span>
                )}
              </div>

              {/* Progress bar % Damaged */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
                  <span className="text-slate-500 text-[11px]">Rasio Jalan Rusak / Non-Mantap:</span>
                  <span className={`font-bold tabular-nums ${prov.damagedPercentage > 40 ? "text-rose-600" : "text-amber-600"}`}>
                    {prov.damagedPercentage}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-[5px] bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-[5px] ${
                      prov.damagedPercentage > 40
                        ? "bg-rose-500"
                        : "bg-orange-500"
                    }`}
                    style={{ width: `${Math.min(prov.damagedPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-[5px] bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-sans">Total Aduan Masuk:</span>
                  <strong suppressHydrationWarning className="text-slate-900 text-sm font-bold font-sans tabular-nums">
                    {prov.totalComplaints.toLocaleString()}
                  </strong>
                </div>
                <div className="p-2.5 rounded-[5px] bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-sans">Aduan Overdue SLA:</span>
                  <strong suppressHydrationWarning className="text-rose-600 text-sm font-bold font-sans tabular-nums">
                    {prov.overdueComplaints.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Status Summary */}
              <p className="mt-3 text-[11px] text-slate-600 leading-relaxed line-clamp-2 font-sans">
                {prov.statusSummary}
              </p>

              {/* Inpres allocation & Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] font-sans">
                  <span className="text-slate-400 block text-[10px]">Alokasi Inpres (IJD):</span>
                  <strong className="text-slate-900 font-bold tabular-nums">Rp {prov.inpresAllocationMiliar} Miliar</strong>
                </div>

                {isPilot ? (
                  <button
                    onClick={onSelectPilot}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[5px] bg-[#c2410c] text-white text-xs font-semibold hover:bg-[#9a3412] shadow-xs transition-colors cursor-pointer font-sans"
                  >
                    <span>Buka Peta Pilot</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 italic font-sans">Data Agregat BPS</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
