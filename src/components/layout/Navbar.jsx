"use client";

import React, { useState } from "react";
import {
  Menu,
  X,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "beranda", label: "Ringkasan", icon: "/icon/jalan.png" },
  { id: "peta", label: "Peta Transparansi", icon: "/icon/maps.png" },
  { id: "data-anggaran", label: "Anggaran Proyek", icon: "/icon/financial.png" },
  { id: "ombudsman", label: "Lacak Laporan", icon: "/icon/report.png" },
  { id: "nasional", label: "Statistik", icon: "/icon/statistik_icon.png" },
];

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  officerSession,
  onLogoutOfficer,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group"
            onClick={() => handleTabClick("beranda")}
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
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/logo-name.png"
                alt="JagaJalan"
                height={20}
                style={{ height: "20px", width: "auto", maxHeight: "20px" }}
                className="h-5 w-auto object-contain object-left block"
              />
              <span className="hidden xl:inline-block text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/80">
                v2.6 Civic Audit
              </span>
            </div>
          </div>

          {/* Desktop Nav Tabs with Dedicated Civic Icons */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 h-full">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`group relative h-15 flex items-center gap-2 px-3 xl:px-3.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer select-none ${
                    isActive
                      ? "text-slate-950 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.icon}
                    alt=""
                    width={18}
                    height={18}
                    style={{ width: "18px", height: "18px" }}
                    className="w-4.5 h-4.5 object-contain shrink-0"
                  />
                  <span>{item.label}</span>

                  {/* Clean bottom active indicator pinned flush to border */}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-2.5 h-[2px] bg-[#c2410c]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Area: Officer Portal & Primary Citizen Action */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Portal Dinas Quick Switch */}
            <button
              onClick={() => handleTabClick("dinas")}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                activeTab === "dinas"
                  ? "bg-slate-900 text-white border-slate-900"
                  : officerSession
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
              title="Portal Verifikasi Penyelenggara Jalan"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon/profile.png"
                alt=""
                width={16}
                height={16}
                style={{ width: "16px", height: "16px" }}
                className="w-4 h-4 object-contain shrink-0"
              />
              <span>{officerSession ? officerSession.name.split(" ")[0] : "Portal Dinas"}</span>
            </button>

            {officerSession && (
              <button
                onClick={onLogoutOfficer}
                className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                title="Keluar Sesi Petugas"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Primary Citizen Action: Solid Institutional Safety Orange */}
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#c2410c] hover:bg-[#9a3412] border border-[#9a3412]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-colors cursor-pointer whitespace-nowrap active:translate-y-px"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon/plus_icon.png"
                alt=""
                width={16}
                height={16}
                style={{ width: "16px", height: "16px" }}
                className="w-4 h-4 object-contain shrink-0"
              />
              <span>Laporkan Kerusakan</span>
            </button>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Buka Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-2.5 px-1 border-t border-slate-200/80 space-y-1 text-xs animate-fade-in bg-white">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg font-medium flex items-center gap-3 transition-colors ${
                    isActive
                      ? "bg-orange-50/80 text-[#9a3412] font-semibold border border-orange-200/80"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.icon}
                    alt=""
                    width={20}
                    height={20}
                    style={{ width: "20px", height: "20px" }}
                    className="w-5 h-5 object-contain shrink-0"
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]" />}
                </button>
              );
            })}
            <button
              onClick={() => handleTabClick("dinas")}
              className={`w-full text-left px-3 py-2.5 rounded-lg font-medium flex items-center gap-3 transition-colors ${
                activeTab === "dinas"
                  ? "bg-slate-900 text-white font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon/profile.png"
                alt=""
                width={20}
                height={20}
                style={{ width: "20px", height: "20px" }}
                className="w-5 h-5 object-contain shrink-0"
              />
              <span className="flex-1">
                {officerSession ? `Portal Dinas (${officerSession.name})` : "Portal Kerja Dinas"}
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
