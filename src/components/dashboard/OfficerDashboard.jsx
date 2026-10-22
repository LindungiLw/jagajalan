"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ShieldAlert,
  HardHat,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Camera,
  ArrowRight,
  Filter,
  FileCheck,
  Building2,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  Eye,
  Check,
  LogOut,
  UserCheck,
  BadgeCheck,
} from "lucide-react";
import confetti from "canvas-confetti";

// Preset photos of finished road repairs for rapid pitching demonstration
const PRESET_PROOF_PHOTOS = [
  {
    label: "Penambalan Hotmix Mulus",
    url: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
    desc: "Permukaan aspal baru selesai dipadatkan",
  },
  {
    label: "Perataan & Beton Penutup",
    url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80",
    desc: "Pengecoran struktural bahu jalan selesai",
  },
  {
    label: "Marka & Pengaspalan Ulang",
    url: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80",
    desc: "Lajur jalan rapi dan siap dilintasi",
  },
];

export default function OfficerDashboard({
  reports,
  onUpdateReport,
  onSwitchToMap,
  currentOfficer,
  onLogout,
}) {
  const [selectedAuthority, setSelectedAuthority] = useState(
    currentOfficer?.authorityLevel || "ALL"
  );
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("HAZARD"); // HAZARD | SLA | UPVOTES | DATE
  const [activeReportToEdit, setActiveReportToEdit] = useState(null);

  // Form states in action modal
  const [targetStatus, setTargetStatus] = useState("DALAM_PENGERJAAN");
  const [officerNote, setOfficerNote] = useState("");
  const [officerName, setOfficerName] = useState(
    currentOfficer
      ? `${currentOfficer.name} (NIP: ${currentOfficer.nip})`
      : "Satgas Bina Marga / UPTD Wilayah"
  );
  const [proofPhotoUrl, setProofPhotoUrl] = useState(PRESET_PROOF_PHOTOS[0].url);
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  useEffect(() => {
    if (currentOfficer) {
      setOfficerName(`${currentOfficer.name} (NIP: ${currentOfficer.nip})`);
    }
  }, [currentOfficer]);

  const fileInputRef = useRef(null);

  // Authority filter
  const filteredReports = useMemo(() => {
    return reports
      .filter((r) => {
        const matchAuth = selectedAuthority === "ALL" || r.authority === selectedAuthority;
        const matchStatus =
          selectedStatusFilter === "ALL" ||
          (selectedStatusFilter === "NEED_VERIFY" && r.status === "MENUNGGU_VERIFIKASI") ||
          (selectedStatusFilter === "IN_PROGRESS" && r.status === "DALAM_PENGERJAAN") ||
          (selectedStatusFilter === "COMPLETED" && r.status === "SELESAI") ||
          (selectedStatusFilter === "OVERDUE" && r.status === "OVERDUE");
        return matchAuth && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === "HAZARD") return (b.hazardScore || 0) - (a.hazardScore || 0);
        if (sortBy === "UPVOTES") return (b.upvotes || 0) - (a.upvotes || 0);
        if (sortBy === "DATE") return new Date(b.reportDate) - new Date(a.reportDate);
        if (sortBy === "SLA") {
          return (b.daysOverdue || 0) - (a.daysOverdue || 0);
        }
        return 0;
      });
  }, [reports, selectedAuthority, selectedStatusFilter, sortBy]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = reports.length;
    const needVerify = reports.filter((r) => r.status === "MENUNGGU_VERIFIKASI").length;
    const inProgress = reports.filter((r) => r.status === "DALAM_PENGERJAAN").length;
    const completed = reports.filter((r) => r.status === "SELESAI").length;
    const overdue = reports.filter((r) => r.status === "OVERDUE").length;
    return { total, needVerify, inProgress, completed, overdue };
  }, [reports]);

  const handleOpenActionModal = (report) => {
    setActiveReportToEdit(report);
    if (currentOfficer) {
      setOfficerName(`${currentOfficer.name} (NIP: ${currentOfficer.nip})`);
    }
    // Suggest next logical status
    if (report.status === "MENUNGGU_VERIFIKASI") {
      setTargetStatus("DALAM_PENGERJAAN");
      setOfficerNote("Laporan telah diverifikasi oleh petugas UPTD. Dijadwalkan pengerjaan pemeliharaan rutin.");
    } else if (report.status === "DALAM_PENGERJAAN" || report.status === "OVERDUE") {
      setTargetStatus("SELESAI");
      setOfficerNote("Pekerjaan penambalan aspal dan pemadatan selesai dilaksanakan di lapangan.");
    } else {
      setTargetStatus("SELESAI");
      setOfficerNote("Pekerjaan telah terverifikasi rampung dan siap diperiksa kembali.");
    }
    setProofPhotoUrl(report.proofPhotoUrl || PRESET_PROOF_PHOTOS[0].url);
  };

  const handleCustomProofUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProofPhotoUrl(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUpdate = (e) => {
    e.preventDefault();
    if (!activeReportToEdit) return;

    const isNowDone = targetStatus === "SELESAI";

    const newAuditUpdate = {
      date: new Date().toISOString(),
      officer: officerName.trim() || "Verifikator Resmi Dinas",
      note: officerNote.trim() || "Pembaruan progres pengerjaan lapangan.",
      proofPhotoUrl: isNowDone ? proofPhotoUrl : null,
    };

    const updatedData = {
      status: targetStatus,
      progressStatus: targetStatus,
      isResponseOverdue: targetStatus === "SELESAI" ? false : activeReportToEdit.isResponseOverdue,
      daysOverdue: targetStatus === "SELESAI" ? 0 : activeReportToEdit.daysOverdue,
      proofPhotoUrl: isNowDone ? proofPhotoUrl : activeReportToEdit.proofPhotoUrl,
      updates: [newAuditUpdate, ...(activeReportToEdit.updates || [])],
    };

    onUpdateReport(activeReportToEdit.id, updatedData);
    setActiveReportToEdit(null);
    setIsSuccessToast(true);

    if (isNowDone) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
    }

    setTimeout(() => setIsSuccessToast(false), 3500);
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* 1. Active Authenticated Session Bar (Clean White + Orange Theme, Strict 5px radius) */}
      <div className="bg-white text-slate-800 p-4 sm:p-5 rounded-[5px] border border-orange-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[5px] bg-orange-100 text-[#c2410c] border border-orange-200 font-mono font-bold text-sm flex items-center justify-center shrink-0">
            {currentOfficer?.avatar || "ASN"}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">{currentOfficer?.name || "Aparatur Dinas Terverifikasi"}</span>
              <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sesi Aktif Terotentikasi</span>
              </span>
              {currentOfficer?.authorityLevel && (
                <span className={`px-2 py-0.5 rounded-[5px] text-[10px] font-mono font-bold uppercase tracking-wider ${
                  currentOfficer.authorityLevel === "NASIONAL"
                    ? "bg-orange-50 text-orange-900 border border-orange-200"
                    : currentOfficer.authorityLevel === "PROVINSI"
                    ? "bg-amber-50 text-amber-900 border border-amber-200"
                    : "bg-stone-100 text-stone-800 border border-stone-200"
                }`}>
                  Tingkat {currentOfficer.authorityLevel}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 font-mono mt-0.5">
              NIP: {currentOfficer?.nip || "-"} • {currentOfficer?.institution || "Penyelenggara Jalan Resmi"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSwitchToMap}
            className="px-3 py-1.5 rounded-[5px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-orange-700" />
            <span>Pratinjau Peta Publik</span>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-[5px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Keluar dari sesi verifikator dinas"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Keluar (Logout)</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Institutional Operation Notice */}
      <div className="bg-white p-5 sm:p-6 rounded-[5px] border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-[5px] bg-orange-50 text-orange-800 border border-orange-200 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-orange-700" />
              <span>Panel Operasional Disposisi & Verifikasi Bukti Fisik</span>
            </span>
            <span className="px-2 py-0.5 rounded-[5px] bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold font-sans">
              Kepatuhan UU No. 25/2009 (SLA 14 Hari)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-slate-900">
            Daftar Antrean Tindak Lanjut Penyelenggara Jalan
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Perbarui tahapan pengerjaan fisik di lapangan sebelum batas tenggat SLA terlampaui. Setiap tiket yang diselesaikan wajib melampirkan dokumentasi foto bukti pengerjaan (*Before-After*) untuk membatalkan draf eskalasi Ombudsman RI.
          </p>
        </div>

        <div className="p-3 rounded-[5px] bg-slate-50 border border-slate-200 text-xs shrink-0 font-mono space-y-1">
          <div className="text-[10px] text-slate-400 uppercase">Instansi Aktif:</div>
          <div className="font-bold text-slate-900">{currentOfficer?.institution || "BBPJN • DBMPR • PUPR"}</div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 font-sans">
            <Check className="w-3 h-3" />
            <span>Kewenangan Disposisi Sah</span>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {isSuccessToast && (
        <div className="p-4 rounded-[5px] bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5 text-xs font-semibold font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pembaruan status & dokumentasi bukti pengerjaan berhasil disinkronkan ke peta publik!</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-700">Audit Trail Terverifikasi</span>
        </div>
      )}

      {/* 4 Status KPI Counters (Strict 5px radius) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Counter 1: Butuh Verifikasi */}
        <div
          onClick={() => setSelectedStatusFilter("NEED_VERIFY")}
          className={`cursor-pointer p-4 rounded-[5px] border transition-all ${
            selectedStatusFilter === "NEED_VERIFY"
              ? "bg-amber-50 border-amber-400 ring-2 ring-amber-400/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase text-amber-700 font-sans">Butuh Verifikasi</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-sans tabular-nums text-slate-900">{stats.needVerify}</span>
            <span className="text-xs text-slate-500 font-sans">laporan baru</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600 font-sans">Perlu disposisi tim lapangan UPTD</p>
        </div>

        {/* Counter 2: Dalam Penanganan */}
        <div
          onClick={() => setSelectedStatusFilter("IN_PROGRESS")}
          className={`cursor-pointer p-4 rounded-[5px] border transition-all ${
            selectedStatusFilter === "IN_PROGRESS"
              ? "bg-orange-50 border-orange-300 ring-2 ring-orange-300/30 text-orange-900"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase text-orange-800 font-sans">Dalam Pengerjaan</span>
            <HardHat className="w-4 h-4 text-orange-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-sans tabular-nums text-slate-900">{stats.inProgress}</span>
            <span className="text-xs text-slate-500 font-sans">pekerjaan fisik</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600 font-sans">Sedang ditambal/overlay di lapangan</p>
        </div>

        {/* Counter 3: Selesai Diperbaiki */}
        <div
          onClick={() => setSelectedStatusFilter("COMPLETED")}
          className={`cursor-pointer p-4 rounded-[5px] border transition-all ${
            selectedStatusFilter === "COMPLETED"
              ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase text-emerald-700 font-sans">Selesai (+Foto Bukti)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-sans tabular-nums text-slate-900">{stats.completed}</span>
            <span className="text-xs text-slate-500 font-sans">tiket ditutup</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600 font-sans">Terbukti dengan foto before-after</p>
        </div>

        {/* Counter 4: Overdue SLA */}
        <div
          onClick={() => setSelectedStatusFilter("OVERDUE")}
          className={`cursor-pointer p-4 rounded-[5px] border transition-all ${
            selectedStatusFilter === "OVERDUE"
              ? "bg-rose-50 border-rose-400 ring-2 ring-rose-400/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase text-rose-700 font-sans">Keterlambatan (Overdue)</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-sans tabular-nums text-rose-700">{stats.overdue}</span>
            <span className="text-xs text-slate-500 font-sans">&gt;14 hari tanpa tanggapan</span>
          </div>
          <p className="mt-1 text-[11px] text-rose-600 font-sans">Objek pengawasan Ombudsman RI</p>
        </div>
      </div>

      {/* Filter Toolbar Card (Strict 5px radius) */}
      <div className="bg-white p-4 sm:p-4.5 rounded-[5px] border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Authority Selection */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-medium">
          <span className="text-slate-500 mr-1 hidden sm:inline">Instansi Anda:</span>
          <button
            onClick={() => setSelectedAuthority("ALL")}
            className={`px-3 py-1.5 rounded-[5px] transition-all cursor-pointer ${
              selectedAuthority === "ALL"
                ? "bg-[#c2410c] text-white font-bold shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Semua Dinas
          </button>
          <button
            onClick={() => setSelectedAuthority("NASIONAL")}
            className={`px-3 py-1.5 rounded-[5px] transition-all cursor-pointer ${
              selectedAuthority === "NASIONAL"
                ? "bg-[#c2410c] text-white font-bold shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            BBPJN (Nasional)
          </button>
          <button
            onClick={() => setSelectedAuthority("PROVINSI")}
            className={`px-3 py-1.5 rounded-[5px] transition-all cursor-pointer ${
              selectedAuthority === "PROVINSI"
                ? "bg-amber-700 text-white font-bold shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Bina Marga (Provinsi)
          </button>
          <button
            onClick={() => setSelectedAuthority("KOTA_KAB")}
            className={`px-3 py-1.5 rounded-[5px] transition-all cursor-pointer ${
              selectedAuthority === "KOTA_KAB"
                ? "bg-stone-700 text-white font-bold shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            PUPR (Kota/Kab)
          </button>
        </div>

        {/* Sort Dropdown & Status Reset */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium hidden sm:inline">Urutan Antrean:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-[5px] bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:bg-white focus:ring-1.5 focus:ring-orange-600 font-mono"
          >
            <option value="HAZARD">Prioritas Hazard Score AI (Tertinggi)</option>
            <option value="SLA">Kritis Batas Waktu SLA (Terancam Overdue)</option>
            <option value="UPVOTES">Dukungan Warga (Upvotes Terbanyak)</option>
            <option value="DATE">Laporan Terbaru</option>
          </select>

          {selectedStatusFilter !== "ALL" && (
            <button
              onClick={() => setSelectedStatusFilter("ALL")}
              className="px-2.5 py-1.5 rounded-[5px] bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Reports Queue List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Menampilkan <strong>{filteredReports.length}</strong> tiket penanganan dinas
          </span>
          <span className="font-mono text-[11px]">SOP Standar Kepatuhan: 14 Hari Kerja</span>
        </div>

        {filteredReports.length === 0 ? (
          <div className="bg-white p-10 rounded-[5px] border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Tidak ada antrean dalam kategori ini</h4>
            <p className="text-xs text-slate-500">Semua laporan untuk filter ini telah diproses dengan baik.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredReports.map((report) => {
              const isOverdue = report.status === "OVERDUE";
              const isDone = report.status === "SELESAI";
              const isInProgress = report.status === "DALAM_PENGERJAAN";

              return (
                <div
                  key={report.id}
                  className={`bg-white p-5 rounded-[5px] border transition-all ${
                    isOverdue
                      ? "border-rose-300 border-l-4 border-l-rose-600 shadow-xs"
                      : isDone
                      ? "border-emerald-300 border-l-4 border-l-emerald-600 shadow-xs"
                      : isInProgress
                      ? "border-orange-300 border-l-4 border-l-orange-500 shadow-xs"
                      : "border-amber-300 border-l-4 border-l-amber-500 shadow-xs"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: Info & Photos */}
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                      {/* Photo Thumbnail */}
                      <div className="relative w-full sm:w-40 h-28 rounded-[5px] overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={report.photoUrl}
                          alt="Bukti Laporan"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold bg-slate-800/80 text-white backdrop-blur-xs">
                          Foto Warga (Before)
                        </span>

                        {report.proofPhotoUrl && (
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold bg-emerald-600 text-white shadow-xs">
                            ✓ Ada Bukti Selesai
                          </span>
                        )}
                      </div>

                      {/* Detail Text */}
                      <div className="space-y-1.5 flex-1 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 px-2 py-0.5 rounded-[5px] bg-slate-100 border border-slate-200 text-[11px]">
                            {report.ticketCode}
                          </span>

                          {/* Status Badge */}
                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              OVERDUE +{report.daysOverdue} HARI KERJA
                            </span>
                          )}
                          {isDone && (
                            <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              PENANGANAN SELESAI
                            </span>
                          )}
                          {isInProgress && (
                            <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
                              DALAM PENGERJAAN FISIK
                            </span>
                          )}
                          {report.status === "MENUNGGU_VERIFIKASI" && (
                            <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                              MENUNGGU VERIFIKASI DISPOSISI
                            </span>
                          )}

                          <span className="text-[11px] font-bold text-slate-700">
                            Wewenang: {report.authorityLabel}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-slate-900 text-base">{report.roadName}</h3>
                        <p className="text-slate-500 text-[11px]">
                          Lokasi: {report.address} • Pelapor: {report.reporterName} • Masuk:{" "}
                          {new Date(report.reportDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>

                        {/* AI & APBD Pills */}
                        <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded-[5px] bg-slate-100 font-semibold text-slate-800 border border-slate-200">
                            {report.categoryLabel}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-[5px] font-bold ${
                              report.hazardScore >= 80
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            Skor Bahaya AI: {report.hazardScore}/100
                          </span>
                          <span className="text-orange-700 font-medium">
                            Pagu APBD: Rp {((report.matchingBudget?.paguRp || 0) / 1000000000).toFixed(1)} Miliar ({report.matchingBudget?.packageName || "Pemeliharaan Jalan"})
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-[5px] border border-slate-200">
                          {report.aiAnalysis}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <button
                        onClick={() => handleOpenActionModal(report)}
                        className="w-full sm:w-auto px-4 py-2 rounded-[5px] text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <HardHat className="w-3.5 h-3.5 text-white" />
                        <span>Proses Tindak Lanjut Dinas</span>
                      </button>

                      <button
                        onClick={onSwitchToMap}
                        className="w-full sm:w-auto px-3 py-2 rounded-[5px] text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Buka Koordinat Peta</span>
                      </button>
                    </div>
                  </div>

                  {/* If Finished, Show Proof Comparison Preview */}
                  {report.proofPhotoUrl && (
                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Dokumentasi Bukti Fisik Lapangan (Before vs After Selesai Diperbaiki)
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Tiket Terverifikasi Selesai</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 max-w-md">
                        <div className="space-y-1">
                          <div className="h-24 rounded-[5px] overflow-hidden border border-slate-300 bg-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={report.photoUrl}
                              alt="Before"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 block text-center">
                            BEFORE: Kerusakan Awal
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="h-24 rounded-[5px] overflow-hidden border border-emerald-400 ring-2 ring-emerald-400/20 bg-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={report.proofPhotoUrl}
                              alt="After"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 block text-center">
                            AFTER: Hasil Pengerjaan Dinas
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Audit Trail Count */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      Riwayat Audit: <strong>{report.updates?.length || 1} aktivitas tercatat</strong>
                    </span>
                    <span>Tenggat Tanggapan Resmi: 14 Hari Kerja</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Modal / Drawer for Officer (Strict 5px radius) */}
      {activeReportToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-[5px] bg-white border border-slate-200 shadow-xl overflow-hidden">
            {/* Modal Header (Clean White + Warm Orange Accent) */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white text-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[5px] bg-orange-50 border border-orange-200 flex items-center justify-center text-[#c2410c]">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base">Tindak Lanjut & Verifikasi Dinas</h3>
                    <span className="px-2 py-0.5 rounded-[5px] font-mono text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
                      {activeReportToEdit.ticketCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{activeReportToEdit.roadName}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveReportToEdit(null)}
                className="p-1.5 rounded-[5px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveUpdate} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700">
              {/* Step 1: Status Change */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  1. Perbarui Tahapan Status Penanganan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetStatus("DALAM_PENGERJAAN")}
                    className={`p-3 rounded-[5px] border text-left transition-all cursor-pointer ${
                      targetStatus === "DALAM_PENGERJAAN"
                        ? "bg-orange-50 border-orange-300 ring-2 ring-orange-300/30 text-orange-950"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <HardHat className="w-3.5 h-3.5 text-orange-700" />
                      <span>Dalam Penanganan Fisik</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Material/tim telah dikerahkan ke lokasi jalan. Menghentikan indikator keterlambatan.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetStatus("SELESAI")}
                    className={`p-3 rounded-[5px] border text-left transition-all cursor-pointer ${
                      targetStatus === "SELESAI"
                        ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20 text-emerald-900"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Penanganan Selesai Diperbaiki</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Perbaikan fisik tuntas. Wajib menyertakan dokumentasi foto bukti hasil pekerjaan.
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 2: Officer Identity & Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Nama Petugas / UPTD Pelaksana
                  </label>
                  <input
                    type="text"
                    required
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    placeholder="Contoh: Ir. Hendra (Koordinator UPTD Barat)"
                    className="w-full px-3 py-2 rounded-[5px] bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-1.5 focus:ring-orange-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Instansi Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    disabled
                    value={activeReportToEdit.authorityLabel}
                    className="w-full px-3 py-2 rounded-[5px] bg-slate-100 border border-slate-200 text-xs text-slate-600 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Catatan Teknis Tindak Lanjut Lapangan
                </label>
                <textarea
                  rows={2}
                  required
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  placeholder="Deskripsikan material yang digunakan, volume penambalan, dan hasil pengerjaan..."
                  className="w-full px-3 py-2 rounded-[5px] bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-1.5 focus:ring-orange-600"
                />
              </div>

              {/* Step 3: Upload Proof of Work (Before vs After) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    2. Dokumentasi Foto Bukti Pengerjaan Fisik (After Photo)
                  </label>
                  <span className="text-[11px] text-emerald-700 font-semibold">Syarat Akuntabilitas Publik</span>
                </div>

                {/* Preset Chips */}
                <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-slate-500 shrink-0">Preset Bukti:</span>
                  {PRESET_PROOF_PHOTOS.map((proof, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProofPhotoUrl(proof.url)}
                      className={`px-2.5 py-1 rounded-[5px] shrink-0 border transition-all cursor-pointer ${
                        proofPhotoUrl === proof.url
                          ? "bg-emerald-100 border-emerald-400 text-emerald-900 font-bold"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {proof.label}
                    </button>
                  ))}
                </div>

                {/* Side-by-side Before vs After Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-[5px] bg-slate-50 border border-slate-200">
                  {/* Before */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-600">Foto Laporan Warga (BEFORE)</span>
                    <div className="h-32 rounded-[5px] overflow-hidden border border-slate-200 bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeReportToEdit.photoUrl}
                        alt="Kerusakan Awal"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* After with Upload Button */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-emerald-800">
                      Hasil Pengerjaan Dinas (AFTER)
                    </span>
                    <div className="relative h-32 rounded-[5px] overflow-hidden border border-emerald-400 ring-2 ring-emerald-400/20 bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={proofPhotoUrl}
                        alt="Bukti Hasil Perbaikan"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-slate-900/40 hover:bg-slate-900/60 text-white flex flex-col items-center justify-center gap-1 transition-all text-[11px] font-medium cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Unggah Foto Asli Lapangan</span>
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCustomProofUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-[5px] font-bold text-xs text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Simpan Perubahan & Terbitkan Bukti ke Publik</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
