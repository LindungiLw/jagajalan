"use client";

import React, { useState } from "react";
import { Plus, Menu, X, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { id: "beranda", label: "Ringkasan", icon: "/icon/jalan.png" },
  { id: "peta", label: "Peta Transparansi", icon: "/icon/maps.png" },
  { id: "data-anggaran", label: "Anggaran Proyek", icon: "/icon/financial.png" },
  { id: "ombudsman", label: "Lacak Laporan", icon: "/icon/report.png" },
  { id: "nasional", label: "Statistik", icon: "/icon/time.png" },
];

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  officerSession,
  onLogoutOfficer,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group"
            onClick={() => setActiveTab("beranda")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/logo.png"
              alt="Logo JagaJalan"
              className="w-8 h-8 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
            />
            <div className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/logo-name.png"
                alt="JagaJalan"
                className="h-[21px] w-auto object-contain object-left block"
              />
            </div>
          </div>

          {/* Desktop Nav Tabs with Custom 3D Icons */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 h-full">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative h-16 flex items-center gap-1.5 px-3 xl:px-3.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer select-none ${
                    isActive
                      ? "text-[#c2410c] font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/70"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.icon}
                    alt=""
                    className={`w-4 h-4 object-contain shrink-0 transition-all duration-200 group-hover:scale-110 ${
                      isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                    }`}
                  />
                  <span>{item.label}</span>

                  {/* Clean bottom active indicator pinned flush to border */}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-2.5 h-[2.5px] bg-[#c2410c] rounded-t-[3px] shadow-xs" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Area: Officer Active Session + Civic Action */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Show Officer Session Pill ONLY if logged in */}
            {officerSession && (
              <div className="hidden md:flex items-center gap-2 bg-orange-50/90 text-orange-950 pl-2 pr-1.5 py-1.5 rounded-xl border border-orange-200/90 shadow-2xs">
                <div
                  id="nav-session-officer"
                  onClick={() => setActiveTab("dinas")}
                  className="flex items-center gap-2 cursor-pointer select-none"
                  title={`Sesi Masuk: ${officerSession.name} (${officerSession.institution})`}
                >
                  <div className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/icon/profile.png"
                      alt="Sesi Petugas"
                      className="w-6 h-6 object-contain rounded-full ring-1 ring-orange-300"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white animate-pulse" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-bold text-slate-900 leading-tight flex items-center gap-1">
                      <span className="max-w-[120px] truncate">{officerSession.name.split(",")[0]}</span>
                      <span className="px-1.5 py-0.2 rounded-md bg-orange-600 text-white text-[9px] font-sans font-bold">
                        {officerSession.authorityLevel}
                      </span>
                    </span>
                    <span className="text-[9px] text-slate-500 font-sans tabular-nums leading-tight">
                      NIP: {officerSession.nip.slice(0, 10)}...
                    </span>
                  </div>
                </div>
                {onLogoutOfficer && (
                  <button
                    onClick={onLogoutOfficer}
                    className="ml-1 p-1 rounded-lg hover:bg-orange-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Keluar (Logout)"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Primary Citizen Action */}
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-sm hover:shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-[0.98] ring-1 ring-orange-500/30"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Laporkan Kerusakan</span>
            </button>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium flex items-center gap-3 transition-colors ${
                    isActive
                      ? "bg-orange-50 text-orange-800 font-bold border border-orange-200"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.icon}
                    alt=""
                    className="w-5 h-5 object-contain shrink-0"
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]" />
                  )}
                </button>
              );
            })}

            {/* Officer Access in Mobile Menu (Only if already logged in) */}
            {officerSession && (
              <div className="pt-2 mt-2 border-t border-slate-100 space-y-1.5">
                <div
                  onClick={() => {
                    setActiveTab("dinas");
                    setMobileMenuOpen(false);
                  }}
                  className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-slate-900 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/icon/profile.png"
                      alt="Petugas"
                      className="w-8 h-8 object-contain rounded-full ring-1 ring-orange-300"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{officerSession.name}</div>
                      <div className="text-[10px] text-slate-500 font-sans tabular-nums">NIP: {officerSession.nip}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-orange-700 font-bold">Panel →</span>
                </div>
                {onLogoutOfficer && (
                  <button
                    onClick={() => {
                      onLogoutOfficer();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 rounded-xl cursor-pointer"
                  >
                    Keluar dari Sesi Petugas
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
