"use client";

import React from "react";
import {
  Compass,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export default function MapShowcaseTeaser({
  roads = [],
  reports = [],
  onExploreMap,
  onSelectRoad,
}) {
  const overdueCount = reports.filter((r) => r.status === "OVERDUE").length;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* Outer Double-Bezel Architecture */}
      <div className="rounded-[8px] bg-slate-100/70 p-2 sm:p-2.5 ring-1 ring-orange-200/50">
        <div className="relative rounded-[6px] p-6 sm:p-8 bg-white shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] overflow-hidden">
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Left Column: Heading & Information */}
            <div className="max-w-2xl space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[6px] bg-orange-50/80 p-2.5 shrink-0 flex items-center justify-center ring-1 ring-orange-200/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icon/maps.png"
                    alt="Peta Transparansi"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 font-sans block">
                    Sistem Informasi Geospasial
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight leading-snug">
                    Eksplorasi Peta Interaktif Kewenangan &amp; Titik Kerusakan Jalan
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Jelajahi bentang ruas jalan berlandaskan SK penetapan resmi lintas 38 provinsi dan koridor percontohan. Dapatkan kepastian instansi teknis penanggung jawab, pantau titik kerusakan yang terverifikasi, dan sandingkan langsung dengan paket pengadaan lelang LPSE.
              </p>

              {/* Quick Metrics Badges (Soft Structuralism) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-3.5 rounded-[6px] bg-slate-50/80 transition-all">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Ruas Terpetakan</div>
                  <div className="text-xl font-bold font-sans tabular-nums text-slate-900 mt-0.5">{roads.length} Ruas</div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-0.5 font-sans">4 Status Wewenang</div>
                </div>

                <div className="p-3.5 rounded-[6px] bg-slate-50/80 transition-all">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Aduan Geotagged</div>
                  <div className="text-xl font-bold font-sans tabular-nums text-slate-900 mt-0.5">{reports.length} Titik</div>
                  <div className="text-[10px] text-orange-700 font-bold mt-0.5 font-sans">Verifikasi AI Vision</div>
                </div>

                <div className="p-3.5 rounded-[6px] bg-slate-50/80 transition-all">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Overdue SLA</div>
                  <div className="text-xl font-bold font-sans tabular-nums text-rose-600 mt-0.5">{overdueCount} Laporan</div>
                  <div className="text-[10px] text-rose-600/80 font-bold mt-0.5 font-sans">Lewat Batas Respons</div>
                </div>

                <div className="p-3.5 rounded-[6px] bg-slate-50/80 transition-all">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Anggaran Terlacak</div>
                  <div className="text-xl font-bold font-sans tabular-nums text-slate-900 mt-0.5">Rp 35,8 M</div>
                  <div className="text-[10px] text-slate-600 font-bold mt-0.5 font-sans">Cross-Match LPSE</div>
                </div>
              </div>

              {/* Primary Action Button (Button-in-Button) */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={onExploreMap}
                  className="inline-flex items-center gap-3 pl-5 pr-2.5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] font-sans"
                >
                  <span>Buka Peta Transparansi (Full Screen GIS)</span>
                  <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4 text-white" />
                  </span>
                </button>
              </div>
            </div>

            {/* Right Column: Quick Preview Ruas Cards */}
            <div className="lg:w-96 space-y-2.5">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between font-sans">
                <span>Sampel Ruas Terpetakan:</span>
                <span className="text-[10px] text-[#c2410c] font-semibold font-sans">Klik untuk sorot di peta</span>
              </div>

              <div className="space-y-2">
                {roads.slice(0, 4).map((road) => {
                  return (
                    <button
                      key={road.id}
                      onClick={() => onSelectRoad && onSelectRoad(road.id)}
                      className="w-full text-left p-3 rounded-[6px] bg-slate-50/70 hover:bg-orange-50/40 ring-1 ring-orange-200/40 hover:ring-orange-300 transition-all group cursor-pointer flex items-center justify-between gap-3 font-sans"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white text-slate-700 ring-1 ring-slate-200/80">
                            {road.authority}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate font-sans">{road.district}</span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 group-hover:text-[#c2410c] transition-colors truncate mt-1 font-sans">
                          {road.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5 font-sans">
                          Alokasi APBD: <strong className="text-slate-800 font-bold tabular-nums">Rp {(road.budget?.paguRp / 1000000000).toFixed(1)} Miliar</strong>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#c2410c] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
