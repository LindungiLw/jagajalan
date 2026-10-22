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
import MapShowcaseTeaser from "@/components/dashboard/MapShowcaseTeaser";
import AnnualProgressChart from "@/components/dashboard/AnnualProgressChart";
import CivicWorkflowSection from "@/components/dashboard/CivicWorkflowSection";
import NationalStatsTeaser from "@/components/dashboard/NationalStatsTeaser";
import LegalBasisSection from "@/components/dashboard/LegalBasisSection";
import { ROAD_SEGMENTS } from "@/data/roadsData";
import { INITIAL_REPORTS } from "@/data/reportsData";
import { getActiveOfficerSession, clearOfficerSession } from "@/data/officersData";
import { Shield, FileText, AlertTriangle, ArrowRight } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("beranda");
  const [roads, setRoads] = useState(ROAD_SEGMENTS);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [ombudsmanModalOpen, setOmbudsmanModalOpen] = useState(false);
  const [selectedOmbudsmanReport, setSelectedOmbudsmanReport] = useState(null);
  const [focusedRoadId, setFocusedRoadId] = useState(null);
  const [officerSession, setOfficerSession] = useState(null);

  // Restore existing officer session on mount
  useEffect(() => {
    const session = getActiveOfficerSession();
    if (session) {
      setOfficerSession(session);
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

  const overdueReports = reports.filter((r) => r.status === "OVERDUE");

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      {/* Global Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setReportModalOpen(true)}
        officerSession={officerSession}
        onLogoutOfficer={handleOfficerLogout}
      />

      {/* Main Tab Content */}
      <main className="flex-1 flex flex-col">
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

            {/* 3. Interactive Annual Trend & Progress Diagram (2021-2026) */}
            <AnnualProgressChart />

            {/* 5. Macro National Stats Teaser (Directs to Full 38-Provinces Tab) */}
            <NationalStatsTeaser
              onExploreNational={() => {
                setActiveTab("nasional");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />

            {/* 6. Legal Foundation & Public Transparency Basis */}
            <LegalBasisSection />
          </div>
        )}

        {activeTab === "peta" && (
          <div className="w-full h-[calc(100vh-4rem)] overflow-hidden animate-fade-in flex-1">
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
          <div className="py-4 animate-fade-in">
            <NationalRankingSection onSelectPilot={handleSelectPilot} />
          </div>
        )}

        {activeTab === "ombudsman" && (
          <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
            {/* Header */}
            <div>
              <div className="text-[11px] font-bold tracking-wider uppercase text-rose-700 font-mono mb-1">
                Instrumen Kepatuhan Hukum & Standar Ombudsman RI
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Pusat Pemantauan Tanggapan & Opsi Eskalasi Pengaduan
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Berdasarkan standar pemantauan operasional JagaJalan yang merujuk pada asas pelayanan publik (UU No. 25/2009), aduan dipantau selama 14 hari kerja untuk mencatat respons resmi dinas. Ketiadaan tanggapan dapat menjadi dasar bagi warga untuk menyiapkan draf pengaduan penundaan berlarut (*undue delay*) kepada Ombudsman Republik Indonesia.
              </p>
            </div>

            {/* National Ombudsman Context Card */}
            <div className="p-4 rounded-[5px] bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 font-mono uppercase text-[11px]">
                <Shield className="w-3.5 h-3.5 text-[#c2410c]" />
                <span>Konteks Statistik Nasional Ombudsman RI (Laporan Tahunan 2024 & 2025):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-2.5 rounded-[5px] bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Penundaan Berlarut (2024)</div>
                  <strong className="text-sm font-bold text-slate-900 font-mono">33,86% Laporan Selesai</strong>
                  <div className="text-[10px] text-slate-500 mt-0.5">Jenis maladministrasi terbanyak yang ditutup tahun 2024</div>
                </div>
                <div className="p-2.5 rounded-[5px] bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Laporan Pemda (2025)</div>
                  <strong className="text-sm font-bold text-slate-900 font-mono">4.766 Laporan</strong>
                  <div className="text-[10px] text-slate-500 mt-0.5">Kelompok instansi terlapor terbanyak di Indonesia</div>
                </div>
                <div className="p-2.5 rounded-[5px] bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Infrastruktur & Jalan (2025)</div>
                  <strong className="text-sm font-bold text-slate-900 font-mono">287 Laporan Jalan Rusak</strong>
                  <div className="text-[10px] text-slate-500 mt-0.5">Dari 622 laporan substansi perhubungan & sarana fisik</div>
                </div>
              </div>
            </div>

            {/* Overdue Reports Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-900 text-sm">
                  Laporan Pilot yang Melewati Tenggat Pemantauan ({overdueReports.length} Kasus)
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Tenggat Pemantauan Respons: 14 Hari Kerja
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overdueReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white p-5 rounded-[5px] border border-slate-200 border-l-4 border-l-rose-600 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 font-mono text-xs px-2.5 py-1 rounded-[5px] bg-slate-100 border border-slate-200">
                        {report.ticketCode}
                      </span>
                      <span className="px-2 py-0.5 rounded-[5px] bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold font-mono">
                        MELEWATI TENGGAT (+{report.daysOverdue} HARI)
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{report.roadName}</h3>
                      <p className="text-xs text-slate-500">{report.address} ({report.district})</p>
                    </div>

                    <div className="p-3.5 rounded-[5px] bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="font-semibold text-rose-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {report.categoryLabel} (Skor Risiko AI: {report.hazardScore}/100)
                      </div>
                      <p className="text-[11px] text-slate-600">{report.aiAnalysis}</p>
                      <div className="pt-2 text-[11px] border-t border-slate-200 text-slate-600">
                        Instansi Terlapor: <strong className="text-slate-900">{report.authorityLabel}</strong>
                      </div>
                      <div className="text-[11px] text-orange-800">
                        Pagu APBD Terdata: <strong>Rp {((report.matchingBudget?.paguRp || 0)/1000000000).toFixed(2)} Miliar</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenOmbudsmanDraft(report)}
                      className="w-full py-2 px-4 rounded-[5px] text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Siapkan Draf Pengaduan Ombudsman RI</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Basis Education Card */}
            <div className="bg-white p-5 rounded-[5px] border border-slate-200 shadow-2xs space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-700" />
                <span>Pedoman Penanganan Dugaan Maladministrasi Penundaan Berlarut (*Undue Delay*)</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pasal 1 angka 3 UU No. 37 Tahun 2008 tentang Ombudsman RI mendefinisikan Maladministrasi sebagai perilaku melawan hukum, melampaui wewenang, kelalaian, atau <strong>penundaan berlarut dalam penyelenggaraan pelayanan publik</strong>. JagaJalan memfasilitasi pelapor dengan menyusun kronologi geotagged dan bukti administrasi digital, dengan ketentuan pelapor telah menyampaikan keluhan awal kepada instansi terkait sebelum eskalasi ke Ombudsman RI.
              </p>
            </div>
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
