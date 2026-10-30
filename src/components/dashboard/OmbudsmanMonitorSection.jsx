"use client";

import React, { useState, useMemo } from "react";
import {
  Shield,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  ExternalLink,
  MapPin,
  Scale,
  Calendar,
  AlertCircle,
  LayoutGrid,
  Table as TableIcon,
  ArrowUpDown,
  FileCheck2,
  DownloadCloud,
} from "lucide-react";

export default function OmbudsmanMonitorSection({
  reports = [],
  onOpenOmbudsmanDraft,
  onSelectRoadOnMap,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL" | "OVERDUE" | "DALAM_PENGERJAAN" | "SELESAI"
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [sortBy, setSortBy] = useState("urgency"); // "urgency" | "newest" | "hazard-desc"
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

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

  return (
    <div className="py-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 font-sans text-slate-800 animate-fade-in">
      
      {/* 1. SIGNATURE HEADER */}
      <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-50 border border-orange-200/80 p-2 shadow-2xs shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon/time.png"
                alt="Pengawasan Ombudsman"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  <span>Standar Layanan Publik &amp; Ombudsman RI</span>
                </span>
                <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
                  UU No. 25/2009 jo. UU No. 37/2008
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
                Pusat Pemantauan SLA &amp; Eskalasi Ombudsman
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed font-sans">
                Menghitung mundur batas toleransi respons dinas (14 hari kerja). Laporan yang melewati tenggat dapat langsung dieskalasi sebagai dugaan maladministrasi.
              </p>
            </div>
          </div>

          {/* SLA Status Chip */}
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs shrink-0 lg:max-w-xs space-y-1 self-start lg:self-auto">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                <span>Batas Respons Wajib</span>
              </span>
              <span className="font-bold text-rose-600 tabular-nums">
                {counts.overdue} Aduan Terlambat
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Dinas diwajibkan memberikan kepastian jadwal kerja dalam 14 hari.
            </p>
          </div>
        </div>
      </div>

      {/* 2. SIGNATURE 4-METRIC SCOREBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Total Reports */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 font-sans">
              Total Aduan Terpantau
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-slate-900 tracking-tight">
              {counts.all}
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Laporan warga terdaftar resmi
            </p>
          </div>
        </div>

        {/* Metric 2: Overdue (Red Priority) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-rose-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-700 font-sans">
              Melewati Tenggat (&gt;14 Hari)
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center p-0.5">
              <img src="/icon/warning_icon.png" alt="" className="w-5 h-5 object-contain" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-rose-600 tracking-tight">
              {counts.overdue}
            </div>
            <p className="text-[11px] text-rose-600/80 font-sans mt-0.5 font-medium">
              Memenuhi syarat advokasi Ombudsman
            </p>
          </div>
        </div>

        {/* Metric 3: In Progress */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 font-sans">
              Dalam Masa Tanggap
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-amber-800 tracking-tight">
              {counts.inProgress}
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Masih dalam batas wajar dinas
            </p>
          </div>
        </div>

        {/* Metric 4: Resolved */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 font-sans">
              Tuntas Ditangani
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-emerald-800 tracking-tight">
              {counts.resolved}
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Perbaikan lapangan selesai
            </p>
          </div>
        </div>
      </div>

      {/* Benchmark Banner */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Scale className="w-4 h-4 text-orange-700 shrink-0" />
          <span>
            <strong>Fakta Maladministrasi Nasional (Laptah Ombudsman RI):</strong> Sebanyak <strong>33,8%</strong> aduan publik nasional bersumber dari <em>penundaan berlarut (undue delay)</em> oleh dinas daerah.
          </span>
        </div>
        <span className="text-[11px] text-slate-400 shrink-0">Sumber: Laporan Tahunan Ombudsman RI</span>
      </div>

      {/* 3. CONTROLS BAR: SEARCH, STATUS TABS, SORT & VIEW TOGGLE */}
      <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <img src="/icon/search_icon.png" alt="" className="w-4 h-4 object-contain absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode tiket, nama jalan, atau dinas penanggung jawab..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all font-sans"
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
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer font-sans"
              >
                <option value="urgency">Prioritas Keterlambatan</option>
                <option value="hazard-desc">Skor Bahaya Tertinggi</option>
                <option value="newest">Laporan Terbaru</option>
              </select>
            </div>

            {/* View Mode Toggle: Grid vs Table */}
            <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Tampilan Kartu"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Kartu</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-2xs"
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

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80"
              }`}
            >
              Semua ({counts.all})
            </button>

            <button
              onClick={() => setStatusFilter("OVERDUE")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                statusFilter === "OVERDUE"
                  ? "bg-rose-600 text-white shadow-2xs font-bold"
                  : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Melewati Tenggat ({counts.overdue})</span>
            </button>

            <button
              onClick={() => setStatusFilter("DALAM_PENGERJAAN")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                statusFilter === "DALAM_PENGERJAAN"
                  ? "bg-amber-600 text-white shadow-2xs font-bold"
                  : "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Dalam Tanggapan ({counts.inProgress})</span>
            </button>

            <button
              onClick={() => setStatusFilter("SELESAI")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                statusFilter === "SELESAI"
                  ? "bg-emerald-700 text-white shadow-2xs font-bold"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Selesai ({counts.resolved})</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-sans">
            Menampilkan <strong>{filteredReports.length}</strong> aduan
          </div>
        </div>
      </div>

      {/* 4. CONTENT DISPLAY (GRID OR TABLE) */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-3 shadow-xs">
          <AlertCircle className="w-9 h-9 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Aduan yang Cocok</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Tidak ditemukan aduan dengan kata kunci atau filter saat ini. Silakan ubah pencarian Anda.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
          >
            Reset Filter
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ===== SIGNATURE CARD GRID ===== */
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
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between gap-4 group ${
                  isOverdue
                    ? "border-rose-300 hover:shadow-md hover:border-rose-400"
                    : isCompleted
                    ? "border-slate-200/80 hover:border-emerald-300 hover:shadow-md"
                    : "border-slate-200/80 hover:border-amber-300 hover:shadow-md"
                }`}
              >
                {/* Top Section */}
                <div className="space-y-3">
                  {/* Ticket Header & Status Pill */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 shadow-2xs">
                        #{report.ticketCode}
                      </span>
                      <span className="text-[11px] text-slate-400 font-sans">
                        Lapor: {reportDateStr}
                      </span>
                    </div>

                    {/* Status Badge */}
                    {isOverdue ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                        <span>Lewat Tenggat (+{report.daysOverdue} Hari)</span>
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-sans">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Selesai Ditangani</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-medium bg-amber-50 text-amber-800 border border-amber-200 font-sans">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Dalam Masa Tanggap</span>
                      </span>
                    )}
                  </div>

                  {/* Road Title & Location */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-base font-heading leading-snug group-hover:text-orange-950 transition-colors">
                      {report.roadName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-sans">
                      <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span className="truncate">{report.address} ({report.district})</span>
                    </div>
                  </div>

                  {/* Damage Hazard Badge & Short Summary */}
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 font-sans">
                    <span className="font-semibold text-slate-700 truncate">
                      {report.categoryLabel}
                    </span>
                    <span className={`font-bold tabular-nums text-xs px-2 py-0.5 rounded shrink-0 ${
                      report.hazardScore >= 85 ? "bg-rose-50 text-rose-700" : "bg-orange-50 text-orange-800"
                    }`}>
                      Skor Bahaya {report.hazardScore}/100
                    </span>
                  </div>

                  {/* Responsible Authority Box */}
                  <div className="flex items-center justify-between text-xs text-slate-600 font-sans pt-0.5">
                    <span className="text-slate-400 text-[11px]">Wewenang Dinas:</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[240px]">
                      {report.authorityLabel}
                    </span>
                  </div>

                  {/* Dual-Phase SLA Timeline Bar */}
                  <div className="space-y-1.5 pt-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="flex items-center justify-between text-[11px] font-sans">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span>SLA Respons Pelayanan Publik:</span>
                      </span>
                      <span className={isOverdue ? "text-rose-700 font-bold tabular-nums" : isCompleted ? "text-emerald-700 font-bold" : "text-amber-800 font-semibold"}>
                        {isOverdue ? `Lewat +${report.daysOverdue} Hari` : isCompleted ? "Selesai Tepat Waktu" : "Hari ke-8 dari 14 Hari"}
                      </span>
                    </div>

                    {/* Dual-Phase Bar Graphic */}
                    <div className="space-y-1">
                      <div className="flex h-2 rounded-full overflow-hidden bg-slate-200/80 p-0.5 gap-0.5">
                        {/* Phase 1: 14 Days Legal Threshold */}
                        <div
                          className={`h-full rounded-l-full transition-all duration-500 ${
                            isCompleted
                              ? "w-full bg-emerald-500 rounded-r-full"
                              : isOverdue
                              ? "w-[65%] bg-amber-500"
                              : "w-[50%] bg-amber-500"
                          }`}
                          title="Fase 1 (Hari 1-14): Masa Toleransi Respons Resmi Dinas"
                        />
                        {/* Phase 2: Overdue / Maladministration Zone */}
                        {isOverdue && (
                          <div
                            className="h-full w-[35%] bg-gradient-to-r from-rose-500 to-red-600 rounded-r-full animate-pulse"
                            title="Fase 2 (Hari 15+): Pelanggaran Maladministrasi Penundaan Berlarut (Undue Delay)"
                          />
                        )}
                      </div>

                      {/* Timeline Markers */}
                      <div className="flex justify-between text-[9.5px] text-slate-400 font-medium font-sans px-0.5">
                        <span>H-0 Lapor</span>
                        <span className="font-bold text-slate-600">Batas 14 Hari (UU 25/2009)</span>
                        <span className={isOverdue ? "text-rose-600 font-bold" : "text-slate-400"}>
                          {isOverdue ? "Ombudsman RI" : "Selesai"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onSelectRoadOnMap && onSelectRoadOnMap(report.roadSegmentId)}
                    className="text-slate-600 hover:text-slate-900 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors font-sans"
                  >
                    <span>Cek di Peta GIS</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isOverdue ? (
                    <button
                      onClick={() => onOpenOmbudsmanDraft && onOpenOmbudsmanDraft(report)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-md font-sans active:scale-[0.98]"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Siapkan Draf Ombudsman</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 font-sans">
                      {isCompleted ? "Tindak Lanjut Tuntas" : "Aktif jika lewat 14 hari"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ===== SIGNATURE TABLE VIEW ===== */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10.5px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tiket &amp; Ruas Jalan</th>
                  <th className="py-3 px-3">Wewenang Dinas</th>
                  <th className="py-3 px-3">Kerusakan</th>
                  <th className="py-3 px-3 text-center">Status SLA</th>
                  <th className="py-3 px-3 text-center">Keterlambatan</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedReports.map((report) => {
                  const isOverdue = report.status === "OVERDUE";
                  const isCompleted = report.status === "SELESAI";

                  return (
                    <tr key={report.id} className="hover:bg-orange-50/40 transition-colors">
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 truncate">{report.roadName}</div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <span className="font-mono text-slate-700 font-semibold">#{report.ticketCode}</span>
                          <span>•</span>
                          <span>{report.district}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-[200px] truncate">
                        <span className="font-medium text-slate-800">{report.authorityLabel}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-slate-800 font-medium">{report.categoryLabel}</span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isOverdue ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Lewat Tenggat
                          </span>
                        ) : isCompleted ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Selesai
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            Berjalan
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap tabular-nums">
                        {isOverdue ? (
                          <strong className="text-rose-600 font-bold">+{report.daysOverdue} Hari</strong>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isOverdue ? (
                          <button
                            onClick={() => onOpenOmbudsmanDraft && onOpenOmbudsmanDraft(report)}
                            className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-orange-700 hover:bg-orange-800 shadow-2xs transition-colors cursor-pointer"
                          >
                            Draf Advokasi
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectRoadOnMap && onSelectRoadOnMap(report.roadSegmentId)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            Peta
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
        <div className="flex items-center justify-between gap-4 pt-2 font-sans text-xs">
          <div className="text-slate-500">
            Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (
            {filteredReports.length} aduan total)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Sebelumnya
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all cursor-pointer tabular-nums ${
                  currentPage === i + 1
                    ? "bg-orange-700 text-white border-orange-700 shadow-2xs"
                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}

      {/* 6. STREAMLINED 3-STEP ADVOCACY GUIDE */}
      <div className="bg-white/95 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield className="w-4 h-4 text-orange-700" />
          <h3 className="font-bold text-slate-900 text-sm font-heading">
            Alur Penegakan Maladministrasi (Undue Delay)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
              LANGKAH 01
            </span>
            <strong className="text-slate-900 block text-xs font-bold">Laporan Geotagged &amp; Validasi AI</strong>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Foto kerusakan diverifikasi AI Vision dan langsung dikunci ke dinas penanggung jawab sesuai SK batas jalan resmi.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1.5">
            <span className="text-[10px] font-bold text-amber-700 tracking-wider uppercase block">
              LANGKAH 02
            </span>
            <strong className="text-slate-900 block text-xs font-bold">Masa Tanggap 14 Hari (UU 25/2009)</strong>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Dinas berwenang diberikan tenggat hukum 14 hari kerja untuk merespons dan menjadwalkan perbaikan fisik jalan.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/70 space-y-1.5">
            <span className="text-[10px] font-bold text-rose-700 tracking-wider uppercase block">
              LANGKAH 03
            </span>
            <strong className="text-rose-950 block text-xs font-bold">Draf Laporan Ombudsman (UU 37/2008)</strong>
            <p className="text-[11px] text-rose-900/80 leading-relaxed">
              Jika diabaikan, warga dapat men-generate draf resmi pengaduan maladministrasi untuk diserahkan ke Ombudsman RI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
