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
  ArrowRight,
  FileCheck2,
  DownloadCloud,
  FileSpreadsheet,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/exportTransparencyData";

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

  const reportExportColumns = useMemo(
    () => [
      { header: "Kode Tiket", key: "ticketCode", mono: true },
      {
        header: "Tanggal Lapor",
        mono: true,
        accessor: (rep) =>
          rep.reportDate ? new Date(rep.reportDate).toLocaleDateString("id-ID") : "-",
      },
      { header: "Ruas Jalan", key: "roadName" },
      { header: "Alamat / Titik Lokasi", key: "address" },
      {
        header: "Koordinat GIS (Lat, Lng)",
        mono: true,
        accessor: (rep) =>
          Array.isArray(rep.coordinates)
            ? `${Number(rep.coordinates[0]).toFixed(5)}, ${Number(rep.coordinates[1]).toFixed(5)}`
            : "-",
      },
      { header: "Kewenangan", key: "authority" },
      { header: "Instansi Penanggung Jawab", key: "authorityLabel" },
      { header: "Kategori Kerusakan", key: "categoryLabel" },
      {
        header: "Indeks Bahaya AI",
        align: "center",
        mono: true,
        accessor: (rep) => `${rep.hazardScore || 0}/100`,
      },
      {
        header: "Status Tindak Lanjut",
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
            Pengawasan Pelayanan Publik
          </p>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Lacak Laporan &amp; Batas Waktu Tanggapan
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-sans max-w-2xl">
            Pantau linimasa respons dan estimasi batas waktu tanggap acuan (14 hari kerja sejak laporan diterima dinas sesuai Pasal 44 UU 25/2009) serta manfaatkan Complaint Guidance &amp; Draft Generator jika terjadi penundaan berlarut.
          </p>
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

      {/* 2. SIGNATURE 4-METRIC SCOREBOARD (Interactive Click-to-Filter) */}
      <div className="rounded-[8px] bg-slate-100/70 p-2 sm:p-2.5 ring-1 ring-orange-200/50">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Metric 1: Total Reports */}
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`p-4 sm:p-5 rounded-[6px] bg-white text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 group ${
              statusFilter === "ALL"
                ? "ring-2 ring-orange-600 shadow-sm"
                : "hover:bg-slate-50/70 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 font-sans group-hover:text-slate-800 transition-colors">
                Total Aduan Terpantau
              </span>
              <div className="w-7 h-7 rounded-[6px] bg-slate-50 flex items-center justify-center text-slate-700 ring-1 ring-slate-200/60">
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
          </button>

          {/* Metric 2: Overdue (Signal Color) */}
          <button
            type="button"
            onClick={() => setStatusFilter("OVERDUE")}
            className={`p-4 sm:p-5 rounded-[6px] bg-white text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 group ${
              statusFilter === "OVERDUE"
                ? "ring-2 ring-rose-600 shadow-sm"
                : "ring-1 ring-rose-200/60 hover:bg-rose-50/30 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-rose-700 font-sans">
                Melewati Tenggat Respons
              </span>
              <div className="w-7 h-7 rounded-[6px] bg-rose-50 flex items-center justify-center p-1 ring-1 ring-rose-200/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icon/warning_icon.png"
                  alt=""
                  width={18}
                  height={18}
                  style={{ width: "18px", height: "18px" }}
                  className="w-4.5 h-4.5 object-contain"
                />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-rose-600 tracking-tight">
                {counts.overdue}
              </div>
              <p className="text-[11px] text-rose-600/80 font-sans mt-0.5 font-medium">
                Syarat advokasi Ombudsman aktif
              </p>
            </div>
          </button>

          {/* Metric 3: In Progress */}
          <button
            type="button"
            onClick={() => setStatusFilter("DALAM_PENGERJAAN")}
            className={`p-4 sm:p-5 rounded-[6px] bg-white text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 group ${
              statusFilter === "DALAM_PENGERJAAN"
                ? "ring-2 ring-amber-600 shadow-sm"
                : "hover:bg-amber-50/30 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 font-sans group-hover:text-slate-800 transition-colors">
                Dalam Masa Tanggap
              </span>
              <div className="w-7 h-7 rounded-[6px] bg-amber-50/80 flex items-center justify-center text-amber-700 ring-1 ring-amber-200/60">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-sans tabular-nums text-amber-900 tracking-tight">
                {counts.inProgress}
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Masih dalam batas wajar dinas
              </p>
            </div>
          </button>

          {/* Metric 4: Resolved */}
          <button
            type="button"
            onClick={() => setStatusFilter("SELESAI")}
            className={`p-4 sm:p-5 rounded-[6px] bg-white text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 group ${
              statusFilter === "SELESAI"
                ? "ring-2 ring-emerald-600 shadow-sm"
                : "hover:bg-emerald-50/30 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 font-sans group-hover:text-slate-800 transition-colors">
                Tuntas Ditangani
              </span>
              <div className="w-7 h-7 rounded-[6px] bg-emerald-50/80 flex items-center justify-center text-emerald-700 ring-1 ring-emerald-200/60">
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
          </button>
        </div>
      </div>

      {/* Benchmark Banner (Floating Pill Island) */}
      <div className="p-3 sm:p-3.5 rounded-[6px] bg-slate-50/90 ring-1 ring-orange-200/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-sans">
        <div className="flex items-center gap-2.5 text-slate-700">
          <Scale className="w-4 h-4 text-[#c2410c] shrink-0" />
          <span>
            <strong>Fakta Maladministrasi Nasional:</strong> Sebanyak <strong>33,8%</strong> aduan publik bersumber dari <em>penundaan berlarut (undue delay)</em> oleh aparatur penyelenggara pelayanan.
          </span>
        </div>
        <span className="text-[11px] text-slate-400 shrink-0 font-medium">Sumber: Laporan Tahunan Ombudsman RI</span>
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
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-slate-50/80 ring-1 ring-slate-200/70 text-xs">
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
        /* ===== SIGNATURE CARD GRID (Double-Bezel Architecture) ===== */
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
                className="rounded-[8px] bg-slate-100/70 p-2 ring-1 ring-orange-200/40 group transition-all duration-200"
              >
                <div className="bg-white rounded-[6px] p-5 flex flex-col justify-between h-full gap-4 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)]">
                  {/* Top Section */}
                  <div className="space-y-3">
                    {/* Ticket Header & Status Pill */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-sans tabular-nums text-xs font-bold px-2.5 py-1 rounded-[6px] bg-slate-100 text-slate-800">
                          #{report.ticketCode}
                        </span>
                        <span className="text-[11px] text-slate-400 font-sans">
                          Lapor: {reportDateStr}
                        </span>
                      </div>

                      {/* Status Badge */}
                      {isOverdue ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-[5px] text-[10.5px] font-bold bg-rose-50 text-rose-700 ring-1 ring-rose-200/70 font-sans">
                          <span>Lewat Tenggat (+{report.daysOverdue} Hari)</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] text-[10.5px] font-medium bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/70 font-sans">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Selesai Ditangani</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] text-[10.5px] font-medium bg-amber-50 text-amber-800 ring-1 ring-amber-200/70 font-sans">
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

                    {/* Damage Hazard Pill & Short Summary */}
                    <div className="flex items-center justify-between text-xs p-2.5 rounded-[6px] bg-slate-50/80 font-sans">
                      <span className="font-semibold text-slate-700 truncate">
                        {report.categoryLabel}
                      </span>
                      <span className={`font-bold tabular-nums text-xs px-2 py-0.5 rounded-md shrink-0 ${
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
                    <div className="space-y-1.5 pt-1.5 p-3 rounded-[6px] bg-slate-50/80">
                      <div className="flex items-center justify-between text-[11px] font-sans">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                          <span>SLA Respons Pelayanan Publik:</span>
                        </span>
                        <span className={isOverdue ? "text-rose-700 font-bold tabular-nums" : isCompleted ? "text-emerald-700 font-bold" : "text-amber-800 font-semibold"}>
                          {isOverdue ? `Lewat +${report.daysOverdue} Hari` : isCompleted ? "Selesai Tepat Waktu" : "Dalam Masa Pemantauan"}
                        </span>
                      </div>

                      {/* Dual-Phase Bar Graphic */}
                      <div className="space-y-1">
                        <div className="flex h-2 rounded-full overflow-hidden bg-slate-200/80 p-0.5 gap-0.5">
                          <div
                            className={`h-full rounded-l-full transition-all duration-500 ${
                              isCompleted
                                ? "w-full bg-emerald-500 rounded-r-full"
                                : isOverdue
                                ? "w-[65%] bg-amber-500"
                                : "w-[50%] bg-amber-500"
                            }`}
                            title="Fase 1: Masa Pemantauan Respons Resmi Dinas"
                          />
                          {isOverdue && (
                            <div
                              className="h-full w-[35%] bg-gradient-to-r from-rose-500 to-red-600 rounded-r-full animate-pulse"
                              title="Fase 2: Pelanggaran Maladministrasi Penundaan Berlarut (Undue Delay)"
                            />
                          )}
                        </div>

                        {/* Timeline Markers */}
                        <div className="flex justify-between text-[9.5px] text-slate-400 font-medium font-sans px-0.5">
                          <span>H-0 Lapor</span>
                          <span className="font-bold text-slate-600">Batas Tenggat Respons</span>
                          <span className={isOverdue ? "text-rose-600 font-bold" : "text-slate-400"}>
                            {isOverdue ? "Ombudsman RI" : "Selesai"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer with Button-in-Button */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => onSelectRoadOnMap && onSelectRoadOnMap(report.roadSegmentId)}
                      className="text-slate-600 hover:text-slate-900 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors font-sans"
                    >
                      <span>Cek di Peta GIS</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {isOverdue ? (
                      <button
                        onClick={() => onOpenOmbudsmanDraft && onOpenOmbudsmanDraft(report)}
                        className="inline-flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-[0.98] font-sans"
                      >
                        <span>Siapkan Draf Ombudsman</span>
                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                          <FileText className="w-3 h-3 text-white" />
                        </span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 font-sans">
                        {isCompleted ? "Tindak Lanjut Tuntas" : "Aktif jika melewati tenggat"}
                      </span>
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
                  <th className="py-3 px-3 text-center md:w-[12%]">Status SLA</th>
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
              Alur Penegakan Maladministrasi (Undue Delay)
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
