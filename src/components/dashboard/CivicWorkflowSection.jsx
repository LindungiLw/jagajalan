"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export default function CivicWorkflowSection({ onOpenReportModal }) {
  const steps = [
    {
      step: "01",
      customIcon: "/icon/report.png",
      badge: "AI Vision",
      title: "Klasifikasi Otomatis AI",
      description:
        "Computer Vision menyaring foto spam/selfie, mengenali jenis kerusakan visual (pothole, retak, ambles), dan menghitung estimasi Hazard Score.",
      outcome: "Filter anti-spam & estimasi skor bahaya",
    },
    {
      step: "02",
      customIcon: "/icon/maps.png",
      badge: "SK Geospasial",
      title: "Kunci Wewenang Instansi",
      description:
        "Sistem mencocokkan koordinat geotagged dengan data batas administratif resmi untuk mengunci instansi penanggung jawab (KemenPU, Pemprov, atau Pemkot).",
      outcome: "Menghilangkan saling lempar tanggung jawab",
    },
    {
      step: "03",
      customIcon: "/icon/financial.png",
      badge: "Audit LPSE",
      title: "Penelusuran Anggaran",
      description:
        "Menyandingkan titik laporan dengan paket tender LPSE aktif: rincian pagu APBD/APBN, nilai kontrak kontraktor, serta status efisiensi lelang.",
      outcome: "Transparansi alokasi dana pemeliharaan",
    },
    {
      step: "04",
      customIcon: "/icon/time.png",
      badge: "UU No. 25/2009",
      title: "SLA & Advokasi Ombudsman",
      description:
        "Menghitung mundur tenggat respons 14 hari kerja dinas. Jika diabaikan, warga dapat men-generate draf formal pengaduan maladministrasi ke Ombudsman RI.",
      outcome: "Kepastian hukum dan percepatan tindak lanjut",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Header - Direct & Clean (No redundant badge) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
              Dari Laporan Warga Menuju Kepastian Penanganan
            </h2>
            <p className="text-xs text-slate-500 max-w-xl">
              Empat lapisan verifikasi otomatis yang menjembatani keluhan warga di lapangan dengan akuntabilitas hukum dinas.
            </p>
          </div>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-sm hover:shadow-md transition-all cursor-pointer self-start sm:self-auto shrink-0 active:scale-[0.98]"
          >
            <span>Uji Coba Lapor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Connected Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {steps.map((item, index) => {
            return (
              <div
                key={item.step}
                className="relative p-5 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-orange-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-xs font-sans tabular-nums font-bold text-slate-600 group-hover:text-orange-700 group-hover:border-orange-300 transition-colors">
                      {item.step}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-semibold border bg-white text-slate-700 border-slate-200/90 shadow-2xs font-sans">
                      {item.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 p-1.5 shadow-2xs shrink-0 transition-transform group-hover:scale-105 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.customIcon}
                        alt={item.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-orange-900 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                  <span className="truncate">{item.outcome}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
