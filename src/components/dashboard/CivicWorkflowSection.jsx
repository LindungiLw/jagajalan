"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export default function CivicWorkflowSection({ onOpenReportModal }) {
  const steps = [
    {
      step: "01",
      customIcon: "/icon/camera_icon.png",
      badge: "AI Vision",
      title: "Klasifikasi Otomatis AI",
      description:
        "Menyaring foto tidak relevan dan mengestimasi tingkat keparahan kerusakan jalan secara instan.",
      outcome: "Anti-Spam & Skor Bahaya",
    },
    {
      step: "02",
      customIcon: "/icon/maps.png",
      badge: "SK Geospasial",
      title: "Kunci Wewenang Instansi",
      description:
        "Mencocokkan koordinat GPS dengan SK batas jalan resmi agar instansi tidak saling lempar tanggung jawab.",
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
        "Memantau kepatuhan batas waktu respons dinas. Jika diabaikan, draf pengaduan maladministrasi siap diunduh.",
      outcome: "Kepastian Hukum & Eskalasi",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 font-sans">
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight">
              Alur Verifikasi &amp; Akuntabilitas Tindak Lanjut
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 max-w-2xl font-sans">
              Empat tahapan sistem yang menjamin laporan jalan rusak terverifikasi secara geospasial, transparan secara anggaran, dan terikat batas waktu hukum.
            </p>
          </div>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-2xs transition-colors cursor-pointer self-start sm:self-auto shrink-0 active:scale-[0.98] font-sans"
          >
            <span>Buat Laporan Baru</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clean Architectural 4-Column Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/40">
          {steps.map((item) => (
            <div
              key={item.step}
              className="p-4 sm:p-5 bg-white hover:bg-slate-50/60 transition-colors flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Top Row: Step Number & Tech Category Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#c2410c] tracking-wider">
                    TAHAP {item.step}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 font-sans">
                    {item.badge}
                  </span>
                </div>

                {/* Icon + Title */}
                <div className="flex items-center gap-2.5 pt-0.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/80 p-1.5 shadow-2xs shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.customIcon}
                      alt={item.title}
                      width={24}
                      height={24}
                      style={{ width: "24px", height: "24px" }}
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>

                {/* Clean Bottom Outcome Line */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] shrink-0" />
                  <span>{item.outcome}</span>
                </div>
              </div>
          ))}
        </div>
      </div>
    </section>
  );
}
