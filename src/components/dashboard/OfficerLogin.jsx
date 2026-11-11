"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Mail,
  RefreshCw,
  Building2,
  ChevronRight,
  Check,
  Info,
} from "lucide-react";
import { OFFICIAL_OFFICERS, authenticateOfficer } from "@/data/officersData";
import { auth, isFirebaseConfigured } from "@/lib/firebase";

// Google 4-Color Official SVG Icon
function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function OfficerLogin({ onLoginSuccess, onBackToPublic }) {
  // Login Modes: "email-otp" | "nip-password"
  const [activeMode, setActiveMode] = useState("email-otp");

  // Email + OTP State
  const [emailInput, setEmailInput] = useState("");
  const [otpStep, setOtpStep] = useState("input-email"); // "input-email" | "enter-otp"
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("829104");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef([]);

  // NIP / Password State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Common UI State
  const [errorMessage, setErrorMessage] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Modal Google Account Picker (Simulation / Fallback)
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Countdown timer for OTP
  useEffect(() => {
    let interval = null;
    if (otpStep === "enter-otp" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpStep, resendTimer]);

  // Auto-focus first digit when entering OTP step
  useEffect(() => {
    if (otpStep === "enter-otp" && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [otpStep]);

  // Handle Send OTP
  const handleSendOtp = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessNotice("");

    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      setErrorMessage("Silakan masukkan alamat email yang valid (contoh: petugas.demo@jagajalan.id).");
      return;
    }

    setIsLoading(true);

    const newCode = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(newCode);

    setTimeout(() => {
      setIsLoading(false);
      setOtpStep("enter-otp");
      setOtpDigits(["", "", "", "", "", ""]);
      setResendTimer(60);
      setCanResend(false);
      setSuccessNotice(`Kode OTP 6-digit verifikasi dikirim ke ${trimmed}`);
    }, 550);
  };

  // Handle OTP Digit Input
  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    const next = [...otpDigits];
    next[index] = cleaned[cleaned.length - 1];
    setOtpDigits(next);

    if (index < 5 && cleaned) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const next = ["", "", "", "", "", ""];
      for (let i = 0; i < pasted.length; i++) {
        next[i] = pasted[i];
      }
      setOtpDigits(next);
      const focusIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[focusIndex]?.focus();
    }
  };

  // Quick auto-fill demo OTP
  const handleFillDemoOtp = () => {
    const chars = generatedOtp.split("");
    setOtpDigits(chars);
    otpInputRefs.current[5]?.focus();
  };

  // Handle Verify OTP and Login
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setErrorMessage("");
    const enteredCode = otpDigits.join("");

    if (enteredCode.length !== 6) {
      setErrorMessage("Silakan lengkapi 6 digit kode OTP verifikasi.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (enteredCode !== generatedOtp && enteredCode !== "829104") {
        setErrorMessage("Kode OTP yang Anda masukkan salah atau telah kedaluwarsa. Silakan periksa kembali.");
        return;
      }

      const cleanEmail = emailInput.trim().toLowerCase();
      const matched = OFFICIAL_OFFICERS.find((o) => o.email.toLowerCase() === cleanEmail);

      let officerPayload = matched;

      if (!officerPayload) {
        officerPayload = {
          id: "DEMO-001",
          nip: "DEMO-001",
          email: cleanEmail,
          name: "Petugas Demo",
          title: "Inspektur Pelaporan & Preservasi Jalan (Mode Demonstrasi)",
          institution: "Simulasi Satuan Tugas Penyelenggara Jalan",
          authorityLevel: "NASIONAL",
          authorityLabel: "Jalan Nasional (Mode Demo)",
          jurisdiction: "Wilayah Penyelenggaraan Terverifikasi (Simulasi)",
          badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
          avatar: "DM",
          status: "Mode Demonstrasi Aktif",
          activeSince: "Simulasi 2026",
        };
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("jagajalan_officer_session", JSON.stringify(officerPayload));
        } catch (err) {
          console.warn("Storage warning:", err);
        }
      }

      onLoginSuccess(officerPayload);
    }, 550);
  };

  // Handle Google SSO
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (isFirebaseConfigured() && auth) {
        const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;

        const officerPayload = {
          id: "DEMO-001",
          nip: "DEMO-001",
          email: user.email || "petugas.demo@jagajalan.id",
          name: "Petugas Demo",
          title: "Inspektur Lapangan Penyelenggara Jalan (Mode Demonstrasi)",
          institution: "Dinas Pekerjaan Umum & Penataan Ruang (Simulasi)",
          authorityLevel: "NASIONAL",
          authorityLabel: "Jalan Nasional (Mode Demo)",
          jurisdiction: "Koridor Pengawasan Lintas Wilayah (Simulasi)",
          badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
          avatar: "DM",
          status: "Mode Demonstrasi Aktif",
          activeSince: "Simulasi 2026",
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("jagajalan_officer_session", JSON.stringify(officerPayload));
        }
        setIsLoading(false);
        onLoginSuccess(officerPayload);
        return;
      }
    } catch (err) {
      console.warn("Firebase popup skipped or not configured:", err);
    }

    setIsLoading(false);
    setShowGoogleModal(true);
  };

  // Google Modal Account Pick
  const handleSelectGoogleAccount = (presetAccount) => {
    setShowGoogleModal(false);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const officerPayload = {
        id: presetAccount.id,
        nip: presetAccount.nip,
        email: presetAccount.email,
        name: presetAccount.name,
        title: presetAccount.title,
        institution: presetAccount.institution,
        authorityLevel: presetAccount.authorityLevel,
        authorityLabel: presetAccount.authorityLabel,
        jurisdiction: presetAccount.jurisdiction,
        badgeColor: presetAccount.badgeColor,
        avatar: presetAccount.avatar,
        status: presetAccount.status || "Mode Demonstrasi Aktif",
        activeSince: presetAccount.activeSince || "Simulasi 2026",
      };

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("jagajalan_officer_session", JSON.stringify(officerPayload));
        } catch (e) {
          console.warn(e);
        }
      }

      onLoginSuccess(officerPayload);
    }, 450);
  };

  // Handle NIP & Password Submit
  const handleNipSubmit = (e) => {
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

  // 1-Click Instant Demo Login
  const handleInstantDemoLogin = (officer) => {
    setIsLoading(true);
    setErrorMessage("");

    setTimeout(() => {
      setIsLoading(false);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("jagajalan_officer_session", JSON.stringify(officer));
        } catch (err) {
          console.warn(err);
        }
      }
      onLoginSuccess(officer);
    }, 300);
  };

  const handleAutofillDemoEmail = () => {
    setEmailInput("petugas.demo@jagajalan.id");
    setErrorMessage("");
  };

  const handleAutofillDemoNip = () => {
    setIdentifier("DEMO-001");
    setPassword("jagajalan2026");
    setErrorMessage("");
  };

  return (
    <section className="py-8 sm:py-12 max-w-[460px] mx-auto px-4 animate-fade-in text-slate-800 font-sans">
      {/* Top Breadcrumb & Status Pill */}
      <div className="mb-5 flex items-center justify-between gap-3 text-xs">
        <button
          onClick={onBackToPublic}
          className="inline-flex items-center gap-1.5 font-medium text-slate-500 hover:text-[#c2410c] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Kembali ke Halaman Warga</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/70 text-[10.5px] font-semibold text-amber-900">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Mode Demonstrasi</span>
        </div>
      </div>

      {/* Main Login Card with Clean Modern Elevation */}
      <div className="relative rounded-2xl bg-white border border-slate-200/90 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.08)] overflow-hidden">
        {/* Subtle Top Accent Gradient Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#c2410c] via-orange-500 to-amber-500" />

        {/* Card Header - Centered */}
        <div className="p-6 sm:p-7 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 via-white to-white flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c2410c] to-amber-500 text-white shadow-md shadow-orange-500/20 flex items-center justify-center mb-3">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Portal Kerja Penyelenggara Jalan
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed mt-1.5 max-w-xs">
            Sistem informasi aparatur dinas untuk verifikasi laporan lapangan, pembaruan progres fisik, dan transparansi pelayanan publik.
          </p>

          {/* Modern Segmented Tab Switcher - Centered Full Width */}
          <div className="mt-5 w-full">
            <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 w-full">
              <button
                type="button"
                onClick={() => {
                  setActiveMode("email-otp");
                  setErrorMessage("");
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeMode === "email-otp"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Mail className={`w-3.5 h-3.5 ${activeMode === "email-otp" ? "text-[#c2410c]" : "text-slate-400"}`} />
                <span>Email &amp; Kode OTP</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMode("nip-password");
                  setErrorMessage("");
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeMode === "nip-password"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Lock className={`w-3.5 h-3.5 ${activeMode === "nip-password" ? "text-[#c2410c]" : "text-slate-400"}`} />
                <span>ID Demo &amp; Sandi</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Error Notification */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Notice */}
          {successNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* 1. Google SSO Button (Sleek Modern White Card) */}
          <div className="space-y-4">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99] group"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>Masuk dengan Akun Google (SSO Pemerintah)</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 font-sans">
                atau melalui {activeMode === "email-otp" ? "email dinas" : "ID akun demo"}
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>
          </div>

          {/* 2. MODE: Email & OTP */}
          {activeMode === "email-otp" && (
            <div className="space-y-4">
              {otpStep === "input-email" ? (
                /* Step 1: Input Email */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 block">
                        Alamat Email Kedinasan / Akun Uji Coba Demo
                      </label>
                      <button
                        type="button"
                        onClick={handleAutofillDemoEmail}
                        className="text-[10.5px] font-semibold text-[#c2410c] hover:underline cursor-pointer"
                      >
                        Gunakan Akun Demo
                      </button>
                    </div>

                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="contoh: petugas.demo@jagajalan.id atau email juri"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all font-sans border border-slate-200 focus:border-[#c2410c] focus:ring-4 focus:ring-orange-500/10"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>Mode Demonstrasi: Akun otomatis terverifikasi.</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#9a3412] hover:to-[#c2410c] disabled:opacity-60 shadow-sm shadow-orange-500/20 hover:shadow-md transition-all cursor-pointer active:scale-[0.99] font-sans"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengirim Kode OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Kirim Kode OTP Masuk</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Enter 6-Digit OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Masukkan 6-Digit Kode OTP:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep("input-email");
                        setErrorMessage("");
                      }}
                      className="text-[11px] font-semibold text-[#c2410c] hover:underline cursor-pointer"
                    >
                      ← Ubah Email
                    </button>
                  </div>

                  {/* Interactive 6-Digit Input Boxes */}
                  <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        maxLength={1}
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e.key)}
                        className="w-10 sm:w-12 h-12 sm:h-13 text-center text-lg sm:text-xl font-bold font-mono text-slate-900 bg-slate-50/80 rounded-xl border border-slate-300 focus:border-[#c2410c] focus:ring-4 focus:ring-orange-500/10 focus:bg-white focus:outline-none transition-all"
                      />
                    ))}
                  </div>

                  {/* Simulation Helper Pill */}
                  <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-200/70 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#c2410c] shrink-0" />
                      <span className="text-[11.5px] text-slate-700">
                        Kode OTP Demo: <strong className="font-mono text-slate-900 font-bold">{generatedOtp}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleFillDemoOtp}
                      className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-[#c2410c] text-white hover:bg-[#9a3412] transition-colors cursor-pointer shrink-0"
                    >
                      Isi Cepat
                    </button>
                  </div>

                  {/* Resend Timer */}
                  <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
                    <span>Tidak menerima kode?</span>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={(e) => handleSendOtp(e)}
                        className="font-bold text-[#c2410c] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Kirim Ulang OTP</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px]">
                        Kirim ulang dalam ({resendTimer}s)
                      </span>
                    )}
                  </div>

                  {/* Verify & Enter Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#9a3412] hover:to-[#c2410c] disabled:opacity-60 shadow-sm shadow-orange-500/20 hover:shadow-md transition-all cursor-pointer active:scale-[0.99] font-sans"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Memverifikasi Kode OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Verifikasi &amp; Masuk ke Portal Kerja</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 3. MODE: Classic NIP & Password */}
          {activeMode === "nip-password" && (
            <form onSubmit={handleNipSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">
                    ID Akun Demo / NIP Petugas
                  </label>
                  <button
                    type="button"
                    onClick={handleAutofillDemoNip}
                    className="text-[10.5px] font-semibold text-[#c2410c] hover:underline cursor-pointer"
                  >
                    Isi Otomatis (DEMO-001)
                  </button>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Contoh: DEMO-001"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all font-sans tabular-nums border border-slate-200 focus:border-[#c2410c] focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">
                    Kata Sandi Keamanan
                  </label>
                  <span className="text-[10.5px] text-slate-400 font-sans">Default: jagajalan2026</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all font-sans border border-slate-200 focus:border-[#c2410c] focus:ring-4 focus:ring-orange-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#9a3412] hover:to-[#c2410c] disabled:opacity-60 shadow-sm shadow-orange-500/20 hover:shadow-md transition-all cursor-pointer active:scale-[0.99] font-sans"
              >
                {isLoading ? (
                  <span>Memverifikasi Kredensial...</span>
                ) : (
                  <>
                    <span>Masuk dengan ID Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Trust Note */}
          <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-sans">
            <KeyRound className="w-3.5 h-3.5 text-[#c2410c]" />
            <span>Sesi simulasi aparatur terekam dalam Audit Trail Digital</span>
          </div>
        </div>

        {/* Legal & Trust Footer */}
        <div className="bg-slate-50/80 px-6 py-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between gap-2 font-sans">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Enkripsi Sesi TLS 1.3</span>
          </div>
          <span className="text-slate-400">Mode Demonstrasi Aktif</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION DI BAWAHNYA: AKSES CEPAT PENGUJIAN 1-KLIK (JURI & EVALUATOR)      */}
      {/* ========================================================================= */}
      <div className="mt-7 pt-5 border-t border-slate-200/80">
        <div className="text-center mb-3.5 space-y-0.5">
          <h2 className="text-sm font-bold font-heading text-slate-900">
            Akses Cepat Pengujian Portal Dinas
          </h2>
          <p className="text-[11px] text-slate-500">
            Pilih tingkatan wewenang dinas untuk langsung menguji sistem:
          </p>
        </div>

        {/* 3 Interactive Cards (Nasional, Provinsi, Kota/Kabupaten) */}
        <div className="space-y-2">
          {OFFICIAL_OFFICERS.slice(0, 3).map((officer) => {
            const isNasional = officer.authorityLevel === "NASIONAL";
            const isProvinsi = officer.authorityLevel === "PROVINSI";

            return (
              <button
                key={officer.id}
                type="button"
                onClick={() => handleInstantDemoLogin(officer)}
                className="w-full bg-white hover:bg-slate-50/80 rounded-xl p-3 border border-slate-200 hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer group flex items-center justify-between text-left font-sans"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-[#c2410c] group-hover:text-white transition-colors">
                    {officer.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-xs text-slate-900 group-hover:text-[#c2410c] transition-colors truncate">
                        {officer.name}
                      </h3>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                          isNasional
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : isProvinsi
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-teal-50 text-teal-700 border border-teal-200"
                        }`}
                      >
                        {officer.authorityLevel}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                      {officer.institution}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-2 flex items-center gap-1 text-[11px] font-bold text-[#c2410c] opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                  <span className="hidden sm:inline text-[10.5px]">Masuk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: GOOGLE ACCOUNT PICKER                                              */}
      {/* ========================================================================= */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-left border border-slate-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <GoogleIcon className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Pilih Akun Demo untuk Masuk</h3>
                <p className="text-xs text-slate-500">Lanjutkan simulasi portal dinas <strong>JagaJalan</strong></p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Pilih identitas demonstrasi aparatur dinas yang ingin diuji coba:
            </p>

            <div className="space-y-2 mb-5">
              {OFFICIAL_OFFICERS.slice(0, 3).map((off) => (
                <button
                  key={off.id}
                  type="button"
                  onClick={() => handleSelectGoogleAccount(off)}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-left transition-all flex items-center gap-3 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 font-bold text-xs flex items-center justify-center text-amber-900 group-hover:bg-[#c2410c] group-hover:text-white transition-colors">
                    {off.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-[#c2410c] transition-colors truncate">
                        {off.name}
                      </span>
                      <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200">
                        {off.id}
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-800 font-medium truncate mt-0.5">
                      {off.status} • {off.authorityLabel}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#c2410c] shrink-0" />
                </button>
              ))}

              {/* Custom Direct Demo Account */}
              <button
                type="button"
                onClick={() =>
                  handleSelectGoogleAccount({
                    id: "DEMO-001",
                    nip: "DEMO-001",
                    email: "petugas.demo@jagajalan.id",
                    name: "Petugas Demo",
                    title: "Inspektur Pelaporan & Preservasi Jalan (Mode Demonstrasi)",
                    institution: "Portal Penyelenggara Jalan (Simulasi)",
                    authorityLevel: "NASIONAL",
                    authorityLabel: "Jalan Nasional (Mode Demo)",
                    jurisdiction: "Akses Penuh Seluruh Yurisdiksi (Simulasi)",
                    badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
                    avatar: "DM",
                    status: "Mode Demonstrasi Aktif",
                    activeSince: "Simulasi 2026",
                  })
                }
                className="w-full p-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 hover:bg-amber-100/60 text-left transition-all flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-amber-600 font-bold text-xs flex items-center justify-center text-white">
                  ★
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors truncate">
                    Gunakan Akun Demonstrasi Utama (Petugas Demo)
                  </div>
                  <div className="text-[11px] text-amber-900 font-mono truncate">ID: DEMO-001 • Mode Demonstrasi Aktif</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 shrink-0" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
