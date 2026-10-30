"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/dashboard/HeroSection";
import NationalRankingSection from "@/components/dashboard/NationalRankingSection";
import MapExplorer from "@/components/map/MapExplorer";
import ReportModal from "@/components/modals/ReportModal";
import OmbudsmanModal from "@/components/modals/OmbudsmanModal";
import OfficerDashboard from "@/components/dashboard/OfficerDashboard";
import OfficerLogin from "@/components/dashboard/OfficerLogin";
import BudgetDataExplorer from "@/components/dashboard/BudgetDataExplorer";
import AnnualProgressChart from "@/components/dashboard/AnnualProgressChart";
import CivicWorkflowSection from "@/components/dashboard/CivicWorkflowSection";
import LegalBasisSection from "@/components/dashboard/LegalBasisSection";
import OmbudsmanMonitorSection from "@/components/dashboard/OmbudsmanMonitorSection";
import { ROAD_SEGMENTS } from "@/data/roadsData";
import { INITIAL_REPORTS } from "@/data/reportsData";
import { getActiveOfficerSession, clearOfficerSession } from "@/data/officersData";

export default function Home() {
  const [activeTab, setActiveTabState] = useState("beranda");
  const [roads, setRoads] = useState(ROAD_SEGMENTS);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [ombudsmanModalOpen, setOmbudsmanModalOpen] = useState(false);
  const [selectedOmbudsmanReport, setSelectedOmbudsmanReport] = useState(null);
  const [focusedRoadId, setFocusedRoadId] = useState(null);
  const [officerSession, setOfficerSession] = useState(null);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Restore existing officer session & tab on mount
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
      if (tabParam === "admin" || hash === "admin") {
        setActiveTabState("dinas");
      } else if (tabParam && validTabs.includes(tabParam)) {
        setActiveTabState(tabParam);
      } else if (hash && validTabs.includes(hash)) {
        setActiveTabState(hash);
      }
    }
  }, []);

  const handleOfficerLogin = (officer) => {
    setOfficerSession(officer);
  };

  const handleOfficerLogout = () => {
    clearOfficerSession();
    setOfficerSession(null);
  };

  const handleAddNewReport = (newReport) => {
    setReports((prev) => [newReport, ...prev]);
    setRoads((prevRoads) =>
      prevRoads.map((road) =>
        road.id === newReport.roadSegmentId
          ? { ...road, activeReportsCount: road.activeReportsCount + 1 }
          : road
      )
    );
  };

  const handleUpdateReport = (reportId, updatedFields) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === reportId ? { ...report, ...updatedFields } : report
      )
    );
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
    <div className={`flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-orange-100 selection:text-orange-900 ${
      activeTab === "peta" ? "h-screen overflow-hidden" : "min-h-screen"
    }`}>
      {/* Global Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setReportModalOpen(true)}
        officerSession={officerSession}
        onLogoutOfficer={handleOfficerLogout}
      />

      {/* Main Tab Content */}
      <main className={`flex-1 flex flex-col ${activeTab === "peta" ? "min-h-0 overflow-hidden" : ""}`}>
        {activeTab === "beranda" && (
          <div className="space-y-6 animate-fade-in pb-8">
            {/* 1. Hero Section: Data Transparency & Live Ruas Inspector */}
            <HeroSection
              roads={roads}
              reports={reports}
              onExploreData={() => {
                setActiveTab("data-anggaran");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onOpenReport={() => setReportModalOpen(true)}
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
            <CivicWorkflowSection onOpenReportModal={() => setReportModalOpen(true)} />

            {/* 3. Legal Foundation & Public Transparency Basis */}
            <LegalBasisSection />
          </div>
        )}

        {activeTab === "peta" && (
          <div className="w-full h-full min-h-0 overflow-hidden animate-fade-in flex-1">
            <MapExplorer
              roads={roads}
              reports={reports}
              onOpenOmbudsmanDraft={handleOpenOmbudsmanDraft}
              onOpenReportModal={() => setReportModalOpen(true)}
              focusedRoadId={focusedRoadId}
            />
          </div>
        )}

        {activeTab === "data-anggaran" && (
          <div className="py-2 animate-fade-in flex-1">
            <BudgetDataExplorer
              roads={roads}
              reports={reports}
              onSelectRoadOnMap={handleSelectRoadOnMap}
              onOpenReportModal={() => setReportModalOpen(true)}
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
        onClose={() => setReportModalOpen(false)}
        roads={roads}
        onNewReportAdded={handleAddNewReport}
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
      {activeTab !== "peta" && <Footer onSelectTab={setActiveTab} />}
    </div>
  );
}
