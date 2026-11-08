"use client";

import React, { useState, useEffect, useCallback } from "react";
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

export default function Home() {
  const [activeTab, setActiveTabState] = useState("beranda");
  const [roads, setRoads] = useState(ROAD_SEGMENTS);
  const [reports, setReports] = useState(INITIAL_REPORTS);
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

  const syncReportsFromBackend = useCallback(async () => {
    let localCustom = [];
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("jagajalan_custom_reports_v1");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) localCustom = parsed;
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
          return;
        }
      }
    } catch {
      // Fallback to local + initial reports if API unreachable
    }

    if (localCustom.length > 0) {
      setReports((prev) => mergeReportsById(localCustom, prev, INITIAL_REPORTS));
    }
  }, []);

  useEffect(() => {
    const session = getActiveOfficerSession();
    if (session) {
      setOfficerSession(session);
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const hash = window.location.hash.replace("#", "");
      const validTabs = ["beranda", "peta", "data-anggaran", "ombudsman", "nasional", "dinas"];
      if (tabParam === "admin" || hash === "admin" || tabParam === "portaldinas" || hash === "portaldinas") {
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
        } else if (msg?.type === "UPDATE_REPORT" && msg.id) {
          setReports((prev) =>
            prev.map((rep) => (rep.id === msg.id ? { ...rep, ...msg.updatedFields } : rep))
          );
        }
      };
    }

    return () => {
      clearInterval(intervalId);
      if (bc) bc.close();
    };
  }, [syncReportsFromBackend]);

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
    setRoads((prevRoads) =>
      prevRoads.map((road) =>
        road.id === newReport.roadSegmentId
          ? { ...road, activeReportsCount: (road.activeReportsCount || 0) + 1 }
          : road
      )
    );
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
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === reportId ? { ...report, ...updatedFields } : report
      )
    );

    try {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem("jagajalan_custom_reports_v1");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const updatedLocal = parsed.map((rep) =>
              rep.id === reportId ? { ...rep, ...updatedFields } : rep
            );
            window.localStorage.setItem("jagajalan_custom_reports_v1", JSON.stringify(updatedLocal));
          }
        }
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("jagajalan_live_reports");
          bc.postMessage({ type: "UPDATE_REPORT", id: reportId, updatedFields });
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
    <div className={`relative flex flex-col bg-[#FAF7F2] text-[#1C1917] selection:bg-orange-100 selection:text-orange-900 ${
      activeTab === "peta" ? "h-screen overflow-hidden" : "min-h-screen overflow-x-hidden"
    }`}>
      {/* Global Continuous Serpentine Road Background on Beranda (flows seamlessly from Hero into Footer) */}
      {activeTab === "beranda" && <SerpentineRoadBackground />}

      {/* Global Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => handleOpenReportModal(null)}
        officerSession={officerSession}
        onLogoutOfficer={handleOfficerLogout}
      />

      {/* Main Tab Content */}
      <main className={`relative z-10 flex-1 flex flex-col ${activeTab === "peta" ? "min-h-0 overflow-hidden" : ""}`}>
        {activeTab === "beranda" && (
          <div className="space-y-6 animate-fade-in pb-4 relative">
            <div className="relative z-10 space-y-6">
              {/* 1. Hero Section: Data Transparency & Live Ruas Inspector */}
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

              {/* 2. Civic Workflow (How It Works): 4-Step Solution Flow */}
              <CivicWorkflowSection onOpenReportModal={() => handleOpenReportModal(null)} />

              {/* 3. Legal Foundation & Public Transparency Basis */}
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
            {/* 1. Macro Annual Trend & Progress Diagram (2020-2024 Context) */}
            <AnnualProgressChart />

            {/* 2. Full 38 Provinces Scoreboard & Registry */}
            <NationalRankingSection onSelectPilot={handleSelectPilot} />
          </div>
        )}

        {activeTab === "ombudsman" && (
          <div className="py-2 animate-fade-in flex-1">
            <OmbudsmanMonitorSection
              reports={reports}
              onOpenOmbudsmanDraft={handleOpenOmbudsmanDraft}
              onSelectRoadOnMap={handleSelectRoadOnMap}
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

      {/* Global Footer (shown on all pages except full-screen GIS map) */}
      {activeTab !== "peta" && <Footer onSelectTab={setActiveTab} activeTab={activeTab} />}
    </div>
  );
}
