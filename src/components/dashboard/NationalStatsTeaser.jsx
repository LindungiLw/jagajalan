"use client";

import React from "react";
import {
  BarChart3,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { NATIONAL_STATS, PROVINCES_DATA } from "@/data/provincesData";

export default function NationalStatsTeaser({ onExploreNational }) {
  const top3 = PROVINCES_DATA.slice(0, 3);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-100 pb-5">
          <div className="max-w-2xl">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200/80 p-1.5 shadow-2xs shrink-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icon/statistik_icon.png"
                  alt="Statistik Nasional"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase text-slate-700 bg-slate-100 border border-slate-200">
                  <BarChart3 className="w-3 h-3 text-orange-600" />
                  <span>Data BPS &amp; SP4N-LAPOR! • Skala Makro Nasional</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
                  Peta Sebaran &amp; Ranking Kerusakan Jalan di 38 Provinsi
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed font-sans pt-0.5">
                  Sebanyak <strong className="text-slate-800">{NATIONAL_STATS.nationalAverageDamaged}%</strong> jaringan jalan daerah di seluruh Indonesia tercatat dalam kondisi tidak mantap. Telusuri perbandingan rasio kerusakan, volume aduan masyarakat, dan alokasi dana Inpres per provinsi.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onExploreNational}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-sm hover:shadow-md transition-all cursor-pointer self-start lg:self-auto shrink-0 active:scale-[0.98]"
          >
            <span>Buka Papan Skor Lengkap 38 Provinsi</span>
            <ArrowRight className="w-4 h-4 text-orange-100" />
          </button>
        </div>

        {/* Top 3 Quick Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {top3.map((prov) => (
            <div
              key={prov.id}
              onClick={onExploreNational}
              className="p-5 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-orange-300 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200/80">
                    Peringkat #{prov.complaintRank} Nasional
                  </span>
                  <span className="text-xs font-medium text-slate-400 font-sans">{prov.island}</span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-700 transition-colors font-heading">
                    {prov.name}
                  </h3>
                  {prov.activePilot && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-50 text-orange-950 border border-orange-200/90 shadow-2xs">
                      Pilot Area
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans">
                  {prov.statusSummary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs font-sans tabular-nums">
                <div>
                  <span className="text-[10px] font-medium text-slate-400 block font-sans">Jalan Rusak</span>
                  <strong className="text-rose-600 font-bold">{prov.damagedPercentage}%</strong>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-slate-400 block font-sans">Aduan Publik</span>
                  <strong className="text-slate-900 font-bold">{prov.totalComplaints.toLocaleString("id-ID")}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
