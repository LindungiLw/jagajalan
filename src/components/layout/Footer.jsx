"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Globe,
  Database,
  Scale,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const DATA_RESOURCES = [
  {
    name: "Kementerian PU",
    role: "SK Ruas & Kewenangan Jalan",
    tag: "Kemen PU RI",
    icon: "/partners/pu.svg",
    href: "https://data.pu.go.id",
  },
  {
    name: "LKPP INAPROC",
    role: "Katalog Tender & Kontrak LPSE",
    tag: "Pengadaan LPSE",
    icon: "/partners/lkpp.svg",
    href: "https://inaproc.id",
  },
  {
    name: "Ombudsman RI",
    role: "Standar Batas Waktu Tanggap SLA",
    tag: "UU 25/2009",
    icon: "/partners/ombudsman.svg",
    href: "https://ombudsman.go.id",
  },
  {
    name: "Satu Data Indonesia",
    role: "Interoperabilitas Geospasial",
    tag: "Portal SDI",
    icon: "/partners/sdi.png",
    href: "https://data.go.id",
  },
  {
    name: "BPS RI (SiRUSA)",
    role: "Statistik Kondisi Kemantapan Jalan",
    tag: "Statistik Jalan",
    icon: "/partners/bps.svg",
    href: "https://sirusa.bps.go.id",
  },
  {
    name: "SIPD Kemendagri",
    role: "Alokasi Pagu Anggaran APBD Pemda",
    tag: "Fiskal Daerah",
    icon: "/partners/kemendagri.svg",
    href: "https://sipd.kemendagri.go.id",
  },
];

// Multi-set repetition (24 items per half, 48 items total) to guarantee full coverage even on 4K/ultra-wide screens without gaps or cutoffs
const MARQUEE_SET = [
  ...DATA_RESOURCES,
  ...DATA_RESOURCES,
  ...DATA_RESOURCES,
  ...DATA_RESOURCES,
];
const ALL_MARQUEE_ITEMS = [...MARQUEE_SET, ...MARQUEE_SET];

export default function Footer({ onSelectTab, activeTab = "beranda" }) {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
    { label: "Peta Lokasi Interaktif", tab: "peta" },
    { label: "Audit Anggaran & LPSE", tab: "data-anggaran" },
    { label: "Pantau SLA Ombudsman", tab: "ombudsman" },
    { label: "Peringkat 38 Provinsi", tab: "nasional" },
  ];

  const dataLinks = [
    { label: "Kementerian PU (Satu Data)", href: "https://data.pu.go.id" },
    { label: "BPS SIRUSA (Statistik Jalan)", href: "https://sirusa.bps.go.id" },
    { label: "LKPP Inaproc & SiRUP", href: "https://inaproc.id" },
    { label: "Ombudsman RI (Laptah)", href: "https://ombudsman.go.id" },
    { label: "Portal Satu Data Indonesia (SDI)", href: "https://data.go.id" },
  ];

  const legalLinks = [
    { label: "UU KIP No. 14 / 2008", subtitle: "Keterbukaan Informasi", tab: "beranda" },
    { label: "UU Pelayanan Publik 25 / 2009", subtitle: "Kepastian Tenggat Waktu", tab: "peta" },
    { label: "UU Ombudsman No. 37 / 2008", subtitle: "Pengawasan Penundaan Penanganan", tab: "ombudsman" },
    { label: "Inpres No. 3 / 2023 (IJD)", subtitle: "Intervensi Fiskal APBN", tab: "nasional" },
    { label: "UU Jalan No. 2 / 2022", subtitle: "Wewenang Penyelenggara", tab: "beranda" },
  ];

  return (
    <footer
      ref={footerRef}
      className="relative bg-transparent text-slate-600 font-sans pt-4 overflow-hidden select-none"
    >
      {/* OPEN DATA SOURCES MARQUEE STRIP */}
      <div className="relative border-y border-[#E6DFD5]/90 bg-white/95 py-3.5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-heading">
              Integrasi Sumber Data Terbuka Resmi RI
            </span>
          </div>
          <span className="text-[10.5px] text-slate-500">
            Pencocokan data pemetaan SK jalan, audit lelang pengadaan, dan kepatuhan regulasi publik
          </span>
        </div>

        {/* Infinite Running Marquee Track */}
        <div className="relative w-full overflow-hidden py-1">
          {/* Gradient Masks on Left & Right to fade in/out smoothly without harsh cutoffs */}
          <div className="absolute left-0 inset-y-0 w-12 sm:w-20 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 inset-y-0 w-12 sm:w-20 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee flex items-center whitespace-nowrap">
            {ALL_MARQUEE_ITEMS.map((item, idx) => (
              <a
                key={`${item.name}-${idx}`}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                title={`${item.name} - ${item.role}`}
                className="group shrink-0 mx-2 px-3 py-2 rounded-[7px] bg-white hover:bg-orange-50/70 border border-[#E6DFD5] hover:border-orange-300 ring-1 ring-slate-100 hover:ring-orange-200/70 shadow-2xs transition-all duration-200 flex items-center gap-2.5 cursor-pointer select-none"
              >
                <div className="w-9 h-9 rounded-[6px] bg-white group-hover:bg-orange-50/50 ring-1 ring-slate-200/80 p-1 flex items-center justify-center shrink-0 shadow-2xs transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.icon}
                    alt={item.name}
                    width={24}
                    height={24}
                    style={{ width: "24px", height: "24px" }}
                    className="w-6 h-6 object-contain shrink-0"
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#c2410c] transition-colors leading-tight">
                      {item.name}
                    </span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 group-hover:bg-orange-100 text-slate-600 group-hover:text-[#c2410c] transition-colors">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    {item.role}
                  </p>
                </div>
                <span className="text-slate-300 group-hover:text-[#c2410c] text-xs transition-colors shrink-0 ml-0.5">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* FOREGROUND CONTENT: Clean, High-Contrast Editorial Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-[#E6DFD5]/80">
          
          {/* Column 1: Brand & Mission (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none group transition-opacity hover:opacity-90 w-fit"
              onClick={() => handleNav("beranda")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/logo.png"
                alt="Logo JagaJalan"
                width={30}
                height={30}
                style={{ width: "30px", height: "30px", maxWidth: "30px", maxHeight: "30px" }}
                className="w-[30px] h-[30px] object-contain shrink-0"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/logo-name.png"
                alt="JagaJalan"
                height={20}
                style={{ height: "20px", width: "auto" }}
                className="h-5 w-auto object-contain shrink-0"
              />
            </div>
            
            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-sm font-sans">
              Mewujudkan transparansi jalan raya dengan pencocokan data pemetaan SK wewenang, audit kontrak lelang LPSE, dan penegakan batas waktu pelayanan publik.
            </p>

            {/* Civic & Ecosystem Icon Connectors */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://data.pu.go.id"
                target="_blank"
                rel="noreferrer"
                title="Satu Data Kementerian PU"
                className="w-8 h-8 rounded-full bg-[#EAE4D9]/70 hover:bg-orange-100 hover:text-orange-700 text-slate-700 flex items-center justify-center transition-colors shadow-2xs"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://inaproc.id"
                target="_blank"
                rel="noreferrer"
                title="Portal Pengadaan LKPP Inaproc"
                className="w-8 h-8 rounded-full bg-[#EAE4D9]/70 hover:bg-orange-100 hover:text-orange-700 text-slate-700 flex items-center justify-center transition-colors shadow-2xs"
              >
                <Database className="w-4 h-4" />
              </a>
              <a
                href="https://ombudsman.go.id"
                target="_blank"
                rel="noreferrer"
                title="Ombudsman Republik Indonesia"
                className="w-8 h-8 rounded-full bg-[#EAE4D9]/70 hover:bg-orange-100 hover:text-orange-700 text-slate-700 flex items-center justify-center transition-colors shadow-2xs"
              >
                <Scale className="w-4 h-4" />
              </a>
              <a
                href="/portaldinas"
                title="Portal Kerja Dinas (Aparatur)"
                className="w-8 h-8 rounded-full bg-[#EAE4D9]/70 hover:bg-orange-100 hover:text-orange-700 text-slate-700 flex items-center justify-center transition-colors shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                title="Repositori Sumber Terbuka (Open Source)"
                className="w-8 h-8 rounded-full bg-[#EAE4D9]/70 hover:bg-orange-100 hover:text-orange-700 text-slate-700 flex items-center justify-center transition-colors shadow-2xs"
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
