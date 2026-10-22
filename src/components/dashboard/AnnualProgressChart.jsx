"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Coins,
} from "lucide-react";
import { ANNUAL_HISTORICAL_DATA } from "@/data/provincesData";

export default function AnnualProgressChart() {
  const [activeMetric, setActiveMetric] = useState("road-condition"); // 'road-condition' | 'complaints' | 'inpres'
  const [hoveredYear, setHoveredYear] = useState(2024);

  const { roadConditionTrends, complaintTrends, inpresBudgets } = ANNUAL_HISTORICAL_DATA;

  // Selected year data for active metric
  const selectedRoadData = roadConditionTrends.find((d) => d.year === hoveredYear) || roadConditionTrends[roadConditionTrends.length - 1];
  const selectedComplaintData = complaintTrends.find((d) => d.year === hoveredYear) || complaintTrends[complaintTrends.length - 1];
  const selectedInpresData = inpresBudgets.find((d) => d.year === hoveredYear) || inpresBudgets[inpresBudgets.length - 1];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Outer Bening Glassmorphic Container */}
      <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[5px] border border-slate-200/80 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.04)] relative overflow-hidden space-y-6">
        {/* Subtle Ambient Glow */}
        <div className="absolute -left-20 -top-20 w-72 h-72 bg-orange-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header & View Toggles */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-orange-700 font-mono mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Analisis Historis Tahunan • Sumber: BPS (Sirusa) & Ombudsman RI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Dinamika & Tren Perkembangan Kerusakan Jalan (2020 – 2024)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Memantau evolusi jurang ketimpangan jalan daerah vs nasional, lonjakan aduan masyarakat, dan eskalasi anggaran intervensi darurat pemerintah pusat.
            </p>
          </div>

          {/* Metric Selector Tabs (Bening Pill Buttons, rounded-[5px]) */}
          <div className="flex items-center p-1 rounded-[5px] bg-slate-100/80 border border-slate-200/80 text-xs font-semibold shrink-0">
            <button
              onClick={() => setActiveMetric("road-condition")}
              className={`px-3 py-2 rounded-[5px] transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMetric === "road-condition"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-orange-700" />
              <span>Jurang Kemantapan Ruas</span>
            </button>
            <button
              onClick={() => setActiveMetric("complaints")}
              className={`px-3 py-2 rounded-[5px] transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMetric === "complaints"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Aduan & Maladministrasi</span>
            </button>
            <button
              onClick={() => setActiveMetric("inpres")}
              className={`px-3 py-2 rounded-[5px] transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMetric === "inpres"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-orange-600" />
              <span>Intervensi APBN (IJD)</span>
            </button>
          </div>
        </div>

        {/* METRIC VIEW 1: JURANG KEMANTAPAN JALAN (2021-2026) */}
        {activeMetric === "road-condition" && (
          <div className="space-y-6 animate-fade-in">
            {/* SVG Interactive Multi-Line Diagram */}
            <div className="bg-slate-50/70 rounded-[5px] border border-slate-200/80 p-5 sm:p-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <span>Persentase Jalan Mantap Berdasarkan Status Wewenang (%):</span>
                </div>
                {/* Legend Chips */}
                <div className="flex items-center gap-3 text-[11px] font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-700" />
                    Jalan Nasional
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-600" />
                    Jalan Provinsi
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    Jalan Kabupaten/Kota
                  </span>
                </div>
              </div>

              {/* Chart Visualizer */}
              <div className="grid grid-cols-5 gap-2 sm:gap-4 items-end h-64 pt-6 pb-2 border-b border-slate-200">
                {roadConditionTrends.map((d) => {
                  const isHovered = d.year === hoveredYear;
                  return (
                    <div
                      key={d.year}
                      onMouseEnter={() => setHoveredYear(d.year)}
                      className={`h-full flex flex-col justify-end items-center gap-1.5 transition-all cursor-pointer group ${
                        isHovered ? "opacity-100" : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      {/* Bar Group for each Year */}
                      <div className="w-full max-w-[54px] flex items-end justify-center gap-1 h-48 bg-slate-200/40 rounded-t-[3px] p-1 relative">
                        {/* Bar 1: Jalan Nasional */}
                        <div
                          style={{ height: `${d.nasional}%` }}
                          className="w-1/3 bg-slate-700 rounded-t-xs transition-all relative group-hover:bg-slate-800"
                          title={`Nasional ${d.year}: ${d.nasional}%`}
                        />
                        {/* Bar 2: Jalan Provinsi */}
                        <div
                          style={{ height: `${d.provinsi}%` }}
                          className="w-1/3 bg-amber-600 rounded-t-xs transition-all relative group-hover:bg-amber-700"
                          title={`Provinsi ${d.year}: ${d.provinsi}%`}
                        />
                        {/* Bar 3: Jalan Kabupaten/Kota */}
                        <div
                          style={{ height: `${d.kabupatenKota}%` }}
                          className="w-1/3 bg-rose-500 rounded-t-xs transition-all relative group-hover:bg-rose-600"
                          title={`Kab/Kota ${d.year}: ${d.kabupatenKota}%`}
                        />

                        {/* Highlight Ring on Hover */}
                        {isHovered && (
                          <div className="absolute -top-3 px-1.5 py-0.5 rounded-[5px] bg-slate-900 text-white text-[9px] font-bold font-mono shadow-xs">
                            Gap {d.gap}%
                          </div>
                        )}
                      </div>

                      {/* Year Label */}
                      <span
                        className={`text-xs font-bold font-mono transition-colors ${
                          isHovered ? "text-orange-700 font-extrabold" : "text-slate-500"
                        }`}
                      >
                        {d.year}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Year Detail Snapshot Banner */}
              <div className="mt-4 p-4 rounded-[5px] bg-white/90 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-[5px] bg-orange-50 text-orange-800 border border-orange-200/80 font-mono font-bold text-sm">
                    {selectedRoadData.year}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Jurang Ketimpangan Jalan Daerah: <span className="text-rose-600">{selectedRoadData.gap}%</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Jalan nasional mencapai {selectedRoadData.nasional}% mantap, sedangkan jalan kabupaten/kota hanya {selectedRoadData.kabupatenKota}% mantap (hampir separuh rusak).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pusat</span>
                    <strong className="text-slate-800">{selectedRoadData.nasional}%</strong>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[10px] text-slate-400 block">Provinsi</span>
                    <strong className="text-amber-800">{selectedRoadData.provinsi}%</strong>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[10px] text-slate-400 block">Kab/Kota</span>
                    <strong className="text-rose-600">{selectedRoadData.kabupatenKota}%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* METRIC VIEW 2: ADUAN & PENUNDAAN BERLARUT */}
        {activeMetric === "complaints" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-50/70 rounded-[5px] border border-slate-200/80 p-5 sm:p-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="text-xs font-bold text-slate-700">
                  Volume Keluhan Jalan Rusak Masuk ke Pemda (SP4N-LAPOR! & Ombudsman):
                </div>
                <div className="flex items-center gap-3 text-[11px] font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    Tuntas Ditindaklanjuti
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-600" />
                    Overdue (&gt;14 Hari)
                  </span>
                </div>
              </div>

              {/* Stacked Visual Bar Diagram */}
              <div className="grid grid-cols-5 gap-2 sm:gap-4 items-end h-64 pt-6 pb-2 border-b border-slate-200">
                {complaintTrends.map((d) => {
                  const isHovered = d.year === hoveredYear;
                  const totalHeight = (d.totalComplaints / 20000) * 100;
                  const overdueHeight = (d.overdue / d.totalComplaints) * 100;

                  return (
                    <div
                      key={d.year}
                      onMouseEnter={() => setHoveredYear(d.year)}
                      className={`h-full flex flex-col justify-end items-center gap-1.5 transition-all cursor-pointer group ${
                        isHovered ? "opacity-100" : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      {/* Bar Stack */}
                      <div
                        style={{ height: `${totalHeight}%` }}
                        className="w-full max-w-[48px] rounded-t-[3px] overflow-hidden flex flex-col justify-end shadow-xs transition-all relative"
                      >
                        {/* Overdue portion */}
                        <div
                          style={{ height: `${overdueHeight}%` }}
                          className="w-full bg-rose-600 group-hover:bg-rose-700 transition-colors"
                          title={`Overdue ${d.year}: ${d.overdue.toLocaleString("id-ID")}`}
                        />
                        {/* Resolved portion */}
                        <div
                          style={{ height: `${100 - overdueHeight}%` }}
                          className="w-full bg-emerald-500 group-hover:bg-emerald-600 transition-colors"
                          title={`Ditindaklanjuti ${d.year}: ${d.resolved.toLocaleString("id-ID")}`}
                        />
                      </div>

                      <span
                        className={`text-xs font-bold font-mono transition-colors ${
                          isHovered ? "text-orange-700 font-extrabold" : "text-slate-500"
                        }`}
                      >
                        {d.year}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Snapshot Detail */}
              <div className="mt-4 p-4 rounded-[5px] bg-white/90 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-[5px] bg-rose-50 text-rose-700 font-mono font-bold text-sm">
                    {selectedComplaintData.year}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Total {selectedComplaintData.totalComplaints.toLocaleString("id-ID")} Aduan Masuk
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Sebanyak {selectedComplaintData.overdue.toLocaleString("id-ID")} aduan ({selectedComplaintData.overduePct}%) mengalami penundaan berlarut tanpa respon resmi dalam 14 hari kerja.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tuntas</span>
                    <strong className="text-emerald-600">{selectedComplaintData.resolved.toLocaleString("id-ID")}</strong>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[10px] text-slate-400 block">Overdue</span>
                    <strong className="text-rose-600">{selectedComplaintData.overdue.toLocaleString("id-ID")}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* METRIC VIEW 3: INTERVENSI ANGGARAN INPRES JALAN (APBN) */}
        {activeMetric === "inpres" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-50/70 rounded-[5px] border border-slate-200/80 p-5 sm:p-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="text-xs font-bold text-slate-700">
                  Evolusi Alokasi Anggaran Inpres Jalan Daerah (IJD) oleh Pemerintah Pusat (Triliun Rupiah):
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Landasan: Inpres No. 3 Tahun 2023
                </div>
              </div>

              {/* Progress Bars for Inpres */}
              <div className="space-y-3.5 pt-2">
                {inpresBudgets.map((item) => {
                  const widthPercent = (item.budgetTrillion / 20) * 100;
                  return (
                    <div key={item.year} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 font-mono">Tahun {item.year}</span>
                        <span className="font-extrabold text-orange-700 font-mono text-sm">
                          Rp {item.budgetTrillion} Triliun
                        </span>
                      </div>
                      <div className="w-full h-4 bg-slate-200 rounded-[4px] overflow-hidden p-0.5">
                        <div
                          style={{ width: `${widthPercent}%` }}
                          className="h-full bg-gradient-to-r from-orange-600 to-amber-600 rounded-[3px] transition-all duration-700"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Realisasi Rekonstruksi: <strong>{item.realizedKm.toLocaleString("id-ID")} Km</strong></span>
                        <span>Cakupan: <strong>{item.targetProvinces} Provinsi</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 p-3.5 rounded-[5px] bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Catatan Kebijakan:</strong> Tingginya kucuran dana Inpres Jalan Daerah (mencapai Rp 18,2 Triliun pada 2026) menunjukkan bahwa APBN terpaksa melakukan intervensi langsung karena APBD pemda kerap mengalami defisit atau minim political will dalam pemeliharaan jalan berkala.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
