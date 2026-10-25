"use client";

import React from "react";
import { Shield, ExternalLink, Award, Database, Scale } from "lucide-react";

export default function Footer({ onSelectTab }) {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/full-logo.png"
                alt="JagaJalan - Jalan Terpantau, Publik Terberdaya"
                className="h-9 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md">
              Platform Transparansi Kewenangan, Keterbukaan Anggaran APBD, & Akselerasi Penanganan Jalan Publik. 
              Mengintegrasikan data geospasial terbuka, laporan partisipatif warga, verifikasi citra AI, dan kepatuhan hukum Ombudsman RI.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 font-medium">
              <Shield className="w-3.5 h-3.5 text-orange-600" />
              <span>Inisiatif Keterbukaan Informasi & Pengawasan Partisipatif Publik</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Fitur Platform</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectTab("beranda")} className="hover:text-orange-600 transition-colors">
                  Ringkasan Krisis & Metrik
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab("peta")} className="hover:text-orange-600 transition-colors">
                  Peta Transparansi Geospasial
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab("data-anggaran")} className="hover:text-orange-600 transition-colors">
                  Keterbukaan Anggaran & LPSE
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab("nasional")} className="hover:text-orange-600 transition-colors">
                  Peringkat 38 Provinsi (BPS)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab("ombudsman")} className="hover:text-orange-600 transition-colors">
                  Kawal SLA & Draf Ombudsman
                </button>
              </li>
              <li>
                <a href="/admin" className="hover:text-orange-600 transition-colors text-slate-400 text-[11px]">
                  Akses Petugas (/admin)
                </a>
              </li>
            </ul>
          </div>

          {/* Open Data Sources */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Sumber Data Resmi</h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <Database className="w-3.5 h-3.5 text-orange-600" />
                <a href="https://data.pu.go.id" target="_blank" rel="noreferrer" className="flex items-center gap-1">
                  Satu Data Kementerian PU <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <Database className="w-3.5 h-3.5 text-slate-600" />
                <a href="https://www.bps.go.id" target="_blank" rel="noreferrer" className="flex items-center gap-1">
                  Badan Pusat Statistik (BPS) <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <Scale className="w-3.5 h-3.5 text-rose-600" />
                <a href="https://ombudsman.go.id" target="_blank" rel="noreferrer" className="flex items-center gap-1">
                  Laporan Tahunan Ombudsman RI <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <a href="https://opendata.jabarprov.go.id" target="_blank" rel="noreferrer" className="flex items-center gap-1">
                  Open Data Jawa Barat (APBD) <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <p>© 2026 JagaJalan Platform. Hak Cipta Terbuka di Bawah Lisensi MIT.</p>
          <p>Portal Transparansi Geospasial Kewenangan & Anggaran Infrastruktur Jalan</p>
        </div>
      </div>
    </footer>
  );
}
