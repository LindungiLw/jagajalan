"use client";

import React, { useState } from "react";
import { MapPin, BarChart3, FileText, Plus, Menu, X } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, onOpenReportModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setActiveTab("beranda")}
          >
            <img
              src="/logo/logo.png"
              alt="Logo JagaJalan"
              className="w-9 h-9 object-contain shrink-0"
            />
            <div className="flex flex-col justify-center items-start">
              <img
                src="/logo/logo-name.png"
                alt="JagaJalan"
                className="h-[21px] w-auto object-contain object-left block"
              />
              <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-tight">
                Kewenangan Jalan • Anggaran Proyek • Jejak Tindak Lanjut
              </p>
            </div>
          </div>

          {/* Desktop Segmented Tab Navigation */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-medium">
            <button
              onClick={() => setActiveTab("beranda")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "beranda"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Ringkasan Krisis
            </button>
            <button
              onClick={() => setActiveTab("peta")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "peta"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              Peta Transparansi
            </button>
            <button
              onClick={() => setActiveTab("nasional")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "nasional"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              38 Provinsi (BPS)
            </button>
            <button
              onClick={() => setActiveTab("ombudsman")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "ombudsman"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              Draf Ombudsman (SLA)
            </button>
          </div>

          {/* Primary Action Button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Lapor Kerusakan</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 px-1 border-t border-slate-200 space-y-1 text-xs">
            <button
              onClick={() => {
                setActiveTab("beranda");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
            >
              Ringkasan Krisis
            </button>
            <button
              onClick={() => {
                setActiveTab("peta");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              Peta Transparansi
            </button>
            <button
              onClick={() => {
                setActiveTab("nasional");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-2"
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              Peringkat 38 Provinsi
            </button>
            <button
              onClick={() => {
                setActiveTab("ombudsman");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              Kawal SLA & Ombudsman
            </button>
            <div className="pt-2">
              <button
                onClick={() => {
                  onOpenReportModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Lapor Kerusakan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
