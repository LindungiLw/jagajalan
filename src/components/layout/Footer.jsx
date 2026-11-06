"use client";

import React from "react";
import {
  Globe,
  Database,
  Scale,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function Footer({ onSelectTab }) {
  const handleNav = (tabId) => {
    if (onSelectTab) {
      onSelectTab(tabId);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const navLinks = [
    { label: "Ringkasan Beranda", tab: "beranda" },
    { label: "Peta Geospasial Interaktif", tab: "peta" },
    { label: "Audit Anggaran & LPSE", tab: "data-anggaran" },
    { label: "Pantau SLA Ombudsman", tab: "ombudsman" },
    { label: "Peringkat 38 Provinsi", tab: "nasional" },
  ];

  const dataLinks = [
    { label: "Kementerian PU (Satu Data)", href: "https://data.pu.go.id" },
    { label: "BPS SIRUSA (Statistik Jalan)", href: "https://sirusa.bps.go.id" },
    { label: "LKPP Inaproc & SiRUP", href: "https://inaproc.id" },
    { label: "Ombudsman RI (Laptah)", href: "https://ombudsman.go.id" },
    { label: "Open Data Daerah (APBD)", href: "https://opendata.jabarprov.go.id" },
  ];

  const legalLinks = [
    { label: "UU KIP No. 14 / 2008", subtitle: "Keterbukaan Informasi", tab: "beranda" },
    { label: "UU Pelayanan Publik 25 / 2009", subtitle: "Kepastian Tenggat Waktu", tab: "peta" },
    { label: "UU Ombudsman No. 37 / 2008", subtitle: "Pengawasan Undue Delay", tab: "ombudsman" },
    { label: "Inpres No. 3 / 2023 (IJD)", subtitle: "Intervensi Fiskal APBN", tab: "nasional" },
    { label: "UU Jalan No. 2 / 2022", subtitle: "Wewenang Penyelenggara", tab: "beranda" },
  ];

  return (
    <footer className="relative bg-[#FAF7F2] border-t border-[#E6DFD5] text-slate-600 font-sans mt-16 overflow-hidden">
      {/* Decorative Organic Accent Rings (Circulo-inspired warm geometry) */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 pointer-events-none select-none opacity-40">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-amber-500">
          <circle cx="50" cy="150" r="100" stroke="currentColor" strokeWidth="24" strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute -top-28 -right-28 w-80 h-80 pointer-events-none select-none opacity-25">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-amber-400">
          <circle cx="150" cy="50" r="115" stroke="currentColor" strokeWidth="32" strokeLinecap="round" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-[#E6DFD5]/80">
          
          {/* Column 1: Brand & Mission (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/full-logo.png"
                alt="JagaJalan"
                height={34}
                style={{ height: "34px", width: "auto", maxHeight: "34px" }}
                className="h-8.5 w-auto object-contain cursor-pointer transition-opacity hover:opacity-90"
                onClick={() => handleNav("beranda")}
              />
            </div>
            
            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-sm font-sans">
              Mewujudkan transparansi jalan raya dengan pencocokan geospasial SK wewenang, audit kontrak lelang LPSE, dan penegakan batas waktu pelayanan publik.
            </p>

            {/* Civic & Ecosystem Icon Connectors */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://data.pu.go.id"
                target="_blank"
                rel="noreferrer"
                title="Satu Data Kementerian PU"
                className="w-8 h-8 rounded-full bg-[#EAE4D9]/70 hover:bg-orange-100 hover:text-orange-700 text-slate-700 flex items-center justify-center transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://inaproc.id"
                target="_blank"
                rel="noreferrer"
                title="Portal Pengadaan LKPP Inaproc"
                className="w-8 h-8 rounded-full bg-[#EAE4D9]/70 hover:bg-orange-100 hover:text-orange-700 text-slate-700 flex items-center justify-center transition-colors"
              >
                <Database className="w-4 h-4" />
              </a>
              <a
                href="https://ombudsman.go.id"
                target="_blank"
                rel="noreferrer"
                title="Ombudsman Republik Indonesia"
                className="w-8 h-8 rounded-full bg-[#EAE4D9]/70 hover:bg-orange-100 hover:text-orange-700 text-slate-700 flex items-center justify-center transition-colors"
              >
                <Scale className="w-4 h-4" />
              </a>
              <a
                href="/portaldinas"
                title="Portal Kerja Dinas (Aparatur)"
                className="w-8 h-8 rounded-full bg-[#EAE4D9]/70 hover:bg-orange-100 hover:text-orange-700 text-slate-700 flex items-center justify-center transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                title="Repositori Sumber Terbuka (Open Source)"
                className="w-8 h-8 rounded-full bg-[#EAE4D9]/70 hover:bg-orange-100 hover:text-orange-700 text-slate-700 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Navigasi Modul (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm font-heading tracking-tight">
              Navigasi Modul
            </h4>
            <div className="w-6 h-[2.5px] bg-[#d97706] rounded-full mt-1.5 mb-3" />
            
            <ul className="space-y-2 text-xs sm:text-[13px]">
              {navLinks.map((item) => (
                <li key={item.tab}>
                  <button
                    onClick={() => handleNav(item.tab)}
                    className="group inline-flex items-center gap-1.5 text-slate-600 hover:text-orange-700 transition-colors cursor-pointer text-left py-0.5"
                  >
                    <span>{item.label}</span>
                    <span className="text-slate-400 group-hover:text-orange-600 transition-transform duration-200 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </button>
                </li>
              ))}
              <li className="pt-1.5 border-t border-[#E6DFD5]/60">
                <a
                  href="/portaldinas"
                  className="group inline-flex items-center gap-1.5 text-slate-500 hover:text-orange-700 transition-colors text-xs font-semibold py-0.5"
                >
                  <span>Portal Kerja Dinas (Aparatur)</span>
                  <span className="text-slate-400 group-hover:text-orange-600 transition-transform duration-200 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Sumber Data Terbuka (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm font-heading tracking-tight">
              Data Terbuka
            </h4>
            <div className="w-6 h-[2.5px] bg-[#d97706] rounded-full mt-1.5 mb-3" />
            
            <ul className="space-y-2 text-xs sm:text-[13px]">
              {dataLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1.5 text-slate-600 hover:text-orange-700 transition-colors py-0.5"
                  >
                    <span>{item.label}</span>
                    <span className="text-slate-400 group-hover:text-orange-600 transition-transform duration-200 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Dasar Regulasi (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm font-heading tracking-tight">
              Dasar Regulasi
            </h4>
            <div className="w-6 h-[2.5px] bg-[#d97706] rounded-full mt-1.5 mb-3" />
            
            <ul className="space-y-2.5 text-xs text-slate-600">
              {legalLinks.map((reg) => (
                <li key={reg.label}>
                  <button
                    onClick={() => handleNav(reg.tab)}
                    className="group text-left block cursor-pointer transition-colors hover:text-orange-700 py-0.5"
                  >
                    <div className="font-medium text-slate-900 group-hover:text-orange-700 flex items-center gap-1">
                      <span>{reg.label}</span>
                      <span className="text-slate-400 group-hover:text-orange-600 text-[11px] transition-transform duration-200 group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-sans">
                      {reg.subtitle}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SLA Pelayanan Publik (Clean & editorial row) */}
        <div className="py-4 border-b border-[#E6DFD5]/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs text-slate-500 font-sans">
          <span className="font-medium text-slate-800">Standar Tenggat Pelayanan Publik (SLA):</span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 text-xs">
            <span>Jalan Nasional: <strong className="text-slate-900">&le; 24 Jam Darurat</strong></span>
            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">|</span>
            <span>Jalan Provinsi: <strong className="text-slate-900">&le; 48 Jam Verifikasi</strong></span>
            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">|</span>
            <span>Jalan Kab/Kota: <strong className="text-slate-900">&le; 7 Hari Tindak Lanjut</strong></span>
          </div>
        </div>

        {/* Sub-footer: Copyright & Legal Policies */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-3 font-sans">
          <p className="text-center md:text-left">
            &copy; 2026 JagaJalan. Hak Cipta Terbuka di Bawah Lisensi MIT.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-slate-500 text-xs">
            <button
              onClick={() => handleNav("beranda")}
              className="hover:text-orange-700 transition-colors cursor-pointer"
            >
              Kebijakan Privasi
            </button>
            <span className="text-slate-300" aria-hidden="true">|</span>
            <button
              onClick={() => handleNav("beranda")}
              className="hover:text-orange-700 transition-colors cursor-pointer"
            >
              Ketentuan Layanan
            </button>
            <span className="text-slate-300" aria-hidden="true">|</span>
            <button
              onClick={() => handleNav("data-anggaran")}
              className="hover:text-orange-700 transition-colors cursor-pointer"
            >
              Etika Data Terbuka
            </button>
            <span className="text-slate-300" aria-hidden="true">|</span>
            <button
              onClick={() => handleNav("ombudsman")}
              className="hover:text-orange-700 transition-colors cursor-pointer"
            >
              Aksesibilitas Publik
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
