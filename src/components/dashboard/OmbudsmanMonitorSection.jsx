"use client";

import React, { useState, useMemo } from "react";
import {
  Shield,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  ArrowUpRight,
  ChevronRight,
  Scale,
  Calendar,
  AlertCircle,
  ExternalLink,
  MapPin,
  HelpCircle,
  SlidersHorizontal,
} from "lucide-react";

export default function OmbudsmanMonitorSection({
  reports,
  onOpenOmbudsmanDraft,
  onSelectRoadOnMap,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL" | "OVERDUE" | "DALAM_PENGERJAAN" | "SELESAI"

  // Counts
  const counts = useMemo(() => {
    return {
      all: reports.length,
      overdue: reports.filter((r) => r.status === "OVERDUE").length,
      inProgress: reports.filter((r) => r.status === "DALAM_PENGERJAAN" || r.status === "MENUNGGU_VERIFIKASI").length,
      resolved: reports.filter((r) => r.status === "SELESAI").length,
    };
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
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
  }, [reports, statusFilter, searchQuery]);

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 font-sans">
      
      {/* 1. HEADER & PUBLIC MANDATE */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-slate-100 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-rose-700 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            <span>Instrumen Kepatuhan Hukum • Standar Ombudsman RI &amp; UU No. 25/2009</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
            Pusat Pemantauan Tanggapan &amp; Eskalasi Ombudsman RI
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Setiap aduan warga dipantau selama <strong>14 hari kerja</strong> untuk mencatat respons resmi dinas (KemenPUPR, DBMPR, atau Dinas PUPR). 
            Ketiadaan tindak lanjut mengaktifkan hak konstitusional warga untuk menerbitkan draf laporan formal dugaan <em>penundaan berlarut (undue delay)</em> kepada Ombudsman Republik Indonesia.
          </p>
        </div>

        {/* SLA Status Counter Badge */}
        <div className="rounded-[5px] bg-slate-50/80 border border-slate-200/80 p-3 text-xs shrink-0 lg:max-w-xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold">
            <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Audit Jam SLA 14 Hari Kerja</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Terdeteksi <strong className="text-rose-600 font-bold">{counts.overdue} laporan</strong> telah melampaui batas toleransi respons dinas di koridor percontohan.
          </p>
        </div>
      </div>

      {/* 2. STATISTICAL RIBBON: REKAM JEJAK MALADMINISTRASI OMBUDSMAN RI */}
      <div className="bg-white rounded-[5px] border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Scale className="w-4 h-4 text-[#c2410c]" />
            <span>Konteks Statistik Nasional Ombudsman RI (Laporan Tahunan Resmi):</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">BPS &amp; Laptah Ombudsman</span>
        </div>

        {/* 3 Metrics in Single Streamline Strip (No Box-in-a-Box!) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          
          {/* Stat 1 */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Penundaan Berlarut (2024)
            </span>
            <div className="text-xl font-bold text-slate-900 tabular-nums">
              33,86% <span className="text-xs font-semibold text-slate-500 uppercase">Laporan Selesai</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Bentuk maladministrasi nomor satu yang paling banyak diselesaikan Ombudsman di seluruh Indonesia.
            </p>
          </div>

          {/* Stat 2 */}
          <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Instansi Terlapor (2025)
            </span>
            <div className="text-xl font-bold text-slate-900 tabular-nums">
              4.766 <span className="text-xs font-semibold text-slate-500 uppercase">Aduan Pemda</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Pemerintah Daerah (Pemprov/Pemkot/Pemkab) konsisten menjadi kelompok instansi terlapor nomor satu.
            </p>
          </div>

          {/* Stat 3 */}
          <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Sektor Infrastruktur &amp; Jalan
            </span>
            <div className="text-xl font-bold text-slate-900 tabular-nums">
              287 <span className="text-xs font-semibold text-slate-500 uppercase">Kasus Jalan Rusak</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Dari 622 aduan substansi perhubungan, jalan rusak menjadi pemicu kecelakaan harian paling sering dilaporkan.
            </p>
          </div>
        </div>
      </div>

      {/* 3. CONTROL BAR: SEARCH & STATUS FILTER */}
      <div className="bg-white p-3 rounded-[5px] border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Quick Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode tiket, nama jalan, atau dinas penanggung jawab..."
              className="w-full pl-9 pr-3 py-1.5 rounded-[5px] border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[11px] font-bold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Counter Filter Tabs (Segmented Bar) */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === "ALL"
                  ? "bg-[#0f172a] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Semua Aduan ({counts.all})
            </button>

            <button
              onClick={() => setStatusFilter("OVERDUE")}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === "OVERDUE"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-rose-700 hover:bg-rose-50"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Melewati Tenggat ({counts.overdue})</span>
            </button>

            <button
              onClick={() => setStatusFilter("DALAM_PENGERJAAN")}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === "DALAM_PENGERJAAN"
                  ? "bg-[#c2410c] text-white shadow-xs"
                  : "text-slate-700 hover:bg-orange-50"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Dalam Pengerjaan ({counts.inProgress})</span>
            </button>

            <button
              onClick={() => setStatusFilter("SELESAI")}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === "SELESAI"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Selesai ({counts.resolved})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. REPORTS LIST (FLUID, MODERN CARDS - ZERO BOX-IN-A-BOX) */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-[5px] border border-slate-200/90 p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">Tidak ada aduan yang sesuai dengan kriteria pencarian.</p>
          <p className="text-xs text-slate-400">Silakan ubah kata kunci atau pilih tab filter status di atas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const isOverdue = report.status === "OVERDUE";
            const isCompleted = report.status === "SELESAI";
            const reportDateStr = new Date(report.reportDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const deadlineDateStr = report.targetResponseDeadline
              ? new Date(report.targetResponseDeadline).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "-";

            return (
              <div
                key={report.id}
                className={`bg-white rounded-[5px] border transition-all p-5 flex flex-col justify-between gap-4 ${
                  isOverdue
                    ? "border-slate-200/90 border-t-2 border-t-rose-500 shadow-xs"
                    : isCompleted
                    ? "border-slate-200/90 border-t-2 border-t-emerald-600 shadow-2xs"
                    : "border-slate-200/90 border-t-2 border-t-amber-500 shadow-2xs"
                }`}
              >
                {/* Top: Ticket Code, Status Indicator, & Date */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700">
                        #{report.ticketCode}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Lapor: {reportDateStr}</span>
                      </span>
                    </div>

                    {/* Status Text (Clean Typography, No Pill Box) */}
                    {isOverdue ? (
                      <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1.5 font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                        <span>Melewati Tenggat (+{report.daysOverdue} Hari)</span>
                      </span>
                    ) : isCompleted ? (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>Selesai Ditangani Dinas</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1.5 font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>Dalam Pengerjaan (Tenggat: {deadlineDateStr})</span>
                      </span>
                    )}
                  </div>

                  {/* Road Location Heading */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base font-heading tracking-tight leading-snug">
                      {report.roadName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{report.address} ({report.district})</span>
                    </p>
                  </div>
                </div>

                {/* Damage & Hazard AI Assessment */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-700 font-medium">
                    <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                      Klasifikasi Kerusakan (AI):
                    </span>
                    <span className={`font-bold tabular-nums text-xs ${
                      report.hazardScore >= 85 ? "text-rose-600" : "text-[#c2410c]"
                    }`}>
                      {report.categoryLabel} • Skor {report.hazardScore}/100
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed italic bg-slate-50/60 p-2.5 rounded-[5px] border border-slate-100">
                    &ldquo;{report.aiAnalysis}&rdquo;
                  </p>
                </div>

                {/* Institutional & Budget Transparency Strip */}
                <div className="py-2.5 px-3 rounded-[5px] bg-slate-50/70 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Instansi Penanggung Jawab
                    </span>
                    <strong className="text-slate-900 font-semibold block text-xs">
                      {report.authorityLabel}
                    </strong>
                    <span className="text-[10px] text-slate-500">{report.legalBasis?.split(" tentang ")[0]}</span>
                  </div>

                  <div className="sm:text-right border-t sm:border-t-0 pt-1.5 sm:pt-0 border-slate-200/50">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Pagu Pemeliharaan Terdata
                    </span>
                    <strong className="text-emerald-800 font-bold tabular-nums block text-xs">
                      Rp {((report.matchingBudget?.paguRp || 0) / 1_000_000_000).toFixed(2)} Miliar
                    </strong>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {report.matchingBudget?.packageId || "APBD Reguler"}
                    </span>
                  </div>
                </div>

                {/* SLA Timeline Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Audit Respons (Standar 14 Hari Kerja)</span>
                    <span className={isOverdue ? "text-rose-600 font-bold" : "text-slate-700 font-semibold"}>
                      {isOverdue ? `Terlambat ${report.daysOverdue} Hari Kerja` : "Dalam Masa Pantau"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverdue
                          ? "bg-rose-500 w-full"
                          : isCompleted
                          ? "bg-emerald-600 w-full"
                          : "bg-amber-500 w-3/4"
                      }`}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <button
                    onClick={() => onSelectRoadOnMap && onSelectRoadOnMap(report.roadSegmentId)}
                    className="text-slate-600 hover:text-slate-900 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Cek di Peta GIS</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  {isOverdue ? (
                    <button
                      onClick={() => onOpenOmbudsmanDraft && onOpenOmbudsmanDraft(report)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Siapkan Draf Ombudsman RI</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {isCompleted ? "Perbaikan Tuntas Terekam" : "Draf Aktif Saat Hari >14"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. EDITORIAL LEGAL GUIDE: ALUR PENEGAKAN MALADMINISTRASI */}
      <div className="bg-white p-5 rounded-[5px] border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Shield className="w-4 h-4 text-[#c2410c]" />
          <h3 className="font-bold text-slate-900 text-sm font-heading">
            Pedoman Hukum Penanganan Maladministrasi Penundaan Berlarut (Undue Delay)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-bold text-slate-400 block">LANGKAH 01</span>
            <strong className="text-slate-900 block text-xs font-semibold">Laporan Terkunci Geotagging</strong>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Warga melapor via JagaJalan. AI memverifikasi kerusakan dan mengunci koordinat hukum instansi wewenang (KemenPUPR/DBMPR/Dinas PUPR).
            </p>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 md:pl-4">
            <span className="font-mono text-[10px] font-bold text-slate-400 block">LANGKAH 02</span>
            <strong className="text-slate-900 block text-xs font-semibold">Masa Tunggu Kepatuhan 14 Hari</strong>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Sesuai amanat UU No. 25/2009 Pasal 36, dinas memiliki waktu kerja wajar untuk memberikan respons rencana penanganan fisik di lapangan.
            </p>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 md:pl-4">
            <span className="font-mono text-[10px] font-bold text-rose-600 block">LANGKAH 03</span>
            <strong className="text-slate-900 block text-xs font-semibold">Eskalasi Ombudsman RI (Pasal 1 UU 37/2008)</strong>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Jika diabaikan lebih dari 14 hari kerja, tombol draf otomatis aktif dan warga dapat mengirimkan berkas pengaduan resmi untuk meminta tindakan korektif Ombudsman.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
