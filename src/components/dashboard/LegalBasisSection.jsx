"use client";

import React from "react";
import { Scale, CheckCircle2, ShieldCheck, ArrowUpRight } from "lucide-react";

export default function LegalBasisSection() {
  const regulations = [
    {
      code: "UU No. 14 / 2008",
      title: "Keterbukaan Informasi Publik",
      mandate: "Hak Akses Rincian Anggaran",
      description:
        "Menjamin hak setiap warga negara untuk mengetahui rencana kebijakan, pagu alokasi belanja daerah, dan rincian tender proyek jalan.",
      feature: "Audit LPSE & SiRUP",
    },
    {
      code: "UU No. 25 / 2009",
      title: "Pelayanan Publik",
      mandate: "Kepastian Respons 14 Hari",
      description:
        "Mewajibkan dinas penyelenggara layanan memberikan kepastian waktu dan tanggapan formal. Keterlambatan dikenai sanksi administratif.",
      feature: "Countdown SLA 14 Hari",
    },
    {
      code: "UU No. 37 / 2008",
      title: "Ombudsman Republik Indonesia",
      mandate: "Pengawasan Penundaan Berlarut",
      description:
        "Memberikan wewenang pengawasan eksternal untuk menindak dugaan maladministrasi penundaan berlarut (undue delay) oleh dinas berwenang.",
      feature: "Generator Draf Eskalasi",
    },
    {
      code: "Inpres No. 3 / 2023",
      title: "Konektivitas Jalan Daerah (IJD)",
      mandate: "Intervensi Fiskal APBN",
      description:
        "Instruksi Presiden bagi percepatan penanganan jalan daerah yang rusak parah melalui kucuran anggaran intervensi darurat pemerintah pusat.",
      feature: "Pelacakan Bantuan APBN",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Header - Direct, Framed Icon, No redundant badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-orange-50 border border-orange-200/80 p-1.5 shadow-2xs shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon/report.png"
                alt="Landasan Hukum"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
                Payung Hukum Transparansi &amp; Pengawasan Publik
              </h2>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed font-sans">
                Setiap data, hitung mundur SLA, dan laporan di JagaJalan berlandaskan instrumen perundang-undangan resmi Republik Indonesia untuk menjamin akuntabilitas dinas.
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 shrink-0 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>4 Landasan Regulasi Aktif</span>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {regulations.map((reg) => (
            <div
              key={reg.code}
              className="p-5 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-orange-300 hover:shadow-md transition-all duration-200 space-y-3.5 flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                {/* Code & Feature Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold tracking-tight px-2.5 py-1 rounded-md bg-white text-slate-800 border border-slate-200/90 shadow-2xs inline-block">
                    {reg.code}
                  </span>
                  <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-orange-50 text-orange-950 border border-orange-200/80 font-sans shadow-2xs">
                    {reg.mandate}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug pt-0.5 group-hover:text-orange-950 transition-colors">
                  {reg.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {reg.description}
                </p>
              </div>

              {/* Functional Integration in JagaJalan */}
              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2 text-[11px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                  <span className="truncate">{reg.feature}</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/70 shrink-0 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Berlaku</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

