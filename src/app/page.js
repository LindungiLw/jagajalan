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

function applyReportOverrides(reportList, overridesMap) {
  if (!Array.isArray(reportList)) return [];
  if (!overridesMap || typeof overridesMap !== "object") return reportList;
  return reportList.map((rep) => {
    if (!rep || !rep.id) return rep;
    const ov = overridesMap[rep.id];
    if (!ov || typeof ov !== "object") return rep;
    return { ...rep, ...ov };
  });
}

function canonicalNotifStage(item) {
  const status = String(item?.status || "").toUpperCase();
  const type = String(item?.type || "").toUpperCase();
  if (status === "SELESAI" || type === "STATUS_RESOLVED") return "SELESAI";
  if (status === "OVERDUE" || type === "SLA_OVERDUE_ALERT") return "OVERDUE";
  if (status === "TERVERIFIKASI" || type === "STATUS_VERIFIED") return "TERVERIFIKASI";
  if (status === "DALAM_PENGERJAAN" || type === "STATUS_IN_PROGRESS") return "DALAM_PENGERJAAN";
  return "CREATED";
}

function buildCleanNotificationMessage({ status, roadName, authorityLabel, note, daysOverdue }) {
  const safeRoad = roadName || "ruas jalan ini";
  const safeAuth = authorityLabel || "dinas penyelenggara jalan";
  const rawNote = typeof note === "string" ? note.trim() : "";
  const looksLikeRawGps =
    /\[-?\d+\.\d+,\s*-?\d+\.\d+\]/.test(rawNote) || /terpetakan secara real/i.test(rawNote);
  const looksLikeOverdueNote = /terlampaui|tenggat batas waktu/i.test(rawNote);

  if (status === "SELESAI") {
    if (rawNote && !looksLikeRawGps && !looksLikeOverdueNote) return rawNote;
    return `Perbaikan pada ${safeRoad} selesai dikerjakan dan diverifikasi oleh ${safeAuth}.`;
  }
  if (status === "OVERDUE") {
    if (rawNote && !looksLikeRawGps) return rawNote;
    return `Batas tanggap 14 hari kerja terlewati (+${daysOverdue || 1} hari). Draf pengaduan Ombudsman RI siap digunakan.`;
  }
  if (status === "TERVERIFIKASI") {
    if (rawNote && !looksLikeRawGps && !looksLikeOverdueNote) return rawNote;
    return `Laporan diterima dan diverifikasi oleh ${safeAuth}. Jadwal penanganan sedang disiapkan.`;
  }
  if (status === "DALAM_PENGERJAAN") {
    if (rawNote && !looksLikeRawGps && !looksLikeOverdueNote) return rawNote;
    return `Tim lapangan ${safeAuth} sedang menangani perbaikan pada ${safeRoad}.`;
  }
  return `Laporan kerusakan pada ${safeRoad} masuk antrean verifikasi ${safeAuth}.`;
}

function mergeNotificationsById(...notifLists) {
  const flattened = [];
  for (const list of notifLists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      if (
        typeof item.title === "string" &&
        item.title.toLowerCase().includes("notifikasi otomatis aktif")
      ) {
        continue;
      }
      flattened.push(item);
    }
  }

  flattened.sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  const byReportKey = new Map();
  for (const item of flattened) {
    const reportKey = String(item.reportId || item.ticketCode || item.id || "").toUpperCase();
    if (!reportKey || byReportKey.has(reportKey)) continue;

    const stage = canonicalNotifStage(item);
    const normalizedStatus = stage === "CREATED" ? item.status || "MENUNGGU_VERIFIKASI" : stage;
    const normalizedType =
      stage === "SELESAI"
        ? "STATUS_RESOLVED"
        : stage === "OVERDUE"
        ? "SLA_OVERDUE_ALERT"
        : stage === "TERVERIFIKASI"
        ? "STATUS_VERIFIED"
        : stage === "DALAM_PENGERJAAN"
        ? "STATUS_IN_PROGRESS"
        : "REPORT_CREATED";

    byReportKey.set(reportKey, {
      ...item,
      id: `NOTIF-${reportKey}-${stage}`,
      status: normalizedStatus,
      type: normalizedType,
      message: buildCleanNotificationMessage({
        status: normalizedStatus,
        roadName: item.roadName,
        authorityLabel: item.authorityLabel,
        note: item.message,
      }),
    });
  }

  return Array.from(byReportKey.values());
}

function buildInitialSeedNotifications(reports) {
  return mergeNotificationsById(
    (reports || []).slice(0, 6).map((rep) => {
      const lastUpd =
        Array.isArray(rep.updates) && rep.updates.length > 0
          ? rep.updates[rep.updates.length - 1]
          : null;
      const isResolved = rep.status === "SELESAI" || rep.progressStatus === "SELESAI";
      const isOverdue = rep.status === "OVERDUE" || rep.isResponseOverdue;
      const status = isResolved ? "SELESAI" : isOverdue ? "OVERDUE" : "DALAM_PENGERJAAN";
      return {
        id: `NOTIF-${String(rep.id).toUpperCase()}-${status}`,
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
        status,
        title: isResolved
          ? `Perbaikan Selesai: #${rep.ticketCode}`
          : isOverdue
          ? `Lewat Batas 14 Hari: #${rep.ticketCode}`
          : `Dalam Perbaikan Dinas: #${rep.ticketCode}`,
        message: buildCleanNotificationMessage({
          status,
          roadName: rep.roadName,
          authorityLabel: rep.authorityLabel,
          note: lastUpd?.note,
          daysOverdue: rep.daysOverdue,
        }),
        officer: lastUpd?.officer || rep.authorityLabel,
        createdAt: lastUpd?.date || rep.reportDate || new Date().toISOString(),
      };
    })
  );
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
  const [upvotedReportIds, setUpvotedReportIds] = useState([]);

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
    let localOverrides = {};
    let localNotifs = [];
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("jagajalan_custom_reports_v1");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) localCustom = parsed;
        }
        const rawOverrides = window.localStorage.getItem("jagajalan_report_overrides_v1");
        if (rawOverrides) {
          const parsedOv = JSON.parse(rawOverrides);
          if (parsedOv && typeof parsedOv === "object") localOverrides = parsedOv;
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
            applyReportOverrides(
              mergeReportsById(localCustom, payload.data, prev, INITIAL_REPORTS),
              localOverrides
            )
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

    setReports((prev) =>
      applyReportOverrides(
        mergeReportsById(localCustom, prev, INITIAL_REPORTS),
        localOverrides
      )
    );
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
        const rawUpvotes = window.localStorage.getItem("jagajalan_upvoted_reports_v1");
        if (rawUpvotes) {
          const parsedUpvotes = JSON.parse(rawUpvotes);
          if (Array.isArray(parsedUpvotes)) setUpvotedReportIds(parsedUpvotes);
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
    const isOverdueAlert = notif.status === "OVERDUE" || notif.type === "SLA_OVERDUE_ALERT";
    setActiveTab(isOverdueAlert ? "ombudsman" : "peta");
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
      id: `NOTIF-${String(newReport.id).toUpperCase()}-CREATED`,
      reportId: newReport.id,
      ticketCode: newReport.ticketCode,
      roadSegmentId: newReport.roadSegmentId,
      roadName: newReport.roadName,
      district: newReport.district,
      authority: newReport.authority,
      authorityLabel: newReport.authorityLabel,
      type: "REPORT_CREATED",
      status: newReport.status || "MENUNGGU_VERIFIKASI",
      title: `Laporan Baru Diterima: #${newReport.ticketCode}`,
      message: buildCleanNotificationMessage({
        status: newReport.status || "MENUNGGU_VERIFIKASI",
        roadName: newReport.roadName,
        authorityLabel: newReport.authorityLabel,
      }),
      officer: "Sistem JagaJalan",
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

  const handleUpdateReport = async (reportId, rawUpdatedFields) => {
    const targetReport = reports.find((r) => r.id === reportId);
    const nextStatus =
      rawUpdatedFields.status || rawUpdatedFields.progressStatus || "DALAM_PENGERJAAN";
    const isResolvedOrHandled =
      nextStatus === "SELESAI" ||
      nextStatus === "DALAM_PENGERJAAN" ||
      nextStatus === "TERVERIFIKASI";

    const updatedFields = {
      ...rawUpdatedFields,
      status: nextStatus,
      progressStatus: nextStatus,
      isResponseOverdue: isResolvedOrHandled
        ? false
        : Boolean(rawUpdatedFields.isResponseOverdue),
      daysOverdue: isResolvedOrHandled ? 0 : rawUpdatedFields.daysOverdue || 0,
      ...(rawUpdatedFields.proofPhotoUrl
        ? { afterPhotoUrl: rawUpdatedFields.proofPhotoUrl }
        : {}),
      updatedAt: new Date().toISOString(),
    };

    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === reportId ? { ...report, ...updatedFields } : report
      )
    );

    if (targetReport?.roadSegmentId) {
      setRoads((prevRoads) =>
        prevRoads.map((road) => {
          if (road.id !== targetReport.roadSegmentId) return road;
          const nextRoad = { ...road };
          if (targetReport.status === "OVERDUE" && isResolvedOrHandled) {
            nextRoad.overdueReportsCount = Math.max(
              0,
              (road.overdueReportsCount || 1) - 1
            );
          }
          if (nextStatus === "SELESAI") {
            if (updatedFields.proofPhotoUrl) {
              nextRoad.photos = {
                ...(road.photos || {}),
                beforeUrl: road.photos?.beforeUrl || targetReport.photoUrl,
                afterUrl: updatedFields.proofPhotoUrl,
                description:
                  updatedFields.updates?.[0]?.note ||
                  road.photos?.description ||
                  "Perbaikan fisik lapangan telah diselesaikan dan terverifikasi.",
              };
            }
            if (road.budget) {
              nextRoad.budget = {
                ...road.budget,
                progressStatus: "SELESAI",
                progressPct: 100,
                physicalProgressPct: 100,
              };
            }
          } else if (nextStatus === "DALAM_PENGERJAAN" && road.budget) {
            nextRoad.budget = {
              ...road.budget,
              progressStatus: "DALAM_PENGERJAAN",
              physicalProgressPct: Math.max(road.budget.physicalProgressPct || 0, 72),
            };
          }
          return nextRoad;
        })
      );
    }

    const sortedUpdates = Array.isArray(updatedFields.updates)
      ? [...updatedFields.updates].sort(
          (a, b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime()
        )
      : [];
    const latestUpdate = sortedUpdates[0] || null;
    const isResolved = nextStatus === "SELESAI";
    const isVerified = nextStatus === "TERVERIFIKASI";
    const stage = canonicalNotifStage({ status: nextStatus });

    const statusNotif = {
      id: `NOTIF-${String(reportId).toUpperCase()}-${stage}`,
      reportId,
      ticketCode: targetReport?.ticketCode || reportId,
      roadSegmentId: targetReport?.roadSegmentId,
      roadName: targetReport?.roadName || "Ruas Jalan Publik",
      district: targetReport?.district || "",
      authority: targetReport?.authority || "",
      authorityLabel: targetReport?.authorityLabel || "Dinas Penyelenggara Jalan",
      type: isResolved
        ? "STATUS_RESOLVED"
        : isVerified
        ? "STATUS_VERIFIED"
        : "STATUS_IN_PROGRESS",
      status: nextStatus,
      title: isResolved
        ? `Perbaikan Selesai: #${targetReport?.ticketCode || reportId}`
        : isVerified
        ? `Terverifikasi Dinas: #${targetReport?.ticketCode || reportId}`
        : `Dalam Perbaikan Dinas: #${targetReport?.ticketCode || reportId}`,
      message: buildCleanNotificationMessage({
        status: nextStatus,
        roadName: targetReport?.roadName,
        authorityLabel: targetReport?.authorityLabel,
        note: latestUpdate?.note,
      }),
      officer: latestUpdate?.officer || targetReport?.authorityLabel || "Petugas Dinas",
      createdAt: new Date().toISOString(),
    };

    pushLiveNotification(statusNotif, true);

    try {
      if (typeof window !== "undefined") {
        const rawOv = window.localStorage.getItem("jagajalan_report_overrides_v1");
        const parsedOv = rawOv ? JSON.parse(rawOv) : {};
        const nextOverrides = {
          ...(parsedOv && typeof parsedOv === "object" ? parsedOv : {}),
          [reportId]: {
            ...(parsedOv?.[reportId] || {}),
            ...updatedFields,
          },
        };
        window.localStorage.setItem(
          "jagajalan_report_overrides_v1",
          JSON.stringify(nextOverrides)
        );

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
        headers: {
          "Content-Type": "application/json",
          "X-Officer-Id": officerSession?.id || "DEMO-001",
          "X-Officer-Token": officerSession?.sessionToken || "",
        },
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
    setActiveToast({
      id: `TOAST-SUB-${report.id}-${Date.now()}`,
      reportId: report.id,
      ticketCode: report.ticketCode,
      roadSegmentId: report.roadSegmentId,
      roadName: report.roadName,
      status: report.status,
      type: "STATUS_SUBSCRIBED",
      title: `Pemantauan Aktif: #${report.ticketCode}`,
      message: `Setiap pembaruan dari ${report.authorityLabel} untuk ${report.roadName} akan muncul di tab Dipantau.`,
      officer: "Notifikasi JagaJalan",
      createdAt: new Date().toISOString(),
    });
  };

  const handleOpenOmbudsmanDraft = (report) => {
    setSelectedOmbudsmanReport(report);
    setOmbudsmanModalOpen(true);
  };

  const handleSelectPilot = () => {
    setActiveTab("peta");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectRoadOnMap = (roadId, reportId = null) => {
    if (reportId) setFocusedReportId(reportId);
    if (roadId) setFocusedRoadId(roadId);
    setActiveTab("peta");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpvoteReport = (reportId) => {
    if (!reportId) return;
    const isAlreadyUpvoted = upvotedReportIds.includes(reportId);
    const nextUpvotedIds = isAlreadyUpvoted
      ? upvotedReportIds.filter((id) => id !== reportId)
      : [...upvotedReportIds, reportId];

    setUpvotedReportIds(nextUpvotedIds);

    const targetReport = reports.find((r) => r.id === reportId);
    const currentUpvotes = Number(targetReport?.upvotes || 0);
    const nextUpvotes = Math.max(0, isAlreadyUpvoted ? currentUpvotes - 1 : currentUpvotes + 1);

    setReports((prev) =>
      prev.map((rep) => (rep.id === reportId ? { ...rep, upvotes: nextUpvotes } : rep))
    );

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          "jagajalan_upvoted_reports_v1",
          JSON.stringify(nextUpvotedIds)
        );
        const rawOv = window.localStorage.getItem("jagajalan_report_overrides_v1");
        const parsedOv = rawOv ? JSON.parse(rawOv) : {};
        parsedOv[reportId] = {
          ...(parsedOv[reportId] || {}),
          upvotes: nextUpvotes,
        };
        window.localStorage.setItem(
          "jagajalan_report_overrides_v1",
          JSON.stringify(parsedOv)
        );
      } catch {
        // Ignore storage errors
      }
    }
  };

  return (
    <div
      className={`relative flex flex-col bg-[#FAF7F2] text-[#1C1917] selection:bg-orange-100 selection:text-orange-900 ${
        activeTab === "peta" ? "h-screen overflow-hidden" : "min-h-screen overflow-x-hidden"
      }`}
    >
      {activeTab !== "peta" && <SerpentineRoadBackground />}

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
        className={`relative flex-1 flex flex-col ${
          activeTab === "peta" ? "h-full min-h-0 overflow-hidden" : ""
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
                onExploreMap={() => {
                  setActiveTab("peta");
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
              upvotedReportIds={upvotedReportIds}
              onUpvoteReport={handleUpvoteReport}
              officerSession={officerSession}
              onOpenOfficerDashboard={() => {
                setActiveTab("dinas");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
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
              upvotedReportIds={upvotedReportIds}
              onUpvoteReport={handleUpvoteReport}
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
                onOpenReportModal={() => handleOpenReportModal(null)}
                onSwitchToMap={(targetReport = null) => {
                  if (targetReport?.id) {
                    setFocusedReportId(targetReport.id);
                  }
                  if (targetReport?.roadSegmentId) {
                    setFocusedRoadId(targetReport.roadSegmentId);
                  }
                  setActiveTab("peta");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                currentOfficer={officerSession}
                onLogout={handleOfficerLogout}
              />
            )}
          </div>
        )}
      </main>

      {activeToast && (
        <div className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:right-4 z-50 sm:w-[375px] rounded-[10px] bg-white border border-[#E7DDD0] shadow-[0_18px_40px_-12px_rgba(28,25,23,0.18)] overflow-hidden animate-fade-in font-sans">
          <div className="p-3.5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0 ${
                    activeToast.status === "SELESAI"
                      ? "bg-emerald-50 text-emerald-700"
                      : activeToast.status === "TERVERIFIKASI" ||
                        activeToast.type === "STATUS_VERIFIED"
                      ? "bg-sky-50 text-sky-700"
                      : activeToast.type === "REPORT_CREATED" ||
                        activeToast.type === "STATUS_SUBSCRIBED"
                      ? "bg-orange-50 text-[#c2410c]"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {activeToast.status === "SELESAI" ||
                  activeToast.status === "TERVERIFIKASI" ||
                  activeToast.type === "STATUS_VERIFIED" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : activeToast.type === "REPORT_CREATED" ||
                    activeToast.type === "STATUS_SUBSCRIBED" ? (
                    <BellRing className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="text-[11px] font-semibold text-[#9a3412]">
                  Pembaruan Laporan
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveToast(null)}
                className="p-0.5 rounded-[4px] text-stone-400 hover:text-stone-700 cursor-pointer"
                aria-label="Tutup Notifikasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5">
              <div className="text-xs font-bold text-stone-950 font-heading leading-snug">
                {activeToast.title}
              </div>
              <p className="text-[11.5px] text-stone-600 leading-relaxed line-clamp-2">
                {activeToast.message}
              </p>
            </div>
          </div>

          <div className="px-3.5 py-2 bg-[#FAF7F2] border-t border-[#EDE6DC] flex items-center justify-between text-[11px]">
            <span className="text-stone-500 truncate max-w-[180px]">
              {activeToast.officer}
            </span>
            <button
              type="button"
              onClick={() => {
                const target = activeToast;
                setActiveToast(null);
                handleSelectNotification(target);
              }}
              className="font-semibold text-[#c2410c] hover:text-[#9a3412] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <MapPin className="w-3 h-3" />
              <span>
                {activeToast.status === "OVERDUE" || activeToast.type === "SLA_OVERDUE_ALERT"
                  ? "Buka Lacak Laporan"
                  : "Lihat di Peta"}
              </span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {activeTab !== "peta" && activeTab !== "dinas" && <Footer onSelectTab={setActiveTab} activeTab={activeTab} />}

      {/* Global Modals (Rendered at Root with Z-[2000]) */}
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
    </div>
  );
}
