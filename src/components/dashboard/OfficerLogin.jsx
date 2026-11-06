"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  HardHat,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  UserCheck,
} from "lucide-react";
import { OFFICIAL_OFFICERS, authenticateOfficer } from "@/data/officersData";

export default function OfficerLogin({ onLoginSuccess, onBackToPublic }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateOfficer(identifier, password);
      setIsLoading(false);
      if (result.success) {
        onLoginSuccess(result.officer);
      } else {
        setErrorMessage(result.message);
      }
    }, 400);
  };

  const handleQuickLogin = (officer) => {
    setIdentifier(officer.nip);
    setPassword("jagajalan2026");
    setIsLoading(true);
    setErrorMessage("");

    setTimeout(() => {
      const result = authenticateOfficer(officer.nip, "jagajalan2026");
      setIsLoading(false);
      if (result.success) {
        onLoginSuccess(result.officer);
      }
    }, 300);
  };

  return (
    <section className="py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6 animate-fade-in text-slate-800 font-sans">
      {/* Back Link */}
      <div className="mb-4">
        <button
          onClick={onBackToPublic}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Publik (Warga)</span>
        </button>
      </div>

      {/* Main Login Card (Double-Bezel Architecture) */}
      <div className="rounded-[1.75rem] bg-slate-100/70 p-2 sm:p-2.5 ring-1 ring-orange-200/50">
        <div className="bg-white rounded-[1.25rem] shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] overflow-hidden">
          {/* Institutional Header Banner */}
          <div className="bg-white p-6 sm:p-7 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50/80 p-2.5 shrink-0 flex items-center justify-center ring-1 ring-orange-200/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icon/profile.png"
                    alt="Akses Petugas"
                    width={36}
                    height={36}
                    style={{ width: "36px", height: "36px" }}
                    className="w-9 h-9 object-contain"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans tracking-wider uppercase bg-orange-50 text-orange-900 ring-1 ring-orange-200/60">
                    <HardHat className="w-3.5 h-3.5 text-[#c2410c]" />
                    <span>Prototipe Portal Dinas • Simulasi Kewenangan Penyelenggara</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-slate-900">
                    Portal Kerja Penyelenggara Jalan
                  </h1>
                  <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                    Modul prototipe untuk mendemonstrasikan alur verifikasi lapangan, pembaruan status penanganan, dan dokumentasi foto pengerjaan sesuai tingkat kewenangan instansi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Body: Split Form & 1-Click Simulation */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50/80 ring-1 ring-rose-200/70 text-rose-800 text-xs flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left 6 Cols: Manual Form */}
              <form onSubmit={handleSubmit} className="lg:col-span-6 space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
                    Masuk Manual (NIP / Email ASN)
                  </h2>
                </div>

                {/* NIP / Email Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    NIP Pegawai / Email Instansi (.go.id)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Contoh: 198503152010121002"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all font-sans tabular-nums ring-1 ring-slate-200/70 focus:ring-orange-500/30"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block">
                      Kata Sandi Keamanan
                    </label>
                    <span className="text-[10px] text-slate-400 font-sans">Default: jagajalan2026</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all font-sans ring-1 ring-slate-200/70 focus:ring-orange-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Security Hint */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 ring-1 ring-orange-200/40 text-[11px] text-slate-600 flex items-start gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-[#c2410c] shrink-0 mt-0.5" />
                  <span>
                    Sistem diawasi secara digital. Setiap riwayat disposisi status dan unggahan bukti fisik akan tercatat pada <em>Audit Trail</em> berbasis NIP.
                  </span>
                </div>

                {/* Submit Button (Button-in-Button) */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 pl-4 pr-2 py-2.5 rounded-full text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] disabled:opacity-60 shadow-sm transition-all cursor-pointer active:scale-[0.99] font-sans"
                >
                  {isLoading ? (
                    <span>Memverifikasi NIP...</span>
                  ) : (
                    <>
                      <span>Masuk ke Panel Kerja Petugas</span>
                      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <ArrowRight className="w-3 h-3 text-white" />
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Right 6 Cols: 1-Click Simulation Cards for Evaluator/Judges */}
              <div className="lg:col-span-6 space-y-3.5 bg-slate-50/80 p-4 sm:p-5 rounded-2xl ring-1 ring-orange-200/40">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#c2410c]" />
                    <span className="text-xs font-bold text-slate-900 uppercase font-sans tracking-wide">
                      Simulasi Cepat (1-Klik Akun Instansi)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-100/70 text-[#9a3412]">
                    Demo Evaluasi
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Pilih profil dinas di bawah ini untuk langsung masuk dan menguji simulasi alur kerja verifikasi lapangan sesuai tingkatan wewenang:
                </p>

                <div className="space-y-2">
                  {OFFICIAL_OFFICERS.map((officer) => (
                    <div
                      key={officer.id}
                      onClick={() => handleQuickLogin(officer)}
                      className="p-3 rounded-xl bg-white ring-1 ring-orange-200/40 hover:ring-orange-300 hover:shadow-2xs transition-all cursor-pointer group flex items-start justify-between gap-3 font-sans"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 font-sans font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-[#c2410c] group-hover:text-white transition-colors">
                          {officer.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-xs text-slate-900 group-hover:text-[#c2410c] transition-colors">
                              {officer.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                              {officer.authorityLevel}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{officer.title}</p>
                          <p className="text-[10px] text-slate-400 font-sans tabular-nums mt-0.5">NIP: {officer.nip}</p>
                        </div>
                      </div>

                      <div className="text-[11px] text-[#c2410c] font-bold group-hover:translate-x-0.5 transition-transform shrink-0 pt-1">
                        <span>Masuk →</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-200/60 flex items-center gap-1.5 font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Setiap akun memiliki cakupan wilayah yurisdiksi yang berbeda.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Disclaimer Footer */}
          <div className="bg-slate-50/80 px-6 py-3.5 border-t border-slate-100 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              Landasan Hukum: <strong>UU No. 5/2014 (ASN)</strong> • <strong>UU No. 25/2009 (Pelayanan Publik)</strong>
            </span>
            <span className="font-sans text-slate-400">JagaJalan InfrasTrace • Keamanan Terenkripsi</span>
          </div>
        </div>
      </div>
    </section>
  );
}
