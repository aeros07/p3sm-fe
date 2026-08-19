import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "../Project/project.css";

const ProcessMonitoringPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Read initial states directly from URL search parameters
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const perPageParam = parseInt(searchParams.get("per_page") || "15", 10);
  const searchParam = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";
  const stepParam = searchParams.get("step") || "";
  const statusParam = searchParams.get("status") || "";

  const [participants, setParticipants] = useState([]);
  const [summary, setSummary] = useState({
    total_proses: 0,
    total_selesai: 0,
    total_berjalan: 0,
    total_antrian: 0,
    total_gagal: 0,
    avg_duration_seconds: 0,
    selesai_percentage: 0,
    berjalan_percentage: 0,
    antrian_percentage: 0,
    gagal_percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Local search box input
  const [searchInput, setSearchInput] = useState(searchParam);

  // Pagination States
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State for Timeline Stepper
  const [selectedParticipantForTimeline, setSelectedParticipantForTimeline] = useState(null);
  const [participantTimelineLogs, setParticipantTimelineLogs] = useState([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  useEffect(() => {
    document.title = "Monitoring Proses - AI Document Validation";
  }, []);

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    fetchMonitoringData();
  }, [searchParams]);

  const fetchMonitoringData = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pageParam,
        per_page: perPageParam,
        search: searchParam,
        category: categoryParam,
        step: stepParam,
        status: statusParam,
      };

      // Call dedicated lightweight /process-monitoring API
      const res = await axiosClient.get("/process-monitoring", { params });
      if (res.data?.success) {
        setParticipants(res.data.data || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
        if (res.data.meta) {
          setLastPage(res.data.meta.last_page);
          setTotalItems(res.data.meta.total);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data monitoring proses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParticipantTimeline = async (participant) => {
    setSelectedParticipantForTimeline(participant);
    setIsLoadingTimeline(true);
    try {
      const res = await axiosClient.get(`/participant-logs/participant/${participant.id}`);
      if (res.data?.success) {
        setParticipantTimelineLogs(res.data.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat timeline log peserta:", err);
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  const updateUrlParams = (updatedParams) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updatedParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        newParams.set(key, val);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    updateUrlParams({
      search: val,
      page: 1,
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams({
      search: searchInput,
      page: 1,
    });
  };

  const handleCategoryFilterChange = (e) => {
    updateUrlParams({
      category: e.target.value,
      page: 1,
    });
  };

  const handleStepFilterChange = (e) => {
    updateUrlParams({
      step: e.target.value,
      page: 1,
    });
  };

  const handleStatusFilterChange = (e) => {
    updateUrlParams({
      status: e.target.value,
      page: 1,
    });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchParams({}, { replace: true });
  };

  const handlePageChange = (newPage) => {
    updateUrlParams({
      page: newPage,
    });
  };

  // Format Seconds to HH:MM:SS or MM:SS
  const formatSeconds = (totalSeconds) => {
    if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return "00s";
    const sec = Math.round(totalSeconds);
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  };

  // Helper render Step Badge
  const renderStepBadge = (stepStr) => {
    switch (stepStr) {
      case "queued":
        return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle fs-11"><i className="ti ti-clock me-1"></i> Antrian</span>;
      case "rendering_md":
        return <span className="badge bg-info-subtle text-info border border-info-subtle fs-11"><i className="ti ti-brand-markdown me-1"></i> Render MD</span>;
      case "screening_ocr":
        return <span className="badge bg-purple-subtle text-purple border fs-11" style={{ backgroundColor: "#f3e8ff", color: "#7e22ce", borderColor: "#e9d5ff" }}><i className="ti ti-scan me-1"></i> Screening OCR</span>;
      case "validation_ai":
        return <span className="badge bg-warning-subtle text-warning border border-warning-subtle fs-11"><i className="ti ti-cpu me-1"></i> Validasi AI</span>;
      case "done":
        return <span className="badge bg-success-subtle text-success border border-success-subtle fs-11"><i className="ti ti-circle-check me-1"></i> Selesai</span>;
      default:
        return <span className="badge bg-light text-dark border fs-11">{stepStr || "Draft"}</span>;
    }
  };

  // Helper render Process Status Badge
  const renderProcessStatusBadge = (item) => {
    if (item.failure_reason) {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 fs-12 fw-bold">
          <i className="ti ti-alert-octagon me-1"></i> Gagal
        </span>
      );
    }
    if (item.is_complete_process) {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-12 fw-bold">
          <i className="ti ti-check me-1"></i> Selesai
        </span>
      );
    }
    if (item.status === "queued") {
      return (
        <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 fs-12 fw-semibold">
          <i className="ti ti-clock me-1"></i> Antrian
        </span>
      );
    }
    return (
      <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 fs-12 fw-semibold">
        <i className="ti ti-loader-2 ti-spin me-1"></i> Berjalan
      </span>
    );
  };

  return (
    <div className="container-fluid px-0">
      {/* 1. Header Title */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-2">
        <div>
          <h4 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            Monitoring Proses
          </h4>
          <span className="text-muted fs-12">Dashboard / Monitoring Proses</span>
        </div>
      </div>

      {/* 2. Top 6 Metric Summary Cards (Compact, Icon Left) */}
      <div className="row g-2 mb-2">
        {/* Card 1: Total Proses */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-primary-subtle text-primary p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-activity fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Total Proses
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_proses?.toLocaleString("id-ID")}
                </h5>
                <span className="text-muted fs-10 text-truncate d-block">
                  Total pipeline
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Selesai */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-success-subtle text-success p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-circle-check fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Selesai
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_selesai?.toLocaleString("id-ID")}
                </h5>
                <span className="text-success fs-10 fw-semibold text-truncate d-block">
                  <i className="ti ti-arrow-up-right me-1"></i>{summary.selesai_percentage}% total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Berjalan */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-info-subtle text-info p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-clock-play fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Berjalan
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_berjalan?.toLocaleString("id-ID")}
                </h5>
                <span className="text-info fs-10 fw-semibold text-truncate d-block">
                  {summary.berjalan_percentage}% total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Menunggu Antrian */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-warning-subtle text-warning p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-clock-hour-4 fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Menunggu Antrian
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_antrian?.toLocaleString("id-ID")}
                </h5>
                <span className="text-warning fs-10 fw-semibold text-truncate d-block">
                  {summary.antrian_percentage}% total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Gagal / Error */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-danger-subtle text-danger p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-alert-octagon fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Gagal / Error
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_gagal?.toLocaleString("id-ID")}
                </h5>
                <span className="text-danger fs-10 fw-semibold text-truncate d-block">
                  {summary.gagal_percentage}% total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 6: Rata-rata Waktu Proses */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div
                className="bg-purple-subtle text-purple p-2 rounded-3 flex-shrink-0"
                style={{ backgroundColor: "#f3e8ff", color: "#7e22ce" }}
              >
                <i className="ti ti-clock fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">
                  Rata-rata Waktu
                </span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {formatSeconds(summary.avg_duration_seconds)}
                </h5>
                <span className="text-muted fs-10 text-truncate d-block">
                  Waktu komputasi
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Actions */}
      <div className="card project-card border-0 p-2 px-3 shadow-sm mb-3 bg-white">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-sm-4 col-md-3">
            <select
              className="form-select form-select-sm bg-light"
              value={stepParam}
              onChange={handleStepFilterChange}
            >
              <option value="">Semua Tahapan Pipeline</option>
              <option value="queued">1. Menunggu Antrian</option>
              <option value="rendering_md">2. Render Markdown S3</option>
              <option value="screening_ocr">3. Screening OCR AI</option>
              <option value="validation_ai">4. Validasi AI 27 Rules</option>
              <option value="done">5. Selesai (Done)</option>
            </select>
          </div>

          <div className="col-12 col-sm-4 col-md-2">
            <select
              className="form-select form-select-sm bg-light"
              value={statusParam}
              onChange={handleStatusFilterChange}
            >
              <option value="">Semua Status</option>
              <option value="selesai">Selesai (Done)</option>
              <option value="berjalan">Berjalan (In Progress)</option>
              <option value="antrian">Menunggu Antrian</option>
              <option value="gagal">Gagal / Error</option>
            </select>
          </div>

          <div className="col-12 col-sm-4 col-md-2">
            <select
              className="form-select form-select-sm bg-light"
              value={categoryParam}
              onChange={handleCategoryFilterChange}
            >
              <option value="">Semua Jenis Dokumen</option>
              <option value="APL01">APL01 - Form Permohonan</option>
              <option value="APL.01">APL.01</option>
              <option value="APL.02">APL.02 - Asesmen Mandiri</option>
              <option value="MAPA">MAPA - Merencanakan Asesmen</option>
              <option value="AK.01">AK.01 - AK.07 Persetujuan Asesmen</option>
              <option value="IA.01">IA.01 - IA.10 Perangkat Asesmen</option>
              <option value="Dokumentasi">Dokumentasi</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div className="col-12 col-sm-8 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="ti ti-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Cari ID Izin, Nama Peserta, NIK..."
                value={searchInput}
                onChange={handleSearchInputChange}
              />
            </div>
          </div>

          <div className="col-6 col-md-1">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm w-100 fs-12 d-flex align-items-center justify-content-center gap-1"
              onClick={handleResetFilters}
            >
              <i className="ti ti-refresh"></i> Reset
            </button>
          </div>
        </form>
      </div>

      {/* 4. Master Data Table Monitoring Proses (10 Kolom) */}
      <div className="card project-card border-0 shadow-sm overflow-hidden mb-3 bg-white">
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          <h6 className="fw-bold text-dark mb-0 fs-13">Daftar Status Monitoring Pipeline</h6>
          <span className="text-muted fs-12">
            {totalItems.toLocaleString("id-ID")} peserta ditemukan
          </span>
        </div>

        <div className="table-responsive" style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
          <table className="table table-hover align-middle mb-0 fs-11" style={{ width: "100%" }}>
            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr className="text-muted fs-11 fw-bold text-uppercase align-middle">
                <th style={{ width: "35px", whiteSpace: "nowrap", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }} className="text-center">No</th>
                <th style={{ width: "14%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>ID Izin</th>
                <th style={{ width: "18%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Nama Peserta</th>
                <th style={{ width: "10%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Dokumen</th>
                <th style={{ width: "13%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Tahapan Saat Ini</th>
                <th className="text-center" style={{ width: "10%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Status</th>
                <th style={{ width: "12%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Progress</th>
                <th style={{ width: "11%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Mulai</th>
                <th style={{ width: "6%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Durasi</th>
                <th className="text-center" style={{ width: "125px", whiteSpace: "nowrap", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="text-center py-5">
                    <i className="ti ti-loader-2 ti-spin fs-28 text-primary d-block mb-2"></i>
                    <span className="text-muted fs-13">
                      Memuat status monitoring pipeline...
                    </span>
                  </td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-5">
                    <i className="ti ti-activity-heartbeat fs-36 text-muted mb-2 d-block"></i>
                    <span className="fw-semibold text-dark fs-14">
                      Tidak ada proses ditemukan
                    </span>
                  </td>
                </tr>
              ) : (
                participants.map((item, idx) => {
                  const progressPct = item.progress_percentage ?? 0;
                  const isFailed = !!item.failure_reason;

                  return (
                    <tr key={item.id || item.uid}>
                      <td className="text-center text-muted fs-12">
                        {(pageParam - 1) * perPageParam + idx + 1}
                      </td>
                      <td className="fs-12 text-primary fw-semibold" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                        {item.id_izin || "-"}
                      </td>
                      <td style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                        <div className="d-flex flex-column">
                          <Link
                            to={`/peserta/${item.uid || item.id}?from=${encodeURIComponent(location.pathname + location.search)}`}
                            className="fw-bold text-dark text-decoration-none hover-primary fs-12"
                          >
                            {item.name}
                          </Link>
                          <span className="text-muted fs-11">
                            NIK: <code>{item.nik || "-"}</code>
                          </span>
                        </div>
                      </td>
                      <td style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                        <span className="badge bg-light text-dark border fs-11">
                          {item.category || "APL01"}
                        </span>
                      </td>
                      <td style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{renderStepBadge(item.status)}</td>
                      <td className="text-center">
                        {renderProcessStatusBadge(item)}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: "6px" }}>
                            <div
                              className={`progress-bar ${
                                isFailed
                                  ? "bg-danger"
                                  : progressPct === 100
                                  ? "bg-success"
                                  : "bg-info progress-bar-striped progress-bar-animated"
                              }`}
                              style={{ width: `${progressPct}%` }}
                            ></div>
                          </div>
                          <span className="fs-11 fw-bold text-muted" style={{ minWidth: "28px" }}>
                            {progressPct}%
                          </span>
                        </div>
                      </td>
                      <td className="text-muted fs-12">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td className="text-muted fs-12 fw-semibold">
                        {formatSeconds(item.duration_seconds)}
                      </td>
                      <td className="text-center" style={{ width: "125px", whiteSpace: "nowrap" }}>
                        <div className="d-flex justify-content-center gap-1">
                          <button
                            type="button"
                            className="btn btn-xs btn-outline-info py-0.5 px-1.5 fs-10 d-inline-flex align-items-center justify-content-center gap-1"
                            title="Lihat Timeline Logs Peserta"
                            onClick={() => fetchParticipantTimeline(item)}
                          >
                            <i className="ti ti-timeline"></i> Timeline
                          </button>
                          <Link
                            to={`/peserta/${item.uid || item.id}?from=${encodeURIComponent(location.pathname + location.search)}`}
                            className="btn btn-xs btn-outline-primary py-0.5 px-1.5 fs-10 d-inline-flex align-items-center justify-content-center gap-1"
                            title="Lihat Detail Peserta"
                          >
                            <i className="ti ti-eye"></i> Detail
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Footer */}
        {!isLoading && participants.length > 0 && (
          <div className="card-footer bg-white border-top p-3 d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
            <span className="text-muted fs-12">
              Menampilkan {(pageParam - 1) * perPageParam + 1} -{" "}
              {Math.min(pageParam * perPageParam, totalItems)} dari{" "}
              {totalItems.toLocaleString("id-ID")} peserta
            </span>

            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={pageParam === 1}
                onClick={() => handlePageChange(Math.max(pageParam - 1, 1))}
              >
                <i className="ti ti-chevron-left me-1"></i> Prev
              </button>

              <span className="fs-12 fw-semibold px-2">
                Halaman {pageParam} dari {lastPage}
              </span>

              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={pageParam >= lastPage}
                onClick={() => handlePageChange(Math.min(pageParam + 1, lastPage))}
              >
                Next <i className="ti ti-chevron-right ms-1"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Polished Modal Interactive Visual Timeline Stepper */}
      {selectedParticipantForTimeline && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <i className="ti ti-timeline fs-20 text-info"></i>
                  <h5 className="modal-title fw-bold text-dark fs-15">
                    Riwayat Audit Timeline Logs: {selectedParticipantForTimeline.name}
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedParticipantForTimeline(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                {/* Participant Header Info Card */}
                <div className="p-3 bg-light rounded-3 mb-4 border">
                  <div className="row g-2 fs-12">
                    <div className="col-12 col-sm-6">
                      <span className="text-muted">Nama Peserta:</span>{" "}
                      <strong className="text-dark">{selectedParticipantForTimeline.name}</strong>
                    </div>
                    <div className="col-12 col-sm-6">
                      <span className="text-muted">NIK:</span>{" "}
                      <code className="text-dark">{selectedParticipantForTimeline.nik || "-"}</code>
                    </div>
                    <div className="col-12 col-sm-6">
                      <span className="text-muted">ID Izin:</span>{" "}
                      <code className="text-primary">{selectedParticipantForTimeline.id_izin || "-"}</code>
                    </div>
                    <div className="col-12 col-sm-6">
                      <span className="text-muted">Tahapan Saat Ini:</span>{" "}
                      {renderStepBadge(selectedParticipantForTimeline.status)}
                    </div>
                  </div>
                </div>

                {isLoadingTimeline ? (
                  <div className="text-center py-4">
                    <i className="ti ti-loader-2 ti-spin fs-24 text-primary d-block mb-2"></i>
                    <span className="text-muted fs-13">Memuat riwayat timeline audit...</span>
                  </div>
                ) : participantTimelineLogs.length === 0 ? (
                  <div className="text-center py-4 text-muted fs-13">
                    Belum ada riwayat log audit untuk peserta ini.
                  </div>
                ) : (
                  <div className="timeline-wrapper position-relative ps-4 ms-2">
                    <div
                      className="timeline-line position-absolute bg-primary-subtle"
                      style={{ top: "12px", bottom: "12px", left: "12px", transform: "translateX(-50%)", width: "2px", zIndex: 0 }}
                    ></div>

                    {participantTimelineLogs.map((tlog, tIdx) => {
                      const isSuccess = tlog.status === "success" || tlog.status === "done";
                      const isFailed = tlog.status === "failed" || tlog.status === "error";

                      return (
                        <div key={tlog.id} className="timeline-item position-relative mb-3">
                          {/* <div
                            className={`timeline-badge position-absolute rounded-circle text-white d-flex align-items-center justify-content-center ${
                              isFailed ? "bg-danger" : isSuccess ? "bg-success" : "bg-primary"
                            }`}
                            style={{
                              width: "24px",
                              height: "24px",
                              left: "-12px",
                              transform: "translateX(-50%)",
                              top: "8px",
                              zIndex: 2,
                              boxShadow: "0 0 0 3px #fff"
                            }}
                          >
                            <span className="fs-10 fw-bold">{tIdx + 1}</span>
                          </div> */}

                          <div className="card border p-3 shadow-sm bg-white rounded-3">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <div className="d-flex align-items-center gap-2">
                                {renderStepBadge(tlog.process_step)}
                                <span
                                  className={`badge ${
                                    isFailed
                                      ? "bg-danger-subtle text-danger"
                                      : isSuccess
                                      ? "bg-success-subtle text-success"
                                      : "bg-info-subtle text-info"
                                  } fs-11`}
                                >
                                  {tlog.status}
                                </span>
                              </div>
                              <span className="text-muted fs-11">
                                <i className="ti ti-clock me-1"></i>
                                {tlog.started_at
                                  ? new Date(tlog.started_at).toLocaleString("id-ID")
                                  : "-"}
                              </span>
                            </div>

                            <p className="fw-semibold text-dark fs-12 mb-1">
                              {tlog.message}
                            </p>

                            {tlog.process_duration !== null && (
                              <span className="text-muted fs-11 d-block mt-1">
                                Durasi eksekusi: <strong>{tlog.process_duration} detik</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="modal-footer bg-light border-top">
                <Link
                  to={`/peserta/${selectedParticipantForTimeline.uid || selectedParticipantForTimeline.id}?from=${encodeURIComponent(location.pathname + location.search)}`}
                  className="btn btn-primary btn-sm fs-12"
                >
                  <i className="ti ti-user-check me-1"></i> Buka Halaman Detail Peserta
                </Link>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm fs-12"
                  onClick={() => setSelectedParticipantForTimeline(null)}
                >
                  Tutup Timeline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessMonitoringPage;
