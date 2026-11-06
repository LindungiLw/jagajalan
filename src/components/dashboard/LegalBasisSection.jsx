"use client";

import React from "react";
import {
  Scale,
  FileText,
  Clock,
  Building2,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

export default function LegalBasisSection({ onNavigateTab }) {
  const regulations = [
    {
      code: "UU No. 14 / 2008",
      citation: "Pasal 7, 9, & 11",
      title: "Keterbukaan Informasi Publik",
      mandate: "Akses Anggaran & Kontrak Lelang",
      description:
        "Warga berhak mengetahui rincian pagu APBD, nilai lelang SiRUP, serta kontraktor pelaksana pemeliharaan berkala jalan.",
      feature: "Audit LPSE & SiRUP",
      actionLabel: "Audit Anggaran",
      targetTab: "data-anggaran",
      icon: FileText,
    },
    {
      code: "UU No. 25 / 2009",
      citation: "Pasal 15 & 36",
      title: "Pelayanan Publik",
      mandate: "Kepastian Batas Waktu Layanan",
      description:
        "Instansi penyelenggara wajib menetapkan standar waktu respons penyelesaian aduan warga secara transparan dan terukur.",
      feature: "Hitung Mundur SLA 14 Hari",
      actionLabel: "Pantau di Peta",
      targetTab: "peta",
      icon: Clock,
    },
    {
      code: "UU No. 37 / 2008",
      citation: "Pasal 7 & 8",
      title: "Ombudsman Republik Indonesia",
      mandate: "Penindakan Penundaan Berlarut",
      description:
        "Ombudsman RI berwenang memeriksa dinas yang membiarkan aduan masyarakat melampaui batas waktu wajar (undue delay).",
      feature: "Generator Draf Maladministrasi",
      actionLabel: "Portal Ombudsman",
      targetTab: "ombudsman",
      icon: Scale,
    },
    {
      code: "Inpres No. 3 / 2023",
      citation: "Diktum I & II",
      title: "Konektivitas Jalan Daerah (IJD)",
      mandate: "Intervensi Fiskal APBN",
      description:
        "Landasan hukum bagi pemerintah pusat untuk menyalurkan dana APBN langsung menangani jalan daerah rusak berat saat APBD terbatas.",
      feature: "Pelacakan Alokasi APBN",
      actionLabel: "Pantau Ruas IJD",
      targetTab: "nasional",
      icon: Building2,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 font-sans">
      <div className="bg-slate-100/60 p-2 sm:p-2.5 rounded-[8px] ring-1 ring-orange-200/50">
        <div className="bg-white rounded-[6px] p-5 sm:p-7 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] space-y-6">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1.5 max-w-2xl">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] font-semibold text-[#c2410c]">
                Dasar Regulasi
              </p>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-950 tracking-tight">
                Landasan Hukum Keterbukaan &amp; Penanganan Jalan
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-sans">
                Setiap indikator batas waktu respons, pencocokan lelang pengadaan, dan draf eskalasi di JagaJalan berakar langsung pada peraturan perundang-undangan Republik Indonesia.
              </p>
            </div>

            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 shrink-0 self-start sm:self-auto font-sans shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <ShieldCheck className="w-4 h-4 text-orange-700" />
              <span>Instrumen Yuridis Resmi</span>
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {regulations.map((reg) => {
              const IconComponent = reg.icon;
              return (
                <div
                  key={reg.code}
                  className="rounded-[6px] bg-slate-50/40 hover:bg-white border border-slate-200/80 hover:border-orange-300/80 p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-[0_4px_16px_-4px_rgba(194,65,12,0.06)] group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Law Code & Citation */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-[5px] bg-orange-50 text-orange-800 border border-orange-200/70 tracking-tight">
                        {reg.code}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-slate-500 bg-white/80 border border-slate-200/60 px-2 py-0.5 rounded-[5px]">
                        {reg.citation}
                      </span>
                    </div>

                    {/* Title & Core Mandate */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-950 transition-colors leading-snug">
                        {reg.title}
                      </h3>
                      <p className="text-[11px] font-semibold text-orange-700/90 pt-0.5">
                        {reg.mandate}
                      </p>
                    </div>

                    {/* Citizen Right Description */}
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      {reg.description}
                    </p>
                  </div>

                  {/* Operational Integration in JagaJalan */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9.5px] uppercase tracking-wider font-semibold text-slate-400">
                        Di JagaJalan
                      </span>
                      <span className="text-xs font-semibold text-slate-800 truncate" title={reg.feature}>
                        {reg.feature}
                      </span>
                    </div>

                    {onNavigateTab ? (
                      <button
                        type="button"
                        onClick={() => onNavigateTab(reg.targetTab)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 hover:text-white bg-orange-50 hover:bg-orange-600 px-2.5 py-1 rounded-[5px] border border-orange-200/60 hover:border-orange-600 transition-colors shrink-0 group/btn cursor-pointer"
                        title={`Buka ${reg.actionLabel}`}
                      >
                        <span>{reg.actionLabel}</span>
                        <ArrowUpRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-[5px] border border-slate-200/70 shrink-0">
                        <IconComponent className="w-3 h-3 text-orange-700" />
                        <span>Terintegrasi</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
