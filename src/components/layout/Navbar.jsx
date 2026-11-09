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
  CheckCheck,
  ArrowRight,
  BookmarkCheck,
  Globe,
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

function getStatusBadgeMeta(item) {
  if (item.status === "SELESAI") {
    return {
      label: "Selesai Diperbaiki",
      badgeClass: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/70",
      iconWrapClass: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
      Icon: CheckCircle2,
    };
  }
  if (item.status === "OVERDUE") {
    return {
      label: "Lewat Tenggat Respons",
      badgeClass: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/70",
      iconWrapClass: "bg-rose-50 text-rose-700 ring-rose-200/70",
      Icon: AlertTriangle,
    };
  }
  if (item.type === "REPORT_CREATED") {
    return {
      label: "Tiket Terdaftar GIS",
      badgeClass: "bg-orange-50 text-[#9a3412] ring-1 ring-orange-200/70",
      iconWrapClass: "bg-orange-50 text-[#c2410c] ring-orange-200/70",
      Icon: MapPin,
    };
  }
  return {
    label: "Dalam Pengerjaan",
    badgeClass: "bg-amber-50 text-amber-800 ring-1 ring-amber-200/70",
    iconWrapClass: "bg-amber-50 text-amber-700 ring-amber-200/70",
    Icon: Clock,
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifContainerRef.current && !notifContainerRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const personalNotifications = useMemo(() => {
    const trackedSet = new Set(subscribedTickets);
    return notifications.filter(
      (item) => trackedSet.has(item.ticketCode) || item.type === "REPORT_CREATED"
    );
  }, [notifications, subscribedTickets]);

  const displayedNotifications =
    notifScope === "personal" ? personalNotifications : notifications;

  const personalUnreadCount = useMemo(
    () => personalNotifications.filter((n) => !readNotificationIds.includes(n.id)).length,
    [personalNotifications, readNotificationIds]
  );

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setNotifOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header
      className={`z-50 pt-3 pb-2 px-4 sm:px-6 lg:px-8 pointer-events-none transition-all ${
        activeTab === "peta" ? "absolute top-0 inset-x-0" : "sticky top-0"
      }`}
    >
      <div className="w-full max-w-4xl mx-auto pointer-events-auto relative">
        <div className="flex items-center justify-between h-13 px-4 sm:px-5 rounded-full bg-white/95 backdrop-blur-md border border-[#E6DFD5] ring-1 ring-orange-200/40 shadow-[0_6px_28px_-6px_rgba(28,25,23,0.08)]">
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
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 h-full">
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
          </nav>

          {/* Right Actions: Status Notification Bell + Lapor CTA */}
          <div className="flex items-center gap-2 shrink-0" ref={notifContainerRef}>
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
                <div className="absolute right-0 mt-3 w-[345px] sm:w-[415px] rounded-[10px] bg-[#F2ECE4]/95 p-1.5 ring-1 ring-[#E6DFD5] shadow-[0_20px_48px_-12px_rgba(28,25,23,0.18)] z-50 animate-fade-in font-sans">
                  <div className="bg-white rounded-[7px] ring-1 ring-slate-200/60 overflow-hidden flex flex-col max-h-[480px]">
                    {/* Drawer Header */}
                    <div className="px-4 pt-3.5 pb-3 border-b border-slate-100 space-y-2.5 bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 font-heading tracking-tight">
                            Notifikasi Status Pelaporan
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Pembaruan otomatis tahapan verifikasi dan perbaikan fisik dinas.
                          </p>
                        </div>
                        {unreadCount > 0 && onMarkAllRead && (
                          <button
                            type="button"
                            onClick={onMarkAllRead}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-[#c2410c] ring-1 ring-slate-200/80 hover:ring-orange-200 text-[10px] font-semibold transition-colors cursor-pointer shrink-0"
                          >
                            <CheckCheck className="w-3 h-3" />
                            <span>Tandai Dibaca</span>
                          </button>
                        )}
                      </div>

                      {/* Two-Scope Segmented Switcher: Tiket Dipantau vs Semua Publik */}
                      <div className="grid grid-cols-2 gap-1 p-1 rounded-[6px] bg-slate-100/90 ring-1 ring-slate-200/60">
                        <button
                          type="button"
                          onClick={() => setNotifScope("personal")}
                          className={`py-1.5 px-2.5 rounded-[5px] text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            notifScope === "personal"
                              ? "bg-white text-slate-900 shadow-2xs font-bold"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <BookmarkCheck className="w-3.5 h-3.5 text-[#c2410c]" />
                          <span>Tiket Dipantau</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-[4px] font-mono tabular-nums text-[10px] ${
                              notifScope === "personal"
                                ? "bg-orange-50 text-[#c2410c] font-bold"
                                : "bg-slate-200/70 text-slate-600"
                            }`}
                          >
                            {personalNotifications.length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNotifScope("public")}
                          className={`py-1.5 px-2.5 rounded-[5px] text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            notifScope === "public"
                              ? "bg-white text-slate-900 shadow-2xs font-bold"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <Globe className="w-3.5 h-3.5 text-slate-500" />
                          <span>Semua Publik</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-[4px] font-mono tabular-nums text-[10px] ${
                              notifScope === "public"
                                ? "bg-slate-100 text-slate-800 font-bold"
                                : "bg-slate-200/70 text-slate-600"
                            }`}
                          >
                            {notifications.length}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Scope Context Subbar */}
                    <div className="px-4 py-1.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-[10.5px] text-slate-500">
                      <span>
                        {notifScope === "personal"
                          ? "Menampilkan tiket laporan Anda & tiket yang Anda pantau"
                          : "Umpan terbuka seluruh pembaruan status penanganan jalan"}
                      </span>
                      {notifScope === "personal" && personalUnreadCount > 0 && (
                        <span className="font-mono tabular-nums font-bold text-[#c2410c]">
                          {personalUnreadCount} baru
                        </span>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
                      {displayedNotifications.length === 0 ? (
                        <div className="p-7 text-center space-y-2">
                          <BookmarkCheck className="w-6 h-6 text-slate-300 mx-auto" />
                          <div className="text-xs font-bold text-slate-800">
                            Belum Ada Tiket yang Dipantau
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed max-w-[260px] mx-auto">
                            Buat laporan baru atau tekan tombol <strong>Pantau Notifikasi</strong> pada kartu aduan di menu Lacak Laporan.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleTabClick("ombudsman")}
                            className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#c2410c] text-white text-[11px] font-bold hover:bg-[#9a3412] transition-colors cursor-pointer"
                          >
                            <span>Pilih Tiket di Lacak Laporan</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        displayedNotifications.slice(0, 12).map((item) => {
                          const isUnread = !readNotificationIds.includes(item.id);
                          const isTracked = subscribedTickets.includes(item.ticketCode);
                          const { label, badgeClass, iconWrapClass, Icon } =
                            getStatusBadgeMeta(item);

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setNotifOpen(false);
                                if (onSelectNotification) onSelectNotification(item);
                              }}
                              className={`w-full text-left px-4 py-3 transition-colors cursor-pointer flex items-start gap-3 ${
                                isUnread
                                  ? "bg-orange-50/30 hover:bg-orange-50/60"
                                  : "bg-white hover:bg-slate-50/80"
                              }`}
                            >
                              <div
                                className={`mt-0.5 w-7 h-7 rounded-[5px] flex items-center justify-center shrink-0 ring-1 ${iconWrapClass}`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>

                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="font-mono tabular-nums text-[11px] font-bold text-slate-900">
                                      #{item.ticketCode}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded-[4px] text-[9.5px] font-semibold ${badgeClass}`}
                                    >
                                      {label}
                                    </span>
                                    {notifScope === "public" && isTracked && (
                                      <span className="px-1.5 py-0.5 rounded-[4px] text-[9.5px] font-semibold bg-slate-100 text-slate-700">
                                        Dipantau
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono tabular-nums shrink-0">
                                    {formatRelativeTime(item.createdAt)}
                                  </span>
                                </div>

                                <div className="text-xs font-bold text-slate-900 leading-snug truncate">
                                  {item.roadName || item.title}
                                </div>

                                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                                  {item.message}
                                </p>

                                <div className="flex items-center justify-between gap-2 pt-0.5 text-[10px]">
                                  <span className="font-medium text-slate-400 truncate">
                                    {item.officer || item.authorityLabel}
                                  </span>
                                  <span className="font-bold text-[#c2410c] inline-flex items-center gap-0.5 shrink-0">
                                    <span>Buka di Peta GIS</span>
                                    <ArrowRight className="w-2.5 h-2.5" />
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Drawer Footer */}
                    <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-[10.5px]">
                      <span className="text-slate-500">
                        Dipicu otomatis dari Portal Dinas &amp; Peta GIS
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTabClick("ombudsman")}
                        className="font-bold text-[#c2410c] hover:underline cursor-pointer"
                      >
                        Kelola Tiket Dipantau
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onOpenReportModal}
              className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap font-sans"
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
              <span>Lapor Kerusakan</span>
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
          <div className="lg:hidden mt-2 p-2 rounded-[6px] border border-[#E6DFD5] ring-1 ring-orange-200/50 space-y-1 text-xs animate-fade-in bg-white shadow-xl">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-[6px] font-medium flex items-center gap-3 transition-colors ${
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
          </div>
        )}
      </div>
    </header>
  );
}
