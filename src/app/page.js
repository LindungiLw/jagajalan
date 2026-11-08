"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  BellRing,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  ArrowRight,
} from "lucide-react";
import {
  Navbar,
  Footer,
  SerpentineRoadBackground,
  HeroSection,
  NationalRankingSection,
  MapExplorer,
  ReportModal,
  OmbudsmanModal,
  OfficerDashboard,
  OfficerLogin,
  BudgetDataExplorer,
  AnnualProgressChart,
  CivicWorkflowSection,
  LegalBasisSection,
  OmbudsmanMonitorSection,
} from "@/components";
import {
  ROAD_SEGMENTS,
  INITIAL_REPORTS,
  getActiveOfficerSession,
  clearOfficerSession,
} from "@/data";

function mergeReportsById(...reportLists) {
  const seen = new Set();
  const merged = [];
  for (const list of reportLists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (!item || !item.id || seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
    }
  }
  return merged;
}

function mergeNotificationsById(...notifLists) {
  const seen = new Set();
  const merged = [];
  for (const list of notifLists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (!item || !item.id || seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
    }
  }
  return merged.sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

function buildInitialSeedNotifications(reports) {
  return (reports || [])
    .slice(0, 6)
    .map((rep) => {
      const lastUpd =
        Array.isArray(rep.updates) && rep.updates.length > 0
          ? rep.updates[rep.updates.length - 1]
          : null;
      const isResolved = rep.status === "SELESAI" || rep.progressStatus === "SELESAI";
      const isOverdue = rep.status === "OVERDUE" || rep.isResponseOverdue;
      return {
        id: `NOTIF-INIT-${rep.id}`,
        reportId: rep.id,
        ticketCode: rep.ticketCode,
        roadSegmentId: rep.roadSegmentId,
        roadName: rep.roadName,
        district: rep.district,
        authority: rep.authority,
        authorityLabel: rep.authorityLabel,
        type: isResolved
          ? "STATUS_RESOLVED"
          : isOverdue
          ? "SLA_OVERDUE_ALERT"
          : "STATUS_IN_PROGRESS",
        status: rep.status,
        title: isResolved
          ? `Perbaikan Selesai: #${rep.ticketCode}`
          : isOverdue
          ? `Peringatan Tenggat Respons: #${rep.ticketCode}`
          : `Pembaruan Status Dinas: #${rep.ticketCode}`,
        message:
          lastUpd?.note ||
          `Status penanganan pada ${rep.roadName} dipantau secara real-time oleh ${rep.authorityLabel}.`,
        officer: lastUpd?.officer || rep.authorityLabel,
        createdAt: lastUpd?.date || rep.reportDate || new Date().toISOString(),
      };
    });
}

export default function Home() {
  const [activeTab, setActiveTabState] = useState("beranda");
  const [roads, setRoads] = useState(ROAD_SEGMENTS);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [notifications, setNotifications] = useState(() =>
    buildInitialSeedNotifications(INITIAL_REPORTS)
  );
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const [subscribedTickets, setSubscribedTickets] = useState([
    "JGJ-MDN-001",
    "JGJ-SML-002",
  ]);
  const [activeToast, setActiveToast] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportInitialLocation, setReportInitialLocation] = useState(null);
  const [ombudsmanModalOpen, setOmbudsmanModalOpen] = useState(false);
  const [selectedOmbudsmanReport, setSelectedOmbudsmanReport] = useState(null);
  const [focusedRoadId, setFocusedRoadId] = useState(null);
  const [focusedReportId, setFocusedReportId] = useState(null);
  const [officerSession, setOfficerSession] = useState(null);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const pushLiveNotification = useCallback((notif, showToast = true) => {
    if (!notif || !notif.id) return;
    setNotifications((prev) => mergeNotificationsById([notif], prev).slice(0, 40));

    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("jagajalan_live_notifs_v1");
        const existing = raw ? JSON.parse(raw) : [];
        const updated = mergeNotificationsById([notif], existing).slice(0, 30);
        window.localStorage.setItem("jagajalan_live_notifs_v1", JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }

      if (showToast && "Notification" in window && window.Notification.permission === "granted") {
        try {
          new window.Notification(notif.title || "Pembaruan Status JagaJalan", {
            body: notif.message || "",
            icon: "/logo/logo.png",
          });
        } catch {
          // Ignore browser Notification errors
        }
      }
    }

    if (showToast) {
      setActiveToast(notif);
    }
  }, []);

  useEffect(() => {
    if (!activeToast) return undefined;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 6500);
    return () => clearTimeout(timer);
  }, [activeToast]);

  const syncReportsFromBackend = useCallback(async () => {
    let localCustom = [];
    let localNotifs = [];
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("jagajalan_custom_reports_v1");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) localCustom = parsed;
        }
        const rawNotifs = window.localStorage.getItem("jagajalan_live_notifs_v1");
        if (rawNotifs) {
          const parsedNotifs = JSON.parse(rawNotifs);
          if (Array.isArray(parsedNotifs)) localNotifs = parsedNotifs;
        }
      } catch {
        // Ignore localStorage parse error
      }
    }

    try {
      const res = await fetch("/api/reports", { cache: "no-store" });
      if (res.ok) {
        const payload = await res.json();
        if (Array.isArray(payload?.data)) {
          setReports((prev) =>
            mergeReportsById(localCustom, payload.data, prev, INITIAL_REPORTS)
          );
        }
        if (Array.isArray(payload?.notifications)) {
          setNotifications((prev) =>
            mergeNotificationsById(localNotifs, payload.notifications, prev).slice(0, 40)
          );
        }
        return;
      }
    } catch {
      // Fallback to local + initial reports if API unreachable
    }

    if (localCustom.length > 0) {
      setReports((prev) => mergeReportsById(localCustom, prev, INITIAL_REPORTS));
    }
    if (localNotifs.length > 0) {
      setNotifications((prev) => mergeNotificationsById(localNotifs, prev).slice(0, 40));
    }
  }, []);

  useEffect(() => {
    const session = getActiveOfficerSession();
    if (session) {
      setOfficerSession(session);
    }

    if (typeof window !== "undefined") {
      try {
        const rawRead = window.localStorage.getItem("jagajalan_read_notifs_v1");
        if (rawRead) {
          const parsedRead = JSON.parse(rawRead);
          if (Array.isArray(parsedRead)) setReadNotificationIds(parsedRead);
        }
        const rawSubs = window.localStorage.getItem("jagajalan_subscribed_tickets_v1");
        if (rawSubs) {
          const parsedSubs = JSON.parse(rawSubs);
          if (Array.isArray(parsedSubs)) setSubscribedTickets(parsedSubs);
        }
      } catch {
        // Ignore parse error
      }

      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const hash = window.location.hash.replace("#", "");
      const validTabs = ["beranda", "peta", "data-anggaran", "ombudsman", "nasional", "dinas"];
      if (
        tabParam === "admin" ||
        hash === "admin" ||
        tabParam === "portaldinas" ||
        hash === "portaldinas"
      ) {
        setActiveTabState("dinas");
      } else if (tabParam && validTabs.includes(tabParam)) {
        setActiveTabState(tabParam);
      } else if (hash && validTabs.includes(hash)) {
        setActiveTabState(hash);
      }
    }

    syncReportsFromBackend();
    const intervalId = setInterval(syncReportsFromBackend, 10000);

    let bc = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("jagajalan_live_reports");
      bc.onmessage = (event) => {
        const msg = event.data;
        if (msg?.type === "NEW_REPORT" && msg.report) {
          setReports((prev) => mergeReportsById([msg.report], prev));
          if (msg.notification) {
            pushLiveNotification(msg.notification, true);
          }
        } else if (msg?.type === "UPDATE_REPORT" && msg.id) {
          setReports((prev) =>
            prev.map((rep) => (rep.id === msg.id ? { ...rep, ...msg.updatedFields } : rep))
          );
          if (msg.notification) {
            pushLiveNotification(msg.notification, true);
          }
        }
      };
    }

    return () => {
      clearInterval(intervalId);
      if (bc) bc.close();
    };
  }, [syncReportsFromBackend, pushLiveNotification]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !readNotificationIds.includes(n.id)).length;
  }, [notifications, readNotificationIds]);

  const handleMarkAllNotificationsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotificationIds(allIds);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("jagajalan_read_notifs_v1", JSON.stringify(allIds));
      } catch {
        // Ignore storage error
      }
    }
  };

  const handleSelectNotification = (notif) => {
    if (!notif) return;
    setReadNotificationIds((prev) => {
      if (prev.includes(notif.id)) return prev;
      const next = [...prev, notif.id];
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("jagajalan_read_notifs_v1", JSON.stringify(next));
        } catch {
          // Ignore storage error
        }
      }
      return next;
    });

    if (notif.reportId) {
      setFocusedReportId(notif.reportId);
    }
    if (notif.roadSegmentId) {
      setFocusedRoadId(notif.roadSegmentId);
    }
    setActiveTab("peta");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleOfficerLogin = (officer) => {
    setOfficerSession(officer);
  };

  const handleOfficerLogout = () => {
    clearOfficerSession();
    setOfficerSession(null);
  };

  const handleOpenReportModal = (locationPayload = null) => {
    if (locationPayload && typeof locationPayload === "object" && !locationPayload.nativeEvent) {
      setReportInitialLocation(locationPayload);
    } else {
      setReportInitialLocation(null);
    }
    setReportModalOpen(true);
  };

  const handleAddNewReport = (newReport) => {
    setReports((prev) => mergeReportsById([newReport], prev));
    setFocusedReportId(newReport.id);
    if (newReport?.ticketCode && newReport.notifyOnUpdate !== false) {
      setSubscribedTickets((prev) => {
        if (prev.includes(newReport.ticketCode)) return prev;
        const next = [newReport.ticketCode, ...prev];
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem("jagajalan_subscribed_tickets_v1", JSON.stringify(next));
          } catch {
            // Ignore storage error
          }
        }
        return next;
      });
    }
    setRoads((prevRoads) =>
      prevRoads.map((road) =>
        road.id === newReport.roadSegmentId
          ? { ...road, activeReportsCount: (road.activeReportsCount || 0) + 1 }
          : road
      )
    );

    const createdNotif = {
      id: `NOTIF-LOCAL-${newReport.id}`,
      reportId: newReport.id,
      ticketCode: newReport.ticketCode,
      roadSegmentId: newReport.roadSegmentId,
      roadName: newReport.roadName,
      district: newReport.district,
      authority: newReport.authority,
      authorityLabel: newReport.authorityLabel,
      type: "REPORT_CREATED",
      status: newReport.status || "MENUNGGU_VERIFIKASI",
      title: `Tiket #${newReport.ticketCode} Terbit & Dipetakan di GIS`,
      message: `Laporan kerusakan pada ${newReport.roadName} telah masuk antrean verifikasi ${newReport.authorityLabel}.`,
      officer: "Sistem Notifikasi Otomatis JagaJalan",
      createdAt: new Date().toISOString(),
    };
    pushLiveNotification(createdNotif, true);
  };

  const handleViewReportOnMap = (report) => {
    if (report?.id) {
      setFocusedReportId(report.id);
    }
    if (report?.roadSegmentId) {
      setFocusedRoadId(report.roadSegmentId);
    }
    setActiveTab("peta");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleUpdateReport = async (reportId, updatedFields) => {
    const targetReport = reports.find((r) => r.id === reportId);
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === reportId ? { ...report, ...updatedFields } : report
      )
    );

    const nextStatus = updatedFields.status || updatedFields.progressStatus || "DALAM_PENGERJAAN";
    const latestUpdate =
      Array.isArray(updatedFields.updates) && updatedFields.updates.length > 0
        ? updatedFields.updates[updatedFields.updates.length - 1]
        : null;
    const isResolved = nextStatus === "SELESAI";

    const statusNotif = {
      id: `NOTIF-UPD-${reportId}-${Date.now()}`,
      reportId,
      ticketCode: targetReport?.ticketCode || reportId,
      roadSegmentId: targetReport?.roadSegmentId,
      roadName: targetReport?.roadName || "Ruas Jalan Publik",
      district: targetReport?.district || "",
      authority: targetReport?.authority || "",
      authorityLabel: targetReport?.authorityLabel || "Dinas Penyelenggara Jalan",
      type: isResolved ? "STATUS_RESOLVED" : "STATUS_IN_PROGRESS",
      status: nextStatus,
      title: isResolved
        ? `Perbaikan Selesai: #${targetReport?.ticketCode || reportId}`
        : `Status Diperbarui Dinas: #${targetReport?.ticketCode || reportId}`,
      message:
        latestUpdate?.note ||
        (isResolved
          ? `Perbaikan fisik jalan pada ${targetReport?.roadName || "ruas jalan"} telah selesai dan bukti foto lapangan telah diunggah.`
          : `Status penanganan tiket #${targetReport?.ticketCode || reportId} diperbarui menjadi Dalam Pengerjaan.`),
      officer: latestUpdate?.officer || targetReport?.authorityLabel || "Petugas Dinas",
      createdAt: new Date().toISOString(),
    };

    pushLiveNotification(statusNotif, true);

    try {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem("jagajalan_custom_reports_v1");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const updatedLocal = parsed.map((rep) =>
              rep.id === reportId ? { ...rep, ...updatedFields } : rep
            );
            window.localStorage.setItem(
              "jagajalan_custom_reports_v1",
              JSON.stringify(updatedLocal)
            );
          }
        }
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("jagajalan_live_reports");
          bc.postMessage({
            type: "UPDATE_REPORT",
            id: reportId,
            updatedFields,
            notification: statusNotif,
          });
          bc.close();
        }
      }
    } catch {
      // Ignore storage errors
    }

    try {
      await fetch("/api/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reportId, ...updatedFields }),
      });
    } catch {
      // Ignore network errors if offline
    }
  };

  const handleSubscribeTicketNotification = (report, nextSubscribedList) => {
    if (Array.isArray(nextSubscribedList)) {
      setSubscribedTickets(nextSubscribedList);
    }
    if (!report) return;
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      window.Notification.permission === "default"
    ) {
      window.Notification.requestPermission().catch(() => {});
    }
    const subNotif = {
      id: `NOTIF-SUB-${report.id}-${Date.now()}`,
      reportId: report.id,
      ticketCode: report.ticketCode,
      roadSegmentId: report.roadSegmentId,
      roadName: report.roadName,
      district: report.district,
      authority: report.authority,
      authorityLabel: report.authorityLabel,
      type: "REPORT_CREATED",
      status: report.status,
      title: `Notifikasi Otomatis Aktif: #${report.ticketCode}`,
      message: `Anda akan menerima pemberitahuan real-time setiap kali ${report.authorityLabel} memperbarui status atau mengunggah bukti perbaikan pada ${report.roadName}.`,
      officer: "Sistem Notifikasi Otomatis JagaJalan",
      createdAt: new Date().toISOString(),
    };
    pushLiveNotification(subNotif, true);
  };

  const handleOpenOmbudsmanDraft = (report) => {
    setSelectedOmbudsmanReport(report);
    setOmbudsmanModalOpen(true);
  };

  const handleSelectPilot = () => {
    setActiveTab("peta");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectRoadOnMap = (roadId) => {
    setFocusedRoadId(roadId);
    setActiveTab("peta");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`relative flex flex-col bg-[#FAF7F2] text-[#1C1917] selection:bg-orange-100 selection:text-orange-900 ${
        activeTab === "peta" ? "h-screen overflow-hidden" : "min-h-screen overflow-x-hidden"
      }`}
    >
      {activeTab === "beranda" && <SerpentineRoadBackground />}

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => handleOpenReportModal(null)}
        officerSession={officerSession}
        onLogoutOfficer={handleOfficerLogout}
        notifications={notifications}
        unreadCount={unreadCount}
        readNotificationIds={readNotificationIds}
        subscribedTickets={subscribedTickets}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onSelectNotification={handleSelectNotification}
      />

      <main
        className={`relative z-10 flex-1 flex flex-col ${
          activeTab === "peta" ? "min-h-0 overflow-hidden" : ""
        }`}
      >
        {activeTab === "beranda" && (
          <div className="space-y-6 animate-fade-in pb-4 relative">
            <div className="relative z-10 space-y-6">
              <HeroSection
                roads={roads}
                reports={reports}
                onExploreData={() => {
                  setActiveTab("data-anggaran");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onOpenReport={() => handleOpenReportModal(null)}
                onExploreNational={() => {
                  setActiveTab("nasional");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onOpenOfficerPortal={() => {
                  setActiveTab("dinas");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onOpenOmbudsmanDraft={handleOpenOmbudsmanDraft}
              />

              <CivicWorkflowSection onOpenReportModal={() => handleOpenReportModal(null)} />

              <LegalBasisSection
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          </div>
        )}

        {activeTab === "peta" && (
          <div className="w-full h-full min-h-0 overflow-hidden animate-fade-in flex-1">
            <MapExplorer
              roads={roads}
              reports={reports}
              onOpenOmbudsmanDraft={handleOpenOmbudsmanDraft}
              onOpenReportModal={handleOpenReportModal}
              focusedRoadId={focusedRoadId}
              focusedReportId={focusedReportId}
            />
          </div>
        )}

        {activeTab === "data-anggaran" && (
          <div className="py-2 animate-fade-in flex-1">
            <BudgetDataExplorer
              roads={roads}
              reports={reports}
              onSelectRoadOnMap={handleSelectRoadOnMap}
              onOpenReportModal={() => handleOpenReportModal(null)}
            />
          </div>
        )}

        {activeTab === "nasional" && (
          <div className="py-2 animate-fade-in space-y-4">
            <AnnualProgressChart />
            <NationalRankingSection onSelectPilot={handleSelectPilot} />
          </div>
        )}

        {activeTab === "ombudsman" && (
          <div className="py-2 animate-fade-in flex-1">
            <OmbudsmanMonitorSection
              reports={reports}
              subscribedTickets={subscribedTickets}
              onOpenOmbudsmanDraft={handleOpenOmbudsmanDraft}
              onSelectRoadOnMap={handleSelectRoadOnMap}
              onSubscribeTicketNotification={handleSubscribeTicketNotification}
            />
          </div>
        )}

        {activeTab === "dinas" && (
          <div className="py-2 animate-fade-in">
            {!officerSession ? (
              <OfficerLogin
                onLoginSuccess={handleOfficerLogin}
                onBackToPublic={() => {
                  setActiveTab("beranda");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            ) : (
              <OfficerDashboard
                reports={reports}
                onUpdateReport={handleUpdateReport}
                onSwitchToMap={() => {
                  setActiveTab("peta");
                  window.scrollTo({ top: 100, behavior: "smooth" });
                }}
                currentOfficer={officerSession}
                onLogout={handleOfficerLogout}
              />
            )}
          </div>
        )}
      </main>

      {/* Live Automated Status Notification Toast */}
      {activeToast && (
        <div className="fixed bottom-4 right-4 z-50 w-[330px] sm:w-[375px] rounded-[8px] bg-slate-900/95 p-1.5 ring-1 ring-orange-400/50 shadow-2xl animate-fade-in font-sans">
          <div className="rounded-[6px] bg-white p-3.5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-[5px] flex items-center justify-center shrink-0 ring-1 ${
                    activeToast.status === "SELESAI"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : activeToast.type === "REPORT_CREATED"
                      ? "bg-orange-50 text-[#c2410c] ring-orange-200"
                      : "bg-amber-50 text-amber-700 ring-amber-200"
                  }`}
                >
                  {activeToast.status === "SELESAI" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : activeToast.type === "REPORT_CREATED" ? (
                    <BellRing className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="font-mono tabular-nums text-[10px] font-bold text-[#c2410c] uppercase tracking-wider">
                  Notifikasi Status Otomatis
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveToast(null)}
                className="p-0.5 rounded-[4px] text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Tutup Notifikasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 font-heading leading-snug">
                {activeToast.title}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                {activeToast.message}
              </p>
            </div>

            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10.5px]">
              <span className="text-slate-400 truncate max-w-[180px]">
                {activeToast.officer}
              </span>
              <button
                type="button"
                onClick={() => {
                  const target = activeToast;
                  setActiveToast(null);
                  handleSelectNotification(target);
                }}
                className="font-bold text-[#c2410c] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3 h-3" />
                <span>Lihat di Peta GIS</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setReportInitialLocation(null);
        }}
        roads={roads}
        initialLocation={reportInitialLocation}
        onNewReportAdded={handleAddNewReport}
        onViewReportOnMap={handleViewReportOnMap}
      />

      <OmbudsmanModal
        isOpen={ombudsmanModalOpen}
        onClose={() => {
          setOmbudsmanModalOpen(false);
          setSelectedOmbudsmanReport(null);
        }}
        report={selectedOmbudsmanReport}
      />

      {activeTab !== "peta" && <Footer onSelectTab={setActiveTab} activeTab={activeTab} />}
    </div>
  );
}
