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

function resolveSafeProofPhoto(url) {
  if (!url) return "/images/roads/jalan-selesai-hotmix.jpg";
  if (typeof url === "string" && url.includes("images.unsplash.com")) {
    return "/images/roads/jalan-selesai-hotmix.jpg";
  }
  return url;
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
      const onKeyDown = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", onKeyDown);
      };
    }
  }, [isOpen, onClose]);

  // Reports associated with this road
  const roadReports = reports.filter((r) => r.roadSegmentId === road?.id);
  const overdueReports = roadReports.filter((r) => r.status === "OVERDUE");
  const budget = road?.budget;

  // Financial calculations & guaranteed non-empty metadata fallbacks
  const paguRp = Number(budget?.paguRp) || 0;
  const contractValueRp = Number(budget?.contractValueRp) || 0;
  const efficiencyRp = paguRp > contractValueRp ? paguRp - contractValueRp : 0;
  const efficiencyPct = paguRp > 0 ? ((efficiencyRp / paguRp) * 100).toFixed(1) : "0.0";
  const progressPct = typeof budget?.progressPct === "number" ? budget.progressPct : null;

  const resolvedPackageId =
    budget?.packageId ||
    `PKG-${(road?.authority || "RUAS").slice(0, 4).toUpperCase()}-${(road?.code || road?.id || "001")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()}`;

  const defaultPortalByAuthority =
    road?.authority === "DESA"
      ? { url: "https://sid.kemendesa.go.id", label: "SID Kemendesa PDTT (Dana Desa)" }
      : road?.authority === "NASIONAL"
      ? { url: "https://spse.inaproc.id/pu", label: "SPSE Kementerian PU (INAPROC)" }
      : { url: "https://sirup.inaproc.id", label: "SiRUP INAPROC LKPP" };

  const resolvedSourceUrl =
    budget?.sourceUrl || road?.officialSources?.transparencyUrl || defaultPortalByAuthority.url;

  const resolvedPortalLabel =
    budget?.portalLabel ||
    (resolvedSourceUrl.includes("spse.inaproc.id/pu")
      ? "SPSE Kementerian PU (INAPROC)"
      : resolvedSourceUrl.includes("spse.inaproc.id/sumutprov")
      ? "SPSE Prov. Sumatera Utara (INAPROC)"
      : resolvedSourceUrl.includes("spse.inaproc.id/medankota")
      ? "SPSE Kota Medan (INAPROC)"
      : resolvedSourceUrl.includes("sid.kemendesa.go.id")
      ? "SID Kemendesa PDTT"
      : "SiRUP INAPROC LKPP");

  const resolvedSourceHost = resolvedSourceUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const resolvedSourceDocument =
    budget?.sourceDocument ||
    (road?.authority === "NASIONAL"
      ? `DIPA Ditjen Bina Marga TA ${budget?.fiscalYear || "2026"}`
      : road?.authority === "DESA"
      ? `APBDes & Dana Desa TA ${budget?.fiscalYear || "2026"}`
      : `DPA APBD ${road?.district || road?.provinceName || "Daerah"} TA ${budget?.fiscalYear || "2026"}`);

  const resolvedMatchReason =
    budget?.matchReason ||
    `Pencocokan koridor ${road?.name || "ruas jalan"} terhadap kewenangan SK resmi & paket kurasi pilot.`;

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
      note: `ID: ${resolvedPackageId} (TA ${budget?.fiscalYear || "2026"})`,
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
          label: "Jalan Nasional · APBN",
          dot: "bg-blue-600",
          topBar: "bg-blue-600",
          borderAccent: "border-l-blue-600",
        }
      : road.authority === "PROVINSI"
      ? {
          label: "Jalan Provinsi · APBD Provinsi",
          dot: "bg-purple-600",
          topBar: "bg-purple-600",
          borderAccent: "border-l-purple-600",
        }
      : road.authority === "KOTA"
      ? {
          label: "Jalan Kota · APBD Kota",
          dot: "bg-teal-600",
          topBar: "bg-teal-600",
          borderAccent: "border-l-teal-600",
        }
      : road.authority === "DESA"
      ? {
          label: "Jalan Desa · APBDes / Dana Desa",
          dot: "bg-amber-600",
          topBar: "bg-amber-600",
          borderAccent: "border-l-amber-600",
        }
      : {
          label: "Jalan Kabupaten · APBD Kab / IJD",
          dot: "bg-emerald-600",
          topBar: "bg-emerald-600",
          borderAccent: "border-l-emerald-600",
        };

  const matchBadge =
    budget?.matchConfidence === "TERKONFIRMASI"
      ? { label: "Terkurasi (Model LPSE)", dot: "bg-emerald-600", text: "text-emerald-800" }
      : budget?.matchConfidence === "PARSIAL"
      ? { label: "Pencocokan Parsial", dot: "bg-amber-500", text: "text-amber-800" }
      : { label: "Belum Ditemukan Paket", dot: "bg-slate-400", text: "text-slate-600" };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detail Ruas Jalan ${road.name || ""}`}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-900/65 backdrop-blur-sm animate-fade-in font-sans overflow-y-auto"
    >
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-label="Tutup modal"
      />
      {/* Outer Shell with Double Bezel */}
      <div className="my-auto rounded-[12px] bg-[#F5F1EA]/95 p-1.5 ring-1 ring-[#E6DFD5] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative z-10">
        <div className="relative w-full flex-1 flex flex-col rounded-[9px] bg-white shadow-sm overflow-hidden">
          
          {/* Top Authority Color Accent Hairline */}
          <div className={`h-1 w-full ${authorityConfig.topBar}`} />

          {/* 1. MODAL HEADER */}
          <div className="px-5 sm:px-6 pt-4 pb-3.5 border-b border-slate-100 flex items-start justify-between gap-3 bg-white">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap text-xs">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-[4px] bg-slate-100 text-slate-800">
                  {road.code || road.id}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-700">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${authorityConfig.dot}`} aria-hidden="true" />
                  <span>{authorityConfig.label}</span>
                </span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${matchBadge.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${matchBadge.dot}`} aria-hidden="true" />
                  <span>{matchBadge.label}</span>
                </span>
              </div>

              <h2 className="text-lg sm:text-[19px] font-bold font-heading text-slate-950 tracking-tight leading-snug">
                {road.name}
              </h2>

              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium font-sans flex-wrap">
                <span className="inline-flex items-center gap-1 text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />
                  <span>{road.district}</span>
                </span>
                <span className="text-slate-300">·</span>
                <span>Bentang <strong className="text-slate-900 font-semibold tabular-nums">{road.lengthKm} km</strong></span>
                <span className="text-slate-300">·</span>
                <span>{road.pavementType}</span>
                {road.functionalClass && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span>{road.functionalClass}</span>
                  </>
                )}
                {road.maxAxleLoad && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="text-amber-800 font-semibold tabular-nums">{road.maxAxleLoad}</span>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[6px] text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              aria-label="Tutup Detail"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. MODAL BODY (SCROLLABLE) */}
          <div className="px-5 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700 font-sans">
            
            {/* A. Dasar Hukum & Instansi Berwenang (Clean Borderless Tonal Strip) */}
            <div className={`px-4 py-3.5 rounded-[8px] bg-[#FAF7F2] border-l-[3px] ${authorityConfig.borderAccent} space-y-2.5`}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <Scale className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />
                  <span>Kewenangan &amp; Dasar Regulasi</span>
                </div>
                <span className="text-[10.5px] font-mono font-semibold text-slate-600">
                  UU No. 2 Tahun 2022
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-[#E6DFD5]/80">
                <div>
                  <span className="text-[10.5px] text-slate-500 uppercase font-semibold tracking-wider block mb-0.5">
                    Dasar Penetapan Status Jalan
                  </span>
                  <p className="text-xs font-semibold text-slate-900 leading-snug">
                    {road.legalBasis}
                  </p>
                </div>
                <div className="md:border-l md:border-[#E6DFD5]/80 md:pl-3.5">
                  <span className="text-[10.5px] text-slate-500 uppercase font-semibold tracking-wider block mb-0.5">
                    Instansi Penyelenggara Teknis
                  </span>
                  <p className="text-xs font-semibold text-slate-900 leading-snug">
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
                      <img
                        src={road.photos.beforeUrl}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/roads/jalan-lubang-medan.jpg";
                        }}
                        alt="Sebelum Penanganan"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-emerald-800 flex items-center justify-between">
                      <span>Kondisi Terkini / Hasil Penanganan</span>
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">Tuntas PHO</span>
                    </div>
                    <div className="h-40 rounded-[6px] overflow-hidden bg-slate-100 border border-slate-200 relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveSafeProofPhoto(road.photos.afterUrl)}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/roads/jalan-selesai-hotmix.jpg";
                        }}
                        alt="Hasil Penanganan"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
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

            {/* B. Informasi Paket Pengadaan & Kroscek Anggaran */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-[#c2410c]" />
                  <span>Paket Pengadaan &amp; Audit Anggaran</span>
                </span>
                <span className="text-[10.5px] text-slate-500 font-mono tabular-nums">
                  Kurasi: {budget?.lastVerifiedAt || "2026-10-22"}
                </span>
              </div>

              {budget ? (
                <div className="rounded-[10px] bg-white border border-slate-200/90 overflow-hidden shadow-2xs">
                  {/* Package Header */}
                  <div className="px-4 sm:px-5 pt-4 pb-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-[4px]">
                        {resolvedPackageId} · TA {budget.fiscalYear || "2026"}
                      </span>
                      <span className="text-[11px] font-semibold text-[#9a3412] bg-orange-50/90 px-2.5 py-0.5 rounded-[4px]">
                        {budget.source}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-950 text-sm sm:text-[15px] leading-snug pt-0.5">
                      {budget.name}
                    </h3>
                    {budget.scope && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {budget.scope}
                      </p>
                    )}
                  </div>

                  {/* Unified 3-Column Connected Financial Strip (Zero Nested Boxes) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 bg-slate-50/65 border-y border-slate-200/80">
                    <div className="px-4 py-3">
                      <span className="text-[10.5px] text-slate-500 uppercase font-semibold tracking-wider block">
                        Pagu Anggaran (HPS)
                      </span>
                      <strong className="text-base sm:text-[17px] font-extrabold text-slate-950 font-mono tabular-nums block mt-0.5">
                        {formatRupiahShort(paguRp)}
                      </strong>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Batas pagu rencana SiRUP
                      </span>
                    </div>

                    <div className="px-4 py-3">
                      <span className="text-[10.5px] text-slate-500 uppercase font-semibold tracking-wider block">
                        Nilai Kontrak (SPK)
                      </span>
                      <strong className="text-base sm:text-[17px] font-extrabold text-[#c2410c] font-mono tabular-nums block mt-0.5">
                        {formatRupiahShort(contractValueRp)}
                      </strong>
                      <span className="text-[11px] text-slate-600 font-medium truncate block mt-0.5" title={budget.contractor}>
                        Rekanan: {budget.contractor || "Belum Ditetapkan"}
                      </span>
                    </div>

                    <div className="px-4 py-3">
                      <span className="text-[10.5px] text-slate-500 uppercase font-semibold tracking-wider block">
                        Efisiensi Tender
                      </span>
                      <strong className="text-base sm:text-[17px] font-extrabold text-emerald-700 font-mono tabular-nums block mt-0.5">
                        {efficiencyRp > 0 ? formatRupiahShort(efficiencyRp) : "Rp 0"}
                      </strong>
                      <span className="text-[11px] font-semibold text-emerald-700 block mt-0.5">
                        Hemat {efficiencyPct}% dari pagu
                      </span>
                    </div>
                  </div>

                  {/* Clean Metadata & Physical Progress directly in card */}
                  <div className="px-4 sm:px-5 py-3.5 space-y-3 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10.5px] text-slate-500 font-semibold uppercase tracking-wider block mb-0.5">
                          Dokumen Rujukan
                        </span>
                        <span className="font-medium text-slate-900 leading-snug block">
                          {resolvedSourceDocument}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10.5px] text-slate-500 font-semibold uppercase tracking-wider block mb-0.5">
                          Dasar Pencocokan
                        </span>
                        <span className="font-medium text-slate-900 leading-snug block">
                          {resolvedMatchReason}
                        </span>
                      </div>
                    </div>

                    {progressPct !== null && (
                      <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[11.5px]">
                          <span className="font-semibold text-slate-700">Progres Realisasi Fisik Lapangan</span>
                          <span className="font-bold font-mono tabular-nums text-[#c2410c]">{progressPct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              progressPct >= 100
                                ? "bg-emerald-600"
                                : progressPct >= 50
                                ? "bg-[#c2410c]"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        {budget.statusNote && (
                          <p className="text-[11px] text-slate-500 pt-0.5">
                            Catatan pengawas: {budget.statusNote}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Guaranteed Official Portal Source Bar (Always Present for All 128 Roads) */}
                  <div className="px-4 sm:px-5 py-3 bg-[#FAF7F2] border-t border-[#E6DFD5]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-900">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">{resolvedPortalLabel}</span>
                        <span className="text-slate-300 hidden sm:inline">·</span>
                        <span className="font-mono text-[10.5px] font-normal text-slate-500 truncate hidden sm:inline">
                          {resolvedSourceHost}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Rincian paket merupakan kurasi pilot; verifikasi langsung pengadaan tersedia di portal resmi.
                      </p>
                    </div>
                    <a
                      href={resolvedSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-slate-900 hover:bg-[#c2410c] text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0 active:scale-[0.98]"
                    >
                      <span>Buka Portal Resmi</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-[8px] bg-slate-50 text-center space-y-1 text-slate-500">
                  <Building2 className="w-7 h-7 text-slate-400 mx-auto mb-1" />
                  <p className="font-semibold text-slate-800 text-xs">Belum Terhubung Paket Pengadaan</p>
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
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>Melewati Tenggat (+{report.daysOverdue} Hari)</span>
                            </span>
                          ) : isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span>Penanganan Selesai Diperbaiki</span>
                            </span>
                          ) : isInProgress ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>Dalam Perbaikan Fisik Dinas</span>
                            </span>
                          ) : isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span>Verifikasi Diterima Dinas</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>Menunggu Verifikasi Dinas</span>
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
                                <img
                                  src={report.photoUrl || "/images/roads/jalan-lubang-medan.jpg"}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = "/images/roads/jalan-lubang-medan.jpg";
                                  }}
                                  alt="Before"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-[9.5px] font-bold text-slate-500 block text-center">
                                BEFORE: Kerusakan Awal
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="h-20 rounded-[6px] overflow-hidden border border-emerald-500 bg-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={resolveSafeProofPhoto(report.proofPhotoUrl)}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = "/images/roads/jalan-selesai-hotmix.jpg";
                                  }}
                                  alt="After"
                                  className="w-full h-full object-cover"
                                />
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
                <div className="px-4 py-3.5 rounded-[8px] bg-slate-50/90 text-slate-600 flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-xs">Kondisi Terpantau Mantap</p>
                    <p className="text-[11px] text-slate-500">Belum ada aduan publik aktif yang melampaui tenggat respons pada ruas ini.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Legal Notice Footer */}
            <div className="px-4 py-3 rounded-r-[6px] bg-[#FAF7F2] border-l-2 border-amber-500/80 text-[11px] text-slate-700 space-y-1">
              <strong className="block text-slate-900 font-semibold">Catatan Keterbukaan Publik &amp; Kepatuhan Regulasi</strong>
              <p className="leading-relaxed text-slate-600">
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
