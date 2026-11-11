"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Shield,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  ExternalLink,
  MapPin,
  Calendar,
  AlertCircle,
  LayoutGrid,
  Table as TableIcon,
  ArrowUpDown,
  ArrowRight,
  FileCheck2,
  DownloadCloud,
  FileSpreadsheet,
  Bell,
  BellRing,
  Check,
  Lock,
  Building2,
  AlertOctagon,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/exportTransparencyData";
import CustomSelect from "./CustomSelect";

/**
 * Komponen Visualisasi Diagram Donut Distribusi Status Aduan
 * Merefleksikan sebaran proporsi aduan (Melewati Tenggat, Dalam Tanggapan, Selesai)
 * dengan label persentase dinamis dan interaktivitas filter sekali klik.
 */
function StatusDistributionDonut({ counts, activeFilter, onSelectFilter }) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState(null); // "OVERDUE" | "DALAM_PENGERJAAN" | "SELESAI" | null
  const [mousePos, setMousePos] = useState({ x: 75, y: 70 });

  const total = counts.all || 1;
  const overdue = counts.overdue || 0;
  const inProgress = counts.inProgress || 0;
  const resolved = counts.resolved || 0;

  const pctOverdue = Math.round((overdue / total) * 100);
  const pctInProgress = Math.round((inProgress / total) * 100);
  const pctResolved = Math.max(0, 100 - pctOverdue - pctInProgress);

  // SVG Geometry
  const cx = 75;
  const cy = 70;
  const r = 40;
  const strokeWidth = 14;
  const C = 2 * Math.PI * r; // ~251.327

  // Lengths of arc segments
  const lenOverdue = (overdue / total) * C;
  const lenInProgress = (inProgress / total) * C;
  const lenResolved = (resolved / total) * C;

  // Offsets for strokeDashoffset (starting from top at -90deg)
  const offsetOverdue = 0;
  const offsetInProgress = lenOverdue;
  const offsetResolved = lenOverdue + lenInProgress;

  // Angles for percentage labels positioning (radius 57px from center)
  const spanOverdue = (overdue / total) * 360;
  const midAngleOverdue = -90 + spanOverdue / 2;
  const radOverdue = (midAngleOverdue * Math.PI) / 180;
  const lxOverdue = cx + 57 * Math.cos(radOverdue);
  const lyOverdue = cy + 57 * Math.sin(radOverdue);

  const spanInProgress = (inProgress / total) * 360;
  const midAngleInProgress = -90 + spanOverdue + spanInProgress / 2;
  const radInProgress = (midAngleInProgress * Math.PI) / 180;
  const lxInProgress = cx + 57 * Math.cos(radInProgress);
  const lyInProgress = cy + 57 * Math.sin(radInProgress);

  const spanResolved = (resolved / total) * 360;
  const midAngleResolved = -90 + spanOverdue + spanInProgress + spanResolved / 2;
  const radResolved = (midAngleResolved * Math.PI) / 180;
  const lxResolved = cx + 57 * Math.cos(radResolved);
  const lyResolved = cy + 57 * Math.sin(radResolved);

  // Spiderweb / Radar Mesh Angles & Rings
  const spokesAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const webRings = [20, 28, 40, 50, 58];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((e.clientX - rect.left) / rect.width) * 150;
    const y = ((e.clientY - rect.top) / rect.height) * 140;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col items-center justify-between h-full w-full select-none">
      <h4 className="text-[10.5px] font-bold font-sans tracking-wider uppercase text-slate-700 text-center">
        Distribusi Status Aduan
      </h4>

      {/* SVG Donut dengan Jaring-Jaring Interaktif */}
      <div className="relative my-0.5 sm:my-1 flex items-center justify-center">
        <svg
          viewBox="0 0 150 140"
          className="w-36 h-36 sm:w-40 sm:h-40 overflow-visible transition-transform duration-300 cursor-crosshair"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setHoveredSlice(null);
          }}
          onMouseMove={handleMouseMove}
        >
          <defs>
            {/* Mesh Pattern Jaring-jaring Crosshatch */}
            <pattern
              id="donut-mesh-crosshatch"
              width="5"
              height="5"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="5" stroke="#ffffff" strokeWidth="0.9" strokeOpacity="0.6" />
              <line x1="0" y1="0" x2="5" y2="0" stroke="#ffffff" strokeWidth="0.9" strokeOpacity="0.6" />
            </pattern>
            {/* Fine Radar Grid Pattern */}
            <pattern
              id="bg-grid-mesh"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.5" strokeOpacity="0.7" />
            </pattern>
          </defs>

          {/* 1. Background Grid Backdrop on Hover */}
          {isHovered && (
            <rect
              x="5"
              y="5"
              width="140"
              height="130"
              rx="12"
              fill="url(#bg-grid-mesh)"
              className="animate-fade-in pointer-events-none"
            />
          )}

          {/* 2. SPIDERWEB RADIAL MESH (Jaring-Jaring Laba-laba / Radar Koordinat) */}
          <g className={`transition-all duration-300 pointer-events-none ${isHovered ? "opacity-100" : "opacity-0"}`}>
            {/* Concentric 12-sided Web Polygons */}
            {webRings.map((rWeb, idx) => {
              const polyPoints = spokesAngles
                .map((deg) => {
                  const rad = (deg * Math.PI) / 180;
                  return `${(cx + rWeb * Math.cos(rad)).toFixed(1)},${(cy + rWeb * Math.sin(rad)).toFixed(1)}`;
                })
                .join(" ");
              const isCenterRing = rWeb === 40;
              return (
                <polygon
                  key={`web-ring-${idx}`}
                  points={polyPoints}
                  fill="none"
                  stroke={isCenterRing ? "#c2410c" : "#94a3b8"}
                  strokeWidth={isCenterRing ? "1" : "0.75"}
                  strokeDasharray={isCenterRing ? "none" : "2.5 2"}
                  strokeOpacity={isCenterRing ? "0.85" : "0.45"}
                />
              );
            })}

            {/* 12 Radial Spoke Lines */}
            {spokesAngles.map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const x1 = cx + 18 * Math.cos(rad);
              const y1 = cy + 18 * Math.sin(rad);
              const x2 = cx + 60 * Math.cos(rad);
              const y2 = cy + 60 * Math.sin(rad);
              return (
                <line
                  key={`spoke-${deg}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#94a3b8"
                  strokeWidth="0.75"
                  strokeDasharray="2 2"
                  strokeOpacity="0.4"
                />
              );
            })}

            {/* Glowing Intersection Vertex Nodes (Simpul Jaring-Jaring) */}
            {webRings.map((rWeb) =>
              spokesAngles.map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const vx = cx + rWeb * Math.cos(rad);
                const vy = cy + rWeb * Math.sin(rad);
                return (
                  <circle
                    key={`node-${rWeb}-${deg}`}
                    cx={vx}
                    cy={vy}
                    r={rWeb === 40 ? "1.5" : "1"}
                    fill={rWeb === 40 ? "#c2410c" : "#64748b"}
                    opacity="0.8"
                  />
                );
              })
            )}

            {/* Interactive Raycast Line to Cursor */}
            <line
              x1={cx}
              y1={cy}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="#c2410c"
              strokeWidth="1.2"
              strokeDasharray="3 2"
              strokeOpacity="0.85"
            />
            <circle
              cx={mousePos.x}
              cy={mousePos.y}
              r="3.5"
              fill="#c2410c"
              stroke="#ffffff"
              strokeWidth="1.5"
              className="animate-ping"
              style={{ animationDuration: "2s" }}
            />
          </g>

          {/* 3. Base Donut Background Track */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {/* 4. Slices group (rotated -90deg so 0 begins at 12 o'clock) */}
          <g transform={`rotate(-90 ${cx} ${cy})`}>
            {/* Slice 1: Melewati Tenggat (Rose / Red) */}
            {overdue > 0 && (
              <>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth={hoveredSlice === "OVERDUE" || activeFilter === "OVERDUE" ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={`${lenOverdue} ${C - lenOverdue}`}
                  strokeDashoffset={-offsetOverdue}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice("OVERDUE")}
                  onClick={() => onSelectFilter(activeFilter === "OVERDUE" ? "ALL" : "OVERDUE")}
                >
                  <title>{`Melewati Tenggat: ${overdue} Aduan (${pctOverdue}%)`}</title>
                </circle>
                {/* Jaring-Jaring Crosshatch Overlay on Hover */}
                {isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke="url(#donut-mesh-crosshatch)"
                    strokeWidth={hoveredSlice === "OVERDUE" ? strokeWidth + 3 : strokeWidth}
                    strokeDasharray={`${lenOverdue} ${C - lenOverdue}`}
                    strokeDashoffset={-offsetOverdue}
                    strokeLinecap="butt"
                    className="pointer-events-none transition-all duration-300"
                  />
                )}
              </>
            )}

            {/* Slice 2: Dalam Tanggapan (Amber / Yellow) */}
            {inProgress > 0 && (
              <>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={hoveredSlice === "DALAM_PENGERJAAN" || activeFilter === "DALAM_PENGERJAAN" ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={`${lenInProgress} ${C - lenInProgress}`}
                  strokeDashoffset={-offsetInProgress}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice("DALAM_PENGERJAAN")}
                  onClick={() => onSelectFilter(activeFilter === "DALAM_PENGERJAAN" ? "ALL" : "DALAM_PENGERJAAN")}
                >
                  <title>{`Dalam Masa Tanggap: ${inProgress} Aduan (${pctInProgress}%)`}</title>
                </circle>
                {/* Jaring-Jaring Crosshatch Overlay on Hover */}
                {isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke="url(#donut-mesh-crosshatch)"
                    strokeWidth={hoveredSlice === "DALAM_PENGERJAAN" ? strokeWidth + 3 : strokeWidth}
                    strokeDasharray={`${lenInProgress} ${C - lenInProgress}`}
                    strokeDashoffset={-offsetInProgress}
                    strokeLinecap="butt"
                    className="pointer-events-none transition-all duration-300"
                  />
                )}
              </>
            )}

            {/* Slice 3: Selesai Ditangani (Emerald / Green) */}
            {resolved > 0 && (
              <>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={hoveredSlice === "SELESAI" || activeFilter === "SELESAI" ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={`${lenResolved} ${C - lenResolved}`}
                  strokeDashoffset={-offsetResolved}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice("SELESAI")}
                  onClick={() => onSelectFilter(activeFilter === "SELESAI" ? "ALL" : "SELESAI")}
                >
                  <title>{`Tuntas Ditangani: ${resolved} Aduan (${pctResolved}%)`}</title>
                </circle>
                {/* Jaring-Jaring Crosshatch Overlay on Hover */}
                {isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke="url(#donut-mesh-crosshatch)"
                    strokeWidth={hoveredSlice === "SELESAI" ? strokeWidth + 3 : strokeWidth}
                    strokeDasharray={`${lenResolved} ${C - lenResolved}`}
                    strokeDashoffset={-offsetResolved}
                    strokeLinecap="butt"
                    className="pointer-events-none transition-all duration-300"
                  />
                )}
              </>
            )}
          </g>

          {/* Percentage Labels on / near Slices */}
          {overdue > 0 && pctOverdue >= 8 && (
            <text
              x={lxOverdue}
              y={lyOverdue}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[10px] font-bold fill-slate-800 font-sans pointer-events-none"
            >
              {pctOverdue}%
            </text>
          )}

          {inProgress > 0 && pctInProgress >= 8 && (
            <text
              x={lxInProgress}
              y={lyInProgress}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[10px] font-bold fill-slate-800 font-sans pointer-events-none"
            >
              {pctInProgress}%
            </text>
          )}

          {resolved > 0 && pctResolved >= 8 && (
            <text
              x={lxResolved}
              y={lyResolved}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[10px] font-bold fill-slate-800 font-sans pointer-events-none"
            >
              {pctResolved}%
            </text>
          )}

          {/* Center Info: Total Count & Label */}
          <g
            className="cursor-pointer"
            onClick={() => onSelectFilter("ALL")}
            title="Klik untuk melihat seluruh aduan"
          >
            <circle
              cx={cx}
              cy={cy}
              r={r - strokeWidth / 2 - 2}
              fill={isHovered ? "rgba(255,255,255,0.95)" : "transparent"}
              className="transition-colors duration-200"
            />
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[22px] font-extrabold fill-slate-900 font-sans tracking-tight"
            >
              {counts.all}
            </text>
            <text
              x={cx}
              y={cy + 13}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[9.5px] font-semibold fill-slate-500 font-sans tracking-wide"
            >
              Aduan
            </text>
          </g>
        </svg>
      </div>

      {/* Dynamic Hover Status Indicator */}
      <div className="h-5 text-center mt-0.5 flex items-center justify-center">
        {hoveredSlice === "OVERDUE" ? (
          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 animate-fade-in flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            <span>Melewati Tenggat: {overdue} Aduan ({pctOverdue}%)</span>
          </span>
        ) : hoveredSlice === "DALAM_PENGERJAAN" ? (
          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 animate-fade-in flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Dalam Masa Tanggap: {inProgress} Aduan ({pctInProgress}%)</span>
          </span>
        ) : hoveredSlice === "SELESAI" ? (
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 animate-fade-in flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Tuntas Ditangani: {resolved} Aduan ({pctResolved}%)</span>
          </span>
        ) : isHovered ? (
          <span className="text-[9.5px] font-medium text-slate-500 animate-fade-in font-mono">
            Jaring Radar Koordinat • Klik irisan untuk memfilter
          </span>
        ) : (
          <span className="text-[9.5px] text-slate-400 font-sans">
            Arahkan kursor untuk jaring radar interaktif
          </span>
        )}
      </div>

      {/* Legend below Donut */}
      <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[9.5px] sm:text-[10px] font-sans font-medium text-slate-600 pt-0.5">
        <button
          type="button"
          onClick={() => onSelectFilter(activeFilter === "OVERDUE" ? "ALL" : "OVERDUE")}
          className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeFilter === "OVERDUE" ? "font-bold text-rose-700 underline underline-offset-2" : "hover:text-slate-900"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-[2px] bg-rose-600 shrink-0" />
          <span>Melewati Tenggat</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectFilter(activeFilter === "DALAM_PENGERJAAN" ? "ALL" : "DALAM_PENGERJAAN")}
          className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeFilter === "DALAM_PENGERJAAN" ? "font-bold text-amber-700 underline underline-offset-2" : "hover:text-slate-900"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-[2px] bg-amber-500 shrink-0" />
          <span>Dalam Tanggapan</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectFilter(activeFilter === "SELESAI" ? "ALL" : "SELESAI")}
          className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeFilter === "SELESAI" ? "font-bold text-emerald-700 underline underline-offset-2" : "hover:text-slate-900"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600 shrink-0" />
          <span>Selesai</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Komponen Circular Radial Gauge Indikator Skor Bahaya AI
 * Menampilkan ring meter gelap dengan busur progres dinamis (merah/oranye/hijau),
 * angka skor tebal di tengah, dan label 'Skor Bahaya' oranye di bagian bawah.
 */
function HazardRadialGauge({ score = 0 }) {
  const safeScore = Math.min(100, Math.max(0, Number(score) || 0));

  // Geometry
  const r = 31;
  const cx = 40;
  const cy = 40;
  const strokeWidth = 7;
  const C = 2 * Math.PI * r; // ~194.78
  const progressLength = (safeScore / 100) * C;

  // Dynamic arc color: Critical/Overdue (>=80: rose), High/Medium (>=50: orange), Low (<50: emerald)
  const arcColor = safeScore >= 80 ? "#e11d48" : safeScore >= 50 ? "#ea580c" : "#10b981";

  return (
    <div className="flex flex-col items-center justify-center shrink-0 select-none">
      <div className="relative w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center">
        <svg viewBox="0 0 80 80" className="w-18 h-18 sm:w-20 sm:h-20 -rotate-90">
          {/* Base Dark Track Ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#0f172a"
            strokeWidth={strokeWidth}
          />
          {/* Active Progress Arc */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arcColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${progressLength} ${C - progressLength}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Score Number */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xl sm:text-2xl font-black font-sans text-slate-900 tracking-tight tabular-nums">
            {safeScore}
          </span>
        </div>
      </div>

      {/* Label Underneath */}
      <span className="text-[10.5px] sm:text-[11px] font-bold text-[#c2410c] tracking-tight font-sans mt-0.5">
        Skor Bahaya
      </span>
    </div>
  );
}

export default function OmbudsmanMonitorSection({
  reports = [],
  subscribedTickets = [],
  onOpenOmbudsmanDraft,
  onSelectRoadOnMap,
  onSubscribeTicketNotification,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("urgency");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const handleToggleTicketSubscription = (report) => {
    const code = report?.ticketCode;
    if (!code) return;
    const exists = subscribedTickets.includes(code);
    const next = exists
      ? subscribedTickets.filter((t) => t !== code)
      : [code, ...subscribedTickets];
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("jagajalan_subscribed_tickets_v1", JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
    }
    if (onSubscribeTicketNotification) {
      onSubscribeTicketNotification(exists ? null : report, next);
    }
  };

  // Counts
  const counts = useMemo(() => {
    return {
      all: reports.length,
      overdue: reports.filter((r) => r.status === "OVERDUE").length,
      inProgress: reports.filter((r) => r.status === "DALAM_PENGERJAAN" || r.status === "MENUNGGU_VERIFIKASI").length,
      resolved: reports.filter((r) => r.status === "SELESAI").length,
    };
  }, [reports]);

  // Filtered & Sorted reports
  const filteredReports = useMemo(() => {
    const filtered = reports.filter((report) => {
      // Filter status
      if (statusFilter === "OVERDUE" && report.status !== "OVERDUE") return false;
      if (
        statusFilter === "DALAM_PENGERJAAN" &&
        report.status !== "DALAM_PENGERJAAN" &&
        report.status !== "MENUNGGU_VERIFIKASI"
      )
        return false;
      if (statusFilter === "SELESAI" && report.status !== "SELESAI") return false;

      // Filter search
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        report.ticketCode?.toLowerCase().includes(q) ||
        report.roadName?.toLowerCase().includes(q) ||
        report.district?.toLowerCase().includes(q) ||
        report.authorityLabel?.toLowerCase().includes(q) ||
        report.categoryLabel?.toLowerCase().includes(q)
      );
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === "urgency") {
        if (a.status === "OVERDUE" && b.status !== "OVERDUE") return -1;
        if (a.status !== "OVERDUE" && b.status === "OVERDUE") return 1;
        return (b.daysOverdue || 0) - (a.daysOverdue || 0);
      }
      if (sortBy === "hazard-desc") {
        return (b.hazardScore || 0) - (a.hazardScore || 0);
      }
      if (sortBy === "newest") {
        return new Date(b.reportDate) - new Date(a.reportDate);
      }
      return 0;
    });
  }, [reports, statusFilter, searchQuery, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredReports.length / pageSize) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, currentPage, pageSize]);

  const reportExportColumns = useMemo(
    () => [
      { header: "Kode Tiket", key: "ticketCode", mono: true, align: "center", width: 120 },
      {
        header: "Tanggal Lapor",
        mono: true,
        align: "center",
        width: 110,
        accessor: (rep) =>
          rep.reportDate ? new Date(rep.reportDate).toLocaleDateString("id-ID") : "-",
      },
      { header: "Ruas Jalan", key: "roadName", width: 230 },
      { header: "Alamat / Titik Lokasi", key: "address", width: 280 },
      {
        header: "Koordinat GIS (Lat, Lng)",
        mono: true,
        align: "center",
        width: 175,
        accessor: (rep) =>
          Array.isArray(rep.coordinates)
            ? `${Number(rep.coordinates[0]).toFixed(5)}, ${Number(rep.coordinates[1]).toFixed(5)}`
            : "-",
      },
      { header: "Kewenangan", key: "authority", align: "center", width: 120 },
      { header: "Instansi Penanggung Jawab", key: "authorityLabel", width: 270 },
      { header: "Kategori Kerusakan", key: "categoryLabel", width: 220 },
      {
        header: "Indeks Bahaya AI",
        align: "center",
        mono: true,
        width: 120,
        accessor: (rep) => `${rep.hazardScore || 0}/100`,
      },
      {
        header: "Status Tindak Lanjut",
        align: "center",
        width: 190,
        accessor: (rep) =>
          rep.status === "OVERDUE"
            ? `Melewati Tenggat (+${rep.daysOverdue || 1} Hari)`
            : rep.status === "SELESAI"
            ? "Penanganan Selesai"
            : "Dalam Penanganan / Verifikasi",
      },
      {
        header: "Pagu Proyek Terkait",
        align: "right",
        mono: true,
        type: "currency",
        width: 150,
        accessor: (rep) =>
          rep.matchingBudget?.paguRp
            ? `Rp ${(Number(rep.matchingBudget.paguRp) / 1e9).toFixed(2)} M`
            : "-",
      },
    ],
    []
  );

  const handleExportReportsExcel = () => {
    exportToExcel({
      filename: "Laporan_Aduan_Warga_GIS_JagaJalan",
      sheetName: "Aduan Warga GIS",
      title: "LAPORAN TRANSPARANSI ADUAN WARGA & TINDAK LANJUT DINAS (GIS) — JAGAJALAN",
      subtitle: `Filter Status: ${statusFilter} • Total ${filteredReports.length} Titik Laporan Terdata`,
      summaryMetrics: [
        { label: "Total Aduan Terpantau", value: `${counts.all} Laporan` },
        { label: "Melewati Tenggat Respons", value: `${counts.overdue} Laporan` },
        { label: "Dalam Masa Tanggap", value: `${counts.inProgress} Laporan` },
        { label: "Tuntas Ditangani", value: `${counts.resolved} Laporan` },
      ],
      columns: reportExportColumns,
      rows: filteredReports,
    });
  };

  const handleExportReportsPDF = () => {
    exportToPDF({
      title: "Laporan Transparansi Pengaduan Warga & Tindak Lanjut Pelayanan Publik",
      subtitle: `Pemetaan Titik Kerusakan Jalan (GIS) & Kepatuhan Tanggapan Instansi Penyelenggara Jalan (${statusFilter})`,
      documentCode: "JGJ-SLA-GIS",
      orientation: "landscape",
      summaryMetrics: [
        {
          label: "Total Aduan Terdata",
          value: `${counts.all} Laporan`,
          sub: "Terpetakan pada Layer GIS",
        },
        {
          label: "Melewati Tenggat Respons",
          value: `${counts.overdue} Laporan`,
          sub: "Memenuhi Syarat Advokasi Ombudsman",
        },
        {
          label: "Dalam Masa Tanggap",
          value: `${counts.inProgress} Laporan`,
          sub: "Dalam Proses Verifikasi / Pengerjaan",
        },
        {
          label: "Tuntas Diperbaiki",
          value: `${counts.resolved} Laporan`,
          sub: "Dokumentasi Fisik Terverifikasi",
        },
      ],
      columns: reportExportColumns,
      rows: filteredReports,
    });
  };

  return (
    <div className="py-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 font-sans text-slate-800 animate-fade-in">
      
      {/* 1. Page Header (Clean, High-Density & Minimalist) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-1">
        <div className="space-y-1">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] font-semibold text-rose-800">
            Pengawasan Pelayanan Publik · Rujukan Ombudsman RI (2026b)
          </p>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Lacak Laporan &amp; Batas Waktu Tanggapan
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleExportReportsExcel}
            title="Unduh Rekapitulasi Laporan Warga & Koordinat GIS dalam format Microsoft Excel (.xls)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80 text-xs font-bold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Unduh Excel</span>
          </button>

          <button
            type="button"
            onClick={handleExportReportsPDF}
            title="Unduh Laporan Pengawasan Pengaduan Warga dalam format PDF"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-orange-50 hover:bg-orange-100 text-[#9a3412] ring-1 ring-orange-200/80 text-xs font-bold transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#c2410c]" />
            <span>Unduh PDF</span>
          </button>

          {counts.overdue > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-rose-50 border border-rose-200/70 text-xs font-semibold text-rose-700">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>{counts.overdue} Aduan Melewati Waktu Acuan</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. SIGNATURE TOP SCOREBOARD & DONUT DISTRIBUTION (Side-by-Side Dual Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left: 4 Interactive Metric Cards (8 cols lg, 9 cols xl) */}
        <div className="lg:col-span-8 xl:col-span-9 rounded-[8px] bg-slate-100/70 p-2 sm:p-2.5 ring-1 ring-orange-200/50 flex flex-col justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 h-full">
            {(() => {
              const totalCount = counts.all || 1;
              const pctOverdue = Math.round((counts.overdue / totalCount) * 100);
              const pctInProgress = Math.round((counts.inProgress / totalCount) * 100);
              const pctResolved = Math.max(0, 100 - pctOverdue - pctInProgress);

              return (
                <>
                  {/* Metric 1: Total Reports */}
                  <button
                    type="button"
                    onClick={() => setStatusFilter("ALL")}
                    className={`p-4 sm:p-4.5 rounded-[8px] bg-white text-left transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden border ${
                      statusFilter === "ALL"
                        ? "border-orange-600 ring-2 ring-orange-400/40 shadow-sm bg-gradient-to-b from-orange-50/20 to-white"
                        : "border-slate-200/80 hover:border-orange-300 hover:shadow-xs"
                    }`}
                  >
                    {/* Header: Label + Icon */}
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <span className="text-xs font-bold text-slate-700 font-sans group-hover:text-slate-900 transition-colors leading-tight">
                        Total Aduan Terpantau
                      </span>
                      <div className="w-8 h-8 rounded-[6px] bg-slate-100 flex items-center justify-center text-slate-700 ring-1 ring-slate-200/70 shrink-0">
                        <FileText className="w-4 h-4 text-slate-700" />
                      </div>
                    </div>

                    {/* Hero Metric: Big Number + Micro-Badge */}
                    <div className="my-2.5 sm:my-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans tabular-nums text-slate-900 tracking-tight leading-none">
                          {counts.all}
                        </span>
                        <span className="text-[10px] sm:text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70 font-sans">
                          100% Total
                        </span>
                      </div>
                      {/* Micro Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2.5 flex">
                        <div className="h-full bg-slate-800 rounded-full w-full" />
                      </div>
                    </div>

                    {/* Subtitle Caption */}
                    <p className="text-[11px] text-slate-500 font-sans font-medium leading-snug">
                      Laporan warga terdaftar resmi
                    </p>
                  </button>

                  {/* Metric 2: Melewati Tenggat Respons (Signal Rose/Red) */}
                  <button
                    type="button"
                    onClick={() => setStatusFilter("OVERDUE")}
                    className={`p-4 sm:p-4.5 rounded-[8px] bg-white text-left transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden border ${
                      statusFilter === "OVERDUE"
                        ? "border-rose-600 ring-2 ring-rose-400/40 shadow-sm bg-gradient-to-b from-rose-50/30 to-white"
                        : "border-rose-200/80 hover:border-rose-400 bg-rose-50/15 hover:bg-rose-50/30 hover:shadow-xs"
                    }`}
                  >
                    {/* Header: Label + Icon */}
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <span className="text-xs font-bold text-rose-700 font-sans leading-tight">
                        Melewati Tenggat Respons
                      </span>
                      <div className="w-8 h-8 rounded-[6px] bg-rose-100/80 flex items-center justify-center ring-1 ring-rose-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/icon/warning_icon.png"
                          alt=""
                          width={20}
                          height={20}
                          style={{ width: "20px", height: "20px" }}
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                    </div>

                    {/* Hero Metric: Big Number + Micro-Badge */}
                    <div className="my-2.5 sm:my-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans tabular-nums text-rose-600 tracking-tight leading-none">
                          {counts.overdue}
                        </span>
                        <span className="text-[10px] sm:text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 font-sans">
                          {pctOverdue}% Kritis
                        </span>
                      </div>
                      {/* Micro Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-rose-100 overflow-hidden mt-2.5 flex">
                        <div
                          className="h-full bg-rose-600 rounded-full transition-all duration-500"
                          style={{ width: `${pctOverdue}%` }}
                        />
                      </div>
                    </div>

                    {/* Subtitle Caption */}
                    <p className="text-[11px] text-rose-700/90 font-sans font-medium leading-snug">
                      Syarat advokasi Ombudsman aktif
                    </p>
                  </button>

                  {/* Metric 3: Dalam Masa Tanggap (Amber) */}
                  <button
                    type="button"
                    onClick={() => setStatusFilter("DALAM_PENGERJAAN")}
                    className={`p-4 sm:p-4.5 rounded-[8px] bg-white text-left transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden border ${
                      statusFilter === "DALAM_PENGERJAAN"
                        ? "border-amber-600 ring-2 ring-amber-400/40 shadow-sm bg-gradient-to-b from-amber-50/30 to-white"
                        : "border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/20 hover:shadow-xs"
                    }`}
                  >
                    {/* Header: Label + Icon */}
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <span className="text-xs font-bold text-amber-800 font-sans leading-tight">
                        Dalam Masa Tanggap
                      </span>
                      <div className="w-8 h-8 rounded-[6px] bg-amber-50 flex items-center justify-center text-amber-700 ring-1 ring-amber-200/80 shrink-0">
                        <Clock className="w-4.5 h-4.5 text-amber-600" />
                      </div>
                    </div>

                    {/* Hero Metric: Big Number + Micro-Badge */}
                    <div className="my-2.5 sm:my-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans tabular-nums text-amber-900 tracking-tight leading-none">
                          {counts.inProgress}
                        </span>
                        <span className="text-[10px] sm:text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-sans">
                          {pctInProgress}% Proses
                        </span>
                      </div>
                      {/* Micro Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-amber-100 overflow-hidden mt-2.5 flex">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${pctInProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Subtitle Caption */}
                    <p className="text-[11px] text-slate-500 font-sans font-medium leading-snug">
                      Masih dalam batas wajar dinas
                    </p>
                  </button>

                  {/* Metric 4: Tuntas Ditangani (Emerald) */}
                  <button
                    type="button"
                    onClick={() => setStatusFilter("SELESAI")}
                    className={`p-4 sm:p-4.5 rounded-[8px] bg-white text-left transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden border ${
                      statusFilter === "SELESAI"
                        ? "border-emerald-600 ring-2 ring-emerald-400/40 shadow-sm bg-gradient-to-b from-emerald-50/30 to-white"
                        : "border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/20 hover:shadow-xs"
                    }`}
                  >
                    {/* Header: Label + Icon */}
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <span className="text-xs font-bold text-emerald-800 font-sans leading-tight">
                        Tuntas Ditangani
                      </span>
                      <div className="w-8 h-8 rounded-[6px] bg-emerald-50 flex items-center justify-center text-emerald-700 ring-1 ring-emerald-200/80 shrink-0">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                      </div>
                    </div>

                    {/* Hero Metric: Big Number + Micro-Badge */}
                    <div className="my-2.5 sm:my-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans tabular-nums text-emerald-800 tracking-tight leading-none">
                          {counts.resolved}
                        </span>
                        <span className="text-[10px] sm:text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-sans">
                          {pctResolved}% Selesai
                        </span>
                      </div>
                      {/* Micro Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-emerald-100 overflow-hidden mt-2.5 flex">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${pctResolved}%` }}
                        />
                      </div>
                    </div>

                    {/* Subtitle Caption */}
                    <p className="text-[11px] text-slate-500 font-sans font-medium leading-snug">
                      Perbaikan lapangan selesai
                    </p>
                  </button>
                </>
              );
            })()}
          </div>
        </div>

        {/* Right: Distribusi Status Aduan Donut Card (4 cols lg, 3 cols xl) */}
        <div className="lg:col-span-4 xl:col-span-3 rounded-[8px] bg-slate-100/70 p-2 sm:p-2.5 ring-1 ring-orange-200/50 flex flex-col">
          <div className="bg-white rounded-[6px] p-3.5 sm:p-4 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] h-full flex flex-col justify-between items-center text-center">
            <StatusDistributionDonut
              counts={counts}
              activeFilter={statusFilter}
              onSelectFilter={setStatusFilter}
            />
          </div>
        </div>
      </div>

      {/* 3. FLOATING ISLAND CONTROLS: SEARCH, FILTER PILLS, SORT & VIEW TOGGLE */}
      <div className="rounded-[8px] bg-slate-100/70 p-2 sm:p-2.5 ring-1 ring-orange-200/50">
        <div className="bg-white rounded-[6px] p-4 sm:p-5 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] space-y-3.5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon/search_icon.png"
                alt=""
                width={16}
                height={16}
                style={{ width: "16px", height: "16px" }}
                className="w-4 h-4 object-contain absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode tiket, nama jalan, atau dinas penanggung jawab..."
                className="w-full pl-10 pr-8 py-2 rounded-[6px] bg-slate-50/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all font-sans ring-1 ring-slate-200/70 focus:ring-orange-500/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort & View Mode Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Sort Dropdown */}
              <CustomSelect
                value={sortBy}
                onChange={setSortBy}
                icon={<ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />}
                align="right"
                options={[
                  { value: "urgency", label: "Prioritas Keterlambatan" },
                  { value: "hazard-desc", label: "Skor Bahaya Tertinggi" },
                  { value: "newest", label: "Laporan Terbaru" },
                ]}
              />

              {/* View Mode Toggle: Grid vs Table */}
              <div className="flex items-center rounded-[6px] bg-slate-100/90 p-0.5 ring-1 ring-slate-200/70">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 px-2.5 rounded-[6px] text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                    viewMode === "grid"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Tampilan Kartu"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Kartu</span>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 px-2.5 rounded-[6px] text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                    viewMode === "table"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Tampilan Tabel Advokasi"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Tabel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Pill Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-[#c2410c] text-white shadow-2xs font-bold"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 ring-1 ring-slate-200/60"
                }`}
              >
                Semua ({counts.all})
              </button>

              <button
                onClick={() => setStatusFilter("OVERDUE")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  statusFilter === "OVERDUE"
                    ? "bg-rose-600 text-white shadow-2xs font-bold"
                    : "bg-slate-50 hover:bg-rose-50/60 text-slate-700 ring-1 ring-slate-200/60"
                }`}
              >
                <span>Melewati Tenggat ({counts.overdue})</span>
              </button>

              <button
                onClick={() => setStatusFilter("DALAM_PENGERJAAN")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  statusFilter === "DALAM_PENGERJAAN"
                    ? "bg-amber-600 text-white shadow-2xs font-bold"
                    : "bg-slate-50 hover:bg-amber-50/60 text-slate-700 ring-1 ring-slate-200/60"
                }`}
              >
                <span>Dalam Tanggapan ({counts.inProgress})</span>
              </button>

              <button
                onClick={() => setStatusFilter("SELESAI")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  statusFilter === "SELESAI"
                    ? "bg-emerald-700 text-white shadow-2xs font-bold"
                    : "bg-slate-50 hover:bg-emerald-50/60 text-slate-700 ring-1 ring-slate-200/60"
                }`}
              >
                <span>Selesai ({counts.resolved})</span>
              </button>
            </div>

            <div className="text-xs text-slate-400 font-sans">
              Menampilkan <strong>{filteredReports.length}</strong> aduan
            </div>
          </div>
        </div>
      </div>

      {/* 4. CONTENT DISPLAY (GRID OR TABLE) */}
      {filteredReports.length === 0 ? (
        <div className="rounded-[8px] bg-slate-100/70 p-2 sm:p-2.5 ring-1 ring-orange-200/50">
          <div className="bg-white rounded-[6px] p-10 text-center space-y-3 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)]">
            <AlertCircle className="w-9 h-9 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Aduan yang Cocok</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Tidak ditemukan aduan dengan kata kunci atau filter saat ini. Silakan ubah kriteria pencarian Anda.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="px-4 py-2 rounded-[6px] text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* ===== SIGNATURE CARD GRID (Modern Radial Gauge & Stepper Architecture) ===== */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {paginatedReports.map((report) => {
            const isOverdue = report.status === "OVERDUE";
            const isCompleted = report.status === "SELESAI";
            const reportDateStr = new Date(report.reportDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={report.id}
                className="rounded-[8px] bg-slate-100/70 p-2 sm:p-2.5 ring-1 ring-orange-200/40 group transition-all duration-200"
              >
                <div className="bg-white rounded-[6px] p-5 sm:p-6 flex flex-col justify-between h-full gap-4 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] border border-slate-200/70">
                  
                  {/* Row 1: Ticket Header & Status Pill */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono tabular-nums text-xs font-bold px-2.5 py-1 rounded-[6px] bg-slate-100 text-slate-800 border border-slate-200/60">
                        #{report.ticketCode}
                      </span>
                      <span className="text-xs text-slate-500 font-sans font-medium">
                        {reportDateStr}
                      </span>
                    </div>

                    {/* Status Badge */}
                    {isOverdue ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 ring-1 ring-rose-200/80 font-sans">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Lewat Tenggat (+{report.daysOverdue} Hari)</span>
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Selesai Ditangani</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 ring-1 ring-amber-200/80 font-sans">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Dalam Masa Tanggap</span>
                      </span>
                    )}
                  </div>

                  {/* Row 2: Road Info & Attributes (Left) + Circular Hazard Gauge (Right) */}
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    {/* Left: Road Info + Two-Pill Attributes */}
                    <div className="space-y-3 flex-1 min-w-0">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base sm:text-lg font-heading leading-snug tracking-tight group-hover:text-orange-950 transition-colors">
                          {report.roadName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-sans mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />
                          <span className="truncate">{report.address} ({report.district})</span>
                        </div>
                      </div>

                      {/* Two Attribute Pills Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        {/* Pill 1: Kategori Kerusakan */}
                        <div className="flex items-center gap-2.5 p-2 sm:px-3 rounded-[6px] bg-slate-50/90 border border-slate-200/70 text-xs font-sans text-slate-800 min-h-[42px]">
                          <div className="w-6 h-6 rounded-[4px] bg-white text-slate-700 flex items-center justify-center shrink-0 shadow-2xs border border-slate-200/60">
                            <AlertOctagon className="w-3.5 h-3.5 text-slate-700" />
                          </div>
                          <span className="font-semibold text-slate-800 text-xs truncate" title={report.categoryLabel}>
                            {report.categoryLabel}
                          </span>
                        </div>

                        {/* Pill 2: Instansi Wewenang */}
                        <div className="flex items-center gap-2.5 p-2 sm:px-3 rounded-[6px] bg-slate-50/90 border border-slate-200/70 text-xs font-sans text-slate-800 min-h-[42px]">
                          <div className="w-6 h-6 rounded-[4px] bg-white text-slate-700 flex items-center justify-center shrink-0 shadow-2xs border border-slate-200/60">
                            <Building2 className="w-3.5 h-3.5 text-slate-700" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-800 text-xs block truncate" title={report.authorityLabel}>
                              {report.authorityLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Circular Gauge Skor Bahaya */}
                    <HazardRadialGauge score={report.hazardScore} />
                  </div>

                  {/* Row 3: Boxed SLA Stepper Track (With Lock / Overdue / Completed States) */}
                  <div className="p-3 sm:p-3.5 rounded-[8px] bg-slate-50/80 border border-slate-200/70 space-y-2 select-none">
                    <div className="relative flex items-center h-5 w-full">
                      {/* Base Track Line */}
                      {isCompleted ? (
                        <div className="h-1.5 w-full rounded-full bg-emerald-500" />
                      ) : isOverdue ? (
                        <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600" />
                      ) : (
                        <div className="relative w-full h-1.5 flex items-center">
                          {/* Left solid half */}
                          <div className="w-1/2 h-full bg-[#ea580c] rounded-l-full" />
                          {/* Right dashed half */}
                          <div className="w-1/2 h-0 border-t-2 border-dashed border-slate-300" />
                        </div>
                      )}

                      {/* Node 1: H-0 Lapor (Left: ~8%) */}
                      <div
                        className={`absolute left-[8%] -translate-x-1/2 w-5 h-5 rounded-full border-2 border-white shadow-2xs flex items-center justify-center ${
                          isCompleted
                            ? "bg-emerald-600 text-white"
                            : "bg-orange-100 text-[#c2410c]"
                        }`}
                        title="Laporan diterima resmi (H-0)"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>

                      {/* Node 2: Masa Tanggap (Center: ~50%) */}
                      <div
                        className={`absolute left-[50%] -translate-x-1/2 flex items-center justify-center ${
                          isCompleted
                            ? "w-5 h-5 rounded-full bg-emerald-600 text-white border-2 border-white shadow-2xs"
                            : isOverdue
                            ? "w-5 h-5 rounded-full bg-rose-600 text-white border-2 border-white shadow-2xs"
                            : "w-5 h-5 rounded-full bg-[#ea580c] text-white border-2 border-white ring-4 ring-orange-200 shadow-2xs"
                        }`}
                        title={
                          isCompleted
                            ? "Respons & Perbaikan Lapangan Selesai"
                            : isOverdue
                            ? "Batas Tanggap 14 Hari Kerja Terlampaui"
                            : "Dalam Batas Wajar Respons (Maks. 14 Hari Kerja UU 25/2009)"
                        }
                      >
                        {isCompleted ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                        )}
                      </div>

                      {/* Node 3: Batas Tenggat / Ombudsman (Right: ~92%) */}
                      <div
                        className={`absolute left-[92%] -translate-x-1/2 w-5 h-5 rounded-full border-2 border-white shadow-2xs flex items-center justify-center ${
                          isCompleted
                            ? "bg-emerald-600 text-white"
                            : isOverdue
                            ? "bg-rose-600 text-white ring-4 ring-rose-200 animate-pulse"
                            : "bg-slate-200 text-slate-500"
                        }`}
                        title={
                          isCompleted
                            ? "Perbaikan Fisik Selesai"
                            : isOverdue
                            ? "Eskalasi Draf Ombudsman RI Aktif"
                            : "Eskalasi Terkunci (Aktif jika lewat batas 14 hari kerja)"
                        }
                      >
                        {isCompleted ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : isOverdue ? (
                          <AlertTriangle className="w-3 h-3 text-white" />
                        ) : (
                          <Lock className="w-3 h-3 text-slate-500" />
                        )}
                      </div>
                    </div>

                    {/* Timeline Text Labels */}
                    <div className="flex justify-between text-[10px] font-sans pt-1">
                      <span className="text-slate-500 font-medium">H-0 Lapor</span>
                      
                      <div className="text-center">
                        <span className="font-bold text-slate-800 block">
                          {isCompleted ? "Tuntas Sesuai Target" : isOverdue ? "Lewat Tenggat" : "Masa Tanggap"}
                        </span>
                        <span className="text-[9.5px] text-slate-500 font-medium block">
                          {isCompleted
                            ? "(Perbaikan Lapangan)"
                            : isOverdue
                            ? `(+${report.daysOverdue} Hari Terlambat)`
                            : "(Hari 7/14)"}
                        </span>
                      </div>

                      <span className={`font-medium ${isOverdue ? "text-rose-600 font-bold" : "text-slate-400"}`}>
                        {isCompleted ? "Tuntas Ditangani" : isOverdue ? "Ombudsman RI (Aktif)" : "Batas Tenggat / Ombudsman"}
                      </span>
                    </div>
                  </div>

                  {/* Row 4: Action Footer */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Cek Peta GIS */}
                      <button
                        type="button"
                        onClick={() => onSelectRoadOnMap && onSelectRoadOnMap(report.roadSegmentId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer font-sans"
                      >
                        <span>Cek Peta GIS</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      {/* Pantau Notifikasi */}
                      <button
                        type="button"
                        onClick={() => handleToggleTicketSubscription(report)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-semibold shadow-2xs transition-colors cursor-pointer font-sans border ${
                          subscribedTickets.includes(report.ticketCode)
                            ? "bg-orange-50 text-[#c2410c] border-orange-200/80 font-bold"
                            : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50"
                        }`}
                      >
                        {subscribedTickets.includes(report.ticketCode) ? (
                          <>
                            <BellRing className="w-3.5 h-3.5 text-[#c2410c]" />
                            <span>Notifikasi Aktif</span>
                          </>
                        ) : (
                          <>
                            <Bell className="w-3.5 h-3.5 text-slate-400" />
                            <span>Pantau Notifikasi</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Ombudsman Action Button */}
                    {isOverdue ? (
                      <button
                        type="button"
                        onClick={() => onOpenOmbudsmanDraft && onOpenOmbudsmanDraft(report)}
                        className="inline-flex items-center gap-2 pl-3.5 pr-2.5 py-1.5 rounded-[6px] bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98] font-sans"
                      >
                        <span>Siapkan Draf Ombudsman</span>
                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                          <FileText className="w-3 h-3 text-white" />
                        </span>
                      </button>
                    ) : isCompleted ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/70 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tindak Lanjut Tuntas</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed border border-slate-200/70 font-sans"
                        title="Tombol advokasi Ombudsman aktif secara otomatis bila laporan melampaui batas waktu 14 hari kerja (UU 25/2009)"
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Draf Ombudsman (Aktif Saat Lewat Tenggat)</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ===== SIGNATURE TABLE VIEW (Zero Horizontal Scroll, Double-Bezel Tray) ===== */
        <div className="rounded-[8px] bg-slate-100/70 p-2 sm:p-2.5 ring-1 ring-orange-200/50">
          <div className="bg-white rounded-[6px] shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] overflow-hidden">
            <table className="w-full text-left text-xs font-sans md:table-fixed">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4 md:w-[35%]">Tiket &amp; Ruas Jalan</th>
                  <th className="py-3 px-3 md:w-[25%] hidden sm:table-cell">Wewenang Dinas</th>
                  <th className="py-3 px-3 md:w-[15%] hidden md:table-cell">Kerusakan</th>
                  <th className="py-3 px-3 text-center md:w-[12%]">Status Batas Waktu Respons</th>
                  <th className="py-3 px-4 text-right md:w-[13%]">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedReports.map((report) => {
                  const isOverdue = report.status === "OVERDUE";
                  const isCompleted = report.status === "SELESAI";

                  return (
                    <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 truncate">{report.roadName}</div>
                        <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-slate-700 font-semibold">#{report.ticketCode}</span>
                          <span>•</span>
                          <span>{report.district}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 truncate hidden sm:table-cell">
                        <span className="font-medium text-slate-800">{report.authorityLabel}</span>
                      </td>
                      <td className="py-3 px-3 truncate hidden md:table-cell">
                        <span className="text-slate-700 font-medium">{report.categoryLabel}</span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isOverdue ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-[5px] text-[10px] font-bold bg-rose-50 text-rose-700 ring-1 ring-rose-200/60">
                            <span>+{report.daysOverdue} Hari</span>
                          </span>
                        ) : isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[5px] text-[10px] font-medium bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Selesai</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[5px] text-[10px] font-medium bg-amber-50 text-amber-800 ring-1 ring-amber-200/60">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Berjalan</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isOverdue ? (
                          <button
                            onClick={() => onOpenOmbudsmanDraft && onOpenOmbudsmanDraft(report)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] transition-colors cursor-pointer active:scale-95 shadow-2xs"
                          >
                            <span>Draf Advokasi</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectRoadOnMap && onSelectRoadOnMap(report.roadSegmentId)}
                            className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            Peta GIS
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. CLEAN PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-1 font-sans text-xs">
          <div className="text-slate-500">
            Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (
            {filteredReports.length} aduan total)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-[6px] border border-slate-200/80 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Sebelumnya
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-[6px] text-xs font-bold transition-all cursor-pointer tabular-nums ${
                  currentPage === i + 1
                    ? "bg-[#c2410c] text-white shadow-2xs"
                    : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-[6px] border border-slate-200/80 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}

      {/* 6. STREAMLINED 3-STEP ADVOCACY GUIDE (Double-Bezel Tray) */}
      <div className="rounded-[8px] bg-slate-100/70 p-2 sm:p-2.5 ring-1 ring-orange-200/50">
        <div className="bg-white rounded-[6px] p-6 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="w-4 h-4 text-[#c2410c]" />
            <h3 className="font-bold text-slate-900 text-sm font-heading">
              Alur Penegakan Maladministrasi: Penundaan Penanganan (Undue Delay)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-sans">
            <div className="p-4 rounded-[6px] bg-slate-50/70 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                LANGKAH 01
              </span>
              <strong className="text-slate-900 block text-xs font-bold">Laporan Geotagged &amp; Validasi AI</strong>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Foto kerusakan diverifikasi AI Vision dan langsung dikunci ke dinas penanggung jawab sesuai SK batas jalan resmi.
              </p>
            </div>

            <div className="p-4 rounded-[6px] bg-slate-50/70 space-y-1.5">
              <span className="text-[10px] font-bold text-amber-700 tracking-wider uppercase block">
                LANGKAH 02
              </span>
              <strong className="text-slate-900 block text-xs font-bold">Masa Tanggap Resmi Dinas</strong>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Dinas berwenang diberikan batas waktu resmi untuk merespons dan menjadwalkan perbaikan fisik jalan.
              </p>
            </div>

            <div className="p-4 rounded-[6px] bg-rose-50/50 space-y-1.5 ring-1 ring-rose-200/50">
              <span className="text-[10px] font-bold text-rose-700 tracking-wider uppercase block">
                LANGKAH 03
              </span>
              <strong className="text-rose-950 block text-xs font-bold">Complaint Guidance &amp; Draft Generator (UU 37/2008)</strong>
              <p className="text-[11px] text-rose-900/80 leading-relaxed">
                Jika aduan tidak ditanggapi melampaui batas waktu acuan, warga dapat menyusun draf resmi pengaduan maladministrasi untuk disampaikan ke Ombudsman RI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
