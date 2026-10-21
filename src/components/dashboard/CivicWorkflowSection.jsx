"use client";

import React from "react";
import {
  Camera,
  ShieldCheck,
  FileSearch,
  Scale,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function CivicWorkflowSection({ onOpenReportModal }) {
  const steps = [
    {
      step: "01",
      icon: Camera,
      badge: "AI Inspector",
      badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
      title: "Inspeksi Citra AI",
      description:
        "Foto dianalisis otomatis oleh Gemini Vision untuk memverifikasi keaslian objek (anti-spam) dan mengukur skor bahaya jalan (1–100).",
    },
    {
      step: "02",
      icon: ShieldCheck,
      badge: "SK Ruas Resmi",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
      title: "Kunci Wewenang",
      description:
        "GPS mencocokkan ruas ke database hukum resmi (KemenPUPR, DBMPR Provinsi, atau Pemkot/Kab) untuk menghentikan saling lempar tanggung jawab.",
    },
    {
      step: "03",
      icon: FileSearch,
      badge: "Lelang LPSE",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      title: "Audit APBD",
      description:
        "Menyandingkan titik kerusakan dengan paket tender lelang di LPSE. Publik langsung tahu nilai pagu dan kontraktor pemenang yang ditunjuk.",
    },
    {
      step: "04",
      icon: Scale,
      badge: "SLA 14 Hari",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      title: "Kawal Ombudsman",
      description:
        "Hitung mundur respon dinas berwenang. Jika terabaikan melewati 14 hari kerja, sistem otomatis menyusun draf laporan ke Ombudsman RI.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-7 rounded-[5px] border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] space-y-5">
        {/* Header - Simple & Clean */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-orange-700 font-mono mb-0.5">
              Alur 4 Langkah Solusi
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Dari Laporan Warga Menuju Kepastian Penanganan
            </h2>
          </div>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[5px] text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
          >
            <span>Uji Coba Lapor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Connected Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-4 rounded-[5px] bg-slate-50/60 hover:bg-white border border-slate-200/70 hover:border-orange-200 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-[5px] bg-white border border-slate-200 flex items-center justify-center text-[11px] font-mono font-black text-slate-500 group-hover:text-orange-700 group-hover:border-orange-300 transition-colors">
                      {item.step}
                    </span>
                    <span className={`px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 pt-0.5">
                    <div className="p-2 rounded-[5px] bg-white border border-slate-200/80 text-slate-700 group-hover:text-orange-700 group-hover:border-orange-200 transition-colors shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-orange-700 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/50 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Otomatis & Terverifikasi</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
