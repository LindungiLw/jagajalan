"use client";

import React from "react";
import { Shield, Scale, FileText, CheckCircle2, Lock } from "lucide-react";

export default function LegalBasisSection() {
  const regulations = [
    {
      code: "UU No. 14 / 2008",
      title: "Keterbukaan Informasi Publik (KIP)",
      role: "Hak Warga atas Informasi Anggaran",
      description:
        "Menjamin hak setiap warga negara untuk mengetahui rencana pembuatan kebijakan publik, program pelayanan publik, serta rincian penggunaan anggaran negara dan daerah (APBD).",
    },
    {
      code: "UU No. 25 / 2009",
      title: "Pelayanan Publik",
      role: "Batas Waktu Tanggapan (SLA)",
      description:
        "Mewajibkan instansi penyelenggara pelayanan publik memberikan kepastian waktu dan tanggapan resmi kepada pelapor, dengan sanksi administratif bagi instansi yang mengabaikan.",
    },
    {
      code: "UU No. 37 / 2008",
      title: "Ombudsman Republik Indonesia",
      role: "Penindakan Penundaan Berlarut",
      description:
        "Memberikan wewenang kepada Ombudsman RI untuk memeriksa dan menindak dugaan maladministrasi penundaan berlarut (undue delay) yang dilakukan dinas/pemerintah daerah.",
    },
    {
      code: "Inpres No. 3 / 2023",
      title: "Konektivitas Jalan Daerah (IJD)",
      role: "Intervensi Darurat APBN",
      description:
        "Instruksi Presiden bagi percepatan peningkatan konektivitas jalan daerah dengan mengalokasikan dana APBN untuk menangani jalan kabupaten/provinsi yang tidak mantap.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[5px] border border-slate-200/80 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.03)] space-y-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-500 font-mono mb-1">
            <Scale className="w-3.5 h-3.5 text-orange-600" />
            <span>Landasan Regulasi & Kepatuhan Hukum</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Payung Hukum Transparansi & Pengawasan Publik
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            JagaJalan berdiri di atas instrumen perundang-undangan resmi Republik Indonesia untuk memastikan setiap aduan memiliki kekuatan hukum dan akuntabilitas dinas yang terukur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {regulations.map((reg) => (
            <div
              key={reg.code}
              className="p-4 rounded-[5px] bg-slate-50/70 border border-slate-200/80 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-[5px] bg-white text-slate-800 border border-slate-200 inline-block">
                  {reg.code}
                </span>
                <h3 className="text-xs font-bold text-slate-900 leading-snug">
                  {reg.title}
                </h3>
                <div className="text-[10px] font-bold text-orange-700">
                  {reg.role}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                  {reg.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                <Shield className="w-3 h-3 text-emerald-600" />
                <span>Kekuatan Hukum Mengikat</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
