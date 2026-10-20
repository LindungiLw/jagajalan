"use client";

import React, { useState } from "react";
import { X, Camera, MapPin, CheckCircle2, Building, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

export default function ReportModal({ isOpen, onClose, roads, onNewReportAdded }) {
  const [selectedRoadId, setSelectedRoadId] = useState(roads[0]?.id || "");
  const [reporterName, setReporterName] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [photoPreview, setPhotoPreview] = useState(
    "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80"
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);

  if (!isOpen) return null;

  const currentRoad = roads.find((r) => r.id === selectedRoadId) || roads[0];

  const handleSimulateAiAnalysis = () => {
    setIsAnalyzing(true);
    setAiResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAiResult({
        category: "POTHOLE_CRITICAL",
        categoryLabel: "Lubang Jalan Kritis (Pothole)",
        hazardScore: 89,
        hazardLevel: "TINGGI",
        dimensions: "Estimasi Visual: Lubang bertepi tajam di lajur tengah",
        analysisText:
          "Rekomendasi Prioritas AI Vision: Terklasifikasi sebagai lubang berisiko tinggi terhadap keselamatan pengendara roda dua. Rekomendasi prioritas penanganan bagi dinas terkait.",
        authority: currentRoad.authority,
        authorityLabel: currentRoad.authorityLabel,
        legalBasis: currentRoad.legalBasis,
        matchedBudget: currentRoad.budget,
      });
    }, 1200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
              <h3 className="font-extrabold text-slate-900 text-base">Lapor Kerusakan Jalan Baru</h3>
              <p className="text-xs text-slate-500">Verifikasi Citra AI & Kunci Instansi Penanggung Jawab</p>
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
                Tiket pengaduan Anda telah terdaftar dalam sistem transparansi publik. Jam hitung mundur batas waktu penanganan (14 hari kerja) telah dimulai secara terbuka.
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

              {/* Step 3: Photo & AI Inspection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  2. Foto Bukti Kerusakan & Verifikasi Citra AI
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Foto Kerusakan Jalan"
                    className="w-full sm:w-36 h-24 object-cover rounded-lg border border-slate-300"
                  />
                  <div className="flex-1 space-y-2">
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Sistem menggunakan model <strong>Computer Vision AI</strong> untuk memverifikasi keaslian kerusakan jalan (anti-hoaks/spam) serta menghitung estimasi dimensi lubang.
                    </p>
                    <button
                      type="button"
                      onClick={handleSimulateAiAnalysis}
                      disabled={isAnalyzing}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Menganalisis Permukaan Asfal...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-3.5 h-3.5" />
                          <span>Uji Verifikasi AI Vision</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* AI Inspection Output */}
                {aiResult && (
                  <div className="mt-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 animate-fade-in">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Status: {aiResult.categoryLabel}
                      </span>
                      <span className="text-rose-700 font-extrabold">Skor Risiko: {aiResult.hazardScore}/100</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{aiResult.analysisText}</p>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                      Estimasi Dimensi Kerusakan: <strong className="text-slate-800">{aiResult.dimensions}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs text-white bg-orange-600 hover:bg-orange-700 shadow-xs transition-colors flex items-center justify-center gap-2"
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
