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
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
        {/* Header - Civic Icon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200/80 p-1.5 shadow-2xs shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon/hukum_icon.png"
                alt="Landasan Hukum"
                width={28}
                height={28}
                style={{ width: "28px", height: "28px" }}
                className="w-7 h-7 object-contain"
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight">
                Payung Hukum Transparansi &amp; Pengawasan Publik
              </h2>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed font-sans">
                Setiap data, hitung mundur SLA, dan laporan di JagaJalan berlandaskan instrumen perundang-undangan resmi Republik Indonesia untuk menjamin akuntabilitas dinas.
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shrink-0 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>4 Instrumen Regulasi Aktif</span>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {regulations.map((reg) => (
            <div
              key={reg.code}
              className="p-4 sm:p-5 rounded-xl bg-slate-50/50 hover:bg-white border border-slate-200/90 hover:border-slate-300 transition-colors space-y-3.5 flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                {/* Code & Feature Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold tracking-tight px-2 py-0.5 rounded bg-slate-900 text-white inline-block">
                    {reg.code}
                  </span>
                  <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded bg-orange-50 text-[#9a3412] border border-orange-200/80 font-sans">
                    {reg.mandate}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug pt-0.5">
                  {reg.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {reg.description}
                </p>
              </div>

              {/* Functional Integration in JagaJalan */}
              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2 text-[11px] font-medium text-slate-600">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] shrink-0" />
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

