"use client";

import React from "react";
import {
  MapPin,
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  FileText,
  Compass,
} from "lucide-react";

export default function MapShowcaseTeaser({
  roads,
  reports,
  onExploreMap,
  onSelectRoad,
}) {
  const overdueCount = reports.filter((r) => r.status === "OVERDUE").length;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* Outer Glassmorphic "Bening" Container */}
      <div className="relative rounded-[5px] p-6 sm:p-8 bg-white/75 backdrop-blur-xl border border-slate-200/80 shadow-[0_10px_35px_-5px_rgba(15,23,42,0.05),0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Subtle Ambient Refraction Gradients */}
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 bottom-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: Heading & Information */}
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[5px] bg-orange-50/80 border border-orange-200/80 text-orange-700 text-[11px] font-bold tracking-wider uppercase font-mono shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Deep-Dive Geospasial Pilot • Wilayah Juara Aduan</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight leading-snug">
              Eksplorasi Peta Interaktif Kewenangan & Titik Kerusakan Jalan
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Jelajahi garis ruas jalan ber-SK resmi di Jawa Barat & koridor Bodetabek. Buka kotak hitam birokrasi: identifikasi instansi penanggung jawab secara pasti, lacak posisi lubang aspal terverifikasi AI, dan bandingkan langsung dengan paket tender APBD di LPSE.
            </p>

            {/* Quick Metrics Badges - Clean Frosted Glass */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 rounded-[5px] bg-white/70 backdrop-blur-md border border-slate-200/70 shadow-2xs hover:bg-white hover:border-slate-300 transition-all">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">Ruas Terpetakan</div>
                <div className="text-xl font-bold font-sans tabular-nums text-slate-900 mt-0.5">{roads.length} Ruas</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5 font-sans">3 Wewenang Terpisah</div>
              </div>

              <div className="p-3.5 rounded-[5px] bg-white/70 backdrop-blur-md border border-slate-200/70 shadow-2xs hover:bg-white hover:border-slate-300 transition-all">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">Aduan Geotagged</div>
                <div className="text-xl font-bold font-sans tabular-nums text-slate-900 mt-0.5">{reports.length} Titik</div>
                <div className="text-[10px] text-orange-600 font-bold mt-0.5 font-sans">Verifikasi AI Vision</div>
              </div>

              <div className="p-3.5 rounded-[5px] bg-white/70 backdrop-blur-md border border-slate-200/70 shadow-2xs hover:bg-white hover:border-slate-300 transition-all">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">Overdue SLA</div>
                <div className="text-xl font-bold font-sans tabular-nums text-rose-600 mt-0.5">{overdueCount} Laporan</div>
                <div className="text-[10px] text-rose-600/80 font-bold mt-0.5 font-sans">&gt; 14 Hari Tanpa Respon</div>
              </div>

              <div className="p-3.5 rounded-[5px] bg-white/70 backdrop-blur-md border border-slate-200/70 shadow-2xs hover:bg-white hover:border-slate-300 transition-all">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">Anggaran Terlacak</div>
                <div className="text-xl font-bold font-sans tabular-nums text-slate-900 mt-0.5">Rp 35,8 M</div>
                <div className="text-[10px] text-blue-600 font-bold mt-0.5 font-sans">Cross-Match LPSE</div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreMap}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[5px] text-xs sm:text-sm font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.98] font-sans"
              >
                <Compass className="w-4 h-4" />
                <span>Buka Peta Transparansi (Full Screen GIS)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Quick Preview Ruas Cards - Bening & Translucent */}
          <div className="lg:w-96 space-y-2.5">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between font-sans">
              <span>Sampel Ruas Terpetakan:</span>
              <span className="text-[10px] text-orange-600 font-semibold font-sans">Klik untuk sorot di peta</span>
            </div>

            <div className="space-y-2">
              {roads.slice(0, 4).map((road) => {
                const badgeColor =
                  road.authority === "NASIONAL"
                    ? "bg-slate-100 text-slate-700 border-slate-300"
                    : road.authority === "PROVINSI"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-orange-50 text-orange-700 border-orange-200";

                return (
                  <button
                    key={road.id}
                    onClick={() => onSelectRoad(road.id)}
                    className="w-full text-left p-3 rounded-[5px] bg-white/65 hover:bg-white backdrop-blur-md border border-slate-200/80 hover:border-orange-300 hover:shadow-xs transition-all group cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded-[5px] text-[9px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                          {road.authority}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate font-sans">{road.district}</span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 group-hover:text-orange-600 transition-colors truncate mt-1 font-sans">
                        {road.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5 font-sans">
                        Alokasi APBD: <strong className="text-slate-700 font-bold tabular-nums">Rp {(road.budget?.paguRp / 1000000000).toFixed(1)} Miliar</strong>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
