"use client";

import React, { useState } from "react";
import { Plus, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { id: "beranda", label: "Ringkasan" },
  { id: "peta", label: "Peta Transparansi" },
  { id: "data-anggaran", label: "Data & Anggaran" },
  { id: "ombudsman", label: "Pantau Laporan" },
  { id: "nasional", label: "Statistik" },
  { id: "dinas", label: "Portal Dinas", badge: "Petugas" },
];

export default function Navbar({ activeTab, setActiveTab, onOpenReportModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
            onClick={() => setActiveTab("beranda")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/logo.png"
              alt="Logo JagaJalan"
              className="w-8 h-8 object-contain shrink-0"
            />
            <div className="flex flex-col justify-center items-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/logo-name.png"
                alt="JagaJalan"
                className="h-[19px] w-auto object-contain object-left block"
              />
              <p className="text-[10px] text-slate-500 font-normal leading-tight hidden xl:block">
                Kewenangan Jalan • Anggaran Proyek • Jejak Tindak Lanjut
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs (Pure Clean Text, No Icons, No Wrap) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 h-full">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative h-16 flex items-center px-3 xl:px-3.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer select-none ${
                    isActive
                      ? "text-orange-600 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/70"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded-[5px] text-[9px] font-bold uppercase tracking-wider ${
                          isActive
                            ? "bg-orange-100 text-orange-800 border border-orange-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </span>

                  {/* Clean bottom active indicator pinned flush to border */}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-2.5 h-[2.5px] bg-[#c2410c] rounded-t-[3px] shadow-xs" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Primary Action Button (Right) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[5px] text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Laporkan Kerusakan</span>
            </button>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-[5px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Buka Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 px-1 border-t border-slate-200/80 space-y-1 text-xs animate-fade-in bg-white">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-[5px] font-medium flex items-center justify-between transition-colors ${
                    isActive
                      ? "bg-orange-50 text-orange-800 font-bold border border-orange-200"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-[5px] text-[9px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
