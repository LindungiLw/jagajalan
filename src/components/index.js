/**
 * JagaJalan Component Library
 * Centralized barrel export for enterprise modular architecture.
 */

// Layout Components
export { default as Navbar } from "./layout/Navbar";
export { default as Footer } from "./layout/Footer";
export { default as SerpentineRoadBackground } from "./layout/SerpentineRoadBackground";

// Dashboard & Metrics Components
export { default as HeroSection } from "./dashboard/HeroSection";
export { default as NationalRankingSection } from "./dashboard/NationalRankingSection";
export { default as OfficerDashboard } from "./dashboard/OfficerDashboard";
export { default as OfficerLogin } from "./dashboard/OfficerLogin";
export { default as BudgetDataExplorer } from "./dashboard/BudgetDataExplorer";
export { default as AnnualProgressChart } from "./dashboard/AnnualProgressChart";
export { default as CivicWorkflowSection } from "./dashboard/CivicWorkflowSection";
export { default as LegalBasisSection } from "./dashboard/LegalBasisSection";
export { default as OmbudsmanMonitorSection } from "./dashboard/OmbudsmanMonitorSection";

// Geospatial & Map Components (MapInner is loaded dynamically inside MapExplorer with ssr:false)
export { default as MapExplorer } from "./map/MapExplorer";

// Modals & Civic Escalation
export { default as ReportModal } from "./modals/ReportModal";
export { default as OmbudsmanModal } from "./modals/OmbudsmanModal";
export { default as RoadDetailModal } from "./modals/RoadDetailModal";
