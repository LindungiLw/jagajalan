"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  ExternalLink,
  ChevronRight,
  X,
  Eye,
  Check,
  LogOut,
  UserCheck,
  BadgeCheck,
  LayoutGrid,
  List,
  MapPin,
} from "lucide-react";

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
  const [mounted, setMounted] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState(
    currentOfficer?.authorityLevel || "ALL"
  );
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("HAZARD"); // HAZARD | SLA | UPVOTES | DATE
  const [activeReportToEdit, setActiveReportToEdit] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" (5 kolom) | "list" (baris rinci)

  useEffect(() => {
    setMounted(true);
  }, []);

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
        const matchAuth =
          selectedAuthority === "ALL" ||
          r.authority === selectedAuthority ||
          (selectedAuthority === "KOTA_KAB" && (r.authority === "KOTA" || r.authority === "KABUPATEN" || r.authority === "KOTA_KAB"));
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
      setOfficerName(`${currentOfficer.name || "Petugas Demo"} (ID: ${currentOfficer.id || "DEMO-001"})`);
    } else {
      setOfficerName("Petugas Demo (ID: DEMO-001)");
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

    setTimeout(() => setIsSuccessToast(false), 3500);
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 animate-fade-in">
      {/* 1. Active Authenticated Session Bar */}
      <div className="bg-white text-slate-800 p-4 sm:p-5 rounded-[6px] ring-1 ring-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[6px] bg-slate-50 border border-slate-200 p-1.5 shadow-2xs flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon/profile.png"
              alt="Profil Petugas"
              width={28}
              height={28}
              style={{ width: "28px", height: "28px" }}
              className="w-7 h-7 object-contain"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">{currentOfficer?.name || "Petugas Demo"}</span>
              <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                ID: {currentOfficer?.id || currentOfficer?.nip || "DEMO-001"}
              </span>
              {currentOfficer?.authorityLevel && (
                <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-sans font-bold uppercase tracking-wider border ${
                  currentOfficer.authorityLevel === "NASIONAL"
                    ? "bg-blue-50 text-blue-800 border-blue-200"
                    : currentOfficer.authorityLevel === "PROVINSI"
                    ? "bg-purple-50 text-purple-800 border-purple-200"
                    : currentOfficer.authorityLevel === "KOTA"
                    ? "bg-teal-50 text-teal-800 border-teal-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}>
                  Tingkat {currentOfficer.authorityLevel}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-sans tabular-nums mt-1 flex flex-wrap items-center gap-1.5">
              <span>{currentOfficer?.institution || "Kementerian Pekerjaan Umum (BBPJN)"}</span>
              <span className="text-slate-300">•</span>
              <span>{currentOfficer?.title || "Pengawas Preservasi Jalan"}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSwitchToMap}
            className="px-3.5 py-2 rounded-[6px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#c2410c]" />
            <span>Pratinjau Peta Publik</span>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-[6px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Keluar dari sesi verifikator dinas"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Keluar (Logout)</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {isSuccessToast && (
        <div className="p-4 rounded-[6px] bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2.5 text-xs font-semibold font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pembaruan status &amp; dokumentasi bukti pengerjaan berhasil disinkronkan ke peta publik!</span>
          </div>
          <span className="text-[11px] font-sans font-medium text-emerald-800">Audit Trail Terverifikasi</span>
        </div>
      )}

      {/* 4 Status KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Counter 1: Butuh Verifikasi */}
        <div
          onClick={() => setSelectedStatusFilter("NEED_VERIFY")}
          className={`cursor-pointer p-4 rounded-[6px] transition-all ${
            selectedStatusFilter === "NEED_VERIFY"
              ? "bg-amber-50 ring-2 ring-amber-400"
              : "bg-white ring-1 ring-orange-200/50 hover:ring-orange-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase text-amber-700 font-sans">Butuh Verifikasi</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2.5">
            <span className="text-3xl font-bold font-sans tabular-nums text-slate-900">{stats.needVerify}</span>
          </div>
        </div>

        {/* Counter 2: Dalam Penanganan */}
        <div
          onClick={() => setSelectedStatusFilter("IN_PROGRESS")}
          className={`cursor-pointer p-4 rounded-[6px] transition-all ${
            selectedStatusFilter === "IN_PROGRESS"
              ? "bg-orange-50 ring-2 ring-orange-400 text-orange-900"
              : "bg-white ring-1 ring-orange-200/50 hover:ring-orange-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase text-orange-800 font-sans">Dalam Pengerjaan</span>
            <HardHat className="w-4 h-4 text-[#c2410c]" />
          </div>
          <div className="mt-2.5">
            <span className="text-3xl font-bold font-sans tabular-nums text-slate-900">{stats.inProgress}</span>
          </div>
        </div>

        {/* Counter 3: Selesai */}
        <div
          onClick={() => setSelectedStatusFilter("COMPLETED")}
          className={`cursor-pointer p-4 rounded-[6px] transition-all ${
            selectedStatusFilter === "COMPLETED"
              ? "bg-emerald-50 ring-2 ring-emerald-400"
              : "bg-white ring-1 ring-orange-200/50 hover:ring-orange-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase text-emerald-700 font-sans">Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2.5">
            <span className="text-3xl font-bold font-sans tabular-nums text-emerald-800">{stats.completed}</span>
          </div>
        </div>

        {/* Counter 4: Lewat Batas Respons */}
        <div
          onClick={() => setSelectedStatusFilter("OVERDUE")}
          className={`cursor-pointer p-4 rounded-[6px] transition-all ${
            selectedStatusFilter === "OVERDUE"
              ? "bg-rose-50 ring-2 ring-rose-400"
              : "bg-white ring-1 ring-orange-200/50 hover:ring-orange-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase text-rose-700 font-sans">Lewat Batas Respons</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2.5">
            <span className="text-3xl font-bold font-sans tabular-nums text-rose-700">{stats.overdue}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white p-4 rounded-[6px] ring-1 ring-orange-200/50 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Authority Selection */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-medium">
          <span className="text-slate-500 mr-1 hidden sm:inline">Instansi Anda:</span>
          <button
            onClick={() => setSelectedAuthority("ALL")}
            className={`px-3 py-1.5 rounded-[6px] transition-all cursor-pointer ${
              selectedAuthority === "ALL"
                ? "bg-[#c2410c] text-white font-bold shadow-2xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Semua Dinas
          </button>
          <button
            onClick={() => setSelectedAuthority("NASIONAL")}
            className={`px-3 py-1.5 rounded-[6px] transition-all cursor-pointer ${
              selectedAuthority === "NASIONAL"
                ? "bg-blue-600 text-white font-bold shadow-2xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            BBPJN (Nasional)
          </button>
          <button
            onClick={() => setSelectedAuthority("PROVINSI")}
            className={`px-3 py-1.5 rounded-[6px] transition-all cursor-pointer ${
              selectedAuthority === "PROVINSI"
                ? "bg-purple-600 text-white font-bold shadow-2xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Bina Marga (Provinsi)
          </button>
          <button
            onClick={() => setSelectedAuthority("KOTA")}
            className={`px-3 py-1.5 rounded-[6px] transition-all cursor-pointer ${
              selectedAuthority === "KOTA"
                ? "bg-teal-600 text-white font-bold shadow-2xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            PUPR (Kota)
          </button>
          <button
            onClick={() => setSelectedAuthority("KABUPATEN")}
            className={`px-3 py-1.5 rounded-[6px] transition-all cursor-pointer ${
              selectedAuthority === "KABUPATEN"
                ? "bg-emerald-600 text-white font-bold shadow-2xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            PUPR (Kabupaten)
          </button>
        </div>

        {/* Sort Dropdown & Status Reset */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium hidden sm:inline">Urutan Antrean:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-[6px] bg-slate-50 ring-1 ring-orange-200/50 text-slate-800 text-xs focus:outline-none focus:bg-white focus:ring-1.5 focus:ring-orange-600 font-sans"
          >
            <option value="HAZARD">Prioritas Hazard Score AI (Tertinggi)</option>
            <option value="SLA">Kritis Batas Waktu SLA (Terancam Lewat Tenggat)</option>
            <option value="UPVOTES">Dukungan Warga (Upvotes Terbanyak)</option>
            <option value="DATE">Laporan Terbaru</option>
          </select>

          {selectedStatusFilter !== "ALL" && (
            <button
              onClick={() => setSelectedStatusFilter("ALL")}
              className="px-2.5 py-1.5 rounded-[6px] bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Reports Queue List */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pt-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-sm sm:text-base font-bold font-heading text-slate-900 tracking-tight">
              Daftar Antrean Tiket Lapangan
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-sans bg-orange-100/70 text-orange-900 border border-orange-200/70">
              {filteredReports.length} Tiket
            </span>
          </div>

          {/* View Mode Toggle: Grid 5 Kolom vs Baris Rinci */}
          <div className="flex items-center gap-2 self-start sm:self-auto font-sans">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Tampilan Admin:</span>
            <div className="inline-flex items-center border border-slate-200 bg-white rounded-[6px] overflow-hidden p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#c2410c] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Tampilan Grid Kotak 5 Kolom (Foto, Tanggal, Lokasi)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid 5 Kolom</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#c2410c] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Tampilan Baris Rinci (Lengkap dengan Hazard Score & Riwayat Audit)"
              >
                <List className="w-3.5 h-3.5" />
                <span>Baris Rinci</span>
              </button>
            </div>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="bg-white p-10 rounded-[6px] ring-1 ring-orange-200/50 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Tidak ada antrean dalam kategori ini</h4>
            <p className="text-xs text-slate-500">Semua laporan untuk filter ini telah diproses dengan baik.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {filteredReports.map((report) => {
              const isOverdue = report.status === "OVERDUE";
              const isDone = report.status === "SELESAI";
              const isInProgress = report.status === "DALAM_PENGERJAAN";

              const statusBadge = isOverdue
                ? { text: `LEWAT SLA (+${report.daysOverdue}H)`, cls: "bg-rose-600 text-white shadow-xs font-bold" }
                : isDone
                ? { text: "SELESAI", cls: "bg-emerald-600 text-white shadow-xs font-bold" }
                : isInProgress
                ? { text: "DIKERJAKAN", cls: "bg-orange-600 text-white shadow-xs font-bold" }
                : { text: "VERIFIKASI", cls: "bg-amber-600 text-white shadow-xs font-bold" };

              return (
                <div
                  key={report.id}
                  onClick={() => handleOpenActionModal(report)}
                  className={`group bg-white rounded-[8px] border transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                    isOverdue
                      ? "border-rose-300 ring-1 ring-rose-200/50"
                      : isDone
                      ? "border-emerald-300 ring-1 ring-emerald-200/50"
                      : isInProgress
                      ? "border-orange-300 ring-1 ring-orange-200/50"
                      : "border-slate-200 hover:border-orange-400"
                  }`}
                >
                  {/* Top Section: Photo + Badges */}
                  <div>
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={report.photoUrl}
                        alt={report.roadName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/25 pointer-events-none" />

                      {/* Floating Badges */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
                        <span className={`px-2 py-0.5 rounded-[4px] text-[9px] uppercase tracking-wider font-sans ${statusBadge.cls}`}>
                          {statusBadge.text}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-mono font-bold bg-black/60 backdrop-blur-xs text-white border border-white/20">
                          {report.ticketCode}
                        </span>
                      </div>

                      {/* Completed Proof Indicator */}
                      {report.proofPhotoUrl && (
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Foto Bukti</span>
                        </span>
                      )}
                    </div>

                    {/* Content: Tanggal & Lokasi */}
                    <div className="p-3 space-y-1.5">
                      {/* Tanggal */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-sans">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {new Date(report.reportDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Ruas Jalan & Alamat */}
                      <div>
                        <h4
                          className="font-bold text-slate-900 text-xs sm:text-[13px] leading-snug line-clamp-1 group-hover:text-[#c2410c] transition-colors"
                          title={report.roadName}
                        >
                          {report.roadName}
                        </h4>
                        <div
                          className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5"
                          title={report.address}
                        >
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="line-clamp-1">{report.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Strip */}
                  <div className="px-3 pb-3 pt-1 border-t border-slate-100/80 mt-1">
                    <button
                      type="button"
                      className="w-full py-1.5 px-2.5 rounded-[6px] text-[11px] font-bold text-slate-700 bg-slate-50 group-hover:bg-[#c2410c] group-hover:text-white border border-slate-200 group-hover:border-transparent transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span>Kelola Disposisi</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
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
                  className={`bg-white p-5 rounded-[6px] border transition-all shadow-2xs ${
                    isOverdue
                      ? "border-rose-300 border-l-4 border-l-rose-600"
                      : isDone
                      ? "border-emerald-300 border-l-4 border-l-emerald-600"
                      : isInProgress
                      ? "border-orange-300 border-l-4 border-l-orange-500"
                      : "border-amber-300 border-l-4 border-l-amber-500"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: Info & Photos */}
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                      {/* Photo Thumbnail */}
                      <div className="relative w-full sm:w-40 h-28 rounded-[6px] overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={report.photoUrl}
                          alt="Bukti Laporan"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-[#c2410c] text-white shadow-xs">
                          Foto Warga (Before)
                        </span>

                        {report.proofPhotoUrl && (
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-emerald-600 text-white shadow-xs">
                            ✓ Bukti Selesai
                          </span>
                        )}
                      </div>

                      {/* Detail Text */}
                      <div className="space-y-1.5 flex-1 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-sans tabular-nums font-bold text-slate-900 px-2 py-0.5 rounded-[4px] bg-slate-100 border border-slate-200 text-[11px]">
                            {report.ticketCode}
                          </span>

                          {/* Status Badge */}
                          {isOverdue && (
                            <span className="px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              LEWAT TENGGAT (+{report.daysOverdue} HARI)
                            </span>
                          )}
                          {isDone && (
                            <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              PENANGANAN SELESAI
                            </span>
                          )}
                          {isInProgress && (
                            <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
                              DALAM PENGERJAAN FISIK
                            </span>
                          )}
                          {report.status === "MENUNGGU_VERIFIKASI" && (
                            <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
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
                          <span className="px-2 py-0.5 rounded-[4px] bg-slate-100 font-semibold text-slate-800 border border-slate-200">
                            {report.categoryLabel}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-[4px] font-bold ${
                              report.hazardScore >= 80
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            Skor Bahaya AI: {report.hazardScore}/100
                          </span>
                          <span className="text-[#c2410c] font-medium">
                            Pagu APBD: Rp {((report.matchingBudget?.paguRp || 0) / 1000000000).toFixed(1)} Miliar ({report.matchingBudget?.packageName || "Pemeliharaan Jalan"})
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-[6px] ring-1 ring-orange-200/40">
                          {report.aiAnalysis}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <button
                        onClick={() => handleOpenActionModal(report)}
                        className="w-full sm:w-auto px-4 py-2 rounded-[6px] text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <HardHat className="w-3.5 h-3.5 text-white" />
                        <span>Proses Tindak Lanjut Dinas</span>
                      </button>

                      <button
                        onClick={onSwitchToMap}
                        className="w-full sm:w-auto px-3 py-2 rounded-[6px] text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 ring-1 ring-orange-200/50 flex items-center justify-center gap-1 transition-colors cursor-pointer"
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
                        <span className="text-[10px] text-slate-400 font-sans">Tiket Terverifikasi Selesai</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 max-w-md">
                        <div className="space-y-1">
                          <div className="h-24 rounded-[6px] overflow-hidden border border-slate-300 bg-slate-100">
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
                          <div className="h-24 rounded-[6px] overflow-hidden border border-emerald-400 ring-2 ring-emerald-400/20 bg-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={report.proofPhotoUrl}
                              alt="After"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-[10px] font-bold text-emerald-800 block text-center">
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
                    <span>Tenggat Tanggapan Resmi Dinas</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Minimalist Admin Footer */}
      <footer className="mt-8 pt-4 pb-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-sans">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">© 2026 JagaJalan</span>
          <span className="text-slate-300">•</span>
          <span>Portal Administrasi &amp; Disposisi Operasional Penyelenggara Jalan</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="font-mono">Sistem Terintegrasi v2.4</span>
        </div>
      </footer>

      {/* Action Modal / Drawer for Officer (PORTALED TO ROOT BODY Z-[2000]) */}
      {mounted && activeReportToEdit && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
          <div className="w-full max-w-2xl rounded-[8px] bg-slate-100/80 p-2 sm:p-2.5 ring-1 ring-orange-200/60 shadow-2xl">
            <div className="relative w-full max-h-[88vh] flex flex-col rounded-[6px] bg-white ring-1 ring-orange-200/50 overflow-hidden">
              {/* Modal Header (Orange with White Text) */}
              <div className="p-4 sm:p-5 bg-[#c2410c] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[6px] bg-white/15 flex items-center justify-center text-white shrink-0">
                    <HardHat className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-white text-base">Tindak Lanjut &amp; Verifikasi Dinas</h3>
                      <span className="px-2 py-0.5 rounded-[4px] font-sans tabular-nums text-[10px] font-bold bg-white/20 text-white">
                        {activeReportToEdit.ticketCode}
                      </span>
                    </div>
                    <p className="text-xs text-orange-100">{activeReportToEdit.roadName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveReportToEdit(null)}
                  className="p-1.5 rounded-[6px] text-orange-100 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
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
                      className={`p-3 rounded-[6px] border text-left transition-all cursor-pointer ${
                        targetStatus === "DALAM_PENGERJAAN"
                          ? "bg-orange-50 border-orange-300 ring-2 ring-orange-300/30 text-orange-950"
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        <HardHat className="w-3.5 h-3.5 text-[#c2410c]" />
                        <span>Dalam Penanganan Fisik</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Material/tim telah dikerahkan ke lokasi jalan. Menghentikan indikator keterlambatan.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetStatus("SELESAI")}
                      className={`p-3 rounded-[6px] border text-left transition-all cursor-pointer ${
                        targetStatus === "SELESAI"
                          ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20 text-emerald-950"
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
                      Identitas Petugas (Mode Demonstrasi)
                    </label>
                    <input
                      type="text"
                      required
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      placeholder="Contoh: Petugas Demo (ID: DEMO-001)"
                      className="w-full px-3 py-2 rounded-[6px] bg-slate-50 ring-1 ring-orange-200/50 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-1.5 focus:ring-orange-600"
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
                      className="w-full px-3 py-2 rounded-[6px] bg-slate-100 ring-1 ring-orange-200/40 text-xs text-slate-600 cursor-not-allowed font-medium"
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
                    className="w-full px-3 py-2 rounded-[6px] bg-slate-50 ring-1 ring-orange-200/50 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-1.5 focus:ring-orange-600"
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
                        className={`px-2.5 py-1 rounded-[6px] shrink-0 border transition-all cursor-pointer ${
                          proofPhotoUrl === proof.url
                            ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {proof.label}
                      </button>
                    ))}
                  </div>

                  {/* Side-by-side Before vs After Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-[6px] bg-slate-50 ring-1 ring-orange-200/50">
                    {/* Before */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-600">Foto Laporan Warga (BEFORE)</span>
                      <div className="h-32 rounded-[6px] overflow-hidden border border-slate-200 bg-slate-100">
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
                      <span className="text-[11px] font-bold text-emerald-900">
                        Hasil Pengerjaan Dinas (AFTER)
                      </span>
                      <div className="relative h-32 rounded-[6px] overflow-hidden border border-emerald-400 ring-2 ring-emerald-400/20 bg-slate-100">
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
                    className="w-full py-2.5 px-4 rounded-[6px] font-bold text-xs text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Simpan Perubahan &amp; Terbitkan Bukti ke Publik</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
