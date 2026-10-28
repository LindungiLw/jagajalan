"use client";

import React, { useState, useMemo } from "react";
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
  const [chartViewMode, setChartViewMode] = useState("line"); // 'line' | 'bar'
  const [hoveredYear, setHoveredYear] = useState(2024);

  const { roadConditionTrends, complaintTrends, inpresBudgets } = ANNUAL_HISTORICAL_DATA;

  // Selected year data for active metric
  const selectedRoadData = roadConditionTrends.find((d) => d.year === hoveredYear) || roadConditionTrends[roadConditionTrends.length - 1];
  const selectedComplaintData = complaintTrends.find((d) => d.year === hoveredYear) || complaintTrends[complaintTrends.length - 1];
  const selectedInpresData = inpresBudgets.find((d) => d.year === hoveredYear) || inpresBudgets[inpresBudgets.length - 1];

  // SVG Coordinates for Line Chart (viewBox: 0 0 640 220)
  const linePoints = useMemo(() => {
    return roadConditionTrends.map((d, i) => {
      const x = 45 + (i / 4) * 550;
      const yNasional = 30 + ((100 - d.nasional) / 60) * 160;
      const yProvinsi = 30 + ((100 - d.provinsi) / 60) * 160;
      const yKabKota = 30 + ((100 - d.kabupatenKota) / 60) * 160;
      return { year: d.year, x, yNasional, yProvinsi, yKabKota, raw: d };
    });
  }, [roadConditionTrends]);

  const pathNasional = linePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yNasional}`).join(" ");
  const pathProvinsi = linePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yProvinsi}`).join(" ");
  const pathKabKota = linePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yKabKota}`).join(" ");

  // Disparity Area Polygon between Nasional & Kab/Kota
  const disparityPolygon = [
    ...linePoints.map((p) => `${p.x},${p.yNasional}`),
    ...[...linePoints].reverse().map((p) => `${p.x},${p.yKabKota}`),
  ].join(" ");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Outer Bening Glassmorphic Container */}
      <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden space-y-6">
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
            <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight">
              Dinamika & Tren Perkembangan Kerusakan Jalan (2020 – 2024)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Memantau evolusi jurang ketimpangan jalan daerah vs nasional, lonjakan aduan masyarakat, dan eskalasi anggaran intervensi darurat pemerintah pusat.
            </p>
          </div>

          {/* Metric Selector Tabs (Pill Tabs) */}
          <div className="flex items-center p-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-xs font-semibold shrink-0 shadow-2xs">
            <button
              onClick={() => setActiveMetric("road-condition")}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMetric === "road-condition"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-orange-700" />
              <span>Jurang Kemantapan Ruas</span>
            </button>
            <button
              onClick={() => setActiveMetric("complaints")}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMetric === "complaints"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Aduan & Maladministrasi</span>
            </button>
            <button
              onClick={() => setActiveMetric("inpres")}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMetric === "inpres"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-orange-600" />
              <span>Intervensi APBN (IJD)</span>
            </button>
          </div>
        </div>

        {/* METRIC VIEW 1: JURANG KEMANTAPAN JALAN (2020-2024) */}
        {activeMetric === "road-condition" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-5 sm:p-6 relative">
              
              {/* Header with Switcher: Line vs Bar Chart */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <span>Persentase Panjang Jalan Mantap Berdasarkan Status Wewenang (BPS Sirusa %):</span>
                </div>

                {/* View Switcher: Line Chart vs Bar Chart */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center p-0.5 rounded-[5px] bg-slate-200/80 border border-slate-300 text-[10px] font-bold">
                    <button
                      onClick={() => setChartViewMode("line")}
                      className={`px-2.5 py-1 rounded-[3px] transition-all cursor-pointer flex items-center gap-1 ${
                        chartViewMode === "line"
                          ? "bg-white text-[#c2410c] shadow-xs font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      title="Lihat dalam Grafik Garis Tren Kontinu"
                    >
                      <TrendingUp className="w-3 h-3" />
                      <span>Grafik Garis</span>
                    </button>
                    <button
                      onClick={() => setChartViewMode("bar")}
                      className={`px-2.5 py-1 rounded-[3px] transition-all cursor-pointer flex items-center gap-1 ${
                        chartViewMode === "bar"
                          ? "bg-white text-[#c2410c] shadow-xs font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      title="Lihat dalam Diagram Batang Komparatif"
                    >
                      <BarChart3 className="w-3 h-3" />
                      <span>Diagram Batang</span>
                    </button>
                  </div>

                  {/* Legend Chips */}
                  <div className="hidden md:flex items-center gap-3 text-[11px] font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                      Nasional
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                      Provinsi
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-[#c2410c]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#c2410c]" />
                      Kab/Kota
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. VIEW A: INTERACTIVE MULTI-LINE SVG CHART */}
              {chartViewMode === "line" ? (
                <div className="relative w-full overflow-x-auto">
                  <svg
                    viewBox="0 0 640 220"
                    className="w-full h-64 select-none"
                    style={{ minWidth: "520px" }}
                  >
                    <defs>
                      <linearGradient id="disparityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c2410c" stopOpacity="0.14" />
                        <stop offset="100%" stopColor="#c2410c" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>

                    {/* Y-Axis Gridlines & Reference Labels */}
                    {[100, 80, 60, 40].map((val) => {
                      const y = 30 + ((100 - val) / 60) * 160;
                      return (
                        <g key={val}>
                          <line
                            x1="45"
                            y1={y}
                            x2="595"
                            y2={y}
                            stroke="#e2e8f0"
                            strokeDasharray="3 3"
                            strokeWidth="1"
                          />
                          <text
                            x="40"
                            y={y + 3.5}
                            textAnchor="end"
                            fontSize="9"
                            fontFamily="monospace"
                            fill="#94a3b8"
                            fontWeight="bold"
                          >
                            {val}%
                          </text>
                        </g>
                      );
                    })}

                    {/* Disparity Band Area between Jalan Nasional and Jalan Kab/Kota */}
                    <polygon points={disparityPolygon} fill="url(#disparityGrad)" />

                    {/* Disparity Label in the middle */}
                    <text
                      x="320"
                      y="118"
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#9a3412"
                      opacity="0.8"
                    >
                      Jurang Ketimpangan Jalan Daerah (~36.3% - 38.4%)
                    </text>

                    {/* Multi-Line Curves */}
                    {/* Line 1: Jalan Nasional */}
                    <path
                      d={pathNasional}
                      fill="none"
                      stroke="#334155"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Line 2: Jalan Provinsi */}
                    <path
                      d={pathProvinsi}
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Line 3: Jalan Kabupaten/Kota (Main Civic Indicator) */}
                    <path
                      d={pathKabKota}
                      fill="none"
                      stroke="#c2410c"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Vertical Tracking Line & Interactive Markers */}
                    {linePoints.map((p) => {
                      const isHovered = p.year === hoveredYear;
                      return (
                        <g
                          key={p.year}
                          className="cursor-pointer group"
                          onMouseEnter={() => setHoveredYear(p.year)}
                        >
                          {/* Invisible hover capture rect */}
                          <rect
                            x={p.x - 30}
                            y="15"
                            width="60"
                            height="190"
                            fill="transparent"
                          />

                          {/* Vertical Hover Tracking Guideline */}
                          {isHovered && (
                            <line
                              x1={p.x}
                              y1="25"
                              x2={p.x}
                              y2="190"
                              stroke="#c2410c"
                              strokeWidth="1.5"
                              strokeDasharray="2 2"
                            />
                          )}

                          {/* Marker Point: Jalan Nasional */}
                          <circle
                            cx={p.x}
                            cy={p.yNasional}
                            r={isHovered ? 5.5 : 4}
                            fill="#334155"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />

                          {/* Marker Point: Jalan Provinsi */}
                          <circle
                            cx={p.x}
                            cy={p.yProvinsi}
                            r={isHovered ? 5.5 : 4}
                            fill="#d97706"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />

                          {/* Marker Point: Jalan Kab/Kota */}
                          <circle
                            cx={p.x}
                            cy={p.yKabKota}
                            r={isHovered ? 7 : 5}
                            fill="#c2410c"
                            stroke="#ffffff"
                            strokeWidth="2.5"
                            className="transition-all"
                          />

                          {/* Exact Value Badge on top of Kab/Kota point */}
                          <text
                            x={p.x}
                            y={p.yKabKota + (isHovered ? -12 : -9)}
                            textAnchor="middle"
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fill={isHovered ? "#9a3412" : "#c2410c"}
                          >
                            {p.raw.kabupatenKota}%
                          </text>

                          {/* X-Axis Year Label */}
                          <text
                            x={p.x}
                            y="210"
                            textAnchor="middle"
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight={isHovered ? "bold" : "normal"}
                            fill={isHovered ? "#c2410c" : "#64748b"}
                          >
                            {p.year}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              ) : (
                /* 2. VIEW B: COMPARATIVE GROUPED BAR CHART */
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
              )}

              {/* Year Detail Snapshot Banner */}
              <div className="mt-4 p-4 rounded-[5px] bg-white/90 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-[5px] bg-orange-500/10 text-[#c2410c] border border-orange-500/25 font-sans font-bold text-sm tabular-nums">
                    {selectedRoadData.year}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-sans">
                      Jurang Ketimpangan Jalan Daerah: <span className="text-[#c2410c]">{selectedRoadData.gap}%</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Jalan nasional mencapai {selectedRoadData.nasional}% mantap, sedangkan jalan kabupaten/kota hanya {selectedRoadData.kabupatenKota}% mantap (hampir separuh rusak).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-sans shrink-0">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pusat</span>
                    <strong className="text-slate-800 tabular-nums">{selectedRoadData.nasional}%</strong>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[10px] text-slate-400 block">Provinsi</span>
                    <strong className="text-amber-800 tabular-nums">{selectedRoadData.provinsi}%</strong>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[10px] text-slate-400 block">Kab/Kota</span>
                    <strong className="text-[#c2410c] tabular-nums">{selectedRoadData.kabupatenKota}%</strong>
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
