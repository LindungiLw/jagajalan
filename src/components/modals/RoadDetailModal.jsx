"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ExternalLink,
  MapPin,
  Building2,
  CheckCircle2,
  ArrowRight,
  FileSpreadsheet,
  FileText,
  Scale,
  Receipt,
  Clock,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  Activity,
  Layers,
  ChevronRight,
  Plus,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/exportTransparencyData";

// Helper Format Rupiah
function formatRupiahShort(amount) {
  if (!amount || isNaN(amount)) return "Rp 0";
  if (amount >= 1e12) return `Rp ${(amount / 1e12).toFixed(2)} Triliun`;
  if (amount >= 1e9) return `Rp ${(amount / 1e9).toFixed(2)} Miliar`;
  if (amount >= 1e6) return `Rp ${(amount / 1e6).toFixed(1)} Juta`;
  return `Rp ${Number(amount).toLocaleString("id-ID")}`;
}

export default function RoadDetailModal({
  isOpen,
  onClose,
  road,
  reports = [],
  onOpenOmbudsmanDraft,
  onOpenReportModal,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Reports associated with this road
  const roadReports = reports.filter((r) => r.roadSegmentId === road?.id);
  const overdueReports = roadReports.filter((r) => r.status === "OVERDUE");
  const budget = road?.budget;

  // Financial calculations
  const paguRp = Number(budget?.paguRp) || 0;
  const contractValueRp = Number(budget?.contractValueRp) || 0;
  const efficiencyRp = paguRp > contractValueRp ? paguRp - contractValueRp : 0;
  const efficiencyPct = paguRp > 0 ? ((efficiencyRp / paguRp) * 100).toFixed(1) : "0.0";
  const progressPct = typeof budget?.progressPct === "number" ? budget.progressPct : null;

  if (!isOpen || !road || !mounted) return null;

  const roadAuditRows = [
    {
      section: "Identitas & Kewenangan Ruas",
      field: "Nama & Kode Ruas",
      value: `${road.name} (${road.code || road.id})`,
      note: road.district || "-",
    },
    {
      section: "Identitas & Kewenangan Ruas",
      field: "Penyelenggara Berwenang",
      value: `${road.authorityLabel} (${road.authority})`,
      note: road.legalBasis || "-",
    },
    {
      section: "Spesifikasi Teknis",
      field: "Bentang & Tipe Perkerasan",
      value: `${road.lengthKm || 0} KM • ${road.pavementType || "-"}`,
      note: `Kondisi: ${road.condition || "TERDATA"}`,
    },
    {
      section: "Audit Anggaran LPSE",
      field: "Paket Pekerjaan",
      value: budget?.name || "Belum Terhubung Paket Lelang",
      note: budget?.packageId ? `ID: ${budget.packageId} (TA ${budget.fiscalYear || "2026"})` : "-",
    },
    {
      section: "Audit Anggaran LPSE",
      field: "Pagu HPS vs Nilai Kontrak SPK",
      value: budget
        ? `Pagu: ${formatRupiahShort(paguRp)} | Kontrak: ${formatRupiahShort(contractValueRp)}`
        : "-",
      note: budget?.contractor ? `Pelaksana: ${budget.contractor}` : "-",
    },
    ...roadReports.map((rep) => ({
      section: "Aduan Warga (GIS)",
      field: `Tiket ${rep.ticketCode}`,
      value: `${rep.categoryLabel} (Indeks Bahaya: ${rep.hazardScore}/100)`,
      note: `${rep.address} • Status: ${rep.status}`,
    })),
  ];

  const roadAuditColumns = [
    { header: "Kategori Audit", key: "section", width: 170 },
    { header: "Parameter / Indikator", key: "field", width: 230 },
    { header: "Data yang Telah Diperiksa", key: "value", width: 320 },
    { header: "Keterangan & Dasar Rujukan", key: "note", width: 280 },
  ];

  const handleExportRoadExcel = () => {
    exportToExcel({
      filename: `Audit_Ruas_${(road.code || road.id || "Jalan").replace(/[^a-zA-Z0-9_-]/g, "_")}`,
      sheetName: "Audit Ruas Jalan",
      title: `LEMBAR AUDIT TRANSPARANSI RUAS JALAN — ${road.name.toUpperCase()}`,
      subtitle: `${road.authorityLabel} • Dasar Hukum: ${road.legalBasis}`,
      summaryMetrics: [
        { label: "Kode & Bentang Ruas", value: `${road.code || road.id} (${road.lengthKm || 0} KM)` },
        { label: "Kewenangan", value: road.authority },
        {
          label: "Pagu Paket LPSE",
          value: paguRp > 0 ? formatRupiahShort(paguRp) : "Belum Terdata",
        },
        { label: "Laporan Warga Terdata", value: `${roadReports.length} Tiket` },
      ],
      columns: roadAuditColumns,
      rows: roadAuditRows,
    });
  };

  const handleExportRoadPDF = () => {
    exportToPDF({
      title: `Lembar Audit Transparansi Ruas: ${road.name}`,
      subtitle: `${road.district} • Penyelenggara: ${road.authorityLabel}`,
      documentCode: `JGJ-RUAS-${road.code || road.id}`,
      orientation: "portrait",
      summaryMetrics: [
        { label: "Kode Ruas", value: road.code || road.id, sub: `Bentang ${road.lengthKm || 0} KM` },
        { label: "Status Kewenangan", value: road.authority, sub: road.pavementType || "Perkerasan Jalan" },
        {
          label: "Nilai Kontrak LPSE",
          value: contractValueRp > 0 ? formatRupiahShort(contractValueRp) : "N/A",
          sub: budget?.contractor || "Rekanan Pengadaan",
        },
        {
          label: "Aduan Warga (GIS)",
          value: `${roadReports.length} Laporan`,
          sub: `${overdueReports.length} Melewati Tenggat`,
        },
      ],
      columns: roadAuditColumns,
      rows: roadAuditRows,
    });
  };

  const authorityConfig =
    road.authority === "NASIONAL"
      ? {
          label: "Jalan Nasional (APBN)",
          color: "bg-blue-50 text-blue-800 border-blue-200/80",
          topBar: "bg-blue-600",
          borderAccent: "border-l-blue-600",
        }
      : road.authority === "PROVINSI"
      ? {
          label: "Jalan Provinsi (APBD Provinsi)",
          color: "bg-purple-50 text-purple-800 border-purple-200/80",
          topBar: "bg-purple-600",
          borderAccent: "border-l-purple-600",
        }
      : road.authority === "KOTA"
      ? {
          label: "Jalan Kota (APBD Kota)",
          color: "bg-teal-50 text-teal-800 border-teal-200/80",
          topBar: "bg-teal-600",
          borderAccent: "border-l-teal-600",
        }
      : road.authority === "DESA"
      ? {
          label: "Jalan Desa (APBDes / Dana Desa)",
          color: "bg-amber-50 text-amber-900 border-amber-200/80",
          topBar: "bg-amber-600",
          borderAccent: "border-l-amber-600",
        }
      : {
          label: "Jalan Kabupaten (APBD Kab / IJD)",
          color: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
          topBar: "bg-emerald-600",
          borderAccent: "border-l-emerald-600",
        };

  const matchBadge =
    budget?.matchConfidence === "TERKONFIRMASI"
      ? { label: "Terkonfirmasi LPSE", color: "bg-emerald-50 text-emerald-800 border-emerald-200/80" }
      : budget?.matchConfidence === "PARSIAL"
      ? { label: "Pencocokan Parsial", color: "bg-amber-50 text-amber-800 border-amber-200/80" }
      : { label: "Belum Ditemukan Paket", color: "bg-slate-100 text-slate-700 border-slate-200/80" };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-900/65 backdrop-blur-sm animate-fade-in font-sans overflow-y-auto">
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-label="Tutup modal"
      />
      {/* Outer Shell with Double Bezel */}
      <div className="my-auto rounded-[10px] bg-slate-100/95 p-1.5 sm:p-2 ring-1 ring-slate-300/80 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative z-10">
        <div className="relative w-full flex-1 flex flex-col rounded-[8px] bg-white shadow-xl overflow-hidden">
          
          {/* Top Authority Color Accent Line */}
          <div className={`h-1.5 w-full ${authorityConfig.topBar}`} />

          {/* 1. MODAL HEADER */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-white">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-[5px] bg-slate-100 text-slate-800 border border-slate-200/70">
                  {road.code || road.id}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${authorityConfig.color}`}>
                  {authorityConfig.label}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${matchBadge.color} inline-flex items-center gap-1`}>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{matchBadge.label}</span>
                </span>
                {road.fundingSourceLabel && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200/60">
                    {road.fundingSourceLabel}
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight leading-snug">
                {road.name}
              </h2>

              <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium font-sans flex-wrap">
                <span className="inline-flex items-center gap-1 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />
                  <span>{road.district}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span>Bentang: <strong className="text-slate-900 font-bold tabular-nums">{road.lengthKm} Km</strong></span>
                <span className="text-slate-300">•</span>
                <span>Perkerasan: <strong className="text-slate-800">{road.pavementType}</strong></span>
                {road.functionalClass && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>Fungsi: <strong className="text-slate-800">{road.functionalClass}</strong></span>
                  </>
                )}
                {road.maxAxleLoad && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>MST: <strong className="text-amber-800 font-bold tabular-nums">{road.maxAxleLoad}</strong></span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-[6px] text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              aria-label="Tutup Detail"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. MODAL BODY (SCROLLABLE) */}
          <div className="px-5 py-4 sm:py-5 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700 font-sans">
            
            {/* A. Dasar Hukum & Instansi Berwenang (Legal Credential Panel) */}
            <div className={`p-4 rounded-[8px] bg-slate-50/90 border border-slate-200/80 border-l-4 ${authorityConfig.borderAccent} shadow-2xs space-y-2`}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <Scale className="w-4 h-4 text-[#c2410c] shrink-0" />
                  <span>Kewenangan &amp; Dasar Regulasi Resmi</span>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-[4px] border border-slate-200/80">
                  UU No. 2 Tahun 2022
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-[6px] bg-white border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                    Dasar Penetapan Status Jalan:
                  </span>
                  <p className="text-xs font-bold text-slate-900 leading-snug">
                    {road.legalBasis}
                  </p>
                </div>
                <div className="p-2.5 rounded-[6px] bg-white border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                    Instansi Penyelenggara Teknis:
                  </span>
                  <p className="text-xs font-bold text-slate-900 leading-snug">
                    {road.authorityLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* A2. Foto Perbandingan Audit Sebelum vs Sesudah (Before vs After) */}
            {road?.photos?.beforeUrl && road?.photos?.afterUrl && (
              <div className="p-4 rounded-[8px] bg-white border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Audit Perbandingan Fisik Lapangan (Before vs After)</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
                    Dokumentasi Terverifikasi
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-rose-700 flex items-center justify-between">
                      <span>Sebelum Penanganan / Kerusakan Awal</span>
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200">Kondisi Awal</span>
                    </div>
                    <div className="h-40 rounded-[6px] overflow-hidden bg-slate-100 border border-slate-200 relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={road.photos.beforeUrl} alt="Sebelum Penanganan" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-emerald-800 flex items-center justify-between">
                      <span>Kondisi Terkini / Hasil Penanganan</span>
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">Tuntas PHO</span>
                    </div>
                    <div className="h-40 rounded-[6px] overflow-hidden bg-slate-100 border border-slate-200 relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={road.photos.afterUrl} alt="Hasil Penanganan" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  </div>
                </div>
                {road.photos.description && (
                  <p className="text-[11px] text-slate-600 leading-relaxed pt-1.5 border-t border-slate-100">
                    {road.photos.description}
                  </p>
                )}
              </div>
            )}

            {/* A3. Isu Khas Perkotaan / Drainase & Galian Utilitas */}
            {(road?.urbanDrainageStatus || road?.utilityDigIssue) && (
              <div className="p-4 rounded-[8px] bg-amber-50/50 border border-amber-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-700" />
                    <span>Kondisi Drainase &amp; Utilitas Bawah Permukaan</span>
                  </span>
                  <span className="text-[9.5px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200/80">
                    Inspeksi Kota
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-slate-800">
                  {road.urbanDrainageStatus && (
                    <div className="p-2.5 rounded-[6px] bg-white border border-amber-200/60 leading-snug">
                      <strong className="text-amber-950 block text-[10.5px] mb-0.5">Sistem Drainase Samping:</strong>
                      <span className="text-xs">{road.urbanDrainageStatus}</span>
                    </div>
                  )}
                  {road.utilityDigIssue && (
                    <div className="p-2.5 rounded-[6px] bg-white border border-amber-200/60 leading-snug">
                      <strong className="text-amber-950 block text-[10.5px] mb-0.5">Galian Utilitas (Kabel / Pipa):</strong>
                      <span className="text-xs">{road.utilityDigIssue}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* B. Informasi Paket Pengadaan & Kroscek Anggaran LPSE */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#c2410c]" />
                  <span>Paket Pengadaan LPSE Teridentifikasi</span>
                </span>
                <span className="text-[10.5px] text-slate-500 font-mono">
                  Pembaruan: {budget?.lastVerifiedAt || "2026-10-22"}
                </span>
              </div>

              {budget ? (
                <div className="p-4 sm:p-5 rounded-[8px] bg-white border border-slate-200/80 shadow-xs space-y-4">
                  {/* Package Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-[4px] border border-slate-200/80">
                        ID Paket: {budget.packageId} (TA {budget.fiscalYear || "2026"})
                      </span>
                      <span className="text-[11px] font-bold text-[#c2410c] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200/70">
                        Sumber: {budget.source}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug mt-1.5">
                      {budget.name}
                    </h3>
                    {budget.scope && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {budget.scope}
                      </p>
                    )}
                  </div>

                  {/* Financial Comparison Ledger: Pagu HPS vs Nilai Kontrak vs Efisiensi */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Pagu HPS */}
                    <div className="p-3.5 rounded-[6px] bg-slate-50/80 border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Pagu Anggaran (HPS)
                      </span>
                      <strong className="text-base sm:text-lg font-bold text-slate-900 font-mono block mt-0.5">
                        {formatRupiahShort(paguRp)}
                      </strong>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Batas pagu lelang SiRUP
                      </span>
                    </div>

                    {/* 2. Kontrak Pemenang */}
                    <div className="p-3.5 rounded-[6px] bg-orange-50/50 border border-orange-200/70">
                      <span className="text-[10px] text-[#9a3412] uppercase font-bold block">
                        Nilai Kontrak (SPK)
                      </span>
                      <strong className="text-base sm:text-lg font-bold text-[#c2410c] font-mono block mt-0.5">
                        {formatRupiahShort(contractValueRp)}
                      </strong>
                      <span className="text-[10px] text-slate-600 font-medium truncate block mt-1" title={budget.contractor}>
                        Rekanan: {budget.contractor || "Belum Ditetapkan"}
                      </span>
                    </div>

                    {/* 3. Efisiensi Pengadaan */}
                    <div className="p-3.5 rounded-[6px] bg-emerald-50/60 border border-emerald-200/80">
                      <span className="text-[10px] text-emerald-800 uppercase font-bold block">
                        Efisiensi Tender
                      </span>
                      <strong className="text-base sm:text-lg font-bold text-emerald-700 font-mono block mt-0.5">
                        {efficiencyRp > 0 ? formatRupiahShort(efficiencyRp) : "Rp 0"}
                      </strong>
                      <span className="text-[10px] font-bold text-emerald-800 block mt-1">
                        Penghematan: {efficiencyPct}% Pagu
                      </span>
                    </div>
                  </div>

                  {/* Structured Audit Metadata Spec Sheet */}
                  <div className="p-3.5 rounded-[6px] bg-slate-50/70 border border-slate-200/70 space-y-2 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span className="text-[10.5px] text-slate-400 font-bold uppercase block">Dokumen Sumber:</span>
                        <span className="font-medium text-slate-900">{budget.sourceDocument || "DIPA Resmi TA 2026"}</span>
                      </div>
                      <div>
                        <span className="text-[10.5px] text-slate-400 font-bold uppercase block">Alasan Kroscek:</span>
                        <span className="font-medium text-slate-900">{budget.matchReason}</span>
                      </div>
                    </div>

                    {/* Physical Progress Bar */}
                    {progressPct !== null && (
                      <div className="pt-2 border-t border-slate-200/60 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700">Progres Realisasi Fisik Lapangan:</span>
                          <span className="font-bold font-mono text-[#c2410c]">{progressPct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              progressPct >= 100
                                ? "bg-emerald-600"
                                : progressPct >= 50
                                ? "bg-orange-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        {budget.statusNote && (
                          <p className="text-[11px] text-slate-600 pt-0.5 italic">
                            Catatan Pengawas: {budget.statusNote}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* External Link to Verifiable Procurement Portal */}
                  {budget.sourceUrl && (
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500">
                        Dokumen lelang dan Berita Acara Pemenang dapat diaudit publik pada portal LPSE resmi:
                      </span>
                      <a
                        href={budget.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[6px] bg-slate-900 hover:bg-[#c2410c] text-white text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
                      >
                        <span>Buka Berkas LPSE Resmi</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-[8px] bg-slate-50 border border-slate-200/70 text-center space-y-1 text-slate-500">
                  <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <p className="font-bold text-slate-700 text-xs">Belum Terhubung Paket Pengadaan LPSE</p>
                  <p className="text-[11px]">Ruas ini belum memiliki data kontrak preservasi aktif pada SiRUP / SPSE tahun berjalan.</p>
                </div>
              )}
            </div>

            {/* C. Rekam Jejak Pemantauan Respons Laporan Warga */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#c2410c]" />
                  <span>Pemantauan Respons Laporan Warga ({roadReports.length} Terdata)</span>
                </span>
                {overdueReports.length > 0 && (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-[4px] border border-rose-200">
                    {overdueReports.length} Melewati Batas Respons
                  </span>
                )}
              </div>

              {roadReports.length > 0 ? (
                <div className="space-y-2.5">
                  {roadReports.map((report) => {
                    const isOverdue = report.status === "OVERDUE" || Boolean(report.isResponseOverdue);
                    const isCompleted = report.status === "SELESAI";
                    const isInProgress = report.status === "DALAM_PENGERJAAN";
                    const isVerified = report.status === "TERVERIFIKASI";
                    return (
                      <div
                        key={report.id}
                        className={`p-4 rounded-[8px] border transition-all ${
                          isOverdue
                            ? "bg-rose-50/50 border-rose-200"
                            : isCompleted
                            ? "bg-emerald-50/40 border-emerald-200"
                            : isInProgress
                            ? "bg-orange-50/40 border-orange-200"
                            : isVerified
                            ? "bg-blue-50/40 border-blue-200"
                            : "bg-slate-50/80 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              #{report.ticketCode}
                            </span>
                            <span className="text-[10.5px] text-slate-500 font-mono">
                              {new Date(report.reportDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          {isOverdue ? (
                            <span className="px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              Melewati Tenggat (+{report.daysOverdue} Hari)
                            </span>
                          ) : isCompleted ? (
                            <span className="px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ✓ Penanganan Selesai Diperbaiki
                            </span>
                          ) : isInProgress ? (
                            <span className="px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                              ⚒ Dalam Perbaikan Fisik Dinas
                            </span>
                          ) : isVerified ? (
                            <span className="px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              ✓ Verifikasi Diterima Dinas
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              Menunggu Verifikasi Dinas
                            </span>
                          )}
                        </div>

                        <div className="font-bold text-slate-900 text-xs mb-1">
                          {report.address}
                        </div>
                        <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                          {report.aiAnalysis}
                        </p>

                        {report.updates?.[0]?.note && (
                          <div className="mb-2.5 p-2.5 rounded-[6px] bg-white/90 border border-slate-200/80 text-[11px] text-slate-700">
                            <span className="font-bold text-slate-900">
                              Tindak Lanjut Dinas ({report.updates[0].officer || "Petugas Dinas"}):{" "}
                            </span>
                            <span>{report.updates[0].note}</span>
                          </div>
                        )}

                        {report.proofPhotoUrl && (
                          <div className="mb-2.5 grid grid-cols-2 gap-2 max-w-sm">
                            <div className="space-y-1">
                              <div className="h-20 rounded-[6px] overflow-hidden border border-slate-300 bg-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={report.photoUrl} alt="Before" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[9.5px] font-bold text-slate-500 block text-center">
                                BEFORE: Kerusakan Awal
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="h-20 rounded-[6px] overflow-hidden border border-emerald-500 bg-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={report.proofPhotoUrl} alt="After" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[9.5px] font-bold text-emerald-800 block text-center">
                                AFTER: Bukti Perbaikan Dinas
                              </span>
                            </div>
                          </div>
                        )}

                        {isOverdue && onOpenOmbudsmanDraft && (
                          <div className="pt-2.5 border-t border-rose-200/80 flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-[10.5px] text-rose-800 font-medium">
                              Telah melewati batas waktu pemantauan tanpa respons dinas
                            </span>
                            <button
                              onClick={() => {
                                onClose();
                                onOpenOmbudsmanDraft(report);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#c2410c] hover:bg-[#9a3412] text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                            >
                              <span>Siapkan Draf Ombudsman</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-[8px] bg-slate-50 border border-slate-200/70 text-slate-600 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-xs">Kondisi Terpantau Mantap</p>
                    <p className="text-[11px] text-slate-500">Belum ada aduan publik aktif yang melampaui tenggat respons pada ruas ini.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Legal Notice Footer */}
            <div className="p-3.5 rounded-[8px] bg-amber-50/70 border border-amber-200/70 text-[10.5px] text-amber-950 space-y-1">
              <strong className="block text-amber-900">Catatan Keterbukaan Publik &amp; Kepatuhan Regulasi:</strong>
              <p className="leading-relaxed">
                Penetapan status tenggat respons mengacu pada standar pemantauan respons pelayanan publik (UU No. 25/2009). Status ini mencatat keaktifan tindak lanjut tanggapan resmi instansi, bukan keputusan final maladministrasi. Eskalasi ke Ombudsman Republik Indonesia tetap melalui verifikasi bukti dan prosedur resmi.
              </p>
            </div>
          </div>

          {/* 3. MODAL FOOTER */}
          <div className="px-5 py-3.5 border-t border-slate-200/80 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleExportRoadExcel}
                className="px-3.5 py-2 rounded-[6px] text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-200 shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Unduh Excel</span>
              </button>
              <button
                type="button"
                onClick={handleExportRoadPDF}
                className="px-3.5 py-2 rounded-[6px] text-xs font-bold text-[#9a3412] bg-white hover:bg-orange-50 border border-orange-200 shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-[#c2410c]" />
                <span>Unduh Audit PDF</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {onOpenReportModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenReportModal({
                      coordinates: road.center,
                      roadSegmentId: road.id,
                      roadName: road.name,
                      district: road.district,
                      authority: road.authority,
                      authorityLabel: road.authorityLabel,
                      legalBasis: road.legalBasis,
                      leadership: road.leadership,
                      budget: road.budget,
                      source: "ROAD_DETAIL_MODAL",
                    });
                  }}
                  className="px-4 py-2 rounded-[6px] text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300/80 shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#c2410c]" />
                  <span>Laporkan Ruas Ini</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-[6px] text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                Tutup
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
