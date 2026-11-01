"use client";

import React from "react";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";

export default function CivicWorkflowSection({ onOpenReportModal }) {
  const steps = [
    {
      step: "01",
      customIcon: "/icon/camera_icon.png",
      badge: "AI Vision",
      title: "Klasifikasi Otomatis AI",
      description:
        "Menyaring foto palsu/spam dan menghitung skor bahaya kerusakan jalan secara instan.",
      outcome: "Anti-Spam & Skor Bahaya",
    },
    {
      step: "02",
      customIcon: "/icon/maps.png",
      badge: "SK Geospasial",
      title: "Kunci Wewenang Instansi",
      description:
        "Mencocokkan koordinat GPS dengan SK batas jalan resmi agar dinas tidak bisa saling lempar tanggung jawab.",
      outcome: "Kunci Pejabat & Dinas PIC",
    },
    {
      step: "03",
      customIcon: "/icon/financial.png",
      badge: "Audit LPSE",
      title: "Penelusuran Anggaran",
      description:
        "Menyandingkan lokasi jalan dengan paket lelang LPSE untuk transparansi alokasi dana pemeliharaan.",
      outcome: "Cross-Match Nilai Kontrak",
    },
    {
      step: "04",
      customIcon: "/icon/time.png",
      badge: "UU No. 25/2009",
      title: "SLA & Ombudsman RI",
      description:
        "Hitung mundur batas respons 14 hari kerja. Jika diabaikan, draf somasi Ombudsman langsung diterbitkan.",
      outcome: "Kepastian Hukum & Eskalasi",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 font-sans">
      <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Header - Direct, Clear & Punchy */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10.5px] font-bold uppercase tracking-wider bg-orange-50 text-orange-800 border border-orange-200/80 shadow-2xs font-sans">
              <Sparkles className="w-3 h-3 text-orange-600" />
              <span>Pipeline Verifikasi Otomatis</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
              Dari Laporan Warga Menuju Kepastian Penanganan
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 max-w-2xl font-sans">
              Empat tahapan sistem yang menjamin laporan jalan rusak tidak di-ghosting dinas, terverifikasi AI, dan berkepastian hukum.
            </p>
          </div>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-sm hover:shadow-md transition-all cursor-pointer self-start sm:self-auto shrink-0 active:scale-[0.98] font-sans"
          >
            <span>Uji Coba Lapor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Connected Pipeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {steps.map((item, index) => {
            const isLast = index === steps.length - 1;

            return (
              <div key={item.step} className="relative group">
                {/* Desktop Connecting Arrow between steps */}
                {!isLast && (
                  <div className="hidden lg:flex items-center justify-center absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-400 group-hover:text-orange-600 group-hover:border-orange-300 transition-colors">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}

                <div className="h-full p-4 sm:p-5 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Top Row: Step Number & Tech Category Badge */}
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-xs font-sans tabular-nums font-bold text-slate-700 group-hover:text-orange-700 group-hover:border-orange-300 transition-colors">
                        {item.step}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-white text-slate-700 border-slate-200/90 shadow-2xs font-sans">
                        {item.badge}
                      </span>
                    </div>

                    {/* Icon + Title */}
                    <div className="flex items-center gap-2.5 pt-0.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 p-1.5 shadow-2xs shrink-0 transition-transform group-hover:scale-105 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.customIcon}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-orange-900 transition-colors leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    {/* Punchy 2-line Description */}
                    <p className="text-xs text-slate-600 leading-relaxed font-sans min-h-[48px]">
                      {item.description}
                    </p>
                  </div>

                  {/* Clean Bottom Outcome Tag (No Truncation) */}
                  <div className="pt-3 border-t border-slate-200/60">
                    <div className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/70 shadow-2xs text-[11px] font-bold text-slate-700 group-hover:text-orange-950 group-hover:bg-orange-50/60 group-hover:border-orange-200/80 transition-colors flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                      <span className="leading-tight">{item.outcome}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
