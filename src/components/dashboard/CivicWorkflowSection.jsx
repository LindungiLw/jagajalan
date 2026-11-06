"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export default function CivicWorkflowSection({ onOpenReportModal }) {
  const steps = [
    {
      step: "01",
      customIcon: "/icon/camera_icon.png",
      badge: "Integritas Data",
      title: "Validasi Bukti & Anti-Spam",
      description:
        "Memverifikasi keaslian dokumentasi foto kerusakan jalan dan mengukur estimasi keparahan fisik secara objektif.",
      outcome: "Anti-Spam & Skor Bahaya Fisik",
    },
    {
      step: "02",
      customIcon: "/icon/maps.png",
      badge: "SK Geospasial",
      title: "Kepastian Wewenang Dinas",
      description:
        "Mencocokkan koordinat presisi dengan SK status jalan resmi untuk mengunci instansi teknis penanggung jawab.",
      outcome: "Kunci Dinas & Pejabat PIC",
    },
    {
      step: "03",
      customIcon: "/icon/financial.png",
      badge: "Audit LPSE",
      title: "Penelusuran Tender & Pagu",
      description:
        "Menyandingkan titik ruas dengan paket pengadaan SiRUP/LPSE untuk transparansi alokasi dana pemeliharaan berkala.",
      outcome: "Uji Silang Nilai Kontrak Lelang",
    },
    {
      step: "04",
      customIcon: "/icon/time.png",
      badge: "UU No. 25/2009",
      title: "SLA & Advokasi Ombudsman",
      description:
        "Memantau kepatuhan tenggat respons dinas. Menyiapkan draf formal pengaduan jika terjadi penundaan berlarut (undue delay).",
      outcome: "Kepastian Hukum & Eksekusi",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 font-sans">
      <div className="bg-slate-100/60 p-2 sm:p-2.5 rounded-[1.75rem] ring-1 ring-orange-200/50">
        <div className="bg-white rounded-[1.25rem] p-5 sm:p-7 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] space-y-6">
          
          {/* Header with Eyebrow & Button-in-Button CTA */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="rounded-full px-2.5 py-0.5 text-[9.5px] uppercase tracking-[0.18em] font-bold text-[#c2410c] bg-orange-50 inline-block font-sans">
                  SOP Standar Kepatuhan
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-mono font-medium text-slate-500">
                  4 Tahapan Verifikasi
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-950 tracking-tight">
                Alur Verifikasi &amp; Akuntabilitas Tindak Lanjut
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-sans">
                Empat tahapan sistem yang menjamin laporan jalan rusak terverifikasi secara geospasial, transparan secara anggaran, dan terikat batas waktu hukum resmi.
              </p>
            </div>

            {/* Island Button-in-Button */}
            <div className="shrink-0 self-start sm:self-auto">
              <button
                onClick={onOpenReportModal}
                className="group inline-flex items-center gap-2.5 pl-4 pr-1.5 py-1.5 rounded-full bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer font-sans"
              >
                <span>Buat Laporan Baru</span>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </span>
              </button>
            </div>
          </div>

          {/* Clean Architectural 4-Column Pipeline (Zero Boxy Clutter) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 rounded-2xl overflow-hidden ring-1 ring-orange-200/40 bg-slate-50/20">
            {steps.map((item) => (
              <div
                key={item.step}
                className="p-5 sm:p-6 bg-white hover:bg-slate-50/60 transition-colors flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3.5">
                  {/* Top Row: Step Number & Tech Category Pill */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#c2410c] tracking-wider">
                      TAHAP {item.step}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100/80 text-slate-600 font-sans">
                      {item.badge}
                    </span>
                  </div>

                  {/* Icon + Title */}
                  <div className="flex items-center gap-3 pt-0.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 ring-1 ring-orange-200/40 p-2 shadow-2xs shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
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
                    <h3 className="font-bold text-sm text-slate-950 leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>

                {/* Clean Bottom Outcome Line */}
                <div className="pt-3.5 border-t border-slate-100 flex items-center gap-2 text-[11px] font-semibold text-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] shrink-0" />
                  <span>{item.outcome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
