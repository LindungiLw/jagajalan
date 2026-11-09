"use client";

import React, { useState } from "react";
import { ArrowRight, Sliders, Layers } from "lucide-react";
import CivicInspectionRig from "./CivicInspectionRig";

export default function CivicWorkflowSection({ onOpenReportModal }) {
  const [activeView, setActiveView] = useState("pipeline"); // "pipeline" | "simulator"

  const steps = [
    {
      step: "01",
      customIcon: "/icon/camera_icon.png",
      badge: "Integritas Data",
      title: "Verifikasi Foto & Skor Bahaya",
      description:
        "Memeriksa keaslian foto laporan warga dan menghitung estimasi kerusakan permukaan aspal pada lajur jalan.",
      outcome: "Saring Duplikat & Skor Risiko",
    },
    {
      step: "02",
      customIcon: "/icon/maps.png",
      badge: "SK Geospasial",
      title: "Penentuan Dinas Penanggung Jawab",
      description:
        "Mencocokkan titik GPS laporan dengan SK status jalan resmi agar laporan langsung masuk ke meja dinas yang berwenang.",
      outcome: "Kunci Instansi & Pejabat PIC",
    },
    {
      step: "03",
      customIcon: "/icon/financial.png",
      badge: "Audit LPSE",
      title: "Pencocokan Paket Lelang LPSE",
      description:
        "Menghubungkan lokasi kerusakan dengan paket pemeliharaan SiRUP/LPSE untuk memeriksa pagu, nilai kontrak, dan rekanan.",
      outcome: "Data Kontrak & Kontraktor",
    },
    {
      step: "04",
      customIcon: "/icon/time.png",
      badge: "UU No. 25/2009",
      title: "Pantau Tenggat & Draf Ombudsman",
      description:
        "Menghitung mundur estimasi batas waktu tanggap acuan (14 hari kerja) dan menyiapkan draf advokasi ke Ombudsman RI jika dinas terindikasi melakukan penundaan berlarut.",
      outcome: "Draf Advokasi Ombudsman RI",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 font-sans">
      <div className="bg-slate-100/60 p-2 sm:p-2.5 rounded-[8px] ring-1 ring-orange-200/50">
        <div className="bg-white rounded-[6px] p-5 sm:p-7 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] space-y-5">
          
          {/* Header with Eyebrow, View Switcher & Action CTA */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1.5 max-w-2xl">
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-950 tracking-tight">
                Dari Foto Lapangan hingga Tindak Lanjut Dinas
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-sans">
                Setiap laporan yang masuk langsung dicocokkan dengan titik koordinat SK jalan, data kontrak pemeliharaan LPSE, serta batas waktu tanggapan dinas sesuai UU Pelayanan Publik.
              </p>
            </div>

            {/* Right Header Actions: View Toggle + CTA */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
              {/* Anatomy / Pipeline Toggle */}
              <div className="inline-flex items-center p-0.5 rounded-[6px] bg-slate-100/80 border border-slate-200/70 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveView("pipeline")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[5px] font-semibold transition-all cursor-pointer ${
                    activeView === "pipeline"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-orange-600" />
                  <span>Alur 4 Tahap</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("simulator")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[5px] font-semibold transition-all cursor-pointer ${
                    activeView === "simulator"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-orange-600" />
                  <span>Simulasi Mesin (Rig)</span>
                </button>
              </div>

              {/* Island Button-in-Button */}
              <button
                onClick={onOpenReportModal}
                className="group inline-flex items-center gap-2.5 pl-3.5 pr-1.5 py-1.5 rounded-[6px] bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer font-sans"
              >
                <span>Buat Laporan</span>
                <span className="w-5 h-5 rounded-[4px] bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="w-3 h-3 text-white" />
                </span>
              </button>
            </div>
          </div>

          {/* VIEW 1: Clean Architectural 4-Column Pipeline */}
          {activeView === "pipeline" ? (
            <div className="space-y-3 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 rounded-[6px] overflow-hidden ring-1 ring-orange-200/40 bg-slate-50/20">
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
                        <div className="w-10 h-10 rounded-[6px] bg-slate-50 ring-1 ring-orange-200/40 p-2 shadow-2xs shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
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
                    <div className="pt-3.5 border-t border-slate-100 text-[11px] font-semibold text-slate-800">
                      <span>{item.outcome}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Quick-Action Prompt to open Simulator */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-[6px] bg-orange-50/50 border border-orange-200/50 text-xs">
                <span className="text-slate-600">
                  Ingin menguji bagaimana algoritma menghitung kedalaman lubang dan menentukan dinas penanggung jawab?
                </span>
                <button
                  type="button"
                  onClick={() => setActiveView("simulator")}
                  className="inline-flex items-center gap-1.5 font-bold text-orange-700 hover:text-orange-800 cursor-pointer shrink-0 transition-colors"
                >
                  <span>Buka Simulasi Mesin (Anatomy Rig)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* VIEW 2: Anatomy Civic Verification Test-Rig */
            <div className="animate-fade-in space-y-2">
              <CivicInspectionRig />
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
