"use client";

import React from "react";
import {
  BarChart3,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Building,
  MapPin,
  Award,
} from "lucide-react";
import { NATIONAL_STATS, PROVINCES_DATA } from "@/data/provincesData";

export default function NationalStatsTeaser({ onExploreNational }) {
  const top3 = PROVINCES_DATA.slice(0, 3);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[5px] border border-slate-200/80 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.03)] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-500 font-mono mb-1">
              <BarChart3 className="w-3.5 h-3.5 text-orange-600" />
              <span>Data BPS & SP4N-LAPOR! • Skala Makro Nasional</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Peta Sebaran & Ranking Kerusakan Jalan di 38 Provinsi
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Sebanyak <strong>{NATIONAL_STATS.nationalAverageDamaged}%</strong> jaringan jalan daerah di seluruh Indonesia tercatat dalam kondisi tidak mantap. Telusuri perbandingan rasio kerusakan, volume aduan masyarakat, dan alokasi dana Inpres per provinsi.
            </p>
          </div>

          <button
            onClick={onExploreNational}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[5px] text-xs sm:text-sm font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-xs transition-all cursor-pointer self-start lg:self-auto shrink-0"
          >
            <span>Buka Papan Skor Lengkap 38 Provinsi</span>
            <ArrowRight className="w-4 h-4 text-orange-200" />
          </button>
        </div>

        {/* Top 3 Quick Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {top3.map((prov) => (
            <div
              key={prov.id}
              onClick={onExploreNational}
              className="p-4 rounded-[5px] bg-white/70 hover:bg-white border border-slate-200/80 hover:border-orange-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-[5px] bg-orange-50 text-orange-800 border border-orange-200">
                    Peringkat #{prov.complaintRank} Nasional
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{prov.island}</span>
                </div>

                <div className="mt-2.5 flex items-baseline justify-between">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-700 transition-colors">
                    {prov.name}
                  </h3>
                  {prov.activePilot && (
                    <span className="px-1.5 py-0.5 rounded-[5px] text-[9px] font-bold bg-orange-100 text-orange-850 border border-orange-300">
                      Pilot Area
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {prov.statusSummary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Jalan Rusak</span>
                  <strong className="text-rose-600">{prov.damagedPercentage}%</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Aduan Publik</span>
                  <strong className="text-slate-900">{prov.totalComplaints.toLocaleString("id-ID")}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
