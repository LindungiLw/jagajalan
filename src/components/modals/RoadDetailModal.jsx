"use client";

import React from "react";
import {
  X,
  ExternalLink,
  MapPin,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Scale,
  ArrowRight,
} from "lucide-react";

export default function RoadDetailModal({
  isOpen,
  onClose,
  road,
  reports = [],
  onOpenOmbudsmanDraft,
  onOpenReportModal,
}) {
  if (!isOpen || !road) return null;

  // Reports associated with this road
  const roadReports = reports.filter((r) => r.roadSegmentId === road.id);
  const overdueReports = roadReports.filter((r) => r.status === "OVERDUE");
  const budget = road.budget;

  const authorityBadge =
    road.authority === "NASIONAL"
      ? { label: "Jalan Nasional (APBN)", color: "bg-slate-50 text-slate-700 border-slate-200" }
      : road.authority === "PROVINSI"
      ? { label: "Jalan Provinsi (APBD Provinsi)", color: "bg-slate-50 text-slate-700 border-slate-200" }
      : road.authority === "KOTA"
      ? { label: "Jalan Kota (APBD Kota)", color: "bg-slate-50 text-slate-700 border-slate-200" }
      : { label: "Jalan Kabupaten (APBD Kab / IJD)", color: "bg-slate-50 text-slate-700 border-slate-200" };

  const matchBadge =
    budget?.matchConfidence === "TERKONFIRMASI"
      ? { label: "Terkonfirmasi LPSE", color: "bg-slate-100 text-slate-700 border-slate-200" }
      : budget?.matchConfidence === "PARSIAL"
      ? { label: "Pencocokan Parsial", color: "bg-amber-50 text-amber-800 border-amber-200" }
      : { label: "Belum Ditemukan Paket", color: "bg-slate-100 text-slate-700 border-slate-200" };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* 1. MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-3 bg-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-sans tabular-nums text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800">
                {road.code}
              </span>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${authorityBadge.color}`}>
                {authorityBadge.label}
              </span>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${matchBadge.color}`}>
                {matchBadge.label}
              </span>
              {road.fundingSourceLabel && (
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold border bg-slate-50 text-slate-700 border-slate-200">
                  {road.fundingSourceLabel}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight">
              {road.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium font-sans flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-700 shrink-0" />
                <span>{road.district}</span>
              </span>
              <span>•</span>
              <span>Bentang: <strong className="text-slate-800 font-sans font-bold tabular-nums">{road.lengthKm} Km</strong></span>
              <span>•</span>
              <span>Perkerasan: <strong className="text-slate-800">{road.pavementType}</strong></span>
              {road.functionalClass && (
                <>
                  <span>•</span>
                  <span>Fungsi: <strong className="text-slate-800">{road.functionalClass}</strong></span>
                </>
              )}
              {road.maxAxleLoad && (
                <>
                  <span>•</span>
                  <span>MST: <strong className="text-amber-800 font-sans tabular-nums font-bold">{road.maxAxleLoad}</strong></span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            aria-label="Tutup Detail"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. MODAL BODY (SCROLLABLE) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700 font-sans">
          
          {/* A. Dasar Hukum Kewenangan Ruas (Legal SK) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Scale className="w-4 h-4 text-orange-700 shrink-0" />
              <span>Dasar Hukum Penetapan Status Kewenangan:</span>
            </div>
            <p className="text-xs text-slate-800 font-medium pl-6">
              {road.legalBasis}
            </p>
            <p className="text-[11px] text-slate-500 pl-6">
              Instansi Penanggung Jawab Teknis: <strong className="text-slate-800">{road.authorityLabel}</strong>
            </p>
          </div>

          {/* A2. Foto Perbandingan Audit Sebelum vs Sesudah (Before vs After) */}
          {road?.photos?.beforeUrl && road?.photos?.afterUrl && (
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                  <span>Audit Perbandingan Fisik Lapangan (Before vs After)</span>
                </span>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                  Dokumentasi Terverifikasi
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    <span>Sebelum Penanganan / Kerusakan Awal</span>
                  </div>
                  <div className="h-36 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={road.photos.beforeUrl} alt="Sebelum Penanganan" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-orange-800 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-600" />
                    <span>Kondisi Terkini / Hasil Penanganan</span>
                  </div>
                  <div className="h-36 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={road.photos.afterUrl} alt="Hasil Penanganan" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              {road.photos.description && (
                <p className="text-[11px] text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                  {road.photos.description}
                </p>
              )}
            </div>
          )}

          {/* A3. Isu Khas Perkotaan / Drainase & Galian Utilitas */}
          {(road?.urbanDrainageStatus || road?.utilityDigIssue) && (
            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Kondisi Drainase & Utilitas Perkotaan</span>
                </span>
                <span className="text-[9px] font-bold bg-amber-200/70 text-amber-950 px-2 py-0.5 rounded-md">
                  Infrastruktur Bawah Permukaan
                </span>
              </div>
              {road.urbanDrainageStatus && (
                <div className="text-[11px] text-slate-800 leading-snug">
                  <strong className="text-amber-950 block text-[10.5px]">Sistem Saluran Drainase:</strong>
                  <span>{road.urbanDrainageStatus}</span>
                </div>
              )}
              {road.utilityDigIssue && (
                <div className="text-[11px] text-slate-800 leading-snug pt-1 border-t border-amber-200/60">
                  <strong className="text-amber-950 block text-[10.5px]">Galian Utilitas (Kabel / Pipa):</strong>
                  <span>{road.utilityDigIssue}</span>
                </div>
              )}
            </div>
          )}

          {/* B. Informasi Paket Pengadaan & Kroscek Anggaran LPSE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-sans text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-orange-700" />
                <span>Paket Pengadaan LPSE Teridentifikasi</span>
              </span>
              <span className="text-[10px] text-slate-500 font-sans tabular-nums">
                Pembaruan: {budget?.lastVerifiedAt || "18 Okt 2026"}
              </span>
            </div>

            {budget ? (
              <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-3.5 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-sans tabular-nums text-[11px] font-bold text-slate-500">
                      ID Paket: {budget.packageId} (TA {budget.fiscalYear})
                    </span>
                    <span className="text-[11px] font-bold text-orange-950 bg-orange-50/90 px-2 py-0.5 rounded-lg border border-orange-200/80">
                      Sumber: {budget.source}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">
                    {budget.name}
                  </h3>
                </div>

                {/* Financial Pagu vs Kontrak */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold font-sans block">
                      Nilai Pagu Anggaran (HPS)
                    </span>
                    <strong className="text-base font-bold text-slate-900 font-sans tabular-nums">
                      Rp {((budget.paguRp || 0) / 1000000000).toFixed(2)} Miliar
                    </strong>
                    <span className="text-[10px] text-slate-500 block">
                      Rencana alokasi anggaran belanja
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold font-sans block">
                      Nilai Kontrak Lelang
                    </span>
                    <strong className="text-base font-bold text-emerald-800 font-sans tabular-nums">
                      Rp {((budget.contractValueRp || 0) / 1000000000).toFixed(2)} Miliar
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-medium block">
                      Kontraktor: {budget.contractor || "Belum Ditetapkan"}
                    </span>
                  </div>
                </div>

                {/* Match Reason and Documentation Note */}
                <div className="text-[11px] space-y-1">
                  <div className="text-slate-600">
                    <strong>Alasan Pencocokan:</strong> {budget.matchReason}
                  </div>
                  <div className="text-slate-600">
                    <strong>Dokumen Sumber:</strong> {budget.sourceDocument}
                  </div>
                  <div className="text-slate-600">
                    <strong>Catatan Realisasi Fisik:</strong> {budget.statusNote}
                  </div>
                </div>

                {/* External Link to Verifiable Procurement Portal */}
                {budget.sourceUrl && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      Tautan pengadaan dapat diakses publik pada sistem LPSE / SiRUP
                    </span>
                    <a
                      href={budget.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-orange-50 text-slate-800 hover:text-orange-800 border border-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>Buka Dokumen LPSE Resmi</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500">
                Belum ada paket pengadaan yang terkonfirmasi untuk ruas jalan ini.
              </div>
            )}
          </div>

          {/* C. Rekam Jejak Pemantauan Respons Laporan Warga */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-sans text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-700" />
                <span>Pemantauan Respons Laporan Warga ({roadReports.length} Terdata)</span>
              </span>
              {overdueReports.length > 0 && (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  {overdueReports.length} Melewati Tenggat Respons (14 Hari)
                </span>
              )}
            </div>

            {roadReports.length > 0 ? (
              <div className="space-y-2.5">
                {roadReports.map((report) => {
                  const isOverdue = report.status === "OVERDUE";
                  return (
                    <div
                      key={report.id}
                      className={`p-3.5 rounded-xl border transition-colors ${
                        isOverdue
                          ? "bg-rose-50/50 border-rose-200"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-sans tabular-nums font-bold text-slate-800">
                            {report.ticketCode}
                          </span>
                          <span className="text-[10px] text-slate-500 font-sans tabular-nums">
                            {new Date(report.reportDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {isOverdue ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            Melewati Tenggat (+{report.daysOverdue} Hari)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-900 border border-orange-200/90 shadow-2xs">
                            Dalam Batas Respons
                          </span>
                        )}
                      </div>

                      <div className="font-medium text-slate-900 mb-1">
                        {report.address}
                      </div>
                      <p className="text-[11px] text-slate-600 mb-2">
                        {report.aiAnalysis}
                      </p>

                      {isOverdue && onOpenOmbudsmanDraft && (
                        <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
                          <span className="text-[10px] text-rose-800 font-medium">
                            Telah melewati batas 14 hari pemantauan tanpa respons dinas
                          </span>
                          <button
                            onClick={() => {
                              onClose();
                              onOpenOmbudsmanDraft(report);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#c2410c] hover:bg-[#9a3412] text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <span>Siapkan Draf Ombudsman</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-center">
                Belum ada tiket laporan kerusakan yang tercatat pada ruas ini.
              </div>
            )}
          </div>

          {/* Legal Notice Footer */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[10px] text-amber-900 space-y-1">
            <strong>Catatan Keterbukaan Publik:</strong>
            <p>
              Penetapan status tenggat 14 hari kerja mengacu pada standar pemantauan respons pelayanan publik (UU No. 25/2009). Status ini mencatat keaktifan tindak lanjut tanggapan resmi instansi, bukan keputusan final maladministrasi. Eskalasi ke Ombudsman Republik Indonesia tetap melalui verifikasi bukti dan prosedur resmi.
            </p>
          </div>
        </div>

        {/* 3. MODAL FOOTER */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
          <div className="text-slate-500 text-[11px]">
            Ruas ID: <strong className="font-sans tabular-nums font-bold text-slate-800">{road.id}</strong>
          </div>
          <div className="flex items-center gap-2">
            {onOpenReportModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReportModal();
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
              >
                Laporkan Ruas Ini
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 transition-colors cursor-pointer shadow-xs"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
