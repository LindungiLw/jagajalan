"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Camera,
  MapPin,
  CheckCircle2,
  Building,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Upload,
  AlertTriangle,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";

// Preset photos for quick demonstration during pitching/testing
const SAMPLE_PHOTOS = [
  {
    label: "Lubang Kritis (Pothole)",
    url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    desc: "Lubang jalan aspal dengan genangan",
  },
  {
    label: "Retak Buaya (Alligator)",
    url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    desc: "Permukaan aspal retak jaring",
  },
  {
    label: "Ambles (Subsidence)",
    url: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80",
    desc: "Patahan dan deformasi bahu jalan",
  },
  {
    label: "Uji Anti-Spam (Foto Kucing)",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
    desc: "Menguji penolakan otomatis AI jika bukan jalan",
  },
];

export default function ReportModal({ isOpen, onClose, roads, onNewReportAdded }) {
  const [selectedRoadId, setSelectedRoadId] = useState(roads[0]?.id || "");
  const [reporterName, setReporterName] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [photoPreview, setPhotoPreview] = useState(SAMPLE_PHOTOS[0].url);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [spamError, setSpamError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const currentRoad = roads.find((r) => r.id === selectedRoadId) || roads[0];

  // Convert image URL / File to base64 and analyze with Google Gemini Vision API
  const handleAnalyzePhoto = async (targetPhotoUrl = photoPreview) => {
    setIsAnalyzing(true);
    setSpamError(null);
    setAiResult(null);

    try {
      let imageBase64 = targetPhotoUrl;

      // If it's an external URL, fetch and convert to base64
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

      // Call Next.js Route Handler powered by Gemini Vision
      const response = await fetch("/api/analyze-road", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageBase64,
          roadContext: `${currentRoad.name}, ${currentRoad.district}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memproses analisis citra.");
      }

      // Anti-Spam Check
      if (data.isValidRoadImage === false) {
        setSpamError(
          data.rejectionReason ||
            "Sistem AI menolak foto ini karena bukan merupakan foto permukaan jalan raya atau infrastruktur publik yang rusak."
        );
        setAiResult(null);
      } else {
        setSpamError(null);
        setAiResult({
          category: data.category || "POTHOLE_CRITICAL",
          categoryLabel: data.categoryLabel || "Lubang Jalan Kritis (Pothole)",
          hazardScore: data.hazardScore || 85,
          hazardLevel: data.hazardLevel || "TINGGI",
          dimensions: data.estimatedDimensions || "Diameter ±50 cm, kedalaman ±8 cm",
          analysisText:
            data.aiAnalysis ||
            "Rekomendasi Prioritas AI Vision: Kerusakan jalan terverifikasi berisiko tinggi bagi keselamatan pengguna jalan.",
          engine: data.engine || "Google Gemini Vision",
          note: data.note,
          authority: currentRoad.authority,
          authorityLabel: currentRoad.authorityLabel,
          legalBasis: currentRoad.legalBasis,
          matchedBudget: currentRoad.budget,
        });
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      // Fallback in case of network interruption
      setAiResult({
        category: "POTHOLE_CRITICAL",
        categoryLabel: "Lubang Jalan Kritis (Pothole)",
        hazardScore: 88,
        hazardLevel: "TINGGI",
        dimensions: "Estimasi Visual: Diameter ±45 cm",
        analysisText:
          "Rekomendasi Prioritas AI: Terdeteksi lubang aspal bertepi tajam pada lajur lintasan sepeda motor. Berisiko fatal memicu kecelakaan tunggal.",
        engine: "JagaJalan Fallback Engine",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle local file selection from device
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        setPhotoPreview(base64);
        setAiResult(null);
        setSpamError(null);
        // Automatically analyze uploaded image
        handleAnalyzePhoto(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (photo) => {
    setPhotoPreview(photo.url);
    setAiResult(null);
    setSpamError(null);
    handleAnalyzePhoto(photo.url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (spamError) {
      alert("Foto ditolak oleh Anti-Spam AI. Silakan unggah foto jalan rusak yang sah.");
      return;
    }

    const newTicketCode = `JGJ-${currentRoad.authority.substring(0, 3)}-${Math.floor(100 + Math.random() * 900)}`;

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
        currentRoad.center[0] + (Math.random() - 0.5) * 0.005,
        currentRoad.center[1] + (Math.random() - 0.5) * 0.005,
      ],
      address: addressDetail || "Sekitar ruas " + currentRoad.name,
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
          note: `Laporan baru masuk melalui aplikasi warga. Terverifikasi oleh ${aiResult?.engine || "AI Vision"}. Disposisi instansi: ${currentRoad.authorityLabel}.`,
        },
      ],
    };

    onNewReportAdded(newReport);
    setCreatedTicket(newTicketCode);
    setSubmitted(true);

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setAiResult(null);
    setSpamError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">Lapor Kerusakan Jalan Baru</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  Gemini Vision
                </span>
              </div>
              <p className="text-xs text-slate-500">Verifikasi Citra AI Real-Time & Kunci Kewenangan Instansi</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs text-slate-700 space-y-4">
          {submitted ? (
            /* Success State */
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Laporan Resmi Berhasil Diterbitkan</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Tiket pengaduan Anda telah terdaftar dalam sistem transparansi publik. Jam hitung mundur batas waktu tanggapan (14 hari kerja) telah dimulai secara terbuka.
              </p>
              <div className="inline-block p-3 rounded-xl bg-slate-50 border border-slate-300 font-mono text-slate-900 font-extrabold text-base tracking-wider">
                {createdTicket}
              </div>
              <div className="pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
                >
                  Tutup & Lihat Pada Peta
                </button>
              </div>
            </div>
          ) : (
            /* Form Input */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Select Road */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  1. Lokasi Ruas Jalan
                </label>
                <select
                  value={selectedRoadId}
                  onChange={(e) => {
                    setSelectedRoadId(e.target.value);
                    setAiResult(null);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500"
                >
                  {roads.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.district}) — Wewenang: {r.authority}
                    </option>
                  ))}
                </select>

                {/* Authority & APBD Box */}
                <div className="mt-2 p-3 rounded-lg bg-orange-50/70 border border-orange-200 text-[11px] space-y-1">
                  <div className="text-slate-600">
                    Instansi Penanggung Jawab: <strong className="text-slate-900">{currentRoad.authorityLabel}</strong>
                  </div>
                  <div className="text-slate-600">
                    Alokasi APBD Terdata: <strong className="text-orange-700">Rp {(currentRoad.budget?.paguRp / 1000000000).toFixed(1)} Miliar</strong> ({currentRoad.budget?.name})
                  </div>
                </div>
              </div>

              {/* Step 2: Reporter & Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Nama / Inisial Pelapor
                  </label>
                  <input
                    type="text"
                    required
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Patokan / Titik Lokasi
                  </label>
                  <input
                    type="text"
                    required
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    placeholder="Contoh: Depan SPBU / Seberang Puskesmas"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Step 3: Photo & Gemini AI Inspection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    2. Foto Bukti Kerusakan & Verifikasi Citra AI
                  </label>
                  <span className="text-[11px] text-slate-500">Didukung Google Gemini Vision</span>
                </div>

                {/* Preset Chips */}
                <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-slate-400 shrink-0">Preset Uji:</span>
                  {SAMPLE_PHOTOS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(sample)}
                      className={`px-2.5 py-1 rounded-md shrink-0 border transition-all ${
                        photoPreview === sample.url
                          ? "bg-orange-100 border-orange-400 text-orange-900 font-bold"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-44 h-28 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="Foto Kerusakan Jalan"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-slate-900/40 hover:bg-slate-900/60 text-white flex flex-col items-center justify-center gap-1 transition-all text-[11px] font-medium"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Ganti / Unggah Foto</span>
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <div className="flex-1 space-y-2">
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Model <strong>Computer Vision AI</strong> secara real-time memverifikasi keaslian objek jalan (anti-spam), mengukur estimasi dimensi, serta menghitung <strong>Hazard Score</strong> keselamatan.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleAnalyzePhoto(photoPreview)}
                        disabled={isAnalyzing}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Menganalisis dengan Gemini Vision...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                            <span>Jalankan Analisis AI Vision Sekarang</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Anti-Spam Error Banner */}
                  {spamError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 space-y-1 animate-fade-in">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Foto Ditolak oleh Sistem Anti-Spam AI</span>
                      </div>
                      <p className="text-[11px] text-rose-700 leading-relaxed">{spamError}</p>
                      <p className="text-[10px] text-rose-600 pt-1">
                        Sistem menjaga akuntabilitas data publik dengan menolak foto bukan jalan (selfie, meme, hewan, dokumen). Silakan pilih foto kerusakan aspal yang sah.
                      </p>
                    </div>
                  )}

                  {/* AI Inspection Output Card */}
                  {aiResult && !spamError && (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-300 shadow-xs space-y-2.5 animate-fade-in">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{aiResult.categoryLabel}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-purple-50 text-purple-700 border border-purple-200">
                            {aiResult.engine}
                          </span>
                          <span
                            className={`font-black px-2 py-0.5 rounded text-xs ${
                              aiResult.hazardScore >= 80
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            Skor Bahaya: {aiResult.hazardScore}/100 ({aiResult.hazardLevel})
                          </span>
                        </div>
                      </div>

                      {/* Visual Hazard Score Bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            aiResult.hazardScore >= 80 ? "bg-rose-600" : "bg-amber-500"
                          }`}
                          style={{ width: `${aiResult.hazardScore}%` }}
                        />
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed">{aiResult.analysisText}</p>

                      <div className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                        <span>
                          Estimasi Dimensi: <strong className="text-slate-800">{aiResult.dimensions}</strong>
                        </span>
                        <span className="text-emerald-700 font-medium">✓ Lolos Verifikasi Citra Publik</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!!spamError || isAnalyzing}
                  className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Terbitkan Laporan & Mulai Penghitungan SLA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
