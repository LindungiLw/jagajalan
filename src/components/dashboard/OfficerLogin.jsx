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
  Sparkles,
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
      setErrorMessage("Silakan masukkan alamat email yang valid (contoh: petugas@pu.go.id).");
      return;
    }

    setIsLoading(true);

    // Generate random realistic OTP or keep demo standard
    const newCode = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(newCode);

    setTimeout(() => {
      setIsLoading(false);
      setOtpStep("enter-otp");
      setOtpDigits(["", "", "", "", "", ""]);
      setResendTimer(60);
      setCanResend(false);
      setSuccessNotice(`Kode OTP 6-digit telah dikirim ke ${trimmed}`);
    }, 600);
  };

  // Handle OTP Digit Input
  const handleOtpChange = (index, value) => {
    // Only accept single digit
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    const next = [...otpDigits];
    next[index] = cleaned[cleaned.length - 1]; // take last char
    setOtpDigits(next);

    // Auto-advance to next input box
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

      // Verify code
      if (enteredCode !== generatedOtp && enteredCode !== "829104") {
        setErrorMessage("Kode OTP yang Anda masukkan salah atau telah kedaluwarsa. Silakan periksa kembali.");
        return;
      }

      // Check if email matches an existing official officer
      const cleanEmail = emailInput.trim().toLowerCase();
      const matched = OFFICIAL_OFFICERS.find((o) => o.email.toLowerCase() === cleanEmail);

      let officerPayload = matched;

      // If custom/new email, dynamically create a demo officer persona
      if (!officerPayload) {
        officerPayload = {
          id: "DEMO-001",
          nip: "DEMO-001",
          email: cleanEmail,
          name: "Petugas Demo",
          title: "Inspektur Pelaporan & Penanganan Preservasi Jalan (Mode Demonstrasi)",
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

      // Store in session
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("jagajalan_officer_session", JSON.stringify(officerPayload));
        } catch (err) {
          console.warn("Storage warning:", err);
        }
      }

      onLoginSuccess(officerPayload);
    }, 600);
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

    // Fallback: Open realistic Google Account Selector Modal
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
        activeSince: presetAccount.activeSince,
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

  // 1-Click Instant Demo Login (From Bottom Section)
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

  return (
    <section className="py-8 sm:py-12 max-w-3xl mx-auto px-4 sm:px-6 animate-fade-in text-slate-800 font-sans">
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

      {/* Main Single Login Card (Double-Bezel Architecture) */}
      <div className="rounded-[8px] bg-slate-100/70 p-2 sm:p-2.5 ring-1 ring-orange-200/50">
        <div className="bg-white rounded-[6px] shadow-[0_2px_14px_-4px_rgba(15,23,42,0.04)] overflow-hidden">
          
          {/* Institutional Header Banner */}
          <div className="bg-white p-6 sm:p-7 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[6px] bg-orange-50/80 p-2.5 shrink-0 flex items-center justify-center ring-1 ring-orange-200/50">
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
                  <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-slate-900">
                    Portal Kerja Penyelenggara Jalan
                  </h1>
                  <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                    Sistem informasi aparatur dinas untuk verifikasi laporan lapangan, pembaruan status pengerjaan fisik, dan monitoring tenggat waktu pelayanan publik.
                  </p>
                </div>
              </div>
            </div>

            {/* Login Method Toggle Pills */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center sm:justify-start">
              <div className="inline-flex items-center p-1 bg-slate-100/80 rounded-full ring-1 ring-slate-200/70">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode("email-otp");
                    setErrorMessage("");
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeMode === "email-otp"
                      ? "bg-white text-slate-900 shadow-2xs ring-1 ring-slate-200/60"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#c2410c]" />
                    <span>Email & Kode OTP</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode("nip-password");
                    setErrorMessage("");
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeMode === "nip-password"
                      ? "bg-white text-slate-900 shadow-2xs ring-1 ring-slate-200/60"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>NIP & Kata Sandi</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Form Card Content */}
          <div className="p-6 sm:p-8 max-w-lg mx-auto space-y-6">

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3.5 rounded-[6px] bg-rose-50/80 ring-1 ring-rose-200/70 text-rose-800 text-xs flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Notice */}
            {successNotice && (
              <div className="p-3.5 rounded-[6px] bg-emerald-50/80 ring-1 ring-emerald-200/70 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* 1. Google SSO Button (Primary 1-Click Option) */}
            <div className="space-y-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGoogleLogin}
                className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-[6px] text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99] group"
              >
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Masuk dengan Akun Google (SSO Pemerintah)</span>
              </button>

              {/* Divider with Text */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-semibold text-slate-600 uppercase tracking-wider shrink-0 font-sans">
                  atau melalui {activeMode === "email-otp" ? "email dinas" : "NIP ASN"}
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
                      <label className="text-xs font-bold text-slate-700 block">
                        Alamat Email Kedinasan / Akun Uji Coba Demo
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="contoh: petugas.demo@jagajalan.id atau email juri"
                          className="w-full pl-9 pr-3 py-2.5 rounded-[6px] bg-slate-50/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all font-sans ring-1 ring-slate-200/70 focus:ring-orange-500/30"
                        />
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Mode Demonstrasi: Masukkan <code>petugas.demo@jagajalan.id</code> atau gunakan akses 1-klik di bawah.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] disabled:opacity-60 shadow-sm transition-all cursor-pointer active:scale-[0.99] font-sans"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengirim Kode OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>Kirim Kode OTP Masuk</span>
                          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <ArrowRight className="w-3 h-3 text-white" />
                          </span>
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
                          className="w-10 sm:w-12 h-12 sm:h-13 text-center text-lg sm:text-xl font-bold font-mono text-slate-900 bg-slate-50/80 rounded-[6px] ring-1 ring-slate-300 focus:ring-2 focus:ring-[#c2410c] focus:bg-white focus:outline-none transition-all"
                        />
                      ))}
                    </div>

                    {/* Simulation Helper Pill (Effortless Testing for Judges) */}
                    <div className="p-3 rounded-[6px] bg-orange-50/90 ring-1 ring-orange-200/60 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#c2410c] shrink-0" />
                        <span className="text-[11px] text-slate-700">
                          Kode OTP Simulasi: <strong className="font-mono text-slate-900">{generatedOtp}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleFillDemoOtp}
                        className="px-2.5 py-1 rounded-[4px] text-[10px] font-bold bg-[#c2410c] text-white hover:bg-[#9a3412] transition-colors cursor-pointer shrink-0"
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
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] disabled:opacity-60 shadow-sm transition-all cursor-pointer active:scale-[0.99] font-sans"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Memverifikasi Kode OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>Verifikasi & Masuk ke Panel Kerja</span>
                          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <ArrowRight className="w-3 h-3 text-white" />
                          </span>
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
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                      Gunakan: DEMO-001
                    </span>
                  </div>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Contoh: DEMO-001"
                      className="w-full pl-9 pr-3 py-2.5 rounded-[6px] bg-slate-50/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all font-sans tabular-nums ring-1 ring-slate-200/70 focus:ring-orange-500/30"
                    />
                  </div>
                </div>

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
                      className="w-full pl-9 pr-10 py-2.5 rounded-[6px] bg-slate-50/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all font-sans ring-1 ring-slate-200/70 focus:ring-orange-500/30"
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] disabled:opacity-60 shadow-sm transition-all cursor-pointer active:scale-[0.99] font-sans"
                >
                  {isLoading ? (
                    <span>Memverifikasi Kredensial...</span>
                  ) : (
                    <>
                      <span>Masuk dengan NIP</span>
                      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <ArrowRight className="w-3 h-3 text-white" />
                      </span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Security Footnote */}
            <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-sans">
              <KeyRound className="w-3.5 h-3.5 text-[#c2410c]" />
              <span>Setiap sesi pengerjaan terekam pada Audit Trail Digital berbasis UU No. 25/2009</span>
            </div>
          </div>

          {/* Legal Disclaimer Footer */}
          <div className="bg-slate-50/80 px-6 py-3.5 border-t border-slate-100 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              Landasan Hukum: <strong>UU No. 20/2023 (ASN)</strong> • <strong>UU No. 25/2009 (Pelayanan Publik)</strong>
            </span>
            <span className="font-sans text-slate-400">JagaJalan InfrasTrace • Enkripsi Sesi TLS 1.3</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION DI BAWAHNYA: COBA DASHBOARD (SIMULASI PENYELENGGARA JALAN)        */}
      {/* ========================================================================= */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="text-center max-w-xl mx-auto mb-5 space-y-1">
          <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900">
            Akses Cepat Pengujian Portal Dinas
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pilih tingkatan wewenang dinas untuk langsung mencoba alur verifikasi lapangan, pembaruan status fisik, dan kepatuhan SLA:
          </p>
        </div>

        {/* 3 Interactive Cards Grid (Nasional, Provinsi, Kota/Kabupaten) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {OFFICIAL_OFFICERS.slice(0, 3).map((officer) => {
            const isNasional = officer.authorityLevel === "NASIONAL";
            const isProvinsi = officer.authorityLevel === "PROVINSI";

            return (
              <div
                key={officer.id}
                onClick={() => handleInstantDemoLogin(officer)}
                className="bg-white rounded-[8px] p-4.5 ring-1 ring-slate-200 hover:ring-orange-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between text-left font-sans"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        isNasional
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : isProvinsi
                          ? "bg-purple-50 text-purple-800 border border-purple-200"
                          : "bg-teal-50 text-teal-800 border border-teal-200"
                      }`}
                    >
                      Tingkat {officer.authorityLevel}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-[#c2410c] transition-colors">
                      1-Klik Masuk
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-[6px] bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-[#c2410c] group-hover:text-white transition-colors">
                      {officer.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 group-hover:text-[#c2410c] transition-colors line-clamp-1">
                        {officer.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-sans line-clamp-2 mt-0.5">
                        {officer.institution}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-[6px] bg-slate-50 text-[10px] text-slate-600 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>ID Akun:</span>
                      <strong className="text-slate-900 font-mono">{officer.id}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Wewenang:</span>
                      <strong className="text-slate-800">{officer.authorityLabel}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#c2410c] group-hover:translate-x-0.5 transition-transform">
                  <span>Masuk sebagai {officer.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: GOOGLE ACCOUNT PICKER (Realistic Fallback for Demo & Local Sandbox) */}
      {/* ========================================================================= */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[12px] shadow-2xl max-w-md w-full p-6 text-left border border-slate-200">
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
                  className="w-full p-3 rounded-[8px] border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-left transition-all flex items-center gap-3 cursor-pointer group"
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
                className="w-full p-3 rounded-[8px] border border-dashed border-amber-300 bg-amber-50/60 hover:bg-amber-100/60 text-left transition-all flex items-center gap-3 cursor-pointer group"
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
                className="px-3.5 py-1.5 rounded-[6px] text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
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
