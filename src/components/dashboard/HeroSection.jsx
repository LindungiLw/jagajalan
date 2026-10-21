"use client";

import React from "react";
import { AlertCircle, TrendingUp, Clock, Building2, MapPin, Plus, ArrowUpRight, ShieldCheck, HardHat } from "lucide-react";

export default function HeroSection({ onExploreMap, onOpenReport, onExploreNational, onOpenOfficerPortal }) {
  return (
    <section className="pt-6 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Dashboard Title & Quick Action Bar */}
        <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="text-[11px] font-bold tracking-wider uppercase text-orange-600 font-mono">
              Portal Geospasial Kewenangan & Anggaran Jalan Publik
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cari penanggung jawab. Telusuri anggaran. Pantau tindak lanjut.
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              JagaJalan menghubungkan informasi kewenangan ruas, data proyek terkait, dan perkembangan laporan agar mudah ditelusuri masyarakat.
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onExploreMap}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-xs transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Buka Peta Transparansi</span>
            </button>
            <button
              onClick={onOpenReport}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Lapor Kerusakan</span>
            </button>
            <button
              onClick={onOpenOfficerPortal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-800 bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <HardHat className="w-3.5 h-3.5 text-orange-400" />
              <span>Portal Dinas</span>
            </button>
          </div>
        </div>

        {/* 4 Crisp KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Ombudsman Pemda */}
          <div className="dashboard-card p-5 rounded-xl border-l-4 border-l-rose-600 dashboard-card-hover">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Aduan Pemda</span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">4.766</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600 leading-snug">
              Laporan masyarakat ditujukan ke <strong>Pemda</strong>; 622 laporan pada substansi perhubungan & infrastruktur.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
              Sumber: Laporan Ombudsman RI 2025/2026
            </div>
          </div>

          {/* Card 2: Penundaan Berlarut */}
          <div className="dashboard-card p-5 rounded-xl border-l-4 border-l-amber-500 dashboard-card-hover">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Penundaan Berlarut</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">21,25%</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600 leading-snug">
              Bentuk dugaan maladministrasi tertinggi berupa <strong>undue delay</strong> dalam pelayanan publik.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
              Sumber: Ombudsman Republik Indonesia
            </div>
          </div>

          {/* Card 3: Inpres Jalan Daerah */}
          <div className="dashboard-card p-5 rounded-xl border-l-4 border-l-blue-600 dashboard-card-hover">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Inpres Jalan Daerah</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">Rp 14,6 T</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600 leading-snug">
              Alokasi intervensi perbaikan jalan daerah akibat tingginya jalan tidak mantap daerah.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
              Sumber: Inpres No. 3/2023 & Kemen PU
            </div>
          </div>

          {/* Card 4: Alokasi APBD Pilot */}
          <div className="dashboard-card p-5 rounded-xl border-l-4 border-l-emerald-600 dashboard-card-hover">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Pagu APBD Pilot</span>
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">Rp 35,8 M</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600 leading-snug">
              Total alokasi paket tender pemeliharaan berkala terdata di koridor Jawa Barat & Bodetabek.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
              Sumber: LPSE & Open Data Jabar
            </div>
          </div>
        </div>

        {/* 3 Core Identity Pillars in Clean Minimal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                01
              </div>
              <h3 className="font-bold text-sm text-slate-900">Kewenangan Lintas Status Jalan</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mengunci instansi penanggung jawab resmi (Pusat, Provinsi, Kota/Kabupaten) beserta nomor SK regulasi ruas untuk menghentikan praktik saling lempar wewenang.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 rounded-md bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                02
              </div>
              <h3 className="font-bold text-sm text-slate-900">Anggaran Proyek Tertelusur</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Menyandingkan ruas jalan dengan paket pengadaan lelang LPSE, nilai kontrak, nama kontraktor pelaksana, serta indikator tingkat keyakinan pencocokan data.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                03
              </div>
              <h3 className="font-bold text-sm text-slate-900">Jejak Tindak Lanjut & Ombudsman</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Memantau batas waktu tanggapan resmi (14 hari kerja). Jika tidak direspons dinas, warga dapat men-generate draf laporan ke Ombudsman RI secara mandiri.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
