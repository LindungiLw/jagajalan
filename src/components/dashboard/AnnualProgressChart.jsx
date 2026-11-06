"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Info,
  Layers,
  Coins,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  BookOpen,
  X,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
} from "lucide-react";
import { ANNUAL_HISTORICAL_DATA } from "@/data/provincesData";

// Data Resmi Panjang Jalan Indonesia Berdasarkan Status Wewenang (BPS SIRUSA & Ditjen Bina Marga KemenPUPR)
const NATIONAL_ROAD_COMPOSITION = [
  {
    key: "kabupaten",
    label: "Jalan Kabupaten",
    owner: "Pemerintah Kabupaten",
    km: 316200,
    pct: 57.6,
    color: "#059669", // Emerald-600
  },
  {
    key: "kota",
    label: "Jalan Kota",
    owner: "Pemerintah Kota",
    km: 130700,
    pct: 23.8,
    color: "#0d9488", // Teal-600
  },
  {
    key: "provinsi",
    label: "Jalan Provinsi",
    owner: "Pemerintah Provinsi (DBMPR)",
    km: 54500,
    pct: 9.9,
    color: "#9333ea", // Purple-600
  },
  {
    key: "nasional",
    label: "Jalan Nasional",
    owner: "Kementerian PUPR (BBPJN/BPJN)",
    km: 47600,
    pct: 8.7,
    color: "#2563eb", // Blue-600
  },
];

export default function AnnualProgressChart() {
  const [activeMetric, setActiveMetric] = useState("road-condition"); // 'road-condition' | 'complaints' | 'inpres'
  const [chartViewMode, setChartViewMode] = useState("combo"); // 'combo' (bars + lines) | 'line'
  const [selectedYear, setSelectedYear] = useState(2024);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  const { roadConditionTrends, complaintTrends, inpresBudgets } = ANNUAL_HISTORICAL_DATA;

  // Selected year data for active metric
  const selectedRoadData =
    roadConditionTrends.find((d) => d.year === selectedYear) ||
    roadConditionTrends[roadConditionTrends.length - 1];
  const selectedComplaintData =
    complaintTrends.find((d) => d.year === selectedYear) ||
    complaintTrends[complaintTrends.length - 1];

  // SVG Coordinates for Line Chart (viewBox: 0 0 660 230, scale 0% to 100%)
  // Baseline 0% is at y = 195, 100% is at y = 25. Total height = 170px.
  // Data points horizontally: x = 105 to 585 (480px width across 4 intervals -> 120px step)
  const linePoints = useMemo(() => {
    return roadConditionTrends.map((d, i) => {
      const x = 105 + (i / 4) * 480;
      const yNasional = 195 - (d.nasional / 100) * 170;
      const yProvinsi = 195 - (d.provinsi / 100) * 170;
      const yKabKota = 195 - (d.kabupatenKota / 100) * 170;
      return { year: d.year, x, yNasional, yProvinsi, yKabKota, raw: d };
    });
  }, [roadConditionTrends]);

  // Smooth Cubic Bezier Curves for professional chart aesthetics
  const getSmoothPath = (points, key) => {
    if (!points || points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0][key]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpx1 = p0.x + (p1.x - p0.x) * 0.45;
      const cpy1 = p0[key];
      const cpx2 = p0.x + (p1.x - p0.x) * 0.55;
      const cpy2 = p1[key];
      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p1.x} ${p1[key]}`;
    }
    return d;
  };

  const pathNasional = useMemo(() => getSmoothPath(linePoints, "yNasional"), [linePoints]);
  const pathProvinsi = useMemo(() => getSmoothPath(linePoints, "yProvinsi"), [linePoints]);
  const pathKabKota = useMemo(() => getSmoothPath(linePoints, "yKabKota"), [linePoints]);

  // Smooth Disparity Gradient Area Path (between Nasional & Kab/Kota)
  const disparityAreaPath = useMemo(() => {
    if (!linePoints || linePoints.length === 0) return "";
    let d = `M ${linePoints[0].x} ${linePoints[0].yNasional}`;
    for (let i = 0; i < linePoints.length - 1; i++) {
      const p0 = linePoints[i];
      const p1 = linePoints[i + 1];
      const cpx1 = p0.x + (p1.x - p0.x) * 0.45;
      const cpy1 = p0.yNasional;
      const cpx2 = p0.x + (p1.x - p0.x) * 0.55;
      const cpy2 = p1.yNasional;
      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p1.x} ${p1.yNasional}`;
    }
    d += ` L ${linePoints[linePoints.length - 1].x} ${linePoints[linePoints.length - 1].yKabKota}`;
    for (let i = linePoints.length - 1; i > 0; i--) {
      const p0 = linePoints[i];
      const p1 = linePoints[i - 1];
      const cpx1 = p0.x - (p0.x - p1.x) * 0.45;
      const cpy1 = p0.yKabKota;
      const cpx2 = p0.x - (p0.x - p1.x) * 0.55;
      const cpy2 = p1.yKabKota;
      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p1.x} ${p1.yKabKota}`;
    }
    d += " Z";
    return d;
  }, [linePoints]);

  // Donut Chart Circumference Calculations (r = 50, C = 2 * PI * 50 = 314.159)
  const donutRadius = 50;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let accumulatedOffset = 0;
  const donutSlices = NATIONAL_ROAD_COMPOSITION.map((item) => {
    const strokeDash = (item.pct / 100) * donutCircumference;
    const offset = accumulatedOffset;
    accumulatedOffset += strokeDash;
    return {
      ...item,
      strokeDash,
      strokeOffset: -offset,
    };
  });

  const availableYears = [2020, 2021, 2022, 2023, 2024];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      {/* Top Header & Metric View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Perbandingan Kemantapan Jalan Nasional vs Daerah
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Data historis BPS SIRUSA (2020–2024) yang memperlihatkan selisih kondisi jalan kabupaten/kota dibanding jalan nasional beserta proporsi panjang ruasnya.
          </p>
        </div>

        {/* 3 Metric Pills (High-End Floating Island) */}
        <div className="flex items-center p-1 rounded-[8px] bg-slate-100/80 ring-1 ring-orange-200/50 text-xs font-semibold shrink-0 gap-1 font-sans">
          <button
            onClick={() => setActiveMetric("road-condition")}
            className={`px-3.5 py-1.5 rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMetric === "road-condition"
                ? "bg-[#c2410c] text-white shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${activeMetric === "road-condition" ? "text-white" : "text-[#c2410c]"}`} />
            <span>Kemantapan Jalan</span>
            <span className={`hidden sm:inline-block px-1.5 py-0.2 rounded-[4px] text-[10px] font-bold ${
              activeMetric === "road-condition" ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-700"
            }`}>
              Gap 36%
            </span>
          </button>

          <button
            onClick={() => setActiveMetric("complaints")}
            className={`px-3.5 py-1.5 rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMetric === "complaints"
                ? "bg-[#c2410c] text-white shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${activeMetric === "complaints" ? "text-white" : "text-rose-600"}`} />
            <span>Aduan Publik</span>
            <span className={`hidden sm:inline-block px-1.5 py-0.2 rounded-[4px] text-[10px] font-bold ${
              activeMetric === "complaints" ? "bg-white/20 text-white" : "bg-rose-50 text-rose-700"
            }`}>
              16rb+
            </span>
          </button>

          <button
            onClick={() => setActiveMetric("inpres")}
            className={`px-3.5 py-1.5 rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMetric === "inpres"
                ? "bg-[#c2410c] text-white shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Coins className={`w-3.5 h-3.5 ${activeMetric === "inpres" ? "text-white" : "text-orange-600"}`} />
            <span>Intervensi IJD</span>
            <span className={`hidden sm:inline-block px-1.5 py-0.2 rounded-[4px] text-[10px] font-bold ${
              activeMetric === "inpres" ? "bg-white/20 text-white" : "bg-orange-50 text-orange-700"
            }`}>
              Rp 29.9T
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2-COLUMN EXECUTIVE DASHBOARD LAYOUT (Perfect Balanced Grid) */}
      {/* ======================================================== */}
      {activeMetric === "road-condition" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch animate-fade-in">
          
          {/* LEFT CARD (~67% width): 4 Open KPI Columns + Direct White Combo Chart + Clean Footer */}
          <div className="lg:col-span-8 bg-white rounded-[6px] ring-1 ring-orange-200/50 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] p-5 sm:p-6 flex flex-col justify-between space-y-4">
            
            {/* 1. TOP 4 OPEN KPI COLUMNS (Executive SaaS Layout, No Truncation, Airy & Clean) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 pb-3 border-b border-slate-100">
              {/* Column 1: Jalan Nasional */}
              <div className="px-2.5 sm:px-3 py-1.5 flex flex-col justify-between">
                <div className="h-6 flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500 whitespace-nowrap">Jalan Nasional</span>
                  <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    <ArrowUpRight className="w-2.5 h-2.5 text-emerald-600" />
                    +2.2%
                  </span>
                </div>
                <div className="text-3xl font-black text-blue-600 font-sans tabular-nums tracking-tight">
                  {selectedRoadData.nasional}%
                </div>
                <span className="text-[11px] text-slate-400 font-medium block mt-1 truncate">
                  KemenPUPR (APBN)
                </span>
              </div>

              {/* Column 2: Jalan Provinsi */}
              <div className="px-2.5 sm:px-3 py-1.5 flex flex-col justify-between">
                <div className="h-6 flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500 whitespace-nowrap">Jalan Provinsi</span>
                  <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    <ArrowUpRight className="w-2.5 h-2.5 text-emerald-600" />
                    +3.0%
                  </span>
                </div>
                <div className="text-3xl font-black text-purple-600 font-sans tabular-nums tracking-tight">
                  {selectedRoadData.provinsi}%
                </div>
                <span className="text-[11px] text-slate-400 font-medium block mt-1 truncate">
                  Pemprov (Kondisi Sedang)
                </span>
              </div>

              {/* Column 3: Jalan Kab/Kota */}
              <div className="px-2.5 sm:px-3 py-1.5 flex flex-col justify-between">
                <div className="h-6 flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500 whitespace-nowrap">Jalan Kab/Kota</span>
                  <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    <span className="text-rose-500 font-bold">*</span> 42.9% Rusak
                  </span>
                </div>
                <div className="text-3xl font-black text-orange-600 font-sans tabular-nums tracking-tight">
                  {selectedRoadData.kabupatenKota}%
                </div>
                <span className="text-[11px] text-slate-400 font-medium block mt-1 truncate">
                  Pemkab / Pemkot
                </span>
              </div>

              {/* Column 4: Jurang Ketimpangan */}
              <div className="px-2.5 sm:px-3 py-1.5 flex flex-col justify-between">
                <div className="h-6 flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500 whitespace-nowrap">Jurang Ketimpangan</span>
                  <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
                    Kesenjangan
                  </span>
                </div>
                <div className="text-3xl font-black text-slate-900 font-sans tabular-nums tracking-tight">
                  Δ {selectedRoadData.gap}%
                </div>
                <span className="text-[11px] text-slate-400 font-medium block mt-1 truncate">
                  Selisih Pusat vs Daerah
                </span>
              </div>
            </div>

            {/* 2. CHART CONTROLS (Legend, Year Selector, Mode Toggle) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              {/* Legend with official authority colors */}
              <div className="flex items-center gap-3.5 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-sm bg-blue-600" />
                  <span className="text-slate-700">Nasional</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-sm bg-purple-600" />
                  <span className="text-slate-700">Provinsi</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-sm bg-orange-600" />
                  <span className="text-orange-700 font-bold">Kab/Kota (Daerah)</span>
                </span>
              </div>

              {/* Unified Controls Group */}
              <div className="flex items-center gap-2">
                {/* Year Selector Pills */}
                <div className="flex items-center p-0.5 rounded-[6px] bg-slate-100 ring-1 ring-orange-200/50 text-xs font-bold font-sans">
                  {availableYears.map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setSelectedYear(yr)}
                      className={`px-2.5 py-1 rounded-[5px] transition-all cursor-pointer ${
                        selectedYear === yr
                          ? "bg-[#c2410c] text-white shadow-xs font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>

                {/* View Switcher: Combo vs Line */}
                <div className="flex items-center p-0.5 rounded-[6px] bg-slate-100 ring-1 ring-orange-200/50 text-xs font-bold font-sans">
                  <button
                    onClick={() => setChartViewMode("combo")}
                    className={`px-2.5 py-1 rounded-[5px] transition-all cursor-pointer ${
                      chartViewMode === "combo"
                        ? "bg-[#c2410c] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Grafik Batang Daerah + Garis Tren Nasional"
                  >
                    Kombinasi
                  </button>
                  <button
                    onClick={() => setChartViewMode("line")}
                    className={`px-2.5 py-1 rounded-[5px] transition-all cursor-pointer ${
                      chartViewMode === "line"
                        ? "bg-[#c2410c] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Grafik Garis Tren Kontinu"
                  >
                    Garis
                  </button>
                </div>
              </div>
            </div>

            {/* 3. MAIN SVG CHART (Clean on White, No Box-in-a-Box, Wide Margins) */}
            <div className="py-2 relative select-none">
              <svg
                viewBox="0 0 660 230"
                className="w-full h-64 select-none"
                style={{ minWidth: "540px" }}
              >
                <defs>
                  {/* Soft area gradient under Nasional */}
                  <linearGradient id="nasionalAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
                  </linearGradient>

                  {/* Gradient for bar columns */}
                  <linearGradient id="barColumnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>

                  {/* Clean shadow filter for pills & markers */}
                  <filter id="cleanDrop" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.10" />
                  </filter>
                </defs>

                {/* Y-Axis Reference Gridlines (100%, 80%, 60%, 40%) */}
                {[
                  { val: 100, y: 25 },
                  { val: 80, y: 59 },
                  { val: 60, y: 93 },
                  { val: 40, y: 127 },
                ].map((item) => (
                  <g key={item.val}>
                    <line
                      x1="58"
                      y1={item.y}
                      x2="635"
                      y2={item.y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x="48"
                      y={item.y + 3.5}
                      textAnchor="end"
                      fontSize="10"
                      fontFamily="sans-serif"
                      fill="#94a3b8"
                      fontWeight="600"
                    >
                      {item.val}%
                    </text>
                  </g>
                ))}

                {/* Bottom Baseline (at y = 195) */}
                <line
                  x1="58"
                  y1="195"
                  x2="635"
                  y2="195"
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                />

                {/* COMBO MODE: Tall Elegant Bars for Kab/Kota + Lines for Nasional & Provinsi */}
                {chartViewMode === "combo" && (
                  <>
                    {/* Area under Nasional Curve */}
                    <path
                      d={`${pathNasional} L ${linePoints[linePoints.length - 1].x} 195 L ${linePoints[0].x} 195 Z`}
                      fill="url(#nasionalAreaGrad)"
                    />

                    {/* Vertical Bars for Kab/Kota (Rising to ~57% height) */}
                    {linePoints.map((p) => {
                      const isSelected = p.year === selectedYear;
                      const barWidth = 46;
                      const barHeight = 195 - p.yKabKota;
                      return (
                        <g
                          key={`bar-${p.year}`}
                          className="cursor-pointer group"
                          onClick={() => setSelectedYear(p.year)}
                        >
                          {/* Column Bar with rounded top */}
                          <rect
                            x={p.x - barWidth / 2}
                            y={p.yKabKota}
                            width={barWidth}
                            height={barHeight}
                            rx="8"
                            fill="url(#barColumnGrad)"
                            opacity={isSelected ? 1 : 0.85}
                            filter={isSelected ? "url(#cleanDrop)" : undefined}
                            className="transition-all"
                          />

                          {/* Floating Percentage Badge on top of bar */}
                          <rect
                            x={p.x - 23}
                            y={p.yKabKota - 20}
                            width="46"
                            height="18"
                            rx="9"
                            fill="#ffffff"
                            stroke="#ea580c"
                            strokeWidth="1.2"
                            filter="url(#cleanDrop)"
                          />
                          <text
                            x={p.x}
                            y={p.yKabKota - 7.5}
                            textAnchor="middle"
                            fontSize="10"
                            fontFamily="sans-serif"
                            fontWeight="bold"
                            fill="#c2410c"
                          >
                            {p.raw.kabupatenKota}%
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}

                {/* LINE MODE: Disparity Area between Nasional & Kab/Kota */}
                {chartViewMode === "line" && (
                  <path d={disparityAreaPath} fill="url(#nasionalAreaGrad)" />
                )}

                {/* Smooth Continuous Curves */}
                {/* Line 1: Jalan Nasional (Biru) */}
                <path
                  d={pathNasional}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Line 2: Jalan Provinsi (Ungu) */}
                <path
                  d={pathProvinsi}
                  fill="none"
                  stroke="#9333ea"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Line 3: Jalan Kab/Kota (In Line Mode) */}
                {chartViewMode === "line" && (
                  <path
                    d={pathKabKota}
                    fill="none"
                    stroke="#ea580c"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Interactive Points & X-Axis Year Markers */}
                {linePoints.map((p) => {
                  const isSelected = p.year === selectedYear;
                  return (
                    <g
                      key={`pt-${p.year}`}
                      className="cursor-pointer group"
                      onClick={() => setSelectedYear(p.year)}
                    >
                      {/* Vertical Indicator on Selected Year */}
                      {isSelected && (
                        <line
                          x1={p.x}
                          y1="22"
                          x2={p.x}
                          y2="195"
                          stroke="#0f172a"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          opacity="0.4"
                        />
                      )}

                      {/* Dot: Jalan Nasional */}
                      <circle
                        cx={p.x}
                        cy={p.yNasional}
                        r={isSelected ? 6 : 4}
                        fill="#2563eb"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        filter={isSelected ? "url(#cleanDrop)" : undefined}
                      />

                      {/* Dot: Jalan Provinsi */}
                      <circle
                        cx={p.x}
                        cy={p.yProvinsi}
                        r={isSelected ? 5.5 : 4}
                        fill="#9333ea"
                        stroke="#ffffff"
                        strokeWidth="2"
                        filter={isSelected ? "url(#cleanDrop)" : undefined}
                      />

                      {/* Dot: Jalan Kab/Kota (in Line mode) */}
                      {chartViewMode === "line" && (
                        <circle
                          cx={p.x}
                          cy={p.yKabKota}
                          r={isSelected ? 7 : 5}
                          fill="#ea580c"
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          filter={isSelected ? "url(#cleanDrop)" : undefined}
                        />
                      )}

                      {/* X-Axis Year Button */}
                      <text
                        x={p.x}
                        y="214"
                        textAnchor="middle"
                        fontSize="11.5"
                        fontFamily="sans-serif"
                        fontWeight={isSelected ? "bold" : "600"}
                        fill={isSelected ? "#0f172a" : "#64748b"}
                      >
                        {p.year}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* 4. BOTTOM FOOTER & SUBTLE SOURCE (Clean, Borderless, Small Italic) */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#c2410c] shrink-0" />
                  <span>
                    <strong>Kesimpulan {selectedRoadData.year}:</strong> Jurang kesenjangan kemantapan pusat vs daerah sebesar <strong>{selectedRoadData.gap}%</strong>.
                  </span>
                </div>
                <button
                  onClick={() => setShowExplanationModal(true)}
                  className="text-xs font-bold text-[#c2410c] hover:text-[#9a3412] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>Lihat Metodologi BPS SIRUSA</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Clean italic source text without border or dot */}
              <p className="text-[11px] text-slate-400 italic">
                * Sumber: Data Resmi Historis (2020 – 2024) BPS SIRUSA & Ombudsman RI
              </p>
            </div>
          </div>

          {/* RIGHT CARD (~33% width): Balanced Donut Chart & Rich Breakdown with Micro-Bars */}
          <div className="lg:col-span-4 bg-white rounded-[6px] ring-1 ring-orange-200/50 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] p-5 sm:p-6 flex flex-col justify-between space-y-4">
            
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-0.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Beban Ruas Nasional</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Proporsi Panjang Jalan Indonesia
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Distribusi ~549.000 Km berdasarkan status kewenangan (BPS).
              </p>
            </div>

            {/* Centered Donut Visual */}
            <div className="relative flex items-center justify-center py-1">
              <svg viewBox="0 0 130 130" className="w-36 h-36 -rotate-90 select-none">
                {/* Background Ring */}
                <circle
                  cx="65"
                  cy="65"
                  r={donutRadius}
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="15"
                />

                {/* Slices for the 4 authorities */}
                {donutSlices.map((slice) => {
                  const isHovered = hoveredSlice === slice.key;
                  return (
                    <circle
                      key={slice.key}
                      cx="65"
                      cy="65"
                      r={donutRadius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isHovered ? 18 : 15}
                      strokeDasharray={`${slice.strokeDash} ${donutCircumference - slice.strokeDash}`}
                      strokeDashoffset={slice.strokeOffset}
                      strokeLinecap="round"
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredSlice(slice.key)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                })}
              </svg>

              {/* Centered Donut Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[11px] text-slate-400 font-medium">Total Ruas</span>
                <span className="text-xl font-extrabold text-slate-900 font-sans tabular-nums leading-tight">
                  549rb
                </span>
                <span className="text-[9.5px] text-slate-500 font-semibold">Kilometer</span>
              </div>
            </div>

            {/* Rich Legend with Micro Progress Bars */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              {NATIONAL_ROAD_COMPOSITION.map((item) => {
                const isHovered = hoveredSlice === item.key;
                return (
                  <div
                    key={item.key}
                    onMouseEnter={() => setHoveredSlice(item.key)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className={`p-1.5 px-2.5 rounded-[6px] transition-all cursor-pointer ${
                      isHovered ? "bg-slate-50 ring-1 ring-slate-200" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.label}
                      </span>
                      <div className="flex items-baseline gap-1.5 font-sans">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.km.toLocaleString("id-ID")} Km
                        </span>
                        <span className="font-extrabold text-xs" style={{ color: item.color }}>
                          {item.pct}%
                        </span>
                      </div>
                    </div>
                    {/* Micro Progress Bar */}
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                        className="h-full rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanatory Policy Callout Box */}
            <div className="p-3.5 rounded-[6px] bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-amber-900">
                <strong className="text-amber-950">Akar Permasalahan Jalan Daerah:</strong>{" "}
                Sebesar <strong>81.4% (446.900 Km)</strong> jalan di Indonesia berada di bawah wewenang Pemerintah Kabupaten &amp; Kota dengan kapasitas fiskal PAD yang terbatas. Ketimpangan beban bentang inilah yang memicu terbitnya <strong>Inpres No. 3/2023</strong>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METRIC VIEW 2: ADUAN & MALADMINISTRASI (OMBUDSMAN RI) */}
      {activeMetric === "complaints" && (
        <div className="bg-white rounded-[6px] ring-1 ring-orange-200/50 shadow-sm p-5 sm:p-6 space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Evolusi Keluhan Pelayanan Publik Jalan Rusak (2020 – 2024)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sumber: Laporan Tahunan Ombudsman RI & Konsolidasi SP4N-LAPOR!.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 mr-1">Tahun:</span>
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-2.5 py-1 rounded-[6px] text-xs font-bold transition-all cursor-pointer ${
                    selectedYear === yr
                      ? "bg-[#c2410c] text-white shadow-xs"
                      : "bg-white text-slate-600 ring-1 ring-orange-200/50 hover:text-slate-900"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Complaint Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-[6px] bg-slate-50 ring-1 ring-orange-200/50">
              <span className="text-[11px] font-semibold text-slate-500 block">Total Aduan ({selectedComplaintData.year})</span>
              <div className="text-2xl font-extrabold text-slate-900 font-sans tabular-nums mt-1">
                {selectedComplaintData.totalComplaints.toLocaleString("id-ID")}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Naik 164% sejak 2020</span>
            </div>

            <div className="p-4 rounded-[6px] bg-emerald-50/70 border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-700 block">Tuntas Ditindaklanjuti</span>
              <div className="text-2xl font-extrabold text-emerald-800 font-sans tabular-nums mt-1">
                {selectedComplaintData.resolved.toLocaleString("id-ID")}
              </div>
              <span className="text-[10px] text-emerald-700 block mt-0.5">
                {((selectedComplaintData.resolved / selectedComplaintData.totalComplaints) * 100).toFixed(1)}% Penyelesaian
              </span>
            </div>

            <div className="p-4 rounded-[6px] bg-rose-50/70 border border-rose-200">
              <span className="text-[11px] font-semibold text-rose-700 block">Melewati Tenggat Respons</span>
              <div className="text-2xl font-extrabold text-rose-800 font-sans tabular-nums mt-1">
                {selectedComplaintData.overdue.toLocaleString("id-ID")}
              </div>
              <span className="text-[10px] text-rose-700 block mt-0.5">
                {selectedComplaintData.overduePct}% Penundaan Berlarut
              </span>
            </div>

            <div className="p-4 rounded-[6px] bg-[#c2410c] text-white shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-orange-100 block">Potensi Maladministrasi</span>
                <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-1">
                  <ShieldAlert className="w-4 h-4 text-orange-200 shrink-0" />
                  <span>Pasal 1 UU 37/2008</span>
                </div>
                <p className="text-[10px] text-orange-100 mt-1">
                  Dapat diekskalasi warga via JagaJalan.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METRIC VIEW 3: INTERVENSI ANGGARAN INPRES (IJD) */}
      {activeMetric === "inpres" && (
        <div className="bg-white rounded-[6px] ring-1 ring-orange-200/50 shadow-sm p-5 sm:p-6 space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Alokasi APBN Inpres Jalan Daerah (Inpres No. 3 Tahun 2023)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Intervensi darurat pemerintah pusat untuk merehabilitasi jalan daerah rusak.
              </p>
            </div>
            <span className="text-xs font-bold text-white bg-[#c2410c] px-3 py-1 rounded-[6px]">
              Total Realisasi: Rp 29,9 Triliun
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inpresBudgets.map((item) => (
              <div
                key={item.year}
                className="p-5 rounded-[6px] bg-slate-50 ring-1 ring-orange-200/50 hover:ring-orange-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Tahun Anggaran {item.year}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">{item.note}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-[#c2410c] font-sans tabular-nums">
                      Rp {item.budgetTrillion}
                    </span>
                    <span className="text-xs font-bold text-slate-500 ml-1">Triliun</span>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
                  <div
                    style={{ width: `${(item.budgetTrillion / 20) * 100}%` }}
                    className="h-full bg-[#c2410c] rounded-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Realisasi Fisik:</span>
                    <strong className="text-slate-800 font-sans tabular-nums">
                      {item.realizedKm.toLocaleString("id-ID")} Km
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Jangkauan Wilayah:</span>
                    <strong className="text-slate-800 font-sans tabular-nums">
                      {item.targetProvinces} Provinsi
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* METODOLOGI & REGULASI MODAL (Double-Bezel 5pt with Orange Header & White Text) */}
      {showExplanationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="max-w-2xl w-full rounded-[8px] bg-slate-100/80 p-2 sm:p-2.5 ring-1 ring-orange-200/60 shadow-2xl">
            <div className="bg-white rounded-[6px] w-full overflow-hidden ring-1 ring-orange-200/50 max-h-[88vh] flex flex-col">
              {/* Orange Header with White Text */}
              <div className="flex items-center justify-between bg-[#c2410c] text-white px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[6px] bg-white/15 flex items-center justify-center text-white shrink-0">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-orange-100 block">
                      Standar Rujukan Data Nasional
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Metodologi BPS SIRUSA &amp; Landasan Kebijakan
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowExplanationModal(false)}
                  className="p-1.5 rounded-[6px] text-orange-100 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-600 leading-relaxed overflow-y-auto">
                <div className="p-3.5 rounded-[6px] bg-orange-50/50 ring-1 ring-orange-200/50">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    1. Standar Kemantapan Jalan (IRI BPS &amp; Ditjen Bina Marga)
                  </h4>
                  <p>
                    Berdasarkan publikasi <em>Statistik Transportasi Darat BPS (SIRUSA)</em>, kondisi jalan diklasifikasikan menggunakan indeks kerataan permukaan (<em>International Roughness Index / IRI</em>):
                  </p>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1">
                    <li>
                      <strong>Jalan Mantap (Baik &amp; Sedang):</strong> Nilai IRI &lt; 8 m/km, permukaan rata, siap dilalui kendaraan dengan kecepatan rencana tanpa risiko kerusakan struktural.
                    </li>
                    <li>
                      <strong>Jalan Tidak Mantap (Rusak Ringan &amp; Berat):</strong> Nilai IRI &ge; 8 m/km hingga &gt; 12 m/km, berlubang, retak buaya, ambles, atau kehilangan lapisan aspal dasar.
                    </li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-[6px] bg-slate-50 ring-1 ring-orange-200/40">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    2. Penyebab Selisih Kemantapan Jalan Daerah (36% – 38%)
                  </h4>
                  <p>
                    Jalan nasional memiliki kemantapan tinggi (92,8% – 93,4%) karena dibiayai langsung oleh <strong>APBN Kementerian PUPR</strong> dengan jadwal pemeliharaan berkala rutin. Sebaliknya, jalan kabupaten/kota menghadapi dua kendala struktural:
                  </p>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1">
                    <li>
                      Menanggung beban bentang jalan terpanjang di Indonesia (mencakup <strong>81,4%</strong> dari total 549.000 km jaringan jalan nasional).
                    </li>
                    <li>
                      Kapasitas anggaran APBD daerah terbatas karena sebagian besar terserap untuk belanja operasional rutin.
                    </li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-[6px] bg-slate-50 ring-1 ring-orange-200/40">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    3. Dasar Intervensi Inpres No. 3 Tahun 2023
                  </h4>
                  <p>
                    Pemerintah pusat menerbitkan <strong>Instruksi Presiden No. 3 Tahun 2023</strong> agar Kementerian PUPR dapat langsung menggunakan dana APBN untuk memperbaiki ruas jalan milik pemerintah provinsi dan kabupaten/kota yang rusak berat.
                  </p>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowExplanationModal(false)}
                  className="px-4 py-2 rounded-[6px] bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Tutup Penjelasan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
