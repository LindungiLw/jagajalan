"use client";

import React, { useState } from "react";
import {
  Menu,
  X,
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

          {/* Right Action Area: Primary Citizen Action (High-End Button-in-Button) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenReportModal}
              className="group inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full text-xs font-semibold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap font-sans"
            >
              <span>Laporkan Kerusakan</span>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icon/plus_icon.png"
                  alt=""
                  width={14}
                  height={14}
                  style={{ width: "14px", height: "14px" }}
                  className="w-3.5 h-3.5 object-contain invert brightness-0"
                />
              </span>
            </button>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-[6px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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
                  className={`w-full text-left px-3 py-2.5 rounded-[6px] font-medium flex items-center gap-3 transition-colors ${
                    isActive
                      ? "bg-[#c2410c] text-white font-semibold"
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
                    className={`w-5 h-5 object-contain shrink-0 ${isActive ? "invert brightness-0" : ""}`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
