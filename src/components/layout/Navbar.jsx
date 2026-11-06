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
    <header className="sticky top-0 z-50 pt-3 pb-2 px-4 sm:px-6 lg:px-8 pointer-events-none">
      <div className="w-full max-w-4xl mx-auto pointer-events-auto">
        {/* Floating Pill / Capsule Island Navbar (Taste Skill Reference) */}
        <div className="flex items-center justify-between h-13 px-4 sm:px-5 rounded-full bg-white/95 backdrop-blur-md border border-[#E6DFD5] ring-1 ring-orange-200/40 shadow-[0_6px_28px_-6px_rgba(28,25,23,0.08)]">
          {/* Left: Logo & Brand Identity */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none shrink-0 group"
            onClick={() => handleTabClick("beranda")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/logo.png"
              alt="Logo JagaJalan"
              width={26}
              height={26}
              style={{ width: "26px", height: "26px", maxWidth: "26px", maxHeight: "26px" }}
              className="w-[26px] h-[26px] object-contain shrink-0"
            />
            <span className="font-heading font-bold text-[15px] tracking-[-0.03em] text-[#1C1917]">
              JagaJalan
            </span>
          </div>

          {/* Center: Clean Editorial Nav Links with Bottom Underline Indicator */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 h-full">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative py-1.5 text-[13px] tracking-[-0.015em] whitespace-nowrap transition-colors cursor-pointer select-none ${
                    isActive
                      ? "text-[#1C1917] font-semibold"
                      : "text-[#68635D] hover:text-[#1C1917] font-medium"
                  }`}
                >
                  <span>{item.label}</span>

                  {/* Crisp underline matching Taste Skill reference */}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-[1.75px] bg-[#c2410c] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Compact Pill CTA Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenReportModal}
              className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap font-sans"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon/plus_icon.png"
                alt=""
                width={12}
                height={12}
                style={{ width: "12px", height: "12px" }}
                className="w-3 h-3 object-contain invert brightness-0"
              />
              <span>Lapor Kerusakan</span>
            </button>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-full text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2ECE4] transition-colors cursor-pointer"
                aria-label="Buka Menu"
              >
                {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Floating Card below the Capsule) */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 p-2 rounded-[6px] border border-[#E6DFD5] ring-1 ring-orange-200/50 space-y-1 text-xs animate-fade-in bg-white shadow-xl">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-[6px] font-medium flex items-center gap-3 transition-colors ${
                    isActive
                      ? "bg-[#c2410c] text-white font-semibold"
                      : "text-[#1C1917] hover:bg-[#FAF8F5]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.icon}
                    alt=""
                    width={18}
                    height={18}
                    style={{ width: "18px", height: "18px" }}
                    className={`w-4.5 h-4.5 object-contain shrink-0 ${isActive ? "invert brightness-0" : ""}`}
                  />
                  <span className="flex-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
