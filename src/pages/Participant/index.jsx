import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import "../Project/project.css";
import "./participant.css";
import axiosClient from "../../api/axiosClient";

const ParticipantPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Read initial states from URL search parameters
  const pageParam    = parseInt(searchParams.get("page") || "1", 10);
  const perPageParam = parseInt(searchParams.get("per_page") || "15", 10);
  const searchParam  = searchParams.get("search") || "";
  const statusParam  = searchParams.get("ai_result_status") || "";

  const [participants, setParticipants] = useState([]);
  const [summary, setSummary] = useState({
    total_participants: 0,
    total_pass: 0,
    total_waiting_review: 0,
    total_fail: 0,
    total_in_progress: 0,
    avg_pass_percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Local search box input (controlled, only applied on submit)
  const [searchInput, setSearchInput] = useState(searchParam);

  // Pagination States
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    document.title = "Data Peserta - AI Document Validation";
  }, []);

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    fetchParticipants();
  }, [searchParams]);

  const fetchParticipants = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pageParam,
        per_page: perPageParam,
        search: searchParam,
        ai_result_status: statusParam || undefined,
      };

      const res = await axiosClient.get("/participants", { params });
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
      console.error("Gagal mengambil data peserta dari API:", err);
    } finally {
      setIsLoading(false);
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
    updateUrlParams({ search: val, page: 1 });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams({ search: searchInput, page: 1 });
  };

  const handleStatusFilterChange = (e) => {
    updateUrlParams({ ai_result_status: e.target.value, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchParams({}, { replace: true });
  };

  const handlePageChange = (newPage) => {
    updateUrlParams({ page: newPage });
  };

  // Helper to render AI validation status badge
  const renderAiStatusBadge = (item) => {
    const aiStatus = item.ai_result_status;
    if (item.review_status === "pass" || aiStatus === "pass") {
      return (
        <span className="badge-pass-pill">
          <i className="ti ti-circle-check fs-12"></i> PASS
        </span>
      );
    }
    if (item.review_status === "need_repair") {
      return (
        <span className="badge bg-warning text-white px-2 py-1 fs-11 fw-bold rounded-pill">
          <i className="ti ti-adjustments-horizontal fs-12"></i> PERLU PERBAIKAN
        </span>
      );
    }
    if (aiStatus === "waiting_review") {
      return (
        <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 fs-11 fw-bold">
          <i className="ti ti-clock-pause fs-12"></i> WAITING REVIEW
        </span>
      );
    }
    if (aiStatus === "fail" || item.review_status === "fail") {
      return (
        <span className="badge-fail-pill">
          <i className="ti ti-circle-x fs-12"></i> FAIL
        </span>
      );
    }
    return <span className="text-muted fs-12 fw-medium">-</span>;
  };

  // Helper to render Pipeline Process Status Badge
  const renderProcessStatusBadge = (item) => {
    const isFailedPipeline = item.is_complete_process && item.failure_reason && item.status !== "done";
    if (isFailedPipeline) {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 fs-11">
          <i className="ti ti-alert-triangle me-1"></i> Gagal ({item.status})
        </span>
      );
    }
    switch (item.status) {
      case "done":
        return (
          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-11">
            <i className="ti ti-circle-check me-1"></i> Selesai
          </span>
        );
      case "validation_ai":
        return (
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 fs-11">
            <i className="ti ti-brain me-1"></i> Validasi AI
          </span>
        );
      case "screening_ocr":
        return (
          <span className="badge px-2 py-1 fs-11" style={{ backgroundColor: "#f3e8ff", color: "#7e22ce", border: "1px solid #e9d5ff" }}>
            <i className="ti ti-scan me-1"></i> Screening OCR
          </span>
        );
      case "rendering_md":
        return (
          <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 fs-11">
            <i className="ti ti-file-code me-1"></i> Render MD
          </span>
        );
      case "queued":
      default:
        return (
          <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 fs-11">
            <i className="ti ti-clock me-1"></i> Antrean
          </span>
        );
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* 1. Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-2">
        <div>
          <h4 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            Data Peserta
          </h4>
          <span className="text-muted fs-12">Dashboard / Data Peserta</span>
        </div>
      </div>

      {/* 2. Top Stat Cards */}
      <div className="row g-2 mb-2">
        {/* Total Peserta */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-primary-subtle text-primary p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-users fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">Total Peserta</span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_participants?.toLocaleString("id-ID")}
                </h5>
                <span className="text-muted fs-10 text-truncate d-block">Seluruh peserta</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total PASS */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-success-subtle text-success p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-circle-check fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">Lulus (PASS)</span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_pass?.toLocaleString("id-ID")}
                </h5>
                <span className="text-success fs-10 fw-semibold text-truncate d-block">
                  <i className="ti ti-arrow-up-right me-1"></i>
                  {summary.total_participants > 0
                    ? ((summary.total_pass / summary.total_participants) * 100).toFixed(1)
                    : 0}% total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Menunggu Review */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3 flex-shrink-0" style={{ backgroundColor: "rgba(99,102,241,0.1)", color: "#6366f1" }}>
                <i className="ti ti-clock-pause fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">Menunggu Review</span>
                <h5 className="fw-extrabold mb-0 fs-16" style={{ color: "#6366f1" }}>
                  {(summary.total_waiting_review || 0).toLocaleString("id-ID")}
                </h5>
                <span className="fs-10 fw-semibold text-truncate d-block" style={{ color: "#6366f1" }}>
                  Perlu peninjauan manual
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total FAIL */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-danger-subtle text-danger p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-circle-x fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">Gagal (FAIL)</span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_fail?.toLocaleString("id-ID")}
                </h5>
                <span className="text-danger fs-10 fw-semibold text-truncate d-block">
                  <i className="ti ti-arrow-down-right me-1"></i>Perlu perbaikan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dalam Proses */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-warning-subtle text-warning p-2 rounded-3 flex-shrink-0">
                <i className="ti ti-loader-2 fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">Dalam Proses</span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.total_in_progress?.toLocaleString("id-ID")}
                </h5>
                <span className="text-muted fs-10 text-truncate d-block">Dalam antrean validasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rata-rata Skor */}
        <div className="col-12 col-sm-6 col-md-4 col-xl-2">
          <div className="card project-card border-0 py-3 px-3 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3 flex-shrink-0" style={{ backgroundColor: "#f3e8ff", color: "#7e22ce" }}>
                <i className="ti ti-chart-dots fs-16"></i>
              </div>
              <div className="overflow-hidden">
                <span className="text-muted fs-10 fw-bold text-uppercase d-block text-truncate">Rata-rata Skor</span>
                <h5 className="fw-extrabold text-dark mb-0 fs-16">
                  {summary.avg_pass_percentage || 0}%
                </h5>
                <span className="text-muted fs-10 text-truncate d-block">Rata-rata skor AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="card project-card border-0 p-2 px-3 shadow-sm mb-3 bg-white">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-sm-4 col-md-3">
            <select
              className="form-select form-select-sm bg-light"
              value={statusParam}
              onChange={handleStatusFilterChange}
            >
              <option value="">Semua Status Validasi</option>
              <option value="pass">Lulus (PASS)</option>
              <option value="waiting_review">Menunggu Review</option>
              <option value="fail">Gagal (FAIL)</option>
              <option value="in_progress">Dalam Proses</option>
            </select>
          </div>

          <div className="col-12 col-sm-6 col-md-7">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="ti ti-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Cari nama, ID Izin, NIK, jabatan, LSP..."
                value={searchInput}
                onChange={handleSearchInputChange}
              />
            </div>
          </div>

          <div className="col-12 col-sm-2 col-md-2 ms-auto">
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

      {/* 4. Data Table */}
      <div className="card project-card border-0 shadow-sm overflow-hidden mb-3 bg-white">
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          <h6 className="fw-bold text-dark mb-0 fs-13">Daftar Data Peserta</h6>
          <span className="text-muted fs-12">
            {totalItems.toLocaleString("id-ID")} peserta ditemukan
          </span>
        </div>

        <div className="table-responsive" style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
          <table className="table table-hover align-middle mb-0 fs-11" style={{ width: "100%" }}>
            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr className="text-muted fs-11 fw-bold text-uppercase align-middle">
                <th style={{ width: "35px", whiteSpace: "nowrap", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }} className="text-center">No</th>
                <th style={{ width: "14%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>ID Izin / NIK</th>
                <th style={{ width: "16%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Nama Peserta</th>
                <th style={{ width: "17%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Jabatan Kerja &amp; Jenjang</th>
                <th style={{ width: "14%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }}>Project File</th>
                <th style={{ width: "14%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }} className="text-center">Proses</th>
                <th style={{ width: "10%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }} className="text-center">Status AI</th>
                <th style={{ width: "5%", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }} className="text-center">Skor</th>
                <th style={{ width: "75px", whiteSpace: "nowrap", position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 10, boxShadow: "inset 0 -1px 0 #e2e8f0" }} className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <i className="ti ti-loader-2 ti-spin fs-28 text-primary d-block mb-2"></i>
                    <span className="text-muted fs-13">Memuat data peserta...</span>
                  </td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <i className="ti ti-users-minus fs-36 text-muted mb-2 d-block"></i>
                    <span className="fw-semibold text-dark fs-14">Tidak ada data peserta ditemukan.</span>
                  </td>
                </tr>
              ) : (
                participants.map((item, idx) => {
                  const aiStatus  = item.ai_result_status;
                  const isPass    = aiStatus === "pass" || item.review_status === "pass";
                  const isFail    = aiStatus === "fail" || item.review_status === "fail";
                  const passScore = item.ai_result_pass_percentage;
                  const hasAiExecuted = Boolean(aiStatus && aiStatus !== "null");

                  return (
                    <tr key={item.id}>
                      <td className="text-center text-muted fs-12">
                        {(pageParam - 1) * perPageParam + idx + 1}
                      </td>

                      <td style={{ wordBreak: "break-word", overflowWrap: "anywhere", whiteSpace: "normal" }}>
                        <span className="fw-bold d-block text-dark fs-12">{item.id_izin || "-"}</span>
                        <span className="text-muted fs-11">{item.nik ? `NIK: ${item.nik}` : "NIK: -"}</span>
                      </td>

                      <td style={{ wordBreak: "break-word", overflowWrap: "anywhere", whiteSpace: "normal" }}>
                        <Link
                          to={`/peserta/${item.uid || item.id}?from=${encodeURIComponent(location.pathname + location.search)}`}
                          className="fw-semibold text-dark text-decoration-none fs-13"
                        >
                          {item.name}
                        </Link>
                        {item.prov_ktp && (
                          <span className="text-muted fs-11 d-block">
                            <i className="ti ti-map-pin me-1"></i>{item.prov_ktp}
                          </span>
                        )}
                      </td>

                      <td style={{ wordBreak: "break-word", overflowWrap: "anywhere", whiteSpace: "normal" }}>
                        <span className="d-block text-dark fw-medium fs-12">{item.jabatan_kerja || "-"}</span>
                        <span className="text-muted mt-1 fs-10" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                          {item.jenjang ? `Jenjang ${item.jenjang}` : "Jenjang -"}
                        </span>
                      </td>

                      <td style={{ wordBreak: "break-word", overflowWrap: "anywhere", whiteSpace: "normal" }}>
                        <span className="text-secondary fs-12 d-block" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                          <i className="ti ti-file-spreadsheet text-success me-1"></i>
                          {item.project?.file_name || "-"}
                        </span>
                      </td>

                      <td className="text-center">
                        {renderProcessStatusBadge(item)}
                      </td>

                      <td className="text-center">
                        {!hasAiExecuted
                          ? <span className="text-muted fs-12">-</span>
                          : renderAiStatusBadge(item)
                        }
                      </td>

                      <td className="text-center">
                        {hasAiExecuted && passScore !== null && passScore !== undefined ? (
                          <>
                            <div className="fw-bold fs-12 mb-1">{passScore}%</div>
                            <div className="score-progress-container">
                              <div
                                className={`score-progress-bar ${
                                  isPass ? "bar-green" : isFail ? "bar-red" : "bar-amber"
                                }`}
                                style={{ width: `${Math.min(100, Math.max(0, passScore))}%` }}
                              ></div>
                            </div>
                          </>
                        ) : (
                          <span className="text-muted fs-12">-</span>
                        )}
                      </td>

                      <td className="text-center" style={{ width: "75px", whiteSpace: "nowrap" }}>
                        <Link
                          to={`/peserta/${item.uid || item.id}?from=${encodeURIComponent(location.pathname + location.search)}`}
                          className="btn btn-xs btn-outline-primary py-0.5 px-2 fs-10 d-inline-flex align-items-center justify-content-center gap-1"
                          title="Lihat Detail Peserta"
                        >
                          <i className="ti ti-eye"></i> Detail
                        </Link>
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
              Menampilkan {(pageParam - 1) * perPageParam + 1} –{" "}
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
    </div>
  );
};

export default ParticipantPage;
