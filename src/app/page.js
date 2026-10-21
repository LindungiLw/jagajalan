"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/dashboard/HeroSection";
import NationalRankingSection from "@/components/dashboard/NationalRankingSection";
import MapExplorer from "@/components/map/MapExplorer";
import ReportModal from "@/components/modals/ReportModal";
import OmbudsmanModal from "@/components/modals/OmbudsmanModal";
import OfficerDashboard from "@/components/dashboard/OfficerDashboard";
import BudgetDataExplorer from "@/components/dashboard/BudgetDataExplorer";
import MapShowcaseTeaser from "@/components/dashboard/MapShowcaseTeaser";
import AnnualProgressChart from "@/components/dashboard/AnnualProgressChart";
import CivicWorkflowSection from "@/components/dashboard/CivicWorkflowSection";
import NationalStatsTeaser from "@/components/dashboard/NationalStatsTeaser";
import LegalBasisSection from "@/components/dashboard/LegalBasisSection";
import { ROAD_SEGMENTS } from "@/data/roadsData";
import { INITIAL_REPORTS } from "@/data/reportsData";
import { Shield, FileText, AlertTriangle, ArrowRight } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("beranda");
  const [roads, setRoads] = useState(ROAD_SEGMENTS);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [ombudsmanModalOpen, setOmbudsmanModalOpen] = useState(false);
  const [selectedOmbudsmanReport, setSelectedOmbudsmanReport] = useState(null);
  const [focusedRoadId, setFocusedRoadId] = useState(null);

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
      />

      {/* Main Tab Content */}
      <main className="flex-1 flex flex-col">
        {activeTab === "beranda" && (
          <div className="space-y-6 animate-fade-in pb-8">
            {/* 1. Hero Section: Crisis Metrics & Problem Definition */}
            <HeroSection
              onExploreMap={() => {
                setActiveTab("peta");
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
            />

            {/* 2. Civic Workflow (How It Works): 4-Step Solution Flow */}
            <CivicWorkflowSection onOpenReportModal={() => setReportModalOpen(true)} />

            {/* 3. Interactive Annual Trend & Progress Diagram (2021-2026) */}
            <AnnualProgressChart />

            {/* 4. Deep-Dive Pilot GIS Showcase Teaser (Bening Frosted Glass) */}
            <MapShowcaseTeaser
              roads={roads}
              reports={reports}
              onExploreMap={() => {
                setActiveTab("peta");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onSelectRoad={handleSelectRoadOnMap}
            />

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
                Instrumen Kepatuhan Hukum Pelayanan Publik
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Pusat Eskalasi Maladministrasi & Rekam Jejak SLA
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Berdasarkan UU No. 25 Tahun 2009 tentang Pelayanan Publik dan pedoman Ombudsman RI, instansi pemerintah wajib menindaklanjuti keluhan masyarakat dengan memberikan tanggapan resmi (maksimal 14 hari kerja). Laporan di bawah ini telah melampaui batas waktu pemantauan tanggapan tanpa respons dinas berwenang.
              </p>
            </div>

            {/* Overdue Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {overdueReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-rose-600 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 font-mono text-xs px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
                      {report.ticketCode}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold">
                      OVERDUE +{report.daysOverdue} HARI KERJA
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{report.roadName}</h3>
                    <p className="text-xs text-slate-500">{report.address} ({report.district})</p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="font-semibold text-rose-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {report.categoryLabel} (Skor Risiko: {report.hazardScore}/100)
                    </div>
                    <p className="text-[11px] text-slate-600">{report.aiAnalysis}</p>
                    <div className="pt-2 text-[11px] border-t border-slate-200 text-slate-600">
                      Instansi Terlapor: <strong className="text-slate-900">{report.authorityLabel}</strong>
                    </div>
                    <div className="text-[11px] text-orange-700">
                      Pagu APBD Terdata: <strong>Rp {((report.matchingBudget?.paguRp || 0)/1000000000).toFixed(1)} Miliar</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenOmbudsmanDraft(report)}
                    className="w-full py-2 px-4 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Lihat & Unduh Draf Laporan Ombudsman RI</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Legal Basis Education Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-600" />
                <span>Landasan Hukum Maladministrasi Penundaan Berlarut (Undue Delay)</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pasal 1 angka 3 UU No. 37 Tahun 2008 tentang Ombudsman RI mendefinisikan Maladministrasi sebagai perilaku melawan hukum, melampaui wewenang, kelalaian, atau <strong>penundaan berlarut dalam penyelenggaraan pelayanan publik</strong>. Jika laporan jalan rusak Anda dibiarkan pemda melampaui batas kewajaran dan membahayakan keselamatan umum, Ombudsman berwenang memanggil dan memeriksa penyelenggara negara terkait.
              </p>
            </div>
          </div>
        )}

        {activeTab === "dinas" && (
          <div className="py-2 animate-fade-in">
            <OfficerDashboard
              reports={reports}
              onUpdateReport={handleUpdateReport}
              onSwitchToMap={() => {
                setActiveTab("peta");
                window.scrollTo({ top: 100, behavior: "smooth" });
              }}
            />
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
