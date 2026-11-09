"use client";

import React from "react";
import {
  Scale,
  FileText,
  Clock,
  Building2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function LegalBasisSection({ onNavigateTab }) {
  const regulations = [
    {
      code: "UU 14/2008",
      citation: "Pasal 7 & 11",
      title: "Keterbukaan Anggaran",
      summary: "Hak akses pagu APBD dan rincian pemenang tender LPSE.",
      actionLabel: "Audit Data Lelang",
      targetTab: "data-anggaran",
      icon: FileText,
    },
    {
      code: "UU 25/2009",
      citation: "Pasal 15 & 36",
      title: "Kepastian Tanggap",
      summary: "Kewajiban dinas menindaklanjuti laporan dalam batas waktu resmi.",
      actionLabel: "Pantau di Peta",
      targetTab: "peta",
      icon: Clock,
    },
    {
      code: "UU 37/2008",
      citation: "Pasal 7 & 8",
      title: "Eskalasi Ombudsman",
      summary: "Kewenangan menindak kelalaian atau penundaan berlarut dinas.",
      actionLabel: "Draf Ombudsman",
      targetTab: "ombudsman",
      icon: Scale,
    },
    {
      code: "Inpres 3/2023",
      citation: "Diktum I & II",
      title: "Intervensi APBN",
      summary: "Penyaluran dana pusat untuk perbaikan jalan daerah rusak berat.",
      actionLabel: "Pantau Ruas IJD",
      targetTab: "nasional",
      icon: Building2,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 font-sans">
      <div className="bg-slate-100/60 p-2 sm:p-2.5 rounded-[8px] ring-1 ring-orange-200/50">
        <div className="bg-white rounded-[6px] p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] space-y-4">
          
          {/* Header: Clean without boxed eyebrow */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1 max-w-2xl">
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-950 tracking-tight">
                Landasan Hukum Keterbukaan &amp; Penanganan Jalan
              </h2>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 shrink-0 self-start sm:self-auto font-sans">
              <ShieldCheck className="w-4 h-4 text-orange-700" />
              <span>4 Instrumen Yuridis</span>
            </div>
          </div>

          {/* Connected Single Minimalist Strip (Zero Separate Cards, Zero Boxy Pills) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 rounded-[6px] ring-1 ring-orange-200/40 bg-white overflow-hidden shadow-2xs">
            {regulations.map((reg) => {
              const IconComponent = reg.icon;
              return (
                <div
                  key={reg.code}
                  onClick={() => onNavigateTab && onNavigateTab(reg.targetTab)}
                  className="p-4 sm:p-5 hover:bg-orange-50/30 transition-colors flex flex-col justify-between space-y-3 group cursor-pointer"
                >
                  <div className="space-y-2">
                    {/* Inline Law Ref: Pure typography without boxy badges */}
                    <div className="flex items-center gap-2 text-xs">
                      <IconComponent className="w-3.5 h-3.5 text-orange-600 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="font-mono font-bold text-slate-800 tracking-tight">
                        {reg.code}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] text-slate-400 font-sans">
                        {reg.citation}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-950 transition-colors">
                      {reg.title}
                    </h3>

                    {/* Minimal 1-Line Description */}
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      {reg.summary}
                    </p>
                  </div>

                  {/* Clean Action Link */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 group-hover:text-orange-800 transition-colors">
                      <span>{reg.actionLabel}</span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Aktif
                    </span>
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
