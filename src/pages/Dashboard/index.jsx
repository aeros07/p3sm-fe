import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Chart from "react-apexcharts";
import axiosClient from "../../api/axiosClient";
import CustomDatePicker from "../../components/CustomDatePicker";
import "./dashboard.css";

const Dashboard = () => {
  document.title = "Dashboard - AI Document Validation System";
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    stat_cards: {
      total_peserta: 0,
      total_dokumen: 0,
      sudah_validasi: 0,
      sesuai_valid: 0,
      tidak_sesuai: 0,
      menunggu_proses: 0,
      validasi_percentage: 0,
      sesuai_percentage: 0,
      tidak_sesuai_percentage: 0,
      menunggu_percentage: 0,
    },
    stepper: {
      import_data: 0,
      ambil_dokumen: 0,
      screening_ocr: 0,
      ekstraksi_data: 0,
      validasi_ai: 0,
      hasil_rekomendasi: 0,
      selesai: 0,
      gagal_ocr: 0,
      gagal_validasi: 0,
      overall_progress: 0,
    },
    charts: {
      ringkasan_validasi: { sesuai: 0, tidak_sesuai: 0, error_ocr: 0, pending: 0, total: 0 },
      error_analysis: { rendering_gagal: 0, ocr_gagal: 0, validasi_gagal: 0, total: 0 },
      performa_proses: [],
    },
  });

  // Dashboard 2 State
  const [kelengkapanData, setKelengkapanData] = useState({
    stat_cards: {
      total_peserta: 0,
      total_dokumen: 0,
      total_link: 0,
      bisa_dibuka: 0,
      dokumen_sesuai: 0,
      dokumen_tidak_sesuai: 0,
      link_percentage: 0,
      buka_percentage: 0,
      sesuai_percentage: 0,
      tidak_sesuai_percentage: 0,
    },
    tabel_kategori: [],
    ringkasan_kelengkapan: {
      sesuai: 0,
      tidak_sesuai: 0,
      tidak_ada_link: 0,
      tidak_bisa_dibuka: 0,
      total: 0,
      sesuai_percentage: 0,
      tidak_sesuai_percentage: 0,
      tidak_ada_link_percentage: 0,
      tidak_bisa_dibuka_percentage: 0,
    },
    ocr_summary: {
      total: 0,
      berhasil: 0,
      gagal: 0,
      belum: 0,
      berhasil_percentage: 0,
      gagal_percentage: 0,
      belum_percentage: 0,
    },
    performa_7hari: [],
  });

  const [recentParticipants, setRecentParticipants] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [dateRange, setDateRange] = useState({
    startDate: "2026-05-25",
    endDate: "2026-05-31",
  });

  useEffect(() => {
    fetchDashboardSummary();
    fetchRecentParticipants();
    fetchDashboardKelengkapan();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      const res = await axiosClient.get("/dashboard/summary");
      if (res.data?.success) {
        setSummaryData(res.data);
      }
    } catch (err) {
      console.error("Gagal memuat summary dashboard:", err);
    }
  };

  const fetchRecentParticipants = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get("/dashboard/recent-participants");
      if (res.data?.success) {
        const list = res.data.data || [];
        setRecentParticipants(list);
      }
    } catch (err) {
      console.error("Gagal memuat peserta terbaru:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardKelengkapan = async () => {
    try {
      const res = await axiosClient.get("/dashboard/kelengkapan");
      if (res.data?.success) {
        setKelengkapanData(res.data);
      }
    } catch (err) {
      console.error("Gagal memuat data kelengkapan dashboard:", err);
    }
  };

  // ApexCharts Configurations — Dashboard 1
  const { ringkasan_validasi, error_analysis, performa_proses } = summaryData.charts;

  const apexHasilValidasiOptions = {
    chart: { type: "donut", sparkline: { enabled: true } },
    labels: ["Sesuai (Valid)", "Tidak Sesuai", "Error OCR", "Pending"],
    colors: ["#0bb783", "#f64e60", "#8950fc", "#ffa800"],
    stroke: { width: 2, colors: ["#ffffff"] },
    tooltip: {
      enabled: true,
      y: { formatter: (val) => `${val} Dokumen` },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: { show: false },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
  };

  const apexHasilValidasiSeries = [
    ringkasan_validasi.sesuai,
    ringkasan_validasi.tidak_sesuai,
    ringkasan_validasi.error_ocr,
    ringkasan_validasi.pending,
  ];

  // Daily performance trend chart
  const categoriesTrend = performa_proses.length > 0
    ? performa_proses.map(item => item.date)
    : ["25 Mei", "26 Mei", "27 Mei", "28 Mei", "29 Mei", "30 Mei", "31 Mei"];

  const importSeriesData = performa_proses.length > 0
    ? performa_proses.map(item => parseInt(item.import_count || 0, 10))
    : [1100, 1250, 1200, 1150, 1000, 1020, 1010];

  const apexPerformaProsesOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#3699ff", "#0bb783", "#f64e60", "#8950fc"],
    stroke: { curve: "smooth", width: 2.5 },
    xaxis: {
      categories: categoriesTrend,
      labels: { style: { fontSize: "10px", colors: "#64748b" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      tickAmount: 4,
      min: 0,
      labels: {
        style: { fontSize: "10px", colors: "#64748b" },
        formatter: (val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val),
      },
    },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 3 },
    markers: { size: 3, hover: { size: 5 } },
    tooltip: { theme: "light", style: { fontSize: "11px" } },
    legend: { show: false },
  };

  const apexPerformaProsesSeries = [
    { name: "Import Data", data: importSeriesData },
    { name: "Screening OCR", data: importSeriesData.map(v => Math.round(v * 0.85)) },
    { name: "Validasi AI", data: importSeriesData.map(v => Math.round(v * 0.70)) },
    { name: "Selesai", data: importSeriesData.map(v => Math.round(v * 0.60)) },
  ];

  const apexErrorAnalysisOptions = {
    chart: { type: "donut", sparkline: { enabled: true } },
    labels: ["Rendering Gagal", "OCR Gagal", "Validasi Gagal"],
    colors: ["#f64e60", "#ffa800", "#8950fc"],
    stroke: { width: 2, colors: ["#ffffff"] },
    tooltip: {
      enabled: true,
      y: { formatter: (val) => `${val} Error` },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: { show: false },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
  };

  const apexErrorAnalysisSeries = [
    error_analysis.rendering_gagal,
    error_analysis.ocr_gagal,
    error_analysis.validasi_gagal,
  ];

  // Dummy Methods TTD Chart
  const apexMetodeTTDOptions = {
    chart: { type: "donut", sparkline: { enabled: true } },
    labels: ["QR Code (Paperless)", "Tanda Tangan Basah"],
    colors: ["#0bb783", "#3699ff"],
    stroke: { width: 2, colors: ["#ffffff"] },
    tooltip: {
      enabled: true,
      y: { formatter: (val) => `${val} Dokumen` },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: { show: false },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
  };

  const apexMetodeTTDSeries = [890, 366];

  // =========================================================================
  // ApexCharts Configurations — Dashboard 2
  // =========================================================================
  const { ringkasan_kelengkapan, performa_7hari, ocr_summary } = kelengkapanData;

  const apexKelengkapanOptions = {
    chart: { type: "donut", sparkline: { enabled: true } },
    labels: ["Sesuai", "Tidak Sesuai", "Tidak Ada Link", "Tidak Bisa Dibuka"],
    colors: ["#0bb783", "#f64e60", "#94a3b8", "#ffa800"],
    stroke: { width: 2, colors: ["#ffffff"] },
    tooltip: {
      enabled: true,
      y: { formatter: (val) => `${val} Dokumen` },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: { show: false },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
  };

  const apexKelengkapanSeries = [
    ringkasan_kelengkapan.sesuai,
    ringkasan_kelengkapan.tidak_sesuai,
    ringkasan_kelengkapan.tidak_ada_link,
    ringkasan_kelengkapan.tidak_bisa_dibuka,
  ];

  const categoriesD2 = performa_7hari.length > 0
    ? performa_7hari.map(item => item.date)
    : ["25 Mei", "26 Mei", "27 Mei", "28 Mei", "29 Mei", "30 Mei", "31 Mei"];

  const linkAdaData = performa_7hari.length > 0
    ? performa_7hari.map(item => parseInt(item.link_ada || 0, 10))
    : [1200, 1300, 1320, 1310, 1290, 1280, 1285];

  const bukaBisaData = performa_7hari.length > 0
    ? performa_7hari.map(item => parseInt(item.buka_bisa || 0, 10))
    : [1000, 1120, 1150, 1140, 1110, 1100, 1105];

  const sesuaiData = performa_7hari.length > 0
    ? performa_7hari.map(item => parseInt(item.sesuai_ya || 0, 10))
    : [700, 850, 880, 870, 850, 840, 845];

  const tidakSesuaiData = performa_7hari.length > 0
    ? performa_7hari.map(item => parseInt(item.sesuai_tidak || 0, 10))
    : [200, 250, 230, 240, 220, 210, 215];

  const apexPerformaD2Options = {
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#3699ff", "#0bb783", "#8950fc", "#f64e60"],
    stroke: { curve: "smooth", width: 2.5 },
    xaxis: {
      categories: categoriesD2,
      labels: { style: { fontSize: "10px", colors: "#64748b" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      tickAmount: 4,
      min: 0,
      labels: {
        style: { fontSize: "10px", colors: "#64748b" },
        formatter: (val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val),
      },
    },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 3 },
    markers: { size: 3, hover: { size: 5 } },
    tooltip: { theme: "light", style: { fontSize: "11px" } },
    legend: { show: false },
  };

  const apexPerformaD2Series = [
    { name: "Link Ada", data: linkAdaData },
    { name: "Bisa Dibuka", data: bukaBisaData },
    { name: "Sesuai", data: sesuaiData },
    { name: "Tidak Sesuai", data: tidakSesuaiData },
  ];

  // Helper check detail validator
  const checkValidatorStatus = (candidate, key) => {
    if (!candidate) return false;
    const detail = candidate.ai_result_json?.detail;
    if (detail && detail[key]) {
      return detail[key].toUpperCase() === "PASS";
    }
    return candidate.ai_result_status === "pass";
  };

  const { stat_cards, stepper } = summaryData;
  const d2Stat = kelengkapanData.stat_cards;

  return (
    <div>
      {/* Date range filter bar */}
      <div className="d-flex align-items-center justify-content-end gap-2 mb-3">
        <div
          className="d-flex align-items-center gap-2 bg-white px-3 py-1 rounded border shadow-sm"
          style={{ height: "36px" }}
        >
          <span className="fs-12 text-muted fw-medium whitespace-nowrap">
            Dari Tanggal:
          </span>
          <CustomDatePicker
            value={dateRange.startDate}
            onChange={(val) =>
              setDateRange({ ...dateRange, startDate: val })
            }
            className="form-control form-control-sm border-0 fs-12 p-0 text-dark bg-transparent"
            style={{ width: "115px" }}
          />
          <span className="fs-12 text-muted fw-medium whitespace-nowrap ms-2">
            Sampai Tanggal:
          </span>
          <CustomDatePicker
            value={dateRange.endDate}
            onChange={(val) =>
              setDateRange({ ...dateRange, endDate: val })
            }
            className="form-control form-control-sm border-0 fs-12 p-0 text-dark bg-transparent"
            style={{ width: "115px" }}
          />
        </div>
        <button
          className="btn btn-primary btn-sm px-3 d-flex align-items-center gap-1 shadow-sm"
          style={{ height: "36px" }}
          onClick={() => {
            fetchDashboardSummary();
            fetchRecentParticipants();
            fetchDashboardKelengkapan();
          }}
        >
          <i className="ti ti-filter fs-14"></i> Filter
        </button>
      </div>

      {/* TOP ROW: 6 STAT CARDS */}
      <div className="row g-3 mb-4">
        {/* Total Peserta */}
        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card stat-card h-100 mb-0">
            <div className="card-body stat-card-body">
              <div className="d-flex align-items-center mb-2">
                <div className="icon-box-shape icon-bg-primary-light me-2">
                  <i className="ti ti-users"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">
                    Total Peserta
                  </div>
                  <h4 className="fw-bold fs-18 mb-0">
                    {stat_cards.total_peserta.toLocaleString("id-ID")}
                  </h4>
                </div>
              </div>
              <div className="fs-11 text-success fw-medium">
                <i className="ti ti-arrow-up-right me-1"></i>
                {stat_cards.validasi_percentage}%{" "}
                <span className="text-muted">divalidasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Dokumen */}
        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card stat-card h-100 mb-0">
            <div className="card-body stat-card-body">
              <div className="d-flex align-items-center mb-2">
                <div className="icon-box-shape icon-bg-success-light me-2">
                  <i className="ti ti-folder"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">
                    Total Dokumen
                  </div>
                  <h4 className="fw-bold fs-18 mb-0">
                    {stat_cards.total_dokumen.toLocaleString("id-ID")}
                  </h4>
                </div>
              </div>
              <div className="fs-11 text-success fw-medium">
                <i className="ti ti-check me-1"></i>100%{" "}
                <span className="text-muted">terunggah</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sudah Validasi */}
        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card stat-card h-100 mb-0">
            <div className="card-body stat-card-body">
              <div className="d-flex align-items-center mb-2">
                <div className="icon-box-shape icon-bg-purple-light me-2">
                  <i className="ti ti-file-check"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">
                    Sudah Validasi
                  </div>
                  <h4 className="fw-bold fs-18 mb-0">
                    {stat_cards.sudah_validasi.toLocaleString("id-ID")}
                  </h4>
                </div>
              </div>
              <div className="fs-11 text-muted fw-medium">
                {stat_cards.validasi_percentage}% dari total
              </div>
            </div>
          </div>
        </div>

        {/* Sesuai (Valid) */}
        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card stat-card h-100 mb-0">
            <div className="card-body stat-card-body">
              <div className="d-flex align-items-center mb-2">
                <div className="icon-box-shape icon-box-success me-2">
                  <i className="ti ti-check"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">
                    Sesuai (Valid)
                  </div>
                  <h4 className="fw-bold fs-18 mb-0 text-success">
                    {stat_cards.sesuai_valid.toLocaleString("id-ID")}
                  </h4>
                </div>
              </div>
              <div className="fs-11 text-success fw-medium">
                {stat_cards.sesuai_percentage}%{" "}
                <span className="text-muted">dari validasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tidak Sesuai */}
        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card stat-card h-100 mb-0">
            <div className="card-body stat-card-body">
              <div className="d-flex align-items-center mb-2">
                <div className="icon-box-shape icon-box-danger me-2">
                  <i className="ti ti-x"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">Tidak Sesuai</div>
                  <h4 className="fw-bold fs-18 mb-0 text-danger">
                    {stat_cards.tidak_sesuai.toLocaleString("id-ID")}
                  </h4>
                </div>
              </div>
              <div className="fs-11 text-danger fw-medium">
                {stat_cards.tidak_sesuai_percentage}%{" "}
                <span className="text-muted">dari validasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menunggu Proses */}
        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card stat-card h-100 mb-0">
            <div className="card-body stat-card-body">
              <div className="d-flex align-items-center mb-2">
                <div className="icon-box-shape icon-box-warning me-2">
                  <i className="ti ti-clock"></i>
                </div>
                <div>
                  <div className="text-muted fs-12 fw-medium">
                    Menunggu Proses
                  </div>
                  <h4 className="fw-bold fs-18 mb-0 text-warning">
                    {stat_cards.menunggu_proses.toLocaleString("id-ID")}
                  </h4>
                </div>
              </div>
              <div className="fs-11 text-muted fw-medium">
                {stat_cards.menunggu_percentage}% dari total
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: END TO END STEPPER FLOW */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card process-flow-card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold fs-15 mb-0">
                  Alur Proses Validasi Dokumen (End to End)
                </h5>
                <div className="d-flex align-items-center gap-2">
                  <Link
                    to="/monitoring-proses"
                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center px-3"
                    style={{ height: "34px", fontSize: "12px" }}
                  >
                    Lihat Detail Proses
                  </Link>
                  <button
                    type="button"
                    className="btn btn-sm btn-light border d-inline-flex align-items-center justify-content-center px-2"
                    style={{ height: "34px", width: "34px" }}
                    onClick={fetchDashboardSummary}
                    title="Refresh Data Dashboard"
                  >
                    <i className="ti ti-refresh text-muted fs-15"></i>
                  </button>
                </div>
              </div>

              {/* Stepper Steps */}
              <div className="stepper-wrapper">
                {/* Step 1 */}
                <div className="stepper-step">
                  <div className="step-icon-wrapper step-icon-excel">
                    <i className="ti ti-file-spreadsheet"></i>
                  </div>
                  <div className="step-title">1. Import Data</div>
                  <div className="step-count">
                    {stepper.import_data.toLocaleString("id-ID")}
                  </div>
                  <div className="step-status">Selesai</div>
                  <div className="stepper-arrow">
                    <i className="ti ti-arrow-right"></i>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="stepper-step">
                  <div className="step-icon-wrapper step-icon-cloud">
                    <i className="ti ti-cloud-download"></i>
                  </div>
                  <div className="step-title">2. Ambil Dokumen</div>
                  <div className="step-count">
                    {stepper.ambil_dokumen.toLocaleString("id-ID")}
                  </div>
                  <div className="step-status">Selesai</div>
                  <div className="stepper-arrow">
                    <i className="ti ti-arrow-right"></i>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="stepper-step">
                  <div className="step-floating-badge badge-in-progress">
                    Sedang Proses
                  </div>
                  <div className="step-icon-wrapper step-icon-ocr">
                    <i className="ti ti-scan"></i>
                  </div>
                  <div className="step-title">3. Screening OCR</div>
                  <div className="step-count">
                    {stepper.screening_ocr.toLocaleString("id-ID")}
                  </div>
                  <div className="step-status">Selesai</div>
                  <div className="stepper-arrow">
                    <i className="ti ti-arrow-right"></i>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="stepper-step">
                  <div className="step-icon-wrapper step-icon-extract">
                    <i className="ti ti-file-text"></i>
                  </div>
                  <div className="step-title">4. Ekstraksi Data</div>
                  <div className="step-count">
                    {stepper.ekstraksi_data.toLocaleString("id-ID")}
                  </div>
                  <div className="step-status">Selesai</div>
                  <div className="stepper-arrow">
                    <i className="ti ti-arrow-right"></i>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="stepper-step">
                  {stepper.gagal_ocr > 0 && (
                    <div className="step-floating-badge badge-ocr-error">
                      - {stepper.gagal_ocr} Gagal OCR
                    </div>
                  )}
                  <div className="step-icon-wrapper step-icon-ai">
                    <i className="ti ti-brain"></i>
                  </div>
                  <div className="step-title">5. Validasi AI</div>
                  <div className="step-count">
                    {stepper.validasi_ai.toLocaleString("id-ID")}
                  </div>
                  <div className="step-status">Selesai</div>
                  <div className="stepper-arrow">
                    <i className="ti ti-arrow-right"></i>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="stepper-step">
                  {stepper.gagal_validasi > 0 && (
                    <div className="step-floating-badge badge-ocr-error">
                      - {stepper.gagal_validasi} Gagal Validasi
                    </div>
                  )}
                  <div className="step-icon-wrapper step-icon-result">
                    <i className="ti ti-award"></i>
                  </div>
                  <div className="step-title">6. Hasil &amp; Rekomendasi</div>
                  <div className="step-count">
                    {stepper.hasil_rekomendasi.toLocaleString("id-ID")}
                  </div>
                  <div className="step-status">Selesai</div>
                  <div className="stepper-arrow">
                    <i className="ti ti-arrow-right"></i>
                  </div>
                </div>

                {/* Step 7 */}
                <div className="stepper-step">
                  <div className="step-icon-wrapper step-icon-done">
                    <i className="ti ti-circle-check-filled"></i>
                  </div>
                  <div className="step-title">7. Selesai</div>
                  <div className="step-count">
                    {stepper.selesai.toLocaleString("id-ID")}
                  </div>
                  <div className="step-status">Selesai</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="d-flex align-items-center mt-3 pt-2">
                <span className="fw-bold fs-12 text-dark me-3 whitespace-nowrap">
                  Progress Keseluruhan
                </span>
                <div
                  className="progress flex-grow-1"
                  style={{
                    height: "8px",
                    borderRadius: "10px",
                    backgroundColor: "#e2e8f0",
                  }}
                >
                  <div
                    className="progress-bar progress-bar-gradient"
                    role="progressbar"
                    style={{
                      width: `${Math.min(stepper.overall_progress, 100)}%`,
                      borderRadius: "10px",
                    }}
                    aria-valuenow={stepper.overall_progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
                <span className="fw-bold fs-12 text-dark ms-3">
                  {stepper.overall_progress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: 4 CHARTS GRID */}
      <div className="row g-3 mb-4">
        {/* Chart 1: Ringkasan Hasil Validasi */}
        <div className="col-md-6 col-xl-6">
          <div className="card chart-card h-100 mb-0">
            <div className="card-body">
              <h6 className="fw-bold fs-14 mb-3">Ringkasan Hasil Validasi</h6>
              <div className="row align-items-center">
                <div className="col-6">
                  <div
                    className="donut-center-container"
                    style={{ height: "130px" }}
                  >
                    <Chart
                      options={apexHasilValidasiOptions}
                      series={apexHasilValidasiSeries}
                      type="donut"
                      height="130"
                      width="100%"
                    />
                    <div className="donut-center-text">
                      <div className="donut-center-number">
                        {ringkasan_validasi.total}
                      </div>
                      <div className="donut-center-label">Total Validasi</div>
                    </div>
                  </div>
                </div>
                <div className="col-6 p-0">
                  <ul className="chart-legend-list">
                    <li className="chart-legend-item">
                      <div>
                        <span
                          className="legend-dot"
                          style={{ backgroundColor: "#0bb783" }}
                        ></span>
                        Sesuai (Valid)
                      </div>
                      <div className="fw-semibold fs-11">
                        {ringkasan_validasi.sesuai}
                      </div>
                    </li>
                    <li className="chart-legend-item">
                      <div>
                        <span
                          className="legend-dot"
                          style={{ backgroundColor: "#f64e60" }}
                        ></span>
                        Tidak Sesuai
                      </div>
                      <div className="fw-semibold fs-11">
                        {ringkasan_validasi.tidak_sesuai}
                      </div>
                    </li>
                    <li className="chart-legend-item">
                      <div>
                        <span
                          className="legend-dot"
                          style={{ backgroundColor: "#8950fc" }}
                        ></span>
                        Error OCR
                      </div>
                      <div className="fw-semibold fs-11">
                        {ringkasan_validasi.error_ocr}
                      </div>
                    </li>
                    <li className="chart-legend-item">
                      <div>
                        <span
                          className="legend-dot"
                          style={{ backgroundColor: "#ffa800" }}
                        ></span>
                        Pending
                      </div>
                      <div className="fw-semibold fs-11">
                        {ringkasan_validasi.pending}
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Performa Proses */}
        <div className="col-md-6 col-xl-6">
          <div className="card chart-card h-100 mb-0">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold fs-14 mb-0">Performa Proses</h6>
                <select
                  className="form-select form-select-sm py-0 px-2 fs-11"
                  style={{ width: "auto" }}
                >
                  <option>7 Hari Terakhir</option>
                </select>
              </div>
              <div style={{ height: "125px", width: "100%" }}>
                <Chart
                  options={apexPerformaProsesOptions}
                  series={apexPerformaProsesSeries}
                  type="line"
                  height="125"
                  width="100%"
                />
              </div>
              <div className="d-flex align-items-center justify-content-center gap-3 mt-1 fs-10 fw-medium">
                <div>
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: "#3699ff" }}
                  ></span>
                  Import
                </div>
                <div>
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: "#0bb783" }}
                  ></span>
                  OCR
                </div>
                <div>
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: "#f64e60" }}
                  ></span>
                  Validasi
                </div>
                <div>
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: "#8950fc" }}
                  ></span>
                  Selesai
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 3: Error Analysis */}
        <div className="col-md-6 col-xl-6">
          <div className="card chart-card h-100 mb-0">
            <div className="card-body">
              <h6 className="fw-bold fs-14 mb-3">Error Analysis</h6>
              <div className="row align-items-center">
                <div className="col-6">
                  <div
                    className="donut-center-container"
                    style={{ height: "130px" }}
                  >
                    <Chart
                      options={apexErrorAnalysisOptions}
                      series={apexErrorAnalysisSeries}
                      type="donut"
                      height="130"
                      width="100%"
                    />
                    <div className="donut-center-text">
                      <div className="donut-center-number">
                        {error_analysis.total}
                      </div>
                      <div className="donut-center-label">Total Error</div>
                    </div>
                  </div>
                </div>
                <div className="col-6 p-0">
                  <ul className="chart-legend-list">
                    <li className="chart-legend-item">
                      <div>
                        <span
                          className="legend-dot"
                          style={{ backgroundColor: "#f64e60" }}
                        ></span>
                        Rendering Gagal
                      </div>
                      <div className="fw-semibold fs-11">
                        {error_analysis.rendering_gagal}
                      </div>
                    </li>
                    <li className="chart-legend-item">
                      <div>
                        <span
                          className="legend-dot"
                          style={{ backgroundColor: "#ffa800" }}
                        ></span>
                        OCR Gagal
                      </div>
                      <div className="fw-semibold fs-11">
                        {error_analysis.ocr_gagal}
                      </div>
                    </li>
                    <li className="chart-legend-item">
                      <div>
                        <span
                          className="legend-dot"
                          style={{ backgroundColor: "#8950fc" }}
                        ></span>
                        Validasi Gagal
                      </div>
                      <div className="fw-semibold fs-11">
                        {error_analysis.validasi_gagal}
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 4: Metode Tanda Tangan (Dummy) */}
        <div className="col-md-6 col-xl-6">
          <div className="card chart-card h-100 mb-0">
            <div className="card-body">
              <h6 className="fw-bold fs-14 mb-3">Metode Tanda Tangan</h6>
              <div className="row align-items-center">
                <div className="col-6">
                  <div
                    className="donut-center-container"
                    style={{ height: "130px" }}
                  >
                    <Chart
                      options={apexMetodeTTDOptions}
                      series={apexMetodeTTDSeries}
                      type="donut"
                      height="130"
                      width="100%"
                    />
                    <div className="donut-center-text">
                      <div className="donut-center-number">1.256</div>
                      <div className="donut-center-label">Total</div>
                    </div>
                  </div>
                </div>
                <div className="col-6 p-0">
                  <ul className="chart-legend-list">
                    <li className="chart-legend-item">
                      <div>
                        <span
                          className="legend-dot"
                          style={{ backgroundColor: "#0bb783" }}
                        ></span>
                        QR Code (Paperless)
                      </div>
                      <div className="fw-semibold fs-11">890 (70.9%)</div>
                    </li>
                    <li className="chart-legend-item">
                      <div>
                        <span
                          className="legend-dot"
                          style={{ backgroundColor: "#3699ff" }}
                        ></span>
                        Tanda Tangan Basah
                      </div>
                      <div className="fw-semibold fs-11">366 (29.1%)</div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: RECENT PARTICIPANTS TABLE */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border shadow-sm">
            <div className="card-body p-3 d-flex flex-column">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold fs-14 mb-0">
                  Daftar Peserta Validasi Terbaru
                </h6>
                <span className="text-muted fs-11">Klik baris untuk melihat detail hasil validasi</span>
              </div>

              <div className="table-responsive flex-grow-1">
                <table className="table table-hover align-middle table-candidate mb-0 fs-11">
                  <thead className="table-light text-muted">
                    <tr>
                      <th>NO</th>
                      <th>ID IZIN</th>
                      <th>NAMA PESERTA</th>
                      <th>JABATAN KERJA</th>
                      <th>JENJANG</th>
                      <th>TGL IMPORT</th>
                      <th>STATUS</th>
                      <th>SKOR AI</th>
                      <th className="text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="9" className="text-center py-4 text-muted">
                          <i className="ti ti-loader-2 ti-spin me-1"></i> Memuat data peserta...
                        </td>
                      </tr>
                    ) : recentParticipants.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-4 text-muted">
                          Belum ada peserta diimpor
                        </td>
                      </tr>
                    ) : (
                      recentParticipants.map((item, index) => {
                        const isPass = item.ai_result_status === "pass";
                        const isFail = item.ai_result_status === "fail";
                        const isSelected = selectedCandidate?.id === item.id;
                        const scoreVal = item.ai_result_pass_percentage ? Math.round(item.ai_result_pass_percentage) : 0;

                        return (
                          <tr
                            key={item.id}
                            className={isSelected ? "active-row" : ""}
                            onClick={() => setSelectedCandidate(item)}
                            style={{ cursor: "pointer" }}
                          >
                            <td>{index + 1}.</td>
                            <td className="text-primary font-monospace fw-semibold" style={{ fontSize: "10px" }}>
                              {item.id_izin || "-"}
                            </td>
                            <td className="fw-semibold text-dark">{item.name}</td>
                            <td>{item.jabatan_kerja || "-"}</td>
                            <td className="text-center fw-bold">{item.jenjang || "-"}</td>
                            <td className="whitespace-nowrap text-muted">
                              {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  isPass
                                    ? "bg-success-subtle text-success"
                                    : isFail
                                    ? "bg-danger-subtle text-danger"
                                    : "bg-secondary-subtle text-secondary"
                                } px-2 py-1`}
                              >
                                {isPass ? "Sesuai" : isFail ? "Tidak Sesuai" : "Proses"}
                              </span>
                            </td>
                            <td>
                              <span className={`fw-extrabold fs-12 ${isPass ? "text-success" : isFail ? "text-danger" : "text-muted"}`}>
                                {scoreVal}%
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-xs btn-outline-primary p-1 px-2 fs-10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCandidate(item);
                                }}
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 text-center">
                <Link
                  to="/peserta"
                  className="text-primary fw-medium fs-12 text-decoration-none"
                >
                  Lihat Semua Data Peserta <i className="ti ti-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: HALF-WIDTH DETAIL INSPECTOR & PDF PREVIEW (HIDDEN BY DEFAULT UNTIL ROW IS CLICKED) */}
      {selectedCandidate && (
        <div className="row g-3 mb-4">
          {/* Left: Detail Hasil Validasi (AI) */}
          <div className="col-lg-6 col-12">
            <div className="card detail-card h-100 mb-0">
              <div className="card-body p-3 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-bold fs-14 mb-0">Detail Hasil Validasi (AI)</h6>
                  <button
                    type="button"
                    className="btn-close fs-11"
                    onClick={() => setSelectedCandidate(null)}
                    title="Tutup Detail"
                  ></button>
                </div>

                {/* Candidate Header & Score */}
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div>
                    <h6 className="fw-bold text-uppercase text-dark mb-2 fs-13">
                      {selectedCandidate.name}
                    </h6>
                    <table className="candidate-meta-table">
                      <tbody>
                        <tr>
                          <td className="meta-label">ID Izin</td>
                          <td className="meta-colon">:</td>
                          <td className="meta-value font-monospace text-primary">
                            {selectedCandidate.id_izin || "-"}
                          </td>
                        </tr>
                        <tr>
                          <td className="meta-label">Jabatan Kerja</td>
                          <td className="meta-colon">:</td>
                          <td className="meta-value">
                            {selectedCandidate.jabatan_kerja || "-"}
                          </td>
                        </tr>
                        <tr>
                          <td className="meta-label">Jenjang</td>
                          <td className="meta-colon">:</td>
                          <td className="meta-value fw-semibold">
                            {selectedCandidate.jenjang || "-"}
                          </td>
                        </tr>
                        <tr>
                          <td className="meta-label">NIK KTP</td>
                          <td className="meta-colon">:</td>
                          <td className="meta-value font-monospace">
                            {selectedCandidate.nik || "-"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-end d-flex flex-column align-items-end">
                    <span
                      className={`badge ${
                        selectedCandidate.ai_result_status === "pass"
                          ? "bg-success-subtle text-success"
                          : selectedCandidate.ai_result_status === "fail"
                          ? "bg-danger-subtle text-danger"
                          : "bg-secondary-subtle text-secondary"
                      } px-3 py-1 fs-12 fw-bold mb-2`}
                    >
                      {selectedCandidate.ai_result_status === "pass"
                        ? "Sesuai"
                        : selectedCandidate.ai_result_status === "fail"
                        ? "Tidak Sesuai"
                        : "Sedang Diproses"}
                    </span>
                    <div className="text-end">
                      <div className="fs-10 text-muted fw-semibold text-uppercase">
                        Skor AI
                      </div>
                      <div className="fs-20 fw-bold text-dark">
                        {selectedCandidate.ai_result_pass_percentage
                          ? Math.round(selectedCandidate.ai_result_pass_percentage)
                          : 0}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Two Sub-Columns: Checkers & Additional Info */}
                <div className="row flex-grow-1 mt-2">
                  {/* Left Checkers */}
                  <div className="col-6">
                    <h6 className="fw-bold fs-11 text-secondary mb-2">
                      Ringkasan Validasi
                    </h6>
                    <div className="validator-item">
                      <span>
                        <i className="ti ti-shield-check me-1 text-primary"></i> Identity Validator
                      </span>
                      <span className={`badge ${checkValidatorStatus(selectedCandidate, "identity") ? "badge-pass" : "bg-danger-subtle text-danger"}`}>
                        {checkValidatorStatus(selectedCandidate, "identity") ? "PASS" : "FAIL"}
                      </span>
                    </div>

                    <div className="validator-item">
                      <span>
                        <i className="ti ti-certificate me-1 text-primary"></i> Certification Validator
                      </span>
                      <span className={`badge ${checkValidatorStatus(selectedCandidate, "certification") ? "badge-pass" : "bg-danger-subtle text-danger"}`}>
                        {checkValidatorStatus(selectedCandidate, "certification") ? "PASS" : "FAIL"}
                      </span>
                    </div>

                    <div className="validator-item">
                      <span>
                        <i className="ti ti-school me-1 text-primary"></i> Unit Competency Validator
                      </span>
                      <span className={`badge ${checkValidatorStatus(selectedCandidate, "unit_competency") ? "badge-pass" : "bg-danger-subtle text-danger"}`}>
                        {checkValidatorStatus(selectedCandidate, "unit_competency") ? "PASS" : "FAIL"}
                      </span>
                    </div>

                    <div className="validator-item">
                      <span>
                        <i className="ti ti-paperclip me-1 text-primary"></i> Attachment Validator
                      </span>
                      <span className={`badge ${checkValidatorStatus(selectedCandidate, "attachment") ? "badge-pass" : "bg-danger-subtle text-danger"}`}>
                        {checkValidatorStatus(selectedCandidate, "attachment") ? "PASS" : "FAIL"}
                      </span>
                    </div>

                    <div className="validator-item">
                      <span>
                        <i className="ti ti-writing me-1 text-primary"></i> Signature Validator
                      </span>
                      <span className={`badge ${checkValidatorStatus(selectedCandidate, "signature") ? "badge-pass" : "bg-danger-subtle text-danger"}`}>
                        {checkValidatorStatus(selectedCandidate, "signature") ? "PASS" : "FAIL"}
                      </span>
                    </div>

                    <div className="validator-item">
                      <span>
                        <i className="ti ti-star me-1 text-primary"></i> Recommendation Validator
                      </span>
                      <span className={`badge ${checkValidatorStatus(selectedCandidate, "recommendation") ? "badge-pass" : "bg-danger-subtle text-danger"}`}>
                        {checkValidatorStatus(selectedCandidate, "recommendation") ? "PASS" : "FAIL"}
                      </span>
                    </div>

                    <div className="validator-item">
                      <span>
                        <i className="ti ti-qrcode me-1 text-primary"></i> Paperless Validator
                      </span>
                      <span className={`badge ${checkValidatorStatus(selectedCandidate, "signature") ? "badge-pass" : "bg-danger-subtle text-danger"}`}>
                        {checkValidatorStatus(selectedCandidate, "signature") ? "PASS" : "FAIL"}
                      </span>
                    </div>
                  </div>

                  {/* Right Extra Metadata */}
                  <div className="col-6">
                    <h6 className="fw-bold fs-11 text-secondary mb-2">
                      Informasi Tambahan
                    </h6>
                    <table className="candidate-meta-table">
                      <tbody>
                        <tr>
                          <td className="meta-label">LSP</td>
                          <td className="meta-colon">:</td>
                          <td className="meta-value fw-semibold text-dark">
                            {selectedCandidate.lsp || "LSP ASTEKINDO KONSTRUKSI"}
                          </td>
                        </tr>
                        <tr>
                          <td className="meta-label">TUK</td>
                          <td className="meta-colon">:</td>
                          <td className="meta-value">{selectedCandidate.nama_tuk || "P3SM PUSAT"}</td>
                        </tr>
                        <tr>
                          <td className="meta-label">Prov. TUK</td>
                          <td className="meta-colon">:</td>
                          <td className="meta-value">{selectedCandidate.prov_tuk || "DKI Jakarta"}</td>
                        </tr>
                        <tr>
                          <td className="meta-label">Kategori</td>
                          <td className="meta-colon">:</td>
                          <td className="meta-value">{selectedCandidate.category || "APL01"}</td>
                        </tr>
                        <tr>
                          <td className="meta-label">Rekomendasi</td>
                          <td className="meta-colon">:</td>
                          <td className={`meta-value fw-bold ${selectedCandidate.ai_result_status === "pass" ? "text-success" : "text-danger"}`}>
                            {selectedCandidate.ai_result_status === "pass" ? "Diterima" : "Perlu Perbaikan"}
                          </td>
                        </tr>
                        <tr>
                          <td className="meta-label">Tgl Verifikasi</td>
                          <td className="meta-colon">:</td>
                          <td className="meta-value text-dark">
                            {selectedCandidate.complete_process_at
                              ? new Date(selectedCandidate.complete_process_at).toLocaleString("id-ID")
                              : "-"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <Link
                    to={`/peserta/${selectedCandidate.uid || selectedCandidate.id}?from=${encodeURIComponent(location.pathname + location.search)}`}
                    className="text-primary fw-medium fs-12 text-decoration-none"
                  >
                    Lihat Detail Lengkap <i className="ti ti-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Embedded PDF / Report Preview Dokumen */}
          <div className="col-lg-6 col-12">
            <div className="card doc-preview-card h-100 mb-0">
              <div className="doc-header-bar d-flex align-items-center justify-content-between">
                <h6 className="fw-bold fs-13 text-white mb-0">
                  Preview Dokumen ({selectedCandidate.category || "APL01"})
                </h6>
                <span className="badge bg-slate-700 text-light fs-11 font-monospace">
                  {selectedCandidate.name}.pdf
                </span>
              </div>
              <div className="doc-subnav">
                <span
                  className="fw-medium text-truncate me-2"
                  style={{ maxWidth: "220px" }}
                >
                  {selectedCandidate.id_izin || selectedCandidate.name}
                </span>
                <div className="d-flex align-items-center gap-3 fs-12">
                  {selectedCandidate.report_url ? (
                    <a
                      href={selectedCandidate.report_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary text-decoration-none d-flex align-items-center gap-1"
                    >
                      <i className="ti ti-external-link"></i> Buka Fullscreen
                    </a>
                  ) : (
                    <span className="text-muted fs-11">Tidak ada URL report</span>
                  )}
                </div>
              </div>

              {/* Viewer Embed */}
              <div className="doc-iframe-wrapper">
                {selectedCandidate.report_url ? (
                  <iframe
                    src={selectedCandidate.report_url}
                    width="100%"
                    height="100%"
                    style={{ border: "none", minHeight: "420px" }}
                    title={`Preview Dokumen ${selectedCandidate.name}`}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted p-5">
                    <i className="ti ti-file-x fs-28 me-2"></i> Dokumen report belum tersedia
                  </div>
                )}
              </div>

              <div className="p-3 bg-white border-top text-center">
                {selectedCandidate.report_url ? (
                  <a
                    href={selectedCandidate.report_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2 fw-medium"
                  >
                    <i className="ti ti-external-link fs-15"></i> Buka Dokumen Report
                  </a>
                ) : (
                  <button disabled className="btn btn-light btn-sm w-100 text-muted">
                    Dokumen Tidak Tersedia
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DASHBOARD 2: CEK KELENGKAPAN PELAPORAN FORM LSP BKN                       */}
      {/* ========================================================================= */}
      <div className="my-4 pt-4 border-top">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <i className="ti ti-file-analytics text-primary fs-20"></i> Cek Kelengkapan Pelaporan Form LSP BKN
            </h5>
            <span className="text-muted fs-12">
              Ringkasan status tautan, aksesibilitas, dan kesesuaian dokumen per-kategori form pelaporan
            </span>
          </div>
        </div>

        {/* 1. Stat Cards Dashboard 2 (6 Cards) */}
        <div className="row g-2 mb-4">
          <div className="col-12 col-sm-6 col-md-4 col-xl-2">
            <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-primary-subtle text-primary p-2 rounded-3 flex-shrink-0">
                  <i className="ti ti-users fs-16"></i>
                </div>
                <div className="overflow-hidden">
                  <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                    Total Peserta
                  </span>
                  <h5 className="fw-extrabold text-dark mb-0 fs-16">
                    {d2Stat.total_peserta?.toLocaleString("id-ID")}
                  </h5>
                  <span className="text-muted fs-10 text-truncate d-block">
                    100% total
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4 col-xl-2">
            <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-success-subtle text-success p-2 rounded-3 flex-shrink-0">
                  <i className="ti ti-folder fs-16"></i>
                </div>
                <div className="overflow-hidden">
                  <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                    Total Dokumen
                  </span>
                  <h5 className="fw-extrabold text-dark mb-0 fs-16">
                    {d2Stat.total_dokumen?.toLocaleString("id-ID")}
                  </h5>
                  <span className="text-success fs-10 fw-semibold text-truncate d-block">
                    100% terunggah
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4 col-xl-2">
            <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-purple-subtle text-purple p-2 rounded-3 flex-shrink-0" style={{ backgroundColor: "#f3e8ff", color: "#9333ea" }}>
                  <i className="ti ti-link fs-16"></i>
                </div>
                <div className="overflow-hidden">
                  <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                    Total Link
                  </span>
                  <h5 className="fw-extrabold text-dark mb-0 fs-16">
                    {d2Stat.total_link?.toLocaleString("id-ID")}
                  </h5>
                  <span className="text-purple fs-10 fw-semibold text-truncate d-block" style={{ color: "#9333ea" }}>
                    {d2Stat.link_percentage}% dari total
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4 col-xl-2">
            <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-warning-subtle text-warning p-2 rounded-3 flex-shrink-0">
                  <i className="ti ti-file-text fs-16"></i>
                </div>
                <div className="overflow-hidden">
                  <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                    Dokumen Bisa Dibuka
                  </span>
                  <h5 className="fw-extrabold text-dark mb-0 fs-16">
                    {d2Stat.bisa_dibuka?.toLocaleString("id-ID")}
                  </h5>
                  <span className="text-warning fs-10 fw-semibold text-truncate d-block">
                    {d2Stat.buka_percentage}% dari link
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4 col-xl-2">
            <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-success-subtle text-success p-2 rounded-3 flex-shrink-0">
                  <i className="ti ti-circle-check fs-16"></i>
                </div>
                <div className="overflow-hidden">
                  <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                    Dokumen Sesuai
                  </span>
                  <h5 className="fw-extrabold text-dark mb-0 fs-16">
                    {d2Stat.dokumen_sesuai?.toLocaleString("id-ID")}
                  </h5>
                  <span className="text-success fs-10 fw-semibold text-truncate d-block">
                    {d2Stat.sesuai_percentage}% dari total
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4 col-xl-2">
            <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-danger-subtle text-danger p-2 rounded-3 flex-shrink-0">
                  <i className="ti ti-circle-x fs-16"></i>
                </div>
                <div className="overflow-hidden">
                  <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                    Dokumen Tidak Sesuai
                  </span>
                  <h5 className="fw-extrabold text-dark mb-0 fs-16">
                    {d2Stat.dokumen_tidak_sesuai?.toLocaleString("id-ID")}
                  </h5>
                  <span className="text-danger fs-10 fw-semibold text-truncate d-block">
                    {d2Stat.tidak_sesuai_percentage}% dari total
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Main Table Dashboard 2: Cek Kelengkapan Pelaporan Form LSP BKN */}
        <div className="card project-card border-0 shadow-sm overflow-hidden mb-4 bg-white">
          <div className="p-3 border-bottom d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
            <h6 className="fw-bold text-dark mb-0 fs-14">Cek Kelengkapan Pelaporan Form LSP BKN</h6>
            
            <div className="d-flex align-items-center gap-2">
              {/* Search Input */}
              <div className="input-group input-group-sm" style={{ width: "210px" }}>
                <input
                  type="text"
                  className="form-control border-end-0 bg-light fs-12 ps-3"
                  placeholder="Cari dokumen..."
                  style={{ borderRadius: "20px 0 0 20px", height: "32px" }}
                />
                <span className="input-group-text bg-light border-start-0 text-muted" style={{ borderRadius: "0 20px 20px 0", height: "32px" }}>
                  <i className="ti ti-search fs-14"></i>
                </span>
              </div>

              {/* Filter Button */}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary fs-12 d-inline-flex align-items-center justify-content-center gap-1.5 px-3 rounded-3"
                style={{ height: "32px" }}
              >
                <i className="ti ti-filter fs-14"></i> Filter
              </button>

              {/* Refresh Button */}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary fs-12 d-inline-flex align-items-center justify-content-center rounded-3 p-0"
                style={{ height: "32px", width: "32px" }}
                title="Refresh"
              >
                <i className="ti ti-refresh fs-14"></i>
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle mb-0 fs-11 text-center">
              <thead className="table-light text-muted fw-bold">
                <tr>
                  <th rowSpan="2" style={{ width: "45px" }} className="align-middle">No</th>
                  <th rowSpan="2" style={{ width: "55px" }} className="align-middle">No</th>
                  <th rowSpan="2" className="align-middle text-center" style={{ width: "100px" }}>Metode Uji</th>
                  <th rowSpan="2" className="align-middle text-start">Nama Dokumen</th>
                  <th colSpan="3" className="border-bottom">Link</th>
                  <th colSpan="3" className="border-bottom">Buka</th>
                  <th colSpan="3" className="border-bottom">Sesuai</th>
                </tr>
                <tr className="bg-light">
                  <th style={{ width: "75px" }}>Total</th>
                  <th style={{ width: "75px" }}>Ada</th>
                  <th style={{ width: "75px" }}>Tidak</th>

                  <th style={{ width: "75px" }}>Total</th>
                  <th style={{ width: "75px" }}>Bisa</th>
                  <th style={{ width: "75px" }}>Tidak</th>

                  <th style={{ width: "75px" }}>Total</th>
                  <th style={{ width: "75px" }}>Sesuai</th>
                  <th style={{ width: "75px" }}>Tidak</th>
                </tr>
              </thead>
              <tbody>
                {kelengkapanData.tabel_kategori.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="text-center py-4 text-muted">
                      Belum ada data kategori dokumen
                    </td>
                  </tr>
                ) : (
                  kelengkapanData.tabel_kategori.map((row, idx) => {
                    const totalVal = parseInt(row.total || 0, 10);
                    const linkAdaVal = parseInt(row.link_ada || 0, 10);
                    const linkTidakVal = parseInt(row.link_tidak || 0, 10);
                    const bukaBisaVal = parseInt(row.buka_bisa || 0, 10);
                    const bukaTidakVal = parseInt(row.buka_tidak || 0, 10);
                    const sesuaiYaVal = parseInt(row.sesuai_ya || 0, 10);
                    const sesuaiTidakVal = parseInt(row.sesuai_tidak || 0, 10);

                    // Alternate Online / Offline metode uji display matching prototype
                    const isOnline = idx % 2 === 0;

                    return (
                      <tr key={row.category || idx}>
                        <td className="text-muted">{idx + 1}</td>
                        <td className="text-muted font-monospace">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="text-center">
                          <span
                            className={`badge px-2.5 py-1 fs-11 fw-semibold rounded-pill ${
                              isOnline
                                ? "bg-primary-subtle text-primary border border-primary-subtle"
                                : "bg-success-subtle text-success border border-success-subtle"
                            }`}
                          >
                            {isOnline ? "Online" : "Offline"}
                          </span>
                        </td>
                        <td className="text-start fw-semibold text-dark d-flex align-items-center justify-content-between">
                          <span>Form {row.category || "APL01"}</span>
                          <i className="ti ti-link text-primary ms-2 fs-13"></i>
                        </td>

                        {/* Link */}
                        <td className="fw-semibold">{totalVal.toLocaleString("id-ID")}</td>
                        <td className="text-success fw-semibold">{linkAdaVal.toLocaleString("id-ID")}</td>
                        <td className="text-danger fw-semibold">{linkTidakVal.toLocaleString("id-ID")}</td>

                        {/* Buka */}
                        <td className="fw-semibold">{linkAdaVal.toLocaleString("id-ID")}</td>
                        <td className="text-success fw-semibold">{bukaBisaVal.toLocaleString("id-ID")}</td>
                        <td className="text-danger fw-semibold">{bukaTidakVal.toLocaleString("id-ID")}</td>

                        {/* Sesuai */}
                        <td className="fw-semibold">{totalVal.toLocaleString("id-ID")}</td>
                        <td className="text-success fw-bold">{sesuaiYaVal.toLocaleString("id-ID")}</td>
                        <td className="text-danger fw-bold">{sesuaiTidakVal.toLocaleString("id-ID")}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {/* Footer Total Row */}
              <tfoot className="table-light fw-bold">
                <tr>
                  <td colSpan="4" className="text-center text-uppercase tracking-wider">TOTAL</td>

                  {/* Link Totals */}
                  <td>{d2Stat.total_peserta?.toLocaleString("id-ID")}</td>
                  <td className="text-success">{d2Stat.total_link?.toLocaleString("id-ID")}</td>
                  <td className="text-danger">{(d2Stat.total_peserta - d2Stat.total_link)?.toLocaleString("id-ID")}</td>

                  {/* Buka Totals */}
                  <td>{d2Stat.total_link?.toLocaleString("id-ID")}</td>
                  <td className="text-success">{d2Stat.bisa_dibuka?.toLocaleString("id-ID")}</td>
                  <td className="text-danger">{(d2Stat.total_link - d2Stat.bisa_dibuka)?.toLocaleString("id-ID")}</td>

                  {/* Sesuai Totals */}
                  <td>{d2Stat.total_peserta?.toLocaleString("id-ID")}</td>
                  <td className="text-success">{d2Stat.dokumen_sesuai?.toLocaleString("id-ID")}</td>
                  <td className="text-danger">{d2Stat.dokumen_tidak_sesuai?.toLocaleString("id-ID")}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Table Footer Pagination Bar */}
          <div className="card-footer bg-white border-top p-3 d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
            <span className="text-muted fs-12">
              Menampilkan 1 - {kelengkapanData.tabel_kategori.length || 10} dari {kelengkapanData.tabel_kategori.length || 10} data
            </span>

            <div className="d-flex align-items-center gap-2">
              <button type="button" className="btn btn-sm btn-light border px-2 py-1 text-muted" disabled>
                <i className="ti ti-chevron-left"></i>
              </button>
              <button type="button" className="btn btn-sm btn-primary px-2.5 py-1 fs-12 fw-bold">
                1
              </button>
              <button type="button" className="btn btn-sm btn-light border px-2 py-1 text-muted" disabled>
                <i className="ti ti-chevron-right"></i>
              </button>

              <select className="form-select form-select-sm border bg-white fs-12 w-auto ms-2">
                <option value="10">10 / halaman</option>
                <option value="25">25 / halaman</option>
                <option value="50">50 / halaman</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Bottom 3 Panels Grid */}
        <div className="row g-3">
          {/* Panel 1: Ringkasan Kelengkapan Dokumen (Donut Chart) */}
          <div className="col-md-4 col-xl-4">
            <div className="card chart-card h-100 mb-0">
              <div className="card-body">
                <h6 className="fw-bold fs-14 mb-3">Ringkasan Kelengkapan Dokumen</h6>
                <div className="row align-items-center">
                  <div className="col-6">
                    <div
                      className="donut-center-container"
                      style={{ height: "130px" }}
                    >
                      <Chart
                        options={apexKelengkapanOptions}
                        series={apexKelengkapanSeries}
                        type="donut"
                        height="130"
                        width="100%"
                      />
                      <div className="donut-center-text">
                        <div className="donut-center-number">
                          {ringkasan_kelengkapan.total}
                        </div>
                        <div className="donut-center-label">Total Dokumen Dicek</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 p-0">
                    <ul className="chart-legend-list">
                      <li className="chart-legend-item">
                        <div>
                          <span
                            className="legend-dot"
                            style={{ backgroundColor: "#0bb783" }}
                          ></span>
                          Sesuai
                        </div>
                        <div className="fw-semibold fs-11">
                          {ringkasan_kelengkapan.sesuai} ({ringkasan_kelengkapan.sesuai_percentage}%)
                        </div>
                      </li>
                      <li className="chart-legend-item">
                        <div>
                          <span
                            className="legend-dot"
                            style={{ backgroundColor: "#f64e60" }}
                          ></span>
                          Tidak Sesuai
                        </div>
                        <div className="fw-semibold fs-11">
                          {ringkasan_kelengkapan.tidak_sesuai} ({ringkasan_kelengkapan.tidak_sesuai_percentage}%)
                        </div>
                      </li>
                      <li className="chart-legend-item">
                        <div>
                          <span
                            className="legend-dot"
                            style={{ backgroundColor: "#94a3b8" }}
                          ></span>
                          Tidak Ada Link
                        </div>
                        <div className="fw-semibold fs-11">
                          {ringkasan_kelengkapan.tidak_ada_link} ({ringkasan_kelengkapan.tidak_ada_link_percentage}%)
                        </div>
                      </li>
                      <li className="chart-legend-item">
                        <div>
                          <span
                            className="legend-dot"
                            style={{ backgroundColor: "#ffa800" }}
                          ></span>
                          Tidak Bisa Dibuka
                        </div>
                        <div className="fw-semibold fs-11">
                          {ringkasan_kelengkapan.tidak_bisa_dibuka} ({ringkasan_kelengkapan.tidak_bisa_dibuka_percentage}%)
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Performa Proses (7 Hari Terakhir) (Line Chart) */}
          <div className="col-md-4 col-xl-4">
            <div className="card chart-card h-100 mb-0">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="fw-bold fs-14 mb-0">Performa Proses (7 Hari Terakhir)</h6>
                </div>
                <div style={{ height: "125px", width: "100%" }}>
                  <Chart
                    options={apexPerformaD2Options}
                    series={apexPerformaD2Series}
                    type="line"
                    height="125"
                    width="100%"
                  />
                </div>
                <div className="d-flex align-items-center justify-content-center gap-2 mt-1 fs-10 fw-medium">
                  <div>
                    <span className="legend-dot" style={{ backgroundColor: "#3699ff" }}></span> Link Ada
                  </div>
                  <div>
                    <span className="legend-dot" style={{ backgroundColor: "#0bb783" }}></span> Bisa Dibuka
                  </div>
                  <div>
                    <span className="legend-dot" style={{ backgroundColor: "#8950fc" }}></span> Sesuai
                  </div>
                  <div>
                    <span className="legend-dot" style={{ backgroundColor: "#f64e60" }}></span> Tidak Sesuai
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 3: Ringkasan Screening OCR (Card Stats) */}
          <div className="col-md-4 col-xl-4">
            <div className="card chart-card h-100 mb-0">
              <div className="card-body p-3 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="fw-bold fs-14 mb-0">Ringkasan Screening OCR</h6>
                  <span className="badge bg-purple-subtle text-purple border border-purple-subtle px-2 py-1 fs-10 fw-bold" style={{ backgroundColor: "#f3e8ff", color: "#9333ea" }}>
                    AI
                  </span>
                </div>

                <div className="p-2 bg-light rounded-3 mb-2">
                  <span className="text-muted fs-11 fw-semibold text-uppercase d-block">Total Dokumen di Screening OCR</span>
                  <h4 className="fw-extrabold text-dark mb-0 fs-18">
                    {ocr_summary.total?.toLocaleString("id-ID")}
                  </h4>
                </div>

                <div className="row g-2 text-center">
                  <div className="col-4">
                    <div className="p-2 border rounded-3 bg-success-subtle border-success-subtle">
                      <span className="text-success fs-10 fw-bold d-block">Berhasil OCR</span>
                      <h6 className="fw-bold text-success mb-0 fs-14">{ocr_summary.berhasil?.toLocaleString("id-ID")}</h6>
                      <span className="text-success fs-10">({ocr_summary.berhasil_percentage}%)</span>
                    </div>
                  </div>

                  <div className="col-4">
                    <div className="p-2 border rounded-3 bg-danger-subtle border-danger-subtle">
                      <span className="text-danger fs-10 fw-bold d-block">Gagal OCR</span>
                      <h6 className="fw-bold text-danger mb-0 fs-14">{ocr_summary.gagal?.toLocaleString("id-ID")}</h6>
                      <span className="text-danger fs-10">({ocr_summary.gagal_percentage}%)</span>
                    </div>
                  </div>

                  <div className="col-4">
                    <div className="p-2 border rounded-3 bg-warning-subtle border-warning-subtle">
                      <span className="text-warning fs-10 fw-bold d-block">Belum OCR</span>
                      <h6 className="fw-bold text-warning mb-0 fs-14">{ocr_summary.belum?.toLocaleString("id-ID")}</h6>
                      <span className="text-warning fs-10">({ocr_summary.belum_percentage}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
