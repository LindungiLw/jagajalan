"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, ArrowUpRight } from "lucide-react";

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
      mandate: "Kepastian Batas Waktu Respons",
      description:
        "Mewajibkan dinas penyelenggara layanan memberikan kepastian waktu dan tanggapan formal. Keterlambatan dikenai sanksi administratif.",
      feature: "Pemantauan Tenggat Respons",
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="bg-slate-100/60 p-2 sm:p-2.5 rounded-[8px] ring-1 ring-orange-200/50">
        <div className="bg-white rounded-[6px] p-5 sm:p-7 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="rounded-full px-2.5 py-0.5 text-[9.5px] uppercase tracking-[0.18em] font-bold text-slate-500 bg-slate-100 inline-block font-sans">
                  Instrumen Kebijakan Publik
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-mono font-medium text-slate-500">
                  4 Instrumen Regulasi Aktif
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-950 tracking-tight">
                Payung Hukum Transparansi &amp; Pengawasan Publik
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-500 max-w-2xl leading-relaxed font-sans">
                Setiap data, hitung mundur SLA, dan laporan di JagaJalan berlandaskan instrumen perundang-undangan resmi Republik Indonesia untuk menjamin kepatuhan dinas.
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 ring-1 ring-orange-200/40 text-xs font-semibold text-slate-700 shrink-0 self-start sm:self-auto font-sans">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Kepatuhan Hukum Terjamin</span>
            </div>
          </div>

          {/* 4 Cards Grid (Soft Structuralism) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {regulations.map((reg) => (
              <div
                key={reg.code}
                className="p-5 rounded-[6px] bg-slate-50/70 hover:bg-white ring-1 ring-orange-200/40 hover:ring-orange-300 hover:bg-orange-50/20 hover:shadow-xs transition-all duration-200 space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Code & Feature Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold tracking-tight px-2.5 py-0.5 rounded-full bg-[#c2410c] text-white inline-block">
                      {reg.code}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-700 font-sans">
                      {reg.mandate}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-950 leading-snug pt-0.5">
                    {reg.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    {reg.description}
                  </p>
                </div>

                {/* Functional Integration in JagaJalan */}
                <div className="pt-3.5 border-t border-slate-200/50 flex items-center justify-between gap-2 text-[11px] font-medium text-slate-600">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] shrink-0" />
                    <span className="truncate text-slate-800 font-semibold">{reg.feature}</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200/60 shrink-0 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Berlaku</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

