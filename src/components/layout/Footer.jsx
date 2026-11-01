"use client";

import React from "react";

export default function Footer({ onSelectTab }) {
  const handleNav = (tabId) => {
    if (onSelectTab) {
      onSelectTab(tabId);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-slate-100">
          {/* Column 1: Brand & Deskripsi */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/full-logo.png"
                alt="JagaJalan"
                className="h-8 w-auto object-contain cursor-pointer"
                onClick={() => handleNav("beranda")}
              />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-sans max-w-sm">
              Platform transparansi kewenangan jalan, pengawasan anggaran lelang proyek, dan kepastian tindak lanjut pengaduan publik berbasis data geospasial resmi.
            </p>
            <p className="text-[11px] text-slate-400 font-sans">
              Sesuai amanat UU KIP No. 14/2008 & UU Pelayanan Publik No. 25/2009.
            </p>
          </div>

          {/* Column 2: Modul & Navigasi */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-semibold text-slate-900 text-xs tracking-wider uppercase">
              Modul & Navigasi
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleNav("beranda")}
                  className="text-slate-600 hover:text-orange-600 transition-colors cursor-pointer text-left"
                >
                  Ringkasan Krisis & Metrik
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("peta")}
                  className="text-slate-600 hover:text-orange-600 transition-colors cursor-pointer text-left"
                >
                  Peta Transparansi Geospasial
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("data-anggaran")}
                  className="text-slate-600 hover:text-orange-600 transition-colors cursor-pointer text-left"
                >
                  Anggaran Proyek & Audit LPSE
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("ombudsman")}
                  className="text-slate-600 hover:text-orange-600 transition-colors cursor-pointer text-left"
                >
                  Lacak Laporan & Draf Ombudsman
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("nasional")}
                  className="text-slate-600 hover:text-orange-600 transition-colors cursor-pointer text-left"
                >
                  Statistik Kemantapan 38 Provinsi
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Sumber Data Resmi */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-semibold text-slate-900 text-xs tracking-wider uppercase">
              Sumber Data Resmi
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://data.pu.go.id"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-orange-600 transition-colors block"
                >
                  Satu Data Kementerian PU
                </a>
              </li>
              <li>
                <a
                  href="https://sirusa.bps.go.id"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-orange-600 transition-colors block"
                >
                  BPS SIRUSA (Statistik Jalan)
                </a>
              </li>
              <li>
                <a
                  href="https://ombudsman.go.id"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-orange-600 transition-colors block"
                >
                  Ombudsman Republik Indonesia
                </a>
              </li>
              <li>
                <a
                  href="https://inaproc.id"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-orange-600 transition-colors block"
                >
                  LKPP LPSE & Inaproc
                </a>
              </li>
              <li>
                <a
                  href="https://opendata.jabarprov.go.id"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-orange-600 transition-colors block"
                >
                  Open Data Daerah (APBD)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Regulasi */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-semibold text-slate-900 text-xs tracking-wider uppercase">
              Regulasi
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <div className="font-medium text-slate-800">UU No. 2 Tahun 2022</div>
                <div className="text-[11px] text-slate-400">Perubahan Kedua UU Jalan</div>
              </li>
              <li>
                <div className="font-medium text-slate-800">Inpres No. 3 / 2023</div>
                <div className="text-[11px] text-slate-400">Percepatan Jalan Daerah (IJD)</div>
              </li>
              <li>
                <div className="font-medium text-slate-800">Pasal 24 UU LLAJ</div>
                <div className="text-[11px] text-slate-400">Kewajiban Penyelenggara</div>
              </li>
            </ul>
          </div>
        </div>

        {/* SLA Pelayanan Publik (Clean & simple, no icons) */}
        <div className="py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs text-slate-500 font-sans">
          <span className="font-medium text-slate-700">Standar Tenggat Pelayanan Publik (SLA):</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600 text-[11px]">
            <span>Jalan Nasional: <strong>≤ 24 Jam Darurat</strong></span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span>Jalan Provinsi: <strong>≤ 48 Jam Verifikasi</strong></span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span>Jalan Kab/Kota: <strong>≤ 7 Hari Tindak Lanjut</strong></span>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 font-sans">
          <p>© 2026 JagaJalan Platform. Hak Cipta Terbuka di Bawah Lisensi MIT.</p>
          <p className="text-[11px]">Inisiatif Keterbukaan Informasi & Pengawasan Partisipatif Publik</p>
        </div>
      </div>
    </footer>
  );
}
