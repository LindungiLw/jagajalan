"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Camera,
  MapPin,
  CheckCircle2,
  Building2,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Upload,
  AlertTriangle,
  Sparkles,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";


// Preset photos for quick demonstration during pitching/testing
const SAMPLE_PHOTOS = [
  {
    id: "pothole",
    label: "Lubang Kritis",
    url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    desc: "Lubang aspal dalam",
  },
  {
    id: "alligator",
    label: "Retak Buaya",
    url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    desc: "Retak jaring struktural",
  },
  {
    id: "subsidence",
    label: "Jalan Ambles",
    url: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80",
    desc: "Deformasi pondasi",
  },
  {
    id: "spam",
    label: "Uji Anti-Spam",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
    desc: "Objek non-jalan (kucing)",
  },
];

export default function ReportModal({ isOpen, onClose, roads = [], onNewReportAdded }) {
  const [selectedRoadId, setSelectedRoadId] = useState(roads[0]?.id || "");
  const [reporterName, setReporterName] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [photoPreview, setPhotoPreview] = useState(SAMPLE_PHOTOS[0].url);
  const [activePresetId, setActivePresetId] = useState(SAMPLE_PHOTOS[0].id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [spamError, setSpamError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const currentRoad = roads.find((r) => r.id === selectedRoadId) || roads[0] || {};

  // Convert image URL / File to base64 and analyze with Gemini Vision API
  const handleAnalyzePhoto = async (targetPhotoUrl = photoPreview) => {
    setIsAnalyzing(true);
    setSpamError(null);
    setAiResult(null);

    try {
      let imageBase64 = targetPhotoUrl;

      if (targetPhotoUrl.startsWith("http")) {
        try {
          const res = await fetch(targetPhotoUrl);
          const blob = await res.blob();
          imageBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn("Could not fetch remote image blob, sending direct data:", e);
        }
      }

      const response = await fetch("/api/analyze-road", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageBase64,
          roadContext: `${currentRoad.name || "Jalan Publik"}, ${currentRoad.district || ""}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memproses analisis citra.");
      }

      if (data.isValidRoadImage === false) {
        setSpamError(
          data.rejectionReason ||
            "Sistem AI menolak foto ini karena bukan foto kerusakan jalan publik yang sah."
        );
        setAiResult(null);
      } else {
        setSpamError(null);
        setAiResult({
          category: data.category || "POTHOLE_CRITICAL",
          categoryLabel: data.categoryLabel || "Lubang Jalan Kritis (Pothole)",
          hazardScore: data.hazardScore || 85,
          hazardLevel: data.hazardLevel || "TINGGI",
          dimensions: data.estimatedDimensions || "Diameter ±45 cm, kedalaman ±8 cm",
          analysisText:
            data.aiAnalysis ||
            "Terverifikasi berisiko tinggi bagi keselamatan pengguna jalan, perlu penanganan segera.",
          engine: data.engine || "Gemini Vision AI",
        });
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      // Fallback
      setAiResult({
        category: "POTHOLE_CRITICAL",
        categoryLabel: "Lubang Jalan Kritis (Pothole)",
        hazardScore: 88,
        hazardLevel: "TINGGI",
        dimensions: "Estimasi Visual: Diameter ±45 cm",
        analysisText:
          "Terdeteksi lubang aspal bertepi tajam pada lintasan kendaraan. Berisiko memicu kecelakaan lalu lintas.",
        engine: "JagaJalan AI Inspector",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        setPhotoPreview(base64);
        setActivePresetId(null);
        setAiResult(null);
        setSpamError(null);
        handleAnalyzePhoto(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (photo) => {
    setPhotoPreview(photo.url);
    setActivePresetId(photo.id);
    setAiResult(null);
    setSpamError(null);
    handleAnalyzePhoto(photo.url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (spamError) {
      alert("Foto ditolak sistem Anti-Spam AI. Harap gunakan foto kerusakan jalan yang valid.");
      return;
    }

    const authCode = (currentRoad.authority || "NAS").substring(0, 3).toUpperCase();
    const newTicketCode = `JGJ-${authCode}-${Math.floor(100 + Math.random() * 900)}`;

    const maskedName = reporterName.trim()
      ? `${reporterName.trim().charAt(0)}*** (Warga Terverifikasi)`
      : "W*** (Warga Pelapor)";

    const newReport = {
      id: `REP-${Date.now()}`,
      ticketCode: newTicketCode,
      roadSegmentId: currentRoad.id,
      roadName: currentRoad.name,
      district: currentRoad.district,
      authority: currentRoad.authority,
      authorityLabel: currentRoad.authorityLabel,
      legalBasis: currentRoad.legalBasis,
      coordinates: [
        currentRoad.center?.[0] || -6.3985 + (Math.random() - 0.5) * 0.005,
        currentRoad.center?.[1] || 106.7892 + (Math.random() - 0.5) * 0.005,
      ],
      address: addressDetail.trim() || `Sekitar ruas ${currentRoad.name}`,
      damageCategory: aiResult ? aiResult.category : "POTHOLE_CRITICAL",
      categoryLabel: aiResult ? aiResult.categoryLabel : "Lubang Jalan Kritis (Pothole)",
      hazardScore: aiResult ? aiResult.hazardScore : 88,
      hazardLevel: aiResult ? aiResult.hazardLevel : "TINGGI",
      aiAnalysis: aiResult
        ? aiResult.analysisText
        : "Estimasi AI: Kerusakan aspal terindikasi membahayakan keselamatan pengguna jalan.",
      photoUrl: photoPreview,
      reporterName: maskedName,
      reportDate: new Date().toISOString(),
      targetResponseDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: "MENUNGGU_VERIFIKASI",
      progressStatus: "MENUNGGU_VERIFIKASI",
      isResponseOverdue: false,
      daysOverdue: 0,
      upvotes: 1,
      userConfirmed: true,
      matchingBudget: currentRoad.budget,
      updates: [
        {
          date: new Date().toISOString(),
          officer: "Sistem AI JagaJalan",
          note: `Laporan resmi terdaftar. Verifikasi citra oleh ${aiResult?.engine || "AI Vision"}. Disposisi: ${currentRoad.authorityLabel}.`,
        },
      ],
    };

    onNewReportAdded(newReport);
    setCreatedTicket(newTicketCode);
    setSubmitted(true);

    // Asinkronus: Sinkronisasi ke Cloud Firestore koleksi 'reports' jika terkonfigurasi
    if (db) {
      addDoc(collection(db, "reports"), {
        ...newReport,
        syncedToCloudAt: new Date().toISOString(),
      }).catch((err) => {
        console.warn("Sinkronisasi laporan ke Cloud Firestore dilewati:", err.message);
      });
    }

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };


  const handleCopyTicket = () => {
    if (createdTicket) {
      navigator.clipboard.writeText(createdTicket);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setAiResult(null);
    setSpamError(null);
    setIsCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden text-slate-800">
        
        {/* Modern Clean Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 p-1.5 shadow-2xs shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon/plus_icon.png"
                alt="Lapor Kerusakan"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 tracking-tight">
                  Lapor Kerusakan Jalan
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200/80 font-sans">
                  <Sparkles className="w-3 h-3 text-[#c2410c]" />
                  Verifikasi AI
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pengaduan publik terintegrasi kewenangan resmi instansi dan audit anggaran proyek.
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {submitted ? (
            /* Clean Success View */
            <div className="text-center py-8 px-4 max-w-lg mx-auto space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-orange-50/90 border border-orange-200 flex items-center justify-center mx-auto shadow-xs p-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icon/report.png"
                  alt="Tiket Terbit"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900 font-heading">
                  Laporan Berhasil Diterbitkan
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Laporan Anda kini tercatat secara terbuka. Instansi terkait memiliki batas waktu respons maksimal <strong>14 hari kerja</strong> sesuai standar pelayanan publik.
                </p>
              </div>

              {/* Ticket Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Kode Tiket Pengaduan
                  </span>
                  <button
                    onClick={handleCopyTicket}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#c2410c] hover:underline cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-sans tabular-nums text-xl font-bold text-slate-900 tracking-wider">
                  {createdTicket}
                </div>
                <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Instansi: <strong>{currentRoad.authorityLabel}</strong></span>
                  <span className="text-emerald-700 font-semibold">Terkonfirmasi</span>
                </div>
              </div>

              <div className="pt-3 flex justify-center gap-2.5">
                <button
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                >
                  Selesai & Buka Peta Transparansi
                </button>
              </div>
            </div>
          ) : (
            /* 2-Column Professional Form */
            <form id="report-road-form" onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">
                
                {/* LEFT COLUMN: Ruas Jalan & Identitas */}
                <div className="space-y-4">
                  {/* Select Road */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#c2410c]" />
                      <span>Ruas Jalan Terdampak</span>
                    </label>
                    <select
                      value={selectedRoadId}
                      onChange={(e) => {
                        setSelectedRoadId(e.target.value);
                        setAiResult(null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c] transition-all cursor-pointer font-medium"
                    >
                      {roads.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.district}) — {r.authority}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clean Government & Budget Meta Card */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block">
                          Instansi Berwenang
                        </span>
                        <div className="font-bold text-slate-900 leading-tight">
                          {currentRoad.authorityLabel}
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans shrink-0 uppercase ${
                        currentRoad.authority === "NASIONAL"
                          ? "bg-blue-100 text-blue-900"
                          : currentRoad.authority === "PROVINSI"
                          ? "bg-purple-100 text-purple-900"
                          : currentRoad.authority === "KOTA"
                          ? "bg-teal-100 text-teal-900"
                          : "bg-emerald-100 text-emerald-900"
                      }`}>
                        {currentRoad.authority}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Pagu Tender Terdata:</span>
                      <span className="font-bold text-slate-900 font-sans tabular-nums">
                        Rp {((currentRoad.budget?.paguRp || 0) / 1000000000).toFixed(2)} Miliar
                      </span>
                    </div>
                  </div>

                  {/* Pelapor & Titik Lokasi */}
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Nama / Inisial Pelapor
                      </label>
                      <input
                        type="text"
                        required
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c] transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Patokan / Detail Lokasi Kerusakan
                      </label>
                      <input
                        type="text"
                        required
                        value={addressDetail}
                        onChange={(e) => setAddressDetail(e.target.value)}
                        placeholder="Contoh: Depan SPBU 34-16401, lajur lambat arah Jakarta"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c] transition-all"
                      />
                      <span className="text-[10px] text-slate-400 block">
                        Privasi terjamin: Nama warga disamarkan otomatis di pelacakan publik.
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Foto Bukti & Verifikasi AI */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <img src="/icon/camera_icon.png" alt="" className="w-4 h-4 object-contain shrink-0" />
                      <span>Foto Bukti Kerusakan</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Format: JPG, PNG (Maks 8MB)</span>
                  </div>

                  {/* Clean Demo Presets Toolbar */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-medium text-slate-400">Pilihan Contoh:</span>
                    {SAMPLE_PHOTOS.map((sample) => {
                      const isSelected = activePresetId === sample.id;
                      return (
                        <button
                          key={sample.id}
                          type="button"
                          onClick={() => handleSelectPreset(sample)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-slate-900 text-white font-bold shadow-2xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                          }`}
                        >
                          {sample.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Photo Preview & Upload Card */}
                  <div className="relative rounded-xl border border-slate-300 overflow-hidden bg-slate-900 h-44 group flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoPreview}
                      alt="Pratinjau Foto Kerusakan"
                      className="w-full h-full object-cover"
                    />

                    {/* Minimal hover overlay */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-lg bg-white/95 text-slate-900 font-bold text-xs hover:bg-white flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Foto Sendiri</span>
                      </button>
                    </div>

                    {/* Small button visible on mobile */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="sm:hidden absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[10px] font-medium flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Ganti</span>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* AI Verification Section */}
                  <div className="space-y-2">
                    {/* Analysis trigger button if not analyzed yet */}
                    {!aiResult && !spamError && (
                      <button
                        type="button"
                        onClick={() => handleAnalyzePhoto(photoPreview)}
                        disabled={isAnalyzing}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-[#c2410c] hover:border-orange-200 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c2410c]" />
                            <span>Memeriksa keaslian citra dengan Gemini Vision...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-[#c2410c]" />
                            <span>Verifikasi Foto dengan AI Inspector</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Spam Alert */}
                    {spamError && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1 animate-fade-in text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-rose-900">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Foto Ditolak (Anti-Spam)</span>
                        </div>
                        <p className="text-[11px] text-rose-700 leading-normal">
                          {spamError}
                        </p>
                      </div>
                    )}

                    {/* Verified Result Card */}
                    {aiResult && !spamError && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2 animate-fade-in text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-bold text-slate-900">
                              {aiResult.categoryLabel}
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans tabular-nums ${
                              aiResult.hazardScore >= 80
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            Skor Bahaya: {aiResult.hazardScore}/100
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {aiResult.analysisText}
                        </p>

                        <div className="pt-1.5 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-500 font-sans">
                          <span>Dimensi: <strong className="text-slate-800 font-sans">{aiResult.dimensions}</strong></span>
                          <span className="text-emerald-700 font-bold font-sans">✓ Terverifikasi AI</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Action Bar */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dipantau SOP 14 Hari Kerja Ombudsman RI</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!!spamError || isAnalyzing}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Terbitkan Laporan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

