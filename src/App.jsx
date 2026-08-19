import React from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
// import Dashboard from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import ProjectPage from "./pages/Project";
import ParticipantPage from "./pages/Participant";
import ParticipantDetailPage from "./pages/Participant/detail";
import DocumentPage from "./pages/Document";
import OcrScreeningPage from "./pages/OcrScreening";
import AiValidationPage from "./pages/AiValidation";
import ValidationResultPage from "./pages/ValidationResult";
import RecommendationPage from "./pages/Recommendation";
import ProcessMonitoringPage from "./pages/ProcessMonitoring";
import UserRolePage from "./pages/UserRole";
import SettingPage from "./pages/Setting";
import AnalyticsPage from "./pages/Report/Analytics";
import ReportListPage from "./pages/Report/List";
import TokenUsagePage from "./pages/TokenUsage";
import ExportDataPage from "./pages/ExportData";
import AturanValidasiPage from "./pages/AturanValidasi";
import SkemaSertifikasiPage from "./pages/SkemaSertifikasi";
import DummyPage from "./pages/DummyPage";

const App = () => {
  return (
    <Routes>
      {/* Protected route + layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Semua route di dalam layout */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/project" element={<ProjectPage />} />
        <Route path="/data-peserta" element={<ParticipantPage />} />
        <Route path="/peserta" element={<ParticipantPage />} />
        <Route path="/peserta/:id" element={<ParticipantDetailPage />} />
        <Route path="/dokumen" element={<DocumentPage />} />
        <Route path="/screening-ocr" element={<OcrScreeningPage />} />
        <Route path="/validasi-ai" element={<AiValidationPage />} />
        <Route path="/hasil-validasi" element={<ValidationResultPage />} />
        <Route path="/rekomendasi" element={<RecommendationPage />} />
        <Route path="/monitoring-proses" element={<ProcessMonitoringPage />} />
        <Route
          path="/laporan"
          element={<Dashboard title="Laporan" subtitle="Laporan umum sistem" />}
        />
        <Route
          path="/analytics"
          element={
            <Dashboard
              title="Analytics"
              subtitle="Analitik dan statistik data"
            />
          }
        />
        <Route
          path="/export-data"
          element={<ExportDataPage />}
        />
        <Route
          path="/skema-sertifikasi"
          element={<SkemaSertifikasiPage />}
        />
        <Route
          path="/aturan-validasi"
          element={<AturanValidasiPage />}
        />
        <Route
          path="/user-role"
          element={<UserRolePage />}
        />
        <Route
          path="/pengaturan-sistem"
          element={<SettingPage />}
        />
        
        {/* Laporan & Analytics Prototype */}
        <Route
          path="/laporan/analytics"
          element={<AnalyticsPage />}
        />
        <Route
          path="/laporan/data"
          element={<ReportListPage />}
        />
        <Route
          path="/penggunaan-token"
          element={<TokenUsagePage />}
        />

        {/* 404 di dalam layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
};

export default App;
