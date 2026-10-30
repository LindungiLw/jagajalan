"use client";

import React from "react";
import { Scale, FileText, CheckCircle2, Shield, Landmark } from "lucide-react";

export default function LegalBasisSection() {
  const regulations = [
    {
      code: "UU No. 14 / 2008",
      title: "Keterbukaan Informasi Publik",
      role: "Hak Warga atas Informasi Anggaran",
      description:
        "Menjamin hak setiap warga negara untuk mengetahui rencana kebijakan publik, program pelayanan publik, serta rincian penggunaan anggaran APBD/APBN.",
      accent: "text-orange-800 bg-orange-50 border-orange-200/80",
      pill: "Keterbukaan Anggaran",
    },
    {
      code: "UU No. 25 / 2009",
      title: "Pelayanan Publik",
      role: "Batas Waktu Tanggapan (SLA 14 Hari)",
      description:
        "Mewajibkan instansi penyelenggara pelayanan publik memberikan kepastian waktu dan tanggapan resmi, dengan sanksi administratif bagi instansi yang mengabaikan.",
      accent: "text-amber-800 bg-amber-50 border-amber-200/80",
      pill: "Standar Layanan Publik",
    },
    {
      code: "UU No. 37 / 2008",
      title: "Ombudsman Republik Indonesia",
      role: "Penindakan Penundaan Berlarut",
      description:
        "Memberikan wewenang kepada Ombudsman RI untuk memeriksa dan menindak dugaan maladministrasi penundaan berlarut (undue delay) oleh dinas/pemerintah daerah.",
      accent: "text-rose-700 bg-rose-50 border-rose-200/80",
      pill: "Pengawasan Maladministrasi",
    },
    {
      code: "Inpres No. 3 / 2023",
      title: "Konektivitas Jalan Daerah",
      role: "Intervensi Darurat APBN",
      description:
        "Instruksi Presiden bagi percepatan peningkatan konektivitas jalan daerah dengan mengalokasikan belasan triliun rupiah APBN untuk intervensi jalan rusak.",
      accent: "text-orange-900 bg-orange-50/70 border-orange-200/70",
      pill: "Intervensi Fiskal Nasional",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="max-w-2xl space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase text-slate-700 bg-slate-100 border border-slate-200">
            <Scale className="w-3 h-3 text-orange-600" />
            <span>Landasan Regulasi & Kepatuhan Hukum</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Payung Hukum Transparansi &amp; Pengawasan Publik
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            JagaJalan berdiri di atas instrumen perundang-undangan resmi Republik Indonesia untuk memastikan setiap aduan memiliki kekuatan hukum dan akuntabilitas dinas yang terukur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {regulations.map((reg) => (
            <div
              key={reg.code}
              className="p-5 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold tracking-tight px-2 py-0.5 rounded-md bg-white text-slate-800 border border-slate-200 shadow-2xs inline-block">
                    {reg.code}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${reg.accent}`}>
                    {reg.pill}
                  </span>
                </div>
                
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug pt-0.5">
                  {reg.title}
                </h3>
                
                <div className="text-[11px] font-semibold text-orange-700">
                  {reg.role}
                </div>
                
                <p className="text-xs text-slate-600 leading-relaxed pt-0.5 font-sans">
                  {reg.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  <span>Kepatuhan Resmi</span>
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
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
