"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Menu,
  X,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  CheckCheck,
  ArrowRight,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "beranda", label: "Ringkasan", icon: "/icon/jalan.png" },
  { id: "peta", label: "Peta Transparansi", icon: "/icon/maps.png" },
  { id: "data-anggaran", label: "Anggaran Proyek", icon: "/icon/financial.png" },
  { id: "ombudsman", label: "Lacak Laporan", icon: "/icon/report.png" },
  { id: "nasional", label: "Statistik", icon: "/icon/statistik_icon.png" },
];

function formatRelativeTime(isoDate) {
  if (!isoDate) return "Baru saja";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  if (Number.isNaN(diffMs) || diffMs < 60000) return "Baru saja";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return new Date(isoDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusMeta(item) {
  if (item.status === "SELESAI" || item.type === "STATUS_RESOLVED") {
    return {
      label: "Selesai",
      textClass: "text-emerald-800",
      dotClass: "bg-emerald-600",
      iconWrapClass: "bg-emerald-50 text-emerald-700",
      Icon: CheckCircle2,
      actionCue: "Peta",
    };
  }
  if (item.status === "OVERDUE" || item.type === "SLA_OVERDUE_ALERT") {
    return {
      label: "Lewat 14 Hari",
      textClass: "text-rose-700",
      dotClass: "bg-rose-600",
      iconWrapClass: "bg-rose-50 text-rose-700",
      Icon: AlertTriangle,
      actionCue: "Lacak",
    };
  }
  if (item.status === "TERVERIFIKASI" || item.type === "STATUS_VERIFIED") {
    return {
      label: "Terverifikasi",
      textClass: "text-sky-800",
      dotClass: "bg-sky-600",
      iconWrapClass: "bg-sky-50 text-sky-700",
      Icon: ShieldCheck,
      actionCue: "Peta",
    };
  }
  if (item.type === "REPORT_CREATED" || item.status === "MENUNGGU_VERIFIKASI") {
    return {
      label: "Baru Diterima",
      textClass: "text-[#9a3412]",
      dotClass: "bg-[#c2410c]",
      iconWrapClass: "bg-orange-50 text-[#c2410c]",
      Icon: MapPin,
      actionCue: "Peta",
    };
  }
  return {
    label: "Dalam Perbaikan",
    textClass: "text-amber-800",
    dotClass: "bg-amber-600",
    iconWrapClass: "bg-amber-50 text-amber-700",
    Icon: Clock,
    actionCue: "Peta",
  };
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  officerSession,
  onLogoutOfficer,
  notifications = [],
  unreadCount = 0,
  readNotificationIds = [],
  subscribedTickets = [],
  onMarkAllRead,
  onSelectNotification,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifScope, setNotifScope] = useState("personal");
  const notifContainerRef = useRef(null);

  // Auto-hide & Auto-reveal Navigation State
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const isVisibleRef = useRef(true);
  const idleTimerRef = useRef(null);
  const isHoveredRef = useRef(false);
  const notifOpenRef = useRef(false);
  const mobileMenuOpenRef = useRef(false);
  const lastScrollYRef = useRef(0);

  const setNavbarVisibility = (visible) => {
    if (isVisibleRef.current !== visible) {
      isVisibleRef.current = visible;
      setIsVisible(visible);
    }
  };

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    notifOpenRef.current = notifOpen;
    if (notifOpen) {
      setNavbarVisibility(true);
    }
  }, [notifOpen]);

  useEffect(() => {
    mobileMenuOpenRef.current = mobileMenuOpen;
    if (mobileMenuOpen) {
      setNavbarVisibility(true);
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    // Posisi puncak paling atas (posisi awal halaman)
    const TOP_RESTING_THRESHOLD = 20;
    // Jeda saat berhenti scroll sebelum navbar otomatis sembunyi (750ms)
    const STOP_SCROLL_HIDE_DELAY = 750;

    const scheduleHideOnStop = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }

      // Jangan sembunyikan jika berada di posisi puncak paling atas halaman (scrollY <= 20)
      if (typeof window !== "undefined" && window.scrollY <= TOP_RESTING_THRESHOLD) {
        setNavbarVisibility(true);
        return;
      }

      // Pasang timer: jika berhenti scroll, otomatis sembunyikan navbar
      idleTimerRef.current = setTimeout(() => {
        if (
          !isHoveredRef.current &&
          !notifOpenRef.current &&
          !mobileMenuOpenRef.current &&
          typeof window !== "undefined" &&
          window.scrollY > TOP_RESTING_THRESHOLD
        ) {
          setNavbarVisibility(false);
        }
      }, STOP_SCROLL_HIDE_DELAY);
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 1. Di posisi puncak paling atas: selalu tampilkan navbar di tempat aslinya
      if (currentScrollY <= TOP_RESTING_THRESHOLD) {
        if (idleTimerRef.current) {
          clearTimeout(idleTimerRef.current);
          idleTimerRef.current = null;
        }
        setNavbarVisibility(true);
        return;
      }

      // 2. Saat sedang scroll (baik ke atas maupun ke bawah): MUNCULKAN NAVBAR SEGERA
      setNavbarVisibility(true);

      // 3. Begitu berhenti scroll: pasang timer untuk langsung HILANG
      scheduleHideOnStop();
    };

    // Deteksi jika kursor diarahkan ke area tepi paling atas layar (<= 35px) untuk reveal manual
    const handleTopEdgeHover = (e) => {
      if (e.clientY <= 35) {
        setNavbarVisibility(true);
        scheduleHideOnStop();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleTopEdgeHover, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleTopEdgeHover);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifContainerRef.current && !notifContainerRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const personalNotifications = useMemo(() => {
    const trackedSet = new Set(subscribedTickets);
    return notifications.filter((item) => trackedSet.has(item.ticketCode));
  }, [notifications, subscribedTickets]);

  const displayedNotifications =
    notifScope === "personal" ? personalNotifications : notifications;
  const visibleNotifications = displayedNotifications.slice(0, 15);

  const isOfficerLoggedIn = Boolean(
    officerSession && officerSession.isAuthenticated && officerSession.id
  );

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setNotifOpen(false);
    setNavbarVisibility(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {activeTab !== "peta" && (
        <div className="h-16 shrink-0 pointer-events-none" aria-hidden="true" />
      )}
      <header
        onMouseEnter={() => {
          isHoveredRef.current = true;
          setIsHovered(true);
          setNavbarVisibility(true);
          if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
          }
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
          setIsHovered(false);
          if (!notifOpenRef.current && !mobileMenuOpenRef.current) {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            idleTimerRef.current = setTimeout(() => {
              if (
                !isHoveredRef.current &&
                !notifOpenRef.current &&
                !mobileMenuOpenRef.current &&
                typeof window !== "undefined" &&
                window.scrollY > 20
              ) {
                setNavbarVisibility(false);
              }
            }, 600);
          }
        }}
        className={`fixed top-0 inset-x-0 z-50 pt-3 pb-2 px-4 sm:px-6 lg:px-8 pointer-events-none transition-all duration-300 ease-in-out ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
      <div
        className={`w-full max-w-5xl mx-auto relative transition-all duration-300 ${
          isVisible ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between gap-3 h-13 px-4 sm:px-5 rounded-full bg-white/95 backdrop-blur-md border border-[#E6DFD5] ring-1 ring-orange-200/40 shadow-[0_6px_28px_-6px_rgba(28,25,23,0.08)]">
          {/* Brand Identity */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none shrink-0 group"
            onClick={() => handleTabClick("beranda")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/logo.png"
              alt="Logo JagaJalan"
              width={26}
              height={26}
              style={{ width: "26px", height: "26px", maxWidth: "26px", maxHeight: "26px" }}
              className="w-[26px] h-[26px] object-contain shrink-0"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/logo-name.png"
              alt="JagaJalan"
              height={18}
              style={{ height: "18px", width: "auto" }}
              className="h-[18px] w-auto object-contain shrink-0"
            />
          </div>

          {/* Primary Navigation Links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 h-full">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative py-1.5 text-[13px] tracking-[-0.015em] whitespace-nowrap transition-colors cursor-pointer select-none ${
                    isActive
                      ? "text-[#1C1917] font-semibold"
                      : "text-[#68635D] hover:text-[#1C1917] font-medium"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-[1.75px] bg-[#c2410c] rounded-full" />
                  )}
                </button>
              );
            })}

            {isOfficerLoggedIn && (
              <button
                type="button"
                id="nav-tab-dinas"
                onClick={() => handleTabClick("dinas")}
                title={`Sesi Petugas Aktif: ${officerSession?.name || "Petugas Demo"}`}
                className={`relative py-1 px-2.5 rounded-full text-[12.5px] tracking-[-0.015em] whitespace-nowrap transition-all cursor-pointer select-none inline-flex items-center gap-1.5 ${
                  activeTab === "dinas"
                    ? "bg-[#FAF3EB] text-[#9a3412] font-bold ring-1 ring-orange-300/80"
                    : "bg-[#F8F5F0] hover:bg-[#F2ECE4] text-[#44403C] hover:text-[#1C1917] font-semibold ring-1 ring-[#E6DFD5]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Portal Dinas</span>
              </button>
            )}
          </nav>

          {/* Right Actions: Status Notification Bell + Lapor CTA */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0" ref={notifContainerRef}>
            {isOfficerLoggedIn && (
              <button
                type="button"
                onClick={() => handleTabClick("dinas")}
                title={`Sesi Petugas Aktif: ${officerSession?.name || "Petugas Demo"}`}
                className={`lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "dinas"
                    ? "bg-[#FAF3EB] text-[#9a3412] ring-1 ring-orange-300"
                    : "bg-[#F8F5F0] hover:bg-[#F2ECE4] text-[#1C1917] ring-1 ring-[#E6DFD5]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Dinas</span>
              </button>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                title="Pusat Notifikasi Status Laporan"
                aria-label="Pusat Notifikasi Status Laporan"
                className={`relative p-2 rounded-full transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/30 active:scale-[0.97] ${
                  notifOpen
                    ? "bg-orange-50 text-[#c2410c] ring-1 ring-orange-200"
                    : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2ECE4]"
                }`}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#c2410c] text-white font-mono tabular-nums text-[9.5px] font-bold flex items-center justify-center shadow-2xs">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-3 sm:w-[400px] rounded-[12px] bg-white border border-[#E7DDD0] shadow-[0_20px_48px_-14px_rgba(28,25,23,0.16)] overflow-hidden flex flex-col max-h-[480px] z-50 animate-fade-in font-sans">
                  <div className="px-4 pt-3.5 pb-0 border-b border-stone-100 bg-white">
                    <div className="flex items-center justify-between gap-2 pb-2.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[13.5px] font-bold text-stone-950 font-heading tracking-tight">
                          Notifikasi
                        </h3>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-[#9a3412] font-mono tabular-nums text-[10px] font-bold leading-none">
                            {unreadCount} baru
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && onMarkAllRead && (
                        <button
                          type="button"
                          onClick={onMarkAllRead}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-[#c2410c] transition-colors cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Tandai dibaca</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-5">
                      <button
                        type="button"
                        onClick={() => setNotifScope("personal")}
                        className={`relative pb-2.5 text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                          notifScope === "personal"
                            ? "text-stone-950 font-semibold"
                            : "text-stone-500 hover:text-stone-800 font-medium"
                        }`}
                      >
                        <span>Dipantau</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-full font-mono tabular-nums text-[10px] leading-none ${
                            notifScope === "personal"
                              ? "bg-orange-100 text-[#9a3412] font-bold"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {personalNotifications.length}
                        </span>
                        {notifScope === "personal" && (
                          <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#c2410c] rounded-full" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setNotifScope("public")}
                        className={`relative pb-2.5 text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                          notifScope === "public"
                            ? "text-stone-950 font-semibold"
                            : "text-stone-500 hover:text-stone-800 font-medium"
                        }`}
                      >
                        <span>Aktivitas Publik</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-full font-mono tabular-nums text-[10px] leading-none ${
                            notifScope === "public"
                              ? "bg-orange-100 text-[#9a3412] font-bold"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {notifications.length}
                        </span>
                        {notifScope === "public" && (
                          <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#c2410c] rounded-full" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-stone-100 overflow-y-auto flex-1">
                    {visibleNotifications.length === 0 ? (
                      <div className="px-6 py-8 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#E7DDD0] text-[#c2410c] flex items-center justify-center mx-auto">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-stone-900">
                          Belum ada laporan yang dipantau
                        </div>
                        <p className="text-[11.5px] text-stone-500 max-w-[260px] mx-auto leading-relaxed">
                          Laporan yang kamu kirim atau tandai Pantau di halaman Lacak Laporan akan tampil di sini.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setNotifOpen(false);
                            handleTabClick("ombudsman");
                          }}
                          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#c2410c] hover:text-[#9a3412] hover:underline cursor-pointer"
                        >
                          <span>Pilih di Lacak Laporan</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      visibleNotifications.map((item) => {
                        const isUnread = !readNotificationIds.includes(item.id);
                        const isTracked = subscribedTickets.includes(item.ticketCode);
                        const { label, textClass, dotClass, iconWrapClass, Icon, actionCue } =
                          getStatusMeta(item);

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setNotifOpen(false);
                              if (onSelectNotification) onSelectNotification(item);
                            }}
                            className={`group w-full text-left px-4 py-3 transition-colors cursor-pointer flex items-start gap-3 ${
                              isUnread
                                ? "bg-[#FFF9F4] hover:bg-[#FAF3EB]"
                                : "bg-white hover:bg-[#FAF7F2]/70"
                            }`}
                          >
                            <div
                              className={`mt-0.5 w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 ${iconWrapClass}`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {isUnread && (
                                    <span
                                      className="w-1.5 h-1.5 rounded-full bg-[#c2410c] shrink-0"
                                      aria-label="Belum dibaca"
                                    />
                                  )}
                                  <span className="text-[12.5px] font-bold text-stone-950 leading-snug truncate">
                                    {item.roadName || item.title}
                                  </span>
                                </div>
                                <span className="text-[10.5px] text-stone-500 font-mono tabular-nums shrink-0 pt-0.5">
                                  {formatRelativeTime(item.createdAt)}
                                </span>
                              </div>

                              <p className="text-[11.5px] text-stone-600 leading-relaxed line-clamp-2">
                                {item.message}
                              </p>

                              <div className="flex items-center justify-between gap-2 pt-0.5">
                                <div className="flex items-center gap-1.5 min-w-0 text-[10.5px]">
                                  <span className={`inline-flex items-center gap-1 font-semibold shrink-0 ${textClass}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                                    <span>{label}</span>
                                  </span>
                                  <span className="text-stone-300">·</span>
                                  <span className="font-mono tabular-nums text-stone-500 truncate">
                                    #{item.ticketCode}
                                  </span>
                                  {notifScope === "public" && isTracked && (
                                    <>
                                      <span className="text-stone-300">·</span>
                                      <span className="font-semibold text-[#9a3412] shrink-0">
                                        Dipantau
                                      </span>
                                    </>
                                  )}
                                </div>

                                <span className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-[#c2410c] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <span>{actionCue}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className="px-4 py-2.5 border-t border-[#EDE6DC] bg-[#FAF7F2] flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 font-mono tabular-nums">
                      {displayedNotifications.length > visibleNotifications.length
                        ? `${visibleNotifications.length} dari ${displayedNotifications.length} pembaruan`
                        : `${displayedNotifications.length} pembaruan`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNotifOpen(false);
                        handleTabClick("ombudsman");
                      }}
                      className="font-semibold text-[#c2410c] hover:text-[#9a3412] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Kelola di Lacak Laporan</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onOpenReportModal}
              className="group inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap font-sans"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon/plus_icon.png"
                alt=""
                width={12}
                height={12}
                style={{ width: "12px", height: "12px" }}
                className="w-3 h-3 object-contain invert brightness-0"
              />
              <span className="hidden xs:inline sm:inline">Lapor Kerusakan</span>
              <span className="inline xs:hidden sm:hidden">Lapor</span>
            </button>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-full text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2ECE4] transition-colors cursor-pointer"
                aria-label="Buka Menu"
              >
                {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 p-2 rounded-[10px] border border-[#E6DFD5] ring-1 ring-orange-200/50 space-y-1 text-xs animate-fade-in bg-white shadow-xl">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-[6px] font-medium flex items-center gap-3 transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#c2410c] text-white font-semibold"
                      : "text-[#1C1917] hover:bg-[#FAF8F5]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.icon}
                    alt=""
                    width={18}
                    height={18}
                    style={{ width: "18px", height: "18px" }}
                    className={`w-4.5 h-4.5 object-contain shrink-0 ${isActive ? "invert brightness-0" : ""}`}
                  />
                  <span className="flex-1">{item.label}</span>
                </button>
              );
            })}

            {isOfficerLoggedIn && (
              <div className="pt-1 mt-1 border-t border-slate-100 space-y-1">
                <button
                  type="button"
                  onClick={() => handleTabClick("dinas")}
                  className={`w-full text-left px-3 py-2.5 rounded-[6px] font-medium flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    activeTab === "dinas"
                      ? "bg-slate-900 text-white font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/icon/profile.png"
                      alt=""
                      width={18}
                      height={18}
                      style={{ width: "18px", height: "18px" }}
                      className={`w-4.5 h-4.5 object-contain shrink-0 ${activeTab === "dinas" ? "invert brightness-0" : ""}`}
                    />
                    <span>Portal Dinas (Petugas)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Sesi Aktif
                  </span>
                </button>
                {onLogoutOfficer && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogoutOfficer();
                    }}
                    className="w-full text-left px-3 py-2 rounded-[6px] text-[11px] font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    Keluar dari Sesi Petugas
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  </>
  );
}
