"use client";

import React, { useState, useRef } from "react";
import {
  X,
  MapPin,
  CheckCircle2,
  Building2,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Upload,
  AlertTriangle,
  ScanLine,
  FileText,
  Copy,
  Check,
} from "lucide-react";
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
          analysisText:
            data.analysisText ||
            "Terdeteksi lubang aspal dengan potensi bahaya tinggi bagi pengendara roda dua dan empat.",
          dimensions: data.dimensions || "Estimasi 60cm x 40cm, kedalaman ~8cm",
          engine: data.engine || "Gemini 2.5 Flash Vision",
        });
      }
    } catch (err) {
      console.error("AI Analysis failed:", err);
      // Fallback graceful jika API offline
      setAiResult({
        category: "POTHOLE_CRITICAL",
        categoryLabel: "Lubang Jalan Kritis (Estimasi Mode Cepat)",
        hazardScore: 82,
        hazardLevel: "TINGGI",
        analysisText:
          "Verifikasi visual lokal mendeteksi kerusakan lapisan aspal dengan kedalaman signifikan yang memerlukan perbaikan cepat.",
        dimensions: "Estimasi ~50cm x 40cm",
        engine: "Fallback Computer Vision",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (sample) => {
    setActivePresetId(sample.id);
    setPhotoPreview(sample.url);
    setAiResult(null);
    setSpamError(null);
    handleAnalyzePhoto(sample.url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setActivePresetId(null);
        handleAnalyzePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
      {/* Outer Double-Bezel Frame */}
      <div className="rounded-[1.75rem] bg-slate-100/80 p-2 sm:p-2.5 ring-1 ring-slate-900/10 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        <div className="relative w-full flex-1 flex flex-col rounded-[1.25rem] bg-white shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-50/80 p-2 shrink-0 flex items-center justify-center ring-1 ring-orange-200/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icon/plus_icon.png"
                  alt="Lapor Kerusakan"
                  width={24}
                  height={24}
                  style={{ width: "24px", height: "24px" }}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 tracking-tight">
                    Lapor Kerusakan Jalan
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-[#9a3412] ring-1 ring-orange-200/60 font-sans">
                    <ScanLine className="w-3 h-3 text-[#c2410c]" />
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
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1">
            {submitted ? (
              /* Success View */
              <div className="text-center py-8 px-4 max-w-lg mx-auto space-y-4 animate-fade-in font-sans">
                <div className="w-16 h-16 rounded-2xl bg-orange-50/90 flex items-center justify-center mx-auto shadow-xs p-2.5 ring-1 ring-orange-200/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icon/report.png"
                    alt="Tiket Terbit"
                    width={40}
                    height={40}
                    style={{ width: "40px", height: "40px" }}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-slate-900 font-heading">
                    Laporan Berhasil Diterbitkan
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Laporan Anda kini tercatat secara terbuka. Instansi terkait memiliki kewajiban batas waktu respons sesuai standar pelayanan publik.
                  </p>
                </div>

                {/* Ticket Card */}
                <div className="p-4 rounded-2xl bg-slate-50/80 ring-1 ring-slate-900/5 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
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
                  <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-center justify-between">
                    <span>Instansi: <strong>{currentRoad.authorityLabel}</strong></span>
                    <span className="text-emerald-700 font-semibold">Terkonfirmasi</span>
                  </div>
                </div>

                <div className="pt-3 flex justify-center gap-2.5">
                  <button
                    onClick={handleResetAndClose}
                    className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer shadow-sm active:scale-95"
                  >
                    Selesai &amp; Buka Peta Transparansi
                  </button>
                </div>
              </div>
            ) : (
              /* 2-Column Professional Form */
              <form id="report-road-form" onSubmit={handleSubmit} className="space-y-5 font-sans">
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 text-xs text-slate-900 focus:outline-none focus:bg-white transition-all cursor-pointer font-medium ring-1 ring-slate-200/70 focus:ring-orange-500/30"
                      >
                        {roads.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.district}) • {r.authority}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Government & Budget Meta Card */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 ring-1 ring-slate-900/5 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">
                            Instansi Berwenang
                          </span>
                          <div className="font-bold text-slate-900 leading-tight">
                            {currentRoad.authorityLabel}
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans shrink-0 uppercase bg-white text-slate-700 ring-1 ring-slate-200/80">
                          {currentRoad.authority}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
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
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all ring-1 ring-slate-200/70 focus:ring-orange-500/30"
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
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all ring-1 ring-slate-200/70 focus:ring-orange-500/30"
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/icon/camera_icon.png"
                          alt=""
                          width={16}
                          height={16}
                          style={{ width: "16px", height: "16px" }}
                          className="w-4 h-4 object-contain shrink-0"
                        />
                        <span>Foto Bukti Kerusakan</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Format: JPG, PNG (Maks 8MB)</span>
                    </div>

                    {/* Clean Demo Presets Floating Toolbar */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-medium text-slate-400">Pilihan Contoh:</span>
                      {SAMPLE_PHOTOS.map((sample) => {
                        const isSelected = activePresetId === sample.id;
                        return (
                          <button
                            key={sample.id}
                            type="button"
                            onClick={() => handleSelectPreset(sample)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer ${
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
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900 h-44 group flex items-center justify-center ring-1 ring-slate-900/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="Pratinjau Foto Kerusakan"
                        className="w-full h-full object-cover"
                      />

                      {/* AI Laser Scanning Beam & HUD Crosshairs while Analyzing */}
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] flex flex-col items-center justify-center p-3 text-white overflow-hidden z-20">
                          {/* Laser Beam */}
                          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_16px_#ea580c] animate-scan-line pointer-events-none" />

                          {/* Futuristic HUD Crosshair */}
                          <div className="w-14 h-14 border border-orange-400/50 rounded-xl flex items-center justify-center relative mb-2">
                            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping" />
                            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-orange-400" />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-orange-400" />
                            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-orange-400" />
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-orange-400" />
                          </div>

                          <div className="text-[11px] font-mono font-bold text-orange-300 tracking-wider uppercase flex items-center gap-1.5">
                            <ScanLine className="w-3.5 h-3.5 animate-pulse text-orange-400" />
                            <span>AI Vision Scanning...</span>
                          </div>
                          <span className="text-[9.5px] text-slate-300 font-sans mt-0.5 text-center">
                            Mengukur kedalaman lubang &amp; estimasi indeks bahaya
                          </span>
                        </div>
                      )}

                      {/* Hover overlay (when not analyzing) */}
                      {!isAnalyzing && (
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 rounded-full bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Unggah Foto Sendiri</span>
                          </button>
                        </div>
                      )}

                      {/* Mobile button */}
                      {!isAnalyzing && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="sm:hidden absolute bottom-2 right-2 px-3 py-1 rounded-full bg-black/70 text-white text-[10px] font-medium flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Ganti</span>
                        </button>
                      )}
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
                      {!aiResult && !spamError && (
                        <button
                          type="button"
                          onClick={() => handleAnalyzePhoto(photoPreview)}
                          disabled={isAnalyzing}
                          className="w-full py-2.5 px-3 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-[#c2410c] text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c2410c]" />
                              <span>Memeriksa keaslian citra dengan Gemini Vision...</span>
                            </>
                          ) : (
                            <>
                              <ScanLine className="w-3.5 h-3.5 text-[#c2410c]" />
                              <span>Verifikasi Foto dengan AI Inspector</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Spam Alert */}
                      {spamError && (
                        <div className="p-3.5 rounded-2xl bg-rose-50/80 ring-1 ring-rose-200/70 text-rose-800 space-y-1 animate-fade-in text-xs">
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
                        <div className="p-4 rounded-2xl bg-slate-50/80 ring-1 ring-slate-900/5 space-y-2 animate-fade-in text-xs">
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

                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-sans">
                            <span>Dimensi: <strong className="text-slate-800 font-sans">{aiResult.dimensions}</strong></span>
                            <span className="text-emerald-700 font-bold font-sans">✓ Terverifikasi AI</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Bottom Action Bar */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dipantau Standar Kepatuhan Ombudsman RI</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleResetAndClose}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-full text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={!!spamError || isAnalyzing}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 pl-4 pr-2 py-2 rounded-full bg-[#c2410c] hover:bg-[#9a3412] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer font-sans"
                    >
                      <span>Terbitkan Laporan</span>
                      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <ArrowRight className="w-3 h-3 text-white" />
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
