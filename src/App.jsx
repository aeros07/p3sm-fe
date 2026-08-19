import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFoundPage from "./pages/NotFoundPage";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProjectPage = lazy(() => import("./pages/Project"));
const ParticipantPage = lazy(() => import("./pages/Participant"));
const ParticipantDetailPage = lazy(() => import("./pages/Participant/detail"));
const DocumentPage = lazy(() => import("./pages/Document"));
const OcrScreeningPage = lazy(() => import("./pages/OcrScreening"));
const AiValidationPage = lazy(() => import("./pages/AiValidation"));
const ValidationResultPage = lazy(() => import("./pages/ValidationResult"));
const RecommendationPage = lazy(() => import("./pages/Recommendation"));
const ProcessMonitoringPage = lazy(() => import("./pages/ProcessMonitoring"));
const UserRolePage = lazy(() => import("./pages/UserRole"));
const SettingPage = lazy(() => import("./pages/Setting"));
const AnalyticsPage = lazy(() => import("./pages/Report/Analytics"));
const ReportListPage = lazy(() => import("./pages/Report/List"));
const TokenUsagePage = lazy(() => import("./pages/TokenUsage"));
const ExportDataPage = lazy(() => import("./pages/ExportData"));
const AturanValidasiPage = lazy(() => import("./pages/AturanValidasi"));
const SkemaSertifikasiPage = lazy(() => import("./pages/SkemaSertifikasi"));

const App = () => {
  return (
    <Suspense fallback={null}>
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
    </Suspense>
  );
};

export default App;
