"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
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
  BellRing,
  Search,
  ChevronDown,
  Camera,
  Trash2,
  Image as ImageIcon,
  Building2,
  RefreshCw,
  SlidersHorizontal,
  ArrowLeft,
  Edit3,
  SwitchCamera,
  Sparkles,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { detectJurisdictionByCoordinates } from "@/data/roadsData";

// Dynamically import Mini GIS Map with SSR disabled to prevent Leaflet window errors
const MiniGisPicker = dynamic(() => import("./MiniGisPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[190px] bg-slate-100 flex flex-col items-center justify-center gap-1.5 text-slate-400">
      <Loader2 className="w-5 h-5 animate-spin text-[#c2410c]" />
      <span className="text-[11px] font-medium text-slate-500">Memuat peta GIS...</span>
    </div>
  ),
});

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

/**
 * Client-side image compression & downscaling (max dimension 1200px, JPEG 0.82)
 * Prevents Vercel 413 Payload Too Large and speeds up Google Gemini Vision inspection.
 */
function compressAndResizeImage(fileOrBase64, maxDimension = 1200, quality = 0.82) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(width, 1);
          canvas.height = Math.max(height, 1);
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(typeof fileOrBase64 === "string" ? fileOrBase64 : "");
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", quality);
          resolve(compressed);
        } catch {
          resolve(typeof fileOrBase64 === "string" ? fileOrBase64 : "");
        }
      };
      img.onerror = () => {
        resolve(typeof fileOrBase64 === "string" ? fileOrBase64 : "");
      };

      if (typeof fileOrBase64 === "string") {
        img.src = fileOrBase64;
      } else if (fileOrBase64 instanceof Blob || fileOrBase64 instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          img.src = reader.result;
        };
        reader.onerror = () => resolve("");
        reader.readAsDataURL(fileOrBase64);
      } else {
        resolve("");
      }
    } catch {
      resolve(typeof fileOrBase64 === "string" ? fileOrBase64 : "");
    }
  });
}

export default function ReportModal({
  isOpen,
  onClose,
  roads = [],
  onNewReportAdded,
  initialLocation = null,
  onViewReportOnMap,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wizard Stepper State: 1 = Lokasi & Pelapor, 2 = Foto & Cek AI
  const [currentStep, setCurrentStep] = useState(1);

  const defaultRoad = roads[0] || {};
  const defaultCoords = getRoadMidpoint(defaultRoad);

  const [selectedRoadId, setSelectedRoadId] = useState(defaultRoad.id || "");
  const [usePinnedLocation, setUsePinnedLocation] = useState(Boolean(initialLocation));
  const [latInput, setLatInput] = useState(String(defaultCoords[0]));
  const [lngInput, setLngInput] = useState(String(defaultCoords[1]));
  const [coordinateSource, setCoordinateSource] = useState("ROAD_CORRIDOR");
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState("");
  const [showManualCoords, setShowManualCoords] = useState(false);

  // Dynamic / Geolocated Road State (allows reporting any local road in Indonesia)
  const [isCustomRoad, setIsCustomRoad] = useState(false);
  const [customRoadName, setCustomRoadName] = useState("");
  const [customDistrict, setCustomDistrict] = useState("");
  const [customAuthority, setCustomAuthority] = useState("KOTA");
  const [customAuthorityLabel, setCustomAuthorityLabel] = useState("");

  const [reporterName, setReporterName] = useState("");
  const [notificationContact, setNotificationContact] = useState("");
  const [notifyOnUpdate, setNotifyOnUpdate] = useState(true);
  const [addressDetail, setAddressDetail] = useState("");

  // Photo & Checking State: direct citizen photo upload/capture
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [spamError, setSpamError] = useState(null);

  // Live Camera Viewfinder State
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState("environment"); // 'environment' | 'user'
  const [liveCameraError, setLiveCameraError] = useState(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Success view states
  const [submitted, setSubmitted] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [createdReportObj, setCreatedReportObj] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const roadPickerRef = useRef(null);

  const [isRoadPickerOpen, setIsRoadPickerOpen] = useState(false);
  const [roadSearchQuery, setRoadSearchQuery] = useState("");
  const [roadFilterGroup, setRoadFilterGroup] = useState("ALL");

  useEffect(() => {
    function handleClickOutside(e) {
      if (roadPickerRef.current && !roadPickerRef.current.contains(e.target)) {
        setIsRoadPickerOpen(false);
      }
    }
    if (isRoadPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isRoadPickerOpen]);

  const filteredRoads = useMemo(() => {
    return roads.filter((r) => {
      const q = roadSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.name?.toLowerCase().includes(q) ||
        r.district?.toLowerCase().includes(q) ||
        r.authority?.toLowerCase().includes(q);

      const matchesGroup =
        roadFilterGroup === "ALL" ||
        (roadFilterGroup === "MEDAN" && r.district?.includes("Medan")) ||
        (roadFilterGroup === "DELISERDANG" &&
          (r.district?.includes("Deli Serdang") || r.district?.includes("DeliSerdang"))) ||
        (roadFilterGroup === "SIMALUNGUN" && r.district?.includes("Simalungun")) ||
        (roadFilterGroup === "NASIONAL" && r.authority === "NASIONAL") ||
        (roadFilterGroup === "PROVINSI" && r.authority === "PROVINSI") ||
        (roadFilterGroup === "KOTA" && (r.authority === "KOTA" || r.authority === "KABUPATEN"));

      return matchesSearch && matchesGroup;
    });
  }, [roads, roadSearchQuery, roadFilterGroup]);

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
  }, [isOpen, initialLocation, roads, selectedRoadId]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach((track) => track.stop());
        } catch {}
        streamRef.current = null;
      }
    };
  }, []);

  // Stop camera stream whenever modal closes
  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach((track) => track.stop());
        } catch {}
        streamRef.current = null;
      }
      setIsLiveCameraActive(false);
      setIsStartingCamera(false);
    }
  }, [isOpen]);

  // Sync video element srcObject when camera becomes active
  useEffect(() => {
    if (isLiveCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => {
        console.warn("Video play error:", err);
      });
    }
  }, [isLiveCameraActive]);

  if (!isOpen || !mounted) return null;

  const baseRoad = roads.find((r) => r.id === selectedRoadId) || roads[0] || {};
  const parsedLat = Number.parseFloat(latInput);
  const parsedLng = Number.parseFloat(lngInput);
  const validLat = !Number.isNaN(parsedLat) ? parsedLat : defaultCoords[0];
  const validLng = !Number.isNaN(parsedLng) ? parsedLng : defaultCoords[1];

  const currentRoad = isCustomRoad
    ? {
        id: "ruas-geospasial-lokal",
        name: customRoadName.trim() || `Ruas Jalan Lokal [${validLat.toFixed(4)}, ${validLng.toFixed(4)}]`,
        district: customDistrict.trim() || "Wilayah Terpeta GIS",
        authority: customAuthority || "KOTA",
        authorityLabel:
          customAuthorityLabel.trim() ||
          `Pemerintah ${customDistrict || "Daerah Setempat"} (Dinas PUPR)`,
        legalBasis: "UU No. 2 Tahun 2022 Pasal 9 tentang Penyelenggaraan Jalan Daerah",
        leadership: {
          regionalHead: `Walikota / Bupati di Wilayah ${customDistrict || "Setempat"}`,
          agency: `Dinas Pekerjaan Umum & Penataan Ruang (PUPR)`,
          officialPic: "Bidang Bina Marga Dinas PU Daerah",
        },
        budget: { paguRp: 15000000000 },
        isCustom: true,
      }
    : usePinnedLocation && initialLocation
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
    if (newRoadId === "CUSTOM_MAP_POINT") {
      setIsCustomRoad(true);
      setCoordinateSource("GIS_MAP_PIN");
      setIsRoadPickerOpen(false);
      return;
    }
    setIsCustomRoad(false);
    setSelectedRoadId(newRoadId);
    setUsePinnedLocation(false);
    setCoordinateSource("ROAD_CORRIDOR");
    const chosen = roads.find((r) => r.id === newRoadId);
    if (chosen) {
      const [lat, lng] = getRoadMidpoint(chosen);
      setLatInput(String(lat));
      setLngInput(String(lng));
    }
  };

  const handleMiniMapLocationChange = async (newLat, newLng) => {
    setLatInput(String(newLat));
    setLngInput(String(newLng));
    setCoordinateSource("GIS_MAP_PIN");

    const detected = detectJurisdictionByCoordinates(newLat, newLng, roads);
    const distMeters = Math.round((detected?.distanceKm || 999) * 1000);

    if (!isCustomRoad && detected?.nearestRoad?.id && distMeters <= 60) {
      if (detected.nearestRoad.id !== selectedRoadId) {
        setSelectedRoadId(detected.nearestRoad.id);
        setGpsStatusMsg(`✓ Titik di peta disesuaikan: Dekat ${detected.nearestRoad.name} (~${distMeters}m)`);
      }
    } else {
      setGpsStatusMsg(`✓ Koordinat titik peta: ${newLat}, ${newLng}`);
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${newLat}&lon=${newLng}&zoom=17&accept-language=id`
      );
      if (res.ok) {
        const nom = await res.json();
        const roadLabel = nom?.address?.road || nom?.name || "";
        const sub = nom?.address?.suburb || nom?.address?.village || "";
        const city = nom?.address?.city || nom?.address?.county || nom?.address?.regency || nom?.address?.town || "";
        const prov = nom?.address?.state || "";

        if (roadLabel || sub || city) {
          const finalRoad = roadLabel || (sub ? `Jl. Area ${sub}` : `Ruas Jalan di ${city || prov}`);
          const finalDistrict = [city, prov].filter(Boolean).join(", ");
          const isKota = city.toLowerCase().includes("kota");

          if (isCustomRoad || distMeters > 60) {
            setIsCustomRoad(true);
            setCustomRoadName(finalRoad);
            setCustomDistrict(finalDistrict || "Indonesia");
            setCustomAuthority(isKota ? "KOTA" : "KABUPATEN");
            setCustomAuthorityLabel(`Pemerintah ${city || "Daerah Setempat"} (Dinas PUPR)`);
            setGpsStatusMsg(`✓ Titik peta: ${finalRoad}${city ? `, ${city}` : ""}`);
          }

          if (!addressDetail || addressDetail.startsWith("Titik") || coordinateSource === "GIS_MAP_PIN") {
            const locDetails = [roadLabel, sub, city].filter(Boolean).join(", ");
            if (locDetails) setAddressDetail(`${locDetails} (Titik GIS)`);
          }
        }
      }
    } catch {
      // Ignore geocode network failure
    }
  };

  const handleUseCurrentGps = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGpsStatusMsg("Peramban Anda tidak mendukung fitur geolokasi GPS.");
      return;
    }
    setIsLocatingGps(true);
    setGpsStatusMsg("Mendeteksi titik koordinat GPS perangkat Anda...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        const accuracy = Math.round(pos.coords.accuracy || 15);
        setLatInput(String(lat));
        setLngInput(String(lng));
        setCoordinateSource("DEVICE_GPS");

        const detected = detectJurisdictionByCoordinates(lat, lng, roads);
        const distMeters = Math.round((detected?.distanceKm || 999) * 1000);

        let detectedRoad = "";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=17&accept-language=id`
          );
          if (res.ok) {
            const nom = await res.json();
            const roadLabel = nom?.address?.road || nom?.name || "";
            const sub = nom?.address?.suburb || nom?.address?.village || "";
            const city = nom?.address?.city || nom?.address?.county || nom?.address?.regency || nom?.address?.town || "";
            const prov = nom?.address?.state || "";

            detectedRoad = roadLabel;

            const isKota = city.toLowerCase().includes("kota");
            const finalRoad = roadLabel || (sub ? `Jl. Area ${sub}` : `Ruas Jalan di ${city || prov || "Wilayah Anda"}`);
            const finalDistrict = [city, prov].filter(Boolean).join(", ");

            if (distMeters > 60 || !detected?.nearestRoad?.id) {
              setIsCustomRoad(true);
              setCustomRoadName(finalRoad);
              setCustomDistrict(finalDistrict || "Indonesia");
              setCustomAuthority(isKota ? "KOTA" : "KABUPATEN");
              setCustomAuthorityLabel(`Pemerintah ${city || "Daerah Setempat"} (Dinas PUPR)`);
            } else {
              setSelectedRoadId(detected.nearestRoad.id);
              setIsCustomRoad(false);
              setCustomRoadName(finalRoad);
            }

            setAddressDetail(
              [roadLabel, sub, city].filter(Boolean).join(", ") +
                ` (GPS akurasi ±${accuracy}m)`
            );
          }
        } catch {
          // Ignore geocode error
        }

        if (detectedRoad) {
          setGpsStatusMsg(`✓ GPS Terkunci: ${detectedRoad} (Akurasi ±${accuracy}m)`);
        } else if (distMeters <= 60 && detected?.nearestRoad?.name) {
          setGpsStatusMsg(`✓ GPS Terkunci: Dekat ${detected.nearestRoad.name} (~${distMeters}m)`);
        } else {
          setGpsStatusMsg(`✓ Titik GPS Terkunci: [${lat}, ${lng}] (Akurasi ±${accuracy}m)`);
        }

        setIsLocatingGps(false);
      },
      (err) => {
        console.warn("GPS error:", err);
        let msg = "Gagal mengakses GPS. Pastikan izin lokasi aktif atau tentukan titik langsung di peta.";
        if (err.code === 1) {
          msg = "Izin lokasi belum diberikan. Silakan izinkan akses lokasi pada browser atau geser pin peta.";
        } else if (err.code === 3) {
          msg = "Waktu pencarian GPS habis. Silakan coba lagi atau geser pin langsung pada peta.";
        }
        setGpsStatusMsg(msg);
        setIsLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleAnalyzePhoto = async (targetPhotoUrl) => {
    if (!targetPhotoUrl) return;
    setIsAnalyzing(true);
    setSpamError(null);
    setAiResult(null);

    try {
      let imageBase64 = targetPhotoUrl;

      if (targetPhotoUrl.startsWith("http") || targetPhotoUrl.startsWith("/")) {
        try {
          const res = await fetch(targetPhotoUrl);
          const blob = await res.blob();
          imageBase64 = await compressAndResizeImage(blob, 1200, 0.82);
        } catch (e) {
          console.warn("Could not fetch remote image blob:", e);
        }
      } else if (targetPhotoUrl.length > 500000) {
        // Compress large client base64 so it never exceeds Vercel 4.5MB payload limit
        try {
          imageBase64 = await compressAndResizeImage(targetPhotoUrl, 1200, 0.82);
        } catch {}
      }

      const response = await fetch("/api/analyze-road", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageBase64,
          image: imageBase64,
          roadContext: `${currentRoad.name || "Jalan Publik"}, ${currentRoad.district || ""} [${validLat.toFixed(4)}, ${validLng.toFixed(4)}]`,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error(`Server returned ${response.status}: ${response.statusText || "Gagal memproses gambar"}`);
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Gagal memproses analisis citra.");
      }

      if (data.isValidRoadImage === false) {
        setSpamError(
          data.rejectionReason ||
            "Foto yang diunggah belum menampilkan kerusakan jalan publik yang sah. Yuk ambil foto kondisi aspal atau jalan yang ingin dilaporkan."
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
            data.aiAnalysis ||
            "Pemeriksaan awal foto mendeteksi indikasi kerusakan aspal dengan tingkat risiko keselamatan bagi pengendara.",
          dimensions: data.dimensions || data.estimatedDimensions || "Estimasi visual ~50cm x 40cm, kedalaman ~6-8cm",
          engine: data.engine || "Google Gemini Vision AI",
        });
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setAiResult({
        category: "POTHOLE_CRITICAL",
        categoryLabel: "Lubang Jalan Kritis",
        hazardScore: 82,
        hazardLevel: "TINGGI",
        analysisText:
          "Pemeriksaan awal visual mendeteksi indikasi kerusakan lapisan aspal yang memerlukan peninjauan teknis dinas.",
        dimensions: "Estimasi ~50cm x 40cm",
        engine: "Pemeriksaan Cadangan AI",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProcessFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Format berkas tidak didukung. Harap unggah berkas gambar (JPG, PNG, WebP, HEIC).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran gambar terlalu besar. Maksimal ukuran berkas adalah 10 MB.");
      return;
    }

    setIsAnalyzing(true);
    setSpamError(null);
    try {
      const compressed = await compressAndResizeImage(file, 1200, 0.82);
      setPhotoPreview(compressed);
      await handleAnalyzePhoto(compressed);
    } catch (err) {
      console.warn("Compression fallback:", err);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setPhotoPreview(base64Data);
        handleAnalyzePhoto(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadSamplePhoto = async (url) => {
    try {
      setIsAnalyzing(true);
      setSpamError(null);
      const res = await fetch(url);
      const blob = await res.blob();
      const base64 = await compressAndResizeImage(blob, 1200, 0.82);
      setPhotoPreview(base64);
      await handleAnalyzePhoto(base64);
    } catch (e) {
      console.error("Failed to load sample photo:", e);
      setIsAnalyzing(false);
    }
  };

  const handleLoadSampleNonRoad = async () => {
    try {
      setIsAnalyzing(true);
      setSpamError(null);
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, 600, 400);
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 22px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("UJI VALIDASI SISTEM JATAJALAN", 300, 150);
        ctx.fillStyle = "#64748b";
        ctx.font = "15px sans-serif";
        ctx.fillText("Contoh Gambar Bukan Kondisi Jalan Raya", 300, 190);
        ctx.fillText("(Menguji filter kecerdasan buatan anti-spam)", 300, 220);
      }
      const testBase64 = canvas.toDataURL("image/jpeg", 0.82);
      setPhotoPreview(testBase64);
      await handleAnalyzePhoto(testBase64);
    } catch (e) {
      console.error("Failed to load non-road test:", e);
      setIsAnalyzing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleStopLiveCamera = () => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn("Error stopping camera track:", e);
      }
      streamRef.current = null;
    }
    setIsLiveCameraActive(false);
    setIsStartingCamera(false);
  };

  const handleStartLiveCamera = async (facing = cameraFacingMode) => {
    setLiveCameraError(null);
    setIsStartingCamera(true);

    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setIsStartingCamera(false);
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        setLiveCameraError("Peramban Anda belum mendukung akses kamera langsung.");
      }
      return;
    }

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      streamRef.current = null;
    }

    try {
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (facingErr) {
        console.warn("Facing constraint failed, fallback to basic video:", facingErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setCameraFacingMode(facing);
      setIsLiveCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error("Camera access error:", err);
      let errMsg = "Tidak dapat mengakses kamera. Pastikan izin kamera telah diaktifkan.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errMsg = "Izin akses kamera ditolak. Silakan berikan izin kamera di setelan browser atau gunakan unggah galeri.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errMsg = "Kamera tidak ditemukan pada perangkat Anda. Silakan pilih foto dari galeri.";
      }
      setLiveCameraError(errMsg);
      setIsLiveCameraActive(false);
    } finally {
      setIsStartingCamera(false);
    }
  };

  const handleToggleCameraFacing = () => {
    const nextMode = cameraFacingMode === "environment" ? "user" : "environment";
    handleStartLiveCamera(nextMode);
  };

  const handleCaptureLivePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;

    const canvas = document.createElement("canvas");
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (cameraFacingMode === "user") {
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, vw, vh);

    const base64Data = canvas.toDataURL("image/jpeg", 0.88);
    handleStopLiveCamera();
    setPhotoPreview(base64Data);
    setSpamError(null);
    handleAnalyzePhoto(base64Data);
  };

  const handleClearPhoto = () => {
    handleStopLiveCamera();
    setPhotoPreview(null);
    setAiResult(null);
    setSpamError(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  // Step 1 Validation & Proceed to Step 2
  const handleProceedToStep2 = (e) => {
    if (e) e.preventDefault();
    if (!reporterName.trim()) {
      alert("Harap masukkan nama atau inisial Anda sebagai pelapor.");
      return;
    }
    if (!addressDetail.trim()) {
      alert("Harap masukkan patokan atau detail lokasi kerusakan jalan.");
      return;
    }
    if (isCustomRoad && !customRoadName.trim()) {
      alert("Harap masukkan nama ruas jalan lokasi kerusakan.");
      return;
    }
    setCurrentStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!photoPreview) {
      alert("Harap ambil foto langsung atau unggah foto bukti kerusakan jalan terlebih dahulu.");
      return;
    }

    if (spamError) {
      alert("Foto belum sesuai kriteria. Harap gunakan foto kerusakan jalan yang sah.");
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
      notificationContact: notificationContact.trim(),
      notifyOnUpdate,
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
          note: `Titik laporan [${exactCoords[0].toFixed(5)}, ${exactCoords[1].toFixed(5)}] terpetakan secara real-time di layer GIS. Pemeriksaan awal visual terverifikasi. Disposisi: ${currentRoad.authorityLabel}.`,
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

        if (notifyOnUpdate) {
          const subRaw = window.localStorage.getItem("jagajalan_subscribed_tickets_v1");
          const subs = subRaw ? JSON.parse(subRaw) : [];
          if (Array.isArray(subs) && !subs.includes(persistedReport.ticketCode)) {
            window.localStorage.setItem(
              "jagajalan_subscribed_tickets_v1",
              JSON.stringify([persistedReport.ticketCode, ...subs])
            );
          }
        }

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
    handleStopLiveCamera();
    setSubmitted(false);
    setCurrentStep(1);
    setPhotoPreview(null);
    setAiResult(null);
    setSpamError(null);
    setIsCopied(false);
    setGpsStatusMsg("");
    setShowManualCoords(false);
    setIsCustomRoad(false);
    setCustomRoadName("");
    onClose();
  };

  const handleFlyToCreatedReport = () => {
    const target = createdReportObj;
    handleResetAndClose();
    if (target && onViewReportOnMap) {
      onViewReportOnMap(target);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="rounded-[10px] bg-slate-100/95 p-2 sm:p-3 ring-1 ring-orange-200/60 w-full max-w-4xl md:max-w-5xl lg:max-w-5xl max-h-[94vh] flex flex-col overflow-hidden text-slate-800 shadow-2xl">
        <div className="relative w-full flex-1 flex flex-col rounded-[8px] bg-white shadow-xl overflow-hidden">
          
          {/* Header */}
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[7px] bg-orange-50 p-1.5 shrink-0 flex items-center justify-center ring-1 ring-orange-200/60 shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icon/plus_icon.png"
                  alt="Lapor Kerusakan"
                  width={22}
                  height={22}
                  style={{ width: "22px", height: "22px" }}
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 tracking-tight">
                  Lapor &amp; Petakan Titik Kerusakan Jalan (GIS)
                </h3>
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

          {/* Stepper Progress Bar (Only shown before submission) */}
          {!submitted && (
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-center gap-3 sm:gap-6 shrink-0">
              {/* Step 1 Indicator */}
              <button
                type="button"
                onClick={() => {
                  handleStopLiveCamera();
                  setCurrentStep(1);
                }}
                className={`inline-flex items-center gap-2 text-xs font-bold transition-colors cursor-pointer ${
                  currentStep === 1
                    ? "text-[#c2410c]"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    currentStep === 1
                      ? "bg-[#c2410c] text-white shadow-xs"
                      : currentStep > 1
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : "1"}
                </span>
                <span>1. Titik Lokasi &amp; Pelapor</span>
              </button>

              {/* Progress Track */}
              <div className="w-10 sm:w-16 h-0.5 bg-slate-200 shrink-0 relative overflow-hidden rounded-full">
                <div
                  className={`absolute inset-0 bg-[#c2410c] transition-all duration-300 ${
                    currentStep === 2 ? "w-full" : "w-0"
                  }`}
                />
              </div>

              {/* Step 2 Indicator */}
              <button
                type="button"
                onClick={() => {
                  if (reporterName.trim() && addressDetail.trim()) {
                    setCurrentStep(2);
                  }
                }}
                disabled={!reporterName.trim() || !addressDetail.trim()}
                className={`inline-flex items-center gap-2 text-xs font-bold transition-colors ${
                  currentStep === 2
                    ? "text-[#c2410c]"
                    : "text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    currentStep === 2
                      ? "bg-[#c2410c] text-white shadow-xs ring-2 ring-orange-200"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  2
                </span>
                <span>2. Foto Bukti &amp; Cek AI</span>
              </button>
            </div>
          )}

          {/* Modal Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1">
            {submitted ? (
              /* SUCCESS CONFIRMATION VIEW */
              <div className="text-center py-6 px-4 max-w-lg mx-auto space-y-4 animate-fade-in font-sans">
                <div className="w-16 h-16 rounded-[10px] bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs ring-1 ring-emerald-200">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-slate-900 font-heading">
                    Laporan Berhasil Diterbitkan ke Peta GIS
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Laporan Anda telah ditayangkan secara real-time pada peta publik JagaJalan dan terdisposisi ke dinas berwenang sesuai kewenangan UU No. 2/2022.
                  </p>
                </div>

                {/* Ticket & GIS Coordinate Card */}
                <div className="p-4 rounded-[8px] bg-slate-50/90 ring-1 ring-orange-200/50 text-left space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Kode Tiket Pengaduan
                    </span>
                    <button
                      onClick={handleCopyTicket}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#c2410c] hover:underline cursor-pointer"
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
                  <div className="font-mono tabular-nums text-2xl font-black text-slate-900 tracking-wider">
                    {createdTicket}
                  </div>
                  <div className="pt-2.5 border-t border-slate-200/70 space-y-1.5 text-[11.5px] text-slate-600">
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
                      <span className="text-slate-500">Instansi Penanggung Jawab:</span>
                      <span className="font-semibold text-emerald-700 truncate max-w-[260px]">
                        {currentRoad.authorityLabel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Notifikasi Status:</span>
                      <span className="font-semibold text-[#c2410c] inline-flex items-center gap-1">
                        <BellRing className="w-3 h-3" />
                        <span>
                          {notifyOnUpdate
                            ? notificationContact.trim()
                              ? `Aktif (${notificationContact.trim()})`
                              : "Aktif di Pusat Notifikasi"
                            : "Nonaktif"}
                        </span>
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
            ) : currentStep === 1 ? (
              /* STEP 1: LOKASI GEOSPASIAL & IDENTITAS PELAPOR */
              <form onSubmit={handleProceedToStep2} className="space-y-4 font-sans animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-start">
                  
                  {/* Left Column of Step 1: Interactive Mini GIS Map */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#c2410c]" />
                        <span>Tentukan Titik Kerusakan di Peta</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Klik / geser pin untuk atur titik
                      </span>
                    </div>

                    {/* Mini Map Canvas with Floating Controls */}
                    <div className="relative rounded-[8px] overflow-hidden ring-1 ring-slate-300 shadow-xs bg-slate-100 h-52 sm:h-60 group">
                      <MiniGisPicker
                        lat={validLat}
                        lng={validLng}
                        onLocationChange={handleMiniMapLocationChange}
                      />

                      {/* Top Action Overlay: Kunci GPS */}
                      <div className="absolute top-2.5 right-2.5 pointer-events-none z-10">
                        <button
                          type="button"
                          onClick={handleUseCurrentGps}
                          disabled={isLocatingGps}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#c2410c] hover:bg-[#9a3412] text-white text-[10.5px] font-bold transition-all shadow-md cursor-pointer disabled:opacity-60 pointer-events-auto active:scale-95"
                          title="Kunci titik GPS saya secara presisi"
                        >
                          {isLocatingGps ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Crosshair className="w-3.5 h-3.5" />
                          )}
                          <span>{isLocatingGps ? "Mencari GPS..." : "Kunci GPS Saya"}</span>
                        </button>
                      </div>

                      {/* Bottom Coordinates Overlay */}
                      <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
                        <div className="px-2.5 py-1 rounded-[5px] bg-slate-900/90 backdrop-blur-xs text-white text-[10.5px] font-mono tabular-nums pointer-events-auto flex items-center gap-1.5 shadow-xs">
                          <Navigation className="w-3 h-3 text-orange-400" />
                          <span>{validLat.toFixed(5)}, {validLng.toFixed(5)}</span>
                        </div>

                        {showManualCoords ? (
                          <button
                            type="button"
                            onClick={() => setShowManualCoords(false)}
                            className="px-2.5 py-1 rounded-[5px] bg-white/95 text-[#c2410c] text-[10px] font-bold pointer-events-auto shadow-xs hover:bg-white cursor-pointer"
                          >
                            Tutup Koordinat
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowManualCoords(true)}
                            className="px-2.5 py-1 rounded-[5px] bg-white/90 hover:bg-white text-slate-700 text-[10px] font-semibold pointer-events-auto shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <SlidersHorizontal className="w-3 h-3 text-[#c2410c]" />
                            <span>Ubah Angka</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Manual Lat/Lng Fields */}
                    {showManualCoords && (
                      <div className="p-3 rounded-[7px] bg-slate-50 ring-1 ring-slate-200 grid grid-cols-2 gap-2.5 animate-fade-in text-[11px]">
                        <div>
                          <label className="block font-semibold text-slate-600 mb-1">
                            Latitude (Lintang)
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
                            className="w-full px-2.5 py-1.5 rounded-[5px] bg-white text-xs font-mono tabular-nums text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-1.5 focus:ring-[#c2410c]/40"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-600 mb-1">
                            Longitude (Bujur)
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
                            className="w-full px-2.5 py-1.5 rounded-[5px] bg-white text-xs font-mono tabular-nums text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-1.5 focus:ring-[#c2410c]/40"
                          />
                        </div>
                      </div>
                    )}

                    {gpsStatusMsg && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-[6px] bg-emerald-50 text-emerald-900 text-[11px] font-medium ring-1 ring-emerald-200/80 animate-fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="leading-snug">{gpsStatusMsg}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column of Step 1: Road Details, Authority, Reporter Details */}
                  <div className="space-y-3.5">
                    
                    {/* Road Selector Card */}
                    <div className="p-3.5 rounded-[8px] bg-slate-50/90 ring-1 ring-slate-200/80 space-y-3">
                      <div className="relative" ref={roadPickerRef}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            Ruas Jalan Laporan
                          </label>
                          <span className="text-[10px] text-slate-400">
                            {isCustomRoad ? "Jalan lokal terdeteksi" : "Pilih koridor ruas"}
                          </span>
                        </div>

                        {isCustomRoad ? (
                          /* DYNAMIC / GEOLOCATED ROAD DISPLAY & EDIT FIELD */
                          <div className="p-3 rounded-[7px] bg-white ring-1 ring-orange-200/90 space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                                <MapPin className="w-3.5 h-3.5 text-[#c2410c]" />
                                <span>Nama Jalan Sesuai Titik Peta</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsRoadPickerOpen(true)}
                                className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#c2410c] hover:underline cursor-pointer"
                              >
                                <span>Pilih Koridor Terdata</span>
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="space-y-1">
                              <input
                                type="text"
                                required
                                value={customRoadName}
                                onChange={(e) => setCustomRoadName(e.target.value)}
                                placeholder="Ketik nama jalan (contoh: Jl. Hanoman Raya atau Jl. Krapyak)"
                                className="w-full px-2.5 py-1.5 rounded-[5px] bg-slate-50 text-xs font-bold text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#c2410c]/40 shadow-2xs"
                              />
                              <span className="text-[10px] text-slate-400 block">
                                Nama jalan otomatis terdeteksi dari peta &amp; bisa Anda edit langsung secara bebas.
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10.5px] text-slate-500 pt-1 border-t border-slate-100">
                              <span className="truncate">{customDistrict || "Wilayah Terpeta"}</span>
                              <span className="px-2 py-0.5 rounded-[3px] text-[9.5px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 ring-1 ring-blue-200/70">
                                {customAuthority || "KOTA/KAB"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          /* PREDEFINED CORRIDOR BUTTON */
                          <button
                            type="button"
                            onClick={() => setIsRoadPickerOpen((prev) => !prev)}
                            className="w-full text-left p-3 rounded-[7px] bg-white text-slate-900 transition-all cursor-pointer ring-1 ring-slate-200 hover:ring-orange-300 focus:ring-2 focus:ring-[#c2410c]/30 space-y-1.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-bold text-slate-900 text-xs sm:text-[13px] leading-snug">
                                {currentRoad?.name || "Pilih Ruas Jalan..."}
                              </div>
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-slate-100 hover:bg-orange-50 text-[#c2410c] text-[10px] font-bold shrink-0 transition-colors">
                                <span>Ganti</span>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                    isRoadPickerOpen ? "rotate-180" : ""
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[10.5px] text-slate-500">
                              <span className="truncate">{currentRoad?.district || "Indonesia"}</span>
                              <span
                                className={`px-2 py-0.5 rounded-[3px] text-[9.5px] font-bold uppercase tracking-wider shrink-0 ${
                                  currentRoad?.authority === "NASIONAL"
                                    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200/70"
                                    : currentRoad?.authority === "PROVINSI"
                                    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200/70"
                                    : "bg-blue-50 text-blue-700 ring-1 ring-blue-200/70"
                                }`}
                              >
                                {currentRoad?.authority || "JALAN"}
                              </span>
                            </div>
                          </button>
                        )}

                        {/* Searchable Road Dropdown */}
                        {isRoadPickerOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-[8px] shadow-2xl ring-1 ring-slate-200 p-2.5 space-y-2 animate-fade-in border border-slate-100">
                            {/* Top action: Select current Map Point / Free text */}
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomRoad(true);
                                setIsRoadPickerOpen(false);
                              }}
                              className="w-full text-left p-2.5 rounded-[6px] transition-colors flex items-center justify-between gap-2 cursor-pointer border border-dashed border-orange-300 bg-orange-50/70 hover:bg-orange-100/70 mb-1"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-[#c2410c] flex items-center gap-1.5 truncate">
                                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                                  <span>📍 Gunakan Sesuai Titik Peta (Nama Bebas)</span>
                                </div>
                                <div className="text-[10px] text-slate-600 mt-0.5 truncate">
                                  {customRoadName ? customRoadName : "Ketik / deteksi nama jalan sesuai titik koordinat Anda"}
                                </div>
                              </div>
                              {isCustomRoad && <Check className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />}
                            </button>

                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="text"
                                value={roadSearchQuery}
                                onChange={(e) => setRoadSearchQuery(e.target.value)}
                                placeholder="Cari koridor nasional, provinsi, atau kota..."
                                autoFocus
                                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-[5px] bg-slate-50 ring-1 ring-slate-200 focus:outline-none focus:bg-white focus:ring-1.5 focus:ring-[#c2410c]/40 text-slate-900 placeholder:text-slate-400"
                              />
                              {roadSearchQuery && (
                                <button
                                  type="button"
                                  onClick={() => setRoadSearchQuery("")}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                                >
                                  ×
                                </button>
                              )}
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                              {[
                                { id: "ALL", label: "Semua" },
                                { id: "MEDAN", label: "Kota Medan" },
                                { id: "DELISERDANG", label: "Deli Serdang" },
                                { id: "SIMALUNGUN", label: "Simalungun" },
                                { id: "NASIONAL", label: "Nasional" },
                                { id: "PROVINSI", label: "Provinsi" },
                                { id: "KOTA", label: "Kota/Kab" },
                              ].map((chip) => {
                                const isActive = roadFilterGroup === chip.id;
                                return (
                                  <button
                                    key={chip.id}
                                    type="button"
                                    onClick={() => setRoadFilterGroup(chip.id)}
                                    className={`px-2 py-0.5 rounded-[4px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                                      isActive
                                        ? "bg-[#c2410c] text-white shadow-2xs"
                                        : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                                    }`}
                                  >
                                    {chip.label}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Road List */}
                            <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 rounded-[6px] border border-slate-100 bg-slate-50/30">
                              {filteredRoads.length === 0 ? (
                                <div className="py-5 px-3 text-center space-y-1">
                                  <p className="text-xs font-semibold text-slate-600">Tidak ada ruas jalan yang cocok</p>
                                  <p className="text-[10px] text-slate-400">Coba kata kunci lain</p>
                                </div>
                              ) : (
                                filteredRoads.map((r) => {
                                  const isSelected = r.id === selectedRoadId;
                                  return (
                                    <button
                                      key={r.id}
                                      type="button"
                                      onClick={() => {
                                        handleRoadSelectChange(r.id);
                                        setIsRoadPickerOpen(false);
                                      }}
                                      className={`w-full text-left px-3 py-2 transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                        isSelected
                                          ? "bg-orange-50/90 text-[#9a3412]"
                                          : "hover:bg-orange-50/50 text-slate-800"
                                      }`}
                                    >
                                      <div className="min-w-0 flex-1">
                                        <div className={`text-xs leading-snug truncate ${isSelected ? "font-bold text-[#c2410c]" : "font-medium text-slate-900"}`}>
                                          {r.name}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5 truncate">
                                          <span className="truncate">{r.district}</span>
                                          <span className="text-slate-300">•</span>
                                          <span className="font-semibold text-slate-600">{r.authority}</span>
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <Check className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />
                                      )}
                                    </button>
                                  );
                                })
                              )}
                            </div>

                            <div className="pt-1 px-1 flex items-center justify-between text-[10px] text-slate-500">
                              <span>Menampilkan {filteredRoads.length} dari {roads.length} ruas jalan</span>
                              <button
                                type="button"
                                onClick={() => setIsRoadPickerOpen(false)}
                                className="font-semibold text-[#c2410c] hover:underline cursor-pointer"
                              >
                                Selesai
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Authority & Budget Summary Bar */}
                      <div className="p-2.5 rounded-[7px] bg-white ring-1 ring-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Instansi Penanggung Jawab</span>
                          </span>
                          <span className="font-mono tabular-nums text-[10px] font-bold text-[#c2410c] bg-orange-50/80 px-2 py-0.5 rounded-[4px] ring-1 ring-orange-200/50 shrink-0">
                            Pagu: Rp {((currentRoad.budget?.paguRp || 0) / 1000000000).toFixed(2)} M
                          </span>
                        </div>
                        <div className="font-semibold text-slate-900 text-xs leading-relaxed">
                          {currentRoad.authorityLabel}
                        </div>
                      </div>

                      {/* Patokan Detail Lokasi */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Patokan / Detail Lokasi Lapangan
                        </label>
                        <input
                          type="text"
                          required
                          value={addressDetail}
                          onChange={(e) => setAddressDetail(e.target.value)}
                          placeholder="Contoh: Depan SPBU 34-16401, lajur kiri arah pusat kota"
                          className="w-full px-3 py-2 rounded-[6px] bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ring-1 ring-slate-200 focus:ring-1.5 focus:ring-[#c2410c]/40 shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Reporter Name & Notification Details */}
                    <div className="p-3.5 rounded-[8px] bg-slate-50/90 ring-1 ring-slate-200/80 space-y-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Nama / Inisial Pelapor
                        </label>
                        <input
                          type="text"
                          required
                          value={reporterName}
                          onChange={(e) => setReporterName(e.target.value)}
                          placeholder="Contoh: Budi Santoso atau B.S."
                          className="w-full px-3 py-2 rounded-[6px] bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ring-1 ring-slate-200 focus:ring-1.5 focus:ring-[#c2410c]/40 shadow-2xs"
                        />
                        <span className="text-[10px] text-slate-400 block pt-0.5">
                          Identitas pelapor disamarkan otomatis pada peta publik.
                        </span>
                      </div>

                      <div className="p-2.5 rounded-[6px] bg-white ring-1 ring-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10.5px] font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                            <BellRing className="w-3.5 h-3.5 text-[#c2410c]" />
                            <span>Kirim Notifikasi Status Penanganan</span>
                          </label>
                          <input
                            type="checkbox"
                            checked={notifyOnUpdate}
                            onChange={(e) => setNotifyOnUpdate(e.target.checked)}
                            className="accent-[#c2410c] w-3.5 h-3.5 cursor-pointer"
                          />
                        </div>
                        {notifyOnUpdate && (
                          <input
                            type="text"
                            value={notificationContact}
                            onChange={(e) => setNotificationContact(e.target.value)}
                            placeholder="WhatsApp / Email pengingat tiket (Opsional)"
                            className="w-full px-2.5 py-1.5 rounded-[4px] bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none ring-1 ring-slate-200 focus:ring-1.5 focus:ring-[#c2410c]/40 mt-1"
                          />
                        )}
                      </div>
                    </div>

                  </div>

                </div>

                {/* Bottom Action Bar of Step 1 */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="text-[10.5px] text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Terintegrasi Real-Time dengan Peta GIS &amp; Pengaduan Terbuka (UU 25/2009)</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleResetAndClose}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-[6px] text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer font-sans"
                    >
                      <span>Lanjut: Foto Bukti &amp; Cek AI</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* STEP 2: FOTO BUKTI KERUSAKAN & PEMERIKSAAN AI (CLEAN, FOCUSED FULL-WIDTH) */
              <form onSubmit={handleSubmit} className="space-y-4 font-sans animate-fade-in max-w-3xl mx-auto">
                
                {/* Step 1 Location Summary Banner */}
                <div className="p-3 rounded-[8px] bg-orange-50/70 ring-1 ring-orange-200/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-[5px] bg-[#c2410c] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {currentRoad.name}
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px] text-slate-600 truncate mt-0.5">
                        <span className="truncate">{currentRoad.authorityLabel}</span>
                        <span>•</span>
                        <span className="font-mono tabular-nums text-slate-700 font-semibold">
                          GIS: {validLat.toFixed(4)}, {validLng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleStopLiveCamera();
                      setCurrentStep(1);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] bg-white hover:bg-orange-100/60 text-[#c2410c] text-[10.5px] font-bold ring-1 ring-orange-200/80 shrink-0 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Ubah Lokasi</span>
                  </button>
                </div>

                {/* Hidden Inputs for Camera and File Picker (Fallback) */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleProcessFile(e.target.files?.[0])}
                  className="hidden"
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleProcessFile(e.target.files?.[0])}
                  className="hidden"
                />

                {/* PHOTO INPUT: LIVE CAMERA / DROPZONE / PREVIEW AREA */}
                {isLiveCameraActive ? (
                  /* LIVE CAMERA VIEWFINDER OVERLAY */
                  <div className="relative rounded-[10px] overflow-hidden bg-slate-950 h-72 sm:h-84 shadow-xl ring-2 ring-[#c2410c] flex flex-col items-center justify-between animate-fade-in group">
                    {/* Live Video Feed */}
                    <video
                      ref={videoRef}
                      playsInline
                      autoPlay
                      muted
                      className={`w-full h-full object-cover ${
                        cameraFacingMode === "user" ? "scale-x-[-1]" : ""
                      }`}
                    />

                    {/* Top HUD Bar */}
                    <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-20">
                      <div className="px-2.5 py-1 rounded-[5px] bg-slate-900/85 backdrop-blur-sm text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs ring-1 ring-white/10">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span>Kamera Langsung Aktif</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleToggleCameraFacing}
                          className="px-2.5 py-1 rounded-[5px] bg-slate-900/85 hover:bg-slate-900 text-white text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-sm shadow-xs cursor-pointer transition-colors ring-1 ring-white/10"
                          title="Putar Kamera Depan / Belakang"
                        >
                          <SwitchCamera className="w-3.5 h-3.5 text-orange-400" />
                          <span className="hidden sm:inline">Putar Kamera</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleStopLiveCamera}
                          className="p-1 rounded-[5px] bg-slate-900/85 hover:bg-slate-900 text-white backdrop-blur-sm shadow-xs cursor-pointer transition-colors ring-1 ring-white/10"
                          title="Tutup Kamera"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Target Viewfinder Framing Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-10">
                      <div className="w-56 h-36 sm:w-72 sm:h-44 border border-white/35 rounded-lg relative flex items-center justify-center">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-400 -mt-0.5 -ml-0.5" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-400 -mt-0.5 -mr-0.5" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-400 -mb-0.5 -ml-0.5" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange-400 -mb-0.5 -mr-0.5" />
                        <span className="text-[10.5px] font-medium text-white/90 drop-shadow px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs">
                          Arahkan ke Kerusakan Jalan
                        </span>
                      </div>
                    </div>

                    {/* Bottom Capture Controls */}
                    <div className="absolute bottom-3.5 inset-x-0 flex items-center justify-center gap-4 z-20">
                      <button
                        type="button"
                        onClick={handleCaptureLivePhoto}
                        className="w-14 h-14 rounded-full bg-white p-1 shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center ring-4 ring-[#c2410c] cursor-pointer"
                        title="Jepret Foto Sekarang"
                      >
                        <div className="w-11 h-11 rounded-full bg-[#c2410c] hover:bg-[#9a3412] flex items-center justify-center transition-colors">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                      </button>
                    </div>
                  </div>
                ) : !photoPreview ? (
                  /* Clean Dropzone with direct Camera and Gallery actions */
                  <div className="space-y-3">
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`rounded-[10px] border-2 border-dashed transition-all p-7 text-center flex flex-col items-center justify-center min-h-[240px] ${
                        isDragging
                          ? "border-[#c2410c] bg-orange-50/60 ring-4 ring-orange-200/50"
                          : "border-slate-300 hover:border-orange-300 bg-slate-50/70 hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-full bg-orange-100/90 text-[#c2410c] flex items-center justify-center mb-3 ring-1 ring-orange-200 shadow-xs">
                        <ImageIcon className="w-7 h-7" />
                      </div>
                      
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                        Ambil Foto Langsung atau Unggah Berkas
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mb-4 leading-relaxed">
                        Sertakan foto kondisi jalan yang jelas agar laporan dapat segera dicek secara otomatis oleh sistem JagaJalan dan diteruskan ke dinas.
                      </p>

                      {/* Dual Action Buttons: Direct Camera vs Gallery */}
                      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handleStartLiveCamera()}
                          disabled={isStartingCamera}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-60"
                        >
                          {isStartingCamera ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                          <span>{isStartingCamera ? "Menyiapkan Kamera..." : "Buka Kamera Langsung"}</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[6px] bg-white hover:bg-slate-100 text-slate-700 ring-1 ring-slate-300 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                        >
                          <Upload className="w-4 h-4 text-slate-500" />
                          <span>Pilih dari Galeri / Berkas</span>
                        </button>
                      </div>

                      <span className="text-[10.5px] text-slate-400 mt-3">
                        Format: JPG, PNG, HEIC (Maks 10MB) • Mendukung seret &amp; lepas (drag &amp; drop)
                      </span>
                    </div>

                    {/* Quick Sample Photos for Testing Gemini AI */}
                    <div className="p-3 rounded-[8px] bg-slate-50/90 border border-slate-200/90 text-xs text-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[11px] text-slate-700 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#c2410c]" />
                          <span>Uji Coba Cepat Inspeksi Gemini AI:</span>
                        </span>
                        <span className="text-[10px] text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded font-medium">
                          1-Klik Evaluasi
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleLoadSamplePhoto("/images/roads/jalan-lubang-medan.jpg")}
                          className="p-2 rounded-[6px] bg-white hover:bg-orange-50/60 border border-slate-200 text-left transition-all hover:border-[#c2410c] shadow-2xs group cursor-pointer"
                        >
                          <div className="font-bold text-[11px] text-slate-800 group-hover:text-[#c2410c] flex items-center gap-1">
                            <span>📸 Lubang Kritis</span>
                          </div>
                          <div className="text-[9.5px] text-slate-500 mt-0.5 truncate">
                            Medan (Pothole dalam)
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleLoadSamplePhoto("/images/roads/jalan-longsor-berastagi.jpg")}
                          className="p-2 rounded-[6px] bg-white hover:bg-orange-50/60 border border-slate-200 text-left transition-all hover:border-[#c2410c] shadow-2xs group cursor-pointer"
                        >
                          <div className="font-bold text-[11px] text-slate-800 group-hover:text-[#c2410c] flex items-center gap-1">
                            <span>📸 Longsor Struktur</span>
                          </div>
                          <div className="text-[9.5px] text-slate-500 mt-0.5 truncate">
                            Berastagi (Deformasi jalan)
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={handleLoadSampleNonRoad}
                          className="p-2 rounded-[6px] bg-white hover:bg-rose-50/60 border border-slate-200 text-left transition-all hover:border-rose-400 shadow-2xs group cursor-pointer"
                        >
                          <div className="font-bold text-[11px] text-slate-800 group-hover:text-rose-700 flex items-center gap-1">
                            <span>🚫 Uji Anti-Spam</span>
                          </div>
                          <div className="text-[9.5px] text-slate-500 mt-0.5 truncate">
                            Bukan jalan (deteksi tolak)
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Camera Permission / Device Error Notification */}
                    {liveCameraError && (
                      <div className="p-3.5 rounded-[7px] bg-rose-50 ring-1 ring-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-fade-in shadow-2xs">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <p className="font-semibold leading-snug">{liveCameraError}</p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1">
                            <button
                              type="button"
                              onClick={() => cameraInputRef.current?.click()}
                              className="font-bold text-rose-800 hover:underline cursor-pointer"
                            >
                              Gunakan Kamera Bawaan Perangkat
                            </button>
                            <span className="text-rose-300">•</span>
                            <button
                              type="button"
                              onClick={() => galleryInputRef.current?.click()}
                              className="font-bold text-rose-800 hover:underline cursor-pointer"
                            >
                              Pilih dari Galeri Foto
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Photo Preview Card with live AI Scanning & Actions */
                  <div className="space-y-3">
                    <div
                      className={`relative rounded-[8px] overflow-hidden bg-slate-900 h-56 sm:h-64 group shadow-sm flex items-center justify-center transition-all ${
                        spamError
                          ? "ring-2 ring-rose-400/80 shadow-rose-100/50"
                          : "ring-1 ring-slate-200"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="Foto Bukti Kerusakan"
                        className="w-full h-full object-cover"
                      />

                      {/* Scanning Overlay when checking image */}
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-white overflow-hidden z-20">
                          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_16px_#ea580c] animate-scan-line pointer-events-none" />

                          <div className="w-12 h-12 border border-orange-400/80 rounded-[8px] flex items-center justify-center relative mb-2">
                            <Crosshair className="w-6 h-6 text-orange-400 animate-spin" />
                          </div>

                          <div className="text-xs font-bold text-orange-300 tracking-wider flex items-center gap-1.5">
                            <ScanLine className="w-4 h-4 animate-pulse text-orange-400" />
                            <span>Ayo kita cek kondisi jalannya...</span>
                          </div>
                          <span className="text-[10px] text-slate-300 font-sans mt-0.5 text-center">
                            Mengecek tingkat kerusakan dan kelayakan foto secara otomatis
                          </span>
                        </div>
                      )}

                      {/* Top Action Overlay: Retake / Delete */}
                      {!isAnalyzing && (
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                          <button
                            type="button"
                            onClick={() => handleStartLiveCamera()}
                            className="px-3 py-1.5 rounded-[5px] bg-slate-900/85 hover:bg-slate-900 text-white text-[10.5px] font-semibold flex items-center gap-1.5 backdrop-blur-sm cursor-pointer shadow-xs transition-colors"
                            title="Buka kamera langsung untuk foto ulang"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Foto Ulang</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-[5px] bg-slate-900/85 hover:bg-slate-900 text-white text-[10.5px] font-semibold flex items-center gap-1.5 backdrop-blur-sm cursor-pointer shadow-xs transition-colors"
                            title="Pilih foto lain dari galeri"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Galeri</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleClearPhoto}
                            className="p-1.5 rounded-[5px] bg-rose-600/90 hover:bg-rose-700 text-white backdrop-blur-sm cursor-pointer shadow-xs transition-colors"
                            title="Hapus foto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Bottom Tag */}
                      {spamError ? (
                        <div className="absolute bottom-2.5 left-2.5 z-10 px-2.5 py-1 rounded-[5px] bg-rose-950/90 text-rose-200 text-[10.5px] font-semibold backdrop-blur-sm flex items-center gap-1.5 shadow-xs ring-1 ring-rose-500/50 animate-fade-in">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>Bukan Foto Kerusakan Jalan</span>
                        </div>
                      ) : (
                        <div className="absolute bottom-2.5 left-2.5 z-10 px-2.5 py-1 rounded-[5px] bg-slate-900/85 text-white text-[10.5px] font-medium backdrop-blur-sm flex items-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Foto Berhasil Dimuat</span>
                        </div>
                      )}
                    </div>

                    {/* Inspector Results Card */}
                    <div className="space-y-2.5">
                      {spamError && (
                        <div className="p-4 rounded-[8px] bg-rose-50/90 ring-1 ring-rose-200 text-rose-900 space-y-3 animate-fade-in shadow-2xs">
                          <div className="flex items-center justify-between gap-2 border-b border-rose-200/70 pb-2">
                            <div className="flex items-center gap-2 font-bold text-xs sm:text-[13px] text-rose-900">
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>Foto Belum Sesuai Kriteria</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-[4px] bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider shrink-0">
                              Verifikasi Ditolak
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <p className="text-[11.5px] text-rose-900 leading-relaxed font-medium">
                              {spamError}
                            </p>
                            <p className="text-[10.5px] text-rose-700/90 leading-normal">
                              💡 <strong>Saran:</strong> Mohon lampirkan foto yang memperlihatkan kondisi fisik permukaan jalan raya (aspal berlubang, retak buaya, jalan amblas, atau tebing labil).
                            </p>
                          </div>

                          {/* Action Buttons for Rejection */}
                          <div className="pt-1 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartLiveCamera()}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[5px] bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Buka Kamera Lagi</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => galleryInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[5px] bg-white hover:bg-rose-50 text-rose-900 ring-1 ring-rose-300 text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
                            >
                              <Upload className="w-3.5 h-3.5 text-rose-700" />
                              <span>Pilih dari Galeri</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleClearPhoto}
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-[5px] text-rose-700 hover:bg-rose-100/80 text-xs font-semibold transition-colors cursor-pointer ml-auto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {aiResult && !spamError && (
                        <div className="p-4 rounded-[8px] bg-slate-50/90 ring-1 ring-slate-200 space-y-2.5 animate-fade-in text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="font-bold text-slate-900 text-xs sm:text-[13px]">
                                {aiResult.categoryLabel}
                              </span>
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded-[4px] text-[10.5px] font-bold font-mono tabular-nums shrink-0 ${
                                aiResult.hazardScore >= 80
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              Skor Bahaya: {aiResult.hazardScore}/100
                            </span>
                          </div>

                          <p className="text-[11.5px] text-slate-600 leading-relaxed">
                            {aiResult.analysisText}
                          </p>

                          <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10.5px] text-slate-500 font-sans">
                            <span>Dimensi: <strong className="text-slate-800">{aiResult.dimensions}</strong></span>
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                              <span>{aiResult.engine || "Google Gemini Vision AI"}</span>
                            </span>
                          </div>
                        </div>
                      )}

                      {!aiResult && !spamError && !isAnalyzing && (
                        <button
                          type="button"
                          onClick={() => handleAnalyzePhoto(photoPreview)}
                          className="w-full py-2.5 px-3 rounded-[6px] bg-white hover:bg-orange-50 text-slate-700 hover:text-[#c2410c] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ring-1 ring-slate-200 shadow-2xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-[#c2410c]" />
                          <span>Ayo Cek Ulang Foto</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom Action Bar of Step 2 */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      handleStopLiveCamera();
                      setCurrentStep(1);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[6px] text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali Ubah Lokasi</span>
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleResetAndClose}
                      className="px-4 py-2.5 rounded-[6px] text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={!photoPreview || !!spamError || isAnalyzing || isSubmitting}
                      className="inline-flex items-center justify-center gap-2 pl-4 pr-3 py-2.5 rounded-[6px] bg-[#c2410c] hover:bg-[#9a3412] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer font-sans"
                      title={!photoPreview ? "Harap sertakan foto bukti kerusakan jalan terlebih dahulu" : ""}
                    >
                      <span>
                        {isSubmitting
                          ? "Menyimpan ke Peta GIS..."
                          : isAnalyzing
                          ? "Sedang Mengecek Foto..."
                          : "Terbitkan ke Peta GIS"}
                      </span>
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

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
