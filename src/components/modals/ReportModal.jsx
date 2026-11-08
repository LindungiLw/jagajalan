"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Upload,
  AlertTriangle,
  ScanLine,
  Copy,
  Check,
  Crosshair,
  Navigation,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { detectJurisdictionByCoordinates } from "@/data/roadsData";

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

function getRoadMidpoint(road) {
  if (Array.isArray(road?.coordinates) && road.coordinates.length > 0) {
    const mid = road.coordinates[Math.floor(road.coordinates.length / 2)];
    if (Array.isArray(mid) && mid.length >= 2) {
      return [Number(mid[0].toFixed(5)), Number(mid[1].toFixed(5))];
    }
  }
  if (Array.isArray(road?.center) && road.center.length >= 2) {
    return [Number(road.center[0].toFixed(5)), Number(road.center[1].toFixed(5))];
  }
  return [-6.2088, 106.8456];
}

export default function ReportModal({
  isOpen,
  onClose,
  roads = [],
  onNewReportAdded,
  initialLocation = null,
  onViewReportOnMap,
}) {
  const defaultRoad = roads[0] || {};
  const defaultCoords = getRoadMidpoint(defaultRoad);

  const [selectedRoadId, setSelectedRoadId] = useState(defaultRoad.id || "");
  const [usePinnedLocation, setUsePinnedLocation] = useState(Boolean(initialLocation));
  const [latInput, setLatInput] = useState(String(defaultCoords[0]));
  const [lngInput, setLngInput] = useState(String(defaultCoords[1]));
  const [coordinateSource, setCoordinateSource] = useState("ROAD_CORRIDOR");
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [photoPreview, setPhotoPreview] = useState(SAMPLE_PHOTOS[0].url);
  const [activePresetId, setActivePresetId] = useState(SAMPLE_PHOTOS[0].id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ isSubmitting, setIsSubmitting ] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [spamError, setSpamError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [createdReportObj, setCreatedReportObj] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initialLocation && Array.isArray(initialLocation.coordinates)) {
      const [lat, lng] = initialLocation.coordinates;
      setLatInput(Number(lat).toFixed(5));
      setLngInput(Number(lng).toFixed(5));
      setUsePinnedLocation(true);
      setCoordinateSource(initialLocation.source || "GIS_MAP_PIN");
      if (initialLocation.roadSegmentId && roads.some((r) => r.id === initialLocation.roadSegmentId)) {
        setSelectedRoadId(initialLocation.roadSegmentId);
      }
      if (initialLocation.address) {
        setAddressDetail(initialLocation.address);
      } else if (initialLocation.roadName) {
        setAddressDetail(`Titik pada ${initialLocation.roadName}, ${initialLocation.district || ""}`);
      }
    } else {
      setUsePinnedLocation(false);
      setCoordinateSource("ROAD_CORRIDOR");
      const targetRoad = roads.find((r) => r.id === selectedRoadId) || roads[0];
      if (targetRoad) {
        const [lat, lng] = getRoadMidpoint(targetRoad);
        setLatInput(String(lat));
        setLngInput(String(lng));
      }
    }
  }, [isOpen, initialLocation, roads]);

  if (!isOpen) return null;

  const baseRoad = roads.find((r) => r.id === selectedRoadId) || roads[0] || {};
  const parsedLat = Number.parseFloat(latInput);
  const parsedLng = Number.parseFloat(lngInput);
  const validLat = !Number.isNaN(parsedLat) ? parsedLat : defaultCoords[0];
  const validLng = !Number.isNaN(parsedLng) ? parsedLng : defaultCoords[1];

  const currentRoad =
    usePinnedLocation && initialLocation
      ? {
          ...baseRoad,
          id: initialLocation.roadSegmentId || baseRoad.id || "ruas-gis-live",
          name: initialLocation.roadName || baseRoad.name || "Ruas Jalan Terdeteksi GIS",
          district: initialLocation.district || baseRoad.district || "Indonesia",
          authority: initialLocation.authority || baseRoad.authority || "KABUPATEN",
          authorityLabel:
            initialLocation.authorityLabel ||
            baseRoad.authorityLabel ||
            "Dinas PUPR Penyelenggara Jalan",
          legalBasis:
            initialLocation.legalBasis ||
            baseRoad.legalBasis ||
            "UU No. 2 Tahun 2022 tentang Jalan",
          leadership: initialLocation.leadership || baseRoad.leadership,
          budget: initialLocation.budget || baseRoad.budget,
        }
      : baseRoad;

  const handleRoadSelectChange = (newRoadId) => {
    setSelectedRoadId(newRoadId);
    setUsePinnedLocation(false);
    setCoordinateSource("ROAD_CORRIDOR");
    setAiResult(null);
    const chosen = roads.find((r) => r.id === newRoadId);
    if (chosen) {
      const [lat, lng] = getRoadMidpoint(chosen);
      setLatInput(String(lat));
      setLngInput(String(lng));
    }
  };

  const handleUseCurrentGps = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGpsStatusMsg("Peramban tidak mendukung fitur geolokasi GPS.");
      return;
    }
    setIsLocatingGps(true);
    setGpsStatusMsg("Mendeteksi titik koordinat GPS perangkat...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setLatInput(String(lat));
        setLngInput(String(lng));
        setCoordinateSource("DEVICE_GPS");

        const detected = detectJurisdictionByCoordinates(lat, lng, roads);
        if (detected?.nearestRoad?.id) {
          setSelectedRoadId(detected.nearestRoad.id);
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=17&accept-language=id`
          );
          if (res.ok) {
            const nom = await res.json();
            const roadLabel = nom?.address?.road || nom?.name || "";
            const areaLabel =
              nom?.address?.village ||
              nom?.address?.suburb ||
              nom?.address?.city ||
              nom?.address?.county ||
              "";
            if (roadLabel || areaLabel) {
              setAddressDetail(
                [roadLabel, areaLabel].filter(Boolean).join(", ") +
                  ` (Koordinat GPS ${lat}, ${lng})`
              );
            }
          }
        } catch {
          // Ignore reverse geocode failure on GPS
        }

        setGpsStatusMsg(`Titik GPS terkunci: ${lat}, ${lng}`);
        setIsLocatingGps(false);
      },
      () => {
        setGpsStatusMsg("Gagal mengakses GPS. Pastikan izin lokasi diaktifkan atau pilih titik di peta.");
        setIsLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

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
          roadContext: `${currentRoad.name || "Jalan Publik"}, ${currentRoad.district || ""} [${validLat.toFixed(4)}, ${validLng.toFixed(4)}]`,
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
            "Pemeriksaan awal foto mendeteksi lubang aspal dengan indikasi bahaya tinggi bagi pengendara.",
          dimensions: data.dimensions || "Estimasi 60cm x 40cm, kedalaman ~8cm",
          engine: data.engine || "Gemini 2.5 Flash Vision",
        });
      }
    } catch (err) {
      console.error("AI Analysis failed:", err);
      setAiResult({
        category: "POTHOLE_CRITICAL",
        categoryLabel: "Lubang Jalan Kritis (Pemeriksaan Awal)",
        hazardScore: 82,
        hazardLevel: "TINGGI",
        analysisText:
          "Pemeriksaan awal visual mendeteksi indikasi kerusakan lapisan aspal yang memerlukan peninjauan teknis petugas lapangan.",
        dimensions: "Estimasi ~50cm x 40cm",
        engine: "Gemini 2.5 Flash (Fallback)",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (spamError) {
      alert("Foto ditolak sistem Anti-Spam AI. Harap gunakan foto kerusakan jalan yang valid.");
      return;
    }

    setIsSubmitting(true);

    const authCode = (currentRoad.authority || "NAS").substring(0, 3).toUpperCase();
    const newTicketCode = `JGJ-${authCode}-${Math.floor(100 + Math.random() * 900)}`;

    const maskedName = reporterName.trim()
      ? `${reporterName.trim().charAt(0)}*** (Warga Terverifikasi)`
      : "W*** (Warga Pelapor)";

    const exactCoords = [Number(validLat.toFixed(6)), Number(validLng.toFixed(6))];

    const newReport = {
      id: `REP-${Date.now()}`,
      ticketCode: newTicketCode,
      roadSegmentId: currentRoad.id,
      roadName: currentRoad.name,
      district: currentRoad.district,
      authority: currentRoad.authority,
      authorityLabel: currentRoad.authorityLabel,
      legalBasis: currentRoad.legalBasis,
      coordinates: exactCoords,
      coordinateSource,
      address:
        addressDetail.trim() ||
        `Titik GIS [${exactCoords[0].toFixed(4)}, ${exactCoords[1].toFixed(4)}] — ${currentRoad.name}`,
      damageCategory: aiResult ? aiResult.category : "POTHOLE_CRITICAL",
      categoryLabel: aiResult ? aiResult.categoryLabel : "Lubang Jalan Kritis (Pothole)",
      hazardScore: aiResult ? aiResult.hazardScore : 88,
      hazardLevel: aiResult ? aiResult.hazardLevel : "TINGGI",
      aiAnalysis: aiResult
        ? aiResult.analysisText
        : "Pemeriksaan awal foto: Kerusakan perkerasan aspal terindikasi membahayakan keselamatan pengguna jalan.",
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
      isLiveCitizenReport: true,
      leadership: currentRoad.leadership,
      matchingBudget: currentRoad.budget,
      updates: [
        {
          date: new Date().toISOString(),
          officer: "Sistem Geospasial JagaJalan",
          note: `Titik laporan [${exactCoords[0].toFixed(5)}, ${exactCoords[1].toFixed(5)}] terpetakan secara real-time di layer GIS. Pemeriksaan awal foto oleh ${
            aiResult?.engine || "Gemini 2.5 Flash"
          }. Disposisi: ${currentRoad.authorityLabel}.`,
        },
      ],
    };

    let persistedReport = newReport;
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport),
      });
      if (response.ok) {
        const result = await response.json();
        if (result?.report) {
          persistedReport = result.report;
        }
      }
    } catch {
      // Fallback to local state if offline
    }

    try {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem("jagajalan_custom_reports_v1");
        const existing = raw ? JSON.parse(raw) : [];
        const updated = [
          persistedReport,
          ...existing.filter((r) => r.id !== persistedReport.id),
        ].slice(0, 50);
        window.localStorage.setItem("jagajalan_custom_reports_v1", JSON.stringify(updated));

        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("jagajalan_live_reports");
          bc.postMessage({ type: "NEW_REPORT", report: persistedReport });
          bc.close();
        }
      }
    } catch {
      // Ignore storage quota errors
    }

    onNewReportAdded(persistedReport);
    setCreatedTicket(persistedReport.ticketCode);
    setCreatedReportObj(persistedReport);
    setSubmitted(true);
    setIsSubmitting(false);

    if (db) {
      addDoc(collection(db, "reports"), {
        ...persistedReport,
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
    setGpsStatusMsg("");
    onClose();
  };

  const handleFlyToCreatedReport = () => {
    const target = createdReportObj;
    handleResetAndClose();
    if (target && onViewReportOnMap) {
      onViewReportOnMap(target);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="rounded-[8px] bg-slate-100/80 p-2 sm:p-2.5 ring-1 ring-orange-200/50 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        <div className="relative w-full flex-1 flex flex-col rounded-[6px] bg-white shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-[6px] bg-orange-50/80 p-2 shrink-0 flex items-center justify-center ring-1 ring-orange-200/50">
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
                <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 tracking-tight">
                  Lapor &amp; Petakan Titik Kerusakan Jalan (GIS)
                </h3>
                <p className="text-xs text-slate-500">
                  Koordinat titik kerusakan disinkronkan secara real-time ke peta interaktif GIS dan dinas penanggung jawab.
                </p>
              </div>
            </div>
            <button
              onClick={handleResetAndClose}
              className="p-1.5 rounded-[6px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1">
            {submitted ? (
              <div className="text-center py-6 px-4 max-w-lg mx-auto space-y-4 animate-fade-in font-sans">
                <div className="w-16 h-16 rounded-[6px] bg-orange-50/90 flex items-center justify-center mx-auto shadow-xs p-2.5 ring-1 ring-orange-200/60">
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
                    Titik Kerusakan Terpetakan di Peta GIS
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Laporan Anda telah ditayangkan secara real-time pada layer peta interaktif JagaJalan dengan batas waktu tanggapan resmi 14 hari kerja (Pasal 44 ayat (2) UU 25/2009).
                  </p>
                </div>

                {/* Ticket & GIS Coordinate Card */}
                <div className="p-4 rounded-[6px] bg-slate-50/80 ring-1 ring-orange-200/40 text-left space-y-2.5">
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
                  <div className="font-mono tabular-nums text-xl font-bold text-slate-900 tracking-wider">
                    {createdTicket}
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 space-y-1 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Koordinat Peta GIS:</span>
                      <span className="font-mono tabular-nums font-bold text-slate-900">
                        {createdReportObj?.coordinates?.[0]?.toFixed(5)}, {createdReportObj?.coordinates?.[1]?.toFixed(5)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Ruas Jalan:</span>
                      <span className="font-semibold text-slate-900 truncate max-w-[260px]">
                        {createdReportObj?.roadName || currentRoad.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Instansi Disposisi:</span>
                      <span className="font-semibold text-emerald-700 truncate max-w-[260px]">
                        {currentRoad.authorityLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2.5">
                  {onViewReportOnMap && (
                    <button
                      type="button"
                      onClick={handleFlyToCreatedReport}
                      className="px-5 py-2.5 rounded-[6px] bg-[#c2410c] text-white font-bold text-xs hover:bg-[#9a3412] transition-colors cursor-pointer shadow-xs active:scale-95 inline-flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Lihat Titik Laporan di Peta GIS</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-5 py-2.5 rounded-[6px] bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Tutup Jendela
                  </button>
                </div>
              </div>
            ) : (
              <form id="report-road-form" onSubmit={handleSubmit} className="space-y-5 font-sans">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">
                  
                  {/* LEFT COLUMN: Titik Koordinat GIS, Ruas Jalan & Identitas */}
                  <div className="space-y-3.5">
                    {/* Pinned GIS Point Notice or Road Selector */}
                    {usePinnedLocation && initialLocation ? (
                      <div className="p-3.5 rounded-[6px] bg-orange-50/70 ring-1 ring-orange-200/80 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10.5px] font-bold text-[#9a3412] uppercase tracking-wider flex items-center gap-1.5">
                            <Crosshair className="w-3.5 h-3.5 text-[#c2410c]" />
                            <span>Titik Peta GIS Terkunci</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setUsePinnedLocation(false)}
                            className="text-[10.5px] font-semibold text-[#c2410c] hover:underline cursor-pointer"
                          >
                            Ganti Ruas Manual
                          </button>
                        </div>
                        <div className="text-xs font-bold text-slate-900 leading-snug">
                          {currentRoad.name}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {currentRoad.district}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#c2410c]" />
                            <span>Ruas Jalan Terdampak</span>
                          </label>
                          {initialLocation && (
                            <button
                              type="button"
                              onClick={() => {
                                setUsePinnedLocation(true);
                                if (Array.isArray(initialLocation.coordinates)) {
                                  setLatInput(Number(initialLocation.coordinates[0]).toFixed(5));
                                  setLngInput(Number(initialLocation.coordinates[1]).toFixed(5));
                                }
                              }}
                              className="text-[10.5px] font-semibold text-[#c2410c] hover:underline cursor-pointer"
                            >
                              Gunakan Titik Klik Peta
                            </button>
                          )}
                        </div>
                        <select
                          value={selectedRoadId}
                          onChange={(e) => handleRoadSelectChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-[6px] bg-slate-50/80 text-xs text-slate-900 focus:outline-none focus:bg-white transition-all cursor-pointer font-medium ring-1 ring-orange-200/50 focus:ring-orange-500/30"
                        >
                          {roads.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.district}) • {r.authority}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Interactive GIS Coordinates Box */}
                    <div className="p-3.5 rounded-[6px] bg-slate-50/90 ring-1 ring-slate-200/90 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Navigation className="w-3 h-3 text-[#c2410c]" />
                          <span>Koordinat Geospasial (GIS)</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleUseCurrentGps}
                          disabled={isLocatingGps}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-[4px] bg-white hover:bg-orange-50 text-[#c2410c] ring-1 ring-orange-200/70 text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isLocatingGps ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Crosshair className="w-3 h-3" />
                          )}
                          <span>Titik GPS Saya</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                            Latitude (Garis Lintang)
                          </label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={latInput}
                            onChange={(e) => {
                              setLatInput(e.target.value);
                              setCoordinateSource("MANUAL_COORDINATE");
                            }}
                            className="w-full px-2.5 py-1.5 rounded-[5px] bg-white text-xs font-mono tabular-nums text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-orange-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                            Longitude (Garis Bujur)
                          </label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={lngInput}
                            onChange={(e) => {
                              setLngInput(e.target.value);
                              setCoordinateSource("MANUAL_COORDINATE");
                            }}
                            className="w-full px-2.5 py-1.5 rounded-[5px] bg-white text-xs font-mono tabular-nums text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-orange-500/50"
                          />
                        </div>
                      </div>

                      {gpsStatusMsg && (
                        <div className="text-[10px] font-medium text-[#9a3412] bg-orange-50/80 px-2 py-1 rounded-[4px]">
                          {gpsStatusMsg}
                        </div>
                      )}
                    </div>

                    {/* Government & Budget Meta Card */}
                    <div className="p-3.5 rounded-[6px] bg-slate-50/80 ring-1 ring-orange-200/40 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">
                            Instansi Berwenang
                          </span>
                          <div className="font-bold text-slate-900 leading-tight">
                            {currentRoad.authorityLabel}
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold font-sans shrink-0 uppercase bg-white text-slate-700 ring-1 ring-orange-200/50">
                          {currentRoad.authority}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Pagu Tender Terdata:</span>
                        <span className="font-bold text-slate-900 font-mono tabular-nums">
                          Rp {((currentRoad.budget?.paguRp || 0) / 1000000000).toFixed(2)} Miliar
                        </span>
                      </div>
                    </div>

                    {/* Pelapor & Titik Lokasi */}
                    <div className="space-y-2.5">
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
                          className="w-full px-3.5 py-2 rounded-[6px] bg-slate-50/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all ring-1 ring-orange-200/50 focus:ring-orange-500/30"
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
                          placeholder="Contoh: Depan SPBU 34-16401, lajur kiri arah pusat kota"
                          className="w-full px-3.5 py-2 rounded-[6px] bg-slate-50/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all ring-1 ring-orange-200/50 focus:ring-orange-500/30"
                        />
                        <span className="text-[10px] text-slate-400 block">
                          Privasi terjamin: Identitas pelapor disamarkan otomatis pada peta publik.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Foto Bukti & Pemeriksaan Awal AI */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
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
                            className={`px-2.5 py-0.5 rounded-[5px] text-[10px] font-medium transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#c2410c] text-white font-bold shadow-2xs"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                            }`}
                          >
                            {sample.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Photo Preview & Upload Card */}
                    <div className="relative rounded-[6px] overflow-hidden bg-slate-100 h-44 group flex items-center justify-center ring-1 ring-orange-200/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="Pratinjau Foto Kerusakan"
                        className="w-full h-full object-cover"
                      />

                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] flex flex-col items-center justify-center p-3 text-white overflow-hidden z-20">
                          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_16px_#ea580c] animate-scan-line pointer-events-none" />

                          <div className="w-12 h-12 border border-orange-400/60 rounded-[6px] flex items-center justify-center relative mb-2">
                            <Crosshair className="w-5 h-5 text-orange-400 animate-spin" />
                          </div>

                          <div className="text-[11px] font-mono font-bold text-orange-300 tracking-wider uppercase flex items-center gap-1.5">
                            <ScanLine className="w-3.5 h-3.5 animate-pulse text-orange-400" />
                            <span>Pemeriksaan Awal Gemini 2.5 Flash...</span>
                          </div>
                          <span className="text-[9.5px] text-slate-300 font-sans mt-0.5 text-center">
                            Mengevaluasi indikasi kerusakan visual &amp; saringan anti-spam
                          </span>
                        </div>
                      )}

                      {!isAnalyzing && (
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 rounded-[6px] bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Unggah Foto Sendiri</span>
                          </button>
                        </div>
                      )}

                      {!isAnalyzing && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="sm:hidden absolute bottom-2 right-2 px-3 py-1 rounded-[6px] bg-[#c2410c] text-white text-[10px] font-medium flex items-center gap-1 shadow-xs"
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

                    {/* AI Initial Triage Section */}
                    <div className="space-y-2">
                      {!aiResult && !spamError && (
                        <button
                          type="button"
                          onClick={() => handleAnalyzePhoto(photoPreview)}
                          disabled={isAnalyzing}
                          className="w-full py-2.5 px-3 rounded-[6px] bg-slate-100 hover:bg-orange-50 hover:text-[#c2410c] text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60 ring-1 ring-orange-200/40"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c2410c]" />
                              <span>Memeriksa foto dengan Gemini 2.5 Flash...</span>
                            </>
                          ) : (
                            <>
                              <ScanLine className="w-3.5 h-3.5 text-[#c2410c]" />
                              <span>Periksa Awal Foto dengan AI Inspector</span>
                            </>
                          )}
                        </button>
                      )}

                      {spamError && (
                        <div className="p-3.5 rounded-[6px] bg-rose-50/80 ring-1 ring-rose-200/70 text-rose-800 space-y-1 animate-fade-in text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-rose-900">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Foto Ditolak (Saringan Anti-Spam)</span>
                          </div>
                          <p className="text-[11px] text-rose-700 leading-normal">
                            {spamError}
                          </p>
                        </div>
                      )}

                      {aiResult && !spamError && (
                        <div className="p-4 rounded-[6px] bg-slate-50/80 ring-1 ring-orange-200/40 space-y-2 animate-fade-in text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="font-bold text-slate-900">
                                {aiResult.categoryLabel}
                              </span>
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold font-mono tabular-nums ${
                                aiResult.hazardScore >= 80
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              Indeks Bahaya: {aiResult.hazardScore}/100
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {aiResult.analysisText}
                          </p>

                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-sans">
                            <span>Estimasi Visual: <strong className="text-slate-800">{aiResult.dimensions}</strong></span>
                            <span className="text-emerald-700 font-bold">✓ Lolos Pemeriksaan Awal</span>
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
                    <span>Tenggat Tanggapan 14 Hari Kerja (Pasal 44 ayat (2) UU 25/2009)</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleResetAndClose}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-[6px] text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={!!spamError || isAnalyzing || isSubmitting}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 pl-4 pr-2 py-2 rounded-[6px] bg-[#c2410c] hover:bg-[#9a3412] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer font-sans"
                    >
                      <span>{isSubmitting ? "Menyimpan ke Peta GIS..." : "Terbitkan ke Peta GIS"}</span>
                      <span className="w-5 h-5 rounded-[4px] bg-white/20 flex items-center justify-center shrink-0">
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
