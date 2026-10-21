"use client";

import React from "react";
import {
  Camera,
  ShieldCheck,
  FileSearch,
  Scale,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export default function CivicWorkflowSection({ onOpenReportModal }) {
  const steps = [
    {
      step: "01",
      icon: Camera,
      badge: "Computer Vision AI",
      badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
      title: "Lapor & Inspeksi Citra AI",
      description:
        "Warga mengambil foto lubang jalan. Google Gemini Vision AI langsung menganalisis keaslian objek (anti-spam), kedalaman lubang, dan menghitung skor bahaya (1 - 100).",
    },
    {
      step: "02",
      icon: ShieldCheck,
      badge: "SK Ruas Resmi",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      title: "Kunci Instansi Penanggung Jawab",
      description:
        "Koordinat GPS mencocokkan ruas ke database geospasial resmi. Sistem mengunci wewenang ke KemenPUPR (Nasional), DBMPR (Provinsi), atau Dinas PU Kota/Kab.",
    },
    {
      step: "03",
      icon: FileSearch,
      badge: "Keterbukaan LPSE",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      title: "Audit Anggaran & Kontrak APBD",
      description:
        "Sistem menyandingkan laporan dengan paket lelang pemeliharaan jalan di LPSE. Publik tahu apakah jalan tersebut sudah dianggarkan miliaran rupiah atau nihil.",
    },
    {
      step: "04",
      icon: Scale,
      badge: "UU No. 25/2009",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      title: "Kawal SLA 14 Hari & Ombudsman",
      description:
        "Jam hitung mundur kepatuhan dinas diaktifkan. Jika melewati 14 hari kerja tanpa tindak lanjut fisik, sistem membuatkan draf resmi laporan ke Ombudsman RI.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.03)] space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-orange-600 font-mono mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Alur Solusi Dari Hulu Ke Hilir</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Cara JagaJalan Membuka Kotak Hitam Birokrasi
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Empat tahapan terintegrasi yang mengubah laporan warga dari sekadar keluhan di media sosial menjadi kepastian hukum, transparansi anggaran, dan eksekusi perbaikan.
            </p>
          </div>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
          >
            <span>Uji Coba Lapor Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-5 rounded-xl bg-white/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-slate-400 group-hover:text-orange-600 transition-colors">
                      {item.step}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-400 group-hover:text-orange-600 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Sistem Otomatis Terverifikasi</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
